import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
b['version'] = 74
b['updated'] = '2026-10-21 (B round 74 review -> round 75 task, D-29z40)'
b['current_task'] = ("current-task.md (round 75: D-29z40 - SRW-16 stage 2a fix-up: C-R74-01 MU8 l.526 test contract (Move Marker) + A-R74-MU8E-POINTERUP; "
  "C-R74-02 marker menu closes on a user horizontal timeline scroll (grid-menu follow predicate, follow auto-scroll keeps it open) and on a zoom change. "
  "Baseline HEAD 6b574e8 + round-74 tree (7 M + 3 ??); owned ArrangementMarkerRow.tsx, ArrangementMarkerMenu.tsx (one union member), StudioWorkspace.tsx (handleTimelineScroll only), "
  "markers-ui.test.tsx (MU8 title + l.526 + one assertion; MU8e two pointerUps + one release assertion), markers-move-ui.test.tsx (append MV15-MV17), doc 065. "
  "C rows MK-MENU-SCROLL, MK-MENU-VSCROLL, MK-MENU-ZOOM, MK-MENU-FOLLOW, MK-MENU-DOCK, MK-74-RECHECK, T75-TARGETED, REG-HYD, G75-3. Next: SRW-16 stage 2b (round 76).")
item = next(i for i in b['items'] if i.get('id') == 'SRW-16')
item['status'] = ("in_progress (stage 1 C PASS round 73, published 6b574e8; stage 2a: every browser row C PASS round 74 browserVerified=true, "
  "verdict FAIL on C-R74-01 (red unit test), gate 74 skipped, unpublished; fix-up round 75 D-29z40; stage 2b round 76, not deferred)")
for st in item['stages']:
    if st.get('stage') == 2:
        st['round'] = '74-75 (2a + fix-up) + 76 (2b)'
        st['status'] = 'split: 2a browser rows C PASS round 74 but verdict FAIL (C-R74-01), fix-up round 75 (D-29z40); 2b scheduled round 76 (not deferred)'
        for sub in st['substages']:
            if sub.get('stage') == '2a':
                sub['status'] = 'bug (browser rows C PASS round 74, verdict FAIL on C-R74-01; gate 74 skipped; fix-up round 75)'
                sub['c_round74'] = {
                    'verdict': 'FAIL', 'browserVerified': True, 'realVerified': True,
                    'passed': ['MK-DRAG-SNAP', 'MK-DRAG-FREE', 'MK-DRAG-CLICK', 'MK-MOVE-DUP', 'MK-ARROW', 'MK-DRAG-PLAYING', 'MK-MENU',
                               'MK-MENU-RENAME', 'MK-MENU-PLAY', 'MK-MENU-DELETE', 'REG-STAGE1', 'REG-KEYS', 'REG-HYD', 'G74-3 (non-backend rows)', 'SOURCE-UNCHANGED'],
                    'extra_passed_info': ['MK-DRAG-CROSS', 'MK-MENU-EDGE (right edge only)', 'MK-MENU-ONE', 'MK-CUT-TIME one run'],
                    'bugs': ['C-R74-01 (medium, red MU8 l.526 blocks the gate)', 'C-R74-02 (low, menu stays at its fixed position after a timeline scroll)'],
                    'blocked': ['G74-3 fake-Bearer 403: backend unavailable in cloud (got 500)'],
                    'notRun': ['menu over the floating expanded video dock', 'menu bottom-edge clamp (unreachable at both viewports)',
                               'native keyboard contextmenu button value (CDP sends no contextmenu)', 'WebKit/macOS Ctrl+click'],
                    'gate': 'skipped (gates/gate-round-74.json: C taskStatus FAIL)',
                    'evidence': 'c-round-74.md, c-round-74.json, c-round-74/'}
            if sub.get('stage') == '2b':
                sub['round'] = 76
                sub['status'] = 'scheduled round 76 (not deferred; moved one round by the 2a fix-up)'
        st['substages'].insert(1, {'stage': '2a-fix', 'round': 75, 'decision': 'D-29z40', 'status': 'dispatched',
            'scope': 'C-R74-01 MU8 contract grant + A-R74-MU8E-POINTERUP; C-R74-02 marker menu closes on a user horizontal timeline scroll (same follow predicate as the grid menu; Follow auto-scroll keeps it open; vertical scroll keeps it, the marker row is sticky) and on a pxPerSecond change; focus back to the flag with preventScroll',
            'c_ids': ['MK-MENU-SCROLL', 'MK-MENU-VSCROLL', 'MK-MENU-ZOOM', 'MK-MENU-FOLLOW', 'MK-MENU-DOCK', 'MK-74-RECHECK', 'T75-TARGETED', 'REG-HYD', 'G75-3']})
b['rounds'][-1]['status'] = 'C FAIL (browserVerified true; every browser row PASS; C-R74-01 medium test contract, C-R74-02 low); gate 74 skipped, round-74 code uncommitted in the tree'
b['rounds'].append({'round': 75, 'task': 'current-task.md', 'decision': 'D-29z40', 'status': 'dispatched',
  'items': ['SRW-16 stage 2a fix-up: C-R74-01 + A-R74-MU8E-POINTERUP + C-R74-02'],
  'note': 'baseline HEAD 6b574e8 + round-74 tree (7 M + 3 ??, A hashes confirmed by B); frozen b-round-74-r75-tree-sha256.txt 449/449; snapshots b-round-74-r75-snapshots (ArrangementMarkerRow 8b805616 789, ArrangementMarkerMenu 592bc1a7 160, StudioWorkspace d5a1ac9c 2012, markers-ui.test 5c7c697a 833, markers-move-ui.test a8508b4a 716, doc 065 608d86ec 82); protected 4/4; rounds 74+75 publish together',
  'owned': ['app/components/arrangement/ArrangementMarkerRow.tsx (closeMenu handle + zoom close)', 'app/components/arrangement/ArrangementMarkerMenu.tsx (one union member)',
            'app/components/arrangement/StudioWorkspace.tsx (handleTimelineScroll only)', 'app/lib/arrangement/__tests__/markers-ui.test.tsx (MU8 title, l.526, one assertion; MU8e two pointerUps + one assertion)',
            'app/lib/arrangement/__tests__/markers-move-ui.test.tsx (append MV15-MV17)', 'docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md'],
  'c_ids': ['MK-MENU-SCROLL', 'MK-MENU-VSCROLL', 'MK-MENU-ZOOM', 'MK-MENU-FOLLOW', 'MK-MENU-DOCK', 'MK-74-RECHECK', 'T75-TARGETED', 'REG-HYD', 'G75-3']})
ids = {f.get('id') for f in b['open_findings']}
def add(f):
    if f['id'] not in ids:
        b['open_findings'].append(f); ids.add(f['id'])
add({'id': 'C-R74-01', 'severity': 'medium', 'status': 'scheduled round 75 (D-29z40 grant: MU8 l.526 toBe Move Marker + round-trip times assertion + title)', 'to': 'B',
     'title': 'markers-ui.test.tsx MU8 l.526 expects no undo entry after plain arrows on a focused flag; B5 (round 74) moves the marker by 0.1 s; red test blocks the gate. B spec defect (frozen stage-1 assertion contradicted the new contract), not an A deviation',
     'evidence': 'c-round-74.json, c-round-74/vitest-markers.txt, a-round-74.md section 4'})
add({'id': 'A-R74-MU8E-POINTERUP', 'severity': 'low', 'status': 'scheduled round 75 (test-only)', 'to': 'B',
     'title': 'MU8e pointerdowns 75/76 never get a pointerUp, so a gesture claim stays active for the rest of MU8e (the name-editor half runs with isPointerGestureActive true)',
     'evidence': 'a-round-74.md section 7'})
add({'id': 'C-R74-02', 'severity': 'low', 'status': 'scheduled round 75 (D-29z40)', 'to': 'B',
     'title': 'marker menu stays open at its old fixed position after a 300 px wheel scroll of the timeline (the flag moved away); the lane grid menu closes on a user scroll',
     'evidence': 'c-round-74.json, c-round-74/shots/menu-scrolled-*.png'})
add({'id': 'GATE-74-SKIPPED', 'severity': 'info', 'status': 'open_root', 'to': 'root',
     'title': 'Round 74 root gate skipped (C FAIL); round-74 code is uncommitted in the tree; rounds 74+75 publish together after C PASS', 'evidence': 'gates/gate-round-74.json'})
add({'id': 'INFO-C74-KEYBOARD-CONTEXTMENU-BUTTON', 'severity': 'info', 'status': 'open (untestable by C: CDP key presses send no contextmenu event; ALT-CHROME-MENU class); Tech Lead real-keyboard check',
     'to': 'B', 'title': 'native ContextMenu-key / Shift+F10 contextmenu event button value and the A guard (button !== 2) are unverified in a real keyboard path; the keydown branch opens the menu',
     'evidence': 'c-round-74.json notRun'})
add({'id': 'INFO-C74-MENU-BOTTOM-UNREACHABLE', 'severity': 'info', 'status': 'acknowledged (marker row is in the sticky top chrome; bottom clamp unreachable at 1440x900/1280x720)', 'to': 'B',
     'title': 'marker menu bottom-edge clamp cannot be reached at the two user viewports (menu bottom 343/381)', 'evidence': 'c-round-74.json notRun'})
add({'id': 'A-R74-MACOS-CTRL-CLICK', 'severity': 'low', 'status': 'open - with ROOT-R64-L5 (macOS Ctrl+click) in the Lows batch; needs a real Mac', 'to': 'B',
     'title': 'macOS Ctrl+click (button 0) on a flag starts a drag claim and the contextmenu anchors at the flag', 'evidence': 'a-round-74.md section 7'})
add({'id': 'R74-T-TECH-LEAD', 'severity': 'info', 'status': 'open', 'to': 'tech_lead',
     'title': 'real Chrome: drag a marker with Snap on/off/Alt, arrows on a focused flag, right-click and the ContextMenu key on a flag - menu feel, items and Play from here',
     'evidence': 'c-round-74.md'})
arch = next(f for f in b['open_findings'] if f.get('id') == 'ARCH-CHECKPOINT-SRW14-PREFS')
arch['note_round75'] = ('A round-74 reviewer Architecture note: ArrangementMarkerRow is the third copy of the claimPointerGesture + setPointerCapture + watchUncapturedPointerGesture + stale-end scaffold '
  '(ArrangementMarkerRow, ArrangementLoopBrace, ArrangementClip); keep for now, after SRW-16 consider one bounded extraction with the three callers\' tests as the gate. '
  'Round 75 adds a second copy of the follow-scroll predicate (grid-menu effect + handleTimelineScroll marker close) - recorded, not refactored. '
  'Both go into the bounded frontend-architect checkpoint request at the SRW-16 boundary (after stage 2b, round 76); non-gating.')
b['architecture_signals'].append({'round': 74, 'source': 'a-round-74.md section 7 Architecture note',
  'note': 'third copy of the pointer-gesture claim scaffold (marker row, loop brace, clip); keep for now; candidate bounded extraction after SRW-16; plus round-75 duplicated follow-scroll predicate. Appended to ARCH-CHECKPOINT-SRW14-PREFS; not scheduled on its own.'})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', item['status'])
