import json, os, sys

DONE = 'b-round-368/update-backlog-part1.done'
if os.path.exists(DONE):
    sys.exit('already applied')
b = json.load(open('backlog.json'))
assert b['version'] == 331, b['version']
D = '2026-11-06'
ADDED = '2026-11-06 B round 368 -> 369 planning'

def close(fid, d, why):
    for f in b['open_findings'] + b['deferred_low_polish']:
        if f.get('id') == fid:
            f['status'] = f'closed ({d}): {why} | ' + str(f.get('status'))
            return
    raise SystemExit('missing ' + fid)

r = [x for x in b['rounds'] if x.get('round') == 368][0]
r['status'] = 'c_pass_published 29f4b4d (D-29z1210): C round 368 PASS (c-round-368.json: 11 rows, browserVerified true, realVerified true); gate 368 published 29f4b4daa5dc on both remotes'

why = 'C round 368 PASS (c-round-368.json), gate 368 published 29f4b4d'
close('C-R367-DEDUP-CANCELLED-WRITE', 'D-29z1210', 'join fix; SC30/SC31 + C DEDUP P1/P2 storedA=true putCalls=2; ' + why)
close('C-R367-STATUS-LINE-PREMATURE', 'D-29z1210', 'doc 236 l.4 = Completed (C round 368 PASS), C DOCS row; ' + why)
close('C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN', 'D-29z1210', 'row SC32, mutant red (A mutants); ' + why)
close('A-R367-REVIEW-L-ABF', 'D-29z1210', 'SC22 title, SC33, doc claims (C DOCS row); ' + why)
for fid in ['A-R365-REVIEW-L3', 'A-R365-REVIEW-L4', 'A-R365-REVIEW-L5', 'A-R365-REVIEW-L6', 'C-R365-OBS-INTEGRITY']:
    close(fid, 'D-29z1210', 'SYS-R365-STEM-CACHE-HARDENING (= PERF-9b-ii) done; ' + why)
for t in b['systemic_tasks']:
    if t.get('id') == 'SYS-R365-STEM-CACHE-HARDENING':
        t['status'] = 'done (D-29z1210): PERF-9b-ii C round 368 PASS, gate 29f4b4d | ' + str(t.get('status'))

sp = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
for s in sp['stages']:
    if s.get('id') == 'PERF-9':
        s['status'] = 'in_progress (D-29z1210): 9a done (365), 9b-i done (366), 9b-ii done (C round 368 PASS, gate 29f4b4d); 9c awaiting_user; 9d root. Cloud part of PERF-9 complete | ' + s['status']
sp['status'] = 'in_progress (D-29z1210): PERF-9a, 9b-i and 9b-ii done (gate 29f4b4d); 9c awaiting_user, 9d root; round 369 = RETRO 369; then PERF-11..15 (REGRESSION first when due) | ' + sp['status']

base = {'origin': 'A code-reviewer (round 368)', 'evidence': 'a-round-368.md "code-reviewer findings"', 'added': ADDED}
gbase = {'origin': 'gate 368 code-reviewer', 'evidence': 'gates/round-368/review.md', 'added': ADDED}
new_def = [
    dict(base, id='A-R368-REVIEW-L1', severity='low',
         title='stem-cache join: hit 200 starts write W, a hit 404 queues a delete after W, a third storable 200 joins W -> key ends absent (HEAD kept it)',
         repro='a-round-368/l1-probe-v3.log (v3 storedA=false) vs a-round-368/l1-probe-head.log (HEAD storedA=true); C rated Low without re-running (c-round-368.json bugs[0])',
         status='deferred_low_polish (D-29z1211): ruled Low by B. Unlike C-R367-DEDUP-CANCELLED-WRITE (Medium: reachable by a StrictMode re-run plus abort in normal use), this needs the server to answer 200 -> 404 -> 200 for one static preview path inside one body-read/commit window (a deploy race); effect is one lost cache entry, re-stored on the next load, no wrong bytes. Same item as gate-368 review Low #2 (deduped). Fix candidate: tombstone on the pending write (gate review) when the stem-cache region is next owned. Also falsifies the b-round-367/sketch-review.md claim "v3 stores in every ordering where HEAD stored" (annotated; RETRO 369 input)'),
    dict(base, id='A-R368-REVIEW-L3', severity='low',
         title='stem-cache: the chain-start cancelled() check has no mutant (near-equivalent: a cancelled queued write still returns before put after sweep and list)',
         repro='a-round-368.md finding 3', status='deferred_low_polish (D-29z1211): add a list-not-called assertion or record it as an accepted equivalent mutant when the region is next owned'),
    dict(gbase, id='GATE368-L1-REMOVEFILE-SAME-NAME', severity='low',
         title='stem-cache put: on an aborted record write, removeFile(record.fileName) deletes the file the previous record still points to when the names are equal (get treats it as a miss; one valid entry lost)',
         repro='gates/round-368/review.md finding 1; stem-cache.client.ts put catch path', status='deferred_low_polish (D-29z1211): skip removeFile when previous.fileName === record.fileName, or prove names are unique per write with a row'),
    dict(gbase, id='GATE368-L3-QUEUED-BUFFER-RETENTION', severity='low',
         title='stem-cache: if a store call never settles (accepted TL-3), each later queued storeBytes closure keeps its ArrayBuffer alive until page close',
         repro='gates/round-368/review.md finding 3', status='deferred_low_polish (D-29z1211): cap queued writes or add a bounded timeout once a limit is measured'),
]
b['deferred_low_polish'].extend(new_def)
b['open_findings'].extend(new_def)
for fid, why in [('A-R368-REVIEW-L2', 'doc claim restated as the every-contract, no SC credit (a-round-368.md finding 2); C DOCS PASS'),
                 ('A-R368-REVIEW-L4', 'doc wording "(A once, B once)" (a-round-368.md finding 4); C DOCS PASS')]:
    b['open_findings'].append(dict(base, id=fid, severity='low', title=why.split(' (')[0], repro='a-round-368.md',
                                   status='closed (D-29z1211): fixed inside round 368 by A; ' + why))

b['architecture_signals'].append({
    'id': 'GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT', 'source': 'gates/round-368/review.md Architecture note + a-round-368.md Architecture note',
    'signal': 'stem-cache.client.ts holds the IndexedDB/OPFS adapter (createBrowserStemCacheStore) and the session write scheduler (commitChain, joined writes, deleteAfterPendingWrite); region changed in rounds 365, 367, 368',
    'verdict': 'keep (both reviewers). Proposal: move the browser adapter to a sibling stem-cache-browser-store.client.ts only if a fourth change lands in this region; acceptance SC1-SC33 unchanged and green, exports still importable from the current path',
    'status': 'signal only (D-29z1211), attached to ARCH-CHECKPOINT-PERF9-STEM-CACHE; not scheduled', 'added': ADDED})
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-PERF9-STEM-CACHE':
        a['signals_round_368'] = 'gate-368 and A-368 reviewers: keep; adapter split proposed on a fourth change (GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT). Condition "after C round 368 PASS" now met: request is due to root (non-blocking).'
        a['status'] = 'requested, due (D-29z1211): C round 368 PASS | ' + str(a.get('status'))

b['decisions_log_b'].extend([
    {'id': 'D-29z1210', 'date': D, 'text': 'Round 368 = C PASS (c-round-368.json: 11 rows passed incl. INTEGRITY/VALIDATOR/G368-AUTH at both viewports, browserVerified true, realVerified true); gate 368 published 29f4b4d on both remotes (gates/gate-round-368.json). PERF-9b-ii done (SYS-R365-STEM-CACHE-HARDENING done); closed C-R367-DEDUP-CANCELLED-WRITE (Medium), C-R367-STATUS-LINE-PREMATURE, C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN, A-R367-REVIEW-L-ABF, A-R365-REVIEW-L3..L6, C-R365-OBS-INTEGRITY. Baseline for round 369 = 29f4b4d (local HEAD, clean). Gate verify: 250 files / 3688 tests, lint 205 warnings (0 headroom on the <=205 row; A-R368 note confirmed by gates/round-368/verify.log).'},
    {'id': 'D-29z1211', 'date': D, 'text': 'Round-368 findings routed: A-R368-REVIEW-L1 ruled Low (deploy-race only, self-healing; distinct from the StrictMode-reachable C-R367 Medium; = gate-368 Low #2) -> deferred_low_polish; A-R368-REVIEW-L3, GATE368-L1-REMOVEFILE-SAME-NAME, GATE368-L3-QUEUED-BUFFER-RETENTION -> deferred_low_polish; A-R368-REVIEW-L2/L4 closed (fixed in round). Gate-368 and A-368 Architecture notes -> architecture_signals GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT (keep; signal only). ARCH-CHECKPOINT-PERF9-STEM-CACHE is now due to root (non-blocking). b-round-367/sketch-review.md annotated: its "stores in every ordering where HEAD stored" claim is falsified by A-R368-REVIEW-L1 (RETRO 369 input).'},
])
b['version'] = 332
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=2)
open(DONE, 'w').write('applied v332\n')
print('ok v332')
