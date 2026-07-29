import { advanceToNextYear, createUniverse, simulateWeeks } from '../src/game/universe.js';

function validateUniverse(universe, label) {
  const playerById = new Map(universe.players.map((player) => [player.id, player]));
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');
  const professionalTeams = universe.teams.filter((team) => team.type !== 'NCAA');

  const invalidNCAA = ncaaTeams.filter((team) => {
    const roster = team.rosterIds.map((id) => playerById.get(id)).filter(Boolean);
    return roster.length !== 5 || new Set(roster.map((player) => player.position)).size !== 5;
  });
  const invalidProfessional = professionalTeams.filter((team) => team.rosterIds.length !== 10);
  const overageCollegePlayers = universe.players.filter((player) => player.teamType === 'NCAA' && player.age > 22);

  if (ncaaTeams.length !== 200 || invalidNCAA.length || invalidProfessional.length || overageCollegePlayers.length) {
    throw new Error(`${label}: NCAA teams=${ncaaTeams.length}, invalid NCAA=${invalidNCAA.length}, invalid professional=${invalidProfessional.length}, overage NCAA=${overageCollegePlayers.length}`);
  }

  console.log(`${label}: ${universe.teams.length} teams, ${universe.players.length} active players, ${universe.retiredPlayers.length} retired players`);
}

let universe = createUniverse();
validateUniverse(universe, 'Initial universe');

for (let season = 0; season < 12; season += 1) {
  universe = simulateWeeks(universe, 50);
  universe = advanceToNextYear(universe);
  validateUniverse(universe, `Season ${universe.year}`);
}

if (universe.draftHistory.length !== 12 || universe.draftHistory.some((draft) => draft.picks.length !== 60)) {
  throw new Error('Draft validation failed.');
}

console.log('Validation passed: 12 seasons, 200 NCAA starting fives, 10-player professional rosters and 60-pick drafts.');
