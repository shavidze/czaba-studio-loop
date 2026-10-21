const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 39) throw new Error('expected v39, got ' + b.version);
b.version = 40;
b.updated = '2026-10-14 (B: round 38 result -> round 39 dispatch, D-29z4)';
b.current_task = 'current-task.md (round 39: SRW-13 stage 4b-2 group 1 - C-R37-01 pending marker on kept Clip Gain text, stale refusal status restored when the last pointer gesture ends (C-R37-01 status part + C-R31-INFO-REFUSAL-STATUS, edit and undo refusals), PENDING-COMMIT-ORDER (previewTrackVolume flushes a pending Master preview first); ArrangementContext.tsx + ArrangementDetailPanel.tsx owned; no frozen-test amendment; D-29z4)';
b.advisor_used_by_B += ' ; round 38 -> 39 planning (2026-10-14): advisor available, called before writing (advice applied: C bugs first -> lead with C-R37-01 cluster instead of the earlier orientation order; read frozen tests that pin behaviour before choosing (B scratch probe: 0 frozen failures for all three candidate changes); new baseline 6c7b4bb + new frozen list + snapshots + own gates; C-R23-01 record updated with the aria-label persistence (C-R38-01); A-R38-TEST-ORDER and A-R38-REVIEW-TOUCH recorded; narrow doc 037 status edit granted; CP-R37-DRAG-ENTRIES not closed without C evidence; decision CONTINUE)';

const s = b.items.find((i) => i.id === 'SRW-13');
const st41 = s.stages.find((x) => x.stage === '4b-1');
st41.status = 'done';
st41.result = 'round 38: C PASS (c-round-38.md) on every ID: G38-1..3 (vitest 70/1290, 376 OK, protected 4/4, anonymous /studio-lab, token 401, /studio/middle-east Sign in required), R38-S, R38-PG (REAL clicks: Volume/SFX/video 1, Master 0, Pan 10R kept, 0 entries, focus on the fader; round 37 jumped to 0.5 / -27 dB), R38-DR (synthetic, formula exact at 107/96/48 px; live setTargetAtTime 0.92->0.83->0.75 and pan 0.14->0.26->0.40, 0 source starts), R38-DC (synthetic dblclick; DC-REAL info: harness cannot fire a real dblclick), R38-MN, R38-CR, R38-K, R38-U (mutations a-h caught; optional i focus/begin order survives -> A-R38-TEST-ORDER), R38-Doc. Root checkpoint 6c7b4bb (both remotes; committed shas == C-verified shas, B sha256 check 2026-10-14). Real mouse/touch/dblclick = Tech Lead R38-T.';
const st42 = s.stages.find((x) => x.stage === '4b-2');
st42.status = 'in_progress';
st42.groups = [
  { group: 1, round: 39, decision: 'D-29z4', items: ['C-R37-01 (pending marker; status part)', 'C-R31-INFO-REFUSAL-STATUS (stale refusal status, edit + undo messages)', 'PENDING-COMMIT-ORDER (checkpoint-oct13 #5)'], status: 'dispatched' },
  { group: 2, round: '40', items: ['A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK (keydown on Pan clears the blur suppression)', 'A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Lane Pan bookkeeping also ends on window blur: draft cleared, cleanup ref null)'], status: 'todo', note: 'B analysis 2026-10-14: Lane-only; frozen fader-guards l.363-430 stay green because a change without a keydown is still ignored while suppressed' },
  { group: 3, round: '41', items: ['FADER-KEY-ENTRIES', 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL', 'A-R33-REVIEW-TOUCH'], status: 'todo' },
  { group: 4, round: '42', items: ['MASTER-HOLD-TICK-EDGE', 'A-R37-TEST-HARDENING + A-R38-TEST-ORDER (test-only)'], status: 'todo' },
];
s.decisions_round39 = {
  result_round38: 'C PASS on every round-38 ID (c-round-38.md); new Low C-R38-01 = C-R23-01 now inside two aria-label attributes after hydration',
  why_this_group: 'workflow: C bugs first. The only open C bug assignable to A is C-R37-01 (C-R23-01/C-R38-01 need entry.server.tsx or React 19 -> Tech Lead; C-R27-01/C-R6-02/C-R8-01 -> quiet Chrome; C-R30-01 -> polish). C-R37-01 parts: (1) no pending marker -> fix, (2) stale blocked status -> fix together with C-R31-INFO-REFUSAL-STATUS, (3) the kept text commits after later entries -> accepted (it commits when the user confirms; the marker now shows it is unsaved). Third related item: PENDING-COMMIT-ORDER (same pending-preview family).',
  status_restore: 'refusal status = GESTURE_EDIT_BLOCKED_MESSAGE or GESTURE_UNDO_BLOCKED_MESSAGE. The status shown just before the first refusal is remembered; when the pointer gesture count returns to 0 and the status still equals a refusal message it returns to that status; if another status was set after the refusal it stays; never empty. setStatus signature unchanged.',
  pending_marker: 'enabled Clip Gain field whose raw text differs from clipGainInputText(stored) (the blur early-return comparison, l.330): data-pending="true", border-warning token, visible text "შეუნახავია — Enter ინახავს, Esc აბრუნებს" (data-testid arrangement-detail-clip-gain-pending) referenced by aria-describedby; detail panel outer height unchanged at 1440x900 and 1280x720',
  pending_order: 'previewTrackVolume flushes a pending Master preview before it starts a new pending Volume preview (symmetric with previewMasterGain l.2307). B scratch probe (b-round-38/probe-order.test.snippet): current code, preview Master -3, preview Volume 0.5, toggle Mute, undo x3 -> Master stays -3 (wrong); with the flush -> Master 0, Volume 1, undo labels Mute, Volume, Master Volume',
  probe: 'B scratch copy b-round-38/probe/ (outside store/, node_modules junction): all three candidate changes -> vitest 70 files / 1290 passed (b-round-38/probe-all-run.txt); no frozen-test amendment is authorised or needed',
  ableton: 'Live 12 manual: section 5.4.2 Undo History "all the actions in the order they occurred" (b-round-38/ableton-managing-files-and-sets-20261014.txt, 2026-10-14) -> pending order confirmed as a principle; section 3.2 Status Bar "displays useful information like error messages" (b-round-37/ableton-live-concepts-20261013.txt) says nothing about clearing -> stale status unconfirmed, CZABA decision; pending marker: no source -> unconfirmed, CZABA requirement',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
const add = (x) => {
  if (!byId(x.id)) f.push(x);
};
const c23 = byId('C-R23-01');
c23.round38_record = 'C round 38 (c-round-38.md section 9.3): 63 611 bytes, 5 NUL at 11729, 28025/28026, 58745/58746 (3 identical repeats; offsets moved with the round-38 touch-none classes). Hydration repairs the text node, but two ATTRIBUTES stay corrupted in the live DOM: library collapse button aria-label and detail range-start input aria-label (U+FFFD) -> screen readers read broken labels. B curl 2026-10-14 13:05: 63 611 bytes, 5 NUL. Filed as C-R38-01. Still needs the Tech Lead (entry.server.tsx grant or React 19).';
c23.urgency += ' ; round 38: a11y impact now persists after hydration (two aria-labels)';
add({ id: 'C-R38-01', severity: 'low', status: 'open_tech_lead_decision', to: 'with C-R23-01 (Tech Lead)', title: 'C-R23-01 NUL bytes now fall inside two aria-label attributes (library collapse button, detail range start input); hydration does not repair attributes, so the live DOM keeps U+FFFD', evidence: 'c-round-38/runs/studio-lab.html, sl1-3.html, c-r23-01-dom.txt; c-round-38.json bugs[0]', note: 'not caused by round-38 logic (offset shift only); production build not checked' });
add({ id: 'A-R38-TEST-ORDER', severity: 'low', status: 'open', to: 'SRW-13 stage 4b-2 group 4 (test-only, with A-R37-TEST-HARDENING)', title: 'no jsdom test isolates the fader focus() -> beginGesture order; C mutation (i) (order swapped) survives 97/97', evidence: 'c-round-38.md section 9.1 (i); a-round-38.md known gaps', note: 'browser order correct today (C R38-CR CR-1/CR-2)' });
add({ id: 'A-R38-REVIEW-TOUCH', severity: 'medium', status: 'open_tech_lead_check', to: 'Tech Lead R38-T on a real touch device; fix only on evidence', title: 'possible native touch slide on the range faders: pointerdown.preventDefault does not stop touch events, so a touch press might still jump through native input (reviewer memory, unverified)', evidence: 'checkpoint-r38-review.md Medium; a-round-38.md section 4', note: 'pre-specified contract amendment if the device confirms: a native non-passive touchstart listener with preventDefault on the three fader kinds (Volume, Pan, Master), Zoom excluded; not implemented blind' });
add({ id: 'PENDING-COMMIT-ORDER', severity: 'low', status: 'dispatched', to: 'SRW-13 stage 4b-2 group 1 (round 39)', title: 'previewTrackVolume does not flush an older pending Master preview; applyEdit then flushes Volume before Master, so undo cannot restore the Master value (B probe: full undo leaves Master -3 instead of 0)', evidence: 'checkpoint-oct13-review.md #5; b-round-36.md section 6 row 5; B scratch probe b-round-38/probe-order.test.snippet (red on 6c7b4bb, green with the flush)', note: 'low reachability (needs a pending Master preview that survived a blur during a gesture)' });
add({ id: 'PREVIEW-VOLUME-IDENTITY', severity: 'info', status: 'open', to: 'SRW-13 stage 4c', title: 'previewTrackVolume has no identity short-circuit (previewMasterGain has one), so a double-click at the default costs one wasted render; 0 entries (D4)', evidence: 'checkpoint-r38-review.md suggestion 6; a-round-38.md section 4', note: 'perf nit' });
const c37 = byId('C-R37-01');
c37.status = 'dispatched';
c37.to = 'SRW-13 stage 4b-2 group 1 (round 39, D-29z4)';
c37.round39 = 'parts 1 (pending marker) and 2 (stale status) fixed in round 39; part 3 (the kept text commits after later entries, when the user confirms it) accepted by D-29z4';
const cri = byId('C-R31-INFO-REFUSAL-STATUS');
cri.status = 'dispatched';
cri.to = 'SRW-13 stage 4b-2 group 1 (round 39, D-29z4)';
cri.round38 = 'seen again in C round 38 (DC-G, MN-G: the blocked status persists into the next steps)';
const dragEntries = byId('CP-R37-DRAG-ENTRIES');
dragEntries.round38_reeval = 'B 2026-10-14 (source read, not C evidence): the round-38 hook stops on window blur and the real Pan drag no longer sends native change events, so the one-entry-per-event path needs a native drag that the prevented pointerdown removes for mouse; remaining effect: after a window-blur abort without an element blur, the Lane keeps panDragCleanupRef and the visual draft until that pointer is released. Scheduled with A-R31-REVIEW-2 as 4b-2 group 2 (round 40); not closed.';
dragEntries.to = 'SRW-13 stage 4b-2 group 2 (round 40)';
for (const id of ['A-R31-REVIEW-2', 'A-R32-REVIEW-1', 'CP-R37-PAN-KEY-LOCK']) byId(id).to = 'SRW-13 stage 4b-2 group 2 (round 40)';
for (const id of ['FADER-KEY-ENTRIES', 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL', 'A-R33-REVIEW-TOUCH']) byId(id).to = 'SRW-13 stage 4b-2 group 3 (round 41)';
byId('MASTER-HOLD-TICK-EDGE').to = 'SRW-13 stage 4b-2 group 4 (round 42)';
byId('A-R37-TEST-HARDENING').to = 'SRW-13 stage 4b-2 group 4 (round 42, with A-R38-TEST-ORDER) or the final regression';

const r38 = b.rounds.find((r) => r.round === 38);
Object.assign(r38, { task: 'tasks/round-38.md', status: 'c_pass', result: 'C PASS on every ID (c-round-38.md); vitest 1290/1290; new Low C-R38-01 (C-R23-01 in two aria-labels), A-R38-TEST-ORDER confirmed by mutation (i); root checkpoint 6c7b4bb published (both remotes); B gates b-round-38/gates.txt (2026-10-14: HEAD 6c7b4bb, 17 untracked .codex/agents/*.toml = root, 380 OK, protected 4/4, tsc 0, vitest 70/1290, build ok, Biome 2 CRLF + 218 warnings, NUL 5)' });
if (!b.rounds.some((r) => r.round === 39)) {
  b.rounds.push({ round: 39, task: 'current-task.md', items: ['SRW-13 stage 4b-2 group 1: C-R37-01, C-R31-INFO-REFUSAL-STATUS, PENDING-COMMIT-ORDER'], status: 'dispatched', decision: 'D-29z4', note: 'baseline HEAD 6c7b4bb (+ 17 untracked root .codex/agents/*.toml); frozen b-round-38-tree-sha256.txt (380 = round-37 list minus ArrangementContext.tsx and ArrangementDetailPanel.tsx plus the 6 round-38 code/test files); snapshots b-round-38-snapshots/ (Context 06338774, DetailPanel a48523be, doc 037 263325b9)', c_ids: ['R39-ST', 'R39-PM', 'R39-PO', 'R39-MN', 'R39-CR', 'R39-K', 'R39-S', 'R39-U', 'R39-Doc', 'G39-1', 'G39-2', 'G39-3'], owned: ['app/contexts/ArrangementContext.tsx (status state + gesture-end restore + previewTrackVolume flush only)', 'app/components/arrangement/ArrangementDetailPanel.tsx (Clip Gain field pending marker only)', 'app/lib/arrangement/__tests__/pending-status.test.tsx (new)', 'docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md (new)', 'docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md (status line + TODO list only)'] });
}
b.vitest_floor_round39 = 1290;
b.vitest_expected_round39 = '1290 + the new it count of pending-status.test.tsx; every existing suite unchanged';
b.baseline_tree_at_round39 = 'HEAD 6c7b4bb (root checkpoint of round 38, both remotes), git status = 17 untracked .codex/agents/*.toml (root); sha256 of 380 frozen files: b-round-38-tree-sha256.txt; 3 owned snapshots in b-round-38-snapshots/; B gates b-round-38/gates.txt';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 39 -StartPhase A and a higher limit';
fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length);
