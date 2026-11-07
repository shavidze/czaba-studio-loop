// C round 190 — SKIP-190 (c)/(d) without pre-scroll: Tab / Shift+Tab ~300 ms after insertion with the page at the top. node tabtop.cjs <W>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const W = process.argv[2];
(async () => {
  const b = await L.chromium.launch({ headless: true }); const out = [];
  for (const key of ['Tab', 'Shift+Tab']) {
    const { ctx, page, ev } = await D.fresh(b, W); await ctx.addInitScript(() => { window.__kdp = []; window.addEventListener('keydown', (e) => window.__kdp.push({ key: e.key, dp: e.defaultPrevented })); });
    await page.goto(L.BASE + '/', { waitUntil: 'commit' }); await D.waitIns(page, 8000); const url0 = page.url(); await D.waitSince(page, 300);
    await page.keyboard.press(key); await D.waitRem(page, 3000); await L.sleep(400);
    const r = await page.evaluate(() => { const S = window.__ld; const kt = S.keys.find((k) => k.key === 'Tab'); const a = document.activeElement; const rc = a.getBoundingClientRect(); const e = document.elementFromPoint(rc.x + Math.min(rc.width / 2, 5), rc.y + Math.min(rc.height / 2, 5));
      return { remAfterKey: +(S.rem[0] - kt.t).toFixed(1), keyAfterIns: +(kt.t - S.ins[0]).toFixed(1), kdp: window.__kdp, el: a.tagName + ' ' + (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30)), isBody: a === document.body, rect: [rc.x, rc.y, rc.width, rc.height].map(Math.round), inViewport: rc.width > 0 && rc.bottom > 0 && rc.top < innerHeight && rc.right > 0 && rc.left < innerWidth, topAtPoint: !!(e && (e === a || a.contains(e))), footer: !!a.closest('footer'), header: !!a.closest('header'), scrollY, plays: S.plays.length }; });
    r.key = key; r.urlUnchanged = page.url() === url0; r.pageerror = ev.pageerror.length; await page.screenshot({ path: path.join(__dirname, '..', 'shots', `tabtop-${W}-${key.replace('+', '')}.png`) }); out.push(r); await ctx.close();
  }
  await b.close(); L.save(path.join(__dirname, '..', 'out'), `tabtop-${W}.json`, out); for (const r of out) console.log(W, JSON.stringify(r));
})();
