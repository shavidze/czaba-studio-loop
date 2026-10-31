# B round 279 -> 280 planning: backlog.json update (evidence-only). Run once: python3 -I backlog-update.py
import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
ADDED = '2026-10-31 B round 279 -> 280 planning'
assert b['decisions_log_b'][-1]['id'] == 'D-29z641', 'already applied?'

def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    raise KeyError(i)

def prepend(o, text):
    o['status'] = text + ' | ' + str(o.get('status', ''))

b['version'] = b['version'] + 1
b['updated'] = ADDED
b['current_task'] = ('current-task.md (round 280, D-29z642..D-29z649; PERF-HARNESS-SHARED-LIB-b-ii-2, test-only: export heap samples counted on the page clock by '
    'request-response midpoint with a 5-probe clock offset (best RTT, limit 20 ms -> named problem), endpointRule/clockOffsetMs/clockRttMs/expectedPolls in the mem-polls detail, '
    'endSampleLagMs on one clock, 8 budget notes; heapPollMs 50 and >= 5 unchanged; baseline 1dbf3af clean; grants b-round-279-r280-grants.txt; frozen b-round-279-r280-tree-sha256.txt; '
    'oracle b-round-279/head-results-1; EQUIV-B2 named exceptions: 8 notes + res.export.{1,2}.peak-backing-delta-mib +-0.1)')

EV = 'C round 279 PASS (c-round-279.json, browserVerified/realVerified true, 12 rows) + gate 279 published 1dbf3af (both remotes)'
r279 = [r for r in b['rounds'] if r.get('round') == 279][0]
r279['status'] = 'done (D-29z642): ' + EV + '; 0 bugs'
b['rounds'].append({'round': 280, 'task': 'current-task.md', 'decision': 'D-29z642..D-29z649', 'status': 'dispatched',
    'type': 'STUDIO-PERFORMANCE PERF-HARNESS-SHARED-LIB-b-ii stage 2 (b-ii-2, final), test-only',
    'note': 'baseline 1dbf3af clean (1143 tracked); grants 8 (1 new doc 209); frozen 1136; B HEAD 1b-ii run 1 passed 1.3 min (oracle head-results-1); experiment v1 x2 + final sketch: offset vs timeOrigin -0.5..-2.2 ms, RTT 1-3 ms, midpoint +0..+2 per export (sum 11/12/11 per run), 1x export-1 peak 65 -> 65.1 in 2 of 3 runs; EQUIV-B2 0 problems 1 tolerated; mutants MU-SIGN red, MU-RTT red, MU-ENDPOINT sum 0, MU-ORIGIN control green, MU-PROBE-THROW red',
    'next': 'C PASS + gate -> round 281 = GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL unless REGRESSION due (on/after 2026-11-02, it goes first)',
    'added': ADDED})

# closures (D-29z642)
for i in ('GATE214-S1', 'GATE214-S2', 'GATE223-S2'):
    prepend(find(b['deferred_low_polish'], i), f'closed (D-29z642): {EV}, rows EQUIV/MUTANTS/LANE-BROWSER/KEEP-WAITS')
prepend(find(b['open_findings'], 'C-R223-01-GATE214-S2-PREMISE'), f'closed (D-29z642): {EV}; GATE214-S2 done by emptyLanePointAfterClip (LANE-BROWSER, MU-LANE)')
sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
prepend(find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b-ii-1'), f'done (D-29z642): {EV}')
prepend(find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b-ii-2'), 'dispatched round 280 (D-29z645); design D-29z646 (heapPollMs 50 kept, R216 headroom measured +0..+2, not claimed); equivalence D-29z647')
prepend(sp, 'in_progress (D-29z645): round 279 b-ii-1 done; round 280 = b-ii-2 (final stage of b-ii and of PERF-HARNESS-SHARED-LIB-b); round 281 = GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL; then PERF-2.. per execution_order_d29z645')
sp['execution_order_d29z645'] = ('... -> PERF-HARNESS-SHARED-LIB-b-ii-1 (279, done) -> PERF-HARNESS-SHARED-LIB-b-ii-2 (280) -> PERF-HARNESS-DIAG-281 (281: GATE279-S1 Medium, '
    'B-R280-CLICK-LIVE-LANE-ID, A-R279-REVIEW-LANE-NULL; re-run 1a + 1b-i) -> PERF-2 -> PERF-3 -> PERF-COMMIT-RESCHEDULE -> PERF-4 -> PERF-5 -> PERF-7 -> PERF-8 -> PERF-DRAG-PREVIEW -> '
    'PERF-9 -> PERF-10 -> PERF-11 -> PERF-12 -> PERF-13 -> PERF-14 -> PERF-15 (PERF-6 dropped). REGRESSION first whenever due (on/after 2026-11-02); RETRO at 290. Supersedes execution_order_d29z636.')
sp['stages'].append({'id': 'PERF-HARNESS-DIAG-281', 'what': 'GATE279-S1 (Medium: waitForCollectionReady waits for ready OR failed; a failed demo source pushes a named problem "<label>: demo collection failed: <status text>" and throws; pattern built from workspaceCollectionCopy(demo).failed with the count as \\d+), B-R280-CLICK-LIVE-LANE-ID (the chosen deselect lane id in the interact.harness.click-live detail, D-29z254 leftover; detail field, named in the equivalence contract), A-R279-REVIEW-LANE-NULL (the "lane null" error text); perf/lib/page.ts + perf/lib/app-labels.ts + interactions spec; re-run 1a + 1b-i equivalence', 'target': 'three tightly related harness-diagnostics bugs (tech-lead ruling D-29z645)', 'status': 'not_started (round 281, D-29z645)', 'added': ADDED})
sp['consults_round_280'] = {
    'tech-lead': '280 = b-ii-2 only; GATE279-S1 + click-live lane id + lane-null text -> 281 (three tightly related harness-diagnostics bugs); cap-hit last-commit text stays a watch; new doc 209 (208 status/TODO only); grants resources spec + budgets.resources.json + docs, no perf/lib; hard limits (t0/t1/windowEnd/wall-ms/observer/observerSettleMs/snapshot/readyBackingBytes/idleSettleMs/GC wait unchanged); probe before the poll loop, never in the window, smallest RTT, named problem; heapPollMs 50 (never below 25); mutants sign flip, endpoint restored, probe throws; offset-0 control (not adopted: the offset is an epoch value, B uses MU-ORIGIN)',
    'performance-optimizer': '5 probes min RTT, offset = mid - page performance.now(); midpoint predicate; heapPollMs 50 (CDP main-thread work inside the measured window); expected 0 movement at 1x and drop the +-0.1 (not adopted: B measured 65 -> 65.1); midpoint adds ~RTT/50 per edge so R216 stays open (confirmed by measurement); live mutants weak except sign flip, unit-test fixture suggested (not adopted: perf/** outside vitest include, ROOT-REQ-VITEST-PERF-INCLUDE open); fold-in -> separate round 281; ready|failed regex with \\d+; notes from A run, C extends',
    'disagreements': 'headroom (tech-lead yes vs performance-optimizer ~+1): measured +0..+2 -> performance-optimizer; peak movement (performance-optimizer 0 vs queued +-0.1): measured 65.1 -> +-0.1 kept for the two 1x rows (D-29z646/D-29z647)',
    'advisor': 'used before the approach: bookkeeping, GATE279-S1 placement, D-29z254 home, page.ts freeze decides pre-check cost, oracle, equiv script with exceptions proven, measure before widening, consults, claims regenerated'}

# R216 and timeout data
prepend(find(b['open_findings'], 'R216-MEM-POLLS-HEADROOM'), 'dispatched round 280 (b-ii-2, D-29z646): window made correct (page clock, midpoint), headroom measured +0..+2 per export (sum 11/12/11 per run; b-round-279/precheck-equiv-mutants.txt); after C PASS -> watch with doc 209 data, reopen as a task if any run shows mem-polls-1 < 7')
prepend(find(b['open_findings'], 'PERF-1A-TIMEOUT-HEADROOM'), 'data (D-29z644): round 279 PERF-1a 6.4 min (A) and 6.5 min (C) = 43 % of 15 min on two fresh cloud machines; config unchanged, so not closed')
rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['data_round_279'] = 'PERF-1a A 6.4 min, C 6.5 min (43 % of 15 min); B 873d835 run 8.4 min (56 %). Machine variance; still open (D-29z644)'

# gate-279 + A/C notes (D-29z643)
DEF = 'user decision 2026-10-23: open Lows no longer block; fixed in the polish pass before release; final acceptance requires each fixed and C-verified'
b['open_findings'] += [
    {'id': 'GATE279-S1', 'severity': 'medium', 'status': 'open - scheduled round 281 (PERF-HARNESS-DIAG-281, D-29z645)', 'title': 'perf/lib/page.ts waitForCollectionReady waits 15 s for the ready text only; a failed demo source shows copy.failed(n) and the pass aborts on "load" with a generic toHaveText timeout, so "fixture broken" and "wait too slow" look the same', 'source': 'gates/round-279/review.md suggestion 1 (Medium)', 'added': ADDED},
    {'id': 'B-R280-CLICK-LIVE-LANE-ID', 'severity': 'low', 'status': 'open - scheduled round 281 (PERF-HARNESS-DIAG-281, D-29z645)', 'title': 'D-29z254 leftover: the chosen deselect lane id is not written into the interact.harness.click-live detail (round 279 equivalence contract forbade row-field changes; doc 208 l.88)', 'source': 'a-round-279.md known gaps; doc 208 TODO', 'added': ADDED},
    {'id': 'GATE279-S2', 'severity': 'info', 'status': 'watch (D-29z643)', 'title': 'a capped quiet wait while playing may flake on a slower runner (cap hit is now a problem by design); if it shows up, name the last commit in the problem text instead of loosening the cap', 'source': 'gates/round-279/review.md suggestion 2; a-round-279.md code-reviewer #3', 'added': ADDED},
    {'id': 'INFO-C279-LANE-PROBE-TIMEOUT', 'severity': 'info', 'status': 'recorded (cause unconfirmed; method note in round 280 G280-AUTH row)', 'title': "C's lane.cjs attempt 1 waited > 60 s for Demo collection ready on :5173 after mutant runs; attempt 2 passed. Hypotheses: cold dev server, or a Vite re-optimise after symlinked-node_modules builds (not confirmed)", 'source': 'c-round-279.json info', 'added': ADDED},
    {'id': 'B-R280-TASK-2.4-OVERSTATED', 'severity': 'info', 'origin': 'B (claims accuracy; counted at RETRO 290)', 'status': 'recorded', 'title': 'round 279 task section 2.4 said a throw before the try also leaked the poll loop; at 873d835 nothing between the poll-loop start and the try could realistically throw (only the timeOrigin evaluate, observer only). Code change still correct; doc 208 states it right', 'source': 'c-round-279.json INFO-C279-TASK-2.4-OVERSTATED; a-round-279.md code-reviewer #1', 'added': ADDED},
]
b['deferred_low_polish'] += [
    {'id': 'A-R279-REVIEW-LANE-NULL', 'severity': 'low', 'status': 'open - scheduled round 281 with GATE279-S1 (owned code, cheap; D-29z645)', 'title': 'emptyLanePointAfterClip error text reads "lane null" when the clip has no data-track-id (merged with gate-279 suggestion 3)', 'evidence': 'a-round-279.md code-reviewer #2; gates/round-279/review.md suggestion 3; C confirmed (c-round-279.md)', 'repro': 'source read, perf/studio-lab-interactions.perf.spec.ts emptyLanePointAfterClip', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'A-R279-REVIEW-PAGE-STYLE', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'perf/lib/page.ts has a ~105-char line and an out-of-order collection import (Biome does not cover perf/)', 'evidence': 'a-round-279.md code-reviewer #4; C confirmed', 'repro': 'source read', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'A-R279-REVIEW-LIB-EXPORTS', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'waitForQuietState / QuietWaitResult are exported but used only inside perf/lib/page.ts', 'evidence': 'a-round-279.md code-reviewer #5; C confirmed', 'repro': 'grep', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'A-R279-REVIEW-DOC175-STALE', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'doc 175 GATE214-S3 entry still says quotedAttributeValue builds the lane selector; only clipById uses it now', 'evidence': 'a-round-279.md code-reviewer #6; C confirmed doc 175 l.64', 'repro': 'source read', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'GATE279-S4', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'export observer: if observe() succeeded but the evaluate threw before window.__czabaExportObserver was assigned, the observer would stay attached unreported (theoretical; same synchronous block). Optional: assign the handle before observe()', 'evidence': 'gates/round-279/review.md suggestion 4', 'repro': 'source read', 'deferred_reason': DEF, 'added': ADDED},
]
b['architecture_signals'] += [
    {'id': 'A-R279-ARCH-IDLESETTLE-ROLES', 'source': 'a-round-279.md code-reviewer Architecture note', 'text': 'kept measurement-defining waits look like settle waits; idleSettleMs is declared 3 times with two meanings; proposal: rename by role (hookLiveWindowMs, playIdleSettleMs, readyHeapSettleMs), accepted when equivalence shows 0 problems', 'status': 'recorded (not scheduled)', 'added': ADDED},
    {'id': 'GATE279-ARCH-COPY-STRINGS', 'source': 'gates/round-279/review.md suggestion 5 + Architecture note signal 2', 'text': 'perf/lib/app-labels.ts imports app/lib/arrangement/collection.ts at runtime; proposal: move the demo/purchased WorkspaceCollectionCopy objects into app/lib/arrangement/strings.ts and re-export, so the harness no longer imports collection.ts (keep today)', 'status': 'recorded (not scheduled)', 'added': ADDED},
]

b['decisions_log_b'] += [
    {'id': 'D-29z642', 'date': '2026-10-31', 'text': 'Round 279 closed: C PASS (12 rows, browserVerified/realVerified true, 0 bugs), gate 279 published 1dbf3af. PERF-HARNESS-SHARED-LIB-b-ii-1 done. Closed: GATE214-S1, GATE214-S2, GATE223-S2, C-R223-01-GATE214-S2-PREMISE.'},
    {'id': 'D-29z643', 'date': '2026-10-31', 'text': 'Gate 279 and A/C notes: GATE279-S1 (Medium, harness diagnostics) -> round 281; Lows A-R279-REVIEW-PAGE-STYLE, -LIB-EXPORTS, -DOC175-STALE, GATE279-S4 -> deferred_low_polish; A-R279-REVIEW-LANE-NULL (merged gate S3) scheduled 281; watch GATE279-S2; info INFO-C279-LANE-PROBE-TIMEOUT (cause unconfirmed) and B-R280-TASK-2.4-OVERSTATED (origin B); architecture signals A-R279-ARCH-IDLESETTLE-ROLES, GATE279-ARCH-COPY-STRINGS recorded, not scheduled.'},
    {'id': 'D-29z644', 'date': '2026-10-31', 'text': 'TIMEOUT-DATA (A 6.4, C 6.5 min = 43 %) appended to ROOT-REQ-PERF-TIMEOUT and PERF-1A-TIMEOUT-HEADROOM; not closed because the config limit did not change.'},
    {'id': 'D-29z645', 'date': '2026-10-31', 'text': 'Round 280 = PERF-HARNESS-SHARED-LIB-b-ii-2 only (tech-lead; performance-optimizer agrees on a separate round). Round 281 = PERF-HARNESS-DIAG-281: GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL (page.ts + app-labels + interactions spec; 1a + 1b-i re-run). Supersedes execution_order_d29z636.'},
    {'id': 'D-29z646', 'date': '2026-10-31', 'text': 'b-ii-2 design: 5-probe page clock (best RTT, limit 20 ms -> named problem, probe before the poll loop), midpoint predicate on the page clock, endpointRule/clockOffsetMs/clockRttMs/expectedPolls in the mem-polls detail, endSampleLagMs on one clock; heapPollMs 50 and >= 5 unchanged (both consults). R216 headroom measured +0..+2 per export: not claimed; R216 becomes a watch after PASS (reopen if mem-polls-1 < 7).'},
    {'id': 'D-29z647', 'date': '2026-10-31', 'text': 'Round 280 equivalence: oracle b-round-279/head-results-1 (1dbf3af); EQUIV-B2 (b-round-279/scripts/equiv-check-b2.py) with named exceptions only: the notes of the 8 mem-polls/peak-backing rows and res.export.{1,2}.peak-backing-delta-mib +-0.1 (B measured 65 -> 65.1, windowPeakMib 65.1). PERF-1a/1b-i untouched, not re-run.'},
    {'id': 'D-29z648', 'date': '2026-10-31', 'text': 'Docs: new doc 209-perf-export-window-page-clock.md (Completed (C round 280 PASS)); L28 final stage: doc 208 and doc 176 l.4 -> Completed (C round 280 PASS); doc 169 Export metrics section granted whole (L34).'},
    {'id': 'D-29z649', 'date': '2026-10-31', 'text': 'Round 280 outcome table (current-task.md section 11).'},
]
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
