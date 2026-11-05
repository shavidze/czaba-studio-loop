# B round 348 -> 349 planning: backlog.json update (close-out of round 348 + dispatch of round 349).
# Run from the loop root: python3 -I b-round-348/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-348/backlog-before-349.json')
DONE = pathlib.Path('b-round-348/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
b = json.loads(P.read_text())
assert b['version'] == 310, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 348 -> 349 planning'

def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})

def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)

dlog('D-29z1106', 'Round 348 closed as PASS from independent C evidence: c-round-348.json taskStatus PASS, browserVerified/realVerified true, 10 rows passed (CLAIMS, SOURCE-SCOPE, READ, UNIT 67/67, PERF 70/70 asserted 0 NEW 165 EQUAL 0 DIFF vs C347, MUTANT memo-removed ArrangementMixFader red on exactly the predicted 10 component rows, PERF-LIB 40/40, G348-AUTH both viewports, DRAG-SMOKE trim/move/fade-in + Undo both viewports, DOCS), 0 bugs, 0 blocked. Gate 348 published 70751a5 on both remotes (gates/gate-round-348.json); baseline for round 349 is 70751a5, clean tree. PERF-DRAG-PREVIEW stage conversions -> done (14 rows asserted; 70 asserted of 230). Oracle c-round-348/perf-store-results/latest-interactions.json. PERF-DRAG-PREVIEW stays in progress: move per-move <= 15 only in steady state (crossing commit 82), video trim/fade rows not yet measured.')
dlog('D-29z1107', 'Round-348 notes routed. GATE348-S1 = A-R348-REVIEW-L1 (DP63/DP65 finally calls pointerUpAt again if the in-try release threw, hiding the first error) and GATE348-S2 (finally skips undo after a failed assertion) -> deferred_low_polish, joined to architecture signal ARCH-R348-DP-GESTURE-CYCLE (gate proposal: runGestureCycle helper owning down/move/guaranteed release/undo; rounds 346-348 all edited these blocks), which joins ARCH-R346-DP-HARNESS-EXTRACT. GATE348-S3 (zero headroom on max rows, intended), GATE348-S4 (move <= 16 hides ~1.5 components of steady regression; tracked by PERF-CAND-MASTER-GROUP-FADER-PROPS), GATE348-S5 (doc consistent) and A-R348-REVIEW-INFO ("ceil of 15" wording) -> closed_info. C-R348-PERF-DURATION (454664 ms > L31 bound 450000) -> evidence on ROOT-REQ-PERF-TIMEOUT, ruled in D-29z1108.')
dlog('D-29z1108', 'L31 ruling for round 349 (PERF-CAND-VIDEO-TRIM-FADE-ROWS): declared limit 900000 ms (playwright.perf.config.ts 15 min, claims-349 K7), L31 bound 450000. Same-machine B runs: HEAD control 459503 ms (51 %), sketch 496938 ms (55 %), measured delta +37435 ms for the 4 new video drags (b-round-348/perf-summary.txt). Accepted for this round: 45 % headroom, one pass ~2.5 min; A STOP if any A durationMs > 540000 (60 %). No further interactions-spec rows after this round until root applies ROOT-REQ-PERF-TIMEOUT (25 * 60 * 1000) or a split lands; B cannot split now because the shared drag measurers are question 3 of the unanswered ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (ARCH-R339-DRAG-MEASURE-EXTRACT). ROOT-REQ-PERF-TIMEOUT is overdue under L46 (open since round 278, 4 RETROs 290/305/321/336 without an answer): deadline RETRO 351, where it goes to Saba as one question if root has not applied it.')
dlog('D-29z1109', 'Round 349 shape: 22 record rows owner PERF-CAND-VIDEO-TRIM-FADE-ROWS (interact.drag.video-trim.<state>.* and interact.drag.video-fade.<state>.*, 4 rows stopped + 6 playing each, kind copied from interact.drag.video.<state>.<metric>; interact.harness.drag-video-trim-live and -fade-live), inserted after interact.harness.drag-video-live; rows 230 -> 252, asserted stays 70. Spec: dragTarget(kind) picks arrangement-video-fade-in-handle for video; the 1x video block loops move/trim/fade stopped, then playing. B sketch (production, alone): 70/70 asserted pass, 22 NEW (all expected), 0 existing deterministic rows different from C348, liveness 1 in 3/3, every new deterministic row 3/3 identical; video trim 18.683/18.717 per move (max 19, release 1, release-restarts 31), video fade 8.85/8.85 (max 9, release 2, release-restarts 31); video move unchanged 15.75. tech-lead sketch review: M1 (grab needs timeline x~0 on screen; zoom anchors on playhead) ruled no change - 6/6 grabs live x 3 passes, a missing grab aborts the pass loudly (failures, asserted video rows lose samples), Home before zoom would change the asserted move setup; L1 determinism on record rows (3/3 identical); L2 typo fixed; L3 perf not linted (L30). New candidate PERF-CAND-VIDEO-TRIM-FADE-COST: video trim 18.683 > item target 15, video fade 8.85 vs audio fade 3.933; next stage (record -> assert after C measures, L58).')
dlog('D-29z1110', 'Round 349 dispatched: PERF-CAND-VIDEO-TRIM-FADE-ROWS (current-task.md; patches b-round-348/sketch/spec.patch.txt and budgets.patch.txt; claims b-round-348/claims-349.sh; perf b-round-348/perf-summary.txt). Files: perf/studio-lab-interactions.perf.spec.ts, perf/budgets.interactions.json, doc 232. Reference-first, product-designer, screen budget and YouTube request do not apply (harness round, no behaviour change). REGRESSION not due (next on/after 2026-11-08); RETRO 351 (window 336-350), so round 350 is the last scope round before it. ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE still wanted (non-blocking). Consults: tech-lead (sketch review for L58). Advisor consulted (available).')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1106): C round 348 PASS browserVerified=true realVerified=true; gate 348 published 70751a5'
b['rounds'].append({'round': 349, 'task': 'current-task.md', 'decision': 'D-29z1106..D-29z1110', 'type': 'PERF-CAND-VIDEO-TRIM-FADE-ROWS (video trim-start and fade-in drag rows, record)', 'status': 'dispatched', 'note': 'baseline 70751a5 clean; patches b-round-348/sketch/{spec,budgets}.patch.txt; claims b-round-348/claims-349.sh; perf b-round-348/perf-summary.txt', 'added': ADDED})

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1110): conversions done (round 348, 70751a5); round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS | ' + sp['status']
sp['execution_order_d29z1110'] = ['349 PERF-CAND-VIDEO-TRIM-FADE-ROWS (22 record rows)', '350 PERF-CAND-VIDEO-TRIM-FADE-COST (probe the video trim/fade commits; fix or assert at measured values) or, if ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has answered, PERF-CAND-MASTER-GROUP-FADER-PROPS', 'RETRO 351 (window 336-350; ROOT-REQ-PERF-TIMEOUT to Saba if still open, L46)', 'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing (move <= 15 incl. crossing; item target)', 'PERF-CAND-FADE-RELEASE-COMMITS', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1110): stages a .. conversions done (conversions C round 348 PASS, 70751a5; 70 asserted rows); round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS (record); item target <= 15 met for audio trim and fade, move only in steady state; video trim 18.683 (sketch) | ' + dp['status']
dp['stage_video_trim_fade_rows_contract_d29z1109'] = {'task': 'current-task.md round 349', 'patches': 'b-round-348/sketch/spec.patch.txt, b-round-348/sketch/budgets.patch.txt', 'rows': '22 record rows owner PERF-CAND-VIDEO-TRIM-FADE-ROWS; rows 230 -> 252; asserted 70', 'sketch': 'b-round-348/perf-sketch-results/latest-interactions.json (496938 ms), HEAD control b-round-348/perf-head-results (459503 ms)', 'l31': 'D-29z1108: STOP > 540000 ms; no more interactions rows until ROOT-REQ-PERF-TIMEOUT or a split'}
dp['later_candidates_d29z1109'] = ['PERF-CAND-VIDEO-TRIM-FADE-COST: video trim-start drag 18.683 components/move (> item target 15; max 19), video fade-in 8.85 (audio fade 3.933; max 9, release-commits 2); name the commits per gesture (scratch names probe, L37) before choosing fix vs assert at the measured value']

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'wanted (D-29z1110): still no answer artifact at round 349 planning; question 3 (drag measurers) now also gates a split of the interactions spec (D-29z1108); adds ARCH-R348-DP-GESTURE-CYCLE to question 3; non-blocking | ' + acr['status']

b['architecture_signals'].append({'id': 'ARCH-R348-DP-GESTURE-CYCLE', 'origin': 'gate 348 review Architecture note', 'note': 'drag-preview-render.test.tsx DP63/DP65 repeat the same gesture loop and try/finally scaffold (rounds 346-348 all edited them); proposal: runGestureCycle(gesture, steps) helper owning pointerdown, pointermove, guaranteed release and undo; acceptance DP63/DP65 (and later DP rows) use it, 67 tests unchanged, a deliberately failing assertion leaves no pressed pointer; would also close GATE348-S1/S2', 'status': 'signal (D-29z1107); joins ARCH-R346-DP-HARNESS-EXTRACT and checkpoint question 3; not scheduled', 'added': ADDED})

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'overdue (L46, D-29z1108): open since round 278, 4 RETROs without an answer; deadline RETRO 351 -> one Saba question if still open; until applied no further interactions-spec rows after round 349. Evidence: C round 348 454664 ms, A round 348 453013 ms, B HEAD control 459503 ms, B sketch with video trim/fade 496938 ms (bound 450000) | ' + rr['status']
rr['deadline_round'] = 351

for f in [
    {'id': 'GATE348-S1', 'severity': 'low', 'origin': 'gate 348 review (= A-R348-REVIEW-L1)', 'title': 'DP63/DP65 finally calls pointerUpAt again if the in-try release threw, hiding the first error', 'evidence': 'gates/round-348/review.md suggestion 1; a-round-348.md code review Low', 'repro': 'read drag-preview-render.test.tsx DP63/DP65; diagnostics only', 'status': 'deferred_low_polish (D-29z1107); fix with ARCH-R348-DP-GESTURE-CYCLE (set released before the call or guard the finally)'},
    {'id': 'A-R348-REVIEW-L1', 'severity': 'low', 'origin': 'A round 348 code-reviewer', 'title': 'same as GATE348-S1', 'evidence': 'a-round-348.md', 'status': 'duplicate of GATE348-S1 (D-29z1107)'},
    {'id': 'GATE348-S2', 'severity': 'low', 'origin': 'gate 348 review', 'title': 'DP63/DP65 finally skips undo() after a failed assertion, leaving the commit for the next iteration', 'evidence': 'gates/round-348/review.md suggestion 2', 'repro': 'read DP63/DP65; affects only failure diagnostics', 'status': 'deferred_low_polish (D-29z1107); with ARCH-R348-DP-GESTURE-CYCLE'},
    {'id': 'GATE348-S3', 'severity': 'info', 'origin': 'gate 348 review', 'title': 'zero headroom on trim/fade max rows', 'evidence': 'gates/round-348/review.md suggestion 3', 'status': 'closed_info (D-29z1107): intended (deterministic rows; doc 232 item 89 points to windowCommits/componentsSum)'},
    {'id': 'GATE348-S4', 'severity': 'info', 'origin': 'gate 348 review', 'title': 'move per-move <= 16 hides about 1.5 components of steady-state regression', 'evidence': 'gates/round-348/review.md suggestion 4', 'status': 'closed_info (D-29z1107): tracked by PERF-CAND-MASTER-GROUP-FADER-PROPS / crossing work'},
    {'id': 'GATE348-S5', 'severity': 'info', 'origin': 'gate 348 review', 'title': 'doc 232 consistent with the diff', 'evidence': 'gates/round-348/review.md suggestion 5', 'status': 'closed_info (D-29z1107)'},
    {'id': 'A-R348-REVIEW-INFO', 'severity': 'info', 'origin': 'A round 348 code-reviewer', 'title': '"ceil of the C round 347 value 15" wording on an integer', 'evidence': 'a-round-348.md', 'status': 'closed_info (D-29z1107)'},
    {'id': 'C-R348-PERF-DURATION', 'severity': 'info', 'origin': 'C round 348 note', 'title': 'interactions perf run 454664 ms above the L31 bound 450000', 'evidence': 'c-round-348.json notes', 'status': 'closed_info (D-29z1107): evidence on ROOT-REQ-PERF-TIMEOUT; ruled in D-29z1108'},
]:
    f['added'] = ADDED
    b['open_findings'].append(f)
for i in ('GATE348-S1', 'GATE348-S2'):
    b['deferred_low_polish'].append(dict(find(b['open_findings'], i)))

b['current_task'] = 'current-task.md (round 349: PERF-CAND-VIDEO-TRIM-FADE-ROWS)'
b['version'] = 311
b['updated'] = ADDED
P.write_text(json.dumps(b, ensure_ascii=False, indent=2) + '\n')
DONE.write_text('ok\n')
print('ok v311')
