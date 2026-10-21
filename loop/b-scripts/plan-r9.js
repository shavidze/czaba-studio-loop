const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 9) {
  throw new Error(`expected backlog v9, got ${b.version}`);
}
const item = (id) => {
  const found = b.items.find((i) => i.id === id);
  if (!found) throw new Error(id);
  return found;
};

b.version = 10;
b.updated = '2026-10-09';
b.current_task =
  'ROUND-9 (bounded bug round, agent-workflow.md): C-R8-01 (open Clip Detail drift / frame cost, measure-then-fix, compositor-only detail playhead) + C-R6-02 named candidates (LibraryPlayheadText -> position writer; isTransportRunning off the memoized context value). Shared R3-V1 D-mode verification layout. (tmp/studio-real-loop/current-task.md)';
b.advisor_used_by_B +=
  '; round 8 -> 9 (2026-10-09): available, called after orientation and before writing; advice applied (R9 = C-R8-01 + C-R6-02 because they share the fix mechanism and the R3-V1 layout; C-R7-01 + C-R7-02 after stage 2 and before stage 3; probe first; same-session attribution as the verdict reference with the 0.2 ms tolerance unchanged; verifiable raw writer series; SRW-11B = bug, not done; stale root M1/L2/L3/L4/L7 carry corrected; N1/N2/N3 contract decisions; untracked .claude/agents/frontend-architect.md flagged to root)';

const r8 = b.rounds.find((r) => r.round === 8);
Object.assign(r8, {
  task: 'tasks/round-8.md',
  status: 'verified',
  c_result:
    'FAIL on current-task.md §8.2 attribution: rule 3 breached (same-session D-N tick+microtasks p95 +0.3..+1.0 ms > 0.2), rule 2 not demonstrated (A D_2 writer max 1.3 ms, preemption not shown; C cannot add the wrapper), rule 1 PASS (forced layout 0). New C-R8-01 (Medium): R3-V1 drift FAIL 3/3 valid runs with the panel open and a selected clip; collapsed panel 3/3 PASS, no selection 2/3 PASS. Feature IDs R11-P1b, R11-P1c, R11-P1d, R11-P1e, R11-P4d, R11-U1, R8-D1 PASS; adjacent R4-M2, RF7-P2, R10-N8, R11A-3, R10-N4, R10-N5, R26-1..3 PASS; G8-1..3 PASS. e2e find->add->export identical to round 7.',
  c_evidence: ['c-round-8.md', 'c-round-8.json', 'c-round-8/'],
  b_record: 'b-round-8.md',
  gates:
    'C re-ran: tsc 0; vitest 52 files 806/806; arrangement 20/342; build ok; biome owned 52 files 0, ./app 0 errors / 218 warnings; protected hashes 4x OK; Header.tsx identical to HEAD (+21/-0 vs cc1e531); forbidden imports 0; anon /studio-lab: no studio-token/recording/download/R2, no Authorization; anon studio-token 401; fake Bearer 500 no token (backend down); /studio/middle-east Sign in required',
});
b.rounds.push({
  round: 9,
  task: 'current-task.md',
  items: ['C-R8-01', 'C-R6-02'],
  status: 'dispatched',
  note: 'bounded bug round; two closely related drift bugs (same per-frame-consumer fix class, same R3-V1 D-mode layout and run budget). C-R7-01 (wrap hand-off, own RF5-2 layout) and Low C-R7-02 (ruler) moved to round 11 with unchanged specs.',
});

const s11b = item('SRW-11B');
s11b.status = 'stage1_bug';
s11b.evidence_round8 = {
  passed: ['R11-P1b', 'R11-P1c', 'R11-P1d', 'R11-P1e', 'R11-P4d', 'R11-U1', 'R8-D1'],
  note: 'stage 1 acceptance passed on C evidence; stage 1 is not done while C-R8-01 is open (the round failed on its own drift attribution)',
  evidence: 'c-round-8.md §2, c-round-8.json',
};
s11b.open_bugs = [
  {
    id: 'C-R8-01',
    severity: 'medium',
    title:
      'Open Clip Detail with a selected playable clip: R3-V1 drift FAIL 3/3 valid (max 0.2559 / 0.1739 / ex 0.132 s), tick+microtasks p95 D-N +0.3..+1.0 ms; collapsed panel 3/3 PASS, no selection 2/3 PASS; no app LoAF >= 10 ms, forced layout 0',
    status: 'open',
    evidence: 'c-round-8/runs/drift-summary.txt, runs/{D,N,P}_*.json, *_perf.json, *_raw.json, *_cpu.csv; c-round-8.md §4, §8',
    hypothesis:
      'per-frame left % write on the detail playhead invalidates layout/paint of the waveform box (480-column SVG) and nearby raster; not visible as main-thread script',
    follow_up_spec:
      'Round 9: step 1 probe (panel open, music clip selected, playhead parked outside the clip: line display:none, SVG visible) under the R3-V1 light harness to split static-SVG cost from moving-line cost; then compositor-only playhead (transform translateX on a full-width wrapper or a ResizeObserver-cached px width; no per-frame left/width/height write; no per-frame layout read) and paint containment of the waveform box (contain-strict/contain-paint) as needed. Verdict: mode D 3 valid R3-V1 runs D-24 PASS; same-session D-N and D-P tick+microtasks p50/p95 <= 0.2 ms; writer envelope from raw series C recomputes.',
    routed_to: 'round 9',
  },
];
s11b.stages[0].round = 8;
s11b.stages[0].status = 'acceptance_passed_bug_open';
s11b.stages[1].round = 10;
s11b.stages[2].round = 12;
s11b.stages[2].note = 'depends on SRW-03 (C-R7-01 closes in round 11 first)';
s11b.recorded_followups = [
  'design-philosopher (a): footer arrangement-selected-clip repeats the open panel; consider showing it only when collapsed (would change C script ids; decide with stage 2)',
  'design-philosopher (b): range overlay bg-foreground/60 may hide the waveform in the detail view; check before /30',
  'design-philosopher (c): clip name in both header and content; review in stage 2',
  'design-philosopher (d): Latin start/offset vs Georgian labels; settle once for the workspace',
  'code-reviewer L11 (Low): mouse wheel on a focused number input may change the value; schedule with stage 2 (same panel file)',
  'N3: abort restore animates over 300 ms; accepted (spec did not forbid it)',
];
s11b.contract_decisions_round8 = [
  'N1: "the footer is one line" in R11-P1d / R10-N8 means the shortcut hint line is one line (the historical R11A-3 meaning); the footer may hold status / selected-clip / hint lines',
  'N2: aria-valuenow equals the rendered height while expanded; while collapsed it keeps the stored expanded height with aria-valuetext "დაკეცილია · {h} px" (a value below aria-valuemin would be invalid ARIA)',
];

const s03 = item('SRW-03');
const r602 = s03.open_bugs.find((x) => x.id === 'C-R6-02');
r602.round8_evidence =
  'c-round-8 N_1 (panel open, no selection) FAIL 0.1329 s without a steady app LoAF; N 2/3 PASS';
r602.routed_to =
  'round 9 with C-R8-01: LibraryPlayheadText (ArrangementLibraryPreview.tsx) -> position-writer pattern; isTransportRunning removed from the memoized context value (no component consumer reads it; no test reads it) so the post-hold flip re-renders no useArrangement() consumer; prove with render counts and the shared D-mode runs. Closure needs 3/3 valid D-24 PASS in the round-9 layouts or Tech Lead quiet Chrome; the code change alone does not close it.';
const r701 = s03.open_bugs.find((x) => x.id === 'C-R7-01');
r701.routed_to =
  'round 11 (after SRW-11B stage 2, before stage 3 which depends on SRW-03), with unchanged follow_up_spec; earlier if Tech Lead quiet Chrome shows the lateness there';
s03.evidence_round8 = 'c-round-8.md §4 (R3-V1 D/N/P series), N_1 FAIL as C-R6-02 evidence';

const s10 = item('SRW-10');
const r702 = s10.open_bugs.find((x) => x.id === 'C-R7-02');
r702.routed_to =
  'round 11 bug round with C-R7-01 (moved from round 9 because it is unrelated to the round-9 drift mechanism); acceptance unchanged: overflow <= 1 px at every zoom of C sweep at both viewports';

const a7 = b.open_findings.find((f) => f.id === 'a7-review-pending');
a7.status = 'partially_resolved';
a7.note +=
  ' Round 8: A ran code-reviewer on its full round-8 diff (7.5/10) and on the fix delta (9/10); the last three Low fixes were not re-reviewed. Round 9: A reviews the full cumulative diff of every file it touches (incl. the round-8 Low fixes in ArrangementDetailPanel.tsx) and re-runs it on the fix delta.';
b.open_findings.push(
  {
    id: 'c-r8-stale-carry',
    status: 'resolved',
    note: 'c-round-8.md §9 and a-round-8.md §10 list root M1/L2/L3/L4/L7 as open. They are not: M1 = R4-B7 PASS (c-round-4.md line 166, 303), L2 = R4-B5, L3 = R4-B4, L4 = R4-B1/B2 (C rounds 4 and 6), L7 accepted. C should drop them from the carried list.',
  },
  {
    id: 'untracked-frontend-architect-agent',
    status: 'root',
    note: 'store/.claude/agents/frontend-architect.md appeared untracked at 19:43:40 during C round 8; not created by A or C; .claude/** is forbidden for A/B/C. Root confirms the origin. Excluded from A/C G9-2 accounting; nobody edits or deletes it.',
  },
);

b.baseline_tree_at_round9 =
  'HEAD c5ed47b + 14 modified + 7 untracked (round 6/7/8: ArrangementDetailPanel.tsx, panels.ts, panels.test.ts, detail-panel.test.tsx, render-budget.test.tsx, docs 016/017), verified by C round 8; plus the untracked .claude/agents/frontend-architect.md of unknown origin (not part of the Studio work; root decides); must not be reverted; vitest baseline 52 files / 806 tests';

b.planned_rounds = [
  {
    round: 9,
    items: ['bug round: C-R8-01 (probe, compositor-only detail playhead) + C-R6-02 (LibraryPlayheadText writer, isTransportRunning off the context value)'],
    note: 'shared R3-V1 D/N/P layout and run budget; C-R8-01 closes before stage 2 touches the same panel',
  },
  {
    round: 10,
    items: ['SRW-11B stage 2: track fold/height + lane auto-fit (TRK-04/05); reconcile the D-29a 1280 budget; reviewer L11 wheel'],
  },
  {
    round: 11,
    items: ['bug round: C-R7-01 (wrap hand-off instrumentation + fix) + C-R7-02 (label overflow <= 1 px on sweep)'],
    note: 'C-R7-01 must close before stage 3 (stage 3 depends on SRW-03)',
  },
  { round: 12, items: ['SRW-11B stage 3: floating expanded video (VID-06)'] },
  { milestone: 'after SRW-11B', items: ['full regression incl. regression_debt_g6r'] },
  { after_milestone: 'SRW-13 onward in dependency order, then SRW-21 adapter contract, then T12' },
];

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('backlog v10 written');
