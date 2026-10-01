import { expect, type Page, test } from '@playwright/test';
import { skipPreloader } from './helpers';

async function fill(page: Page) {
  await page.getByLabel('Your name').fill('Jane Recruiter');
  await page.getByLabel('Your email').fill('jane@acme.com');
  await page.getByLabel('Message').fill('We are hiring a new-grad software engineer.');
}

test('contact form shows field errors for invalid input', async ({ page }) => {
  await skipPreloader(page);
  await page.goto('/contact');
  await page.getByRole('button', { name: /Send message/ }).click();
  await expect(page.getByText('Please enter your name')).toBeVisible();
});

test('contact form shows success when the API accepts the message', async ({ page }) => {
  await skipPreloader(page);
  await page.route('**/api/contact', (r) => r.fulfill({ status: 200, json: { ok: true } }));
  await page.goto('/contact');
  await fill(page);
  await page.getByRole('button', { name: /Send message/ }).click();
  await expect(page.getByText('Thanks, message sent.')).toBeVisible();
});

test('contact form offers an email fallback when the API is unavailable', async ({ page }) => {
  await skipPreloader(page);
  await page.route('**/api/contact', (r) =>
    r.fulfill({ status: 503, json: { ok: false, error: 'unavailable' } }),
  );
  await page.goto('/contact');
  await fill(page);
  await page.getByRole('button', { name: /Send message/ }).click();
  const fallback = page.getByRole('link', { name: 'Email me directly' });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('href', /^mailto:naveenchand01042002@gmail\.com/);
});
