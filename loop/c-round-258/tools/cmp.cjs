// C round 258: compare a replayed row JSON with the accepted round's JSON (strings and booleans only;
// numbers, timings, uuids and errors ignored). usage: node cmp.cjs <new.json> <accepted.json> <rowRegex>
const fs = require('fs');
const [nf, af, re] = process.argv.slice(2);
const N = JSON.parse(fs.readFileSync(nf, 'utf8')).rows; const A = JSON.parse(fs.readFileSync(af, 'utf8')).rows;
const rx = new RegExp(re);
const SKIP = /^(t|ms|id|ids|clip|clipId|started|finished|setup|before\w*Ms|dt|chromium|samples|ticks|periods|live|modeChanges|keys|rms\w*|pos\w*|wav|sha256|file|files)$/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const norm = (v) => (typeof v === 'string' ? v.replace(UUID, 'UUID') : v);
const diffs = [];
function walk(a, b, p) {
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    if ((typeof a === 'string' || typeof a === 'boolean' || typeof b === 'string' || typeof b === 'boolean') && norm(a) !== norm(b)) diffs.push({ p, accepted: a, now: b });
    return;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) { if (SKIP.test(k) || /^errors/.test(k)) continue; walk(a[k], b[k], `${p}.${k}`); }
}
let n = 0;
for (const k of Object.keys(N)) { if (!rx.test(k.split('@')[0])) continue; n += 1; if (!A[k]) { diffs.push({ p: k, accepted: 'MISSING', now: 'present' }); continue; } walk(A[k], N[k], k); }
const errs = Object.entries(N).filter(([k]) => rx.test(k.split('@')[0])).map(([k, v]) => [k, (v.errors || []).length + (v.error ? 1 : 0)]).filter(([, c]) => c);
console.log(JSON.stringify({ rows: n, diffs: diffs.length, errs }, null, 0));
for (const d of diffs) console.log(JSON.stringify(d).slice(0, 600));
