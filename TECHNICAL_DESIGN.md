# Basketball World Chronicle — Technical Design v0.8.0

## 1. Design promise

The game is a persistent alternate basketball history, not an NBA season simulator. Its value comes from being able to follow any entity across decades:

```text
NCAA prospect
→ drafted by San Antonio
→ two limited NBA seasons
→ free agency
→ Panathinaikos
→ EuroLeague MVP
→ NBA return
→ retirement
→ Hall of Fame debate
```

The simulation must preserve enough immutable facts to reconstruct that journey from player, team, competition, draft, country and national-team pages.

## 2. Application architecture

### 2.1 Runtime

- Vite.
- React 18.
- Plain JavaScript data/engine modules.
- IndexedDB persistence.
- Static GitHub Pages deployment.

### 2.2 Routing

Hash routing avoids server rewrite requirements on GitHub Pages.

```text
#/world
#/results
#/region/:region
#/country/:country
#/competition/:competitionId
#/team/:teamId
#/national-team/:teamId
#/player/:playerId
#/coach/:coachId
#/market/:tab
```

The simulation state lives above the route renderer. Route changes alter only presentation.

Browser history is authoritative for Back and Forward. Breadcrumbs are derived from entity relationships.

## 3. World detail levels

### 3.1 Detailed countries

Twenty-four countries have authored club lists and colors, full top divisions, cups, supercups and selected second tiers.

Each detailed club stores:

```js
{
  id,
  name,
  country,
  region,
  color,
  competition,
  competitionId,
  secondaryCompetitions,
  secondaryCompetitionIds,
  tier,
  prestige,
  rosterIds,
  coachId,
  ownerId,
  seasonRecords,
  honors,
  history,
  transactions
}
```

### 3.2 High-level countries

Thirty countries use six real clubs and a lighter league simulation. They still participate in the same player, transfer, awards and history systems.

### 3.3 National-team-only depth

The national pool reaches 75 countries. Countries without a detailed domestic system receive enough domestic free-agent depth to construct valid rosters and generate international histories.

## 4. Team populations

```text
NBA             30 × 10 players
G League        31 × 10 players
NCAA           200 × 5 players
Other pros     474 × 10 players
National teams  75 selected rosters; no duplicate player entities
```

National teams reference existing club/free-agent players. They do not own duplicate copies.

## 5. Player identity

### 5.1 Permanent birth package

```js
{
  rarity,
  birthRarity,
  base,
  birthBase,
  careerYears,
  careerProfile,
  careerCurve,
  position,
  role,
  body,
  height,
  nationality,
  originRoute,
  realIdentity,
  historicalArchetype
}
```

`rarity === birthRarity` and `base === birthBase` are hard validation rules.

### 5.2 Rarity bands

| Rarity | Base | Career years |
|---|---:|---:|
| Common | 66–72 | 6–10 |
| Uncommon | 73–78 | 7–11 |
| Rare | 79–83 | 8–12 |
| Epic | 84–88 | 10–13 |
| Legend | 89–93 | 12–15 |
| Generational | 94–98 | 14–18 |

### 5.3 Controlled elite population

The active world targets exactly:

```text
Generational 3
Legend      12
Epic        30
```

Annual elite generation replaces vacancies instead of adding an uncontrolled new batch every year.

Elite replacement routes remain balanced between NCAA and international clubs. NBA receives zero generated players after universe creation.

### 5.4 Historical identity mixture

Historical identity pools are independent from rarity. A historical name inherits the rarity assigned by its pool and then lives a new procedural career.

Active targets:

```text
Real Generational 1–2 / 3
Real Legend       6–8 / 12, target 7
Real Epic         9–13 / 30, target 11
```

Used names are stored in `usedRealPlayerNames`, preventing duplicates.

## 6. Development model

### 6.1 NCAA curve

A college player expresses only part of permanent base talent.

Typical ranges:

```text
Freshman   0.75–0.82
Sophomore  0.79–0.86
Junior     0.82–0.88
Senior     0.85–0.89
```

No NCAA multiplier can exceed `0.89`.

### 6.2 Professional curve

After leaving NCAA, the player switches to a separate adult curve:

```text
approximately 0.90 → 1.01 → decline
```

One-and-done prospects begin professional development earlier. Four-year players arrive more polished but have fewer pre-prime professional seasons.

### 6.3 Current ability

```text
current = clamp(base × developmentMultiplier × annualShape)
```

Annual shape changes performance, never rarity or base.

## 7. NBA acquisition model

NBA roster creation is permitted only at world initialization.

Later acquisition routes:

- Two-round, 60-pick draft.
- Rights activation.
- Free agency.
- Trades.
- G League movement.
- International buyout/recruitment.

NBA teams have no academy and no emergency spawn method.

### 7.1 Draft composition

Target draft mix:

```text
approximately 46 NCAA selections
approximately 14 international/G League selections
60 total
```

Draft selection does not guarantee immediate NBA registration. Teams may sign zero, one or two picks and retain rights to the others.

### 7.2 NCAA exits

Around 250 NCAA starters leave each year. Outcomes:

- Drafted and signed.
- Drafted and stashed.
- G League.
- International professional contract.
- Free agency.
- Exit from active professional basketball.

Every outcome is archived.

### 7.3 Elite migration

- Generational: effectively mandatory NBA destination once mature.
- Legend: very high NBA pressure.
- Epic: high pressure if current/potential level supports it.
- 89+ outside NBA: immediate priority recruitment.
- Generational European-lifer chance: zero.
- Legend and Epic European-lifer chance: rare.

## 8. National-team system

### 8.1 Competition calendar

```text
EuroBasket / AmeriCup / Asia Cup / AfroBasket: every 4 years
FIBA World Cup: every 4 years
Olympics: every 4 years
```

### 8.2 Field sizes

```text
Olympics 12
World Cup 32
EuroBasket 24
AmeriCup 12
Asia Cup 16
AfroBasket 16
```

### 8.3 Availability score

```text
availability = tournamentImportance
             + nationalCommitment
             + youthOpportunity
             + OlympicMotivation
             - NBAStarRest
             - playoffWorkload
             - veteranRest
             - clubManagement
```

The roster constructor first attempts positional coverage, then fills the remaining places by availability-adjusted value.

Non-selected high-value players receive explicit reasons stored in `team.unavailablePlayers`.

## 9. Competition simulation and archive

Each competition defines:

```js
{
  id,
  name,
  region,
  country,
  kind,
  level,
  detail,
  fieldSize,
  startYear,
  frequency
}
```

Annual competition archives contain:

- Standings/seeding.
- Champion and runner-up.
- MVP.
- Finals/playoff MVP.
- Points, rebounds and assists leaders.
- Knockout bracket rounds and scores.
- Team records.

All-time rankings aggregate archived season data rather than current screen state.

## 10. Staff and leadership

### 10.1 Coaches

Every team has exactly one coach with:

- Rarity and permanent base.
- Offense, defense, development, rotations and playoff adjustment.
- Tactical profile.
- Contract and career history.
- Titles and awards.

Coaches can be hired, fired, become free agents, move countries and retire.

### 10.2 President/owner

Every club receives one president/owner mandate lasting 5–20 years.

Profiles include:

- Celebrity.
- Venture capital.
- Oil money.
- Investment fund.
- Fans consortium.
- Long-time supporter.

Bonuses influence recruitment, patience, stability and development. Completed mandates remain in team history.

## 11. Save architecture

IndexedDB stores:

```text
save-slots     full universe state
save-metadata  lightweight home-screen information
```

Three fixed slots are supported.

Writes are serialized through a promise queue. Simulation commits the new React state and immediately queues the same object for persistence.

Save metadata includes universe version. Legacy v0.7 saves remain loadable, but a new v0.8 save is required to instantiate the expanded world dataset.

## 12. Performance rules

The engine mutates its controlled universe object during simulation and returns a new root object for React. It does not structured-clone tens of megabytes before every action.

Long-term history remains attached to entities, while UI calculations derive maps and filtered collections only for the active route.

## 13. Deterministic validation

The validator checks:

- 200 NCAA teams with exactly one player per position.
- 31 G League teams.
- 75 national teams.
- 10-player professional rosters.
- Local-player minimums.
- NCAA alumni caps outside the NBA.
- Valid contracts.
- Permanent rarity and base.
- NCAA cap.
- Exact elite counts and historical-name proportions.
- International field sizes.
- USA AmeriCup star absences.
- 60-pick drafts and plausible graduate outcomes.
- Zero NBA spawning.
- NBA/EuroLeague/NCAA hierarchy.
- Champion and MVP diversity.
- Stored brackets and awards.
- No mature Generational or 89+ player remaining sustainably outside NBA.
