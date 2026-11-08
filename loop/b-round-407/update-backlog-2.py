# B round 407 -> 408 planning, part 2: backlog v380 -> v381 (round 408 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-407/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 380, b['version']
BY = '2026-11-08 B round 407 -> 408 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1414', "PERF-11c-iii-e (ArrangementLane, the last useArrangement() leaf of PERF-11c-iii) split like d: e-i (round 408) = behaviour-preserving plumbing: ArrangementActions Pick 36 -> 59 (the 23 Lane callbacks not yet in it), the Lane reads its 29 callbacks from useArrangementActions() and keeps the 6 data fields (arrangement, collection, sourcePeaks, sourceDurations, pxPerSecond, videoSources) on useArrangement(); no render saving (leaf probe 0 differences). e-ii (next) = the render saving: memo inner + per-lane props/slices (performance-optimizer design in b-round-407/consult-performance-optimizer.md). Folded into e-i because it owns the actions region (re-rule at e planning, D-29z1409/D-29z1413): TL-R406-SK-L1 (AC7 hardcoded count -> AC7 derives the key list from the Pick source), TL-R406-SK-L2 (internal livePosition renamed getLivePosition, 13 sites, alias gone) and TL-R406-SK-L3 (deps sort by internal name; one sorted list now). TL-R403-SK-L1 const-tuple derivation NOT folded: tech-lead confirms it needs `as const` (type assertion) or a helper and adds a third list (sketch-review I5); stays deferred. The fader-test Low with 'fix home at the latest PERF-11c-iii-e' is already closed (D-29z1403); e-i grants no fader test. Dependency premise: every new key and its transitive deps are store-, empty- or already-actions-keyed (b-round-407/deps-trace.txt, 0 arrangement/history deps); getLibraryDragSource [collection.sources] = the coupling the existing addSourceToActiveTrack already has."),
 ('D-29z1415', "Round 408 dispatched from B's reviewed sketch b-round-407/sketch-408.patch.txt sha256 029e5f8a12e55c8f (3 files: ArrangementContext.tsx, ArrangementLane.tsx, actions-context.test.tsx) + new doc 261 (l.4 'In Progress (stage 1 of 2; C round 408 PASS)'). Evidence on sketch: tsc + Biome rc 0; 44 covering files 870/870 (max 21.9 % of a declared timeout); full vitest 262/3882 rc 0; mutants 5/5 red (drop solo, mismap solo->mute, wrap pan, per-commit history dep, drop getLibraryDragSource), pristine rc 0; dev leaf probe 0 differences vs HEAD (24 leaves x 13 steps x 2 viewports; Lane [0,12,4,4,0,0,0,4,4,4,4,4,8]); new browser LANE-ACTIONS probe (mute/solo click + Ctrl+Z, volume and pan pointer drags, Undo x2, active track) ok on HEAD and sketch at both viewports, mismap mutant fails the solo step via HMR. tech-lead review on the dispatched sha: APPROVE WITH LOWS (no Medium+); TL-R408-SK-L1/L2 deferred_low_polish, L3 accepted (identity-only rows), infos recorded. performance-optimizer consulted on the split (sound; no cheaper split). Baseline 5508f70 clean; frozen 1298; grants 4."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
st = q['stages']
idx = [i for i, x in enumerate(st) if x.get('id') == 'PERF-11c-iii-d-ii'][0]
st[idx+1:idx+1] = [
  {'id': 'PERF-11c-iii-e-i', 'what': 'ArrangementActions 36 -> 59 (the 23 remaining Lane callbacks); Lane reads its 29 callbacks from useArrangementActions(), data fields stay on useArrangement(); livePosition -> getLivePosition; AC7 keys derived from the Pick source (no count literal); AC8 lane paths; doc 261 (stage 1 of 2)', 'status': 'dispatched (D-29z1415): round 408, b-round-407/sketch-408.patch.txt sha 029e5f8a12e55c8f'},
  {'id': 'PERF-11c-iii-e-ii', 'what': 'Lane render saving: memo inner + per-lane props (clips, pxPerSecond, lane-scoped peaks/video/duration slices with content compare, track field compare); rows: own clip move re-renders that lane only, peaks arrival, zoom, video source arrival, exclusive solo (b-round-407/consult-performance-optimizer.md); closes PERF-11c-iii', 'status': 'not_started (D-29z1414): after e-i C PASS; B sketch + mutants + browser rows + review before dispatch; feature-boundary architecture checkpoint request at its planning'},
]
q['status'] = 'in_progress (D-29z1415): PERF-11c-iii-d done (407, 5508f70); round 408 = PERF-11c-iii-e-i; then e-ii, PERF-15 | ' + q['status']
q['execution_order_d29z1415'] = 'round 408 PERF-11c-iii-e-i -> e-ii -> PERF-15 -> SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. RETRO at 416.'
for f in b['deferred_low_polish']:
    if f.get('id') in ('TL-R406-SK-L1', 'TL-R406-SK-L2', 'TL-R406-SK-L3'):
        pre(f, 'fix_dispatched (D-29z1414): round 408 PERF-11c-iii-e-i; closes on C round 408 PASS')
    if f.get('id') == 'TL-R403-SK-L1':
        pre(f, 'deferred_low_polish (D-29z1414): tech-lead re-confirmed at e planning (needs as const or a helper; adds a third list)')
for fid, title in [
  ('TL-R408-SK-L1', "AC7 key regex '([A-Za-z]+)' would skip a future key with a digit or underscore (fails loudly but with a wrong-cause message); hardening '(\\w+)'"),
  ('TL-R408-SK-L2', "AC8 final `music()?.pan ?? 0` passes if the lookup finds nothing (the same test asserts solo/volume/pan on the same lookup first); hardening: assert music() defined"),
]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-407/sketch-review.md', 'title': title, 'status': 'deferred_low_polish (D-29z1415)', 'added': BY, 'fix_home': 'next round that owns actions-context.test.tsx'})
b['rounds'].append({'round': 408, 'task': 'current-task.md', 'decision': 'D-29z1412..D-29z1415', 'type': 'PERF-11c-iii-e-i (actions 36 -> 59; Lane callbacks from actions; behaviour-preserving)', 'status': 'dispatched', 'note': 'baseline 5508f70 clean; frozen b-round-407/r408-frozen-sha256.txt (1298); grants b-round-407/grants-408.txt (4); patch b-round-407/sketch-408.patch.txt sha 029e5f8a12e55c8f; claims b-round-407/claims-408.sh', 'added': BY})
b['current_task'] = 'Round 408: PERF-11c-iii-e-i from B reviewed sketch b-round-407/sketch-408.patch.txt (current-task.md)'
b['version'] = 381
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v380 -> v381\n')
print('ok v381')
