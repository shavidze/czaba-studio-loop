// C round 154 — WEIGHT-STYLE, MONO-STYLE, NO-CLIP/OVERLAP, LANE-GHOST, MASTER-OVER, FUNC extras (M/S, group, clip gain), WEIGHT-INVENTORY (1440).
// node c154.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c154-${W}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${W}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-154/shots/${f}`; };

// In-page: tag elements of named groups with data-c154, return style records.
function probe(groups) {
  const box = (e) => { const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  const vis = (e) => { const b = e.getBoundingClientRect(); return e.getClientRects().length > 0 && b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const lines = (e) => { const r = document.createRange(); r.selectNodeContents(e); const tops = new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))); return tops.size; };
  const resolve = (spec) => { if (spec.sel) return [...document.querySelectorAll(spec.sel)]; if (spec.fn) return (0, eval)(spec.fn)(); return []; };
  const out = {};
  let n = 0;
  for (const [name, spec] of Object.entries(groups)) {
    const els = resolve(spec).filter(vis);
    out[name] = els.map((e) => { const cs = getComputedStyle(e); const id = `${name}-${n++}`; e.setAttribute('data-c154', id); return { id, text: e.textContent, cls: e.className && e.className.baseVal === undefined ? e.className : null, weight: cs.fontWeight, family: cs.fontFamily.slice(0, 60), fvn: cs.fontVariantNumeric, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor, box: box(e), sw: e.scrollWidth, cw: e.clientWidth, overflowX: e.scrollWidth > e.clientWidth, lines: lines(e) }; });
  }
  return out;
}
async function platformFonts(p) {
  const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-c154]' });
  const out = {};
  for (const id of nodeIds) {
    const { attributes } = await cdp.send('DOM.getAttributes', { nodeId: id }); const i = attributes.indexOf('data-c154'); const tag = attributes[i + 1];
    try { const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id }); out[tag] = fonts.map((f) => `${f.familyName}${f.isCustomFont ? ' [web]' : ' [local]'} ${f.glyphCount}`); } catch (e) { out[tag] = [`err ${String(e).slice(0, 80)}`]; }
  }
  await cdp.detach(); return out;
}
const untag = (p) => p.evaluate(() => { for (const e of document.querySelectorAll('[data-c154]')) e.removeAttribute('data-c154'); });
async function measure(p, groups) { await untag(p); const r = await p.evaluate(probe, groups); const pf = await platformFonts(p); for (const arr of Object.values(r)) for (const e of arr) e.pf = pf[e.id] || null; await untag(p); return r; }

const SEL = {
  h1: { sel: 'header h1, .studio-container h1' },
  h1Suffix: { sel: '.studio-container h1 > span' },
  libH2: { sel: '[data-testid=arrangement-library] h2' },
  masterMute: { sel: '[data-testid=arrangement-master] button[aria-label="Master Mute"]' },
  laneM: { fn: "() => [...document.querySelectorAll('[data-track-id] button[title=Mute]')]" },
  laneS: { fn: "() => [...document.querySelectorAll('[data-track-id] button[aria-pressed]')].filter((b) => b.textContent.trim() === 'S')" },
  groupName: { sel: '[data-testid=arrangement-group-name]' },
  groupGlyph: { sel: '[data-testid=arrangement-group-name] > span[aria-hidden=true]' },
  groupNameText: { sel: '[data-testid=arrangement-group-name] > span.truncate' },
  groupMute: { sel: '[data-testid=arrangement-group-mute]' },
  groupSolo: { sel: '[data-testid=arrangement-group-solo]' },
};
const MONO = {
  N1_libDuration: { sel: '[role=option][data-source-id] span.font-mono' },
  N1_metaFirstChild: { fn: "() => [...document.querySelectorAll('[role=option][data-source-id] > span.flex.gap-2 > span:first-child')]" },
  N1_metaRow: { fn: "() => [...document.querySelectorAll('[role=option][data-source-id] > span.flex.gap-2')]" },
  N2_playhead: { sel: '[data-testid=arrangement-library-playhead]' },
  N3_ruler: { sel: '[data-testid=arrangement-ruler] span.absolute.whitespace-nowrap' },
  N4_tempo: { sel: 'span.absolute.whitespace-nowrap.leading-none' },
  N5_gainReset: { sel: '[data-testid=arrangement-detail-clip-gain-reset]' },
  N6_ghostStart: { sel: '[data-testid=arrangement-lane-move-ghost-label] > span:first-child' },
  N6_ghostTitle: { sel: '[data-testid=arrangement-lane-move-ghost-label] > span:last-child' },
  N6_ghostLabel: { sel: '[data-testid=arrangement-lane-move-ghost-label]' },
  peak: { sel: '[data-testid=arrangement-master-peak]' },
};
const SANS = {
  zoomReadout: { sel: '[data-testid=arrangement-zoom-readout]' },
  folderCounts: { sel: '[data-testid=arrangement-library-folder] span.ml-auto' },
  fourFour: { fn: "() => [...((document.querySelector('[data-testid=arrangement-tempo-input]') || {}).parentElement || document).querySelectorAll('span')].filter((s) => s.textContent.trim() === '4/4')" },
  panReset: { sel: '[data-testid=arrangement-track-pan-reset]' },
  selects: { sel: '.studio-container select' },
  previewDuration: { sel: '[data-testid=arrangement-library-preview] > div:first-child > span' },
  previewTitle: { sel: '[data-testid=arrangement-library-preview] > div:first-child > p' },
  activeLaneRow: { sel: '[data-testid=arrangement-library-preview] p.line-clamp-2' },
  range: { sel: '[data-testid=arrangement-range]' },
  selectedClip: { sel: '[data-testid=arrangement-selected-clip]' },
};

// ruler / tempo overlap scan
function overlapScan() {
  const rows = (els) => { const by = new Map(); for (const e of els) { const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue; const k = Math.round(b.top); if (!by.has(k)) by.set(k, []); by.get(k).push({ l: b.left, r: b.right, t: e.textContent, ff: getComputedStyle(e).fontFamily.slice(0, 15) }); } const out = []; for (const [top, arr] of by) { arr.sort((a, b) => a.l - b.l); let minGap = Infinity, overl = 0, minAt = null; for (let i = 1; i < arr.length; i++) { const g = arr[i].l - arr[i - 1].r; if (g < minGap) { minGap = g; minAt = `${arr[i - 1].t}|${arr[i].t}`; } if (g < 0) overl++; } out.push({ top, n: arr.length, minGap: Number.isFinite(minGap) ? +minGap.toFixed(1) : null, minAt, overlaps: overl, first: arr[0] && arr[0].t, last: arr[arr.length - 1] && arr[arr.length - 1].t, ff: arr[0] && arr[0].ff }); } return out; };
  return { zoom: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim(), ruler: rows([...document.querySelectorAll('[data-testid=arrangement-ruler] span.absolute.whitespace-nowrap')]), tempo: rows([...document.querySelectorAll('span.absolute.whitespace-nowrap.leading-none')]), scrollLeft: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft, scrollW: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollWidth };
}

function inventory() {
  const vw = innerWidth, vh = innerHeight; const out = [];
  const sc = document.querySelector('.studio-container');
  for (const e of document.body.querySelectorAll('*')) {
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName)) continue;
    const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!(e.getClientRects().length && b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh)) continue;
    const w = +cs.fontWeight; if (w < 600) continue;
    const tid = (e.closest('[data-testid]') || { getAttribute: () => '' }).getAttribute('data-testid');
    out.push({ text: (e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 50), tag: e.tagName.toLowerCase(), id: e.id || null, family: cs.fontFamily.slice(0, 50), weight: w, inStudio: !!(sc && sc.contains(e)), nearestTestid: tid, inDialog: !!e.closest('[role=dialog]'), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] });
  }
  return out;
}
const facesLoaded = (p) => p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`).filter((v, i, a) => a.indexOf(v) === i).sort());
const facesAll = (p) => p.evaluate(() => [...document.fonts].map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.status}`).filter((v, i, a) => a.indexOf(v) === i).sort());

async function setZoomKey(p, k, times = 1) { const sl = p.locator('input[type=range][aria-label*=oom]').first(); await sl.focus(); for (let i = 0; i < times; i++) { await p.keyboard.press(k); await sleep(40); } await sleep(350); await L.blur(p); }
async function tapPeak(p, ms) { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); const pk = S.reduce((a, s) => Math.max(a, s.peak), 0); return +pk.toFixed(4); }
async function playWindow(p, t, ms) { await L.seekTo(p, t); await L.blur(p); await p.keyboard.press('Space'); await sleep(150); const pk = await tapPeak(p, ms); await p.keyboard.press('Space'); await sleep(400); return pk; }

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `c154-${W}`, net, { extraInit: X.tapInit });
    await p.mouse.move(2, 2); await sleep(300); res.fontsWait = log.fontsReady;
    if (W === 1440) await sec('invS0', async () => ({ els: await p.evaluate(inventory), facesLoaded: await facesLoaded(p) }));
    await sec('S0', async () => ({ weight: await measure(p, SEL), mono: await measure(p, MONO), sans: await measure(p, SANS), shot: await shot(p, 'c154-S0') }));
    // h1: runtime class swap back to font-semibold (round-153 rendering) for dx/dw.
    await sec('h1PrePost', () => p.evaluate(() => { const h = document.querySelector('.studio-container h1'); const s = h.querySelector('span'); const bx = (e) => { const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.width.toFixed(2)]; }; const post = { h1: bx(h), span: bx(s), text: h.textContent, w: getComputedStyle(h).fontWeight }; h.classList.replace('font-medium', 'font-semibold'); const pre = { h1: bx(h), span: bx(s), text: h.textContent, w: getComputedStyle(h).fontWeight }; h.classList.replace('font-semibold', 'font-medium'); const back = { h1: bx(h), span: bx(s) }; return { post, pre, dw: +(post.h1[1] - pre.h1[1]).toFixed(2), spanDx: +(post.span[0] - pre.span[0]).toFixed(2), restoredSame: JSON.stringify(back) === JSON.stringify({ h1: post.h1, span: post.span }) }; }));
    // active-lane row at playhead 00:00.000 and the widest text 01:41.352 (text set in DOM, reversible) + a real seek.
    await sec('activeLaneRow', async () => {
      const m = () => p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-library-preview] p.line-clamp-2'); const ph = document.querySelector('[data-testid=arrangement-library-playhead]'); const rg = document.createRange(); rg.selectNodeContents(r); const tops = new Set([...rg.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))); const b = r.getBoundingClientRect(); return { text: r.textContent, ph: ph.textContent, h: +b.height.toFixed(1), lines: tops.size, sh: r.scrollHeight, ch: r.clientHeight, phBox: [+ph.getBoundingClientRect().x.toFixed(1), +ph.getBoundingClientRect().width.toFixed(1)] }; });
      const at0 = await m();
      const sim = await p.evaluate(() => { const ph = document.querySelector('[data-testid=arrangement-library-playhead]'); const o = ph.textContent; ph.textContent = '01:41.352'; return o; });
      const atSim = await m(); await p.evaluate((o) => { document.querySelector('[data-testid=arrangement-library-playhead]').textContent = o; }, sim);
      const posReal = await L.seekTo(p, 7.3); await sleep(300); const atReal = await m(); await L.seekTo(p, 0);
      return { at0, atSim141352: atSim, realSeek: { posReal, ...atReal } };
    });
    // BPM 90, tempo labels + zoom sweep overlap scan
    await sec('bpm90', async () => { const sel = '[data-testid=arrangement-tempo-input]'; await p.click(sel, { clickCount: 3 }); await p.keyboard.type('90'); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p); return { v: await p.evaluate((s) => document.querySelector(s).value, sel), status: await L.status(p) }; });
    await sec('monoTempo', () => measure(p, { N4_tempo: MONO.N4_tempo, fourFour: SANS.fourFour }));
    await sec('zoomSweep', async () => {
      const out = [];
      await setZoomKey(p, 'Home'); out.push(await p.evaluate(overlapScan));
      for (const steps of [4, 8, 12, 16, 20, 24, 28]) { await setZoomKey(p, 'Home'); await setZoomKey(p, 'ArrowRight', steps); out.push(await p.evaluate(overlapScan)); }
      await setZoomKey(p, 'End'); out.push(await p.evaluate(overlapScan)); await shot(p, 'c154-zoom-max');
      // long timeline labels: zoom 0.5 + scroll far right
      await setZoomKey(p, 'Home'); await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); s.scrollLeft = s.scrollWidth; }); await sleep(500); out.push({ ...(await p.evaluate(overlapScan)), note: 'min zoom, scrolled to far right' });
      await shot(p, 'c154-zoom-min-right');
      // a mid zoom that shows labels >= 10:00 if possible
      for (const steps of [4, 8]) { await setZoomKey(p, 'Home'); await setZoomKey(p, 'ArrowRight', steps); await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); s.scrollLeft = s.scrollWidth; }); await sleep(500); out.push({ ...(await p.evaluate(overlapScan)), note: `steps ${steps}, scrolled far right` }); }
      await p.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft = 0; });
      await setZoomKey(p, 'Home'); // restore approx default later via reload not needed
      return out;
    });
    await sec('monoRulerFarRight', async () => { await setZoomKey(p, 'ArrowRight', 4); await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); s.scrollLeft = s.scrollWidth; }); await sleep(500); const r = await measure(p, { N3_ruler: MONO.N3_ruler, N4_tempo: MONO.N4_tempo }); const sh = await shot(p, 'c154-ruler-far-right'); await p.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft = 0; }); return { n3: r.N3_ruler.slice(-6), n4: r.N4_tempo.slice(-6), shot: sh }; });
    await sec('bpmRestore', async () => { const sel = '[data-testid=arrangement-tempo-input]'; await p.click(sel, { clickCount: 3 }); await p.keyboard.type('120'); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); return p.evaluate((s) => document.querySelector(s).value, sel); });
    // reload to a fresh default zoom state for the rest: simpler to reopen in the same context
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000); res.fontsWait2 = await L.fontsWait(p);
    await sec('snap', () => L.setSnapOff(p));
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    // FUNC: lane M/S with real output tap (0–1.5 s only the music clip sounds)
    await sec('laneMS', async () => {
      const o = {}; o.base = await playWindow(p, 0.2, 1200);
      await p.click('[data-track-id=music] button[title=Mute]'); await sleep(200); o.mutePressed = await p.getAttribute('[data-track-id=music] button[title=Mute]', 'aria-pressed'); o.muted = await playWindow(p, 0.2, 1200);
      o.undoStatus = await X.key(p, 'Control+z'); o.muteAfterUndo = await p.getAttribute('[data-track-id=music] button[title=Mute]', 'aria-pressed'); o.afterUndo = await playWindow(p, 0.2, 1200);
      const sfxS = '[data-track-id=sfx] button[aria-pressed]'; const sBtn = p.locator(sfxS).filter({ hasText: /^S$/ }); await sBtn.click(); await sleep(200); o.soloPressed = await sBtn.getAttribute('aria-pressed'); o.soloSfx = await playWindow(p, 0.2, 1200);
      o.soloUndo = await X.key(p, 'Control+z'); o.soloAfterUndo = await sBtn.getAttribute('aria-pressed'); o.afterSoloUndo = await playWindow(p, 0.2, 1200);
      return o;
    });
    // LANE-GHOST: drag sfx clip header toward stems lane, hold.
    await sec('laneGhost', async () => {
      const sfx = await H.byLane(p, 'sfx'); const a = await H.hdr(p, sfx.id); const lb = await p.locator('[data-track-id=music]').first().boundingBox();
      await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + 20, (a.y + lb.y + lb.height * 0.4) / 2, { steps: 8 }); await p.mouse.move(a.x + 40, lb.y + lb.height * 0.4, { steps: 8 }); await sleep(300);
      const m = await measure(p, { N6_ghostStart: MONO.N6_ghostStart, N6_ghostTitle: MONO.N6_ghostTitle, N6_ghostLabel: MONO.N6_ghostLabel });
      const pre = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-lane-move-ghost-label] > span:first-child'); const t = document.querySelector('[data-testid=arrangement-lane-move-ghost-label] > span:last-child'); if (!s) return null; const post = { sw: t.scrollWidth, cw: t.clientWidth, sw0: s.getBoundingClientRect().width }; s.classList.remove('font-mono'); const pr = { sw: t.scrollWidth, cw: t.clientWidth, sw0: s.getBoundingClientRect().width, text: s.textContent }; s.classList.add('font-mono'); return { post, preSans: pr }; });
      const gb = await p.locator('[data-testid=arrangement-lane-move-ghost-label]').first().boundingBox().catch(() => null);
      const sh = gb ? await shot(p, 'c154-lane-ghost', { x: Math.max(0, gb.x - 40), y: Math.max(0, gb.y - 30), width: 420, height: 90 }) : null;
      await p.mouse.up(); await sleep(500); const st = await L.status(p); const after = await H.cl(p);
      const und = await X.key(p, 'Control+z'); const back = await H.cl(p);
      return { ghost: m, truncation: pre, shot: sh, releaseStatus: st, afterRelease: H.brief(after), undo: und, afterUndo: H.brief(back) };
    });
    // group: music + stems, fold/unfold
    await sec('group', async () => {
      await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
      const st = await X.key(p, 'Control+g'); const m = await measure(p, { groupName: SEL.groupName, groupGlyph: SEL.groupGlyph, groupNameText: SEL.groupNameText, groupMute: SEL.groupMute, groupSolo: SEL.groupSolo });
      const sh = await shot(p, 'c154-group'); const fold = p.locator('[data-testid=arrangement-group-fold]').first();
      const f0 = await fold.getAttribute('aria-expanded'); await fold.click(); await sleep(400); const f1 = await fold.getAttribute('aria-expanded'); const rowsFolded = await p.locator('[data-track-id=music]').count(); await fold.click(); await sleep(400); const f2 = await fold.getAttribute('aria-expanded'); await L.blur(p);
      return { status: st, m, shot: sh, fold: [f0, f1, f2], musicRowsWhileFolded: rowsFolded };
    });
    // detail panel: clip gain change + reset; N5 style
    await sec('clipGain', async () => {
      const sfx = await H.byLane(p, 'sfx'); await L.selectClip(p, sfx.id); if (W === 1280) await X.openDetail(p);
      const cg = '[data-testid=arrangement-detail-clip-gain-input]'; await p.click(cg, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type('6'); await p.keyboard.press('Enter'); await sleep(400);
      const v1 = await p.evaluate((s) => document.querySelector(s).value, cg); await L.blur(p);
      const m = await measure(p, { N5_gainReset: MONO.N5_gainReset, range: SANS.range, selectedClip: SANS.selectedClip });
      await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(400); const v2 = await p.evaluate((s) => document.querySelector(s).value, cg);
      const rb = await p.locator('[data-testid=arrangement-detail-clip-gain-reset]').boundingBox(); const sh = await shot(p, 'c154-gain-reset', { x: Math.max(0, rb.x - 200), y: rb.y - 20, width: 360, height: 64 });
      return { v1, v2, m, shot: sh, status: await L.status(p) };
    });
    await sec('S1', async () => ({ weight: await measure(p, SEL), mono: await measure(p, MONO), sans: await measure(p, SANS), shot: await shot(p, 'c154-S1') }));
    if (W === 1440) await sec('invS1', async () => ({ els: await p.evaluate(inventory) }));
    // MASTER-OVER: hero music (0–150 s) and Soft impact (4–6 s) overlap at 4 s; master volume max; play from 3.8.
    await sec('masterOver', async () => {
      const o = { attempts: [] }; const MV = '[data-testid=arrangement-master] input[type=range]';
      await p.focus(MV); await p.keyboard.press('End'); await sleep(200); o.masterReadout = await p.evaluate(() => document.querySelector('[data-testid=arrangement-master-readout]').textContent); await L.blur(p);
      for (let i = 0; i < 2; i++) {
        await L.seekTo(p, 3.8); await L.blur(p); await p.keyboard.press('Space'); await sleep(2600);
        const during = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-master-peak]'); return { state: e.dataset.state, text: e.textContent }; });
        await p.keyboard.press('Space'); await sleep(500);
        o.attempts.push(during); if (during.state === 'over') break;
      }
      await p.mouse.move(2, 2); await sleep(200);
      o.after = await measure(p, { peak: MONO.peak });
      const bb = await p.locator('[data-testid=arrangement-master]').boundingBox(); o.shot = await shot(p, 'c154-master-over', { x: bb.x, y: bb.y - 4, width: bb.width, height: bb.height + 8 });
      o.tokens = await p.evaluate(() => { const d = document.createElement('span'); d.className = 'text-destructive border-destructive bg-destructive/15'; document.body.appendChild(d); const cs = getComputedStyle(d); const r = { color: cs.color, border: cs.borderTopColor, bg: cs.backgroundColor }; d.remove(); return r; });
      return o;
    });
    if (W === 1440) {
      await sec('invMenus', async () => {
        const o = {};
        await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
        const mk = p.locator('[data-testid=arrangement-marker]').first(); const mb = await mk.boundingBox(); await p.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2, { button: 'right' }); await sleep(500);
        o.markerMenuOpen = await p.locator('[data-testid=arrangement-marker-menu]').count(); o.markerMenu = await p.evaluate(inventory); o.markerShot = await shot(p, 'c154-inv-marker-menu'); await p.keyboard.press('Escape'); await sleep(300);
        const lb = await p.locator('[data-track-id=sfx]').first().boundingBox(); await p.mouse.click(lb.x + lb.width - 60, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
        o.gridMenuOpen = await p.locator('[data-testid=arrangement-grid-menu]').count(); o.gridMenu = await p.evaluate(inventory); o.gridShot = await shot(p, 'c154-inv-grid-menu'); await p.keyboard.press('Escape'); await sleep(300);
        await X.openDlg(p); await sleep(400); o.exportDialog = await p.evaluate(inventory); o.exportShot = await shot(p, 'c154-inv-export'); await p.keyboard.press('Escape'); await sleep(400);
        o.facesLoaded = await facesLoaded(p); o.facesAll = await facesAll(p);
        return o;
      });
    }
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontNet = net.map((n) => ({ css2: n.fontResp.filter((r) => /css2/.test(r.u)), n: n.fontResp.length, non200: n.fontResp.filter((r) => r.s !== 200), fail: n.fontFail }));
  save(); console.log(JSON.stringify({ vp: W, errors: res.errors, net: res.net }, null, 1)); await b.close();
})();
