// C round 99 independent fail-before + mutations a,b,c,g (scratch only)
const fs = require('fs'); const { execFileSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop', M = `${L}/c-round-99/mut`, S = '/home/runner/czaba-project/store', SNAP = `${L}/b-round-98-r99-snapshots`;
const LIB = 'app/components/arrangement/ArrangementLibrary.tsx', WS = 'app/components/arrangement/StudioWorkspace.tsx', PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx';
const NEW = 'app/lib/arrangement/__tests__/held-enter-add.test.tsx';
const cur = Object.fromEntries([LIB, WS, PRE].map((f) => [f, fs.readFileSync(`${S}/${f}`, 'utf8')]));
const base = Object.fromEntries([LIB, WS, PRE].map((f) => [f, fs.readFileSync(`${SNAP}/${f.split('/').pop()}`, 'utf8')]));
const rep = (f, re, to) => { const s = cur[f].replace(re, to); return s === cur[f] ? null : { [f]: s }; };
const variants = {
  control: {},
  failBefore: base,
  a_rowNoGuard: rep(LIB, /if \(!event\.repeat\) \{\s*selectSource\(sourceId\);\s*addSourceToActiveTrack\(sourceId\);\s*\}/, 'selectSource(sourceId);\n      addSourceToActiveTrack(sourceId);'),
  b_globalNoGuard: rep(WS, /if \(!event\.repeat\) \{\s*current\.addSourceToActiveTrack\(\);\s*\}/, 'current.addSourceToActiveTrack();'),
  c_plusNoGuard: rep(PRE, /\s*onKeyDown=\{\(event\) => \{\s*if \(event\.key === 'Enter' && event\.repeat\) \{\s*event\.preventDefault\(\);\s*\}\s*\}\}/, ''),
  g_plusStopProp: rep(PRE, /(if \(event\.key === 'Enter' && event\.repeat\) \{\s*event\.preventDefault\(\);)/, '$1\n              event.stopPropagation();'),
};
const out = {};
for (const [k, files] of Object.entries(variants)) {
  if (files === null) { out[k] = 'MUTATION-NOT-APPLIED'; console.log(k, out[k]); continue; }
  for (const f of [LIB, WS, PRE]) fs.writeFileSync(`${M}/${f}`, files[f] ?? cur[f]);
  fs.copyFileSync(`${S}/${NEW}`, `${M}/${NEW}`);
  let o; try { o = execFileSync('npx', ['vitest', 'run', '--reporter=json', NEW], { cwd: M, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { o = e.stdout; }
  const d = JSON.parse(o.slice(o.indexOf('{')));
  const red = []; for (const t of d.testResults) for (const a of t.assertionResults) if (a.status === 'failed') red.push(a.title.slice(0, 3));
  out[k] = { passed: d.numPassedTests, failed: d.numFailedTests, red };
  console.log(k, JSON.stringify(out[k]));
}
for (const f of [LIB, WS, PRE]) fs.writeFileSync(`${M}/${f}`, cur[f]);
fs.writeFileSync(`${L}/c-round-99/out/mut99.json`, JSON.stringify(out, null, 1));
