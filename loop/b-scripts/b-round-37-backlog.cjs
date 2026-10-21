const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 38) throw new Error('expected v38, got ' + b.version);
b.version = 39;
b.updated = '2026-10-13 (B: round 37 result -> round 38 dispatch, D-29z3)';
b.current_task = 'current-task.md (round 38: SRW-13 stage 4b-1 - fader click does not jump (pointerdown preventDefault, explicit focus, relative drag through the existing preview/commit APIs) and double-click resets Volume (audio + video tracks) to 100 %, Master to 0.0 dB, Pan to C; Zoom excluded; ArrangementContext.tsx and StudioWorkspace.tsx frozen; D-29z3)';
b.advisor_used_by_B += ' ; round 37 -> 38 planning (2026-10-13): advisor available, called before writing (advice applied: inspect partial B state first (all owned files identical to backups); new baseline 134b4ab clean tree, new frozen list + snapshots, own gates; close C-R36-01/A-R36-TEST-NITS/DOC036-R36-REVIEW-SENTENCE on C evidence; B fixes its own C-R37-02 wording in plan.md; round 38 = 4b-1 with preventDefault-on-pointerdown design compatible with the frozen pointerDown+change tests; pre-authorise the exact frozen focus-test amendments; double-click verification limits stated; precise Ableton table; decision CONTINUE)';

const s = b.items.find((i) => i.id === 'SRW-13');
const fix5 = s.stages.find((x) => x.stage === '4a-fix5');
fix5.status = 'done';
fix5.result = 'round 37: C PASS (c-round-37.md) on every ID: G37-1..3, R37-S, R37-PG (PG-1/2/3 + 1280; field keeps 3, Enter or blur after release commits once), R37-MN (incl. MN-2b raw-text early return), R37-CR, R37-K, R37-U mutations a-e killed (a = snapshot source, exactly N1-N3 red), R37-Doc; vitest 1264/1264. C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE closed. New Low C-R37-01 (kept text has no pending marker), C-R37-02 (B wording, fixed by B). Root committed rounds 31-37 as 134b4ab (both remotes). B gates b-round-37/gates.txt.';
const i4b = s.stages.findIndex((x) => x.stage === '4b');
const old4b = s.stages[i4b];
const stage4b1 = {
  stage: '4b-1',
  round: 38,
  status: 'dispatched',
  decision: 'D-29z3',
  scope: 'no-jump fader press + relative drag + double-click reset for track Volume (audio and video tracks), Master Volume and track Pan. Mechanism: preventDefault on the fader pointerdown (B probe b-round-37/probe-pointerdown.txt: no jump, no native focus, click still fires), explicit focus when the gesture claim succeeds, blocked status and no focus when it is refused, window pointermove -> existing previewTrackVolume / previewMasterGain / previewTrackPan (full rendered width = full range, snapped to the step), release through the existing commit paths (one entry; no entry when the value is unchanged), touch-action none on the three faders. Double-click -> default (Volume 1, Master 0 dB, Pan 0) with one entry through existing APIs, 0 entries at default. Zoom slider unchanged. ArrangementContext.tsx and StudioWorkspace.tsx frozen; keyboard paths unchanged.',
  acceptance: ['R38-PG', 'R38-DR', 'R38-DC', 'R38-MN', 'R38-CR', 'R38-K', 'R38-S', 'R38-U', 'R38-Doc', 'G38-1', 'G38-2', 'G38-3'],
};
const stage4b2 = {
  stage: '4b-2',
  round: '39+',
  status: 'todo',
  scope: 'FADER-KEY-ENTRIES, A-R29-REVIEW-1 (pending flush label), pending-commit order (checkpoint-oct13 #5), stale refusal status (C-R31-INFO-REFUSAL-STATUS, C-R37-01 status part), C-R37-01 pending marker, A-R31-REVIEW-2, A-R32-REVIEW-1 (+ CP-R37-PAN-KEY-LOCK), A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES; at most three related bugs per round. Must keep the round-36 root capture and the round-38 no-jump press.',
};
if (!s.stages.some((x) => x.stage === '4b-1')) {
  old4b.status = 'split';
  old4b.split_into = ['4b-1 (round 38)', '4b-2 (round 39+)'];
  s.stages.splice(i4b + 1, 0, stage4b1, stage4b2);
}
s.stages.find((x) => x.stage === '4c').round = 'after 4b-2';
s.decisions_round38 = {
  result_round37: 'C PASS on every round-37 ID (c-round-37.md); C-R36-01 fixed in the browser (field keeps 3; Enter or blur after release commits once; Enter during a gesture still reverts)',
  design: 'preventDefault on the fader pointerdown keeps every frozen test that models a drag as pointerDown + change green (onChange stays for keyboard and for those tests); the real drag comes from window pointermove into the same preview functions; context unchanged',
  focus: 'a prevented pointerdown loses the native focus, so the fader focuses itself when its claim succeeds; this keeps Delete/Backspace a no-op on a just-clicked fader (round 32-33 contract) and keeps arrow keys working after a click; a refused claim (another gesture active) gets the existing blocked status and no focus change',
  frozen_test_amendments: 'fader-guards.test.tsx l.840 (expects the SFX Volume, not the music Volume, after the SFX press), l.1597 title and l.1602 (Master, not music Volume, after the Master press); both pinned a jsdom-only absence of focus that Chrome never had (C round 36/37: native focus moves to the pressed range)',
  drag_scale: 'full rendered input width = full range; snapped to the native step; clamped; vertical movement ignored; no entry when the final value equals the start value (commitHistory JSON dedupe, model.ts l.603)',
  double_click: 'dblclick handler; vitest fireEvent.dblClick; C synthetic dblclick (labelled); real double-click = Tech Lead R38-T (gstack has no dblclick, CDP Input.dispatchMouseEvent not allow-listed)',
  ableton: 'Pan double-click reset confirmed (Live 12 section 18.1, b-round-29 capture); Volume/Master double-click reset unconfirmed for the mixer (section 42.4 "Reset Parameter Value - Delete or double-click" is under Working with Devices, b-round-37/ableton-live-keyboard-shortcuts-20261013.txt); no-jump press: no source text found - CZABA requirement; section 42.6 "Return to Default - Delete" is a deliberate difference (Delete on a focused range stays a browser no-op, StudioWorkspace l.1182); Shift fine drag = T12.9',
  c_r37_02: 'B corrected the D-29z2 row-5 wording in plan.md: the early return compares the raw text (l.330), normalised-equal but textually different input passes it',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('C-R36-01'), { status: 'closed', closed: 'round 37: C R37-PG PASS (c-round-37/runs/pg-1440.txt, pg-1280.txt; field keeps 3 after the real Master click, Enter or blur after release commits once), R37-U mutation a = snapshot source gives exactly N1-N3 red' });
Object.assign(byId('A-R36-TEST-NITS'), { status: 'closed', closed: 'round 37: C R37-S (3 pin lines, 0 - lines) and R37-U mutation e (case 7 pin live)' });
Object.assign(byId('DOC036-R36-REVIEW-SENTENCE'), { status: 'closed', closed: 'round 37: C R37-Doc (l.436 clause accurate against c-round-36/runs/ot.txt OT-5b)' });
const add = (x) => {
  if (!byId(x.id)) f.push(x);
};
add({ id: 'C-R37-01', severity: 'low', status: 'open', to: 'SRW-13 stage 4b-2', title: 'after D-29z2 the kept, uncommitted Clip Gain text shows no pending marker; a later successful fader edit does not commit it and the stale blocked status survives that edit; the later focus+blur commits Clip Gain after the fader entry', evidence: 'c-round-37/runs/kept.txt KEPT-1, KEPT-2; c-round-37.json bugs[0]', note: 'no data loss; accepted by D-29z2; status part = C-R31-INFO-REFUSAL-STATUS' });
add({ id: 'C-R37-02', severity: 'low', status: 'closed', to: 'B (plan wording)', title: 'D-29z2 row 5 said normalised-equal text takes the early return; the code compares the raw text', evidence: 'c-round-37/runs/mn.txt MN-2b', closed: 'B round 37 planning: plan.md D-29z2 row 5 corrected; code and doc 036 already agree' });
add({ id: 'DOC036-R37-TAIL', severity: 'low', status: 'open', to: 'polish round (docs)', title: 'doc 036 l.436: the unchanged tail still says the A-R36-REVIEW-1 path stays open (stage 4b), contradicting the new clause; the Round 37 append says it supersedes the tail', evidence: 'c-round-37.md section 8; a-round-37.md R1', note: 'doc-only, one clause' });
add({ id: 'DOC036-ROUND-REF', severity: 'low', status: 'open', to: 'polish round (docs)', title: 'doc 036 l.468 says stage 4b is round 37; it is round 38 (4b-1)', evidence: 'c-round-37.md section 8; a-round-37.md R7', note: 'doc-only' });
add({ id: 'A-R37-TEST-HARDENING', severity: 'low', status: 'open', to: 'SRW-13 stage 4b-2 or the final regression', title: 'round-37 describe: N5 has no mid-test pin that "3" was kept before the selection change (passes on the old source too); jsdom fireEvent.blur does not move activeElement, so field.focus() in N1/N2 is a no-op', evidence: 'a-round-37.md section 4 R4, R5', note: 'test-only; behaviour covered in the browser by R37-PG' });
add({ id: 'CP-R37-PAN-KEY-LOCK', severity: 'low', status: 'open', to: 'SRW-13 stage 4b-2 (with A-R32-REVIEW-1)', title: 'while the Pan blur suppression is set, handlePanChange ignores every change including arrow keys; if the release is lost (window blur) the Pan keyboard stays dead until a new press on the slider', evidence: 'checkpoint-r37-review.md suggestion 1', note: 'same root cause as A-R32-REVIEW-1' });
add({ id: 'CP-R37-DRAG-ENTRIES', severity: 'info', status: 'open', to: 'SRW-13 stage 4b-2 (evaluate)', title: 'if claimPointerGesture window-blur abort runs without an element blur first, panDragCleanupRef stays set and later drag input takes the keyboard path (one entry per event); not reproduced in normal browsers', evidence: 'checkpoint-r37-review.md suggestion 2', note: 'round 38 changes the real Pan drag to pointermove; re-evaluate after 4b-1' });
add({ id: 'CP-R37-PAN-CLAMP', severity: 'info', status: 'accepted', to: 'none (re-open with import/persistence)', title: 'trackPanValue and handle.setTrackPan do not clamp; every current caller passes normalised values', evidence: 'checkpoint-r37-review.md suggestions 3, 4', note: 'unreachable today: arrangements have no import or persistence layer' });
for (const id of ['A-R33-REVIEW-TOUCH', 'A-R32-REVIEW-1', 'A-R31-REVIEW-2', 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL', 'FADER-KEY-ENTRIES', 'MASTER-HOLD-TICK-EDGE', 'C-R31-INFO-REFUSAL-STATUS', 'A-R34-REVIEW-RESIDUALS']) {
  const x = byId(id);
  if (x && typeof x.to === 'string') x.to = x.to.replace(/stage 4b \(round 38\)/g, 'stage 4b-2 (round 39+)').replace(/round 38/g, 'round 39+').replace(/stage 4b$/g, 'stage 4b-2');
}

const r37 = b.rounds.find((r) => r.round === 37);
Object.assign(r37, { task: 'tasks/round-37.md', status: 'c_pass', result: 'C PASS on every ID (c-round-37.md); C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE closed; vitest 1264/1264; new Low C-R37-01, C-R37-02 (B wording, closed); C-R23-01 2 NUL unchanged (28013/28014, 63 520 bytes); root checkpoint 134b4ab published; B gates b-round-37/gates.txt' });
if (!b.rounds.some((r) => r.round === 38)) {
  b.rounds.push({ round: 38, task: 'current-task.md', items: ['SRW-13 stage 4b-1'], status: 'dispatched', decision: 'D-29z3', note: 'baseline HEAD 134b4ab, clean tree; frozen b-round-37-tree-sha256.txt (376 = round-36 list minus ArrangementLane.tsx and ArrangementMaster.tsx plus ArrangementDetailPanel.tsx and doc 036); snapshots b-round-37-snapshots/ (Lane b689c710, Master 0de72e4f, fader-guards 3d120483)', c_ids: ['R38-PG', 'R38-DR', 'R38-DC', 'R38-MN', 'R38-CR', 'R38-K', 'R38-S', 'R38-U', 'R38-Doc', 'G38-1', 'G38-2', 'G38-3'], owned: ['app/components/arrangement/ArrangementLane.tsx (Volume and Pan inputs only)', 'app/components/arrangement/ArrangementMaster.tsx (Master Volume input only)', 'app/hooks/useRelativeFaderDrag.ts (new)', 'app/lib/arrangement/fader.ts (new, pure)', 'app/lib/arrangement/__tests__/fader-click.test.tsx (new)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (3 authorised lines only)', 'docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md (new)'] });
}
b.vitest_floor_round38 = 1264;
b.vitest_expected_round38 = '>= 1264 + the new tests (fader-click.test.tsx); fader-guards stays 71';
b.baseline_tree_at_round38 = 'HEAD 134b4ab (root checkpoint of rounds 31-37, both remotes), git status empty; sha256 of 376 frozen files: b-round-37-tree-sha256.txt; 3 owned snapshots in b-round-37-snapshots/; B gates b-round-37/gates.txt';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 38 -StartPhase A and a higher limit';
fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length);
