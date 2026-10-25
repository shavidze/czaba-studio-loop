// B round 165 planning probe for V-3c-3b (marker ◀ ▶ +, detail toggle ▸/▾, grid menu ✓, ← CZABA). node v3c3b-probe.cjs <out.json>
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const GLYPHS = /[◀▶▸▾✓←]/gu;
const measure = () => {
  const all = [...document.querySelectorAll('button,a,[data-testid],[role]')];
  const occ = {}; const res = [];
  for (const e of all) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (e.tagName.toLowerCase() === 'svg') continue;
    const txt = (e.textContent || '').replace(/[◀▶▸▾✓←]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};
const SITES = {
  'marker-prev': () => document.querySelector('[data-testid=arrangement-marker-prev]'),
  'marker-next': () => document.querySelector('[data-testid=arrangement-marker-next]'),
  'marker-add': () => document.querySelector('[data-testid=arrangement-marker-add]'),
  'detail-toggle': () => document.querySelector('[data-testid=arrangement-detail-toggle]'),
  exit: () => document.querySelector('[data-testid=arrangement-exit]'),
  'grid-check': () => [...document.querySelectorAll('[data-testid=arrangement-grid-menu] span[aria-hidden=true]')].find((s) => s.textContent.trim() === '✓'),
};
const metrics = () => {
  const get = {
    'marker-prev': () => document.querySelector('[data-testid=arrangement-marker-prev]'),
    'marker-next': () => document.querySelector('[data-testid=arrangement-marker-next]'),
    'marker-add': () => document.querySelector('[data-testid=arrangement-marker-add]'),
    'detail-toggle': () => document.querySelector('[data-testid=arrangement-detail-toggle]'),
    exit: () => document.querySelector('[data-testid=arrangement-exit]'),
    'grid-check': () => [...document.querySelectorAll('[data-testid=arrangement-grid-menu] span[aria-hidden=true]')].find((s) => s.textContent.trim() === '✓'),
  };
  const res = {};
  for (const [id, f] of Object.entries(get)) {
    const e = f(); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const tn = [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    const sub = (re) => { if (!tn) return null; const m = re.exec(tn.textContent); if (!m) return null; const rg = document.createRange(); rg.setStart(tn, m.index); rg.setEnd(tn, m.index + m[0].length); const b = rg.getBoundingClientRect(); return [+b.width.toFixed(3), +b.height.toFixed(3), +b.x.toFixed(3)]; };
    const all = (() => { const rg = document.createRange(); rg.selectNodeContents(e); const b = rg.getBoundingClientRect(); return [+b.width.toFixed(3), +b.height.toFixed(3)]; })();
    res[id] = { present: true, text: e.textContent, font: cs.fontSize, lineHeight: cs.lineHeight, family: cs.fontFamily.slice(0, 40), display: cs.display, color: cs.color, box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(3), +r.height.toFixed(3)], content: all, glyph: sub(/[◀▶▸▾✓←+]/u), space: sub(/ /u), word: sub(/[A-Za-z]+/u) };
  }
  return res;
};
const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" style="flex-shrink:0;width:${s}px;height:${s}px" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-probe="${s}"><path d="M4 4h16v16H4z"/></svg>`;
const VARIANTS = [
  { site: 'marker-prev', name: 'svg10-plain', html: svg(10) },
  { site: 'marker-prev', name: 'svg10-flex', html: svg(10), style: 'display:inline-flex;align-items:center;justify-content:center' },
  { site: 'marker-prev', name: 'svg12-flex', html: svg(12), style: 'display:inline-flex;align-items:center;justify-content:center' },
  { site: 'marker-next', name: 'svg10-flex', html: svg(10), style: 'display:inline-flex;align-items:center;justify-content:center' },
  { site: 'marker-add', name: 'svg10-flex', html: svg(10), style: 'display:inline-flex;align-items:center;justify-content:center' },
  { site: 'marker-add', name: 'svg8-flex', html: svg(8), style: 'display:inline-flex;align-items:center;justify-content:center' },
  ...[10, 12].flatMap((s) => [2, 3, 4].map((g) => ({ site: 'detail-toggle', name: `word+svg${s}-gap${g}`, word: true, html: svg(s), style: `display:inline-flex;align-items:center;gap:${g}px` }))),
  ...[12, 14].flatMap((s) => [2, 3, 4, 6].map((g) => ({ site: 'exit', name: `svg${s}+word-gap${g}`, wordAfter: true, html: svg(s), style: `display:inline-flex;align-items:center;gap:${g}px` }))),
  { site: 'grid-check', name: 'svg10-plain', html: svg(10) },
  { site: 'grid-check', name: 'svg10-flex', html: svg(10), style: 'display:flex;align-items:center;justify-content:center' },
  { site: 'grid-check', name: 'svg12-flex', html: svg(12), style: 'display:flex;align-items:center;justify-content:center' },
];
const applyVariant = (v) => {
  const get = {
    'marker-prev': () => document.querySelector('[data-testid=arrangement-marker-prev]'),
    'marker-next': () => document.querySelector('[data-testid=arrangement-marker-next]'),
    'marker-add': () => document.querySelector('[data-testid=arrangement-marker-add]'),
    'detail-toggle': () => document.querySelector('[data-testid=arrangement-detail-toggle]'),
    exit: () => document.querySelector('[data-testid=arrangement-exit]'),
    'grid-check': () => [...document.querySelectorAll('[data-testid=arrangement-grid-menu] span[aria-hidden=true]')].find((s) => s.textContent.trim() === '✓'),
  };
  const e = get[v.site](); if (!e) return null;
  const saved = { html: e.innerHTML, style: e.getAttribute('style') };
  window.__probeSaved = { site: v.site, saved, el: e };
  const word = e.textContent.replace(/[◀▶▸▾✓←]/gu, '').trim();
  if (v.word) e.innerHTML = `${word}${v.html}`;
  else if (v.wordAfter) e.innerHTML = `${v.html}${word}`;
  else e.innerHTML = v.html;
  if (v.style) e.setAttribute('style', (saved.style ? saved.style + ';' : '') + v.style);
  const s = e.querySelector('svg[data-probe]'); const sr = s.getBoundingClientRect(); const hr = e.getBoundingClientRect();
  const t = document.elementFromPoint(sr.x + sr.width / 2, sr.y + sr.height / 2);
  return { svg: [sr.width, sr.height], host: [+hr.width.toFixed(3), +hr.height.toFixed(3)], dx: +((sr.x + sr.width / 2) - (hr.x + hr.width / 2)).toFixed(3), dy: +((sr.y + sr.height / 2) - (hr.y + hr.height / 2)).toFixed(3), hit: t ? `${t.tagName}${t.closest('button,a') ? '/' + (t.closest('button,a').getAttribute('data-testid') || t.closest('button,a').tagName) : ''}` : null };
};
const restore = () => { const s = window.__probeSaved; if (!s) return; s.el.innerHTML = s.saved.html; if (s.saved.style === null) s.el.removeAttribute('style'); else s.el.setAttribute('style', s.saved.style); window.__probeSaved = null; };
const diff = (before, after) => {
  const am = Object.fromEntries(after.map((a) => [a.k, a]));
  const bk = new Set(before.map((b) => b.k));
  const d = before.map((x) => { const a = am[x.k]; if (!a) return { k: x.k, missing: true }; return { k: x.k, dx: +(a.x - x.x).toFixed(3), dy: +(a.y - x.y).toFixed(3), dw: +(a.w - x.w).toFixed(3), dh: +(a.h - x.h).toFixed(3) }; });
  const added = after.filter((a) => !bk.has(a.k)).map((a) => a.k);
  const moved = d.filter((r) => r.missing || [r.dx, r.dy, r.dw, r.dh].some((v) => Math.abs(v) > 0.01));
  const maxAbs = Math.max(0, ...d.filter((r) => !r.missing).flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)]));
  return { maxAbs: +maxAbs.toFixed(3), moved: moved.slice(0, 12), movedCount: moved.length, added };
};
(async () => {
  const b = await L.launch(); const res = {};
  const states = [
    ['S0-default', async () => {}],
    ['S1-detail-toggled', async (p) => { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); }],
    ['S2-grid-menu', async (p) => { const body = p.locator('[data-track-id="music"] [data-grid-seconds]').first(); const bb = await body.boundingBox(); await p.mouse.click(bb.x + 300, bb.y + bb.height / 2, { button: 'right' }); await p.waitForSelector('[data-testid=arrangement-grid-menu]', { timeout: 5000 }); await sleep(300); }],
  ];
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, prep] of states) {
      const net = [];
      const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b165-${W}-${name}`, net);
      await p.mouse.move(2, 2); await sleep(300); await prep(p); if (name !== 'S2-grid-menu') await p.mouse.move(2, 2); await sleep(500);
      const m = await p.evaluate(metrics); const before = await p.evaluate(measure);
      const variants = [];
      for (const v of VARIANTS) {
        const info = await p.evaluate(applyVariant, v); if (!info) { variants.push({ site: v.site, name: v.name, absent: true }); continue; }
        await sleep(120); const after = await p.evaluate(measure);
        variants.push({ site: v.site, name: v.name, ...info, ...diff(before, after) });
        await p.evaluate(restore); await sleep(80);
      }
      const check = diff(before, await p.evaluate(measure));
      res[W].push({ state: name, n: before.length, metrics: m, variants, restoreCheck: check.maxAbs, net: X.netOk ? X.netOk(net) : null, before });
      await p.screenshot({ path: out.replace('.json', `-${W}-${name}.png`) });
      console.log(W, name, 'n', before.length, 'restore', check.maxAbs);
      for (const [k, v] of Object.entries(m)) if (v.present) console.log('  M', k, v.font, v.display, 'box', JSON.stringify(v.box), 'glyph', JSON.stringify(v.glyph), 'space', JSON.stringify(v.space), 'word', JSON.stringify(v.word), JSON.stringify(v.text));
      for (const v of variants) console.log('  V', v.site, v.name, v.absent ? 'ABSENT' : `max ${v.maxAbs} n ${v.movedCount} host ${JSON.stringify(v.host)} c ${v.dx},${v.dy} hit ${v.hit} added ${v.added.length} ${JSON.stringify(v.moved.slice(0, 3))}`);
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
