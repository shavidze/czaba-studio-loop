// C round 190 — record scrollY changes after an early scrollIntoView (as dur.cjs), fresh vs seen. node scrollprobe.cjs <W> <mode> <n>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const [W, MODE, N] = [process.argv[2], process.argv[3], +(process.argv[4] || 3)];
(async () => {
  const b = await L.chromium.launch({ headless: true }); const out = [];
  for (let k = 0; k < N; k++) {
    const { ctx, page } = await D.fresh(b, W);
    if (MODE === 'seen') await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
    await ctx.addInitScript(() => { window.__sc = []; addEventListener('scroll', () => { window.__sc.push({ t: Math.round(performance.now()), y: Math.round(scrollY), ov: !!document.querySelector('[data-testid=entrance-loader]'), h: document.documentElement.scrollHeight }); }, true); });
    await page.goto(L.BASE + '/', { waitUntil: 'commit' });
    await page.waitForFunction(() => document.querySelectorAll('button[class*="audio-preview"]').length > 3, null, { timeout: 20000, polling: 'raf' });
    const t0 = await page.evaluate((i) => { const b = document.querySelectorAll('button[class*="audio-preview"]')[i]; b.scrollIntoView({ block: 'center' }); return Math.round(performance.now()); }, D.CARD_IDX[W]);
    await L.sleep(3500);
    const r = await page.evaluate(() => ({ sc: window.__sc, ins: window.__ld.ins.map(Math.round), rem: window.__ld.rem.map(Math.round), y: scrollY, h: document.documentElement.scrollHeight }));
    r.scrollAt = t0; out.push(r); await ctx.close();
  }
  await b.close(); L.save(path.join(__dirname, '..', 'out'), `scroll-${W}-${MODE}.json`, out);
  for (const r of out) console.log(MODE, 'scrollAt', r.scrollAt, 'ins', r.ins, 'rem', r.rem, 'final', r.y, 'h', r.h, JSON.stringify(r.sc.filter((s, i, a) => i === 0 || s.y !== a[i - 1].y)).slice(0, 600));
})();
