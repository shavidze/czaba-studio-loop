# Round 446: STORE-2b-1 — the LeadMagnet popup no longer opens on product, cart and checkout pages

**Planned by:** B, at the round 445 → 446 planning, 2026-11-11 (`b-round-445.md`).
- The advisor was available and was consulted after orientation and before hand-off.
- The round-445 task is archived as `tasks/round-445.md` (byte-identical copy made before this file was rewritten) [K18].
- **Baseline:** gate 445 is `published`, commit `4bfebd7` [K1]. The store tree is clean at planning [K2].
- **Regression:** not due. `regression-last.json` is 2026-11-10 (round 425); the next one is due on or after 2026-11-13.
- **RETRO:** round 450.

## Why this round
- C round 445 PASS (`browserVerified` true, 0 bugs) [K19] and gate 445 published `4bfebd7`. **SYS-3 is complete.** No C bug is open. No Critical/High is open; the open Mediums are root/manual/Saba-gated or scheduled (`context/active-summary.md`).
- Order D-29z1581: STORE-REDESIGN 2b…5 is next. STEM-LANES is still `awaiting_user` (no answer to `user-review/AGREE-STEM-LANES.md`), so it does not outrank STORE-2b.
- **STORE-2b is split (D-29z1583)**, one bounded stage per round, nothing dropped:
  - **2b-1 (this round):** PD-REVIEW F4 / Saba Q3 — LeadMagnet route exclusion. It goes first because it is a Saba-approved behaviour (Medium in the PD review), it is small, and it removes the auto-opening popup that interrupts C's product-page probes in STORE-4 (L1).
  - **2b-2:** hardcoded teal sweep in TS/TSX (recount at `4bfebd7`: 24 hits in 9 files with the regex in `b-round-445.md` §4; the old 37/14 count was at `caa09af` with a different regex).
  - **2b-3:** glow blobs, gradient text, `shadow-glow`, teal gradient/glow tokens and alias colours in `app/styles/app.css`. `app/styles/**` is `global_forbidden`; 2b-3 gets a B narrow grant for `app/styles/app.css` with an exact byte scope, as rounds 192, 196, 201 and 316 did (`narrow_grants`).
  - **2b-4:** F6 visual part, inside the restyle stages.

## What changes (user-visible)
1. On `/products/<handle>`, `/cart`, `/checkout` and `/checkout/<anything>` the popup never opens: neither the 8 s timer nor exit intent shows it, and no view is counted.
2. Scrolling on an excluded page does not count as engagement for later pages. When the visitor returns to an allowed page, that page needs its own ≥ 40 % scroll inside a new 8 s window (or an exit intent after its own scroll), exactly as on a first page today.
3. If the popup is open and the visitor reaches an excluded page (browser Back/Forward), the popup closes **without** being marked dismissed, the body unlocks, the new page does not jump to the old page's scroll offset, the step goes back to the offer, and the last submit error is cleared.
4. Everything else is unchanged (keep-list): content, steps, copy, the 8 s one-shot timer, the 40 % threshold, exit intent, the 10-per-day cap, dismissal, submission, focus behaviour, and every allowed page (`/`, `/store`, `/free-downloads`, `/gift-cards`, `/about`, `/account/*`, `/recordings/*`, `/scenes/*`, …). Moving between two allowed pages keeps HEAD's carried-over window (LMR8).

Not changed, and why: `app/root.tsx` is protected (`global_forbidden`), so the mount stays where it is and the exclusion lives in the hook. `MAX_VIEWS_PER_DAY = 10` with its comment "Max 2 views per day" [K8] is not in Saba's decision → signal `SIG-R446-LEADMAGNET-CAP-COMMENT`, not touched.

## Reference: how established stores do it
The Ableton reference does not apply: this is a Store change. Store sources:

| Point | Source | What it says | CZABA decision |
|---|---|---|---|
| Overlays in checkout | Baymard Institute guideline #709 "Overlays Appearing During Checkout" (https://baymard.com/guidelines/709-overlays-appearing-during-checkout, fetched 2026-11-11; only the public summary is readable, the research is behind a login) | "Site-initiated overlays in checkout distract users at a critical time, slowing their progress", adding abandonment risk | No popup on `/cart`, `/checkout*` |
| Product page | No primary source found (searched "Baymard checkout newsletter popup interrupt cart product page best practice"; the results were vendor blogs, treated as opinion) | — | Saba's decision Q3 (`docs/technical/studio-real-workspace/product-design-review-2026-10-31.md`, F4 and Q3) is the authority: `/products/*` excluded [K24] |
| Behaviour details | `product-designer` consult at this planning | (a) suppress silently, count no view; (b) a fresh window after an excluded page; (c) an open popup hides on an excluded route without a dismissal; (d) only Saba's list, whole path segments | Adopted. One correction: the designer's row "after that, scroll 40 % and wait 8 s: dialog appears" is not HEAD behaviour (the 8 s check is one-shot; after it, only exit intent shows the popup). The keep-list wins, so the rows below follow HEAD's one-shot timer |

Research folder: `docs/technical/store-redesign/research/*.md` searched for `popup|newsletter|interstitial|lead magnet` — one unrelated hit (`competitors.md` on Shopify newsletter captcha gates); nothing on popup timing or exclusion.

Deviations and B's smallest-honest choices beyond Q3 (L44: each goes to Saba once as `SABA-Q-LEADMAGNET-NAV-RULES`, `awaiting_user`; the round implements the defaults below and does not wait):
- **(c) An open popup is closed by navigation** to an excluded page. Q3 says "does not open there"; leaving a modal over the cart would defeat Q3's purpose, so B chose the hide (no dismissal recorded). Alternative for Saba: leave it open.
- **(b) The 8 s window re-arms after every excluded page.** At HEAD a spent window never re-arms in the same visit; with this round, a visitor who goes home → product → home gets a new window on the second home visit, and a Back-hide can be followed by another show (each counts a view, capped at 10 per day). Alternative for Saba: no re-arm once a window was spent.

Open question for Saba (not in scope, default "not excluded"): should `/recordings/*` and `/scenes/*` (product-detail-like views) also be excluded? → `SABA-Q-LEADMAGNET-RECORDINGS-SCENES` (`awaiting_user`).

Not applicable, with reasons: the STORE stage rows for LCP/CLS, contrast and reduced motion (no markup, style or animation changes; the popup's markup is untouched); YouTube/AGREE (Saba already decided Q3 on 2026-10-31); screen budget (nothing persistent is added; a popup is removed from some routes); L55 product model (no data or lane model changes); Ableton parity rows (Store change).

## Ruling lines (L4)
- Popup on an excluded route: "does not open" (Saba) wins over "behaviour unchanged" (keep-list).
- An already-open popup reaching an excluded route: hide (ruling c) wins over "leave it open".
- The 8 s window: HEAD's one-shot check (keep-list) wins over the designer's "wait 8 s again" wording. The premise is pinned by LMR13, green on the sketch and on the HEAD hook [K25].
- The popup's own `email` and `validationError` state survive a route hide (the component stays mounted, as with every hide at HEAD): kept this round, recorded as `TL-R446-L3-LOCAL-STATE` (deferred Low).
- Scroll after a route hide: "no jump to the old page's offset" wins over `useScrollLock`'s restore; every other caller of `useScrollLock` (`AuthModal`, `ui/Modal`) keeps the restore through the default `true` [K9].
- A Back that lands on an excluded route while the popup is open loses Remix's saved scroll position for that page (tech-lead v2 Low, `TL-R446-L1-POP-RESTORE-LOST`): the page lands at its top. Accepted for this round; C7 compares with the no-popup control, whose saved position in the recipe is also the top.

## 1. The sketch (apply it unchanged)
- Patch: `b-round-445/sketch-446.patch.txt`, sha256 in `b-round-445/sketch-446.sha256` [K6]. Paths: `b-round-445/sketch-paths.txt`, copies in `b-round-445/sketch-files/`.
- Review: `b-round-445/sketch-review.md`. tech-lead v1: approve-with-changes (M1 scroll restore, M2 same-render mask, L3 error reset, L4 router warnings), all applied in v2; v2 delta review: approve. v3 adds only test row LMR13 (test-only delta review: approve; title nit `TL-R446-V3-TITLE` accepted). Reviewed sha = dispatched sha [K21].

| File | HEAD `4bfebd7` | After |
|---|---|---|
| `app/hooks/useLeadMagnet.ts` | effect deps `[isLoggedIn]` [K7]; timer 8000, threshold 40, cap 10, exit intent [K8] | adds exported `isLeadMagnetExcludedPath(pathname)` (`/products/` prefix; `/cart` or `/cart/…`; `/checkout` or `/checkout/…`) and reads `useLocation()` from `@remix-run/react`; effect deps `[isLoggedIn, isExcludedRoute]`; on an excluded route: `setShouldShow(false)`, `setCurrentStep('offer')`, `setError(null)`, return (no listeners, no timer); returns `shouldShow: shouldShow && !isExcludedRoute` and `isRouteExcluded` |
| `app/hooks/useScrollLock.ts` | `useScrollLock(isLocked)` restores the locked scroll on unlock and unmount [K23] | `useScrollLock(isLocked, { restoreScrollOnUnlock })`, default `true`, read through a ref at unlock/cleanup (tech-lead: keep the ref-in-render form) |
| `app/components/marketing/LeadMagnetPopup.tsx` | `useScrollLock(shouldShow)` [K9] | `useScrollLock(shouldShow, { restoreScrollOnUnlock: !isRouteExcluded })`; nothing else |
| `app/lib/__tests__/store-lead-magnet-routes.test.tsx` | — | new: LMR1–LMR13, SL1–SL2 |

Callers swept [K11]: `useLeadMagnet` is used only by `LeadMagnetPopup` (plus the mock in `store-lead-magnet-dialog.test.tsx`, which returns no `isRouteExcluded`, so the popup keeps the restore there); no e2e or perf file references the popup.

## Focus origins (L50, L47)
`grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/components/marketing/LeadMagnetPopup.tsx app/hooks/useLeadMagnet.ts app/hooks/useScrollLock.ts` → 12 hits, all in the popup; saved with line numbers in `b-round-445/logs/l50-focus-origins.txt` [K26].
- **R-A (open focus, return focus):** the route hide runs the popup's return-focus cleanup, which focuses the saved element only when it is still connected. Two origins, each a C row: nothing focused before the popup (the old page's element is gone → the focus a plain Back leaves, C8a), and a persistent header link focused before the popup (still connected → focus returns to that header link, C8b).
- **R-B (step focus on email/success, the email retry focus):** not reached by a route hide (the step resets to offer while hidden, and the step-focus ref resets when hidden); unchanged, covered by `store-lead-magnet-dialog.test.tsx`.
- **R-C (Tab wrap inside the dialog):** unchanged; dialog tests.
- **R-D (step, error and submitting conditional renders):** step reset LMR6, error reset LMR12; local `email`/`validationError` kept (ruling above).

## 2. A: steps
1. Run `bash b-round-445/claims-446.sh` before editing; K1, K2, K5 and K6 must print the values in `b-round-445/claims-446-planning-output.txt`. Otherwise STOP (L11).
2. `git apply --check -p1` then `git apply -p1 b-round-445/sketch-446.patch.txt`. No hand edits to the four sketch files.
3. Write `docs/implementation/2026/quarter-IV/291-store-2b-1-leadmagnet-route-exclusion.md` (Georgian, technical terms in English):
   - l.1 title; l.3 `**თარიღი:** 2026-11-11`; l.4 exactly `**სტატუსი:** Completed (C round 446 PASS)` (L28); l.5 `**შეცვლილი პროექტი:** Store (…)`.
   - The seven TEMPLATE headings in order (`## კონტექსტი` … `## TODO / შემდეგი ნაბიჯები`, L26).
   - Content: Saba Q3/F4 and the Baymard #709 summary; rulings (a)–(d) and the one-shot-timer correction; the scroll-restore problem (tech-lead M1; B's browser measurement on the interim sketch before the scroll fix (`b-round-445/sketch-446-interim.patch.txt`): product page at y = 206 after Back vs 0 in the no-popup control, `b-round-445/probe/sketch-back-1440.json` (BACK vs BACKCTL rows)) and its fix; the same-render mask; TL-R446-L1-POP-RESTORE-LOST; a Mermaid diagram of route → hook → popup → scroll lock; the 4 changed files; the 14 mutant ids from `b-round-445/mutants/results.jsonl`; only test titles that exist (L26); TODO: STORE-2b-2/2b-3/2b-4, SIG-R446-LEADMAGNET-CAP-COMMENT, SABA-Q-LEADMAGNET-RECORDINGS-SCENES, TL-R446-L1-POP-RESTORE-LOST, TL-R446-L3-LOCAL-STATE, SABA-Q-LEADMAGNET-NAV-RULES.
   - No `pending` form (L28).
4. Checks A runs (speed rules, no full suite):
   - A1: the four sketch paths are byte-identical to `b-round-445/sketch-files/` (K4 = 4/4).
   - A2: `npx vitest run $(cat b-round-445/covering-files.txt)` — 4 files, 100 tests green, as in `b-round-445/logs/covering-sketch.log`.
   - A3: `npm run typecheck` rc 0; `npm run lint` rc 0 with the warning count of `b-round-445/logs/lint-sketch.log`; `npx biome check` on the 4 sketch paths rc 0.
   - A4: `bash b-round-445/claims-446.sh` after all edits; its diff against `b-round-445/claims-446-sketch-output.txt` shows only K17 (doc 291) changed.
   - code-reviewer (3+ files rule).
5. `git status` = exactly the 5 paths in `b-round-445/grants-446.txt` [K2]. No protected file [K3].

## 3. C: acceptance rows
Real Chromium (Playwright) on `http://127.0.0.1:5173` with the mock API on `:5199` (start `node tmp/studio-real-loop/mock-api/server.mjs` if it is not up). Store rows at **1440×900, 1280×720 and 375×812**; exit-intent rows at 1440 and 1280. Fresh context per cell, empty storage, cookies declined. Warm up once in a browser before timed cells (L38). The probe is `b-round-445/probe/lm-routes.cjs` (helpers from `c-round-205/tools/lib.cjs`); copy it into `c-round-446/` before editing (L60). HEAD control on a second server: `bash b-round-445/probe/sketch-server.sh start <c-round-446 dir> 5178 none` (`none` = HEAD without a patch, own Vite cacheDir; B ran this exact mode, `b-round-445/logs/head-server-none-mode.txt`) [K27].

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` | the 5 granted paths only; `root.tsx`, `AuthModal.tsx`, `ui/Modal.tsx` unchanged [K3] |
| C2 PATCH-IDENTITY | cmp | 4/4 [K4] |
| C3 CONTROL-HOME | `/`: scroll 55 %, wait ≤ 14 s | popup visible, `viewCount` 1, all 3 viewports. HEAD the same |
| C4 EXCLUDED-TIMER | `/products/pulse-loop-kit`, `/cart`, `/checkout/success`, `/checkout/cancel`: scroll 55 %, wait 14 s | no popup, `viewCount` absent or 0, each page had scroll room > 0 (non-vacuous). HEAD control: popup on all 4 × 3 (B: `b-round-445/probe/head-1440.json`, `head-1280-375.json`, 12/12) |
| C5 EXCLUDED-EXIT | product page: scroll, exit intent (`mouseleave` clientY 0) | no popup. HEAD: popup |
| C6 JOURNEY (L54) | `/` scroll 55 %, click the first product card link before 8 s, wait 12 s | no popup on the product page. HEAD: popup (B 3/3) |
| C7 BACK-HIDE | `/products/pulse-loop-kit` → client link to `/` → scroll → popup → `goBack()` | on the product page: no popup; `body` `overflow`/`position` empty; `scrollY` equal to the no-popup control `BACKCTL` (same steps, popup suppressed); `dismissed` false; `viewCount` 1. Then `goForward()`, scroll, wait: popup on the **offer** step, `viewCount` 2. HEAD control: popup still open after Back |
| C8a FOCUS-AFTER-HIDE, no prior focus (L47) | same as C7, read `document.activeElement` after Back | equal to `BACKCTL` (the focus a plain Back navigation leaves) at each viewport; B's values in `b-round-445/probe/sketch-all.json` [K25] |
| C8b FOCUS-AFTER-HIDE, header link focused (L47) | probe mode `ONLY=header`: focus the first visible header link on `/`, scroll, popup, Back | focus is on that same header link (tag A, same name, visible ring if keyboard-focused) and equal to `BACKHCTL`; B's values in `b-round-445/probe/sketch-header.json` [K25] |
| C9 KEEP-LIST | home popup at 1440: offer → FREE DOWNLOAD → email step, then Close | record — not run on sketch: screenshot pair HEAD (:5178) / tree (:5173) of the offer and email steps, and `scrollY` after Close; expected no visible change (the popup markup is untouched); a difference is a finding |
| C10 COVERING | the files in `b-round-445/covering-files.txt` | green; counts equal to `b-round-445/logs/covering-sketch.log` |
| C11 MUTANTS | make a `git clone --shared` of the store at `4bfebd7`, apply A's diff there, then `python3 -I b-round-445/mutants/run-mutants.py <clone> c-round-446/mutants/results.jsonl c-round-446/mutants` (the script takes tree, output and log dir; it never writes into `b-round-445/`) | 14 lines; ids, rc and failedRows equal to `b-round-445/mutants/results.jsonl` |
| C12 STUDIO-SMOKE + AUTH | `/studio-lab` Play → Playing, Stop → Stopped (1440×900, 1280×720); anonymous `/studio/middle-east` "Sign in required", 0 `audio[src]` | as HEAD; any row that truly needs the backend is BLOCKED "backend unavailable in cloud" |
| C13 DOCS | doc 291 l.4 exact, TEMPLATE headings in order, 14 mutant ids, test titles named exist, no `pending` | all true |
| C14 CLAIMS | `bash b-round-445/claims-446.sh` vs `b-round-445/claims-446-sketch-output.txt` | only K17 differs |

Gate rows (full vitest, typecheck, build, Biome, verify): `gate`, not claimed by C.
All L57 fields in `c-round-446.json`, an `origin` on every finding, `tools/l57-check.py` rc 0. `mutantRedOnSketch` = `b-round-445/mutants/results.jsonl`.

Neighbours that could break: the other `useScrollLock` callers (AuthModal, ui/Modal: default restore unchanged; SL1 and the dialog file's LM8 cover it); the popup's focus return; the 10-per-day count.

## 4. Claims
`b-round-445/claims-446.sh` (K1–K27). Planning output: `b-round-445/claims-446-planning-output.txt`. Sketch output: `b-round-445/claims-446-sketch-output.txt`.
