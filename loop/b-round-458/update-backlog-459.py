# B round 458 -> 459 backlog update (D-29z1624, D-29z1625). Idempotent guard: b-round-458/update-backlog-459.done
import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; P=L+'/backlog.json'; DONE=L+'/b-round-458/update-backlog-459.done'
if os.path.exists(DONE): sys.exit('already applied')
b=json.load(open(P))
BY='2026-11-12 B round 458 -> 459 planning'
assert b['version']==450, b['version']
b['version']=451; b['updated']='2026-11-12'
b['current_task']='Round 459: SABA-B-13 STORE-2b-ENTRANCE, head cover + minimum entrance time (current-task.md, D-29z1625)'
def pre(entry, key, text):
    old=entry.get(key); entry[key]=text+(' | '+old if old else '')
EV458='C round 458 PASS (c-round-458.json: C1-C10 PASS, C4 covering 4 files/28 tests LT1-LT10 GS1-4 GT1-5b TS1-6, C5 mutants 42 lines cmp-equal 40 RED, C8/C8b walker class + limit forms, C9 docs; browserVerified/realVerified true); gate 458 published 891dc0f (verify green, review COMMIT OK 8/10)'
# rounds
for r in b['rounds']:
    if r.get('round')==458: r['status']='done (D-29z1624): '+EV458
b['rounds'].append({'round':459,'task':'current-task.md','decision':'D-29z1625','type':'SABA-B-13 STORE-2b-ENTRANCE: head cover (black first frame) + 1450 ms minimum entrance, CSS failsafe, skip before hydration','status':'dispatched','note':'baseline 891dc0f (gate 458 commit); sketch b-round-458/sketch-459.patch.txt sha f499b724 (tech-lead APPROVE review 2); grants b-round-458/grants-459.txt (5, incl. narrow root.tsx 2 lines)'})
# queue
q=[x for x in b['post_current_stage_queue'] if isinstance(x,dict) and x.get('id')=='STORE-REDESIGN'][0]
pre(q,'status','in_progress (D-29z1625): round 459 = SABA-B-13 STORE-2b-ENTRANCE; then REGRESSION-2026-11-13 if planned on/after 11-13, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5')
sp=None
for st in q['stages']:
    if isinstance(st,dict) and 'split_2b_d29z1583' in st: sp=st['split_2b_d29z1583']
assert sp is not None
sp['STORE-2b-3c-2a']='done (D-29z1624): '+EV458
pre(sp,'STORE-2b-3c-2','split (D-29z1624): 2a done (round 458, gate 458 891dc0f); 2b after SABA-B-13')
pre(sp,'STORE-2b-ENTRANCE','dispatched round 459 (D-29z1625): head cover via narrow root.tsx grant (2 lines), EntranceCover.tsx, SpotlightLoader start-anchored timeline (min 1450, cap 1900, failsafe 1000), product-designer consult b-round-458/pd-consult.md, reference Android SplashScreen, prod-build frame probe b-round-458/probe/matrix')
# findings
closed_of=['A-R457-REVIEW-M1','A-R456-REVIEW-M1','A-R454-REVIEW-M-DEAD-UNCHECKED']
closed_dl=['TL-R454-L-BRACE-PREFIX-HEADER','A-R454-REVIEW-L3','A-R454-REVIEW-L4','A-R453-REVIEW-L-GS-TEST-GAPS','B-R455-DOC298-STATUS-LINE']
n=0
for f in b['open_findings']:
    if isinstance(f,dict) and f.get('id') in closed_of:
        pre(f,'status','closed (D-29z1624): fixed in rounds 456-458 (walker + LT7-LT10); '+EV458); n+=1
    if isinstance(f,dict) and f.get('id')=='SABA-B-13':
        pre(f,'status','dispatched (D-29z1625): round 459; done only after C round 459 PASS with browser frame rows (C5-C10)')
    if isinstance(f,dict) and f.get('id')=='SABA-Q-ENTRANCE-RELOAD':
        f['note_d29z1625']='round 459 keeps default (a) as the one-line sessionGate in EntranceCover.tsx; Saba re-told to verify in a fresh tab (user-review/questions-saba-b-13.md addendum)'
assert n==3, n
m=0
for f in b['deferred_low_polish']:
    if isinstance(f,dict) and f.get('id') in closed_dl:
        pre(f,'status','closed (D-29z1624): fixed by the round-456 sketch, carried and published in round 458; '+EV458); m+=1
    if isinstance(f,dict) and f.get('id')=='TL-R458-L1':
        f['confirmedBy']='C round 458 C-R458-L1 (NWF-1 replay, c-round-458/nwf-replay.txt; count 1 in animations/index.ts with no hazard chars, 0 in other forms) and A round 458 code-reviewer NWF-1'
    if isinstance(f,dict) and f.get('id')=='TL-R458-L4':
        f['confirmedBy']='C round 458 C-R458-L2 + A round 458 reviewer item 5: the "fails closed" wording was wrong (leading _ rejection is fail-open), count 0'
assert m==5, m
NEWQ=[
 {'id':'SABA-Q-ENTRANCE-WORDMARK','severity':'info','origin':'product-designer consult (b-round-458/pd-consult.md)','status':'awaiting_user (D-29z1625): non-blocking; default no static wordmark on the pre-hydration cover','title':'Static CZABA wordmark on the black cover before hydration?','evidence':'user-review/questions-saba-b-13.md addendum 2026-11-12','added':BY},
 {'id':'SABA-Q-ENTRANCE-ARRIVE','severity':'info','origin':'product-designer consult','status':'awaiting_user (D-29z1625): non-blocking; default HEAD behaviour (plays once per tab when / is first reached by in-app navigation); product-designer would drop it','title':'Play the entrance when / is first reached by in-app navigation from another page?','evidence':'user-review/questions-saba-b-13.md addendum; probe mode arrive (b-round-458/probe/matrix)','added':BY},
 {'id':'SABA-Q-ENTRANCE-HERO','severity':'info','origin':'product-designer consult','status':'awaiting_user (D-29z1625): non-blocking; default leave hero animations as they are','title':'Hero stagger animations finish under the entrance cover; delay them until the cover lifts?','evidence':'app/components/home/HeroSection.tsx (product-designer reading); user-review/questions-saba-b-13.md addendum','added':BY},
]
b['open_findings'].extend(NEWQ)
NEWL=[
 {'id':'C-R458-L2','severity':'low','origin':'B spec','confirmedBy':'A round 458 code-reviewer items 2 and 5','status':'deferred_low_polish (D-29z1624); owner ARCH-CHECKPOINT-STYLE-SCAN follow-up or the polish pass','title':'TL-R458-L4/L1 task wording inaccurate; style-scan.ts namespaceReExports(stringAware) and the form| key have no mutant','evidence':'c-round-458.json bugs[1]; a-round-458.md review items 2, 5','added':BY},
 {'id':'GATE458-L1','severity':'low','origin':'gate reviewer (gates/round-458/review.md item 1)','status':'deferred_low_polish (D-29z1624)','title':'store-live-teal.test.ts: no blank line between the LT9 it() and LT10','evidence':'gates/round-458/review.md','added':BY},
 {'id':'GATE458-L2','severity':'low','origin':'gate reviewer item 2','status':'deferred_low_polish (D-29z1624)','title':'LT7 and LT9 each call appScriptSources() (app scripts read twice); memoise','evidence':'gates/round-458/review.md','added':BY},
 {'id':'GATE458-L3','severity':'low','origin':'gate reviewer item 3','status':'deferred_low_polish (D-29z1624)','title':'cssRuleBlocks silently drops an unclosed { at EOF; add an empty-stack assertion','evidence':'gates/round-458/review.md','added':BY},
 {'id':'GATE458-I4','severity':'info','origin':'gate reviewer item 4','status':'deferred_low_polish (D-29z1624)','title':'deadRuleText key.split(" ")[0] assumes no spaces in paths (true today)','evidence':'gates/round-458/review.md','added':BY},
 {'id':'TL-R459-COLOR-BLACK-DEP','severity':'low','origin':'tech-lead review 1 of sketch-459','status':'deferred_low_polish (D-29z1625); applies after round 459 lands; C12 reads the computed colour','title':'cover CSS var(--color-black) is emitted only because a utility uses bg-black; if that goes the cover turns transparent','evidence':'b-round-458/sketch-review.md','added':BY},
 {'id':'TL-R459-EXPIRED-CUT','severity':'low','origin':'tech-lead review 2','status':'deferred_low_polish (D-29z1625); applies after round 459 lands','title':'expired path turns the cover off mid CSS fade (cut instead of fade); cosmetic','evidence':'b-round-458/sketch-review.md','added':BY},
 {'id':'TL-R459-TEST-NITS','severity':'low','origin':'tech-lead review 2','status':'deferred_low_polish (D-29z1625); applies after round 459 lands','title':'E2 Number.isFinite line always passes (next line asserts non-null); redundant let notPrevented in E8','evidence':'b-round-458/sketch-review.md','added':BY},
]
for f in b['deferred_low_polish']:
    if isinstance(f,dict) and f.get('id')=='TL-R455-WALKER-LIMITS':
        f['confirmedBy_gate458']='gate 458 reviewer item 5 (AudioPreviewButton aliased import not caught; already tracked here)'
b['deferred_low_polish'].extend(NEWL)
b['tech_lead_manual_checks'].append({'id':'TLM-R459-FIREFOX-SAFARI-ENTRANCE','added':BY,'status':'open (after round 459 C PASS)','deadline':'RETRO 465','steps':'Firefox and Safari desktop, NEW tab on /: first frame black (no header flash), entrance ~1.5 s, Esc skips; same-tab reload shows no entrance; reduced motion shows none','why':'no Firefox/WebKit on the cloud runner; body::before + style media toggle and first-paint timing unverified there'})
b['architecture_signals'].append({'id':'SIG-R458-STYLE-SCAN-SPLIT','added':BY,'source':'gate 458 reviewer + A round 458 code-reviewer Architecture notes','status':'signal (D-29z1624)','note':'style-scan.ts holds three subsystems (glow/teal regexes, CSS rule reader, mount walker). Keep for now; extract css-rules.ts + mount-graph.ts (style-scan re-exports) only when 2b-3c-2b adds more glow-regex forms; acceptance = covering set + mutants unchanged. Feeds ARCH-CHECKPOINT-STYLE-SCAN (root, non-blocking).'})
b['narrow_grants'].append({'round':459,'decision':'D-29z1625','path':'app/root.tsx','scope':'exactly 2 added lines: import { EntranceCoverHead } from ~/components/loading/EntranceCover; <EntranceCoverHead /> directly after <Links />','justification':'SABA-B-13: once-per-tab cover must be decided by JS in <head> before first paint; route content is inside PageTransition (SSR opacity 0); tech-lead: smallest choice (b-round-458/sketch-review.md)'})
b['decisions_log_b'].append({'id':'D-29z1624','date':'2026-11-12','by':BY,'decision':'Round 458 closed from C evidence: '+EV458+'. Closed A-R457-REVIEW-M1, A-R456-REVIEW-M1, A-R454-REVIEW-M-DEAD-UNCHECKED and riders TL-R454-L-BRACE-PREFIX-HEADER, A-R454-REVIEW-L3/L4, A-R453-REVIEW-L-GS-TEST-GAPS, B-R455-DOC298-STATUS-LINE; STORE-2b-3c-2a done. C-R458-L1 recorded as confirmedBy on TL-R458-L1 (L7); C-R458-L2 deferred; gate reviewer Lows GATE458-L1..L3, I4 deferred; SIG-R458-STYLE-SCAN-SPLIT recorded (not scheduled).'})
b['decisions_log_b'].append({'id':'D-29z1625','date':'2026-11-12','by':BY,'decision':'Round 459 = SABA-B-13 (STORE-2b-ENTRANCE). B measured HEAD prod: page paints 140-380 ms before the overlay; tagline legible 138-172 ms. Route-local cover rejected (PageTransition SSR opacity 0; route-local sketch still flashed ~45 ms). Fix: head <style media=not all> body::before cover + boot script (path /, not reduced motion, once per tab), narrow root.tsx grant (2 lines), SpotlightLoader start-anchored timeline min 1450 / cap 1900, CSS failsafe 1000 ms, skip before hydration, client-nav fallback = HEAD behaviour. product-designer consult (pd-consult.md); tech-lead REQUEST CHANGES then APPROVE on f499b724. Rulings: L3 1200 -> 1450/1900 (Saba minimum supersedes D10), Tailwind exception for the cover CSS string, Biome +2 warnings. Lesson L18 gains the first-painted-frame clause (lessons-before-459.md kept). Saba questions SABA-Q-ENTRANCE-WORDMARK/ARRIVE/HERO recorded awaiting_user (defaults kept).'})
open(P,'w',encoding='utf-8').write(json.dumps(b,indent=2,ensure_ascii=True))
open(DONE,'w').write('applied\n'); print('ok', b['version'])
