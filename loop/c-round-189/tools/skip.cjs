// C round 189 — SKIP-189 (a) click centre, (a2) click at the card Play position, (b) Escape, (c) Tab. node skip.cjs <W>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const W = process.argv[2];
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] }); const out = [];
  for (const c of ['a', 'a2', 'b', 'c']) {
    const { ctx, page, ev } = await D.fresh(b, W); const r = { c };
    try {
      await page.goto(L.BASE + '/', { waitUntil: 'commit' });
      await page.waitForFunction(() => document.querySelectorAll('button[class*="audio-preview"]').length > 3, null, { timeout: 20000, polling: 'raf' });
      await page.evaluate((i) => { const b = document.querySelectorAll('button[class*="audio-preview"]')[i]; b.scrollIntoView({ block: 'center' }); window.__ld.hitSel = { sel: 'button[class*="audio-preview"]', i }; }, D.CARD_IDX[W]);
      await D.waitIns(page, 8000); const url0 = page.url();
      const bx = await page.locator('button[class*="audio-preview"]').nth(D.CARD_IDX[W]).boundingBox();
      r.inputAt = await D.waitSince(page, 300);
      if (c === 'a') await page.mouse.click(VP().width / 2, VP().height / 2);
      if (c === 'a2') await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
      if (c === 'b') await page.keyboard.press('Escape');
      if (c === 'c') await page.keyboard.press('Tab');
      await D.waitRem(page, 5000); await L.sleep(1500);
      const S = await page.evaluate(() => { const s = window.__ld; s.stopAt = performance.now(); return s; });
      const ins = S.ins[0]; const inT = c.startsWith('a') ? (S.clicks[0] || {}).t : (S.keys.find((k) => k.key === (c === 'b' ? 'Escape' : 'Tab')) || {}).t;
      r.inputEvAfterIns = inT ? +(inT - ins).toFixed(1) : null; r.remAfterIns = S.rem.length ? +(S.rem[0] - ins).toFixed(1) : null; r.remAfterInput = inT && S.rem.length ? +(S.rem[0] - inT).toFixed(1) : null;
      r.clicks = S.clicks; r.plays = S.plays.length; r.urlUnchanged = page.url() === url0; r.insCount = S.ins.length;
      const nxt = S.samples.find((x) => x.t > S.rem[0]); r.hitNextFrame = nxt ? { dt: +(nxt.t - S.rem[0]).toFixed(1), hit: nxt.hit } : null;
      r.media = await page.evaluate(() => window.__media.map((a) => ({ ct: a.currentTime, paused: a.paused })));
      r.label = await page.locator('button[class*="audio-preview"]').nth(D.CARD_IDX[W]).getAttribute('aria-label');
      r.focus = await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ' ' + (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30)) : null; });
      r.ev = { pageerror: ev.pageerror, hyd: ev.hyd };
    } catch (e) { r.err = String(e.stack || e).slice(0, 500); }
    out.push(r); await ctx.close();
  }
  function VP() { return D.VPS[W]; }
  await b.close(); L.save(path.join(__dirname, '..', 'out'), `skip-${W}.json`, out); console.log(JSON.stringify(out.map((r) => ({ ...r, clicks: r.clicks && r.clicks.map((k) => ({ t: +k.t.toFixed(0), inOv: k.inOv, tag: k.tag })) }))));
})();
