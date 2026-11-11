"""B round 449 -> 450 planning, part 2: RETRO 450 outputs and dispatch of round 450. Idempotent (update-backlog-retro.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-449'
DONE = f'{B}/update-backlog-retro.done'
if os.path.exists(DONE):
    sys.exit('already applied')
if not os.path.exists(f'{B}/update-backlog-accept.done'):
    sys.exit('part 1 not applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 449 -> 450 planning (RETRO 450)'
b['version'] += 1
b['updated'] = '2026-11-11'
of = b['open_findings']; ofi = {e.get('id'): e for e in of}
dl = b['deferred_low_polish']; dli = {e.get('id'): e for e in dl}
def pre(e, txt, key='status'):
    e[key] = txt + ' | ' + str(e.get(key, ''))
def by_id(lst, i):
    return next(e for e in lst if isinstance(e, dict) and e.get('id') == i)

# retro candidates (D-29z1600)
rc = b['retro_candidates']
rul = {
    'B-R438-REVERSE-DIRECTION-MATRIX': 'ruled (D-29z1600): merged into L4 clause "Port preserves HEAD (RETRO 450)" (tech-lead; 4x with B-R439, A-R441-REVIEW-L1, RETRO450-B-SKETCH-NO-GOLDEN)',
    'B-R439-SIBLING-SUITE-GAP': 'ruled (D-29z1600): merged into L4 "Port preserves HEAD" (sibling suites included)',
    'RETRO450-B-SKETCH-NO-GOLDEN': 'ruled (D-29z1600): merged into L4 "Port preserves HEAD" (extraction gets a golden test)',
    'RETRO450-B-INVENTORY-TOOL-FIRST-PASS': 'ruled (D-29z1600): covered by L1 (scanner checked on a known-shape case); evidence id added to L1',
    'RETRO450-Q-STOP-THEN-PUBLISH': 'ruled (D-29z1600): L22 clause - an A STOP naming an unruled Medium+ is a short FAIL even when every row passes; gate half = ROOT-REQ-GATE-L57-UNRULED-MEDIUM',
    'RETRO450-A-SHELL-EDITS-BYPASS-HOOK': 'ruled (D-29z1600): L60 clause (no git stash / git checkout -- / shell string-replace edits in the store tree; reviewed git apply sketch allowed after primitives are read); hook question to Saba = questions-retro-450.md Q5 (proposal only)',
    'RC-R305-LESSON-CHAR-CAP': 'counter for RETRO 465 (D-29z1600): L23 5058, L58 4988 bytes unchanged at RETRO 450 (b-round-449/data/lesson-bytes-after.txt)',
}
for i, t in rul.items():
    pre(by_id(rc, i), t)
dli['A-R441-REVIEW-L1-OUTLINE-ORDER']['retro_input'] = 'used at RETRO 450 (D-29z1600): evidence of L4 "Port preserves HEAD" | ' + dli['A-R441-REVIEW-L1-OUTLINE-ORDER'].get('retro_input', '')
pre(ofi['INFO-C447-L57-ABSENT'], 'counted at RETRO 450 (D-29z1598): l57-check INCOMPLETE on 442, 443, 447 of 435-449 (b-round-449/data/l57-check-window.txt); gate half requested as ROOT-REQ-GATE-L57-UNRULED-MEDIUM')

# L46 deadlines (D-29z1599)
tlm = b['tech_lead_manual_checks']
t = by_id(tlm, 'TLM-PERF15-FIREFOX')
t['deadline'] = 'RETRO 465 (D-29z1599) | ' + t['deadline']
pre(t, 'asked Saba a fourth time (D-29z1599, questions-retro-450.md Q1); still blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX (runner has chromium-1200 only)')
t = by_id(tlm, 'TLM-SYS3-IME-PLATFORMS')
t['deadline'] = 'RETRO 465 (D-29z1599; first L46 question at RETRO 450, questions-retro-450.md Q3) | ' + t['deadline']
pre(ofi['TL-R444-L1-REAL-IME-SEARCH-CLEAR'], 'deadline RETRO 465 with TLM-SYS3-IME-PLATFORMS (D-29z1599; Q3)')
pre(ofi['TLM-SABA-B-12-FIREFOX-SAFARI'], ('L46 second RETRO without answer (D-29z1599): Firefox half reopened as task blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX (Q1); '
     'Safari half stays Tech Lead manual (Q2); deadline RETRO 465'))
perf = by_id(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
pre(perf, 'parked remainders asked a second time (D-29z1599, questions-retro-450.md Q4): they wait for Saba design choices, not a manual check, so L46 reopen does not apply; new deadline RETRO 465')
for s in perf.get('stages', []):
    if isinstance(s, dict) and 'deadline RETRO 450' in str(s.get('status', ''))[:300]:
        pre(s, 'parked (D-29z1599): deadline RETRO 465')
rr = b['root_requests_b']
pre(by_id(rr, 'ROOT-REQ-PLAYWRIGHT-FIREFOX'), 're-raised at RETRO 450 (D-29z1599): still not installed (~/.cache/ms-playwright has chromium-1200 only); blocks TLM-PERF15-FIREFOX and the Firefox half of TLM-SABA-B-12-FIREFOX-SAFARI')
sig = by_id(b['architecture_signals'], 'SIG-R441-SOURCE-PIN-RULING')
pre(sig, ('ruled at RETRO 450 (D-29z1599): B default - remaining Overview source pins stay source contracts until ARCH-SPLIT touches Overview/Lane, then convert under L4 '
          '"Port preserves HEAD"; sent to Saba as information (questions-retro-450.md Q7)'))
rr.append({'id': 'ROOT-REQ-GATE-L57-UNRULED-MEDIUM', 'added': by, 'decision': 'D-29z1600',
           'question': ('gate step: run python3 -I tools/l57-check.py c-round-N.json and do not publish when c-round-N.json lists an open Medium+ bug, or a-round-N.md starts with STOP '
                        'and no B ruling exists (L22 RETRO 450 clause, gate half). Evidence: round 442 published 4aa3c82 with C-R442-M1 unruled; l57 INCOMPLETE 442/443/447'),
           'status': 'filed with root (D-29z1600): non-blocking proposal'})

# systemic task + signals + screen candidates (D-29z1601)
closes = ['A-R449-REVIEW-GT1-TSX', 'TL-R449-L3-SCAN-ROOTS', 'A-R447-REVIEW-L2', 'A-R447-REVIEW-L3', 'TL-R449-L4-PARSER-QUOTES', 'A-R449-REVIEW-L-FILL-REGEX', 'A-R449-REVIEW-L-TEST-HYGIENE']
b['systemic_tasks'].append({'id': 'SYS-R450-STORE-STYLE-SCAN', 'decision': 'D-29z1601', 'added': by, 'origin': 'RETRO 450 section 11 (tech-lead)',
    'what': ('test-only: one shared helper app/lib/__tests__/helpers/style-scan.ts (file walk + roots app/ and perf/, quote-aware CSS rule reader, TSX className and style={{}} scanner); '
             'store-teal-sweep and store-gradient-text move onto it; hit counts equal HEAD; L4 "Port preserves HEAD" applies (every HEAD pin mapped, mutants both ways); one mutant per closed Low'),
    'closes': closes,
    'not_closed_here': 'A-R447-REVIEW-L1, TL-R449-D1-LOADING-BRAND-CLASS, TL-R449-D2-BARREL-ALIAS close with the dead-file deletion in STORE-2b-3d (LEGACY-DEAD-STORE-COMPONENTS)',
    'order': 'before STORE-2b-3b; after REGRESSION-2026-11-13 if that is due first',
    'status': 'not_started (D-29z1601)'})
for i in closes:
    e = ofi.get(i) or dli.get(i)
    e['systemic_task'] = 'SYS-R450-STORE-STYLE-SCAN'
pre(ofi['A-R449-REVIEW-GT1-TSX'], 'scheduled (D-29z1601): moved from STORE-2b-3b row GT1b into SYS-R450-STORE-STYLE-SCAN (tech-lead, RETRO 450)')
q = by_id(b['post_current_stage_queue'], 'STORE-REDESIGN')
st2 = by_id(q['stages'], 'STORE-2')
sp = st2['split_2b_d29z1583']
sp['STORE-2b-3b'] = 'not_started (D-29z1601): after SYS-R450-STORE-STYLE-SCAN; GT1b moved to the systemic task | ' + sp['STORE-2b-3b']
sp['STORE-2b-3d'] = ('not_started (D-29z1601): includes deleting the 0-importer Store files under Saba legacy policy 2026-11-10 (ArtistBioSection, VideoShowcase, PianoLoadingAnimation + .loading-brand, '
                     'PianoCurtainLoader, CinemaCurtainLoader, audio/Timeline, lib/email.server.ts; B re-greps at that planning), NOT TestimonialsSection (SABA-Q-TESTIMONIALS-UNMOUNTED); '
                     'removing their allow-list entries is the acceptance; closes A-R447-REVIEW-L1, TL-R449-D1, TL-R449-D2; Saba informed in questions-retro-450.md Q6 | ' + sp['STORE-2b-3d'])
pre(q, 'in_progress (D-29z1601): round 450 = RETRO 450; next SYS-R450-STORE-STYLE-SCAN (or REGRESSION-2026-11-13 if planned on/after 2026-11-13), then 2b-3b')
lg = ofi['LEGACY-DEAD-STORE-COMPONENTS']
pre(lg, 'scheduled into STORE-2b-3d (D-29z1601) except TestimonialsSection; Saba informed (Q6)')
for sid, sg in [('SIG-R450-STORE-TEST-RATCHETS', 'store test ratchets: allow-list growth on two app/lib/__tests__ files with duplicated scanning code (gate 447, gate 449); response SYS-R450-STORE-STYLE-SCAN + 2b-3d deletion'),
                ('SIG-R450-USELEADMAGNET-ROUTE', 'useLeadMagnet.ts takes on route awareness (gate 446)'),
                ('SIG-R450-HAIRLINE-DUP', 'hairline-handle class duplicated in two places (gate 437)')]:
    b['architecture_signals'].append({'id': sid, 'added': by, 'decision': 'D-29z1601', 'source': 'b-round-449/consult-tech-lead.md section 6', 'signal': sg,
                                      'status': 'signal only; not scheduled' if sid != 'SIG-R450-STORE-TEST-RATCHETS' else 'answered by SYS-R450-STORE-STYLE-SCAN (D-29z1601)'})
for sid, sev, what in [
    ('SR-450-1', 'low', 'Clip details toggle chevrons do not map the upward panel motion (Expand right, Collapse down); proposal: one rotating chevron, same label and position'),
    ('SR-450-2', 'low', 'Clip Gain value shown twice in two formats (field 0.0 and slider read-out 0 dB); proposal: keep the field, drop the read-out or show it only while dragging'),
    ('SR-450-3', 'low', 'Store header Sign In is filled brass, same weight as Buy Now (two primaries on the purchase page); proposal: existing secondary/outline variant, position unchanged; changes the global header look'),
    ('SR-450-4', 'low', 'unselected Premium version card dims name and $99 to grey, reads disabled; proposal: full ink, selection by border and radio only (STORE-4 card acceptance)'),
    ('SR-450-5', 'low', 'one price in two formats (TOTAL PRICE $29.00 USD vs card $29); proposal: one format (STORE-4 copy)')]:
    b['screen_review_candidates'].append({'id': sid, 'decision': 'D-29z1601', 'severity': sev, 'what': what, 'source': 'user-review/screen-review-450.md; b-round-449/consult-product-designer.md',
                                          'status': 'awaiting_user (D-29z1601): candidate; nothing implemented until Saba answers', 'added': by})

# retro record, policy, round 450 (D-29z1601)
rp = b['retro_policy']
rp['next_due'] = 'round 465 or the end of the next queue entry, whichever first (retro 465 window 450-464) (D-29z1601) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, ('retro-450: counters for RETRO 465 (tech-lead): round median <= $17.00 and B median <= $12.50; B share <= 70 %; l57-check rc 0 on 15/15 incl. short routes; '
    'every A STOP naming an unruled Medium -> short FAIL with origin 100 %; fix-up chains <= 1 and new deferred Lows <= 30 (window 435-449: 45); L23 and L58 < 5100 bytes, lessons <= 60 lines. '
    'Cost lever hypothesis: consecutive stages reuse the previous stage claims/pre-check/mutant scripts; compare B cost of 2b-3b..3d with the 446-449 average $13.73'))
b['retro_runs'].append({'round': 450, 'decision': 'D-29z1601', 'window': '435-449', 'report': 'retros/retro-450.md',
    'lessons': 'lessons.md (60 lines): l.3 pointer; L1 evidence id; L4 Port preserves HEAD; L22 unruled-Medium STOP = short FAIL; L60 store-tree edits (all tech-lead); diff b-round-449/lessons-diff.txt',
    'data': 'b-round-449/*.py run on b-round-449/backlog-retro-input.json (v438) + archive snapshot; outputs b-round-449/data/',
    'screen': 'user-review/screen-review-450.md (SR-450-1..5); captures b-round-449/screens/',
    'questions': 'user-review/questions-retro-450.md Q1-Q7', 'systemic': 'SYS-R450-STORE-STYLE-SCAN', 'window_correction': 'b-next.json said 436-449; retro_policy says 435-449 (used)'})
b['decisions_log_b'] += [
    {'id': 'D-29z1598', 'date': '2026-11-11', 'by': by, 'decision': ('RETRO 450 data: window 435-449 (retro_policy; b-next said 436-449, corrected). Scripts b-round-449/*.py (copies of RETRO 435 with the window changed; stage-sums rewritten), '
        'input v438 after round-449 acceptance. Totals $264.79 (B 198.56, A 55.61, C 10.62), median round 17.87, B median 13.11, B share 75.0 %; 14 PASS 1 FAIL (438); browserVerified 15/15; '
        'C bugs 5 (2 medium); A STOPs 439, 442; gate reviews 13 COMMIT OK, 54 items; deferred Lows in window 45; l57 INCOMPLETE 442/443/447; l58 OK 14/14; Saba-found new issues 0; screen counts equal 435.')},
    {'id': 'D-29z1599', 'date': '2026-11-11', 'by': by, 'decision': ('RETRO 450 L46: TLM-PERF15-FIREFOX asked a 4th time, still blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX (re-raised); TLM-SABA-B-12-FIREFOX-SAFARI 2nd RETRO -> Firefox half reopened as task '
        'blocked on the same root request, Safari half Tech Lead; TLM-SYS3-IME-PLATFORMS + TL-R444-L1 first question; STUDIO-PERFORMANCE parked remainders 2nd question (design choices, not checks: no L46 reopen); '
        'SIG-R441-SOURCE-PIN-RULING B default (convert under L4 during ARCH-SPLIT), Saba informed. All new deadlines RETRO 465. user-review/questions-retro-450.md Q1-Q7.')},
    {'id': 'D-29z1600', 'date': '2026-11-11', 'by': by, 'decision': ('RETRO 450 lessons (tech-lead): L4 Port preserves HEAD (4x: C-R438-01, A-R439-REVIEW-M1, A-R441-REVIEW-L1, RETRO450-B-SKETCH-NO-GOLDEN); L22 unruled-Medium STOP = short FAIL (C-R442-M1); '
        'L60 store-tree edits (RETRO450-A-SHELL-EDITS-BYPASS-HOOK); L1 evidence id (RETRO450-B-INVENTORY-TOOL-FIRST-PASS); l.3 pointer; 60 lines kept, ids unchanged. RC-R305 -> counter. '
        'ROOT-REQ-GATE-L57-UNRULED-MEDIUM filed. Q5 (git apply vs primitives hook) is a proposal for Saba only.')},
    {'id': 'D-29z1601', 'date': '2026-11-11', 'by': by, 'decision': ('RETRO 450 outputs: systemic task SYS-R450-STORE-STYLE-SCAN (closes A-R449-REVIEW-GT1-TSX Medium + 6 Lows; before STORE-2b-3b); STORE-2b-3d includes deleting the 0-importer Store files '
        'under the Saba legacy policy 2026-11-10 except TestimonialsSection (tech-lead read CLAUDE.md as needing Saba; B reads the 2026-11-10 policy as that permission; Saba informed Q6); '
        'SR-450-1..5 awaiting_user; signals SIG-R450-*; next RETRO 465. Dispatch round 450 = RETRO 450 verification on a8599a2 (no grants; A nothing; C traceability + auth + Studio smoke + capture re-run). '
        'Round 451 = REGRESSION-2026-11-13 if planned on/after 2026-11-13, else SYS-R450-STORE-STYLE-SCAN.')},
]
b['rounds'].append({'round': 450, 'task': 'current-task.md', 'decision': 'D-29z1601', 'type': 'RETRO 450 (rounds 435-449) + whole-screen and journey review; no app code',
                    'status': 'dispatched', 'note': 'baseline a8599a2 (gate 449 published); manifest b-round-449/r450-tree-sha256.txt; claims b-round-449/claims-450.sh'})
b['current_task'] = 'Round 450: RETRO 450 (rounds 435-449) verification; no app code (current-task.md)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write(by + '\n')
print('ok v', b['version'])
