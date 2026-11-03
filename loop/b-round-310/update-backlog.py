# B round 310 -> 311 planning: one-shot backlog update (D-29z828..D-29z831).
import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==269, b['version']
ADDED='2026-11-03 B round 310 -> 311 planning'
b['version']=270
b['updated']=ADDED
b['current_task']='current-task.md (round 311, D-29z828..D-29z831; PERF-4e: gate-310 fix-up in the worker helper block, both copies byte-identical: a Range length/suffix that is not a safe integer goes to R2 as {offset}/{offset:0} (GATE310-M1 residual, A-R310-REVIEW-L1); If-None-Match re-checked after both If-Range re-reads -> 304 (GATE310-L3 = B-R309-REFETCH-INM-WINDOW); throw-path re-read ETag pinned (C-R310-01 = A-R310-REVIEW-L2); PR16-PR18 + PR13/PR15 asserts (A-R310-REVIEW-L3 part), 75 tests, 21 mutants; doc 227; baseline 8946431, frozen 1183, 3 modified + 1 new granted)'
b['decisions_log_b'] += [
 {'id':'D-29z828','date':'2026-11-03','text':'Round 310 closure: C PASS (c-round-310.json 12 rows passed, browserVerified/realVerified true, 1 Low C-R310-01, 0 Medium+) and gate 310 published 8946431 on both remotes -> PERF-4d done on evidence; GATE309-M1/L2/L3 closed. INFO-C310-WARM-STATUS-NULL recorded (environment, no screenshot; not an observed UI state); INFO-C310-OVERSIZED-RANGE and A-R310-REVIEW-L1 -> folded into GATE310-M1; INFO-C310-HEAD-STEP10 recorded (curl on probe server; unit row for HEAD+INM added in round 311 PR18). WK-STORE-PREVIEW-LIVE stays notRunnableHere (post-deploy).'},
 {'id':'D-29z829','date':'2026-11-03','text':'Ruling on gate-310 review #1 (Medium, "a suffix larger than the file could now 500"): the stated premise ("R2 docs only promise length overflow") is contradicted by the primary source: R2 Workers API reference (fetched 2026-11-03, kept as b-round-310/r2-workers-api-reference-2026-11-03.md.txt l.231/l.233) documents BOTH length and suffix overflow as "fewer bytes than this number may be returned". The residual is real: a syntactically valid header with a non-safe-integer end/suffix (e.g. bytes=0-<400 nines> -> length Infinity) is sent to R2 unclamped; at b65febe it was clamped via head and served 206. With an R2 fake that rejects non-safe integers (an inference, not documented R2 behaviour), real Chromium on HEAD 8946431 gets 500 h1g1, the sketch gets 206 h0g1 (b-round-310/probe/summary.txt). Severity stays Medium (possible 500 on a valid request that HEAD-before served), fixed now under the 2026-10-23 bug gate as PERF-4e with GATE310-L3 (=B-R309-REFETCH-INM-WINDOW) and C-R310-01 (=A-R310-REVIEW-L2): three related findings in one helper block. Reviewer alternative (retry in catch with head-clamped range) rejected: documented overflow needs no retry, it adds a third R2 op and a head/get race; tech-lead consult agreed.'},
 {'id':'D-29z830','date':'2026-11-03','text':'PERF-4e contract (task section 4): r2RangeOf sends {suffix} / {offset,length} only when the value is a safe integer, else {offset:0} / {offset:start}; start values are unchanged (a far start reaches the existing 416 in both R2 modes); after the If-Range re-read on the normal path and on the throw path the worker sets ETag from the second object, then If-None-Match match -> releaseBody + 304 with no Content-Type/Content-Length/Content-Range/Accept-Ranges (Content-Type and Accept-Ranges move after the re-read block); HEAD, protected routes, everything above const PUBLIC_EXPOSE_HEADERS unchanged. Tests: fake rejects non-safe range values with TypeError; PR16 (unsafe length/suffix -> open offset 206, far start 416), PR17 (re-read ETag from second object + 304 on both paths, both modes), PR18 (HEAD + If-None-Match -> 304, one head); PR13 + heads 0 for un-ranged throw; PR15 + ETag + body cancelled on 416. No assert removed. 21 mutants (12 carried + 9 new), all red on the sketch. Tech-lead consult: Medium "HEAD+Range should be ignored (RFC 9110 14.2)" ruled pre-existing and out of scope (PR6 already pins HEAD+Range 206; RFC 9110 9.3.2 asks HEAD to carry GET headers) -> the 416 half of PR18 dropped, B-R310-HEAD-RANGE-RFC deferred Low; Low PR16 title/far-read assert -> fixed in the sketch; Low fake strictness is inference -> wording in the task; Low Number() precision on >2^53 digits -> B-R310-RANGE-PRECISION deferred Low.'},
 {'id':'D-29z831','date':'2026-11-03','text':'Requests and bookkeeping: ROOT-REQ-VERIFY-WORKER-TESTS re-raised "with this worker change" (gate-310 review #2 confirms the file is not in verify.log; third worker round in a row) - non-blocking, C WK-UNIT meanwhile. R2-WORKER-TWO-COPIES signal x4 (gate-310 architecture note); dedupe still waits for SABA-Q-WORKER-DEPLOYED; no new checkpoint request (three open, non-blocking). gate-310 #4 (304 opens the body then cancels) and #5 (bytes=-0 full read for a 416) -> post-deploy onlyIf follow-up / info. Remaining A-R310-REVIEW-L3 items (PR14 opened.every trivially true in throw mode) stay under A-R309-REVIEW-TEST-GAPS. Regression due on/after 2026-11-05 (not due today 2026-11-03). Next after PERF-4e: REGRESSION if due, else PERF-5 with performance-optimizer + tech-lead consults and an L37 premise re-measure.'},
]
rounds=b['rounds']
for r in rounds:
    if r.get('round')==310:
        r['status']='c_pass_published (C round 310 PASS browserVerified/realVerified true, 1 Low C-R310-01; gate 310 published 8946431)'
rounds.append({'round':311,'task':'current-task.md','decision':'D-29z828..D-29z831','type':'PERF-4e: gate-310 fix-up: unsafe-integer Range values (GATE310-M1), If-None-Match after If-Range re-read (GATE310-L3), throw-path re-read ETag test (C-R310-01); PR16-PR18, 21 mutants, doc 227','status':'dispatched','note':'baseline 8946431 clean; frozen b-round-310-r311-tree-sha256.txt (1183); claims b-round-310/claims-311.sh K1-K22; 3 modified + 1 new granted','added':ADDED})
q=b['post_current_stage_queue']
sp=[x for x in q if isinstance(x,dict) and x.get('id')=='STUDIO-PERFORMANCE'][0]
sp['status']='in_progress (D-29z829): PERF-4d done (C round 310 PASS, gate 8946431); gate-310 Medium GATE310-M1 + GATE310-L3 + C-R310-01 -> PERF-4e round 311; 4b awaiting_user, 4c backend handoff; next REGRESSION when due (on/after 2026-11-05), else PERF-5; RETRO at 320 | '+sp['status']
for st in sp['stages']:
    if st['id']=='PERF-4':
        st['status']='in_progress (D-29z829): 4a done (309), 4d done (310, 8946431); 4e dispatched round 311; 4b awaiting_user; 4c handoff_backend | '+st['status']
    if st['id']=='PERF-4d':
        st['status']='done (D-29z828): C round 310 PASS browserVerified/realVerified true; gate 310 published 8946431 | '+st['status']
idx=[i for i,st in enumerate(sp['stages']) if st['id']=='PERF-4d'][0]
sp['stages'].insert(idx+1,{'id':'PERF-4e','what':'gate-310 fix-up: Range length/suffix beyond a safe integer sent as an open offset (no 500 on a valid header), If-None-Match re-checked after the If-Range re-read on both paths, throw-path re-read ETag pinned; closes GATE310-M1, GATE310-L3 (=B-R309-REFETCH-INM-WINDOW), C-R310-01 (=A-R310-REVIEW-L2), A-R310-REVIEW-L1','status':'dispatched round 311 (D-29z829/D-29z830)'})
sp['consults_round_311']={'tech-lead':'no blocking defect; RFC order and 304 headers correct; safe-integer requests unchanged; {offset:0} for unsafe suffix correct; reviewer retry not needed. Medium HEAD+Range (pre-existing, RFC 9110 14.2) -> ruled out of scope, deferred B-R310-HEAD-RANGE-RFC; Lows: PR16 title/far reads (fixed), fake strictness is inference (worded), Number() precision (deferred B-R310-RANGE-PRECISION)'}
of=b['open_findings']
def F(**k): k.setdefault('added',ADDED); of.append(k)
for f in of:
    if f.get('id') in ('GATE309-M1','GATE309-L2','GATE309-L3'):
        f['status']='closed (D-29z828): fixed by PERF-4d, C round 310 PASS, gate 310 published 8946431 | '+f['status']
    if f.get('id')=='WK-STORE-PREVIEW-LIVE':
        f['status']=f['status']+' | D-29z831: post-deploy list adds: bytes=0-<huge> and bytes=-<huge> give 206 on real R2 (open offset); If-Range re-read + If-None-Match 304'
F(id='GATE310-M1',severity='medium',origin='gate reviewer (gates/round-310/review.md #1) + A-R310-REVIEW-L1 + INFO-C310-OVERSIZED-RANGE',title='client Range values reach R2 unclamped; a non-safe-integer length/suffix could 500 where b65febe served 206 (suffix/length overflow itself is documented by R2)',status='scheduled round 311 PERF-4e (D-29z829)')
F(id='GATE310-L3',severity='low',origin='gate reviewer #3 (= B-R309-REFETCH-INM-WINDOW)',title='If-Range re-read compares If-None-Match with the first object',status='scheduled round 311 PERF-4e (D-29z829)')
F(id='C-R310-01',severity='low',origin='C round 310 (B spec gap; = A-R310-REVIEW-L2)',title='throw-path If-Range re-read ETag not pinned by any row (mutant survived 69/69)',status='scheduled round 311 PERF-4e PR17 (D-29z829)')
F(id='GATE310-S4',severity='low',origin='gate reviewer #4',title='a 304 opens the body then cancels it',status='recorded (D-29z831): same R2 op count; onlyIf on the post-deploy list')
F(id='GATE310-S5',severity='info',origin='gate reviewer #5',title='bytes=-0 reads the whole object to answer 416',status='recorded (D-29z831): rare, harmless')
for i,t in [('INFO-C310-WARM-STATUS-NULL','untimed warm-up saw null #arrangement-status for 300 s on a cold server; only warm.log, no screenshot; not an observed UI state; timed G310-AUTH ready at both viewports'),('INFO-C310-OVERSIZED-RANGE','-> GATE310-M1'),('INFO-C310-HEAD-STEP10','HEAD + unsatisfiable -> 416 no-store and HEAD + If-None-Match -> 304 verified by curl on the probe server; HEAD+INM unit row PR18 in round 311')]:
    F(id=i,severity='info',origin='C round 310',title=t,status='recorded (D-29z828)')
dl=b['deferred_low_polish']
for e in dl:
    if e.get('id')=='B-R309-REFETCH-INM-WINDOW':
        e['status']='scheduled round 311 PERF-4e as GATE310-L3 (D-29z829) | '+e['status']
    if e.get('id')=='A-R309-REVIEW-TEST-GAPS':
        e['status']=e['status']+' | D-29z831: round 311 adds PR13 heads 0, PR15 ETag+cancel, PR18 HEAD+INM; PR14 opened.every in throw mode still trivially true (open)'
for e in [
 {'id':'B-R310-HEAD-RANGE-RFC','severity':'low','origin':'tech-lead consult round 311 planning (pre-existing)','source':'workers/r2-proxy.js + cloudflare/r2-worker.js servePublicObject (allowRange && HEAD)','title':'HEAD + Range answers 206/416; RFC 9110 14.2 says a server MUST ignore Range on non-GET methods, while 9.3.2 asks HEAD to carry the GET headers','repro':'HEAD /preview/mall/a.wav with Range: bytes=0-9 -> 206 (PR6 pins it)','status':'deferred_low_polish (D-29z830); a change needs PR6 rewritten with a reason'},
 {'id':'B-R310-RANGE-PRECISION','severity':'low','origin':'tech-lead consult round 311 planning (pre-existing)','source':'parseRangeSpec Number() on >2^53 digit strings','title':'digit strings above 2^53 are rounded, so an invalid range (last < first) can pass the order check and get 416 instead of being ignored','repro':'Range: bytes=9007199254740993-9007199254740992 -> 416 (RFC 9110 14.2 allows ignore or reject)','status':'deferred_low_polish (D-29z830)'},
]:
    e['added']=ADDED; dl.append(e)
for s in b['architecture_signals']:
    if s.get('id')=='R2-WORKER-TWO-COPIES':
        s['status']='signal x4 (D-29z831: gate-310 reviewer, rounds 309/310/311 edit both copies); dedupe waits for SABA-Q-WORKER-DEPLOYED | '+s['status']
for r in b['root_requests_b']:
    if r.get('id')=='ROOT-REQ-VERIFY-WORKER-TESTS':
        r['status']='open (D-29z831): re-raised "with this worker change" (gate-310 #2: r2-proxy.test.mjs absent from verify.log); non-blocking, C WK-UNIT runs it | '+r['status']
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(b['decisions_log_b']),len(dl))
