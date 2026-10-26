import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
ADDED = "2026-10-26 B round 185 -> 186 planning (D-29z151)"
b['updated'] = "2026-10-26 (B round 185 -> 186 planning, D-29z151)"
b['current_task'] = ("current-task.md (round 186: D-29z151 - STORE-1a three store bugs: C-R185-02 inactive product direct URL -> 404 (products.$handle loader, strict isActive===false), "
  "product meta description from product.description (<=160, factual fallback '{title} — {type} by CZABA.'), C-R185-01 SpecialOffers Gift Cards image unsplash -> /images/gift-card.png lazy; "
  "new T1 app/lib/__tests__/product-handle-route.test.tsx + doc 153; baseline HEAD 4a73ced (gate 185 published), 1011 tracked, grants 2, new store 2, frozen 1009)")
for r in b['rounds']:
    if r.get('round') == 185:
        r['status'] = 'c_pass_published'
        r['result'] = ("C PASS (c-round-185.json: browserVerified=true, realVerified=true, 11 rows passed; PX-NET-185 failed only on pre-existing frozen SpecialOffersSection.tsx:15 unsplash = C-R185-01 Low; "
                       "C-R185-02 Low inactive product sellable; blocked: real backend logic, dev-server stdout); gate 185 published 4a73ced on both remotes (doc 152 only)")
        r['closed'] = ADDED
b['rounds'].append({"round": 186, "task": "current-task.md", "decision": "D-29z151", "status": "dispatched",
  "items": ["STORE-1a K1 C-R185-02 inactive product -> 404", "STORE-1a K2 product meta description from data", "STORE-1a K3 C-R185-01 SpecialOffers local gift-card.png", "T1 product-handle-route.test.tsx", "doc 153"],
  "note": "baseline HEAD 4a73ced (gate 185 published, clean, 1011 tracked); grants b-round-185-r186-grants.txt (2: app/routes/products.$handle.tsx, app/components/home/SpecialOffersSection.tsx); new b-round-185-r186-new-files.txt (store 2); frozen 1009 (b-round-185-r186-tree-sha256.txt OK); start copies b-round-185/r186-granted-start/",
  "added": ADDED})
q = {e['id']: e for e in b['post_current_stage_queue']}
s = q['STORE-REDESIGN']
s['status'] = "in_progress: STORE-0 done (round 185 C PASS browserVerified, 4a73ced); STORE-1a = round 186 (D-29z151); STORE-1b/1c/1d and STORE-2..5 not_started (direction A decided 2026-10-25)"
for st in s['stages']:
    if st['id'] == 'STORE-0':
        st['status'] = 'done (round 185 C PASS: browserVerified=true, realVerified=true, 11 rows; published 4a73ced; mock-api lives in the loop folder, not in the store)'
    if st['id'] == 'STORE-1':
        st['status'] = 'in_progress: split 1a-1d (D-29z151); 1a = round 186'
        st['split_d29z151'] = {
          "STORE-1a": "round 186: C-R185-02 inactive product 404 (R52), meta description from data (R54), C-R185-01 SpecialOffers local gift-card.png (R53)",
          "STORE-1b": "AudioPlayer progress/volume fill var(--color-primary) undefined in app/ (AudioPlayer.tsx l.127/189; whole track invisible) -> var(--color-brand); AudioPreviewButton isClient SSR/CSR label flip (l.14-44) -> one markup + renderToStaticMarkup vs first-render test",
          "STORE-1c": "D15 header (Collections, Studio, About, Sign in + kept Free Samples; Gift Cards and Hire Us to footer; 'Studio Lab - Demo' -> 'Studio'; plain wordmark no gradient) + double h1 (Header.tsx l.53 <h1>CZABA</h1> + hero h1) + footer 'Czaba Music' (Footer.tsx l.74); ableton-export.ts 'Czaba Music Store' is Studio export metadata, out of scope",
          "STORE-1d": "D10 entrance loader <=1.2 s, skippable, once per session, off under prefers-reduced-motion",
          "why": "workflow rule: one feature or at most three tightly related bugs per round; nothing dropped",
          "added": ADDED}
s['store1a_plan_d29z151'] = {
  "round": 186,
  "b_check": "B read at 4a73ced: products.$handle loader l.39-58 never checks isActive (_index l.50-67 and store l.86-117 filter it); meta l.16 fixed template ignores product.description (client.ts l.74 optional), same string to og/twitter; SpecialOffersSection.tsx l.15 unsplash photo; public/images/gift-card.png exists (1024x1024 PNG, 1.1 MB, unreferenced, viewed by B); ArtistBioSection.tsx:12 unsplash but imported by no route; mapProductType returns Music/Presets/Sound Effects",
  "rulings": {"R52": "inactive product direct URL -> 404 (same Response as API 404), strict isActive===false only; smallest honest behaviour, lists already hide it; real backend behaviour unknown -> BACKEND-ONLY-EVIDENCE (vetoable)",
              "R53": "keep-listed SpecialOffers: decorative photo -> local /images/gift-card.png with loading=lazy decoding=async; text/link/layout/behaviour unchanged; restyle stays STORE-2 (vetoable)",
              "R54": "meta fallback only states data: '{title} — {mapProductType} by CZABA.'; no quality or licence claims (vetoable)"},
  "c_rows": ["INACTIVE-186", "META-186", "PX-NET-186", "OFFERS-VIS-186", "STORE-AFTER-186 (home LCP<=2.5 s, CLS<0.1 now pass/fail)", "PREVIEW-186", "G186-3 (mock-backed)", "STUDIO-RV-186", "SCOPE-186", "T-RUN-186", "AN-REVIEW-186", "PX-NET/REG-HYD"],
  "ableton": "not applicable (store pages)",
  "added": ADDED}
s['c_expectation_reset_d29z151'] = "from round 186: Studio cart-noise console errors = 0 (mock answers the cart); fake-Bearer studio-token row = mock-backed 403 (not real-backend evidence; BACKEND-ONLY-EVIDENCE stays open)"
b['open_findings'] += [
  {"id": "C-R185-01", "severity": "low", "status": "scheduled_round_186 (STORE-1a K3)",
   "title": "home / loads images.unsplash.com from SpecialOffersSection.tsx:15 (Gift Cards background photo)",
   "evidence": "c-round-185/out/store-{1440,1280,375}-1.json ev.foreign (page=home)", "repro": "start mock; fresh context; / ; network",
   "b_ruling": "fixed now (round owns code, cost low; 2026-10-23 rule allows) with local /images/gift-card.png, R53", "added": ADDED},
  {"id": "C-R185-02", "severity": "low", "status": "scheduled_round_186 (STORE-1a K1)",
   "title": "inactive product (isActive:false) opens by direct URL with 200, TOTAL PRICE $0.00 and live Add to Cart / Buy Now",
   "evidence": "c-round-185/shots/store-before/{1440,1280,375}-product-archived.png", "repro": "mock; /products/archived-rain",
   "b_ruling": "fixed now: loader 404 on strict isActive===false (R52); real-backend inactive-handle behaviour stays BACKEND-ONLY-EVIDENCE", "added": ADDED},
  {"id": "C-R185-I4-I5", "severity": "info", "status": "info",
   "title": "I4: AudioPreviewButton hydration mismatch not seen in round-185 sessions (layout-shift fix stays STORE-1b); I5: mock raw clientError 404 has no CORS headers, unreachable from the store",
   "evidence": "c-round-185.json info", "b_ruling": "no task", "added": ADDED},
  {"id": "B-R185-ARTISTBIO-UNSPLASH", "severity": "info", "status": "info",
   "title": "ArtistBioSection.tsx:12 has an unsplash URL but no route imports the component; mockProductDetail.ts and studio.$productId.tsx:177 also hold unsplash URLs (the latter protected)",
   "evidence": "grep at 4a73ced", "b_ruling": "not rendered on checked pages; PX-NET rows catch it if it becomes reachable; studio.$productId.tsx is protected (SRW-21 deferred_user)", "added": ADDED},
  {"id": "B-R185-OTHER-META-TEMPLATES", "severity": "info", "status": "signal",
   "title": "store.tsx and free-downloads.tsx meta contain similar generic marketing phrasing ('Professional ... pack' / 'creative freedom')",
   "evidence": "grep at 4a73ced", "b_ruling": "spec names only the product meta; candidate for STORE-5 copy/docs pass, not scheduled", "added": ADDED}]
b['deferred_low_polish'] += [
  {"id": "C-R185-I2", "severity": "low", "status": "deferred_low_polish", "title": "/store?category=SFX shows only SFX but the 'All' chip stays highlighted",
   "evidence": "c-round-185/shots/store-before/1440-store-sfx.png", "repro": "mock; /store?category=SFX", "owner_note": "store.tsx; pick up in STORE-2/STORE-4 if that round owns store.tsx and it is cheap (C reported as info; B classifies Low)", "added": ADDED},
  {"id": "C-R185-I3", "severity": "low", "status": "deferred_low_polish", "title": "fixed bottom mini-player covers product page content after Play",
   "evidence": "c-round-185/shots/store-before/1280-product-middle-east.png", "repro": "mock; /products/middle-east; Play preview; scroll to bottom", "owner_note": "AudioPlayer / layout padding; pick up in STORE-1b or STORE-4 if owned cheaply (C reported as info; B classifies Low)", "added": ADDED}]
b['architecture_signals'].append({"round": 185, "note": "A reviewer (mock files) and gate-185 reviewer (doc 152): Architecture note 'none'. No signal added. b-round-183-checkpoint-request.md still unanswered, fallback (c); next checkpoint point = STORE-REDESIGN exit.", "added": ADDED})
rr = b['regression_rounds'][-1]
rr['round'] = "expected 187 (first planning on/after 2026-10-27; rounds 184-186 were planned 2026-10-26)"
rr.setdefault('scope_additions', []).extend([
  "STORE-0 (round 185 C PASS, 4a73ced): store smoke against the mock (/, /store, /products/middle-east render fixture data; studio-token fake Bearer 403 mock-backed); Studio console 0 cart errors",
  "STORE-1a (if round 186 C PASS): /products/archived-rain 404; product meta from data; / 0 unsplash requests"])
rr['added_d29z151'] = ADDED
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
