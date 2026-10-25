// C round 169 — BOX-V3C4C1: c169-surf rest boxes vs b-round-168/out/v3c4c1-probe.json before.box (same states, at e50498f).
const fs = require('fs'); const path = require('path'); const LP = '/home/runner/czaba-project/tmp/studio-real-loop';
const ref = JSON.parse(fs.readFileSync(path.join(LP, 'b-round-168/out/v3c4c1-probe.json')));
const out = {}; let worst = 0;
for (const W of [1440, 1280]) {
  const cur = JSON.parse(fs.readFileSync(path.join(LP, `c-round-169/out/surf/surf-${W}-1.json`)));
  out[W] = {};
  for (const st of ref[W]) {
    const c = cur.states[st.state].rest; const rows = {};
    for (const [id, b] of Object.entries(st.before)) {
      const a = c[id];
      if (!b.present || !a || !a.present) { rows[id] = { refPresent: b.present, curPresent: !!(a && a.present) }; continue; }
      const d = b.box.map((v, i) => +(a.box[i] - v).toFixed(2)); const m = Math.max(...d.map(Math.abs)); worst = Math.max(worst, m);
      rows[id] = { ref: b.box, cur: a.box, d, max: m };
    }
    rows['lib-option-unselected'] = { measuredOnly: c['lib-option-unselected'] && c['lib-option-unselected'].box };
    out[W][st.state] = rows;
  }
}
out.worst = worst;
fs.writeFileSync(path.join(LP, 'c-round-169/out/box-v3c4c1.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const [s, rows] of Object.entries(out[W])) console.log(W, s, Object.entries(rows).map(([k, v]) => `${k}:${v.max !== undefined ? v.max : JSON.stringify(v)}`).join('  '));
console.log('worst', worst);
