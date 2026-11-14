# B round 514 -> 515 planning: backlog.json v520 -> v521. Run once from the loop root: python3 -I b-round-514/update-backlog-515.py
import json, os, re, shutil
L = os.getcwd()
P = os.path.join(L, 'backlog.json')
DONE = os.path.join(L, 'b-round-514', 'update-backlog-515.applied')
assert not os.path.exists(DONE), 'already applied'
shutil.copyfile(P, os.path.join(L, 'b-round-514', 'backlog-before-515.json'))
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 520, b['version']
BY = '2026-11-14 B round 514 -> 515 planning'
DATE = '2026-11-14'
of = b['open_findings']
dl = b['deferred_low_polish']
ARCHIVE_WORD = re.compile(r'closed|done|resolved', re.I)


def find(lst, i):
    for f in lst:
        if isinstance(f, dict) and f.get('id') == i:
            return f
    return None


def any_find(i):
    return find(of, i) or find(dl, i)


def prefix_status(f, s):
    f['status'] = s + ' | ' + str(f.get('status', ''))


def add_confirmed(f, s):
    f.setdefault('confirmedBy', []).append(s)


open_touched = []

# D-29z1869: round 514 accepted from c-round-514.json (PASS, browserVerified/realVerified true) + gate 514 published b7cb61f
for i, why in [
    ('B-R512-COOKIE-DISMISS-FOCUS-LOST', 'C round 514 C3 (22 keyboard/Space rows, BODY 0/22, visible brass ring) and C4 (pointer: logo, no ring, no scroll); covering 6/99 + mutants M1-M15 red on B\'s rows'),
    ('B-R512-COOKIE-CLOSE-OVERLAPS-TEXT', 'C round 514 C1 (no overlap at 320/375/639, min gap 10.5/38/87.5 px, Close 40x40; 1280/1440 boxes equal HEAD)'),
]:
    f = find(of, i)
    prefix_status(f, 'closed (D-29z1869): ' + why + '; browserVerified true; published b7cb61f (gate 514)')
f = any_find('INFO-C510-COLD-HYDRATION')
if f is not None:
    add_confirmed(f, 'C round 514 env note: 8 cold-Vite hydration errors on the first banner run, 0 on the warm re-run; B round 514 r514 re-run on the round-515 sketch: the same 4 warm-up errors, r515 probe 0 (D-29z1869)')

# D-29z1870: gate 514 review, C-R514-01, A round 514 review notes
g1 = {'id': 'GATE514-M1-POINTER-FIELD-KEYBOARD', 'severity': 'medium', 'origin': 'gate reviewer', 'added': BY,
      'title': 'Cookie banner: after a pointer/tap dismissal, focus returns to a previously focused text field, which on iOS/Android reopens the on-screen keyboard although the user only tapped Accept',
      'evidence': 'gates/round-514/review.md finding 1; B browser probe b-round-514/probe/head/r515.json P1 (375 and 1280: activeElement = the newsletter email INPUT after a pointer Accept) and P3 (/hire-us textarea)',
      'repro': 'Home at 375 or 1280 with a GA4 id: tap/click the newsletter email field, then tap/click Accept -> focus is on the email input (HEAD b7cb61f)',
      'status': 'dispatched round 515 (D-29z1871): pointer branch skips keyboard-opening fields (text-type input, textarea, contenteditable) -> header logo with preventScroll; select/checkbox/radio/range stay returnable (product-designer + tech-lead); the on-screen keyboard half is a real-device manual row TLM-R515-PHONE-KEYBOARD (Chromium cannot show it)'}
if any_find(g1['id']) is None:
    of.append(g1)
open_touched.append(g1)
c1 = any_find('C-R514-01')
if c1 is None:
    c1 = {'id': 'C-R514-01', 'severity': 'low', 'origin': 'B pre-check', 'added': BY,
          'title': 'Cookie banner: stale stored element. Enter the banner from A, Tab out to B, click empty space (BODY), then a pointer click on Accept in a browser that does not focus clicked buttons (Safari/iOS) returns focus to the old A, possibly off-screen',
          'evidence': 'c-round-514.json bugs[0]; a-round-514/code-review.md R1; B simulation b-round-514/probe/head/r515.json P2 (mousedown preventDefault in Chromium: HEAD -> "Cookie Policy", sketch -> logo)',
          'status': ''}
    of.append(c1)
c1['status'] = ('dispatched round 515 (D-29z1871): fixed in code with the round-515 onBlur clearing (same file, cheap, round owns it); unit R515-T3/T7 + '
                'Chromium simulation P2 only; the real Safari/iOS half joins SAFARI-CHECKS, so this id stays open after C PASS until that manual check')
open_touched.append(c1)
for i, sev, t, ev, st in [
    ('GATE514-L2-STALE-REF', 'low', 'focusBeforeBannerRef keeps a detached node after dismissal (memory only; not observable)',
     'gates/round-514/review.md finding 2',
     'deferred_low_polish (D-29z1870): round 515 onBlur clears the ref whenever focus leaves the banner (the common paths); the no-candidate edge keeps it (memory only, no observable behaviour, no row); an explicit clear was drafted and dropped by B as an unkillable mutant (M9 of the first draft)'),
    ('GATE514-L3-HEADER-SELECTOR', 'low', 'Focus fallback selectors `header a[href]` are not scoped to the site header (SfxSceneBuilder/SfxSoundLibrary/SfxSceneExport also render <header>)',
     'gates/round-514/review.md finding 3', 'deferred_low_polish (D-29z1870): needs Header.tsx (data-site-header) outside the cookie grant; site header is first in DOM today'),
    ('A-R514-R6-F9-ORDER', 'low', 'Test row R514-F9 sits before F7/F8 in the file (nit)', 'a-round-514.md For B R6', 'deferred_low_polish (D-29z1870)'),
]:
    if any_find(i) is None:
        dl.append({'id': i, 'severity': sev, 'origin': 'gate reviewer' if i.startswith('GATE') else 'A', 'added': BY, 'title': t, 'evidence': ev, 'status': st})
for i, t, ev in [
    ('A-R514-R2-HEADER-BUTTON-ROW', 'No test row for the `header button` focus fallback', 'a-round-514.md For B R2'),
    ('A-R514-R3-F8-BODY', 'R514-F8 does not pin activeElement = BODY', 'a-round-514.md For B R3'),
]:
    f = any_find(i)
    if f is None:
        f = {'id': i, 'severity': 'low', 'origin': 'A', 'added': BY, 'title': t, 'evidence': ev, 'status': ''}
        of.append(f)
    f['status'] = 'dispatched round 515 (D-29z1871): ' + ('row R515-T5 (mutant M5 red)' if 'R2' in i else 'R514-F8 now asserts document.body (strengthen-only)')
    open_touched.append(f)
if any_find('INFO-GATE514-L4-DETAIL-PROXY') is None:
    of.append({'id': 'INFO-GATE514-L4-DETAIL-PROXY', 'severity': 'info', 'origin': 'gate reviewer', 'added': BY,
               'title': '`click.detail === 0` is only a keyboard proxy: programmatic .click() and some AT activations also send 0 and take the scrolling focus() path (acceptable)',
               'evidence': 'gates/round-514/review.md finding 4', 'status': 'recorded (D-29z1870): no task; doc 332 already lists the opposite case'})
if any_find('A-R514-SPEC-STRENGTHEN-ONLY') is None:
    f = {'id': 'A-R514-SPEC-STRENGTHEN-ONLY', 'severity': 'info', 'origin': 'A', 'added': BY,
         'title': 'L11 strengthen-only clause vs a byte-pinned sketch: A could not add rows for R2/R3 because task §2 and check 4 pinned the bytes',
         'evidence': 'a-round-514.md For B "Spec tension"',
         'status': 'ruled (D-29z1871): with a byte-pinned sketch, B puts the strengthen-only rows into the sketch (round 515 does: R515-T5, F8 BODY); A may still propose more under "For B", never edit pinned bytes'}
    of.append(f)
sig = find(b['architecture_signals'], 'SIG-R513-COOKIE-FOCUS-GROWTH')
if sig is not None:
    add_confirmed(sig, 'gates/round-514/review.md Architecture note (keep; extract restoreFocusAfterDismiss only when a second non-modal surface needs it, folding gate findings 1-3); A round 514 reviewer same (D-29z1870). Round 515 adds one onBlur handler and one selector constant: still under the trigger; no checkpoint')
saf = find(of, 'SAFARI-CHECKS')
add_confirmed(saf, 'round 515 adds the C-R514-01 Safari/iOS half: enter the cookie banner from A, Tab out, click empty space, tap Accept -> focus on the header logo, not A (D-29z1870)')
dev = find(of, 'SABA-DEVICE-CHECKS')
add_confirmed(dev, 'round 515 adds TLM-R515-PHONE-KEYBOARD: on a real phone, type in the newsletter email field, tap Accept on the cookie banner -> the on-screen keyboard stays closed (D-29z1870)')
tlm = b['tech_lead_manual_checks']
if isinstance(tlm, list) and find(tlm, 'TLM-R515-PHONE-KEYBOARD') is None:
    tlm.append({'id': 'TLM-R515-PHONE-KEYBOARD', 'added': BY,
                'status': 'open (D-29z1870): after C round 515 PASS; deadline RETRO 525 (L46); does not block; joins SABA-DEVICE-CHECKS',
                'what': 'iPhone Safari and Android Chrome, Vercel preview, fresh storage: tap the home newsletter email field (keyboard opens), tap Accept on the cookie banner -> the keyboard closes and does not reopen; the field keeps its text; the page does not jump'})

# D-29z1871: round 515 scope
for r in b['rounds']:
    if r.get('round') == 514:
        r['status'] = 'C PASS (browserVerified true), gate 514 published b7cb61f (D-29z1869)'
b['rounds'].append({'round': 515, 'task': 'current-task.md', 'decision': 'D-29z1871',
                    'type': 'Cookie banner follow-up: GATE514-M1-POINTER-FIELD-KEYBOARD (Medium) + C-R514-01 (Low, same code) + A-R514 R2/R3 test rows',
                    'status': 'dispatched',
                    'note': 'baseline HEAD b7cb61f clean; sketch b-round-514/sketch-515.patch.txt; pins r515-tree-sha256.txt (1430), r515-pre-sha.txt, r515-post-sketch-sha.txt; claims b-round-514/claims-515.sh; new doc 333 (332 untouched)'})
q = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'DPG-FIX')
q['status'] = ('in_progress (D-29z1871): round 514 cookie Mediums C PASS (published b7cb61f); round 515 = GATE514-M1 cookie follow-up; REGRESSION on/after 2026-11-16; '
               'then NONBRAND N4 (Home: SpecialOffers x2 + LeadMagnet Close X) .. N9, PD-R498, DPG-BUTTON-CONTRACT-TABLE, rest of P1 incl. DPG2-*, DP gate, P2 | ' + q['status'])
nb = find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND')
nb.setdefault('status_history_d29z1871', []).append(nb['status'])
nb['status'] = ('in_progress (D-29z1871): N1 (round 508), N2 PurchaseHeader (rounds 511+512) and N3 cookie banner (round 513, published 4c85587) are C-verified; '
                'rounds 514-515 fix banner focus bugs; next stage N4 Home (SpecialOffers x2 + LeadMagnet Close X) after REGRESSION 2026-11-16 if due; N5-N9 and the StemsPlayerModal pair remain')
open_touched.append(nb)
b['current_task'] = ('Round 515: cookie banner follow-up on HEAD b7cb61f: git apply b-round-514/sketch-515.patch.txt (pointer dismissal skips keyboard-opening '
                     'fields -> header logo, preventScroll; select/checkbox/contenteditable=false returnable; onBlur clears the stored element when focus leaves '
                     'the banner; rows R515-T1..T7, F8 BODY pin); new doc 333. C verifies on a GA4-env dev server.')
b['decisions_log_b'] += [
    {'id': 'D-29z1869', 'date': DATE, 'by': BY, 'decision': 'Round 514 accepted from c-round-514.json (PASS, browserVerified/realVerified true, rows C0-C9, 1 Low C-R514-01 unverified-in-Chromium) and gate 514 (published b7cb61f, both remotes). B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT closed on C1/C3/C4 browser evidence.'},
    {'id': 'D-29z1870', 'date': DATE, 'by': BY, 'decision': 'Gate 514 review: finding 1 (Medium) -> GATE514-M1-POINTER-FIELD-KEYBOARD, reproduced by B in Chromium (focus target only; the on-screen keyboard needs a real device -> TLM-R515-PHONE-KEYBOARD in SABA-DEVICE-CHECKS); findings 2/3 -> deferred Lows GATE514-L2-STALE-REF, GATE514-L3-HEADER-SELECTOR; finding 4 -> INFO; architecture note -> confirmedBy on SIG-R513-COOKIE-FOCUS-GROWTH (signal only). C-R514-01 recorded as open Low (Safari half -> SAFARI-CHECKS). A round 514 R2/R3 -> rows in round 515, R6 -> deferred Low.'},
    {'id': 'D-29z1871', 'date': DATE, 'by': BY, 'decision': 'Round 515 = GATE514-M1 (Medium, bug gate first) + C-R514-01 (Low, same lines, round owns it) + A-R514 R2/R3 rows; NONBRAND N4 waits one round. Ruling (product-designer, tech-lead approve-with-changes): pointer/tap dismissal skips keyboard-opening fields (text-type input, textarea, contenteditable not "false") and falls to the header logo with preventScroll; keyboard dismissal still returns to the field; select/checkbox/radio/range returnable; banner onBlur clears the stored element when focus leaves the banner (window-switch outcome equals HEAD, pre-ruled limit 4 of round 514). Doc 332 stays byte-identical; new doc 333 supersedes its pointer rule for keyboard-opening fields only. Strengthen-only rows live in the pinned sketch (A-R514-SPEC-STRENGTHEN-ONLY ruled).'},
]
b['version'] = 521
b['updated'] = BY
for f in open_touched:
    s = str(f.get('status', ''))
    assert not ARCHIVE_WORD.search(s), ('archive matcher would hit', f.get('id'), s)
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n')
print('backlog v521 written')
