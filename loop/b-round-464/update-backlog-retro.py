# B round 464 -> 465 planning, part 2: RETRO 465 outputs and dispatch of round 465. Usage: python3 -I b-round-464/update-backlog-retro.py <loop root>. Idempotent (.done).
import json, os, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-464/update-backlog-retro.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
b = json.load(open(P, encoding='utf-8'))
TODAY = '2026-11-12'; BY = '2026-11-12 B round 464 -> 465 planning (RETRO 465)'
b['version'] += 1; b['updated'] = TODAY
def find(lst, i):
    return next((e for e in lst if isinstance(e, dict) and e.get('id') == i), None)
def pre(e, key, txt):
    e[key] = txt + ' | ' + str(e.get(key, ''))
b['current_task'] = 'Round 465: RETRO 465 (rounds 450-464) + whole-screen and journey review; no app code (current-task.md, D-29z1640)'
b['rounds'].append({'round': 465, 'task': 'current-task.md', 'decision': 'D-29z1640', 'type': 'RETRO 465 (window 450-464): retro-465.md, lessons (L52/L56/L18/L60 clauses, net -1058 B), screen-review-465.md, questions-retro-465.md; no grants', 'status': 'dispatched', 'note': 'baseline 6d321c7 (gate 464 published); manifest b-round-464/r465-tree-sha256.txt (1377)'})
rc = b['retro_candidates']
R = {
 'RETRO465-B-EXCLUSION-LIST-AS-STRONGER': 'ruled (D-29z1639): merged into the L52 clause "A guard must be able to disagree with what it checks" (tech-lead)',
 'RETRO465-B-GENERATOR-TEST-SHARED-RULE': 'ruled (D-29z1639): merged into the L52 clause "A guard must be able to disagree with what it checks" (tech-lead)',
 'RETRO465-B-WALKER-STOP-LOSS': 'ruled (D-29z1639): resolver half merged into the L52 clause; stop-loss half rejected as a lesson (already the D-29z1621/D-29z1623 ruling on TL-R455-WALKER-LIMITS, 1x) (tech-lead)',
 'RETRO465-B-PRECHECK-TREE-NOT-DELIVERED': 'ruled (D-29z1639): adopted as the L56 clause "Pre-check tree = delivered tree" (tech-lead)',
 'RETRO465-B-PREHYDRATION-HANDSHAKE': 'ruled (D-29z1639): adopted as one sentence in L18 "First painted frame" (tech-lead)',
}
for i, st in R.items(): pre(find(rc, i), 'status', st)
pre(find(rc, 'RC-R305-LESSON-CHAR-CAP'), 'status', 'counter for RETRO 480 (D-29z1639): L23 5058 -> 4623, L58 4988 -> 4710 bytes; lessons.md 58399 -> 57341 bytes (b-round-464/lessons-diff.txt)')
pre(find(b['open_findings'], 'INFO-A451-L60-SED-DOC'), 'status', 'ruled (D-29z1639): evidence id on the L60 store-tree clause, (1x) -> (2x); no new clause')
rc.append({'id': 'RETRO480-PINNED-SKETCH-MICRO-FIX', 'added': BY, 'decision': 'D-29z1639', 'status': 'counter for RETRO 480; proposal to Saba/root (questions-retro-465.md Q7); not applied',
           'text': 'tech-lead: hash-pinned sketches turn every A reviewer Medium into STOP + C FAIL + a new round (451, 456, 457, 459). Proposal: a B-pre-ruled micro-fix class A may apply to the sketch, proven by a mutant. Touches "writer does not verify"; Saba/root only.'})
rc.append({'id': 'RETRO480-COLLECTOR-UNDERCOUNT', 'added': BY, 'decision': 'D-29z1639', 'status': 'counter for RETRO 480',
           'text': 'RETRO data collectors missed facts: stops-count.txt (regex from RETRO 450) found 3 STOPs, the a-round-N.md heads show 5 (457, 459 missed; b-round-464/data/stops-head.txt); B cost of round 459 is a lower bound (b-round-458-result.json.attempt1.json is 0 bytes). Check every collector against the raw report heads (same class as the L52 clause).'})
b['retro_runs'].append({'round': 465, 'decision': 'D-29z1640', 'window': '450-464', 'report': 'retros/retro-465.md',
    'lessons': 'lessons.md (60 lines, 58399 -> 57341 B): l.3 pointer; L52 guard-can-disagree; L56 pre-check tree = delivered tree; L18 pre-hydration handshake; L60 evidence; L23/L58 evidence trimmed (all tech-lead); diff b-round-464/lessons-diff.txt',
    'data': 'b-round-464/*.py + misc-outputs.sh + stops-head.sh + deferred-added.py on b-round-464/backlog-retro-input.json (v457) + archive-findings-snapshot.json; outputs b-round-464/data/',
    'screen': 'user-review/screen-review-465.md (SR-465-1..3); captures b-round-464/screens/', 'questions': 'user-review/questions-retro-465.md Q1-Q7',
    'systemic': 'SYS-R465-DEAD-CSS-MATCHER (planned with trigger, not dispatched)',
    'consults': {'tech-lead': 'used (b-round-464/consult-tech-lead.md)', 'product-designer': 'used (b-round-464/consult-product-designer.md)', 'advisor': 'used (planning approach)',
                 'qa-engineer': 'not in the B consult list; not called', 'consequence-tester': 'not in the B consult list; not called', 'design-philosopher': 'not in the B consult list; not called', 'first-visit-host': 'not in the B consult list; not called'},
    'trigger': '15 rounds since RETRO 450', 'status': 'dispatched (D-29z1640)'})
pol = b['retro_policy']
pol['next_due'] = 'round 480 or the end of the next queue entry, whichever first (retro 480 window 465-479) (D-29z1640) | ' + pol['next_due']
pol['signals_for_next_retro'].insert(0, 'retro-465: counters for RETRO 480 (tech-lead): round median <= $18.00; B median <= $13.00; B share <= 68 %; C FAIL <= 2; new deferred Lows <= 35 (window 450-464: 52 by added-at planning, b-round-464/data/deferred-added.txt; 49 by id round, classify.txt); l58-check 15/15 (task 458 INCOMPLETE); lessons <= 60 lines and <= 57,500 B, L23 and L58 each < 5100 B; at most one full tech-lead review + one delta review per sketch (a third needs a written reason in sketch-review.md); new one-off .py per b-round-N/ <= 2 (RETRO rounds excepted). RETRO 450 counters result: round median 20.25 MISSED (<= 17.00), B median 14.44 MISSED (<= 12.50), B share 71.7 % MISSED (<= 70), l57 15/15 MET, deferred Lows 52 MISSED (<= 30), lessons 60 lines MET; reuse hypothesis not confirmed (2b-3b..3d B average $15.08 vs $13.73)')
b['systemic_tasks'].append({'id': 'SYS-R465-DEAD-CSS-MATCHER', 'decision': 'D-29z1639', 'added': BY, 'origin': 'RETRO 465 section 11 (tech-lead)',
    'what': 'test-only: store-dead-css.test.ts private withoutComments and "used" matcher replaced by one exported string-aware comment stripper + one isUsedInSource helper in app/lib/__tests__/helpers/style-scan.ts; DC1-DC4 verdicts equal HEAD (L4 Port preserves HEAD: golden test + HEAD-pin mutants both ways; L52 clause: guard and subject can disagree)',
    'closes': ['TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR', 'A-R464-REVIEW-L3', 'A-R464-REVIEW-L4', 'A-R464-REVIEW-L5', 'A-R464-REVIEW-L6', 'SIG-R464-THIRD-COMMENT-STRIPPER'],
    'closes_conditional': {'SIG-R463-USED-DEFINED-TWICE': 'only if b-round-462/css-prune.py is retired or calls the helper'},
    'does_not_close': ['A-R463-REVIEW-L1', 'A-R463-REVIEW-L6', 'TL-R464-L2-MATCHER-FAILS-RED-FORMS (fail-red by design)', 'TL-R458-L1..L4 and C-R458-L1/L2 (walker)'],
    'status': 'planned, not dispatched (D-29z1639): trigger, whichever first: root answers ARCH-CHECKPOINT-STYLE-SCAN; the next dead-CSS deletion stage is planned; round 480. Reason (tech-lead): all closed Lows are 0 cases in app/ today; unify-then-split would be two ports',
    'risk': 'the port silently changes DC1/DC2 verdicts'})
for i in ['TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR', 'A-R464-REVIEW-L3', 'A-R464-REVIEW-L4', 'A-R464-REVIEW-L5', 'A-R464-REVIEW-L6']:
    find(b['deferred_low_polish'], i)['systemic_task'] = 'SYS-R465-DEAD-CSS-MATCHER'
find(b['architecture_signals'], 'SIG-R464-THIRD-COMMENT-STRIPPER')['systemic_task'] = 'SYS-R465-DEAD-CSS-MATCHER'
cp = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-STYLE-SCAN')
pre(cp, 'status', 'deadline round 480 (D-29z1639, tech-lead: an unanswered root checkpoint gets a deadline); re-raised at RETRO 465; if still unanswered at round 480, B plans SYS-R465-DEAD-CSS-MATCHER without it')
for n, w, s in [(1, 'Premium card: chip "✦ PREMIUM" directly above the name "Premium" (one word twice); proposal: chip says what Premium adds ("Includes stems") or is dropped (Saba)', 'journey465-1-product-*'),
                (2, 'both version cards repeat "WAV" and "24-bit / 48 kHz"; proposal: shared format once (default inside "What\'s included"), cards show only differences; question Q6', 'journey465-1-product-*'),
                (3, 'library list scrolls the selected item into view leaving the top row half cut; proposal: scroll by whole rows (behaviour only)', 'journey465-2-studio-playing-*')]:
    b['screen_review_candidates'].append({'id': f'SR-465-{n}', 'decision': 'D-29z1638', 'severity': 'low', 'what': w, 'png': f'b-round-464/screens/{s}',
        'source': 'user-review/screen-review-465.md; b-round-464/consult-product-designer.md', 'status': 'awaiting_user (D-29z1638): candidate; nothing implemented until Saba answers', 'added': BY})
Q = 'user-review/questions-retro-465.md'
tl = b['tech_lead_manual_checks']
for i, q in [('TLM-PERF15-FIREFOX', 'Q1 (fifth question)'), ('TLM-R454-FIREFOX-SAFARI-SCROLLBAR', 'Q1 + Q2 (first question)'), ('TLM-R455-FIREFOX-SEEK-THUMB', 'Q1 (first question)'),
             ('TLM-R459-FIREFOX-SAFARI-ENTRANCE', 'Q1 + Q2 (first question)')]:
    e = find(tl, i); e['deadline'] = 'RETRO 480 (D-29z1638) | ' + str(e.get('deadline', '')); pre(e, 'status', f'L46 question to Saba at RETRO 465 ({Q} {q}) (D-29z1638)')
e = find(tl, 'TLM-SYS3-IME-PLATFORMS'); e['deadline'] = 'RETRO 480 (D-29z1638) | ' + str(e.get('deadline', ''))
pre(e, 'status', f'L46 second RETRO without answer (D-29z1638): reopened as a task blocked on a real IME platform (Saba machine; cloud has none); {Q} Q3')
e = find(tl, 'TLM-R453-LEGACY-PLAYHEAD'); pre(e, 'status', 'deadline RETRO 465 met by the D-29z1610 supersession (HR-LEGACY rows); no question (D-29z1638)')
of = b['open_findings']
for i, t in [('TLM-SABA-B-12-FIREFOX-SAFARI', f'third RETRO (D-29z1638): Firefox half stays a task blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX ({Q} Q1); Safari half Tech Lead manual ({Q} Q2); deadline RETRO 480'),
             ('TL-R444-L1-REAL-IME-SEARCH-CLEAR', f'reopened with TLM-SYS3-IME-PLATFORMS as a task blocked on a real IME platform (D-29z1638; {Q} Q3); deadline RETRO 480'),
             ('TLM-R448-HIREUS-EMAIL-CLIENTS', f'L46 question to Saba (D-29z1638; {Q} Q5); deadline RETRO 480; does not block'),
             ('TLM-R449-WEBKIT-HEADING-INK', f'L46 question to Saba (D-29z1638; {Q} Q2); deadline RETRO 480; does not block'),
             ('A-R73-SAFARI-FLAG-FOCUS', f'listed in the Safari list ({Q} Q2, D-29z1638); does not block')]:
    pre(find(of, i), 'status', t)
rr = find(b['root_requests_b'], 'ROOT-REQ-PLAYWRIGHT-FIREFOX') or find(of, 'ROOT-REQ-PLAYWRIGHT-FIREFOX')
pre(rr, 'status', 're-raised at RETRO 465 (D-29z1638): ~/.cache/ms-playwright still has chromium-1200, chromium_headless_shell-1200, ffmpeg-1011 only; now blocks 5 Firefox checks (questions-retro-465.md Q1)')
sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
pre(sp, 'status', f'parked remainders asked a third time (D-29z1638, {Q} Q4): Saba design choices, L46 reopen does not apply; new deadline RETRO 480')
sr = find(b['post_current_stage_queue'], 'STORE-REDESIGN')
pre(sr, 'status', 'in_progress (D-29z1640): round 464 STORE-2b-3d-3 done (published 6d321c7); round 465 = RETRO 465; round 466 = REGRESSION-2026-11-13 if planned on/after 2026-11-13, else STORE-2b-3c-2b; then 2b-4, STORE-2c..5')
for d, txt in [
 ('D-29z1637', 'RETRO 465 data: window 450-464 (retro_policy next_due). Scripts copied from b-round-449 with the window and stage map changed; STOPs recounted from the a-round-N.md heads (stops-head.sh: 451, 456, 457, 459, 462 = 5; the RETRO 450 regex found 3); B cost of round 459 is a lower bound (0-byte attempt file); new deferred Lows counted by added-at planning (deferred-added.py: 52).'),
 ('D-29z1638', 'RETRO 465 L46 and screen: questions-retro-465.md Q1-Q7 (Firefox x5, Safari list, IME second time -> task blocked on a real IME platform, STUDIO-PERFORMANCE third time, Hire-Us e-mail clients, SR-465 + SR-450 info, micro-fix proposal); new deadlines RETRO 480; SR-465-1..3 awaiting_user; TLM-R453 met by supersession.'),
 ('D-29z1639', 'RETRO 465 lessons and candidates (tech-lead): L52 "A guard must be able to disagree with what it checks" (EXCLUSION-LIST-AS-STRONGER, GENERATOR-TEST-SHARED-RULE, resolver half of WALKER-STOP-LOSS; 4x); L56 "Pre-check tree = delivered tree" (2x); L18 pre-hydration handshake (1x); L60 evidence INFO-A451-L60-SED-DOC; l.3, L23, L58 trimmed; lessons 58399 -> 57341 B, 60 lines. SYS-R465-DEAD-CSS-MATCHER planned with trigger (root checkpoint answer, next dead-CSS deletion stage, or round 480), not dispatched; ARCH-CHECKPOINT-STYLE-SCAN deadline round 480. Counters for RETRO 480 recorded. New counters RETRO480-PINNED-SKETCH-MICRO-FIX, RETRO480-COLLECTOR-UNDERCOUNT.'),
 ('D-29z1640', 'Round 465 = RETRO 465 dispatched (current-task.md): no grants; frozen manifest b-round-464/r465-tree-sha256.txt (1377 entries, rc 0); C verifies traceability + auth guard + Studio smoke + screen capture in the browser. Next: round 466 = REGRESSION-2026-11-13 if planned on/after 2026-11-13 (regression-last 2026-11-10), else STORE-2b-3c-2b. retro_policy.next_due round 480.')]:
    b['decisions_log_b'].append({'id': d, 'date': TODAY, 'by': BY, 'decision': txt})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok version', b['version'])
