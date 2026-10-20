// ─────────────────────────────────────────────────────────────────────────────
// Storylines engine (v1.04). Turns the simulation into readable news while it
// runs, so the UI only has to display it:
//   • state.storylines  weekly headlines (streaks, skids, new leaders), deadline
//                       deals, arc-aware moves (journeyman, crossover,
//                       homecoming, undrafted) and legacy milestones
//   • state.followNews  every move, honor, milestone and retirement of the
//                       players the user follows
//   • state.milestones  permanent cross-league career milestones
// The engine is called from universe.js; nothing here imports it back.
// ─────────────────────────────────────────────────────────────────────────────
import { careerFacts, teamIndex } from './careerArcs.js';

export const STORY_GROUPS = {
  Games: ['STREAK', 'SKID', 'TOP SPOT'],
  Moves: ['DEADLINE', 'JOURNEYMAN', 'CROSSOVER', 'HOMECOMING', 'UNDRAFTED'],
  Legacy: ['MILESTONE', 'TRIPLE CROWN', 'WORLD CHAMPION', 'ONE-CLUB DECADE'],
};
export function storyGroup(type) {
  return Object.entries(STORY_GROUPS).find(([, types]) => types.includes(type))?.[0] ?? 'Games';
}

const TRACKED_COMPETITIONS = { nba: { streak: [8, 12, 16], skid: 8 }, euroleague: { streak: [6, 10], skid: 6 }, 'ncaa-division-i': { streak: [8, 12], skid: 99 } };
const STORY_CAP = 600;
const FOLLOW_CAP = 300;
const POINT_MILESTONES = [10000, 15000, 20000, 25000, 30000];

function ensureStoryState(state) {
  state.storylines ??= [];
  state.followNews ??= [];
  state.milestones ??= [];
  state.storyState ??= { runs: {}, leaders: {} };
  return state.storyState;
}
function pushStory(state, story) {
  ensureStoryState(state);
  const key = story.key ?? `${story.type}-${story.year}-${story.week}-${story.playerId ?? ''}-${story.teamId ?? ''}`;
  if (state.storylines.some((item) => item.key === key)) return;
  state.storylines.unshift({ key, group: storyGroup(story.type), week: state.week, year: state.year, phase: state.offseason?.active ? 'Offseason' : 'Season', score: 50, ...story });
  if (state.storylines.length > STORY_CAP) state.storylines.length = STORY_CAP;
}
const ordinal = (n) => `${n}${[11, 12, 13].includes(n % 100) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th')}`;
const participantsOf = (state, competitionId) => state.teams.filter((team) => team.competitionId === competitionId || (team.secondaryCompetitionIds ?? []).includes(competitionId));

// ── Followed players ────────────────────────────────────────────────────────
export function noteFollowedPlayerEvent(state, player, type, title, body = '') {
  if (!player || !(state.followedPlayerIds ?? []).includes(player.id)) return;
  ensureStoryState(state);
  state.followNews.unshift({ year: state.year, week: state.week, phase: state.offseason?.active ? 'Offseason' : 'Season', playerId: player.id, player: player.name, type, title, body: body ?? '' });
  if (state.followNews.length > FOLLOW_CAP) state.followNews.length = FOLLOW_CAP;
}

// ── Weekly headlines ────────────────────────────────────────────────────────
export function captureWeekSnapshot(state) {
  const snapshot = {};
  Object.keys(TRACKED_COMPETITIONS).forEach((competitionId) => {
    snapshot[competitionId] = new Map(participantsOf(state, competitionId).map((team) => {
      const record = team.seasonRecords?.[competitionId] ?? { wins: 0, losses: 0 };
      return [team.id, { wins: record.wins, losses: record.losses }];
    }));
  });
  return snapshot;
}
export function recordWeekStories(state, snapshot) {
  const storyState = ensureStoryState(state);
  if (state.week === 1) { storyState.runs = {}; storyState.leaders = {}; }
  Object.entries(TRACKED_COMPETITIONS).forEach(([competitionId, rules]) => {
    const before = snapshot?.[competitionId];
    if (!before) return;
    const teams = participantsOf(state, competitionId);
    const competitionName = competitionId === 'nba' ? 'NBA' : competitionId === 'euroleague' ? 'EuroLeague' : 'NCAA';
    teams.forEach((team) => {
      const record = team.seasonRecords?.[competitionId];
      const previous = before.get(team.id);
      if (!record || !previous) return;
      const won = record.wins - previous.wins;
      const lost = record.losses - previous.losses;
      if (!won && !lost) return;
      const key = `${competitionId}:${team.id}`;
      const oldRun = storyState.runs[key] ?? 0;
      const run = lost === 0 ? Math.max(0, oldRun) + won : won === 0 ? Math.min(0, oldRun) - lost : 0;
      storyState.runs[key] = run;
      const crossed = rules.streak.find((mark) => oldRun < mark && run >= mark);
      if (crossed) pushStory(state, { type: 'STREAK', teamId: team.id, competitionId, score: 55 + crossed, title: `${team.name} have won ${run} straight`, body: `The ${competitionName} hot streak moves them to ${record.wins}-${record.losses}.` });
      if (oldRun > -rules.skid && run <= -rules.skid) pushStory(state, { type: 'SKID', teamId: team.id, competitionId, score: 52, title: `${team.name} drop ${-run} in a row`, body: `A ${competitionName} slide to ${record.wins}-${record.losses}. Pressure is building.` });
    });
    const eligible = teams.filter((team) => (team.seasonRecords?.[competitionId]?.wins ?? 0) + (team.seasonRecords?.[competitionId]?.losses ?? 0) >= 6);
    if (!eligible.length) return;
    const pct = (team) => { const r = team.seasonRecords[competitionId]; return r.wins / Math.max(1, r.wins + r.losses); };
    const leader = [...eligible].sort((a, b) => pct(b) - pct(a) || b.rating - a.rating)[0];
    const previousLeader = storyState.leaders[competitionId];
    storyState.leaders[competitionId] = leader.id;
    if (previousLeader && previousLeader !== leader.id && state.week >= 6) {
      const record = leader.seasonRecords[competitionId];
      pushStory(state, { type: 'TOP SPOT', teamId: leader.id, competitionId, score: 58, title: `${leader.name} take over first in the ${competitionName}`, body: `Now ${record.wins}-${record.losses} at week ${state.week}.` });
    }
  });
}

// ── Moves ───────────────────────────────────────────────────────────────────
function nbaFranchiseCount(player, teams, extraTeamId = null) {
  const ids = new Set();
  (player.history ?? []).forEach((season) => {
    if (teams.get(season.teamId)?.type === 'NBA') ids.add(season.teamId);
    (season.stints ?? []).forEach((stint) => { if (teams.get(stint.teamId)?.type === 'NBA') ids.add(stint.teamId); });
  });
  (player.seasonStints ?? []).forEach((stint) => { if (teams.get(stint.teamId)?.type === 'NBA') ids.add(stint.teamId); });
  if (extraTeamId != null && teams.get(extraTeamId)?.type === 'NBA') ids.add(extraTeamId);
  return ids.size;
}
export function recordDeadlineStories(state, deals) {
  const teams = teamIndex(state);
  const byId = new Map(state.players.map((player) => [player.id, player]));
  deals.forEach((deal) => {
    const buyer = teams.get(deal.buyerId); const seller = teams.get(deal.sellerId);
    const veteran = byId.get(deal.veteranId); const prospect = byId.get(deal.prospectId);
    if (!buyer || !seller || !veteran || !prospect) return;
    pushStory(state, { type: 'DEADLINE', teamId: buyer.id, playerId: veteran.id, score: 62 + Math.max(0, veteran.current - 78), title: `${buyer.name} land ${veteran.name} at the deadline`, body: `${seller.name} take ${prospect.name} in return and look to the future.` });
  });
}
// Called for every logged transaction; only the career-defining ones become news.
export function noteMoveStory(state, player, type, fromTeam, toTeam, teams = null) {
  if (!toTeam || !player) return;
  if (toTeam.type === 'NBA' && ['NBA trade', 'Free-agent signing', 'NBA signing', 'NBA transfer', 'NBA promotion'].includes(type)) {
    teams ??= teamIndex(state);
    const count = nbaFranchiseCount(player, teams, toTeam.id);
    if (count >= 4) pushStory(state, { type: 'JOURNEYMAN', key: `journeyman-${player.id}-${count}`, playerId: player.id, teamId: toTeam.id, score: 54 + count * 2, title: `${player.name} joins his ${ordinal(count)} NBA franchise`, body: `${toTeam.name} become the latest stop of a well-travelled career.` });
    if (type === 'NBA transfer' && fromTeam?.region === 'Europe') pushStory(state, { type: 'CROSSOVER', key: `crossover-${player.id}`, playerId: player.id, teamId: toTeam.id, score: 70 + Math.max(0, player.current - 80), title: `${player.name} crosses the Atlantic`, body: `After making his name with ${fromTeam.name}, the ${player.nationality} ${player.position} signs with ${toTeam.name}.` });
    if (player.originRoute === 'NCAA' && !player.draft && !(player.history ?? []).some((season) => teams.get(season.teamId)?.type === 'NBA')) pushStory(state, { type: 'UNDRAFTED', key: `undrafted-${player.id}`, playerId: player.id, teamId: toTeam.id, score: 57, title: `Undrafted ${player.name} makes the NBA`, body: `Nobody picked him out of college; ${toTeam.name} give him his chance.` });
  }
  if (type === 'Homecoming') pushStory(state, { type: 'HOMECOMING', key: `homecoming-${player.id}`, playerId: player.id, teamId: toTeam.id, score: 64, title: `${player.name} comes home`, body: `The veteran leaves ${fromTeam?.name ?? 'the NBA'} for ${toTeam.name}.` });
}

// ── Season milestones ───────────────────────────────────────────────────────
function addMilestone(state, player, type, key, title, body) {
  ensureStoryState(state);
  if (state.milestones.some((item) => item.key === key)) return;
  state.milestones.unshift({ key, year: state.year, type, playerId: player.id, player: player.name, title, body });
  pushStory(state, { type, key: `story-${key}`, playerId: player.id, score: type === 'TRIPLE CROWN' ? 95 : type === 'WORLD CHAMPION' ? 85 : 68, title, body });
  noteFollowedPlayerEvent(state, player, 'MILESTONE', title, body);
}
const proPoints = (seasons, teams) => seasons.filter((season) => teams.get(season.teamId)?.type !== 'NCAA').reduce((sum, season) => sum + (Number(season.ppg) || 0) * (Number(season.games) || 0) + (season.stints ?? []).reduce((s, stint) => s + (Number(stint.ppg) || 0) * (Number(stint.games) || 0), 0), 0);
export function recordSeasonMilestones(state) {
  ensureStoryState(state);
  const teams = teamIndex(state);
  state.players.forEach((player) => {
    const latest = player.history?.[player.history.length - 1];
    if (!latest || Number(latest.year) !== Number(state.year)) return;
    const total = proPoints(player.history, teams);
    const before = proPoints(player.history.slice(0, -1), teams);
    const crossed = POINT_MILESTONES.filter((mark) => before < mark && total >= mark).pop();
    if (crossed) addMilestone(state, player, 'MILESTONE', `points-${crossed}-${player.id}`, `${player.name} passes ${crossed.toLocaleString('en-US')} career points`, `Counting every professional league he has played in, now at ${Math.round(total).toLocaleString('en-US')}.`);
    const facts = careerFacts(player, teams);
    if (facts.ncaaTitle && facts.euroleagueTitle && facts.nbaTitle) addMilestone(state, player, 'TRIPLE CROWN', `triple-crown-${player.id}`, `${player.name} completes the Triple Crown`, 'NCAA, EuroLeague and NBA champion: the rarest set in world basketball.');
    if (facts.nbaTitle && facts.intlGold) addMilestone(state, player, 'WORLD CHAMPION', `world-champion-${player.id}`, `${player.name}: NBA champion and international gold medallist`, 'Club and country, both at the very top.');
    const club = teams.get(latest.teamId);
    const bigStage = club?.type === 'NBA' || (club?.secondaryCompetitionIds ?? []).includes('euroleague');
    const individualHonors = (player.honors ?? []).filter((honor) => honor.category !== 'team').length;
    const notable = ['Epic', 'Legend', 'Generational'].includes(player.rarity) || (bigStage && individualHonors >= 4);
    if (notable && facts.pro.length === 10 && facts.proClubs === 1) addMilestone(state, player, 'ONE-CLUB DECADE', `one-club-${player.id}`, `${player.name} reaches ten seasons with ${latest.team}`, 'A decade without ever changing clubs.');
    (latest.honors ?? []).forEach((honor) => noteFollowedPlayerEvent(state, player, 'HONOR', `${player.name}: ${honor.type ?? honor}`, `${state.year} ${honor.competition ?? ''}`.trim()));
  });
}

// ── Read helpers for the UI ─────────────────────────────────────────────────
export function latestStorylines(universe, { limit = 20, group = null, year = null } = {}) {
  return (universe?.storylines ?? []).filter((story) => (!group || story.group === group) && (year == null || Number(story.year) === Number(year))).slice(0, limit);
}
export function followedPlayerFeed(universe, { limit = 40, playerId = null } = {}) {
  return (universe?.followNews ?? []).filter((item) => playerId == null || item.playerId === playerId).slice(0, limit);
}
