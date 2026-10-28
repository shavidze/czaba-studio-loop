import { readFileSync, writeFileSync } from 'node:fs';
const b = JSON.parse(readFileSync(process.argv[2])); const a = JSON.parse(readFileSync(process.argv[3]));
const out = {};
for (const k of Object.keys(b)) {
  const m = new Map(); const key = (r) => `${r.region}\u0000${r.text}`;
  for (const r of b[k]) m.set(key(r), (m.get(key(r)) || 0) + 1);
  for (const r of a[k] || []) m.set(key(r), (m.get(key(r)) || 0) - 1);
  const removed = [], added = [];
  for (const [kk, v] of m) { const [region, text] = kk.split('\u0000'); if (v > 0) removed.push({ region, text, n: v }); if (v < 0) added.push({ region, text, n: -v }); }
  out[k] = { before: b[k].length, after: (a[k] || []).length, removed, added };
}
writeFileSync(process.argv[4], JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
