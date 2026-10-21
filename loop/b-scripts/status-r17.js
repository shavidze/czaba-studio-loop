const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 17) {
  throw new Error('expected backlog v17, got ' + b.version);
}
fs.writeFileSync(
  'C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/backlog.before-r17.json',
  JSON.stringify(b, null, 2) + '\n',
);
b.version = 18;
b.updated = '2026-10-11 (B: round 16 result -> round 17 dispatch)';
b.current_task =
  'current-task.md (round 17: C-R16-01 preview active-lane line reserves two text lines + round-9 reviewer M-R10-1/M2 LibraryPlayheadText memo; both in ArrangementLibraryPreview.tsx; D-29h)';
b.advisor_used_by_B +=
  '; round 16 result (2026-10-11): available, called once after orientation and before writing (advice applied: close only the C-evidenced IDs; C bugs first, so round 17 = C-R16-01 + M-R10-1/M2 in the same preview file, which is not a sync target, and 14b moves to round 18; write the decision-only 14b items into D-29h; give C observable criteria only; record A deviation 5 as a B wording error; new 46-file sha reference checked on the live tree)';

const s = b.items.find((i) => i.id === 'SRW-11B');
const closed16 = {
  'C-R11-01':
    'c-round-16.md §3, c-round-16.json passed R16-L1 7/7 (folded handle computed pointer-events none, cursor auto; elementFromPoint at the bottom 3/2/1 px returns the clip or its trim edge, never the handle; synthetic trim on the folded clip = 1 Undo, row stays 36; pointerdown on the old handle rect does not unfold; real ArrowDown/ArrowUp unfold only; unfolded drag +20 unchanged; DragEvent drop at bottom -2 px adds exactly one clip): runs/l1-1440.txt, shots/folded-handle-1440.png',
  'C-R11-02':
    'c-round-16.md §4, c-round-16.json passed R16-F1 (footer 69, scroller, lanes, panel and library body delta 0 over none/select/deselect x2 at 1440x900 and 1280x720; lanes 61 (lane 60) and cap 142 constant at 1280; reserve aria-hidden U+00A0; long title truncated with title === text): runs/f1-1440x900.txt, f1-1280x720.txt, f1-extra-1280.txt, long-title-1280.json. Disclosed D-29g price: 1440 footer 49 -> 69 (+20 px permanent row), body 451 -> 431; 1280 no extra row',
  'C-R11-03':
    'c-round-16.md §6, c-round-16.json passed R16-H1 1-6 (1280 capped 142: first real ArrowDown on a lane handle keeps 142 over 100 rAF samples, 0 animations; window 1440 and back 142; collapse/reopen 142; separator drag +10 -> 152 (D-29b); 1440 control stays 144; detail playhead/writer/waveform hunks untouched): runs/h1-1280.txt, h1-control-1440.txt, cancel-restore-1280.txt, gates/detailpanel-hunks.txt',
  'C-R15-02':
    'c-round-16.md §5, c-round-16.json passed R16-F3 (1280x720 library 480, exact C-R15-02 flow: body 255-500 delta 0 across add+select and deselect, box unchanged, box bottom - (body.b - 8) = -0.02, 0/360 preview top-12 px samples return the box, one Undo) and R16-F2 (D-29f formula from the new body, delta <= 0.02, inset = h + 16, hit-tests 4/4): runs/f3-1280-480.txt, f2-1440-288.txt, shots/c-r15-02-flow-1280-480.png',
  'C-R15-03':
    'c-round-16.md §7, c-round-16.json passed R16-T1 (C G6 mutation M5 and the every-key variant M6 each fail exactly the new export-dialog-focus test; files restored, cmp identical): gates/guard-c16.txt',
};
for (const [id, ev] of Object.entries(closed16)) {
  const bug = s.open_bugs.find((x) => x.id === id);
  if (!bug) {
    throw new Error('missing bug ' + id);
  }
  bug.status = 'closed';
  bug.closed_round = 16;
  bug.closed_evidence = ev + '; the round-11/15 repro no longer reproduces';
}
s.open_bugs.push({
  id: 'C-R16-01',
  severity: 'low',
  summary:
    'with the video expanded, changing the active lane (SFX -> music) wraps the library preview line "აქტიური ხაზი: …" from one to two lines, so the library body shrinks 233-680 -> 233-664 at 1440/288; the box placed before (bottom 672) then covers the top 8 px of the preview strip (136/216 samples in the top 12 px); no control covered; footer stays 69; not a round-16 regression (same mechanism before)',
  evidence:
    'c-round-16/runs/active-lane-residual-1440-288.txt, c-round-16/shots/active-lane-residual-1440-288.png; confounder at 1280: c-round-16/runs/f1-extra-1280.txt (body 271-484 vs 271-500, footer 69); c-round-16.md §9',
  b_decision:
    'D-29h: fixed, not accepted as a price, because the fix is local and cheap. The preview active-lane line gets a fixed height of exactly two text lines (two-line clamp with ellipsis, full text in title), so the library body height no longer depends on the active lane name or the library width. No re-placement of the box (D-29d/D-29g rules unchanged). A measures every active-lane state at 288 and 480 before code and stops if any state needs more than two lines at 288. Price: +16 px permanent at widths where every state fits one line (disclosed in doc 026).',
  route: 'round 17 (with M-R10-1/M2, same file)',
  status: 'open',
});
const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round16 = {
  result: 'C taskStatus PASS (c-round-16.md, c-round-16.json)',
  passed: ['R16-L1', 'R16-F1', 'R16-F2', 'R16-F3', 'R16-H1', 'R16-G1', 'R16-T1', 'R16-U', 'R16-Doc'],
  adjacent_passed: [
    'R15-P3-quick (D-29g reading)',
    'R13-F2-quick',
    'R13-F3-quick',
    'R11-P2-quick',
    'R11-P2a-quick',
    'R14-E-quick',
    'R11A-1-quick',
    'dock-quick',
    'RF7-P2',
    'G16-1',
    'G16-2',
    'G16-3',
  ],
  key_numbers:
    'footer 69 constant at both viewports; 1440 scroller 496, lanes 81x4, panel 144, body 233-664; 1280 scroller 280, lanes 53/61/61/61, panel 142 (cap), body 271-484; D-29f boxes 1440/288 8,503 272x153 (inset 169), 1280/480 8,369.5 217.77x122.48 (inset 138.5); vitest 979/979; real export WAV 864000 frames = 18.000 s (peak 1.0, 1802 samples at FS = known R13-M4 carry)',
  residual_information:
    'D-29g residual: a range or >= 2 selected clips adds a +20 px footer row; at 1280/480 with the video expanded the box then covers 162/360 samples of the preview top 12 px, no control covered',
};
s.stages_status.stage3 =
  'all C IDs PASS (rounds 13-16); C-R13-01..03 closed (round 14); C-R14-01/02 closed (round 15); C-R15-01 accepted (D-29g); C-R15-02/03 closed (round 16); C-R16-01 Low -> round 17';
s.stages_status.stage2 =
  'all C IDs PASS (round 11); C-R11-01..03 closed in round 16 (polish 14a, C PASS); C-R11-04 accepted convention';
s.stages_status.polish =
  'round 16 = 14a C PASS (closed C-R11-01..03, deviation 9, C-R15-02/03); round 17 = C-R16-01 + M-R10-1/M2 (preview file, the 14c preview part); round 18 = 14b detail panel (L4, L11, design b, L6 text, design d labels); M1 and L8 (ArrangementContext / position-store) wait for the Tech Lead C-R8-01/C-R6-02 run or, at the latest, ride with SRW-13, which must open ArrangementContext anyway';
s.decisions.push(
  'D-29h (round 16 result, round 17): C-R16-01 fixed by a fixed two-line preview active-lane line (no re-placement); A round-16 deviations 1-4, 6, 7 accepted, deviation 5 is a B task-wording error (Esc never deselected clips; deselect = empty-lane click on the same lane); 14b decisions: design (a) footer line stays, (c) accepted, L2/L3 ride with C-R8-01, round-9 L5 (pointer capture) and L7 (6 px separator) accepted as in round 8, panel height in the workspace snapshot not now; order: C-R16-01 + M-R10-1/M2 in round 17, 14b in round 18; see plan.md',
);
s.polish_round.split =
  'bounded sub-rounds: 14a = C-R11-01..03 + deviation 9 (round 16, C PASS); preview part of 14c = C-R16-01 + M-R10-1/M2 (round 17, ArrangementLibraryPreview.tsx, not a sync target); 14b = detail panel L4, L11, design (b), L6 comment text, design (d) labels (round 18); decision-only (D-29h): design (a) keep, (c) accept, L2/L3 with C-R8-01, round-9 L5/L7 accepted; context part of 14c = M1 (ArrangementContext latch) and L8 (position-store message): after the Tech Lead run, at the latest with SRW-13; remaining A round-11 follow-ups (aria-controls on the lane fold button, Home on separators seeks, ring-inset on the track name, panel found through nextElementSibling) ride with round 18 when their files are owned or with the milestone regression';
s.polish_round.note =
  'recorded, not dropped; round 16 (14a) C PASS; round 17 dispatched with C-R16-01 + M-R10-1/M2';
s.next_round_note =
  'round 17 = C-R16-01 (two-line preview active-lane line) + M-R10-1/M2 (LibraryPlayheadText memo), only ArrangementLibraryPreview.tsx plus a new test file and doc 026; everything else frozen including render-budget.test.tsx (must stay green unchanged). Round 18 = 14b.';
s.recorded_followups.push(
  'round-16 A deviations accepted (C confirmed): folded pointerdown branch returns instead of being removed (robust against synthetic dispatch); the C-R11-03 restore on a cancelled lane drag (cap released for another reason behaves as before; C cancel-restore-1280.txt); the clamp also applies while the panel is collapsed (reopen equals the announced value); JSX &nbsp; (DOM U+00A0); range-only not reachable through the UI; coordinate CDP clicks blocked (synthetic lane-background clicks)',
  'round-16 deviation 5 is B wording: the task said deselect by "empty lane or Esc"; Esc never deselected clips (workspace Esc returns the expanded video, Ableton PNL-02/VID-06). Deselect = empty-lane click on the same lane (active-lane preview wrap confounder, C-R16-01)',
  'round-16 code-reviewer: pass 1 8/10 (M1 fixed by the restore; L1 kept with a pinning test; L2, L3 fixed), pass 2 9/10 (Low 1 fixed by clearing the clamp memory on both user resize paths; Low 2 test added); alternative "lift the panel height into the workspace snapshot" not done (cross-component state lift) - recorded, not scheduled unless a C bug needs it',
);

for (const f of b.open_findings) {
  if (f.id === 'a-r11-dev-9-fold-during-gesture') {
    f.status = 'closed';
    f.closed_round = 16;
    f.closed_evidence =
      'c-round-16.md §7, R16-G1 PASS: during a held clip drag, real Space on the focused fold button and a second-pointer synthetic click both leave the lane unfolded (81) and write GESTURE_EDIT_BLOCKED_MESSAGE verbatim; after pointerup one real click folds (runs/g1-1440.txt); guard M4 fails the deviation-9 test';
  }
  if (f.id === 'dirty-tree-exposure') {
    f.note =
      'No commit since c5ed47b; the Studio work of rounds 6-16 (18 M + 18 untracked incl. doc 025) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
  }
}

const r16 = b.rounds.find((r) => r.round === 16);
r16.status = 'c_pass';
r16.result =
  'C taskStatus PASS: R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc; adjacent R15-P3 quick (D-29g reading), R13-F2/F3 quick, R11-P2/P2a quick, R14-E quick, R11A-1 quick, dock quick, RF7-P2; G16-1..3; vitest 979/979. Closed C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 and A round-11 deviation 9. New Low: C-R16-01 (pre-existing mechanism, not a regression).';
r16.evidence = 'c-round-16.md, c-round-16.json';
b.rounds.push({
  round: 17,
  task: 'current-task.md',
  items: [
    'C-R16-01 the library preview active-lane line has a fixed two-line height, so the body no longer changes with the active lane (D-29h)',
    'round-9 reviewer M-R10-1/M2: LibraryPlayheadText does not re-render with the 20 Hz library preview cursor (memo, component name kept)',
  ],
  status: 'dispatched',
  decision: 'D-29h',
  note: 'C bugs first: one Low plus one reviewer Medium in the same preview file. Only ArrangementLibraryPreview.tsx, a new library-preview.test.tsx, doc 025 status lines and new doc 026. render-budget.test.tsx, dock, video-sync, ArrangementContext, StudioWorkspace, ArrangementLibrary, detail panel, Modal frozen; no sync runs.',
});

const pr = b.planned_rounds;
const p16 = pr.find((r) => r.round === 16);
p16.note += ' Result: C PASS; C-R11-01..03, C-R15-02/03, deviation 9 closed; C-R16-01 Low -> round 17.';
const p17 = pr.find((r) => r.round === 17);
p17.items = [
  'C-R16-01 (two-line preview active-lane line) + round-9 reviewer M-R10-1/M2 (LibraryPlayheadText memo), D-29h',
];
p17.note = 'dispatched 2026-10-11; C bugs first, 14b moved to round 18';
const p18 = pr.find((r) => r.round === 18);
p18.items = [
  'panel polish 14b (detail panel: L4 input reset on an unrelated range, L11 number-input wheel, design (b) range overlay must not hide the waveform, L6 biome-ignore reason text, design (d) detail labels in Georgian per the prototype, footer text verbatim)',
];
p18.note =
  'M1/L8 (context part of 14c) after the Tech Lead C-R8-01/C-R6-02 run, at the latest with SRW-13 (which must open ArrangementContext)';

b.baseline_tree_at_round17 =
  'HEAD c5ed47b + 18 modified + 18 Studio untracked (round 6-16; round 16 adds doc 025), identical to C round-16 end (c-round-16/gates/git-status-end.txt); sha256 of 46 files: b-round-16-tree-sha256.txt (45 round-15 entries re-hashed + doc 025; exactly the 7 A-owned round-16 files plus doc 025 differ from b-round-15-tree-sha256.txt, as C G16-2 found); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round17 = 979;

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
