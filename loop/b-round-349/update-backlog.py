# B round 349 -> 350 planning: backlog.json update (close-out of round 349 + dispatch of round 350).
# Run from the loop root: python3 -I b-round-349/update-backlog.py "<perf summary line>"
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-349/backlog-before-350.json')
DONE = pathlib.Path('b-round-349/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
PERF = sys.argv[1]
b = json.loads(P.read_text())
assert b['version'] == 311, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 349 -> 350 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1111', 'Round 349 closed as PASS from independent C evidence: c-round-349.json taskStatus PASS, browserVerified/realVerified true, 10 rows passed (CLAIMS, SOURCE-SCOPE, READ, PERF 70/70 asserted 252 rows 165 EQUAL/0 DIFF/22 NEW durationMs 491771, GRAB-PROBE, MUTANT red as predicted, PERF-LIB 40/40, G349-AUTH both viewports, VIDEO-SMOKE both viewports, DOCS), 0 bugs, 0 blocked. Gate 349 published 7f56989 on both remotes (gates/gate-round-349.json). Baseline for round 350 = 7f56989 (includes root docs-only aca59b3, direction decision). Stage video-trim-fade (PERF-CAND-VIDEO-TRIM-FADE-ROWS) done; measured video trim 18.683/move, fade 8.85, release-restarts 31.')
dlog('D-29z1112', 'Round-349 notes routed: GATE349-S1 (spec run time 490693 ms, 91% of STOP) -> closed_info, evidence on ROOT-REQ-PERF-TIMEOUT; GATE349-S2 (video trim/fade grabs depend on timeline x~0; Home before the first playing video drag if flaky) -> deferred_low_polish; GATE349-S3/S4 info -> closed_info; C-R349-INFO-LIVE and C-R349-COLD-VITE info -> closed_info. Architecture signals A-R349-ARCH-VIDEO-SPEC-SPLIT and GATE349-ARCH-SPEC-SPLIT join ARCH-R339-DRAG-MEASURE-EXTRACT (checkpoint question 3); not scheduled.')
dlog('D-29z1113', 'Round 350 cause and shape (PERF-CAND-VIDEO-TRIM-FADE-COST stage 1): B names probe on HEAD dev (b-round-349/video-names-dev.json) video trim 19/move, fade 9, move 17; the 6 extra are ArrangementVideoDock, Caption, FadeOverlay, GapCaption, Maximize2 + forwardRef because the dock body subscribes useArrangementPreviewLaneClips (l.195-198) and passes a new videoLaneArrangement to its children. Fix in ArrangementVideoDock.tsx only: useVideoLanePreviewReader {readVideoLaneArrangement, subscribeVideoLanePreview} memoised on [arrangement, getArrangement, previewStore]; Caption/GapCaption useSyncExternalStore over position+preview (string snapshot); FadeOverlay imperative writer subscribed to preview; stopped-seek effect reads the reader and subscribes to preview. Sketch /home/runner/b349-scratch/sk (b-round-349/sketch-dock.diff.txt): names trim 13, fade 3, move 11; behaviour probe identical to HEAD (trim inside: currentTime unchanged; trim early: gap live; fade: opacity follows 1.000/0.469/0.242; Undo restores); covering 107 files 1768/1768; ' + PERF)
dlog('D-29z1114', 'Release-order ruling: tech-lead and performance-optimizer both found High on B sketch 1 (reader based on the render-time arrangement: on pointerup updateHistory sets historyRef then batched setHistory then clearPreview, which notifies at once, so the overlay wrote the pre-drag opacity and the stopped seek could target the pre-drag clip). Ruled: the reader base is getArrangement() (historyRef.current.present, updated before clearPreview); element-wise reuse of the lane clips (tech-lead Medium). B release probe (b-round-349/video-release-probe.mjs): HEAD 0 writes, fixed sketch 0 writes, sketch 1 (kept as mutant M-B1) 2 opacity mutations with oldValue 1.000. Becomes A test DP69 and C row RELEASE.')
dlog('D-29z1115', 'Round 350 keeps the 22 PERF-CAND-VIDEO-TRIM-FADE-ROWS rows record (L58: an asserted number is C own saved output; performance-optimizer: record first). They convert to assert after C round 350, as a budgets-only change in the next PERF-CAND task (target trim <= 15, fade <= 4 per move). No interactions-spec row is added (D-29z1108 freeze holds until ROOT-REQ-PERF-TIMEOUT or a split). New recorded candidate: the video move 4th probe sample renders the whole tree (82) on HEAD and sketch alike = project-end crossing, joins PERF-CAND-MASTER-GROUP-FADER-PROPS.')
dlog('D-29z1116', 'Round 350 dispatched: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 (current-task.md; 3 files: ArrangementVideoDock.tsx, drag-preview-render.test.tsx DP66-DP71, doc 232; claims b-round-349/claims-350.sh; mutants M-B1..M-B4; C rows CLAIMS, SOURCE-SCOPE, READ, UNIT, MUTANT, PERF, NAMES, BEHAVIOUR, RELEASE, PLAY-SYNC, G350-AUTH, DOCS). Next: RETRO 351 (window 336-350; ROOT-REQ-PERF-TIMEOUT to Saba if still open, L46), then the 22-row conversion + PERF-CAND-MASTER-GROUP-FADER-PROPS, PERF-CAND-FADE-RELEASE-COMMITS, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1..3, STORE-2b..5. REGRESSION due on or after 2026-11-08.')
dlog('D-29z1117', 'Store direction gate met: root commit aca59b3 added docs/technical/store-redesign/direction-decision.md (A Obsidian & Brass, Saba delegated the choice to root 2026-11-05). STORE-2b..5 are no longer waiting on the direction; they keep their queue place after STUDIO-PERFORMANCE and SYS-1..3 (D-29z172 order unchanged). No task change now.')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1111): C round 349 PASS browserVerified=true realVerified=true; gate 349 published 7f56989'
b['rounds'].append({'round': 350, 'task': 'current-task.md', 'decision': 'D-29z1111..D-29z1117', 'type': 'PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 (video dock stops rendering per drag move)', 'status': 'dispatched', 'note': 'baseline 7f56989 clean; sketch b-round-349/sketch-dock.diff.txt; claims b-round-349/claims-350.sh; probes b-round-349/video-*-probe.mjs', 'added': ADDED})

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1116): video-trim-fade rows done (round 349, 7f56989); round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 | ' + sp['status']
sp['execution_order_d29z1116'] = [
    '350 PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 (video dock per-move render removed; rows stay record)',
    'RETRO 351 (window 336-350; ROOT-REQ-PERF-TIMEOUT to Saba if still open, L46)',
    'PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 = convert the 22 rows to assert at C round 350 values (budgets only), may join the next PERF-CAND task',
    'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing (move <= 15 incl. crossing; item target)',
    'PERF-CAND-FADE-RELEASE-COMMITS',
    'PERF-9..15',
    'SYS-R2-FAKE-FIDELITY',
    'SYS-CLOCK-DETERMINISM',
    'next REGRESSION due on or after 2026-11-08',
]
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1116): video-trim-fade rows done (C round 349 PASS, 7f56989; 252 rows, 70 asserted); round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 | ' + dp['status']
dp['stage_video_trim_fade_cost_contract_d29z1113'] = {
    'task': 'current-task.md round 350',
    'files': ['app/components/arrangement/ArrangementVideoDock.tsx', 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx', 'docs/implementation/2026/quarter-IV/232-perf-drag-preview.md'],
    'sketch': 'b-round-349/sketch-dock.diff.txt (full file b-round-349/sketch-ArrangementVideoDock.tsx)',
    'expected': 'names per move trim 13, fade 3, move 11 (first 3 moves); behaviour and release order identical to HEAD',
    'perf_sketch': PERF,
    'rows': 'stay record this round (D-29z1115)',
}

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'wanted (D-29z1116): still no answer artifact at round 350 planning; question 3 also gathers A-R349-ARCH-VIDEO-SPEC-SPLIT and GATE349-ARCH-SPEC-SPLIT (video block into its own spec with its own timeout) | ' + acr['status']

for s in [
    {'id': 'A-R349-ARCH-VIDEO-SPEC-SPLIT', 'origin': 'A round 349 code-reviewer Architecture note', 'note': 'measureDrag now carries a third set of gestures; when the spec is split, the video block moves into its own spec file with its own timeout budget; join ARCH-R339-DRAG-MEASURE-EXTRACT', 'status': 'signal, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3 (D-29z1112); not scheduled', 'added': ADDED},
    {'id': 'GATE349-ARCH-SPEC-SPLIT', 'origin': 'gate 349 review Architecture note', 'note': 'split the interactions spec by gesture family; move measureDrag, dragTarget, DragMeasure into perf/lib; acceptance: 252 ids identical, 70 asserts green, each file durationMs well under timeout', 'status': 'signal, joined to ARCH-R339-DRAG-MEASURE-EXTRACT (D-29z1112); not scheduled', 'added': ADDED},
]:
    b['architecture_signals'].append(s)

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'overdue (L46, D-29z1112): still not applied at round 350 planning (config 15 min); round 349 A 490693 ms, C 491771 ms (bound 450000, STOP 540000); deadline RETRO 351 -> one Saba question | ' + rr['status']

for f in [
    {'id': 'GATE349-S1', 'severity': 'low', 'origin': 'gate 349 review', 'title': 'interactions spec run time durationMs 490693 (55% of timeout, 91% of the 540000 STOP)', 'evidence': 'gates/round-349/review.md finding 1', 'status': 'closed_info (D-29z1112): evidence on ROOT-REQ-PERF-TIMEOUT; no rows added until it lands'},
    {'id': 'GATE349-S2', 'severity': 'low', 'origin': 'gate 349 review', 'title': 'video trim/fade grabs depend on the timeline at x~0; the playing trim relies on resetAfterDrag restoring scroll', 'evidence': 'gates/round-349/review.md finding 2', 'repro': 'not reproduced (6/6 grabs live x 3 passes in A, C and B runs)', 'status': 'deferred_low_polish (D-29z1112): if it flakes, press Home before the first playing video drag'},
    {'id': 'GATE349-S3', 'severity': 'info', 'origin': 'gate 349 review', 'title': 'setLive ANDs with the previous value; liveness honest', 'evidence': 'gates/round-349/review.md finding 3', 'status': 'closed_info (D-29z1112)'},
    {'id': 'GATE349-S4', 'severity': 'info', 'origin': 'gate 349 review', 'title': '22 new rows record with budget null as intended', 'evidence': 'gates/round-349/review.md finding 4', 'status': 'closed_info (D-29z1112)'},
    {'id': 'C-R349-INFO-LIVE', 'severity': 'info', 'origin': 'C round 349 note', 'title': 'drag-video-trim-live is also fed by the stopped drag; an abort stays loud via failures', 'evidence': 'c-round-349.json notes', 'status': 'closed_info (D-29z1112)'},
    {'id': 'C-R349-COLD-VITE', 'severity': 'info', 'origin': 'C round 349 note', 'title': 'cold Vite dep-optimize reload gave hydration errors once; warm rerun clean', 'evidence': 'c-round-349.json notes', 'status': 'closed_info (D-29z1112): environment noise'},
]:
    f['added'] = ADDED
    b['open_findings'].append(f)
b['deferred_low_polish'].append(dict(find(b['open_findings'], 'GATE349-S2')))

b['current_task'] = 'current-task.md (round 350: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1)'
b['version'] = 312
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v312')
