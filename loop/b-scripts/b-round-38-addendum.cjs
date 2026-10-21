const fs = require('fs');
let s = fs.readFileSync('b-round-38.md', 'utf8');
const a = "  - One place: a `setStatus` wrapper with the same signature, plus the count-0 branch of `beginPointerGesture`'s release.";
if (!s.includes(a)) throw new Error('a');
s = s.replace(a, "  - One place: the raw setter stays; a `useLayoutEffect([status])` tracks the last non-refusal status, and the count-0 branch of `beginPointerGesture`'s release restores it with the functional `setStatus` (amended after the second advisor call, §9).");
const b = '- B applied all three candidate changes to a scratch copy and ran the full suite: **70 files / 1290 passed**.';
if (!s.includes(b)) throw new Error('b');
s = s.replace(b, '- B applied all three candidate changes to a scratch copy and ran the full suite: **70 files / 1290 passed** with the first (wrapper) variant, and **1289 + 1 load timeout** with the final design (§9).');
const c = '## 9. Second advisor call\n\nSee the addendum below; it is written after the call.\n';
if (!s.includes(c)) throw new Error('c');
s = s.replace(c, [
  '## 9. Second advisor call (after the files were written)',
  '',
  '**Finding 1 (blocking, fixed):** the planned `setStatus` wrapper would no longer be a stable setter for Biome.',
  '- B checked the patched probe file: Biome reported **≈27 new `useExhaustiveDependencies` warnings** (the rule is `warn` in `biome.json`).',
  '- That breaks the "≤ 218 warnings" gate, and fixing it would mean touching ~15 deps arrays outside scope.',
  '- **Amended design:**',
  '  - the raw `useState` setter stays;',
  '  - `useLayoutEffect([status])` keeps the last non-refusal status in a ref;',
  '  - at count 0, `setStatus(current => refusal ? ref : current)`.',
  '- **Re-probed** (`probe-context-v2.diff`):',
  '  - Biome: `Checked 1 file … No fixes applied`;',
  '  - full vitest: **1289 passed + 1 timeout** (`track-layout` fold test, 5450 ms under load; alone 36/36 twice);',
  '  - behaviour probe `probe-st.test.snippet`, old code: refusal kept (S1, S5 red);',
  '  - behaviour probe, v2: `X` restored (S1, also within one `act`), `X` restored (S5), `Y` kept (S3).',
  '- **One semantic difference, now in the contract:** refusal → T → second refusal → release restores **T**, the most recent non-refusal (new test S5b, mutation b2).',
  '- Updated: `current-task.md` (§Baseline probe, §0.1 table, §0.2 decision 1, §1.4, §2.1, §3.2, S5b, R39-S, R39-U), `plan.md` D-29z4, `backlog.json` (`decisions_round39`, `advisor_used_by_B`) and `feature-status.md`. Script: `b-scripts/b-round-38-amend-v2.cjs`.',
  '',
  '**Finding 2 (checked):** `toggleTrackMute` refuses during a gesture (`refuseEditDuringGesture`, l.2029), so S1 stays as written.',
  '',
  "**Finding 3 (recorded):** `claimPointerGesture`'s same-pointer re-claim releases before it re-counts, so the count touches 0 for an instant and the restore fires then. This is harmless and accepted. It is recorded in D-29z4 and §0.2 decision 1, and doc 038 must list it.",
  '',
  '**Decision unchanged: CONTINUE.**',
  '',
].join('\n'));
fs.writeFileSync('b-round-38.md', s);
const n = JSON.parse(fs.readFileSync('b-next.json', 'utf8'));
const w = 'implemented once in the context (setStatus wrapper, same signature, + beginPointerGesture release)';
if (!n.nextTask.includes(w)) throw new Error('w');
n.nextTask = n.nextTask
  .replace(w, 'implemented once in the context: the raw useState setter stays, a useLayoutEffect keeps the last non-refusal status in a ref, and the count-0 branch of beginPointerGesture restores it with a functional setStatus (a wrapper was rejected: about 27 new Biome warnings in B probe); refusal -> T -> second refusal -> release = T')
  .replace('S1-S9, PM1-PM6', 'S1-S9 + S5b, PM1-PM6')
  .replace('No frozen-test amendment (B scratch probe: all three changes keep 1290/1290)', 'No frozen-test amendment (B scratch probe of the final design: 1289 + 1 load timeout that passes alone, Biome clean)')
  .replace('mutations a-g', 'mutations a-g + b2');
fs.writeFileSync('b-next.json', `${JSON.stringify(n, null, 2)}\n`);
const cp = fs.readFileSync('b-round-38-checkpoint.md', 'utf8').split('\n');
const i = cp.findIndex((l) => l.startsWith('DONE: '));
if (i < 0) throw new Error('cp');
cp[i] = 'COMPLETE: all B round-38 artifacts written; advisor 2nd call applied (wrapper -> useLayoutEffect design, re-probed: Biome clean, behaviour red/green). Nothing pending.';
fs.writeFileSync('b-round-38-checkpoint.md', cp.join('\n'));
console.log('ok');
