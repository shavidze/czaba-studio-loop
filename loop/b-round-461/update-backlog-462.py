import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
M=L+'/b-round-461/update-backlog-462.done'
if os.path.exists(M): sys.exit('already applied')
p=L+'/backlog.json'
b=json.load(open(p))
assert b['version']==453, b['version']
NOW='2026-11-12 B round 461 -> 462 planning'
def find(key,id_):
    for f in b[key]:
        if isinstance(f,dict) and f.get('id')==id_: return f
    raise KeyError(id_)
def pre(f,txt): f['status']=txt+' | '+str(f.get('status',''))
# round 461 result
for i,rows in (('A-R460-REVIEW-1','C4 (3 files/62 tests, E20/E20b/E21/E21b passed, 0 Hydration failed) + C5 (mutants cmp-equal, M1-M10 RED)'),('A-R460-REVIEW-6','C4 (E9 passed) + C5 (M6-M8 RED)'),('A-R460-REVIEW-7','C4 (E1b passed) + C5 (M3/M4 RED)')):
    f=find('open_findings',i); pre(f,f'closed (D-29z1630): C round 461 PASS {rows}; gate 461 published a7fa78e; evidence c-round-461.json, c-round-461/covering.log, c-round-461/mutants/mutants.txt')
pre(find('deferred_low_polish','A-R459-REVIEW-R8'),'E11 regex part done (D-29z1630, C round 461 C4, gate 461 a7fa78e; gate reviewer: fine); findOverlay(_container) unused parameter remains deferred')
pre(find('deferred_low_polish','TL-R459-TEST-NITS'),'E8 part done (D-29z1630, C round 461 C4, gate 461 a7fa78e); other nits remain deferred')
# gate 461 Lows
for gid,title,ev in (
 ('GATE461-1','E21/E21b run the boot script and never trigger the takeover; the boot capture listeners on document may outlive the test (afterEach does not remove them); no failure seen','gates/round-461/review.md finding 1'),
 ('GATE461-2','store-entrance-loader hydrate helper: consoleError.mockRestore() runs only on the happy path (not in the finally); vi.restoreAllMocks in afterEach covers it (cosmetic)','gates/round-461/review.md finding 2'),
 ('GATE461-3','E20/E20b detect the mismatch with /hydrat/i on React message text; a React upgrade that rewords it fails with a misleading cause; note it in doc 300 or assert recoverableErrors.length > 0 first','gates/round-461/review.md finding 3')):
    b['deferred_low_polish'].append({'id':gid,'severity':'low','origin':'gate reviewer round 461','status':'deferred_low_polish (D-29z1630)','title':title,'evidence':ev,'added':NOW})
sig=find('architecture_signals','SIG-R459-ENTRANCE-HANDSHAKE')
sig.setdefault('notes',[]).append({'added':NOW,'source':'gate 461 review Architecture note','note':'signal 3 (store-entrance-loader.test.tsx changed in 459, 460, 461): keep; proposal = one bounded task moving installHeadCover/runBootScript/trackBootCaptureListeners/trackTakeoverListeners/hydrateHeadCover into app/lib/__tests__/helpers/entrance-harness.tsx (same tests unchanged); the larger item stays app/lib/entrance-handshake.ts. Signal only, not scheduled (D-29z1630).'})
b['deferred_low_polish'].append({'id':'INFO-A461-MUTANTS-MKDIR','severity':'info','origin':'A round 461 process note','status':'deferred_low_polish (D-29z1630); loop artifact only (b-round-460/mutants/mutants.py does not create its output dir); round-462 mutants.sh creates it','title':'mutants.py needs its output directory created first','evidence':'a-round-461.md process note; c-round-461.json observations','added':NOW})
# round 462 dispatch
lg=find('open_findings','LEGACY-DEAD-STORE-COMPONENTS')
pre(lg,'in_progress (D-29z1631): stage 1 = round 462 STORE-2b-3d-1 deletes ArtistBioSection, VideoShowcase, PianoLoadingAnimation, PianoCurtainLoader, CinemaCurtainLoader, audio/Timeline, lib/email.server.ts (+ barrel lines, allow-list entries; GT6 guard); TestimonialsSection (SABA-Q-TESTIMONIALS-UNMOUNTED) and IconButton/ChatButton (not in the Q6 list) stay; permission = Saba legacy policy 2026-11-10 + questions-retro-450.md Q6 default, no objection')
for i,why in (('TL-R449-D1-LOADING-BRAND-CLASS','closes on C round 462 PASS: LT7 asserts .loading-brand has no consumer (C4) + mutant M4 (C5)'),('TL-R449-D2-BARREL-ALIAS','closes on C round 462 PASS: the guarded modules are deleted; GT6 barrel check + tsc (C3, C5 M2)')):
    pre(find('deferred_low_polish',i),f'scheduled round 462 (D-29z1631): {why}')
for tid,title,st in (
 ('TL-R462-L1','store-gradient-text GT5 no longer word-scans the 4 deleted component names outside barrels; tsc/build and GT6 replace it','ruled accepted (D-29z1631): doc 301 states it; no task'),
 ('TL-R462-L2','GT6 barrel regex has no in-test positive fixture; only mutant M2 proves it bites','deferred_low_polish (D-29z1631); owner 2b-3d-2 (same file family) or the style-scan extraction'),
 ('TL-R462-L3','docs/technical/future/stripe-migration-guide.md l.556/746 and docs/technical/video-sync.md l.463 name deleted files (historical docs)','deferred_low_polish (D-29z1631); listed in doc 301 TODO')):
    b['deferred_low_polish'].append({'id':tid,'severity':'low','origin':'tech-lead sketch review round 462 (b-round-461/sketch-review.md)','status':st,'title':title,'evidence':'b-round-461/sketch-review.md','added':NOW})
q=[e for e in b['post_current_stage_queue'] if isinstance(e,dict) and e.get('id')=='STORE-REDESIGN'][0]
q['status']='in_progress (D-29z1631): round 462 = STORE-2b-3d-1 (delete the 7 dead Store modules; reordered ahead of 2b-3c-2b); next REGRESSION-2026-11-13 (due for the next planning on/after 11-13), then 2b-3d-2 (dead CSS), 2b-3c-2b (unless folded into ARCH-CHECKPOINT-STYLE-SCAN extraction), 2b-4, STORE-2c..5 | '+q['status']
st=[s for s in q['stages'] if s['id']=='STORE-2'][0]
sp=st['split_2b_d29z1583']
sp['STORE-2b-3d']='split (D-29z1631): 2b-3d-1 = round 462 (TS/TSX module deletion + barrels + test allow-lists; sketch b-round-461/sketch-462.patch.txt sha 59a9293f, tech-lead APPROVE); 2b-3d-2 = dead app.css/utilities.css rules and tokens (narrow byte-scoped grant), next feature round | '+sp['STORE-2b-3d']
sp['STORE-2b-3d-1']='dispatched round 462 (D-29z1631): delete ArtistBioSection, VideoShowcase, PianoLoadingAnimation, PianoCurtainLoader, CinemaCurtainLoader, audio/Timeline, lib/email.server.ts; barrels; GT1b/GT3/GT4b/GT5/GT5b/GT6, TS2, GS2, LT7 updates; production build HEAD vs sketch: server/JS equal after hash normalization, CSS -12 utilities with 0 live users (b-round-461/build-compare.txt)'
sp['STORE-2b-3d-2']='not_started (D-29z1631): dead CSS rules/tokens listed in STORE-2b-3d (incl. .loading-brand x2 now 0 consumers, A-R454-REVIEW-L1 .code-4 token, GATE453-L2-L3 inert classes); narrow grant app/styles/app.css + base/utilities.css with exact byte scope'
sp['STORE-2b-3c-2b']='reordered (D-29z1631): after 2b-3d-2, or folded into the ARCH-CHECKPOINT-STYLE-SCAN extraction if root approves it; Low/info only, not dropped | '+sp['STORE-2b-3c-2b']
b['decisions_log_b'].append({'id':'D-29z1630','date':'2026-11-12','by':NOW,'decision':'Round 461 result: C PASS (c-round-461.json C1-C10, browserVerified/realVerified true, 0 bugs; B spot-checked c-round-461/mutants/mutants.txt cmp-equal to b-round-460, covering.log 3 files/62 tests 0 Hydration failed, c8.json Studio 1440/1280 + anonymous protection, l57 OK); gate 461 published a7fa78e (review COMMIT OK 8/10). Closed A-R460-REVIEW-1/-6/-7; E11 part of A-R459-REVIEW-R8 and E8 part of TL-R459-TEST-NITS done (parents stay deferred). Gate Lows GATE461-1..3 -> deferred_low_polish; gate finding 4 (production gaps covered only by browser rows) is info, already in doc 300; gate Architecture note added to SIG-R459-ENTRANCE-HANDSHAKE (signal only). SABA-B-13 stays done for Chromium; Firefox/Safari TLM-R459-FIREFOX-SAFARI-ENTRANCE deadline RETRO 465.'})
b['decisions_log_b'].append({'id':'D-29z1631','date':'2026-11-12','by':NOW,'decision':'Round 462 = STORE-2b-3d-1 (current-task.md): delete the 7 dead Store modules (0 importers outside barrels at a7fa78e) + barrel lines + style-scan allow-list entries, via B sketch b-round-461/sketch-462.patch.txt sha 59a9293fdf6721ea (tech-lead APPROVE, 4 Lows ruled). Reorder: 2b-3d-1 before 2b-3c-2b, because 2b-3c-2b is Low/info only, would be the 4th round on helpers/style-scan.ts while ARCH-CHECKPOINT-STYLE-SCAN is unanswered, and policy forbids delaying core work for low-priority polish; 2b-3c-2b kept after 2b-3d-2. 2b-3d split into 3d-1 (modules) and 3d-2 (dead CSS). Permission: Saba legacy policy 2026-11-10 + Q6 default (questions-retro-450.md), no objection; TestimonialsSection kept (keep-list), IconButton/ChatButton kept (not in Q6). Pre-check on the sketch: tsc 0, lint 192 (HEAD 207), covering 6/77, full suite 284/4182, mutants M1-M8 RED, prod build compare: server bundle and JS equal after hash normalization, CSS loses 12 utilities with 0 live whole-token users. Regression not due (regression-last 2026-11-10; due 2026-11-13): the next planning on/after 2026-11-13 is REGRESSION-2026-11-13.'})
b['rounds'].append({'round':462,'task':'current-task.md','decision':'D-29z1631','type':'STORE-2b-3d-1: delete 7 dead Store modules (LEGACY-DEAD-STORE-COMPONENTS stage 1)','status':'dispatched','note':'baseline a7fa78e (gate 461 published); A applies b-round-461/sketch-462.patch.txt sha 59a9293f; grants = b-round-461/grants-462.txt (16 paths)'})
for r in b['rounds']:
    if r.get('round')==461: r['status']='c_pass_published (D-29z1630): C PASS, gate 461 a7fa78e'
b['current_task']='Round 462: STORE-2b-3d-1, delete the 7 dead Store modules (current-task.md, D-29z1631)'
b['version']=454
b['updated']='2026-11-12'
json.dump(b,open(p,'w'),ensure_ascii=False,indent=1)
open(M,'w').write('applied\n')
print('ok')
