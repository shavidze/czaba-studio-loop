const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
b.version = 33;
b.updated = '2026-10-13 (B: round 31 result -> round 32 dispatch, D-29w)';
b.current_task = 'current-task.md (round 32: C bugs first - C-R31-02 narrow native-range Delete/Backspace guard in StudioWorkspace + removal of the Pan onKeyDown workaround; C-R31-01 lane suppression of post-blur input until the held pointer ends; R31-U-GAP-B2 accepted as defensive with A enumeration; new fader-guards.test.tsx >= 12 it; doc 036 append)';
b.advisor_used_by_B += ' ; round 31 -> 32 planning (2026-10-13): advisor available, called once before writing (advice applied: bug round of three before stage 4b, explicit narrow guard decision, remove the Pan workaround, ignore-not-coalesce, decide B2 instead of dispatching a hunt, FB-05 status by precedent, re-baseline including round-31 files)';
const s = b.items.find((i) => i.id === 'SRW-13');
const st4a = s.stages.find((x) => x.stage === '4a');
st4a.status = 'all_ids_pass_bug_open';
st4a.result = 'C PASS round 31 (c-round-31.md) on every ID; vitest 1193/1193; mutations a-k killed; B re-ran gates (b-round-31/gates.txt). Open: C-R31-01 (Low, this stage code) -> round 32; R31-U-GAP-B2 accepted as defensive (D-29w). Tech Lead R31-T owed.';
s.stages.splice(s.stages.findIndex((x) => x.stage === '4b'), 0, {
  stage: '4a-fix',
  round: 32,
  status: 'dispatched',
  decision: 'D-29w',
  scope: 'C bugs first: C-R31-02 (Medium, pre-existing: Delete/Backspace on a focused native range input deletes the selected clip) - narrow guard in the StudioWorkspace Delete branch for input[type=range] only (role=slider playhead/overview/library preview unchanged, SRW-24 flow) and removal of the Pan onKeyDown workaround (round-31 deviation 1); C-R31-01 (Low): after blur mid Pan drag, further input from the same held pointer is ignored until its window pointerup/pointercancel, a new successful pointerdown clears it; R31-U-GAP-B2 accepted as defensive (no reachable non-reschedule sync during a gesture; A verifies the enumeration)',
  acceptance: ['R32-DK', 'R32-BC', 'R32-K', 'R32-S', 'R32-U', 'R32-Doc', 'G32-1', 'G32-2', 'G32-3'],
});
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 33;
st4b.scope += '; A-R31-REVIEW-2 (lane draft gate uses the global isPointerGestureActive, visual only); stale refusal status after a drag (C round 31 info); Volume blur-continue behaviour only if the gesture machine changes (reference test from round 32)';
const st4c = s.stages.find((x) => x.stage === '4c');
st4c.round = 34;
s.decisions_round32 = {
  result_round31: 'C PASS all IDs (G31-1..3, R31-PE..Doc); R13-M2 proven: 50L right channel 0 LSB, W3C law <= 1.41 LSB, EC = E0 0 LSB; live: no new starts, setTargetAtTime only on the music panner; loop: 1 start per iteration',
  accepted_A_round31_deviations: '1 (Pan Delete stopPropagation) accepted for round 31 and removed in round 32 once the workspace guard exists; 2 setArrangementTrackPan name; 3 JS-number equal-value target (float32); 4 lane window listeners clear the draft; 5 startGraph seeds the override via tracks; 6 setTrackPan refuses during ANY gesture incl. its own pan gesture (contract change to the round-31 2.3 wording, accepted); 7 pointer-id filter on lane commit; 8 focus moves to the slider after reset; 9 clampPan non-finite -> 0',
  guard: 'native range inputs only (Volume, Pan, Master, Zoom); role=slider (playhead, overview, library preview) unchanged because they are timeline/navigation objects and the SRW-24 flow expects Delete there',
  blur_continue: 'ignore, not coalesce: a blur cancels the drag; Volume keeps its one-entry behaviour (reference test)',
  b2: 'accepted as defensive: every edit and Undo/Redo is refused during a gesture and the other syncPlayback callers force a reschedule where startGraph honours the override (mutation h); kept against a future non-reschedule sync',
  fb05_status: 'bug (Low C-R31-01 in FB-05 code; every C ID PASS) - FB-04 got verifying only because C-R30-01 was pre-existing and elsewhere',
  renumber: '4b -> round 33, 4c + polish -> round 34',
};
const f = b.open_findings;
f.push({ id: 'C-R31-02', severity: 'medium', status: 'open', to: 'round 32 (D-29w)', title: 'Delete/Backspace on a focused fader (Volume; by code also Master and Zoom) deletes the selected clip (undoable); StudioWorkspace Delete branch lacks a range guard', evidence: 'c-round-31.md section 9; c-round-31/runs/volume-delete-key.txt; a-round-31.md section 6 deviation 1 (VOLUME-DELETE-KEY)', note: 'pre-existing; found by A, confirmed by C in the browser' });
f.push({ id: 'C-R31-01', severity: 'low', status: 'open', to: 'round 32 (D-29w)', title: 'after blur mid Pan drag, continued input from the same held pointer writes one history entry per input (Volume coalesces to one)', evidence: 'c-round-31.md section 9; c-round-31/runs/pg-blur-cancel.txt; pg-vol-blur-continue.txt; scripts/pg.js blur-continue', note: 'synthetic events; real-Chrome realism with the Tech Lead (R31-T)' });
f.push({ id: 'R31-U-GAP-B2', severity: 'low', status: 'open', to: 'round 32: accept as defensive after the A enumeration (D-29w)', title: 'removing the override term in the syncPlayback non-reschedule pan push kills no test (branch unreachable during a gesture)', evidence: 'c-round-31.md section 7 R31-U table and section 9' });
f.push({ id: 'A-R31-REVIEW-2', severity: 'low', status: 'open', to: 'SRW-13 stage 4b (round 33)', title: 'lane Pan draft gate uses the global isPointerGestureActive(); after a refused claim and another gesture, moves can set a visual-only draft', evidence: 'a-round-31.md section 4 finding 2' });
f.push({ id: 'C-R31-INFO-REFUSAL-STATUS', severity: 'info', status: 'open', to: 'SRW-13 stage 4b', title: 'the gesture refusal status stays visible after the drag commits', evidence: 'c-round-31.md section 6 R31-PG info' });
f.push({ id: 'R24-HC-COVERAGE', severity: 'info', status: 'open', to: 'round 32 coverage test', title: 'R24-HC Home test now exercises Pan (first range); Home on Volume/Master needs its own test', evidence: 'c-round-31.md section 9' });
f.push({ id: 'A-R31-DEV-6', severity: 'info', status: 'accepted', title: 'setTrackPan refuses during any pointer gesture including its own pan gesture', evidence: 'a-round-31.md 6.6; c-round-31.md R31-PG' });
b.rounds.push({ round: 31, task: 'tasks/round-31.md', items: ['SRW-13 stage 4a / FB-05 track pan (R13-M2)'], status: 'c_pass', decision: 'D-29v', c_ids: ['G31-1', 'G31-2', 'G31-3', 'R31-PE', 'R31-PE2', 'R31-PV', 'R31-PL', 'R31-PH', 'R31-PG', 'R31-PD', 'R31-PUI', 'R31-PC', 'R31-K', 'R31-R', 'R31-S', 'R31-U', 'R31-Doc'], result: 'C PASS all; new C-R31-01 (Low), C-R31-02 (Medium, pre-existing), R31-U-GAP-B2; vitest 1193/1193' });
b.rounds.push({ round: 32, task: 'current-task.md', items: ['C-R31-02 narrow range Delete guard + Pan workaround removal', 'C-R31-01 post-blur input suppression', 'R31-U-GAP-B2 accepted as defensive (enumeration)'], status: 'dispatched', decision: 'D-29w', note: 'frozen: b-round-31-tree-sha256.txt (375 files incl. round-31 context/graph/model/types/track-pan.test); snapshots b-round-31-snapshots/ (StudioWorkspace.tsx, ArrangementLane.tsx, doc 036); baseline 7 status lines (b-round-31-git-status.txt); expected end 9 lines (or 4 if root commits round 31 first)', c_ids: ['R32-DK', 'R32-BC', 'R32-K', 'R32-S', 'R32-U', 'R32-Doc', 'G32-1', 'G32-2', 'G32-3'], owned: ['app/components/arrangement/StudioWorkspace.tsx (Delete/Backspace branch + one predicate)', 'app/components/arrangement/ArrangementLane.tsx (Pan handlers, Pan input props, suppression)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (append)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (new)'] });
b.vitest_floor_round32 = 1193;
b.baseline_tree_at_round32 = 'HEAD 1cefea1 + 7 uncommitted round-31 lines (C-verified); sha256 of 375 frozen files: b-round-31-tree-sha256.txt; 3 owned snapshots in b-round-31-snapshots/; B gates b-round-31/gates.txt: protected 4/4, tsc 0, vitest 68/1193, build ok, Biome 2 CRLF errors (root) + 218 warnings';
fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length);
