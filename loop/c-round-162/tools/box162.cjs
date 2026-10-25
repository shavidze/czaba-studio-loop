// C round 162 LANE-STATES-BOX final table: baseline = B probe "before"; current = c162-<W>.json curList.
const fs = require('fs');
const B = JSON.parse(fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-161/out/v3c2-probe-final.json'));
const out = {};
const norm = (k) => k.replace(/“\s+/g, '“').replace(/\s+/g, '').slice(0, 24);
for (const W of [1440, 1280]) {
  const j = JSON.parse(fs.readFileSync(`out/c162-${W}.json`)); out[W] = {};
  for (const S of ['S0', 'S0-folded', 'S1', 'S1-group-collapsed']) {
    const base = B[W].find((r) => r.state === S).before; const cur = j.states[S].curList;
    const bm = new Map(base.map((e) => [e.k, e])); const cm = new Map(cur.map((e) => [e.k, e]));
    const RN = { 'button: Your own video|track:video#1': 'button:Your own video|track:video#1' };
    const pairs = []; const missing = []; const usedC = new Set();
    for (const [k, b] of bm) { let ck = RN[k] || k; if (!cm.has(ck)) { const cand = [...cm.keys()].filter((c) => !bm.has(c) && !usedC.has(c) && norm(c) === norm(k) && c.split('|').slice(1).join('|') === k.split('|').slice(1).join('|')); ck = cand[0]; } if (!ck || !cm.has(ck)) { missing.push(k); continue; } usedC.add(ck); const a = cm.get(ck); pairs.push({ k, ck: ck !== k ? ck : undefined, b: [b.x, b.y, b.w, b.h], a: [a.x, a.y, a.w, a.h], max: Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.x + a.w - b.x - b.w), Math.abs(a.y + a.h - b.y - b.h)) }); }
    const added = [...cm.keys()].filter((c) => !bm.has(c) && !usedC.has(c));
    const allowedMissing = missing.filter((k) => /^span:\|(clip@|group)/.test(k));
    const svgAdded = added.filter((k) => /^svg:/.test(k)); const lblAdded = added.filter((k) => k === 'span:Your own video|track:video#1');
    const unexpected = { missing: missing.filter((k) => !allowedMissing.includes(k)), added: added.filter((k) => !svgAdded.includes(k) && !lblAdded.includes(k)) };
    const r2 = (v) => +v.toFixed(2);
    const sel = (re) => pairs.filter((p) => re.test(p.k)).map((p) => ({ k: p.k, ck: p.ck, b: p.b.map(r2), a: p.a.map(r2), max: +p.max.toFixed(3) }));
    out[W][S] = { nBase: base.length, nCur: cur.length, compared: pairs.length, maxDelta: +Math.max(...pairs.map((p) => p.max)).toFixed(3), over1: pairs.filter((p) => p.max > 1).map((p) => p.k), movers: pairs.filter((p) => p.max > 0.01).map((p) => ({ k: p.k, max: +p.max.toFixed(3) })), renamed: pairs.filter((p) => p.ck).map((p) => ({ k: p.k, ck: p.ck, max: p.max })), allowedMissing, svgAdded, lblAdded, unexpected,
      key: sel(/^(arrangement-track-fold|arrangement-group-fold|arrangement-group-name|arrangement-group-header|arrangement-track-header|button: Your own video|Your own video|Fold or unfold|div:.*\|clip@|span:.*\|(clip@|group))/) };
  }
}
fs.writeFileSync('out/lane-states-box.json', JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const [S, s] of Object.entries(out[W])) console.log(W, S, 'base', s.nBase, 'cur', s.nCur, 'cmp', s.compared, 'max', s.maxDelta, 'over1', s.over1.length, 'movers', JSON.stringify(s.movers), 'renamed', JSON.stringify(s.renamed.map((r) => `${r.k} -> ${r.ck} (${r.max})`)), 'allowedMissing', s.allowedMissing.length, 'svgAdded', s.svgAdded.length, 'lbl', s.lblAdded.length, 'UNEXPECTED', JSON.stringify(s.unexpected));
