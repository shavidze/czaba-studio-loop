import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const D = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-318'; const out = {};
const browser = await chromium.launch();
for (const [tag, base] of (process.env.ONE ? [['a', 'http://127.0.0.1:5191']] : [['h', 'http://127.0.0.1:5190'], ['a', 'http://127.0.0.1:5191']])) for (const [w, h] of (process.env.ONE ? [[1440, 900]] : [[1440, 900], [1280, 720]])) {
  const vp = `${w}x${h}`; const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const r = (out[`${tag}-${vp}`] = {});
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 }); await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 }); await page.waitForTimeout(800);
  const lanes = page.locator('[data-grid-seconds]:not([data-testid])'); const lb = await lanes.first().boundingBox(); const y = lb.y + lb.height * 0.7;
  await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300); await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  const sel = () => page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => /ring-brand/.test(c.className) || c.querySelector('.ring-brand')).length);
  r.selBefore = await sel(); r.geo = { lb, clip, lanes: await lanes.count(), l2: await lanes.nth(2).boundingBox(), l1: await lanes.nth(1).boundingBox() };
  const lN = await lanes.nth(2).boundingBox(); await page.mouse.click(lN.x + 600, lN.y + lN.height * 0.6); await page.waitForTimeout(300); r.selAfterEmptyClick = await sel();
  r.hit = await page.evaluate(([x, yy]) => { const e = document.elementFromPoint(x, yy); return `${e?.tagName}|${e?.getAttribute('data-testid')}|${e?.hasAttribute('data-grid-seconds')}`; }, [Math.min(clip.x + 500, w - 80), lN.y + lN.height * 0.5]);
  await page.keyboard.down('Control'); await page.mouse.move(Math.min(clip.x + 500, w - 80), lN.y + lN.height * 0.5); await page.mouse.down(); await page.mouse.move(clip.x + 150, y, { steps: 10 });
  r.marqueeVisible = await page.locator('[data-testid="arrangement-marquee"]').isVisible().catch(() => false);
  await page.mouse.up(); await page.keyboard.up('Control'); await page.waitForTimeout(400);
  r.selAfter = await sel(); r.status = await page.locator('[data-testid="arrangement-status"]').textContent();
  r.range = await page.locator('[data-testid="arrangement-range"]').textContent().catch(() => null);
  await page.screenshot({ path: `${D}/shots/${tag}-marquee2-${vp}.png` }); await ctx.close();
}
writeFileSync(`${D}/marquee.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await browser.close();
