# Basketball World Chronicle — Vite + React v0.7.0

A global, history-first basketball simulator built around the same Chronicle principle as Football World Chronicle and Peloton Chronicle: advance the universe, then open any competition, team, player, coach, draft class or market record and understand the history that was created.

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

Fast deterministic integrity test with visible season-by-season progress:

```bash
npm run validate
```

Full three-seed, ten-season balance suite:

```bash
npm run validate:full
```

The quick command is the normal development check. The full suite is intentionally heavier and may take several minutes in constrained environments.

## GitHub Pages

The project includes `.github/workflows/deploy.yml`.

1. Push the project to the `main` branch.
2. Open **Settings → Pages** in GitHub.
3. Select **GitHub Actions** as the Pages source.
4. Every push to `main` builds the Vite application and deploys `dist`.

`vite.config.js` uses `base: './'`, so the application works from a repository subpath.


## v0.7.0 save and presentation fixes

### Three persistent save slots

The application now opens on a home screen with three independent universe slots. Each slot supports:

- Continue
- Replace with a new universe
- Permanent deletion with confirmation
- Stored year, week, phase and last-save timestamp

The in-game masthead includes **Home** and **Save** controls. Every simulation and offseason action is also autosaved before the next screen can fail. Writes are serialized so rapid simulation clicks cannot save an older universe over a newer one.

Saves use browser **IndexedDB**, not localStorage. An opening universe is already several megabytes and grows as annual histories, brackets, contracts and retired careers accumulate, so localStorage is not a safe foundation. Save metadata is stored separately from the full universe to keep the three-slot home screen fast.

### Crash recovery

The numeric-year sorting crash caused by calling `localeCompare` on honor years has been removed. All mixed string/number sorting now normalizes values safely. A React error boundary provides a reload screen instead of a blank page, and the active slot can be continued after reload.

### Player presentation

- Career development now uses compact annual cards rather than decorative bars.
- The current career year is highlighted.
- Each card shows the multiplier and the resulting ability implied by the permanent base.
- NCAA-origin careers show only the college years actually used before the professional curve.
- Honors are grouped by year and split into compact **Titles** and **Awards** rows.

### Flags

Country or regional flags now appear throughout player tables and profiles, team cards and pages, competition cards and pages, tournament navigation, standings and global rankings.

## v0.7.0 headline systems

### Permanent player identity

A player's rarity and base level are assigned at birth and never change.

```text
Permanent
- Rarity
- Base level
- Career length
- Career profile
- Position, body and role

Annual
- Development multiplier
- Annual shape
- Minutes and opportunity
- Team and league
- Production and honors
```

Every player now also stores `birthRarity` and `birthBase`. The deterministic validator fails if either permanent value changes.

### NCAA development cap

NCAA prospects can hold elite long-term potential without playing like finished NBA superstars.

Typical college multipliers:

```text
Freshman   0.75–0.82
Sophomore  0.79–0.87
Junior     0.81–0.89
Senior     0.88–0.89
```

After leaving college, an NCAA-origin player moves onto a separate professional curve beginning around `0.90` and peaking no higher than `1.01` before annual shape.

A Legend remains a Legend at every stage:

```text
Legend · base 92
Age 18 NCAA: 92 × 0.80
Age 20 pro:  92 × 0.90
Prime:       92 × 1.01
Decline:     lower career multiplier
```

### NBA is a destination league

NBA rosters are generated only once when a new universe is created. After the opening season, NBA teams create **zero** players.

Every later NBA arrival must come through:

- NBA Draft
- Draft-rights activation
- Free agency
- Trade / transfer
- International or G League recruitment

NBA roster filling now searches the existing market and development world instead of manufacturing emergency prospects.

### Elite-talent birth split

Every annual class contains eight or ten new Epic-or-better prospects.

Exactly half are generated in NCAA and half in non-NBA club systems:

```text
NCAA               50%
International clubs 50%
NBA                  0%
```

The Market → Spawn page displays this split for every class. Elite NCAA assignments are weighted toward major programs without making every famous school permanently dominant. International prospects are weighted toward clubs with stronger prestige, coaching development and ownership support.

### Elite migration toward the NBA

International clubs can develop elite players, but they are not expected to retain mature global superstars indefinitely.

- Generational prospects have an overwhelming NBA preference.
- Legends receive strong NBA migration pressure.
- Epics move when their current level or potential warrants it.
- A very small minority of Legend/Epic players can receive a European-lifer profile.
- No Generational player receives the European-lifer exception.
- Players at 89+ current ability are aggressively recruited by NBA teams.

This supports careers such as:

```text
Real Madrid academy
→ EuroLeague breakout
→ NBA Draft
→ NBA star

or the rare exception:

Partizan
→ EuroLeague icon
→ long European career
```

### Rebalanced world hierarchy

The rating model now creates a decisive gap between NBA and EuroLeague while allowing top NCAA programs to look far better than the 200-program college average.

Measured ten-season averages across the deterministic suite:

```text
NBA        approximately 89.5–90.0
EuroLeague approximately 75.5
NCAA       approximately 59.0
```

Top NCAA teams reached approximately 73–75, close enough to elite Europe to contain visibly special prospects while remaining clearly below the professional world. In the test suite, the strongest EuroLeague team remained below the weakest NBA team and no 89+ player remained sustainably outside the NBA.

The World page now includes a **League Strength** ranking based on current teams, rosters, coaching and institutional context.

## Chronicle detail pages

- **Player pages:** current profile, NCAA/pro development curve, annual club career, national-team career, honors grouped by year, contracts, NBA Draft/rights and complete transaction timeline.
- **Team pages:** roster, annual records, trophy cabinet, coach/owner history and transactions.
- **Competition pages:** current standings and leaders, stored brackets, annual champions/finalists/awards, all-time rankings and participating teams.
- Every relevant player, team and competition name is clickable.

## Results and tournaments

Results is an award-race dashboard rather than a generic list of scores.

- Current MVP race
- Top scorer
- Top rebounder
- Direct links to each competition
- Official awards during year review

Tournament navigation follows:

```text
Continent
  → top continental / headline competitions
  → country
      → domestic league, cup, supercup and second tier
```

International competitions include:

- Olympic Basketball Tournament
- FIBA World Cup
- EuroBasket
- FIBA AmeriCup
- FIBA Asia Cup
- AfroBasket

Every completed knockout competition stores the bracket and exact path to the title.

## Market and offseason

The offseason order is explicit:

```text
Player retirements
→ contract expiry / extensions
→ coaching changes
→ ownership mandate changes
→ NBA Draft
→ NCAA graduation and draft-and-stash market
→ annual youth generation
→ transfers and NBA migration
→ promotion / relegation
→ free agency
→ final roster registration
```

Market tabs include:

- Transfers
- Draft
- NBA rights
- Free agency
- Retirements and exits
- Spawn classes
- Coaching market

Players never silently disappear. Unsigned graduates and unsuccessful professionals are archived with a recorded reason.

## Universe size

- 30 NBA teams, 10 players each
- 14 G League teams, 10 players each
- 200 selected NCAA Division I programs, five named starters each
- 158 European and international professional clubs, 10 players each
- 22 national teams selecting existing players
- 424 team entities
- Approximately 3,020 active club/NCAA/free-agent players at creation

NCAA remains deliberately abstracted to:

```text
PG · SG · SF · PF · C
```

## Draft pipeline

The 1,000 NCAA players are distributed across four age cohorts, producing roughly 250 exits each year.

Each draft contains:

- 60 total selections
- 46 NCAA selections
- 14 international selections
- Normally 0–2 immediate signings per NBA team
- Retained NBA rights for unsigned picks
- More than 170 undrafted graduates entering free agency or leaving active basketball

## Validation

`npm run validate` executes two deterministic seeds for five seasons each. `npm run validate:full` executes three seeds for ten seasons each. Both check:

- 200 NCAA starting fives and 10-player professional rosters
- NCAA multipliers never exceeding 0.89
- Rarity and base level never changing
- Exactly half of annual Epic+ births coming through NCAA
- Zero post-creation NBA player generation
- Contracts, local-player quotas and NCAA-alumni limits
- Approximately 250 NCAA exits and exactly 60 draft picks
- Selective immediate NBA signings
- A decisive NBA/EuroLeague gap
- Strong NCAA programs remaining meaningfully above the college average
- Mature Generational players migrating out of non-NBA professional leagues
- No 89+ player remaining sustainably outside the NBA
- Champion and MVP diversity
- Brackets, awards and international cadence
- Coaching movement, ownership turnover, free agency and retirements

See `BALANCE_REPORT.md` for measured output.

The engine validation and TypeScript JSX parse check passed. This execution environment's internal npm mirror does not contain React, so a local `dist` folder could not be produced here. GitHub Actions or a normal npm installation will build the project.
