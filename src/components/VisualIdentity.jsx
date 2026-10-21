import React, { useEffect, useMemo, useState } from 'react';
import { TEAM_LOGO_PATHS } from '../data/generatedLogoManifest.js';
import { CURATED_CLUB_BADGES } from '../data/curatedClubBadges.js';
import { nbaRemoteLogo } from '../data/logoSources.js';
import { HISTORICAL_PORTRAITS, PORTRAIT_POOL_SIZE } from '../data/historicalPortraitMap.js';

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
function slug(value=''){
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function localAsset(path=''){
  if(!path) return null;
  if(/^https?:/i.test(path)) return path;
  const base=import.meta.env.BASE_URL || './';
  return `${base}${String(path).replace(/^\//,'')}`;
}
const rarityColor={Generational:'#d7263d',Legend:'#c58b24',Epic:'#7c4dcc',Rare:'#2f74b8',Uncommon:'#3d8b5d',Common:'#7b8794'};

function FallbackMark({team,size}){
  const color=team?.color||'#315d9b'; const seed=hashString(team?.name||'team'); const letters=initials(team?.name||'?');
  const secondary=mix(color,seed%2?'#ffffff':'#08192e',seed%2?.28:.18);
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    <defs><linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={mix(color,'#ffffff',.16)}/><stop offset="1" stopColor={mix(color,'#000000',.30)}/></linearGradient></defs>
    <circle cx="50" cy="50" r="46" fill={`url(#g-${seed})`} stroke="white" strokeWidth="4"/>
    <circle cx="50" cy="50" r="31" fill={secondary} opacity=".28" stroke="rgba(255,255,255,.72)" strokeWidth="2"/>
    <path d="M20 61c14-10 46-10 60 0M50 18v64M24 39c16 9 36 9 52 0" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2"/>
    <text x="50" y="57" textAnchor="middle" fill="white" fontFamily="'Barlow Condensed',Manrope,sans-serif" fontSize={letters.length>2?27:32} fontWeight="800">{letters}</text>
  </svg>;
}

export function TeamBadge({team,size=44,className=''}){
  const name=team?.name||'Team';
  const localOfficial=TEAM_LOGO_PATHS[name] ? localAsset(TEAM_LOGO_PATHS[name]) : null;
  const nbaRemote=nbaRemoteLogo(name);
  const curatedBadge=CURATED_CLUB_BADGES[name] ? localAsset(CURATED_CLUB_BADGES[name]) : null;
  const fallbackFile=localAsset(`assets/logos/fallback/${slug(name)}.svg`);
  const candidates=useMemo(()=>[localOfficial,nbaRemote,curatedBadge,fallbackFile].filter(Boolean),[localOfficial,nbaRemote,curatedBadge,fallbackFile]);
  const [attempt,setAttempt]=useState(0);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{setAttempt(0);setLoaded(false);},[name,localOfficial,curatedBadge]);
  const src=candidates[attempt]||null;
  return <span className={`visual-badge image-badge ${loaded?'is-loaded':''} ${className}`} style={{width:size,height:size}} title={name}>
    {!loaded&&<span className="badge-fallback"><FallbackMark team={team} size={size}/></span>}
    {src&&<img src={src} alt={`${name} logo`} loading="lazy" referrerPolicy="no-referrer" onLoad={()=>setLoaded(true)} onError={()=>{setLoaded(false);setAttempt((n)=>n+1);}}/>}
  </span>;
}

// Crest metal by competition weight: world events gold, continental silver-blue, domestic steel.
const competitionMetal={international:['#f6c86a','#9a6a1c'],continental:['#9fc6ff','#2c5a9a'],ncaa:['#8fd0ff','#1d4f7a'],league:['#7fa3c4','#22394f'],cup:['#b5a5e8','#433673'],supercup:['#e7a3b8','#6b2a40'],development:['#9fb3a5','#2f4a3c']};
export function CompetitionEmblem({competition,size=54,className=''}){
  const seed=hashString(competition?.id||competition?.name||'competition');
  const [hi,lo]=competitionMetal[competition?.kind]??competitionMetal.league; const code=initials(competition?.name||'BC',3);
  return <span className={`competition-emblem ${className}`} style={{width:size,height:size}} title={competition?.name}>
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={`ce-${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hi}/><stop offset="1" stopColor={lo}/></linearGradient></defs>
      <path d="M50 5 88 18v30c0 24-16 39-38 47C28 87 12 72 12 48V18L50 5Z" fill={`url(#ce-${seed})`}/>
      <path d="M50 13 80 23.5V48c0 19-12 31.5-30 38.5C32 79.5 20 67 20 48V23.5L50 13Z" fill="#0b1520" fillOpacity=".55" stroke="#fff" strokeOpacity=".35" strokeWidth="2"/>
      <text x="50" y={code.length>2?60:62} textAnchor="middle" fill="#fff" fontFamily="'Barlow Condensed',Manrope,sans-serif" fontSize={code.length>2?27:32} fontWeight="800" letterSpacing="1">{code}</text>
    </svg>
  </span>;
}

function portraitPath(entity,coach=false){
  const historical=HISTORICAL_PORTRAITS[entity?.name];
  if(historical) return localAsset(historical);
  const seed=hashString(`${entity?.id??''}|${entity?.name??''}|${entity?.nationality??''}|${entity?.position??entity?.style??''}|${coach?'coach':'player'}`);
  const index=(seed+(coach?73:0))%PORTRAIT_POOL_SIZE;
  return localAsset(`assets/portraits/players/p${String(index).padStart(3,'0')}.webp`);
}
function Portrait({entity,team,size=72,className='',coach=false}){
  const src=portraitPath(entity,coach); const rarity=String(entity?.rarity||'Common').toLowerCase();
  const frameColor=rarityColor[entity?.rarity]||'#8090a0';
  return <span className={`portrait-frame raster-portrait rarity-frame-${rarity} ${size>=56?'pf-lg':size<=40?'pf-sm':''} ${coach?'coach-raster':''} ${className}`} style={{width:size,height:size,'--portrait-accent':team?.color||frameColor}} title={entity?.name}>
    <img src={src} alt={entity?.name?`${entity.name} portrait`:'Basketball portrait'} loading="lazy"/>
    <span className="portrait-accent" aria-hidden="true"/>
  </span>;
}
export function PlayerPortrait({player,team,size=72,className=''}){ return <Portrait entity={player} team={team} size={size} className={className}/>; }
export function CoachPortrait({coach,team,size=72,className=''}){ return <Portrait entity={coach} team={team} size={size} className={className} coach/>; }

// World-level grade scale. The same thresholds apply to teams, players and coaches,
// so a letter always means the same thing anywhere in the universe.
export const GRADE_SCALE=[
  {grade:'S',min:88,label:'World elite'},
  {grade:'A',min:82,label:'Excellent'},
  {grade:'B',min:76,label:'Strong'},
  {grade:'C',min:70,label:'Solid'},
  {grade:'D',min:63,label:'Developing'},
  {grade:'E',min:0,label:'Raw'},
];
export function gradeFor(value){
  const n=Number(value)||0;
  return GRADE_SCALE.find((row)=>n>=row.min)??GRADE_SCALE.at(-1);
}
export function Grade({value,size='md',showValue=true,className=''}){
  const n=Number(value)||0; const g=gradeFor(n);
  const shown=Number.isInteger(n)?n:n.toFixed(1);
  return <span className={`grade grade-${g.grade.toLowerCase()} grade-${size} ${className}`} title={`${g.label} · ${shown}`}>
    <b>{g.grade}</b>{showValue&&<span>{shown}</span>}
  </span>;
}
export function RatingPill({value,label='OVR',size='md'}){
  return <Grade value={value} size={size} className={label==='WORLD'?'grade-world':''}/>;
}
// Bar fill: maps 50–99 onto the track so differences between real teams stay visible.
export function meterPercent(value,floor=50,ceil=99){ return clamp(((Number(value)||floor)-floor)/(ceil-floor)*100,4,100); }
export function StrengthBars({profile,tones={},compact=false,rows=[['perimeter','Perimeter'],['interior','Interior'],['defense','Defense'],['rebounding','Rebounding']]}){
  if(!profile) return null;
  return <div className={`strength-bars ${compact?'compact':''}`}>
    {rows.map(([key,label,short])=>{const v=profile[key]; if(!Number.isFinite(v)) return null; const tone=tones[key]??`g-${gradeFor(v).grade.toLowerCase()}`; return <div className={`sbar tone-${tone}`} key={key}>
      <span className="sbar-label">{compact?(short??label.slice(0,3)):label}</span>
      <span className="sbar-track"><i style={{width:`${meterPercent(v)}%`}}/></span>
      <span className="sbar-value">{Math.round(v)}</span>
    </div>;})}
  </div>;
}

// Team colours are designed for white jerseys, not dark screens. Lift dark ones and
// separate two teams whose colours would read as the same side.
function luminance(hex){ const {r,g,b}=hexToRgb(hex); const f=(c)=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4;}; return .2126*f(r)+.7152*f(g)+.0722*f(b); }
function hueOf(hex){ const {r,g,b}=hexToRgb(hex); const R=r/255,G=g/255,B=b/255; const max=Math.max(R,G,B),min=Math.min(R,G,B); if(max===min) return null; const d=max-min; let h=max===R?((G-B)/d)%6:max===G?(B-R)/d+2:(R-G)/d+4; return (h*60+360)%360; }
function rgbToHsl({r,g,b}){ r/=255;g/=255;b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); const l=(max+min)/2; if(max===min) return {h:0,s:0,l}; const d=max-min; const s=l>.5?d/(2-max-min):d/(max+min); const h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4; return {h:h*60,s,l}; }
function hslToHex({h,s,l}){ const k=(n)=>(n+h/30)%12; const a=s*Math.min(l,1-l); const f=(n)=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return rgbToHex({r:f(0)*255,g:f(8)*255,b:f(4)*255}); }
// Raise lightness while keeping hue and saturation, so a navy reads as a clear blue, not grey.
export function readableTeamColor(hex='#4b9dff'){
  const c=hex||'#4b9dff'; if(luminance(c)>=.16) return c;
  const hsl=rgbToHsl(hexToRgb(c));
  if(hsl.s<.12) return '#c9d6e2';
  let out=c; let l=hsl.l; const s=Math.max(hsl.s,.62);
  while(luminance(out)<.16&&l<.8){ l+=.04; out=hslToHex({h:hsl.h,s,l}); }
  return out;
}
export function teamColorPair(a,b){
  const A=readableTeamColor(a||'#4b9dff'); let B=readableTeamColor(b||'#ef6b5b');
  const ha=hueOf(A),hb=hueOf(B);
  const hueGap=ha==null||hb==null?0:Math.min(Math.abs(ha-hb),360-Math.abs(ha-hb));
  const lumGap=Math.abs(luminance(A)-luminance(B));
  // Never fall back to gold: gold is reserved for the S grade and primary actions.
  if(hueGap<42&&lumGap<.18){ const blueish=ha!=null&&ha>170&&ha<300; B=blueish?'#ef6b5b':'#5fa8ff'; }
  return [A,B];
}
