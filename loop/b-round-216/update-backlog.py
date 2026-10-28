import json
P='backlog.json'
b=json.load(open(P,encoding='utf-8'))
ADDED='2026-10-28 B round 216 -> 217 planning'
def by_id(l,i):
    for x in l:
        if isinstance(x,dict) and x.get('id')==i: return x
    raise KeyError(i)
b['version']=203
b['updated']='2026-10-28 (B round 216 -> 217 planning, D-29z218..D-29z219)'
b['current_task']='current-task.md (round 217, D-29z218..D-29z219; PERF-1b-ii fix-up: C-R216-01 doc 169 architecture heading, C-R216-02 mem-polls kind labels, 0.1 MiB rule, peak notes)'
D=[
 ('D-29z218','Round 216 C FAIL on two Lows that are deliverable defects (C-R216-01 doc 169 lacks ## არქიტექტურა; C-R216-02 four mem-polls liveness rows labelled deterministic but timing-dependent); SCOPE, RT-FIX, PROBE, REDPROOF, AN-REVIEW, G216-3, STUDIO-SMOKE PASS; browserVerified/realVerified true; gate 216 skipped. Per tasks/round-216.md section 6 round 217 = bounded fix-up of the failing rows only (grants: doc 169 whole per L34 with enumerated edits, perf/budgets.resources.json kind/note of 9 rows; spec and SYS-4 docs frozen at current content, 1063-file list b-round-216-r217-tree-sha256.txt). Regression not due (planning 2026-10-28, due 2026-10-30).'),
 ('D-29z219','Rulings: (1) a liveness row whose value is a poll/sample count is wallclock: res.harness.mem-polls-1/-2/-1.6x/-2.6x -> wallclock, assert >= 5 kept, observed ranges 7-9/13-15/9-12/17-20 (A1,A2,C1,C2); set-membership liveness rows stay deterministic. (2) 0.1 MiB rule: a MiB row rounded to 0.1 stays deterministic when its median is identical in every run and no sample differs from it by more than 0.1 -> res.mem.used-ready-mib back to deterministic (median 5.1 x4, one 5.2), res.export.1.peak-backing-delta-mib stays (65 x4, one 65.1); res.export.2.longtasks-over-50 stays wallclock. (3) A round-216 deviations 1-4 accepted (window-end heap sample, 6x throttle after Add, asserts on incomplete runs, MutationObserver window end); the four peak-backing-delta-mib notes are aligned to the end sample (L34). No spec change needed: the determinism check fires only for deterministic rows whose metric is in resourceDeterminismMetrics.'),
]
for i,t in D: b['decisions_log_b'].append({'id':i,'date':'2026-10-28','text':t})
r=next(x for x in b['rounds'] if x.get('round')==216)
r['status']='c_fail_lows'
r['result']='C round 216 FAIL: DOC-216 (C-R216-01 Low) and PERF-RUN-216 determinism-label sub-criterion (C-R216-02 Low); SCOPE-216, RT-FIX-216, PROBE-216, REDPROOF-216, AN-REVIEW-216, G216-3, STUDIO-SMOKE-216 PASS; browserVerified=true, realVerified=true; gate 216 skipped (C FAIL; nothing published). Fix-up dispatched round 217 (D-29z218).'
b['rounds'].append({'round':217,'task':'current-task.md','decision':'D-29z218..D-29z219','status':'dispatched','type':'FIX-UP (PERF-1b-ii: C-R216-01, C-R216-02)',
 'items':['doc 169: ## არქიტექტურა section with the Mermaid block moved unchanged; determinism subsection rules; kind cells; l.4 Completed (C round 217 PASS)','perf/budgets.resources.json: 4 mem-polls -> wallclock (+ ranges), used-ready-mib -> deterministic (0.1 MiB rule), 4 peak notes end-sample wording','C: SCOPE-217, BUDGETS-217, DOC-217, PERF-RUN-217 (x1, sentinels), REDPROOF-217, AN-REVIEW-217, G217-3, STUDIO-SMOKE-217'],
 'note':'baseline HEAD eb9e76e + round-216 working tree (4 M + 3 ??); frozen 1063 (b-round-216-r217-tree-sha256.txt); grants 2 (b-round-216-r217-grants.txt); no new files; no deps change',
 'next':'round 218 REGRESSION if planning on/after 2026-10-30, else PERF-16 with root-deps-request.json','added':ADDED})
for fid,title,steps,ev in [
 ('C-R216-01','doc 169 has no ## არქიტექტურა heading; its Mermaid diagram sits inside ## მიდგომა (TEMPLATE.md l.35; docs 163-168 have it)','grep -n "^## " doc 169 vs TEMPLATE','c-round-216.md DOC-216'),
 ('C-R216-02','res.harness.mem-polls-1/-1.6x/-2.6x (and -2) labelled deterministic in budgets.resources.json but are timing-dependent poll counts that differ across runs (A 7/9, C 8/8 medians for mem-polls-1)','two runs of perf/studio-lab-resources.perf.spec.ts; compare medians','c-round-216/perf-compare.txt, perf-run-{1,2}.json'),
]:
    b['open_findings'].append({'id':fid,'severity':'low','origin':'C (round 216)','title':title,'repro':steps,'evidence':ev,'status':'fix-up dispatched round 217 (D-29z218/D-29z219); deliverable defect, not deferred_low_polish (C note)','added':ADDED})
b['open_findings'].append({'id':'ROOT-R216-LATE-SPEC-REVIEW','severity':'info','origin':'A round 216 report / C needsBRuling','title':'four late changes in perf/studio-lab-resources.perf.spec.ts (window redesign, window-end heap sample, assert evaluation on incomplete runs, 8 min guard) were not re-seen by A\'s code-reviewer','status':'root signal: gate reviewer to cover at the round 216+217 publication','evidence':'a-round-216.md l.77','added':ADDED})
b['open_findings'].append({'id':'R216-MEM-POLLS-HEADROOM','severity':'info','origin':'A round 216 / C round 216','title':'res.harness.mem-polls-1 at 1x is 7-9 samples against >= 5 (C confirmed min 7); a slower machine could fail the liveness assert','status':'watch: attached to PERF-HARNESS-SHARED-LIB (page-timestamped export-window helper); not scheduled','evidence':'c-round-216.json needsBRuling; a-round-216.md l.109','added':ADDED})
for i in ['GATE214-DOC168-STATUS','B-R214-DOC160-161-STATUS','GATE205-DOC162-STATUS','GATE206-S5']:
    x=by_id(b['open_findings'],i); x['status']='C PASS round 216 (SCOPE-216/DOC-216 sub-checks); closes when root publishes rounds 216+217 | '+x['status']
e=by_id(b['post_current_stage_queue'],'STUDIO-PERFORMANCE')
e['status']='in_progress: PERF-1a, SABA-B-6, PERF-FADER-a0/a/b/c, PERF-1b-i done; RETRO 215 RT-FIX C PASS round 216; PERF-1b-ii round 216 C FAIL on two Lows (C-R216-01/02) -> fix-up round 217 (D-29z218); then REGRESSION if due (on/after 2026-10-30), PERF-16, OSS-LIC, PERF-HARNESS-SHARED-LIB, execution_order_d29z215 | '+e['status']
s=by_id(e['stages'],'PERF-1b-ii'); s['status']='c_fail_lows_fixup_217 (round 216 C FAIL C-R216-01/02 Low; all browser rows PASS; fix-up round 217, D-29z218) | '+s['status']
st=by_id(b['systemic_tasks'],'SYS-4'); st['status']='c_pass_unpublished (C round 216 SCOPE/DOC sub-checks PASS; publishes with round 217) | '+st['status']
a=by_id(b['architecture_signals'],'PERF-HARNESS-SHARED-LIB')
a['round_216_note']='A-R216 code-reviewer Architecture note (verbatim in a-round-216.md l.80-82): third copy confirmed (resources spec l.158-230, l.672-770 vs interactions spec l.102-190, l.806-904); keep now; when the queued stage runs move nowIn/snapshot/waitForQuiet/blurActive/reactRendererProblem/rateRowId/formatLimit + generic report builder into perf/lib/ and add a page-timestamped export-window helper; acceptance: all three specs keep identical row ids and medians. Watch item R216-MEM-POLLS-HEADROOM attached.'
b.setdefault('retro_candidates',[]).append({'id':'RC-R216-DOC-TEMPLATE-HEADINGS','text':'implementation doc ## headings must include every TEMPLATE ## heading in order (C-R216-01; DOC-217 carries the grep check); candidate lesson for the next RETRO','added':ADDED})
json.dump(b,open(P,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(b['open_findings']))
