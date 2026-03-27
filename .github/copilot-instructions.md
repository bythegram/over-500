# GitHub Copilot Instructions — MLB Stats Dashboard

## Project Overview

**MLB Stats Dashboard** (`mlbstats`) is a lightweight, static, single-page fan website that displays live Major League Baseball standings and team statistics. It is a fan project and is **not affiliated with, endorsed by, or sponsored by Major League Baseball or any MLB club**.

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Markup | Plain HTML5 — a single `index.html` file |
| Styling | Vanilla CSS3 — a single `style.css` file (Flexbox, CSS custom properties, `clamp()`) |
| Logic | Vanilla JavaScript (ES5-style syntax; relies on modern browser APIs: `fetch`, `Promise`, `URLSearchParams`, `padStart`) — a single `app.js` file wrapped in an IIFE |
| Fonts | Custom MLB typefaces declared in `fonts/stylesheet.css` |
| Data | MLB Stats API (`statsapi.mlb.com`) |
| Branding | MLB Brand Colours API (`brand-colors.mlbstatic.com`) |
| Dev server | `serve` npm package (optional; any static server works) |

There is **no framework, no transpiler, no bundler, and no build step**. The entire app ships as-is.

---

## Repository Layout

```
mlbstats/
├── index.html          # HTML shell; three layout zones: headbar / winper / moredetails
├── app.js              # All JS logic (IIFE, ES5)
├── style.css           # Global styles and CSS custom-property theming
├── fonts/
│   ├── stylesheet.css  # @font-face declarations
│   ├── BentonSans-*    # Primary MLB typeface (eot, ttf, woff)
│   └── MLB*.{eot,ttf,woff}  # Per-team decorative fonts for ~21 teams
├── package.json        # npm metadata; `npm start` runs `serve .`
├── .github/
│   └── copilot-instructions.md  # This file
├── LICENSE             # MIT License
└── README.md           # Project documentation
```

---

## Key Source Files

### `index.html`

Minimal HTML shell with three layout zones:
- `.headbar` — team-name button (`#team-btn`) that triggers a random-team navigation
- `.winper` — vertically and horizontally centred win-percentage display (`#win-pct`)
- `.moredetails` (`#more-details`) — footer showing W / L / Runs

### `app.js`

Single IIFE in ES5. Key sections (in order):

1. **Constants** — `DEFAULT_TEAM`, `REFRESH_INTERVAL`, `MLB_TEAM_IDS` (name → numeric ID), `MLB_TEAM_FONTS` (name → font-family)
2. **`fetchStandings(year, date)`** — fetches `/api/v1/standings` from `statsapi.mlb.com`; returns a Promise
3. **`applyTeamBranding(teamId)`** — injects a `<link>` to the MLB brand-colours CDN and toggles `brand--team-{id}` on `<body>`
4. **Utilities** — `getTeamParam()`, `getYesterdayString()`, `shuffleArray()`
5. **`renderTeam(teamName, team)`** — updates the DOM with win pct, W/L, runs, and team font
6. **`loadTeam()`** — picks a random team and navigates via `window.location.href`
7. **`init()`** — main entry point; fetches data, renders, schedules auto-refresh via `setTimeout`

### `style.css`

CSS custom properties used for team theming (populated by the brand-colours CDN):
- `--mlb-1-brand-background-main` — header and footer background colour
- `--mlb-1-brand-text-primary` — header and footer text colour

Fallback values (`#134a8e` / `#fff`) are applied until the brand CSS loads.

---

## Coding Conventions

- **ES5 syntax only** — no `let`, `const`, arrow functions, template literals, or other ES6+ syntax; the code does rely on modern browser APIs (`fetch`, `Promise`, `URLSearchParams`, `String.prototype.padStart`) so polyfills are required for older browsers
- **Single IIFE** — all code lives inside `(function () { 'use strict'; … }());`
- **No external dependencies at runtime** — do not add npm packages that are loaded in the browser
- **Minimal DOM manipulation** — use `createElement` / `appendChild` / `removeChild` rather than `innerHTML` to avoid XSS risks
- **No framework** — no React, Vue, Angular, jQuery, etc.
- **CSS custom properties** — use `var(--mlb-1-brand-*, fallback)` for all team-specific colours
- **Error handling** — `console.warn` for expected-but-missing data; `console.error` for network/unexpected failures
- **Comments** — use JSDoc-style block comments for functions; inline `//` comments for non-obvious logic

---

## External APIs

### MLB Stats API

```
GET https://statsapi.mlb.com/api/v1/standings
  ?leagueId=103,104        (AL + NL)
  &season={YYYY}
  &date={YYYY-MM-DD}       (yesterday's date for latest complete data)
  &hydrate=division
```

Response shape:
```json
{
  "records": [
    {
      "teamRecords": [
        {
          "team": { "id": 141 },
          "leagueRecord": { "wins": 82, "losses": 80, "pct": ".506" },
          "runsScored": 720
        }
      ]
    }
  ]
}
```

### MLB Brand Colours

```
GET https://brand-colors.mlbstatic.com/v1/team-{teamId}.css
```

CSS file that defines custom properties scoped to `:root .brand--team-{id}`.

---

## Important Constraints

1. **Fan site** — this is not an official MLB product. Do not add any language or features that imply MLB affiliation or endorsement.
2. **No commercial use** — do not add advertising, monetisation, or data-resale features.
3. **Static only** — keep the app deployable as a plain static site (no server-side rendering, no backend).
4. **No build step** — do not introduce Webpack, Rollup, Babel, TypeScript, or any compilation step.
5. **ES5 compatibility** — maintain ES5 syntax for broad browser support.
6. **Respect API terms** — use the MLB Stats API only for personal/fan use as intended.

---

## Running the Project

```bash
npm install   # installs the `serve` dev server (one-time)
npm start     # serves at http://localhost:3000
```

Open `http://localhost:3000` or `http://localhost:3000/?team=New%20York%20Yankees`.

---

## Disclaimer

All MLB team names, logos, colours, and trademarks are the intellectual property of Major League Baseball and its member clubs. This fan project is independent and not affiliated with MLB in any way.
