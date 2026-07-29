import { advanceToNextYear, createUniverse, simulateWeeks } from '../src/game/universe.js';

const localCountries = (team) => team.type === 'NBA' ? ['USA', 'Canada'] : [team.country];

function validateRosters(universe, label) {
  const playerById = new Map(universe.players.map((player) => [player.id, player]));
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');
  const professionalTeams = universe.teams.filter((team) => team.type !== 'NCAA');
  const invalidNCAA = ncaaTeams.filter((team) => {
    const roster = team.rosterIds.map((id) => playerById.get(id)).filter(Boolean);
    return roster.length !== 5 || new Set(roster.map((player) => player.position)).size !== 5;
  });
  const invalidProfessional = professionalTeams.filter((team) => team.rosterIds.length !== 10);
  const overageCollegePlayers = universe.players.filter((player) => player.teamType === 'NCAA' && player.age > 21);
  const localQuotaFailures = professionalTeams.filter((team) => {
    const roster = team.rosterIds.map((id) => playerById.get(id)).filter(Boolean);
    return roster.filter((player) => localCountries(team).includes(player.nationality)).length < team.localMinimum;
  });
  if (ncaaTeams.length !== 200 || invalidNCAA.length || invalidProfessional.length || overageCollegePlayers.length || localQuotaFailures.length) {
    throw new Error(`${label}: NCAA=${ncaaTeams.length}, invalid NCAA=${invalidNCAA.length}, invalid pro=${invalidProfessional.length}, overage NCAA=${overageCollegePlayers.length}, local failures=${localQuotaFailures.length}`);
  }
}

let universe = createUniverse();
validateRosters(universe, 'Initial universe');

const nba = universe.teams.filter((team) => team.type === 'NBA');
const euro = universe.teams.filter((team) => team.secondaryCompetitionIds.includes('euroleague'));
const ncaa = universe.teams.filter((team) => team.type === 'NCAA');
const average = (items) => items.reduce((sum, item) => sum + item.rating, 0) / items.length;
const top20 = [...universe.teams].sort((a, b) => b.rating - a.rating).slice(0, 20);
if (average(nba) <= average(euro) + 5 || top20.filter((team) => team.type === 'NBA').length < 18 || Math.max(...ncaa.map((team) => team.rating)) >= Math.min(...nba.map((team) => team.rating))) {
  throw new Error('Opening talent hierarchy is not credible.');
}
if (Math.max(...euro.map((team) => team.rating)) <= Math.min(...nba.map((team) => team.rating))) {
  throw new Error('Top European clubs should be capable of exceeding a weak NBA team.');
}

for (let season = 0; season < 10; season += 1) {
  universe = simulateWeeks(universe, 50);
  if (!universe.yearReview || universe.finalizedYear !== universe.year) throw new Error('Year review did not finalize competition history.');
  universe = advanceToNextYear(universe);
  validateRosters(universe, `Season ${universe.year}`);
  const draft = universe.draftHistory[0];
  if (draft.picks.length !== 60 || draft.collegeGraduates < 230 || draft.collegeGraduates > 270 || draft.signed < 10 || draft.signed > 45) {
    throw new Error(`Draft pipeline failed in ${draft.year}: graduates=${draft.collegeGraduates}, signed=${draft.signed}.`);
  }
}

for (const id of ['nba', 'euroleague', 'liga-acb', 'ncaa-tournament']) {
  const seasons = universe.competitionHistory[id];
  if (!seasons || seasons.length !== 10 || seasons.some((season) => !season.mvp || !season.leaders.points || !season.playerStats?.length)) {
    throw new Error(`Competition history failed for ${id}.`);
  }
}
const nbaHistory = universe.competitionHistory.nba;
const euroHistory = universe.competitionHistory.euroleague;
if (new Set(nbaHistory.map((season) => season.champion)).size < 4 || new Set(euroHistory.map((season) => season.champion)).size < 4) {
  throw new Error('Champion diversity is too low.');
}
if (new Set(nbaHistory.map((season) => season.mvp.id)).size < 4 || new Set(euroHistory.map((season) => season.mvp.id)).size < 5) {
  throw new Error('MVP diversity is too low.');
}
const playersWithHistory = universe.players.filter((player) => player.history.length > 0).length;
if (playersWithHistory < universe.players.length * 0.7 || universe.teams.some((team) => team.history.length !== 10) || universe.players.some((player) => player.history.some((season) => !season.team || season.ppg == null))) {
  throw new Error('Player or team annual histories are incomplete.');
}

console.log(`Validation passed through ${universe.year}:`);
console.log(`- ${universe.teams.length} teams and ${universe.players.length} active players`);
console.log('- 200 NCAA starting fives and 10-player professional rosters');
console.log('- roughly 250 annual college exits, 60 draft picks and selective NBA signings');
console.log('- local-player quotas, credible NBA/Europe/NCAA hierarchy and diverse champions/MVPs');
console.log('- permanent player, team and competition history records');
