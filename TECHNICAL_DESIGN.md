# Basketball World Chronicle — Technical Design v0.7.0

## 1. Product objective

Basketball World Chronicle is an observer-driven global history simulator. The player does not manage one franchise. The player advances an interconnected basketball world and follows careers, dynasties, failed prospects, draft rights, transfers, national-team generations, coaching journeys and changes in club ownership.

The core loop is:

1. Advance one week, four weeks or to year review.
2. Read current leaders and award races.
3. Open a tournament, bracket, team, player or coach.
4. Follow permanent annual records and honors.
5. Stop at year review and inspect official outcomes.
6. Run the complete offseason market.
7. Begin the next season in a changed world.

## 2. Platform and project structure

- Vite single-page application
- React UI
- Pure deterministic JavaScript simulation engine
- Static GitHub Pages deployment
- No server dependency in v0.7

```text
src/App.jsx                    navigation and Chronicle pages
src/styles.css                 responsive visual system
src/game/universe.js           generation, season, market and history engine
src/game/saveDb.js             three-slot IndexedDB persistence
src/data/teamData.js           team identities and color palettes
src/data/competitionData.js    tournament hierarchy and cadence
scripts/validate.mjs           deterministic long-run validation
BALANCE_REPORT.md              measured balance output
```

Simulation controls are global and appear above navigation. They are not part of the menu.


## 2.1 Persistence architecture

The browser client exposes three save slots. Persistence uses IndexedDB because the initial universe is approximately 4.5 MB before long-term history accumulation. localStorage is intentionally not used.

Two object stores are maintained:

```text
save-metadata   slot, name, year, week, phase, updatedAt
save-slots      slot, complete structured-clone universe
```

The home screen reads only metadata. Full universe data is loaded only when the user continues a slot. Simulation and offseason writes are queued in order, preventing a slower earlier save from overwriting a newer state.

The application saves after:

- New-universe creation
- Every simulation action
- Every offseason transition
- Manual Save
- Returning Home

A React error boundary converts render failures into a reload path rather than an unrecoverable blank screen.

## 3. Navigation

Primary navigation:

- World
- Results
- Tournaments
- Teams
- Players
- Coaches
- Market
- Statistics
- The Global Five
- Almanac

Full-page detail routes:

- Player
- Team
- Coach
- Competition

Every roster, ranking, result, draft selection, award and transaction supports click-through navigation.

## 4. Universe model

### 4.1 Team entities

| Layer | Entities | Named roster |
|---|---:|---:|
| NBA | 30 | 10 |
| G League | 14 | 10 |
| Selected NCAA Division I | 200 | 5 |
| Other professional clubs | 158 | 10 |
| National teams | 22 | selected 10 |
| **Total** | **424** | — |

National-team rosters reference existing players. They do not duplicate careers.

### 4.2 NCAA abstraction

Each NCAA program stores only:

```text
1 PG · 1 SG · 1 SF · 1 PF · 1 C
```

Opening cohorts are distributed across ages 18 through 21. Scheduled senior exits plus limited elite early declarations create approximately 230–280 annual exits.

### 4.3 Professional roster rule

Every professional club finishes the offseason with exactly 10 registered players. Temporary vacancies and overages are allowed only during market processing.

Local minimums:

- NBA: 6 USA/Canada players
- Other professional clubs: 5 players from the team's country

NCAA-alumni caps:

- EuroLeague club: 4
- Other non-NBA professional club: 3

## 5. Permanent player identity

A player is created with a permanent birth package:

```js
{
  rarity,
  birthRarity,
  base,
  birthBase,
  careerYears,
  careerProfile,
  nationality,
  position,
  height,
  body,
  role,
  originRoute,
  careerCurve,
  ncaaCurve,
  proCurve
}
```

The following never change:

- Rarity
- Base level
- Career length
- Career profile
- Physical and basketball archetype

A Legend is always a Legend, including as an unfinished college freshman or declining veteran.

The validator explicitly checks:

```text
player.rarity === player.birthRarity
player.base   === player.birthBase
```

## 6. Development and current ability

### 6.1 General formula

```text
current ability = base × development multiplier × annual shape
```

Annual shape remains a separate small year-to-year variation. It never changes rarity or base.

### 6.2 NCAA development phase

Players created in NCAA receive a dedicated four-stage college curve. Values vary by career profile but remain between `0.75` and `0.89`.

Examples:

```text
Young prodigy     0.82 → 0.87 → 0.89 → 0.89
Classic prime     0.78 → 0.82 → 0.86 → 0.89
Late bloomer      0.75 → 0.79 → 0.83 → 0.88
Early peak        0.81 → 0.86 → 0.89 → 0.89
Durable veteran   0.77 → 0.82 → 0.86 → 0.89
Volatile talent   0.79 → 0.84 → 0.81 → 0.88
```

This allows NCAA to contain many future stars without turning 18-year-olds into finished professional superstars.

### 6.3 Professional transition for NCAA players

After leaving NCAA, the player switches to a separate adult curve beginning around `0.90`. Adult career multipliers are capped at `1.01` before annual shape.

The college and professional curves are displayed together on the player page, with the active season highlighted.

### 6.4 International professional prospects

Players generated directly in non-NBA professional clubs use the normal career profile from age 18. They can mature slightly faster than NCAA players because they are already playing professionally.

## 7. Annual player generation

### 7.1 NBA restriction

NBA player generation is allowed only during creation of a brand-new universe to seed the opening rosters at different career stages.

After the opening universe:

```text
NBA-generated players per year = 0
```

NBA roster acquisition routes are limited to:

- Draft
- Draft-rights activation
- Free agency
- Trade / transfer
- G League or international recruitment

NBA and G League roster filling searches existing players. It cannot create emergency academy prospects.

### 7.2 NCAA freshmen

Every vacant NCAA position receives an 18-year-old replacement. Nationality logic remains:

- Approximately 80% USA
- Approximately 20% international

### 7.3 International club youth class

Each offseason creates 80 eighteen-year-old players in non-NBA professional club systems.

Club selection is weighted by:

- Club prestige
- Coach development ability
- Owner/president development bonus
- Controlled randomness

Nationality logic remains:

- Approximately 80% team-country nationality
- Approximately 20% foreign

A club can receive at most two youth promotions in one annual class.

### 7.4 Elite birth budget

Each annual class contains either eight or ten Epic-or-better births.

The split is exact:

```text
50% NCAA
50% international club systems
0% NBA
```

Elite rarity distribution within that budget is approximately:

- Epic: 78%
- Legend: 19%
- Generational: 3%

Non-elite generation is capped at Rare so uncontrolled weighted rolls cannot break the annual elite budget.

NCAA elite assignments are weighted toward major programs and strong development coaches. They are not permanently locked to the same schools.

The engine stores an annual `talentHistory` record:

```js
{
  year,
  ncaaElite,
  internationalElite,
  totalElite,
  ncaaShare
}
```

## 8. NBA migration model

### 8.1 Design target

International clubs should create great players and meaningful histories, but almost every mature Generational player and most Legends should eventually reach the NBA.

### 8.2 NBA preference

Permanent NBA preference by rarity:

- Generational: effectively mandatory destination
- Legend: very high
- Epic: high when current ability/potential supports it
- Rare and below: situational

### 8.3 European-lifer exception

A small minority of non-initial international players can receive `europeanLifer`:

- Legend: approximately 4.5%
- Epic: approximately 10%
- Generational: 0%

This allows occasional Bodiroga/Navarro/Spanoulis-style histories without making them the normal outcome.

### 8.4 Migration pressure

Annual NBA-migration probability uses:

- Rarity
- Current ability
- Base level and youth potential
- Age
- Existing NBA rights
- European-lifer exception
- Available NBA roster replacement value

Current ability of 89+ creates near-immediate migration pressure.

NBA teams evaluate young prospects using current level plus future potential rather than current ability alone.

## 9. Team strength hierarchy

### 9.1 Raw rating

Raw rating is based on the active rotation:

- NCAA: all five named players
- Professional teams: strongest eight, with reduced weighting for bench slots 6–8

### 9.2 World rating

```text
world rating = raw roster
             + league context
             + coach bonus
             + owner bonus
             + institutional floor where applicable
```

Current context adjustments make NBA depth decisively stronger than EuroLeague continuity.

Target hierarchy:

```text
NBA average          approximately 89–91
EuroLeague average   approximately 75–78
NCAA average         approximately 58–60
Top NCAA programs    approximately 70–75
```

A top NCAA team can contain exceptional prospects and sit near elite European level, but it must remain below the NBA due to youth, depth, strength and professional continuity.

### 9.3 League-strength UI

The World page calculates live competition strength from participating team ratings and displays the top current competitions.

## 10. Player production

Tracked annual player data:

- Games and minutes
- PPG
- RPG, ORPG and DRPG
- APG
- SPG and BPG
- FG%, 3P% and FT%
- Current ability
- Contract snapshot
- Honors earned that year

The statistical model uses position, role, attributes, minutes, current ability and competition context.

## 11. Career and honors history

A player retains separate records for:

- Annual club career
- National-team tournament career
- Team titles
- Individual awards
- Contract history
- Draft selection
- NBA rights
- Career events and transactions

Player honors are grouped by year and split into compact categories:

```text
2027
Titles   [EuroLeague] [Serbian League]
Awards   [EuroLeague MVP] [EuroLeague Playoff MVP]
```

This supports the central Chronicle story:

```text
NCAA prospect
→ NBA draft pick
→ two marginal NBA seasons
→ European transfer
→ EuroLeague MVP
→ possible NBA return
```

## 12. Competition hierarchy and pages

Tournament browser:

```text
Continent
  → top competitions
  → country
      → all country competitions
```

Competition page tabs:

### Overview

- Current standings/seeding
- Projected MVP
- Current points, rebounds and assists leaders

### Bracket

- Edition selector
- Every knockout matchup and score
- Winner highlighting
- Clickable teams

### Seasons

- Champion
- Runner-up
- MVP
- Finals/Playoff MVP
- Statistical leaders

### Rankings

- Top 10 total points
- Top 10 rebounds
- Top 10 assists
- Teams with most wins
- Teams with most titles

### Teams

- Current participants
- Team rating and country
- Direct links to team pages

## 13. International competitions

The universe includes:

- Olympic Basketball Tournament
- FIBA World Cup
- EuroBasket
- FIBA AmeriCup
- FIBA Asia Cup
- AfroBasket

Four-year cadence preserves scarcity. National-team appearances are stored separately on player pages.

## 14. Contracts, draft and free agency

Every active professional player has:

```js
{
  teamId,
  team,
  startYear,
  endYear,
  salaryTier
}
```

Salary tiers:

- Minimum
- Rotation
- Starter
- Star
- Superstar

NBA Draft:

- 60 picks
- 46 NCAA prospects
- 14 international/G League prospects
- 0–2 immediate signings per NBA team
- Separate NBA-rights ledger
- Draft-and-stash careers supported

Undrafted NCAA exits can:

- Sign in the G League
- Sign internationally
- Remain free agents
- Leave active professional basketball

## 15. Offseason order

```text
1. Age professionals and process retirements
2. Contract expiry and extensions
3. Coach firings, contracts and retirements
4. Ownership mandate changes
5. Identify NCAA exit class
6. NBA Draft
7. Immediate draft signings
8. NCAA graduation / draft-and-stash free agency
9. Age remaining NCAA players
10. Create annual elite talent plan
11. Generate international youth class
12. NBA migration and international transfers
13. Promotion and relegation
14. Free-agent signings and roster completion
15. Archive excess unsigned players
16. Refresh national teams
17. Recalculate world ratings
18. Open the next season
```

## 16. Coaches and owners

### Coaches

Every team has one coach with:

- Permanent rarity and base
- Current ability
- Offense, defense, development and rotations
- Playoff adjustments and man-management
- Style
- Contract
- Annual team record and honors
- Firings, free agency, appointments and retirement

### Presidents / owners

Each team has one leadership figure with:

- Rarity
- 5–20 year mandate
- Celebrity, venture capital, oil money, investment fund, fans consortium or long-time fan profile
- Recruitment, stability, development and patience bonuses

Completed mandates are archived permanently.

## 17. Deterministic validation

`npm run validate` runs a fast two-seed, five-season integrity suite. `npm run validate:full` runs three seeds for ten seasons each. Both verify:

### Structural integrity

- 200 NCAA teams with exactly five positions
- 10-player professional rosters
- Correct contracts and national-team eligibility
- Local-player and NCAA-alumni limits

### Permanent identity

- No rarity changes
- No base-level changes
- NCAA curve always between 0.75 and 0.89

### Generation

- Eight or ten annual Epic+ births
- Exactly 50% of Epic+ births in NCAA
- Exactly 50% in international club systems
- Zero post-opening NBA spawns

### Pipeline

- 230–280 NCAA exits
- 60 draft picks
- 46 NCAA / 14 international selections
- Selective immediate NBA signings
- At least 170 undrafted college exits

### Hierarchy and migration

- NBA average at least nine points above EuroLeague after ten years
- Best EuroLeague team below weakest NBA team in tested universes
- Top NCAA programs within eight points of EuroLeague average
- No mature Generational player retained in a non-NBA professional league
- No 89+ player sustainably outside NBA

### Historical diversity

- Champion and MVP rotation
- Stored brackets and awards
- Correct FIBA cadence
- Coaching and ownership turnover
- Retirements and unsuccessful exits

## 18. Current implementation boundary

The current engine is a strong Chronicle foundation with deterministic season and market logic. Future depth can add:

- Possession-level games and box scores
- More detailed salary-cap accounting
- Multi-team trade AI
- Conference-specific NCAA tournaments and selection bubbles
- EuroLeague qualification/licensing changes
- Cloud saves and multi-slot persistence

These additions can use the existing player, team, competition and history entities without rebuilding navigation or career records.
