// C round 168: adapted from c-round-167/tools/cmp-d6-167.cjs; ref = c-round-167 d6, cur = c-round-168 d6, no key renames expected.
const fs = require('fs'); const path = require('path');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const map = {};
const out = {};
const occKey = (arr) => { const o = {}; return arr.map((e) => { o[e.key] = (o[e.key] || 0) + 1; return { ...e, k2: `${e.key}#${o[e.key]}` }; }); };
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(L, `c-round-167/out/d6/d6-${W}-r1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(L, `c-round-168/out/d6/d6-${W}-r1.json`)));
  const r = { vp: W, states: {}, contrast: {}, collision: [] };
  for (const S of ['S0', 'S1', 'S2']) {
    const rm = new Map(); for (const e of ref.states[S].elements) { if (rm.has(e.key)) r.collision.push(`${S}:${e.key}`); rm.set(e.key, e); }
    const cm = new Map(); for (const e of cur.states[S].elements) { if (cm.has(e.key)) r.collision.push(`${S}:cur:${e.key}`); cm.set(e.key, e); }
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    let maxD = 0, maxKey = null; const over = [];
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const d = { dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h }; const m = Math.max(...Object.values(d).map(Math.abs)); if (m > maxD) { maxD = m; maxKey = k; } if (m > 0.5) over.push({ k, ...d }); }
    r.states[S] = { refN: rm.size, curN: cm.size, missing, added, maxDelta: maxD, maxKey, over05px: over };
  }
  for (const C of ['contrastS0', 'contrastS1']) {
    const ra = occKey(ref[C]); const ca = occKey(cur[C]);
    const rm = new Map(ra.map((e) => [e.k2, e])); const cm = new Map(ca.map((e) => [e.k2, e]));
    const missing = [...rm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !rm.has(k));
    const changed = []; let maxBox = 0;
    for (const [k, a] of rm) { const b = cm.get(k); if (!b) continue; const bd = Math.max(...a.box.map((v, i) => Math.abs(v - b.box[i]))); if (bd > maxBox) maxBox = bd; if (a.fg !== b.fg || a.bg !== b.bg || String(a.ratio) !== String(b.ratio) || a.pass !== b.pass || bd > 0.5) changed.push({ k, ref: [a.fg, a.bg, a.ratio, a.pass, a.thr, a.disabled], cur: [b.fg, b.bg, b.ratio, b.pass, b.thr, b.disabled] }); }
    r.contrast[C] = { refN: rm.size, curN: cm.size, missing, added, changed, maxBox, refFailing: ra.filter((e) => e.pass === false).map((e) => e.k2), failing: ca.filter((e) => e.pass === false).map((e) => e.k2) };
  }
  out[W] = r;
}
fs.writeFileSync(path.join(L, 'c-round-168/out/rv1-v3c4b.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) {
  for (const S of ['S0', 'S1', 'S2']) { const s = out[W].states[S]; console.log(W, S, 'ref', s.refN, 'cur', s.curN, 'missing', JSON.stringify(s.missing), 'added', JSON.stringify(s.added), 'max', s.maxDelta, s.maxKey, 'over05', JSON.stringify(s.over05px)); }
  for (const C of ['contrastS0', 'contrastS1']) { const c = out[W].contrast[C]; console.log(W, C, 'ref', c.refN, 'cur', c.curN, 'missing', JSON.stringify(c.missing), 'added', JSON.stringify(c.added), 'maxBox', c.maxBox, 'refFailing', JSON.stringify(c.refFailing), 'failing', JSON.stringify(c.failing)); for (const ch of c.changed) console.log('   ', JSON.stringify(ch)); }
}
console.log('collisions', JSON.stringify(out[1440].collision), JSON.stringify(out[1280].collision));
