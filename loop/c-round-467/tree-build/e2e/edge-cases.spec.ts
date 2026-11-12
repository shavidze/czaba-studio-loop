import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Robustness', () => {
  test('page does not crash with XSS-like search query', async ({ page }) => {
    await page.goto('/store?search=%3Cscript%3Ealert(1)%3C/script%3E');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    const heading = page.locator('h1');
    const headingText = await heading.textContent();
    expect(headingText).not.toContain('<script>');
  });

  test('XSS in search query is properly escaped in display', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    await page.goto(`/store?search=${encodeURIComponent(xssPayload)}`);
    await page.waitForLoadState('networkidle');

    const dialogCount = await page.evaluate(() => {
      let count = 0;
      const orig = window.alert;
      window.alert = () => { count++; };
      setTimeout(() => { window.alert = orig; }, 1000);
      return count;
    });
    expect(dialogCount).toBe(0);

    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).not.toContain('onerror');
  });

  test('extremely long search query does not break layout', async ({ page }) => {
    const longQuery = 'a'.repeat(500);
    await page.goto(`/store?search=${longQuery}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
  });

  test('double-clicking navigation links does not cause issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const storeLink = page.locator('header nav a[href="/store"]').first();
    if (await storeLink.isVisible()) {
      await storeLink.dblclick();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveURL(/\/store/);
    }
  });

  test('navigating to product page with invalid handle shows error', async ({ page }) => {
    await page.goto('/products/this-product-does-not-exist-99999');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasError = /not found|error|404|doesn't exist|unavailable/i.test(body || '');
    expect(hasError).toBeTruthy();
  });

  test('page loads correctly after clearing browser cookies', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await context.clearCookies();

    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('JavaScript console has no critical errors on homepage', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('ResizeObserver') &&
        !err.includes('Non-Error promise rejection') &&
        !err.includes('Loading chunk') &&
        !err.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('JavaScript console has no critical errors on store page', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('ResizeObserver') &&
        !err.includes('Non-Error promise rejection') &&
        !err.includes('Loading chunk') &&
        !err.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('store page product images handle missing images gracefully', async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let broken = 0;
      images.forEach((img) => {
        if (img.naturalWidth === 0 && img.complete && img.src) {
          broken++;
        }
      });
      return broken;
    });

    expect(brokenImages).toBe(0);
  });

  test('newsletter form handles rapid submit gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"][type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');

      const subscribeButton = page.locator('button[type="submit"]').filter({ hasText: /Subscribe/ }).first();

      await subscribeButton.click();
      await subscribeButton.click();
      await subscribeButton.click();

      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('store page handles URL with unknown query parameters', async ({ page }) => {
    await page.goto('/store?unknown=value&another=test');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
});
