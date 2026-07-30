# Basketball World Chronicle v0.6.1 — Deterministic Balance Report

## Test configuration

```text
Seeds:   20260729, 19860517, 424242
Length:  10 completed seasons per seed
Window:  2026 through 2035; next universe year opened in 2036
Total:   30 simulated seasons
```

Commands:

```bash
# Fast development check: two seeds × five seasons
npm run validate

# Full balance suite: three seeds × ten seasons
npm run validate:full
```

The engine completed the full thirty-season instrumented suite successfully. The packaged quick command also completed successfully and prints progress after every simulated season so it never appears frozen.

## Opening hierarchy

| Seed | NBA avg | EuroLeague avg | NCAA avg | Best Euro | Weakest NBA | Best NCAA | NBA teams in top 20 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260729 | 90.2 | 76.6 | 59.0 | 81.5 | 85.7 | 73.0 | 20 |
| 19860517 | 89.7 | 75.9 | 58.6 | 80.0 | 83.8 | 70.4 | 20 |
| 424242 | 89.4 | 76.3 | 58.8 | 78.6 | 85.6 | 73.0 | 20 |

The opening universe now establishes a clear global order:

- NBA is decisively first.
- EuroLeague is the second elite ecosystem but not almost equal to NBA.
- The strongest European club remains below the weakest NBA club in all three seeds.
- NCAA average remains low because the database contains 200 programs and only unfinished players.
- The strongest NCAA teams reach 70–73, much closer to elite Europe than the overall NCAA average.

## Hierarchy after ten seasons

| Seed | NBA avg | EuroLeague avg | NCAA avg | Best Euro | Weakest NBA | Best NCAA | NBA teams in top 20 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260729 | 90.0 | 75.5 | 59.1 | 77.0 | 86.2 | 75.0 | 20 |
| 19860517 | 89.7 | 75.5 | 59.0 | 77.4 | 86.8 | 75.0 | 20 |
| 424242 | 89.5 | 75.5 | 59.1 | 77.0 | 85.8 | 73.1 | 20 |

Observed long-run behavior:

- NBA retained a 14-point average advantage over EuroLeague.
- All global top-20 professional teams were NBA teams at the ten-year checkpoint.
- Elite NCAA programs remained approximately 0–4 points below the EuroLeague average, while the NCAA-wide average stayed near 59.
- The hierarchy did not collapse after repeated drafts, transfers and retirements.

## Permanent rarity and NCAA development

The validator checks every active player every season.

Passed in all tests:

- `rarity === birthRarity`
- `base === birthBase`
- No rarity promotions or demotions
- No permanent base changes
- Every NCAA multiplier remained between `0.75` and `0.89`
- NCAA-origin players moved to a separate `0.90–1.01` professional curve after leaving college

Rarity remains the permanent magical identity of the player. Development only changes how much of that permanent base is currently expressed.

## Annual elite generation

Each simulated offseason generated eight or ten Epic-or-better prospects.

| Seed | Average Epic+ births/year | NCAA share observed |
|---:|---:|---:|
| 20260729 | 8.6 | 50% every year |
| 19860517 | 9.0 | 50% every year |
| 424242 | 8.6 | 50% every year |

Passed in every simulated year:

```text
NCAA Epic+ births = international club Epic+ births
NBA Epic+ births  = 0
```

Elite NCAA recruits were weighted toward stronger programs and coaches, but the assignments remained stochastic rather than locked to one school.

## NBA generation and migration

Post-creation NBA-generated players:

| Seed | NBA spawns over ten seasons |
|---:|---:|
| 20260729 | 0 |
| 19860517 | 0 |
| 424242 | 0 |

NBA teams completed their rosters using only existing players through draft, rights activation, free agency and transfers.

Elite-retention results after ten seasons:

| Seed | Legend/Generational players in non-NBA pro leagues | Mature Generational outside NBA | 89+ current outside NBA |
|---:|---:|---:|---:|
| 20260729 | 1 young prospect | 0 | 0 |
| 19860517 | 1 young prospect | 0 | 0 |
| 424242 | 0 | 0 | 0 |

The two non-NBA elite exceptions were newly generated young prospects who had not yet reached draft/migration age. No mature Generational player remained outside the NBA, and no 89+ player remained sustainably outside the NBA.

## Draft and graduate pipeline

Latest draft in each ten-season universe:

| Seed | NCAA exits | NCAA picks | International picks | Immediate NBA signings |
|---:|---:|---:|---:|---:|
| 20260729 | 257 | 46 | 14 | 8 |
| 19860517 | 252 | 46 | 14 | 11 |
| 424242 | 252 | 46 | 14 | 10 |

Every tested season produced:

- 230–280 NCAA exits
- Exactly 60 draft picks
- Exactly 46 NCAA selections
- Exactly 14 international selections
- Selective immediate NBA entry
- At least 170 undrafted college exits entering free agency or leaving active basketball
- Retained NBA rights for draft-and-stash careers

The NBA does not absorb all graduating players. Most college exits must find a G League or international opportunity, remain unsigned or leave professional basketball.

## Championship and MVP diversity

| Seed | NBA champions | NBA MVPs | Most NBA titles by one team | EuroLeague champions | EuroLeague MVPs | Most EuroLeague titles by one team |
|---:|---:|---:|---:|---:|---:|---:|
| 20260729 | 7 | 7 | 3 | 8 | 10 | 2 |
| 19860517 | 8 | 10 | 2 | 9 | 10 | 2 |
| 424242 | 9 | 9 | 2 | 9 | 10 | 2 |

No permanent dynasty monopolized either flagship competition. Team quality remained meaningful, but title and MVP outcomes rotated.

## Roster identity

Passed in all 30 simulated seasons:

- 200 NCAA programs with exactly five players
- One NCAA player at every position
- Every professional club at exactly ten players after the offseason
- Every national team at ten eligible players
- Every professional club meeting its local-player minimum
- No non-NBA professional club exceeding its NCAA-alumni cap
- Every active professional player holding the correct contract

## Coaches, owners and international tournaments

Every seed produced:

- Coach firings
- Contract expiries
- Coaching free agency and new appointments
- Coach retirements
- Completed ownership mandates
- Archived former presidents/owners
- Player retirements and unsuccessful exits

International cadence over ten seasons per seed:

- FIBA World Cup: 3 editions
- Olympic Basketball Tournament: 2 editions
- EuroBasket: 3 editions
- AmeriCup, Asia Cup and AfroBasket followed their corresponding cycles

Every completed edition retained standings, champion, finalist, MVP, Finals MVP, statistical leaders and bracket.

## Performance and validation visibility

The validator now prints progress after every season. The quick suite is the default development command; the full thirty-season suite is available separately because runtime varies significantly across machines and constrained build environments.

Roster restrictions are computed once per signing decision, and NBA/G League roster completion searches existing markets instead of creating emergency players.

## Conclusion

The v0.6.1 model now matches the intended basketball world:

- NBA is the clear final destination for top talent.
- NBA teams never use academies after universe creation.
- NCAA generates exactly half of future Epic, Legend and Generational talent.
- College players remain incomplete through a dedicated development cap.
- Top NCAA programs can look special without becoming professional superteams.
- Europe develops elite players but normally loses mature superstars to NBA.
- Rare long European careers remain possible for selected Legend/Epic exceptions.
- Rarity and base level never change.
- Draft, rights, free agency, transfers and career histories remain fully trackable.
