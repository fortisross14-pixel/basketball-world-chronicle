import {
  NBA_TEAMS,
  G_LEAGUE_TEAMS,
  EURO_TOP_CLUBS,
  EURO_DOMESTIC,
  NCAA_PROGRAMS,
  OTHER_PRO_TEAMS,
  EXTENDED_PRO_TEAMS,
  EUROCUP_CLUBS,
} from '../data/teamData.js';
import { COMPETITIONS, COMPETITION_BY_ID, competitionId } from '../data/competitionData.js';

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
export const POSITION_ORDER = POSITIONS;

const REGION_BY_COUNTRY = {
  USA: 'North America', Canada: 'North America', Spain: 'Europe', Greece: 'Europe', Turkey: 'Europe',
  Italy: 'Europe', France: 'Europe', Germany: 'Europe', Lithuania: 'Europe', Israel: 'Europe', Russia: 'Europe',
  Serbia: 'Europe', Slovenia: 'Europe', Montenegro: 'Europe', Croatia: 'Europe', Poland: 'Europe', Belgium: 'Europe',
  Netherlands: 'Europe', UAE: 'Asia', Japan: 'Asia', China: 'Asia', 'South Korea': 'Asia', Philippines: 'Asia',
  Australia: 'Oceania', 'New Zealand': 'Oceania', Argentina: 'South America', Brazil: 'South America',
  Nigeria: 'Africa', Senegal: 'Africa', Angola: 'Africa', Tunisia: 'Africa', Egypt: 'Africa',
};
const FOREIGN_COUNTRIES = Object.keys(REGION_BY_COUNTRY);

const FIRST_NAMES = {
  USA: ['Jalen','Marcus','Darius','Jordan','Cameron','Malik','Tyrese','Isaiah','Devin','Jaylen','Tre','Miles','Cole','Andre','Noah','Caleb','Jamal','Micah'],
  Spain: ['Alejandro','Sergio','Pablo','Hugo','Álvaro','Javier','Mario','Dani','Iker','Adrián'],
  Serbia: ['Nikola','Luka','Miloš','Bogdan','Stefan','Marko','Aleksa','Vuk','Nemanja','Filip'],
  France: ['Victor','Theo','Mathis','Hugo','Nolan','Enzo','Alexandre','Louis','Yanis','Maxime'],
  Germany: ['Lukas','Jonas','Felix','Leon','Max','Moritz','Julian','Finn','Noah','Tobias'],
  Italy: ['Marco','Luca','Matteo','Davide','Andrea','Simone','Federico','Gabriele','Paolo','Riccardo'],
  Greece: ['Nikos','Giorgos','Kostas','Dimitris','Vasilis','Petros','Stavros','Alexandros','Manolis','Yiannis'],
  Turkey: ['Emre','Kerem','Mert','Arda','Berk','Can','Efe','Ozan','Deniz','Burak'],
  Lithuania: ['Jonas','Mantas','Lukas','Domantas','Rokas','Tomas','Arnas','Deividas','Karolis','Mindaugas'],
  Israel: ['Noam','Daniel','Ariel','Eitan','Omer','Lior','Itay','Nadav','Gil','Yoni'],
  Russia: ['Alexey','Dmitri','Ivan','Mikhail','Andrei','Kirill','Nikita','Pavel','Sergei','Viktor'],
  Japan: ['Haruto','Ren','Yuto','Sota','Kaito','Takumi','Riku','Daiki','Naoki','Kenji'],
  China: ['Wei','Jun','Hao','Bo','Lei','Tao','Ming','Jian','Peng','Chen'],
  Australia: ['Liam','Jack','Noah','Oliver','Henry','Ethan','Lucas','Mason','Cooper','Oscar'],
  Brazil: ['Lucas','Gabriel','Pedro','Matheus','Rafael','João','Bruno','Felipe','Thiago','Caio'],
  Argentina: ['Mateo','Santiago','Tomás','Joaquín','Nicolás','Agustín','Franco','Lautaro','Valentín','Facundo'],
  Canada: ['Liam','Noah','Ethan','Oliver','Lucas','Benjamin','William','Mason','Logan','Jacob'],
  Nigeria: ['Chinedu','Ifeanyi','Tunde','Emeka','Kelechi','Seyi','Obinna','Ade','Femi','Uche'],
  Senegal: ['Mamadou','Ibrahima','Cheikh','Ousmane','Babacar','Moussa','Pape','Abdoulaye','Modou','Amadou'],
};
const LAST_NAMES = {
  USA: ['Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Robinson','Walker','Young'],
  Spain: ['García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Ruiz'],
  Serbia: ['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Pavlović','Milošević','Simić'],
  France: ['Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Dubois','Moreau','Laurent'],
  Germany: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schäfer'],
  Italy: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco'],
  Greece: ['Papadopoulos','Georgiou','Nikolaidis','Pappas','Vasileiou','Dimitriou','Ioannidis','Christou','Alexiou','Kostas'],
  Turkey: ['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Öztürk','Arslan','Koç'],
  Lithuania: ['Kazlauskas','Petrauskas','Jankauskas','Stankevičius','Vasiliauskas','Paulauskas','Žukauskas','Urbonas','Kavaliauskas','Butkus'],
  Israel: ['Cohen','Levi','Mizrahi','Peretz','Biton','Dahan','Avraham','Friedman','Azoulay','Katz'],
  Russia: ['Ivanov','Smirnov','Kuznetsov','Popov','Sokolov','Lebedev','Kozlov','Novikov','Morozov','Volkov'],
  Japan: ['Watanabe','Sato','Suzuki','Takahashi','Tanaka','Ito','Yamamoto','Nakamura','Kobayashi','Kato'],
  China: ['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou'],
  Australia: ['Smith','Jones','Williams','Brown','Wilson','Taylor','Johnson','White','Martin','Anderson'],
  Brazil: ['Silva','Santos','Oliveira','Souza','Pereira','Costa','Rodrigues','Almeida','Nascimento','Lima'],
  Argentina: ['González','Rodríguez','Gómez','Fernández','López','Díaz','Martínez','Pérez','Romero','Sosa'],
  Canada: ['Smith','Brown','Tremblay','Martin','Roy','Wilson','MacDonald','Gagnon','Lee','Johnson'],
  Nigeria: ['Okafor','Adeyemi','Eze','Olawale','Nwosu','Balogun','Adebayo','Onyeka','Okeke','Ibrahim'],
  Senegal: ['Ndiaye','Diop','Fall','Sow','Ba','Gueye','Faye','Sarr','Diallo','Cissé'],
};

const ROLES = {
  PG: ['Primary creator','Floor general','Scoring guard','Movement shooter','Perimeter stopper'],
  SG: ['Three-level scorer','Movement shooter','Slasher','Secondary creator','Perimeter stopper'],
  SF: ['Two-way wing','Point forward','Slasher','Spot-up shooter','Secondary creator'],
  PF: ['Stretch big','Face-up scorer','Rebounder','Two-way forward','Interior scorer'],
  C: ['Low-post scorer','Rim protector','Rim runner','Rebounder','Playmaking big'],
};
const BODY_BY_POSITION = {
  PG: ['Slim','Slim','Normal','Normal','Normal','Muscular','Heavy'],
  SG: ['Slim','Normal','Normal','Normal','Muscular','Muscular','Heavy'],
  SF: ['Slim','Normal','Normal','Muscular','Muscular','Heavy'],
  PF: ['Normal','Normal','Muscular','Muscular','Heavy','Heavy'],
  C: ['Normal','Muscular','Muscular','Heavy','Heavy','Heavy'],
};
const HEIGHT = { PG: [178,198], SG: [185,204], SF: [194,210], PF: [201,216], C: [207,224] };

const RARITIES = [
  { name: 'Common', base: [66,72], career: [6,10] },
  { name: 'Uncommon', base: [73,78], career: [7,11] },
  { name: 'Rare', base: [79,83], career: [8,12] },
  { name: 'Epic', base: [84,88], career: [10,13] },
  { name: 'Legend', base: [89,93], career: [12,15] },
  { name: 'Generational', base: [94,98], career: [14,18] },
];
const RARITY_WEIGHTS = {
  NCAA: [77,17,4.8,1,0.18,0.02],
  NBA: [2,12,34,36,13.5,2.5],
  EuroElite: [12,31,34,18,4.5,0.5],
  ProTop: [28,39,24,7.5,1.4,0.1],
  Pro: [48,34,14,3.4,0.55,0.05],
  Tier2: [65,27,7,0.9,0.09,0.01],
  GLeague: [43,36,16,4.5,0.45,0.05],
  Academy: [68,23,7,1.7,0.27,0.03],
};
const CAREER_PROFILES = ['Young prodigy','Classic prime','Late bloomer','Early peak','Durable veteran','Volatile talent'];

const PRESTIGE_OVERRIDES = new Map([
  ['Los Angeles Lakers',10],['Boston Celtics',10],['Golden State Warriors',9.6],['San Antonio Spurs',8.8],
  ['Real Madrid',9.4],['FC Barcelona',9.1],['Olympiacos',8.9],['Panathinaikos',8.9],['Fenerbahçe',8.7],
  ['Anadolu Efes',8.5],['CSKA Moscow',8.5],['Žalgiris Kaunas',8.2],['Maccabi Tel Aviv',8.2],
  ['Duke',7.8],['North Carolina',7.8],['Kentucky',7.8],['Kansas',7.8],['UConn',7.7],['UCLA',7.7],
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const choice = (array, random) => array[Math.floor(random() * array.length)];
const integer = (min, max, random) => Math.floor(random() * (max - min + 1)) + min;

function createRandom(seed = 20260729) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function stateRandom(state) {
  state.rngState = (state.rngState * 1664525 + 1013904223) >>> 0;
  return state.rngState / 4294967296;
}
function weightedChoice(items, weights, random) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = random() * total;
  for (let index = 0; index < items.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return items[index];
  }
  return items[items.length - 1];
}
function rarityForClass(talentClass, random) {
  const weights = RARITY_WEIGHTS[talentClass] ?? RARITY_WEIGHTS.Pro;
  return weightedChoice(RARITIES, weights, random);
}
function createCareerCurve(profile, years) {
  return Array.from({ length: years }, (_, index) => {
    const t = years === 1 ? 0 : index / (years - 1);
    let value = 0.9;
    if (profile === 'Young prodigy') value = t < 0.28 ? 0.86 + t * 0.50 : t < 0.58 ? 1.005 - (t - 0.28) * 0.02 : 0.999 - (t - 0.58) * 0.31;
    if (profile === 'Classic prime') value = t < 0.30 ? 0.82 + t * 0.52 : t < 0.64 ? 0.976 + (t - 0.30) * 0.08 : 1.003 - (t - 0.64) * 0.34;
    if (profile === 'Late bloomer') value = t < 0.38 ? 0.79 + t * 0.33 : t < 0.72 ? 0.915 + (t - 0.38) * 0.27 : 1.007 - (t - 0.72) * 0.36;
    if (profile === 'Early peak') value = t < 0.23 ? 0.90 + t * 0.45 : t < 0.46 ? 1.004 - (t - 0.23) * 0.11 : 0.979 - (t - 0.46) * 0.36;
    if (profile === 'Durable veteran') value = t < 0.25 ? 0.85 + t * 0.46 : t < 0.76 ? 0.965 + (t - 0.25) * 0.04 : 0.985 - (t - 0.76) * 0.25;
    if (profile === 'Volatile talent') value = 0.89 + Math.sin(index * 1.8) * 0.055 + (t < 0.48 ? t * 0.16 : (1 - t) * 0.10);
    return round(clamp(value, 0.72, 1.015), 3);
  });
}

function playerName(country, random) {
  const first = FIRST_NAMES[country] ?? FIRST_NAMES.USA;
  const last = LAST_NAMES[country] ?? LAST_NAMES.USA;
  return `${choice(first, random)} ${choice(last, random)}`;
}
function localCountries(team) {
  if (team.type === 'NBA') return ['USA','Canada'];
  return [team.country];
}
function chooseNationality(team, random, forceLocal = false) {
  const locals = localCountries(team);
  if (forceLocal || random() < 0.8) return choice(locals, random);
  return choice(FOREIGN_COUNTRIES.filter((country) => !locals.includes(country)), random);
}
function buildStats(player, random) {
  const usageRoles = ['Primary creator','Scoring guard','Three-level scorer','Low-post scorer','Interior scorer'];
  const creatorRoles = ['Primary creator','Floor general','Point forward','Secondary creator','Playmaking big'];
  const defenderRoles = ['Perimeter stopper','Two-way wing','Two-way forward','Rim protector'];
  const minutesBase = player.teamType === 'NCAA' ? 28 : player.teamType === 'NBA' ? 19 : 21;
  const minutes = round(clamp(minutesBase + (player.current - 70) * 0.55 + random() * 3, player.teamType === 'NCAA' ? 24 : 8, 38), 1);
  const roleUsage = usageRoles.includes(player.role) ? 1.13 : player.role === 'Spot-up shooter' ? 1.05 : 0.95;
  const positionRebounds = { PG: 2.4, SG: 3.0, SF: 4.5, PF: 6.1, C: 7.5 }[player.position];
  const creator = creatorRoles.includes(player.role);
  const defender = defenderRoles.includes(player.role);
  const competitionFactor = player.teamType === 'NCAA' ? 0.92 : player.teamType === 'NBA' ? 1 : 0.96;
  const ppg = clamp((player.current - 51) * 0.48 * (minutes / 30) * roleUsage * competitionFactor + random() * 2.2, 1.2, 35.5);
  const rpg = clamp(positionRebounds + (player.rebounding - 70) * 0.095 + (minutes - 25) * 0.08 + random(), 0.7, 16.5);
  const apg = clamp((creator ? 4.0 : 1.2) + (player.passing - 70) * 0.105 + (minutes - 25) * 0.05 + random(), 0.3, 12.8);
  return {
    games: 0, minutes,
    ppg: round(ppg, 1), rpg: round(rpg, 1),
    orpg: round(rpg * ({ PG: 0.12, SG: 0.13, SF: 0.19, PF: 0.29, C: 0.36 }[player.position]) + random() * 0.2, 1),
    drpg: 0,
    apg: round(apg, 1),
    spg: round(clamp(0.4 + (player.perimeterDefense - 60) * 0.024 + (defender ? 0.28 : 0) + random() * 0.35, 0.1, 3.1), 1),
    bpg: round(clamp(0.08 + (player.interiorDefense - 60) * 0.03 + (player.position === 'C' ? 0.5 : 0) + (player.role === 'Rim protector' ? 0.65 : 0), 0.1, 4.2), 1),
    fg: round(clamp(39 + (player.inside + player.midrange - 130) * 0.11 + random() * 3, 33, 69), 1),
    three: round(clamp(25 + (player.three - 52) * 0.27 + random() * 3, 16, 51), 1),
    ft: round(clamp(61 + (player.midrange + player.three - 125) * 0.18 + random() * 4, 48, 96), 1),
  };
}

function createPlayer(team, position, age, random, id, spawnYear, options = {}) {
  const talentClass = options.talentClass ?? team.talentClass ?? 'Pro';
  const rarity = rarityForClass(talentClass, random);
  let base = integer(rarity.base[0], rarity.base[1], random);
  if (team.type === 'NBA' && options.initial) base = clamp(base + integer(0, 2, random), rarity.base[0], 99);
  const careerYears = integer(rarity.career[0], rarity.career[1], random);
  const careerProfile = choice(CAREER_PROFILES, random);
  const careerCurve = createCareerCurve(careerProfile, careerYears);
  let careerYear = clamp(age - 18, 0, careerYears - 1);
  if (options.initial && team.type !== 'NCAA') {
    // Seed the opening universe across every career stage instead of pushing
    // older generated players artificially into their final season.
    careerYear = options.initialCareerYear ?? integer(0, careerYears - 1, random);
    age = 18 + careerYear;
  }
  const annualShape = round(0.95 + random() * 0.06, 3);
  const current = Math.round(clamp(base * careerCurve[careerYear] * annualShape, 48, 99));
  const body = choice(BODY_BY_POSITION[position], random);
  const height = integer(HEIGHT[position][0], HEIGHT[position][1], random);
  const role = choice(ROLES[position], random);
  const nationality = options.nationality ?? chooseNationality(team, random, options.forceLocal);
  const bodyPenalty = body === 'Heavy' && ['PG','SG'].includes(position) ? 5 : 0;
  const sizeBonus = body === 'Heavy' && ['PF','C'].includes(position) ? 5 : 0;
  const player = {
    id, name: playerName(nationality, random), nationality, region: REGION_BY_COUNTRY[nationality] ?? team.region,
    age, position, height, body, role, rarity: rarity.name, base, careerYears, careerYear, careerProfile, careerCurve,
    annualShape, current, potential: Math.round(clamp(base * 1.02, base, 99)),
    teamId: team.id, teamName: team.name, teamType: team.type, competition: team.competition,
    competitionId: team.competitionId, spawnYear, status: 'Active', draft: null, rightsTeamId: null,
    honors: [], history: [], careerEvents: [{ year: spawnYear, type: 'Debut', detail: `Entered the basketball world with ${team.name}.` }],
    inside: Math.round(clamp(current + (['C','PF'].includes(position) ? 5 : 0) + sizeBonus + (random() - 0.5) * 10, 35, 99)),
    midrange: Math.round(clamp(current + (random() - 0.5) * 10, 35, 99)),
    three: Math.round(clamp(current + (['PG','SG','SF'].includes(position) ? 3 : -4) - bodyPenalty + (random() - 0.5) * 12, 28, 99)),
    passing: Math.round(clamp(current + (position === 'PG' ? 8 : position === 'C' ? -7 : 0) + (random() - 0.5) * 10, 28, 99)),
    rebounding: Math.round(clamp(current + ({ PG: -12, SG: -8, SF: -1, PF: 7, C: 11 }[position]) + sizeBonus + (random() - 0.5) * 9, 28, 99)),
    perimeterDefense: Math.round(clamp(current + (['PG','SG','SF'].includes(position) ? 2 : -5) - bodyPenalty + (random() - 0.5) * 10, 28, 99)),
    interiorDefense: Math.round(clamp(current + ({ PG: -14, SG: -10, SF: -2, PF: 6, C: 11 }[position]) + sizeBonus + (random() - 0.5) * 10, 24, 99)),
  };
  player.stats = buildStats(player, random);
  player.stats.drpg = round(Math.max(0.2, player.stats.rpg - player.stats.orpg), 1);
  return player;
}

function createCoach(team, random, id) {
  const nationality = random() < 0.82 ? choice(localCountries(team), random) : choice(FOREIGN_COUNTRIES, random);
  const base = team.type === 'NBA' ? integer(75,92,random) : team.secondaryCompetitionIds.includes('euroleague') ? integer(72,90,random) : integer(62,84,random);
  const styles = ['Pace and space','Motion offense','Isolation','Post-centric','Defensive pressure','Drop coverage','Switching','Development-first'];
  return {
    id, name: playerName(nationality, random), nationality, teamId: team.id, teamName: team.name,
    offense: clamp(base + integer(-6,7,random),50,99), defense: clamp(base + integer(-6,7,random),50,99),
    development: clamp(base + integer(-8,8,random),50,99), rotations: clamp(base + integer(-8,8,random),50,99),
    playoff: clamp(base + integer(-8,8,random),50,99), management: clamp(base + integer(-8,8,random),50,99),
    style: choice(styles, random), honors: [], history: [],
  };
}

function teamTalentClass(team) {
  if (team.type === 'NBA') return 'NBA';
  if (team.type === 'NCAA') return 'NCAA';
  if (team.type === 'GLeague') return 'GLeague';
  if (team.tier === 2) return 'Tier2';
  if (team.secondaryCompetitionIds.includes('euroleague')) return 'EuroElite';
  if (team.prestige >= 7.2) return 'ProTop';
  return 'Pro';
}
function createTeams() {
  let id = 1;
  const teams = [];
  const add = (data) => {
    const primaryId = competitionId(data.competition);
    const secondaryCompetitionIds = (data.secondaryCompetitions ?? []).map(competitionId);
    const prestige = PRESTIGE_OVERRIDES.get(data.name) ?? (
      data.type === 'NBA' ? 8.2 + (id % 5) * 0.25 :
      secondaryCompetitionIds.includes('euroleague') ? 7.7 + (id % 4) * 0.22 :
      data.type === 'NCAA' ? 4.5 + (id % 7) * 0.25 :
      data.tier === 2 ? 3.7 : 5.6 + (id % 5) * 0.2
    );
    const team = {
      id: id++, wins: 0, losses: 0, rosterIds: [], rating: 70, rawRating: 70,
      history: [], honors: [], transactions: [], seasonRecords: {},
      targetRoster: data.type === 'NCAA' ? 5 : 10,
      localMinimum: data.type === 'NCAA' ? 4 : data.type === 'NBA' ? 6 : 5,
      prestige: round(prestige,1), competitionId: primaryId, secondaryCompetitionIds,
      ...data,
    };
    team.talentClass = teamTalentClass(team);
    teams.push(team);
  };

  NBA_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NBA', type: 'NBA', tier: 1, secondaryCompetitions: [] }));
  G_LEAGUE_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: team.league, type: 'GLeague', tier: 2, secondaryCompetitions: [] }));
  NCAA_PROGRAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NCAA Division I', type: 'NCAA', tier: 1, secondaryCompetitions: ['NCAA Tournament', team.conference] }));
  EURO_TOP_CLUBS.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', tier: 1, secondaryCompetitions: ['EuroLeague'] }));
  EURO_DOMESTIC.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', secondaryCompetitions: EUROCUP_CLUBS.has(team.name) ? ['EuroCup'] : [] }));
  OTHER_PRO_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country], competition: team.league, type: 'Pro', tier: 1, secondaryCompetitions: [] }));
  EXTENDED_PRO_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country] ?? 'Europe', competition: team.league, type: 'Pro', secondaryCompetitions: EUROCUP_CLUBS.has(team.name) ? ['EuroCup'] : [] }));
  return teams;
}

export function getCompetition(competitionIdValue) {
  return COMPETITION_BY_ID.get(competitionIdValue);
}
export function getCompetitionParticipants(universe, competitionIdValue) {
  const competition = getCompetition(competitionIdValue);
  if (!competition) return [];
  if (competition.kind === 'playoffs') return universe.teams.filter((team) => team.competition === competition.source);
  if (competition.kind === 'tournament' && competition.source) return universe.teams.filter((team) => team.competition === competition.source);
  if (competition.kind === 'continental') return universe.teams.filter((team) => team.secondaryCompetitionIds.includes(competition.id));
  if (competition.kind === 'cup' || competition.kind === 'supercup') {
    if (competition.country === 'Serbia') return universe.teams.filter((team) => team.country === 'Serbia' && team.tier === 1 && team.type === 'Pro');
    return universe.teams.filter((team) => team.country === competition.country && team.tier === 1 && team.type === 'Pro');
  }
  return universe.teams.filter((team) => team.competitionId === competition.id);
}
function initializeSeasonRecords(teams) {
  teams.forEach((team) => {
    const ids = [team.competitionId, ...team.secondaryCompetitionIds].filter((id) => COMPETITION_BY_ID.has(id));
    team.seasonRecords = Object.fromEntries(ids.map((id) => [id, { wins: 0, losses: 0 }]));
  });
}
function recalculateTeamRatings(teams, players, coaches = []) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const coachById = new Map(coaches.map((coach) => [coach.id, coach]));
  return teams.map((team) => {
    const roster = team.rosterIds.map((id) => playerById.get(id)).filter(Boolean).sort((a, b) => b.current - a.current);
    const count = team.type === 'NCAA' ? 5 : 8;
    const active = roster.slice(0, count);
    const rawRating = active.length ? active.reduce((sum, player, index) => sum + player.current * (index < 5 ? 1 : 0.7), 0) / active.reduce((sum, _player, index) => sum + (index < 5 ? 1 : 0.7), 0) : 50;
    const coach = coachById.get(team.coachId);
    const coachBonus = coach ? ((coach.offense + coach.defense + coach.rotations) / 3 - 72) * 0.08 : 0;
    const adjustment = team.type === 'NBA' ? 4.8 : team.secondaryCompetitionIds.includes('euroleague') ? 1.8 : team.type === 'NCAA' ? -6.5 : team.type === 'GLeague' ? -2.5 : team.tier === 2 ? -2 : 0;
    return { ...team, rawRating: round(rawRating,1), rating: round(clamp(rawRating + adjustment + coachBonus,45,99),1) };
  });
}

export function createUniverse(seed = 20260729) {
  const random = createRandom(seed);
  let teams = createTeams();
  const players = [];
  const coaches = [];
  let playerId = 1;
  let coachId = 1;
  let collegeIndex = 0;

  teams.forEach((team) => {
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position, positionIndex) => {
        // Four equal cohorts create roughly 250 departures from 1,000 players every year.
        const age = 18 + (collegeIndex % 4);
        collegeIndex += 1;
        const player = createPlayer(team, position, age, random, playerId++, 2026 - (age - 18), {
          initial: true, talentClass: 'NCAA', forceLocal: positionIndex < 4,
        });
        players.push(player);
        team.rosterIds.push(player.id);
      });
    } else {
      for (let index = 0; index < team.targetRoster; index += 1) {
        const position = POSITIONS[index % POSITIONS.length];
        const maxAge = team.type === 'GLeague' ? 29 : 35;
        const age = integer(18, maxAge, random);
        const player = createPlayer(team, position, age, random, playerId++, 2026 - (age - 18), {
          initial: true, talentClass: team.talentClass, forceLocal: index < team.localMinimum,
        });
        players.push(player);
        team.rosterIds.push(player.id);
      }
    }
    const coach = createCoach(team, random, coachId++);
    coaches.push(coach);
    team.coachId = coach.id;
  });
  initializeSeasonRecords(teams);
  teams = recalculateTeamRatings(teams, players, coaches);
  return {
    version: 4, seed, rngState: seed >>> 0, year: 2026, week: 1, phase: 'Regular season', yearReview: false,
    finalizedYear: null, teams, players, coaches, retiredPlayers: [], retiredCoaches: [], transactions: [],
    draftHistory: [], draftRights: [], spawnHistory: [], results: [], promotions: [], competitionHistory: {},
    nextPlayerId: playerId, nextCoachId: coachId,
  };
}

function recordFor(team, competitionIdValue) {
  if (!team.seasonRecords[competitionIdValue]) team.seasonRecords[competitionIdValue] = { wins: 0, losses: 0 };
  return team.seasonRecords[competitionIdValue];
}
function simulateCompetitionWeek(state, competition) {
  if (!['league','continental'].includes(competition.kind)) return;
  const participants = getCompetitionParticipants(state, competition.id);
  if (participants.length < 2) return;
  const averageRating = participants.reduce((sum, team) => sum + team.rating, 0) / participants.length;
  participants.forEach((team) => {
    let games = 0;
    if (competition.id === 'nba') games = state.week <= 40 ? 2 + (state.week <= 2 ? 1 : 0) : 0;
    else if (competition.id === 'nba-g-league') games = state.week <= 25 ? 2 : 0;
    else if (competition.id === 'ncaa-division-i') games = state.week <= 30 ? 1 + (state.week <= 6 ? 1 : 0) : 0;
    else if (competition.kind === 'continental') games = state.week <= 34 ? 1 : 0;
    else games = state.week <= 34 ? 1 : 0;
    const record = recordFor(team, competition.id);
    for (let game = 0; game < games; game += 1) {
      const chemistry = (team.prestige - 6) * 0.006;
      const probability = clamp(0.5 + (team.rating - averageRating) * 0.025 + chemistry, 0.12, 0.88);
      if (stateRandom(state) < probability) record.wins += 1;
      else record.losses += 1;
    }
  });
}
function refreshPrimaryRecords(state) {
  state.teams.forEach((team) => {
    const record = recordFor(team, team.competitionId);
    team.wins = record.wins;
    team.losses = record.losses;
  });
}
function currentTopTeams(state) {
  return [...state.teams].sort((a, b) => {
    const aRecord = a.wins / Math.max(1, a.wins + a.losses);
    const bRecord = b.wins / Math.max(1, b.wins + b.losses);
    return bRecord - aRecord || b.rating - a.rating;
  });
}

export function simulateWeeks(universe, numberOfWeeks) {
  if (universe.yearReview) return universe;
  const state = structuredClone(universe);
  const weeksToRun = Math.min(numberOfWeeks, 40 - state.week + 1);
  for (let index = 0; index < weeksToRun; index += 1) {
    COMPETITIONS.forEach((competition) => simulateCompetitionWeek(state, competition));
    refreshPrimaryRecords(state);
    state.players.forEach((player) => {
      const team = state.teams.find((item) => item.id === player.teamId);
      const record = team ? recordFor(team, team.competitionId) : null;
      player.stats.games = record ? Math.min(record.wins + record.losses, player.teamType === 'NCAA' ? 36 : 82) : player.stats.games;
    });
    const leaders = currentTopTeams(state).slice(0, 2);
    if (leaders.length === 2) {
      state.results.unshift({
        year: state.year, week: state.week,
        headline: `${leaders[0].name} lead the world form table ahead of ${leaders[1].name}`,
        detail: `${leaders[0].wins}–${leaders[0].losses}; team rating ${leaders[0].rating}.`,
      });
    }
    state.week += 1;
  }
  if (state.week > 40) {
    state.week = 40;
    finalizeSeason(state);
    state.phase = 'Year review';
    state.yearReview = true;
  }
  return state;
}

function standingsFor(state, competition) {
  return getCompetitionParticipants(state, competition.id).map((team) => {
    const record = team.seasonRecords[competition.id] ?? team.seasonRecords[team.competitionId] ?? { wins: 0, losses: 0 };
    return { team, wins: record.wins, losses: record.losses, pct: record.wins / Math.max(1, record.wins + record.losses) };
  }).sort((a, b) => b.pct - a.pct || b.team.rating - a.team.rating);
}
function recentTitlePenalty(state, competitionIdValue, teamId) {
  return (state.competitionHistory[competitionIdValue] ?? []).slice(0, 3).filter((season) => season.championTeamId === teamId).length * 2.8;
}
function selectFinalists(state, competition, standings) {
  const candidates = standings.slice(0, Math.min(12, standings.length)).map((entry) => {
    const cupRandomness = ['cup','supercup','tournament'].includes(competition.kind) ? 12 : competition.kind === 'continental' || competition.kind === 'playoffs' ? 8 : 5;
    return {
      ...entry,
      score: entry.team.rating + entry.pct * 9 + (stateRandom(state) - 0.5) * cupRandomness - recentTitlePenalty(state, competition.id, entry.team.id),
    };
  }).sort((a, b) => b.score - a.score);
  return [candidates[0], candidates[1] ?? candidates[0]];
}
function playerCompetitionScore(player, championTeamId, randomValue) {
  const championBonus = player.teamId === championTeamId ? 4.5 : 0;
  return player.stats.ppg * 1.15 + player.stats.rpg * 0.58 + player.stats.apg * 0.82 + player.stats.spg * 1.4 + player.stats.bpg * 1.35 + player.current * 0.08 + championBonus + randomValue * 3;
}
function playerSnapshot(player) {
  return { id: player.id, name: player.name, teamId: player.teamId, team: player.teamName, value: player.current, position: player.position };
}
function statLeader(players, key) {
  const player = [...players].sort((a, b) => b.stats[key] - a.stats[key] || b.current - a.current)[0];
  return player ? { ...playerSnapshot(player), value: player.stats[key] } : null;
}
function addPlayerHonor(player, honor) {
  if (!player) return;
  if (!player.honors.some((item) => item.year === honor.year && item.competitionId === honor.competitionId && item.type === honor.type)) player.honors.push(honor);
}
function addTeamHonor(team, honor) {
  if (!team) return;
  if (!team.honors.some((item) => item.year === honor.year && item.competitionId === honor.competitionId && item.type === honor.type)) team.honors.push(honor);
}
function finalizeSeason(state) {
  if (state.finalizedYear === state.year) return;
  const titlesByTeam = new Map();
  const seasonHonorsByPlayer = new Map();

  COMPETITIONS.forEach((competition) => {
    const standings = standingsFor(state, competition);
    if (standings.length < 2) return;
    const [championEntry, runnerEntry] = selectFinalists(state, competition, standings);
    const participants = new Set(standings.map((entry) => entry.team.id));
    const players = state.players.filter((player) => participants.has(player.teamId) && player.stats.games > 0);
    if (!players.length) return;
    const recentSeasons = (state.competitionHistory[competition.id] ?? []).slice(0, 3);
    const recentMvpCount = (playerId) => recentSeasons.filter((season) => season.mvp?.id === playerId).length;
    const recentFinalsMvpCount = (playerId) => recentSeasons.filter((season) => season.finalsMvp?.id === playerId).length;
    const mvpScores = players.map((player) => ({ player, score: playerCompetitionScore(player, championEntry.team.id, stateRandom(state)) - recentMvpCount(player.id) * 5.5 }));
    const mvp = mvpScores.sort((a, b) => b.score - a.score)[0].player;
    const championPlayers = players.filter((player) => player.teamId === championEntry.team.id);
    const finalsScores = championPlayers.map((player) => ({ player, score: playerCompetitionScore(player, championEntry.team.id, stateRandom(state)) - recentFinalsMvpCount(player.id) * 4 }));
    const finalsMvp = finalsScores.sort((a, b) => b.score - a.score)[0]?.player ?? mvp;
    const leaders = {
      points: statLeader(players, 'ppg'), rebounds: statLeader(players, 'rpg'), assists: statLeader(players, 'apg'),
      steals: statLeader(players, 'spg'), blocks: statLeader(players, 'bpg'),
    };
    const season = {
      year: state.year, competitionId: competition.id, competition: competition.name,
      championTeamId: championEntry.team.id, champion: championEntry.team.name,
      runnerUpTeamId: runnerEntry.team.id, runnerUp: runnerEntry.team.name,
      mvp: playerSnapshot(mvp), finalsMvp: playerSnapshot(finalsMvp), leaders,
      standings: standings.slice(0, 24).map((entry, index) => ({ rank: index + 1, teamId: entry.team.id, team: entry.team.name, wins: entry.wins, losses: entry.losses, rating: entry.team.rating })),
      playerStats: players.map((player) => {
        const team = state.teams.find((item) => item.id === player.teamId);
        const record = team?.seasonRecords[competition.id];
        const knockoutGames = competition.kind === 'supercup' ? 2 : competition.kind === 'cup' ? 5 : competition.kind === 'tournament' ? 6 : null;
        const scheduledCap = competition.id === 'nba' ? 82 : competition.id === 'nba-g-league' ? 50 : competition.id === 'ncaa-division-i' ? 36 : competition.kind === 'continental' ? 34 : 34;
        const games = knockoutGames ?? Math.min(scheduledCap, Math.max(1, (record?.wins ?? 0) + (record?.losses ?? 0)));
        return {
          playerId: player.id, player: player.name, teamId: player.teamId, team: player.teamName,
          games, ppg: player.stats.ppg, rpg: player.stats.rpg, apg: player.stats.apg,
          points: player.stats.ppg * games, rebounds: player.stats.rpg * games,
          assists: player.stats.apg * games,
        };
      }),
    };
    if (!state.competitionHistory[competition.id]) state.competitionHistory[competition.id] = [];
    state.competitionHistory[competition.id].unshift(season);

    const teamHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: 'Champion' };
    addTeamHonor(championEntry.team, teamHonor);
    titlesByTeam.set(championEntry.team.id, [...(titlesByTeam.get(championEntry.team.id) ?? []), competition.name]);
    const mvpHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: 'MVP' };
    const finalsHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: competition.kind === 'league' ? 'Playoff MVP' : 'Finals MVP' };
    addPlayerHonor(mvp, mvpHonor);
    addPlayerHonor(finalsMvp, finalsHonor);
    seasonHonorsByPlayer.set(mvp.id, [...(seasonHonorsByPlayer.get(mvp.id) ?? []), `${competition.name} MVP`]);
    seasonHonorsByPlayer.set(finalsMvp.id, [...(seasonHonorsByPlayer.get(finalsMvp.id) ?? []), `${competition.name} Finals MVP`]);
    Object.entries(leaders).forEach(([key, leader]) => {
      const player = state.players.find((item) => item.id === leader?.id);
      if (!player) return;
      const type = `${key[0].toUpperCase()}${key.slice(1)} leader`;
      addPlayerHonor(player, { year: state.year, competitionId: competition.id, competition: competition.name, type });
      seasonHonorsByPlayer.set(player.id, [...(seasonHonorsByPlayer.get(player.id) ?? []), `${competition.name} ${type}`]);
    });
  });

  state.teams.forEach((team) => {
    const record = team.seasonRecords[team.competitionId] ?? { wins: team.wins, losses: team.losses };
    team.history.push({
      year: state.year, competitionId: team.competitionId, competition: team.competition,
      wins: record.wins, losses: record.losses, rating: team.rating,
      titles: titlesByTeam.get(team.id) ?? [], coachId: team.coachId,
    });
  });
  state.players.forEach((player) => {
    player.history.push({
      year: state.year, age: player.age, teamId: player.teamId, team: player.teamName,
      competitionId: player.competitionId, competition: player.competition, current: player.current,
      games: player.stats.games, minutes: player.stats.minutes, ppg: player.stats.ppg, rpg: player.stats.rpg,
      orpg: player.stats.orpg, drpg: player.stats.drpg, apg: player.stats.apg, spg: player.stats.spg,
      bpg: player.stats.bpg, fg: player.stats.fg, three: player.stats.three, ft: player.stats.ft,
      honors: seasonHonorsByPlayer.get(player.id) ?? [],
    });
  });
  state.coaches.forEach((coach) => {
    const team = state.teams.find((item) => item.id === coach.teamId);
    if (!team) return;
    coach.history.push({ year: state.year, teamId: team.id, team: team.name, record: `${team.wins}-${team.losses}`, titles: titlesByTeam.get(team.id) ?? [] });
    (titlesByTeam.get(team.id) ?? []).forEach((title) => coach.honors.push({ year: state.year, type: 'Champion', competition: title }));
  });
  state.finalizedYear = state.year;
}

function logTransaction(state, player, type, fromTeam, toTeam, detail) {
  const transaction = { year: state.year, type, playerId: player.id, player: player.name, fromTeamId: fromTeam?.id ?? null, from: fromTeam?.name ?? 'Basketball', toTeamId: toTeam?.id ?? null, to: toTeam?.name ?? 'Retired', headline: `${player.name}: ${fromTeam?.name ?? 'Basketball'} → ${toTeam?.name ?? 'Retired'}`, detail };
  state.transactions.unshift(transaction);
  player.careerEvents.push({ year: state.year, type, detail: transaction.headline + (detail ? ` — ${detail}` : '') });
  if (fromTeam) fromTeam.transactions.unshift(transaction);
  if (toTeam && toTeam.id !== fromTeam?.id) toTeam.transactions.unshift(transaction);
}
function removeFromTeam(team, playerId) {
  if (team) team.rosterIds = team.rosterIds.filter((id) => id !== playerId);
}
function movePlayer(state, player, destination, type, detail) {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  if (oldTeam?.id === destination.id) return;
  removeFromTeam(oldTeam, player.id);
  if (!destination.rosterIds.includes(player.id)) destination.rosterIds.push(player.id);
  player.teamId = destination.id; player.teamName = destination.name; player.teamType = destination.type;
  player.competition = destination.competition; player.competitionId = destination.competitionId; player.status = 'Active';
  logTransaction(state, player, type, oldTeam, destination, detail);
}
function archivePlayer(state, player, reason = 'Retirement') {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  removeFromTeam(oldTeam, player.id);
  player.status = reason === 'Retirement' ? 'Retired' : 'Left professional basketball';
  player.retiredYear = state.year;
  state.draftRights.filter((right) => right.playerId === player.id && right.active).forEach((right) => { right.active = false; });
  logTransaction(state, player, reason, oldTeam, null, reason === 'Retirement' ? `${player.careerYear}-year professional arc completed.` : 'No suitable professional opportunity was available.');
  state.retiredPlayers.unshift(player);
  state.players = state.players.filter((item) => item.id !== player.id);
}
function updatePlayerForNewYear(player, random) {
  player.age += 1;
  player.careerYear += 1;
  if (player.careerYear >= player.careerYears) return false;
  player.annualShape = round(0.95 + random() * 0.06, 3);
  player.current = Math.round(clamp(player.base * player.careerCurve[player.careerYear] * player.annualShape, 46, 99));
  player.stats = buildStats(player, random);
  player.stats.drpg = round(Math.max(0.2, player.stats.rpg - player.stats.orpg), 1);
  return true;
}
function ageProfessionals(state) {
  const random = () => stateRandom(state);
  [...state.players].filter((player) => player.teamType !== 'NCAA').forEach((player) => {
    if (!updatePlayerForNewYear(player, random)) archivePlayer(state, player, 'Retirement');
  });
}
function collegeExitClass(state) {
  const scheduled = state.players.filter((player) => player.teamType === 'NCAA' && player.age >= 21);
  const early = state.players.filter((player) => player.teamType === 'NCAA' && player.age >= 19 && player.age < 21 && player.base >= 84 && stateRandom(state) < 0.55);
  return [...scheduled, ...early];
}
function draftScore(state, player) {
  const agePenalty = Math.max(0, player.age - 19) * 1.3;
  const proExperience = player.teamType !== 'NCAA' ? 2.2 : 0;
  return player.current * 0.48 + player.base * 0.38 + player.potential * 0.14 + proExperience - agePenalty + stateRandom(state) * 5;
}
function runDraft(state, exitClass) {
  const exitIds = new Set(exitClass.map((player) => player.id));
  const international = state.players.filter((player) => player.teamType !== 'NBA' && player.teamType !== 'NCAA' && player.age >= 19 && player.age <= 22 && player.base >= 80);
  const eligible = [...exitClass, ...international.filter((player) => !exitIds.has(player.id))]
    .map((player) => ({ player, score: draftScore(state, player) }))
    .sort((a, b) => b.score - a.score).slice(0, 60);
  const nbaTeams = state.teams.filter((team) => team.type === 'NBA').sort((a, b) => {
    const aPct = a.wins / Math.max(1, a.wins + a.losses);
    const bPct = b.wins / Math.max(1, b.wins + b.losses);
    return aPct - bPct;
  });
  const picks = eligible.map(({ player }, index) => {
    const team = nbaTeams[index % nbaTeams.length];
    const roundNumber = index < 30 ? 1 : 2;
    const pick = index + 1;
    const origin = player.teamName;
    player.draft = { year: state.year, pick, round: roundNumber, teamId: team.id, team: team.name, origin };
    player.rightsTeamId = team.id;
    state.draftRights.push({ playerId: player.id, teamId: team.id, acquiredYear: state.year, active: true });
    player.careerEvents.push({ year: state.year, type: 'NBA Draft', detail: `Selected ${pick}${pick === 1 ? 'st' : pick === 2 ? 'nd' : pick === 3 ? 'rd' : 'th'} by ${team.name} from ${origin}.` });
    return { pick, round: roundNumber, teamId: team.id, team: team.name, playerId: player.id, player: player.name, position: player.position, origin, rarity: player.rarity, base: player.base, joinedNBA: false };
  });
  const draft = { year: state.year, picks, signed: 0, rightsStashed: 0, collegeGraduates: exitClass.length };
  state.draftHistory.unshift(draft);
  return draft;
}
function isLocalForTeam(player, team) {
  return localCountries(team).includes(player.nationality);
}
function rosterPlayers(state, team) {
  return team.rosterIds.map((id) => state.players.find((player) => player.id === id)).filter(Boolean);
}
function foreignCount(state, team) {
  return rosterPlayers(state, team).filter((player) => !isLocalForTeam(player, team)).length;
}
function canAcceptPlayer(state, team, player) {
  if (isLocalForTeam(player, team)) return true;
  return foreignCount(state, team) < team.targetRoster - team.localMinimum;
}
function weakestReplaceable(state, team, incoming) {
  const roster = rosterPlayers(state, team).sort((a, b) => a.current - b.current);
  return roster.find((player) => isLocalForTeam(incoming, team) || !isLocalForTeam(player, team)) ?? roster[0];
}
function findDestination(state, player, { includeGLeague = true, preferEurope = false } = {}) {
  const teams = state.teams.filter((team) => team.type === 'Pro' || (includeGLeague && team.type === 'GLeague'))
    .filter((team) => canAcceptPlayer(state, team, player));
  const scored = teams.map((team) => {
    const roster = rosterPlayers(state, team);
    const weakest = roster.sort((a, b) => a.current - b.current)[0];
    const capacity = roster.length < team.targetRoster ? 8 : player.current - (weakest?.current ?? 50);
    const levelFit = -Math.abs((team.rating - 4) - player.current) * 0.22;
    const local = isLocalForTeam(player, team) ? 5 : 0;
    const europe = preferEurope && team.region === 'Europe' ? 4 : 0;
    return { team, score: capacity + levelFit + local + europe + team.prestige * 0.35 + stateRandom(state) * 3 };
  }).filter((entry) => entry.score > -1).sort((a, b) => b.score - a.score);
  return scored[0]?.team ?? null;
}
function makeRoom(state, team, incoming) {
  if (team.rosterIds.length < team.targetRoster) return true;
  const weakest = weakestReplaceable(state, team, incoming);
  if (!weakest || incoming.current < weakest.current - 1) return false;
  if (team.type === 'NBA') return false;
  archivePlayer(state, weakest, 'Left professional basketball');
  return true;
}
function signDraftPicks(state, draft) {
  const picksByTeam = new Map();
  draft.picks.forEach((pick) => picksByTeam.set(pick.teamId, [...(picksByTeam.get(pick.teamId) ?? []), pick]));
  picksByTeam.forEach((picks, teamId) => {
    const team = state.teams.find((item) => item.id === teamId);
    let joined = 0;
    picks.forEach((pick) => {
      const player = state.players.find((item) => item.id === pick.playerId);
      if (!player || joined >= 2) return;
      const roster = rosterPlayers(state, team).sort((a, b) => a.current - b.current);
      const weakest = roster[0];
      const vacancy = roster.length < team.targetRoster;
      const firstRoundBias = pick.round === 1 ? 2 : -1;
      const joinThreshold = 76 - firstRoundBias;
      const shouldJoin = player.current >= joinThreshold && (vacancy || (weakest && player.current >= weakest.current + 2)) && stateRandom(state) < (pick.round === 1 ? 0.72 : 0.34);
      if (!shouldJoin) return;
      if (!vacancy && weakest) archivePlayer(state, weakest, weakest.history.some((season) => season.competition === 'NBA') ? 'NBA release' : 'Left professional basketball');
      movePlayer(state, player, team, 'NBA signing', `Joined immediately after being drafted ${pick.pick}.`);
      player.nbaJoinedYear = state.year + 1;
      pick.joinedNBA = true;
      const right = state.draftRights.find((item) => item.playerId === player.id && item.teamId === team.id && item.active);
      if (right) right.active = false;
      joined += 1;
      draft.signed += 1;
    });
  });
  draft.rightsStashed = draft.picks.length - draft.signed;
}
function processCollegeExits(state, exitClass) {
  const exitIds = new Set(exitClass.map((player) => player.id));
  [...exitClass].forEach((player) => {
    if (!state.players.some((item) => item.id === player.id) || player.teamType === 'NBA') return;
    const drafted = Boolean(player.draft?.year === state.year);
    const placementChance = drafted ? 0.95 : player.current >= 79 ? 0.86 : player.current >= 75 ? 0.58 : player.current >= 72 ? 0.24 : 0.05;
    if (stateRandom(state) > placementChance) {
      archivePlayer(state, player, 'Left professional basketball');
      return;
    }
    const destination = findDestination(state, player, { includeGLeague: true, preferEurope: drafted });
    if (!destination || !makeRoom(state, destination, player)) {
      archivePlayer(state, player, 'Left professional basketball');
      return;
    }
    movePlayer(state, player, destination, drafted ? 'Draft-and-stash' : 'NCAA graduate signing', drafted ? `${player.draft.team} retained NBA rights while the player began his professional career elsewhere.` : 'Signed after completing his college career.');
  });
  return exitIds;
}

function ageCollegeExits(state, exitClass) {
  const random = () => stateRandom(state);
  [...exitClass].forEach((original) => {
    const player = state.players.find((item) => item.id === original.id);
    if (!player) return;
    if (!updatePlayerForNewYear(player, random)) archivePlayer(state, player, 'Retirement');
  });
}
function ageRemainingCollege(state, exitIds) {
  const random = () => stateRandom(state);
  [...state.players].filter((player) => player.teamType === 'NCAA' && !exitIds.has(player.id)).forEach((player) => {
    if (!updatePlayerForNewYear(player, random)) archivePlayer(state, player, 'Left professional basketball');
  });
}
function runInternationalMarket(state) {
  // NBA players who never establish themselves can build a second career overseas.
  const nbaCandidates = state.players.filter((player) => player.teamType === 'NBA' && player.age >= 23 && player.current <= 77 && player.history.filter((season) => season.competition === 'NBA').length >= 2);
  nbaCandidates.forEach((player) => {
    if (stateRandom(state) > 0.22) return;
    const destination = findDestination(state, player, { includeGLeague: false, preferEurope: true });
    if (!destination || !makeRoom(state, destination, player)) return;
    movePlayer(state, player, destination, 'International transfer', `After struggling to establish an NBA role, ${player.name} moved abroad for a larger role.`);
  });

  // A small number of elite overseas players receive NBA opportunities.
  const overseasStars = state.players.filter((player) => player.teamType === 'Pro' && player.current >= 84 && player.age >= 23 && player.age <= 29);
  overseasStars.forEach((player) => {
    if (stateRandom(state) > 0.09) return;
    const rightsTeam = player.rightsTeamId ? state.teams.find((team) => team.id === player.rightsTeamId) : null;
    const candidates = rightsTeam ? [rightsTeam] : state.teams.filter((team) => team.type === 'NBA').sort((a, b) => a.rating - b.rating).slice(0, 8);
    const destination = candidates.find((team) => {
      const weakest = rosterPlayers(state, team).sort((a, b) => a.current - b.current)[0];
      return team.rosterIds.length < team.targetRoster || (weakest && player.current >= weakest.current + 3);
    });
    if (!destination) return;
    const weakest = rosterPlayers(state, destination).sort((a, b) => a.current - b.current)[0];
    if (destination.rosterIds.length >= destination.targetRoster && weakest) archivePlayer(state, weakest, 'NBA release');
    movePlayer(state, player, destination, 'NBA return', player.rightsTeamId === destination.id ? `${destination.name} activated its long-held draft rights.` : 'Signed after becoming one of the best players outside the NBA.');
    const right = state.draftRights.find((item) => item.playerId === player.id && item.active);
    if (right) right.active = false;
  });
}
function ensureLocalQuota(state, team) {
  if (team.type === 'NCAA') return;
  let roster = rosterPlayers(state, team);
  let locals = roster.filter((player) => isLocalForTeam(player, team)).length;
  while (locals < team.localMinimum) {
    const foreign = roster.filter((player) => !isLocalForTeam(player, team)).sort((a, b) => a.current - b.current)[0];
    if (foreign) archivePlayer(state, foreign, 'Roster release');
    const positionCounts = Object.fromEntries(POSITIONS.map((position) => [position, rosterPlayers(state, team).filter((player) => player.position === position).length]));
    const position = [...POSITIONS].sort((a, b) => positionCounts[a] - positionCounts[b])[0];
    const random = () => stateRandom(state);
    const academy = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: 'Academy', forceLocal: true });
    state.players.push(academy); team.rosterIds.push(academy.id);
    state.currentSpawns.push({ playerId: academy.id, player: academy.name, team: team.name, position, nationality: academy.nationality, rarity: academy.rarity, route: 'Local academy' });
    roster = rosterPlayers(state, team); locals = roster.filter((player) => isLocalForTeam(player, team)).length;
  }
}
function fillRosters(state) {
  state.currentSpawns = [];
  state.teams.forEach((team) => {
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position) => {
        const hasPosition = rosterPlayers(state, team).some((player) => player.position === position);
        if (!hasPosition) {
          const random = () => stateRandom(state);
          const player = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: 'NCAA', forceLocal: stateRandom(state) < 0.8 });
          state.players.push(player); team.rosterIds.push(player.id);
          state.currentSpawns.push({ playerId: player.id, player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: 'NCAA freshman' });
        }
      });
      while (team.rosterIds.length > 5) {
        const extra = rosterPlayers(state, team).sort((a, b) => a.current - b.current)[0];
        if (!extra) break;
        archivePlayer(state, extra, 'Left college basketball');
      }
      return;
    }
    ensureLocalQuota(state, team);
    while (team.rosterIds.length < team.targetRoster) {
      const roster = rosterPlayers(state, team);
      const positionCounts = Object.fromEntries(POSITIONS.map((position) => [position, roster.filter((player) => player.position === position).length]));
      const position = [...POSITIONS].sort((a, b) => positionCounts[a] - positionCounts[b])[0];
      const random = () => stateRandom(state);
      const forceLocal = roster.filter((player) => isLocalForTeam(player, team)).length < team.localMinimum;
      const player = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: 'Academy', forceLocal });
      state.players.push(player); team.rosterIds.push(player.id);
      state.currentSpawns.push({ playerId: player.id, player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: team.type === 'GLeague' ? 'Development signing' : 'Club academy' });
    }
    while (team.rosterIds.length > team.targetRoster) {
      const extra = rosterPlayers(state, team).sort((a, b) => a.current - b.current)[0];
      if (!extra) break;
      archivePlayer(state, extra, team.type === 'NBA' ? 'NBA release' : 'Roster release');
    }
  });
  state.spawnHistory.unshift({ year: state.year + 1, players: state.currentSpawns });
  delete state.currentSpawns;
}
function runPromotionRelegation(state) {
  const pairs = [
    ['Spain','Liga ACB','Primera FEB'],['Greece','Greek League','Greek A2'],['Turkey','Turkish BSL','Turkish TBL'],
    ['Italy','Lega Basket Serie A','Serie A2'],['France','LNB Pro A','Pro B'],['Germany','Basketball Bundesliga','ProA Germany'],
    ['Serbia','Adriatic League','KLS Serbia'],['Lithuania','Lithuanian LKL','NKL Lithuania'],['Israel','Israeli Premier League','Israeli National League'],
    ['Russia','VTB United League','Russian Superleague'],
  ];
  const movements = [];
  pairs.forEach(([country, topName, secondName]) => {
    const top = state.teams.filter((team) => team.country === country && team.competition === topName && !team.secondaryCompetitionIds.includes('euroleague'));
    const second = state.teams.filter((team) => team.country === country && team.competition === secondName);
    if (!top.length || !second.length) return;
    const relegated = [...top].sort((a, b) => a.wins / Math.max(1,a.wins+a.losses) - b.wins / Math.max(1,b.wins+b.losses))[0];
    const promoted = [...second].sort((a, b) => b.wins / Math.max(1,b.wins+b.losses) - a.wins / Math.max(1,a.wins+a.losses))[0];
    relegated.competition = secondName; relegated.competitionId = competitionId(secondName); relegated.tier = 2;
    promoted.competition = topName; promoted.competitionId = competitionId(topName); promoted.tier = 1;
    rosterPlayers(state, relegated).forEach((player) => { player.competition = secondName; player.competitionId = relegated.competitionId; });
    rosterPlayers(state, promoted).forEach((player) => { player.competition = topName; player.competitionId = promoted.competitionId; });
    movements.push({ country, promoted: promoted.name, promotedId: promoted.id, relegated: relegated.name, relegatedId: relegated.id, topCompetition: topName });
  });
  state.promotions.unshift({ year: state.year, movements });
}
function resetSeason(state) {
  initializeSeasonRecords(state.teams);
  state.teams.forEach((team) => { team.wins = 0; team.losses = 0; });
  state.players.forEach((player) => { player.stats.games = 0; });
}

export function advanceToNextYear(universe) {
  if (!universe.yearReview) return universe;
  const state = structuredClone(universe);
  ageProfessionals(state);
  const exitClass = collegeExitClass(state);
  const draft = runDraft(state, exitClass);
  signDraftPicks(state, draft);
  const exitIds = processCollegeExits(state, exitClass);
  ageCollegeExits(state, exitClass);
  ageRemainingCollege(state, exitIds);
  runInternationalMarket(state);
  runPromotionRelegation(state);
  fillRosters(state);
  state.teams = recalculateTeamRatings(state.teams, state.players, state.coaches);
  resetSeason(state);
  state.year += 1; state.week = 1; state.phase = 'Regular season'; state.yearReview = false; state.finalizedYear = null;
  return state;
}

export function competitionRankings(universe, competitionIdValue) {
  const seasons = universe.competitionHistory[competitionIdValue] ?? [];
  const aggregate = new Map();
  seasons.forEach((season) => {
    (season.playerStats ?? []).forEach((stats) => {
      const row = aggregate.get(stats.playerId) ?? { playerId: stats.playerId, player: stats.player, points: 0, rebounds: 0, assists: 0, games: 0, seasons: 0 };
      row.points += stats.points; row.rebounds += stats.rebounds; row.assists += stats.assists; row.games += stats.games; row.seasons += 1;
      aggregate.set(stats.playerId, row);
    });
  });
  const players = [...aggregate.values()];
  const teamAggregate = new Map();
  seasons.forEach((season) => {
    season.standings.forEach((standing) => {
      const row = teamAggregate.get(standing.teamId) ?? { teamId: standing.teamId, team: standing.team, wins: 0, titles: 0 };
      row.wins += standing.wins;
      if (season.championTeamId === standing.teamId) row.titles += 1;
      teamAggregate.set(standing.teamId, row);
    });
  });
  const teamRows = [...teamAggregate.values()];
  return {
    points: [...players].sort((a,b) => b.points-a.points).slice(0,10),
    rebounds: [...players].sort((a,b) => b.rebounds-a.rebounds).slice(0,10),
    assists: [...players].sort((a,b) => b.assists-a.assists).slice(0,10),
    teamWins: [...teamRows].sort((a,b) => b.wins-a.wins).slice(0,10),
    teamTitles: [...teamRows].sort((a,b) => b.titles-a.titles || b.wins-a.wins).slice(0,10),
  };
}


export { COMPETITIONS };
