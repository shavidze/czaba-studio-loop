"""B round 356 -> 357 planning: backlog v319 -> v320. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-356/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
shutil.copyfile(B, os.path.join(L, 'b-round-356/backlog-before-357.json'))
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 319, b['version']
ADDED = '2026-11-05 B round 356 -> 357 planning'
b['version'] = 320
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 357: PERF-10a playback store)'
b['advisor_used_by_B'] = 'yes (round 356 -> 357 planning: advisor available; consulted after orientation and before declaring done)'

b['decisions_log_b'] += [
    {'id': 'D-29z1149', 'date': '2026-11-05', 'text': 'Round 356 (PERF-CAND-VIDEO-MOVE-BUDGET) closed as PASS from C evidence: c-round-356.json PASS, browserVerified/realVerified true, 0 bugs, PERF 84/84 (0 NEW), own mutant M-C1 red on the 3 new asserts; l57-check rc 0 (b-round-356/l57-check-c356.txt). Fake-bearer 403 sub-check BLOCKED (mock :5199 down; backend rule, kept as open evidence). Gate 356 published d49536b on both remotes. PERF-CAND-VIDEO-MOVE-BUDGET done; GATE354-S1 closed.'},
    {'id': 'D-29z1150', 'date': '2026-11-05', 'text': 'Gate 356 review (gates/round-356/review.md, score 9/10, 0 Critical): suggestions 1-2 (zero/1.2 % headroom on the three video move rows) recorded as GATE356-I1 info with the reviewer remedy (raise only the per-move row to <= 11 on a flaky red, never the max rows); suggestion 3 (doc 232 title grows) joins GATE354-ARCH-DOC232-SPLIT; suggestion 4 confirms counts (no action). Architecture note (budgets JSON ~3000 lines; generate note boilerplate from per-scenario templates when the spec is split) -> signal GATE356-ARCH-BUDGET-NOTE-TEMPLATES, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled.'},
    {'id': 'D-29z1151', 'date': '2026-11-05', 'text': 'PERF-CAND-FADE-RELEASE-COMMITS closed as named, no fix (B probes at HEAD d49536b, dev and production: b-round-356/fade-release-timed-dev.json, fade-release-harnesslike-{dev,prod}.json). Commit 1 = provider commit (76 components). Commit 2 (+0.5 ms) renders only ArrangementStatusTextInner: the provider layout effect clears the status preview after the adopted preview; fade is the only drag that previews status during the gesture. Commit 3 = a 0-component commit about 3.5 ms after the click that follows pointerup on the fade handle; stopped always, playing intermittent in the probe (absent in the harness playing samples); its setState is NOT identified (partly named). Cost <= 1 component per release; clearing the preview inside the adopted commit risks status flicker (tech-lead agrees). Rows stay record; tech-lead suggestion (upper-bound asserts release-commits <= 3 stopped/playing, audio and video fade) carried to the next budgets conversion round as PERF-10a-BUDGETS input.'},
    {'id': 'D-29z1152', 'date': '2026-11-05', 'text': 'PERF-9 (stem cache v2) keeps its scope and its queue entry, but it is dispatched after PERF-10a: its acceptance ("second open: 0 stem network bytes") has no network stem path in /studio-lab (demo sources are synthesized; the only stem fetch is createPurchasedWorkspaceCollection in app/lib/arrangement/collection.ts, reached only from the deferred SRW-21 route), so a browser half could not run today (V2: never done without it). At PERF-9 planning, tech-lead decides between (a) a loop-side harness that serves stems through mock-api :5199 to a dev-only collection and (b) coupling to SRW-21-PLAN. This is a dependency note, not a deferral; overlaps PERF-4b (awaiting_user).'},
    {'id': 'D-29z1153', 'date': '2026-11-05', 'text': 'Round 357 = PERF-10a: isPlaying leaves the ArrangementContext value into a zustand/vanilla playback store (app/lib/arrangement/playback-store.ts, ArrangementPlaybackContext, useArrangementPlaybackStore, useArrangementIsPlaying). One writer: the two setIsPlaying sites write isPlayingRef and the store together. Consumers: ArrangementTransport and ArrangementVideoDock subscribe; ArrangementMarkerRow reads getState() inside its callback; routes/studio-lab.tsx StopPlaybackOnNarrow subscribes (renders null); StudioWorkspace does not subscribe at the top: a memo leaf ArrangementPlaybackFollowSync runs the follow effect (post-commit timing kept, performance-optimizer) and writes committedIsPlayingRef, which the 7 event-time reads use. Ruling: the field is REMOVED from ArrangementContextValue (tech-lead, precedent D-29z894), not kept as a getter: B sketch showed a getter breaks every spread probe (TG11 etc., b-round-356/precheck-full-getter-variant-killed.log). Test sweep class ruling: shared helper app/lib/arrangement/__tests__/helpers/workspace-probe.ts (WorkspaceProbeValue, useWorkspaceProbe) replaces useArrangement()/ArrangementContextValue in the 46 test files tsc lists (b-round-356/tsc-removal-files.txt). The 11th provider store fires the ARCH-R338-STORES-PROVIDER trigger: root request repeated (b-round-356/root-request-arch-checkpoint.md, question 1b); non-blocking (tech-lead: PERF-8b precedent; a consolidation moves one more store).'},
    {'id': 'D-29z1154', 'date': '2026-11-05', 'text': 'Order after round 357: REGRESSION first at any planning on/after 2026-11-08 -> PERF-10a-BUDGETS (play start/stop components and commits record -> assert from C357 values; fade release-commits <= 3 upper bounds, D-29z1151) -> PERF-10b (activeTrackId/selection store, SIG-R322-ACTIVE-TRACK-STORE; clip click 83 components; C-R320-01 required rows; Transport play button leaf to reach <= 20) -> PERF-9 (after its harness decision, D-29z1152) -> PERF-11..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries (skip rule). PERF-CAND-MASTER-GROUP-FADER-PROPS still waits for the architecture checkpoint. RETRO due at round 368 or the end of STUDIO-PERFORMANCE.'},
]

for r in b['rounds']:
    if r.get('round') == 356:
        r['status'] = 'closed PASS (D-29z1149): C round 356 PASS, browserVerified true; gate 356 published d49536b'
b['rounds'].append({'round': 357, 'task': 'current-task.md', 'decision': 'D-29z1149..D-29z1154',
                    'type': 'PERF-10a: isPlaying playback store (ArrangementContext, StudioWorkspace, Transport, MarkerRow, VideoDock, studio-lab route, 46 test probes via one helper)',
                    'status': 'dispatched',
                    'note': 'baseline d49536b clean; claims b-round-356/claims-357.sh; sketch b-round-356/sketch/*.patch.txt; precheck b-round-356/precheck-full.log; perf b-round-356/perf-summary.txt',
                    'added': ADDED})

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1153): round 356 C PASS published d49536b; round 357 = PERF-10a | ' + q['status']
for s in q['stages']:
    if s['id'] == 'PERF-CAND-VIDEO-MOVE-BUDGET':
        s['status'] = 'done (D-29z1149): C round 356 PASS (84/84, M-C1 red), gate 356 published d49536b | ' + s['status']
    if s['id'] == 'PERF-9':
        s['status'] = 'not_started | dependency note (D-29z1152): no network stem path in /studio-lab; harness decision (mock-api collection vs SRW-21-PLAN) at its planning; dispatched after PERF-10a'
    if s['id'] == 'PERF-10':
        s['status'] = 'in_progress (D-29z1153): split 10a (isPlaying store, round 357) / 10a-budgets / 10b (activeTrackId+selection, clip click, C-R320-01 rows, Transport play leaf) | ' + s['status']
        s['split_d29z1153'] = {
            'PERF-10a': 'round 357: isPlaying -> playback store; field removed from ArrangementContextValue; test probe helper; expected play start/stop ~28 components (performance-optimizer; B sketch measures)',
            'PERF-10a-BUDGETS': 'budgets-only: interact.play.* record -> assert from C357 values; fade release-commits <= 3 (D-29z1151)',
            'PERF-10b': 'activeTrackId (+ selection) store per SIG-R322-ACTIVE-TRACK-STORE; clip click 83 components; required rows C-R320-01, GATE320-S3, A-R320-REVIEW-WAVEFORM-NAME-POSITIVE; Transport play/stop button as its own subscriber to reach <= 20',
        }
q['stages'].append({'id': 'PERF-CAND-FADE-RELEASE-COMMITS', 'what': 'name the extra fade release commits (3 stopped / 2 playing) before asserting', 'status': 'closed_named_no_fix (D-29z1151): B probe evidence; commit 3 partly named; rows stay record; <= 3 upper bounds go to PERF-10a-BUDGETS', 'added': ADDED})
q['execution_order_d29z1154'] = 'PERF-10a (357) -> REGRESSION first on/after 2026-11-08 -> PERF-10a-BUDGETS -> PERF-10b -> PERF-9 (after harness decision) -> PERF-11..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; PERF-CAND-MASTER-GROUP-FADER-PROPS waits for the checkpoint'

n = 0
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if f.get('id') == 'GATE354-S1':
            f['status'] = 'closed (D-29z1149): C round 356 PASS, gate 356 published d49536b | ' + f['status']; n += 1
assert n == 2, n

EV = 'gates/round-356/review.md'
b['open_findings'].append({'id': 'GATE356-I1', 'severity': 'info', 'origin': 'gate 356 review suggestions 1-2', 'title': 'video move per-move <= 10 has ~1.2 % headroom; the two max rows have zero headroom', 'evidence': EV, 'repro': '-', 'status': 'recorded (D-29z1150): deterministic rows, three equal samples; on a flaky red raise only interact.drag.video.stopped.move-components-per-move to <= 11, never the max rows', 'added': ADDED})
for s in b['architecture_signals']:
    if s.get('id') == 'GATE354-ARCH-DOC232-SPLIT':
        s['status'] = 'signal (D-29z1150): also carries gate 356 suggestion 3 (title growth) | ' + s['status']
    if s.get('id') == 'ARCH-R338-STORES-PROVIDER':
        s['status'] = 'trigger reached (D-29z1153): round 357 adds the 11th store (ArrangementPlaybackContext); question 1/1b of the repeated checkpoint request b-round-356/root-request-arch-checkpoint.md; non-blocking | ' + s['status']
low = {'id': 'B-R356-PLAYBACK-SETTER', 'severity': 'low', 'origin': 'B sketch review (tech-lead finding 8, b-round-356/sketch-review.md)', 'title': 'useArrangementPlaybackStore() exposes setPlaying to any consumer, out of sync with isPlayingRef and the graph', 'evidence': 'b-round-356/sketch-review.md', 'repro': 'read the PERF-10a playback-store hook', 'status': 'deferred_low_polish (D-29z1153): fix home PERF-10b (a reader store type without the setter, as useArrangementPositionWriter)', 'added': ADDED}
b['open_findings'].append(dict(low))
b['deferred_low_polish'].append(dict(low))
b['architecture_signals'].append({'id': 'GATE356-ARCH-BUDGET-NOTE-TEMPLATES', 'origin': 'gate 356 review Architecture note', 'note': 'perf/budgets.interactions.json (~3000 lines) is re-edited every stage; when the spec is split, generate the repeated note boilerplate from per-scenario templates (schema test green, ids and budgets unchanged)', 'status': 'signal (D-29z1150); joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled', 'added': ADDED})

for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted, repeated (D-29z1153): no answer artifact at round 357 planning; ARCH-R338 trigger reached (11th store); request b-round-356/root-request-arch-checkpoint.md adds question 1b; non-blocking | ' + r['status']

open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v320 written')
