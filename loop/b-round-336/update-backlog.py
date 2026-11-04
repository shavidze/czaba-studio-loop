# B round 336 -> 337 planning: backlog v295 -> v296. Once-only (marker update-backlog.done). Run from the loop root.
import json, pathlib, sys, shutil
L = pathlib.Path('.')
marker = L / 'b-round-336/update-backlog.done'
if marker.exists():
    sys.exit('already applied')
shutil.copyfile('backlog.json', 'b-round-336/backlog-before-337.json')
b = json.load(open('backlog.json'))
assert b['version'] == 295, b['version']
DATE = '2026-11-04'
ADDED = '2026-11-04 B round 336 -> 337 planning'
NUM = json.load(open('b-round-336/numbers.json'))

def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})

dec('D-29z1023', 'Round 336 closed PASS from C evidence: c-round-336.json taskStatus PASS, browserVerified/realVerified true, 10 rows, 0 bugs; gate 336 skipped "no real changes" (head f1def9c); baseline stays f1def9c. RETRO 336 -> done; retro_runs[336] done; retro_policy.next_due unchanged (round 351, window 336-350).')
dec('D-29z1024', "C round-336 notes: INFO-B336-SMOKE-UNDO-LABEL (origin B spec; cross-lane Undo title is 'Move to track - Stems' per strings.ts historyMoveToTrack; closed info, L29 evidence for RETRO 351); INFO-C336-PERF-STATUS-WORDING closed info; INFO-C336-COLLECT-OVERWRITE (b-round-335/collect.py writes in place; C restored the file) -> RC-R336-SCRIPT-OUTPUT-DIR watch to RETRO 351; SR-336-1/2 reproduced, stay awaiting_user.")
dec('D-29z1025', 'GATE335-S1 premise checked at HEAD f1def9c: no try in measureDrag/measureLaneDrag; a throw aborts the pass (runInteractionPass catch) and context.close() drops the button, so "the next step starts mid-gesture" cannot happen today. The release is hygiene. SYS-R336 acceptance amended: observable = in-page pointerup after the last pointerdown, read in the pass catch (mutant P control true, mutant M no-release false), run by B on sketch v2 (b-round-336/mutant-P, mutant-M).')
dec('D-29z1026', 'L4 ruling for perf/budgets.interactions.json: the SYS-R336 notes-only grant wins over ARCH-R335 "unchanged budgets.interactions.json": every non-note field of all 193 rows equal by id and order; exactly the 58 ids in b-round-336/notes-changed-ids.txt change their note (26 lane gesture prefixes shortened + 4 lane whole-window wordings; 16 commits-per-move + 16 move-components-per-move older notes fixed under L7, same root cause as A-R335-REVIEW-WHOLE-NOTE). No schema or perf/lib change.')
dec('D-29z1027', 'Sketch review (L58 clause): code-reviewer is not on this planner phase consult allowlist, so B used tech-lead (read-only) on sketch v1: no Critical/High/Medium; RV-1 (rethrow without masking), RV-2 (pointerSpan name), RV-3 (inline named constants) applied in sketch v2; RV-4/RV-5 not applied (b-round-336/sketch-review.md). A still runs the code-reviewer on its tree (3+ files rule).')
dec('D-29z1028', 'Docs for SYS-R336: new docs/implementation/2026/quarter-IV/233-sys-r336-perf-drag-window.md (233 free; SYS precedent doc 219); doc 168 ## მეტრიკები granted whole (L34) for the denominator wording; doc 232 untouched.')
dec('D-29z1029', 'Next: round 338 = REGRESSION-ROUND-2026-11-05 if its planning is on or after 2026-11-05, else PERF-DRAG-PREVIEW c3-ii; then c3-ii (+ liveness assert), c4, c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries (skip rule).')
dec('D-29z1030', f"This task: round 337 = SYS-R336-PERF-DRAG-WINDOW on f1def9c (clean); grants: perf spec, budget notes (58 ids), new doc 233, doc 168 ## მეტრიკები; claims b-round-336/claims-337.sh; sketch evidence {NUM['sketch_summary']}.")

for r in b['rounds']:
    if r.get('round') == 336:
        r['status'] = 'c_pass (D-29z1023): gate 336 skipped no real changes, head f1def9c | ' + r['status']
b['rounds'].append({'round': 337, 'task': 'current-task.md', 'decision': 'D-29z1023..D-29z1030', 'type': 'SYS-R336-PERF-DRAG-WINDOW (test-only perf harness helper + notes)', 'status': 'dispatched', 'note': 'baseline f1def9c clean; claims b-round-336/claims-337.sh; sketch b-round-336/apply-sketch.py; oracle c-round-335/perf-results/latest-interactions.json', 'added': ADDED})

rr = b['retro_runs'][-1]
assert rr['round'] == 336
rr['status'] = 'done (D-29z1023): C round 336 PASS, every RT row PASS, browserVerified true | ' + rr['status']

for e in b['systemic_tasks']:
    if e.get('id') == 'SYS-R336-PERF-DRAG-WINDOW':
        e['status'] = 'dispatched round 337 (D-29z1030)'
        e['acceptance_amended_d29z1025'] = 'identical row-id set (193); every non-wallclock row EQUAL vs c-round-335/perf-results/latest-interactions.json (139); liveness rows 1 in every pass; GATE335-S1 observable: in-page pointerup after the last pointerdown read in the pass catch (mutant P true, mutant M false); mutant D (per-move denominator) turns rowcmp-1x red; perf alone (L38)'
        e['sketch_evidence'] = NUM['sketch_summary']

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1023..D-29z1030): RETRO 336 done (C round 336 PASS); round 337 = SYS-R336-PERF-DRAG-WINDOW (test-only); then REGRESSION (first planning on/after 2026-11-05), c3-ii, c4, c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | ' + perf['status']
for st in perf['stages']:
    if st.get('id') == 'SYS-R336-PERF-DRAG-WINDOW':
        st['status'] = 'dispatched round 337 (D-29z1030) | ' + st['status']
perf['execution_order_d29z1029'] = ['337 SYS-R336-PERF-DRAG-WINDOW', 'REGRESSION-ROUND-2026-11-05 (first planning on/after 2026-11-05)', 'PERF-DRAG-PREVIEW c3-ii (+ liveness assert)', 'c4', 'c5', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM']

for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'planned (D-29z1029): the first round planned on or after 2026-11-05 (round 338 if its planning is on or after that date); round 337 = SYS-R336 | ' + x['status']

ids_note = 'scheduled in SYS-R336-PERF-DRAG-WINDOW; dispatched round 337 (D-29z1030)'
for lst in (b['open_findings'], b['deferred_low_polish']):
    for f in lst:
        if f.get('id') in ('GATE335-S1-MOUSE-UP-FINALLY', 'GATE335-S3-LANE-SEGMENT-CONSTANTS', 'GATE335-S4-REPEATED-NOTES', 'A-R335-REVIEW-WHOLE-NOTE', 'INFO-A335-SEQUENCE-ORDER'):
            f['status'] = ids_note + ' | ' + f['status']
        if f.get('id') == 'GATE335-S1-MOUSE-UP-FINALLY':
            f['premise_d29z1025'] = 'consequence "next step starts mid-gesture" does not hold at f1def9c (a throw aborts the pass; context.close()); fix kept as hygiene with an observable mutant'
for a in b['architecture_signals']:
    if a.get('id') == 'ARCH-R335-DRAG-WINDOW-HELPER':
        a['status'] = 'dispatched round 337 (D-29z1030); budgets clause superseded by the notes-only ruling D-29z1026 | ' + a['status']

b['open_findings'] += [
    {'id': 'INFO-B336-SMOKE-UNDO-LABEL', 'severity': 'info', 'origin': 'B spec', 'title': "round-336 smoke expected 'Undo: Move clip' for a cross-lane drag; the app title is 'Undo: Move to track - Stems' (historyMoveToTrack)", 'evidence': 'c-round-336.md STUDIO-SMOKE-336; c-round-336/smoke2.json', 'status': 'closed_info (D-29z1024): not an app bug; L29 evidence (expectation not probed at the baseline) for RETRO 351', 'added': ADDED},
    {'id': 'INFO-C336-PERF-STATUS-WORDING', 'severity': 'info', 'origin': 'C round 336', 'title': 'PERF-DRAG-PREVIEW status reads in_progress (D-29z1011..D-29z1022), not exactly the task wording', 'evidence': 'c-round-336.md RT-IDS', 'status': 'closed_info (D-29z1024)', 'added': ADDED},
    {'id': 'INFO-C336-COLLECT-OVERWRITE', 'severity': 'info', 'origin': 'B script', 'title': 'b-round-335/collect.py writes rounds-321-335.json in place; C re-run overwrote it and restored it with git checkout', 'evidence': 'c-round-336.md Not run / limits', 'status': 'open_info (D-29z1024) -> RC-R336-SCRIPT-OUTPUT-DIR', 'added': ADDED},
]
b['retro_candidates'].append({'id': 'RC-R336-SCRIPT-OUTPUT-DIR', 'text': 'every B analysis script that C re-runs takes its output folder as an argument (never writes into b-round-N/ by default)', 'status': 'watch to RETRO 351 (1x) (D-29z1024); applied in round 337: apply-sketch.py and make-mutant.py write only to the folder given', 'added': ADDED})

b['current_task'] = 'current-task.md (round 337, D-29z1023..D-29z1030; SYS-R336-PERF-DRAG-WINDOW on f1def9c: dragWindow/rowWriter/pressedGesture helpers, named lane constants, sequence order, 58 notes, doc 233 + doc 168 metrics; claims b-round-336/claims-337.sh)'
b['version'] = 296
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
marker.write_text('v296\n')
print('backlog v296 written')
