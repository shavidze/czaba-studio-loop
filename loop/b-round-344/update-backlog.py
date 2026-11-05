# B round 344 -> 345 planning, part 2 (dispatch of round 345): backlog v304 -> v305. Once-only. Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-344/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-344/update-backlog-closeout.done').exists():
    sys.exit('part 1 missing')
b = json.load(open('backlog.json'))
assert b['version'] == 304, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 344 -> 345 planning'


def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})


dec('D-29z1086', 'PERF-DRAG-PREVIEW c5-ii rulings from B sketch b-round-344/sketch (apply-source.py, apply-tests.py, apply-budgets.py on a git archive of c79642c): ArrangementClip.tsx previewGeometry = previewClipGeometry ?? previewArrangement (no isVideo branch); video fade readout through previewStatus like audio; group hasVideo / groupHasVideoClip / previewGroup removed; endStaleClipGesture previewArrangement(before) kept (shared restore, empties the store). ArrangementVideoDock.tsx: useVideoLaneArrangement(arrangement) = {...arrangement, clips: useArrangementPreviewLaneClips(arrangement, videoTrackId)} memoized; used by the stopped-sync effect (deps), caption, gap caption and fade overlay; hasVideoClips keeps React arrangement; playing sync keeps getArrangement(). ArrangementContext.tsx unchanged. Evidence: tsc 0; biome 0; drag-preview-render 64/64; 119 video test files 1800 tests; unit mutants red (HEAD source 8, dock committed 3, dock whole preview 1, fade status committed 2); production perf alone rc 0, 230 rows, 162 EQUAL, 3 DIFF (video stopped per-move 98.35 -> 23.617, both max 100 -> 25), 55/55, durationMs 471935 (perf run on the pre-rename sketch; final differs only by the rename and formatter reflow, sketch/source-perf-run-vs-final.diff); budgets: 5 video rows assert (stopped per-move <= 24, both release-commits == 1, playing move-restarts == 0, drag-video-live == 1), 60 asserted, sketch 0 fails, C344 HEAD 1 fail (computed); perf-lib 34/34; dock probe HEAD (dev) == sketch (prod) at 1440 and 1280; render probe prod: move 28.4, trim 26.95, fade 15.733/move (component names are minified in production, so provider/workspace/dock columns are not valid there; C runs the render rows on dev :5173). Consults: tech-lead (no Critical/High; applied rename videoLaneArrangement, DP53 c1 after release, DP61 pointercancel mid video fade, DP62 video move while playing), performance-optimizer (the 5-row assert rule; maxima, p95, release-restarts and the playing ratio stay record; video trim/fade harness rows later as record).')
dec('D-29z1087', 'Round 345 = PERF-DRAG-PREVIEW c5-ii (current-task.md): 6 files (ArrangementClip.tsx, ArrangementVideoDock.tsx, drag-preview-render.test.tsx, budgets, doc 232 whole, doc 168 Liveness + metrics). A rows: claims-345.sh, typecheck, lint, targeted unit, B mutant script, perf alone (60/60, 162 EQUAL, 3 video DIFF), perf-lib, scope, code-reviewer. C rows: CLAIMS, SOURCE-SCOPE, UNIT, own MUTANT, PERF, DOCK-FOLLOWS and RENDERS (browser dev :5173, both viewports), PERF-LIB, G345-AUTH, READ, DOCS. Reference-first / product-designer / screen budget / YouTube not applicable (performance round; DOCK-FOLLOWS proves behaviour equal to HEAD). After C PASS: root calls frontend-architect for ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.')
dec('D-29z1088', 'Reviewer findings from the c5-ii consults recorded, not scheduled: TL-R344-FADE-CANCEL-STATUS (tech-lead Medium, pre-existing at HEAD and pinned by DP11 for audio: after a pointercancel mid-fade the last readout stays as the committed status while the fade reverts) re-rated Low by B: it only follows a browser/system pointercancel, no data or audio changes, and the text names the last previewed value; -> deferred_low_polish with this rationale. TL-R344-CANCEL-COMMITS-MOVE (Low, pre-existing): pointercancel during move/trim commits the gesture; unmount mid-drag publishes the preview without an Undo entry -> deferred_low_polish. Signals: ARCH-R344-DOCK-SUBTREE (dock still renders on each video move; a child owning the overlays and the stopped-sync effect would avoid it) -> joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE; PERF-CAND-VIDEO-TRIM-FADE-ROWS (video trim and fade harness rows, record first) -> conversions stage.')

for r in b['rounds']:
    assert r.get('round') != 345
b['rounds'].append({'round': 345, 'task': 'current-task.md', 'decision': 'D-29z1084..D-29z1088', 'type': 'PERF-DRAG-PREVIEW stage c5-ii (video clip preview through the store; 5 video perf rows assert)', 'status': 'dispatched', 'note': 'baseline c79642c clean; patches b-round-344/sketch/{source,tests,budgets}.patch.txt; claims b-round-344/claims-345.sh', 'added': ADDED})

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1087): c5-i done (round 344); round 345 = PERF-DRAG-PREVIEW c5-ii | ' + perf['status']
perf['execution_order_d29z1087'] = ['345 PERF-DRAG-PREVIEW c5-ii (video preview through the store; 5 video rows assert)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect) after c5-ii C PASS', 'conversions (+ PERF-CAND-VIDEO-TRIM-FADE-ROWS)', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1087): round 345 = c5-ii | ' + st['status']
        st['stage_c5_ii_contract_d29z1087'] = 'current-task.md round 345; patches b-round-344/sketch/{source,tests,budgets}.patch.txt; perf b-round-344/perf-sketch-results; probes b-round-344/probe/'
        cands = st.setdefault('later_candidates_d29z1088', [])
        cands.append('PERF-CAND-VIDEO-TRIM-FADE-ROWS: video trim and fade drag rows in the interactions harness, record first (performance-optimizer, round 345 planning); fold into the conversions stage')

lows = [
    ('TL-R344-FADE-CANCEL-STATUS', 'after a pointercancel mid-fade (audio and, after c5-ii, video) the last readout ("Fade In: 2.000 s") stays as the committed status while the fade reverts to 0; pinned at HEAD by DP11; tech-lead rated Medium, B re-rated Low (only after a browser/system pointercancel; no data or audio change; text names the last previewed value) (D-29z1088)', 'tech-lead consult, round 345 planning (b-round-344.md)'),
    ('TL-R344-CANCEL-COMMITS-MOVE', 'pointercancel during a clip move or trim commits the gesture (ArrangementClip.tsx finishGesture); an unmount mid-drag publishes the preview without an Undo entry (pre-existing)', 'tech-lead consult, round 345 planning (b-round-344.md)'),
]
existing = {x.get('id') for x in b['deferred_low_polish']}
for i, title, ev in lows:
    assert i not in existing, i
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': 'tech-lead consult (B round 344 -> 345 planning), pre-existing at HEAD', 'title': title, 'evidence': ev, 'repro': 'press a clip fade handle or name bar, move, then dispatch pointercancel (DP11 / DP61 shape)', 'status': 'deferred_low_polish (D-29z1088)', 'added': ADDED})

assert all(s.get('id') != 'ARCH-R344-DOCK-SUBTREE' for s in b['architecture_signals'])
b['architecture_signals'].append({'id': 'ARCH-R344-DOCK-SUBTREE', 'origin': 'tech-lead consult, round 345 planning', 'note': 'after c5-ii the whole ArrangementVideoDock still renders on each video-clip move (useVideoLaneArrangement sits in the dock body); moving it into the overlays plus a small stopped-sync child would avoid that', 'status': 'signal (D-29z1088); question for ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE', 'added': ADDED})
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        a['status'] = 'due after round 345 C PASS (D-29z1087): root calls frontend-architect; questions (1) ArrangementClip.tsx preview paths (ARCH-R343-THREE-PREVIEW-PATHS), (2) ARCH-R344-DOCK-SUBTREE, (3) ARCH-R339-DRAG-MEASURE-EXTRACT + ARCH-R344-WITH-TEARDOWN + ARCH-R337-PERF-HELPERS-TO-LIB | ' + a['status']

b['version'] = 305
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 345: PERF-DRAG-PREVIEW c5-ii)'
b['advisor_used_by_B'] = 'yes (round 344 -> 345 planning: advisor consulted after orientation, before writing; and before declaring done)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
