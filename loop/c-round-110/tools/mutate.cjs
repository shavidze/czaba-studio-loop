const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const M = path.join(__dirname, '..', 'mut');
const S = path.join(M, 'store');
const FILE = path.join(S, 'app/components/arrangement/ArrangementLibrary.tsx');
const TEST = 'app/lib/arrangement/__tests__/library-focus-handoff.test.tsx';
const SNAP = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-109-r110-snapshots/ArrangementLibrary.tsx';
const fixed = fs.readFileSync('/home/runner/czaba-project/store/app/components/arrangement/ArrangementLibrary.tsx', 'utf8');

const muts = {
  control_before: (s) => s,
  fail_before: () => fs.readFileSync(SNAP, 'utf8'),
  m1_no_handoff: (s) => s.replace('partner.focus({ preventScroll: true });', 'void partner;').replace('librarySearchInputRef.current?.focus();', 'void librarySearchInputRef;'),
  m2_arm_always: (s) => s.replace("document.activeElement === event.currentTarget ? (collapsed ? 'expand' : 'collapse') : null;", "event.isTrusted === event.isTrusted ? (collapsed ? 'expand' : 'collapse') : null;"),
  m4_guard_only_clear: (s) => s.replace("if (event.key === 'Enter' && event.repeat) {", "if (event.key === 'Enter' && event.repeat && event.currentTarget.dataset.testid === 'arrangement-library-search-clear') {"),
  control_after: (s) => s,
};

const results = {};
for (const [name, fn] of Object.entries(muts)) {
  const src = fn(fixed);
  if (name.startsWith('m') && src === fixed) { results[name] = { error: 'mutation string not found' }; console.log(name, 'NOT APPLIED'); continue; }
  fs.writeFileSync(FILE, src);
  const json = path.join(M, `vitest-${name}.json`);
  try {
    execFileSync('npx', ['vitest', 'run', TEST, '--reporter=json', `--outputFile=${json}`], { cwd: S, stdio: 'pipe', timeout: 300000 });
  } catch (e) { /* red tests exit 1 */ }
  const r = JSON.parse(fs.readFileSync(json, 'utf8'));
  const tests = r.testResults.flatMap((f) => f.assertionResults);
  const red = tests.filter((t) => t.status !== 'passed').map((t) => t.title.split(':')[0]);
  results[name] = { total: tests.length, passed: tests.length - red.length, red };
  console.log(name, JSON.stringify(results[name]));
}
fs.writeFileSync(FILE, fixed);
fs.writeFileSync(path.join(__dirname, '..', 'out', 'mutations.json'), JSON.stringify(results, null, 1));
