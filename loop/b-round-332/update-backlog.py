import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==291
T='2026-11-04 B round 332 -> 333 planning'
b['version']=292
b['updated']=T+' (D-29z984..D-29z994)'
b['current_task']=('current-task.md (round 333, D-29z984..D-29z994; PERF-DRAG-PREVIEW stage c2b-ii on de28cca: ArrangementDetailPanel.tsx '
  'layout effect -> render-time sentinel (DetailRangeTextSource, isSameDetailRangeTextSource, detailRangeTexts; seeded initial state); '
  'DP33-DP42; doc 232; sketch b-round-332/sketch/sketch.patch.txt)')
D=[
 ('D-29z984','Round 332 closed as PASS from C evidence: c-round-332.json taskStatus PASS, browserVerified/realVerified true, 11 rows, 0 bugs; gate 332 published de28cca on both remotes (review 9/10). PERF-DRAG-PREVIEW stage c2b-i -> done (fade 10.817/move max 11 measured by C, equal to B sketch). GATE331-S2 and GATE331-S3 closed (fixed round 332; C DOCS and UNIT rows). GATE331-S1 closed as ruled (D-29z975, hand-written equalities kept; doc 232 item 27).'),
 ('D-29z985','A round 332 edited doc 232 l.5 (adds ArrangementTrackMeter.tsx to the project header) beyond task section 1.3; accepted: it fixes a reviewer Low and C DOCS passed.'),
 ('D-29z986','A-R332-REVIEW-OVERVIEW-PROP-TYPE (latent Medium per A reviewer) re-rated to info signal SIG-R332-OVERVIEW-PICK, same reasoning as D-29z973: C found 0 overview diffs at 23 samples/viewport incl. fade-then-undo/add/delete; the gate 332 reviewer independently traced that the overview reads only the shown set and reads loop from the committed prop. Folded into checkpoint D-29z915 scope (Pick projection with ARCH-R331-PREVIEW-READERS). L46 deadline: RETRO 336. Does not hold the Medium gate. A reviewer Low "no loop-toggle row during the stabilised hold" -> named row in REGRESSION-ROUND-2026-11-05 scope_additions (L6); the other A-332 Lows -> deferred_low_polish A-R332-REVIEW-LOWS.'),
 ('D-29z987','Gate 332 review: suggestion 1 (heldRef written during render in useEqualityStableSelector) -> info signal GATE332-S1-HELDREF-RENDER, accepted as is (held values only compared, at most one extra render; zustand useShallow pattern). Suggestion 2 = GATE331-S1 (already ruled). 3-5 need no action. Architecture note (signal 3/4) -> evidence on ARCH-R331-PREVIEW-READERS; no new addendum (checkpoint D-29z915 already requested, still unanswered at this planning).'),
 ('D-29z988','REGRESSION timing corrected: D-29z982 assumed round 333 would be planned on or after 2026-11-05; it is planned on 2026-11-04 (regression-last 2026-11-02 = 2 days, speed rule threshold 3 days not met), so round 333 is new scope (stage c2b-ii). REGRESSION-ROUND-2026-11-05 = the first round B plans on or after 2026-11-05; its scope_additions gain one c2b-ii row and the loop-toggle-during-hold row.'),
 ('D-29z989','Stage c2b-ii contract: the ArrangementDetailPanel.tsx layout effect that copied onClipStart/onClipEnd/clipStart/clipDuration into startText/endText becomes a render-time sentinel (syncedClipGainText pattern): DetailRangeTextSource + isSameDetailRangeTextSource (Object.is on the 4 raw values) + detailRangeTexts; initial state seeded with the current source (tech-lead and performance-optimizer both advised seeding instead of null). Behaviour held to HEAD (DP35-DP37, DP39-DP42 green on HEAD source). Sketch: covering 37 files 613/613, typecheck rc 0, Biome clean, 6/6 mutants red, perf 103 EQUAL / 18 DIFF all lower vs C332 (trim 23.6 -> 21.633, move 28.2 -> 26.233, range 9.233 -> 7.267, click commits 3 -> 2, components 102 -> 100), names: the 2-component layout-effect commit disappears, all other commits equal.'),
 ('D-29z990','PERF-CAND-PEAK-PRIMITIVE-PROPS -> its own stage c2b-iii (tech-lead + performance-optimizer, round 333 consults): different mechanism (memo props), different files (ArrangementClip.tsx definition + 2 call sites, clipWaveformScale signature), ~2 components per plain move, 0 on trim; it needs its own perf run and red perf mutant (L58). performance-optimizer candidate ArrangementDetailClipGain memo (forwardRef without memo, inline callbacks) -> signal PERF-CAND-DETAIL-CLIPGAIN-MEMO, not scheduled.'),
 ('D-29z991','interact.harness.hook-live (assert >= 1) falls 2 -> 1 on the c2b-ii sketch: the second post-Add commit was the detail layout effect. Still passes; the liveness row now sits at its bound. Signal SIG-R333-HOOK-LIVE-MARGIN for PERF-HARNESS-SHARED-LIB / the next budgets task (perf/** is not granted this round); C reports the value.'),
 ('D-29z992','tech-lead: DP33/DP34/DP38 render counts depend on how selection.clip reaches the detail panel during a preview; the D-29z915 checkpoint answer must re-check them. Recorded in doc 232 (c2b-ii section) and on ARCH-R331-PREVIEW-READERS.'),
 ('D-29z993','Consult ruling naming: tech-lead optional rename sameDetailRangeTextSource -> isSameDetailRangeTextSource adopted in the sketch (boolean-predicate style); helpers stay module-level in ArrangementDetailPanel.tsx (render-state glue, no second user).'),
 ('D-29z994','This task: round 333 = PERF-DRAG-PREVIEW stage c2b-ii on de28cca; A applies b-round-332/sketch/sketch.patch.txt and edits doc 232 by hand; C: claims, scope (3 files), unit x3, 6 mutants + own, DRAG-NAMES, PERF alone vs c-round-332, DETAIL-TEXT browser rows, D-ROWS, G333-AUTH, DOCS. Order after: REGRESSION (first planning on/after 2026-11-05) -> c2b-iii -> c3 (after checkpoint if answered) -> c4 -> c5 -> conversions -> PERF-9..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule).'),
]
for i,t in D:
    b['decisions_log_b'].append({'id':i,'date':'2026-11-04','text':t})
for r in b['rounds']:
    if r.get('round')==332:
        r['status']='c_pass_published (C round 332 PASS browserVerified true; gate 332 published de28cca; D-29z984)'
b['rounds'].append({'round':333,'task':'current-task.md','decision':'D-29z984..D-29z994','type':'PERF-DRAG-PREVIEW stage c2b-ii (detail Start/End text in render)','status':'dispatched','note':'baseline de28cca clean; claims b-round-332/claims-333.sh; sketch b-round-332/sketch/sketch.patch.txt','added':T})
def walk(o):
    if isinstance(o,dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
n=0
for o in walk(b['post_current_stage_queue']):
    if o.get('id')=='PERF-DRAG-PREVIEW':
        o['status']='in_progress (D-29z984/D-29z989): stages a, b, c1, c2a, c2b-i done (c2b-i C round 332 PASS, de28cca; fade 10.817/move); round 333 = c2b-ii (detail Start/End text in render; sketch trim 21.633, move 26.233); c2b-iii = PERF-CAND-PEAK-PRIMITIVE-PROPS (D-29z990); c3..c5 not started | '+o['status']
        o.setdefault('split_d29z950',{})['c2b_iii']='PERF-CAND-PEAK-PRIMITIVE-PROPS: ArrangementPeakPath with primitive props (ArrangementClip.tsx + 2 call sites), own perf run and red perf mutant (D-29z990)'
        o['stage_c2b_ii_contract_d29z989']='current-task.md round 333; sketch b-round-332/sketch/; perf b-round-332/perf-sketch-results; names b-round-332/names-sketch.json'
        n+=1
    if o.get('id')=='STUDIO-PERFORMANCE' and isinstance(o.get('status'),str):
        o['status']='in_progress (D-29z984..D-29z994): PERF-DRAG-PREVIEW stage c2b-i done (C round 332 PASS, gate 332 published de28cca); round 333 = stage c2b-ii; then REGRESSION (first planning on/after 2026-11-05), c2b-iii, c3..c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | '+o['status']
        n+=1
print('queue updates',n)
of=b['open_findings']
def fid(i):
    m=[f for f in of if f.get('id')==i]; return m[0] if m else None
fid('GATE331-S1')['status']='closed (D-29z984): ruled D-29z975, hand-written equalities kept; doc 232 item 27 states it (C round 332 DOCS PASS)'
fid('GATE331-S2')['status']='closed (D-29z984): fixed round 332 section 1.3, C round 332 DOCS PASS, published de28cca'
fid('GATE331-S3')['status']='closed (D-29z984): fixed round 332 (try/finally), C round 332 UNIT PASS, published de28cca'
of.append({'id':'SIG-R332-OVERVIEW-PICK','severity':'info (A reviewer rated latent medium; re-rated D-29z986)','origin':'A code-reviewer round 332 (A-R332-REVIEW-OVERVIEW-PROP-TYPE)','title':'ArrangementOverviewProps.arrangement stays a full Arrangement; the stabilised held object may carry an old loop/markers/fade field, which a future overview reader would show stale','status':'signal (D-29z986): no reproducible failure (C round 332 OVERVIEW-SHOWN 0 diffs; gate 332 reviewer trace); folded into checkpoint D-29z915 (Pick projection with ARCH-R331-PREVIEW-READERS); L46 deadline RETRO 336','evidence':'a-round-332.md code-reviewer findings; c-round-332.json notes; gates/round-332/review.md suggestion 3','added':T})
of.append({'id':'GATE332-S1-HELDREF-RENDER','severity':'info','origin':'gate 332 reviewer','title':'useEqualityStableSelector writes heldRef inside the selector (render); a discarded concurrent render can leave a never-committed held value','status':'accepted as is (D-29z987): held values are only compared, at most one extra render; move the write to an effect only if the hold ever becomes visible','evidence':'gates/round-332/review.md suggestion 1','added':T})
of.append({'id':'SIG-R333-HOOK-LIVE-MARGIN','severity':'info','origin':'B pre-check round 333 planning','title':'interact.harness.hook-live (assert >= 1) drops 2 -> 1 on the c2b-ii sketch; the liveness row sits at its bound','status':'signal (D-29z991): for PERF-HARNESS-SHARED-LIB or the next budgets task; C records the value in round 333','evidence':'b-round-332/perf-rowcmp-vs-c332.txt','added':T})
of.append({'id':'PERF-CAND-DETAIL-CLIPGAIN-MEMO','severity':'info','origin':'performance-optimizer consult round 333 planning','title':'ArrangementDetailClipGain is forwardRef without memo and gets a new array and ~8 inline callbacks each render, so it re-renders on every move','status':'signal (D-29z990); not scheduled; needs memo + stable callbacks (closure-staleness risk) as its own stage if adopted','evidence':'b-round-332.md section 3','added':T})
b['deferred_low_polish'].append({'id':'A-R332-REVIEW-LOWS','severity':'low','origin':'A code-reviewer round 332','title':'DP32 uses a fresh mount per variant (never runs the stable selector); DP29-DP31 have no try/finally; b.clips[index] type-safe only because noUncheckedIndexedAccess is off; rolesSplit and ignoredFields duplicated across two test files','evidence':'a-round-332.md code-reviewer findings','repro':'read DP29-DP32 in drag-preview-render.test.tsx and preview-store.test.ts','status':'deferred_low_polish (D-29z986)','added':T})
for r in b['regression_rounds']:
    if r.get('id')=='REGRESSION-ROUND-2026-11-05':
        r['status']='planned (D-29z988): the first round B plans on or after 2026-11-05; regression-last = 2026-11-02 round 301'
        r['scope_additions'].append('PERF-DRAG-PREVIEW stage c2b-i (round 332): loop toggle (L) after a fade preview and after a move preview: overview data-extent and bars equal HEAD (A-R332 reviewer Low, D-29z986)')
        r['scope_additions'].append('PERF-DRAG-PREVIEW stage c2b-ii (round 333, if published): type in Start, drag the clip: Start follows; type, change Clip Gain: typed text kept (one short browser row)')
for x in b['architecture_signals']:
    if x.get('id')=='ARCH-R331-PREVIEW-READERS':
        x['status']+=' | evidence round 332 (D-29z987): gate 332 reviewer signal 3/4 again (StudioWorkspace.tsx l.638-652, 845-869; now 3 callers); A 332 reviewer proposes a preview-readers module with the *_FIELD_ROLES and the overview projection type; SIG-R332-OVERVIEW-PICK folded in; D-29z992: DP33/DP34/DP38 render counts must be re-checked against the checkpoint answer'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'])
