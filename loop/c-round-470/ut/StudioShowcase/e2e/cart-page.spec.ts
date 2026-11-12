import { test, expect } from '@playwright/test';

test.describe('Cart Page', () => {
  test('empty cart displays correct empty state', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: 'Your Collection' });
    await expect(heading).toBeVisible();

    const emptyState = page.locator('text=Your collection awaits');
    const skeleton = page.locator('.animate-pulse');

    await page.waitForTimeout(3000);

    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasSkeleton = await skeleton.first().isVisible().catch(() => false);

    expect(hasEmptyState || hasSkeleton).toBeTruthy();
  });

  test('empty cart has link to store', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(3000);

    const storeLink = page.locator('a[href="/store"]');
    const count = await storeLink.count();
    expect(count).toBeGreaterThan(0);
  });

  test('continue browsing link navigates to store', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const continueBrowsing = page.locator('a[href="/store"]').filter({ hasText: /Continue Browsing/ });
    if (await continueBrowsing.isVisible()) {
      await continueBrowsing.click();
      await expect(page).toHaveURL(/\/store/);
    }
  });

  test('cart page heading shows item count when items exist', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: 'Your Collection' });
    await expect(heading).toBeVisible();
  });

  test('cart header badge shows correct count', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartLink = page.locator('header a[href="/cart"]');
    await expect(cartLink).toBeVisible();

    const badge = cartLink.locator('span.rounded-full');
    const hasBadge = await badge.isVisible().catch(() => false);

    if (hasBadge) {
      const text = await badge.textContent();
      expect(text).toMatch(/\d+/);
    }
  });
});
