import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
BY='2026-11-08 B round 412 -> 413 planning'
if 'D-29z1434' in json.dumps(b['decisions_log_b']):
    print('already applied'); sys.exit(0)
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
st={s['id']:s for s in q['stages']}
st['PERF-15b-i']['status']='done (D-29z1436): C round 412 PASS (c-round-412.json: 14 rows passed, browserVerified/realVerified true, 0 bugs); gate 412 published 107eb2d | '+st['PERF-15b-i']['status']
st['PERF-15b-ii']['status']='split (D-29z1435): -> PERF-15b-ii-a (round 413: all code) + PERF-15b-ii-b (Firefox probe = TLM-PERF15-FIREFOX, record, after ROOT-REQ-PLAYWRIGHT-FIREFOX) | '+st['PERF-15b-ii']['status']
i=q['stages'].index(st['PERF-15b-ii'])
q['stages'][i+1:i+1]=[
 {"id":"PERF-15b-ii-a","what":"purchased adapter peaksUrl (AudioStem.peaksUrl, snapshot, same origin as the stem audioUrl, empty/unparsable dropped); WorkspaceCollection.fetchPeaks (= fetchAudio for purchased; ArrangementContext passes it); streamed 4 MiB decoded-bytes cap + abort listener in fetchPrecomputedPeaks; PS18 meta file field; docs 263/264 l.4 + new doc 265 Completed; closes PERF-15 on the client","status":"dispatched (D-29z1434): round 413, b-round-412/sketch-413.patch.txt v4 sha a7913dece594db71","added":BY},
 {"id":"PERF-15b-ii-b","what":"Firefox (non-Chromium) decode-length probe of the demo peaks files (TL-R411-L3); outcomes matched / fell-back-cleanly / crashed","status":"record_tech_lead (D-29z1435): TLM-PERF15-FIREFOX; waits for ROOT-REQ-PLAYWRIGHT-FIREFOX (Playwright Firefox not installed on the runner); does not block PERF-15 closure unless the outcome is crashed","added":BY},
]
st['PERF-15']['status']='in_progress (D-29z1435): 15a, 15b-i done; round 413 = PERF-15b-ii-a (final client stage); PERF-15 closes on C round 413 PASS; Firefox probe = TLM-PERF15-FIREFOX (record, root request); backend half = perf-15-backend-peaks-handoff.md | '+st['PERF-15']['status']
q['status']='in_progress (D-29z1436): PERF-15b-i done (412, 107eb2d); round 413 = PERF-15b-ii-a (closes PERF-15); then SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369; REGRESSION-2026-11-10 when due; RETRO 416 | '+q['status']
q['execution_order_d29z1436']="round 413 PERF-15b-ii-a -> SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. RETRO at 416."
of=b['open_findings']
byid={f.get('id'):f for f in of}
def pre(fid, text):
    f=byid.get(fid)
    if f is None: print('missing',fid); return
    f['status']=text+' | '+str(f.get('status'))
for fid in ['A-R411-REVIEW-M1','A-R411-REVIEW-L1','A-R411-REVIEW-L3','TL-R412-L-F']:
    pre(fid,'closed (D-29z1436): C round 412 PASS (c-round-412.json rows 6b MU-412-*, 6c regen 3/3, 8 docs), gate 412 published 107eb2d')
pre('A-R411-REVIEW-L4','closed (D-29z1436): doc fix verified by C round 412 row 8')
pre('INFO-A411-SKETCH-REVIEW-HEADER','closed (D-29z1436): resolved in round 412 (K13)')
for fid,row in [('TL-R411-L4','PP10, PP11, PP12'),('GATE410-L2','PP10, PP11 (= TL-R411-L4)'),('TL-R411-L9','PS18'),('A-R411-REVIEW-L5','PK2 (bearer header from the injected fetch reaches the peaks request)')]:
    pre(fid,f'fix dispatched round 413 (D-29z1434; {row}); close on C round 413 PASS')
pre('TL-R411-L3','tracked as TLM-PERF15-FIREFOX (D-29z1435): Playwright Firefox not installed (K19 0); ROOT-REQ-PLAYWRIGHT-FIREFOX')
pre('A-R411-REVIEW-L2','deferred_low_polish (D-29z1436): regeneration identity already proved (C round 412 row 6c); a hash pins bytes to one runner')
def add_f(e):
    if e['id'] not in byid: of.append(e); byid[e['id']]=e
EV='b-round-412/sketch-review.md'
add_f({"id":"TL-R413-L1","severity":"low","origin":"B pre-check (tech-lead review of sketch v1)","evidence":EV,"title":"streamed read: an abort while the body is stalled never settles when an injected fetch ignores init.signal","status":"fixed in sketch v4 (abort listener + pre-abort; PP12, PP12b, PP7e); close on C round 413 PASS","added":BY})
add_f({"id":"TL-R413-L2","severity":"low","origin":"B pre-check (tech-lead review of sketch v1)","evidence":EV,"title":"a bearer-adding fetchAudio could send its token to a cross-origin peaksUrl","status":"fixed in sketch v4 (same-origin rule; PK4); close on C round 413 PASS","added":BY})
add_f({"id":"TL-R413-L-A","severity":"low","origin":"B pre-check (tech-lead delta review v4)","evidence":EV,"title":"same-origin rule is fail-closed: signed-CDN audio with peaks on the API origin loses the optimisation (decode fallback)","status":"product contract (D-29z1434): written into docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md; candidate {audio, API} allowlist only on a backend need","added":BY})
add_f({"id":"TL-R413-L-B","severity":"low","origin":"B pre-check (tech-lead delta review v4)","evidence":EV,"title":"PP12/PP12b 1 s race timers outlive the test","status":"deferred_low_polish (D-29z1436)","added":BY})
add_f({"id":"TL-R413-L-C","severity":"low","origin":"B pre-check (tech-lead delta review v4)","evidence":EV,"title":"no note that a dropped peaksUrl means the decode-based waveform","status":"doc 265 sentence in round 413 (A docs grant); close on C round 413 PASS","added":BY})
add_f({"id":"TL-R413-I1","severity":"info","origin":"B (planning process)","evidence":EV,"title":"B's scratch commit -a captured a concurrent reviewer mutant into the scratch-only commit (patch itself sha-verified and correct)","status":"retro input RETRO 416: reviewers copy the scratch and never edit it; B commits scratch only with no reviewer running","added":BY})
add_f({"id":"INFO-B413-BROWSER-STREAM-HARNESS","severity":"info","origin":"B (planning, browser pre-check)","evidence":"b-round-412/browser/harness-notes.md","title":"no Playwright harness here delivers a body without a trustworthy content-length (route.continue to another port not served; fulfilled gzip not decoded); the streamed cap is unit-proved only","status":"info; browser rows 413 = demo regression (real/404/8bit)","added":BY})
dl=b['deferred_low_polish']
for fid in ['A-R411-REVIEW-L2','TL-R413-L-B']:
    f=byid[fid]
    if not any(x.get('id')==fid for x in dl):
        dl.append({"id":fid,"severity":"low","origin":f.get('origin'),"evidence":f.get('evidence'),"title":f.get('title'),"status":f.get('status'),"added":BY})
tlm=b['tech_lead_manual_checks']
if isinstance(tlm,list) and not any(x.get('id')=='TLM-PERF15-FIREFOX' for x in tlm):
    tlm.append({"id":"TLM-PERF15-FIREFOX","what":"Firefox: open /studio-lab with the demo MP3 held (b-round-412/probe/peaks-before-ready-413.mjs mode real, Firefox launcher); record matched / fell-back-cleanly / crashed for the Middle East and Hero peaks","reason":"TL-R411-L3; Playwright Firefox not installed on the cloud runner (ROOT-REQ-PLAYWRIGHT-FIREFOX, D-29z1435)","deadline":"RETRO 416 (L46)"})
rr=b['root_requests_b']
for e in [
 {"id":"ROOT-REQ-PLAYWRIGHT-FIREFOX","added":BY,"file":"b-round-412/root-request-playwright-firefox.md","note":"install the Playwright Firefox binary on the runner (npx playwright install firefox; no package change) so TLM-PERF15-FIREFOX can run; non-blocking"},
 {"id":"ROOT-REQ-BIOME-SCRIPTS","added":BY,"note":"A round 412 proposal: biome.json includes app/** only, so scripts/**/*.mjs (generate-demo-peaks.mjs, check-agents.mjs) are never linted; add them to includes or record that scripts/ stays outside lint (config outside loop grants); non-blocking"},
]:
    if not any(x.get('id')==e['id'] for x in rr): rr.append(e)
acr=b['architecture_checkpoint_requests']
if not any(x.get('id')=='ARCH-CHECKPOINT-PERF15-PEAKS' for x in acr):
    acr.append({"id":"ARCH-CHECKPOINT-PERF15-PEAKS","decision":"D-29z1436","requested_of":"root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)","file":"b-round-412/root-request-arch-checkpoint-perf15.md","question":"feature boundary PERF-15: precomputed-vs-decoded peaks arbitration lives inside ArrangementProvider (SIG-R410-PEAKS-ARBITRATION) and the peaks URL pairs live in 4 places (SIG-R411-PEAKS-URL-COPIES): keep vs extract a pure peaks-source unit; fold into the open ARCH-CHECKPOINT-PERF11C-III-BOUNDARY answer","status":"requested (D-29z1436), non-blocking","added":BY})
dec=[
 ("D-29z1434","Round 413 dispatched = PERF-15b-ii-a from b-round-412/sketch-413.patch.txt v4 (sha a7913dece594db71, 9 files): streamed 4 MiB decoded-bytes cap + abort listener/pre-abort in fetchPrecomputedPeaks (TL-R411-L4, GATE410-L2, TL-R413-L1); WorkspaceCollection.fetchPeaks passed by ArrangementContext (one hunk); AudioStem.peaksUrl; purchased adapter peaksUrl snapshot, same origin as audioUrl (TL-R413-L2), fetchPeaks = fetchAudio (A-R411-REVIEW-L5); PP7d rewritten (json override obsolete, stronger: asserts cancel); new PP7e, PP10, PP11, PP12, PP12b, PPC12, PK1-PK4, PS18 (TL-R411-L9). tech-lead: v1 APPROVE WITH LOWS (L1, L2), v4 delta APPROVE WITH LOWS (L-a contract, L-b deferred, L-c doc). Sketch evidence on /tmp/b413: tsc/Biome rc 0, covering 24 files 436/436, full 264 files 3922/3922, mutants 15/15 red, browser real/404/8bit at 1440 and 1280 on a :5174 sketch server equal round 412. Grants b-round-412/grants-413.txt (12); frozen 1301."),
 ("D-29z1435","PERF-15b-ii split: ii-a = round 413 (all code); ii-b = Firefox probe (TL-R411-L3) -> TLM-PERF15-FIREFOX record item, ROOT-REQ-PLAYWRIGHT-FIREFOX (Firefox not installed, K19 0). PERF-15 closes on C round 413 PASS: decode fallback is safe and browser-proved in Chromium (404/8-bit rows); a Firefox 'crashed' outcome would reopen it. Docs 263/264 l.4 and new doc 265 -> Completed (C round 413 PASS) (L28 final stage)."),
 ("D-29z1436","Bookkeeping from independently evidenced C round 412 PASS (c-round-412.json, browserVerified/realVerified true, 0 bugs; gate 412 published 107eb2d): PERF-15b-i done; A-R411-REVIEW-M1/L1/L3/L4, TL-R412-L-F, INFO-A411-SKETCH-REVIEW-HEADER closed; A-R411-REVIEW-L2 and TL-R413-L-B -> deferred_low_polish; ROOT-REQ-BIOME-SCRIPTS (A round 412 proposal) and ROOT-REQ-PLAYWRIGHT-FIREFOX filed; ARCH-CHECKPOINT-PERF15-PEAKS requested at the PERF-15 feature boundary (non-blocking, folded with ARCH-CHECKPOINT-PERF11C-III-BOUNDARY). B-R411-SKETCH-M1-MISSED and TL-R413-I1 stay RETRO 416 inputs. Regression not due (last 2026-11-07, next on/after 2026-11-10)."),
]
for did, text in dec:
    b['decisions_log_b'].append({"id":did,"date":"2026-11-08","by":BY,"decision":text})
for r in b['rounds']:
    if r.get('round')==412:
        r['status']='C PASS (c-round-412.json: 14 rows passed, browserVerified/realVerified true, 0 bugs); gate 412 published 107eb2d (D-29z1436)'
if not any(r.get('round')==413 for r in b['rounds']):
    b['rounds'].append({"round":413,"task":"current-task.md","decision":"D-29z1434..D-29z1436","type":"PERF-15b-ii-a (purchased peaksUrl same-origin, fetchPeaks pass-through, streamed cap; closes PERF-15)","status":"dispatched","note":"baseline 107eb2d clean; frozen b-round-412/r413-frozen-sha256.txt (1301); grants b-round-412/grants-413.txt (12); sketch b-round-412/sketch-413.patch.txt sha a7913dec; claims b-round-412/claims-413.sh"})
b['current_task']='Round 413: PERF-15b-ii-a from B reviewed sketch b-round-412/sketch-413.patch.txt (current-task.md)'
b['version']=b['version']+1
b['updated']=BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok version',b['version'])
