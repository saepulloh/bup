'use strict';

var assert = require('assert');

var tutils = require('./tutils');
var _describe = tutils._describe;
var _it = tutils._it;
var DOUBLES_SETUP = tutils.DOUBLES_SETUP;
var DOUBLES_TEAM_SETUP = tutils.DOUBLES_TEAM_SETUP;
var SINGLES_SETUP = tutils.SINGLES_SETUP;
var SINGLES_TEAM_SETUP = tutils.SINGLES_TEAM_SETUP;
var state_after = tutils.state_after;
var press_score = tutils.press_score;

var bup = require('../bup.js');

_describe('pronounciation', function() {
	_it('Start of match (singles)', function() {
		var presses = [];
		var s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_server', // Andrew serves
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_receiver', // Birgit receives
			team_id: 1,
			player_id: 1
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Bob und Birgit,\n' +
			'und zu meiner Linken, Andrew und Alice.\n' +
			'Andrew schlägt auf zu Birgit.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Andrew&Alice pick right
			team1_left: false,
		}, {
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 1,
		}, {
			type: 'pick_receiver', // Birgit receives
			team_id: 1,
			player_id: 1
		}];
		s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Andrew und Alice,\n' +
			'und zu meiner Linken, Bob und Birgit.\n' +
			'Alice schlägt auf zu Birgit.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}, {
			type: 'pick_receiver', // Alice receives
			team_id: 0,
			player_id: 1
		}];
		s = state_after(presses, DOUBLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Bob und Birgit,\n' +
			'und zu meiner Linken, Andrew und Alice.\n' +
			'Bob schlägt auf zu Alice.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);
	});

	_it('Start of match (singles)', function() {
		var presses = [];
		var s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_side', // Alice picks left
			team1_left: true,
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Bob,\n' +
			'und zu meiner Linken, Alice.\n' +
			'Alice schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks right
			team1_left: false,
		}, {
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Alice,\n' +
			'und zu meiner Linken, Bob.\n' +
			'Alice schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks left
			team1_left: true,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Bob,\n' +
			'und zu meiner Linken, Alice.\n' +
			'Bob schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks right
			team1_left: false,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, Alice,\n' +
			'und zu meiner Linken, Bob.\n' +
			'Bob schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);
	});

	_it('Start of match in a team competition (doubles)', function() {
		var presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 1,
		}, {
			type: 'pick_receiver', // Birgit receives
			team_id: 1,
			player_id: 1
		}];
		var s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, B team, vertreten durch Bob und Birgit,\n' +
			'und zu meiner Linken, A team, vertreten durch Andrew und Alice.\n' +
			'A team schlägt auf, Alice zu Birgit.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Andrew&Alice pick right
			team1_left: false,
		}, {
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 1,
		}, {
			type: 'pick_receiver', // Birgit receives
			team_id: 1,
			player_id: 1
		}];
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Linken, B team, vertreten durch Bob und Birgit,\n' +
			'und zu meiner Rechten, A team, vertreten durch Andrew und Alice.\n' +
			'A team schlägt auf, Alice zu Birgit.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Andrew&Alice pick right
			team1_left: false,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}, {
			type: 'pick_receiver', // Andrew receives
			team_id: 0,
			player_id: 0
		}];
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Linken, B team, vertreten durch Bob und Birgit,\n' +
			'und zu meiner Rechten, A team, vertreten durch Andrew und Alice.\n' +
			'B team schlägt auf, Bob zu Andrew.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Birgit serves
			team_id: 1,
			player_id: 1,
		}, {
			type: 'pick_receiver', // Andrew receives
			team_id: 0,
			player_id: 0
		}];
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, B team, vertreten durch Bob und Birgit,\n' +
			'und zu meiner Linken, A team, vertreten durch Andrew und Alice.\n' +
			'B team schlägt auf, Birgit zu Andrew.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);
	});

	_it('Match start in a team competition (singles)', function() {
		var presses = [];
		var s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_side', // Alice picks left
			team1_left: true,
		});
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, B team, vertreten durch Bob,\n' +
			'und zu meiner Linken, A team, vertreten durch Alice.\n' +
			'A team schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks right
			team1_left: false,
		}, {
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Linken, B team, vertreten durch Bob,\n' +
			'und zu meiner Rechten, A team, vertreten durch Alice.\n' +
			'A team schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks left
			team1_left: true,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Rechten, B team, vertreten durch Bob,\n' +
			'und zu meiner Linken, A team, vertreten durch Alice.\n' +
			'B team schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);

		presses = [{
			type: 'pick_side', // Alice picks right
			team1_left: false,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}];
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.strictEqual(
			bup.pronounciation(s),
			'Meine Damen und Herren:\n' +
			'Zu meiner Linken, B team, vertreten durch Bob,\n' +
			'und zu meiner Rechten, A team, vertreten durch Alice.\n' +
			'B team schlägt auf.\n' +
			'0 beide.\n' +
			'Bitte spielen'
		);
	});

	_it('Basic counting (doubles)', function() {
		var presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Andrew serves
			team_id: 0,
			player_id: 0,
		}, {
			type: 'pick_receiver', // Birgit receives
			team_id: 1,
			player_id: 1
		}, {
			type: 'love-all'
		}, {
			type: 'score',
			side: 'left'
		}];
		var s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '1-0');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '2-0');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 1-2');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '2 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '3-2');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '4-2');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 3-4');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '4 beide');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), '5-4');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 5 beide');
	});

	_it('Basic counting', function() {
		var presses = [{
			type: 'pick_side', // Alice picks right
			team1_left: false,
		}, {
			type: 'pick_server', // Bob serves
			team_id: 1,
			player_id: 0,
		}, {
			type: 'love-all'
		}, {
			type: 'score',
			side: 'left'
		}];
		var s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '1-0');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '2-0');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 1-2');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '2 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '3-2');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '4-2');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 3-4');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '4 beide');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '5-4');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 5 beide');
	});

	_it('Interval / game point', function() {
		var presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Bob serves  (player 0 so it works in singles as well)
			team_id: 1,
			player_id: 0,
		}, {
			type: 'pick_receiver', // Andrew receives (player 0 so it works in singles as well)
			team_id: 0,
			player_id: 0,
		}, {
			type: 'love-all'
		}];
		press_score(presses, 9, 9);
		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'score',
			side: 'left'
		});
		var s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '11-9 Pause');

		press_score(presses, 8, 9);
		presses.push({
			type: 'score',
			side: 'right'
		});
		var alt_presses = presses.slice();
		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 20 Satzpunkt 19');

		alt_presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '20 Satzpunkt 19');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 20 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '21-20');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 21 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 22-21');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der erste Satz wurde gewonnen von Bob mit 23-21');

		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der erste Satz wurde gewonnen von Bob und Birgit mit 23-21');

		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der erste Satz wurde gewonnen von B team mit 23-21');

		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der erste Satz wurde gewonnen von B team mit 23-21');

		presses.push({
			type: 'postgame-confirm',
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_server',
			team_id: 1,
			player_id: 0,
		});
		presses.push({
			type: 'pick_receiver',
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), 
			'Zweiter Satz. 0 beide.\nBitte spielen');

		presses.push({
			type: 'love-all',
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		press_score(presses, 9, 9);
		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 11-10 Pause');

		press_score(presses, 9, 6);
		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '19 beide');

		var alt_presses = presses.slice();
		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 20 Spielpunkt 19');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '20 Satzpunkt 19');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 20 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 21-20');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 21 beide');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s), '22-21');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 22 beide');

		press_score(presses, 5, 5);
		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 28 beide');

		alt_presses = presses.slice();
		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '29 Spielpunkt 28');

		alt_presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 29 Satzpunkt beide');

		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 
			'Satz.\n' +
			'Das Spiel wurde gewonnen von Bob mit 23-21 30-29');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 29 Satzpunkt 28');

		presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 29 Spielpunkt beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der zweite Satz wurde gewonnen von A team mit 30-29; einen Satz beide');
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s), 
			'Satz.\n' +
			'Der zweite Satz wurde gewonnen von A team mit 30-29; einen Satz beide');
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Der zweite Satz wurde gewonnen von Alice mit 30-29; einen Satz beide');
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s), 
			'Satz.\n' +
			'Der zweite Satz wurde gewonnen von Andrew und Alice mit 30-29; einen Satz beide');

		presses.push({
			type: 'postgame-confirm',
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_server',
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		presses.push({
			type: 'pick_receiver',
			team_id: 1,
			player_id: 0,
		});
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Entscheidungssatz. 0 beide.\nBitte spielen');
		
		presses.push({
			type: 'love-all',
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.strictEqual(bup.pronounciation(s), null);

		press_score(presses, 9, 9);
		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Aufschlagwechsel. 11-10 Pause. Bitte die Spielfeldseiten wechseln');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Aufschlagwechsel. 11 beide');

		press_score(presses, 7, 7);
		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 19 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '20 Spielpunkt 19');

		alt_presses = presses.slice();
		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), 'Aufschlagwechsel. 20 beide');

		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s), '21-20');

		alt_presses.push({
			type: 'score',
			side: 'left'
		});
		s = state_after(alt_presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von B team mit 23-21 29-30 22-20');
		s = state_after(alt_presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von B team mit 23-21 29-30 22-20');
		s = state_after(alt_presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von Bob und Birgit mit 23-21 29-30 22-20');
		s = state_after(alt_presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von Bob mit 23-21 29-30 22-20');

		presses.push({
			type: 'score',
			side: 'right'
		});
		s = state_after(presses, SINGLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von Alice mit 21-23 30-29 21-19');
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von Andrew und Alice mit 21-23 30-29 21-19');
		s = state_after(presses, SINGLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von A team mit 21-23 30-29 21-19');
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Satz.\n' +
			'Das Spiel wurde gewonnen von A team mit 21-23 30-29 21-19');
	});

	_it('cards', function() {
		var presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Bob serves  (player 0 so it works in singles as well)
			team_id: 1,
			player_id: 0,
		}, {
			type: 'pick_receiver', // Andrew receives (player 0 so it works in singles as well)
			team_id: 0,
			player_id: 0,
		}, {
			type: 'love-all'
		}];

		presses.push({
			type: 'yellow-card',
			team_id: 0,
			player_id: 0,
		});
		var s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Andrew, Verwarnung wegen unsportlichen Verhaltens.\n' +
			'0 beide');

		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'red-card',
			team_id: 0,
			player_id: 1,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Alice, Fehler wegen unsportlichen Verhaltens.\n' +
			'Aufschlagwechsel. 1 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'yellow-card',
			team_id: 1,
			player_id: 1,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Birgit, Verwarnung wegen unsportlichen Verhaltens.\n' +
			'2-1');

		presses.push({
			type: 'red-card',
			team_id: 1,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Birgit, Verwarnung wegen unsportlichen Verhaltens.\n' +
			'Bob, Fehler wegen unsportlichen Verhaltens.\n' +
			'Aufschlagwechsel. 2 beide');

		presses.push({
			type: 'score',
			side: 'right'
		});
		presses.push({
			type: 'score',
			side: 'left'
		});
		presses.push({
			type: 'red-card',
			team_id: 0,
			player_id: 1,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Alice, Fehler wegen unsportlichen Verhaltens.\n' +
			'Aufschlagwechsel. 4-3');

		presses.push({
			type: 'red-card',
			team_id: 1,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Alice, Fehler wegen unsportlichen Verhaltens.\n' +
			'Bob, Fehler wegen unsportlichen Verhaltens.\n' +
			'Aufschlagwechsel. 4 beide');

		presses.push({
			type: 'disqualified',
			team_id: 1,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Bob, disqualifiziert wegen unsportlichen Verhaltens.\n' +
			'Das Spiel wurde gewonnen von Andrew und Alice mit 4-4');

		s = state_after(presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Bob, disqualifiziert wegen unsportlichen Verhaltens.\n' +
			'Das Spiel wurde gewonnen von A team mit 4-4');
	});

	_it('retiring', function() {
		var presses = [{
			type: 'pick_side', // Andrew&Alice pick left
			team1_left: true,
		}, {
			type: 'pick_server', // Birgit serves
			team_id: 1,
			player_id: 1,
		}, {
			type: 'pick_receiver', // Andrew receives
			team_id: 0,
			player_id: 0,
		}, {
			type: 'love-all'
		}];

		var alt_presses = presses.slice();
		alt_presses.push({
			type: 'retired',
			team_id: 1,
			player_id: 0
		});
		var s = state_after(alt_presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Bob gibt auf.\n' +
			'Das Spiel wurde gewonnen von Andrew und Alice mit 0-0');

		alt_presses = presses.slice();
		press_score(alt_presses, 3, 2);
		alt_presses.push({
			type: 'retired',
			team_id: 0,
			player_id: 1
		});
		s = state_after(alt_presses, DOUBLES_TEAM_SETUP);
		assert.equal(bup.pronounciation(s),
			'Alice gibt auf.\n' +
			'Das Spiel wurde gewonnen von B team mit 2-3');

		press_score(presses, 21, 19);
		presses.push({
			type: 'postgame-confirm',
		});
		presses.push({
			type: 'pick_server', // Alice serves
			team_id: 0,
			player_id: 1,
		});
		presses.push({
			type: 'pick_receiver', // Bob receives
			team_id: 1,
			player_id: 0,
		});
		presses.push({
			type: 'love-all'
		});
		press_score(presses, 2, 2);

		presses.push({
			type: 'retired',
			team_id: 0,
			player_id: 0,
		});
		s = state_after(presses, DOUBLES_SETUP);
		assert.equal(bup.pronounciation(s),
			'Andrew gibt auf.\n' +
			'Das Spiel wurde gewonnen von Bob und Birgit mit 19-21 2-2');
	});
});