import json
p='backlog.json'; d=json.load(open(p))
assert d['version']==184
TAG='2026-10-27 B round 199 -> 200 planning (D-29z165)'
def find(i): return [f for L in (d['open_findings'],d['deferred_low_polish']) for f in L if f.get('id')==i]
SYS=[
 {'id':'SYS-1','title':'Tests find elements by role/name/text/testid, not by styling classes; remove self-compare, source-text and positional selectors','closes':['GATE146-S4-LRS3-CLASSNAME-PINS','GATE164-OV1-FRAGILE','GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR','GATE81-S2-UM8-SOURCE-TEXT','C-R127-L1f-SELF-COMPARE-TESTS','RETRO200-CLASS-SELECTORS'],'owner_area':'app/lib/arrangement/__tests__/ (tests only)','evidence':'retros/retro-200.md section 6; tech-lead consult (b-round-199.md); C-R178-BADGE-SELECTOR history','size':'1 round','not_scope':'blanket readFileSync removal (19 files, some deliberate source checks)'},
 {'id':'SYS-2','title':'Held-Enter auto-repeat guard on every toggle/command button (reuse preventRepeatedEnterKeyDown, ArrangementTransport.tsx:122): Play l.132, Split l.196, Loop l.222, Follow l.239, Zoom to range l.283, marker flag Enter','closes':['GATE107-S1-MARKER-FLAG-HELD-ENTER','A-R107-SWEEP-HELD-ENTER-TOOLBAR'],'owner_area':'ArrangementTransport.tsx, ArrangementMarkerRow.tsx + tests','evidence':'retros/retro-200.md section 6; grep at 5b1a2bb','size':'1 round','acceptance_note':'key auto-repeat and held-key rows; one toggle per press; real-browser held Enter at both viewports'},
 {'id':'SYS-3','title':'IME: no commit on Enter/Escape while event.nativeEvent.isComposing','closes':['ROOT-R65-L5','A-R165-IME-ENTER'],'also_fixes_unfiled':['ArrangementGroupHeader.tsx:246 group rename','ArrangementDetailPanel.tsx:371 range field, :464 Clip Gain field'],'owner_area':'ArrangementTempoRow.tsx, ArrangementMarkerRow.tsx, ArrangementGroupHeader.tsx, ArrangementDetailPanel.tsx + tests','evidence':'grep isComposing in app = 0 hits at 5b1a2bb','size':'1 round','optional_attach':'GATE75-S5-ARIA-EXPANDED, GATE110-S3-TOGGLE-ARIA-EXPANDED only if dispatch keeps the same owner files'},
]
for t in SYS:
    t['status']='queued (after SABA-B-4 stage 2, before STORE-2b; policy "queued right after the current stage")'; t['added']=TAG
    for i in t['closes']:
        if i=='RETRO200-CLASS-SELECTORS': continue
        fs=find(i); assert fs,i
        for f in fs: f['systemic_task']=t['id']
d['deferred_low_polish'].append({'id':'RETRO200-CLASS-SELECTORS','severity':'low','status':'deferred_low_polish -> closed by SYS-1','title':'5 test sites still select by styling class (same class as C-R178-BADGE-SELECTOR): library-preview.test.tsx:241 span.text-foreground; detail-panel-strings-ui.test.tsx:239,277 span.text-dim; detail-panel-polish.test.tsx:369 span.font-sans; library-row-strings-ui.test.tsx:252 span.font-mono','evidence':'tech-lead consult in RETRO 200 planning; B grep at 5b1a2bb (b-round-199.md)','repro':'grep -rn "querySelector(All)?(\'span.(text-|font-)" app --include=*.test.tsx','systemic_task':'SYS-1','added':TAG})
d['systemic_tasks']=SYS
d['retro_runs']=[{'round':200,'decision':'D-29z165','window':'123-199','report':'retros/retro-200.md','lessons':'lessons.md (30 lines, 21 lessons)','data':'b-round-199/*.py, *.json, *.txt','consults':{'tech-lead':'used','consequence-tester':'used','qa-engineer':'not in B consult list; C may consult in round 200'},'headline':'77 rounds, C PASS 63 / FAIL 14; cost $1635.42 (B 598.25, A 547.08, C 490.09); FAIL rounds $331.75; 10 of 14 FAILs from spec/inventory/self-check gaps catchable before dispatch','rejected_systemic':'announcement dedupe (GATE165-SR-REPEAT vs status-announcement.ts gesture suppression) - needs a product decision (For Saba)','status':'dispatched to C (traceability)','added':TAG}]
rp=d['retro_policy']; rp['next_due']='round 215 or the end of STORE-REDESIGN, whichever first'; rp['first_run']='round 200 (D-29z165)'
rp['candidate_systemic_inputs']=rp.get('candidate_systemic_inputs',[])+['handled in retro 200: SYS-1..3; GLOBAL-FOCUS-VISIBLE-UNLAYERED store half stays in SABA-B-4 stage 2']
d['rounds'].append({'round':200,'task':'current-task.md','decision':'D-29z165','status':'dispatched','type':'RETRO','items':['RETRO 200: C traceability check of retros/retro-200.md + lessons.md + systemic_tasks (RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA)','R200-P1 REG-DUX5-PLAYHEAD-RESCAN (browser, both viewports)','G200-3 auth guard','A: nothing to implement'],'note':'baseline HEAD 5b1a2bb clean; frozen 1032 (b-round-199-r200-tree-sha256.txt); grants none (b-round-199-r200-grants.txt empty)','added':TAG})
d['current_task']='round 200 RETRO (first retrospective, window 123-199): A nothing; C traceability + R200-P1 + G200-3 (D-29z165)'
for e in d['post_current_stage_queue']:
    if e.get('id')=='STORE-REDESIGN':
        e['retro_200_insert']='after SABA-B-4 stage 2 (round 201): SYS-1, SYS-2, SYS-3 (backlog systemic_tasks), then STORE-2b ('+TAG+')'
d['version']=185; d['updated']=TAG
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok')
