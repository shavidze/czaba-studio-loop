// B round 169 planning probe for V-3c-4c-2 (ArrangementDetailPanel buttons + fields). Planning data only, not a C row.
// node v3c4c2-probe.cjs <out.json>. Applies the planned class swap in the live DOM and measures boxes, radius, fills, contrast.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const SURF = ['border-transparent', 'bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12'];
const FILL = ['bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12'];
const MOTION = ['motion-safe:transition-[background-color,color]!', 'motion-safe:duration-180!', 'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!', 'motion-reduce:transition-none!'];
const SITES = {
  'detail-apply': ['[data-testid=arrangement-detail-apply]', 'surf'],
  'detail-reset': ['[data-testid=arrangement-detail-clip-gain-reset]', 'surf'],
  'detail-toggle': ['[data-testid=arrangement-detail-toggle]', 'surf'],
  'detail-start': ['[data-testid=arrangement-detail-start]', 'radius'],
  'detail-end': ['[data-testid=arrangement-detail-end]', 'radius'],
  'detail-gain-input': ['[data-testid=arrangement-detail-clip-gain-input]', 'radius'],
  'detail-fader': ['[data-testid=arrangement-detail-clip-gain-fader]', 'none'],
};
const measureSites = (sites) => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const [id, [sel]] of Object.entries(sites)) {
    const e = document.querySelector(sel); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); const parentBg = e.parentElement ? effBg(e.parentElement) : bg; let fg = parse(cs.color); const op = +cs.opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    res[id] = { present: true, disabled: e.disabled === true, pressed: e.getAttribute('aria-pressed'), selected: e.getAttribute('aria-selected'), box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, transition: `${cs.transitionProperty} ${cs.transitionDuration}`, bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), contrast: ratio(fg, bg), opacity: op, text: (e.textContent || '').trim().slice(0, 20), cls: e.className };
  }
  return res;
};
const swap = ([sites, SURF, FILL, MOTION]) => {
  window.__MOTION = MOTION;
  const saved = [];
  for (const [id, [sel, kind]] of Object.entries(sites)) {
    if (kind === 'none') continue;
    for (const e of document.querySelectorAll(sel)) {
      if (saved.some(([x]) => x === e)) continue;
      saved.push([e, e.className]);
      e.classList.remove('rounded-sm'); e.classList.add('rounded-md');
      if (kind === 'surf') {
        e.classList.remove('border-outline');
        e.classList.add(...SURF, ...window.__MOTION);
      }
    }
  }
  window.__probeSaved = saved; return saved.length;
};
const restore = () => { for (const [e, c] of window.__probeSaved || []) e.className = c; window.__probeSaved = null; };
const measureAll = () => {
  const all = [...document.querySelectorAll('button,a,input,select,[data-testid],[role]')]; const occ = {}; const res = [];
  for (const e of all) { if (e.closest('svg')) continue; const txt = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30); const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`; occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue; res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height }); }
  return res;
};
const diff = (before, after) => { const am = Object.fromEntries(after.map((a) => [a.k, a])); const bk = new Set(before.map((b) => b.k)); let max = 0; let missing = 0; for (const x of before) { const a = am[x.k]; if (!a) { missing++; continue; } max = Math.max(max, Math.abs(a.x - x.x), Math.abs(a.y - x.y), Math.abs(a.w - x.w), Math.abs(a.h - x.h)); } return { maxAbs: +max.toFixed(3), missing, added: after.filter((a) => !bk.has(a.k)).length }; };
const firstClip = async (p) => p.evaluate(() => { const c = [...document.querySelectorAll('[data-clip-id]')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 10; }); return c ? c.getAttribute('data-clip-id') : null; });
(async () => {
  const b = await L.launch(); const res = {};
  const ONLY = process.env.ONLY;
  const states0 = [
    ['D0-none-open', async (p) => { await X.openDetail(p); }],
    ['D1-clip-open', async (p) => { await X.openDetail(p); await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(800); const id = await firstClip(p); await L.selectClip(p, id); await L.blur(p); }],
    ['D2-collapsed', async (p) => { const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'true') { await t.click(); await sleep(700); } await L.blur(p); }],
  ];
  const states = ONLY ? states0.filter(([n]) => n === ONLY) : states0;
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, prep] of states) {
      const net = [];
      const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b169-${W}-${name}`, net);
      await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(400);
      const before = await p.evaluate(measureSites, SITES); const allBefore = await p.evaluate(measureAll);
      const swapped = await p.evaluate(swap, [SITES, SURF, FILL, MOTION]); await sleep(300);
      const after = await p.evaluate(measureSites, SITES); const allAfter = await p.evaluate(measureAll);
      const hover = {};
      for (const [id, [sel, kind]] of Object.entries(SITES)) { if (kind !== 'surf') continue; const loc = p.locator(sel).first(); if (!(await loc.count()) || !(await loc.isVisible())) continue; await loc.hover({ force: true }); await sleep(350); const m = await p.evaluate(measureSites, { [id]: SITES[id] }); hover[id] = { bgEff: m[id].bgEff, contrast: m[id].contrast, borderColor: m[id].borderColor }; }
      await p.mouse.move(2, 2); await sleep(300);
      await p.screenshot({ path: out.replace('.json', `-${W}-${name}-after.png`) });
      const layout = diff(allBefore, allAfter);
      await p.evaluate(restore); await sleep(200);
      const restoreCheck = diff(allBefore, await p.evaluate(measureAll));
      res[W].push({ state: name, swapped, before, after, hoverAfter: hover, layout, restoreCheck, nAll: allBefore.length, net: X.netOk ? X.netOk(net) : null });
      console.log(W, name, 'swapped', swapped, 'layout', JSON.stringify(layout), 'restore', JSON.stringify(restoreCheck), 'net', JSON.stringify(X.netOk(net)));
      for (const id of Object.keys(SITES)) { const x = before[id], y = after[id]; if (!x || !x.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, `dis=${x.disabled} sel=${x.selected} op=${x.opacity}`, 'box', JSON.stringify(x.box), x.box.join() === y.box.join() ? '=' : '-> ' + JSON.stringify(y.box), 'r', x.radius, '->', y.radius, 'border', x.borderColor, '->', y.borderColor, 'bg', JSON.stringify(x.bgEff), '->', JSON.stringify(y.bgEff), 'c', x.contrast, '->', y.contrast, 'hover', hover[id] ? `${JSON.stringify(hover[id].bgEff)} ${hover[id].contrast} ${hover[id].borderColor}` : '-', 'fillVsParent', y.fillVsParent, 'tr', x.transition); }
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
