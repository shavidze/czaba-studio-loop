import json
import sys
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
SR = json.load(open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-289/sr290.json'))
b = json.load(open(P))
A = '2026-10-31 B round 289 -> 290 planning'
if any(x.get('id') == 'D-29z710' for x in b['decisions_log_b']):
    sys.exit('already applied')


def f(key, i):
    for x in b[key]:
        if x.get('id') == i:
            return x
    raise KeyError(i)


EV289 = 'C round 289 PASS (c-round-289.json: 13 rows passed, browserVerified/realVerified true, 0 bugs, both viewports) and gate 289 published 5a911ff on both remotes'
b['version'] = b['version'] + 1
b['updated'] = A
b['current_task'] = 'current-task.md (round 290, D-29z710..D-29z717; RETRO 290 (window 275-289) + whole-screen and journey review; no app code; baseline 5a911ff, 0 grants, frozen 1157)'

# D-29z710: round 289 accepted
b['rounds'].append({'round': 289, 'task': 'current-task.md (archived tasks/round-289.md)', 'decision': 'D-29z707..D-29z709', 'type': 'PD-REVIEW FIX-PD-1b (F7 English demo names + SR-230-6 group heading)', 'status': 'done: ' + EV289 + ' (D-29z710)', 'added': A})
b['rounds'].append({'round': 290, 'task': 'current-task.md', 'decision': 'D-29z710..D-29z717', 'type': 'RETRO 290 (window 275-289) + whole-screen and journey review; no app code', 'status': 'dispatched', 'note': 'baseline 5a911ff clean; 0 grants; frozen b-round-289-r290-tree-sha256.txt (1157)', 'added': A})
q = [x for x in b['post_current_stage_queue'] if x.get('id') == 'PD-REVIEW-2026-10-31'][0]
st = {s['id']: s for s in q['stages']}
st['FIX-PD-1b']['status'] = 'done (D-29z710): ' + EV289 + '; F7 and SR-230-6 closed. Follow-up FIX-PD-1b2 (gate-289 Mediums) queued | ' + st['FIX-PD-1b']['status']
q['stages'].insert([s['id'] for s in q['stages']].index('FIX-PD-1c'), {'id': 'FIX-PD-1b2', 'status': 'queued (D-29z711): round 291, right after RETRO 290', 'what': 'gate-289 fix-up: GATE289-S1 heading aria-hidden (Medium), GATE289-S2 doc 216 wording (Medium, doc half), GATE289-S3 run-start keys (Low, same owner, cheap) + A-R289-REVIEW-L2 test names; one owner ArrangementLibrary.tsx', 'added': A})
q['status'] = 'in_progress (D-29z710): FIX-PD-1b done (289, 5a911ff); RETRO 290 next, then FIX-PD-1b2 | ' + q['status']
for i in ('SR-230-6',):
    for x in b['screen_review_candidates']:
        if x.get('id') == i:
            x['status'] = 'done (D-29z710): ' + EV289 + ' | ' + str(x.get('status'))
for i in ('C-R282-01', 'C-R282-02', 'A-R282-REVIEW-DW11', 'C-R282-03'):
    x = f('open_findings', i)
    x['status'] = 'closed (D-29z710, L7 bookkeeping): fixed in round 283, C round 283 PASS and published (gates/gate-round-283.json); the status still read "fix dispatched" | ' + str(x.get('status'))

# D-29z711: gate-289 + A/C round-289 triage
b['open_findings'].extend([
    {'id': 'GATE289-S1-HEADING-SR-DOUBLE', 'severity': 'medium', 'origin': 'gate reviewer', 'source': 'gates/round-289/review.md suggestion 1', 'title': 'library group heading div is plain text inside listbox > group; screen readers may read it as a stray item and again as the group name', 'repro': 'ArrangementLibrary.tsx:671-676 at 5a911ff; All view with 2 runs', 'status': 'open (D-29z711): fix-up FIX-PD-1b2, round 291 (aria-hidden on the heading div; aria-labelledby still resolves); C checks the Chromium accessibility tree', 'added': A},
    {'id': 'GATE289-S2-DOC216-ALWAYS', 'severity': 'medium', 'origin': 'gate reviewer', 'source': 'gates/round-289/review.md suggestion 2; C-R289-INFO-02', 'title': 'doc 216 l.17 says the collection always shows; false for a one-collection search and for purchased libraries (hover title only)', 'status': 'open (D-29z711): doc half fixed in FIX-PD-1b2 round 291; product half = SABA-Q-LIB-SINGLE-RUN (awaiting_user)', 'added': A},
    {'id': 'SABA-Q-LIB-SINGLE-RUN', 'severity': 'info', 'origin': 'C (C-R289-INFO-02) + gate reviewer S2', 'title': 'when a search or a purchased library shows one collection, should one heading still name it? (today: none; collection only in the hover title, the accessible description and the preview title)', 'status': 'awaiting_user (D-29z711): paired with SR-275-6 in user-review/screen-review-290.md; non-blocking', 'added': A},
    {'id': 'BACKEND-EVIDENCE-F7', 'severity': 'info', 'origin': 'C', 'title': 'purchased /studio/$productId library with one run: no heading, short names (unit LG5 carries it)', 'status': 'open_backend_evidence (D-29z711): later backend-enabled check; not a reason to call round 289 unverified', 'added': A},
    {'id': 'C-R289-INFO-01', 'severity': 'info', 'origin': 'C', 'title': 'task 289 section 5 cites b-round-288/sketch.patch as kept; the file does not exist', 'status': 'counted at RETRO 290 (D-29z712) as an artifact-cited-but-absent finding (2nd: C-R283-02); experiment EXP-R290-ARTIFACT-MANIFEST', 'added': A},
])
b['deferred_low_polish'].extend([
    {'id': 'GATE289-S5-HEADING-SCROLL', 'severity': 'low', 'origin': 'gate reviewer', 'title': 'ArrowUp to the first option of a group scrolls the option into view but its heading can stay above the visible area', 'source': 'gates/round-289/review.md suggestion 5', 'repro': 'All view, scroll list down, ArrowUp to demo-synth-mix', 'status': 'deferred_low_polish (D-29z711)', 'added': A},
    {'id': 'A-R289-REVIEW-L3', 'severity': 'low', 'origin': 'A (code-reviewer)', 'title': 'DL-EN sits in the loader-error describe block of studio-lab-demo.test.ts (readability)', 'source': 'a-round-289.md', 'repro': 'code reading', 'status': 'deferred_low_polish (D-29z711)', 'added': A},
    {'id': 'A-R289-REVIEW-L4-MTAVRULI', 'severity': 'low', 'origin': 'A (code-reviewer)', 'title': 'DL-EN and the strings sweep use U+10A0-10FF only; Mtavruli U+1C90-1CBF is not covered', 'source': 'a-round-289.md', 'repro': 'insert U+1C90 into a demo title: DL-EN stays green', 'status': 'deferred_low_polish (D-29z711)', 'added': A},
])
b['open_findings'].append({'id': 'GATE289-S3-RUN-KEYS', 'severity': 'low', 'origin': 'gate reviewer + A (A-R289-REVIEW-L1 merged)', 'title': 'group keys use runIndex; an option moving to another run remounts and focus falls to body', 'source': 'gates/round-289/review.md suggestion 3; a-round-289.md L1', 'status': 'open (D-29z711): fixed early in FIX-PD-1b2 round 291 (same owner, one line; bug-gate exception "round already owns that code and it costs little")', 'added': A})
b['open_findings'].append({'id': 'A-R289-REVIEW-L2', 'severity': 'low', 'origin': 'A (code-reviewer)', 'title': 'ST47/ST51 test names still say "keeps only the sound titles" while the array is empty', 'source': 'a-round-289.md', 'status': 'open (D-29z711): fixed early in FIX-PD-1b2 round 291 (rename only)', 'added': A})
b['architecture_signals'].append({'id': 'A-R289-ARCH-GROUP-RUNS', 'source': 'a-round-289.md Architecture note; gates/round-289/review.md Architecture note', 'text': 'libraryResultRuns is a pure function of results inside ArrangementLibrary (tree, search, resize, roving focus, preview); proposal groupLibraryResults(results) in lib/arrangement/library.ts next to filterLibrarySources with an A,B,A unit test. Reviewer: keep for now; low cost/risk', 'status': 'signal (D-29z711): not scheduled; may ride FIX-PD-1b2 only if root approves; otherwise STORE/REVIEW-RECOMMENDATIONS polish', 'added': A})
for i in ('GATE289-S4-BIOME-IGNORE', 'GATE289-S6-LIBRARY-TEST-GEORGIAN'):
    b['open_findings'].append({'id': i, 'severity': 'info', 'origin': 'gate reviewer', 'source': 'gates/round-289/review.md', 'title': 'new biome-ignore (ruled in task 289, precedent K12)' if i.endswith('IGNORE') else 'library.test.ts keeps its own Georgian fixtures (ruled in task 289; doc 216 TODO)', 'status': 'noted (D-29z711)', 'added': A})

# D-29z712..716: RETRO 290
for r in b['retro_runs']:
    if r.get('round') == 275 and not str(r.get('status', '')).startswith('done'):
        r['status'] = 'done (C round 275 FAIL RT-IDS -> RT-FIX-276 PASS) | ' + str(r.get('status'))
b['retro_runs'].append({'round': 290, 'decision': 'D-29z712', 'window': '275-289', 'report': 'retros/retro-290.md',
    'lessons': 'lessons.md (60 lines): L27 merged into L52 (tech-lead); L17 folded into L2 (tech-lead); new L56 artifact manifest; header line 3',
    'data': 'b-round-289/*.py, *.json, *.txt (run on backlog-before-290.json) + fails-cause-hand.txt, claims-findings-hand.txt, stops.txt, claims-count.txt',
    'consults': {'tech-lead': 'used', 'consequence-tester': 'used', 'product-designer': 'used (screen + journey review)', 'design-philosopher': 'used (screen review, told to write nothing; tree sha256 -c rc 0)', 'first-visit-host': 'used (journey review)', 'qa-engineer': 'not in B consult list'},
    'headline': '15 rounds, C PASS 12 / FAIL 3 (275, 282, 287); gate published 11, skipped 3, failed 1 (276); cost $358.81 (B 183.74, A 96.58, C 78.49); 1 of 7 feature stages failed C first time (282); 4 of 4 C/gate failures originate in B (inventory, sweep scope, pre-check, clause conflict); SWEEP experiment refuted; RC-R260-ROW-SEVERITY rejected on its own adoption rule (C-R287-01)',
    'screen_review': 'user-review/screen-review-290.md (SR-290-* awaiting_user)', 'status': 'dispatched round 290 (C traceability check)', 'added': A})
rp = b['retro_policy']
rp['next_due'] = 'round 305 or the end of STUDIO-PERFORMANCE, whichever first (retro 305 window 290-304)'
rp['signals_for_next_retro'] = [
    'retro-290 section 10: EXP-R290-ARTIFACT-MANIFEST (consequence-tester): every count, path, kept artifact or pre-check row result in a task cites a file under b-round-N/ with a [K#] test -f claim; C re-runs them first. Baseline 275-289: claim/artifact-caused findings 5 (2 cited-but-absent), C/gate failures from B 4/15, B planning median $12.77. Refuted if >= 3 claim/artifact-caused findings, or >= 1 cited-but-absent artifact, or >= 1 FAIL whose origin is a B pre-check. Stop: B median > $15.96, C manifest check > $2 in a round, manifest > 30 lines. C records manifestPaths, missingPaths, countMismatches, claimCheckMinutes and an origin per finding in c-round-N.json (missing fields = stop uncheckable). Null if < 5 tasks cite artifacts or counts',
    'counters for RETRO 305: C FAIL 3/15, gate failed 1, STOPped rounds that reached C 2 (RC-R275-STOP-ROUTES-TO-B still with root/Saba), lessons <= 60, Saba-found issues with a lesson',
    'SYS-VACUOUS-ROWS result (closes A-R278-REVIEW-METRONOME-SPY, C-R283-01, A-R283-REVIEW-LOAF-SCRIPTS, A-R284-REVIEW-ZQ3-VACUITY)',
] + [s for s in rp.get('signals_for_next_retro', []) if not str(s).startswith(('retro-275 section 10', 'RC-R260-ROW-SEVERITY', 'lessons merge candidates for RETRO 290', 'L46 at RETRO 290'))]
for x in b['harness_rules']:
    if x.get('id') == 'HR-C-SHADOW-FIELDS':
        x['status'] = 'retired at RETRO 290 (D-29z716): RC-R260-ROW-SEVERITY rejected on its own adoption rule; claimRerunMinutes replaced by claimCheckMinutes (EXP-R290-ARTIFACT-MANIFEST); C wrote the fields only in rounds 275-276'
b['harness_rules'].append({'id': 'HR-C-MANIFEST-FIELDS', 'added': A + ' (D-29z716)', 'rule': 'from round 291 C writes manifestPaths, missingPaths, countMismatches, claimCheckMinutes and an origin (B spec, B pre-check, A, pre-existing, environment) per finding in c-round-N.json; a c-round JSON without them leaves the experiment stop uncheckable and C notes it', 'reference': 'retro-290 section 10'})
b['harness_rules'].append({'id': 'HR-CAPTURE-LANE-BY-NAME', 'added': A + ' (D-29z714)', 'rule': 'RETRO screen and journey capture scripts select a lane by clicking its name text (getByText exact inside the track header) and assert Active track: <lane> before Add; a header click at a fixed offset hit the pan slider in RETRO 290 (2nd time after SR-230-10)', 'reference': 'b-round-289/screens/stems-probe.json'})
for x in b['retro_candidates']:
    if x.get('id') == 'RC-R260-ROW-SEVERITY':
        x['status'] = 'rejected at RETRO 290 (D-29z716): adoption rule "no would-be-deferred Low later needed a fix-up" fails: round 287 FAIL was Low-only (C-R287-01) and needed fix-up round 288 (a 12 px card-height regression would have shipped); tech-lead preferred an enforced shadow (recorded as disagreement, retro-290 section 7) | ' + str(x.get('status'))
b['retro_candidates'].append({'id': 'RC-R290-PRECHECK-FULL-SUITE', 'added': A, 'text': 'tech-lead: B scratch pre-check runs the full npm run test:run with the specified rows added, log saved and cited (276 and 282 failures came from a pre-check narrower than the gate)', 'status': 'not adopted (D-29z716): L23 already requires running every grep-hit file and the specified rows; the experiment EXP-R290-ARTIFACT-MANIFEST tests the cheaper rule first; reconsider at RETRO 305 if a pre-check-origin FAIL recurs'})
b['retro_candidates'].append({'id': 'RC-R290-CLAUSE-RULING-LINE', 'added': A, 'text': 'tech-lead: for each element bound by two or more clauses the task has one ruling line naming the winning clause; C greps it (287)', 'status': 'applied as an L4 clause (D-29z713)'})
for x in b['retro_candidates']:
    if x.get('id') == 'RC-R275-STOP-ROUTES-TO-B':
        x['status'] = 'proposal for root/Saba, repeated at RETRO 290 (2 STOPped rounds reached C: 276, 282) | ' + str(x.get('status'))
b['systemic_tasks'].append({'id': 'SYS-VACUOUS-ROWS', 'added': A + ' (D-29z716)', 'what': 'test-only: give each listed row a mutant that turns it red, and fix the rows that cannot fail (metronome guard spy, stall-timer clear on every finish path, LoAF entry with non-empty scripts, ZQ3 polyline exists before compare)', 'closes': ['A-R278-REVIEW-METRONOME-SPY', 'C-R283-01', 'A-R283-REVIEW-LOAF-SCRIPTS', 'A-R284-REVIEW-ZQ3-VACUITY'], 'root_cause': 'a row no mutant turns red (L52 merged)', 'queue': 'right after the current stage (FIX-PD-1, after FIX-PD-1c); one test-only round', 'status': 'queued'})
for i in ('A-R278-REVIEW-METRONOME-SPY', 'C-R283-01', 'A-R283-REVIEW-LOAF-SCRIPTS', 'A-R284-REVIEW-ZQ3-VACUITY'):
    x = f('deferred_low_polish', i)
    x['status'] = 'scheduled in systemic task SYS-VACUOUS-ROWS (D-29z716) | ' + str(x.get('status'))

# D-29z715: L46 at RETRO 290
t = f('tech_lead_manual_checks', 'TLM-R274-SR-HELD-REPEAT')
t['status'] = 'deadline RETRO 290 passed without an answer (D-29z715): Saba-owned manual item in the final acceptance list; does not block rounds | ' + t['status']
fa = b['final_acceptance_saba_manual_items']
fa['items'] = [('TLM-R274-SR-HELD-REPEAT (deadline RETRO 290 passed, D-29z715)' if str(s).startswith('TLM-R274') else s) for s in fa['items']]
x = f('open_findings', 'GATE274-S1-HELD-REPEAT-ANNOUNCE')
x['l46_retro290'] = 'deadline passed without an answer; stays open_tech_lead_manual and is a Saba-owned final acceptance item (D-29z715)'

# D-29z714: screen review 290
for c in SR:
    c.update({'status': 'awaiting_user', 'source': 'user-review/screen-review-290.md; b-round-289/screens/', 'added': A})
    b['screen_review_candidates'].append(c)

# queue
q2 = [x for x in b['post_current_stage_queue'] if x.get('id') == 'STUDIO-PERFORMANCE'][0]
q2.setdefault('notes', []).append('D-29z717: before PERF-3c: RETRO 290 (round 290), FIX-PD-1b2 (291), REGRESSION when due (first planning on/after 2026-11-02), FIX-PD-1c, SYS-VACUOUS-ROWS, STUDIO-LINK, NAME-AND-HINT')

b['decisions_log_b'].extend([
    {'id': 'D-29z710', 'date': '2026-10-31', 'text': 'Round 289 FIX-PD-1b accepted: ' + EV289 + '. FIX-PD-1b done; F7 and SR-230-6 closed. L7 bookkeeping: C-R282-01, C-R282-02, A-R282-REVIEW-DW11 and C-R282-03 closed (fixed round 283, C PASS, published).'},
    {'id': 'D-29z711', 'date': '2026-10-31', 'text': 'Gate-289 and round-289 triage: GATE289-S1 (Medium, heading aria-hidden) and GATE289-S2 (Medium, doc 216 wording) -> fix-up FIX-PD-1b2 round 291 with GATE289-S3 (Low, run keys; A-R289-REVIEW-L1 merged) and A-R289-REVIEW-L2 (Low, test names) fixed early (same owner, cheap). S5, A-R289-REVIEW-L3, L4 Mtavruli -> deferred_low_polish. S4, S6 noted. C-R289-INFO-02 + S2 product half -> SABA-Q-LIB-SINGLE-RUN (awaiting_user, with SR-275-6). Buyer-side single-run view -> BACKEND-EVIDENCE-F7. Arch note -> A-R289-ARCH-GROUP-RUNS signal.'},
    {'id': 'D-29z712', 'date': '2026-10-31', 'text': 'RETRO 290 (window 275-289): retros/retro-290.md; numbers from b-round-289 scripts on backlog-before-290.json; consults tech-lead, consequence-tester, product-designer, design-philosopher, first-visit-host.'},
    {'id': 'D-29z713', 'date': '2026-10-31', 'text': 'Lessons at RETRO 290 (lessons.md stays 60 lines): L27 merged into L52 (tech-lead wording, deferred from RETRO 275); L17 folded into L2 (tech-lead); new L56 artifact manifest (C-R283-02, C-R289-INFO-01); L4 gains the ruling-line clause (C-R287-01). Before-copy b-round-289/lessons-before-290.md.'},
    {'id': 'D-29z714', 'date': '2026-10-31', 'text': 'Whole-screen and journey review 290: user-review/screen-review-290.md, candidates SR-290-* awaiting_user; journey product page -> Studio (four stems, play) -> export captured on the mock backend.'},
    {'id': 'D-29z715', 'date': '2026-10-31', 'text': 'L46 at RETRO 290: TLM-R274-SR-HELD-REPEAT deadline passed without an answer; it stays a Saba-owned final acceptance item; GATE274-S1 stays open_tech_lead_manual (does not block, 2026-10-23 root clarification).'},
    {'id': 'D-29z716', 'date': '2026-10-31', 'text': 'Experiments: retro-275 SWEEP experiment refuted (GATE276-T1 Medium in a SWEEP-tagged task; 3 sweep-caused findings). RC-R260-ROW-SEVERITY rejected on its own adoption rule (C-R287-01 needed fix-up 288); HR-C-SHADOW-FIELDS retired; new EXP-R290-ARTIFACT-MANIFEST + HR-C-MANIFEST-FIELDS. Systemic task SYS-VACUOUS-ROWS queued (4 Lows). RC-R290-PRECHECK-FULL-SUITE not adopted (disagreement with tech-lead recorded).'},
    {'id': 'D-29z717', 'date': '2026-10-31', 'text': 'Next: round 290 RETRO (C traceability). Then 291 FIX-PD-1b2 (gate-289 Mediums), REGRESSION when due (on/after 2026-11-02), FIX-PD-1c, SYS-VACUOUS-ROWS, STUDIO-LINK, NAME-AND-HINT, PERF-3c and the rest unchanged. No frontend-architect checkpoint now (one small owner change); A-R289-ARCH-GROUP-RUNS stays a signal.'},
])
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
