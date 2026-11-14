# B round 512 -> 513 planning: backlog.json v518 -> v519. Run once from the loop root: python3 -I b-round-512/update-backlog-513.py
import json, os, shutil
L = os.getcwd()
P = os.path.join(L, 'backlog.json')
DONE = os.path.join(L, 'b-round-512', 'update-backlog-513.done')
assert not os.path.exists(DONE), 'already applied'
shutil.copyfile(P, os.path.join(L, 'b-round-512', 'backlog-before-513.json'))
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 518, b['version']
BY = '2026-11-14 B round 512 -> 513 planning'
DATE = '2026-11-14'
of = b['open_findings']
dl = b['deferred_low_polish']


def find(lst, i):
    for f in lst:
        if isinstance(f, dict) and f.get('id') == i:
            return f
    return None


def prefix_status(f, s):
    f['status'] = s + ' | ' + str(f.get('status', ''))


def add_confirmed(f, s):
    f.setdefault('confirmedBy', []).append(s)


# D-29z1860: round 512 accepted; N2 complete; C511 finding closed; NONBRAND parent restored
f = find(of, 'C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES')
prefix_status(f, 'closed (D-29z1860): C round 512 PASS (C1 stale scan 0/0/0, C2 doc 330), browserVerified true; published cbc5709 (gate 512)')
arch = json.load(open(os.path.join(L, 'archive', 'findings-archived.json'), encoding='utf-8'))
alist = arch if isinstance(arch, list) else arch.get('findings', arch.get('items', []))
src = next(x for x in alist if isinstance(x, dict) and x.get('id') == 'DPG-BUTTON-CLEANUP-2-NONBRAND')
if find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND') is None:
    nb = json.loads(json.dumps(src))
    nb['status'] = ('in_progress (D-29z1860, D-29z1862): N1 (round 508, cf89736) and N2 PurchaseHeader (rounds 511+512, C round 512 PASS, '
                    'browserVerified true, published cbc5709) are C-verified; round 513 = N3 cookie banner; N4-N9 and the StemsPlayerModal pair remain | '
                    + nb['status'])
    nb['restored_d29z1860'] = ('restored from archive/findings-archived.json: cloud/optimize-backlog.py archived it while in_progress '
                               '(status text contained a closed-like word); same class as ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN')
    of.append(nb)
rr = find(b['root_requests_b'], 'ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN')
add_confirmed(rr, 'B round 512 planning: DPG-BUTTON-CLEANUP-2-NONBRAND (in_progress) was in the archive; restored (D-29z1860)')

# D-29z1861: Lows and gate-512 review items
for i, t, ev in [
    ('A-R512-REVIEW-DOC330-HEAD-WORDING', 'doc 330 l.22 says the docs match "HEAD" while HEAD f5d1b9e still had the hand-rolled Buy Now (true after cbc5709)', 'a-round-512.md code-reviewer Low 1; a-round-512/code-review.md'),
    ('A-R512-REVIEW-DOC330-BUTTONMD-CLAIM', 'doc 330 l.22 says all three docs named Buy Now as primary; old button.md named only Add to Cart and "Revenue actions"', 'a-round-512.md code-reviewer Low 2'),
    ('A-R512-REVIEW-DECISION-TREE-UNLOCK', 'DESIGN_SYSTEM decision tree: Unlock Premium is a direct purchase but primary; a clause "upgrade purchases stay primary" would make the rule explicit', 'a-round-512.md code-reviewer Low 3'),
    ('GATE512-L2-CARTBUTTON-SIZE-DRIFT', 'CartButton keeps hand-copied px-6 py-3 text-base rounded-md font-semibold to match Button lg; nothing keeps it in sync (a test could compare with buildButtonClassName({size:"lg"}))', 'gates/round-512/review-result.json suggestion 2'),
]:
    if find(dl, i) is None:
        dl.append({'id': i, 'severity': 'low', 'origin': 'B spec' if i.startswith('A-R512') else 'pre-existing', 'added': BY, 'title': t,
                   'evidence': ev, 'status': 'deferred_low_polish (D-29z1861); candidate input to DPG-BUTTON-CONTRACT-TABLE / SIG-R477-DOCS-OUTSIDE-DESIGN'})
f = find(dl, 'B-R511-CART-PULSE-REDUCED-MOTION') or find(of, 'B-R511-CART-PULSE-REDUCED-MOTION')
add_confirmed(f, 'c-round-512.json notes / C5: max scale 1.043 (1440) / 1.042 (1280) under reduce (D-29z1861)')
for i, s in [('B-R510-BUSY-CURSOR-HIDDEN', 'gates/round-512/review-result.json suggestion 1 (pointer-events-none hides cursor-not-allowed while busy) (D-29z1861)'),
             ('SIG-R501-SHARED-BUTTON-SCANNER', 'gates/round-512/review-result.json suggestion 4 (buyVariantTag hand-written JSX scanner) (D-29z1861)'),
             ('INFO-C510-COLD-HYDRATION', 'B round 512 probe: first /studio/middle-east load at 1440 on each fresh GA4-env server raised useState-null hydration errors; the 1280 load clean (b-round-512/probe/*/n3.json studio) (D-29z1861)')]:
    f = find(dl, i) or find(of, i) or find(b.get('architecture_signals', []) if isinstance(b.get('architecture_signals'), list) else [], i)
    if f is not None:
        add_confirmed(f, s)
if find(of, 'INFO-C512-ARTIFACT-GAP') is None:
    of.append({'id': 'INFO-C512-ARTIFACT-GAP', 'severity': 'info', 'origin': 'B spec', 'added': BY,
               'title': 'Round-512 claims K5/K12 read a-round-511/diff.patch and b-round-511/scratch/, which the loop .gitignore drops at job hand-over (loop/**/*.patch, loop/**/scratch/)',
               'evidence': 'c-round-512.md C8 gap; loop .gitignore', 'status': 'recorded (D-29z1861): round-513 claims read only surviving files (temp-copy apply + post pin, *.patch.txt, mut-logs/); already covered by L56 (*.patch.txt) — scratch/ added to the B practice note'})
sigs = b.get('architecture_signals')
sig = {'id': 'SIG-R512-PURCHASEHEADER-SOURCE-SCAN-TESTS', 'added': BY, 'source': 'gates/round-512/review-result.json Architecture note (signal 3, repeated costly change)',
       'note': 'PurchaseHeader.tsx touched by 2c and N2; its tests scan source text (openingTags, buyVariantTag). Proposal: one bounded task replacing text-scanning tests with rendered-DOM assertions; keep the file whole. Backlog signal, not scheduled; candidate scope of DPG-BUTTON-CONTRACT-TABLE (D-29z1861)'}
if isinstance(sigs, list):
    if find(sigs, sig['id']) is None:
        sigs.append(sig)
elif isinstance(sigs, dict):
    sigs.setdefault('items', []).append(sig) if 'items' in sigs else sigs.__setitem__(sig['id'], sig)

# D-29z1862: round 513 = N3 cookie banner
f = find(of, 'SABA-Q-507-COOKIE-WEIGHT')
prefix_status(f, 'awaiting_user (D-29z1862): no answer in user-review/ at round-513 planning; default (equal weight, both secondary sm pill) ships in round 513 as a one-prop swap; EDPB Cookie Banner Taskforce report 2023-01-17 supports equal prominence (b-round-512/consult-product-designer.md); question stays open')

# D-29z1864: findings from N3 planning
for i, sev, t, ev, st in [
    ('B-R512-COOKIE-DISMISS-FOCUS-LOST', 'medium', 'Cookie banner: after Enter on Decline or Accept (or a tap on Close) the banner unmounts and focus falls to body; the next Tab starts at the page top (CZABA logo link). Pre-existing at HEAD cbc5709, unchanged by N3',
     'b-round-512/probe/head/n3.json and sketch/n3.json actions[*].focusAfter = BODY, firstTabAfter = "CZABA" at 1440/1280/375; product-designer consult (Medium, pre-existing)',
     'open (D-29z1864): scheduled round 514 (after N3; the same file); task names the focus target (L47) with product-designer'),
    ('B-R512-COOKIE-PILL-LOW-SEPARATION', 'low', 'Equal-weight secondary pills (bg rgb(29,26,23), border rgb(36,33,30)) barely separate from the 95 % black cookie banner (bg vs black 1.21:1); labels 13.94:1',
     'b-round-512/probe/sketch/n3.json contrast; consult-product-designer.md; sketch-review.md #6', 'deferred_low_polish (D-29z1864); joins the banner-root stage (A-R183-COOKIE-INLINE-GRADIENT) and the SABA-Q-507 note'),
    ('A-R512-TL-N3-5-DENYLIST-NARROW', 'low', 'N3-5 source scan denies bg-white/text-black/neutral-* only, not text-white, bg-black, border-white',
     'b-round-512/sketch-review.md #2', 'deferred_low_polish (D-29z1864); candidate for DPG-BUTTON-CONTRACT-TABLE'),
]:
    target = of if sev == 'medium' else dl
    if find(of, i) is None and find(dl, i) is None:
        target.append({'id': i, 'severity': sev, 'origin': 'pre-existing' if i != 'A-R512-TL-N3-5-DENYLIST-NARROW' else 'B spec', 'added': BY,
                       'title': t, 'evidence': ev, 'repro': 'node b-round-512/probe/n3-banner.mjs <GA4-env base> <dir>', 'status': st})
for i in ('A-R183-COOKIE-BUTTON-TYPE', 'A-R183-REVIEW-FBQ-BRANCH'):
    f = find(dl, i)
    if f is not None:
        f['status'] = ('scheduled round 513 (D-29z1864): closes on C round 513 PASS (' +
                       ('lint 174 -> 171, the three useButtonType hits leave with the raw buttons' if 'TYPE' in i else 'new row N3-6 exercises the fbq branch, mutants M11/M13') + ') | ' + str(f.get('status', '')))

# D-29z1863: second design-gate result (policy 2026-11-14) recorded (L42)
dpg2 = [
    ('DPG2-OFF-PALETTE', 'medium', 'Off-palette colours: pink hsl(340,85%,55%) app.css (artist section), blue hsl(220,…) shimmer app.css and free-downloads.tsx gradient with green hsla(140,…), parallel --premium-gold token in base/utilities.css',
     'K23 claims-513; policy "Second gate result (2026-11-14)"', 'open (D-29z1863): DPG-COLOR-CONSOLIDATE / DPG-DECORATIVE-PURGE scope (P1/P2); app/styles/** needs a root grant (global_forbidden_files)'),
    ('DPG2-LEGACY-BLUE-TOKENS', 'medium', '--color-blue-60/50/30 legacy tokens still in @theme (app.css)', 'K23', 'open (D-29z1863): DPG-DECORATIVE-PURGE; app/styles/** root grant'),
    ('DPG2-STUDIOMOCKUP-OFF-PALETTE', 'medium', 'Home StudioMockup.tsx uses bg-neutral-800, text-neutral-400, bg-red-500, bg-yellow-500 (off-palette)', 'K23 (3 lines)', 'open (D-29z1863): DPG-COLOR-CONSOLIDATE; also STORE-3 (F5 real crop)'),
    ('DPG2-NATIVE-SELECT-STORE', 'medium', 'Native <select> without a custom Select component in Store routes/components (hire-us, FilterBar, recordings SfxSceneBuilder/SfxSoundLibrary)', 'grep -rln "<select" app --include=*.tsx (B planning 512)', 'open (D-29z1863): DPG P1 after NONBRAND; Studio half stays SABA-B-12 stage 4'),
    ('DPG2-DOCS-TYPOGRAPHY-STALE', 'medium', 'DESIGN_SYSTEM.md typography still names Playfair Display/Inter; Saba decision 2026-11-14: Instrument Sans for everything', 'policy second gate list', 'open (D-29z1863): DPG-FONT-RESOLVE (input D-29z1707); docs grant in that round'),
]
for i, sev, t, ev, st in dpg2:
    if find(of, i) is None:
        of.append({'id': i, 'severity': sev, 'origin': 'pre-existing', 'added': BY, 'source': 'design gate 2 (root, 2026-11-14): design-philosopher 5.2/10, product-designer 5.0/10',
                   'title': t, 'evidence': ev, 'status': st})
if find(of, 'INFO-DPG2-FOOTER-CLAIM-REFUTED') is None:
    of.append({'id': 'INFO-DPG2-FOOTER-CLAIM-REFUTED', 'severity': 'info', 'origin': 'environment', 'added': BY,
               'title': 'Design gate 2 says Footer.tsx still uses <a href>; at HEAD cbc5709 Footer.tsx has 0 "<a " and every nav entry is <Link> (DPG-FOOTER-LINKS C-verified round 479)',
               'evidence': 'K23 claims-513 (grep -c "<a " = 0)', 'status': 'recorded (D-29z1863): answer to root in b-round-512.md "For root"; no task'})
f = find(of, 'SABA-Q-DPG-LEGACY-STUDIO-TEAL')
add_confirmed(f, 'design gate 2 (2026-11-14) lists StudioTrack.tsx l.155 teal again; still frozen legacy (D-29z1863)')
rq = {'id': 'ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD', 'added': BY, 'status': 'open',
      'request': 'The policy says root applied (2026-11-14) EntranceCover ENTRANCE_MIN_TOTAL_MS 1450->4000 / MAX 1900->5000 and DESIGN_TOKENS.md brass. At HEAD cbc5709: ENTRANCE_MIN_TOTAL_MS = 3500, MAX = 5000; .claude/primitives/DESIGN_TOKENS.md still lists brand #13D9CC (Teal); cloud/root-commits has no pending patch for either. Please land them as root commits (both paths are outside loop grants), or confirm 3500 stays. A root commit between planning and A that touches only these paths is accepted by the round-513 HEAD-drift rule.',
      'evidence': 'K23 claims-513'}
if find(b['root_requests_b'], rq['id']) is None:
    b['root_requests_b'].append(rq)
gate = b.get('design_philosophy_gate')
if isinstance(gate, dict):
    gate.setdefault('runs', []).append({'date': '2026-11-14', 'after': 'P0 + partial P1', 'design_philosopher': 5.2, 'product_designer': 5.0,
                                        'recorded': 'D-29z1863 (DPG2-* ids)'})

# queue + round bookkeeping
q = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'DPG-FIX')
q['status'] = ('in_progress (D-29z1862): round 512 N2 close-out C PASS (published cbc5709); round 513 = NONBRAND N3 cookie banner; round 514 = B-R512-COOKIE-DISMISS-FOCUS-LOST; '
               'REGRESSION on/after 2026-11-16; then N4-N9, PD-R498, DPG-BUTTON-CONTRACT-TABLE, rest of P1 incl. DPG2-* (D-29z1863), DP gate, P2 | ' + q['status'])
for r in b['rounds']:
    if r.get('round') == 512:
        r['status'] = 'C PASS (browserVerified true), gate 512 published cbc5709 (D-29z1860)'
b['rounds'].append({'round': 513, 'task': 'current-task.md', 'decision': 'D-29z1862', 'type': 'NONBRAND N3 cookie banner (Accept/Decline Button secondary sm pill, Close IconButton ghost sm)',
                    'status': 'dispatched', 'note': 'baseline HEAD cbc5709 clean; sketch b-round-512/sketch-513.patch.txt (sha cd995844); pins r513-tree-sha256.txt (1428), r513-pre-sha.txt, r513-post-sketch-sha.txt; claims b-round-512/claims-513.sh K1-K24; browser via a GA4-env dev server'})
b['current_task'] = ('Round 513: DPG-BUTTON-CLEANUP-2-NONBRAND N3 cookie banner on HEAD cbc5709: git apply b-round-512/sketch-513.patch.txt (sha cd995844) - CookieConsent Decline/Accept -> Button secondary sm pill (equal weight, SABA-Q-507 default), Close -> IconButton ghost sm; rows N3-1..N3-6; doc 331. '
                     'C verifies on a second dev server with VITE_GA4_MEASUREMENT_ID set (own Vite cacheDir): 1440/1280/375 rest/hover/keyboard/press/actions/consent storage, /studio-lab no banner, protection.')
b['decisions_log_b'] += [
    {'id': 'D-29z1860', 'date': DATE, 'by': BY, 'decision': 'Round 512 accepted from c-round-512.json (PASS, browserVerified/realVerified true, 0 bugs) and gate 512 (published cbc5709). NONBRAND N2 (PurchaseHeader) is complete for rounds 511+512; C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES closed. DPG-BUTTON-CLEANUP-2-NONBRAND (in_progress) had been archived by the optimizer; restored into open_findings, confirmedBy on ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN.'},
    {'id': 'D-29z1861', 'date': DATE, 'by': BY, 'decision': "A round 512 code-reviewer Lows (A-R512-REVIEW-DOC330-HEAD-WORDING, -BUTTONMD-CLAIM, -DECISION-TREE-UNLOCK) -> deferred_low_polish (origin B spec: B's sketch text). Gate 512 review: suggestion 1 -> confirmedBy B-R510-BUSY-CURSOR-HIDDEN; 2 -> GATE512-L2-CARTBUTTON-SIZE-DRIFT (Low, deferred); 3 browser-checked in C 511 C2; 4 -> confirmedBy SIG-R501-SHARED-BUTTON-SCANNER; Architecture note -> SIG-R512-PURCHASEHEADER-SOURCE-SCAN-TESTS (signal, not scheduled). C's artifact gap -> INFO-C512-ARTIFACT-GAP; round-513 claims read only files that survive hand-over."},
    {'id': 'D-29z1862', 'date': DATE, 'by': BY, 'decision': 'Round 513 = NONBRAND N3 (cookie banner, 3 tags). No answer to SABA-Q-507-COOKIE-WEIGHT in user-review/, so the default already sent to Saba ships: Decline and Accept as Button secondary sm pill (equal weight, HEAD order), Close as IconButton ghost sm with X 16; the banner root, text, timer and handlers unchanged. product-designer approve (b-round-512/consult-product-designer.md, EDPB 2023 equal-prominence source); tech-lead sketch review approve (sketch-review.md, 6 Lows ruled). B byte sketch includes the tests (rows N3-1..N3-6); mutants M1-M13 red; N3-1/3/5 red on the HEAD product file. Browser via a second dev server with VITE_GA4_MEASUREMENT_ID (round-183 recipe).'},
    {'id': 'D-29z1863', 'date': DATE, 'by': BY, 'decision': 'Design gate 2 (policy 2026-11-14: DP 5.2, PD 5.0) recorded per L42: new ids DPG2-OFF-PALETTE, DPG2-LEGACY-BLUE-TOKENS, DPG2-STUDIOMOCKUP-OFF-PALETTE, DPG2-NATIVE-SELECT-STORE, DPG2-DOCS-TYPOGRAPHY-STALE (Medium, placed in DPG P1/P2 after NONBRAND); three-button-systems = DPG-BUTTON-CLEANUP (in progress); StudioTrack teal = SABA-Q-DPG-LEGACY-STUDIO-TEAL (confirmedBy). Footer <a href> refuted at HEAD (INFO-DPG2-FOOTER-CLAIM-REFUTED). Root-claimed EntranceCover 4000 ms and DESIGN_TOKENS.md brass are not at HEAD and not pending -> ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD. N3 still goes first: it continues the in-progress P1 item, and the DPG2 ids need app/styles/** (root grant) or a later P1 slot.'},
    {'id': 'D-29z1864', 'date': DATE, 'by': BY, 'decision': 'N3 planning findings: B-R512-COOKIE-DISMISS-FOCUS-LOST (Medium, pre-existing: focus to body after the banner unmounts, HEAD = sketch) -> round 514 with a named focus target (L47); B-R512-COOKIE-PILL-LOW-SEPARATION and A-R512-TL-N3-5-DENYLIST-NARROW (Low, deferred). A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH close on C round 513 PASS. Regression not due (regression-last 2026-11-13; next on/after 2026-11-16). No architecture checkpoint: N3 is one bounded stage; no structural risk accumulated on CookieConsent.'},
]
b['version'] = 519
b['updated'] = BY
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n')
print('backlog v519 written')
