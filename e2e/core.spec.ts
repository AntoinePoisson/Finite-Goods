import { expect, test } from '@playwright/test';

import { sitePath } from './utils/site';

test.beforeEach(async ({ page }) => {
  await page.goto(sitePath('/back-office'));
  await page.getByRole('button', { name: 'Reset demo' }).click();
});

test('a checkout return remains unverified', async ({ page }) => {
  await page.goto(sitePath('/acquire/ordinary-rock'));
  await page.getByLabel('Email address').focus();
  await page.getByLabel('Full name').hover();
  await page.getByLabel('Country').hover();
  await page.getByLabel('Card number').hover();
  await page.getByLabel('Expiry').focus();
  await page.getByLabel('CVC').focus();
  await expect(page.getByLabel('Email address')).toHaveValue('demo@finite-goods.dev');
  await expect(page.getByLabel('Card number')).toHaveValue('4242 4242 4242 4242');
  await page.getByRole('button', { name: 'Create demo reservation' }).click();
  await page.getByRole('button', { name: 'Preview Stripe return' }).click();

  await expect(page.getByRole('heading', { name: 'A return is not a confirmation.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate verified webhook' })).toBeVisible();
  await page.getByRole('link', { name: 'Open back office' }).click();
  await expect(page.getByText('Alex Morgan · demo@finite-goods.dev').first()).toBeVisible();
});

test('the collection stays usable on a mobile viewport', async ({ page, isMobile }) => {
  // The mobile projects already run at a phone viewport, and a device context refuses to resize.
  if (!isMobile) await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sitePath('/'));
  await expect(page.getByRole('heading', { name: /One object/ })).toBeVisible();
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('navigation, object cards and unknown routes have useful destinations', async ({ page }) => {
  await page.goto(sitePath('/'));
  await expect(page.locator('.bag-link')).toHaveCount(0);

  await page.getByRole('navigation').getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);

  await page.goto(sitePath('/'));
  await page
    .locator('.object-card')
    .first()
    .click({ position: { x: 12, y: 12 } });
  await expect(page).toHaveURL(/\/objects\/emergency-spoon$/);
  await expect(page.getByRole('link', { name: 'Back to collection' })).toBeVisible();

  await page.goto(sitePath('/back-office'));
  await expect(page.locator('.metric svg')).toHaveCount(4);

  await page.goto(sitePath('/operations'));
  await expect(page).toHaveURL(/\/back-office$/);

  await page.goto(sitePath('/how-it-works'));
  await expect(page.getByRole('heading', { name: /Static site/ })).toBeVisible();

  await page.goto(sitePath('/objects/ordinary-rock/extra'));
  await expect(page.getByRole('heading', { name: 'Nothing finite here.' })).toBeVisible();
});
