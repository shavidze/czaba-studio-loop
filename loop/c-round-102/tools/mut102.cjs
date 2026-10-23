// C round 102 independent fail-before + mutations a, b, d (+e) in scratch c-round-102/mut
const fs = require('fs'); const { execFileSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop', M = `${L}/c-round-102/mut`, S = '/home/runner/czaba-project/store', SNAP = `${L}/b-round-101-r102-snapshots`;
const D = 'app/components/arrangement/ArrangementExportDialog.tsx';
const T = 'app/lib/arrangement/__tests__/export-dialog-footer.test.tsx';
const cur = fs.readFileSync(`${S}/${D}`, 'utf8');
const base = fs.readFileSync(`${SNAP}/ArrangementExportDialog.tsx`, 'utf8');
const r = (a, b) => { const s = cur.replace(a, b); return s === cur ? null : s; };
const variants = {
  control: cur,
  failBefore: base,
  a_targetOnly: r('Math.max(target.getBoundingClientRect().bottom, cardBottom)', 'target.getBoundingClientRect().bottom'),
  b_labelOnly: r('Math.max(target.getBoundingClientRect().bottom, cardBottom)', '(card ? card.getBoundingClientRect().bottom : 0)'),
  d_noAriaHidden: r('<p\n                  aria-hidden="true"\n', '<p\n'),
  e_secondFormatCall: r('aria-valuetext={progressText ?? undefined}', 'aria-valuetext={formatArrangementExportProgress(progress)}'),
};
const out = {};
fs.copyFileSync(`${S}/${T}`, `${M}/${T}`);
for (const [k, src] of Object.entries(variants)) {
  if (src === null) { out[k] = 'MUTATION-NOT-APPLIED'; console.log(k, out[k]); continue; }
  fs.writeFileSync(`${M}/${D}`, src);
  let o; try { o = execFileSync('npx', ['vitest', 'run', '--reporter=json', T], { cwd: M, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { o = e.stdout; }
  const d = JSON.parse(o.slice(o.indexOf('{')));
  const red = []; for (const t of d.testResults) for (const a of t.assertionResults) if (a.status === 'failed') red.push(a.title.slice(0, 70));
  out[k] = { passed: d.numPassedTests, failed: d.numFailedTests, red };
  console.log(k, JSON.stringify(out[k]));
}
fs.writeFileSync(`${M}/${D}`, cur);
fs.writeFileSync(`${L}/c-round-102/out/mut102.json`, JSON.stringify(out, null, 1));
