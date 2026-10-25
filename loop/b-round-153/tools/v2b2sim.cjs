// B round 153 planning probe (read-only, in-page style only): simulate V-2b-2 (weights 600/700 -> 500; remaining sans numerals -> IBM Plex Mono) and measure bbox deltas / clipping.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
const GROUPS = {
  weight: null,
  monoCore: [
    '[data-testid=arrangement-zoom-readout]',
    '[data-testid=arrangement-library-tree] button > span.ml-auto',
    '[data-testid=arrangement-library-folder] > span.ml-auto',
    '[data-testid=arrangement-library-list] span.flex.gap-2 > span:nth-child(2)',
    '[data-testid=arrangement-library-preview] span.shrink-0.text-xs',
    '[data-testid=arrangement-library-playhead]',
    '[data-testid=arrangement-ruler] span.absolute.tabular-nums',
    'span.absolute.leading-none.tabular-nums',
    '[data-testid=arrangement-tempo-input] ~ span.tabular-nums',
    '[data-testid=arrangement-track-pan-reset]',
  ],
  monoGain: ['[data-testid=arrangement-detail-clip-gain-reset]'],
  monoSel: ['[data-testid=arrangement-grid-division]', '[data-testid=arrangement-waveform-zoom]'],
};
function snap() {
  const out = {}; const seen = {};
  for (const e of document.querySelectorAll('.studio-container *, [role=dialog] *')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    const tid = e.getAttribute('data-testid'); if (!tid && !own && !['BUTTON', 'INPUT', 'SELECT'].includes(e.tagName)) continue;
    const base = (tid || '') + '|' + e.tagName + '|' + own.slice(0, 24); seen[base] = (seen[base] || 0) + 1; const k = base + '#' + seen[base];
    const cs = getComputedStyle(e);
    out[k] = { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), clip: e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible', ell: cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1 };
  }
  return out;
}
function apply(arg) {
  const [name, sels] = arg; let n = 0; const hits = [];
  if (name === 'weight') {
    for (const e of document.querySelectorAll('.studio-container *, [role=dialog] *')) { const fw = +getComputedStyle(e).fontWeight; if (fw >= 600 && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) { e.dataset.bSim = '1'; n++; hits.push(e.textContent.trim().slice(0, 20) + '|' + fw + '|' + (e.closest('[data-testid]')?.dataset.testid || '-')); } }
    const st = document.createElement('style'); st.id = 'bsim'; st.textContent = '[data-b-sim]{font-weight:500 !important}'; document.head.appendChild(st);
  } else {
    for (const s of sels) for (const e of document.querySelectorAll(s)) { e.dataset.bSim = '1'; n++; hits.push(s.slice(0, 40) + '=' + e.textContent.trim().slice(0, 14)); }
    const st = document.createElement('style'); st.id = 'bsim'; st.textContent = "[data-b-sim]{font-family:'IBM Plex Mono', ui-monospace, monospace !important}"; document.head.appendChild(st);
  }
  return { n, hits: [...new Set(hits)].slice(0, 40) };
}
function clear() { document.getElementById('bsim')?.remove(); for (const e of document.querySelectorAll('[data-b-sim]')) delete e.dataset.bSim; }
function diff(a, b) { const rows = []; for (const k of Object.keys(a)) { if (!b[k]) { rows.push({ k, missing: true }); continue; } const d = { dx: +(b[k].x - a[k].x).toFixed(1), dy: +(b[k].y - a[k].y).toFixed(1), dw: +(b[k].w - a[k].w).toFixed(1), dh: +(b[k].h - a[k].h).toFixed(1) }; if (Math.max(...Object.values(d).map(Math.abs)) > 1 || b[k].clip !== a[k].clip || b[k].ell !== a[k].ell) rows.push({ k, ...d, clipBefore: a[k].clip, clipAfter: b[k].clip, ellAfter: b[k].ell, right: +(b[k].x + b[k].w).toFixed(1) }); } for (const k of Object.keys(b)) if (!a[k]) rows.push({ k, added: true }); return rows; }
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(300);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}
(async () => {
  const b = await L.launch(); const res = { vp: W, states: {} };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `b153-${W}`, net); await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
    for (const st of ['S0', 'S1', 'S2']) {
      if (st === 'S1') await buildS1(p);
      if (st === 'S2') { await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400); }
      res.states[st] = {};
      for (const [g, sels] of Object.entries(GROUPS)) {
        await p.evaluate(clear); await sleep(150);
        const a = await p.evaluate(snap); const hit = await p.evaluate(apply, [g, sels]); await sleep(300);
        const bb = await p.evaluate(snap); if (hit.n) await p.screenshot({ path: path.join(L.SHOTS, `v2b2sim-${st}-${g}-${W}.png`) });
        res.states[st][g] = { hit, moves: diff(a, bb) }; await p.evaluate(clear);
      }
    }
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.OUT, `v2b2sim-${W}.json`), JSON.stringify(res, null, 1));
  const sum = {}; for (const [st, gs] of Object.entries(res.states)) for (const [g, v] of Object.entries(gs)) sum[st + ':' + g] = { n: v.hit.n, moves: v.moves.length, vert: v.moves.filter((m) => Math.abs(m.dy || 0) > 1 || Math.abs(m.dh || 0) > 1).map((m) => m.k + ` dy${m.dy} dh${m.dh}`).slice(0, 8), clipNew: v.moves.filter((m) => (m.clipAfter && !m.clipBefore) || m.ellAfter).map((m) => m.k), missing: v.moves.filter((m) => m.missing || m.added).length, maxAbsDx: Math.max(0, ...v.moves.map((m) => Math.abs(m.dx || 0))), maxRight: Math.max(0, ...v.moves.map((m) => m.right || 0)) };
  console.log(JSON.stringify({ vp: W, err: res.error, net: res.net.ok, sum }, null, 1)); await b.close();
})();
