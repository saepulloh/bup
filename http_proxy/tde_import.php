<?php
require 'utils.php';
setup_error_handler();
require 'http_utils.php';
require 'tde_utils.php';

if (!isset($_GET['url'])) {
	throw new \Exception('Missing URL');
}
$match_url = $_GET['url'];
main($match_url);


function parse_teammatch($httpc, $tm_html, $domain, $match_id) {
	$LEAGUE_KEYS = [
		'Bundesligen 2016/17:1. Bundesliga 1. Bundesliga' => '1BL-2016',
		'Bundesligen 2016/17:1. Bundesliga 1. Bundesliga - Final Four' => '1BL-2016',
		'Bundesligen 2016/17:1. Bundesliga 1. Bundesliga - PlayOff - Viertelfinale 1' => '1BL-2016',
		'Bundesligen 2016/17:1. Bundesliga 1. Bundesliga - PlayOff - Viertelfinale 2' => '1BL-2016',
		'TEST - Ligen - Hagemeister Mai 2017:Test LIGA - Testliga' => '1BL-2016',
		'BundesLiga 2016-2017:Bundesliga - 1. Bundesliga' => 'OBL-2017',
		'Ligen NRW 2017-18:O19-NRW O19-RL - (001) Regionalliga West' => 'RLW-2016',
		'Ligen DBV 2017/18 (ohne Bundesligen):Gruppe Nord (NO) - (001) Regionalliga Nord' => 'RLN-2016',
		'Bundesligen 2017/18:1. Bundesliga (1. BL) - (001) 1. Bundesliga' => '1BL-2017',
		'Bundesligen 2017/18:2. Bundesliga (2. BL-Nord) - (002) 2. Bundesliga Nord' => '2BLN-2017',
		'Bundesligen 2017/18:2. Bundesliga (2. BL-Süd) - (003) 2. Bundesliga Süd' => '2BLS-2017',
		'BundesLiga 2017-2018:Bundesliga - 1. Bundesliga' => 'OBL-2017',
	];

	if (!\preg_match('/
			<div\s*class="title">\s*<h3>([^<]*)<\/h3>
			/xs', $tm_html, $header_m)) {
		throw new \Exception('Cannot find team names!');
	}
	if (\preg_match('/<th>Staffel:<\/th><td><a\s+href="[^"]*&draw=([0-9]+)">([^<]+)<\/a><\/td>/sx', $tm_html, $division_m)) {
		$draw_id = $division_m[1];
		$long_league_id = $header_m[1] . ':' . $division_m[2];
		if (!\array_key_exists($long_league_id, $LEAGUE_KEYS)) {
			throw new \Exception('Cannot find league ' . $long_league_id);
		}
		$league_key = $LEAGUE_KEYS[$long_league_id];

		if (!\preg_match('/<h3>
				<a\s*href="\/sport\/team\.aspx\?id=(?P<season0>[-A-Za-z0-9]+)&team=(?P<id0>[0-9]+)">\s*
				(?P<team0>[^<]+?)(?:\s*\([0-9-]+\))?<\/a>
				\s*-\s*
				<a\s*href="\/sport\/team\.aspx\?id=(?P<season1>[-A-Za-z0-9]+)&team=(?P<id1>[0-9]+)">\s*
				(?P<team1>[^<]+?)(?:\s*\([0-9-]+\))?<\/a>
				/xs', $tm_html, $teamnames_m)) {

			throw new \Exception('Cannot find team names!');
		}

		$res = [
			'league_key' => $league_key,
		];
		$res['team_names'] = [
			unify_team_name(decode_html($teamnames_m['team0'])),
			unify_team_name(decode_html($teamnames_m['team1']))
		];
		$team_infos = [[
			'season' => $teamnames_m['season0'],
			'id' => $teamnames_m['id0'],
			'name' => $res['team_names'][0],
		], [
			'season' => $teamnames_m['season1'],
			'id' => $teamnames_m['id1'],
			'name' => $res['team_names'][1],
		]];
	} else if (\preg_match('/<th>Disziplin:<\/th><td><a href="draw\.aspx\?id=(?P<season_id>[-a-fA-F0-9]+)&draw=(?P<draw_id>[0-9]+)">(?P<team0>.*?)\s*-\s*(?P<team1>.*?)<\/a><\/td>/', $tm_html, $international_m)) {

		if (! \preg_match('/
			<h3>
			<a\s+href="\/sport\/team\.aspx\?id=[-a-fA-F0-9]+&team=(?P<id0>[0-9]+)">[^<]+<\/a>\s*
			<img[^<>]+>\s*
			<span\s+class="printonly\sflag">\[[A-Z]+\]\s*<\/span>\s*
			-\s*
			<img[^<>]+>\s*
			<span\s+class="printonly\sflag">\[[A-Z]+\]\s*<\/span>\s*
			<a\s+href="\/sport\/team\.aspx\?id=[-a-fA-F0-9]+&team=(?P<id1>[0-9]+)">[^<]+<\/a>\s*
			/x', $tm_html, $team_names_m)) {
			throw new \Exception('Cannot find international team IDs');
		}

		$draw_id = $international_m['draw_id'];
		$long_league_id = 'international:' . $international_m['team0'] . ' - ' . $international_m['team1'];
		$league_key = 'international-2017';
		$res = [
			'league_key' => $league_key,
		];
		$res['team_names'] = [
			unify_team_name(decode_html($international_m['team0'])),
			unify_team_name(decode_html($international_m['team1']))
		];
		$season_id = $international_m['season_id'];
		$team_infos = [[
			'season' => $season_id,
			'id' => $team_names_m['id0'],
			'name' => $res['team_names'][0],
		], [
			'season' => $season_id,
			'id' => $team_names_m['id1'],
			'name' => $res['team_names'][1],
		]];
	} else {
		throw new \Exception('Cannot find division!');
	}

	$is_buli = \preg_match('/^[12]BL[NS]?-/', $league_key);
	if ($is_buli) {
		$res['all_players'] = buli_download_all_players(
			$httpc, $league_key, $domain, $teamnames_m['season0'], $draw_id, $match_id, $team_infos);
	} else {
		$res['all_players'] = \array_map(function($ti) use ($httpc, $domain, $league_key) {
			$ap = download_all_players($httpc, $ti, $domain, $league_key);
			return $ap ? $ap : [];
		}, $team_infos);
	}

	$res['team_competition'] = true;

	if (\preg_match('/<th>Spieltermin:<\/th><td>[A-Za-z]+\s*([0-9]{1,2}\.[0-9]{1,2}.[0-9]{4,})\s*<span class="time">([0-9]{2}:[0-9]{2})<\/span><\/td>/', $tm_html, $time_m)) {
		$res['date'] = $time_m[1];
		$res['starttime'] = $time_m[2];
	} else {
		throw new \Exception('Cannot find starttime');
	}

	if (\preg_match('/<th>Spielort:<\/th><td><a[^<]*>([^<]+)<\/a><\/td>/', $tm_html, $location_m)) {
		$res['location'] = $location_m[1];
	}

	if (\preg_match('/<th>[^><]*Schiedsrichter[^><]*<\/th><td>([^<]+)<\/td>/', $tm_html, $umpire_m)) {
		$res['umpires'] = $umpire_m[1];
	}

	// Matches
	if (!\preg_match('/<table\s+class="ruler matches">(?P<html>.+?)<\/tbody>\s*<\/table>/s', $tm_html, $table_m)) {
		throw new \Exception('Cannot find table in teammatch HTML');
	}
	$matches_table_html = $table_m['html'];
	\preg_match_all('/
		<tr>\s*
		(?:<td>\s*[0-9]*\s*<\/td>)? # match order
		<td>(?P<match_name>[A-Z\.0-9\s]+)<\/td>
		\s*<td[^>]*>(?:<table[^>]*>(?P<players_html0>.*?)<\/table>)?
		<\/td><td[^>]*>-<\/td>
		<td[^>]*>(?:<table[^>]*>(?P<players_html1>.*?)<\/table>)?<\/td>
		<td>(?P<score_html>.*?)<\/td>
		/xs', $matches_table_html, $matches_m, \PREG_SET_ORDER);
	$matches = [];
	foreach ($matches_m as $mm) {
		$match_name = $mm['match_name'];
		$is_doubles = preg_match('/DD|GD|HD|WD|MX|MD|BD|JD/', $match_name) !== 0;
		$expect_players = $is_doubles ? 2 : 1;

		$teams = [
			parse_match_players(isset($mm['players_html0']) ? $mm['players_html0'] : ''),
			parse_match_players(isset($mm['players_html1']) ? $mm['players_html1'] : ''),
		];
		$incomplete = (
			(\count($teams[0]['players']) !== $expect_players) ||
			(\count($teams[1]['players']) !== $expect_players)
		);
		$match_id = (
			'tde:' .
			$res['team_names'][0] . '-' . $res['team_names'][1] .
			'_' . $res['date'] .
			'_' . $match_name
		);
		$setup = [
			'match_name' => $match_name,
			'match_id' => $match_id,
			'is_doubles' => $is_doubles,
			'teams' => $teams,
			'incomplete' => $incomplete,
		];

		if (\preg_match('/^(?P<discipline>[A-Z]+)(?P<num>[1-5])$/', $match_name, $eid_m)) {
			$setup['eventsheet_id']	= $eid_m['num'] . '.' . $eid_m['discipline'];
		}

		$match = [
			'setup' => $setup,
		];
		if (isset($mm['score_html'])) {
			$match['network_score'] = _parse_score($mm['score_html']);
		}

		$matches[] = $match;
	}
	$res['matches'] = $matches;

	return $res;
}


function buli_download_all_players($httpc, $league_key, $domain, $season_id, $draw_id, $match_id, $team_infos) {
	// Determine whether Hinrunde / Rückrunde
	$allmatches_url = 'https://' . $domain . '/sport/drawmatches.aspx?id=' . $season_id . '&draw=' . $draw_id;
	$allmatches_page = $httpc->request($allmatches_url);
	if (!$allmatches_page) {
		throw new \Exception('Cannot download allmatch list');
	}

	if (!preg_match('/
		<td\s+class="plannedtime"[^>]*>.*?<\/td>\s*
		<td\s+align="right">[^<]*<\/td>\s*
		<td\s+align="right">\s*(?P<round>[^<]*?)\s*<\/td>\s*
		<td[^>]*>[^<]*<\/td>\s*
		<td\s+class="nowrap"\s+align="right">\s*
		(?:<strong>)?\s*
		<a\s+class="teamname"\s*href="teammatch\.aspx\?id=[A-Z0-9-]*&match=' . \preg_quote($match_id). '">
	/x', $allmatches_page, $allmatches_m)) {
		throw new \Exception('Cannot find match ' . $match_id . ' in list of all matches at ' . $allmatches_url);
	}

	$round_str = $allmatches_m['round'];
	if ($round_str === 'H') {
		$is_hr = true;
	} else if ($round_str === 'R') {
		$is_hr = false;
	} else {
		throw new \Exception('Cannot parse round ' . \json_encode($round_str));
	}

	// Parse VRLs
	$all_players = \array_map(function($ti) use($httpc, $domain, $season_id, $league_key, $is_hr) {
		return download_team_vrl($httpc, $domain, $season_id, $league_key, $ti['id'], $is_hr);
	}, $team_infos);

	return $all_players;
}

function download_all_players($httpc, $ti, $domain, $league_key) {
	$pagename = (
		($domain === 'obv.tournamentsoftware.com') ? 'teamplayers' :
		(($league_key === 'international-2017') ? 'teamplayers' :
		'teamrankingplayers'
	));
	$players_url = (
		'https://' . $domain . '/sport/' . $pagename . '.aspx?' .
		'id=' . $ti['season'] . '&tid=' . $ti['id']
	);
	$players_html = $httpc->request($players_url);

	if (!\preg_match(
			'/<table\s+class="ruler">\s*<caption>\s*(?:Herren|Männer)(?P<tbody>.*?)<\/table>/s',
			$players_html, $players_m_m)) {
		return null;
	}
	$male_players = _parse_players($players_m_m['tbody'], 'm');
	if (\count($male_players) === 0) {
		return null;
	}

	if (!\preg_match(
			'/<table\s+class="ruler">\s*<caption>\s*(?:Damen|Frauen)(?P<tbody>.*?)<\/table>/s',
			$players_html, $players_f_m)) {
		return null;
	}
	$female_players = _parse_players($players_f_m['tbody'], 'f');
	if (\count($female_players) === 0) {
		return null;
	}

	$all_players = \array_merge([], $male_players, $female_players);

	return $all_players;
}


function main($match_url) {
	if (! \preg_match('/^https?:\/\/(?P<domain>www\.turnier\.de|[a-z]+\.tournamentsoftware\.com)\/sport\/teammatch\.aspx\?id=([a-fA-F0-9-]+)&match=(?P<match_id>[0-9]+)$/', $match_url, $matches)) {
		throw new \Exception('Unsupported URL');
	}
	$httpc = AbstractHTTPClient::make();

	$domain = $matches['domain'];
	$match_id = $matches['match_id'];
	$tm_html = $httpc->request($match_url);
	$tm = parse_teammatch($httpc, $tm_html, $domain, $match_id);
	$tm['report_urls'] = [$match_url];

	$data = $tm;
	if (isset($_GET['format'])) {
		switch($_GET['format']) {
		case 'export':
			$data = [
				'type' => 'bup-export',
				'version' => 2,
				'event' => $tm,
			];
			break;
		}
	}

	header('Content-Type: application/json');
	header('Cache-Control: no-cache, no-store, must-revalidate');
	header('Pragma: no-cache');
	header('Expires: 0');

	echo \json_encode($data, \JSON_PRETTY_PRINT);
}

