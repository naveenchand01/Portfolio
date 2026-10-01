import type { Page } from '@playwright/test';

/** Skip the first-visit preloader so tests start on the page itself. */
export async function skipPreloader(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('nc-seen', '1');
    } catch {}
  });
}

export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}
