<?php

function parse_match_players($players_html) {
	preg_match_all(
		'/<a(?:\s+class="plynk")?\s+href="player\.aspx[^"]*">(?P<name>.*?)<\/a>/',
		$players_html, $players_m, \PREG_SET_ORDER);
	$players = \array_map(function($pm) {
		return [
			'name' => decode_html($pm['name']),
		];
	}, $players_m);
	return [
		'players' => $players,
	];
}

function unify_team_name($team_name) {
	if (preg_match('/^(.*?)\s*\[[MN]\]$/', $team_name, $m)) {
		$team_name = $m[1];
	}
	return $team_name;
}

function _parse_score($score_html) {
	if (!\preg_match('/^\s*<span\s+class="score">(.*?)<\/span>\s*$/', $score_html, $m)) {
		return null;
	}

	\preg_match_all('/<span>([0-9]+)-([0-9]+)<\/span>/', $m[1], $score_ms, \PREG_SET_ORDER);
	return \array_map(function($score_m) {
		return [
			\intval($score_m[1]),
			\intval($score_m[2])
		];
	}, $score_ms);
}

function _parse_players($players_html, $gender) {
	if (\preg_match_all('/
		<tr>\s*
		(?:<td>(?:(?P<teamnum>[0-9]+)-(?P<ranking>[0-9]+)(?:-D(?P<ranking_d>[0-9]+))?)?<\/td>)?
		<td><\/td>\s*
		<td\s+id="playercell"><a\s+href="player\.aspx[^"]+">
			(?P<lastname>[^<]+),\s*(?P<firstname>[^<]+)
		<\/a><\/td>\s*
		(?:
			<td\s+class="flagcell">(?:
				<img[^>]+\/><span\s*class="printonly\s*flag">\[(?P<nationality>[A-Z]{2,})\]\s*<\/span>
			)?
			<\/td>\s*
			<td>(?P<textid>[0-9-]+)<\/td>\s*
			<td>(?P<birthyear>[0-9]{4})?<\/td>
		|
			<\/tr>
		)
		/xs', $players_html, $players_m, \PREG_SET_ORDER) === false) {
		throw new \Exception('Failed to match players');
	}

	if (count($players_m) === 0) {
		die('failed to find any players');
	}

	$res = \array_map(function($m) use ($gender) {
		$p = [
			'firstname' => $m['firstname'],
			'lastname' => $m['lastname'],
			'name' => $m['firstname'] . ' ' . $m['lastname'],
		];
		if (isset($m['textid']) && $m['textid']) {
			$p['textid'] = $m['textid'];
		}
		if (isset($m['gender']) && $m['gender']) {
			$p['gender'] = $m['gender'];
		} else {
			$p['gender'] = $gender;
		}
		if (isset($m['ranking']) && $m['ranking']) {
			$p['ranking'] = \intval($m['ranking']);
		}
		if (isset($m['ranking_d']) && $m['ranking_d']) {
			$p['ranking_d'] = \intval($m['ranking_d']);
		}
		if (isset($m['nationality']) && $m['nationality']) {
			$p['nationality'] = $m['nationality'];
		}
		return $p;
	}, $players_m);

	return $res;
}

function determine_club_id($httpc, $domain, $season_id, $team_id) {
	$team_url = 'https://' . $domain . '/sport/team.aspx?id=' . $season_id . '&team=' . $team_id;
	$team_page = $httpc->request($team_url);
	if ($team_page === false) {
		throw new \Exception('Cannot download team page ' . $team_url);
	}

	if (!preg_match('/
			<th>Verein:<\/th>\s*
			<td><a\s+href="club\.aspx\?id=[^&]+&club=(?P<club_id>[0-9]+)">
			/x', $team_page, $club_m)) {

		throw new \Exception('Cannot find club id in ' . $team_url);
	}
	return $club_m['club_id'];
}

function parse_vrl_players($httpc, $domain, $season_id, $club_id, $vrl_id) {
	$vrl_url = 'https://' . $domain . '/sport/clubranking.aspx?id=' . $season_id . '&cid=' . $club_id . '&rid=' . $vrl_id;
	$vrl_page = $httpc->request($vrl_url);
	if (!$vrl_page) {
		throw new \Exception('Failed to download VRL page ' . $vrl_url);
	}

	if (!\preg_match_all('/
		<tr>\s*
		<td\s+align="right">(?P<lfd_num>[0-9]+)<\/td> # LfdNum
		<td><\/td>       # empty
		<td\s+id="playercell"><a\s+href="player\.aspx\?id=[-A-Za-z0-9]+&player=[0-9]+">
			(?P<lastname>[^,<]+),\s*(?P<firstname>[^,<]+)
		<\/a><\/td>
		<td\s+class="flagcell">(?:
			<img[^>]+\/><span\s*class="printonly\s*flag">\[(?P<nationality>[A-Z]{2,})\]\s*<\/span>
		)?
		<\/td>\s*
		<td>(?P<textid>[-0-9]+)<\/td>
		<td>(?P<birthyear>[0-9]{4,})?<\/td>
		<td>[^<]*<\/td>  # JUG
		<td>[^<]*<\/td>  # AKL
		<td>[^<]*<\/td>  # skz
		<td>[^<]*<\/td>  # vkz1
		<td>[^<]*<\/td>  # vkz2
		<td>(?P<vkz3>[^<]*)<\/td>  # vkz3
		<td>(?P<sex>[^<]*)<\/td>
		<td><a\s+href="club\.aspx\?[^"]+">[^<]*<\/a><\/td>
		<td><a\s+href="team\.aspx\?[^"]+">[^<]*<\/a><\/td>
		<td\s+align="right">(?P<ranking>[0-9]+)<\/td>
		<td>(?P<ranking_d>[0-9]+)?<\/td>
		/x', $vrl_page, $line_matches, \PREG_SET_ORDER)) {
		throw new \Exception('Failed to find lines in ' . $vrl_url);
	}

	$players = [];
	$lfd_num = 1;
	foreach ($line_matches as $line_m) {
		$line_num = \intval($line_m['lfd_num']);
		if ($line_num !== $lfd_num) {
			throw new \Exception('Got line ' . $line_num . ', expected ' . $lfd_num . ' in ' . $vrl_url);
		}
		$lfd_num++;

		$p = [
			'firstname' => $line_m['firstname'],
			'lastname' => $line_m['lastname'],
			'name' => $line_m['firstname'] . ' ' . $line_m['lastname'],
			'textid' => $line_m['textid'],
		];

		if (!$line_m['vkz3']) {
			$p['regular'] = false;
		} else if ($line_m['vkz3'] === 'X') {
			$p['regular'] = true;
		} else {
			throw new \Exception('Unsupported vkz3: ' . \json_encode($line_m['vkz3']));
		}

		if ($line_m['sex'] === 'Mann') {
			$p['gender'] = 'm';
		} else if ($line_m['sex'] === 'Frau') {
			$p['gender'] = 'f';
		} else {
			throw new \Exception('Unsupported sex: ' . \json_encode($line_m['sex']));
		}

		if ($line_m['ranking']) {
			$p['ranking'] = \intval($line_m['ranking']);
		}
		if (isset($line_m['ranking_d']) && $line_m['ranking_d']) {
			$p['ranking_d'] = \intval($line_m['ranking_d']);
		}
		if (isset($line_m['nationality']) && $line_m['nationality']) {
			$p['nationality'] = $line_m['nationality'];
		}

		\array_push($players, $p);
	}
	return $players;
}

function download_team_vrl($httpc, $domain, $season_id, $league_key, $team_id, $is_hr) {
	// Determine VRL ids
	if (!\preg_match('/^(?P<lky>[12]BL[NS]?)-/', $league_key, $lky_m)) {
		throw new \Exception('Cannot find league from league_key ' . $league_key);
	}
	$league_key_yearless = $lky_m['lky'];

	// Determine VRL IDs
	$VRL_IDS = [
		'1BL' => [[1, 2], [3, 4]],
		'2BLN' => [[57, 58], [59, 60]], // These IDs are from the select values, not the IDs for humans
		'2BLS' => [[61, 62], [63, 64]],
	];
	if (!isset($VRL_IDS[$league_key_yearless])) {
		throw new \Exception('No VRL map for league key ' . $league_key_yearless);
	}
	$vrl_ids = $VRL_IDS[$league_key_yearless][$is_hr ? 0 : 1];

	$team_players = [];
	$club_id = determine_club_id($httpc, $domain, $season_id, $team_id);
	foreach ($vrl_ids as $vrl_id) {
		$vrl_players = parse_vrl_players($httpc, $domain, $season_id, $club_id, $vrl_id);
		$team_players = \array_merge($team_players, $vrl_players);
	}

	return $team_players;
}
