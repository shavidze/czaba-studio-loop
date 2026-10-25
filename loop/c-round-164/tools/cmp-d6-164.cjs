// C round 164 (derived from c-round-163/tools/cmp-d6-163.cjs: no renames, ref = c-round-163 d6, cur = c-round-164 d6): compare d6 S0/S1/S2 boxes and contrast sections with the c-round-162 reference after the 1 V-3c-3a rename (exact full-key lookup).
const fs = require('fs'); const path = require('path');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const map = {};
const out = {};
const FOCUS = /arrangement-overview|envelope/;
const occKey = (arr) => { const o = {}; return arr.map((e) => { o[e.key] = (o[e.key] || 0) + 1; return { ...e, k2: `${e.key}#${o[e.key]}` }; }); };
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(L, `c-round-163/out/d6/d6-${W}-r1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(L, `c-round-164/out/d6/d6-${W}-r1.json`)));
  const r = { vp: W, states: {}, contrast: {}, collision: [] };
  for (const S of ['S0', 'S1', 'S2']) {
    const rm = new Map(); const renamedUsed = [];
    for (const e of ref.states[S].elements) { const nk = map[e.key] || e.key; if (nk !== e.key) renamedUsed.push(`${e.key} -> ${nk}`); if (rm.has(nk)) r.collision.push(`${S}:${nk}`); rm.set(nk, e); }
    const cm = new Map(); for (const e of cur.states[S].elements) { if (cm.has(e.key)) r.collision.push(`${S}:cur:${e.key}`); cm.set(e.key, e); }
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    let maxD = 0, maxKey = null; const over = []; const focus = [];
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const d = { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h }; const m = Math.max(...Object.values(d).map(Math.abs)); if (m > maxD) { maxD = m; maxKey = k; } if (m > 1) over.push({ k, ...d }); if (FOCUS.test(k)) focus.push({ k, ref: [a.x, a.y, a.w, a.h], cur: [b.x, b.y, b.w, b.h], max: m }); }
    r.states[S] = { refN: rm.size, curN: cm.size, renamedUsed, missing, added, maxDelta: maxD, maxKey, over1px: over, focus };
  }
  for (const C of ['contrastS0', 'contrastS1']) {
    const ra = occKey(ref[C].map((e) => ({ ...e, key: map[e.key] || e.key }))); const ca = occKey(cur[C]);
    const renamedUsed = ref[C].filter((e) => map[e.key]).length;
    const rm = new Map(ra.map((e) => [e.k2, e])); const cm = new Map(ca.map((e) => [e.k2, e]));
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    const changed = []; let maxBox = 0;
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const bd = Math.max(...a.box.map((v, i) => Math.abs(v - b.box[i]))); if (bd > maxBox) maxBox = bd; if (a.fg !== b.fg || a.bg !== b.bg || String(a.ratio) !== String(b.ratio) || a.pass !== b.pass || bd > 1) changed.push({ k, ref: [a.fg, a.bg, a.ratio, a.pass, a.box], cur: [b.fg, b.bg, b.ratio, b.pass, b.box] }); }
    r.contrast[C] = { refN: rm.size, curN: cm.size, renamedUsed, missing, added, changed, maxBox, failing: ca.filter((e) => e.pass === false).map((e) => e.k2) };
  }
  out[W] = r;
}
fs.writeFileSync(path.join(L, 'c-round-164/out/rv1-saba.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) {
  for (const S of ['S0', 'S1', 'S2']) { const s = out[W].states[S]; console.log(W, S, 'ref', s.refN, 'cur', s.curN, 'renamed', JSON.stringify(s.renamedUsed), 'missing', JSON.stringify(s.missing), 'added', JSON.stringify(s.added), 'max', s.maxDelta, s.maxKey, 'over1', s.over1px.length, 'focus', JSON.stringify(s.focus.map((f) => [f.k, f.max]))); }
  for (const C of ['contrastS0', 'contrastS1']) { const c = out[W].contrast[C]; console.log(W, C, 'ref', c.refN, 'cur', c.curN, 'renamed', c.renamedUsed, 'missing', JSON.stringify(c.missing), 'added', JSON.stringify(c.added), 'changed', JSON.stringify(c.changed).slice(0, 600), 'maxBox', c.maxBox, 'failing', JSON.stringify(c.failing)); }
}
console.log('collisions', JSON.stringify(out[1440].collision), JSON.stringify(out[1280].collision));
