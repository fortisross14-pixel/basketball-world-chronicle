# Engine notes · v1.04

Engine-only release: no new screens. This file lists what changed in the
simulation and the **data the UI can now show**, for whoever builds the UI pass.

## What changed in the simulation

| Area | Change | Where |
|---|---|---|
| Draft balance | College prospects are scouted on projected pro level; overseas prospects carry a small scouting-risk discount. College players now take about half of top-10 picks (was about 5%). | `draftScore` in `universe.js` |
| Trade deadline | Week 22 of every season: 3–6 NBA deals, contenders trading youth for veterans. | `runDeadlineTrades`, `TRADE_DEADLINE_WEEK` |
| Veteran market | NBA veterans (29+, under 84 OVR) sign 1–2 year deals; fringe veterans are re-signed less often; a club that just let a player go is the least likely to sign him back. | `assignContract`, `processContractExpiries`, `freeAgentScore` |
| European crossover | EuroLeague / EuroCup / Adriatic stars (MVP, best-five, stat leaders in the last two seasons) draw NBA offers, scaled by personal NBA drive. | `runEuroCrossovers` |
| NBA drive | Every player has `nbaDrive` (−0.2..+0.2); `nbaPreference` = rarity baseline + drive. | `nbaPreferenceFor` |
| European lifers | About 15% of Europe's Rare and Epic club talents (8% of Legends) never want the NBA. | `createPlayer` |
| Homecoming | International NBA veterans (30+, 3+ NBA seasons) sometimes return to the top club in their home country. | `runHomecomings` |
| Draft busts | 8% of college top-10 picks bust (40% for "Volatile talent"); their curve stalls and teams stop valuing their upside two years after the draft. Legends, Generationals and historical identities never bust. | `maybeMarkDraftBust`, `bustWrittenOff` |
| Late bloomers | The curve peaks at 28–31 and the career runs 2 years longer. | `createCareerCurve`, `createPostCollegeCurve` |
| Ghost careers | Generated prospects who never played, never moved and were never drafted are removed instead of archived as "retired". | `isGhostProspect` |
| Speed | Active-player lookups use a cached index. The simulation runs about 2–3× faster than v1.03. | `playerIndex` / `findActivePlayer` |
| Save size | Saves are gzip-compressed JSON (about 10× smaller; a 20-season world is about 20 MB). Old uncompressed saves still load. Competition stat tables older than 5 seasons keep only notable players; team transaction logs keep their latest 80. | `saveDb.js`, `compactArchives` |

## New data for the UI

### Storylines — `universe.storylines` (newest first, capped at 600)
```js
{ key, type, group, year, week, phase, title, body, playerId?, teamId?, competitionId?, score }
```
- `group`: `Games` (STREAK, SKID, TOP SPOT), `Moves` (DEADLINE, JOURNEYMAN, CROSSOVER, HOMECOMING, UNDRAFTED) or `Legacy` (MILESTONE, TRIPLE CROWN, WORLD CHAMPION, ONE-CLUB DECADE).
- `score` (50–95) is an importance hint for ordering or highlighting.
- Helper: `latestStorylines(universe, { limit, group, year })` from `src/game/storylines.js`.
- Ideal for a ticker in the sim progress pop-up, a "This week" panel and the magazine.

### Followed-player feed — `universe.followNews` (newest first, capped at 300)
```js
{ year, week, phase, playerId, player, type, title, body }   // type: MOVE | HONOR | MILESTONE | RETIREMENT | DEPARTURE
```
- Filled automatically for every id in `universe.followedPlayerIds`.
- Helper: `followedPlayerFeed(universe, { limit, playerId })`.

### Milestones — `universe.milestones` (permanent)
```js
{ key, year, type, playerId, player, title, body }
```

### Deadline stints in player history
A season row of a player traded at the deadline now carries the earlier clubs:
```js
history[i] = { year, teamId, team, games /* games for the final club only */, ..., stints: [{ teamId, team, competitionId, competition, games, ppg, rpg, apg }] }
```
The Career table currently shows only the final club; render `stints` as extra rows (like a "TOT" breakdown) if wanted. `careerStints()` and `careerFacts()` in `careerArcs.js` already include them.

### Other new fields
- `player.draftBust` (boolean, hidden "truth"; better not shown directly) and `player.nbaDrive`.
- `offseasonHistory[i].deadlineTrades`: in-season deals for that year (summer `nbaTrades` excludes them).
- Transactions from the deadline have `type: 'NBA trade'` and a detail that starts with `Trade deadline.`; the new `Homecoming` transaction type is a return home.

## Tools
- `node scripts/validate.mjs` (full) or `BWC_QUICK=1 node scripts/validate.mjs` (quick). New checks cover deadline deals, recorded stints, storyline volume and no empty archived careers.
- The career audit (`tools/career-audit.mjs` in the working folder, outside the game zip) reports arc counts over 20 seasons using the game's own tagger.
