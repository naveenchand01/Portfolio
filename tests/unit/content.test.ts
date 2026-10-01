import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACE_CERTIFICATE, CERTIFICATIONS } from '@/content/certifications';
import { GALLERY } from '@/content/gallery';
import { PROFILE } from '@/content/profile';
import { PROJECTS } from '@/content/projects';
import { MENU_ORDER, ROUTES, routeKeyFromPath, themeCss } from '@/content/routes';

const publicFile = (src: string) => existsSync(join(process.cwd(), 'public', src));

describe('content', () => {
  it('every image and file referenced by the content exists in /public', () => {
    const files = [
      PROFILE.photo.src,
      PROFILE.resume,
      ACE_CERTIFICATE.src,
      ...GALLERY.map((g) => g.src),
      ...PROJECTS.flatMap((p) => (p.screenshot ? [p.screenshot.src] : [])),
    ];
    for (const f of files) expect(publicFile(f), f).toBe(true);
  });

  it('every external link is a valid https URL', () => {
    const links = [...PROFILE.socials.map((s) => s.href), ...PROJECTS.flatMap((p) => Object.values(p.links))];
    for (const l of links) expect(new URL(l as string).protocol, l).toBe('https:');
  });

  it('every image has alt text', () => {
    for (const g of GALLERY) expect(g.alt.length).toBeGreaterThan(5);
    for (const p of PROJECTS) if (p.screenshot) expect(p.screenshot.alt.length).toBeGreaterThan(5);
  });

  it('project slugs are unique and there is exactly one featured project', () => {
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
    expect(PROJECTS.filter((p) => p.featured)).toHaveLength(1);
  });

  it('lists 8 certifications', () => {
    expect(CERTIFICATIONS).toHaveLength(8);
  });
});

describe('routes', () => {
  it('the "next page" chain visits every page and returns home', () => {
    const seen: string[] = [];
    let key = ROUTES.home.key;
    do {
      seen.push(key);
      key = ROUTES[key].next;
    } while (key !== 'home' && seen.length < 10);
    expect(seen.sort()).toEqual([...MENU_ORDER].sort());
  });

  it('maps paths to route keys, ignoring trailing slashes', () => {
    expect(routeKeyFromPath('/')).toBe('home');
    expect(routeKeyFromPath('/work')).toBe('work');
    expect(routeKeyFromPath('/work/')).toBe('work');
    expect(routeKeyFromPath('/nope')).toBe('home');
  });

  it('generates theme CSS for every page', () => {
    const css = themeCss();
    for (const k of MENU_ORDER) expect(css).toContain(`html[data-page="${k}"]`);
  });
});
