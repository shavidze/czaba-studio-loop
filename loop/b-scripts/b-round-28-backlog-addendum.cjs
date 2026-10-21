const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 30) {
  throw new Error('unexpected version ' + b.version);
}
const r2702 = b.open_findings.find((x) => x.id === 'C-R27-02');
if (r2702.round29_rule) {
  throw new Error('already applied');
}
r2702.round29_rule =
  'D-29t (B, 2026-10-12, after B counted 10 node.exe): "low load" = node.exe < 30 at batch time. Round 29 C runs the frozen 8 batch x3: 3/3 green at < 30 -> closed; any failure at < 30 -> test-robustness item; runs at >= 30 do not count.';
const round29 = b.rounds.find((r) => r.round === 29);
round29.c_ids = ['G29-1', 'G29-2', 'G29-3', 'R29-PA', 'R29-PB', 'R29-PC', 'R29-PD', 'R29-NO', 'R29-NE', 'R29-FT', 'R29-UR', 'R29-K', 'R29-R', 'R29-S', 'R29-U', 'R29-Doc', 'C-R27-02-rule', 'C-R23-01-record'];
round29.owned = [
  'app/lib/arrangement/clipboard.ts',
  'app/contexts/ArrangementContext.tsx (cutTimeSelection only)',
  'app/components/arrangement/StudioWorkspace.tsx (arrangement-range paragraph only)',
  'docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md',
  'app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx (new)',
];
b.b_resume_note_round28 =
  'B round 28 planning was interrupted (API error) after backlog v30 was written; the plan.md script was corrupted by shell escaping and never ran. The resumed B session (2026-10-12) re-verified v30 against c-round-28.json (matches), applied plan.md via b-scripts/b-round-28-plan-v2.cjs, and wrote current-task.md, feature-status.md, b-round-28.md and b-next.json.';
fs.writeFileSync(file, JSON.stringify(b, null, 2) + '\n', 'utf8');
console.log('backlog addendum applied');
