import React from 'react';
import { gradeFor, meterPercent } from './VisualIdentity.jsx';

const g = (value) => gradeFor(value).grade.toLowerCase();
const skill = (player, key) => Number.isFinite(player?.[key]) ? player[key] : Number(player?.current) || 60;

// Four broad skills for compact cards, derived from the seven engine ratings.
export function playerSkillProfile(player) {
  const avg = (...keys) => Math.round(keys.reduce((sum, key) => sum + skill(player, key), 0) / keys.length);
  return { scoring: avg('inside', 'midrange', 'three'), playmaking: avg('passing'), defense: avg('perimeterDefense', 'interiorDefense'), rebounding: avg('rebounding') };
}
export const PLAYER_CARD_ROWS = [['scoring', 'Scoring', 'Score'], ['playmaking', 'Playmaking', 'Pass'], ['defense', 'Defense', 'Def'], ['rebounding', 'Rebounding', 'Reb']];

const SKILL_GROUPS = [
  ['Offense', [['inside', 'Inside scoring'], ['midrange', 'Mid-range'], ['three', 'Three-point'], ['passing', 'Passing']]],
  ['Defense & boards', [['perimeterDefense', 'Perimeter defense'], ['interiorDefense', 'Interior defense'], ['rebounding', 'Rebounding']]],
];

export function SkillReport({ player }) {
  const all = SKILL_GROUPS.flatMap(([, rows]) => rows.map(([key, label]) => ({ key, label, value: skill(player, key) })));
  const best = [...all].sort((a, b) => b.value - a.value)[0];
  const worst = [...all].sort((a, b) => a.value - b.value)[0];
  return <div className="skill-report">
    {SKILL_GROUPS.map(([group, rows]) => <div className="skill-group" key={group}>
      <h3>{group}</h3>
      {rows.map(([key, label]) => { const value = skill(player, key); return <div className={`skill-row tone-g-${g(value)}`} key={key}>
        <span className="skill-label">{label}{key === best.key && <em className="skill-flag best">Best skill</em>}{key === worst.key && <em className="skill-flag weak">Weakest</em>}</span>
        <span className="sbar-track lg"><i style={{ width: `${meterPercent(value, 30, 99)}%` }}/></span>
        <span className={`skill-grade grade-${g(value)}`}><b>{gradeFor(value).grade}</b>{value}</span>
      </div>; })}
    </div>)}
  </div>;
}

// Where the player stands now against the ceiling his rarity fixed at birth.
export function AbilityMeter({ player }) {
  const floor = 40, ceil = 99;
  const pos = (v) => `${Math.max(0, Math.min(100, (v - floor) / (ceil - floor) * 100))}%`;
  const gap = Math.max(0, (player.base ?? player.current) - player.current);
  return <div className="ability-meter">
    <div className="ability-head">
      <div><span>Ability now</span><strong className={`tone-text-${g(player.current)}`}>{player.current}</strong></div>
      <div><span>Potential</span><strong>{player.base}</strong></div>
      <p>{gap <= 1 ? 'Playing at his ceiling.' : `${gap} points below his ceiling.`}</p>
    </div>
    <div className="ability-track" aria-hidden="true">
      {[63, 70, 76, 82, 88].map((t) => <i key={t} className="ability-tick" style={{ left: pos(t) }}/>)}
      <span className={`ability-fill g-${g(player.current)}`} style={{ width: pos(player.current) }}/>
      <span className="ability-potential" style={{ left: pos(player.base ?? player.current) }}/>
    </div>
    <div className="ability-scale" aria-hidden="true">{[['E', 40], ['D', 63], ['C', 70], ['B', 76], ['A', 82], ['S', 88]].map(([letter, at]) => <span key={letter} style={{ left: pos(at) }}>{letter}</span>)}</div>
  </div>;
}

// Career arc: solid where it has happened, dashed where the curve projects it.
export function CareerCurveChart({ base, curve, currentIndex, current }) {
  if (!curve?.length) return null;
  const ci = Math.max(0, Math.min(curve.length - 1, currentIndex ?? 0));
  // Anchor the projection on the real rating so "Now" always matches the player header.
  const scale = current && curve[ci] ? current / (base * curve[ci]) : 1;
  const values = curve.map((m) => Math.min(99, Math.round(base * m * scale)));
  const W = 560, H = 210, padL = 30, padR = 30, padT = 14, padB = 26;
  const lo = Math.max(40, Math.min(...values) - 6), hi = Math.min(99, Math.max(...values, 90) + 2);
  const x = (i) => padL + (curve.length === 1 ? 0 : i / (curve.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const path = (from, to) => values.slice(from, to + 1).map((v, i) => `${i ? 'L' : 'M'}${x(from + i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const idx = Math.max(0, Math.min(values.length - 1, currentIndex ?? 0));
  const peak = values.indexOf(Math.max(...values));
  const bands = [['S', 88, hi], ['A', 82, 88], ['B', 76, 82], ['C', 70, 76], ['D', 63, 70], ['E', lo, 63]].filter(([, a, b]) => b > lo && a < hi);
  return <svg className="career-curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Ability by career year. Now ${values[idx]}, peak ${values[peak]} in year ${peak + 1}.`}>
    {bands.map(([letter, a, b]) => { const top = y(Math.min(b, hi)), bot = y(Math.max(a, lo)); return <g key={letter}>
      <rect x={padL} y={top} width={W - padL - padR} height={Math.max(0, bot - top)} className={`band band-${letter.toLowerCase()}`}/>
      <text x={W - padR + 8} y={(top + bot) / 2 + 4} className={`band-letter band-text-${letter.toLowerCase()}`}>{letter}</text>
    </g>; })}
    <path d={path(0, idx)} className="curve-past"/>
    {idx < values.length - 1 && <path d={path(idx, values.length - 1)} className="curve-future"/>}
    <circle cx={x(peak)} cy={y(values[peak])} r="4" className="curve-peak"/>
    <text x={x(peak)} y={y(values[peak]) - 10} textAnchor="middle" className="curve-label">Peak {values[peak]}</text>
    <circle cx={x(idx)} cy={y(values[idx])} r="7" className="curve-now"/>
    <text x={x(idx)} y={y(values[idx]) + 22} textAnchor="middle" className="curve-label now">Now {values[idx]}</text>
    {values.map((_, i) => (i === 0 || i === values.length - 1 || (i + 1) % 5 === 0) && <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="curve-axis">Y{i + 1}</text>)}
  </svg>;
}

const PRODUCTION = [['ppg', 'Points', ''], ['rpg', 'Rebounds', ''], ['apg', 'Assists', ''], ['spg', 'Steals', ''], ['bpg', 'Blocks', ''], ['fg', 'Field goal', '%'], ['three', 'Three-point', '%']];
function rankTone(p) { return p >= .9 ? 's' : p >= .7 ? 'a' : p >= .4 ? 'b' : p >= .2 ? 'd' : 'e'; }
function rankLabel(p) { if (p >= .5) return `Top ${Math.max(1, Math.round((1 - p) * 100))}%`; return `Bottom ${Math.max(1, Math.round(p * 100))}%`; }

// Each stat placed against same-position players in the same competition.
export function ProductionRanks({ player, universe }) {
  if (!player.stats?.games) return <div className="empty-state small">No games played this season yet.</div>;
  let peers = universe.players.filter((p) => p.competition === player.competition && p.position === player.position && p.stats?.games > 0);
  let peerLabel = `${player.position}s in ${player.competition}`;
  if (peers.length < 6) { peers = universe.players.filter((p) => p.competition === player.competition && p.stats?.games > 0); peerLabel = `players in ${player.competition}`; }
  return <>
    <p className="production-note">Bars rank him against {peers.length} {peerLabel}.</p>
    <div className="production-ranks">{PRODUCTION.map(([key, label, unit]) => {
      const value = Number(player.stats[key]) || 0;
      const below = peers.filter((p) => (Number(p.stats[key]) || 0) < value).length;
      const pct = peers.length > 1 ? below / (peers.length - 1) : .5;
      const tone = rankTone(Math.min(1, pct));
      return <div className="prod-row" key={key}>
        <span className="prod-label">{label}</span>
        <strong className="prod-value">{value}{unit}</strong>
        <span className="sbar-track lg"><i className={`g-${tone}`} style={{ width: `${Math.max(4, Math.min(1, pct) * 100)}%` }}/></span>
        <span className={`prod-rank tone-text-${tone}`}>{rankLabel(Math.min(1, pct))}</span>
      </div>;
    })}</div>
  </>;
}
