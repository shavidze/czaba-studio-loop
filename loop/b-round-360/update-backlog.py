"""B round 360 -> 361 planning: backlog v323 -> v324. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-360/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 323, b['version']
ADDED = '2026-11-06 B round 360 -> 361 planning'
b['version'] = 324
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 361: PERF-10b-i, activeTrackId into the selection store; interact.click.components 83 -> <= 42 and click.commits <= 2 asserted; C-R360-NOTE-STALE notes fixed)'
b['advisor_used_by_B'] = 'yes (round 360 -> 361 planning: advisor available; consulted after orientation and before declaring done)'
b['decisions_log_b'] += [
    {'id': 'D-29z1167', 'date': '2026-11-06', 'text': 'Round 360 (PERF-10a-BUDGETS) closed PASS from C evidence: c-round-360.json taskStatus PASS, browserVerified/realVerified true; CLAIMS, SOURCE-SCOPE, PERF 93/93 asserted 0 NEW (181 deterministic rows equal C359; nine rows play 1/28/1/1/28, fades 3/2/2/2), PERF-LIB 40/40, C mutant MU-C (Ruler subscribes to isPlaying: start/stop components 30 x3, red as predicted), VIDEO-FAIL-STOP-1/2/3, G360-AUTH. Blocked only: the fake-bearer 403 (mock backend down; 500 fails closed). Gate 360 published 93ea6c1 on both remotes; it is the round-361 baseline.'},
    {'id': 'D-29z1168', 'date': '2026-11-06', 'text': 'Round-360 notes: C-R360-NOTE-STALE (Low, origin B spec: the two video-fade release-commits notes still say "Record until C measures it", the fade.playing note says the third commit is intermittent) is NOT deferred: round 361 owns perf/budgets.interactions.json, so the fix rides in b-round-360/budgets.patch.txt (2026-10-23 rule: a Low may be fixed early when the round owns the code). A-R360-REVIEW-VIDEOFADE-NOTE-STALE and A-R360-REVIEW-FADE-PLAYING-INTERMITTENT merged into it. Closes on C round 361 PASS. Info: the 0-commit side of == 1 untested (TL-R360-3); VFS-v2 cold first attempt and 1 px / 11 ms FOLLOW jitter = environment.'},
    {'id': 'D-29z1169', 'date': '2026-11-06', 'text': 'PERF-10b split (B may split further; one feature stage per round): PERF-10b-i (round 361) = activeTrackId into the existing selection store (SIG-R322-ACTIVE-TRACK-STORE adopted; no 13th store, so the ARCH-R338 trigger is not re-fired), interact.click.* budgets, C-R360-NOTE-STALE. PERF-10b-ii = Transport play/stop button as its own subscriber (<= 20 on Play/Stop), B-R356-PLAYBACK-SETTER, the C-R320-01 render-budget row (with A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) and the GATE320-S3 record row. tech-lead TL-R361-4(c): undo/redo and track deletion do not reconcile the active track today -> TL-R361-ACTIVE-TRACK-DANGLING (Low, pre-existing, deferred_low_polish), behaviour unchanged.'},
    {'id': 'D-29z1170', 'date': '2026-11-06', 'text': 'Round 361 = PERF-10b-i. Files: 9 app files from b-round-360/sketch.patch.txt (selection-store.ts, ArrangementContext.tsx, ArrangementLane.tsx, ArrangementLibraryPreview.tsx, StudioWorkspace.tsx, workspace-probe.ts, grid-snap-position.test.tsx, marker-time-snap-ui.test.tsx, selection-store.test.tsx with SS8-SS11), perf/budgets.interactions.json from b-round-360/budgets.patch.txt, doc 234 stage 3 of 4. Premise measured (L37): C360 click 83 vs same-lane 15. Consults tech-lead TL-R361-1..4, performance-optimizer PO-R361-1..4 (b-round-360/sketch-review.md). B sketch: typecheck 0, lint 205, full suite 248/3639 rc 0, SS 11/11, production perf 93/93 0 NEW with only interact.click.components (+.6x) 83 -> 42 (42,0 x3 each), commits 2 x3; mutants MU-1 perf 82, MU-2..MU-5 red on SS8..SS11 only, MU-6 red on UC7 only. Budgets: interact.click.components assert <= 42, interact.click.commits assert <= 2 (owner PERF-10b-i), .6x stay record; asserted 93 -> 95. C rows add ACTIVE-LANE, GROUP-RING and PASTE-LANE in the browser.'},
    {'id': 'D-29z1171', 'date': '2026-11-06', 'text': 'Order after round 361: REGRESSION first at any planning on/after 2026-11-08 -> PERF-10b-ii -> PERF-9 -> PERF-11..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries. RETRO at round 368 or at the end of STUDIO-PERFORMANCE. Architecture checkpoint request still unanswered, non-blocking.'},
]
for r in b['rounds']:
    if r.get('round') == 360:
        r['status'] = 'closed PASS (D-29z1167): C round 360 PASS, browserVerified true; gate 360 published 93ea6c1'
b['rounds'].append({'round': 361, 'task': 'current-task.md', 'decision': 'D-29z1167..D-29z1171',
                    'type': 'PERF-10b-i: activeTrackId -> selection store; click.components <= 42, click.commits <= 2; C-R360-NOTE-STALE',
                    'status': 'dispatched',
                    'note': 'baseline 93ea6c1, clean tree; claims b-round-360/claims-361.sh; sketch b-round-360/sketch.patch.txt + budgets.patch.txt; runs b-round-360/perf-summary.txt',
                    'added': ADDED})
q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1167): PERF-10a-BUDGETS done (C round 360 PASS, gate 93ea6c1); round 361 = PERF-10b-i; then PERF-10b-ii | ' + q['status']
q['execution_order_d29z1171'] = 'PERF-10b-i (361) -> REGRESSION first on/after 2026-11-08 -> PERF-10b-ii -> PERF-9 -> PERF-11..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; PERF-CAND-MASTER-GROUP-FADER-PROPS waits for the checkpoint'
for s in q['stages']:
    if s['id'] == 'PERF-10':
        s['status'] = 'in_progress (D-29z1169): PERF-10a and PERF-10a-BUDGETS done (C rounds 358, 360); PERF-10b split into 10b-i (round 361: activeTrackId store, click budgets) and 10b-ii (Transport play leaf <= 20, B-R356-PLAYBACK-SETTER, C-R320-01 row, GATE320-S3 row) | ' + s['status']
        s['split_d29z1169'] = {'PERF-10b-i': 'round 361: activeTrackId into the selection store; interact.click.components <= 42, click.commits <= 2; SS8-SS11; C-R360-NOTE-STALE', 'PERF-10b-ii': 'Transport play/stop button as its own subscriber (<= 20); B-R356-PLAYBACK-SETTER; C-R320-01 render-budget row (+ A-R320-REVIEW-WAVEFORM-NAME-POSITIVE); GATE320-S3 record row'}
found = False
for f in b['open_findings']:
    if f.get('id') == 'C-R320-01':
        f['status'] = 'open, scheduled (D-29z1169): required row in PERF-10b-ii; not deferred | ' + f['status']
        found = True
assert found
note = {'id': 'C-R360-NOTE-STALE', 'severity': 'low', 'origin': 'B spec (sha-pinned budgets patch of round 360)', 'title': 'stale budgets notes: interact.drag.video-fade.{stopped,playing}.release-commits still say "Record until C measures it"; interact.drag.fade.playing.release-commits says the third commit is intermittent though all samples are 2', 'evidence': 'c-round-360.json bugs[0]; a-round-360.md review Lows 1-2; c-round-360/latest-interactions.json', 'repro': 'read the notes of the three rows in perf/budgets.interactions.json at 93ea6c1', 'status': 'scheduled_fix_round_361 (D-29z1168): fixed by b-round-360/budgets.patch.txt; closes on C round 361 PASS; merges A-R360-REVIEW-VIDEOFADE-NOTE-STALE and A-R360-REVIEW-FADE-PLAYING-INTERMITTENT', 'added': ADDED}
b['open_findings'].append(note)
dang = {'id': 'TL-R361-ACTIVE-TRACK-DANGLING', 'severity': 'low', 'origin': 'tech-lead consult TL-R361-4(c), pre-existing', 'title': 'undo/redo and track deletion do not reconcile the active track; the active id can point at no track (behaviour unchanged by PERF-10b-i)', 'evidence': 'b-round-360/sketch-review.md TL-R361-4', 'repro': 'source read: no reconcile of activeTrackId in restoreHistory / track removal paths of ArrangementContext.tsx', 'status': 'deferred_low_polish (D-29z1169)', 'added': ADDED}
b['open_findings'].append(dict(dang))
b['deferred_low_polish'].append(dict(dang))
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE':
        s['note'] += ' | round 361 planning (D-29z1169): not absorbed by PERF-10b-i; stays a PERF-11 input.'
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted, repeated (D-29z1171): no answer at round 361 planning; round 361 adds no store; non-blocking | ' + r['status']
open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v324 written')
