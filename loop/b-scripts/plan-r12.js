const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 12) {
  throw new Error(`expected backlog v12, found v${b.version}`);
}
const item = (id) => {
  const found = b.items.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

b.version = 13;
b.updated = '2026-10-10';
b.current_task = 'current-task.md (round 12: C-R7-01 under D-19a as amended in round-11 planning)';

const r11 = b.rounds.find((r) => r.round === 11);
if (!r11) throw new Error('missing rounds[11]');
Object.assign(r11, {
  task: 'tasks/round-11.md',
  status: 'verified',
  c_result:
    'PASS. Every round-11 acceptance ID, every adjacent regression and G11-1..3 passed on C evidence. 4 Low observations (C-R11-01..04), none breaking an acceptance ID. R3-V1 mode D x1 information only (raw .0131/.0212, cover 5.5 %, app LoAF 0), not a C-R8-01 verdict.',
  c_passed: [
    'R11-P2', 'R11-P2k', 'R11-P2a', 'R11-P4', 'R11-U', 'R11-Doc',
    'R11-P1b', 'R11-P1c-quick', 'R9-D3-quick', 'RF7-P2', 'R8-M1', 'R6-S2', 'R12-L3', 'R10-N8', 'R11A-3',
    'G11-1', 'G11-2', 'G11-3',
  ],
  c_bugs: ['C-R11-01 (Low)', 'C-R11-02 (Low)', 'C-R11-03 (Low)', 'C-R11-04 (Low)'],
  c_evidence: ['c-round-11.md', 'c-round-11.json', 'c-round-11/'],
  b_record: 'b-round-11.md',
  gates:
    'C re-ran: tsc 0; vitest 53 files 856/856 (812 + 44); biome owned 52 files 0, ./app 0 errors / 218 warnings; build ok; protected 4/4 OK; Header identical to HEAD (+21/-0 vs cc1e531); frozen: 8 OK vs a-round-10 start hashes, dock/video-sync/ruler/view cmp = round-10 backups, 27/27 OK vs a-round-11 frozen-start; detail playhead-writer region byte-identical; 1 ResizeObserver; anon /studio-lab: no studio-token/recording/download/R2/Authorization; anon studio-token 401; fake Bearer 500 no token (backend 5199 down, partial)',
});

const s11b = item('SRW-11B');
s11b.evidence_round11 = {
  stage: 2,
  result: 'all stage-2 acceptance IDs PASS on C evidence (c-round-11.md §2-§4)',
  passed: ['R11-P2', 'R11-P2k', 'R11-P2a', 'R11-P4', 'R11-U', 'R11-Doc'],
  key_numbers:
    'folded row 36 (35/35); SFX drag +60 -> 140, ArrowUp x3 -> 116, clamps 60/180, video 52/180; folded-vs-unfolded export maxDiff 1.192e-7; folded M mutes music to -240 dB; mixed-height cross-lane both ways, marquee and library drop exact; 1280 open panel 142 (selected clip) / 144 (none) = aria-valuenow, lanes 52/60/60/60 or 52/66/66/66, no vertical scroll; 1 lane render per changed height after transitionend; fold give-back 53/36/81/81; user override 142 + 60 = 202; auto-fit off survives resize 800/640; 1440 defaults 80',
  evidence: ['c-round-11.md', 'c-round-11/runs/', 'c-round-11/shots/fold-1440.png', 'c-round-11/shots/fold-1280.png', 'c-round-11/shots/panels-1280.png'],
  manual_remaining: 'R11-P3m real-mouse height-handle drag; real 10 px horizontal scrollbar in the visible-area formula (headless scrollbar is 0 px)',
};
s11b.stages_status = {
  stage1: 'all C IDs PASS; C-R8-01 open (Tech Lead quiet Chrome)',
  stage2: 'all C IDs PASS (round 11); C-R11-01..03 Low -> polish round 14; C-R11-04 accepted convention',
  stage3: 'not started (round 13; depends on SRW-03: C-R7-01 closed or Tech Lead quiet-Chrome accepted)',
  polish: 'not started (round 14, split into bounded sub-rounds)',
};
s11b.open_bugs = Array.isArray(s11b.open_bugs) ? s11b.open_bugs : [];
s11b.open_bugs.push(
  {
    id: 'C-R11-01',
    severity: 'low',
    summary: 'the 6 px height handle overlays the bottom of a 36 px folded row: any pointerdown there unfolds the lane and covers the folded clip trim edge bottom ~2 px; a drag on a folded handle only unfolds',
    evidence: 'c-round-11/runs/unfold-manual-1440.json',
    b_decision: 'D-29c (1): on a folded lane the handle has no pointer hit area (pointer-events none, no cursor), stays focusable, and ArrowUp/ArrowDown on it unfold only (as now). Unfold by pointer is the fold button. The folded clip trim edges therefore own the full row height. A drag never continues from a folded state, so the 36 -> 80 jump A described cannot occur.',
    route: 'polish round 14',
  },
  {
    id: 'C-R11-02',
    severity: 'low',
    summary: 'at 1280x720 with auto-fit, selecting/deselecting a clip toggles the footer selected-clip line (20 px) and lanes jump 60<->66, capped panel 142<->144, with no transition',
    evidence: 'c-round-11/runs/p2a-1280-open-selected.json, p2a-1280-open-noselect.json',
    b_decision: 'D-29c (2): the footer reserves the selected-clip line height while the workspace is mounted (empty line keeps its height, aria-hidden when empty) so selection does not change the scroller height; lanes and the cap stay constant across select/deselect. Footer text and ids unchanged.',
    route: 'polish round 14',
  },
  {
    id: 'C-R11-03',
    severity: 'low',
    summary: 'at 1280x720 with a capped panel (142), the first manual lane height change turns auto-fit and the cap off and the panel jumps to its stored 144',
    evidence: 'c-round-11/runs/p2a-1280-afoff-a.json',
    b_decision: 'D-29c (3): when auto-fit turns off while the cap is engaged, the panel keeps its rendered (capped) height: the stored open height becomes the rendered height (same no-jump rule as the D-29b user resize). The cap stays off afterwards.',
    route: 'polish round 14',
  },
  {
    id: 'C-R11-04',
    severity: 'low',
    summary: 'folded handle aria-valuenow is the stored open height (80/90) while the row is 36; aria-valuetext says დაკეცილია · {h} px',
    evidence: 'c-round-11/runs/unfold-manual-1440.json',
    b_decision: 'accepted convention (D-29c (4)): same as the detail separator contract N2: aria-valuenow is the height the lane opens at, aria-valuetext states the folded state. No code change.',
    status: 'accepted',
  },
);
s11b.polish_round = {
  round: 14,
  items: [
    'C-R11-01 (D-29c 1: folded handle has no pointer hit area)',
    'C-R11-02 (D-29c 2: footer reserves the selected-clip line)',
    'C-R11-03 (D-29c 3: panel keeps its rendered height when the cap turns off)',
    'code-reviewer L11 (number-input wheel)',
    'round-9 reviewer M1 (transportRunningRef latch)',
    'round-9 reviewer M-R10-1 / M2 (LibraryPlayheadText 20 Hz during library preview)',
    'round-9 reviewer L2-L8',
    'design-philosopher (a)-(d)',
    'A round-11 follow-ups: silent fold refusal during a gesture, no aria-controls on the fold button, Home on separators triggers the global seek, ring-inset on the track-name button, panel found through nextElementSibling',
  ],
  split:
    'more than three items, so per agent-workflow.md it runs as bounded sub-rounds of at most three closely related items: 14a = C-R11-01..03 (track layout / D-29c), 14b = detail panel (L11, L2-L7, design a-d), 14c = context/preview (M1, M-R10-1/M2, L8) once the Tech Lead C-R8-01/C-R6-02 evidence or the round frees those files; remaining A follow-ups ride with the sub-round that owns their file',
  note: 'recorded, not dropped; files stay frozen in round 12',
};
s11b.next_round_note =
  'round 12 is C-R7-01 (SRW-03); stage 3 (round 13) waits for C-R7-01 closed or the Tech Lead quiet-Chrome acceptance; polish 14a-c after stage 3';

const s03 = item('SRW-03');
s03.d19a_amendment_round11_planning = {
  why: 'D-19a as written ends settle when |d| first enters the band; C round-10 W_2 wrap 1 shows the first post-swap row at d = -0.0007 (inside 0.008), so a literal implementation ends settle on frame one and changes nothing. K = 10 at d = -0.05 gives rate 1.50 = VIDEO_STALL_LAG_RATE.',
  rule:
    'settle is armed at a standby swap (wrap, boundary, gap-entry); it ends on the first re-entry into the settle band after |d| has exceeded it, or 1.0 s after the swap, or on the next seek (issueHoldSeek), swap, pause/stop (wasPlaying reset) or hold. During settle: deadband 0.008, K in [8, 9], rate in [0.5, 1.45] (strictly below VIDEO_STALL_LAG_RATE) with the existing 0.05 step. Not applied on the hold-release start or first Play. Steady-state videoRateCorrection unchanged.',
  b_simulation:
    'B first-order model (60 Hz, 1-frame rate latency, 0.05 step, ~30 ms freeze from +22 ms): K 4 -> d(+300) -0.0175 (C measured -0.017..-0.020); K 8 -> -0.006; K 9 -> -0.006; never above 1.35',
};
s03.next_round_note = 'round 12: C-R7-01 under amended D-19a; verdict R12-W1 (H3); regressions R2-V3, RF5-3, R3-V1 mode N info';

b.open_findings.push(
  {
    id: 'C-R11-04',
    status: 'accepted',
    note: 'folded height-handle aria-valuenow = stored open height with aria-valuetext დაკეცილია · {h} px (contract N2 convention); B confirms, no code change',
  },
  {
    id: 'export-clip-onset-1lsb',
    status: 'accepted',
    note: 'C round 11 determinism control: two unchanged exports of the same scene differ by 1.192e-7 (2^-23, 1 LSB) around a clip onset at 2.000 s (c-round-11/runs/export-determinism-1440.json). Export equality checks stay at maxDiff <= 1.2e-7, not 0; R5-E1 maxDiff 0 in round 10 was a scene without that onset. Not a bug.',
  },
  {
    id: 'd29-visible-area-formula',
    status: 'resolved',
    note: 'A round-11 deviation 1 accepted: scroller clientHeight already excludes the horizontal scrollbar, so the D-29 visible lane area is clientHeight - ruler - loop strip - row borders; plan.md D-29 text corrected; the Tech Lead real-Chrome check (10 px scrollbar) tests this formula',
  },
  {
    id: 'a-r11-dev-9-fold-during-gesture',
    status: 'open',
    note: 'fold is silently ignored during a pointer gesture; B decision for polish 14a: show GESTURE_EDIT_BLOCKED_MESSAGE like Mute (D-26 refusal consistency)',
  },
);

b.baseline_tree_at_round12 =
  'HEAD c5ed47b + 15 modified (round 6-11) + 11 Studio untracked (ArrangementDetailPanel.tsx, panels.ts, panels.test.ts, detail-panel.test.tsx, render-budget.test.tsx, track-layout.test.tsx, docs 016/017/018/019/020), identical to C round-11 end (c-round-11/gates/git-status-end.txt, diffstat-end.txt; B re-checked with diff); sha256 of every Studio file at that point: b-round-11-tree-sha256.txt; plus foreign untracked .claude/agents/frontend-architect.md and .codex/agents/frontend-architect.toml (root); must not be reverted';
b.vitest_floor_round12 = 856;

b.rounds.push({
  round: 12,
  task: 'current-task.md',
  items: ['C-R7-01'],
  status: 'dispatched',
  note: 'one bug round: amended D-19a post-swap settle (pure helper in video-sync.ts + dock swap block, rate write and settle-clear sites only). Verdict R12-W1 under H3 with 0 escalations. C-R11-01..03 -> polish 14a; C-R11-04 accepted.',
});

const p12 = b.planned_rounds.find((r) => r.round === 12);
if (p12) {
  p12.items = [
    'C-R7-01 under amended D-19a: settle armed at standby swap, ends on re-entry into 0.008 after exceeding it / 1.0 s / seek / swap / pause / hold; K in [8, 9]; settle rate <= 1.45 (< VIDEO_STALL_LAG_RATE); pure helper in video-sync.ts with a deterministic freeze simulation (0 escalations); verdict R12-W1 = R10-W1 rule under H3',
  ];
}
const p14 = b.planned_rounds.find((r) => r.round === 14);
if (p14) {
  p14.items = ['panel polish 14a (C-R11-01..03, D-29c), 14b (detail panel L11/L2-L7/design a-d), 14c (context/preview M1, M-R10-1/M2, L8)'];
  p14.note = 'split per agent-workflow.md (max three related items per round)';
}
b.advisor_used_by_B = `${b.advisor_used_by_B || ''} Round 11 planning: available, called before writing and after writing.`.trim();

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('backlog v13 written');
