const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const file = path.join(dir, 'b-round-9.md');
let s = fs.readFileSync(file, 'utf8');
const a = '(d) the 40 ms positioned tolerance plus the exact-seed assumption';
if (!s.includes(a)) throw new Error('d wording missing');
s = s.replace(
  a,
  '(d) the 40 ms positioned tolerance plus `play()` start latency, which the bounded rate ramp cannot recover within 300 ms (corrected after the second advisor call, §9)',
);
const old = '## 9. Second advisor call (after writing)\n\nSee the addendum below, written after the call.\n';
if (!s.includes(old)) throw new Error('section 9 missing');
s = s.replace(
  old,
  [
    '## 9. Second advisor call (after writing)',
    '',
    'The advisor was available and was called after all files were written. It confirmed CONTINUE, the round-10 cut, the backlog scope, the frozen-file gate and the disclosure of the C-R7-02 bundle. I applied three corrections (script `b-scripts/task-r10-fix.js`, plus aligned lines in `b-next.json` and backlog SRW-03/C-R7-01 `hypothesis_round10`):',
    '',
    '1. **Hypothesis (d) named the wrong mechanism.** My draft said the `lastSample` seed hides the standby offset from the rate controller.',
    '   - I checked the code: `ArrangementVideoDock.tsx` l.446–451 and l.523–560.',
    '   - `lastSample` feeds only `mappingJump`. The rate controller uses `drift = frame − unclamped` on every step once `playPending` is false.',
    '   - So (d) is now: a standby accepted up to 0.04 s behind, plus `play()` latency, which the bounded ramp (0.05 per step) cannot recover within 300 ms.',
    '   - The "re-seed `lastSample`" fix shape is removed and explicitly forbidden. It would have been a no-op with a green test.',
    '   - The remaining (d) shapes are a one-frame readiness tolerance with an honest fallback, or a standby pre-roll.',
    "2. **R10-W2 no longer presupposes a reproduced failure.** If none of A's wraps lands below 2.29, A cannot confirm (a), (b) or (d). A then reports \"inconclusive\", does not change source on that basis, and still reports the distribution of the readiness offset.",
    '3. **R10-R1 reference.** The comparison sweep is round 7, not round 9.',
    '',
    "I also recorded a note, without changing the tolerance: round 5's passing RF5-2 evidence was vt ∈ [2.275, 2.311], so the [2.29, 2.31] window is not proven tight. A (c) or (m) outcome that is routed to the Tech Lead quiet-Chrome run is therefore a legitimate end state.",
    '',
    'The decision is unchanged: **CONTINUE**.',
    '',
  ].join('\n'),
);
fs.writeFileSync(file, s);
for (const f of ['b-next.json', 'backlog.json']) JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
fs.appendFileSync(
  path.join(dir, 'b-round-9-checkpoint.md'),
  '- [DONE] advisor 2 applied (d mechanism corrected, R10-W2 inconclusive path, R10-R1 round 7, round-5 window note). Addendum in b-round-9.md §9.\n',
);
console.log('addendum written');
