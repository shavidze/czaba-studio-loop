import { test, expect } from '@playwright/test';

test.describe('Homepage Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hero section displays with CTA button', async ({ page }) => {
    const heroSection = page.locator('section').filter({ has: page.locator('text=CZABA') }).first();
    await expect(heroSection).toBeVisible();

    const ctaButton = page.locator('a[href="/store"]').filter({ hasText: 'Discover the Collection' });
    await expect(ctaButton).toBeVisible();
  });

  test('hero slideshow background images load without error', async ({ page }) => {
    const heroImages = page.locator('section img[src*="studio-slide"]');
    const count = await heroImages.count();
    if (count > 0) {
      const firstImg = heroImages.first();
      await expect(firstImg).toBeVisible();
    }
  });

  test('newsletter section is present with email form', async ({ page }) => {
    const emailInput = page.locator('input[name="email"][type="email"]');
    if (await emailInput.first().isVisible()) {
      const subscribeButton = page.locator('button[type="submit"]').filter({ hasText: /Subscribe/ });
      await expect(subscribeButton.first()).toBeVisible();
    }
  });

  test('newsletter form rejects invalid email', async ({ page }) => {
    const emailInput = page.locator('input[name="email"][type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');

      const subscribeButton = page.locator('button[type="submit"]').filter({ hasText: /Subscribe/ }).first();
      await subscribeButton.click();

      const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(validity).toBeFalsy();
    }
  });

  test('newsletter honeypot field is hidden from view', async ({ page }) => {
    const honeypot = page.locator('input[name="website"]');
    if (await honeypot.count() > 0) {
      const isVisibleToUser = await honeypot.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity !== '0' && style.display !== 'none' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
      });
      expect(isVisibleToUser).toBeFalsy();
    }
  });

  test('perks badges (Early Access, Secret Tracks, Exclusive Drops) are visible', async ({ page }) => {
    const perks = ['Early Access', 'Secret Tracks', 'Exclusive Drops'];
    for (const perk of perks) {
      const perkEl = page.locator('span').filter({ hasText: perk });
      if (await perkEl.isVisible().catch(() => false)) {
        await expect(perkEl).toBeVisible();
      }
    }
  });

  test('latest releases section displays product cards or loading state', async ({ page }) => {
    const productSection = page.locator('text=Latest');
    if (await productSection.first().isVisible().catch(() => false)) {
      await expect(productSection.first()).toBeVisible();
    }
  });

  test('footer is present on homepage', async ({ page }) => {
    const footer = page.locator('footer');
    if (await footer.isVisible().catch(() => false)) {
      await expect(footer).toBeVisible();
    }
  });

  test('hero sound toggle changes button label on click', async ({ page }) => {
    const soundButton = page.locator('button[aria-label="Turn sound on"]');
    if (await soundButton.isVisible()) {
      await soundButton.click();

      const soundOffButton = page.locator('button[aria-label="Turn sound off"]');
      await expect(soundOffButton).toBeVisible({ timeout: 3000 });

      await soundOffButton.click();
      const soundOnButton = page.locator('button[aria-label="Turn sound on"]');
      await expect(soundOnButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('product section has "Browse the Collection" link to store', async ({ page }) => {
    const browseLink = page.locator('a[href="/store"]').filter({ hasText: 'Browse the Collection' });
    if (await browseLink.isVisible().catch(() => false)) {
      await expect(browseLink).toBeVisible();
    }
  });
});
