// C round 146 — PLAY-MARKER, LAYOUT-LIB, LAYOUT-REST, LIB-ROW-TEXT-SMOKE, PX-NET/REG-HYD. node c146.cjs <1440|1280>
// measure() reproduces c-round-145/tools/c145.cjs (b-round-144 libbase fn) with ONE relocation:
// the meta row is the option's span child that is NOT [data-testid=arrangement-library-option-previewing];
// the marker is recorded as opt:<id>:marker (round 145 named it opt:<id>:meta2, third meta child).
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, startedUtc: new Date().toISOString(), states: {}, rest: {}, checks: [], m: {}, invalidRuns: [] };
const file = path.join(L.OUT, `c146-${W}.json`);
const save = () => fs.writeFileSync(file, JSON.stringify({ ...out, net }, null, 1));
const chk = (row, id, ok, v) => { out.checks.push({ row, id, ok: !!ok, v }); console.log(ok ? 'ok  ' : 'FAIL', row, id, JSON.stringify(v).slice(0, 260)); save(); };
const MK = '[data-testid=arrangement-library-option-previewing]';
const TOGGLE = '[data-testid=arrangement-library-preview-toggle]';

const measure = (p) => p.evaluate((MK) => {
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); const ys = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return ys.size; };
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const q = (s) => [...lib.querySelectorAll(s)];
  const nodes = {};
  const put = (k, el) => { if (el && el.getClientRects().length) nodes[k] = { box: b(el), lines: lines(el), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) }; };
  put('library', lib);
  for (const t of ['arrangement-library-search', 'arrangement-library-filter', 'arrangement-library-notice', 'arrangement-library-tree', 'arrangement-library-list', 'arrangement-library-empty']) put(t, lib.querySelector(`[data-testid=${t}]`));
  const nav = lib.querySelector('[data-testid=arrangement-library-tree]');
  if (nav) {
    put('tree-all', nav.querySelector(':scope > button'));
    [...nav.querySelectorAll(':scope > div')].forEach((col, i) => {
      put(`tree-col${i}-toggle`, col.querySelector('button[aria-expanded]'));
      put(`tree-col${i}-label`, col.querySelector('button[title]'));
      [...col.querySelectorAll('[data-testid=arrangement-library-folder]')].forEach((f, j) => put(`tree-col${i}-folder${j}`, f));
    });
  }
  for (const o of q('[role=option][data-source-id]')) {
    const id = o.dataset.sourceId; put(`opt:${id}`, o);
    const meta = [...o.querySelectorAll(':scope > span')].filter((s) => !s.matches(MK)).pop();
    if (meta) { put(`opt:${id}:meta`, meta); [...meta.querySelectorAll(':scope > span')].forEach((s, k) => put(`opt:${id}:meta${k}`, s)); }
    put(`opt:${id}:marker`, o.querySelector(`:scope > ${MK}`));
    put(`opt:${id}:context`, o.querySelector('[data-testid=arrangement-library-option-context]'));
  }
  const prev = document.querySelector('[aria-label="პრევიუ"]') || null; if (prev) put('preview', prev);
  const st = document.querySelector('[data-testid=arrangement-status]');
  return { nodes, status: st ? st.textContent.trim() : null, scrollH: nav ? [nav.scrollHeight, nav.clientHeight] : null, markersAnywhere: document.querySelectorAll(MK).length };
}, MK);

const measureRest = (p) => p.evaluate(() => {
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const res = {}; const seen = {};
  for (const el of document.querySelectorAll('[data-testid],[data-track-id],button[aria-label]')) {
    if (lib && lib.contains(el)) continue;
    if (!el.getClientRects().length) continue;
    const base = el.dataset.testid || (el.dataset.trackId ? `track:${el.dataset.trackId}` : `btn:${el.getAttribute('aria-label').slice(0, 40)}`);
    const n = (seen[base] = (seen[base] || 0) + 1);
    res[n > 1 ? `${base}#${n}` : base] = b(el);
  }
  return res;
});

// overflow / clipping / scroll widths (round-145 overflow145 probe + per-option scrollWidth)
const probe = (p) => p.evaluate(() => {
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const over = [];
  for (const el of lib.querySelectorAll('*')) {
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    const clipsX = el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible';
    const clipsY = el.scrollHeight > el.clientHeight + 1 && cs.overflowY !== 'visible' && !['auto', 'scroll'].includes(cs.overflowY);
    if ((clipsX || clipsY) && el.children.length === 0) over.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), text: el.textContent.trim().slice(0, 60), sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight, ox: cs.overflowX, to: cs.textOverflow });
  }
  const scrollers = ['arrangement-library-tree', 'arrangement-library-list'].map((t) => { const e = lib.querySelector(`[data-testid=${t}]`); return { t, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight }; });
  const options = [...lib.querySelectorAll('[role=option][data-source-id]')].filter((o) => o.getClientRects().length).map((o) => ({ id: o.dataset.sourceId, sw: o.scrollWidth, cw: o.clientWidth }));
  // clipped row text: any text node of an option whose Range rect leaves the option or the list box
  const list = lib.querySelector('[data-testid=arrangement-library-list]').getBoundingClientRect();
  const clippedText = [];
  for (const o of lib.querySelectorAll('[role=option][data-source-id]')) {
    const ob = o.getBoundingClientRect();
    const tw = document.createTreeWalker(o, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const rr of r.getClientRects()) { if (rr.right > ob.right + 0.5 || rr.left < ob.left - 0.5 || rr.right > list.right + 0.5) clippedText.push({ id: o.dataset.sourceId, text: n.textContent.slice(0, 40), l: rr.left, r: rr.right, ol: ob.left, or: ob.right, lr: list.right }); } }
  }
  const doc = { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  return { over, scrollers, options, clippedText, doc };
});
const lastVisible = (p) => p.evaluate(() => {
  const out = {};
  for (const t of ['arrangement-library-tree', 'arrangement-library-list']) {
    const e = document.querySelector(`[data-testid=${t}]`);
    e.scrollTop = e.scrollHeight;
    const items = t.endsWith('list') ? [...e.querySelectorAll('[role=option]')] : [...e.querySelectorAll('button')];
    const last = items[items.length - 1]; const r = last.getBoundingClientRect(); const c = e.getBoundingClientRect();
    out[t] = { last: last.textContent.trim().slice(0, 40), inside: r.top >= c.top - 1 && r.bottom <= c.bottom + 1, r: [r.top, r.bottom], c: [c.top, c.bottom], scrollTop: e.scrollTop };
    e.scrollTop = 0;
  }
  return out;
});

// PLAY-MARKER (a) geometry + hit test for one source row
const markerGeo = (p, sid) => p.evaluate(({ sid, MK }) => {
  const o = document.querySelector(`[role=option][data-source-id="${sid}"]`);
  const m = o && o.querySelector(MK);
  if (!m) return null;
  const ob = o.getBoundingClientRect(); const mb = m.getBoundingClientRect();
  const r = document.createRange(); r.selectNodeContents(m);
  const rects = [...r.getClientRects()]; const g = r.getBoundingClientRect();
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e ? { same: e === m || m.contains(e), tag: e.tagName, tid: e.dataset ? e.dataset.testid : null, text: (e.textContent || '').slice(0, 30) } : null; };
  const cy = g.top + g.height / 2;
  const meta = [...o.querySelectorAll(':scope > span')].filter((s) => s !== m).pop();
  return {
    text: m.textContent, parentIsOption: m.parentElement === o, isLast: o.lastElementChild === m, cls: m.className,
    option: [ob.x, ob.y, ob.width, ob.height], marker: [mb.x, mb.y, mb.width, mb.height], glyph: [g.left, g.top, g.width, g.height], glyphRight: g.right, glyphRects: rects.length,
    metaBox: meta ? (() => { const x = meta.getBoundingClientRect(); return [x.x, x.y, x.width, x.height]; })() : null,
    hitCentre: hit(g.left + g.width / 2, cy), hitRightEnd: hit(g.right - 2, cy), hitBoxCentre: hit(mb.x + mb.width / 2, mb.y + mb.height / 2),
    color: getComputedStyle(m).color, ws: getComputedStyle(m).whiteSpace, sel: o.getAttribute('aria-selected'),
  };
}, { sid, MK });
const markerRows = (p) => p.evaluate((MK) => [...document.querySelectorAll(MK)].map((m) => { const o = m.closest('[role=option]'); return o ? o.dataset.sourceId : '(none)'; }), MK);
const waveNow = (p) => p.evaluate(() => { const w = document.querySelector('[data-testid=arrangement-library-preview-wave]'); return { t: performance.now(), now: w ? Number(w.getAttribute('aria-valuenow')) : NaN, cbs: window.__h.cbs, toggle: (document.querySelector('[data-testid=arrangement-library-preview-toggle]') || {}).textContent }; });
const optBox = (p, sid) => p.evaluate((sid) => { const o = document.querySelector(`[role=option][data-source-id="${sid}"]`); const r = o.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); }, sid);

async function startPreview(p, sid) {
  await p.click(`[role=option][data-source-id="${sid}"]`); await L.sleep(300);
  const s0 = await waveNow(p);
  await p.click(TOGGLE);
  const samples = [s0];
  for (let i = 0; i < 8; i++) { await L.sleep(200); samples.push(await waveNow(p)); }
  return samples;
}
const markerOk = (g) => g && g.text === '▶ Playing' && g.parentIsOption && g.isLast
  && g.marker[0] >= g.option[0] + 8 - 1 && g.marker[0] + g.marker[2] <= g.option[0] + 126 - 8 + 1
  && g.glyph[0] >= g.option[0] + 8 - 1 && g.glyphRight <= g.option[0] + 126 - 8 + 1
  && Math.abs(g.marker[3] - 16) <= 1 && g.glyphRects === 1 && g.hitCentre && g.hitCentre.same && g.hitRightEnd && g.hitRightEnd.same;

(async () => {
  const b = await L.launch();
  // ---------- Context A: ready -> previewing (Soft impact) -> marker click -> stop -> Slow rise ----------
  let O = await L.openStudio(b, VP, `c146-${W}-ready`, net);
  const p = O.page;
  out.snapAtStart = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.snapAfter = await L.setSnapOff(p);
  out.states.ready = await measure(p); out.rest.ready = await measureRest(p);
  out.probe = { ready: await probe(p) };
  await p.screenshot({ path: path.join(L.SHOTS, `ready-${W}.png`) });
  chk('LAYOUT-LIB', 'ready-no-marker', out.states.ready.markersAnywhere === 0, out.states.ready.markersAnywhere);
  const readyOpt = await optBox(p, 'demo-soft-impact');

  // Soft impact is a 2.000 s source: measure first (fast), screenshots, then stop while still playing.
  await p.click('[role=option][data-source-id=demo-soft-impact]'); await L.sleep(300);
  const s0 = await waveNow(p);
  await p.click(TOGGLE); const tStart = Date.now();
  await L.sleep(250);
  out.states.previewing = await measure(p); out.rest.previewing = await measureRest(p);
  out.probe.previewing = await probe(p);
  const g = await markerGeo(p, 'demo-soft-impact');
  out.m.markerSoft = g;
  await p.locator(MK).screenshot({ path: path.join(L.SHOTS, `marker-${W}.png`) });
  await p.locator('[role=option][data-source-id=demo-soft-impact]').screenshot({ path: path.join(L.SHOTS, `row-playing-${W}.png`) });
  await p.locator('[data-testid=arrangement-library]').screenshot({ path: path.join(L.SHOTS, `lib-previewing-${W}.png`) });
  const pv = [s0, await waveNow(p)];
  out.m.msAtFirstSample = Date.now() - tStart;
  for (let i = 0; i < 3; i++) { await L.sleep(150); pv.push(await waveNow(p)); }
  out.m.previewSamples = pv;
  chk('PLAY-MARKER', 'a-marker-full-on-screen', markerOk(g), g);
  const adv = pv.find((s, i) => i > 0 && s.now > 0);
  const cbs = pv[pv.length - 1].cbs - pv[0].cbs;
  out.m.audio = await p.evaluate(() => window.__h.ctxs.map((c) => ({ state: c.state, t: c.currentTime, sr: c.sampleRate })));
  chk('PLAY-MARKER', 'b-real-playback', adv && adv.t - pv[0].t <= 1500 + 400 && cbs >= 1 && out.m.audio.some((a) => a.state === 'running'), { s0: pv[0], adv, cbs, audio: out.m.audio, note: 's0 taken before the toggle click; +400 ms covers the click itself' });
  // (c) stop while playing
  const playingBeforeStop = { markers: await markerRows(p), toggle: (await waveNow(p)).toggle, ms: Date.now() - tStart };
  await p.click(TOGGLE); await L.sleep(400);
  const afterStop = { markers: await markerRows(p), opt: await optBox(p, 'demo-soft-impact'), toggle: (await waveNow(p)).toggle };
  out.m.afterStop = { ...afterStop, readyOpt, playingBeforeStop };
  const dd = afterStop.opt.map((v, i) => Math.abs(v - readyOpt[i]));
  chk('PLAY-MARKER', 'c-stop-marker-gone-ready-box', playingBeforeStop.markers.length === 1 && playingBeforeStop.ms < 1900 && afterStop.markers.length === 0 && Math.max(...dd) <= 1, out.m.afterStop);
  out.probe.afterStop = await probe(p);
  out.scrollLast = await lastVisible(p);
  // (d) second source (Slow rise, 5 s)
  const pv2 = await startPreview(p, 'demo-slow-rise');
  const rows2 = await markerRows(p);
  const g2pre = await markerGeo(p, 'demo-slow-rise');
  const listScroll0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library-list]').scrollTop);
  await p.locator(MK).scrollIntoViewIfNeeded();
  const g2 = await markerGeo(p, 'demo-slow-rise');
  const listScroll1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library-list]').scrollTop);
  out.m.slowRise = { rows: rows2, gBeforeScroll: g2pre, g: g2, listScroll: [listScroll0, listScroll1], samples: pv2 };
  await p.locator('[role=option][data-source-id=demo-slow-rise]').screenshot({ path: path.join(L.SHOTS, `row-playing-slowrise-${W}.png`) });
  const adv2 = pv2.find((s) => s.now > pv2[1].now);
  chk('PLAY-MARKER', 'd-second-source', JSON.stringify(rows2) === '["demo-slow-rise"]' && markerOk(g2) && !!adv2, { rows2, g2ok: markerOk(g2), adv2 });
  // neighbour: click the marker itself while Slow rise plays (~1.8 s into a 5 s preview)
  const before = { markers: await markerRows(p), wave: await waveNow(p) };
  await p.locator(MK).click(); await L.sleep(350);
  const afterClick = await p.evaluate((MK) => { const o = document.querySelector('[role=option][data-source-id=demo-slow-rise]'); return { sel: o.getAttribute('aria-selected'), markers: [...document.querySelectorAll(MK)].map((m) => m.closest('[role=option]').dataset.sourceId), clips: document.querySelectorAll('[data-clip-id]').length, toggle: (document.querySelector('[data-testid=arrangement-library-preview-toggle]') || {}).textContent, wave: Number((document.querySelector('[data-testid=arrangement-library-preview-wave]') || { getAttribute: () => NaN }).getAttribute('aria-valuenow')) }; }, MK);
  // control: click the option title (not the marker) while playing, in a fresh preview
  if (afterClick.markers.length) { await p.click(TOGGLE); await L.sleep(300); }
  await p.click(TOGGLE); await L.sleep(500);
  const ctlBefore = await markerRows(p);
  const tb = await p.locator('[role=option][data-source-id=demo-slow-rise]').boundingBox();
  await p.mouse.click(tb.x + 20, tb.y + 10); await L.sleep(350);
  const ctlAfter = await p.evaluate((MK) => ({ sel: document.querySelector('[role=option][data-source-id=demo-slow-rise]').getAttribute('aria-selected'), markers: [...document.querySelectorAll(MK)].map((m) => m.closest('[role=option]').dataset.sourceId) }), MK);
  out.m.markerClick = { before, afterClick, control_titleClick: { ctlBefore, ctlAfter } };
  chk('NEIGHBOUR', 'click-marker-keeps-selected', before.markers.length === 1 && afterClick.sel === 'true' && afterClick.clips === 0 && JSON.stringify(afterClick.markers) === JSON.stringify(ctlAfter.markers), out.m.markerClick);
  if ((await markerRows(p)).length) { await p.click(TOGGLE); await L.sleep(300); }
  // switch while playing: start Slow rise, then select + play Soft impact
  await p.click(TOGGLE); await L.sleep(400);
  await p.click('[role=option][data-source-id=demo-soft-impact]'); await L.sleep(300);
  out.m.afterSelectOther = await markerRows(p);
  if ((await markerRows(p)).length) { await p.click(TOGGLE).catch(() => {}); await L.sleep(300); }
  await O.ctx.close(); save();

  // ---------- Context B: error (abort) ----------
  O = await L.openCtx(b, VP, `c146-${W}-error`, net);
  await O.page.route('**/middle-east.mp3', (r) => r.abort());
  await O.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await O.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  for (let i = 0; i < 240; i++) { const n = await O.page.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')]; return o.length === 0 ? -1 : o.filter((x) => /Loading…|იტვირთება…/.test(x.textContent)).length; }); if (n === 0) break; await L.sleep(250); }
  await L.sleep(800);
  await O.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
  await L.setSnapOff(O.page);
  out.states.error = await measure(O.page); out.rest.error = await measureRest(O.page);
  out.probe.error = await probe(O.page);
  out.errorScrollLast = await lastVisible(O.page);
  await O.page.screenshot({ path: path.join(L.SHOTS, `error-${W}.png`) });
  await O.page.locator('[role=option][data-source-id=demo-middle-east]').screenshot({ path: path.join(L.SHOTS, `row-error-${W}.png`) });
  const em = await O.page.evaluate((MK) => { const o = document.querySelector('[role=option][data-source-id=demo-middle-east]'); const meta = [...o.querySelectorAll(':scope > span')].filter((s) => !s.matches(MK)).pop(); return { meta: [...meta.querySelectorAll(':scope > span')].map((s) => s.textContent), markersAnywhere: document.querySelectorAll(MK).length }; }, MK);
  out.m.errorMeta = em;
  chk('LIB-ROW-TEXT-SMOKE', 'abort-meta-no-marker', em.meta[0] === 'Music' && em.meta[1] === 'Error: File failed to load (network)' && em.markersAnywhere === 0, em);
  await O.ctx.close();
  await b.close();
  out.endedUtc = new Date().toISOString(); save();
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors.length, n.forbidden.length, n.authHeaders.length, n.hydration.length, n.noise])));
})().catch((e) => { out.fatal = String(e && e.stack || e); save(); console.error(e); process.exit(1); });
