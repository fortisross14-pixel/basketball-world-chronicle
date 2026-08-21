import React, { useEffect, useRef, useState } from 'react';
import {
  advanceToNextYear,
  advanceOffseasonStage,
  startOffseason,
  OFFSEASON_STAGES,
  competitionRankings,
  COMPETITIONS,
  createUniverse,
  getCompetition,
  getCompetitionParticipants,
  POSITION_ORDER,
  simulateWeeks,
} from './game/universe.js';
import { deleteSaveSlot, listSaveSlots, loadSaveSlot, writeSaveSlot } from './game/saveDb.js';
import { isCompetitionActive } from './data/competitionData.js';
import { DETAILED_COUNTRY_SPECS, SUMMARY_COUNTRY_SPECS } from './data/worldData.js';

const NAV = ['World','Results','Tournaments','Teams','Players','Coaches','Market','Statistics','The Global Five','Almanac'];
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
  Hungary: 'HU', Romania: 'RO', Bulgaria: 'BG', Ukraine: 'UA', Mexico: 'MX', 'Puerto Rico': 'PR', Bahamas: 'BS',
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
function Flag({ value, title = value }) { return <span className="flag" role="img" aria-label={title || 'flag'} title={title}>{flagText(value)}</span>; }

function TeamMark({ team, size = 38 }) {
  if (!team) return <span className="team-mark" style={{ width: size, height: size }}>?</span>;
  const initials = team.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('');
  return <span className="team-mark" style={{ width: size, height: size, background: team.color, fontSize: Math.max(10, size * 0.28) }}>{initials}</span>;
}
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
  return competition.region === region || competition.countries?.includes(region);
}

const NAV_ROUTES = { World:'world', Results:'results', Tournaments:'tournaments', Teams:'teams', Players:'players', Coaches:'coaches', Market:'market/summary', Statistics:'statistics', 'The Global Five':'magazine', Almanac:'almanac' };
const MARKET_ROUTE_TO_TAB = { summary:'Offseason Summary', trades:'Trades', transfers:'Transfers', draft:'Draft', rights:'Rights', 'free-agency':'Free Agency', retirements:'Retirements', spawn:'Spawn', coaches:'Coaches' };
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
  universe.offseasonHistory ??= [];
  universe.offseason ??= null;
  universe.usedRealPlayerNames ??= [];
  universe.eliteRouteBalance ??= { NCAA: 0, International: 0 };
  universe.talentHistory ??= [];
  universe.teams?.forEach((team) => {
    if (team.type === 'NBA') team.localMinimum = Math.max(7, team.localMinimum ?? 7);
    team.unavailablePlayers ??= [];
    team.selectionCompetition ??= 'International window';
    team.selectionYear ??= universe.year;
    team.secondaryCompetitions ??= [];
    team.secondaryCompetitionIds ??= [];
    team.history ??= [];
    team.honors ??= [];
    team.rosterIds ??= [];
  });
  universe.players?.forEach((player) => {
    player.nationalCommitment ??= 0.65;
    player.internationalRetired ??= false;
    player.internationalHistory ??= [];
    player.honors ??= [];
    player.careerEvents ??= [];
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
  const [detail, setDetail] = useState(null);
  const [route, setRoute] = useState(() => parseHashRoute());
  const saveQueueRef = useRef(Promise.resolve());

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
    const viewMap = { world:'World', results:'Results', tournaments:'Tournaments', teams:'Teams', players:'Players', coaches:'Coaches', market:'Market', statistics:'Statistics', magazine:'The Global Five', almanac:'Almanac', region:'Tournaments', country:'Tournaments', competition:'Tournaments', 'national-team':'Tournaments', team:'Teams', player:'Players', coach:'Coaches' };
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
      setSaveStatus((record.version ?? loadedUniverse.version ?? 7) < 9 ? 'Legacy save loaded — start a new universe for the complete v0.9 offseason and balance model.' : 'Save loaded');
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

  if (loadingSaves && !universe) return <div className="loading-screen"><div className="kicker">Basketball World Chronicle</div><h1>Loading the basketball world…</h1><p>{saveStatus}</p></div>;
  if (!universe) return <SaveHome slots={slots} onContinue={continueGame} onNew={createNewGame} onDelete={removeGame} status={saveStatus} />;

  const teamById = new Map(universe.teams.map((team) => [team.id, team]));
  const playerById = new Map([...universe.players, ...universe.retiredPlayers].map((player) => [player.id, player]));
  const coachById = new Map([...universe.coaches, ...universe.retiredCoaches].map((coach) => [coach.id, coach]));
  const clubTeams = universe.teams.filter((team) => !['NCAA','National'].includes(team.type));
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');

  const navigate = (nextView) => goToRoute(NAV_ROUTES[nextView] ?? 'world');
  const openTeam = (teamOrId) => { const id = typeof teamOrId === 'object' ? teamOrId.id : teamOrId; const team = teamById.get(id); goToRoute(`${team?.type === 'National' ? 'national-team' : 'team'}/${id}`); };
  const openPlayer = (playerOrId) => goToRoute(`player/${typeof playerOrId === 'object' ? playerOrId.id : playerOrId}`);
  const openCoach = (coachOrId) => goToRoute(`coach/${typeof coachOrId === 'object' ? coachOrId.id : coachOrId}`);
  const openCompetition = (competitionOrId) => goToRoute(`competition/${typeof competitionOrId === 'object' ? competitionOrId.id : competitionOrId}`);
  const openRegion = (region) => goToRoute(`region/${encodeURIComponent(region)}`);
  const openCountry = (country) => goToRoute(`country/${encodeURIComponent(country)}`);
  const runWeeks = (weeks) => {
    try { commitUniverse(simulateWeeks(universe, weeks)); }
    catch (error) { setSaveStatus(`Simulation error: ${error.message}`); }
  };
  const beginOffseason = () => {
    try { commitUniverse(startOffseason(universe)); }
    catch (error) { setSaveStatus(`Offseason error: ${error.message}`); }
  };
  const runOffseasonStage = () => {
    try { commitUniverse(advanceOffseasonStage(universe)); }
    catch (error) { setSaveStatus(`Offseason error: ${error.message}`); }
  };
  const finishOffseason = () => {
    try { commitUniverse(advanceToNextYear(universe)); }
    catch (error) { setSaveStatus(`Offseason error: ${error.message}`); }
  };

  return <div className="app-shell">
    <header className="masthead"><div><div className="kicker light">The Global Five presents</div><h1>Basketball World Chronicle</h1></div><div className="masthead-actions"><div className="season-label"><strong>{universe.year}</strong><span>Week {universe.week} · {universe.phase}</span></div><button className="header-button" onClick={goHome}>⌂ Home</button><button className="header-button" onClick={() => void persistUniverse()}>💾 Save</button><span className={`save-status ${saveStatus.startsWith('Save failed') || saveStatus.includes('error') ? 'error' : ''}`}>{saveStatus}</span></div></header>
    <section className="simulation-toolbar global-simulation">
      <div className="simulation-label"><strong>Advance the world</strong><span>Simulation controls stay above the menus.</span></div>
      <button className="button primary" disabled={universe.yearReview} onClick={() => runWeeks(1)}>1 week</button>
      <button className="button" disabled={universe.yearReview} onClick={() => runWeeks(4)}>4 weeks</button>
      <button className="button" disabled={universe.yearReview} onClick={() => runWeeks(50)}>To year review</button>
      {universe.yearReview && !universe.offseason?.active && <button className="button primary" onClick={beginOffseason}>Start offseason</button>}
      {universe.offseason?.active && <><button className="button primary" onClick={runOffseasonStage}>Run {OFFSEASON_STAGES[universe.offseason.stageIndex]}</button><button className="button" onClick={finishOffseason}>Finish offseason</button></>}
      <div className="toolbar-note">Slot {activeSlot} · {clubTeams.length} pro teams × 10 · {ncaaTeams.length} NCAA starting fives</div>
    </section>
    <nav className="main-nav">{NAV.map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => navigate(item)}>{item}</button>)}</nav>
    <main>
      {universe.yearReview && !universe.offseason?.active && <div className="year-review-banner"><strong>{universe.year} Year Review.</strong> Results now show the official champions, MVPs and leaders. Start the offseason when you are ready.</div>}
      {universe.offseason?.active && <div className="year-review-banner offseason"><strong>Offseason stage {universe.offseason.stageIndex + 1}/{OFFSEASON_STAGES.length}.</strong> {OFFSEASON_STAGES[universe.offseason.stageIndex]}. You can inspect Market after every stage before continuing.</div>}
      <Breadcrumbs route={route} universe={universe} teamById={teamById} playerById={playerById} />
      {route.page === 'region' ? <RegionPage region={route.id} universe={universe} onCompetition={openCompetition} onCountry={openCountry} onTeam={openTeam} /> : route.page === 'country' ? <CountryPage country={route.id} universe={universe} onCompetition={openCompetition} onTeam={openTeam} onPlayer={openPlayer} /> : detail ? <DetailRouter detail={detail} universe={universe} teamById={teamById} playerById={playerById} coachById={coachById} onBack={() => window.history.back()} onTeam={openTeam} onPlayer={openPlayer} onCoach={openCoach} onCompetition={openCompetition} /> : <>
        {view === 'World' && <WorldView universe={universe} setView={navigate} setMarketTab={setMarketTab} onTeam={openTeam} onPlayer={openPlayer} />}
        {view === 'Results' && <ResultsView universe={universe} onPlayer={openPlayer} onTeam={openTeam} onCompetition={openCompetition} />}
        {view === 'Tournaments' && <TournamentsView universe={universe} onCompetition={openCompetition} onRegion={openRegion} onCountry={openCountry} />}
        {view === 'Teams' && <TeamsView universe={universe} onTeam={openTeam} />}
        {view === 'Players' && <PlayersView universe={universe} teamById={teamById} onPlayer={openPlayer} />}
        {view === 'Coaches' && <CoachesView universe={universe} onCoach={openCoach} onTeam={openTeam} />}
        {view === 'Market' && <MarketView universe={universe} tab={marketTab} setTab={(tab) => { setMarketTab(tab); goToRoute(`market/${MARKET_TAB_TO_ROUTE[tab] ?? 'transfers'}`); }} onPlayer={openPlayer} onTeam={openTeam} onCoach={openCoach} />}
        {view === 'Statistics' && <StatisticsView universe={universe} teamById={teamById} onPlayer={openPlayer} />}
        {view === 'The Global Five' && <MagazineView universe={universe} onPlayer={openPlayer} />}
        {view === 'Almanac' && <AlmanacView universe={universe} onCompetition={openCompetition} />}
      </>}
    </main>
  </div>;
}

function SaveHome({ slots, onContinue, onNew, onDelete, status }) {
  const rows = [1, 2, 3].map((slot) => ({ slot, record: slots.find((item) => item.slot === slot) }));
  return <div className="save-home"><header><div className="kicker">The Global Five presents</div><h1>Basketball World Chronicle</h1><p>Three independent universes. Saves are stored in IndexedDB, which has substantially more capacity than browser localStorage.</p></header><section className="save-slot-grid">{rows.map(({ slot, record }) => <article className={`save-slot ${record ? 'occupied' : 'empty'}`} key={slot}><div className="slot-number">Slot {slot}</div>{record ? <><h2>{record.name}</h2><div className="slot-season">{record.year} · Week {record.week}</div><p>{record.phase}{record.yearReview ? ' · Year review' : ''} · v{record.version ?? 7}</p>{(record.version ?? 7) < 9 && <small className="legacy-save-note">Legacy world: playable, but the complete v0.9 offseason and nationality balance require a new universe.</small>}<small>Saved {new Date(record.updatedAt).toLocaleString()}</small><div className="slot-actions"><button className="button primary" onClick={() => onContinue(slot)}>Continue</button><button className="button" onClick={() => onNew(slot)}>New universe</button><button className="button danger" onClick={() => onDelete(slot)}>Delete</button></div></> : <><h2>Empty universe</h2><p>Begin a new basketball history in this slot.</p><div className="slot-actions"><button className="button primary" onClick={() => onNew(slot)}>Start new universe</button></div></>}</article>)}</section>{status && <div className="home-status">{status}</div>}</div>;
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
  if (crumbs.length <= 1 && ['world','results','tournaments','teams','players','coaches','market','statistics','magazine','almanac'].includes(route.page)) return null;
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
    {!!strongest.length && <section className="panel section-gap"><SectionHeader title="Strongest clubs" note="Current world rating"/><div className="rank-list">{strongest.map((team,index)=><button className="rank-row rank-button" key={team.id} onClick={()=>onTeam(team.id)}><span className="rank-number">{index+1}</span><TeamMark team={team}/><div className="grow"><strong>{team.name}</strong><span>{team.country} · {team.competition}</span></div><strong>{team.rating}</strong></button>)}</div></section>}
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
    <div className="country-summary-grid"><section className="panel country-national-card"><SectionHeader title="National team" note={national?.selectionCompetition ?? 'International window'}/>{national?<button className="national-team-link" onClick={()=>onTeam(national.id)}><TeamMark team={national} size={58}/><div><strong>{national.name}</strong><span>Rating {national.rating} · {national.honors.length} titles</span><small>{national.unavailablePlayers?.length ?? 0} notable unavailable players</small></div><b>›</b></button>:<div className="empty-state small">No senior national team record.</div>}</section><section className="panel"><SectionHeader title="Best active players" note="At home and abroad"/>{players.slice(0,6).map((player)=><button className="feature-story" key={player.id} onClick={()=>onPlayer(player.id)}><Rarity value={player.rarity}/><div><strong>{player.name}</strong><p>{player.teamName} · {player.current} OVR</p></div></button>)}</section></div>
    <SectionHeader title="Domestic competitions" note="League, cup, supercup and lower tier where modeled"/><CompetitionCards competitions={competitions} universe={universe} onCompetition={onCompetition}/>
    <section className="panel section-gap"><SectionHeader title="Clubs" note={`${clubs.length} organizations`}/><div className="card-grid four">{clubs.map((team)=><button className="team-card" key={team.id} onClick={()=>onTeam(team.id)}><span className="team-color" style={{background:team.color}}/><div className="team-card-top"><TeamMark team={team}/><span className="team-rating">{team.rating}</span></div><h3>{team.name}</h3><p>{team.competition}</p><div className="tag-row"><span>{team.tier===2?'Tier 2':'Top tier'}</span><span>{team.honors.length} titles</span></div></button>)}</div></section>
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
    {tab==='Honors'&&<TeamHonorsPanel honors={team.honors}/>}</>;
}

function DetailRouter({ detail, universe, teamById, playerById, coachById, onBack, onTeam, onPlayer, onCoach, onCompetition }) {
  if (detail.type === 'team') {
    const team = teamById.get(detail.id);
    if (!team) return <NotFoundPage title="Team not found" />;
    if (team.type === 'National') return <NationalTeamPage team={team} universe={universe} onBack={onBack} onPlayer={onPlayer} onCoach={onCoach} onCompetition={onCompetition} />;
    return <TeamPage team={team} universe={universe} onBack={onBack} onPlayer={onPlayer} onCoach={onCoach} onCompetition={onCompetition} />;
  }
  if (detail.type === 'player') { const player = playerById.get(detail.id); return player ? <PlayerPage player={player} universe={universe} onBack={onBack} onTeam={onTeam} onCompetition={onCompetition} /> : <NotFoundPage title="Player not found" />; }
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
  return <>
    <section className="hero-grid"><div className="panel lead-story"><div className="kicker">The living basketball world</div><h2>Draft rights, contracts, free agency and careers that move between basketball systems</h2><p>Every player now keeps a permanent club ledger, international history, contracts, draft rights, titles and awards. Coaches have careers; owners shape recruitment, stability and long-term team fortunes.</p><div className="story-actions"><button className="text-button" onClick={() => setView('Tournaments')}>Open tournament world →</button><button className="text-button" onClick={() => goToRoute('market/free-agency')}>Open free agency →</button></div></div>
      <div className="metric-grid"><Metric label="NBA average" value={avg(nba).toFixed(1)} detail="Deepest talent pool" /><Metric label="EuroLeague average" value={avg(euro).toFixed(1)} detail="Top non-NBA clubs" /><Metric label="NCAA average" value={avg(ncaa).toFixed(1)} detail="Prospect level" /><Metric label="Current free agents" value={universe.freeAgents.length} detail="Visible market pool" /></div></section>
    <section className="two-column"><section className="panel"><SectionHeader title="Global team power" note="National teams excluded" /><div className="rank-list">{topTeams.filter((team) => team.type !== 'National').map((team,index) => <button className="rank-row rank-button" key={team.id} onClick={() => onTeam(team)}><span className="rank-number">{index+1}</span><TeamMark team={team}/><div className="grow"><strong><Flag value={team.country}/> {team.name}</strong><span>{team.competition} · raw {team.rawRating}</span></div><strong>{team.rating}</strong></button>)}</div></section><section className="panel"><SectionHeader title="Best players today" note="Open a full career" /><div className="rank-list">{leaders.map((player,index) => <button className="rank-row rank-button" key={player.id} onClick={() => onPlayer(player)}><span className="rank-number">{index+1}</span><div className="grow"><strong><Flag value={player.nationality}/> {player.name}</strong><span>{player.position} · {player.teamName}</span></div><Rarity value={player.rarity}/><strong>{player.current}</strong></button>)}</div></section></section>
    <section className="panel"><SectionHeader title="League strength" note="Current roster, coaching and institutional context"/><div className="table-wrap"><table><thead><tr><th>#</th><th>Competition</th><th>Region</th><th>Teams</th><th>Average rating</th></tr></thead><tbody>{leagueStrengths.map((row,index)=><tr key={row.competition.id}><td>{index+1}</td><td><strong>{row.competition.name}</strong></td><td><Flag value={row.competition.region}/> {row.competition.region}</td><td>{row.teams}</td><td><strong>{row.rating.toFixed(1)}</strong></td></tr>)}</tbody></table></div></section>
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

function CompetitionCards({ competitions, universe, onCompetition }) { return <div className="card-grid three">{competitions.map((competition) => { const teams = getCompetitionParticipants(universe, competition.id); const latest = universe.competitionHistory[competition.id]?.[0]; const active = isCompetitionActive(competition, universe.year); return <button className="competition-card competition-button" key={competition.id} onClick={() => onCompetition(competition)}><div className="color-stack">{teams.slice(0,7).map((team) => <span key={team.id} style={{background:team.color}}/>)}</div><div className="kicker"><Flag value={competition.country || competition.region}/> {competition.country} · {competition.kind}</div><h3>{competition.name}</h3><div className="competition-card-meta"><strong>{teams.length || latest?.standings?.length || 0} teams</strong><span>{active ? 'Active now' : competition.frequency ? `Every ${competition.frequency} years` : competition.detail}</span></div><p>{latest ? `${latest.year}: ${latest.champion} · MVP ${latest.mvp.name}` : 'No completed edition yet.'}</p></button>; })}</div>; }

function TeamsView({ universe, onTeam }) {
  const regions = unique(universe.teams.map((team) => team.region));
  const [region, setRegion] = useState('North America');
  const countries = unique(universe.teams.filter((team) => team.region === region).map((team) => team.country));
  const [country, setCountry] = useState('USA');
  const [competition, setCompetition] = useState('All');
  const [search, setSearch] = useState('');
  const safeCountry = countries.includes(country) ? country : countries[0];
  const countryTeams = universe.teams.filter((team) => team.region === region && team.country === safeCountry);
  const competitions = unique(countryTeams.flatMap((team) => [team.competition, ...team.secondaryCompetitions]));
  const shown = countryTeams.filter((team) => (competition === 'All' || team.competition === competition || team.secondaryCompetitions.includes(competition)) && team.name.toLowerCase().includes(search.toLowerCase()));
  return <><div className="page-heading"><div><div className="kicker">Teams</div><h2>Region → country → team history</h2></div><div className="page-note">Clubs have 10 players; NCAA has only the starting five.</div></div><div className="tabs">{regions.map((item) => <button key={item} className={region === item ? 'active' : ''} onClick={() => {setRegion(item);setCountry(unique(universe.teams.filter((team)=>team.region===item).map((team)=>team.country))[0]);setCompetition('All');}}><Flag value={item}/> {item}</button>)}</div><div className="tabs countries">{countries.map((item)=><button key={item} className={safeCountry===item?'active':''} onClick={()=>{setCountry(item);setCompetition('All');}}><Flag value={item}/> {item}</button>)}</div><div className="filters compact"><Filter label="Competition"><select value={competition} onChange={(e)=>setCompetition(e.target.value)}><option>All</option>{competitions.map((item)=><option key={item}>{item}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Team name"/></Filter></div><div className="card-grid four">{shown.map((team)=><button className="team-card" key={team.id} onClick={()=>onTeam(team)}><span className="team-color" style={{background:team.color}}/><div className="team-card-top"><TeamMark team={team}/><span className="team-rating">{team.rating}</span></div><h3>{team.name}</h3><p><Flag value={team.country}/> {team.type==='NCAA'?team.secondaryCompetitions.at(-1):team.competition}</p><div className="tag-row"><span>{team.rosterIds.length} players</span><span>{team.honors.length} titles</span>{team.tier===2&&<span className="danger-tag">Tier 2</span>}{team.secondaryCompetitionIds.includes('euroleague')&&<span className="blue-tag">EuroLeague</span>}</div></button>)}</div></>;
}

function PlayersView({ universe, teamById, onPlayer }) {
  const [status,setStatus]=useState('Active'); const [region,setRegion]=useState('All'); const [competition,setCompetition]=useState('All'); const [position,setPosition]=useState('All'); const [rarity,setRarity]=useState('All'); const [search,setSearch]=useState('');
  const allPlayers=status==='Active'?universe.players.filter((player)=>player.status!=='Free Agent'):status==='Free Agents'?universe.players.filter((player)=>player.status==='Free Agent'):status==='Retired'?universe.retiredPlayers:[...universe.players,...universe.retiredPlayers];
  const competitions=unique(universe.teams.flatMap((team)=>[team.competition,...team.secondaryCompetitions]));
  const shown=allPlayers.filter((player)=>{const team=teamById.get(player.teamId);return(region==='All'||player.region===region)&&(competition==='All'||player.competition===competition||team?.secondaryCompetitions.includes(competition))&&(position==='All'||player.position===position)&&(rarity==='All'||player.rarity===rarity)&&`${player.name} ${player.teamName} ${player.nationality}`.toLowerCase().includes(search.toLowerCase());}).sort((a,b)=>b.current-a.current);
  return <section className="panel"><SectionHeader title="Players" note={`${shown.length.toLocaleString()} matching careers; showing first 400`}/><div className="filters six"><Filter label="Status"><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>Active</option><option>Free Agents</option><option>Retired</option><option>All</option></select></Filter><Filter label="Continent"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option>All</option>{unique(allPlayers.map((p)=>p.region)).map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Competition"><select value={competition} onChange={(e)=>setCompetition(e.target.value)}><option>All</option>{competitions.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Position"><select value={position} onChange={(e)=>setPosition(e.target.value)}><option>All</option>{POSITION_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(e)=>setRarity(e.target.value)}><option>All</option>{RARITY_ORDER.map((i)=><option key={i}>{i}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Player, team, country"/></Filter></div><PlayerTable players={shown.slice(0,400)} onPlayer={onPlayer}/></section>;
}

function CoachesView({ universe, onCoach, onTeam }) {
  const [section,setSection]=useState('Coaches');
  const [status,setStatus]=useState('Active');
  const [region,setRegion]=useState('All');
  const coaches=status==='Active'?universe.coaches.filter((coach)=>coach.status==='Active'):status==='Free Agents'?universe.coaches.filter((coach)=>coach.status==='Free Agent'):universe.retiredCoaches;
  const shown=coaches.filter((coach)=>{const team=universe.teams.find((item)=>item.id===coach.teamId);return region==='All'||team?.region===region;}).sort((a,b)=>b.current-a.current);
  const owners=(status==='Former'?universe.formerOwners:universe.owners).filter((owner)=>{const team=universe.teams.find((item)=>item.id===owner.teamId);return region==='All'||team?.region===region;}).sort((a,b)=>(b.recruitment+b.stability+b.development)-(a.recruitment+a.stability+a.development));
  return <><div className="page-heading"><div><div className="kicker">Leadership world</div><h2>Coaches and presidents / owners</h2></div><div className="page-note">Coaching careers move through the market. Ownership mandates shape recruitment, patience, stability and development.</div></div><div className="tabs"><button className={section==='Coaches'?'active':''} onClick={()=>{setSection('Coaches');setStatus('Active');}}>Coaches</button><button className={section==='Owners'?'active':''} onClick={()=>{setSection('Owners');setStatus('Active');}}>Presidents / owners</button></div>
    <section className="panel"><div className="filters compact"><Filter label="Status"><select value={status} onChange={(e)=>setStatus(e.target.value)}>{section==='Coaches'?<><option>Active</option><option>Free Agents</option><option>Retired</option></>:<><option>Active</option><option>Former</option></>}</select></Filter><Filter label="Region"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option>All</option>{unique(universe.teams.map((team)=>team.region)).map((item)=><option key={item}>{item}</option>)}</select></Filter></div>
      {section==='Coaches'?<><SectionHeader title="Coaches" note="Permanent careers, firings, transfers and retirement"/><div className="table-wrap"><table><thead><tr><th>Coach</th><th>Team</th><th>Rarity</th><th>Style</th><th>OVR</th><th>Off</th><th>Def</th><th>Dev</th><th>Contract</th></tr></thead><tbody>{shown.map((coach)=><tr className="clickable" key={coach.id} onClick={()=>onCoach(coach)}><td><strong>{coach.name}</strong><br/><small><Flag value={coach.nationality}/> {coach.nationality}</small></td><td>{coach.teamId?<LinkButton onClick={()=>onTeam(coach.teamId)}>{coach.teamName}</LinkButton>:coach.teamName}</td><td><Rarity value={coach.rarity}/></td><td>{coach.style}</td><td><strong>{coach.current}</strong></td><td>{coach.offense}</td><td>{coach.defense}</td><td>{coach.development}</td><td>{coach.contractEnd??'—'}</td></tr>)}</tbody></table></div></>:<><SectionHeader title={status==='Former'?'Completed ownership mandates':'Current presidents / owners'} note={`${owners.length} leadership records`}/><div className="table-wrap"><table><thead><tr><th>President / owner</th><th>Team</th><th>Rarity</th><th>Profile</th><th>Mandate</th><th>Recruitment</th><th>Stability</th><th>Development</th><th>Titles</th></tr></thead><tbody>{owners.map((owner)=><tr key={owner.id}><td><strong>{owner.name}</strong><br/><small><Flag value={owner.nationality}/> {owner.nationality}</small></td><td><LinkButton onClick={()=>onTeam(owner.teamId)}>{owner.teamName}</LinkButton></td><td><Rarity value={owner.rarity}/></td><td>{owner.profile}</td><td>{owner.startYear}–{owner.actualEndYear??owner.endYear}</td><td>{owner.recruitment}</td><td>{owner.stability}</td><td>{owner.development}</td><td>{owner.history.reduce((sum,season)=>sum+(season.titles?.length??0),0)}</td></tr>)}</tbody></table></div></>}</section>
  </>;
}
function MarketView({ universe, tab, setTab, onPlayer, onTeam, onCoach }) {
  const [rarity,setRarity]=useState('All');
  const [search,setSearch]=useState('');
  const [sort,setSort]=useState('Newest');
  const [yearFilter,setYearFilter]=useState('All');
  const allPlayers=[...universe.players,...universe.retiredPlayers];
  const playerMap=new Map(allPlayers.map((player)=>[player.id,player]));
  const coachMap=new Map([...universe.coaches,...universe.retiredCoaches].map((coach)=>[coach.id,coach]));
  const latestDraft=universe.draftHistory[0]; const latestSpawn=universe.spawnHistory[0]; const latestTalent=universe.talentHistory?.[0]; const latestSummary=universe.offseasonHistory?.[0];
  const tabs=['Offseason Summary','Trades','Transfers','Draft','Rights','Free Agency','Retirements','Spawn','Coaches'];
  const years=unique([
    ...universe.transactions.map((item)=>item.year),...universe.retirements.map((item)=>item.year),...universe.draftHistory.map((item)=>item.year),
    ...universe.spawnHistory.map((item)=>item.year),...universe.coachTransactions.map((item)=>item.year),...(universe.offseasonHistory??[]).map((item)=>item.year),
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
  const improved=[...summaryTeams].sort((a,b)=>b.delta-a.delta||b.after-a.after).slice(0,12);
  const worsened=[...summaryTeams].sort((a,b)=>a.delta-b.delta||a.after-b.after).slice(0,12);
  return <><div className="page-heading"><div><div className="kicker">Offseason & Market</div><h2>Draft, trades, contracts, free agency and roster movement</h2></div><div className="page-note">The offseason now runs in inspectable stages. Basketball uses more player movement than the football build, especially through NBA trades and international transfers.</div></div>
    {universe.offseason?.active&&<div className="offseason-progress">{OFFSEASON_STAGES.map((stage,index)=><span key={stage} className={index<universe.offseason.stageIndex?'done':index===universe.offseason.stageIndex?'active':''}>{index+1}. {stage}</span>)}</div>}
    <div className="tabs market-tabs">{tabs.map((item)=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>
    {tab==='Offseason Summary'&&<><section className="panel"><SectionHeader title={selectedSummary?`${selectedSummary.year} offseason summary`:'Offseason summary'} note="Who improved, who declined and how much movement occurred"/><div className="filters compact market-controls"><Filter label="Offseason"><select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)}><option>All</option>{(universe.offseasonHistory??[]).map((item)=><option key={item.year} value={item.year}>{item.year}</option>)}</select></Filter></div>{selectedSummary?<><div className="metric-grid detail-metrics"><Metric label="NBA trades" value={selectedSummary.nbaTrades} detail="Completed player-for-player deals"/><Metric label="International transfers" value={selectedSummary.internationalTransfers} detail="Club-to-club moves"/><Metric label="Free-agent signings" value={selectedSummary.freeAgentSignings} detail="Open-market contracts"/><Metric label="NBA international" value={`${selectedSummary.nbaInternationalShare}%`} detail={`${selectedSummary.nbaInternationalPlayers} of 300 modeled roster spots`}/></div><div className="two-column section-gap"><OffseasonTeamMovement title="Most improved" rows={improved} onTeam={onTeam}/><OffseasonTeamMovement title="Biggest declines" rows={worsened} onTeam={onTeam}/></div></>:<div className="empty-state">Complete an offseason to generate the first movement report.</div>}</section></>}
    {tab==='Trades'&&<section className="panel"><SectionHeader title="Trade wire" note={`${tradeRows.length} matching NBA and international trades`}/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Rarity</th><th>Move</th><th>OVR</th><th>Detail</th></tr></thead><tbody>{tradeRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.playerId}-${item.year}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td><Rarity value={itemRarity(item)}/></td><td>{item.from} → {item.to}</td><td>{item.current??itemPlayer(item)?.current??'—'}</td><td>{item.type} · {item.detail}</td></tr>)}</tbody></table></div>{!tradeRows.length&&<div className="empty-state">No matching trades.</div>}</section>}
    {tab==='Transfers'&&<section className="panel"><SectionHeader title="Transaction wire" note="Contract expiry, releases, signings and roster decisions"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Rarity</th><th>Type</th><th>From</th><th>To</th><th>OVR</th></tr></thead><tbody>{transferRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.year}-${item.playerId}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td><Rarity value={itemRarity(item)}/></td><td>{item.type}</td><td>{item.from}</td><td>{item.to}</td><td>{item.current??itemPlayer(item)?.current??'—'}</td></tr>)}</tbody></table></div>{!transferRows.length&&<div className="empty-state">Complete the first offseason to populate the transaction wire.</div>}</section>}
    {tab==='Draft'&&<section className="panel"><SectionHeader title={selectedDraft?`${selectedDraft.year} NBA Draft`:'Draft board'} note={selectedDraft?`${selectedDraft.collegeGraduates} NCAA exits · ${selectedDraft.ncaaPicks} NCAA picks · ${selectedDraft.internationalPicks} international picks · ${selectedDraft.signed} immediate NBA signings`:'No draft completed for this filter'}/>{sharedControls}{selectedDraft?<div className="table-wrap"><table><thead><tr><th>Pick</th><th>Team</th><th>Player</th><th>Rarity</th><th>Pos</th><th>Origin</th><th>Route</th><th>Outcome</th><th>Base</th></tr></thead><tbody>{draftPicks.map((pick)=><tr key={pick.pick}><td><strong>{pick.pick}</strong></td><td><LinkButton onClick={()=>onTeam(pick.teamId)}>{pick.team}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(pick.playerId)}>{pick.player}</LinkButton></td><td><Rarity value={pick.rarity}/></td><td>{pick.position}</td><td>{pick.origin}</td><td>{pick.originType}</td><td>{pick.joinedNBA?'Joined NBA':'Rights retained'}</td><td>{pick.base}</td></tr>)}</tbody></table></div>:<div className="empty-state">Complete the season.</div>}</section>}
    {tab==='Rights'&&<section className="panel"><SectionHeader title="NBA draft rights" note={`${universe.draftRights.filter((right)=>right.active).length} active rights`}/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Player</th><th>Rarity</th><th>Rights team</th><th>Draft</th><th>Current team</th><th>OVR</th><th>Status</th></tr></thead><tbody>{rightsRows.map((right,index)=>{const player=playerMap.get(right.playerId);const team=universe.teams.find((item)=>item.id===right.teamId);return player&&team?<tr key={`${right.playerId}-${index}`}><td><LinkButton onClick={()=>onPlayer(player.id)}>{player.name}</LinkButton></td><td><Rarity value={player.rarity}/></td><td><LinkButton onClick={()=>onTeam(team.id)}>{team.name}</LinkButton></td><td>{right.acquiredYear}</td><td>{player.teamName}</td><td>{player.current}</td><td>{right.active?'Retained':'Activated / expired'}</td></tr>:null;})}</tbody></table></div></section>}
    {tab==='Free Agency'&&<section className="panel"><SectionHeader title="Current free agents" note={`${freeAgents.length} matching unsigned players · expired contracts and NCAA graduates`}/>{sharedControls}<PlayerTable players={freeAgents.slice(0,250)} onPlayer={onPlayer}/>{!freeAgents.length&&<div className="empty-state">No matching unsigned players.</div>}</section>}
    {tab==='Retirements'&&<section className="panel"><SectionHeader title="Retirement and exit ledger" note="Retirement remains distinct from leaving active professional basketball"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Player</th><th>Age</th><th>Last team</th><th>Reason</th><th>Rarity</th><th>Honors</th></tr></thead><tbody>{retirementRows.slice(0,400).map((item,index)=><tr className="clickable" key={`${item.playerId}-${index}`} onClick={()=>onPlayer(item.playerId)}><td>{item.year}</td><td><strong>{item.player}</strong></td><td>{item.age}</td><td>{item.lastTeam}</td><td>{item.reason}</td><td><Rarity value={item.rarity}/></td><td>{item.honors}</td></tr>)}</tbody></table></div>{!retirementRows.length&&<div className="empty-state">No matching retirements.</div>}</section>}
    {tab==='Spawn'&&<section className="panel"><SectionHeader title={selectedSpawn?`${selectedSpawn.year} incoming class`:'Spawn system'} note="NBA teams never generate players after universe creation"/>{selectedTalent&&<div className="metric-grid detail-metrics"><Metric label="Epic+ births" value={selectedTalent.totalElite} detail="Permanent rarity assigned at birth"/><Metric label="NCAA elite" value={selectedTalent.ncaaElite} detail={`${selectedTalent.ncaaShare}% of Epic+ class`}/><Metric label="International elite" value={selectedTalent.internationalElite} detail="Club systems outside the NBA"/><Metric label="Rarity changes" value="0" detail="Rarity and base never change"/></div>}{sharedControls}{selectedSpawn?<div className="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th>Route</th><th>Pos</th><th>Nationality</th><th>Rarity</th><th>Identity</th></tr></thead><tbody>{spawnRows.slice(0,600).map((spawn)=><tr key={spawn.playerId}><td><LinkButton onClick={()=>onPlayer(spawn.playerId)}>{spawn.player}</LinkButton></td><td>{spawn.team}</td><td>{spawn.route}</td><td>{spawn.position}</td><td><Flag value={spawn.nationality}/> {spawn.nationality}</td><td><Rarity value={spawn.rarity}/></td><td>{spawn.realIdentity?'Historical pool':'Procedural'}</td></tr>)}</tbody></table></div>:<div className="empty-state">First replacement class appears after year review.</div>}</section>}
    {tab==='Coaches'&&<section className="panel"><SectionHeader title="Coaching market" note="Appointments, firings, expired contracts and retirements"/>{sharedControls}<div className="table-wrap"><table><thead><tr><th>Year</th><th>Coach</th><th>Rarity</th><th>Move</th><th>OVR</th></tr></thead><tbody>{coachRows.slice(0,400).map((item,index)=>{const coach=coachMap.get(item.coachId);return <tr className="clickable" key={`${item.coachId}-${index}`} onClick={()=>onCoach(item.coachId)}><td>{item.year}</td><td><strong>{item.coach}</strong></td><td>{coach?<Rarity value={coach.rarity}/>:'—'}</td><td>{item.type} · {item.from} → {item.to}</td><td>{coach?.current??'—'}</td></tr>;})}</tbody></table></div>{!coachRows.length&&<div className="empty-state">No matching coaching changes yet.</div>}</section>}
  </>;
}
function MarketControls({rarity,setRarity,search,setSearch,sort,setSort,yearFilter,setYearFilter,years}) {return <div className="filters compact market-controls"><Filter label="Year"><select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)}><option>All</option>{years.map((year)=><option key={year} value={year}>{year}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(e)=>setRarity(e.target.value)}><option>All</option>{RARITY_ORDER.map((item)=><option key={item}>{item}</option>)}</select></Filter><Filter label="Sort"><select value={sort} onChange={(e)=>setSort(e.target.value)}><option>Newest</option><option>Rarity</option><option>Rating</option><option>Name</option></select></Filter><Filter label="Search"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Player, team, route"/></Filter></div>}
function OffseasonTeamMovement({title,rows,onTeam}) {return <section className="panel inset-panel"><SectionHeader title={title} note="Rating before → after"/><div className="rank-list">{rows.map((row,index)=><button className="rank-row rank-button" key={row.teamId} onClick={()=>onTeam(row.teamId)}><span className="rank-number">{index+1}</span><div className="grow"><strong><Flag value={row.country}/> {row.team}</strong><span>{row.competition} · {row.arrivals} in / {row.departures} out</span></div><span>{row.before} → {row.after}</span><strong className={row.delta>=0?'positive':'negative'}>{row.delta>=0?'+':''}{row.delta}</strong></button>)}</div></section>}

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

function MagazineView({ universe, onPlayer }) { const topPlayers=[...universe.players].filter((p)=>p.status==='Active').sort((a,b)=>b.current-a.current).slice(0,8);const draft=universe.draftHistory[0];return <><div className="magazine-header"><div className="kicker light">Weekly world basketball magazine</div><h2>The Global Five</h2><p>Careers, power shifts, draft stories and historical context.</p></div><div className="two-column"><section className="panel"><SectionHeader title="Market headline" note="Latest offseason"/>{draft?<article className="feature-copy"><h3>{draft.ncaaPicks} NCAA players and {draft.internationalPicks} international prospects drafted</h3><p>{draft.signed} joined immediately; {draft.rightsStashed} remain connected to NBA rights while building careers elsewhere.</p></article>:<div className="empty-state">Complete a season to create the first market story.</div>}</section><section className="panel"><SectionHeader title="Players to follow" note="Open a full career"/>{topPlayers.map((p)=><button className="feature-story" key={p.id} onClick={()=>onPlayer(p)}><Rarity value={p.rarity}/><div><strong>{p.name}</strong><p>{p.teamName} · {p.stats.ppg} PPG · {p.honors.length} honors</p></div></button>)}</section></div></>; }
function AlmanacView({ universe, onCompetition }) {const rows=COMPETITIONS.map((competition)=>({competition,seasons:universe.competitionHistory[competition.id]??[]})).filter((row)=>row.seasons.length);return <><div className="metric-grid almanac-metrics"><Metric label="Active players" value={formatNumber(universe.players.length)} detail="Including free agents"/><Metric label="Archived careers" value={formatNumber(universe.retiredPlayers.length)} detail="Retired or left game"/><Metric label="Coaching careers" value={formatNumber(universe.coaches.length+universe.retiredCoaches.length)} detail="Active and retired"/><Metric label="Former owners" value={formatNumber(universe.formerOwners.length)} detail="Completed mandates"/></div><section className="panel"><SectionHeader title="Competition almanac" note="Latest champion and recorded editions"/><div className="table-wrap"><table><thead><tr><th>Competition</th><th>Region</th><th>Seasons</th><th>Latest champion</th><th>Latest MVP</th></tr></thead><tbody>{rows.map(({competition,seasons})=><tr className="clickable" key={competition.id} onClick={()=>onCompetition(competition)}><td><strong>{competition.name}</strong></td><td>{competition.region}</td><td>{seasons.length}</td><td>{seasons[0].champion}</td><td>{seasons[0].mvp.name}</td></tr>)}</tbody></table></div></section></>;}

function TeamPage({ team, universe, onBack, onPlayer, onCoach, onCompetition }) {
  const [tab,setTab]=useState('Overview');const roster=team.rosterIds.map((id)=>universe.players.find((p)=>p.id===id)).filter(Boolean).sort((a,b)=>POSITION_ORDER.indexOf(a.position)-POSITION_ORDER.indexOf(b.position)||b.current-a.current);const coach=[...universe.coaches,...universe.retiredCoaches].find((item)=>item.id===team.coachId);const owner=[...universe.owners,...universe.formerOwners].find((item)=>item.id===team.ownerId);const locals=roster.filter((p)=>p.nationality===team.country||(team.type==='NBA'&&['USA','Canada'].includes(p.nationality))).length;
  return <><DetailHeader onBack={onBack}><div className="modal-title detail-title"><TeamMark team={team} size={68}/><div><div className="kicker"><Flag value={team.country}/> {team.country} · {team.region}</div><h2>{team.name}</h2><p className="linked-competitions"><LinkButton onClick={()=>onCompetition(team.competitionId)}>{team.competition}</LinkButton>{team.secondaryCompetitions.map((name,index)=><React.Fragment key={`${name}-${index}`}><span> · </span><LinkButton onClick={()=>onCompetition(team.secondaryCompetitionIds[index])}>{name}</LinkButton></React.Fragment>)}</p></div></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="World rating" value={team.rating} detail={`Raw roster ${team.rawRating}`}/><Metric label="Record" value={`${team.wins}–${team.losses}`} detail={team.competition}/><Metric label="Titles" value={team.honors.length} detail="Permanent cabinet"/><Metric label="Local players" value={`${locals}/${roster.length}`} detail={`Minimum ${team.localMinimum}`}/></div><DetailTabs tabs={['Overview','Seasons','Honors','Leadership','Transactions']} tab={tab} setTab={setTab}/>
    {tab==='Overview'&&<div className="two-column detail-columns"><section className="panel"><SectionHeader title="Current roster" note={`${roster.length} players`}/><PlayerTable players={roster} onPlayer={onPlayer} compact/></section><section className="panel"><SectionHeader title="Current identity" note="Leadership affects performance and recruitment"/><InfoLine label="Coach" value={coach?<LinkButton onClick={()=>onCoach(coach.id)}>{coach.name} · {coach.style}</LinkButton>:'Unassigned'}/><InfoLine label="President / owner" value={owner?`${owner.name} · ${owner.profile}`:'Unassigned'}/><InfoLine label="Owner rarity" value={owner?.rarity??'—'}/><InfoLine label="Prestige" value={team.prestige}/><InfoLine label="Tier" value={team.tier===2?'Second tier':'Top tier'}/><InfoLine label="NCAA alumni" value={roster.filter((p)=>p.originRoute==='NCAA').length}/></section></div>}
    {tab==='Seasons'&&<section className="panel"><SectionHeader title="Annual team breakdown" note="Coach, owner, record, rating and titles"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Competition</th><th>Record</th><th>Rating</th><th>Coach</th><th>Owner</th><th>Titles</th></tr></thead><tbody>{[...team.history].reverse().map((season,index)=>{const c=[...universe.coaches,...universe.retiredCoaches].find((item)=>item.id===season.coachId);const o=[...universe.owners,...universe.formerOwners].find((item)=>item.id===season.ownerId);return <tr key={`${season.year}-${index}`}><td><strong>{season.year}</strong></td><td>{season.competition}</td><td>{season.wins}–{season.losses}</td><td>{season.rating}</td><td>{c?.name??'—'}</td><td>{o?.name??'—'}</td><td>{season.titles.join(', ')||'—'}</td></tr>;})}</tbody></table></div></section>}
    {tab==='Honors'&&<TeamHonorsPanel honors={team.honors}/>} {tab==='Leadership'&&<div className="two-column"><section className="panel"><SectionHeader title="Head coach" note="Current appointment"/>{coach?<><InfoLine label="Name" value={<LinkButton onClick={()=>onCoach(coach.id)}>{coach.name}</LinkButton>}/><InfoLine label="Rarity" value={coach.rarity}/><InfoLine label="Style" value={coach.style}/><InfoLine label="Overall" value={coach.current}/><InfoLine label="Contract through" value={coach.contractEnd}/></>:<div className="empty-state">Vacant</div>}</section><section className="panel"><SectionHeader title="President / owner" note="Mandate and bonuses"/>{owner?<><InfoLine label="Name" value={owner.name}/><InfoLine label="Profile" value={owner.profile}/><InfoLine label="Rarity" value={owner.rarity}/><InfoLine label="Mandate" value={`${owner.startYear}–${owner.endYear}`}/><InfoLine label="Recruitment / stability" value={`${owner.recruitment} / ${owner.stability}`}/></>:<div className="empty-state">Vacant</div>}<h3 className="subheading">Past mandates</h3>{team.leadershipHistory.slice(0,10).map((item)=><div className="info-line" key={item.ownerId}><span>{item.startYear}–{item.endYear}</span><strong>{item.owner} · {item.profile}</strong></div>)}</section></div>}
    {tab==='Transactions'&&<TransactionPanel transactions={team.transactions} onPlayer={onPlayer}/>}</>;
}

function PlayerPage({ player, universe, onBack, onTeam, onCompetition }) {
  const [tab,setTab]=useState('Overview');const currentTeam=universe.teams.find((t)=>t.id===player.teamId);const rightsTeam=player.rightsTeamId?universe.teams.find((t)=>t.id===player.rightsTeamId):null;const collegeYearsShown=player.originRoute==='NCAA'?(player.teamType==='NCAA'?4:Math.min(4,Math.max(1,(player.yearsInNCAA??0)+1))):0;const developmentCurve=player.originRoute==='NCAA'?[...(player.ncaaCurve??[]).slice(0,collegeYearsShown),...(player.proCurve??[])]:player.careerCurve;const developmentIndex=player.originRoute==='NCAA'?(player.teamType==='NCAA'?Math.min(collegeYearsShown-1,player.yearsInNCAA??0):collegeYearsShown+Math.max(0,(player.proYears??1)-1)):player.careerYear;
  return <><DetailHeader onBack={onBack}><div className="modal-title detail-title"><div className="player-number">{player.position}</div><div><div className="kicker"><Flag value={player.nationality}/> {player.nationality} · {player.age} · {player.status}</div><h2>{player.name}{player.realIdentity&&<span className="historical-identity-badge">Historical pool</span>}</h2><p>{currentTeam?<LinkButton onClick={()=>onTeam(currentTeam.id)}>{player.teamName}</LinkButton>:player.teamName} · {player.role}</p></div></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Rarity" value={player.rarity} detail="Permanent"/><Metric label="Base" value={player.base} detail="Permanent ability"/><Metric label="Current" value={player.current} detail={`Career year ${player.careerYear+1}`}/><Metric label="Honors" value={player.honors.length} detail={`${player.internationalHistory?.length??0} international appearances`}/></div><DetailTabs tabs={['Overview','Career','International','Honors','Timeline']} tab={tab} setTab={setTab}/>
    {tab==='Overview'&&<><div className="two-column detail-columns"><section className="panel"><SectionHeader title="Career identity" note={player.careerProfile}/><InfoLine label="Position" value={player.position}/><InfoLine label="Height / body" value={`${player.height} cm · ${player.body}`}/><InfoLine label="Role" value={player.role}/><InfoLine label="Origin route" value={player.originRoute}/>{player.realIdentity&&<InfoLine label="Historical identity" value="Real-name legend pool"/>}<InfoLine label="Career length" value={`${player.careerYears} years`}/><InfoLine label="Current multiplier" value={player.developmentMultiplier??developmentCurve[developmentIndex]??'—'}/>{player.draft&&<><InfoLine label="NBA Draft" value={`${player.draft.year} · Pick ${player.draft.pick} · ${player.draft.team}`}/><InfoLine label="Current NBA rights" value={rightsTeam?.name??(player.nbaJoinedYear?'Activated':'None')}/></>}<InfoLine label="Contract" value={player.contract?`${player.contract.team} · ${player.contract.salaryTier} · through ${player.contract.endYear}`:'No active contract'}/></section><section className="panel"><SectionHeader title="Current production" note={`${player.stats.games} games`}/><InfoLine label="Points" value={`${player.stats.ppg} PPG`}/><InfoLine label="Rebounds" value={`${player.stats.rpg} RPG (${player.stats.orpg} ORB · ${player.stats.drpg} DRB)`}/><InfoLine label="Assists" value={`${player.stats.apg} APG`}/><InfoLine label="Defense" value={`${player.stats.spg} STL · ${player.stats.bpg} BLK`}/><InfoLine label="Shooting" value={`${player.stats.fg}% FG · ${player.stats.three}% 3P · ${player.stats.ft}% FT`}/></section></div><section className="panel"><SectionHeader title="Career progression" note={player.originRoute==='NCAA'?'College years are capped at 0.89; professional years use the adult curve':'Base and rarity never change'}/><div className="career-year-scroll"><div className="career-year-strip">{developmentCurve.map((value,index)=>{const displayed=Math.round(player.base*value);return <div key={index} className={`career-year-card ${index===developmentIndex?'current-year':''}`}><small>Y{index+1}</small><strong>{Number(value).toFixed(2)}</strong><span>{displayed}</span></div>;})}</div></div></section></>}
    {tab==='Career'&&<section className="panel"><SectionHeader title="Detailed annual breakdown" note="Team, contract, production, ability and honors"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Age</th><th>Team</th><th>Competition</th><th>Contract</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>OVR</th><th>Honors</th></tr></thead><tbody>{[...player.history].reverse().map((season,index)=><tr key={`${season.year}-${season.teamId}-${index}`}><td><strong>{season.year}</strong></td><td>{season.age}</td><td>{season.teamId?<LinkButton onClick={()=>onTeam(season.teamId)}>{season.team}</LinkButton>:season.team}</td><td>{season.competitionId!=='free-agency'?<LinkButton onClick={()=>onCompetition(season.competitionId)}>{season.competition}</LinkButton>:season.competition}</td><td>{season.contract?`${season.contract.salaryTier} · ${season.contract.endYear}`:'—'}</td><td>{season.games}</td><td>{season.ppg}</td><td>{season.rpg}</td><td>{season.apg}</td><td>{season.spg}</td><td>{season.bpg}</td><td>{season.current}</td><td>{formatHonorList(season.honors)}</td></tr>)}</tbody></table></div></section>}
    {tab==='International'&&<section className="panel"><SectionHeader title="National-team career" note="Olympics, World Cup and continental championships"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Country</th><th>Tournament</th><th>Result</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th></tr></thead><tbody>{[...(player.internationalHistory??[])].reverse().map((season,index)=><tr key={`${season.year}-${season.competitionId}-${index}`}><td>{season.year}</td><td>{season.team}</td><td><LinkButton onClick={()=>onCompetition(season.competitionId)}>{season.competition}</LinkButton></td><td>{season.result}</td><td>{season.games}</td><td>{season.ppg}</td><td>{season.rpg}</td><td>{season.apg}</td></tr>)}</tbody></table></div>{!player.internationalHistory?.length&&<div className="empty-state">No senior international tournament yet.</div>}</section>}
    {tab==='Honors'&&<PlayerHonorsPanel honors={player.honors}/>} {tab==='Timeline'&&<section className="panel"><SectionHeader title="Career timeline" note="Drafts, contracts, transfers, releases and retirement"/>{[...player.careerEvents].reverse().map((event,index)=><article className="timeline-event" key={`${event.year}-${index}`}><span>{event.year}</span><div><strong>{event.type}</strong><p>{event.detail}</p></div></article>)}</section>}</>;
}

function CoachPage({ coach, universe, onBack, onTeam }) { const [tab,setTab]=useState('Overview');const team=universe.teams.find((item)=>item.id===coach.teamId);return <><DetailHeader onBack={onBack}><div><div className="kicker">{coach.nationality} · {coach.age} · {coach.status}</div><h2>{coach.name}</h2><p>{team?<LinkButton onClick={()=>onTeam(team.id)}>{team.name}</LinkButton>:coach.teamName} · {coach.style}</p></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Rarity" value={coach.rarity} detail="Permanent coaching tier"/><Metric label="Overall" value={coach.current} detail={`Base ${coach.base}`}/><Metric label="Career year" value={coach.careerYear+1} detail={`${coach.careerYears} projected years`}/><Metric label="Honors" value={coach.honors.length} detail="Team titles"/></div><DetailTabs tabs={['Overview','Career','Honors','Timeline']} tab={tab} setTab={setTab}/>{tab==='Overview'&&<div className="two-column"><section className="panel"><SectionHeader title="Coaching profile" note={coach.style}/><InfoLine label="Offense" value={coach.offense}/><InfoLine label="Defense" value={coach.defense}/><InfoLine label="Development" value={coach.development}/><InfoLine label="Rotations" value={coach.rotations}/><InfoLine label="Playoff adjustments" value={coach.playoff}/><InfoLine label="Man-management" value={coach.management}/></section><section className="panel"><SectionHeader title="Appointment" note="Current status"/><InfoLine label="Team" value={team?team.name:coach.teamName}/><InfoLine label="Contract through" value={coach.contractEnd??'—'}/><InfoLine label="Career length" value={`${coach.careerYears} years`}/></section></div>}{tab==='Career'&&<section className="panel"><SectionHeader title="Annual coaching career" note="Team, record, ability and titles"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Team</th><th>Record</th><th>OVR</th><th>Titles</th></tr></thead><tbody>{[...coach.history].reverse().map((season,index)=><tr key={`${season.year}-${index}`}><td>{season.year}</td><td><LinkButton onClick={()=>onTeam(season.teamId)}>{season.team}</LinkButton></td><td>{season.record}</td><td>{season.current}</td><td>{season.titles.join(', ')||'—'}</td></tr>)}</tbody></table></div></section>}{tab==='Honors'&&<TeamHonorsPanel honors={coach.honors}/>} {tab==='Timeline'&&<section className="panel"><SectionHeader title="Coaching timeline" note="Appointments, firings and retirement"/>{[...coach.careerEvents].reverse().map((event,index)=><article className="timeline-event" key={`${event.year}-${index}`}><span>{event.year}</span><div><strong>{event.type}</strong><p>{event.detail}</p></div></article>)}</section>}</>; }

function CompetitionPage({ competition, universe, onBack, onPlayer, onTeam }) {
  const [tab,setTab]=useState('Overview');const participants=getCompetitionParticipants(universe,competition.id);const histories=universe.competitionHistory[competition.id]??[];const [bracketYear,setBracketYear]=useState(histories[0]?.year??universe.year);const latest=histories[0];const standings=participants.map((team)=>{const record=team.seasonRecords[competition.id]??team.seasonRecords[team.competitionId]??{wins:0,losses:0};return{team,wins:record.wins,losses:record.losses,pct:record.wins/Math.max(1,record.wins+record.losses)};}).sort((a,b)=>b.pct-a.pct||b.team.rating-a.team.rating);const leaders=currentLeaders(universe,competition);const rankings=competitionRankings(universe,competition.id);const bracketSeason=histories.find((season)=>season.year===Number(bracketYear))??latest;
  return <><DetailHeader onBack={onBack}><div><div className="kicker"><Flag value={competition.country || competition.region}/> {competition.region} · {competition.country} · {competition.kind}</div><h2>{competition.name}</h2><p>{participants.length || latest?.standings?.length || 0} teams · {isCompetitionActive(competition,universe.year)?'active this year':competition.frequency?`next edition follows a ${competition.frequency}-year cycle`:'domestic competition'}</p></div></DetailHeader><div className="metric-grid detail-metrics"><Metric label="Teams" value={participants.length||latest?.standings?.length||0} detail="Current / latest edition"/><Metric label="Recorded seasons" value={histories.length} detail="Permanent archive"/><Metric label="Latest champion" value={latest?.champion??'—'} detail={latest?String(latest.year):'No completed edition'}/><Metric label="Latest MVP" value={latest?.mvp.name??'—'} detail={latest?.mvp.team??'No award yet'}/></div><DetailTabs tabs={['Overview','Bracket','Seasons','Rankings','Teams']} tab={tab} setTab={setTab}/>
    {tab==='Overview'&&<div className="two-column detail-columns"><section className="panel"><SectionHeader title="Current standings" note="Regular season / seeding"/><div className="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Win %</th><th>Rating</th></tr></thead><tbody>{standings.slice(0,32).map((entry,index)=><tr className="clickable" key={entry.team.id} onClick={()=>onTeam(entry.team.id)}><td>{index+1}</td><td><TeamMark team={entry.team} size={25}/> <strong><Flag value={entry.team.country}/> {entry.team.name}</strong></td><td>{entry.wins}</td><td>{entry.losses}</td><td>{pct(entry.pct)}</td><td>{entry.team.rating}</td></tr>)}</tbody></table></div></section><section className="panel"><SectionHeader title="Current leaders" note="Projected until year review"/><LeaderLine label="MVP race" person={leaders.mvp} onPlayer={onPlayer}/><LeaderLine label="Points" person={leaders.points} suffix={leaders.points ? `${leaders.points.stats.ppg} PPG` : null} onPlayer={onPlayer}/><LeaderLine label="Rebounds" person={leaders.rebounds} suffix={leaders.rebounds ? `${leaders.rebounds.stats.rpg} RPG` : null} onPlayer={onPlayer}/><LeaderLine label="Assists" person={leaders.assists} suffix={leaders.assists ? `${leaders.assists.stats.apg} APG` : null} onPlayer={onPlayer}/></section></div>}
    {tab==='Bracket'&&<section className="panel"><SectionHeader title="Tournament bracket" note="See exactly who defeated whom"/>{histories.length?<><div className="filters compact"><Filter label="Edition"><select value={bracketSeason?.year??''} onChange={(e)=>setBracketYear(e.target.value)}>{histories.map((season)=><option key={season.year} value={season.year}>{season.year}</option>)}</select></Filter></div><BracketView rounds={bracketSeason?.bracket??[]} onTeam={onTeam}/></>:<div className="empty-state">The bracket is written at year review.</div>}</section>}
    {tab==='Seasons'&&<section className="panel"><SectionHeader title="Annual competition breakdown" note="Champion, finalist, MVP, playoff MVP and leaders"/><div className="table-wrap"><table><thead><tr><th>Year</th><th>Champion</th><th>Runner-up</th><th>MVP</th><th>Playoff / Finals MVP</th><th>Points</th><th>Rebounds</th><th>Assists</th></tr></thead><tbody>{histories.map((season)=><tr key={season.year}><td><strong>{season.year}</strong></td><td><LinkButton onClick={()=>onTeam(season.championTeamId)}>{season.champion}</LinkButton></td><td><LinkButton onClick={()=>onTeam(season.runnerUpTeamId)}>{season.runnerUp}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.mvp.id)}>{season.mvp.name}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.finalsMvp.id)}>{season.finalsMvp.name}</LinkButton></td><td><LinkButton onClick={()=>onPlayer(season.leaders.points.id)}>{season.leaders.points.name}</LinkButton> · {season.leaders.points.value}</td><td><LinkButton onClick={()=>onPlayer(season.leaders.rebounds.id)}>{season.leaders.rebounds.name}</LinkButton> · {season.leaders.rebounds.value}</td><td><LinkButton onClick={()=>onPlayer(season.leaders.assists.id)}>{season.leaders.assists.name}</LinkButton> · {season.leaders.assists.value}</td></tr>)}</tbody></table></div></section>}
    {tab==='Rankings'&&<div className="ranking-grid"><RankingPanel title="Top 10 points" rows={rankings.points} metric="points" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Top 10 rebounds" rows={rankings.rebounds} metric="rebounds" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Top 10 assists" rows={rankings.assists} metric="assists" onClick={(row)=>onPlayer(row.playerId)}/><RankingPanel title="Teams with most wins" rows={rankings.teamWins} metric="wins" onClick={(row)=>onTeam(row.teamId)}/><RankingPanel title="Teams with most titles" rows={rankings.teamTitles} metric="titles" onClick={(row)=>onTeam(row.teamId)}/></div>}
    {tab==='Teams'&&<div className="card-grid four">{participants.sort((a,b)=>b.rating-a.rating).map((team)=><button className="team-card" key={team.id} onClick={()=>onTeam(team.id)}><span className="team-color" style={{background:team.color}}/><div className="team-card-top"><TeamMark team={team}/><span className="team-rating">{team.rating}</span></div><h3>{team.name}</h3><p><Flag value={team.country}/> {team.country}</p></button>)}</div>}</>;
}
function BracketView({ rounds, onTeam }) { return rounds.length?<div className="bracket-scroll"><div className="bracket">{rounds.map((round)=><div className="bracket-round" key={round.name}><h3>{round.name}</h3>{round.matches.map((match,index)=><article className="bracket-match" key={`${round.name}-${index}`}><button className={match.winnerId===match.teamAId?'winner':''} onClick={()=>onTeam(match.teamAId)}><span>{match.teamA}</span><strong>{match.scoreA}</strong></button><button className={match.winnerId===match.teamBId?'winner':''} onClick={()=>onTeam(match.teamBId)}><span>{match.teamB}</span><strong>{match.scoreB}</strong></button></article>)}</div>)}</div></div>:<div className="empty-state">No bracket stored.</div>; }

function PlayerTable({ players,onPlayer,draft=false,highlight=null,compact=false }) {const value=(player)=>highlight?(highlight in player.stats?player.stats[highlight]:player[highlight]):null;return <div className="table-wrap"><table className={compact?'compact-table':''}><thead><tr><th>Player</th><th>Age</th><th>Team</th><th>Pos</th>{!compact&&<><th>Body</th><th>Role</th></>}<th>Rarity</th><th>Base</th><th>Current</th>{draft&&<th>Potential</th>}{highlight&&<th>Selected stat</th>}<th>PTS</th><th>REB</th><th>AST</th><th>Contract</th></tr></thead><tbody>{players.map((player)=><tr className="clickable" key={player.id} onClick={()=>onPlayer(player)}><td><strong>{player.name}</strong><br/><small><Flag value={player.nationality}/> {player.nationality}</small></td><td>{player.age}</td><td>{player.teamName}</td><td>{player.position}</td>{!compact&&<><td>{player.height} cm · {player.body}</td><td>{player.role}</td></>}<td><Rarity value={player.rarity}/></td><td>{player.base}</td><td><strong>{player.current}</strong></td>{draft&&<td>{player.potential}</td>}{highlight&&<td><strong>{value(player)}</strong></td>}<td>{player.stats.ppg}</td><td>{player.stats.rpg}</td><td>{player.stats.apg}</td><td>{player.contract?`${player.contract.salaryTier} · ${player.contract.endYear}`:'—'}</td></tr>)}</tbody></table></div>;}
function RankingPanel({title,rows,metric,onClick}) {return <section className="panel"><SectionHeader title={title} note="All recorded seasons"/><div className="rank-list">{rows.map((row,index)=><button className="rank-row rank-button" key={`${row.playerId??row.teamId}-${index}`} onClick={()=>onClick(row)}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.player??row.team}</strong><span>{row.seasons?`${row.seasons} seasons · ${row.games} games`:`${row.titles??0} titles`}</span></div><strong>{formatNumber(row[metric])}</strong></button>)}</div>{!rows.length&&<div className="empty-state small">No completed seasons yet.</div>}</section>;}
function countedLabels(items) {const counts=new Map();items.filter(Boolean).forEach((item)=>counts.set(item,(counts.get(item)??0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([label,count])=>count>1?`${label} ×${count}`:label);}
function formatHonorList(items) {const labels=countedLabels(items??[]);return labels.length?labels.join(', '):'—';}
function PlayerHonorsPanel({ honors }) {const years=unique(honors.map((h)=>h.year)).sort((a,b)=>Number(b)-Number(a));const allTitles=honors.filter((h)=>h.category==='team'||h.type==='Team title');const allAwards=honors.filter((h)=>!allTitles.includes(h));return <><section className="panel career-honor-summary"><SectionHeader title="Career honors" note="Repeated achievements are counted together"/><div className="two-column honor-summary-columns"><div><h3>Team titles</h3><HonorRow label="Titles" items={allTitles.map((h)=>h.competition)}/></div><div><h3>Individual awards</h3><HonorRow label="Awards" items={allAwards.map((h)=>`${h.competition} ${h.type}`)}/></div></div></section><section className="panel section-gap"><SectionHeader title="Honors by year" note={`${honors.length} tracked achievements`}/><div className="honors-timeline">{years.map((year)=>{const rows=honors.filter((h)=>String(h.year)===String(year));const titles=rows.filter((h)=>h.category==='team'||h.type==='Team title');const awards=rows.filter((h)=>!titles.includes(h));return <article className="honor-year" key={year}><h3>{year}</h3><div className="honor-year-content"><HonorRow label="Titles" items={titles.map((h)=>h.competition)}/><HonorRow label="Awards" items={awards.map((h)=>`${h.competition} ${h.type}`)}/></div></article>;})}</div>{!years.length&&<div className="empty-state">No honors yet.</div>}</section></>;}
function HonorRow({label,items}) {const counted=countedLabels(items);return <div className="honor-row"><strong>{label}</strong><div>{counted.length?counted.map((item,index)=><span className="honor-chip" key={`${item}-${index}`}>{item}</span>):<small>—</small>}</div></div>;}

function TeamHonorsPanel({honors}) {const years=unique(honors.map((h)=>h.year)).sort((a,b)=>Number(b)-Number(a));return <section className="panel"><SectionHeader title="Trophy cabinet" note={`${honors.length} titles`}/><div className="honors-timeline">{years.map((year)=><article className="honor-year" key={year}><h3>{year}</h3><div className="honor-year-content"><HonorRow label="Titles" items={honors.filter((h)=>String(h.year)===String(year)).map((h)=>h.competition)}/></div></article>)}</div>{!years.length&&<div className="empty-state">No titles yet.</div>}</section>;}
function TransactionPanel({transactions,onPlayer}) {return <section className="panel"><SectionHeader title="Transaction history" note={`${transactions.length} moves`}/>{transactions.length?transactions.map((item,index)=><article className="timeline-event" key={`${item.year}-${index}`}><span>{item.year}</span><div><strong>{item.type}: <LinkButton onClick={()=>onPlayer(item.playerId)}>{item.player}</LinkButton></strong><p>{item.from} → {item.to} · {item.detail}</p></div></article>):<div className="empty-state">No transactions yet.</div>}</section>;}
function DetailHeader({onBack,children}) {return <div className="detail-header"><button className="back-button" onClick={onBack}>← Back</button>{children}</div>;}
function DetailTabs({tabs,tab,setTab}) {return <div className="tabs detail-tabs">{tabs.map((item)=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>;}
function Metric({label,value,detail}) {return <div className="metric-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;}
function InfoLine({label,value}) {return <div className="info-line"><span>{label}</span><strong>{value}</strong></div>;}
function Filter({label,children}) {return <label className="filter"><span>{label}</span>{children}</label>;}
function SectionHeader({title,note}) {return <div className="section-header"><h2>{title}</h2><span>{note}</span></div>;}
