# Basketball World Chronicle v0.8.0 — Deterministic Balance Report

## Test suites

### Quick suite

```text
2 seeds × 3 completed seasons
2026 opening → 2029
```

Results:

| Seed | NBA avg | EuroLeague avg | NCAA avg | NBA champions | NBA MVPs | EuroLeague champions | EuroLeague MVPs | Latest draft NCAA/Intl | Immediate NBA signings |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260729 | 89.0 | 75.8 | 58.8 | 3 | 3 | 2 | 3 | 46 / 14 | 14 |
| 19860517 | 89.5 | 75.9 | 59.2 | 3 | 2 | 3 | 3 | 46 / 14 | 13 |

### Full suite

```text
1 seed × 8 completed seasons
2026 opening → 2034
```

| Seed | NBA avg | EuroLeague avg | NCAA avg | NBA champions | NBA MVPs | EuroLeague champions | EuroLeague MVPs | Latest draft NCAA/Intl | Immediate NBA signings |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260729 | 89.2 | 75.7 | 59.0 | 7 | 5 | 4 | 8 | 46 / 14 | 12 |

## Universe integrity

Passed at opening and after every offseason:

- 30 NBA teams.
- 31 G League teams.
- 200 NCAA programs.
- 474 other professional clubs.
- 75 national teams.
- Every professional team has exactly 10 contracted players.
- Every NCAA team has exactly five players, one at every position.
- Every national roster contains 10 eligible players.
- Every team has a correctly assigned coach and president/owner.
- Every non-NBA club meets its local-player minimum.
- EuroLeague clubs have at most four NCAA alumni.
- Other international clubs have at most three NCAA alumni.

## Permanent rarity

Every active player was checked every season:

```text
rarity === birthRarity
base   === birthBase
```

No promotion, demotion or permanent-base rewrite occurred.

Controlled active elite population remained:

```text
Generational 3
Legend      12
Epic        30
```

Historical-name mix remained inside the target bands:

```text
Generational 1–2 / 3
Legend       6–8 / 12
Epic         9–13 / 30
```

## NCAA development

Passed every season:

- Every college multiplier stayed between `0.75` and `0.89`.
- NCAA players switched to the separate adult curve after leaving college.
- No NCAA player remained after the age limit.
- Strong NCAA programs could contain elite future talent without ranking above NBA teams.

## NBA destination behavior

Passed:

- Post-opening NBA spawns: zero.
- Every NBA arrival came through draft, rights, free agency, trade, G League or international recruitment.
- Mature Generational players outside NBA: zero.
- Sustained 89+ players outside NBA: zero.
- NBA average stayed roughly 13 points above EuroLeague.
- At least 17 of the global top 20 professional teams remained NBA teams.
- The best EuroLeague club stayed below the weakest NBA club in the test checkpoints.

## Draft and graduate pipeline

Every completed draft produced:

```text
60 total selections
approximately 46 NCAA
approximately 14 international / G League
230–280 college exits
selective immediate NBA signings
```

The remaining graduates moved into international basketball, G League, visible free agency or archived exits rather than silently disappearing.

## International basketball

Validated active fields:

```text
EuroBasket 24
AmeriCup   12
Asia Cup   16
AfroBasket 16
```

World Cup and Olympics activate only in their scheduled years.

USA AmeriCup validation passed:

- No more than two of the top five American NBA stars attended.
- At least three notable absences were recorded with visible reasons.

## Competitive diversity

Across eight seasons:

- NBA produced seven different champions and five different MVPs.
- EuroLeague produced four different champions and eight different MVPs.
- No single team exceeded the dynasty cap used by validation.
- NBA, EuroLeague, Liga ACB and NCAA Tournament all retained completed brackets, Finals/playoff MVPs and statistical leaders.

## Performance

The complete eight-season deterministic suite completed without the former season-seven cloning stall.

The engine no longer structured-clones the entire expanding universe before each simulation or offseason action. This preserves React updates while keeping long-save performance practical.
