import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==343, b['version']
D='2026-11-07'; BY='B round 378 -> 379 planning'
of=b['open_findings']; ids={f.get('id'):f for f in of}
def add(f, deferred=False):
    assert f['id'] not in ids, f['id']
    f.setdefault('added', D+' '+BY); of.append(f); ids[f['id']]=f
    if deferred: b['deferred_low_polish'].append(dict(f))
q=[e for e in b['post_current_stage_queue'] if e['id']=='STUDIO-PERFORMANCE'][0]; st={s['id']:s for s in q['stages']}
st['PERF-11c-iii-c2a']['status']='done (D-29z1258): C round 378 PASS (c-round-378.json: 12 rows passed incl. LEAF-PROBE, LOOP-BROWSER, G378-AUTH, STUDIO-SMOKE-378 at both viewports; browserVerified true, realVerified true, 0 bugs; L57 fields present; fake-bearer 500 blocked = backend-only); gate 378 published 3ae2885 (round 378) | '+st['PERF-11c-iii-c2a']['status']
g=ids['GATE375-L1-UNUSED-WRAPPERS']
g['status']=g.get('status','')+' | D-29z1259: gate 378 reviewer finding 1 is the same item (ArrangementLoopBrace wrapper now unused in production; only index.ts and standalone gesture tests); not filed twice (L7)'
for dl in b['deferred_low_polish']:
    if dl.get('id')=='GATE375-L1-UNUSED-WRAPPERS':
        dl['status']=dl.get('status','')+' | D-29z1259: + ArrangementLoopBrace (gate 378 finding 1)'
add({'id':'GATE378-L2-LOOP-IMMUTABILITY-PIN','severity':'low','origin':'gate 378 reviewer finding 2','title':'the loop brace memo relies on arrangement.loop never being mutated in place; no test pins loop immutability','evidence':'gates/round-378/review.md finding 2; doc 244 records no in-place mutation today','repro':"grep -rnE 'loop\\.(start|end|enabled)\\s*=' app/ (0 hits at 3ae2885)",'status':'deferred_low_polish (D-29z1259): cheap guard; round 379 (c2b, same render-budget owner) adds RB-LEAF6 which pins markers identity and loop identity across non-loop commits (see current-task.md); closes when C round 379 PASS shows the pin rows'}, deferred=True)
add({'id':'INFO-GATE378-I3-ACTIONS-TRANSITIVE','severity':'info','origin':'gate 378 reviewer finding 3','title':'leaf action identities depend on transitive stability of provider callbacks (syncPlayback, commitArrangement, setStatus); RB-LEAF rows and mutants guard it empirically','evidence':'gates/round-378/review.md finding 3','status':'info (D-29z1259): guard sufficient per reviewer; no task'})
add({'id':'INFO-C378-PERF-MEDIAN','severity':'info','origin':'C round 378 notes','title':'two record-only fractional medians differ in the last digit vs the round-377 log, inside the sketch run min/max','evidence':'c-round-378.json notes; c-round-378/perf-interact.log','status':'info (D-29z1259): not a count row; no task'})
add({'id':'INFO-C378-LANE-RANGE-1280','severity':'info','origin':'C round 378 notes','title':'loop recipe: arrangement-lane-range count 0 at 1280x720 (1 at 1440) on both A and HEAD while the brace is created and all fields equal','evidence':'c-round-378.json notes; c-round-378/loop-A.json, loop-HEAD.json','status':'info (D-29z1259): equal on HEAD, not a regression; recipe observation; later marker/loop recipes read the range through the brace and loop-times readout'})
b['architecture_signals'].append({'id':'SIG-R378-LEAF-ACTIONS-CONVENTION','origin':'gate 378 reviewer architecture note','note':'fourth use...Actions + memo View leaf (Master, Library, Transport, LoopBrace); StudioWorkspace accumulates one hook call per leaf and production-unused thin wrappers. Reviewer verdict keep; proposal for after PERF-11c-iii-d/e: one bounded task choosing one leaf-actions convention (single useArrangementLeafActions with per-leaf Pick types, or per-leaf hooks) plus the thin-wrapper policy; acceptance RB-LEAF1..n render counts identical and index.ts exports decided explicitly. Sixth echo to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING; not scheduled','added':D+' '+BY})
for r in b['architecture_checkpoint_requests']:
    if r.get('id')=='ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING':
        r.setdefault('inputs',[]).append('D-29z1259: SIG-R378-LEAF-ACTIONS-CONVENTION (sixth echo, gate 378); still no root answer at round 378 planning; c2b (MarkerRow, round 379) continues pattern A as the request allows; d/e wait for the answer or RETRO 384 (deadline, L46); request restated in b-round-378.md')
for r in b['rounds']:
    if r.get('round')==378: r['status']='done (D-29z1258): C PASS (browserVerified true, 0 bugs); gate 378 published 3ae2885'
b['decisions_log_b'].extend([
 {'id':'D-29z1258','date':D,'by':BY,'decision':'Round 378 accepted from evidence: C PASS (c-round-378.json, 12 rows, browserVerified/realVerified true, 0 bugs, l57-check rc 0); gate 378 published 3ae2885 on both remotes (gates/gate-round-378.json). PERF-11c-iii-c2a done. Baseline for round 379 = 3ae2885 (context/head-sha.txt 79ed8a9 and gate head field are pre-gate, stale). tasks/round-378.md archived (byte copy, sha 77a2c03c...)'},
 {'id':'D-29z1259','date':D,'by':BY,'decision':'Gate 378 review (COMMIT OK, Lows/info only): finding 1 = GATE375-L1-UNUSED-WRAPPERS (not filed twice, L7); finding 2 -> GATE378-L2-LOOP-IMMUTABILITY-PIN (deferred Low; pin rows scheduled in round 379 RB-LEAF6 since the same test owner is touched); finding 3 -> INFO-GATE378-I3-ACTIONS-TRANSITIVE; architecture note -> SIG-R378-LEAF-ACTIONS-CONVENTION (sixth echo, not scheduled). C notes -> INFO-C378-PERF-MEDIAN, INFO-C378-LANE-RANGE-1280'},
])
adv=b.get('advisor_used_by_B')
b['advisor_used_by_B']='yes (round 378 -> 379 planning: advisor available; consulted after orientation and before declaring done) | '+(adv if isinstance(adv,str) else '')
b['version']=344; b['updated']=D+' '+BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok', b['version'])
