// B round 409 -> 410 probe (PERF-15a regression): the demo collection sets no peaksUrl, so /studio-lab must behave exactly as at HEAD.
// Usage: node peaks-probe-410.mjs <baseUrl> <outJson> <WxH>
// Records: every fetch/xhr whose URL contains "peaks"; for every library source row: the preview wave rect count after selecting it,
// and the source row text; page errors. ok = no page error, 0 peaks requests, and every ready source shows 96 preview columns.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const out = { base, at: new Date().toISOString(), viewport: `${w}x${h}`, sources: {}, peaksRequests: [], pageErrors: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
const page = await ctx.newPage();
page.on('pageerror', (e) => out.pageErrors.push(String(e)));
page.on('request', (r) => { if (/peaks/i.test(r.url()) && ['fetch', 'xhr'].includes(r.resourceType())) out.peaksRequests.push(r.url()); });
try {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  const ids = await page.locator('[data-source-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-source-id')));
  out.sourceIds = ids;
  for (const id of ids) {
    await page.locator(`[data-source-id="${id}"]`).first().click();
    await page.waitForTimeout(400);
    const rects = await page.locator('[data-testid="arrangement-library-preview-wave"] svg rect').count();
    out.sources[id] = { rects };
  }
  await page.screenshot({ path: outPath.replace(/\.json$/, '.png') });
  out.ok = out.pageErrors.length === 0 && out.peaksRequests.length === 0 && ids.length > 0 && Object.values(out.sources).every((s) => s.rects === 96);
} catch (e) {
  out.error = String(e);
  out.ok = false;
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ok: out.ok, error: out.error, sources: out.sources, peaksRequests: out.peaksRequests.length, pageErrors: out.pageErrors.length }));
