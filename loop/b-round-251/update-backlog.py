# B round 251 -> 252 planning: backlog edits. Run from the loop root: python3 -I b-round-251/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 251 -> 252 planning'
b['updated'] = '2026-10-29 (B round 251 -> 252 planning, D-29z452..D-29z460)'
b['current_task'] = ('current-task.md (round 252, D-29z452..D-29z460; SABA-B-10a stage 2b, the final 10a stage: item 0 IM22 playing assert (A-R251-REVIEW-IM22-PLAYING, Medium); '
                     'item 1 Follow pause on a bars lower-zone / seconds-ruler click while playing, resume on a scrub-strip click and on Stop (C-R235-02, Live 12 manual 6.2); '
                     'item 2 Ctrl+Left/Right from the insert marker while stopped + state-specific none text (B-R250-NAV-ORIGIN); item 3 ruler/range titles (B-R250-PLAYHEAD-TITLES); '
                     'item 4 at-end wording (B-R251-PASTEND-AT-END, B-R236-END-WORDING); doc 191 Completed; baseline HEAD 83b7c75 clean; frozen 1097; grants 13)')
adv = ('2026-10-29 round 251 -> 252 planning: advisor available and consulted after orientation (before writing) and before declaring done. '
       'Advice followed: snapshots before edits (b-round-251/*-before-252); REGRESSION arithmetic (2 days, not due); closures only from C PASS + published gate 251; '
       'flake not reproduced at gate 251; IM22 folded as item 0 with a playing-line red-proof; Follow logic at the StudioWorkspace call sites, not the context; '
       're-fetched the manual tail (TOC only) and grepped the transcripts; NAV-ORIGIN via getLocatorPosition; L23 pre-check of copy collisions; '
       'SABA-Q-TIME-RULER-ROLE kept awaiting_user; doc 176 tied to PERF; L52 added; ARCH checkpoint request at the 10a/10b boundary. '
       'Deviation from the advice: the advisor suggested a lane click might resume Follow; B parses 6.2 "the Arrangement or clip scrub area" as two scrub areas, so the lane is unchanged (inference, recorded). | ')
b['advisor_used_by_B'] = adv + b['advisor_used_by_B']
dec = [
 ('D-29z452', 'Round 251 closed as C PASS (c-round-251.json: taskStatus PASS, browserVerified and realVerified true; 17 rows passed; purchased origin BLOCKED backend). Gate 251 published 83b7c756ce3108d0e31f023a1aa2b0e59547d913 (rounds 250-251) on both remotes; verify 215/215 files, 3132 tests. SABA-B-10a stage 2a done. Closed: C-R250-01, A-R250-REVIEW-PASTE-SPLIT-PLAYING, A-R250-REVIEW-IM18-IM20-ASSERTS and the round-250 list (A-R249-REVIEW-IM3-CMD, A-R249-REVIEW-IM13-LEAK, B-R250-GESTURE-KEYS, GATE249-S1, C-EDIT-DIVERGE-249, C-R249-INFO-PASTEND-WORDING). EXPORT-PROGRESS-LOAD-FLAKE-250 not reproduced at gate 251 (export-progress-ui 8/8, 1242 ms): stays watch, no isolation task. REGRESSION not due (regression-last 2026-10-27, today 2026-10-29 = 2 days < 3).'),
 ('D-29z453', 'Round 252 = SABA-B-10a stage 2b in one round (all five items are consumers of the insert-marker model; only item 1 changes behaviour, one owner StudioWorkspace.tsx) plus item 0 = A-R251-REVIEW-IM22-PLAYING (Medium, bug gate first, same file). Seam if A STOPs on item 1: items 0+2+3+4 pass alone, item 1 re-dispatched.'),
 ('D-29z454', 'Follow rule from Live 12 manual 6.2 (verbatim in current-task.md section 3): while playing a bars lower-zone click pauses Follow (on -> paused) with the composed status insertMarkerWhilePlayingFollowPaused; a scrub-strip click resumes paused -> on with followResumed; Stop resumes paused -> on silently; off never turns on by itself; lane/clip/range clicks unchanged ("the Arrangement or clip scrub area" parsed as two scrub areas; inference). Baseline repro at HEAD 83b7c75: b-round-251/probe/follow-baseline.json (lower-zone click stays on; strip click and Stop leave paused).'),
 ('D-29z455', 'Follow logic lives at the StudioWorkspace call sites: new placeInsertMarkerFromRuler wraps setInsertMarker (all side effects kept, L49) for both ruler onSeek props; playFromRuler gains the resume branch (autoScrollLeftRef first, as toggleFollow); the isPlaying effect resumes paused on stop. Rejected: inside the context (setInsertMarker shared with lane clicks); pauseFollowForNavigation (status clobber, L51).'),
 ('D-29z456', 'Ctrl+Left/Right: stepMarker uses getLocatorPosition (insert marker while stopped, live while playing); stopped none text names the insert marker (new noneAfterInsertMarker/noneBeforeInsertMarker), playing keeps noneAfter/noneBefore (playhead). Live 6.4 states no origin; inference recorded. Also reduces the gate-251 reviewer three-way position split to two sources (no refactor).'),
 ('D-29z457', 'Seconds ruler: SABA-Q-TIME-RULER-ROLE stays awaiting_user; its round-249 default (click = insert marker) holds and, as a CZABA rule (inference), the click also pauses Follow while playing like the beat-time ruler; appended as part (b) of the question. New question SABA-Q-FOLLOW-EDIT-RESTART: (a) Live 6.2 pauses Follow on an edit, CZABA does not; (b) a marker-flag play while playing is not treated as a restart that resumes Follow. Copy: rulerTitle / rangeBodyTitle say click = insert marker; playPastEnd at-end branch when the formatted position equals the end (closes B-R251-PASTEND-AT-END and B-R236-END-WORDING).'),
 ('D-29z458', 'New findings: A-R251-REVIEW-IM22-PLAYING (Medium, round 252 item 0). Lows to deferred_low_polish: GATE251-S1 (library span JSX text + direct DOM write; render an empty span), A-R251-REVIEW-ADD-DESCRIBEDBY (time segment nowrap + aria-describedby on Add), A-R251-REVIEW-CLASS-SELECTORS (library-preview.test.tsx:241 span.text-foreground, render-budget.test.tsx:540 className equality; L8: schedule before any visual stage that changes those classes). Gate-251 reviewer info 4 (Home during a drag gives no feedback) recorded as info. Architecture addenda 2 (gate-251 resolveCommandPosition) and 3 (A round 251 useArrangementInsertMarkerWriter at the third subscriber, 10b) on GATE249-ARCH-TRANSPORT-POSITIONS; signals only.'),
 ('D-29z459', 'lessons.md L52 added (a while-playing readout assert in jsdom needs a moved position store; red-proof with stopped asserts removed). Evidence A-R250-REVIEW-PASTE-SPLIT-PLAYING, A-R251-REVIEW-IM22-PLAYING (2x). File 58 lines.'),
 ('D-29z460', 'Next: round-252 C PASS + gate -> SABA-B-10a done (rounds 249-252); close C-R235-02, B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, B-R251-PASTEND-AT-END, B-R236-END-WORDING, A-R251-REVIEW-IM22-PLAYING; write the ARCH-CHECKPOINT-TRANSPORT-POSITIONS request for root (non-blocking). Then REGRESSION-ROUND-2026-10-30 at the first planning on/after 2026-10-30 (carries C-CAPTION-251, C-FOLLOW-252, C-NAV-ORIGIN-252); then SABA-B-10b (with the sheet marker copy), SABA-B-9, SABA-B-11c; SABA-B-7 when Saba answers. L28 grep: doc 176 In Progress (stage 1 of 2) is tied to the open STUDIO-PERFORMANCE PERF determinism stage 2, doc 191 is granted to Completed in round 252.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})

of = b['open_findings']
ids = {e.get('id') for e in of}
CLOSE = {'C-R250-01', 'A-R250-REVIEW-PASTE-SPLIT-PLAYING', 'A-R250-REVIEW-IM18-IM20-ASSERTS', 'A-R249-REVIEW-IM3-CMD', 'A-R249-REVIEW-IM13-LEAK',
         'B-R250-GESTURE-KEYS', 'GATE249-S1', 'C-EDIT-DIVERGE-249', 'C-R249-INFO-PASTEND-WORDING'}
for e in of:
    i = e.get('id')
    if i in CLOSE and not e.get('status', '').startswith('closed (D-29z452)'):
        e['status'] = ('closed (D-29z452): C round 251 PASS (browserVerified, realVerified; c-round-251.json), gate 251 published 83b7c75 (rounds 250-251) | ' + e.get('status', ''))
    if i == 'EXPORT-PROGRESS-LOAD-FLAKE-250' and 'D-29z452' not in e['status']:
        e['status'] = 'watch (D-29z452): gate 251 verify did not reproduce it (export-progress-ui 8/8, 1242 ms; 215/215 files) | ' + e['status']
    if i in ('C-R235-02', 'B-R250-NAV-ORIGIN', 'B-R250-PLAYHEAD-TITLES', 'B-R251-PASTEND-AT-END') and 'D-29z453' not in e['status']:
        e['status'] = 'dispatched round 252 (D-29z453): SABA-B-10a stage 2b | ' + e['status']
    if i == 'SABA-Q-TIME-RULER-ROLE' and 'D-29z457' not in e['status']:
        e['status'] += (' | (b) round 252 (D-29z457): the seconds-ruler click also pauses Follow while playing, like the beat-time ruler (CZABA rule, inference; Live 6.1 item 15 documents drag-to-scroll only); still awaiting_user')
    if i == 'C-R145-OBS-LIBRARY-PLAYHEAD' and 'D-29z452' not in e['status']:
        e['status'] += ' | superseded (D-29z452): round 251 renamed the readout to arrangement-library-insert-marker and it names the insert marker'
new = [
 {'id': 'A-R251-REVIEW-IM22-PLAYING', 'severity': 'medium', 'origin': 'a-round-251.md reviewer (Medium); c-round-251.json bugs', 'title': 'IM22 playing assert is vacuous: rAF stubbed, the position store stays at the play-from value 3 = the marker, so a playhead-reading line passes', 'status': 'dispatched round 252 item 0 (D-29z453): setPosition(getLivePosition()) before the playing assert; red-proof MU-CAPTION-POSITION with the stopped asserts removed (B pre-check b-round-251/precheck-im22.txt: red at the playing line, HEAD green)', 'repro': 'c-round-251/mutants/logs/summary.txt; b-round-251/precheck-im22.txt', 'added': ADDED},
 {'id': 'SABA-Q-FOLLOW-EDIT-RESTART', 'severity': 'info', 'origin': 'B round 251 -> 252 planning (L44; Live 12 manual 6.2)', 'title': '(a) Live pauses Follow when you make an edit; CZABA does not (edits keep Follow on). (b) Live resumes Follow when playback restarts; CZABA treats a scrub-strip click and Space-play as restarts but not a marker-flag play during playback. Keep both differences?', 'status': 'awaiting_user (D-29z457): non-blocking; round 252 builds only the ruler/strip/stop clauses', 'added': ADDED},
 {'id': 'GATE251-REVIEW-HOME-DRAG-INFO', 'severity': 'info', 'origin': 'gates/round-251/review.md suggestion 4', 'title': 'Home during a pointer gesture is swallowed (preventDefault) with no status, like the other gesture-guarded keys; manual check in Chromium suggested (no page scroll, no focus move)', 'status': 'recorded (D-29z458); REGRESSION-ROUND-2026-10-30 neighbour probe', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)

dl = b['deferred_low_polish']
dlids = {e.get('id') for e in dl}
for e in dl:
    if e.get('id') == 'B-R236-END-WORDING' and 'D-29z457' not in e['status']:
        e['status'] = 'dispatched round 252 with B-R251-PASTEND-AT-END (D-29z457; L7 same root cause) | ' + e['status']
lows = [
 {'id': 'GATE251-S1', 'severity': 'low', 'title': 'ArrangementLibraryPreview.tsx:63-78 the readout span gets JSX text and then a direct textContent write (safe while the component stays prop-less and memoised); render an empty span and let the effect be the only writer', 'source': 'gates/round-251/review.md suggestion 1', 'repro': 'source read', 'status': 'deferred_low_polish (D-29z458)', 'added': ADDED},
 {'id': 'A-R251-REVIEW-ADD-DESCRIBEDBY', 'severity': 'low', 'title': 'a long user-renamed lane name can clamp the time on the library line; keep the time in its own whitespace-nowrap segment and link Add to the line with aria-describedby', 'source': 'a-round-251.md reviewer Low (D-29z445 ruled long names info)', 'repro': 'rename a lane to 40+ characters, read the library line at 288 px', 'status': 'deferred_low_polish (D-29z458)', 'added': ADDED},
 {'id': 'A-R251-REVIEW-CLASS-SELECTORS', 'severity': 'low', 'title': 'pre-existing class selectors in tests: library-preview.test.tsx:241 span.text-foreground, render-budget.test.tsx:540 className equality (L8/L12: schedule before any visual stage that changes those classes)', 'source': 'a-round-251.md reviewer info', 'repro': 'source read', 'status': 'deferred_low_polish (D-29z458)', 'added': ADDED},
]
for e in lows:
    if e['id'] not in dlids:
        dl.append(e)

for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        for add in [
            'C-FOLLOW-252 (if round 252 passes): §0.2 recipe (pulse, tempo 120, = x4); while playing a bars lower-zone click -> Follow paused with the composed status; a strip click -> on + followResumed; Stop resumes paused; Follow off never turns on; both viewports (D-29z460)',
            'C-NAV-ORIGIN-252 (if round 252 passes): markers at 2 and 6; play from 1, stop at ~4; Ctrl+Right selects the marker at 2; stopped none text names the insert marker; both viewports (D-29z460)',
            'GATE251-REVIEW-HOME-DRAG-INFO: Home during a range drag moves neither page scroll nor focus (D-29z458)',
        ]:
            if add not in r['scope_additions']:
                r['scope_additions'].append(add)

for s in b['architecture_signals']:
    if s.get('id') == 'GATE249-ARCH-TRANSPORT-POSITIONS' and 'addendum 2' not in s.get('text', ''):
        s['text'] += (' | addendum 2 (gates/round-251/review.md Architecture note, signal 2): position choice is split across context getLocatorPosition, commands insertMarkerRef and components getLivePosition; '
                      'proposal: one pure resolveCommandPosition(kind) table in lib/arrangement once stage 2b changes the Ctrl+arrow origin (round 252 already moves that caller to getLocatorPosition). '
                      '| addendum 3 (a-round-251.md Architecture note): two identical insert-marker subscribe-and-write effects (ArrangementLibraryPreview l.63-76, StudioWorkspace l.500-509); extract useArrangementInsertMarkerWriter when SABA-B-10b adds the third subscriber, R9-L1 and IM22 as acceptance.')
        s['status'] += ' | addenda 2-3 recorded (D-29z458); ARCH-CHECKPOINT-TRANSPORT-POSITIONS request after the round-252 PASS (10a/10b boundary, D-29z460)'

q = b['post_current_stage_queue']
for e in q:
    if e.get('id') == 'SABA-B-9-10-11-TRANSPORT-GRID':
        if 'D-29z452' not in e['status']:
            e['status'] = ('in_progress (D-29z452): SABA-B-10a stage 2a done (rounds 250-251, C round 251 PASS browserVerified, published 83b7c75); '
                           'round 252 = 10a stage 2b (final 10a stage) + IM22; then REGRESSION (first planning on/after 2026-10-30), 10b, 9, 11c | ' + e['status'])
        for s in e['stages']:
            if s.get('id') == 'SABA-B-10a' and 'D-29z452' not in s['status']:
                s['status'] = ('in_progress (D-29z452): stage 1 done (dcb7eb1); stage 2a done (rounds 250-251, C round 251 PASS, published 83b7c75); '
                               'stage 2b dispatched round 252 (D-29z453..D-29z457) | ' + s['status'])
                s['stage_plan'].append('stage 2b (round 252, D-29z453..D-29z457): Follow pause on a bars lower-zone / seconds-ruler click while playing, resume on a strip click and on Stop (Live 6.2); Ctrl+Left/Right from the insert marker while stopped; ruler/range titles; at-end wording; IM22 playing assert; doc 191 Completed')
                s['decisions'].append('D-29z452..D-29z460: stage 2a done, stage 2b dispatched, Follow rules, nav origin, copy, L52')

for r in b['rounds']:
    if r.get('round') == 251 and r.get('status') == 'dispatched':
        r['status'] = 'C PASS (browserVerified, realVerified); gate 251 published 83b7c75 (rounds 250-251)'
        r['task'] = 'tasks/round-251.md'
b['rounds'].append({'round': 252, 'task': 'current-task.md', 'decision': 'D-29z452..D-29z460', 'status': 'dispatched', 'type': 'SABA-B-10a stage 2b (final 10a stage) + A-R251-REVIEW-IM22-PLAYING', 'note': 'baseline 83b7c75 clean; frozen 1097 (b-round-251-r252-tree-sha256.txt); grants 13 (b-round-251-r252-grants.txt); covering b-round-251/covering-252.txt (130); baseline probe b-round-251/probe/', 'next': 'PASS -> REGRESSION-ROUND-2026-10-30 (first planning on/after 2026-10-30), then SABA-B-10b', 'added': ADDED})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']), len(b['open_findings']), len(b['decisions_log_b']))
