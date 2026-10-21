const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const edit = (name, pairs) => {
  const file = path.join(root, name);
  let t = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) {
    const i = t.indexOf(a);
    if (i < 0 || t.indexOf(a, i + 1) >= 0) throw new Error(`${name} anchor: ${a.slice(0, 70)}`);
    t = t.replace(a, b);
  }
  fs.writeFileSync(file, t);
};
edit('b-round-11.md', [
  ['     - New rule: while settle is armed and |d| > 0.12, the steady rule applies.\n', '     - New rule (refined after the second advisor call, §9): while settle is armed, the steady rate is written whenever it is at a stall edge; otherwise the settle rate is written.\n'],
  ['| Large drift during settle | Steady rule, so D-24 keeps priority | Settle must not mask a genuine stall. |', '| Large drift during settle | Steady rate whenever it is at a stall edge (`isVideoRateAtStallEdge`), so D-24 keeps priority | Settle must not mask a genuine stall, and escalation timing stays identical. |'],
  ['See the addendum below; it is filled in after the call.\n', `The advisor was available and was called after all files were written. It confirmed CONTINUE and round 12 = C-R7-01. I applied its corrections with \`b-scripts/fix-r12-advice.js\` and \`fix-r12-advice2.js\`:

1. **The D-24 priority rule could fail its own test by one frame.**
   - The steady rule reaches 1.50 at |d| ≥ 0.11875, but my |d| > 0.12 switch gave 1.45 in [0.11875, 0.12].
   - \`shouldEscalateVideoStall\` stops at the first non-edge sample, so escalation could be delayed by one frame, depending on phase.
   - **New rule:** during settle, if the steady rate is at a stall edge (\`isVideoRateAtStallEdge\`), write the steady rate; otherwise write the settle rate. Every steady edge sample is then an edge sample under settle, and the escalation sequence is identical.
   - The R12-U stall-priority simulation now requires **exactly the same** escalation frame.
   - C checks the 1.45 cap at |d| ≤ 0.11, which keeps a margin below 0.11875.
   - Updated in the task (§2.1, §4), in \`plan.md\` and in backlog SRW-03.
2. **The plan's settle range** now reads [0.55, 1.45], the same as the task's constants table.
3. **The R12-S median |d|** is now information only. Round 10 has no median baseline; the steady-state check is R3-V1 mode N.

The decision is unchanged: **CONTINUE**.
`],
]);
edit('b-next.json', [
  ['steady rule for |d| > 0.12;', 'steady rate written whenever it is at a stall edge (identical D-24 escalation timing);'],
  ['(3) D-24 priority for |d| > 0.12.', '(3) D-24 priority: the steady rate is written whenever it is at a stall edge.'],
]);
JSON.parse(fs.readFileSync(path.join(root, 'b-next.json'), 'utf8'));
console.log('ok');
