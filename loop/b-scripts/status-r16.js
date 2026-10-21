const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 16) {
  throw new Error('expected backlog v16, got ' + b.version);
}
b.version = 17;
b.updated = '2026-10-11 (B: round 15 result -> round 16 dispatch)';
b.current_task =
  'current-task.md (round 16: panel polish 14a = C-R11-01..03 + A round-11 deviation 9, with C-R15-02 under D-29c(2) and the C-R15-03 test; D-29g)';
b.advisor_used_by_B +=
  '; round 15 result (2026-10-11): available, called once after orientation and before writing (advice applied: C-R15-01 accepted as a B criterion error like D-19b, recorded as D-29g, no code; C-R14-01/02 closed on C R15-P1/P2/E PASS while round 15 taskStatus FAIL stays recorded; C-R15-02 folded into D-29c(2) as an added acceptance, no re-placement mechanism, the ResizeObserver/polling ban kept; C-R15-03 one test with C G6 as guard; round 16 = polish 14a + those; pre-code footer measurement with stop-and-report; doc 024 status + doc 025)';

const s = b.items.find((i) => i.id === 'SRW-11B');
for (const id of ['C-R14-01', 'C-R14-02']) {
  const bug = s.open_bugs.find((x) => x.id === id);
  bug.status = 'closed';
  bug.closed_round = 15;
  bug.closed_evidence =
    id === 'C-R14-01'
      ? 'c-round-15.md §3-§4, c-round-15.json passed R15-P1 (4 cases + temporary opening, delta <= 0.02, box <= body/2, hit-tests 4/4) and R15-P2 (1280/480 real click on the soft row -> 1 clip, 1 Undo; 1440/288 last rows at max scroll; 9/9 list + 9/9 tree reachable in all 4 cases; ArrowDown walk above the box): the round-14 repro no longer reproduces'
      : 'c-round-15.md §6, c-round-15.json passed R15-E (exact X repro stays inside the dialog, Tab x8 / Shift+Tab x8 all inside, X paths, E1/E3/E4/E5, 656 mid-render samples 0 outside): the round-14 repro no longer reproduces';
}
for (const id of ['C-R11-01', 'C-R11-02', 'C-R11-03']) {
  const bug = s.open_bugs.find((x) => x.id === id);
  bug.route = 'round 16 (polish 14a)';
}
s.open_bugs.find((x) => x.id === 'C-R11-02').covers = ['C-R15-02'];
s.open_bugs.push(
  {
    id: 'C-R15-01',
    severity: 'low',
    summary:
      'after an in-place return (close button, Esc) the tree nav and the listbox keep an empty style="" attribute; computed padding-bottom is back to 4 px, scroll-padding-bottom auto, scrollHeight equal to the pre-expand value, texts verbatim; after collapse then expand the attribute is absent',
    evidence: 'c-round-15/runs/p3-1440-288.txt, p3-1280-480.txt, f2-arrows-resize-1440-480.txt; c-round-15.md §5; a-round-15.md §8.1',
    b_decision:
      'D-29g: accepted, code unchanged. B criterion error (same class as D-19b): the D-29f intent was "no inset declarations; layout equal to round 14". React leaves an empty attribute when a style prop goes from an object to undefined, the dock box already does the same under the accepted R13-F3, and a key remount would lose list scroll and focus. R15-P3 is read as "no inline style declarations (attribute absent or empty, style.cssText === \'\')"; C measured exactly that. C re-runs R15-P3 quick in round 16 because StudioWorkspace is touched again.',
    status: 'accepted',
  },
  {
    id: 'C-R15-02',
    severity: 'low',
    summary:
      'at 1280x720 with library 480 the box is placed inside the body with no clip selected; the find -> add flow then selects the new clip, the footer gains the selected-clip line (+20 px), the body shrinks to 255-500 and the box (bottom 512) overlaps the top 12 px of the preview strip; no preview control covered, all rows reachable; same mechanism in round 14',
    evidence:
      'c-round-15/runs/selection-footer-1280-480.txt, shots/selection-footer-box-over-preview-1280-480.png, runs/p3-1280-480-attempt1-started-expanded.txt; c-round-15.md §4',
    b_decision:
      'D-29g: same root cause as C-R11-02 (selection changes the footer height). Fixed by D-29c(2) (the footer always reserves the selected-clip line), not by re-placing the box: no ResizeObserver, polling or re-anchor (a new anchor would reset a user drag in the frozen dock). D-29d rule kept: layout changes after placement do not move an expanded box; only a window resize re-clamps it. Round 16 acceptance R16-F3 covers the exact C-R15-02 flow.',
    route: 'round 16 (with C-R11-02)',
    status: 'open',
  },
  {
    id: 'C-R15-03',
    severity: 'low',
    summary:
      'test-strength gap: C mutation G6 (the Export content Tab handler also handles Enter) keeps 116/116 green, because the only-Tab test presses Enter only on the X, the first control, where the mutated handler is a no-op',
    evidence: 'c-round-15/gates/guard-c15.txt (G6), c-round-15/guard/mut.cjs; c-round-15.md §7',
    b_decision:
      'round 16: one added test in export-dialog-focus.test.tsx (Enter and Space on the last enabled control, WAV export, are not prevented and do not move focus); C G6 must fail it. No product change.',
    route: 'round 16',
    status: 'open',
  },
);
const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round15 = {
  result:
    'C taskStatus FAIL only on the literal R15-P3 sub-check "no inline style attribute" (C-R15-01, accepted by B as D-29g); every other R15 ID PASS (c-round-15.md, c-round-15.json)',
  passed: ['R15-P1', 'R15-P2', 'R15-E', 'R15-U (with Low note C-R15-03)', 'R15-Doc'],
  r15_p3:
    'functional sub-checks PASS (padding 4 px, scroll-padding auto, scrollHeight = pre-expand, texts verbatim, collapse->expand no attribute, pending inset 0); literal attribute check FAIL -> D-29g re-reading; C re-checks R15-P3 quick in round 16',
  adjacent_passed: [
    'R13-F2-quick (from 8,450.5)',
    'R13-F3-quick',
    'R13-F4-quick (reduced motion simulated)',
    'R11A-1-quick',
    'dock-quick',
    'RF7-P2',
    'G15-1',
    'G15-2',
    'G15-3',
  ],
  key_numbers:
    'D-29f boxes 1440/288 8,523 272x153; 1440/480 8,450.5 429.33x241.48; 1280/288 8,379.5 207.11x116.48; 1280/480 8,379.5 235.55x132.48; inset 169/257.5/132.5/148.5 px; 160 minimum never reached; Export cycle WAV->X->radio->დახურვა; keyboard WAV RIFF PCM 2ch 48k 24-bit 288384 frames; vitest 965/965',
  blocked: ['real prefers-reduced-motion (CDP emulation denied) -> Tech Lead R13-RM'],
};
s.stages_status.stage3 =
  'all C IDs PASS (rounds 13-15); C-R13-01..03 closed (round 14); C-R14-01/02 closed (round 15); C-R15-01 accepted (D-29g); C-R15-02/03 Low -> round 16';
s.stages_status.polish = 'round 16 = 14a dispatched; 14b round 17; 14c round 18';
s.decisions.push(
  'D-29g (round 15 result, round 16): R15-P3 read as no inline style declarations (empty attribute accepted, C-R15-01); C-R15-02 folded into D-29c(2), no re-placement of the expanded box; C-R15-03 Enter-on-last-control test; footer reservation contract measured before code; see plan.md',
);
s.polish_round.note =
  'recorded, not dropped; 14a dispatched as round 16 together with C-R15-02 (same root cause as C-R11-02) and the C-R15-03 test';
s.next_round_note =
  'round 16 = polish 14a (C-R11-01..03, A round-11 deviation 9) + C-R15-02 under D-29c(2) + C-R15-03 test (D-29g). 14b/14c follow in rounds 17/18; dock, video-sync, Modal, ArrangementContext, ArrangementLibraryPreview stay sha-checked.';
s.recorded_followups.push(
  'round-15 A deviations accepted (C confirmed): inset component tests live in floating-video.test.tsx; helper name floatingVideoLibraryInsetPx kept against reviewer nit 4; E3 Space pressed on WAV (correct behaviour); E4 re-run kept with both logs; mechanism probe measured against the round-14 box',
  'round-15 code-reviewer notes recorded: focus on document.body escapes the Export trap (needs a document listener, banned; shared-Modal root note); the (h-16) term is dead for bodies >= 32 px (kept per spec); below a ~196 px body the 160 minimum makes the box taller than half the body (never reached)',
);

const r15 = b.rounds.find((r) => r.round === 15);
r15.status = 'c_fail_literal_p3';
r15.result =
  'C taskStatus FAIL only on the literal R15-P3 "no inline style attribute" sub-check (C-R15-01, accepted as D-29g). PASS: R15-P1, R15-P2, R15-E, R15-U, R15-Doc, adjacent R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2, G15-1..3; vitest 965/965. C-R14-01 and C-R14-02 closed. New Low: C-R15-01 (accepted), C-R15-02, C-R15-03.';
r15.evidence = 'c-round-15.md, c-round-15.json';
b.rounds.push({
  round: 16,
  task: 'current-task.md',
  items: [
    'C-R11-01 folded lane height handle has no pointer hit area (D-29c 1)',
    'C-R11-02 + C-R15-02 footer reserves the selected-clip line (D-29c 2, D-29g)',
    'C-R11-03 detail panel keeps its rendered height when auto-fit turns off under the cap (D-29c 3)',
    'A round-11 deviation 9: fold refused during a gesture writes GESTURE_EDIT_BLOCKED_MESSAGE',
    'C-R15-03 Enter/Space on the last Export control: test only',
  ],
  status: 'dispatched',
  decision: 'D-29c, D-29g',
  note: 'polish 14a (three closely related track-layout bugs plus the recorded deviation) with the round-15 Low follow-ups that share its root cause or are test-only. Dock, video-sync, Modal, ArrangementContext, ArrangementLibraryPreview frozen; no sync runs; adjacent quick checks R15-P3, R15-P1 (1280/480), R11-P1/P2 track layout, R9-D3 static, R14-E quick.',
});

const pr = b.planned_rounds;
const p15 = pr.find((r) => r.round === 15);
p15.note +=
  ' Result: C FAIL only on the literal R15-P3 attribute check (C-R15-01 accepted, D-29g); C-R14-01/02 closed; C-R15-02/03 -> round 16 with 14a.';
const p16 = pr.find((r) => r.round === 16);
p16.items = [
  'panel polish 14a (C-R11-01..03, D-29c, A round-11 deviation 9) + C-R15-02 (via D-29c 2) + C-R15-03 test (D-29g)',
];
p16.note = 'dispatched 2026-10-11';

b.baseline_tree_at_round16 =
  'HEAD c5ed47b + 18 modified + 17 Studio untracked (round 6-15; round 15 adds doc 024), identical to C round-15 end (c-round-15/gates/git-status-end.txt); sha256 of 45 files: b-round-15-tree-sha256.txt (equals A a-round-15 owned-final-sha256 9/9); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round16 = 965;

const modal = b.open_findings.find((x) => x.id === 'shared-modal-no-focus-management');
modal.note +=
  ' Round 15: the Studio Export Tab cycle now covers the Modal X (C R15-E PASS). Known limit recorded in doc 024 (A reviewer note 3): focus on document.body (e.g. after a scrollbar click) escapes the trap; closing it needs a document listener, which belongs to the shared Modal owner.';
const dirty = b.open_findings.find((x) => x.id === 'dirty-tree-exposure');
dirty.note =
  'No commit since c5ed47b; the Studio work of rounds 6-15 (18 M + 17 untracked) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
const dev9 = b.open_findings.find((x) => x.id === 'a-r11-dev-9-fold-during-gesture');
if (dev9) {
  dev9.route = 'round 16 (polish 14a)';
}

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
