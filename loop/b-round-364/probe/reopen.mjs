import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = 'http://127.0.0.1:5173/studio-lab';
const out = {};
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
async function run(label) {
  const t0 = Date.now();
  await page.goto(base, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready|failed/i.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(1500);
  out[label] = {
    wallToReadyMs: Date.now() - t0,
    mp3: await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\.mp3/.test(e.name)).map((e) => ({ name: e.name.replace(location.origin, ''), transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, status: e.responseStatus, duration: Math.round(e.duration) }))),
    opfs: await page.evaluate(async () => { try { const d = await navigator.storage.getDirectory(); const n = []; for await (const k of d.keys()) n.push(k); return n; } catch (e) { return String(e); } }),
    estimate: await page.evaluate(async () => navigator.storage.estimate()),
  };
}
await run('cold');
await run('warm');
console.log(JSON.stringify(out, null, 1));
await browser.close();
