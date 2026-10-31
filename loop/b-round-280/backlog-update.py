# B round 280 -> 281 planning: backlog.json update (evidence-only). Run once: python3 -I backlog-update.py
import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
ADDED = '2026-10-31 B round 280 -> 281 planning'
assert b['decisions_log_b'][-1]['id'] == 'D-29z649', 'already applied?'

def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    raise KeyError(i)

def prepend(o, text):
    o['status'] = text + ' | ' + str(o.get('status', ''))

b['version'] = b['version'] + 1
b['updated'] = ADDED
b['current_task'] = ('current-task.md (round 281, D-29z650..D-29z656; PERF-HARNESS-DIAG-281, test-only: waitForCollectionReady waits for ready OR failed '
    '(perfCollectionSettledPattern), throws "<label>: demo collection failed: <status>" (recorded once by the spec catch) or "...status is not ready...", '
    'emptyLanePointAfterClip returns clipTrackId/trackId with null guards (no "lane null"), click-live detail +clipTrackId +emptyLaneTrackId; '
    'baseline 145f6c1 clean; grants b-round-280-r281-grants.txt; frozen b-round-280-r281-tree-sha256.txt (1137); oracle c-round-279/results-1 (1a + 1b-i, code identical); '
    'mutants MU-FAILED-SOURCE, MU-READY-ONLY, MU-NO-OWN-GUARD)')

EV = 'C round 280 PASS (c-round-280.json, browserVerified/realVerified true, 13 rows, 0 bugs) + gate 280 published 145f6c1 (both remotes)'
r280 = [r for r in b['rounds'] if r.get('round') == 280][0]
r280['status'] = 'done (D-29z650): ' + EV
b['rounds'].append({'round': 281, 'task': 'current-task.md', 'decision': 'D-29z650..D-29z656', 'status': 'dispatched',
    'type': 'STUDIO-PERFORMANCE PERF-HARNESS-DIAG-281 (GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL), test-only',
    'note': 'baseline 145f6c1 clean (1144 tracked); grants 8 (1 new doc 210); frozen 1137; browser probe at HEAD: aborted middle-east.mp3 -> "1 sound in the demo collection failed to load ..." at ~2.3 s, stable 15 s; '
            'B sketch v1 perf run 2 passed 12.1 min (1a 6.8, 1b-i 5.1), equiv vs c-round-279/results-1: 1a 0 problems, 1b-i 0 problems; click-live music/stems in 6/6; final sketch tsc rc 0; '
            'MU-NO-OWN-GUARD tsc TS2322; runtime mutants: b-round-280/mutants-summary.txt',
    'next': 'C PASS + gate -> round 282 = REGRESSION if planned on/after 2026-11-02, else PERF-2 (consults first)',
    'added': ADDED})

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
prepend(find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b-ii-2'), f'done (D-29z650): {EV}; rows PERF-RUN, EQUIV, CLOCK-DATA, MUTANTS, G280-AUTH ran in the browser')
prepend(find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b-ii'), 'done (D-29z650): b-ii-1 (round 279, 1dbf3af) + b-ii-2 (round 280, 145f6c1), both C PASS with browser')
prepend(find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b'), 'done (D-29z650): b-i (rounds 224-225) + b-ii (rounds 279-280), all C PASS browserVerified=true and published')
prepend(find(sp['stages'], 'PERF-HARNESS-DIAG-281'), 'dispatched round 281 (D-29z652): design consults tech-lead + performance-optimizer; equivalence D-29z653')
prepend(sp, 'in_progress (D-29z652): PERF-HARNESS-SHARED-LIB-b done (round 280); round 281 = PERF-HARNESS-DIAG-281; then REGRESSION if due (on/after 2026-11-02), then PERF-2.. per execution_order_d29z645')
sp['consults_round_281'] = {
    'tech-lead': 'sketch correct; throw only (the spec catch records "aborted at load: ..." once; push + throw doubled it); no race (failed/ready terminal during a load); null-guard order closes "lane null" without assertions; '
                 'resources spec out of scope (different ready signal) -> signal; change notes only if the lane is not Stems; MU-FAILED-SOURCE must abort well inside 15 s, add tsc mutant for the own-lane guard; new doc 210 linking 208',
    'performance-optimizer': 'the extra textContent read cannot move rows (load.* measured before, quiet wait starts after); equiv-check ignores details -> check the two keys separately; guard an unexpected status (matches neither) instead of continuing; '
                             'no 1b-ii re-run (no call site); two string detail keys are safe',
    'disagreements': 'none material; both adopted (throw-only from tech-lead, ready guard from performance-optimizer)',
    'advisor': 'used before the approach: bookkeeping from evidence, baseline 145f6c1, singular/plural regex, throw path must surface the named text, lane-id typing, re-run scope and oracle reuse, docs 210, L38 amendment in place'}

for i in ('GATE279-S1', 'B-R280-CLICK-LIVE-LANE-ID'):
    prepend(find(b['open_findings'], i), 'dispatched round 281 (PERF-HARNESS-DIAG-281, D-29z652)')
prepend(find(b['deferred_low_polish'], 'A-R279-REVIEW-LANE-NULL'), 'dispatched round 281 (PERF-HARNESS-DIAG-281, D-29z652)')

# R216 -> watch with data
prepend(find(b['open_findings'], 'R216-MEM-POLLS-HEADROOM'), 'watch (D-29z650): round 280 done; C run Sigma 11, +0..+2 per export, lowest 1x mem-polls-1 = 9 (>= 7); doc 209 has the ranges; reopen as a task if any run shows mem-polls-1 < 7')
prepend(find(b['open_findings'], 'PERF-1A-TIMEOUT-HEADROOM'), 'data (D-29z651): B round-281 sketch run PERF-1a 6.8 min = 45 % of 15 min; config unchanged, not closed')
rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['data_round_280_planning'] = 'B sketch run at 145f6c1 (round 281 planning): PERF-1a 6.8 min (45 %), PERF-1b-i 5.1 min; still open (D-29z651)'

# gate-280 review + A/C notes (D-29z651)
DEF = 'user decision 2026-10-23: open Lows no longer block; fixed in the polish pass before release; final acceptance requires each fixed and C-verified'
b['deferred_low_polish'] += [
    {'id': 'GATE280-S1', 'severity': 'low', 'status': 'open - Lows batch (resources spec; feeds the R216 watch)', 'title': 'the export heap-sample midpoint is a guess at the read time: under 6x the CDP round trip can exceed 50 ms and Runtime.getHeapUsage waits in the main-thread queue, so a sample read just after windowEnd can count; add per-sample round-trip stats (max, median of receivedAt - sentAt) to the mem-polls-N detail', 'evidence': 'gates/round-280/review.md finding 1', 'repro': 'source read perf/studio-lab-resources.perf.spec.ts l.207-210; doc 209 6x table', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'GATE280-S2', 'severity': 'low', 'status': 'open - Lows batch (optional)', 'title': 'the page-clock probe uses page.evaluate while the heap polls use cdp.send; any delay difference between the channels lands in offsetMs (measured -0.6..-2.2 ms); optional: probe with cdp.send Runtime.evaluate', 'evidence': 'gates/round-280/review.md finding 2', 'repro': 'source read l.186-199', 'deferred_reason': DEF, 'added': ADDED},
]
b['open_findings'] += [
    {'id': 'GATE280-S3', 'severity': 'info', 'status': 'recorded (note; windows are seconds long)', 'title': 'Node Date.now() (wall clock, can jump) vs page performance.now() (monotonic) in the clock probe; possible later fix: performance.now() + performance.timeOrigin on the Node side', 'source': 'gates/round-280/review.md finding 3', 'added': ADDED},
    {'id': 'GATE280-S4', 'severity': 'info', 'status': 'acknowledged (by design, D-29z646: named problem, no silent fallback)', 'title': 'a probe over 20 ms is reported but its offset is still used', 'source': 'gates/round-280/review.md finding 4', 'added': ADDED},
    {'id': 'A-R280-REVIEW-KEY-NAMES', 'severity': 'info', 'status': 'ruled (D-29z651): keep clockOffsetMs and endpointRule; the names are fixed by the round-280 contract, doc 209 and B/C scripts read them', 'title': 'code-reviewer L1/L2: clockOffsetMs resembles clock.offsetMs; endpointRule holds a count', 'source': 'a-round-280.md code review', 'added': ADDED},
    {'id': 'INFO-C280-AUTH-COLD-START', 'severity': 'info', 'status': 'recorded (2x with INFO-C279-LANE-PROBE-TIMEOUT); lesson L38 amended (D-29z656): warm /studio-lab once (untimed) after perf builds or mutant runs before a timed browser probe', 'title': 'the first /studio-lab load after the perf builds took > 150 s to reach Demo collection ready; replacement attempt passed in 5.6 s', 'source': 'c-round-280.json notes', 'added': ADDED},
    {'id': 'INFO-C280-MU-PROBE-THROW-TSC', 'severity': 'info', 'status': 'recorded (method note: tsc is not a gate for that mutant)', 'title': 'the MU-PROBE-THROW mutant copy fails tsc (unreachable narrowing); Playwright does not typecheck, the runtime signal is exact', 'source': 'c-round-280.json notes', 'added': ADDED},
    {'id': 'B-R281-RESOURCES-READY-FAILED', 'severity': 'low', 'status': 'signal (D-29z652; not scheduled): tech-lead (b) - different ready signal, a change would not be byte-identical', 'title': 'PERF-1b-ii waits for its own ready signal (library Add enabled + waveform); with a failed demo source it still times out generically instead of naming the failed source', 'source': 'round 281 planning consults', 'added': ADDED},
]
b['architecture_signals'] += [
    {'id': 'GATE280-ARCH-PAGE-CLOCK-HELPERS', 'source': 'gates/round-280/review.md Architecture note (signal 3: measureExport reworked in rounds 216, 217, 279, 280) + a-round-280.md code-reviewer Architecture note', 'text': 'PageClock, probePageClock and heapSamplesInWindow are generic Node<->page clock helpers inside the resources spec; keep for now (perf/lib frozen by scope, one user, mutant-covered); when a second spec needs a page clock, one bounded task moves them to perf/lib/page.ts with unit tests once ROOT-REQ-VITEST-PERF-INCLUDE is resolved', 'status': 'recorded (not scheduled)', 'added': ADDED},
]

b['decisions_log_b'] += [
    {'id': 'D-29z650', 'date': '2026-10-31', 'text': 'Round 280 closed: C PASS (13 rows, browserVerified/realVerified true, 0 bugs), gate 280 published 145f6c1. PERF-HARNESS-SHARED-LIB-b-ii-2 done; PERF-HARNESS-SHARED-LIB-b-ii and PERF-HARNESS-SHARED-LIB-b done (feature boundary). R216-MEM-POLLS-HEADROOM -> watch (C lowest 1x mem-polls-1 = 9).'},
    {'id': 'D-29z651', 'date': '2026-10-31', 'text': 'Gate 280 review and A/C notes: GATE280-S1, GATE280-S2 (Low) -> deferred_low_polish; GATE280-S3, GATE280-S4 info; finding 5 already tracked (ROOT-REQ-VITEST-PERF-INCLUDE + lint scope); Architecture note -> signal GATE280-ARCH-PAGE-CLOCK-HELPERS (merged with A round-280 note); A L1/L2 key names kept (A-R280-REVIEW-KEY-NAMES); INFO-C280-AUTH-COLD-START (2x), INFO-C280-MU-PROBE-THROW-TSC recorded; timeout data appended.'},
    {'id': 'D-29z652', 'date': '2026-10-31', 'text': 'Round 281 = PERF-HARNESS-DIAG-281 design: perfCollectionFailedPattern from failed(1)/failed(2) with \\d+, perfCollectionSettledPattern; waitForCollectionReady throws "<label>: demo collection failed: <status>" (throw only, tech-lead) or "...status is not ready..." (performance-optimizer); EmptyLanePoint with null guards, click-live detail +clipTrackId +emptyLaneTrackId (measured music/stems; notes unchanged). Resources spec out of scope -> B-R281-RESOURCES-READY-FAILED.'},
    {'id': 'D-29z653', 'date': '2026-10-31', 'text': 'Round 281 equivalence: oracle c-round-279/results-1 latest.json + latest-interactions.json (specs, perf/lib, budgets, config and app byte-identical 1dbf3af..145f6c1); equiv-check.py 0 problems; the only allowed difference is the two click-live detail keys (checked separately); PERF-1b-ii not re-run (no call site).'},
    {'id': 'D-29z654', 'date': '2026-10-31', 'text': 'Round 281 docs: new 210-perf-harness-load-diagnostics.md (Completed (C round 281 PASS)); doc 208 l.88 and doc 209 l.87 TODO bullets; doc 175 helper-map and GATE214-S2 sections (L34) + TODO bullet; doc 168 Liveness section + TODO bullet.'},
    {'id': 'D-29z655', 'date': '2026-10-31', 'text': 'Round 281 outcome table (current-task.md section 11): PASS -> round 282 REGRESSION if planned on/after 2026-11-02, else PERF-2.'},
    {'id': 'D-29z656', 'date': '2026-10-31', 'text': 'lessons.md L38 amended in place: warm /studio-lab once (untimed) after perf builds or mutant runs before a timed browser probe; a cold-start timeout is environment-invalid, kept and replaced (INFO-C279-LANE-PROBE-TIMEOUT, INFO-C280-AUTH-COLD-START, 2x). Line count unchanged (60).'},
]
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
