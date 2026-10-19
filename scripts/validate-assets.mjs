import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {EURO_TOP_CLUBS,EURO_DOMESTIC} from '../src/data/teamData.js';
import {CURATED_CLUB_BADGES} from '../src/data/curatedClubBadges.js';
const clubs=[...EURO_TOP_CLUBS,...EURO_DOMESTIC];
const keys=new Set(clubs.map(x=>x.name));
for(const name of keys){
  const relative=CURATED_CLUB_BADGES[name];
  assert(relative,`Missing badge mapping: ${name}`);
  const filename=path.join('public',relative);
  assert(fs.existsSync(filename),`Missing badge file: ${filename}`);
  const raw=fs.readFileSync(filename,'utf8');
  assert(raw.includes('<svg')&&raw.includes('</svg>'),`Malformed club badge: ${filename}`);
}
const app=fs.readFileSync('src/App.jsx','utf8');
const codes=new Set([...app.matchAll(/:\s*'([A-Z]{2})'/g)].map(x=>x[1]));
for(const code of codes){
  assert(fs.existsSync(path.join('public/assets/flags',`${code.toLowerCase()}.png`)),`Missing country flag ${code}`);
}
for(const pos of ['pg','sg','sf','pf','c']){
  assert(fs.readFileSync('src/styles.css','utf8').includes(`.half-court-wrap .court-pos-${pos}{`),`Missing half-court position ${pos}`);
}
assert(app.includes('viewBox="0 0 1000 820"'),'Half-court line overlay missing');
console.log(`Visual assets: ${keys.size} European club badges, ${codes.size} country flag codes, all five half-court positions passed.`);
