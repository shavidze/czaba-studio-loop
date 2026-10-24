// B round 147 -> 148: video dock + rest-of-workspace baseline at 34ce551 (pre V-0.5c).
// Selectors are testid / structure based only (no Georgian or English text), so the same tool runs after A's copy lands.
// node dockbase148.cjs <1440|1280> [tag]  -> ../out/<tag>-<W>.json (tag default dockbase148)
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'dockbase148';
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, head: process.env.HEAD_SHA || '', startedUtc: new Date().toISOString(), states: {}, rest: {}, geo: {} };

const measure = (p) => p.evaluate(() => {
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); const ys = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return ys.size; };
  const glyph = (el) => { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()].filter((q) => q.width > 0); if (!rs.length) return null; return [Math.round(Math.min(...rs.map((q) => q.left)) * 2) / 2, Math.round(Math.max(...rs.map((q) => q.right)) * 2) / 2]; };
  const nodes = {};
  const put = (k, el) => {
    if (!el || !el.getClientRects().length) return;
    nodes[k] = { box: b(el), lines: lines(el), glyph: glyph(el), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200), aria: el.getAttribute('aria-label'), title: el.getAttribute('title'), sw: [el.scrollWidth, el.clientWidth] };
  };
  const dock = document.querySelector('[data-testid=arrangement-video-dock]');
  put('dock', dock);
  if (dock) {
    const row = dock.querySelector(':scope > div > div');
    put('dock-row', row);
    put('dock-overview-label', row && row.querySelector(':scope > span'));
    put('dock-overview-note', row && row.querySelector(':scope > span > span'));
    put('dock-caption', dock.querySelector('[data-testid=arrangement-video-caption]'));
    put('dock-caption-note', dock.querySelector('[data-testid=arrangement-video-caption] > span'));
    put('dock-placeholder', dock.querySelector('[data-testid=arrangement-video-placeholder]'));
    put('dock-placeholder-text', dock.querySelector('[data-testid=arrangement-video-placeholder] > span'));
    put('dock-placeholder-return', dock.querySelector('[data-testid=arrangement-video-placeholder-return]'));
  }
  const box = document.querySelector('[data-testid=arrangement-video-box]');
  put('video-box', box);
  if (box) {
    put('video-empty', box.querySelector(':scope > p:not([data-testid])'));
    put('video-gap', box.querySelector('[data-testid=arrangement-video-gap]'));
    put('video-expand', box.querySelector('[data-testid=arrangement-video-expand]'));
    put('video-drag', box.querySelector('[data-testid=arrangement-video-drag]'));
    put('video-close', box.querySelector('[data-testid=arrangement-video-close]'));
    for (const v of box.querySelectorAll('video')) put(`video-${v.dataset.videoRole}`, v);
  }
  return { nodes, expanded: box ? box.dataset.videoExpanded : null, floating: box ? box.dataset.videoFloating : null, status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim(), title: document.title, lang: document.documentElement.lang, docW: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
});
const measureRest = (p) => p.evaluate(() => {
  const skip = [document.querySelector('[data-testid=arrangement-library]'), document.querySelector('[data-testid=arrangement-video-dock]')].filter(Boolean);
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const res = {}; const seen = {};
  for (const el of document.querySelectorAll('[data-testid],[data-track-id],button[aria-label]')) {
    if (skip.some((s) => s.contains(el))) continue;
    if (!el.getClientRects().length) continue;
    const base = el.dataset.testid || (el.dataset.trackId ? `track:${el.dataset.trackId}` : `btn:${el.getAttribute('aria-label').slice(0, 40)}`);
    const n = (seen[base] = (seen[base] || 0) + 1);
    res[n > 1 ? `${base}#${n}` : base] = b(el);
  }
  return res;
});
const georgian = (p) => p.evaluate(() => {
  const G = /[Ⴀ-ჿ]/; const hits = [];
  const root = document.querySelector('[data-testid=arrangement-video-dock]');
  const scan = (el) => { for (const a of ['aria-label', 'title', 'placeholder']) { const v = el.getAttribute && el.getAttribute(a); if (v && G.test(v)) hits.push(`${a}: ${v}`); } };
  if (root) { scan(root); root.querySelectorAll('*').forEach(scan); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (G.test(n.nodeValue)) hits.push(`text: ${n.nodeValue.trim()}`); } }
  if (G.test(document.title)) hits.push(`title: ${document.title}`);
  return hits;
});
const save = () => fs.writeFileSync(path.join(L.OUT, `${TAG}-${W}.json`), JSON.stringify({ ...out, net }, null, 1));
const shot = (p, n) => p.screenshot({ path: path.join(L.SHOTS, `${TAG}-${n}-${W}.png`) });
const snap = async (p, name, rest) => { out.states[name] = await measure(p); out.geo[name] = await georgian(p); if (rest) out.rest[name] = await measureRest(p); await shot(p, name); };

(async () => {
  fs.mkdirSync(L.OUT, { recursive: true }); fs.mkdirSync(L.SHOTS, { recursive: true });
  const b = await L.launch();
  const O = await L.openStudio(b, VP, `${TAG}-${W}`, net);
  const p = O.page;
  out.snapAtStart = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.snapAfter = await L.setSnapOff(p);
  await snap(p, 'empty', true);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  out.videoClips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => [e.dataset.clipStart, e.closest('[data-track-id]').dataset.trackId]));
  out.posVideo = await L.seekTo(p, 1);
  await snap(p, 'video', true);
  out.posGap = await L.seekTo(p, 8);
  await snap(p, 'gap', false);
  await L.seekTo(p, 1);
  await p.click('[data-testid=arrangement-video-expand]'); await L.sleep(600);
  await snap(p, 'expanded', true);
  await p.keyboard.press('Escape'); await L.sleep(600);
  await snap(p, 'returned', false);
  save(); await O.ctx.close(); await b.close();
  const s = out.states;
  console.log(JSON.stringify({ snap: [out.snapAtStart, out.snapAfter], clips: out.videoClips, pos: [out.posVideo, out.posGap], states: Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { n: Object.keys(v.nodes).length, exp: v.expanded, flo: v.floating, title: v.title, lang: v.lang, docW: v.docW }])), geo: out.geo, net: net.map((n) => [n.label, n.errors, n.forbidden.length, n.hydration.length]) }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
