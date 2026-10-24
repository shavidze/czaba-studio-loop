// C round 147: LAYOUT-LIB / LAYOUT-REST / NO-GEORGIAN comparison. node cmp147.cjs <W>
const fs = require('fs'); const path = require('path');
const W = process.argv[2];
const base = require(`../../b-round-146/out/libbase147-${W}.json`);
const post = require(`../out/libpost147-${W}.json`);
const rest0 = require(`../../c-round-146/out/c146-${W}.json`).rest;
const COPY = new Set(['lib-h2', 'tree-all-label', 'arrangement-library-filter', 'arrangement-library-empty', 'preview-title', 'preview-lane', 'preview-toggle', 'preview-add', 'header-badge', 'status']);
const d = (a, b) => (a && b ? Math.max(...a.map((v, i) => Math.abs(v - b[i]))) : null);
const res = { W, snapAtStart: post.snapAtStart, states: {}, rest: {}, geo: {} };
for (const st of Object.keys(base.states)) {
  const B = base.states[st].nodes; const P = post.states[st].nodes; const rows = [];
  const keys = new Set([...Object.keys(B), ...Object.keys(P)]);
  for (const k of keys) {
    const b = B[k], p = P[k];
    if (!b || !p) { rows.push({ k, missing: !b ? 'base' : 'post' }); continue; }
    const box = d(b.box, p.box); const dx = Math.abs(b.box[0] - p.box[0]), dy = Math.abs(b.box[1] - p.box[1]), dw = p.box[2] - b.box[2], dh = Math.abs(b.box[3] - p.box[3]);
    const gl = d(b.glyph, p.glyph);
    const swOk = p.sw[0] <= p.sw[1] || (b.sw[0] === p.sw[0] && b.sw[1] === p.sw[1]);
    if (box > 1 || (gl !== null && gl > 1) || b.lines !== p.lines || !swOk || b.text !== p.text || b.aria !== p.aria || b.title !== p.title || b.placeholder !== p.placeholder) {
      let cause = 'UNEXPLAINED';
      const textChanged = b.text !== p.text || b.aria !== p.aria || b.title !== p.title || b.placeholder !== p.placeholder;
      if (box <= 1 && (gl === null || gl <= 1) && b.lines === p.lines && swOk) cause = 'copy-only (box/glyph unchanged)';
      else if (COPY.has(k) && dx <= 1 && dy <= 1 && dh <= 1 && p.lines === 1 && swOk) cause = 'RV-1: copy-changed node, own w/glyph only';
      else if (k === 'header-badge' && Math.abs((b.box[0] + b.box[2]) - (p.box[0] + p.box[2])) <= 1 && dy <= 1 && dh <= 1 && p.lines === 1 && swOk) cause = 'RV-1: badge own w (right-aligned, right edge fixed)';
      else if (box <= 1 && b.lines === p.lines && b.sw[0] === p.sw[0] && b.sw[1] === p.sw[1]) cause = 'container: descendant copy changed, box unchanged (sw equals baseline)';
      else if (k === 'preview-lane' && box <= 1 && p.lines <= 2 && swOk) cause = 'RV-1: preview-lane fixed box, lines 1-2';
      else if (COPY.has(k) && box <= 1 && swOk && p.lines !== b.lines) cause = 'line-count change (inconclusive)';
      rows.push({ k, box, dx, dy, dw, dh, glyph: gl, lines: [b.lines, p.lines], sw: p.sw, text: textChanged ? [b.text, p.text, b.aria, p.aria, b.title, p.title, b.placeholder, p.placeholder] : undefined, cause });
    }
  }
  res.states[st] = { nodes: keys.size, diffs: rows, docW: [base.states[st].docW, post.states[st].docW], status: [base.states[st].status, post.states[st].status] };
}
for (const st of ['ready', 'error']) {
  const B = rest0[st], P = post.rest[st]; const rows = [];
  for (const k of new Set([...Object.keys(B), ...Object.keys(P)])) { if (!B[k] || !P[k]) { rows.push({ k, missing: !B[k] ? 'base' : 'post' }); continue; } const x = d(B[k], P[k]); if (x > 1) rows.push({ k, d: x, b: B[k], p: P[k] }); }
  res.rest[st] = { nodes: Object.keys(P).length, diffs: rows };
}
const LEDGER = ['ღამის პულსი', 'საჯარო preview', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია'];
for (const [st, g] of Object.entries(post.geo)) {
  const other = g.hits.filter((h) => { let v = h.v; for (const w of LEDGER) v = v.split(w).join(''); return /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/.test(v); });
  res.geo[st] = { nodes: g.nodes, hits: g.hits.length, nonLedger: other, ledgerSample: [...new Set(g.hits.map((h) => h.v))].slice(0, 12) };
}
fs.writeFileSync(path.join(__dirname, '..', 'out', `cmp147-${W}.json`), JSON.stringify(res, null, 1));
for (const [st, s] of Object.entries(res.states)) { console.log(`== ${st} nodes ${s.nodes} diffs ${s.diffs.length} docW ${JSON.stringify(s.docW)}`); for (const r of s.diffs) console.log('  ', JSON.stringify(r).slice(0, 400)); }
for (const [st, s] of Object.entries(res.rest)) { console.log(`== REST ${st} nodes ${s.nodes} diffs ${s.diffs.length}`); for (const r of s.diffs) console.log('  ', JSON.stringify(r)); }
for (const [st, s] of Object.entries(res.geo)) console.log(`== GEO ${st} nodes ${s.nodes} hits ${s.hits} nonLedger ${JSON.stringify(s.nonLedger)}`);
console.log('snap', post.snapAtStart, post.snapAtStartError);
