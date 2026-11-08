import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
BY='2026-11-08 B round 413 -> 414 planning'
if 'D-29z1437' in json.dumps(b['decisions_log_b']):
    print('already applied'); sys.exit(0)
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
st={s['id']:s for s in q['stages']}
C413='C round 413 PASS (c-round-413.json: 11 rows passed, browserVerified/realVerified true, 0 bugs; mutants 15/15 RED on the tree); gate 413 published dc536a6'
st['PERF-15b-ii-a']['status']=f'done (D-29z1437): {C413} | '+st['PERF-15b-ii-a']['status']
st['PERF-15b-ii']['status']='done on the client (D-29z1437): ii-a done; ii-b = TLM-PERF15-FIREFOX record item | '+st['PERF-15b-ii']['status']
st['PERF-15b']['status']='done (D-29z1437): 15b-i (412) + 15b-ii-a (413) | '+st['PERF-15b']['status']
st['PERF-15']['status']='done (D-29z1437): 15a (410), 15b-i (411-412), 15b-ii-a (413) C PASS with browser rows and published; backend half = perf-15-backend-peaks-handoff.md (backend stream); Firefox probe = TLM-PERF15-FIREFOX (reopens only on crashed) | '+st['PERF-15']['status']
if 'SYS-R2-FAKE-FIDELITY' in st:
    st['SYS-R2-FAKE-FIDELITY']['status']='dispatched (D-29z1438): round 414, b-round-413/sketch-414.patch.txt (test-only, workers/r2-proxy.test.mjs) | '+st['SYS-R2-FAKE-FIDELITY']['status']
for s in b['systemic_tasks']:
    if s.get('id')=='SYS-R2-FAKE-FIDELITY':
        s['status']='dispatched (D-29z1438): round 414 | '+s['status']
        s['ruling_d29z1439']='C-R311-01 first mutant (re-read else headers.delete(ETag)) and A-R309 #4 (If-None-Match * without httpEtag) are equivalent against R2: the R2 Workers API reference declares httpEtag as string (b-round-310 copy l.147) while range is optional (l.155); no fake object without httpEtag is added. Modes throw/short become two self-consistent R2 models (strict vs lenient; inference, not documentation).'
    if s.get('id')=='SYS-R388-FAKE-WEB-AUDIO-HELPER':
        s['status']='queued (D-29z1438): round 415 (separate from SYS-R2-FAKE-FIDELITY: different files and fake) | '+s['status']
q['status']='in_progress (D-29z1438): PERF-15 done (413, dc536a6); round 414 = SYS-R2-FAKE-FIDELITY (test-only); then SYS-R388 (415), RETRO 416, SYS-CLOCK-DETERMINISM, SYS-R369; REGRESSION-2026-11-10 at the first planning on/after 2026-11-10 | '+q['status']
q['execution_order_d29z1438']="round 414 SYS-R2-FAKE-FIDELITY -> 415 SYS-R388-FAKE-WEB-AUDIO-HELPER -> 416 RETRO -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10 (it precedes RETRO if both are due)."
of=b['open_findings']
byid={f.get('id'):f for f in of}
def pre(fid, text, where=of):
    for f in where:
        if f.get('id')==fid:
            f['status']=text+' | '+str(f.get('status')); return True
    print('missing',fid); return False
closed413='closed (D-29z1437): '+C413
for fid in ['TL-R411-L4','GATE410-L2','TL-R411-L9','A-R411-REVIEW-L5','TL-R413-L1','TL-R413-L2','TL-R413-L-C']:
    pre(fid, closed413)
pre('TL-R413-L-A','contract recorded (D-29z1437): handoff doc + doc 265; stays open as a backend-stream contract item')
def add_f(e):
    if e['id'] not in byid: of.append(e); byid[e['id']]=e
dl=b['deferred_low_polish']
def defer(e):
    add_f(e)
    if not any(x.get('id')==e['id'] for x in dl): dl.append(dict(e))
A413='a-round-413.md §4'
defer({"id":"A-R413-REVIEW-L1","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"readCappedText returns partial text after an abort; only the caller's signal.aborted check makes it safe","repro":"precomputed-peaks.ts readCappedText; covered by PP7d/PP7e + MU-413-NO-CALLER-ABORT-CHECK","status":"deferred_low_polish (D-29z1440)","added":BY})
defer({"id":"A-R413-REVIEW-L2","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"no cap+1-byte streamed row: a limit like > maxBytes + 1024 passes PP10/PP11","repro":"precomputed-peaks.test.ts PP10/PP11; candidate row + mutant","status":"deferred_low_polish (D-29z1440)","added":BY})
defer({"id":"A-R413-REVIEW-L3","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"PK2 Authorization assert is set by the test's own stub (cannot fail); the identity asserts are the real proof","repro":"collection.test.ts PK2","status":"deferred_low_polish (D-29z1440): drop or reword the assert in the next round owning collection.test.ts","added":BY})
defer({"id":"A-R413-REVIEW-L4","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"same-origin check covers the first URL only; a same-origin 302 to another host is followed (redirect follow); audio path has the same exposure","repro":"collection.ts sameOrigin + fetchPrecomputedPeaks default redirect","status":"deferred_low_polish (D-29z1440): candidate redirect 'error' on the peaks request or handoff note; backend contract keeps peaks same-origin","added":BY})
defer({"id":"A-R413-REVIEW-L5","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"opaque origins (data:, file:, custom schemes) all give 'null', so 'null' === 'null' passes the same-origin check (no token leak)","repro":"collection.ts sameOrigin","status":"deferred_low_polish (D-29z1440): one-condition fix (reject origin 'null') in the next round owning collection.ts","added":BY})
add_f({"id":"A-R413-REVIEW-L6","severity":"low","origin":"A round 413 code-reviewer","evidence":A413,"title":"doc 265 l.4 says Completed before the gate","status":"closed (D-29z1440): ruled by L28 (final status written by A) and gate 413 published","added":BY})
G413='gates/round-413/review.md'
defer({"id":"GATE413-L1","severity":"low","origin":"gate 413 reviewer #1","evidence":G413,"title":"readCappedText holds chunks then copies (peak memory ~2x the 4 MiB cap); JSON.parse on the main thread","repro":"precomputed-peaks.ts readCappedText","status":"deferred_low_polish (D-29z1440)","added":BY})
pre('TL-R413-L-B','also gate 413 reviewer #2 (GATE413-L2 alias, D-29z1440)')
add_f({"id":"GATE413-L3","severity":"low","origin":"gate 413 reviewer #3","evidence":G413,"title":"relative peaksUrl beside an absolute audioUrl is always dropped (base.invalid)","status":"closed (D-29z1440): = TL-R413-L-A contract (fail-closed, intended)","added":BY})
add_f({"id":"GATE413-I4","severity":"info","origin":"gate 413 reviewer #4","evidence":G413,"title":"stem.peaksUrl validated once at creation; an expiring signed URL can go stale in a long session","status":"recorded (D-29z1440): revisit when SRW-21 wires real data (peaks fetched at load only)","added":BY})
add_f({"id":"INFO-A413-PS18-DUPLICATE-ID","severity":"info","origin":"A round 413","evidence":"a-round-413.md §6","title":"row id PS18 exists in studio-lab-demo.test.ts (new) and library-preview-stream.test.tsx l.687 (old); mutant logs naming only PS18 are ambiguous across files","status":"recorded (D-29z1440): rename in the next round that owns either file","added":BY})
add_f({"id":"B-R414-RANGE-UNIT-CASE","severity":"low","origin":"B (SYS-R2 planning, RFC 9110 check)","evidence":"b-round-310/rfc9110-2026-11-03.txt l.6326, l.6476","title":"worker parseRangeSpec treats 'Bytes=0-9' as no range (full 200); RFC 9110 14.1 says range unit names are case-insensitive (ignoring Range is allowed by 14.2, so not a correctness bug)","repro":"curl -H 'Range: Bytes=0-9' preview -> 200 full; workers/r2-proxy.js parseRangeSpec regex","status":"deferred_low_polish (D-29z1439): worker change for a later worker round; not pinned by a test in round 414","added":BY})
add_f({"id":"B-R414-HEAD-RANGE-206","severity":"low","origin":"B (SYS-R2 planning, RFC 9110 check)","evidence":"b-round-310/rfc9110-2026-11-03.txt l.6481-6484; workers/r2-proxy.test.mjs PR6","title":"HEAD with Range answers 206 with a partial Content-Length; RFC 9110 14.2: a server MUST ignore Range for methods other than GET (pre-existing round-309 contract, pinned by PR6)","repro":"HEAD preview with Range: bytes=0-9 -> 206 (PR6, browser probe step head)","status":"deferred_low_polish (D-29z1439): pre-existing; a worker change + PR6 rewrite in a later worker round (purchased routes unaffected)","added":BY})
for e in [x for x in of if x['id'] in ('B-R414-RANGE-UNIT-CASE','B-R414-HEAD-RANGE-206')]:
    if not any(y.get('id')==e['id'] for y in dl): dl.append(dict(e))
for fid in ['C-R311-01','A-R311-REVIEW-L4','GATE311-L1','A-R309-REVIEW-TEST-GAPS']:
    pre(fid,'fix dispatched round 414 SYS-R2-FAKE-FIDELITY (D-29z1438/D-29z1439); close on C round 414 PASS', dl)
RV='b-round-413/sketch-review.md'
add_f({"id":"TL-R414-M1","severity":"medium","origin":"B pre-check (tech-lead review of sketch v1)","evidence":RV,"title":"protected request fake had no httpEtag, so PR21 could not catch copied public 304 logic","status":"closed (D-29z1439): fixed in sketch v2 before dispatch (fake carries httpEtag; MU-414-PROTECTED-ETAG-304 red only on PR21)","added":BY})
add_f({"id":"TL-R414-L1","severity":"low","origin":"B pre-check (tech-lead delta review v2)","evidence":RV,"title":"MU-414-PROTECTED-INM-BEFORE-SCOPE never exercised the denied 403 assert","status":"closed (D-29z1439): mutant replaced by the out-of-scope-only variant before dispatch; red on PR21","added":BY})
add_f({"id":"TL-R414-L2","severity":"low","origin":"B pre-check (tech-lead delta review v2)","evidence":RV,"title":"MU-414-RANGE-NO-TRIM equivalence rests on a platform guarantee (fetch Headers trims), not on the tests","status":"closed (D-29z1439): stated in ruling 6 and doc 266","added":BY})
add_f({"id":"TL-R414-L-UNSAFE-START","severity":"info","origin":"B pre-check (tech-lead review of sketch v1)","evidence":RV,"title":"r2RangeOf passes an unsafe start unchecked; GATE311-L1 closes by a fake-model change, not by evidence about R2","status":"pointer (D-29z1439): round-311 section 4.1 contract, = A-R311-REVIEW-L1; no new task","added":BY})
sig=b['architecture_signals']
if not any(s.get('id')=='SIG-GATE413-PEAKS-PREFETCH-HELPER' for s in sig):
    sig.append({"id":"SIG-GATE413-PEAKS-PREFETCH-HELPER","source":"gates/round-413/review.md Architecture note","signal":"signal 4: peaks prefetch inside the collection-load effect of ArrangementContext.tsx changed in three rounds (263-265)","proposal":"keep now; if a further round touches it, one bounded task extracting startPrecomputedPeaksPrefetch(collection, controller, onPeaks) into lib/arrangement with PPC1-PPC12 unchanged","status":"recorded (D-29z1440): attached to ARCH-CHECKPOINT-PERF15-PEAKS; not scheduled","added":BY})
    sig.append({"id":"SIG-A413-CAPPED-BODY","source":"a-round-413.md §4 Architecture note","signal":"readCappedText is single-caller","proposal":"keep; extract lib/arrangement/capped-body.ts only if the audio body (source-fetch.ts) ever needs a cap","status":"recorded (D-29z1440): not scheduled","added":BY})
tlm=b['tech_lead_manual_checks']
for t in tlm:
    if t.get('id')=='TLM-PERF15-FIREFOX': t['status']='record (D-29z1437): C round 413 row 9 BLOCKED (Firefox not installed); deadline RETRO 416 (L46)'
for r in b['root_requests_b']:
    if r.get('id')=='ROOT-REQ-VERIFY-WORKER-TESTS':
        r['status']='open (D-29z1438): re-raised with round 414 (worker tests change; verify script still has 0 r2-proxy hits, claim K10b); non-blocking, C WK-UNIT runs it | '+r['status']
dec=[
 ("D-29z1437","Bookkeeping from independently evidenced C round 413 PASS (c-round-413.json: 11 rows passed, browserVerified/realVerified true, 0 bugs; blocked only the backend fake-bearer row and the Firefox row) and gate 413 published dc536a6 to both remotes: PERF-15b-ii-a done, PERF-15 done on the client (backend half = handoff doc; TLM-PERF15-FIREFOX record, deadline RETRO 416). TL-R411-L4, GATE410-L2, TL-R411-L9, A-R411-REVIEW-L5, TL-R413-L1, TL-R413-L2, TL-R413-L-C closed. Archive tasks/round-413.md = byte copy of the round-413 task."),
 ("D-29z1438","Round 414 = SYS-R2-FAKE-FIDELITY alone (test-only, workers/r2-proxy.test.mjs + new doc 266). SYS-R388-FAKE-WEB-AUDIO-HELPER is split off to round 415: the '+' in execution_order_d29z1436 was adjacency; SIG-R388 says it is not joined to SYS-R2 (different files, different fake); one round = one stage. RETRO stays at 416; REGRESSION-2026-11-10 precedes anything at the first planning on/after 2026-11-10. ROOT-REQ-VERIFY-WORKER-TESTS re-raised (verify still omits node --test workers/r2-proxy.test.mjs)."),
 ("D-29z1439","SYS-R2 rulings: (1) C-R311-01 mutant 1 (re-read else headers.delete('ETag')) and A-R309 #4 (If-None-Match * without httpEtag) are equivalent against R2 (R2 API reference: httpEtag `string`, not optional, l.147 vs range optional l.155): closed by ruling, no non-R2 fake object. (2) The fake's TypeError for a non-safe range value fires only in throw mode, so throw = strict R2 model and short = lenient R2 model (inference, labelled). (3) New fake flags headSeesNewVersion and goneOnSecondRead; new rows PR19-PR22; PR9, PR14, PR15, PR16 far, PR17 strengthened. (4) 'Bytes=' unit case is not pinned by a test (RFC 9110 14.1 case-insensitive, 14.2 MAY ignore): B-R414-RANGE-UNIT-CASE Low. (5) PR6 HEAD+Range 206 conflicts with RFC 9110 14.2 MUST ignore Range for non-GET: B-R414-HEAD-RANGE-206 Low, pre-existing, not changed in a test-only round. (6) MU-414-RANGE-NO-TRIM is equivalent (fetch Headers trims values). (7) The protected request fake gains etag/httpEtag (tech-lead v1 Medium TL-R414-M1) and a goneOnHead flag. Sketch v2 evidence on /tmp/b414: node --test 83/83; 14 mutants, 13 red on the sketch with the expected row, 11 of them green on the HEAD tests (new coverage), NO-TRIM equivalent (platform guarantee), pristine 4x rc 0, scratch status 0; tech-lead v2 APPROVE WITH LOWS (L1 mutant fixed before dispatch, L2 wording)."),
 ("D-29z1440","Rulings on round-413 Lows: A-R413-REVIEW-L1..L5 and GATE413-L1 -> deferred_low_polish (L4 redirect and L5 opaque-origin hardening noted for the next collection.ts/precomputed-peaks owner); A-R413-REVIEW-L6 closed by L28; GATE413-L2 = TL-R413-L-B (already deferred); GATE413-L3 = TL-R413-L-A contract; GATE413-I4 and INFO-A413-PS18-DUPLICATE-ID recorded. Architecture notes recorded as signals only (SIG-GATE413-PEAKS-PREFETCH-HELPER attached to ARCH-CHECKPOINT-PERF15-PEAKS; SIG-A413-CAPPED-BODY), not scheduled."),
]
for did,text in dec:
    b['decisions_log_b'].append({"id":did,"date":"2026-11-08","by":BY,"decision":text})
for r in b['rounds']:
    if r.get('round')==413:
        r['status']='C PASS (c-round-413.json: 11 rows passed, browserVerified/realVerified true, 0 bugs); gate 413 published dc536a6 (D-29z1437)'
if not any(r.get('round')==414 for r in b['rounds']):
    b['rounds'].append({"round":414,"task":"current-task.md","decision":"D-29z1437..D-29z1440","type":"SYS-R2-FAKE-FIDELITY (test-only R2 worker fake fidelity)","status":"dispatched","note":"baseline dc536a6 clean; frozen b-round-413/r414-frozen-sha256.txt (1312); grants b-round-413/grants-414.txt (2); sketch b-round-413/sketch-414.patch.txt sha 5279fce53efec300 (v2; v1 3a155bc6 rejected by tech-lead); claims b-round-413/claims-414.sh"})
b['current_task']='Round 414: SYS-R2-FAKE-FIDELITY from B reviewed sketch b-round-413/sketch-414.patch.txt (current-task.md)'
b['version']=b['version']+1
b['updated']=BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok version',b['version'])
