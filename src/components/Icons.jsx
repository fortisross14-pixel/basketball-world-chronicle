import React from 'react';

// One stroke family: 24px grid, 1.8 stroke, round caps. Paths are authored for this game.
const PATHS = {
  atlas: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3Z"/></>,
  live: <><circle cx="12" cy="12" r="2.6"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></>,
  stories: <><path d="M5 4h11v16H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z"/><path d="M16 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2h-2M8 8h4M8 12h4M8 16h3"/></>,
  records: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1.5A3.5 3.5 0 0 0 8.5 11M16 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8.5 20h7M10 17h4v3h-4z"/></>,
  people: <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2"/><circle cx="17" cy="9" r="2.4"/><path d="M15.6 14.6c2.4-.4 4.3 1.1 4.9 4.4"/></>,
  market: <><path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5M20 16H7M10.5 12.5 7 16l3.5 3.5"/></>,
  save: <><path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/></>,
  exit: <><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h9"/></>,
  play: <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor"/>,
  pause: <><path d="M8 5.5v13M16 5.5v13" strokeWidth="3"/></>,
  skip: <><path d="M5 6v12l8-6-8-6ZM13 6v12l8-6-8-6Z"/></>,
  forward: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  back: <><path d="M19 12H5M11 6l-6 6 6 6"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  settings: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></>,
  star: <path d="m12 3.8 2.5 5.2 5.6.7-4.1 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.7L12 3.8Z"/>,
  starFill: <path d="m12 3.8 2.5 5.2 5.6.7-4.1 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.7L12 3.8Z" fill="currentColor"/>,
  crown: <><path d="M4 8.5 8 12l4-6 4 6 4-3.5-1.6 9.5H5.6L4 8.5Z"/><path d="M6 20.5h12"/></>,
  bolt: <path d="M13.5 3 5.5 13.5h6L10.5 21l8-10.5h-6L13.5 3Z"/>,
  spark: <><path d="M12 3.5c.6 4.4 2.2 6 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.5 5.9-2.1 6.5-6.5Z"/><path d="M18.5 16v4M16.5 18h4"/></>,
  hourglass: <><path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 4 5.5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5.5-4 8.5s4 4 4 8.5"/></>,
  route: <><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 17.5h5.5a3 3 0 0 0 0-6h-3a3 3 0 0 1 0-6H16"/></>,
  medal: <><circle cx="12" cy="15" r="5"/><path d="m9 10.5-3-7h4l2 4.5 2-4.5h4l-3 7M12 12.8l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2.8-1.6Z"/></>,
  jersey: <><path d="M8.5 3.5 4 6v5l2.5.5V20.5h11V11.5L20 11V6l-4.5-2.5c-.6 1.6-1.9 2.5-3.5 2.5s-2.9-.9-3.5-2.5Z"/></>,
  sunset: <><path d="M3.5 17.5h17M6.5 17.5a5.5 5.5 0 0 1 11 0M12 5v3M5 9.5l1.8 1.5M19 9.5l-1.8 1.5M8 21h8"/></>,
  trend: <><path d="M3.5 17 9.5 11l4 4L20.5 8"/><path d="M15 8h5.5v5.5"/></>,
  ball: <><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c2.4 2 3.7 4 3.7 6.4s-1.3 4.4-3.7 6.4M18.4 5.6c-2.4 2-3.7 4-3.7 6.4s1.3 4.4 3.7 6.4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3Z"/></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/></>,
  bridge: <><path d="M3 17h18M3 10c3 0 6-3 9-3s6 3 9 3M6 9.3V17M12 7v10M18 9.3V17"/></>,
  suitcase: <><rect x="4" y="7.5" width="16" height="12" rx="2"/><path d="M9 7.5V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12.5h16"/></>,
  flame: <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.3 2.2-5.1 3.6-7.6.6 1.6 1.4 2.6 2.6 3.2C11.9 7.4 13 5 15.4 3c-.3 3.1 3.1 5.5 3.1 10.6C18.5 17.9 15.9 21 12 21Z"/>,
  home: <><path d="m4 11 8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/></>,
  sprout: <><path d="M12 20.5v-9"/><path d="M12 12.5c0-4-2.6-6.5-7-6.5 0 4.2 2.8 6.5 7 6.5ZM12 10.5c0-3.4 2.3-5.6 6.5-5.6 0 3.6-2.4 5.6-6.5 5.6Z"/><path d="M7.5 20.5h9"/></>,
  pillar: <><path d="M4 8.5 12 4l8 4.5M5 8.5h14M6.5 8.5v9M10 8.5v9M14 8.5v9M17.5 8.5v9M4.5 17.5h15M3.5 20.5h17"/></>,
  plane: <path d="m3.5 13 6.5 1.5 4.5 6 1.5-.6-1.5-6.4 4.7-4.3c.9-.8 1-2 .3-2.7s-1.9-.6-2.7.3L12.5 11 6 9.5l-1.3.9 5 3-2.3 2.6-2.3-.3-.6.9 2.6 1.4 1.4 2.6.9-.6-.3-2.3"/>,
  anchor: <><circle cx="12" cy="5.5" r="2"/><path d="M12 7.5v13M8 11h8M4.5 13.5c0 4 3.4 7 7.5 7s7.5-3 7.5-7"/></>,
  burst: <path d="m12 3 1.8 5.2 5.2-2-2 5.2 5 1.8-5 1.8 2 5.2-5.2-2L12 23l-1.8-4.8-5.2 2 2-5.2-5-1.8 5-1.8-2-5.2 5.2 2L12 3Z" transform="scale(.92) translate(1 -1)"/>,
};
export const ARC_ICONS = {
  'triple-crown':'crown', 'world-champion':'medal', crossover:'bridge', prodigy:'spark', journeyman:'suitcase', globetrotter:'globe',
  undrafted:'flame', 'gleague-riser':'trend', homecoming:'home', 'late-bloomer':'sprout', 'one-club':'pillar', 'overseas-pro':'plane',
  'never-crossed':'anchor', 'draft-bust':'burst',
};

export function Icon({ name, size = 18, className = '', title }) {
  const body = PATHS[name] ?? PATHS.ball;
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}>{title && <title>{title}</title>}{body}</svg>;
}

export const STORY_ICONS = {
  Dynasty: 'crown', Breakthrough: 'records', Shock: 'bolt', Arrival: 'spark', Vintage: 'hourglass',
  'Career turn': 'route', Legacy: 'medal', 'Franchise icon': 'jersey', Farewell: 'sunset', 'Power shift': 'trend', Champion: 'records',
};
