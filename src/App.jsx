import React, { useMemo, useState } from 'react';
import { advanceToNextYear, createUniverse, POSITION_ORDER, simulateWeeks } from './game/universe.js';

const NAV = ['World','Results','Tournaments','Teams','Players','Market','Statistics','The Global Five','Almanac'];
const RARITY_ORDER = ['Generational','Legend','Epic','Rare','Uncommon','Common'];

const unique = (items) => [...new Set(items)].filter(Boolean).sort((a, b) => a.localeCompare(b));
const average = (items) => items.length ? items.reduce((sum, item) => sum + item, 0) / items.length : 0;
const pct = (value) => `${Math.round(value * 100)}%`;

function TeamMark({ team, size = 38 }) {
  const initials = team.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('');
  return (
    <span className="team-mark" style={{ width: size, height: size, background: team.color, fontSize: Math.max(10, size * 0.28) }}>
      {initials}
    </span>
  );
}

function Rarity({ value }) {
  return <span className={`rarity rarity-${value.toLowerCase()}`}>{value}</span>;
}

function App() {
  const [universe, setUniverse] = useState(() => createUniverse());
  const [view, setView] = useState('World');
  const [marketTab, setMarketTab] = useState('Transfers');
  const [modal, setModal] = useState(null);

  const teamById = useMemo(() => new Map(universe.teams.map((team) => [team.id, team])), [universe.teams]);
  const activePlayers = universe.players.filter((player) => player.status === 'Active');
  const proTeams = universe.teams.filter((team) => team.type !== 'NCAA');
  const ncaaTeams = universe.teams.filter((team) => team.type === 'NCAA');
  const ncaaPlayers = activePlayers.filter((player) => player.teamType === 'NCAA');

  const runWeeks = (weeks) => setUniverse((current) => simulateWeeks(current, weeks));
  const runToReview = () => setUniverse((current) => simulateWeeks(current, 50));
  const nextYear = () => setUniverse((current) => advanceToNextYear(current));

  return (
    <div className="app-shell">
      <header className="masthead">
        <div>
          <div className="kicker light">The Global Five presents</div>
          <h1>Basketball World Chronicle</h1>
        </div>
        <div className="season-label">
          <strong>{universe.year}</strong>
          <span>Week {universe.week} · {universe.phase}</span>
        </div>
      </header>

      <nav className="main-nav">
        {NAV.map((item) => (
          <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>
        ))}
      </nav>

      <main>
        <section className="simulation-toolbar">
          <button className="button primary" disabled={universe.yearReview} onClick={() => runWeeks(1)}>Simulate 1 week</button>
          <button className="button" disabled={universe.yearReview} onClick={() => runWeeks(4)}>Simulate 4 weeks</button>
          <button className="button" disabled={universe.yearReview} onClick={runToReview}>Simulate to year review</button>
          {universe.yearReview && <button className="button primary" onClick={nextYear}>Run draft, movement & new season</button>}
          <div className="toolbar-note">
            {proTeams.length} professional teams × 10 players · {ncaaTeams.length} NCAA programs × starting five
          </div>
        </section>

        {universe.yearReview && (
          <div className="year-review-banner">
            <strong>{universe.year} is complete.</strong> Review standings, leaders and stories before advancing. The next-year action runs the NBA Draft, European promotion/relegation, retirements and new 18-year-old spawns.
          </div>
        )}

        {view === 'World' && <WorldView universe={universe} setView={setView} setMarketTab={setMarketTab} />}
        {view === 'Results' && <ResultsView universe={universe} />}
        {view === 'Tournaments' && <TournamentsView universe={universe} />}
        {view === 'Teams' && <TeamsView universe={universe} onTeam={(team) => setModal({ type: 'team', id: team.id })} />}
        {view === 'Players' && <PlayersView universe={universe} teamById={teamById} onPlayer={(player) => setModal({ type: 'player', id: player.id })} />}
        {view === 'Market' && <MarketView universe={universe} tab={marketTab} setTab={setMarketTab} onPlayer={(player) => setModal({ type: 'player', id: player.id })} />}
        {view === 'Statistics' && <StatisticsView universe={universe} teamById={teamById} onPlayer={(player) => setModal({ type: 'player', id: player.id })} />}
        {view === 'The Global Five' && <MagazineView universe={universe} onPlayer={(player) => setModal({ type: 'player', id: player.id })} />}
        {view === 'Almanac' && <AlmanacView universe={universe} />}
      </main>

      {modal && <Modal universe={universe} modal={modal} onClose={() => setModal(null)} onPlayer={(id) => setModal({ type: 'player', id })} />}
    </div>
  );
}

function WorldView({ universe, setView, setMarketTab }) {
  const active = universe.players;
  const ncaa = active.filter((player) => player.teamType === 'NCAA');
  const nba = active.filter((player) => player.teamType === 'NBA');
  const europe = active.filter((player) => player.region === 'Europe');
  const leaders = [...active].sort((a, b) => b.current - a.current).slice(0, 5);
  const topTeams = [...universe.teams].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <>
      <section className="hero-grid">
        <div className="panel lead-story">
          <div className="kicker">World structure</div>
          <h2>A compact college world feeding a global professional market</h2>
          <p>The NCAA is intentionally represented through 200 selected Division I programs. Each program contains only its starting five—one PG, SG, SF, PF and C—while every professional club carries 10 active players.</p>
          <div className="story-actions">
            <button className="text-button" onClick={() => setView('Teams')}>Explore teams →</button>
            <button className="text-button" onClick={() => { setMarketTab('Draft'); setView('Market'); }}>Open draft board →</button>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="Active players" value={active.length.toLocaleString()} detail="Procedural careers" />
          <Metric label="NCAA prospects" value={ncaa.length.toLocaleString()} detail="Exactly five per program" />
          <Metric label="NBA players" value={nba.length} detail="10 per franchise" />
          <Metric label="Europe-based" value={europe.length} detail="Domestic + EuroLeague" />
        </div>
      </section>

      <section className="two-column">
        <div className="panel">
          <SectionHeader title="Global power ranking" note="Current roster ability" />
          <div className="rank-list">
            {topTeams.map((team, index) => (
              <div className="rank-row" key={team.id}>
                <span className="rank-number">{index + 1}</span><TeamMark team={team} />
                <div className="grow"><strong>{team.name}</strong><span>{team.competition}{team.secondaryCompetitions.includes('EuroLeague') ? ' · EuroLeague' : ''}</span></div>
                <strong>{team.rating}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionHeader title="Best players in the world" note="Ability today, not career score" />
          <div className="rank-list">
            {leaders.map((player, index) => (
              <div className="rank-row" key={player.id}>
                <span className="rank-number">{index + 1}</span>
                <div className="grow"><strong>{player.name}</strong><span>{player.position} · {player.teamName}</span></div>
                <Rarity value={player.rarity} />
                <strong>{player.current}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ResultsView({ universe }) {
  const standings = [...universe.teams].sort((a, b) => {
    const ap = a.wins / Math.max(1, a.wins + a.losses);
    const bp = b.wins / Math.max(1, b.wins + b.losses);
    return bp - ap || b.rating - a.rating;
  }).slice(0, 40);
  return (
    <section className="panel">
      <SectionHeader title="Results & form" note="Global snapshot; competition-specific schedules come next" />
      {universe.results.length === 0 && <div className="empty-state">Simulate a week to create the first Chronicle result stories.</div>}
      {universe.results.slice(0, 5).map((result) => <article className="news-strip" key={`${result.year}-${result.week}-${result.headline}`}><span>W{result.week}</span><div><strong>{result.headline}</strong><p>{result.detail}</p></div></article>)}
      <div className="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>Competition</th><th>Record</th><th>Win %</th><th>Rating</th></tr></thead><tbody>
        {standings.map((team, index) => <tr key={team.id}><td>{index + 1}</td><td><TeamMark team={team} size={28} /> <strong>{team.name}</strong></td><td>{team.competition}</td><td>{team.wins}–{team.losses}</td><td>{pct(team.wins / Math.max(1, team.wins + team.losses))}</td><td>{team.rating}</td></tr>)}
      </tbody></table></div>
    </section>
  );
}

function TournamentsView({ universe }) {
  const competitions = new Map();
  universe.teams.forEach((team) => {
    const values = [team.competition, ...team.secondaryCompetitions];
    values.forEach((competition) => {
      if (!competitions.has(competition)) competitions.set(competition, []);
      competitions.get(competition).push(team);
    });
  });
  const cards = [...competitions.entries()].sort((a, b) => b[1].length - a[1].length);
  return (
    <>
      <div className="page-heading"><div><div className="kicker">Tournament universe</div><h2>Domestic, continental and development competitions</h2></div></div>
      <div className="card-grid three">
        {cards.map(([name, teams]) => (
          <article className="competition-card" key={name}>
            <div className="color-stack">{teams.slice(0, 6).map((team) => <span key={team.id} style={{ background: team.color }} />)}</div>
            <div className="kicker">{unique(teams.map((team) => team.region)).join(' · ')}</div>
            <h3>{name}</h3>
            <div className="big-number">{teams.length}</div>
            <p>{name === 'NCAA Division I' ? '200 selected programs, five named starters each.' : name === 'EuroLeague' ? 'Top European clubs also compete in their domestic leagues.' : `${unique(teams.map((team) => team.country)).length} countries represented.`}</p>
          </article>
        ))}
      </div>
    </>
  );
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

  return (
    <>
      <div className="page-heading"><div><div className="kicker">Teams</div><h2>Region → country → competition</h2></div><div className="page-note">Professional rosters: 10 · NCAA rosters: starting five</div></div>
      <div className="tabs">{regions.map((item) => <button key={item} className={region === item ? 'active' : ''} onClick={() => { setRegion(item); setCountry(unique(universe.teams.filter((team) => team.region === item).map((team) => team.country))[0]); setCompetition('All'); }}>{item}</button>)}</div>
      <div className="tabs countries">{countries.map((item) => <button key={item} className={safeCountry === item ? 'active' : ''} onClick={() => { setCountry(item); setCompetition('All'); }}>{item}</button>)}</div>
      <div className="filters compact">
        <Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Team name" /></Filter>
      </div>
      <div className="card-grid four">
        {shown.map((team) => (
          <button className="team-card" key={team.id} onClick={() => onTeam(team)}>
            <span className="team-color" style={{ background: team.color }} />
            <div className="team-card-top"><TeamMark team={team} /><span className="team-rating">{team.rating}</span></div>
            <h3>{team.name}</h3>
            <p>{team.type === 'NCAA' ? team.secondaryCompetitions[0] : team.competition}</p>
            <div className="tag-row"><span>{team.rosterIds.length} players</span>{team.tier === 2 && <span className="danger-tag">Tier 2</span>}{team.secondaryCompetitions.includes('EuroLeague') && <span className="blue-tag">EuroLeague</span>}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function PlayersView({ universe, teamById, onPlayer }) {
  const [region, setRegion] = useState('All');
  const [competition, setCompetition] = useState('All');
  const [position, setPosition] = useState('All');
  const [rarity, setRarity] = useState('All');
  const [search, setSearch] = useState('');
  const allPlayers = [...universe.players, ...universe.retiredPlayers];
  const competitions = unique(universe.teams.flatMap((team) => [team.competition, ...team.secondaryCompetitions]));
  const shown = allPlayers.filter((player) => {
    const team = teamById.get(player.teamId);
    return (region === 'All' || player.region === region)
      && (competition === 'All' || player.competition === competition || team?.secondaryCompetitions.includes(competition))
      && (position === 'All' || player.position === position)
      && (rarity === 'All' || player.rarity === rarity)
      && `${player.name} ${player.teamName} ${player.nationality}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => b.current - a.current);

  return (
    <section className="panel">
      <SectionHeader title="Players" note={`${shown.length.toLocaleString()} matching players; showing first 300`} />
      <div className="filters">
        <Filter label="Continent"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All</option>{unique(allPlayers.map((player) => player.region)).map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Position"><select value={position} onChange={(event) => setPosition(event.target.value)}><option>All</option>{POSITION_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Rarity"><select value={rarity} onChange={(event) => setRarity(event.target.value)}><option>All</option>{RARITY_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Player, team, nationality" /></Filter>
      </div>
      <PlayerTable players={shown.slice(0, 300)} onPlayer={onPlayer} />
    </section>
  );
}

function MarketView({ universe, tab, setTab, onPlayer }) {
  const latestDraft = universe.draftHistory[0];
  const latestSpawn = universe.spawnHistory[0];
  const draftBoard = universe.players.filter((player) => player.teamType !== 'NBA' && player.age >= 19 && player.age <= 23).sort((a, b) => (b.base + b.current) - (a.base + a.current)).slice(0, 100);
  return (
    <>
      <div className="page-heading"><div><div className="kicker">Market</div><h2>Transfers, Draft and Spawn</h2></div></div>
      <div className="tabs">{['Transfers','Draft','Spawn'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
      {tab === 'Transfers' && <section className="panel"><SectionHeader title="Transaction wire" note="Trades, releases, NCAA exits, retirements and international movement" />{universe.transactions.length ? universe.transactions.slice(0, 100).map((item, index) => <article className="news-strip" key={`${item.year}-${index}`}><span>{item.year}</span><div><strong>{item.headline}</strong><p>{item.type} · {item.detail}</p></div></article>) : <div className="empty-state">Advance to the next season to run the first market cycle.</div>}</section>}
      {tab === 'Draft' && <section className="panel"><SectionHeader title={latestDraft ? `${latestDraft.year} NBA Draft` : 'Live draft board'} note={latestDraft ? 'Most recent completed class' : 'Eligible NCAA, G League and international prospects'} />
        {latestDraft ? <div className="table-wrap"><table><thead><tr><th>Pick</th><th>Team</th><th>Player</th><th>Pos</th><th>Origin</th><th>Rarity</th><th>Base</th></tr></thead><tbody>{latestDraft.picks.map((pick) => <tr key={pick.pick}><td><strong>{pick.pick}</strong></td><td>{pick.team}</td><td>{pick.player}</td><td>{pick.position}</td><td>{pick.origin}</td><td><Rarity value={pick.rarity} /></td><td>{pick.base}</td></tr>)}</tbody></table></div> : <PlayerTable players={draftBoard} onPlayer={onPlayer} draft />}
      </section>}
      {tab === 'Spawn' && <section className="panel"><SectionHeader title={latestSpawn ? `${latestSpawn.year} new player class` : 'Spawn rules'} note="All new players enter at age 18" />
        {!latestSpawn && <div className="card-grid three"><InfoCard title="NCAA" value="80% USA" text="Each program fills only missing PG, SG, SF, PF or C positions." /><InfoCard title="Other teams" value="80% local" text="The remaining 20% enables uncommon international academy stories." /><InfoCard title="Permanent identity" value="Rarity + base" text="Career length and multiplier curve are fixed at player creation." /></div>}
        {latestSpawn && <div className="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th>Route</th><th>Pos</th><th>Nationality</th><th>Rarity</th></tr></thead><tbody>{latestSpawn.players.slice(0, 300).map((spawn, index) => <tr key={`${spawn.player}-${index}`}><td><strong>{spawn.player}</strong></td><td>{spawn.team}</td><td>{spawn.route}</td><td>{spawn.position}</td><td>{spawn.nationality}</td><td><Rarity value={spawn.rarity} /></td></tr>)}</tbody></table></div>}
      </section>}
    </>
  );
}

function StatisticsView({ universe, teamById, onPlayer }) {
  const [region, setRegion] = useState('All');
  const [competition, setCompetition] = useState('All');
  const [category, setCategory] = useState('ppg');
  const [position, setPosition] = useState('All');
  const competitions = unique(universe.teams.flatMap((team) => [team.competition, ...team.secondaryCompetitions]));
  const labels = { ppg: 'Points', rpg: 'Rebounds', apg: 'Assists', spg: 'Steals', bpg: 'Blocks', fg: 'FG%', three: '3P%', current: 'Current ability', base: 'Base level' };
  const value = (player) => ['current','base'].includes(category) ? player[category] : player.stats[category];
  const shown = universe.players.filter((player) => {
    const team = teamById.get(player.teamId);
    return (region === 'All' || player.region === region) && (competition === 'All' || player.competition === competition || team?.secondaryCompetitions.includes(competition)) && (position === 'All' || player.position === position);
  }).sort((a, b) => value(b) - value(a)).slice(0, 200);
  return (
    <section className="panel">
      <SectionHeader title="Statistical leaders" note="Every table can be scoped to a continent, competition or position" />
      <div className="filters">
        <Filter label="Continent"><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All</option>{unique(universe.players.map((player) => player.region)).map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Competition"><select value={competition} onChange={(event) => setCompetition(event.target.value)}><option>All</option>{competitions.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Position"><select value={position} onChange={(event) => setPosition(event.target.value)}><option>All</option>{POSITION_ORDER.map((item) => <option key={item}>{item}</option>)}</select></Filter>
        <Filter label="Category"><select value={category} onChange={(event) => setCategory(event.target.value)}>{Object.entries(labels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></Filter>
      </div>
      <div className="table-wrap"><table><thead><tr><th>#</th><th>Player</th><th>Team</th><th>Pos</th><th>{labels[category]}</th><th>PPG</th><th>RPG</th><th>APG</th></tr></thead><tbody>{shown.map((player, index) => <tr className="clickable" key={player.id} onClick={() => onPlayer(player)}><td>{index + 1}</td><td><strong>{player.name}</strong><br/><small>{player.nationality}</small></td><td>{player.teamName}</td><td>{player.position}</td><td><strong>{value(player)}</strong></td><td>{player.stats.ppg}</td><td>{player.stats.rpg}</td><td>{player.stats.apg}</td></tr>)}</tbody></table></div>
    </section>
  );
}

function MagazineView({ universe, onPlayer }) {
  const breakouts = universe.players.filter((player) => player.age <= 21).sort((a, b) => b.current - a.current).slice(0, 8);
  const legends = universe.players.filter((player) => ['Legend','Generational'].includes(player.rarity)).sort((a, b) => b.current - a.current).slice(0, 8);
  return (
    <>
      <div className="magazine-header"><div className="kicker light">Weekly world basketball journal</div><h2>The Global Five</h2><p>{universe.year} · Week {universe.week}</p></div>
      <div className="two-column">
        <section className="panel"><SectionHeader title="Young players reshaping the map" note="Age 21 or younger" />{breakouts.map((player, index) => <button className="feature-story" key={player.id} onClick={() => onPlayer(player)}><span>0{index + 1}</span><div><strong>{player.name}</strong><p>{player.age}-year-old {player.role.toLowerCase()} at {player.teamName}; current {player.current}, permanent base {player.base}.</p></div></button>)}</section>
        <section className="panel"><SectionHeader title="Rare talent watch" note="Legend and Generational careers" />{legends.map((player) => <button className="feature-story" key={player.id} onClick={() => onPlayer(player)}><Rarity value={player.rarity} /><div><strong>{player.name}</strong><p>{player.position} · {player.teamName} · {player.stats.ppg} PPG</p></div></button>)}</section>
      </div>
    </>
  );
}

function AlmanacView({ universe }) {
  const byRarity = RARITY_ORDER.map((rarity) => ({ rarity, count: universe.players.filter((player) => player.rarity === rarity).length }));
  const drafts = universe.draftHistory;
  return (
    <div className="two-column">
      <section className="panel"><SectionHeader title="Universe ledger" note="The permanent structure behind every season" /><InfoLine label="Professional teams" value={universe.teams.filter((team) => team.type !== 'NCAA').length} /><InfoLine label="NCAA programs" value={universe.teams.filter((team) => team.type === 'NCAA').length} /><InfoLine label="Active players" value={universe.players.length.toLocaleString()} /><InfoLine label="Retired players" value={universe.retiredPlayers.length.toLocaleString()} /><InfoLine label="Completed drafts" value={drafts.length} /></section>
      <section className="panel"><SectionHeader title="Rarity population" note="Rarity and base never change" />{byRarity.map((item) => <InfoLine key={item.rarity} label={<Rarity value={item.rarity} />} value={item.count} />)}</section>
    </div>
  );
}

function PlayerTable({ players, onPlayer, draft = false }) {
  return <div className="table-wrap"><table><thead><tr><th>Player</th><th>Age</th><th>Team</th><th>Pos</th><th>Body</th><th>Role</th><th>Rarity</th><th>Base</th><th>Current</th>{draft && <th>Potential</th>}<th>PTS</th><th>REB</th><th>AST</th></tr></thead><tbody>{players.map((player) => <tr className="clickable" key={player.id} onClick={() => onPlayer(player)}><td><strong>{player.name}</strong><br/><small>{player.nationality}</small></td><td>{player.age}</td><td>{player.teamName}</td><td>{player.position}</td><td>{player.height} cm · {player.body}</td><td>{player.role}</td><td><Rarity value={player.rarity} /></td><td>{player.base}</td><td><strong>{player.current}</strong></td>{draft && <td>{player.potential}</td>}<td>{player.stats.ppg}</td><td>{player.stats.rpg}</td><td>{player.stats.apg}</td></tr>)}</tbody></table></div>;
}

function Modal({ universe, modal, onClose, onPlayer }) {
  const team = modal.type === 'team' ? universe.teams.find((item) => item.id === modal.id) : null;
  const player = modal.type === 'player' ? [...universe.players, ...universe.retiredPlayers].find((item) => item.id === modal.id) : null;
  if (!team && !player) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal-card"><button className="modal-close" onClick={onClose}>×</button>{team ? <TeamModal team={team} universe={universe} onPlayer={onPlayer} /> : <PlayerModal player={player} />}</div></div>;
}

function TeamModal({ team, universe, onPlayer }) {
  const roster = team.rosterIds.map((id) => universe.players.find((player) => player.id === id)).filter(Boolean).sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || b.current - a.current);
  return <><div className="modal-title"><TeamMark team={team} size={58} /><div><div className="kicker">{team.country} · {team.region}</div><h2>{team.name}</h2><p>{team.competition}{team.secondaryCompetitions.length ? ` · ${team.secondaryCompetitions.join(' · ')}` : ''}</p></div></div><div className="metric-grid modal-metrics"><Metric label="Roster" value={roster.length} detail={team.type === 'NCAA' ? 'Starting five only' : '10 active players'} /><Metric label="Rating" value={team.rating} detail="Current lineup" /><Metric label="Record" value={`${team.wins}–${team.losses}`} detail={team.competition} /><Metric label="Tier" value={team.tier ?? 1} detail={team.tier === 2 ? 'Promotion candidate' : 'Top level'} /></div><PlayerTable players={roster} onPlayer={(player) => onPlayer(player.id)} /></>;
}

function PlayerModal({ player }) {
  return <><div className="modal-title"><div className="player-number">{player.position}</div><div><div className="kicker">{player.nationality} · {player.age} years old</div><h2>{player.name}</h2><p>{player.teamName} · {player.role}</p></div></div><div className="metric-grid modal-metrics"><Metric label="Rarity" value={player.rarity} detail="Permanent" /><Metric label="Base" value={player.base} detail="Permanent ability" /><Metric label="Current" value={player.current} detail={`Career year ${player.careerYear + 1}`} /><Metric label="Career" value={`${player.careerYears} years`} detail={player.careerProfile} /></div><div className="two-column modal-columns"><section><h3>Physical identity</h3><InfoLine label="Position" value={player.position} /><InfoLine label="Height" value={`${player.height} cm`} /><InfoLine label="Body" value={player.body} /><InfoLine label="Role" value={player.role} /></section><section><h3>Season production</h3><InfoLine label="Points" value={`${player.stats.ppg} PPG`} /><InfoLine label="Rebounds" value={`${player.stats.rpg} RPG`} /><InfoLine label="Assists" value={`${player.stats.apg} APG`} /><InfoLine label="Defense" value={`${player.stats.spg} STL · ${player.stats.bpg} BLK`} /></section></div><h3>Career multiplier curve</h3><div className="career-curve">{player.careerCurve.map((value, index) => <div key={index} className={index === player.careerYear ? 'current-year' : ''}><span style={{ height: `${value * 88}%` }} /><small>{index + 1}</small></div>)}</div><div className="attribute-grid">{[['Inside',player.inside],['Mid-range',player.midrange],['Three',player.three],['Passing',player.passing],['Rebounding',player.rebounding],['Perimeter D',player.perimeterDefense],['Interior D',player.interiorDefense]].map(([label, value]) => <div className="attribute" key={label}><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${value}%` }} /></i></div>)}</div></>;
}

function Metric({ label, value, detail }) { return <div className="metric-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function InfoCard({ title, value, text }) { return <article className="info-card"><div className="kicker">{title}</div><div className="big-number">{value}</div><p>{text}</p></article>; }
function InfoLine({ label, value }) { return <div className="info-line"><span>{label}</span><strong>{value}</strong></div>; }
function Filter({ label, children }) { return <label className="filter"><span>{label}</span>{children}</label>; }
function SectionHeader({ title, note }) { return <div className="section-header"><h2>{title}</h2><span>{note}</span></div>; }

export default App;
