import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
b['updated'] = '2026-10-21 (B round 73 review -> round 74 task, D-29z39)'
b['current_task'] = ("current-task.md (round 74: D-29z39 - SRW-16 stage 2a: move markers by drag/arrows with snap, collision refusal, "
  "right-click and Shift+F10 marker menu Rename/Play from here/Delete; baseline HEAD 6b574e8 clean; owned markers.ts, ArrangementMarkerRow.tsx, "
  "ArrangementMarkerMenu.tsx (new), ArrangementGridMenu.tsx (one export), StudioWorkspace.tsx (two props), markers.test.ts, markers-move-ui.test.tsx (new), "
  "markers-ui.test.tsx (MU8e two assertions), doc 065 (new), doc 064 status line). C rows MK-DRAG-SNAP/FREE/CLICK, MK-MOVE-DUP, MK-ARROW, MK-DRAG-PLAYING, "
  "MK-MENU*, REG-STAGE1, REG-KEYS, REG-HYD, G74-3. Next: SRW-16 stage 2b (round 75).")
item = next(i for i in b['items'] if i.get('id') == 'SRW-16')
item['status'] = ("in_progress (stage 1 C PASS round 73 browserVerified=true, published 6b574e8; stage 2a dispatched round 74 D-29z39; "
  "stage 2b scheduled round 75, not deferred)")
for st in item['stages']:
    if st.get('stage') == 1:
        st['status'] = 'c_pass_published'
        st['c_round73'] = {
            'verdict': 'PASS', 'browserVerified': True, 'published': '6b574e853d2c5c4317e38927d9d06ce2a3dba91b',
            'passed': ['C73-1', 'C73-2', 'MK-DELETE', 'C73-3', 'MK-NAV', 'MK-ADD-PLAYING', 'C73-4a header link', 'C73-4b vertical stickiness',
                       'C73-4c range stays', 'REG-KEYS', 'REG-HYD', 'G73-3 non-backend'],
            'blocked': ['G73-3 fake-Bearer 403: backend unavailable in cloud (open evidence for a backend-enabled check)'],
            'notRun': ['Safari/WebKit flag-to-flag focus (A-R73 review Medium 1) -> closed by construction in stage 2a B1 (press focuses the flag), C checks Chromium'],
            'evidence': 'c-round-73.md, c-round-73.json, gates/gate-round-73.json'}
    if st.get('stage') == 2:
        st['round'] = '74 (2a) + 75 (2b)'
        st['status'] = 'split: 2a dispatched round 74 (D-29z39); 2b scheduled round 75 (not deferred)'
        st['substages'] = [
            {'stage': '2a', 'round': 74, 'decision': 'D-29z39', 'status': 'dispatched',
             'scope': 'move markers by drag (3 px threshold, Snap grid / Alt free / Snap off ms, clamp 0) and plain arrows on a focused flag (grid line or 0.1 s), collision refusal, one Move Marker history entry, no click-jump after drag, press focuses flag; right-click / Shift+F10 / ContextMenu marker menu Rename / Play from here / Delete; aria-keyshortcuts (gate-73 reviewer S2 partial)',
             'c_ids': ['MK-DRAG-SNAP', 'MK-DRAG-FREE', 'MK-DRAG-CLICK', 'MK-MOVE-DUP', 'MK-ARROW', 'MK-DRAG-PLAYING', 'MK-MENU', 'MK-MENU-RENAME', 'MK-MENU-PLAY', 'MK-MENU-DELETE', 'REG-STAGE1', 'REG-KEYS', 'REG-HYD', 'G74-3']},
            {'stage': '2b', 'round': 75, 'status': 'scheduled (not deferred)',
             'scope': 'clips / range / playhead snap to markers (Live 12 6.7); Ctrl+Left/Right (macOS Option+Left/Right, Live 12 6.9 text) also stopping at clip edges of the selected tracks; gate-73 reviewer S1 macOS binding; ROW-RANGE-M UX signal review'}]
item['ableton_round74'] = ('Live 12 manual 6.4 (stored capture b-round-71/ableton-arrangement-view-20261021.txt): selected locators move by drag or arrow keys (confirmed); '
  'locator context menu exists with Edit Info Text / Loop to Next Locator / Set Song Start Time Here (CZABA menu Rename / Play from here / Delete = deliberate difference); '
  'arrow step, snap of locator drag, collision = unconfirmed (CZABA choices). 6.9: Ctrl (Win) / Option (Mac) + arrows snap insert marker to locators and clip edges of selected tracks (stage 2b).')
b['rounds'][-1]['status'] = 'C PASS (browserVerified true); published 6b574e8 (rounds 72-73)'
b['rounds'].append({'round': 74, 'task': 'current-task.md', 'decision': 'D-29z39', 'status': 'dispatched',
  'items': ['SRW-16 stage 2a (FB-10): marker move (drag/arrows, snap) + marker context menu'],
  'note': 'baseline HEAD 6b574e8, clean tree; frozen b-round-73-r74-tree-sha256.txt 445/445; snapshots b-round-73-r74-snapshots (markers.ts a677d653 157, ArrangementMarkerRow.tsx 7d83398e 431, StudioWorkspace.tsx 67e1786e 2010, ArrangementGridMenu.tsx 20e8a5b6 248, markers.test.ts 51ea7558 301, markers-ui.test.tsx d5e854bf 833, doc 064 adb44c78 94); protected 4/4',
  'owned': ['app/lib/arrangement/markers.ts (additive moveMarker)', 'app/components/arrangement/ArrangementMarkerRow.tsx',
            'app/components/arrangement/ArrangementMarkerMenu.tsx (new)', 'app/components/arrangement/ArrangementGridMenu.tsx (one export only)',
            'app/components/arrangement/StudioWorkspace.tsx (two props only)', 'app/lib/arrangement/__tests__/markers.test.ts',
            'app/lib/arrangement/__tests__/markers-move-ui.test.tsx (new)', 'app/lib/arrangement/__tests__/markers-ui.test.tsx (MU8e two assertions only)',
            'docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md (new)', 'docs/implementation/2026/quarter-IV/064-studio-lab-markers.md (status line)'],
  'c_ids': ['MK-DRAG-SNAP', 'MK-DRAG-FREE', 'MK-DRAG-CLICK', 'MK-MOVE-DUP', 'MK-ARROW', 'MK-DRAG-PLAYING', 'MK-MENU', 'MK-MENU-RENAME', 'MK-MENU-PLAY', 'MK-MENU-DELETE', 'REG-STAGE1', 'REG-KEYS', 'REG-HYD', 'G74-3']})
ids = {f.get('id') for f in b['open_findings']}
def add(f):
    if f['id'] not in ids:
        b['open_findings'].append(f); ids.add(f['id'])
add({'id': 'A-R73-SAFARI-FLAG-FOCUS', 'severity': 'medium', 'status': 'scheduled (round 74 B1: press explicitly focuses the flag; MV8 test); C verifies Chromium only, WebKit not available as evidence',
     'to': 'B', 'title': 'Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A', 'evidence': 'a-round-73.md code review Medium 1; c-round-73.json notRun'})
add({'id': 'ROOT-R73-S1-MAC-CTRL-ARROWS', 'severity': 'low', 'status': 'scheduled round 75 (SRW-16 stage 2b): Live 12 6.9 uses Option+arrows on Mac', 'to': 'B',
     'title': 'macOS reserves Ctrl+Left/Right for Spaces; marker prev/next reachable only by buttons', 'evidence': 'gates/round-73/review.md suggestion 1'})
add({'id': 'ROOT-R73-S2-FLAG-A11Y', 'severity': 'low', 'status': 'partly scheduled round 74 (aria-keyshortcuts B12); aria-current semantics kept (C harness), Lows batch',
     'to': 'B', 'title': 'F2/Delete only in title; aria-current=true for selection', 'evidence': 'gates/round-73/review.md suggestion 2'})
for sid, title in [('ROOT-R73-S3-MARKER-BUTTON-SIZE', 'marker +/◀/▶ buttons 16 px tall, below WCAG 2.2 2.5.8 24 px (matches existing chrome)'),
                   ('ROOT-R73-S4-EDITOR-OVERFLOW', 'marker name editor w-40 near the timeline end can widen horizontal scroll; markers past project end'),
                   ('ROOT-R73-S5-REF-CALLBACK', 'flag ref callback recreated every render (correct, cheap; nit)'),
                   ('ROOT-R73-S6-PENDING-FOCUS', 'pendingFocusRef may stay set if a commit is refused; low risk')]:
    add({'id': sid, 'severity': 'low', 'status': 'open - Lows batch', 'to': 'B', 'title': title, 'evidence': 'gates/round-73/review.md'})
add({'id': 'MARKER-STRIP-CONTEXT-ADD', 'severity': 'info', 'status': 'signal (not scheduled; not requested by the user)', 'to': 'B',
     'title': 'Live 6.4: scrub area context menu has Add Locator; CZABA empty marker strip has no custom menu', 'evidence': 'b-round-71/ableton-arrangement-view-20261021.txt'})
arch = next(f for f in b['open_findings'] if f.get('id') == 'ARCH-CHECKPOINT-SRW14-PREFS')
arch['note_round74'] = ('gate-73 reviewer Architecture note (signals 2+3): every self-key-handling widget (loop brace, separator, marker) needs isXTarget guards in the blur, Delete, Arrow and Ctrl+Arrow branches; C-R72-01 was one forgotten branch. '
  'Proposal isSelfHandledKeyTarget via data-studio-key-owner (value medium, risk low). Same as item (e); appended here instead of a seventh request. '
  'B asks root for the bounded frontend-architect checkpoint at the SRW-16 feature boundary (after stage 2b, round 75); non-gating.')
b['architecture_signals'].append({'round': 73, 'source': 'gates/round-73/review.md Architecture note + a-round-73.md reviewer note',
  'note': 'FOCUS_OWNING_TARGETS / isSelfHandledKeyTarget proposal; keep for now (reviewer); appended to ARCH-CHECKPOINT-SRW14-PREFS (e); checkpoint request at SRW-16 boundary. Not scheduled on its own.'})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', item['status'])
