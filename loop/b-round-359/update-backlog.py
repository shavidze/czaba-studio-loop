"""B round 359 -> 360 planning: backlog v322 -> v323. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-359/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
RUNS = open(os.path.join(L, 'b-round-359/runs-oneline.txt'), encoding='utf-8').read().strip()
shutil.copyfile(B, os.path.join(L, 'b-round-359/backlog-before-360.json'))
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 322, b['version']
ADDED = '2026-11-06 B round 359 -> 360 planning'
b['version'] = 323
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 360: PERF-10a-BUDGETS, nine play/fade-release rows record -> assert; VIDEO-FAIL-STOP variants 2/3 in the browser)'
b['advisor_used_by_B'] = 'yes (round 359 -> 360 planning: advisor available; consulted after orientation and before declaring done)'

b['decisions_log_b'] += [
    {'id': 'D-29z1163', 'date': '2026-11-06', 'text': 'Round 359 (C-R358-01 fix) closed PASS from C evidence: c-round-359.json taskStatus PASS, browserVerified/realVerified true; TEMPO-REMOUNT and SETTINGS-REMOUNT at both viewports (100 BPM kept, seed sentence x0), METRONOME-AUDIO (A=8, B=8 clicks, off control 0), CLEARED, RELOAD (defaults return: 120 seed), REMOUNT equal to C358, FOLLOW texts equal, PERF 84/84 0 NEW 0 DIFF (181 rows EQUAL vs C358), G359-AUTH premium not bypassed, DOCS. Gate 359 published a977b97. C-R358-01 is closed; A-R357-TEMPO-SEED-REMOUNT-DUP (merged into it) is closed with it. The workspace-session store is the 12th provider store.'},
    {'id': 'D-29z1164', 'date': '2026-11-06', 'text': 'Routing of round-359 notes: C-R359-01 (Low, coverage: snapEnabled, gridDensity, secondsGridDivision and the hand-chosen flags can be dropped from the restore with WS1-WS5 green; c-round-359/mutant-snap.log, a-round-359/mutants-extra/) -> deferred_low_polish, with the reviewer Medium on the same gap merged (ruled Low by the round-359 task, MUTANT row); suggested rows WS6-WS8 kept. A-R359-REVIEW-METRONOME-REF-RENDER (Low) and A-R359-REVIEW-SESSION-READONLY (Low) -> deferred_low_polish. B-R359-VIEW-STATE-REMOUNT stays Low/deferred, now browser-confirmed (c-round-359/extra.json: Env off and zoom 8 -> 1 after the resize). C-R359-OBS-FOLLOW-JITTER (info): FOLLOW 1280x720 scrollLeft 1452/1447/1450 vs C358 1447 (head 1445), 5 px once vs 4 px tolerance, texts equal; recorded; becomes a harness task only if a later FOLLOW row exceeds 4 px in two of three runs. Architecture note (extract useWorkspaceTempoGrid; WorkspaceTempoGridSnapshot as contract) joins A-R357-ARCH-PLAYBACK-SPLIT-HOOKS, not scheduled.'},
    {'id': 'D-29z1165', 'date': '2026-11-06', 'text': 'Round 360 = PERF-10a-BUDGETS (budgets-only; files: perf/budgets.interactions.json via b-round-359/sketch/budgets.patch.txt, doc 234 stage 2, doc 232 one TODO bullet). Nine 1x rows record -> assert, owner PERF-10a-BUDGETS: interact.play.start-commits ==1, start-components <=28, start-sources ==1, stop-commits ==1, stop-components <=28; interact.drag.fade.{stopped,playing}.release-commits and interact.drag.video-fade.{stopped,playing}.release-commits <=3 (D-29z1151 tech-lead suggestion). Asserted 84 -> 93 of 252. Rulings: oracle C359 (same app code as baseline a977b97; supersedes the "C358 values" wording of D-29z1162, values identical); .6x copies stay record (loaded replicate, L37; per-rate equal-samples check already applies, TL-R360-4); start-sources ==1 (a second start() is a restart, M-P3); doc 232 items 90/228 stay dated history, the live contract moves to doc 234 stage 2. Sketch review: tech-lead TL-R360-1..5 (0 unruled Medium+), performance-optimizer PO-R360-* (b-round-359/sketch-review.md). B runs (production, alone): ' + RUNS + ' The two VIDEO-FAIL-STOP variants carried by D-29z1162 are C browser rows VIDEO-FAIL-STOP-2/-3 with explicit expected values from the code path (ArrangementVideoDock startSlotPlayback reject -> pausePlaybackWithStatus(playFailed)) and doc 234 FW-PB1.'},
    {'id': 'D-29z1166', 'date': '2026-11-06', 'text': 'Order after round 360: REGRESSION first at any planning on/after 2026-11-08 -> PERF-10b (activeTrackId + selection store, clip click, C-R320-01 rows, GATE320-S3, A-R320-REVIEW-WAVEFORM-NAME-POSITIVE, Transport play leaf <= 20) -> PERF-9 -> PERF-11..15 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries. RETRO at round 368 or at the end of STUDIO-PERFORMANCE. Architecture checkpoint request stays repeated and non-blocking (b-round-358/root-request-arch-checkpoint.md); round 360 adds no store.'},
]

for r in b['rounds']:
    if r.get('round') == 359:
        r['status'] = 'closed PASS (D-29z1163): C round 359 PASS, browserVerified true; gate 359 published a977b97'
b['rounds'].append({'round': 360, 'task': 'current-task.md', 'decision': 'D-29z1163..D-29z1166',
                    'type': 'PERF-10a-BUDGETS: nine play/fade-release 1x rows record -> assert (84 -> 93); VIDEO-FAIL-STOP variants 2/3',
                    'status': 'dispatched',
                    'note': 'baseline a977b97, clean tree; claims b-round-359/claims-360.sh; sketch b-round-359/sketch/budgets.patch.txt; runs b-round-359/perf-summary.txt',
                    'added': ADDED})

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1163): C-R358-01 fixed (C round 359 PASS, gate a977b97); round 360 = PERF-10a-BUDGETS; then PERF-10b | ' + q['status']
q['execution_order_d29z1166'] = 'PERF-10a-BUDGETS (360) -> REGRESSION first on/after 2026-11-08 -> PERF-10b -> PERF-9 -> PERF-11..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; PERF-CAND-MASTER-GROUP-FADER-PROPS waits for the checkpoint'
for s in q['stages']:
    if s['id'] == 'PERF-10':
        s['status'] = 'in_progress (D-29z1165): PERF-10a done; round 360 = PERF-10a-BUDGETS (nine rows; VIDEO-FAIL-STOP variants 2/3 as C rows); then PERF-10b | ' + s['status']

seen = set()
for f in b['open_findings']:
    if f.get('id') == 'C-R358-01':
        f['status'] = 'closed (D-29z1163): fixed in round 359; C round 359 TEMPO-REMOUNT/SETTINGS-REMOUNT PASS at both viewports (c-round-359/beh-tree-*.json, settings-probe.json), WS1-WS5 green; published a977b97'
        seen.add(f['id'])
    if f.get('id') == 'A-R357-TEMPO-SEED-REMOUNT-DUP':
        f['status'] = 'closed with C-R358-01 (D-29z1163): C round 359 TEMPO-REMOUNT seed sentence x1 after resize 1 and x0 after resize 2; published a977b97'
        seen.add(f['id'])
    if f.get('id') == 'B-R359-VIEW-STATE-REMOUNT':
        f['status'] = 'deferred_low_polish (D-29z1164): browser-confirmed in C round 359 (c-round-359/extra.json: Env off, waveform zoom 8 -> 1 after resize)'
        seen.add(f['id'])
assert seen == {'C-R358-01', 'A-R357-TEMPO-SEED-REMOUNT-DUP', 'B-R359-VIEW-STATE-REMOUNT'}, seen
for d in b['deferred_low_polish']:
    if d.get('id') == 'B-R359-VIEW-STATE-REMOUNT':
        d['status'] = 'deferred_low_polish (D-29z1164): browser-confirmed in C round 359 (c-round-359/extra.json)'

lows = [
    {'id': 'C-R359-01', 'title': 'coverage: snapEnabled, gridDensity, secondsGridDivision and the grid/snap hand-chosen flags can be dropped from the workspace-session restore with WS1-WS5 green (the browser SETTINGS row does not discriminate either); reviewer Medium on the same gap merged here', 'evidence': 'c-round-359.json bugs[0]; c-round-359/mutant-snap.log; a-round-359/mutants-extra/ (x-snap, x-density, x-seconds, x-handchosen survive)', 'repro': 'scratch: StudioWorkspace useState(restoredTempoGrid?.snapEnabled ?? false) -> useState(false); run workspace-session-remount-ui.test.tsx: 5/5 green', 'origin': 'round 359 tests (B spec: missing rows for 4 of the 10 restored fields)', 'suggested_rows': 'WS6 seeded Snap on survives a remount; WS7 adaptive density survives; WS8 Snap off before any tempo clip, remount, add a bpm clip: Snap stays off and the grid is not forced to 1/4'},
    {'id': 'A-R359-REVIEW-METRONOME-REF-RENDER', 'title': 'metronomeOnRef is written only during render (StudioWorkspace ~l.990), unlike the other session refs written in their handlers; an unmount before the next render could save tempoBpm null with metronomeOn true (reviewer: unreachable in the resize flow; audio safe because the bpm effect sends null)', 'evidence': 'a-round-359.md code-reviewer item 2; a-round-359/code-review.md', 'repro': 'read StudioWorkspace toggleMetronome / changeTempo(null) / metronomeOnRef', 'origin': 'A round 359 (code-reviewer)'},
    {'id': 'A-R359-REVIEW-SESSION-READONLY', 'title': 'ArrangementWorkspaceSessionState fields are not readonly (workspace-session-store.ts l.17-20)', 'evidence': 'a-round-359.md code-reviewer item 3', 'repro': 'read app/lib/arrangement/workspace-session-store.ts', 'origin': 'A round 359 (code-reviewer)'},
]
for low in lows:
    low.update({'severity': 'low', 'status': 'deferred_low_polish (D-29z1164)', 'added': ADDED})
    b['open_findings'].append(dict(low))
    b['deferred_low_polish'].append(dict(low))
b['open_findings'].append({'id': 'C-R359-OBS-FOLLOW-JITTER', 'severity': 'info', 'origin': 'C round 359 FOLLOW row (environment timing)', 'title': 'FOLLOW at 1280x720: play1 scrollLeft 1452 / 1447 / 1450 vs C358 tree 1447 (head 1445); 5 px once vs the 4 px tolerance; texts equal', 'evidence': 'c-round-359/follow-tree-1280x720.json, -r2.json, -r3.json; c-round-359.json observations.followJitter', 'repro': 'c-round-358/follow-probe.mjs at 1280x720, three runs', 'status': 'recorded (D-29z1164): timing jitter, not a regression; becomes a harness task if a later FOLLOW row exceeds 4 px in two of three runs', 'added': ADDED})

for s in b['architecture_signals']:
    if s.get('id') == 'A-R357-ARCH-PLAYBACK-SPLIT-HOOKS':
        s['note'] += ' | round 359 (D-29z1164): reviewer proposes extracting useWorkspaceTempoGrid (the ten-field group, the seed effect and the unmount save) with WorkspaceTempoGridSnapshot as the contract; keep as is for now; acceptance WS1-WS5 + WS6-WS8 (C-R359-01).'
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted, repeated (D-29z1166): no answer at round 360 planning; round 360 adds no store; non-blocking | ' + r['status']

open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v323 written')
