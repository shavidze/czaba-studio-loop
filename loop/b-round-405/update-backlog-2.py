# B round 405 -> 406 planning, part 2: backlog v376 -> v377 (round 406 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-405/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 376, b['version']
BY = '2026-11-08 B round 405 -> 406 planning'
SHA = '60bdf24c7a0fff14'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1405', "PERF-11c-iii-d split into d-i (round 406: ArrangementActions 34 -> 36 with getLivePosition (value livePosition) and getPlaybackClock; ArrangementVideoDock reads getLivePosition/getPlaybackClock/getArrangement from useArrangementActions; AC7 count 36; behaviour-preserving) and d-ii (next: memoised ArrangementVideoDockViewInner returning placeholder + video box as a Fragment with rootRef as prop; useVideoLanePreviewReader keyed on videoTrackId + a committed video-lane clip list kept identity-stable via sameClipList (the commit signal for the stopped-sync effect); memoised caption; RB-LEAF7 and a stopped video-Undo re-seek row; mutants M1 memo removed, M2/M3 arrangement-keyed, M4 commit signal dropped). Per tech-lead (b-round-405/consult-tech-lead.md). ARCH-CHECKPOINT-SYS-R385-ACTIONS unanswered: option 1 (extend ArrangementActions) applied by the request's own clause. performance-optimizer dissent (separate props; b-round-405/consult-performance-optimizer.md) ruled down: identical identities (useCallback []), one actions source per SYS-R385 and tech-lead, AC7 pins. pausePlaybackWithStatus not an action (chain not proven stable; dock reads it via ref). Const-tuple (TL-R403-SK-L1) not folded: impossible without a type assertion or non-literal deps (tech-lead); re-ruled at Lane (e)."),
 ('D-29z1406', "Sketch review Lows (tech-lead, sha 60bdf24c..., b-round-405/sketch-review.md, no Medium+): TL-R406-SK-L1 AC7 title hardcodes 36, TL-R406-SK-L2 livePosition vs getLivePosition alias, TL-R406-SK-L3 deps sort by internal name -> deferred_low_polish; TL-R406-SK-L4 (no test that the dock reads from actions) -> proven by d-ii RB-LEAF7, equivalent by construction in d-i; TL-R406-SK-L5 (doc) -> doc 259 in round 406."),
 ('D-29z1407', f"Round 406 = PERF-11c-iii-d-i from b-round-405/sketch-406.patch.txt (sha256 {SHA}..., 3 files) + new doc 259 (l.4 'In Progress (stage 1 of 2; C round 406 PASS)'). Evidence on sketch: tsc/Biome rc 0; 8 covering files 180/180; full vitest 262/3878 rc 0; mutants 4/4 red; dev leaf probe 0 differences vs HEAD (22 leaves x 13 steps x 2 viewports); real-video playsync max |drift| 0.013 s HEAD and sketch. Baseline 5c89a95 clean; frozen 1296; grants 4. Order after 406: d-ii, then PERF-11c-iii-e (Lane), PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5 (direction gate), REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. Next RETRO at round 416."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
st = node('PERF-11c-iii')
assert len(st) == 1
pre(st[0], f'in_progress (D-29z1405/D-29z1407): d split into d-i (round 406, sketch {SHA}) and d-ii; then e (Lane)')
st[0]['substages_d29z1405'] = ['PERF-11c-iii-a', 'PERF-11c-iii-b', 'PERF-11c-iii-c1', 'PERF-11c-iii-c2a', 'PERF-11c-iii-c2b', 'PERF-11c-iii-d-i', 'PERF-11c-iii-d-ii', 'PERF-11c-iii-e']
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
stages = q['stages']
idx = [i for i, s in enumerate(stages) if s.get('id') == 'PERF-11c-iii-c2b'][0]
stages.insert(idx + 1, {'id': 'PERF-11c-iii-d-i', 'what': 'ArrangementActions 34 -> 36 (getLivePosition, getPlaybackClock); VideoDock reads its getters from useArrangementActions; AC7 36; doc 259', 'status': f'dispatched (D-29z1407): round 406, b-round-405/sketch-406.patch.txt sha {SHA}', 'added': BY})
stages.insert(idx + 2, {'id': 'PERF-11c-iii-d-ii', 'what': 'memoised ArrangementVideoDockViewInner + reader keyed on videoTrackId and committed video-lane clips (commit signal) + memo caption; RB-LEAF7 (inner 0 on zoom/audio mute/undo/add/preview; 1 on video-clip undo); stopped video-Undo re-seek row; perf-optimizer and tech-lead mutant lists in b-round-405/consult-*.md', 'status': 'not_started (D-29z1405): after d-i C PASS; B sketch + mutants + review before dispatch', 'added': BY})
pre(q, 'in_progress (D-29z1407): round 406 = PERF-11c-iii-d-i; then d-ii, e')
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-SYS-R385-ACTIONS':
        pre(o, 'default_applied (D-29z1405): no root answer by d planning; option 1 (extend ArrangementActions) per the request clause; still open for root, non-blocking')
for fid, title in [('TL-R406-SK-L1', 'AC7 title hardcodes the action count (36)'), ('TL-R406-SK-L2', 'internal livePosition vs public key getLivePosition aliased in two places (rename candidate)'), ('TL-R406-SK-L3', 'actions deps array sorts livePosition by internal name, object by key (cosmetic)')]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-405/sketch-review.md', 'title': title, 'status': 'deferred_low_polish (D-29z1406)', 'added': BY})
b['open_findings'].append({'id': 'TL-R406-SK-L4', 'severity': 'low', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-405/sketch-review.md', 'title': 'no test proves the dock reads its getters from the actions context', 'status': 'scheduled (D-29z1406): proven by PERF-11c-iii-d-ii RB-LEAF7', 'added': BY})
b['rounds'].append({'round': 406, 'task': 'current-task.md', 'decision': 'D-29z1403..D-29z1407', 'type': 'PERF-11c-iii-d-i (actions 34 -> 36; VideoDock getters from actions; behaviour-preserving)', 'status': 'dispatched', 'note': f'baseline 5c89a95 clean; frozen b-round-405/r406-frozen-sha256.txt (1296); grants b-round-405/grants-406.txt (4); patch b-round-405/sketch-406.patch.txt sha {SHA}; claims b-round-405/claims-406.sh', 'added': BY})
b['current_task'] = 'Round 406: PERF-11c-iii-d-i from B reviewed sketch b-round-405/sketch-406.patch.txt (current-task.md)'
b['version'] = 377
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v376 -> v377\n')
print('ok v377')
