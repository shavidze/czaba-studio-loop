const fs = require('fs');
const rep = (file, from, to) => {
  const s = fs.readFileSync(file, 'utf8');
  if (!s.includes(from)) throw new Error(`${file}: missing ${from.slice(0, 60)}`);
  fs.writeFileSync(file, s.replace(from, to));
};

rep('current-task.md',
  `- if root **has** committed round 31's 7 files: exactly **4** lines:
  \`\`\`
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  \`\`\``,
  `- if root **has** committed round 31's 7 files as they are: exactly **4** lines:
  \`\`\`
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  \`\`\`
- if root committed only round 31's **5 untouched** files (\`ArrangementContext.tsx\`, \`graph.client.ts\`, \`model.ts\`, \`types/arrangement.ts\`, \`track-pan.test.tsx\`): exactly **4** lines, the same as above except that doc 036 stays untracked (\`?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md\`).
- Any other root commit: record it, and check every line against this section.`);

rep('current-task.md',
  `- Pan and Volume keyboard steps on a focused fader still write one entry each.`,
  `- Pan and Volume keyboard steps on a focused fader still write one entry each.
- With the music Pan focused at a non-centre value, a real click on the Pan readout (reset): the pan returns to C with one entry, and the Pan slider has focus afterwards (round-31 deviation 8; the new handler blurs first, then the reset focuses the slider again).`);

rep('current-task.md',
  `- the second-remote reconcile (no force push);
`,
  ``);
rep('current-task.md',
  `- the dev server's availability;
- **round 31's 7 C-verified files`,
  `- the dev server's availability;
- **resolved:** the second remote. B ran \`git ls-remote\` on 2026-10-13, and both \`TCzaba/czaba-store\` and \`shavidze/czaba-store\` \`master\` are at \`1cefea1\` (matches \`publication-checkpoint.json\` \`oct13Checkpoint.status\`);
- **round 31's 7 C-verified files`);

rep('feature-status.md',
  `| FOCUS-TEXT-STALE | info (B-ის დაკვირვება) | **მოწმდება** (Round 33: მხოლოდ ჩაწერა) |`,
  `| FOCUS-TEXT-STALE | info (B-ის დაკვირვება) | **არ დაწყებულა** (Round 33: მხოლოდ ჩაწერა) |`);
rep('feature-status.md',
  '- `08b9e53` და `1cefea1` დაკომიტებულია. მეორე remote-ის push non-fast-forward-ით უარყოფილი იყო — შესათანხმებელია force push-ის გარეშე.',
  '- `08b9e53` და `1cefea1` დაკომიტებულია. მეორე remote-ის საკითხი მოგვარებულია: B-ის `git ls-remote` (2026-10-13) — ორივე remote-ის `master` = `1cefea1` (`publication-checkpoint.json` `oct13Checkpoint`).');
rep('feature-status.md',
  'მეორე remote-ის push non-fast-forward-ით უარყოფილი იყო — root-მა უნდა შეათანხმოს force push-ის გარეშე.',
  'მეორე remote-ის push თავიდან non-fast-forward-ით უარყოფილი იყო; ახლა ორივე remote `1cefea1`-ზეა (B-ის `git ls-remote`, 2026-10-13) — მოგვარებულია.');

rep('b-round-32.md',
  '`root-pre-push-review.md` / `publication-checkpoint.json` (through the carried list in `b-round-31.md` §7 and `c-round-32.md`)',
  '`root-pre-push-review.md` and `publication-checkpoint.json` (read directly in this round, after the advisor\'s second call, and compared with the carried list in `b-round-31.md` §7 and `c-round-32.md`)');
rep('b-round-32.md',
  `- the second remote's non-fast-forward (reconcile without force);
`,
  ``);
rep('b-round-32.md',
  `**Still open (root):**`,
  `**Resolved since round 31 (B evidence):** the second remote. \`git ls-remote\` on 2026-10-13 shows \`master\` = \`1cefea1\` on both \`TCzaba/czaba-store\` and \`shavidze/czaba-store\`. That matches \`publication-checkpoint.json\` \`oct13Checkpoint.status\` ("both … verified at 1cefea1…"). \`ROOT-SECOND-REMOTE\` is closed in the backlog.

**Direct read of the root files (this round):**
- \`root-pre-push-review.md\` (2026-10-07): every finding is closed (M1–M3, L1–L4, L6–L8) or already carried. Nothing new.
- \`publication-checkpoint.json\`: it adds nothing beyond the carried list. Its standing requirements still apply: library/stems done (SRW-12), scrollbars with the Tech Lead (SRW-23), the discoverable entry done, T12 after the original scope, and the final commit/push by root only after everything. \`checkpoint-oct13-review.md\` suggestions are already triaged into the backlog (for example 9 → \`ROOT-AGENT-WRITE-GRANT\`, 5 → the 4b pending-commit order, 2 → L3).

**Still open (root):**`);

const b = JSON.parse(fs.readFileSync('backlog.json', 'utf8'));
const sr = b.open_findings.find((x) => x.id === 'ROOT-SECOND-REMOTE');
Object.assign(sr, { status: 'closed', closed: '2026-10-13 B: git ls-remote shows master = 1cefea1 on both TCzaba/czaba-store and shavidze/czaba-store; publication-checkpoint.json oct13Checkpoint.status agrees' });
const ft = b.open_findings.find((x) => x.id === 'FOCUS-TEXT-STALE');
ft.status = 'observation_not_started';
fs.writeFileSync('backlog.json', `${JSON.stringify(b, null, 2)}\n`);

const n = JSON.parse(fs.readFileSync('b-next.json', 'utf8'));
n.remaining = n.remaining.filter((x) => x !== 'ROOT-SECOND-REMOTE');
n.reason += ' ROOT-SECOND-REMOTE closed: both remotes at 1cefea1 (B git ls-remote 2026-10-13).';
fs.writeFileSync('b-next.json', `${JSON.stringify(n, null, 2)}\n`);
console.log('ok', n.remaining.length);
