const fs = require('fs'); const path = require('path');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const map = JSON.parse(fs.readFileSync(path.join(L, 'b-round-160-r161-d6-key-renames.json'))).renames;
const ren = (k) => { const m = /^(.*?)((?:\|[^#]*)?)(#\d+)$/.exec(k); if (!m) return k; for (const [o, n] of Object.entries(map)) { const ob = o.replace(/#\d+$/, ''), oi = /#\d+$/.exec(o)[0]; if (m[1] === ob && m[3] === oi) return n.replace(/#\d+$/, '') + m[2] + m[3]; } return k; };
const LIB = /arrangement-library|al:.* — (Fold|Unfold)|button:Add|Collapse library|Expand library|Clear search/;
const out = {};
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(L, `c-round-160/out/d6/d6-${W}-r1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(L, `c-round-161/out/d6/d6-${W}-r1.json`)));
  const r = { vp: W, states: {} };
  for (const S of ['S0', 'S1', 'S2']) {
    const rm = new Map(); const renamedUsed = [];
    for (const e of ref.states[S].elements) { const nk = ren(e.key); if (nk !== e.key) renamedUsed.push(`${e.key} -> ${nk}`); if (rm.has(nk)) r.collision = (r.collision || []).concat(`${S}:${nk}`); rm.set(nk, e); }
    const cm = new Map(); for (const e of cur.states[S].elements) { if (cm.has(e.key)) r.collision = (r.collision || []).concat(`${S}:cur:${e.key}`); cm.set(e.key, e); }
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    let maxD = 0, maxKey = null; const over = []; const lib = [];
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const d = { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h }; const m = Math.max(...Object.values(d).map(Math.abs)); if (m > maxD) { maxD = m; maxKey = k; } if (m > 1) over.push({ k, ...d }); if (LIB.test(k)) lib.push({ k, cur: [b.x, b.y, b.w, b.h], ...d }); }
    r.states[S] = { refN: rm.size, curN: cm.size, renamedUsed, missing, added, maxDelta: maxD, maxKey, over1px: over, lib };
  }
  out[W] = r;
}
fs.writeFileSync(path.join(L, 'c-round-161/out/rv1-v3c1.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const S of ['S0', 'S1', 'S2']) { const s = out[W].states[S]; console.log(W, S, 'ref', s.refN, 'cur', s.curN, 'renamed', JSON.stringify(s.renamedUsed), 'missing', JSON.stringify(s.missing), 'added', JSON.stringify(s.added), 'max', s.maxDelta, s.maxKey, 'over1', s.over1px.length, 'libKeys', s.lib.length, 'libMax', Math.max(0,...s.lib.map(x=>Math.max(Math.abs(x.dx),Math.abs(x.dy),Math.abs(x.dw),Math.abs(x.dh))))); }
console.log('collisions', JSON.stringify(out[1440].collision || null), JSON.stringify(out[1280].collision || null));
console.log(out[1440].states.S0.lib.map(x=>x.k).join(' ; '));
