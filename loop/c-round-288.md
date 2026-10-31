# C round 288: FIX-PD-1a2 fix-up (C-R287-01 line box + A-R287-PREMIUM-UNVALIDATED)

**Verdict: PASS.** Every runnable row passes at 1440×900 and 1280×720. `browserVerified` = `realVerified` = true. There are no new bugs. Two backend-only rows are BLOCKED (backend unavailable in cloud).

## Setup
- **Env:** `env-status.json` round 288, store 200. The dev server :5173 serves A's live tree and was used for G288-AUTH.
- **Trees:** the live tree's sha256 equals A's `post-edit-sha256.txt` 7/7 (`c-round-288/sha-start.txt`). I made two production builds:
  - HEAD `096fa4b`: `git archive` → `/tmp/c288head`, served on :3287;
  - A's tree: an rsync copy → `/tmp/c288a` (sha 7/7 equal), served on :3288.
  - Each build has its own Vite `cacheDir` (`/tmp/c288{head,a}-vitecache`, L38), set in the scratch copies only. Both were warmed up (`/`, `/store` and two product pages returned 200) before probing.
- **Mock:** `c-round-288/mock-c288.mjs` is `c-round-287/mock-c287.mjs` plus `bad-premium-track` (id 13, Track, no `variants`, `standardPrice` 19, `premiumPrice` −5, one-line description). Its content is identical to A's `mock-a288.mjs`.
  - Health reported `products: 12`, of which 11 are active.
  - **Info:** the task says "10 active (9 + bad-premium-track)"; the mock actually has 11 active. I checked all 11.
  - The standard mock (PID 6167) was stopped by PID before the run and restarted at the end (`products: 8`).
- **Tools:** Playwright Chromium, fresh contexts with no credentials. The LeadMagnet was pre-dismissed in localStorage for the store probes only.

## Rows

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS | `claims-288.sh` on the `git archive 096fa4b` scratch with `b-round-287/k2-snapshot/` overlaid equals `claims-288-output.txt`, except K1 `(archive)` and the K2 `git status` listing. The listing is empty because an archive is not a git repo; this is the same archive artefact as in C round 287. All 7 K2 sha256 lines and K3–K14 are equal (`c-round-288/claims-c.txt`) |
| L29 sweep | PASS (info) | The untagged code fact §9 "the price row is `flex items-center`" is true at `store.tsx:552` and `ProductCard.tsx:158`. The "Line N" mentions in §2/§5 are covered by K3/K4/K5/K9 |
| SOURCE-SCOPE | PASS | `git status` = the 7 K2 paths (5 M + 2 ??).<br>The diff vs `k2-snapshot` (`c-round-288/source-diff-vs-k2.txt`):<br>• `VersionSelector.tsx`: no diff;<br>• `store.tsx` 559, `ProductCard.tsx` 162 and `product-utils.ts` 105: exactly §2.1–§2.3 (line 100 unchanged);<br>• `product-utils.test.ts`: only `+` lines (PR10);<br>• `product-price-cards.test.tsx`: exactly 3 `-` lines (180, 192, 246, per §3.1) plus VC5;<br>• doc 215: line 4 plus `+` lines.<br>`git diff 096fa4b` is empty for PurchaseHeader, ProductDetailPage, ProductSidebar, `app/contexts`, `app/services`, `auth.ts`, the 3 protected routes, package.json and the lock file |
| TYPECHECK | PASS | rc 0 (`c-round-288/typecheck.log`) |
| UNIT | PASS | The 7 covering files + `product-price-cards.test.tsx`: **8 files / 136 tests passed** (`c-round-288/unit.log`). PR10 and VC5 each appear exactly once by name.<br>PR10 has one extra NaN → `['Standard']` assertion beyond B's list. It is inside A's own appended row and tightens §9's NaN presence rule. Accepted |
| UNIT-MUTANTS | PASS | My own `c-round-288/mutants-c.py` ran on the scratch copy `/tmp/c288mut`; the live tree was not touched. Each file was restored and its sha re-checked (`mutants-c.txt`).<br>**N7** red SC1. **N8** red PC1. **N9** red PR10 + VC5. **N10** red PR10 (+VC5).<br>The r287 re-run: **N1** PR5, PR7, VC1, VC2; **N2** VC1, VC2, VC3, VC5; **N3** PC1, PR9, SC1; **N4** PC1; **N5** PR8, VC3; **N6** VC3 |
| B-LINE-BOX | PASS | A, both viewports (`probe/a.json`, `probe/head.json`):<br>• **`/store`:** every `Price unavailable` span (`priceless-pack`, `priceless-track`) computes `line-height` **32px**, font-size 14px, colour `rgb(163,155,142)` (`--color-muted` `#a39b8e`);<br>• **home:** **28px** / 14px / same colour;<br>• **card heights:** `/store` cards are **589.6** and home `article`s **417.6**, equal to HEAD's for the same handle;<br>• **SFX-filtered row:** `priceless-pack` and `free-pack` are both 589.6. Their visible frames (`frameH`) are both **589.6**, with the frame bottom at 1208.2 for both at 1440 and at 1280, and the price tops are equal at 1121.6;<br>• **All view:** `free-pack` y = 1288.2 on A and on HEAD, and every row's y equals HEAD's;<br>• **price line top** = HEAD (`/store` 1121.6/1791.2, home 1594.6 at 1440 and 1414.6 at 1280).<br>Shots: `c-round-288/shots/a/store-sfx-row-{1440,1280}.png`, `home-row-{1440,1280}.png` (and `head/`) |
| B-PREMIUM | PASS | `/products/bad-premium-track` on A, both viewports:<br>• the version cards read `Standard $19` and `PREMIUM Premium Price unavailable`;<br>• the page text has no `$-5`, `-$5` or `NaN`;<br>• after selecting Premium, the panel's Total Price reads `Price unavailable`, the Premium card is `aria-pressed="true"`, and Add to Cart and Buy Now are both `aria-disabled="true"`;<br>• HEAD's Premium card reads `$-5` (`shots/head/journey-bad-premium-2-page-1440.png`);<br>• the version-card boxes are identical on A and HEAD: 334×162 at x 962/882 and y 308, at 1440/1280.<br>Shots: `shots/{a,head}/version-card-bad-premium-*`, `shots/a/journey-bad-premium-3-premium-*.png` |
| B-KEEP-287 | PASS | Both viewports:<br>• **`priceless-track` version card:** `Standard Price unavailable`, 684×124 on A and HEAD;<br>• **`/store` labels:** `Price unavailable` with no `$0`;<br>• **home:** `priceless-track` and `priceless-pack` read `Price unavailable`, with no `Complimentary` and no `$0`, and the `Pack` badge is on `priceless-pack` (`probe/badges.txt`);<br>• **B-FREE:** `free-pack` reads `$0` on `/store`, `Complimentary` text plus a `Complimentary` badge on home, and `$0.00USD` on the page with the buttons enabled;<br>• **B-REGRESS:** the price-span `className` is byte-equal to HEAD for all 7 standard fixtures on `/store` and for the 4 on home, at both viewports, which confirms from the browser that the known branch is unchanged. The 7 standard fixtures' `/store` prices `$29 $24 $19 $21 $17 $9 $12`, card boxes, price tops, panel figures and version-card texts and boxes are equal to HEAD, and `middle-east` reads `$29` / `$99`. With `bad-premium-track` added, the home row (the first 8 active) shows 4 standard fixtures, all equal to HEAD;<br>• **R286-KEEP:** `priceless-pack` buttons are `aria-disabled="true"`. Click, Enter and Space on both buttons produce 0 `/api/cart\|auth\|orders` requests and no sign-in. The same holds on `bad-premium-track` with Premium selected (12/12 activations clean per viewport) |
| B-JOURNEY (L54) | PASS | All **11** active fixtures: the `/store` card label equals the page figure (`$29`/`$29.00USD` … `Price unavailable`/`Price unavailable`).<br>`bad-premium-track`:<br>• the card reads `$19`;<br>• clicking it opens the page with Standard `aria-pressed="true"` and `$19.00USD`;<br>• selecting Premium makes both the Premium card and the panel read `Price unavailable`.<br>Shots: `shots/a/journey-bad-premium-{1-card,2-page,3-premium}-{1440,1280}.png` |
| G288-AUTH | PASS | Dev :5173, fresh context, 0 cookies, both viewports:<br>• `/studio-lab` shows the workspace and the `Demo collection — no sign-in required` badge, with 2 Add buttons and `auth_user` null;<br>• `/studio/middle-east` shows `Sign in required`, 0 `audio[src]` and no workspace;<br>• the token API with no header returns 401;<br>• with a fake bearer it returns 403 `Unable to verify ownership`: not 200, no token (`probe/auth-dev.json`, `shots/auth/`) |
| DOC-215 | PASS | Line 4 is byte-exact `**სტატუსი:** Completed (C round 288 PASS)`. The H2 headings follow TEMPLATE's order. Every cited id exists: PR5, PR7, PR9, PR10, VC1, VC4, VC5, PC1, PC2 and SC1 in the tests, and N1, N6–N10 in the mutant scripts |
| gate | not claimed | The full suite, build, Biome, `verify` and `test:e2e:smoke` are gate rows |

**BLOCKED (backend unavailable in cloud):**
- the owned-Standard upgrade state in the browser (unit VC3/VC4 carry it);
- the real-backend 403 for `/api/studio-token`.

Neither makes `browserVerified` false.

## Conformity
- **CZABA requirement (F9 card = page):** met for this round's fixtures.
- **Ableton conformity:** does not apply (a Store fix-up). This round touches no Studio audio, transport or export code, so no audio-graph, timing or export rows apply.

## Observations (info, no bug)
- **Fixture count:** B's "10 active fixtures" is 11 in the actual mock. All 11 were checked.
- **Panel reason line:** on `bad-premium-track` with Premium selected, the panel adds the reason line `Price unavailable — contact us to buy it.`, so the version cards shift down 27 px (y 308 → 335). This is the round-286 behaviour, the same as `priceless-track`; it is not caused by this round.
- **A's Architecture note:** three hand-matched `leading-*` "Price unavailable" spans, plus `productAdapter.ts` `premiumPrice` unvalidated. Forwarded to B as a signal.

## Cleanup
- :3287 and :3288 are stopped. My mock is stopped.
- The standard `mock-api/server.mjs` is running again, with health `products: 8`. Exactly one `node server.mjs` process runs (PID 8881 = `c-round-288/mock-std.pid`).
- The live tree is unchanged: `git status` = 7 paths, sha256 7/7 OK.
- No app source was edited.
