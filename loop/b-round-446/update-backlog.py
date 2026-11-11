"""B round 446 -> 447 planning backlog update. Idempotent (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-446'
DONE = f'{B}/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 446 -> 447 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = {e.get('id'): e for e in b['open_findings']}
dl = b['deferred_low_polish']
di = {e.get('id'): e for e in dl}
sig = {e.get('id'): e for e in b['architecture_signals']}
C446 = 'C round 446 PASS (c-round-446.json, browserVerified/realVerified true, C1-C14 PASS, 1 Low C-R446-01), gate 446 published 5df7717 (review COMMIT OK 9/10, verify green)'

# D-29z1586: round 446 accepted; STORE-2b-1 done; findings
dl.append({'id': 'A-R446-REVIEW-L1', 'severity': 'low', 'origin': 'B sketch (sketch-446 v3 applied unchanged by A; found by A code-reviewer, confirmed in browser by C)',
           'status': 'deferred_low_polish (D-29z1586): ruling on C-R446-01 - round 446 change 3 specified the error reset at hide time only; an in-flight submit is a spec gap, Low (rare, no data loss); attach to the next stage that touches app/hooks/useLeadMagnet.ts (store polish pass)',
           'title': 'A LeadMagnet submit still in flight when a route hide happens fails afterwards and re-sets error; the next open shows the stale message on the email step',
           'evidence': 'a-round-446.md code-reviewer finding 1; c-round-446/inflight.json (emailStale true), c-round-446/shots/inflight-1440.png',
           'repro': 'c-round-446/tools/inflight.cjs (acceptance row for the fix); useLeadMagnet.ts submitEmail catch ~l.233 at 5df7717',
           'fix': 'request id or excluded/hidden ref checked before setError (and before setCurrentStep on success)', 'added': by,
           'confirmedBy': ['C-R446-01 (c-round-446.json, browser probe)']})
t3 = di.get('TL-R446-L3-LOCAL-STATE')
if t3 is not None:
    t3.setdefault('related', []).append('A-R446-REVIEW-L1 (same hook-hide lifecycle; fix together in the polish pass)')
dl.append({'id': 'A-R446-REVIEW-L3-TEST-HYGIENE', 'severity': 'low', 'origin': 'B sketch (found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1586): test-only',
           'title': 'store-lead-magnet-routes: scrollHeight/innerHeight overrides not restored; storedState() unvalidated JSON.parse; SL2 does not assert the lock was applied before unlock; dialog mock lacks isRouteExcluded (works via !undefined)',
           'evidence': 'a-round-446.md code-reviewer findings 2 and 3', 'repro': 'app/lib/__tests__/store-lead-magnet-routes.test.tsx l.82-88, l.112-115, l.337-346; store-lead-magnet-dialog.test.tsx:35-40 at 5df7717',
           'fix': 'restore overrides in afterEach; validate parse; assert lock first; isRouteExcluded: false in the dialog mock', 'added': by})
dl.append({'id': 'GATE446-L1-SCROLLLOCK-REF-IN-RENDER', 'severity': 'low', 'origin': 'B sketch (found by gate reviewer)',
           'status': 'deferred_low_polish (D-29z1586): works and is tested; concurrent-rendering hygiene',
           'title': 'useScrollLock writes restoreScrollOnUnlock ref during render; relies on render before cleanup',
           'evidence': 'gates/round-446/review.md finding 1', 'repro': 'app/hooks/useScrollLock.ts:22-23 at 5df7717',
           'fix': 'assign in a layout effect or pass the flag through effect deps', 'added': by})
dl.append({'id': 'GATE446-L2-STUDIO-UNMOUNT-SCROLL', 'severity': 'low', 'origin': 'pre-existing (found by gate reviewer)',
           'status': 'deferred_low_polish (D-29z1586): pre-existing; root.tsx is protected, fix must stay in the hook',
           'title': 'LeadMagnet popup open on / then navigating to /studio unmounts it with restore=true and scrolls to the old offset',
           'evidence': 'gates/round-446/review.md finding 2', 'repro': 'app/root.tsx:147-153 (unmount on /studio) at 5df7717',
           'fix': 'treat /studio like an excluded route for the restore flag', 'added': by})
dl.append({'id': 'GATE446-I1-ROUTER-CONTEXT', 'severity': 'info', 'origin': 'B sketch (found by gate reviewer)',
           'status': 'deferred_low_polish (D-29z1586): info; useLeadMagnet needs a Router context; routes test uses react-router-dom MemoryRouter while the hook imports from @remix-run/react (single instance assumed)',
           'evidence': 'gates/round-446/review.md findings 4 and 5', 'added': by})
s = sig.get('SIG-R446-LEADMAGNET-CAP-COMMENT')
if s is not None:
    s.setdefault('confirmedBy', []).append('gates/round-446/review.md finding 3')
b['architecture_signals'].append({'id': 'SIG-R446-OVERLAY-ROUTE-POLICY', 'added': by, 'decision': 'D-29z1586',
    'source': 'a-round-446.md Architecture note + gates/round-446/review.md Architecture note (both: keep)',
    'signal': 'route-exclusion list lives in useLeadMagnet; only if more exclusion rules or popups follow, a bounded task moves it into one shared module (e.g. lib/overlayRoutes), acceptance LMR1 green and useScrollLock signature unchanged',
    'status': 'signal only; not scheduled'})

q = {e['id']: e for e in b['post_current_stage_queue']}
sr = q['STORE-REDESIGN']
for st in sr['stages']:
    if st['id'] == 'STORE-2':
        sp = st.get('split_2b_d29z1583', {})
        sp['STORE-2b-1'] = 'done (D-29z1586): ' + C446 + ' | ' + sp.get('STORE-2b-1', '')
        # D-29z1587: 2b-2 split
        sp['STORE-2b-2'] = ('split (D-29z1587): full recount at 5df7717 = 44 hits in 14 TS/TSX files (regex in b-round-446/claims-447.sh; the 24/9 recount missed rgba(19,217,204) and hsl(175) forms). '
                            '2b-2a round 447: 23 hits in 9 reachable files (ProductCard, SpecialOffersSection, NewsletterSection, gift-cards, checkout.success, SpotlightLoader, StudioMockup, StemsPlayerModal, StemControl). '
                            '2b-2b next: 8 hits in e-mail HTML (email.server.ts 5, hire-us.tsx 3) with a rendered-HTML Chromium contrast row. '
                            'Dead (12 hits, Timeline.tsx 5 + CinemaCurtainLoader.tsx 7) -> LEGACY-DEAD-STORE-COMPONENTS; frozen (StudioTrack.tsx:155) -> legacy Studio removal with SRW-21. | ' + sp.get('STORE-2b-2', ''))
        sp['STORE-2b-2a'] = 'dispatched round 447 (D-29z1588)'
        sp['STORE-2b-2b'] = 'not_started: e-mail templates teal -> brass hex (tokens impossible in e-mail); render generated HTML in Chromium; contrast on #0a0a0a/#111/#1a1a1a'
        sp['STORE-2b-3-inventory-additions_d29z1587'] = ('non-teal TSX glow blobs: NewsletterSection.tsx "Background glow" (~l.26), gift-cards.tsx "Background glow" (~l.253), SpotlightLoader brand spotlight glows (~l.120, ~l.141) and white floor reflection blur (~l.160-176); '
                                                        'CSS classes hero-title-glow, text-glow, light-flicker-effect (18 teal computed hits on / at 5df7717, b-round-446/probe/teal-head-1440.json); slider-thumb-teal in app/styles/studio.css and pages/studio.css is legacy Studio (frozen, VideoPlayer.tsx)')
        sp['STORE-2c-2d-notes_d29z1587'] = 'product-designer (round 447 planning) spotted: SpotlightLoader font-bold vs 500-never-700; ProductCard scale-[1.02] and 500 ms transitions vs motion limits; StudioMockup mute bg-red-500 and window dots'
        st['split_2b_d29z1583'] = sp
        st['status'] = 'in_progress (D-29z1587): 2a done; 2b-1 done (round 446); 2b-2 split 2b-2a (round 447) / 2b-2b; 2b-3, 2b-4, 2c, 2d not_started | ' + st['status']
pd = q.get('PD-REVIEW-2026-10-31')
if pd is not None:
    pd['status'] = 'F4/Q3 done (D-29z1586): LeadMagnet route exclusion, ' + C446 + ' | ' + pd['status']
b['open_findings'].append({'id': 'LEGACY-DEAD-STORE-COMPONENTS', 'severity': 'info', 'origin': 'B inventory (round 447 planning)',
    'title': 'Store components with no importer outside barrels: app/components/audio/Timeline.tsx (0 importers), app/components/loading/CinemaCurtainLoader.tsx (0 users), app/components/loading/PianoLoadingAnimation.tsx (0 users); they hold 12 teal hits and orange',
    'status': 'scheduled (D-29z1587): remove in the next cleanup or ARCH-SPLIT round under Saba legacy removal policy 2026-11-10 (grep importers again first; barrels index.ts updated in the same round)',
    'evidence': 'b-round-446/claims-447-planning-output.txt K5-K7', 'added': by})
b['open_findings'].append({'id': 'SABA-Q-CHECKOUT-RIPPLE', 'severity': 'info', 'origin': 'B + product-designer (round 447 planning)',
    'title': 'The teal one-shot ripple ring around the /checkout/success check icon is removed in STORE-2b-2a (the check icon scale-in stays). Alternative for Saba: a brass ripple as a small celebratory beat',
    'status': 'awaiting_user (D-29z1587): default (removed) ships; asked once via feature-status.md', 'added': by})
dl.append({'id': 'PD-R447-STEMCONTROL-ARIA-PRESSED', 'severity': 'low', 'origin': 'pre-existing (product-designer, round 447 planning)',
           'status': 'deferred_low_polish (D-29z1587)', 'title': 'StemControl Solo toggle has no aria-pressed',
           'evidence': 'b-round-446/claims-447-planning-output.txt K17 (0)', 'repro': 'app/components/audio/StemControl.tsx:19 at 5df7717', 'fix': 'aria-pressed={isSoloed}', 'added': by})

for r in b['rounds']:
    if r.get('round') == 446:
        r['status'] = 'done (D-29z1586): C PASS browserVerified true, gate 446 published 5df7717'
b['rounds'].append({'round': 447, 'task': 'current-task.md', 'decision': 'D-29z1588', 'type': 'STORE-2b-2a (teal sweep, reachable Store screens: 23 hits / 9 files)', 'status': 'dispatched',
                    'note': 'baseline 5df7717 (gate 446 published); no B sketch (per-hit mapping table in task); claims b-round-446/claims-447.sh; grants b-round-446/grants-447.txt; HEAD probe b-round-446/probe/teal-head-1440.json'})
b['decisions_log_b'] += [
    {'id': 'D-29z1586', 'date': '2026-11-11', 'by': by,
     'decision': 'Round 446 accepted from C evidence: ' + C446 + '. STORE-2b-1 done (PD-REVIEW F4 / Saba Q3). C-R446-01 ruled: change 3 covered the hide-time reset only; the in-flight submit is a B-spec gap, Low, recorded as confirmedBy on A-R446-REVIEW-L1 (deferred_low_polish, attached to the next useLeadMagnet stage with c-round-446/tools/inflight.cjs as its row). A reviewer Lows 2-3 -> A-R446-REVIEW-L3-TEST-HYGIENE; gate findings 1, 2, 4-5 -> GATE446-L1, GATE446-L2, GATE446-I1; finding 3 confirmedBy on SIG-R446-LEADMAGNET-CAP-COMMENT; Architecture notes (keep) -> SIG-R446-OVERLAY-ROUTE-POLICY (signal only, no checkpoint request: one small hook, no accumulated structural risk).'},
    {'id': 'D-29z1587', 'date': '2026-11-11', 'by': by,
     'decision': 'STORE-2b-2 split after full recount at 5df7717 (44 hits / 14 files): 2b-2a reachable screens (23/9, round 447), 2b-2b e-mail HTML (8/2), dead components -> LEGACY-DEAD-STORE-COMPONENTS (scheduled cleanup, Saba legacy policy), StudioTrack.tsx frozen legacy (SRW-21 / legacy removal). product-designer per-hit rulings adopted: every glow removed, brass only on flat fills/strokes, Solo = foreground fill as in the real Studio, loader wordmark solid foreground; checkout ripple removed by default and asked once as SABA-Q-CHECKOUT-RIPPLE. Non-teal TSX glows and CSS glow classes added to 2b-3 inventory; type/motion notes to 2c/2d; StemControl aria-pressed -> PD-R447-STEMCONTROL-ARIA-PRESSED (deferred Low).'},
    {'id': 'D-29z1588', 'date': '2026-11-11', 'by': by,
     'decision': 'Dispatch round 447 = STORE-2b-2a on 5df7717: per-hit mapping table (no B sketch; rows that need B-measured numbers are thresholds or HEAD-recorded), new test store-teal-sweep (TS1-TS4, mutants M1-M5 run by A and re-run by C), doc 292; C rows C1-C15 at 1440/1280/375 with HEAD control on :5178, computed-style teal scan (B HEAD probe / 34, /gift-cards 1), hover states, loader, Studio showcase contrast, checkout ripple, stems modal, keep-list text identity, LCP/CLS, Studio + auth smoke.'},
]
b['current_task'] = 'Round 447: STORE-2b-2a (hardcoded teal leaves the reachable Store screens; 23 hits / 9 files) on 5df7717 (current-task.md)'
b['advisor_used_by_B'] = 'round 446 -> 447 planning: advisor available and consulted after orientation and before hand-off'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
