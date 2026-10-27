// C round 190 — DUR-190 + H1-190 + HIT-190 (copied from c-round-189 dur.cjs; TAG env; with TAG=-hit2 the card scroll waits for t>250 ms and readyState!=loading, see scrollprobe). node dur.cjs <W>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path'); const fs = require('fs');
const W = process.argv[2]; const ROOT = path.join(__dirname, '..'); const SH = path.join(ROOT, 'shots', 'loader'); fs.mkdirSync(SH, { recursive: true });
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = { W, utc: new Date().toISOString(), loads: [] };
  for (let k = 1; k <= 3; k++) {
    const r = { k }; const { ctx, page, ev } = await D.fresh(b, W);
    try {
      const t0 = Date.now(); await page.goto(L.BASE + '/', { waitUntil: 'commit' });
      await page.waitForFunction(() => document.querySelectorAll('button[class*="audio-preview"]').length > 3, null, { timeout: 20000, polling: 'raf' });
      if (process.env.TAG === '-hit2') await page.waitForFunction(() => performance.now() > 250 && document.readyState !== 'loading', null, { timeout: 20000, polling: 'raf' }); r.scrollState = await page.evaluate((i) => { const b = document.querySelectorAll('button[class*="audio-preview"]')[i]; b.scrollIntoView({ block: 'center' }); window.__ld.hitSel = { sel: 'button[class*="audio-preview"]', i }; return { insAlready: window.__ld.ins.length, t: performance.now() }; }, D.CARD_IDX[W]);
      r.inserted = await D.waitIns(page, 8000);
      if (k === 1) { await D.waitSince(page, 520); const f = path.join(SH, `mid-${W}${process.env.TAG||''}.png`); await page.screenshot({ path: f }); r.midShot = path.relative(ROOT, f); r.midShotAt = await D.sinceIns(page); }
      if (k === 2) { await D.waitSince(page, 520); const snap = await page.locator('body').ariaSnapshot(); r.ariaMidAt = await D.sinceIns(page); r.ariaH1 = (snap.match(/heading "[^"]*" \[level=1\]/g) || []); r.ariaHasCZABAoverlayText = /Cinematic Sound Design/i.test(snap); fs.writeFileSync(path.join(ROOT, 'out', `aria-mid-${W}.txt`), snap); }
      r.removed = await D.waitRem(page, 8000); await L.sleep(1100);
      const S = await page.evaluate(() => { const s = window.__ld; s.stopAt = performance.now(); return s; });
      r.dclMs = S.dcl; r.insMs = S.ins; r.remMs = S.rem; r.durMs = S.ins.length && S.rem.length ? +(S.rem[0] - S.ins[0]).toFixed(1) : null;
      r.h1max = S.h1max; r.h1bad = S.h1bad.slice(0, 5); r.h1Samples = S.samples.length; r.samplesFromDcl = S.samples.filter((x) => x.t >= S.dcl).length;
      const ovS = S.samples.filter((x) => x.ov); r.ovSamples = ovS.length; r.ariaHidden = [...new Set(ovS.map((x) => x.aria))]; r.headsInOv = Math.max(0, ...ovS.map((x) => x.heads));
      const lg = ovS.filter((x) => typeof x.logo === 'number'); r.logoMax = Math.max(0, ...lg.map((x) => x.logo));
      const hi = lg.filter((x) => x.logo >= 0.9); r.logoHiFirst = hi.length ? +(hi[0].t - S.ins[0]).toFixed(1) : null; r.logoHiLast = hi.length ? +(hi[hi.length - 1].t - S.ins[0]).toFixed(1) : null; r.logoHiSpan = hi.length ? +(hi[hi.length - 1].t - hi[0].t).toFixed(1) : 0;
      r.logoDipsInsideHi = hi.length ? lg.filter((x) => x.t > hi[0].t && x.t < hi[hi.length - 1].t && x.logo < 0.9).map((x) => ({ t: +(x.t - S.ins[0]).toFixed(1), o: x.logo })) : [];
      r.peNoneAfterIns = S.peNoneAt !== null ? +(S.peNoneAt - S.ins[0]).toFixed(1) : null;
      r.firstHitAfterIns = S.firstHit !== null ? +(S.firstHit - S.ins[0]).toFixed(1) : null;
      const hs = S.samples.filter((x) => x.t >= S.ins[0] && 'hit' in x); const after = hs.filter((x) => S.peNoneAt !== null && x.t >= S.peNoneAt + 20); r.hitAfterExit = { n: after.length, miss: after.filter((x) => !x.hit).length };
      r.hitDuringOpaque = hs.filter((x) => x.ov && (S.peNoneAt === null || x.t < S.peNoneAt)).filter((x) => x.hit).length;
      r.plays = S.plays; r.storage = await page.evaluate(() => ({ ss: sessionStorage.getItem('czaba_entrance_seen'), ls: localStorage.getItem('czaba_spotlight_last_shown') }));
      // real click → preview
      await page.evaluate(() => { const p = document.querySelector('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]'); if (p) p.click(); });
      const btn = page.locator('button[class*="audio-preview"]').nth(D.CARD_IDX[W]); let bx = await btn.boundingBox();
      if (W !== '375') { await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(600); bx = await btn.boundingBox(); }
      const url0 = page.url(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
      const s = []; const tc = Date.now(); while (Date.now() - tc < 4000) { s.push(await page.evaluate(() => (window.__media[0] ? { ct: window.__media[0].currentTime, paused: window.__media[0].paused } : null))); await L.sleep(250); }
      const ok = s.filter(Boolean); r.preview = { ct0: ok.length ? ok[0].ct : null, ctEnd: ok.length ? ok[ok.length - 1].ct : null, adv: ok.length ? +(ok[ok.length - 1].ct - ok[0].ct).toFixed(3) : 0, label: await btn.getAttribute('aria-label'), urlUnchanged: page.url() === url0 };
      await btn.click({ force: true }).catch(() => {});
      r.ev = ev; r.wallMs = Date.now() - t0;
    } catch (e) { r.err = String(e.stack || e).slice(0, 600); }
    res.loads.push(r); await ctx.close();
  }
  const d = res.loads.map((x) => x.durMs).filter((x) => x !== null).sort((a, c) => a - c); res.durSorted = d; res.durMedian = d[1];
  await b.close(); L.save(path.join(ROOT, 'out'), `dur-${W}${process.env.TAG||''}.json`, res);
  console.log(JSON.stringify(res.loads.map((x) => ({ k: x.k, err: x.err, dur: x.durMs, ins: x.insMs && x.insMs.map((v) => +v.toFixed(0)), dcl: x.dclMs && +x.dclMs.toFixed(0), h1max: x.h1max, h1bad: x.h1bad && x.h1bad.length, aria: x.ariaHidden, heads: x.headsInOv, logoMax: x.logoMax, hi: [x.logoHiFirst, x.logoHiLast, x.logoHiSpan], dips: x.logoDipsInsideHi, pe: x.peNoneAfterIns, hit: x.firstHitAfterIns, hitAfter: x.hitAfterExit, hitOpaque: x.hitDuringOpaque, ariaH1: x.ariaH1, st: x.storage, pv: x.preview, pe2: x.ev && x.ev.pageerror.length, hyd: x.ev && x.ev.hyd.length, foreign: x.ev && x.ev.foreign.filter((f) => !f.font).length, auth: x.ev && x.ev.auth.length }))));
  console.log('median', res.durMedian);
})();
