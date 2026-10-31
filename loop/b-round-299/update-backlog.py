import json
P='backlog.json'
b=json.load(open(P))
ADDED='2026-10-31 B round 299 -> 300 planning'
def D(i,t): b['decisions_log_b'].append({'id':i,'date':'2026-10-31','text':t})
assert b['decisions_log_b'][-1]['id']=='D-29z768'
D('D-29z769',"Round 299 (STUDIO-LINK-a4, test-only) is C PASS: 12 rows (CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT 7 files/58, UNIT-MUTANTS incl. controls x/v at ece19e3 and C's own mutant w, UNIT-VACUITY, UNIT-CLEANUP, JSDOM-MUTED-PREMISE, B-DOCK-MUTED both viewports, B-COLD-DEEPLINK both viewports, G299-AUTH, DOC-220), 0 failed, 0 blocked, browserVerified/realVerified true. Gate 299 published 61c37d8 on both remotes (verify 229 files/3416 tests; review 8.5/10 COMMIT OK). STUDIO-LINK-a4 -> done. Closed: C-R298-01, GATE297-F1 (fully: all 7 react-dom 18.3.1 emitter sites, zero tolerance, mutants x/v/y/h red), GATE297-S5 (jsdom-only gap, closed by the test helper applyBrowserParsedMutedState; C measured jsdom muted false / Chromium true, curl shows muted=\"\"), GATE298-S3, GATE298-S1, A-R298-REVIEW-5.")
D('D-29z770',"Rulings on A-R299-REVIEW-1..4, gate-299 review S1-S3 and C info. A-R299-REVIEW-1 = GATE299-S1 (NG9's zero-warning check depends on being the first hydrateRoot in studio-narrow-gate-ui.test.tsx; NG9c lacks the muted helper): ruled LOW, not Medium: no failure or vacuous pass was reproduced (C INFO-C299-02; NG9 red under mutants x/v/y/h/r2/w today), it is test-only with no product behaviour, and it is the same class as A-R298-REVIEW-6 already ruled Low in D-29z765. A-R299-REVIEW-2 = GATE299-S2 (NG9/NG9c unmount inline, root leaks on a failing expect) Low. A-R299-REVIEW-3 = GATE299-S3 (regex and muted helper duplicated across files) Low. A-R299-REVIEW-4 (helper silently no-ops with no <video>) Low. All four -> deferred_low_polish and routed to A-R298-ARCH-HYDRATE-HARNESS, whose fix (one shared hydrate-route harness, NG9's warning check in its own file or NG9c muted helper) closes them together. The hydration harness is now a 3-round signal (297-299) from two independent reviewers: it is an input to the frontend-architect checkpoint requested at the STUDIO-LINK-b / NAME-AND-HINT boundary. INFO-C299-01 (C harness selector) and INFO-C299-02 recorded as info, no task. INFO-C298-01 stays a signal.")
D('D-29z771',"Round 300 = STUDIO-LINK-b (feature, the second half of the Saba-approved STUDIO-LINK, PD-REVIEW 2026-10-31: 'in the Studio library, a public preview gets View in store in its tooltip or context menu'). Saba approved this exact scope on 2026-10-31, so it is treated like SABA-B-9/10/11 'already agreed': no AGREE/YouTube note; the reference section, product-designer framing (b-round-297/product-designer-studio-link-b.md) and acceptance rows are still required. Scope: a right-click / Shift+F10 / ContextMenu-key menu on a mapped library option with one menuitem <a href=/products/<handle> target=_blank rel=noopener noreferrer> 'View in store'; reverse map source -> handle in app/data/studio-lab-links.ts with a two-way consistency test; one '?' sheet library row; unmapped sources keep the native menu; gate-296 S4 ruled 'first load only, documented' in doc 220 stage 2. Doc 220 l.4 -> Completed (C round 300 PASS) (L28 multi-stage). A new minimal library menu component, not a retrofit of ArrangementMarkerMenu (its items are constant and its Enter handler prevents default); the duplication is recorded as an input to the frontend-architect checkpoint. Not split: tooltip-alone was rejected by product-designer.")
D('D-29z772',"No new Saba or root decision file since round 299 planning. Regression due on/after 2026-11-02 (regression-last 2026-10-30); round 300 is planned 2026-10-31, so not due. Order after 300: REGRESSION if round 301 is planned on/after 2026-11-02, else NAME-AND-HINT (301) -> frontend-architect checkpoint request to root (inputs GATE296-ARCH-ROUTE-DOM-FOCUS, library-menu vs marker-menu duplication added in round 300, A-R298-ARCH-HYDRATE-HARNESS (3x signal) + ROOT-RECON-GRID-HARNESS) -> PERF-3c and the rest of STUDIO-PERFORMANCE -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). SRW-21-PLAN parallel. RETRO at round 305.")
q=None
for e in b['post_current_stage_queue']:
    for st in e.get('stages',[]) if isinstance(e,dict) else []:
        if isinstance(st,dict) and st.get('id')=='STUDIO-LINK': q=e
stages=q['stages']
idx={s['id']:i for i,s in enumerate(stages) if isinstance(s,dict) and 'id' in s}
def pre(i,t): stages[idx[i]]['status']=t+' | '+stages[idx[i]]['status']
pre('STUDIO-LINK',"in progress (D-29z771): STUDIO-LINK-a, -a2, -a3, -a4 done (rounds 296-299); round 300 = STUDIO-LINK-b")
pre('STUDIO-LINK-a4',"done (D-29z769): C round 299 PASS 12 rows, browserVerified true, gate 299 published 61c37d8")
pre('STUDIO-LINK-b',"dispatched (D-29z771): round 300, baseline 61c37d8")
of=b['open_findings']
for e in of:
    i=e.get('id')
    if i in ('C-R298-01','GATE298-S3','GATE298-S1','A-R298-REVIEW-5'): e['status']="closed (D-29z769): C round 299 PASS, gate 299 61c37d8 | "+e['status']
    if i=='GATE297-F1': e['status']="closed (D-29z769): all 7 emitter sites, zero tolerance; C round 299 mutants x/v/y/h red | "+e['status']
for e in b['deferred_low_polish']:
    if e.get('id')=='GATE297-S5-VIDEO-MUTED-SSR': e['status']="closed (D-29z769): jsdom-only gap, test helper applyBrowserParsedMutedState; C JSDOM-MUTED-PREMISE + B-DOCK-MUTED PASS round 299 | "+e['status']
of.append({'id':'INFO-C299-01','severity':'info','origin':'C round 299 harness','title':"role=button /video/i click did not open a file chooser; C used setInputFiles on arrangement-video-input",'status':'info (D-29z770): no task','evidence':'c-round-299.json info','added':ADDED})
of.append({'id':'INFO-C299-02','severity':'info','origin':'C round 299 (premise of A-R299-REVIEW-1)','title':"NG9 is today the first hydrateRoot in studio-narrow-gate-ui.test.tsx; a hydrate test above it would make it vacuous",'status':'info (D-29z770): see A-R299-REVIEW-1 (deferred Low)','evidence':'c-round-299.json info','added':ADDED})
for fid,t,ev in [
 ('A-R299-REVIEW-1',"NG9's zero-warning check depends on being the first hydrateRoot in its file; NG9c lacks applyBrowserParsedMutedState (= GATE299-S1)","a-round-299.md; gates/round-299/review.md S1"),
 ('A-R299-REVIEW-2',"NG9/NG9c unmount inline after assertions; a failing expect leaves the root mounted (= GATE299-S2)","a-round-299.md; gates/round-299/review.md S2"),
 ('A-R299-REVIEW-3',"hydration regex and muted helper duplicated inline across test files; drift risk (= GATE299-S3)","a-round-299.md; gates/round-299/review.md S3"),
 ('A-R299-REVIEW-4',"applyBrowserParsedMutedState silently no-ops when no <video> exists","a-round-299.md")]:
    b['deferred_low_polish'].append({'id':fid,'severity':'low','status':'deferred (D-29z770): routed to A-R298-ARCH-HYDRATE-HARNESS','origin':'A round 299 code-reviewer'+(' + gate-299 reviewer' if 'GATE299' in t else ''),'title':t,'evidence':ev,'repro':'read studio-narrow-gate-ui.test.tsx NG9/NG9c and the ssr file helper; insert a hydrating test above NG9 -> NG9 passes vacuously','added':ADDED})
for s in b['architecture_signals']:
    if s.get('id')=='A-R298-ARCH-HYDRATE-HARNESS':
        s['text']+=" | D-29z770: 3rd consecutive round (297-299) and 2 independent reviewers (A code-reviewer, gate-299 reviewer); closes A-R298-REVIEW-6, A-R299-REVIEW-1..4 together; input to the frontend-architect checkpoint at the STUDIO-LINK-b / NAME-AND-HINT boundary."
b['architecture_signals'].append({'id':'B-R299-LIBRARY-MENU-DUPLICATION','source':'B round 300 planning (advisor flag, round 297)','text':'Round 300 adds a second small context-menu component (library) next to ArrangementMarkerMenu (same roving focus, Esc/Tab/outside/window close, viewport clamp). Not retrofitted on purpose (marker items are constant; its Enter prevents default, which would block <a> navigation). Input to the frontend-architect checkpoint (keep or extract a shared menu primitive). Not scheduled.','added':ADDED})
for r in b['rounds']:
    if r.get('round')==299: r['status']='c_pass_published (D-29z769): C PASS 12 rows, browserVerified true, gate 299 published 61c37d8 | '+r['status']
b['rounds'].append({'round':300,'task':'current-task.md','decision':'D-29z769..D-29z773','type':'STUDIO-LINK-b feature: View in store context menu on mapped library options + ? sheet row + doc 220 stage 2','status':'dispatched','note':'baseline 61c37d8 clean; grants listed in current-task.md section 4','added':ADDED})
b['current_task']='current-task.md (round 300, D-29z769..D-29z773; STUDIO-LINK-b: View in store context menu (right-click, Shift+F10, ContextMenu key) on mapped library options, <a target=_blank rel=noopener noreferrer>, reverse map, ? sheet row, doc 220 stage 2 + l.4 Completed; baseline 61c37d8)'
b['version']=b['version']+1
b['updated']='2026-10-31T B round 299 -> 300 planning'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'])
