import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
if 'D-29z1441' in json.dumps(b['decisions_log_b']):
    print('already applied'); sys.exit(0)
BY='2026-11-08 B round 414 -> 415 planning'
C414='C round 414 PASS (c-round-414.json: 8 rows passed, browserVerified/realVerified true, 0 bugs; node --test 83/83; mutants summary equal to B (13 red, 1 equivalent)); gate 414 published 5be9294'
b['version']=390
b['updated']='2026-11-08 (B round 414 -> 415 planning)'
b['current_task']='Round 415: SYS-R388-FAKE-WEB-AUDIO-HELPER from B sketch b-round-414/sketch-415.patch.txt (current-task.md)'
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
st={s['id']:s for s in q['stages']}
st['SYS-R2-FAKE-FIDELITY']['status']=f'done (D-29z1441): {C414} | '+st['SYS-R2-FAKE-FIDELITY']['status']
if 'SYS-R388-FAKE-WEB-AUDIO-HELPER' in st:
    st['SYS-R388-FAKE-WEB-AUDIO-HELPER']['status']='dispatched (D-29z1442): round 415 | '+st['SYS-R388-FAKE-WEB-AUDIO-HELPER']['status']
q['status']='in_progress (D-29z1443): SYS-R2-FAKE-FIDELITY done (414, 5be9294); round 415 = SYS-R388-FAKE-WEB-AUDIO-HELPER (test-only); then RETRO 416, SYS-CLOCK-DETERMINISM, SYS-R369; REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10 | '+q['status']
for s in b['systemic_tasks']:
    if s.get('id')=='SYS-R2-FAKE-FIDELITY':
        s['status']=f'done (D-29z1441): {C414} | '+s['status']
    if s.get('id')=='SYS-R388-FAKE-WEB-AUDIO-HELPER':
        s['status']='dispatched (D-29z1442): round 415, b-round-414/sketch-415.patch.txt (new helpers/fake-web-audio.ts + 3 jsdom suites; apply-schedule-rollback excluded by ruling) | '+s['status']
        s['ruling_d29z1442']='apply-schedule-rollback.test.ts stays out: its Recording* classes implement the typed ScheduleAudioContext<string> interfaces with no globals, string buffers, disconnect counters and owner-driven throwOnStart/stopThrows; merging changes AR1-AR5 meaning (tech-lead APPROVE). createWorkspaceTestEnvironment (25 suites) untouched this round; convergence = signal SIG-R415-WORKSPACE-ENV-CONVERGENCE. Wallclock currentTime stays (SYS-CLOCK-DETERMINISM).'
        s['closes']=['A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB']
        s['may_close']=[]
    if s.get('id')=='SYS-CLOCK-DETERMINISM':
        if 'A-R388-REVIEW-L4-SF11-REAL-CLOCK' not in s['closes']:
            s['closes'].append('A-R388-REVIEW-L4-SF11-REAL-CLOCK')
        s['note_d29z1442']='A-R388-REVIEW-L4 (SF11 real-clock wait) handed over from SYS-R388: the round-415 helper keeps the wallclock currentTime; the helper fakeClock is the single place this task changes for SF/HT/EV'
dl=b['deferred_low_polish']; of=b['open_findings']
def pre(fid, text):
    hit=False
    for lst in (of, dl):
        for f in lst:
            if f.get('id')==fid:
                f['status']=text+' | '+str(f.get('status')); hit=True
    if not hit: print('missing', fid)
for fid in ['C-R311-01','A-R311-REVIEW-L4','GATE311-L1','A-R309-REVIEW-TEST-GAPS']:
    pre(fid, 'closed (D-29z1441): '+C414)
pre('A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB','fix dispatched round 415 (D-29z1442): install({stubSetInterval}) throws unless window.setInterval is the stub; MU-415-NO-SETINTERVAL-STUB red on SF11; close on C round 415 PASS')
pre('A-R388-REVIEW-L4-SF11-REAL-CLOCK','handed to SYS-CLOCK-DETERMINISM (D-29z1442); not closed by round 415')
ids={f.get('id') for f in of}
def add(e, defer=False):
    if e['id'] not in ids: of.append(e); ids.add(e['id'])
    if defer and not any(x.get('id')==e['id'] for x in dl): dl.append(dict(e))
A414='a-round-414.md Reviewer findings'
G414='gates/round-414/review.md'
add({"id":"A-R414-REVIEW-PR20-LABEL","severity":"low","origin":"A round 414 code-reviewer","evidence":A414,"title":"PR20 short case uses in-range bytes=0-9 (main re-read path); coverage correct, label loose","repro":"workers/r2-proxy.test.mjs PR20","status":"deferred_low_polish (D-29z1441): next worker-test round","added":BY},True)
add({"id":"A-R414-DOC-DELTA-NOT-REREVIEWED","severity":"info","origin":"A round 414","evidence":"a-round-414.md","title":"doc 266 post-review prose/diagram fix not re-sent to the reviewer","status":"closed (D-29z1441): gate 414 reviewer read doc 266 (gates/round-414/review.md), C row 7 PASS","added":BY})
add({"id":"GATE414-S1-FLAG-COMBINATION","severity":"low","origin":"gate 414 reviewer #1","evidence":G414,"title":"publicRequest fake: goneOnSecondRead and changedOnSecondRead together are undefined (order-dependent on reads.push); no row combines them","repro":"workers/r2-proxy.test.mjs ~l.145-157","status":"deferred_low_polish (D-29z1441); folded into SIG-R414-R2-FAKE-SCENARIO","added":BY},True)
add({"id":"GATE414-S2-PR19-PR20-LABELS","severity":"low","origin":"gate 414 reviewer #2","evidence":G414,"title":"PR19/PR20 asserts carry no label for the flag coupling (PR14-PR17 do)","repro":"workers/r2-proxy.test.mjs PR19/PR20","status":"deferred_low_polish (D-29z1441)","added":BY},True)
add({"id":"GATE414-I3-I5","severity":"info","origin":"gate 414 reviewer #3-#5","evidence":G414,"title":"ruling 6 platform trim honestly unproven; mutant table cites loop-external files; worker tests not in verify (= ROOT-REQ-VERIFY-WORKER-TESTS)","status":"recorded (D-29z1441)","added":BY})
for r in b['root_requests_b']:
    if r.get('id')=='ROOT-REQ-VERIFY-WORKER-TESTS':
        r['status']='open (D-29z1441): gate 414 still ran no node --test workers/r2-proxy.test.mjs (reviewer #5); non-blocking | '+r['status']
b['architecture_signals'].append({"id":"SIG-R414-R2-FAKE-SCENARIO","source":"a-round-414.md For B (code-reviewer) + gates/round-414/review.md Architecture note","signal":"signal 3: workers/r2-proxy.test.mjs request/publicRequest fakes edited in rounds 309, 311, 414; publicRequest now ~11 boolean options with shared reads/heads/opened state; two fakes build different R2 object shapes (root of TL-R414-M1)","proposal":"one bounded test-only task: shared R2 object factory + scenario descriptor ({versions, headState}); row assertions byte-identical, 83/83, mutant summary unchanged","status":"recorded (D-29z1441): signal only, not scheduled; candidate for the next worker round (with B-R414-RANGE-UNIT-CASE, B-R414-HEAD-RANGE-206, GATE414-S1/S2)","added":BY})
b['architecture_signals'].append({"id":"SIG-R415-WORKSPACE-ENV-CONVERGENCE","source":"tech-lead consult, B round 414 -> 415 planning","signal":"two jsdom Web Audio fakes after round 415: helpers/workspace-test-environment.ts (25 suites) and helpers/fake-web-audio.ts (3 suites); same return names","proposal":"later: createWorkspaceTestEnvironment delegates to createFakeWebAudio (one line), all 25 suites green with unchanged it() bodies","status":"recorded (D-29z1442): signal only, not scheduled","added":BY})
b['rounds'].append({"round":415,"task":"current-task.md","decision":"D-29z1441..D-29z1443","type":"SYS-R388-FAKE-WEB-AUDIO-HELPER (test-only shared fake Web Audio helper)","status":"dispatched","note":"baseline 5be9294 clean; frozen b-round-414/r415-frozen-sha256.txt (1311); grants b-round-414/grants-415.txt (5); sketch b-round-414/sketch-415.patch.txt sha 2d04d6eb73025527; claims b-round-414/claims-415.sh; mutants b-round-414/mutants/summary.txt (8 red, 3 green by design)"})
for r in b['rounds']:
    if isinstance(r,dict) and r.get('round')==414: r['status']='done: '+C414
dlog=b['decisions_log_b']
dlog.append({"id":"D-29z1441","date":"2026-11-08","by":BY,"decision":"From C round 414 PASS + gate 414 published 5be9294: SYS-R2-FAKE-FIDELITY done; closed C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS. New Lows A-R414-REVIEW-PR20-LABEL, GATE414-S1, GATE414-S2 -> deferred_low_polish; reviewer architecture notes -> SIG-R414-R2-FAKE-SCENARIO (signal only). B-R414-RANGE-UNIT-CASE, B-R414-HEAD-RANGE-206 stay deferred; ROOT-REQ-VERIFY-WORKER-TESTS stays open."})
dlog.append({"id":"D-29z1442","date":"2026-11-08","by":BY,"decision":"Round 415 = SYS-R388-FAKE-WEB-AUDIO-HELPER from b-round-414/sketch-415.patch.txt (sha 2d04d6eb73025527): new helpers/fake-web-audio.ts (createFakeWebAudio: per-instance state, install({metered,captureFrames,stubSetInterval,resizeObserver,clockLeadSeconds}) resets every field, runFrames, armStartFailure) + migrate schedule-failure-ui, master-hold-tick, decoded-buffer-eviction-ui; it() bodies byte-identical (49 rows); apply-schedule-rollback excluded (typed ScheduleAudioContext fake, AR1-AR5 meaning); createWorkspaceTestEnvironment untouched; wallclock clock stays (A-R388-REVIEW-L4 -> SYS-CLOCK-DETERMINISM). Closes A-R388-REVIEW-L3 on C PASS. New doc 267. tech-lead APPROVE WITH CHANGES (return names aligned; per-suite clock lead; captureFrames/metered default off; single reset) - all applied."})
dlog.append({"id":"D-29z1443","date":"2026-11-08","by":BY,"decision":"Order after 415: RETRO 416 (window 401-415; TLM-PERF15-FIREFOX deadline) -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 goes first at the first planning on/after 2026-11-10 (ahead of RETRO if both due)."})
json.dump(b, open(P,'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
