# C round 512 — DPG-BUTTON-CLEANUP-2-NONBRAND N2 close-out (docs only)

Verdict: **PASS**, browserVerified true. Evidence in `c-round-512/` (anon/, added/, extra/ PNG+JSON, covering.log, claims-c.txt, l57-check.txt).

| Row | Result |
|---|---|
| C0 | 8 paths (6 M + 2 ??); frozen 1 (tree), 2 (protected, run from store/), 3 (pin), 5 (post-sketch) rc 0; app diff = 3 files, 65+/20- |
| C1 | stale scan 0/0/0; Buy block classes = `variantStyles.buy` (Button.tsx:45-50); variants checked vs code: Buy Now `buy` (PurchaseHeader:348), Proceed to Checkout (cart.tsx:389, default primary), Get it free `primary` (ProductSidebar:84), Upgrade to Premium / Unlock Premium default primary, Open in Studio / Downloads `secondary`; `#C9A46A` = app.css `--color-buy`/`--color-brand` |
| C2 | doc 330: 7 headings in order, l.4 exact, grep pending/511 = 0, row ids all exist in tests, ledger present (48 lines) |
| C3 | ANON 1440 & 1280: Add to Cart 163×50, Buy Now 139×50, same top y=159.5, radius 8px, weight 600, Buy bg rgb(201,164,106) text rgb(14,13,12), 0 errors (after warm-up) |
| C4 | /store → product → Buy Now: email field 0 → 1, screenshots c8-1..3, 0 errors |
| C5 | Adding... → Added → In Cart at both viewports, both motion settings; radius 8, In Cart rgb(201,164,106) width 140; 1 POST. Record: max scale under `reduce` = 1.043 / 1.042 (B-R511-CART-PULSE-REDUCED-MOTION, Low, deferred) |
| C6 | fresh context, 7 s wait, both viewports: /studio/middle-east and /account/downloads "Sign in required", no download link (only nav "Free Samples"); GET /api/studio-token = 401 no URL; /studio-lab opens demo (title "CZABA Studio — Demo collection"); protected sha rc 0. (3.5 s run of extra.mjs showed studio page still hydrating at 1440; prot.mjs 7 s run confirms.) |
| C7 | covering rc 0, 7 files, 92 tests; N2-1..9, B2C-7/8, ST5 present; no test ≥ 2.5 s |
| C8 | claims diff vs planning output: only the expected differences (2 more M docs, stale lines gone, Buy block count 1, pre-sha fails by design). L57 rc 0. **Gap:** `a-round-511/diff.patch` and `b-round-511/scratch` do not exist on this fresh runner, so K5 diff-equality and K12 scratch-pin could not run; replaced by pin sha rc 0, post-sketch pin rc 0 and app diff stat equal to round 511 |

Not verified / gate: full vitest, build, Biome-all, verify, e2e smoke (gate rows). Real signed-in purchase blocked (backend unavailable); signed-in states stay -STUBBED.

For B: A's three doc Lows (A-R512-REVIEW-DOC330-HEAD-WORDING, -BUTTONMD-CLAIM, -DECISION-TREE-UNLOCK); the artifact gap above; B-R511-CART-PULSE-REDUCED-MOTION confirmed. Ableton conformity: not applicable (docs-only). No bugs opened.
