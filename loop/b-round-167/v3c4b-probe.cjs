// B round 167 planning probe for V-3c-4b (Lane + Group header buttons). Planning data only, not a C row.
// node v3c4b-probe.cjs <out.json>. Applies the class swap in the live DOM and measures boxes, radius, fills, contrast.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const SURF = ['border-transparent', 'bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12'];
const SITES = {
  'lane-music-mute': ['[data-track-id=music] [data-testid=arrangement-track-header] button[title=Mute]', 'mix'],
  'lane-music-solo': ['[data-track-id=music] [data-testid=arrangement-track-header] button[title^=Solo]', 'mix'],
  'lane-sfx-mute': ['[data-track-id=sfx] [data-testid=arrangement-track-header] button[title=Mute]', 'mix'],
  'lane-music-fold': ['[data-track-id=music] [data-testid=arrangement-track-fold]', 'radius'],
  'lane-music-name': ['[data-track-id=music] [data-testid=arrangement-track-header] button[aria-pressed]:not([title])', 'radius'],
  'lane-music-pan-reset': ['[data-track-id=music] [data-testid=arrangement-track-pan-reset]', 'radius'],
  'video-import': ['[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)', 'import'],
  'group-mute': ['[data-testid=arrangement-group-mute]', 'mix'],
  'group-solo': ['[data-testid=arrangement-group-solo]', 'mix'],
  'group-fold': ['[data-testid=arrangement-group-fold]', 'radius'],
  'group-name': ['[data-testid=arrangement-group-name]', 'radius'],
  'group-name-input': ['[data-testid=arrangement-group-name-input]', 'radius'],
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
    res[id] = { present: true, disabled: e.disabled === true, pressed: e.getAttribute('aria-pressed'), box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, bgImage: cs.backgroundImage.slice(0, 60), bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), contrast: ratio(fg, bg), cls: e.className };
  }
  return res;
};
const swap = ([sites, SURF]) => {
  const saved = [];
  for (const [id, [sel, kind]] of Object.entries(sites)) {
    const e = document.querySelector(sel); if (!e) continue; saved.push([e, e.className]);
    e.classList.remove('rounded-sm'); e.classList.add('rounded-md');
    if (kind === 'mix') {
      const mixed = e.classList.contains('bg-gradient-to-r');
      const on = /\bborder-(accent|brand)\b/.test(e.className);
      e.classList.remove('border-outline');
      if (mixed) e.classList.add('enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12');
      else if (!on) e.classList.add(...SURF);
    } else if (kind === 'import') {
      e.classList.remove('hover:bg-brand/10'); e.classList.add('bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12');
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
const nameBtn = (id) => `[data-track-id=${id}] [data-testid=arrangement-track-header] button[aria-pressed]:not([title])`;
const makeGroup = async (p) => { await p.click(nameBtn('stems')); await sleep(150); await p.click(nameBtn('sfx'), { modifiers: ['Control'] }); await sleep(150); await p.keyboard.press('Control+g'); await sleep(400); };
(async () => {
  const b = await L.launch(); const res = {};
  const ONLY = process.env.ONLY;
  const states0 = [
    ['S0-default', async () => {}],
    ['S1-on', async (p) => {
      await makeGroup(p);
      await p.click(SITES['lane-music-mute'][0]); await sleep(150);
      await p.click(SITES['lane-music-solo'][0]); await sleep(150);
      await p.click(SITES['group-mute'][0]); await sleep(150);
      await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]'); await sleep(500);
    }],
    ['S2-group-solo-mixed', async (p) => {
      await makeGroup(p);
      const stSolo = '[data-track-id=stems] [data-testid=arrangement-track-header] button[title^=Solo]';
      if (await p.locator(stSolo).count()) { await p.click(stSolo); } await sleep(300);
    }],
    ['S3-group-solo-on', async (p) => { await makeGroup(p); await p.click(SITES['group-solo'][0]); await sleep(300); }],
    ['S4-group-rename', async (p) => { await makeGroup(p); await p.focus(SITES['group-name'][0]); await p.keyboard.press('F2'); await sleep(300); }],
  ];
  const states = ONLY ? states0.filter(([n]) => n === ONLY) : states0;
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, prep] of states) {
      const net = [];
      const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b167-${W}-${name}`, net);
      await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(400);
      const before = await p.evaluate(measureSites, SITES); const allBefore = await p.evaluate(measureAll);
      await p.evaluate(swap, [SITES, SURF]); await sleep(300);
      const after = await p.evaluate(measureSites, SITES); const allAfter = await p.evaluate(measureAll);
      const hover = {};
      if (name !== 'S4-group-rename') for (const [id, [sel]] of Object.entries(SITES)) { const loc = p.locator(sel).first(); if (!(await loc.count())) continue; await loc.hover({ force: true }); await sleep(350); const m = await p.evaluate(measureSites, { [id]: SITES[id] }); hover[id] = { bgEff: m[id].bgEff, contrast: m[id].contrast }; }
      await p.mouse.move(2, 2); await sleep(300);
      await p.screenshot({ path: out.replace('.json', `-${W}-${name}-after.png`) });
      const layout = diff(allBefore, allAfter);
      await p.evaluate(restore); await sleep(200);
      const restoreCheck = diff(allBefore, await p.evaluate(measureAll));
      res[W].push({ state: name, before, after, hoverAfter: hover, layout, restoreCheck, nAll: allBefore.length, net: X.netOk ? X.netOk(net) : null });
      console.log(W, name, 'layout', JSON.stringify(layout), 'restore', JSON.stringify(restoreCheck));
      for (const id of Object.keys(SITES)) { const x = before[id], y = after[id]; if (!x || !x.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, `pr=${x.pressed}`, 'box', JSON.stringify(x.box), x.box.join() === y.box.join() ? '=' : '-> ' + JSON.stringify(y.box), 'r', x.radius, '->', y.radius, 'border', x.borderColor, '->', y.borderColor, 'bg', JSON.stringify(x.bgEff), '->', JSON.stringify(y.bgEff), 'c', x.contrast, '->', y.contrast, 'hover', hover[id] ? `${JSON.stringify(hover[id].bgEff)} ${hover[id].contrast}` : '-', 'fillVsParent', y.fillVsParent); }
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
