# B round 513 -> 514 planning: backlog.json v519 -> v520. Run once from the loop root: python3 -I b-round-513/update-backlog-514.py
import json, os, re, shutil
L = os.getcwd()
P = os.path.join(L, 'backlog.json')
DONE = os.path.join(L, 'b-round-513', 'update-backlog-514.applied')
assert not os.path.exists(DONE), 'already applied'
shutil.copyfile(P, os.path.join(L, 'b-round-513', 'backlog-before-514.json'))
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 519, b['version']
BY = '2026-11-14 B round 513 -> 514 planning'
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

# D-29z1866: round 513 accepted (C PASS, browserVerified/realVerified true, 0 bugs; gate 513 published 4c85587)
for i, why in [('A-R183-COOKIE-BUTTON-TYPE', 'C round 513 C8 lint 171 (the three useButtonType hits left with the raw buttons)'),
               ('A-R183-REVIEW-FBQ-BRANCH', 'C round 513 C7 row N3-6 green, mutants M11/M13 red on the same rows')]:
    f = any_find(i)
    prefix_status(f, 'closed (D-29z1866): ' + why + '; browserVerified true; published 4c85587 (gate 513)')
nb = find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND')
nb.setdefault('status_history_d29z1866', []).append(nb['status'])
nb['status'] = ('in_progress (D-29z1866): N1 (round 508), N2 PurchaseHeader (rounds 511+512) and N3 cookie banner (C round 513 PASS, '
                'browserVerified true, published 4c85587) are C-verified; N4-N9 and the StemsPlayerModal pair remain; round 514 fixes two '
                'pre-existing banner Mediums before N4')
open_touched.append(nb)
q = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'DPG-FIX')
q['status'] = ('in_progress (D-29z1868): NONBRAND N3 C PASS round 513 (published 4c85587); round 514 = B-R512-COOKIE-DISMISS-FOCUS-LOST + '
               'B-R512-COOKIE-CLOSE-OVERLAPS-TEXT; REGRESSION on/after 2026-11-16; then N4-N9, PD-R498, DPG-BUTTON-CONTRACT-TABLE, rest of P1 '
               'incl. DPG2-*, DP gate, P2 | ' + q['status'])
f = find(of, 'INFO-C510-COLD-HYDRATION')
if f is not None:
    add_confirmed(f, 'C round 513 note: n3-banner.mjs studio section hydration errors on the first cold run, 0 on a warm re-run; B round 513 probes: 4 warm-up errors at HEAD, 0 in the measured runs (D-29z1866)')

# D-29z1867: A round 513 review Lows, gate 513 review items, Saba question
for i, t, ev in [
    ('A-R513-REVIEW-N3-5-CWD-REGEX', 'N3-5 reads CookieConsent.tsx through process.cwd() and its regex also matches comments (breaks if vitest runs from another cwd)',
     'a-round-513.md code-reviewer Low 3; gates/round-513/review.md finding 6'),
    ('A-R513-REVIEW-N3-3-SELF-REF', 'N3-3 compares the Close className with a reference IconButton built from the same props (partly self-referential; the arrayContaining pin and the svg width keep it falsifiable)',
     'a-round-513.md code-reviewer Low 4; gates/round-513/review.md finding 6'),
]:
    if any_find(i) is None:
        dl.append({'id': i, 'severity': 'low', 'origin': 'B spec', 'added': BY, 'title': t, 'evidence': ev,
                   'status': 'deferred_low_polish (D-29z1867); candidate for DPG-BUTTON-CONTRACT-TABLE / SIG-R512-PURCHASEHEADER-SOURCE-SCAN-TESTS'})
if any_find('SABA-Q-513-CLOSE-AS-DECLINE') is None:
    q2 = {'id': 'SABA-Q-513-CLOSE-AS-DECLINE', 'severity': 'info', 'origin': 'A', 'added': BY,
          'title': 'Cookie banner: the mobile Close X (label "Close") silently records a decline. Keep, relabel ("Decline and close"), or make Close hide the banner for this session only?',
          'evidence': 'a-round-513.md code-reviewer Low 2; b-round-513/consult-product-designer.md finding 5 (default keep: safer under GDPR, today\'s behaviour)',
          'status': 'awaiting_user (D-29z1867): question in user-review/questions-round-513.md Q1; default keep; round 514 keeps label and behaviour'}
    of.append(q2)
    open_touched.append(q2)
f = find(of, 'B-R512-COOKIE-CLOSE-OVERLAPS-TEXT')
add_confirmed(f, 'gates/round-513/review.md finding 1: Close is 32 px, below the 44 px touch guideline; round 514 makes it md 40 px (D-29z1867)')
f = any_find('A-R183-COOKIE-INLINE-GRADIENT')
add_confirmed(f, 'gates/round-513/review.md finding 5: inline rgba gradient + backdropFilter style on the banner root (D-29z1867)')
if any_find('INFO-GATE513-L2-FOCUS-GLOBAL') is None:
    of.append({'id': 'INFO-GATE513-L2-FOCUS-GLOBAL', 'severity': 'info', 'origin': 'environment', 'added': BY,
               'title': 'Gate 513 review finding 2 says Button/IconButton have no focus-visible style; the banner controls get the global app.css :focus-visible brass outline (C round 513 C3 measured solid 1px brass 0.8, offset 2px)',
               'evidence': 'gates/round-513/review.md finding 2; c-round-513.md C3; app/styles/app.css :focus-visible',
               'status': 'recorded (D-29z1867): no task; the shared focus style is the global rule (SABA-B-4)'})
sigs = b['architecture_signals']
if find(sigs, 'SIG-R513-COOKIE-FOCUS-GROWTH') is None:
    sigs.append({'id': 'SIG-R513-COOKIE-FOCUS-GROWTH', 'added': BY, 'source': 'gates/round-513/review.md Architecture note',
                 'note': 'Keep CookieConsent whole. Round 514 adds one ref, one onFocus handler and one module helper for the focus return; a checkpoint is worth it only if focus handling grows beyond that (e.g. a second region needs the same pattern -> shared helper). Backlog signal, not scheduled.'})

# D-29z1868: round 514 scope and focus ruling
f = find(of, 'B-R512-COOKIE-DISMISS-FOCUS-LOST')
prefix_status(f, 'dispatched round 514 (D-29z1868): focus returns to the element focused before the banner (keyboard: focus(), pointer: preventScroll), else header logo, else first header link; product-designer ruling b-round-513/consult-product-designer*.md')
open_touched.append(f)
f = find(of, 'B-R512-COOKIE-CLOSE-OVERLAPS-TEXT')
prefix_status(f, 'dispatched round 514 (D-29z1868): Close IconButton md 40 px with X 20, text px-10 below sm; B probe: no overlap at 320/375/639, 1280/1440 boxes equal to HEAD')
open_touched.append(f)
f = any_find('C-R205-02')
add_confirmed(f, 'B round 513 probe (b-round-513/probe/sticky.mjs): cause found - app/styles/app.css l.269-272 `html, body { overflow-x: hidden }` makes body the sticky scroll container; header top = -1500 at scrollY 1500 on HEAD 4c85587; app/styles/** needs a root grant (D-29z1868)')

for r in b['rounds']:
    if r.get('round') == 513:
        r['status'] = 'C PASS (browserVerified true), gate 513 published 4c85587 (D-29z1866)'
b['rounds'].append({'round': 514, 'task': 'current-task.md', 'decision': 'D-29z1868',
                    'type': 'Cookie banner bugs: B-R512-COOKIE-DISMISS-FOCUS-LOST + B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (both Medium, same file)',
                    'status': 'dispatched',
                    'note': 'baseline HEAD 4c85587 clean; sketch b-round-513/sketch-514.patch.txt; pins r514-tree-sha256.txt (1429), r514-pre-sha.txt, r514-post-sketch-sha.txt; claims b-round-513/claims-514.sh; browser via a GA4-env dev server'})
b['current_task'] = ('Round 514: cookie banner focus return + Close overlap on HEAD 4c85587: git apply b-round-513/sketch-514.patch.txt '
                     '(focus returns to the element focused before the banner, else header logo, else first header link; keyboard focus(), pointer preventScroll; '
                     'Close IconButton md 40 px, X 20, text px-10 below sm; rows R514-F1..F8, N3-3 updated); doc 332. C verifies on a GA4-env dev server.')
b['decisions_log_b'] += [
    {'id': 'D-29z1866', 'date': DATE, 'by': BY, 'decision': 'Round 513 accepted from c-round-513.json (PASS, browserVerified/realVerified true, 0 bugs) and gate 513 (published 4c85587). NONBRAND N3 (cookie banner) is C-verified; A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH closed. NONBRAND parent status rewritten without archive-matcher words; old chain in status_history_d29z1866.'},
    {'id': 'D-29z1867', 'date': DATE, 'by': BY, 'decision': 'A round 513 code-reviewer Lows 3/4 -> deferred A-R513-REVIEW-N3-5-CWD-REGEX, A-R513-REVIEW-N3-3-SELF-REF; Low 2 (Close records a decline) -> Saba question SABA-Q-513-CLOSE-AS-DECLINE (default keep). Gate 513 review: finding 1 -> confirmedBy B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (fixed in 514 by md 40 px); finding 2 -> INFO-GATE513-L2-FOCUS-GLOBAL (global :focus-visible applies, C3 measured); finding 5 -> confirmedBy A-R183-COOKIE-INLINE-GRADIENT; finding 6 -> the A-R513 Lows; Architecture note -> SIG-R513-COOKIE-FOCUS-GROWTH (not scheduled).'},
    {'id': 'D-29z1868', 'date': DATE, 'by': BY, 'decision': 'Round 514 = B-R512-COOKIE-DISMISS-FOCUS-LOST + B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (two Medium bugs, same file, C bugs first). product-designer first ruled the header logo (option b) on the premise that the header is sticky; B measured that it is not (app.css html,body overflow-x hidden; C-R205-02 cause confirmed), so a mid-page keyboard dismissal would focus an off-screen logo with no visible ring. Re-consulted: approve focus return to the element focused before the banner (overwritten on each entry from outside), else header logo, else first header link; keyboard (click detail 0) focus() scrolls only if needed, pointer focus({preventScroll:true}); activeElement checked after each focus(). Close -> IconButton md (40 px, WCAG 2.5.8 AA), X 20, text px-10 sm:px-0. Accepted trade-off: Shift+Tab from a never-focused mid-page state scrolls to the logo at the top.'},
]
b['version'] = 520
b['updated'] = BY
for f in open_touched:
    s = str(f.get('status', ''))
    assert not ARCHIVE_WORD.search(s), ('archive matcher would hit', f.get('id'), s)
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n')
print('backlog v520 written')
