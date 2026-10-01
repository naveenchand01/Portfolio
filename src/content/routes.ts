import type { Route } from 'next';

export type RouteKey = 'home' | 'about' | 'work' | 'stack' | 'contact';

export type RouteInfo = {
  key: RouteKey;
  href: Route;
  label: string;
  index: string;
  /** Colours fed to the liquid WebGL shader */
  liquid: [string, string, string];
  /** CSS theme colours for the page (accents, glows, gradients) */
  theme: { a1: string; a2: string; a3: string; accent: string };
  next: RouteKey;
  nextKicker: string;
};

export const ROUTES: Record<RouteKey, RouteInfo> = {
  home: {
    key: 'home',
    href: '/',
    label: 'Home',
    index: '00',
    liquid: ['#5b2cff', '#00d1c1', '#ff7a59'],
    theme: { a1: '#7b5cff', a2: '#00d1c1', a3: '#ff7a59', accent: '#00d1c1' },
    next: 'about',
    nextKicker: 'Next: who I am',
  },
  about: {
    key: 'about',
    href: '/about',
    label: 'About',
    index: '01',
    liquid: ['#ff3d7f', '#ffb547', '#7b5cff'],
    theme: { a1: '#ff5d8f', a2: '#ffb547', a3: '#8a6bff', accent: '#ffb547' },
    next: 'work',
    nextKicker: 'Next: selected projects',
  },
  work: {
    key: 'work',
    href: '/work',
    label: 'Work',
    index: '02',
    liquid: ['#00c896', '#2f6bff', '#c8ff2e'],
    theme: { a1: '#00e0a4', a2: '#2f6bff', a3: '#d4ff3a', accent: '#00e0a4' },
    next: 'stack',
    nextKicker: 'Next: the toolbox',
  },
  stack: {
    key: 'stack',
    href: '/stack',
    label: 'Stack',
    index: '03',
    liquid: ['#2f5bff', '#9d4dff', '#00e5ff'],
    theme: { a1: '#2f6bff', a2: '#9d4dff', a3: '#00e5ff', accent: '#00e5ff' },
    next: 'contact',
    nextKicker: "Next: let's talk",
  },
  contact: {
    key: 'contact',
    href: '/contact',
    label: 'Contact',
    index: '04',
    liquid: ['#ff4d2e', '#ff2e93', '#ffc93c'],
    theme: { a1: '#ff4d2e', a2: '#ff2e93', a3: '#ffc93c', accent: '#ff7a59' },
    next: 'home',
    nextKicker: 'Back to the start',
  },
};

export const NAV_ORDER: RouteKey[] = ['about', 'work', 'stack', 'contact'];
export const MENU_ORDER: RouteKey[] = ['home', 'about', 'work', 'stack', 'contact'];

export function routeKeyFromPath(pathname: string): RouteKey {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const found = Object.values(ROUTES).find((r) => r.href === clean);
  return found?.key ?? 'home';
}

/** CSS rules that set the per-page theme variables, generated from ROUTES. */
export function themeCss(): string {
  return Object.values(ROUTES)
    .map(
      (r) =>
        `html[data-page="${r.key}"]{--a1:${r.theme.a1};--a2:${r.theme.a2};--a3:${r.theme.a3};--accent:${r.theme.accent}}`,
    )
    .join('');
}
