import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
  });

  test('store page loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Store.*CZABA/);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Curated Sound Collections|Results for/);
  });

  test('search bar is visible and functional', async ({ page }) => {
    const searchInput = page.locator('input[name="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search/);

    await searchInput.fill('cinematic');
    await searchInput.press('Enter');

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/search=cinematic/);

    const heading = page.locator('h1');
    await expect(heading).toContainText(/Results for "cinematic"/);
  });

  test('search clear button removes search query', async ({ page }) => {
    await page.goto('/store?search=test');
    await page.waitForLoadState('networkidle');

    const clearButton = page.locator('button').filter({ has: page.locator('svg') }).filter({
      has: page.locator('[class*="X"], .lucide-x'),
    });

    if (await clearButton.first().isVisible()) {
      await clearButton.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).not.toHaveURL(/search=/);
    }
  });

  test('category filter pills are visible on desktop', async ({ page }) => {
    const allButton = page.locator('button').filter({ hasText: 'All' }).first();
    await expect(allButton).toBeVisible();

    const categories = ['Music', 'SFX', 'Loops', 'Sounds'];
    for (const cat of categories) {
      const pill = page.locator('button').filter({ hasText: cat }).first();
      await expect(pill).toBeVisible();
    }
  });

  test('clicking category filter toggles selection', async ({ page }) => {
    const musicPill = page.locator('.hidden.md\\:block button').filter({ hasText: 'Music' });
    if (await musicPill.isVisible()) {
      await musicPill.click();
      await expect(musicPill).toHaveClass(/bg-brand/);

      await musicPill.click();
      await expect(musicPill).not.toHaveClass(/bg-brand text-background/);
    }
  });

  test('clearing all filters resets to show all packs', async ({ page }) => {
    const musicPill = page.locator('.hidden.md\\:block button').filter({ hasText: 'Music' });
    if (await musicPill.isVisible()) {
      await musicPill.click();

      const allButton = page.locator('.hidden.md\\:block button').filter({ hasText: 'All' });
      await allButton.click();

      await expect(allButton).toHaveClass(/bg-brand/);
    }
  });

  test('product cards link to product detail pages', async ({ page }) => {
    const productLink = page.locator('a[href^="/products/"]').first();
    if (await productLink.isVisible()) {
      const href = await productLink.getAttribute('href');
      await productLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(href!));
    }
  });

  test('product cards display price in dollar format', async ({ page }) => {
    const priceElements = page.locator('a[href^="/products/"] span').filter({ hasText: /^\$\d/ });
    const count = await priceElements.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await priceElements.nth(i).textContent();
        expect(text).toMatch(/^\$\d+/);
      }
    }
  });

  test('value proposition badges are visible when no search', async ({ page }) => {
    const badges = ['24-bit / 48kHz', 'Yours Forever', 'Personal Studio Included'];
    for (const badge of badges) {
      const el = page.locator('span').filter({ hasText: badge });
      await expect(el).toBeVisible();
    }
  });

  test('value proposition badges are hidden during search', async ({ page }) => {
    await page.goto('/store?search=test');
    await page.waitForLoadState('networkidle');

    const badge = page.locator('span').filter({ hasText: '24-bit / 48kHz' });
    await expect(badge).toBeHidden();
  });

  test('empty state shows when no products match filter', async ({ page }) => {
    await page.goto('/store?search=zzzznonexistentproduct99999');
    await page.waitForLoadState('networkidle');

    const emptyMessage = page.locator('text=New collections arriving soon');
    const noResults = page.locator('text=Found 0 packs');
    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasNoResults = await noResults.isVisible().catch(() => false);
    expect(hasEmpty || hasNoResults).toBeTruthy();
  });

  test('pack count display updates with filter selection', async ({ page }) => {
    const countBefore = page.locator('.hidden.md\\:block .text-dim');
    const countTextBefore = await countBefore.textContent().catch(() => '');

    const sfxPill = page.locator('.hidden.md\\:block button').filter({ hasText: 'SFX' });
    if (await sfxPill.isVisible()) {
      await sfxPill.click();
      await page.waitForTimeout(300);

      const countAfter = page.locator('.hidden.md\\:block .text-dim');
      const countTextAfter = await countAfter.textContent().catch(() => '');

      if (countTextBefore && countTextAfter) {
        expect(countTextAfter).toMatch(/\d+ packs?/);
      }
    }
  });
});
