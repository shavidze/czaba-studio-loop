// C round 197 — POINTER-197 on Video-row lane controls + packed markers hit test. node pointer197.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'pointer'); fs.mkdirSync(OUT, { recursive: true });
const act = (page) => page.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); return { id: a.dataset.testid || a.getAttribute('aria-label') || a.tagName, os: c.outlineStyle, ow: c.outlineWidth, fv: a.matches(':focus-visible'), fs: document.documentElement.dataset.focusSource || null, pressed: a.getAttribute('aria-pressed'), val: a.value || null }; });
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `pointer-${TAG}`, net, { deviceScaleFactor: 2 });
  const R = { W, PORT, steps: [] };
  const targets = ['[data-track-id="video"] button[aria-label^="Mute — "]', '[data-track-id="video"] button[aria-label^="Solo — "]', '[data-track-id="video"] input[type=range]', '[data-track-id="video"] [data-testid=arrangement-track-fold]'];
  for (const sel of targets) {
    const loc = page.locator(sel).first(); if (!(await loc.count())) { R.steps.push({ sel, missing: true }); continue; }
    const b = await loc.boundingBox(); const before = await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await sleep(150); const held = await act(page); await page.mouse.up(); await sleep(200); const rel = await act(page);
    const after = await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
    const isRange = sel.includes('range'); const isToggle = /Mute|Solo/.test(sel);
    if (isToggle) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(150); } // restore toggle state (pointer again)
    await page.keyboard.press(isRange ? 'ArrowDown' : 'Tab'); await sleep(200); const key = await act(page);
    R.steps.push({ sel, box: b, held, rel, scrollBefore: before, scrollAfter: after, key });
    await page.mouse.click(W - 3, H - 3); await sleep(100); await L.blur(page);
  }
  if (W === 1440) {
    // packed markers: Marker A at 0, Marker B at 0.3 s (labels clamped). Click the left 1 px of B (its stem) → jump to B.
    await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
    await L.seekTo(page, 0.3); await sleep(200);
    await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
    await L.seekTo(page, 2); await sleep(200);
    const m = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((b) => { const r = b.getBoundingClientRect(); const p = b.querySelector('[data-marker-label]').getBoundingClientRect(); return { t: b.dataset.markerTime, x: r.x, w: r.width, y: r.y, h: r.height, pillX: p.x, pillW: p.width }; }));
    R.packed = { markers: m, clicks: [] };
    const B = m.find((x) => x.t !== '0.000'), A = m.find((x) => x.t === '0.000');
    for (const dx of [0.5, 1.5, 3]) {
      const x = B.x + dx, y = B.y + B.h / 2; const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const f = e && e.closest('[data-testid=arrangement-marker]'); return f ? f.dataset.markerTime : (e ? e.tagName : null); }, [x, y]);
      await page.mouse.click(x, y); await sleep(300); R.packed.clicks.push({ dx, hit, pos: await L.posNow(page) }); await L.seekTo(page, 2); await sleep(150);
    }
    // keyboard ring on A while B is close: Tab to A, shot
    await page.mouse.move(W - 2, H - 2); await L.blur(page);
    for (let i = 0; i < 160; i++) { await page.keyboard.press('Tab'); await sleep(30); if (await page.evaluate(() => document.activeElement.dataset.markerTime === '0.000')) break; }
    await page.screenshot({ path: path.join(__dirname, '..', 'shots', `packed-A-focused-${TAG}.png`), clip: { x: A.x - 10, y: A.y - 10, width: (B.x + B.w) - A.x + 20, height: A.h + 20 } });
    await page.evaluate(() => document.activeElement.blur()); await sleep(100);
    await page.screenshot({ path: path.join(__dirname, '..', 'shots', `packed-A-unfocused-${TAG}.png`), clip: { x: A.x - 10, y: A.y - 10, width: (B.x + B.w) - A.x + 20, height: A.h + 20 } });
  }
  R.net = log; L.save(OUT, `pointer-${TAG}.json`, R);
  for (const s of R.steps) console.log(s.sel, s.missing ? 'MISSING' : `held ${s.held.os}/${s.held.fs} rel ${s.rel.os}/${s.rel.fs} scroll ${s.scrollBefore}->${s.scrollAfter} key ${s.key.id} ${s.key.os} fv${s.key.fv} ${s.key.fs} ${s.key.val || ''}`);
  if (R.packed) console.log('packed', JSON.stringify(R.packed));
  console.log('errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
