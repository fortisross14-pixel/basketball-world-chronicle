import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceOffseasonStage,
  advanceShowcaseGame,
  checkpointShowcaseGame,
  configureSeasonPresentation,
  startOffseason,
  OFFSEASON_STAGES,
  competitionRankings,
  COMPETITIONS,
  createUniverse,
  DEFAULT_PRESENTATION_CONFIG,
  getCompetition,
  getCompetitionParticipants,
  POSITION_ORDER,
  recalculateTeamRatings,
  repairMarketBalance,
  skipCurrentShowcaseGame,
  simulateWeeks,
} from './game/universe.js';
import { ARC_DEFINITIONS, careerArcs, careerRecordBoards, careerStints, tagUniverseCareers, teamIndex } from './game/careerArcs.js';
import { deleteSaveSlot, listSaveSlots, loadSaveSlot, writeSaveSlot } from './game/saveDb.js';
import { isCompetitionActive } from './data/competitionData.js';
import { DETAILED_COUNTRY_SPECS, SUMMARY_COUNTRY_SPECS } from './data/worldData.js';
import { TeamBadge, PlayerPortrait, CoachPortrait, CompetitionEmblem, RatingPill, Grade, StrengthBars, gradeFor, meterPercent, teamColorPair } from './components/VisualIdentity.jsx';
import { Icon, STORY_ICONS, ARC_ICONS } from './components/Icons.jsx';

const NAV = ['Atlas','Tonight','Stories','Records','People','Market'];
const NAV_GROUPS = {
  Atlas: ['World','Tournaments','Teams'],
  Tonight: ['Live Game'],
  Stories: ['The Global Five','Careers','Results'],
  Records: ['Almanac','Statistics'],
  People: ['Players','Coaches'],
  Market: ['Market'],
};
const NAV_LABELS = { Atlas:'World', Tonight:'Live', Stories:'Stories', Records:'Records', People:'People', Market:'Market' };
const NAV_ICONS = { Atlas:'atlas', Tonight:'live', Stories:'stories', Records:'records', People:'people', Market:'market' };
const SUBNAV_LABELS = { World:'Overview', 'The Global Five':'Story desk', Results:'Award races', Almanac:'Almanac', Statistics:'Stat leaders' };
const NAV_DEFAULTS = {Atlas:'World',Tonight:'Live Game',Stories:'The Global Five',Records:'Almanac',People:'Players',Market:'Market'};
function activeNavigationGroup(view) {
  if (view === 'Live Game') return 'Tonight';
  if (view === 'Market') return 'Market';
  if (['Players','Coaches'].includes(view)) return 'People';
  if (view === 'Statistics' || view === 'Almanac') return 'Records';
  if (['Results','The Global Five','Careers'].includes(view)) return 'Stories';
  return 'Atlas';
}
const RARITY_ORDER = ['Generational','Legend','Epic','Rare','Uncommon','Common'];
const unique = (items) => [...new Set(items)].filter((item) => item !== null && item !== undefined && item !== '').sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
const pct = (value) => `${Math.round(value * 100)}%`;
const formatNumber = (value) => Math.round(value ?? 0).toLocaleString();

const COUNTRY_CODES = {
  USA: 'US', Canada: 'CA', Spain: 'ES', Greece: 'GR', Turkey: 'TR', Italy: 'IT', France: 'FR', Germany: 'DE',
  Lithuania: 'LT', Israel: 'IL', Russia: 'RU', Serbia: 'RS', Slovenia: 'SI', Montenegro: 'ME', Croatia: 'HR',
  Poland: 'PL', Belgium: 'BE', Netherlands: 'NL', UAE: 'AE', Japan: 'JP', China: 'CN', 'South Korea': 'KR',
  Philippines: 'PH', Australia: 'AU', 'New Zealand': 'NZ', Argentina: 'AR', Brazil: 'BR', Nigeria: 'NG',
  Senegal: 'SN', Angola: 'AO', Tunisia: 'TN', Egypt: 'EG', Georgia: 'GE', Latvia: 'LV', Finland: 'FI',
  Sweden: 'SE', Denmark: 'DK', Norway: 'NO', Iceland: 'IS', Portugal: 'PT', Czechia: 'CZ', 'Czech Republic': 'CZ',
  Hungary: 'HU', Romania: 'RO', Bulgaria: 'BG', Switzerland: 'CH', Austria: 'AT', Ukraine: 'UA', Mexico: 'MX', 'Puerto Rico': 'PR', Bahamas: 'BS',
  Cameroon: 'CM', Mali: 'ML', 'Ivory Coast': 'CI', Lebanon: 'LB', Iran: 'IR', Jordan: 'JO', India: 'IN',
  Panama: 'PA', 'Dominican Republic': 'DO', Venezuela: 'VE', Uruguay: 'UY', Colombia: 'CO', 'Bosnia and Herzegovina': 'BA',
  'South Sudan': 'SS', 'DR Congo': 'CD', 'Cape Verde': 'CV', Uganda: 'UG', Rwanda: 'RW', Kenya: 'KE', Guinea: 'GN', Mozambique: 'MZ',
  'Saudi Arabia': 'SA', Qatar: 'QA', Bahrain: 'BH', Kazakhstan: 'KZ', 'Chinese Taipei': 'TW', Indonesia: 'ID',
};
const REGION_FLAGS = { Europe: '🇪🇺', Americas: '🌎', Balkans: '🇪🇺', 'North America': '🌎', 'South America': '🌎', Asia: '🌏', Oceania: '🌏', Africa: '🌍', World: '🌐', International: '🌐' };
function isoFlag(code) { return code ? [...code.toUpperCase()].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') : ''; }
function flagText(value) {
  if (!value) return '';
  if (REGION_FLAGS[value]) return REGION_FLAGS[value];
  const parts = String(value).split(/\s*\/\s*|\s*·\s*/).filter(Boolean);
  const flags = parts.map((part) => REGION_FLAGS[part] ?? isoFlag(COUNTRY_CODES[part])).filter(Boolean);
  return flags.length ? flags.join(' ') : '🏳️';
}
function Flag({ value, title = value }) {
  const parts = String(value || '').split(/\s*\/\s*|\s*·\s*/).filter(Boolean);
  const codes = parts.map((part) => COUNTRY_CODES[part]).filter(Boolean);
  const prefix = import.meta.env.BASE_URL || '/';
  if (!codes.length) return <span className="flag flag-region" role="img" aria-label={title || 'region'} title={title}>{flagText(value)}</span>;
  return <span className="flag flag-images" role="img" aria-label={title || value} title={title}>
    {codes.map((code, index) => <img key={`${code}-${index}`} src={`${prefix}assets/flags/${code.toLowerCase()}.png`} alt="" width="24" height="18" loading="lazy" />)}
  </span>;
}

function TeamMark({ team, size = 38, className = '' }) { return <TeamBadge team={team} size={size} className={className}/>; }
function Rarity({ value }) { return <span className={`rarity rarity-${String(value).toLowerCase()}`}>{value}</span>; }
function LinkButton({ children, onClick }) { return <button className="inline-link" onClick={(event) => { event.stopPropagation(); onClick(); }}>{children}</button>; }

function competitionPlayerPool(universe, competition) {
  const participants = getCompetitionParticipants(universe, competition.id);
  if (competition.kind === 'international') {
    const ids = new Set(participants.flatMap((team) => team.rosterIds));
    return universe.players.filter((player) => ids.has(player.id));
  }
  const teamIds = new Set(participants.map((team) => team.id));
  return universe.players.filter((player) => teamIds.has(player.teamId));
}
function currentLeaders(universe, competition) {
  const players = competitionPlayerPool(universe, competition);
  const top = (key) => [...players].sort((a, b) => b.stats[key] - a.stats[key] || b.current - a.current)[0];
  const participants = getCompetitionParticipants(universe, competition.id);
  const teamById = new Map(participants.map((team) => [team.id, team]));
  const projectedMvp = [...players].sort((a, b) => {
    const aTeam = competition.kind === 'international' ? participants.find((team) => team.rosterIds.includes(a.id)) : teamById.get(a.teamId);
    const bTeam = competition.kind === 'international' ? participants.find((team) => team.rosterIds.includes(b.id)) : teamById.get(b.teamId);
    const aRecord = aTeam?.seasonRecords?.[competition.id] ?? { wins: 0, losses: 0 };
    const bRecord = bTeam?.seasonRecords?.[competition.id] ?? { wins: 0, losses: 0 };
    const score = (player, record) => player.stats.ppg * 1.1 + player.stats.rpg * .55 + player.stats.apg * .8 + player.stats.spg * 1.2 + player.stats.bpg * 1.2 + record.wins / Math.max(1, record.wins + record.losses) * 5;
    return score(b, bRecord) - score(a, aRecord);
  })[0];
  return { mvp: projectedMvp, points: top('ppg'), rebounds: top('rpg'), assists: top('apg') };
}
function competitionInRegion(competition, region) {
  if (region === 'All') return true;
  if (region === 'World') return competition.region === 'World';
  if (competition.region === 'Americas' && ['Americas','North America','South America'].includes(region)) return true;
  return competition.region === region || competition.countries?.includes(region);
}
function competitionResultLocked(universe, competitionId) {
  if (!universe.showcase?.active) return false;
  return (universe.showcase.games ?? []).some((game) => game.competitionId === competitionId && (game.completedTicks ?? 0) < (game.timeline?.length ?? 0));
}
function latestVisibleSeason(universe, competitionId) {
  const rows = universe.competitionHistory?.[competitionId] ?? [];
  if (!competitionResultLocked(universe, competitionId)) return rows[0] ?? null;
  return rows.find((row) => Number(row.year) < Number(universe.year)) ?? null;
}

const MAJOR_COMPETITION_IDS = ['nba','euroleague','americas-champions-league','ncaa-tournament','olympic-basketball-tournament','fiba-world-cup','eurobasket','fiba-americup','afrobasket','fiba-asia-cup'];
const MAJOR_COMPETITION_SET = new Set(MAJOR_COMPETITION_IDS);
function allUniversePlayers(universe) { return [...(universe.players??[]), ...(universe.retiredPlayers??[])]; }
function majorSeasonRows(universe, year) {
  return MAJOR_COMPETITION_IDS.map((id)=>({ competition:getCompetition(id), season:(universe.competitionHistory?.[id]??[]).find((row)=>Number(row.year)===Number(year)) })).filter((row)=>row.competition&&row.season&&!(Number(year)===Number(universe.year)&&competitionResultLocked(universe,row.competition.id)));
}
function playerAgeInYear(player, year, universeYear) {
  const season=(player.history??[]).find((row)=>Number(row.year)===Number(year));
  return season?.age ?? Math.max(18, Number(player.age??25)-(Number(universeYear)-Number(year)));
}
function buildChronicleStories(universe, year) {
  const stories=[]; const players=allUniversePlayers(universe); const playerById=new Map(players.map((p)=>[p.id,p]));
  const push=(story)=>{ if(!stories.some((item)=>item.key===story.key)) stories.push(story); };
  majorSeasonRows(universe,year).forEach(({competition,season})=>{
    const history=(universe.competitionHistory?.[competition.id]??[]).filter((row)=>Number(row.year)<=Number(year)).sort((a,b)=>Number(b.year)-Number(a.year));
    const streak=(()=>{let count=0;for(const row of history){if(row.championTeamId===season.championTeamId)count+=1;else break;}return count;})();
    const previous=history.filter((row)=>Number(row.year)<Number(year));
    const priorTitles=previous.filter((row)=>row.championTeamId===season.championTeamId).length;
    if(streak>=2) push({key:`dynasty-${competition.id}-${season.championTeamId}-${year}`,score:100+streak*5,icon:'♛',category:'Dynasty',title:`${season.champion} makes it ${streak} straight`,body:`A sustained run at the top of ${competition.name}. This is no longer a one-season peak.` ,teamId:season.championTeamId});
    else if(priorTitles===0) push({key:`first-${competition.id}-${season.championTeamId}-${year}`,score:78,icon:'🏆',category:'Breakthrough',title:`${season.champion} breaks through in ${competition.name}`,body:`The club records its first championship of the simulated era in ${year}.`,teamId:season.championTeamId});
    const champStanding=(season.standings??[]).find((row)=>row.teamId===season.championTeamId); const bestRating=Math.max(...(season.standings??[]).map((row)=>Number(row.rating)||0),0);
    if(champStanding && bestRating-Number(champStanding.rating)>=5.5) push({key:`upset-${competition.id}-${year}`,score:91,icon:'⚡',category:'Shock',title:`A genuine ${competition.name} upset`,body:`${season.champion} won from ${champStanding.rating} team strength despite the field reaching ${bestRating}.`,teamId:season.championTeamId});
    const mvp=playerById.get(season.mvp?.id); if(mvp){const age=playerAgeInYear(mvp,year,universe.year);if(['Generational','Legend'].includes(mvp.rarity)&&age<=22)push({key:`young-mvp-${competition.id}-${mvp.id}-${year}`,score:96,icon:'✦',category:'Arrival',title:`${mvp.name} announces himself at ${age}`,body:`The ${mvp.rarity.toLowerCase()} talent wins ${competition.name} MVP before reaching his prime.`,playerId:mvp.id}); if(age>=34)push({key:`old-mvp-${competition.id}-${mvp.id}-${year}`,score:88,icon:'⌛',category:'Vintage',title:`${mvp.name} turns back the clock`,body:`At ${age}, he is still good enough to win ${competition.name} MVP.`,playerId:mvp.id}); if(competition.id==='euroleague'&&mvp.draft&&mvp.teamType!=='NBA')push({key:`euro-revival-${mvp.id}-${year}`,score:92,icon:'↗',category:'Career turn',title:`${mvp.name} owns Europe`,body:`An NBA-drafted player becomes EuroLeague MVP outside the NBA — exactly the kind of alternate career this universe can create.`,playerId:mvp.id});}
  });
  const legacy=(universe.legacyHistory??[]).find((row)=>Number(row.year)===Number(year));
  (legacy?.nbaInductions??[]).forEach((entry)=>push({key:`nba-hof-${entry.playerId}-${year}`,score:98,icon:'★',category:'Legacy',title:`${entry.player} enters the NBA Hall of Fame`,body:`A completed career earns basketball immortality with a legacy score of ${entry.score}.`,playerId:entry.playerId}));
  (legacy?.fibaInductions??[]).forEach((entry)=>push({key:`fiba-hof-${entry.playerId}-${year}`,score:96,icon:'🌍',category:'Legacy',title:`${entry.player} enters the FIBA Hall of Fame`,body:`Club and international achievements combine into a Hall of Fame career.`,playerId:entry.playerId}));
  (legacy?.jerseyRetirements??[]).forEach((entry)=>push({key:`jersey-${entry.teamId}-${entry.playerId}-${year}`,score:93,icon:'🎽',category:'Franchise icon',title:`${entry.team} retires #${entry.number}`,body:`${entry.player}'s number leaves circulation after an extraordinary team-specific career.`,playerId:entry.playerId,teamId:entry.teamId}));
  (universe.retirements??[]).filter((row)=>Number(row.year)===Number(year)).forEach((row)=>{const p=playerById.get(row.playerId);if(p&&(['Generational','Legend'].includes(p.rarity)||(p.honors?.length??0)>=10))push({key:`retire-${p.id}-${year}`,score:86,icon:'👋',category:'Farewell',title:`${p.name} closes his career`,body:`${p.rarity} · ${(p.history??[]).length} recorded seasons · ${(p.honors??[]).length} honors.`,playerId:p.id});});
  const summer=(universe.offseasonHistory??[]).find((row)=>Number(row.year)===Number(year)+1);
  if(summer){const riser=[...(summer.teams??[])].sort((a,b)=>b.delta-a.delta)[0];if(riser?.delta>=4)push({key:`summer-${riser.teamId}-${year}`,score:80,icon:'📈',category:'Power shift',title:`${riser.team} transforms its roster`,body:`A ${riser.delta>=0?'+':''}${riser.delta} offseason jump (${riser.before} → ${riser.after}) changes the competitive picture.`,teamId:riser.teamId});}
  if(stories.length<3){majorSeasonRows(universe,year).slice(0,3).forEach(({competition,season})=>push({key:`champ-${competition.id}-${year}`,score:60,icon:'🏆',category:'Champion',title:`${season.champion} wins ${competition.name}`,body:`${season.runnerUp} finishes runner-up. ${season.mvp?.name??'—'} is named MVP.`,teamId:season.championTeamId,playerId:season.mvp?.id}));}
  return stories.sort((a,b)=>b.score-a.score).slice(0,8);
}
function teamEraStatus(universe, team) {
  const recent=[...(team.history??[])].sort((a,b)=>Number(b.year)-Number(a.year)).slice(0,4); const majorTitles=recent.flatMap((row)=>row.titles??[]).filter((title)=>/NBA|EuroLeague|NCAA|Olympic|World Cup/i.test(title)).length;
  const {peers}=teamStrengthContext(universe,team); const sorted=[...peers].sort((a,b)=>b.rating-a.rating); const rank=Math.max(0,sorted.findIndex((item)=>item.id===team.id)); const pctRank=rank/Math.max(1,sorted.length-1);
  if(majorTitles>=2) return {label:'Dynasty',tone:'dynasty'}; if(recent[0]?.titles?.length) return {label:'Champion',tone:'champion'}; if(pctRank<=.18) return {label:'Contender',tone:'contender'}; if(pctRank>=.72) return {label:'Rebuilding',tone:'rebuild'}; return {label:'Competitive',tone:'competitive'};
}
function startingFiveFor(team, universe) { return POSITION_ORDER.map((position)=>team.rosterIds.map((id)=>universe.players.find((p)=>p.id===id)).filter((p)=>p?.position===position).sort((a,b)=>b.current-a.current)[0]).filter(Boolean); }
function playerCareerStage(player) { if(['Retired','Left professional basketball'].includes(player.status))return 'Retired'; if(player.age<=21)return 'Prospect'; if(player.age<=24)return 'Rising'; if(player.age<=31)return 'Prime'; if(player.age<=35)return 'Veteran'; return 'Late career'; }
function careerVerdict(player) { const honors=player.honors??[]; const titles=honors.filter((h)=>h.category==='team'||h.type==='Team title').length; const mvps=honors.filter((h)=>/MVP/i.test(h.type??'')).length; const bestFive=honors.filter((h)=>/^Best /.test(h.type??'')).length; if(player.rarity==='Generational'&&mvps>=2)return `Era-defining superstar · ${titles} titles · ${mvps} MVP-level awards`; if(mvps>=2&&titles>=1)return `Championship centerpiece · ${titles} titles · ${mvps} MVP-level awards`; if(bestFive>=4)return `Long-term elite performer · ${bestFive} Best Five selections`; if(honors.length>=8)return `Accomplished star · ${honors.length} recorded honors`; return `${(player.history??[]).length} recorded seasons · ${honors.length} honors`; }
function dynastyRows(universe, competitionId) {
  const seasons=[...(universe.competitionHistory?.[competitionId]??[])].sort((a,b)=>Number(a.year)-Number(b.year)); const totals=new Map(); const runs=[]; let current=null;
  seasons.forEach((season)=>{totals.set(season.championTeamId,(totals.get(season.championTeamId)??0)+1); if(current?.teamId===season.championTeamId){current.end=season.year;current.streak+=1;}else{current={teamId:season.championTeamId,team:season.champion,start:season.year,end:season.year,streak:1};runs.push(current);}});
  return runs.map((run)=>({...run,totalTitles:totals.get(run.teamId)??run.streak})).sort((a,b)=>b.streak-a.streak||b.totalTitles-a.totalTitles||Number(b.end)-Number(a.end)).slice(0,12);
}
function careerStatLeaders(universe,key) {
  return allUniversePlayers(universe).map((player)=>{let value=0,games=0;(player.history??[]).forEach((row)=>{const gp=Number(row.games)||0;games+=gp;value+=(Number(row[key])||0)*gp;});return{playerId:player.id,player:player.name,rarity:player.rarity,games,value:Math.round(value)};}).filter((row)=>row.games>0).sort((a,b)=>b.value-a.value).slice(0,10);
}

function rivalryRows(universe) {
  const map=new Map(); MAJOR_COMPETITION_IDS.forEach((competitionId)=>{(universe.competitionHistory?.[competitionId]??[]).forEach((season)=>{(season.bracket??[]).forEach((round)=>{(round.matches??[]).forEach((match)=>{if(!match.teamAId||!match.teamBId)return;const ids=[match.teamAId,match.teamBId].sort((a,b)=>String(a).localeCompare(String(b)));const key=ids.join('|');let row=map.get(key);if(!row){const a=universe.teams.find((t)=>t.id===ids[0]),b=universe.teams.find((t)=>t.id===ids[1]);row={key,teamAId:ids[0],teamBId:ids[1],teamA:a?.name??match.teamA,teamB:b?.name??match.teamB,meetings:0,winsA:0,winsB:0,majorRounds:0,lastYear:season.year,competitions:new Set()};map.set(key,row);}row.meetings+=1;row.lastYear=Math.max(Number(row.lastYear),Number(season.year));row.competitions.add(getCompetition(competitionId)?.name??competitionId);if(match.winnerId===row.teamAId)row.winsA+=1;else if(match.winnerId===row.teamBId)row.winsB+=1;if(/Final|Conference|Semifinal|Final Four/i.test(round.name))row.majorRounds+=1;});});});});
  return [...map.values()].filter((r)=>r.meetings>=2).map((r)=>({...r,competitions:[...r.competitions],score:r.meetings*4+r.majorRounds*3-Math.abs(r.winsA-r.winsB)})).sort((a,b)=>b.score-a.score||b.lastYear-a.lastYear).slice(0,12);
}
function internationalLegacyRows(universe) {
  const ids=['olympic-basketball-tournament','fiba-world-cup','eurobasket','fiba-americup','fiba-asia-cup','afrobasket']; const map=new Map();
  ids.forEach((id)=>{const weight=['olympic-basketball-tournament','fiba-world-cup'].includes(id)?3:1;(universe.competitionHistory?.[id]??[]).forEach((season)=>{const key=season.championTeamId??season.champion;const row=map.get(key)??{teamId:season.championTeamId,team:season.champion,major:0,regional:0,score:0,lastYear:season.year};if(weight===3)row.major+=1;else row.regional+=1;row.score+=weight;row.lastYear=Math.max(Number(row.lastYear),Number(season.year));map.set(key,row);});});
  return [...map.values()].sort((a,b)=>b.score-a.score||b.major-a.major||b.lastYear-a.lastYear).slice(0,12);
}
function singleSeasonLeaders(universe,key) {
  const rows=[]; allUniversePlayers(universe).forEach((player)=>(player.history??[]).forEach((season)=>{if(Number.isFinite(Number(season[key])))rows.push({playerId:player.id,player:player.name,rarity:player.rarity,year:season.year,team:season.team,value:Number(season[key])});})); return rows.sort((a,b)=>b.value-a.value).slice(0,10);
}
function franchiseFiveFor(team,universe) {
  const players=allUniversePlayers(universe); return POSITION_ORDER.map((position)=>players.filter((p)=>p.position===position&&(p.history??[]).some((h)=>h.teamId===team.id)).map((p)=>{const seasons=(p.history??[]).filter((h)=>h.teamId===team.id);const teamHonors=(p.honors??[]).filter((h)=>h.teamId===team.id).length;const best=Math.max(...seasons.map((h)=>Number(h.current)||0),0);return{player:p,score:best+seasons.length*1.5+teamHonors*2.2,seasons:seasons.length};}).sort((a,b)=>b.score-a.score)[0]).filter(Boolean);
}

const NAV_ROUTES = { World:'world', 'Live Game':'game', Results:'results', Tournaments:'tournaments', Teams:'teams', Players:'players', Coaches:'coaches', Market:'market/summary', Statistics:'statistics', 'The Global Five':'magazine', Careers:'careers', Almanac:'almanac' };
const MARKET_ROUTE_TO_TAB = { summary:'Offseason Summary', trades:'Trades', transfers:'Transfers', draft:'Draft', rights:'Rights', 'free-agency':'Free Agency', retirements:'Retirements', legacy:'Hall of Fame', spawn:'Spawn', coaches:'Coaches' };
const MARKET_TAB_TO_ROUTE = Object.fromEntries(Object.entries(MARKET_ROUTE_TO_TAB).map(([routeName, tabName]) => [tabName, routeName]));
function parseHashRoute() {
  const raw = (window.location.hash || '#/world').replace(/^#\/?/, '');
  const [path] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  return { page: parts[0] || 'world', id: parts[1] ?? null, tab: parts[2] ?? null };
}
function goToRoute(path, replace = false) {
  const hash = `#/${path.replace(/^#?\/?/, '')}`;
  if (replace) window.history.replaceState(null, '', hash);
  else if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = hash;
}

function normalizeUniverseForUi(universe) {
  if (!universe) return universe;
  universe.version ??= 7;
  universe.presentation ??= { confirmedYear: null, config: { ...DEFAULT_PRESENTATION_CONFIG } };
  universe.presentation.config = { ...DEFAULT_PRESENTATION_CONFIG, ...(universe.presentation.config ?? {}) };
  universe.showcaseHistory ??= [];
  universe.showcase ??= null;
  if (Number(universe.version) >= 9 && Number(universe.version) < 9.3) universe = repairMarketBalance(universe);
  universe.offseasonHistory ??= [];
  universe.offseason ??= null;
  universe.usedRealPlayerNames ??= [];
  universe.eliteRouteBalance ??= { NCAA: 0, International: 0 };
  universe.talentHistory ??= [];
  universe.hallOfFame ??= { nba: [], fiba: [] };
  universe.legacyHistory ??= [];
  universe.followedPlayerIds ??= [];
  if (!universe.teams?.every((team) => team.type === 'National' || team.strengthProfile)) universe.teams = recalculateTeamRatings(universe.teams, universe.players, universe.coaches, universe.owners);
  universe.version = 12;
  const americasClubs = new Set(['Boca Juniors','Instituto Córdoba','Quimsa','San Lorenzo','Flamengo','Franca','Minas Tênis Clube','Bauru Basket','Scarborough Shooting Stars','Vancouver Bandits','Calgary Surge','Niagara River Lions']);
  universe.teams?.forEach((team) => {
    if (americasClubs.has(team.name)) {
      team.secondaryCompetitions ??= []; team.secondaryCompetitionIds ??= [];
      if (!team.secondaryCompetitions.includes('Americas Champions League')) team.secondaryCompetitions.push('Americas Champions League');
      if (!team.secondaryCompetitionIds.includes('americas-champions-league')) team.secondaryCompetitionIds.push('americas-champions-league');
    }
    if (team.type === 'NBA') team.localMinimum = 0;
    team.unavailablePlayers ??= [];
    team.selectionCompetition ??= 'International window';
    team.selectionYear ??= universe.year;
    team.secondaryCompetitions ??= [];
    team.secondaryCompetitionIds ??= [];
    team.history ??= [];
    team.honors ??= [];
    team.rosterIds ??= [];
    team.retiredJerseys ??= [];
  });
  universe.players?.forEach((player) => {
    player.nationalCommitment ??= 0.65;
    player.internationalRetired ??= false;
    player.internationalHistory ??= [];
    player.honors ??= [];
    player.careerEvents ??= [];
    player.jerseyHistory ??= [];
    if (player.jerseyNumber === undefined) player.jerseyNumber = null;
  });
  return universe;
}

export default function App() {
  const [universe, setUniverse] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [saveName, setSaveName] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSaves, setLoadingSaves] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [view, setView] = useState('World');
  const [marketTab, setMarketTab] = useState('Offseason Summary');
  const [showPresentationSettings, setShowPresentationSettings] = useState(false);
  const [detail, setDetail] = useState(null);
  const [route, setRoute] = useState(() => parseHashRoute());
  const saveQueueRef = useRef(Promise.resolve());
  const careerTags = useMemo(() => (universe ? tagUniverseCareers(universe) : null), [universe?.seed, universe?.year, universe?.yearReview, universe?.finalizedYear, universe?.offseason?.stageIndex, universe?.players?.length, universe?.retiredPlayers?.length]);

  const refreshSlots = async () => {
    setLoadingSaves(true);
    try {
      const records = await listSaveSlots();
      setSlots(records);
    } catch (error) {
      setSaveStatus(`Save storage unavailable: ${error.message}`);
      setSlots([]);
    } finally {
      setLoadingSaves(false);
    }
  };
  useEffect(() => { void refreshSlots(); }, []);
  useEffect(() => {
    const syncRoute = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', syncRoute);
    if (!window.location.hash) goToRoute('world', true);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  useEffect(() => {
    const viewMap = { world:'World', game:'Live Game', results:'Results', tournaments:'Tournaments', teams:'Teams', players:'Players', coaches:'Coaches', market:'Market', statistics:'Statistics', magazine:'The Global Five', careers:'Careers', almanac:'Almanac', region:'Tournaments', country:'Tournaments', competition:'Tournaments', 'national-team':'Tournaments', team:'Teams', player:'Players', coach:'Coaches' };
    if (viewMap[route.page]) setView(viewMap[route.page]);
    if (route.page === 'market' && route.id) setMarketTab(MARKET_ROUTE_TO_TAB[route.id] ?? 'Transfers');
    if (['team','national-team','player','coach','competition'].includes(route.page)) setDetail({ type: route.page === 'national-team' ? 'team' : route.page, id: Number.isNaN(Number(route.id)) ? route.id : Number(route.id) });
    else setDetail(null);
  }, [route]);

  const persistUniverse = (nextUniverse = universe) => {
    if (!activeSlot || !nextUniverse) return Promise.resolve(true);
    const slot = activeSlot;
    const name = saveName || `Basketball World ${slot}`;
    setSaveStatus('Saving…');
    saveQueueRef.current = saveQueueRef.current.catch(() => true).then(async () => {
      await writeSaveSlot(slot, name, nextUniverse);
      setSaveStatus(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      return true;
    }).catch((error) => {
      setSaveStatus(`Save failed: ${error.message}`);
      return false;
    });
    return saveQueueRef.current;
  };
  const commitUniverse = (nextUniverse) => {
    setUniverse(nextUniverse);
    void persistUniverse(nextUniverse);
  };
  const createNewGame = async (slot) => {
    const existing = slots.find((item) => item.slot === slot);
    if (existing && !window.confirm(`Replace "${existing.name}" in slot ${slot}?`)) return;
    setLoadingSaves(true);
    try {
      const next = normalizeUniverseForUi(createUniverse((Date.now() + slot * 7919) % 2147483647));
      const name = `Basketball World ${slot}`;
      setActiveSlot(slot);
      setSaveName(name);
      setUniverse(next);
      setView('World');
      setDetail(null);
      goToRoute('world', true);
      await writeSaveSlot(slot, name, next);
      setSaveStatus('New universe saved');
    } catch (error) {
      setSaveStatus(`Unable to create universe: ${error.message}`);
      setUniverse(null);
    } finally {
      setLoadingSaves(false);
    }
  };
  const continueGame = async (slot) => {
    setLoadingSaves(true);
    try {
      const record = await loadSaveSlot(slot);
      if (!record?.universe) throw new Error('The selected slot is empty.');
      setActiveSlot(slot);
      setSaveName(record.name || `Basketball World ${slot}`);
      const loadedUniverse = normalizeUniverseForUi(record.universe);
      setUniverse(loadedUniverse);
      setView('World');
      setDetail(null);
      goToRoute('world', true);
      setSaveStatus((record.version ?? loadedUniverse.version ?? 7) < 12 ? 'v1.0 save upgraded to v1.01 — Live Game, spoiler-safe showcases, Americas Champions League and expanded browsing are active.' : 'Save loaded');
    } catch (error) {
      setSaveStatus(`Load failed: ${error.message}`);
    } finally {
      setLoadingSaves(false);
    }
  };
  const removeGame = async (slot) => {
    const record = slots.find((item) => item.slot === slot);
    if (!record || !window.confirm(`Delete "${record.name}" permanently?`)) return;
    try {
      await deleteSaveSlot(slot);
      await refreshSlots();
      setSaveStatus(`Slot ${slot} deleted`);
    } catch (error) {
      setSaveStatus(`Delete failed: ${error.message}`);
    }
  };
  const goHome = async () => {
    const saved = await persistUniverse();
    if (!saved && !window.confirm('The current universe could not be saved. Return home anyway?')) return;
    setUniverse(null);
    setActiveSlot(null);
    setDetail(null);
    setView('World');
    goToRoute('world', true);
    await refreshSlots();
  };

  if (loadingSaves && !universe) return <div className="loading-screen"><span className="home-mark spin"><Icon name="ball" size={34}/></span><h1>Loading the basketball world…</h1><p>{saveStatus}</p></div>;
  if (!universe) return <SaveHome slots={slots} onContinue={continueGame} onNew={createNewGame} onDelete={removeGame} status={saveStatus} />;

  const teamById = new Map(universe.teams.map((team) => [team.id, team]));
  const playerById = new Map([...universe.players, ...universe.retiredPlayers].map((player) => [player.id, player]));
  const coachById = new Map([...universe.coaches, ...universe.retiredCoaches].map((coach) => [coach.id, coach]));
  const clubTeams = universe.teams.filter((team) => !['NCAA','National'].includes(team.type));
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');

  const navigate = (nextView) => goToRoute(NAV_ROUTES[nextView] ?? 'world');
  const openTeam = (teamOrId) => { const id = typeof teamOrId === 'object' ? teamOrId.id : teamOrId; const team = teamById.get(id); goToRoute(`${team?.type === 'National' ? 'national-team' : 'team'}/${id}`); };
  const openPlayer = (playerOrId) => goToRoute(`player/${typeof playerOrId === 'object' ? playerOrId.id : playerOrId}`);
  const toggleFollowPlayer = (playerId) => {
    const followed = new Set(universe.followedPlayerIds ?? []);
    if (followed.has(playerId)) followed.delete(playerId);
    else followed.add(playerId);
    universe.followedPlayerIds = [...followed];
    commitUniverse({ ...universe });
  };
  const openCoach = (coachOrId) => goToRoute(`coach/${typeof coachOrId === 'object' ? coachOrId.id : coachOrId}`);
  const openCompetition = (competitionOrId) => goToRoute(`competition/${typeof competitionOrId === 'object' ? competitionOrId.id : competitionOrId}`);
  const openRegion = (region) => goToRoute(`region/${encodeURIComponent(region)}`);
  const openCountry = (country) => goToRoute(`country/${encodeURIComponent(country)}`);
  const runWeeks = (weeks) => {
    try { commitUniverse(simulateWeeks(universe, weeks)); }
    catch (error) { setSaveStatus(`Simulation error: ${error.message}`); }
  };
  const confirmPresentation = (config) => {
    try { commitUniverse(configureSeasonPresentation(universe, config)); setShowPresentationSettings(false); }
    catch (error) { setSaveStatus(`Presentation setup error: ${error.message}`); }
  };
  const checkpointShowcase = (ticks) => {
    try { commitUniverse(checkpointShowcaseGame(universe, ticks)); }
    catch (error) { setSaveStatus(`Game simulation error: ${error.message}`); }
  };
  const skipShowcase = () => {
    try { commitUniverse(skipCurrentShowcaseGame(universe)); }
    catch (error) { setSaveStatus(`Game simulation error: ${error.message}`); }
  };
  const nextShowcase = () => {
    try { const next = advanceShowcaseGame(universe); commitUniverse(next); if (!next.showcase?.active) goToRoute('world'); }
    catch (error) { setSaveStatus(`Game simulation error: ${error.message}`); }
  };
  const beginOffseason = () => {
    try {
      const next = startOffseason(universe);
      commitUniverse(next);
      setMarketTab('Retirements');
      goToRoute('market/retirements');
    } catch (error) { setSaveStatus(`Offseason error: ${error.message}`); }
  };
  const runOffseasonStage = () => {
    try {
      const stageIndex = universe.offseason?.stageIndex ?? 0;
      const next = advanceOffseasonStage(universe);
      commitUniverse(next);
      const tabs = ['Retirements','Draft','Trades','Free Agency','Offseason Summary'];
      const routes = ['retirements','draft','trades','free-agency','summary'];
      setMarketTab(tabs[stageIndex] ?? 'Offseason Summary');
      goToRoute(`market/${routes[stageIndex] ?? 'summary'}`);
    } catch (error) { setSaveStatus(`Offseason error: ${error.message}`); }
  };

  const presentationReady = universe.presentation?.confirmedYear === universe.year;
  const showcaseGame = universe.showcase?.active ? universe.showcase.games?.[universe.showcase.currentIndex] : null;

  const activeGroup = activeNavigationGroup(view);
  const saveFailed = saveStatus.startsWith('Save failed') || saveStatus.includes('error');
  const simHint = universe.showcase?.active ? `Showcase game ${universe.showcase.currentIndex + 1} of ${universe.showcase.games.length}. The rest of the world is paused.`
    : universe.offseason?.active ? `Offseason stage ${universe.offseason.stageIndex + 1} of ${OFFSEASON_STAGES.length}. Check the market after each stage.`
    : universe.yearReview ? 'Season complete. Review the year, then open the offseason.'
    : !presentationReady ? 'Pick the games you want to watch live, then start the season.'
    : 'Advance the calendar. Every result becomes part of the archive.';
  const showSubnavInline = NAV_GROUPS[activeGroup].length > 1;
  return <div className="app-shell">
    <aside className="rail" aria-label="Game navigation">
      <button className="rail-brand" onClick={() => navigate('World')} aria-label="Basketball World Chronicle, go to World">
        <span className="rail-mark"><Icon name="ball" size={22}/></span>
        <span className="rail-title"><strong>World Chronicle</strong><small>Basketball universe</small></span>
      </button>
      <nav className="rail-nav" aria-label="Main sections">{NAV.map((item) => {
        const isActive = activeGroup === item;
        return <div className={`rail-group ${isActive ? 'active' : ''}`} key={item}>
          <button className={`rail-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined} onClick={() => navigate(NAV_DEFAULTS[item])}>
            <Icon name={NAV_ICONS[item]} size={19}/><span>{NAV_LABELS[item]}</span>
            {item === 'Tonight' && universe.showcase?.active && <i className="rail-live-dot" aria-label="Live game waiting"/>}
          </button>
          {isActive && NAV_GROUPS[item].length > 1 && <ul className="rail-sub">{NAV_GROUPS[item].map((sub) => <li key={sub}><button className={view === sub ? 'active' : ''} aria-current={view === sub ? 'page' : undefined} onClick={() => navigate(sub)}>{SUBNAV_LABELS[sub] ?? sub}</button></li>)}</ul>}
        </div>;
      })}</nav>
      <div className="rail-foot">
        <div className="rail-save"><strong>{saveName || `Slot ${activeSlot}`}</strong><span className={saveFailed ? 'error' : ''}>{saveStatus || 'Autosave on'}</span></div>
        <div className="rail-actions"><button onClick={() => void persistUniverse()} title="Save now"><Icon name="save" size={16}/><span>Save</span></button><button onClick={goHome} title="Save and return to the slot menu"><Icon name="exit" size={16}/><span>Exit</span></button></div>
      </div>
    </aside>
    <div className="stage">
    <header className="seasonbar">
      <div className="season-clock"><strong>{universe.year}</strong><span><b>Week {universe.week}</b>{universe.phase}</span></div>
      <p className="sim-hint">{simHint}</p>
      <div className="sim-controls">
        {!universe.showcase?.active && !universe.yearReview && !universe.offseason?.active && <>
          <button className="button primary" disabled={!presentationReady} onClick={() => runWeeks(1)}><Icon name="play" size={14}/>Sim 1 week</button>
          <button className="button" disabled={!presentationReady} onClick={() => runWeeks(4)}>4 weeks</button>
          <button className="button" disabled={!presentationReady} onClick={() => runWeeks(50)}><Icon name="skip" size={15}/>To postseason</button>
          <button className={`button icon-button ${showPresentationSettings ? 'active' : ''}`} onClick={() => setShowPresentationSettings((value)=>!value)} title={presentationReady ? 'Change which games you watch live' : 'Choose which games to watch live'} aria-label="Live game settings"><Icon name="settings" size={17}/></button>
        </>}
        {universe.showcase?.active && showcaseGame && <button className="next-game-chip" onClick={() => navigate('Live Game')}>
          <span className="ngc-teams"><TeamBadge team={{name:showcaseGame.teamA,color:showcaseGame.teamAColor}} size={26}/><TeamBadge team={{name:showcaseGame.teamB,color:showcaseGame.teamBColor}} size={26}/></span>
          <span className="ngc-copy"><strong>{showcaseGame.teamA} vs {showcaseGame.teamB}</strong><small>{showcaseGame.round}{showcaseGame.competitionId==='nba'?` · Game ${showcaseGame.gameNumber}`:''}</small></span>
          <span className="ngc-cta">{view === 'Live Game' ? 'Now showing' : 'Watch live'}<Icon name="chevron" size={15}/></span>
        </button>}
        {universe.yearReview && !universe.offseason?.active && <button className="button primary" onClick={beginOffseason}>Start offseason<Icon name="forward" size={15}/></button>}
        {universe.offseason?.active && <button className="button primary" onClick={runOffseasonStage}><Icon name="play" size={14}/>Run {OFFSEASON_STAGES[universe.offseason.stageIndex]}</button>}
      </div>
    </header>
    {showSubnavInline && <nav className="mobile-subnav" aria-label="Section pages">{NAV_GROUPS[activeGroup].map((item)=><button key={item} className={view===item?'active':''} onClick={()=>navigate(item)}>{SUBNAV_LABELS[item] ?? item}</button>)}</nav>}
    <main>
      {universe.yearReview && !universe.offseason?.active && (view === 'World' && !detail && route.page === 'world' ? <YearEndExperience universe={universe} onTeam={openTeam} onPlayer={openPlayer} onStartOffseason={beginOffseason}/> : <div className="year-review-strip"><span><strong>{universe.year} season complete.</strong> Champions, awards and stories are waiting in the Year Review.</span><button className="button" onClick={() => navigate('World')}>Open Year Review</button></div>)}
      {(!presentationReady || showPresentationSettings) && !universe.yearReview && !universe.offseason?.active && !universe.showcase?.active && <SeasonPresentationSetup universe={universe} onConfirm={confirmPresentation} />}
      <Breadcrumbs route={route} universe={universe} teamById={teamById} playerById={playerById} />
      {route.page === 'region' ? <RegionPage region={route.id} universe={universe} onCompetition={openCompetition} onCountry={openCountry} onTeam={openTeam} /> : route.page === 'country' ? <CountryPage country={route.id} universe={universe} onCompetition={openCompetition} onTeam={openTeam} onPlayer={openPlayer} /> : detail ? <DetailRouter detail={detail} universe={universe} teamById={teamById} playerById={playerById} coachById={coachById} onBack={() => window.history.back()} onTeam={openTeam} onPlayer={openPlayer} onCoach={openCoach} onCompetition={openCompetition} onToggleFollow={toggleFollowPlayer} /> : <>
        {view === 'World' && <WorldView universe={universe} setView={navigate} setMarketTab={setMarketTab} onTeam={openTeam} onPlayer={openPlayer} />}
        {view === 'Live Game' && <LiveGameScreen universe={universe} game={showcaseGame} onCheckpoint={checkpointShowcase} onSkip={skipShowcase} onNext={nextShowcase} onPlayer={openPlayer} onTeam={openTeam} onBrowse={()=>navigate('World')} />}
        {view === 'Results' && <ResultsView universe={universe} onPlayer={openPlayer} onTeam={openTeam} onCompetition={openCompetition} />}
        {view === 'Tournaments' && <TournamentsView universe={universe} onCompetition={openCompetition} onRegion={openRegion} onCountry={openCountry} />}
        {view === 'Teams' && <TeamsView universe={universe} onTeam={openTeam} />}
        {view === 'Players' && <PlayersView universe={universe} teamById={teamById} careerTags={careerTags} onPlayer={openPlayer} />}
        {view === 'Coaches' && <CoachesView universe={universe} onCoach={openCoach} onTeam={openTeam} />}
        {view === 'Market' && <MarketView universe={universe} tab={marketTab} setTab={(tab) => { setMarketTab(tab); goToRoute(`market/${MARKET_TAB_TO_ROUTE[tab] ?? 'transfers'}`); }} onPlayer={openPlayer} onTeam={openTeam} onCoach={openCoach} />}
        {view === 'Statistics' && <StatisticsView universe={universe} teamById={teamById} onPlayer={openPlayer} />}
        {view === 'The Global Five' && <MagazineView universe={universe} onPlayer={openPlayer} onTeam={openTeam} />}
        {view === 'Careers' && <CareersView universe={universe} careerTags={careerTags} onPlayer={openPlayer} />}
        {view === 'Almanac' && <AlmanacView universe={universe} onCompetition={openCompetition} />}
      </>}
    </main>
    </div>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {NAV.map((item)=><button key={item} className={activeGroup===item?'active':''} aria-current={activeGroup===item?'page':undefined} onClick={()=>navigate(NAV_DEFAULTS[item])}><Icon name={NAV_ICONS[item]} size={20}/><small>{NAV_LABELS[item]}</small>{item === 'Tonight' && universe.showcase?.active && <i className="rail-live-dot"/>}</button>)}
    </nav>
  </div>;
}



function teamStrengthTones(universe, team) {
  return Object.fromEntries(['perimeter','interior','defense','rebounding'].map((key) => [key, teamStrengthTone(universe, team, key)]));
}
function TeamCard({ team, universe, onTeam }) {
  const era = team.type === 'National' ? null : teamEraStatus(universe, team);
  const league = team.type === 'NCAA' ? team.secondaryCompetitions?.at(-1) ?? team.competition : team.competition;
  return <button className="team-card" onClick={() => onTeam(team)} style={{ '--team-color': team.color || '#4b9dff' }}>
    <div className="team-card-top"><TeamMark team={team} size={52}/><div className="tc-name"><h3>{team.name}</h3><p><Flag value={team.country}/> {league}</p></div><RatingPill value={team.rating}/></div>
    <StrengthBars profile={team.strengthProfile} tones={teamStrengthTones(universe, team)} compact/>
    <div className="tag-row">{era && <span className={`team-era team-era-${era.tone}`}>{era.label}</span>}<span>{team.wins}–{team.losses}</span>{team.honors.length > 0 && <span><Icon name="records" size={12}/>{team.honors.length}</span>}{team.tier===2&&<span>Tier 2</span>}{team.secondaryCompetitionIds?.includes('euroleague')&&<span>EuroLeague</span>}</div>
  </button>;
}
function PowerRow({ team, index, onTeam, detail }) {
  return <button className="power-row" onClick={() => onTeam(team)} style={{ '--team-color': team.color || '#4b9dff' }}>
    <span className="rank-number">{index + 1}</span>
    <TeamMark team={team} size={40}/>
    <span className="power-copy"><strong>{team.name}</strong><small><Flag value={team.country}/> {detail ?? team.competition}</small></span>
    <span className="power-meter" aria-hidden="true"><i style={{ width: `${meterPercent(team.rating)}%` }} className={`g-${gradeFor(team.rating).grade.toLowerCase()}`}/></span>
    <RatingPill value={team.rating}/>
  </button>;
}
function StoryCard({story,onPlayer,onTeam}) {
  const action=story.playerId?()=>onPlayer?.(story.playerId):story.teamId?()=>onTeam?.(story.teamId):null;
  const Tag=action?'button':'article';
  return <Tag className={`chronicle-story story-${String(story.category).toLowerCase().replace(/\s+/g,'-')}`} onClick={action}><span className="story-icon"><Icon name={STORY_ICONS[story.category] ?? 'stories'} size={20}/></span><div><small>{story.category}</small><strong>{story.title}</strong><p>{story.body}</p></div>{action&&<Icon name="chevron" size={16} className="story-go"/>}</Tag>;
}
function YearEndExperience({universe,onTeam,onPlayer,onStartOffseason}) {
  const [chapter,setChapter]=useState(0); const [open,setOpen]=useState(true); const year=universe.year;
  const majors=majorSeasonRows(universe,year); const stories=buildChronicleStories(universe,year); const allPlayers=allUniversePlayers(universe); const playerById=new Map(allPlayers.map((p)=>[p.id,p]));
  const prospects=universe.players.filter((p)=>p.age<=22&&p.status==='Active').sort((a,b)=>RARITY_ORDER.indexOf(a.rarity)-RARITY_ORDER.indexOf(b.rarity)||b.base-a.base||b.current-a.current).slice(0,8);
  const legacy=(universe.legacyHistory??[]).find((row)=>Number(row.year)===Number(year));
  const chapters=['Champions','Awards','Stories','Future','Legacy'];
  if(!open)return <div className="year-review-dock panel"><div><strong>{year} Chronicle complete</strong><span>Champions, awards and season stories are ready.</span></div><button className="button primary" onClick={()=>setOpen(true)}>Open Year Review</button></div>;
  return <section className="year-end-experience">
    <div className="year-end-hero"><div><div className="kicker light">The Global Five · Year End</div><h2>{year} Basketball Chronicle</h2><p>The season is complete. Reveal the champions, defining performances and the stories that changed the world.</p></div><div className="year-end-number">{year}</div></div>
    <div className="year-end-chapters">{chapters.map((name,index)=><button key={name} className={chapter===index?'active':chapter>index?'done':''} onClick={()=>setChapter(index)}><span>{index+1}</span>{name}</button>)}</div>
    {chapter===0&&<div className="year-end-grid champion-grid">{majors.map(({competition,season})=>{const team=universe.teams.find((t)=>t.id===season.championTeamId);return <button className="year-champion-card" key={competition.id} onClick={()=>onTeam(season.championTeamId)} style={{'--champ-color':team?.color||'#173b67'}}><CompetitionEmblem competition={competition} size={54}/><div><small>{competition.name}</small><strong>{season.champion}</strong><span>over {season.runnerUp}</span></div><TeamMark team={team} size={66}/></button>})}{!majors.length&&<div className="empty-state">No major championship completed this year.</div>}</div>}
    {chapter===1&&<div className="year-awards-grid">{majors.map(({competition,season})=>{const mvp=playerById.get(season.mvp?.id),fmvp=playerById.get(season.finalsMvp?.id);return <article className="year-award-card" key={competition.id}><div className="award-title"><CompetitionEmblem competition={competition} size={42}/><div><small>{competition.name}</small><strong>Season awards</strong></div></div>{mvp&&<button onClick={()=>onPlayer(mvp)}><PlayerPortrait player={mvp} size={58}/><div><small>MVP</small><strong>{mvp.name}</strong><span>{mvp.teamName} · {mvp.current} OVR</span></div></button>}{fmvp&&fmvp.id!==mvp?.id&&<button onClick={()=>onPlayer(fmvp)}><PlayerPortrait player={fmvp} size={58}/><div><small>{competition.id==='nba'?'FINALS MVP':'PLAYOFF / FINALS MVP'}</small><strong>{fmvp.name}</strong><span>{fmvp.teamName}</span></div></button>}<div className="best-five-mini">{Object.entries(season.allLeagueFive??{}).map(([pos,row])=><button key={pos} onClick={()=>row?.id&&onPlayer(row.id)}><span>{pos}</span><strong>{row?.name??'—'}</strong></button>)}</div></article>})}</div>}
    {chapter===2&&<div className="chronicle-story-grid">{stories.map((story)=><StoryCard key={story.key} story={story} onPlayer={onPlayer} onTeam={onTeam}/>)}{!stories.length&&<div className="empty-state">A quiet year by Chronicle standards — no truly iconic story cleared the threshold.</div>}</div>}
    {chapter===3&&<><div className="section-header light-section"><h3>The next generation</h3><span>Highest-ceiling players age 22 or younger</span></div><div className="future-grid">{prospects.map((player)=><button key={player.id} className={`future-card rarity-surface-${player.rarity.toLowerCase()}`} onClick={()=>onPlayer(player)}><PlayerPortrait player={player} size={78}/><div><Rarity value={player.rarity}/><strong>{player.name}</strong><span>{player.age} · {player.position} · {player.teamName}</span><small>Base {player.base} · Current {player.current}</small></div></button>)}</div></>}
    {chapter===4&&<div className="legacy-year-grid"><article><h3>Hall of Fame</h3><p>{(legacy?.nbaInductions?.length??0)} NBA · {(legacy?.fibaInductions?.length??0)} FIBA inductions recorded this year.</p>{[...(legacy?.nbaInductions??[]),...(legacy?.fibaInductions??[])].map((entry)=><button key={`${entry.hall}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><strong>{entry.player}</strong><span>{entry.hall} Hall · legacy {entry.score}</span></button>)}</article><article><h3>Retired jerseys</h3><p>Only extraordinary team-specific careers qualify.</p>{(legacy?.jerseyRetirements??[]).map((entry)=><button key={`${entry.teamId}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><strong>#{entry.number} · {entry.player}</strong><span>{entry.team}</span></button>)}</article><article><h3>Career farewells</h3>{(universe.retirements??[]).filter((r)=>Number(r.year)===Number(year)).slice(0,10).map((r)=><button key={r.playerId} onClick={()=>onPlayer(r.playerId)}><strong>{r.player}</strong><span>{r.rarity} · {r.age} · {r.honors} honors</span></button>)}{!(universe.retirements??[]).some((r)=>Number(r.year)===Number(year))&&<p>Retirements are revealed in the first offseason stage.</p>}</article></div>}
    <div className="year-end-actions"><button className="button subtle" onClick={()=>setOpen(false)}>Browse world</button>{chapter>0&&<button className="button" onClick={()=>setChapter(chapter-1)}>← Previous</button>}{chapter<chapters.length-1?<button className="button primary" onClick={()=>setChapter(chapter+1)}>Next chapter →</button>:<button className="button primary year-end-start" onClick={onStartOffseason}>Begin offseason →</button>}</div>
  </section>;
}
function StartingFiveCourt({team,universe,onPlayer}) {
  const five=startingFiveFor(team,universe);
  const positionNames={PG:'Point guard',SG:'Shooting guard',SF:'Small forward',PF:'Power forward',C:'Center'};
  return <section className="panel starting-five-panel">
    <SectionHeader title="Starting five" note="Best available player at each position · select any portrait to open their career"/>
    <div className="half-court-wrap">
      <div className="basketball-court" aria-label="Basketball half-court, hoop at the top, guards outside, forwards and center near the paint">
        <svg className="half-court-lines" viewBox="0 0 1000 820" preserveAspectRatio="none" aria-hidden="true">
          <rect x="28" y="26" width="944" height="768" fill="none" stroke="currentColor" strokeWidth="5"/>
          <path d="M86 26V224C86 455 260 571 500 571S914 455 914 224V26" fill="none" stroke="currentColor" strokeWidth="5"/>
          <rect x="345" y="26" width="310" height="357" fill="none" stroke="currentColor" strokeWidth="5"/>
          <path d="M390 383A110 110 0 0 0 610 383" fill="none" stroke="currentColor" strokeWidth="5"/>
          <path d="M390 383A110 110 0 0 1 610 383" fill="none" stroke="currentColor" strokeDasharray="16 15" strokeWidth="5"/>
          <path d="M454 114H546" fill="none" stroke="currentColor" strokeWidth="5"/>
          <circle cx="500" cy="143" r="16" fill="none" stroke="currentColor" strokeWidth="5"/>
          <path d="M500 26V127" fill="none" stroke="currentColor" strokeWidth="3" opacity=".32" />
          <path d="M445 794A55 55 0 0 1 555 794" fill="none" stroke="currentColor" strokeWidth="5"/>
          <path d="M28 794H972" stroke="currentColor" strokeWidth="5" opacity=".3"/>
        </svg>
        <div className="court-orientation">ATTACKING HALF · HOOP ↑</div>
        {five.map((player)=> <button key={player.id} type="button"
          className={`court-player court-pos-${player.position.toLowerCase()} rarity-surface-${player.rarity.toLowerCase()}`}
          onClick={()=>onPlayer(player.id)} title={`${positionNames[player.position]} · ${player.name} · ${player.current} OVR`}>
          <PlayerPortrait player={player} team={team} size={62}/>
          <span className="court-player-info"><span className="court-position">{player.position}<span className="court-position-name"> · {positionNames[player.position]}</span></span><strong>{player.name}</strong><small>{player.current} OVR</small></span>
        </button>)}
      </div>
      <div className="court-legend"><span>1 · PG</span><span>2 · SG</span><span>3 · SF</span><span>4 · PF</span><span>5 · C</span></div>
    </div>
  </section>;
}
function OffseasonStageSpotlight({universe,onPlayer,onTeam,onCoach}) {
  if(!universe.offseason?.active)return null; const idx=universe.offseason.stageIndex; const year=universe.offseason.year; const players=allUniversePlayers(universe); const playerById=new Map(players.map((p)=>[p.id,p]));
  const retirements=(universe.retirements??[]).filter((r)=>Number(r.year)===Number(year)).slice(0,8); const legacy=(universe.legacyHistory??[]).find((row)=>Number(row.year)===Number(year)); const draft=(universe.draftHistory??[]).find((d)=>Number(d.year)===Number(year)); const moves=(universe.transactions??[]).filter((t)=>Number(t.year)===Number(year)); const trades=moves.filter((t)=>t.type==='NBA trade').slice(0,10); const signings=moves.filter((t)=>t.type==='Free-agent signing').sort((a,b)=>(playerById.get(b.playerId)?.current??0)-(playerById.get(a.playerId)?.current??0)).slice(0,10); const coachMoves=(universe.coachTransactions??[]).filter((t)=>Number(t.year)===Number(year)).slice(0,8);
  return <section className="offseason-live-center"><div className="offseason-live-head"><div><div className="kicker light">Offseason Live · {year}</div><h2>{OFFSEASON_STAGES[idx]}</h2><p>The market is an event: preserve cores, find opportunities, and watch the balance of power move.</p></div><span className="offseason-stage-number">{idx+1}/{OFFSEASON_STAGES.length}</span></div><div className="offseason-stage-strip">{OFFSEASON_STAGES.map((stage,i)=><div key={stage} className={i<idx?'done':i===idx?'active':''}><span>{i+1}</span><small>{stage}</small></div>)}</div>
    {idx>=1&&retirements.length>0&&<div className="offseason-reveal"><h3>Farewells just announced</h3><div className="reveal-row">{retirements.map((r)=>{const p=playerById.get(r.playerId);return <button key={r.playerId} onClick={()=>onPlayer(r.playerId)}>{p&&<PlayerPortrait player={p} size={54}/>}<div><Rarity value={r.rarity}/><strong>{r.player}</strong><span>{r.age} · {r.honors} honors</span><small>{p?careerVerdict(p):''}</small></div></button>})}</div></div>}
    {idx>=1&&((legacy?.nbaInductions?.length??0)+(legacy?.fibaInductions?.length??0)+(legacy?.jerseyRetirements?.length??0)>0)&&<div className="legacy-ceremony-reveal"><div><h3><Icon name="medal" size={18}/>Hall of Fame class</h3>{[...(legacy?.nbaInductions??[]),...(legacy?.fibaInductions??[])].map((entry)=><button key={`${entry.hall}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><strong>{entry.player}</strong><span>{entry.hall} Hall of Fame · legacy {entry.score}</span><small>{entry.summary?`${entry.summary.titles} titles · ${entry.summary.mvps+entry.summary.finalsMvps} major MVPs · ${entry.summary.firstFive} Best Five`:'Completed Hall of Fame résumé'}</small></button>)}</div><div><h3><Icon name="jersey" size={18}/>Numbers to the rafters</h3>{(legacy?.jerseyRetirements??[]).map((entry)=><button key={`${entry.teamId}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><strong>#{entry.number} · {entry.player}</strong><span>{entry.team}</span><small>{entry.seasons} seasons · {entry.titles} titles · {entry.mvps+Number(entry.finalsMvps??0)} major MVPs · {entry.firstFive} Best Five</small></button>)}</div></div>}
    {idx>=2&&draft&&<div className="offseason-reveal"><h3>Draft board · top selections</h3><div className="draft-broadcast-row">{(draft.picks??[]).slice(0,10).map((pick)=>{const p=playerById.get(pick.playerId);const team=universe.teams.find((t)=>t.id===pick.teamId);return <button key={pick.pick} onClick={()=>p&&onPlayer(p)}><span className="pick-no">#{pick.pick}</span>{p&&<PlayerPortrait player={p} team={team} size={56}/>}<div><strong>{pick.player}</strong><small><Rarity value={p?.rarity??pick.rarity}/></small><span>{pick.team} · Base {p?.base??'—'} · OVR {p?.current??'—'}</span></div></button>})}</div></div>}
    {idx>=3&&trades.length>0&&<div className="offseason-reveal"><h3>Trade window headlines</h3><div className="reveal-list">{trades.map((t,i)=><button key={`${t.playerId}-${i}`} onClick={()=>onPlayer(t.playerId)}><strong>{t.player}</strong><span>{t.from} → {t.to}</span><em>{playerById.get(t.playerId)?.current??'—'} OVR</em></button>)}</div></div>}
    {idx>=4&&<div className="offseason-reveal-grid"><div><h3>Best free-agent signings</h3><div className="reveal-list">{signings.slice(0,6).map((t,i)=><button key={`${t.playerId}-${i}`} onClick={()=>onPlayer(t.playerId)}><strong>{t.player}</strong><span>{t.to}</span><em>{playerById.get(t.playerId)?.current??'—'} OVR</em></button>)}</div></div><div><h3>Coaching carousel</h3><div className="reveal-list">{coachMoves.slice(0,6).map((t,i)=><button key={`${t.coachId}-${i}`} onClick={()=>onCoach(t.coachId)}><strong>{t.coach}</strong><span>{t.from??'Market'} → {t.to??'New job'}</span><em>{t.current??'—'} OVR</em></button>)}</div></div></div>}
  </section>;
}

function SeasonPresentationSetup({ universe, onConfirm }) {
  const [config, setConfig] = useState({ ...DEFAULT_PRESENTATION_CONFIG, ...(universe.presentation?.config ?? {}) });
  useEffect(() => { setConfig({ ...DEFAULT_PRESENTATION_CONFIG, ...(universe.presentation?.config ?? {}) }); }, [universe.year]);
  const activeInternational = COMPETITIONS.filter((competition) => competition.kind === 'international' && isCompetitionActive(competition, universe.year)).map((competition) => competition.name);
  const rows = [
    { key:'nba', title:'NBA', note:'Final = every NBA Finals game. Semifinals = both Conference Finals series + NBA Finals.' },
    { key:'ncaa', title:'March Madness', note:'Final = National Championship. Semifinals = Final Four + Championship.' },
    { key:'euroleague', title:'EuroLeague', note:'Final = championship game. Semifinals = Final Four semifinals + final.' },
    { key:'international', title:'International tournaments', note:activeInternational.length ? activeInternational.join(' · ') : 'No major international tournament is scheduled this season.' },
  ];
  return <section className="presentation-setup panel">
    <div className="presentation-head"><div><h2>Which games do you want to watch live?</h2><p>Everything else simulates on its own. The rounds you pick pause the season so you can watch them minute by minute before the {universe.year} Year Review.</p></div><button className="button primary lg" onClick={()=>onConfirm(config)}>Confirm & start season<Icon name="forward" size={16}/></button></div>
    <div className="presentation-grid">{rows.map((row)=><article className="presentation-card" key={row.key}><div><h3>{row.title}</h3><p>{row.note}</p></div><div className="presentation-choice">{['None','Final','Semifinals'].map((value)=><button key={value} aria-pressed={config[row.key]===value} className={config[row.key]===value?'active':''} disabled={row.key==='international'&&!activeInternational.length} onClick={()=>setConfig((current)=>({...current,[row.key]:value}))}>{value}</button>)}</div></article>)}</div>
  </section>;
}

function livePeriodScore(game, tick, periodIndex) {
  const length=game.periodMinutes;
  const start=periodIndex*length;
  if(tick<=start) return null;
  const end=Math.min(tick,(periodIndex+1)*length);
  const endEntry=game.timeline[end-1];
  const before=start>0?game.timeline[start-1]:{scoreA:0,scoreB:0};
  return { a:endEntry.scoreA-before.scoreA, b:endEntry.scoreB-before.scoreB, complete:tick>=(periodIndex+1)*length };
}

function allocateLiveStat(rows, key, targetTotal) {
  const target = Math.max(0, Math.round(targetTotal || 0));
  if (!rows.length || target === 0) return rows.map(() => 0);
  const finalValues = rows.map((row) => Math.max(0, Number(row[key]) || 0));
  const finalTotal = finalValues.reduce((sum, value) => sum + value, 0);
  if (!finalTotal) return rows.map(() => 0);
  const raw = finalValues.map((value) => target * value / finalTotal);
  const values = raw.map((value) => Math.floor(value));
  let remaining = target - values.reduce((sum, value) => sum + value, 0);
  const order = raw.map((value, index) => ({ index, fraction: value - Math.floor(value), strength: Number(rows[index].current) || 0 }))
    .sort((a, b) => b.fraction - a.fraction || b.strength - a.strength || a.index - b.index);
  for (let i = 0; i < remaining; i += 1) values[order[i % order.length].index] += 1;
  return values;
}

function liveBoxRows(rows, tick, totalTicks, liveScore) {
  const ratio = totalTicks ? Math.max(0, Math.min(1, tick / totalTicks)) : 0;
  const pts = allocateLiveStat(rows, 'points', liveScore);
  const oreb = allocateLiveStat(rows, 'orpg', Math.round(rows.reduce((sum,row)=>sum+(row.orpg||0),0) * ratio));
  const dreb = allocateLiveStat(rows, 'drpg', Math.round(rows.reduce((sum,row)=>sum+(row.drpg||0),0) * ratio));
  const ast = allocateLiveStat(rows, 'assists', Math.round(rows.reduce((sum,row)=>sum+(row.assists||0),0) * ratio));
  const stl = allocateLiveStat(rows, 'steals', Math.round(rows.reduce((sum,row)=>sum+(row.steals||0),0) * ratio));
  const blk = allocateLiveStat(rows, 'blocks', Math.round(rows.reduce((sum,row)=>sum+(row.blocks||0),0) * ratio));
  return rows.map((row,index)=>({
    ...row,
    points:pts[index],
    orpg:oreb[index],
    drpg:dreb[index],
    rebounds:oreb[index]+dreb[index],
    assists:ast[index],
    steals:stl[index],
    blocks:blk[index],
  }));
}

function gameFlowFacts(game, tick) {
  const entries = game.timeline.slice(0, tick);
  let largestA = 0, largestB = 0, leadChanges = 0, ties = 0, previousSign = 0;
  let priorLeadForTie = 0;
  for (const entry of entries) {
    const lead = entry.scoreA - entry.scoreB;
    largestA = Math.max(largestA, lead);
    largestB = Math.max(largestB, -lead);
    const sign = Math.sign(lead);
    if (lead === 0 && priorLeadForTie !== 0) ties += 1;
    if (sign && previousSign && sign !== previousSign) leadChanges += 1;
    if (sign) previousSign = sign;
    priorLeadForTie = lead;
  }
  const current = tick ? entries[entries.length - 1] : { scoreA:0, scoreB:0, deltaA:0, deltaB:0 };
  const windowSize = 4;
  const windowStart = Math.max(0, tick - windowSize);
  const before = windowStart > 0 ? game.timeline[windowStart - 1] : { scoreA:0, scoreB:0 };
  const runA = current.scoreA - before.scoreA;
  const runB = current.scoreB - before.scoreB;
  const priorCurrent = tick > 1 ? game.timeline[tick - 2] : { scoreA:0, scoreB:0 };
  const priorWindowStart = Math.max(0, tick - 1 - windowSize);
  const priorBefore = priorWindowStart > 0 ? game.timeline[priorWindowStart - 1] : { scoreA:0, scoreB:0 };
  const priorRunA = priorCurrent.scoreA - priorBefore.scoreA;
  const priorRunB = priorCurrent.scoreB - priorBefore.scoreB;
  const currentLead = current.scoreA - current.scoreB;
  const previous = tick > 1 ? game.timeline[tick - 2] : { scoreA:0, scoreB:0 };
  const previousLead = previous.scoreA - previous.scoreB;
  let moment = null;
  if (tick) {
    if (currentLead === 0 && previousLead !== 0) moment = { type:'tie', label:'TIE GAME' };
    else if (Math.sign(currentLead) && Math.sign(previousLead) && Math.sign(currentLead)!==Math.sign(previousLead)) moment = { type:'lead', label:'LEAD CHANGE' };
    else if (tick >= game.timeline.length - 5 && Math.abs(currentLead) <= 3) moment = { type:'clutch', label:'CLUTCH TIME' };
    else if (runA >= 7 && runA-runB >= 5 && !(priorRunA >= 7 && priorRunA-priorRunB >= 5)) moment = { type:'run-a', label:`${runA}–${runB} RUN`, team:game.teamA };
    else if (runB >= 7 && runB-runA >= 5 && !(priorRunB >= 7 && priorRunB-priorRunA >= 5)) moment = { type:'run-b', label:`${runB}–${runA} RUN`, team:game.teamB };
    else if (Math.abs(currentLead) >= 15 && Math.abs(previousLead) < 15) moment = { type:'surge', label:'15-POINT LEAD', team:currentLead>0?game.teamA:game.teamB };
  }
  return { largestA, largestB, leadChanges, ties, runA, runB, currentLead, moment, current };
}

function shortTeamName(name='') {
  const clean = String(name).replace(/\([^)]*\)/g, '').trim();
  return clean.length > 14 ? clean.split(/\s+/).slice(-1)[0] : clean;
}

// Visible-minutes scale only: sizing the chart from the full timeline would reveal a big lead before it happens.
function LeadChart({ game, tick, colors }) {
  const [ca, cb] = colors;
  const total = game.timeline.length;
  const entries = [{ scoreA:0, scoreB:0 }, ...game.timeline.slice(0, tick)];
  const visibleMax = Math.max(8, ...entries.map((e) => Math.abs(e.scoreA - e.scoreB)));
  const scale = Math.ceil((visibleMax + 2) / 10) * 10;
  const W = 900, H = 280, padL = 64, padR = 20, padT = 18, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB, mid = padT + plotH / 2;
  const x = (i) => padL + (i / Math.max(1, total)) * plotW;
  const y = (lead) => mid - (lead / scale) * (plotH / 2);
  const line = entries.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(e.scoreA - e.scoreB).toFixed(1)}`).join(' ');
  const area = `${line} L${x(entries.length - 1).toFixed(1)} ${mid} L${x(0)} ${mid} Z`;
  const currentLead = entries.at(-1).scoreA - entries.at(-1).scoreB;
  const cx = x(entries.length - 1), cy = y(currentLead);
  const id = `lc-${String(game.id).replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ticks = [scale, scale / 2, -scale / 2, -scale];
  const leaderColor = currentLead > 0 ? ca : currentLead < 0 ? cb : '#c9d6e2';
  const tag = currentLead === 0 ? 'Tied' : `${shortTeamName(currentLead > 0 ? game.teamA : game.teamB)} +${Math.abs(currentLead)}`;
  const tagW = Math.max(54, tag.length * 7.4 + 18);
  const tagX = Math.min(W - padR - tagW, Math.max(padL, cx - tagW / 2));
  const tagY = cy < mid ? Math.max(padT, cy - 34) : Math.min(H - padB - 24, cy + 12);
  return <svg className="lead-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Lead by minute. Above the line ${game.teamA} leads, below it ${game.teamB} leads. Current: ${tag}.`}>
    <defs>
      <clipPath id={`${id}-top`}><rect x={padL} y={padT} width={plotW} height={plotH / 2}/></clipPath>
      <clipPath id={`${id}-bot`}><rect x={padL} y={mid} width={plotW} height={plotH / 2}/></clipPath>
      <linearGradient id={`${id}-ga`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ca} stopOpacity=".55"/><stop offset="1" stopColor={ca} stopOpacity=".08"/></linearGradient>
      <linearGradient id={`${id}-gb`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={cb} stopOpacity=".55"/><stop offset="1" stopColor={cb} stopOpacity=".08"/></linearGradient>
    </defs>
    <rect x={padL} y={padT} width={plotW} height={plotH / 2} fill={ca} fillOpacity=".06"/>
    <rect x={padL} y={mid} width={plotW} height={plotH / 2} fill={cb} fillOpacity=".06"/>
    {tick < total && <rect x={x(tick)} y={padT} width={Math.max(0, x(total) - x(tick))} height={plotH} fill="#04090f" fillOpacity=".38"/>}
    {ticks.map((t) => <g key={t}><line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#e8f0f7" strokeOpacity=".08"/><text x={padL - 10} y={y(t) + 4} textAnchor="end" className="lc-axis" fill={t > 0 ? ca : cb}>+{Math.abs(t)}</text></g>)}
    {game.periodLabels.slice(1).map((label, i) => { const px = x((i + 1) * game.periodMinutes); return <line key={label} x1={px} x2={px} y1={padT} y2={H - padB} stroke="#e8f0f7" strokeOpacity=".14" strokeDasharray="3 5"/>; })}
    {game.periodLabels.map((label, i) => <text key={label} x={x(i * game.periodMinutes + game.periodMinutes / 2)} y={H - 10} textAnchor="middle" className="lc-axis">{label}</text>)}
    <path d={area} fill={`url(#${id}-ga)`} clipPath={`url(#${id}-top)`}/>
    <path d={area} fill={`url(#${id}-gb)`} clipPath={`url(#${id}-bot)`}/>
    <line x1={padL} x2={W - padR} y1={mid} y2={mid} stroke="#e8f0f7" strokeOpacity=".5" strokeWidth="1.5"/>
    <text x={padL - 10} y={mid + 4} textAnchor="end" className="lc-axis">0</text>
    <path d={line} fill="none" stroke="#f4f8fb" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"/>
    <text x={padL + 10} y={padT + 18} className="lc-side" fill={ca}>{game.teamA} ahead</text>
    <text x={padL + 10} y={H - padB - 10} className="lc-side" fill={cb}>{game.teamB} ahead</text>
    {tick > 0 && <g className="lc-now">
      <circle cx={cx} cy={cy} r="11" fill={leaderColor} fillOpacity=".22"/>
      <circle cx={cx} cy={cy} r="5.5" fill={leaderColor} stroke="#0b1520" strokeWidth="2"/>
      <rect x={tagX} y={tagY} width={tagW} height="24" rx="12" fill="#0b1520" stroke={leaderColor} strokeOpacity=".8"/>
      <text x={tagX + tagW / 2} y={tagY + 16} textAnchor="middle" className="lc-tag" fill="#f4f8fb">{tag}</text>
    </g>}
  </svg>;
}

function RunMeter({ game, facts, colors }) {
  const [ca, cb] = colors;
  const sum = facts.runA + facts.runB;
  const aShare = sum ? facts.runA / sum * 100 : 50;
  const leader = facts.runA === facts.runB ? null : facts.runA > facts.runB ? game.teamA : game.teamB;
  return <div className="run-meter">
    <div className="run-head"><span>Last 4 minutes</span><strong>{leader ? `${shortTeamName(leader)} on a ${Math.max(facts.runA, facts.runB)}–${Math.min(facts.runA, facts.runB)} run` : sum ? 'Even exchange' : 'No scoring yet'}</strong></div>
    <div className="run-bar" aria-hidden="true"><span style={{ width:`${aShare}%`, background: sum ? ca : undefined }}/><span style={{ width:`${100 - aShare}%`, background: sum ? cb : undefined }}/></div>
    <div className="run-scores"><span style={{ color: ca }}><b>{facts.runA}</b> {shortTeamName(game.teamA)}</span><span style={{ color: cb }}>{shortTeamName(game.teamB)} <b>{facts.runB}</b></span></div>
  </div>;
}

function GameFlowPanel({ game, tick }) {
  const colors = teamColorPair(game.teamAColor, game.teamBColor);
  const facts = gameFlowFacts(game, tick);
  return <section className="panel flow-panel" style={{ '--team-a': colors[0], '--team-b': colors[1] }}>
    <div className="section-header"><h2>Game flow</h2><span className="flow-legend"><i style={{ background: colors[0] }}/>{game.teamA} lead<i style={{ background: colors[1] }}/>{game.teamB} lead</span></div>
    <LeadChart game={game} tick={tick} colors={colors}/>
    <div className="flow-foot">
      <RunMeter game={game} facts={facts} colors={colors}/>
      <dl className="flow-facts">
        <div><dt>Biggest lead</dt><dd><span style={{ color: colors[0] }}>{facts.largestA}</span><small>{shortTeamName(game.teamA)}</small></dd></div>
        <div><dt>Biggest lead</dt><dd><span style={{ color: colors[1] }}>{facts.largestB}</span><small>{shortTeamName(game.teamB)}</small></dd></div>
        <div><dt>Lead changes</dt><dd><span>{facts.leadChanges}</span></dd></div>
        <div><dt>Ties</dt><dd><span>{facts.ties}</span></dd></div>
      </dl>
    </div>
  </section>;
}

function LiveGameLeaders({ game, tick, current, onPlayer }) {
  const [ca, cb] = teamColorPair(game.teamAColor, game.teamBColor);
  const liveA = liveBoxRows(game.boxA,tick,game.timeline.length,current.scoreA).map((row)=>({...row,team:game.teamA,color:ca}));
  const liveB = liveBoxRows(game.boxB,tick,game.timeline.length,current.scoreB).map((row)=>({...row,team:game.teamB,color:cb}));
  const all=[...liveA,...liveB];
  const groups=[{key:'points',label:'Points',suffix:'PTS'},{key:'rebounds',label:'Rebounds',suffix:'REB'},{key:'assists',label:'Assists',suffix:'AST'}];
  return <section className="panel live-leaders">
    <div className="section-header"><h2>Game leaders</h2><span>Updates every minute</span></div>
    <div className="leader-columns">{groups.map((group)=>{
      const leaders=[...all].sort((a,b)=>b[group.key]-a[group.key] || b.current-a.current).slice(0,3);
      const top=Math.max(1,leaders[0]?.[group.key]??1);
      return <article key={group.key}><h3>{group.label}</h3>{leaders.map((row,index)=><button className="live-leader-row" key={`${group.key}-${row.playerId}`} onClick={()=>onPlayer(row.playerId)} style={{'--row-color':row.color}}>
        <PlayerPortrait player={{...row,name:row.player}} size={40}/>
        <span className="leader-name"><strong>{row.player}</strong><small>{row.team} · {row.position}</small><i className="leader-bar"><b style={{width:`${row[group.key]/top*100}%`}}/></i></span>
        <span className="leader-value">{row[group.key]}<small>{group.suffix}</small></span>
      </button>)}</article>;
    })}</div>
  </section>;
}

function FinalResultView({ game, index, total, onNext, onPlayer, onClose }) {
  const winnerA=game.winnerId===game.teamAId;
  const [ca, cb] = teamColorPair(game.teamAColor, game.teamBColor);
  const winnerName=winnerA?game.teamA:game.teamB;
  const loserName=winnerA?game.teamB:game.teamA;
  const winnerColor=winnerA?ca:cb;
  const loserColor=winnerA?cb:ca;
  const winnerScore=winnerA?game.scoreA:game.scoreB, loserScore=winnerA?game.scoreB:game.scoreA;
  const mvpRow=[...game.boxA,...game.boxB].find((row)=>row.playerId===game.mvp.playerId);
  const title=game.isChampionshipClincher?'Champions':game.isSeriesClincher||game.advances?'Advances':'Wins';
  return <div className="showcase-page final-showcase">
    <section className={`finale-stage ${game.isChampionshipClincher?'championship-night':''}`} style={{'--winner-color':winnerColor,'--loser-color':loserColor}}>
      <div className="confetti-layer" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
      <p className="finale-meta">{game.competition} · {game.round}{game.competitionId==='nba'?` · Game ${game.gameNumber}`:''} · Final</p>
      <div className="finale-winner">
        <TeamBadge team={{name:winnerName,color:winnerColor}} size={112}/>
        <div><span className="finale-title">{title}</span><h1>{winnerName}</h1></div>
      </div>
      <div className="final-score-line"><strong>{winnerScore}</strong><span>–</span><strong className="loser">{loserScore}</strong></div>
      <div className="final-opponent">over {loserName}{game.seriesWinsA!=null&&<> · series {game.teamA} {game.seriesWinsA}–{game.seriesWinsB} {game.teamB}</>}</div>
      <div className="finale-actions"><button className="button primary" onClick={onNext}>{index+1<total?'Next game':'Continue to Year Review'}<Icon name="forward" size={16}/></button><button className="button" onClick={onClose}>Back to world</button></div>
    </section>
    <section className="final-mvp-stage panel">
      <button className="mvp-portrait-button" onClick={()=>onPlayer(game.mvp.playerId)}><PlayerPortrait player={{...mvpRow,name:game.mvp.player,rarity:mvpRow?.rarity||'Rare',position:mvpRow?.position||'—'}} size={120}/></button>
      <div className="final-mvp-copy"><span className="mvp-label"><Icon name="starFill" size={14}/>Game MVP</span><h2>{game.mvp.player}</h2><p>{game.mvp.team}</p><div className="final-mvp-stats"><b>{game.mvp.points}<small>PTS</small></b><b>{game.mvp.rebounds}<small>REB</small></b><b>{game.mvp.assists}<small>AST</small></b><b>{game.mvp.steals}<small>STL</small></b><b>{game.mvp.blocks}<small>BLK</small></b></div><button className="inline-link" onClick={()=>onPlayer(game.mvp.playerId)}>Open career<Icon name="chevron" size={14}/></button></div>
    </section>
    <GameFlowPanel game={game} tick={game.timeline.length}/>
    <LiveGameLeaders game={game} tick={game.timeline.length} current={{scoreA:game.scoreA,scoreB:game.scoreB}} onPlayer={onPlayer}/>
    <div className="showcase-box-grid"><GameBox team={game.teamA} score={game.scoreA} rows={game.boxA} onPlayer={onPlayer}/><GameBox team={game.teamB} score={game.scoreB} rows={game.boxB} onPlayer={onPlayer}/></div>
  </div>;
}

function ShowcaseTeamPreview({name,color,rows,teamId,onPlayer,onTeam,align='left'}) {
  const stars=[...(rows??[])].sort((a,b)=>Number(b.current)-Number(a.current)||Number(b.points)-Number(a.points)).slice(0,3);
  return <div className={`showcase-preview-team ${align}`} style={{'--preview-team-color':color}}>
    <div className="preview-head"><button className="inline-link" onClick={()=>onTeam?.(teamId)}>{name}</button><span>Top three by rating</span></div>
    <div className="preview-people">{stars.map((player)=><button key={player.playerId} onClick={()=>onPlayer(player.playerId)} title={`Open ${player.player}`}><PlayerPortrait player={player} team={{name,color}} size={44}/><span className="pp-copy"><b>{player.player}</b><small>{player.position}{player.role?' · '+player.role:''}</small></span><span className="pp-rating">{player.current}<small>OVR</small></span></button>)}</div>
  </div>;
}

function LiveGameScreen({universe,game,onCheckpoint,onSkip,onNext,onPlayer,onTeam,onBrowse}) {
  if(!universe.showcase?.active||!game) return <section className="panel live-game-empty"><Icon name="live" size={34}/><h2>No live game right now</h2><p>The games you picked to watch (finals or semifinals) appear here once the season reaches the postseason. Their results stay hidden until you play or skip them.</p><button className="button primary" onClick={onBrowse}>Back to world</button></section>;
  return <GameShowcaseView game={game} index={universe.showcase.currentIndex} total={universe.showcase.games.length} onCheckpoint={onCheckpoint} onSkip={onSkip} onNext={onNext} onPlayer={onPlayer} onTeam={onTeam} onClose={onBrowse}/>;
}

function GameShowcaseView({ game, index, total, onCheckpoint, onSkip, onNext, onPlayer, onTeam, onClose }) {
  const [tick, setTick] = useState(game.completedTicks ?? 0);
  const [playing, setPlaying] = useState(false);
  const [targetTick, setTargetTick] = useState(null);
  const [speed, setSpeed] = useState(2);
  useEffect(() => { setTick(game.completedTicks ?? 0); setPlaying(false); setTargetTick(null); }, [game.id]);
  useEffect(() => {
    if(!playing || targetTick==null) return undefined;
    const timer=setInterval(()=>setTick((value)=>Math.min(value+1,targetTick)),Math.max(80,Math.round(440/speed)));
    return ()=>clearInterval(timer);
  },[playing,targetTick,game.id,speed]);
  useEffect(() => {
    if(playing && targetTick!=null && tick>=targetTick){ setPlaying(false); setTargetTick(null); onCheckpoint(tick); }
  },[tick,playing,targetTick]);
  const totalTicks=game.timeline.length;
  const final=tick>=totalTicks;
  const current=tick>0?game.timeline[Math.min(tick,totalTicks)-1]:{scoreA:0,scoreB:0,deltaA:0,deltaB:0,period:1,periodLabel:game.periodLabels[0],remaining:game.periodMinutes};
  if(final) return <FinalResultView game={game} index={index} total={total} onNext={onNext} onPlayer={onPlayer} onClose={onClose}/>;
  const [ca, cb] = teamColorPair(game.teamAColor, game.teamBColor);
  const nextPeriodIndex=Math.min(game.periodLabels.length-1,Math.floor(tick/game.periodMinutes));
  const periodEnded=tick>0&&tick%game.periodMinutes===0;
  const lastPeriodLabel=game.periodLabels[Math.max(0,nextPeriodIndex-1)];
  const clock=periodEnded?'0:00':`${current.remaining}:00`;
  const periodText=tick===0?'Tip-off':periodEnded?`End of ${lastPeriodLabel}`:current.periodLabel;
  const flow=gameFlowFacts(game,tick);
  const lead=current.scoreA-current.scoreB;
  const leadSide=lead>0?'a':lead<0?'b':'tie';
  const leadText=tick===0?'Not started':lead===0?'Tied':`${lead>0?game.teamA:game.teamB} by ${Math.abs(lead)}`;
  const tugShare=Math.min(50,Math.abs(lead)/20*50);
  const status=playing?'live':periodEnded?'break':tick===0?'pre':'paused';
  const statusLabel={live:`Live · ${speed}×`,break:'Break',pre:'Pre-game',paused:'Paused'}[status];
  const playNextPeriod=()=>{const target=Math.min(totalTicks,(Math.floor(tick/game.periodMinutes)+1)*game.periodMinutes);setTargetTick(target);setPlaying(true);};
  const pause=()=>{setPlaying(false);setTargetTick(null);onCheckpoint(tick);};
  const skip=()=>{setPlaying(false);setTargetTick(null);setTick(totalTicks);onSkip();};
  const browse=()=>{if(playing) pause(); else onCheckpoint(tick); onClose();};
  const popA=tick>0&&current.deltaA>0, popB=tick>0&&current.deltaB>0;
  const teamSide=(side)=>{
    const isA=side==='a'; const name=isA?game.teamA:game.teamB; const id=isA?game.teamAId:game.teamBId; const color=isA?ca:cb;
        return <button className={`lh-team ${side}`} onClick={()=>onTeam?.(id)}>
      <TeamBadge team={{name,color}} size={76}/>
      <span className="lh-team-copy"><strong>{name}</strong><span className="lh-lead-slot">{leadSide===side?<em className="lh-leading">Leading</em>:null}</span></span>
    </button>;
  };
  return <div className="showcase-page">
    <section className={`live-hero lead-${leadSide} status-${status}`} style={{'--team-a':ca,'--team-b':cb}}>
      <div className="lh-top">
        <span className="lh-comp">{game.competition} · {game.round}{game.competitionId==='nba'?` · Game ${game.gameNumber}`:''}</span>
        <span className="lh-count">Showcase {index+1} of {total}</span>
        <span className={`lh-status ${status}`}><i/>{statusLabel}</span>
      </div>
      <div className="lh-board">
        {teamSide('a')}
        <div className={`lh-score a ${leadSide==='a'?'is-lead':leadSide==='b'?'is-trail':''}`}><span className="lh-num">{current.scoreA}</span><span className="lh-pop-slot">{popA&&<em className="lh-pop" key={`a-${tick}`}>+{current.deltaA}</em>}</span></div>
        <div className="lh-center">
          <strong className="lh-clock">{clock}</strong>
          <span className="lh-period">{periodText}</span>
          <span className="lh-moment-slot">{flow.moment&&<em className={`lh-moment ${flow.moment.type}`} key={`${flow.moment.type}-${tick}`}>{flow.moment.label}</em>}</span>
        </div>
        <div className={`lh-score b ${leadSide==='b'?'is-lead':leadSide==='a'?'is-trail':''}`}><span className="lh-num">{current.scoreB}</span><span className="lh-pop-slot">{popB&&<em className="lh-pop" key={`b-${tick}`}>+{current.deltaB}</em>}</span></div>
        {teamSide('b')}
      </div>
      <div className="tug" role="img" aria-label={leadText}>
        <span className="tug-name a">{shortTeamName(game.teamA)}</span>
        <div className="tug-track"><span className="tug-fill a" style={{width:`${leadSide==='a'?tugShare:0}%`}}/><span className="tug-fill b" style={{width:`${leadSide==='b'?tugShare:0}%`}}/><i className="tug-mid"/></div>
        <span className="tug-name b">{shortTeamName(game.teamB)}</span>
        <strong className={`tug-label ${leadSide}`}>{leadText}</strong>
      </div>
      <div className="lh-periods">{game.periodLabels.map((label,periodIndex)=>{const score=livePeriodScore(game,tick,periodIndex);const state=score?.complete?'complete':periodIndex===nextPeriodIndex&&tick>0&&!periodEnded?'current':'';return <div key={label} className={state}><span>{label}</span><strong>{score?<><b className={score.a>score.b?'won':''}>{score.a}</b>–<b className={score.b>score.a?'won':''}>{score.b}</b></>:'—'}</strong></div>;})}</div>
      <div className="lh-controls">
        {!playing?<button className="button primary lg" onClick={playNextPeriod}><Icon name="play" size={16}/>{tick===0?`Tip off · play ${game.periodLabels[0]}`:`Play ${game.periodLabels[nextPeriodIndex]}`}</button>:<button className="button primary lg" onClick={pause}><Icon name="pause" size={16}/>Pause</button>}
        <div className="speed-controls" role="group" aria-label="Playback speed"><span>Speed</span>{[1,2,4].map((value)=><button key={value} className={speed===value?'active':''} aria-pressed={speed===value} onClick={()=>setSpeed(value)}>{value}×</button>)}</div>
        <span className="lh-spacer"/>
        <button className="button" disabled={playing} onClick={skip}><Icon name="skip" size={15}/>Skip to final</button>
        <button className="button ghost" onClick={browse}>Back to world</button>
      </div>
      <div className="lh-progress" aria-hidden="true"><span style={{width:`${tick/Math.max(1,totalTicks)*100}%`}}/></div>
    </section>
    {tick===0&&<section className="panel preview-panel"><div className="section-header"><h2>Players to watch</h2><span>Final score stays hidden until you play or skip</span></div><div className="showcase-preview-matchup"><ShowcaseTeamPreview name={game.teamA} color={ca} rows={game.boxA} teamId={game.teamAId} onPlayer={onPlayer} onTeam={onTeam}/><ShowcaseTeamPreview name={game.teamB} color={cb} rows={game.boxB} teamId={game.teamBId} onPlayer={onPlayer} onTeam={onTeam} align="right"/></div></section>}
    {tick>0&&<GameFlowPanel game={game} tick={tick}/>}
    {tick>0&&<LiveGameLeaders game={game} tick={tick} current={current} onPlayer={onPlayer}/>}
  </div>;
}

function GameBox({ team, score, rows, onPlayer }) {
  return <section className="panel game-box"><div className="section-header"><h2>{team}</h2><strong>{score}</strong></div><div className="table-wrap"><table className="compact-table"><thead><tr><th>Player</th><th>PTS</th><th>OREB</th><th>DREB</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th></tr></thead><tbody>{rows.map((row)=><tr key={row.playerId} className="clickable" onClick={()=>onPlayer(row.playerId)}><td><strong>{row.player}</strong><br/><small>{row.position} · {row.current} OVR</small></td><td><strong>{row.points}</strong></td><td>{row.orpg}</td><td>{row.drpg}</td><td>{row.rebounds}</td><td>{row.assists}</td><td>{row.steals}</td><td>{row.blocks}</td></tr>)}</tbody></table></div></section>;
}

function SaveHome({ slots, onContinue, onNew, onDelete, status }) {
  const rows = [1, 2, 3].map((slot) => ({ slot, record: slots.find((item) => item.slot === slot) }));
  return <div className="save-home"><header><span className="home-mark"><Icon name="ball" size={30}/></span><h1>Basketball World Chronicle</h1><p>Every save is its own basketball universe: clubs, colleges and national teams across six continents, with careers, dynasties and records that build year after year.</p></header><section className="save-slot-grid">{rows.map(({ slot, record }) => <article className={`save-slot ${record ? 'occupied' : 'empty'}`} key={slot}><div className="slot-number">Slot {slot}</div>{record&&<div className="slot-year">{record.year}</div>}{record ? <><h2>{record.name}</h2><div className="slot-season">Week {record.week}</div><p>{record.phase}{record.yearReview ? ' · Year review' : ''} · v{record.version ?? 7}</p>{(record.version ?? 7) < 12 && <small className="legacy-save-note">Older world: playable. v1.01 upgrades this world with the Live Game hub, spoiler-safe showcases, broader team browsing and the Americas Champions League.</small>}<small>Saved {new Date(record.updatedAt).toLocaleString()}</small><div className="slot-actions"><button className="button primary" onClick={() => onContinue(slot)}>Continue</button><button className="button" onClick={() => onNew(slot)}>New universe</button><button className="button danger" onClick={() => onDelete(slot)}>Delete</button></div></> : <><h2>Empty slot</h2><p>Start a new world. History begins in week one.</p><div className="slot-actions"><button className="button primary" onClick={() => onNew(slot)}>Start new universe</button></div></>}</article>)}</section>{status && <div className="home-status">{status}</div>}</div>;
}


function Breadcrumbs({ route, universe, teamById, playerById }) {
  const crumbs = [{ label: 'World', path: 'world' }];
  const add = (label, path) => { if (label && !crumbs.some((item) => item.path === path)) crumbs.push({ label, path }); };
  if (route.page === 'region') add(route.id, `region/${encodeURIComponent(route.id)}`);
  if (route.page === 'country') {
    const team = universe.teams.find((item) => item.country === route.id);
    if (team?.region) add(team.region, `region/${encodeURIComponent(team.region)}`);
    add(route.id, `country/${encodeURIComponent(route.id)}`);
  }
  if (['team','national-team'].includes(route.page)) {
    const team = teamById.get(Number(route.id));
    if (team) { add(team.region, `region/${encodeURIComponent(team.region)}`); add(team.country, `country/${encodeURIComponent(team.country)}`); add(team.name, `${team.type === 'National' ? 'national-team' : 'team'}/${team.id}`); }
  }
  if (route.page === 'player') {
    const player = playerById.get(Number(route.id));
    const team = player ? teamById.get(player.teamId) : null;
    if (team) { add(team.region, `region/${encodeURIComponent(team.region)}`); add(team.country, `country/${encodeURIComponent(team.country)}`); add(team.name, `${team.type === 'National' ? 'national-team' : 'team'}/${team.id}`); }
    if (player) add(player.name, `player/${player.id}`);
  }
  if (route.page === 'competition') {
    const competition = getCompetition(route.id);
    if (competition) {
      const region = competition.region === 'Americas' ? 'North America' : competition.region;
      add(region, `region/${encodeURIComponent(region)}`);
      if (competition.country && !['Europe','International','Balkans','Americas','World','USA / Canada'].includes(competition.country)) add(competition.country, `country/${encodeURIComponent(competition.country)}`);
      add(competition.name, `competition/${competition.id}`);
    }
  }
  if (crumbs.length <= 1 && ['world','game','results','tournaments','teams','players','coaches','market','statistics','magazine','almanac'].includes(route.page)) return null;
  return <nav className="breadcrumbs" aria-label="Breadcrumb">{crumbs.map((crumb,index) => <React.Fragment key={crumb.path}><button onClick={() => goToRoute(crumb.path)}>{crumb.label}</button>{index < crumbs.length - 1 && <span>›</span>}</React.Fragment>)}</nav>;
}

function RegionPage({ region, universe, onCompetition, onCountry, onTeam }) {
  const clubs = universe.teams.filter((team) => team.type !== 'National' && team.region === region);
  const nationalTeams = universe.teams.filter((team) => team.type === 'National' && (team.region === region || (region === 'North America' && team.region === 'North America') || (region === 'South America' && team.region === 'South America')));
  const countries = unique([...clubs.map((team) => team.country), ...nationalTeams.map((team) => team.country)]);
  const topCompetitions = COMPETITIONS.filter((competition) => competitionInRegion(competition, region) && (competition.featured || competition.kind === 'continental' || competition.kind === 'international')).sort((a,b)=>b.level-a.level);
  const strongest = [...clubs].sort((a,b)=>b.rating-a.rating).slice(0,8);
  return <><div className="page-heading"><div><div className="kicker"><Flag value={region}/> Basketball region</div><h2>{region}</h2></div><div className="page-note">{countries.length} represented countries · {clubs.length} clubs · {nationalTeams.length} national teams</div></div>
    <SectionHeader title="Top competitions" note="Continental, international and headline tournaments"/><CompetitionCards competitions={topCompetitions} universe={universe} onCompetition={onCompetition}/>
    {region !== 'World' && <><SectionHeader title="Countries" note="Open a domestic basketball ecosystem"/><div className="country-grid">{countries.map((country) => <button key={country} onClick={() => onCountry(country)}><strong><Flag value={country}/> {country}</strong><span>{clubs.filter((team)=>team.country===country).length} clubs · {nationalTeams.some((team)=>team.country===country)?'national team':'club system'}</span></button>)}</div></>}
    {!!strongest.length && <section className="panel section-gap"><SectionHeader title="Strongest clubs" note="Current world rating"/><div className="power-list">{strongest.map((team,index)=><PowerRow key={team.id} team={team} index={index} onTeam={(t)=>onTeam(t.id)}/>)}</div></section>}
  </>;
}

function CountryPage({ country, universe, onCompetition, onTeam, onPlayer }) {
  const clubs = universe.teams.filter((team) => team.country === country && team.type !== 'National').sort((a,b)=>a.tier-b.tier||b.rating-a.rating);
  const national = universe.teams.find((team) => team.country === country && team.type === 'National');
  const region = clubs[0]?.region ?? national?.region ?? 'World';
  const competitions = COMPETITIONS.filter((competition) => competition.country === country || String(competition.country ?? '').split(' / ').includes(country));
  const players = universe.players.filter((player) => player.nationality === country && player.status !== 'Retired').sort((a,b)=>b.current-a.current);
  const abroad = players.filter((player) => { const team = universe.teams.find((item)=>item.id===player.teamId); return team && team.country !== country && team.type !== 'National'; });
  const detailed = DETAILED_COUNTRY_SPECS.some(([item])=>item===country);
  return <><div className="page-heading"><div><div className="kicker"><Flag value={country}/> {region}</div><h2>{country} basketball</h2></div><div className="page-note">{detailed?'Full-detail ecosystem':'High-level domestic ecosystem'} · {clubs.length} clubs · {players.length} active players</div></div>
    <div className="country-summary-grid"><section className="panel country-national-card"><SectionHeader title="National team" note={national?.selectionCompetition ?? 'International window'}/>{national?<button className="national-team-link" onClick={()=>onTeam(national.id)}><TeamMark team={national} size={58}/><RatingPill value={national.rating}/><div><strong>{national.name}</strong><span>{national.honors.length} titles</span><small>{national.unavailablePlayers?.length ?? 0} notable unavailable players</small></div><b>›</b></button>:<div className="empty-state small">No senior national team record.</div>}</section><section className="panel"><SectionHeader title="Best active players" note="At home and abroad"/>{players.slice(0,6).map((player)=><button className="feature-story" key={player.id} onClick={()=>onPlayer(player.id)}><Rarity value={player.rarity}/><div><strong>{player.name}</strong><p>{player.teamName} · {player.current} OVR</p></div></button>)}</section></div>
    <SectionHeader title="Domestic competitions" note="League, cup, supercup and lower tier where modeled"/><CompetitionCards competitions={competitions} universe={universe} onCompetition={onCompetition}/>
    <section className="panel section-gap"><SectionHeader title="Clubs" note={`${clubs.length} organizations`}/><div className="card-grid four team-card-grid-modern">{clubs.map((team)=><TeamCard key={team.id} team={team} universe={universe} onTeam={onTeam}/>)}</div></section>
    {!!abroad.length && <section className="panel section-gap"><SectionHeader title="Players abroad" note={`${abroad.length} active careers outside ${country}`}/><PlayerTable players={abroad.slice(0,40)} onPlayer={onPlayer} compact/></section>}
  </>;
}

function NationalTeamPage({ team, universe, onBack, onPlayer, onCoach, onCompetition }) {
  const [tab,setTab]=useState('Roster');
  const roster=team.rosterIds.map((id)=>universe.players.find((player)=>player.id===id)).filter(Boolean).sort((a,b)=>POSITION_ORDER.indexOf(a.position)-POSITION_ORDER.indexOf(b.position)||b.current-a.current);
  const coach=[...universe.coaches,...universe.retiredCoaches].find((item)=>item.id===team.coachId);
  const editions=COMPETITIONS.filter((competition)=>competition.kind==='international').flatMap((competition)=>(universe.competitionHistory[competition.id]??[]).filter((season)=>season.standings?.some((row)=>row.teamId===team.id)||season.championTeamId===team.id||season.runnerUpTeamId===team.id).map((season)=>({ ...season, competitionName: competition.name, competitionId: competition.id }))).sort((a,b)=>b.year-a.year);
  return <><DetailHeader onBack={onBack}><div className="modal-title detail-title"><TeamMark team={team} size={68}/><div><div className="kicker"><Flag value={team.country}/> {team.region} · National team</div><h2>{team.name}</h2><p>{team.selectionCompetition ?? 'International window'} · selected for {team.selectionYear ?? universe.year}</p></div></div></DetailHeader>
    <div className="metric-grid detail-metrics"><Metric label="World rating" value={team.rating} detail={`Raw roster ${team.rawRating}`}/><Metric label="Selected roster" value={roster.length} detail="Tournament squad"/><Metric label="International titles" value={team.honors.length} detail="Permanent history"/><Metric label="Unavailable stars" value={team.unavailablePlayers?.length ?? 0} detail="Selection decisions explained"/></div>
    <DetailTabs tabs={['Roster','Availability','History','Honors']} tab={tab} setTab={setTab}/>
    {tab==='Roster'&&<div className="two-column"><section className="panel"><SectionHeader title="Selected squad" note={team.selectionCompetition ?? 'International window'}/><PlayerTable players={roster} onPlayer={onPlayer} compact/></section><section className="panel"><SectionHeader title="National-team leadership" note="Current cycle"/><InfoLine label="Head coach" value={coach?<LinkButton onClick={()=>onCoach(coach.id)}>{coach.name}</LinkButton>:'Unassigned'}/><InfoLine label="Coach style" value={coach?.style??'—'}/><InfoLine label="Selection year" value={team.selectionYear??universe.year}/><InfoLine label="Competition" value={team.selectionCompetition??'International window'}/><InfoLine label="Roster average" value={roster.length?(roster.reduce((sum,p)=>sum+p.current,0)/roster.length).toFixed(1):'—'}/></section></div>}
    {tab==='Availability'&&<section className="panel"><SectionHeader title="Unavailable and omitted players" note="Stars do not automatically attend every tournament"/><div className="availability-list">{(team.unavailablePlayers??[]).map((item)=><button key={item.playerId} onClick={()=>onPlayer(item.playerId)}><div><strong>{item.name}</strong><span>{item.team} · {item.current} OVR</span></div><em>{item.reason}</em></button>)}</div>{!team.unavailablePlayers?.length&&<div className="empty-state">No notable absences recorded for this selection.</div>}</section>}
    {tab==='History'&&<section className="panel"><SectionHeader title="International tournament history" note="Every recorded edition"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Tournament</th><th>Result</th><th>Record</th><th>MVP</th></tr></thead><tbody>{editions.map((season,index)=>{const standing=season.standings?.find((row)=>row.teamId===team.id);const result=season.championTeamId===team.id?'Champion':season.runnerUpTeamId===team.id?'Runner-up':standing?`#${season.standings.findIndex((row)=>row.teamId===team.id)+1}`:'Participated';return <tr key={`${season.competitionId}-${season.year}-${index}`}><td>{season.year}</td><td><LinkButton onClick={()=>onCompetition(season.competitionId)}>{season.competitionName}</LinkButton></td><td>{result}</td><td>{standing?`${standing.wins}–${standing.losses}`:'—'}</td><td>{season.mvp?.name??'—'}</td></tr>;})}</tbody></table></div>{!editions.length&&<div className="empty-state">No completed international edition yet.</div>}</section>}
    {tab==='Honors'&&<><TeamHonorsPanel honors={team.honors}/><FranchiseFivePanel team={team} universe={universe} onPlayer={onPlayer}/></>}</>;
}

function DetailRouter({ detail, universe, teamById, playerById, coachById, onBack, onTeam, onPlayer, onCoach, onCompetition, onToggleFollow }) {
  if (detail.type === 'team') {
    const team = teamById.get(detail.id);
    if (!team) return <NotFoundPage title="Team not found" />;
    if (team.type === 'National') return <NationalTeamPage team={team} universe={universe} onBack={onBack} onPlayer={onPlayer} onCoach={onCoach} onCompetition={onCompetition} />;
    return <TeamPage team={team} universe={universe} onBack={onBack} onPlayer={onPlayer} onCoach={onCoach} onCompetition={onCompetition} />;
  }
  if (detail.type === 'player') { const player = playerById.get(detail.id); return player ? <PlayerPage player={player} universe={universe} onBack={onBack} onTeam={onTeam} onCompetition={onCompetition} onToggleFollow={onToggleFollow} /> : <NotFoundPage title="Player not found" />; }
  if (detail.type === 'coach') { const coach = coachById.get(detail.id); return coach ? <CoachPage coach={coach} universe={universe} onBack={onBack} onTeam={onTeam} /> : <NotFoundPage title="Coach not found" />; }
  const competition = getCompetition(detail.id);
  return competition ? <CompetitionPage competition={competition} universe={universe} onBack={onBack} onPlayer={onPlayer} onTeam={onTeam} /> : <NotFoundPage title="Competition not found" />;
}

function NotFoundPage({ title }) { return <section className="panel"><SectionHeader title={title} note="This route is not available in the active universe."/><button className="button" onClick={() => window.history.back()}>Go back</button></section>; }

function WorldView({ universe, setView, setMarketTab, onTeam, onPlayer }) {
  const nba = universe.teams.filter((team) => team.type === 'NBA');
  const euro = universe.teams.filter((team) => team.secondaryCompetitionIds.includes('euroleague'));
  const ncaa = universe.teams.filter((team) => team.type === 'NCAA');
  const leaders = [...universe.players].filter((player) => player.status === 'Active').sort((a, b) => b.current - a.current).slice(0, 6);
  const topTeams = [...universe.teams].filter((team) => !['NCAA','National'].includes(team.type)).sort((a, b) => b.rating - a.rating).slice(0, 8);
  const avg = (items) => items.reduce((sum, item) => sum + item.rating, 0) / Math.max(1, items.length);
  const leagueStrengths = COMPETITIONS.filter((competition) => ['league','continental'].includes(competition.kind) && isCompetitionActive(competition, universe.year)).map((competition) => {
    const participants = getCompetitionParticipants(universe, competition.id);
    return { competition, teams: participants.length, rating: participants.length ? avg(participants) : 0 };
  }).filter((row) => row.teams >= 4).sort((a,b) => b.rating-a.rating).slice(0,12);
  const stories = buildChronicleStories(universe, universe.year).slice(0, 3);
  const recordLeaders = {
    ppg: careerStatLeaders(universe, 'ppg').slice(0, 3),
    rpg: careerStatLeaders(universe, 'rpg').slice(0, 3),
    apg: careerStatLeaders(universe, 'apg').slice(0, 3),
  };
  const dynastyPreview = [...dynastyRows(universe, 'nba'), ...dynastyRows(universe, 'euroleague')].sort((a,b)=>b.streak-a.streak || b.totalTitles-a.totalTitles).slice(0, 4);
  const headline = stories[0];
  const leagueTop = Math.max(1, ...leagueStrengths.map((row) => row.rating));
  return <>
    <section className="world-hero">
      <div className="world-hero-copy">
        <p className="hero-meta"><Icon name="calendar" size={15}/>Season {universe.year} · Week {universe.week} · {universe.phase}</p>
        {headline ? <>
          <h1>{headline.title}</h1>
          <p>{headline.body}</p>
        </> : <>
          <h1>{universe.week <= 1 && !universe.competitionHistory?.nba?.length ? 'A new basketball world tips off' : 'The world keeps moving'}</h1>
          <p>{nba.length} NBA franchises, {euro.length} EuroLeague clubs and {ncaa.length} college programs are chasing titles across every continent. Advance the calendar to write the first chapter.</p>
        </>}
        <div className="story-actions">
          {headline && (headline.playerId || headline.teamId) && <button className="button primary" onClick={() => headline.playerId ? onPlayer(headline.playerId) : onTeam(headline.teamId)}>Read the story<Icon name="forward" size={15}/></button>}
          <button className={`button ${headline ? '' : 'primary'}`} onClick={() => setView('Tournaments')}>Explore competitions</button>
          <button className="button ghost" onClick={() => setView('The Global Five')}>Story desk</button>
        </div>
      </div>
      <div className="world-hero-stars" aria-label="Best players in the world">
        <h2>World's best right now</h2>
        {leaders.slice(0,3).map((player,index)=><button key={player.id} className={`hero-player-card rarity-surface-${player.rarity.toLowerCase()}`} onClick={()=>onPlayer(player)}>
          <span className="hero-rank">{index+1}</span>
          <PlayerPortrait player={player} size={64}/>
          <span className="hero-player-copy"><strong>{player.name}</strong><small><Flag value={player.nationality}/> {player.position} · {player.teamName}</small><Rarity value={player.rarity}/></span>
          <RatingPill value={player.current}/>
        </button>)}
      </div>
    </section>

    <section className="world-split section-gap">
      <section className="panel">
        <div className="section-header"><h2>Power ranking</h2><button className="text-link" onClick={() => setView('Teams')}>All teams<Icon name="chevron" size={14}/></button></div>
        <div className="power-list">{topTeams.map((team,index) => <PowerRow key={team.id} team={team} index={index} onTeam={onTeam}/>)}</div>
      </section>
      <section className="panel">
        <div className="section-header"><h2>League strength</h2><span>Average team grade</span></div>
        <div className="league-bars">{leagueStrengths.map((row) => <div className="league-bar" key={row.competition.id}>
          <CompetitionEmblem competition={row.competition} size={30}/>
          <span className="league-copy"><strong>{row.competition.name}</strong><small><Flag value={row.competition.region}/> {row.teams} teams</small></span>
          <span className="league-track" aria-hidden="true"><i className={`g-${gradeFor(row.rating).grade.toLowerCase()}`} style={{ width: `${meterPercent(row.rating, 50, Math.max(95, leagueTop))}%` }}/></span>
          <Grade value={Number(row.rating.toFixed(1))} size="sm"/>
        </div>)}</div>
      </section>
    </section>

    <section className="panel section-gap">
      <div className="section-header"><h2>Best players today</h2><button className="text-link" onClick={() => setView('Players')}>All players<Icon name="chevron" size={14}/></button></div>
      <div className="player-mini-grid">{leaders.map((player) => <button className={`mini-player-card rarity-surface-${player.rarity.toLowerCase()}`} key={player.id} onClick={() => onPlayer(player)}><PlayerPortrait player={player} size={58}/><div><strong>{player.name}</strong><span><Flag value={player.nationality}/> {player.position} · {player.teamName}</span><Rarity value={player.rarity}/></div><RatingPill value={player.current}/></button>)}</div>
    </section>

    <section className="atlas-story-desk section-gap"><div className="atlas-panel-head"><div><h2>New chapters</h2><p>The stories that gained weight since the last simulation.</p></div><button onClick={()=>setView('The Global Five')}>Story desk<Icon name="chevron" size={14}/></button></div><div className="atlas-story-grid">{stories.map((story)=><StoryCard key={story.key} story={story} onPlayer={onPlayer} onTeam={onTeam}/>)}</div>{!stories.length&&<div className="atlas-empty">Sim the season forward and the first defining stories land here.</div>}</section>

    <section className="atlas-archive-grid section-gap">
      <section className="atlas-panel"><div className="atlas-panel-head"><div><h2>Records in reach</h2><p>Career leaders across every recorded season.</p></div><button onClick={()=>goToRoute('statistics')}>Record boards<Icon name="chevron" size={14}/></button></div><div className="record-columns">{Object.entries(recordLeaders).map(([key,rows])=><div key={key}><strong>{{ppg:'Points',rpg:'Rebounds',apg:'Assists'}[key]}</strong>{rows.map((row,index)=><button key={row.playerId} onClick={()=>onPlayer(row.playerId)}><span>{index+1}</span><b>{row.player}</b><em>{formatNumber(row.value)}</em></button>)}{!rows.length&&<p className="atlas-empty">No seasons recorded yet.</p>}</div>)}</div></section>
      <section className="atlas-panel dynasty-panel"><div className="atlas-panel-head"><div><h2>Dynasties in motion</h2><p>Great teams change the map over years, not games.</p></div><button onClick={()=>goToRoute('almanac')}>Dynasty archive<Icon name="chevron" size={14}/></button></div><div className="dynasty-trails">{dynastyPreview.map((row)=><div key={`${row.teamId}-${row.start}`}><strong>{row.team}</strong><span>{row.start}–{row.end}</span><i style={{'--trail':Math.min(100, row.streak * 20)}}><b/></i><em>{row.streak} straight · {row.totalTitles} titles</em></div>)}{!dynastyPreview.length&&<p className="atlas-empty">Complete seasons to establish the first dynasty trail.</p>}</div></section>
    </section>

    <section className="atlas-history-band section-gap" aria-label="Career routes">
      <div className="atlas-history-grid">
        <article className="atlas-route-card"><h3>One world. Connected paths.</h3><p>From college breakout to EuroLeague stardom to an NBA peak, every player leaves a route worth revisiting.</p><button className="button" onClick={()=>setView('Careers')}>Remarkable careers<Icon name="forward" size={15}/></button></article>
        <article className="atlas-route-visual"><img src={`${import.meta.env.BASE_URL || '/'}assets/plates/career-route.png`} alt="Three players on a route from college to Europe to the NBA"/></article>
      </div>
    </section>
  </>;
}

function ResultsView({ universe, onPlayer, onTeam, onCompetition }) {
  const [region, setRegion] = useState('Europe');
  const active = COMPETITIONS.filter((competition) => isCompetitionActive(competition, universe.year) || universe.competitionHistory[competition.id]?.[0]?.year === universe.year)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.level - a.level || String(a.name).localeCompare(String(b.name)));
  const regions = ['Europe','North America','South America','Asia','Oceania','Africa','World'];
  const competitions = active.filter((competition) => competitionInRegion(competition, region));
  return <><div className="page-heading"><div><div className="kicker">Results and award races</div><h2>{universe.yearReview ? 'Official year-end awards' : 'Current tournament leaders'}</h2></div><div className="page-note">Every active competition has a live MVP race and statistical leaders. At year review these cards lock into the official awards.</div></div>
    <div className="tabs result-region-tabs">{regions.map((item) => <button key={item} className={region === item ? 'active' : ''} onClick={() => setRegion(item)}><Flag value={item}/> {item}</button>)}</div>
    <div className="competition-leader-grid">{competitions.map((competition) => {
      const official = universe.yearReview ? universe.competitionHistory[competition.id]?.find((season) => season.year === universe.year) : null;
      const leaders = currentLeaders(universe, competition);
      const participants = getCompetitionParticipants(universe, competition.id);
      const item = official ? { mvp: official.mvp, points: official.leaders.points, rebounds: official.leaders.rebounds, champion: official.champion, championTeamId: official.championTeamId } : leaders;
      return <article className="panel competition-leader-card" key={competition.id}><button className="card-title-link" onClick={() => onCompetition(competition)}><span><Flag value={competition.country || competition.region}/> {competition.country}</span><strong>{competition.name}</strong><small>{participants.length || official?.standings?.length || 0} teams · {official ? 'Official awards' : 'Live race'}</small></button>{official && <div className="result-champion">Champion <LinkButton onClick={() => onTeam(item.championTeamId)}>{item.champion}</LinkButton></div>}<LeaderLine label={official ? 'MVP' : 'MVP race'} person={item.mvp} onPlayer={onPlayer}/><LeaderLine label="Top scorer" person={item.points} suffix={item.points ? `${official ? item.points.value : item.points.stats.ppg} PPG` : null} onPlayer={onPlayer}/><LeaderLine label="Top rebounder" person={item.rebounds} suffix={item.rebounds ? `${official ? item.rebounds.value : item.rebounds.stats.rpg} RPG` : null} onPlayer={onPlayer}/></article>;
    })}</div>
    {!competitions.length && <div className="empty-state">No competition is active in this region this season.</div>}
  </>;
}
function LeaderLine({ label, person, suffix, onPlayer }) { if (!person) return <div className="leader-line"><span>{label}</span><strong>—</strong></div>; const id = person.id; const name = person.name; const team = person.team ?? person.teamName; return <button className="leader-line clickable-line" onClick={() => onPlayer(id)}><span>{label}</span><div><strong>{name}</strong><small>{team}{suffix != null ? ` · ${suffix}` : ''}</small></div></button>; }

function TournamentsView({ universe, onCompetition, onRegion, onCountry }) {
  const regions = ['Europe','North America','South America','Asia','Oceania','Africa','World'];
  return <><div className="page-heading"><div><div className="kicker">Tournament universe</div><h2>Browse the world as a connected basketball web</h2></div><div className="page-note">Open a continent, then a country, competition, team, player or national team. Browser Back and Forward preserve the entire path.</div></div>
    <div className="region-web-grid">{regions.map((region) => {
      const countryCount = unique(universe.teams.filter((team) => team.type !== 'National' && team.region === region).map((team) => team.country)).length;
      const comps = COMPETITIONS.filter((competition) => competitionInRegion(competition, region) && (competition.featured || competition.kind === 'continental' || competition.kind === 'international')).slice(0,4);
      return <button className="region-web-card" key={region} onClick={() => onRegion(region)}><span className="region-web-flag"><Flag value={region}/></span><div><h3>{region}</h3><p>{countryCount} club countries · {comps.length} headline competitions</p><div className="mini-chip-row">{comps.map((competition) => <span key={competition.id}>{competition.name}</span>)}</div></div><b>›</b></button>;
    })}</div>
    <section className="panel section-gap"><SectionHeader title="Headline competitions" note="Open directly or explore through their continent"/><CompetitionCards competitions={COMPETITIONS.filter((competition) => competition.featured && isCompetitionActive(competition, universe.year)).sort((a,b)=>b.level-a.level)} universe={universe} onCompetition={onCompetition}/></section>
    <section className="panel section-gap"><SectionHeader title="Detailed basketball countries" note={`${DETAILED_COUNTRY_SPECS.length} complete domestic ecosystems`}/><div className="country-grid">{DETAILED_COUNTRY_SPECS.map(([country,region]) => <button key={country} onClick={() => onCountry(country)}><strong><Flag value={country}/> {country}</strong><span>{region} · {universe.teams.filter((team)=>team.country===country&&team.type!=='National').length} clubs</span></button>)}</div></section>
  </>;
}

function CompetitionCards({ competitions, universe, onCompetition }) { return <div className="card-grid three competition-grid-modern">{competitions.map((competition) => { const teams = getCompetitionParticipants(universe, competition.id); const locked=competitionResultLocked(universe,competition.id); const latest = latestVisibleSeason(universe,competition.id); const active = isCompetitionActive(competition, universe.year); return <button className="competition-card competition-button modern-competition-card" key={competition.id} onClick={() => onCompetition(competition)}><div className="competition-visual-head"><CompetitionEmblem competition={competition} size={60}/><div><div className="kicker"><Flag value={competition.country || competition.region}/> {competition.country || competition.region} · {competition.kind}</div><h3>{competition.name}</h3></div></div><div className="competition-card-meta"><strong>{teams.length || latest?.standings?.length || 0} teams</strong><span className={active?'live-chip':''}>{active ? '● Active now' : competition.frequency ? `Every ${competition.frequency} years` : competition.detail}</span></div><div className="mini-badge-row">{teams.slice(0,6).map(team=><TeamMark team={team} size={28} key={team.id}/>)}</div><p>{locked ? 'Current postseason result hidden until its selected showcase games are played.' : latest ? `${latest.year}: ${latest.champion} · MVP ${latest.mvp.name}` : 'No completed edition yet.'}</p></button>; })}</div>; }

function TeamsView({ universe, onTeam }) {
  const [region, setRegion] = useState('All');
  const [country, setCountry] = useState('All');
  const [competition, setCompetition] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE=24;
  const regions=['All',...unique(universe.teams.filter((team)=>team.type!=='National').map((team)=>team.region))];
  const regionalTeams=universe.teams.filter((team)=>team.type!=='National'&&(region==='All'||team.region===region));
  const countries=['All',...unique(regionalTeams.map((team)=>team.country))];
  const safeCountry=countries.includes(country)?country:'All';
  const scopedTeams=regionalTeams.filter((team)=>safeCountry==='All'||team.country===safeCountry);
  const competitions=unique(scopedTeams.flatMap((team)=>[team.competition,...(team.secondaryCompetitions??[])]));
  const shown=scopedTeams.filter((team)=>(competition==='All'||team.competition===competition||team.secondaryCompetitions?.includes(competition))&&team.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.rating-a.rating||a.name.localeCompare(b.name));
  const pages=Math.max(1,Math.ceil(shown.length/PAGE_SIZE)); const safePage=Math.min(page,pages); const pageRows=shown.slice((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE);
  const reset=()=>setPage(1);
  return <><div className="page-heading"><div><div className="kicker">Teams</div><h2>All-world club browser</h2></div><div className="page-note">Remove geography filters entirely, browse a continent, or drill into one country. {shown.length} teams match.</div></div>
    <div className="tabs">{regions.map((item)=><button key={item} className={region===item?'active':''} onClick={()=>{setRegion(item);setCountry('All');setCompetition('All');reset();}}>{item==='All'?<Icon name="globe" size={15}/>:<Flag value={item}/>} {item}</button>)}</div>
    <div className="tabs countries">{countries.map((item)=><button key={item} className={safeCountry===item?'active':''} onClick={()=>{setCountry(item);setCompetition('All');reset();}}>{item==='All'?'All countries':<><Flag value={item}/> {item}</>}</button>)}</div>
    <div className="filters compact team-browser-filters"><Filter label="Competition"><select value={competition} onChange={(e)=>{setCompetition(e.target.value);reset();}}><option>All</option>{competitions.map((item)=><option key={item}>{item}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(e)=>{setSearch(e.target.value);reset();}} placeholder="Team name"/></Filter></div>
    <div className="bar-legend"><span>Grade = level in the whole world</span><span className="bl-sep"/>Bars compare a team with its own league:<i className="g-s"/>best<i className="g-a"/>strong<i className="g-b"/>average<i className="g-d"/>below<i className="g-e"/>weakest</div><div className="card-grid four team-card-grid-modern">{pageRows.map((team)=><TeamCard key={team.id} team={team} universe={universe} onTeam={onTeam}/>)}</div>
    {pages>1&&<div className="pagination"><button className="button" disabled={safePage<=1} onClick={()=>setPage((n)=>Math.max(1,n-1))}>← Previous</button><span>Page <strong>{safePage}</strong> of {pages} · {shown.length} teams</span><button className="button" disabled={safePage>=pages} onClick={()=>setPage((n)=>Math.min(pages,n+1))}>Next →</button></div>}
  </>;
}

function PlayersView({ universe, teamById, careerTags, onPlayer }) {
  const [status,setStatus]=useState('Active'); const [arc,setArc]=useState('All'); const [region,setRegion]=useState('All'); const [competition,setCompetition]=useState('All'); const [position,setPosition]=useState('All'); const [rarity,setRarity]=useState('All'); const [search,setSearch]=useState('');
  const allPlayers=status==='Active'?universe.players.filter((player)=>player.status!=='Free Agent'):status==='Free Agents'?universe.players.filter((player)=>player.status==='Free Agent'):status==='Retired'?universe.retiredPlayers:status==='Followed'?[...universe.players,...universe.retiredPlayers].filter((player)=>(universe.followedPlayerIds??[]).includes(player.id)):[...universe.players,...universe.retiredPlayers];
  const competitions=unique(universe.teams.flatMap((team)=>[team.competition,...team.secondaryCompetitions]));
  const shown=allPlayers.filter((player)=>{const team=teamById.get(player.teamId);return(region==='All'||player.region===region)&&(competition==='All'||player.competition===competition||team?.secondaryCompetitions.includes(competition))&&(position==='All'||player.position===position)&&(rarity==='All'||player.rarity===rarity)&&(arc==='All'||(careerTags?.byPlayer.get(player.id)??[]).some((item)=>item.id===arc))&&`${player.name} ${player.teamName} ${player.nationality}`.toLowerCase().includes(search.toLowerCase());}).sort((a,b)=>b.current-a.current);
  const chooseArc=(value)=>{setArc(value);if(value!=='All'&&status==='Active')setStatus('All');};
  return <><div className="page-heading"><div><div className="kicker">People</div><h2>Players</h2></div><div className="page-note">Portraits persist for the entire career; rarity styling stays permanent.</div></div><section className="panel player-browser"><div className="filters six player-filters"><Filter label="Status"><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>Active</option><option>Free Agents</option><option>Retired</option><option>Followed</option><option>All</option></select></Filter><Filter label="Continent"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option>All</option>{unique(allPlayers.map((p)=>p.region)).map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Competition"><select value={competition} onChange={(e)=>setCompetition(e.target.value)}><option>All</option>{competitions.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Position"><select value={position} onChange={(e)=>setPosition(e.target.value)}><option>All</option>{POSITION_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(e)=>setRarity(e.target.value)}><option>All</option>{RARITY_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Career arc"><select value={arc} onChange={(e)=>chooseArc(e.target.value)}><option>All</option>{ARC_DEFINITIONS.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Player, team, country"/></Filter></div><SectionHeader title="Top matching players" note={`${shown.length.toLocaleString()} matching careers`}/><div className="player-card-grid">{shown.slice(0,12).map(player=><button className={`player-visual-card rarity-surface-${player.rarity.toLowerCase()}`} key={player.id} onClick={()=>onPlayer(player)}><PlayerPortrait player={player} team={teamById.get(player.teamId)} size={88}/><div className="player-card-copy"><Rarity value={player.rarity}/><strong>{player.name}</strong><span><Flag value={player.nationality}/> {player.position} · {player.teamName}</span><small>{player.stats.ppg} PPG · {player.stats.rpg} RPG · {player.stats.apg} APG</small></div><RatingPill value={player.current}/></button>)}</div></section><section className="panel section-gap"><SectionHeader title="Player database" note={`Showing first ${Math.min(400,shown.length)}`}/><PlayerTable players={shown.slice(0,400)} onPlayer={onPlayer}/></section></>;
}

function CoachesView({ universe, onCoach, onTeam }) {
  const [section,setSection]=useState('Coaches'); const [status,setStatus]=useState('Active'); const [region,setRegion]=useState('All');
  const coaches=status==='Active'?universe.coaches.filter((coach)=>coach.status==='Active'):status==='Free Agents'?universe.coaches.filter((coach)=>coach.status==='Free Agent'):universe.retiredCoaches;
  const shown=coaches.filter((coach)=>{const team=universe.teams.find((item)=>item.id===coach.teamId);return region==='All'||team?.region===region;}).sort((a,b)=>b.current-a.current);
  const owners=(status==='Former'?universe.formerOwners:universe.owners).filter((owner)=>{const team=universe.teams.find((item)=>item.id===owner.teamId);return region==='All'||team?.region===region;}).sort((a,b)=>(b.recruitment+b.stability+b.development)-(a.recruitment+a.stability+a.development));
  return <><div className="page-heading"><div><div className="kicker">Leadership world</div><h2>Coaches and presidents / owners</h2></div><div className="page-note">Elite coaching is visible, mobile and materially important.</div></div><div className="tabs"><button className={section==='Coaches'?'active':''} onClick={()=>{setSection('Coaches');setStatus('Active');}}>Coaches</button><button className={section==='Owners'?'active':''} onClick={()=>{setSection('Owners');setStatus('Active');}}>Presidents / owners</button></div>
    <section className="panel"><div className="filters compact"><Filter label="Status"><select value={status} onChange={(e)=>setStatus(e.target.value)}>{section==='Coaches'?<><option>Active</option><option>Free Agents</option><option>Retired</option></>:<><option>Active</option><option>Former</option></>}</select></Filter><Filter label="Region"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option>All</option>{unique(universe.teams.map((team)=>team.region)).map((item)=><option key={item}>{item}</option>)}</select></Filter></div>
      {section==='Coaches'?<><SectionHeader title="Coaches" note="Permanent careers, firings, transfers and retirement"/><div className="coach-card-grid">{shown.slice(0,18).map(coach=>{const team=universe.teams.find(t=>t.id===coach.teamId);return <button className={`coach-visual-card rarity-surface-${coach.rarity.toLowerCase()}`} key={coach.id} onClick={()=>onCoach(coach)}><CoachPortrait coach={coach} team={team} size={76}/><div><Rarity value={coach.rarity}/><strong>{coach.name}</strong><span><Flag value={coach.nationality}/> {coach.teamName}</span><small>{coach.style} · Off {coach.offense} · Def {coach.defense}</small></div><RatingPill value={coach.current}/></button>})}</div><div className="table-wrap section-gap"><table><thead><tr><th>Coach</th><th>Team</th><th>Rarity</th><th>Style</th><th>OVR</th><th>Off</th><th>Def</th><th>Dev</th><th>Contract</th></tr></thead><tbody>{shown.map((coach)=><tr className="clickable" key={coach.id} onClick={()=>onCoach(coach)}><td><span className="table-person"><CoachPortrait coach={coach} size={34}/><span><strong>{coach.name}</strong><small><Flag value={coach.nationality}/> {coach.nationality}</small></span></span></td><td>{coach.teamId?<LinkButton onClick={()=>onTeam(coach.teamId)}>{coach.teamName}</LinkButton>:coach.teamName}</td><td><Rarity value={coach.rarity}/></td><td>{coach.style}</td><td><RatingPill value={coach.current} size="sm"/></td><td>{coach.offense}</td><td>{coach.defense}</td><td>{coach.development}</td><td>{coach.contractEnd??'—'}</td></tr>)}</tbody></table></div></>:<><SectionHeader title={status==='Former'?'Completed ownership mandates':'Current presidents / owners'} note={`${owners.length} leadership records`}/><div className="table-wrap"><table><thead><tr><th>President / owner</th><th>Team</th><th>Rarity</th><th>Profile</th><th>Mandate</th><th>Recruitment</th><th>Stability</th><th>Development</th><th>Titles</th></tr></thead><tbody>{owners.map((owner)=><tr key={owner.id}><td><strong>{owner.name}</strong><br/><small><Flag value={owner.nationality}/> {owner.nationality}</small></td><td><LinkButton onClick={()=>onTeam(owner.teamId)}>{owner.teamName}</LinkButton></td><td><Rarity value={owner.rarity}/></td><td>{owner.profile}</td><td>{owner.startYear}–{owner.actualEndYear??owner.endYear}</td><td>{owner.recruitment}</td><td>{owner.stability}</td><td>{owner.development}</td><td>{owner.history.reduce((sum,season)=>sum+(season.titles?.length??0),0)}</td></tr>)}</tbody></table></div></>}</section>
  </>;
}

function MarketView({ universe, tab, setTab, onPlayer, onTeam, onCoach }) {
  const [rarity,setRarity]=useState('All');
  const [search,setSearch]=useState('');
  const [sort,setSort]=useState('Newest');
  const [yearFilter,setYearFilter]=useState('All');
  const [summaryCompetition,setSummaryCompetition]=useState('All');
  const allPlayers=[...universe.players,...universe.retiredPlayers];
  const playerMap=new Map(allPlayers.map((player)=>[player.id,player]));
  const coachMap=new Map([...universe.coaches,...universe.retiredCoaches].map((coach)=>[coach.id,coach]));
  const latestDraft=universe.draftHistory[0]; const latestSpawn=universe.spawnHistory[0]; const latestTalent=universe.talentHistory?.[0]; const latestSummary=universe.offseasonHistory?.[0];
  const tabs=['Offseason Summary','Trades','Transfers','Draft','Rights','Free Agency','Retirements','Hall of Fame','Spawn','Coaches'];
  const years=unique([
    ...universe.transactions.map((item)=>item.year),...universe.retirements.map((item)=>item.year),...universe.draftHistory.map((item)=>item.year),
    ...universe.spawnHistory.map((item)=>item.year),...universe.coachTransactions.map((item)=>item.year),...(universe.offseasonHistory??[]).map((item)=>item.year),...(universe.legacyHistory??[]).map((item)=>item.year),
  ]).sort((a,b)=>Number(b)-Number(a));
  const rarityRank=(value)=>{const index=RARITY_ORDER.indexOf(value);return index<0?999:index;};
  const itemPlayer=(item)=>playerMap.get(item.playerId);
  const itemRarity=(item)=>item.rarity??itemPlayer(item)?.rarity??coachMap.get(item.coachId)?.rarity??null;
  const itemName=(item)=>item.player??item.coach??item.team??itemPlayer(item)?.name??'';
  const itemRating=(item)=>item.current??item.base??itemPlayer(item)?.current??coachMap.get(item.coachId)?.current??0;
  const applyRows=(rows,{yearKey='year'}={})=>rows.filter((item)=>(yearFilter==='All'||String(item[yearKey])===String(yearFilter))&&(rarity==='All'||itemRarity(item)===rarity)&&`${itemName(item)} ${item.from??''} ${item.to??''} ${item.origin??''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>{
    if(sort==='Rarity') return rarityRank(itemRarity(a))-rarityRank(itemRarity(b))||itemRating(b)-itemRating(a);
    if(sort==='Rating') return itemRating(b)-itemRating(a);
    if(sort==='Name') return String(itemName(a)).localeCompare(String(itemName(b)));
    return Number(b[yearKey]??0)-Number(a[yearKey]??0)||itemRating(b)-itemRating(a);
  });
  const sharedControls=<MarketControls rarity={rarity} setRarity={setRarity} search={search} setSearch={setSearch} sort={sort} setSort={setSort} yearFilter={yearFilter} setYearFilter={setYearFilter} years={years}/>;
  const tradeRows=applyRows(universe.transactions.filter((item)=>['NBA trade','Transfer','NBA transfer'].includes(item.type)));
  const transferRows=applyRows(universe.transactions.filter((item)=>!['NBA trade','Transfer','NBA transfer'].includes(item.type)));
  const freeAgents=applyRows(universe.players.filter((player)=>player.status==='Free Agent').map((player)=>({playerId:player.id,player:player.name,rarity:player.rarity,current:player.current,year:universe.year}))).map((item)=>playerMap.get(item.playerId)).filter(Boolean);
  const retirementRows=applyRows(universe.retirements);
  const selectedDraft=yearFilter==='All'?latestDraft:universe.draftHistory.find((item)=>String(item.year)===String(yearFilter));
  const selectedSpawn=yearFilter==='All'?latestSpawn:universe.spawnHistory.find((item)=>String(item.year)===String(yearFilter));
  const selectedTalent=yearFilter==='All'?latestTalent:universe.talentHistory?.find((item)=>String(item.year)===String(yearFilter));
  const selectedSummary=yearFilter==='All'?latestSummary:universe.offseasonHistory?.find((item)=>String(item.year)===String(yearFilter));
  const spawnRows=applyRows((selectedSpawn?.players??[]).map((item)=>({...item,year:selectedSpawn.year})));
  const coachRows=applyRows(universe.coachTransactions);
  const rightsRows=applyRows(universe.draftRights.map((right)=>{const player=playerMap.get(right.playerId);return {...right,year:right.acquiredYear,player:player?.name??'Unknown',rarity:player?.rarity,current:player?.current};}));
  const draftPicks=selectedDraft?applyRows(selectedDraft.picks.map((pick)=>({...pick,year:selectedDraft.year}))):[];
  const summaryTeams=selectedSummary?.teams??[];
  const summaryCompetitions=unique(summaryTeams.flatMap((row)=>row.competitions?.length?row.competitions:[row.competition]).filter(Boolean)).sort((a,b)=>String(a).localeCompare(String(b)));
  const filteredSummaryTeams=summaryCompetition==='All'?summaryTeams:summaryTeams.filter((row)=>(row.competitions?.length?row.competitions:[row.competition]).includes(summaryCompetition));
  const improved=[...filteredSummaryTeams].sort((a,b)=>b.delta-a.delta||b.after-a.after).slice(0,12);
  const worsened=[...filteredSummaryTeams].sort((a,b)=>a.delta-b.delta||a.after-b.after).slice(0,12);
  const selectedLegacy=(yearFilter==='All'?(universe.legacyHistory??[])[0]:(universe.legacyHistory??[]).find((item)=>String(item.year)===String(yearFilter)))??null;
  const legacyRows=(selectedLegacy?[...(selectedLegacy.nbaInductions??[]),...(selectedLegacy.fibaInductions??[]),...(selectedLegacy.jerseyRetirements??[])]:[]).filter((item)=>rarity==='All'||item.rarity===rarity).filter((item)=>`${item.player??''} ${item.team??''} ${item.hall??''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='Rarity'?rarityRank(a.rarity)-rarityRank(b.rarity)||b.score-a.score:sort==='Rating'?b.score-a.score:sort==='Name'?String(a.player).localeCompare(String(b.player)):0);
  return <><div className="page-heading"><div><h2>Market</h2></div><div className="page-note">Draft, trades, free agency and every roster move. The offseason runs in five stages: teams protect their cores, then the draft, trades, coaching changes and free agency decide the summer winners and losers.</div></div>
    {universe.offseason?.active&&<><OffseasonStageSpotlight universe={universe} onPlayer={onPlayer} onTeam={onTeam} onCoach={onCoach}/><div className="offseason-progress compact-stage-progress">{OFFSEASON_STAGES.map((stage,index)=><span key={stage} className={index<universe.offseason.stageIndex?'done':index===universe.offseason.stageIndex?'active':''}>{index+1}. {stage}</span>)}</div></>}
    <div className="tabs market-tabs">{tabs.map((item)=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>
    {tab==='Offseason Summary'&&<><section className="panel"><SectionHeader title={selectedSummary?`${selectedSummary.year} offseason summary`:'Offseason summary'} note="Who improved, who declined and how much movement occurred"/><div className="filters compact market-controls"><Filter label="Offseason"><select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)}><option>All</option>{(universe.offseasonHistory??[]).map((item)=><option key={item.year} value={item.year}>{item.year}</option>)}</select></Filter><Filter label="Competition"><select value={summaryCompetition} onChange={(e)=>setSummaryCompetition(e.target.value)}><option>All</option>{summaryCompetitions.map((item)=><option key={item}>{item}</option>)}</select></Filter></div>{selectedSummary?<><div className="metric-grid detail-metrics"><Metric label="NBA trades" value={selectedSummary.nbaTrades} detail="Completed player-for-player deals"/><Metric label="International transfers" value={selectedSummary.internationalTransfers} detail="Club-to-club moves"/><Metric label="Free-agent signings" value={selectedSummary.freeAgentSignings} detail="Open-market contracts"/><Metric label="NBA international" value={`${selectedSummary.nbaInternationalShare}%`} detail={`${selectedSummary.nbaInternationalPlayers} of 300 modeled roster spots`}/></div><div className="two-column section-gap"><OffseasonTeamMovement title="Most improved" rows={improved} onTeam={onTeam}/><OffseasonTeamMovement title="Biggest declines" rows={worsened} onTeam={onTeam}/></div></>:<div className="empty-state">Complete an offseason to generate the first movement report.</div>}</section></>}
    {tab==='Trades'&&<section className="panel"><SectionHeader title="Trade wire" note={`${tradeRows.length} matching NBA and international trades`}/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Rarity</th><th>Move</th><th>OVR</th><th>Detail</th></tr></thead><tbody>{tradeRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.playerId}-${item.year}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td><Rarity value={itemRarity(item)}/></td><td>{item.from} → {item.to}</td><td>{item.current??itemPlayer(item)?.current??'—'}</td><td>{item.type} · {item.detail}</td></tr>)}</tbody></table></div>{!tradeRows.length&&<div className="empty-state">No matching trades.</div>}</section>}
    {tab==='Transfers'&&<section className="panel"><SectionHeader title="Transaction wire" note="Contract expiry, releases, signings and roster decisions"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Rarity</th><th>Type</th><th>From</th><th>To</th><th>OVR</th></tr></thead><tbody>{transferRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.year}-${item.playerId}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td><Rarity value={itemRarity(item)}/></td><td>{item.type}</td><td>{item.from}</td><td>{item.to}</td><td>{item.current??itemPlayer(item)?.current??'—'}</td></tr>)}</tbody></table></div>{!transferRows.length&&<div className="empty-state">Complete the first offseason to populate the transaction wire.</div>}</section>}
    {tab==='Draft'&&<section className="panel"><SectionHeader title={selectedDraft?`${selectedDraft.year} NBA Draft`:'Draft board'} note={selectedDraft?`${selectedDraft.collegeGraduates} NCAA exits · ${selectedDraft.ncaaPicks} NCAA picks · ${selectedDraft.internationalPicks} international picks · ${selectedDraft.signed} immediate NBA signings`:'No draft completed for this filter'}/>{sharedControls}{selectedDraft?<div className="table-wrap"><table><thead><tr><th>Pick</th><th>Team</th><th>Player</th><th>Rarity</th><th>Pos</th><th>Origin</th><th>Route</th><th>Outcome</th><th>Base</th></tr></thead><tbody>{draftPicks.map((pick)=><tr key={pick.pick}><td><strong>{pick.pick}</strong></td><td><LinkButton onClick={()=>onTeam(pick.teamId)}>{pick.team}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(pick.playerId)}>{pick.player}</LinkButton></td><td><Rarity value={pick.rarity}/></td><td>{pick.position}</td><td>{pick.origin}</td><td>{pick.originType}</td><td>{pick.joinedNBA?'Joined NBA':'Rights retained'}</td><td>{pick.base}</td></tr>)}</tbody></table></div>:<div className="empty-state">Complete the season.</div>}</section>}
    {tab==='Rights'&&<section className="panel"><SectionHeader title="NBA draft rights" note={`${universe.draftRights.filter((right)=>right.active).length} active rights`}/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Player</th><th>Rarity</th><th>Rights team</th><th>Draft</th><th>Current team</th><th>OVR</th><th>Status</th></tr></thead><tbody>{rightsRows.map((right,index)=>{const player=playerMap.get(right.playerId);const team=universe.teams.find((item)=>item.id===right.teamId);return player&&team?<tr key={`${right.playerId}-${index}`}><td><LinkButton onClick={()=>onPlayer(player.id)}>{player.name}</LinkButton></td><td><Rarity value={player.rarity}/></td><td><LinkButton onClick={()=>onTeam(team.id)}>{team.name}</LinkButton></td><td>{right.acquiredYear}</td><td>{player.teamName}</td><td>{player.current}</td><td>{right.active?'Retained':'Activated / expired'}</td></tr>:null;})}</tbody></table></div></section>}
    {tab==='Free Agency'&&<section className="panel"><SectionHeader title="Current free agents" note={`${freeAgents.length} matching unsigned players · expired contracts and NCAA graduates`}/>{sharedControls}<PlayerTable players={freeAgents.slice(0,250)} onPlayer={onPlayer}/>{!freeAgents.length&&<div className="empty-state">No matching unsigned players.</div>}</section>}
    {tab==='Retirements'&&<section className="panel"><SectionHeader title="Retirement and exit ledger" note="Retirement remains distinct from leaving active professional basketball"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Age</th><th>Last team</th><th>Reason</th><th>Rarity</th><th>Honors</th></tr></thead><tbody>{retirementRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.playerId}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td>{item.age}</td><td>{item.lastTeam}</td><td>{item.reason}</td><td><Rarity value={item.rarity}/></td><td>{item.honors}</td></tr>)}</tbody></table></div>{!retirementRows.length&&<div className="empty-state">No matching retirements.</div>}</section>}
    {tab==='Hall of Fame'&&<section className="panel"><SectionHeader title={selectedLegacy?`${selectedLegacy.year} legacy honors`:'Hall of Fame & jersey retirements'} note="Only awarded when a career ends; standards are intentionally severe"/>{sharedControls}{selectedLegacy?<><div className="metric-grid detail-metrics"><Metric label="NBA Hall of Fame" value={(selectedLegacy.nbaInductions??[]).filter((item)=>rarity==='All'||item.rarity===rarity).length} detail="Career-wide NBA achievement"/><Metric label="FIBA Hall of Fame" value={(selectedLegacy.fibaInductions??[]).filter((item)=>rarity==='All'||item.rarity===rarity).length} detail="Club + national-team achievement"/><Metric label="Jerseys retired" value={(selectedLegacy.jerseyRetirements??[]).filter((item)=>rarity==='All'||item.rarity===rarity).length} detail="Extraordinary team-specific legacy"/></div><div className="table-wrap section-gap"><table><thead><tr><th>Year</th><th>Honor</th><th>Player</th><th>Rarity</th><th>Team / Hall</th><th>Legacy score</th><th>Details</th></tr></thead><tbody>{legacyRows.map((item,index)=><tr className="clickable" key={`${item.playerId}-${item.hall??item.teamId}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{selectedLegacy.year}</td><td><strong>{item.hall?`${item.hall} Hall of Fame`:`#${item.number} retired`}</strong></td><td>{item.player}</td><td><Rarity value={item.rarity}/></td><td>{item.hall??<LinkButton onClick={()=>onTeam(item.teamId)}>{item.team}</LinkButton>}</td><td>{item.score}</td><td>{item.hall?(item.summary?`${item.summary.seasons} seasons · ${item.summary.titles} titles · ${item.summary.mvps+item.summary.finalsMvps} major MVPs · ${item.summary.firstFive} best-five · ${item.pillars??'—'} legacy pillars`:`${item.careerYears} recorded seasons`):`${item.seasons} seasons · ${item.titles} titles · ${item.mvps+Number(item.finalsMvps??0)} major MVPs · ${item.firstFive} best-five · ${item.leaders} stat leaders · ${item.pillars??'—'} pillars`}</td></tr>)}</tbody></table></div></>:<div className="empty-state">No eligible careers have ended yet. This should normally stay empty for the first several seasons.</div>}</section>}
    {tab==='Spawn'&&<section className="panel"><SectionHeader title={selectedSpawn?`${selectedSpawn.year} incoming class`:'Spawn system'} note="NBA teams never generate players after universe creation"/>{selectedTalent&&<div className="metric-grid detail-metrics"><Metric label="Epic+ births" value={selectedTalent.totalElite} detail="Permanent rarity assigned at birth"/><Metric label="NCAA elite" value={selectedTalent.ncaaElite} detail={`${selectedTalent.ncaaShare}% of Epic+ class`}/><Metric label="International elite" value={selectedTalent.internationalElite} detail="Club systems outside the NBA"/><Metric label="Rarity changes" value="0" detail="Rarity and base never change"/></div>}{sharedControls}{selectedSpawn?<div className="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th>Route</th><th>Pos</th><th>Nationality</th><th>Rarity</th><th>Identity</th></tr></thead><tbody>{spawnRows.slice(0,600).map((spawn)=><tr key={spawn.playerId}><td><LinkButton onClick={()=>onPlayer(spawn.playerId)}>{spawn.player}</LinkButton></td><td>{spawn.team}</td><td>{spawn.route}</td><td>{spawn.position}</td><td><Flag value={spawn.nationality}/> {spawn.nationality}</td><td><Rarity value={spawn.rarity}/></td><td>{spawn.realIdentity?'Historical pool':'Procedural'}</td></tr>)}</tbody></table></div>:<div className="empty-state">First replacement class appears after year review.</div>}</section>}
    {tab==='Coaches'&&<section className="panel"><SectionHeader title="Coaching market" note="Appointments, firings, expired contracts and retirements"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Coach</th><th>Rarity</th><th>Move</th><th>OVR</th></tr></thead><tbody>{coachRows.slice(0,400).map((item,index)=>{const coach=coachMap.get(item.coachId);return <tr className="clickable" key={`${item.coachId}-${index}`} onClick={()=>onCoach(item.coachId)}><td>{item.year}</td><td><strong>{item.coach}</strong></td><td>{coach?<Rarity value={coach.rarity}/>:'—'}</td><td>{item.type} · {item.from} → {item.to}</td><td>{coach?.current??'—'}</td></tr>;})}</tbody></table></div>{!coachRows.length&&<div className="empty-state">No matching coaching changes yet.</div>}</section>}
  </>;
}
function MarketControls({rarity,setRarity,search,setSearch,sort,setSort,yearFilter,setYearFilter,years}) {return <div className="filters compact market-controls"><Filter label="Year"><select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)}><option>All</option>{years.map((year)=><option key={year} value={year}>{year}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(e)=>setRarity(e.target.value)}><option>All</option>{RARITY_ORDER.map((item)=><option key={item}>{item}</option>)}</select></Filter><Filter label="Sort"><select value={sort} onChange={(e)=>setSort(e.target.value)}><option>Newest</option><option>Rarity</option><option>Rating</option><option>Name</option></select></Filter><Filter label="Search"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Player, team, route"/></Filter></div>}
function OffseasonTeamMovement({title,rows,onTeam}) {return <section className="panel inset-panel"><SectionHeader title={title} note="Rating before → after · key causes"/><div className="rank-list offseason-rank-list">{rows.map((row,index)=>{const bestIn=[...(row.playersIn??[])].sort((a,b)=>Number(b.current)-Number(a.current))[0];const bestOut=[...(row.playersOut??[])].sort((a,b)=>Number(b.current)-Number(a.current))[0];return <button className="rank-row rank-button" key={row.teamId} onClick={()=>onTeam(row.teamId)}><span className="rank-number">{index+1}</span><div className="grow"><strong><Flag value={row.country}/> {row.team}</strong><span>{row.competition} · {row.arrivals} in / {row.departures} out{bestIn?` · + ${bestIn.player} (${bestIn.current})`:''}{row.coachIn?` · coach ${row.coachIn.current}`:''}{!bestIn&&bestOut?` · lost ${bestOut.player} (${bestOut.current})`:''}</span></div><span>{row.before} → {row.after}</span><strong className={row.delta>=0?'positive':'negative'}>{row.delta>=0?'+':''}{row.delta}</strong></button>})}</div></section>}

function playerSeasonRows(player, universe) {
  const rows = [...(player.history ?? [])];
  if (player.status !== 'Retired' && player.stats && !rows.some((season)=>Number(season.year)===Number(universe.year)) && (player.stats.games ?? 0) > 0) {
    rows.push({
      year: universe.year, age: player.age, teamId: player.teamId, team: player.teamName, competitionId: player.competitionId,
      competition: player.competition, current: player.current, games: player.stats.games, minutes: player.stats.minutes,
      ppg: player.stats.ppg, rpg: player.stats.rpg, orpg: player.stats.orpg, drpg: player.stats.drpg, apg: player.stats.apg,
      spg: player.stats.spg, bpg: player.stats.bpg, fg: player.stats.fg, three: player.stats.three, ft: player.stats.ft,
    });
  }
  return rows;
}
function aggregatePlayerStatRow(player, seasons, teamById) {
  if (!seasons.length) return null;
  const games = seasons.reduce((sum, season)=>sum+(season.games??0),0);
  const weighted = (key) => games ? seasons.reduce((sum, season)=>sum+(season[key]??0)*(season.games??0),0)/games : 0;
  const totals = (key) => seasons.reduce((sum, season)=>sum+(season[key]??0)*(season.games??0),0);
  const latest = [...seasons].sort((a,b)=>Number(b.year)-Number(a.year))[0];
  const team = teamById.get(latest.teamId);
  return {
    ...player,
    teamId: latest.teamId, teamName: latest.team, competition: latest.competition, competitionId: latest.competitionId,
    region: team?.region ?? player.region, current: latest.current ?? player.current,
    stats: {
      games,
      minutes: Number(weighted('minutes').toFixed(1)),
      ppg: Number(weighted('ppg').toFixed(1)), rpg: Number(weighted('rpg').toFixed(1)), orpg: Number(weighted('orpg').toFixed(1)), drpg: Number(weighted('drpg').toFixed(1)),
      apg: Number(weighted('apg').toFixed(1)), spg: Number(weighted('spg').toFixed(1)), bpg: Number(weighted('bpg').toFixed(1)),
      fg: Number(weighted('fg').toFixed(1)), three: Number(weighted('three').toFixed(1)), ft: Number(weighted('ft').toFixed(1)),
      pointsTotal: Math.round(totals('ppg')), reboundsTotal: Math.round(totals('rpg')), assistsTotal: Math.round(totals('apg')),
      stealsTotal: Math.round(totals('spg')), blocksTotal: Math.round(totals('bpg')),
    },
  };
}
function StatisticsView({ universe, teamById, onPlayer }) {
  const [scope,setScope]=useState('Season');
  const years=unique([...universe.players,...universe.retiredPlayers].flatMap((player)=>(player.history??[]).map((season)=>season.year)).concat(universe.year)).sort((a,b)=>Number(b)-Number(a));
  const [season,setSeason]=useState(String(universe.year));
  const [region,setRegion]=useState('All');const [competition,setCompetition]=useState('All');const [position,setPosition]=useState('All');const [rarity,setRarity]=useState('All');const [category,setCategory]=useState('ppg');
  const categories={pointsTotal:'Total points',ppg:'Points per game',reboundsTotal:'Total rebounds',rpg:'Rebounds per game',orpg:'Offensive rebounds',drpg:'Defensive rebounds',assistsTotal:'Total assists',apg:'Assists per game',stealsTotal:'Total steals',spg:'Steals per game',blocksTotal:'Total blocks',bpg:'Blocks per game',fg:'Field goal %',three:'Three-point %',ft:'Free throw %',current:'Current ability',base:'Permanent base'};
  const competitions=unique(universe.teams.flatMap((team)=>[team.competition,...team.secondaryCompetitions]));
  const allPlayers=[...universe.players,...universe.retiredPlayers];
  const rows=allPlayers.map((player)=>{
    if (position!=='All'&&player.position!==position) return null;
    if (rarity!=='All'&&player.rarity!==rarity) return null;
    let seasons=playerSeasonRows(player,universe);
    if(scope==='Season') seasons=seasons.filter((item)=>String(item.year)===String(season));
    if(region!=='All') seasons=seasons.filter((item)=>(teamById.get(item.teamId)?.region??player.region)===region);
    if(competition!=='All') seasons=seasons.filter((item)=>item.competition===competition||teamById.get(item.teamId)?.secondaryCompetitions?.includes(competition));
    return aggregatePlayerStatRow(player,seasons,teamById);
  }).filter(Boolean);
  const selectedValue=(player)=>category in player.stats?player.stats[category]:player[category];
  const shown=rows.sort((a,b)=>(selectedValue(b)??0)-(selectedValue(a)??0)).slice(0,250);
  return <section className="panel"><SectionHeader title="Statistics" note={`${scope==='Career'?'Career':'Season '+season} · ${categories[category]} · ${shown.length} ranked players`}/><div className="filters six"><Filter label="Scope"><select value={scope} onChange={(e)=>setScope(e.target.value)}><option>Season</option><option>Career</option></select></Filter>{scope==='Season'&&<Filter label="Season"><select value={season} onChange={(e)=>setSeason(e.target.value)}>{years.map((year)=><option key={year} value={year}>{year}</option>)}</select></Filter>}<Filter label="Continent"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option>All</option>{unique(universe.teams.map((team)=>team.region)).map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Competition"><select value={competition} onChange={(e)=>setCompetition(e.target.value)}><option>All</option>{competitions.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Position"><select value={position} onChange={(e)=>setPosition(e.target.value)}><option>All</option>{POSITION_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(e)=>setRarity(e.target.value)}><option>All</option>{RARITY_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Category"><select value={category} onChange={(e)=>setCategory(e.target.value)}>{Object.entries(categories).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></Filter></div><PlayerTable players={shown} onPlayer={onPlayer} highlight={category}/></section>;
}

function MagazineView({ universe, onPlayer, onTeam }) {
  const [section,setSection]=useState('Magazine'); const storyYears=unique(Object.values(universe.competitionHistory??{}).flatMap((rows)=>rows.map((r)=>r.year))).sort((a,b)=>Number(b)-Number(a)); const [storyYear,setStoryYear]=useState(String(storyYears[0]??universe.year));
  const topPlayers=[...universe.players].filter((p)=>p.status==='Active').sort((a,b)=>b.current-a.current).slice(0,8); const draft=universe.draftHistory[0]; const nbaHall=universe.hallOfFame?.nba??[]; const fibaHall=universe.hallOfFame?.fiba??[]; const cover=topPlayers[0]; const stories=buildChronicleStories(universe,Number(storyYear));
  return <><div className="magazine-header magazine-cover"><div className="magazine-cover-copy"><div className="kicker light">World basketball chronicle</div><h2>The Global Five</h2><p>Only the stories that change careers, franchises and eras make the cover.</p></div>{cover&&<button className="magazine-cover-player" onClick={()=>onPlayer(cover)}><PlayerPortrait player={cover} size={112}/><span>WORLD No. 1</span><strong>{cover.name}</strong><small>{cover.teamName} · {cover.current} OVR</small></button>}</div><div className="tabs section-gap"><button className={section==='Magazine'?'active':''} onClick={()=>setSection('Magazine')}>Magazine</button><button className={section==='Stories'?'active':''} onClick={()=>setSection('Stories')}>Iconic stories</button><button className={section==='Hall of Fame'?'active':''} onClick={()=>setSection('Hall of Fame')}>Hall of Fame</button></div>{section==='Magazine'?<><div className="chronicle-front-grid"><section className="panel"><SectionHeader title="Current power" note="The eight best active players"/><div className="magazine-player-list">{topPlayers.map((p)=><button className="feature-story visual-feature-story" key={p.id} onClick={()=>onPlayer(p)}><PlayerPortrait player={p} size={48}/><div><Rarity value={p.rarity}/><strong>{p.name}</strong><p>{p.teamName} · {p.stats.ppg} PPG · {p.honors.length} honors</p></div><RatingPill value={p.current}/></button>)}</div></section><section className="panel"><SectionHeader title="Latest offseason headline" note="Draft and market context"/>{draft?<article className="feature-copy"><h3>{draft.ncaaPicks} NCAA players and {draft.internationalPicks} international prospects drafted</h3><p>{draft.signed} joined immediately; {draft.rightsStashed} remain connected to NBA rights while developing elsewhere.</p></article>:<div className="empty-state">Complete a season to create the first market story.</div>}{stories.slice(0,3).map((story)=><StoryCard key={story.key} story={story} onPlayer={onPlayer} onTeam={onTeam}/>)}</section></div></>:section==='Stories'?<section className="panel"><div className="section-header"><h2>Iconic moments archive</h2><label className="inline-year-picker">Season <select value={storyYear} onChange={(e)=>setStoryYear(e.target.value)}>{storyYears.map((year)=><option value={year} key={year}>{year}</option>)}</select></label></div><div className="chronicle-story-grid">{stories.map((story)=><StoryCard key={story.key} story={story} onPlayer={onPlayer} onTeam={onTeam}/>)}{!stories.length&&<div className="empty-state">No story cleared the iconic threshold this year.</div>}</div></section>:<div className="two-column"><HallOfFamePanel title="NBA Hall of Fame" rows={nbaHall} onPlayer={onPlayer}/><HallOfFamePanel title="FIBA Hall of Fame" rows={fibaHall} onPlayer={onPlayer}/></div>}</>;
}

function HallOfFamePanel({title,rows,onPlayer}) {return <section className="panel"><SectionHeader title={title} note={`${rows.length} inducted careers`}/><div className="rank-list">{rows.map((entry,index)=><button className="rank-row rank-button" key={`${entry.hall}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><span className="rank-number">{index+1}</span><div className="grow"><strong>{entry.player}</strong><span>{entry.year} · {entry.rarity} · legacy {entry.score}{entry.summary?` · ${entry.summary.titles} titles · ${entry.summary.mvps+entry.summary.finalsMvps} major MVPs · ${entry.summary.firstFive} best-five`:''}</span></div><Rarity value={entry.rarity}/></button>)}</div>{!rows.length&&<div className="empty-state">No eligible retired career yet.</div>}</section>;}
function AlmanacView({ universe, onCompetition }) {
  const [tab,setTab]=useState('Greatness'); const rows=COMPETITIONS.map((competition)=>({competition,seasons:universe.competitionHistory[competition.id]??[]})).filter((row)=>row.seasons.length); const nbaDynasties=dynastyRows(universe,'nba'); const euroDynasties=dynastyRows(universe,'euroleague'); const rivalries=rivalryRows(universe); const nationalPowers=internationalLegacyRows(universe); const coachRows=[...universe.coaches,...universe.retiredCoaches].map((coach)=>({coach,titles:(coach.honors??[]).filter((h)=>h.type==='Champion').length,seasons:(coach.history??[]).length})).sort((a,b)=>b.titles-a.titles||b.seasons-a.seasons).slice(0,15);
  const recordTabs=[['ppg','Career points'],['rpg','Career rebounds'],['apg','Career assists']];
  return <><div className="metric-grid almanac-metrics"><Metric label="Active players" value={formatNumber(universe.players.length)} detail="Including free agents"/><Metric label="Archived careers" value={formatNumber(universe.retiredPlayers.length)} detail="Completed careers"/><Metric label="NBA Hall" value={universe.hallOfFame?.nba?.length??0} detail="Inducted careers"/><Metric label="FIBA Hall" value={universe.hallOfFame?.fiba?.length??0} detail="Inducted careers"/></div><div className="tabs"><button className={tab==='Greatness'?'active':''} onClick={()=>setTab('Greatness')}>Greatness</button><button className={tab==='Records'?'active':''} onClick={()=>setTab('Records')}>Records</button><button className={tab==='Coaches'?'active':''} onClick={()=>setTab('Coaches')}>Coaches</button><button className={tab==='Competitions'?'active':''} onClick={()=>setTab('Competitions')}>Competitions</button></div>{tab==='Greatness'&&<><div className="two-column section-gap"><DynastyPanel title="NBA dynasties" rows={nbaDynasties}/><DynastyPanel title="EuroLeague dynasties" rows={euroDynasties}/></div><RivalryPanel rows={rivalries}/><NationalPowerPanel rows={nationalPowers}/></>}{tab==='Records'&&<><div className="three-column section-gap">{recordTabs.map(([key,title])=><CareerRecordPanel key={key} title={title} rows={careerStatLeaders(universe,key)}/>)}</div><SingleSeasonPanel rows={singleSeasonLeaders(universe,'ppg')}/></>}{tab==='Coaches'&&<section className="panel section-gap"><SectionHeader title="Greatest coaches" note="Championships first, longevity second"/><div className="rank-list">{coachRows.map((row,index)=><div className="rank-row" key={row.coach.id}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.coach.name}</strong><span>{row.coach.rarity} · {row.seasons} seasons</span></div><strong>{row.titles} titles</strong></div>)}</div></section>}{tab==='Competitions'&&<section className="panel section-gap"><SectionHeader title="Competition almanac" note="Latest champion and recorded editions"/><div className="table-wrap"><table><thead><tr><th>Competition</th><th>Region</th><th>Seasons</th><th>Latest champion</th><th>Latest MVP</th></tr></thead><tbody>{rows.map(({competition,seasons})=><tr className="clickable" key={competition.id} onClick={()=>onCompetition(competition)}><td><strong>{competition.name}</strong></td><td>{competition.region}</td><td>{seasons.length}</td><td>{seasons[0].champion}</td><td>{seasons[0].mvp.name}</td></tr>)}</tbody></table></div></section>}</>;
}
function DynastyPanel({title,rows}) {return <section className="panel"><SectionHeader title={title} note="Longest consecutive-title runs"/><div className="rank-list">{rows.map((row,index)=><div className="rank-row" key={`${row.teamId}-${row.start}`}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.team}</strong><span>{row.start===row.end?row.start:`${row.start}–${row.end}`} · {row.totalTitles} total titles</span></div><strong>{row.streak} straight</strong></div>)}</div>{!rows.length&&<div className="empty-state">No completed era yet.</div>}</section>}
function RivalryPanel({rows}) {return <section className="panel section-gap"><SectionHeader title="Postseason rivalries" note="Repeated meetings in the biggest competitions, weighted toward late rounds"/><div className="rivalry-grid">{rows.map((row)=><article key={row.key}><div><strong>{row.teamA}</strong><span>{row.winsA}</span></div><b>vs</b><div><strong>{row.teamB}</strong><span>{row.winsB}</span></div><small>{row.meetings} meetings · {row.majorRounds} major-round meetings · {row.competitions.join(', ')}</small></article>)}</div>{!rows.length&&<div className="empty-state">Rivalries emerge after teams meet repeatedly in major brackets.</div>}</section>}
function NationalPowerPanel({rows}) {return <section className="panel section-gap"><SectionHeader title="National-team empires" note="World/Olympic titles count triple; continental titles add depth"/><div className="rank-list">{rows.map((row,index)=><div className="rank-row" key={`${row.teamId??row.team}-${index}`}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.team}</strong><span>{row.major} World/Olympic · {row.regional} continental</span></div><strong>{row.score} legacy pts</strong></div>)}</div>{!rows.length&&<div className="empty-state">International history is still being written.</div>}</section>}
function SingleSeasonPanel({rows}) {return <section className="panel section-gap"><SectionHeader title="Greatest scoring seasons" note="Highest recorded points-per-game seasons"/><div className="rank-list two-rank-columns">{rows.map((row,index)=><div className="rank-row" key={`${row.playerId}-${row.year}`}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.player}</strong><span>{row.year} · {row.team} · {row.rarity}</span></div><strong>{row.value} PPG</strong></div>)}</div></section>}
function CareerRecordPanel({title,rows}) {return <section className="panel"><SectionHeader title={title} note="Recorded career totals"/><div className="rank-list compact-ranks">{rows.map((row,index)=><div className="rank-row" key={row.playerId}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.player}</strong><span>{row.rarity} · {row.games} games</span></div><strong>{formatNumber(row.value)}</strong></div>)}</div></section>}


function teamStrengthContext(universe, team) {
  const competitionId = team.secondaryCompetitionIds?.includes('euroleague') ? 'euroleague' : team.competitionId;
  const competition = getCompetition(competitionId);
  const peers = getCompetitionParticipants(universe, competitionId).filter((item)=>item.type!=='National');
  return { competitionId, competitionName: competition?.name ?? team.competition, peers };
}
function teamStrengthTone(universe, team, key) {
  const { peers } = teamStrengthContext(universe, team);
  const rows = peers.filter((item)=>Number.isFinite(item.strengthProfile?.[key])).sort((a,b)=>b.strengthProfile[key]-a.strengthProfile[key]);
  if (rows.length < 2) return 'average';
  const index = Math.max(0, rows.findIndex((item)=>item.id===team.id));
  const percentile = index / Math.max(1, rows.length - 1);
  if (percentile <= 0.15) return 'elite';
  if (percentile <= 0.35) return 'strong';
  if (percentile <= 0.65) return 'average';
  if (percentile <= 0.85) return 'weak';
  return 'very-weak';
}
function TeamStrengthProfile({ team, universe, before = null }) {
  const profile = team.strengthProfile ?? { overall: team.rating, perimeter: team.rawRating, interior: team.rawRating, defense: team.rawRating, rebounding: team.rawRating };
  const context = teamStrengthContext(universe, team);
  const items = [
    ['overall','Overall','roster + coach + continuity'],
    ['perimeter','Perimeter','shooting + creation'],
    ['interior','Interior','rim pressure + 2P scoring'],
    ['defense','Defense','perimeter + interior stops'],
    ['rebounding','Rebounding','board control + size'],
  ];
  const toneLabel={elite:'Best in league','strong':'Above average','average':'League average','weak':'Below average','very-weak':'Among the weakest'};
  return <section className="panel team-strength-panel"><SectionHeader title="Team strength" note={`Bar color compares this team with the rest of ${context.competitionName}`}/>
    <div className="strength-layout">
      <div className="strength-overall"><Grade value={team.rating} size="xl"/><span>{gradeFor(team.rating).label}</span><small>World rating: roster, coach and continuity</small></div>
      <div className="strength-rows">{items.slice(1).map(([key,label,detail])=>{const value=profile[key];const prior=before?.[key];const delta=Number.isFinite(prior)&&Number.isFinite(value)?Number((value-prior).toFixed(1)):null;const tone=teamStrengthTone(universe,team,key);return <div className={`strength-row tone-${tone}`} key={key}>
        <div className="strength-row-head"><strong>{label}</strong><small>{detail}</small><span className="strength-tone">{toneLabel[tone]}</span></div>
        <div className="sbar-track lg"><i style={{width:`${meterPercent(value)}%`}}/></div>
        <span className="strength-value">{Number.isFinite(value)?Math.round(value):'—'}{delta!=null&&<em className={delta>=0?'positive':'negative'}>{delta>=0?'+':''}{delta}</em>}</span>
      </div>;})}</div>
    </div>
  </section>;
}
function OffseasonProfileDelta({ row }) {
  const before=row.profileBefore??{};const after=row.profileAfter??{};const fields=[['perimeter','Perimeter'],['interior','Interior'],['defense','Defense'],['rebounding','Rebounding']];
  if(!Object.keys(after).length)return null;
  return <div className="movement-profile-deltas">{fields.map(([key,label])=>{const delta=Number.isFinite(before[key])&&Number.isFinite(after[key])?Number((after[key]-before[key]).toFixed(1)):null;return <span key={key}><b>{label}</b> {before[key]??'—'} → {after[key]??'—'} {delta!=null&&<em className={delta>0?'positive':delta<0?'negative':''}>{delta>=0?'+':''}{delta}</em>}</span>;})}</div>;
}

function TeamPage({ team, universe, onBack, onPlayer, onCoach, onCompetition }) {
  const [tab,setTab]=useState('Overview'); const roster=team.rosterIds.map((id)=>universe.players.find((p)=>p.id===id)).filter(Boolean).sort((a,b)=>POSITION_ORDER.indexOf(a.position)-POSITION_ORDER.indexOf(b.position)||b.current-a.current); const coach=[...universe.coaches,...universe.retiredCoaches].find((item)=>item.id===team.coachId); const owner=[...universe.owners,...universe.formerOwners].find((item)=>item.id===team.ownerId); const locals=roster.filter((p)=>p.nationality===team.country||(team.type==='NBA'&&['USA','Canada'].includes(p.nationality))).length; const stars=[...roster].sort((a,b)=>b.current-a.current).slice(0,3); const era=teamEraStatus(universe,team); const prospects=roster.filter((p)=>p.age<=22).length; const expiring=roster.filter((p)=>p.contract&&Number(p.contract.endYear)<=Number(universe.year)+1).length; const previous=[...(team.history??[])].sort((a,b)=>Number(b.year)-Number(a.year))[0];
  return <><DetailHeader onBack={onBack}><div className="entity-hero team-entity-hero" style={{'--entity-color':team.color}}><TeamMark team={team} size={96} className="hero-badge"/><div className="entity-hero-copy"><div className="kicker"><Flag value={team.country}/> {team.country} · {team.region}</div><h2>{team.name}</h2><p className="linked-competitions"><LinkButton onClick={()=>onCompetition(team.competitionId)}>{team.competition}</LinkButton>{team.secondaryCompetitions.map((name,index)=><React.Fragment key={`${name}-${index}`}><span> · </span><LinkButton onClick={()=>onCompetition(team.secondaryCompetitionIds[index])}>{name}</LinkButton></React.Fragment>)}</p><div className="entity-chip-row"><span className={`team-era team-era-${era.tone}`}>{era.label}</span><span>{team.wins}–{team.losses}</span><span>{team.honors.length} titles</span><span>{team.continuity??0}% continuity</span></div></div><RatingPill value={team.rating} label="WORLD"/></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="World rating" value={team.rating} detail={`Raw roster ${team.rawRating}`}/><Metric label="Record" value={`${team.wins}–${team.losses}`} detail={team.competition}/><Metric label="Titles" value={team.honors.length} detail="Permanent cabinet"/><Metric label="Local players" value={`${locals}/${roster.length}`} detail={`Minimum ${team.localMinimum}`}/><Metric label="Trajectory" value={previous?`${previous.rating} → ${team.rating}`:'New'} detail={era.label}/><Metric label="Young core" value={prospects} detail="Players age 22 or younger"/><Metric label="Expiring" value={expiring} detail="Contracts through next year"/></div><DetailTabs tabs={['Overview','Seasons','Honors','Retired jerseys','Leadership','Transfers']} tab={tab} setTab={setTab}/>
    {tab==='Overview'&&<><TeamStrengthProfile team={team} universe={universe}/><StartingFiveCourt team={team} universe={universe} onPlayer={onPlayer}/><section className="panel section-gap"><SectionHeader title="Franchise core" note="The three assets this team is built around"/><div className="lineup-card-grid">{stars.map(player=><button className={`lineup-player rarity-surface-${player.rarity.toLowerCase()}`} key={player.id} onClick={()=>onPlayer(player)}><PlayerPortrait player={player} team={team} size={82}/><span className="lineup-pos">{player.position}</span><strong>{player.name}</strong><Rarity value={player.rarity}/><small>{player.stats.ppg} PPG · {player.stats.rpg} RPG</small><RatingPill value={player.current}/></button>)}</div></section><div className="two-column detail-columns section-gap"><section className="panel"><SectionHeader title="Current roster" note={`${roster.length} players`}/><PlayerTable players={roster} onPlayer={onPlayer} compact/></section><section className="panel team-identity-panel"><SectionHeader title="Current identity" note="Leadership affects performance and recruitment"/>{coach&&<button className="identity-person-card" onClick={()=>onCoach(coach.id)}><CoachPortrait coach={coach} team={team} size={64}/><div><small>HEAD COACH</small><strong>{coach.name}</strong><span>{coach.style} · {coach.current} OVR</span></div></button>}<InfoLine label="President / owner" value={owner?`${owner.name} · ${owner.profile}`:'Unassigned'}/><InfoLine label="Owner rarity" value={owner?.rarity??'—'}/><InfoLine label="Prestige" value={team.prestige}/><InfoLine label="Continuity" value={`${team.continuity??0}%`}/><InfoLine label="Tier" value={team.tier===2?'Second tier':'Top tier'}/><InfoLine label="NCAA alumni" value={roster.filter((p)=>p.originRoute==='NCAA').length}/></section></div></>}
    {tab==='Seasons'&&<section className="panel"><SectionHeader title="Annual team breakdown" note="Coach, owner, record, rating and titles"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Competition</th><th>Record</th><th>Rating</th><th>Coach</th><th>Owner</th><th>Titles</th></tr></thead><tbody>{[...team.history].reverse().map((season,index)=>{const c=[...universe.coaches,...universe.retiredCoaches].find((item)=>item.id===season.coachId);const o=[...universe.owners,...universe.formerOwners].find((item)=>item.id===season.ownerId);return <tr key={`${season.year}-${index}`}><td><strong>{season.year}</strong></td><td>{season.competition}</td><td>{season.wins}–{season.losses}</td><td>{season.rating}</td><td>{c?.name??'—'}</td><td>{o?.name??'—'}</td><td>{season.titles.join(', ')||'—'}</td></tr>;})}</tbody></table></div></section>}
    {tab==='Honors'&&<TeamHonorsPanel honors={team.honors}/>} {tab==='Retired jerseys'&&<RetiredJerseysPanel team={team} onPlayer={onPlayer}/>} {tab==='Leadership'&&<div className="two-column"><section className="panel"><SectionHeader title="Head coach" note="Current appointment"/>{coach?<><div className="identity-person-card static"><CoachPortrait coach={coach} team={team} size={88}/><div><Rarity value={coach.rarity}/><strong>{coach.name}</strong><span>{coach.style} · {coach.current} OVR</span></div></div><InfoLine label="Offense / defense" value={`${coach.offense} / ${coach.defense}`}/><InfoLine label="Development" value={coach.development}/><InfoLine label="Contract through" value={coach.contractEnd}/></>:<div className="empty-state">Vacant</div>}</section><section className="panel"><SectionHeader title="President / owner" note="Mandate and bonuses"/>{owner?<><InfoLine label="Name" value={owner.name}/><InfoLine label="Profile" value={owner.profile}/><InfoLine label="Rarity" value={owner.rarity}/><InfoLine label="Mandate" value={`${owner.startYear}–${owner.endYear}`}/><InfoLine label="Recruitment / stability" value={`${owner.recruitment} / ${owner.stability}`}/></>:<div className="empty-state">Vacant</div>}<h3 className="subheading">Past mandates</h3>{team.leadershipHistory.slice(0,10).map((item)=><div className="info-line" key={item.ownerId}><span>{item.startYear}–{item.endYear}</span><strong>{item.name} · {item.rarity}</strong></div>)}</section></div>} {tab==='Transfers'&&<TeamMovementHistory team={team} universe={universe} onPlayer={onPlayer} onCoach={onCoach}/>}</>;
}

const ARC_LEAGUE_CLASS = { NBA:'nba', 'G League':'gleague', NCAA:'ncaa', Europe:'europe', Other:'other' };
function CareerPathStrip({ player, teams, compact = false }) {
  const stints = careerStints(player, teams);
  if (!stints.length) return null;
  const shown = compact && stints.length > 6 ? [...stints.slice(0, 2), null, ...stints.slice(-3)] : stints;
  return <ol className={`career-path-strip ${compact ? 'compact' : ''}`} aria-label="Career path">{shown.map((stint, index) => stint ? <li key={`${stint.teamId}-${stint.from}`} className={`path-${ARC_LEAGUE_CLASS[stint.league] ?? 'other'}`} style={{ '--stint-color': stint.color || '#6e756f' }}><span className="path-league">{stint.league === 'Other' ? (stint.country ?? 'Club') : stint.league}</span><strong>{stint.team}</strong>{!compact && <small>{stint.from === stint.to ? stint.from : `${stint.from}–${String(stint.to).slice(-2)}`} · {stint.seasons} season{stint.seasons === 1 ? '' : 's'}</small>}</li> : <li key={`gap-${index}`} className="path-gap">…</li>)}</ol>;
}

function CareersView({ universe, careerTags, onPlayer }) {
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState('crossover');
  const [limit, setLimit] = useState(12);
  const teams = careerTags?.teams ?? teamIndex(universe);
  const boards = useMemo(() => careerRecordBoards(universe, teams), [careerTags]);
  const matches = (player) => status === 'All' || (status === 'Active' ? !player.retiredYear : !!player.retiredYear);
  const rowsFor = (id) => (careerTags?.byArc.get(id) ?? []).filter((row) => matches(row.player));
  const definition = ARC_DEFINITIONS.find((item) => item.id === selected) ?? ARC_DEFINITIONS[0];
  const rows = rowsFor(definition.id);
  const pick = (id) => { setSelected(id); setLimit(12); };
  return <>
    <div className="page-heading"><div><div className="kicker">Chronicle</div><h2>Remarkable Careers</h2></div><div className="page-note">Every career in this world, active and retired, sorted into the stories it tells.</div></div>
    <div className="tabs section-gap">{['All','Active','Retired'].map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}</div>
    <section className="arc-tile-grid" aria-label="Career arcs">{ARC_DEFINITIONS.map((item) => { const count = rowsFor(item.id).length; return <button key={item.id} className={`arc-tile ${selected === item.id ? 'active' : ''} ${count ? '' : 'empty'}`} onClick={() => pick(item.id)}><span className="arc-tile-icon"><Icon name={ARC_ICONS[item.id]} size={22}/></span><strong>{item.label}</strong><span className="arc-tile-count">{count ? count.toLocaleString() : 'Not yet seen'}</span></button>; })}</section>
    <section className="panel section-gap">
      <SectionHeader title={definition.label} note={`${rows.length.toLocaleString()} careers · ${definition.blurb}`}/>
      {rows.length ? <div className="arc-career-grid">{rows.slice(0, limit).map(({ player, arc }) => <button key={player.id} className={`arc-career-card rarity-surface-${player.rarity.toLowerCase()}`} onClick={() => onPlayer(player)}>
        <div className="arc-career-head"><PlayerPortrait player={player} team={teams.get(player.teamId)} size={64}/><div><Rarity value={player.rarity}/><strong>{player.name}</strong><span><Flag value={player.nationality}/> {player.nationality} · {player.position} · {player.retiredYear ? `Retired ${player.retiredYear}` : player.teamName}</span></div></div>
        <p className="arc-career-detail">{arc.detail}</p>
        <CareerPathStrip player={player} teams={teams} compact/>
        {(careerTags.byPlayer.get(player.id) ?? []).length > 1 && <div className="arc-badge-row small">{careerTags.byPlayer.get(player.id).filter((item) => item.id !== arc.id).map((item) => <span key={item.id} className="arc-badge" title={item.blurb}><Icon name={ARC_ICONS[item.id]} size={13}/>{item.label}</span>)}</div>}
      </button>)}</div> : <div className="empty-state">No career in this world fits this story yet. Keep simulating, or see the roadmap's engine-tuning phase.</div>}
      {rows.length > limit && <div className="arc-more"><button className="button" onClick={() => setLimit((value) => value + 24)}>Show {Math.min(24, rows.length - limit)} more</button></div>}
    </section>
    <section className="section-gap"><SectionHeader title="Career record boards" note="Across every league, club and country in the world"/><div className="arc-board-grid">{boards.map((board) => <section key={board.id} className="panel"><h3>{board.title}</h3><div className="rank-list">{board.rows.map((row, index) => <button key={row.player.id} className="rank-row rank-button" onClick={() => onPlayer(row.player)}><span className="rank-number">{index + 1}</span><div className="grow"><strong>{row.player.name}</strong><span><Flag value={row.player.nationality}/> {row.player.retiredYear ? `Retired ${row.player.retiredYear}` : row.player.teamName}</span></div><em className="arc-board-value">{row.label}</em></button>)}</div>{!board.rows.length && <div className="empty-state small">No entries yet.</div>}</section>)}</div></section>
  </>;
}

function PlayerPage({ player, universe, onBack, onTeam, onCompetition, onToggleFollow }) {
  const [tab,setTab]=useState('Overview'); const currentTeam=universe.teams.find((t)=>t.id===player.teamId); const rightsTeam=player.rightsTeamId?universe.teams.find((t)=>t.id===player.rightsTeamId):null; const collegeYearsShown=player.originRoute==='NCAA'?(player.teamType==='NCAA'?4:Math.min(4,Math.max(1,(player.yearsInNCAA??0)+1))):0; const developmentCurve=player.originRoute==='NCAA'?[...(player.ncaaCurve??[]).slice(0,collegeYearsShown),...(player.proCurve??[])]:player.careerCurve; const developmentIndex=player.originRoute==='NCAA'?(player.teamType==='NCAA'?Math.min(collegeYearsShown-1,player.yearsInNCAA??0):collegeYearsShown+Math.max(0,(player.proYears??1)-1)):player.careerYear; const followed=(universe.followedPlayerIds??[]).includes(player.id); const arcs=careerArcs(player,teamIndex(universe));
  return <><DetailHeader onBack={onBack}><div className={`entity-hero player-entity-hero rarity-surface-${player.rarity.toLowerCase()}`} style={{'--entity-color':currentTeam?.color||'#315d9b'}}><PlayerPortrait player={player} team={currentTeam} size={118} className="hero-portrait"/><div className="entity-hero-copy"><div className="kicker"><Flag value={player.nationality}/> {player.nationality} · {player.age} · {player.status}</div><h2>{player.name}{player.realIdentity&&<span className="historical-identity-badge">Historical pool</span>}</h2><p>{currentTeam?<LinkButton onClick={()=>onTeam(currentTeam.id)}>{player.teamName}</LinkButton>:player.teamName} · #{player.jerseyNumber??'—'} · {player.position} · {player.role}</p><div className="entity-chip-row"><Rarity value={player.rarity}/><span>{playerCareerStage(player)}</span><span>Base {player.base}</span><span>{player.height} cm · {player.body}</span></div>{arcs.length>0&&<div className="arc-badge-row">{arcs.map((item)=><span key={item.id} className={`arc-badge arc-${item.id}`} title={item.blurb}><Icon name={ARC_ICONS[item.id]} size={13}/>{item.label}</span>)}</div>}</div><RatingPill value={player.current}/><button className={`follow-player ${followed?'active':''}`} onClick={()=>onToggleFollow?.(player.id)} title={followed?'Stop following':'Follow this career'} aria-pressed={followed}><Icon name={followed?'starFill':'star'} size={16}/><span>{followed?'Following':'Follow'}</span></button></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Rarity" value={player.rarity} detail="Permanent"/><Metric label="Base" value={player.base} detail="Permanent ability"/><Metric label="Current" value={player.current} detail={`Career year ${player.careerYear+1}`}/><Metric label="Honors" value={player.honors.length} detail={`${player.internationalHistory?.length??0} international appearances`}/><Metric label="Career stage" value={playerCareerStage(player)} detail={`${Math.max(0,(player.careerYears??0)-(player.careerYear??0)-1)} projected years left`}/></div><DetailTabs tabs={['Overview','Career','International','Honors','Timeline']} tab={tab} setTab={setTab}/>
    {tab==='Overview'&&<>{arcs.length>0&&<section className="panel arc-story-panel"><SectionHeader title="Career story" note="How this career reads in the chronicle"/><div className="arc-story-list">{arcs.map((item)=><article key={item.id}><span className="arc-story-icon"><Icon name={ARC_ICONS[item.id]} size={20}/></span><div><strong>{item.label}</strong><p>{item.detail}</p></div></article>)}</div><CareerPathStrip player={player} teams={teamIndex(universe)}/></section>}<div className="two-column detail-columns"><section className="panel"><SectionHeader title="Career identity" note={player.careerProfile}/><InfoLine label="Position" value={player.position}/><InfoLine label="Jersey" value={player.jerseyNumber!=null?`#${player.jerseyNumber}`:"—"}/><InfoLine label="Height / body" value={`${player.height} cm · ${player.body}`}/><InfoLine label="Role" value={player.role}/><InfoLine label="Origin route" value={player.originRoute}/>{player.realIdentity&&<InfoLine label="Historical identity" value="Real-name legend pool"/>}<InfoLine label="Career length" value={`${player.careerYears} years`}/><InfoLine label="Current multiplier" value={player.developmentMultiplier??developmentCurve[developmentIndex]??'—'}/>{player.draft&&<><InfoLine label="NBA Draft" value={`${player.draft.year} · Pick ${player.draft.pick} · ${player.draft.team}`}/><InfoLine label="Current NBA rights" value={rightsTeam?.name??(player.nbaJoinedYear?'Activated':'None')}/></>}<InfoLine label="Contract" value={player.contract?`${player.contract.team} · ${player.contract.salaryTier} · through ${player.contract.endYear}`:'No active contract'}/></section><section className="panel production-panel"><SectionHeader title="Current production" note={`${player.stats.games} games`}/><div className="stat-block-grid"><div><strong>{player.stats.ppg}</strong><span>PTS</span></div><div><strong>{player.stats.rpg}</strong><span>REB</span></div><div><strong>{player.stats.apg}</strong><span>AST</span></div><div><strong>{player.stats.spg}</strong><span>STL</span></div><div><strong>{player.stats.bpg}</strong><span>BLK</span></div></div><InfoLine label="Rebound split" value={`${player.stats.orpg} ORB · ${player.stats.drpg} DRB`}/><InfoLine label="Shooting" value={`${player.stats.fg}% FG · ${player.stats.three}% 3P · ${player.stats.ft}% FT`}/></section></div><section className="panel"><SectionHeader title="Career progression" note={player.originRoute==='NCAA'?'College years are capped at 0.89; professional years use the adult curve':'Base and rarity never change'}/><div className="career-year-scroll"><div className="career-year-strip">{developmentCurve.map((value,index)=>{const displayed=Math.round(player.base*value);return <div key={index} className={`career-year-card ${index===developmentIndex?'current-year':''}`}><small>Y{index+1}</small><strong>{displayed}</strong><span>{Number(value).toFixed(2)}</span></div>;})}</div></div></section></>}
    {tab==='Career'&&<section className="panel"><SectionHeader title="Detailed annual breakdown" note="Team, contract, production, ability and honors"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Age</th><th>#</th><th>Team</th><th>Competition</th><th>Contract</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>OVR</th><th>Honors</th></tr></thead><tbody>{[...player.history].reverse().map((season,index)=><tr key={`${season.year}-${season.teamId}-${index}`}><td><strong>{season.year}</strong></td><td>{season.age}</td><td>{season.jerseyNumber!=null?`#${season.jerseyNumber}`:"—"}</td><td>{season.teamId?<LinkButton onClick={()=>onTeam(season.teamId)}>{season.team}</LinkButton>:season.team}</td><td>{season.competitionId!=='free-agency'?<LinkButton onClick={()=>onCompetition(season.competitionId)}>{season.competition}</LinkButton>:season.competition}</td><td>{season.contract?`${season.contract.salaryTier} · ${season.contract.endYear}`:'—'}</td><td>{season.games}</td><td>{season.ppg}</td><td>{season.rpg}</td><td>{season.apg}</td><td>{season.spg}</td><td>{season.bpg}</td><td><strong>{season.current}</strong></td><td>{formatHonorList(season.honors)}</td></tr>)}</tbody></table></div></section>}
    {tab==='International'&&<section className="panel"><SectionHeader title="National-team career" note="Olympics, World Cup and continental championships"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Country</th><th>Tournament</th><th>Result</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th></tr></thead><tbody>{[...(player.internationalHistory??[])].reverse().map((season,index)=><tr key={`${season.year}-${season.competitionId}-${index}`}><td>{season.year}</td><td>{season.team}</td><td><LinkButton onClick={()=>onCompetition(season.competitionId)}>{season.competition}</LinkButton></td><td>{season.result}</td><td>{season.games}</td><td>{season.ppg}</td><td>{season.rpg}</td><td>{season.apg}</td></tr>)}</tbody></table></div>{!player.internationalHistory?.length&&<div className="empty-state">No senior international tournament yet.</div>}</section>}
    {tab==='Honors'&&<PlayerHonorsPanel honors={player.honors}/>} {tab==='Timeline'&&<section className="panel"><SectionHeader title="Career timeline" note="Drafts, contracts, transfers, releases and retirement"/>{[...player.careerEvents].reverse().map((event,index)=><article className="timeline-event" key={`${event.year}-${index}`}><span>{event.year}</span><div><strong>{event.type}</strong><p>{event.detail}</p></div></article>)}</section>}</>;
}

function CoachPage({ coach, universe, onBack, onTeam }) { const [tab,setTab]=useState('Overview');const team=universe.teams.find((item)=>item.id===coach.teamId);return <><DetailHeader onBack={onBack}><div className={`entity-hero coach-entity-hero rarity-surface-${coach.rarity.toLowerCase()}`} style={{'--entity-color':team?.color||'#315d9b'}}><CoachPortrait coach={coach} team={team} size={112}/><div className="entity-hero-copy"><div className="kicker"><Flag value={coach.nationality}/> {coach.nationality} · {coach.age} · {coach.status}</div><h2>{coach.name}</h2><p>{team?<LinkButton onClick={()=>onTeam(team.id)}>{team.name}</LinkButton>:coach.teamName} · {coach.style}</p><div className="entity-chip-row"><Rarity value={coach.rarity}/><span>Base {coach.base}</span><span>{coach.careerYear+1}/{coach.careerYears} career year</span></div></div><RatingPill value={coach.current}/></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Rarity" value={coach.rarity} detail="Permanent coaching tier"/><Metric label="Overall" value={coach.current} detail={`Base ${coach.base}`}/><Metric label="Career year" value={coach.careerYear+1} detail={`${coach.careerYears} projected years`}/><Metric label="Honors" value={coach.honors.length} detail="Team titles"/></div><DetailTabs tabs={['Overview','Career','Honors','Timeline']} tab={tab} setTab={setTab}/>{tab==='Overview'&&<div className="two-column"><section className="panel"><SectionHeader title="Coaching profile" note={coach.style}/><div className="coach-skill-grid">{[['Offense',coach.offense],['Defense',coach.defense],['Development',coach.development],['Rotations',coach.rotations],['Playoffs',coach.playoff],['Management',coach.management]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong><i style={{width:`${value}%`}}/></div>)}</div></section><section className="panel"><SectionHeader title="Appointment" note="Current status"/><InfoLine label="Team" value={team?team.name:coach.teamName}/><InfoLine label="Contract through" value={coach.contractEnd??'—'}/><InfoLine label="Career length" value={`${coach.careerYears} years`}/></section></div>}{tab==='Career'&&<section className="panel"><SectionHeader title="Annual coaching career" note="Team, record, ability and titles"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Team</th><th>Record</th><th>OVR</th><th>Titles</th></tr></thead><tbody>{[...coach.history].reverse().map((season,index)=><tr key={`${season.year}-${index}`}><td>{season.year}</td><td><LinkButton onClick={()=>onTeam(season.teamId)}>{season.team}</LinkButton></td><td>{season.record}</td><td>{season.current}</td><td>{season.titles.join(', ')||'—'}</td></tr>)}</tbody></table></div></section>}{tab==='Honors'&&<TeamHonorsPanel honors={coach.honors}/>} {tab==='Timeline'&&<section className="panel"><SectionHeader title="Coaching timeline" note="Appointments, firings and retirement"/>{[...coach.careerEvents].reverse().map((event,index)=><article className="timeline-event" key={`${event.year}-${index}`}><span>{event.year}</span><div><strong>{event.type}</strong><p>{event.detail}</p></div></article>)}</section>}</>; }

function CompetitionPage({ competition, universe, onBack, onPlayer, onTeam }) {
  const [tab,setTab]=useState('Overview'); const participants=getCompetitionParticipants(universe,competition.id); const resultLocked=competitionResultLocked(universe,competition.id); const rawHistories=universe.competitionHistory[competition.id]??[]; const histories=resultLocked?rawHistories.filter((season)=>Number(season.year)<Number(universe.year)):rawHistories; const [bracketYear,setBracketYear]=useState(histories[0]?.year??universe.year); const latest=histories[0]; const standings=participants.map((team)=>{const record=team.seasonRecords[competition.id]??team.seasonRecords[team.competitionId]??{wins:0,losses:0};return{team,wins:record.wins,losses:record.losses,pct:record.wins/Math.max(1,record.wins+record.losses)};}).sort((a,b)=>b.pct-a.pct||b.team.rating-a.team.rating); const leaders=currentLeaders(universe,competition); const rankings=competitionRankings(universe,competition.id); const bracketSeason=histories.find((season)=>season.year===Number(bracketYear))??latest;
  return <><DetailHeader onBack={onBack}><div className="entity-hero competition-entity-hero"><CompetitionEmblem competition={competition} size={92}/><div className="entity-hero-copy"><div className="kicker"><Flag value={competition.country || competition.region}/> {competition.region} · {competition.country || 'International'} · {competition.kind}</div><h2>{competition.name}</h2><p>{participants.length || latest?.standings?.length || 0} teams · {isCompetitionActive(competition,universe.year)?'active this year':competition.frequency?`next edition follows a ${competition.frequency}-year cycle`:'domestic competition'}</p><div className="entity-chip-row">{latest&&<><span>{latest.year} champion: {latest.champion}</span><span>MVP: {latest.mvp.name}</span></>}</div></div></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Teams" value={participants.length||latest?.standings?.length||0} detail="Current / latest edition"/><Metric label="Recorded seasons" value={histories.length} detail="Permanent archive"/><Metric label="Latest champion" value={latest?.champion??'—'} detail={latest?String(latest.year):'No completed edition'}/><Metric label="Latest MVP" value={latest?.mvp.name??'—'} detail={latest?.mvp.team??'No award yet'}/></div><DetailTabs tabs={['Overview','Bracket','Seasons','Awards','Rankings','Teams']} tab={tab} setTab={setTab}/>{resultLocked&&<div className="spoiler-lock-banner"><strong>Current edition protected.</strong><span>The selected showcase result, bracket outcome and awards stay hidden until you play or skip the game.</span></div>}
    {tab==='Overview'&&<div className="two-column detail-columns"><section className="panel"><SectionHeader title="Current standings" note="Regular season / seeding"/><div className="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Win %</th><th>Rating</th></tr></thead><tbody>{standings.slice(0,32).map((entry,index)=><tr className="clickable" key={entry.team.id} onClick={()=>onTeam(entry.team.id)}><td>{index+1}</td><td><span className="table-identity"><TeamMark team={entry.team} size={32}/><strong><Flag value={entry.team.country}/> {entry.team.name}</strong></span></td><td>{entry.wins}</td><td>{entry.losses}</td><td>{pct(entry.pct)}</td><td><RatingPill value={entry.team.rating} size="sm"/></td></tr>)}</tbody></table></div></section><section className="panel"><SectionHeader title="Current leaders" note="Projected until year review"/><div className="leader-cards"><LeaderLine label="MVP race" person={leaders.mvp} onPlayer={onPlayer}/><LeaderLine label="Points" person={leaders.points} suffix={leaders.points ? `${leaders.points.stats.ppg} PPG` : null} onPlayer={onPlayer}/><LeaderLine label="Rebounds" person={leaders.rebounds} suffix={leaders.rebounds ? `${leaders.rebounds.stats.rpg} RPG` : null} onPlayer={onPlayer}/><LeaderLine label="Assists" person={leaders.assists} suffix={leaders.assists ? `${leaders.assists.stats.apg} APG` : null} onPlayer={onPlayer}/></div></section></div>}
    {tab==='Bracket'&&<section className="panel"><SectionHeader title="Tournament bracket" note="See exactly who defeated whom"/>{histories.length?<><div className="filters compact"><Filter label="Edition"><select value={bracketSeason?.year??''} onChange={(e)=>setBracketYear(e.target.value)}>{histories.map((season)=><option key={season.year} value={season.year}>{season.year}</option>)}</select></Filter></div><BracketView rounds={bracketSeason?.bracket??[]} onTeam={onTeam}/></>:<div className="empty-state">The bracket is written at year review.</div>}</section>}
    {tab==='Seasons'&&<section className="panel"><SectionHeader title="Annual competition breakdown" note="Champion, finalist, MVP, playoff MVP and leaders"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Champion</th><th>Runner-up</th><th>MVP</th><th>Playoff / Finals MVP</th><th>Points</th><th>Rebounds</th><th>Assists</th></tr></thead><tbody>{histories.map((season)=><tr key={season.year}><td><strong>{season.year}</strong></td><td><LinkButton onClick={()=>onTeam(season.championTeamId)}>{season.champion}</LinkButton></td><td><LinkButton onClick={()=>onTeam(season.runnerUpTeamId)}>{season.runnerUp}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.mvp.id)}>{season.mvp.name}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.finalsMvp.id)}>{season.finalsMvp.name}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.leaders.points.id)}>{season.leaders.points.name}</LinkButton> · {season.leaders.points.value}</td><td><LinkButton onClick={()=>onPlayer(season.leaders.rebounds.id)}>{season.leaders.rebounds.name}</LinkButton> · {season.leaders.rebounds.value}</td><td><LinkButton onClick={()=>onPlayer(season.leaders.assists.id)}>{season.leaders.assists.name}</LinkButton> · {season.leaders.assists.value}</td></tr>)}</tbody></table></div></section>}
    {tab==='Awards'&&<section className="panel"><SectionHeader title="Awards by season" note="MVP, statistical leaders and the best five by position"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>MVP</th><th>Finals / playoff MVP</th><th>Points</th><th>Rebounds</th><th>Assists</th><th>Steals</th><th>Blocks</th><th>PG</th><th>SG</th><th>SF</th><th>PF</th><th>C</th></tr></thead><tbody>{histories.map((season)=><tr key={`awards-${season.year}`}><td><strong>{season.year}</strong></td><td>{season.mvp?<LinkButton onClick={()=>onPlayer(season.mvp.id)}>{season.mvp.name}</LinkButton>:'—'}</td><td>{season.finalsMvp?<LinkButton onClick={()=>onPlayer(season.finalsMvp.id)}>{season.finalsMvp.name}</LinkButton>:'—'}</td>{['points','rebounds','assists','steals','blocks'].map((key)=><td key={key}>{season.leaders?.[key]?<><LinkButton onClick={()=>onPlayer(season.leaders[key].id)}>{season.leaders[key].name}</LinkButton><small className="table-subvalue"> {season.leaders[key].value}</small></>:'—'}</td>)}{POSITION_ORDER.map((position)=><td key={position}>{season.allLeagueFive?.[position]?<LinkButton onClick={()=>onPlayer(season.allLeagueFive[position].id)}>{season.allLeagueFive[position].name}</LinkButton>:'—'}</td>)}</tr>)}</tbody></table></div>{!histories.length&&<div className="empty-state">Awards appear after the first completed edition.</div>}</section>}
    {tab==='Rankings'&&(resultLocked?<div className="empty-state spoiler-locked">Historical ranking totals are temporarily hidden because they would reveal the protected showcase result.</div>:<div className="ranking-grid"><RankingPanel title="Top 10 points" rows={rankings.points} metric="points" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Top 10 rebounds" rows={rankings.rebounds} metric="rebounds" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Top 10 assists" rows={rankings.assists} metric="assists" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Teams with most wins" rows={rankings.teamWins} metric="wins" onClick={(row)=>onTeam(row.teamId)}/><RankingPanel title="Teams with most titles" rows={rankings.teamTitles} metric="titles" onClick={(row)=>onTeam(row.teamId)}/></div>)}
    {tab==='Teams'&&<div className="card-grid four team-card-grid-modern">{participants.sort((a,b)=>b.rating-a.rating).map((team)=><TeamCard key={team.id} team={team} universe={universe} onTeam={(t)=>onTeam(t.id??t)}/>)}</div>}</>;
}

function BracketView({ rounds, onTeam }) { return rounds.length?<div className="bracket-scroll"><div className="bracket">{rounds.map((round)=><div className="bracket-round" key={round.name}><h3>{round.name}</h3>{round.matches.map((match,index)=><article className="bracket-match" key={`${round.name}-${index}`}><button className={match.winnerId===match.teamAId?'winner':''} onClick={()=>onTeam(match.teamAId)}><span>{match.teamA}</span><strong>{match.scoreA}</strong></button><button className={match.winnerId===match.teamBId?'winner':''} onClick={()=>onTeam(match.teamBId)}><span>{match.teamB}</span><strong>{match.scoreB}</strong></button></article>)}</div>)}</div></div>:<div className="empty-state">No bracket stored.</div>; }

function PlayerTable({ players,onPlayer,draft=false,highlight=null,compact=false }) {const value=(player)=>highlight?(highlight in player.stats?player.stats[highlight]:player[highlight]):null;return <div className="table-wrap"><table className={compact?'compact-table':''}><thead><tr><th>Player</th><th>Age</th><th>#</th><th>Team</th><th>Pos</th>{!compact&&<><th>Body</th><th>Role</th></>}<th>Rarity</th><th>Base</th><th>Current</th>{draft&&<th>Potential</th>}{highlight&&<th>Selected stat</th>}<th>PTS</th><th>REB</th><th>AST</th><th>Contract</th></tr></thead><tbody>{players.map((player)=><tr className="clickable" key={player.id} onClick={()=>onPlayer(player)}><td><span className="table-person"><PlayerPortrait player={player} size={36}/><span><strong>{player.name}</strong><small><Flag value={player.nationality}/> {player.nationality}</small></span></span></td><td>{player.age}</td><td>{player.jerseyNumber!=null?player.jerseyNumber:'—'}</td><td>{player.teamName}</td><td><strong>{player.position}</strong></td>{!compact&&<><td>{player.height} cm · {player.body}</td><td>{player.role}</td></>}<td><Rarity value={player.rarity}/></td><td>{player.base}</td><td><RatingPill value={player.current} size="sm"/></td>{draft&&<td>{player.potential}</td>}{highlight&&<td><strong>{value(player)}</strong></td>}<td>{player.stats.ppg}</td><td>{player.stats.rpg}</td><td>{player.stats.apg}</td><td>{player.contract?`${player.contract.salaryTier} · ${player.contract.endYear}`:'—'}</td></tr>)}</tbody></table></div>;}

function RankingPanel({title,rows,metric,onClick}) {return <section className="panel"><SectionHeader title={title} note="All recorded seasons"/><div className="rank-list">{rows.map((row,index)=><button className="rank-row rank-button" key={`${row.playerId??row.teamId}-${index}`} onClick={()=>onClick(row)}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.player??row.team}</strong><span>{row.seasons?`${row.seasons} seasons · ${row.games} games`:`${row.titles??0} titles`}</span></div><strong>{formatNumber(row[metric])}</strong></button>)}</div>{!rows.length&&<div className="empty-state small">No completed seasons yet.</div>}</section>;}
function countedLabels(items) {const counts=new Map();items.filter(Boolean).forEach((item)=>counts.set(item,(counts.get(item)??0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([label,count])=>count>1?`${label} ×${count}`:label);}
function formatHonorList(items) {const labels=countedLabels(items??[]);return labels.length?labels.join(', '):'—';}
function PlayerHonorsPanel({ honors }) {const years=unique(honors.map((h)=>h.year)).sort((a,b)=>Number(b)-Number(a));const allTitles=honors.filter((h)=>h.category==='team'||h.type==='Team title');const allAwards=honors.filter((h)=>!allTitles.includes(h));return <><section className="panel career-honor-summary"><SectionHeader title="Career honors" note="Repeated achievements are counted together"/><div className="two-column honor-summary-columns"><div><h3>Team titles</h3><HonorRow label="Titles" items={allTitles.map((h)=>h.competition)}/></div><div><h3>Individual awards</h3><HonorRow label="Awards" items={allAwards.map((h)=>`${h.competition} ${h.type}`)}/></div></div></section><section className="panel section-gap"><SectionHeader title="Honors by year" note={`${honors.length} tracked achievements`}/><div className="honors-timeline">{years.map((year)=>{const rows=honors.filter((h)=>String(h.year)===String(year));const titles=rows.filter((h)=>h.category==='team'||h.type==='Team title');const awards=rows.filter((h)=>!titles.includes(h));return <article className="honor-year" key={year}><h3>{year}</h3><div className="honor-year-content"><HonorRow label="Titles" items={titles.map((h)=>h.competition)}/><HonorRow label="Awards" items={awards.map((h)=>`${h.competition} ${h.type}`)}/></div></article>;})}</div>{!years.length&&<div className="empty-state">No honors yet.</div>}</section></>;}
function HonorRow({label,items}) {const counted=countedLabels(items);return <div className="honor-row"><strong>{label}</strong><div>{counted.length?counted.map((item,index)=><span className="honor-chip" key={`${item}-${index}`}>{item}</span>):<small>—</small>}</div></div>;}

function FranchiseFivePanel({team,universe,onPlayer}) {const rows=franchiseFiveFor(team,universe);return <section className="panel section-gap"><SectionHeader title="Franchise all-time five" note="Best simulated career at each position for this club"/><div className="franchise-five-grid">{rows.map(({player,seasons})=><button key={player.id} onClick={()=>onPlayer(player)} className={`franchise-five-card rarity-surface-${player.rarity.toLowerCase()}`}><PlayerPortrait player={player} size={64}/><span>{player.position}</span><strong>{player.name}</strong><small>{seasons} seasons · {player.honors.filter((h)=>h.teamId===team.id).length} team-specific honors</small></button>)}</div>{!rows.length&&<div className="empty-state">The franchise needs completed seasons before an all-time five can emerge.</div>}</section>;}
function TeamHonorsPanel({honors}) {const years=unique(honors.map((h)=>h.year)).sort((a,b)=>Number(b)-Number(a));return <section className="panel"><SectionHeader title="Trophy cabinet" note={`${honors.length} titles`}/><div className="honors-timeline">{years.map((year)=><article className="honor-year" key={year}><h3>{year}</h3><div className="honor-year-content"><HonorRow label="Titles" items={honors.filter((h)=>String(h.year)===String(year)).map((h)=>h.competition)}/></div></article>)}</div>{!years.length&&<div className="empty-state">No titles yet.</div>}</section>;}
function RetiredJerseysPanel({team,onPlayer}) {const rows=[...(team.retiredJerseys??[])].sort((a,b)=>Number(b.year)-Number(a.year)||Number(a.number)-Number(b.number));return <section className="panel"><SectionHeader title="Retired jerseys" note="Reserved for extraordinary team-specific careers"/><div className="retired-jersey-grid">{rows.map((entry)=><button className="retired-jersey-card" key={`${entry.number}-${entry.playerId}`} onClick={()=>onPlayer(entry.playerId)}><span>#{entry.number}</span><strong>{entry.player}</strong><small>{entry.year} · {entry.seasons} seasons</small><p>{entry.titles} titles · {entry.mvps+Number(entry.finalsMvps??0)} major MVPs · {entry.firstFive} best-five · {entry.leaders??0} leaders</p></button>)}</div>{!rows.length&&<div className="empty-state">No number has reached the club's retirement standard yet.</div>}</section>;}
function TeamMovementHistory({team,universe,onPlayer,onCoach}) {
  const summaries=(universe.offseasonHistory??[]).map((offseason)=>({year:offseason.year,row:(offseason.teams??[]).find((item)=>item.teamId===team.id)})).filter((item)=>item.row);
  return <><section className="panel"><SectionHeader title="Offseason movement" note="Who came in, who left, and whether the coach changed"/><div className="team-movement-history">{summaries.map(({year,row})=><article className="team-movement-year" key={year}><div className="movement-year-head"><div><strong>{year}</strong><span>{row.before} → {row.after} ({row.delta>=0?'+':''}{row.delta})</span></div><small>{row.departures??0} out · {row.arrivals??0} in · target {row.turnoverTarget??'—'}</small></div><OffseasonProfileDelta row={row}/><div className="movement-columns"><div><h4>Players out</h4>{(row.playersOut??[]).length?(row.playersOut??[]).map((player)=><button key={player.playerId} onClick={()=>onPlayer(player.playerId)}><span><Rarity value={player.rarity}/></span><strong>{player.player}</strong><small>{player.position} · Base {player.base} · OVR {player.current}</small></button>):<em>No player departures</em>}</div><div><h4>Players in</h4>{(row.playersIn??[]).length?(row.playersIn??[]).map((player)=><button key={player.playerId} onClick={()=>onPlayer(player.playerId)}><span><Rarity value={player.rarity}/></span><strong>{player.player}</strong><small>{player.position} · Base {player.base} · OVR {player.current}</small></button>):<em>No player arrivals</em>}</div></div>{(row.coachOut||row.coachIn)&&<div className="coach-movement"><strong>Coach</strong>{row.coachOut?<button onClick={()=>onCoach(row.coachOut.coachId)}>Out: {row.coachOut.coach} · {row.coachOut.rarity} · Base {row.coachOut.base}</button>:<span>No coach out</span>}<span>→</span>{row.coachIn?<button onClick={()=>onCoach(row.coachIn.coachId)}>In: {row.coachIn.coach} · {row.coachIn.rarity} · Base {row.coachIn.base}</button>:<span>No coach in</span>}</div>}</article>)}</div>{!summaries.length&&<div className="empty-state">Complete an offseason to create the first team movement report.</div>}</section><TransactionPanel transactions={team.transactions} onPlayer={onPlayer}/></>;
}
function TransactionPanel({transactions,onPlayer}) {return <section className="panel"><SectionHeader title="Transaction history" note={`${transactions.length} moves`}/>{transactions.length?transactions.map((item,index)=><article className="timeline-event" key={`${item.year}-${index}`}><span>{item.year}</span><div><strong>{item.type}: <LinkButton onClick={()=>onPlayer(item.playerId)}>{item.player}</LinkButton></strong><p>{item.from} → {item.to} · {item.detail}</p></div></article>):<div className="empty-state">No transactions yet.</div>}</section>;}
function DetailHeader({onBack,children}) {return <div className="detail-header"><button className="back-button" onClick={onBack}><Icon name="back" size={16}/>Back</button>{children}</div>;}
function DetailTabs({tabs,tab,setTab}) {return <div className="tabs detail-tabs">{tabs.map((item)=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>;}
function Metric({label,value,detail}) {return <div className="metric-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;}
function InfoLine({label,value}) {return <div className="info-line"><span>{label}</span><strong>{value}</strong></div>;}
function Filter({label,children}) {return <label className="filter"><span>{label}</span>{children}</label>;}
function SectionHeader({title,note}) {return <div className="section-header"><h2>{title}</h2><span>{note}</span></div>;}
