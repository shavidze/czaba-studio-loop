const a = require(process.argv[2]), b = require(process.argv[3]);
for (const vp of ['1440', '1280']) for (const st of ['none', 'single', 'multi', 'video', 'videoMulti']) {
  const A = a[vp] && a[vp][st], B = b[vp] && b[vp][st];
  if (!A) { console.log(vp, st, 'MISSING new', b[vp] && b[vp].videoErr); continue; }
  console.log(`== ${vp} ${st} panel new ${A.panel} base ${B ? B.panel : '-'} contentScroll ${A.contentScroll} clipped ${A.clippedBelowPanel.length}`);
  for (const [id, n] of Object.entries(A.nodes)) {
    const o = B && B.nodes[id];
    const d = o ? n.box.map((v, i) => +(v - o.box[i]).toFixed(1)) : null;
    const moved = d && d.some((x) => Math.abs(x) > 1);
    const lineUp = o && n.lines > o.lines;
    if (moved || lineUp || n.overflowX || !o) console.log(`  ${id} d=${d} lines ${o ? o.lines : '-'}->${n.lines} ovX=${n.overflowX} "${n.text.slice(0, 70)}"`);
  }
}
for (const vp of ['1440', '1280']) console.log(vp, 'collapsed', JSON.stringify(a[vp].collapsed));
