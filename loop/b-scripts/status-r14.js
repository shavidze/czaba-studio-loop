const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 14) {
  throw new Error('expected backlog v14, got ' + b.version);
}
b.version = 15;
b.updated = '2026-10-10 (B: round 13 result -> round 14 dispatch)';
b.current_task = 'current-task.md (round 14: floating-video follow-ups C-R13-01..03, D-29e)';
b.advisor_used_by_B +=
  '; round 13 result (2026-10-10): available, called once after orientation and before writing (advice applied: CONTINUE; round 14 = C-R13-01..03 before polish 14a-c; check where the library preview renders before choosing the anchor; prototype has no return status; Export focus fix in ArrangementExportDialog only, Modal read-only; record A deviations in D-29d/e; real reduced-motion to Tech Lead)';

const s = b.items.find((i) => i.id === 'SRW-11B');
const st3 = s.stages.find((x) => x.stage === 3);
st3.status = 'acceptance_passed_bug_open';
st3.evidence_round13 = {
  result: 'C taskStatus PASS (c-round-13.md, c-round-13.json)',
  passed: ['R13-F1', 'R13-F2', 'R13-F3', 'R13-F4', 'R13-F5', 'R13-F6', 'R13-U', 'R13-Doc'],
  adjacent_passed: [
    'R12-W1-expanded-x1',
    'RF5-3-x1-H2-counters',
    'dock-sync-diff',
    'dock-quick-check',
    'R11A-1-quick',
    'RF7-P2',
    'G13-1',
    'G13-2',
    'G13-3',
  ],
  key_numbers:
    'expand 8,92 272x153 (1440) / 8,130 (1280); placeholder 160x90; dock 107 -> 107; drag +200/+100 exact, clamps 1168,747 and 0,0; arrows +48; resize re-clamp 1008,567; F5 3/3 valid (max |d| excl .0172/.0189/.0183, 0 counter change within 300 ms of 15 layout changes, same nodes every frame); R12-W1 expanded d300 +.0029/+.0060/+.0035, settles = swaps; export compact vs expanded maxDiff 0; vitest 914/914',
  blocked: [
    'real prefers-reduced-motion (gstack denies CDP Emulation.setEmulatedMedia; C simulated with inline transition-property none) -> Tech Lead',
    'fake-Bearer studio-token partial (backend 5199 down; route 500, no token)',
  ],
};
s.status = 'stage3_passed_bugs_open';
s.stages_status.stage3 =
  'all C IDs PASS (round 13); C-R13-01..03 Low -> round 14 (D-29e)';
s.stages_status.polish = 'not started (rounds 15-17, split into bounded sub-rounds)';
s.decisions.push(
  'D-29d (round 12 planning, round 13): floating video contract; see plan.md',
  'D-29e (round 13 result, round 14): placement inside the library body (bottom-anchored, never over header/search/separator/preview), return status texts, Export dialog focus; A round-13 deviations accepted; see plan.md',
);
s.polish_round.round = '15-17';
s.polish_round.note =
  'recorded, not dropped; shifted by one round because round 14 fixes C-R13-01..03 first (C bugs first)';
s.next_round_note =
  'round 14 = C-R13-01..03 (D-29e). Polish 14a/14b/14c follow in rounds 15/16/17; dock, video-sync and ArrangementLane stay frozen in round 14.';
s.open_bugs.push(
  {
    id: 'C-R13-01',
    severity: 'low',
    note_severity: 'C: Medium defensible against the find -> add flow',
    summary:
      'at the D-29d default placement (lib.left+8, lib.top+8) the floating box covers the library header and search: the search field (find -> add entry) is unreachable until the box is dragged; a real click on ◀ hits ✕ (not interactable)',
    evidence: 'c-round-13/runs/f4-collapse-occluded-1440.json, c-round-13/shots/collapse-occluded-1440.png, c-round-13.md §6',
    b_decision:
      'D-29e: place inside the library body region (tree+list, l.427), bottom-anchored: width = max(160, min(640, lib.width-16, (body.height-16)*16/9)), left = lib.left+8, top = max(body.top+8, body.bottom-8-h), then viewport clamp; never over header/◀, search, separator or preview bar',
    route: 'round 14',
    status: 'open',
  },
  {
    id: 'C-R13-02',
    severity: 'low',
    summary: 'the expand / temporary-opening status text stays after the video returns to compact (A L6)',
    evidence: 'c-round-13/shots/video-compact-after-1280.png, c-round-13/runs/f3-1440.txt, r11a1-1440.txt',
    b_decision:
      'D-29e: return texts verbatim: "ვიდეო პატარა ხედს დაუბრუნდა." and, when the library re-collapses, "ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა."; ◀ text unchanged; no new text on plain ▶/◀',
    route: 'round 14',
    status: 'open',
  },
  {
    id: 'C-R13-03',
    severity: 'low',
    summary:
      'the Export dialog does not take focus: with ✕ focused, opening Export and pressing Enter returns the video behind the open dialog',
    evidence: 'c-round-13/runs/export-focus-probe.txt',
    b_decision:
      'D-29e: ArrangementExportDialog moves focus to დახურვა on open, cycles Tab inside, restores focus on close; components/ui/Modal.tsx stays read-only (shared gap noted for root/UI owner)',
    route: 'round 14',
    status: 'open',
  },
);
s.recorded_followups.push(
  'round-13 A deviations accepted in D-29e: capture-phase Export mark; reduced-motion gate on transitionProperty + duration; fallback timer + transitioncancel',
  'round-13 R13-U guard 2 wording was B\'s error: the search-precedence test fails only with defaultPrevented removed (M2b), as C showed; round 13 PASS unchanged',
  'round-13 code-reviewer Lows accepted by A without code: viewport read twice in the arrow handler; arrows blocked during drag; one extra render at drag end; the ref keeps the last KeyboardEvent',
  'round-13: the ◀ focus-return test asserts only "not ⤢"; Safari focus-on-click unverified',
);

const r13 = b.rounds.find((r) => r.round === 13);
r13.status = 'c_pass';
r13.result =
  'C PASS: R13-F1..F6, R13-U, R13-Doc, adjacent (R12-W1 x1 expanded, RF5-3 x1, dock diff 0, dock quick, R11A-1, RF7-P2), G13-1..3; vitest 914/914. New Low: C-R13-01..03.';
r13.evidence = 'c-round-13.md, c-round-13.json';
b.rounds.push({
  round: 14,
  task: 'current-task.md',
  items: ['C-R13-01 placement inside the library body', 'C-R13-02 return status', 'C-R13-03 Export dialog focus'],
  status: 'dispatched',
  decision: 'D-29e',
  note: 'three closely related bugs (bounded workflow). Dock, video-sync and Modal frozen; no sync runs (same code path, coordinates only); adjacent quick checks R13-F2/F3/F4, R11A-1, dock quick, RF7-P2.',
});

const pr = b.planned_rounds;
const p14 = pr.find((r) => r.round === 14);
p14.items = ['C-R13-01..03 floating-video follow-ups (D-29e)'];
p14.note = 'C bugs first; polish 14a-c shifted to rounds 15-17';
const p13 = pr.find((r) => r.round === 13);
p13.note += ' Result: C PASS; C-R13-01..03 Low -> round 14.';
const msIndex = pr.findIndex((r) => r.milestone);
pr.splice(
  msIndex,
  0,
  { round: 15, items: ['panel polish 14a (C-R11-01..03, D-29c, A round-11 deviation 9)'] },
  { round: 16, items: ['panel polish 14b (detail panel: L11, L2-L7, design a-d)'] },
  {
    round: 17,
    items: ['panel polish 14c (context/preview: M1, M-R10-1/M2, L8)'],
    note: 'once the Tech Lead C-R8-01/C-R6-02 evidence frees those files or B schedules them',
  },
);

b.baseline_tree_at_round14 =
  'HEAD c5ed47b + 17 modified + 14 Studio untracked (round 6-13; adds floating-video.test.tsx and doc 022), identical to C round-13 end (c-round-13/gates/git-status-end.txt); sha256 of 42 files: b-round-13-tree-sha256.txt (equals A a-round-13 owned-final-sha256 8/8; adds ArrangementExportDialog.tsx and components/ui/Modal.tsx); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round14 = 914;

b.tech_lead_manual_checks.push({
  id: 'R13-RM',
  what: 'real prefers-reduced-motion: expand the floating video from a collapsed library; the box is placed on the next frame (no dead wait)',
  reason: 'gstack browse denies CDP Emulation.setEmulatedMedia; C round 13 simulated with inline transition-property none',
});

b.open_findings.push({
  id: 'shared-modal-no-focus-management',
  severity: 'low',
  status: 'root',
  note: 'components/ui/Modal.tsx (shared, read-only for the Studio loop) does not move focus into the dialog or trap Tab; round 14 fixes only ArrangementExportDialog (C-R13-03). Other Modal users are outside the Studio scope; root/UI owner decides.',
});

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
