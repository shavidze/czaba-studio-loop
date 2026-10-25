// B round 166 planning probe for V-3c-4a (toolbar button surfaces: border -> fill, rounded-sm -> rounded-md; fields radius only).
// node v3c4a-probe.cjs <out.json>. Planning data only, not a C row. Applies the class swap in the live DOM (classes already compiled by the transport recipe).
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const BUTTONS = ['arrangement-snap-toggle', 'arrangement-envelope-toggle', 'arrangement-metronome-toggle', 'arrangement-marker-add', 'arrangement-marker-prev', 'arrangement-marker-next', 'arrangement-master-peak', 'MASTER-MUTE'];
const FIELDS = ['arrangement-tempo-input', 'arrangement-grid-division', 'arrangement-waveform-zoom'];
const pick = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`));
const measureSites = ([buttons, fields]) => {
  const pickIn = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`));
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const id of [...buttons, ...fields]) {
    const e = pickIn(id); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); let fg = parse(cs.color); const op = +cs.opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    res[id] = { present: true, disabled: e.disabled === true, box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, bgOwn: cs.backgroundColor, bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), color: cs.color, opacity: op, contrast: ratio(fg, bg), cls: e.className };
  }
  return res;
};
const swap = ([buttons, fields]) => {
  const pickIn = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`));
  const saved = [];
  for (const id of buttons) {
    const e = pickIn(id); if (!e) continue; saved.push([e, e.className]);
    const on = /\bborder-(accent|brand|destructive)\b/.test(e.className);
    e.classList.remove('rounded-sm', 'border-outline', 'hover:border-outline-hover'); e.classList.add('rounded-md');
    if (!on) e.classList.add('border-transparent', 'bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12');
  }
  for (const id of fields) { const e = pickIn(id); if (!e) continue; saved.push([e, e.className]); e.classList.remove('rounded-sm'); e.classList.add('rounded-md'); }
  window.__probeSaved = saved; return saved.length;
};
const restore = () => { for (const [e, c] of window.__probeSaved || []) e.className = c; window.__probeSaved = null; };
const measureAll = () => {
  const all = [...document.querySelectorAll('button,a,input,select,[data-testid],[role]')]; const occ = {}; const res = [];
  for (const e of all) { if (e.closest('svg')) continue; const txt = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30); const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`; occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue; res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height }); }
  return res;
};
const diff = (before, after) => { const am = Object.fromEntries(after.map((a) => [a.k, a])); const bk = new Set(before.map((b) => b.k)); let max = 0; let missing = 0; for (const x of before) { const a = am[x.k]; if (!a) { missing++; continue; } max = Math.max(max, Math.abs(a.x - x.x), Math.abs(a.y - x.y), Math.abs(a.w - x.w), Math.abs(a.h - x.h)); } return { maxAbs: +max.toFixed(3), missing, added: after.filter((a) => !bk.has(a.k)).length }; };
(async () => {
  const b = await L.launch(); const res = {};
  const states = [
    ['S0-default', async () => {}],
    ['S3-on', async (p) => {
      await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150);
      await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(150);
      await p.fill('[data-testid=arrangement-tempo-input]', '120'); await p.press('[data-testid=arrangement-tempo-input]', 'Enter'); await sleep(250);
      await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(150);
      await p.click('button[aria-label="Master Mute"]'); await sleep(150);
    }],
  ];
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, prep] of states) {
      const net = [];
      const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b166-${W}-${name}`, net);
      await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(400);
      const before = await p.evaluate(measureSites, [BUTTONS, FIELDS]); const allBefore = await p.evaluate(measureAll);
      await p.evaluate(swap, [BUTTONS, FIELDS]); await sleep(300);
      const after = await p.evaluate(measureSites, [BUTTONS, FIELDS]); const allAfter = await p.evaluate(measureAll);
      const hover = {};
      for (const id of BUTTONS) { const sel = id === 'MASTER-MUTE' ? 'button[aria-label="Master Mute"]' : `[data-testid=${id}]`; const loc = p.locator(sel).first(); if (!(await loc.count())) continue; await loc.hover({ force: true }); await sleep(350); const m = await p.evaluate(measureSites, [[id], []]); hover[id] = { bgEff: m[id].bgEff, color: m[id].color, contrast: m[id].contrast }; }
      await p.mouse.move(2, 2); await sleep(300);
      await p.screenshot({ path: out.replace('.json', `-${W}-${name}-after.png`) });
      const layout = diff(allBefore, allAfter);
      await p.evaluate(restore); await sleep(200);
      const restoreCheck = diff(allBefore, await p.evaluate(measureAll));
      res[W].push({ state: name, before, after, hoverAfter: hover, layout, restoreCheck, nAll: allBefore.length, net: X.netOk ? X.netOk(net) : null });
      console.log(W, name, 'layout', JSON.stringify(layout), 'restore', JSON.stringify(restoreCheck));
      for (const id of [...BUTTONS, ...FIELDS]) { const x = before[id], y = after[id]; if (!x || !x.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, `dis=${x.disabled}`, 'box', JSON.stringify(x.box), '->', JSON.stringify(y.box), 'r', x.radius, '->', y.radius, 'border', x.borderColor, '->', y.borderColor, 'bg', JSON.stringify(x.bgEff), '->', JSON.stringify(y.bgEff), 'c', x.contrast, '->', y.contrast, 'hover', hover[id] ? hover[id].contrast : '-'); }
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
