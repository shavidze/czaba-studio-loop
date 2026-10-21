const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 37) throw new Error('expected v37, got ' + b.version);
b.version = 38;
b.updated = '2026-10-13 (B: round 36 result -> round 37 dispatch, D-29z2)';
b.current_task = 'current-task.md (round 37: C-R36-01 - an involuntary blur of the Clip Gain field during another pointer gesture keeps the typed text instead of reverting it (ArrangementDetailPanel.tsx commitClipGain gesture branch: revert only on Enter); round-36 test nits (case 7 status pin, case 8 start.value pin); doc 036 outdated A-R36-REVIEW-1 sentence + append; D-29z2)';
b.advisor_used_by_B += ' ; round 36 -> 37 planning (2026-10-13): advisor available, called once before writing (advice applied: close C-R34-01/02 on C round-36 evidence, add C-R36-01 Medium; FB-04/SRW-13 stay bug; Locus A (DetailPanel blur keeps text, Enter unchanged) as the smallest honest fix with StudioWorkspace frozen; round composition C-R36-01 + test nits + doc sentence; triage checkpoint-oct13 Lows; renumber 4b -> 38; decision CONTINUE)';

const s = b.items.find((i) => i.id === 'SRW-13');
const fix4 = s.stages.find((x) => x.stage === '4a-fix4');
fix4.status = 'done';
fix4.result += ' | round 36 (redispatch, D-29z1): C PASS (c-round-36.md) on every ID: G36-1..3, R36-CR 5/5 targets + two Undos + 1280 spot, R36-OT, R36-CL 3/3 valid (2 setTargetAtTime per click inside [4,6), 0 restarts), R36-R34, R36-K, R36-S, R36-U mutations a-f killed, R36-Doc; vitest 1259/1259. C-R34-01 and C-R34-02 closed. New pre-existing C-R36-01 (Medium). B gates b-round-36/gates.txt.';
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 38;
st4b.split_note = 'may split: 4b-1 (round 38) no-jump fader click + double-click reset for Volume/Master/Pan (Live 12 section 18.1 confirms the reset); 4b-2 (round 39+) FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending-commit order, stale refusal status (C-R31-INFO-REFUSAL-STATUS), A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE (further split to at most 3 related bugs per round). Full scope stays.';
s.stages.find((x) => x.stage === '4c').round = '39-40';
const fix5 = {
  stage: '4a-fix5',
  round: 37,
  status: 'dispatched',
  decision: 'D-29z2',
  scope: 'C-R36-01: in ArrangementDetailPanel.tsx commitClipGain, when a pointer gesture is active the blur trigger keeps the typed text (status GESTURE_EDIT_BLOCKED_MESSAGE, no entry); Enter during a gesture is unchanged (reverts, frozen clip-gain.test.tsx l.815-831). Plus round-36 test nits (case 7 pins the invalid status literal, case 8 pins start.value 4.5) and doc 036 (outdated A-R36-REVIEW-1 sentence; Round 37 append). StudioWorkspace.tsx frozen.',
  acceptance: ['R37-PG', 'R37-MN', 'R37-CR', 'R37-K', 'R37-S', 'R37-U', 'R37-Doc', 'G37-1', 'G37-2', 'G37-3'],
};
const i4b = s.stages.findIndex((x) => x.stage === '4b');
if (!s.stages.some((x) => x.stage === '4a-fix5')) s.stages.splice(i4b, 0, fix5);
s.decisions_round37 = {
  result_round36: 'C PASS on every round-36 ID; C-R34-01 and C-R34-02 closed; new C-R36-01 Medium (pre-existing, multi-pointer only; = A-R36-REVIEW-1, reproduced with a synthetic separator gesture 41 + a real Master click, c-round-36/runs/ot.txt OT-5b)',
  fix: 'Locus A: commitClipGain gesture branch -> setStatus(GESTURE_EDIT_BLOCKED_MESSAGE); revert the text only when trigger === "enter"; return. The blur trigger keeps the typed text visible and uncommitted; after release the user commits with Enter or a later blur',
  why_enter_unchanged: 'Enter is voluntary and the field keeps focus, so the user can retry after release; the frozen clip-gain.test.tsx l.815-831 pins the revert. Blur during another gesture is involuntary (a second pointer stole focus), so reverting destroys the only copy of the user input',
  rejected_B: 'root capture preventDefault on range pointerdown during a gesture: amends D-29z decision 5 and suppresses every second-pointer range press (Zoom included); stage 4b no-jump may introduce preventDefault anyway',
  rejected_C: 'auto-commit on gesture end: needs a new context API across ArrangementContext.tsx, StudioWorkspace.tsx and the panel for a multi-pointer-only path; larger than the problem',
  limitation: 'the pending text follows the existing D-29u selection rule: a different clip selected before the commit discards it (frozen clip-gain.test.tsx l.803); the refusal status is shown at the moment focus is stolen, so the loss is not silent',
  test_nits: 'case 7 pins blurStatus to the literal invalid message; case 8 pins start.value 4.5 after the press and after pointerup; l.1272 (redundant after l.1265) stays with the D-29z1 bytes',
  frozen_swap: 'b-round-36-tree-sha256.txt = round-35 list minus ArrangementDetailPanel.tsx plus StudioWorkspace.tsx (376 files, 0 not-OK at B time)',
  expected_counts: 'fader-guards 66 + 5 = 71; full vitest 1259 + 5 = 1264',
  renumber: '4b -> round 38 (optional split 38/39), 4c + polish -> rounds 39-40',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('C-R34-01'), { status: 'closed', closed: 'round 36: C R36-CR PASS (c-round-36/runs/cr-1440.txt, cr-1280.txt; 5/5 targets, two Undos, 1280 Master), R36-CL 3/3 live, R36-U mutations a-f killed; B gates b-round-36/gates.txt' });
Object.assign(byId('C-R34-02'), { status: 'closed', closed: 'round 36: C R36-Doc PASS (c-round-36/gates/snap-036.diff; l.355 matches c-round-34/runs/sb-geometry.txt)' });
const add = (x) => {
  if (!byId(x.id)) f.push(x);
};
add({ id: 'C-R36-01', severity: 'medium', status: 'open', to: 'round 37 (D-29z2)', title: 'a typed Clip Gain value (no Enter) is lost when focus is taken by a range press of a second pointer while another pointer gesture is active: commitClipGain("blur") sees the gesture, writes the blocked status and restores the old text; still lost after the first gesture ends', evidence: 'c-round-36/runs/ot.txt block OT-5b; c-round-36.json bugs[0]; a-round-36.md section 4 A-R36-REVIEW-1', note: 'pre-existing (D-29z row 2 leaves gesture-active presses unchanged); reachable only with two simultaneous pointers (multi-touch, pen + mouse); status shown, so not silent; loss of user input -> scheduled before new features' });
add({ id: 'A-R36-TEST-NITS', severity: 'low', status: 'open', to: 'round 37 (D-29z2)', title: 'round-36 describe: case 7 does not pin the invalid status, case 8 does not pin start.value after the press, l.1272 is redundant after l.1265', evidence: 'a-round-36.md section 4; c-round-36.md section 12', note: 'l.1272 stays (D-29z1 bytes, harmless)' });
add({ id: 'DOC036-R36-REVIEW-SENTENCE', severity: 'low', status: 'open', to: 'round 37 (D-29z2)', title: 'doc 036 Round 35-36 section says A-R36-REVIEW-1 was not checked in a browser; C reproduced it (C-R36-01)', evidence: 'c-round-36.md section 9', note: 'doc-only' });
add({ id: 'DOC015-DELETE-GAP-NOTE', severity: 'low', status: 'open', to: 'final docs pass', title: 'doc 015 does not mention that Delete on a time range now leaves a gap (SRW-24); Ctrl+Shift+X closes it', evidence: 'checkpoint-oct13-review.md suggestion 1', note: 'triaged by B round 36 planning' });
add({ id: 'EXPORT-DIALOG-FOCUS-RESTORE', severity: 'low', status: 'open', to: 'polish round (after 4c)', title: 'export dialog captures the focus-restore element in an effect after open (may restore nothing if focus moved earlier); its focusable filter does not skip hidden elements', evidence: 'checkpoint-oct13-review.md suggestion 6 (ArrangementExportDialog.tsx:186-196)', note: 'a11y Low; triaged by B round 36 planning' });
add({ id: 'CHECKPOINT-OCT13-REVIEW-TRIAGE', severity: 'info', status: 'triaged', to: 'b-round-36.md section 6', title: 'checkpoint-oct13-review.md suggestions 1-10 triaged', evidence: 'checkpoint-oct13-review.md', note: '#1 DOC015-DELETE-GAP-NOTE; #2 = L3-REMOVED-TRACK-TAPS (track taps never removed); #3 meter cost and #4 crossfade double count -> evaluate in 4c or accept (cosmetic/perf Low); #5 = stage 4b pending-commit order; #6 EXPORT-DIALOG-FOCUS-RESTORE; #7 accepted (clamp + warning; per-clip over indicator = T12); #8 -> C-R6-02/C-R8-01 Tech Lead quiet Chrome; #9 = ROOT-AGENT-WRITE-GRANT (root); #10 informational (no weakened assertions)' });
for (const id of ['A-R33-REVIEW-TOUCH', 'A-R32-REVIEW-1', 'A-R31-REVIEW-2', 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL', 'FADER-KEY-ENTRIES', 'MASTER-HOLD-TICK-EDGE', 'C-R31-INFO-REFUSAL-STATUS', 'A-R34-REVIEW-RESIDUALS']) {
  const x = byId(id);
  if (x && typeof x.to === 'string') x.to = x.to.replace(/round 37/g, 'round 38').replace(/round 36/g, 'round 38');
}
const cri = byId('C-R31-INFO-REFUSAL-STATUS');
if (cri) cri.round36 = 'seen again in C round 36 (OT-5b blocked status still shown during OT-6) -> stage 4b';

const r36 = b.rounds.find((r) => r.round === 36);
Object.assign(r36, { task: 'tasks/round-36.md', status: 'c_pass_new_bug', result: 'C PASS on every ID (c-round-36.md); C-R34-01 and C-R34-02 closed; vitest 1259/1259; new pre-existing C-R36-01 (Medium); C-R23-01 2 NUL unchanged (28013/28014, 63 520 bytes); B gates b-round-36/gates.txt' });
if (!b.rounds.some((r) => r.round === 37)) {
  b.rounds.push({ round: 37, task: 'current-task.md', items: ['C-R36-01', 'A-R36-TEST-NITS', 'DOC036-R36-REVIEW-SENTENCE'], status: 'dispatched', decision: 'D-29z2', note: 'frozen: b-round-36-tree-sha256.txt (376 files: round-35 list minus ArrangementDetailPanel.tsx plus StudioWorkspace.tsx 7fe98434); snapshots b-round-36-snapshots/ (ArrangementDetailPanel.tsx 60d24bb0, fader-guards.test.tsx ca3153ad, doc 036 d5f206c1); baseline 9 status lines (b-round-36-git-status.txt); expected end 10 lines (the 9 + " M app/components/arrangement/ArrangementDetailPanel.tsx", which is tracked since 08b9e53), or 3 lines if root commits rounds 31-36 first', c_ids: ['R37-PG', 'R37-MN', 'R37-CR', 'R37-K', 'R37-S', 'R37-U', 'R37-Doc', 'G37-1', 'G37-2', 'G37-3'], owned: ['app/components/arrangement/ArrangementDetailPanel.tsx (commitClipGain gesture branch only)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (case 7/8 additive pins + one nested describe of 5 it inside the round-36 describe)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (one sentence + header + append)'] });
}
b.vitest_floor_round37 = 1259;
b.vitest_expected_round37 = '1264 (1259 + 5 new it), fader-guards 71';
b.baseline_tree_at_round37 = 'HEAD 1cefea1 + 9 uncommitted lines (rounds 31-34 + 36 C-verified, ready for root checkpoint); sha256 of 376 frozen files: b-round-36-tree-sha256.txt; 3 owned snapshots in b-round-36-snapshots/; B gates b-round-36/gates.txt: 0 not-OK, protected 4/4, tsc 0, vitest 69/1259, build ok, Biome 2 CRLF errors (root) + 218 warnings + 1 info';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 37 -StartPhase A and a higher limit';
fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length);
