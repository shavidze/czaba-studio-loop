"""B round 358 -> 359 planning: backlog v321 -> v322. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-358/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
shutil.copyfile(B, os.path.join(L, 'b-round-358/backlog-before-359.json'))
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 321, b['version']
ADDED = '2026-11-06 B round 358 -> 359 planning'
b['version'] = 322
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 359: C-R358-01 fix, workspace tempo/grid settings survive a remount)'
b['advisor_used_by_B'] = 'yes (round 358 -> 359 planning: advisor available; consulted after orientation and before declaring done)'

b['decisions_log_b'] += [
    {'id': 'D-29z1159', 'date': '2026-11-06', 'text': 'Round 358 (PERF-10a re-dispatch) closed PASS from C evidence: c-round-358.json taskStatus PASS, browserVerified/realVerified true; PERF 84/84, 0 NEW, play start/stop components 70 -> 28; REMOUNT 7/7 equal to HEAD; PLAY/FOLLOW/NARROW at both viewports, VIDEO-SYNC, VIDEO-FAIL-STOP (variant 1) and G358-AUTH PASS. Gate 358 published f269022 (rounds 357-358). PERF-10a is done (its play rows stay record until PERF-10a-BUDGETS). C-R357-01 is closed (browser REMOUNT PASS + RM1/RM2 green in cover.log). The two VIDEO-FAIL-STOP variants C did not run (Follow paused; playhead reaches clip) are carried as C rows into PERF-10a-BUDGETS; they do not reopen PERF-10a because PERF-10a changes no video code path beyond the isPlaying read that variant 1 exercised.'},
    {'id': 'D-29z1160', 'date': '2026-11-06', 'text': 'C-R358-01 (Medium, pre-existing on HEAD d49536b and f269022): a typed tempo is lost and the tempo-seed sentence is re-appended on a narrow->wide window resize, because tempo/grid/snap/metronome state lives in StudioWorkspace useState and the route unmounts StudioWorkspace below 900 px while the provider lives. A-R357-TEMPO-SEED-REMOUNT-DUP is the same root cause: promoted Low -> Medium, merged into C-R358-01, removed from deferred_low_polish (L7). Ruling (smallest honest behaviour): the tempo/grid cluster (tempoBpm, tempo-seed-open flag, grid/snap hand-chosen flags, snap, seconds and musical division, grid mode, grid density, metronome) lives as long as the ArrangementProvider (the open Studio page), in a provider-owned zustand vanilla store like playback-store.ts. Not in scope: surviving a page reload (a reload is a new provider and starts from the defaults, as today) and keeping StudioWorkspace mounted while narrow (a layout/behaviour change for Saba). Follow mode is not stored: D-29z1156 re-syncs it at mount. Envelope mode and waveform zoom also reset on remount by construction; they are a separate view-state class, recorded as B-R359-VIEW-STATE-REMOUNT (Low, by trace, deferred_low_polish) and C records them in round 359. B sketch (b-round-358/sketch/source-delta.patch.txt): WS1-WS4 red on HEAD f269022 and WS5 green (b-round-358/ws-on-head.log); on the sketch, 79 covering files are 1452/1452, typecheck rc 0 and Biome rc 0; mutants M-S1..M-S5 are red on their named rows; C\'s own PRE-REMOUNT probe on a sketch dev server keeps 100 BPM with no repeated seed sentence at both viewports (b-round-358/beh-sketch-*.json), and remount-probe3 equals c-round-358/remount3-tree.json. Round 359 = this fix.'},
    {'id': 'D-29z1161', 'date': '2026-11-06', 'text': 'Routing of round-358 notes: A-R358-REVIEW-RM1-SEQ (Low) and A-R358-REVIEW-LEAF-GATE-COVER (Low; C\'s own mutant C-M1, removing the leaf prev-value guard, survives the 47 Follow files and RM1/RM2: c-round-358/mutant-noguard.log) go to open_findings and deferred_low_polish. The stale-snapshot write-skip note joins A-R357-REVIEW-SPLIT-RENDER-LATENT (no new id). The Architecture note (extract useFollowPlaybackSync keeping the effect order) joins signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS, not scheduled. C\'s observation "Next marker with no marker while playing stops playback without a message" is closed as info by trace, not a bug: adjacentMarkerTarget (app/lib/arrangement/markers.ts:162) returns the project end when no marker or edge lies ahead, stepMarker seeks there, and playback stops at the project end; the button\'s label says "marker or clip edge". Recorded as C-R358-OBS-NEXT-MARKER-END (info, closed).'},
    {'id': 'D-29z1162', 'date': '2026-11-06', 'text': 'Order after round 359: REGRESSION first at any planning on/after 2026-11-08 -> PERF-10a-BUDGETS (from C358 values, plus the two VIDEO-FAIL-STOP variants) -> PERF-10b -> PERF-9 -> PERF-11..15 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries. RETRO at round 368 or at the end of STUDIO-PERFORMANCE. Architecture checkpoint request repeated (b-round-358/root-request-arch-checkpoint.md): round 359 adds a 12th provider store and a third StudioWorkspace lifecycle concern (session restore) on the same 3.5k-line owner; non-blocking.'},
]

for r in b['rounds']:
    if r.get('round') == 358:
        r['status'] = 'closed PASS (D-29z1159): C round 358 PASS, browserVerified true; gate 358 published f269022'
b['rounds'].append({'round': 359, 'task': 'current-task.md', 'decision': 'D-29z1159..D-29z1162',
                    'type': 'C-R358-01 fix: tempo/grid/snap/metronome settings survive a StudioWorkspace remount (provider-owned workspace-session store)',
                    'status': 'dispatched',
                    'note': 'baseline f269022, clean tree; claims b-round-358/claims-359.sh; sketch b-round-358/sketch/*',
                    'added': ADDED})

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1159): PERF-10a done (C round 358 PASS, gate f269022); round 359 = C-R358-01 Medium fix (bug gate); then PERF-10a-BUDGETS | ' + q['status']
for s in q['stages']:
    if s['id'] == 'PERF-10':
        s['status'] = 'in_progress (D-29z1159): PERF-10a done (C round 358 PASS, browserVerified true, gate 358 f269022); next PERF-10a-BUDGETS (+ VIDEO-FAIL-STOP variants 2/3), then PERF-10b | ' + s['status']

for f in b['open_findings']:
    if f.get('id') == 'C-R357-01':
        f['status'] = 'closed (D-29z1159): fixed in round 358; C round 358 REMOUNT 7/7 equal to HEAD (c-round-358/remount3-tree.json), RM1/RM2 green (c-round-358/cover.log); published f269022'
    if f.get('id') == 'A-R357-TEMPO-SEED-REMOUNT-DUP':
        f['severity'] = 'medium'
        f['status'] = 'merged into C-R358-01 (D-29z1160): promoted Low -> Medium (a typed BPM is lost on a window resize); fix in round 359'
b['deferred_low_polish'] = [d for d in b['deferred_low_polish'] if d.get('id') != 'A-R357-TEMPO-SEED-REMOUNT-DUP']

b['open_findings'].append({'id': 'C-R358-01', 'severity': 'medium', 'origin': 'C round 358 PRE-REMOUNT record row; pre-existing (identical on HEAD d49536b and the round-358 tree)', 'title': 'a typed tempo reverts to the seeded BPM and the tempo-seed sentence is re-appended after a narrow->wide window resize (StudioWorkspace remount)', 'evidence': 'c-round-358.json bugs[0]; c-round-358/beh-head-1440x900.json, beh-tree-1440x900.json, beh-*-1280x720.json rows.pre; B sketch fix b-round-358/beh-sketch-*.json', 'repro': 'Open /studio-lab 1440x900; add Night Pulse Full mix (tempo 120); resize 800x900 -> 1440x900; type 100 + Enter in BPM; resize 800x900 -> 1440x900: field back to 120, seed sentence appended', 'status': 'open (D-29z1160): fix in round 359 (b-round-358/sketch/source-delta.patch.txt; WS1-WS5)', 'added': ADDED})
lows = [
    {'id': 'A-R358-REVIEW-RM1-SEQ', 'title': 'RM1 checks only the final text; statusSequence === before + 2 (seed + Follow) would separate "seed appended then overwritten" from "seed never fired"', 'evidence': 'a-round-358.md code-reviewer section', 'repro': 'read follow-remount-ui.test.tsx RM1', 'origin': 'A round 358 (code-reviewer)'},
    {'id': 'A-R358-REVIEW-LEAF-GATE-COVER', 'title': 'no row pins one status write per Stop transition while mounted; C mutant C-M1 (leaf prev-value guard removed) survives all 47 Follow files and RM1/RM2', 'evidence': 'a-round-358.md code-reviewer section; c-round-358/mutant-noguard.log', 'repro': 'remove the syncedRef guard in ArrangementPlaybackFollowSyncInner; run the Follow tests', 'origin': 'A round 358 (code-reviewer) + C round 358 mutant'},
    {'id': 'B-R359-VIEW-STATE-REMOUNT', 'title': 'by trace: envelope mode and waveform zoom are StudioWorkspace useState and reset on a narrow->wide remount (separate view-state class from C-R358-01; C records it in round 359)', 'evidence': 'StudioWorkspace.tsx envelopeMode / waveformZoom useState (f269022); D-29z1160', 'repro': 'turn Env on and set waveform zoom 2x; resize 800x900 -> 1440x900; read both', 'origin': 'B round 358 -> 359 planning (by trace)'},
]
for low in lows:
    low.update({'severity': 'low', 'status': 'deferred_low_polish (D-29z1161)' if low['id'] != 'B-R359-VIEW-STATE-REMOUNT' else 'deferred_low_polish (D-29z1160); C record row VIEW-STATE in round 359', 'added': ADDED})
    b['open_findings'].append(dict(low))
    b['deferred_low_polish'].append(dict(low))
b['open_findings'].append({'id': 'C-R358-OBS-NEXT-MARKER-END', 'severity': 'info', 'origin': 'C round 358 observation (same on HEAD)', 'title': 'Next marker with no marker while playing stops playback without a new message', 'evidence': 'c-round-358/marker-*.json; app/lib/arrangement/markers.ts:162 (target = project end)', 'repro': 'play with one clip and no markers; click Next marker', 'status': 'closed by trace (D-29z1161): by design, seeks to the project end where playback stops; no task', 'added': ADDED})

for s in b['architecture_signals']:
    if s.get('id') == 'A-R357-ARCH-PLAYBACK-SPLIT-HOOKS':
        s['note'] += ' | round 358 (D-29z1161): reviewer proposes extracting useFollowPlaybackSync owned by StudioWorkspace with the same effect order (rows RM1 + sequence, RM2, a Stop-transition sequence row). Round 359 (D-29z1162) adds a 12th provider store (workspace-session) and a session-restore concern to StudioWorkspace.'
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted, repeated (D-29z1162): no answer at round 359 planning; b-round-358/root-request-arch-checkpoint.md adds the workspace-session store; non-blocking | ' + r['status']

open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v322 written')
