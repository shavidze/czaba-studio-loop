// C round 177 FUNC-SMOKE-TOGGLE: real mouse; Delete with a range + Undo, Loop wrap during playback, Metronome via the real output tap,
// Follow on / paused / resume (scrollLeft), Snap drag, Env double-click, Waveform Zoom 200 % (waveform only), Library Preview / Stop (tap), brace drag.
// node c177-func.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const { decode } = require('./png.cjs');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', `func-${W}-${ATT}`); fs.mkdirSync(SHD, { recursive: true });
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const net = []; const r = { W, ATT, utc: new Date().toISOString(), steps: {} };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c177func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  const loopBtn = () => p.locator('button', { has: p.locator('span', { hasText: /^Loop$/ }) }).first();
  const delBtn = () => p.locator('button', { has: p.locator('span', { hasText: /^Delete$/ }) }).first();
  const clickLoc = async (loc) => { const bb = await loc.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(350); await p.mouse.move(2, 2); };
  const sig = () => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ lane: e.closest('[data-track-id]').dataset.trackId, kind: e.dataset.clipKind, start: +e.getAttribute('data-clip-start'), w: +e.getBoundingClientRect().width.toFixed(1) })).sort((a, b) => (a.lane + a.start < b.lane + b.start ? -1 : 1)));
  const tap = async (ms) => { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); return S.map((s) => ({ t: s.t, peak: s.peak })); };
  const grid = () => p.evaluate(() => ({ ...document.querySelector('[data-testid=arrangement-grid-control]').dataset }));
  try {
    r.fonts = log.fontsReady && log.fontsReady.ok;
    await p.mouse.move(2, 2); await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    r.adds = [await L.addAt(p, 'demo-middle-east', 'music', 0), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    const ti = p.locator('[data-testid=arrangement-tempo-input]'); await ti.click(); await ti.fill('120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
    const clips = await L.clipsDom(p); const music = clips.find((c) => c.lane === 'music'); const sfx = clips.find((c) => c.lane === 'sfx');
    // 1. Delete with a range + Undo
    {
      const t0 = await sig(); r.steps.range1 = await X.rangeDrag(p, music.id, 2, 4);
      const dl = await delBtn().getAttribute('aria-label');
      await clickLoc(delBtn()); const t1 = await sig(); const st1 = await L.status(p);
      await X.key(p, 'Control+z'); const t2 = await sig();
      r.steps.deleteRange = { label: dl, before: t0.filter((c) => c.lane === 'music'), after: t1.filter((c) => c.lane === 'music'), status: st1, changed: JSON.stringify(t0) !== JSON.stringify(t1), undoRestored: JSON.stringify(t0) === JSON.stringify(t2) };
    }
    // 2. Loop on during playback: wraps at the loop end
    {
      await X.rangeDrag(p, music.id, 2, 4); await clickLoc(loopBtn()); const pr = await loopBtn().getAttribute('aria-pressed');
      const times = await p.locator('[data-testid=arrangement-loop-times]').textContent().catch(() => null);
      await L.seekTo(p, 1.5); await L.blur(p); await p.keyboard.press('Space');
      const pos = []; const t0 = Date.now(); while (Date.now() - t0 < 4500) { pos.push(await L.posNow(p)); await sleep(50); }
      await p.keyboard.press('Space'); await sleep(300);
      let wraps = 0; for (let i = 1; i < pos.length; i++) if (pos[i] < pos[i - 1] - 1) wraps++;
      r.steps.loopWrap = { pressed: pr, times, max: Math.max(...pos), minAfterStart: Math.min(...pos.slice(10)), wraps, n: pos.length, sample: pos.filter((_, i) => i % 6 === 0).map((v) => +v.toFixed(2)) };
      // brace drag moves the loop
      const bb = await p.locator('[data-testid=arrangement-loop-brace]').boundingBox();
      const x0 = bb.x + bb.width / 2, y0 = bb.y + bb.height / 2; await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x0 + 30, y0, { steps: 5 }); await p.mouse.move(x0 + 60, y0, { steps: 5 }); await p.mouse.up(); await sleep(400);
      r.steps.braceDrag = { before: times, after: await p.locator('[data-testid=arrangement-loop-times]').textContent().catch(() => null) };
      await X.key(p, 'Control+z'); r.steps.braceDrag.undo = await p.locator('[data-testid=arrangement-loop-times]').textContent().catch(() => null);
      await clickLoc(loopBtn()); r.steps.loopOff = await loopBtn().getAttribute('aria-pressed');
    }
    // 3. Metronome: mute every track, compare the output with the metronome off and on
    {
      const muteBtns = p.locator('[data-track-id] button[aria-label^="Mute — "]'); const n = await muteBtns.count();
      for (let i = 0; i < n; i++) await clickLoc(muteBtns.nth(i));
      await L.seekTo(p, 0.2); await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
      const off = await tap(2200);
      await clickLoc(p.locator('[data-testid=arrangement-metronome-toggle]')); const mp = await p.getAttribute('[data-testid=arrangement-metronome-toggle]', 'aria-pressed');
      await sleep(200); const on = await tap(2600);
      await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
      const bursts = (S, thr) => { const out = []; let last = -1e9; for (const s of S) if (s.peak > thr && s.t - last > 250) { out.push(+s.t.toFixed(0)); last = s.t; } return out; };
      const onPk = Math.max(...on.map((s) => s.peak)); const bs = bursts(on, Math.max(0.02, onPk * 0.3));
      r.steps.metronome = { tracksMuted: n, pressed: mp, offPeak: +Math.max(...off.map((s) => s.peak)).toFixed(4), onPeak: +onPk.toFixed(4), bursts: bs.length, intervals: bs.slice(1).map((t, i) => t - bs[i]) };
      await clickLoc(p.locator('[data-testid=arrangement-metronome-toggle]'));
      for (let i = 0; i < n; i++) await clickLoc(muteBtns.nth(i));
    }
    // 4. Snap: drag the sfx clip header +37 px with Snap off and with Snap on
    {
      const drag = async () => { const h = p.locator(`[data-clip-id="${sfx.id}"] > div`).first(); const bb = await h.boundingBox(); const x = bb.x + Math.min(30, bb.width / 2), y = bb.y + bb.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 20, y, { steps: 4 }); await p.mouse.move(x + 37, y, { steps: 4 }); await p.mouse.up(); await sleep(400); return +(await p.getAttribute(`[data-clip-id="${sfx.id}"]`, 'data-clip-start')); };
      const s0 = +(await p.getAttribute(`[data-clip-id="${sfx.id}"]`, 'data-clip-start'));
      const offStart = await drag(); await X.key(p, 'Control+z');
      await clickLoc(p.locator('[data-testid=arrangement-snap-toggle]')); const g = await grid();
      const onStart = await drag(); await X.key(p, 'Control+z');
      await clickLoc(p.locator('[data-testid=arrangement-snap-toggle]'));
      const gs = +g.gridSeconds; const onGrid = (v) => Math.abs(v / gs - Math.round(v / gs)) < 1e-6;
      r.steps.snap = { start0: s0, grid: g, offStart, onStart, offOnGrid: onGrid(offStart), onOnGrid: onGrid(onStart), restored: +(await p.getAttribute(`[data-clip-id="${sfx.id}"]`, 'data-clip-start')) };
    }
    // 5. Env on + double-click on the music clip body adds a point
    {
      await clickLoc(p.locator('[data-testid=arrangement-envelope-toggle]'));
      const cnt = () => p.locator(`[data-clip-id="${music.id}"] [data-testid=arrangement-clip-envelope-point]`).count();
      const n0 = await cnt(); const y = await X.bodyY(p, music.id, 0.5); const x = await X.tx(p, 1.3);
      await p.mouse.dblclick(x, y); await sleep(400); const n1 = await cnt();
      r.steps.env = { pressed: await p.getAttribute('[data-testid=arrangement-envelope-toggle]', 'aria-pressed'), points0: n0, points1: n1, status: await L.status(p) };
      await X.key(p, 'Control+z'); r.steps.env.undo = await cnt();
      await clickLoc(p.locator('[data-testid=arrangement-envelope-toggle]'));
    }
    // 6. Waveform Zoom 200 %: clip boxes unchanged, the drawn waveform changes
    {
      const box = await p.locator(`[data-clip-id="${music.id}"]`).boundingBox(); const clip = { x: box.x, y: box.y, width: Math.min(box.width, 400), height: box.height };
      const s0 = await sig(); const a = decode(await p.screenshot({ clip }));
      await p.locator('[data-testid=arrangement-waveform-zoom]').selectOption('2'); await sleep(600); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
      const s1 = await sig(); const c = decode(await p.screenshot({ clip, path: path.join(SHD, 'wzoom-200.png') }));
      let diff = 0; for (let y = 0; y < a.h; y++) for (let x2 = 0; x2 < a.w; x2++) { const u = a.px(x2, y), v = c.px(x2, y); if (Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]) + Math.abs(u[2] - v[2]) > 30) diff++; }
      r.steps.wzoom = { attr: (await grid()).waveformZoom, boxesSame: JSON.stringify(s0) === JSON.stringify(s1), pxChanged: diff, pxTotal: a.w * a.h, status: await L.status(p) };
      await p.locator('[data-testid=arrangement-waveform-zoom]').selectOption('1'); await sleep(300); await L.blur(p);
    }
    // 7. Library preview through the real output (transport stopped)
    {
      const opt = p.locator('[role=option][data-source-id="demo-middle-east"]'); await opt.scrollIntoViewIfNeeded(); await opt.click(); await sleep(600); await L.blur(p);
      const tg = p.locator('[data-testid=arrangement-library-preview-toggle]');
      const idle = await tap(600);
      await clickLoc(tg); await sleep(400); const label1 = (await tg.textContent()).trim(); const playing = await tap(1500);
      await clickLoc(tg); await sleep(500); const label2 = (await tg.textContent()).trim(); const after = await tap(800);
      const pk = (S) => +Math.max(0, ...S.map((s) => s.peak)).toFixed(4);
      r.steps.preview = { idlePeak: pk(idle), label1, playPeak: pk(playing), label2, afterPeak: pk(after.slice(5)), rowLabel: await p.locator('[data-testid=arrangement-library-option-previewing]').count() };
    }
    // 8. Follow: zoom in, play, scrollLeft follows; a manual wheel pauses; Follow resumes
    {
      const sc = '[data-testid=arrangement-timeline-scroller]'; const sl = () => p.evaluate((sc) => document.querySelector(sc).scrollLeft, sc);
      const zl = await p.evaluate(() => { const i = document.querySelector('input[type=range][aria-label*="oom"]'); return i ? i.getAttribute('aria-label') : null; });
      const slider = p.locator(`input[aria-label="${zl}"]`);
      const pps0 = (await L.geo(p)).pps; { const zb = await slider.boundingBox(); await p.mouse.click(zb.x + zb.width * 0.8, zb.y + zb.height / 2); await sleep(500); await p.mouse.move(2, 2); }
      r.steps.followZoom = { pps0, pps1: (await L.geo(p)).pps };
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const fm = () => p.getAttribute('[data-testid=arrangement-follow]', 'data-follow-mode');
      const m0 = await fm(); const a0 = await sl();
      await p.keyboard.press('Space'); const seq = []; let t0 = Date.now(); while (Date.now() - t0 < 10000) { seq.push([await L.posNow(p), await sl()]); await sleep(150); }
      const sb = await p.locator(sc).boundingBox(); await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.wheel(500, 0); await sleep(300);
      const m1 = await fm(); const pausedSeq = []; t0 = Date.now(); while (Date.now() - t0 < 1500) { pausedSeq.push([await L.posNow(p), await sl()]); await sleep(150); }
      await clickLoc(p.locator('[data-testid=arrangement-follow]')); const m2 = await fm();
      const resSeq = []; t0 = Date.now(); while (Date.now() - t0 < 1500) { resSeq.push([await L.posNow(p), await sl()]); await sleep(150); }
      await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
      const span = (s) => ({ pos: [s[0][0], s[s.length - 1][0]].map((v) => +v.toFixed(2)), sl: [s[0][1], s[s.length - 1][1]] });
      r.steps.follow = { m0, scrollLeft0: a0, onSeq: seq.map(([a, b2]) => [+a.toFixed(2), b2]), clientWidth: await p.evaluate((sc) => document.querySelector(sc).clientWidth, sc), on: span(seq), m1, paused: span(pausedSeq), pausedScrollConst: new Set(pausedSeq.map((x) => x[1])).size === 1, m2, resumed: span(resSeq) };
    }
  } catch (e) { r.error = String(e && e.stack || e).slice(0, 1200); }
  r.net = X.netOk(net); await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(r, null, 1));
  console.log(JSON.stringify(r, null, 1));
})();
