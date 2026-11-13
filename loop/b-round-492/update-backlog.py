# B round 492 -> 493 planning backlog update (D-29z1758..D-29z1760). Run once: python3 -I update-backlog.py <loop>
import json, sys, os
loop = sys.argv[1]
p = os.path.join(loop, 'backlog.json')
done_flag = os.path.join(loop, 'b-round-492', 'update-backlog.done')
if os.path.exists(done_flag):
    sys.exit('already applied')
b = json.load(open(p, encoding='utf-8'))
WHEN = '2026-11-13 B round 492 -> 493 planning'
def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    return None
def prepend_status(x, s):
    x['status'] = s + (' | ' + x['status'] if x.get('status') else '')
def confirm(x, s):
    x['confirmedBy'] = (x.get('confirmedBy', '') + ' | ' if x.get('confirmedBy') else '') + s
b['updated'] = '2026-11-13'
b['current_task'] = 'Round 493: re-dispatch of B-R488-PASSWORD-MODAL-DIALOG (+ B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED) with docs-only v5 fixing C-R492-01 (doc 318 l.22 ring by modality; round 492 -> 493 in docs 315/317/318); baseline e4e1d1c with v3 in the tree (current-task.md, delta b-round-492/sketch-493-delta-v3-to-v4.patch.txt c70366db, full b-round-492/sketch-493.patch.txt ea441270)'
b['advisor_used_by_B'] = WHEN + ': advisor available and consulted after orientation (advice applied: docs-only v5 built in /tmp scratch, store tree untouched; delta + full patch with an apply rule; new claims-493.sh with sketch-493/ for K5; tech-lead delta review truth-checking every doc 318 sentence against c-round-492/pw-check.txt; l.4 and docs 315/317 renumbered 493 with K10 pins; every A-R492-REVIEW id ruled (L1, L6 explicitly); covering + v3/v4 build compare (byte-identical); no done/mzadaa from a C FAIL; C8 Stopped not credited, B probed the hidden playback-state span)'
for r in [r for r in b['rounds'] if r.get('round') == 492]:
    r['status'] = 'c_fail_stopped_routed_to_b (D-29z1758): C round 492 FAIL (browserVerified/realVerified true; C5 PW-CHECK PASS 54 rows on v3; bug C-R492-01 Low origin B spec: doc 318 l.22 ring claim false for a mouse open); A STOP correct; gate 492 skipped (C taskStatus FAIL); nothing published'
b['rounds'].append({'round': 493, 'task': 'current-task.md', 'decision': 'D-29z1758', 'type': 're-dispatch B-R488-PASSWORD-MODAL-DIALOG + B-R492-PASSWORD-FIELDS-UNNAMED + B-R492-PASSWORD-ERROR-NOT-ANNOUNCED (Medium x3) with docs-only v5 (C-R492-01)', 'status': 'dispatched', 'note': 'baseline HEAD e4e1d1c with sketch v3 in the tree (6 paths); delta b-round-492/sketch-493-delta-v3-to-v4.patch.txt (c70366db), full b-round-492/sketch-493.patch.txt (ea441270); claims b-round-492/claims-493.sh; v3/v5 production builds byte-identical (b-round-492/css-compare.txt, build-diff.txt)'})
of = b['open_findings']; dl = b['deferred_low_polish']
for i in ['B-R488-PASSWORD-MODAL-DIALOG', 'B-R492-PASSWORD-FIELDS-UNNAMED', 'B-R492-PASSWORD-ERROR-NOT-ANNOUNCED']:
    prepend_status(find(of, i), 're-dispatched (D-29z1758): round 493 docs-only v5; C round 492 FAIL only on C-R492-01 (doc line); C5 browser rows PASS on v3 (c-round-492/pw-check.txt) are evidence, not done (C verdict FAIL)')
for i in ['A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW', 'A-R491-REVIEW-PWMODAL-WORDING']:
    prepend_status(find(dl, i), 're-dispatched (D-29z1758): closes with round 493 C PASS (round 492 C FAIL on a doc line)')
of.append({'id': 'C-R492-01', 'severity': 'low', 'origin': 'B spec', 'status': 'dispatched (D-29z1758): round 493 docs-only v5 rewrites doc 318 l.22 (ring by modality: keyboard open/Esc close ring; mouse open/Cancel/backdrop none, SABA-B-4) - closes with C round 493 PASS', 'title': 'Doc 318 l.22 claimed the Current Password field shows a focus ring on open; false for a mouse open (outline none, focusSource pointer)', 'evidence': 'c-round-492.json bugs[0]; c-round-492/pw-check.txt P2/P7; a-round-492.md STOP', 'repro': 'compare doc 318 l.22 with C5 P2 (mouse open) outline', 'added': WHEN, 'note': 'Fixed now, not deferred: it is the STOP that blocks three Mediums. Retro: RC-R492-DOC-TRUTH-REVIEW'})
lows = [
 ('A-R492-REVIEW-L1-IME-KEYCODE229', 'low', 'Esc guard in PasswordModal checks only e.isComposing; project helpers also treat keyCode 229 as composing (Safari composition-ending Esc has isComposing=false). Same gap in LeadMagnetPopup (isComposing only)', 'deferred_low_polish (D-29z1759): fix with the LeadMagnet precedent in the polish pass; Safari-only, also SAFARI-CHECKS'),
 ('A-R492-REVIEW-L2-REPEAT-ALERT', 'low', 'The same password error submitted twice is not re-announced (batched setError("") then setError(msg) leaves the alert node unchanged)', 'deferred_low_polish (D-29z1759)'),
 ('A-R492-REVIEW-L3-DISMISSED-ERROR-SILENT', 'low', 'Esc/Cancel/backdrop during a pending submit, then failure: the error goes to the closing instance and the user sees nothing', 'deferred_low_polish (D-29z1759): reachable only because updatePassword always throws; fix with B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED'),
 ('A-R492-REVIEW-L4-REOPEN-MOUSE', 'low', 'The fading backdrop still catches clicks, so reopening during the fade works by keyboard only (PD14 uses fireEvent, no hit-testing)', 'deferred_low_polish (D-29z1759): next to TL-R492-V2-L1'),
 ('A-R492-REVIEW-L5-TABBABLE-SELECTOR', 'low', "Tab trap selector hard-coded to 'input, button' (no a[href], select, [tabindex])", 'deferred_low_polish (D-29z1759): correct for today\'s markup (C5 P5)'),
 ('A-R492-REVIEW-L6-PD8-VACUOUS', 'low', 'PD8 middle-field activeElement toBe(middle) cannot fail (jsdom never moves focus on Tab); the preceding keyDown===true (not prevented) assert is meaningful', 'deferred_low_polish (D-29z1759): doc 318 PD8 line reworded in v5 to claim only the not-prevented assert; browser P5 proves the native order'),
 ('A-R492-REVIEW-L7-PD10-WEAK', 'low', 'PD10 not.toBe(true) passes for undefined; PD14 uses toBe(false)', 'deferred_low_polish (D-29z1759)'),
 ('A-R492-REVIEW-L8-PD3-PARTIAL', 'low', 'PD3 checks only one of the three Hide names', 'deferred_low_polish (D-29z1759)'),
 ('A-R492-REVIEW-L9-DISABLED-FOCUS-BROWSER', 'low', 'PD11/PD15: jsdom cannot show the browser focus fixup when a focused button becomes disabled', 'deferred_low_polish (D-29z1759): C5 P11 is the nearest browser row'),
 ('A-R492-REVIEW-I1-PALETTE-TRAP', 'info', 'Esc does not stopPropagation; with Ctrl+K open, the trap pulls focus back into the dialog', 'deferred_low_polish (D-29z1759): with TL-R492-L4'),
]
for i, sev, title, status in lows:
    if not (find(dl, i) or find(of, i)):
        dl.append({'id': i, 'severity': sev, 'origin': 'A', 'status': status, 'title': title, 'evidence': 'a-round-492.md code-reviewer table', 'added': WHEN})
sig = find(b['architecture_signals'], 'SIG-R487-PROFILE-NAME-EDITOR-EXTRACT')
confirm(sig, 'A-R492 code-reviewer Architecture note: keep (passwordModalOpenRef shared by name-editor arbitration and idempotent dialog close); later bounded usePasswordDialogFocus after root answers; native <dialog> for shared Modal work (D-29z1758)')
b.setdefault('retro_candidates', []).append({'id': 'RC-R492-DOC-TRUTH-REVIEW', 'added': WHEN, 'note': 'Round 492 lost on a doc sentence (l.22) that three tech-lead reviews passed; the review asked about code, not each doc sentence against browser rows. Candidate lesson at RETRO 495: the sketch review truth-checks every implementation-doc sentence against the saved browser rows (modality-dependent claims: ring vs focus).'})
q = find(b['post_current_stage_queue'], 'DPG-FIX')
prepend_status(q, 'in_progress (D-29z1758): 492 C FAIL on a doc line (C-R492-01); 493 re-dispatch docs-only v5; then DPG-BUTTON-CLEANUP (REGRESSION first when due on/after 2026-11-16; RETRO 495)')
dec = b['decisions_log_b']
dec.append({'id': 'D-29z1758', 'date': '2026-11-13', 'by': WHEN, 'decision': 'C round 492 FAIL accepted (STOPPED - routed to B; browserVerified/realVerified true; C5 PASS 54 rows on v3; C8 auth guard and studio-lab add/play PASS, "Stopped" step not verified by C and not credited). Gate 492 skipped. Nothing done/mzadaa. Ruling on A STOP / C-R492-01 (Low, origin B spec): accepted delta, docs-only v5 (v4 + TL-R493-D1..D3): doc 318 l.22 ring by modality (P2/P8/P9 none, P6/P7 solid), l.4 -> C round 493 PASS (L28), l.63 browser R7 -> P11, P12, PD8 line states the not-prevented assert; docs 315 (3) and 317 (1) round 492 -> 493. Code/tests byte-equal v3; v3/v5 production builds byte-identical (css-compare.txt, build-diff.txt empty); covering 6/97 on v4. Round 493 = re-dispatch; apply delta on the v3 tree (full v4 patch if the tree is clean). C runs the full table; C8 reads the hidden [data-testid=arrangement-playback-state] span (B probe Stopped->Playing->Stopped at 1440/1280).'})
dec.append({'id': 'D-29z1759', 'date': '2026-11-13', 'by': WHEN, 'decision': 'A-R492 reviewer findings L1..L9 (Low) and I1 (info) -> deferred_low_polish, ruled not a STOP for round 493. L1 (keyCode 229) fixed with the LeadMagnet precedent later; L6 (PD8 vacuous secondary assert) deferred, doc line reworded to the meaningful assert. No code change in v5 (would void the mutant/browser evidence). Architecture note keep -> confirmedBy SIG-R487.'})
dec.append({'id': 'D-29z1760', 'date': '2026-11-13', 'by': WHEN, 'decision': 'tech-lead docs-only reviews recorded in b-round-492/sketch-review.md: v4 (7eab067c) CHANGES REQUIRED - TL-R493-D1 0 px only at 16/255 threshold, D2 Ctrl+K Esc not HEAD behaviour, D3 reopen-keeps-values untested; all fixed in v5 (full ea441270, delta c70366db; v3 f530e0f3) -> APPROVE. v5 build byte-identical to v3. Retro candidate RC-R492-DOC-TRUTH-REVIEW. No regression due (next on/after 2026-11-16); RETRO 495.'})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(done_flag, 'w').write('applied\n')
print('ok')
