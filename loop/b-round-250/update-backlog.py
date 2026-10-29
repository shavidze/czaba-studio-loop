# B round 250 -> 251 planning: backlog edits. Run from the loop root: python3 -I b-round-250/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 250 -> 251 planning'
b['updated'] = '2026-10-29 (B round 250 -> 251 planning, D-29z444..D-29z451)'
b['current_task'] = ('current-task.md (round 251, D-29z444..D-29z451; SABA-B-10a stage 2a fix-up: the library line above Add names the insert marker '
                     '(C-R250-01), IM15/IM17 playing branches (A-R250-REVIEW-PASTE-SPLIT-PLAYING), IM20 preventDefault+Meta and IM23 selection-start '
                     '(A-R250-REVIEW-IM18-IM20-ASSERTS); 7 files per b-round-250/precheck-251.diff + doc 191; baseline HEAD dcb7eb1 + the 13 unpublished '
                     'round-250 files; frozen 1102 hashed from the working tree; gate 251 publishes rounds 250-251)')
adv = ('2026-10-29 round 250 -> 251 planning: advisor available and consulted after orientation (before writing) and before declaring done. '
       'Advice followed: baseline = dirty working tree (round-203 precedent), tar-copy scratch and control; literal moved into studioLibraryPanelStrings (ST49 granted); '
       'direct-write subscribe pattern; R9-L1 rewritten with position and marker mutants; widest-state Video-lane row at 288 px; IM15/IM17 playing branches with the '
       'C mutant; L10 ruling on the export-progress flake; sheet copy Low ruled (10b); doc 191 l.4 round 251; L29 changed-meaning clause; REGRESSION flagged as next. | ')
b['advisor_used_by_B'] = adv + b['advisor_used_by_B']
dec = [
 ('D-29z444', 'Round 250 closed as C FAIL (c-round-250.json: taskStatus FAIL, browserVerified and realVerified true; 19 rows passed, purchased origin BLOCKED backend). Gate 250 skipped (C taskStatus FAIL); nothing published; the 13 round-250 files stay in the working tree. Failing finding C-R250-01 (Medium, regression of round 250): the library line above Add read "playhead <live time>" while Add places at the insert marker (ArrangementLibraryPreview.tsx inline literal). Second Medium A-R250-REVIEW-PASTE-SPLIT-PLAYING (test strength, C mutant C-MU-PASTE-SPLIT-LOCATOR 0 red). Round 251 = a fix-up of both plus the Low A-R250-REVIEW-IM18-IM20-ASSERTS in the same file; gate 251 publishes rounds 250-251 together. Round-250 passed rows stay as evidence (files frozen byte for byte), nothing from round 250 is closed before the round-251 C PASS and gate.'),
 ('D-29z445', 'The library line names the insert marker: "Active track: <lane> · insert marker <time>" via studioLibraryPanelStrings.insertMarker; LibraryInsertMarkerText subscribes to the insert-marker store and writes textContent directly (0 renders; unchanged by playback frames); testid arrangement-library-insert-marker. Rejected: dropping the time (the marker is invisible until 10b, this is the only add-point readout); showing the playhead while playing (Add ignores it, D-29z437). addClip findFreeStart can move an occupied add point; the line names the marker (the attempted point) and the status the landing (unchanged). Measured: widest built-in state (Video lane note) stays 2 lines in the 264 x 32 px box at 288 px library width, both viewports (b-round-250/caption-proto.json). Reference: Live 12 manual 4.10 (Enter/double-click loads onto the selected track; no time position, no readout); no reference found for a readout.'),
 ('D-29z446', 'B pre-check for round 251 (L23): scratch /tmp/b251-scratch = tar copy of the working tree; precheck-251.diff 7 files (sha256 6bfde7d4...716c) applies to the working tree and reproduces the scratch byte for byte; tsc rc 0, biome clean; full suite 215 files 3132/3132 (proto-full-251.json); covering 123 files (covering-251.txt); 10 mutant runs red as listed (b-round-250/mutants/logs/summary.txt); Chromium both viewports round-250 tree vs fix (caption-head.json, caption-proto.json; one cold-load timeout kept). Frozen 1102 hashed from the working tree (b-round-250-r251-tree-sha256.txt); grant start copies in b-round-250/r251-granted-start/ for C control.'),
 ('D-29z447', 'L10 ruling on A round-250 STOP (export-progress-ui.test.tsx 2 rows red in a covering run under concurrent load): load flake, not a regression (A 3 isolated reruns + covering run 2 green, C covering alone 1841/1841, B full scratch 3132/3132, no encoder/export/timer code touched). Watch finding EXPORT-PROGRESS-LOAD-FLAKE-250; A and C run the covering set alone; if gate 251 verify reproduces it, B plans a test-only isolation task next.'),
 ('D-29z448', 'Test strength: IM15 and IM17 gain playing branches (MU-PASTE-SPLIT-LOCATOR -> IM15, IM17 red); IM20 asserts preventDefault on Ctrl+Shift+Space, Meta+Shift+Space and Home during a gesture (MU-GESTURE-*-NO-PREVENT -> IM20 red); IM23 pins the time-selection start for M stopped and playing (MU-M-NO-RANGE -> IM23 red); IM22 pins the library line (MU-CAPTION-POSITION/STATIC -> IM22 red).'),
 ('D-29z449', 'Lows: A-R250-REVIEW-IM18-IM20-ASSERTS fixed in round 251 (owned file, little cost); A-R250-REVIEW-SHEET-MARKER-COPY scheduled in SABA-B-10b (owns shortcuts.ts and adds sheet rows; carries the C-TITLES row-height check), not deferred; A-R250-REVIEW-STALE-PASTE-TITLE (ArrangementContext.test.ts:487 title) -> deferred_low_polish (frozen file). A reviewer info 7 (play exactly at the end reads "(00:16.000) is past the end (00:16.000)") -> B-R251-PASTEND-AT-END, stage 2b.'),
 ('D-29z450', 'lessons.md L29 gains the changed-meaning clause (a changed command source makes every readout naming the old source a consumer row; grep app/** incl. inline JSX, not one strings file). Evidence C-R250-01. File stays 57 lines (clause appended to L29).'),
 ('D-29z451', 'Next: round-251 C PASS + gate -> SABA-B-10a stage 2a done (rounds 250-251). Then REGRESSION-ROUND-2026-10-30 at the first planning on/after 2026-10-30 (carry every scope_addition incl. C-INSERT-MARKER-249, C-EDIT-MARKER-250, C-CAPTION-251); then stage 2b (Follow C-R235-02, B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, seconds-ruler role, B-R251-PASTEND-AT-END; doc 191 Completed); then 10b (with the sheet marker copy), 9, 11c; SABA-B-7 when Saba answers; ARCH-CHECKPOINT-TRANSPORT-POSITIONS at the 10a/10b boundary.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})

of = b['open_findings']
ids = {e.get('id') for e in of}
R250_IDS = {'A-R249-REVIEW-IM3-CMD', 'A-R249-REVIEW-IM13-LEAK', 'B-R250-GESTURE-KEYS', 'GATE249-S1', 'C-EDIT-DIVERGE-249', 'C-R249-INFO-PASTEND-WORDING'}
for e in of:
    if e.get('id') in R250_IDS and 'D-29z444' not in e.get('status', ''):
        e['status'] = ('fixed in the unpublished round-250 tree (C round 250 rows passed, browserVerified) but round 250 FAILED on C-R250-01; '
                       'closes at the round-251 C PASS and gate 251 publication (D-29z444) | ' + e.get('status', ''))
    if e.get('id') == 'B-R250-NAV-ORIGIN' and 'D-29z451' not in e['status']:
        e['status'] += ' | still stage 2b after the round-251 fix-up and REGRESSION (D-29z451)'
new = [
 {'id': 'C-R250-01', 'severity': 'medium', 'origin': 'c-round-250.json bugs (C round 250 FAIL)', 'title': 'the library line above Add reads "playhead <live time>" while Add places the sound at the insert marker (regression of round 250; ArrangementLibraryPreview.tsx inline literal)', 'status': 'scheduled round 251 (D-29z444, D-29z445): the line names the insert marker; IM22, R9-L1, C-CAPTION-251/-MOVE-251/-WIDE-251', 'repro': 'c-round-250/caption/caption-fix.json; b-round-250/caption-head.json', 'added': ADDED},
 {'id': 'A-R250-REVIEW-PASTE-SPLIT-PLAYING', 'severity': 'medium', 'origin': 'a-round-250.md reviewer 1; c-round-250.json bugs (C-MU-PASTE-SPLIT-LOCATOR 0 red)', 'title': 'IM15/IM17 test paste and Ctrl+E only while stopped; a paste/split that reads the live position while playing passes the granted tests', 'status': 'scheduled round 251 (D-29z448): playing branches; red-proof MU-PASTE-SPLIT-LOCATOR -> IM15, IM17', 'added': ADDED},
 {'id': 'A-R250-REVIEW-IM18-IM20-ASSERTS', 'severity': 'low', 'origin': 'a-round-250.md reviewer 2-3; c-round-250.json bugs', 'title': 'IM18 has no selection-start-wins case; IM20 has no preventDefault or metaKey assert', 'status': 'scheduled round 251 (D-29z449): IM23 + IM20 asserts; red-proofs MU-M-NO-RANGE, MU-GESTURE-*-NO-PREVENT', 'added': ADDED},
 {'id': 'A-R250-REVIEW-SHEET-MARKER-COPY', 'severity': 'low', 'origin': 'a-round-250.md reviewer 4; c-round-250.json bugs', 'title': 'shortcut sheet row "Add a marker at the insert marker" is inaccurate while playing and with a selection (addTitle names all three cases)', 'status': 'scheduled in SABA-B-10b (D-29z449; owns shortcuts.ts, adds sheet rows; carries the row-height check), not deferred', 'added': ADDED},
 {'id': 'B-R251-PASTEND-AT-END', 'severity': 'info', 'origin': 'a-round-250.md reviewer info 7', 'title': 'a strip or flag play exactly at the end reads "(00:16.000) is past the end of the project (00:16.000)" (D-27 at-or-past-end rule for playFrom)', 'status': 'stage 2b scope (D-29z449)', 'added': ADDED},
 {'id': 'EXPORT-PROGRESS-LOAD-FLAKE-250', 'severity': 'info', 'status': 'watch (D-29z447)', 'origin': 'a-round-250.md STOP', 'title': 'export-progress-ui.test.tsx l.319/l.350 rows failed once in a covering run under concurrent load (resetEncoderMock call count); green in 3 isolated reruns, A covering run 2, C covering alone, B full scratch', 'detail': 'If gate 251 verify (or any later gate) reproduces it, B plans a test-only isolation task for that file next, before new scope', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)

dl = b['deferred_low_polish']
if 'A-R250-REVIEW-STALE-PASTE-TITLE' not in {e.get('id') for e in dl}:
    dl.append({'id': 'A-R250-REVIEW-STALE-PASTE-TITLE', 'severity': 'low', 'title': 'ArrangementContext.test.ts:487 title "pastes at the playhead" is stale (passes because seekTo writes both positions)', 'source': 'a-round-250.md reviewer info 5', 'repro': 'source read', 'status': 'deferred_low_polish (D-29z449)', 'added': ADDED})

for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        add = ('C-CAPTION-251 (if round 251 passes): after play from 3 and stop (~4.5), the library line reads "Active track: SFX · insert marker 00:03.000" '
               'stopped and while playing, and + Add lands at 3.000; Video lane active: 2 lines, time visible; both viewports (D-29z451)')
        if add not in r['scope_additions']:
            r['scope_additions'].append(add)

for s in b['architecture_signals']:
    if s.get('id') == 'GATE249-ARCH-TRANSPORT-POSITIONS' and 'addendum 1' not in s.get('status', ''):
        s['text'] += (' | addendum 1 (a-round-250.md Architecture note, signals 3/4): ArrangementContext l.1331-1513 changed three rounds in a row (248-250); keep the refs in the context; '
                      'extract only a pure lib/arrangement resolver (command, isPlaying, range) -> position source with table tests mirroring D-29z437.')
        s['status'] += ' | addendum 1 recorded (D-29z451); still requested at the 10a/10b boundary'

q = b['post_current_stage_queue']
for e in q:
    if e.get('id') == 'SABA-B-9-10-11-TRANSPORT-GRID':
        if 'D-29z444' not in e['status']:
            e['status'] = ('in_progress (D-29z444): round 250 (10a stage 2a) C FAIL on C-R250-01, gate skipped, unpublished; round 251 = stage 2a fix-up; '
                           'then REGRESSION (first planning on/after 2026-10-30), stage 2b, 10b, 9, 11c | ' + e['status'])
        for s in e['stages']:
            if s.get('id') == 'SABA-B-10a' and 'D-29z444' not in s['status']:
                s['status'] = ('in_progress (D-29z444): stage 1 done (published dcb7eb1); stage 2a = rounds 250 (C FAIL, unpublished) + 251 fix-up '
                               '(C-R250-01, A-R250-REVIEW-PASTE-SPLIT-PLAYING); stage 2b after REGRESSION | ' + s['status'])
                s['stage_plan'].append('stage 2a fix-up (round 251, D-29z445/D-29z448): the library line names the insert marker; IM15/IM17 playing; IM20 preventDefault/Meta; IM22, IM23')
                s['stage_plan'].append('stage 2b adds B-R251-PASTEND-AT-END (D-29z449)')
                s['decisions'].append('D-29z444..D-29z451: round 250 FAIL, fix-up round 251, flake ruling, Lows triage, L29 clause')
            if s.get('id') == 'SABA-B-10b' and 'D-29z449' not in s['status']:
                s['status'] = 'not_started; scope adds A-R250-REVIEW-SHEET-MARKER-COPY (sheet marker row copy, D-29z449) | ' + s['status']

b['rounds'].append({'round': 250, 'task': 'tasks/round-250.md', 'decision': 'D-29z435..D-29z443', 'status': 'C FAIL (C-R250-01 Medium); gate 250 skipped; unpublished, kept in the working tree', 'type': 'SABA-B-10a stage 2a', 'added': ADDED})
b['rounds'].append({'round': 251, 'task': 'current-task.md', 'decision': 'D-29z444..D-29z451', 'status': 'dispatched', 'type': 'SABA-B-10a stage 2a fix-up (C-R250-01, A-R250-REVIEW-PASTE-SPLIT-PLAYING, A-R250-REVIEW-IM18-IM20-ASSERTS)', 'note': 'baseline dcb7eb1 + 13 round-250 M; frozen 1102 (b-round-250-r251-tree-sha256.txt); grants 8 (b-round-250-r251-grants.txt); diff b-round-250/precheck-251.diff', 'next': 'PASS -> REGRESSION-ROUND-2026-10-30 (if planning on/after 2026-10-30), else stage 2b', 'added': ADDED})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']), len(b['open_findings']), len(b['decisions_log_b']))
