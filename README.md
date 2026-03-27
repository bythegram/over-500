# MLB Stats Dashboard

A lightweight, static fan-made dashboard that displays live Major League Baseball team standings and statistics, styled with authentic MLB team colours and fonts.

> **Disclaimer:** This is an independent fan project and is **not affiliated with, endorsed by, or sponsored by Major League Baseball (MLB), MLB Advanced Media, or any MLB team**. All team names, logos, colours, and trademarks are the property of their respective owners. Stats data is sourced from the publicly accessible MLB Stats API.

---

## Features

- **Latest complete standings** — win percentage, wins, losses, and runs scored, fetched from the official MLB Stats API using the most recent completed day's data
- **Team branding** — dynamic team colours loaded from MLB's brand-colour service so every team looks authentic
- **Team-specific fonts** — 21 clubs have dedicated typefaces; all others fall back to the primary MLB display font
- **Random team loader** — click the team name in the header to jump to a randomly selected club
- **URL parameter support** — link directly to any team with `?team=Toronto%20Blue%20Jays`
- **Auto-refresh** — data refreshes automatically every 10 minutes without a full page reload
- **Mobile-ready** — responsive fluid typography, viewport meta tags, and PWA-style standalone display support

---

## Live Demo

Serve the repo locally (see [Getting Started](#getting-started)) and open `http://localhost:3000` in your browser.

---

## Screenshots

The UI is intentionally minimal — a full-screen layout with three zones:

| Zone | Content |
|------|---------|
| **Header bar** | Team name + current season year (click to load a random team) |
| **Main area** | Large win-percentage figure rendered in the team's display font |
| **Footer bar** | Win / Loss record and runs scored for the season to date |

All colours update instantly to match the selected team's official palette.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (Flexbox, CSS custom properties for all colours and font attributes, `clamp()` fluid sizing) |
| Logic | Vanilla JavaScript (ES5-style syntax; relies on modern browser APIs — `fetch`, `Promise`, `URLSearchParams`, `padStart` — no frameworks or build tools required; polyfills needed for older browsers) |
| Fonts | Custom per-team MLB typefaces + Benton Sans Condensed Medium |
| Data | [MLB Stats API](https://statsapi.mlb.com/api/v1/standings) |
| Branding | [MLB Brand Colours API](https://brand-colors.mlbstatic.com) |
| Dev server | [`serve`](https://github.com/vercel/serve) (optional, any static server works) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 14 (only needed for the optional dev server)
- A modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/bythegram/mlbstats.git
cd mlbstats

# Install the optional dev server
npm install
```

### Running locally

```bash
npm start
# → serving at http://localhost:3000
```

Alternatively, serve with any static HTTP server — for example:

```bash
npx serve .
python3 -m http.server 3000
```

> **Note:** The app fetches data from external APIs. Open it over HTTP (not `file://`) to avoid CORS restrictions.

---

## Usage

### Default team

The dashboard defaults to the **Toronto Blue Jays**. This can be changed by editing the `DEFAULT_TEAM` constant at the top of `app.js`.

### URL parameter

Append `?team=<Full Team Name>` to the URL to load a specific team on page load:

```
http://localhost:3000/?team=New%20York%20Yankees
http://localhost:3000/?team=Los%20Angeles%20Dodgers
http://localhost:3000/?team=Chicago%20Cubs
```

### Random team

Click the **team name button** in the header bar to jump to a randomly selected team.

### Supported teams

All 30 current MLB franchises are supported:

| American League | National League |
|-----------------|-----------------|
| Baltimore Orioles | Arizona Diamondbacks |
| Boston Red Sox | Atlanta Braves |
| Chicago White Sox | Chicago Cubs |
| Cleveland Guardians | Cincinnati Reds |
| Detroit Tigers | Colorado Rockies |
| Houston Astros | Los Angeles Dodgers |
| Kansas City Royals | Miami Marlins |
| Los Angeles Angels | Milwaukee Brewers |
| Minnesota Twins | New York Mets |
| New York Yankees | Philadelphia Phillies |
| Oakland Athletics | Pittsburgh Pirates |
| Seattle Mariners | San Diego Padres |
| Tampa Bay Rays | San Francisco Giants |
| Texas Rangers | St. Louis Cardinals |
| Toronto Blue Jays | Washington Nationals |

---

## Theming

Global layout and typography values are declared as CSS custom properties on `:root` at the top of `style.css`. Team brand wrapper variables (the `--color-brand-*` values that resolve `--mlb-1-brand-*` from the CDN) are declared on `body` via the `.brand--team-{id}` class, so overrides for those must also target `body` (or a specific `.brand--team-{id}`), not `:root`. Override any variable — either in a separate stylesheet or inside a `<style>` tag — to customise the look without touching layout rules.

### Available variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--font-primary` | `"mlb_primary", sans-serif` | Base font stack used throughout the page |
| `--font-weight-medium` | `500` | Shared medium font weight (header and footer bars) |
| `--color-bg` | `#fff` | Page background colour |
| `--color-text` | `#000` | Default text colour (body and win-percentage figure) |
| `--color-brand-bg` | `var(--mlb-1-brand-background-main, #134a8e)` | Primary brand background (header and footer) |
| `--color-brand-bg-support` | `var(--mlb-1-brand-background-support, #0d3b7a)` | Supporting/secondary brand background |
| `--color-brand-bg-inverse` | `var(--mlb-1-brand-background-inverse, #ffffff)` | Inverse brand background |
| `--color-brand-text` | `var(--mlb-1-brand-text-primary, #ffffff)` | Primary brand text colour (header and footer) |
| `--color-brand-text-secondary` | `var(--mlb-1-brand-text-secondary, rgba(255,255,255,0.8))` | Secondary brand text colour |
| `--color-brand-text-inverse` | `var(--mlb-1-brand-text-inverse, #134a8e)` | Inverse brand text colour |
| `--color-brand-icon` | `var(--mlb-1-brand-icon-primary, #ffffff)` | Primary brand icon colour |
| `--color-brand-icon-inverse` | `var(--mlb-1-brand-icon-inverse, #134a8e)` | Inverse brand icon colour |
| `--color-brand-border` | `var(--mlb-1-brand-border-decorative, #0d3b7a)` | Decorative brand border colour |
| `--color-brand-border-contrast` | `var(--mlb-1-brand-border-contrast, #4c5a83)` | High-contrast brand border colour |
| `--color-brand-border-inverse` | `var(--mlb-1-brand-border-inverse, #ffffff)` | Inverse brand border colour |
| `--color-brand-decorative-1` | `var(--mlb-1-brand-decorative-color-1, #134a8e)` | First decorative brand colour |
| `--color-brand-decorative-2` | `var(--mlb-1-brand-decorative-color-2, #8fbce6)` | Second decorative brand colour |
| `--color-brand-surface` | `var(--mlb-1-brand-surface, #134a8e)` | Brand surface colour |
| `--headbar-font-size` | `0.85rem` | Header bar font size |
| `--headbar-letter-spacing` | `0.05em` | Header bar letter spacing |
| `--winpct-font-size` | `clamp(4rem, 20vw, 12rem)` | Fluid font size for the win-percentage figure |
| `--dot-opacity` | `0.4` | Opacity of the decorative `.` and `:` characters |
| `--moredetails-font-size` | `clamp(0.85rem, 3vw, 1.1rem)` | Footer bar font size |
| `--moredetails-letter-spacing` | `0.08em` | Footer bar letter spacing |

### Example override

```css
/* custom-theme.css */

/* Global/layout overrides go on :root */
:root {
  --color-bg: #0a0a0a;
  --color-text: #f5f5f5;
  --font-weight-medium: 700;
  --dot-opacity: 0.25;
}

/* Brand colour overrides must target body, not :root */
body {
  --color-brand-bg: #1a1a2e;
  --color-brand-text: #e0e0e0;
}
```

---

## Project Structure

```
mlbstats/
├── index.html          # Single-page HTML shell
├── app.js              # All application logic (data fetching, rendering, routing)
├── style.css           # Layout and theming (CSS custom properties for all colours and font attributes)
├── fonts/
│   ├── stylesheet.css  # @font-face declarations for all MLB fonts
│   ├── BentonSans-*    # Primary MLB display typeface
│   └── MLB*.{eot,ttf,woff}  # Per-team decorative fonts (21 teams)
├── package.json        # npm metadata and dev-server script
└── README.md           # This file
```

---

## APIs

### MLB Stats API

```
GET https://statsapi.mlb.com/api/v1/standings
  ?leagueId=103,104
  &season={year}
  &date={YYYY-MM-DD}
  &hydrate=division
```

Returns division standings including each team's win/loss record (`leagueRecord`) and `runsScored`.

### MLB Brand Colours

```
GET https://brand-colors.mlbstatic.com/v1/team-{teamId}.css
```

A CSS stylesheet that exposes CSS custom properties (`--mlb-1-brand-background-main`, `--mlb-1-brand-text-primary`, etc.) scoped to `.brand--team-{id}`.

---

## Contributing

Contributions, bug reports, and suggestions are welcome! Please open an issue or submit a pull request. Keep the spirit of the project in mind: lightweight, no build step, no frameworks.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-improvement`)
3. Commit your changes (`git commit -m 'Add my improvement'`)
4. Push to the branch (`git push origin feature/my-improvement`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## Legal & Disclaimer

This is a **fan-made project** created for personal and educational use. It is **not affiliated with, endorsed by, or sponsored by**:

- Major League Baseball (MLB)
- MLB Advanced Media, L.P.
- Any individual MLB club

All MLB team names, logos, colours, and related trademarks are the intellectual property of their respective owners. No commercial use is intended or implied. Stats data is obtained from a publicly accessible API endpoint.

If you are an MLB rights holder and have concerns about this project, please open an issue and we will address them promptly.
