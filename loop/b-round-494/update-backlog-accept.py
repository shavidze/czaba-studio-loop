# B round 494 -> 495 planning: round 494 acceptance (D-29z1764..D-29z1766). Run once from the loop root.
import json, os, sys
M = 'b-round-494/update-backlog-accept.done'
if os.path.exists(M): sys.exit('already applied')
b = json.load(open('backlog.json'))
BY = '2026-11-13 B round 494 -> 495 planning'
def find(k, i):
    for e in b[k]:
        if e.get('id') == i: return e
    raise SystemExit('missing ' + i)
def pre(e, s):
    e['status'] = s + ' | ' + str(e.get('status', ''))
C = 'C round 494 PASS (c-round-494.json, 0 bugs, browserVerified/realVerified true; C5 PW-CHECK 18 rows x 1440/1280/375, C5b backdrop, C7, C9 doc truth); gate 494 published 3bcf8cb'
for i in ['B-R488-PASSWORD-MODAL-DIALOG', 'B-R492-PASSWORD-FIELDS-UNNAMED', 'B-R492-PASSWORD-ERROR-NOT-ANNOUNCED']:
    pre(find('open_findings', i), 'done (D-29z1764), client path: ' + C + '; backend half stays with B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (root); manual TLM-R492-SR-PASSWORD-DIALOG (RETRO 510)')
for k, i in [('open_findings', 'C-R492-01'), ('open_findings', 'C-R493-01'),
             ('deferred_low_polish', 'A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW'), ('deferred_low_polish', 'A-R491-REVIEW-PWMODAL-WORDING'),
             ('deferred_low_polish', 'A-R493-REVIEW-F1'), ('deferred_low_polish', 'A-R493-REVIEW-F3'),
             ('deferred_low_polish', 'A-R493-REVIEW-F4'), ('deferred_low_polish', 'A-R493-REVIEW-F7')]:
    pre(find(k, i), 'closed (D-29z1764): ' + C)
f2 = find('deferred_low_polish', 'A-R493-REVIEW-F2')
pre(f2, 'doc half closed (D-29z1764, C round 494 C9); open half = trigger type="button" has no test/mutant, confirmedBy GATE494 review finding 3 (D-29z1765); deferred_low_polish')
f2['confirmedBy'] = (f2.get('confirmedBy', '') + ' | ' if f2.get('confirmedBy') else '') + 'gate 494 review finding 3 (account.tsx:297-299 type="button" untested) (D-29z1765)'
tl = find('deferred_low_polish', 'TL-R492-L4-CTRLK-OVER-DIALOG')
tl['confirmedBy'] = (tl.get('confirmedBy', '') + ' | ' if tl.get('confirmedBy') else '') + 'gate 494 review finding 1 (Esc handler on document reaches other overlays; fix = shared overlay stack or defaultPrevented check) (D-29z1765)'
b['deferred_low_polish'].append({'id': 'GATE494-L4-TEST-BLANK-LINES', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1765)',
    'title': 'account-password-dialog.test.tsx: no blank line between some it blocks (l.218-219, 239-240, 251-252, 261-262); Biome passes',
    'evidence': 'gates/round-494/review.md finding 4', 'repro': 'read the file at 3bcf8cb at the named lines', 'added': BY})
b['open_findings'].append({'id': 'INFO-B494-LEDGER-GAPS', 'severity': 'info', 'origin': 'B spec', 'status': 'closed (D-29z1765): b-round-494/doc-ledger-addendum.md cites auth.ts l.379-391 at 3bcf8cb for doc 318 l.90 and a-round-488.md l.50 (source review, not a measurement) for the l.64 problem half; l.36 re-cited to backdrop-probe.json files',
    'title': "A's code-reviewer ledger gaps R2/R3/R5 (doc 318 l.90, l.64, l.36 citations)", 'evidence': 'a-round-494.md reviewer table R2, R3, R5', 'added': BY})
sig = None
for e in b['architecture_signals']:
    if e.get('id') == 'SIG-R487-PROFILE-NAME-EDITOR-EXTRACT': sig = e
sig['confirmedBy'] += ' | A-R494: no new note; gate 494 Architecture note (signal 4 at account.tsx:326-391): keep; proposal = move PasswordModal to app/components/account/PasswordDialog.tsx with passwordModalOpenRef/closePasswordModal in the parent and PD1-PD15/PN unchanged, possibly with shared-modal-no-focus-management (D-29z1765). Not scheduled (signal; ARCH-CHECKPOINT-ACCOUNT-PROFILE still with root)'
for r in b['rounds']:
    if r.get('round') == 494:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS (D-29z1764), browserVerified true; gate 494 published 3bcf8cb (rounds 492-494)'
for q in b['post_current_stage_queue']:
    if q.get('id') == 'DPG-FIX':
        q['status'] = 'in_progress (D-29z1766): password dialog Mediums done (round 494, published 3bcf8cb); round 495 = RETRO 495; next DPG-BUTTON-CLEANUP | ' + q['status']
b['decisions_log_b'] += [
 {'id': 'D-29z1764', 'date': '2026-11-13', 'by': BY, 'decision': 'Round 494 accepted: C PASS, 0 bugs, browserVerified/realVerified true (c-round-494.json); gate 494 published 3bcf8cb on both remotes (gates/gate-round-494.json). B-R488-PASSWORD-MODAL-DIALOG, B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED done for the client path; closed C-R492-01, C-R493-01, A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW, A-R491-REVIEW-PWMODAL-WORDING, A-R493-REVIEW-F1/F3/F4/F7 (each checked against C rows C5/C5b/C9); A-R493-REVIEW-F2 doc half closed, type=button test gap stays deferred. OWN-BACKEND stays BLOCKED (backend unavailable in cloud); B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) stays with root.'},
 {'id': 'D-29z1765', 'date': '2026-11-13', 'by': BY, 'decision': 'Gate 494 review (COMMIT OK) ruled: finding 1 = confirmedBy TL-R492-L4-CTRLK-OVER-DIALOG; finding 2 (imperative inert) is correct by the reviewer\'s own reading, no id; finding 3 = confirmedBy A-R493-REVIEW-F2; finding 4 -> new deferred Low GATE494-L4-TEST-BLANK-LINES; finding 5 info (all already decided). Architecture note -> confirmedBy on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT (keep; PasswordDialog extraction proposal recorded, not scheduled). A ledger gaps R2/R3/R5 closed by b-round-494/doc-ledger-addendum.md (INFO-B494-LEDGER-GAPS). C notRun items (doc l.64 before half, l.90) are not claimed C-verified.'},
 {'id': 'D-29z1766', 'date': '2026-11-13', 'by': BY, 'decision': 'Order: round 495 = RETRO 495 (retro_policy.next_due, window 480-494; task 494 section 5 wrote 481-494, B uses 480-494 as every earlier window and records the discrepancy). REGRESSION not due (regression-last.json 2026-11-13, next on/after 2026-11-16). After RETRO: DPG-BUTTON-CLEANUP, unless the retro schedules a systemic task first.'}]
b['version'] = b['version'] + 1
b['updated'] = '2026-11-13'
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
open(M, 'w').write('done\n')
print('ok version', b['version'])
