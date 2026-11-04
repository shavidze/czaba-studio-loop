import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==286
D='2026-11-04'; ADD='2026-11-04 B round 327 -> 328 planning'
b['version']=287
b['updated']='2026-11-04 B round 327 -> 328 planning (D-29z937..D-29z944)'
b['current_task']='current-task.md (round 328, D-29z937..D-29z944; PERF-DRAG-PREVIEW stage b fix-up on the uncommitted round-327 tree: flushStatusPreview no longer clears the status-preview store synchronously (adopt once per preview sequence; a provider layout effect clears an adopted preview after the commit) + previewStatus skips a same-text write when the store is empty (C-R327-01 Medium, C-R327-02 Low, A-R327-REVIEW-SAME-TEXT-REMOUNT); DP17-DP19; baseline 234ccdd + 11-entry tree)'
b['advisor_used_by_B']='yes (round 327 -> 328 planning: advisor consulted before the ruling and the sketch)'
dec=[
 ('D-29z937','Round 327 closed from evidence as FAIL: C round 327 taskStatus FAIL (browserVerified/realVerified true; 13 rows PASS incl. PERF fade 21.633/22/0 and all B-FADE-* at both viewports) on C-R327-01 (Medium). Gate 327 skipped ("C taskStatus FAIL"); nothing published; baseline HEAD stays 234ccdd (gate 326). A\'s 11-entry uncommitted tree is kept and is the base of round 328 (no revert, no re-apply). PERF-DRAG-PREVIEW stays in_progress; stage b is not done.'),
 ('D-29z938','Ruling on A\'s STOP A-R327-REVIEW-SAME-TEXT-REMOUNT together with C-R327-01/02 (same trigger, same root: B sketch v3 §1.2.3 clears the store inside flushStatusPreview, a uSES sync re-render, while the adoptPreview dispatch is still pending in the default lane; origin B spec). A\'s option (b) alone is rejected (covers only 02). Contract: flush never writes the store; it adopts each preview sequence once (adoptedPreviewSequenceRef) and dispatches adoptPreview; a provider layout effect on statusEntry clears the store when the stored preview sequence <= the adopted one (a newer preview is kept); previewStatus skips showPreview when the store is empty and the text equals the committed status text (committedStatusTextRef, set in the existing status layout effect) = HEAD\'s gestureActive same-text rule. StudioWorkspace footer unchanged. Not chosen now: moving the committed status into the store (A\'s architecture note) -> checkpoint addendum to D-29z915; flushSync (stop effect calls setStatus from an effect).'),
 ('D-29z939','B sketch (b-round-327/sketch/sketch.patch.txt on A\'s tree, 2 files): browser C probe probe-settle-remount.mjs on the sketch = HEAD at both viewports (settle: 0 mutations, same node; same-value move: 0 mutations, same node; next move and release equal HEAD); control on A\'s tree reproduces both findings. New probe probe-refusal-mid-drag.mjs (Delete mid-drag -> refusal, then move, release): sketch == HEAD at both viewports. Full vitest 3559/3559 and typecheck rc 0 on the sketch. jsdom: DP17 (same-text write then same-value move keeps the node), DP18 (timer same-text updater: 0 mutations), DP19 (two writes in one batch adopt once); all three pass on a HEAD copy (getter asserts removed). Mutants: MU-NO-SAME-TEXT-GUARD red DP17; MU-READOPT red DP19; MU-NO-LAYOUT-CLEAR red DP9a,12,14,15,16,17,18,19; MU-SYNC-CLEAR (the C-R327-01 bug) stays GREEN in jsdom -> its row is browser-only (C probe), recorded honestly.'),
 ('D-29z940','Reviewer finding 3 (settle writes lastNonRefusalStatusRef before setStatus; flush overwrites it) -> A-R327-REVIEW-SETTLE-ORDER, Low, deferred_low_polish; any later fix must keep the settle -> flush order. Reviewer finding 4 (previewStatus optional prop) -> closed, ruled by tasks/round-327.md §1.3.'),
 ('D-29z941','INFO-C327-ALT-CLICK-MARKER -> SIG-R327-NOBPM-RULER-CLICK (signal): in a no-BPM (SFX-only) project the bars ruler renders 20 px and Alt-click on it did not move the insert marker (A and HEAD alike). Not ruled a bug; the REGRESSION round (due >= 2026-11-05) adds one probe against the SABA-B-11a no-BPM ruler contract. INFO-C327-RELEASE-2ND-COMMIT -> SIG-R327-HARNESS-PER-COMMIT (harness reports only the release max; per-commit component counts would make the 0-component second commit measurable); PERF harness candidate, not scheduled.'),
 ('D-29z942','A\'s architecture note round 327 (signal 4: fourth per-provider store + an ordering rule in ArrangementContext.tsx; proposal: committed status entry inside the status store so footer and getter read one source) -> A-R327-ARCH-STATUS-ONE-SOURCE, added to the open checkpoint D-29z915 via b-round-327-checkpoint-addendum.md. Non-blocking; stage c does not wait.'),
 ('D-29z943','Round 328 = PERF-DRAG-PREVIEW stage b fix-up (current-task.md). Grants: ArrangementContext.tsx (the status-preview block only), drag-preview-render.test.tsx (DP17-DP19 appended), doc 232 (stage-b sections + one problem/solution entry; l.4 -> In Progress (stage 2 of 3; C round 328 PASS)). Chain: chainHeadGateRunGreen applies. Lesson candidate (RETRO owns lessons.md): a status/announcement change that moves a write between a store and a reducer gets a browser async-writer probe in B\'s sketch before dispatch (jsdom cannot reproduce the lane split).'),
 ('D-29z944','Next after round 328: REGRESSION (regression-last 2026-11-02; due on or after 2026-11-05) if planned then, carrying C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION and SIG-R327-NOBPM-RULER-CLICK; else PERF-DRAG-PREVIEW stage c. regression-last.json unchanged.'),
]
for i,t in dec: b['decisions_log_b'].append({'id':i,'date':D,'text':t})
def walk(o):
    if isinstance(o,dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
byid={}
for o in walk(b):
    if 'id' in o and isinstance(o['id'],str): byid.setdefault(o['id'],[]).append(o)
pdp=byid['PERF-DRAG-PREVIEW'][0]
pdp['status']='in_progress (D-29z937): stage a done; stage b C round 327 FAIL on C-R327-01 (Medium), fix-up round 328 dispatched (D-29z943); not done | '+pdp['status']
pdp['stage_b_fixup_d29z938']='current-task.md round 328; sketch b-round-327/sketch/; probes b-round-327/probe-*.mjs'
new_findings=[
 {'id':'C-R327-01','severity':'medium','origin':'B sketch design (tasks/round-327.md §1.2.3 flush-then-dispatch), applied verbatim by A; A code-reviewer finding 1','title':'collection settle mid fade drag swaps the stale pre-drag sentence into the aria-live status for ~6 ms, then re-adds the fade text as a new span','evidence':'c-round-327.json; c-round-327/probe-settle-{a,head}.json; b-round-327/probe-settle-atree.json (control repro)','status':'open -> fix-up round 328 (D-29z938)','added':ADD},
 {'id':'C-R327-02','severity':'low','origin':'B sketch design (§1.1/§1.2.4); = A-R327-REVIEW-SAME-TEXT-REMOUNT','title':'after a same-text committed write mid fade drag, a same-value move remounts the status span','evidence':'c-round-327/probe-settle-a.json afterSameValueMove; a-round-327/probe/zz-a.log','status':'open -> fixed with C-R327-01 in round 328 (same root; owned code, low cost)','added':ADD},
 {'id':'A-R327-REVIEW-SAME-TEXT-REMOUNT','severity':'low','origin':'A code-reviewer round 327 finding 2','title':'= C-R327-02','status':'ruled (D-29z938): merged into C-R327-02; A STOP answered','added':ADD},
 {'id':'A-R327-REVIEW-SETTLE-ORDER','severity':'low','origin':'A code-reviewer round 327 finding 3','title':'settle writes lastNonRefusalStatusRef before setStatus and the flush overwrites it; outcome equals HEAD but depends on ordering','status':'deferred_low_polish (D-29z940); a later fix must keep the settle -> flush order','added':ADD},
 {'id':'SIG-R327-NOBPM-RULER-CLICK','severity':'info','origin':'C round 327 INFO-C327-ALT-CLICK-MARKER','title':'no-BPM project: Alt-click on the 20 px bars ruler did not move the insert marker (A and HEAD)','status':'signal (D-29z941): one probe in the next REGRESSION round against the SABA-B-11a contract','added':ADD},
 {'id':'SIG-R327-HARNESS-PER-COMMIT','severity':'info','origin':'C round 327 INFO-C327-RELEASE-2ND-COMMIT','title':'perf harness reports only the release max components; per-commit counts would measure the second stopped release commit','status':'signal (D-29z941); not scheduled','added':ADD},
]
b['open_findings'].extend(new_findings)
b['deferred_low_polish'].append(dict(new_findings[3]))
b['architecture_signals'].append({'id':'A-R327-ARCH-STATUS-ONE-SOURCE','origin':'A code-reviewer round 327 (architecture note)','note':'signal 4 at ArrangementContext.tsx (fourth per-provider store and an ordering rule between it and the status reducer); signal 3 (docs 168/232 keep reshaping the status region). Reviewer verdict keep; proposal: move the committed status entry into the status store so footer and getter read one source','status':'signal (D-29z942) -> b-round-327-checkpoint-addendum.md (D-29z915); not scheduled','added':ADD})
b['rounds'][-1]['status']='C FAIL (C-R327-01 Medium); gate 327 skipped; tree kept for fix-up round 328 (D-29z937)'
b['rounds'][-1]['task']='tasks/round-327.md'
b['rounds'].append({'round':328,'task':'current-task.md','decision':'D-29z937..D-29z944','type':'PERF-DRAG-PREVIEW stage b fix-up (C-R327-01/02)','status':'dispatched','note':'baseline 234ccdd + round-327 tree (11 entries); claims b-round-327/claims-328.sh','added':ADD})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
