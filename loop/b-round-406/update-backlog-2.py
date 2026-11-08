# B round 406 -> 407 planning, part 2: backlog v378 -> v379 (round 407 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-406/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 378, b['version']
BY = '2026-11-08 B round 406 -> 407 planning'
SHA = '4ec62e316b8776b7'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1410', f"Round 407 = PERF-11c-iii-d-ii from b-round-406/sketch-407.patch.txt (sha256 {SHA}..., 2 files: ArrangementVideoDock.tsx memo inner ArrangementVideoDockViewInner + memo caption + reader keyed on videoTrackId + video-lane commit signal (useCommittedVideoLaneClips + layout-effect publishCommittedVideoClips notifying subscribeVideoLanePreview listeners); drag-preview-render.test.tsx DP73-DP75 + inner in VIDEO_DOCK_COMPONENTS) + new doc 260 (Completed (C round 407 PASS)) + doc 259 l.4 -> Completed (C round 407 PASS). Evidence on sketch: tsc/Biome rc 0; 16 covering files 360/360; full vitest 262/3881 rc 0; mutants 7/7 red; dev leaf probe caption [0,3,1,...,2] -> all 0, dock shell unchanged, both viewports; new browser stopped-seek recipe (ruler click, move, Ctrl+Z, Ctrl+Shift+Z) error 0 on HEAD and sketch both viewports, commit-notify mutant error 1.5 s; play drift 0.008/0.012 s. tech-lead review on the dispatched sha: no Medium+. Shell keeps useArrangement() + pause ref (R406-CR-L2 ruling). Baseline 8ac5bfb clean; frozen 1297; grants 4. Order after 407: PERF-11c-iii-e (Lane; re-rule ARCH-CHECKPOINT-SYS-R385-ACTIONS echoes and TL-R403-SK-L1 there), PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5 (direction gate), REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule); REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10; RETRO at 416."),
 ('D-29z1411', "Lows: R406-CR-L3 -> covered by C row 4 VIDEO-SYNC in round 407 (play loop reads getLivePosition from actions every sample); TL-R406-SK-L4 -> closed as equivalent by construction (same function identity; shell stays on useArrangement by ruling); sketch-review Lows TL-R407-SK-L1 (cachedLane top-level fields lag after track-only commit, no visible effect) and TL-R407-SK-L2 (no caption-text unit row) -> deferred_low_polish; TL-R407-SK-L3 info accepted."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
s = [x for x in q['stages'] if x.get('id') == 'PERF-11c-iii-d-ii']
assert len(s) == 1
pre(s[0], f'dispatched (D-29z1410): round 407, b-round-406/sketch-407.patch.txt sha {SHA}')
pre(q, 'in_progress (D-29z1410): PERF-11c-iii-d-i done (406, 8ac5bfb); round 407 = PERF-11c-iii-d-ii; then e (Lane), PERF-15')
for o in b['open_findings']:
    if o.get('id') == 'TL-R406-SK-L4':
        pre(o, 'closed (D-29z1411): equivalent by construction, recorded')
    if o.get('id') == 'R406-CR-L3':
        pre(o, 'scheduled (D-29z1411): closes on C round 407 row 4 VIDEO-SYNC PASS')
    if o.get('id') == 'R406-CR-L2':
        pre(o, 'closed (D-29z1411): ruling line in round 407 task (shell keeps useArrangement + ref)')
for fid, title in [('TL-R407-SK-L1', 'useVideoLanePreviewReader cachedLane = {...base, clips} lives across commits, so top-level fields (tracks) can lag after a track-only commit; no visible effect (readers use tracks only to find the video track, the memo key). Hardening: refresh cachedLane from the current base and keep the clip list identity'), ('TL-R407-SK-L2', 'no unit row pins the dock caption text following a commit or a videoSources-only change (same hook as the gap, DP74)')]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-406/sketch-review.md', 'title': title, 'status': 'deferred_low_polish (D-29z1411)', 'added': BY})
b['rounds'].append({'round': 407, 'task': 'current-task.md', 'decision': 'D-29z1408..D-29z1411', 'type': 'PERF-11c-iii-d-ii (VideoDock memo inner + video-lane commit signal; behaviour-preserving)', 'status': 'dispatched', 'note': f'baseline 8ac5bfb clean; frozen b-round-406/r407-frozen-sha256.txt (1297); grants b-round-406/grants-407.txt (4); patch b-round-406/sketch-407.patch.txt sha {SHA}; claims b-round-406/claims-407.sh', 'added': BY})
b['current_task'] = 'Round 407: PERF-11c-iii-d-ii from B reviewed sketch b-round-406/sketch-407.patch.txt (current-task.md)'
b['version'] = 379
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v378 -> v379\n')
print('ok v379')
