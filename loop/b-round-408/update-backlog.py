# B round 408 -> 409 planning, part 1: backlog v381 -> v382 (acceptance of round 408 from C evidence only). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-408/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 381, b['version']
BY = '2026-11-08 B round 408 -> 409 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1416', "Round 408 (PERF-11c-iii-e-i) accepted on independent C evidence: c-round-408.json taskStatus PASS, 8 rows passed (SOURCE-SCOPE start/end + L57, PATCH-IDENTITY cmp-identical to sketch sha 029e5f8a, LANE-ACTIONS ok both viewports no pageErrors, LEAF-PROBE Lane [0,12,4,4,0,0,0,4,4,4,4,4,8] and 0 diffs vs sketch both viewports (1440 attempt 1 cold-server timeout kept, L38), UNIT 911/911 + 5/5 mutants RED on C's committed scratch, AUTH, DOCS), failed [], bugs [], browserVerified/realVerified true; gate 408 published 37b1db8 on both remotes (review COMMIT OK, no blockers). PERF-11c-iii-e-i done. Still open evidence: fake-bearer /api/studio-token row BLOCKED (backend unavailable in cloud). C-recorded gaps (not bugs): library drop / video import / lane drag not browser-run (unit-covered); active-track probe step vacuous (B-R408-PROBE-ACTIVE-TRACK-VACUOUS, fix home e-ii probe)."),
 ('D-29z1417', "Round 408 reviewer findings ruled. TL-R406-SK-L1/L2/L3 closed (fixed in round 408: AC7 keys from the Pick, getLivePosition rename, one sorted list; C round 408 rows 5/7 PASS). Gate-408 review items 1/2 = TL-R408-SK-L1/L2 (already deferred_low_polish, no duplicate); items 3/4 info, closed. A-R408-REVIEW-AC8-PAN-TITLE (AC8 title says 'pan commit' but calls setTrackPan) -> deferred_low_polish, fix home = next round owning actions-context.test.tsx (with TL-R408-SK-L1/L2). Architecture notes (A reviewer + gate 408): Pick, memo object and deps are three parallel 59-key lists (signal 4); both 'keep for now'; proposal = derive object and deps from one declaration without type assertions -> recorded as SIG-R408-ACTIONS-TRIPLE-LIST and as the fifth echo on ARCH-CHECKPOINT-SYS-R385-ACTIONS, not scheduled (it is the feature-boundary checkpoint's question, D-29z1418)."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
s = [x for x in q['stages'] if x.get('id') == 'PERF-11c-iii-e-i']
assert len(s) == 1
pre(s[0], 'done (D-29z1416): C round 408 PASS browserVerified/realVerified true; gate 408 published 37b1db8')
n = 0
for f in b['deferred_low_polish']:
    if f.get('id') in ('TL-R406-SK-L1', 'TL-R406-SK-L2', 'TL-R406-SK-L3'):
        pre(f, 'closed (D-29z1417): fixed in round 408, C round 408 PASS, gate 37b1db8'); n += 1
assert n == 3
b['deferred_low_polish'].append({'id': 'A-R408-REVIEW-AC8-PAN-TITLE', 'severity': 'low', 'origin': 'A (code-reviewer)', 'evidence': 'a-round-408.md section 4', 'title': "actions-context.test.tsx AC8 title says 'a pan commit' but the test calls setTrackPan, not the commitTrackPan gesture", 'status': 'deferred_low_polish (D-29z1417)', 'added': BY, 'fix_home': 'next round that owns actions-context.test.tsx (with TL-R408-SK-L1/L2)'})
b['architecture_signals'].append({'id': 'SIG-R408-ACTIONS-TRIPLE-LIST', 'source': 'a-round-408.md section 4 Architecture note; gates/round-408/review.md Architecture note', 'signal': 4, 'note': 'ArrangementContext.tsx ArrangementActions Pick, actions memo object and its deps are three parallel 59-key lists edited in lockstep; AC7 catches a missing/extra object key, not a missing dep (Biome lint does). Both reviewers: keep for now; proposal: one declaration (ACTION_KEYS with satisfies, no as const) deriving Pick, object and deps', 'status': 'recorded (D-29z1417), not scheduled; question carried by ARCH-CHECKPOINT-SYS-R385-ACTIONS', 'added': BY})
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-SYS-R385-ACTIONS':
        pre(o, 'requested (D-29z1417): fifth echo (A reviewer 408 + gate 408, keep; triple 59-key list); still non-blocking')
for r in b['rounds']:
    if r.get('round') == 408:
        r['status'] = 'done (D-29z1416): C PASS, gate 408 published 37b1db8'
b['version'] = 382
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v381 -> v382\n')
print('ok v382')
