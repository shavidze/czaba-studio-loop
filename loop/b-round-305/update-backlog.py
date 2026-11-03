# B round 305 -> 306 planning: one-shot backlog edit. Refuses to run twice.
import json, sys
P = 'backlog.json'
b = json.load(open(P))
if any(d.get('id') == 'D-29z807' for d in b['decisions_log_b']):
    sys.exit('already applied')
D = '2026-11-03'
ADDED = '2026-11-03 B round 305 -> 306 planning'
b['version'] = 265
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 306, D-29z807..D-29z811; PERF-3d viewport-gated waveform columns + GATE304-M2/L3 + C-R304-02 + RT-FIX SR-305-4; baseline adf959d, frozen 1176, 7 modified + 2 new granted)'
b['decisions_log_b'] += [
 {'id': 'D-29z807', 'date': D, 'text': 'Round 305 closure from C evidence (c-round-305.json: FAIL, browserVerified/realVerified true; 9 rows passed, RT-SCREEN failed on C-R305-01 only; gate 305 skipped). RETRO 305 accepted except SR-305-4: B reworded it in user-review/screen-review-305.md (density, not truncation; C measurement cited) and added C\'s SR-305-3 note ("Nothing to play — add a clip from the library first."); before-copy + diff in b-round-305/. C re-checks only those lines in round 306 (RT-FIX). Baseline stays adf959d (gate 304).'},
 {'id': 'D-29z808', 'date': D, 'text': 'PERF-3d mechanism: viewport gating on the existing timeline page window (readTimelinePage/timelinePageWindow + subscribeTimelineScroll, as the rulers since PERF-3b). Premise re-measured (L37): crossing = script-bound (84 ms script, 14 forced layout); toFixed build 32-55 ms, setAttribute 12-15 ms for 30 clips; only 1-2 clips in view. performance-optimizer + tech-lead: (a) integer path alone 65-75 ms (fails) and needs 4 test grants; (d) 2048 cap ~70 ms; (b) per-source cache flatters the Ctrl+D scenario; startTransition rejected (second commit). Sketch: crossing keys 16-24 ms, LoAF 0, commits 1, components 247 (= HEAD), visible d byte-identical, full suite 3449/3449.'},
 {'id': 'D-29z809', 'date': D, 'text': 'GATE304-M2: interact.zoom.30.out.path-rewrites == 3 and wheel.path-rewrites == 2 (values of b-round-305/perf-sketch-run1.json and run2.json, 3 samples each); notes rewritten. GATE304-L3: probe-connected sentence on 7 keydown/LoAF rows (premise: measureZoom runs without the probe). C-R304-02: interactionSequence entry text. All three close only on C round 306 PASS.'},
 {'id': 'D-29z810', 'date': D, 'text': 'PERF-3d rulings: per-clip boolean useSyncExternalStore snapshot; off-window clips keep their last column count (adjust-state-during-render, no ref writes in render); unmeasured viewport = in window; inclusive edges; vertical axis not gated (signal PERF-3D-VERTICAL-GATE); buildPeakShape/ArrangementPeakPath byte-identical; doc 222 ## მიდგომა one line (L34); doc 223 new. GATE304-INFO-REMOUNT considered: not added (PERF-3d keeps the svg mounted); kept as a harness candidate with PERF-3D-SCROLL-HARNESS-ROW.'},
 {'id': 'D-29z811', 'date': D, 'text': 'No frontend-architect checkpoint for round 306 (one bounded change, one prop chain). A bounded checkpoint request is due at the end of STUDIO-PERFORMANCE (feature boundary): StudioWorkspace.tsx size, the prop chain StudioWorkspace -> ArrangementLane -> ArrangementClipView, GATE304-ARCH-ZOOM-LIVE-RULE, B-R303-PERF-HARNESS-METRIC-FAMILY. Retro candidate RC-R305-CAPTURE-TEXT-SLICE added (C-R305-01 root cause).'},
]
b['open_findings'] += [
 {'id': 'C-R305-01', 'severity': 'low', 'origin': 'B (screen review written from capture JSON truncated at 120 chars)', 'title': 'SR-305-4 said the add status is cut at 1440; it is not (scrollWidth == clientWidth at 1440 and 1280)', 'source': 'c-round-305.json bugs[0]', 'status': 'fixed_by_B_pending_C (D-29z807): SR-305-4 reworded, SR-305-3 note added; RT-FIX row in round 306', 'added': ADDED},
 {'id': 'INFO-C305-SR3-NOTHING-TO-PLAY', 'severity': 'info', 'origin': 'C', 'title': 'Play on the empty arrival writes "Nothing to play — add a clip from the library first."; the review did not mention it', 'source': 'c-round-305.md Notes; c-round-305/screens/sr-probe.json', 'status': 'folded into SR-305-3 (D-29z807); RT-FIX checks it', 'added': ADDED},
 {'id': 'INFO-C305-AUTH-ATTEMPTS', 'severity': 'info', 'origin': 'environment', 'title': 'G305-AUTH attempt 1 cold-start timeout, attempt 2 crashed with output lost; attempts 3-4 passed', 'source': 'c-round-305.md Notes', 'status': 'recorded (L38 warm-up already covers it)', 'added': ADDED},
]
for f in b['open_findings']:
    if f.get('id') == 'GATE304-INFO-REMOUNT':
        f['status'] = 'considered (D-29z810): not added in PERF-3d (svg stays mounted); harness candidate with PERF-3D-SCROLL-HARNESS-ROW | ' + f['status']
    if f.get('id') in ('GATE304-M2-EQ60-TRIPWIRE', 'GATE304-L3-PROBE-IN-WINDOW', 'C-R304-02'):
        f['status'] = 'dispatched round 306 (D-29z809); closes on C PASS | ' + f['status']
for s in b['screen_review_candidates']:
    if s.get('id') == 'SR-305-4':
        s['what'] = 'add status sentence carries five facts in one sentence (density; C round 305: not truncated at 1440 or 1280) -> shorten, keeping "audio is not stretched" (SABA-B-8)'
        s['note_d29z807'] = 'reworded after C-R305-01; was "truncates at 1440"'
    if s.get('id') == 'SR-305-3':
        s['note_d29z807'] = 'Play on the empty arrival also writes "Nothing to play — add a clip from the library first." (C round 305)'
for r in b['retro_runs']:
    if r.get('round') == 305:
        r['c_result'] = 'C round 305 FAIL on one Low against the screen review (C-R305-01, origin B); all RT number/cause/id/lesson rows PASS; RT-FIX in round 306 (D-29z807)'
b['retro_candidates'].append({'id': 'RC-R305-CAPTURE-TEXT-SLICE', 'text': 'a screen-review claim about truncation or overflow rests on the screenshot or an untruncated DOM measurement (scrollWidth vs clientWidth), never on capture JSON that slices text (capture.mjs textLines slice(0,120))', 'status': 'candidate for RETRO 320 (D-29z811); evidence C-R305-01 (1x)', 'added': ADDED})
b['architecture_signals'] += [
 {'id': 'PERF-3D-VERTICAL-GATE', 'source': 'performance-optimizer + tech-lead consults, round 305 -> 306 planning', 'text': 'PERF-3d gates waveform rebuilds on the horizontal page window only; many stacked lanes would all count as visible. Gate vertically too if a many-lane scenario shows crossing cost', 'status': 'signal (D-29z810)', 'added': ADDED},
 {'id': 'PERF-3D-SCROLL-HARNESS-ROW', 'source': 'performance-optimizer consult', 'text': 'perf harness rows for scroll after a crossing (rewrites <= 1 per clip, commits = stale-entry events) and a distinct-sources 30-clip variant; today covered by C browser rows and WG0-WG4', 'status': 'candidate (D-29z810)', 'added': ADDED},
]
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        q['status'] = 'in_progress (D-29z808): RETRO 305 done (C FAIL Low only, RT-FIX 306); PERF-3d dispatched round 306 | ' + q['status']
        for s in q['stages']:
            if s.get('id') == 'PERF-3':
                s['status'] = 'in_progress (D-29z808): 3a/3b/3c done; 3d dispatched round 306 (viewport-gated waveform columns; sketch meets the exit) | ' + s['status']
            if s.get('id') == 'PERF-3d':
                s['status'] = 'dispatched round 306 (D-29z808..D-29z810): viewport gating on the timeline page window; budgets out 3 / wheel 2; GATE304-M2/L3 + C-R304-02 in scope; evidence b-round-305/ | ' + s['status']
                s['premise_round_305'] = 'b-round-305/probe/*.json: crossing up keydown 104 ms, LoAF 90 (script 84, forced 14); sketch 16-24 ms, LoAF 0, rewrites out [0,0,1,1,0,0,0,1,0,0] / wheel [0,0,0,1,0,0,1,0,0,0]'
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
