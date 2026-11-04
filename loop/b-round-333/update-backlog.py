import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==292
T='2026-11-04 B round 333 -> 334 planning'
b['version']=293
b['updated']=T+' (D-29z995..D-29z1003)'
b['advisor_used_by_B']='yes (round 333 -> 334 planning: advisor consulted before the sketch and before declaring done)'
b['current_task']=('current-task.md (round 334, D-29z995..D-29z1003; PERF-DRAG-PREVIEW stage c2b-iii on 3f945e3: ArrangementPeakPath primitive props '
  '(clipId, sourceOffset, duration, gainDb); waveformScaleForGainDb in waveform-zoom.ts; gainDbLinearGain in model.ts; DP43-DP48, WG9-WG10; doc 232; '
  'sketch b-round-333/sketch/sketch.patch.txt)')
D=[
 ('D-29z995','Round 333 closed as PASS from C evidence: c-round-333.json taskStatus PASS, browserVerified/realVerified true, 10 rows (CLAIMS, SOURCE-SCOPE, UNIT, MUTANT, DRAG-NAMES, PERF, DETAIL-TEXT, D-ROWS, G333-AUTH, DOCS), 0 bugs; gate 333 published 3f945e3 on both remotes (review 9/10). PERF-DRAG-PREVIEW stage c2b-ii -> done (trim 21.633, move 26.233, range 7.267/move, click 2 commits; DETAIL-TEXT A == HEAD at 23 samples/viewport). A-R333-DP42-FOCUS-PREMISE -> info (HEAD behaviour, C confirmed A == HEAD in browser).'),
 ('D-29z996','Gate 333 review: suggestions 1-2 (rangeTextSource rebuilt per render; render-phase setState) need no fix -> info GATE333-S1-S2. Suggestion 3 (DP42: text typed in Start is replaced when a drag starts) = HEAD behaviour, same as A-R333-DP42-FOCUS-PREMISE -> deferred_low_polish GATE333-S3-TYPED-TEXT-DRAG with a question for Saba (behaviour change needs him). Suggestion 4 (doc 232 c2b-ii testing entry cites sketch numbers) -> fixed in round 334 section 1.3. Architecture note keep -> evidence on ARCH-R331-PREVIEW-READERS (useSyncedText only if a third call site appears).'),
 ('D-29z997','REGRESSION timing re-checked: round 334 is planned 2026-11-04, regression-last 2026-11-02 (2 days < 3), so new scope. REGRESSION-ROUND-2026-11-05 remains the first round planned on/after 2026-11-05; its c2b-ii scope row loses "if published" (published 3f945e3).'),
 ('D-29z998','Stage c2b-iii contract: ArrangementPeakPath (memo) takes clipId, sourceOffset, duration, gainDb instead of clip; inner name ArrangementPeakPathInner kept; scale waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom); clipWaveformScale and clipLinearGain delegate to the new helpers (waveform-zoom.ts, model.ts); both call sites updated; DP43-DP48 (drag-preview-render) and WG9-WG10 (clip-gain-waveform); doc 232. B sketch: perf fade 10.817 -> 9.833/move (max 11 -> 10), move 26.233 -> 24.267 (max 103 -> 101), trim/range/click/hook-live EQUAL, 104 EQUAL / 17 DIFF; names fade [10x4], move [19,19,101,19]; browser path d == HEAD at 22 samples x 2 viewports; 9/9 mutants red; covering 155 files 2459/2459.'),
 ('D-29z999','Consult rulings round 334: performance-optimizer (safe; keep rows record; gainDbLinearGain in model.ts; gaps -> MU-PEAK-MEMO-DEPS-STALE + WG10, MU-PEAK-DETAIL-OFFSET-ZERO + WG9, both survived the first sketch and are red now) and tech-lead (approve; names kept; video fade row DP48 added; STOP list adopted). tech-lead option Pick<ArrangementClip, gainDb> widening not chosen: one dB formula in model.ts (performance-optimizer), widening changes two existing signatures, evidence measured on the helper version. clipWaveformScale left with no production caller: kept as a test-used delegate, recorded in doc 232. ArrangementContext.tsx:3402 inline 10 ** (gainDb / 20) -> signal SIG-R334-INLINE-DB-GAIN.'),
 ('D-29z1000','A custom memo comparator for ArrangementPeakPath is not an allowed alternative: round 331 measured it (b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt), the wrapper fiber is counted, trim +1 per move.'),
 ('D-29z1001','The 17 lower perf rows stay record in round 334; asserted fade rows keep their spec budget (<= 24); move rows are PERF-1b-i record rows. Conversions stay with PERF-CAND-FADE-BUDGET after c5.'),
 ('D-29z1002','Round 334 touches neither StudioWorkspace.tsx nor ArrangementContext.tsx, so it does not wait for checkpoint D-29z915 (still unanswered). c3 still waits for that checkpoint if it is answered by then.'),
 ('D-29z1003','This task: round 334 = PERF-DRAG-PREVIEW stage c2b-iii on 3f945e3; A applies b-round-333/sketch/sketch.patch.txt (6 files) and edits doc 232 by hand; C: claims, scope (7 files), unit x3, 9 mutants + own, DRAG-NAMES, PERF alone vs c-round-333, WAVEFORM-D (incl. own trim-end sample), VIDEO-WAVE, D-ROWS, G334-AUTH, DOCS. Order after: REGRESSION (first planning on/after 2026-11-05) -> c3 (after checkpoint if answered) -> c4 -> c5 -> conversions -> PERF-9..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). RETRO at 336 or end of STUDIO-PERFORMANCE.'),
]
for i,t in D:
    b['decisions_log_b'].append({'id':i,'date':'2026-11-04','text':t})
for r in b['rounds']:
    if r.get('round')==333:
        r['status']='c_pass_published (C round 333 PASS browserVerified true; gate 333 published 3f945e3; D-29z995)'
b['rounds'].append({'round':334,'task':'current-task.md','decision':'D-29z995..D-29z1003','type':'PERF-DRAG-PREVIEW stage c2b-iii (ArrangementPeakPath primitive props)','status':'dispatched','note':'baseline 3f945e3 clean; claims b-round-333/claims-334.sh; sketch b-round-333/sketch/sketch.patch.txt','added':T})
def walk(o):
    if isinstance(o,dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
n=0
for o in walk(b['post_current_stage_queue']):
    if o.get('id')=='PERF-DRAG-PREVIEW':
        o['status']='in_progress (D-29z995/D-29z998): stages a, b, c1, c2a, c2b-i, c2b-ii done (c2b-ii C round 333 PASS, 3f945e3; trim 21.633, move 26.233/move); round 334 = c2b-iii (PeakPath primitive props; sketch fade 9.833, move 24.267); c3..c5 not started | '+o['status']
        o['stage_c2b_iii_contract_d29z998']='current-task.md round 334; sketch b-round-333/sketch/; perf b-round-333/perf-sketch-results; names b-round-333/names-sketch.json; waveform b-round-333/wd-compare.txt'
        n+=1
    if o.get('id')=='STUDIO-PERFORMANCE' and isinstance(o.get('status'),str):
        o['status']='in_progress (D-29z995..D-29z1003): PERF-DRAG-PREVIEW stage c2b-ii done (C round 333 PASS, gate 333 published 3f945e3); round 334 = stage c2b-iii; then REGRESSION (first planning on/after 2026-11-05), c3..c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | '+o['status']
        n+=1
assert n==2, n
of=b['open_findings']
def fid(i):
    m=[f for f in of if f.get('id')==i]; assert len(m)==1, i; return m[0]
fid('PERF-CAND-PEAK-PRIMITIVE-PROPS')['status']='dispatched as stage c2b-iii, round 334 (D-29z998); closes when C round 334 passes | '+fid('PERF-CAND-PEAK-PRIMITIVE-PROPS')['status']
fid('SIG-R333-HOOK-LIVE-MARGIN')['status']+=' | C round 333 measured 1 (PASS at bound); B c2b-iii sketch also 1 (EQUAL), D-29z998'
of.append({'id':'A-R333-DP42-FOCUS-PREMISE','severity':'info','origin':'A round 333','title':'clip pointerdown takes focus off the Start input in jsdom and in the browser, on A and HEAD alike; DP42 means "typed while focused, the drag then replaces it"','status':'closed as info (D-29z995): HEAD behaviour, C round 333 DETAIL-TEXT confirmed A == HEAD; product side tracked as GATE333-S3-TYPED-TEXT-DRAG','evidence':'a-round-333.md; c-round-333.md honest limits','added':T})
of.append({'id':'GATE333-S1-S2','severity':'info','origin':'gate 333 reviewer','title':'rangeTextSource rebuilt per render (only first seed used); render-phase setState guarded by Object.is','status':'accepted as is (D-29z996): no fix needed per reviewer','evidence':'gates/round-333/review.md suggestions 1-2','added':T})
of.append({'id':'GATE333-S4-DOC-SKETCH-NUMBERS','severity':'low','origin':'gate 333 reviewer','title':'doc 232 c2b-ii testing entry cites B sketch numbers and says C measures','status':'scheduled in round 334 section 1.3 (D-29z996); closes when C round 334 DOCS passes','evidence':'gates/round-333/review.md suggestion 4; c-round-333 PERF equals sketch','added':T})
of.append({'id':'SIG-R334-INLINE-DB-GAIN','severity':'info','origin':'tech-lead + performance-optimizer consults round 334 planning','title':'ArrangementContext.tsx:3402 converts gainDb to linear inline (10 ** (gainDb / 20)); after c2b-iii it can use gainDbLinearGain from model.ts','status':'signal (D-29z999): not scheduled; candidate for a later PERF or polish task that already owns ArrangementContext.tsx','evidence':'b-round-333.md section 3','added':T})
of.append({'id':'SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY','severity':'info','origin':'tech-lead + performance-optimizer consults round 334 planning','title':'after c2b-iii clipWaveformScale has no production caller (only waveform-zoom.test.tsx); kept as a delegate','status':'signal (D-29z999): remove or @deprecated in a round that owns waveform-zoom.test.tsx','evidence':'b-round-333/claims-334-sketch-output.txt K6','added':T})
b['deferred_low_polish'].append({'id':'GATE333-S3-TYPED-TEXT-DRAG','severity':'low','origin':'gate 333 reviewer (+ A-R333-DP42-FOCUS-PREMISE)','title':'text typed into the Clip details Start/End field (not yet applied) is replaced when the user then drags the clip; HEAD behaviour since before round 333','evidence':'gates/round-333/review.md suggestion 3; c-round-333.md honest limits (A == HEAD); DP42','repro':'/studio-lab: select a clip, type 1.5 in Start without Enter, drag the clip name bar: Start shows the dragged start and 1.5 is lost','status':'deferred_low_polish (D-29z996): product question for Saba (keep typed text vs follow the clip); no change without his answer','added':T})
for r in b['regression_rounds']:
    if r.get('id')=='REGRESSION-ROUND-2026-11-05':
        sa=r['scope_additions']
        for k,s in enumerate(sa):
            if s.startswith('PERF-DRAG-PREVIEW stage c2b-ii (round 333, if published)'):
                sa[k]=s.replace('(round 333, if published)','(round 333, published 3f945e3)')
        sa.append('PERF-DRAG-PREVIEW stage c2b-iii (round 334, if published): fade and move a clip, change Clip Gain by fader and by typing, zoom 2x: lane and detail waveforms look as before (one short browser row per viewport)')
        r['status']='planned (D-29z997): the first round B plans on or after 2026-11-05; regression-last = 2026-11-02 round 301'
for x in b['architecture_signals']:
    if isinstance(x,dict) and x.get('id')=='ARCH-R331-PREVIEW-READERS':
        x['status']+=' | evidence round 333 (D-29z996): gate 333 reviewer keep for ArrangementDetailPanel.tsx two render-phase sentinels (553-558, 565-584); useSyncedText only if a third call site appears; DP33/DP34/DP38 render counts coupled to selection.clip path (D-29z992)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok',b['version'])
