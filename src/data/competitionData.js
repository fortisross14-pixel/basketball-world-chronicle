const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const league = (name, region, country, level = 1, detail = 'detailed') => ({
  id: slug(name), name, region, country, kind: 'league', level, detail,
});
const cup = (name, region, country, detail = 'detailed') => ({
  id: slug(name), name, region, country, kind: 'cup', level: 1, detail,
});
const supercup = (name, region, country, detail = 'detailed') => ({
  id: slug(name), name, region, country, kind: 'supercup', level: 1, detail,
});
const international = (name, region, countries, startYear, frequency, level = 9) => ({
  id: slug(name), name, region, country: region === 'World' ? 'International' : region,
  countries, kind: 'international', level, detail: 'detailed', startYear, frequency,
});

export const CORE_COMPETITIONS = [
  { id: 'nba', name: 'NBA', region: 'North America', country: 'USA / Canada', kind: 'league', level: 10, detail: 'detailed', featured: true },
  { id: 'nba-g-league', name: 'NBA G League', region: 'North America', country: 'USA', kind: 'league', level: 5, detail: 'detailed' },
  { id: 'ncaa-division-i', name: 'NCAA Division I', region: 'North America', country: 'USA', kind: 'league', level: 3, detail: 'detailed' },
  { id: 'ncaa-tournament', name: 'NCAA Tournament', region: 'North America', country: 'USA', kind: 'tournament', level: 4, detail: 'detailed', source: 'NCAA Division I', featured: true },
  { id: 'euroleague', name: 'EuroLeague', region: 'Europe', country: 'Europe', kind: 'continental', level: 9, detail: 'detailed', featured: true },
  { id: 'eurocup', name: 'EuroCup', region: 'Europe', country: 'Europe', kind: 'continental', level: 7, detail: 'detailed', featured: true },
];

export const INTERNATIONAL_COMPETITIONS = [
  international('Olympic Basketball Tournament', 'World', null, 2028, 4, 10),
  international('FIBA World Cup', 'World', null, 2027, 4, 10),
  international('EuroBasket', 'Europe', ['Europe'], 2026, 4, 9),
  international('FIBA AmeriCup', 'Americas', ['North America', 'South America'], 2026, 4, 7),
  international('FIBA Asia Cup', 'Asia', ['Asia', 'Oceania'], 2026, 4, 7),
  international('AfroBasket', 'Africa', ['Africa'], 2026, 4, 7),
];

export const DETAILED_COUNTRY_COMPETITIONS = [
  league('Liga ACB', 'Europe', 'Spain'), cup('Copa del Rey', 'Europe', 'Spain'), supercup('Supercopa Endesa', 'Europe', 'Spain'), league('Primera FEB', 'Europe', 'Spain', 2),
  league('Greek League', 'Europe', 'Greece'), cup('Greek Cup', 'Europe', 'Greece'), supercup('Greek Super Cup', 'Europe', 'Greece'), league('Greek A2', 'Europe', 'Greece', 2),
  league('Turkish BSL', 'Europe', 'Turkey'), cup('Turkish Cup', 'Europe', 'Turkey'), supercup('Turkish Presidents Cup', 'Europe', 'Turkey'), league('Turkish TBL', 'Europe', 'Turkey', 2),
  league('Lega Basket Serie A', 'Europe', 'Italy'), cup('Italian Cup', 'Europe', 'Italy'), supercup('Italian Super Cup', 'Europe', 'Italy'), league('Serie A2', 'Europe', 'Italy', 2),
  league('LNB Pro A', 'Europe', 'France'), cup('French Cup', 'Europe', 'France'), supercup('French Champions Match', 'Europe', 'France'), league('Pro B', 'Europe', 'France', 2),
  league('Basketball Bundesliga', 'Europe', 'Germany'), cup('German Cup', 'Europe', 'Germany'), supercup('German Champions Cup', 'Europe', 'Germany'), league('ProA Germany', 'Europe', 'Germany', 2),
  league('Adriatic League', 'Europe', 'Serbia / Balkans'), cup('Serbian Cup', 'Europe', 'Serbia'), supercup('Serbian Super Cup', 'Europe', 'Serbia'), league('KLS Serbia', 'Europe', 'Serbia', 2),
  league('Lithuanian LKL', 'Europe', 'Lithuania'), cup('King Mindaugas Cup', 'Europe', 'Lithuania'), supercup('Lithuanian Super Cup', 'Europe', 'Lithuania'), league('NKL Lithuania', 'Europe', 'Lithuania', 2),
  league('Israeli Premier League', 'Europe', 'Israel'), cup('Israeli State Cup', 'Europe', 'Israel'), supercup('Israeli Winner Cup', 'Europe', 'Israel'), league('Israeli National League', 'Europe', 'Israel', 2),
  league('VTB United League', 'Europe', 'Russia'), cup('Russian Cup', 'Europe', 'Russia'), supercup('VTB Super Cup', 'Europe', 'Russia'), league('Russian Superleague', 'Europe', 'Russia', 2),
  league('Liga Nacional', 'South America', 'Argentina'), cup('Copa Super 20', 'South America', 'Argentina'), supercup('Supercopa Argentina', 'South America', 'Argentina'),
  league('NBB Brazil', 'South America', 'Brazil'), cup('Copa Super 8', 'South America', 'Brazil'), supercup('Supercopa Brazil', 'South America', 'Brazil'),
  league('NBL Australia', 'Oceania', 'Australia'), cup('NBL Cup', 'Oceania', 'Australia'), supercup('NBL Champions Game', 'Oceania', 'Australia'),
  league('CEBL Canada', 'North America', 'Canada'), cup('CEBL Championship Weekend', 'North America', 'Canada'),
  league('CBA', 'Asia', 'China'), cup('CBA Cup', 'Asia', 'China'), supercup('CBA Super Cup', 'Asia', 'China'),
];

export const HIGH_LEVEL_COMPETITIONS = [
  league('B.League', 'Asia', 'Japan', 1, 'high-level'),
  league('Korean KBL', 'Asia', 'South Korea', 1, 'high-level'),
  league('Philippine PBA', 'Asia', 'Philippines', 1, 'high-level'),
  league('Croatian League', 'Europe', 'Croatia', 1, 'high-level'),
  league('Slovenian League', 'Europe', 'Slovenia', 1, 'high-level'),
  league('Polish League', 'Europe', 'Poland', 1, 'high-level'),
  league('Belgian-Dutch League', 'Europe', 'Belgium / Netherlands', 1, 'high-level'),
  league('African Basketball League', 'Africa', 'Africa', 1, 'high-level'),
];

export const COMPETITIONS = [...CORE_COMPETITIONS, ...INTERNATIONAL_COMPETITIONS, ...DETAILED_COUNTRY_COMPETITIONS, ...HIGH_LEVEL_COMPETITIONS];
export const COMPETITION_BY_NAME = new Map(COMPETITIONS.map((competition) => [competition.name, competition]));
export const COMPETITION_BY_ID = new Map(COMPETITIONS.map((competition) => [competition.id, competition]));
export const competitionId = (name) => COMPETITION_BY_NAME.get(name)?.id ?? slug(name);
export const isCompetitionActive = (competition, year) => !competition.frequency || (year >= competition.startYear && (year - competition.startYear) % competition.frequency === 0);
