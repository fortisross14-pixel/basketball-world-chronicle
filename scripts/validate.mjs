import {
  advanceToNextYear,
  createUniverse,
  simulateWeeks,
} from '../src/game/universe.js';

const FULL_SEEDS = [20260729, 19860517, 424242];
const QUICK = process.env.BWC_QUICK === '1';
const SEEDS = QUICK ? FULL_SEEDS.slice(0, 2) : FULL_SEEDS;
const SEASONS = QUICK ? 5 : 10;
const POSITION_SET = new Set(['PG', 'SG', 'SF', 'PF', 'C']);
const average = (items, selector = (item) => item.rating) => items.reduce((sum, item) => sum + selector(item), 0) / Math.max(1, items.length);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const localCountries = (team) => team.type === 'NBA' ? ['USA', 'Canada'] : [team.country];

function rosterPlayers(universe, team, playerById) {
  return team.rosterIds.map((id) => playerById.get(id)).filter(Boolean);
}

function validateUniverse(universe, label) {
  const playerById = new Map(universe.players.map((player) => [player.id, player]));
  assert(playerById.size === universe.players.length, `${label}: duplicate active player IDs.`);
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');
  const nationalTeams = universe.teams.filter((team) => team.type === 'National');
  const clubs = universe.teams.filter((team) => !['NCAA', 'National'].includes(team.type));
  assert(ncaaTeams.length === 200, `${label}: expected 200 NCAA programs, found ${ncaaTeams.length}.`);

  for (const team of ncaaTeams) {
    const roster = rosterPlayers(universe, team, playerById);
    assert(roster.length === 5, `${label}: ${team.name} has ${roster.length} NCAA players.`);
    assert(roster.every((player) => POSITION_SET.has(player.position)), `${label}: ${team.name} has invalid positions.`);
    assert(new Set(roster.map((player) => player.position)).size === 5, `${label}: ${team.name} does not have one player at every position.`);
    assert(roster.every((player) => player.age >= 18 && player.age <= 21), `${label}: ${team.name} has an overage or underage NCAA player.`);
    assert(roster.every((player) => player.contract == null), `${label}: NCAA players must not have professional contracts.`);
  }

  for (const team of clubs) {
    const roster = rosterPlayers(universe, team, playerById);
    assert(roster.length === 10, `${label}: ${team.name} has ${roster.length} professional players.`);
    const locals = roster.filter((player) => localCountries(team).includes(player.nationality)).length;
    assert(locals >= team.localMinimum, `${label}: ${team.name} misses its local-player minimum (${locals}/${team.localMinimum}).`);
    assert(roster.every((player) => player.contract && player.contract.teamId === team.id), `${label}: ${team.name} has an active player without the correct contract.`);
    if (team.type === 'Pro') {
      const ncaaAlumni = roster.filter((player) => player.originRoute === 'NCAA').length;
      const cap = team.secondaryCompetitionIds.includes('euroleague') ? 4 : 3;
      assert(ncaaAlumni <= cap, `${label}: ${team.name} has ${ncaaAlumni} NCAA alumni; cap is ${cap}.`);
    }
  }

  for (const team of nationalTeams) {
    const roster = rosterPlayers(universe, team, playerById);
    assert(roster.length === 10, `${label}: ${team.name} has ${roster.length} selected players.`);
    assert(roster.every((player) => player.nationality === team.country), `${label}: ${team.name} selected a non-eligible player.`);
  }

  const coachById = new Map(universe.coaches.map((coach) => [coach.id, coach]));
  const ownerById = new Map(universe.owners.map((owner) => [owner.id, owner]));
  for (const team of universe.teams) {
    assert(coachById.get(team.coachId)?.teamId === team.id, `${label}: ${team.name} has no correctly assigned coach.`);
    assert(ownerById.get(team.ownerId)?.teamId === team.id, `${label}: ${team.name} has no correctly assigned president/owner.`);
  }

  for (const player of universe.players) {
    assert(player.rarity === player.birthRarity, `${label}: ${player.name} changed rarity from ${player.birthRarity} to ${player.rarity}.`);
    assert(player.base === player.birthBase, `${label}: ${player.name} changed permanent base level.`);
    if (player.teamType === 'NCAA') {
      assert((player.developmentMultiplier ?? 0) <= 0.89, `${label}: ${player.name} exceeded the NCAA development cap.`);
      assert((player.ncaaCurve ?? []).every((value) => value >= 0.75 && value <= 0.89), `${label}: ${player.name} has an invalid NCAA curve.`);
    }
    if (player.status === 'Free Agent') {
      assert(player.teamId == null && player.contract == null, `${label}: free agent ${player.name} still has a club or contract.`);
    } else if (player.teamType !== 'NCAA') {
      assert(player.teamId != null, `${label}: active player ${player.name} is orphaned.`);
    }
  }
}

function hierarchy(universe) {
  const nba = universe.teams.filter((team) => team.type === 'NBA');
  const euro = universe.teams.filter((team) => team.secondaryCompetitionIds.includes('euroleague'));
  const ncaa = universe.teams.filter((team) => team.type === 'NCAA');
  const top20 = [...universe.teams]
    .filter((team) => !['NCAA', 'National'].includes(team.type))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);
  return {
    nbaAverage: Number(average(nba).toFixed(1)),
    euroAverage: Number(average(euro).toFixed(1)),
    ncaaAverage: Number(average(ncaa).toFixed(1)),
    nbaInTop20: top20.filter((team) => team.type === 'NBA').length,
    bestEuro: Math.max(...euro.map((team) => team.rating)),
    weakestNBA: Math.min(...nba.map((team) => team.rating)),
    bestNCAA: Math.max(...ncaa.map((team) => team.rating)),
  };
}

function competitionDiversity(universe, competitionId) {
  const seasons = universe.competitionHistory[competitionId] ?? [];
  const championCounts = seasons.reduce((counts, season) => {
    counts[season.champion] = (counts[season.champion] ?? 0) + 1;
    return counts;
  }, {});
  return {
    seasons: seasons.length,
    champions: new Set(seasons.map((season) => season.champion)).size,
    mvps: new Set(seasons.map((season) => season.mvp?.id)).size,
    maxTitles: Math.max(0, ...Object.values(championCounts)),
  };
}

const summaries = [];
const combinedGenerational = [];

for (const seed of SEEDS) {
  console.log(`\nValidating seed ${seed}...`);
  let universe = createUniverse(seed);
  validateUniverse(universe, `Seed ${seed}, opening universe`);
  const openingHierarchy = hierarchy(universe);
  assert(openingHierarchy.nbaAverage >= openingHierarchy.euroAverage + 10, `Seed ${seed}: NBA opening average is not decisively strongest.`);
  assert(openingHierarchy.bestNCAA < openingHierarchy.weakestNBA, `Seed ${seed}: an NCAA team is rated above an NBA team.`);
  assert(openingHierarchy.bestEuro < openingHierarchy.weakestNBA, `Seed ${seed}: Europe is too close to the NBA at universe creation.`);
  assert(openingHierarchy.bestNCAA >= openingHierarchy.euroAverage - 7, `Seed ${seed}: top NCAA programs are too far below EuroLeague level.`);

  for (let seasonIndex = 0; seasonIndex < SEASONS; seasonIndex += 1) {
    process.stdout.write(`  Season ${seasonIndex + 1}/${SEASONS}: `);
    universe = simulateWeeks(universe, 50);
    assert(universe.yearReview && universe.finalizedYear === universe.year, `Seed ${seed}, ${universe.year}: year review did not finalize.`);
    universe = advanceToNextYear(universe);
    validateUniverse(universe, `Seed ${seed}, ${universe.year}`);
    console.log(`passed → ${universe.year}`);

    const draft = universe.draftHistory[0];
    assert(draft.picks.length === 60, `Seed ${seed}, draft ${draft.year}: expected 60 picks.`);
    assert(draft.ncaaPicks >= 42 && draft.ncaaPicks <= 50, `Seed ${seed}, draft ${draft.year}: implausible NCAA share.`);
    assert(draft.internationalPicks >= 10 && draft.internationalPicks <= 18, `Seed ${seed}, draft ${draft.year}: implausible international share.`);
    assert(draft.collegeGraduates >= 230 && draft.collegeGraduates <= 280, `Seed ${seed}, draft ${draft.year}: ${draft.collegeGraduates} college exits.`);
    assert(draft.signed >= 5 && draft.signed <= 35, `Seed ${seed}, draft ${draft.year}: ${draft.signed} immediate NBA signings.`);
    assert(draft.collegeGraduates - draft.ncaaPicks >= 170, `Seed ${seed}, draft ${draft.year}: too few undrafted graduates reached the market.`);
    const talent = universe.talentHistory[0];
    assert(talent.totalElite >= 8 && talent.totalElite <= 10, `Seed ${seed}, ${universe.year}: unexpected elite birth total.`);
    assert(talent.ncaaShare === 50, `Seed ${seed}, ${universe.year}: NCAA did not receive exactly half of Epic+ births.`);
    assert(talent.ncaaElite === talent.internationalElite, `Seed ${seed}, ${universe.year}: elite birth routes are unbalanced.`);
  }

  const finalHierarchy = hierarchy(universe);
  assert(finalHierarchy.nbaAverage >= finalHierarchy.euroAverage + 9, `Seed ${seed}: NBA lost its decisive global average advantage.`);
  assert(finalHierarchy.nbaInTop20 >= 17, `Seed ${seed}: only ${finalHierarchy.nbaInTop20} NBA teams are in the global top 20.`);
  assert(finalHierarchy.bestNCAA < finalHierarchy.weakestNBA, `Seed ${seed}: NCAA appears above the NBA after ten seasons.`);
  assert(finalHierarchy.bestEuro < finalHierarchy.weakestNBA, `Seed ${seed}: Europe became too close to the NBA after ten seasons.`);
  assert(finalHierarchy.bestNCAA >= finalHierarchy.euroAverage - 8, `Seed ${seed}: top NCAA programs are not competitive enough relative to Europe.`);

  const diversityTargets = QUICK
    ? [['nba', 3, 3], ['euroleague', 3, 3], ['liga-acb', 3, 3], ['ncaa-tournament', 3, 3]]
    : [['nba', 5, 5], ['euroleague', 5, 5], ['liga-acb', 4, 5], ['ncaa-tournament', 6, 6]];
  for (const [competitionId, minimumChampions, minimumMvps] of diversityTargets) {
    const diversity = competitionDiversity(universe, competitionId);
    assert(diversity.seasons === SEASONS, `Seed ${seed}: ${competitionId} has ${diversity.seasons} completed seasons.`);
    assert(diversity.champions >= minimumChampions, `Seed ${seed}: ${competitionId} champion diversity is ${diversity.champions}.`);
    assert(diversity.mvps >= minimumMvps, `Seed ${seed}: ${competitionId} MVP diversity is ${diversity.mvps}.`);
    assert(diversity.maxTitles <= (QUICK ? 4 : 5), `Seed ${seed}: one ${competitionId} team won ${diversity.maxTitles}/${SEASONS} titles.`);
    assert((universe.competitionHistory[competitionId] ?? []).every((season) => season.bracket?.length && season.leaders?.points && season.finalsMvp), `Seed ${seed}: ${competitionId} is missing brackets or awards.`);
  }

  if (QUICK) {
    assert((universe.competitionHistory['fiba-world-cup'] ?? []).length >= 1, `Seed ${seed}: FIBA World Cup did not run.`);
    assert((universe.competitionHistory['olympic-basketball-tournament'] ?? []).length >= 1, `Seed ${seed}: Olympic tournament did not run.`);
    assert((universe.competitionHistory.eurobasket ?? []).length >= 1, `Seed ${seed}: EuroBasket did not run.`);
    assert(universe.coachTransactions.length > 0, `Seed ${seed}: coaching market did not move.`);
  } else {
    assert((universe.competitionHistory['fiba-world-cup'] ?? []).length === 3, `Seed ${seed}: FIBA World Cup cadence failed.`);
    assert((universe.competitionHistory['olympic-basketball-tournament'] ?? []).length === 2, `Seed ${seed}: Olympic cadence failed.`);
    assert((universe.competitionHistory.eurobasket ?? []).length === 3, `Seed ${seed}: EuroBasket cadence failed.`);
    assert(universe.formerOwners.length > 0, `Seed ${seed}: no ownership mandates ended.`);
    assert(universe.retiredCoaches.length > 0 && universe.coachTransactions.length > 0, `Seed ${seed}: coaching market did not move.`);
  }
  assert(universe.retirements.some((item) => item.reason === 'Retirement'), `Seed ${seed}: no true retirements were recorded.`);
  assert(universe.retirements.some((item) => item.reason === 'Left professional basketball'), `Seed ${seed}: no unsuccessful graduates left the active universe.`);
  assert(universe.freeAgencyHistory.every((year) => year.unsigned >= 0), `Seed ${seed}: free-agency history is incomplete.`);
  assert(!universe.spawnHistory.flatMap((year) => year.players).some((spawn) => {
    const team = universe.teams.find((item) => item.name === spawn.team);
    return team?.type === 'NBA';
  }), `Seed ${seed}: an NBA team generated a player after universe creation.`);
  const activeProfessionalEliteOutsideNBA = universe.players.filter((player) => ['Legend','Generational'].includes(player.rarity) && player.teamType === 'Pro');
  assert(activeProfessionalEliteOutsideNBA.filter((player) => player.rarity === 'Generational' && player.age >= 21).length === 0, `Seed ${seed}: a mature Generational player remained in a non-NBA professional league.`);
  assert(activeProfessionalEliteOutsideNBA.length <= 4, `Seed ${seed}: too many Legend/Generational players remained outside the NBA.`);
  assert(!universe.players.some((player) => player.current >= 89 && !['NBA','NCAA','National'].includes(player.teamType)), `Seed ${seed}: a 89+ player remained sustainably outside the NBA.`);

  const allPlayers = [...universe.players, ...universe.retiredPlayers];
  combinedGenerational.push(...allPlayers.filter((player) => player.rarity === 'Generational').map((player) => ({ seed, route: player.originRoute, nationality: player.nationality })));
  summaries.push({
    seed,
    finalYear: universe.year,
    openingHierarchy,
    finalHierarchy,
    nba: competitionDiversity(universe, 'nba'),
    euroleague: competitionDiversity(universe, 'euroleague'),
    draft: universe.draftHistory[0],
    formerOwners: universe.formerOwners.length,
    retiredCoaches: universe.retiredCoaches.length,
    freeAgents: universe.freeAgents.length,
  });
}

assert(new Set(combinedGenerational.map((player) => player.route)).size >= (QUICK ? 2 : 3), 'Generational players came through too few development routes.');
assert(new Set(combinedGenerational.map((player) => player.nationality)).size >= (QUICK ? 3 : 6), 'Generational players came from too few nationalities.');

console.log(`\n${QUICK ? 'Quick' : 'Full deterministic'} validation passed: ${SEEDS.length} seeds × ${SEASONS} seasons.`);
for (const summary of summaries) {
  console.log(`Seed ${summary.seed} → ${summary.finalYear}: NBA ${summary.finalHierarchy.nbaAverage}, EuroLeague ${summary.finalHierarchy.euroAverage}, NCAA ${summary.finalHierarchy.ncaaAverage}; NBA champions ${summary.nba.champions}, MVPs ${summary.nba.mvps}; EuroLeague champions ${summary.euroleague.champions}, MVPs ${summary.euroleague.mvps}; latest draft ${summary.draft.ncaaPicks}/${summary.draft.internationalPicks}, ${summary.draft.signed} immediate NBA signings.`);
}
console.log(`Generational diversity: ${combinedGenerational.length} careers, ${new Set(combinedGenerational.map((player) => player.route)).size} routes, ${new Set(combinedGenerational.map((player) => player.nationality)).size} nationalities.`);
