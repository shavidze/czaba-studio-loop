import json, sys
P = sys.argv[1]
b = json.load(open(P))
assert b['version'] == 514, b['version']
BY = '2026-11-14 B round 509 -> 510 planning (RETRO 510)'
def find(sec, i):
    for x in b[sec]:
        if isinstance(x, dict) and x.get('id') == i: return x
    raise KeyError(i)
def pre(x, s, key='status'):
    x[key] = s + ' | ' + str(x.get(key, ''))
SYS_CLOSES = ['A-R496-CR-BC5-CLASS-ONLY', 'A-R496-CR-BC6-BARE-BUTTON-TOKEN', 'A-R498-CR-ST5-EXACT-COUNT', 'A-R498-CR-ICON-ASSERT', 'A-R500-CR-B2B5-COMMENT-ANCHOR', 'A-R501-CR-ST5-STRING-PIN', 'A-R501-CR-B2B2-6-ONE-BUTTON', 'A-R501-CR-LUCIDE-CLASS', 'A-R503-CR-2-B2B3-6-WEAK-COUNT', 'A-R503-CR-3-STUBCATALOG-DRIFT', 'A-R504-CR-1-REDUNDANT-TEXT-BLACK', 'A-R504-CR-2-DISABLED-CLICK-NO-MUTANT', 'A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON', 'A-R506-CR-1-HOOKS-MOCK-BARREL', 'A-R508-CR-VOLUME-ICON-UNPINNED', 'A-R508-CR-MUTE-LOW-VOLUME-CLICK', 'A-R508-CR-USEAUDIO-MOCK-UNTYPED', 'A-R509-CR-TEST-SELECTORS']
dl = {x.get('id'): x for x in b['deferred_low_polish'] if isinstance(x, dict)}
for i in SYS_CLOSES:
    if i in dl:
        pre(dl[i], 'closes with systemic task DPG-BUTTON-CONTRACT-TABLE (D-29z1847)')
    else:
        x = None
        for e in b['open_findings']:
            if isinstance(e, dict) and e.get('id') == i: x = e
        assert x is not None, i
        pre(x, 'closes with systemic task DPG-BUTTON-CONTRACT-TABLE (D-29z1847)')
b['systemic_tasks'].append({"id": "DPG-BUTTON-CONTRACT-TABLE", "added": BY, "decision": "D-29z1847", "status": "queued (D-29z1847): DPG-FIX stage-2 close-out, after NONBRAND N2-N9 (each N stage adds its rows to the table when it exists); test-only; does not block", "what": "merge the store-button-cleanup*.test.tsx files (app/lib/__tests__) into one table-driven contract test: each migrated site renders and its sorted class set equals a rendered Button/IconButton/buildButtonClassName reference of its variant and size (as N1-7), plus per-site attribute and same-shape swap mutants (L52 RETRO 510 clause) and focus-precondition rows (L47); one CSS + TSX hand-rolled-token guard over app/; behaviour unchanged; B consults tech-lead on the table shape before dispatch", "closes": SYS_CLOSES, "source": "b-round-509/consult-tech-lead.md section 4"})
b['open_findings'].append({"id": "INFO-B510-CAPTURE-GAP", "severity": "info", "origin": "product-designer (RETRO 510)", "status": "open (D-29z1847): next RETRO capture (copy of b-round-509/screens/capture.mjs) adds a $0 product page via the L36 _data stub (b-round-508/probe/free-stub.cjs) and /cart with the mock API, so Store changes of the window are in the screen review", "title": "RETRO screen capture missed the window's Store changes (cart layout, Get it free): captured product is $29", "evidence": "b-round-509/consult-product-designer.md 'What the screenshots can and cannot show'", "added": BY})
b['screen_review_candidates'].append({"id": "SR-510-1", "decision": "D-29z1847", "severity": "low", "what": "first ruler label '0:00' half hidden under the playhead / start edge at 0 s", "png": "b-round-509/screens/screen510-full-S0-1440x900.png (x ~517; all four full screens)", "type": "visual", "source": "user-review/screen-review-510.md; b-round-509/consult-product-designer.md", "status": "awaiting_user (D-29z1847): candidate; no position move; not implemented until Saba answers"})
# L46 rulings
for i in ('TLM-R485-SR-ROUTE-ANNOUNCE', 'TLM-R489-SABA-ENTRANCE-FEEL', 'TLM-R489-TOUCH-SWIPE', 'TLM-R491-PHONE-NAME-EDITOR'):
    pre(find('tech_lead_manual_checks', i), 'joined task SABA-DEVICE-CHECKS (D-29z1846): second RETRO without an answer (L46; questions-retro-510.md Q1); does not block')
pre(find('tech_lead_manual_checks', 'TLM-R492-SR-PASSWORD-DIALOG'), 'first RETRO question (D-29z1846; questions-retro-510.md Q2); new deadline RETRO 525; joins SABA-DEVICE-CHECKS if unanswered; does not block')
for i in ('TLM-PERF15-FIREFOX', 'TLM-SYS3-IME-PLATFORMS', 'TLM-R454-FIREFOX-SAFARI-SCROLLBAR', 'TLM-R455-FIREFOX-SEEK-THUMB', 'TLM-R459-FIREFOX-SAFARI-ENTRANCE'):
    pre(find('tech_lead_manual_checks', i), 'RETRO 525 (D-29z1846; questions-retro-510.md Q3)', key='deadline')
pre(find('open_findings', 'TL-R444-L1-REAL-IME-SEARCH-CLEAR'), 'open blocked task unchanged; deadline RETRO 525 (D-29z1846; questions-retro-510.md Q3)')
sd = find('open_findings', 'SABA-DEVICE-CHECKS')
sd['note'] = 'members (D-29z1846): TLM-R468-SABA-SCROLL-DEVICE (SABA-B-15), TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR; TLM-R492-SR-PASSWORD-DIALOG joins if unanswered at RETRO 525 | ' + str(sd.get('note', ''))
pre(find('architecture_checkpoint_requests', 'ARCH-CHECKPOINT-ACCOUNT-PROFILE'), 'no root answer at RETRO 510 (D-29z1846); guard unchanged (account.tsx: only Critical/High/Medium fixes); questions-retro-510.md Q4; new deadline RETRO 525', key='deadline')
pre(find('retro_candidates', 'RETRO480-SINGLE-RUNNER-CONTROL'), 'retired (D-29z1846): no new case in 495-509 (no wall-clock control set); stays 1x evidence in retro-480/495')
pre(find('retro_candidates', 'RETRO495-SABA-RECURRENCE-ENTRANCE'), 'retired (D-29z1846): 0 entrance/duration complaints in 495-509')
for i in ('RC-R496-SKETCH-TEST-STRENGTH', 'RC-R499-L58-PLANNING-FAIL', 'RC-R507-SWAP-MUTANT'):
    x = find('retro_candidates', i)
    x['status'] = 'adopted (D-29z1847): lesson L52 "Site x attribute mutants (RETRO 510)" and L11 "Strengthen-only (RETRO 510)" (4x: STOPs 496/499/505/507) | ' + str(x.get('status', ''))
pre(find('retro_candidates', 'RC-R492-DOC-TRUTH-REVIEW'), 'reworded (D-29z1847): L26 "Behaviour sentences have a ledger (RETRO 510)", enforced by tools/ledger-check.py; RETRO 510 counter 5/11 by existence, 3/11 by the checker (b-round-509/data/ledger-check-window.txt)')
for i in ('INFO-B497-C15-UNMEASURED-ASSERT', 'INFO-C505-UNRULED-STOP-PASS', 'INFO-B505-SKETCH-REVIEWER-MEDIUM'):
    pre(find('open_findings', i), 'closed (D-29z1846): used as RETRO 510 input (retros/retro-510.md section 3/10)')
b['retro_candidates'].append({"id": "RC-R510-SKETCH-SCOPE", "added": BY, "decision": "D-29z1847", "status": "adopted for trial (D-29z1847) in rounds 511-525: full byte sketches only for product-code hunks that carry risk; A writes tests and doc against B's contract (site x attribute mutant list, ledger rows, claims); B's mutants must be red on A's tests (C re-runs them). Counter RETRO 525: B median <= $12, STOPs on B sketch test lines <= 1", "note": "tech-lead RETRO 510 section 3: B $6.74 (497), $8.95 (508 delta), $8.63 (509) without a full byte sketch vs median ~ $17 with one; all 4 STOPs were on byte-sketch rounds (inference: cost driver)"})
b['retro_runs'].append({"round": 510, "decision": "D-29z1845", "window": "495-509", "report": "retros/retro-510.md", "lessons": "lessons.md (60 -> 59 lines, 57164 -> 57435 B; longest 4771 B): L11 strengthen-only, L26 ledger reworded (tools/ledger-check.py), L52 site x attribute mutants, L1 run task greps at HEAD (2x); removed l.43 cross-reference; header compacted; diff b-round-509/lessons-diff.txt; logs edit-lessons.log, edit-lessons-2.log", "data": "b-round-509/*.py + misc-outputs.sh + stops-head.sh + deferred-closed.py on b-round-509/backlog-retro-input.json (v514); outputs b-round-509/data/", "screen": "user-review/screen-review-510.md (SR-510-1 Low; INFO-B510-CAPTURE-GAP); captures b-round-509/screens/", "questions": "user-review/questions-retro-510.md Q1-Q6", "systemic": "DPG-BUTTON-CONTRACT-TABLE (after NONBRAND N2-N9; closes 18 deferred test-strength Lows)", "consults": {"tech-lead": "used (b-round-509/consult-tech-lead.md)", "product-designer": "used (b-round-509/consult-product-designer.md)", "qa-engineer/consequence-tester/design-philosopher/first-visit-host": "not on this round's B consult list (2026-11-04 section 6)"}, "counters_result": "C FAIL+BLOCKED 3 MISSED (<=2); STOPs B spec 4 MISSED (<=1), doc 0 MET; l57 15/15 MET; doc ledger 5/11 MISSED; lessons MET; fix-up chain 1 MET; deferred 79 new / 3 closed MISSED; round median 19.39 MISSED (<=18); B median 15.16 MISSED (<=13); B share 78.5 % MISSED (<=68); extra: l58 13/15 (507, 508 INCOMPLETE)"})
rp = b['retro_policy']
rp['next_due'] = 'round 525 or the end of the next queue entry, whichever first (retro 525 window 510-524) (D-29z1845) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, 'retro-510: counters for RETRO 525 (tech-lead): C FAIL + BLOCKED <= 2 of 15; STOPs on a B sketch test line <= 1; l58-check 15/15 and tools/ledger-check.py 15/15 on tasks with a doc sketch; l57-check 15/15; doc ledger >= 90 % for sketches with doc text; lessons <= 57,500 B, <= 60 lines, no line > 4,800 B; fix-up chain <= 1; deferred <= 50 new and >= 10 closed (>= 15 if DPG-BUTTON-CONTRACT-TABLE lands); round median <= $17; B median <= $12; B share <= 70 %. RETRO 495 counters result: see retro_runs round 510 counters_result.')
for rd in b['rounds']:
    if rd.get('round') == 509: break
b['rounds'].append({"round": 510, "task": "current-task.md", "decision": "D-29z1848", "type": "RETRO 510 (window 495-509) + whole-screen and journey review; no app code", "status": "dispatched", "note": "baseline HEAD f5d1b9e; no grants; tree pins b-round-509/r510-tree-sha256.txt (1428); claims b-round-509/claims-510.sh"})
b['decisions_log_b'] += [
 {"id": "D-29z1844", "date": "2026-11-14", "by": BY, "decision": "Order: round 510 = RETRO 510, window 495-509 (retro_policy.next_due D-29z1769; task 509 section 0). C 509 PASS with 0 bugs, no Critical open, the one open High (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED) is root/backend; REGRESSION not due (regression-last 2026-11-13, next on/after 2026-11-16)."},
 {"id": "D-29z1845", "date": "2026-11-14", "by": BY, "decision": "RETRO 510 data: scripts copied from b-round-494 and repointed (495->510, 494->509, 480->495; stage map and D-range 1772..1841 by hand); input frozen as b-round-509/backlog-retro-input.json (v514); retro_runs round 510; next_due round 525; RETRO 525 counters (tech-lead) recorded in retro_policy.signals_for_next_retro[0]. stops-head.sh regex misses 496 and 505: true STOP list in data/stops-true.txt."},
 {"id": "D-29z1846", "date": "2026-11-14", "by": BY, "decision": "RETRO 510 L46 rulings: four RETRO-495 Q2 manual checks joined SABA-DEVICE-CHECKS; TLM-R492-SR-PASSWORD-DIALOG first question (Q2), deadline RETRO 525; Firefox/Safari/IME deadlines RETRO 525 (Q3); ARCH-CHECKPOINT-ACCOUNT-PROFILE unanswered, guard kept, RETRO 525 (Q4); RETRO480-SINGLE-RUNNER-CONTROL and RETRO495-SABA-RECURRENCE-ENTRANCE retired; INFO-B497-C15, INFO-C505-UNRULED-STOP-PASS, INFO-B505-SKETCH-REVIEWER-MEDIUM closed as used inputs. questions in user-review/questions-retro-510.md."},
 {"id": "D-29z1847", "date": "2026-11-14", "by": BY, "decision": "RETRO 510 changes: lessons L52 site x attribute mutant clause, L11 strengthen-only clause (loop-internal grant rule; B adopts tech-lead proposal B), L26 ledger clause reworded + new tools/ledger-check.py, L1 run task greps at HEAD (2x incl. round 509 A dev 1); 57,435 B / 59 lines. Systemic task DPG-BUTTON-CONTRACT-TABLE (closes 18 deferred test-strength Lows) queued after NONBRAND N2-N9. RC-R510-SKETCH-SCOPE adopted for trial (full byte sketches only for risky product hunks). Screen review: SR-510-1 (Low, awaiting_user), INFO-B510-CAPTURE-GAP. Project-rule proposals only in retro-510 section 12."},
 {"id": "D-29z1848", "date": "2026-11-14", "by": BY, "decision": "This task (round 510, RETRO; C checks traceability, lessons, auth/protection, anonymous /studio-lab real-audio smoke and screen counts) and the order after it: round 511 = REGRESSION if planned on/after 2026-11-16, else NONBRAND N2 (product page: PurchaseHeader in-card siblings + PlayStems; sidebar already done in 509) under RC-R510-SKETCH-SCOPE; then N3-N9, StemsPlayerModal pair (needs ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE stems half), PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE, rest of DPG P1, DP gate, P2."},
]
for q in b['post_current_stage_queue']:
    if isinstance(q, dict) and q.get('id') == 'DPG-FIX':
        q['status'] = 'in_progress (D-29z1848): round 509 B-R507 sidebar C PASS (published f5d1b9e); round 510 RETRO 510; then REGRESSION if on/after 2026-11-16, NONBRAND N2-N9, StemsPlayerModal pair, PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE (stage-2 close-out), rest of P1, DP gate, P2 | ' + q['status']
b['current_task'] = 'Round 510: RETRO 510 (window 495-509) + whole-screen and journey review. No app code; A implements nothing. C checks traceability of retros/retro-510.md numbers and causes, lessons.md edits, tools/ledger-check.py, questions/screen-review files, protection and anonymous /studio-lab real-audio smoke + screen counts.'
b['version'] = 515
b['updated'] = BY
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok v515')
