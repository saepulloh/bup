'use strict';

var ws_module = require('ws');
var node_crypto = require('crypto');

var bup = require('../js/bup.js');

const DEFAULT_CONFIG = {
	port: 3001,
};

function verify_client(info) {
	if (info.req.headers['sec-websocket-protocol'] !== 'bup-refmode') {
		return false;
	}
	return true;
}

function send(ws, msg) {
	ws.send(JSON.stringify(msg));
}

function send_error(ws, emsg) {
	console.log('Error: ', emsg);
	send(ws, {
		type: 'error',
		message: emsg,
	});
}

function send_referee_list(wss, clients) {
	var referees = [];
	wss.clients.forEach(function(c) {
		var cd = c.conn_data;
		if (!cd.is_referee) {
			return;
		}

		referees.push({
			fp: cd.fp,
		});
	});

	clients.forEach(function(ws) {
		send(ws, {
			type: 'referee-list',
			referees: referees,
		});
	});
}

function on_referees_change(wss) {
	var interested = wss.clients.filter(function(c) {
		return c.subscribed_list_referees;
	});
	send_referee_list(wss, interested);
}

function connect(referee, client) {
	var rd = referee.conn_data;
	var cd = client.conn_data;

	if (cd.connected_to.includes(rd.id)) {
		return; // Already connected
	}
	cd.connected_to.push(rd.id);
	rd.connected_to.push(cd.id);
	send(client, {
		type: 'connected',
		id: rd.id,
		fp: rd.fp,
	});
	send(referee, {
		type: 'connected',
		id: cd.id,
		all: rd.connected_to,
	});

}

function hub(config) {
	if (!config) {
		config = DEFAULT_CONFIG;
	}

	var wss = new ws_module.Server({port: config.port, verifyClient: verify_client});
	var conn_counter = 0;

	wss.on('connection', function(ws) {
		var cd = {
			connected_to: [],
			id: conn_counter++,
		};
		ws.conn_data = cd;

		node_crypto.randomBytes(64, function(err, buffer) {
			cd.challenge = buffer.toString('hex');
			send(ws, {
				'type': 'welcome',
				'challenge': cd.challenge,
			});
		});

		ws.on('message', function(msg_json) {
			try {
				var msg = JSON.parse(msg_json);
			} catch(e) {
				send_error(ws, 'Invalid JSON: ' + e.message);
				return;
			}

			switch(msg.type) {
			case 'register-referee':
				if (!cd.challenge) {
					send_error(ws, 'No challenge posted yet');
					return;
				}
				if (typeof msg.pub_json !== 'string') {
					send_error(ws, 'Invalid key of type ' + typeof msg.pub_json);
					return;
				}
				if (typeof msg.sig !== 'string') {
					send_error(ws, 'Signature missing');
					return;
				}

				var challenge_data = bup.utils.encode_utf8(cd.challenge);
				bup.key_utils.verify(msg.pub_json, challenge_data, msg.sig, function(err, is_valid) {
					if (err) {
						send_error(ws, 'Failed to validate signature');
						return;
					}

					if (! is_valid) {
						send_error(ws, 'Invalid signature');
						return;
					}

					bup.key_utils.fingerprint(msg.pub_json, function(err, fp) {
						if (err) {
							send_error(ws, 'Could not generate fingerprint');
							return;
						}

						cd.is_referee = true;
						cd.pub_json = msg.pub_json;
						cd.fp = fp;
						on_referees_change(wss);
						send(ws, {
							type: 'referee-registered',
							fp: fp,
						});
						for (let c of wss.clients) {
							let cd = c.conn_data;
							if (!cd.referee_requests) {
								continue;
							}
							if (!cd.referee_requests.includes(fp)) {
								continue;
							}
							connect(ws, c);
						}
					});
				});
				break;
			case 'list-referees':
				send_referee_list(wss, [ws]);
				break;
			case 'subscribe-list-referees':
				cd.subscribed_list_referees = true;
				send_referee_list(wss, [ws]);
				break;
			case 'connect-to-referees':
				if (!Array.isArray(msg.fps)) {
					send_error(ws, 'Missing fps (referee fingerprints) argument');
					return;
				}
				cd.referee_requests = msg.fps;
				for (let r of wss.clients) {
					var rd = r.conn_data;
					if (! rd.is_referee) {
						continue;
					}

					if (cd.referee_requests.includes(rd.fp)) {
						connect(r, ws);
					}
				}

				break;
			case 'error':
				console.log('Received error: ', msg.message);
				break;
			default:
				send_error(ws, 'Unsupported message type: ' + msg.type);
			}
		});
	});
	return wss;
}

if (require.main === module) {
	hub();
}

module.exports = hub;