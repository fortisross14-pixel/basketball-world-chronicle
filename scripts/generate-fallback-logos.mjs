import fs from 'node:fs/promises';
import path from 'node:path';
import { NBA_TEAMS, EURO_TOP_CLUBS, EURO_DOMESTIC, OTHER_PRO_TEAMS, EXTENDED_PRO_TEAMS, G_LEAGUE_TEAMS, NCAA_PROGRAMS } from '../src/data/teamData.js';
const teams=[...NBA_TEAMS,...EURO_TOP_CLUBS,...EURO_DOMESTIC,...OTHER_PRO_TEAMS,...EXTENDED_PRO_TEAMS,...G_LEAGUE_TEAMS,...NCAA_PROGRAMS];
const out=path.resolve('public/assets/logos/fallback');
await fs.mkdir(out,{recursive:true});
const slug=(s)=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=(s)=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const code=(name)=>name.replace(/\([^)]*\)/g,'').split(/\s+/).filter(Boolean).filter(w=>!['the','of','de','bc','club','basket','basketball'].includes(w.toLowerCase())).slice(0,3).map(w=>w[0]).join('').toUpperCase().slice(0,3);
for(const team of teams){
 const color=team.color||'#315d9b'; const initials=code(team.name)||'BC';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${esc(color)}"/><stop offset="1" stop-color="#0b1628"/></linearGradient></defs><circle cx="60" cy="60" r="55" fill="url(#g)" stroke="#fff" stroke-width="5"/><circle cx="60" cy="60" r="37" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="3"/><path d="M25 69c18-13 52-13 70 0M60 24v72M31 46c21 12 37 12 58 0" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/><text x="60" y="70" text-anchor="middle" font-family="Arial,sans-serif" font-size="${initials.length>2?27:34}" font-weight="900" fill="#fff">${esc(initials)}</text></svg>`;
 await fs.writeFile(path.join(out,`${slug(team.name)}.svg`),svg);
}
console.log(`Generated ${teams.length} offline fallback marks.`);
