import json
P='backlog.json'; d=json.load(open(P))
T='2026-10-28 B round 214 -> 215 planning'
r=[x for x in d['rounds'] if x.get('round')==214][0]
r['status']='c_pass_published'
r['result']='C round 214 PASS (9 rows: SCOPE, PERF-RUN, PROBE, REDPROOF, HYGIENE, DOC, AN-REVIEW, G214-3, STUDIO-SMOKE; browserVerified=true, realVerified=true; 0 bugs); gate 214 published eb9e76e (gates/gate-round-214.json). Doc 168 l.4 still conditional at eb9e76e (gate-214 review item 6) -> GATE214-DOC168-STATUS'
sp=[e for e in d['post_current_stage_queue'] if e['id']=='STUDIO-PERFORMANCE'][0]
for s in sp['stages']:
    if s['id']=='PERF-1b-i': s['status']='done (round 214 C PASS browserVerified=true realVerified=true, published eb9e76e; D-29z209; deviations ruled D-29z210)'
    if s['id']=='PERF-1b-ii': s['status']='not_started (round 216, after RETRO 215; regression takes precedence if round-216 planning is on/after 2026-10-30)'
    if s['id']=='PERF-1b': s['status']=str(s.get('status'))+' | PERF-1b-i done round 214 (eb9e76e); PERF-1b-ii round 216'
sp['status']='in_progress: PERF-1a done (206, 60c82ed); SABA-B-6 done (207); PERF-FADER-a0/a/b/c done (208 f535ab3, 209-210 180dd2e, 211 28a274c, 212-213 fe556fd); PERF-1b-i done (214, eb9e76e); RETRO 215 (round 215); PERF-1b-ii round 216; then PERF-16, OSS-LIC, PERF-2..15 (PERF-6 dropped) | '+sp['status']
def find(i):
    for pool in ('open_findings','deferred_low_polish'):
        for f in d[pool]:
            if f['id']==i: return f
for i,txt in [('GATE206-S3','closed: round 214 C PASS (HYGIENE-214: reactRendererProblem fails on missing renderer or major != 18; mutants A M3, C C2), published eb9e76e (D-29z209)'),
              ('GATE206-S6','closed: round 214 C PASS (HYGIENE-214: audio-running needs running context and start() >= 1; mutant A M2), published eb9e76e (D-29z209)'),
              ('GATE211-S4','closed: round 214 C PASS (HYGIENE-214: selectClipGainMembers waits for 2 clips + 2 arrangement-clip-waveform; no waitForTimeout), published eb9e76e (D-29z209)')]:
    f=find(i); f['status']=txt
f=find('ROOT-L28-AMEND-MISSED'); f['status']='doc 167 fixed by round-214 grant (published eb9e76e); recurred for doc 168 (GATE214-DOC168-STATUS); class handled in RETRO 215 (retro-215.md, L28 replaced, SYS-4)'
f=find('GATE206-S2'); f['status']='deferred_low_polish (tooling decision for root/B) | 2026-10-28: confirmed again C-R214-BIOME-PERF-VACUOUS and gate-214 review item 7; root/Saba proposal in retro-215 For Saba (biome.json protected)'
new_open=[
 {'id':'C-R214-BIOME-PERF-VACUOUS','severity':'info','status':'merged into GATE206-S2 (proposal in retro-215 For Saba; biome.json is protected); tasks no longer cite npx biome check perf/ as acceptance (lesson L30)','title':'npx biome check perf/ processes nothing under the repo biome.json (includes app/** only); C and A used a scratch config with includes perf/** (7 files, 0 diagnostics)','source':'c-round-214.md For B item 4','added':T},
 {'id':'A-R214-DEV-RANGE-LIVE','severity':'info','status':'ruled D-29z210: accepted (label-based liveness, red-proved by C mutant C1)','title':'task liveness signal [data-range-end] renders only for all-tracks ranges (ArrangementLane.tsx l.1016-1026); A used the clip range label end (exists at mid and end, grows)','source':'a-round-214.md; c-round-214.json needsBRuling','added':T},
 {'id':'A-R214-DEV-CLICK-LIVE','severity':'info','status':'ruled D-29z210: accepted (fader enabled/disabled is the selection signal; count 1 still checked)','title':'Clip Gain fader always rendered; click-live uses enabled after Add -> disabled after empty-lane click -> enabled after header click','source':'a-round-214.md','added':T},
 {'id':'A-R214-DEV-AUDIO-RUNNING-1X','severity':'info','status':'ruled D-29z210: accepted (1x-only row like PERF-1a harness.audio-running; at 6x a non-running play still pushes a failure)','title':'interact.harness.audio-running has no .6x row although step 5 runs at both rates','source':'c-round-214.json needsBRuling','added':T},
 {'id':'GATE214-DOC168-STATUS','severity':'low','status':'open: grant in the next source round (round 216 planning) with docs 160/161 (SYS-4); L28 class','title':'doc 168 l.4 published as In Progress (C round 214 check pending) in eb9e76e (gate-214 review item 6)','source':'gates/round-214/review.md item 6; git show eb9e76e:doc168 l.4','added':T},
 {'id':'B-R214-DOC160-161-STATUS','severity':'low','status':'open: SYS-4 (same class as GATE214-DOC168-STATUS)','title':'docs 160 and 161 l.4 still In Progress at eb9e76e although C passed (rounds 203, 204/205) and both are published (135b880, c274930); never filed','source':'B grep at round-215 planning (b-round-214.md)','added':T},
 {'id':'GATE214-S1-FIXED-WAITS','severity':'low','status':'deferred_low_polish candidate -> filed in deferred_low_polish','title':'','source':'','added':T},
]
new_open=[x for x in new_open if x['id']!='GATE214-S1-FIXED-WAITS']
d['open_findings'].extend(new_open)
low=[('GATE214-S1','studio-lab-interactions.perf.spec.ts:712 and :778 use fixed waitForTimeout(idleSettleMs) outside measurement windows (state wait suggested)'),
     ('GATE214-S2','emptyLanePoint(page, \'stems\') hardcodes the fixture track id (:542)'),
     ('GATE214-S3','[data-clip-id="${clipId}"] selector built from a string (:193); a quote in the id would break it'),
     ('GATE214-S4','zoom-live compares floats exactly (values.at(-1) === values[0], :522)'),
     ('GATE214-S5','budgets.json harness.audio-running note and doc 163 l.67 say "1 s after the Space press"; code waits for the Pause label first')]
for i,t in low:
    d['deferred_low_polish'].append({'id':i,'severity':'low','status':'deferred_low_polish','title':t,'source':'gates/round-214/review.md Suggestions','added':T,'note':'perf harness owner; candidate for PERF-HARNESS-SHARED-LIB'})
for s in d.get('architecture_signals',[]):
    if s.get('id')=='PERF-HARNESS-SHARED-LIB':
        s['round_214']='second occurrence: A code-reviewer (a-round-214.md Architecture note) and gate-214 review Signal 3: helpers copied between both specs; S3 had to be applied twice. Still keep; proposal = bounded test-only round, both specs report identical deterministic medians; also tighten ratio-row determinism tolerance (A review M2). Not scheduled (B rules at a STUDIO-PERFORMANCE boundary)'
d['decisions_log_b'].extend([
 {'id':'D-29z209','date':'2026-10-28','text':'Round 214 accepted from C evidence: C PASS 9 rows, browserVerified=true, realVerified=true, 0 bugs; gate 214 published eb9e76e. PERF-1b-i done; GATE206-S3, GATE206-S6, GATE211-S4 closed. Gate-214 review: item 6 -> GATE214-DOC168-STATUS (Low, L28 class), item 7 -> GATE206-S2, items 1-5 -> deferred_low_polish GATE214-S1..S5; Architecture Signal 3 -> PERF-HARNESS-SHARED-LIB (2nd occurrence, not scheduled).'},
 {'id':'D-29z210','date':'2026-10-28','text':'L10 rulings on C round 214 needsBRuling: A-R214-DEV-RANGE-LIVE accepted (task signal was B error: data-range-end renders only for all-tracks ranges, ArrangementLane.tsx l.1016; label substitute live and red-proved by C mutant C1; new lesson L29); A-R214-DEV-CLICK-LIVE accepted; A-R214-DEV-AUDIO-RUNNING-1X accepted (1x-only id, 6x failure still pushed). C-R214-BIOME-PERF-VACUOUS merged into GATE206-S2.'},
])
d['version']=d['version']+1
json.dump(d,open(P,'w'),indent=1,ensure_ascii=False)
print('ok version',d['version'],'deferred',len(d['deferred_low_polish']),'open',len(d['open_findings']))
