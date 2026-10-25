// C round 162: compare d6 S0/S1/S2 with c-round-161 reference after the 6 V-3c-2 renames (exact full-key lookup).
const fs = require('fs'); const path = require('path');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const map = JSON.parse(fs.readFileSync(path.join(L, 'b-round-161-r162-d6-key-renames.json'))).renames;
const out = {};
const FOCUS = /arrangement-track-header|arrangement-group|clip@|Your own video|arrangement-track-fold|tid:arrangement-selected-clip/;
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(L, `c-round-161/out/d6/d6-${W}-r1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(L, `c-round-162/out/d6/d6-${W}-r1.json`)));
  const r = { vp: W, states: {}, collision: [] };
  for (const S of ['S0', 'S1', 'S2']) {
    const rm = new Map(); const renamedUsed = [];
    for (const e of ref.states[S].elements) { const nk = map[e.key] || e.key; if (nk !== e.key) renamedUsed.push(`${e.key} -> ${nk}`); if (rm.has(nk)) r.collision.push(`${S}:${nk}`); rm.set(nk, e); }
    const cm = new Map(); for (const e of cur.states[S].elements) { if (cm.has(e.key)) r.collision.push(`${S}:cur:${e.key}`); cm.set(e.key, e); }
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    let maxD = 0, maxKey = null; const over = []; const focus = [];
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const d = { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h }; const m = Math.max(...Object.values(d).map(Math.abs)); if (m > maxD) { maxD = m; maxKey = k; } if (m > 1) over.push({ k, ...d }); if (FOCUS.test(k)) focus.push({ k, ref: [a.x, a.y, a.w, a.h], cur: [b.x, b.y, b.w, b.h], max: m }); }
    r.states[S] = { refN: rm.size, curN: cm.size, renamedUsed, missing, added, maxDelta: maxD, maxKey, over1px: over, focus };
  }
  out[W] = r;
}
fs.writeFileSync(path.join(L, 'c-round-162/out/rv1-v3c2.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const S of ['S0', 'S1', 'S2']) { const s = out[W].states[S]; console.log(W, S, 'ref', s.refN, 'cur', s.curN, 'renamed', JSON.stringify(s.renamedUsed), 'missing', JSON.stringify(s.missing), 'added', JSON.stringify(s.added), 'max', s.maxDelta, s.maxKey, 'over1', s.over1px.length, 'focusN', s.focus.length, 'focusMax', Math.max(0, ...s.focus.map((f) => f.max))); }
console.log('collisions', JSON.stringify(out[1440].collision), JSON.stringify(out[1280].collision));
