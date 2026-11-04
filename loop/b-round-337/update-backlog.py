# B round 337 -> 338 planning: backlog v296 -> v297. Once-only (marker update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-337/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-337/backlog-before-338.json').exists():
    sys.exit('backup b-round-337/backlog-before-338.json missing')
b = json.load(open('backlog.json'))
assert b['version'] == 296, b['version']
DATE = '2026-11-04'
ADDED = '2026-11-04 B round 337 -> 338 planning'

def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})

dec('D-29z1031', 'Round 337 closed PASS from C evidence: c-round-337.json taskStatus PASS, browserVerified/realVerified true, 9 rows (CLAIMS, SOURCE-SCOPE, NOTES, PERF, MUTANT, HARNESS-READ, PERF-LIB, G337-AUTH, DOCS), 0 bugs, 6 gate rows not claimed; gate 337 published bbc281f on both remotes (gates/gate-round-337.json). SYS-R336-PERF-DRAG-WINDOW -> done; closes GATE335-S1-MOUSE-UP-FINALLY, GATE335-S3-LANE-SEGMENT-CONSTANTS, GATE335-S4-REPEATED-NOTES, A-R335-REVIEW-WHOLE-NOTE, INFO-A335-SEQUENCE-ORDER, ARCH-R335-DRAG-WINDOW-HELPER (L7). Baseline for round 338: bbc281f.')
dec('D-29z1032', "Round-337 notes: A reviewer Lows #1-#4 (perf spec helper renames, pinned by the round-337 task) -> deferred_low_polish A-R337-REVIEW-HELPER-NAMES; A re-review Low (doc 168 l.87 'შემდეგ' twice) -> fixed in round 338 (doc 168 ## მეტრიკები granted again) as A-R337-REVIEW-DOC168-WORDING; A re-review Info (doc 233 could name make-mutant.py) closed info; INFO-C337-AUTH-SCRIPT (C's own script used a removed testid) closed info; gate 337 reviewer note on pressedGesture (no fix needed) recorded; gate reviewer proposal -> architecture signal ARCH-R337-PERF-HELPERS-TO-LIB (not scheduled; depends on ROOT-REQ-VITEST-PERF-INCLUDE).")
dec('D-29z1033', 'REGRESSION not due at this planning: regression-last.json 2026-11-02, planning date 2026-11-04 (2 days < 3). The next planning on or after 2026-11-05 is REGRESSION-ROUND-2026-11-05; round 338 = PERF-DRAG-PREVIEW c3-ii.')
dec('D-29z1034', 'c3-ii premise at bbc281f (b-round-337/cross-lane-probe.mjs, dev, 1440x900 and 1280x720; probe/head-*.json): 4 cross-lane moves render 87 components each with provider and StudioWorkspace, provider hooks 0 (history: previewArrangement(gesture.before) per move) and 35 (clipLaneDrag useState in the context value). Mutant A on the sketch (history write restored) costs 25.25/move vs 24.906: hook 35 is the cost; hook 0 renders only the provider fiber (value deps unchanged). Both removed.')
dec('D-29z1035', 'Sketch review (b-round-337/sketch-review.md): tech-lead (code-reviewer not on this phase list) TL-1 Medium (v2 guard skipped previewActiveRef on a direct cross-lane drag; the video-import wait reads only previewActiveRef) -> fixed in v3 (always previewGeometry(gesture.before); clear branch makes it render-free), pinned by DP49 isArrangementPreviewActive + mutant MU-GUARD-V2; TL-2 names (clip-lane-drag-store.ts, useArrangementClipLaneDrag...), TL-3 no type re-export, TL-4 CL1-CL4, TL-5 docs applied. performance-optimizer: assertable rows, max/wallclock/.6x stay record, liveness check (e), DP49 early preview-null applied; signals SIG-R338-GHOST-LAYER, SIG-R338-GROUP-CROSS-PREVIEW.')
dec('D-29z1036', 'Budgets c3-ii (L58): assert interact.drag.lane.{stopped,playing}.move-components-per-move <= 25 (sketch 24.906 in all 6 samples, runs 2 and 3; HEAD 58.969; mutant A 25.25 red), .{stopped,playing}.release-commits == 1, playing.move-restarts == 0, interact.harness.drag-lane-live and .6x == 1 (mutant E 0). move-components-max (101 = same-lane commit), cross-/lane-components-per-move (wallclock, L37), release-restarts and .6x component copies stay record. Same-lane interact.drag.move.*.move-components-per-move 24.267 -> 22.8 (record; HEAD first-move {ghosts:[]} provider render removed).')
dec('D-29z1037', 'Tests c3-ii: 6 probe lines {...useArrangement(), clipLaneDrag: useArrangementClipLaneDrag((state) => state.drag)} (L23 collision granted; 16 reads unchanged; PERF-8a range-probe precedent); new DP49 (cross-lane moves: provider/workspace/transport/library 0, ArrangementLane 2; preview null and preview-active true on entry; release Move to track - SFX), DP50 (refusal readout from the store), clip-lane-drag-store.test.ts CL1-CL4. No expect( removed. Covering 18 files / 446 tests on the sketch.')
dec('D-29z1038', 'Docs c3-ii: doc 232 granted whole (L34; new section c3-ii, item 46 corrected); doc 168 ## მეტრიკები granted whole (lane asserts; l.87 wording); doc 014 (history) and doc 233 l.75 (TODO satisfied) unchanged.')
dec('D-29z1039', 'Signals (not scheduled): SIG-R338-GHOST-LAYER (lane ghost map as its own memo child reading the store; lane + faders + icons stop rendering per move); SIG-R338-GROUP-CROSS-PREVIEW (group cross-lane branch still calls previewArrangement(gesture.before) per move -> input to stage c4). Escape during a cross-lane drag does not cancel (HEAD = sketch, probe/compare-*.txt): known C-R85-L1 / ESCAPE-CANCEL-GESTURE, no new finding.')
dec('D-29z1040', 'This task: round 338 = PERF-DRAG-PREVIEW stage c3-ii on bbc281f: 16 granted files (clip-lane-drag-store.ts new, ArrangementContext, ArrangementClip, ArrangementLane, StudioWorkspace, 6 tests + new store test, perf spec liveness (e), 7 budget rows, doc 232, doc 168 metrics). Patches b-round-337/sketch/*.patch.txt; claims b-round-337/claims-338.sh; oracle c-round-337/perf-results/latest-interactions.json; behaviour oracle b-round-337/probe/head-*.json.')

for r in b['rounds']:
    if r.get('round') == 337:
        r['status'] = 'c_pass_published (D-29z1031): gate 337 published bbc281f | ' + r['status']
b['rounds'].append({'round': 338, 'task': 'current-task.md', 'decision': 'D-29z1031..D-29z1040', 'type': 'PERF-DRAG-PREVIEW stage c3-ii (cross-lane ghosts into a per-provider store; lane perf asserts)', 'status': 'dispatched', 'note': 'baseline bbc281f clean; claims b-round-337/claims-338.sh; patches b-round-337/sketch/; perf oracle c-round-337; sketch lane 58.969 -> 24.906/move, cross-lane commits 87 -> 5', 'added': ADDED})

for e in b['systemic_tasks']:
    if e.get('id') == 'SYS-R336-PERF-DRAG-WINDOW':
        e['status'] = 'done (D-29z1031): C round 337 PASS, gate 337 published bbc281f | ' + e['status']

closed = 'closed (D-29z1031): fixed by SYS-R336-PERF-DRAG-WINDOW round 337, C PASS, gate 337 published bbc281f'
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if f.get('id') in ('GATE335-S1-MOUSE-UP-FINALLY', 'GATE335-S3-LANE-SEGMENT-CONSTANTS', 'GATE335-S4-REPEATED-NOTES', 'A-R335-REVIEW-WHOLE-NOTE', 'INFO-A335-SEQUENCE-ORDER'):
            f['status'] = closed + ' | ' + f['status']
for a in b['architecture_signals']:
    if a.get('id') == 'ARCH-R335-DRAG-WINDOW-HELPER':
        a['status'] = 'done (D-29z1031): dragWindow/rowWriter/pressedGesture landed in round 337 (bbc281f) | ' + a['status']

b['architecture_signals'] += [
    {'id': 'ARCH-R337-PERF-HELPERS-TO-LIB', 'origin': 'gate 337 reviewer (gates/round-337/review.md)', 'note': 'move dragWindow, componentsPerMove and rowWriter from perf/studio-lab-interactions.perf.spec.ts into perf/lib/ with focused tests in perf/lib/report.test.ts; must not touch row ids or budget semantics; depends on ROOT-REQ-VITEST-PERF-INCLUDE', 'status': 'signal (D-29z1032), not scheduled', 'added': ADDED},
    {'id': 'SIG-R338-GHOST-LAYER', 'origin': 'performance-optimizer consult (b-round-337/sketch-review.md)', 'note': 'ArrangementLane laneGhosts.map block as its own memo child reading the clip-lane-drag store, so the target lane, its faders and icons stop rendering per cross-lane move (sketch: 5 components per cross commit)', 'status': 'signal (D-29z1039), not scheduled; measure first (L37)', 'added': ADDED},
    {'id': 'SIG-R338-GROUP-CROSS-PREVIEW', 'origin': 'performance-optimizer consult (b-round-337/sketch-review.md)', 'note': 'group cross-lane branch in ArrangementClip.tsx still calls previewArrangement(gesture.before) on every move (provider fiber render per move; harness drags a single clip); input to PERF-DRAG-PREVIEW stage c4 (group move)', 'status': 'signal (D-29z1039) -> stage c4 input', 'added': ADDED},
]
b['open_findings'] += [
    {'id': 'A-R337-REVIEW-DOC168-WORDING', 'severity': 'low', 'origin': 'A round 337 code-reviewer re-review', 'title': "doc 168 l.87 has 'შემდეგ' twice in a row (readability)", 'evidence': 'a-round-337.md Reviewer findings', 'status': 'scheduled in round 338 (D-29z1032; doc 168 ## მეტრიკები granted)', 'added': ADDED},
    {'id': 'INFO-A337-MAKE-MUTANT-DOC', 'severity': 'info', 'origin': 'A round 337 code-reviewer re-review', 'title': 'doc 233 could name make-mutant.py', 'evidence': 'a-round-337.md Reviewer findings', 'status': 'closed_info (D-29z1032)', 'added': ADDED},
    {'id': 'INFO-C337-AUTH-SCRIPT', 'severity': 'info', 'origin': 'C script', 'title': 'the g330 auth script copy waited on the removed arrangement-status testid; C waits on the status text', 'evidence': 'c-round-337.json notes', 'status': 'closed_info (D-29z1032)', 'added': ADDED},
]
b['deferred_low_polish'].append({'id': 'A-R337-REVIEW-HELPER-NAMES', 'severity': 'low', 'origin': 'A round 337 code-reviewer #1-#4', 'title': 'perf spec helper names: DragWindow.commits -> moveCommits, pointerSpan vs DragWindow, pressedGesture -> withPressedPointer, arrow vs function helpers', 'evidence': 'a-round-337.md Reviewer findings', 'repro': 'read perf/studio-lab-interactions.perf.spec.ts helpers', 'status': 'deferred_low_polish (D-29z1032); candidate with ARCH-R337-PERF-HELPERS-TO-LIB', 'added': ADDED})

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1031..D-29z1040): SYS-R336 done (C round 337 PASS, gate bbc281f); round 338 = PERF-DRAG-PREVIEW c3-ii; then REGRESSION (first planning on/after 2026-11-05), c4, c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | ' + perf['status']
for st in perf['stages']:
    if st.get('id') == 'SYS-R336-PERF-DRAG-WINDOW':
        st['status'] = 'done (D-29z1031): C round 337 PASS, gate 337 published bbc281f | ' + st['status']
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1040): stages a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i done; c3-ii dispatched round 338 (clip-lane-drag store, 7 lane asserts; sketch lane 58.969 -> 24.906/move, cross commits 87 -> 5); c4, c5 not started | ' + st['status']
        st['stage_c3_ii_contract_d29z1040'] = 'current-task.md round 338; patches b-round-337/sketch/{sketch,spec,budgets}.patch.txt; perf b-round-337/perf-sketch3-results; mutants b-round-337/unit-mutants/, b-round-337/perf-mutant-AE/; probe b-round-337/probe/'
perf['execution_order_d29z1033'] = ['338 PERF-DRAG-PREVIEW c3-ii', 'REGRESSION-ROUND-2026-11-05 (first planning on/after 2026-11-05)', 'c4 (group move; SIG-R338-GROUP-CROSS-PREVIEW)', 'c5 (video)', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM']

for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'planned (D-29z1033): the first round planned on or after 2026-11-05 (round 339 if its planning is on or after that date); round 338 = c3-ii | ' + x['status']

b['advisor_used_by_B'] = 'yes (round 337 -> 338 planning: advisor consulted after orientation, before the sketch, and before declaring done)'
b['current_task'] = 'current-task.md (round 338, D-29z1031..D-29z1040; PERF-DRAG-PREVIEW c3-ii on bbc281f: clip-lane-drag store, lane perf asserts; claims b-round-337/claims-338.sh)'
b['version'] = 297
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
marker.write_text('v297\n')
print('backlog v297 written')
