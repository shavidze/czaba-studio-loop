// B round 161 planning probe for V-3c-2 (lane / group header / clip glyphs). node v3c2-probe.cjs <out.json>
// Fresh context per state. Measures glyph metrics, then swaps each glyph for an svg of the planned size and compares boxes.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const SVG = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" style="flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-probe="${s}"><path d="M4 4h16v16H4z"/></svg>`;

const measure = () => {
  const root = document.querySelector('.studio-container') || document.body;
  const sel = 'button,input,[role],[data-testid],[data-clip-id],[data-track-id],[data-group-id]';
  const extra = [...root.querySelectorAll('[data-testid=arrangement-track-header] *, [data-testid=arrangement-group-header] *, [data-clip-id] > div, [data-clip-id] > div > *')];
  const els = new Set([...root.querySelectorAll(sel), ...extra]);
  const occ = {}; const res = [];
  for (const e of els) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (e.matches('svg[data-probe]')) continue;
    const c = e.closest('[data-track-id],[data-group-id],[data-clip-id]');
    const ctx = c && c !== e ? (c.dataset.clipId ? `clip@${c.dataset.clipStart}` : c.dataset.groupId ? 'group' : `track:${c.dataset.trackId}`) : '';
    const txt = (e.textContent || '').trim().replace(/[▶◀×▾▸■＋⌫▣⠿]/gu, '').replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').replace(/[＋]\s?/u, '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    const k0 = `${base}|${ctx}`; occ[k0] = (occ[k0] || 0) + 1;
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    res.push({ k: `${k0}#${occ[k0]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};

const metrics = () => {
  const adv = (el, ch) => { const r = document.createRange(); for (const n of el.childNodes) { if (n.nodeType === 3 && n.textContent.includes(ch)) { const i = n.textContent.indexOf(ch); r.setStart(n, i); r.setEnd(n, i + ch.length); return +r.getBoundingClientRect().width.toFixed(3); } } return null; };
  const box = (e) => { const r = e.getBoundingClientRect(); return [+r.width.toFixed(2), +r.height.toFixed(2)]; };
  const fs_ = (e) => getComputedStyle(e).fontSize;
  const o = {};
  const lf = document.querySelector('[data-testid=arrangement-track-fold]'); if (lf) o.laneFold = { font: fs_(lf), glyph: lf.textContent, adv: adv(lf, lf.textContent.trim()), box: box(lf) };
  const vb = [...document.querySelectorAll('[data-track-id=video] [data-testid=arrangement-track-header] button')].find((b) => b.textContent.includes('＋'));
  if (vb) { const full = vb.textContent.trim() !== '＋'; o.videoImport = { compact: !full, font: fs_(vb), text: vb.textContent, advPlus: adv(vb, '＋'), advSpace: full ? (() => { const r = document.createRange(); const n = vb.firstChild; r.setStart(n, 1); r.setEnd(n, 2); return +r.getBoundingClientRect().width.toFixed(3); })() : null, box: box(vb), display: getComputedStyle(vb).display }; }
  const gf = document.querySelector('[data-testid=arrangement-group-fold]'); if (gf) { const ps = getComputedStyle(gf, '::before'); o.groupFold = { font: fs_(gf), before: ps.content, beforeW: ps.width, box: box(gf) }; }
  const gn = document.querySelector('[data-testid=arrangement-group-name] span[aria-hidden]'); if (gn) o.groupMark = { font: fs_(gn), adv: adv(gn, '▣'), box: box(gn), gap: getComputedStyle(gn.parentElement).columnGap };
  o.clipMarks = [...document.querySelectorAll('[data-clip-id] > div > span[aria-hidden]')].map((s) => ({ clip: s.closest('[data-clip-id]').dataset.clipStart, kind: s.closest('[data-clip-id]').dataset.clipKind, glyph: s.textContent, font: fs_(s), adv: adv(s, s.textContent), box: box(s), gap: getComputedStyle(s.parentElement).columnGap }));
  return o;
};

const apply = ([s12, s10, gapFull]) => {
  for (const b of document.querySelectorAll('[data-testid=arrangement-track-fold]')) b.innerHTML = s12;
  for (const b of document.querySelectorAll('[data-track-id=video] [data-testid=arrangement-track-header] button')) {
    if (!b.textContent.includes('＋')) continue;
    if (b.textContent.trim() === '＋') b.innerHTML = s10;
    else { b.innerHTML = `${s10}<span>Your own video</span>`; b.style.display = 'flex'; b.style.alignItems = 'center'; b.style.gap = gapFull; }
  }
  for (const b of document.querySelectorAll('[data-testid=arrangement-group-fold]')) { b.className = b.className.split(' ').filter((c) => !c.startsWith('before:content')).join(' '); b.innerHTML = s12; }
  for (const s of document.querySelectorAll('[data-testid=arrangement-group-name] span[aria-hidden]')) s.outerHTML = s10;
  for (const s of document.querySelectorAll('[data-clip-id] > div > span[aria-hidden]')) s.outerHTML = s10;
};

const centres = () => [...document.querySelectorAll('svg[data-probe]')].map((s) => { const h = s.parentElement; const sr = s.getBoundingClientRect(); const hr = h.getBoundingClientRect(); return { host: h.getAttribute('data-testid') || h.getAttribute('aria-label') || h.tagName, svg: [sr.width, sr.height], dCx: +((sr.x + sr.width / 2) - (hr.x + hr.width / 2)).toFixed(2), dCy: +((sr.y + sr.height / 2) - (hr.y + hr.height / 2)).toFixed(2) }; });

async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0);
  await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
  await X.key(p, 'Control+g');
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}

(async () => {
  const b = await L.launch(); const res = { gapVariants: {} };
  const states = [
    ['S0', async () => {}],
    ['S0-folded', async (p) => { await p.click('[data-track-id=music] [data-testid=arrangement-track-fold]'); await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]'); await sleep(400); await L.blur(p); await p.mouse.move(2, 2); }],
    ['S1', async (p) => { await buildS1(p); }],
    ['S1-group-collapsed', async (p) => { await buildS1(p); await p.click('[data-testid=arrangement-group-fold]'); await sleep(400); await L.blur(p); await p.mouse.move(2, 2); }],
  ];
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const gap of ['2px', '4px']) {
      for (const [name, prep] of states) {
        if (gap === '4px' && name !== 'S0' && name !== 'S1') continue;
        const net = [];
        const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b161-${W}-${name}`, net);
        await p.mouse.move(2, 2); await sleep(300);
        await prep(p); await sleep(400);
        const m = await p.evaluate(metrics);
        const before = await p.evaluate(measure);
        await p.evaluate(apply, [SVG(12), SVG(10), gap]);
        await sleep(200);
        const after = await p.evaluate(measure);
        const cen = await p.evaluate(centres);
        const am = Object.fromEntries(after.map((a) => [a.k, a]));
        const d = before.map((x) => { const a = am[x.k]; if (!a) return { k: x.k, missing: true }; return { k: x.k, dx: +(a.x - x.x).toFixed(3), dy: +(a.y - x.y).toFixed(3), dw: +(a.w - x.w).toFixed(3), dh: +(a.h - x.h).toFixed(3) }; });
        const moved = d.filter((r) => r.missing || [r.dx, r.dy, r.dw, r.dh].some((v) => Math.abs(v) > 0.01));
        const maxAbs = Math.max(0, ...d.filter((r) => !r.missing).flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)]));
        const row = { state: name, gapFull: gap, n: before.length, metrics: m, maxAbsEdgeDelta: +maxAbs.toFixed(3), moved, centres: cen, before };
        if (gap === '2px') { res[W].push(row); await p.screenshot({ path: out.replace('.json', `-${W}-${name}.png`) }); }
        else res.gapVariants[`${W}-${name}`] = { maxAbsEdgeDelta: row.maxAbsEdgeDelta, moved };
        console.log(W, name, gap, 'n', before.length, 'max', row.maxAbsEdgeDelta, 'moved', moved.length, JSON.stringify(moved).slice(0, 700));
        console.log('  metrics', JSON.stringify(m).slice(0, 900));
        await ctx.close();
      }
    }
  }
  await b.close();
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
