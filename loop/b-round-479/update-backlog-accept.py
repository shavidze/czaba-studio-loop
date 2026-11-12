import json
import os
import shutil
import sys

ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
PATH = ROOT + '/backlog.json'
DONE = ROOT + '/b-round-479/update-backlog-accept.done'
BY = '2026-11-12 B round 479 -> 480 planning'
DATE = '2026-11-12'

if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)

with open(PATH, encoding='utf-8') as fh:
    b = json.load(fh)

if 'D-29z1700' in {d['id'] for d in b['decisions_log_b']}:
    print('already applied')
    sys.exit(0)

shutil.copyfile(PATH, ROOT + '/b-round-479/backlog-before-480.json')

b['version'] = b['version'] + 1
b['updated'] = BY
b['baseline']['head_round_480'] = {
    'head': 'bbb31935d0f64b82a77843dc9a0ea4d430e15fda',
    'source': 'gates/gate-round-479.json published (context/head-sha.txt still says 75a6028)',
    'date': DATE,
    'tree_clean': True,
}

decisions = [
    {
        'id': 'D-29z1700',
        'decision': (
            'Round 479 result (C evidence only): C PASS C1-C12, C13 recorded, 0 bugs, browserVerified/realVerified true '
            '(c-round-479.json); real-owner purchased path BLOCKED (backend unavailable in cloud); gate 479 published '
            'bbb3193 on both remotes (review COMMIT OK). DPG-FOOTER-LINKS is C-verified and waits for the DP gate '
            '(DPG rule 4), not done. Gate finding 1 (Medium a11y: client navigation does not announce the new page '
            'title) is promoted from signal SIG-R479-ROUTE-ANNOUNCE to open finding GATE479-M1-ROUTE-ANNOUNCE. B check: '
            'at 75a6028 Header.tsx already had 15 <Link> and root.tsx has no announcer, so the gap pre-existed for '
            'header navigation; round 479 extended it to 13 more links. Ruling after the RETRO consult (D-29z1704).'
        ),
    },
    {
        'id': 'D-29z1701',
        'decision': (
            'Rulings on round-479 open items. A code-reviewer Lows 1-4 and gate Lows 2-4 -> deferred_low_polish '
            '(A-R479-L1-TARGET-BLANK, A-R479-L2-SLOW-LOADER-FOCUS, A-R479-L3-DEFAULTPREVENTED-UNTESTED, '
            'GATE479-L2-TABINDEX-FINALLY, GATE479-L3-ISINTERNALHREF-NARROW, GATE479-L4-SAME-ROUTE-SCROLL); A Low 4 and '
            'gate Low 3 are the same class (IL1 detector) and share one entry; A Low 5 = GATE479-M1. '
            'A inventory gap ArrangementLibraryMenu.tsx:131 (Studio "View in store" <a href>) ruled out: leaving '
            'Studio with a full document load tears down the audio graph and media; deliberate, recorded, not tasked. '
            'Gate architecture note (InternalLink wrapper) -> signal SIG-R479-INTERNAL-LINK-WRAPPER, after the '
            'announcer, one owner. C13 (LeadMagnet 8 s timer now survives client navigation from a footer link; '
            'keep-list item, not compared with HEAD by C) -> Low B-R479-LEADMAGNET-TIMER-CLIENT-NAV (origin B, from C '
            'observation) and a Saba question in user-review/questions-retro-480.md; behaviour unchanged meanwhile.'
        ),
    },
    {
        'id': 'D-29z1702',
        'decision': (
            'Order: planning time 2026-11-12T22:43Z (b-round-479/checkpoint.md); regression-last 2026-11-10 is 2 days '
            'old, so REGRESSION is not due at this planning. retro_policy.next_due names round 480, so round 480 = '
            'RETRO 480 (window 465-479). Round 481 = REGRESSION-2026-11-13 (due at the next planning). This reverses the '
            'b-round-478 listed order (regression first) only because the regression is not yet due; nothing else moves.'
        ),
    },
]
for d in decisions:
    d['date'] = DATE
    d['by'] = BY
    b['decisions_log_b'].append(d)

for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R479-ROUTE-ANNOUNCE':
        s['status'] = 'promoted to open finding GATE479-M1-ROUTE-ANNOUNCE (D-29z1700) | ' + s['status']

b['open_findings'].append({
    'id': 'GATE479-M1-ROUTE-ANNOUNCE', 'severity': 'medium', 'origin': 'gate reviewer',
    'status': 'open (D-29z1700): ruling D-29z1704',
    'title': 'Client navigation does not announce the new page title to screen readers (a full reload did); 13 footer/content links since round 479, 15 header links before it',
    'evidence': 'gates/round-479/review.md finding 1; git show 75a6028:app/components/layout/Header.tsx (15 <Link>); app/root.tsx has no announcer',
    'repro': 'screen reader on: Tab to footer Support, Enter; the new page title is not spoken',
    'added': BY,
})

lows = [
    ('A-R479-L1-TARGET-BLANK', 'A', 'releaseLinkFocus does not skip target="_blank" or reloadDocument links (React Router shouldProcessLinkClick does); no current call site has either', 'a-round-479.md code-reviewer Low 1'),
    ('A-R479-L2-SLOW-LOADER-FOCUS', 'A', 'focus moves to body at click time; if a loader is slow or fails the user stays on the old page with focus on body; not written in doc 311', 'a-round-479.md code-reviewer Low 2'),
    ('A-R479-L3-DEFAULTPREVENTED-UNTESTED', 'A', 'the defaultPrevented branch of releaseLinkFocus has no runtime test; IL4 is source text and sits outside its describe', 'a-round-479.md code-reviewer Low 3'),
    ('GATE479-L2-TABINDEX-FINALLY', 'gate reviewer', 'link-focus.ts l.18-20: if the handler throws between setting and removing tabindex, body keeps tabindex=-1; try/finally would remove the risk', 'gates/round-479/review.md finding 2'),
    ('GATE479-L3-ISINTERNALHREF-NARROW', 'gate reviewer', 'store-internal-links.test.ts isInternalHref only detects href="/..." and viewAllLink/ROUTES.x; template or variable internal hrefs pass IL1 silently (also A-R479 Low 4)', 'gates/round-479/review.md finding 3; a-round-479.md Low 4'),
    ('GATE479-L4-SAME-ROUTE-SCROLL', 'gate reviewer', 'clicking the footer link of the current page now scrolls to top instead of reloading (documented in doc 311 item 3)', 'gates/round-479/review.md finding 4'),
    ('B-R479-LEADMAGNET-TIMER-CLIENT-NAV', 'B', 'LeadMagnet 8 s timer started on / keeps running across a footer client navigation and opens on the next page (C: /faq 2.2 s after nav at 76% scroll); before round 479 a reload restarted it; keep-list item, Saba question', 'c-round-479.md C13; c-round-479/misc.json'),
]
for i, owner, title, ev in lows:
    b['deferred_low_polish'].append({
        'id': i, 'severity': 'low', 'origin': owner, 'status': 'deferred_low_polish (D-29z1701)',
        'title': title, 'evidence': ev, 'repro': 'see evidence', 'added': BY,
    })

b['architecture_signals'].append({
    'id': 'SIG-R479-INTERNAL-LINK-WRAPPER', 'status': 'signal (D-29z1701): not tasked; after the route announcer, one owner',
    'note': 'InternalLink in app/components/ui wrapping Remix Link + releaseLinkFocus (opt-out for CookieConsent); migrate 13 call sites; replace IL1/IL2 text scans with render tests',
    'evidence': 'gates/round-479/review.md Architecture note', 'added': BY,
})

for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        e['status'] = (
            'in_progress (D-29z1700): DPG-FOOTER-LINKS C-verified round 479, published bbb3193, awaits the DP gate; '
            'next after RETRO 480 and REGRESSION-2026-11-13: DPG-BUTTON-CLEANUP | ' + e['status']
        )
        p = e.get('p1_progress_d29z1697')
        if isinstance(p, dict):
            p['DPG-FOOTER-LINKS'] = 'C-verified round 479 (C PASS, published bbb3193); awaits DP gate (D-29z1700)'

for r in b['rounds']:
    if r.get('round') == 479 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1700): C PASS browserVerified true, gate 479 published bbb3193'

with open(PATH, 'w', encoding='utf-8') as fh:
    json.dump(b, fh, indent=2, ensure_ascii=True)
open(DONE, 'w').write('applied v%d\n' % b['version'])
print('applied', b['version'])
