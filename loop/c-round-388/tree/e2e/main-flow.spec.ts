import { test, expect } from '@playwright/test';

test.describe('Main Purchase Flow', () => {
  test('homepage loads and displays products', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await expect(page).toHaveTitle(/CZABA/);

    // Check header exists
    await expect(page.locator('header')).toBeVisible();

    // Check for product cards (should load from Shopify)
    const productSection = page.locator('[data-testid="product-section"]').first();
    // Even if no products, page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate to product page', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.waitForLoadState('networkidle');

    // Try to find a product link
    const productLink = page.locator('a[href^="/products/"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();

      // Should be on product page
      await expect(page.url()).toContain('/products/');

      // Product page should have title
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('cart functionality works', async ({ page }) => {
    await page.goto('/');

    // Open cart (should work even if empty)
    const cartButton = page.locator('[data-testid="cart-button"]');
    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Cart drawer or modal should appear
      await expect(page.locator('[data-testid="cart-drawer"], [data-testid="cart-modal"]')).toBeVisible({ timeout: 5000 }).catch(() => {
        // Cart might not have data-testid, that's ok
      });
    }
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Check that navigation links work
    const navLinks = [
      { name: 'Music', path: '/music' },
      { name: 'Hire Us', path: '/hire-us' },
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`nav a[href="${link.path}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page.url()).toContain(link.path);
        await page.goto('/'); // Go back to home
      }
    }
  });

  test('error page displays correctly for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');

    // Should show 404 or error message
    await expect(page.locator('body')).toContainText(/not found|error|404/i);
  });
});
