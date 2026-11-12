import json
import sys

PATH = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
BY = '2026-11-12 B round 478 -> 479 planning'
DATE = '2026-11-12'

with open(PATH, encoding='utf-8') as fh:
    b = json.load(fh)

ids_dec = {d['id'] for d in b['decisions_log_b']}
if 'D-29z1695' in ids_dec:
    print('already applied')
    sys.exit(0)

b['version'] = b['version'] + 1
b['updated'] = BY
b['current_task'] = (
    'Round 479: DPG-FOOTER-LINKS (DPG P1) - Store internal <a href> -> Remix <Link> in Footer (9), '
    'CookieConsent, ProductSection, privacy/terms/faq content links; shared releaseLinkFocusToDocumentStart '
    'keeps the full-reload focus start; no reload, scrollY 0; sketch b-round-478/sketch-479 (current-task.md)'
)
b['baseline']['head_round_479'] = {
    'head': '75a6028c754b78a9b5241313f0ed1683d15b1e67',
    'source': 'gates/gate-round-478.json published',
    'date': DATE,
    'tree_clean': True,
}

decisions = [
    {
        'id': 'D-29z1695',
        'decision': (
            'Round 478 result: C PASS C1-C10, browserVerified/realVerified true (c-round-478.json); gate 478 published '
            '75a6028 (review COMMIT OK, 9/10). DPG-DOCS-UPDATE (DPG-P0-3b) is C-verified and awaits the DP gate '
            '(DPG rule 4), not done. DPG P0 (P0-1..P0-3b) is complete on C evidence; root re-runs the DP gate '
            '(design-philosopher + product-designer); ROOT-REQ-DPG-PRIMITIVES-PATCH should land first. '
            'C-R478-01 (Low, DESIGN_SYSTEM.md lightness prose) -> deferred_low_polish.'
        ),
    },
    {
        'id': 'D-29z1696',
        'decision': (
            'Rulings on A round 478 code-reviewer items left open: H2 accepted (L28 status line contract). '
            'M3 banner date: B-spec origin - the banner says the palette is Obsidian & Brass from 2026-10-25, '
            'but the Store direction-decision.md is dated 2026-11-05 (Studio VISUAL-A was earlier); Low B-R478-BANNER-DATE, '
            'deferred, with L9 (wcag-audit banner says old colours below while the live section is also below) and '
            'L11 (design-audit.md two blank lines) folded in. M4 (docs/design/components/card.md cool hsl(220) neutrals) '
            'and gate-478 finding 3 (shadow base hue hsl 220) -> input to DPG-COLOR-CONSOLIDATE (SIG-R478-COOL-NEUTRAL-HUE). '
            'L6 (style-guide.md glow advice) extends SIG-R478-AWWWARDS-GLOW. A architecture note direction-decision.md:18 '
            'misquote of brand-vision.md -> Low B-R478-DD-QUOTE deferred. Gate-478 architecture note (doc-token checker '
            'as a CI step) -> architecture signal SIG-R478-DOC-TOKEN-CHECKER-CI, not tasked.'
        ),
    },
    {
        'id': 'D-29z1697',
        'decision': (
            'Round 479 = DPG-FOOTER-LINKS (DPG P1 item 3). Order within P1: DPG-LOGO serif half is awaiting_user '
            '(SABA-Q-DPG-LOGO-FONT-SERIF); DPG-BUTTON-CLEANUP needs app/styles/app.css (globally forbidden, narrow grant '
            'per round) plus a Button.tsx migration across Header/Hero/404/search/login/AssetListing and a product-designer '
            'pass, so it is the next P1 round; FOOTER-LINKS has no dependency on it and no style change, and fits the '
            'one-feature round before REGRESSION-2026-11-13 and RETRO 480. Scope widened by root cause '
            '(full document reload on internal links), from an inventory of every <a> tag in app/** (whole-tag scan, '
            'b-round-478/sketch-479 store-internal-links.test.ts IL3 mutant): Footer 9, CookieConsent /privacy, '
            'ProductSection View all (/store), privacy /cookies, terms /license, faq /hire-us. Ruled out: ErrorBoundary "/" '
            '(full reload is the recovery), UserDropdown (exported from components/auth/index.ts, imported nowhere; '
            'legacy-removal signal SIG-R479-USERDROPDOWN-DEAD), SignUpForm /terms /privacy (inside the auth modal; a '
            'client navigation would leave the modal open; SIG-R479-AUTH-MODAL-LINKS), account.orders /music '
            '(dead target, B-R478-DEAD-MUSIC-LINK), account.downloads (protected), external/mailto links.'
        ),
    },
    {
        'id': 'D-29z1698',
        'decision': (
            'Focus contract for round 479 (L47): a client navigation keeps the old document, so Chrome keeps the '
            'sequential focus start where the unmounted link was; B measured on the sketch dev server that the first Tab '
            'after Enter on footer Support lands on the /support "Live Chat" button, while HEAD (full reload) lands on the '
            'header logo. blur() does not fix it; focusing document.body (temporary tabindex -1, preventScroll, attribute '
            'removed) does: first Tab = header logo link at both viewports, for footer and in-page links '
            '(b-round-478/probe/nav-final-5174.json vs nav-final-5173.json). Shared helper '
            'app/lib/link-focus.ts releaseLinkFocusToDocumentStart on every route-content Link; the persistent '
            'CookieConsent banner link does not use it (it stays mounted).'
        ),
    },
    {
        'id': 'D-29z1699',
        'decision': (
            'New findings from the round-479 inventory: B-R478-DEAD-LICENSE-LINK (Medium; Footer License and terms.tsx '
            'link to /license, which renders the 404 page with HTTP 200) and B-R478-DEAD-MUSIC-LINK (Medium; '
            'account.orders empty-state Browse Music -> /music 404; same in protected account.downloads). License copy '
            'is legal content B cannot invent: user-review/questions-round-478.md Q1 (options a/b/c, recommended a). '
            'Q2 recommends /store for both; account.orders is a later small round; account.downloads is root/Saba. '
            'Soft 404 (HTTP 200 for unknown routes) recorded as Low B-R478-SOFT-404, deferred. Regression not due: '
            'date -u 2026-11-12, regression-last.json next due on/after 2026-11-13. Next: REGRESSION-2026-11-13 '
            '(if planned on/after 11-13), RETRO 480, then DPG-BUTTON-CLEANUP.'
        ),
    },
]
for d in decisions:
    d['date'] = DATE
    d['by'] = BY
    b['decisions_log_b'].append(d)

b['deferred_low_polish'].extend([
    {
        'id': 'C-R478-01', 'severity': 'low', 'origin': 'A', 'status': 'deferred_low_polish (D-29z1695)',
        'title': 'DESIGN_SYSTEM.md l.139-140 and 783/787 say foreground 94% and muted 55% lightness; live #ECE6DA ~89%, #A39B8E ~60%',
        'evidence': 'c-round-478.md row C11', 'repro': 'compute HSL lightness of the live tokens and compare with the prose lines',
        'added': BY,
    },
    {
        'id': 'B-R478-BANNER-DATE', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1696)',
        'title': 'Round-478 history banner says Obsidian & Brass from 2026-10-25; Store direction-decision.md is dated 2026-11-05; also wcag-audit banner "old colours below" while the live section is below too (A-R478 L9), and design-audit.md has two blank lines after the banner (L11)',
        'evidence': 'a-round-478.md code-reviewer M3, L9, L11; direction-decision.md l.3', 'repro': 'read docs/design/*audit*.md line 3',
        'added': BY,
    },
    {
        'id': 'B-R478-DD-QUOTE', 'severity': 'low', 'origin': 'pre-existing', 'status': 'deferred_low_polish (D-29z1696)',
        'title': 'direction-decision.md l.18 quotes brand-vision.md as "(ოქროსფერი)"; the source says "(ოქროსფერი/ელექტრული ლურჯი)"',
        'evidence': 'a-round-478.md architecture notes', 'repro': 'grep the quote in both files',
        'added': BY,
    },
    {
        'id': 'B-R478-SOFT-404', 'severity': 'low', 'origin': 'B pre-check', 'status': 'deferred_low_polish (D-29z1699)',
        'title': 'Unknown Store routes (/license, /music) render the 404 page with HTTP 200 (soft 404, SEO)',
        'evidence': 'b-round-478.md inventory (curl status + title)', 'repro': 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/license',
        'added': BY,
    },
])

b['open_findings'].extend([
    {
        'id': 'B-R478-DEAD-LICENSE-LINK', 'severity': 'medium', 'origin': 'B pre-check',
        'status': 'awaiting_user (D-29z1699): user-review/questions-round-478.md Q1 (licence copy is legal content); round 479 keeps the target and only makes the link client-side',
        'title': 'Footer "License" (every Store page) and terms.tsx "License page" link to /license, which has no route and renders the 404 page',
        'evidence': 'b-round-478/claims-479-planning-output.txt K4 (routes license:0); curl /license title 404',
        'added': BY,
    },
    {
        'id': 'B-R478-DEAD-MUSIC-LINK', 'severity': 'medium', 'origin': 'B pre-check',
        'status': 'open (D-29z1699): account.orders.tsx -> /store in a later small round (signed-in page: stub per L36); account.downloads.tsx is protected (root/Saba); questions-round-478.md Q2',
        'title': 'Empty orders/downloads state "Browse Music" links to /music (404; /collections/music is 404 too)',
        'evidence': 'app/routes/account.orders.tsx:230, app/routes/account.downloads.tsx:290; curl /music title 404',
        'added': BY,
    },
])

b['architecture_signals'].extend([
    {'id': 'SIG-R478-DOC-TOKEN-CHECKER-CI', 'status': 'signal (D-29z1696): not tasked',
     'note': 'gate-478 reviewer: keep the doc-token checker (b-round-477/tools/doc-token-check.py) as a CI or npm script so design docs cannot drift from app.css again',
     'evidence': 'gates/round-478/review.md Architecture note', 'added': BY},
    {'id': 'SIG-R478-COOL-NEUTRAL-HUE', 'status': 'signal (D-29z1696): input to DPG-COLOR-CONSOLIDATE',
     'note': 'card.md hsl(220,...) neutrals and app.css shadow base hsl(220) are cool against the warm obsidian palette',
     'evidence': 'a-round-478.md M4; gates/round-478/review.md finding 3', 'added': BY},
    {'id': 'SIG-R479-USERDROPDOWN-DEAD', 'status': 'signal (D-29z1697): legacy-removal candidate',
     'note': 'app/components/auth/UserDropdown.tsx is exported from components/auth/index.ts and imported nowhere (2026-11-10 legacy removal policy)',
     'evidence': 'grep -rn UserDropdown app (b-round-478.md)', 'added': BY},
    {'id': 'SIG-R479-AUTH-MODAL-LINKS', 'status': 'signal (D-29z1697): not tasked',
     'note': 'SignUpForm /terms and /privacy links are plain <a> inside the auth modal (full reload); a Link would need the modal to close on navigation',
     'evidence': 'app/components/auth/SignUpForm.tsx:213-224', 'added': BY},
    {'id': 'SIG-R479-ROUTE-ANNOUNCE', 'status': 'signal (D-29z1698): not tasked',
     'note': 'client navigations do not announce the new page title to screen readers (a full reload did); candidate for a root-level route announcer (root.tsx is root-only)',
     'evidence': 'b-round-478.md focus section', 'added': BY},
])
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R478-AWWWARDS-GLOW':
        s['note'] = s['note'] + '; also docs/design/style-guide.md l.10 and l.136 glow advice (A-R478 code-reviewer L6, D-29z1696)'

for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        e['status'] = (
            'in_progress (D-29z1697): P0 complete on C evidence (P0-1 r474, P0-2 r475, P0-3a r477, P0-3b r478 published 75a6028), '
            'all awaiting the DP-gate re-run by root (not done until 10/10); P1 started: round 479 = DPG-FOOTER-LINKS; '
            'next DPG-BUTTON-CLEANUP; REGRESSION-2026-11-13 and RETRO 480 first when due | ' + e['status']
        )
        e['p1_progress_d29z1697'] = {
            'DPG-LOGO': 'colour half C-verified r477; serif half awaiting_user SABA-Q-DPG-LOGO-FONT-SERIF',
            'DPG-FOOTER-LINKS': 'dispatched round 479 (sketch b-round-478/sketch-479)',
            'DPG-BUTTON-CLEANUP': 'next P1 round (needs app.css narrow grant + Button.tsx migration + product-designer)',
            'DPG-CSS-DEDUP': 'not_started',
            'DPG-FONT-RESOLVE': 'STORE-2c-2..2c-4 (2c-1 done)',
            'DPG-COLOR-CONSOLIDATE': 'not_started; inputs SIG-R478-COOL-NEUTRAL-HUE, info blue, error reds',
        }

b['rounds'].append({
    'round': 479, 'task': 'current-task.md', 'decision': 'D-29z1697',
    'type': 'DPG-FOOTER-LINKS (DPG P1): Store internal links -> Remix Link + focus release',
    'status': 'dispatched',
    'note': 'baseline HEAD 75a6028 clean; claims b-round-478/claims-479.sh; sketch b-round-478/sketch-479 (11 files)',
})
for r in b['rounds']:
    if r.get('round') == 478 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1695): C PASS browserVerified true, gate 478 published 75a6028'

b['retro_candidates'].append({
    'id': 'RC-R479-CLIENT-NAV-FOCUS', 'added': BY,
    'note': 'Replacing a full reload with client navigation changes the sequential focus start; B caught it only with a keyboard Tab probe on a scratch dev server. RETRO 480: should "reload -> client nav" tasks always carry a first-Tab row (L47 extension)?',
})

with open(PATH, 'w', encoding='utf-8') as fh:
    json.dump(b, fh, indent=2, ensure_ascii=True)
print('applied', b['version'])
