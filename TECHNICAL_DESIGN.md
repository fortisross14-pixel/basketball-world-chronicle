# Basketball World Chronicle — Technical Design v0.4

## 1. Product goal

Basketball World Chronicle is an observer-driven global basketball history simulator. Its main value is not tactical control of one team; it is the creation of navigable careers, dynasties, disappointments, transfers, draft classes, competition histories and cross-league debates.

The central loop is:

1. Advance the universe by one week, four weeks or to year review.
2. Inspect results, standings, leaders and stories.
3. Open any competition, team or player.
4. Follow permanent annual histories and honors.
5. Stop at year review.
6. Run the draft, player market, retirements, promotion/relegation and new spawns.
7. Begin the next season.

## 2. Technical platform

- Vite single-page application.
- React UI.
- Pure JavaScript simulation engine.
- Static GitHub Pages deployment.
- No backend dependency in v0.4.
- Deterministic seeded opening universe plus persistent in-memory state during play.

Key files:

```text
src/App.jsx                    UI and Chronicle detail pages
src/styles.css                 visual system and responsive layouts
src/game/universe.js           generation, simulation, draft and market engine
src/data/teamData.js           real team names and color palettes
src/data/competitionData.js    competition definitions and hierarchy
scripts/validate.mjs           multi-season balance and integrity checks
```

## 3. Navigation architecture

Global simulation controls sit above the menus. They are not a navigation section.

Primary menus:

- World
- Results
- Tournaments
- Teams
- Players
- Market
- Statistics
- The Global Five
- Almanac

Detail pages are opened inside the main application:

- Player page
- Team page
- Competition page

Every table and ranking uses click-through navigation so the user can move naturally from a draft pick to his player page, from the player to his former team, and from that team to a competition history.

## 4. Universe structure

### Opening population

| Layer | Teams | Players per team | Total players |
|---|---:|---:|---:|
| NBA | 30 | 10 | 300 |
| NBA G League | 14 | 10 | 140 |
| NCAA selected Division I | 200 | 5 | 1,000 |
| European and international professional teams | 158 | 10 | 1,580 |
| **Total** | **402** | — | **3,020** |

Every team also has one generated head coach.

### NCAA abstraction

The NCAA contains 200 selected Division I programs. Each school has only its relevant starting five:

```text
PG · SG · SF · PF · C
```

The 1,000 players are divided into four equal age cohorts:

```text
250 age 18
250 age 19
250 age 20
250 age 21
```

This produces roughly 250 scheduled college exits every season before a small number of early declarations.

### Professional roster rule

Every professional team has exactly 10 active players. The normal roster target is two players at each position, although market movement can temporarily create imbalance before the annual roster fill.

## 5. Competition hierarchy

### North America

- NBA
- NBA G League
- NCAA Division I
- NCAA Tournament
- CEBL Canada
- CEBL Championship Weekend

### Continental Europe

- EuroLeague
- EuroCup

### Detailed European countries

Each detailed country can contain a primary league, domestic cup, supercup and second tier where appropriate.

- Spain: Liga ACB, Copa del Rey, Supercopa Endesa, Primera FEB
- Greece: Greek League, Greek Cup, Greek Super Cup, Greek A2
- Turkey: Turkish BSL, Turkish Cup, Presidents Cup, Turkish TBL
- Italy: Lega Basket Serie A, Italian Cup, Italian Super Cup, Serie A2
- France: LNB Pro A, French Cup, Champions Match, Pro B
- Germany: Basketball Bundesliga, German Cup, Champions Cup, ProA
- Serbia: Adriatic League participation, Serbian Cup, Serbian Super Cup, KLS
- Lithuania: LKL, King Mindaugas Cup, Lithuanian Super Cup, NKL
- Israel: Premier League, State Cup, Winner Cup, National League
- Russia: VTB United League, Russian Cup, VTB Super Cup, Superleague

### Detailed non-European countries

- Argentina: Liga Nacional, Copa Super 20, Supercopa
- Brazil: NBB, Copa Super 8, Supercopa
- Australia: NBL, NBL Cup, Champions Game
- Canada: CEBL and Championship Weekend
- China: CBA, CBA Cup, CBA Super Cup

### High-level simulation

- Japan
- South Korea
- Philippines
- Croatia
- Slovenia
- Poland
- Belgium/Netherlands
- African Basketball League

## 6. Competition page data model

Each competition stores annual season objects:

```js
{
  year,
  competitionId,
  championTeamId,
  champion,
  runnerUpTeamId,
  runnerUp,
  mvp,
  finalsMvp,
  leaders: {
    points,
    rebounds,
    assists,
    steals,
    blocks
  },
  standings: [],
  playerStats: []
}
```

The page has four tabs:

### Overview

- Current standings
- Current top scorer
- Current top rebounder
- Current top playmaker

### Seasons

Annual rows containing:

- Champion
- Runner-up
- MVP
- Finals or playoff MVP
- Points leader
- Rebounds leader
- Assists leader

### Rankings

All-time top 10:

- Total points
- Total rebounds
- Total assists
- Team wins
- Team titles

### Teams

Current participating teams with rating, record and title count.

## 7. Team page data model

Each team stores:

```js
{
  rosterIds,
  coachId,
  rating,
  rawRating,
  seasonRecords,
  history,
  honors,
  transactions,
  localMinimum
}
```

### Team page tabs

- Overview
- Seasons
- Honors
- Transactions

The annual breakdown contains:

- Year
- Domestic competition
- Wins and losses
- Team rating
- Coach
- Titles won

The trophy cabinet stores every competition championship independently.

## 8. Player page data model

Permanent creation data:

- Rarity
- Base ability
- Career length
- Career profile
- Career multiplier curve
- Position
- Height
- Body type
- Basketball role
- Nationality
- First team

Annual performance data:

- Team
- Competition
- Age
- Current ability
- Games
- Minutes
- PPG
- RPG
- Offensive rebounds
- Defensive rebounds
- APG
- Steals
- Blocks
- FG%
- 3P%
- FT%
- Honors

Career-specific data:

- NBA Draft year
- Pick
- Drafting team
- Draft origin
- NBA rights holder
- First NBA season
- Career timeline
- Permanent honors list

### Player page tabs

- Overview
- Career
- Honors
- Timeline

This structure supports careers such as:

```text
NCAA star
→ drafted by San Antonio
→ two limited NBA seasons
→ released
→ signs with Panathinaikos
→ EuroLeague MVP
→ later NBA return or European retirement
```

No part of that journey is lost when the player changes teams.

## 9. Player ability model

### Permanent identity

```text
rarity + base ability + career length + career profile
```

These never change.

### Annual current ability

```text
current ability = base × career-year multiplier × annual shape
```

Career profiles:

- Young prodigy
- Classic prime
- Late bloomer
- Early peak
- Durable veteran
- Volatile talent

Annual shape normally falls between 0.95 and 1.01.

### Rarity bands

| Rarity | Base range | Typical career |
|---|---:|---:|
| Common | 66–72 | 6–10 years |
| Uncommon | 73–78 | 7–11 years |
| Rare | 79–83 | 8–12 years |
| Epic | 84–88 | 10–13 years |
| Legend | 89–93 | 12–15 years |
| Generational | 94–98 | 14–18 years |

## 10. League-calibrated talent generation

Talent is not distributed uniformly.

### NBA

- Greatest concentration of Rare, Epic, Legend and Generational players.
- Highest roster depth.
- Positive league-strength adjustment in global team ratings.

### EuroLeague

- Second strongest population.
- Top clubs can exceed the weakest NBA teams.
- Less elite depth than the NBA across all roster spots.

### Domestic professional leagues

- Strong local players.
- A limited number of elite imports.
- Top teams can produce EuroLeague-level lineups.

### NCAA

- Mostly Common and Uncommon players.
- A smaller group of Rare prospects.
- Occasional Epic, Legend or Generational prospect.
- Negative team-level context adjustment prevents an NCAA roster from being ranked as the best professional team in the world.

## 11. Team rating model

Two values are stored:

### Raw rating

Weighted current ability of the best rotation players.

### World rating

```text
raw rotation rating
+ coach contribution
+ league-strength context
```

League context is intentionally strong enough to represent NBA depth while still allowing a top EuroLeague club to exceed a weak NBA roster.

## 12. Local-player and coach identity

Professional teams require at least five local players.

- Non-NBA local identity is the team’s country.
- NBA local identity is USA/Canada.
- Replacement academies prioritize local generation.
- A foreign player cannot join a full roster if doing so would break the quota.
- Most coaches are generated from the team’s country.

This prevents long-term international rosters from becoming dominated by former NCAA players.

## 13. Draft and rights pipeline

### Draft pool

- Scheduled NCAA exits
- Selected early NCAA declarations
- Elite international prospects aged 19–22

### Draft

- 60 picks
- Two rounds
- Two selections per NBA team

### Signing decision

A drafted player does not automatically join the NBA.

Decision factors:

- Current ability
- Draft round
- NBA team vacancy
- Comparison with the weakest roster player
- Random uncertainty

Each team can add zero, one or two drafted players.

### Draft rights

Every pick receives:

```js
{
  playerId,
  teamId,
  acquiredYear,
  active
}
```

Unsigned drafted players can:

- Remain at an international club
- Enter the G League
- Sign in Europe or another professional league
- Join the NBA later when their rights are activated
- Leave basketball, causing the rights to expire

## 14. Undrafted NCAA exits

Professional placement probability depends on current ability.

- Elite undrafted player: strong chance of a professional contract
- Good player: possible G League or international contract
- Marginal player: low probability of remaining in the simulated universe
- Weak player: normally leaves active basketball

This prevents every international team from becoming full of former college players.

## 15. International career movement

### NBA to international basketball

A player can move abroad when:

- He has spent multiple seasons in the NBA
- His ability/minutes are not enough for a meaningful NBA role
- A foreign team can offer a larger role

### International basketball to NBA

An overseas player can receive an NBA opportunity when:

- He becomes one of the strongest non-NBA players
- He is in a plausible age range
- An NBA roster has a vacancy or weak player
- His rights holder activates retained draft rights, or he signs as a free agent

## 16. Promotion and relegation

Selected countries use annual promotion and relegation.

Process:

1. Find the lowest eligible top-tier team.
2. Find the strongest second-tier team.
3. Swap their competition and tier values.
4. Update every active player’s competition data.
5. Record the movement in the permanent promotion history.

EuroLeague teams are currently protected from automatic domestic relegation.

## 17. Annual finalization

At the end of week 40:

1. Finalize every competition.
2. Select champions and runners-up.
3. Select MVPs and finals MVPs.
4. Store statistical leaders.
5. Store complete competition player-stat snapshots.
6. Add player honors.
7. Add team honors.
8. Add coach honors.
9. Add one annual row to every player history.
10. Add one annual row to every team history.
11. Stop at year review.

The new year does not begin automatically.

## 18. Year rollover

After the user advances:

1. Age professional players.
2. Retire players whose career curves end.
3. Identify the NCAA exit class.
4. Run the 60-pick NBA Draft.
5. Sign a selective number of picks.
6. Retain rights for unsigned picks.
7. Place or archive undrafted graduates.
8. Age remaining college players.
9. Run NBA/international movement.
10. Run promotion and relegation.
11. Enforce local quotas.
12. Fill NCAA positional vacancies with age-18 freshmen.
13. Fill professional rosters to 10.
14. Recalculate team ratings.
15. Reset season records.
16. Begin the next year.

## 19. Balance controls

### Dynasty control

Recent champions receive a small title-fatigue penalty during title selection. This does not prevent dynasties, but it prevents one strong roster from winning automatically every year.

### MVP control

Recent MVP winners receive a repeat penalty. Truly dominant players can still repeat, but awards should circulate among several plausible stars over a decade.

### Strength hierarchy validation

The automated test requires:

- NBA average substantially above EuroLeague average
- At least 18 NBA teams in the opening global top 20
- No NCAA team stronger than the weakest NBA team
- At least one top European team stronger than the weakest NBA team

### Long-run integrity validation

The 10-season test checks:

- Exactly 200 NCAA teams
- Exactly five players and one of each position per NCAA team
- Exactly 10 players per professional team
- No over-age NCAA players
- Local-player quotas
- Roughly 250 college exits
- Exactly 60 draft picks
- Selective immediate NBA signings
- Complete player/team/competition histories
- Multiple champions and MVP winners

## 20. Current boundary and next systems

v0.4 establishes the Chronicle architecture and long-run universe logic. The next highest-value systems are:

- Actual scheduled matchups and individual box scores
- Play-in and playoff brackets
- EuroLeague Final Four presentation
- NCAA bracket presentation
- Contracts and simplified salary cap
- Trade value and roster-needs AI
- Injuries and availability
- All-league teams and defensive awards
- Hall of Fame scoring and category pages
- Save slots and cloud synchronization
- National teams and international tournaments
