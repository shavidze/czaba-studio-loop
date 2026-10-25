// C round 156 — V-2b-3a sentence timecodes: TEXT-BYTES (a)-(f), MONO-STYLE N7-N12, LAYOUT-FIT, PLEX500-INVENTORY-S (1440), FUNC-SMOKE-S. node c156.cjs <1440|1280> [label] [videoFile]
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const nos = (x) => x.replace(/\*/g, ''); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c157-${W}`; const VIDEO_FILE = process.argv[4] || 'clip-4s-vp9-opus.webm'; const net = [];
const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [], plexScan: {} };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-157/shots/${f}`; };
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
// ===== C round 157 main: TEXT-BYTES-E, MONO-STYLE-N13..N16, LAYOUT-FIT-E, CSS2-TRIM (in-page), FONT-INVENTORY, FUNC-SMOKE-E. node c157.cjs <1440|1280> [label]
const R4 = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400&family=Noto+Sans+Georgian:wght@400;500&display=swap';
const WAVL = require('./wav.cjs');
const DESC = { sel: '#arrangement-export-title + p' };
const POPT = { sel: 'label:has([data-testid=arrangement-export-scope-project]) > span' };
const ROPT = { sel: 'label:has([data-testid=arrangement-export-scope-range]) > span' };
const LNOTE = { sel: '[data-testid=arrangement-export-loop-note]' };
const ref = {
  project: (s, e) => `Entire project · ${s} — ${e}`,
  range: (s, e, sec) => `Time selection · ${s} — ${e} (${sec})`,
  loopRange: (s, e, sec) => `Loop does not change the export — the time selection is exported (${s} — ${e}, ${sec}).`,
  loopProject: (s, e) => `Loop does not change the export — the entire project is exported (${s} — ${e}).`,
};
const secTxt = (a, b) => `${(b - a).toFixed(3)} s`;
async function siteX(p, name, spec, text, monos) {
  const r = await site(p, name, spec, { text, monos });
  if (!r.present) return r;
  r.secondsInSpan = await p.evaluate(({ sel }) => { const root = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length); return root ? [...root.querySelectorAll('span')].filter((s) => / s\)|\d s/.test(s.textContent)).map((s) => s.className) : null; }, spec);
  r.nMono = r.monos.length;
  r.ok = r.bytesEqual && r.monosOk && r.monoStyleOk && r.nMono === 2 && r.secondsInSpan.length === 0 && r.otherMonoClasses.length === 0 && !/Plex/.test(r.rootStyle.family);
  return r;
}
async function axName(p, testid) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-testid=${testid}]` });
  if (!nodeId) { await cdp.detach(); return null; }
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  await cdp.detach();
  const n = nodes[0]; return { role: n.role && n.role.value, name: n.name && n.name.value, checked: (n.properties || []).find((x) => x.name === 'checked')?.value?.value };
}
const projEnd = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-project-end]').textContent.trim());
const dlgOpen = (p) => p.locator('#arrangement-export-title').count();
async function openE(p) { await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(500); }
async function escE(p) { await p.keyboard.press('Escape'); await sleep(500); return (await dlgOpen(p)) === 0; }
async function scope(p, s) { await p.click(`[data-testid=arrangement-export-scope-${s}]`); await sleep(300); }
async function fitFooter(p) {
  return p.evaluate(() => {
    const f = document.querySelector('[data-testid=arrangement-export-footer]').getBoundingClientRect();
    const a = document.activeElement; const ab = a ? a.getBoundingClientRect() : null;
    const body = document.querySelector('[data-testid=arrangement-export-footer]').parentElement;
    let sc = body; while (sc && sc !== document.body && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    return { footerTop: +f.top.toFixed(1), active: a && (a.dataset.testid || a.tagName), activeBox: ab && [ab.top, ab.bottom].map((v) => +v.toFixed(1)), covered: ab ? ab.bottom > f.top + 0.5 : null, scroller: sc ? { st: sc.scrollTop, sh: sc.scrollHeight, ch: sc.clientHeight } : null };
  });
}
async function focusByTab(p, testid, max = 30) {
  for (let i = 0; i < max; i++) { await p.keyboard.press('Tab'); await sleep(60); const t = await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid); if (t === testid) return i + 1; }
  return -1;
}
async function invState(p, name) {
  const els = await p.evaluate(inventory);
  const o = { name, w700: els.filter((e) => e.weight >= 700), w600: els.filter((e) => e.weight === 600).map((e) => ({ text: e.text, tag: e.tag, testid: e.nearestTestid, inDialog: e.inDialog, family: e.family.slice(0, 20) })), plex: await plexScan(p, name), faces: await facesLoaded(p) };
  o.badFaces = (await facesAll(p)).filter((f) => /^Instrument Sans 700|^IBM Plex Mono 500/.test(f));
  o.toast = await p.evaluate(() => [...document.querySelectorAll('[role=alert],[role=status]')].filter((e) => !e.closest('.studio-container') && e.getClientRects().length).map((e) => e.textContent.trim().slice(0, 80)));
  o.ok = o.w700.length === 0 && o.plex.plex500plus.length === 0 && o.badFaces.length === 0;
  return o;
}
async function doExport(p, log, name, sc) {
  await openE(p); await p.click('[data-testid=arrangement-export-format-wav]'); await scope(p, sc);
  const btn = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^Export WAV$/ });
  const n0 = log.downloads.length;
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 240000 }), btn.first().click()]);
  const dst = path.join(L.OUT, `${LBL}-${name}.wav`); await dl.saveAs(dst); await sleep(1500);
  const nDl = log.downloads.length - n0;
  const msg = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-footer] [role=status],[data-testid=arrangement-export-footer] [role=alert]') || {}).textContent || null);
  await escE(p);
  const buf = fs.readFileSync(dst); const w = WAVL.parse(buf); const s = WAVL.stats(w);
  const sr = w.fmt.sr, ch = w.fmt.ch, fsMax = w.fmt.tag === 3 ? 1 : Math.pow(2, w.fmt.bits - 1);
  const dataBytes = buf.length - 44;
  return { suggested: dl.suggestedFilename(), nDownloads: nDl, msg, bytes: buf.length, riff: w.riff, fmt: w.fmt, frames: w.frames, seconds: +w.seconds.toFixed(5), nan: s.nan, full: s.full, peak: +s.peak.toFixed(4), rms: +s.rms.toFixed(5) };
}

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], LBL, net, { extraInit: X.tapInit });
    await p.mouse.move(2, 2); await sleep(300); res.fontsWait = log.fontsReady;
    await sec('css2Dom', async () => {
      const links = await p.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href).filter((h) => /fonts\.googleapis/.test(h)));
      return { links, exactR4: links.length === 1 && links[0] === R4 };
    });
    await sec('css2Body', async () => {
      const txt = await p.evaluate(async (u) => (await fetch(u)).text(), R4);
      const blocks = [...txt.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => ({ fam: (/font-family:\s*'([^']+)'/.exec(m[1]) || [])[1], w: (/font-weight:\s*(\d+)/.exec(m[1]) || [])[1], url: (/url\(([^)]+)\)/.exec(m[1]) || [])[1] }));
      const counts = {}; for (const x of blocks) { const k = `${x.fam} ${x.w}`; counts[k] = (counts[k] || 0) + 1; }
      const map = Object.fromEntries(blocks.map((x) => [x.url, `${x.fam} ${x.w}`]));
      fs.writeFileSync(path.join(L.OUT, `${LBL}-css2.txt`), txt);
      return { nBlocks: blocks.length, counts, keys: Object.keys(counts).sort(), map };
    });
    await sec('invS0', async () => invState(p, 'S0'));
    await sec('snap', () => L.setSnapOff(p));
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    await sec('table0', async () => H.brief(await H.cl(p)));
    await sec('projectEnd', () => projEnd(p));
    await sec('play2s', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300); const ph0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(2000); await p.keyboard.press('Space'); const S = await p.evaluate(() => window.__tapStop()); await sleep(400);
      return { ph0, ph1: await L.posNow(p), peak: +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4), nTap: S.length };
    });
    // (a) no range
    await sec('A_noRange', async () => {
      await L.blur(p); await p.keyboard.press('Escape'); await sleep(200);
      const pe = await projEnd(p); await openE(p);
      const t = ref.project('00:00.000', pe);
      const n13 = await siteX(p, 'N13-desc-noRange', DESC, t, ['00:00.000', pe]);
      const n14 = await siteX(p, 'N14-projOpt-noRange', POPT, t, ['00:00.000', pe]);
      const ax = { project: await axName(p, 'arrangement-export-scope-project'), range: await axName(p, 'arrangement-export-scope-range') };
      const rr = await p.getByRole('radio', { name: t, exact: true }).count();
      const sh = await shot(p, 'c157-export-noRange');
      const closed = await escE(p);
      return { pe, t, n13, n14, ax, axProjOk: ax.project && ax.project.name === t, getByRoleCount: rr, shot: sh, closedByEscape: closed };
    });
    await sec('rangeBody', async () => {
      const hero = await H.byLane(p, 'music'); res.heroId = hero.id;
      const st = await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); await sleep(250);
      return { status: st, det: await H.range(p) };
    });
    const R = () => res.rangeBody.det; const rs = () => T(+R().start), re = () => T(+R().end);
    await sec('B_range', async () => {
      await openE(p);
      const s = rs(), e = re(); const sec2 = secTxt(X.parseT(s), X.parseT(e)); const t = ref.range(s, e, sec2);
      const n13 = await siteX(p, 'N13-desc-range', DESC, t, [s, e]);
      const n15 = await siteX(p, 'N15-rangeOpt', ROPT, t, [s, e]);
      const pe = await projEnd(p); const tp = ref.project('00:00.000', pe);
      const n14 = await siteX(p, 'N14-projOpt-withRange', POPT, tp, ['00:00.000', pe]);
      const ax = { project: await axName(p, 'arrangement-export-scope-project'), range: await axName(p, 'arrangement-export-scope-range') };
      const sh = await shot(p, 'c157-export-range');
      await scope(p, 'project');
      const n13p = await siteX(p, 'N13-desc-afterProject', DESC, tp, ['00:00.000', pe]);
      await scope(p, 'range');
      const n13r = await siteX(p, 'N13-desc-backRange', DESC, t, [s, e]);
      const closed = await escE(p);
      return { s, e, t, tp, isExact3to5: s === '00:03.000' && e === '00:05.000', n13, n15, n14, ax, axOk: ax.range && ax.range.name === t && ax.project && ax.project.name === tp, n13p, n13r, shot: sh, closed };
    });
    await sec('C_loop', async () => {
      const st = await X.key(p, 'Control+l'); await sleep(300);
      const loopTimes = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
      if (W === 1440) res.invRangeLoop = await invState(p, 'range+loop');
      // master mute on for the Export inventory state
      await p.click('[data-testid=arrangement-master] button[aria-label="Master Mute"]'); await sleep(250);
      await openE(p);
      const s = rs(), e = re(); const sec2 = secTxt(X.parseT(s), X.parseT(e));
      const n16r = await siteX(p, 'N16-loop-range', LNOTE, ref.loopRange(s, e, sec2), [s, e]);
      const muteNote = await p.evaluate(() => { const n = document.querySelector('[data-testid=arrangement-export-master-mute]'); return n && { text: n.textContent, spans: n.querySelectorAll('span').length, family: getComputedStyle(n).fontFamily.slice(0, 20) }; });
      const lay = {};
      for (const [k, sp] of Object.entries({ desc: DESC, proj: POPT, range: ROPT, loop: LNOTE })) { const r = await site(p, `fit-${k}`, sp, null); lay[k] = r.present ? r.fit : null; }
      const inv = W === 1440 || true ? await invState(p, 'export-range-loop-mute') : null;
      const sh = await shot(p, 'c157-export-range-loop-mute');
      // footer cover: Tab to the range radio and project radio
      await p.focus('[data-testid=arrangement-export-format-wav]'); await sleep(100);
      await p.focus('[data-testid=arrangement-export-scope-range]'); await sleep(250); const fRange = await fitFooter(p);
      await p.focus('[data-testid=arrangement-export-format-wav]'); await sleep(100); const tabs = await focusByTab(p, 'arrangement-export-scope-range'); await sleep(250); const fRangeTab = await fitFooter(p);
      const sh2 = await shot(p, 'c157-export-range-focused');
      await scope(p, 'project');
      const pe = await projEnd(p);
      const n16p = await siteX(p, 'N16-loop-project', LNOTE, ref.loopProject('00:00.000', pe), ['00:00.000', pe]);
      const closed = await escE(p);
      await p.click('[data-testid=arrangement-master] button[aria-label="Master Mute"]'); await sleep(250);
      const masterMuted = await p.getAttribute('[data-testid=arrangement-master] button[aria-label="Master Mute"]', 'aria-pressed');
      return { st, loopTimes, n16r, n16p, muteNote, lay, inv, fRange, tabs, fRangeTab, shot: sh, shot2: sh2, closed, masterMutedAfter: masterMuted };
    });
    await sec('C_loopNoRange', async () => {
      await X.key(p, 'Escape'); await X.key(p, 'Escape');
      let how = 'Escape x2'; let hasRange = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-range]'));
      if (hasRange) { const lb = await laneBox(p, 'sfx'); await p.mouse.click(await X.tx(p, 12), lb.y + lb.height / 2); await sleep(400); await L.blur(p); how = 'Escape x2 + sfx lane click @12s'; hasRange = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-range]')); }
      const loopTimes = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
      await openE(p);
      const pe = await projEnd(p);
      const n13 = await siteX(p, 'N13-desc-loopNoRange', DESC, ref.project('00:00.000', pe), ['00:00.000', pe]);
      const n16 = await siteX(p, 'N16-loop-noRange', LNOTE, ref.loopProject('00:00.000', pe), ['00:00.000', pe]);
      const rangeDisabled = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-range]').disabled);
      const sh = await shot(p, 'c157-export-loop-noRange');
      const closed = await escE(p);
      return { how, hasRange, loopTimes, n13, n16, rangeDisabled, shot: sh, closed };
    });
    if (W === 1440) {
      await sec('invStates', async () => {
        const o = {};
        await L.selectClip(p, res.heroId); await X.openDetail(p); await sleep(300); o.selClipDetail = await invState(p, 'selClip+detail'); await p.keyboard.press('Escape'); await sleep(200);
        const hero = await H.byLane(p, 'music'); await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); await sleep(200); o.range = await invState(p, 'range');
        await X.key(p, 'Control+Shift+L'); o.allTracks = await invState(p, 'allTracks'); await X.key(p, 'Escape'); await X.key(p, 'Escape');
        await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
        const mk = p.locator('[data-testid=arrangement-marker]').first(); const mb = await mk.boundingBox(); await p.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2, { button: 'right' }); await sleep(500);
        o.markerMenuOpen = await p.locator('[data-testid=arrangement-marker-menu]').count(); o.markerMenu = await invState(p, 'markerMenu'); await shot(p, 'c157-inv-markermenu'); await p.keyboard.press('Escape'); await sleep(300);
        const lb = await laneBox(p, 'sfx'); await p.mouse.click(await X.tx(p, 9), lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
        o.gridMenuOpen = await p.locator('[data-testid=arrangement-grid-menu]').count(); o.gridMenu = await invState(p, 'gridMenu'); await shot(p, 'c157-inv-gridmenu'); await p.keyboard.press('Escape'); await sleep(300);
        await p.click('[role=option][data-source-id="demo-soft-impact"]'); await sleep(500);
        await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(500);
        o.previewTxt = await p.locator('[data-testid=arrangement-library-preview-toggle]').innerText(); o.preview = await invState(p, 'libraryPreview'); await shot(p, 'c157-inv-preview');
        await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(300);
        return o;
      });
    }
    // FUNC-SMOKE-E exports
    await sec('expRange', async () => {
      const hero = await H.byLane(p, 'music'); await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2); await sleep(250);
      const det = await H.range(p); const r = await doExport(p, log, 'range', 'range');
      const want = +det.end - +det.start;
      return { det, ...r, want, durOk: Math.abs(r.seconds - want) <= 0.001 && r.nDownloads === 1 && r.peak > 0 && r.nan === 0 };
    });
    await sec('expProject', async () => {
      const pe = await projEnd(p); const r = await doExport(p, log, 'project', 'project');
      return { pe, ...r, want: X.parseT(pe), durOk: Math.abs(r.seconds - X.parseT(pe)) <= 0.001 && r.nDownloads === 1 && r.peak > 0 && r.nan === 0 };
    });
    await sec('closeFocus', async () => {
      await openE(p); await p.locator('button', { hasText: /^Done$/ }).last().click(); await sleep(500);
      const a1 = await p.evaluate(() => ({ open: !!document.querySelector('#arrangement-export-title'), active: document.activeElement && document.activeElement.textContent.trim().slice(0, 20), tag: document.activeElement && document.activeElement.tagName }));
      await openE(p); await p.keyboard.press('Escape'); await sleep(500);
      const a2 = await p.evaluate(() => ({ open: !!document.querySelector('#arrangement-export-title'), active: document.activeElement && document.activeElement.textContent.trim().slice(0, 20), tag: document.activeElement && document.activeElement.tagName }));
      return { done: a1, escape: a2, ok: !a1.open && !a2.open && a1.active === 'Export' && a2.active === 'Export' };
    });
    await sec('facesEnd', async () => ({ loaded: await facesLoaded(p), all: await facesAll(p) }));
    res.fontReqs = log.fontResp;
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontNet = net.map((n) => ({ n: n.fontResp.length, non200: n.fontResp.filter((r) => r.s !== 200), fail: n.fontFail }));
  save(); console.log(JSON.stringify({ vp: W, errors: res.errors, net: res.net, fontNet: res.fontNet.map((f) => ({ n: f.n, non200: f.non200.length, fail: f.fail.length })) }, null, 1)); await b.close();
})();
