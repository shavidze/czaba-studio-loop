# B round 249 -> 250 planning: backlog edits. Run from the loop root: python3 -I b-round-249/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 249 -> 250 planning'
b['updated'] = '2026-10-29 (B round 249 -> 250 planning, D-29z435..D-29z443)'
b['current_task'] = ('current-task.md (round 250, D-29z435..D-29z443; SABA-B-10a stage 2a: paste, library add (Enter/double-click/Add), '
                     'Ctrl+E without a range read the insert marker; M reads the selection start, else the insert marker when stopped and '
                     'the playback position while playing; the past-end refusal names its start point; IM3/IM13 strengthened '
                     '(A-R249-REVIEW-IM3-CMD, A-R249-REVIEW-IM13-LEAK); Ctrl/Cmd+Shift+Space and Home ignored during a pointer gesture '
                     '(GATE249-S6); IM21 pins GATE249-S1; 12 files per b-round-249/precheck-scratch.diff + doc 191 stage 2 of 3; '
                     'baseline dcb7eb1, frozen 1097)')
dec = [
 ('D-29z435', 'Round 249 closed: C PASS (c-round-249.json, browserVerified and realVerified true, 26 rows passed; purchased origin BLOCKED backend); gate 249 published dcb7eb1 to both remotes (gates/gate-round-249.json; review 8.5/10, no Critical; verify 215 files 3123 tests). SABA-B-10a stage 1 done. C findings A-R249-REVIEW-IM3-CMD and A-R249-REVIEW-IM13-LEAK (Medium, test strength in grant 10; no product failure; C red-proof C-MU-LEAK-CS) scheduled in round 250 with the test file granted. C info: C-EDIT-DIVERGE-249 and C-R249-INFO-PASTEND-WORDING are round-250 scope; INFO-B249-STALE-MARKER-STATUS stays info (10b shows the marker).'),
 ('D-29z436', 'SABA-B-10a stage 2 split into 2a and 2b (one behaviour family per round). Stage 2a (round 250) = commands that place or edit at a position: paste, library add, Ctrl+E without a range, M; the past-end subject; plus the two Mediums and GATE249-S6 in the same owned code. Stage 2b = navigation: C-R235-02 Follow pause/resume (Live 6.2), the Ctrl+Left/Right origin (stepMarker reads getLivePosition; Live 6.9 moves the insert marker) with the noneAfter/noneBefore copy, the seconds-ruler role (SABA-Q-TIME-RULER-ROLE), and the ruler/range titles that still say click = playhead (B-R250-PLAYHEAD-TITLES). Doc 191 becomes a 3-stage doc: l.4 In Progress (stage 2 of 3; C round 250 PASS); Completed at the 2b PASS.'),
 ('D-29z437', 'Stage 2a rulings: paste, library add (Enter, double-click, Add button: addSourceToActiveTrack) and both Ctrl+E branches without a range read the insert marker, stopped and while playing (Live: selection-based editing at the insert marker 6.9, Split at the clicked location 6.12; paste placement itself has no manual sentence: no reference found, inference from 6.9). M: time selection start if any, else the insert marker when stopped (Live 6.4 Set Locator while transport is not running) and the live playback position while playing (Live 6.4 real time; ABL-R-10 approved variant) via a new context getter getLocatorPosition. M while playing still opens the name field and still prefers the selection start: the rest of ABL-R-10 stays in REVIEW-RECOMMENDATIONS. ABL-R-6 (Saba 2026-10-25: Enter/double-click adds at the playhead) was written under the one-position model D-15; Saba approved the insert-marker model on 2026-10-28 (transport-grid-review 10a: Paste, M stopped, Ctrl+E and Enter add use insertMarker), so the add point is the insert marker; recorded, not a new question. Copy: splitMissesSelection, splitNeedsTarget, splitPlayheadOutside -> splitInsertMarkerOutside, splitPlayheadTitle -> splitAtInsertMarkerTitle, marker addTitle and three shortcut-sheet rows name the insert marker. stepMarker, noneAfter/noneBefore, rulerTitle, rangeBodyTitle and playheadTitle are stage 2b.'),
 ('D-29z438', 'Past-end refusal names its start point: playPastEndMessage(position, end, origin) with origin insert-marker (Space without a selection, scrub strip, flag play), selection (Space with a selection; reachable only through the API today, since a time selection lies inside a clip) or playhead (Shift+Space). Strings: playPastEnd({subject, position, end}) plus startPointInsertMarker/startPointSelection/startPointPlayhead. Measured at both viewports: the longest reachable text stays one 16 px line (b-round-249/box-proto.json).'),
 ('D-29z439', 'Gate 249 triage: S1 (stopped handle clears the selection, untested) -> IM21 in round 250; S2 -> stays SABA-Q-10A-CTRL-ARROW-RANGE; S3 (dead onSeek destructure in ArrangementRuler.tsx:64) -> deferred_low_polish (round 250 does not own the Ruler); S4 (hidden signal node) and S7 (no aria-keyshortcuts/sheet rows for Shift+Space and Ctrl/Cmd+Shift+Space) -> SABA-B-10b scope; S5 (double marker write) -> info + signal GATE249-ARCH-TRANSPORT-POSITIONS; S6 (Ctrl/Cmd+Shift+Space and Home during a pointer gesture) reproduced by B at HEAD dcb7eb1 in Chromium at both viewports: mid range drag, the keys move marker and playhead to 0 and the in-progress selection is lost after pointerup (b-round-249/edit-head-gesture.json) -> B-R250-GESTURE-KEYS (Medium, regression of round 249) fixed in round 250; S8 = B-R249-PAUSE-LABEL (SABA-B-9); S9 = TLM-R249-MAC-CMD-SHIFT-SPACE. A-R249-REVIEW-KEYUP-ORDER -> Tech Lead manual list (Firefox/Safari key-up order). A round-249 Lows: IM14 isPlaying assert vacuous in jsdom and setInsertMarker early return before the scrub-ref reset -> deferred_low_polish; slider Ctrl+Shift+Space and marker-not-in-undo -> info.'),
 ('D-29z440', 'Architecture: gate-249 note and A-249 note (second position store, four transport callbacks and the marker write policy in ArrangementContext; Space branch in StudioWorkspace changed in several rounds) recorded as signal GATE249-ARCH-TRANSPORT-POSITIONS: after SABA-B-10b and SABA-B-9, one bounded extract of a transport-positions unit (two stores, remap, startPlaybackAt, write rules) keeping useArrangement() shape, and retire the hidden signal. Not scheduled; request ARCH-CHECKPOINT-TRANSPORT-POSITIONS from root at the 10a/10b boundary (non-blocking).'),
 ('D-29z441', 'Saba questions: SABA-Q-10A-DEVIATIONS gains (d) M while playing is not quantized; Live 6.4 says locators set during playback are quantized by the global launch quantization (transcript tBfi 0:57-1:16 CHECK resolved against the manual), CZABA has no launch quantization. Asked once (L44), non-blocking.'),
 ('D-29z442', 'B pre-check for round 250 (L23/L29): scratch /tmp/b250-scratch; precheck-scratch.diff 12 files (sha256 928c4950...2811); tsc rc 0, biome clean; v1 full suite 3113/3123 with only text and signature collisions (ArrangementContext.test D-27 row, BR8, BR13, IM11, MS1, NS1, ST6, ST10, ST11, ST28; all granted); 18 mutant runs red as listed (b-round-249/mutants/logs/summary.txt, logs-pastend/summary.txt; MU-PASTEND-ONE-SUBJECT kept as a weak-design note: mutating the helper itself cannot fail rows that compute their expectation with it); Chromium both viewports HEAD vs fix (edit-head.json, edit-proto.json, edit-head-gesture.json, box-head.json, box-proto.json). The proto-full-final result is in b-round-249.md. Invalid attempt kept: edit-proto-attempt1-timeout.log (cold :5174 load).'),
 ('D-29z443', 'Next: REGRESSION-ROUND-2026-10-30 at the first planning on/after 2026-10-30 (carry every scope_addition incl. C-INSERT-MARKER-249 and C-EDIT-MARKER-250); else SABA-B-10a stage 2b; then SABA-B-10b, SABA-B-9, SABA-B-11c; SABA-B-7 when Saba answers; then SYS-5, PERF b-ii and the rest unchanged. A round-250 FAIL -> fix-up on the same grants first.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})

of = b['open_findings']
ids = {e.get('id') for e in of}
for e in of:
    i = e.get('id')
    if i == 'SABA-Q-10A-DEVIATIONS' and 'D-29z441' not in e['status']:
        e['title'] += ' (d) M while playing is not quantized (Live 6.4: locators set during playback follow the global launch quantization; CZABA has none).'
        e['status'] = 'awaiting_user (D-29z432, (d) added D-29z441): non-blocking'
    if i == 'SABA-Q-10A-CTRL-ARROW-RANGE' and 'GATE249-S2' not in e['status']:
        e['status'] += ' | gate 249 S2 asks to keep it with the stage-2 questions (D-29z439)'
    if i == 'C-R235-02' and 'D-29z436' not in e['status']:
        e['status'] = 'scheduled in SABA-B-10a stage 2b (D-29z436) | ' + e['status']
new = [
 {'id': 'A-R249-REVIEW-IM3-CMD', 'severity': 'medium', 'origin': 'a-round-249.md section 6 (code-reviewer M2); c-round-249.json bugs', 'title': 'IM3 presses Cmd+Shift+Space with marker = playhead, so the assert passes without the metaKey branch (A-MU-CTRL-ONLY green)', 'status': 'scheduled round 250 (D-29z435): IM3 separates marker and playhead before the Cmd press; red-proof A-MU-CTRL-ONLY -> IM3 red (b-round-249/mutants/logs)', 'repro': 'c-round-249/out-fix/c249.json ctrlShift@* metaOk', 'added': ADDED},
 {'id': 'A-R249-REVIEW-IM13-LEAK', 'severity': 'medium', 'origin': 'a-round-249.md section 6 (code-reviewer M3); c-round-249.json bugs', 'title': 'IM13 cannot catch Ctrl/Cmd+Shift+Space leaking out of the tempo field (marker = playhead = 2); C-MU-LEAK-CS stays 14/14 green', 'status': 'scheduled round 250 (D-29z435): IM13 separates the positions first and also presses Cmd+Shift+Space in the field; red-proofs C-MU-LEAK-CS and C-MU-LEAK-SHIFT -> IM13 red', 'repro': 'c-round-249/mutants/C-MU-LEAK-CS.json', 'added': ADDED},
 {'id': 'B-R250-GESTURE-KEYS', 'severity': 'medium', 'origin': 'gates/round-249/review.md suggestion 6 (GATE249-S6), reproduced by B (b-round-249/edit-head-gesture.json)', 'title': 'during a range drag on a clip, Ctrl/Cmd+Shift+Space and Home move the insert marker and playhead and clear the selection; after pointerup the dragged selection is gone (regression of round 249)', 'status': 'scheduled round 250 (D-29z439): both keys return early while isPointerGestureActive(); IM20 + C-GESTURE-250', 'repro': 'Chromium 1440 and 1280: play 2 -> stop; pointerdown on the music clip lower half at 6 s, move to 8 s, Ctrl+Shift+Space, Home, pointerup -> HEAD marker 0, range gone', 'added': ADDED},
 {'id': 'GATE249-S1', 'severity': 'low', 'origin': 'gates/round-249/review.md suggestion 1', 'title': 'a stopped playhead-handle step or drag now clears a time selection, untested', 'status': 'scheduled round 250 as IM21 (D-29z439); closes at the round-250 C PASS', 'added': ADDED},
 {'id': 'GATE249-S2', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 2', 'title': 'seekTo keeps the selection, so Space after Ctrl+arrows plays the selection', 'status': 'info (D-29z439): = SABA-Q-10A-CTRL-ARROW-RANGE', 'added': ADDED},
 {'id': 'GATE249-S4', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 4', 'title': 'test-only hidden ArrangementInsertMarkerSignal ships to production', 'status': 'SABA-B-10b scope (D-29z439): the visible marker carries data-insert-marker and the hidden node is removed', 'added': ADDED},
 {'id': 'GATE249-S5', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 5', 'title': 'returnToStart and playFrom write the marker store twice (placeInsertMarker then seekTo)', 'status': 'info (D-29z439); part of GATE249-ARCH-TRANSPORT-POSITIONS; 10b checks it does not double-render the visible marker', 'added': ADDED},
 {'id': 'GATE249-S7', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 7', 'title': 'Shift+Space and Ctrl/Cmd+Shift+Space have no aria-keyshortcuts and no shortcut-sheet row', 'status': 'SABA-B-10b scope (sheet rows), D-29z439', 'added': ADDED},
 {'id': 'GATE249-S8', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 8', 'title': 'status says Stop while the button reads Pause', 'status': '= B-R249-PAUSE-LABEL (SABA-B-9)', 'added': ADDED},
 {'id': 'GATE249-S9', 'severity': 'info', 'origin': 'gates/round-249/review.md suggestion 9', 'title': 'Mac Cmd path unverified', 'status': '= TLM-R249-MAC-CMD-SHIFT-SPACE', 'added': ADDED},
 {'id': 'C-EDIT-DIVERGE-249', 'severity': 'info', 'origin': 'c-round-249.json info', 'title': 'M and Ctrl+E used the playhead while the marker differed; paste inconclusive', 'status': 'round 250 scope (D-29z437); B reproduced paste/split/M/Enter-add at HEAD (b-round-249/edit-head.json)', 'added': ADDED},
 {'id': 'C-R249-INFO-PASTEND-WORDING', 'severity': 'info', 'origin': 'c-round-249.json info', 'title': 'past-end refusal says Playhead while the refused start is the insert marker', 'status': 'round 250 scope (D-29z438)', 'added': ADDED},
 {'id': 'A-R249-REVIEW-KEYUP-ORDER', 'severity': 'info', 'origin': 'a-round-249.md section 6 (code-reviewer M1)', 'title': 'Shift released before Space after Ctrl+Shift+Space could click a focused button on key-up in other engines; not reproduced in Chromium (A and C, both orders)', 'status': 'Tech Lead manual: Firefox and Safari (D-29z439)', 'added': ADDED},
 {'id': 'B-R250-PLAYHEAD-TITLES', 'severity': 'low', 'origin': 'B round 249 -> 250 planning (copy sweep)', 'title': 'ruler and range titles still say click = playhead (rulerTitle, rangeBodyTitle); while playing a click now moves only the insert marker', 'status': 'scheduled in SABA-B-10a stage 2b, not deferred (D-29z436)', 'added': ADDED},
 {'id': 'B-R250-NAV-ORIGIN', 'severity': 'low', 'origin': 'B round 249 -> 250 planning', 'title': 'Ctrl+Left/Right steps from the playhead (getLivePosition) while stopped; after a stop that differs from the insert marker (Live 6.9 moves the insert marker); noneAfter/noneBefore name the playhead', 'status': 'scheduled in SABA-B-10a stage 2b (D-29z436)', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)

dl = b['deferred_low_polish']
dids = {e.get('id') for e in dl}
lows = [
 {'id': 'GATE249-S3', 'severity': 'low', 'title': 'ArrangementRulerPlayhead still destructures the unused onSeek after the arrow keys moved to onScrubEnd', 'source': 'gates/round-249/review.md suggestion 3', 'repro': 'app/components/arrangement/ArrangementRuler.tsx:64 (lint warning)', 'status': 'deferred_low_polish (D-29z439)', 'added': ADDED},
 {'id': 'A-R249-REVIEW-IM14-VACUOUS', 'severity': 'low', 'title': "IM14's isPlaying assert is vacuous in jsdom; only the key-up defaultPrevented check is real", 'source': 'a-round-249.md section 6 Lows', 'repro': 'insert-marker-ui.test.tsx IM14', 'status': 'deferred_low_polish (D-29z439)', 'added': ADDED},
 {'id': 'A-R249-REVIEW-SETINSERT-SCRUBREF', 'severity': 'low', 'title': 'setInsertMarker returns early while playing before resetting scrubbingRef/lastScrubRescheduleRef; unverified, probably moot behind the pointer-gesture claim', 'source': 'a-round-249.md section 6 Lows', 'repro': 'source read, ArrangementContext.tsx setInsertMarker', 'status': 'deferred_low_polish (D-29z439)', 'added': ADDED},
]
for e in lows:
    if e['id'] not in dids:
        dl.append(e)

tlm = b['tech_lead_manual_checks']
if 'TLM-R249-KEYUP-ORDER' not in {e.get('id') for e in tlm}:
    tlm.append({'id': 'TLM-R249-KEYUP-ORDER', 'status': 'planned (D-29z439)', 'what': 'Firefox and Safari: focus Play, press Ctrl+Shift+Space and release Shift before Space (and the reverse); playback must not start and focus stays on Play', 'source': 'A-R249-REVIEW-KEYUP-ORDER', 'deadline': 'RETRO 260 (L46)', 'added': ADDED})

for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        add = ('C-EDIT-MARKER-250 (if round 250 passes): play from 2 s, stop at ~3.5 s; Ctrl+V on another track, Ctrl+E on a clip that spans 5 s '
               'after a clip-body click at 5 and play/stop, Enter on a library row, M: each lands at the insert marker, not the stop point; '
               'Space past the end says "Insert marker (..."; both viewports (D-29z443)')
        if add not in r['scope_additions']:
            r['scope_additions'].append(add)

sig = {'id': 'GATE249-ARCH-TRANSPORT-POSITIONS', 'origin': 'gates/round-249/review.md Architecture note (signals 3+4); a-round-249.md section 6', 'text': 'ArrangementContext gains a second position store, insertMarkerRef, a context and four transport callbacks; the Space/transport branch in StudioWorkspace changed in several rounds. Proposal: after SABA-B-10b and SABA-B-9, one bounded extract of a transport-positions unit (two stores, remap, startPlaybackAt, marker/playhead write rules) inside the context ownership, useArrangement() shape unchanged, retire the hidden signal; acceptance IM1-IM21, BR4b, EN3 and the cut-time tests unchanged', 'status': 'signal (D-29z440); not scheduled; ARCH-CHECKPOINT-TRANSPORT-POSITIONS to be requested from root at the 10a/10b boundary (non-blocking)', 'added': ADDED}
if sig['id'] not in {e.get('id') for e in b['architecture_signals']}:
    b['architecture_signals'].append(sig)

q = b['post_current_stage_queue']
for e in q:
    if e.get('id') == 'SABA-B-9-10-11-TRANSPORT-GRID':
        if 'D-29z435' not in e['status']:
            e['status'] = ('in_progress (D-29z435): SABA-B-10a stage 1 done (round 249 C PASS browserVerified/realVerified, gate 249 published dcb7eb1); '
                           'round 250 = SABA-B-10a stage 2a (edit commands at the insert marker, past-end subject, IM3/IM13, gesture guard); '
                           'then REGRESSION (first planning on/after 2026-10-30), stage 2b (Follow, Ctrl+arrows origin, ruler titles), 10b, 9, 11c | ' + e['status'])
        for s in e['stages']:
            if s.get('id') == 'SABA-B-10a' and 'D-29z435' not in s['status']:
                s['status'] = ('in_progress (D-29z435): stage 1 done (round 249 C PASS browserVerified, published dcb7eb1); stage 2a dispatched round 250 '
                               '(D-29z436..D-29z439); stage 2b (Follow C-R235-02, Ctrl+arrows origin B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, '
                               'seconds-ruler role) next after 2a and the REGRESSION round if due | ' + s['status'])
                s['stage_plan'].append('stage 2a (round 250, D-29z436/D-29z437/D-29z438): paste, library add, Ctrl+E without a range at the insert marker (stopped and playing); M at the selection start, else the marker stopped / live position playing (getLocatorPosition); past-end subject per origin; IM3/IM13 strengthened; Ctrl/Cmd+Shift+Space and Home ignored during a pointer gesture (B-R250-GESTURE-KEYS); IM15-IM21')
                s['stage_plan'].append('stage 2b (next): C-R235-02 Follow pause on a bars lower-zone click and resume on a scrub-strip click (Live 6.2) + seconds-ruler role (SABA-Q-TIME-RULER-ROLE); Ctrl+Left/Right from the insert marker while stopped + noneAfter/noneBefore copy (B-R250-NAV-ORIGIN); ruler/range titles (B-R250-PLAYHEAD-TITLES); doc 191 Completed')
                s['decisions'].append('D-29z436..D-29z439: stage 2 split 2a/2b; edit-command and M rulings; past-end subject; gate-249 triage (S6 fixed in 2a)')
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']), len(b['open_findings']), len(b['decisions_log_b']))
