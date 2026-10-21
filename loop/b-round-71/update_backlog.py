import json
p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(p, encoding='utf-8'))
b['updated'] = '2026-10-21 (B round 71 planning -> round 72 task, D-29z37)'
EV71 = 'c-round-71.md, c-round-71.json (PASS, browserVerified true, realVerified true, bugs []); gates/gate-round-71.json published 1e469e5'

s15 = [i for i in b['items'] if i['id'] == 'SRW-15'][0]
s15['status'] = 'c_pass_tech_lead_manual (R15-T1 round 65 + R15-T2 round 66, C PASS browserVerified, published b5fb12b; ROOT-R65-M1 perf closed round 70, 2be45df; ROOT-R66-M1 perf closed round 71 C PASS browserVerified, 1e469e5; Tech Lead R65-T/R66-T/R70-T/R71-T open)'
s15['note_round71'] = 'C round 71 PASS (MT-BEATS*, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE, MH-SCRUB, MH-NODES* <=120 vs ~2200, MH-SCRUB-PERF, MT-LOOP, MT-EXPORT-REG, MT-OFF, REG-HYD, G71-3); root review 9/10 all Low; published 1e469e5'

s16 = [i for i in b['items'] if i['id'] == 'SRW-16'][0]
s16['status'] = 'in_progress (stage 1 dispatched round 72, D-29z37; stage 2 scheduled next)'
s16['files_note_round72'] = 'B round 71: markers get their own sticky ArrangementMarkerRow between TempoRow and the Loop row instead of ArrangementRuler.tsx (ruler stays frozen: RU-DBLCLICK watch, cheaper RU-REG). Stage 1 files: app/types/arrangement.ts (optional markers?), app/lib/arrangement/markers.ts (new), model.ts (deleteTime remap), ArrangementContext.tsx (cutTimeSelection status suffix), ArrangementMarkerRow.tsx (new), StudioWorkspace.tsx (wiring), markers.test.ts + markers-ui.test.tsx (new), doc 064'
s16['files'] = ['app/types/arrangement.ts', 'app/lib/arrangement/markers.ts', 'app/lib/arrangement/model.ts', 'app/contexts/ArrangementContext.tsx', 'app/components/arrangement/ArrangementMarkerRow.tsx', 'app/components/arrangement/StudioWorkspace.tsx', 'app/lib/arrangement/__tests__/markers.test.ts', 'app/lib/arrangement/__tests__/markers-ui.test.tsx']
s16['stages'] = [
    {'stage': 1, 'round': 72, 'decision': 'D-29z37', 'status': 'dispatched', 'scope': 'model (optional markers, normal form, never []), pure markers.ts, add via M/button at range.start or live position with name editor (Enter/blur commit, Escape cancel), duplicate-ms refusal, click jump, double-click play-from (stopped), Ctrl+Left/Right + buttons prev/next (markers, 0, end), F2 rename, Delete on focused marker, Undo/Redo, Cut Time remap (inside removed, after shifted) + status suffix, no resync (scheduleKey unchanged)', 'c_ids': ['MK-ADD*', 'MK-ADD-RANGE', 'MK-ADD-PLAYING/MK-NO-RESYNC', 'MK-ESC', 'MK-DUP', 'MK-JUMP', 'MK-PLAYFROM*', 'MK-NAV', 'MK-RENAME', 'MK-DELETE', 'MK-CUT-TIME', 'MK-LAYOUT*', 'MK-TYPING', 'MK-EXPORT-REG', 'REG-CHROME', 'REG-KEYS', 'REG-HYD', 'G72-3']},
    {'stage': 2, 'round': 'next SRW-16 round after stage 1 PASS', 'status': 'scheduled (not deferred)', 'scope': 'move markers by drag and arrows (with snap), right-click marker menu (Rename / Delete / Play from here = mouse rename path), snapping clips/range/playhead to markers (Live 6.7, SRW-14 extension), Ctrl+Left/Right also at clip edges (Live 6.9)'},
]
for a in s16['acceptance']:
    a['round72'] = {'R16-K1': 'MU1 + MK-ADD*', 'R16-K2': 'MU5/MU6 + MK-JUMP, MK-PLAYFROM*, MK-NAV', 'R16-K3': 'MK8/MK9/MU9 + MK-CUT-TIME (browser too)'}[a['id']]
s16['ableton_round72'] = 'Live 12 manual 6.4/6.9/6.11 + shortcuts page, re-fetched by B with gstack 2026-10-21 (b-round-71/ableton-*-20261021.txt): add at insert marker or time-selection start, real time in playback, click jumps, double-click (stopped) plays, prev/next buttons jump to start/end beyond first/last, Delete key, Rename Ctrl+R, Ctrl+arrows to locators and clip edges confirmed; no default key for Set/Prev/Next; locators under Delete Time not stated (unconfirmed)'

closed = {
    'ROOT-R66-M1-METRONOME-HORIZON': 'closed (C round 71 PASS browserVerified: MH-NODES* <=120 in 0.5 s at 999 BPM vs ~2200, MH-SCRUB-PERF, MT-BEATS*, MH-LONG, MH-END, MH-SCRUB; published 1e469e5)',
    'DOC-059-STATUS-LINE': 'closed (C round 71 R71-S: status line + one sentence; published 1e469e5)',
    'ROOT-R70-L6-DOC062': 'closed (C round 71 R71-S: doc 062 status line only; published 1e469e5)',
}
for f in b['open_findings']:
    fid = f.get('id')
    if fid in closed:
        f['status'] = closed[fid]
        f['closed_evidence'] = EV71
    if fid == 'ARCH-CHECKPOINT-SRW14-PREFS':
        f['note_round72'] = 'eighth request (round 72 task section 6): still unanswered; round 71 signals: root review Signal 4 (metronomeHorizonRef second refill state beside loopScheduleRef) and Signal 3 (startGraph changed rounds 66, 71), A reviewer note (fillMetronomeHorizon mirrors fillLoopIterations; keep, one scheduler unit only if a third refill kind appears); round 72 adds a 7th key-routing clause isMarkerTarget (ARCH (e)) and a 5th UI harness copy (ARCH (c)). Non-gating; B does not schedule an extraction'
    if fid == 'INFO-C66-RU-DBLCLICK-MISS-2':
        f['note_round72'] = 'ruler stays frozen in round 72 (markers get their own row); C REG-CHROME re-runs RU double-click 3 tries'

ids = {f.get('id') for f in b['open_findings']}
new = [
    {'id': 'ROOT-R71-L1-DOC063', 'severity': 'low', 'status': 'scheduled round 72 (doc 063 status line -> C PASS (round 71), 1e469e5; append root verify passed 101/1696 to the Gates bullet l.84)', 'to': 'A round 72', 'title': 'doc 063 says verify failed on all attempts and still awaits C; root verify passed', 'evidence': 'gates/round-71/review.md finding 1'},
    {'id': 'ROOT-R71-L2-HORIZON-CONST', 'severity': 'low', 'status': 'open - Lows batch (optional)', 'to': 'Lows batch', 'title': 'METRONOME_SCHEDULE_HORIZON_SECONDS (metronome.ts:9) and LOOP_SCHEDULE_HORIZON (ArrangementContext.tsx:138) are both 2 with nothing enforcing it; alias or document independence', 'evidence': 'gates/round-71/review.md finding 2'},
    {'id': 'ROOT-R71-L3-MUT-N-O', 'severity': 'low', 'status': 'open - Lows batch (merged with INFO-C71-MUT-N-O-GAPS)', 'to': 'Lows batch', 'title': 'metronome horizon test gaps: n (late margin 0: HU4 variant with a late pump < 20 ms before a beat), o (soundUntil in the loop branch: loop fixture where a click straddles loop.end)', 'evidence': 'gates/round-71/review.md finding 3; c-round-71.json INFO-C71-MUT-N-O-GAPS'},
    {'id': 'ROOT-R71-L4-RB-R9L2', 'severity': 'info', 'status': 'watch (merged with INFO-C71-RB-R9L2-SERIES: final 1/17, baseline 0/13; no distinguishing signal; the test never enables the metronome)', 'to': 'C/root', 'title': 'render-budget R9-L2 flaked once on the final round-71 tree', 'evidence': 'gates/round-71/review.md finding 4; c-round-71.json INFO-C71-RB-R9L2-SERIES'},
    {'id': 'ROOT-R71-ARCH-REFILL', 'severity': 'info', 'status': 'signal - merged into ARCH-CHECKPOINT-SRW14-PREFS (eighth request); reviewers: keep until a third refill kind', 'to': 'root', 'title': 'second refill pipeline (metronomeHorizonRef/fillMetronomeHorizon) beside loopScheduleRef/fillLoopIterations; startGraph touched in rounds 66, 70, 71; proposal: one pure refill planner + one ref', 'evidence': 'gates/round-71/review.md Architecture note; a-round-71.md section 6'},
    {'id': 'INFO-C71-MUT-H-EQUIVALENT', 'severity': 'info', 'status': 'closed (equivalent mutant: handleRef is nulled by stopGraph and fillMetronomeHorizon returns on a null handle)', 'to': '-', 'title': 'mutation h (stopGraph does not clear metronomeHorizonRef) cannot be killed', 'evidence': 'c-round-71.json info'},
    {'id': 'INFO-C71-ME-LENGTH', 'severity': 'info', 'status': 'acknowledged; round 72 fixtures use the measured 01:41.352 project end (B task assumption of 133 s corrected)', 'to': 'B', 'title': 'demo Middle East clip is 101.352 s, not 133 s', 'evidence': 'c-round-71.json info'},
    {'id': 'INFO-C71-LOOP-FIXTURE', 'severity': 'info', 'status': 'acknowledged (harness fixture note: a range needs a waveform; drop a muted clip first, as in round 66)', 'to': 'C', 'title': 'MT-LOOP with F-SILENT alone cannot create the 2-5 s range', 'evidence': 'c-round-71.json info'},
    {'id': 'INFO-C71-A-VITEST-CACHE', 'severity': 'info', 'status': 'root_note (stray tmp/studio-real-loop/node_modules/.vitest-cache from A round 71; root removes; agents do not run tools from tmp/studio-real-loop)', 'to': 'root', 'title': 'stray vitest cache folder in the loop directory', 'evidence': 'c-round-71.json info; a-round-71.md'},
    {'id': 'INFO-C71-GSTACK-START', 'severity': 'info', 'status': 'acknowledged (ENV-BROWSE-DAEMON pattern; second invocation started it)', 'to': '-', 'title': 'gstack daemon failed to start within 15 s on first invocation', 'evidence': 'c-round-71.json info'},
    {'id': 'INFO-C71-MH-END-METHOD', 'severity': 'info', 'status': 'acknowledged', 'to': '-', 'title': 'MH-END used Snap off + zoom out + a plain REAL ruler click', 'evidence': 'c-round-71.json info'},
    {'id': 'R72-T-TECH-LEAD', 'severity': 'info', 'status': 'open', 'to': 'Tech Lead', 'title': 'real Chrome: add three named markers on a long project with video; row placement, M + typed name, click/double-click/Ctrl+arrows feel, F2 rename acceptable until the stage-2 menu', 'evidence': 'current-task.md (round 72) 4.10'},
    {'id': 'VISUAL-A-ROOT-NOTE-20261021', 'severity': 'info', 'status': 'recorded by B round 71: order Phase 1 -> T12 -> VISUAL-A-OBSIDIAN (no further go-ahead) -> BLOCKED phase 2; not planned or mixed into Phase 1/T12 work; new Studio strings keep the current language until the M2 strings module', 'to': 'B', 'title': 'root note 2026-10-21 in root-pre-push-review.md: visual refresh A queued after T12', 'evidence': 'root-pre-push-review.md (Root note: visual refresh A queued, 2026-10-21); backlog post_current_stage_queue VISUAL-A-OBSIDIAN'},
]
for n in new:
    if n['id'] not in ids:
        b['open_findings'].append(n)

b['current_task'] = 'current-task.md (round 72: D-29z37 - SRW-16 (FB-10) named markers stage 1: optional Arrangement.markers, pure markers.ts, deleteTime remap, Cut Time status suffix, ArrangementMarkerRow between TempoRow and Loop row, M / Add button (range.start or live position) with name editor, click jump, double-click play-from, Ctrl+Left/Right + buttons prev/next, F2 rename, Delete on focused marker, no resync; markers.test.ts MK1-MK10 + markers-ui.test.tsx MU1-MU12 -> 103 files; doc 064 new, doc 063 two edits (ROOT-R71-L1); C: MK-ADD*, MK-ADD-RANGE, MK-ADD-PLAYING/NO-RESYNC, MK-ESC, MK-DUP, MK-JUMP, MK-PLAYFROM*, MK-NAV, MK-RENAME, MK-DELETE, MK-CUT-TIME, MK-LAYOUT*, MK-TYPING, MK-EXPORT-REG, REG-CHROME, REG-KEYS, REG-HYD, G72-3)'

for r in b['rounds']:
    if r.get('round') == 71:
        r['status'] = 'C PASS (browserVerified true); published 1e469e5'
if not any(r.get('round') == 72 for r in b['rounds']):
    b['rounds'].append({
        'round': 72, 'task': 'current-task.md', 'decision': 'D-29z37', 'status': 'dispatched',
        'items': ['SRW-16 stage 1 (FB-10): named markers', 'ROOT-R71-L1-DOC063'],
        'note': 'baseline HEAD 1e469e5, clean tree; frozen b-round-71-r72-tree-sha256.txt 442/442; snapshots b-round-71-r72-snapshots (arrangement.ts c4e5e1ce 94, model.ts 4d27aaeb 635, ArrangementContext.tsx 55437441 2946, StudioWorkspace.tsx 6b530ded 1966, doc 063 57726a52 92); Biome 4/218/1; vitest 101/1696 -> 103 files; end status 10 lines',
        'owned': ['app/types/arrangement.ts (additive)', 'app/lib/arrangement/markers.ts (new)', 'app/lib/arrangement/model.ts (deleteTime remap)', 'app/contexts/ArrangementContext.tsx (cutTimeSelection status suffix)', 'app/components/arrangement/ArrangementMarkerRow.tsx (new)', 'app/components/arrangement/StudioWorkspace.tsx (wiring)', 'app/lib/arrangement/__tests__/markers.test.ts (new)', 'app/lib/arrangement/__tests__/markers-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/064-studio-lab-markers.md (new)', 'docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md (two edits)'],
        'c_ids': ['R72-S', 'R72-U', 'G72-1', 'G72-2', 'G72-3', 'MK-ADD', 'MK-ADD-RANGE', 'MK-ADD-PLAYING', 'MK-NO-RESYNC', 'MK-ESC', 'MK-DUP', 'MK-JUMP', 'MK-PLAYFROM', 'MK-NAV', 'MK-RENAME', 'MK-DELETE', 'MK-CUT-TIME', 'MK-LAYOUT', 'MK-TYPING', 'MK-EXPORT-REG', 'REG-CHROME', 'REG-KEYS', 'REG-HYD']})

b['advisor_used_by_B'] = b['advisor_used_by_B'] + ' | round 71 planning (round 72 task): advisor available; consulted after orientation (optional markers field + never [], no-resync row, Delete Time decision + unconfirmed Ableton, range.start add, keys F2/Ctrl+arrows, isMarkerTarget + SRW-24 regression, own row keeps ruler frozen, VISUAL-A root note, F-ME length correction) and before completion'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok', len(b['open_findings']))
