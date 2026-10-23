// C round 97 AN-REVIEW: fail-before + mutations a, b, e + control, in C's own scratch (c-round-97/mut)
const fs = require('fs'); const { spawnSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop'; const M = `${L}/c-round-97/mut`; const S = '/home/runner/czaba-project/store';
const DLG = 'app/components/arrangement/ArrangementExportDialog.tsx';
const NEW = 'app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx';
const BASE = `${L}/b-round-96-r97-snapshots/ArrangementExportDialog.tsx`;
const cur = fs.readFileSync(`${S}/${DLG}`, 'utf8');
const once = (src, a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`count ${n} for ${a}`); return src.replace(a, b); };
const variants = {
  'fail-before': fs.readFileSync(BASE, 'utf8'),
  a: once(cur, '                    event.preventDefault();\n', ''),
  b: once(cur, "if (event.key === 'Enter' && event.repeat === true) {", "if (event.key === 'Enter') {"),
  e: once(cur, 'focus-visible:ring-brand"\n                >\n                  გაუქმება', 'focus-visible:ring-brand disabled:opacity-40"\n                >\n                  გაუქმება'),
  control: cur,
};
fs.copyFileSync(`${S}/${NEW}`, `${M}/${NEW}`);
const out = {};
for (const [k, src] of Object.entries(variants)) {
  fs.writeFileSync(`${M}/${DLG}`, src);
  const r = spawnSync('npx', ['vitest', 'run', '--reporter=json', NEW], { cwd: M, encoding: 'utf8', maxBuffer: 1 << 26 });
  const j = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
  const red = []; const all = [];
  for (const t of j.testResults) for (const a of t.assertionResults) { all.push(a.title.slice(0, 3)); if (a.status !== 'passed') red.push(a.title.slice(0, 3)); }
  out[k] = { passed: j.numPassedTests, failed: j.numFailedTests, red, all };
  console.log(k, JSON.stringify(out[k]));
}
fs.writeFileSync(`${M}/${DLG}`, cur);
fs.writeFileSync(`${L}/c-round-97/out/mutations.json`, JSON.stringify(out, null, 1));
