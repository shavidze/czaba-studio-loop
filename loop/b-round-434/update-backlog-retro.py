# B round 434 -> 435 planning, part 2: RETRO 435 outputs (v418 -> v419). Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-434/update-backlog-retro.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 418 and b['decisions_log_b'][-1]['id'] == 'D-29z1539', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 434 -> 435 planning (RETRO 435)'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
def pre(o, s):
    o['status'] = s + ' | ' + str(o.get('status'))
F = {}
for k in ('open_findings', 'deferred_low_polish'):
    for f in b[k]:
        if isinstance(f, dict) and 'id' in f: F.setdefault(f['id'], f)
TLM = {t['id']: t for t in b['tech_lead_manual_checks'] if isinstance(t, dict) and 'id' in t}
Q = {q['id']: q for q in b['post_current_stage_queue']}
# D-29z1540: L46 deadlines
pre(F['TLM-SABA-B-12-FIREFOX-SAFARI'], 'question to Saba (D-29z1540): user-review/questions-retro-435.md Q1 (5 checks incl. A-R432-REVIEW-RV432-1 Firefox indeterminate contrast and the dialog scrollbars); new deadline RETRO 450 (L46); shares blocker ROOT-REQ-PLAYWRIGHT-FIREFOX for the Firefox half')
t = TLM['TLM-PERF15-FIREFOX']
pre(t, 'reopened as task, blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX (D-29z1540; L46: asked at RETRO 416 and 420 without answer; Chromium only on the runner); third question user-review/questions-retro-435.md Q2; if root declines, both Firefox halves close as "not verifiable in loop" only with Saba acceptance')
t['deadline'] = 'RETRO 450 (D-29z1540) | ' + str(t.get('deadline'))
for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-PLAYWRIGHT-FIREFOX':
        r['status'] = 're-raised at RETRO 435 (D-29z1540): blocks TLM-PERF15-FIREFOX (reopened) and the Firefox half of TLM-SABA-B-12-FIREFOX-SAFARI; tech-lead command npx playwright install --with-deps firefox; non-blocking for the loop'
perf = Q['STUDIO-PERFORMANCE']
pre(perf, 'loop_complete_remainders_parked (D-29z1540): RETRO 435 L46 - PERF-4b, 9c, 11b, 12b, 14c-ii/iii bundled into one Saba question (user-review/questions-retro-435.md Q3); PERF-9d (root) and PERF-4c (backend) parked; new deadline RETRO 450')
for s in perf.get('stages', []):
    if isinstance(s, dict) and 'deadline RETRO 435' in str(s.get('status', ''))[:400]:
        pre(s, 'parked (D-29z1540): deadline RETRO 450')
for c in b['retro_candidates']:
    if c.get('id') == 'RC-R305-LESSON-CHAR-CAP':
        pre(c, 'watch to RETRO 450 (D-29z1540): L23 5058, L58 4988 bytes (wc -c) unchanged at RETRO 435')
    if c.get('id') == 'RC-R423-PERF-SPEC-ON-STRUCTURE':
        c['status'] = 'adopted (D-29z1541): L37 clause "Fiber-structure change -> full perf suite on the sketch" (tech-lead) | ' + c['status']
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R424-BOUNDARY-FIBER-GUARD':
        pre(s, 'merged into the L37 RETRO 435 clause (D-29z1541); the unit render-count guard stays a signal for ARCH-SPLIT planning')
dec('D-29z1540', 'RETRO 435 L46 rulings (tech-lead, b-round-434/consult-tech-lead.md item 4): TLM-SABA-B-12-FIREFOX-SAFARI -> one Saba question (questions-retro-435.md Q1), deadline RETRO 450; TLM-PERF15-FIREFOX (2 RETROs unanswered) -> reopened as a task blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX, third question Q2, deadline RETRO 450; STUDIO-PERFORMANCE awaiting_user remainders bundled in Q3, root/backend remainders parked to RETRO 450; RC-R305-LESSON-CHAR-CAP watch to RETRO 450. Q4 = SR-435-1 (From/To unit, product-designer) as a question; default is Saba\'s approved wording.')
# D-29z1541: lessons + tools
dec('D-29z1541', 'RETRO 435 lessons (tech-lead): L56 gains the clause "a count, name or pixel number written in a task names its file and JSON key, and C\'s CLAIMS row greps that value there" (B-R433-HEAD-BLUE-PX-MISCOUNT, B-R434-CONFIRMMODAL-NAME); L37 gains "Fiber-structure change -> full perf suite on the sketch" (C-R423-01, SIG-R424, GATE304-M1); l.3 pointer + RETRO 435 sentence; 60 lines (diff b-round-434/lessons-diff.txt, hunks 3c3, 24c24, 40c40). tools/l57-check.py validates origin against the L57 enum (diff b-round-434/l57-check-diff.txt); backfill on c-round-420..434: 423 and 425 would fail (b-round-434/data/l57-enum-backfill.txt), 434 OK. Rejected: lane-handle lesson (1x, why-we-missed written in COPY-PD-VIS), origin-enum lesson text (tool instead). Number checker in tools/l58-check.py not built: RC-R435-NUMBER-CHECKER candidate.')
b['retro_candidates'].append({'id': 'RC-R435-NUMBER-CHECKER', 'decision': 'D-29z1541', 'status': 'candidate (not built)', 'note': 'tech-lead: tools/l58-check.py (or a sibling) greps every number a task asserts in the file and JSON key the L56 clause makes it name; until built, C CLAIMS rows grep by hand'})
# D-29z1542: systemic task + screen + regression scope
closes = ['A-R430-REVIEW-NF2-TYPE-BOUNDARY', 'A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT', 'A-R430-REVIEW-NF2-CLASSNAME-CONST', 'A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE', 'A-R431-REVIEW-L2-RD2-DATA-TYPE', 'A-R431-REVIEW-L3-RD2-DATETIME-LOCAL', 'A-R432-REVIEW-RV432-5-PG2-SPREAD', 'A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS', 'GATE434-S2-DS4-SOURCE-SCAN-SCOPE', 'GATE431-REVIEW-L3-STRING-COUNT-PINS', 'A-R429-REVIEW-SCAN-NEGATED-REPEAT']
for i in closes:
    F[i]['systemic_task'] = 'SYS-R435-SOURCE-SCAN-HELPER (D-29z1542)'
b['systemic_tasks'].append({'id': 'SYS-R435-SOURCE-SCAN-HELPER', 'decision': 'D-29z1542', 'added': BY, 'origin': 'RETRO 435 section 11 (tech-lead)', 'status': 'queued (after COPY-PD-VIS, before SYS-1; must land before the first ARCH-SPLIT stage)', 'scope': 'test-only: one shared source-scan helper that parses whole JSX tags (L13), rejects spreads and style= inside the tag and walks subfolders recursively; port the six scanners (studio-number-field, studio-radio, studio-progress, studio-search-field, studio-dialog-scrollbar, held-enter-source-scan tests in app/lib/arrangement/__tests__) to it with behaviour-preserving mutants', 'closes': closes, 'why_now': 'DS4 scans only top-level arrangement/*.tsx; files moved into subfolders by ARCH-SPLIT would pass silently (L8)'})
b['screen_review_candidates'].append({'id': 'SR-435-1', 'decision': 'D-29z1542', 'severity': 'medium (product-designer rating; not a bug)', 'status': 'awaiting_user (questions-retro-435.md Q4); default = Saba-approved From/To', 'note': 'STUDIO-VIS-6 drops the unit; the fields show bare seconds next to Start 00:48.000; options From (s)/To (s) or mm:ss.mmm values', 'source': 'user-review/screen-review-435.md'})
b['screen_review_candidates'].append({'id': 'SR-435-2', 'decision': 'D-29z1542', 'severity': 'low', 'status': 'scope addition to STUDIO-VIS-4 (COPY-PD-VIS), not a new task', 'note': 'footer status line text " · source offset " (strings.ts clip-offset-label, separate from sourceOffsetLabel); COPY-PD-VIS row: no "source offset" in the DOM at either viewport', 'source': 'user-review/screen-review-435.md'})
F['STUDIO-VIS-4']['scope_r435'] = 'also the footer status string " · source offset " (strings.ts id clip-offset-label), SR-435-2 (D-29z1542)'
for s in b['screen_review_candidates']:
    if s.get('id') == 'SR-420-2':
        s['note'] += ' | RETRO 435 (D-29z1542): also Clip details naming a clip that is off screen while the playhead runs elsewhere (journey435-2-*-1440x900)'
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-2026-11-13':
        r.setdefault('scope_additions', []).append({'id': 'REG-PERF-FULL-SUITE', 'what': 'run npm run test:perf alone (L38) on a production build and compare every interact.* components row with the last green run (c-round-424 perf); tech-lead RETRO 435 item 5: skipping it hid C-R423-01', 'decision': 'D-29z1542'})
dec('D-29z1542', 'RETRO 435 systemic task SYS-R435-SOURCE-SCAN-HELPER (tech-lead item 3; closes 11 deferred Lows, ids in systemic_tasks); screen review user-review/screen-review-435.md: SR-435-1 (awaiting_user, Q4), SR-435-2 (STUDIO-VIS-4 scope), SR-420-2 note; REGRESSION-2026-11-13 gains REG-PERF-FULL-SUITE. Project-rule proposals for Saba (retro-435 section 12, not applied): perf subset + perf/lib in verify; Playwright Firefox on the runner; DESIGN_SYSTEM/TAILWIND_FIRST "no browser-default control chrome".')
# D-29z1543: RETRO record + order
rp = b['retro_policy']
rp['next_due'] = 'round 450 or the end of the next queue entry, whichever first (retro 450 window 435-449) (D-29z1543) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, 'retro-435: counters for RETRO 450 (tech-lead): l58-check rc0 on 100% of sketches; l57-check rc0 with the origin enum; every round whose sketch changes fiber structure (every ARCH-SPLIT stage) has a saved test:perf log; C FAIL <= 1 and fix-up chain < 15 %; round median <= $17.00 and B median <= $14.50; L23 and L58 each < 5100 bytes and lessons <= 60 lines')
b['retro_runs'].append({'round': 435, 'decision': 'D-29z1543', 'window': '420-434', 'report': 'retros/retro-435.md', 'lessons': 'lessons.md (60 lines): l.3 pointer; L37 fiber-structure perf clause; L56 number/name names its file and JSON key (tech-lead); diff b-round-434/lessons-diff.txt', 'data': 'b-round-434/*.py run on b-round-434/backlog-retro-input.json (v418) + archive-findings-snapshot.json; outputs b-round-434/data/', 'consults': {'tech-lead': 'used (b-round-434/consult-tech-lead.md)', 'product-designer': 'used (screen + journey review, b-round-434/consult-product-designer.md)', 'advisor': 'used (planning approach)', 'qa-engineer': 'not in the B consult list; not called', 'consequence-tester': 'not in the B consult list; not called', 'design-philosopher': 'not in the B consult list; not called', 'first-visit-host': 'not in the B consult list; not called'}, 'trigger': '15 rounds since RETRO 420'})
dec('D-29z1543', 'RETRO 435 dispatched as round 435 (window 420-434: 15 rounds, 14 PASS, 1 FAIL (423), $255.35, round median $15.62, B median $11.63; retros/retro-435.md). Order after it: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (with REG-PERF-FULL-SUITE); otherwise 436 COPY-PD-VIS (STUDIO-VIS-4/6/7/10 + SABA-LANE-RESIZE-HANDLE; Mediums first under the 2026-10-23 bug gate - B differs from tech-lead, who put SYS-R435 before COPY-PD-VIS; both precede ARCH-SPLIT) -> SYS-R435-SOURCE-SCAN-HELPER -> SYS-1 -> SYS-3 -> STORE-REDESIGN 2b..5 -> ARCH-SPLIT (L37 perf clause in place) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). STEM-LANES jumps ahead when Saba answers AGREE-STEM-LANES. Next RETRO round 450.')
b['current_task'] = 'Round 435: RETRO 435 (window 420-434); no app code; C verifies traceability + auth + smoke + screen (current-task.md)'
b['version'] = 419
b['updated'] = '2026-11-10 (B round 434 -> 435 planning: round 434 accepted; RETRO 435 dispatched)'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n'); print('ok v419')
