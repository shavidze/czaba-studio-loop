const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 18) {
  throw new Error('expected backlog v18, got ' + b.version);
}
fs.writeFileSync(dir + 'b-scripts/backlog.before-r18.json', JSON.stringify(b, null, 2) + '\n');
b.version = 19;
b.updated = '2026-10-11 (B: round 17 result -> round 18 dispatch)';
b.current_task =
  'current-task.md (round 18: panel polish 14b in ArrangementDetailPanel.tsx - L4 input reset only on on-clip range change, L11 wheel on a focused range input, design (b) range overlay alpha, L6 biome-ignore reason text, design (d) Georgian detail labels; D-29i)';
b.advisor_used_by_B +=
  '; round 17 result (2026-10-11): available, called once after orientation and before writing (advice applied: close C-R16-01 and M-R10-1/M2 only on C evidence; L4 has no user path today, so its acceptance is a component test plus mutation; L11 asserts defaultPrevented on a cancelable WheelEvent, not a jsdom value; design (b) is checked as computed background alpha <= 0.5; design (d) gets a pre-code width measurement with a fixed fallback order; C wording notes on R17-P1.1 and R17-P2.3 recorded as B wording errors; vitest floor 983; 48-file sha reference)';

const s = b.items.find((i) => i.id === 'SRW-11B');
const bug = s.open_bugs.find((x) => x.id === 'C-R16-01');
if (!bug) {
  throw new Error('missing C-R16-01');
}
bug.status = 'closed';
bug.closed_round = 17;
bug.closed_evidence =
  'c-round-17.md §2-§3, c-round-17.json passed R17-P1 and R17-P2: active-lane <p> 32 px (2 x line-height 16) and preview 167 in every lane state at library 288/384/480 on 1440x900 and 1280x720; body delta 0 across SFX/music/stems/video while expanded; box unchanged; 0 preview top-12 px samples in the box at 1440/288, 1280/480 and 1280/288 (round-16 repro was 136/216): c-round-17/runs/p1-1440x900.txt, p1-1280x720.txt, p1-1280x720-stems-fill.txt, p2-1440x900-288.txt, p2-1280x720-480.txt, p2-1280x720-288.txt, shots/c-r16-01-repro-fixed-1440-288.png. Disclosed D-29h price verified cell for cell: +16 px preview in states that fit one line (body bottom 680 -> 664 at 1440, 500 -> 484 at 1280)';

s.recorded_followups.push(
  'DONE round 17 (C PASS): round-9 reviewer M-R10-1/M2 - LibraryPlayheadText wrapped in memo with the inner name kept; C R17-M: library playhead node isSameNode and text stays at the stopped transport time over a 3 s library preview while the preview cursor advances, and follows arrangement Play (c-round-17/runs/p3m-1440-288.txt); C guard G3 (direct render -> memo test fails 12 vs 0) and G4 (inner rename -> frozen render-budget R9-L1 fails) in c-round-17/gates/guard-c17.txt',
  'round-17 A deviations 1 and 2 are B wording errors (C confirmed): R17-P1.1 round(scrollHeight/line-height) is structurally 2 under a fixed two-line height, so content lines are counted with rangeLines (distinct Range.getClientRects tops) or a page-state unclamp; R17-P2.3 "all 216 points" cannot hold because the x = 284 column hits the library separator (as in round 16); the correct wording is "0 samples in the box, the rest hit the preview or the separator"',
  'round-17 A deviation 3 (C confirmed, c-round-17/runs/cdp-probe.txt): gstack browse denies CDP Input.dispatchMouseEvent; from round 18 a "real click" means $B click at the element centre, and coordinate clicks inside an element are synthetic with buttons: 1',
  'round-17 A deviation 4 (root): A ran taskkill //F //IM python.exe and killed 2 python processes (one its own hung command, one unknown); recorded loop/terminal PIDs still ran; root to confirm no needed helper (e.g. watch-context.py) was killed. Not verified by C',
  'round-17 A deviation 5: the "—" active-lane state is not reachable in the browser; covered only by library-preview.test.tsx test 3',
  'round-17 C incident (recorded): a Git Bash ln -s node_modules in c-round-17/guard created a 547 MB copy instead of a link; C ran its guard there and deleted the copy; store node_modules intact (618 entries)',
  'round-17 C note for the Tech Lead R17-T: if real Windows Georgian fonts need a third line, line-clamp-2 hides the " · playhead" time (C forced-overflow shot c-round-17/shots/forced-overflow-1440-288.png)',
  'round-18 decision (D-29i): A round-11 follow-up "Home on separators triggers the global seek" is not in round 18 (14b already holds five items); it goes to the milestone-regression fix round together with the other A round-11 follow-ups (aria-controls on the lane fold button, ring-inset on the track name, panel found through nextElementSibling), recorded not dropped',
  'round-18 decision (D-29i): the lane clip range overlay in ArrangementClip.tsx l.589 keeps bg-foreground/60 this round (file frozen); the detail overlay moves to bg-foreground/30. The lane/detail difference is recorded and aligned when ArrangementClip.tsx is next owned (SRW-14 snap or SRW-18 fades) or earlier if C or design files a bug',
);

const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round17 = {
  result: 'C taskStatus PASS (c-round-17.md, c-round-17.json), no new bug',
  passed: ['R17-P1', 'R17-P2', 'R17-P3', 'R17-M', 'R17-U', 'R17-Doc'],
  adjacent_passed: [
    'R16-F2-quick',
    'R16-F3-quick',
    'R15-P2-quick',
    'R13-F3-quick',
    'R16-F1-quick',
    'R11A-1-quick',
    'dock-quick',
    'RF7-P2',
    'G17-1',
    'G17-2',
    'G17-3',
  ],
  key_numbers:
    'preview 167 and active-lane row 32 everywhere; 1440 body 233-664 (288) / 217-664 (384, 480); 1280 body 271-484 (288) / 255-484 (384, 480); D-29f boxes 1440/288 8,503 272x153 (inset 169), 1280/480 8,361.5 203.55x114.48 (inset 130.5), 1280/288 8,369.5 189.33x106.48 (inset 122.5), 1440/480 8,432.5 397.33x223.48 (inset 239.5); find -> add = one Undo entry; library preview master RMS -14.9 dBFS, silent after stop; vitest 983/983; real WAV 864000 frames = 18.000 s (1802 samples at FS = known R13-M4 carry)',
};
s.stages_status.stage3 =
  'all C IDs PASS (rounds 13-17); C-R13-01..03 closed (round 14); C-R14-01/02 closed (round 15); C-R15-01 accepted (D-29g); C-R15-02/03 closed (round 16); C-R16-01 closed (round 17)';
s.stages_status.polish =
  'round 16 = 14a C PASS; round 17 = C-R16-01 + M-R10-1/M2 C PASS (both closed); round 18 = 14b detail panel (L4, L11, design b, L6 text, design d labels; D-29i); M1 and L8 wait for the Tech Lead C-R8-01/C-R6-02 run or ride with SRW-13; remaining A round-11 follow-ups go to the milestone fix round';
s.decisions.push(
  'D-29i (round 17 result, round 18): C-R16-01 and M-R10-1/M2 closed by C; A round-17 deviations 1-2 are B wording errors (rangeLines; "0 in the box, rest preview or separator"), 3 = "real click" means $B click at element centre, 4 to root, 5 test-only; round 18 = 14b in ArrangementDetailPanel.tsx: L4 inputs reset only when the on-clip range bounds or the clip bounds change (no user path today, component test plus mutation), L11 one native non-passive wheel listener on the detail content that prevents default only for a focused number input (real wheel stays Tech Lead R18-W), design (b) detail overlay bg-foreground/30 (computed alpha <= 0.5; lane overlay in frozen ArrangementClip.tsx stays /60, recorded), L6 biome-ignore reason text without process references, design (d) Georgian labels დასაწყისი / სიგრძე / წყაროდან and input labels საიდან, წმ / სადამდე, წმ (aria-labels, test ids, footer verbatim), with a pre-code width measurement and a fixed fallback order; see plan.md',
);
s.polish_round.note =
  'recorded, not dropped; round 16 (14a) C PASS; round 17 (C-R16-01 + M-R10-1/M2) C PASS; round 18 (14b) dispatched';
s.next_round_note =
  'round 18 = panel polish 14b, only ArrangementDetailPanel.tsx plus a new detail-panel-polish.test.tsx, doc 026 status lines and new doc 027; everything else frozen against b-round-17-tree-sha256.txt (48 files), including detail-panel.test.tsx, render-budget.test.tsx, track-layout.test.tsx, StudioWorkspace.tsx and ArrangementClip.tsx. After round 18: the milestone full regression.';

const r17 = b.rounds.find((r) => r.round === 17);
r17.status = 'c_pass';
r17.result =
  'C taskStatus PASS: R17-P1, R17-P2, R17-P3, R17-M, R17-U, R17-Doc; adjacent R16-F2/F3/F1 quick, R15-P2 quick, R13-F3 quick, R11A-1 quick, dock quick, RF7-P2; G17-1..3; vitest 983/983. Closed C-R16-01 and round-9 reviewer M-R10-1/M2. No new bug. Two wording notes (R17-P1.1 metric, R17-P2.3 separator column) recorded as B wording errors.';
r17.evidence = 'c-round-17.md, c-round-17.json';
b.rounds.push({
  round: 18,
  task: 'current-task.md',
  items: [
    'L4: detail start/end inputs keep typed text unless the on-clip range bounds or the clip bounds change',
    'L11: a wheel event over a focused detail range input does not change its value (default prevented only while focused)',
    'design (b): the detail range overlay no longer hides the waveform (bg-foreground/30, computed alpha <= 0.5)',
    'L6: the biome-ignore reason text names the technical reason, not a process reference',
    'design (d): Georgian detail labels per the prototype (დასაწყისი, სიგრძე, წყაროდან; inputs საიდან, წმ / სადამდე, წმ); footer verbatim',
  ],
  status: 'dispatched',
  decision: 'D-29i',
  note: 'Only ArrangementDetailPanel.tsx, a new detail-panel-polish.test.tsx, doc 026 status lines and new doc 027. R9-D3 hunks (playhead element and writer, SVG, waveform box classes) byte-identical; every other file frozen; no sync runs.',
});

const pr = b.planned_rounds;
const p17 = pr.find((r) => r.round === 17);
p17.note += ' Result: C PASS; C-R16-01 and M-R10-1/M2 closed.';
const p18 = pr.find((r) => r.round === 18);
p18.note =
  'dispatched 2026-10-11 (D-29i). M1/L8 (context part of 14c) after the Tech Lead C-R8-01/C-R6-02 run, at the latest with SRW-13. Remaining A round-11 follow-ups go to the milestone fix round.';

b.tech_lead_manual_checks.push(
  {
    id: 'R17-T',
    what: 'library preview two-line active-lane row with real Windows Georgian fonts at library 288 and 480: text fits two lines or ends with an ellipsis, title complete; if a third line is needed the " · playhead" time is hidden (C forced-overflow shot)',
    reason: 'headless font metrics may differ',
  },
  {
    id: 'R18-W',
    what: 'real mouse wheel over a focused detail start/end input does not change its value; over an unfocused input and over the detail waveform the content scrolls as before',
    reason: 'gstack has no wheel input; jsdom never changes a number input on wheel',
  },
);

for (const f of b.open_findings) {
  if (f.id === 'dirty-tree-exposure') {
    f.note =
      'No commit since c5ed47b; the Studio work of rounds 6-17 (18 M + 20 untracked incl. library-preview.test.tsx and doc 026) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
  }
}
b.open_findings.push({
  id: 'a-r17-dev-4-python-kill',
  status: 'root',
  note: 'A round 17 killed two python.exe processes (one unknown PID); recorded orchestrator PIDs still ran. Root confirms no needed helper was killed. C did not verify.',
});

b.baseline_tree_at_round18 =
  'HEAD c5ed47b + 18 modified + 20 Studio untracked (rounds 6-17; round 17 adds library-preview.test.tsx and doc 026), identical to C round-17 end (c-round-17/gates/git-status-end.txt); sha256 of 48 files: b-round-17-tree-sha256.txt (46 round-16 entries re-hashed + library-preview.test.tsx + doc 026; exactly ArrangementLibraryPreview.tsx and doc 025 differ from b-round-16-tree-sha256.txt, as C G17-2 found, and their hashes equal c-round-17/gates/owned-sha.txt); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round18 = 983;

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
