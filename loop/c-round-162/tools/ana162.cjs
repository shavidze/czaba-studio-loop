// C round 162: analyse c162-<W>.json -> ICON-V3C2 + LANE-STATES-BOX verdict tables
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const j = JSON.parse(fs.readFileSync(path.join(__dirname, `../out/c162-${W}.json`)));
const out = { vp: W, states: {} };
const BASEF = JSON.parse(fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-161/out/v3c2-probe-final.json'));
const LUC = { laneFold: [/lucide-chevron-(down|right)/, 12, '2'], groupFold: [/lucide-chevron-(down|right)/, 12, '2'], importFull: [/lucide-plus/, 10, '2.4'], importCompact: [/lucide-plus/, 10, '2.4'], groupName: [/lucide-layers/, 10, '2.4'], 'clip-audio': [/lucide-grip-vertical/, 10, '2.4'], 'clip-video': [/lucide-film/, 10, '2.4'] };
const FIX = { laneFold: [20, 20], importCompact: [20, 20], groupFold: [24, 24] };
for (const [S, st] of Object.entries(j.states)) {
  const T = st.tokens; const ic = st.icon.icons; const iss = [];
  const rows = ic.map((h) => {
    const [re, sz, sw] = LUC[h.kind]; const s = h.svgs[0] || {};
    const expStroke = h.kind === 'groupName' ? T.muted : h.kind.startsWith('import') ? T.brand : h.color;
    const fold = h.kind.endsWith('Fold'); const expanded = h.expanded;
    const dirOk = !fold || (expanded === 'true' ? /chevron-down/.test(s.cls) : /chevron-right/.test(s.cls));
    const r = { kind: h.kind, track: h.track, clip: h.clipStart, nSvg: h.svgs.length, cls: s.cls, aria: s.ariaHidden, w: s.w, h: s.h, sw: s.swAttr, stroke: s.stroke, expStroke, hostColor: h.color, dcx: s.dcx, dcy: s.dcy, first: s.firstChild, text: h.text, ax: h.ax && h.ax.name, box: h.box, dirOk };
    const ok = h.svgs.length === 1 && re.test(s.cls) && s.ariaHidden === 'true' && Math.abs(s.w - sz) <= 0.5 && Math.abs(s.h - sz) <= 0.5 && s.swAttr === sw && s.stroke === expStroke && dirOk && !/[▶◀×▾▸■＋⌫▣⠿]/u.test(h.text) && (!(fold || h.kind === 'importCompact') || (Math.abs(s.dcx) <= 0.5 && Math.abs(s.dcy) <= 0.5)) && (!FIX[h.kind] || (Math.abs(h.box[2] - FIX[h.kind][0]) <= 1 && Math.abs(h.box[3] - FIX[h.kind][1]) <= 1));
    r.ok = ok; if (!ok) iss.push(`${h.kind}/${h.track || h.clipStart}`); return r;
  });
  // names
  const nm = [];
  for (const h of ic) {
    if (h.kind === 'laneFold') { const trackName = null; nm.push({ kind: h.kind, ax: h.ax && h.ax.name, aria: h.aria }); }
    if (h.kind.startsWith('import')) nm.push({ kind: h.kind, ax: h.ax && h.ax.name, ok: h.ax && h.ax.name === 'Your own video' });
    if (h.kind === 'groupFold' || h.kind === 'groupName') nm.push({ kind: h.kind, ax: h.ax && h.ax.name, aria: h.aria });
  }
  for (const n of nm) if (n.ok === false) iss.push(`name ${n.kind}`);
  const hov = st.icon.hover.map((h) => ({ kind: h.kind, track: h.track, hit: h.hit && h.hit.inHost, rest: [h.restColor, h.restStroke], hover: [h.hover.color, h.hover.stroke], ok: h.hit && h.hit.inHost && h.restStroke === h.restColor && h.hover.stroke === h.hover.color && (h.kind.endsWith('Fold') ? h.restColor === T.muted && h.hover.color === T.foreground : h.hover.stroke === T.brand) }));
  for (const h of hov) if (!h.ok) iss.push(`hover ${h.kind}/${h.track}`);
  const sc = st.icon.scan; const glyphN = sc.trackHeaders.glyphs.length + sc.groupHeaders.glyphs.length + sc.clips.glyphs.length + sc.trackHeaders.attrGlyphs.length + sc.groupHeaders.attrGlyphs.length + sc.clips.attrGlyphs.length;
  if (glyphN) iss.push(`glyphs ${glyphN}`);
  const gnF = st.icon.groupNameFonts; const gnHasDejavu = gnF ? gnF.some((f) => /dejavu/i.test(f.familyName)) : null; const gn = ic.find((h) => h.kind === 'groupName');
  const u25a3 = gn ? gn.textNodes.some((t) => t.includes('▣')) : null;
  if (gn && (gnHasDejavu || u25a3)) iss.push('C-R154-02');
  if (S === 'S0' && sc.placeholder !== 'No video — use “Your own video” or drop a file here') iss.push(`placeholder ${sc.placeholder}`);
  // boxes
  const c = st.cmp; const FINDSET = (k) => /^arrangement-|^\[?data|^(Fold|Mute|Solo|Your own|Group|Video|Music|Stems|SFX|Volume|Pan|Original)/.test(k) || /^div:.*\|clip@/.test(k) || /^button:/.test(k);
  const over = c.rows.filter((r) => r.max > 1);
  const titleSpans = c.rows.filter((r) => /^span:/.test(r.k) && /clip@|group/.test(r.k));
  const allowMissing = c.missing.filter((k) => /^span:\|(clip@|group)/.test(k) || /^div:Video Your own video/.test(k));
  const otherMissing = c.missing.filter((k) => !allowMissing.includes(k));
  const addedSvg = c.added.filter((k) => /^svg:/.test(k)); const addedSpanLabel = c.added.filter((k) => k === 'span:Your own video|track:video#1');
  const otherAdded = c.added.filter((k) => !addedSvg.includes(k) && !addedSpanLabel.includes(k));
  const expectedSvg = ic.length;
  if (over.length) iss.push(`box>1px ${over.map((r) => r.k).join(',')}`);
  // pair text-keyed keys that differ only by whitespace (removed glyph + space): compare their boxes
  const after = st.afterList || null;
  const norm = (k) => k.replace(/\s+/g, '');
  const paired = [];
  for (const mk of otherMissing.slice()) { const ak = otherAdded.find((a) => norm(a) === norm(mk).replace(/\u201c\s*/g, '\u201c') || norm(a).slice(0, 25) === norm(mk).slice(0, 25)); if (ak) { paired.push({ base: mk, cur: ak }); otherMissing.splice(otherMissing.indexOf(mk), 1); otherAdded.splice(otherAdded.indexOf(ak), 1); } }
  for (const ak of otherAdded.slice()) { const bk = allowMissing.find((m) => norm(m) === norm(ak)); if (bk) { paired.push({ base: bk, cur: ak }); otherAdded.splice(otherAdded.indexOf(ak), 1); allowMissing.splice(allowMissing.indexOf(bk), 1); } }
  const BB = (st.baseList = BASEF[W].find((r) => r.state === S).before) ? Object.fromEntries(st.baseList.map((e) => [e.k, e])) : {}; const AA = st.curList ? Object.fromEntries(st.curList.map((e) => [e.k, e])) : {};
  for (const pr of paired) { const a = AA[pr.cur], b0 = BB[pr.base]; if (a && b0) { pr.b = [b0.x, b0.y, b0.w, b0.h].map((v) => +v.toFixed(2)); pr.a = [a.x, a.y, a.w, a.h].map((v) => +v.toFixed(2)); pr.max = +Math.max(Math.abs(a.x - b0.x), Math.abs(a.y - b0.y), Math.abs(a.x + a.w - b0.x - b0.w), Math.abs(a.y + a.h - b0.y - b0.h)).toFixed(3); if (pr.max > 1) iss.push(`paired>1px ${pr.cur}`); } }
  if (otherMissing.length || otherAdded.length) iss.push('unexpected keys');
  if (st.videoRow.max > 1 || st.videoRow.missingRef) iss.push('video row');
  if (addedSvg.length !== expectedSvg) iss.push(`svg keys ${addedSvg.length} vs sites ${expectedSvg}`);
  const pick = (re) => c.rows.filter((r) => re.test(r.k)).map((r) => ({ k: r.k, b: r.b.map((v) => +v.toFixed(2)), a: r.a.map((v) => +v.toFixed(2)), max: +r.max.toFixed(3) }));
  out.states[S] = {
    issues: iss, icons: rows, names: nm, hover: hov, glyphN, placeholder: sc.placeholder, groupNameFonts: gnF, groupNameDejavu: gnHasDejavu, u25a3,
    box: { n: st.n, baseN: st.baseN, compared: c.rows.length, maxDelta: +Math.max(0, ...c.rows.map((r) => r.max)).toFixed(3), maxKey: (c.rows.slice().sort((a, b) => b.max - a.max)[0] || {}).k, over1: over.length, missingAllowed: allowMissing, paired, otherMissing, addedSvg: addedSvg.length, addedSpanLabel, otherAdded, videoRow: st.videoRow, videoHeader: st.videoHeader,
      titleSpans: titleSpans.map((r) => ({ k: r.k, max: +r.max.toFixed(3) })),
      key: pick(/^(arrangement-track-fold|Fold|arrangement-group-fold|arrangement-group-name|button:Your own video|Your own video|arrangement-track-header|arrangement-group-header|div:.*\|clip@)/),
      movers: c.rows.filter((r) => r.max > 0.01).map((r) => ({ k: r.k, max: +r.max.toFixed(3) })) },
    fonts: { ready: st.fontsReady && st.fontsReady.ok, bad: st.fontBad, fail: st.fontFail }, selectedClip: st.selectedClip,
  };
  if (st.selectedClip && !(st.selectedClip.cls && st.selectedClip.stroke === st.selectedClip.hostColor && st.selectedClip.hostColor === T.brandFg)) out.states[S].issues.push('selected clip stroke');
}
fs.writeFileSync(path.join(__dirname, `../out/ana162-${W}.json`), JSON.stringify(out, null, 1));
for (const [S, s] of Object.entries(out.states)) console.log(W, S, 'issues', JSON.stringify(s.issues), 'icons', s.icons.length, 'box max', s.box.maxDelta, s.box.maxKey, 'over1', s.box.over1, 'missOK', s.box.missingAllowed.length, 'missOther', JSON.stringify(s.box.otherMissing), 'svgAdded', s.box.addedSvg, 'otherAdded', JSON.stringify(s.box.otherAdded), 'paired', JSON.stringify(s.box.paired), 'videoRow', s.box.videoRow.max, 'videoHdr', s.box.videoHeader.max, 'fonts', JSON.stringify(s.fonts), 'dejavu', s.groupNameDejavu);
