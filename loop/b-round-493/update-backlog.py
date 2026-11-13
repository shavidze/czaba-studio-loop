# B round 493 -> 494 planning backlog update (D-29z1761..D-29z1763). Run once: python3 -I update-backlog.py <loop>
import json, sys, os
loop = sys.argv[1]
p = os.path.join(loop, 'backlog.json')
done_flag = os.path.join(loop, 'b-round-493', 'update-backlog.done')
if os.path.exists(done_flag):
    sys.exit('already applied')
b = json.load(open(p, encoding='utf-8'))
WHEN = '2026-11-13 B round 493 -> 494 planning'
FULL = open(os.path.join(loop, 'b-round-493', 'sketch-494.sha256')).read()[:8]
DELTA = open(os.path.join(loop, 'b-round-493', 'sketch-494-delta.sha256')).read()[:8]
TL = sys.argv[2] if len(sys.argv) > 2 else 'see b-round-493/sketch-review.md'
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
b['current_task'] = f'Round 494: re-dispatch of B-R488-PASSWORD-MODAL-DIALOG (+ B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED) with docs-only v6 fixing C-R493-01 (doc 318 l.36 backdrop 40 px short; F2-F7 doc truth fixes; round 493 -> 494 in docs 315/317/318); baseline e4e1d1c with v5 in the tree (current-task.md, delta b-round-493/sketch-494-delta-v5-to-v6.patch.txt {DELTA}, full b-round-493/sketch-494.patch.txt {FULL}, ledger b-round-493/doc-ledger.md)'
b['advisor_used_by_B'] = WHEN + ': advisor available and consulted after orientation and before finishing (advice applied: measure the backdrop at 3 viewports instead of copying "~40 px"; check the Tab-trap half of l.36 against the Ctrl+K finding; sentence-to-evidence ledger for every doc 318 sentence cross-checked against open/deferred findings; rule F2-F8 by id; tech-lead with shell reviews the ledger; artifacts under b-round-493/; covering + build identity re-run on v6; C8 clip selector probed; outcome fixed for 494 FAIL vs RETRO 495)'
for r in [r for r in b['rounds'] if r.get('round') == 493]:
    r['status'] = 'c_fail_stopped_routed_to_b (D-29z1761): C round 493 FAIL short route L22 (browserVerified/realVerified false: C5/C7 not run); A STOP on doc 318 l.36 correct (C-R493-01 Low, origin B spec, confirmed in browser c-round-493/f1.json); C1/C2/C3/C8 PASS; gate 493 skipped (C taskStatus FAIL); nothing published'
b['rounds'].append({'round': 494, 'task': 'current-task.md', 'decision': 'D-29z1761', 'type': 're-dispatch B-R488-PASSWORD-MODAL-DIALOG + B-R492-PASSWORD-FIELDS-UNNAMED + B-R492-PASSWORD-ERROR-NOT-ANNOUNCED (Medium x3) with docs-only v6 (C-R493-01)', 'status': 'dispatched', 'note': f'baseline HEAD e4e1d1c with sketch v5 in the tree (6 paths); delta b-round-493/sketch-494-delta-v5-to-v6.patch.txt ({DELTA}); full b-round-493/sketch-494.patch.txt ({FULL}); code/tests byte-equal v3; v6 CSS equal v5 (b-round-493/css-compare-v6.txt); covering 6/97 on v6'})
of = b['open_findings']; dl = b['deferred_low_polish']
arch = json.load(open(os.path.join(loop, 'archive', 'findings-archived.json'), encoding='utf-8'))
for i in ['B-R488-PASSWORD-MODAL-DIALOG', 'B-R492-PASSWORD-FIELDS-UNNAMED', 'B-R492-PASSWORD-ERROR-NOT-ANNOUNCED']:
    x = find(of, i)
    if x is None:
        src = find(arch, i)
        x = json.loads(json.dumps(src))
        x['restored_from_archive'] = WHEN + ' (D-29z1761): still open (no C acceptance yet); archive copy left untouched; root note ROOT-NOTE-R494-OPEN-MEDIUMS-ARCHIVED'
        of.append(x)
    x['status_history'] = (x.get('status_history', '') + ' || ' if x.get('status_history') else '') + x.get('status', '')
    x['status'] = 'open (D-29z1761): re-dispatched as round 494 with docs-only v6; C round 493 failed on a doc line only (C-R493-01); awaiting C round 494 browser acceptance'
for i in ['A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW', 'A-R491-REVIEW-PWMODAL-WORDING']:
    x = find(dl, i) or find(of, i)
    if x: prepend_status(x, 're-dispatched (D-29z1761): closes with round 494 C PASS')
c492 = find(of, 'C-R492-01')
if c492: prepend_status(c492, 're-dispatched (D-29z1761): v5 l.22 fix carried in v6; closes with round 494 C PASS')
of.append({'id': 'C-R493-01', 'severity': 'low', 'origin': 'B spec', 'status': 'dispatched (D-29z1761): round 494 docs-only v6 rewrites doc 318 l.36 from the measured backdrop (40 px short at 1440x900, 1280x720, 375x812; b-round-493/probe/backdrop-probe.json) and adds the deferred Low to the TODO; fixed now, not deferred; closes with C round 494 PASS', 'title': 'Doc 318 l.36 said the backdrop blocks the pointer on the background; the bottom 40 px strip is outside the backdrop and a click there leaves the dialog open', 'evidence': 'c-round-493/f1.json, c-round-493/shots/f1-open-*.png, a-round-493.md (reviewer F1)', 'added': WHEN})
bs = find(dl, 'B-R492-PASSWORD-BACKDROP-SHORT')
if bs:
    bs['evidence'] = bs.get('evidence', '') + ' | C round 493 c-round-493/f1.json (elementFromPoint outside overlay at y 870/895 and 690/715; click at h-10 leaves dialog open, 1440x900 and 1280x720) | B round 493 planning b-round-493/probe/backdrop-probe.json: backdrop [0,0,W,H-40] at 1440x900, 1280x720, 375x812, no transformed ancestor found at settle; strip hits the page min-h-screen div; dialog stays open (cause not established)'
rulings = {
 'A-R493-REVIEW-F1': ('low', 'doc 318 l.36 backdrop sentence false (= C-R493-01)', 'fixed in v6 (D-29z1762)'),
 'A-R493-REVIEW-F2': ('low', 'doc 318 l.85 "deleting each change turns a test red": trigger type="button" has no mutant/test', 'fixed in v6 wording (D-29z1762); test-coverage gap recorded in the doc, polish later'),
 'A-R493-REVIEW-F3': ('low', 'doc 318 l.86 "C checks in this round" wording', 'fixed in v6 (past tense, C round 492 PW-CHECK PASS) (D-29z1762)'),
 'A-R493-REVIEW-F4': ('info', 'doc 318 l.63 "B first sketch"', 'fixed in v6 (names browser mutant O, P11-P13) (D-29z1762)'),
 'A-R493-REVIEW-F7': ('info', 'doc 318 TODO lacks three deferred Lows', 'fixed in v6 (BACKDROP-SHORT, DIALOG-NO-MARGIN-NARROW, SUBMIT-FOCUS-LOST added) (D-29z1762)'),
 'A-R493-REVIEW-F8': ('info', 'doc 315 l.59/107-108 historic out-of-scope lines', 'wontfix (D-29z1762): historic scope/run lines stay true; fix recorded at 315 l.117'),
}
for i, (sev, title, status) in rulings.items():
    if not (find(dl, i) or find(of, i)):
        dl.append({'id': i, 'severity': sev, 'origin': 'B spec', 'status': status, 'title': title, 'evidence': 'a-round-493.md code-reviewer table', 'added': WHEN})
ck = find(dl, 'TL-R492-L4-CTRLK-OVER-DIALOG') or find(of, 'TL-R492-L4-CTRLK-OVER-DIALOG')
if ck: ck['correction'] = 'D-29z1763 (TL-R494-D1): the palette opens BEHIND the dialog, dimmed under the password backdrop (palette lives in the sticky z-50 header, Header.tsx:68), not over it; evidence b-round-492/probe/ctrlk-head-open.png, ctrlk-v5-open.png. Title kept as id.'
sig = find(b['architecture_signals'], 'SIG-R487-PROFILE-NAME-EDITOR-EXTRACT')
if sig: confirm(sig, 'A-R493 code-reviewer Architecture note: keep; after ARCH-CHECKPOINT-ACCOUNT-PROFILE consider moving focus trap/return into shared Modal (shared-modal-no-focus-management) (D-29z1761)')
rc = find(b.setdefault('retro_candidates', []), 'RC-R492-DOC-TRUTH-REVIEW')
if rc:
    rc['note'] = rc.get('note', '') + ' | 2nd occurrence round 493 (C-R493-01, l.36 backdrop): reviews truth-checked sentences against browser rows only, not against open/deferred findings on the same code; round 494 adds a sentence->evidence ledger (b-round-493/doc-ledger.md) cross-checked against those findings. Candidate lesson for RETRO 495 (2x).'
q = find(b['post_current_stage_queue'], 'DPG-FIX')
if q: prepend_status(q, 'in_progress (D-29z1761): 493 C FAIL on a doc line (C-R493-01); 494 re-dispatch docs-only v6; then RETRO 495 (if 494 PASS) and DPG-BUTTON-CLEANUP; REGRESSION on/after 2026-11-16')
dec = b['decisions_log_b']
dec.append({'id': 'D-29z1761', 'date': '2026-11-13', 'by': WHEN, 'decision': 'C round 493 FAIL accepted (short route, STOPPED - routed to B; browserVerified/realVerified false because C5/C7 were not run; C1/C2/C3/C8 PASS). Gate 493 skipped (C taskStatus FAIL); baseline stays e4e1d1c. Nothing done/mzadaa. Ruling on A STOP / C-R493-01 (Low, origin B spec): accepted delta, docs-only v6 (l.36 rewritten from B measurement at 3 viewports; Tab-trap half names the Ctrl+K exception). Round 494 = same 3 Mediums; outcome: PASS -> done client path, RETRO 495; FAIL -> fix-up 495, RETRO 496.'})
dec.append({'id': 'D-29z1762', 'date': '2026-11-13', 'by': WHEN, 'decision': 'A-R493 reviewer findings ruled: F1 -> C-R493-01 fixed; F2/F3/F4/F7 fixed in v6 doc text; F5/F6 verified true; F8 wontfix (historic lines). A gets one refinement of the STOP clause for doc sentences: a sentence listed in b-round-493/doc-ledger.md with its evidence is ruled; a reviewer doubt about it is reported, not a STOP, unless A cites an evidence file that contradicts it.'})
dec.append({'id': 'D-29z1763', 'date': '2026-11-13', 'by': WHEN, 'decision': f'tech-lead docs-only review of v6: {TL}. v6 full {FULL}, delta v5->v6 {DELTA}; v6 CSS sha equal v5/v3; covering 6 files/97 tests on v6 (b-round-493/sketch-494-covering.log). C8 clip selector [data-clip-id] 0 -> 1 after Enter at both viewports (b-round-493/probe/clip-probe.json).'})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(done_flag, 'w').write('applied\n')
print('ok')
