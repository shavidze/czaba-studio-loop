const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 20) throw new Error('expected backlog v20, got ' + b.version);
fs.writeFileSync(dir + 'b-scripts/backlog.before-r20.json', JSON.stringify(b, null, 2) + '\n');
b.version = 21;
b.updated = '2026-10-11 (B: round 19 result -> round 20 dispatch)';
b.current_task =
  'current-task.md (round 20: milestone full regression, run 1 of 2 - non-sync editing IDs by C on a frozen app tree; A = doc 027 relabel only; D-29k)';
b.advisor_used_by_B +=
  '; round 19 result (2026-10-11): available, called after orientation (advice applied: do not fold the milestone fix round into the regression because it touches shared StudioWorkspace/ArrangementLane and would contaminate attribution; the runner always runs A, so A gets the doc-027 relabel only with app/ frozen; split the regression into run 1 non-sync editing IDs and run 2 video/sync + C-R12-01 RF5-3 + SRW-11B end to end; paste each debt ID oracle verbatim; R12-L4 synthetic half only; SRW-11B/FB-08 stay bug while C-R8-01 is open; vitest floor 999)';

const s = b.items.find((i) => i.id === 'SRW-11B');
const bug = s.open_bugs.find((x) => x.id === 'C-R18-01');
bug.status = 'closed';
bug.closed_round = 19;
bug.closed_evidence =
  'c-round-19.md §0, §2, §4 (R19-D1/D2 8/8 rows ±0 px, R19-U guards G6/G6b/G7 + C extras G6c-e, R19-A); c-round-19.json taskStatus PASS';
s.recorded_followups.push(
  'DONE round 19 (C PASS per ID): design (d) Georgian detail labels (დასაწყისი x2, წყაროდან, საიდან, წმ / სადამდე, წმ) with the info column w-72; aria-labels and footer verbatim; waveform -64 px (min 288 at 1280/480) - c-round-19.md §2-§4',
  'round-19 C note (not a bug): doc 027 title and round-18 sections still describe (d) as stopped with 13 tests (A deviation 1, outside round-19 §3.2) -> round 20 A relabel (doc only)',
  'round-19 C harness note: at 1280x720 the page can load with the detail panel collapsed (persisted panel state); open it with a real toggle click before measuring (environment effect, panels.ts frozen; not a bug)',
  'round-19 C note: the group hint keeps Latin "range" and the footer keeps start/length/source offset (byte-identical by design; footer frozen until its owning round)',
);
const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round19 = {
  result: 'C taskStatus PASS, no new bug; C-R18-01 closed (c-round-19.md, c-round-19.json)',
  passed: ['R19-D1', 'R19-D2', 'R19-A', 'R19-U', 'R19-Doc'],
  adjacent_passed: [
    'R8-detail-quick',
    'R18-B-quick',
    'R18-W-quick',
    'R16-H1-quick',
    'R16-F1-quick',
    'R9-D3/RF7-P2',
    'G19-1',
    'G19-2',
    'G19-3',
  ],
  key_numbers:
    'vitest 999/999 (996 + 3); info 288, waveform 640/448/480/288; single 11111, group 1112; sH/cH 107/107, 105/105, 106/85 (1280 group, D-29g residual); labels 64.47/74.13 <= 80; RF7-P2 189 style-only mutations (display/transform); real WAV 864000 frames = 18.000 s, 1802 FS samples = R13-M4 carry',
};
s.stages_status.polish =
  'round 16 = 14a C PASS; round 17 = C-R16-01 + M-R10-1/M2 C PASS; round 18 = 14b L4, L11, (b), L6 C PASS; round 19 = design (d) C PASS (C-R18-01 closed); M1 and L8 wait for the Tech Lead run or ride with SRW-13; remaining A round-11 follow-ups go to the milestone fix round (after the milestone regression)';
s.decisions.push(
  'D-29k (round 19 result, round 20): C round 19 PASS, C-R18-01 closed. The milestone full regression starts now on a frozen app tree, split into two bounded C runs: run 1 (round 20) = non-sync editing debt IDs R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 keys, R12-L2, R12-L4 (synthetic half; real HTML5 drag stays Tech Lead); run 2 (round 21) = R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 under RF5-3 with the dock live position (D-19b), SRW-11B end to end. The milestone fix round (A round-11 follow-ups, ArrangementLane.tsx:661 reason, anything the regression finds) follows on the certified tree, then SRW-13. Because the loop always runs A, round-20 A owns only doc 027 (relabel of the stale title and round-18 sections C flagged); app/ is frozen. Regression failures become bugs; tolerances never weaken.',
);
s.polish_round.note =
  'recorded, not dropped; round 16 (14a) C PASS; round 17 C PASS; round 18 (14b) C PASS except (d); round 19 (d) C PASS';
s.next_round_note =
  'round 20 = milestone regression run 1 (C) + doc 027 relabel (A); app/ frozen against b-round-19-tree-sha256.txt (50 files; only doc 027 may change). Round 21 = regression run 2 (video/sync). Then the milestone fix round, then SRW-13.';

const r19 = b.rounds.find((r) => r.round === 19);
r19.status = 'c_pass';
r19.result =
  'C taskStatus PASS, no new bug. PASS: R19-D1, R19-D2, R19-A, R19-U, R19-Doc; adjacent R8 detail quick, R18-B/W quick, R16-H1/F1 quick, R9-D3/RF7-P2; G19-1..3; vitest 999/999. C-R18-01 closed.';
r19.evidence = 'c-round-19.md, c-round-19.json';
b.rounds.push({
  round: 20,
  task: 'current-task.md',
  items: [
    'Milestone full regression run 1 (C): R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (keys), R12-L2, R12-L4 (synthetic half)',
    'A: doc 027 relabel only (title and round-18 sections; status = C round 19 PASS)',
  ],
  status: 'dispatched',
  decision: 'D-29k',
  note: 'app/ frozen against b-round-19-tree-sha256.txt; only doc 027 may change. No sync runs (run 2).',
});

const pr = b.planned_rounds;
const p19 = pr.find((r) => r.round === 19);
p19.note += ' Result: C PASS; C-R18-01 closed.';
const ms = pr.find((r) => r.milestone);
ms.items = [
  'run 1 (round 20): non-sync editing debt IDs (D-29k)',
  'run 2 (round 21): R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 RF5-3, SRW-11B end to end',
  'then the milestone fix round: A round-11 follow-ups (aria-controls on the lane fold button, Home on separators seeks, ring-inset on the track name, panel via nextElementSibling, silent fold refusal during a gesture), ArrangementLane.tsx:661 reason text, and any regression found',
];
ms.status = 'run 1 dispatched as round 20';

b.regression_debt_g6r.status = 'run 1 dispatched (round 20); run 2 planned (round 21)';
b.regression_debt_g6r.split = {
  run1_round20: [
    'R1-B5',
    'R4-B1',
    'R5-L4',
    'R5-L5',
    'R6-S5',
    'R7-D2',
    'R7-D3',
    'R7-D4',
    'R7-D5',
    'R8-M3',
    'R8-M4',
    'R9-C5',
    'R5-B5',
    'R5-B1u',
    'R11A-2 (keys half)',
    'R12-L2',
    'R12-L4 (synthetic half; real HTML5 drag = Tech Lead)',
  ],
  run2_round21: ['R2-V1', 'R3-V2', 'R3-V4', 'R5-L3', 'C-R12-01 under RF5-3', 'SRW-11B end to end'],
};

for (const f of b.open_findings) {
  if (f.id === 'dirty-tree-exposure') {
    f.note =
      'No commit since c5ed47b; the Studio work of rounds 6-19 (18 M + 22 untracked) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
  }
}
if (!JSON.stringify(b.tech_lead_manual_checks).includes('R19-T')) {
  b.tech_lead_manual_checks.push({
    id: 'R19-T',
    what: 'detail Georgian labels one line each in real Windows Chrome at 1280x720 and 1440x900, libraries 288 and 480 (w-72)',
  });
}
b.baseline_tree_at_round20 =
  'HEAD c5ed47b + 18 modified + 22 Studio untracked (rounds 6-19), identical to C round-19 end (c-round-19/gates/git-status-end.txt, 42 lines); sha256 of 50 files: b-round-19-tree-sha256.txt (the b-round-18 list re-hashed; exactly ArrangementDetailPanel.tsx f28e069f, detail-panel-polish.test.tsx b85c3c96 and doc 027 d2e4e8df differ, equal to C G19-2); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round20 = 999;
fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
