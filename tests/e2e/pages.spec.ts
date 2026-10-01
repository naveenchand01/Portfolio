import { expect, test } from '@playwright/test';
import { collectErrors, skipPreloader } from './helpers';

const PAGES = [
  { path: '/', h1: 'Naveen Chand', title: /Naveen Chand: Software Engineer/ },
  { path: '/about', h1: 'Curious by default.', title: /About \| Naveen Chand/ },
  { path: '/work', h1: 'Selected work.', title: /Work \| Naveen Chand/ },
  { path: '/stack', h1: 'The stack.', title: /Stack \| Naveen Chand/ },
  { path: '/contact', h1: 'Let’s talk.', title: /Contact \| Naveen Chand/ },
];

for (const p of PAGES) {
  test(`${p.path} renders with its intro and no errors`, async ({ page }) => {
    await skipPreloader(page);
    const errors = collectErrors(page);
    await page.goto(p.path);
    await expect(page).toHaveTitle(p.title);
    const h1 = page.getByRole('heading', { level: 1, name: p.h1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('visibility', 'visible');
    expect(errors).toEqual([]);
  });
}

test('first visit shows the preloader, then the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.preloader')).toBeVisible();
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 8000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('unknown routes show the 404 page', async ({ page }) => {
  await skipPreloader(page);
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('That page doesn’t exist.')).toBeVisible();
});

test('SEO files are served', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).ok()).toBe(true);
  expect((await request.get('/robots.txt')).ok()).toBe(true);
  const og = await request.get('/opengraph-image');
  expect(og.ok()).toBe(true);
  expect(og.headers()['content-type']).toContain('image/png');
});
