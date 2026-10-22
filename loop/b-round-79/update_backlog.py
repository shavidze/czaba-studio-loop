import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
g = items['SRW-17']
for st in g['stages']:
    if st.get('stage') == '1':
        st['status'] = 'c_pass_published'
        st['c_round79_passed'] = ["TG-SELECT","TG-GROUP","TG-NEST","TG-UNGROUP","TG-RENAME","TG-REFUSE","TG-DRAG-OVER-GROUP","TG-MARQUEE","TG-FIT","TG-AUDIO","REG-ACTIVE-TRACK","REG-SNAP-G","REG-LANE-CONTROLS","REG-HYD","G79-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)","T79-TARGETED","SOURCE-UNCHANGED"]
        st['browserVerified'] = True
        st['realVerified'] = True
        st['published'] = '74eca159268bc364cdad9b183c6031a64c8d2b6a'
        st['evidence'] = ['c-round-79.md', 'c-round-79.json', 'gates/gate-round-79.json', 'gates/round-79/review.md']
    if st.get('stage') == '2':
        st.update({'round': 80, 'decision': 'D-29z45', 'status': 'dispatched',
          'scope': 'collapse/expand a group: fold button + plain U on selected groups (view state collapsedGroups in TrackLaneLayout, no history, stale ids filtered); hidden descendant rows not rendered (out of DOM/a11y tree; collapse is not mute); collapsed header shows an overview band of descendant clips (selected state shown); collapsed label with clip count; active-lane accent on a collapsed group containing the active lane; collapse prunes hidden rows from track selection, hidden clips from clip selection and a lane range on a hidden lane; fit on the visible lanes only, written back by track id; focus extras F1 (Ctrl+G -> new group button), F2 (Ctrl+Shift+G -> first child, never BODY), F3 (collapse -> group button); shortcut hint; doc 069 status line',
          'c_ids': ['FOLD-BUTTON','FOLD-U','FOLD-NESTED','FOLD-A11Y','FOLD-OVERVIEW','FOLD-FIT','FOLD-SELECTION','FOLD-ACTIVE','FOLD-DRAG-OVER','FOLD-MARQUEE','FOLD-AUDIO','FOLD-UNDO','FOCUS-GROUP','FOCUS-HIDDEN','HINT','REG-TG','REG-LANE-FOLD','REG-ZOOM-KEYS','REG-HYD','G80-3','T80-TARGETED','SOURCE-UNCHANGED'],
          'tech_lead': 'R80-T (overview readability, active accent on a collapsed group, U next to g/m)'})
g['status'] = 'in_progress (stage 1 C PASS browserVerified, published 74eca15; stage 2 dispatched round 80, D-29z45; stage 3 planned; none deferred)'
g['ableton_round80'] = ('Live 12 sec. 18.3 (b-round-78 capture l.96, l.102/104): Unfold Group button in the title bar shows/hides the group tracks (confirmed text); folded group track in Arrangement shows an overview of contained clips (confirmed text); '
                        'sec. 42 (b-round-71 capture): Collapse/Expand Grouped Tracks U, Fold/Unfold Selected Tracks U or left/right arrows, Unfold All Tracks Alt+U, Show/Hide Grouped Tracks +/- (confirmed text). '
                        'CZABA: U on selected groups only (track U / arrows not bound: signal TRACK-FOLD-U); +/- stay zoom (deliberate difference); fold has no history (unconfirmed in Live, CZABA choice like track fold); mixed-state U = any expanded -> collapse all (CZABA choice); expanded-group overview unconfirmed -> not shown')
b['current_task'] = ('current-task.md (round 80: D-29z45 - SRW-17 stage 2: group collapse/expand via fold button and U, hidden rows not rendered, overview band, selection pruning, fit on visible lanes, focus extras F1-F3, shortcut hint. '
                     'Baseline HEAD 74eca15 clean; frozen b-round-79-r80-tree-sha256.txt 465; owned groups.ts (new exports), ArrangementGroupHeader.tsx, StudioWorkspace.tsx, doc 069 status line, new track-group-collapse.test.ts + track-group-collapse-ui.test.tsx, new doc 070. '
                     'Next: regression round if round-81 planning falls on/after 2026-10-24, then SRW-17 stage 3, SRW-18..20, Lows batch.)')
b['updated'] = '2026-10-22 (B round 79 review -> round 80 task, D-29z45)'
b['version'] = 79
for r in b['rounds']:
    if r.get('round') == 79:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true, no bugs (observations O1-O4); gate 79 published 74eca15 to both remotes (review 8.5/10 COMMIT OK, verify 111 files / 1871 tests)'
if not any(r.get('round') == 80 for r in b['rounds']):
    b['rounds'].append({'round': 80, 'task': 'current-task.md', 'decision': 'D-29z45', 'status': 'dispatched',
        'items': ['SRW-17 stage 2 (FB-12): group collapse/expand (button + U), hidden rows, overview band, focus extras F1-F3'],
        'note': 'baseline HEAD 74eca15, clean tree; frozen b-round-79-r80-tree-sha256.txt 465/465; snapshots b-round-79-r80-snapshots (groups.ts 28d1c769 311, ArrangementGroupHeader.tsx de4b674c 144, StudioWorkspace.tsx cca9104e 2225, doc 069 9aea339f 116); protected 4/4',
        'owned': ['app/lib/arrangement/groups.ts (new pure exports only)', 'app/components/arrangement/ArrangementGroupHeader.tsx', 'app/components/arrangement/StudioWorkspace.tsx (collapsedGroups, U block, visible rows, pruning, fit, F1-F3, hint, header props)', 'docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md (status line only)', 'app/lib/arrangement/__tests__/track-group-collapse.test.ts (new)', 'app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md (new)'],
        'c_ids': g['stages'][1]['c_ids']})
tl = b['tech_lead_manual_checks']
if not any(t.get('id') == 'R80-T' for t in tl):
    tl.append({'id': 'R80-T', 'what': 'real Chrome on /studio-lab at 1440x900 and 1280x720: collapse a group (button and U) - the overview of the hidden clips reads well; the active accent on a collapsed group is understandable; U feels right next to g (Snap) and m (marker)', 'why': 'visual/feel of SRW-17 stage 2 (D-29z45)', 'status': 'open', 'added': 'round 79 planning'})
of = b['open_findings']
byid = {f.get('id'): f for f in of}
upd = {
 'ARCH-CHECKPOINT-SRW16': 'requested_from_root (B round 78 planning, 2026-10-22; non-blocking); SRW-17 addendum question 8 (useTrackRowSelection + collapse state) appended in B round 79 planning; no root result yet',
}
for k, v in upd.items():
    if k in byid:
        byid[k]['status'] = v
new = [
 {'id':'GATE79-S1-GROUP-BAND-POINTER','severity':'low','status':'open - Lows batch (the lane background handler takes a trackId and sets the active lane; a group row has none, so a grant needs a design decision: deselect/seek only, no marquee origin)','to':'B','title':'group header timeline band ignores the mouse: no deselect, seek or marquee start (gate-79 review #1)','evidence':'gates/round-79/review.md suggestion 1'},
 {'id':'GATE79-S2-UNGROUP-FOCUS-BODY','severity':'low','status':'scheduled round 80 (F2, D-29z45; C FOCUS rows)','to':'A','title':'after Ctrl+Shift+G the focused group button unmounts and focus falls to BODY (gate-79 review #2, C O2)','evidence':'gates/round-79/review.md suggestion 2; c-round-79/focus-after-group.json'},
 {'id':'GATE79-S3-SHORTCUT-HINT','severity':'low','status':'scheduled round 80 (H1, D-29z45)','to':'A','title':'Ctrl+G / Ctrl+Shift+G / F2 only in the group button title (gate-79 review #3)','evidence':'gates/round-79/review.md suggestion 3'},
 {'id':'GATE79-S4-MAC-HINT-TEXT','severity':'low','status':'open - Lows batch (refusal string may be locked by the frozen round-79 UI test; amend there)','to':'B','title':'empty-selection hint says Ctrl+click; on macOS Ctrl+click is the context menu, Cmd+click works (gate-79 review #4)','evidence':'gates/round-79/review.md suggestion 4; groups.ts l.289'},
 {'id':'GATE79-S5-MULTI-DRAG-LANE-TARGET','severity':'low','status':'signal - pre-existing ArrangementClip behaviour; Lows batch / drag owner','to':'B','title':'refused multi-clip move clears gesture.laneTarget while the single path keeps it; over a group header a multi-clip drag snaps back to its own lane (gate-79 review #5)','evidence':'gates/round-79/review.md suggestion 5; ArrangementClip.tsx l.432 vs l.497-504'},
 {'id':'GATE79-S6-ROWCOUNT-PER-RENDER','severity':'info','status':'acknowledged (cheap; reviewer: no change now)','to':'B','title':'trackGroupRowCount runs every render incl. drag preview frames','evidence':'gates/round-79/review.md suggestion 6'},
 {'id':'GATE79-S7-DOC069-STATUS','severity':'low','status':'scheduled round 80 (one status line, D-29z45)','to':'A','title':'doc 069 status line still says awaiting C','evidence':'gates/round-79/review.md suggestion 7'},
 {'id':'ARCH-R79-TRACK-ROW-SELECTION-HOOK','severity':'info','status':'signal - in ARCH-CHECKPOINT-SRW16 addendum question 8; both reviewers: keep for now, extract when stage 2/3 add fold/mixer; round 80 does not extract','to':'root','title':'StudioWorkspace gained track selection, anchor ref, group-count effect and command callbacks (2044 -> 2225 lines); proposal useTrackRowSelection hook with TG/GU tests unchanged','evidence':'a-round-79.md Architecture note; gates/round-79/review.md Architecture note'},
 {'id':'C-R79-O1-TRACK-SELECTION-NEVER-CLEARED','severity':'low','status':'open - Lows batch / product question (Escape or a clip/background click could clear it; unspecified)','to':'B','title':'track selection is never cleared, so Ctrl+G can group lanes chosen long before (A review #9)','evidence':'c-round-79.md O1; a-round-79.md review #9'},
 {'id':'C-R79-O2-FOCUS-AFTER-GROUP','severity':'low','status':'scheduled round 80 (F1, D-29z45)','to':'A','title':'after Ctrl+G focus stays on the track name button, so F2 does nothing until the group button is focused (A review #8)','evidence':'c-round-79.md O2; c-round-79/focus-after-group.json'},
 {'id':'C-R79-O3-GROUP-ROW-KEEPS-TARGET','severity':'info','status':'accepted (documented G10 choice)','to':'B','title':'a clip drag that passed a lane keeps that lane while the pointer is on a group row','evidence':'c-round-79.md O3'},
 {'id':'C-R79-O4-FIT-M-GT-V-UNREACHED','severity':'info','status':'acknowledged (covered by A jsdom TG10 only)','to':'B','title':'TG-FIT M > V branch not reachable at 1440x900 / 1280x720','evidence':'c-round-79.md O4'},
 {'id':'A-R79-REVIEW-RESIDUALS','severity':'low','status':'open - Lows batch (#4 lastHoverTrackId option; #6 lane name button ~20 px; #11 maxLength code units vs code points; #12 repeated trackGroupRows per click; #13 arrangementGroups/rowParentId naming; #14 inline rename status strings, hover:bg-surface)','to':'B','title':'A round-79 code-review residuals','evidence':'a-round-79.md Code review'},
 {'id':'TRACK-FOLD-U','severity':'info','status':'signal (Live 12 sec. 42 Fold/Unfold Selected Tracks U or left/right arrows; CZABA arrows nudge clips; not requested)','to':'B','title':'U on selected plain tracks and arrow-key fold are not bound; U acts on selected groups only (D-29z45)','evidence':'current-task.md round 80 section 4'},
 {'id':'GROUPS-NO-MODEL-SANITIZER','severity':'info','status':'signal (frozen model.ts; belongs with the model if project load/save ever arrives)','to':'B','title':'no normalizeTrackGroups sanitizer for groups in model.ts or the context','evidence':'a-round-79.md frozen-file note'},
]
for f in new:
    if f['id'] not in byid:
        of.append(f)
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of), b['version'])
