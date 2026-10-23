// C round 98 independent fail-before + mutations a,b,d (scratch only)
const fs = require('fs'); const { execFileSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop', M = `${L}/c-round-98/mut`, S = '/home/runner/czaba-project/store';
const TR = 'app/components/arrangement/ArrangementTransport.tsx', NEW = 'app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx';
const cur = fs.readFileSync(`${S}/${TR}`, 'utf8');
const variants = {
  control: cur,
  failBefore: fs.readFileSync(`${L}/b-round-97-r98-snapshots/ArrangementTransport.tsx`, 'utf8'),
  a_noGuard: cur.replace(/\n\s*event\.preventDefault\(\);\n(\s*\}\n\s*\}\})/, '\n$1'),
  b_everyEnter: cur.replace("event.key === 'Enter' && event.repeat", "event.key === 'Enter'"),
  d_stopProp: cur.replace(/event\.preventDefault\(\);/, 'event.preventDefault();\n              event.stopPropagation();'),
};
const out = {};
for (const [k, src] of Object.entries(variants)) {
  if (k !== 'control' && k !== 'failBefore' && src === cur) { out[k] = 'MUTATION-NOT-APPLIED'; continue; }
  fs.writeFileSync(`${M}/${TR}`, src); fs.copyFileSync(`${S}/${NEW}`, `${M}/${NEW}`);
  let o; try { o = execFileSync('npx', ['vitest', 'run', '--reporter=json', NEW], { cwd: M, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { o = e.stdout; }
  const d = JSON.parse(o.slice(o.indexOf('{')));
  const red = []; for (const t of d.testResults) for (const a of t.assertionResults) if (a.status === 'failed') red.push(a.title.slice(0, 3));
  out[k] = { passed: d.numPassedTests, failed: d.numFailedTests, red };
  console.log(k, JSON.stringify(out[k]));
}
fs.writeFileSync(`${M}/../out/mut98.json`, JSON.stringify(out, null, 1));
fs.writeFileSync(`${M}/${TR}`, cur);
