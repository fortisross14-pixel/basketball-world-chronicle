// ─────────────────────────────────────────────────────────────────────────────
// Career arcs (v1.03). Reads a player's season history, draft, honors and
// international record and names the kind of career it is: the European star
// who crossed to the NBA, the journeyman on his sixth NBA team, the college
// player who built a career overseas. Pure functions: safe to use in the UI,
// the validator and the career audit script.
// ─────────────────────────────────────────────────────────────────────────────

export const ARC_DEFINITIONS = [
  { id: 'triple-crown', label: 'Triple Crown', icon: '👑', blurb: 'Won the NCAA Tournament, the EuroLeague and the NBA.' },
  { id: 'world-champion', label: 'World Champion', icon: '🥇', blurb: 'An NBA title plus Olympic or World Cup gold.' },
  { id: 'crossover', label: 'European Crossover', icon: '🌉', blurb: 'Made his name in Europe first, then played in the NBA.' },
  { id: 'prodigy', label: 'Prodigy', icon: '✨', blurb: 'An MVP award in the NBA, a European cup or a world tournament at 21 or younger.' },
  { id: 'journeyman', label: 'Journeyman', icon: '🧳', blurb: 'Played for four or more NBA franchises.' },
  { id: 'globetrotter', label: 'Globetrotter', icon: '🌍', blurb: 'Club basketball in five or more countries, or on three continents.' },
  { id: 'undrafted', label: 'Undrafted to NBA', icon: '🔥', blurb: 'Nobody drafted him out of college; he still had an NBA career.' },
  { id: 'gleague-riser', label: 'G League Riser', icon: '📈', blurb: 'Worked his way up from the G League to a real NBA career.' },
  { id: 'homecoming', label: 'Homecoming', icon: '🏠', blurb: 'Returned to a club in his home country after his NBA years.' },
  { id: 'late-bloomer', label: 'Late Bloomer', icon: '🌱', blurb: 'Kept improving well past 24 and peaked at 28 or later.' },
  { id: 'one-club', label: 'One-Club Icon', icon: '🏛️', blurb: 'Ten or more professional seasons, all with the same club.' },
  { id: 'overseas-pro', label: 'Overseas Pro', icon: '✈️', blurb: 'Played college basketball, never reached the NBA, built a career abroad.' },
  { id: 'never-crossed', label: 'Never Crossed', icon: '⚓', blurb: 'Drafted by an NBA team but never played a game there.' },
  { id: 'draft-bust', label: 'Draft Bust', icon: '💥', blurb: 'A top-10 college pick whose NBA career was over within four seasons.' },
];
export const ARC_BY_ID = new Map(ARC_DEFINITIONS.map((arc) => [arc.id, arc]));

const RARITY_WEIGHT = { Common: 0, Uncommon: 1, Rare: 2, Epic: 4, Legend: 7, Generational: 10 };
const MVP_TYPES = new Set(['MVP', 'Finals MVP', 'Playoff MVP']);
const MAJOR_COMPETITIONS = new Set(['nba', 'euroleague', 'eurocup', 'adriatic-league', 'americas-champions-league', 'olympic-basketball-tournament', 'fiba-world-cup']);

export function teamIndex(universe) {
  return new Map((universe?.teams ?? []).map((team) => [team.id, team]));
}

function leagueClass(team) {
  if (!team) return 'Other';
  if (team.type === 'NBA') return 'NBA';
  if (team.type === 'GLeague') return 'G League';
  if (team.type === 'NCAA') return 'NCAA';
  if (team.region === 'Europe') return 'Europe';
  return 'Other';
}

// Consecutive seasons with the same club, oldest first.
export function careerStints(player, teams) {
  const stints = [];
  const add = (teamId, name, year) => {
    const team = teams.get(teamId);
    const last = stints[stints.length - 1];
    if (last && last.teamId === teamId) { if (last.to !== year) { last.to = year; last.seasons += 1; } return; }
    stints.push({ teamId, team: name, from: year, to: year, seasons: 1, league: leagueClass(team), country: team?.country ?? null, region: team?.region ?? null, color: team?.color ?? null });
  };
  // Deadline trades leave earlier clubs of a season in season.stints (v1.04).
  (player.history ?? []).forEach((season) => {
    (season.stints ?? []).forEach((stint) => add(stint.teamId, stint.team, season.year));
    add(season.teamId, season.team, season.year);
  });
  return stints;
}

// Summary numbers the arcs (and record boards) are built from.
export function careerFacts(player, teams) {
  const seasons = (player.history ?? []).map((season) => ({ ...season, league: leagueClass(teams.get(season.teamId)), club: teams.get(season.teamId) }));
  const pro = seasons.filter((season) => season.league !== 'NCAA');
  const nba = seasons.filter((season) => season.league === 'NBA');
  const firstNbaYear = nba.length ? Math.min(...nba.map((season) => season.year)) : null;
  const lastNbaYear = nba.length ? Math.max(...nba.map((season) => season.year)) : null;
  const honors = player.honors ?? [];
  const titles = honors.filter((honor) => honor.category === 'team' || honor.type === 'Team title');
  const titleIn = (id) => titles.some((honor) => honor.competitionId === id);
  const intlGold = (player.internationalHistory ?? []).some((row) => row.result === 'Champion' && /olympic|world-cup/.test(row.competitionId ?? ''));
  const ageIn = (year) => seasons.find((season) => season.year === year)?.age ?? null;
  const peak = seasons.reduce((best, season) => (Number(season.current) > Number(best?.current ?? -1) ? season : best), null);
  const early = seasons.filter((season) => Number(season.age) <= 24).map((season) => Number(season.current));
  const spells = seasons.flatMap((season) => [...(season.stints ?? []).map((stint) => ({ teamId: stint.teamId, club: teams.get(stint.teamId) })), { teamId: season.teamId, club: season.club }])
    .map((spell) => ({ ...spell, league: leagueClass(spell.club) })).filter((spell) => spell.league !== 'NCAA');
  return {
    seasons, pro, nba, firstNbaYear, lastNbaYear,
    nbaTeams: new Set(spells.filter((spell) => spell.league === 'NBA').map((spell) => spell.teamId)).size,
    proClubs: new Set(spells.map((spell) => spell.teamId)).size,
    countries: new Set(spells.map((spell) => spell.club?.country).filter(Boolean)).size,
    continents: new Set(spells.map((spell) => spell.club?.region).filter(Boolean)).size,
    europeBeforeNba: seasons.filter((season) => season.league === 'Europe' && (firstNbaYear == null || season.year < firstNbaYear)).length,
    gLeagueBeforeNba: seasons.filter((season) => season.league === 'G League' && firstNbaYear != null && season.year < firstNbaYear).length,
    abroad: pro.filter((season) => season.club && season.club.type === 'Pro' && season.club.region !== 'North America').length,
    homeAfterNba: lastNbaYear != null && pro.some((season) => season.year > lastNbaYear && season.club?.country === player.nationality),
    titles: titles.length,
    nbaTitle: titleIn('nba'), euroleagueTitle: titleIn('euroleague'), ncaaTitle: titleIn('ncaa-tournament'), intlGold,
    euroleagueStarBeforeNba: honors.some((honor) => honor.competitionId === 'euroleague' && honor.category !== 'team' && (firstNbaYear == null || honor.year < firstNbaYear)),
    youngMvp: honors.some((honor) => MVP_TYPES.has(honor.type) && MAJOR_COMPETITIONS.has(honor.competitionId) && (ageIn(honor.year) ?? 99) <= 21),
    peakCurrent: Number(peak?.current ?? 0), peakAge: Number(peak?.age ?? 0),
    earlyBest: early.length ? Math.max(...early) : null,
  };
}

export function careerArcs(player, teams) {
  if (!player?.history?.length) return [];
  const f = careerFacts(player, teams);
  const arcs = [];
  const add = (id, detail, strength = 0) => arcs.push({ ...ARC_BY_ID.get(id), detail, strength });
  const ncaa = player.originRoute === 'NCAA';
  const pick = Number(player.draft?.pick) || null;

  if (f.ncaaTitle && f.euroleagueTitle && f.nbaTitle) add('triple-crown', 'NCAA, EuroLeague and NBA champion', 30);
  if (f.nbaTitle && f.intlGold) add('world-champion', 'NBA title and international gold', 20);
  if (player.region === 'Europe' && f.europeBeforeNba >= 3 && f.nba.length >= 2) add('crossover', `${f.europeBeforeNba} seasons in Europe → ${f.nba.length} in the NBA${f.euroleagueStarBeforeNba ? ' · EuroLeague star first' : ''}`, f.nba.length + (f.euroleagueStarBeforeNba ? 6 : 0));
  if (f.youngMvp) add('prodigy', 'Major MVP award at 21 or younger', 12);
  if (f.nbaTeams >= 4) add('journeyman', `${f.nbaTeams} NBA franchises`, f.nbaTeams * 2);
  if (f.countries >= 5 || (f.continents >= 3 && f.countries >= 4)) add('globetrotter', `${f.countries} countries · ${f.continents} continents`, f.countries + f.continents);
  if (ncaa && !player.draft && f.nba.length >= 3) add('undrafted', `Undrafted · ${f.nba.length} NBA seasons`, f.nba.length);
  if (f.gLeagueBeforeNba >= 2 && f.nba.length >= 3) add('gleague-riser', `${f.gLeagueBeforeNba} G League seasons → ${f.nba.length} NBA seasons`, f.nba.length);
  if (!['USA', 'Canada'].includes(player.nationality) && f.nba.length >= 3 && f.homeAfterNba) add('homecoming', `Back home after ${f.nba.length} NBA seasons`, f.nba.length);
  if (f.peakAge >= 28 && f.peakCurrent >= 78 && f.earlyBest != null && f.peakCurrent - f.earlyBest >= 6) add('late-bloomer', `Peaked at ${f.peakCurrent} aged ${f.peakAge}`, f.peakCurrent - f.earlyBest);
  if (f.pro.length >= 10 && f.proClubs === 1) add('one-club', `${f.pro.length} seasons with ${f.pro[0].club?.name ?? f.pro[0].team}`, f.pro.length);
  if (ncaa && !f.nba.length && f.abroad >= 3) add('overseas-pro', `${pick ? `Drafted #${pick}` : 'Undrafted'} · ${f.abroad} seasons abroad`, f.abroad);
  if (!ncaa && player.draft && !f.nba.length && f.pro.length >= 4) add('never-crossed', `Drafted #${pick} by ${player.draft.team} · never came over`, 10 - Math.min(9, Math.floor((pick ?? 60) / 6)));
  if (ncaa && pick && pick <= 10 && f.nba.length <= 4 && f.pro.length >= f.nba.length + 2) add('draft-bust', `#${pick} pick · ${f.nba.length} NBA season${f.nba.length === 1 ? '' : 's'}`, 11 - pick);
  return arcs;
}

// How notable a career is, used to order arc examples.
export function careerProminence(player) {
  const honors = player.honors ?? [];
  return (RARITY_WEIGHT[player.rarity] ?? 0) * 3 + honors.length * 0.6 + honors.filter((honor) => MVP_TYPES.has(honor.type)).length * 3 + (player.history?.length ?? 0) * 0.3;
}

// Tags every player in the universe (active and retired) once.
export function tagUniverseCareers(universe) {
  const teams = teamIndex(universe);
  const byArc = new Map(ARC_DEFINITIONS.map((arc) => [arc.id, []]));
  const byPlayer = new Map();
  [...(universe?.players ?? []), ...(universe?.retiredPlayers ?? [])].forEach((player) => {
    const arcs = careerArcs(player, teams);
    if (!arcs.length) return;
    byPlayer.set(player.id, arcs);
    arcs.forEach((arc) => byArc.get(arc.id).push({ player, arc, score: arc.strength * 2 + careerProminence(player) }));
  });
  byArc.forEach((rows) => rows.sort((a, b) => b.score - a.score));
  return { teams, byArc, byPlayer };
}

// Cross-league record boards for the Remarkable Careers page.
export function careerRecordBoards(universe, teams = teamIndex(universe), limit = 5) {
  const rows = [...(universe?.players ?? []), ...(universe?.retiredPlayers ?? [])].filter((player) => player.history?.length).map((player) => ({ player, facts: careerFacts(player, teams) }));
  const board = (id, title, value, format) => ({ id, title, rows: rows.map((row) => ({ player: row.player, value: value(row) })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value || careerProminence(b.player) - careerProminence(a.player)).slice(0, limit).map((row) => ({ ...row, label: format(row.value) })) });
  return [
    board('nba-teams', 'Most NBA franchises', (row) => row.facts.nbaTeams, (v) => `${v} teams`),
    board('countries', 'Most countries played in', (row) => row.facts.countries, (v) => `${v} countries`),
    board('clubs', 'Most professional clubs', (row) => row.facts.proClubs, (v) => `${v} clubs`),
    board('titles', 'Most team titles, all competitions', (row) => row.facts.titles, (v) => `${v} titles`),
    board('europe-first', 'Longest European career before an NBA debut', (row) => (row.facts.nba.length ? row.facts.europeBeforeNba : 0), (v) => `${v} seasons`),
    board('seasons', 'Longest careers', (row) => row.facts.seasons.length, (v) => `${v} seasons`),
  ];
}
