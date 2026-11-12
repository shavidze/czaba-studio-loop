import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base, w = '1440', h = '900', reps = '3', cpu = '1'] = process.argv.slice(2);
const b = await chromium.launch();
const out = [];
for (let r = 0; r < Number(reps); r++) {
  const ctx = await b.newContext({ viewport: { width: Number(w), height: Number(h) } });
  await ctx.addInitScript(() => {
    window.__t = [];
    const sel = '[data-testid="entrance-loader"],[data-testid="entrance-cover"]';
    const vis = () => { const e = [...document.querySelectorAll(sel)].find((n) => { const s = getComputedStyle(n); return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0.05; }); return !!e; };
    let last = null;
    const tick = () => { const on = vis(); if (on !== last) { window.__t.push({ on, ms: Math.round(performance.now()) }); last = on; } if (performance.now() < 6000) requestAnimationFrame(tick); };
    new MutationObserver(() => { const on = vis(); if (on !== last) { window.__t.push({ on, ms: Math.round(performance.now()), via: 'mo' }); last = on; } }).observe(document, { childList: true, subtree: true, attributes: true });
    requestAnimationFrame(tick);
  });
  const p = await ctx.newPage();
  if (cpu !== '1') { const s = await ctx.newCDPSession(p); await s.send('Emulation.setCPUThrottlingRate', { rate: Number(cpu) }); }
  await p.goto(base + '/', { waitUntil: 'commit' });
  await p.waitForTimeout(6000);
  const res = await p.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
    const fp = performance.getEntriesByName('first-paint')[0]?.startTime ?? null;
    const t = window.__t; const onAt = t.find((x) => x.on)?.ms ?? null; const offAt = [...t].reverse().find((x) => !x.on && x.ms > (onAt ?? 0))?.ms ?? null;
    return { fp: fp && Math.round(fp), fcp: fcp && Math.round(fcp), onAt, offAt, flashMs: onAt == null || fcp == null ? null : Math.max(0, onAt - Math.round(fcp)), coverMs: onAt != null && offAt != null ? offAt - onAt : null, timeline: t };
  });
  out.push(res);
  console.log(`run${r} cpu${cpu} ${w}x${h}`, JSON.stringify(res));
  await ctx.close();
}
await b.close();
