// C round 171 — BOX/CONTRAST-V3C4C3: c171-surf rest (attempt 1, normal) vs b-round-170/out/v3c4c3-probe.json before.* (exportLook / radius runs, fe6ea99).
const fs = require('fs'); const path = require('path'); const LP = '/home/runner/czaba-project/tmp/studio-real-loop';
const ref = JSON.parse(fs.readFileSync(path.join(LP, 'b-round-170/out/v3c4c3-probe.json')));
const out = {}; let worst = 0; const cDiff = [];
for (const W of [1440, 1280]) {
  const cur = JSON.parse(fs.readFileSync(path.join(LP, `c-round-171/out/surf/surf-${W}-1.json`))); out[W] = {};
  for (const st of ref[W]) {
    if (st.variant === 'keepFill') continue;
    const c = cur.states[st.state].rest; const rows = {};
    for (const [id, b] of Object.entries(st.before)) {
      const a = c[id];
      if (!b.present || !a || !a.present) { rows[id] = { refPresent: b.present, curPresent: !!(a && a.present) }; continue; }
      const d = b.box.map((v, i) => +(a.box[i] - v).toFixed(2)); const m = Math.max(...d.map(Math.abs)); worst = Math.max(worst, m);
      const expAfter = (st.after[id] || {}).contrast;
      rows[id] = { ref: b.box, cur: a.box, max: m, refBefore: b.contrast, refAfter: expAfter, cur: a.contrast, curBg: a.bgEff, refBg: b.bgEff, refBorder: b.borderColor, curBorder: a.borderColor };
      if (/^(card|dock)/.test(id) && (b.contrast !== a.contrast || b.bgEff.join() !== a.bgEff.join() || b.borderColor !== a.borderColor)) cDiff.push(`${W} ${st.state} ${id} ${b.contrast}/${b.bgEff}/${b.borderColor} -> ${a.contrast}/${a.bgEff}/${a.borderColor}`);
      if (/^exp/.test(id) && expAfter !== a.contrast) cDiff.push(`${W} ${st.state} ${id} B-after ${expAfter} vs cur ${a.contrast}`);
    }
    out[W][st.state] = rows;
  }
}
out.worst = worst; out.contrastDiff = cDiff;
fs.writeFileSync(path.join(LP, 'c-round-171/out/box-v3c4c3.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const [s, rows] of Object.entries(out[W])) console.log(W, s, Object.entries(rows).map(([k, v]) => `${k}:${v.max !== undefined ? v.max : JSON.stringify(v)}`).join(' '));
console.log('worst', worst, 'contrastDiff', JSON.stringify(cDiff, null, 1));
