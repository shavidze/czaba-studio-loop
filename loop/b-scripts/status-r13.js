const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
const item = (id) => b.items.find((i) => i.id === id);

b.updated = '2026-10-10';
b.version = 14;
b.current_task = 'current-task.md (round 13: SRW-11B stage 3, floating expanded video VID-06)';

const s03 = item('SRW-03');
const r701 = s03.open_bugs.find((x) => x.id === 'C-R7-01');
r701.status = 'closed_headless';
r701.round12_result =
  'C round 12 (c-round-12.md §2.1): R12-W1 PASS, 3 valid L6 runs incl. fresh load, 9/9 wraps d300 -0.0030..+0.0058 (round 10: -0.017..-0.020), swaps only, 0 hard seeks in the wrap windows, videoSettles 0 -> 3 = swaps, escalations 0, D-24 PASS, settle-window rate <= 1.45 at |d| <= 0.11, multi 0, frames past loop.end 0. R12-U PASS incl. C guard mutations M1-M7. Adjacent R2-V3, RF5-3 (first Play does not arm), R5-L3, R5-E1, RF7-P2, dock quick check PASS; R3-V1 N info .0109/.0196. Round 12 taskStatus stays FAIL on the literal R12-S (5 pre-first-swap writes, C-R12-01).';
r701.closure_basis =
  'B decision D-19b (plan.md): R12-S was mis-scoped by B. It reached into the pre-first-swap start transient, where settle is unarmed (videoSettles 0) and the steady path is byte-unchanged (C diff: video-sync.ts additions only; unarmed settleRate == videoRateCorrection on the grid; C M4). R12-S applies from the first arm onward; there C measured 0 rate != 1 writes outside settle windows (r12s-split.txt postNe 0: 0/147, 0/147, 0/145, V3_1 0/237). The tolerance is not changed. The start transient belongs to RF5-3 and is tracked as C-R12-01.';
r701.remaining =
  'Tech Lead quiet real Windows Chrome RF7-3 (VP9 + H.264) remains required evidence for SRW-03/SRW-05; headless closure is not a real-Chrome PASS.';
r701.evidence_round12 = [
  'c-round-12.md §2.1-§2.2, §3',
  'c-round-12/runs/w-table.txt, w-summary.txt, settlecheck-W.json, r12s-split.txt, r12s-neighbor.txt',
];
s03.open_bugs.push({
  id: 'C-R12-01',
  severity: 'low',
  title:
    'first Play start transient: the unchanged steady rule writes 1.1 at 0.19-0.33 s after Play while the same-frame harness |d| is 0.0192-0.0196 (<= 0.02); 5 writes in W_1/W_2/W_3, all before the first swap with settle unarmed',
  status: 'open',
  evidence: 'c-round-12/runs/r12s-neighbor.txt, r12s-split.txt, settlecheck-W.json; c-round-12.md §2.2, §7',
  analysis:
    'Margin <= 0.8 ms. The harness reference is ctx-based posAt; the dock uses the live position. Not a regression: the path is byte-unchanged since round 4/5 and the code under test in round 12 cannot reach it.',
  routed_to:
    'milestone regression RF5-3: C reports start-transient rate writes with one dock live-position read (getLivePosition via the existing harness, no source instrumentation) next to the harness d; if the dock-side |d| <= 0.02 at a rate != 1 write, it becomes a D-19 bug with its own round. Not a dedicated re-measure round of unchanged code (agent-workflow.md).',
});
s03.d19b_round12 =
  'R12-S scope correction (plan.md D-19b); sourceChanged reviewer Low 1 accepted without a fifth end site (sourceChanged sets seekWanted, so no rate is written before issueHoldSeek, which calls endSettle).';
s03.next_round_note =
  'C-R7-01 closed headless (round 12). SRW-03 stays regression_open while C-R6-02 is open (Tech Lead quiet Chrome, R3-V1 D layout); C-R12-01 at the milestone RF5-3. Round 13 changes only the dock layout (floating box); the sync effects must stay byte-identical and C runs one R12-W1-style wrap run as an adjacent regression.';

const s05 = item('SRW-05');
s05.status = 'verified_except_manual';
s05.evidence_round12 =
  'C round 12 R12-W1 PASS: video landing after loop wraps 9/9 within 0.01 at +300 ms (H3); R5-L3 seam 0 samples, 1 source per clip per wrap; R5-E1 loop-on = loop-off maxDiff 0. Remaining: Tech Lead quiet-Chrome RF7-3.';
s05.regression_note = Object.assign({}, s05.regression_note, {
  status: 'closed_headless_round12',
  closed_by: 'C round 12 R12-W1 (c-round-12.md §2.1)',
});

const s11b = item('SRW-11B');
const st3 = s11b.stages.find((s) => s.stage === 3);
st3.status = 'dispatched';
st3.dispatch_basis =
  'C-R7-01 closed headless in round 12 (R12-W1 PASS; R12-S rescoped by D-19b). Tech Lead quiet Chrome still required for SRW-03.';
st3.acceptance = [
  'R11-P3 (R13-F1 expand/place, R13-F2 move/clamp, R13-F3 return paths and Esc precedence, R13-F4 library interplay, R13-F5 same nodes + sync)',
  'R11-P4 (video shots, R13-F6)',
  'R11-U (R13-U float clamp, placement, same nodes, Esc, registry)',
  'R13-Doc',
];
st3.decision = 'D-29d (plan.md): floating video implementation contract';
s11b.stages_status.stage3 = 'dispatched (round 13, D-29d)';
s11b.next_round_note =
  'round 13 = stage 3 (floating video, D-29d). Polish 14a (C-R11-01..03) follows in round 14; ArrangementLane.tsx stays frozen in round 13.';

b.baseline_tree_at_round13 =
  'HEAD c5ed47b + 17 modified + 12 Studio untracked (round 6-12; adds video-sync.ts M, doc 021 ??), identical to C round-12 end (c-round-12/gates/git-status-end.txt); sha256 of every Studio file: b-round-12-tree-sha256.txt (38 entries, equals A owned-final-sha256 for dock/video-sync/test/doc 020); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round13 = 877;

b.open_findings.push({
  id: 'reviewer-r12-low1-sourceChanged',
  status: 'accepted',
  note: 'A round-12 code-reviewer Low 1: no endSettle() at sourceChanged. Accepted without code: sourceChanged sets seekWanted (dock l.535-545), so the frame returns before the rate write (l.558) until issueHoldSeek (l.548), which calls endSettle (l.328). Residual: a spontaneous pause -> holdRelease -> play keeps settle armed <= 1.0 s; rate stays <= 1.45. B decision D-19b.',
});
b.open_findings.push({
  id: 'dirty-tree-exposure',
  status: 'root',
  note: 'No commit since c5ed47b; the Studio work of rounds 6-12 (17 M + 12 untracked) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.',
});

b.rounds.find((r) => r.round === 12).status = 'c_fail_literal_r12s';
Object.assign(b.rounds.find((r) => r.round === 12), {
  c_result:
    'FAIL on the literal R12-S (5 pre-first-swap start-transient writes at harness |d| 0.0192-0.0196, C-R12-01 Low). PASS: R12-W1 (9/9 d300 -0.0030..+0.0058, settles = swaps, escalations 0), R12-U (58/58, C guard M1-M7), R12-Doc, R2-V3, RF5-3 H2, R5-L3, R5-E1, RF7-P2, dock quick check, G12-1..3. R3-V1 N info .0109/.0196.',
  c_passed: ['R12-W1', 'R12-U', 'R12-Doc', 'R2-V3', 'RF5-3-H2', 'R5-L3', 'R5-E1', 'RF7-P2', 'dock-quick-check', 'G12-1', 'G12-2', 'G12-3'],
  c_bugs: ['C-R12-01 (Low)'],
  c_evidence: ['c-round-12.md', 'c-round-12.json', 'c-round-12/'],
  b_record: 'b-round-12.md',
  b_decision:
    'D-19b: R12-S rescoped (B mis-scope, not a tolerance change); C-R7-01 closed headless on R12-W1; C-R12-01 to the milestone RF5-3; sourceChanged Low 1 accepted. Round 12 taskStatus FAIL stays in the record.',
  gates:
    'C re-ran: tsc 0; vitest 53 files 877/877; biome owned 52 files 0, ./app 0 errors / 218 warnings; build ok; protected 4/4 OK; Header identical to HEAD; 33/37 b-round-11 hashes OK, the 4 changed are exactly the owned files; anon /studio-lab clean; studio-token 401; fake Bearer 500 no token (backend 5199 down, partial)',
});
b.rounds.push({
  round: 13,
  task: 'current-task.md',
  items: ['SRW-11B stage 3: floating expanded video (VID-06, D-29d)'],
  status: 'dispatched',
  note: 'one feature round. Dock sync effects byte-identical; library collapse lifted to StudioWorkspace props (ArrangementContext frozen); adjacent: one R12-W1-style wrap run, R3-V1 light across expand -> drag -> return, RF5-3 counters, R12-S from first arm (info).',
});

const pr = b.planned_rounds;
const p12 = pr.find((r) => r.round === 12);
p12.note = `${p12.note} Result: R12-W1 PASS, R12-S literal FAIL rescoped by D-19b; C-R7-01 closed headless.`;
const p13 = pr.find((r) => r.round === 13);
p13.note = 'dispatched: C-R7-01 closed headless in round 12 (D-19b); D-29d contract';

b.advisor_used_by_B = `${b.advisor_used_by_B} Round 12 -> 13 planning: available, called before writing (advice applied: R12-S rescope as a B mis-scope with the round-12 FAIL kept on record, C-R7-01 closed headless, C-R12-01 to the milestone RF5-3, sourceChanged accepted from the dock trace, library collapse lifted via StudioWorkspace props not ArrangementContext, dock sync effects byte-identical with a diff check, Esc precedence via defaultPrevented/isTypingTarget, placement after the aside transitionend, b-round-12-tree-sha256.txt reference, vitest floor 877, one wrap run as adjacent regression) and after writing.`;

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok');
