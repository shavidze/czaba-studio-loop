# B round 350 -> 351 planning: backlog.json update (close-out of round 350 as C FAIL spec + dispatch of round 351 fix-up).
# Run from the loop root: python3 -I b-round-350/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-350/backlog-before-351.json')
DONE = pathlib.Path('b-round-350/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
b = json.loads(P.read_text())
assert b['version'] == 312, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 350 -> 351 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1118', 'Round 350 closed as C FAIL, origin B spec: c-round-350.json taskStatus FAIL, browserVerified/realVerified true, one Low C-R350-01 (task section 1.2 named mutant M-B2 as red on DP71; useArrangementPreviewLaneClips is shallow-deduped so an audio drag never re-renders the dock; reproduced by A STOP, C and B). Every product/perf/browser row PASS: PERF 252 rows 70/70, exactly the 9 sketch DIFFs (trim 12.817, fade 2.95, move 9.883 per move), durationMs 458650; NAMES 1440 trim 13 fade 3 move 11; BEHAVIOUR, RELEASE, PLAY-SYNC (|drift|<=0.014 s) both viewports; G350-AUTH both viewports. Gate 350 skipped (C taskStatus FAIL); baseline stays 7f56989 with A round-350 three files in the tree (dock sha256 037f62fa... = b-round-349 sketch). Not A fault.')
dlog('D-29z1119', 'Ruling on C-R350-01 (L10), option (a): M-B2 keeps an honest scope (DP66, DP67 red; DP71 green by design); DP71 render half guarded by M-B2prime (dock body useArrangementPreview((state) => state.preview); DP66/DP67/DP71 red) and its mutation half by A-M5 (overlay equal-value skip deleted; DP71 takeRecords length 2). B re-ran control 6/6, M-B2, M-B2prime, A-M5 on scratch /home/runner/b350-scratch/sk (b-round-350/mutant-*.log), matching A and C logs. No product or DP66-DP71 change. C also runs the browser half of the body-subscription mutant (names probe on M-B2prime scratch dev server), which round 350 never claimed.')
dlog('D-29z1120', 'A-R350-REVIEW-SEEK-TEST (reviewer Medium, test gap: no jsdom row drives the stopped-video seek through the reader + preview subscription) closed in round 351 by DP72: DP64 import pattern (blob:film), currentTime setter spy, stopped name-bar move drag +20/+40 px with playhead 2 s inside the clip; the last preview-time write equals playhead - previewStart + sourceOffset before release; Undo restores. B sketch b-round-350/sketch-dp72.patch.txt (54+/0-): file 74/74 (9.97 s), green 3/3, green on the HEAD 7f56989 dock, red on mutant M-B5 (stopped-seek effect drops subscribeVideoLanePreview).')
dlog('D-29z1121', 'Round-350 notes routed: A-R350-REVIEW-CACHED-TRACKS (Low, patched code) -> deferred_low_polish (fix cachedLane.tracks === base.tracks when the dock is next touched; not now, it would void C round-350 browser evidence); A-R350-REVIEW-TEST-NITS (DP70 caption/gap checks cannot fail, DP69 redundant writtenValues, Video Fade In literal) -> deferred_low_polish; C-R350-OBS-FADE-COVERS-TRIM (Low, pre-existing on HEAD: at 1280x720 with the clip >= 480 px the 10 px fade-in handle covers the centre of the trim-left handle) -> deferred_low_polish with C repro; C-R350-OBS-MOVE-4TH-SAMPLE (82 renders) already joins PERF-CAND-MASTER-GROUP-FADER-PROPS (D-29z1115). Architecture signal A-R350-ARCH-PREVIEW-READER (keep useVideoLanePreviewReader while single-consumer; extract to useArrangementPreviewLaneReader(trackId) on a second consumer) joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE; not scheduled. RETRO moves 351 -> 352 (window 336-351); ROOT-REQ-PERF-TIMEOUT deadline moves with it. Retro candidate RC-R350-MUTANT-PAIR-UNRUN.')
dlog('D-29z1122', 'Round 351 dispatched: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up (current-task.md; 2 edited files: drag-preview-render.test.tsx + DP72 from b-round-350/sketch-dp72.patch.txt, doc 232 ruling text and l.4 C round 351 pending; dock byte-identical; claims b-round-350/claims-351.sh). C rows: CLAIMS, SOURCE-SCOPE (dock hash), READ, UNIT 74/74, MUTANT jsdom (M-B2, M-B2prime, A-M5, M-B5) and browser (M-B2prime names), NAMES smoke 1440, G351-AUTH both viewports, DOCS; round-350 PERF/NAMES/BEHAVIOUR/RELEASE/PLAY-SYNC evidence cited by hash. Next: RETRO 352 (window 336-351), then stage 2 (22-row conversion, budgets only) with PERF-CAND-MASTER-GROUP-FADER-PROPS, PERF-CAND-FADE-RELEASE-COMMITS, PERF-9..15. REGRESSION due on or after 2026-11-08.')

b['rounds'][-1]['status'] = 'c_fail_spec (D-29z1118): C round 350 FAIL on C-R350-01 (Low, origin B spec); all product/perf/browser rows PASS, browserVerified true; gate 350 skipped; tree kept for round 351'
b['rounds'].append({'round': 351, 'task': 'current-task.md', 'decision': 'D-29z1118..D-29z1122', 'type': 'PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up (C-R350-01 mutant ruling + DP72 seek test)', 'status': 'dispatched', 'note': 'baseline 7f56989 + A round-350 three files; claims b-round-350/claims-351.sh; sketch b-round-350/sketch-dp72.patch.txt', 'added': ADDED})

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1122): round 350 C FAIL on a B spec mutant pair only; round 351 = fix-up (ruling + DP72) | ' + sp['status']
sp['execution_order_d29z1122'] = [
    '351 PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up (C-R350-01 ruling; DP72 closes A-R350-REVIEW-SEEK-TEST)',
    'RETRO 352 (window 336-351; ROOT-REQ-PERF-TIMEOUT to Saba if still open, L46)',
    'PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 = convert the 22 rows to assert at C round 350 values (budgets only), may join the next PERF-CAND task',
    'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing',
    'PERF-CAND-FADE-RELEASE-COMMITS',
    'PERF-9..15',
    'SYS-R2-FAKE-FIDELITY',
    'SYS-CLOCK-DETERMINISM',
    'next REGRESSION due on or after 2026-11-08',
]
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1122): video-trim-fade-cost stage 1 code verified by C round 350 (all rows PASS) but round FAIL on C-R350-01 spec; round 351 fix-up | ' + dp['status']
dp['stage_video_trim_fade_cost_fixup_d29z1119'] = {
    'task': 'current-task.md round 351',
    'files': ['app/lib/arrangement/__tests__/drag-preview-render.test.tsx', 'docs/implementation/2026/quarter-IV/232-perf-drag-preview.md'],
    'dock_sha256': '037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96',
    'mutant_map': {'M-B1': ['DP69'], 'M-B2': ['DP66', 'DP67'], 'M-B2prime': ['DP66', 'DP67', 'DP71'], 'A-M5': ['DP71'], 'M-B3': ['DP68'], 'M-B4': ['DP70'], 'M-B5': ['DP72']},
    'c350_measured': 'trim 12.817/move, fade 2.95, move 9.883; names trim 13 fade 3 move 11; durationMs 458650',
}

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'wanted (D-29z1121): still no answer artifact at round 351 planning; also gathers A-R350-ARCH-PREVIEW-READER | ' + acr['status']

b['architecture_signals'].append({'id': 'A-R350-ARCH-PREVIEW-READER', 'origin': 'A round 350 code-reviewer Architecture note', 'note': 'useVideoLanePreviewReader (ArrangementVideoDock.tsx) depends on the order inside updateHistory (historyRef before clearPreview); keep while single-consumer; on a second lane consumer open one bounded task to move it to useArrangementPreviewLaneReader(trackId) in ArrangementContext.tsx, keeping DP66-DP72 and the M-B1 release-order mutant red', 'status': 'signal, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (D-29z1121); not scheduled', 'added': ADDED})

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'overdue (L46, D-29z1121): still not applied at round 351 planning; deadline moves with the RETRO to round 352 -> one Saba question | ' + rr['status']

b['retro_candidates'].append({'id': 'RC-R350-MUTANT-PAIR-UNRUN', 'note': 'Candidate lesson: every mutant -> test pair a task names is run by B on the sketch with the new tests written in (not only mutants of asserted numbers); round 350 named M-B2 -> DP71 for tests that did not exist on the sketch and the pair could not be red (shallow-deduped hook). Evidence: C-R350-01, A STOP 350, b-round-350/mutant-*.log (1x).', 'added': ADDED})

new = [
    {'id': 'C-R350-01', 'severity': 'low', 'origin': 'B spec (C round 350)', 'title': 'task 350 section 1.2/2.2 named M-B2 as red on DP71; DP71 passes on M-B2 (shallow-deduped lane hook)', 'evidence': 'c-round-350/mutant-M-B2.log, a-round-350/mutant-M-B2.log, b-round-350/mutant-M-B2.log', 'status': 'ruled (D-29z1119): M-B2prime + A-M5 guard DP71; closes on C round 351 PASS'},
    {'id': 'A-R350-REVIEW-SEEK-TEST', 'severity': 'medium', 'origin': 'A round 350 code-reviewer', 'title': 'no jsdom test drives the stopped-video seek path through the reader and the preview subscription', 'evidence': 'a-round-350.md review findings', 'status': 'in_progress round 351 (D-29z1120): DP72, mutant M-B5; closes on C round 351 PASS'},
    {'id': 'A-R350-REVIEW-CACHED-TRACKS', 'severity': 'low', 'origin': 'A round 350 code-reviewer', 'title': 'the cached video lane keeps the old base tracks when clips are element-wise equal (safe today: previews never change tracks, reader rebuilt on commit)', 'evidence': 'a-round-350.md review findings', 'repro': 'not reproducible today (no preview changes tracks)', 'status': 'deferred_low_polish (D-29z1121): add cachedLane.tracks === base.tracks when the dock is next touched'},
    {'id': 'A-R350-REVIEW-TEST-NITS', 'severity': 'low', 'origin': 'A round 350 code-reviewer', 'title': 'DP70 caption/gap checks cannot fail on a fade commit; DP69 writtenValues check redundant; Video Fade In literal duplicates unexported VIDEO_FADE_LABELS', 'evidence': 'a-round-350.md review findings', 'repro': 'source reading', 'status': 'deferred_low_polish (D-29z1121)'},
    {'id': 'C-R350-OBS-FADE-COVERS-TRIM', 'severity': 'low', 'origin': 'pre-existing (C round 350 observation)', 'title': 'at 1280x720 with a clip >= 480 px wide, the 10 px fade-in handle covers the centre of the trim-left-edge handle; a press at the edge centre grabs the fade', 'evidence': 'c-round-350.json notes; c-round-350/behaviour-1280x720.json (trim grab at y+8)', 'repro': '/studio-lab 1280x720, zoom a clip to >= 480 px, press at the vertical centre of its left edge: the fade-in handle is hit; trim works near the top of the edge; same on HEAD 7f56989', 'status': 'deferred_low_polish (D-29z1121): compare with Live clip-corner fade handles in the polish pass'},
]
for f in new:
    f['added'] = ADDED
    b['open_findings'].append(f)
for i in ['A-R350-REVIEW-CACHED-TRACKS', 'A-R350-REVIEW-TEST-NITS', 'C-R350-OBS-FADE-COVERS-TRIM']:
    b['deferred_low_polish'].append(dict(find(b['open_findings'], i)))

b['current_task'] = 'current-task.md (round 351: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up)'
b['version'] = 313
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v313')
