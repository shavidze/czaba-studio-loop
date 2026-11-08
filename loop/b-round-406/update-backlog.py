# B round 406 -> 407 planning, part 1: backlog v377 -> v378 (acceptance of round 406 from C evidence only). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-406/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 377, b['version']
BY = '2026-11-08 B round 406 -> 407 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1408', "Round 406 (PERF-11c-iii-d-i) accepted on independent C evidence: c-round-406.json taskStatus PASS, 8 rows passed (SOURCE-SCOPE start/end + L57, PATCH-IDENTITY cmp-identical to sketch sha 60bdf24c, VIDEO-SYNC both viewports max |drift| 0.006/0.011 s paused false, LEAF-PROBE 0 differences vs sketch with VideoDock [0,3,1,1,1,0,1,1,1,1,1,1,2], UNIT 180/180 + 4/4 mutants RED on a committed scratch of the working tree, AUTH both viewports, DOCS), failed [], bugs [], browserVerified/realVerified true; gate 406 published 8ac5bfb on both remotes. PERF-11c-iii-d-i done. Still open evidence: fake-bearer /api/studio-token row BLOCKED (backend unavailable in cloud). C 'blocked' notes: (1) data-video-hardseeks does not exist on the dock - task-text defect by B, d-ii cites only real data-video-* attributes; (2) stopped seek-to-2s had no B recipe - in d-ii it becomes a scripted assert row run by B on HEAD/sketch/mutant."),
 ('D-29z1409', "Round 406 Lows ruled: R406-CR-L1 (doc cites loop artifacts) info, closed; R406-CR-L2 (pausePlaybackWithStatus chain not traced) -> d-ii ruling line: the outer dock shell keeps useArrangement() and the pausePlaybackWithStatus ref, only the inner is memoised; R406-CR-L3 (no behavioural pin on getLivePosition through actions) -> d-ii row candidate, ruled in the d-ii task. Gate-406 review items 2/3 are TL-R406-SK-L2/L1 (already deferred), item 4 = TL-R406-SK-L4 (d-ii render-budget). Architecture note: third echo on the actions region (gate 405 review, A reviewer round 406, gate 406 review), all 'keep'; concrete proposal (after d-ii: const-tuple key derivation TL-R403-SK-L1 + livePosition rename TL-R406-SK-L2, AC7 without hardcoded count, no type assertion) recorded on ARCH-CHECKPOINT-SYS-R385-ACTIONS as a signal, not scheduled; re-ruled at the PERF-11c-iii-e planning."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
s = [x for x in q['stages'] if x.get('id') == 'PERF-11c-iii-d-i']
assert len(s) == 1
pre(s[0], 'done (D-29z1408): C round 406 PASS browserVerified/realVerified true; gate 406 published 8ac5bfb')
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-SYS-R385-ACTIONS':
        pre(o, 'requested (D-29z1409): third keep-echo (gate 405, A reviewer 406, gate 406); proposal after d-ii = const-tuple + livePosition rename; signal only, re-ruled at PERF-11c-iii-e planning')
        o['echoes_d29z1409'] = ['gates/round-405/review.md', 'a-round-406.md Architecture note', 'gates/round-406/review.md']
for fid, sev, title, st in [
  ('R406-CR-L1', 'info', 'doc 259 cites loop artifacts outside the repo', 'closed (D-29z1409): info, required by the task'),
  ('R406-CR-L2', 'low', 'pausePlaybackWithStatus dependency chain not traced', 'scheduled (D-29z1409): d-ii ruling line keeps the shell on useArrangement() and the ref'),
  ('R406-CR-L3', 'low', 'no behavioural pin on what getLivePosition returns through actions', 'scheduled (D-29z1409): ruled in the d-ii task')]:
    b['open_findings'].append({'id': fid, 'severity': sev, 'origin': 'A (code-reviewer)', 'evidence': 'a-round-406.md', 'title': title, 'status': st, 'added': BY})
for r in b['rounds']:
    if r.get('round') == 406:
        r['status'] = 'done (D-29z1408): C PASS, gate 406 published 8ac5bfb'
b['baseline'] = b.get('baseline') if not isinstance(b.get('baseline'), str) else b['baseline']
b['version'] = 378
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v377 -> v378\n')
print('ok v378')
