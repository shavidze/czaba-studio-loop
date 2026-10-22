import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
s = items['SRW-16']
for st in s['stages']:
    if st.get('stage') == '2b-3':
        st['status'] = 'c_pass_published'
        st['c_round78_passed'] = ["MT-RULER","MT-SCRUB","MT-LANE","MT-CLIPCLICK","MT-RANGE","MT-LOOP-RESIZE","MT-LOOP-MOVE","MT-AUDIO","REG-SNAP-SEEK","REG-LOOP-KEYS","REG-CLIP-SNAP","REG-MARKERS","RU-DBLCLICK","T78-TARGETED","REG-HYD","G78-3 (fake-Bearer sub-check blocked: backend unavailable in cloud)","SOURCE-UNCHANGED"]
        st['browserVerified'] = True
        st['realVerified'] = True
        st['published'] = 'c062147fc29f105454de7728cc4bbbe762f5cb6d'
        st['evidence'] = ['c-round-78.md', 'c-round-78.json', 'gates/gate-round-78.json', 'gates/round-78/review.md']
s['status'] = ('c_pass_tech_lead_manual (all stages C PASS browserVerified=true: stage 1 6b574e8, 2a e347b97, 2b-1 db9cc25, 2b-2 60006d4, '
               '2b-3 c062147; Tech Lead R72-T/R74-T/R77-T/R78-T open; fake-Bearer 403 sub-checks blocked: backend unavailable in cloud)')
g = items['SRW-17']
g['status'] = 'in_progress (stage 1 dispatched round 79, D-29z44; stages 2 and 3 planned; none deferred)'
g['stages'] = [
 {'stage': '1', 'round': 79, 'decision': 'D-29z44', 'status': 'dispatched',
  'scope': 'group model (track.groupId?, arrangement.groups? with parentId; normal form omits empty keys), track multi-selection (plain/Ctrl/Shift click on lane names, active lane unchanged), Ctrl/Cmd+G Group Tracks incl. nesting an existing group, Ctrl/Cmd+Shift+G Ungroup, refusals (empty, video, mixed parents, non-contiguous, gesture), group header rows (no data-track-id) with depth indent, F2 rename, Undo/Redo labels Group Tracks / Ungroup Tracks / Rename Group, laneTrackIdAtPointer keeps the previous target over a group row, auto-fit subtracts group rows; no audio change',
  'c_ids': ['TG-SELECT','TG-GROUP','TG-NEST','TG-UNGROUP','TG-RENAME','TG-REFUSE','TG-DRAG-OVER-GROUP','TG-MARQUEE','TG-FIT','TG-AUDIO','REG-ACTIVE-TRACK','REG-SNAP-G','REG-LANE-CONTROLS','REG-HYD','G79-3','T79-TARGETED','SOURCE-UNCHANGED'],
  'tech_lead': 'R79-T (Ctrl/Cmd+G in a real Chrome opens no find bar; rows read well)'},
 {'stage': '2', 'status': 'todo', 'scope': 'collapse/expand a group (button + U, Live 12 sec. 42), hidden children out of the a11y tree (doc 029 TODO), folded group row shows an overview of contained clips (Live 12 sec. 18.3); R17-G1 collapse half'},
 {'stage': '3', 'status': 'todo', 'scope': 'group Mute/Solo/Volume summing children in playback and export, nested groups, inner controls stay individually adjustable, half-coloured Solo when a child is soloed (R17-G2, R17-G3; Live 12 sec. 18.3)'},
]
g['ableton_round79'] = 'Live 12 manual sec. 18.2/18.3 captured 2026-10-22 (b-round-78/ableton-mixing-20261022.txt, sha256 792522f0...): Group Tracks command + nesting confirmed; Shift/Ctrl-click multi-select confirmed; ungroup confirmed; folded overview + mixer + half solo confirmed (stages 2/3). sec. 42 (b-round-71 capture): Ctrl+G / Ctrl+Shift+G / U / Ctrl+R confirmed. Deliberate differences: F2 rename, non-adjacent grouping refused (no track reorder in CZABA), video not groupable; empty selection refusal = CZABA decision'
b['current_task'] = ('current-task.md (round 79: D-29z44 - SRW-17 stage 1: track multi-selection, Ctrl/Cmd+G and Ctrl/Cmd+Shift+G incl. nesting, group header rows, F2 rename, Undo; no audio change. '
                     'Baseline HEAD c062147 clean; frozen b-round-78-r79-tree-sha256.txt 459; owned types/arrangement.ts (G1), new groups.ts, new ArrangementGroupHeader.tsx, ArrangementLane.tsx (name button/props/indent/selected), '
                     'ArrangementClip.tsx (laneTrackIdAtPointer), StudioWorkspace.tsx (selection, keys, rows, fit), doc 068 status line, new groups.test.ts + track-groups-ui.test.tsx, new doc 069. '
                     'Next: regression round as soon as planning falls on/after 2026-10-24, then SRW-17 stages 2-3, SRW-18..20, Lows batch.)')
b['updated'] = '2026-10-22 (B round 78 review -> round 79 task, D-29z44)'
rounds = b['rounds']
for r in rounds:
    if r.get('round') == 78:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true, no bugs; gate 78 published c062147 to both remotes (review 9/10, verify 109 files / 1846 tests)'
if not any(r.get('round') == 79 for r in rounds):
    rounds.append({'round': 79, 'task': 'current-task.md', 'decision': 'D-29z44', 'status': 'dispatched',
        'items': ['SRW-17 stage 1 (FB-12): track groups - multi-select, Ctrl+G / Ctrl+Shift+G, nesting, header rows, F2 rename'],
        'note': 'baseline HEAD c062147, clean tree; frozen b-round-78-r79-tree-sha256.txt 459/459; snapshots b-round-78-r79-snapshots (types/arrangement.ts 66832e8d 101, ArrangementLane.tsx 8bd53baf 957, ArrangementClip.tsx 5fa05648 731, StudioWorkspace.tsx 56e7ef00 2044, doc 068 ddd6b35c 96); protected 4/4',
        'owned': ['app/types/arrangement.ts (G1 only)', 'app/lib/arrangement/groups.ts (new)', 'app/components/arrangement/ArrangementGroupHeader.tsx (new)', 'app/components/arrangement/ArrangementLane.tsx (name button, props, indent, selected state)', 'app/components/arrangement/ArrangementClip.tsx (laneTrackIdAtPointer + caller line)', 'app/components/arrangement/StudioWorkspace.tsx (selection, Ctrl+G block, rows, fit)', 'docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md (status line only)', 'app/lib/arrangement/__tests__/groups.test.ts (new)', 'app/lib/arrangement/__tests__/track-groups-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md (new)'],
        'c_ids': ['TG-SELECT','TG-GROUP','TG-NEST','TG-UNGROUP','TG-RENAME','TG-REFUSE','TG-DRAG-OVER-GROUP','TG-MARQUEE','TG-FIT','TG-AUDIO','REG-ACTIVE-TRACK','REG-SNAP-G','REG-LANE-CONTROLS','REG-HYD','G79-3','T79-TARGETED','SOURCE-UNCHANGED']})
of = b['open_findings']
byid = {f.get('id'): f for f in of}
upd = {
 'GATE77-S2-DOC067-STATUS': 'closed round 78 (C SOURCE-UNCHANGED: doc 067 line 4 is B exact line; published c062147)',
 'GATE75-S1-ZOOM-MID-DRAG': 'open - Lows batch (regression-lock test only): B round 78 source read at c062147 shows it unreachable - every pxPerSecond write goes through applyTimelineView; workspace callers return on isPointerGestureActive (wheel l.1136, fit/zoom-range/zoom-back/step l.774-826); ruler navigation and overview drag need onGestureClaim, refused while the marker drag holds the claim',
 'GATE75-S2-POINTERCANCEL-COMMITS': 'open - Lows batch (with GATE75-S4..S6; cosmetic Low on ArrangementMarkerRow; revert on pointercancel, project precedent ArrangementLane l.522)',
 'GATE75-S3-BLOCKED-PRESS-SELECTS': 'open - Lows batch (with GATE75-S4..S6; move setSelectedMarkerId after claimPointerGesture; focus stays before the claim because settleEditor on blur refuses during a gesture, l.281)',
 'ARCH-R77-RESOLVE-ARROW-SHORTCUT': 'signal - in the SRW-16 boundary checkpoint request b-round-78-checkpoint-request.md (requested from root 2026-10-22); reviewer verdict keep for now',
 'ARCH-R76-SNAP-TARGETS-HELPER': 'signal - in the SRW-16 boundary checkpoint request b-round-78-checkpoint-request.md (requested from root 2026-10-22); reviewers: keep for now',
}
for k, v in upd.items():
    if k in byid:
        byid[k]['status'] = v
new = [
 {'id':'ARCH-CHECKPOINT-SRW16','severity':'info','status':'requested_from_root (B round 78 planning, 2026-10-22; non-blocking; SRW-16 feature boundary)','to':'root','title':'bounded frontend-architect checkpoint at the SRW-16 boundary: snap entry points in grid.ts (resolveSnapTime single entry, microsecond helper), snapTargetsFor, handleKeyDown arrow resolver, timeline-stops, ArrangementMarkerRow owner risk, isFollowAutoScroll duplicate, GATE76-S2 nearest in-bounds candidate; StudioWorkspace grows again in SRW-17','evidence':'b-round-78-checkpoint-request.md'},
 {'id':'GATE78-S1-LOOP-MICROSECOND-HELPER','severity':'low','status':'signal - in ARCH-CHECKPOINT-SRW16','to':'root','title':'ArrangementLoopBrace inline Math.round(x*1e6)/1e6 repeats grid.ts private toWholeMicroseconds; proposal snapLoopMoveStart or roundToMicroseconds export','evidence':'gates/round-78/review.md suggestion 1'},
 {'id':'GATE78-S2-SCRUB-GETTER-PER-MOVE','severity':'info','status':'acknowledged (keep for consistency with T7 unless profiling shows a cost); in ARCH-CHECKPOINT-SRW16','to':'B','title':'getSnapMarkerTimes() called on every playhead pointermove (new array, filter, sort)','evidence':'gates/round-78/review.md suggestion 2; a-round-78.md reviewer #6'},
 {'id':'GATE78-S3-DOC068-STATUS','severity':'low','status':'scheduled round 79 (one status line, D-29z44)','to':'A','title':'doc 068 status line still says awaiting C','evidence':'gates/round-78/review.md suggestion 3'},
 {'id':'ARCH-R78-RESOLVE-SNAP-TIME','severity':'info','status':'signal - in ARCH-CHECKPOINT-SRW16; reviewer: keep for now, low value low risk','to':'root','title':'grid.ts snap helpers grew in rounds 76-78 (four call sites each time); proposal one resolveSnapTime(time, {snapSeconds, gridSeconds, bypass, targets=[]}) and retire resolveGridTime (single caller ArrangementMarkerRow l.490)','evidence':'gates/round-78/review.md Architecture note; a-round-78.md Architecture note'},
 {'id':'A-R78-REVIEW-NAMING','severity':'low','status':'open - Lows batch / checkpoint','to':'B','title':'targets vs edges vs markerTimes name the same concept; 5 positional params on resolveGridTimeWithTargets','evidence':'a-round-78.md reviewer #5'},
 {'id':'C-R78-HARNESS-NOTES','severity':'info','status':'acknowledged (harness): ruler clicks at y = ruler bottom - 4 avoid the playhead handle; a click outside the viewport hits null; a 2 px drag is a click (DRAG_THRESHOLD_PX 3)','to':'C','title':'round-78 harness notes','evidence':'c-round-78.json harnessNotes'},
 {'id':'GROUP-NONADJACENT','severity':'info','status':'signal (deliberate CZABA difference, D-29z44 G6; not requested explicitly by the user)','to':'B','title':'Live 12 sec. 18.3 groups any selected tracks; CZABA refuses a non-contiguous selection because it has no track reorder','evidence':'current-task.md round 79 section 4'},
 {'id':'R79-T-TECH-LEAD','severity':'info','status':'open','to':'tech_lead','title':'real Chrome (Windows; Mac Cmd+G): Ctrl+G groups the selected lanes and no find bar opens; group rows and indentation read well at 1440x900 and 1280x720','evidence':'current-task.md round 79 section 5'},
]
for f in new:
    if f['id'] not in byid:
        of.append(f)
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of))
