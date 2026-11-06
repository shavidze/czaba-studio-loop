// usage: node paint-probe.mjs <label=baseURL>... ; writes paint-<label>.json
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const targets = process.argv.slice(2).map((a) => a.split('='));
const runs = Number(process.env.RUNS ?? 5);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const out = Object.fromEntries(targets.map(([l]) => [l, []]));
for (let i = 0; i < runs; i++) {
  for (const [label, base] of targets) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__lt = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ s: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
    });
    await page.goto(base + '/studio-lab', { waitUntil: 'load' });
    await page.waitForFunction(() => document.body.innerText.includes('Demo collection ready'), null, { timeout: 30000 }).catch(() => {});
    const readyAt = await page.evaluate(() => performance.now());
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const wrapper = document.querySelector('.page-transition-wrapper');
      return { dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, fcp: fcp ? fcp.startTime : null, longtasks: window.__lt, wrapperOpacityNow: wrapper ? getComputedStyle(wrapper).opacity : null, wrapperStyleAttr: wrapper ? wrapper.getAttribute('style') : null };
    });
    const html = await (await ctx.request.get(base + '/studio-lab')).text();
    const ssrOpacity0 = /class="page-transition-wrapper"[^>]*style="[^"]*opacity:0/.test(html) || /style="[^"]*opacity:0[^"]*"[^>]*class="page-transition-wrapper"/.test(html);
    const firstLT = m.longtasks.filter((t) => t.s <= (m.fcp ?? 0) + 200).map((t) => Math.round(t.d));
    out[label].push({ run: i, dcl: Math.round(m.dcl), fcp: m.fcp && Math.round(m.fcp), fcpMinusDcl: m.fcp && Math.round(m.fcp - m.dcl), readyAt: Math.round(readyAt), longtasksNearFcp: firstLT, maxLongtaskBeforeReady: Math.max(0, ...m.longtasks.filter((t) => t.s < readyAt).map((t) => Math.round(t.d))), ssrOpacity0, wrapperStyleAttr: m.wrapperStyleAttr });
    await ctx.close();
  }
}
await browser.close();
for (const [label, rows] of Object.entries(out)) {
  fs.writeFileSync(`paint-${label}.json`, JSON.stringify(rows, null, 1));
  const med = (k) => { const v = rows.map((r) => r[k]).filter((x) => x != null).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  console.log(label, 'median dcl', med('dcl'), 'fcp', med('fcp'), 'fcp-dcl', med('fcpMinusDcl'), 'ready', med('readyAt'), 'ssrOpacity0', rows.map((r) => r.ssrOpacity0).join(','), 'nearFcpLT', JSON.stringify(rows.map((r) => r.longtasksNearFcp)));
}
