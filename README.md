# Basketball World Chronicle — Vite + React Foundation

A history-first global basketball simulator built as a Vite + React single-page application and configured for GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## GitHub Pages

A Pages deployment workflow is included at `.github/workflows/deploy.yml`.

1. Push the project to the `main` branch.
2. Open **Settings → Pages** in the GitHub repository.
3. Select **GitHub Actions** as the source.
4. The workflow installs dependencies, runs the Vite build, and deploys `dist`.

`vite.config.js` uses `base: './'`, so the build works in a repository subpath without editing the repository name.

## Current universe

- **30 real NBA franchises**, using real names and primary color palettes.
- **14 real G League teams**.
- **200 selected NCAA Division I programs**.
- **Exactly five NCAA players per program**: one PG, SG, SF, PF, and C.
- **Exactly 10 active players for every professional team**.
- Real-name EuroLeague clubs and major domestic teams, with color palettes and domestic competition membership.
- European tier-two clubs and annual promotion/relegation movement.
- Additional professional leagues in Australia, Japan, China, Brazil, and Argentina.

Initial generated population:

- 312 teams
- 1,000 NCAA players
- 1,120 professional players
- 2,120 active players total

## Implemented systems

- World, Results, Tournaments, Teams, Players, Market, Statistics, The Global Five, and Almanac menus.
- Teams navigation by region, country, and competition.
- Player and statistical filters by continent, competition, position, and rarity.
- Market tabs for Transfers, Draft, and Spawn.
- Permanent rarity, base ability, career length, career profile, position, height, body type, and basketball role.
- Annual career multiplier curves and annual shape.
- NCAA 80% USA / 20% international generation.
- Other-team 80% local / 20% foreign generation.
- Two-round, 60-pick NBA Draft.
- NCAA age limit and automatic exit after age 22.
- Retirement, roster replacement, NBA releases, and European promotion/relegation.
- Mandatory year-review pause before rollover.

## Important abstraction

The NCAA is deliberately not a complete 365-program database. It is a curated 200-program development universe. College teams do not have benches in this version; only the five relevant starters are named and simulated. When a starter is drafted, ages out, or leaves, the school generates an 18-year-old replacement specifically for that missing position.

## Validation performed

The simulation engine was advanced through 12 full seasons while checking:

- Exactly 200 NCAA programs remain active.
- Every NCAA program always has five players.
- Every NCAA program always has one player at each position.
- Every professional team always returns to 10 active roster players.
- No NCAA player remains after turning 22.
- Every annual NBA Draft produces 60 selections.

The React/JavaScript sources were also syntax-checked. The current execution environment could not access the npm registry to produce a local `dist` folder, so dependencies and the final production bundle should be installed/generated locally or by the included GitHub Actions workflow.
