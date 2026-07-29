# Basketball World Chronicle — Technical Design v0.3

## Revision v0.3 — React Foundation and Compact NCAA Model

This revision converts the prototype into a Vite + React application and deliberately reduces the college universe from a complete Division I directory to a curated, simulation-relevant pool.

### Technology and deployment

- React single-page application
- Vite development and production build
- Static GitHub Pages deployment
- Repository-safe relative asset base (`./`)
- GitHub Actions workflow on pushes to `main`
- No backend dependency in the current foundation

### Final top-level navigation

- **World**
- **Results**
- **Tournaments**
- **Teams**
- **Players**
- **Market**
  - Transfers
  - Draft
  - Spawn
- **Statistics**
- **The Global Five**
- **Almanac**

### Initial team structure

| Layer | Teams | Named players per team | Purpose |
|---|---:|---:|---|
| NBA | 30 | 10 | Highest professional level, draft and transaction market |
| NBA G League | 14 | 10 | Development, releases and alternate entry route |
| NCAA Division I pool | 200 | 5 | Starting-five-only prospect pipeline |
| Europe | 52 | 10 | EuroLeague, domestic leagues and promotion/relegation |
| Other professional leagues | 16 | 10 | Australia, Japan, China, Brazil and Argentina |
| **Total** | **312** | — | **2,120 initial active players** |

The 200 NCAA programs are selected for recognizability, competitive relevance, geographic reach, and conference variety. The model is intentionally not a complete representation of every Division I institution.

### NCAA starting-five abstraction

Every NCAA program has exactly five named active players:

```text
PG · SG · SF · PF · C
```

There is no named bench in the initial version. College results are calculated from those five players, coach/program strength, form and tournament context. This keeps the draft pipeline deep without creating thousands of low-relevance bench careers.

College roster rules:

- Exactly five active players at all times.
- Exactly one player at each position.
- Ages 18–22 only.
- New replacements always spawn at age 18.
- A replacement fills the exact position vacated by a drafted, transferred or age-out player.
- NCAA generation is 80% American and 20% international.
- NCAA players can declare for the draft beginning at age 19.
- Any player older than 22 leaves college for the G League, an international team, free agency or retirement.

### Professional roster rule

Every professional team has exactly 10 active players. The active roster should normally contain two players at each position, although transactions can temporarily create imbalance before the year-end roster rebalance.

The 10-player limit applies to:

- NBA
- G League
- EuroLeague/domestic European clubs
- Asian, Australian and South American professional clubs

### Real-world identity policy

The foundation uses real team and school names for NBA, selected NCAA programs, EuroLeague clubs and prominent domestic teams. It uses team-specific primary color palettes and text initials, but does not bundle official logos or other licensed artwork.

Color data is stored in `src/data/teamData.js` and is intentionally editable. Marquee teams have individually assigned primary colors; less prominent NCAA entries can be progressively verified and refined without changing the simulation model.

### European promotion and relegation

Selected European countries contain both top-tier and second-tier clubs. At year rollover:

1. The lowest eligible non-EuroLeague top-tier club is selected.
2. The highest-performing second-tier club is selected.
3. Their domestic competition and tier values are swapped.
4. Player competition history continues under the promoted/relegated team identity.

EuroLeague participants are protected from automatic prototype relegation because continental licensing and qualification rules will become a separate system later.

### Permanent player identity

Assigned once at player creation and never changed:

- Rarity
- Base ability
- Career length
- Career profile and multiplier array
- Position
- Height
- Body type
- Basketball role
- Nationality
- First team and development route

Current ability remains:

```text
base ability × career-year multiplier × annual shape
```

Supported career profiles:

- Young prodigy
- Classic prime
- Late bloomer
- Early peak
- Durable veteran
- Volatile talent

### Player spawning

All newly generated players are 18.

```text
NCAA: 80% USA / 20% international
Other team: 80% team country / 20% foreign
```

No player spawns directly into the NBA. NBA entry occurs through the draft, trades, free agency or later movement.

### Market architecture

**Transfers** stores NBA releases, professional transfers, NCAA exits, roster cuts and retirements.

**Draft** combines NCAA, G League and international prospects. The annual draft contains 60 picks. Selecting a player moves him to the drafting NBA team and forces a corresponding roster release when necessary.

**Spawn** records every age-18 replacement and its team, route, nationality, position and rarity.

### Year rollover sequence

```text
1. Stop at Year Review.
2. Allow inspection of the completed season.
3. Run the 60-pick NBA Draft.
4. Run European promotion/relegation.
5. Age players and advance career curves.
6. Retire players whose curves are complete.
7. Remove NCAA players older than 22.
8. Fill each NCAA position vacancy with an 18-year-old.
9. Return every professional roster to 10 players.
10. Recalculate team ratings and open the new year.
```

### Current foundation boundary

The React build includes the full global data model, menus, filters, player/team modals, weekly advancement, draft, spawning, retirements, roster constraints and promotion/relegation. The next major layer is competition-specific scheduling and results: NBA regular season/play-in/playoffs, NCAA conferences and national tournament, EuroLeague format, domestic playoffs, awards, contracts, salary cap and deeper roster AI.

---

## 1. Product Goal

Basketball World Chronicle is a history-first global basketball simulation. The player acts as an observer and universe chronicler rather than controlling one team. The core loop is:

1. Advance the calendar.
2. Observe games, tournaments, careers, trades, transfers, and drafts.
3. Inspect statistics and narratives.
4. Compare leagues, teams, players, draft classes, and eras.
5. Stop at season end before rollover so the completed year can be reviewed.

The initial implementation focuses on NBA, G League, NCAA, EuroLeague, and six fully simulated European domestic leagues. National teams are a second-phase system.

---

## 2. Navigation Architecture

Primary menus:

- **World** — global overview, rankings, current stories, league strength.
- **Results** — chronological game results across all competitions.
- **Tournaments** — geographic hierarchy and competition pages.
- **Teams** — searchable team directory and team histories.
- **Players** — searchable player directory and career pages.
- **Market** — Transactions, Draft, and Spawn as one connected player-movement hub.
- **Statistics** — league and global statistical leaderboards.
- **The Global Five** — weekly narrative magazine.
- **Almanac** — historical records and year-by-year summaries.
- **Hall of Fame** — multiple greatness categories.
- **Saves** — three local slots initially; cloud saves later.

### Tournaments hierarchy example

- World
  - USA
    - NBA
    - NBA G League
    - NCAA
  - Europe
    - EuroLeague
    - EuroCup
    - Spain — Liga ACB
    - Turkey — BSL
    - Greece — GBL
    - Italy — LBA
    - France — LNB Pro A
    - Germany — BBL
  - Other Regions
    - Australia
    - China
    - Japan
    - Israel
    - Lithuania
    - Adriatic League
    - South America

Clicking a region reveals its competitions. Clicking a competition opens its competition hub.

---

## 3. Core Simulation Calendar

The simulation advances weekly.

### User controls

- Simulate one week
- Simulate four weeks
- Simulate to next checkpoint
- Simulate to end of regular season
- Simulate to end of year
- Move to next year

### Hard Chronicle rule

`Simulate to end of year` stops in the final review week. It never automatically opens the next season. Roster aging, retirements, new prospects, contract rollovers, and archive resets only occur after the user clicks **Move to next year**.

### NBA checkpoints

1. Opening week
2. Christmas week
3. Trade deadline
4. All-Star break
5. End of regular season
6. Play-in
7. Playoffs
8. NBA Finals
9. Draft lottery
10. NBA Draft
11. Free agency
12. Year review

### NCAA checkpoints

1. Opening tournaments
2. Conference play
3. Conference tournaments
4. Selection Sunday
5. NCAA Tournament
6. Final Four
7. Draft declaration deadline

### Europe checkpoints

1. Domestic season opening
2. EuroLeague opening
3. Midseason transfer window
4. Domestic cups
5. EuroLeague playoffs
6. Final Four
7. Domestic playoffs/finals
8. Summer transfer market

---

## 4. Data Model

### Player

```ts
interface Player {
  id: string;
  name: string;
  nationality: string;
  birthYear: number;
  age: number;
  teamId: string | null;
  leagueId: string;
  status: 'active' | 'retired' | 'free-agent' | 'prospect';

  primaryPosition: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  secondaryPositions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'>;
  heightCm: number;
  weightKg: number;
  bodyType: 'slim' | 'normal' | 'muscular' | 'heavy';

  primaryRole: PlayerRole;
  secondaryRole?: PlayerRole;

  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legend' | 'generational';
  baseTalent: number;
  potential: number;
  currentAbility: number;
  annualShape: number;
  careerPhase: 'prospect' | 'rookie' | 'prime' | 'veteran' | 'decline';

  attributes: PlayerAttributes;
  tendencies: PlayerTendencies;
  personality: PlayerPersonality;

  contract?: Contract;
  draft?: DraftProfile;
  seasonStats: SeasonStatLine[];
  careerEvents: CareerEvent[];
}
```

### Player roles

- Primary creator
- Secondary creator
- Floor general
- Three-level scorer
- Three-point shooter
- Movement shooter
- Slasher
- Low-post scorer
- Face-up big
- Rim runner
- Stretch big
- Perimeter stopper
- Rim protector
- Rebounder
- Two-way wing
- Sixth man
- Utility role player

Roles are not positions. A 203 cm SF can be a primary creator. A 211 cm C can be a shooter or a low-post scorer.

### Player attributes

Offense:

- Inside scoring
- Post scoring
- Mid-range
- Three-point shooting
- Free throws
- Ball handling
- Passing
- Offensive intelligence
- Off-ball movement
- Screen setting

Defense:

- Perimeter defense
- Interior defense
- Rim protection
- Steal instinct
- Defensive intelligence

Physical:

- Speed
- Acceleration
- Vertical
- Strength
- Stamina
- Durability
- Agility

Mental/contextual:

- Clutch
- Consistency
- Work ethic
- Leadership
- Adaptability
- Playoff composure
- Loyalty
- Market appeal
- Usage tolerance
- Ball dominance

---

## 5. Height and Body Type System

Height and body shape modify how attributes translate into game outcomes. They should not directly dictate talent.

### Height effects

- Taller players finish and contest shots more effectively near the rim.
- Shorter players have a lower natural finishing floor but may gain speed, handling, and point-of-attack advantages.
- Extreme size creates matchup value but also mobility costs.
- Positional size affects rebounding, shot quality, switching, and foul rate.

### Body type effects

#### Slim

- Bonuses: acceleration, agility, stamina, off-ball movement.
- Penalties: contact finishing, post defense, physical durability.
- Best fit: shooters, tall creators, mobile forwards.

#### Normal

- No major modifier.
- Most versatile developmental profile.

#### Muscular

- Bonuses: strength, contact finishing, perimeter resistance, durability.
- Small penalties: acceleration and long-duration stamina.
- Best fit: slashing guards, two-way wings, power forwards.

#### Heavy

- Bonuses: post position, screen quality, defensive rebounding, interior leverage.
- Penalties: transition speed, perimeter defense, stamina, injury recovery.
- A heavy PG or SG is not automatically bad, but must compensate with elite skill, strength, or half-court creation. The archetype is viable as a deliberate outlier, not a normal build.

### Example distinction: low-post centers

A low-post scorer is evaluated through a composite rather than one rating.

```text
Post Threat =
  30% post scoring
  18% strength
  12% offensive intelligence
  10% touch / inside scoring
  10% passing out of double teams
  8% height advantage
  7% consistency
  5% free-throw pressure
```

A Marc Gasol-like center may have high post craft, passing, intelligence, and shooting but only moderate athletic dominance. A Shaquille O'Neal-like center combines elite strength, inside scoring, size, and foul pressure. Both share a role but produce very different statistical and tactical outcomes.

---

## 6. Statistical Model

### Core player box score

- Games
- Starts
- Minutes
- Points
- PPG
- Field goals made/attempted
- FG%
- Two-point percentage
- Three-point percentage
- Free-throw percentage
- Offensive rebounds
- Defensive rebounds
- Total rebounds
- RPG
- Assists
- APG
- Steals
- Blocks
- Turnovers
- Personal fouls
- Plus/minus

### Advanced summary statistics

- Usage rate
- True shooting percentage
- Assist percentage
- Rebound percentage
- Turnover percentage
- Offensive rating
- Defensive rating
- Estimated impact
- Win shares / historical value proxy

The game engine can use simplified internal calculations while displaying credible outputs.

### Team statistics

- Pace
- Offensive rating
- Defensive rating
- Net rating
- Points per game
- Shooting splits
- Rebound rate
- Assist rate
- Turnover rate
- Opponent shooting
- Clutch record
- Home/away record

---

## 7. Game Simulation Engine

Simulation should generate possessions rather than only calculating a final score.

### Step 1 — Rotation and minutes

The coach allocates 240 regulation minutes based on:

- Current ability
- Role
- fatigue
- health
- coach rotation preference
- development priority
- contract/status
- matchup

### Step 2 — Lineup evaluation

For each lineup:

- Creation
- Shooting gravity
- Rim pressure
- Interior scoring
- Offensive rebounding
- Perimeter defense
- Interior defense
- Rim protection
- Transition ability
- Size
- chemistry

### Step 3 — Possession result

Each possession selects:

1. Offensive initiator
2. Action type
3. Finisher
4. Defensive matchup/help
5. Result

Actions include pick-and-roll, isolation, post-up, transition, spot-up, cut, offensive rebound, and motion action.

### Step 4 — Box score allocation

Possession outcomes produce coherent individual statistics. Roles and tendencies determine who shoots, assists, rebounds, steals, and blocks.

### Step 5 — Narrative events

The simulator emits tags:

- triple-double
- 40-point game
- 20-rebound game
- 10-block game
- buzzer-beater
- upset
- rivalry win
- record pace
- rookie breakout
- revenge game
- return from injury
- first game against former team

These feed The Global Five.

---

## 8. Team Construction

### Team ratings

- Star power
- Starting five
- Bench depth
- Creation
- Shooting
- Rim pressure
- Perimeter defense
- Interior defense
- Rebounding
- Positional balance
- Chemistry
- Coaching
- Experience
- Health

### Role conflicts

Five strong players should not always form a great team.

Penalties occur for:

- Multiple high ball-dominance creators
- No primary creator
- Poor spacing
- No rim protection
- Small rebounding lineup
- Weak bench creation
- Too many development players in win-now roles
- Star hierarchy conflict

Bonuses occur for:

- Clear primary and secondary creator
- Complementary shooting
- Two-way lineup balance
- Bench scorer
- Defensive anchor
- Veteran leadership
- Coach-system fit

---

## 9. NCAA and Prospect Pipeline

### NCAA scope

- 200 selected Division I programs.
- Abstracted conference schedules and a national tournament layer.
- Exactly five named players per program: one at each position.
- No named bench players in the initial version.
- NCAA eligibility is limited to ages 18–22.
- Players may declare early, return, transfer, graduate, or go undrafted.

### Prospect sources

- NCAA
- G League development pathway
- European domestic teams
- European youth academies
- Africa academies
- Australia
- Asia
- South America
- Limited high-school elite prospects

### Prospect evaluation

- Current ability
- Potential
- Age
- Physical profile
- Role
- Production
- League strength
- Tournament performance
- Work ethic
- Injury history
- Scout uncertainty

Mock drafts must include uncertainty. Teams can draft for upside, fit, readiness, marketability, or positional need.

---

## 10. NBA Draft

### Draft lifecycle

1. Prospect generation and development
2. Draft declaration
3. Combine / scouting update
4. Lottery
5. Mock drafts
6. Draft night
7. Rookie contracts
8. Summer movement and roster decisions

### Draft team AI

Each NBA team has a draft strategy:

- Best player available
- High-upside
- Ready now
- Positional need
- Defense first
- Shooting first
- International stash
- Market star

### Draft history pages

- Full draft by year
- Redrafts based on career value
- Busts
- Steals
- Best classes
- Most productive pick numbers
- Teams with best/worst draft records

---

## 11. Transactions

### NBA movement

- Trades
- Free agency
- Extensions
- Waivers
- G League assignments
- Draft rights
- Simplified salary cap and luxury tax

### International movement

- Transfers
- Contract expiration
- Buyouts
- Loans only if needed later
- NBA escape clauses
- Return-to-Europe clauses

### Transaction AI

A player evaluates:

- Salary
- minutes/role
- title chance
- development
- league prestige
- home-country preference
- coach relationship
- loyalty
- market size
- NBA ambition

A team evaluates:

- talent
- fit
- age curve
- contract value
- roster need
- marketability
- chemistry
- competitive window

---

## 12. Competition Pages

Every competition page has:

- Overview
- Schedule/results
- Standings/bracket
- Teams
- Players
- Statistics
- Awards
- History
- Records

NBA adds:

- Conferences
- Play-in
- Draft links
- Salary/transaction context

NCAA adds:

- Conferences
- AP-style ranking
- Tournament bracket
- Prospects
- Draft declarations

EuroLeague adds:

- Domestic club context
- Final Four
- cross-league transfer links

---

## 13. Player Page

Header:

- Name, nationality, age
- Team and league
- Position, height, weight, body type
- Primary/secondary role
- Rarity, base talent, current ability, potential
- Contract and draft information

Tabs:

- Overview
- Attributes
- Statistics
- Game log
- Career history
- Awards
- Transactions
- International career
- Historical standing

Career history rows must be clickable and show exact competition, team, games, statistics, awards, playoff result, and titles. No generic “won 3 stages/races” equivalent.

---

## 14. Team Page

Header:

- Team identity
- League
- Current record
- Power ranking
- Coach
- Payroll tier
- Contention status

Tabs:

- Overview
- Roster
- Rotation
- Results
- Statistics
- Transactions
- Draft assets
- History
- Records

Historical season rows:

- League record
- Playoff result
- Domestic/continental titles
- Coach
- Core players
- Major transactions
- Team identity

---

## 15. The Global Five

Weekly sections:

1. Five biggest stories
2. Results of the week
3. Players of the week
4. Power rankings
5. MVP races
6. Draft stock movement
7. Trade and transfer rumors
8. International watch
9. Historical milestone
10. Games to watch

Narratives should reference context rather than merely reporting numbers.

Examples:

- “At 20, Luka Petrovic has become the youngest EuroLeague player to average 20 points through December.”
- “Detroit has won 14 of 16 and is tracking toward its best season in 27 years.”
- “Former No. 1 pick Malik Benson is rebuilding his career in Valencia after falling out of the NBA rotation.”

---

## 16. Hall of Fame and Historical Scores

Store separate scores rather than one universal number.

- Global greatness
- NBA legacy
- European legacy
- International legacy
- Peak
- Longevity
- Playoff value
- Scoring
- Playmaking
- Defense
- Rebounding

This permits meaningful comparison without forcing every career into an NBA-only model.

---

## 17. Technical Architecture

Recommended stack:

- React + TypeScript + Vite
- Zustand or useReducer for state initially
- Deterministic seeded RNG
- IndexedDB for local saves
- Compression before persistence
- Neon/Postgres cloud saves in a later milestone

### Suggested folders

```text
src/
  app/
  components/
  data/
  engine/
    calendar/
    games/
    leagues/
    careers/
    draft/
    transactions/
    awards/
    history/
  features/
    world/
    results/
    tournaments/
    teams/
    players/
    draft/
    statistics/
    magazine/
    almanac/
  models/
  state/
  utils/
```

### Engine separation

The simulation engine must not depend on React. UI sends commands to the engine and renders resulting state/events.

```ts
advanceWeek(state): SimulationResult
simulateGame(game, context): GameResult
runDraft(state): DraftResult
processTransactions(state): TransactionResult
closeSeason(state): YearReviewState
openNextSeason(state): GameState
```

---

## 18. MVP Build Sequence

### Milestone 1 — Interactive shell

- Vite + React application shell
- World/Results/Tournaments/Teams/Players/Market/Statistics navigation
- Real-name NBA, selected NCAA and EuroLeague team data
- Player and team detail modals
- GitHub Pages deployment workflow

### Milestone 2 — Core NBA season

- Schedule
- standings
- possession-based statistical simulation
- playoffs
- awards
- year-end stop

### Milestone 3 — NCAA and draft

- 200-program starting-five NCAA model
- prospects and conference metadata
- national tournament
- lottery and 60-pick draft
- position-specific rookie replacement generation

### Milestone 4 — Transactions

- contracts
- trades
- free agency
- simplified cap
- team-building AI

### Milestone 5 — Europe

- EuroLeague
- six domestic leagues
- cross-competition clubs
- transfers and NBA movement

### Milestone 6 — Narrative/history

- The Global Five
- Almanac
- Hall of Fame
- records
- draft-class history

### Milestone 7 — International basketball

- national teams
- qualification
- World Cup
- continental championships
- Olympics

