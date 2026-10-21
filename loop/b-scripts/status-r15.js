const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 15) {
  throw new Error('expected backlog v15, got ' + b.version);
}
b.version = 16;
b.updated = '2026-10-10 (B: round 14 result -> round 15 dispatch)';
b.current_task = 'current-task.md (round 15: C-R14-01 + C-R14-02, D-29f)';
b.advisor_used_by_B +=
  '; round 14 result (2026-10-10): available, called once after orientation and before writing (advice applied: CONTINUE; round 15 = C-R14-01 + C-R14-02; half-body height cap AND real bottom padding on tree+list, each tied to the case it fixes; inset derived from the placed height in a pure helper; Tab cycle via the ref Modal forwards to its content div (contains X), not the backdrop; close C-R13-01..03 on C evidence; new tree reference; doc 023 status; plan §4/§5/§10 consistent)';

const s = b.items.find((i) => i.id === 'SRW-11B');
for (const id of ['C-R13-01', 'C-R13-02', 'C-R13-03']) {
  const bug = s.open_bugs.find((x) => x.id === id);
  bug.status = 'closed';
  bug.closed_round = 14;
  bug.closed_evidence =
    'c-round-14.md §1, §3-§6, c-round-14.json passed R14-P1/P2/S/E/U/Doc: the round-13 repro no longer reproduces';
}
for (const id of ['C-R11-01', 'C-R11-02', 'C-R11-03']) {
  const bug = s.open_bugs.find((x) => x.id === id);
  bug.status = 'open';
  bug.route = 'polish round 16 (14a)';
}
s.open_bugs.push(
  {
    id: 'C-R14-01',
    severity: 'medium',
    summary:
      'the D-29e box covers the bottom of the library body and the tree/list have no bottom padding, so covered rows never scroll above it: 1280x720 with library 480 covers 9/9 rows and 9/9 tree nodes at every scroll position, a real click on the "soft" result fails (not interactable); 1440/288 padi and melodia stay covered at max list scroll',
    evidence:
      'c-round-14/runs/p2-1280-480.txt, p2-1280-480-rows.json, p2-covered-rows-1440.json, p2-covered-rows-scrolled-1440.json, shots/expanded-1280-480.png, shots/p2-list-scrolled-max-1440.png; c-round-14.md §4',
    b_decision:
      "D-29f: (1) height cap: width = max(160, min(640, lib.width-16, (body.h-16)*16/9, (body.h/2)*16/9)), so at least half the body stays above the box (fixes 1280/480); (2) while the video is expanded the tree nav and the listbox get padding-bottom and scroll-padding-bottom = box height + 16 (pure helper floatingVideoLibraryInsetPx), so every row can scroll above the default box (fixes 1440/288 padi/melodia). B's formula error, not an A defect.",
    route: 'round 15',
    status: 'open',
  },
  {
    id: 'C-R14-02',
    severity: 'low',
    summary:
      'with focus on the Modal\'s own Close (X) button, Shift+Tab leaves the Export dialog and Enter then toggles the detail panel behind the open dialog (144 -> 36)',
    evidence: 'c-round-14/runs/e-modalx-1440.txt; c-round-14.md §6; a-round-14.md §8.1',
    b_decision:
      'D-29f: the Tab cycle moves from the children wrapper to the Modal content element (the ref Modal forwards; it contains X and the children) through a native keydown listener while open; X stays visible (no visible-control change); Modal.tsx stays read-only',
    route: 'round 15',
    status: 'open',
  },
);
const st3 = s.stages.find((x) => x.stage === 3);
st3.evidence_round14 = {
  result: 'C taskStatus PASS (c-round-14.md, c-round-14.json)',
  passed: ['R14-P1', 'R14-P2', 'R14-S', 'R14-E', 'R14-U', 'R14-Doc'],
  adjacent_passed: [
    'R13-F2-quick',
    'R13-F3-quick',
    'R13-F4-quick (reduced motion simulated)',
    'R11A-1-quick',
    'dock-quick',
    'RF7-P2',
    'G14-1',
    'G14-2',
    'G14-3',
  ],
  key_numbers:
    'D-29e box 8,523 272x153 (1440/288), 8,431 464x261 (1440/480), 8,343 272x153 (1280/288), 8,263 442.66x248.98 (1280/480), delta <= 0.02; hit-tests on ◀/search/separator/preview return the control in every case; degenerate 160 case never reached; Export Tab cycle WAV->radio->დახურვა wraps both ways; keyboard WAV RIFF PCM 2ch 48k 24-bit 288384 frames = project end; vitest 945/945',
  blocked: [
    'real prefers-reduced-motion (CDP emulation denied) -> Tech Lead R13-RM',
    'mid-render focus could not be sampled in the browser (render < 120 ms); covered by component test and A guard G7',
  ],
};
s.stages_status.stage3 =
  'all C IDs PASS (rounds 13-14); C-R13-01..03 closed (round 14); C-R14-01 Medium + C-R14-02 Low -> round 15 (D-29f)';
s.stages_status.polish = 'not started (rounds 16-18, bounded sub-rounds 14a/14b/14c)';
s.decisions.push(
  'D-29f (round 14 result, round 15): half-body height cap + bottom inset padding on tree/list while expanded; Export Tab cycle on the Modal content element so X is inside it; see plan.md',
);
s.polish_round.round = '16-18';
s.polish_round.note =
  'recorded, not dropped; shifted by one more round because round 15 fixes C-R14-01/02 first (C bugs first)';
s.next_round_note =
  'round 15 = C-R14-01 + C-R14-02 (D-29f). Polish 14a/14b/14c follow in rounds 16/17/18; dock, video-sync, Modal and the round-15 frozen set stay sha-checked.';
s.recorded_followups.push(
  'round-14 A deviations accepted: effect B + focusable wrapper keep focus inside during a WAV render (review H1); exported return-text constants; ⤢-as-return writes the compact text; no width rounding; E5 project length is the session project',
  'round-14: the outer describe title in floating-video.test.tsx still says D-29d (renaming would change every test name) - left as is',
  'round-14: the "no source selected" layout does not exist (ArrangementLibraryPreview always renders); the R14-P1 case is not applicable',
);

const r14 = b.rounds.find((r) => r.round === 14);
r14.status = 'c_pass';
r14.result =
  'C PASS: R14-P1/P2/S/E/U/Doc, adjacent R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2, G14-1..3; vitest 945/945. C-R13-01..03 closed. New: C-R14-01 (Medium), C-R14-02 (Low).';
r14.evidence = 'c-round-14.md, c-round-14.json';
b.rounds.push({
  round: 15,
  task: 'current-task.md',
  items: [
    'C-R14-01 library rows reachable while the video is expanded (half-body cap + bottom inset padding)',
    'C-R14-02 Modal X inside the Export Tab cycle',
  ],
  status: 'dispatched',
  decision: 'D-29f',
  note: 'two closely related bugs on the round-14 floating-video / Export focus work. Dock, video-sync, Modal frozen; no sync runs; adjacent quick checks R13-F2/F3/F4, R14-S, R14-E1/E4/E5, R11A-1, dock quick, RF7-P2.',
});

const pr = b.planned_rounds;
const p14 = pr.find((r) => r.round === 14);
p14.note += ' Result: C PASS; C-R13-01..03 closed; C-R14-01 (Medium) + C-R14-02 (Low) -> round 15.';
for (const r of pr) {
  if (typeof r.round === 'number' && r.round >= 15 && r.round <= 17) {
    r.round += 1;
  }
}
const idx15 = pr.findIndex((r) => r.round === 16);
pr.splice(idx15, 0, {
  round: 15,
  items: ['C-R14-01 + C-R14-02 (D-29f)'],
  note: 'C bugs first; polish 14a-c shifted to rounds 16-18',
});

b.baseline_tree_at_round15 =
  'HEAD c5ed47b + 18 modified + 16 Studio untracked (round 6-14; adds M ArrangementExportDialog.tsx, export-dialog-focus.test.tsx and doc 023), identical to C round-14 end (c-round-14/gates/git-status-end.txt); sha256 of 44 files: b-round-14-tree-sha256.txt (equals A a-round-14 owned-final-sha256 7/7); plus the foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round15 = 945;

const modal = b.open_findings.find((x) => x.id === 'shared-modal-no-focus-management');
modal.note +=
  ' Round 14 C-R14-02: the Modal X sits outside the dialog children; round 15 moves the Studio Export cycle to the Modal content element (forwarded ref). Other Modal users unchanged.';
const dirty = b.open_findings.find((x) => x.id === 'dirty-tree-exposure');
dirty.note =
  'No commit since c5ed47b; the Studio work of rounds 6-14 (18 M + 16 untracked) is uncommitted. Policy-correct (final commit/push by root after everything); named so root sees the growing exposure.';
b.open_findings.push({
  id: 'root-ga-scroll-consent-denied',
  severity: 'low',
  status: 'root',
  note: 'C round 14 (G14-3): with consent denied (gcs=G100, npa=1) root GA also sends a scroll event besides page_view. Root analytics, outside the Studio scope.',
});

fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v' + b.version);
