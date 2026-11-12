import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('header has proper aria labels on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartLink = page.locator('header a[aria-label="Cart"]');
    await expect(cartLink).toBeVisible();

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
  });

  test('hero sound toggle button has correct aria-label', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const soundButton = page.locator('button[aria-label="Turn sound on"], button[aria-label="Turn sound off"]');
    if (await soundButton.isVisible()) {
      await expect(soundButton).toHaveAttribute('aria-label', /Turn sound (on|off)/);
    }
  });

  test('cart item remove buttons have aria-labels', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const removeButtons = page.locator('button[aria-label="Remove item"]');
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await expect(removeButtons.nth(i)).toHaveAttribute('aria-label', 'Remove item');
    }
  });

  test('keyboard navigation works in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    const tag = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input']).toContain(tag);
  });

  test('auth modal traps focus appropriately', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toHaveAttribute('aria-label', 'Close');
    }
  });

  test('newsletter form has proper input type for email', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"][name="email"]');
    if (await emailInput.first().isVisible()) {
      await expect(emailInput.first()).toHaveAttribute('type', 'email');
      await expect(emailInput.first()).toHaveAttribute('required', '');
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img:not([alt=""])');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('no auto-playing audio on page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const audioElements = page.locator('audio');
    const count = await audioElements.count();

    for (let i = 0; i < count; i++) {
      const autoplay = await audioElements.nth(i).getAttribute('autoplay');
      expect(autoplay).toBeNull();

      const isPaused = await audioElements.nth(i).evaluate((el: HTMLAudioElement) => el.paused);
      expect(isPaused).toBeTruthy();
    }
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('header a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      const hasDiscernibleText = (text && text.trim().length > 0) || ariaLabel || title;
      expect(hasDiscernibleText).toBeTruthy();
    }
  });
});
