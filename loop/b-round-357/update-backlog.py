"""B round 357 -> 358 planning: backlog v320 -> v321. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-357/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
shutil.copyfile(B, os.path.join(L, 'b-round-357/backlog-before-358.json'))
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 320, b['version']
ADDED = '2026-11-05 B round 357 -> 358 planning'
b['version'] = 321
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 358: PERF-10a re-dispatch with the C-R357-01 ruling)'
b['advisor_used_by_B'] = 'yes (round 357 -> 358 planning: advisor available; consulted after orientation and before declaring done)'

b['decisions_log_b'] += [
    {'id': 'D-29z1155', 'date': '2026-11-05', 'text': 'Round 357 (PERF-10a) closed as FAIL from C evidence: c-round-357.json taskStatus FAIL, browserVerified/realVerified false (L22 short round after A STOP); C-R357-01 Medium reproduced in a real browser (c-round-357/remount3-head.json vs remount3-atree.json). Gate 357 skipped (C FAIL), nothing published; the baseline stays d49536b and A\'s 56-entry tree is kept as partial work. PERF-10a is not done: its PERF/PLAY/FOLLOW/VIDEO/NARROW rows never ran in C.'},
    {'id': 'D-29z1156', 'date': '2026-11-05', 'text': 'Ruling on C-R357-01 / A-REVIEW Medium: option (b), restore HEAD text and order. Reason: PERF-10a promised no behaviour change; the only observable delta is a tempo-seed re-append that is itself a pre-existing remount defect (A-R357-TEMPO-SEED-REMOUNT-DUP), so accepting (a) would bake that defect into a perf round. Mechanism (B sketch b-round-357/sketch/source-delta.patch.txt on A\'s tree): the follow leaf calls onPlayingChange only on a transition (syncedRef prev-value guard; no StrictMode in entry.client, K19); StudioWorkspace adds a mount effect after the tempo-seed effect (K18) that calls syncFollowWithPlayback(committedIsPlayingRef.current, true), whose stopped branch keeps HEAD\'s string write at mount (re-announce, sequence +1). Evidence: new RM1/RM2 (follow-remount-ui.test.tsx) red on A\'s tree (b-round-357/rm-on-atree.log), green on HEAD (rm-on-head.log) and on the sketch; mutants M-B5 (no mount effect) and M-B6 (functional mount write) red; covering set 71 files 1290/1290 on the sketch (b-round-357/cover-sketch.log); typecheck rc 0, Biome rc 0; C\'s own remount probe on the sketch equals HEAD on all 7 steps (b-round-357/remount3-sketch.json). Round 358 = PERF-10a re-dispatch: A keeps its tree, applies only the delta, re-runs the review.'},
    {'id': 'D-29z1157', 'date': '2026-11-05', 'text': 'Routing of a-round-357 code-reviewer notes: A-R357-REVIEW-SPLIT-RENDER-LATENT (Low, latent, unreachable today), A-R357-REVIEW-FWPB1-TIMING (Low, test flake risk), A-R357-REVIEW-READ-POLICY (Low, live vs committed isPlaying read policy undocumented) and A-R357-TEMPO-SEED-REMOUNT-DUP (Low candidate, pre-existing by trace: StudioWorkspace-local tempo/grid state and tempoSeedOpenRef reset on every narrow->wide remount, so the seed re-runs; C confirms on HEAD in round 358 as a record row, and if a hand-typed BPM is lost on remount the severity is re-evaluated as a state-loss finding) go to open_findings and deferred_low_polish (2026-10-23 rule). The Architecture note (split playback hooks, live vs committed read policy, useWorkspaceProbe as test API) becomes signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS, not scheduled; it joins the ARCH-R338-STORES-PROVIDER question of the pending checkpoint request.'},
    {'id': 'D-29z1158', 'date': '2026-11-05', 'text': 'Order after round 358 unchanged from D-29z1154: REGRESSION first at any planning on/after 2026-11-08 -> PERF-10a-BUDGETS (from C358 values) -> PERF-10b -> PERF-9 -> PERF-11..15 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries. RETRO at round 368 or at the end of STUDIO-PERFORMANCE. The architecture checkpoint request (b-round-356/root-request-arch-checkpoint.md) is repeated, non-blocking.'},
]

for r in b['rounds']:
    if r.get('round') == 357:
        r['status'] = 'closed FAIL (D-29z1155): A STOP on an unruled Medium; C-R357-01 reproduced; gate 357 skipped; ruled (b) by D-29z1156'
b['rounds'].append({'round': 358, 'task': 'current-task.md', 'decision': 'D-29z1155..D-29z1158',
                    'type': 'PERF-10a re-dispatch: A\'s round-357 tree + C-R357-01 ruling (b) delta (StudioWorkspace follow leaf transition guard + mount sync after tempo-seed) + RM1/RM2',
                    'status': 'dispatched',
                    'note': 'baseline d49536b, A tree 56 entries kept; claims b-round-357/claims-358.sh; delta b-round-357/sketch/*.patch.txt',
                    'added': ADDED})

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1155): round 357 PERF-10a C FAIL (C-R357-01), not published; round 358 = PERF-10a re-dispatch | ' + q['status']
for s in q['stages']:
    if s['id'] == 'PERF-10':
        s['status'] = 'in_progress (D-29z1156): PERF-10a round 357 C FAIL (C-R357-01 Medium, ruled (b)); re-dispatched round 358 | ' + s['status']

EV = 'c-round-357.md, c-round-357/remount3-head.json, c-round-357/remount3-atree.json'
b['open_findings'].append({'id': 'C-R357-01', 'severity': 'medium', 'origin': 'B spec (leaf design not ruled for remount) / A STOP confirmed by C', 'title': 'PERF-10a tree: after a narrow->wide remount the stopped insert-marker status keeps an appended tempo-seed sentence (HEAD replaces it) and is not re-announced', 'evidence': EV, 'repro': 'Add Night Pulse Full mix; Space; click the ruler bottom strip; Space; resize 800x900 then 1440x900; compare status with HEAD', 'status': 'open (D-29z1156): ruled (b), fix in round 358 (b-round-357/sketch/source-delta.patch.txt; RM1/RM2)', 'added': ADDED})
lows = [
    {'id': 'A-R357-REVIEW-SPLIT-RENDER-LATENT', 'title': 'outside React events the playback store write renders at SyncLane apart from status dispatches; the follow leaf could then decide on a stale committed status (unreachable today)', 'evidence': 'a-round-357.md code-reviewer section', 'repro': 'static: a future out-of-event stop caller with a matching status preview'},
    {'id': 'A-R357-REVIEW-FWPB1-TIMING', 'title': 'FW-PB1 uses a real 50 ms wait with act off (flake risk); assert statusSequence === before + 1 and add a pending-preview variant', 'evidence': 'a-round-357.md code-reviewer section', 'repro': 'read bars-ruler-ui.test.tsx FW-PB1'},
    {'id': 'A-R357-REVIEW-READ-POLICY', 'title': 'two isPlaying read policies (MarkerRow getState live vs StudioWorkspace committed ref) are not documented in one place (sketch-review finding 7 accepted the deviation)', 'evidence': 'a-round-357.md code-reviewer section; b-round-356/sketch-review.md finding 7', 'repro': 'read ArrangementMarkerRow and StudioWorkspace isPlaying reads'},
    {'id': 'A-R357-TEMPO-SEED-REMOUNT-DUP', 'title': 'pre-existing by trace: StudioWorkspace-local tempo/grid state and tempoSeedOpenRef reset on every narrow->wide remount, so the tempo seed re-runs and re-appends its status', 'evidence': 'a-round-357.md (probe v2: a-round-357/remount-probe-v2-a-tree.json)', 'repro': 'Add Night Pulse Full mix (no ruler click); resize 800x900 then 1440x900; read status and the tempo field on HEAD'},
]
for low in lows:
    low.update({'severity': 'low', 'origin': 'A round 357 (code-reviewer / A probe)', 'status': 'deferred_low_polish (D-29z1157)' + ('; C record row PRE-REMOUNT in round 358 confirms on HEAD; re-evaluate severity if a typed BPM is lost' if low['id'] == 'A-R357-TEMPO-SEED-REMOUNT-DUP' else ''), 'added': ADDED})
    b['open_findings'].append(dict(low))
    b['deferred_low_polish'].append(dict(low))
b['architecture_signals'].append({'id': 'A-R357-ARCH-PLAYBACK-SPLIT-HOOKS', 'origin': 'a-round-357 code-reviewer Architecture note', 'note': 'isPlaying moved into a lib/ store; the follow leaf adds a lifecycle to StudioWorkspace; ~44 test files switched to useWorkspaceProbe; architecture-checkpoint.md:33 lists the useArrangement() shape as an invariant. Verdict keep. Proposed: a Georgian note on split playback hooks and the live vs committed read policy, useWorkspaceProbe as documented test API (the remount test is added in round 358). Rejected alternative: a plain React context backed by provider useState.', 'status': 'signal, not scheduled (D-29z1157); joins ARCH-R338-STORES-PROVIDER question of the pending checkpoint request', 'added': ADDED})
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted, repeated (D-29z1158): still no answer at round 358 planning; also carries A-R357-ARCH-PLAYBACK-SPLIT-HOOKS; non-blocking | ' + r['status']

open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v321 written')
