import React, { useMemo, useState } from 'react';
import {
  advanceToNextYear,
  competitionRankings,
  COMPETITIONS,
  createUniverse,
  getCompetition,
  getCompetitionParticipants,
  POSITION_ORDER,
  simulateWeeks,
} from './game/universe.js';

const NAV = ['World','Results','Tournaments','Teams','Players','Market','Statistics','The Global Five','Almanac'];
const RARITY_ORDER = ['Generational','Legend','Epic','Rare','Uncommon','Common'];
const unique = (items) => [...new Set(items)].filter(Boolean).sort((a, b) => a.localeCompare(b));
const pct = (value) => `${Math.round(value * 100)}%`;
const formatNumber = (value) => Math.round(value).toLocaleString();

function TeamMark({ team, size = 38 }) {
  if (!team) return <span className="team-mark" style={{ width: size, height: size }}>?</span>;
  const initials = team.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('');
  return <span className="team-mark" style={{ width: size, height: size, background: team.color, fontSize: Math.max(10, size * 0.28) }}>{initials}</span>;
}
function Rarity({ value }) { return <span className={`rarity rarity-${String(value).toLowerCase()}`}>{value}</span>; }
function LinkButton({ children, onClick }) { return <button className="inline-link" onClick={(event) => { event.stopPropagation(); onClick(); }}>{children}</button>; }

export default function App() {
  const [universe, setUniverse] = useState(() => createUniverse());
  const [view, setView] = useState('World');
  const [marketTab, setMarketTab] = useState('Transfers');
  const [detail, setDetail] = useState(null);

  const teamById = useMemo(() => new Map(universe.teams.map((team) => [team.id, team])), [universe.teams]);
  const playerById = useMemo(() => new Map([...universe.players, ...universe.retiredPlayers].map((player) => [player.id, player])), [universe.players, universe.retiredPlayers]);
  const activePlayers = universe.players.filter((player) => player.status === 'Active');
  const proTeams = universe.teams.filter((team) => team.type !== 'NCAA');
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');

  const navigate = (nextView) => { setView(nextView); setDetail(null); };
  const openTeam = (teamOrId) => setDetail({ type: 'team', id: typeof teamOrId === 'object' ? teamOrId.id : teamOrId });
  const openPlayer = (playerOrId) => setDetail({ type: 'player', id: typeof playerOrId === 'object' ? playerOrId.id : playerOrId });
  const openCompetition = (competitionOrId) => setDetail({ type: 'competition', id: typeof competitionOrId === 'object' ? competitionOrId.id : competitionOrId });
  const runWeeks = (weeks) => setUniverse((current) => simulateWeeks(current, weeks));
  const nextYear = () => setUniverse((current) => advanceToNextYear(current));

  return (
    <div className="app-shell">
      <header className="masthead">
        <div><div className="kicker light">The Global Five presents</div><h1>Basketball World Chronicle</h1></div>
        <div className="season-label"><strong>{universe.year}</strong><span>Week {universe.week} · {universe.phase}</span></div>
      </header>

      <section className="simulation-toolbar global-simulation">
        <div className="simulation-label"><strong>Advance the world</strong><span>Simulation controls are global—not a menu section.</span></div>
        <button className="button primary" disabled={universe.yearReview} onClick={() => runWeeks(1)}>1 week</button>
        <button className="button" disabled={universe.yearReview} onClick={() => runWeeks(4)}>4 weeks</button>
        <button className="button" disabled={universe.yearReview} onClick={() => runWeeks(50)}>To year review</button>
        {universe.yearReview && <button className="button primary" onClick={nextYear}>Draft, market & next year</button>}
        <div className="toolbar-note">{proTeams.length} pro teams × 10 · {ncaaTeams.length} NCAA teams × 5</div>
      </section>

      <nav className="main-nav">
        {NAV.map((item) => <button key={item} className={!detail && view === item ? 'active' : ''} onClick={() => navigate(item)}>{item}</button>)}
      </nav>

      <main>
        {universe.yearReview && <div className="year-review-banner"><strong>{universe.year} is complete.</strong> Every competition has awarded a champion, MVP and statistical leaders. Review the histories before advancing.</div>}
        {detail ? (
          <DetailRouter detail={detail} universe={universe} teamById={teamById} playerById={playerById} onBack={() => setDetail(null)} onTeam={openTeam} onPlayer={openPlayer} onCompetition={openCompetition} />
        ) : (
          <>
            {view === 'World' && <WorldView universe={universe} setView={navigate} setMarketTab={setMarketTab} onTeam={openTeam} onPlayer={openPlayer} />}
            {view === 'Results' && <ResultsView universe={universe} onTeam={openTeam} />}
            {view === 'Tournaments' && <TournamentsView universe={universe} onCompetition={openCompetition} />}
            {view === 'Teams' && <TeamsView universe={universe} onTeam={openTeam} />}
            {view === 'Players' && <PlayersView universe={universe} teamById={teamById} onPlayer={openPlayer} />}
            {view === 'Market' && <MarketView universe={universe} tab={marketTab} setTab={setMarketTab} onPlayer={openPlayer} onTeam={openTeam} />}
            {view === 'Statistics' && <StatisticsView universe={universe} teamById={teamById} onPlayer={openPlayer} />}
            {view === 'The Global Five' && <MagazineView universe={universe} onPlayer={openPlayer} onTeam={openTeam} />}
            {view === 'Almanac' && <AlmanacView universe={universe} onCompetition={openCompetition} />}
          </>
        )}
      </main>
    </div>
  );
}

function DetailRouter({ detail, universe, teamById, playerById, onBack, onTeam, onPlayer, onCompetition }) {
  if (detail.type === 'team') {
    const team = teamById.get(detail.id);
    return team ? <TeamPage team={team} universe={universe} onBack={onBack} onPlayer={onPlayer} onCompetition={onCompetition} /> : null;
  }
  if (detail.type === 'player') {
    const player = playerById.get(detail.id);
    return player ? <PlayerPage player={player} universe={universe} onBack={onBack} onTeam={onTeam} onCompetition={onCompetition} /> : null;
  }
  const competition = getCompetition(detail.id);
  return competition ? <CompetitionPage competition={competition} universe={universe} onBack={onBack} onPlayer={onPlayer} onTeam={onTeam} /> : null;
}

function WorldView({ universe, setView, setMarketTab, onTeam, onPlayer }) {
  const nba = universe.teams.filter((team) => team.type === 'NBA');
  const euro = universe.teams.filter((team) => team.secondaryCompetitionIds.includes('euroleague'));
  const ncaa = universe.teams.filter((team) => team.type === 'NCAA');
  const leaders = [...universe.players].sort((a, b) => b.current - a.current).slice(0, 6);
  const topTeams = [...universe.teams].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const avg = (items) => items.reduce((sum, item) => sum + item.rating, 0) / Math.max(1, items.length);
  return <>
    <section className="hero-grid">
      <div className="panel lead-story">
        <div className="kicker">The world hierarchy</div>
        <h2>NBA depth, European giants, college prospects and careers that cross all three</h2>
        <p>The ratings now include both roster quality and league context. Most elite depth belongs to the NBA; a few EuroLeague powers can exceed weak NBA teams, while an NCAA superstar remains a prospect—not the owner of the world’s best team.</p>
        <div className="story-actions">
          <button className="text-button" onClick={() => setView('Tournaments')}>Open tournament world →</button>
          <button className="text-button" onClick={() => { setMarketTab('Draft'); setView('Market'); }}>Track the draft pipeline →</button>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="NBA average" value={avg(nba).toFixed(1)} detail="Highest league depth" />
        <Metric label="EuroLeague average" value={avg(euro).toFixed(1)} detail="Elite international level" />
        <Metric label="NCAA average" value={avg(ncaa).toFixed(1)} detail="Prospects, not pro rosters" />
        <Metric label="Career histories" value={formatNumber(universe.players.reduce((sum, player) => sum + player.history.length, 0))} detail="Annual player seasons stored" />
      </div>
    </section>
    <section className="two-column">
      <div className="panel"><SectionHeader title="Global team power" note="League-calibrated current strength" /><div className="rank-list">{topTeams.map((team, index) => <button className="rank-row rank-button" key={team.id} onClick={() => onTeam(team)}><span className="rank-number">{index + 1}</span><TeamMark team={team} /><div className="grow"><strong>{team.name}</strong><span>{team.competition} · raw roster {team.rawRating}</span></div><strong>{team.rating}</strong></button>)}</div></div>
      <div className="panel"><SectionHeader title="Best players today" note="Click to follow the entire career" /><div className="rank-list">{leaders.map((player, index) => <button className="rank-row rank-button" key={player.id} onClick={() => onPlayer(player)}><span className="rank-number">{index + 1}</span><div className="grow"><strong>{player.name}</strong><span>{player.position} · {player.teamName}</span></div><Rarity value={player.rarity} /><strong>{player.current}</strong></button>)}</div></div>
    </section>
  </>;
}

function ResultsView({ universe, onTeam }) {
  const standings = [...universe.teams].sort((a, b) => b.wins / Math.max(1, b.wins + b.losses) - a.wins / Math.max(1, a.wins + a.losses) || b.rating - a.rating).slice(0, 60);
  return <section className="panel"><SectionHeader title="Results & form" note="Current primary-competition records" />
    {universe.results.length === 0 ? <div className="empty-state">Simulate one week to begin the results chronicle.</div> : universe.results.slice(0, 8).map((result) => <article className="news-strip" key={`${result.year}-${result.week}-${result.headline}`}><span>W{result.week}</span><div><strong>{result.headline}</strong><p>{result.detail}</p></div></article>)}
    <div className="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>Competition</th><th>Record</th><th>Win %</th><th>Raw</th><th>World rating</th></tr></thead><tbody>{standings.map((team, index) => <tr className="clickable" key={team.id} onClick={() => onTeam(team)}><td>{index + 1}</td><td><TeamMark team={team} size={28} /> <strong>{team.name}</strong></td><td>{team.competition}</td><td>{team.wins}–{team.losses}</td><td>{pct(team.wins / Math.max(1, team.wins + team.losses))}</td><td>{team.rawRating}</td><td><strong>{team.rating}</strong></td></tr>)}</tbody></table></div>
  </section>;
}

function TournamentsView({ universe, onCompetition }) {
  const regions = unique(COMPETITIONS.map((competition) => competition.region));
  const [region, setRegion] = useState('Europe');
  const [detailLevel, setDetailLevel] = useState('All');
  const competitions = COMPETITIONS.filter((competition) => competition.region === region && (detailLevel === 'All' || competition.detail === detailLevel))
    .map((competition) => ({ competition, teams: getCompetitionParticipants(universe, competition.id), latest: universe.competitionHistory[competition.id]?.[0] }))
    .filter((item) => item.teams.length > 1);
  return <>
    <div className="page-heading"><div><div className="kicker">Tournament universe</div><h2>Region → competition → permanent history</h2></div><div className="page-note">Open any competition for annual winners, MVPs, leaders and all-time rankings.</div></div>
    <div className="tabs">{regions.map((item) => <button key={item} className={region === item ? 'active' : ''} onClick={() => setRegion(item)}>{item}</button>)}</div>
    <div className="filters compact"><Filter label="Simulation detail"><select value={detailLevel} onChange={(event) => setDetailLevel(event.target.value)}><option>All</option><option value="detailed">Detailed</option><option value="high-level">High-level</option></select></Filter></div>
    <div className="card-grid three">{competitions.map(({ competition, teams, latest }) => <button className="competition-card competition-button" key={competition.id} onClick={() => onCompetition(competition)}>
      <div className="color-stack">{teams.slice(0, 7).map((team) => <span key={team.id} style={{ background: team.color }} />)}</div>
      <div className="kicker">{competition.country} · {competition.kind}</div><h3>{competition.name}</h3>
      <div className="competition-card-meta"><strong>{teams.length} teams</strong><span>{competition.detail}</span></div>
      <p>{latest ? `${latest.year}: ${latest.champion} · MVP ${latest.mvp.name}` : 'The first annual history will be written at year review.'}</p>
    </button>)}</div>
  </>;
}

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
  return <>
    <div className="page-heading"><div><div className="kicker">Teams</div><h2>Region → country → club history</h2></div><div className="page-note">Professional rosters: 10 · NCAA: starting five</div></div>
    <div className="tabs">{regions.map((item) => <button key={item} className={region === item ? 'active' : ''} onClick={() => { setRegion(item); setCountry(unique(universe.teams.filter((team) => team.region === item).map((team) => team.country))[0]); setCompetition('All'); }}>{item}</button>)}</div>
    <div className="tabs countries">{countries.map((item) => <button key={item} className={safeCountry === item ? 'active' : ''} onClick={() => { setCountry(item); setCompetition('All'); }}>{item}</button>)}</div>
    <div className="filters compact"><Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Team name" /></Filter></div>
    <div className="card-grid four">{shown.map((team) => <button className="team-card" key={team.id} onClick={() => onTeam(team)}><span className="team-color" style={{ background: team.color }} /><div className="team-card-top"><TeamMark team={team} /><span className="team-rating">{team.rating}</span></div><h3>{team.name}</h3><p>{team.type === 'NCAA' ? team.secondaryCompetitions.at(-1) : team.competition}</p><div className="tag-row"><span>{team.rosterIds.length} players</span><span>{team.honors.length} honors</span>{team.tier === 2 && <span className="danger-tag">Tier 2</span>}{team.secondaryCompetitionIds.includes('euroleague') && <span className="blue-tag">EuroLeague</span>}</div></button>)}</div>
  </>;
}

function PlayersView({ universe, teamById, onPlayer }) {
  const [status, setStatus] = useState('Active');
  const [region, setRegion] = useState('All');
  const [competition, setCompetition] = useState('All');
  const [position, setPosition] = useState('All');
  const [rarity, setRarity] = useState('All');
  const [search, setSearch] = useState('');
  const allPlayers = status === 'Active' ? universe.players : status === 'Retired' ? universe.retiredPlayers : [...universe.players, ...universe.retiredPlayers];
  const competitions = unique(universe.teams.flatMap((team) => [team.competition, ...team.secondaryCompetitions]));
  const shown = allPlayers.filter((player) => {
    const team = teamById.get(player.teamId);
    return (region === 'All' || player.region === region) && (competition === 'All' || player.competition === competition || team?.secondaryCompetitions.includes(competition)) && (position === 'All' || player.position === position) && (rarity === 'All' || player.rarity === rarity) && `${player.name} ${player.teamName} ${player.nationality}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => b.current - a.current);
  return <section className="panel"><SectionHeader title="Players" note={`${shown.length.toLocaleString()} matching careers; showing first 400`} />
    <div className="filters six"><Filter label="Status"><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Active</option><option>Retired</option><option>All</option></select></Filter><Filter label="Continent"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All</option>{unique(allPlayers.map((player) => player.region)).map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Position"><select value={position} onChange={(event) => setPosition(event.target.value)}><option>All</option>{POSITION_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Rarity"><select value={rarity} onChange={(event) => setRarity(event.target.value)}><option>All</option>{RARITY_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Player, team, country" /></Filter></div>
    <PlayerTable players={shown.slice(0, 400)} onPlayer={onPlayer} />
  </section>;
}

function MarketView({ universe, tab, setTab, onPlayer, onTeam }) {
  const latestDraft = universe.draftHistory[0];
  const latestSpawn = universe.spawnHistory[0];
  const draftBoard = universe.players.filter((player) => player.teamType !== 'NBA' && player.age >= 19 && player.age <= 22).sort((a, b) => (b.base + b.current) - (a.base + a.current)).slice(0, 120);
  return <>
    <div className="page-heading"><div><div className="kicker">Market</div><h2>Transfers, Draft and Spawn</h2></div><div className="page-note">Every move is also written into the player’s permanent career timeline.</div></div>
    <div className="tabs">{['Transfers','Draft','Rights','Spawn'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Transfers' && <section className="panel"><SectionHeader title="Transaction wire" note="NBA releases, draft-and-stash moves, overseas transfers and retirements" />{universe.transactions.length ? universe.transactions.slice(0, 160).map((item, index) => <article className="news-strip" key={`${item.year}-${item.playerId}-${index}`}><span>{item.year}</span><div><strong><LinkButton onClick={() => onPlayer(item.playerId)}>{item.player}</LinkButton></strong><p>{item.type} · {item.from} → {item.to} · {item.detail}</p></div></article>) : <div className="empty-state">Advance to the next season to run the first market cycle.</div>}</section>}
    {tab === 'Draft' && <section className="panel"><SectionHeader title={latestDraft ? `${latestDraft.year} NBA Draft` : 'Live draft board'} note={latestDraft ? `${latestDraft.collegeGraduates} college exits · ${latestDraft.signed} immediate NBA signings · ${latestDraft.rightsStashed} stashed rights` : 'NCAA and international prospects'} />{latestDraft ? <div className="table-wrap"><table><thead><tr><th>Pick</th><th>Team</th><th>Player</th><th>Pos</th><th>Origin</th><th>Outcome</th><th>Rarity</th><th>Base</th></tr></thead><tbody>{latestDraft.picks.map((pick) => <tr key={pick.pick}><td><strong>{pick.pick}</strong></td><td><LinkButton onClick={() => onTeam(pick.teamId)}>{pick.team}</LinkButton></td><td><LinkButton onClick={() => onPlayer(pick.playerId)}>{pick.player}</LinkButton></td><td>{pick.position}</td><td>{pick.origin}</td><td>{pick.joinedNBA ? 'Joined NBA' : 'Rights retained'}</td><td><Rarity value={pick.rarity} /></td><td>{pick.base}</td></tr>)}</tbody></table></div> : <PlayerTable players={draftBoard} onPlayer={onPlayer} draft />}</section>}
    {tab === 'Rights' && <section className="panel"><SectionHeader title="NBA draft rights" note={`${universe.draftRights.filter((right) => right.active).length} active rights`} /><div className="table-wrap"><table><thead><tr><th>Player</th><th>Rights team</th><th>Draft year</th><th>Current team</th><th>Current</th><th>Status</th></tr></thead><tbody>{universe.draftRights.slice().reverse().map((right, index) => { const player = [...universe.players, ...universe.retiredPlayers].find((item) => item.id === right.playerId); const team = universe.teams.find((item) => item.id === right.teamId); return player && team ? <tr key={`${right.playerId}-${index}`}><td><LinkButton onClick={() => onPlayer(player.id)}>{player.name}</LinkButton></td><td><LinkButton onClick={() => onTeam(team.id)}>{team.name}</LinkButton></td><td>{right.acquiredYear}</td><td>{player.teamName}</td><td>{player.current}</td><td>{right.active ? 'Retained' : 'Activated / expired'}</td></tr> : null; })}</tbody></table></div></section>}
    {tab === 'Spawn' && <section className="panel"><SectionHeader title={latestSpawn ? `${latestSpawn.year} incoming class` : 'Spawn system'} note="18-year-olds enter NCAA or club academies with permanent rarity, base and career profile" />{latestSpawn ? <div className="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th>Route</th><th>Pos</th><th>Nationality</th><th>Rarity</th></tr></thead><tbody>{latestSpawn.players.slice(0, 500).map((spawn) => <tr key={spawn.playerId}><td><LinkButton onClick={() => onPlayer(spawn.playerId)}>{spawn.player}</LinkButton></td><td>{spawn.team}</td><td>{spawn.route}</td><td>{spawn.position}</td><td>{spawn.nationality}</td><td><Rarity value={spawn.rarity} /></td></tr>)}</tbody></table></div> : <div className="empty-state">The first replacement class appears after year review.</div>}</section>}
  </>;
}

function StatisticsView({ universe, teamById, onPlayer }) {
  const [region, setRegion] = useState('All');
  const [competition, setCompetition] = useState('All');
  const [position, setPosition] = useState('All');
  const [category, setCategory] = useState('ppg');
  const categories = { ppg: 'Points per game', rpg: 'Rebounds per game', orpg: 'Offensive rebounds', drpg: 'Defensive rebounds', apg: 'Assists per game', spg: 'Steals per game', bpg: 'Blocks per game', fg: 'Field goal %', three: 'Three-point %', ft: 'Free throw %', current: 'Current ability', base: 'Permanent base' };
  const competitions = unique(universe.teams.flatMap((team) => [team.competition, ...team.secondaryCompetitions]));
  const shown = universe.players.filter((player) => { const team = teamById.get(player.teamId); return (region === 'All' || player.region === region) && (competition === 'All' || player.competition === competition || team?.secondaryCompetitions.includes(competition)) && (position === 'All' || player.position === position); }).sort((a, b) => (category in a.stats ? b.stats[category] - a.stats[category] : b[category] - a[category])).slice(0, 200);
  return <section className="panel"><SectionHeader title="Statistics" note={`${categories[category]} · filtered global leaderboard`} /><div className="filters"><Filter label="Continent"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All</option>{unique(universe.players.map((player) => player.region)).map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Position"><select value={position} onChange={(event) => setPosition(event.target.value)}><option>All</option>{POSITION_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter><Filter label="Category"><select value={category} onChange={(event) => setCategory(event.target.value)}>{Object.entries(categories).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></Filter></div><PlayerTable players={shown} onPlayer={onPlayer} highlight={category} /></section>;
}

function MagazineView({ universe, onPlayer, onTeam }) {
  const topPlayers = [...universe.players].sort((a, b) => b.current - a.current).slice(0, 8);
  const latestDraft = universe.draftHistory[0];
  const latestNBA = universe.competitionHistory.nba?.[0];
  const latestEuro = universe.competitionHistory.euroleague?.[0];
  return <><div className="magazine-header"><div className="kicker light">Weekly world basketball magazine</div><h2>The Global Five</h2><p>Careers, power shifts, draft stories and historical context.</p></div><div className="two-column"><section className="panel"><SectionHeader title="World headline" note="Current season" />{latestNBA ? <article className="feature-copy"><h3>{latestNBA.champion} rule the NBA</h3><p>{latestNBA.mvp.name} won MVP while {latestNBA.finalsMvp.name} owned the decisive stage.</p></article> : <div className="empty-state">Complete a season to write the first championship history.</div>}{latestEuro && <article className="feature-copy"><h3>{latestEuro.champion} conquer Europe</h3><p>{latestEuro.mvp.name} was named EuroLeague MVP.</p></article>}{latestDraft && <article className="feature-copy"><h3>{latestDraft.signed} rookies join immediately</h3><p>The other {latestDraft.rightsStashed} drafted players remain tracked through NBA rights and overseas development.</p></article>}</section><section className="panel"><SectionHeader title="Players to follow" note="Open a full career" />{topPlayers.map((player) => <button className="feature-story" key={player.id} onClick={() => onPlayer(player)}><Rarity value={player.rarity} /><div><strong>{player.name}</strong><p>{player.teamName} · {player.stats.ppg} PPG · {player.honors.length} honors</p></div></button>)}</section></div></>;
}

function AlmanacView({ universe, onCompetition }) {
  const championRows = COMPETITIONS.map((competition) => ({ competition, seasons: universe.competitionHistory[competition.id] ?? [] })).filter((row) => row.seasons.length);
  return <><div className="metric-grid almanac-metrics"><Metric label="Active players" value={formatNumber(universe.players.length)} detail="Tracked in current teams" /><Metric label="Archived careers" value={formatNumber(universe.retiredPlayers.length)} detail="Retired or left the game" /><Metric label="Completed drafts" value={universe.draftHistory.length} detail="60 picks each year" /><Metric label="Competition seasons" value={formatNumber(Object.values(universe.competitionHistory).reduce((sum, seasons) => sum + seasons.length, 0))} detail="Champions, MVPs and leaders" /></div><section className="panel"><SectionHeader title="Competition almanac" note="Latest champion and number of recorded seasons" /><div className="table-wrap"><table><thead><tr><th>Competition</th><th>Region</th><th>Seasons</th><th>Latest champion</th><th>Latest MVP</th></tr></thead><tbody>{championRows.map(({ competition, seasons }) => <tr className="clickable" key={competition.id} onClick={() => onCompetition(competition)}><td><strong>{competition.name}</strong></td><td>{competition.region}</td><td>{seasons.length}</td><td>{seasons[0].champion}</td><td>{seasons[0].mvp.name}</td></tr>)}</tbody></table></div></section></>;
}

function TeamPage({ team, universe, onBack, onPlayer, onCompetition }) {
  const [tab, setTab] = useState('Overview');
  const roster = team.rosterIds.map((id) => universe.players.find((player) => player.id === id)).filter(Boolean).sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || b.current - a.current);
  const coach = universe.coaches.find((item) => item.id === team.coachId);
  const locals = roster.filter((player) => player.nationality === team.country || (team.type === 'NBA' && ['USA','Canada'].includes(player.nationality))).length;
  return <>
    <DetailHeader onBack={onBack}><div className="modal-title detail-title"><TeamMark team={team} size={68} /><div><div className="kicker">{team.country} · {team.region}</div><h2>{team.name}</h2><p><LinkButton onClick={() => onCompetition(team.competitionId)}>{team.competition}</LinkButton>{team.secondaryCompetitions.length ? ` · ${team.secondaryCompetitions.join(' · ')}` : ''}</p></div></div></DetailHeader>
    <div className="metric-grid detail-metrics"><Metric label="World rating" value={team.rating} detail={`Raw roster ${team.rawRating}`} /><Metric label="Record" value={`${team.wins}–${team.losses}`} detail={team.competition} /><Metric label="Honors" value={team.honors.length} detail="Permanent trophy cabinet" /><Metric label="Local players" value={`${locals}/${roster.length}`} detail={`Minimum target ${team.localMinimum}`} /></div>
    <DetailTabs tabs={['Overview','Seasons','Honors','Transactions']} tab={tab} setTab={setTab} />
    {tab === 'Overview' && <div className="two-column detail-columns"><section className="panel"><SectionHeader title="Current roster" note={`${roster.length} active players`} /><PlayerTable players={roster} onPlayer={onPlayer} compact /></section><section className="panel"><SectionHeader title="Team identity" note="Current season" /><InfoLine label="Coach" value={coach ? `${coach.name} · ${coach.style}` : 'Unassigned'} /><InfoLine label="Coach nationality" value={coach?.nationality ?? '—'} /><InfoLine label="Prestige" value={team.prestige} /><InfoLine label="Tier" value={team.tier === 2 ? 'Second tier' : 'Top tier'} /><InfoLine label="Continental play" value={team.secondaryCompetitions.filter((item) => ['EuroLeague','EuroCup'].includes(item)).join(', ') || 'None'} /><InfoLine label="Roster model" value={team.type === 'NCAA' ? 'Starting five only' : '10 active players'} /></section></div>}
    {tab === 'Seasons' && <section className="panel"><SectionHeader title="Annual team breakdown" note="Every season remains permanently accessible" /><div className="table-wrap"><table><thead><tr><th>Year</th><th>Competition</th><th>Record</th><th>Rating</th><th>Coach</th><th>Titles</th></tr></thead><tbody>{[...team.history].reverse().map((season) => { const seasonCoach = universe.coaches.find((item) => item.id === season.coachId) ?? universe.retiredCoaches.find((item) => item.id === season.coachId); return <tr key={season.year}><td><strong>{season.year}</strong></td><td>{season.competition}</td><td>{season.wins}–{season.losses}</td><td>{season.rating}</td><td>{seasonCoach?.name ?? '—'}</td><td>{season.titles.join(', ') || '—'}</td></tr>; })}</tbody></table></div>{!team.history.length && <div className="empty-state">Complete the first season to create the annual breakdown.</div>}</section>}
    {tab === 'Honors' && <HonorsPanel honors={team.honors} />}
    {tab === 'Transactions' && <TransactionPanel transactions={team.transactions} universe={universe} onPlayer={onPlayer} />}
  </>;
}

function PlayerPage({ player, universe, onBack, onTeam, onCompetition }) {
  const [tab, setTab] = useState('Overview');
  const currentTeam = universe.teams.find((team) => team.id === player.teamId);
  const rightsTeam = player.rightsTeamId ? universe.teams.find((team) => team.id === player.rightsTeamId) : null;
  const nbaSeasons = player.history.filter((season) => season.competition === 'NBA').length;
  const euroSeasons = player.history.filter((season) => ['EuroLeague','Liga ACB','Greek League','Turkish BSL','Lega Basket Serie A'].includes(season.competition)).length;
  return <>
    <DetailHeader onBack={onBack}><div className="modal-title detail-title"><div className="player-number">{player.position}</div><div><div className="kicker">{player.nationality} · {player.age} years old · {player.status}</div><h2>{player.name}</h2><p>{currentTeam ? <LinkButton onClick={() => onTeam(currentTeam.id)}>{player.teamName}</LinkButton> : player.teamName} · {player.role}</p></div></div></DetailHeader>
    <div className="metric-grid detail-metrics"><Metric label="Rarity" value={player.rarity} detail="Permanent" /><Metric label="Base" value={player.base} detail="Permanent ability" /><Metric label="Current" value={player.current} detail={`Career year ${player.careerYear + 1}`} /><Metric label="Honors" value={player.honors.length} detail={`${nbaSeasons} NBA · ${euroSeasons} major Europe seasons`} /></div>
    <DetailTabs tabs={['Overview','Career','Honors','Timeline']} tab={tab} setTab={setTab} />
    {tab === 'Overview' && <><div className="two-column detail-columns"><section className="panel"><SectionHeader title="Career identity" note={player.careerProfile} /><InfoLine label="Position" value={player.position} /><InfoLine label="Height / body" value={`${player.height} cm · ${player.body}`} /><InfoLine label="Role" value={player.role} /><InfoLine label="Career length" value={`${player.careerYears} years`} /><InfoLine label="Annual shape" value={player.annualShape} />{player.draft && <><InfoLine label="NBA Draft" value={`${player.draft.year} · Pick ${player.draft.pick} · ${player.draft.team}`} /><InfoLine label="Draft origin" value={player.draft.origin} /><InfoLine label="Current NBA rights" value={rightsTeam?.name ?? (player.nbaJoinedYear ? 'Rights activated' : 'None')} /></>}</section><section className="panel"><SectionHeader title="Current production" note={`${player.stats.games} games`} /><InfoLine label="Points" value={`${player.stats.ppg} PPG`} /><InfoLine label="Rebounds" value={`${player.stats.rpg} RPG (${player.stats.orpg} ORB · ${player.stats.drpg} DRB)`} /><InfoLine label="Assists" value={`${player.stats.apg} APG`} /><InfoLine label="Defense" value={`${player.stats.spg} STL · ${player.stats.bpg} BLK`} /><InfoLine label="Shooting" value={`${player.stats.fg}% FG · ${player.stats.three}% 3P · ${player.stats.ft}% FT`} /></section></div><section className="panel"><SectionHeader title="Career multiplier curve" note="Base and rarity never change" /><div className="career-curve">{player.careerCurve.map((value, index) => <div key={index} className={index === player.careerYear ? 'current-year' : ''}><span style={{ height: `${value * 88}%` }} /><small>{index + 1}<br/>{value}</small></div>)}</div><div className="attribute-grid">{[['Inside',player.inside],['Mid-range',player.midrange],['Three',player.three],['Passing',player.passing],['Rebounding',player.rebounding],['Perimeter D',player.perimeterDefense],['Interior D',player.interiorDefense]].map(([label, value]) => <div className="attribute" key={label}><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${value}%` }} /></i></div>)}</div></section></>}
    {tab === 'Career' && <section className="panel"><SectionHeader title="Detailed annual breakdown" note="Team, league, production, ability and honors every year" /><div className="table-wrap"><table><thead><tr><th>Year</th><th>Age</th><th>Team</th><th>Competition</th><th>GP</th><th>MIN</th><th>PTS</th><th>REB</th><th>ORB</th><th>DRB</th><th>AST</th><th>STL</th><th>BLK</th><th>FG</th><th>3P</th><th>OVR</th><th>Honors</th></tr></thead><tbody>{[...player.history].reverse().map((season) => <tr key={`${season.year}-${season.teamId}`}><td><strong>{season.year}</strong></td><td>{season.age}</td><td><LinkButton onClick={() => onTeam(season.teamId)}>{season.team}</LinkButton></td><td><LinkButton onClick={() => onCompetition(season.competitionId)}>{season.competition}</LinkButton></td><td>{season.games}</td><td>{season.minutes}</td><td>{season.ppg}</td><td>{season.rpg}</td><td>{season.orpg}</td><td>{season.drpg}</td><td>{season.apg}</td><td>{season.spg}</td><td>{season.bpg}</td><td>{season.fg}%</td><td>{season.three}%</td><td>{season.current}</td><td>{season.honors.join(', ') || '—'}</td></tr>)}</tbody></table></div>{!player.history.length && <div className="empty-state">Complete the first season to begin this career ledger.</div>}</section>}
    {tab === 'Honors' && <HonorsPanel honors={player.honors} />}
    {tab === 'Timeline' && <section className="panel"><SectionHeader title="Career timeline" note="Drafts, releases, transfers, returns and retirement" />{[...player.careerEvents].reverse().map((event, index) => <article className="timeline-event" key={`${event.year}-${index}`}><span>{event.year}</span><div><strong>{event.type}</strong><p>{event.detail}</p></div></article>)}</section>}
  </>;
}

function CompetitionPage({ competition, universe, onBack, onPlayer, onTeam }) {
  const [tab, setTab] = useState('Overview');
  const participants = getCompetitionParticipants(universe, competition.id);
  const histories = universe.competitionHistory[competition.id] ?? [];
  const latest = histories[0];
  const standings = participants.map((team) => { const record = team.seasonRecords[competition.id] ?? team.seasonRecords[team.competitionId] ?? { wins: 0, losses: 0 }; return { team, wins: record.wins, losses: record.losses, pct: record.wins / Math.max(1, record.wins + record.losses) }; }).sort((a, b) => b.pct - a.pct || b.team.rating - a.team.rating);
  const playerPool = universe.players.filter((player) => participants.some((team) => team.id === player.teamId));
  const leaders = { points: [...playerPool].sort((a,b) => b.stats.ppg-a.stats.ppg).slice(0,10), rebounds: [...playerPool].sort((a,b) => b.stats.rpg-a.stats.rpg).slice(0,10), assists: [...playerPool].sort((a,b) => b.stats.apg-a.stats.apg).slice(0,10) };
  const rankings = competitionRankings(universe, competition.id);
  return <>
    <DetailHeader onBack={onBack}><div><div className="kicker">{competition.region} · {competition.country} · {competition.kind}</div><h2>{competition.name}</h2><p>{participants.length} participating teams · {competition.detail} simulation</p></div></DetailHeader>
    <div className="metric-grid detail-metrics"><Metric label="Teams" value={participants.length} detail="Current participants" /><Metric label="Recorded seasons" value={histories.length} detail="Permanent annual archive" /><Metric label="Latest champion" value={latest?.champion ?? '—'} detail={latest ? String(latest.year) : 'Complete first season'} /><Metric label="Latest MVP" value={latest?.mvp.name ?? '—'} detail={latest?.mvp.team ?? 'No award yet'} /></div>
    <DetailTabs tabs={['Overview','Seasons','Rankings','Teams']} tab={tab} setTab={setTab} />
    {tab === 'Overview' && <div className="two-column detail-columns"><section className="panel"><SectionHeader title="Current standings" note="Current season record" /><div className="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Win %</th><th>Rating</th></tr></thead><tbody>{standings.slice(0,24).map((entry,index) => <tr className="clickable" key={entry.team.id} onClick={() => onTeam(entry.team.id)}><td>{index+1}</td><td><TeamMark team={entry.team} size={25} /> <strong>{entry.team.name}</strong></td><td>{entry.wins}</td><td>{entry.losses}</td><td>{pct(entry.pct)}</td><td>{entry.team.rating}</td></tr>)}</tbody></table></div></section><section className="panel"><SectionHeader title="Current leaders" note="Top 10 available in Rankings" />{[['Points',leaders.points[0],'ppg'],['Rebounds',leaders.rebounds[0],'rpg'],['Assists',leaders.assists[0],'apg']].map(([label,player,key]) => player && <button className="leader-card" key={label} onClick={() => onPlayer(player.id)}><span>{label}</span><strong>{player.name}</strong><small>{player.teamName} · {player.stats[key]} {key.toUpperCase()}</small></button>)}</section></div>}
    {tab === 'Seasons' && <section className="panel"><SectionHeader title="Annual competition breakdown" note="Champion, finalist, MVP, finals MVP and statistical leaders" /><div className="table-wrap"><table><thead><tr><th>Year</th><th>Champion</th><th>Runner-up</th><th>MVP</th><th>Finals MVP</th><th>Points</th><th>Rebounds</th><th>Assists</th></tr></thead><tbody>{histories.map((season) => <tr key={season.year}><td><strong>{season.year}</strong></td><td><LinkButton onClick={() => onTeam(season.championTeamId)}>{season.champion}</LinkButton></td><td><LinkButton onClick={() => onTeam(season.runnerUpTeamId)}>{season.runnerUp}</LinkButton></td><td><LinkButton onClick={() => onPlayer(season.mvp.id)}>{season.mvp.name}</LinkButton></td><td><LinkButton onClick={() => onPlayer(season.finalsMvp.id)}>{season.finalsMvp.name}</LinkButton></td><td><LinkButton onClick={() => onPlayer(season.leaders.points.id)}>{season.leaders.points.name}</LinkButton> · {season.leaders.points.value}</td><td><LinkButton onClick={() => onPlayer(season.leaders.rebounds.id)}>{season.leaders.rebounds.name}</LinkButton> · {season.leaders.rebounds.value}</td><td><LinkButton onClick={() => onPlayer(season.leaders.assists.id)}>{season.leaders.assists.name}</LinkButton> · {season.leaders.assists.value}</td></tr>)}</tbody></table></div>{!histories.length && <div className="empty-state">The first season summary appears at year review.</div>}</section>}
    {tab === 'Rankings' && <div className="ranking-grid"><RankingPanel title="Top 10 points" rows={rankings.points} metric="points" onClick={(row) => onPlayer(row.playerId)} /><RankingPanel title="Top 10 rebounds" rows={rankings.rebounds} metric="rebounds" onClick={(row) => onPlayer(row.playerId)} /><RankingPanel title="Top 10 assists" rows={rankings.assists} metric="assists" onClick={(row) => onPlayer(row.playerId)} /><RankingPanel title="Teams with most wins" rows={rankings.teamWins} metric="wins" onClick={(row) => onTeam(row.teamId)} /><RankingPanel title="Teams with most titles" rows={rankings.teamTitles} metric="titles" onClick={(row) => onTeam(row.teamId)} /></div>}
    {tab === 'Teams' && <div className="card-grid four">{participants.sort((a,b) => b.rating-a.rating).map((team) => <button className="team-card" key={team.id} onClick={() => onTeam(team.id)}><span className="team-color" style={{ background: team.color }} /><div className="team-card-top"><TeamMark team={team} /><span className="team-rating">{team.rating}</span></div><h3>{team.name}</h3><p>{team.country}</p><div className="tag-row"><span>{team.wins}–{team.losses}</span><span>{team.honors.filter((honor) => honor.competitionId === competition.id).length} titles</span></div></button>)}</div>}
  </>;
}

function PlayerTable({ players, onPlayer, draft = false, highlight = null, compact = false }) {
  const value = (player) => highlight ? (highlight in player.stats ? player.stats[highlight] : player[highlight]) : null;
  return <div className="table-wrap"><table className={compact ? 'compact-table' : ''}><thead><tr><th>Player</th><th>Age</th><th>Team</th><th>Pos</th>{!compact && <><th>Body</th><th>Role</th></>}<th>Rarity</th><th>Base</th><th>Current</th>{draft && <th>Potential</th>}{highlight && <th>Selected stat</th>}<th>PTS</th><th>REB</th><th>AST</th></tr></thead><tbody>{players.map((player) => <tr className="clickable" key={player.id} onClick={() => onPlayer(player)}><td><strong>{player.name}</strong><br/><small>{player.nationality}</small></td><td>{player.age}</td><td>{player.teamName}</td><td>{player.position}</td>{!compact && <><td>{player.height} cm · {player.body}</td><td>{player.role}</td></>}<td><Rarity value={player.rarity} /></td><td>{player.base}</td><td><strong>{player.current}</strong></td>{draft && <td>{player.potential}</td>}{highlight && <td><strong>{value(player)}</strong></td>}<td>{player.stats.ppg}</td><td>{player.stats.rpg}</td><td>{player.stats.apg}</td></tr>)}</tbody></table></div>;
}
function RankingPanel({ title, rows, metric, onClick }) { return <section className="panel"><SectionHeader title={title} note="All recorded seasons" /><div className="rank-list">{rows.map((row,index) => <button className="rank-row rank-button" key={`${row.playerId ?? row.teamId}-${index}`} onClick={() => onClick(row)}><span className="rank-number">{index+1}</span><div className="grow"><strong>{row.player ?? row.team}</strong><span>{row.seasons ? `${row.seasons} seasons · ${row.games} games` : `${row.titles ?? 0} titles`}</span></div><strong>{formatNumber(row[metric])}</strong></button>)}</div>{!rows.length && <div className="empty-state small">No completed seasons yet.</div>}</section>; }
function HonorsPanel({ honors }) { return <section className="panel"><SectionHeader title="Honors" note={`${honors.length} tracked achievements`} />{honors.length ? <div className="honors-grid">{[...honors].sort((a,b) => b.year-a.year).map((honor,index) => <article className="honor-card" key={`${honor.year}-${honor.type}-${index}`}><strong>{honor.type}</strong><span>{honor.competition}</span><b>{honor.year}</b></article>)}</div> : <div className="empty-state">No honors yet.</div>}</section>; }
function TransactionPanel({ transactions, onPlayer }) { return <section className="panel"><SectionHeader title="Transaction history" note={`${transactions.length} moves`} />{transactions.length ? transactions.map((item,index) => <article className="timeline-event" key={`${item.year}-${index}`}><span>{item.year}</span><div><strong>{item.type}: <LinkButton onClick={() => onPlayer(item.playerId)}>{item.player}</LinkButton></strong><p>{item.from} → {item.to} · {item.detail}</p></div></article>) : <div className="empty-state">No transactions yet.</div>}</section>; }
function DetailHeader({ onBack, children }) { return <div className="detail-header"><button className="back-button" onClick={onBack}>← Back</button>{children}</div>; }
function DetailTabs({ tabs, tab, setTab }) { return <div className="tabs detail-tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>; }
function Metric({ label, value, detail }) { return <div className="metric-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function InfoLine({ label, value }) { return <div className="info-line"><span>{label}</span><strong>{value}</strong></div>; }
function Filter({ label, children }) { return <label className="filter"><span>{label}</span>{children}</label>; }
function SectionHeader({ title, note }) { return <div className="section-header"><h2>{title}</h2><span>{note}</span></div>; }
