// C round 160: compare d6 S0/S1/S2 with b-round-157 reference after the 6 V-3b renames.
const fs = require('fs'); const path = require('path');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const map = JSON.parse(fs.readFileSync(path.join(L, 'b-round-159-r160-d6-key-renames.json'))).renames;
const ren = (k) => { const m = /^(.*?)((?:\|[^#]*)?)(#\d+)$/.exec(k); if (!m) return k; for (const [o, n] of Object.entries(map)) { const ob = o.replace(/#\d+$/, ''), oi = /#\d+$/.exec(o)[0]; if (m[1] === ob && m[3] === oi) return n.replace(/#\d+$/, '') + m[2] + m[3]; } return k; };
const TRANSPORT = /^(al:Back to start|al:Play|al:Pause|button:Undo|button:Redo|button:Split|al:Delete|button:Loop|button:Follow|tid:arrangement-zoom|button:Fit|button:Export|al:Zoom|button:Zoom)/;
const out = {};
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(L, `b-round-157/out/d6/d6-${W}-r1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(L, `c-round-160/out/d6/d6-${W}-r1.json`)));
  const r = { vp: W, states: {} };
  for (const S of ['S0', 'S1', 'S2']) {
    const rm = new Map(); const renamedUsed = [];
    for (const e of ref.states[S].elements) { const nk = ren(e.key); if (nk !== e.key) renamedUsed.push(`${e.key} -> ${nk}`); if (rm.has(nk)) r.collision = (r.collision || []).concat(`${S}:${nk}`); rm.set(nk, e); }
    const cm = new Map(); for (const e of cur.states[S].elements) { if (cm.has(e.key)) r.collision = (r.collision || []).concat(`${S}:cur:${e.key}`); cm.set(e.key, e); }
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    let maxD = 0, maxKey = null; const over = []; const transport = [];
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const d = { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h }; const m = Math.max(...Object.values(d).map(Math.abs)); if (m > maxD) { maxD = m; maxKey = k; } if (m > 1) over.push({ k, ...d }); if (S === 'S0' && a.y < 80 && TRANSPORT.test(k)) transport.push({ k, ref: [a.x, a.y, a.w, a.h], cur: [b.x, b.y, b.w, b.h], ...d }); }
    r.states[S] = { refN: rm.size, curN: cm.size, renamedUsed, missing, added, maxDelta: maxD, maxKey, over1px: over, transport: S === 'S0' ? transport : undefined };
  }
  out[W] = r;
}
fs.writeFileSync(path.join(L, 'c-round-160/out/rv1-v3b.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const S of ['S0', 'S1', 'S2']) { const s = out[W].states[S]; console.log(W, S, 'ref', s.refN, 'cur', s.curN, 'renamed', s.renamedUsed.length, 'missing', JSON.stringify(s.missing), 'added', JSON.stringify(s.added), 'max', s.maxDelta, s.maxKey, 'over1', s.over1px.length); }
console.log('collisions', JSON.stringify(out[1440].collision || null), JSON.stringify(out[1280].collision || null));
