# Basketball World Chronicle — Vite + React v0.4

A history-first global basketball simulator designed around the same core pleasure as Football World Chronicle and Peloton Chronicle: simulate seasons, follow careers, open any person/team/competition, and navigate the permanent history that the universe creates.

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

Long-run engine test:

```bash
npm run validate
```

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`.

1. Push the project to `main`.
2. Open **Settings → Pages** in GitHub.
3. Select **GitHub Actions** as the source.
4. The workflow builds the Vite project and publishes `dist`.

`vite.config.js` uses `base: './'`, so it works from a repository subpath.

## Current universe

- 30 NBA teams with real names and primary color palettes.
- 14 G League teams.
- 200 selected NCAA Division I programs.
- NCAA teams contain only five named starters: PG, SG, SF, PF and C.
- Every professional team contains exactly 10 active players.
- EuroLeague and EuroCup overlays on domestic clubs.
- Detailed domestic ecosystems for Spain, Greece, Turkey, Italy, France, Germany, Serbia, Lithuania, Israel and Russia.
- Detailed leagues/cups in Argentina, Brazil, Australia, Canada and China.
- High-level leagues in Japan, South Korea, the Philippines, Croatia, Slovenia, Poland, Belgium/Netherlands and Africa.
- Promotion and relegation in selected European countries.

Opening population:

- 402 teams.
- 1,000 NCAA players.
- 2,020 professional players.
- 3,020 active players.
- 402 locally weighted head coaches.

## Chronicle pages

### Player page

Every player keeps:

- Permanent rarity, base level, career length and career profile.
- Current ability, annual shape and complete career multiplier curve.
- Physical position, height, body type and basketball role.
- NBA Draft year, pick, origin and rights holder.
- Detailed annual line: team, competition, games, minutes, points, rebounds, offensive/defensive rebounds, assists, steals, blocks and shooting splits.
- Awards and statistical honors.
- Career timeline containing draft selections, signings, releases, draft-and-stash moves, overseas transfers, NBA returns and retirement.

This makes careers such as “failed NBA prospect → EuroLeague star → NBA return” permanently trackable.

### Team page

Every team keeps:

- Current 5/10-player roster.
- Coach and style.
- Current record, raw roster rating and league-adjusted world rating.
- Local-player count and minimum quota.
- Annual record/rating/coach breakdown.
- Trophy cabinet.
- Team transaction history.

### Competition page

Tournaments are selected through **region → competition**. Each competition has:

- Current standings and current leaders.
- Annual champions and finalists.
- MVP and Finals/Playoff MVP.
- Points, rebounds, assists, steals and blocks leaders.
- Historical top-10 points, rebounds and assists rankings.
- Teams with the most wins and titles.
- Click-through navigation to every player and team.

## Talent hierarchy

Talent is no longer generated uniformly.

- NBA teams receive the deepest concentration of Rare, Epic, Legend and Generational talent.
- EuroLeague teams form the second elite population.
- Strong domestic clubs sit below that level.
- NCAA contains mostly Common and Uncommon players, a smaller group of real prospects and only occasional elite talents.
- Team ratings include roster depth, coach value and league context.

The intended result is:

- Most of the world top 20 are NBA teams.
- A few elite European clubs can be stronger than the weakest NBA teams.
- An NCAA team cannot become the best team in the world because it happens to contain one exceptional prospect.

## NCAA, Draft and career movement

The 1,000 NCAA players are divided into four 250-player age cohorts. Approximately 250 players leave college every year.

- The NBA Draft always contains 60 picks.
- NBA teams draft two players but only zero, one or two normally join immediately.
- Unsigned picks remain visible as retained NBA rights.
- Draft-and-stash players can develop in the G League, Europe or another professional league.
- Undrafted graduates have ability-based chances of finding professional work.
- Many lower-level graduates leave the active basketball universe.
- Overseas stars can later join the NBA.
- Marginal NBA players can move abroad and receive larger roles.

## Local identity

Professional clubs must keep at least five local players. NBA clubs use USA/Canada as their local pool. New club-academy players are 80% local by default, and most coaches are generated from the team’s country.

This prevents European and international rosters from becoming collections of seven or eight former NCAA players after a few seasons.

## Validation

`npm run validate` advances the game through 10 full seasons and checks:

- 200 NCAA teams remain at exactly five players with one at every position.
- Every professional team remains at exactly 10 players.
- No NCAA player remains past the intended college age.
- Every professional team meets its local-player quota.
- Approximately 250 college exits and exactly 60 draft picks occur annually.
- Only a selective portion of draft picks joins the NBA immediately.
- NBA/EuroLeague/NCAA strength remains credible.
- Champions and MVPs rotate across multiple teams and players.
- Player, team and competition histories remain complete.

The source was JSX/JavaScript syntax-checked with TypeScript. This execution environment cannot access the public npm registry, so the production `dist` bundle must be generated locally or by GitHub Actions.
