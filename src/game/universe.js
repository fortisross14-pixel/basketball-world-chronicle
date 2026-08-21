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
import { COMPETITIONS, COMPETITION_BY_ID, competitionId, isCompetitionActive } from '../data/competitionData.js';
import { EXPANDED_REAL_TEAMS, SUMMARY_REAL_TEAMS, NATIONAL_TEAM_COUNTRIES, NATIONAL_COLORS as WORLD_NATIONAL_COLORS } from '../data/worldData.js';
import { REAL_PLAYER_POOLS, REAL_NAME_RATE, REAL_ACTIVE_TARGETS, REAL_ACTIVE_MAXIMUMS, ELITE_ACTIVE_TARGETS } from '../data/historicalPlayers.js';

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
export const POSITION_ORDER = POSITIONS;

const REGION_BY_COUNTRY = {
  USA:'North America', Canada:'North America', Mexico:'North America', 'Puerto Rico':'North America', 'Dominican Republic':'North America', Bahamas:'North America', Panama:'North America',
  Argentina:'South America', Brazil:'South America', Venezuela:'South America', Uruguay:'South America', Colombia:'South America',
  Spain:'Europe', France:'Europe', Serbia:'Europe', Greece:'Europe', Turkey:'Europe', Italy:'Europe', Germany:'Europe', Lithuania:'Europe', Israel:'Europe', Russia:'Europe', Slovenia:'Europe', Montenegro:'Europe', Croatia:'Europe', Poland:'Europe', Belgium:'Europe', Netherlands:'Europe', Latvia:'Europe', Finland:'Europe', Georgia:'Europe', Czechia:'Europe', Ukraine:'Europe', 'Bosnia and Herzegovina':'Europe', Portugal:'Europe', Sweden:'Europe', Denmark:'Europe', Iceland:'Europe', Hungary:'Europe', Romania:'Europe', Bulgaria:'Europe', Switzerland:'Europe', Austria:'Europe',
  UAE:'Asia', Japan:'Asia', China:'Asia', 'South Korea':'Asia', Philippines:'Asia', Iran:'Asia', Lebanon:'Asia', Jordan:'Asia', India:'Asia', 'Saudi Arabia':'Asia', Qatar:'Asia', Bahrain:'Asia', Kazakhstan:'Asia', 'Chinese Taipei':'Asia', Indonesia:'Asia',
  Australia:'Oceania', 'New Zealand':'Oceania',
  Nigeria:'Africa', Senegal:'Africa', Angola:'Africa', Tunisia:'Africa', Egypt:'Africa', Cameroon:'Africa', 'Ivory Coast':'Africa', Mali:'Africa', 'South Sudan':'Africa', 'DR Congo':'Africa', 'Cape Verde':'Africa', Uganda:'Africa', Rwanda:'Africa', Kenya:'Africa', Guinea:'Africa', Mozambique:'Africa',
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
  // NCAA and club-youth annual elite slots are assigned by the yearly talent
  // plan. These fallback weights are deliberately conservative so the plan,
  // rather than accidental repeated rolls, controls the elite population.
  NCAA: [72.5,20,5.5,1.6,0.35,0.05],
  NCAAElite: [47,29,15,7.2,1.6,0.2],
  NBA: [2,12,35,37,12.8,1.2],
  EuroElite: [18,34,31,13.5,3.2,0.3],
  EuroAcademy: [31,39,23,6.1,0.8,0.1],
  ProTop: [36,40,20,3.5,0.45,0.05],
  Pro: [54,34,10.5,1.35,0.14,0.01],
  Tier2: [65,27,7,0.9,0.09,0.01],
  GLeague: [43,36,16,4.4,0.5,0.1],
  Academy: [69,24,6.1,0.78,0.11,0.01],
};
const CAREER_PROFILES = ['Young prodigy','Classic prime','Late bloomer','Early peak','Durable veteran','Volatile talent'];

const COACH_RARITIES = [
  { name: 'Common', weight: 52, bonus: 0 }, { name: 'Uncommon', weight: 28, bonus: 2 },
  { name: 'Rare', weight: 13, bonus: 4 }, { name: 'Epic', weight: 5.5, bonus: 7 },
  { name: 'Legend', weight: 1.4, bonus: 10 }, { name: 'Generational', weight: 0.1, bonus: 13 },
];
const OWNER_RARITIES = [
  { name: 'Common', weight: 48, bonus: 0 }, { name: 'Uncommon', weight: 29, bonus: 1 },
  { name: 'Rare', weight: 15, bonus: 2 }, { name: 'Epic', weight: 6, bonus: 4 },
  { name: 'Legend', weight: 1.8, bonus: 6 }, { name: 'Generational', weight: 0.2, bonus: 8 },
];
const OWNER_PROFILES = {
  'Celebrity': { recruitment: 4, stability: -2, development: 0, patience: -1 },
  'Venture capital': { recruitment: 3, stability: -2, development: 3, patience: -2 },
  'Oil money': { recruitment: 7, stability: 0, development: 1, patience: -3 },
  'Investment fund': { recruitment: 4, stability: -1, development: 2, patience: -2 },
  'Fans consortium': { recruitment: 0, stability: 5, development: 2, patience: 4 },
  'Long-time team fan': { recruitment: 2, stability: 4, development: 3, patience: 3 },
};
const NATIONAL_COUNTRIES = NATIONAL_TEAM_COUNTRIES;
const NATIONAL_COLORS = WORLD_NATIONAL_COLORS;
const SALARY_TIERS = ['Minimum','Rotation','Starter','Star','Superstar'];

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
function rarityByName(name) {
  return RARITIES.find((rarity) => rarity.name === name) ?? RARITIES[0];
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

const NCAA_CURVES = {
  'Young prodigy': [0.82, 0.87, 0.89, 0.89],
  'Classic prime': [0.78, 0.82, 0.86, 0.89],
  'Late bloomer': [0.75, 0.79, 0.83, 0.88],
  'Early peak': [0.81, 0.86, 0.89, 0.89],
  'Durable veteran': [0.77, 0.82, 0.86, 0.89],
  'Volatile talent': [0.79, 0.84, 0.81, 0.88],
};
function createNcaaCurve(profile) {
  return [...(NCAA_CURVES[profile] ?? NCAA_CURVES['Classic prime'])];
}
function createPostCollegeCurve(profile, years) {
  const adultYears = Math.max(1, years - 1);
  return Array.from({ length: adultYears }, (_, index) => {
    const t = adultYears === 1 ? 0 : index / (adultYears - 1);
    let value;
    if (profile === 'Young prodigy') value = t < 0.25 ? 0.91 + t * 0.39 : t < 0.55 ? 1.007 - (t - 0.25) * 0.015 : 1.002 - (t - 0.55) * 0.32;
    else if (profile === 'Late bloomer') value = t < 0.38 ? 0.90 + t * 0.23 : t < 0.70 ? 0.987 + (t - 0.38) * 0.07 : 1.009 - (t - 0.70) * 0.34;
    else if (profile === 'Early peak') value = t < 0.18 ? 0.93 + t * 0.43 : t < 0.42 ? 1.007 - (t - 0.18) * 0.06 : 0.993 - (t - 0.42) * 0.37;
    else if (profile === 'Durable veteran') value = t < 0.24 ? 0.91 + t * 0.32 : t < 0.76 ? 0.987 + (t - 0.24) * 0.03 : 1.003 - (t - 0.76) * 0.25;
    else if (profile === 'Volatile talent') value = 0.93 + Math.sin(index * 1.65) * 0.045 + (t < 0.5 ? t * 0.13 : (1 - t) * 0.09);
    else value = t < 0.28 ? 0.90 + t * 0.31 : t < 0.62 ? 0.987 + (t - 0.28) * 0.06 : 1.007 - (t - 0.62) * 0.34;
    return round(clamp(value, 0.90, 1.01), 3);
  });
}
function developmentMultiplier(player) {
  if (player.teamType === 'NCAA') {
    const curve = player.ncaaCurve ?? createNcaaCurve(player.careerProfile);
    return curve[clamp(player.yearsInNCAA ?? Math.max(0, player.age - 18), 0, curve.length - 1)];
  }
  if (player.originRoute === 'NCAA') {
    const curve = player.proCurve ?? createPostCollegeCurve(player.careerProfile, player.careerYears);
    return curve[clamp(Math.max(0, (player.proYears ?? 1) - 1), 0, curve.length - 1)];
  }
  return player.careerCurve[clamp(player.careerYear, 0, player.careerCurve.length - 1)];
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
  if (team.type === 'NBA') {
    if (forceLocal || random() < 0.5) return random() < 0.9 ? 'USA' : 'Canada';
    return choice(FOREIGN_COUNTRIES.filter((country) => !['USA','Canada'].includes(country)), random);
  }
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
  let rarity = options.forcedRarity ? rarityByName(options.forcedRarity) : rarityForClass(talentClass, random);
  if (options.maxRarity) {
    const maxIndex = RARITIES.findIndex((item) => item.name === options.maxRarity);
    const rarityIndex = RARITIES.findIndex((item) => item.name === rarity.name);
    if (maxIndex >= 0 && rarityIndex > maxIndex) rarity = weightedChoice(RARITIES.slice(0, maxIndex + 1), RARITY_WEIGHTS.Pro.slice(0, maxIndex + 1), random);
  }
  let base = integer(rarity.base[0], rarity.base[1], random);
  if (team.type === 'NBA' && options.initial) base = clamp(base + integer(0, 2, random), rarity.base[0], 99);
  const careerYears = integer(rarity.career[0], rarity.career[1], random);
  const careerProfile = choice(CAREER_PROFILES, random);
  const careerCurve = createCareerCurve(careerProfile, careerYears);
  const originRoute = options.originRoute ?? (team.type === 'NCAA' ? 'NCAA' : team.type === 'NBA' ? 'Opening NBA roster' : 'Club system');
  const ncaaCurve = originRoute === 'NCAA' ? createNcaaCurve(careerProfile) : null;
  const proCurve = originRoute === 'NCAA' ? createPostCollegeCurve(careerProfile, careerYears) : null;
  let careerYear = clamp(age - 18, 0, careerYears - 1);
  if (options.initial && team.type !== 'NCAA') {
    // Seed the opening universe across every career stage instead of pushing
    // older generated players artificially into their final season.
    careerYear = options.initialCareerYear ?? integer(0, careerYears - 1, random);
    age = 18 + careerYear;
  }
  const yearsInNCAA = team.type === 'NCAA' ? clamp(age - 18, 0, 3) : 0;
  const proYears = originRoute === 'NCAA' && team.type !== 'NCAA' ? Math.max(1, age - 21) : 0;
  const annualShape = round(0.95 + random() * 0.06, 3);
  const initialMultiplier = team.type === 'NCAA'
    ? ncaaCurve[yearsInNCAA]
    : originRoute === 'NCAA'
      ? proCurve[clamp(proYears - 1, 0, proCurve.length - 1)]
      : careerCurve[careerYear];
  const current = Math.round(clamp(base * initialMultiplier * annualShape, 46, 99));
  const body = choice(BODY_BY_POSITION[position], random);
  const height = integer(HEIGHT[position][0], HEIGHT[position][1], random);
  const role = choice(ROLES[position], random);
  const nationality = options.nationality ?? chooseNationality(team, random, options.forceLocal);
  const bodyPenalty = body === 'Heavy' && ['PG','SG'].includes(position) ? 5 : 0;
  const sizeBonus = body === 'Heavy' && ['PF','C'].includes(position) ? 5 : 0;
  const player = {
    id, name: playerName(nationality, random), nationality, region: REGION_BY_COUNTRY[nationality] ?? team.region,
    age, position, height, body, role, rarity: rarity.name, birthRarity: rarity.name, base, birthBase: base, careerYears, careerYear, careerProfile, careerCurve,
    ncaaCurve, proCurve, yearsInNCAA, proYears, developmentMultiplier: initialMultiplier,
    annualShape, current, potential: Math.round(clamp(base * 1.02, base, 99)),
    teamId: team.id, teamName: team.name, teamType: team.type, competition: team.competition,
    competitionId: team.competitionId, spawnYear, status: 'Active', draft: null, rightsTeamId: null,
    originRoute,
    nbaPreference: rarity.name === 'Generational' ? 1 : rarity.name === 'Legend' ? 0.95 : rarity.name === 'Epic' ? 0.76 : rarity.name === 'Rare' ? 0.42 : 0.18,
    nationalCommitment: round(0.35 + random() * 0.65, 2), internationalRetired: false,
    europeanLifer: team.type === 'Pro' && !options.initial && (rarity.name === 'Legend' ? random() < 0.045 : rarity.name === 'Epic' ? random() < 0.10 : false),
    contract: null, contractHistory: [],
    honors: [], history: [], internationalHistory: [], careerEvents: [{ year: spawnYear, type: 'Debut', detail: `Entered the basketball world with ${team.name}.` }],
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


function rarityDefinition(name) {
  return RARITIES.find((item) => item.name === name) ?? RARITIES[0];
}
function refreshPlayerAfterTierChange(player, rarityName, random) {
  const definition = rarityDefinition(rarityName);
  const oldCurrent = player.current ?? 70;
  player.rarity = rarityName;
  player.birthRarity = rarityName;
  player.base = integer(definition.base[0], definition.base[1], random);
  player.birthBase = player.base;
  player.careerYears = integer(definition.career[0], definition.career[1], random);
  player.careerProfile = choice(CAREER_PROFILES, random);
  player.careerCurve = createCareerCurve(player.careerProfile, player.careerYears);
  if (player.originRoute === 'NCAA') {
    player.ncaaCurve = createNcaaCurve(player.careerProfile);
    player.proCurve = createPostCollegeCurve(player.careerProfile, player.careerYears);
  }
  player.careerYear = clamp(player.careerYear ?? Math.max(0, player.age - 18), 0, player.careerYears - 1);
  player.developmentMultiplier = developmentMultiplier(player);
  player.current = Math.round(clamp(player.base * player.developmentMultiplier * player.annualShape, 46, 99));
  player.potential = Math.round(clamp(player.base * 1.02, player.base, 99));
  const delta = player.current - oldCurrent;
  ['inside','midrange','three','passing','rebounding','perimeterDefense','interiorDefense'].forEach((key) => {
    player[key] = Math.round(clamp((player[key] ?? oldCurrent) + delta, 24, 99));
  });
  player.nbaPreference = rarityName === 'Generational' ? 1 : rarityName === 'Legend' ? 0.95 : rarityName === 'Epic' ? 0.76 : rarityName === 'Rare' ? 0.42 : 0.18;
  player.europeanLifer = rarityName === 'Generational' ? false : player.europeanLifer;
  player.stats = buildStats(player, random);
  player.stats.drpg = round(Math.max(0.2, player.stats.rpg - player.stats.orpg), 1);
  if (player.contract) player.contract.salaryTier = salaryTierFor(player);
}
function applyHistoricalIdentity(player, identity, random) {
  if (!identity) return;
  const [name, nationality, position, role] = identity;
  player.name = name;
  player.nationality = nationality;
  player.region = REGION_BY_COUNTRY[nationality] ?? player.region;
  player.position = position;
  player.role = role;
  player.body = choice(BODY_BY_POSITION[position], random);
  player.height = integer(HEIGHT[position][0], HEIGHT[position][1], random);
  player.realIdentity = true;
  player.historicalArchetype = name;
  player.careerEvents[0] = { ...player.careerEvents[0], detail: `${name} entered the basketball world with ${player.teamName}.` };
  player.stats = buildStats(player, random);
  player.stats.drpg = round(Math.max(0.2, player.stats.rpg - player.stats.orpg), 1);
}
function unusedHistoricalIdentity(rarity, usedNames, random, preferredNationality = null, preferredPosition = null) {
  const all = REAL_PLAYER_POOLS[rarity] ?? [];
  const unused = all.filter(([name]) => !usedNames.has(name));
  if (!unused.length) return null;
  const both = unused.filter(([, nationality, position]) => (!preferredNationality || nationality === preferredNationality) && (!preferredPosition || position === preferredPosition));
  const byPosition = preferredPosition ? unused.filter(([, , position]) => position === preferredPosition) : [];
  const byNationality = preferredNationality ? unused.filter(([, nationality]) => nationality === preferredNationality) : [];
  return choice(both.length ? both : byPosition.length ? byPosition : byNationality.length ? byNationality : unused, random);
}
function seedOpeningElitePopulation(players, teams, random) {
  const usedNames = new Set();
  const teamById = new Map(teams.map((team) => [team.id, team]));
  players.filter((player) => ['Epic','Legend','Generational'].includes(player.rarity)).forEach((player) => refreshPlayerAfterTierChange(player, 'Rare', random));
  const usedPlayers = new Set();
  const candidatePool = (predicate) => players.filter((player) => !usedPlayers.has(player.id) && predicate(player, teamById.get(player.teamId)));
  const take = (rarity, count, buckets, realCount) => {
    let assigned = 0;
    for (const [bucketCount, predicate] of buckets) {
      for (let index = 0; index < bucketCount && assigned < count; index += 1) {
        const pool = candidatePool(predicate);
        if (!pool.length) break;
        const player = choice(pool, random);
        usedPlayers.add(player.id);
        refreshPlayerAfterTierChange(player, rarity, random);
        const team = teamById.get(player.teamId);
        const shouldUseReal = realCount > 0;
        if (shouldUseReal) {
          const preferredNationality = team?.type === 'NCAA' ? 'USA' : team?.type === 'Pro' ? team.country : null;
          const identity = unusedHistoricalIdentity(rarity, usedNames, random, preferredNationality, team?.type === 'NCAA' ? player.position : null);
          if (identity) { applyHistoricalIdentity(player, identity, random); usedNames.add(identity[0]); realCount -= 1; }
        }
        assigned += 1;
      }
    }
    while (assigned < count) {
      const pool = candidatePool(() => true);
      if (!pool.length) break;
      const player = choice(pool, random);
      usedPlayers.add(player.id);
      refreshPlayerAfterTierChange(player, rarity, random);
      if (realCount > 0) {
        const identity = unusedHistoricalIdentity(rarity, usedNames, random);
        if (identity) { applyHistoricalIdentity(player, identity, random); usedNames.add(identity[0]); realCount -= 1; }
      }
      assigned += 1;
    }
  };
  const isNBA = (_player, team) => team?.type === 'NBA';
  const isEuro = (_player, team) => team?.type === 'Pro' && (team.secondaryCompetitionIds.includes('euroleague') || team.prestige >= 7.4);
  const isNCAA = (player, team) => team?.type === 'NCAA' && player.age <= 20;
  const isOtherPro = (_player, team) => team?.type === 'Pro';
  take('Generational', ELITE_ACTIVE_TARGETS.Generational, [[2,isNBA],[1,(player,team)=>isNCAA(player,team)||isEuro(player,team)]], 2);
  take('Legend', ELITE_ACTIVE_TARGETS.Legend, [[8,isNBA],[2,isEuro],[1,isNCAA],[1,isOtherPro]], 7);
  take('Epic', ELITE_ACTIVE_TARGETS.Epic, [[15,isNBA],[8,isEuro],[5,isNCAA],[2,isOtherPro]], 11);
  return [...usedNames];
}
function maybeApplyHistoricalIdentity(state, player) {
  if (!['Epic','Legend','Generational'].includes(player.rarity) || player.realIdentity) return;
  state.usedRealPlayerNames ??= [];
  const used = new Set(state.usedRealPlayerNames);
  const activeReal = state.players.filter((item) => !['Retired','Left professional basketball'].includes(item.status) && item.rarity === player.rarity && item.realIdentity).length;
  const target = REAL_ACTIVE_TARGETS[player.rarity] ?? 0;
  const maximum = REAL_ACTIVE_MAXIMUMS[player.rarity] ?? target;
  const forceHistorical = activeReal < target;
  if (activeReal >= maximum) return;
  if (!forceHistorical && stateRandom(state) > (REAL_NAME_RATE[player.rarity] ?? 0)) return;
  const team = state.teams.find((item) => item.id === player.teamId);
  const preferredNationality = team?.type === 'NCAA' ? 'USA' : team?.type === 'Pro' ? team.country : null;
  const identity = unusedHistoricalIdentity(player.rarity, used, () => stateRandom(state), preferredNationality, team?.type === 'NCAA' ? player.position : null);
  if (!identity) return;
  applyHistoricalIdentity(player, identity, () => stateRandom(state));
  state.usedRealPlayerNames.push(identity[0]);
}
function weightedRarity(definitions, random) {
  return weightedChoice(definitions, definitions.map((item) => item.weight), random);
}
function salaryTierFor(player) {
  if (player.current >= 91) return 'Superstar';
  if (player.current >= 85) return 'Star';
  if (player.current >= 79) return 'Starter';
  if (player.current >= 73) return 'Rotation';
  return 'Minimum';
}
function assignContract(player, team, year, random, years = null) {
  if (!team || ['NCAA','National'].includes(team.type)) { player.contract = null; return; }
  const length = years ?? (team.type === 'NBA' ? integer(1,4,random) : integer(1,3,random));
  player.contract = { teamId: team.id, team: team.name, startYear: year, endYear: year + length, salaryTier: salaryTierFor(player) };
  player.contractHistory.push({ ...player.contract });
}
function createCoach(team, random, id, year = 2026) {
  const nationality = random() < 0.82 ? choice(localCountries(team), random) : choice(FOREIGN_COUNTRIES, random);
  const rarity = weightedRarity(COACH_RARITIES, random);
  const baseSeed = team.type === 'NBA' ? integer(74,90,random) : team.secondaryCompetitionIds.includes('euroleague') ? integer(70,88,random) : team.type === 'National' ? integer(69,88,random) : integer(60,82,random);
  const base = clamp(baseSeed + rarity.bonus, 52, 99);
  const careerYears = integer(12,28,random);
  const careerYear = integer(0, Math.max(0, careerYears - 3), random);
  const styles = ['Pace and space','Motion offense','Isolation','Post-centric','Defensive pressure','Drop coverage','Switching','Development-first'];
  return {
    id, name: playerName(nationality, random), nationality, teamId: team.id, teamName: team.name,
    rarity: rarity.name, base, current: clamp(base + integer(-3,3,random), 50, 99), age: 32 + careerYear,
    careerYears, careerYear, contractEnd: year + integer(1,4,random), status: 'Active',
    offense: clamp(base + integer(-6,7,random),50,99), defense: clamp(base + integer(-6,7,random),50,99),
    development: clamp(base + integer(-8,8,random),50,99), rotations: clamp(base + integer(-8,8,random),50,99),
    playoff: clamp(base + integer(-8,8,random),50,99), management: clamp(base + integer(-8,8,random),50,99),
    style: choice(styles, random), honors: [], history: [],
    careerEvents: [{ year, type: 'Appointment', detail: `Appointed by ${team.name}.` }],
  };
}
function createOwner(team, random, id, year = 2026) {
  const rarity = weightedRarity(OWNER_RARITIES, random);
  const profile = choice(Object.keys(OWNER_PROFILES), random);
  const profileBonus = OWNER_PROFILES[profile];
  const mandate = integer(5,20,random);
  const nationality = random() < 0.75 ? choice(localCountries(team), random) : choice(FOREIGN_COUNTRIES, random);
  return {
    id, name: playerName(nationality, random), nationality, teamId: team.id, teamName: team.name,
    rarity: rarity.name, profile, startYear: year, endYear: year + mandate - 1, mandate,
    recruitment: profileBonus.recruitment + rarity.bonus,
    stability: profileBonus.stability + Math.round(rarity.bonus / 2),
    development: profileBonus.development + Math.round(rarity.bonus / 2),
    patience: profileBonus.patience + Math.round(rarity.bonus / 3),
    status: 'Active', history: [],
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
const ADRIATIC_CLUBS = new Set(['Partizan','Crvena zvezda','Cedevita Olimpija','Buducnost','Mega Basket','FMP Belgrade','Spartak Subotica','Borac Cacak','Borac Čačak','Cibona Zagreb','Split','Zadar','Krka Novo Mesto','Dubai Basketball']);

function createTeams() {
  let id = 1;
  const teams = [];
  const seenTeams = new Set();
  const add = (data) => {
    const teamKey = slug(data.name);
    if (seenTeams.has(teamKey)) return;
    seenTeams.add(teamKey);
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
      history: [], honors: [], transactions: [], leadershipHistory: [], seasonRecords: {},
      targetRoster: data.type === 'NCAA' ? 5 : 10,
      localMinimum: data.type === 'NCAA' ? 4 : data.type === 'NBA' ? 7 : 5,
      prestige: round(prestige,1), competitionId: primaryId, secondaryCompetitionIds,
      ...data,
    };
    team.talentClass = teamTalentClass(team);
    teams.push(team);
  };

  NBA_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NBA', type: 'NBA', tier: 1, secondaryCompetitions: [] }));
  G_LEAGUE_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: team.league, type: 'GLeague', tier: 2, secondaryCompetitions: [] }));
  NCAA_PROGRAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NCAA Division I', type: 'NCAA', tier: 1, secondaryCompetitions: ['NCAA Tournament', team.conference] }));
  EURO_TOP_CLUBS.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', tier: 1, secondaryCompetitions: ['EuroLeague', ...(ADRIATIC_CLUBS.has(team.name) ? ['Adriatic League'] : [])] }));
  EURO_DOMESTIC.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', secondaryCompetitions: [...(EUROCUP_CLUBS.has(team.name) ? ['EuroCup'] : []), ...(ADRIATIC_CLUBS.has(team.name) ? ['Adriatic League'] : [])] }));
  OTHER_PRO_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country], competition: team.league, type: 'Pro', tier: 1, secondaryCompetitions: [] }));
  EXTENDED_PRO_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country] ?? 'Europe', competition: team.league, type: 'Pro', secondaryCompetitions: [...(EUROCUP_CLUBS.has(team.name) ? ['EuroCup'] : []), ...(ADRIATIC_CLUBS.has(team.name) ? ['Adriatic League'] : [])] }));
  EXPANDED_REAL_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country] ?? 'World', competition: team.league, type: 'Pro', secondaryCompetitions: [...(EUROCUP_CLUBS.has(team.name) ? ['EuroCup'] : []), ...(ADRIATIC_CLUBS.has(team.name) ? ['Adriatic League'] : [])] }));
  SUMMARY_REAL_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country] ?? 'World', competition: team.league, type: 'Pro', tier: 1, secondaryCompetitions: [] }));
  return teams;
}

function createNationalTeams(startId) {
  let id = startId;
  return NATIONAL_COUNTRIES.map((country) => {
    const region = REGION_BY_COUNTRY[country] ?? 'World';
    const secondaryCompetitions = ['FIBA World Cup','Olympic Basketball Tournament'];
    if (region === 'Europe') secondaryCompetitions.push('EuroBasket');
    if (['North America','South America'].includes(region)) secondaryCompetitions.push('FIBA AmeriCup');
    if (['Asia','Oceania'].includes(region)) secondaryCompetitions.push('FIBA Asia Cup');
    if (region === 'Africa') secondaryCompetitions.push('AfroBasket');
    return {
      id: id++, name: `${country} National Team`, country, region, color: NATIONAL_COLORS[country] ?? '#263746',
      competition: 'FIBA World Cup', competitionId: competitionId('FIBA World Cup'),
      secondaryCompetitions, secondaryCompetitionIds: secondaryCompetitions.map(competitionId),
      type: 'National', tier: 1, targetRoster: 10, localMinimum: 10, prestige: 7,
      talentClass: 'ProTop', wins: 0, losses: 0, rosterIds: [], rating: 70, rawRating: 70,
      history: [], honors: [], transactions: [], leadershipHistory: [], seasonRecords: {},
    };
  });
}

export function getCompetition(competitionIdValue) {
  return COMPETITION_BY_ID.get(competitionIdValue);
}
export function getCompetitionParticipants(universe, competitionIdValue) {
  const competition = getCompetition(competitionIdValue);
  if (!competition || !isCompetitionActive(competition, universe.year)) return [];
  if (competition.kind === 'international') {
    const national = universe.teams.filter((team) => team.type === 'National');
    const eligible = competition.countries ? national.filter((team) => competition.countries.includes(team.region)) : national;
    const fieldSize = competition.fieldSize ?? eligible.length;
    return [...eligible].sort((a, b) => b.rating - a.rating || b.prestige - a.prestige).slice(0, fieldSize);
  }
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
function recalculateTeamRatings(teams, players, coaches = [], owners = []) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const coachById = new Map(coaches.map((coach) => [coach.id, coach]));
  const ownerById = new Map(owners.map((owner) => [owner.id, owner]));
  return teams.map((team) => {
    const roster = team.rosterIds.map((id) => playerById.get(id)).filter(Boolean).sort((a, b) => b.current - a.current);
    const count = team.type === 'NCAA' ? 5 : 8;
    const active = roster.slice(0, count);
    const rawRating = active.length ? active.reduce((sum, player, index) => sum + player.current * (index < 5 ? 1 : 0.7), 0) / active.reduce((sum, _player, index) => sum + (index < 5 ? 1 : 0.7), 0) : 50;
    const coach = coachById.get(team.coachId);
    const owner = ownerById.get(team.ownerId);
    const coachBonus = coach ? ((coach.offense + coach.defense + coach.rotations) / 3 - 72) * 0.075 : 0;
    const ownerBonus = owner ? (owner.recruitment + owner.stability + owner.development) * 0.055 : 0;
    const adjustment = team.type === 'NBA'
      ? 8.8
      : team.secondaryCompetitionIds.includes('euroleague')
        ? 0.8
        : team.type === 'NCAA'
          ? -2 + Math.max(0, team.prestige - 5) * 3
          : team.type === 'National'
            ? 0.8
            : team.type === 'GLeague'
              ? -2.2
              : team.tier === 2
                ? -2.5
                : 0;
    const calculated = rawRating + adjustment + coachBonus + ownerBonus;
    // EuroLeague institutions retain an ecosystem advantage (budget, coaching,
    // continuity and schedule strength) but never receive the NBA's depth boost.
    const euroFloor = team.secondaryCompetitionIds.includes('euroleague') ? 64 + team.prestige * 1.35 : -Infinity;
    return { ...team, rawRating: round(rawRating,1), rating: round(clamp(Math.max(calculated, euroFloor),45,99),1) };
  });
}

function refreshNationalRosters(state, randomOverride = null) {
  const random = randomOverride ?? (() => stateRandom(state));
  const importanceByCompetition = {
    'Olympic Basketball Tournament': 1,
    'FIBA World Cup': 0.72,
    EuroBasket: 0.62,
    'FIBA AmeriCup': 0.34,
    'FIBA Asia Cup': 0.50,
    AfroBasket: 0.52,
  };
  const activeInternational = COMPETITIONS.filter((competition) => competition.kind === 'international' && isCompetitionActive(competition, state.year ?? 2026));
  const reasonForAbsence = (player, competition, probability) => {
    if (player.internationalRetired) return 'retired from international basketball';
    if (player.age >= 33 && competition.name !== 'Olympic Basketball Tournament') return 'veteran rest';
    if (player.teamType === 'NBA' && player.current >= 88 && competition.name === 'FIBA AmeriCup') return 'declined continental duty';
    if (player.teamType === 'NBA' && competition.name !== 'Olympic Basketball Tournament' && player.current >= 85) return 'rest after the NBA season';
    if (probability < 0.35) return 'club and workload management';
    return 'not available for selection';
  };
  state.teams.filter((team) => team.type === 'National').forEach((team) => {
    const competition = activeInternational
      .filter((item) => !item.countries || item.countries.includes(team.region))
      .sort((a, b) => b.level - a.level)[0] ?? { name: 'International window', level: 5 };
    const importance = importanceByCompetition[competition.name] ?? 0.45;
    let eligible = state.players.filter((player) => player.nationality === team.country && !['Retired','Left professional basketball'].includes(player.status) && player.teamType !== 'National' && !player.internationalRetired);
    while (eligible.length < 14 && state.nextPlayerId != null) {
      const dummy = { id: null, name: 'Free Agency', country: team.country, region: team.region, type: 'FreeAgent', competition: 'Free Agency', competitionId: 'free-agency', talentClass: 'Tier2' };
      const position = POSITIONS[eligible.length % POSITIONS.length];
      const player = createPlayer(dummy, position, integer(20, 28, random), random, state.nextPlayerId++, state.year ?? 2026, { talentClass: 'Tier2', nationality: team.country, originRoute: 'Domestic free agent', maxRarity: 'Rare' });
      player.teamId = null; player.teamName = 'Free Agent'; player.teamType = 'FreeAgent'; player.status = 'Free Agent'; player.contract = null;
      state.players.push(player);
      if (state.freeAgents && !state.freeAgents.includes(player.id)) state.freeAgents.push(player.id);
      eligible.push(player);
    }
    const evaluated = eligible.map((player) => {
      const nbaStar = player.teamType === 'NBA' && player.current >= 86;
      let probability = importance * 0.62 + player.nationalCommitment * 0.42;
      if (competition.name === 'Olympic Basketball Tournament') probability += 0.26;
      if (competition.name === 'FIBA World Cup') probability += player.age <= 27 ? 0.06 : 0;
      if (competition.name === 'FIBA AmeriCup' && team.country === 'USA') probability -= nbaStar ? 0.68 : player.teamType === 'NBA' ? 0.35 : 0;
      if (competition.name === 'FIBA World Cup' && team.country === 'USA') probability -= nbaStar ? 0.28 : 0.08;
      if (player.teamType === 'NBA' && competition.name !== 'Olympic Basketball Tournament') probability -= 0.10;
      if (player.age >= 32) probability -= competition.name === 'Olympic Basketball Tournament' ? 0.03 : 0.18;
      if (player.age <= 24) probability += 0.08;
      probability = clamp(probability, 0.03, 0.98);
      return { player, probability, available: random() < probability };
    });
    const available = evaluated.filter((item) => item.available).sort((a, b) => b.player.current - a.player.current);
    const selected = [];
    POSITIONS.forEach((position) => {
      const best = available.find((item) => item.player.position === position && !selected.includes(item.player));
      if (best) selected.push(best.player);
    });
    available.forEach((item) => { if (selected.length < 10 && !selected.includes(item.player)) selected.push(item.player); });
    if (selected.length < 10) {
      evaluated.filter((item) => !selected.includes(item.player)).sort((a, b) => (b.probability * 8 + b.player.current) - (a.probability * 8 + a.player.current)).forEach((item) => {
        if (selected.length < 10) selected.push(item.player);
      });
    }
    const selectedIds = new Set(selected.map((player) => player.id));
    team.rosterIds = selected.slice(0, 10).map((player) => player.id);
    team.selectionCompetition = competition.name;
    team.selectionYear = state.year ?? 2026;
    team.unavailablePlayers = evaluated
      .filter((item) => !selectedIds.has(item.player.id))
      .sort((a, b) => b.player.current - a.player.current)
      .slice(0, 10)
      .map((item) => ({ playerId: item.player.id, name: item.player.name, current: item.player.current, team: item.player.teamName, reason: reasonForAbsence(item.player, competition, item.probability) }));
  });
}

function rebalanceOpeningNBANationalities(players, teams, random) {
  const nbaTeams = teams.filter((team)=>team.type==='NBA');
  const preferredForeign = ['Canada','France','Australia','Germany','Serbia','Spain','Lithuania','Greece','Slovenia','Brazil','Argentina','Nigeria','Cameroon','Japan'];
  nbaTeams.forEach((team)=>{
    const roster=()=>team.rosterIds.map((id)=>players.find((player)=>player.id===id)).filter(Boolean);
    const target = team.id % 3 === 0 ? 2 : 3;
    let international = roster().filter((player)=>player.nationality!=='USA');
    while (international.length > target) {
      const candidate = international.filter((player)=>!player.realIdentity).sort((a,b)=>a.current-b.current)[0];
      if (!candidate) break;
      candidate.nationality='USA'; candidate.region='North America'; candidate.name=playerName('USA',random);
      international = roster().filter((player)=>player.nationality!=='USA');
    }
    while (international.length < target) {
      const candidate = roster().filter((player)=>player.nationality==='USA'&&!player.realIdentity).sort((a,b)=>a.current-b.current)[0];
      if (!candidate) break;
      const nationality=choice(preferredForeign,random);
      candidate.nationality=nationality; candidate.region=REGION_BY_COUNTRY[nationality]??candidate.region; candidate.name=playerName(nationality,random);
      international = roster().filter((player)=>player.nationality!=='USA');
    }
  });
}

export function createUniverse(seed = 20260729) {
  const random = createRandom(seed);
  let teams = createTeams();
  const players = [];
  const coaches = [];
  const owners = [];
  let playerId = 1;
  let coachId = 1;
  let ownerId = 1;
  let collegeIndex = 0;

  teams.forEach((team) => {
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position, positionIndex) => {
        const age = 18 + (collegeIndex % 4);
        collegeIndex += 1;
        const marquee = team.prestige >= 7.5;
        const player = createPlayer(team, position, age, random, playerId++, 2026 - (age - 18), {
          initial: true,
          talentClass: marquee ? 'NCAAElite' : 'NCAA',
          forcedRarity: marquee && positionIndex === team.id % POSITIONS.length ? 'Epic' : null,
          forceLocal: positionIndex < 4,
          originRoute: 'NCAA',
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
          originRoute: team.type === 'NBA' ? 'Opening NBA roster' : team.type === 'GLeague' ? 'Development system' : 'Club system',
        });
        assignContract(player, team, 2026, random);
        players.push(player);
        team.rosterIds.push(player.id);
      }
    }
  });

  const usedRealPlayerNames = seedOpeningElitePopulation(players, teams, random);
  rebalanceOpeningNBANationalities(players, teams, random);

  const nationalTeams = createNationalTeams(Math.max(...teams.map((team) => team.id)) + 1);
  teams.push(...nationalTeams);
  const initialFreeAgents = [];
  NATIONAL_COUNTRIES.forEach((country) => {
    while (players.filter((player) => player.nationality === country).length < 10) {
      const dummy = { id: null, name: 'Free Agency', country, region: REGION_BY_COUNTRY[country] ?? 'World', type: 'FreeAgent', competition: 'Free Agency', competitionId: 'free-agency', talentClass: 'Pro' };
      const player = createPlayer(dummy, POSITIONS[players.filter((item) => item.nationality === country).length % 5], integer(19,27,random), random, playerId++, 2026, { initial: true, talentClass: 'Pro', nationality: country, originRoute: 'Domestic free agent', maxRarity: 'Rare' });
      player.teamId = null; player.teamName = 'Free Agent'; player.teamType = 'FreeAgent'; player.status = 'Free Agent'; player.contract = null;
      players.push(player); initialFreeAgents.push(player.id);
    }
  });
  const shell = { teams, players, year: 2026, rngState: seed >>> 0, nextPlayerId: playerId, freeAgents: initialFreeAgents };
  refreshNationalRosters(shell, random);
  playerId = shell.nextPlayerId;

  teams.forEach((team) => {
    const coach = createCoach(team, random, coachId++, 2026);
    coaches.push(coach);
    team.coachId = coach.id;
    const owner = createOwner(team, random, ownerId++, 2026);
    owners.push(owner);
    team.ownerId = owner.id;
  });
  initializeSeasonRecords(teams);
  teams = recalculateTeamRatings(teams, players, coaches, owners);
  return {
    version: 9, seed, rngState: shell.rngState ?? (seed >>> 0), year: 2026, week: 1, phase: 'Regular season', yearReview: false,
    finalizedYear: null, teams, players, coaches, owners, retiredPlayers: [], retiredCoaches: [], formerOwners: [],
    transactions: [], coachTransactions: [], retirements: [], freeAgencyHistory: [], freeAgents: initialFreeAgents,
    draftHistory: [], draftRights: [], spawnHistory: [], talentHistory: [], offseasonHistory: [], offseason: null, results: [], promotions: [], competitionHistory: {},
    usedRealPlayerNames, eliteRouteBalance: { NCAA: 0, International: 0 },
    nextPlayerId: playerId, nextCoachId: coachId, nextOwnerId: ownerId,
  };
}

function recordFor(team, competitionIdValue) {
  if (!team.seasonRecords[competitionIdValue]) team.seasonRecords[competitionIdValue] = { wins: 0, losses: 0 };
  return team.seasonRecords[competitionIdValue];
}
function simulateCompetitionWeek(state, competition) {
  if (!['league','continental','international'].includes(competition.kind) || !isCompetitionActive(competition, state.year)) return;
  const participants = getCompetitionParticipants(state, competition.id);
  if (participants.length < 2) return;
  const averageRating = participants.reduce((sum, team) => sum + team.rating, 0) / participants.length;
  participants.forEach((team) => {
    let games = 0;
    if (competition.id === 'nba') games = state.week <= 40 ? 2 + (state.week <= 2 ? 1 : 0) : 0;
    else if (competition.id === 'nba-g-league') games = state.week <= 25 ? 2 : 0;
    else if (competition.id === 'ncaa-division-i') games = state.week <= 30 ? 1 + (state.week <= 6 ? 1 : 0) : 0;
    else if (competition.kind === 'continental') games = state.week <= 34 ? 1 : 0;
    else if (competition.kind === 'international') games = state.week >= 28 && state.week <= 34 ? 1 : 0;
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
  // The universe can exceed tens of megabytes after several seasons. Mutate the
  // active engine state and return a fresh root object instead of cloning the
  // complete historical archive before every click. IndexedDB performs its own
  // structured clone when a save is written.
  const state = universe;
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
  return { ...state };
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
function playKnockout(state, competition, teamA, teamB, roundIndex, roundCount) {
  const titlePenaltyA = recentTitlePenalty(state, competition.id, teamA.id);
  const titlePenaltyB = recentTitlePenalty(state, competition.id, teamB.id);
  const strengthA = teamA.rating + teamA.prestige * 0.25 - titlePenaltyA + (stateRandom(state) - 0.5) * 8;
  const strengthB = teamB.rating + teamB.prestige * 0.25 - titlePenaltyB + (stateRandom(state) - 0.5) * 8;
  const probabilityA = clamp(0.5 + (strengthA - strengthB) * 0.035, 0.16, 0.84);
  const winner = stateRandom(state) < probabilityA ? teamA : teamB;
  const loser = winner.id === teamA.id ? teamB : teamA;
  const bestOfSeven = competition.id === 'nba';
  let scoreA;
  let scoreB;
  if (bestOfSeven) {
    const loserWins = integer(0, 3, () => stateRandom(state));
    scoreA = winner.id === teamA.id ? 4 : loserWins;
    scoreB = winner.id === teamB.id ? 4 : loserWins;
  } else {
    const base = integer(71, 96, () => stateRandom(state));
    const margin = integer(1, 16, () => stateRandom(state));
    scoreA = winner.id === teamA.id ? base + margin : base;
    scoreB = winner.id === teamB.id ? base + margin : base;
  }
  return { teamAId: teamA.id, teamA: teamA.name, teamBId: teamB.id, teamB: teamB.name, scoreA, scoreB, winnerId: winner.id, winner: winner.name, loserId: loser.id };
}
function bracketSizeFor(competition, participants) {
  const cap = competition.id === 'ncaa-tournament' ? 32
    : competition.id === 'nba' || competition.kind === 'international' ? 16
    : competition.kind === 'supercup' ? 4 : 8;
  let size = 2;
  while (size * 2 <= Math.min(cap, participants)) size *= 2;
  return size;
}
function roundNames(competition, count) {
  if (competition.id === 'nba' && count === 4) return ['First round','Conference semifinals','Conference finals','NBA Finals'];
  if (competition.id === 'ncaa-tournament' && count === 5) return ['Round of 32','Sweet 16','Elite Eight','Final Four','National Championship'];
  if (competition.kind === 'international' && count === 4) return ['Round of 16','Quarterfinals','Semifinals','Final'];
  if (count === 4) return ['Round of 16','Quarterfinals','Semifinals','Final'];
  if (count === 3) return ['Quarterfinals','Semifinals','Final'];
  if (count === 2) return ['Semifinals','Final'];
  return ['Final'];
}
function buildBracket(state, competition, standings) {
  const size = bracketSizeFor(competition, standings.length);
  const seeded = standings.slice(0, size).map((entry) => entry.team);
  let current = [];
  for (let i = 0; i < size / 2; i += 1) current.push([seeded[i], seeded[size - 1 - i]]);
  const count = Math.log2(size);
  const names = roundNames(competition, count);
  const rounds = [];
  let runnerUp = null;
  for (let roundIndex = 0; roundIndex < count; roundIndex += 1) {
    const matches = current.map(([teamA, teamB]) => playKnockout(state, competition, teamA, teamB, roundIndex, count));
    rounds.push({ name: names[roundIndex] ?? `Round ${roundIndex + 1}`, matches });
    const winners = matches.map((match) => state.teams.find((team) => team.id === match.winnerId));
    if (roundIndex === count - 1) runnerUp = state.teams.find((team) => team.id === matches[0].loserId);
    current = [];
    for (let i = 0; i < winners.length; i += 2) if (winners[i + 1]) current.push([winners[i], winners[i + 1]]);
  }
  const final = rounds.at(-1).matches[0];
  return { rounds, champion: state.teams.find((team) => team.id === final.winnerId), runnerUp };
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
  refreshNationalRosters(state);
  state.teams = recalculateTeamRatings(state.teams, state.players, state.coaches, state.owners);
  const titlesByTeam = new Map();
  const seasonHonorsByPlayer = new Map();
  const activeInternationalByTeam = new Map();

  COMPETITIONS.forEach((competition) => {
    if (!isCompetitionActive(competition, state.year)) return;
    const standings = standingsFor(state, competition);
    if (standings.length < 2) return;
    const bracket = buildBracket(state, competition, standings);
    const championEntry = standings.find((entry) => entry.team.id === bracket.champion.id) ?? standings[0];
    const runnerEntry = standings.find((entry) => entry.team.id === bracket.runnerUp.id) ?? standings[1];
    const participantIds = new Set(standings.map((entry) => entry.team.id));
    const representedTeam = (player) => competition.kind === 'international'
      ? standings.find((entry) => entry.team.rosterIds.includes(player.id))?.team
      : state.teams.find((team) => team.id === player.teamId);
    const playerIds = competition.kind === 'international'
      ? new Set(standings.flatMap((entry) => entry.team.rosterIds))
      : null;
    const players = state.players.filter((player) => (playerIds ? playerIds.has(player.id) : participantIds.has(player.teamId)) && player.stats.games >= 0);
    if (!players.length) return;
    const recentSeasons = (state.competitionHistory[competition.id] ?? []).slice(0, 3);
    const recentMvpCount = (playerId) => recentSeasons.filter((season) => season.mvp?.id === playerId).length;
    const recentFinalsMvpCount = (playerId) => recentSeasons.filter((season) => season.finalsMvp?.id === playerId).length;
    const championPlayerIds = new Set(championEntry.team.rosterIds);
    const mvpScores = players.map((player) => {
      const team = representedTeam(player);
      const championBonus = team?.id === championEntry.team.id ? 4.5 : 0;
      const previousMvpWins = recentMvpCount(player.id);
      const voterFatigue = previousMvpWins * 8.5 + (previousMvpWins >= 2 ? 30 : 0);
      return { player, team, score: playerCompetitionScore(player, championEntry.team.id, stateRandom(state)) + championBonus - voterFatigue };
    });
    const mvpEntry = mvpScores.sort((a, b) => b.score - a.score)[0];
    const championPlayers = players.filter((player) => championPlayerIds.has(player.id) || player.teamId === championEntry.team.id);
    const finalsScores = championPlayers.map((player) => ({ player, team: representedTeam(player), score: playerCompetitionScore(player, championEntry.team.id, stateRandom(state)) - recentFinalsMvpCount(player.id) * 4 }));
    const finalsEntry = finalsScores.sort((a, b) => b.score - a.score)[0] ?? mvpEntry;
    const snapshot = (entry, value = null) => ({
      id: entry.player.id, name: entry.player.name,
      teamId: entry.team?.id ?? entry.player.teamId, team: entry.team?.name ?? entry.player.teamName,
      value: value ?? entry.player.current, position: entry.player.position,
    });
    const leaderFor = (key) => {
      const player = [...players].sort((a, b) => b.stats[key] - a.stats[key] || b.current - a.current)[0];
      return player ? snapshot({ player, team: representedTeam(player) }, player.stats[key]) : null;
    };
    const leaders = {
      points: leaderFor('ppg'), rebounds: leaderFor('rpg'), assists: leaderFor('apg'),
      steals: leaderFor('spg'), blocks: leaderFor('bpg'),
    };
    const season = {
      year: state.year, competitionId: competition.id, competition: competition.name,
      championTeamId: championEntry.team.id, champion: championEntry.team.name,
      runnerUpTeamId: runnerEntry.team.id, runnerUp: runnerEntry.team.name,
      mvp: snapshot(mvpEntry), finalsMvp: snapshot(finalsEntry), leaders, bracket: bracket.rounds,
      standings: standings.slice(0, 32).map((entry, index) => ({ rank: index + 1, teamId: entry.team.id, team: entry.team.name, wins: entry.wins, losses: entry.losses, rating: entry.team.rating })),
      playerStats: players.map((player) => {
        const team = representedTeam(player);
        const record = team?.seasonRecords[competition.id];
        const knockoutGames = competition.kind === 'supercup' ? 2 : competition.kind === 'cup' ? 5 : competition.kind === 'tournament' ? 6 : competition.kind === 'international' ? 7 : null;
        const scheduledCap = competition.id === 'nba' ? 82 : competition.id === 'nba-g-league' ? 50 : competition.id === 'ncaa-division-i' ? 36 : competition.kind === 'continental' ? 34 : 34;
        const games = knockoutGames ?? Math.min(scheduledCap, Math.max(1, (record?.wins ?? 0) + (record?.losses ?? 0)));
        return {
          playerId: player.id, player: player.name, teamId: team?.id ?? player.teamId, team: team?.name ?? player.teamName,
          games, ppg: player.stats.ppg, rpg: player.stats.rpg, apg: player.stats.apg,
          points: player.stats.ppg * games, rebounds: player.stats.rpg * games, assists: player.stats.apg * games,
        };
      }),
    };
    if (!state.competitionHistory[competition.id]) state.competitionHistory[competition.id] = [];
    state.competitionHistory[competition.id].unshift(season);

    const teamHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: 'Champion', category: 'team' };
    addTeamHonor(championEntry.team, teamHonor);
    titlesByTeam.set(championEntry.team.id, [...(titlesByTeam.get(championEntry.team.id) ?? []), competition.name]);
    championEntry.team.rosterIds.forEach((playerId) => {
      const player = state.players.find((item) => item.id === playerId);
      if (!player) return;
      addPlayerHonor(player, { ...teamHonor, type: 'Team title' });
      seasonHonorsByPlayer.set(player.id, [...(seasonHonorsByPlayer.get(player.id) ?? []), `${competition.name} champion`]);
    });
    const mvpHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: 'MVP', category: 'individual' };
    const finalsLabel = competition.id === 'nba' ? 'Finals MVP' : ['league','continental'].includes(competition.kind) ? 'Playoff MVP' : 'Finals MVP';
    const finalsHonor = { year: state.year, competitionId: competition.id, competition: competition.name, type: finalsLabel, category: 'individual' };
    addPlayerHonor(mvpEntry.player, mvpHonor);
    addPlayerHonor(finalsEntry.player, finalsHonor);
    seasonHonorsByPlayer.set(mvpEntry.player.id, [...(seasonHonorsByPlayer.get(mvpEntry.player.id) ?? []), `${competition.name} MVP`]);
    seasonHonorsByPlayer.set(finalsEntry.player.id, [...(seasonHonorsByPlayer.get(finalsEntry.player.id) ?? []), `${competition.name} ${finalsLabel}`]);
    Object.entries(leaders).forEach(([key, leader]) => {
      const player = state.players.find((item) => item.id === leader?.id);
      if (!player) return;
      const type = `${key[0].toUpperCase()}${key.slice(1)} leader`;
      addPlayerHonor(player, { year: state.year, competitionId: competition.id, competition: competition.name, type, category: 'individual' });
      seasonHonorsByPlayer.set(player.id, [...(seasonHonorsByPlayer.get(player.id) ?? []), `${competition.name} ${type}`]);
    });
    if (competition.kind === 'international') {
      standings.forEach((entry) => activeInternationalByTeam.set(entry.team.id, [...(activeInternationalByTeam.get(entry.team.id) ?? []), competition.id]));
      players.forEach((player) => {
        const team = representedTeam(player);
        player.internationalHistory.push({
          year: state.year, competitionId: competition.id, competition: competition.name,
          teamId: team?.id, team: team?.name, games: 7, ppg: player.stats.ppg, rpg: player.stats.rpg, apg: player.stats.apg,
          result: team?.id === championEntry.team.id ? 'Champion' : team?.id === runnerEntry.team.id ? 'Runner-up' : 'Participated',
        });
      });
    }
  });

  state.teams.forEach((team) => {
    if (team.type === 'National') {
      const activeIds = activeInternationalByTeam.get(team.id) ?? [];
      activeIds.forEach((id) => {
        const competition = getCompetition(id);
        const record = team.seasonRecords[id] ?? { wins: 0, losses: 0 };
        team.history.push({ year: state.year, competitionId: id, competition: competition.name, wins: record.wins, losses: record.losses, rating: team.rating, titles: titlesByTeam.get(team.id) ?? [], coachId: team.coachId, ownerId: team.ownerId });
      });
      return;
    }
    const record = team.seasonRecords[team.competitionId] ?? { wins: team.wins, losses: team.losses };
    team.history.push({
      year: state.year, competitionId: team.competitionId, competition: team.competition,
      wins: record.wins, losses: record.losses, rating: team.rating,
      titles: titlesByTeam.get(team.id) ?? [], coachId: team.coachId, ownerId: team.ownerId,
    });
  });
  state.players.forEach((player) => {
    if (player.status === 'Free Agent') return;
    player.history.push({
      year: state.year, age: player.age, teamId: player.teamId, team: player.teamName,
      competitionId: player.competitionId, competition: player.competition, current: player.current,
      games: player.stats.games, minutes: player.stats.minutes, ppg: player.stats.ppg, rpg: player.stats.rpg,
      orpg: player.stats.orpg, drpg: player.stats.drpg, apg: player.stats.apg, spg: player.stats.spg,
      bpg: player.stats.bpg, fg: player.stats.fg, three: player.stats.three, ft: player.stats.ft,
      honors: seasonHonorsByPlayer.get(player.id) ?? [], contract: player.contract ? { ...player.contract } : null,
    });
  });
  state.coaches.forEach((coach) => {
    const team = state.teams.find((item) => item.id === coach.teamId);
    if (!team) return;
    coach.history.push({ year: state.year, teamId: team.id, team: team.name, record: `${team.wins}-${team.losses}`, titles: titlesByTeam.get(team.id) ?? [], current: coach.current });
    (titlesByTeam.get(team.id) ?? []).forEach((title) => coach.honors.push({ year: state.year, type: 'Champion', competition: title }));
  });
  state.owners.forEach((owner) => {
    const team = state.teams.find((item) => item.id === owner.teamId);
    if (!team) return;
    owner.history.push({ year: state.year, teamId: team.id, team: team.name, rating: team.rating, titles: titlesByTeam.get(team.id) ?? [] });
  });
  state.finalizedYear = state.year;
}

function logTransaction(state, player, type, fromTeam, toTeam, detail) {
  const from = fromTeam?.name ?? (player.status === 'Free Agent' ? 'Free Agency' : 'Basketball');
  const to = toTeam?.name ?? (type === 'Retirement' ? 'Retired' : type.includes('Free agent') || type.includes('Contract expired') || type.includes('Released') ? 'Free Agency' : 'Outside active basketball');
  const transaction = { year: state.year, type, playerId: player.id, player: player.name, rarity: player.rarity, position: player.position, current: player.current, fromTeamId: fromTeam?.id ?? null, from, toTeamId: toTeam?.id ?? null, to, headline: `${player.name}: ${from} → ${to}`, detail };
  state.transactions.unshift(transaction);
  player.careerEvents.push({ year: state.year, type, detail: transaction.headline + (detail ? ` — ${detail}` : '') });
  if (fromTeam) fromTeam.transactions.unshift(transaction);
  if (toTeam && toTeam.id !== fromTeam?.id) toTeam.transactions.unshift(transaction);
}
function removeFromTeam(team, playerId) {
  if (team) team.rosterIds = team.rosterIds.filter((id) => id !== playerId);
}
function releaseToFreeAgency(state, player, type = 'Contract expired', detail = 'Entered the open market.') {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  removeFromTeam(oldTeam, player.id);
  player.teamId = null; player.teamName = 'Free Agent'; player.teamType = 'FreeAgent';
  player.competition = 'Free Agency'; player.competitionId = 'free-agency'; player.status = 'Free Agent'; player.contract = null;
  logTransaction(state, player, type, oldTeam, null, detail);
  if (!state.freeAgents.includes(player.id)) state.freeAgents.push(player.id);
}
function movePlayer(state, player, destination, type, detail, contractYears = null) {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  if (oldTeam?.id === destination.id) return;
  removeFromTeam(oldTeam, player.id);
  if (!destination.rosterIds.includes(player.id)) destination.rosterIds.push(player.id);
  player.teamId = destination.id; player.teamName = destination.name; player.teamType = destination.type;
  player.competition = destination.competition; player.competitionId = destination.competitionId; player.status = 'Active';
  state.freeAgents = state.freeAgents.filter((id) => id !== player.id);
  assignContract(player, destination, state.year + 1, () => stateRandom(state), contractYears);
  logTransaction(state, player, type, oldTeam, destination, detail);
}
function archivePlayer(state, player, reason = 'Retirement') {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  removeFromTeam(oldTeam, player.id);
  player.status = reason === 'Retirement' ? 'Retired' : 'Left professional basketball';
  player.retiredYear = state.year;
  player.contract = null;
  state.freeAgents = state.freeAgents.filter((id) => id !== player.id);
  state.draftRights.filter((right) => right.playerId === player.id && right.active).forEach((right) => { right.active = false; });
  logTransaction(state, player, reason, oldTeam, null, reason === 'Retirement' ? `${player.careerYear + 1}-year career completed.` : 'No suitable professional opportunity remained.');
  state.retirements.unshift({ year: state.year, playerId: player.id, player: player.name, age: player.age, lastTeam: oldTeam?.name ?? 'Free Agent', reason, rarity: player.rarity, honors: player.honors.length });
  state.retiredPlayers.unshift(player);
  state.players = state.players.filter((item) => item.id !== player.id);
}
function updatePlayerForNewYear(player, random) {
  player.age += 1;
  player.careerYear += 1;
  if (player.careerYear >= player.careerYears) return false;
  if (player.teamType === 'NCAA') player.yearsInNCAA = (player.yearsInNCAA ?? Math.max(0, player.age - 19)) + 1;
  else if (player.originRoute === 'NCAA') player.proYears = (player.proYears ?? 0) + 1;
  player.annualShape = round(0.95 + random() * 0.06, 3);
  player.developmentMultiplier = developmentMultiplier(player);
  player.current = Math.round(clamp(player.base * player.developmentMultiplier * player.annualShape, 46, 99));
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
function processContractExpiries(state) {
  const nextYear = state.year + 1;
  [...state.players].filter((player) => player.status === 'Active' && !['NCAA','National'].includes(player.teamType) && player.contract?.endYear <= nextYear).forEach((player) => {
    const team = state.teams.find((item) => item.id === player.teamId);
    const owner = state.owners.find((item) => item.id === team?.ownerId);
    const reSignChance = clamp(0.24 + (player.current - 72) * 0.025 + (owner?.stability ?? 0) * 0.015, 0.12, 0.78);
    if (stateRandom(state) < reSignChance && team) {
      assignContract(player, team, nextYear, () => stateRandom(state));
      player.careerEvents.push({ year: state.year, type: 'Contract extension', detail: `Re-signed with ${team.name} through ${player.contract.endYear}.` });
      return;
    }
    releaseToFreeAgency(state, player, 'Contract expired', `${team?.name ?? 'His club'} allowed the contract to expire.`);
  });
}
function collegeExitClass(state) {
  const scheduled = state.players.filter((player) => player.teamType === 'NCAA' && player.age >= 21);
  const early = state.players.filter((player) => player.teamType === 'NCAA' && player.age >= 19 && player.age < 21 && player.base >= 84 && stateRandom(state) < 0.48);
  return [...scheduled, ...early];
}
function draftScore(state, player) {
  const agePenalty = Math.max(0, player.age - 19) * 1.3;
  const proExperience = player.teamType !== 'NCAA' ? 2.2 : 0;
  return player.current * 0.46 + player.base * 0.40 + player.potential * 0.14 + proExperience - agePenalty + stateRandom(state) * 5;
}
function runDraft(state, exitClass) {
  const ncaa = [...exitClass].map((player) => ({ player, score: draftScore(state, player) })).sort((a, b) => b.score - a.score).slice(0, 46);
  const international = state.players.filter((player) => ['Pro','GLeague'].includes(player.teamType) && player.age >= 19 && player.age <= 22 && player.base >= 79)
    .map((player) => ({ player, score: draftScore(state, player) })).sort((a, b) => b.score - a.score).slice(0, 14);
  const eligible = [...ncaa, ...international].sort((a, b) => b.score - a.score);
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
    player.careerEvents.push({ year: state.year, type: 'NBA Draft', detail: `Selected ${pick} by ${team.name} from ${origin}.` });
    return { pick, round: roundNumber, teamId: team.id, team: team.name, playerId: player.id, player: player.name, position: player.position, origin, originType: player.teamType === 'NCAA' ? 'NCAA' : 'International', rarity: player.rarity, base: player.base, joinedNBA: false };
  });
  const draft = { year: state.year, picks, signed: 0, rightsStashed: 0, collegeGraduates: exitClass.length, ncaaPicks: picks.filter((pick) => pick.originType === 'NCAA').length, internationalPicks: picks.filter((pick) => pick.originType === 'International').length };
  state.draftHistory.unshift(draft);
  return draft;
}
function isLocalForTeam(player, team) {
  return localCountries(team).includes(player.nationality);
}
function isNBAInternational(player) {
  return player.nationality !== 'USA';
}
function nbaInternationalCount(state, team) {
  return rosterPlayers(state, team).filter(isNBAInternational).length;
}
function nbaCanAcceptNationality(state, team, player) {
  if (team.type !== 'NBA' || !isNBAInternational(player)) return true;
  return nbaInternationalCount(state, team) < 3;
}
function rosterPlayers(state, team) {
  return team.rosterIds.map((id) => state.players.find((player) => player.id === id)).filter(Boolean);
}
function foreignCount(state, team) {
  return rosterPlayers(state, team).filter((player) => !isLocalForTeam(player, team)).length;
}
function ncaaAlumniCount(state, team) {
  return rosterPlayers(state, team).filter((player) => player.originRoute === 'NCAA').length;
}
function canAcceptPlayer(state, team, player) {
  if (['NCAA','National'].includes(team.type)) return false;
  if (!nbaCanAcceptNationality(state, team, player)) return false;
  if (team.type === 'Pro' && player.originRoute === 'NCAA') {
    const cap = team.secondaryCompetitionIds.includes('euroleague') ? 4 : 3;
    if (ncaaAlumniCount(state, team) >= cap) return false;
  }
  if (isLocalForTeam(player, team)) return true;
  return foreignCount(state, team) < team.targetRoster - team.localMinimum;
}
function openNBAInternationalSlotForElite(state, team, incoming) {
  if (team.type !== 'NBA' || !isNBAInternational(incoming) || nbaInternationalCount(state, team) < 3) return true;
  if (!(incoming.current >= 89 || ['Generational','Legend'].includes(incoming.rarity))) return false;
  const weakestInternational = rosterPlayers(state, team).filter(isNBAInternational).sort((a,b)=>rosterValue(a)-rosterValue(b))[0];
  if (!weakestInternational || rosterValue(incoming) < rosterValue(weakestInternational) + 1) return false;
  releaseToFreeAgency(state, weakestInternational, 'NBA release', `${team.name} opened an international roster place for an elite incoming player.`);
  return true;
}
function weakestReplaceable(state, team, incoming) {
  const roster = rosterPlayers(state, team).sort((a, b) => rosterValue(a) - rosterValue(b));
  return roster.find((player) => isLocalForTeam(incoming, team) || !isLocalForTeam(player, team)) ?? roster[0];
}
function releaseWeakestFor(state, team, incoming, threshold = 2) {
  if (team.rosterIds.length < team.targetRoster) return true;
  const weakest = weakestReplaceable(state, team, incoming);
  if (!weakest || rosterValue(incoming) < rosterValue(weakest) + threshold) return false;
  releaseToFreeAgency(state, weakest, 'Released', `${team.name} opened a roster place for a stronger option.`);
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
      if (!nbaCanAcceptNationality(state, team, player)) return;
      const vacancy = team.rosterIds.length < team.targetRoster;
      const weakest = rosterPlayers(state, team).sort((a, b) => a.current - b.current)[0];
      const threshold = pick.round === 1 ? 72 : 75;
      const probability = pick.round === 1 ? 0.78 : 0.42;
      const shouldJoin = player.current >= threshold && (vacancy || (weakest && player.current >= weakest.current + 3)) && stateRandom(state) < probability;
      if (!shouldJoin) return;
      if (!vacancy && weakest) releaseToFreeAgency(state, weakest, 'NBA release', `Waived to create a place for pick ${pick.pick}.`);
      movePlayer(state, player, team, 'NBA signing', `Joined immediately after being drafted ${pick.pick}.`, pick.round === 1 ? integer(2,4,() => stateRandom(state)) : integer(1,3,() => stateRandom(state)));
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
  exitClass.forEach((original) => {
    const player = state.players.find((item) => item.id === original.id);
    if (!player || player.teamType === 'NBA') return;
    const drafted = player.draft?.year === state.year;
    releaseToFreeAgency(state, player, drafted ? 'Draft-and-stash market' : 'NCAA graduation', drafted ? `${player.draft.team} retained NBA rights while he entered professional free agency.` : 'Entered professional free agency after college.');
  });
  return exitIds;
}
function ageCollegeExits(state, exitClass) {
  const random = () => stateRandom(state);
  exitClass.forEach((original) => {
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
function nbaSwapIsValid(state, teamA, playerA, teamB, playerB) {
  const rosterA = rosterPlayers(state, teamA).filter((player) => player.id !== playerA.id).concat(playerB);
  const rosterB = rosterPlayers(state, teamB).filter((player) => player.id !== playerB.id).concat(playerA);
  const localsA = rosterA.filter((player) => isLocalForTeam(player, teamA)).length;
  const localsB = rosterB.filter((player) => isLocalForTeam(player, teamB)).length;
  const internationalA = rosterA.filter(isNBAInternational).length;
  const internationalB = rosterB.filter(isNBAInternational).length;
  return localsA >= teamA.localMinimum && localsB >= teamB.localMinimum && internationalA <= 3 && internationalB <= 3;
}
function executeNBASwap(state, teamA, playerA, teamB, playerB) {
  removeFromTeam(teamA, playerA.id); removeFromTeam(teamB, playerB.id);
  teamA.rosterIds.push(playerB.id); teamB.rosterIds.push(playerA.id);
  const update = (player, destination) => {
    player.teamId = destination.id; player.teamName = destination.name; player.teamType = destination.type;
    player.competition = destination.competition; player.competitionId = destination.competitionId; player.status = 'Active';
    if (player.contract) player.contract.teamId = destination.id;
  };
  update(playerA, teamB); update(playerB, teamA);
  logTransaction(state, playerA, 'NBA trade', teamA, teamB, `Player-for-player trade involving ${playerB.name}. Contract carried to the new team.`);
  logTransaction(state, playerB, 'NBA trade', teamB, teamA, `Player-for-player trade involving ${playerA.name}. Contract carried to the new team.`);
}
function runNBATrades(state) {
  const teams = state.teams.filter((team) => team.type === 'NBA');
  const targetTrades = integer(8, 14, () => stateRandom(state));
  let completed = 0;
  let attempts = 0;
  while (completed < targetTrades && attempts < targetTrades * 80) {
    attempts += 1;
    const teamA = teams[Math.floor(stateRandom(state) * teams.length)];
    let teamB = teams[Math.floor(stateRandom(state) * teams.length)];
    if (!teamA || !teamB || teamA.id === teamB.id) continue;
    const eligibleA = rosterPlayers(state, teamA).filter((player) => player.contract && player.draft?.year !== state.year && player.rarity !== 'Generational');
    const eligibleB = rosterPlayers(state, teamB).filter((player) => player.contract && player.draft?.year !== state.year && player.rarity !== 'Generational');
    if (!eligibleA.length || !eligibleB.length) continue;
    const sortedA = [...eligibleA].sort((a,b)=>rosterValue(a)-rosterValue(b));
    const poolA = stateRandom(state) < 0.15 ? sortedA.slice(-5) : sortedA.slice(0, Math.min(7, sortedA.length));
    const playerA = poolA[Math.floor(stateRandom(state) * poolA.length)];
    const valueA = rosterValue(playerA);
    const matches = eligibleB.filter((player) => Math.abs(rosterValue(player) - valueA) <= 8 && player.id !== playerA.id && isNBAInternational(player) === isNBAInternational(playerA))
      .sort((a,b)=>Math.abs(rosterValue(a)-valueA)-Math.abs(rosterValue(b)-valueA));
    if (!matches.length) continue;
    const playerB = matches[Math.floor(stateRandom(state) * Math.min(4, matches.length))];
    if (!nbaSwapIsValid(state, teamA, playerA, teamB, playerB)) continue;
    executeNBASwap(state, teamA, playerA, teamB, playerB);
    completed += 1;
  }
  return completed;
}

function runPlayerTransfers(state) {
  runNBATrades(state);
  const nbaCandidates = state.players.filter((player) => player.teamType === 'NBA' && player.age >= 23 && player.current <= 78 && player.history.filter((season) => season.competition === 'NBA').length >= 2);
  nbaCandidates.forEach((player) => {
    if (stateRandom(state) > 0.18) return;
    releaseToFreeAgency(state, player, 'NBA release', 'Unable to secure a stable NBA rotation role.');
  });
  const overseasStars = state.players.filter((player) => player.teamType === 'Pro' && player.age >= 19 && player.age <= 31 && (
    player.rarity === 'Generational' ||
    player.rarity === 'Legend' ||
    (player.rarity === 'Epic' && (player.current >= 80 || player.base >= 86)) ||
    player.current >= 86
  ));
  overseasStars.forEach((player) => {
    let migrationChance = player.rarity === 'Generational' ? 0.96 : player.rarity === 'Legend' ? 0.72 : player.rarity === 'Epic' ? 0.30 : 0.10;
    if (player.current >= 89) migrationChance = Math.max(migrationChance, 0.98);
    if (player.current >= 86) migrationChance = Math.max(migrationChance, 0.62);
    if (player.europeanLifer) migrationChance *= 0.16;
    if (stateRandom(state) > migrationChance) return;
    const rightsTeam = player.rightsTeamId ? state.teams.find((team) => team.id === player.rightsTeamId) : null;
    const candidates = rightsTeam
      ? [rightsTeam]
      : state.teams.filter((team) => team.type === 'NBA').sort((a, b) => {
        const aWeak = rosterPlayers(state, a).sort((x, y) => rosterValue(x) - rosterValue(y))[0];
        const bWeak = rosterPlayers(state, b).sort((x, y) => rosterValue(x) - rosterValue(y))[0];
        return rosterValue(aWeak ?? { current: 0, age: 30, base: 0 }) - rosterValue(bWeak ?? { current: 0, age: 30, base: 0 });
      });
    const threshold = ['Generational','Legend'].includes(player.rarity) ? -2 : player.rarity === 'Epic' ? 0 : 2;
    const destination = candidates.find((team) => (nbaCanAcceptNationality(state, team, player) || openNBAInternationalSlotForElite(state, team, player)) && releaseWeakestFor(state, team, player, threshold));
    if (!destination) return;
    movePlayer(state, player, destination, 'NBA transfer', player.rightsTeamId === destination.id ? `${destination.name} activated its draft rights.` : 'Signed after elite international production.');
    const right = state.draftRights.find((item) => item.playerId === player.id && item.active);
    if (right) right.active = false;
  });
  const proMovers = state.players.filter((player) => player.teamType === 'Pro' && player.status === 'Active' && player.age >= 22 && stateRandom(state) < 0.04).slice(0, 90);
  proMovers.forEach((player) => {
    const candidates = state.teams.filter((team) => team.type === 'Pro' && team.id !== player.teamId && canAcceptPlayer(state, team, player))
      .map((team) => ({ team, score: team.prestige + team.rating * 0.12 + (isLocalForTeam(player, team) ? 2 : 0) + stateRandom(state) * 2 }))
      .sort((a, b) => b.score - a.score);
    const destination = candidates.find(({ team }) => releaseWeakestFor(state, team, player, 2))?.team;
    if (destination) movePlayer(state, player, destination, 'Transfer', 'Moved during the international transfer market.');
  });
}
function freeAgentScore(state, team, player, owner = null) {
  owner ??= state.owners.find((item) => item.id === team.ownerId);
  const levelTarget = team.type === 'NBA' ? 82 : team.secondaryCompetitionIds.includes('euroleague') ? 79 : team.type === 'GLeague' ? 72 : team.tier === 2 ? 69 : 74;
  const fit = -Math.abs(player.current - levelTarget) * 0.18;
  const eliteBonus = player.rarity === 'Generational' ? 14 : player.rarity === 'Legend' ? 9 : player.rarity === 'Epic' ? 4 : 0;
  const futureBonus = player.age <= 23 ? Math.max(0, player.base - player.current) * (team.type === 'NBA' ? 0.52 : 0.18) : 0;
  const destinationBonus = team.type === 'NBA'
    ? eliteBonus + futureBonus
    : (player.rarity === 'Generational' ? -18 : player.rarity === 'Legend' && !player.europeanLifer ? -7 : 0);
  return player.current + fit + destinationBonus + team.prestige * 0.55 + (owner?.recruitment ?? 0) * 0.35 + (isLocalForTeam(player, team) ? 5 : 0) + stateRandom(state) * 3;
}
function availableFreeAgents(state) {
  return state.players.filter((player) => player.status === 'Free Agent');
}
function signBestFreeAgent(state, team, localOnly = false) {
  // Compute roster restrictions once. Calling canAcceptPlayer for every candidate
  // repeatedly rescanned the full roster and became very slow in long saves.
  const roster = rosterPlayers(state, team);
  const foreignSlots = team.targetRoster - team.localMinimum - roster.filter((player) => !isLocalForTeam(player, team)).length;
  const ncaaCap = team.type === 'Pro' ? (team.secondaryCompetitionIds.includes('euroleague') ? 4 : 3) : Infinity;
  const ncaaSlots = ncaaCap - roster.filter((player) => player.originRoute === 'NCAA').length;
  const owner = state.owners.find((item) => item.id === team.ownerId) ?? null;
  let selected = null;
  let selectedScore = -Infinity;
  for (const player of availableFreeAgents(state)) {
    const local = isLocalForTeam(player, team);
    if (!nbaCanAcceptNationality(state, team, player)) continue;
    if (localOnly && !local) continue;
    if (!local && foreignSlots <= 0) continue;
    if (team.type === 'Pro' && player.originRoute === 'NCAA' && ncaaSlots <= 0) continue;
    const score = freeAgentScore(state, team, player, owner);
    if (score > selectedScore) { selected = player; selectedScore = score; }
  }
  if (!selected) return false;
  movePlayer(state, selected, team, selected.draft?.year === state.year && selected.rightsTeamId !== team.id ? 'Draft-and-stash signing' : 'Free-agent signing', `Signed through ${state.year + 1 + (team.type === 'NBA' ? 2 : 1)}.`);
  return true;
}
function createUnattachedProspect(state, nationality = 'USA', position = null, talentClass = 'NCAA', route = 'Undrafted free agent') {
  const random = () => stateRandom(state);
  const dummy = { id: null, name: 'Free Agency', country: nationality, region: REGION_BY_COUNTRY[nationality] ?? 'North America', type: 'FreeAgent', competition: 'Free Agency', competitionId: 'free-agency', talentClass };
  const player = createPlayer(dummy, position ?? choice(POSITIONS, random), route === 'Undrafted free agent' ? 22 : 18, random, state.nextPlayerId++, state.year + 1, { talentClass, nationality, originRoute: route === 'Undrafted free agent' ? 'NCAA' : 'Open market', maxRarity: 'Rare' });
  player.teamId = null; player.teamName = 'Free Agent'; player.teamType = 'FreeAgent'; player.status = 'Free Agent'; player.contract = null;
  player.careerEvents = [{ year: state.year + 1, type: route, detail: `Entered professional free agency as a ${route.toLowerCase()}.` }];
  state.players.push(player); state.freeAgents.push(player.id);
  return player;
}

function createAnnualTalentPlan(state) {
  state.eliteRouteBalance ??= { NCAA: 0, International: 0 };
  const activeCounts = Object.fromEntries(Object.keys(ELITE_ACTIVE_TARGETS).map((rarity) => [rarity, state.players.filter((player) => player.rarity === rarity && !['Retired','Left professional basketball'].includes(player.status)).length]));
  const eliteRarities = [];
  ['Generational','Legend','Epic'].forEach((rarity) => {
    const deficit = Math.max(0, ELITE_ACTIVE_TARGETS[rarity] - (activeCounts[rarity] ?? 0));
    for (let index = 0; index < deficit; index += 1) eliteRarities.push(rarity);
  });
  // Keep the magical elite population controlled. Normal years replace only
  // careers that have left the active world rather than manufacturing 8–10
  // new superstars every summer.
  const annualElite = eliteRarities.slice(0, 6);
  for (let index = annualElite.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(stateRandom(state) * (index + 1));
    [annualElite[index], annualElite[swap]] = [annualElite[swap], annualElite[index]];
  }
  let ncaaCount = Math.floor(annualElite.length / 2);
  if (annualElite.length % 2 === 1 && state.eliteRouteBalance.NCAA <= state.eliteRouteBalance.International) ncaaCount += 1;
  const ncaaRarities = annualElite.slice(0, ncaaCount);
  const internationalRarities = annualElite.slice(ncaaCount);
  state.eliteRouteBalance.NCAA += ncaaRarities.length;
  state.eliteRouteBalance.International += internationalRarities.length;

  const ncaaOpenings = state.teams.filter((team) => team.type === 'NCAA').flatMap((team) => {
    const roster = rosterPlayers(state, team);
    const coach = state.coaches.find((item) => item.id === team.coachId);
    return POSITIONS.filter((position) => !roster.some((player) => player.position === position)).map((position) => ({
      key: `${team.id}-${position}`,
      score: team.prestige * 2.2 + (coach?.development ?? 65) * 0.035 + stateRandom(state) * 8,
    }));
  });
  const assignmentPool = [...ncaaOpenings].sort((a, b) => b.score - a.score).slice(0, Math.max(ncaaRarities.length * 10, 24));
  const ncaaAssignments = {};
  ncaaRarities.forEach((rarity) => {
    if (!assignmentPool.length) return;
    const pickIndex = Math.floor(stateRandom(state) * assignmentPool.length);
    const [assignment] = assignmentPool.splice(pickIndex, 1);
    ncaaAssignments[assignment.key] = rarity;
  });
  const internationalSpawns = 80;
  state.talentPlan = {
    year: state.year + 1,
    ncaaAssignments,
    internationalElite: [...internationalRarities],
    internationalRemaining: internationalSpawns,
    internationalSpawns,
    plannedElite: annualElite.length,
  };
}
function plannedRarity(state, route, teamId = null, position = null) {
  const plan = state.talentPlan;
  if (!plan) return { forcedRarity: null, maxRarity: 'Rare' };
  if (route === 'NCAA') {
    const forcedRarity = plan.ncaaAssignments?.[`${teamId}-${position}`] ?? null;
    return forcedRarity ? { forcedRarity, maxRarity: null } : { forcedRarity: null, maxRarity: 'Rare' };
  }
  const pool = plan.internationalElite;
  const remaining = Math.max(1, plan.internationalRemaining);
  const useElite = pool.length > 0 && (pool.length >= remaining || stateRandom(state) < pool.length / remaining);
  plan.internationalRemaining = Math.max(0, remaining - 1);
  return useElite ? { forcedRarity: pool.pop(), maxRarity: null } : { forcedRarity: null, maxRarity: 'Rare' };
}

function academyDevelopmentScore(state, team) {
  const coach = state.coaches.find((item) => item.id === team.coachId);
  const owner = state.owners.find((item) => item.id === team.ownerId);
  return team.prestige * 1.4 + (coach?.development ?? 65) * 0.04 + (owner?.development ?? 0) * 0.18 + stateRandom(state) * 4;
}
function generateInternationalYouthClass(state) {
  state.currentSpawns ??= [];
  const teams = state.teams.filter((team) => team.type === 'Pro');
  const appearances = new Map();
  const count = state.talentPlan?.internationalSpawns ?? 80;
  for (let index = 0; index < count; index += 1) {
    const candidates = teams
      .filter((team) => (appearances.get(team.id) ?? 0) < 2)
      .map((team) => ({ team, score: academyDevelopmentScore(state, team) }))
      .sort((a, b) => b.score - a.score);
    const pool = candidates.slice(0, Math.max(12, Math.floor(candidates.length * 0.35)));
    const selected = pool[Math.floor(stateRandom(state) * pool.length)]?.team;
    if (!selected) break;
    appearances.set(selected.id, (appearances.get(selected.id) ?? 0) + 1);
    const roster = rosterPlayers(state, selected);
    const positionCounts = Object.fromEntries(POSITIONS.map((position) => [position, roster.filter((player) => player.position === position).length]));
    const position = [...POSITIONS].sort((a, b) => positionCounts[a] - positionCounts[b] || POSITIONS.indexOf(a) - POSITIONS.indexOf(b))[0];
    const rarityPlan = plannedRarity(state, 'International');
    const random = () => stateRandom(state);
    const talentClass = selected.secondaryCompetitionIds.includes('euroleague') ? 'EuroAcademy' : selected.prestige >= 7.2 ? 'ProTop' : selected.tier === 2 ? 'Tier2' : 'Academy';
    const player = createPlayer(selected, position, 18, random, state.nextPlayerId++, state.year + 1, {
      talentClass,
      forceLocal: stateRandom(state) < 0.8,
      originRoute: 'Club academy',
      ...rarityPlan,
    });
    assignContract(player, selected, state.year + 1, random, 3);
    state.players.push(player);
    maybeApplyHistoricalIdentity(state, player);
    selected.rosterIds.push(player.id);
    state.currentSpawns.push({ playerId: player.id, player: player.name, team: selected.name, position, nationality: player.nationality, rarity: player.rarity, route: 'Club academy', realIdentity: Boolean(player.realIdentity), historicalArchetype: player.historicalArchetype ?? null });
  }
}

function rosterValue(player) {
  const potentialCredit = player.age <= 21 ? Math.max(0, player.base - player.current) * 0.42 : 0;
  return player.current + potentialCredit;
}
function activateRightsOrSignFromClub(state, team, localOnly = false) {
  const roster = rosterPlayers(state, team);
  const rightsCandidates = state.draftRights
    .filter((right) => right.active && right.teamId === team.id)
    .map((right) => state.players.find((player) => player.id === right.playerId))
    .filter((player) => player && player.teamType !== 'NBA' && (!localOnly || isLocalForTeam(player, team)) && nbaCanAcceptNationality(state, team, player))
    .sort((a, b) => (b.base * 0.55 + b.current * 0.45) - (a.base * 0.55 + a.current * 0.45));
  const candidate = rightsCandidates[0];
  if (candidate && (team.rosterIds.length < team.targetRoster || releaseWeakestFor(state, team, candidate, 1))) {
    movePlayer(state, candidate, team, 'NBA rights activated', `${team.name} brought its drafted prospect into the NBA.`);
    const right = state.draftRights.find((item) => item.playerId === candidate.id && item.teamId === team.id && item.active);
    if (right) right.active = false;
    candidate.nbaJoinedYear ??= state.year + 1;
    return true;
  }
  const sourceTypes = team.type === 'NBA' ? ['GLeague', 'Pro'] : ['Pro'];
  const market = state.players
    .filter((player) => sourceTypes.includes(player.teamType) && player.status === 'Active' && (!localOnly || isLocalForTeam(player, team)) && nbaCanAcceptNationality(state, team, player))
    .filter((player) => {
      const source = state.teams.find((item) => item.id === player.teamId);
      return source && source.rosterIds.length > Math.max(7, source.localMinimum);
    })
    .sort((a, b) => {
      const aScore = a.current + a.base * (a.age <= 23 ? 0.18 : 0) + (a.rarity === 'Generational' ? 12 : a.rarity === 'Legend' ? 8 : a.rarity === 'Epic' ? 4 : 0);
      const bScore = b.current + b.base * (b.age <= 23 ? 0.18 : 0) + (b.rarity === 'Generational' ? 12 : b.rarity === 'Legend' ? 8 : b.rarity === 'Epic' ? 4 : 0);
      return bScore - aScore;
    });
  const transfer = market[0];
  if (!transfer || (team.rosterIds.length >= team.targetRoster && !releaseWeakestFor(state, team, transfer, 1))) return false;
  movePlayer(state, transfer, team, team.type === 'NBA' ? 'NBA transfer' : 'Development transfer', team.type === 'NBA' ? 'Signed from the international/development market.' : 'Moved into the development league.');
  transfer.nbaJoinedYear ??= team.type === 'NBA' ? state.year + 1 : undefined;
  return true;
}
function ensureLocalQuota(state, team) {
  if (['NCAA','National'].includes(team.type)) return;
  let roster = rosterPlayers(state, team);
  let locals = roster.filter((player) => isLocalForTeam(player, team)).length;
  let quotaGuard = 0;
  while (locals < team.localMinimum) {
    quotaGuard += 1;
    if (quotaGuard > 30) throw new Error(`Unable to satisfy local quota for ${team.name}.`);
    const foreign = roster.filter((player) => !isLocalForTeam(player, team)).sort((a, b) => a.current - b.current)[0];
    if (foreign) releaseToFreeAgency(state, foreign, 'Roster release', 'Released to satisfy the local-player roster requirement.');
    if (!signBestFreeAgent(state, team, true)) {
      if (team.type === 'NBA' || team.type === 'GLeague') {
        if (!activateRightsOrSignFromClub(state, team, true)) throw new Error(`Unable to source a local market player for ${team.name}.`);
      } else {
        const positionCounts = Object.fromEntries(POSITIONS.map((position) => [position, rosterPlayers(state, team).filter((player) => player.position === position).length]));
        const position = [...POSITIONS].sort((a, b) => positionCounts[a] - positionCounts[b])[0];
        const random = () => stateRandom(state);
        const academyClass = team.secondaryCompetitionIds.includes('euroleague') ? 'EuroAcademy' : team.prestige >= 7.2 ? 'Pro' : team.tier === 2 ? 'Tier2' : 'Academy';
        const academy = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: academyClass, forceLocal: true, originRoute: 'Club academy', maxRarity: 'Rare' });
        assignContract(academy, team, state.year + 1, random);
        state.players.push(academy); team.rosterIds.push(academy.id);
        state.currentSpawns.push({ playerId: academy.id, player: academy.name, team: team.name, position, nationality: academy.nationality, rarity: academy.rarity, route: 'Local academy', realIdentity: Boolean(academy.realIdentity), historicalArchetype: academy.historicalArchetype ?? null });
      }
    }
    roster = rosterPlayers(state, team); locals = roster.filter((player) => isLocalForTeam(player, team)).length;
  }
}
function fillRosters(state) {
  state.currentSpawns ??= [];
  state.teams.forEach((team) => {
    if (team.type === 'National') return;
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position) => {
        const hasPosition = rosterPlayers(state, team).some((player) => player.position === position);
        if (!hasPosition) {
          const random = () => stateRandom(state);
          const rarityPlan = plannedRarity(state, 'NCAA', team.id, position);
          const player = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: 'NCAA', forceLocal: stateRandom(state) < 0.8, originRoute: 'NCAA', ...rarityPlan });
          state.players.push(player); maybeApplyHistoricalIdentity(state, player); team.rosterIds.push(player.id);
          state.currentSpawns.push({ playerId: player.id, player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: 'NCAA freshman', realIdentity: Boolean(player.realIdentity), historicalArchetype: player.historicalArchetype ?? null });
        }
      });
      while (team.rosterIds.length > 5) {
        const extra = rosterPlayers(state, team).sort((a, b) => rosterValue(a) - rosterValue(b))[0];
        if (!extra) break;
        releaseToFreeAgency(state, extra, 'NCAA roster exit', 'Lost the starting-five place.');
      }
      return;
    }
    ensureLocalQuota(state, team);
    let fillGuard = 0;
    while (team.rosterIds.length < team.targetRoster) {
      fillGuard += 1;
      if (fillGuard > 30) throw new Error(`Unable to fill roster for ${team.name}.`);
      if (signBestFreeAgent(state, team, rosterPlayers(state, team).filter((player) => isLocalForTeam(player, team)).length < team.localMinimum)) continue;
      if (team.type === 'NBA' || team.type === 'GLeague') {
        if (activateRightsOrSignFromClub(state, team, rosterPlayers(state, team).filter((player) => isLocalForTeam(player, team)).length < team.localMinimum)) continue;
        throw new Error(`No existing market player could complete ${team.name}'s roster.`);
      }
      const roster = rosterPlayers(state, team);
      const positionCounts = Object.fromEntries(POSITIONS.map((position) => [position, roster.filter((player) => player.position === position).length]));
      const position = [...POSITIONS].sort((a, b) => positionCounts[a] - positionCounts[b])[0];
      const random = () => stateRandom(state);
      const forceLocal = roster.filter((player) => isLocalForTeam(player, team)).length < team.localMinimum;
      const academyClass = team.type === 'GLeague' ? 'GLeague' : team.secondaryCompetitionIds.includes('euroleague') ? 'EuroAcademy' : team.prestige >= 7.2 ? 'Pro' : team.tier === 2 ? 'Tier2' : 'Academy';
      const player = createPlayer(team, position, 18, random, state.nextPlayerId++, state.year + 1, { talentClass: academyClass, forceLocal, originRoute: 'Club academy', maxRarity: 'Rare' });
      assignContract(player, team, state.year + 1, random);
      state.players.push(player); team.rosterIds.push(player.id);
      state.currentSpawns.push({ playerId: player.id, player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: 'Club academy', realIdentity: Boolean(player.realIdentity), historicalArchetype: player.historicalArchetype ?? null });
    }
    while (team.rosterIds.length > team.targetRoster) {
      const extra = rosterPlayers(state, team).sort((a, b) => rosterValue(a) - rosterValue(b))[0];
      if (!extra) break;
      releaseToFreeAgency(state, extra, team.type === 'NBA' ? 'NBA release' : 'Roster release', 'Cut when the final roster was selected.');
    }
    ensureLocalQuota(state, team);
  });
  const unsigned = availableFreeAgents(state).sort((a, b) => b.current - a.current);
  unsigned.slice(80).forEach((player) => archivePlayer(state, player, player.age >= 31 ? 'Retirement' : 'Left professional basketball'));
  state.freeAgents = availableFreeAgents(state).map((player) => player.id);
  state.spawnHistory.unshift({ year: state.year + 1, players: state.currentSpawns });
  state.freeAgencyHistory.unshift({ year: state.year + 1, signings: state.transactions.filter((item) => item.year === state.year && ['Free-agent signing','Draft-and-stash signing'].includes(item.type)).length, unsigned: state.freeAgents.length });
  state.talentHistory ??= [];
  const eliteSpawns = state.currentSpawns.filter((spawn) => ['Epic','Legend','Generational'].includes(spawn.rarity));
  const ncaaElite = eliteSpawns.filter((spawn) => spawn.route === 'NCAA freshman').length;
  const internationalElite = eliteSpawns.filter((spawn) => spawn.route === 'Club academy').length;
  state.talentHistory.unshift({ year: state.year + 1, ncaaElite, internationalElite, totalElite: ncaaElite + internationalElite, ncaaShare: ncaaElite + internationalElite ? round(ncaaElite / (ncaaElite + internationalElite) * 100, 1) : 0 });
  delete state.currentSpawns;
  delete state.talentPlan;
}
function archiveCoach(state, coach, reason) {
  const team = state.teams.find((item) => item.id === coach.teamId);
  if (team?.coachId === coach.id) team.coachId = null;
  coach.status = reason === 'Retirement' ? 'Retired' : 'Free Agent';
  coach.careerEvents.push({ year: state.year, type: reason, detail: `${reason} from ${team?.name ?? 'basketball'}.` });
  state.coachTransactions.unshift({ year: state.year, coachId: coach.id, coach: coach.name, type: reason, fromTeamId: team?.id ?? null, from: team?.name ?? 'Basketball', to: reason === 'Retirement' ? 'Retired' : 'Coaching market' });
  coach.teamId = null; coach.teamName = reason === 'Retirement' ? 'Retired' : 'Free Agent';
  if (reason === 'Retirement') {
    state.retiredCoaches.unshift(coach);
    state.coaches = state.coaches.filter((item) => item.id !== coach.id);
  }
}
function hireCoach(state, team, coach, type = 'Coach appointment') {
  coach.teamId = team.id; coach.teamName = team.name; coach.status = 'Active'; coach.contractEnd = state.year + integer(2,5,() => stateRandom(state));
  team.coachId = coach.id;
  coach.careerEvents.push({ year: state.year, type, detail: `Appointed by ${team.name}.` });
  state.coachTransactions.unshift({ year: state.year, coachId: coach.id, coach: coach.name, type, from: 'Coaching market', toTeamId: team.id, to: team.name });
}
function manageCoaches(state) {
  [...state.coaches].forEach((coach) => {
    coach.age += 1; coach.careerYear += 1; coach.current = clamp(coach.base + integer(-3,3,() => stateRandom(state)), 48, 99);
    if (coach.careerYear >= coach.careerYears) { archiveCoach(state, coach, 'Retirement'); return; }
    if (coach.status !== 'Active') return;
    const team = state.teams.find((item) => item.id === coach.teamId);
    const owner = state.owners.find((item) => item.id === team?.ownerId);
    const pctValue = team ? team.wins / Math.max(1, team.wins + team.losses) : 0.5;
    const firingRisk = clamp(0.05 + Math.max(0, 0.45 - pctValue) * 0.8 - (owner?.patience ?? 0) * 0.01, 0.02, 0.42);
    if (stateRandom(state) < firingRisk) archiveCoach(state, coach, 'Fired');
    else if (coach.contractEnd <= state.year + 1 && stateRandom(state) < 0.28) archiveCoach(state, coach, 'Contract ended');
  });
  state.teams.forEach((team) => {
    if (team.coachId) return;
    const free = state.coaches.filter((coach) => coach.status === 'Free Agent').sort((a, b) => (b.current + (b.nationality === team.country ? 5 : 0)) - (a.current + (a.nationality === team.country ? 5 : 0)))[0];
    const coach = free ?? createCoach(team, () => stateRandom(state), state.nextCoachId++, state.year + 1);
    if (!free) state.coaches.push(coach);
    hireCoach(state, team, coach);
  });
}
function updateOwners(state) {
  state.teams.forEach((team) => {
    const owner = state.owners.find((item) => item.id === team.ownerId);
    if (owner && owner.endYear > state.year) {
      const performance = team.wins / Math.max(1, team.wins + team.losses) - 0.5;
      team.prestige = round(clamp(team.prestige + performance * 0.16 + owner.recruitment * 0.005, 3, 10), 1);
      return;
    }
    if (owner) {
      owner.status = 'Former';
      owner.actualEndYear = state.year;
      state.formerOwners.unshift(owner);
      state.owners = state.owners.filter((item) => item.id !== owner.id);
      team.leadershipHistory.unshift({ ownerId: owner.id, owner: owner.name, rarity: owner.rarity, profile: owner.profile, startYear: owner.startYear, endYear: state.year });
    }
    const replacement = createOwner(team, () => stateRandom(state), state.nextOwnerId++, state.year + 1);
    state.owners.push(replacement); team.ownerId = replacement.id;
  });
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

export const OFFSEASON_STAGES = [
  'Retirements & contracts',
  'NBA Draft & graduating class',
  'Trade window',
  'Free agency & roster building',
  'Offseason summary & new season',
];

function captureOffseasonRatings(state) {
  return Object.fromEntries(state.teams.filter((team)=>!['National'].includes(team.type)).map((team)=>[team.id,{ rating: team.rating, rawRating: team.rawRating }]));
}
function recordOffseasonSummary(state) {
  state.offseasonHistory ??= [];
  const before = state.offseason?.preRatings ?? {};
  const yearTransactions = state.transactions.filter((item)=>item.year===state.year);
  const teams = state.teams.filter((team)=>!['National'].includes(team.type)).map((team)=>{
    const prior = before[team.id] ?? { rating: team.rating, rawRating: team.rawRating };
    const arrivals = yearTransactions.filter((item)=>item.toTeamId===team.id).length;
    const departures = yearTransactions.filter((item)=>item.fromTeamId===team.id).length;
    return {
      teamId: team.id, team: team.name, country: team.country, region: team.region, competition: team.competition,
      before: round(prior.rating,1), after: round(team.rating,1), delta: round(team.rating-prior.rating,1),
      rawBefore: round(prior.rawRating,1), rawAfter: round(team.rawRating,1), arrivals, departures,
    };
  });
  const nbaTeams = state.teams.filter((team)=>team.type==='NBA');
  const nbaPlayers = nbaTeams.flatMap((team)=>rosterPlayers(state,team));
  const international = nbaPlayers.filter(isNBAInternational).length;
  const nbaTradeRows = yearTransactions.filter((item)=>item.type==='NBA trade').length;
  const internationalTransfers = yearTransactions.filter((item)=>item.type==='Transfer').length;
  state.offseasonHistory.unshift({
    year: state.year+1,
    teams,
    transactions: yearTransactions.length,
    nbaTrades: Math.round(nbaTradeRows/2),
    internationalTransfers,
    freeAgentSignings: yearTransactions.filter((item)=>item.type==='Free-agent signing').length,
    nbaInternationalPlayers: international,
    nbaInternationalShare: round(international/Math.max(1,nbaPlayers.length)*100,1),
  });
}

export function startOffseason(universe) {
  if (!universe.yearReview || universe.offseason?.active) return universe;
  const state = universe;
  state.offseasonHistory ??= [];
  state.offseason = { active: true, stageIndex: 0, year: state.year, preRatings: captureOffseasonRatings(state), exitClassIds: [] };
  state.phase = `Offseason · ${OFFSEASON_STAGES[0]}`;
  return { ...state };
}

export function advanceOffseasonStage(universe) {
  if (!universe.yearReview) return universe;
  const state = universe.offseason?.active ? universe : startOffseason(universe);
  const stageIndex = state.offseason.stageIndex;
  if (stageIndex === 0) {
    state.freeAgents = state.freeAgents ?? [];
    state.retirements = state.retirements ?? [];
    state.coachTransactions = state.coachTransactions ?? [];
    state.freeAgencyHistory = state.freeAgencyHistory ?? [];
    ageProfessionals(state);
    processContractExpiries(state);
    manageCoaches(state);
    updateOwners(state);
    state.offseason.stageIndex = 1;
  } else if (stageIndex === 1) {
    const exitClass = collegeExitClass(state);
    state.offseason.exitClassIds = exitClass.map((player)=>player.id);
    const draft = runDraft(state, exitClass);
    signDraftPicks(state, draft);
    const exitIds = processCollegeExits(state, exitClass);
    ageCollegeExits(state, exitClass);
    ageRemainingCollege(state, exitIds);
    createAnnualTalentPlan(state);
    generateInternationalYouthClass(state);
    state.offseason.stageIndex = 2;
  } else if (stageIndex === 2) {
    runPlayerTransfers(state);
    state.offseason.stageIndex = 3;
  } else if (stageIndex === 3) {
    runPromotionRelegation(state);
    fillRosters(state);
    state.offseason.stageIndex = 4;
  } else {
    refreshNationalRosters(state);
    state.teams = recalculateTeamRatings(state.teams, state.players, state.coaches, state.owners);
    recordOffseasonSummary(state);
    resetSeason(state);
    state.year += 1; state.week = 1; state.phase = 'Regular season'; state.yearReview = false; state.finalizedYear = null;
    state.offseason = null;
    return { ...state };
  }
  state.phase = `Offseason · ${OFFSEASON_STAGES[state.offseason.stageIndex]}`;
  return { ...state };
}

export function advanceToNextYear(universe) {
  if (!universe.yearReview) return universe;
  let state = universe.offseason?.active ? universe : startOffseason(universe);
  let guard = 0;
  while (state.offseason?.active && guard < OFFSEASON_STAGES.length + 2) {
    state = advanceOffseasonStage(state);
    guard += 1;
  }
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
