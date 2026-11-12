import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = os.path.join(L, 'b-round-468/update-backlog-469.done')
if os.path.exists(done): sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-12 B round 468 -> 469 planning'
ev468 = ('c-round-468.json PASS (C1-C9, 0 bugs, browserVerified/realVerified true); gates/gate-round-468.json skipped "no real changes" '
         '(diagnosis round, store tree unchanged at 9ba13ac)')
b['version'] = b.get('version', 0) + 1
b['updated'] = '2026-11-12'
hit = []
for f in b['open_findings']:
    if not isinstance(f, dict): continue
    if f.get('id') == 'SABA-B-15':
        f['status'] = ('dispatched round 469 (D-29z1651): stage 2 fix = the 3 blur glows (ProductSection l.38-39, StudioShowcase l.75) -> radial gradients at '
                       "today's strength (product-designer band 0.8-1.3x, b-round-468/pd-ruling.md); stage 1 cause confirmed by C round 468 (D-29z1650); "
                       'after C PASS: "home cause fixed in cloud", closes only with TLM-R468-SABA-SCROLL-DEVICE | ' + str(f.get('status')))
        f['cause_d29z1650'] = ('three large filter:blur() glows; raster-bound in SwiftShader software raster (a-round-468/trace-summary.md); hiding or '
                               'gradient-swapping them removes both bands (a-round-468/bisect.md; C round 468 C2 / medians 0/0); B full-page probe on the tuned '
                               'sketch: / medians 1/1 to maxScroll 4121 vs HEAD 8/5 (b-round-468/scroll-sketch2-full.json)')
        hit.append(f['id'])
    if f.get('id') == 'TLM-R468-SABA-SCROLL-DEVICE':
        f['status'] = f['status'] + ' | question user-review/questions-round-468.md Q1 (D-29z1651), with the Lenis-feel options (a) keep default, (b) shorter duration, (c) lerp, (d) off (R-468-1, L44)'
        hit.append(f['id'])
sigs = b['architecture_signals']
sigs.append({'id': 'SIG-R469-UNMEASURED-BLURS', 'status': 'signal (D-29z1651): not scheduled',
  'note': ('A round 468 "For B": other large filter blurs. Measured: routes/gift-cards.tsx:254 (blur 120) gives 0 slow frames at HEAD (b-round-468/scroll-head-full.json /gift-cards); '
           'the whole / page below scrollY 2400 (NewsletterSection.tsx:28 blur 100, SpecialOffersSection.tsx:49-50 blur 80, keep-list) is 0-1 median on the tuned sketch '
           '(scroll-sketch2-full.json). Unmeasured: MobileWarning.tsx:117-118 (mobile only), StudioShowcase.tsx:118 reflection blur 40 (A s7: not needed). '
           'store-scroll-paint.test.ts SP1 allow-lists NewsletterSection 1 and SpecialOffersSection 2 with this id; a later restyle (STORE-2d/3) may swap them, keep-list ones with Saba'),
  'evidence': 'a-round-468/other-large-blurs.txt; b-round-468/full-summary.txt, sketch2-frames-summary.txt', 'added': by})
sigs.append({'id': 'SIG-R469-GLOW-PROMOTION-TRAP', 'status': 'signal (D-29z1651): ruled in round 469 as R-469-2',
  'note': 'promoting a filtered glow with will-change:transform made / 71/57 slow frames (A round 468 screen s5); no will-change / transform-gpu on large decorative glows',
  'evidence': 'a-round-468/bisect.md s5', 'added': by})
sigs.append({'id': 'INFO-R468-HERO-KENBURNS-INVALIDATION', 'status': 'info (D-29z1651): not a measured cause',
  'note': 'hero Ken Burns motion.img mutates inline style every frame (260x per wheel sequence); s1 (transform none) 5/4 vs HEAD 6/5, not a cause in cloud',
  'evidence': 'a-round-468/invalidations.txt, screens/s1-hero-img-static.json', 'added': by})
for rr in b['regression_rounds']:
    if rr.get('id') == 'REGRESSION-2026-11-13':
        rr['status'] = ('moved again (D-29z1651): round 469 = SABA-B-15 stage 2 (planned 2026-11-12, before the due date); REGRESSION runs at the first planning '
                        'dated on or after 2026-11-13 | ' + rr['status'])
        for sa in rr['scope_additions']:
            if sa.get('id') == 'REG-SCROLL-HOME-FRAMES':
                sa['what_update_d29z1651'] = ('after round 469 C PASS: / median <= 2 at both viewports becomes an assert; add the full-page variant '
                                              'b-round-468/store-scroll-probe-full.cjs (PATHS=/,/gift-cards; / median <= 2, finalY === maxScroll, moving >= 100) '
                                              'and the look band (b-round-468/look-probe2.cjs + look-profile.cjs, ratioToHead 0.8-1.3 with head = a 9ba13ac build, the pre-fix look)')
dl = b['decisions_log_b']
dl.append({'id': 'D-29z1650', 'date': '2026-11-12', 'by': by, 'decision': (f'Round 468 accepted: {ev468}. SABA-B-15 stage 1 cause confirmed in cloud: three large blur glows '
  '(ProductSection l.38-39, StudioShowcase l.75); A proposal a-round-468/proposal.diff.txt (gradient swap) gives / 0/0, eased scroll kept (C2/C3). '
  'A "For B" list recorded as signals SIG-R469-UNMEASURED-BLURS, SIG-R469-GLOW-PROMOTION-TRAP, INFO-R468-HERO-KENBURNS-INVALIDATION (not tasks). '
  'No new C bug; no Low to defer.')})
dl.append({'id': 'D-29z1651', 'date': '2026-11-12', 'by': by, 'decision': ('Round 469 = SABA-B-15 stage 2 (fix). product-designer ruled the proposal look 2.4-3.1x too strong '
  "(b-round-468/pd-ruling.md); B tuned sketch b-round-468/sketch-469.diff.txt (opacity stops only) measures ratioToHead 1.09-1.21, frozen / 0/0, full-page / 1/1 to maxScroll, "
  'SP1-SP3 green and red on HEAD files. Grants: ProductSection.tsx l.38-39, StudioShowcase.tsx l.75, store-scroll-paint.test.ts (new), doc 305 (new). Rulings R-469-1 band, '
  'R-469-2 no promotion. B changed two consult rows from assert to record/relative (peak confounded by card backdrop-blur; edge jump <= HEAD + 1 level) with reasons in pd-ruling.md. '
  'SABA-B-15 does not close in round 469 (/free-downloads not reproduced; software raster) - question user-review/questions-round-468.md. Regression not due (2026-11-13 > 2026-11-12).')})
for r in b['rounds']:
    if r.get('round') == 468: r['status'] = 'done (D-29z1650): C PASS (diagnosis, no store change); gate skipped no real changes'
b['rounds'].append({'round': 469, 'task': 'current-task.md', 'decision': 'D-29z1651', 'type': 'SABA-B-15 stage 2: home blur glows -> radial gradients at today\'s strength (+ guard test + doc 305)', 'status': 'dispatched',
  'note': 'baseline 9ba13ac clean; grants app/components/home/ProductSection.tsx (l.38-39), app/components/home/StudioShowcase.tsx (l.75), app/lib/__tests__/store-scroll-paint.test.ts (new), docs/implementation/2026/quarter-IV/305-saba-b-15-home-scroll-glows.md (new); sketch b-round-468/sketch-469.diff.txt; claims b-round-468/claims-469.sh'})
q = {e['id']: e for e in b['post_current_stage_queue']}
sr = q['STORE-REDESIGN']
sr['status'] = ('in_progress (D-29z1651): round 468 SABA-B-15 stage 1 C PASS (cause: 3 home blur glows); round 469 = SABA-B-15 stage 2 fix; '
                'REGRESSION-2026-11-13 at the first planning on/after 2026-11-13; then STORE-2c .. STORE-5 | ' + sr['status'])
b['current_task'] = 'Round 469: SABA-B-15 stage 2 - home blur glows -> radial gradients at today\'s strength (current-task.md, D-29z1651)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('version', b['version'], 'updated', hit)
