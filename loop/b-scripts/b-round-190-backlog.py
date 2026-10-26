import json, io
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
d=json.load(open(P))
ADDED='2026-10-26 B round 190 -> 191 planning (D-29z156)'
d['version']=d.get('version',175)+1
d['updated']='2026-10-26'
d['current_task']=('current-task.md (round 191: D-29z156 - SABA-B-3 Medium (Saba 2026-10-26): faders turn into a solid brass box when pressed; '
 'K0 reproduce + confirm cause (ring-2 + unlayered global :focus-visible outline); K1 R68 level-fader look (graphite track, brass value fill, neutral thumb) on track/group/Master/Clip Gain; '
 'K2/K3 R69 single thin offset focus ring on all six range controls (Pan/Zoom neutral, R70); R71 shared studio-fader.ts; T1 fader-style-ui.test.tsx, T2 DXA1; doc 157; '
 'baseline HEAD 338564e clean; grants 6, new 3, frozen 1013)')
q=d['post_current_stage_queue']
sr=[e for e in q if e['id']=='STORE-REDESIGN'][0]
sr['status']=('in_progress: STORE-0 done (185, 4a73ced); STORE-1a done (186, cc207d6); STORE-1b done (187, cb24362); STORE-1c done (188, 850445c); '
 'STORE-1d done (rounds 189+190, C PASS round 190 browserVerified=true, published 338564e) -> STORE-1 complete; STORE-2..5 not_started (direction A decided 2026-10-25); '
 'paused for SABA-B-3 (round 191, Saba order 2026-10-26) and the regression round due on/after 2026-10-27')
sr['store1d_fixup_result']={'round':190,'status':'done','c_verdict':'PASS','browserVerified':True,'realVerified':True,
 'passed':['CLS-FRESH-190','DUR-190','VIS-190','HIT-190','SKIP-190','H1-190','RM-190','SESSION-190','STORE-AFTER-190','G190-3','STUDIO-RV-190','SCOPE-190','T-RUN-190','AN-REVIEW-190','PX-NET','REG-HYD'],
 'measurements':'fresh CLS median 0.00005/0.0014/0.0009 (375/1280/1440); overlay-sourced shift max 0; overlay parent BODY, height = viewport; DUR 1158.9-1165.5 ms; Tab/Shift+Tab removal 2.4-3.8 ms',
 'confirmed_cause':'PageTransition page-transition-wrapper transform (translateY 8px->0) was the containing block of the fixed overlay (A bisect: all child freezes 0.6158; ancestor probe); fix createPortal to document.body',
 'evidence':'c-round-190.md, c-round-190.json; a-round-190.md; gates/gate-round-190.json published 338564e (rounds 189+190)','added':ADDED}
# STUDIO-PERFORMANCE
if not any(e['id']=='STUDIO-PERFORMANCE' for e in q):
    idx=[i for i,e in enumerate(q) if e['id']=='T12-ADVANCED'][0]
    q.insert(idx,{'id':'STUDIO-PERFORMANCE','status':'not_started','requested':'2026-10-26 (Saba, agent-workflow policy section "Saba\'s bug and the performance queue")',
     'instruction':'After REVIEW-RECOMMENDATIONS and before T12-ADVANCED. Outline and baseline: docs/technical/performance/perf-plan.md. Before dispatching each PERF task, B consults performance-optimizer and tech-lead, re-measures, and writes the task in full detail. PERF-1 (the harness) comes first. The 2026-10-23 bug gate applies.',
     'prerequisites':['REVIEW-RECOMMENDATIONS'],'source':'/home/runner/czaba-project/docs/technical/performance/perf-plan.md','added':ADDED})
d['retro_policy']={'requested':'2026-10-26 (Saba)','when':'a RETRO round after every 15 rounds and at the end of each queue entry (STORE-REDESIGN, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED), whichever first; first one right after STORE-REDESIGN or at round 200, whichever first',
 'who':'B runs it, consulting tech-lead, qa-engineer (if available), consequence-tester; C checks traceability; A implements nothing',
 'outputs':['loop/retros/retro-<round>.md (Georgian)','loop/lessons.md (<=60 lines, read by B/A/C every round)','systemic tasks closing classes of deferred Lows','project-rule changes as proposals for Saba only'],
 'candidate_systemic_inputs':['GLOBAL-FOCUS-VISIBLE-UNLAYERED (C-R169-N1 double focus ring class)'],'next_due':'after STORE-REDESIGN or round 200','added':ADDED}
of=d['open_findings']
def find(i):
    for e in of:
        if e.get('id')==i: return e
for i,txt in [('C-R189-01','closed: round 190 C PASS (CLS-FRESH-190 fresh median 0.00005/0.0014/0.0009, overlay-sourced shift 0; portal to body), published 338564e'),
              ('C-R189-02','closed: round 190 C PASS (SKIP-190 Tab/Shift+Tab end the loader 2.4-3.8 ms, not default-prevented; R67), published 338564e')]:
    e=find(i)
    if e: e['status']=txt; e['closed']=ADDED
new=[
 {'id':'SABA-B-3','severity':'medium','status':'fix round 191 (D-29z156; R68-R71)','title':'Studio volume fader turns into a solid brass box with an ivory track and oversized thumb while pressed/dragged (track Volume reported; same class string on group, Master, Clip Gain, Pan, Zoom)',
  'evidence':'user-review/img/saba-2026-10-26-volume-fader-click.png; b-round-190/shots/vol-*.png, b-round-190/tools/fader-probe.cjs (pressed: :focus-visible true, box-shadow 2px brand ring + outline brand solid 2px despite focus-visible:outline-none)',
  'repro':'/studio-lab 1440x900, mouse-down on the first track Volume fader','b_hypothesis':'ring-2 + unlayered global :focus-visible outline (app.css:379) merge into a band; A confirms in K0',
  'rulings':{'R68':'level faders (track/group/Master/Clip Gain): graphite track, brass value fill, neutral ivory thumb in every state; supersedes DUX-R-5b-1 for these fills only; vetoable','R69':'one thin offset brass ring on all six range controls, :focus-visible only (Chromium matches on mouse press)','R70':'Pan and Zoom keep neutral look, focus fix only','R71':'shared studio-fader.ts recipe'},
  'added':ADDED},
 {'id':'C-R190-INFO','severity':'info','status':'routed','title':'C round 190 info: I1 T1 has no portal guard (m5 17/17 green) -> parentElement===document.body case in the next round owning SpotlightLoader (STORE-5) + overlay parent/height + fresh CLS in regression store smoke; I2 harness rule: scroll after performance.now()>250 and readyState!=loading; I3 overlay now above sticky header/cookie banner (intended, Saba may judge at STORE-2); I4 ArrowDown scrolls hidden page 40 px (-> deferred_low_polish); I5 Shift+Tab from top focuses footer Cookie Policy (browser order)','evidence':'c-round-190.json info','added':ADDED},
 {'id':'A-R190-SIGNALS','severity':'info','status':'signal','title':'A round 190 code-reviewer: Medium #1 no unit test for the portal (B decision: add with the next SpotlightLoader owner, see C-R190-INFO I1); Low #2 unused findOverlay param kept; Info #8 AnimatePresence inert; #9 bubble-phase keydown. Architecture note verbatim in a-round-190.md -> ARCH-R190-PAGETRANSITION-FIXED','evidence':'a-round-190.md code review','added':ADDED},
 {'id':'ARCH-R190-PAGETRANSITION-FIXED','severity':'info','status':'signal','title':'PageTransition.tsx pageVariants y transform is the containing block for every fixed overlay inside routes during enter (DownloadDialog.tsx:96, studio.$productId.tsx:104 (protected), account.tsx:309). Reviewer proposal: one bounded task removing y or auditing fixed overlays; value medium, cost low, risk subtle visual change. Not scheduled; candidate for STORE-REDESIGN exit checkpoint','evidence':'a-round-190.md architecture note','added':ADDED},
 {'id':'GLOBAL-FOCUS-VISIBLE-UNLAYERED','severity':'info','status':'signal','title':'Unlayered global :focus-visible outline (app.css:379, 2px brand, offset 2px) beats Tailwind v4 layered focus-visible:outline-none, so controls with focus-visible:outline-none focus-visible:ring-2 likely render a double ring (53 component sites counted by B). Class of C-R169-N1. Systemic-task candidate at the next RETRO; round 191 fixes only the six range inputs','evidence':'b-round-190/tools/fader-probe.cjs output (computed outline brand solid 2px with outline-none class)','added':ADDED},
]
ids={e.get('id') for e in of}
for e in new:
    if e['id'] not in ids: of.append(e)
dl=d['deferred_low_polish']
if not any(e.get('id')=='C-R190-I4' for e in dl):
    dl.append({'id':'C-R190-I4','severity':'low','status':'deferred_low_polish','title':'ArrowDown (and likely Space/PageDown) while the entrance loader is up scrolls the hidden page by 40 px (outside R67, same class as C-R189-02)','evidence':'c-round-190/out/skip-{1440,375}.json case e','repro':'fresh context, open /, ~300 ms after overlay insertion press ArrowDown','owner_note':'SpotlightLoader.tsx; STORE-5 or polish pass','added':ADDED})
rr=d['regression_rounds'][-1]
rr['round']='first planning on/after 2026-10-27 (round 191 was planned 2026-10-26 and is SABA-B-3 per Saba order; expected round 192 if planned on/after 2026-10-27)'
adds=['STORE-1d (round 190 C PASS, 338564e): fresh-mode CLS at 375/1280/1440 (<0.1) with overlay parent BODY and height = viewport (C-R190-I1); DUR/SESSION/RM/H1; Tab/Escape skip',
      'harness rule C-R190-I2: scrollIntoView only after performance.now()>250 and readyState!=loading',
      'SABA-B-3 (if round 191 C PASS): one fader of each kind pressed + keyboard focus at both viewports: single thin offset ring, no filled box; level look R68']
for a in adds:
    if a not in rr['scope_additions']: rr['scope_additions'].append(a)
rounds=d['rounds']
for r in rounds:
    if r.get('round')==190:
        r['status']='c_pass (C round 190 PASS browserVerified=true realVerified=true, 16 rows, 0 bugs); gate 190 published 338564e (rounds 189+190)'
if not any(r.get('round')==191 for r in rounds):
    rounds.append({'round':191,'task':'current-task.md','decision':'D-29z156','status':'dispatched',
     'items':['K0 reproduce + confirm cause','K1 R68 level-fader look (4 faders)','K2 R69 single offset ring (4 faders)','K3 R69 Pan/Zoom ring only (R70)','T1 fader-style-ui.test.tsx','T2 DXA1 amend','D1 doc 157'],
     'note':'baseline HEAD 338564e (gate 190 published, clean, 1019 tracked); grants b-round-190-r191-grants.txt (6); new b-round-190-r191-new-files.txt (3); frozen 1013 (b-round-190-r191-tree-sha256.txt OK from store root); start copies b-round-190/r191-granted-start/','added':ADDED})
json.dump(d,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', d['version'], len(of), len(dl), len(rounds))
