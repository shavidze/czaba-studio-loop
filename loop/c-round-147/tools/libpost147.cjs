// C round 147 replica of b-round-146/tools/libbase147.cjs (identical measure + action order); adds eval-only extras (snap, rest, georgian).
// B round 146 -> 147: library column + header badge + status baseline at 3328e75 (pre V-0.5b).
// Selectors are testid/role based only, so the same tool runs after the English copy lands.
// node libbase147.cjs <1440|1280>   -> ../out/libbase147-<W>.json
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, head: process.env.HEAD_SHA || '', startedUtc: new Date().toISOString(), states: {} };

const measure = (p) => p.evaluate(() => {
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); const ys = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return ys.size; };
  const glyph = (el) => { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()]; if (!rs.length) return null; const x0 = Math.min(...rs.map((q) => q.left)); const x1 = Math.max(...rs.map((q) => q.right)); return [Math.round(x0 * 2) / 2, Math.round(x1 * 2) / 2]; };
  const nodes = {};
  const put = (k, el) => {
    if (!el || !el.getClientRects().length) return;
    nodes[k] = {
      box: b(el), lines: lines(el), glyph: glyph(el),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
      aria: el.getAttribute('aria-label'), title: el.getAttribute('title'), placeholder: el.getAttribute('placeholder'),
      sw: [el.scrollWidth, el.clientWidth],
    };
  };
  const lib = document.querySelector('[data-testid=arrangement-library]');
  put('library', lib);
  if (lib) {
    put('lib-h2', lib.querySelector('h2'));
    put('lib-collapse', lib.querySelector('[data-testid=arrangement-library-collapse]'));
    put('lib-expand', lib.querySelector('[data-testid=arrangement-library-expand]'));
    put('lib-separator', lib.querySelector('[data-testid=arrangement-library-separator]'));
    for (const t of ['arrangement-library-search', 'arrangement-library-search-clear', 'arrangement-library-filter', 'arrangement-library-notice', 'arrangement-library-tree', 'arrangement-library-list', 'arrangement-library-empty']) put(t, lib.querySelector(`[data-testid=${t}]`));
    const nav = lib.querySelector('[data-testid=arrangement-library-tree]');
    if (nav) {
      put('tree-all', nav.querySelector(':scope > button'));
      put('tree-all-label', nav.querySelector(':scope > button > span'));
      [...nav.querySelectorAll(':scope > div')].forEach((col, i) => {
        put(`tree-col${i}-toggle`, col.querySelector('button[aria-expanded]'));
        put(`tree-col${i}-label`, col.querySelector('button[title]'));
        [...col.querySelectorAll('[data-testid=arrangement-library-folder]')].forEach((f, j) => put(`tree-col${i}-folder${j}`, f));
      });
    }
    for (const o of lib.querySelectorAll('[role=option][data-source-id]')) {
      const id = o.dataset.sourceId; put(`opt:${id}`, o);
      const spans = [...o.querySelectorAll(':scope > span')].filter((s) => s.dataset.testid !== 'arrangement-library-option-previewing');
      const meta = spans.pop();
      if (meta) { put(`opt:${id}:meta`, meta); [...meta.querySelectorAll(':scope > span')].forEach((s, k) => put(`opt:${id}:meta${k}`, s)); }
      put(`opt:${id}:marker`, o.querySelector('[data-testid=arrangement-library-option-previewing]'));
    }
    const prev = lib.querySelector('[data-testid=arrangement-library-preview]');
    if (prev) {
      put('preview', prev);
      put('preview-title', prev.querySelector(':scope > div > p'));
      put('preview-duration', prev.querySelector(':scope > div > span'));
      put('preview-wave', prev.querySelector('[data-testid=arrangement-library-preview-wave]'));
      put('preview-lane', prev.querySelector(':scope > p'));
      const btns = [...prev.querySelectorAll(':scope > div:last-child > button')];
      put('preview-toggle', prev.querySelector('[data-testid=arrangement-library-preview-toggle]'));
      put('preview-add', btns[1]);
    }
  }
  const header = document.querySelector('header');
  if (header) {
    put('header', header);
    put('header-h1', header.querySelector('h1'));
    put('header-badge', header.querySelector('span.border-accent'));
  }
  const st = document.querySelector('[data-testid=arrangement-status]');
  put('status', st);
  const footer = st ? st.closest('footer') : null;
  put('footer', footer);
  return { nodes, status: st ? st.textContent.trim() : null, docW: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
});

const GEO = /[\u10A0-\u10FF\u1C90-\u1CBF\u2D00-\u2D2F]/;
const georgian = (p) => p.evaluate((src) => {
  const GEO = new RegExp(src);
  const hits = []; let nodes = 0;
  const scan = (root, where) => {
    if (!root) return;
    const els = [root, ...root.querySelectorAll('*')];
    for (const el of els) {
      nodes += 1;
      for (const a of ['aria-label', 'title', 'placeholder', 'aria-valuetext']) { const v = el.getAttribute(a); if (v && GEO.test(v)) hits.push({ where, kind: a, tid: el.dataset.testid || el.tagName, v }); }
      for (const n of el.childNodes) if (n.nodeType === 3 && GEO.test(n.textContent)) hits.push({ where, kind: 'text', tid: el.dataset.testid || el.tagName, v: n.textContent.trim() });
    }
  };
  scan(document.querySelector('[data-testid=arrangement-library]'), 'library');
  const h = document.querySelector('header'); scan(h && h.querySelector('span.border-accent'), 'badge');
  scan(document.querySelector('[data-testid=arrangement-status]'), 'status');
  return { nodes, hits };
}, GEO.source);
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
out.geo = {}; out.rest = {};
const save = () => fs.writeFileSync(path.join(L.OUT, `libpost147-${W}.json`), JSON.stringify({ ...out, net }, null, 1));
const shot = (p, n) => p.screenshot({ path: path.join(L.SHOTS, `libpost147-${n}-${W}.png`) });

(async () => {
  fs.mkdirSync(L.OUT, { recursive: true }); fs.mkdirSync(L.SHOTS, { recursive: true });
  const b = await L.launch();
  // fresh: before any click (preview title with no selection, loading->ready status)
  const O = await L.openStudio(b, VP, `libpost147-${W}-ready`, net);
  out.snapAtStart = await O.page.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.snapAfter = await L.setSnapOff(O.page);
  out.states.ready = await measure(O.page); out.geo.ready = await georgian(O.page); out.rest.ready = await measureRest(O.page); await shot(O.page, 'ready');
  // previewing: click Soft impact, press the preview toggle
  await O.page.click('[role=option][data-source-id=demo-soft-impact]');
  await L.sleep(300);
  out.states.selected = await measure(O.page); out.geo.selected = await georgian(O.page);
  await O.page.click('[data-testid=arrangement-library-preview-toggle]'); await L.sleep(250);
  out.states.previewing = await measure(O.page); out.geo.previewing = await georgian(O.page); await shot(O.page, 'previewing');
  await O.page.click('[data-testid=arrangement-library-preview-toggle]').catch(() => {}); await L.sleep(300);
  // search with a non-matching query: empty message + clear button
  await O.page.fill('[data-testid=arrangement-library-search]', 'zzqx');
  await L.sleep(300);
  out.states.emptySearch = await measure(O.page); out.geo.emptySearch = await georgian(O.page); await shot(O.page, 'empty-search');
  await O.page.click('[data-testid=arrangement-library-search-clear]'); await L.sleep(200);
  // filter line: click the first collection label in the tree
  await O.page.click('[data-testid=arrangement-library-tree] > div button[title]'); await L.sleep(200);
  out.states.filtered = await measure(O.page); out.geo.filtered = await georgian(O.page); await shot(O.page, 'filtered');
  // collapsed rail
  await O.page.click('[data-testid=arrangement-library-collapse]'); await L.sleep(500);
  out.states.collapsed = await measure(O.page); out.geo.collapsed = await georgian(O.page); await shot(O.page, 'collapsed');
  save(); await O.ctx.close();
  // error: abort the Middle East preview request
  const O2 = await L.openCtx(b, VP, `libpost147-${W}-error`, net);
  await O2.page.route('**/middle-east.mp3', (r) => r.abort());
  await O2.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await O2.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  for (let i = 0; i < 200; i++) { const n = await O2.page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((x) => /იტვირთება…|Loading…/.test(x.textContent)).length); if (n === 0) break; await L.sleep(250); }
  await L.sleep(800);
  await O2.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
  out.snapAtStartError = await O2.page.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  await L.setSnapOff(O2.page);
  out.states.error = await measure(O2.page); out.geo.error = await georgian(O2.page); out.rest.error = await measureRest(O2.page); await shot(O2.page, 'error');
  save(); await O2.ctx.close();
  await b.close();
  const s = out.states;
  console.log(JSON.stringify({
    ready: Object.keys(s.ready.nodes).length, readyStatus: s.ready.status, errorStatus: s.error.status,
    noSelTitle: s.ready.nodes['preview-title'] && s.ready.nodes['preview-title'].text,
    badge: s.ready.nodes['header-badge'], empty: s.emptySearch.nodes['arrangement-library-empty'],
    marker: s.previewing.nodes['opt:demo-soft-impact:marker'], filter: s.filtered.nodes['arrangement-library-filter'],
    collapsed: s.collapsed.nodes['lib-expand'],
    net: net.map((n) => [n.label, n.errors.length, n.forbidden.length, n.hydration.length]),
  }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
