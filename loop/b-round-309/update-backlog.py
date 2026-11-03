# B round 309 -> 310 planning: one-shot backlog update (D-29z824..D-29z827).
import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==268, b['version']
ADDED='2026-11-03 B round 309 -> 310 planning'
b['version']=269
b['updated']='2026-11-03 B round 309 -> 310 planning'
b['current_task']='current-task.md (round 310, D-29z824..D-29z827; PERF-4d: one R2 get per public GET in both worker copies (seek/304/200 h0g1), 416 no-store, throw/short out-of-range both handled, If-None-Match before 416 and If-Range re-read on the throw path; PR1-PR15 (PR2/PR4 contracts changed with gate reason), 13 mutants; doc 226; baseline b65febe, frozen 1182, 3 modified + 1 new granted)'
b['decisions_log_b'] += [
 {'id':'D-29z824','date':'2026-11-03','text':'Round 309 closure: C PASS (c-round-309.json 10 rows, browserVerified/realVerified true, 0 bugs, 4 INFO) and gate 309 published b65febe on both remotes -> PERF-4a done on evidence. INFO-C309-AUTH-COLD -> L38 clause; INFO-C309-416-PUBLIC-CACHE superseded by GATE309-L3; INFO-C309-RACE-PRERULED superseded (single read, round 310); INFO-C309-PREVIEW-NO-SAFE-NAME -> B-R309-PREVIEW-SAFE-NAME Low deferred (text/plain default, literal R2 keys). A-review Lows #4-#6 -> A-R309-REVIEW-TEST-GAPS Low deferred; #7 = GATE308-L1; #8 frozen.'},
 {'id':'D-29z825','date':'2026-11-03','text':'Gate-309 review Medium #1 (two R2 ops on every public 200/206 incl. each <audio> seek) = GATE309-M1, fixed now per the 2026-10-23 bug gate together with GATE309-L2 (head/get race) and GATE309-L3 (416 publicly cacheable): three tightly related findings in one helper block -> new stage PERF-4d, round 310. Option kept-head-for-Range rejected: <audio> requests are always Range requests, so it would leave the flagged path at two ops. Full single-get is dispatchable without live R2 because both possible out-of-range R2 behaviours (throw / short object) are handled and tested. PERF-5 follows (REGRESSION first when due).'},
 {'id':'D-29z826','date':'2026-11-03','text':'PERF-4d contract (task section 4): one get per public GET, range forwarded as offset/length|offset|suffix; If-None-Match via own etagMatches then body cancel -> 304; Content-Range from object.size with clamp; 416 no-store both modes; throw path: head, If-None-Match -> 304, If-Range mismatch -> full get 200, unsatisfiable -> 416, else rethrow (existing 500); If-Range re-read takes ETag/size/body from the second object; releaseBody swallows a rejected cancel; HEAD unchanged; no onlyIf. Rows PR1-PR15; PR2/PR4 contract change (reads 0 -> one get with body cancelled) listed with the reviewer reason; 13 mutants red on B sketch (69/69 restored); 15 rows red on HEAD; first sketch red on PR14/PR15 (tech-lead defects A/B). Consult ruling: performance-optimizer onlyIf etagDoesNotMatch vs tech-lead cancel -> keep cancel (R2 weak/list semantics undocumented, same op count), onlyIf on the post-deploy list; Content-Range from object.range not adopted (clamping undocumented).'},
 {'id':'D-29z827','date':'2026-11-03','text':'Requests and bookkeeping: ROOT-REQ-VERIFY-WORKER-TESTS now "before or with the next worker change" (gate-309 #4 + tech-lead), non-blocking, C WK-UNIT meanwhile; ROOT-REQ-VITEST-PERF-INCLUDE still open; three architect checkpoint requests unanswered, no new one. R2-WORKER-TWO-COPIES signal count 3; bounded dedupe follow-up waits for SABA-Q-WORKER-DEPLOYED. L38 warm-up clause gains "in a browser, not curl" (INFO-C309-AUTH-COLD); lessons.md 59 lines. New deferred Lows: B-R309-PREVIEW-SAFE-NAME, A-R309-REVIEW-TEST-GAPS, B-R309-REFETCH-INM-WINDOW. Post-deploy list (doc 226): Safari 206, which OOB branch real R2 takes, CDN not storing 416, TTFB p50/p95 + Class B metrics, onlyIf option. Regression due on/after 2026-11-05; RETRO 320.'},
]
rounds=b['rounds']
rounds.append({'round':309,'task':'current-task.md (archived tasks/round-309.md)','decision':'D-29z820..D-29z823','type':'PERF-4a: R2 worker public routes ETag/304 + single-range 206/416 + Expose-Headers, both copies','status':'c_pass_published (C round 309 PASS browserVerified/realVerified true; gate 309 published b65febe)','added':ADDED})
rounds.append({'round':310,'task':'current-task.md','decision':'D-29z824..D-29z827','type':'PERF-4d: one R2 get per public GET (GATE309-M1) + race closed (GATE309-L2) + 416 no-store (GATE309-L3); throw-path preconditions; PR1-PR15, 13 mutants, doc 226','status':'dispatched','note':'baseline b65febe clean; frozen b-round-309-r310-tree-sha256.txt (1182); claims b-round-309/claims-310.sh K1-K19; 3 modified (both workers helper block, r2-proxy.test.mjs) + doc 226 new','added':ADDED})
q=b['post_current_stage_queue']
sp=[x for x in q if isinstance(x,dict) and x.get('id')=='STUDIO-PERFORMANCE'][0]
sp['status']='in_progress (D-29z825): PERF-4a done (C round 309 PASS, gate b65febe); gate-309 Medium GATE309-M1 + L2/L3 -> PERF-4d round 310 (one R2 read per public GET); 4b awaiting_user, 4c backend handoff; next PERF-5 (REGRESSION first when due on/after 2026-11-05); RETRO at 320 | '+sp['status']
for st in sp['stages']:
    if st['id']=='PERF-4':
        st['status']='in_progress (D-29z825): 4a done (309, b65febe); 4d dispatched round 310; 4b awaiting_user; 4c handoff_backend | '+st['status']
    if st['id']=='PERF-4a':
        st['status']='done (D-29z824): C round 309 PASS browserVerified/realVerified true; gate 309 published b65febe | '+st['status']
idx=[i for i,st in enumerate(sp['stages']) if st['id']=='PERF-4c'][0]
sp['stages'].insert(idx+1,{'id':'PERF-4d','what':'gate-309 fix-up: one R2 get per public GET (seek, 304, 200), 416 no-store, both out-of-range R2 behaviours, throw-path If-None-Match/If-Range, If-Range re-read from the second object; closes GATE309-M1/L2/L3','status':'dispatched round 310 (D-29z825/D-29z826)'})
sp['consults_round_310']={'performance-optimizer':'cancel-for-304 acceptable (same Class B op, no egress); suggests onlyIf etagDoesNotMatch with etagMatches fallback; wants real-R2 TTFB/Class B run (not available in cloud -> post-deploy list); do before PERF-5; PERF-5 input: computePeaks main thread ArrangementContext.tsx:2492/:3909, setSourcePeaks :2493/:3910 + patchSourceState/settle -> >=2 context updates per stem; getChannelData views not transferable','tech-lead':'single-get sound, protected routes byte-identical; two Low defects in first sketch (throw path: failed If-Range must give 200, matching If-None-Match must give 304) -> fixed + PR14/PR15; releaseBody try/catch; 5 extra mutants; object.range suggestion not adopted; ROOT-REQ-VERIFY-WORKER-TESTS before/with this change; do before PERF-5','ruling':'D-29z826'}
of=b['open_findings']
def F(**k): k.setdefault('added',ADDED); of.append(k)
F(id='GATE309-M1',severity='medium',origin='gate reviewer (gates/round-309/review.md #1)',title='every public 200/206 makes two R2 ops (head then get), incl. each <audio> seek',status='scheduled round 310 PERF-4d (D-29z825)')
F(id='GATE309-L2',severity='low',origin='gate reviewer #2 (= A-review Medium #1 race)',title='head/get race can mix two object versions',status='scheduled round 310 PERF-4d (single read; D-29z825)')
F(id='GATE309-L3',severity='low',origin='gate reviewer #3 (= A-review Low #2, INFO-C309-416-PUBLIC-CACHE)',title='416 carries public, max-age=86400 and is storable by shared caches',status='scheduled round 310 PERF-4d (no-store; D-29z825)')
for i,t in [('INFO-C309-AUTH-COLD','cold dev server timeout with curl warm-up; replaced after browser warm-up -> L38 clause (D-29z827)'),('INFO-C309-416-PUBLIC-CACHE','Chromium cache not poisoned by 416; superseded by GATE309-L3'),('INFO-C309-RACE-PRERULED','superseded: round 310 single read (D-29z824)'),('INFO-C309-PREVIEW-NO-SAFE-NAME','-> B-R309-PREVIEW-SAFE-NAME deferred Low')]:
    F(id=i,severity='info',origin='C round 309',title=t,status='recorded (D-29z824)')
dl=b['deferred_low_polish']
for e in [
 {'id':'B-R309-PREVIEW-SAFE-NAME','severity':'low','origin':'A reviewer Low #9 / INFO-C309-PREVIEW-NO-SAFE-NAME (pre-existing)','source':'workers/r2-proxy.js + cloudflare/r2-worker.js handlePreview','title':'handlePreview has no isSafeFileName and the 404 body echoes the R2 key','repro':'GET /preview/<handle>/<name> for a missing key -> 404 "File Not Found: <handle>/Preview/<name>" (text/plain default; R2 keys literal, no traversal)','status':'deferred_low_polish (D-29z824)'},
 {'id':'A-R309-REVIEW-TEST-GAPS','severity':'low','origin':'A reviewer Lows #4-#6 round 309','source':'workers/r2-proxy.test.mjs','title':'candidate rows: 403/404 protected routes with If-None-Match, Bytes= case and whitespace, If-None-Match * without httpEtag, get null after head','repro':'see a-round-309.md code-reviewer findings #4-#6','status':'deferred_low_polish (D-29z824); PR4/PR10-PR15 cover part'},
 {'id':'B-R309-REFETCH-INM-WINDOW','severity':'low','origin':'tech-lead consult round 310 planning','source':'helper block (PERF-4d) If-Range re-read','title':'on the rare If-Range re-read, If-None-Match was compared with the first object, not the second','repro':'object replaced between the two gets of an If-Range mismatch with a matching If-None-Match','status':'deferred_low_polish (D-29z827); removed by PERF-4c versioned keys'},
]:
    e['added']=ADDED; dl.append(e)
for s in b['architecture_signals']:
    if s.get('id')=='R2-WORKER-TWO-COPIES':
        s['status']='signal x3 (D-29z827: A round 309 + gate-309 reviewer); bounded follow-up after SABA-Q-WORKER-DEPLOYED: delete the undeployed copy, point the test loop at one worker, combine with ROOT-REQ-VERIFY-WORKER-TESTS | '+s['status']
for r in b['root_requests_b']:
    if r.get('id')=='ROOT-REQ-VERIFY-WORKER-TESTS':
        r['status']='open (D-29z827): should land before or with the next worker change (gate-309 #4 + tech-lead round 310 consult); non-blocking, C WK-UNIT runs it | '+r['status']
for f in of:
    if f.get('id')=='WK-STORE-PREVIEW-LIVE':
        f['status']=f['status']+' | D-29z827: post-deploy list extended by PERF-4d (Safari 206, OOB branch on real R2, CDN must not store 416, TTFB p50/p95 + Class B metrics, onlyIf option)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(b['decisions_log_b']),len(dl))
