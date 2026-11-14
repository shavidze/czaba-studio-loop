# Round 511: DPG-BUTTON-CLEANUP-2-NONBRAND stage N2, the purchase card. Buy Now, "Open in Studio", "Downloads" onto the Button system; Add to Cart aligned to its shape

**Planned by:** B at the round 510 → 511 planning, 2026-11-14 (`b-round-510.md`, `b-round-510/checkpoint.md`). Round 510's task is archived as `tasks/round-510.md` (byte copy).
- **Advisor:** available; consulted after orientation and before hand-off.
- **Consults (run, saved):** `product-designer` (`b-round-510/consult-product-designer.md`), `tech-lead` sketch review (`b-round-510/sketch-review.md`, Verdict: approve).

## Decisions (`backlog.json`, `decisions_log_b`)
- **D-29z1850:** round 510 (RETRO 510) accepted: C PASS, `browserVerified`/`realVerified` true. Gate 510 is `skipped` ("no real changes"), not published, so the baseline stays `f5d1b9e` [K1] [K3].
- **D-29z1851:** C's three Lows on the retro (C510-RETRO-MEDIAN-IS-MEAN, C510-LESSON-LINE-UNIT, C510-RETRO-REMAINING-79) are corrected by an errata in `retros/retro-510.md` (before-copy `b-round-510/retro-510-before-errata.md`, diff `retro-510-errata.diff.txt`); C checks it in row C11. INFO-C510-COLD-HYDRATION and C's RT-SABA observation are recorded. The round-382 "no auto-start" ruling (GATE384-L3-PLAY-REFUSE-AUTO-START) goes to Saba once as SABA-Q-511-SPACE-AFTER-ADD (L44).
- **D-29z1852:** this round = NONBRAND N2 on PurchaseHeader only. **PlayStemsButton leaves N2:** it can never render. No producer sets `DisplayVersion.stems` [K9], and B's browser probe selected Premium on harbour-lights (whose variant already has `includesStems: true`) and counted 0 "Play Stems" at 1440/1280/375 [K18]. The only caller of `openStemsPlayer` is that button [K11]. Filed as B-R510-PLAYSTEMS-UNREACHABLE (Medium, `awaiting_user`; question SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE; product-designer's recommended default: remove). The stems half of ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE is corrected: a mock fixture cannot help, because the mapper drops `stems`.
- **D-29z1853:** the NONBRAND scanner misses `motion.*` tags. A widened copy (`b-round-510/scan-nonbrand-motion.py`, proven on a mutant [K8]) finds 54 at HEAD; the only new hit store-wide is CartButton (`motion.button`). N3–N9 counts use the widened scanner from now on.
- **D-29z1854:** sketch-review follow-up B-R510-BUSY-CURSOR-HIDDEN (Low, deferred): the shared Button adds `pointer-events-none` while disabled, so busy Buy Now no longer shows the not-allowed cursor.

## Rules
- **Read `lessons.md` first.** Applies: L1, L4, L10, L11 (strengthen-only), L12, L23, L29, L36, L47, L52, L54, L56, L57, L58, L59, L60.
- **RC-R510-SKETCH-SCOPE trial.** B wrote a byte sketch for the product hunk only (`PurchaseHeader.tsx`). A writes the tests and the doc against `b-round-510/test-contract-511.md` (v2).
- **STOP threshold (L10, one clause).** Write "STOP — needs B ruling" and change nothing more if a Medium-or-higher finding needs a change outside the grants, a test outside the grants fails, a covering test takes > 2,500 ms, a frozen check is not rc 0, or a protected file would need to change. Reviewer findings on A's own test lines are fixed in-round under L11 strengthen-only.
- **Pre-ruled (not STOPs; list under "For B" if raised again):** (1) B-R510-BUSY-CURSOR-HIDDEN; (2) the owned-card links lose the brand/accent outline (SABA-Q-507-OUTLINE-VARIANT, default no); (3) CartButton stays hand-rolled for colour (named exception, product-designer option b); (4) where the row wraps, bordered and borderless buttons differ by 2 px in height (Button system: secondary 50, primary/buy 48); (5) PlayStems untouched (D-29z1852).
- **Ruling lines (L4):**
  - Buy Now class: the sketch (byte-equal) wins over B2C-7's HEAD class pin; B2C-7 is granted and rewritten.
  - PurchaseHeader source counts: the sketch wins over B2C-8's counts and ST5's `bg-buy` count; both are granted and rewritten per the contract.
  - Owned-card link colour: product-designer's secondary ruling wins over the HEAD brand/accent outline.
- **Purchase protection.** Protected files stay byte-identical (check 2). Buy Now keeps its handler, `disabled`, `aria-disabled` and `aria-describedby`. No new download path.
- **Persistent screen text (L39):** nothing added or removed; labels unchanged.
- **Reference-first:** Store, not Ableton. No external store page was fetched; the rule is the store's own Button system (one shape and one family per card) and the product-designer consult. Deviations: pre-ruled 2 and 3.
- **No full suite.** Full vitest, build, Biome-all and `npm run verify` are gate rows.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Baseline: HEAD `f5d1b9e`, clean tree
- Gate 509 published `f5d1b9e`; gate 510 skipped at the same head [K3]. At planning `git status` was empty [K2].
- **Frozen checks** (run from `store/`; all rc 0 at planning [K16]):
  1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/r511-tree-sha256.txt` — 1,425 tracked files, all except the grants.
  2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`.
  3. Before editing: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/r511-pre-sha.txt` (the three granted tracked files).

## 0. Why this round
- **No bug outranks it.** No Critical is open; the open High (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED) needs root (backend + protected `app/lib/auth.ts`). The other open Mediums are manual, root, Saba or scheduled items. Round 510's three Lows sit in B's own artifacts and are corrected here.
- **REGRESSION is not due:** `regression-last.json` = 2026-11-13; next on or after 2026-11-16.
- **Order:** D-29z1848 named NONBRAND N2 next; N2 is the purchase entry (product-designer stage 2).

## 1. Reference and product-designer ruling
| Point | Ruling | C row |
|---|---|---|
| Buy Now | `<Button variant="buy" size="lg">`; no `isLoading` (keeps spinner + "Processing..."); className `min-w-[120px] whitespace-nowrap aria-disabled:opacity-50 aria-disabled:cursor-not-allowed!` | C1, C3, C4 |
| Open in Studio (owned SFX) | Link with `buildButtonClassName({ variant: 'secondary', size: 'lg', className: 'whitespace-nowrap' })` | C2, C5 |
| Downloads (owned Standard) | the same secondary lg builder | C2 |
| Add to Cart (CartButton) | option (b): `rounded-md`, `px-6`, `text-base`, `font-semibold`; colours of all three states unchanged (named exception) | C1, C6 |
| PlayStems | out of N2 (D-29z1852) | C7 |

**States covered:** default; price-unknown (aria-disabled, focusable, reason); busy (native disabled); Adding / In Cart; owned SFX; owned Standard + Upgrade; keyboard focus.

## 2. What changes (grants: `b-round-510/grants-511.txt`, 5 paths)
| File | Change |
|---|---|
| `app/components/product/PurchaseHeader.tsx` | From `store/`: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/sketch-511-purchaseheader.patch.txt` (sha256 `de636ad4df0686c10264aa57261e5c747a39fede9178b94423f8fef8ae516d91` [K17]). Byte-equal; no other edit. At HEAD the four sites are the brand-outline Link, the accent-outline Link, the hand-rolled Buy Now `<button>` and the CartButton `motion.button` [K5] |
| `app/lib/__tests__/store-button-cleanup-n2.test.tsx` (**new**) | Rows N2-1…N2-9 exactly as in `b-round-510/test-contract-511.md` |
| `app/lib/__tests__/store-button-cleanup-2c.test.tsx` | Rewrite B2C-7 and B2C-8 per the contract (no assertion lost; equal or stronger). Nothing else |
| `app/lib/__tests__/store-theme-tokens.test.ts` | Rewrite ST5's PurchaseHeader part per the contract (including no `text-*`/`bg-*` on the buy tag). Nothing else |
| `docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md` (**new**) | The seven TEMPLATE headings in order (L26); l.4 exactly `**სტატუსი:** Completed (C round 511 PASS)` (L28). Names the four controls, the CartButton exception, D-29z1852 (PlayStems), SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE, SABA-Q-507-OUTLINE-VARIANT and only test rows that exist. Write `a-round-511/doc-ledger.md` mapping each behaviour sentence to a row id (L26) |

## 3. A: what to implement
1. Frozen checks 1–3 rc 0. Read primitives `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md` and `.claude/prompts/new-test.md`.
2. Apply the sketch, then write the tests and the doc. Semicolons, no `any`, no type assertions, no comments.
3. Run and save under `a-round-511/`:
   - `npm run typecheck` rc 0; `npm run lint` rc 0 with **174** warnings (HEAD 174, sketch 174 [K15]); `npx biome check` on the 4 granted code/test files rc 0, no fixes.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/covering-files-head.txt) app/lib/__tests__/store-button-cleanup-n2.test.tsx` → rc 0, 7 files, every N2 row present, no test > 2,500 ms. HEAD: 6 files / 83 tests [K14]; the new total is record.
   - **Mutants M1–M23** (contract) on a copy outside `store/` (`node_modules` symlinked); each named row red. Write `a-round-511/mutants.txt` (mutant, edit, red rows). A mutant that stays green on A's own test lines is fixed in-round (L11); one that needs a product-code change is a STOP.
   - **Scanner:** `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/scan-nonbrand-motion.py . /tmp/n2.json` → expected **51**: the 3 hand-rolled PurchaseHeader hits leave; CartButton's `motion.button` (padding + `rounded-md`, no `bg-brand` solid) stays as the named exception. HEAD 54 [K8]; the sketch value is record.
   - **code-reviewer** (≥ 3 files) on `git diff f5d1b9e` + untracked files; include its Architecture note.
4. Write `a-round-511.md`. No full suite, no build.

## 4. C: what to verify
Write `c-round-511.md`, `c-round-511.json` and `c-round-511/progress.json` as you go; browser rows first (L59).

**Environment.** Dev `:5173`; mock API `:5199` (start `node mock-api/server.mjs` from the loop root if `/__mock/health` fails; stop it by PID at the end). Init script: `localStorage czaba_lead_magnet_dismissed=1`, `sessionStorage czaba_entrance_seen=1`. B's harnesses: `b-round-510/probe/n2-states.mjs` (states ANON, UNKNOWN, OWNED_SFX, OWNED_STD, STEMS) and `n2-actions.mjs` (A1 signed-in Buy Now, A2 Add to Cart, A3 keyboard Buy Now, A4 price-unknown click, A5 keyboard Open in Studio). Copy them into `c-round-511/` and run `node n2-states.mjs <dir> c` / `node n2-actions.mjs <dir> c`. Signed-in states are **-STUBBED** (L36). Warm up once (L38). Expected values are B's sketch run (`b-round-510/probe/sketch/`) [K18] [K19]; values the round does not change are compared with B's HEAD run (`b-round-510/probe/head/`).

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start, end) | `git status --short --untracked-files=all`; frozen checks 1, 2; `git diff f5d1b9e -- app/components/product/PurchaseHeader.tsx` vs the sketch | only the 5 grants (3 M + 2 new); rc 0; PurchaseHeader diff byte-equal to the sketch |
| C1 | DEFAULT CARD (1440×900, 1280×720, 375×812) | n2-states ANON | Add to Cart and Buy Now: radius 8px, font-weight 600. 1440/1280: both 50 px tall ±0.5 with equal top (same flex line); widths 163 / 139 ±1. 375: 50 / 48 (wrapped, pre-ruled 4). Buy Now bg rgb(201,164,106), text rgb(14,13,12) |
| C2 | OWNED CARDS-STUBBED | OWNED_SFX, OWNED_STD, 3 viewports | The card's "Open in Studio" and "Downloads" links (not the 0×0 header nav "Downloads"): radius 8px, weight 600, bg rgb(29,26,23), text rgb(236,230,218) (13.94:1, `b-round-510/contrast.txt`), widths 187 / 160 ±1. "Go to Downloads" width 203 and "Upgrade to Premium" 230×48 equal to B's HEAD run; "Go to Downloads" height equals its same-line sibling (50 at 1440/1280) |
| C3 | PRICE UNKNOWN-STUBBED | UNKNOWN + A4 | Buy Now `aria-disabled=true`, not native disabled, opacity 0.5, cursor not-allowed, keeps focus after click; its `aria-describedby` element reads "Price unavailable — contact us to buy it."; 0 POST |
| C4 | BUY NOW SIGNED-IN-STUBBED | A1 | POSTs exactly `/api/cart/items`, `/api/cart/checkout`, `/api/payments/checkout` (1 each); busy: "Processing...", native disabled, spinner, width 167 (HEAD 167); `pointer-events` none is **record** (pre-ruled 1); lands on `/__stripe-stub` |
| C5 | KEYBOARD | A3, A5 | Tab reaches Buy Now and Open in Studio; `:focus-visible` true; outline `solid 1px` brass at 0.8, offset 2px (equal to HEAD); crop screenshots. Mouse-press ring is **record** |
| C6 | ADD TO CART | A2 | "Adding..." then "In Cart", both radius 8px; In Cart text rgb(201,164,106), width 140; 1 POST `/api/cart/items` |
| C7 | PLAYSTEMS UNREACHABLE | STEMS state (Premium selected) | "Play Stems" count 0 at 3 viewports (unchanged; evidence for D-29z1852) |
| C8 | ANON JOURNEY (L54) | 1440: `/store` → `/products/middle-east` → Buy Now → sign-in modal (email field 0 → 1) | a screenshot per step; 0 page errors except the expected cloud ones |
| C9 | TESTS + MUTANTS | the §3 covering command; mutants M1–M23 on a copy outside `store/` | rc 0, 7 files, N2-1…N2-9, B2C-7, B2C-8, ST5 present, none > 2,500 ms; each mutant red on its named row; copy removed |
| C10 | GREP + SCANNER | from `store/` | `grep -c '<button' app/components/product/PurchaseHeader.tsx` = 0; widened scanner 51 with exactly one PurchaseHeader entry (the CartButton `motion.button`); `grep -c stems app/lib/product-utils.ts` = 1 (unchanged [K9]) |
| C11 | RETRO ERRATA | `diff b-round-510/retro-510-before-errata.md retros/retro-510.md` | only the three corrected sentences and the appended "Errata" section; values: median $15.65 / mean $17.13 (from `b-round-509/data/cost-rows.json`), 4,771 bytes (`LC_ALL=C awk` on `b-round-509/lessons-before-510.md`), 61 = 79 − 18 |
| C12 | DOCS | doc 330 + `a-round-511/doc-ledger.md` | 7 headings in order; l.4 byte-equal `**სტატუსი:** Completed (C round 511 PASS)`; every cited row exists; the ledger maps each behaviour sentence |
| C13 | PROTECTION + STUDIO | fresh context, no credentials, 1440 and 1280 | `/studio/middle-east` and `/account/downloads` show "Sign in required" and no download link; `GET /api/studio-token?product=middle-east&file=stem.mp3` without Authorization = 401 with no URL; `/studio-lab` opens the demo; check 2 rc 0 |
| C14 | CLAIMS + L57 | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/claims-511.sh` vs `b-round-510/claims-511-planning-output.txt`; `python3 -I tools/l57-check.py c-round-511.json c-round-511/l57-check.txt` | no MISSING; only K2 (tree), K5 (sites changed), K8 (scanner), K16 (pre-sha) differ as A's change implies; L57 rc 0 |

- **Gate rows** (in `gate`, never `passed`): full vitest suite, build, Biome-all, `npm run verify`.
- **Blocked:** none expected. A real signed-in purchase needs the backend (FREE-CHECKOUT-REAL-BACKEND and the ownership rows stay open); not part of this round.
- **L57:** write all L57 fields: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (`null`, reason "RC-R510 trial: B did not run mutants; C runs them on A's tree"), `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-510/precheck-full.log`), `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-510/precheck-full.log`, `b-round-510/probe/sketch/`).
- **L22:** an A STOP with no diff → C0, C13, C14 only. A STOP naming an unruled Medium+ is a short FAIL.
- **Neighbours that could break:** round 509's "Get it free" (store-sidebar-free-r509), the price-unavailable rows (product-price-unavailable), the Upgrade/Unlock cards (B2C rows), the product route loader (product-handle-route) — all in the covering set.
- **On closing:** C PASS with `browserVerified` true closes N2 for PurchaseHeader. PlayStems and StemsPlayerModal stay open under B-R510-PLAYSTEMS-UNREACHABLE.

## 5. B's pre-check (`b-round-510/`)
| Check | Result | File |
|---|---|---|
| States at HEAD and on the sketch (second dev server :5174 with its own Vite cache, L38) | 5 states × 3 viewports, 0 page errors | `probe/head/head-states.json`, `probe/sketch/sketch-states.json`, PNGs |
| Actions at HEAD and on the sketch | equal POST sets; busy width 167 both; focus ring identical; price-unknown equal | `probe/head/head-actions.json`, `probe/sketch/sketch-actions.json` |
| Scratch full suite on the sketch (`/home/runner/b510-scratch`) | 305 files; 3 tests fail, exactly B2C-7, B2C-8, ST5 (granted) | `precheck-full.log` [K13] |
| tsc on the sketch | rc 0 | `precheck-tsc.log` |
| Covering at HEAD | 6 files / 83 tests, rc 0, slowest file 2,224 ms | `head-covering.log` [K14] |
| Lint | HEAD 174, sketch 174 | `head-lint.log` [K15] |
| Scanner | old 53 / widened 54 at HEAD; mutant proof | `nonbrand-head-511.json`, `nonbrand-motion-head.json`, `scan-motion-mutant.txt` [K8] |
| Sketch review | tech-lead, approve; Lows folded into contract v2 | `sketch-review.md` |
| Claims | `claims-511.sh` K1–K20 | `claims-511-planning-output.txt` |

## 6. After this round
1. **REGRESSION** on or after 2026-11-16 (`regression-last.json`).
2. **NONBRAND N3–N9** (widened scanner), then PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE, the rest of DPG P1, DP gate, P2; STORE-2c…5; ARCH-SPLIT; REVIEW-RECOMMENDATIONS; the rest of the queue.
3. PlayStems / StemsPlayerModal wait for SABA-Q-511-PLAYSTEMS-WIRE-OR-REMOVE.

## Claims (`b-round-510/claims-511.sh`; planning output `b-round-510/claims-511-planning-output.txt`)
- **K1–K2:** HEAD and changed-path count. **K3:** gates 509/510. **K4:** c-round-510 verdict and bug ids.
- **K5:** the four PurchaseHeader sites at HEAD. **K6:** Button default `rounded-md`, `buy` variant, disabled classes. **K7:** radius tokens 8/12 px.
- **K8:** scanner counts (old 53, widened 54, motion hit = CartButton) and mutant proof.
- **K9:** `stems` producers in non-Studio app code and the PlayStems render condition; K9b: `MOCK_PRODUCT_DETAIL` (whose Premium version has stems) has no value importer outside `app/data/` (only types are imported). **K10:** PlayStems first commit. **K11:** `openStemsPlayer(` callers. **K12:** the hook's price guard.
- **K13:** scratch full suite. **K14:** covering at HEAD. **K15:** lint. **K16:** frozen pins. **K17:** sketch sha, l58/ledger checks, `c-round-510/l57-check.txt`.
- **K18:** state probes HEAD/sketch. **K19:** action probes HEAD/sketch. **K20:** artifacts present.
