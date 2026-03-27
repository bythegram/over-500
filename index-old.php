<!doctype html>
<html class="no-js" lang="">
<head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="default">
        <link rel="stylesheet" href="style.css">
<?php
	$qteam = $_REQUEST['team'];
	if ( $qteam == '' || !isset($qteam) ) {
		$qteam = 'Toronto Blue Jays';
	}
	$y = date('Y');
        $dstring = date("Y/m/d", strtotime("yesterday"));
        $url = "http://mlb.mlb.com/lookup/json/named.standings_schedule_date.bam?season={$y}&schedule_game_date.game_date=%27{$dstring}%27&sit_code=%27h0%27&league_id=103&league_id=104&all_star_sw=%27N%27&version=2";
	$file = file_get_contents( $url );
        $json = json_decode( $file );
        $league = $json->standings_schedule_date->standings_all_date_rptr->standings_all_date;
	foreach( $league as $le ) {
        	$row = $le->queryResults->row;
        	foreach ( $row as $a ) {
                	if ( $a->team_full == $qteam ) {
                        	$team = $a;
			}
			$teams[] = $a->team_full;
		}
	}
	
	if ( $team !== '' ) {
	
	$teamurl = "http://mlb.com/shared/properties/style/{$team->file_code}.json";
	$teamdetails = file_get_contents( $teamurl );
	$teamjson = json_decode( $teamdetails );
	$fullurl = parse_url($teamjson->wired_logo->url);
	$imurl = $fullurl['scheme'].'://'.$fullurl["host"];
	$image = $imurl.$teamjson->wired_logo->image;
	$prim = $teamjson->style->dark_theme->secondary_border;
	$second = $teamjson->style->dark_theme->secondary_background;
	$text = $teamjson->style->dark_theme->text;
	$teamname = $team->team_full;
	echo '<style>.headbar,.moredetails { color: '.$text.'; background-color: '.$prim.'; border-color: '.$second.'; } .winper { color : '.$prim.'; } body { font-family: "MLB '.$teamname.'", "mlb_primary", sans-serif;}</style>';
	echo '<style>body { background-image: url('.$image.'); background-repeat: no-repeat; background-position: 50%;} </style>';

	echo $teamurl;

	}

	shuffle($teams);	

?>
        <title><?php echo $teamname; ?> Stats</title>
	<link rel="shortcut icon" href="fav.ico">
	<link rel="apple-touch-icon" href="fav.ico">
	<link rel="apple-touch-startup-image" href="fav.ico">
</head>
<body onclick="loadTeam();">
	<div class="headbar">
		<?php echo $teamname.' '.date('Y'); ?>
	</div>
	<div class="winper">
	<div class="vert_wrapper"><div class="vert_cell">
<?php
                        echo str_replace('.','<span class="dot">.</span>',$team->pct);
?>
	<div class="moredetails">
		<?php 
			//print_r($jays);
			echo 'W<span class="dot">:</span> '.$team->w.' | L<span class="dot">:</span> '.$team->l.' | Runs<span class="dot">:</span> '.$team->runs;
		?>
	</div>
	</div></div>
	</div>
<?php //echo $url; ?>
</body>
<script src="https://code.jquery.com/jquery-2.2.3.min.js"   integrity="sha256-a23g1Nt4dtEYOj7bR+vTu7+T8VP13humZFBJNIYoEJo="   crossorigin="anonymous"></script>
<script src="https://cdn.rawgit.com/alexgibson/shake.js/master/shake.js"></script>
<script>
     var url = window.location.href;
     function refresh() {
        console.log('ajax');
	$.ajax({
		url: url,
		success: function (response) {
            		$('#wrapper').html($(response).find('#wrapper').html());
        		console.log('updated');
		}
	});
     }
     setInterval(refresh, 600000);

function loadTeam() {
	var teamArray = [ <?php echo '"'.implode( '","', $teams).'"'; ?> ];
	var team = teamArray[0];
	window.location.href = "http://bythegram.ca/jays/old.php?team=" + team;
}
//listen to shake event
var shakeEvent = new Shake({threshold: 15});
shakeEvent.start();
window.addEventListener('shake', function(){
        loadTeam();
}, false);

//stop listening
function stopShake(){
        shakeEvent.stop();
}
</script>
</html>