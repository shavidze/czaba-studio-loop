import { test, expect } from '@playwright/test';

test.describe('Auth Modal', () => {
  test('sign in button opens auth modal on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('auth modal closes on backdrop click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      await modal.click({ position: { x: 10, y: 10 } });

      await expect(modal).toBeHidden({ timeout: 5000 });
    }
  });

  test('auth modal closes on ESC key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      await page.keyboard.press('Escape');

      await expect(modal).toBeHidden({ timeout: 5000 });
    }
  });

  test('auth modal close button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      await expect(modal).toBeHidden({ timeout: 5000 });
    }
  });

  test('sign in form validates empty email', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const submitButton = modal.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        const errorMessage = page.locator('text=Email is required');
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('sign in form validates invalid email format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const emailInput = modal.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill('not-an-email');

      const submitButton = modal.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        const errorMessage = page.locator('text=valid email');
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('sign in form validates empty password', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const emailInput = modal.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill('test@example.com');

      const submitButton = modal.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        const errorMessage = page.locator('text=Password is required');
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('can switch between sign in and sign up forms', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const signUpLink = modal.locator('button, a').filter({ hasText: /sign up|create account|register/i }).first();
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        await page.waitForTimeout(500);

        const signUpForm = modal.locator('text=/create.*account|sign.*up|register/i');
        await expect(signUpForm.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('social login buttons are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header button').filter({ hasText: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();

      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const googleButton = modal.locator('button').filter({ hasText: /google/i });
      const hasGoogle = await googleButton.isVisible().catch(() => false);
      expect(hasGoogle).toBeTruthy();
    }
  });
});
