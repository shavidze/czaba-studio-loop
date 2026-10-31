# B round 284 -> 285 planning: backlog update (runs once). Evidence: c-round-284.json PASS (browserVerified/realVerified true), gates/gate-round-284.json published 0f99960.
import json
P = 'backlog.json'
b = json.load(open(P))
DATE = '2026-10-31'
ADDED = '2026-10-31 B round 284 -> 285 planning'
assert not any(d.get('id') == 'D-29z681' for d in b['decisions_log_b']), 'already applied'
def find(key, fid):
    for f in b[key]:
        if isinstance(f, dict) and f.get('id') == fid:
            return f
    return None
def prepend(f, text):
    f['status'] = text + ' | ' + str(f.get('status', ''))
sp = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'STUDIO-PERFORMANCE')
st = {s['id']: s for s in sp['stages'] if isinstance(s, dict) and 'id' in s}
prepend(st['PERF-3a'], 'done (D-29z681): C round 284 PASS (c-round-284.json, 13 rows passed, browserVerified/realVerified true; ZOOM-PATH-IN 0 vs HEAD 60, ZOOM-PATH-OUT 60 vs HEAD 300, WAVE-PIXELS/ENVELOPE-ZOOM both viewports) + gate 284 published 0f99960 (both remotes)')
prepend(st['PERF-3b'], 'dispatched round 285 (D-29z683..D-29z687): seconds ruler page window shared with the bars ruler (view.ts helpers), windowed rulerTickMarks; B sketch: ruler 6143 -> 94 elements at 40 px/s with 30 clips, key-5 Event Timing 112 -> 16 ms, 28/28 ruler screenshots per viewport pixel-identical to HEAD; harness rows moved to PERF-3c (D-29z685)')
st['PERF-3b']['measured_d29z683'] = 'HEAD 0f99960 prod, 30 clips: ruler 6143 elements at 40 px/s, 12286 at 122.1 px/s (+6142 on key 5), 0 ruler churn in 6 s Follow playback and on scroll jumps; sketch: 94/76/62/50/40/64 elements over the in path (1440), 78.. at 1280, Event Timing 16 ms on every in key, out path max 48 ms (band-crossing key 8), follow at ~298 px/s: 5-16 ruler nodes per page flip, jump: 94-140 elements; evidence b-round-284/probe-results/, imgdiff-{1440,1280}.json'
sp['stages'].append({'id': 'PERF-3c', 'what': 'perf harness rows for zoom (Event Timing p95 per zoom key with 30 clips, waveform path rewrites per key, ruler nodes per key, Ctrl+wheel zoom baseline from scope_addition_d29z215, res.dom.ruler-1/2 note update) + the PERF-3 exit decision (p95 < 50 ms with 30 clips; <= 1 commit per step); doc 212/213 l.4 -> Completed', 'status': 'not_started (queued D-29z685; stage 3 of 3 of PERF-3; after PERF-3b C PASS, REGRESSION first when due)', 'added': ADDED})
prepend(st['PERF-3'], 'in_progress (D-29z685): PERF-3a done (round 284, 0f99960); PERF-3b dispatched round 285; PERF-3c (harness rows + exit target) queued; 3 stages')
prepend(sp, 'in_progress (D-29z685): PERF-3a done (round 284); round 285 = PERF-3b; then REGRESSION if due (on/after 2026-11-02), then PERF-3c; RETRO at 290')
sp['consults_round_285'] = {
    'tech-lead': 'option (a): move readBarsRulerPage/barsRulerPageKey/parseBarsRulerPageKey into view.ts as exported pure helpers + timelinePageWindow; rulerTickMarks(seconds, px, window?) like barsRulerMarks; new ArrangementRuler props optional (view.test mounts the ruler without them); no checkpoint: the seconds ruler is not a fourth consumer of getTimelineView (overview, ruler, tempo row already); test risks: only view.test ruler mount (type) and perf res.dom.ruler-1/2 (record) change; add a UI windowing test modelled on tempo-window-ui',
    'performance-optimizer': 'share the page window; compute an index range instead of building and filtering every tick; CSS gradient lines save nothing (each tick has a label); one commit per zoom step holds because getTimelineView returns pendingViewRef during render; recommended a capped fallback for an unknown viewport (rejected by B, D-29z684); p95 < 50 with n=10 and 8 ms granularity is the maximum, so keep it record or gate on the median (adopted: record in 3b, decided in 3c)',
}
of = b['open_findings']
tr = find('open_findings', 'ROOT-R70-ARCH-TIMELINE-TRIO')
prepend(tr, 'signal updated (D-29z687): round 285 shares the page helpers (view.ts) between the seconds and bars rulers and passes getTimelineViewportPx/subscribeTimelineScroll to the seconds ruler; tech-lead: not a fourth consumer (overview, ruler, tempo row already take getTimelineView); no checkpoint requested')
dl = b['deferred_low_polish']
def add_low(d):
    assert find('deferred_low_polish', d['id']) is None, d['id']
    d.setdefault('added', ADDED)
    dl.append(d)
add_low({'id': 'A-R284-REVIEW-NEG-LOOP', 'severity': 'low', 'status': 'deferred', 'title': 'waveformPeakColumns(-12, -40) never returns (both arguments negative: pixelsPerBucket < 0 keeps the while condition true); unreachable in the app (only caller ArrangementClip.tsx, clampTimelineZoom keeps px/s >= 0.5, durations positive)', 'evidence': 'c-round-284/neg-loop.txt (timeout rc 124); a-round-284.md review item 1', 'repro': 'node --experimental-strip-types: import waveformPeakColumns from app/lib/arrangement/peaks.ts; waveformPeakColumns(-12, -40)', 'fix': 'guard !(pxPerSecond > 0) || !(duration > 0) -> 0, plus ZQ2 row [-12, -40, 0]', 'deferred_reason': 'Low (D-29z682): round 285 does not own peaks.ts; fix in the polish pass or with the next round that owns peaks.ts (PERF-14 multi-resolution peaks)'})
add_low({'id': 'A-R284-REVIEW-ZQ3-VACUITY', 'severity': 'low', 'status': 'deferred', 'title': 'ZQ3 in clip-envelope-ui.test.tsx reads before = polyline?.getAttribute(points) without asserting it exists; a missing polyline would pass the per-zoom compare vacuously (viewBox, node identity and 0 mutation records make a miss unlikely)', 'evidence': 'c-round-284.json bugs[1]; clip-envelope-ui.test.tsx l.1054, l.1068', 'repro': 'read ZQ3', 'fix': 'expect(before).toBeTruthy()', 'deferred_reason': 'Low/info (D-29z682): round 285 does not own clip-envelope-ui.test.tsx'})
lp = find('open_findings', 'DEFERRED-LOW-POLISH')
n_open = sum(1 for x in dl if not str(x.get('status', '')).startswith('closed'))
lp['count_round285_note'] = f'B round 284 -> 285 planning: +A-R284-REVIEW-NEG-LOOP, +A-R284-REVIEW-ZQ3-VACUITY ({len(dl)} entries, {n_open} not closed)'
for r in b['rounds']:
    if r.get('round') == 284:
        r['status'] = 'done (D-29z681): C PASS (c-round-284.json, browserVerified/realVerified true, 13 rows passed, ZOOM-TIMING record), gate 284 published 0f99960 (both remotes); 2 Lows A-R284-REVIEW-NEG-LOOP, A-R284-REVIEW-ZQ3-VACUITY -> deferred_low_polish'
b['rounds'].append({'round': 285, 'task': 'current-task.md', 'decision': 'D-29z681..D-29z689', 'status': 'dispatched', 'type': 'STUDIO-PERFORMANCE PERF-3b (seconds ruler page window; stage 2 of 3 of PERF-3)', 'note': 'baseline HEAD 0f99960 clean; grants 6 M (= b-round-284/sketch.diff, sketch-sha256.txt) + doc 213 new + doc 212 l.4; B scratch: 20 files / 468 tests PASS, tsc 0, Biome clean; mutants HEADRULER/W1..W6 red (b-round-284/mutants.txt); browser HEAD vs sketch: ruler 6143 -> 94 elements, key-5 Event Timing 112 -> 16 ms, ruler screenshots identical 28/28 per viewport', 'added': ADDED})
b['current_task'] = 'current-task.md (round 285, D-29z681..D-29z689; PERF-3b: seconds ruler renders only the three-viewport page window shared with the bars ruler; view.ts gains readTimelinePage/timelinePageKey/parseTimelinePageKey/getServerTimelinePageKey/timelinePageWindow + windowed rulerTickMarks; ArrangementRuler subscribes via optional getTimelineViewportPx/subscribeTimelineScroll; tick testid arrangement-ruler-tick + data-time; 6 files byte-identical to b-round-284/sketch.diff + doc 213 new + doc 212 l.4; rows RW1-RW3, SR1-SR5; mutants HEADRULER/W1..W6; C browser rows RULER-NODES-IN/OUT, RULER-PIXELS, RULER-FOLLOW-FLIP, RULER-JUMP, FOLLOW-IDLE, BARS-REGRESSION, ZOOM-TIMING record, PERF-RUN, G285-AUTH)'
b['updated'] = ADDED
for did, text in [
    ('D-29z681', 'Round 284 closed: C PASS (c-round-284.json, browserVerified/realVerified true, 13 rows) and gate 284 published 0f99960 on both remotes. PERF-3a done (mzadaa). PERF-3 stays in_progress.'),
    ('D-29z682', "Ruling on A's L10 request (a-round-284.md): A-R284-REVIEW-NEG-LOOP (C reproduced, rc 124) and A-R284-REVIEW-ZQ3-VACUITY go to deferred_low_polish; round 285 does not own peaks.ts or clip-envelope-ui.test.tsx (2026-10-23 bug gate: a Low is fixed early only when the round already owns the code). C note on the task 2.1 prose '[6.25, 25]': acknowledged; code, ZQ2 and doc 212 agree on (6.25, 25]; no action."),
    ('D-29z683', 'PERF-3b design: the three private bars-ruler page helpers move to view.ts as exported pure functions (readTimelinePage, timelinePageKey, parseTimelinePageKey, getServerTimelinePageKey) plus timelinePageWindow; rulerTickMarks takes an optional window and builds only an index range (the result equals the full list filtered to the window: RW1); ArrangementRuler subscribes to the page key (optional props getTimelineViewportPx/subscribeTimelineScroll, passed by StudioWorkspace); ticks gain data-testid arrangement-ruler-tick and data-time for tests and C. Rejected: CSS gradient lines (every tick has a label; no saving), tiles with hysteresis (the 3-viewport page window already has it: in-page scroll renders nothing, SR3), duplicating the helpers (drift).'),
    ('D-29z684', "Unknown viewport (SSR and an unmeasured scroller): the seconds ruler renders every tick, the same rule as the bars ruler today. performance-optimizer's capped fallback rejected: it changes the bars ruler (out of scope), breaks the jsdom rows that rely on the full render (BU1, SR1, tempo-ui), and in the browser the window replaces the full render at mount (ResizeObserver notifies, claims K8; probe start count 94 at 1440 and 78 at 1280). SSR renders an empty project (short ruler)."),
    ('D-29z685', 'PERF-3 split into 3 stages without shrinking: 3a (done), 3b (round 285: ruler window, code + unit + C browser rows), 3c (harness rows: Event Timing p95 per zoom key, path rewrites, ruler nodes per key, Ctrl+wheel baseline of scope_addition_d29z215, res.dom.ruler-1/2 notes; exit decision). Reason: 3c changes the perf harness contract (perf/**, doc 163 section, 10.8-min perf runs) and is its own verifiable stage. Doc 212 l.4 is granted to "In Progress (stage 1 of 3; C round 284 PASS)"; doc 213 l.4 is "In Progress (stage 2 of 3; C round 285 PASS)" (L28).'),
    ('D-29z686', 'Round 285 browser contract: C builds HEAD 0f99960 and A tree as production builds (own port and cacheDir, warm-up, alone) and runs b-round-284/ruler-probe.cjs and imgdiff.cjs unchanged in counting at 1440x900 and 1280x720: RULER-NODES-IN/OUT, RULER-PIXELS, RULER-JUMP, RULER-FOLLOW-FLIP, FOLLOW-IDLE, BARS-REGRESSION; ZOOM-TIMING record; PERF-RUN once alone; G285-AUTH.'),
    ('D-29z687', 'ROOT-R70-ARCH-TIMELINE-TRIO updated: the page helpers become shared; tech-lead: the seconds ruler is not a fourth consumer of getTimelineView, so the keep-until-fourth-consumer trigger is not met; no frontend-architect checkpoint requested this round.'),
    ('D-29z688', 'Round 285 is a pure performance round: reference-first, AGREE, product-designer, the screen budget and Ableton conformity do not apply (no visible change; the ruler pixels are identical to HEAD by RULER-PIXELS). The new tick attributes are not visible.'),
    ('D-29z689', 'regression-last.json unchanged (2026-10-30, round 258 sweep); next REGRESSION due on/after 2026-11-02; RETRO at 290. No lesson changed this planning (no new failure class in round 284; the band prose note is 1x and covered by L29 claims).'),
]:
    b['decisions_log_b'].append({'id': did, 'date': DATE, 'text': text})
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']))
