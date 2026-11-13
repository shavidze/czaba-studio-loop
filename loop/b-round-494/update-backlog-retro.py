# B round 494 -> 495 planning: RETRO 495 backlog update (D-29z1767..D-29z1770). Run once from the loop root.
import json, os, sys
M = 'b-round-494/update-backlog-retro.done'
if os.path.exists(M): sys.exit('refused: .done marker exists')
if not os.path.exists('b-round-494/update-backlog-accept.done'): sys.exit('accept first')
b = json.load(open('backlog.json'))
BY = '2026-11-13 B round 494 -> 495 planning (RETRO 495)'
def get(sec, i):
    for e in b[sec]:
        if isinstance(e, dict) and e.get('id') == i: return e
    raise SystemExit(f'missing {sec}:{i}')
def pre(e, key, s): e[key] = s + ' | ' + str(e.get(key, ''))
# retro run + policy
b['retro_runs'].append({'round': 495, 'decision': 'D-29z1769', 'window': '480-494', 'report': 'retros/retro-495.md',
  'lessons': 'lessons.md (60 lines, 58361 -> 57164 B; longest l.41 4771 B): L26 doc ledger clause, L47 async-settle focus clause, L52 reviewer-fix mutant clause, L57 B-enforces clause; narrative trims L1/L11/L12/L14/L18/L26/L28/L38/L39/L41/L44/L45/L46/L48/L49/L57/L58/L59/L61; diff b-round-494/lessons-diff.txt; logs edit-lessons.log, edit-lessons-2.log',
  'data': 'b-round-494/*.py + misc-outputs.sh + stops-head.sh on b-round-494/backlog-retro-input.json (v484); outputs b-round-494/data/',
  'screen': 'user-review/screen-review-495.md (no new SR); captures b-round-494/screens/',
  'questions': 'user-review/questions-retro-495.md Q1-Q6', 'systemic': 'SYS-R495-SHARED-DIALOG (blocked on root; after DPG-BUTTON-CLEANUP)',
  'consults': {'tech-lead': 'used (b-round-494/consult-tech-lead.md)', 'product-designer': 'used (b-round-494/consult-product-designer.md)', 'qa-engineer/consequence-tester/design-philosopher/first-visit-host': 'not on B consult list (2026-11-04 section 6); not called'}})
rp = b['retro_policy']
rp['next_due'] = 'round 510 or the end of the next queue entry, whichever first (retro 510 window 495-509) (D-29z1769) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, 'retro-495: counters for RETRO 510 (tech-lead): C FAIL + BLOCKED <= 2 of 15; STOPs with origin B spec <= 1 and 0 on a doc sentence; c-round-N/l57-check.txt with L57 OK 15/15; every round that ships an implementation doc has b-round-(N-1)/doc-ledger.md 100 %; lessons.md <= 57,500 B, <= 60 lines, no line > 4,800 B; longest fix-up chain <= 1; deferred Lows <= 35 new and >= 12 closed. RETRO 480 counters result: C FAIL+BLOCKED 4 MISSED (<= 2); STOP rounds 4, 2 on an unruled sketch Medium (487, 489) MISSED; l58 15/15 MET; l57 11/15 MISSED (>= 14); lessons 58,361 B and l.41 4,941 B MISSED before the trim (57,164 B, l.41 4,771 B after); fix-up chain 492-493-494 length 2 MISSED; deferred 56 new / 6 closed MISSED. Cost: round median 16.77 MET (<= 18), B median 12.58 MET (<= 13), B share 70.9 % MISSED (<= 68).')
# candidates
rc = {e.get('id'): e for e in b['retro_candidates'] if isinstance(e, dict)}
def rule(i, s):
    e = rc.get(i)
    if e is None: raise SystemExit('missing candidate ' + i)
    e['status'] = s + (' | ' + e['status'] if e.get('status') else '')
rule('RC-R492-DOC-TRUTH-REVIEW', 'adopted (D-29z1769): lesson L26 "Every sentence has a ledger" (2x: C-R492-01, C-R493-01); RETRO 510 counter doc-ledger 100 %')
rule('RC-R492-EXIT-ANIMATION-DIALOG', 'ruled (D-29z1769): 1x and caught before dispatch; becomes rows of SYS-R495-SHARED-DIALOG (Tab and reopen during the exit animation), not a lesson')
rule('RC-R483-SINGLE-SAMPLE-ASSERT', 'ruled (D-29z1769): 1x (C round 483 observation only); stays a candidate; the next REGRESSION task words c250 splitPlaying as a fraction over a window (record) instead of one instant')
rule('RC-R483-PRECEDENT-LOOKUP', 'ruled (D-29z1769): 1x; stays a candidate; the next REGRESSION task greps the template round C report for each copied row ruling (L6 carry)')
rule('RC-R486-PRIMITIVE-FOCUS-EXAMPLES', 'ruled (D-29z1769): confirmed by b-round-494/primitive-staleness.txt (FORWARDREF_COMPONENT.md l.57/l.150/l.152, DESIGN_TOKENS.md l.101); added to ROOT-REQ-DPG-PRIMITIVES-PATCH; proposal for Saba/root only')
rule('RC-R471-L58-SKIPPED', 'closed (D-29z1769): l58-check 15/15 in window 480-494')
rule('RC-R476-SKETCH-RULE-REVIEW', 'ruled (D-29z1769): counter MISSED (487, 489); new L47 async-settle and L52 reviewer-fix mutant clauses; proposal RETRO495-CODE-REVIEWER-ON-B for root')
rule('RETRO480-SINGLE-RUNNER-CONTROL', 'ruled (D-29z1769): no new case in 480-494; still 1x; counter to RETRO 510')
b['retro_candidates'] += [
 {'id': 'RETRO495-CODE-REVIEWER-ON-B', 'added': BY, 'status': 'proposal for root (D-29z1769)', 'note': "tech-lead (b-round-494/consult-tech-lead.md section 2): 487 and 489 Mediums were found by A's code-reviewer on sketches B had reviewed with tech-lead only; l58-check checks the review's form (sha, verdict), not content. Proposal: root adds code-reviewer to B's consult list; until then B's sketch-review brief carries A's reviewer questions (what happens after each await; which mutant covers each side of each new branch)"},
 {'id': 'RETRO495-ATTEMPT-COST-LOST', 'added': BY, 'status': 'proposal for root (D-29z1769)', 'note': 'b-round-491-result.json.attempt1.json is 0 bytes, so round 492 planning cost is unknown (B 1.60 in b-round-494/data/cost.txt); the runner should keep the cost of an interrupted attempt'},
 {'id': 'RETRO495-STOP-LIST-OVERRIDE', 'added': BY, 'status': 'adopted (D-29z1769): in L26 new clause ("a task STOP list never overrides the clause above")', 'note': "tech-lead: tasks/round-493.md l.96-102 made a false doc line a STOP instead of letting A correct it on its own line (L26 round-473 clause); that made the 492 chain length 2"}]
# info for L57 misses
b['open_findings'].append({'id': 'INFO-B495-L57-MISSES', 'severity': 'info', 'origin': 'B spec', 'status': 'closed (D-29z1769): recorded; enforcement in L57 "B enforces it" clause and RETRO 510 counter',
  'title': 'c-round-485/487/488/493 have no l57-check.txt; tasks 485/488 had no l57-check row, tasks 487/493 short routes skipped it', 'evidence': 'b-round-494/data/l57-check-window.txt, l57-coverage.txt; b-round-494/consult-tech-lead.md section 5', 'added': BY})
# systemic task
b['systemic_tasks'].append({'id': 'SYS-R495-SHARED-DIALOG', 'added': BY, 'decision': 'D-29z1769',
  'status': 'blocked_root (D-29z1769): needs a root grant for app/components/ui/Modal.tsx (global_forbidden_files) and the answer to ARCH-CHECKPOINT-ACCOUNT-PROFILE; queued after DPG-BUTTON-CLEANUP; does not block',
  'what': 'one shared dialog primitive (focus in, Tab trap, Esc stack with stopPropagation, full-viewport backdrop, focus return; rows for Tab and reopen during the exit animation, RC-R492-EXIT-ANIMATION-DIALOG); PasswordModal migrates out of app/routes/account.tsx onto it; LeadMagnetPopup and ExportDialog later',
  'closes': ['TL-R492-L4-CTRLK-OVER-DIALOG', 'A-R492-REVIEW-I1-PALETTE-TRAP', 'A-R492-REVIEW-L5-TABBABLE-SELECTOR', 'A-R492-REVIEW-L1-IME-KEYCODE229', 'B-R492-PASSWORD-BACKDROP-SHORT', 'B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW', 'A-R492-REVIEW-L4-REOPEN-MOUSE', 'shared-modal-no-focus-management'],
  'source': 'b-round-494/consult-tech-lead.md section 4', 'root_request': 'ROOT-REQ-SHARED-DIALOG-GRANT'})
b['root_requests_b'].append({'id': 'ROOT-REQ-SHARED-DIALOG-GRANT', 'added': BY, 'status': 'open',
  'request': 'SYS-R495-SHARED-DIALOG needs app/components/ui/Modal.tsx (global_forbidden_files) granted for one bounded round, or root names another owner file for a new shared dialog primitive; answer together with ARCH-CHECKPOINT-ACCOUNT-PROFILE. Closes 8 deferred ids (retro-495.md section 11)'})
rr = get('root_requests_b', 'ROOT-REQ-DPG-PRIMITIVES-PATCH')
rr['note'] = rr.get('note', '') + ' | Update RETRO 495 (D-29z1769): unchanged since bbb3193 (b-round-494/primitive-staleness.txt: teal 3/2/1, fonts 3/2/9); add the focus examples FORWARDREF_COMPONENT.md l.57, l.150, l.152 and DESIGN_TOKENS.md l.101 (focus-visible:ring-2 / focus:ring-2 / outline-none) that contradict the shared :focus-visible rule (RC-R486-PRIMITIVE-FOCUS-EXAMPLES)'
ac = get('architecture_checkpoint_requests', 'ARCH-CHECKPOINT-ACCOUNT-PROFILE')
ac['confirmedBy'] = (ac.get('confirmedBy', '') + ' | ' if ac.get('confirmedBy') else '') + 'gate 494 Architecture note: extract PasswordModal to app/components/account/PasswordDialog.tsx with passwordModalOpenRef/closePasswordModal in the parent, PD1-PD15/PN unchanged (D-29z1769)'
ac['deadline'] = 'RETRO 510 (L46, D-29z1769); until root answers, no further app/routes/account.tsx task except a Critical/High/Medium fix (tech-lead RETRO 495 section 7)'
# L46 rulings
b['open_findings'].append({'id': 'SABA-DEVICE-CHECKS', 'severity': 'medium', 'origin': 'environment', 'added': BY,
  'status': 'open_tech_lead_manual (D-29z1768; does not block): opened by L46 after two RETROs without an answer (questions-retro-480.md Q1, questions-retro-495.md Q1); blocked on Saba\'s own device',
  'title': "Saba's-device checks opened as one task by L46", 'covers': ['TLM-R468-SABA-SCROLL-DEVICE (closes SABA-B-15)'],
  'note': 'TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR join it if unanswered at RETRO 510', 'evidence': 'retros/retro-495.md section 8'})
t = get('tech_lead_manual_checks', 'TLM-R468-SABA-SCROLL-DEVICE'); pre(t, 'status', 'task SABA-DEVICE-CHECKS (D-29z1768): second RETRO without an answer (L46)')
pre(get('open_findings', 'TLM-R468-SABA-SCROLL-DEVICE'), 'status', 'task SABA-DEVICE-CHECKS (D-29z1768): second RETRO without an answer (L46); does not block')
pre(get('open_findings', 'SABA-B-15'), 'status', 'closes with SABA-DEVICE-CHECKS (D-29z1768; questions-retro-495.md Q1)')
for i in ['TLM-R485-SR-ROUTE-ANNOUNCE', 'TLM-R489-SABA-ENTRANCE-FEEL', 'TLM-R489-TOUCH-SWIPE', 'TLM-R491-PHONE-NAME-EDITOR']:
    pre(get('tech_lead_manual_checks', i), 'status', 'first RETRO question (questions-retro-495.md Q2, D-29z1768); new deadline RETRO 510; joins SABA-DEVICE-CHECKS if unanswered; does not block')
for i in ['TLM-PERF15-FIREFOX', 'TLM-R454-FIREFOX-SAFARI-SCROLLBAR', 'TLM-R455-FIREFOX-SEEK-THUMB', 'TLM-R459-FIREFOX-SAFARI-ENTRANCE', 'TLM-SYS3-IME-PLATFORMS']:
    pre(get('tech_lead_manual_checks', i), 'deadline', 'RETRO 510 (D-29z1768)')
pre(get('open_findings', 'TL-R444-L1-REAL-IME-SEARCH-CLEAR'), 'status', 'open blocked task unchanged; deadline RETRO 510 (D-29z1768; questions-retro-495.md Q5)')
for q in b['post_current_stage_queue']:
    if q.get('id') == 'DPG-FIX':
        q['status'] = 'in_progress (D-29z1770): round 495 = RETRO 495; round 496 = DPG-BUTTON-CLEANUP (absorbs rows for B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED per L8); then SYS-R495-SHARED-DIALOG when root grants | ' + q['status']
b['rounds'].append({'round': 495, 'task': 'current-task.md', 'decision': 'D-29z1770', 'type': 'RETRO 495 (window 480-494) + whole-screen and journey review; no app code', 'status': 'dispatched', 'note': 'baseline 3bcf8cb clean; frozen manifest b-round-494/r495-tree-sha256.txt (1405); claims b-round-494/claims-495.sh'})
b['current_task'] = 'Round 495: RETRO 495 (window 480-494) + whole-screen and journey review; no app code; A nothing; C checks traceability, auth guard, Studio smoke, screen capture, lessons (current-task.md; retros/retro-495.md; claims b-round-494/claims-495.sh)'
b['decisions_log_b'] += [
 {'id': 'D-29z1767', 'date': '2026-11-13', 'by': BY, 'decision': 'RETRO 495 data: retro 480 scripts copied to b-round-494/ and re-pointed to 480-494 (deferred-added D range 1708..1763); input b-round-494/backlog-retro-input.json (v484) + archive snapshot; outputs b-round-494/data/. 15 rounds $247.20 (B 70.9 %); FAIL 487/489/492/493; STOPs the same 4; l57 11/15; l58 15/15; new deferred 56 (6 closed). Round 492 B cost under-reported (attempt1 file 0 bytes).'},
 {'id': 'D-29z1768', 'date': '2026-11-13', 'by': BY, 'decision': 'L46 and screen: TLM-R468-SABA-SCROLL-DEVICE second RETRO unanswered -> task SABA-DEVICE-CHECKS (blocked on Saba device); 4 first-deadline TLMs -> questions-retro-495.md Q2, deadline RETRO 510; Firefox/IME deadlines -> RETRO 510. Screen review 495: counts equal 480 (138/168/118/144), no new SR (product-designer); STEM-LANES still the main journey gap.'},
 {'id': 'D-29z1769', 'date': '2026-11-13', 'by': BY, 'decision': 'Lessons (tech-lead trims + 4 clauses; 58,361 -> 57,164 B, 60 lines, l.41 4,771 B); candidates ruled (RC-R492-DOC-TRUTH-REVIEW adopted in L26; RETRO495-* proposals for root); systemic SYS-R495-SHARED-DIALOG blocked on root (ROOT-REQ-SHARED-DIALOG-GRANT), queued after DPG-BUTTON-CLEANUP; ARCH-CHECKPOINT-ACCOUNT-PROFILE gets confirmedBy gate 494 and L46 deadline RETRO 510, no new checkpoint request (tech-lead: duplicate under L7); RETRO 510 counters recorded.'},
 {'id': 'D-29z1770', 'date': '2026-11-13', 'by': BY, 'decision': 'Round 495 = RETRO 495 task (no grants; frozen manifest 1405 files at 3bcf8cb). After it: 496 DPG-BUTTON-CLEANUP (+ L8 rows for B-R492-PASSWORD-SUBMIT-FOCUS-LOST, GATE488-L3), REGRESSION if planning on/after 2026-11-16, then DPG P1 remainder; STEM-LANES jumps ahead when Saba answers AGREE-STEM-LANES; SYS-R495-SHARED-DIALOG when root grants.'}]
b['version'] += 1; b['updated'] = '2026-11-13'
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
open(M, 'w').write('applied\n'); print('applied v', b['version'])
