import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
s = items['SRW-16']
for st in s['stages']:
    if st.get('stage') == '2b-2':
        st['status'] = 'c_pass_published'
        st['c_round77_passed'] = ["EK-ACTIVE","EK-SELECT","EK-RANGE","EK-BUTTONS","EK-MARKER-SEL","EK-AUDIO","EK-PLAYING","EK-ALT-LINUX","EK-GUARDS","REG-NUDGE","REG-MARKERS","T77-TARGETED","REG-HYD","G77-3 (fake-Bearer sub-check blocked: backend unavailable in cloud)","SOURCE-UNCHANGED"]
        st['browserVerified'] = True
        st['realVerified'] = True
        st['not_browser'] = 'Apple Option+arrows path: vitest EN7/EN9/EN11 only (Linux Chromium); Tech Lead R77-T open'
        st['published'] = '60006d4305c4ef316f5459e6fa29a48e7931b36c'
        st['evidence'] = ['c-round-77.md', 'c-round-77.json', 'gates/gate-round-77.json']
if not any(st.get('stage') == '2b-3' for st in s['stages']):
    s['stages'].append({
        'stage': '2b-3', 'round': 78, 'decision': 'D-29z43', 'status': 'dispatched',
        'scope': 'markers become snap candidates (nearest of grid line and markers, tie -> grid, no pixel radius; only when the resolved step is non-null: Snap on, or Snap off + Alt) at the ruler click seek, the ruler playhead scrub, the empty-lane click seek, the clip-waveform click seek, the in-clip time range edges and the loop brace move (start or end) / resize; no markers -> unchanged; loop arrow keys, marker drag, playhead arrows unchanged',
        'c_ids': ['MT-RULER','MT-SCRUB','MT-LANE','MT-CLIPCLICK','MT-RANGE','MT-LOOP-RESIZE','MT-LOOP-MOVE','MT-AUDIO','REG-SNAP-SEEK','REG-LOOP-KEYS','REG-CLIP-SNAP','REG-MARKERS','RU-DBLCLICK','T78-TARGETED','REG-HYD','G78-3','SOURCE-UNCHANGED'],
        'tech_lead': 'R78-T (marker capture feel on the 10 s grid)'})
s['status'] = ('in_progress (stage 1 C PASS round 73, published 6b574e8; stage 2a + fix-up C PASS round 75, published e347b97; '
               'stage 2b-1 C PASS round 76, published db9cc25; stage 2b-2 Ctrl/Option+arrows at clip edges C PASS round 77 browserVerified=true, published 60006d4; '
               'stage 2b-3 round 78 (ruler/lane/clip seeks, in-clip range and loop brace snap to markers, dispatched D-29z43); none deferred)')
b['current_task'] = ('current-task.md (round 78: D-29z43 - SRW-16 stage 2b-3: markers are snap candidates at the ruler click seek, ruler playhead scrub, empty-lane click seek, '
                     'clip-waveform click seek, in-clip range edges and loop brace move/resize; same rule as 2b-1 (nearest, tie -> grid, only with a non-null resolved step). '
                     'Baseline HEAD 60006d4 clean; frozen b-round-77-r78-tree-sha256.txt 455; owned grid.ts (one export), ArrangementRuler.tsx (prop + 3 expressions), '
                     'ArrangementClip.tsx (P4/P5), ArrangementLoopBrace.tsx (move/resize), StudioWorkspace.tsx (lane seek + ruler prop), doc 067 status line, '
                     'new marker-time-snap.test.ts + marker-time-snap-ui.test.tsx, new doc 068. Next: regression round (due 2026-10-24), then checkpoint request, GATE75 S1-S3, SRW-17.)')
b['updated'] = '2026-10-22 (B round 77 review -> round 78 task, D-29z43)'
rounds = b['rounds']
for r in rounds:
    if r.get('round') == 77:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true, no bugs; gate 77 published 60006d4 to both remotes'
if not any(r.get('round') == 78 for r in rounds):
    rounds.append({'round': 78, 'task': 'current-task.md', 'decision': 'D-29z43', 'status': 'dispatched',
        'items': ['SRW-16 stage 2b-3 (FB-10): playhead seeks, in-clip range and loop brace snap to markers'],
        'note': 'baseline HEAD 60006d4, clean tree; frozen b-round-77-r78-tree-sha256.txt 455/455; snapshots b-round-77-r78-snapshots (grid.ts 0398debc 295, ArrangementRuler.tsx 07cbc584 420, ArrangementClip.tsx 4b82508a 722, ArrangementLoopBrace.tsx e57566a7 265, StudioWorkspace.tsx dbc6895e 2037, doc 067 f0e786c6 95); protected 4/4',
        'owned': ['app/lib/arrangement/grid.ts (resolveGridTimeWithTargets only)', 'app/components/arrangement/ArrangementRuler.tsx (getSnapMarkerTimes prop + P1/P2)', 'app/components/arrangement/ArrangementClip.tsx (P4/P5)', 'app/components/arrangement/ArrangementLoopBrace.tsx (P6 move/resize)', 'app/components/arrangement/StudioWorkspace.tsx (P3 + ruler prop wiring)', 'docs/implementation/2026/quarter-IV/067-studio-lab-marker-edge-navigation.md (status line only)', 'app/lib/arrangement/__tests__/marker-time-snap.test.ts (new)', 'app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md (new)'],
        'c_ids': ['MT-RULER','MT-SCRUB','MT-LANE','MT-CLIPCLICK','MT-RANGE','MT-LOOP-RESIZE','MT-LOOP-MOVE','MT-AUDIO','REG-SNAP-SEEK','REG-LOOP-KEYS','REG-CLIP-SNAP','REG-MARKERS','RU-DBLCLICK','T78-TARGETED','REG-HYD','G78-3','SOURCE-UNCHANGED']})
of = b['open_findings']
ids = {f.get('id') for f in of}
new = [
 {'id':'GATE77-S1-MAC-OPTION-NOT-ADVERTISED','severity':'low','status':'open - Lows batch (merged with R77-BUTTON-SHORTCUT-SUPERSET / ROOT-R69-L2 / ROOT-R73-S2; no platform-dependent render string)','to':'B','title':'gate-77 reviewer S1: buttons declare aria-keyshortcuts Control+ArrowLeft/Right; macOS Option binding is not advertised and the key does more than the buttons','evidence':'gates/round-77/review.md S1'},
 {'id':'GATE77-S2-DOC067-STATUS','severity':'low','status':'scheduled round 78 (one status line, D-29z43)','to':'A','title':'doc 067 status line still says awaiting C','evidence':'gates/round-77/review.md S2'},
 {'id':'GATE77-S3-EDGE-SET','severity':'info','status':'open - Lows batch (optional)','to':'B','title':'clipEdgeTimesOnTracks uses trackIds.includes inside filter (O(clips x tracks) per keydown); a Set would be linear','evidence':'gates/round-77/review.md S3'},
 {'id':'GATE77-S4-EN10-CLOCK','severity':'info','status':'watch (fix with fakeClock.base if it ever flakes)','to':'B','title':'marker-edge-nav-ui EN10 checks the position against the real clock (< 2.75, 0.5 s window)','evidence':'gates/round-77/review.md S4'},
 {'id':'ARCH-R77-RESOLVE-ARROW-SHORTCUT','severity':'info','status':'signal - part of the SRW-16 boundary checkpoint request (after round 78); reviewer verdict keep for now','to':'root','title':'handleKeyDown arrow/modifier precedence changed in rounds 73/76/77; proposal: pure resolveArrowShortcut(...) -> step|nudge|block|browser|null with a table test; A note: a timeline-stops module if stops are reused','evidence':'gates/round-77/review.md Architecture note; a-round-77.md Architecture note'},
 {'id':'A-R77-CARRIED-POINTS','severity':'low','status':'open - Lows batch','to':'B','title':'EN7 locks Mac Option+Shift+Right = clip nudge (unspecified by B); adjacentMarkerTarget/stepMarker names now cover non-marker stops; Ctrl+Left while playing can repeat a stop (pre-existing); non-Apple Alt+arrows with a selected clip prevent browser Back/Forward (pre-existing N8)','evidence':'c-round-77.md For B 4; a-round-77.md'},
 {'id':'C-R77-OBS-RANGE-INTERVAL-WORDING','severity':'info','status':'acknowledged (B spec wording, not an A defect): N2 allTracks means every clip edge on every track, not only inside the range interval; matches Live 6.9 text','to':'B','title':'round-77 task EK-RANGE said edges in the interval after Ctrl+Shift+L','evidence':'c-round-77.md For B 1'},
 {'id':'C-R77-OBS-RANGE-SELECTS-CLIP','severity':'info','status':'acknowledged (harness note): a range drag in a clip waveform also selects that clip and makes its lane active; only vitest isolates range-only track rules','to':'C','title':'range drag selects the clip','evidence':'c-round-77.md For B 2-3'},
 {'id':'R78-T-TECH-LEAD','severity':'info','status':'open','to':'tech_lead','title':'real Chrome on the 10 s grid: marker capture of the playhead, ranges and loop edges (no pixel radius) feels right?','evidence':'current-task.md round 78 section 7'},
]
for f in new:
    if f['id'] not in ids:
        of.append(f)
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of))
