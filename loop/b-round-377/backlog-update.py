import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==342, b['version']
D='2026-11-07'; BY='B round 377 -> 378 planning'
of=b['open_findings']; ids={f.get('id'):f for f in of}
def add(f, deferred=False):
    assert f['id'] not in ids, f['id']
    f.setdefault('added', D+' '+BY); of.append(f); ids[f['id']]=f
    if deferred: b['deferred_low_polish'].append(dict(f))
q=b['post_current_stage_queue'][7]; st={s['id']:s for s in q['stages']}
st['PERF-11c-iii-c1']['status']='done (D-29z1254): C round 377 PASS (c-round-377.json: 16 rows passed incl. RB-LEAF4b browser row, browserVerified true, realVerified true, 0 bugs; fake-bearer 500 blocked = backend-only); gate 377 published 79ed8a9 (rounds 376-377) | '+st['PERF-11c-iii-c1']['status']
ids['A-R376-REVIEW-M1-EDIT-IDENTITY-ROW']['status']='closed (D-29z1254): RB-LEAF4b + MU-T-UNDO-FRESH-PER-EDIT red only on RB-LEAF4b (C round 377 MUTANTS-TREE 11/11; browser Master Mute twice equal HEAD); gate 377 79ed8a9 | '+ids['A-R376-REVIEW-M1-EDIT-IDENTITY-ROW']['status']
for dl in b['deferred_low_polish']:
    if dl.get('id')=='A-R376-REVIEW-L1-RAF-UNARMED':
        dl['status']=dl.get('status','')+' | D-29z1255: gate 377 reviewer finding 2 is the same item (rAF scheduled when handoffRef is null; optional fix: schedule only when armed); not filed twice (L7)'
ids['A-R376-REVIEW-L1-RAF-UNARMED']['status']=ids['A-R376-REVIEW-L1-RAF-UNARMED'].get('status','')+' | D-29z1255: = gate 377 reviewer finding 2 (not filed twice)'
add({'id':'GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO','severity':'low','origin':'gate 377 reviewer finding 1','title':'the one-frame hand-off expiry assumption (no startTransition/useTransition/useDeferredValue on the Undo/Redo/Delete/Zoom-back path) is guarded only by the loop claim K5, not by an in-repo test','evidence':'gates/round-377/review.md finding 1; A-R376-REVIEW-M2; b-round-376/claims-377.sh K5','repro':"grep -nE 'startTransition|useTransition|useDeferredValue' app/components/arrangement/ArrangementTransport.tsx app/components/arrangement/StudioWorkspace.tsx app/contexts/ArrangementContext.tsx (0 hits today)",'status':'deferred_low_polish (D-29z1255): reviewer fix = a text-scan test forbidding the three APIs in the three files (or a TODO context comment); not c2a code; every PERF task touching these files repeats the K5 claim until then'}, deferred=True)
for i,t,e in (('INFO-C377-FIT-RING-WORDING','TRANSPORT-BROWSER (f) asked for a visible ring on Fit after a mouse path; the SABA-B-4 rule draws the ring on :focus-visible only (keyboard path: 1 px brass, offset 2 px, equal HEAD)','c-round-377.md addenda; c-round-377/ring.json'),
              ('INFO-C377-RUNALL-RESTORE-PATH','b-round-375/mutants/run-all-376.sh prints restore-check rc 1 because it looks for sketch-files-sha256.txt beside TREE\'s parent; not a dirty tree','c-round-377.md addenda; c-round-377/mutants-summary.txt'),
              ('INFO-C377-RANGE-DRAG-ON-BODY','a range drag that starts on a clip body makes no time selection (by design); browser recipes drag on the lane background','c-round-377.json notes')):
    add({'id':i,'severity':'info','origin':'C round 377 notes','title':t,'evidence':e,'status':'info (D-29z1255): recipe wording fixed in later tasks (keyboard path for rings; lane-background range drags); not a bug'})
b['architecture_signals'].append({'id':'SIG-R377-RENDER-COUNT-CONSTANTS','origin':'gate 377 reviewer architecture note (signal 3)','note':'the transport region was touched in rounds 375-377, each needing render-budget rows, counter-name renames and mutants; proposal: move render-count constants (TRANSPORT_LEAVES, TRANSPORT_STEP_COUNTS and the names in drag-preview-render / selection-wrappers-render) into one shared test helper so a rename changes one place. Signal 4 (useSoftDisableFocusHandoff lifecycle in ArrangementTransport): keep. Input to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING; not scheduled','added':D+' '+BY})
for r in b['architecture_checkpoint_requests']:
    if r.get('id')=='ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING':
        r.setdefault('inputs',[]).append('D-29z1255: SIG-R377-RENDER-COUNT-CONSTANTS (fifth echo, gate 377); still no root answer at round 377 planning; c2a (LoopBrace, round 378) continues pattern A; c2b/d/e: c2b may continue pattern A, d/e wait for the answer or RETRO 384; request restated in b-round-377.md')
# split c2
i=[s['id'] for s in q['stages']].index('PERF-11c-iii-c2')
st['PERF-11c-iii-c2']['status']='split (D-29z1256): c2a (ArrangementLoopBrace, round 378) and c2b (ArrangementMarkerRow: forwardRef + imperative handle + editor focus hand-offs, L47/L50 rows; after REGRESSION) | '+st['PERF-11c-iii-c2']['status']
st['PERF-11c-iii-c2']['substages_d29z1256']=['PERF-11c-iii-c2a','PERF-11c-iii-c2b']
q['stages'].insert(i+1,{'id':'PERF-11c-iii-c2a','what':'ArrangementLoopBraceView = memo(ArrangementLoopBraceViewInner) with props loop (arrangement.loop) + seconds/pxPerSecond/snapSeconds/gridSeconds + actions (useArrangementLoopBraceActions: Pick of getArrangement, previewLoopArrangement, commitLoopRange, stepLoopRange, claimPointerGesture); wrapper ArrangementLoopBrace keeps its signature; StudioWorkspace renders the view; row RB-LEAF5; mutants MU-LB-NO-MEMO, MU-LB-ACTIONS-FRESH, MU-LB-SITE-REVERT','status':'dispatched round 378 (D-29z1256)','premise':'c-round-377/leaf-A.json (HEAD 79ed8a9 tree, both viewports): ArrangementLoopBrace renders on every StudioWorkspace commit (add 3, zoom 1, mute 1, undo 1, Undo/Redo buttons 1, preview start 1/stop 2)','sketch':'b-round-377/sketch.patch.txt (sha in b-round-377/sketch-dispatched.sha256); full suite 252/3724','added':D+' '+BY})
q['stages'].insert(i+2,{'id':'PERF-11c-iii-c2b','what':'ArrangementMarkerRow leaf (946-line forwardRef with imperative handle, editor state, focus hand-offs; L47/L50 focus-origin rows); pattern A unless ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING rules otherwise; premise c-round-377/leaf-A.json (renders on every workspace commit)','status':'not started (after REGRESSION-2026-11-08)','added':D+' '+BY})
st['PERF-11c-iii']['status']='in_progress (D-29z1256): a, b, c1 done (gates 374 ad13a96, 375 6b11be7, 377 79ed8a9); c2 split into c2a (round 378: LoopBrace) and c2b (MarkerRow, after REGRESSION); d/e wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING or RETRO 384 | '+st['PERF-11c-iii']['status']
st['PERF-11c-iii']['substages_d29z1256']=['PERF-11c-iii-a','PERF-11c-iii-b','PERF-11c-iii-c1','PERF-11c-iii-c2a','PERF-11c-iii-c2b','PERF-11c-iii-d','PERF-11c-iii-e']
q['status']='in_progress (D-29z1256): PERF-11c-iii-c1 done (C round 377 PASS, gate 377 79ed8a9); round 378 = PERF-11c-iii-c2a (LoopBrace); then REGRESSION (due at the first planning on/after 2026-11-08), c2b, d/e | '+q['status']
for r in b['rounds']:
    if r.get('round')==377: r['status']='done (D-29z1254): C PASS (browserVerified true, 0 bugs); gate 377 published 79ed8a9 (rounds 376-377)'
b['rounds'].append({'round':378,'task':'current-task.md','decision':'D-29z1254..D-29z1257','type':'PERF-11c-iii-c2a: LoopBrace leaf (memo view + actions hook), row RB-LEAF5, 3 mutants; C unit/mutants/perf/leaf probe/loop browser rows/auth/smoke','status':'dispatched','note':'baseline 79ed8a9 (gate 377); claims b-round-377/claims-378.sh','added':D+' '+BY})
b['current_task']='current-task.md (round 378: PERF-11c-iii-c2a LoopBrace leaf; sketch b-round-377/sketch.patch.txt)'
b['decisions_log_b'].extend([
 {'id':'D-29z1254','date':D,'by':BY,'decision':'Round 377 accepted from evidence: C PASS (c-round-377.json, 16 rows, browserVerified/realVerified true, 0 bugs; L57 check OK, b-round-377/l57-check-c377.txt); gate 377 published 79ed8a9 on both remotes (verify 252 files / 3723 tests). PERF-11c-iii-c1 done; A-R376-REVIEW-M1 closed. Baseline for round 378 = 79ed8a9; store tree clean. tasks/round-377.md archived (byte copy, sha 6895798c...)'},
 {'id':'D-29z1255','date':D,'by':BY,'decision':'Gate 377 review (COMMIT OK, Lows only): finding 1 -> GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO (deferred Low); finding 2 = A-R376-REVIEW-L1-RAF-UNARMED (already deferred, not filed twice, L7); architecture signal 3 -> SIG-R377-RENDER-COUNT-CONSTANTS (fifth echo to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, request restated); signal 4 keep. C notes -> INFO-C377-FIT-RING-WORDING, INFO-C377-RUNALL-RESTORE-PATH, INFO-C377-RANGE-DRAG-ON-BODY. docs In Progress (stage: 232 (PERF-DRAG-PREVIEW open) and 238 (PERF-11c group header, open stages) are tied to open backlog stages (L28)'},
 {'id':'D-29z1256','date':D,'by':BY,'decision':'REGRESSION not due: regression-last 2026-11-05, planning date 2026-11-07 = 2 days (< 3); due at the first planning on/after 2026-11-08. PERF-11c-iii-c2 split (scope unchanged): c2a LoopBrace (277 lines, 5 callbacks + arrangement.loop) = round 378; c2b MarkerRow (946-line forwardRef, imperative handle, editor focus) after REGRESSION. c2a sketch b-round-377/sketch.patch.txt: tsc 0, Biome clean, full suite 252/3724, RB-LEAF5, mutants MU-LB-NO-MEMO / MU-LB-ACTIONS-FRESH / MU-LB-SITE-REVERT red only on RB-LEAF5'},
 {'id':'D-29z1257','date':D,'by':BY,'decision':'Order after round 378: REGRESSION-2026-11-08 at the first planning on/after 2026-11-08, then PERF-11c-iii-c2b, d/e (wait for the checkpoint or RETRO 384), PERF-11b, PERF-12..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries under the skip rule. lessons.md unchanged (60 lines; no Saba-reported issue this round). Not applicable: reference-first, product-designer, YouTube, screen budget (invisible perf refactor). Advisor available and consulted'},
])
adv=b['advisor_used_by_B']
b['advisor_used_by_B']='yes (round 377 -> 378 planning: advisor available; consulted after orientation and before declaring done) | '+adv if isinstance(adv,str) else adv
b['version']=343; b['updated']=D+' '+BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok', b['version'])
