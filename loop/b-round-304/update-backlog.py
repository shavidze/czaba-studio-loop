import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
assert b['version'] == 263 and b['decisions_log_b'][-1]['id'] == 'D-29z798', 'already applied or unexpected state; do not re-run'
A = '2026-11-02 B round 304 -> 305 planning'
EV = 'C round 304 PASS (c-round-304.json: 8 rows passed incl. PERF-RUN/PROBE-EQUIV at both viewports, browserVerified/realVerified true, 2 Lows) and gate 304 published adf959d on both remotes'
q = {e['id']: e for e in b['post_current_stage_queue']}
sp = q['STUDIO-PERFORMANCE']; st = {s['id']: s for s in sp['stages']}
of = {x.get('id'): x for x in b['open_findings']}
rc = {x.get('id'): x for x in b['retro_candidates']}
D = lambda i, t: b['decisions_log_b'].append({'id': i, 'date': '2026-11-02', 'text': t})

# D-29z799 round 304 accepted
for r in b['rounds']:
    if r.get('round') == 304: r['status'] = 'done: ' + EV + ' (D-29z799)'
st['PERF-3c']['status'] = 'done (D-29z799): ' + EV + '; EXIT not met (out keydown-max median 80 ms >= 50; in 24; commits max 1 on in/out/wheel) -> PERF-3d | ' + st['PERF-3c']['status']
st['PERF-3']['status'] = 'in_progress (D-29z799): 3a/3b/3c done; exit NOT met (C round 304 EXIT: out 80 ms) -> PERF-3d round 306 | ' + st['PERF-3']['status']
b['open_findings'] += [
 {'id': 'C-R304-01', 'severity': 'low', 'origin': 'C (A deviation)', 'title': 'LoAF rows use an overlap rule instead of the task-ruled start-inside window; LoAF can miss a key Event Timing catches (pass 3 out key 3: keydown 56, LoAF 0)', 'source': 'c-round-304.json bugs[0]; a-round-304.md l.19-23', 'status': 'closed by ruling (D-29z799): overlap rule accepted as the contract (reviewer-found Medium on start-inside; >= 200 ms quiet between steps > max LoAF 85 ms); EXIT uses keydown, LoAF is supporting data. Process half -> lessons L11 (RETRO 305)', 'added': A},
 {'id': 'C-R304-02', 'severity': 'low', 'origin': 'C (= GATE304-L4)', 'title': 'interactionSequence report text does not list the new zoom in/out/wheel steps', 'source': 'c-round-304.json bugs[1]; gates/round-304/review.md finding 4', 'status': 'open (D-29z799): fixed early in PERF-3d round 306 (same file perf/studio-lab-interactions.perf.spec.ts, one string; bug-gate exception)', 'added': A},
 {'id': 'INFO-C304-REVIEW-POSTFIX', 'severity': 'info', 'origin': 'C', 'title': "A's post-review changes (overlap rule, ZP4 async, ZP6) not re-reviewed by A's code-reviewer", 'status': 'closed by evidence (D-29z799): gates/round-304/review.md reviewed the whole diff incl. runZoomProbeSteps and the overlap filter (Good Practices); process rule -> L11 re-review clause', 'added': A},
 {'id': 'INFO-C304-LESSONS-MISSING', 'severity': 'info', 'origin': 'environment', 'title': 'C reported lessons.md missing', 'status': 'closed, false alarm (D-29z799): tmp/studio-real-loop is a symlink to /home/runner/work/czaba-studio-loop/czaba-studio-loop/loop and find without -L does not descend; lessons.md exists (59 lines). L38 clause (RETRO 305)', 'added': A},
 {'id': 'INFO-C304-C303-SHOT', 'severity': 'info', 'origin': 'C', 'title': 'C re-ran c-round-303/auth/probe.cjs and rewrote c-round-303/auth/shots/probe-legacy.png (same state)', 'status': 'noted (D-29z799): L38 clause "C scripts write only under c-round-N/"', 'added': A},
 {'id': 'INFO-C304-AUTH-ATTEMPT1', 'severity': 'info', 'origin': 'environment', 'title': 'cold-start document.body null on /studio/middle-east (2nd time after INFO-C303-AUTH-ATTEMPT1); C now waits for a non-empty body', 'status': 'noted (D-29z799): harness flake, not an app bug', 'added': A},
 {'id': 'INFO-C304-FAKEBEARER-500', 'severity': 'info', 'origin': 'environment', 'title': 'fake bearer -> 500 "Unable to prepare Studio access" with the mock :5199 not running (r303: 403); no token in any body', 'status': 'noted (D-29z799): backend-dependent, fails closed; not a bypass', 'added': A},
]
st['PERF-3d']['data_c_round_304'] = 'C round 304: wheel step 4 rewrites 30 paths with LoAF 0 while step 7 (also 30 rewrites) has LoAF 70-80 -> the cost is not just the rewrite count; measure step 7 separately (c-round-304.md, Data for PERF-3d). Out keydown samples 80/80/80; out LoAF max 83.4/73.8/74.6; wheel LoAF 70.1/71.7/79.8.'
D('D-29z799', 'Round 304 accepted: PERF-3c done (' + EV + '); PERF-3 exit not met -> PERF-3d. C-R304-01 ruled: LoAF overlap rule accepted as the contract, closed; C-R304-02 -> PERF-3d early fix; INFO-C304-REVIEW-POSTFIX closed (gate review covered the whole diff); INFO-C304-LESSONS-MISSING false alarm (symlink; find -L); INFO-C304-C303-SHOT, -AUTH-ATTEMPT1, -FAKEBEARER-500 noted. C data on wheel step 4 vs 7 attached to PERF-3d.')

# D-29z800 gate-304 triage
b['open_findings'] += [
 {'id': 'GATE304-M1-PERF-LIB-NOT-IN-GATE', 'severity': 'medium', 'origin': 'gate reviewer', 'source': 'gates/round-304/review.md finding 1', 'title': 'vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-config runs prove them', 'status': 'open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row', 'added': A},
 {'id': 'GATE304-M2-EQ60-TRIPWIRE', 'severity': 'medium', 'origin': 'gate reviewer', 'source': 'gates/round-304/review.md finding 2', 'title': 'interact.zoom.30.out.path-rewrites and wheel.path-rewrites assert == 60, which the PERF-3d fix will turn red; nothing says the red is expected', 'status': 'open (D-29z800): fixed in PERF-3d round 306: the task grants both budget rows and names their post-fix expected values, changed in the same commit', 'added': A},
 {'id': 'GATE304-L3-PROBE-IN-WINDOW', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-304/review.md finding 3', 'title': 'the zoom probe observer runs inside the measured window; keydown/LoAF rows not strictly comparable with key-window-longest-ms', 'status': 'open (D-29z800): note "measured with the zoom probe connected" added in PERF-3d (same budgets file, cheap)', 'added': A},
]
b['deferred_low_polish'].append({'id': 'GATE304-L5-COSMETIC', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-304/review.md finding 5', 'title': 'wheel row unit "commits / key"; unnamed zoomWheelOffsetX = 224 + 300; ZP6 before ZP5 in zoom-probe.test.ts', 'repro': 'code reading at adf959d', 'status': 'deferred_low_polish (D-29z800); may ride PERF-3d only where it owns the line', 'added': A})
b['architecture_signals'].append({'id': 'GATE304-ARCH-ZOOM-LIVE-RULE', 'source': 'gates/round-304/review.md Architecture note', 'text': 'zoom section of perf/studio-lab-interactions.perf.spec.ts changed in PERF-3a/3b/3c; measureZoomPath copies the slider live rule from measureZoom. Proposal after PERF-3d: measureZoom uses runZoomProbeSteps + a shared live-rule helper; acceptance: every interact.zoom.* row unchanged across 3 passes', 'status': 'signal (D-29z800): same owner as B-R303-PERF-HARNESS-METRIC-FAMILY; not scheduled; candidate test-only task after PERF-3d', 'added': A})
b['open_findings'].append({'id': 'GATE304-INFO-REMOUNT', 'severity': 'info', 'origin': 'gate reviewer', 'title': 'suggestion: also count childList additions of path inside the waveform so a remount is visible to in.path-rewrites == 0', 'status': 'noted (D-29z800): PERF-3d planning considers it', 'added': A})
for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-VITEST-PERF-INCLUDE':
        r['status'] = 'open, re-raised (D-29z800): GATE304-M1 (Medium) — zoom-probe.test.ts ZP1-ZP6 also outside the gate; requested before PERF-3d | ' + r['status']
D('D-29z800', 'Gate-304 triage: GATE304-M1 (Medium) open_root = ROOT-REQ-VITEST-PERF-INCLUDE, non-blocking, PERF tasks cite the scratch-config run until root lands it; GATE304-M2 (Medium) and GATE304-L3 -> PERF-3d round 306 (budgets granted with post-fix values, same commit); GATE304-L4 = C-R304-02; GATE304-L5 -> deferred_low_polish; architecture signal GATE304-ARCH-ZOOM-LIVE-RULE; GATE304-INFO-REMOUNT noted.')

# D-29z801..806 RETRO 305
b['retro_runs'].append({'round': 305, 'decision': 'D-29z801', 'window': '290-304', 'report': 'retros/retro-305.md', 'lessons': 'lessons.md (59 lines): L43 merged into L44 (tech-lead); new L57 C harness fields; L11, L23, L38, L56 one clause each; header line 3', 'data': 'b-round-304/*.py, *.json, *.txt (run on backlog-before-305.json) + fails-cause-hand.txt, claims-findings-hand.txt, stops.txt, claims-count.txt', 'consults': {'tech-lead': 'used', 'consequence-tester': 'used', 'product-designer': 'used (screen + journey review)', 'design-philosopher': 'used (screen review, told to write nothing; tree sha256 -c rc 0)', 'first-visit-host': 'used (journey review)', 'qa-engineer': 'not in B consult list'}, 'headline': '15 rounds, C PASS 13 / FAIL 2 (290, 292); gate published 11, skipped 3, failed 1 (293); $304.14 (B 146.29, A 71.43, C 86.42); all failures and the 296-299 fix-up chain originate in B spec/pre-check; EXP-R290-ARTIFACT-MANIFEST refuted', 'added': A})
pol = b['retro_policy']
pol['next_due'] = 'round 320 or the end of STUDIO-PERFORMANCE, whichever first (retro 320 window 305-319) (D-29z801)'
pol['signals_for_next_retro'].insert(0, 'retro-305 section 10: EXP-R305-SKETCH-MUTANT (consequence-tester): every B-specified assert names a mutant run red on B sketch before dispatch; C records assertsSpecified, mutantsRecorded, mutantRedOnSketch (L57). Baseline 290-304: 1 fix-up chain of 3 rounds ($45.75) from B spec; B median $9.75. Refuted if >= 2 findings of an unfailable specified assert that had a recorded red mutant, or >= 1 fix-up chain of >= 2 rounds from B spec. Stop: B median > $11.70 or C leaves the fields blank in 2 rounds. Null if < 3 rounds specify new asserts. Counters for RETRO 320: C FAIL 2/15, gate failed 1, STOPped rounds that reached C 3, lessons 59, L57 field coverage, RC-R305-LESSON-CHAR-CAP')
D('D-29z801', 'RETRO 305 (window 290-304) written: retros/retro-305.md; numbers from b-round-304 scripts on backlog-before-305.json; consults tech-lead, consequence-tester, product-designer, design-philosopher, first-visit-host; next RETRO round 320 or end of STUDIO-PERFORMANCE.')

srs = [
 ('SR-305-1', 'selected clip shown three times (Clip details header, body, status second line); "Source offset" jargon -> hide the status Clip: line while Clip details is open; rename "Starts at (in file)"', 'copy/behaviour', 'low'),
 ('SR-305-2', 'question: demo/synthetic disclosure repeated ~4 times; library notice sits above a real CZABA preview and may make it look fake -> accurate wording "Night Pulse stems are synthetic; CZABA previews are real public previews." and/or one disclosure via the header chip tooltip (SABA-B-8 approved the notice line, so Saba decides)', 'copy (question)', 'medium'),
 ('SR-305-3', 'question: "Try it in the Studio" lands on an empty timeline; (a) place the preview on Music at 00:00 as one undoable action + status "Middle East added to Music. Press Space to play." (PD default) or (b) copy-only status naming the selected preview (FVH); autoplay rejected', 'behaviour (a) / copy (b), question', 'medium'),
 ('SR-305-4', 'add status sentence carries five facts and truncates at 1440 -> shorten, keeping "audio is not stretched" (SABA-B-8)', 'copy', 'low'),
 ('SR-305-5', 'zoom cluster noise: ZOOM label, 40 px/s readout, back Zoom button, Fit -> readout in slider tooltip; back-zoom as icon "Previous zoom"', 'copy/visual', 'low'),
 ('SR-305-6', 'Clip details empty state shows empty inputs/waveform/Set selection/Clip Gain -> hint line + dimmed inputs, geometry unchanged (CALM-2); collapsing by default is a position move against CALM-2 (question only)', 'visual', 'low'),
 ('SR-305-7', 'question (data): demo Middle East preview has no bpm in app/data/studio-lab-demo.ts, so a stem sets 120 BPM next to it; product-page 90 BPM came from the mock fixture (unconfirmed) -> previews carry catalogue BPM so the SABA-B-11a music-asset rule applies', 'data/behaviour (question)', 'low'),
 ('SR-305-8', 'product page Premium "6 audio files" vs one preview in the Studio -> line under the link "Preview mix only; stems come with Premium." (Saba wording; joins SR-290-10)', 'store copy (STORE-4)', 'low'),
 ('SR-305-9', 'question: export dialog says nothing about what an exported preview may be used for -> one licence line (Saba)', 'copy (question)', 'low'),
 ('SR-305-10', 'A-R302-INFO-CZABA-DOUBLE-READOUT: "CZABA CZABA Studio" -> back link accessible name "Back to CZABA store" (WCAG 2.5.3 keeps the visible CZABA in the name); visible text and H1 unchanged', 'a11y copy', 'low'),
]
for i, w, k, p in srs:
    b['screen_review_candidates'].append({'id': i, 'what': w, 'kind': k, 'priority': p, 'status': 'awaiting_user', 'source': 'user-review/screen-review-305.md; b-round-304/screens/', 'added': A})
of['A-R302-INFO-CZABA-DOUBLE-READOUT']['status'] = 'awaiting_user (D-29z802): candidate SR-305-10 in user-review/screen-review-305.md | ' + of['A-R302-INFO-CZABA-DOUBLE-READOUT']['status']
D('D-29z802', 'RETRO 305 screen + journey review: user-review/screen-review-305.md, SR-305-1..10 awaiting_user (captures b-round-304/screens/, mock started and stopped; laneErrors none; persistent lines 97/124/86/101 vs 98/125/87/102). Weakest step: Try it in the Studio lands on an empty timeline (SR-305-3). Export copy items already in COPY-PD (F11).')
D('D-29z803', 'RETRO 305 lessons (59 lines, before-copy b-round-304/lessons-before-305.md, diff lessons-diff.txt): L43 merged into L44 (alias); new L57 C harness fields every round (HR-C-MANIFEST-FIELDS moves into lessons); L11 + task-ruled formula change is a STOP and post-review code goes back to the reviewer (C-R304-01); L23 + full suite on the sketch for app/** tasks (RC-R290-PRECHECK-FULL-SUITE adopted); L56 + allowed deltas from the sketch (RC-R295-CLAIMS-FROM-SKETCH); L38 + symlink find -L and C writes only under c-round-N/.')

for h in b['harness_rules']:
    if h.get('id') == 'HR-C-MANIFEST-FIELDS':
        h['status'] = 'moved into lessons.md L57 (D-29z804): tasks 300-304 stopped naming it and C stopped writing the fields; the rule now lives in the file every round reads; new fields assertsSpecified, mutantsRecorded, mutantRedOnSketch'
rc['RC-R290-PRECHECK-FULL-SUITE']['status'] = 'adopted at RETRO 305 (D-29z804): gate 293 was the recurrence; L23 full-suite-on-the-sketch clause for app/** tasks | ' + rc['RC-R290-PRECHECK-FULL-SUITE']['status']
rc['RC-R295-CLAIMS-FROM-SKETCH']['status'] = 'merged into L56 at RETRO 305 (D-29z804)'
for i in ('RC-R284-POST-FRAME-PROBE', 'RC-R290-AX-TREE-ROW', 'RC-R290-L50-MULTILINE-TERNARY'):
    rc[i]['status'] = 'RETRO 305 (D-29z804): retired as a candidate, no second instance in 290-304 (retro-305 section 8 greps); reopen on a second instance | ' + str(rc[i].get('status'))
b['retro_candidates'].append({'id': 'RC-R305-LESSON-CHAR-CAP', 'text': 'tech-lead: the 60-line cap does not stop clause growth (L23 4,269 chars); add a per-lesson character cap', 'status': 'watch to RETRO 320 (D-29z804)', 'added': A})
D('D-29z804', 'RETRO 305 experiments and candidates: EXP-R290-ARTIFACT-MANIFEST refuted on all three conditions (C-R298-02 absent; gate 293 pre-check; 3 named + 2 count findings); 300-304 uncheckable (fields not written). New EXP-R305-SKETCH-MUTANT (consequence-tester). HR-C-MANIFEST-FIELDS moved into L57. RC-R290-PRECHECK-FULL-SUITE adopted; RC-R295 merged into L56; RC-R284, RC-R290-AX-TREE-ROW, RC-R290-L50-MULTILINE-TERNARY retired as candidates; RC-R305-LESSON-CHAR-CAP added. No new systemic task (tech-lead harness-file proposal satisfied by L57).')

# D-29z805 next
b['rounds'].append({'round': 305, 'task': 'current-task.md', 'decision': 'D-29z799..D-29z806', 'type': 'RETRO 305 (window 290-304) + whole-screen and journey review; no app code', 'status': 'dispatched', 'note': 'baseline adf959d clean; 0 grants; frozen b-round-304-r305-tree-sha256.txt (1176)', 'added': A})
b['current_task'] = 'current-task.md (round 305, D-29z799..D-29z806; RETRO 305 (window 290-304) + whole-screen and journey review; no app code; baseline adf959d, 0 grants, frozen 1176)'
st['PERF-3d']['status'] = 'not_started (D-29z805): round 306 after RETRO 305; scope adds GATE304-M2 (grant both == 60 budget rows with post-fix values), GATE304-L3 (probe-connected note), C-R304-02 (interactionSequence); perf/lib tests via scratch config until ROOT-REQ-VITEST-PERF-INCLUDE lands; B consults performance-optimizer + tech-lead and re-measures first | ' + st['PERF-3d']['status']
sp['status'] = 'in_progress (D-29z805): PERF-3c done (304); RETRO 305; PERF-3d round 306 | ' + sp['status']
D('D-29z805', 'Next: round 305 = RETRO 305 (C verifies retro, lessons, screen review; auth guard + Studio smoke in the browser); round 306 = PERF-3d with GATE304-M2/L3 and C-R304-02; REGRESSION due on/after 2026-11-05 (regression-last 2026-11-02 round 301). No frontend-architect checkpoint (PERF-3c was test-only harness on one owner; GATE304-ARCH-ZOOM-LIVE-RULE stays a signal). ARCH-CHECKPOINT-STUDIO-LINK unanswered, non-blocking.')
D('D-29z806', 'RETRO 305 inventory (b-round-304/retro305-mention-ids.txt + RETRO (305)/round 305 greps): PERF-3/PERF-3d/queue status -> round 306; B-R301-DOCS-OLD-NAME -> For Saba proposal (retro-305 section 12); A-R302-INFO-CZABA-DOUBLE-READOUT and D-29z789 -> SR-305-10; RC-R290-PRECHECK-FULL-SUITE, RC-R284, RC-R290-AX-TREE-ROW, RC-R290-L50, RC-R295 dispositioned (D-29z804); retro_policy signals counted in retro-305 section 8; D-29z782 C-R301-01 counted under L47 (1 finding, pre-existing). Every entry has a disposition.')
of['B-R301-DOCS-OLD-NAME']['status'] = 'For Saba proposal at RETRO 305 (D-29z806; retro-305 section 12 item 3) | ' + str(of['B-R301-DOCS-OLD-NAME'].get('status'))

b['version'] = 264
b['updated'] = A
json.dump(b, open(P, 'w'), indent=1, ensure_ascii=False)
print('ok', b['version'], b['decisions_log_b'][-1]['id'])
