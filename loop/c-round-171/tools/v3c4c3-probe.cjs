// B round 170 planning probe for V-3c-4c-3 (ArrangementExportDialog buttons + option cards, ArrangementVideoDock float buttons).
// Planning data only, not a C row. node v3c4c3-probe.cjs <out.json>
// Applies the planned class swap in the live DOM (both primary variants) and measures boxes, radius, fills, contrast.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const SURF = ['border-transparent', 'bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12'];
const FILL = ['bg-foreground/5', 'enabled:hover:bg-foreground/8', 'enabled:active:bg-foreground/12'];
const MOTION = ['motion-safe:transition-[background-color,color]!', 'motion-safe:duration-180!', 'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!', 'motion-reduce:transition-none!'];
const DLG = {
  'exp-close': ['[role=dialog] button:text-is("Done")', 'surfsec'],
  'exp-cancel': ['[data-testid=arrangement-export-cancel]', 'surfsec'],
  'exp-primary': ['[role=dialog] .flex.justify-end > button:last-child', 'primary'],
  'card-wav': ['[role=dialog] label:has([data-testid=arrangement-export-format-wav])', 'radius'],
  'card-mp3': ['[role=dialog] label:has([data-testid=arrangement-export-format-mp3])', 'radius'],
  'card-both': ['[role=dialog] label:has([data-testid=arrangement-export-format-both])', 'radius'],
  'card-video': ['[role=dialog] label:has(input[type=radio][disabled][name=arrangement-export-format])', 'radius'],
  'card-project': ['[role=dialog] label:has([data-testid=arrangement-export-scope-project])', 'radius'],
  'card-range': ['[role=dialog] label:has([data-testid=arrangement-export-scope-range])', 'radius'],
};
const DOCK = {
  'dock-expand': ['[data-testid=arrangement-video-expand]', 'radius'],
  'dock-drag': ['[data-testid=arrangement-video-drag]', 'radius'],
  'dock-close': ['[data-testid=arrangement-video-close]', 'radius'],
  'dock-return': ['[data-testid=arrangement-video-placeholder-return]', 'radius'],
  'dock-box': ['[data-testid=arrangement-video-box]', 'none'],
  'dock-placeholder': ['[data-testid=arrangement-video-placeholder]', 'none'],
};
const measureSites = (sites) => {
  const q = (sel) => { if (sel.includes(':text-is(')) { const [base, txt] = sel.split(':text-is("'); const t = txt.replace('")', ''); return [...document.querySelectorAll(base)].find((e) => e.textContent.trim() === t) || null; } return document.querySelector(sel); };
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const [id, [sel]] of Object.entries(sites)) {
    const e = q(sel); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); const parentBg = e.parentElement ? effBg(e.parentElement) : bg; let fg = parse(cs.color); let op = 1; for (let n = e; n; n = n.parentElement) op *= +getComputedStyle(n).opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    res[id] = { present: true, disabled: e.disabled === true, box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, transition: `${cs.transitionProperty} ${cs.transitionDuration}`, bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), contrast: ratio(fg, bg), opacity: +op.toFixed(3), color: cs.color, text: (e.textContent || '').trim().slice(0, 24), cls: typeof e.className === 'string' ? e.className : '' };
  }
  return res;
};
const swap = ([sites, SURF, FILL, MOTION, variant]) => {
  const q = (sel) => { if (sel.includes(':text-is(')) { const [base, txt] = sel.split(':text-is("'); const t = txt.replace('")', ''); return [...document.querySelectorAll(base)].filter((e) => e.textContent.trim() === t); } return [...document.querySelectorAll(sel)]; };
  const saved = [];
  for (const [, [sel, kind]] of Object.entries(sites)) {
    if (kind === 'none') continue;
    for (const e of q(sel)) {
      if (saved.some(([x]) => x === e)) continue;
      saved.push([e, e.className]);
      e.classList.remove('rounded-sm'); e.classList.add('rounded-md');
      if (kind === 'surfsec') { e.classList.remove('border-outline', 'hover:border-outline-hover'); e.classList.add(...SURF, ...MOTION); }
      if (kind === 'primary') {
        if (variant === 'exportLook') { e.classList.remove('bg-brand', 'text-brand-foreground'); e.classList.add(...FILL, 'text-brand', ...MOTION); }
        else { e.classList.add(...MOTION); }
      }
    }
  }
  window.__probeSaved = saved; return saved.length;
};
const restore = () => { for (const [e, c] of window.__probeSaved || []) e.className = c; window.__probeSaved = null; };
const measureAll = () => {
  const all = [...document.querySelectorAll('button,a,input,select,label,[data-testid],[role]')]; const occ = {}; const res = [];
  for (const e of all) { if (e.closest('svg')) continue; const txt = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30); const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`; occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue; res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height }); }
  return res;
};
const diff = (before, after) => { const am = Object.fromEntries(after.map((a) => [a.k, a])); const bk = new Set(before.map((b) => b.k)); let max = 0; let missing = 0; for (const x of before) { const a = am[x.k]; if (!a) { missing++; continue; } max = Math.max(max, Math.abs(a.x - x.x), Math.abs(a.y - x.y), Math.abs(a.w - x.w), Math.abs(a.h - x.h)); } return { maxAbs: +max.toFixed(3), missing, added: after.filter((a) => !bk.has(a.k)).length }; };
const openDialog = async (p) => { await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(600); };
(async () => {
  const b = await L.launch(); const res = {};
  const states = [
    ['E0-empty-dialog', DLG, async (p) => { await openDialog(p); }],
    ['E1-clip-dialog', DLG, async (p) => { await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(800); await openDialog(p); }],
    ['V0-dock-video', DOCK, async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p); }],
    ['V1-dock-floating', DOCK, async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await p.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900); await L.blur(p); }],
  ];
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, sites, prep] of states) {
      for (const variant of name.startsWith('E') ? ['exportLook', 'keepFill'] : ['radius']) {
        const net = [];
        const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `b170-${W}-${name}-${variant}`, net);
        await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(400);
        const before = await p.evaluate(measureSites, sites); const allBefore = await p.evaluate(measureAll);
        const swapped = await p.evaluate(swap, [sites, SURF, FILL, MOTION, variant]); await sleep(300);
        const after = await p.evaluate(measureSites, sites); const allAfter = await p.evaluate(measureAll);
        const hover = {};
        for (const [id, [sel, kind]] of Object.entries(sites)) {
          if (kind === 'none' || kind === 'radius' && !id.startsWith('dock')) continue;
          const loc = sel.includes(':text-is(') ? p.locator('[role=dialog] button', { hasText: /^Done$/ }).last() : p.locator(sel).first();
          if (!(await loc.count()) || !(await loc.isVisible())) continue;
          await loc.hover({ force: true }); await sleep(350);
          const m = await p.evaluate(measureSites, { [id]: sites[id] }); hover[id] = { bgEff: m[id].bgEff, contrast: m[id].contrast, color: m[id].color };
        }
        await p.mouse.move(2, 2); await sleep(300);
        await p.screenshot({ path: out.replace('.json', `-${W}-${name}-${variant}-after.png`) });
        const layout = diff(allBefore, allAfter);
        await p.evaluate(restore); await sleep(200);
        const restoreCheck = diff(allBefore, await p.evaluate(measureAll));
        res[W].push({ state: name, variant, swapped, before, after, hoverAfter: hover, layout, restoreCheck, nAll: allBefore.length, fonts: log.fontsReady, net: X.netOk(net) });
        console.log(W, name, variant, 'swapped', swapped, 'layout', JSON.stringify(layout), 'restore', JSON.stringify(restoreCheck), 'fonts', JSON.stringify(log.fontsReady), 'net', JSON.stringify(X.netOk(net)));
        for (const id of Object.keys(sites)) { const x = before[id], y = after[id]; if (!x || !x.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, `dis=${x.disabled} op=${x.opacity}`, 'box', JSON.stringify(x.box), x.box.join() === y.box.join() ? '=' : '-> ' + JSON.stringify(y.box), 'r', x.radius, '->', y.radius, 'border', x.borderColor, '->', y.borderColor, 'bg', JSON.stringify(x.bgEff), '->', JSON.stringify(y.bgEff), 'c', x.contrast, '->', y.contrast, 'hover', hover[id] ? `${JSON.stringify(hover[id].bgEff)} ${hover[id].contrast}` : '-', 'fvp', y.fillVsParent, 'tr', y.transition); }
        await ctx.close();
      }
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
