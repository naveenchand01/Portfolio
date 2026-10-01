import { expect, test } from '@playwright/test';
import { skipPreloader } from './helpers';

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  for (const path of ['/', '/about', '/work', '/stack', '/contact']) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await skipPreloader(page);
      await page.goto(path);
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('menu opens, navigates and closes', async ({ page }) => {
    await skipPreloader(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Site menu' });
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: /Work/ }).click();
    await expect(page).toHaveURL('/work');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  });
});
