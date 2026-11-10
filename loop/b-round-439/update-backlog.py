import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==425, b['version']
assert b['decisions_log_b'][-1]['id']=='D-29z1562'
WHEN='2026-11-10 B round 439 -> 440 planning'
b['version']=426; b['updated']='2026-11-10'
b['current_task']="Round 440: SYS-1 stage 1 (test-only: RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS; sketch b-round-439/sketch-440.patch.txt sha cb05cfc8) on efd71f6 (current-task.md)"
for r in b['rounds']:
    if r.get('round')==439:
        r['task']='tasks/round-439.md'; r['status']='C PASS (browserVerified/realVerified true; 1 Low C-R439-01 = A-R439-REVIEW-M1, equal to HEAD); gate 439 published efd71f6'
b['rounds'].append({"round":440,"task":"current-task.md","decision":"D-29z1566","type":"SYS-1 stage 1 (test-only)","status":"dispatched","note":"baseline efd71f6 (gate 439 published); sketch b-round-439/sketch-440.patch.txt (sha cb05cfc8); claims b-round-439/claims-440.sh"})
CLOSED_435=['A-R429-REVIEW-SCAN-NEGATED-REPEAT','A-R430-REVIEW-NF2-TYPE-BOUNDARY','A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT','A-R430-REVIEW-NF2-CLASSNAME-CONST','A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE','A-R431-REVIEW-L2-RD2-DATA-TYPE','A-R431-REVIEW-L3-RD2-DATETIME-LOCAL','A-R432-REVIEW-RV432-5-PG2-SPREAD','A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS']
CL='closed (D-29z1563): SYS-R435-SOURCE-SCAN-HELPER C round 439 PASS, gate 439 published efd71f6'
for t in b['systemic_tasks']:
    if t['id']=='SYS-R435-SOURCE-SCAN-HELPER':
        t['status']='done (D-29z1563): C round 439 PASS (browserVerified/realVerified true), gate 439 published efd71f6 | '+t['status']
    if t['id']=='SYS-1':
        t['status']='in_progress (D-29z1565): stage 1 dispatched round 440 (RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS); stage 2 next (GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT: needs data hooks in ArrangementOverview.tsx and a jsdom render of the export dialog video-sound line + browser row) | '+t['status']
        t['stages_d29z1565']=[{"id":"SYS-1-stage-1","round":440,"closes":["RETRO200-CLASS-SELECTORS","GATE146-S4-LRS3-CLASSNAME-PINS","C-R127-L1f-SELF-COMPARE-TESTS"],"grants":"6 test files + doc 286","status":"dispatched"},{"id":"SYS-1-stage-2","closes":["GATE164-OV1-FRAGILE","GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR","GATE81-S2-UM8-SOURCE-TEXT"],"grants":"panel-radius-ui, content-colour-ui, studio-theme-obsidian, track-group-mix-ui tests + ArrangementOverview.tsx data attributes only (L23 marker sweep app/perf/e2e; full suite on sketch; browser Overview-unchanged row) + doc","status":"not_started"}]
        t['sys1_other_classname_pins']="className).toBe( style pins outside SYS-1 closes at efd71f6: components/common/__tests__/CookieConsent.test.tsx:64, detail-panel-reason.test.tsx:344,350, detail-panel-polish.test.tsx:364 (WAVEFORM_BOX_CLASS), track-layout.test.tsx:832,846, track-group-collapse-ui.test.tsx:1067, render-budget.test.tsx:642; also store-header-footer.test.tsx:124 '.text-glow' absence check (assertion, not finder). RETRO-450 question, no new ids (D-29z1565)"
for f in b['open_findings']:
    if f['id'] in ('C-R438-01-NF2-WRAPPER-TAG-NARROWING','A-R438-REVIEW-L1-PG2-STRING-MARKUP'):
        f['status']=CL+' | '+f['status']
for f in b['deferred_low_polish']:
    if f['id'] in CLOSED_435:
        f['status']=CL+' | '+f['status']
    if f['id']=='GATE434-S2-DS4-SOURCE-SCAN-SCOPE':
        f['status']='subfolder half closed (D-29z1563, C round 439 PASS); StudioDialog render half stays deferred_low_polish | '+f['status']
    if f['id'] in ('RETRO200-CLASS-SELECTORS','GATE146-S4-LRS3-CLASSNAME-PINS','C-R127-L1f-SELF-COMPARE-TESTS'):
        f['status']='in_progress (D-29z1566): SYS-1 stage 1, round 440; closes on C PASS | '+str(f['status'])
    if f['id'] in ('GATE164-OV1-FRAGILE','GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR','GATE81-S2-UM8-SOURCE-TEXT'):
        f['status']='queued (D-29z1565): SYS-1 stage 2, after round 440 | '+str(f['status'])
W439='2026-11-10 B round 439 -> 440 planning'
new_lows=[
 {"id":"A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564): equal to HEAD (B re-run b-round-439/wrapper-rerun/results.jsonl: W1/W2/W1b/W2b green on 142918b and efd71f6; W3/W4 red on both); must land before SABA-B-12 stage 4 (STUDIO-VIS-3) or any task adding a wrapper Input of type radio/search; same class as SIG-R438-OTHER-SCANNERS","title":"RD2 and SF2 select only lowercase input tags; a wrapper <Input type=\"radio\"|\"search\" /> passes both (NF2 has the any-tag query since v4.1)","evidence":"a-round-439.md (code-reviewer M1, rated Medium by the reviewer); a-round-439/wrapper-mutants*.jsonl; b-round-439/wrapper-rerun/","repro":"add <Input type=\"radio\" name=\"f\" className=\"x\" /> in a new app/components/arrangement file; npx vitest run app/lib/arrangement/__tests__/studio-radio.test.ts stays green","added":W439,"confirmedBy":["C-R439-01-RD2-SF2-WRAPPER-TAG-GAP (c-round-439.json, Low)"]},
 {"id":"A-R439-REVIEW-L1-RAW-COUNT-CANCEL","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564)","title":"NF2/PG2/IN1 raw-count guards compare counts only; a string markup plus a real tag the regex misses cancel out (same class as TL-R439-N1)","evidence":"a-round-439.md reviewer Low 1","added":W439},
 {"id":"A-R439-REVIEW-L2-IN1-OMIT-REGEX","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564)","title":"IN1's Omit check is a whole-file text regex requiring 'type' |, so a valid Omit<..., 'type'> fails","evidence":"a-round-439.md reviewer Low 2","added":W439},
 {"id":"A-R439-REVIEW-L3-INPUTCLASS-BY-NAME","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564)","title":"NF2 matches inputClass by name, not by binding (safe while the child component is not exported)","evidence":"a-round-439.md reviewer Low 3","added":W439},
 {"id":"A-R439-REVIEW-L4-HS1-EMPTY-ROOT","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564)","title":"HS1 does not assert that each scan root returned at least one file","evidence":"a-round-439.md reviewer Low 4","added":W439},
 {"id":"A-R439-REVIEW-L5-SEARCH-ENV","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1564)","title":"studio-search-field.test.ts lacks the // @vitest-environment node line its sibling suites have","evidence":"a-round-439.md reviewer Low 5","added":W439},
 {"id":"GATE439-L1-PARSE-CACHE-KEY","severity":"low","origin":"gate","status":"deferred_low_polish (D-29z1564)","title":"helpers/source-scan.ts parsedSources caches by full source text (memory per test file; optional key by path+length)","evidence":"gates/round-439/review.md finding 1","added":W439},
 {"id":"GATE439-L2-NF2-LONG-NAME","severity":"low","origin":"gate","status":"deferred_low_polish (D-29z1564)","title":"NF2 test title is >300 chars and bundles five checks; split into NF2a/NF2b","evidence":"gates/round-439/review.md finding 2","added":W439},
 {"id":"GATE439-L4-DIRNAME","severity":"low","origin":"gate","status":"deferred_low_polish (D-29z1564)","title":"helpers/source-scan.ts STORE_ROOT uses __dirname (fine in vitest; breaks in pure ESM if the helper moves)","evidence":"gates/round-439/review.md finding 4","added":W439},
 {"id":"GATE439-L5-DOC-EXTERNAL-PATHS","severity":"low","origin":"gate","status":"deferred_low_polish (D-29z1564)","title":"doc 285 cites loop paths outside the repo (b-round-438/...); keep the mutant table inside the doc","evidence":"gates/round-439/review.md finding 5; applied to doc 286 in round 440","added":W439},
]
ids={f['id'] for f in b['deferred_low_polish']}
for e in new_lows:
    assert e['id'] not in ids, e['id']
    b['deferred_low_polish'].append(e)
for s in b['architecture_signals']:
    if s.get('id')=='SIG-R438-OTHER-SCANNERS':
        s.setdefault('confirmedBy',[]).append("gates/round-439/review.md Architecture note: port HS1 and studio-focus-ring, studio-theme-obsidian, panel-radius-ui, strings to listSourceFiles in one bounded test-only task (one red mutant per suite); owner pins move with ARCH-SPLIT - D-29z1564")
        s.setdefault('confirmedBy',[]).append("a-round-439.md Architecture note 'signal: none' (keep the single helper; a Biome/ESLint JSX rule fits TL-R438-04 later) - D-29z1564")
b['retro_candidates'].append({"id":"B-R439-SIBLING-SUITE-GAP","round":439,"text":"When C-R438-01 (NF2 wrapper narrowing) was fixed, B's v4.1 sketch review did not ask the same question of the sibling suites RD2/SF2; A's reviewer then raised it as a Medium (A-R439-REVIEW-M1, equal to HEAD, ruled Low). Candidate lesson for RETRO 450: a fix for one scanner pattern names its siblings and rules each.","added":W439,"status":"candidate for RETRO 450"})
D=b['decisions_log_b']
D.append({"id":"D-29z1563","date":"2026-11-10","by":W439,"decision":"Round 439 accepted: c-round-439.json PASS (C1-C11, browserVerified/realVerified true; fake-bearer row BLOCKED backend unavailable in cloud); gate 439 published efd71f6 (review COMMIT OK 9/10, verify 273/4029). SYS-R435-SOURCE-SCAN-HELPER done; closes C-R438-01, A-R438-REVIEW-L1 and the 9 deferred Lows named in D-29z1557 plus the subfolder half of GATE434-S2. Baseline HEAD for round 440 = efd71f6."})
D.append({"id":"D-29z1564","date":"2026-11-10","by":W439,"decision":"Ruling on A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG (confirmedBy C-R439-01, one id): Low, deferred_low_polish. B re-ran A's wrapper mutants on archives of 142918b and efd71f6 (b-round-439/wrapper-rerun/results.jsonl): W1/W2/W1b/W2b green on both, W3/W4 red on both = equal to HEAD, no HEAD assertion lost. Must land before SABA-B-12 stage 4 or any wrapper Input radio/search. A's reviewer Lows L1-L5 and gate-439 Lows 1/2/4/5 deferred (L3 not a finding); both Architecture notes confirmedBy on SIG-R438-OTHER-SCANNERS. RETRO-450 candidate B-R439-SIBLING-SUITE-GAP."})
D.append({"id":"D-29z1565","date":"2026-11-10","by":W439,"decision":"SYS-1 split into two stages, full scope kept. Stage 1 (round 440, test-only, 6 files): RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS (ruling S1-R1: exact className equality deliberately not ported; per-token toContain), C-R127-L1f-SELF-COMPARE-TESTS (literal pins). Stage 2: GATE164-OV1-FRAGILE, GATE173-S4 (panel-radius-ui + content-colour-ui), GATE81-S2-UM8 - needs data attributes in ArrangementOverview.tsx and a jsdom render of arrangement-export-video-sound (no test renders it at efd71f6), so a different grant and covering set. B sketch: full suite 273/4029 rc0, typecheck rc0, lint 205, 13 mutants (b-round-439/mutants/results.jsonl). Other className toBe style pins recorded on SYS-1 (sys1_other_classname_pins) as a RETRO-450 question, no new ids."})
D.append({"id":"D-29z1566","date":"2026-11-10","by":W439,"decision":"Dispatch round 440 = SYS-1 stage 1 on efd71f6. Order after it: SYS-1 stage 2; REGRESSION-2026-11-13 at the first planning on or after 2026-11-13; SYS-3; STORE-REDESIGN 2b..5; ARCH-SPLIT (frontend-architect checkpoint via root first; ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS open); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. Next RETRO round 450. No new architecture checkpoint request (test-only)."})
open(P,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
print('ok v',b['version'])
