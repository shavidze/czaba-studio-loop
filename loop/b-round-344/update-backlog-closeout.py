# B round 344 -> 345 planning, part 1 (close-out of round 344): backlog v303 -> v304. Once-only. Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-344/update-backlog-closeout.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-344/backlog-before-345.json').exists():
    sys.exit('backup missing')
b = json.load(open('backlog.json'))
assert b['version'] == 303, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 344 -> 345 planning'


def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})


dec('D-29z1084', 'Round 344 (PERF-DRAG-PREVIEW c5-i) closed PASS from C evidence: c-round-344.json taskStatus PASS, browserVerified/realVerified true; passed CLAIMS, SOURCE-SCOPE (4 granted files; budgets.patch reverse-applies; spec.patch fails only on A\'s two strengthened hunks: Undo-entry check in setupVideoClip and setLive moved after the playing drag), PERF (prod, alone: rc 0, complete, 230 rows, 55/55 asserted, 157 EQUAL 0 DIFF 8 NEW = 98.35,100,1,100,1,0,31,1), PREMISE (video stopped move 98.35/move > audio move 22.8), MUTANT (videoGrabWidthPx 5000 -> setup problem, live 0, rc 1), VIDEO-PREMISE (browser 1440 and 1280 equal to B head probe), HARNESS-READ, PERF-LIB 34/34, G344-AUTH (/studio-lab anonymous + demo badge, /studio/middle-east Sign in required 0 audio[src], studio-token 401/400/403), DOCS. Gate 344 published c79642c on both remotes (gate field head 0aa317f is the pre-publish parent). Baseline for round 345 = c79642c. Stage c5-i -> done. New perf oracle c-round-344/perf-results/latest-interactions.json (230 rows); c5-ii value baseline c-round-344/video-rows.txt; behaviour oracle b-round-343/probe/head-*.json and c-round-344/probe/c-*.json.')
dec('D-29z1085', 'Round-344 notes routed: A reviewer Lows A-R344-REVIEW-FAILED-SETUP-STATE, -RATEROWID, -ALL-BUT-RATIO-NAME, -LIVE-SCENARIO, -SEQ-TEXT, -PARTIAL-LIVE -> deferred_low_polish (2026-10-23 rule; C listed them as deferredLowNotes). C-R344-PERF-DURATION / A-R344-PERF-DURATION (durationMs 466839 C, 469442 and 463678 A, bound 450000) is not a loop-fixable Low: the fix is playwright.perf.config.ts (root only); recorded as evidence on ROOT-REQ-PERF-TIMEOUT and closed as a finding into that request. A Architecture note (perf spec 1x tail grows one setup/measure/teardown group per stage; shared withTeardown helper that also cleans a failed setup) -> signal ARCH-R344-WITH-TEARDOWN, joined to ARCH-R339-DRAG-MEASURE-EXTRACT; not scheduled.')

for r in b['rounds']:
    if r.get('round') == 344:
        r['status'] = 'closed PASS (D-29z1084): C 10 rows PASS, browserVerified true; gate published c79642c | ' + r['status']

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1084): stages a .. c5-i done (c5-i C round 344 PASS, c79642c; video move 98.35/move recorded); next c5-ii | ' + st['status']

for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-PERF-TIMEOUT':
        r['status'] = 'open; evidence added at round 344 -> 345 planning (D-29z1085): interactions spec with the c5-i video block took 466839 ms (C round 344), 469442 and 463678 ms (A round 344), above the L31 bound 450000 ms (50 % of 15 min) | ' + r['status']

lows = [
    ('A-R344-REVIEW-FAILED-SETUP-STATE', 'a failed video setup leaves the clip, its Undo entry and the zoom-in keys behind; harmless only because the block runs last (doc 168 item 11 says so)'),
    ('A-R344-REVIEW-RATEROWID', 'video setLive calls use the raw id rather than rateRowId; same at 1x, would collide if the block ever ran at 6x'),
    ('A-R344-REVIEW-ALL-BUT-RATIO-NAME', "'all-but-ratio' means all but commits-per-move; move-components-per-move is also a ratio"),
    ('A-R344-REVIEW-LIVE-SCENARIO', 'the drag-video-live budget row scenario omits "30 audio clips"'),
    ('A-R344-REVIEW-SEQ-TEXT', 'interactionSequence says "1 video clip at 0"; the code checks count and Undo entry, not the start at 0'),
    ('A-R344-REVIEW-PARTIAL-LIVE', 'if Space or waitForPlaybackSettled throws after the stopped drag, the live row keeps the stopped drag 1; the pass still fails through abortedAt'),
]
existing = {x.get('id') for x in b['deferred_low_polish']}
for i, title in lows:
    assert i not in existing, i
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': 'A round 344 code-reviewer', 'title': title, 'evidence': 'a-round-344.md "Findings / known gaps"', 'repro': 'read perf/studio-lab-interactions.perf.spec.ts video block; no user-visible failure (harness only)', 'status': 'deferred_low_polish (D-29z1085)', 'added': ADDED})

for f in b['open_findings']:
    assert f.get('id') not in ('C-R344-PERF-DURATION',), f.get('id')
b['open_findings'].append({'id': 'C-R344-PERF-DURATION', 'severity': 'low', 'origin': 'C round 344 (= A-R344-PERF-DURATION)', 'title': 'interactions perf spec durationMs 466839 above the L31 bound 450000 (50 % of the 15 min spec timeout)', 'evidence': 'c-round-344/perf-results/latest-interactions.json; a-round-344/perf.log', 'status': 'closed into ROOT-REQ-PERF-TIMEOUT (D-29z1085): config file is root-only; evidence recorded there', 'added': ADDED})

assert all(s.get('id') != 'ARCH-R344-WITH-TEARDOWN' for s in b['architecture_signals'])
b['architecture_signals'].append({'id': 'ARCH-R344-WITH-TEARDOWN', 'origin': 'A round 344 code-reviewer Architecture note', 'note': 'perf spec l.1691-1762: the 1x tail gained one setup/measure/teardown group in each of c3-i, c4-i and c5-i; reviewer verdict keep; if another group is added, consider a shared withTeardown helper that also cleans a failed setup', 'status': 'signal (D-29z1085); joined to ARCH-R339-DRAG-MEASURE-EXTRACT; not scheduled', 'added': ADDED})

b['version'] = 304
b['updated'] = ADDED + ' (part 1, close-out)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
