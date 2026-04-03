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
  // Drawer state
  // ----------------------------------------------------------------

  var drawerState = {
    isOpen: false,
    currentTeam: null
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
    return fetch(url).then(function (res) {
      if (!res.ok) {
        var error = new Error('Failed to fetch standings: ' + res.status + ' ' + res.statusText);
        error.status = res.status;
        error.statusText = res.statusText;
        throw error;
      }
      return res.json();
    });
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
    var body = document.body;
    var brandClass = 'brand--team-' + teamId;

    if (body.classList) {
      for (var i = body.classList.length - 1; i >= 0; i--) {
        var cls = body.classList[i];
        if (/^brand--team-/.test(cls)) {
          body.classList.remove(cls);
        }
      }
      body.classList.add(brandClass);
    } else {
      var current = (body.className || '').split(/\s+/);
      var kept = [];
      for (var j = 0; j < current.length; j++) {
        if (current[j] && !/^brand--team-/.test(current[j])) {
          kept.push(current[j]);
        }
      }
      kept.push(brandClass);
      body.className = kept.join(' ');
    }
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

  /** Format a record object (with .wins / .losses) as "W-L", or '-' if unavailable. */
  function formatRecord(recordObj) {
    return (recordObj && recordObj.wins != null) ? recordObj.wins + '-' + recordObj.losses : '-';
  }

  // ----------------------------------------------------------------
  // Drawer functions
  // ----------------------------------------------------------------

  /** The element that had focus before the drawer was opened; restored on close. */
  var lastDrawerTrigger = null;

  /**
   * Return all keyboard-focusable descendants of container that are not hidden.
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    var selector = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'iframe',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    var nodes = container.querySelectorAll(selector);
    var focusable = [];
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (!nodes[i].hidden && nodes[i].getAttribute('aria-hidden') !== 'true') {
        focusable.push(nodes[i]);
      }
    }
    return focusable;
  }

  /**
   * Trap keyboard focus inside the open drawer when Tab is pressed.
   * @param {KeyboardEvent} e
   */
  function trapDrawerFocus(e) {
    var drawer, focusable, first, last;
    if (!drawerState.isOpen || e.key !== 'Tab') { return; }
    drawer = document.getElementById('stats-drawer');
    if (!drawer) { return; }
    focusable = getFocusableElements(drawer);
    if (!focusable.length) {
      e.preventDefault();
      return;
    }
    first = focusable[0];
    last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /**
   * Move focus into the drawer, preferring the close button.
   * @param {HTMLElement} drawer
   */
  function focusDrawer(drawer) {
    var closeBtn = drawer.querySelector('.drawer-close');
    var focusable;
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
      return;
    }
    focusable = getFocusableElements(drawer);
    if (focusable.length) {
      focusable[0].focus();
      return;
    }
    drawer.setAttribute('tabindex', '-1');
    drawer.focus();
  }

  /**
   * Open the stats drawer.  No-op until team data has been loaded.
   */
  function openDrawer() {
    var drawer = document.getElementById('stats-drawer');
    var backdrop = document.getElementById('drawer-backdrop');
    var trigger = document.getElementById('more-details');

    if (!drawerState.currentTeam) { return; }

    lastDrawerTrigger = document.activeElement;

    backdrop.hidden = false;
    drawer.hidden = false;
    drawer.removeAttribute('aria-hidden');

    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawerState.isOpen = true;
    document.body.style.overflow = 'hidden';

    trigger.setAttribute('aria-expanded', 'true');
    focusDrawer(drawer);
  }

  /**
   * Close the stats drawer and restore focus to the element that opened it.
   */
  function closeDrawer() {
    var drawer = document.getElementById('stats-drawer');
    var backdrop = document.getElementById('drawer-backdrop');
    var trigger = document.getElementById('more-details');

    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawerState.isOpen = false;
    document.body.style.overflow = '';

    drawer.hidden = true;
    backdrop.hidden = true;

    trigger.setAttribute('aria-expanded', 'false');

    if (lastDrawerTrigger && document.contains(lastDrawerTrigger)) {
      lastDrawerTrigger.focus();
    }
  }

  /**
   * Populate the stats table inside the drawer with data from the team record.
   * @param {Object} team - teamRecord object from the standings API response
   */
  function populateStatsTable(team) {
    var tbody = document.getElementById('stats-table-body');
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    var record = team.leagueRecord || {};
    var stats = [
      { label: 'Wins',           value: record.wins   != null ? record.wins   : '-' },
      { label: 'Losses',         value: record.losses != null ? record.losses : '-' },
      { label: 'Win %',          value: record.pct    ? record.pct             : '-' },
      { label: 'Runs Scored',    value: team.runsScored      != null ? team.runsScored      : '-' },
      { label: 'Runs Allowed',   value: team.runsAllowed     != null ? team.runsAllowed     : '-' },
      { label: 'Run Differential', value: team.runDifferential != null ? team.runDifferential : '-' },
      { label: 'Home Record',    value: formatRecord(team.home) },
      { label: 'Away Record',    value: formatRecord(team.away) },
      { label: 'Last 10',        value: formatRecord(team.lastTen) },
      { label: 'Current Streak', value: (team.streak  && team.streak.streakCode ? team.streak.streakCode : '-') },
      { label: 'Division Rank',  value: team.divisionRank != null ? team.divisionRank : '-' },
      { label: 'League Rank',    value: team.leagueRank   != null ? team.leagueRank   : '-' }
    ];

    stats.forEach(function (stat) {
      var tr = document.createElement('tr');

      var tdLabel = document.createElement('td');
      tdLabel.textContent = stat.label;
      tr.appendChild(tdLabel);

      var tdValue = document.createElement('td');
      tdValue.textContent = stat.value;
      tr.appendChild(tdValue);

      tbody.appendChild(tr);
    });
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
    var record = team.leagueRecord || {};
    winPctEl.style.fontFamily = teamFont ? '"' + teamFont + '", sans-serif' : '"mlb_primary", sans-serif';
    // Safely render win percentage with decorative dot spans.
    while (winPctEl.firstChild) {
      winPctEl.removeChild(winPctEl.firstChild);
    }
    var pct = record.pct ? String(record.pct) : '';
    for (var pi = 0; pi < pct.length; pi++) {
      var ch = pct.charAt(pi);
      if (ch === '.') {
        var dotSpan = document.createElement('span');
        dotSpan.className = 'dot';
        dotSpan.textContent = '.';
        winPctEl.appendChild(dotSpan);
      } else {
        winPctEl.appendChild(document.createTextNode(ch));
      }
    }

    // Safely render more details with decorative colon dots.
    var moreDetailsEl = document.getElementById('more-details');
    while (moreDetailsEl.firstChild) {
      moreDetailsEl.removeChild(moreDetailsEl.firstChild);
    }

    var wins = record.wins != null ? record.wins : '-';
    var losses = record.losses != null ? record.losses : '-';
    var runs = team.runsScored != null ? team.runsScored : '-';

    var wColon = document.createElement('span');
    wColon.className = 'dot';
    wColon.textContent = ':';
    moreDetailsEl.appendChild(document.createTextNode('W'));
    moreDetailsEl.appendChild(wColon);
    moreDetailsEl.appendChild(document.createTextNode('\u00a0' + wins));

    var lColon = document.createElement('span');
    lColon.className = 'dot';
    lColon.textContent = ':';
    moreDetailsEl.appendChild(document.createTextNode('\u00a0\u00a0\u00a0L'));
    moreDetailsEl.appendChild(lColon);
    moreDetailsEl.appendChild(document.createTextNode('\u00a0' + losses));

    var runsColon = document.createElement('span');
    runsColon.className = 'dot';
    runsColon.textContent = ':';
    moreDetailsEl.appendChild(document.createTextNode('\u00a0\u00a0\u00a0RUNS'));
    moreDetailsEl.appendChild(runsColon);
    moreDetailsEl.appendChild(document.createTextNode('\u00a0' + runs));

    // Store current team data and repopulate the stats drawer only when it is
    // closed; if the drawer is currently open let the user finish reading.
    drawerState.currentTeam = team;
    if (!drawerState.isOpen) {
      populateStatsTable(team);
    }
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
  // Event listeners
  // ----------------------------------------------------------------

  function setupEventListeners() {
    // Team button click — load a random team
    document.getElementById('team-btn').addEventListener('click', loadTeam);

    // Footer bar click — open stats drawer
    document.getElementById('more-details').addEventListener('click', openDrawer);

    // Footer bar keyboard activation (Enter / Space)
    document.getElementById('more-details').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDrawer();
      }
    });

    // Close button inside drawer
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);

    // Backdrop click — close drawer
    document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);

    // ESC key — close drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerState.isOpen) {
        closeDrawer();
      }
    });

    // Tab key — trap focus inside the open drawer
    document.addEventListener('keydown', trapDrawerFocus);
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

  // Boot
  setupEventListeners();
  init();
}());
