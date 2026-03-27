(function () {
  'use strict';

  var DEFAULT_TEAM = 'Toronto Blue Jays';
  var REFRESH_INTERVAL = 600000; // 10 minutes

  // Maps full team name → MLB Stats API team ID.
  // The standings API returns only short nicknames (e.g. "Orioles"), so we
  // match on the numeric ID which is stable across seasons.
  var MLB_TEAM_IDS = {
    'Arizona Diamondbacks': 109,
    'Atlanta Braves': 144,
    'Baltimore Orioles': 110,
    'Boston Red Sox': 111,
    'Chicago Cubs': 112,
    'Chicago White Sox': 145,
    'Cincinnati Reds': 113,
    'Cleveland Guardians': 114,
    'Colorado Rockies': 115,
    'Detroit Tigers': 116,
    'Houston Astros': 117,
    'Kansas City Royals': 118,
    'Los Angeles Angels': 108,
    'Los Angeles Dodgers': 119,
    'Miami Marlins': 146,
    'Milwaukee Brewers': 158,
    'Minnesota Twins': 142,
    'New York Mets': 121,
    'New York Yankees': 147,
    'Oakland Athletics': 133,
    'Philadelphia Phillies': 143,
    'Pittsburgh Pirates': 134,
    'San Diego Padres': 135,
    'San Francisco Giants': 137,
    'Seattle Mariners': 136,
    'St. Louis Cardinals': 138,
    'Tampa Bay Rays': 139,
    'Texas Rangers': 140,
    'Toronto Blue Jays': 141,
    'Washington Nationals': 120
  };

  // Maps full team name → per-team inline display font-family (from fonts/stylesheet.css).
  // Teams without a dedicated font file are omitted (falls back to mlb_primary).
  var MLB_TEAM_FONTS = {
    'Arizona Diamondbacks': 'MLB Arizona Diamondbacks',
    'Baltimore Orioles':    'MLB Baltimore Orioles',
    'Chicago Cubs':         'MLB Chicago Cubs',
    'Chicago White Sox':    'MLB Chicago White Sox',
    'Cincinnati Reds':      'MLB Cincinnati Reds',
    'Colorado Rockies':     'MLB Colorado Rockies',
    'Kansas City Royals':   'MLB Kansas City Royals',
    'Los Angeles Angels':   'MLB Los Angeles Angels',
    'Los Angeles Dodgers':  'MLB Los Angeles Dodgers',
    'Miami Marlins':        'MLB Miami Marlins',
    'Milwaukee Brewers':    'MLB Milwaukee Brewers',
    'Minnesota Twins':      'MLB Minnesota Twins',
    'New York Mets':        'MLB New York Mets',
    'Philadelphia Phillies':'MLB Philadelphia Phillies',
    'Pittsburgh Pirates':   'MLB Pittsburgh Pirates',
    'San Diego Padres':     'MLB San Diego Padres',
    'Seattle Mariners':     'MLB Seattle Mariners',
    'St. Louis Cardinals':  'MLB St. Louis Cardinals',
    'Texas Rangers':        'MLB Texas Rangers',
    'Toronto Blue Jays':    'MLB Toronto Blue Jays',
    'Washington Nationals': 'MLB Washington Nationals'
  };

  // ----------------------------------------------------------------
  // API functions
  // ----------------------------------------------------------------

  /**
   * Fetch standings for both leagues for the given season and date.
   * Endpoint: https://statsapi.mlb.com/api/v1/standings
   */
  function fetchStandings(year, date) {
    var url = 'https://statsapi.mlb.com/api/v1/standings'
      + '?leagueId=103,104'
      + '&season=' + year
      + '&date=' + date
      + '&hydrate=division';
    return fetch(url).then(function (res) { return res.json(); });
  }

  // ----------------------------------------------------------------
  // Branding
  // ----------------------------------------------------------------

  /**
   * Load the team brand CSS from brand-colors.mlbstatic.com and activate
   * the brand class on <body> so all CSS variables resolve.
   * CSS file scope: :root .brand--team-{id} { --mlb-1-brand-* }
   */
  function applyTeamBranding(teamId) {
    var link = document.getElementById('team-brand-css');
    if (!link) {
      link = document.createElement('link');
      link.id = 'team-brand-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = 'https://brand-colors.mlbstatic.com/v1/team-' + teamId + '.css';
    // SRI hashes are not applied here because the brand CSS files are
    // per-team, updated frequently, and selected dynamically at runtime.
    link.crossOrigin = 'anonymous';
    document.body.className = 'brand--team-' + teamId;
  }

  // ----------------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------------

  function getTeamParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get('team') || DEFAULT_TEAM;
  }

  function getYesterdayString() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // ----------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------

  function renderTeam(teamName, team) {
    var year = new Date().getFullYear();
    document.title = teamName + ' Stats';
    document.getElementById('team-btn').textContent = teamName + ' ' + year;

    var winPctEl = document.getElementById('win-pct');
    var teamFont = MLB_TEAM_FONTS[teamName];
    winPctEl.style.fontFamily = teamFont ? '"' + teamFont + '", sans-serif' : '"mlb_primary", sans-serif';
    winPctEl.innerHTML =
      team.leagueRecord.pct.replace(/\./g, '<span class="dot">.</span>');

    document.getElementById('more-details').innerHTML =
      'W<span class="dot">:</span>\u00a0' + team.leagueRecord.wins +
      '\u00a0\u00a0\u00a0L<span class="dot">:</span>\u00a0' + team.leagueRecord.losses +
      '\u00a0\u00a0\u00a0RUNS<span class="dot">:</span>\u00a0' + (team.runsScored != null ? team.runsScored : '-');
  }

  // ----------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------

  function loadTeam() {
    var teams = shuffleArray(Object.keys(MLB_TEAM_IDS));
    var team = teams[0];
    window.location.href = window.location.pathname + '?team=' + encodeURIComponent(team);
  }

  // ----------------------------------------------------------------
  // App initialisation
  // ----------------------------------------------------------------

  function init() {
    var teamName = getTeamParam();
    var year = new Date().getFullYear();
    var date = getYesterdayString();

    fetchStandings(year, date)
      .then(function (data) {
        var records = data && data.records;

        if (!Array.isArray(records)) {
          console.warn('Unexpected standings response shape');
          return;
        }

        var teamId = MLB_TEAM_IDS[teamName];
        if (!teamId) {
          console.warn('Unknown team name:', teamName);
          return;
        }

        var team = null;

        records.forEach(function (record) {
          var teamRecords = record.teamRecords;
          if (!Array.isArray(teamRecords)) { return; }
          teamRecords.forEach(function (teamRecord) {
            if (teamRecord.team && teamRecord.team.id === teamId) {
              team = teamRecord;
            }
          });
        });

        if (!team) {
          console.warn('Team not found in standings:', teamName, '(id:', teamId + ')');
          return;
        }

        renderTeam(teamName, team);
        applyTeamBranding(team.team.id);
      })
      .catch(function (err) {
        console.error('Failed to load team data:', err);
      })
      .finally(function () {
        // Schedule the next refresh only after the current one completes,
        // preventing overlapping requests on slow connections.
        setTimeout(init, REFRESH_INTERVAL);
      });
  }

  // Clicking the team name button in the headbar loads a random team
  document.getElementById('team-btn').addEventListener('click', loadTeam);

  // Boot
  init();
}());
