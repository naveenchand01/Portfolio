import { expect, test } from '@playwright/test';
import { collectErrors, skipPreloader } from './helpers';

test.describe('page transitions (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop nav only');

  test('nav links change pages without a full reload, and back works', async ({ page }) => {
    await skipPreloader(page);
    const errors = collectErrors(page);
    await page.goto('/');
    await page.evaluate(() => {
      (window as unknown as { __same: boolean }).__same = true;
    });

    const nav = page.getByRole('navigation', { name: 'Primary' });
    const steps = [
      ['About', '/about', 'Curious by default.', 'about'],
      ['Work', '/work', 'Selected work.', 'work'],
      ['Stack', '/stack', 'The stack.', 'stack'],
      ['Contact', '/contact', 'Let’s talk.', 'contact'],
    ] as const;
    for (const [label, path, h1, key] of steps) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible();
      await expect(page.locator('.transition-overlay')).not.toHaveClass(/is-active/);
      await expect(page.locator('html')).toHaveAttribute('data-page', key);
    }

    // Still the same document: no reload happened.
    expect(await page.evaluate(() => (window as unknown as { __same?: boolean }).__same)).toBe(true);

    await page.goBack();
    await expect(page).toHaveURL('/stack');
    await expect(page.getByRole('heading', { level: 1, name: 'The stack.' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the big "next page" link moves to the next page', async ({ page }) => {
    await skipPreloader(page);
    await page.goto('/about');
    await page.getByRole('link', { name: /Next: selected projects/ }).click();
    await expect(page).toHaveURL('/work');
  });
});
