import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-417/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 393, b['version']
BY = '2026-11-08 B round 417 -> 418 planning'
b['version'] = 394
b['updated'] = '2026-11-08 (B round 417 -> 418 planning: SYS-R416-PREVIEW-CONTROLLER dispatched)'
b['current_task'] = 'Round 418: SYS-R416-PREVIEW-CONTROLLER (library preview request token, deferred stream fallback, player re-entrancy; current-task.md)'
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 417:
        r['status'] = 'c_pass_published (C round 417 PASS, browserVerified/realVerified true; gate 417 published 061068d)'
b['rounds'].append({
    'round': 418, 'task': 'current-task.md', 'decision': 'D-29z1454..D-29z1457',
    'type': 'SYS-R416-PREVIEW-CONTROLLER (runtime + tests)', 'status': 'dispatched',
    'note': 'baseline 061068d clean (gate 417 published); frozen b-round-417/r418-frozen-sha256.txt (1314); grants b-round-417/grants-418.txt (4); sketch b-round-417/sketch-418.patch.txt; review b-round-417/sketch-review.md; claims b-round-417/claims-418.sh'})

pool = {}
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], f)
CLOSED_417 = ['GATE148-S2-VDS3-WALLCLOCK', 'GATE77-S4-EN10-CLOCK', 'ROOT-R70-L4-BW5-WALLCLOCK', 'C-R326-01',
              'A-R388-REVIEW-L4-SF11-REAL-CLOCK', 'A-R415-REVIEW-L1-CALLSITE-FLAG', 'C-R416-CLAIMS-K22-ARCHIVE']
closed_seen = []
for i in CLOSED_417:
    f = pool.get(i)
    if f:
        f['status'] = 'closed (D-29z1454): C round 417 PASS, gate 417 published 061068d | ' + str(f.get('status'))
        closed_seen.append(i)
print('closed (others already archived):', closed_seen)

def low(i, sev, origin, title, evidence, status):
    return {'id': i, 'severity': sev, 'origin': origin, 'title': title, 'evidence': evidence, 'status': status, 'added': BY}
b['deferred_low_polish'] += [
    low('A-R417-REVIEW-M1-BW5-READCOUNT-HOIST', 'low', 'B spec',
        'BW5 window-read count (<= 1000) becomes vacuous if barsRulerMarks hoists rulerWindow.fromPx/toPx out of its loop; a full-build regression would then pass',
        'a-round-417.md reviewer table; c-round-417.json C-R417-BW5-HOIST-FRAGILE',
        'deferred_low_polish (D-29z1455): reviewer Medium downgraded to Low with reason: latent, not present (MU-BW5-FULLBUILD red on the published tree; needs a hoist refactor AND a full-build regression together); C rated it Low independently. Fix when a round owns tempo-window.test.ts: add a read-independent work signal (e.g. a marks-per-call or loop-iteration bound). Merged with C-R417-BW5-HOIST-FRAGILE and GATE417-L2-BW5-BOUND-COMMENT'),
    low('C-R417-BW5-HOIST-FRAGILE', 'low', 'B spec', 'same as A-R417-REVIEW-M1-BW5-READCOUNT-HOIST (C confirmation by a crude hoist mutant)',
        'c-round-417.json bugs[1]', 'deferred_low_polish (D-29z1455): merged into A-R417-REVIEW-M1-BW5-READCOUNT-HOIST'),
    low('A-R417-REVIEW-L1-IM24-ADVANCE-NOOP', 'low', 'B spec', 'IM24 advance(0.05) is probably a no-op with Date.now frozen (unverified)',
        'a-round-417.md reviewer table', 'deferred_low_polish (D-29z1455)'),
    low('A-R417-REVIEW-L2-SF11-NOFLAG-LEAK', 'low', 'B spec', 'on the NOFLAG failure path the setInterval probe starts a real interval that is never cleared; compare window.setInterval against the stub instead',
        'a-round-417.md reviewer table', 'deferred_low_polish (D-29z1455); same fix as GATE417-L1-SF11-STUB-RETURN0'),
    low('A-R417-REVIEW-L3-VDS3-HARDCODED-50', 'low', 'B spec', 'VDS3 advanceTimersByTime(50) duplicates the unexported PLAYBACK_LOOKAHEAD',
        'a-round-417.md reviewer table', 'deferred_low_polish (D-29z1455)'),
    low('GATE417-L1-SF11-STUB-RETURN0', 'low', 'gate reviewer', 'SF11 asserts the setInterval stub by its return value 0; assert stub identity (Object.is) instead',
        'gates/round-417/review.md finding 1', 'deferred_low_polish (D-29z1455)'),
    low('GATE417-L2-BW5-BOUND-COMMENT', 'low', 'gate reviewer', 'BW5 bound 1000 is tied to implementation detail (442 reads); a legitimate per-mark read would fail it',
        'gates/round-417/review.md finding 2', 'deferred_low_polish (D-29z1455): merged into A-R417-REVIEW-M1-BW5-READCOUNT-HOIST'),
    low('GATE417-L3-IM24-LEFTOVER-FRAMES', 'low', 'gate reviewer', 'IM24 restubs requestAnimationFrame mid-test; frames left in the local queue are dropped on cleanup',
        'gates/round-417/review.md finding 3', 'deferred_low_polish (D-29z1455)'),
]
b['deferred_low_polish'] += [
    low('TL-R418-L1-UNMOUNT-NO-BUMP', 'low', 'B pre-check', 'provider unmount does not bump previewTokenRef; a decode pending at unmount is dropped only because the abort empties the cache (HEAD same)', 'b-round-417/sketch-review.md', 'deferred_low_polish (D-29z1456): MU-UNMOUNT-NO-BUMP green, no row can prove it today'),
    low('TL-R418-L2-READTIME-START-FALLBACK', 'low', 'B pre-check', 'a throwing currentTime read at the watchdog tick, after arming at a real time != start, skips the stall; after a same-url seek start is the old offset; report at armedAt instead', 'b-round-417/sketch-review.md', 'deferred_low_polish (D-29z1456): shipping browsers do not throw from the getter'),
    low('TL-R418-L3-OFFSET-RAW-READ', 'low', 'B pre-check', 'getLibraryPreviewOffset reads stream currentTime unguarded', 'b-round-417/sketch-review.md', 'deferred_low_polish (D-29z1456): with TL-R418-L2'),
    low('TL-R418-L4-COLLECTION-CHANGE-PREVIEW', 'low', 'pre-existing', 'a collection change neither stops the library preview nor bumps the token; a stale decode or fallback can start a same-id source of the new collection (HEAD same)', 'b-round-417/sketch-review.md', 'deferred_low_polish (D-29z1456): outside the controller region; EV12 stays green'),
]
b['open_findings'].append(low('C-R417-L58-SKETCH-REVIEW-MISSING', 'low', 'B spec',
    'round 417 dispatched a git-apply sketch without b-round-416/sketch-review.md and without tools/l58-check.py in the claims (repeat of round 415)',
    'c-round-417.json bugs[0]',
    'fixed_in_b_tooling_pending_c (D-29z1455): round 418 planning writes b-round-417/sketch-review.md (tech-lead review of the dispatched sha) and claims-418.sh K19 runs tools/l58-check.py current-task.md; closes when C round 418 row 1 shows K19 L58 OK'))
b['open_findings'].append(low('A-R417-REVIEW-M2-DOC-IM24-FILELOCAL', 'info', 'B spec',
    'task ruling 2 said IM24 keeps a file-local fake; IM24 uses createWorkspaceTestEnvironment (only its rAF capture is local)',
    'a-round-417.md reviewer table',
    'closed (D-29z1455): doc 268 fixed by A in round 417; SIG-R415-WORKSPACE-ENV-CONVERGENCE scope corrected to EN10 + VDS3'))

for s in b['architecture_signals']:
    if isinstance(s, dict) and s.get('id') == 'SIG-R415-WORKSPACE-ENV-CONVERGENCE':
        s['status'] = ('recorded (D-29z1455): after round 417 the file-local fakes are EN10 (marker-edge-nav-ui) and VDS3 (video-dock-strings-ui) only; '
                       'IM24 already uses createWorkspaceTestEnvironment. A-R417 reviewer and gate-417 reviewer: keep now; proposal = opt-in frozenClock/captureFrames '
                       'options on createWorkspaceTestEnvironment, move EN10 and VDS3, all other suites byte-identical, existing mutants keep red/green. Signal only, not scheduled | ' + s['status'])

for t in b['systemic_tasks']:
    if isinstance(t, dict) and t.get('id') == 'SYS-CLOCK-DETERMINISM':
        t['status'] = 'done (D-29z1454): C round 417 PASS (browserVerified true), gate 417 published 061068d | ' + t['status']
    if isinstance(t, dict) and t.get('id') == 'SYS-R416-PREVIEW-CONTROLLER':
        t['status'] = 'dispatched round 418 (D-29z1456) | ' + t['status']
        t['ruling_d29z1456'] = (
            'Region found by grep: ArrangementContext.tsx startLibraryPreview/stopLibraryPreview/previewRequestRef and preview.client.ts (decidePreviewMode/useLibraryPreviewController do not exist). '
            'previewRequestRef (sourceId) -> previewTokenRef (counter) bumped by every start that takes effect and by stopLibraryPreview; decode settle and stream fallback act only when their token is current. '
            'Stream fallback deferred with queueMicrotask (never synchronous inside the media handler or a start call); the remembered fallback is recorded synchronously even when superseded. '
            'Null-owner decode call: refusal status first, live preview untouched (was: stopped). Same-url seek re-targets the active stream error handler (setErrorHandler) - found by B browser pre-check R1b on the first sketch. '
            'Player reads currentTime through readTime (throwing getter -> start offset), once per watchdog tick; seek branch uses a local const. Provider unmount does not bump the token (MU-UNMOUNT-NO-BUMP green: the abort path already drops the decode; PC7 is a lock row). '
            'Rows PC1-PC12 + PS8/PS13/PS27 act -> await act(async). 12 mutants. Browser: 7 rows x 2 viewports equal HEAD.')
        t['closes_round_418'] = ['GATE393-L3-FALLBACK-REENTRY', 'A-R394-REVIEW-L3-REENTRANT-SYNC-THROW', 'A-R395-REVIEW-L1-SEEK-REENTRANT',
                                 'GATE395-L1-CURRENTTIME-READ', 'A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW', 'A-R392-REVIEW-L3-SUPERSESSION-BY-ID',
                                 'A-R393-REVIEW-L3-URL-SWITCH-ROWS']
for i in ['GATE393-L3-FALLBACK-REENTRY', 'A-R394-REVIEW-L3-REENTRANT-SYNC-THROW', 'A-R395-REVIEW-L1-SEEK-REENTRANT',
          'GATE395-L1-CURRENTTIME-READ', 'A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW', 'A-R392-REVIEW-L3-SUPERSESSION-BY-ID',
          'A-R393-REVIEW-L3-URL-SWITCH-ROWS']:
    pool[i]['status'] = 'scheduled in round 418 SYS-R416-PREVIEW-CONTROLLER (D-29z1456); closes on C PASS | ' + str(pool[i]['status'])
for f in b['open_findings']:
    if f.get('id') == 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C':
        f['status'] = 'L46 default dispatched as round 418 (D-29z1456): no root answer found (find -L over the loop folder, 2026-11-08) | ' + f['status']

sp = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STUDIO-PERFORMANCE'][0]
for st in sp['stages']:
    if st.get('id') == 'SYS-CLOCK-DETERMINISM':
        st['status'] = 'done (D-29z1454): C round 417 PASS, gate 417 published 061068d | ' + st['status']
    if st.get('id') == 'SYS-R416-PREVIEW-CONTROLLER':
        st['status'] = 'dispatched round 418 (D-29z1456) | ' + st['status']
sp['status'] = ('in_progress (D-29z1457): SYS-CLOCK-DETERMINISM done (round 417, 061068d); round 418 = SYS-R416-PREVIEW-CONTROLLER; '
                'then SYS-R369 (L46 default), STEM-LANES; REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10 | ' + sp['status'])

b['decisions_log_b'] += [
    {'id': 'D-29z1454', 'date': '2026-11-08', 'by': BY,
     'decision': 'Round 417 accepted: C PASS (c-round-417.json, 8 rows, browserVerified/realVerified true, 2 Low B-spec findings); gate 417 published 061068d (verify 3922/3922). SYS-CLOCK-DETERMINISM done; its 6 ids and C-R416-CLAIMS-K22-ARCHIVE (C row 1: K14 clean, stderr empty) closed. Baseline for round 418 = 061068d (clean). REGRESSION not due: regression-last 2026-11-07, due on/after 2026-11-10.'},
    {'id': 'D-29z1455', 'date': '2026-11-08', 'by': BY,
     'decision': 'Round-417 rulings (L10): A-R417-REVIEW-M1 (reviewer Medium on the ruled BW5 method) downgraded to Low with reason (latent: needs a hoist refactor AND a full-build regression; mutant red today; C rated Low) and deferred with C-R417-BW5-HOIST-FRAGILE and GATE417-L2 merged; A-R417 L1-L3 and GATE417 L1/L3 deferred; A-R417 M2 closed (doc fixed), SIG-R415 scope corrected to EN10+VDS3 and A architecture note recorded there. C-R417-L58-SKETCH-REVIEW-MISSING: fixed in this planning (sketch-review.md + claims K19 l58-check); closes on C round 418 row 1.'},
    {'id': 'D-29z1456', 'date': '2026-11-08', 'by': BY,
     'decision': 'SYS-R416-PREVIEW-CONTROLLER dispatched as round 418 (L46 default; no root answer to the preview checkpoint). Rulings in systemic_tasks ruling_d29z1456. One round: 12 new rows (< 20 split threshold). B browser pre-check on the sketch (port 5174, own cacheDir) found a regression of the first sketch (R1b seek-then-stall no fallback) and fixed it before dispatch (setErrorHandler, PC12, MU-SEEK-KEEPS-OLD-HANDLER). Reference-first / product-designer / screen budget N/A (behaviour-preserving fix round).'},
    {'id': 'D-29z1457', 'date': '2026-11-08', 'by': BY,
     'decision': 'Order after round 418 unchanged: SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule); REGRESSION-2026-11-10 at the first planning on/after 2026-11-10; next RETRO round 431 or end of STUDIO-PERFORMANCE. No architecture checkpoint request: same region as the 393 request, which this round closes by the L46 default.'},
]
open(p, 'w').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('ok\n')
print('backlog v394 written')
