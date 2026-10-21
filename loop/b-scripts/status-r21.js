const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 21) throw new Error('expected backlog v21, got ' + b.version);
fs.writeFileSync(dir + 'b-scripts/backlog.before-r21.json', JSON.stringify(b, null, 2) + '\n');
b.version = 22;
b.updated = '2026-10-11 (B: round 20 result -> round 21 dispatch)';
b.current_task =
  'current-task.md (round 21: milestone full regression, run 2 of 2 - video/sync IDs, C-R12-01 under RF5-3 with the dock live position, SRW-11B end to end; A = tree attestation only, no file change; D-29l)';
b.advisor_used_by_B +=
  '; round 20 result (2026-10-11): available, called after orientation (advice applied: run 2 exactly as D-29k; R3-V4 in its D-19 form (2 video nodes, both paused, rate 1); explicit C-R12-01 decision table with getLivePosition read in the rate-setter spy, no source instrumentation; R5-E1 paired with R5-L3 at 1.2e-7; SRW-11B end to end as a user flow with current oracles plus one information-only mode-D run; enumerate sync layouts for the 3+2 budget; amend R6-S5 to the D-25 wording; A = attestation only; note the runner RoundLimit 20)';

const run1 = b.regression_debt_g6r.split.run1_round20;
b.regression_debt_g6r.status =
  'run 1 C PASS (round 20, all 17 IDs, no bug); run 2 dispatched (round 21)';
b.regression_debt_g6r.run1_result = {
  result: 'C taskStatus PASS, no new bug (c-round-20.md §0, §2; c-round-20.json)',
  passed: run1,
  evidence: {
    'R1-B5': 'c-round-20.md §2.1, runs/r1-b5-r9-c5.txt (export oracle maxDiff 0, tail exact zeros)',
    'R4-B1': 'c-round-20.md §2.2, runs/r4-b1-r5-l4.txt (clip, brace, trim)',
    'R5-L4': 'c-round-20.md §2.3, runs/r4-b1-r5-l4.txt',
    'R5-L5': 'c-round-20.md §2.4, runs/r5-l5.txt (max concurrent 1, toggle <= 20 ms)',
    'R6-S5': 'c-round-20.md §2.5, runs/r6-s5.txt (Ctrl+E sub-item judged by D-25)',
    'R7-D2': 'c-round-20.md §2.6, runs/r7-d2-d4-d5.txt',
    'R7-D3': 'c-round-20.md §2.7, runs/r7-d3.txt (copy onset 2.4993, monotone)',
    'R7-D4': 'c-round-20.md §2.8, runs/r7-d4.txt (export maxDiff 1.19e-7)',
    'R7-D5': 'c-round-20.md §2.9, runs/r7-d2-d4-d5.txt',
    'R8-M3': 'c-round-20.md §2.10, runs/r8-m3-m4.txt',
    'R8-M4': 'c-round-20.md §2.11, runs/r8-m3-m4.txt',
    'R9-C5': 'c-round-20.md §2.12, runs/r1-b5-r9-c5.txt',
    'R5-B5': 'c-round-20.md §2.13, runs/r5-b5.txt',
    'R5-B1u': 'c-round-20.md §2.14, gates/vitest-reentry.txt (14/14)',
    'R11A-2 (keys half)': 'c-round-20.md §2.15, runs/r11a2-r12l2-{1440x900,1280x720}.txt (+ synthetic drag)',
    'R12-L2': 'c-round-20.md §2.16 (both viewports)',
    'R12-L4 (synthetic half; real HTML5 drag = Tech Lead)': 'c-round-20.md §2.17, runs/r12-l4.txt',
  },
  invalid_replaced: 'c-round-20.md §3 (6 harness/setup-invalid executions replaced within budget, cause named; app correct in each)',
};
b.regression_debt_g6r.acceptance_amendments = [
  'R6-S5 sub-item "Ctrl+E with 2 or more selected -> refusal" is superseded by D-25 (group split): Ctrl+E with 2+ selected splits every selected clip the playhead crosses (one entry "გაყოფა (n)", right parts selected); a playhead that crosses no selected clip -> "Playhead არცერთ მონიშნულ კლიპს არ კვეთს.", arrangement and history unchanged. Source: plan.md D-25, c-round-5.md l.85, c-round-20.md §2.5/§5. Future regressions use this text.',
];
b.regression_debt_g6r.split.run2_round21 = [
  'R2-V1',
  'R3-V2',
  'R3-V4 (D-19 form: exactly 2 video elements, both paused, both rate 1)',
  'R5-L3 (+ R5-E1 adjacent, 1.2e-7)',
  'C-R12-01 under RF5-3 (dock live position read on the rate write; H2)',
  'SRW-11B end to end (R11-P1b, R11-P1c, R11-P2, R11-P3, R11-P4, R11-U + one information-only R3-V1 mode-D run)',
];

const addEvidence = (id, text) => {
  const it = b.items.find((x) => x.id === id);
  if (!it) throw new Error('missing ' + id);
  if (typeof it.evidence !== 'object' || it.evidence === null) throw new Error('evidence not object ' + id);
  if (!Array.isArray(it.evidence.later_rounds)) it.evidence.later_rounds = [];
  it.evidence.later_rounds.push(text);
};
addEvidence('SRW-01', 'c-round-20.md §1 (G20-3 anonymous /studio-lab clean direct + header link, studio-token 401, /studio/middle-east Sign in required; real WAV 864000 frames = 18.000 s, NaN 0, 1800 FS samples = R13-M4 carry)');
addEvidence('SRW-06', 'c-round-20.md §2.5 milestone regression R6-S5 PASS (Ctrl+E sub-item per D-25)');
addEvidence('SRW-07', 'c-round-20.md §2.6-§2.9 milestone regression R7-D2, R7-D3, R7-D4, R7-D5 PASS');
addEvidence('SRW-08', 'c-round-20.md §2.10-§2.11 milestone regression R8-M3, R8-M4 PASS (FB-03 quick)');
addEvidence('SRW-09', 'c-round-20.md §2.1, §2.12 milestone regression R1-B5, R9-C5 PASS (FB-02 quick)');
addEvidence('SRW-11A', 'c-round-20.md §2.15 milestone regression R11A-2 keys + synthetic drag PASS at 1440x900 and 1280x720');
addEvidence('SRW-12', 'c-round-20.md §2.13, §2.16, §2.17 milestone regression R5-B5, R12-L2 (both viewports), R12-L4 synthetic half PASS; real HTML5 drag stays Tech Lead');
const s5 = b.items.find((x) => x.id === 'SRW-05');
if (s5 && typeof s5.evidence === 'object' && s5.evidence !== null) {
  if (!Array.isArray(s5.evidence.later_rounds)) s5.evidence.later_rounds = [];
  s5.evidence.later_rounds.push('c-round-20.md §2.2-§2.4 milestone regression R4-B1 (brace), R5-L4, R5-L5 PASS');
}

const s = b.items.find((i) => i.id === 'SRW-11B');
s.recorded_followups.push(
  'round 20 (C PASS): doc 027 relabel R20-Doc PASS (c-round-20.md §4); cosmetic nested brackets in the (d) heading = A deviation 3, not a bug',
  'round 20 C note: Delete Time Undo keeps the playhead (28); criterion is arrangement-only and matches Ableton; record only',
);
s.decisions.push(
  'D-29l (round 20 result, round 21): milestone regression run 1 C PASS (17/17 IDs, no bug), R20-Doc PASS, G20-1..3 PASS. Round 21 = run 2 on the same frozen app tree (b-round-20-tree-sha256.txt, 50 files): R2-V1, R3-V2, R3-V4 (D-19 form), R5-L3 + R5-E1, C-R12-01 under RF5-3 with the dock live position read inside the playbackRate setter spy (decision table: any rate != 1 before the first arm with dock |d| <= 0.02 -> new D-19 bug with its own round; every such write with dock |d| > 0.02 -> C-R12-01 closes as a harness-reference artifact), SRW-11B end to end as a user flow (R11-P1b, P1c, P2, P3, P4, U) plus one information-only R3-V1 mode-D run (not a C-R8-01 verdict). A has no file change (attestation only). R6-S5 acceptance text amended to D-25. SRW-11B/FB-08 stay bug while C-R8-01 is open.',
);
s.next_round_note =
  'round 21 = milestone regression run 2 (C) on the frozen tree; A attestation only. Then the milestone fix round (regression bugs first, then A round-11 follow-ups and ArrangementLane.tsx:661), then SRW-13.';

const r20 = b.rounds.find((r) => r.round === 20);
r20.status = 'c_pass';
r20.result =
  'C taskStatus PASS, no new bug. PASS: R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2, R12-L2, R12-L4 (synthetic half), R20-Doc, G20-1..3; vitest 999/999; real WAV 18.000 s NaN 0 (1800 FS = R13-M4 carry).';
r20.evidence = 'c-round-20.md, c-round-20.json';
b.rounds.push({
  round: 21,
  task: 'current-task.md',
  items: [
    'Milestone full regression run 2 (C): R2-V1, R3-V2, R3-V4, R5-L3 (+R5-E1), C-R12-01 under RF5-3 (dock live position), SRW-11B end to end (+ one info-only mode-D run)',
    'A: tree attestation only (no file change)',
  ],
  status: 'dispatched',
  decision: 'D-29l',
  note: 'app/ and docs frozen against b-round-20-tree-sha256.txt (50 OK expected). Per sync layout: 3 valid + max 2 environment replacements.',
});

const ms = b.planned_rounds.find((r) => r.milestone);
ms.status = 'run 1 C PASS (round 20); run 2 dispatched as round 21';

b.baseline_tree_at_round21 =
  'HEAD c5ed47b + 18 modified + 22 Studio untracked (rounds 6-20), identical to C round-20 end (c-round-20/gates/git-status-*.txt, 42 lines, equal to c-round-19/gates/git-status-end.txt); sha256 of 50 files: b-round-20-tree-sha256.txt (b-round-19 list re-hashed; only doc 027 differs: 9a75b672, equal to C G20-2); plus the two foreign untracked agent files (root); must not be reverted';
b.vitest_floor_round21 = 999;
b.loop_runner_note =
  'run-loop.ps1 default RoundLimit is 20; round 20 completed, so the runner may stop with ROUND_LIMIT_REACHED (incomplete, not successful). Restart with -StartRound 21 -StartPhase A and a higher -RoundLimit to dispatch current-task.md.';
fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
