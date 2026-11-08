import json, sys, os
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-415/update-backlog-part1.done'
if os.path.exists(M): print('already applied (marker)'); sys.exit(1)
b=json.load(open(P))
if 'D-29z1444' in json.dumps(b['decisions_log_b']): print('already applied'); sys.exit(1)
BY='2026-11-08 B round 415 -> 416 planning'
C415='C round 415 PASS (c-round-415.json: 8 rows passed, browserVerified/realVerified true, 0 bugs; 4 files 54/54; it-bodies equal HEAD; mutants summary byte-equal to B (8 red, 3 green by design); meter play/stop + auth in real Chromium at 1440x900 and 1280x720); gate 415 published 344a59f'
b['version']=391
b['updated']='2026-11-08 (B round 415 -> 416 planning, part 1)'
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
for s in q['stages']:
    if s['id']=='SYS-R388-FAKE-WEB-AUDIO-HELPER': s['status']=f'done (D-29z1444): {C415} | '+s['status']
for s in b['systemic_tasks']:
    if s.get('id')=='SYS-R388-FAKE-WEB-AUDIO-HELPER': s['status']=f'done (D-29z1444): {C415} | '+s['status']
dl=b['deferred_low_polish']; of=b['open_findings']
def pre(fid, text):
    hit=False
    for lst in (of, dl):
        for f in lst:
            if f.get('id')==fid: f['status']=text+' | '+str(f.get('status')); hit=True
    if not hit: print('missing', fid)
pre('A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB','closed (D-29z1444): helper side - install({stubSetInterval:true}) throws unless window.setInterval is the stub (MU-415-NO-SETINTERVAL-STUB red on SF11); '+C415+'; call-site residual (flag dropped at SF11 leaves SF11 green) tracked as A-R415-REVIEW-L1-CALLSITE-FLAG')
ids={f.get('id') for f in of}
def add(e, defer=False):
    if e['id'] not in ids: of.append(e); ids.add(e['id'])
    if defer and not any(x.get('id')==e['id'] for x in dl): dl.append(dict(e))
G='gates/round-415/review.md'
add({"id":"A-R415-REVIEW-L1-CALLSITE-FLAG","severity":"low","origin":"A round 415 code-reviewer (= gate 415 reviewer #1; C round 415 note)","evidence":"a-round-415.md Reviewer findings; gates/round-415/review.md #1; c-round-415.md Notes for B; mutant MU-415-GUARD-AND-STUB-REMOVED","title":"deleting stubSetInterval:true from SF11's install({...}) leaves SF11 green (the Object.is guard only runs when the flag is passed)","repro":"remove the flag at schedule-failure-ui.test.tsx SF11 install call (~l.302-308 at 344a59f); SF11 stays green","status":"deferred_low_polish (D-29z1444): fix = one SF11 assertion that window.setInterval is the stub; candidate row for SYS-CLOCK-DETERMINISM, which owns SF11's clock (it() bodies may change there)","added":BY},True)
add({"id":"GATE415-S2-S4","severity":"info","origin":"gate 415 reviewer #2-#4","evidence":G,"title":"module-scope factory state reset only by install() (all suites call it in beforeEach); setInterval stub undone by unstubAllGlobals; unused returned members kept for SIG-R415-WORKSPACE-ENV-CONVERGENCE","status":"recorded (D-29z1444): no action; #4 folds into SIG-R415-WORKSPACE-ENV-CONVERGENCE","added":BY})
for s in b['architecture_signals']:
    if s.get('id')=='SIG-R415-WORKSPACE-ENV-CONVERGENCE':
        s['status']='recorded (D-29z1444): A reviewer and gate 415 reviewer both say keep; delegate only if the 25 suites need the same fix again | '+s['status']
for r in b['rounds']:
    if isinstance(r,dict) and r.get('round')==415: r['status']='done: '+C415
b['decisions_log_b'].append({"id":"D-29z1444","date":"2026-11-08","by":BY,"decision":"From C round 415 PASS + gate 415 published 344a59f: SYS-R388-FAKE-WEB-AUDIO-HELPER done; A-R388-REVIEW-L3 closed for the helper guard; the call-site residual (A reviewer = gate reviewer #1 = C note) -> new Low A-R415-REVIEW-L1-CALLSITE-FLAG (deferred, candidate row for SYS-CLOCK-DETERMINISM); gate reviewer #2-#4 recorded as info GATE415-S2-S4. Round 416 baseline = 344a59f."})
json.dump(b, open(P,'w'), ensure_ascii=False, indent=1)
open(M,'w').write('applied v391\n')
print('ok', b['version'])
