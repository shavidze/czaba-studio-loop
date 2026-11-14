# C round 509 — B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD ("Get it free")
**Verdict: PASS, browserVerified true. 0 bugs.** Playwright/Chromium, dev :5173, mock API :5199 (started by C). Free/split/signed-in states are STUBBED (L36) via `_data` route rewrite + `/api` routes. Evidence in `c-round-509/` (anon.json, signed.json, prot.json, journey.log, screenshots c1/c2/c3/c4/c5/c6/c7/c12/c13).

| Row | Result | Evidence |
|---|---|---|
| C0 scope | PASS: 4 M + 3 untracked = the grants; tree and protected checks rc 0 | git status, sha256 -c |
| C1 render (1440/1280/375) | PASS: 1 button "Get it free", type=button, 0 svg, "Complimentary Download" 0; width = column (420/420, 327/327); height 48 (record), line-height 24 (one line); bg rgb(201,164,106) = --color-brand #c9a46a; header $0.00 USD + Add to Cart + Buy Now | anon.json, c1-*.png |
| C2 anon click (1440/1280) | PASS: email field 0→1, Close 0→1, role=dialog 0 (pre-ruled #5); toast "Sign in to get it free." 1; URL same; 0 POST; header Buy Now toast = "Please sign in to continue with your purchase" | c2-*.png |
| C3 keyboard | PASS: Tab reaches it after "BY CZABA" in 11 tabs, focus-visible true, 1px brass outline (80%); Enter → toast+modal; Esc → focus stays on button, focus-visible true | anon.json kbd-* |
| C4 version | PASS: Standard present; Premium ($9.00 header) absent; Standard present again (both viewports) | c4-premium-*.png |
| C5 paid | PASS: middle-east: no Get it free/Complimentary; Buy Now + Add to Cart present; anon Buy Now toast + modal; 0 POST | c5-*.png |
| C6 signed-in | PASS (STUBBED): single click and double click both send exactly cart/items ×1 (productVariantId 21 = Standard), cart/checkout ×1, payments/checkout ×1; during hold sidebar "Processing..." (spinner, disabled) and header Buy Now "Processing..." disabled; lands /__stripe-stub; 1440 and 1280 | signed.json |
| C7 owned | PASS (STUBBED): no Get it free; header area shows owned state ("Already owned / You own Standard") | c7-owned-*.png |
| C8 grep | PASS: Complimentary Download 0; trackBeginCheckout( in useBuyNowAction.ts + pre-existing useAnalytics.ts (A deviation 1 accepted); ProductSidebar `<button` 0; nonbrand scan 53, no ProductSidebar | — |
| C9 real $0 order | BLOCKED: backend unavailable in cloud | — |
| C10 tests+mutants | PASS: covering rc 0, 9 files/122 tests, SF1–SF9, SF4b, PU7 present, no test ≥ 2,500 ms. C re-ran MA, ME, MD, MI on a copy: each red on its named row (SF2/3/4b; SF4/4b/7; SF7; SF9); restored 17/17 | covering.log |
| C11 docs | PASS: l.4 byte-equal; 7 headings match TEMPLATE order | — |
| C12 protection+studio | PASS: fresh no-credential context: /studio/1 and /account/downloads "Sign in required", no download link (only "Free Samples" nav); /studio-lab opens demo ("no sign-in required"), no horizontal overflow, 0 page errors, both viewports | prot.json, c12-*.png |
| C13 journey | PASS (STUBBED): /store → card → product → Get it free → sign-in modal, 0 page errors | c13-*.png, journey.log |
| C14 claims+L57 | PASS: 0 MISSING; differs only K2 (7 paths) and K13 (hook files 19) as A reported; L57 rc 0 | claims-c.txt, l57-check.txt |

**Not verified / limits.** Real $0 order (C9). Studio find→add→fit video→export flow was not run: this round changes no Studio file, so no Studio audio/export result is claimed. Gate rows (full suite, build, verify) left to root. Cold-start hydration error in the first 1440 run was a Vite warm-up artefact (rerun clean).
**For B (non-bugs):** pre-ruled Lows #2 and #5 reproduce as expected; focus ring is 1px (global, pre-existing).
