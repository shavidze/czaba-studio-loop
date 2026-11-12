import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
  });
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/cart') {
      await route.fulfill({ json: { id: null, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 } });
    } else if (pathname.startsWith('/api/')) {
      await route.fulfill({ status: 503, json: { message: 'Backend unavailable in isolated smoke test' } });
    } else {
      await route.continue();
    }
  });
});

test('empty cart offers a visible next action without a backend', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your Collection', exact: true })).toBeVisible();
  await expect(page.getByText('Your collection awaits', { exact: true })).toBeVisible();
  const discover = page.getByRole('link', { name: 'Discover the Collection', exact: true });
  await expect(discover).toBeVisible();
  await expect(discover).toHaveAttribute('href', '/store');
});

test('sign-in opens and Escape returns to the cart', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByText('Your collection awaits', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign In', exact: true }).first().click();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your Collection', exact: true })).toBeVisible();
});
