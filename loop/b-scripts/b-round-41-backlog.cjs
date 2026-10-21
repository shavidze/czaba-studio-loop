const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(b.version === 43, 'version 43 expected, got ' + b.version);
b.version = 44;
b.updated = '2026-10-14 (B: round 41 result -> round 42 dispatch, D-29z7)';
b.current_task = 'current-task.md (round 42: SRW-13 stage 4b-2 group 2 - Lane Pan: a keydown on the Pan slider clears the blur suppression (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK); the Lane Pan drag bookkeeping (draft, cleanup ref, pointer ref) also ends on window blur (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES); ArrangementLane.tsx + new pan-release-recovery.test.tsx + new doc 039; D-29z7)';
b.advisor_used_by_B += '; round 41 (2026-10-14, restarted session): available, called once before writing (advice applied: round 42 = Pan group, C-R41-01 stays open Low outside the user-named viewports with a Tech Lead question and a pre-specified hypothesis, not its own round; verify HEAD/shas/backups/frozen list before writing; read the Pan source first; close C-R40-01 and DOC038-STALE-LINES on C evidence; record the C-R23-01 improvement; Google Fonts to the G-3 allowed list); second call after writing (see b-round-41.md)';
b.vitest_floor_round42 = 1325;
b.vitest_expected_round42 = '1325 + the new it count of pan-release-recovery.test.tsx (B expects 8); every existing suite unchanged (fader-guards 71, fader-click 26, gesture-guard 19 included)';
b.baseline_tree_at_round42 = 'HEAD ea35611 (root round-41 checkpoint, both master remotes, publication-checkpoint.json round41Checkpoint), git status empty (the 17 .codex/agents/*.toml tracked since 54922e6); round-41 files at C shas (ArrangementDetailPanel 61834b2a, doc 038 cf894ea3, detail-panel-reason.test b919643f); frozen b-round-41-tree-sha256.txt (386 = 384 - ArrangementLane.tsx + the 3 round-41 files); snapshot b-round-41-snapshots/ArrangementLane.tsx 7de5a093; B gates b-round-41/gates.txt (tsc 0, vitest 73/1325, protected 4/4, /studio-lab 200)';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 42 -StartPhase A and a higher limit';

const lastRound = b.rounds[b.rounds.length - 1];
must(lastRound.round === 41, 'last round 41');
lastRound.status = 'C PASS';
lastRound.result = 'c-round-41.md / c-round-41.json: PASS G41-1 (idle re-run: verify exit 0, 73 files, 1325/1325; the loaded first run timed out under Defender load, both reported), G41-2 (HEAD 54922e6, 384 OK, protected 4/4), G41-3 (anonymous direct + header link; 0 token/recording/download/R2; Authorization 0; token 401; fake Bearer 500 without token; /studio/middle-east Sign in required), R41-S, R41-U (old source RF1/RF2/RF5 red; mutations a-h each caught), R41-Doc, R41-RV (6/6: 1440, 1280 incl. panel 122, the 120 px minimum, RV-SWITCH), R41-SB (gutter 10, scrollbar-gutter stable, 15 rules; columns 288/490/176/128 at 1440, 288/330/176/128 at 1280), R41-NONE, R41-PM, R41-MN-1..4, R41-K. Closed C-R40-01, DOC038-STALE-LINES. New C-R41-01 (low, 1024x768, outside the mandatory viewports). Root checkpoint ea35611 (both remotes).';
b.rounds.push({
  round: 42,
  task: 'current-task.md',
  items: ['SRW-13 4b-2 group 2: A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK (keydown on Pan clears the blur suppression), A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Lane Pan bookkeeping ends on window blur)'],
  status: 'dispatched',
  decision: 'D-29z7',
  note: 'baseline HEAD ea35611 clean; frozen b-round-41-tree-sha256.txt (386); snapshot b-round-41-snapshots/ArrangementLane.tsx 7de5a093',
  c_ids: ['R42-PK', 'R42-RW', 'R42-REG', 'R42-S', 'R42-U', 'R42-Doc', 'G42-1', 'G42-2', 'G42-3'],
  owned: [
    'app/components/arrangement/ArrangementLane.tsx (Pan onKeyDown clears the blur suppression; window blur listener in beginPanPointerDrag)',
    'app/lib/arrangement/__tests__/pan-release-recovery.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md (new)',
  ],
});

const findings = b.open_findings;
const byId = (id) => findings.find((x) => x.id === id);
const close = (id, text) => { const f = byId(id); must(f, id); f.status = 'closed'; f.closed = text; };
close('C-R40-01', 'round 41: C R41-RV PASS 6/6 (c-round-41.md section 4.1): every reason visible at scrollTop 0 at 1440 and 1280, default height and the 120 px minimum (video 1 line at 1440 / 2 lines at 1280; group range 1 line + Clip Gain 1-2 lines); R41-SB stable 10 px gutter with the Studio scrollbar classes; R41-NONE 0 px clipped at default heights');
close('DOC038-STALE-LINES', 'round 41: C R41-Doc PASS (c-round-41.md section 5): status line, l.45 round-40 truth, current TODO');
for (const id of ['A-R32-REVIEW-1', 'CP-R37-PAN-KEY-LOCK', 'A-R31-REVIEW-2', 'CP-R37-DRAG-ENTRIES']) {
  const f = byId(id);
  must(f, id);
  f.status = 'dispatched';
  f.to = 'round 42 (D-29z7), SRW-13 stage 4b-2 group 2';
}
for (const id of ['FADER-KEY-ENTRIES', 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL', 'A-R33-REVIEW-TOUCH']) {
  const f = byId(id);
  must(f, id);
  f.to = 'SRW-13 stage 4b-2 group 3 (round 43)';
}
must(!byId('C-R41-01'), 'C-R41-01 already present');
findings.push({
  id: 'C-R41-01',
  severity: 'low',
  status: 'open (Tech Lead viewport question TL-Q-VIEWPORT)',
  title: 'at 1024x768 (below the user-named 1280x720 / 1440x900 viewports) the middle/waveform box shrinks to min-w-32 (128 px): the video Clip Gain reason wraps to 4 lines and the centred placeholder+reason stack is clipped 4.5 px top and bottom in the overflow-hidden waveform box with no scroll; the group Clip Gain reason is 4 lines, 28 px below the visible content (scrollable)',
  evidence: 'c-round-41.md section 9; c-round-41/runs/narrow-1024.txt; shots/narrow-grp-1024.png; a-round-41.md A-R41-REVIEW-NARROW; checkpoint-r41-review.md Low 2',
  note: 'introduced at that width by round 41 (the old column placement was scrollable); text stays reachable through title and aria-describedby; not a round-41 FAIL (C). B does not widen the viewport matrix on its own (D-29z7): if the Tech Lead puts widths below 1280 in scope, it is scheduled before 4b-2 group 3',
  candidate_hypothesis: 'video layer: justify-center-safe (Tailwind 4.1.18 present) + overflow-y-auto + STUDIO_SCROLLBAR_CLASS on the absolute layer only (WAVEFORM_BOX_CLASS frozen); the content wheel handler only blocks the wheel on a focused number input, so a scrollable layer is not intercepted; the group state is already scrollable in the content scroller. Not verified.',
});
findings.push({
  id: 'ESC-DESELECT-NOTE',
  severity: 'info',
  status: 'recorded (not scheduled)',
  title: 'REAL Escape did not clear a group selection with focus on the ruler Playhead slider in C round 41; round 40 recorded sel 0 for the same sequence; no deselect handler in the arrangement workspace (only the old StudioContext / studio.$productId)',
  evidence: 'c-round-41.md section 0; c-round-41/runs/esc-record.txt',
  note: 'C: focus- or context-dependent harness note, not a bug; code outside the panel unchanged (384 OK)',
});
findings.push({
  id: 'R41-RECORDS',
  severity: 'info',
  status: 'recorded (not scheduled)',
  title: 'round-41 record-only items: SB-4 REAL Shift+Tab reaches the detail content scroller and REAL ArrowDown scrolls it; none-state column reasons at the 120 px minimum clipped 7 / 13 px while the info hint shows the same instruction (accepted by task 41 section 4.3); MN-4 the range overlay covers part of the video placeholder and reason, text readable',
  evidence: 'c-round-41.md sections 4.2, 4.3, 4.4; c-round-41.json recordedOnly',
});
const daemon = byId('ENV-BROWSE-DAEMON');
if (daemon) {
  daemon.round41 = 'recurred in A and C round 41 (slow starts, a hung promise poll, a restart timeout); Defender (MsMpEng ~172% CPU) made the C first gate run time out; idle re-run green';
}
const c23 = byId('C-R23-01');
if (c23) {
  c23.round41_record = 'C round 41: curl /studio-lab 64312 bytes, 3 NUL at 11729, 28025, 28026 (the 58745/58746 pair moved away with round-41 bytes); 1 hydrated U+FFFD aria-label (library collapse); still points to the dev SSR transport';
} else {
  console.log('WARN C-R23-01 finding not found');
}

const srw13 = b.items.find((x) => x.id === 'SRW-13');
must(srw13, 'SRW-13');
srw13.decisions_round42 = 'D-29z7: round 41 C PASS on every contracted ID; C-R40-01 and DOC038-STALE-LINES closed. C-R41-01 (low, 1024x768) open as a Tech Lead viewport question. Round 42 = 4b-2 group 2 (Pan, Lane only).';
const stage4b2 = (srw13.stages || []).find((st) => st.stage === '4b-2');
must(stage4b2 && Array.isArray(stage4b2.groups), '4b-2 groups');
for (const g of stage4b2.groups) {
  if (g.group === '1-reason') {
    g.status = 'done (C round 41 PASS); C-R41-01 (1024x768) open, Tech Lead viewport question';
  } else if (g.group === 2) {
    g.status = 'dispatched';
    g.decision = 'D-29z7';
  }
}

const tl = b.tech_lead_manual_checks || [];
if (!tl.some((x) => x.id === 'TL-Q-VIEWPORT')) {
  tl.push({ id: 'TL-Q-VIEWPORT', what: 'are Studio widths below 1280 px (e.g. 1024x768) in scope? If yes, C-R41-01 is scheduled before 4b-2 group 3 (candidate in b-round-41.md section 4)', why: 'the user named 1280x720 and 1440x900; C measured a Low clip at 1024x768 (C-R41-01)', status: 'open' });
}
const r31 = tl.find((x) => x.id === 'R31-T');
if (r31 && typeof r31.what === 'string' && !r31.what.includes('Alt+Tab')) {
  r31.what += '; from round 42 also: real mouse Pan drag, Alt+Tab while holding, release, return, ArrowRight moves Pan (D-29z7)';
} else if (!r31) {
  console.log('WARN R31-T not found');
}
if (Array.isArray(b.planned_rounds)) {
  b.planned_rounds.push({ round: 42, items: ['4b-2 group 2: Pan keydown clears the blur suppression; Lane Pan bookkeeping ends on window blur (D-29z7)'], note: 'C-R41-01 waits for TL-Q-VIEWPORT; group 3 round 43, group 4 round 44' });
}
fs.writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v44 written');
