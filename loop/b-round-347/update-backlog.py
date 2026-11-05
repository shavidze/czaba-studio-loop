# B round 347 -> 348 planning: backlog.json update (close-out of round 347 + dispatch of round 348).
# Run from the loop root: python3 -I b-round-347/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-347/backlog-before-348.json')
DONE = pathlib.Path('b-round-347/update-backlog.done')
SUMMARY = pathlib.Path('b-round-347/perf-summary.txt')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
if not SUMMARY.exists():
    sys.exit('perf-summary.txt missing: run summarize-perf.py first')
MUTANTS = pathlib.Path('b-round-347/mutant-ruling.txt').read_text().strip()
b = json.loads(P.read_text())
assert b['version'] == 308, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 347 -> 348 planning'

def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})

def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)

dlog('D-29z1100', 'Round 347 closed as PASS from independent C evidence: c-round-347.json taskStatus PASS, browserVerified/realVerified true, 14 rows passed (CLAIMS, SOURCE-SCOPE, READ, UNIT 395/395, MUTANT x3 red, NAMES fade [4x4] trim [15x4] move [12,12,82,12] click [83,0], FADER-LANE and FADER-CLIPGAIN at 1440x900 and 1280x720 incl. the stale-closure probes and HEAD parity, VISUAL outerHTML identical after stripping useId attributes, PERF 60/60 asserted 0 NEW none higher, FADER-PERF 94/94 0 DIFF, PERF-LIB 40/40, G347-AUTH, DOCS), 0 bugs, 0 blocked. Gate 347 published 95774e6 on both remotes (gates/gate-round-347.json); baseline for round 348 is 95774e6, clean tree. PERF-DRAG-PREVIEW stage c6-ii -> done. New oracles c-round-347/perf-results/latest-interactions.json (trim 14.75, move 15.317, fade 3.933 per move) and c-round-347/fader-perf-results/latest.json.')
dlog('D-29z1101', 'Round-347 notes routed. GATE347-S1 = A-R347-REVIEW-L2 (parseClipGainDbKey filters non-finite values, shifting later entries; unreachable, gains clamped -60..+24 dB; fix = length-preserving map to 0) -> deferred_low_polish (or earlier in the next round owning ArrangementDetailPanel.tsx). A-R347-REVIEW-L1 (layout-effect ref update; no reachable path) -> deferred_low_polish. GATE347-S2 (DP65 no try/finally) -> round 348 with DP63 (same loop). GATE347-S3 (setTrackPan stability) -> closed_info: useCallback deps [applyEdit, refuseEditDuringGesture] (claims-348 K12) and C NAMES show no MixFader in fade/trim/non-crossing move commits. GATE347-S4 (hook contract only in doc 232) -> info, kept with the round-347 placement note (moves to docs/technical with the next round touching it). C-R347-HELD-ARROW-HISTORY (Low: held arrow on a lane Volume fader adds one history entry per key-up, same at HEAD; Live behaviour unverified) -> deferred_low_polish. C-R347-VISUAL-ID-STRIPPED (info) -> closed_info. Gate Architecture signals 4 and 3 -> ARCH-R347-LANE-HEADER-MIX (joins checkpoint question 3) and ARCH-R347-DETAIL-PANEL-REPEAT; A note on two latest-callback mechanisms folded into ARCH-R346-FADER-DRAG-OPTIONS-EFFECT. Durations 440477 ms (C) and 432344 ms (A) under the L31 bound -> evidence on ROOT-REQ-PERF-TIMEOUT.')
dlog('D-29z1102', 'Conversions shape (D-29z1092 applied to measured values): 14 1x rows -> owner PERF-DRAG-PREVIEW-conv, budgets = ceil(C round 347 value): trim per-move <=15 and max <=15, trim/move release-commits ==1, move per-move <=16 (15.317 includes the one project-end crossing commit of 82; steady 12), fade per-move and max tightened <=24 -> <=4. Asserted 60 -> 70. Stay record: move max, the 36 trim/move/fade 6x copies, and fade release-commits (3 stopped / 2 playing, equal in C rounds 346 and 347; unexplained at planning, so not pinned -> PERF-CAND-FADE-RELEASE-COMMITS; D-29z1092 "== 1" applies to trim and move only). The item target <= 15/move is met by trim and fade; move only in steady state, so PERF-DRAG-PREVIEW does not become done on a round-348 PASS. B sketch evidence: b-round-347/perf-summary.txt. ' + MUTANTS)
dlog('D-29z1103', 'GATE347-S2 fixed in round 348 together with DP63 (same gesture loop): the body after pointerDownAt is wrapped in try { ...; released = true; undo } finally { if (!released) pointerUpAt }; no assertion added, removed or reordered (b-round-347/sketch/tests.patch.txt; test-only, round owns the file; 2026-10-23 rule allows an early Low fix in owned code). ARCH-R346-DP-HARNESS-EXTRACT trigger unchanged (no describe block added).')
dlog('D-29z1104', 'Round 348 dispatched: PERF-DRAG-PREVIEW conversions (current-task.md; patches b-round-347/sketch/budgets.patch.txt and tests.patch.txt; mutants b-round-347/sketch/make-mutants.py; claims b-round-347/claims-348.sh). Files: perf/budgets.interactions.json, drag-preview-render.test.tsx, doc 232. Reference-first, product-designer, screen budget and YouTube request do not apply (budget/test round, no behaviour change). REGRESSION not due (next on/after 2026-11-08); RETRO about round 351. Feature boundary: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE now wanted before PERF-CAND-MASTER-GROUP-FADER-PROPS or crossing work (non-blocking for 348 and PERF-CAND-VIDEO-TRIM-FADE-ROWS). Consults: tech-lead and performance-optimizer (code-reviewer is not on the planner consult list; tech-lead reviewed the sketch diff for L58). Advisor consulted (available).')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1100): C round 347 PASS browserVerified=true realVerified=true; gate 347 published 95774e6'
b['rounds'].append({'round': 348, 'task': 'current-task.md', 'decision': 'D-29z1100..D-29z1104', 'type': 'PERF-DRAG-PREVIEW conversions (trim/move/fade 1x rows -> assert at ceil; DP63/DP65 finally)', 'status': 'dispatched', 'note': 'baseline 95774e6 clean; patches b-round-347/sketch/{budgets,tests}.patch.txt; claims b-round-347/claims-348.sh; perf b-round-347/perf-summary.txt', 'added': ADDED})

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1104): c6-ii done (round 347, 95774e6); round 348 = PERF-DRAG-PREVIEW conversions | ' + sp['status']
sp['execution_order_d29z1104'] = ['348 PERF-DRAG-PREVIEW conversions (14 rows assert; DP63/DP65 finally)', 'PERF-CAND-VIDEO-TRIM-FADE-ROWS (record rows first, then assert)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect; wanted now, non-blocking)', 'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing (move <= 15 incl. crossing; item target)', 'PERF-CAND-FADE-RELEASE-COMMITS', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1104): stages a .. c6-ii done (c6-ii C round 347 PASS, 95774e6; trim 14.75, move 15.317 (steady 12, crossing 82), fade 3.933 per move); round 348 = conversions; item target <= 15 met for trim and fade, move only in steady state | ' + dp['status']
dp['stage_conversions_contract_d29z1104'] = {'task': 'current-task.md round 348', 'patches': 'b-round-347/sketch/budgets.patch.txt, b-round-347/sketch/tests.patch.txt', 'rows': '14 rows owner PERF-DRAG-PREVIEW-conv; asserted 60 -> 70', 'mutants': 'b-round-347/sketch/make-mutants.py; results b-round-347/perf-summary.txt', 'stay_record': 'move max, 6x copies, fade release-commits'}
dp['later_candidates_d29z1102'] = ['PERF-CAND-FADE-RELEASE-COMMITS: fade release commits 3 (stopped) / 2 (playing) vs 1 for trim/move/lane/group; name the extra commits (scratch probe, L37) before asserting', 'move per-move <= 15 including the project-end crossing commit (82): checkpoint question 1 or PERF-CAND-MASTER-GROUP-FADER-PROPS']

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'wanted now (D-29z1104): feature boundary after round 348; before PERF-CAND-MASTER-GROUP-FADER-PROPS or crossing work; adds ARCH-R347-LANE-HEADER-MIX to question 3; non-blocking for 348 and PERF-CAND-VIDEO-TRIM-FADE-ROWS | ' + acr['status']

for sig in [
    {'id': 'ARCH-R347-LANE-HEADER-MIX', 'origin': 'gate 347 review Architecture note (signal 4)', 'note': 'ArrangementLane.tsx lane header now holds ~10 stable handlers plus pan/volume gesture refs next to clip and ghost rendering; proposal: memoised LaneHeaderMix child owning pan and volume; acceptance track-pan, drag-preview-render, fader-guards unchanged plus zero lane-header renders during clip drags; cost medium; risk pan blur/cleanup ref ownership', 'status': 'signal (D-29z1101); joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled', 'added': ADDED},
    {'id': 'ARCH-R347-DETAIL-PANEL-REPEAT', 'origin': 'gate 347 review Architecture note (signal 3)', 'note': 'ArrangementDetailPanel.tsx clip-gain code changed again and keeps needing the heavy drag-preview-render harness; check recurrence in the next rounds', 'status': 'signal (D-29z1101); not scheduled', 'added': ADDED},
]:
    b['architecture_signals'].append(sig)
fd = find(b['architecture_signals'], 'ARCH-R346-FADER-DRAG-OPTIONS-EFFECT')
fd['note'] = fd['note'] + ' | round 347 A code-reviewer: two latest-callback mechanisms now (useRelativeFaderDrag passive effect, useStableHandler layout effect; handleClipGainFaderPointerDown goes through both); proposal: move useRelativeFaderDrag onto useStableHandler with the fader tests as acceptance (D-29z1101)'

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'open; evidence at round 347 -> 348 planning (D-29z1101): 440477 ms (C round 347) and 432344 ms (A round 347), under the L31 bound 450000 | ' + rr['status']

for f in [
    {'id': 'GATE347-S1', 'severity': 'low', 'origin': 'gate 347 review (= A-R347-REVIEW-L2)', 'title': 'parseClipGainDbKey filters non-finite values, which would shift later clip-gain entries', 'evidence': 'gates/round-347/review.md suggestion 1; a-round-347.md L2', 'repro': 'read ArrangementDetailPanel.tsx parseClipGainDbKey; unreachable while gains are clamped -60..+24 dB', 'status': 'deferred_low_polish (D-29z1101); fix: map non-finite to 0 (length-preserving)'},
    {'id': 'A-R347-REVIEW-L2', 'severity': 'low', 'origin': 'A round 347 code-reviewer', 'title': 'same as GATE347-S1', 'evidence': 'a-round-347.md', 'status': 'duplicate of GATE347-S1 (D-29z1101)'},
    {'id': 'A-R347-REVIEW-L1', 'severity': 'low', 'origin': 'A round 347 code-reviewer', 'title': 'useStableHandler writes its ref in a layout effect; an earlier sibling layout effect in the same commit could call the previous handler', 'evidence': 'a-round-347.md L1', 'repro': 'no current code path (reviewer checked StudioWorkspace, MarkerRow, Transport, Library)', 'status': 'deferred_low_polish (D-29z1101)'},
    {'id': 'GATE347-S2', 'severity': 'low', 'origin': 'gate 347 review', 'title': 'DP65 gesture loop has no try/finally (DP63 same)', 'evidence': 'gates/round-347/review.md suggestion 2', 'status': 'scheduled round 348 (D-29z1103)'},
    {'id': 'GATE347-S3', 'severity': 'info', 'origin': 'gate 347 review', 'title': 'is setTrackPan referentially stable (renderPanReadout deps)?', 'evidence': 'gates/round-347/review.md suggestion 3; claims-348 K12', 'status': 'closed_info (D-29z1101): useCallback deps [applyEdit, refuseEditDuringGesture]; C NAMES show no MixFader in fade/trim/non-crossing move commits'},
    {'id': 'GATE347-S4', 'severity': 'info', 'origin': 'gate 347 review', 'title': 'useStableHandler never-call-during-render contract only in doc 232', 'evidence': 'gates/round-347/review.md suggestion 4', 'status': 'open_info (D-29z1101): moves to docs/technical with the next round touching that folder (round-347 placement note)'},
    {'id': 'C-R347-HELD-ARROW-HISTORY', 'severity': 'low', 'origin': 'C round 347 (pre-existing, same at HEAD)', 'title': 'a held arrow key on a lane Volume fader adds one history entry per key-up', 'evidence': 'c-round-347.md "Note for B"', 'repro': '/studio-lab, focus a lane Volume fader, hold ArrowDown, then Undo: one Undo per step', 'status': 'deferred_low_polish (D-29z1101); Live behaviour not verified'},
    {'id': 'C-R347-VISUAL-ID-STRIPPED', 'severity': 'info', 'origin': 'C round 347', 'title': 'VISUAL compared outerHTML after stripping id and aria-describedby (useId)', 'evidence': 'c-round-347.md VISUAL row', 'status': 'closed_info (D-29z1101): READ showed no JSX attribute change'},
]:
    f['added'] = ADDED
    b['open_findings'].append(f)
for i in ('GATE347-S1', 'A-R347-REVIEW-L1', 'C-R347-HELD-ARROW-HISTORY'):
    e = dict(find(b['open_findings'], i))
    b['deferred_low_polish'].append(e)
for i in ('GATE346-L1', 'GATE346-INFO3'):
    e = find(b['open_findings'], i)
    e['status'] = 'closed (D-29z1100): fixed in round 347 (C round 347 PASS, published 95774e6) | ' + e['status']

b['current_task'] = 'current-task.md (round 348: PERF-DRAG-PREVIEW conversions)'
b['version'] = 309
b['updated'] = ADDED
P.write_text(json.dumps(b, ensure_ascii=False, indent=1) + '\n')
DONE.write_text('ok\n')
print('ok v309')
