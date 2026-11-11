import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  window.__t = []; const t0 = performance.now();
  new MutationObserver(() => { const on = !!document.querySelector('[data-testid="entrance-loader"]'); const last = window.__t.at(-1); if (!last || last.on !== on) window.__t.push({ on, ms: Math.round(performance.now() - t0) }); }).observe(document, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', () => window.__t.push({ ev: 'DCL', ms: Math.round(performance.now() - t0) }));
});
const p = await ctx.newPage();
const run = async (label, fn) => { await fn(); await p.waitForTimeout(2500);
  const fcp = await p.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null);
  console.log(label, JSON.stringify({ fcp: fcp && Math.round(fcp), timeline: await p.evaluate(() => window.__t) })); };
await run('fresh-tab', () => p.goto(base + '/', { waitUntil: 'commit' }));
await run('same-tab-reload', () => p.reload({ waitUntil: 'commit' }));
const p2 = await ctx.newPage(); await p2.goto(base + '/', { waitUntil: 'commit' }); await p2.waitForTimeout(2500);
console.log('new-tab-same-context', JSON.stringify(await p2.evaluate(() => window.__t)));
await b.close();
