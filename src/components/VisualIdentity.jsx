import React, { useEffect, useMemo, useState } from 'react';
import { TEAM_LOGO_PATHS } from '../data/generatedLogoManifest.js';
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
    <text x="50" y="57" textAnchor="middle" fill="white" fontFamily="Inter,Arial,sans-serif" fontSize={letters.length>2?21:26} fontWeight="900">{letters}</text>
  </svg>;
}

export function TeamBadge({team,size=44,className=''}){
  const name=team?.name||'Team';
  const localOfficial=TEAM_LOGO_PATHS[name] ? localAsset(TEAM_LOGO_PATHS[name]) : null;
  const nbaRemote=nbaRemoteLogo(name);
  const fallbackFile=localAsset(`assets/logos/fallback/${slug(name)}.svg`);
  const candidates=useMemo(()=>[localOfficial,nbaRemote,fallbackFile].filter(Boolean),[localOfficial,nbaRemote,fallbackFile]);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>setAttempt(0),[name,localOfficial]);
  const src=candidates[attempt]||null;
  return <span className={`visual-badge image-badge ${className}`} style={{width:size,height:size}} title={name}>
    <span className="badge-fallback"><FallbackMark team={team} size={size}/></span>
    {src&&<img src={src} alt={`${name} logo`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setAttempt((n)=>n+1)}/>} 
  </span>;
}

const competitionIcon={league:'🏆',continental:'◆',cup:'◈',supercup:'✦',international:'🌐',ncaa:'★',development:'⬡'};
export function CompetitionEmblem({competition,size=54,className=''}){
  const seed=hashString(competition?.id||competition?.name||'competition');
  const hue=205+(seed%28); const icon=competitionIcon[competition?.kind]||'🏀'; const code=initials(competition?.name||'BC',3);
  return <span className={`competition-emblem ${className}`} style={{width:size,height:size}} title={competition?.name}>
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={`ce-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${hue} 72% 48%)`}/><stop offset="1" stopColor={`hsl(${hue+25} 66% 25%)`}/></linearGradient></defs>
      <rect x="5" y="5" width="90" height="90" rx="24" fill={`url(#ce-${seed})`} stroke="white" strokeWidth="4"/>
      <text x="50" y="43" textAnchor="middle" fontSize="27">{icon}</text><text x="50" y="69" textAnchor="middle" fill="white" fontFamily="Inter,Arial,sans-serif" fontSize="18" fontWeight="900">{code}</text>
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
  return <span className={`portrait-frame raster-portrait rarity-frame-${rarity} ${coach?'coach-raster':''} ${className}`} style={{width:size,height:size,'--portrait-accent':team?.color||frameColor}} title={entity?.name}>
    <img src={src} alt={entity?.name?`${entity.name} portrait`:'Basketball portrait'} loading="lazy"/>
    <span className="portrait-accent" aria-hidden="true"/>
  </span>;
}
export function PlayerPortrait({player,team,size=72,className=''}){ return <Portrait entity={player} team={team} size={size} className={className}/>; }
export function CoachPortrait({coach,team,size=72,className=''}){ return <Portrait entity={coach} team={team} size={size} className={className} coach/>; }

export function RatingPill({value,label='OVR'}){
  const n=Number(value)||0; const tier=n>=92?'elite':n>=86?'star':n>=80?'strong':n>=74?'average':'developing';
  return <span className={`rating-pill rating-${tier}`}><small>{label}</small><strong>{n}</strong></span>;
}
