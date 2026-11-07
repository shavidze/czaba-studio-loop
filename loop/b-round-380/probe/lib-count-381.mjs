import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const fs = await import('node:fs');
const browser = await chromium.launch();
const out = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto((process.argv[2] ?? 'http://127.0.0.1:5173') + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /ready/i }).waitFor({ timeout: 60000 });
  const status = await page.getByTestId('arrangement-status').textContent();
  const libOptions = await page.getByTestId('arrangement-library').getByRole('option').count().catch(() => -1);
  const allOptions = await page.getByRole('option').count();
  const listboxes = await page.getByRole('listbox').evaluateAll((els) => els.map((e) => ({ label: e.getAttribute('aria-label'), testid: e.closest('[data-testid]')?.getAttribute('data-testid'), n: e.querySelectorAll('[role=option]').length })));
  out.push({ viewport: `${w}x${h}`, status, libOptions, allOptions, listboxes });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
