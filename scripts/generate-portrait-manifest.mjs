import fs from 'node:fs/promises';
import { REAL_PLAYER_POOLS } from '../src/data/historicalPlayers.js';

const ASIAN=[4,17,46,56,83,123,132,139,149,159,172,183,198];
const LIGHT=[1,6,10,13,15,19,23,25,30,34,38,41,44,49,51,53,55,59,61,63,65,66,71,79,81,85,88,89,91,94,101,105,107,112,113,115,118,127,130,137,141,143,146,148,153,156,158,160,162,165,167,170,174,177,178,181,185,188,190,193,195];
const MEDIUM=[3,5,8,11,21,27,28,32,33,36,43,47,58,67,69,70,76,77,78,87,92,93,96,104,106,108,109,116,122,133,145,154,157,163,171,180,186,197];
const ALL=Array.from({length:200},(_,i)=>i);
const DARK=ALL.filter(i=>!new Set([...ASIAN,...LIGHT,...MEDIUM]).has(i));
const used=new Set();
const mapping={};
const top={
  'Wilt Chamberlain':74,'Bill Russell':86,'Oscar Robertson':95,'Kareem Abdul-Jabbar':131,'Magic Johnson':22,'Larry Bird':55,
  'Michael Jordan':176,'Hakeem Olajuwon':42,"Shaquille O'Neal":110,'Kobe Bryant':50,'Tim Duncan':103,'LeBron James':138,
  'Stephen Curry':154,'Kevin Durant':125,'Nikola Jokic':130,'Giannis Antetokounmpo':169,'Luka Doncic':113,'Moses Malone':182,
  'Jerry West':146,'George Mikan':162,'Dirk Nowitzki':137,'Steve Nash':148,'Pau Gasol':190,'Marc Gasol':49,'Manu Ginobili':160,
  'Drazen Petrovic':181,'Arvydas Sabonis':170,'Yao Ming':172,'Tony Parker':171,'Rudy Gobert':187,'Joel Embiid':164,
  'Victor Wembanyama':136,'Shai Gilgeous-Alexander':189,'Domantas Sabonis':167,'Rui Hachimura':123,'Yuta Watanabe':149,
  'Yi Jianlian':132,'Wang Zhizhi':139,'Oscar Schmidt':188,'Luis Scola':163,'Facundo Campazzo':180,'Patty Mills':173,
};
for(const [name,index] of Object.entries(top)){ if(!used.has(index)){ mapping[name]=index; used.add(index); } }
const lightUS=new Set(['George Mikan','Jerry West','Larry Bird','Bob Cousy','John Havlicek','Rick Barry','Kevin McHale','John Stockton','Chris Mullin']);
const mediumUS=new Set(['Stephen Curry','Jason Kidd','Klay Thompson','Blake Griffin']);
const darkNames=new Set(['Tony Parker','Rudy Gobert','Nicolas Batum','Victor Wembanyama','Patty Mills','Ben Simmons','Leandro Barbosa','Al Horford','Karl-Anthony Towns','Dikembe Mutombo','Hakeem Olajuwon','Joel Embiid']);
const lightNats=new Set(['Spain','Greece','Turkey','Italy','Germany','Serbia','Slovenia','Croatia','Lithuania','Russia','Argentina','Australia']);
const asianNats=new Set(['China','Japan','South Korea']);
function group(name,nat){
  if(asianNats.has(nat)) return 'asian';
  if(name==='Yao Ming'||name==='Yi Jianlian'||name==='Wang Zhizhi'||name==='Rui Hachimura'||name==='Yuta Watanabe') return 'asian';
  if(nat==='USA') return lightUS.has(name)?'light':mediumUS.has(name)?'medium':'dark';
  if(darkNames.has(name) || ['Nigeria','DR Congo','Cameroon','Dominican Republic'].includes(nat)) return 'dark';
  if(lightNats.has(nat)) return 'light';
  if(['France','Canada','Brazil','Puerto Rico','Israel','Iran','Lebanon'].includes(nat)) return 'medium';
  return 'medium';
}
const pools={asian:ASIAN,light:LIGHT,medium:MEDIUM,dark:DARK};
const cursors={asian:0,light:0,medium:0,dark:0};
function take(g){
  const p=pools[g];
  for(let tries=0;tries<p.length;tries++){
    const idx=p[cursors[g]++%p.length]; if(!used.has(idx)){used.add(idx);return idx;}
  }
  const idx=ALL.find(i=>!used.has(i)); if(idx!==undefined){used.add(idx);return idx;}
  return 0;
}
for(const rarity of ['Generational','Legend','Epic']){
  for(const [name,nat] of REAL_PLAYER_POOLS[rarity]){
    if(mapping[name]!==undefined) continue;
    mapping[name]=take(group(name,nat));
  }
}
const lines=Object.entries(mapping).map(([name,i])=>`  ${JSON.stringify(name)}: 'assets/portraits/players/p${String(i).padStart(3,'0')}.webp',`).join('\n');
await fs.writeFile('src/data/historicalPortraitMap.js',`// Curated fantasy analog portraits for real-name historical slots.\n// These are original illustrated assets, not photographic likenesses.\nexport const HISTORICAL_PORTRAITS = {\n${lines}\n};\nexport const PORTRAIT_POOL_SIZE = 200;\n`);
console.log(`Mapped ${Object.keys(mapping).length} historical names to ${used.size} unique portrait files.`);
