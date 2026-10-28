import json
P='backlog.json'
b=json.load(open(P))
D='2026-10-28'; ADD='2026-10-28 B round 223 -> 224 planning'
assert b['version']==208
b['version']=209; b['updated']=D
b['current_task']="current-task.md (round 224, D-29z251..D-29z258; PERF-HARNESS-SHARED-LIB-b-i: per-row determinism contract in new perf/lib/determinism.ts (ratio by metric via detail num/den, MiB tenths, exact by unit, fail-closed null); every kind:deterministic row checked, per-spec sets and determinismRequiresKind removed; 1a cross-rate exact; load.longtasks-over-50 + res.export.1.longtasks-over-50 -> wallclock; 1a commits-per-move detail {commits, moves}; GATE214-S4 symmetry + no-clamp guard; perf/lib/report.test.ts DC-* cases + MU-1..6; vitest include via root request (3 cases); doc 176; baseline e140ab4; frozen 1060; oracle c-round-223/reports + b-round-223/scripts/equiv-check-b1.py)"
# rounds
r223=[r for r in b['rounds'] if r.get('round')==223][0]
r223['status']='c_pass_published'
r223['result']="C PASS (c-round-223.json: 13 rows passed, browserVerified=true, realVerified=true; LOWS-223:GATE214-S2 not passed = task-premise issue C-R223-01, ruled D-29z254); gate 223 published e140ab4 on both remotes (verify 203 files / 2958 tests)"
b['rounds'].append({"round":224,"task":"current-task.md","decision":"D-29z251..D-29z258","status":"dispatched","type":"PERF-HARNESS-SHARED-LIB-b-i (test-only, perf/** + report.test.ts + doc 176)","note":"baseline e140ab4; frozen 1060 (b-round-223-r224-tree-sha256.txt); grants 14 (b-round-223-r224-grants.txt); new 3; root/conditional 4 (vitest.config.ts per task 0.3); oracle c-round-223/reports/*.json; equiv-check-b1.py (controls b-round-223/ctl/controls.log)","next":"PASS + before 2026-10-30 -> round 225 PERF-HARNESS-SHARED-LIB-b-ii; on/after 2026-10-30 -> REGRESSION","added":ADD})
# queue
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='STUDIO-PERFORMANCE'][0]
q['status']="in_progress: round 223 PERF-HARNESS-SHARED-LIB done (C PASS, published e140ab4; D-29z251) except GATE214-S2 (ruled into b-ii, D-29z254); round 224 = PERF-HARNESS-SHARED-LIB-b-i (D-29z252/D-29z256); then b-ii unless REGRESSION due (on/after 2026-10-30), then PERF-2.. per execution_order_d29z252 | "+q['status']
st=q['stages']
s27=[s for s in st if s.get('id')=='PERF-HARNESS-SHARED-LIB'][0]
s27['status']="done (C round 223 PASS, published e140ab4; D-29z251); GATE214-S3/S5, GATE217-S1/S2 closed; GATE214-S2 not done (premise false, C-R223-01) -> ruled into PERF-HARNESS-SHARED-LIB-b-ii (D-29z254) | "+s27['status']
sb=[s for s in st if s.get('id')=='PERF-HARNESS-SHARED-LIB-b'][0]
sb['status']="split D-29z252 into b-i (round 224, dispatched) and b-ii (queued) | "+sb['status']
sb['split_d29z252']="b-i = report semantics only (per-row determinism contract, longtasks reclass, GATE214-S4, report.test.ts, tolerancePct removed); b-ii = measurement windows + re-baseline (GATE214-S1, R216-MEM-POLLS-HEADROOM, GATE214-S2 lane-after-clip-lane, GATE223-S2 observer before try, PERF-1A-TIMEOUT-HEADROOM). Nothing dropped."
i=st.index(sb)
st.insert(i+1,{"id":"PERF-HARNESS-SHARED-LIB-b-i","what":"per-row determinism contract in perf/lib/determinism.ts (ratio via detail numerator/denominator = A-R214 M2, MiB tenths, exact by unit, fail-closed); check every kind:deterministic row; 1a cross-rate exact; reclassify load.longtasks-over-50 and res.export.1.longtasks-over-50 to wallclock; GATE214-S4; perf/lib/report.test.ts (vitest include via root request); remove dead tolerancePct; doc 176","target":"every check red on a named mutant (MU-1..6); every compared deterministic median equal to c-round-223 reports (1a 166, 1b-i 122, 1b-ii 37); failures empty","source":"split D-29z252 (tech-lead + performance-optimizer consults round 224)","status":"dispatched round 224 (D-29z256)","added":ADD})
st.insert(i+2,{"id":"PERF-HARNESS-SHARED-LIB-b-ii","what":"GATE214-S1 state waits (interactions l.635/l.701, resources l.529, 1a l.567/590/661; 1a fixed 2000 ms Add wait ruled at planning); R216-MEM-POLLS-HEADROOM page-timestamped export window; GATE214-S2 deselect lane = first lane after the clip's lane in DOM order with an empty right-half point (D-29z254); GATE223-S2 observer install inside try; PERF-1A-TIMEOUT-HEADROOM measured after S1 (root playwright.perf.config.ts request if > 50 %)","target":"baselines re-measured and recorded; contract from b-i green","source":"split D-29z252","status":"not_started (queued right after b-i)","added":ADD})
q['execution_order_d29z252']="... -> PERF-HARNESS-SHARED-LIB (223, done) -> PERF-HARNESS-SHARED-LIB-b-i (224) -> PERF-HARNESS-SHARED-LIB-b-ii -> PERF-2 -> PERF-3 -> PERF-COMMIT-RESCHEDULE -> PERF-4 -> PERF-5 -> PERF-7 -> PERF-8 -> PERF-DRAG-PREVIEW -> PERF-9 -> PERF-10 -> PERF-11 -> PERF-12 -> PERF-13 -> PERF-14 -> PERF-15 (PERF-6 dropped). Supersedes the tail of execution_order_d29z244; REGRESSION first whenever due."
q['consults_round_224']={
 "tech-lead":"contract in code keyed by metric (ratio detail keys differ per metric) + unit, fail-closed on unknown unit; no new JSON key (key order stable); remove dead tolerancePct; drop per-spec sets (59 unchecked deterministic rows in 1a); determinismRequiresKind:false is a no-op; keep crossRateMetrics separate; vitest include = root request (biome.json also excludes perf/); test must not import page.ts/instrumentation.ts; agrees with split and GATE214-S2 in b-ii; replay first",
 "performance-optimizer":"fade commits-per-move 6x is 59/60 in every pass (stable under throttle) -> never in a cross-rate set; ratio: denominators identical, numerators exact; MiB 0.1 abs; reclassify load.longtasks-over-50 and res.export.1.longtasks-over-50 to wallclock, keep play.idle-longtasks-over-50 deterministic (== 0 assert); GATE214-S4: exact compare is right (integer slider steps, view.ts l.250-256), add symmetry + clamp guard; 1a cross pairs 78 with 0 differences -> exact; mutants M-RATIO/M-DENOM/M-INT/M-MIB/M-LT/M-CROSS. Dissent not adopted: JSON fields toleranceAbs/ratioOf (B chose tech-lead's code-side contract for key-order stability; D-29z256)",
 "advisor":"used before writing: bookkeeping, L10 ruling text for GATE214-S2, tolerance semantics gaps (absolute vs pct, missing 1a ratio details, longtasks), named mutants, vitest root request with a 3-case rule, proof shape, split by semantics vs windows"}
# deferred lows
dl=b['deferred_low_polish']; closed=b['closed_findings_d29z163']
keep=[]
for e in dl:
    i_=e.get('id')
    if i_ in ('GATE214-S3','GATE214-S5','GATE217-S1','GATE217-S2'):
        e['status']="closed (C round 223 PASS LOWS-223, c-round-223.json passed; published e140ab4; D-29z251)"; closed.append(e); continue
    if i_=='GATE214-S2':
        e['status']="ruled D-29z254 (L10): premise false (C-R223-01: the Add clip is on lane music, which has no empty right-half point); re-scoped to 'first lane after the measured clip's lane in DOM order with an empty right-half point' (fixture -> stems), scheduled in PERF-HARNESS-SHARED-LIB-b-ii"
    if i_=='GATE214-S4':
        e['status']="dispatched round 224 (PERF-HARNESS-SHARED-LIB-b-i, D-29z255): premise corrected (integer slider steps, exact compare correct); add symmetry + no-clamp guard; closes on C PASS S4-224"
    if i_=='GATE214-S1':
        e['status']="queued PERF-HARNESS-SHARED-LIB-b-ii (D-29z252)"
    if i_=='DOC-PERF-LINEREF-DRIFT-223':
        e['note']+=" | confirmed by A and C round 223: doc 168 l.216 cites doc 163 l.67, row now at l.73 (the only hit); round-224 drift joins this id"
    keep.append(e)
dl[:]=keep
dl.append({"id":"GATE223-S2","severity":"low","status":"queued PERF-HARNESS-SHARED-LIB-b-ii (D-29z252)","title":"perf/studio-lab-resources.perf.spec.ts: export observer attached at l.291 before the try that starts at l.327; if the timeOrigin evaluate (l.302) throws, nothing releases it (scope limited to one pass context)","source":"gates/round-223/review.md suggestion 2","added":ADD})
dl.append({"id":"A-R223-REVIEW-L3","severity":"low","status":"deferred_low_polish","title":"1a spec still uses the literal [data-clip-kind=\"audio\"] instead of perf/lib/page.ts audioClips","source":"a-round-223.md code review","note":"perf harness owner; one-liner with the next owner of the 1a spec (b-ii may take it if cheap)","added":ADD})
# open findings
of=b['open_findings']
for e in of:
    if e.get('id')=='R216-MEM-POLLS-HEADROOM': e['status']="watch: queued PERF-HARNESS-SHARED-LIB-b-ii (D-29z252) | "+e['status']
    if e.get('id')=='PERF-1A-TIMEOUT-HEADROOM': e['status']="watch: round 223 A 7.1 min, C 7.1 min (new) / 7.4 min (HEAD) of 15; queued PERF-HARNESS-SHARED-LIB-b-ii (measure after GATE214-S1; root playwright.perf.config.ts request if still > 50 %) | "+e['status']
of.append({"id":"C-R223-01-GATE214-S2-PREMISE","severity":"low","origin":"C round 223 (confirms A STOP)","title":"task premise false: the Add clip lands on lane music (no empty right-half point), not stems; implementing GATE214-S2 as written aborts all 6 PERF-1b-i passes","status":"ruled D-29z254 (B's own task error, round-223 section 3): GATE214-S2 re-scoped into b-ii; A's revert accepted; not an A defect","evidence":"c-round-223/g223.json; a-round-223/run-1/perf-run.log","added":ADD})
of.append({"id":"C-R223-OBS-01","severity":"info","origin":"C round 223","title":"first cold dev-server /studio-lab load logged invalid hook call / hydration error once; not reproduced in 4 later loads; app unchanged","status":"attached to VITE-EXCLUDE-STALE / b-round-220-root-request-vite.md (dev optimiser hypothesis, unconfirmed); C re-notes if it recurs","evidence":"c-round-223/g223.json, recheck-1440.json","added":ADD})
of.append({"id":"PERF-LONGTASKS-DETERMINISTIC-MISCLASS","severity":"info","origin":"C round 223 observation + B replay","title":"load.longtasks-over-50 (kind deterministic) varies within a run ([1,1,2], [1,2,1], [1,2,2]); res.export.1.longtasks-over-50 is the same class","status":"dispatched round 224: both reclassified to wallclock record (D-29z257); play.idle-longtasks-over-50 stays deterministic (== 0 assert, no spread)","evidence":"b-round-223/replay-exact.txt","added":ADD})
of.append({"id":"GATE223-S1-DOC175-CLAIM","severity":"low","origin":"gates/round-223/review.md suggestion 1","title":"doc 175 'byte-identical report' claim holds for identical passes only; the new finally can add 'observer was not released' on error paths","status":"dispatched round 224 (grant 14, doc 175 section testing)","added":ADD})
of.append({"id":"GATE223-S4-ROWRATE-PIN","severity":"info","origin":"gates/round-223/review.md suggestion 4","title":"rateSuffix/rowRate in report.ts and rateRowId/faderRowId suffix logic can drift","status":"dispatched round 224 (DC-RATE in report.test.ts; rateRowId moves to report.ts)","added":ADD})
b['architecture_signals'].append({"id":"ARCH-GATE223-REPORT-POLICY-RECORD","source":"gates/round-223/review.md Architecture note; a-round-223.md code-reviewer note","title":"keep perf/lib/page.ts + report.ts split; if a 4th spec or another flag lands, group the per-spec report options into one per-harness policy record","status":"signal, not scheduled (round 224 removes two options, which reduces the pressure)","added":ADD})
b['root_requests_b']=b.get('root_requests_b',[])+[{"id":"ROOT-REQ-VITEST-PERF-INCLUDE","file":"b-round-223-root-request-vitest.md","decision":"D-29z253","blocking":False,"status":"open","added":ADD}]
dec=[
("D-29z251","Round 223 closed from C evidence: C PASS (13 rows passed, browserVerified=true, realVerified=true); gate 223 published e140ab4 (verify 203 files, 2958 tests). PERF-HARNESS-SHARED-LIB done; GATE214-S3, GATE214-S5, GATE217-S1, GATE217-S2 closed (moved to closed_findings_d29z163). GATE214-S2 not passed (C notPassed)."),
("D-29z252","PERF-HARNESS-SHARED-LIB-b split by meaning: b-i (round 224) = report semantics only, windows untouched, medians must equal c-round-223 reports; b-ii = window changes + re-baseline (GATE214-S1, R216-MEM-POLLS-HEADROOM, GATE214-S2, GATE223-S2, PERF-1A-TIMEOUT-HEADROOM). Scope preserved. tech-lead + performance-optimizer agree."),
("D-29z253","vitest include perf/**/*.test.ts requested from root (b-round-223-root-request-vitest.md), non-blocking; task 0.3 has one 3-case rule (root grant file / root commit / scratch config + Low PERF-REPORT-TEST-INCLUDE)."),
("D-29z254","L10 ruling on GATE214-S2 / C-R223-01: premise was B's error; A's revert accepted. Re-scoped: deselect lane = first lane after the measured clip's lane in DOM order with an empty right-half point (fixture music -> stems; a scan from the top would hit video). Scheduled in b-ii because it touches the pre-window click path."),
("D-29z255","GATE214-S4 premise corrected: slider values are integer steps (view.ts l.250-256 Math.round), exact compare stays; add symmetric-path and no-clamp (strictly inside slider min/max, read before the first key t0) guards. In round 224."),
("D-29z256","Determinism contract lives in code (perf/lib/determinism.ts) keyed by metric (ratio pairs) then unit (MiB tenths, exact allow-list), fail-closed null; every kind:deterministic row checked; per-spec sets and determinismRequiresKind removed; 1a cross-rate exact median equality; dead tolerancePct removed. performance-optimizer's JSON toleranceAbs/ratioOf alternative not adopted (key order stability, tech-lead)."),
("D-29z257","load.longtasks-over-50 and res.export.1.longtasks-over-50 reclassified to wallclock (B replay of 13 reports: the only deterministic row with within-run spread; their siblings are wallclock already); play.idle-longtasks-over-50 stays deterministic."),
("D-29z258","Gate-223 review triage: S1 -> doc 175 grant in round 224; S2 -> GATE223-S2 b-ii; S3 = DOC-PERF-LINEREF-DRIFT-223; S4 -> DC-RATE; S5 info; Architecture note -> signal ARCH-GATE223-REPORT-POLICY-RECORD. A's reviewer Low (1a audio literal) -> A-R223-REVIEW-L3 deferred. regression-last unchanged (due on/after 2026-10-30); RETRO at round 230 or end of STUDIO-PERFORMANCE."),
]
for i_,t in dec: b['decisions_log_b'].append({"id":i_,"date":D,"text":t})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('deferred',len(dl),'open',len(of),'closed',len(closed))
