// C round 168 — analyse surf-<W>-<att>.json vs b-round-167 probe before values. node an-surf.cjs <att>
const fs = require('fs'); const path = require('path');
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'; const ATT = process.argv[2] || '1';
const B = JSON.parse(fs.readFileSync(path.join(LOOP, 'b-round-167/out/v3c4b-probe.json')));
const B2 = JSON.parse(fs.readFileSync(path.join(LOOP, 'b-round-167/out/v3c4b-probe-S2.json')));
const MIX = ['lane-music-mute', 'lane-music-solo', 'lane-sfx-mute', 'group-mute', 'group-solo'];
const out = {}; const findings = [];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const W of [1440, 1280]) {
  const f = path.join(LOOP, `c-round-168/out/surf/surf-${W}-${ATT}.json`); if (!fs.existsSync(f)) continue;
  const C = JSON.parse(fs.readFileSync(f)); const o = out[W] = { states: {}, reducedMotion: C.reducedMotion, net: C.net };
  for (const [st, cur] of Object.entries(C.states)) {
    const bsrc = st === 'S2-group-solo-mixed' ? B2 : B; const bs = bsrc[W].find((x) => x.state === st); const so = o.states[st] = { fonts: cur.fonts, fontBad: cur.fontBad, sites: {} };
    for (const [id, m] of Object.entries(cur.rest)) {
      const bb = bs.before[id];
      if (!m.present) { so.sites[id] = { present: false, bPresent: bb && bb.present }; if (bb && bb.present) findings.push(`${W} ${st} ${id} missing`); continue; }
      const dBox = bb && bb.present ? Math.max(...m.box.map((v, i) => Math.abs(v - bb.box[i]))) : null;
      const s = so.sites[id] = { pressed: m.pressed, dmute: m.dmute, dsolo: m.dsolo, disabled: m.disabled, box: m.box, bBox: bb && bb.box, dBox: dBox === null ? null : +dBox.toFixed(3), radius: m.radii, border: `${m.borderWidth} ${m.borderColor}`, bgOwn: m.bgOwn, bgEff: m.bgEff, bBgEff: bb && bb.bgEff, bgImage: m.bgImage, color: m.color, contrast: m.contrast, bContrast: bb && bb.contrast, fillVsParent: m.fillVsParent, tp: m.tp, td: m.td, tf: m.tf };
      if (dBox === null || dBox > 0.5) findings.push(`${W} ${st} ${id} box delta ${dBox}`);
      if (m.radii !== '8px 8px 8px 8px') findings.push(`${W} ${st} ${id} radius ${m.radii}`);
      const kind = MIX.includes(id) ? 'mix' : id === 'video-import' ? 'import' : 'radius';
      if (kind !== 'radius') {
        if (m.borderWidth !== '1px') findings.push(`${W} ${st} ${id} border width ${m.borderWidth}`);
        if (!/background-color/.test(m.tp) || !/(^|, )color/.test(m.tp) || !/0\.18s/.test(m.td) || !/cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)/.test(m.tf)) findings.push(`${W} ${st} ${id} transition ${m.tp}|${m.td}|${m.tf}`);
        if (m.disabled === false && m.contrast < 4.5) findings.push(`${W} ${st} ${id} contrast ${m.contrast}`);
      } else if (id !== 'group-name-input') {
        if (!eq(m.bgEff, bb.bgEff) || m.contrast !== bb.contrast) findings.push(`${W} ${st} ${id} colour changed ${JSON.stringify(bb.bgEff)}->${JSON.stringify(m.bgEff)} c ${bb.contrast}->${m.contrast}`);
      }
      if (id === 'group-name-input' && m.borderColor !== 'rgb(201, 164, 106)') findings.push(`${W} ${st} input border ${m.borderColor}`);
      if (cur.ha && cur.ha[id]) { const h = cur.ha[id]; s.hit = h.hit; s.hover = { bgEff: h.hover.bgEff, bgImage: h.hover.bgImage.slice(0, 40), contrast: h.hover.contrast, border: h.hover.borderColor }; s.active = { bgEff: h.active.bgEff, contrast: h.active.contrast, border: h.active.borderColor }; s.hoverPx = h.hoverPx; s.afterRelease = h.afterRelease;
        if (!h.hit) findings.push(`${W} ${st} ${id} elementFromPoint miss`);
        if (h.hover.contrast < 4.5 || h.active.contrast < 4.5) findings.push(`${W} ${st} ${id} hover/active contrast ${h.hover.contrast}/${h.active.contrast}`);
        if (h.afterRelease.pressed !== m.pressed) findings.push(`${W} ${st} ${id} state changed by hover/press-away`);
      }
    }
    if (cur.restPxRight) so.mixedPx = { left: cur.restPxLeft, right: cur.restPxRight };
  }
  for (const [k, v] of Object.entries(C.reducedMotion.sites)) if (v && v.tp !== 'none' && MIX.concat('video-import').includes(k)) findings.push(`${W} RM ${k} tp ${v.tp}`);
  if (!C.reducedMotion.matches) findings.push(`${W} RM matchMedia false`);
  if (!C.net.ok) findings.push(`${W} net ${JSON.stringify(C.net.bad)}`);
  o.crops = C.crops;
}
out.findings = findings;
fs.writeFileSync(path.join(LOOP, `c-round-168/out/an-surf-${ATT}.json`), JSON.stringify(out, null, 1));
for (const W of Object.keys(out).filter((k) => k !== 'findings')) for (const [st, so] of Object.entries(out[W].states)) { console.log(`== ${W} ${st} fonts=${so.fonts} fontBad=${so.fontBad}`); for (const [id, s] of Object.entries(so.sites)) { if (s.present === false) { console.log('  ', id, 'absent', 'B', s.bPresent); continue; } console.log('  ', id.padEnd(22), `pr=${s.pressed} m=${s.dmute} s=${s.dsolo} dBox=${s.dBox} r=${s.radius.split(' ')[0]} b=${s.border} own=${s.bgOwn} eff=${JSON.stringify(s.bgEff)} B=${JSON.stringify(s.bBgEff)} c=${s.contrast} B=${s.bContrast} fvp=${s.fillVsParent}`, s.hover ? `| hov ${JSON.stringify(s.hover.bgEff)} ${s.hover.contrast} act ${JSON.stringify(s.active.bgEff)} ${s.active.contrast} hit=${s.hit}` : '', s.hoverPx ? `hoverPx ${JSON.stringify(s.hoverPx.rgba)}` : '', `| ${s.tp}|${s.td}|${s.tf}`); } if (so.mixedPx) console.log('   mixedPx rest', JSON.stringify(so.mixedPx)); }
console.log('RM', JSON.stringify(Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'findings').map(([w, o]) => [w, o.reducedMotion]))));
console.log('FINDINGS', JSON.stringify(findings, null, 1));
