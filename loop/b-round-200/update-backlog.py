import json
P='backlog.json'; b=json.load(open(P,encoding='utf-8'))
ADD='2026-10-27 B round 200 -> 201 planning (D-29z166)'
assert b['version']==185
b['version']=186; b['updated']=ADD
b['current_task']='round 201 SABA-B-4 stage 2 (store pages: one shared focus style on every store focusable, R85 mount moved to root, C-R196-03) + RT-FIX re-check of the corrected retro lines (D-29z166)'
b['advisor_used_by_B'] += ' | '+ADD+': advisor available and consulted after orientation (adopted: follow the round-200 outcome table, keep RT-NUM numbers, fix the partition in retro + retro_runs + b-next, do NOT layer the global rule (SFR1 pins it), move R85 mount to root, sweep rules by token class with peer-focus kept, CSS outline:none sites, store guard test, cloud-unreachable sites BLOCKED, verify no 178-class collision before granting)'
r=b['rounds'][-1]; assert r['round']==200
r['status']='c_fail_process (no source change)'
r['result']={'c':'c-round-200.json taskStatus FAIL, browserVerified true, realVerified true; passed SOURCE-SCOPE, RT-NUM, RT-IDS, RT-SABA, R200-P1 (both viewports), G200-3 (both viewports); failed RT-CAUSE, RT-LESSONS (C-R200-01 Medium); C-R200-02 Low','gate':'gates/gate-round-200.json skipped (C taskStatus FAIL); nothing to publish (no grants)','b_correction':'retros/retro-200.md section 9, lessons.md L12/L14/L23, systemic_tasks SYS-3 count; re-check RT-FIX in round 201','added':ADD}
b['rounds'].append({'round':201,'task':'current-task.md','decision':'D-29z166','status':'dispatched','type':'FEATURE (SABA-B-4 stage 2) + RT-FIX','items':['SABA-B-4 stage 2: store pages one shared focus style (sweep component focus recipes, CSS outline:none sites, R85 mount in root.tsx, store guard test)','C-R196-03 home product card ring','GLOBAL-FOCUS-VISIBLE-UNLAYERED store half (ruling R91: rule stays unlayered)','RT-FIX: C re-checks the corrected retro-200 / lessons lines (C-R200-01, C-R200-02)'],'note':'baseline HEAD 5b1a2bb (gate 199 published; gate 200 skipped, no source change); grants b-round-200-r201-grants.txt','added':ADD})
# findings
of=b['open_findings']
of.append({'id':'C-R200-01','severity':'medium','status':'corrected at round-201 planning (retro-200 section 9; lessons L12, L14, new L23; retro_runs[0].headline); open until C RT-FIX passes in round 201','title':'retro-200 filed rounds 127 and 178 as A self-check misses; the A/C reports show A stopped/reported before handover (cause on the B/task side); L14 premise contradicted, L12 partly','evidence':'c-round-200.md RT-CAUSE, RT-LESSONS; a-round-127.md l.3 + section 3; c-round-127.md l.3; a-round-178.md l.43-49','origin':'C','added':ADD})
of.append({'id':'C-R200-02','severity':'low','status':'closed (fixed in retro-200 section 6 at round-201 planning: three unrecorded sites in two files); C re-reads the line in RT-FIX','title':'retro SYS-3 said two unrecorded sites, backlog lists three','evidence':'c-round-200.md RT-IDS','origin':'C','added':ADD})
of.append({'id':'OBS-C200-ROUNDING','severity':'info','status':'closed (wording added to retro-200 section 2 notes)','title':'cost totals are sums of per-phase values rounded to cents; raw sums differ by $0.01-0.05','evidence':'c-round-200.json observations','origin':'C','added':ADD})
of.append({'id':'OBS-C200-OVERVIEW-FRAME','severity':'info','status':'harness note -> regression_rounds REGRESSION-ROUND-2026-10-30 scope_additions (scan [data-testid=arrangement-overview], not the frame)','title':'arrangement-overview-frame is the visible-window box; the overview playhead can sit outside it','evidence':'c-round-200.md R200-P1','origin':'C','added':ADD})
for x in of:
    if x.get('id')=='C-R180-K8-PLAYHEAD-MASK':
        x['status']='closed: REG-DUX5-PLAYHEAD-RESCAN done in round 200 R200-P1 PASS at 1440x900 and 1280x720 (brass only in the playhead and overview-playhead columns, 0 elsewhere; c-round-200/out/p1-colsplit.json) | history: '+x['status']
        x['closed']=ADD
    if x.get('id')=='GLOBAL-FOCUS-VISIBLE-UNLAYERED':
        x['status']='store half scheduled round 201 (SABA-B-4 stage 2) with ruling R91: the global rule stays unlayered (SFR1 pins it; after the store sweep no utility depends on layer order and an unlayered rule cannot be suppressed by a utility); closes on round-201 C PASS | '+x['status']
    if x.get('id')=='C-R196-03':
        x['status']='scheduled round 201 (SABA-B-4 stage 2, row CARD-RING); hypothesis (unconfirmed): ProductCard <Link> is inline around a block overflow-hidden rounded-xl div | '+x['status']
    if x.get('id')=='SABA-B-4':
        x['status']='stage 2 (store pages) dispatched round 201 (D-29z166) | '+x['status']
        x['stage2_rulings_d29z166']={'R91':'global :focus-visible rule stays unlayered in app.css (backlog split text said layer; overridden: SFR1 pins the top-level rule, no visible gain after the sweep, unlayered keeps the indicator un-suppressible); no new :focus-visible text anywhere in app.css','R92':'useFocusSourceAttribute mounted once in app/root.tsx AppContent; removed from StudioWorkspace.tsx (stage2_inputs signal 4)','R93':'store sweep by token class: remove focus-visible:ring-*, focus:ring-*, *ring-offset*, focus-within:ring-*, focus:outline-none, focus-visible:outline-none, bare outline-none, focus:border-* (parity with Studio R87); keep peer-focus:* floating-label tokens','R94':'app.css: delete outline:none in .audio-player-progress, .audio-player-volume-slider, .video-player-slider, .video-volume-slider, .command-palette-input and the .sort-select:focus rule body; delete the unused .newsletter-input-large:focus and .glass-input:focus blocks; afterwards outline:none appears only in the pointer rule','R95':'C-R196-03: the card link gets a visible ring on keyboard focus with no layout move; fix chosen by A after confirming the cause in the browser','vetoable':'Saba/root','added':ADD}
# regression scope
rr=b['regression_rounds'][2]; assert rr['id']=='REGRESSION-ROUND-2026-10-30'
rr['scope_additions']=[s for s in rr['scope_additions'] if not s.startswith('REG-DUX5')]+['OBS-C200-OVERVIEW-FRAME: overview scans use [data-testid=arrangement-overview], not arrangement-overview-frame']
rr['scope_note']='REG-DUX5-PLAYHEAD-RESCAN removed: done in round 200 R200-P1 ('+ADD+')'
# systemic tasks
for t in b['systemic_tasks']:
    if t['id']=='SYS-3':
        t['also_fixes_unfiled_count']='3 sites in 2 files (C-R200-02)'
# retro run
rt=b['retro_runs'][0]
rt['headline']='77 rounds, C PASS 63 / FAIL 14; cost $1635.42 (B 598.25, A 547.08, C 490.09; sums of per-phase values rounded to cents); FAIL rounds $331.75; 11 of 14 FAILs catchable before dispatch/handover (9 by B: 127,142,143,145,151,178,192,193,194; 2 by A: 154,158); 2 unmeasured contrast (149,196); 1 first-visit (189) [corrected at round-201 planning per C-R200-01; was 7 B / 4 A]'
rt['lessons']='lessons.md (32 lines, 23 lessons: B 11 (L1-L10, L23), A 5, C 7); corrected L12, L14, added L23 at round-201 planning'
rt['status']='C round 200 FAIL (RT-CAUSE, RT-LESSONS: C-R200-01; C-R200-02 Low); corrected at round-201 planning (retro section 9); RT-FIX re-check in round 201'
rt['correction']={'by':'B','decision':'D-29z166','evidence_checked':'a-round-127.md l.3 + section 3, c-round-127.md l.3, a-round-178.md l.43-49','added':ADD}
json.dump(b,open(P,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', b['version'])
