# MLB Stats Dashboard

A lightweight, static fan-made dashboard that displays live Major League Baseball team standings and statistics, styled with authentic MLB team colours and fonts.

> **Disclaimer:** This is an independent fan project and is **not affiliated with, endorsed by, or sponsored by Major League Baseball (MLB), MLB Advanced Media, or any MLB team**. All team names, logos, colours, and trademarks are the property of their respective owners. Stats data is sourced from the publicly accessible MLB Stats API.

---

## Features

- **Live standings data** — win percentage, wins, losses, and runs scored, fetched directly from the official MLB Stats API
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
| Styling | CSS3 (Flexbox, CSS custom properties, `clamp()` fluid sizing) |
| Logic | Vanilla JavaScript (ES5-compatible, no frameworks or build tools required) |
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

## Project Structure

```
mlbstats/
├── index.html          # Single-page HTML shell
├── app.js              # All application logic (data fetching, rendering, routing)
├── style.css           # Layout and theming (CSS custom properties for team colours)
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
