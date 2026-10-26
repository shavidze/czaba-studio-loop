import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
  test('homepage loads with correct title and hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CZABA/);
    await expect(page.locator('header')).toBeVisible();

    const heroTitle = page.locator('h1').filter({ hasText: 'CZABA' });
    await expect(heroTitle.first()).toBeVisible();
  });

  test('header logo navigates to homepage', async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const logo = page.locator('header a[href="/"]');
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('desktop nav links navigate correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navLinks = [
      { text: 'Store', path: '/store' },
      { text: 'Gift Cards', path: '/gift-cards' },
      { text: 'Free Samples', path: '/free-downloads' },
      { text: 'About', path: '/about' },
      { text: 'Hire Us', path: '/hire-us' },
    ];

    for (const link of navLinks) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const navLink = page.locator(`header nav a[href="${link.path}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(new RegExp(link.path));
      }
    }
  });

  test('home hero CTA navigates to store', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const ctaLink = page.locator('a[href="/store"]').filter({ hasText: 'Discover the Collection' });
    if (await ctaLink.isVisible()) {
      await ctaLink.click();
      await expect(page).toHaveURL(/\/store/);
    }
  });

  test('404 page shows error for invalid routes', async ({ page }) => {
    const response = await page.goto('/this-route-absolutely-does-not-exist-99999');
    await expect(page.locator('body')).toContainText(/not found|error|404/i);
  });

  test('browser back/forward navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/store/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');

    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/store/);
  });

  test('cart link in header navigates to cart page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartLink = page.locator('header a[href="/cart"]');
    await expect(cartLink).toBeVisible();
    await cartLink.click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('rapid navigation between pages does not break the app', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const routes = ['/store', '/about', '/hire-us', '/cart', '/store', '/'];
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
    }

    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });
});
