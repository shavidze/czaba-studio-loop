// B round 162 planning probe for V-3c-3a (video dock ⠿ ⤢ ✕). node v3c3a-probe.cjs <out.json>
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const SVG = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" style="flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-probe="${s}"><path d="M4 4h16v16H4z"/></svg>`;
const measure = () => {
  const root = document.querySelector('[data-testid=arrangement-video-dock]')?.closest('section') || document.querySelector('section:has([data-testid=arrangement-video-expand])') || document.body;
  const all = [...document.querySelectorAll('button,[data-testid],[role]')];
  const occ = {}; const res = [];
  for (const e of all) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    const txt = (e.textContent || '').trim().replace(/[⠿⤢✕]/gu, '').replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};
const metrics = () => ['arrangement-video-drag', 'arrangement-video-expand', 'arrangement-video-close'].map((id) => {
  const e = document.querySelector(`[data-testid=${id}]`); if (!e) return { id, present: false };
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(e); const gr = rg.getBoundingClientRect();
  return { id, present: true, glyph: e.textContent.trim(), font: cs.fontSize, family: cs.fontFamily.slice(0, 40), color: cs.color, box: [+r.width.toFixed(2), +r.height.toFixed(2)], glyphBox: [+gr.width.toFixed(3), +gr.height.toFixed(3)], name: e.getAttribute('aria-label') };
});
const apply = (s10) => { for (const id of ['arrangement-video-drag', 'arrangement-video-expand', 'arrangement-video-close']) { const e = document.querySelector(`[data-testid=${id}]`); if (e) e.innerHTML = s10; } };
const centres = () => [...document.querySelectorAll('svg[data-probe]')].map((s) => { const h = s.parentElement; const sr = s.getBoundingClientRect(); const hr = h.getBoundingClientRect(); return { host: h.getAttribute('data-testid'), svg: [sr.width, sr.height], dx: +((sr.x + sr.width / 2) - (hr.x + hr.width / 2)).toFixed(3), dy: +((sr.y + sr.height / 2) - (hr.y + hr.height / 2)).toFixed(3), hit: (() => { const t = document.elementFromPoint(sr.x + sr.width / 2, sr.y + sr.height / 2); return t ? (t.closest('button')?.getAttribute('data-testid') + '/' + t.tagName) : null; })() }; });
(async () => {
  const b = await L.launch(); const res = {};
  const states = [
    ['D0-empty', async () => {}],
    ['D1-video', async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p); }],
    ['D2-expanded', async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await p.click('[data-testid=arrangement-video-expand]'); await sleep(600); await L.blur(p); }],
  ];
  for (const W of [1440, 1280]) {
    res[W] = [];
    for (const [name, prep] of states) {
      const net = [];
      const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b162-${W}-${name}`, net);
      await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(500);
      const m = await p.evaluate(metrics); const before = await p.evaluate(measure);
      await p.evaluate(apply, SVG(10)); await sleep(200);
      const after = await p.evaluate(measure); const cen = await p.evaluate(centres);
      const am = Object.fromEntries(after.map((a) => [a.k, a]));
      const d = before.map((x) => { const a = am[x.k]; if (!a) return { k: x.k, missing: true }; return { k: x.k, dx: +(a.x - x.x).toFixed(3), dy: +(a.y - x.y).toFixed(3), dw: +(a.w - x.w).toFixed(3), dh: +(a.h - x.h).toFixed(3) }; });
      const moved = d.filter((r) => r.missing || [r.dx, r.dy, r.dw, r.dh].some((v) => Math.abs(v) > 0.01));
      const maxAbs = Math.max(0, ...d.filter((r) => !r.missing).flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)]));
      res[W].push({ state: name, n: before.length, metrics: m, maxAbsEdgeDelta: +maxAbs.toFixed(3), moved, centres: cen, net: X.netOk ? X.netOk(net) : null, before });
      await p.screenshot({ path: out.replace('.json', `-${W}-${name}.png`) });
      console.log(W, name, 'n', before.length, 'max', maxAbs.toFixed(3), 'moved', JSON.stringify(moved).slice(0, 400));
      console.log('  metrics', JSON.stringify(m)); console.log('  centres', JSON.stringify(cen));
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
