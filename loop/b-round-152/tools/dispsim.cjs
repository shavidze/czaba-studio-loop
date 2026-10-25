// B round 152 planning probe (read-only, in-page style only): simulate V-2b label + display rules, measure bbox deltas and clipping.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
function snap() {
  const out = {}; const seen = {};
  for (const e of document.querySelectorAll('.studio-container *, [role=dialog] *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    const tid = e.getAttribute('data-testid'); if (!tid && !own && !['BUTTON', 'INPUT', 'SELECT'].includes(e.tagName)) continue;
    const base = (tid || '') + '|' + e.tagName + '|' + own.slice(0, 24); seen[base] = (seen[base] || 0) + 1; const k = base + '#' + seen[base];
    out[k] = { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), clip: e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' };
  }
  return out;
}
function mark() {
  const sel = { panelTitle: ['[data-testid=arrangement-library] h2', '[data-testid=arrangement-detail-panel] h2'], trackName: ['[data-testid=arrangement-track-header] button.truncate', '[data-testid=arrangement-group-name]'], libraryName: ['[data-testid=arrangement-library-option-title]'], selectedClipName: ['[data-testid=arrangement-detail-content] p.truncate'] };
  const found = [];
  for (const [role, list] of Object.entries(sel)) for (const q of list) for (const e of document.querySelectorAll(q)) { e.dataset.bLabel = role; found.push(role + ':' + e.textContent.trim().slice(0, 16)); }
  return found;
}
function styleOn() { const st = document.createElement('style'); st.id = 'bsim'; st.textContent = '[data-b-label]{font-size:16px!important}'; document.head.appendChild(st); }
function diff(a, b) { const rows = []; for (const k of Object.keys(a)) { if (!b[k]) { rows.push({ k, missing: true }); continue; } const d = { dx: +(b[k].x - a[k].x).toFixed(1), dy: +(b[k].y - a[k].y).toFixed(1), dw: +(b[k].w - a[k].w).toFixed(1), dh: +(b[k].h - a[k].h).toFixed(1) }; if (Math.max(...Object.values(d).map(Math.abs)) > 1 || b[k].clip !== a[k].clip) rows.push({ k, ...d, clipBefore: a[k].clip, clipAfter: b[k].clip, right: +(b[k].x + b[k].w).toFixed(1) }); } for (const k of Object.keys(b)) if (!a[k]) rows.push({ k, added: true }); return rows; }
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(300);
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}
(async () => {
  const b = await L.launch(); const res = { vp: W, states: {} };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `bsim-${W}`, net); await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
    for (const st of ['S0', 'S1']) {
      if (st === 'S1') await buildS1(p);
      await p.evaluate(() => document.getElementById('bsim')?.remove());
      const found = await p.evaluate(mark); await sleep(200);
      const a = await p.evaluate(snap); await p.evaluate(styleOn); await sleep(300);
      const bb = await p.evaluate(snap); await p.screenshot({ path: path.join(L.SHOTS, `dispsim-${st}-${W}.png`) });
      const lab = await p.evaluate(() => [...document.querySelectorAll('[data-b-label]')].map((e) => { const r = e.getBoundingClientRect(); const par = e.parentElement; return { t: e.dataset.bLabel, w: +r.width.toFixed(1), h: +r.height.toFixed(1), right: +(r.x + r.width).toFixed(1), parentClip: par.scrollWidth > par.clientWidth + 1, parentRight: +(par.getBoundingClientRect().right).toFixed(1) }; }));
      res.states[st] = { found, labels: lab, moves: diff(a, bb) };
      await p.evaluate(() => document.getElementById('bsim')?.remove());
    }
  } catch (e) { res.error = String(e.stack || e); }
  fs.writeFileSync(path.join(L.OUT, `dispsim-${W}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ vp: W, err: res.error, s: Object.fromEntries(Object.entries(res.states).map(([k, v]) => [k, { found: v.found, labels: v.labels, nMoves: v.moves.length, vert: v.moves.filter((m) => Math.abs(m.dy || 0) > 1 || Math.abs(m.dh || 0) > 1).length, clipChanged: v.moves.filter((m) => m.clipAfter && !m.clipBefore).map((m) => m.k), missing: v.moves.filter((m) => m.missing || m.added).length, maxRight: Math.max(0, ...v.moves.map((m) => m.right || 0)) }])) }, null, 1));
  await b.close();
})();
