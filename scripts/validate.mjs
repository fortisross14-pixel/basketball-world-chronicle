import {
  advanceToNextYear,
  advanceOffseasonStage,
  startOffseason,
  OFFSEASON_STAGES,
  createUniverse,
  getCompetitionParticipants,
  simulateWeeks,
} from '../src/game/universe.js';
import { DETAILED_COUNTRY_SPECS, SUMMARY_COUNTRY_SPECS, NATIONAL_TEAM_COUNTRIES } from '../src/data/worldData.js';
import { G_LEAGUE_TEAMS } from '../src/data/teamData.js';

const FULL_SEEDS = [20260729, 19860517];
const QUICK = process.env.BWC_QUICK === '1';
const SEEDS = QUICK ? FULL_SEEDS : FULL_SEEDS.slice(0, 1);
const SEASONS = QUICK ? 3 : 6;
const POSITION_SET = new Set(['PG', 'SG', 'SF', 'PF', 'C']);
const ELITE_TARGETS = { Generational: 3, Legend: 12, Epic: 30 };
const average = (items, selector = (item) => item.rating) => items.reduce((sum, item) => sum + selector(item), 0) / Math.max(1, items.length);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const localCountries = (team) => team.type === 'NBA' ? ['USA', 'Canada'] : [team.country];

function rosterPlayers(universe, team, playerById) {
  return team.rosterIds.map((id) => playerById.get(id)).filter(Boolean);
}

function validateEliteIdentity(universe, label) {
  for (const [rarity, target] of Object.entries(ELITE_TARGETS)) {
    const active = universe.players.filter((player) => player.rarity === rarity && !['Retired','Left professional basketball'].includes(player.status));
    assert(active.length === target, `${label}: expected ${target} active ${rarity} players, found ${active.length}.`);
  }
  const realGenerational = universe.players.filter((player) => player.rarity === 'Generational' && player.realIdentity && !['Retired','Left professional basketball'].includes(player.status));
  assert(realGenerational.length >= 1 && realGenerational.length <= 2, `${label}: expected one or two real-name Generational players, found ${realGenerational.length}.`);
  const realLegends = universe.players.filter((player) => player.rarity === 'Legend' && player.realIdentity && !['Retired','Left professional basketball'].includes(player.status)).length;
  const realEpics = universe.players.filter((player) => player.rarity === 'Epic' && player.realIdentity && !['Retired','Left professional basketball'].includes(player.status)).length;
  assert(realLegends >= 6 && realLegends <= 8, `${label}: real-name Legend mix is ${realLegends}/12.`);
  assert(realEpics >= 9 && realEpics <= 13, `${label}: real-name Epic mix is ${realEpics}/30.`);
}

function validateUniverse(universe, label) {
  const playerById = new Map(universe.players.map((player) => [player.id, player]));
  assert(playerById.size === universe.players.length, `${label}: duplicate active player IDs.`);
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');
  const nationalTeams = universe.teams.filter((team) => team.type === 'National');
  const clubs = universe.teams.filter((team) => !['NCAA', 'National'].includes(team.type));
  assert(ncaaTeams.length === 200, `${label}: expected 200 NCAA programs, found ${ncaaTeams.length}.`);
  assert(nationalTeams.length === NATIONAL_TEAM_COUNTRIES.length && nationalTeams.length >= 70, `${label}: international world is incomplete (${nationalTeams.length} national teams).`);
  assert(universe.teams.filter((team) => team.type === 'GLeague').length === G_LEAGUE_TEAMS.length && G_LEAGUE_TEAMS.length === 31, `${label}: expected the 31-team G League layer.`);
  assert(DETAILED_COUNTRY_SPECS.length >= 20 && DETAILED_COUNTRY_SPECS.length <= 25, `${label}: detailed-country scope is ${DETAILED_COUNTRY_SPECS.length}.`);
  assert(SUMMARY_COUNTRY_SPECS.length >= 25, `${label}: high-level country layer is too small (${SUMMARY_COUNTRY_SPECS.length}).`);

  for (const team of ncaaTeams) {
    const roster = rosterPlayers(universe, team, playerById);
    assert(roster.length === 5, `${label}: ${team.name} has ${roster.length} NCAA players.`);
    assert(new Set(roster.map((player) => player.position)).size === 5, `${label}: ${team.name} does not have one player at every position.`);
    assert(roster.every((player) => POSITION_SET.has(player.position) && player.age >= 18 && player.age <= 21), `${label}: ${team.name} has an invalid NCAA player.`);
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
    assert(Array.isArray(team.unavailablePlayers), `${label}: ${team.name} has no availability ledger.`);
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
    if (player.status === 'Free Agent') assert(player.teamId == null && player.contract == null, `${label}: free agent ${player.name} still has a club or contract.`);
    else if (player.teamType !== 'NCAA') assert(player.teamId != null, `${label}: active player ${player.name} is orphaned.`);
  }
  validateEliteIdentity(universe, label);
}


function nbaInternationalBalance(universe, label) {
  const playerById = new Map(universe.players.map((player)=>[player.id,player]));
  const nba = universe.teams.filter((team)=>team.type==='NBA');
  const counts = nba.map((team)=>team.rosterIds.map((id)=>playerById.get(id)).filter(Boolean).filter((player)=>player.nationality!=='USA').length);
  const total = counts.reduce((sum,value)=>sum+value,0);
  const share = total / Math.max(1,nba.length*10) * 100;
  assert(Math.max(...counts) <= 3, `${label}: an NBA team has more than three international players in the 10-man abstraction.`);
  assert(share >= 18 && share <= 30, `${label}: NBA international share is ${share.toFixed(1)}%.`);
  return Number(share.toFixed(1));
}

function hierarchy(universe) {
  const nba = universe.teams.filter((team) => team.type === 'NBA');
  const euro = universe.teams.filter((team) => team.secondaryCompetitionIds.includes('euroleague'));
  const ncaa = universe.teams.filter((team) => team.type === 'NCAA');
  const top20 = [...universe.teams].filter((team) => !['NCAA', 'National'].includes(team.type)).sort((a, b) => b.rating - a.rating).slice(0, 20);
  return {
    nbaAverage: Number(average(nba).toFixed(1)), euroAverage: Number(average(euro).toFixed(1)), ncaaAverage: Number(average(ncaa).toFixed(1)),
    nbaInTop20: top20.filter((team) => team.type === 'NBA').length,
    bestEuro: Math.max(...euro.map((team) => team.rating)), weakestNBA: Math.min(...nba.map((team) => team.rating)), bestNCAA: Math.max(...ncaa.map((team) => team.rating)),
  };
}

function competitionDiversity(universe, competitionId) {
  const seasons = universe.competitionHistory[competitionId] ?? [];
  const championCounts = seasons.reduce((counts, season) => { counts[season.champion] = (counts[season.champion] ?? 0) + 1; return counts; }, {});
  return { seasons: seasons.length, champions: new Set(seasons.map((season) => season.champion)).size, mvps: new Set(seasons.map((season) => season.mvp?.id)).size, maxTitles: Math.max(0, ...Object.values(championCounts)) };
}

const summaries = [];
for (const seed of SEEDS) {
  console.log(`\nValidating seed ${seed}...`);
  let universe = createUniverse(seed);
  validateUniverse(universe, `Seed ${seed}, opening universe`);
  nbaInternationalBalance(universe, `Seed ${seed}, opening universe`);
  assert(getCompetitionParticipants(universe, 'eurobasket').length === 24, `Seed ${seed}: EuroBasket field is not 24 teams.`);
  assert(getCompetitionParticipants(universe, 'fiba-americup').length === 12, `Seed ${seed}: AmeriCup field is not 12 teams.`);
  assert(getCompetitionParticipants(universe, 'fiba-asia-cup').length === 16, `Seed ${seed}: Asia Cup field is not 16 teams.`);
  assert(getCompetitionParticipants(universe, 'afrobasket').length === 16, `Seed ${seed}: AfroBasket field is not 16 teams.`);
  assert(universe.teams.filter((team) => team.country === 'Spain' && team.competition === 'Liga ACB').length >= 18, `Seed ${seed}: Spain does not have a full ACB field.`);
  const usa = universe.teams.find((team) => team.type === 'National' && team.country === 'USA');
  const usaRoster = new Set(usa.rosterIds);
  const usaStars = universe.players.filter((player) => player.nationality === 'USA' && player.teamType === 'NBA').sort((a,b)=>b.current-a.current).slice(0,5);
  assert(usa.selectionCompetition === 'FIBA AmeriCup', `Seed ${seed}: USA opening selection is not AmeriCup.`);
  assert(usaStars.filter((player)=>usaRoster.has(player.id)).length <= 2, `Seed ${seed}: too many USA superstars attended AmeriCup.`);
  assert(usa.unavailablePlayers.length >= 3, `Seed ${seed}: USA availability reasons were not recorded.`);

  const openingHierarchy = hierarchy(universe);
  assert(openingHierarchy.nbaAverage >= openingHierarchy.euroAverage + 9, `Seed ${seed}: NBA opening average is not decisively strongest.`);
  assert(openingHierarchy.bestNCAA < openingHierarchy.weakestNBA, `Seed ${seed}: an NCAA team is rated above an NBA team.`);
  assert(openingHierarchy.bestEuro < openingHierarchy.weakestNBA, `Seed ${seed}: Europe is too close to the NBA at universe creation.`);
  assert(openingHierarchy.bestNCAA >= openingHierarchy.euroAverage - 9, `Seed ${seed}: top NCAA programs are too far below EuroLeague level.`);

  for (let seasonIndex = 0; seasonIndex < SEASONS; seasonIndex += 1) {
    process.stdout.write(`  Season ${seasonIndex + 1}/${SEASONS}: `);
    universe = simulateWeeks(universe, 50);
    assert(universe.yearReview && universe.finalizedYear === universe.year, `Seed ${seed}, ${universe.year}: year review did not finalize.`);
    if (seasonIndex === 0) {
      universe = startOffseason(universe);
      assert(universe.offseason?.active && universe.offseason.stageIndex === 0, `Seed ${seed}: staged offseason did not start.`);
      for (let stage = 0; stage < OFFSEASON_STAGES.length; stage += 1) universe = advanceOffseasonStage(universe);
    } else universe = advanceToNextYear(universe);
    validateUniverse(universe, `Seed ${seed}, ${universe.year}`);
    nbaInternationalBalance(universe, `Seed ${seed}, ${universe.year}`);
    const offseason = universe.offseasonHistory[0];
    assert(offseason && offseason.teams.length > 200, `Seed ${seed}, ${universe.year}: offseason summary was not archived.`);
    assert(offseason.teams.some((team)=>team.delta>0) && offseason.teams.some((team)=>team.delta<0), `Seed ${seed}, ${universe.year}: offseason summary did not produce both improvers and decliners.`);
    assert(offseason.nbaTrades >= 8 && offseason.nbaTrades <= 14, `Seed ${seed}, ${universe.year}: NBA trade volume is ${offseason.nbaTrades}.`);
    assert(offseason.nbaInternationalShare <= 30, `Seed ${seed}, ${universe.year}: offseason NBA international share is ${offseason.nbaInternationalShare}%.`);
    console.log(`passed → ${universe.year} · ${offseason.nbaTrades} NBA trades · ${offseason.nbaInternationalShare}% international`);

    const draft = universe.draftHistory[0];
    assert(draft.picks.length === 60, `Seed ${seed}, draft ${draft.year}: expected 60 picks.`);
    assert(draft.ncaaPicks >= 42 && draft.ncaaPicks <= 50, `Seed ${seed}, draft ${draft.year}: implausible NCAA share.`);
    assert(draft.internationalPicks >= 10 && draft.internationalPicks <= 18, `Seed ${seed}, draft ${draft.year}: implausible international share.`);
    assert(draft.collegeGraduates >= 230 && draft.collegeGraduates <= 280, `Seed ${seed}, draft ${draft.year}: ${draft.collegeGraduates} college exits.`);
    assert(draft.signed >= 5 && draft.signed <= 35, `Seed ${seed}, draft ${draft.year}: ${draft.signed} immediate NBA signings.`);
    const talent = universe.talentHistory[0];
    assert(talent.totalElite >= 0 && talent.totalElite <= 6, `Seed ${seed}, ${universe.year}: uncontrolled elite birth total ${talent.totalElite}.`);
    assert(Math.abs(universe.eliteRouteBalance.NCAA - universe.eliteRouteBalance.International) <= 1, `Seed ${seed}, ${universe.year}: elite development routes became unbalanced.`);
  }

  const finalHierarchy = hierarchy(universe);
  assert(finalHierarchy.nbaAverage >= finalHierarchy.euroAverage + 8, `Seed ${seed}: NBA lost its decisive global average advantage.`);
  assert(finalHierarchy.nbaInTop20 >= 17, `Seed ${seed}: only ${finalHierarchy.nbaInTop20} NBA teams are in the global top 20.`);
  assert(finalHierarchy.bestNCAA < finalHierarchy.weakestNBA, `Seed ${seed}: NCAA appears above the NBA.`);
  assert(finalHierarchy.bestEuro < finalHierarchy.weakestNBA, `Seed ${seed}: Europe became too close to the NBA.`);

  const diversityTargets = QUICK ? [['nba',2,2],['euroleague',2,2],['liga-acb',2,2],['ncaa-tournament',2,2]] : [['nba',3,3],['euroleague',3,3],['liga-acb',3,3],['ncaa-tournament',3,3]];
  for (const [competitionId, minimumChampions, minimumMvps] of diversityTargets) {
    const diversity = competitionDiversity(universe, competitionId);
    assert(diversity.seasons === SEASONS, `Seed ${seed}: ${competitionId} has ${diversity.seasons} completed seasons.`);
    assert(diversity.champions >= minimumChampions, `Seed ${seed}: ${competitionId} champion diversity is ${diversity.champions}.`);
    assert(diversity.mvps >= minimumMvps, `Seed ${seed}: ${competitionId} MVP diversity is ${diversity.mvps}.`);
    assert(diversity.maxTitles <= (QUICK ? 3 : 4), `Seed ${seed}: one ${competitionId} team won ${diversity.maxTitles}/${SEASONS} titles.`);
    assert((universe.competitionHistory[competitionId] ?? []).every((season) => season.bracket?.length && season.leaders?.points && season.finalsMvp), `Seed ${seed}: ${competitionId} is missing brackets or awards.`);
  }

  assert(!universe.spawnHistory.flatMap((year) => year.players).some((spawn) => universe.teams.find((item) => item.name === spawn.team)?.type === 'NBA'), `Seed ${seed}: an NBA team generated a player after universe creation.`);
  const matureGenerationalOutside = universe.players.filter((player)=>player.rarity==='Generational'&&player.age>=21&&!['NBA','NCAA','National'].includes(player.teamType));
  assert(matureGenerationalOutside.length === 0, `Seed ${seed}: a mature Generational player remained outside the NBA.`);
  assert(!universe.players.some((player) => player.current >= 89 && !['NBA','NCAA','National'].includes(player.teamType)), `Seed ${seed}: a 89+ player remained sustainably outside the NBA.`);
  summaries.push({ seed, finalYear: universe.year, openingHierarchy, finalHierarchy, nba: competitionDiversity(universe,'nba'), euroleague: competitionDiversity(universe,'euroleague'), draft: { ...universe.draftHistory[0], picks: undefined } });
  universe = null;
  if (global.gc) global.gc();
}

console.log(`\n${QUICK ? 'Quick' : 'Full deterministic'} validation passed: ${SEEDS.length} seeds × ${SEASONS} seasons.`);
for (const summary of summaries) console.log(`Seed ${summary.seed} → ${summary.finalYear}: NBA ${summary.finalHierarchy.nbaAverage}, EuroLeague ${summary.finalHierarchy.euroAverage}, NCAA ${summary.finalHierarchy.ncaaAverage}; NBA champions ${summary.nba.champions}, MVPs ${summary.nba.mvps}; EuroLeague champions ${summary.euroleague.champions}, MVPs ${summary.euroleague.mvps}; latest draft ${summary.draft.ncaaPicks}/${summary.draft.internationalPicks}, ${summary.draft.signed} immediate NBA signings.`);
