import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
ADDED = "2026-10-26 B round 187 -> 188 planning (D-29z153)"
b['version'] = b.get('version', 0) + 1
b['updated'] = "2026-10-26 (B round 187 -> 188 planning, D-29z153)"
b['current_task'] = ("current-task.md (round 188: D-29z153 - STORE-1c: K1/K2 header nav desktop+mobile = Collections /store, Studio /studio-lab, Free Samples /free-downloads, About /about (Gift Cards, Hire Us, Demo badge removed from header); "
  "K3 wordmark <h1 text-glow> -> <span block text-foreground> (one h1 per page); K4 footer (c) APP_NAME; K5 e2e/navigation.spec.ts navLinks; K6 doc 154 status Completed; "
  "new T1 app/lib/__tests__/store-header-footer.test.tsx + doc 155; baseline HEAD cb24362 (gate 187 published), 1015 tracked, grants 4, new store 2, frozen 1011)")
for r in b['rounds']:
    if r.get('round') == 187:
        r['status'] = 'c_pass_published'
        r['result'] = ("C PASS (c-round-187.json: browserVerified=true, realVerified=true, 11 rows passed, 0 failed, 0 blocked, 0 bugs; info C-R187-I1..I4; task-text correction: /store renders 0 preview buttons, card variant verified on /); "
                       "gate 187 published cb24362 on both remotes (3 grants + T1 + doc 154; doc 154 status left 'In Progress' -> fixed in round 188 K6)")
        r['closed'] = ADDED
b['rounds'].append({"round": 188, "task": "current-task.md", "decision": "D-29z153", "status": "dispatched",
  "items": ["STORE-1c K1/K2 D15 header nav (desktop+mobile)", "K3 wordmark span, one h1 per page", "K4 footer APP_NAME", "K5 e2e navigation.spec navLinks", "K6 doc 154 status", "T1 store-header-footer.test.tsx", "doc 155"],
  "note": "baseline HEAD cb24362 (gate 187 published, clean, 1015 tracked); grants b-round-187-r188-grants.txt (4: Header.tsx, Footer.tsx, e2e/navigation.spec.ts, doc 154); new b-round-187-r188-new-files.txt (store 2); frozen 1011 (b-round-187-r188-tree-sha256.txt OK from store root); start copies b-round-187/r188-granted-start/",
  "added": ADDED})
q = {e['id']: e for e in b['post_current_stage_queue']}
s = q['STORE-REDESIGN']
s['status'] = "in_progress: STORE-0 done (185, 4a73ced); STORE-1a done (186, cc207d6); STORE-1b done (187 C PASS browserVerified, cb24362); STORE-1c = round 188 (D-29z153); STORE-1d and STORE-2..5 not_started (direction A decided 2026-10-25)"
for st in s['stages']:
    if st['id'] == 'STORE-1':
        st['status'] = 'in_progress: split 1a-1d (D-29z151); 1a done (186, cc207d6); 1b done (187 C PASS browserVerified, cb24362); 1c = round 188 (D-29z153); 1d not_started'
        sp = st.get('split_d29z151', {})
        sp['STORE-1d_acceptance_addition_d29z153'] = ("C-R187-I1: the entrance loader overlay (fixed inset-0 z-50, SpotlightLoader/CinemaCurtainLoader) must not block the / card Play control (hover/click must reach the button; elementFromPoint hits the button within <=1.2 s or immediately after skip); "
            "also: CinemaCurtainLoader renders an h1 while up -> at most one h1 on / at any time (H1-188 info). Harness: wait for loader unmount + hit-test before clicking on /")
s['store1b_result'] = {"round": 187, "status": "done", "evidence": "c-round-187.md / c-round-187.json PASS, browserVerified=true, realVerified=true, 11 rows; gates/gate-round-187.json published cb24362", "added": ADDED}
s['store1c_plan_d29z153'] = {
  "round": 188,
  "b_check": "B read at cb24362: Header.tsx l.52-54 <h1 class text-glow>CZABA</h1> (app.css:1132 .text-glow = --gradient-text clip); every store route has its own h1 (home HeroSection.tsx:159) -> two h1 per page; Header hidden on /studio* (root.tsx:137,144); desktop nav l.57-87 and mobile l.175-225: Store, Gift Cards, Free Samples, About, Hire Us, Studio Lab + Demo span; Footer.tsx l.41-46 already links Gift Cards + Hire Us; l.74 'Czaba Music'; APP_NAME 'CZABA' l.4; no /collections route; e2e/navigation.spec.ts l.27-33 lists Gift Cards/Hire Us behind isVisible (silent skip); l.9 hero h1 'CZABA' keeps passing; no @remix-run/testing -> keep MemoryRouter precedent (closes round-187 reviewer item)",
  "rulings": {
    "R56": "Collections -> /store (no collections route; D14 is a later business decision); rejected: new /collections route (invents structure), keep 'Store' (ignores D15) (vetoable)",
    "R57": "Gift Cards and Hire Us leave the header only; footer already links both; routes, CommandPalette entry and SpecialOffers link stay; Free Samples (keep-list) stays in both header lists (vetoable)",
    "R58": "footer copyright uses APP_NAME 'CZABA'; ableton-export.ts 'Czaba Music Store' is Studio export metadata, out of scope",
    "R59": "wordmark = non-heading <span block> in text-foreground, link name 'CZABA', href '/'; font/size unchanged (STORE-2 owns typography) (vetoable)",
    "R60": "'Sign In' casing unchanged (spec 'Sign in'); casing is typography and the auth block stays byte-identical; owner STORE-2 (vetoable)"},
  "order_source": "direction-decision.md: Collections · Studio · Free Samples · About, then Sign in and the cart",
  "c_rows": ["NAV-188", "H1-188 (8 pages, SSR + hydrated)", "MARK-188", "FOOT-188", "KEEP-188", "STORE-AFTER-188 (changes bounded to header band + footer copyright line)", "E2E-NAV-188", "G188-3 (mock-backed)", "STUDIO-RV-188", "SCOPE-188 (no auth-block hunks)", "T-RUN-188", "AN-REVIEW-188", "PX-NET/REG-HYD"],
  "ableton": "not applicable (store pages)",
  "added": ADDED}
b['open_findings'] += [
  {"id": "GATE187-REVIEW-SIGNALS", "severity": "info", "status": "signal",
   "title": "gate-187 reviewer: (1) doc 154 status stale -> scheduled round 188 K6; (2) ProductCard.tsx:117-133 AudioPreviewButton nested inside <Link> (button-in-anchor, pre-existing) -> STORE-2 proposal: overlay as sibling of the Link + test; (3) aria-hidden missing on 4 play/pause SVGs -> GATE187-SVG-ARIA-HIDDEN deferred Low; (4) T1-187 vi.doUnmock/resetModules inside the variant loop (test isolation) -> signal, move real-provider case to own file when touched; (5) AudioPlayer unfilled rgba(255,255,255,0.1) vs app.css:2926/2976 --progress/--color-outline pattern -> STORE-2 proposal; (6) obsidian theme overrides --color-brand to #c9a46a so the mini-player fill is gold on Studio pages (info, correct); Architecture note: keep (AudioPreviewButton lost state/lifecycle); proposal one STORE-2 task: overlay out of Link + slider fill on --progress pattern + delete .audio-preview-overlay-text (ProductCard.tsx, AudioPlayer.tsx, app.css) - proposal only, not approved scope",
   "evidence": "gates/round-187/review.md", "b_ruling": "signals recorded; only (1) scheduled (two lines, rides with STORE-1c)", "added": ADDED},
  {"id": "A-R187-SIGNALS", "severity": "info", "status": "signal",
   "title": "A round 187: ProductCard.tsx:141 bg-primary/90 text-primary-foreground use undefined tokens (same class of bug as K1) on the non-new badge; T1-187 P2 asserts --color-primary declared nowhere -> loosen if STORE-2 adds a primary token; react-router-dom MemoryRouter transitive import (B round 188 decision: keep precedent, no new package); 5 pre-existing useButtonType warnings on AudioPlayer buttons; code-reviewer Architecture note: keep (12-member useAudio hand mock drift risk; real-provider hydration test added in-round)",
   "evidence": "a-round-187.md", "b_ruling": "ProductCard token -> deferred Low A-R187-PRODUCTCARD-PRIMARY-TOKEN owner STORE-2 (restyle only; Limited is keep-list); rest signals", "added": ADDED},
  {"id": "C-R187-INFO", "severity": "info", "status": "routed",
   "title": "C round 187 info: I1 entrance loader blocks / card Play for ~3-5.4 s (-> STORE-1d acceptance); I2 LeadMagnet popup covers scrolled-shot first viewport (baseline note: use non-scrolled/185seq or dismiss); I3 K1 also makes the unfilled track visible (expected); I4 375 /images/packs/cover.jpg incomplete after scroll (pre-existing, same in 186); task-text correction: /store has 0 preview buttons, regression store smoke checks card button on /",
   "evidence": "c-round-187.md, c-round-187/logs/hover-probe.txt, logs/blocker-probe.txt", "added": ADDED},
  {"id": "B-R187-HEADER-SIGNALS", "severity": "info", "status": "signal",
   "title": "Header auth-block buttons lack type=button (useButtonType), the menu toggle lacks aria-expanded/aria-controls, collapsed mobile links (max-h-0 opacity-0) stay focusable; .text-glow unused after STORE-1c K3; e2e/main-flow.spec.ts:58-61 lists /music and /hire-us behind isVisible (stale, silent skip)",
   "evidence": "Header.tsx at cb24362 l.115/142/151/159/230/255, l.171; app.css:1132; e2e/main-flow.spec.ts", "b_ruling": "STORE-2 candidates (auth block kept byte-identical in round 188); not scheduled", "added": ADDED}]
b['deferred_low_polish'] += [
  {"id": "GATE187-SVG-ARIA-HIDDEN", "severity": "low", "status": "deferred_low_polish",
   "title": "AudioPreviewButton.tsx play/pause SVGs (l.56,60,81,85 at cb24362) lack aria-hidden=true (Loader2 icons have it); button name comes from aria-label so nothing is broken",
   "evidence": "gates/round-187/review.md suggestion 3", "repro": "inspect the preview button SVGs in the accessibility tree", "owner_note": "STORE-2/4 when the file is owned, else polish pass", "added": ADDED},
  {"id": "A-R187-PRODUCTCARD-PRIMARY-TOKEN", "severity": "low", "status": "deferred_low_polish",
   "title": "ProductCard.tsx:141 badge (non-new) uses bg-primary/90 text-primary-foreground; neither token is defined, so the badge has no background and inherits text colour",
   "evidence": "a-round-187.md known gaps; ProductCard.tsx l.139-145 at cb24362", "repro": "render a card with a non-new badgeText; computed background-color transparent",
   "owner_note": "STORE-2 (tokens); restyle only - 'Limited' badges are on Saba's keep-list", "added": ADDED}]
b['architecture_signals'].append({"round": 187, "note": "A reviewer and gate-187 reviewer: keep (AudioPreviewButton lost state/lifecycle); proposal for a STORE-2 task (overlay out of Link, slider fill on --progress pattern, delete .audio-preview-overlay-text) recorded as signal only. No owner accumulates risk. b-round-183-checkpoint-request.md still unanswered, fallback (c); next checkpoint point = STORE-REDESIGN exit.", "added": ADDED})
rr = b['regression_rounds'][-1]
rr['round'] = "expected 189 (first planning on/after 2026-10-27; rounds 184-188 were planned 2026-10-26)"
rr.setdefault('scope_additions', []).extend([
  "STORE-1b (round 187 C PASS, cb24362): player fill teal; preview button JS-off vs hydrated markup identical - check the card variant on / (store.tsx renders no preview buttons; C round 187 task-text correction)",
  "STORE-1c (if round 188 C PASS): header inventory desktop+mobile, one h1 per page, plain wordmark, footer (c) CZABA",
  "Baselines: use non-scrolled + 185seq store shots or dismiss the LeadMagnet popup before scrolled shots (C-R187-I2)"])
rr['added_d29z153'] = ADDED
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
