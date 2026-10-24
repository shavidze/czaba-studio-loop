// node layout146.cjs <W> — LAYOUT-LIB (i)-(v) vs b-round-144/out/libbase-W.json, and LAYOUT-REST, from out/c146-W.json
const fs = require('fs');
const path = require('path');
const W = process.argv[2];
const B = JSON.parse(fs.readFileSync(path.join(__dirname, `../../b-round-144/out/libbase-${W}.json`), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, `../out/c146-${W}.json`), 'utf8'));
const d = (a, b) => a.map((v, i) => +(v - b[i]).toFixed(2));
const mx = (a) => Math.max(...a.map(Math.abs));
const res = { W, lib: {}, rest: {}, rules: {} };
const SOFT = 'opt:demo-soft-impact';
for (const st of ['ready', 'previewing', 'error']) {
  const bn = B.states[st].nodes; const cn = C.states[st].nodes;
  const rows = [];
  for (const k of new Set([...Object.keys(bn), ...Object.keys(cn)])) {
    if (!bn[k] || !cn[k]) { rows.push({ k, missing: !bn[k] ? 'baseline' : 'current' }); continue; }
    const dd = d(cn[k].box, bn[k].box);
    if (mx(dd) > 1 || cn[k].lines !== bn[k].lines) rows.push({ k, d: dd, lines: [bn[k].lines, cn[k].lines], text: cn[k].text !== bn[k].text ? [bn[k].text, cn[k].text] : undefined });
  }
  res.lib[st] = { compared: Object.keys(cn).length, deltas: rows };
}
// (i) ready + error: every node d<=1 (text differences are round-145 English strings, already accepted; reported, not geometry)
const geomOnly = (rows) => rows.filter((r) => r.missing || mx(r.d) > 1);
res.rules.i = { ready: geomOnly(res.lib.ready.deltas), error: geomOnly(res.lib.error.deltas) };
res.rules.i.ok = res.rules.i.ready.length === 0 && res.rules.i.error.length === 0;
// (ii) previewing Soft impact
const cp = C.states.previewing.nodes; const bp = B.states.previewing.nodes; const br = B.states.ready.nodes;
const ii = {
  option: { cur: cp[SOFT].box, base: bp[SOFT].box, d: d(cp[SOFT].box, bp[SOFT].box) },
  meta: { cur: cp[`${SOFT}:meta`].box, baseReady: br[`${SOFT}:meta`].box, d: d(cp[`${SOFT}:meta`].box, br[`${SOFT}:meta`].box), lines: cp[`${SOFT}:meta`].lines },
  meta0: { cur: cp[`${SOFT}:meta0`].box, baseReady: br[`${SOFT}:meta0`].box, d: d(cp[`${SOFT}:meta0`].box, br[`${SOFT}:meta0`].box) },
  meta1: { cur: cp[`${SOFT}:meta1`].box, baseReady: br[`${SOFT}:meta1`].box, d: d(cp[`${SOFT}:meta1`].box, br[`${SOFT}:meta1`].box) },
  meta2Present: !!cp[`${SOFT}:meta2`],
  marker: cp[`${SOFT}:marker`],
};
const mk = ii.marker.box; const metaY = ii.meta.cur[1];
ii.markerChecks = { x: mk[0], xOk: Math.abs(mk[0] - 156) <= 1, yRel: +(mk[1] - metaY).toFixed(2), yOk: Math.abs(mk[1] - metaY - 16) <= 1, h: mk[3], hOk: Math.abs(mk[3] - 16) <= 1, right: mk[0] + mk[2], rightOk: mk[0] + mk[2] <= 267, lines: ii.marker.lines, glyph: C.m.markerSoft.glyph, glyphRight: C.m.markerSoft.glyphRight };
ii.ok = mx(ii.option.d) <= 1 && mx(ii.meta.d) <= 1 && mx(ii.meta0.d) <= 1 && mx(ii.meta1.d) <= 1 && !ii.meta2Present && Object.entries(ii.markerChecks).filter(([k]) => k.endsWith('Ok')).every(([, v]) => v);
res.rules.ii = ii;
// (iii) every other previewing node vs libbase previewing (exclude Soft impact own nodes, which (ii) covers)
const own = (k) => k === SOFT || k.startsWith(`${SOFT}:`);
res.rules.iii = { deltas: res.lib.previewing.deltas.filter((r) => !own(r.k) && (r.missing || mx(r.d) > 1)), textOnly: res.lib.previewing.deltas.filter((r) => !own(r.k) && !r.missing && mx(r.d) <= 1) };
res.rules.iii.ok = res.rules.iii.deltas.length === 0;
// (iv) scrollWidth == clientWidth for options and list/tree in all three states
const P = C.probe;
res.rules.iv = Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, { scrollers: P[st].scrollers.map((s) => [s.t, s.sw, s.cw]), badOptions: P[st].options.filter((o) => o.sw !== o.cw), nOptions: P[st].options.length }]));
res.rules.iv.ok = ['ready', 'previewing', 'error'].every((st) => P[st].scrollers.every((s) => s.sw === s.cw) && res.rules.iv[st].badOptions.length === 0);
// (v) scroll-to-last, page overflow, clipped text
res.rules.v = { scrollLast: C.scrollLast, errorScrollLast: C.errorScrollLast, doc: Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, P[st].doc])), over: Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, P[st].over])), clippedText: Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, P[st].clippedText])) };
res.rules.v.ok = Object.values(C.scrollLast).every((x) => x.inside) && Object.values(C.errorScrollLast).every((x) => x.inside) && ['ready', 'previewing', 'error'].every((st) => P[st].doc.sw <= P[st].doc.cw && P[st].clippedText.length === 0);
// LAYOUT-REST
const r = C.rest.ready;
for (const st of ['previewing', 'error']) {
  const o = C.rest[st]; const rows = [];
  for (const k of Object.keys(r)) { if (!o[k]) { rows.push({ k, missing: 'state' }); continue; } const dd = d(o[k], r[k]); if (mx(dd) > 1) rows.push({ k, d: dd }); }
  for (const k of Object.keys(o)) if (!r[k]) rows.push({ k, missing: 'ready' });
  res.rest[st] = { compared: Object.keys(r).length, deltas: rows };
}
res.libRootVsBase = Object.fromEntries(['ready', 'previewing', 'error'].map((st) => [st, d(C.states[st].nodes.library.box, B.states[st].nodes.library.box)]));
res.restOk = res.rest.previewing.deltas.length === 0 && res.rest.error.deltas.length === 0 && Object.values(res.libRootVsBase).every((x) => mx(x) <= 1);
fs.writeFileSync(path.join(__dirname, `../out/layout146-${W}.json`), JSON.stringify(res, null, 1));
console.log(W, 'i', res.rules.i.ok, 'ii', ii.ok, 'iii', res.rules.iii.ok, 'iv', res.rules.iv.ok, 'v', res.rules.v.ok, 'rest', res.restOk);
console.log(JSON.stringify({ i: res.rules.i, ii, iii: res.rules.iii.deltas, iv: res.rules.iv, rest: res.rest, root: res.libRootVsBase }, null, 0).slice(0, 4000));
