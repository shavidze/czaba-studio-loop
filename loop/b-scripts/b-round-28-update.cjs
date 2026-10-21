const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 29) {
  throw new Error('unexpected backlog version ' + b.version + ' (already updated?)');
}
b.version = 30;
b.updated = '2026-10-12 (B: round 28 result -> round 29 dispatch)';
b.current_task =
  'current-task.md (round 29: SRW-24 follow-up bug round, D-29t - C-R28-01 all-lane clipboard keeps its lanes on Paste (clipboard provenance flag from all-lane Copy/Cut and Cut Time; D-25 amended), C-R28-02 Cut Time no-op is honest (no history, no playhead remap, range kept, true status), footer range line names the all-lane state (A round-28 review finding 4), doc 034 Ableton table corrected per C round 28 section 9)';
b.advisor_used_by_B +=
  ' | round 28 -> 29 planning (2026-10-12): available; called once after orientation and before writing (advice applied: C-R27-01 row 3 because vm-3 was off-procedure like vm-1/2, no A bug round without a mechanism; C-R27-02 condition not evaluable -> watch; C-R28-01 is a D-25 contract gap fixed by clipboard provenance incl. Cut Time; round 29 = bug round, stage 3 rescheduled to round 30; SRW-24/FB-02 = bug (Low) not verified; Cut Time no-op keeps the range) and once before declaring done';

const item = (id) => b.items.find((x) => x.id === id);

const srw24 = item('SRW-24');
srw24.status = 'bug_open_low';
const r24Evidence = {
  'R24-1': 'C round 28 R28-DA (music 0-3 + 5-10 @5, export [3,5) digital 0, [0,3)/[5,10) 0 LSB) and R28-DB (Backspace, Shift+Delete, Shift+Backspace, transport button)',
  'R24-2': 'C round 28 R28-DV (video 0-2 + 4-6.008 @4, playback drift median 2.9 / max 48.1 ms within R3-V1) and R28-DM (one clip, two clips on two lanes)',
  'R24-3': 'C round 28 R28-VL (4 lane overlays 3.000/5.000, loop not toggled, no history) and R28-VD (gaps on music/SFX/video, starts unchanged, export [3,5) digital 0)',
  'R24-4': 'C round 28 R28-CX (all-lane and single-lane = deleteTime, paste on original lanes, while playing playhead -2.000 with no stop, loop 6-8 -> 4-6)',
  'R24-5': 'C round 28 R28-UR (one history step each, exact Undo/Redo) and R28-PS (no jump, gap silent on the tap, drift within tolerance)',
  'R24-6': 'C round 28 R28-TF (library search, detail number input, no selection, transport button, Split refusal) and R28-UI (labels, footer geometry = round 27)',
};
for (const acc of srw24.acceptance) {
  acc.status = 'pass';
  acc.evidence = r24Evidence[acc.id];
}
srw24.evidence = {
  verifier: 'C',
  report: 'tmp/studio-real-loop/c-round-28.md',
  json: 'tmp/studio-real-loop/c-round-28.json',
  passed: ['R28-DA', 'R28-DB', 'R28-DV', 'R28-DM', 'R28-VL', 'R28-VD', 'R28-CX', 'R28-UR', 'R28-PS', 'R28-TF', 'R28-UI', 'R28-K', 'R28-E', 'R28-R', 'R28-S', 'R28-U', 'R28-Doc', 'G28-1', 'G28-2', 'G28-3'],
  vitest: '1119/1119 (1096 + 23)',
};
srw24.open_bugs = ['C-R28-01', 'C-R28-02'];
srw24.next = 'round 29 (D-29t): C-R28-01 + C-R28-02 + footer all-lane state + doc 034 Ableton correction; then Tech Lead R28-T';
srw24.ableton_compliance_round28 =
  'C round 28 section 9: gap delete = confirmed (Live 12 section 6.11); Backspace = unconfirmed; Cut Time = confirmed incl. Ctrl+Shift+X (section 42.16), Delete Time = Ctrl+Shift+Delete in Live, which CZABA leaves unbound (conscious difference); Shift+Delete leaves a gap (conscious difference); Ctrl+Shift+L = Select Loop Brace Contents / Select Material in Loop in Live 12 (sections 42.8/42.16; B round 27 claimed it unverified - B error, corrected in D-29t), CZABA uses it for the all-lane extend (conscious difference, user request); Split on an all-lane range = unconfirmed';

const srw09 = item('SRW-09');
srw09.status = 'contract_updated_bug_open_low';
srw09.note_round29 =
  'Delete contract replaced by SRW-24 (C round 28 PASS). D-25 amended in D-29t: a clipboard that comes from a time selection spanning every lane (all-lane Copy/Cut, Cut Time) keeps its original lanes on Paste; single-lane range and clip Copy/Cut keep the active-track rule. C-R28-01 open until round 29 C.';
srw09.decisions.push(
  'D-29t: clipboard provenance flag set by copyRangeToClipboard on an all-lane range and by the context for Cut Time (cutTimeToClipboard output unchanged because the frozen clipboard.test.ts l.133 pins it with toEqual); planClipboardPaste skips the one-audio-lane active-track routing when the flag is set',
);
srw09.fb_status = {
  'FB-02': 'bug (Low): SRW-24 contract C PASS in round 28; C-R28-01/C-R28-02 open -> round 29',
};

const srw13 = item('SRW-13');
const stage2b = srw13.stages.find((s) => s.stage === '2b');
stage2b.status = 'all_ids_pass_bug_open';
stage2b.result =
  'C round 27 FAIL only on R27-RB cost (C-R27-01); C round 28 section 4.1 ran every owed ID: R27-TL restated oracle PASS (decay p95 0.11, max 0.35 dB), R27-K 1440 + Space on M, R27-L floating video, R27-TO with a non-empty Redo, R27-E offline analysers/splitters 0, R27-R (track Mute de-click, loop seam, library drop), R27-TI video floor - all PASS. C-R27-01 decision table: row 3 (B decision D-29t) -> Tech Lead quiet Chrome.';
srw13.stages.find((s) => s.stage === 3).round = 30;
srw13.stages.find((s) => s.stage === 4).round = 31;

const finding = (id) => b.open_findings.find((x) => x.id === id);
const r2701 = finding('C-R27-01');
r2701.status = 'open_tech_lead_quiet_chrome';
r2701.to = 'Tech Lead quiet Chrome (with C-R6-02 and C-R8-01)';
r2701.round28_record =
  'C round 28 section 6 on the round-26 vm-1 layout (music muted, 1440): vm-1/vm-2 harness-invalid (replaced); vm-3 125.4 ms (every action landed ~2 s off-procedure: issued 2.44/3.64/4.76, landed 3.25/4.10; excursion 0.94-2.80 s began before any click); vm-4 19.0 ms; vm-5 287.6 ms (excursion from 1.33 s, ~130 ms after the Master Mute click at 1.20, no hardSeek). Dock hardSeeks 0 -> 0 in every run; row 4 did not fire. node.exe 37.';
r2701.b_decision_round28 =
  'D-29t: row 3. The table compares like with like only on the same procedure; vm-3 is environment-invalid in the same category as vm-1/vm-2 (off-procedure action timing from browse latency), which leaves 2 valid runs (1 PASS, 1 FAIL) with the 3+2 budget exhausted -> mixed -> Tech Lead quiet Chrome. The table did not anticipate "2 valid of 3+2"; recorded as a B table gap. No A bug round: there is no mechanism hypothesis (track reads ruled out in round 27, no hardSeek, vm-3 drift before any click), so an A round would be the open-ended sync investigation the workflow forbids. Key datum for the Tech Lead: vm-5 287.6 ms within procedure. Standing confound: 35-41 node.exe.';

const r2702 = finding('C-R27-02');
r2702.status = 'watch';
r2702.round28_record =
  'C round 28: the round-27 frozen 8 batch x3 = 152/152 three times at node.exe 35-36; full suite 1119/1119. With round 27 run 3, four consecutive green batches.';
r2702.b_decision_round28 =
  'D-29t: watch, not closed and not a test fix. The pre-registered close condition ("3/3 at a recorded lower load") cannot be evaluated because C round 27 recorded no node.exe count for the failing batches. C records the node.exe count with every full-suite gate; a reproduction at any recorded load reopens it as a test-robustness item (the render-budget failure was an assertion 0.051 vs 0, not only a timeout).';

const r2301 = finding('C-R23-01');
r2301.round28_record =
  'C round 28: 2 NUL (60 494 B) at 28013/28014 (visible "Arrangement · " before hydration). The round-27 pair at 58733/58734 vanished because round 28 changed the footer hint text - an offset shift, not a fix. Hydrated DOM 0 NUL. Still awaiting the Tech Lead.';

b.open_findings.push(
  {
    id: 'C-R28-01',
    severity: 'low',
    status: 'scheduled',
    to: 'round 29 (D-29t)',
    title: 'material cut or copied from an all-lane range pastes onto the active lane when it spans one audio lane',
    evidence: 'c-round-28.md section 11; c-round-28/runs/finding2.txt: music 7-23, range 20-22, Ctrl+Shift+L, Ctrl+X, active SFX, seek 20, Ctrl+V -> [sfx,20,2,off 8], status "ჩასმა (1): 00:20.000-ზე · SFX ხაზზე."; A round-28 code-review finding 2',
    cause: 'planClipboardPaste routes any one-audio-lane clipboard to the active track (D-25); the clipboard carries no provenance',
  },
  {
    id: 'C-R28-02',
    severity: 'low',
    status: 'scheduled',
    to: 'round 29 (D-29t)',
    title: 'Cut Time on a zero-width range (or a range that changes nothing) reports "სიცარიელე დაიხურა ყველა ხაზზე" although nothing changed',
    evidence: 'c-round-28.md section 11; c-round-28/runs/zero-width-cx.txt',
    cause: 'cutTimeSelection ignores applyEdit returning false, still clears the range and the selection, and remaps a stopped playhead',
  },
  {
    id: 'A-R28-REVIEW-4-ALL-LANE-FOOTER',
    severity: 'low',
    status: 'scheduled',
    to: 'round 29 (D-29t)',
    title: 'the all-lane state is visible only in the transient status; the lane overlay is aria-hidden and the footer range line does not name it',
    evidence: 'a-round-28.md section 4 finding 4; c-round-28.md section 11 information',
  },
  {
    id: 'A-R28-REVIEW-5-SPLIT-ENABLED',
    severity: 'low',
    status: 'accepted',
    note: 'D-29t: the Split button stays enabled on an all-lane range and refuses on click with a status, like Ctrl+E (C round 28 R28-TF PASS). Disabling it would hide the reason; kept as a recorded difference.',
    evidence: 'a-round-28.md section 4 finding 5',
  },
  {
    id: 'C-R28-INFO-STALE-STATUS',
    severity: 'info',
    status: 'recorded',
    note: 'after Ctrl+Shift+L a click on an empty lane clears the range, but the status still shows "მონიშვნა ყველა ხაზზე: ..." (the existing stale-status pattern). Information only; the footer range line (round 29) makes the live state visible.',
    evidence: 'c-round-28.md sections 4 and 11',
  },
  {
    id: 'C-R28-INFO-NO-EDGE-FADES',
    severity: 'info',
    status: 'routed',
    to: 'SRW-18 (FB-06 fades)',
    note: 'cuts at range edges are hard (no automatic fade); Ableton applies short automatic fades. CZABA has no fade feature yet; SRW-18 covers fades. Not a round-28 defect.',
    evidence: 'c-round-28.md section 11',
  },
);

const lastRound = b.rounds[b.rounds.length - 1];
if (lastRound.round !== 28) {
  throw new Error('last round is not 28');
}
lastRound.status = 'c_fail';
lastRound.c_result = {
  report: 'c-round-28.md / c-round-28.json',
  taskStatus: 'FAIL',
  why_fail: 'C-R27-01 still open after the section 4.1 decision table; every SRW-24 ID PASS',
  passed: [
    'G28-1', 'G28-2', 'G28-3', 'R28-DA', 'R28-DB', 'R28-DV', 'R28-DM', 'R28-VL', 'R28-VD', 'R28-CX',
    'R28-UR', 'R28-PS', 'R28-TF', 'R28-UI', 'R28-K', 'R28-E', 'R28-R', 'R28-S', 'R28-U', 'R28-Doc',
    'R27-TL-restated', 'R27-K-1440', 'R27-L-floating-video', 'R27-TO-redo', 'R27-E-offline-nodes',
    'R27-R', 'R27-TI-video-floor',
  ],
  bugs: ['C-R27-01 (medium, row 3 by B)', 'C-R28-01 (low, new)', 'C-R28-02 (low, new)'],
  substitutions: [
    'R28-CX while-playing "export matches": checked by source start offsets, not tap-vs-export (labelled method substitution)',
  ],
  not_run: [
    'R9-C4 empty-clipboard refusal (clipboard already filled)',
    'R27-TL SFX run 1 frame re-score (no per-frame data saved in round 27)',
  ],
  vitest: '1119/1119',
  biome: '218 warnings + 1 info',
  git_status_lines: 66,
};
b.rounds.push({
  round: 29,
  task: 'current-task.md',
  items: [
    'C-R28-01: clipboard provenance (optional ArrangementClipboard flag) set by copyRangeToClipboard on an all-lane range and by cutTimeSelection for Cut Time; planClipboardPaste keeps original lanes when set',
    'C-R28-02: cutTimeSelection no-op (applyEdit false): no history, no playhead remap, range and selection kept, honest status containing "ბუფერი არ შეცვლილა"',
    'A-R28 review finding 4: footer arrangement-range line appends "· ყველა ხაზი" on an all-lane range',
    'doc 034: round-29 section, corrected Ableton rows (Ctrl+Shift+L and Delete Time exist in Live 12), D-25 amendment',
  ],
  status: 'dispatched',
  decision: 'D-29t',
  note: 'frozen: b-round-28-tree-sha256.txt (72 files = b-round-27 list + types/arrangement.ts, ArrangementLane.tsx, ArrangementTransport.tsx, ArrangementContext.test.ts, delete-selection.test.ts, delete-selection-ui.test.tsx; B verified 72 OK); snapshots b-round-28-snapshots/ (clipboard.ts fd24ad8e, ArrangementContext.tsx a391f59b, StudioWorkspace.tsx 8bf122dc, doc 034 9fd808bc); expected status 67 lines (66 + the new all-lane-clipboard.test.tsx)',
});

b.vitest_floor_round28 = 1119;
b.baseline_tree_at_round28 =
  'HEAD c5ed47b + 66 status lines (rounds 6-28), identical to c-round-28/gates/git-status-end.txt (copy b-round-28-git-status.txt); sha256 of 72 frozen files: b-round-28-tree-sha256.txt; 10 round-28 owned shas = c-round-28/gates/owned-sha-end.txt (B: 10 OK); plus the two foreign untracked agent files';

const planned = b.planned_rounds[b.planned_rounds.length - 1];
planned.round = '25-31';
planned.items = [
  '25: SRW-13 stage 1 Master Volume/Mute + export overload report (D-29p) - C PASS',
  '26: SRW-13 stage 2a live Master meter + latched Master Peak/Clip + R26-X (D-29q) - C PASS',
  '27: SRW-13 stage 2b per-track meters (D-29r) - C FAIL on the R27-RB cost oracle only (C-R27-01)',
  '28: SRW-24 delete keeps the gap / Ctrl+Shift+L / Ctrl+Shift+X only ripple (D-29s) - every SRW-24 ID C PASS; round FAIL on C-R27-01 (row 3 -> Tech Lead); new Low C-R28-01/02',
  '29: SRW-24 follow-up bug round (D-29t): C-R28-01 + C-R28-02 + footer all-lane state + doc 034 Ableton correction',
  '30: SRW-13 stage 3 FB-04 clip gain (R13-M1)',
  '31: SRW-13 stage 4 FB-05 pan + fader-click UX + round-9 M1/L8 + Master hold tick',
  'C-R23-01 goes first as soon as the Tech Lead answers (round 28: 2 NUL at 28013/28014, offsets moved again, not a fix)',
  'then SRW-14..20 in dependency order, R26-M1 hardening, SRW-21 adapter contract, full regression + root check, T12',
];

fs.writeFileSync(file, JSON.stringify(b, null, 2) + '\n', 'utf8');
console.log('backlog updated to version', b.version);
