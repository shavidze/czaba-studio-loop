// C round 172 — BOX-V3C5A: c172-radius attempt 2 (normal) V0/V1 vs c-round-171/out/surf/surf-<W>-1.json rest boxes; other sites: recorded, no before-value.
const fs = require('fs'); const path = require('path'); const LP = '/home/runner/czaba-project/tmp/studio-real-loop';
const MAP = { P4: 'dock-box', P3: 'dock-placeholder', 'dock-expand': 'dock-expand', 'dock-drag': 'dock-drag', 'dock-close': 'dock-close', 'dock-return': 'dock-return' };
const out = { worst: 0, rows: {}, noBefore: {}, stability: {} }; 
for (const W of [1440, 1280]) {
  const ref = JSON.parse(fs.readFileSync(path.join(LP, `c-round-171/out/surf/surf-${W}-1.json`)));
  const cur = JSON.parse(fs.readFileSync(path.join(LP, `c-round-172/out/radius/rad-${W}-2.json`)));
  out.rows[W] = {};
  for (const [st, rs] of [['V0', 'V0-dock-video'], ['V1', 'V1-dock-floating']]) {
    for (const [id, rid] of Object.entries(MAP)) {
      const a = (ref.states[rs].rest || {})[rid]; const b = cur.states[st].m[id];
      if (!b) continue;
      if (!a || !a.present || !b.present) { out.rows[W][`${st}.${id}`] = { refPresent: !!(a && a.present), curPresent: !!(b && b.present) }; continue; }
      const d = b.box.map((v, i) => +(v - a.box[i]).toFixed(2)); const m = Math.max(...d.map(Math.abs)); out.worst = Math.max(out.worst, m);
      out.rows[W][`${st}.${id}`] = { ref: a.box, cur: b.box, max: m, refRadius: a.radius, curRadii: b.radii.join(' '), refBorder: `${a.borderWidth} ${a.borderColor}`, curBorder: b.border, refBgEff: a.bgEff };
    }
  }
  out.noBefore[W] = {};
  for (const [st, ids] of [['D1', ['P1', 'OVroot', 'OVoverlay', 'OVframe']], ['D2', ['P2']], ['G1', ['P5']], ['K1', ['P6']]]) for (const id of ids) { const b = cur.states[st].m[id]; out.noBefore[W][`${st}.${id}`] = { box: b.box, children: b.children.map((c) => [c.tid || c.tag, c.box]), rows: (b.rows || []).map((r) => [r.text, r.box]) }; }
  // run-to-run stability (attempt 1 at 1440 used another right-click lane for G1, so G1 excluded there)
  const c2 = cur; const c1p = path.join(LP, `c-round-172/out/radius/rad-${W}-1.json`);
  if (fs.existsSync(c1p)) { const c1 = JSON.parse(fs.readFileSync(c1p)); let m = 0; for (const st of ['V0', 'V1', 'D1', 'D2', 'K1']) for (const [id, b] of Object.entries(c2.states[st].m)) { const a = c1.states[st].m[id]; if (a && a.present && b.present) m = Math.max(m, ...a.box.map((v, i) => Math.abs(v - b.box[i]))); } out.stability[W] = m; }
}
fs.writeFileSync(path.join(LP, 'c-round-172/out/box-v3c5a.json'), JSON.stringify(out, null, 1));
for (const W of [1440, 1280]) for (const [k, v] of Object.entries(out.rows[W])) console.log(W, k, JSON.stringify(v));
console.log('worst', out.worst, 'stability', JSON.stringify(out.stability));
