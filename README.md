# Basketball World Chronicle — Vite + React v0.8.0

A global, history-first basketball simulator built around the Chronicle principle: advance one persistent universe, then move through it as a connected web of countries, competitions, teams, national teams, players, coaches, drafts and historical records.

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

Deterministic validation:

```bash
npm run validate
npm run validate:full
```

`validate` runs two seeds for three seasons. `validate:full` runs the heavier eight-season integrity and balance suite.

## GitHub Pages

The project is a normal Vite application and uses `base: './'`, so it can deploy from a GitHub repository subpath.

1. Push the project to `main`.
2. Open **Settings → Pages**.
3. Choose **GitHub Actions** as the source.
4. The included workflow builds and deploys `dist`.

## v0.8.0 world scale

A new universe contains approximately:

- 30 NBA teams.
- 31 current G League teams.
- 200 selected NCAA Division I programs, each represented only by PG, SG, SF, PF and C.
- 474 professional clubs outside the NBA/G League.
- 75 national teams.
- 810 total team entities.
- Roughly 6,480 active players.

Professional clubs have 10 players. NCAA programs have only five named starters.

### Country simulation tiers

**24 detailed countries** have real club names and colors, a complete top domestic league, domestic cup, supercup where relevant, and selected second tiers:

Spain, France, Germany, Italy, Greece, Turkey, Serbia, Lithuania, Israel, Russia, Croatia, Slovenia, Poland, Argentina, Brazil, Mexico, Puerto Rico, Canada, China, Japan, South Korea, Philippines, Australia and New Zealand.

**30 high-level countries** have six real clubs and a lighter domestic competition. They still produce champions, MVPs, leaders, transfers, national-team players and occasional elite prospects.

The national-team layer expands beyond those club systems to 75 countries.

## Connected web navigation

The application now uses hash routes instead of isolated modal state:

```text
#/world
#/region/Europe
#/country/Spain
#/competition/liga-acb
#/team/123
#/player/456
#/national-team/789
```

Every relevant name is a link. Browser Back and Forward retrace the journey, and breadcrumbs expose the current path.

Example:

```text
Europe
→ Spain
→ Liga ACB
→ Real Madrid
→ player
→ NBA Draft
→ NBA team
```

The universe remains mounted while the route changes, so navigating never reloads or re-simulates the save.

## International basketball

International fields now include:

- Olympic Basketball Tournament — 12 teams.
- FIBA World Cup — 32 teams.
- EuroBasket — 24 teams.
- FIBA AmeriCup — 12 teams.
- FIBA Asia Cup — 16 teams.
- AfroBasket — 16 teams.

National-team selection is tournament-specific. It is not simply the ten highest-rated eligible players.

Availability considers:

- Tournament importance.
- National-team commitment.
- Age and career stage.
- NBA playoff workload.
- Fatigue and club pressure.
- Recent participation.
- Voluntary rest and international retirement.

The United States therefore normally sends a secondary roster to AmeriCup, a mixed roster to the World Cup and its strongest available group to the Olympics. Player absences and reasons are visible on the national-team page.

## Real historical player identities

Rarity remains permanent. A Legend is a Legend from age 18 until retirement, even while only expressing part of his base talent.

The active elite population is controlled at:

```text
3 Generational
12 Legend
30 Epic
```

Historical basketball names are mixed with procedural players:

```text
Generational: 1–2 of the active 3, normally 2
Legend:       approximately 7 of 12
Epic:         approximately 11 of 30
```

The historical pools include players such as Chamberlain, Russell, Magic, Bird, Jordan, Kobe, LeBron, Curry, Durant, Jokic, Antetokounmpo and Doncic, plus large Legend and Epic pools from the NBA and international game.

Names are never duplicated inside one universe. Historical identities are archetypes in the alternate timeline: their teams, draft positions, titles and careers are determined by the save.

## Permanent player identity and development

Permanent values:

- Rarity.
- Base level.
- Career length.
- Career profile.
- Position and body.
- Role.
- Nationality and first development route.

Annual values:

- Career multiplier.
- Annual shape.
- Current ability.
- Minutes, role and opportunity.
- Production, injuries and honors.

```text
Current ability = permanent base × career multiplier × annual shape
```

NCAA development is capped between `0.75` and `0.89`. After college, the player enters a professional curve beginning around `0.90` and peaking at no more than `1.01` before annual shape.

## NBA destination model

NBA players are generated only when a brand-new universe is created to populate the initial historical world.

After opening day:

```text
NBA-generated players per year = 0
```

NBA teams acquire players only through:

- Draft.
- Draft-rights activation.
- Trades.
- Free agency.
- G League recruitment.
- International recruitment.

Elite talent is born in NCAA and non-NBA club systems. Mature Generational players and almost all mature Legends migrate toward the NBA. No Generational player receives a European-lifer profile. A very small number of Legend/Epic careers can become long-term European icons.

## Saves

The home screen contains three independent save slots with:

- Continue.
- New universe / replace.
- Delete.
- Manual save.
- Autosave after simulation and offseason actions.

Full universes are stored in IndexedDB rather than localStorage. Writes are serialized to prevent an older asynchronous write from overwriting a newer state.

v0.7 saves remain loadable. However, the expanded v0.8 country, club and G League datasets are created only in a new v0.8 universe, so the save screen labels legacy slots clearly.

## Main Chronicle pages

### Player

- Profile and permanent identity.
- Annual development cards.
- Club career by year.
- International career.
- Contracts and NBA rights.
- Draft record.
- Honors grouped by year and split between team titles and individual awards.
- Full career timeline.

### Team

- Roster.
- Linked domestic and continental competitions.
- Coach and president/owner.
- Annual records.
- Trophy cabinet.
- Transactions and leadership history.

### Competition

- Current standings and award races.
- Stored knockout bracket.
- Annual champions, finalists, MVPs and leaders.
- All-time points, rebounds, assists, wins and titles rankings.
- Clickable participating teams and players.

### Country

- National team.
- Domestic competitions.
- Clubs by tier.
- Best active players.
- Players abroad.
- Current champions and leaders.

### National team

- Selected roster.
- Unavailable stars and reasons.
- Coach.
- Competition history.
- Honors and historical leaders.

## Validation status

The packaged source passes:

- JavaScript syntax checks.
- JSX transpilation diagnostics with zero errors.
- Two-seed quick validation through 2029.
- Eight-season full validation through 2034.

See `BALANCE_REPORT.md` for measured results.
