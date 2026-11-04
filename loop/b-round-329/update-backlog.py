import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==288
D='2026-11-04'; ADD='2026-11-04 B round 329 -> 330 planning'
b['version']=289
b['updated']='2026-11-04 B round 329 -> 330 planning (D-29z954..D-29z961)'
b['current_task']='current-task.md (round 330, D-29z954..D-29z961; PERF-DRAG-PREVIEW stage c1 fix-up on the uncommitted round-329 tree: ArrangementProjectEndText memoised as ArrangementProjectEndTextInner + memo (C-R329-01), DP23 memo guard with positive control, DP24 loop extent (C-R329-02), doc 232 l.4 reworded; baseline dae81bf + 4-file tree)'
b['advisor_used_by_B']='yes (round 329 -> 330 planning: advisor consulted before the ruling and the sketch)'
dec=[
 ('D-29z954','Round 329 closed from evidence as FAIL: C round 329 taskStatus FAIL (browserVerified/realVerified true). Passed: CLAIMS, SOURCE-SCOPE, UNIT x3, MUTANT, END-LIVE, DRAG-NAMES, D-ROWS (+export sha), C-VIEWPORT-BOUND, G329-AUTH, DOCS. Failed: PERF bullet 2 equality only (range max 30->31, per-move 9.233->9.25; click/zoom/play +1). Gate 329 skipped; nothing published; HEAD stays dae81bf. A\'s 4-file tree is kept as the base of round 330. Stage c1 not done. Move rows measured 106.85 -> 30.383/move (record).'),
 ('D-29z955','C-R329-01 (Low, origin B spec: B asserted equality to round 328 without a perf run; L58 breach) ruled: memoise the leaf, following the file convention (function ArrangementProjectEndTextInner + const ArrangementProjectEndText = memo(...)); render-log key becomes ArrangementProjectEndTextInner (DP21 key rename, no expect removed). Rejected: accept +1 as new baseline (avoidable render on every transport render; rewrites a row to fit a result). Inline memo(function X ...) form is forbidden: the jsdom render log could not see it (b-round-329/inline-memo-attempt.txt). B sketch evidence: perf on a production build 113 non-wallclock rows equal to round 328, 36/36 asserted pass, only the 8 move record rows differ (30.367/move, max 108); browser names probe click [104,2,0] = HEAD; full vitest 3564/3564; 7 mutants red.'),
 ('D-29z956','C-R329-02 (Low, test gap) = A-R329-REVIEW-LOOP-EXTENT fixed in round 330 as DP24 (fixture/mount get optional loop param, default null). MU-OVERVIEW-NO-LOOP red on DP24.'),
 ('D-29z957','A-R329-REVIEW-VIEWPORT-BOUND (Low, jsdom test gap: no DP row covers the viewport-bound timelineSeconds branch) -> deferred_low_polish. The branch is covered in the browser by C-VIEWPORT-BOUND (round 329 PASS, re-run as a row in round 330).'),
 ('D-29z958','Doc 232 l.4: the round-329 prescribed text "C round 329 PASS" is untrue (C flagged it). Round 330 text: "**სტატუსი:** In Progress (stage c1 of a, b, c1–c5; round 330 fix-up, C verifies)". Rule for B: a prescribed doc status never pre-claims a C verdict.'),
 ('D-29z959','Signals: A-R329-ARCH-KEEP (A reviewer Architecture note: keep; state lives where it is rendered; no checkpoint trigger met). INFO-C329-FULLSCALE (20 full-scale samples in the demo export, identical at HEAD; linked to C-R178-EXPORT-CLIPS-AT-0DB) -> signal, not scheduled.'),
 ('D-29z960','Round 330 = PERF-DRAG-PREVIEW stage c1 fix-up (current-task.md). Grants: ArrangementTransport.tsx (react import + leaf), drag-preview-render.test.tsx (type import, fixture/mount loop param, DP21 key rename, DP23-DP24), doc 232. StudioWorkspace.tsx keeps its round-329 content. C re-runs every round-329 browser/perf row on the final tree (rounds 329+330 publish together). lessons.md L58 gains the C-R329-01 clause (equality-to-a-prior-run is an assert; new child of a frequently rendering parent is memoised with a parent-renders/child-0 row; no inline memo form); still 59 lines.'),
 ('D-29z961','Next after round 330: REGRESSION if planned on or after 2026-11-05 (regression-last 2026-11-02), with its recorded scope_additions; else PERF-DRAG-PREVIEW stage c2. C-R328-01 (DP20) closes on round 330 C PASS + gate publish (C round 329 already verified DP20 by unit x3 and MU-CLEAR-ANY-PREVIEW red).'),
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
pdp['status']='in_progress (D-29z954): stage a done; stage b done; stage c1 C round 329 FAIL on one perf equality clause (C-R329-01 Low; behaviour = HEAD; move 106.85 -> 30.383/move), fix-up round 330 dispatched (D-29z960); c2..c5 not started | '+pdp['status']
pdp['stage_c1_fixup_d29z955']='current-task.md round 330; sketch b-round-329/sketch/; perf b-round-329/perf-sketch-results; names b-round-329/names-sketch.json'
q=[e for e in b['post_current_stage_queue'] if e.get('id')=='STUDIO-PERFORMANCE'][0]
q['status']='in_progress (D-29z954..D-29z961): round 329 PERF-DRAG-PREVIEW stage c1 C FAIL (Low C-R329-01 only, nothing published); round 330 = stage c1 fix-up on the same tree; then REGRESSION (first round planned on/after 2026-11-05), stage c2..c5, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | '+q['status']
for f in byid.get('C-R328-01',[]):
    f['status']='DP20 verified by C round 329 (UNIT x3, MU-CLEAR-ANY-PREVIEW red); round 329 not published (C FAIL on C-R329-01); closes on round 330 C PASS + gate publish (D-29z961)'
new=[
 {'id':'C-R329-01','severity':'low','origin':'B spec (round 329 sketch assumed the leaf parent no longer renders; equality clause asserted without a perf run, L58)','title':'the non-memo ArrangementProjectEndText leaf adds one component to every ArrangementTransport render (range max 30->31, click 106->107, zoom +1, play +1)','evidence':'c-round-329/perf-rowcmp-vs-c328.txt; c-round-329/click-names-vs-head.txt','status':'fix dispatched round 330: memo leaf + DP23 (D-29z955); closes on C PASS','added':ADD},
 {'id':'C-R329-02','severity':'low','origin':'C own mutant C-MU-OVERVIEW-NO-LOOP; = A-R329-REVIEW-LOOP-EXTENT (test gap)','title':'the loop part of the overview extent is unguarded in jsdom','evidence':'c-round-329/mutants/c-summary.txt','status':'fix dispatched round 330 as DP24 (D-29z956); closes on C PASS','added':ADD},
 {'id':'A-R329-REVIEW-LOOP-EXTENT','severity':'low','origin':'A code-reviewer round 329','title':'= C-R329-02','status':'merged into C-R329-02 (D-29z956)','added':ADD},
 {'id':'A-R329-REVIEW-VIEWPORT-BOUND','severity':'low','origin':'A code-reviewer round 329','title':'no jsdom DP row covers the viewport-bound timelineSeconds branch (clientWidth 0, fake ResizeObserver)','evidence':'a-round-329.md; browser coverage c-round-329/vp/vp-summary.txt','status':'deferred_low_polish (D-29z957); browser row C-VIEWPORT-BOUND runs in round 330','added':ADD},
 {'id':'INFO-C329-FULLSCALE','severity':'info','origin':'C round 329','title':'demo export WAV has 20 full-scale 24-bit samples, identical at HEAD','evidence':'c-round-329/wavcheck.txt','status':'signal (D-29z959), linked to C-R178-EXPORT-CLIPS-AT-0DB; not scheduled','added':ADD},
]
b['open_findings'].extend(new)
b['deferred_low_polish'].append(dict(new[3]))
b['architecture_signals'].append({'id':'A-R329-ARCH-KEEP','origin':'A code-reviewer round 329 (architecture note)','note':'signal 2 (ownership moved): extent and project-end readout now live in the overview wrapper and ArrangementProjectEndText. Verdict keep: state lives where it is rendered; no state/effect/lifecycle added. Lanes reading timeline width from a store stays a recorded candidate','status':'signal (D-29z959); no checkpoint trigger','added':ADD})
b['rounds'][-1]['status']='C FAIL (C-R329-01 Low, PERF equality clause only; behaviour = HEAD); gate 329 skipped; tree kept for fix-up round 330 (D-29z954)'
b['rounds'][-1]['task']='tasks/round-329.md'
b['rounds'].append({'round':330,'task':'current-task.md','decision':'D-29z954..D-29z961','type':'PERF-DRAG-PREVIEW stage c1 fix-up (C-R329-01/02)','status':'dispatched','note':'baseline dae81bf + round-329 tree (4 entries); claims b-round-329/claims-330.sh','added':ADD})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
