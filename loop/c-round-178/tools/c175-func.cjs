// C round 175 FUNC-SMOKE-DUX5B1: real-mouse drags of every changed control + real output tap. node c175-func.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] });
  const net = []; const r = { W, ATT, steps: {} };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c175func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  const box = async (sel) => { const e = await p.$(sel); if (!e) throw new Error('missing ' + sel); return e.boundingBox(); };
  const attr = (sel, a) => p.evaluate(({ sel, a }) => { const e = document.querySelector(sel); return e ? (a === 'value' ? e.value : e.getAttribute(a)) : null; }, { sel, a });
  const drag = async (x0, y0, dx, dy) => { await p.mouse.move(x0, y0); await sleep(80); await p.mouse.down(); await p.mouse.move(x0 + dx / 2, y0 + dy / 2, { steps: 5 }); await p.mouse.move(x0 + dx, y0 + dy, { steps: 5 }); await sleep(120); await p.mouse.up(); await sleep(400); };
  const rangeDrag = async (name, sel, toFrac) => { const bb = await box(sel); const v0 = await attr(sel, 'value'); const min = +(await attr(sel, 'min')), max = +(await attr(sel, 'max')); const frac = (+v0 - min) / (max - min || 1); const x0 = bb.x + 8 + frac * (bb.width - 16); await drag(x0, bb.y + bb.height / 2, bb.x + 8 + toFrac * (bb.width - 16) - x0, 0); const v1 = await attr(sel, 'value'); r.steps[name] = { v0, v1, changed: v0 !== v1, status: await L.status(p) }; await L.blur(p); await p.mouse.move(2, 2); return r.steps[name]; };
  const peakFor = async (ms) => { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); const t0 = S.length ? S[0].t : 0; return +S.filter((s) => s.t - t0 > 150).reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5); };
  try {
    r.fonts = log.fontsReady && log.fontsReady.ok;
    await p.mouse.move(2, 2); await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    r.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-stem-bass', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    const clips = await L.clipsDom(p); const music = clips.find((c) => c.lane === 'music'); const sfx = clips.find((c) => c.lane === 'sfx');
    await X.muteLanes(p, ['video', 'stems', 'sfx']);
    // play: playhead moves; music volume drag lowers the real output
    await L.seekTo(p, 5); const pos0 = await L.posNow(p);
    await L.blur(p); await p.keyboard.press('Space'); await sleep(600);
    const peakBefore = await peakFor(900);
    const meterBefore = await attr('[data-track-id=music] [data-testid=arrangement-track-meter]', 'data-level-db');
    await rangeDrag('music-volume', '[data-track-id=music] input[type=range][aria-label^="Volume — "]', 0);
    await sleep(300); const peakAfter = await peakFor(900);
    const meterAfter = await attr('[data-track-id=music] [data-testid=arrangement-track-meter]', 'data-level-db');
    const pos1 = await L.posNow(p);
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    r.play = { pos0, pos1, moved: pos1 > pos0 + 1, peakBefore, peakAfter, ratio: peakBefore ? +(peakAfter / peakBefore).toFixed(4) : null, meterBefore, meterAfter, ctx: await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state)) };
    await rangeDrag('music-pan', '[data-track-id=music] [data-testid=arrangement-track-pan]', 0.1);
    await rangeDrag('master-volume', 'input[type=range][aria-label="Master Volume"]', 0.3);
    // Clip Gain (open the detail panel at 1280), then collapse again
    await L.selectClip(p, music.id); const was = await X.openDetail(p);
    await rangeDrag('clip-gain', '[data-testid=arrangement-detail-clip-gain-fader]', 0.2);
    if (was === 'false') { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(600); }
    // fade-in handle of the selected music clip
    await L.selectClip(p, music.id); await p.mouse.move(2, 2); await sleep(200);
    const fh = await box(`[data-clip-id="${music.id}"] [data-testid=arrangement-clip-fade-in-handle]`);
    const fl0 = await attr(`[data-clip-id="${music.id}"] [data-testid=arrangement-clip-fade-in-handle]`, 'style');
    await drag(fh.x + fh.width / 2, fh.y + fh.height / 2, 40, 0);
    r.steps.fadeIn = { style0: fl0, style1: await attr(`[data-clip-id="${music.id}"] [data-testid=arrangement-clip-fade-in-handle]`, 'style'), status: await L.status(p) };
    r.steps.fadeIn.changed = r.steps.fadeIn.style0 !== r.steps.fadeIn.style1;
    // trim left edge of sfx
    const s0 = await attr(`[data-clip-id="${sfx.id}"]`, 'data-clip-start');
    const tb = await box(`[data-clip-id="${sfx.id}"] [title="Trim — left edge"]`);
    await drag(tb.x + tb.width / 2, tb.y + tb.height * 0.7, 20, 0);
    r.steps.trim = { start0: s0, start1: await attr(`[data-clip-id="${sfx.id}"]`, 'data-clip-start'), status: await L.status(p) }; r.steps.trim.changed = r.steps.trim.start0 !== r.steps.trim.start1;
    // loop: range on music 2..4, Ctrl+L, drag end edge +40
    r.steps.range = await X.rangeDrag(p, music.id, 2, 4); r.steps.loopOn = await X.key(p, 'Control+l');
    const lt0 = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent);
    const le = await box('[data-testid=arrangement-loop-end-edge]'); await drag(le.x + le.width / 2, le.y + le.height / 2, 40, 0);
    r.steps.loopEdge = { t0: lt0, t1: await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent), status: await L.status(p) }; r.steps.loopEdge.changed = r.steps.loopEdge.t0 !== r.steps.loopEdge.t1;
    // track height
    const hs = '[data-track-id=sfx] [data-testid=arrangement-track-height]'; const h0 = await attr(hs, 'aria-valuenow'); const hb = await box(hs);
    await drag(hb.x + 150, hb.y + hb.height / 2, 0, 20);
    r.steps.height = { h0, h1: await attr(hs, 'aria-valuenow') }; r.steps.height.changed = r.steps.height.h0 !== r.steps.height.h1;
    // timeline scrollbar thumb
    const sc = () => p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const q = s.getBoundingClientRect(); return { x: q.x, bottom: q.bottom, sw: s.scrollWidth, cw: s.clientWidth, sl: s.scrollLeft, hb: s.offsetHeight - s.clientHeight }; });
    const sc0 = await sc(); const tx = sc0.x + sc0.cw * sc0.sl / sc0.sw + 20; await drag(tx, sc0.bottom - sc0.hb / 2, 100, 0);
    const sc1 = await sc(); r.steps.scrollbar = { sl0: sc0.sl, sl1: sc1.sl, hb: sc0.hb, changed: sc1.sl !== sc0.sl };
    // library resize
    const ls = '[data-testid=arrangement-library-separator]'; const w0 = await attr(ls, 'aria-valuenow'); const lb = await box(ls);
    await drag(lb.x + lb.width / 2, lb.y + lb.height / 2, 40, 0);
    r.steps.library = { w0, w1: await attr(ls, 'aria-valuenow') }; r.steps.library.changed = r.steps.library.w0 !== r.steps.library.w1;
    // group volume
    await p.click(L.nameSel('music')); await sleep(200); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(200);
    r.steps.group = await X.key(p, 'Control+g');
    await rangeDrag('group-volume', '[data-testid=arrangement-group-volume]', 0.2);
    await rangeDrag('zoom', '[data-testid=arrangement-zoom]', 0.8);
    r.steps.zoom.readout = await p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent);
    await p.keyboard.press('Home'); await sleep(200);
  } catch (e) { r.error = String(e && e.stack || e).slice(0, 1200); }
  r.net = X.netOk(net); await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(r, null, 1));
  console.log(JSON.stringify(r, null, 1));
})();
