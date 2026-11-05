import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, label] = process.argv.slice(2);
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-347';
const browser = await chromium.launch();
const result = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor();
  await page.waitForTimeout(1500);
  const toggle = page.getByTestId('arrangement-detail-toggle');
  if (!(await page.getByTestId('arrangement-detail-clip-gain-fader').isVisible())) { await toggle.click(); await page.waitForTimeout(800); }
  const r = await page.evaluate(() => {
    const strip = (s) => s.replace(/ id="[^"]*"/g, '').replace(/ aria-describedby="[^"]*"/g, '');
    const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => l.querySelector('input[aria-label^="Volume — "]'));
    return {
      lanes: lanes.map((l) => ({ track: l.getAttribute('data-track-id'), vol: strip(l.querySelector('input[aria-label^="Volume — "]').outerHTML), volRow: l.querySelector('input[aria-label^="Volume — "]').parentElement.innerText.replace(/\s+/g, ' '), pan: l.querySelector('[data-testid="arrangement-track-pan"]') ? strip(l.querySelector('[data-testid="arrangement-track-pan"]').outerHTML) : null, panReset: l.querySelector('[data-testid="arrangement-track-pan-reset"]')?.outerHTML ?? null })),
      cg: strip(document.querySelector('[data-testid="arrangement-detail-clip-gain"]').outerHTML),
    };
  });
  result[w] = r;
  await page.screenshot({ path: `${outDir}/visual-${label}-${w}.png` });
  await ctx.close();
}
writeFileSync(`${outDir}/visual-${label}.json`, JSON.stringify(result, null, 1));
await browser.close();
console.log('done', label);
