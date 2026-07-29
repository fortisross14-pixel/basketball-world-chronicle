import {
  NBA_TEAMS,
  G_LEAGUE_TEAMS,
  EURO_TOP_CLUBS,
  EURO_DOMESTIC,
  NCAA_PROGRAMS,
  OTHER_PRO_TEAMS,
} from '../data/teamData.js';

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const REGION_BY_COUNTRY = {
  USA: 'North America', Canada: 'North America', Spain: 'Europe', Greece: 'Europe', Turkey: 'Europe',
  Italy: 'Europe', France: 'Europe', Germany: 'Europe', Lithuania: 'Europe', Israel: 'Europe',
  Serbia: 'Europe', Slovenia: 'Europe', Montenegro: 'Europe', UAE: 'Asia', Japan: 'Asia', China: 'Asia',
  Australia: 'Oceania', Argentina: 'South America', Brazil: 'South America', Nigeria: 'Africa', Senegal: 'Africa',
};
const FOREIGN_COUNTRIES = Object.keys(REGION_BY_COUNTRY);

const FIRST_NAMES = {
  USA: ['Jalen','Marcus','Darius','Jordan','Cameron','Malik','Tyrese','Isaiah','Devin','Jaylen','Tre','Miles','Cole','Andre','Noah'],
  Spain: ['Alejandro','Sergio','Pablo','Hugo','Álvaro','Javier','Mario','Dani','Iker','Adrián'],
  Serbia: ['Nikola','Luka','Miloš','Bogdan','Stefan','Marko','Aleksa','Vuk','Nemanja','Filip'],
  France: ['Victor','Theo','Mathis','Hugo','Nolan','Enzo','Alexandre','Louis','Yanis','Maxime'],
  Germany: ['Lukas','Jonas','Felix','Leon','Max','Moritz','Julian','Finn','Noah','Tobias'],
  Italy: ['Marco','Luca','Matteo','Davide','Andrea','Simone','Federico','Gabriele','Paolo','Riccardo'],
  Greece: ['Nikos','Giorgos','Kostas','Dimitris','Vasilis','Petros','Stavros','Alexandros','Manolis','Yiannis'],
  Turkey: ['Emre','Kerem','Mert','Arda','Berk','Can','Efe','Ozan','Deniz','Burak'],
  Lithuania: ['Jonas','Mantas','Lukas','Domantas','Rokas','Tomas','Arnas','Deividas','Karolis','Mindaugas'],
  Israel: ['Noam','Daniel','Ariel','Eitan','Omer','Lior','Itay','Nadav','Gil','Yoni'],
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
  USA: ['Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Robinson'],
  Spain: ['García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Ruiz'],
  Serbia: ['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Pavlović','Milošević','Simić'],
  France: ['Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Dubois','Moreau','Laurent'],
  Germany: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schäfer'],
  Italy: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco'],
  Greece: ['Papadopoulos','Georgiou','Nikolaidis','Pappas','Vasileiou','Dimitriou','Ioannidis','Christou','Alexiou','Kostas'],
  Turkey: ['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Öztürk','Arslan','Koç'],
  Lithuania: ['Kazlauskas','Petrauskas','Jankauskas','Stankevičius','Vasiliauskas','Paulauskas','Žukauskas','Urbonas','Kavaliauskas','Butkus'],
  Israel: ['Cohen','Levi','Mizrahi','Peretz','Biton','Dahan','Avraham','Friedman','Azoulay','Katz'],
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
  { name: 'Common', weight: 58, base: [66,72], career: [6,10] },
  { name: 'Uncommon', weight: 27, base: [73,78], career: [7,11] },
  { name: 'Rare', weight: 10, base: [79,83], career: [8,12] },
  { name: 'Epic', weight: 3.8, base: [84,88], career: [10,13] },
  { name: 'Legend', weight: 1, base: [89,93], career: [12,15] },
  { name: 'Generational', weight: 0.2, base: [94,98], career: [14,18] },
];
const CAREER_PROFILES = ['Young prodigy','Classic prime','Late bloomer','Early peak','Durable veteran','Volatile talent'];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const choice = (array, random = Math.random) => array[Math.floor(random() * array.length)];
const integer = (min, max, random = Math.random) => Math.floor(random() * (max - min + 1)) + min;

function createRandom(seed = 20260729) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function chooseRarity(random) {
  const total = RARITIES.reduce((sum, rarity) => sum + rarity.weight, 0);
  let roll = random() * total;
  for (const rarity of RARITIES) {
    roll -= rarity.weight;
    if (roll <= 0) return rarity;
  }
  return RARITIES[0];
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

function nationalityForTeam(team, random) {
  if (team.type === 'NCAA') return random() < 0.8 ? 'USA' : choice(FOREIGN_COUNTRIES.filter((country) => country !== 'USA'), random);
  return random() < 0.8 ? team.country : choice(FOREIGN_COUNTRIES.filter((country) => country !== team.country), random);
}

function playerName(country, random) {
  const first = FIRST_NAMES[country] ?? FIRST_NAMES.USA;
  const last = LAST_NAMES[country] ?? LAST_NAMES.USA;
  return `${choice(first, random)} ${choice(last, random)}`;
}

function buildStats(player, random = Math.random) {
  const roleUsage = ['Primary creator','Scoring guard','Three-level scorer','Low-post scorer','Interior scorer'].includes(player.role) ? 1.12 : 1;
  const minutes = player.teamType === 'NCAA' ? round(27 + (player.current - 65) * 0.28 + random() * 4, 1) : round(clamp(13 + (player.current - 65) * 0.72 + random() * 3, 8, 38), 1);
  const positionRebounds = { PG: 2.6, SG: 3.2, SF: 4.7, PF: 6.3, C: 7.8 }[player.position];
  const creator = ['Primary creator','Floor general','Point forward','Secondary creator','Playmaking big'].includes(player.role);
  const defender = ['Perimeter stopper','Two-way wing','Two-way forward','Rim protector'].includes(player.role);
  return {
    games: 0,
    minutes,
    ppg: round(clamp((player.current - 53) * 0.46 * (minutes / 30) * roleUsage + random() * 2, 1.5, 34), 1),
    rpg: round(clamp(positionRebounds + (player.rebounding - 70) * 0.09 + random(), 0.8, 16), 1),
    apg: round(clamp((creator ? 4.2 : 1.4) + (player.passing - 70) * 0.10 + random(), 0.4, 12.5), 1),
    spg: round(clamp(0.45 + (player.perimeterDefense - 60) * 0.024 + (defender ? 0.3 : 0) + random() * 0.35, 0.2, 3), 1),
    bpg: round(clamp(0.1 + (player.interiorDefense - 60) * 0.03 + (player.position === 'C' ? 0.55 : 0) + (player.role === 'Rim protector' ? 0.65 : 0), 0.1, 4), 1),
    fg: round(clamp(40 + (player.inside + player.midrange - 130) * 0.10 + random() * 3, 34, 68), 1),
    three: round(clamp(27 + (player.three - 55) * 0.25 + random() * 3, 18, 49), 1),
  };
}

function createPlayer(team, position, age, random, id, spawnYear) {
  const rarity = chooseRarity(random);
  const base = integer(rarity.base[0], rarity.base[1], random);
  const careerYears = integer(rarity.career[0], rarity.career[1], random);
  const careerProfile = choice(CAREER_PROFILES, random);
  const careerCurve = createCareerCurve(careerProfile, careerYears);
  let careerYear = clamp(age - 18, 0, careerYears - 1);
  if (team.type !== 'NCAA' && spawnYear <= 2026 && age > 18) {
    careerYear = integer(0, careerYears - 1, random);
    age = 18 + careerYear;
  }
  const annualShape = round(0.95 + random() * 0.06, 3);
  const current = Math.round(clamp(base * careerCurve[careerYear] * annualShape, 50, 99));
  const body = choice(BODY_BY_POSITION[position], random);
  const height = integer(HEIGHT[position][0], HEIGHT[position][1], random);
  const role = choice(ROLES[position], random);
  const nationality = nationalityForTeam(team, random);
  const bodyPenalty = body === 'Heavy' && ['PG','SG'].includes(position) ? 5 : 0;
  const sizeBonus = body === 'Heavy' && ['PF','C'].includes(position) ? 5 : 0;
  const player = {
    id,
    name: playerName(nationality, random),
    nationality,
    region: REGION_BY_COUNTRY[nationality] ?? 'Europe',
    age,
    position,
    height,
    body,
    role,
    rarity: rarity.name,
    base,
    careerYears,
    careerYear,
    careerProfile,
    careerCurve,
    annualShape,
    current,
    potential: Math.round(clamp(base * 1.02, base, 99)),
    teamId: team.id,
    teamName: team.name,
    teamType: team.type,
    competition: team.competition,
    spawnYear,
    status: 'Active',
    inside: Math.round(clamp(current + (['C','PF'].includes(position) ? 5 : 0) + sizeBonus + (random() - 0.5) * 10, 35, 99)),
    midrange: Math.round(clamp(current + (random() - 0.5) * 10, 35, 99)),
    three: Math.round(clamp(current + (['PG','SG','SF'].includes(position) ? 3 : -4) - bodyPenalty + (random() - 0.5) * 12, 30, 99)),
    passing: Math.round(clamp(current + (position === 'PG' ? 8 : position === 'C' ? -8 : 0) + (random() - 0.5) * 10, 30, 99)),
    rebounding: Math.round(clamp(current + ({ PG: -12, SG: -8, SF: -1, PF: 7, C: 11 }[position]) + sizeBonus + (random() - 0.5) * 9, 30, 99)),
    perimeterDefense: Math.round(clamp(current + (['PG','SG','SF'].includes(position) ? 2 : -5) - bodyPenalty + (random() - 0.5) * 10, 30, 99)),
    interiorDefense: Math.round(clamp(current + ({ PG: -14, SG: -10, SF: -2, PF: 6, C: 11 }[position]) + sizeBonus + (random() - 0.5) * 10, 25, 99)),
    history: [],
  };
  player.stats = buildStats(player, random);
  return player;
}

function createTeams() {
  let id = 1;
  const teams = [];
  const add = (data) => teams.push({ id: id++, wins: 0, losses: 0, rosterIds: [], rating: 70, history: [], ...data });

  NBA_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NBA', type: 'NBA', targetRoster: 10, tier: 1, secondaryCompetitions: [] }));
  G_LEAGUE_TEAMS.forEach((team) => add({ ...team, region: 'North America', competition: team.league, type: 'GLeague', targetRoster: 10, tier: 2, secondaryCompetitions: [] }));
  NCAA_PROGRAMS.forEach((team) => add({ ...team, region: 'North America', competition: 'NCAA Division I', type: 'NCAA', targetRoster: 5, tier: 1, secondaryCompetitions: [team.conference] }));
  EURO_TOP_CLUBS.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', targetRoster: 10, tier: 1, secondaryCompetitions: ['EuroLeague'] }));
  EURO_DOMESTIC.forEach((team) => add({ ...team, region: 'Europe', competition: team.league, type: 'Pro', targetRoster: 10, secondaryCompetitions: [] }));
  OTHER_PRO_TEAMS.forEach((team) => add({ ...team, region: REGION_BY_COUNTRY[team.country], competition: team.league, type: 'Pro', targetRoster: 10, tier: 1, secondaryCompetitions: [] }));
  return teams;
}

function recalculateTeamRatings(teams, players) {
  const byId = new Map(players.map((player) => [player.id, player]));
  return teams.map((team) => {
    const roster = team.rosterIds.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => b.current - a.current);
    const active = roster.slice(0, team.type === 'NCAA' ? 5 : 8);
    const rating = active.length ? round(active.reduce((sum, player) => sum + player.current, 0) / active.length, 1) : 50;
    return { ...team, rating };
  });
}

export function createUniverse(seed = 20260729) {
  const random = createRandom(seed);
  let teams = createTeams();
  const players = [];
  let playerId = 1;

  teams.forEach((team) => {
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position) => {
        const age = integer(18, 22, random);
        const player = createPlayer(team, position, age, random, playerId++, 2026 - (age - 18));
        players.push(player);
        team.rosterIds.push(player.id);
      });
      return;
    }
    for (let index = 0; index < team.targetRoster; index += 1) {
      const position = POSITIONS[index % POSITIONS.length];
      const maxAge = team.type === 'GLeague' ? 29 : 35;
      const age = integer(18, maxAge, random);
      const player = createPlayer(team, position, age, random, playerId++, 2026 - (age - 18));
      players.push(player);
      team.rosterIds.push(player.id);
    }
  });

  teams = recalculateTeamRatings(teams, players);
  return {
    seed,
    year: 2026,
    week: 1,
    phase: 'Regular season',
    yearReview: false,
    teams,
    players,
    retiredPlayers: [],
    transactions: [],
    draftHistory: [],
    spawnHistory: [],
    results: [],
    promotions: [],
    nextPlayerId: playerId,
  };
}

function playTeamWeek(team, random = Math.random) {
  const probability = clamp(0.50 + (team.rating - 76) * 0.016, 0.18, 0.82);
  const games = team.type === 'NCAA' ? (random() > 0.35 ? 1 : 2) : random() > 0.5 ? 2 : 3;
  let wins = team.wins;
  let losses = team.losses;
  for (let game = 0; game < games; game += 1) {
    if (random() < probability) wins += 1;
    else losses += 1;
  }
  return { ...team, wins, losses };
}

export function simulateWeeks(universe, numberOfWeeks) {
  if (universe.yearReview) return universe;
  let state = structuredClone(universe);
  const weeksToRun = Math.min(numberOfWeeks, 40 - state.week + 1);
  for (let index = 0; index < weeksToRun; index += 1) {
    state.teams = state.teams.map((team) => playTeamWeek(team));
    state.players = state.players.map((player) => ({
      ...player,
      stats: { ...player.stats, games: player.stats.games + (player.teamType === 'NCAA' ? 1 : 2) },
    }));
    const leaders = [...state.teams].sort((a, b) => b.rating - a.rating).slice(0, 2);
    state.results.unshift({
      year: state.year,
      week: state.week,
      headline: `${leaders[0].name} and ${leaders[1].name} headline the global form table`,
      detail: `Ratings ${leaders[0].rating} and ${leaders[1].rating}; the market is already tracking their leading players.`,
    });
    state.week += 1;
  }
  if (state.week > 40) {
    state.week = 40;
    state.phase = 'Year review';
    state.yearReview = true;
  }
  return state;
}

function transferPlayer(state, player, destination, type, detail) {
  const oldTeam = state.teams.find((team) => team.id === player.teamId);
  if (oldTeam) oldTeam.rosterIds = oldTeam.rosterIds.filter((id) => id !== player.id);
  destination.rosterIds.push(player.id);
  player.teamId = destination.id;
  player.teamName = destination.name;
  player.teamType = destination.type;
  player.competition = destination.competition;
  state.transactions.unshift({ year: state.year, type, player: player.name, headline: `${player.name} → ${destination.name}`, detail });
}

function releaseLowestPlayer(state, team) {
  if (team.rosterIds.length < team.targetRoster) return;
  const roster = team.rosterIds.map((id) => state.players.find((player) => player.id === id)).filter(Boolean).sort((a, b) => a.current - b.current);
  const released = roster[0];
  if (!released) return;
  const destinations = state.teams.filter((candidate) => candidate.type === 'GLeague');
  const destination = destinations.sort((a, b) => a.rosterIds.length - b.rosterIds.length)[0];
  transferPlayer(state, released, destination, 'NBA release', `${team.name} cleared a roster place before the draft.`);
}

function runDraft(state) {
  const eligible = state.players
    .filter((player) => player.teamType !== 'NBA' && player.age >= 19 && player.age <= 23)
    .map((player) => ({ player, score: player.current * 0.52 + player.base * 0.34 + player.potential * 0.14 - (player.age - 19) * 1.6 + Math.random() * 4 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 60);
  const nbaTeams = state.teams.filter((team) => team.type === 'NBA').sort((a, b) => (a.wins / Math.max(1, a.wins + a.losses)) - (b.wins / Math.max(1, b.wins + b.losses)));
  const picks = eligible.map(({ player }, index) => {
    const round = index < 30 ? 1 : 2;
    const team = nbaTeams[index % 30];
    releaseLowestPlayer(state, team);
    const origin = player.teamName;
    transferPlayer(state, player, team, 'NBA Draft', `Round ${round}, pick ${index + 1}. Selected from ${origin}.`);
    player.drafted = { year: state.year, pick: index + 1, round, team: team.name, origin };
    return { pick: index + 1, round, team: team.name, player: player.name, position: player.position, origin, rarity: player.rarity, base: player.base };
  });
  state.draftHistory.unshift({ year: state.year, picks });
}

function runPromotionRelegation(state) {
  const countries = ['Spain','Greece','Turkey','Italy','France','Germany','Serbia'];
  const movements = [];
  countries.forEach((country) => {
    const top = state.teams.filter((team) => team.country === country && team.tier === 1 && team.type === 'Pro' && !team.secondaryCompetitions.includes('EuroLeague'));
    const second = state.teams.filter((team) => team.country === country && team.tier === 2 && team.type === 'Pro');
    if (!top.length || !second.length) return;
    const relegated = [...top].sort((a, b) => (a.wins / Math.max(1, a.wins + a.losses)) - (b.wins / Math.max(1, b.wins + b.losses)))[0];
    const promoted = [...second].sort((a, b) => (b.wins / Math.max(1, b.wins + b.losses)) - (a.wins / Math.max(1, a.wins + a.losses)))[0];
    const topCompetition = relegated.competition;
    const secondCompetition = promoted.competition;
    relegated.tier = 2;
    relegated.competition = secondCompetition;
    promoted.tier = 1;
    promoted.competition = topCompetition;
    state.players.filter((player) => player.teamId === relegated.id).forEach((player) => { player.competition = relegated.competition; });
    state.players.filter((player) => player.teamId === promoted.id).forEach((player) => { player.competition = promoted.competition; });
    movements.push({ country, promoted: promoted.name, relegated: relegated.name, topCompetition });
  });
  state.promotions.unshift({ year: state.year, movements });
}

function ageAndRetire(state) {
  const retiringIds = new Set();
  state.players.forEach((player) => {
    player.age += 1;
    player.careerYear += 1;
    if (player.careerYear >= player.careerYears) {
      retiringIds.add(player.id);
      return;
    }
    player.annualShape = round(0.95 + Math.random() * 0.06, 3);
    player.current = Math.round(clamp(player.base * player.careerCurve[player.careerYear] * player.annualShape, 48, 99));
    player.stats = buildStats(player);
    player.history.push({ year: state.year, team: player.teamName, competition: player.competition, current: player.current });
  });
  if (!retiringIds.size) return;
  state.teams.forEach((team) => { team.rosterIds = team.rosterIds.filter((id) => !retiringIds.has(id)); });
  const retirees = state.players.filter((player) => retiringIds.has(player.id)).map((player) => ({ ...player, status: 'Retired', retiredYear: state.year }));
  state.retiredPlayers.unshift(...retirees);
  retirees.forEach((player) => state.transactions.unshift({ year: state.year, type: 'Retirement', player: player.name, headline: `${player.name} retires`, detail: `${player.rarity} ${player.position}; ${player.careerYears}-season career.` }));
  state.players = state.players.filter((player) => !retiringIds.has(player.id));
}

function moveOverageCollegePlayers(state) {
  const overage = state.players.filter((player) => player.teamType === 'NCAA' && player.age > 22);
  overage.forEach((player) => {
    const pool = state.teams.filter((team) => team.type === 'GLeague' || (team.type === 'Pro' && team.region === 'Europe'));
    const destination = [...pool].sort((a, b) => a.rosterIds.length - b.rosterIds.length)[0];
    transferPlayer(state, player, destination, 'NCAA exit', `${player.name} exhausted college eligibility and entered professional basketball.`);
  });
}

function fillRosters(state) {
  const spawns = [];
  state.teams.forEach((team) => {
    const rosterPlayers = () => team.rosterIds.map((id) => state.players.find((player) => player.id === id)).filter(Boolean);
    if (team.type === 'NCAA') {
      POSITIONS.forEach((position) => {
        const hasPosition = rosterPlayers().some((player) => player.position === position);
        if (!hasPosition) {
          const player = createPlayer(team, position, 18, Math.random, state.nextPlayerId++, state.year + 1);
          state.players.push(player);
          team.rosterIds.push(player.id);
          spawns.push({ player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: 'NCAA' });
        }
      });
      while (team.rosterIds.length > 5) {
        const roster = rosterPlayers().sort((a, b) => a.current - b.current);
        const extra = roster[0];
        const destination = state.teams.filter((candidate) => candidate.type === 'GLeague').sort((a, b) => a.rosterIds.length - b.rosterIds.length)[0];
        transferPlayer(state, extra, destination, 'College roster cut', `${team.name} keeps only one active player at each position.`);
      }
      return;
    }
    while (team.rosterIds.length < team.targetRoster) {
      const counts = Object.fromEntries(POSITIONS.map((position) => [position, rosterPlayers().filter((player) => player.position === position).length]));
      const position = [...POSITIONS].sort((a, b) => counts[a] - counts[b])[0];
      const player = createPlayer(team, position, 18, Math.random, state.nextPlayerId++, state.year + 1);
      state.players.push(player);
      team.rosterIds.push(player.id);
      spawns.push({ player: player.name, team: team.name, position, nationality: player.nationality, rarity: player.rarity, route: team.type === 'GLeague' ? 'G League' : 'Club academy' });
    }
    while (team.rosterIds.length > team.targetRoster) {
      const roster = rosterPlayers().sort((a, b) => a.current - b.current);
      const extra = roster[0];
      if (!extra) break;
      if (team.type === 'NBA') {
        const destination = state.teams.filter((candidate) => candidate.type === 'GLeague').sort((a, b) => a.rosterIds.length - b.rosterIds.length)[0];
        transferPlayer(state, extra, destination, 'Roster cut', `${team.name} reduced its roster to 10 players.`);
      } else {
        team.rosterIds = team.rosterIds.filter((id) => id !== extra.id);
        extra.status = 'Free agent';
        extra.teamId = null;
        extra.teamName = 'Free agent';
        extra.teamType = 'FreeAgent';
        extra.competition = 'Free Agents';
      }
    }
  });
  state.spawnHistory.unshift({ year: state.year + 1, players: spawns });
}

export function advanceToNextYear(universe) {
  if (!universe.yearReview) return universe;
  const state = structuredClone(universe);
  runDraft(state);
  runPromotionRelegation(state);
  ageAndRetire(state);
  moveOverageCollegePlayers(state);
  fillRosters(state);
  state.teams = recalculateTeamRatings(state.teams, state.players).map((team) => ({ ...team, wins: 0, losses: 0 }));
  state.year += 1;
  state.week = 1;
  state.phase = 'Regular season';
  state.yearReview = false;
  return state;
}

export const POSITION_ORDER = POSITIONS;
