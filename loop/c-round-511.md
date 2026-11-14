# C round 511: NONBRAND N2 (PurchaseHeader). Verdict: FAIL (one unruled A STOP). Every browser, test and mutant row passed.

Real Chromium via Playwright, dev :5173, mock API :5199 (stopped at the end). Fresh incognito contexts with no credentials. Signed-in states are -STUBBED (L36). Evidence is in `c-round-511/`. Browser: `states/`, `actions/`, `anon/`, `extra/`. Tests: `covering.log`, `mutants-c.txt`, `claims-c.txt`.

## Verdict
- Every row C0–C14 passed. `browserVerified` = true.
- `taskStatus` is FAIL for one reason: A STOPped on code-reviewer's Medium A-R511-REVIEW-DESIGN-SYSTEM-PRIMARY-EXAMPLES, and B has not ruled on it. L22 says an A STOP naming an unruled Medium+ is a short FAIL.
- If B rules option (b) (Low, deferred) or grants the doc fix (a), nothing else needs to be re-verified. For (a), re-check C0 and C12 only.

## STOP ruling (what C saw, not a B ruling)
- `docs/design/DESIGN_SYSTEM.md` after N2:
  - l.895 and l.1174 say Buy Now = `variant="buy"`.
  - l.1117–1118 still shows `variant="primary"` for Add to Cart.
  - l.1139 still shows `<PrimaryButton>Buy Now</PrimaryButton>`.
  - l.1165 is still the heading "Primary Button (Revenue Actions)".
  - No block documents `buy`.
- C confirmed all of it (bug C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES, origin B spec: the grant allowed exactly two lines).
- C's own rating is docs-only, Low to Medium. The product behaviour is unaffected.

## Rows
| Row | Result | Evidence |
|---|---|---|
| C0 | PASS | `git status`: 4 M + 2 new (the 6 grants). Frozen checks 1, 2 and 4 rc 0. The DESIGN_SYSTEM diff is exactly the 2 line replacements. |
| C1 | PASS | `states/c-states.json`, `anon/`. At 1440 (after warm-up) and 1280: Add to Cart 163×50 and Buy Now 139×50, same top, radius 8px, weight 600. Buy Now bg rgb(201,164,106), text rgb(14,13,12). At 375: 50/48, wrapped (pre-ruled 4). **Note:** the first ANON 1440 run hit a cold-Vite hydration error ("useState null"). A warm re-run was clean, so this is environment (L38). |
| C2 | PASS | Programmatic diff of all 15 state×viewport rows against `b-round-510/probe/sketch/sketch-states.json`: 0 diffs apart from the cold ANON run, which was re-run. Open in Studio 187/187/277, Downloads 160, bg rgb(29,26,23), text rgb(236,230,218), weight 600, radius 8px. Go to Downloads 203, Upgrade 230×48. |
| C3 | PASS | UNKNOWN: Buy Now `aria-disabled=true`, not native disabled, opacity 0.5, cursor not-allowed, focus kept after click, 0 POST. Reason "Price unavailable — contact us to buy it." is the `aria-describedby` target. **A's extension probe:** with the mouse held down on aria-disabled Buy Now, opacity stays 0.5, not 0.9 (`extra/extra.json` C3_mousedown, `extra/c3-mousedown.png`). The Low raised by the reviewer does not reproduce. |
| C4 | PASS | A1 at 1440 and 1280: POSTs `/api/cart/items`, `/api/cart/checkout`, `/api/payments/checkout`, 1 each. Busy: "Processing...", native disabled, spinner, width 167, pointer-events none (record). Lands on `/__stripe-stub`. |
| C5 | PASS | A3 and A5: `:focus-visible` true, outline `solid 1px` brass at 0.8, offset 2px. Mouse press shows no ring (record). |
| C6 | PASS | A2: "Adding...", then "In Cart" (radius 8px, text rgb(201,164,106), width 140), 1 POST. Added-pulse and reduced-motion variants **not recorded**: the harness does not cover them. |
| C6b | PASS (record) | Open in Studio: bg rgb(29,26,23) → rgb(36,33,30), border rgb(36,33,30) → rgb(46,42,38). Add to Cart: transparent → rgb(29,26,23). |
| C6c | PASS | Busy at 1280: Add to Cart and Processing share one line (`actions/c-A1-1280-busy.png`). |
| C7 | PASS | "Play Stems" count 0 in all states at all 3 viewports. |
| C8 | PASS | `/store` → product → Buy Now: email field 0 → 1, 0 page errors (`extra/c8-*.png`). The dialog selector count of 0 does not matter here, because the email input appeared. |
| C9 | PASS | Covering: rc 0, 7 files / 92 tests, N2-1…9, B2C-7, B2C-8 and ST5 present, slowest test 19 ms. Mutants M1–M23 + MA1 + MA2 = 26 runs, all RED-OK on named rows, on C's own copy (removed). |
| C10 | PASS | `<button` in PurchaseHeader = 0. Widened scanner 51 hits, one PurchaseHeader entry (`motion.button` l.406). `grep -c stems app/lib/product-utils.ts` = 1. |
| C11 | PASS | The diff is exactly 3 corrected sentences + the Errata section. Median $15.65 / mean $17.13 recomputed over rounds 496 and 498–507 (11 rounds). Longest lesson line is 4,771 bytes. |
| C12 | PASS | 7 headings in order. l.4 is byte-equal (`cmp`). The ledger maps every behaviour sentence to a row. |
| C13 | PASS | Fresh no-credential context at 1440 and 1280: `/studio/middle-east` and `/account/downloads` show "Sign in required" (7 s wait; the first 3.5 s run was too short). The only download-like links are the nav "Free Samples". `/api/studio-token?...` unauthenticated = 401, "Please sign in to access Studio.", no URL. `/studio-lab` opens the demo ("CZABA Studio — Demo collection") at both viewports: premium auth is not bypassed. |
| C14 | PASS | Claims script rc 0, 0 MISSING. The diff differs only at K2, K5, K8, K16, K21, K22 and K23 (K23 is environmental: B's scratch file is absent on this fresh machine, and the pin check is rc 0). `l57-check` rc 0. |

## Gate (not claimed)
Full vitest, build, Biome-all, `npm run verify` and `test:e2e:smoke`.

## Blocked
Real signed-in purchase and ownership need the backend, which is unavailable in the cloud. They stay -STUBBED.

## Notes for B
- A's disclosed A-R511-L60-SHELL-EDITS (python exact-string edits instead of the Edit tool) is a process finding, not a product bug. The resulting diff is within the grants.
- The B-R510-BUSY-CURSOR-HIDDEN (Low, deferred) busy-cursor behaviour is confirmed again (pointer-events none while busy).
