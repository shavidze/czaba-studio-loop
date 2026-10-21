const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 11) {
  throw new Error(`expected backlog v11, got ${b.version}`);
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

b.version = 12;
b.updated = '2026-10-10';
b.current_task =
  'ROUND-11 (one feature, agent-workflow.md): SRW-11B stage 2 — track fold (TRK-04), track height (TRK-05), lane auto-fit (D-29) and D-29b (auto-fit makes the detail panel yield first at 1280x720; user resize wins). Acceptance R11-P2, R11-P2k, R11-P2a (rewritten per D-29b), R11-P4 fold shots, R11-U, R11-Doc. (tmp/studio-real-loop/current-task.md)';
b.advisor_used_by_B +=
  '; round 10 -> 11 (2026-10-10): available, called after orientation and before writing; advice applied (C-R7-01 is a B-owned spec interaction between the D-19 deadband 0.02 and the round-7 B window +-0.01, resolved in the stricter direction as D-19a post-swap settle for round 12, not a tolerance change and not parked on the Tech Lead; H3 same-row wrap rule; round 11 = stage 2 with D-29b panel yield; detail panel edit limited to a cap prop; polish items to a named round)';

const r10 = b.rounds.find((r) => r.round === 10);
Object.assign(r10, {
  task: 'tasks/round-10.md',
  status: 'verified',
  c_result:
    'FAIL on R10-W1 only: valid runs W_2/W_4/W_5 (fresh load each; wrap 1 = first swap), 6/9 wraps below [2.29, 2.31] at the harness +300 sample (2.282-2.285); d at +300 is -0.017..-0.020 s in all 9 (vt ~2.280-2.284 at exactly +0.300; W_5 in-window only by sample phase 0.310). Clean-source series: swap offset 0, currentTime freeze +22..+51 ms after play(), peak lag ~0.05, soft sync stops at the D-19 deadband 0.02. All hard rules pass (swaps 3/0, 0 hard seeks in wrap windows, multiPlayingMaxMs 0, 0 frames past loop end, rate 1-1.25, app LoAF 0). 2 invalid runs (stall cover 15-16 %) replaced. R10-W3 not applicable (no source change, cmp).',
  c_passed: ['R10-W2', 'R10-R1', 'R10-R2', 'R10-Doc', 'G10-1', 'G10-2', 'G10-3'],
  c_passed_adjacent: [
    'R3-V1 mode N x1 (information, not a C-R6-02 verdict)', 'R2-V3 x1', 'RF5-3 x1 (H2)', 'R5-L3', 'R5-E1 (maxDiff 0)',
    'R10-N5r', 'RF7-P2', 'R9-D3 quick', 'e2e-find-add-video-export-wav', 'premium-auth-not-bypassed',
  ],
  c_failed: ['R10-W1'],
  c_not_applicable: ['R10-W3'],
  c_evidence: ['c-round-10.md', 'c-round-10.json', 'c-round-10/'],
  b_record: 'b-round-10.md',
  gates:
    'C re-ran: tsc 0; vitest 52 files 812/812 (809 + 3); arrangement 20/348; build ok; biome owned 51 files 0, ./app 0 errors / 218 warnings; protected hashes 4x OK start and end; frozen 15/15 sha OK; Header.tsx identical to HEAD (+21/-0 vs cc1e531); probe residue 0; anon /studio-lab: no studio-token/recording/download/R2, no Authorization; anon studio-token 401; fake Bearer 500 no token (backend 5199 down, partial)',
});
b.rounds.push({
  round: 11,
  task: 'current-task.md',
  items: ['SRW-11B stage 2'],
  status: 'dispatched',
  note: 'one feature: track fold/height + lane auto-fit + D-29b (detail panel yields first under auto-fit). No bug work mixed in: C-R8-01/C-R6-02 wait on the Tech Lead; C-R7-01 gets D-19a in round 12. Panel polish (L11, M1, M-R10-1/M2, L2-L8, design a-d) moved to a named polish round after stage 3; recorded, not dropped.',
});

b.planned_rounds = [
  {
    round: 11,
    items: ['SRW-11B stage 2: track fold/height (TRK-04/05) + lane auto-fit (D-29) + D-29b detail-panel yield'],
    note: 'C-R8-01 open (Tech Lead evidence pending); one mode-D R3-V1 info run must be no worse than round 9',
  },
  {
    round: 12,
    items: ['C-R7-01 under D-19a: post-swap settle band (<= 0.008 s) + settle gain inside the unchanged rate band, pure helper in video-sync.ts with a deterministic freeze simulation test; verdict R10-W1 under H3'],
    note: 'new code, so a fresh run budget is legitimate; the Tech Lead quiet-Chrome RF7-3 run remains required evidence',
  },
  {
    round: 13,
    items: ['SRW-11B stage 3: floating expanded video (VID-06)'],
    note: 'depends on SRW-03: C-R7-01 closed or Tech Lead quiet-Chrome accepted',
  },
  {
    round: 14,
    items: ['panel polish round: reviewer L11 (number-input wheel), round-9 reviewer M1, M-R10-1/M2, L2-L8, design-philosopher (a)-(d)'],
    note: 'files frozen until the C-R8-01/C-R6-02 Tech Lead evidence or this round; up to three related items per round, split if needed',
  },
  { milestone: 'after SRW-11B + polish', items: ['full regression incl. regression_debt_g6r'] },
  { after_milestone: 'SRW-13 onward in dependency order, then SRW-21 adapter contract, then T12' },
];

const s03 = item('SRW-03');
const r701 = bug(s03, 'C-R7-01');
r701.round10_result =
  'A instrumented 18 wraps (6 runs incl. 2 fresh loads): pre-seek issued 0.97-1.00 s before the wrap, seeked 36-54 ms later; swap offset 0.000 in 18/18; readyState 4, seeking false, playPending false; play() -> playing 4.5-7.7 ms with no first-swap outlier. (a), (b), (d) and (m) refuted. C clean-source verdict runs: 9/9 valid wraps d(+300) -0.017..-0.020; post-start currentTime freeze +22..+51 ms; soft sync settles at the D-19 deadband 0.02. Systematic in 27/27 wraps across two sessions. The large late landings (W_1 wrap 3 d -0.075; round-7 L6_1 2.244) occur only in stall-invalid runs.';
r701.round10_evidence = 'c-round-10.md §2, §3 (R10-W2), §7; c-round-10/runs/w-summary.txt, w-table.txt, *_wrapdetail.json; a-round-10.md §1.1, a-round-10/runs/*_wraps.json';
r701.spec_finding =
  'The +-0.01 landing window is B-authored (tasks/round-7.md:159, from C round-6 observed values); the original RF5-2 acceptance (tasks/round-5.md:135) is vt in [2, 4] plus the D-19 drift thresholds. D-19 stops correcting at |d| <= 0.02. The two B rules contradict for any post-swap transient > 0.02. B resolves it in the stricter direction (app behaviour), not by widening the window: D-19a.';
r701.routed_to =
  'round 12 under D-19a (plan.md): after a standby swap the soft-sync controller uses a settle band <= 0.008 s and a settle gain inside the unchanged rate band [0.5, 2.0] until |d| first falls inside the band, or 1.0 s, or the next seek/swap/pause; then the 0.02 deadband resumes. Pure helper in video-sync.ts, deterministic simulation test (modelled 30 ms post-start freeze reaches |d| <= 0.01 by +300 ms); dock touched only in the swap block and at the rate write; hold, stall/escalation, D-24/D-24a unchanged. Verdict R10-W1 under H3 (3 valid L6 runs incl. a fresh load). The Tech Lead quiet-Chrome RF7-3 run remains required evidence. The window is not widened; widening it would need the Tech Lead.';
r701.status = 'open';
s03.evidence_round10 = 'c-round-10.md §2 (R10-W1 FAIL 6/9, d(+300) -0.017..-0.020 in 9/9), §4 (N_1, V3_1, F_1 H2, R5-L3, R5-E1 PASS)';

const s05 = item('SRW-05');
s05.regression_note.routed_to = 'round 12 (C-R7-01 under D-19a, owned by SRW-03)';
s05.evidence_round10 = 'c-round-10.md §4: R5-L3 (seam 0 sample, 1 source per clip per wrap) and R5-E1 (loop-on WAV = loop-off, maxDiff 0) PASS';

const s10 = item('SRW-10');
const r702 = bug(s10, 'C-R7-02');
r702.status = 'resolved';
r702.resolved_evidence =
  'C round 10 R10-R1 PASS (n5r sweep max overflow 0.5 px at 1280x720 and 0.48 px at 1440x900, empty default 0, 0 overlaps, 0 cut labels, min gap 40.05, nLabels identical to round 7 at 29/29 zooms) and R10-R2 PASS (3 new view.test.ts cases; C independent esbuild guard: round-9 last tick right edge = W + 1.000 fails, round 10 passes; 2877-case sweep 0 label differences). Named exception R10-N5-U: before toHaveLength(31) with at(-1) {30, null}; after toHaveLength(30) with at(-1) {29, 0:29}; meaning kept. Intended visible change: the 1 px line at the content end is gone.';
r702.resolved_evidence_ref = 'c-round-10.md §3 (R10-R1, R10-R2), c-round-10/runs/n5r-*.json, n5r-compare.txt, guard-ruler.txt';
s10.remaining = 'only the Tech Lead real-mouse/wheel/pinch check (R10-N1/N2); not done until it is recorded';
s10.evidence_round10 = 'c-round-10.md §3: R10-R1, R10-R2 PASS; C-R7-02 closed';

const s11b = item('SRW-11B');
const st2 = s11b.stages.find((s) => s.stage === 2);
st2.round = 11;
st2.status = 'dispatched';
st2.acceptance = ['R11-P2', 'R11-P2k', 'R11-P2a (D-29b form)', 'R11-P4 (fold shots)', 'R11-U (track/auto-fit/cap)', 'R11-Doc'];
st2.note =
  'D-29b (plan.md): while auto-fit is on and the user has not resized the detail panel this session, the panel renders at min(stored, cap), cap = largest height in [120, 280] that keeps ruler + loop strip + scrollbar + every lane at its auto-fit minimum visible (120 if none); the first user separator drag/keys turns the cap off. R11-P2a at 1280x720 asserts a rendered panel height in [120, 144] with all 4 lanes visible and no vertical scroll. D-29a mount decision unchanged. A re-measures the budget before code.';
const st3 = s11b.stages.find((s) => s.stage === 3);
st3.round = 13;
st3.note = 'depends on SRW-03 (C-R7-01 closes in round 12 under D-19a, or the Tech Lead accepts quiet Chrome)';
s11b.decisions = (s11b.decisions || []).concat([
  'D-29b (round 10 planning, for round 11): auto-fit makes the detail panel yield first down to 120 px; the user detail resize wins; see plan.md',
]);
s11b.polish_round = {
  round: 14,
  items: [
    'code-reviewer L11 (number-input wheel)',
    'round-9 reviewer M1 (transportRunningRef latch)',
    'round-9 reviewer M-R10-1 / M2 (LibraryPlayheadText 20 Hz during library preview)',
    'round-9 reviewer L2-L8',
    'design-philosopher (a)-(d)',
  ],
  note: 'scheduled after stage 3 because ArrangementContext.tsx, ArrangementLibraryPreview.tsx and the detail playhead writer stay frozen for the Tech Lead C-R8-01/C-R6-02 run and round 12; recorded, not dropped',
};

b.open_findings.push({
  id: 'harness-H3',
  status: 'resolved',
  detail:
    'B decision for future rounds (from the round-12 verdict on): the RF5-2 regression rule is evaluated on one row, |vt - expected(ctx)| <= 0.01 at the first rAF with ctx >= wrap + 0.300, expected = loop.start + (ctx - wrapCtx); or vt interpolated to exactly wrap + 0.300 (C wrapdetail d300). Does not re-score round 10 (R10-W1 fails under both).',
  evidence: 'c-round-10.md §7 H3; a-round-10.md §1.1 harness note',
});
b.open_findings.push({
  id: 'vitest-sfx-library-timeout-flake',
  status: 'watch',
  detail:
    'A round 10 full run 1 had 1 failed: app/lib/__tests__/sfx-library.test.tsx "adds three sounds ... save/open" timed out at 5000 ms; it passed alone (3/3) and in the full re-run; C round 10 did not reproduce it (812/812). File untouched by Studio work. If it recurs, report both runs; not a Studio bug.',
  evidence: 'a-round-10.md §4, a-round-10/gates/vitest-all-run1-timeout.txt; c-round-10.md §1',
});
b.open_findings.push({
  id: 'c-r10-stale-root-L8',
  status: 'resolved',
  detail:
    'C round 10 §9 listed root L8 (new AudioContext not wrapped) as carried. It is closed: c-round-4.md §7 line 303, R4-B6 (Web Audio failure shows a status). Round-11 task §6.5 names it in the closed list.',
});

const fa = b.open_findings.find((f) => f.id === 'untracked-codex-frontend-architect-toml');
if (fa) {
  fa.detail += '; still present at round-10 end (c-round-10.md §9), untouched by A/B/C';
}

b.baseline.vitest_floor_round11 = 812;
b.baseline_tree_at_round11 =
  'HEAD c5ed47b + 15 modified (round 6-10) + 9 Studio untracked (ArrangementDetailPanel.tsx, panels.ts, panels.test.ts, detail-panel.test.tsx, render-budget.test.tsx, docs 016/017/018/019), verified by C round 10 (c-round-10/git-status-end.txt); plus foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted; vitest baseline 52 files / 812 tests';

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('backlog v12 written');
