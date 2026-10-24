// node layout145.cjs <W> — LAYOUT-LIB vs b-round-144/out/libbase-W.json, and LAYOUT-REST (ready vs error/previewing, same run)
const fs = require('fs');
const path = require('path');
const W = process.argv[2];
const B = JSON.parse(fs.readFileSync(path.join(__dirname, `../../b-round-144/out/libbase-${W}.json`), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, `../out/c145-${W}.json`), 'utf8'));
const d = (a, b) => a.map((v, i) => +(v - b[i]).toFixed(1));
const res = { W, lib: {}, rest: {} };
for (const st of ['ready', 'previewing', 'error']) {
  const bn = B.states[st].nodes; const cn = C.states[st].nodes;
  const rows = [];
  const keys = new Set([...Object.keys(bn), ...Object.keys(cn)]);
  for (const k of keys) {
    if (!bn[k] || !cn[k]) { rows.push({ k, missing: !bn[k] ? 'baseline' : 'current' }); continue; }
    const dd = d(cn[k].box, bn[k].box);
    const changedText = cn[k].text !== bn[k].text;
    if (Math.max(...dd.map(Math.abs)) > 1 || changedText || cn[k].lines !== bn[k].lines) rows.push({ k, d: dd, lines: [bn[k].lines, cn[k].lines], text: changedText ? [bn[k].text, cn[k].text] : undefined });
  }
  res.lib[st] = { deltas: rows, scrollH: [B.states[st].scrollH, C.states[st].scrollH], status: [B.states[st].status, C.states[st].status] };
}
const r = C.rest.ready;
for (const st of ['previewing', 'error']) {
  const o = C.rest[st]; const rows = [];
  for (const k of Object.keys(r)) { if (!o[k]) { rows.push({ k, missing: 'state' }); continue; } const dd = d(o[k], r[k]); if (Math.max(...dd.map(Math.abs)) > 1) rows.push({ k, d: dd }); }
  for (const k of Object.keys(o)) if (!r[k]) rows.push({ k, missing: 'ready' });
  res.rest[st] = { compared: Object.keys(r).length, deltas: rows };
}
res.libRootVsBase = Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, d(C.states[st].nodes.library.box, B.states[st].nodes.library.box)]));
fs.writeFileSync(path.join(__dirname, `../out/layout145-${W}.json`), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
