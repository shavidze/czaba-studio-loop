const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 19) {
  throw new Error('expected backlog v19, got ' + b.version);
}
fs.writeFileSync(dir + 'b-scripts/backlog.before-r19.json', JSON.stringify(b, null, 2) + '\n');
b.version = 20;
b.updated = '2026-10-11 (B: round 18 result -> round 19 dispatch)';
b.current_task =
  'current-task.md (round 19: C-R18-01 - design (d) Georgian detail labels with the info column at w-72, measured first; D-29j)';
b.advisor_used_by_B +=
  '; round 18 result (2026-10-11): available, called after orientation and before writing (advice applied: round 19 = C-R18-01 only; w-72 as the single candidate because 259.81 px max-content leaves 28 px headroom at 288 for real Windows font metrics, measured in page state first with a stop; fix the unreachable "1280 group at 142" wording; fit compared with the pre-code record; keep SRW-11B/FB-08 as bug; vitest floor 996; 50-file sha reference)';

const s = b.items.find((i) => i.id === 'SRW-11B');
s.open_bugs.push({
  id: 'C-R18-01',
  severity: 'medium',
  status: 'open',
  round_found: 18,
  title: 'design (d) Georgian detail labels not delivered (A stopped under the round-18 §1.4 rule, C confirmed)',
  evidence:
    'c-round-18.md §3, c-round-18.json; c-round-18/runs/stop-1440x900.txt, quicks-1280x720.txt; A a-round-18.md §1.4. The single-state line "დასაწყისი 00:00.000 · სიგრძე 00:16.000" needs 259.81 px max-content > w-64 (256); at 224/240/256 it wraps, the truncate title/lane rows shrink 16 -> 10 px (1440) / 9 px (1280), and the 1440 group starts to scroll (110/107)',
  next: 'round 19 (D-29j): info column w-56 -> w-72 (288 px), measured in page state before code; stop if any stop condition fires at 288',
});

s.recorded_followups.push(
  'DONE round 18 (C PASS per ID): L4 (inputs reset only on on-clip range bounds or clip bounds; component tests + C mutation M1), L11 (native non-passive wheel listener, preventDefault only for a focused number input; C M2-M4, M7 and in-page defaultPrevented true/false), design (b) (detail overlay bg-foreground/30, computed oklab alpha 0.3, borders 2/2, 21.875% / 23.4375%), L6 (biome-ignore reason text, 0 suppression warnings), R18-A (apply button/Enter/invalid status, no Undo entry) - c-round-18.md §2, §4-§6',
  'round-18 A deviation 2 accepted (D-29j, C verified via guard M6): a successful Apply writes rangeInputText(clamped start/end) into the fields, keeping today\'s normalized display after L4 removed the object-identity reset',
  'round-18 A deviations 4-7 accepted (D-29j): w-60 cannot be tested as a class because uncompiled utilities are absent, so page-state inline widths are the measurement method; W480 row labels swapped in raw files, trust header; the 1280 group panel is 122 (D-29g residual), so "1280 at 142" in the group state was a B wording error; R18-D shots are as-is records',
  'round-18 note (A reviewer info, C confirmed): ArrangementLane.tsx:661 uses a different biome-ignore reason for the same useSemanticElements rule; L6 analogue, aligned when ArrangementLane.tsx is next owned (milestone fix round or SRW-17)',
  'round-18 C harness note: clearing an input with Control+a is safe only on an enabled focused input; elsewhere the workspace Ctrl+A selects all clips',
);

const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round18 = {
  result: 'C taskStatus FAIL only on R18-D (C-R18-01, rule-compliant stop); every other ID PASS (c-round-18.md, c-round-18.json)',
  passed: ['R18-L4', 'R18-W', 'R18-B', 'R18-L6', 'R18-A', 'R18-Doc'],
  not_passed: ['R18-D', 'R18-U (d) part and guard mutation 6'],
  adjacent_passed: ['R8-detail-quick', 'R16-H1-quick', 'R16-F1-quick', 'R9-D3/RF7-P2', 'range-on-lane-quick', 'G18-1', 'G18-2', 'G18-3'],
  key_numbers:
    'vitest 996/996 (983 + 13); detail overlay oklab(... / 0.3); RF7-P2 197 style-only mutations (display/transform); 1280 group panel 122 (footer 89, D-29g residual), group content 106/85 already scrolls; real WAV 864000 frames = 18.000 s, 1802 FS samples = R13-M4 carry',
};
s.stages_status.polish =
  'round 16 = 14a C PASS; round 17 = C-R16-01 + M-R10-1/M2 C PASS; round 18 = 14b: L4, L11, design (b), L6 C PASS, design (d) not delivered (C-R18-01, stop rule); round 19 = C-R18-01 (D-29j, w-72); M1 and L8 wait for the Tech Lead run or ride with SRW-13; remaining A round-11 follow-ups go to the milestone fix round';
s.decisions.push(
  'D-29j (round 18 result, round 19): C-R18-01 fixed by widening the info column w-56 -> w-72 (288 px). 259.81 px max-content leaves 28 px headroom for real Windows font metrics (R17-T concern); single stays 11111, group stays 1112 (group note 395 px still wraps), so no new scroll; price -64 px waveform (1440/288 704 -> 640, 1280/480 352 -> 288, >= 128). A measures 288 in page state before code and stops if any line wraps, a truncate row shrinks below 16 px, or scrollHeight exceeds the pre-code record. Rejected: two rows (A arithmetic +18 vs 3 px slack), shorter label (departs from the prototype wording), range labels only (partial (d), half-Georgian panel), w-68 (12 px headroom only). Wording fixes: 1280 group panel is 122 (D-29g residual) and its fit criterion compares with today 106/85; A deviation 2 (post-Apply normalization) accepted; see plan.md',
);
s.polish_round.note =
  'recorded, not dropped; round 16 (14a) C PASS; round 17 C PASS; round 18 (14b) C PASS except design (d) -> C-R18-01, round 19 (D-29j)';
s.next_round_note =
  'round 19 = C-R18-01 only: ArrangementDetailPanel.tsx (five labels + one width token), detail-panel-polish.test.tsx ((d) tests + width token), doc 027 status/(d) sections; everything else frozen against b-round-18-tree-sha256.txt (50 files). After round 19: the milestone full regression.';

const r18 = b.rounds.find((r) => r.round === 18);
r18.status = 'c_fail';
r18.result =
  'C taskStatus FAIL only on R18-D: design (d) not delivered because A stopped under the §1.4 rule (no width up to w-64 fits; C confirmed, C-R18-01 medium). PASS: R18-L4, R18-W, R18-B, R18-L6, R18-A, R18-Doc; adjacent R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2, range on lane; G18-1..3; vitest 996/996. R18-U green for L4/W/(b)/R9-D3 with guard M1-M7; (d) part missing.';
r18.evidence = 'c-round-18.md, c-round-18.json';
b.rounds.push({
  round: 19,
  task: 'current-task.md',
  items: [
    'C-R18-01: design (d) Georgian detail labels (დასაწყისი x2, წყაროდან; inputs საიდან, წმ / სადამდე, წმ) with the info column w-56 -> w-72, measured in page state first; aria-labels, test ids and footer verbatim',
  ],
  status: 'dispatched',
  decision: 'D-29j',
  note: 'Only ArrangementDetailPanel.tsx (5 text nodes + 1 width token), detail-panel-polish.test.tsx and doc 027. R9-D3 hunks and every other file frozen against b-round-18-tree-sha256.txt; no sync runs.',
});

const pr = b.planned_rounds;
const p18 = pr.find((r) => r.round === 18);
p18.note += ' Result: C FAIL only on design (d) (C-R18-01, stop rule); L4, L11, (b), L6 C PASS.';
const msIdx = pr.findIndex((r) => r.milestone);
pr.splice(msIdx, 0, {
  round: 19,
  items: ['C-R18-01: design (d) labels with the info column at w-72 (D-29j)'],
  note: 'dispatched 2026-10-11. Then the milestone full regression (C-only, split into bounded runs if needed), then the milestone fix round, then SRW-13.',
});

for (const f of b.open_findings) {
  if (f.id === 'dirty-tree-exposure') {
    f.note =
      'No commit since c5ed47b; the Studio work of rounds 6-18 (18 M + 22 untracked incl. detail-panel-polish.test.tsx and doc 027) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
  }
}

b.baseline_tree_at_round19 =
  'HEAD c5ed47b + 18 modified + 22 Studio untracked (rounds 6-18; round 18 adds detail-panel-polish.test.tsx and doc 027), identical to C round-18 end (c-round-18/gates/git-status-end.txt, 42 lines); sha256 of 50 files: b-round-18-tree-sha256.txt (48 round-17 entries re-hashed + detail-panel-polish.test.tsx + doc 027; exactly ArrangementDetailPanel.tsx and doc 026 differ from b-round-17-tree-sha256.txt, as C G18-2 found, and their hashes equal C/A owned sha 9ba5fa3b / 70b1fd62); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round19 = 996;

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
