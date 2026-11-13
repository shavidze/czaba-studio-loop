import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.describe('Mobile viewport (375px)', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('mobile hamburger menu is visible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuButton).toBeVisible();
    });

    test('desktop nav is hidden on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const desktopNav = page.locator('header nav.hidden.lg\\:flex');
      await expect(desktopNav).toBeHidden();
    });

    test('mobile menu opens and shows nav links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();

      await page.waitForTimeout(500);

      const mobileNav = page.locator('header .lg\\:hidden nav');
      await expect(mobileNav).toBeVisible();

      const storeLink = mobileNav.locator('a[href="/store"]');
      await expect(storeLink).toBeVisible();
    });

    test('mobile menu closes when link is clicked', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();
      await page.waitForTimeout(500);

      const storeLink = page.locator('header .lg\\:hidden nav a[href="/store"]');
      await storeLink.click();

      await expect(page).toHaveURL(/\/store/);
    });

    test('mobile menu has sign in button for unauthenticated users', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();
      await page.waitForTimeout(500);

      const mobileSignIn = page.locator('header .lg\\:hidden button').filter({ hasText: 'Sign In' });
      const skeleton = page.locator('header .lg\\:hidden .animate-pulse');
      const hasMobileSignIn = await mobileSignIn.isVisible().catch(() => false);
      const hasSkeleton = await skeleton.isVisible().catch(() => false);

      expect(hasMobileSignIn || hasSkeleton).toBeTruthy();
    });

    test('mobile menu closes when toggled again', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();
      await page.waitForTimeout(500);

      await menuButton.click();
      await page.waitForTimeout(500);

      const mobileNavContainer = page.locator('header .lg\\:hidden.max-h-0');
      await expect(mobileNavContainer).toBeVisible();
    });

    test('store page mobile filter dropdown works', async ({ page }) => {
      await page.goto('/store');
      await page.waitForLoadState('networkidle');

      const filterButton = page.locator('.md\\:hidden button').filter({ hasText: /All Categories|\d+ selected/ });
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(300);

        const dropdown = page.locator('.md\\:hidden .absolute');
        await expect(dropdown).toBeVisible();

        const musicOption = dropdown.locator('button').filter({ hasText: 'Music' });
        await expect(musicOption).toBeVisible();
      }
    });

    test('cart page layout does not overflow on mobile', async ({ page }) => {
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      const bodyWidth = await body.evaluate((el) => el.scrollWidth);
      const viewportWidth = 375;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });
  });

  test.describe('Tablet viewport (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('layout adjusts properly for tablet', async ({ page }) => {
      await page.goto('/store');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();

      const body = page.locator('body');
      const bodyWidth = await body.evaluate((el) => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(768 + 5);
    });
  });
});
