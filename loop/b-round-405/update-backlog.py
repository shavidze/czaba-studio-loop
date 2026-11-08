# B round 405 -> 406 planning, part 1: backlog v375 -> v376 (acceptance of round 405 from C evidence only). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-405/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 375, b['version']
BY = '2026-11-08 B round 405 -> 406 planning'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def every(idv):
    h = node(idv); assert len(h) >= 1, idv; return h
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
decisions = [
 ('D-29z1403', "Round 405 (SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2) accepted on independent C evidence: c-round-405.json taskStatus PASS, 7 rows passed (SOURCE-SCOPE start/end + L57, PATCH-IDENTITY byte-identical to sketch sha c64a5589ed319464, AUTH both viewports, STUDIO-SMOKE 32 steps x 2 viewports with a running AudioContext and 0 differences vs the round-404 run, UNIT+MUTANT 85/85 and 14/14 mutants RED on a scratch copy of the working tree, DOCS), browserVerified/realVerified true, failed []; gate 405 published 5c89a95 on both remotes. SYS-R385-2 done and SYS-R385-LEAF-ACTIONS-CONTEXT done (both stages). Closed on C PASS: C-R404-A-AC1-COVERAGE, A-R404-REVIEW-AC2-ALL-KEYS, A-R404-REVIEW-LIBRARY-PARAM, B-R374-MASTER-VACUOUS-NAME-COUNTS, A-R371-REVIEW-GH5-IDENTITY, TL-R403-SK2-L1, TL-R403-SK2-L2. GATE371-L2 and GATE375-L2 closed per D-29z1399 (C mutantRedOnTree: the four comparator mutants GH2 x2 and RB-LEAF3 x2 red on the tree). Fake-bearer token row stays BLOCKED (backend unavailable in cloud, returns 500) as open evidence."),
 ('D-29z1404', "Round 405 findings ruled. C-R405-GH5-NOT-G1-VACUOUS (= A-R405-REVIEW-GH5-G1-VACUOUS = gate-405 item 1) ruled Low, consistent with D-29z1397 for the same class (A's reviewer Medium, C Low): a never-failing not.toBe('g1') line in a dispatched test; the live groupHeaderIds assertion is proven by MU-405-GH5-RECORDER; no behaviour impact. Fix home: deferred_low_polish (fix: assert muted[0].name === 'Group 2' or compare with groups[0].id); round 406 does not own selection-wrappers-render.test.tsx. Gate-405 item 2 (AC7 load step uses two microtask flushes) = A's AC7 timing Low -> deferred_low_polish GATE405-L2-AC7-LOAD-FLUSH. Gate-405 item 3 (ACTION_KEY_COUNT magic number) closed as intended pin (round-405 side-effects table). A-R405-REVIEW-METER-UI-NAME -> deferred_low_polish. Gate-405 item 5 (teardown not seen) info, not a finding: C ran the 6 files 85/85 and 14 mutant runs pristine before/after. Gate-405 Architecture note (derive the action names from one const tuple; keep) is a further echo on TL-R403-SK-L1: signal, not a task; the reviewer's own trigger is 'a third round touches the list', which PERF-11c-iii-d would be, so B rules it at the d planning (D-29z1405)."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
pre(every('SYS-R385-2')[0], 'done (D-29z1403): C round 405 PASS (browserVerified/realVerified true), gate 405 published 5c89a95')
pre(every('SYS-R385-LEAF-ACTIONS-CONTEXT')[0], 'done (D-29z1403): stage 1 (C round 404, dd52107) + stage 2 (C round 405, 5c89a95); doc 258 Completed (C round 405 PASS)')
for lid in ['C-R404-A-AC1-COVERAGE', 'A-R404-REVIEW-AC2-ALL-KEYS', 'A-R404-REVIEW-LIBRARY-PARAM', 'B-R374-MASTER-VACUOUS-NAME-COUNTS', 'A-R371-REVIEW-GH5-IDENTITY', 'TL-R403-SK2-L1', 'TL-R403-SK2-L2']:
    for o in every(lid):
        pre(o, 'closed (D-29z1403): C round 405 PASS, published 5c89a95')
for lid in ['GATE371-L2-COMPARATOR-PER-KEY', 'GATE375-L2-COMPARATOR-UNSTABLE-PROP']:
    for o in every(lid):
        pre(o, 'closed (D-29z1403/D-29z1399): C round 405 mutantRedOnTree, 4 comparator mutants red on the tree (c-round-405/mutants/summary.txt)')
for o in every('TL-R403-SK-L1'):
    o['gate405_echo_d29z1404'] = 'gates/round-405/review.md Architecture note (one const tuple; keep; worth it only if a third round touches the list): echo, ruled at PERF-11c-iii-d planning (D-29z1405)'
b['deferred_low_polish'].append({'id': 'C-R405-GH5-NOT-G1-VACUOUS', 'severity': 'low', 'origin': 'A reviewer (A-R405-REVIEW-GH5-G1-VACUOUS), dispatched test; confirmed by C; gate 405 item 1', 'evidence': 'c-round-405.json bugs[0]; c-round-405.md Findings; gates/round-405/review.md item 1', 'repro': "selection-wrappers-render.test.tsx:490 expect(muted[0].id).not.toBe('g1'); groups.ts:336 ids are crypto.randomUUID()", 'title': "GH5 not.toBe('g1') can never fail; no id assertion proves the muted group is Group 2", 'fix': "assert muted[0].name === 'Group 2' or compare with live(api).arrangement.groups[0].id", 'status': 'deferred_low_polish (D-29z1404)', 'added': BY})
b['deferred_low_polish'].append({'id': 'GATE405-L2-AC7-LOAD-FLUSH', 'severity': 'low', 'origin': 'gate 405 reviewer item 2 (= A-R405 AC7 timing Low)', 'evidence': 'gates/round-405/review.md item 2; a-round-405.md section 4', 'repro': 'actions-context.test.tsx AC7 waits for song ready with two await Promise.resolve() flushes', 'title': 'AC7 load step depends on two microtask turns; an extra loader hop would fail with a misleading message', 'fix': "waitFor(() => expect(sourceStates.song?.status).toBe('ready'))", 'status': 'deferred_low_polish (D-29z1404)', 'added': BY})
b['deferred_low_polish'].append({'id': 'A-R405-REVIEW-METER-UI-NAME', 'severity': 'low', 'origin': 'A code-reviewer', 'evidence': 'a-round-405.md section 4', 'repro': "meter-ui.test.tsx:496-513 counts only 'ArrangementMaster' (live: the file mounts <ArrangementMaster /> directly)", 'title': 'meter-ui could also count ArrangementMasterViewInner', 'status': 'deferred_low_polish (D-29z1404)', 'added': BY})
b['open_findings'].append({'id': 'GATE405-L3-ACTION-COUNT-MAGIC', 'severity': 'info', 'origin': 'gate 405 reviewer item 3', 'evidence': 'gates/round-405/review.md item 3', 'title': 'ACTION_KEY_COUNT = 34 is a hard-coded number', 'status': 'closed (D-29z1404): intended pin (round-405 side-effects table); acceptable per the reviewer', 'added': BY})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
pre(q, 'in_progress (D-29z1403): SYS-R385 done (rounds 404-405, 5c89a95); next PERF-11c-iii-d (VideoDock), then -e (Lane)')
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 405:
        r['status'] = 'C PASS (c-round-405.json, browserVerified/realVerified true, 1 Low deferred); gate 405 published 5c89a95'
for o in b['systemic_tasks']:
    if o.get('id') == 'SYS-R385-LEAF-ACTIONS-CONTEXT' and not o['status'].startswith('done'):
        pre(o, 'done (D-29z1403)')
b['version'] = 376
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v375 -> v376\n')
print('ok v376')
