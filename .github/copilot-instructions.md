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

Base colours, font attributes, and sizing values are declared as CSS custom properties on `:root` at the top of the file. Team-specific brand wrapper variables (`--color-brand-*`) are declared on `body` so they can resolve the dynamically loaded `--mlb-1-brand-*` values. Override the `:root` variables for global theming, and override the `body`-scoped `--color-brand-*` variables if you need to bypass the MLB brand colours.

**Typography** (`:root`)
- `--font-primary` — base font stack (`"mlb_primary", sans-serif`)
- `--font-weight-medium` — shared medium weight (`500`)

**Base palette** (`:root`)
- `--color-bg` — page background (`#fff`)
- `--color-text` — default text colour (`#000`)

**Team brand colours** (`body` wrappers resolved by the dynamically loaded brand CSS; fallbacks apply until that stylesheet is available; each wrapper variable maps to the corresponding `--mlb-1-brand-*` counterpart)
- `--color-brand-bg` — wraps `--mlb-1-brand-background-main` (fallback `#134a8e`)
- `--color-brand-bg-support` — wraps `--mlb-1-brand-background-support` (fallback `#0d3b7a`)
- `--color-brand-bg-inverse` — wraps `--mlb-1-brand-background-inverse` (fallback `#ffffff`)
- `--color-brand-text` — wraps `--mlb-1-brand-text-primary` (fallback `#ffffff`)
- `--color-brand-text-secondary` — wraps `--mlb-1-brand-text-secondary` (fallback `rgba(255,255,255,0.8)`)
- `--color-brand-text-inverse` — wraps `--mlb-1-brand-text-inverse` (fallback `#134a8e`)
- `--color-brand-icon` — wraps `--mlb-1-brand-icon-primary` (fallback `#ffffff`)
- `--color-brand-icon-inverse` — wraps `--mlb-1-brand-icon-inverse` (fallback `#134a8e`)
- `--color-brand-border` — wraps `--mlb-1-brand-border-decorative` (fallback `#0d3b7a`)
- `--color-brand-border-contrast` — wraps `--mlb-1-brand-border-contrast` (fallback `#4c5a83`)
- `--color-brand-border-inverse` — wraps `--mlb-1-brand-border-inverse` (fallback `#ffffff`)
- `--color-brand-decorative-1` — wraps `--mlb-1-brand-decorative-color-1` (fallback `#134a8e`)
- `--color-brand-decorative-2` — wraps `--mlb-1-brand-decorative-color-2` (fallback `#8fbce6`)
- `--color-brand-surface` — wraps `--mlb-1-brand-surface` (fallback `#134a8e`)

**Header bar typography**
- `--headbar-font-size` — header text size (`0.85rem`)
- `--headbar-letter-spacing` — header letter spacing (`0.05em`)

**Win-percentage display**
- `--winpct-font-size` — fluid win-pct size (`clamp(4rem, 20vw, 12rem)`)

**Decorative dot**
- `--dot-opacity` — opacity of the `.` and `:` decorative characters (`0.4`)

**Details / footer bar typography**
- `--moredetails-font-size` — footer text size (`clamp(0.85rem, 3vw, 1.1rem)`)
- `--moredetails-letter-spacing` — footer letter spacing (`0.08em`)

---

## Coding Conventions

- **ES5 syntax only** — no `let`, `const`, arrow functions, template literals, or other ES6+ syntax; the code does rely on modern browser APIs (`fetch`, `Promise`, `URLSearchParams`, `String.prototype.padStart`) so polyfills are required for older browsers
- **Single IIFE** — all code lives inside `(function () { 'use strict'; … }());`
- **No external dependencies at runtime** — do not add npm packages that are loaded in the browser
- **Minimal DOM manipulation** — use `createElement` / `appendChild` / `removeChild` rather than `innerHTML` to avoid XSS risks
- **No framework** — no React, Vue, Angular, jQuery, etc.
- **CSS custom properties** — declare global colours and font attributes as custom properties in `:root` inside `style.css`, but define brand wrapper variables (`--color-brand-*`) on `body` so they can reference the dynamically loaded `--mlb-1-brand-*` properties; use `var(--variable-name)` for all team-specific and themeable values
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
