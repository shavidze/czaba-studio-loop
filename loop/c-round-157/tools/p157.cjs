// C round 157 — probe: 1280 dialog scroll reachability of loop/mute notes; Escape vs range with/without loop.
const L = require('./lib.cjs'); const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const fs = require('fs'); const path = require('path');
const net = []; const res = { utc: new Date().toISOString(), errors: [] }; const OUTF = path.join(L.OUT, 'p157-1280.json'); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
const hasR = (p) => p.evaluate(() => !!document.querySelector('[data-testid=arrangement-range]'));
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, X.VPS[1280], 'p157-1280', net);
    await L.setSnapOff(p); await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    const hero = await H.byLane(p, 'music');
    await sec('escNoLoop', async () => { await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); const r0 = await hasR(p); const k1 = await X.key(p, 'Escape'); const r1 = await hasR(p); const k2 = await X.key(p, 'Escape'); const r2 = await hasR(p); return { r0, k1, r1, k2, r2 }; });
    await sec('escLoopNoDialog', async () => { await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); const l = await X.key(p, 'Control+l'); const r0 = await hasR(p); const k1 = await X.key(p, 'Escape'); const r1 = await hasR(p); const k2 = await X.key(p, 'Escape'); const r2 = await hasR(p); const l2 = await X.key(p, 'Control+l'); return { l, r0, k1, r1, k2, r2, l2 }; });
    await sec('escAfterDialog', async () => { const lb = await p.locator('[data-track-id=sfx]').first().boundingBox(); await p.mouse.click(await X.tx(p, 12), lb.y + lb.height / 2); await L.sleep(300); await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); const r0 = await hasR(p); await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await L.sleep(500); await p.keyboard.press('Escape'); await L.sleep(400); const act = await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim().slice(0, 15)); const k1 = await X.key(p, 'Escape'); const r1 = await hasR(p); const k2 = await X.key(p, 'Escape'); const r2 = await hasR(p); return { r0, act, k1, r1, k2, r2 }; });
    await sec('scroll', async () => {
      if (!(await hasR(p))) { await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); }
      await X.key(p, 'Control+l'); await p.click('[data-testid=arrangement-master] button[aria-label="Master Mute"]'); await L.sleep(200);
      await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await L.sleep(600);
      const m = () => p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]').getBoundingClientRect().top; const g = (t) => { const e = document.querySelector(`[data-testid=${t}]`); if (!e) return null; const r = e.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), aboveFooter: r.bottom <= f + 0.5 }; }; const rl = document.querySelector('label:has([data-testid=arrangement-export-scope-range])').getBoundingClientRect(); let sc = document.querySelector('[data-testid=arrangement-export-footer]').parentElement; while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; return { footerTop: +f.toFixed(1), rangeCard: { bottom: +rl.bottom.toFixed(1), aboveFooter: rl.bottom <= f + 0.5 }, loop: g('arrangement-export-loop-note'), mute: g('arrangement-export-master-mute'), st: sc.scrollTop, sh: sc.scrollHeight, ch: sc.clientHeight }; });
      const before = await m();
      await p.evaluate(() => { let sc = document.querySelector('[data-testid=arrangement-export-footer]').parentElement; while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; sc.scrollTop = sc.scrollHeight; }); await L.sleep(300);
      const after = await m(); await p.screenshot({ path: path.join(L.SHOTS, 'p157-export-scrolled-1280.png') });
      await p.keyboard.press('Escape'); await L.sleep(300);
      return { before, after };
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save(); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
