import json
P='backlog.json'; d=json.load(open(P))
T='2026-10-28 B round 214 -> 215 planning'
def find(i):
    for pool in ('open_findings','deferred_low_polish'):
        for f in d[pool]:
            if f['id']==i: return f
d['retro_runs'].append({'round':215,'decision':'D-29z211','window':'200-214','report':'retros/retro-215.md','lessons':'lessons.md (47 lines): L23 amended (grep scope + class ruling), L28 replaced (A writes final Completed (C round N PASS)), L29-L31 + L34 added (B), L32-L33 added (A)','data':'b-round-214/*.py, *.json, *.txt','consults':{'tech-lead':'used','consequence-tester':'used','qa-engineer':'not in B consult list; C may consult in round 215'},'headline':'15 rounds, C PASS 11 / FAIL 4 (200, 201, 202, 209); gate published 9, skipped 4, blocked 1 (204), failed 1 (212); cost $409.94 (B 151.29, A 146.46, C 112.19; root gate not included); FAIL rounds $100.40; re-do rounds 202/203/210/213 $101.46; largest repeated class: stale doc status lines (8 findings in window)','status':'dispatched round 215 (C traceability check)','added':T})
d['retro_policy']['next_due']='round 230 or the end of STUDIO-PERFORMANCE, whichever first (retro 215 window 200-214)'
d['retro_policy']['signals_for_next_retro']=['retro-215 section 8 experiments: (1) count DOC*-STATUS findings in 215-229 under new L28 (baseline 8; refuted if >= 3); (2) L23-class STOPs (baseline 1); (3) timeout gate failures (baseline 1); (4) B planning median cost (baseline $10.49; cut added checks if > ~$12 with no drop in FAILs)']
d['systemic_tasks'].append({'id':'SYS-4','what':'doc status backfill: docs 160, 161, 162, 168 l.4 -> exact "Completed (C round N PASS)" per new L28 (160: C round 203; 161: C round 204; 162: C round 205; 168: C round 214); docs only, no other line','closes':['GATE214-DOC168-STATUS','B-R214-DOC160-161-STATUS','GATE205-DOC162-STATUS'],'owner_area':'docs/implementation/2026/quarter-IV/ (4 files, l.4 only)','size':'folded into the next source round as doc grants (round 216 PERF-1b-ii, or the regression round if it comes first): 4 one-line grants','root_cause':'status line needed a post-C amend that root missed (ROOT-L28-AMEND-MISSED); removed by L28 replacement','status':'queued: next source round (D-29z212)','added':T})
for i in ('GATE214-DOC168-STATUS','B-R214-DOC160-161-STATUS'):
    find(i)['status']='queued: SYS-4 (next source round, D-29z212)'
f=find('GATE205-DOC162-STATUS'); f['status']='queued: SYS-4 (doc 162 l.4 still In Progress at eb9e76e) | '+str(f.get('status'))
f=find('B-R212-TIMEOUT-HEADROOM'); f['status']='closed: lessons L31 (B) + L32 (A) at RETRO 215 (D-29z211)'
for s in d['systemic_tasks']:
    if s['id'] in ('SYS-1','SYS-2','SYS-3'):
        s['status']=str(s['status'])+' | 2026-10-28: not yet run; order moved behind STUDIO-PERFORMANCE by Saba (D-29z172); unchanged'
d['rounds'].append({'round':215,'task':'current-task.md','decision':'D-29z209..D-29z212','status':'dispatched','type':'RETRO (window 200-214)','items':['RETRO 215: C traceability check of retros/retro-215.md + lessons.md + SYS-4 (RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA)','G215-3 auth guard (browser, both viewports)','STUDIO-SMOKE-215 (browser, both viewports)','A: nothing to implement'],'note':'baseline HEAD eb9e76e clean; frozen 1062 (b-round-214-r215-tree-sha256.txt); grants none (b-round-214-r215-grants.txt empty)','next':'round 216 PERF-1b-ii + SYS-4 doc grants (REGRESSION instead if planning on/after 2026-10-30)','added':T})
d['decisions_log_b'].extend([
 {'id':'D-29z211','date':'2026-10-28','text':'RETRO 215 (window 200-214) written: retros/retro-215.md, lessons.md (L23 amended, L28 replaced, L29-L34 added), SYS-4 doc status backfill; consults tech-lead + consequence-tester; qa-engineer not in B list. Rule changes only as For Saba proposals (biome.json perf/** scope; retro-200 proposals still unanswered).'},
 {'id':'D-29z212','date':'2026-10-28','text':'Queue: round 215 RETRO (C verifies traceability; no source change). Round 216: if its planning date is on/after 2026-10-30, REGRESSION (regression-last round 199) and PERF-1b-ii moves to 217; else PERF-1b-ii + SYS-4 (docs 160/161/162/168 l.4 grants). At PERF-1b-ii planning B rules on doc 168 PERF candidates and files root-deps-request.json for mediabunny (PERF-16 next). If C fails an RT row, B corrects the retro first at round-216 planning; the next round still runs.'},
])
d['current_task']='current-task.md (round 215, D-29z209..D-29z212; RETRO window 200-214; no source change)'
d['updated']='2026-10-28 (B round 214 -> 215 planning, D-29z209..D-29z212)'
d['version']+=1
json.dump(d,open(P,'w'),indent=1,ensure_ascii=False)
print('ok',d['version'],len(d['deferred_low_polish']),len(d['open_findings']))
