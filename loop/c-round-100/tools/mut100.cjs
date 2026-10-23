// C round 100 independent fail-before + mutations a,b,c,d (scratch only: c-round-100/mut, cacheDir in scratch)
const fs = require('fs'); const { execFileSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop', M = `${L}/c-round-100/mut`, S = '/home/runner/czaba-project/store', SNAP = `${L}/b-round-99-r100-snapshots`;
const PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx';
const T = 'app/lib/arrangement/__tests__/library-preview.test.tsx';
const cur = fs.readFileSync(`${S}/${PRE}`, 'utf8');
const base = fs.readFileSync(`${SNAP}/ArrangementLibraryPreview.tsx`, 'utf8');
// the toggle guard is the FIRST onKeyDown guard after the toggle onClick (before 'disabled={!isReady}')
const G = /(startLibraryPreview\(source\.id, 0\);\s*\}\s*\}\}\s*)onKeyDown=\{\(event\) => \{\s*if \(event\.key === 'Enter' && event\.repeat\) \{\s*event\.preventDefault\(\);\s*\}\s*\}\}\s*(disabled=\{!isReady\})/;
const rep = (to) => { const s = cur.replace(G, to); return s === cur ? null : s; };
const guard = (cond, extra = '') => `$1onKeyDown={(event) => {\n            if (${cond}) {\n              event.preventDefault();${extra}\n            }\n          }}\n          $2`;
const variants = {
  control: cur,
  failBefore: base,
  a_noGuard: rep('$1$2'),
  b_noKeyCheck: rep(guard('event.repeat')),
  c_stopProp: rep(guard("event.key === 'Enter' && event.repeat", '\n              event.stopPropagation();')),
  d_everyEnter: rep(guard("event.key === 'Enter'")),
};
const out = {};
fs.copyFileSync(`${S}/${T}`, `${M}/${T}`);
for (const [k, src] of Object.entries(variants)) {
  if (src === null) { out[k] = 'MUTATION-NOT-APPLIED'; console.log(k, out[k]); continue; }
  fs.writeFileSync(`${M}/${PRE}`, src);
  let o; try { o = execFileSync('npx', ['vitest', 'run', '--reporter=json', T], { cwd: M, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { o = e.stdout; }
  const d = JSON.parse(o.slice(o.indexOf('{')));
  const red = []; for (const t of d.testResults) for (const a of t.assertionResults) if (a.status === 'failed') red.push(a.title.slice(0, 40));
  out[k] = { passed: d.numPassedTests, failed: d.numFailedTests, red };
  console.log(k, JSON.stringify(out[k]));
}
fs.writeFileSync(`${M}/${PRE}`, cur);
fs.writeFileSync(`${L}/c-round-100/out/mut100.json`, JSON.stringify(out, null, 1));
