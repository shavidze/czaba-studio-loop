import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
ADDED = "2026-10-26 B round 186 -> 187 planning (D-29z152)"
b['updated'] = "2026-10-26 (B round 186 -> 187 planning, D-29z152)"
b['current_task'] = ("current-task.md (round 187: D-29z152 - STORE-1b: K1 AudioPlayer progress/volume inline gradient var(--color-primary) (defined nowhere) -> var(--color-brand); "
  "K2 AudioPreviewButton remove isClient post-mount flip -> one interactive markup on server and client, type=button, no 'Preview' label (R55); K3 doc 153 status -> Completed; "
  "new T1 app/lib/__tests__/audio-preview-player.test.tsx + doc 154; baseline HEAD cc207d6 (gate 186 published), 1013 tracked, grants 3, new store 2, frozen 1010)")
for r in b['rounds']:
    if r.get('round') == 186:
        r['status'] = 'c_pass_published'
        r['result'] = ("C PASS (c-round-186.json: browserVerified=true, realVerified=true, 12 rows passed, 0 failed, 0 blocked); new Lows C-R186-01 (variant-less active SFX shows $0.00, pre-existing) and C-R186-02 (Gift Cards paragraph contrast 2.22-2.59:1 over gold lettering); "
                       "gate 186 published cc207d6 on both remotes (2 grants + T1 + doc 153; doc 153 status left 'In Progress' -> fixed in round 187 K3)")
        r['closed'] = ADDED
b['rounds'].append({"round": 187, "task": "current-task.md", "decision": "D-29z152", "status": "dispatched",
  "items": ["STORE-1b K1 AudioPlayer fill var(--color-brand)", "STORE-1b K2 AudioPreviewButton one markup (R55)", "K3 doc 153 status Completed", "T1 audio-preview-player.test.tsx", "doc 154"],
  "note": "baseline HEAD cc207d6 (gate 186 published, clean, 1013 tracked); grants b-round-186-r187-grants.txt (3: AudioPlayer.tsx, AudioPreviewButton.tsx, doc 153); new b-round-186-r187-new-files.txt (store 2); frozen 1010 (b-round-186-r187-tree-sha256.txt OK); start copies b-round-186/r187-granted-start/",
  "added": ADDED})
q = {e['id']: e for e in b['post_current_stage_queue']}
s = q['STORE-REDESIGN']
s['status'] = "in_progress: STORE-0 done (185, 4a73ced); STORE-1a done (186 C PASS browserVerified, cc207d6); STORE-1b = round 187 (D-29z152); STORE-1c/1d and STORE-2..5 not_started (direction A decided 2026-10-25)"
for st in s['stages']:
    if st['id'] == 'STORE-1':
        st['status'] = 'in_progress: split 1a-1d (D-29z151); 1a done (round 186 C PASS browserVerified, published cc207d6); 1b = round 187 (D-29z152); 1c, 1d not_started'
s['store1a_result'] = {"round": 186, "status": "done", "evidence": "c-round-186.md / c-round-186.json PASS, browserVerified=true, realVerified=true; gates/gate-round-186.json published cc207d6", "added": ADDED}
s['store1b_plan_d29z152'] = {
  "round": 187,
  "b_check": "B read at cc207d6: AudioPlayer.tsx l.127/l.189 inline gradients use var(--color-primary), defined nowhere in app/ (only hits); --color-brand in app.css @theme l.64 (hsl(175,85%,46%), rgb 19,217,204); AudioPreviewButton.tsx l.14-44 isClient: server and first client render agree (no React mismatch), post-mount render drops the overlay 'Preview' span and attaches onClick (dead control until mount); AudioContext initial state is a deterministic literal; callers ProductSidebar:45, ProductCard:129/133 (overlay only); AudioPlayer mounted in root.tsx:154, null without a track",
  "rulings": {"R55": "single markup = the interactive post-mount markup (icon only, aria-label 'Play preview', type=button), no visible 'Preview' label; rejected alternative: keep the label in every state (would change the UI users actually use after hydration; label only ever existed in the dead pre-mount markup; Pause/Loading never had it); .audio-preview-overlay-text becomes unused (app.css frozen, signal for STORE-2/5) (vetoable)"},
  "test_note": "B1 compares renderToStaticMarkup with the DOM AFTER effects flush (a first-render comparison passes on the start code and proves nothing); red proof required for B1, B4 DOM, P1",
  "c_rows": ["FILL-187", "FLIP-187 (JS-off vs hydrated outerHTML + boxes)", "PREVIEW-187", "STORE-AFTER-187 (scrolled baselines for /)", "G187-3 (mock-backed)", "STUDIO-RV-187", "SCOPE-187", "T-RUN-187", "AN-REVIEW-187", "PX-NET/REG-HYD"],
  "not_included": {"C-R186-01": "purchase-path semantics with unknown backend contract (product-utils l.85 returns [] for variant-less SFX on purpose); not cheap, not related to the player; owner STORE-4",
                   "C-R186-02": "overlay owned by STORE-2",
                   "C-R185-I3": "needs page padding in frozen root.tsx/layout; stays deferred"},
  "ableton": "not applicable (store pages)",
  "added": ADDED}
for f in b['open_findings']:
    if f.get('id') == 'C-R185-01':
        f['status'] = 'resolved_round_186'; f['resolution'] = "SpecialOffers Gift Cards img -> /images/gift-card.png lazy/async; C PX-NET-186 PASS (0 remote hosts except Google Fonts), published cc207d6"; f['resolved'] = ADDED
    if f.get('id') == 'C-R185-02':
        f['status'] = 'resolved_round_186'; f['resolution'] = "loader 404 on strict isActive===false; C INACTIVE-186 PASS at 3 viewports (mock answered 200, store refused), published cc207d6; real-backend inactive-handle answer stays BACKEND-ONLY-EVIDENCE"; f['resolved'] = ADDED
b['open_findings'] += [
  {"id": "C-R186-01", "severity": "low", "status": "open_low_conditional",
   "title": "active SFX product without variants (/products/door-slams) shows TOTAL PRICE $0.00 with live Add to Cart and Buy Now (list card shows standardPrice $9)",
   "evidence": "c-round-186/shots/store-after/1280-product-door-slams.png; c-round-186/out/store-{1440,1280,375}-1.json pages.product-door-slams",
   "repro": "start mock; open /products/door-slams at any viewport",
   "cause": "ProductDetailPage.tsx l.67-69 selectedVersion?.price ?? 0; product-utils.ts createDisplayVersions l.85 returns [] for SFX without variants (SFX sold via /recordings/{id})",
   "upgrade_rule": "Medium (purchase path) if the real /api/products/handle returns an active product without variants -> BACKEND-ONLY-EVIDENCE",
   "owner": "STORE-4 (product/listening page); in the next regression store smoke",
   "b_ruling": "not folded into STORE-1b: a fix changes the shown price or the productVariantId sent to addToCart, i.e. purchase-path semantics with an unknown backend contract; not cheap and not related to the player",
   "added": ADDED},
  {"id": "GATE186-REVIEW-SIGNALS", "severity": "info", "status": "signal",
   "title": "gate-186 reviewer: (1) doc 153 status stale -> scheduled round 187 K3; (2) sitemap lists inactive products -> GATE186-SITEMAP-INACTIVE deferred Low; (3) cart.tsx:59/89/158, studio.$productId.tsx:520, AudioPlayer.tsx:36 link to product pages that 404 once inactive (info, 404 better than $0.00 page); (4) emoji surrogate split on the no-space meta hard-cut (nit); Architecture note: keep the meta helper in the route until a second route needs it; alternative 410 page only if real backend/SEO need",
   "evidence": "gates/round-186/review.md", "b_ruling": "signals recorded, not scheduled except doc 153 (two lines, rides with STORE-1b)", "added": ADDED},
  {"id": "B-R186-PLAYER-SIGNALS", "severity": "info", "status": "signal",
   "title": "AudioPlayer inline rgba(255,255,255,0.1) unfilled-track colour (Tailwind-first) and .audio-preview-overlay-text unused after R55 (app.css frozen)",
   "evidence": "AudioPlayer.tsx l.127/189; app.css l.542", "b_ruling": "STORE-2/STORE-5 cleanup candidates; not scheduled", "added": ADDED}]
b['deferred_low_polish'] += [
  {"id": "C-R186-02", "severity": "low", "status": "deferred_low_polish",
   "title": "SpecialOffers Gift Cards paragraph (text-muted rgb(129,136,152)) contrast falls to 2.59:1 (1440/1280) and 2.22:1 (375) where it crosses the gold CZABA lettering of gift-card.png; 3.31% / 1.84% of the box below 4.5:1",
   "evidence": "c-round-186/shots/store-after/{W}-offers.png, {W}-bg-p.png; c-round-186/out/contrast186.json",
   "repro": "open /; scroll to Special Offers; wait for the image; measure paragraph text vs background",
   "owner_note": "STORE-2 owns the overlay/restyle; fix there if cheap, else in the final polish pass", "added": ADDED},
  {"id": "GATE186-SITEMAP-INACTIVE", "severity": "low", "status": "deferred_low_polish",
   "title": "sitemap[.]xml.tsx l.24 lists every product without an isActive filter, so inactive products appear as URLs that now 404",
   "evidence": "gates/round-186/review.md suggestion 2", "repro": "GET /sitemap.xml with the mock (archived-rain listed)",
   "owner_note": "one-line filter + test (sitemap mock with an inactive product absent from output); candidate for STORE-5 (SEO/docs) or the polish pass", "added": ADDED}]
b['architecture_signals'].append({"round": 186, "note": "A reviewer and gate-186 reviewer: weak signal 1 (meta helper in route), verdict keep; no new structural risk. b-round-183-checkpoint-request.md still unanswered, fallback (c); next checkpoint point = STORE-REDESIGN exit.", "added": ADDED})
rr = b['regression_rounds'][-1]
rr['round'] = "expected 188 (first planning on/after 2026-10-27; rounds 184-187 were planned 2026-10-26)"
rr.setdefault('scope_additions', []).extend([
  "STORE-1a (round 186 C PASS, cc207d6): /products/archived-rain 404; product meta from data; / 0 unsplash; /products/door-slams price observation (C-R186-01 upgrade rule)",
  "STORE-1b (if round 187 C PASS): player fill teal; preview button JS-off vs hydrated markup identical",
  "Home before/after baselines: use c-round-186/shots/store-after/*-scrolled.png (round-185 home shots are blank below the hero)"])
rr['added_d29z152'] = ADDED
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
