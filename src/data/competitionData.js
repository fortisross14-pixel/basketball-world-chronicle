import { DETAILED_COUNTRY_SPECS, SUMMARY_COUNTRY_SPECS } from './worldData.js';

const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const league = (name, region, country, level = 1, detail = 'detailed') => ({ id: slug(name), name, region, country, kind: 'league', level, detail });
const cup = (name, region, country, detail = 'detailed') => ({ id: slug(name), name, region, country, kind: 'cup', level: 1, detail });
const supercup = (name, region, country, detail = 'detailed') => ({ id: slug(name), name, region, country, kind: 'supercup', level: 1, detail });
const international = (name, region, countries, startYear, frequency, level = 9, fieldSize = 16) => ({
  id: slug(name), name, region, country: region === 'World' ? 'International' : region,
  countries, kind: 'international', level, detail: 'detailed', startYear, frequency, fieldSize, featured: true,
});

export const CORE_COMPETITIONS = [
  { id: 'nba', name: 'NBA', region: 'North America', country: 'USA / Canada', kind: 'league', level: 10, detail: 'detailed', featured: true },
  { id: 'nba-g-league', name: 'NBA G League', region: 'North America', country: 'USA', kind: 'league', level: 5, detail: 'detailed' },
  { id: 'ncaa-division-i', name: 'NCAA Division I', region: 'North America', country: 'USA', kind: 'league', level: 3, detail: 'detailed' },
  { id: 'ncaa-tournament', name: 'NCAA Tournament', region: 'North America', country: 'USA', kind: 'tournament', level: 4, detail: 'detailed', source: 'NCAA Division I', featured: true },
  { id: 'euroleague', name: 'EuroLeague', region: 'Europe', country: 'Europe', kind: 'continental', level: 9, detail: 'detailed', featured: true },
  { id: 'eurocup', name: 'EuroCup', region: 'Europe', country: 'Europe', kind: 'continental', level: 7, detail: 'detailed', featured: true },
  { id: 'adriatic-league', name: 'Adriatic League', region: 'Europe', country: 'Balkans', kind: 'continental', level: 7, detail: 'detailed', featured: true },
];

export const INTERNATIONAL_COMPETITIONS = [
  international('Olympic Basketball Tournament', 'World', null, 2028, 4, 10, 12),
  international('FIBA World Cup', 'World', null, 2027, 4, 10, 32),
  international('EuroBasket', 'Europe', ['Europe'], 2026, 4, 9, 24),
  international('FIBA AmeriCup', 'Americas', ['North America', 'South America'], 2026, 4, 7, 12),
  international('FIBA Asia Cup', 'Asia', ['Asia', 'Oceania'], 2026, 4, 7, 16),
  international('AfroBasket', 'Africa', ['Africa'], 2026, 4, 7, 16),
];

export const DETAILED_COUNTRY_COMPETITIONS = DETAILED_COUNTRY_SPECS.flatMap(([country, region, leagueName, cupName, supercupName, tier2]) => [
  league(leagueName, region, country, 1, 'detailed'),
  cupName ? cup(cupName, region, country, 'detailed') : null,
  supercupName ? supercup(supercupName, region, country, 'detailed') : null,
  tier2 ? league(tier2, region, country, 2, 'detailed') : null,
].filter(Boolean));

export const HIGH_LEVEL_COMPETITIONS = SUMMARY_COUNTRY_SPECS.map(([country, region, leagueName]) => league(leagueName, region, country, 1, 'high-level'));

const all = [...CORE_COMPETITIONS, ...INTERNATIONAL_COMPETITIONS, ...DETAILED_COUNTRY_COMPETITIONS, ...HIGH_LEVEL_COMPETITIONS];
const deduped = new Map();
all.forEach((competition) => { if (!deduped.has(competition.id)) deduped.set(competition.id, competition); });
export const COMPETITIONS = [...deduped.values()];
export const COMPETITION_BY_NAME = new Map(COMPETITIONS.map((competition) => [competition.name, competition]));
export const COMPETITION_BY_ID = new Map(COMPETITIONS.map((competition) => [competition.id, competition]));
export const competitionId = (name) => COMPETITION_BY_NAME.get(name)?.id ?? slug(name);
export const isCompetitionActive = (competition, year) => !competition.frequency || (year >= competition.startYear && (year - competition.startYear) % competition.frequency === 0);
