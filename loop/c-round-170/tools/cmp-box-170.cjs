// C round 170 — BOX-V3C4C2 + field CONTRAST-V3C4C2: c170-surf rest boxes/contrast vs b-round-169/out/v3c4c2-probe.json before.* (same states, at 352dc91).
const fs = require('fs'); const path = require('path'); const LP = '/home/runner/czaba-project/tmp/studio-real-loop';
const ref = JSON.parse(fs.readFileSync(path.join(LP, 'b-round-169/out/v3c4c2-probe.json')));
const out = {}; let worst = 0; const contrastDiff = [];
for (const W of [1440, 1280]) {
  const cur = JSON.parse(fs.readFileSync(path.join(LP, `c-round-170/out/surf/surf-${W}-1.json`)));
  out[W] = {};
  for (const st of ref[W]) {
    const c = cur.states[st.state].rest; const rows = {};
    for (const [id, b] of Object.entries(st.before)) {
      const a = c[id];
      if (!b.present || !a || !a.present) { rows[id] = { refPresent: b.present, curPresent: !!(a && a.present) }; continue; }
      const d = b.box.map((v, i) => +(a.box[i] - v).toFixed(2)); const m = Math.max(...d.map(Math.abs)); worst = Math.max(worst, m);
      rows[id] = { ref: b.box, cur: a.box, d, max: m, refContrast: b.contrast, curContrast: a.contrast, refAfterContrast: (st.after[id] || {}).contrast };
      if (/start|end|gain-input/.test(id) && b.contrast !== a.contrast) contrastDiff.push(`${W} ${st.state} ${id} ${b.contrast}->${a.contrast}`);
    }
    out[W][st.state] = rows;
  }
}
out.worst = worst; out.fieldContrastDiff = contrastDiff;
fs.writeFileSync(path.join(LP, 'c-round-170/out/box-v3c4c2.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const [s, rows] of Object.entries(out[W])) console.log(W, s, Object.entries(rows).map(([k, v]) => `${k}:${v.max !== undefined ? `${v.max} c${v.refContrast}->${v.curContrast}(B-after ${v.refAfterContrast})` : JSON.stringify(v)}`).join('  '));
console.log('worst', worst, 'fieldContrastDiff', JSON.stringify(contrastDiff));
