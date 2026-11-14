# B round 515 -> 516 planning: backlog.json v521 -> v522. Run once from the loop root: python3 -I b-round-515/update-backlog-516.py
import json, os, re, shutil
L = os.getcwd()
P = os.path.join(L, 'backlog.json')
DONE = os.path.join(L, 'b-round-515', 'update-backlog-516.applied')
assert not os.path.exists(DONE), 'already applied'
shutil.copyfile(P, os.path.join(L, 'b-round-515', 'backlog-before-516.json'))
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 521, b['version']
BY = '2026-11-14 B round 515 -> 516 planning'
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

# D-29z1872: round 515 accepted from c-round-515.json (PASS, browserVerified/realVerified true, C0-C8) + gate 515 published 63c8894
for i, why in [
    ('A-R514-R2-HEADER-BUTTON-ROW', 'row R515-T5 present and green (C round 515 C5, covering 6/112), mutant M5 red on the same row as B'),
    ('A-R514-R3-F8-BODY', 'R514-F8 asserts document.body (C round 515 C5), BODY 0/22 in C2 browser rows'),
]:
    f = any_find(i)
    prefix_status(f, 'closed (D-29z1872): ' + why + '; published 63c8894 (gate 515)')
g1 = find(of, 'GATE514-M1-POINTER-FIELD-KEYBOARD')
g1['status'] = ('browser half verified (D-29z1872): C round 515 C1 P1 (375 tap, 1280 click) and P3 textarea -> header logo, focusVisible false, scrollY unchanged, '
                'value kept; select stays SELECT; published 63c8894. Stays open_tech_lead_manual only for the real phone keyboard (TLM-R515-PHONE-KEYBOARD in '
                'SABA-DEVICE-CHECKS, deadline RETRO 525); does not block (2026-10-23 root clarification) | ' + g1['status'])
open_touched.append(g1)
c1 = any_find('C-R514-01')
c1['status'] = ('code fix C-verified by simulation (D-29z1872): C round 515 C1 P2 simulated no-focus click -> logo; R515-T3/T7 green; open only for the real '
                'Safari/iOS half (SAFARI-CHECKS) | ' + c1['status'])
open_touched.append(c1)

# D-29z1873: gate 515 review (all Low/info) + A round 515 "For B" notes
f = any_find('GATE514-L2-STALE-REF')
for i, sev, t, ev, st in [
    ('GATE515-L1-WINDOW-SWITCH-NULL-RELATED', 'low',
     'Cookie banner onBlur clears the stored element also when the window loses focus (relatedTarget null); after an alt-tab a keyboard dismissal goes to the header logo instead of the original element (same as HEAD; pre-ruled 1 of round 515)',
     'gates/round-515/review.md finding 1', 'deferred_low_polish (D-29z1873): pre-ruled limit; fix if it matters = skip clearing when document.hasFocus() is false'),
    ('GATE515-L2-SKIPPREVIOUS-TYPE', 'low', 'CookieConsent.tsx l.38 `skipPrevious` is typed boolean | undefined (`previous?.matches`); tidier `previous !== null && previous.matches(...)`',
     'gates/round-515/review.md finding 2', 'deferred_low_polish (D-29z1873)'),
    ('A-R515-REVIEW-SELECTOR-ROWS', 'low',
     'No test rows for input without type, contenteditable="" and contenteditable="plaintext-only" in the R515 keyboard-field fixture set (coverage gap only)',
     'a-round-515.md For B 1; a-round-515/selector-probe.json (Chromium: the pinned selector matches all three); C round 515 PASS',
     'deferred_low_polish (D-29z1873): re-rated from the A reviewer\'s Medium to Low: behaviour is correct (A Chromium probe, C1), only rows are missing; next owner of CookieConsent.test.tsx adds them through T1/T2'),
    ('A-R515-REVIEW-CE-CASE', 'low', 'contenteditable="FALSE" (upper case) matches the keyboard-field selector, so a pointer dismissal skips a non-editable element; fix `[contenteditable="false" i]`; no such element in the app (inference)',
     'a-round-515.md For B 2', 'deferred_low_polish (D-29z1873)'),
    ('A-R515-REVIEW-READONLY', 'low', 'input[readonly] and inputmode="none" open no keyboard but are skipped on a pointer dismissal (focus -> logo); add :not([readonly]) or document it',
     'a-round-515.md For B 3', 'deferred_low_polish (D-29z1873)'),
    ('A-R515-REVIEW-HELPER-ASSERT', 'low', 'CookieConsent.test.tsx enterBannerFrom (l.327-336) does not assert that outside.focus() took effect',
     'a-round-515.md For B 4', 'deferred_low_polish (D-29z1873)'),
]:
    if any_find(i) is None:
        dl.append({'id': i, 'severity': sev, 'origin': 'gate reviewer' if i.startswith('GATE') else 'A', 'added': BY, 'title': t, 'evidence': ev, 'status': st})
add_confirmed(find(dl, 'A-R515-REVIEW-READONLY'), 'gates/round-515/review.md finding 3 (deny-list selector; readonly/disabled text inputs skipped, harmless) (D-29z1873)')
gr = any_find('A-R183-COOKIE-INLINE-GRADIENT')
if gr is not None:
    add_confirmed(gr, 'gates/round-515/review.md finding 4 (Info: inline rgba + backdropFilter style, pre-existing) (D-29z1873)')
sig = find(b['architecture_signals'], 'SIG-R513-COOKIE-FOCUS-GROWTH')
if sig is not None:
    add_confirmed(sig, 'gates/round-515/review.md Architecture note and A round 515 reviewer: keep; extract focusAfterCookieDismiss + selectors into lib/ only when a second non-modal surface needs it (D-29z1873). No checkpoint: round 516 leaves CookieConsent')
dev = find(of, 'SABA-DEVICE-CHECKS')
add_confirmed(dev, 'round 515 A note A-R515-VOICEOVER (info): with iOS VoiceOver on, double-tap Accept while a text field was focused before -> record where focus lands (detail may be 1 -> logo); next to TLM-R515-PHONE-KEYBOARD (D-29z1873)')

# D-29z1874: round 516 = NONBRAND N4 (Home: SpecialOffers x2 + LeadMagnet Close X)
for r in b['rounds']:
    if r.get('round') == 515:
        r['status'] = 'C PASS (browserVerified true), gate 515 published 63c8894 (D-29z1872)'
b['rounds'].append({'round': 516, 'task': 'current-task.md', 'decision': 'D-29z1874',
                    'type': 'DPG-BUTTON-CLEANUP-2-NONBRAND stage N4: Home SpecialOffers x2 (secondary lg via buildButtonClassName) + LeadMagnet Close X (IconButton ghost)',
                    'status': 'dispatched',
                    'note': 'baseline HEAD 63c8894 clean; sketch b-round-515/sketch-516.patch.txt; pins r516-tree-sha256.txt, r516-pre-sha.txt, r516-post-sketch-sha.txt; claims b-round-515/claims-516.sh; new doc 334'})
q = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'DPG-FIX')
q['status'] = ('in_progress (D-29z1874): round 515 cookie follow-up C PASS (published 63c8894); round 516 = NONBRAND N4 (Home); REGRESSION on/after 2026-11-16; '
               'then N5 (cart) .. N9, PD-R498, DPG-BUTTON-CONTRACT-TABLE, rest of P1 incl. DPG2-*, DP gate, P2 | ' + q['status'])
nb = find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND')
nb.setdefault('status_history_d29z1874', []).append(nb['status'])
nb['status'] = ('in_progress (D-29z1874): N1 (round 508), N2 PurchaseHeader (rounds 511+512) and N3 cookie banner (round 513) are C-verified; cookie focus '
                'follow-ups rounds 514-515 C PASS (published 63c8894); round 516 = N4 Home (SpecialOffers x2 + LeadMagnet Close X); N5-N9 and the StemsPlayerModal pair remain')
open_touched.append(nb)
b['current_task'] = ('Round 516: NONBRAND N4 on HEAD 63c8894: git apply b-round-515/sketch-516.patch.txt (SpecialOffers "Browse Gift Cards" and "View Collection" '
                     '-> buildButtonClassName secondary lg + w-fit; LeadMagnet Close X -> IconButton ghost; B2E-6 pin updated; new store-button-cleanup-n4 rows); '
                     'new doc 334. C verifies Home at 375/1280/1440, LeadMagnet open/close, journey, Studio + protection.')
b['decisions_log_b'] += [
    {'id': 'D-29z1872', 'date': DATE, 'by': BY, 'decision': 'Round 515 accepted from c-round-515.json (PASS, browserVerified/realVerified true, C0-C8, 0 bugs) and gate 515 (published 63c8894, both remotes). A-R514-R2-HEADER-BUTTON-ROW and A-R514-R3-F8-BODY closed (C5). GATE514-M1 browser half verified (C1), stays open only for the real phone keyboard (TLM-R515-PHONE-KEYBOARD, manual, non-blocking). C-R514-01 code fix verified by simulation only; stays open for Safari (SAFARI-CHECKS).'},
    {'id': 'D-29z1873', 'date': DATE, 'by': BY, 'decision': 'Gate 515 review (9/10, all Low/info): finding 1 -> GATE515-L1 (deferred, pre-ruled limit), 2 -> GATE515-L2 (deferred), 3 -> confirmedBy on A-R515-REVIEW-READONLY, 4 -> confirmedBy on A-R183-COOKIE-INLINE-GRADIENT; architecture note -> confirmedBy SIG-R513 (signal only). A round 515 For B: the reviewer\'s Medium A-R515-REVIEW-SELECTOR-ROWS is re-rated Low (behaviour proven by A\'s Chromium selector probe and C1; only rows missing) and deferred with CE-CASE, READONLY, HELPER-ASSERT; VOICEOVER -> SABA-DEVICE-CHECKS row. No open Critical/High/Medium cookie finding reproducible in the cloud.'},
    {'id': 'D-29z1874', 'date': DATE, 'by': BY, 'decision': 'Round 516 = NONBRAND N4 (Home: SpecialOffers x2 keep-list links -> buildButtonClassName secondary lg with w-fit; LeadMagnet keep-list Close X -> IconButton ghost, top-4 right-4 on the 48 px box keeps the glyph centre at 40/40 px as at HEAD; ruled by product-designer b-round-515/consult-product-designer.md). Byte sketch b-round-515/sketch-516.patch.txt (sha 560cdf79, tech-lead approve-with-changes applied: N4-2 pins <Link> = 2) with rows N4-1, N4-2, N4-3 x3 and the B2E-6 pin replaced equal-or-stronger (L23); mutants M1-M12 red; HEAD vs sketch browser probe b-round-515/probe/. REGRESSION not due (next 2026-11-16), RETRO at 525; open High B-R492 needs root/backend.'},
]
b['version'] = 522
b['updated'] = BY
for f in open_touched:
    s = str(f.get('status', ''))
    assert not ARCHIVE_WORD.search(s.split(' | ')[0]), ('archive matcher would hit', f.get('id'), s[:120])
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n')
print('backlog v522 written')
