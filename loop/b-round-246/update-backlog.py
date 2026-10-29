# B round 246 -> 247 planning: backlog edits. Run from the loop root: python3 -I b-round-246/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 246 -> 247 planning'
b['updated'] = '2026-10-29 (B round 246 -> 247 planning, D-29z412..D-29z418)'
b['current_task'] = ('current-task.md (round 247, D-29z412..D-29z418; B-R245-UNDO-GROUP-FOCUS fix: ArrangementGroupHeader.tsx row-root ref detach '
                     '+ StudioWorkspace.tsx successor effect + GF1-GF7 in track-group-collapse-ui.test.tsx, new doc 190; baseline 869d767, frozen 1104)')
dec = [
 ('D-29z412', 'Round 246 closed: C PASS (c-round-246.json, browserVerified and realVerified true, 15 rows passed, 0 bugs; purchased origin BLOCKED backend); gate 246 published 869d767 (gates/gate-round-246.json; review 9/10, no Critical). B-R243-UNDO-MARKER-FOCUS closed (C-UNDO-ORIGINS-246, C-CUTTIME-246, C-NO-STEAL-246, C-KEEP-246). C-R245-01..03 closed by RT-FIX-246 PASS; retro_runs 245 done. GATE246-S1 (Cut Time browser case) closed by C-CUTTIME-246 and A-R246-REVIEW-L1 browser info (c246-skip.json).'),
 ('D-29z413', 'Triage of round-246 notes: A-R246-REVIEW-L1 (unit row gap: next flag removed in the same step, later one survives; browser behaviour correct per c246-skip.json), GATE246-S3 (Georgian comment on the inline-ref order assumption), GATE246-S4 (DetachedFlagFocus type written twice) and INFO-C246-DRAG-RING (focused flag after a mouse drag matches :focus-visible with outline none; identical at e9fb805) -> deferred_low_polish (2026-10-23 bug gate). GATE246-S2 (two focus requests in one commit) -> info for the marker owner; for the group owner it is ruled in D-29z415. A-R246-REVIEW-INFO1 not reproduced: with the marker menu open Ctrl+Z undoes nothing (b-round-246/head-1440.json markerMenuUndo, both viewports) -> closed info. INFO-C246-VITE-CACHE -> harness fact and retro candidate (a control server gets its own .vite cache). C-GROUP-INFO-246 -> evidence for B-R245-UNDO-GROUP-FOCUS.'),
 ('D-29z414', 'Round 247 = B-R245-UNDO-GROUP-FOCUS (planning still 2026-10-29, D-29z410). REGRESSION stays due at the first planning on/after 2026-10-30. Re-measured at HEAD 869d767 both viewports: group name, fold, mute, volume, folded group and nested outer group all fall to BODY on Undo: Group Tracks and Redo: Ungroup Tracks (Ctrl+Shift+Z, Ctrl+Y) (b-round-246/head-1440.json, head-1280.json, head-1440-extra.json, head-tab.json). Track rows never move: non-adjacent grouping is refused; history labels are only marker, group, rename group and ungroup.'),
 ('D-29z415', 'Ruling for groups: when a history step removes the group row that contains focus, focus goes to the next row after it in the previous commit\'s full row order (folded members included) whose name button is rendered, else the previous one; focus elsewhere is never moved. Detected at the row-root ref detach in ArrangementGroupHeader (memoised callback, node.contains(activeElement)), reported by a required prop onFocusedRowDetach; StudioWorkspace records the last committed allTrackRows order and a no-deps layout effect before the pendingRowFocusRef effect focuses the successor. The explicit pendingRowFocusRef request (ungroupSelectedTrackRows childIds[0]) wins: the rescue yields when it is set (GF7). B pre-applied it: precheck-scratch.diff (3 files), tsc + biome clean, covering 96 files 1492/1492, 9 mutant runs red as listed, Chromium both viewports (scratch.json, scratch-tab.json: ring solid 1px brass at 0.8).'),
 ('D-29z416', 'Architecture: gate 246 note (shared focus-successor mechanism for marker flags and group rows) recorded as signal GATE246-ARCH-FOCUS-SUCCESSOR, not scheduled. Round 247 adds the second per-owner ref-detach rescue (groups). Addendum to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 4 (b-round-246-checkpoint-addendum.md): keep two per-owner rescues or extract one helper; requested from root at this feature boundary; non-blocking; wanted before SABA-B-10a.'),
 ('D-29z417', 'Info filed: INFO-B247-MODIFIER-NO-FOCUS-VISIBLE (after a mouse-reached focus, Chromium does not treat a Ctrl chord as keyboard modality, so a rescued button has :focus-visible false and no ring, consistent with SABA-B-4; ring rows reach focus by Tab); INFO-B247-VOLUME-BLUR-ON-REMOVAL (removing a focused group volume fader fires blurGroupVolume -> blurVolumeTarget for a missing group; 0 page errors at HEAD; C row C-VOLUME-REMOVAL-247); INFO-B247-GRIDMENU-UNVERIFIED (B recipe did not open the grid menu; whether Ctrl+Z reaches the workspace with it open is unverified; C info probe); INFO-B247-COLD-START-REACT (first scratch row hit a duplicate-React error during Vite dependency optimisation; re-run clean).'),
 ('D-29z418', 'Next: round 248 = REGRESSION at the first planning on/after 2026-10-30 (all scope_additions incl. C-UNDO-ORIGINS-246 and C-GROUP-ORIGINS-247 as named rows, L6); if that planning is still 2026-10-29, SABA-B-11b stage 2b first. Then SABA-B-11b stage 2b, SABA-B-10a (with C-R235-02), 10b, 9, 11c. A round-247 FAIL -> fix-up on the same grants first.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})
of = b['open_findings']
ids = {e.get('id') for e in of}
for e in of:
    i = e.get('id')
    if i == 'B-R243-UNDO-MARKER-FOCUS' and not e['status'].startswith('closed'):
        e['status'] = 'closed (D-29z412): C round 246 PASS (C-UNDO-ORIGINS-246, C-CUTTIME-246, C-NO-STEAL-246, C-KEEP-246), gate 246 published 869d767 | ' + e['status']
    if i in ('C-R245-01', 'C-R245-02', 'C-R245-03') and not e['status'].startswith('closed'):
        e['status'] = 'closed (D-29z412): RT-FIX-246 C PASS (c-round-246.json), published 869d767 | ' + e['status']
    if i == 'B-R245-UNDO-GROUP-FOCUS' and not e['status'].startswith('dispatched'):
        e['status'] = ('dispatched round 247 (D-29z414/D-29z415): next row in the last committed full order, else previous; row-root ref detach; '
                       'pendingRowFocusRef wins; closes on C round 247 PASS + gate published | ' + e['status'])
        e['evidence'] += '; re-measured at 869d767: b-round-246/head-1440.json, head-1280.json, head-tab.json (fold, mute, volume, folded and nested outer rows too)'
new = [
 {'id': 'GATE246-S1', 'severity': 'low', 'origin': 'gates/round-246/review.md suggestion 1', 'title': 'Cut Time focus rescue checked only in jsdom; add a browser case', 'status': 'closed (D-29z412): C-CUTTIME-246 and the A-R246-REVIEW-L1 browser probe (c-round-246/out-fix/c246-skip.json)', 'added': ADDED},
 {'id': 'GATE246-S2', 'severity': 'info', 'origin': 'gates/round-246/review.md suggestion 2', 'title': 'two focus requests in one commit (pendingFocusRef and the detach rescue): the rescue wins silently; cannot happen today in ArrangementMarkerRow', 'status': 'info/watch for the marker owner (D-29z413); for the group owner ruled in D-29z415 (pendingRowFocusRef wins, GF7, MU-PRECEDENCE-INVERTED)', 'added': ADDED},
 {'id': 'A-R246-REVIEW-INFO1', 'severity': 'info', 'origin': 'a-round-246.md section 6 (source-reading hypothesis)', 'title': 'marker menu open, then Undo removes that marker -> BODY?', 'status': 'closed, not reproduced (D-29z413): with the menu open Ctrl+Z undoes nothing (b-round-246/head-1440.json, head-1280.json markerMenuUndo: markers 1, status unchanged, focus stays in the menu)', 'added': ADDED},
 {'id': 'INFO-C246-VITE-CACHE', 'severity': 'info', 'origin': 'c-round-246.json info', 'title': 'a HEAD control server with node_modules symlinked whole rewrote store/node_modules/.vite for ~20 s; per-entry links and an own cache fixed it', 'status': 'harness fact (D-29z413); retro candidate RETRO 260', 'added': ADDED},
 {'id': 'C-GROUP-INFO-246', 'severity': 'info', 'origin': 'c-round-246.json info', 'title': 'groupUndo BODY at HEAD and on the round-246 fix, both viewports', 'status': 'evidence for B-R245-UNDO-GROUP-FOCUS (round 247)', 'added': ADDED},
 {'id': 'INFO-B247-MODIFIER-NO-FOCUS-VISIBLE', 'severity': 'info', 'status': 'info (D-29z417): harness fact for focus rows', 'title': 'after a mouse-reached focus, a Ctrl chord is not keyboard modality in Chromium 143: a rescued button has :focus-visible false and no ring (SABA-B-4 rule); reach focus by Tab for ring rows', 'source': 'b-round-246/scratch.json vs scratch-tab.json', 'added': ADDED},
 {'id': 'INFO-B247-VOLUME-BLUR-ON-REMOVAL', 'severity': 'info', 'status': 'info (D-29z417): C-VOLUME-REMOVAL-247 compares with HEAD', 'title': 'removing a focused group volume fader fires blurGroupVolume -> blurVolumeTarget for a group that no longer exists; 0 page errors at HEAD', 'source': 'ArrangementGroupHeader.tsx l.349, ArrangementContext.tsx l.2658; b-round-246/head-vol-menu.json', 'added': ADDED},
 {'id': 'INFO-B247-GRIDMENU-UNVERIFIED', 'severity': 'info', 'status': 'info (D-29z417): C info probe in round 247 section 6', 'title': 'whether Ctrl+Z reaches the workspace with the lane grid menu open is unverified (B recipe did not open the menu)', 'source': 'b-round-246/head-vol-menu.json gridMenuUndo menuOpen 0', 'added': ADDED},
 {'id': 'INFO-B247-COLD-START-REACT', 'severity': 'info', 'status': 'info (D-29z417): environment, re-run clean', 'title': 'first scratch probe row logged "Cannot read properties of null (reading useState)" during Vite dependency optimisation on a cold start', 'source': 'b-round-246/scratch-attempt1.json, scratch-groupUndo1440.json', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)
dl = b['deferred_low_polish']
dids = {e.get('id') for e in dl}
lows = [
 {'id': 'A-R246-REVIEW-L1', 'severity': 'low', 'title': 'markers-ui has no row for "next flag removed in the same step, a later one survives" (a mutant checking only order[index + 1] passes MU23)', 'source': 'a-round-246.md section 6; browser behaviour correct: c-round-246/out-fix/c246-skip.json', 'repro': '4 markers, focus B, Cut Time over B and C, expect D focused', 'status': 'deferred_low_polish (D-29z413)', 'added': ADDED},
 {'id': 'GATE246-S3', 'severity': 'low', 'title': 'ArrangementMarkerRow inline flag ref: the saved order relies on the inline closure; a short Georgian comment would protect it', 'source': 'gates/round-246/review.md suggestion 3', 'repro': 'ArrangementMarkerRow.tsx l.825', 'status': 'deferred_low_polish (D-29z413)', 'added': ADDED},
 {'id': 'GATE246-S4', 'severity': 'low', 'title': 'the { markerId, order } shape is written twice; declare one DetachedFlagFocus type', 'source': 'gates/round-246/review.md suggestion 4', 'repro': 'ArrangementMarkerRow.tsx l.126 and l.178-181', 'status': 'deferred_low_polish (D-29z413)', 'added': ADDED},
 {'id': 'INFO-C246-DRAG-RING', 'severity': 'low', 'title': 'after a mouse drag a focused marker flag matches :focus-visible but its computed outline is none 0px (solid 1px brass before the drag); identical at e9fb805', 'source': 'c-round-246.json info; c-round-246/out-fix/c246.json and out-head/c246.json focusStability', 'repro': 'focus a flag by keyboard, mouse-drag it 60 px, read getComputedStyle(activeElement).outline', 'status': 'deferred_low_polish (D-29z413); question for the polish pass: should a dragged flag look selected instead of focus-ringed', 'added': ADDED},
]
for e in lows:
    if e['id'] not in dids:
        dl.append(e)
for r in b['retro_runs']:
    if r.get('round') == 245 and not str(r.get('status', '')).startswith('done'):
        r['status'] = 'done (D-29z412): RT-FIX-246 C PASS in round 246, published 869d767 | ' + str(r.get('status', ''))
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        add = ('C-GROUP-ORIGINS-247 (if round 247 done): group name (reached by Tab) focused, Ctrl+Z of Group Tracks -> the first member name button with a ring; '
               'Redo: Ungroup Tracks the same; focus elsewhere not moved; both viewports (D-29z418)')
        if add not in r['scope_additions']:
            r['scope_additions'].append(add)
sig = {'id': 'GATE246-ARCH-FOCUS-SUCCESSOR', 'origin': 'gates/round-246/review.md Architecture note (signals 3+4)', 'text': 'fourth focus-recovery ref in ArrangementMarkerRow; focus-after-removal reworked over several rounds; proposal: one focus-successor mechanism shared by marker flags and group rows instead of a second copy (acceptance MU18-23 + the group rows stay green)', 'status': 'signal (D-29z416); not scheduled; carried into ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 4 addendum (b-round-246-checkpoint-addendum.md); round 247 adds the group copy per D-29z415', 'added': ADDED}
if sig['id'] not in {e.get('id') for e in b['architecture_signals']}:
    b['architecture_signals'].append(sig)
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS':
        if 'D-29z416' not in r['question']:
            r['question'] += '; 4 addendum (D-29z416, b-round-246-checkpoint-addendum.md): after round 247 there are two per-owner ref-detach rescues (ArrangementMarkerRow flags, StudioWorkspace group rows); keep both or extract one helper'
        if 'GATE246-ARCH-FOCUS-SUCCESSOR' not in r['signals']:
            r['signals'].append('GATE246-ARCH-FOCUS-SUCCESSOR')
        r['status'] = 'requested from root again at the round-247 feature boundary (D-29z416); non-blocking; wanted before SABA-B-10a | ' + r['status']
rc = {'id': 'INFO-C246-VITE-CACHE', 'round': 246, 'text': 'C control server sharing store/node_modules/.vite rewrote the dependency cache for ~20 s; harness rule candidate: every second server uses per-entry node_modules links without .vite', 'added': ADDED}
if rc['id'] not in {e.get('id') for e in b['retro_candidates']}:
    b['retro_candidates'].append(rc)
for q in b['post_current_stage_queue']:
    if q.get('id') == 'SABA-B-9-10-11-TRANSPORT-GRID' and 'D-29z414' not in q['status']:
        q['status'] = ('in_progress (D-29z414): round 246 B-R243-UNDO-MARKER-FOCUS done (C PASS browserVerified, published 869d767); '
                       'round 247 = B-R245-UNDO-GROUP-FOCUS; then REGRESSION (on/after 2026-10-30), then SABA-B-11b stage 2b | ' + q['status'])
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['open_findings']), len(b['decisions_log_b']), len(b['deferred_low_polish']))
