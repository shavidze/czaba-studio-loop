// C round 156 — V-2b-3a sentence timecodes: TEXT-BYTES (a)-(f), MONO-STYLE N7-N12, LAYOUT-FIT, PLEX500-INVENTORY-S (1440), FUNC-SMOKE-S. node c156.cjs <1440|1280> [label] [videoFile]
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const nos = (x) => x.replace(/\*/g, ''); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c156-${W}`; const VIDEO_FILE = process.argv[4] || 'clip-4s-vp9-opus.webm'; const net = [];
const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [], plexScan: {} };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-156/shots/${f}`; };
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


const GHOST = {
  N6_ghostStart: { sel: '[data-testid=arrangement-lane-move-ghost-label] > span:first-child' },
  N6_ghostTitle: { sel: '[data-testid=arrangement-lane-move-ghost-label] > span:last-child' },
  N6_ghostLabel: { sel: '[data-testid=arrangement-lane-move-ghost-label]' },
};
const PLEX = { plex500: { fn: "() => [...document.body.querySelectorAll('*')].filter((e) => { const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName)) return false; const cs = getComputedStyle(e); return /^\"?IBM Plex Mono/.test(cs.fontFamily) && +cs.fontWeight >= 500; })" } };
async function plexScan(p, state) {
  const r = await measure(p, PLEX); const n = await p.evaluate(() => [...document.body.querySelectorAll('*')].filter((e) => { const own = [...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()); if (!own) return false; const b = e.getBoundingClientRect(); return b.width > 0 && /^"?IBM Plex Mono/.test(getComputedStyle(e).fontFamily); }).map((e) => getComputedStyle(e).fontWeight));
  const weights = n.reduce((a, w) => { a[w] = (a[w] || 0) + 1; return a; }, {});
  res.plexScan[state] = { plex500plus: r.plex500.map((e) => ({ text: e.text.slice(0, 40), weight: e.weight, pf: e.pf, cls: e.cls })), plexVisibleWeights: weights }; save();
  return res.plexScan[state];
}
const laneBox = async (p, lane) => p.locator(`[data-track-id=${lane}]`).first().boundingBox();
async function ghostHold(p, srcLane, dstLane, name) {
  const c = await H.byLane(p, srcLane); const a = await H.hdr(p, c.id); const lb = await laneBox(p, dstLane);
  await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + 20, (a.y + lb.y + lb.height * 0.4) / 2, { steps: 8 }); await p.mouse.move(a.x + 40, lb.y + lb.height * 0.4, { steps: 8 }); await sleep(400);
  const m = await measure(p, GHOST);
  const fit = await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-lane-move-ghost]'); const s = document.querySelector('[data-testid=arrangement-lane-move-ghost-label] > span:first-child'); const t = document.querySelector('[data-testid=arrangement-lane-move-ghost-label] > span:last-child'); if (!s) return null; return { startW: +s.getBoundingClientRect().width.toFixed(2), titleCw: t.clientWidth, titleSw: t.scrollWidth, titleVisible: t.clientWidth >= t.scrollWidth, ghostW: +g.getBoundingClientRect().width.toFixed(1), blocked: g.dataset.blocked, ghostStart: g.dataset.ghostStart, lane: (g.closest('[data-track-id]') || {}).dataset?.trackId }; });
  let scan = null; if (W === 1440) scan = await plexScan(p, `laneGhost-${name}`);
  const gb = await p.locator('[data-testid=arrangement-lane-move-ghost-label]').first().boundingBox().catch(() => null);
  const sh = gb ? await shot(p, `c155-ghost-${name}`, { x: Math.max(0, gb.x - 40), y: Math.max(0, gb.y - 30), width: 420, height: 90 }) : null;
  await p.mouse.up(); await sleep(500); const st = await L.status(p); const after = H.brief(await H.cl(p));
  const und = await X.key(p, 'Control+z'); const back = H.brief(await H.cl(p));
  return { ghost: m, fit, scan, shot: sh, releaseStatus: st, afterRelease: after, undo: und, afterUndo: back };
}
async function libDropHold(p, src, lane, t, name) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane); const x = await X.tx(p, t);
  const before = H.brief(await H.cl(p));
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down(); await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(x, lb.y + lb.height / 2, { steps: 14 }); await sleep(400);
  const ghost = await measure(p, { dropGhost: { sel: '[data-testid=arrangement-drop-ghost]' }, dropGhostKids: { sel: '[data-testid=arrangement-drop-ghost] *' } });
  const gattr = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((g) => ({ text: g.textContent.trim(), blocked: g.getAttribute('data-blocked'), lane: (g.closest('[data-track-id]') || {}).dataset?.trackId })));
  let scan = null; if (W === 1440) scan = await plexScan(p, `dropGhost-${name}`);
  const gb = await p.locator('[data-testid=arrangement-drop-ghost]').first().boundingBox().catch(() => null);
  const sh = gb ? await shot(p, `c155-dropghost-${name}`, { x: Math.max(0, gb.x - 40), y: Math.max(0, gb.y - 30), width: 460, height: 100 }) : null;
  await p.mouse.up(); await sleep(900); const st = await L.status(p); const after = H.brief(await H.cl(p));
  const und = await X.key(p, 'Control+z'); const back = H.brief(await H.cl(p));
  return { ghostShown: gattr.length > 0, gattr, ghost, scan, shot: sh, before, releaseStatus: st, afterDrop: after, added: after !== before, undo: und, afterUndo: back, undoRestored: nos(back) === nos(before) };
}
async function tapPeak(p, ms) { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); const pk = S.reduce((a, s) => Math.max(a, s.peak), 0); return +pk.toFixed(4); }
async function playWindow(p, t, ms) { await L.seekTo(p, t); await L.blur(p); await p.keyboard.press('Space'); await sleep(150); const pk = await tapPeak(p, ms); await p.keyboard.press('Space'); await sleep(400); return pk; }

const MONOCLS = 'font-mono font-normal tabular-nums';
const EM = '—', EN = '–';
// In-page: tag a site root + its mono spans + its parent sans container; return records, byte text, fit and a sans-clone width.
function siteProbe({ sel, pick }) {
  const roots = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
  const root = pick ? (0, eval)(pick)(roots) : roots[0];
  if (!root) return null;
  const MONO = 'font-mono font-normal tabular-nums';
  const st = (e) => { const cs = getComputedStyle(e); return { family: cs.fontFamily.slice(0, 40), weight: cs.fontWeight, fvn: cs.fontVariantNumeric }; };
  const lines = (e) => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };
  const monos = [...root.querySelectorAll('span')].filter((s) => s.className === MONO);
  const otherWithMono = [...root.querySelectorAll('*')].filter((s) => s.className && typeof s.className === 'string' && /font-mono/.test(s.className) && s.className !== MONO).map((s) => s.className);
  root.setAttribute('data-c154', 'root');
  monos.forEach((m, i) => m.setAttribute('data-c154', `mono${i}`));
  // clip ancestor
  let a = root.parentElement, clipAnc = null;
  while (a && a !== document.body) { const cs = getComputedStyle(a); if (/hidden|clip|auto|scroll/.test(cs.overflowX)) { clipAnc = a; break; } a = a.parentElement; }
  const rb = root.getBoundingClientRect(); const cb = clipAnc ? clipAnc.getBoundingClientRect() : null;
  const visW = cb ? Math.max(0, Math.min(rb.right, cb.right) - Math.max(rb.left, cb.left)) : rb.width;
  // sans clone width: same container, mono class stripped
  const clone = root.cloneNode(true); clone.removeAttribute('data-c154'); clone.querySelectorAll('[data-c154]').forEach((x) => x.removeAttribute('data-c154'));
  clone.querySelectorAll('span').forEach((s) => { if (s.className === MONO) s.className = ''; });
  clone.style.position = 'absolute'; clone.style.visibility = 'hidden'; clone.style.left = '0'; clone.style.top = '0'; clone.style.width = 'max-content'; clone.style.maxWidth = 'none';
  root.parentElement.appendChild(clone); const sansW = clone.getBoundingClientRect().width; clone.remove();
  const cl2 = root.cloneNode(true); cl2.removeAttribute('data-c154'); cl2.querySelectorAll('[data-c154]').forEach((x) => x.removeAttribute('data-c154')); cl2.style.position = 'absolute'; cl2.style.visibility = 'hidden'; cl2.style.width = 'max-content'; cl2.style.maxWidth = 'none'; root.parentElement.appendChild(cl2); const monoW = cl2.getBoundingClientRect().width; cl2.remove();
  const textNodesParent = st(root);
  return {
    text: root.textContent, title: root.getAttribute('title'), cls: root.className,
    rootStyle: textNodesParent,
    monos: monos.map((m, i) => ({ id: `mono${i}`, text: m.textContent, ...st(m), w: +m.getBoundingClientRect().width.toFixed(2) })),
    otherMonoClasses: otherWithMono,
    fit: { cw: root.clientWidth, sw: root.scrollWidth, lines: lines(root), box: [rb.x, rb.y, rb.width, rb.height].map((v) => +v.toFixed(1)), clipAncestor: clipAnc ? { tid: clipAnc.getAttribute('data-testid'), cls: String(clipAnc.className).slice(0, 80), box: [cb.x, cb.y, cb.width, cb.height].map((v) => +v.toFixed(1)) } : null, visibleW: +visW.toFixed(1), fullyVisible: visW + 0.5 >= rb.width && root.scrollWidth <= root.clientWidth + 0, naturalMonoW: +monoW.toFixed(1), naturalSansW: +sansW.toFixed(1) },
  };
}
async function site(p, name, spec, expected) {
  await untag(p);
  const r = await p.evaluate(siteProbe, spec);
  if (!r) return { name, present: false };
  const pf = await platformFonts(p); await untag(p);
  r.pf = pf; r.name = name; r.present = true;
  if (expected) { r.expected = expected.text; r.bytesEqual = expected.prefix ? r.text.startsWith(expected.text) : r.text === expected.text; r.mode = expected.prefix ? 'prefix' : 'equal'; r.expectedMonos = expected.monos; r.monosOk = JSON.stringify(r.monos.map((m) => m.text)) === JSON.stringify(expected.monos); }
  r.monoStyleOk = r.monos.every((m) => /^"?IBM Plex Mono/.test(m.family) && m.weight === '400' && m.fvn === 'tabular-nums' && (pf[m.id] || []).length && (pf[m.id] || []).every((f) => /^IBM Plex Mono \[web\]/.test(f)));
  return r;
}
const T = (s) => { const t = Math.round(s * 1000); const m = Math.floor(t / 60000); const sec = Math.floor((t % 60000) / 1000); const ms = t % 1000; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`; };
async function holdLib(p, src, lane, t) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane); const x = await X.tx(p, t);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down(); await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(x, lb.y + lb.height / 2, { steps: 14 }); await sleep(450);
}
const ghostSpec = { sel: '[data-testid=arrangement-drop-ghost] > span' };
const footerRange = { sel: '[data-testid=arrangement-range]' };
const footerSel = { sel: '[data-testid=arrangement-selected-clip]' };
const laneLabel = { sel: '[data-testid=arrangement-lane-range] > span' };
const clipBadge = { sel: '[data-clip-id] span.whitespace-nowrap.rounded-br-sm' };
const videoGap = { sel: '[data-testid=arrangement-video-gap]' };

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], LBL, net, { extraInit: X.tapInit });
    await p.mouse.move(2, 2); await sleep(300); res.fontsWait = log.fontsReady;
    if (W === 1440) await sec('invS0', async () => ({ els: await p.evaluate(inventory), facesLoaded: await facesLoaded(p), plex: await plexScan(p, 'S0') }));
    await sec('snap', () => L.setSnapOff(p));
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    await sec('table0', async () => H.brief(await H.cl(p)));
    await sec('play2s', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const ph0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(2000); await p.keyboard.press('Space'); const S = await p.evaluate(() => window.__tapStop()); await sleep(400);
      return { ph0, ph1: await L.posNow(p), peak: +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4), nTap: S.length };
    });
    // (a)+(e): body drag on hero 3 -> 5 creates a range inside the clip
    await sec('rangeBody', async () => {
      const hero = await H.byLane(p, 'music'); res.heroId = hero.id;
      const st = await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); await sleep(250);
      const det = await H.range(p);
      const a = await site(p, 'a-range', footerRange, { prefix: true, text: `Time selection: ${T(3)} ${EM} ${T(5)} · length ${T(2)} · `, monos: [T(3), T(5), T(2)] });
      const e = await site(p, 'e-badge', clipBadge, { text: `${T(3)} ${EN} ${T(5)} · 2.000 s`, monos: [T(3), T(5)] });
      const hint = await p.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-delete-hint]'); const cs = getComputedStyle(h); return { cls: h.className, family: cs.fontFamily.slice(0, 30), weight: cs.fontWeight, box: h.getBoundingClientRect().toJSON() }; });
      let scan = null; if (W === 1440) scan = await plexScan(p, 'a-e-range');
      const sh = await shot(p, 'c156-range-body');
      return { status: st, det, a, e, hint, scan, shot: sh };
    });
    // (d): Ctrl+Shift+L spreads range to all tracks
    await sec('allTracks', async () => {
      const st = await X.key(p, 'Control+Shift+L'); await sleep(200);
      const d = await site(p, 'd-laneLabel', laneLabel, { text: `${T(3)} ${EN} ${T(5)} · 2.000 s · all tracks`, monos: [T(3), T(5)] });
      const laneOf = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-lane-range] > span')].map((s) => s.closest('[data-track-id]').dataset.trackId));
      const a2 = await site(p, 'a-range-all', footerRange, { prefix: true, text: `Time selection: ${T(3)} ${EM} ${T(5)} · length ${T(2)} · all tracks · `, monos: [T(3), T(5), T(2)] });
      const allLanesSpan = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-range-all-lanes]'); return s && { cls: s.className, text: s.textContent }; });
      const e2 = await site(p, 'e-badge-all', clipBadge, null);
      let scan = null; if (W === 1440) scan = await plexScan(p, 'd-alltracks');
      const sh = await shot(p, 'c156-alltracks');
      const lb = await p.locator('[data-testid=arrangement-lane-range] > span').first().boundingBox().catch(() => null);
      const sh2 = lb ? await shot(p, 'c156-lanelabel', { x: Math.max(0, lb.x - 20), y: Math.max(0, lb.y - 10), width: Math.min(420, X.VPS[W].width - lb.x + 20), height: 60 }) : null;
      return { status: st, laneOf, d, a2, allLanesSpan, badgeWhileAll: e2.present ? e2.text : null, scan, shot: sh, shot2: sh2 };
    });
    await sec('deleteUndo', async () => {
      const before = H.brief(await H.cl(p)); const st = await X.key(p, 'Delete'); const mid = H.brief(await H.cl(p));
      const u = await X.key(p, 'Control+z'); const after = H.brief(await H.cl(p)); const rg = await H.range(p); rg.readout = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null); rg.laneRanges = await p.locator('[data-testid=arrangement-lane-range]').count();
      return { before, st, mid, changed: mid !== before, u, after, restored: nos(after) === nos(before), rangeAfterUndo: rg };
    });
    await sec('escape', async () => { await X.key(p, 'Escape'); await X.key(p, 'Escape'); return p.evaluate(() => !!document.querySelector('[data-testid=arrangement-range]')); });
    // (b) selected clip: the hero (longest title)
    await sec('selClip', async () => {
      await L.selectClip(p, res.heroId); await p.mouse.move(2, 2); await sleep(250);
      const det = await p.evaluate(() => ({ title: document.querySelector('[data-testid=arrangement-selected-clip]')?.getAttribute('title') }));
      const m = /start ([\d:.]+) · length ([\d:.]+) · source offset ([\d:.]+)$/.exec(det.title || '') || [];
      const bsel = await site(p, 'b-selClip', footerSel, { text: det.title, monos: [m[1], m[2], m[3]] });
      bsel.titleEqualsText = bsel.text === bsel.title;
      bsel.titleStartsClip = /^Clip: CZABA hero — საჯარო preview · start /.test(bsel.title || '');
      let scan = null; if (W === 1440) scan = await plexScan(p, 'b-selClip');
      const fb = await p.locator('footer').last().boundingBox();
      const sh = await shot(p, 'c156-selclip-footer', { x: 0, y: Math.max(0, fb.y - 10), width: X.VPS[W].width, height: Math.min(fb.height + 20, X.VPS[W].height - fb.y + 10) });
      return { b: bsel, scan, shot: sh };
    });
    await sec('selClipSfx', async () => {
      const s = await H.byLane(p, 'sfx'); await L.selectClip(p, s.id); await p.mouse.move(2, 2); await sleep(250);
      const t = await p.evaluate(() => document.querySelector('[data-testid=arrangement-selected-clip]')?.getAttribute('title'));
      const r = await site(p, 'b-selClipSfx', footerSel, { text: `Clip: Soft impact · start ${T(4)} · length ${T(2)} · source offset ${T(0)}`, monos: [T(4), T(2), T(0)] });
      r.titleEqualsText = r.text === t; await X.key(p, 'Escape'); return r;
    });
    // (c) drop ghost free + occupied
    await sec('ghostFree', async () => {
      const before = H.brief(await H.cl(p));
      await holdLib(p, 'demo-soft-impact', 'sfx', 12);
      const g = await site(p, 'c-ghostFree', ghostSpec, { text: T(12), monos: [T(12)] });
      const attr = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((x) => ({ blocked: x.dataset.blocked, lane: x.closest('[data-track-id]').dataset.trackId })));
      let scan = null; if (W === 1440) scan = await plexScan(p, 'c-ghostFree');
      const gb = await p.locator('[data-testid=arrangement-drop-ghost]').first().boundingBox().catch(() => null);
      const sh = gb ? await shot(p, 'c156-ghost-free', { x: Math.max(0, gb.x - 30), y: Math.max(0, gb.y - 20), width: 420, height: 90 }) : null;
      await p.mouse.up(); await sleep(900); const st = await L.status(p); const after = H.brief(await H.cl(p));
      const u = await X.key(p, 'Control+z'); const back = H.brief(await H.cl(p));
      return { g, attr, scan, shot: sh, before, releaseStatus: st, after, added: after !== before, undo: u, back, restored: nos(back) === nos(before) };
    });
    await sec('ghostBlocked', async () => {
      const before = H.brief(await H.cl(p));
      await holdLib(p, 'demo-soft-impact', 'sfx', 4.5);
      const gs = await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-drop-ghost] > span > span'); return g ? g.textContent : null; });
      const g = await site(p, 'c-ghostBlocked', ghostSpec, { text: `${gs} · No room here`, monos: [gs] });
      const attr = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((x) => ({ blocked: x.dataset.blocked, lane: x.closest('[data-track-id]').dataset.trackId })));
      let scan = null; if (W === 1440) scan = await plexScan(p, 'c-ghostBlocked');
      const gb = await p.locator('[data-testid=arrangement-drop-ghost]').first().boundingBox().catch(() => null);
      const sh = gb ? await shot(p, 'c156-ghost-blocked', { x: Math.max(0, gb.x - 30), y: Math.max(0, gb.y - 20), width: 460, height: 90 }) : null;
      await p.keyboard.press('Escape'); await sleep(200); await p.mouse.up(); await sleep(700);
      const after = H.brief(await H.cl(p));
      return { g, attr, scan, shot: sh, before, after, unchanged: nos(after) === nos(before) };
    });
    await sec('statusSans', async () => {
      const sfx = await H.byLane(p, 'sfx'); const before = H.brief(await H.cl(p));
      const st = await H.dragHeader(p, sfx.id, 20, { dyLane: 'stems' }); const mid = H.brief(await H.cl(p));
      const stEl = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-status]'); const s = o.querySelector('span'); const cs = getComputedStyle(s); return { text: o.textContent, family: cs.fontFamily.slice(0, 30), weight: cs.fontWeight, monoInside: o.querySelectorAll('.font-mono').length }; });
      const u = nos(mid) !== nos(before) ? await X.key(p, 'Control+z') : 'skipped (no change)'; const after = H.brief(await H.cl(p));
      return { before, st, mid, crossed: nos(mid) !== nos(before), stEl, undo: u, after, restored: nos(after) === nos(before) };
    });
    await sec('laneM', async () => {
      const o = {}; o.base = await playWindow(p, 0.2, 1200);
      await p.click('[data-track-id=music] button[title=Mute]'); await sleep(200); o.mutePressed = await p.getAttribute('[data-track-id=music] button[title=Mute]', 'aria-pressed'); o.muted = await playWindow(p, 0.2, 1200);
      o.undoStatus = await X.key(p, 'Control+z'); o.muteAfterUndo = await p.getAttribute('[data-track-id=music] button[title=Mute]', 'aria-pressed'); o.afterUndo = await playWindow(p, 0.2, 1200);
      return o;
    });
    if (W === 1440) {
      await sec('invMenus', async () => {
        const o = {};
        await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
        const mk = p.locator('[data-testid=arrangement-marker]').first(); const mb = await mk.boundingBox(); await p.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2, { button: 'right' }); await sleep(500);
        o.markerMenuOpen = await p.locator('[data-testid=arrangement-marker-menu]').count(); o.markerPlex = await plexScan(p, 'markerMenu'); o.markerInv = await p.evaluate(inventory); await p.keyboard.press('Escape'); await sleep(300);
        const lb = await laneBox(p, 'sfx'); await p.mouse.click(await X.tx(p, 9), lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
        o.gridMenuOpen = await p.locator('[data-testid=arrangement-grid-menu]').count(); o.gridPlex = await plexScan(p, 'gridMenu'); o.gridInv = await p.evaluate(inventory); await p.keyboard.press('Escape'); await sleep(300);
        await X.openDlg(p); await sleep(400); o.exportPlex = await plexScan(p, 'exportDialog'); o.exportInv = await p.evaluate(inventory); o.exportShot = await shot(p, 'c156-inv-export'); await p.keyboard.press('Escape'); await sleep(400);
        return o;
      });
    }
    // (f) video gap — last
    await sec('videoGap', async () => {
      await L.loadVideo(p, VIDEO_FILE);
      const vids = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ start: +e.getAttribute('data-clip-start'), lane: e.closest('[data-track-id]').dataset.trackId })));
      const g = await L.geo(p);
      const vb = await p.locator('[data-clip-kind=video]').first().boundingBox(); const vEnd = +(vids[0].start + vb.width / g.pps).toFixed(3);
      await L.seekTo(p, 8); await sleep(400);
      const pos = await L.posNow(p);
      const f = await site(p, 'f-videoGap', videoGap, { text: `No video · ${T(pos)}`, monos: [T(pos)] });
      let scan = null; if (W === 1440) scan = await plexScan(p, 'f-videoGap');
      const db = await p.locator('[data-testid=arrangement-video-dock]').first().boundingBox().catch(() => null);
      const sh = db ? await shot(p, 'c156-video-gap', db) : await shot(p, 'c156-video-gap');
      // playback inside the gap: imperative updates
      await L.blur(p); await p.keyboard.press('Space'); const samples = [];
      for (let i = 0; i < 4; i++) { await sleep(350); samples.push(await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-video-gap] span'); return s ? { t: s.textContent, cls: s.className, w: getComputedStyle(s).fontWeight, ff: getComputedStyle(s).fontFamily.slice(0, 15) } : null; })); }
      await p.keyboard.press('Space'); await sleep(400);
      const vt = await p.evaluate(() => { const v = document.querySelector('[data-testid=arrangement-video-dock] video'); return v ? { rs: v.readyState, err: v.error && v.error.code, dur: v.duration } : null; });
      await L.seekTo(p, 1); await sleep(400); const inVideo = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-video-gap]'));
      return { file: VIDEO_FILE, vids, vEnd, pos, f, scan, shot: sh, samples, distinctSamples: new Set(samples.map((s) => s && s.t)).size, video: vt, gapHiddenAt1s: !inVideo };
    });
    await sec('facesEnd', async () => ({ loaded: await facesLoaded(p), all: await facesAll(p) }));
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontNet = net.map((n) => ({ n: n.fontResp.length, non200: n.fontResp.filter((r) => r.s !== 200), fail: n.fontFail }));
  save(); console.log(JSON.stringify({ vp: W, errors: res.errors, net: res.net, fontNet: res.fontNet.map((f) => ({ n: f.n, non200: f.non200.length, fail: f.fail.length })) }, null, 1)); await b.close();
})();
