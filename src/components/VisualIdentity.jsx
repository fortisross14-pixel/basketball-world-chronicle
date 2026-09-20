import React from 'react';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function hashString(value=''){
  let h=2166136261;
  for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0;
}
function hexToRgb(hex='#315d9b'){
  const clean=String(hex).replace('#','');
  const full=clean.length===3?clean.split('').map(x=>x+x).join(''):clean.padEnd(6,'0').slice(0,6);
  const n=parseInt(full,16)||0x315d9b;
  return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function rgbToHex({r,g,b}){return `#${[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}`;}
function mix(hex,other='#ffffff',amount=.2){
  const a=hexToRgb(hex),b=hexToRgb(other);return rgbToHex({r:a.r+(b.r-a.r)*amount,g:a.g+(b.g-a.g)*amount,b:a.b+(b.b-a.b)*amount});
}
function initials(name='Team',max=3){
  const words=String(name).replace(/\([^)]*\)/g,'').split(/\s+/).filter(Boolean).filter(w=>!['the','of','de','bc','club','basket','basketball'].includes(w.toLowerCase()));
  if(words.length===1)return words[0].slice(0,max).toUpperCase();
  return words.slice(0,max).map(w=>w[0]).join('').toUpperCase();
}
const rarityColor={Generational:'#d7263d',Legend:'#c58b24',Epic:'#7c4dcc',Rare:'#2f74b8',Uncommon:'#3d8b5d',Common:'#7b8794'};

export function TeamBadge({team,size=44,className=''}){
  const color=team?.color||'#315d9b'; const seed=hashString(team?.name||'team');
  const secondary=mix(color, seed%2?'#ffffff':'#08192e', seed%2?.28:.18);
  const shape=seed%4; const letters=initials(team?.name||'?');
  const points=shape===0?'50,4 88,19 94,59 73,94 27,94 6,59 12,19':shape===1?'50,4 84,15 96,48 83,84 50,96 17,84 4,48 16,15':shape===2?'50,3 93,28 83,83 50,97 17,83 7,28':'50,5 90,20 90,75 50,96 10,75 10,20';
  return <span className={`visual-badge ${className}`} style={{width:size,height:size}} title={team?.name}>
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={mix(color,'#ffffff',.22)}/><stop offset="1" stopColor={mix(color,'#000000',.24)}/></linearGradient></defs>
      <polygon points={points} fill={`url(#g-${seed})`} stroke="white" strokeWidth="5"/>
      <circle cx="50" cy="48" r="28" fill={secondary} opacity=".30" stroke="white" strokeWidth="2"/>
      <path d="M27 61c11-8 35-8 46 0M50 24v48M29 40c12 7 30 7 42 0" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"/>
      <text x="50" y="56" textAnchor="middle" fill="white" fontFamily="Inter,Arial,sans-serif" fontSize={letters.length>2?22:27} fontWeight="900" letterSpacing="-1">{letters}</text>
    </svg>
  </span>;
}

const competitionIcon={league:'🏆',continental:'◆',cup:'◈',supercup:'✦',international:'🌐',ncaa:'★',development:'⬡'};
export function CompetitionEmblem({competition,size=54,className=''}){
  const seed=hashString(competition?.id||competition?.name||'competition');
  const hue=205+(seed%28); const icon=competitionIcon[competition?.kind]||'🏀';
  const code=initials(competition?.name||'BC',3);
  return <span className={`competition-emblem ${className}`} style={{width:size,height:size}} title={competition?.name}>
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={`ce-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${hue} 72% 48%)`}/><stop offset="1" stopColor={`hsl(${hue+25} 66% 25%)`}/></linearGradient></defs>
      <rect x="5" y="5" width="90" height="90" rx="24" fill={`url(#ce-${seed})`} stroke="white" strokeWidth="4"/>
      <text x="50" y="43" textAnchor="middle" fontSize="27">{icon}</text>
      <text x="50" y="69" textAnchor="middle" fill="white" fontFamily="Inter,Arial,sans-serif" fontSize="18" fontWeight="900">{code}</text>
    </svg>
  </span>;
}

const skins=['#f1c8a3','#e8b286','#d89669','#ba7751','#915739','#70402e','#4f2d24'];
const hairs=['#1d1a18','#3a291f','#6b4a2f','#a86e37','#d5b37a','#171717'];
const eyeColors=['#2a211d','#3a5568','#47623d','#6a4b32'];
function portraitTraits(entity,coach=false){
  const seed=hashString(`${entity?.name}|${entity?.nationality}|${entity?.position||entity?.style||''}`);
  const historical={
    'Michael Jordan':{skin:3,hair:0,style:5},'LeBron James':{skin:5,hair:0,style:2},'Kobe Bryant':{skin:4,hair:0,style:1},
    'Stephen Curry':{skin:3,hair:1,style:2},'Magic Johnson':{skin:5,hair:0,style:3},'Larry Bird':{skin:0,hair:3,style:3},
    'Wilt Chamberlain':{skin:5,hair:0,style:4},'Bill Russell':{skin:5,hair:0,style:1},'Nikola Jokic':{skin:0,hair:2,style:2},
    'Luka Doncic':{skin:0,hair:2,style:3},'Giannis Antetokounmpo':{skin:5,hair:0,style:1},'Kevin Durant':{skin:5,hair:0,style:4},
  }[entity?.name];
  return {seed,skin:historical?.skin??seed%skins.length,hair:historical?.hair??Math.floor(seed/7)%hairs.length,style:historical?.style??Math.floor(seed/17)%6,eyes:Math.floor(seed/37)%eyeColors.length,beard:!coach&&Math.floor(seed/67)%4===0,coach};
}
function FaceSvg({entity,size=72,coach=false,teamColor='#315d9b'}){
  const t=portraitTraits(entity,coach),skin=skins[t.skin],hair=hairs[t.hair],eye=eyeColors[t.eyes];
  const bg=rarityColor[entity?.rarity]||'#8090a0';
  const hairPath=[
    'M29 38c3-20 39-25 44 1-10-9-31-10-44-1Z','M27 42c0-24 48-25 48 0-7-13-17-17-24-16-11 1-18 7-24 16Z',
    'M27 42c2-23 46-24 48-1-5-7-13-11-23-12-10-1-19 5-25 13Z','M25 45c0-24 50-28 52 0-7-12-18-17-27-16-11 0-19 7-25 16Z',
    'M29 39c7-19 38-18 44 0-12-5-31-5-44 0Z','M31 34c10-9 31-9 41 0-4-14-37-15-41 0Z'
  ][t.style];
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    <defs><linearGradient id={`pbg-${t.seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={mix(bg,'#ffffff',.72)}/><stop offset="1" stopColor={mix(bg,'#ffffff',.90)}/></linearGradient></defs>
    <rect width="100" height="100" rx="18" fill={`url(#pbg-${t.seed})`}/>
    <circle cx="50" cy="42" r="24" fill={skin}/>
    <path d={hairPath} fill={hair}/>
    {t.style===4&&<><circle cx="32" cy="35" r="5" fill={hair}/><circle cx="41" cy="29" r="6" fill={hair}/><circle cx="51" cy="27" r="6" fill={hair}/><circle cx="61" cy="29" r="6" fill={hair}/><circle cx="69" cy="35" r="5" fill={hair}/></>}
    <ellipse cx="41" cy="43" rx="2.6" ry="1.8" fill={eye}/><ellipse cx="59" cy="43" rx="2.6" ry="1.8" fill={eye}/>
    <path d="M49 47c-1 4-2 7 2 8" fill="none" stroke={mix(skin,'#6a3928',.35)} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M42 59c5 4 12 4 17 0" fill="none" stroke="#7e3d3a" strokeWidth="1.8" strokeLinecap="round"/>
    {t.beard&&<path d="M34 54c3 16 29 17 33 0-4 13-29 14-33 0Z" fill={hair} opacity=".38"/>}
    <path d="M25 100c2-22 13-31 25-31s23 9 25 31" fill={coach?'#24364a':teamColor}/>
    {coach?<><path d="M43 69l7 12 7-12 7 31H36Z" fill="#f7f8fb"/><path d="M49 80l4 0 3 20h-10Z" fill="#183152"/></>:<><path d="M43 70l7 8 7-8" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="3"/><text x="50" y="92" textAnchor="middle" fill="white" fontFamily="Inter,Arial,sans-serif" fontSize="13" fontWeight="900">{entity?.jerseyNumber??entity?.position??''}</text></>}
  </svg>;
}
export function PlayerPortrait({player,team,size=72,className=''}){
  return <span className={`portrait-frame rarity-frame-${String(player?.rarity||'common').toLowerCase()} ${className}`} style={{width:size,height:size}} title={player?.name}><FaceSvg entity={player} teamColor={team?.color||'#315d9b'} size={size}/></span>;
}
export function CoachPortrait({coach,team,size=72,className=''}){
  return <span className={`portrait-frame rarity-frame-${String(coach?.rarity||'common').toLowerCase()} ${className}`} style={{width:size,height:size}} title={coach?.name}><FaceSvg entity={coach} coach teamColor={team?.color||'#315d9b'} size={size}/></span>;
}

export function RatingPill({value,label='OVR'}){
  const n=Number(value)||0; const tier=n>=92?'elite':n>=86?'star':n>=80?'strong':n>=74?'average':'developing';
  return <span className={`rating-pill rating-${tier}`}><small>{label}</small><strong>{n}</strong></span>;
}
