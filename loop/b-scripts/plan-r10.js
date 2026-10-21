const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 10) {
  throw new Error(`expected backlog v10, got ${b.version}`);
}
const item = (id) => {
  const found = b.items.find((i) => i.id === id);
  if (!found) throw new Error(id);
  return found;
};
const bug = (it, id) => {
  const found = (it.open_bugs || []).find((x) => x.id === id);
  if (!found) throw new Error(`${it.id}/${id}`);
  return found;
};
const finding = (id) => b.open_findings.find((f) => f.id === id);

b.version = 11;
b.updated = '2026-10-10';
b.current_task =
  'ROUND-10 (bounded bug round, agent-workflow.md): C-R7-01 (loop-wrap video landing; instrument the standby hand-off per wrap, then fix only a confirmed cause a/b/d) + C-R7-02 (ruler last label/tick overflow <= 1 px on the C sweep). Disclosed exception: the two bugs are not mechanism-related; they share no files or layout. (tmp/studio-real-loop/current-task.md)';
b.advisor_used_by_B +=
  '; round 9 -> 10 (2026-10-10): available, called after orientation and before writing; advice applied (C-R7-01 + C-R7-02 move forward to round 10 because R9-D1/D2 failed and now wait on the Tech Lead; stage 2 -> round 11; VIDEO_POSITIONED_SECONDS 0.04 named as hypothesis (d), not as the fix; diagnosis-only wrapper with raw per-wrap JSON; full closed root-carry list; H1/H2 harness rules for future rounds only)';

const r9 = b.rounds.find((r) => r.round === 9);
Object.assign(r9, {
  task: 'tasks/round-9.md',
  status: 'verified',
  c_result:
    'FAIL: R9-D1 (mode D 2/3 valid; D_3 max 0.1564 s, video lag in the second video clip 8-12.008 -> hard seek 11.91 s, app LoAF 0, forced 0, cover 2.7 %), R9-D2 rule 3 (same-session D-N tick+microtasks p95 +0.3 ms > 0.2; p50 +0.1), R9-L3 (N 3/3, RF5-3 3/3 clean, D 2/3). PASS: R9-D3 (MutationObserver 178/178 transform-only, translateX monotone, hidden outside the clip, contain strict, 144 open at 1440), R9-L1, R9-L2, R9-U, R9-Doc; R9-D2 rules 1 and 2 (computation recomputed from A raw JSON). tick+microtasks p95 3.3-3.8 -> 0.6-0.9 ms vs round 8.',
  c_passed: [
    'R9-D3', 'R9-L1', 'R9-L2', 'R9-U', 'R9-Doc', 'R11-P1c', 'R11-P1d', 'R11-P1e', 'R4-M2', 'RF7-P2', 'R10-N4', 'R26-1',
    'G9-1', 'G9-2', 'G9-3', 'e2e-find-add-video-export-wav', 'premium-auth-not-bypassed',
  ],
  c_failed: ['R9-D1', 'R9-D2 (rule 3)', 'R9-L3'],
  c_evidence: ['c-round-9.md', 'c-round-9.json', 'c-round-9/'],
  b_record: 'b-round-9.md',
  gates:
    'C re-ran: tsc 0; vitest 52 files 809/809; arrangement 20/345; build ok; biome owned 52 files 0, ./app 0 errors / 218 warnings; protected hashes 4x OK; Header.tsx identical to HEAD (+21/-0 vs cc1e531); probe/wrapper residue in app/ 0; anon /studio-lab: no studio-token/recording/download/R2, no Authorization; anon studio-token 401; fake Bearer 500 no token (backend down); /studio/middle-east Sign in required',
});
b.rounds.push({
  round: 10,
  task: 'current-task.md',
  items: ['C-R7-01', 'C-R7-02'],
  status: 'dispatched',
  note: 'bounded bug round moved forward from round 11: R9-D1/D2 failed and C-R8-01/C-R6-02 now wait on the Tech Lead quiet-Chrome run (no re-measure of unchanged code per agent-workflow.md). Disclosed exception to "closely related": C-R7-02 is a one-function Low fix with no shared files or layout; C-R7-01 has priority.',
});

b.planned_rounds = [
  {
    round: 10,
    items: ['bug round: C-R7-01 (wrap hand-off instrumentation + fix of a confirmed cause) + C-R7-02 (ruler overflow <= 1 px on the sweep)'],
    note: 'moved forward from round 11; C-R7-01 must close (or Tech Lead accept quiet Chrome) before stage 3',
  },
  {
    round: 11,
    items: ['SRW-11B stage 2: track fold/height + lane auto-fit (TRK-04/05); reconcile the D-29a 1280 budget; reviewer L11 wheel; stage-2 candidates from round-9 review (L2 writer while collapsed, L4-L7, design-philosopher a-d)'],
    note: 'starts with C-R8-01 open (app-side proven, Tech Lead evidence pending); one mode-D R3-V1 info run must be no worse than round 9',
  },
  {
    round: 12,
    items: ['SRW-11B stage 3: floating expanded video (VID-06)'],
    note: 'depends on SRW-03: C-R7-01 closed or Tech Lead quiet-Chrome accepted',
  },
  { milestone: 'after SRW-11B', items: ['full regression incl. regression_debt_g6r'] },
  { after_milestone: 'SRW-13 onward in dependency order, then SRW-21 adapter contract, then T12' },
];

const s03 = item('SRW-03');
const r602 = bug(s03, 'C-R6-02');
r602.round9_result =
  'Both named candidates fixed and verified (R9-L1: LibraryPlayheadText is a position writer, 0 renders; R9-L2: context value identity stable across the hold release, 0 consumer renders). Drift: N 3/3 PASS, RF5-3 3/3 PASS (raw harness), mode D 2/3 (C-R8-01). Closure needs D too.';
r602.round9_evidence = 'c-round-9.md §2, §3 (R9-L1, R9-L2, R9-L3), c-round-9/runs/N_*.json, F_*.json';
r602.routed_to =
  'Tech Lead quiet real Windows Chrome RF7-2 in the R3-V1 D layout (VP9 + H.264). No further app-side candidate is named; code frozen in round 10. Reopen app work only if the quiet run attributes cost to the app.';
r602.status = 'open';
const r701 = bug(s03, 'C-R7-01');
r701.routed_to =
  'round 10 (moved forward from round 11) with the follow_up_spec made concrete in current-task.md §2.1: per-wrap instrumentation (pre-seek issue/skip, seeked vs wrap, swap-instant offset/readyState/lateBy, play() latency, 500 ms d series), causes a/b/d/m/c; verdict R10-W1 on 3 valid L6 runs (9 wraps) incl. the first run after a fresh load';
r701.hypothesis_round10 =
  '(d) isStandbyReady accepts a standby up to VIDEO_POSITIONED_SECONDS = 0.04 s off mediaTime (ArrangementVideoDock.tsx l.29) and the swap seeds lastSample as if exact; to be confirmed or refuted from the wrapper numbers, not assumed';
s03.evidence_round9 = 'c-round-9.md §2-§3: N 3/3, RF5-3 3/3, D 2/3; R9-L1/L2 PASS';

const s05 = item('SRW-05');
s05.regression_note.routed_to = 'round 10 (C-R7-01, owned by SRW-03)';

const s10 = item('SRW-10');
const r702 = bug(s10, 'C-R7-02');
r702.routed_to =
  'round 10 with C-R7-01 (disclosed exception: unrelated mechanism, no shared files); diagnose the element that sets scrollWidth (last tick border vs last label vs rounding), fix in rulerTickMarks and/or the tick render; acceptance unchanged: overflow <= 1 px at every zoom of the C sweep at both viewports, no lost label that fit, gap >= 40 px';

const s11b = item('SRW-11B');
const r801 = bug(s11b, 'C-R8-01');
r801.round9_result =
  'Compositor-only contract implemented and verified (R9-D3: per-frame transform-only, contain strict, will-change transform, 144 open at 1440, waveform visible). tick+microtasks p95 3.3-3.8 -> 0.6-0.9 ms. Verdict IDs fail: R9-D1 D 2/3 valid (D_3 0.1564 s inside the second video clip, app LoAF 0, forced 0); R9-D2 rule 3 D-N p95 +0.3 ms (A session +0.2). A probe S/L inconclusive (not reproduced in A session).';
r801.round9_evidence = 'c-round-9/runs/drift-summary.txt, runs/D_3.json, c-round-9.md §2, §7; a-round-9/runs/probe-summary.txt';
r801.routed_to =
  'Tech Lead quiet real Windows Chrome RF7-2 in the R3-V1 D layout; optional DevTools paint/raster/composite trace D vs N in the 8-12 s window. No re-measure of unchanged code by A/C (agent-workflow.md). Stage 2 (round 11) may start with this bug open; stage 2 adds one mode-D info run.';
r801.status = 'open';
s11b.stages.find((s) => s.stage === 2).round = 11;
s11b.stages.find((s) => s.stage === 3).round = 12;
s11b.stages.find((s) => s.stage === 3).note =
  'depends on SRW-03 (C-R7-01 closes in round 10, or the Tech Lead accepts quiet Chrome)';
s11b.recorded_followups = (s11b.recorded_followups || []).concat([
  'round-9 reviewer M1: transportRunningRef is now only a latch (markTransportRunning writes, nothing branches on it besides pumpPlaybackAudio); rename or remove when ArrangementContext is next in scope',
  'round-9 reviewer M-R10-1 / M2: LibraryPlayheadText re-renders with the library preview at up to 20 Hz during a library preview (not arrangement playback); memo via LibraryPlayheadTextMemo + one-token usage change, allowed when ArrangementLibraryPreview.tsx is next in scope',
  'round-9 reviewer L2: the detail playhead writer still runs while the panel is collapsed; stage 2',
  'round-9 reviewer L3: translateX(100%) at exactly the clip end (same as round-8 left:100%); C outside contract depends on it; review in stage 2',
  'round-9 reviewer L4-L7 (detail panel input reset on unrelated range, pointer capture, biome-ignore text, 6 px separator hit area) and L8 (useArrangementPositionStore error message names useArrangementPosition); stage 2',
]);
s11b.evidence_round9 = 'c-round-9.md §3-§4: R9-D3 contract PASS; R11-P1c/P1d/P1e PASS; C-R8-01 open';

const a7 = finding('a7-review-pending');
if (a7) {
  a7.status = 'resolved';
  a7.resolved_evidence =
    'A round 9 ran the code-reviewer subagent twice on the full cumulative diff of ArrangementDetailPanel.tsx (incl. the round-8 Low fixes), ArrangementLibraryPreview.tsx, ArrangementContext.tsx and render-budget.test.tsx: 8.5/10 both, no Critical/High (a-round-9.md §7; C read, did not re-run)';
}
b.open_findings.push({
  id: 'untracked-codex-frontend-architect-toml',
  status: 'root',
  detail:
    'store/.codex/agents/frontend-architect.toml appeared untracked 2026-10-10 15:12 during A round 9; A says it did not create it; .codex/** is forbidden to A/B/C; excluded from G10-2; root to confirm origin (with store/.claude/agents/frontend-architect.md)',
  evidence: 'c-round-9.md §1, a-round-9.md §3',
});
b.open_findings.push({
  id: 'c-r9-stale-carry',
  status: 'resolved',
  detail:
    'A §9 and C §9 of round 9 listed root M1, L6, L8, M3 as open. Closed by C evidence: M1 = R4-B7 (round 4), L8 round 4, L6 round 5 (R5-B4), M3 round 6 (R6-D1); with L1-L4/M2 (round 4) and L7 accepted. Round-10 task §6.5 lists the full closed set.',
});
b.open_findings.push({
  id: 'harness-H1-H2',
  status: 'resolved',
  detail:
    'B decision for future rounds: H1 writer-envelope exclusion is rAF delta >= 2 x run median (doubled 60 Hz frame excluded); does not re-score round 9 (R9-D2 failed on rule 3). H2 RF5-3 hold check accepts a non-paused pre-start row only if it is the active play() row inside the RF5-3 play() window with |vt| <= 1/60 s; C encodes it and reports raw preAllPaused.',
  evidence: 'c-round-9.md §7 harness notes; current-task.md (round 10) §6.4',
});

b.baseline.vitest_floor_round10 = 809;
b.baseline_tree_at_round10 =
  'HEAD c5ed47b + 15 modified (round 6-9 incl. ArrangementLibraryPreview.tsx) + 8 Studio untracked (ArrangementDetailPanel.tsx, panels.ts, panels.test.ts, detail-panel.test.tsx, render-budget.test.tsx, docs 016/017/018), verified by C round 9; plus foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted; vitest baseline 52 files / 809 tests';

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('backlog v11 written');
