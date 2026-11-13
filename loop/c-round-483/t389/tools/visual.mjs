import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, label, outDir] = process.argv.slice(2);
const browser = await chromium.launch();
const result = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await page.waitForTimeout(1500);
  const r = {};
  const foldBtns = page.getByTestId('arrangement-track-fold');
  r.foldCount = await foldBtns.count();
  r.foldUnfolded = await foldBtns.first().evaluate((e) => e.innerHTML);
  await foldBtns.first().click();
  await page.waitForTimeout(400);
  r.foldFolded = await foldBtns.first().evaluate((e) => e.innerHTML);
  await page.screenshot({ path: `${outDir}/${label}-${w}-folded.png` });
  await foldBtns.first().click();
  await page.waitForTimeout(400);
  r.foldUnfoldedAgain = await foldBtns.first().evaluate((e) => e.innerHTML);
  // video import plus buttons
  r.videoPlus = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /video/i.test(b.title + b.textContent) && b.querySelector('svg')).map((b) => ({ title: b.title, text: b.textContent.trim(), html: b.innerHTML })));
  // add clips
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor();
  await page.waitForTimeout(1200);
  r.audioHeader = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"] [title$="drag to move"]')].map((e) => e.querySelector('svg')?.outerHTML ?? null).slice(0, 2));
  r.videoHeader = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="video"] [title$="drag to move"]')].map((e) => e.querySelector('svg')?.outerHTML ?? null).slice(0, 2));
  r.videoClipCount = await page.locator('[data-clip-kind="video"]').count();
  await page.screenshot({ path: `${outDir}/${label}-${w}-clips.png` });
  result[w] = r;
  await ctx.close();
}
writeFileSync(`${outDir}/visual-${label}.json`, JSON.stringify(result, null, 1));
await browser.close();
console.log('done', label);
