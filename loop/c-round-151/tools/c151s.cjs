// C round 150 — FUNC-SMOKE extras: BPM applies, library search filters, Ctrl+L on/off, drag 1 s + Ctrl+Z, play 2 s. node c150s.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = []; const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c151s-${W}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
const loopState = (p) => p.evaluate(() => { const br = document.querySelector('[data-testid=arrangement-loop-brace]'); const lab = br && br.querySelector('span'); const b = [...document.querySelectorAll('button')].find((x) => /^↻\s*Loop/.test(x.textContent.trim())); const cs = (e) => e && getComputedStyle(e); return { brace: br ? { enabled: br.dataset.loopEnabled, cls: br.className.match(/border-dashed|border-accent|bg-accent\/\d+|bg-transparent/g), bg: cs(br).backgroundColor, borderStyle: cs(br).borderTopStyle, label: lab && lab.textContent, labelColor: lab && cs(lab).color } : null, btnPressed: b && b.getAttribute('aria-pressed'), times: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null }; });
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `c151s-${W}`, net);
    await sec('start', async () => ({ snap: await L.setSnapOff(p) }));
    await sec('bpm', async () => {
      const sel = '[data-testid=arrangement-tempo-input]';
      const before = await p.evaluate((s) => ({ v: document.querySelector(s).value, ruler: (document.querySelector('[data-testid=arrangement-ruler]') || {}).textContent.slice(0, 80) }), sel);
      await p.click(sel, { clickCount: 3 }); await p.keyboard.type('90'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
      const after = await p.evaluate((s) => ({ v: document.querySelector(s).value, ruler: (document.querySelector('[data-testid=arrangement-ruler]') || {}).textContent.slice(0, 80) }), sel);
      const st = await L.status(p);
      await p.click(sel, { clickCount: 3 }); await p.keyboard.type(before.v); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
      const restored = await p.evaluate((s) => document.querySelector(s).value, sel);
      return { before, after, status: st, applied: after.v === '90' && after.ruler !== before.ruler, restored };
    });
    await sec('search', async () => {
      const sel = '[data-testid=arrangement-library-search]';
      const n0 = await p.locator('[role=option][data-source-id]').count();
      await p.click(sel); await p.keyboard.type('impact'); await sleep(500);
      const opts = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => o.dataset.sourceId));
      await p.fill(sel, ''); await sleep(400); const n2 = await p.locator('[role=option][data-source-id]').count(); await L.blur(p);
      return { n0, nFiltered: opts.length, opts, nCleared: n2, filters: opts.length > 0 && opts.length < n0 && n2 === n0 };
    });
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    await sec('play', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const c0 = await p.evaluate(() => window.__h.cbs); const ph0 = await L.posNow(p);
      await p.keyboard.press('Space'); await sleep(2000); await p.keyboard.press('Space'); await sleep(400);
      return { ph0, ph1: await L.posNow(p), cbsDelta: (await p.evaluate(() => window.__h.cbs)) - c0, ctx: await p.evaluate(() => window.__h.ctxs.map((c) => c.state)) };
    });
    await sec('dragUndo', async () => {
      const sfx = await H.byLane(p, 'sfx'); const before = sfx.start;
      const st = await H.dragHeader(p, sfx.id, 1); const mid = (await H.byLane(p, 'sfx')).start;
      const st2 = await X.key(p, 'Control+z'); const after = (await H.byLane(p, 'sfx')).start;
      return { before, mid, after, moved: +(mid - before).toFixed(3), restored: Math.abs(after - before) < 1e-6, status: st, undoStatus: st2 };
    });
    await sec('ctrlL', async () => {
      const sfx = await H.byLane(p, 'sfx'); const s0 = await loopState(p);
      const r = await X.rangeDrag(p, sfx.id, 4.4, 5.4);
      const on = await X.key(p, 'Control+l'); const sOn = await loopState(p);
      const shotOn = `c-round-151/shots/FS-ctrlL-on-${W}.png`; const strip = await p.locator('[data-testid=arrangement-loop-strip]').boundingBox(); if (strip) await p.screenshot({ path: path.join(L.ROOT, '..', shotOn), clip: { x: strip.x, y: strip.y - 10, width: Math.min(600, strip.width), height: strip.height + 20 } });
      const off = await X.key(p, 'Control+l'); const sOff = await loopState(p);
      const shotOff = `c-round-151/shots/FS-ctrlL-off-${W}.png`; if (strip) await p.screenshot({ path: path.join(L.ROOT, '..', shotOff), clip: { x: strip.x, y: strip.y - 10, width: Math.min(600, strip.width), height: strip.height + 20 } });
      const again = await X.key(p, 'Control+l'); const sAgain = await loopState(p);
      return { initial: s0, range: r, on, sOn, off, sOff, again, sAgain, shots: [shotOn, shotOff] };
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save(); console.log(JSON.stringify(res, null, 1).slice(0, 5000)); await b.close();
})();
