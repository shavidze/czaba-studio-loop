import json
P='backlog.json'
b=json.load(open(P))
A='2026-10-31 B round 294 -> 295 planning'
def find(lst,i):
    for x in lst:
        if isinstance(x,dict) and x.get('id')==i: return x
    raise KeyError(i)
pd=find(b['post_current_stage_queue'],'PD-REVIEW-2026-10-31')
for sid in ['FIX-PD-1c','FIX-PD-1c2','FIX-PD-1c3']:
    s=find(pd['stages'],sid)
    s['status']='done (D-29z738): C round 294 PASS 9/9 rows, browserVerified/realVerified true (c-round-294.json); gate 294 published bc85a1a on both remotes (rounds 292-294) | '+s['status']
find(b['open_findings'],'GATE293-T1')['status']='closed (D-29z738): C round 294 PASS (ST6 exact map gains StudioNarrowScreen.tsx 4/2; UNIT-MUTANTS Footer + old map red); gate 294 full suite 226 files / 3385 tests passed, published bc85a1a'
find(b['open_findings'],'INFO-C293-DOC-L21')['status']='closed (D-29z738): C round 294 DOC-218 row PASS (l.21 names togglePlayback and stopLibraryPreview)'
t=find(b['deferred_low_polish'],'A-R292-REVIEW-L-TH4-TITLE'); t['status']='closed (D-29z738): C round 294 UNIT row (TH4 new title) + CLAIMS K9 old-title 0; published bc85a1a | '+t['status']
c=find(b['open_findings'],'C-R292-01')
if not str(c.get('status','')).startswith('closed'):
    c['status']='closed (D-29z738): C round 293 B-NARROW-PREVIEW evidence, published bc85a1a with gate 294 | '+str(c.get('status',''))
new_lows=[
 {"id":"A-R294-REVIEW-L-DOC-FILELIST","severity":"low","status":"deferred (D-29z739): bundle DOC218-POLISH","origin":"A round-294 code-reviewer, confirmed by C (c-round-294.json bugs[0])","title":"doc 218 'შეცვლილი ფაილები' (l.44-53) does not list app/lib/__tests__/store-theme-tokens.test.ts (ST6)","evidence":"a-round-294.md code-reviewer; c-round-294.json DOC-218","repro":"read doc 218 l.44-53","fix":"add bullet `app/lib/__tests__/store-theme-tokens.test.ts` — ST6: ზუსტ map-ში `StudioNarrowScreen.tsx` (total 4, script 2)","added":A},
 {"id":"GATE294-R1-NARROW-EXIT-TARGET","severity":"low","status":"deferred (D-29z739): measured, WCAG 2.5.8 AA met by the spacing exception","origin":"gate-294 reviewer finding 1 ('Low-Medium'), ruled by B measurement","title":"narrow screen '← CZABA' exit link is 71x20 px (below 24 px height; below the 44 px AAA 2.5.5 target); Send link 87x38","evidence":"b-round-294/probe/tap-result.json (390x844 and 360x740: link h 20, nearest other target 158 px, so the 24 px circle spacing exception holds); gates/round-294/review.md finding 1","repro":"390x844 /studio-lab, measure [data-testid=studio-narrow-screen] a getBoundingClientRect","fix":"Tailwind only: min-h-11 py-2 px-2 on the link, min-h-11 on Send link (phone-only screen)","added":A},
 {"id":"GATE294-R2-RENDER-REF","severity":"low","status":"deferred (D-29z739); same as signal A-R292-REVIEW-RENDER-REF","origin":"gate-294 reviewer finding 2","title":"studio-lab.tsx:53-55 writes wasWideRef during render; React rules prefer a state latch (safe today: true-only idempotent write)","evidence":"gates/round-294/review.md finding 2","repro":"read studio-lab.tsx l.53-55","added":A},
 {"id":"GATE294-R4-VIEW-RESET-DOC","severity":"low","status":"deferred (D-29z739): bundle DOC218-POLISH","origin":"gate-294 reviewer finding 4","title":"narrow -> wide remount resets workspace view settings (folds, heights, zoom/scroll, library width, dock position); clips/mix/undo kept; doc 218 TODO should say so","evidence":"gates/round-294/review.md finding 4","repro":"wide: change zoom, narrow to <900 px, widen: zoom resets","added":A},
 {"id":"GATE294-R5-NG10-MID-DRAG","severity":"low","status":"deferred (D-29z739)","origin":"gate-294 reviewer finding 5","title":"no test covers narrowing during a clip drag (gesture counter back to 0, next edit not refused)","evidence":"gates/round-294/review.md finding 5","repro":"start a clip drag, setWide(false), pointerup, setWide(true), check isPointerGestureActive() false","added":A},
 {"id":"GATE294-R6-LRS4-TIMEOUT","severity":"low","status":"deferred (D-29z739): bundle DOC218-POLISH","origin":"gate-294 reviewer finding 6","title":"library-row-strings-ui LRS4 timeout raised to 15 s without a recorded cause","evidence":"gates/round-294/review.md finding 6; library-row-strings-ui.test.tsx:180","repro":"read LRS4","added":A},
]
ids={x.get('id') for x in b['deferred_low_polish']}
for x in new_lows:
    if x['id'] not in ids: b['deferred_low_polish'].append(x)
sig=find(b['architecture_signals'],'A-R293-ARCH-SILENCE-ALL')
sig['text']+=' | merged (D-29z740): gate-294 reviewer Architecture note proposes the same seam as an explicit stopPlayback() on ArrangementContextValue for StopPlaybackOnNarrow (toggle-to-stop is safe today: ref and state set together). Still a signal; candidate when the context is next unfrozen.'
info=[
 {"id":"INFO-C294-DESK-BASELINE-DRIFT","severity":"info","origin":"C round 294","title":"stored cross-job desk baselines drift by +-1 LSB on anti-aliased corners (15/22 px); same-job HEAD control 0/0","status":"adopted (D-29z741): from round 295 a desk-sameness row means 0 px against HEAD rendered in the same job (git archive, own port and cacheDir); stored b-round-291 baselines are reference only","added":A},
 {"id":"INFO-C294-STORE-NO-MAIN-LANDMARK","severity":"info","origin":"C round 294","title":"/ and /store render no <main>/role=main at HEAD (WCAG 1.3.1/2.4.1)","status":"routed (D-29z741): acceptance row for STORE-2b (layout restyle owns root/Store layout); not scheduled alone","added":A},
 {"id":"INFO-C294-TOKEN-POST-405-STACK","severity":"info","origin":"C round 294","title":"dev-server POST /api/studio-token 405 body includes a Remix stack trace (no token); protected file; production unverified","status":"routed (D-29z741): risk line for SRW-21-PLAN (protected route review); loop does not edit the file","added":A},
]
ids={x.get('id') for x in b['open_findings']}
for x in info:
    if x['id'] not in ids: b['open_findings'].append(x)
st=find(b['post_current_stage_queue'],'STORE-REDESIGN')
s2=find(st['stages'],'STORE-2'); s2.setdefault('acceptance_additions',[]).append('INFO-C294-STORE-NO-MAIN-LANDMARK (D-29z741): / and /store render exactly one <main> landmark')
srw=find(pd['stages'],'SRW-21-PLAN'); srw.setdefault('risks',[]).append('INFO-C294-TOKEN-POST-405-STACK (D-29z741): POST /api/studio-token returns a dev stack trace; plan states production behaviour')
sy=find(b['systemic_tasks'],'SYS-VACUOUS-ROWS'); sy['status']='dispatched (D-29z742): round 295, baseline bc85a1a; B scratch pre-run b-round-294/ (4 app test files 85 tests green; perf report.test 23 green via scratch config; mutants stall-timer/metronome-wrapper/ZQ3-no-polyline/LoAF-any-entry all red; tsc rc 0; Biome clean)'
for i in sy['closes']:
    x=find(b['deferred_low_polish'],i); x['status']='dispatched round 295 in SYS-VACUOUS-ROWS (D-29z742) | '+x['status']
rr=find(b['root_requests_b'],'ROOT-REQ-VITEST-PERF-INCLUDE'); rr['status']='open, re-raised (D-29z743): round 295 adds LOAF1 to perf/lib/report.test.ts; it stays outside the gate until vitest.config.ts include gains perf/**/*.test.ts'
b['rounds'][-1]['status']='C PASS (9/9, browserVerified/realVerified true); gate 294 published bc85a1a (rounds 292-294)'
b['rounds'].append({"round":295,"task":"current-task.md","decision":"D-29z738..D-29z745","type":"SYS-VACUOUS-ROWS (systemic, test/harness only): DW12/DW12b stall timer, SD10 metronome guard, ZQ3 non-vacuity, LOAF1 harness.loaf-scripts needs a non-empty scripts entry","status":"dispatched","note":"baseline bc85a1a clean tree; 8 grants (3 app test files, 4 perf files, new doc 219); frozen b-round-294-r295-tree-sha256.txt (1162); claims b-round-294/claims-295.sh; B scratch green, all 4 mutants red","added":A})
b['current_task']='current-task.md (round 295, D-29z738..D-29z745; SYS-VACUOUS-ROWS: closes A-R278-REVIEW-METRONOME-SPY, C-R283-01, A-R283-REVIEW-LOAF-SCRIPTS, A-R284-REVIEW-ZQ3-VACUITY; baseline bc85a1a, frozen b-round-294-r295-tree-sha256.txt 1162; claims b-round-294/claims-295.sh)'
D=[
 ("D-29z738","Round 294 C PASS (c-round-294.json: 9 rows passed, 0 failed, browserVerified/realVerified true) and gate 294 published bc85a1a on both remotes. FIX-PD-1c, FIX-PD-1c2, FIX-PD-1c3 -> done; GATE293-T1, INFO-C293-DOC-L21, A-R292-REVIEW-L-TH4-TITLE closed; C-R292-01 published. F8 closed. Baseline for round 295 = bc85a1a (clean tree)."),
 ("D-29z739","Gate-294 reviewer findings and C's Low ruled: finding 1 (exit link 71x20 px) measured by B at 390x844/360x740 (b-round-294/probe/tap-result.json): nearest other target 158 px, WCAG 2.5.8 spacing exception met -> Low, not Medium. Findings 1,2,4,5,6 and A-R294-REVIEW-L-DOC-FILELIST -> deferred_low_polish (2023-10-23 bug gate); doc-218 items grouped as DOC218-POLISH bundle candidate. Finding 3 is the architecture signal (D-29z740); finding 7 info, already owned (B-R291-NARROW-PREFETCH)."),
 ("D-29z740","Gate-294 Architecture note (explicit stopPlayback on the context) merged into signal A-R293-ARCH-SILENCE-ALL; not scheduled (context frozen, no live defect). Signal 4 'keep' recorded. No frontend-architect checkpoint requested: FIX-PD-1 stage closed at a route-level boundary without repeated structural risk on one owner."),
 ("D-29z741","C-294 INFO rulings: DESK-BASELINE-DRIFT adopted (desk-sameness = 0 px vs HEAD rendered in the same job); STORE-NO-MAIN-LANDMARK -> STORE-2 acceptance addition (one <main> on / and /store); TOKEN-POST-405-STACK -> SRW-21-PLAN risk; AUTH-ATTEMPT1 and STORE-BACKENDLESS noted."),
 ("D-29z742","Round 295 = SYS-VACUOUS-ROWS (next in D-29z737 order; regression not due until 2026-11-02; no Medium+ open from C or gate). Test/harness only: DW12/DW12b (stall timer cleared on every finish path), SD10 (standalone ArrangementTempoRow metronome spy, positive control with tempo), ZQ3 expect(before).toBeTruthy(), LOAF1 + perf in-page scriptCount + node-side loafScriptsProblem. B scratch: every mutant red, HEAD rows green on the same mutants where vacuity was claimed (UI12 green under wrapper mutant; HEAD ZQ3 green under no-polyline mutant)."),
 ("D-29z743","LoAF row placement: the in-page part stays inline in installPerfInstrumentation (serialised by addInitScript; no imported helper at runtime); the decision moves to a node-side pure loafScriptsProblem in perf/lib/report.ts with LOAF1 unit rows. LOAF1 runs only via a scratch vitest config until ROOT-REQ-VITEST-PERF-INCLUDE lands (re-raised). Real-browser half: C runs PERF-1a once on A's tree (no harness.loaf-scripts problem, load.script-max present) plus a raw LoAF probe at both viewports; B probe shows real entries mix empty and non-empty scripts (b-round-294/probe/loaf-result.json), so the vacuity was real and the stricter check is satisfiable."),
 ("D-29z744","Doc: a new implementation doc 219-sys-vacuous-rows.md (next free number, K14) records the four rows and mutants; doc 218 is not touched (its Lows wait for DOC218-POLISH)."),
 ("D-29z745","Order after 295 (unchanged from D-29z737): REGRESSION when the planning date is on/after 2026-11-02 (regression-last 2026-10-30, round 258), else STUDIO-LINK -> NAME-AND-HINT -> PERF-3c and the rest of STUDIO-PERFORMANCE -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). SRW-21-PLAN parallel planning. RETRO due at round 305."),
]
have={d['id'] for d in b['decisions_log_b']}
for i,t in D:
    if i not in have: b['decisions_log_b'].append({"id":i,"date":"2026-10-31","text":t})
b['updated']='2026-10-31 B round 294 -> 295 planning'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok')
