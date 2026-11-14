# Sketch review, round 504 (DPG-BUTTON-CLEANUP-2 stage 2c, PurchaseHeader)

Dispatched sketch: `b-round-503/sketch-504.patch.txt` = v3, sha256 `84cc9df33deee81e1de91f33c952b7689593c97b1b0003c30b79c41538dae03d`.
History: v1 `ce4b1105569dd923a5ae81de9581dd42667ff7db566e71205bb80958e9e9c6e6` (review 1) → v2 `c776999d9a11adab48790b518196b73595aef047534f28ed51e58590e4757e96` (review 2, delta `sketch-delta-v1-v2.diff.txt`: only the B2C-5 test title) → v3 (review 3, delta `sketch-delta-v2-v3.diff.txt`: three doc 325 lines). `PurchaseHeader.tsx` and DESIGN_SYSTEM are byte-identical in v1, v2 and v3.

## Review 1: tech-lead on v1 (sha256 ce4b1105569dd923a5ae81de9581dd42667ff7db566e71205bb80958e9e9c6e6)

**Verdict: APPROVE.** No Critical, High or Medium. Purchase behaviour is unchanged in effect, and no touched line breaks a project rule.

| # | Severity | Finding | B ruling |
|---|---|---|---|
| 1 | — | Rule compliance: no `any`/`@ts-ignore`/`as`; semicolons; tokens only (`min-w-[160px]` is a size); no new comments. Dropping `group` is safe (the only `group-hover` is inside the untouched `motion.button`) | no action |
| 2 | — | Purchase protection: `handleBuyNow`, `handleAddToCart`, auth gate and `isDisabled` byte-identical to HEAD. `Button` destructures `disabled`/`className`; `type`/`onClick` reach `<button>` via `{...props}` and cannot override them. Native `disabled` still blocks click and Enter; `pointer-events-none` only adds. "Upgrade to Premium" is never disabled. The global `button:active:not(:disabled)` scale still applies. Journeys equal HEAD (3 POSTs, 1 checkout on J3/J4; anonymous Buy Now 0 POSTs); only `pointerEvents auto→none` and the busy background differ (D5) | no action |
| 3 | Low | B2C-5's title says "disabled without hover"; jsdom cannot observe hover | **Fixed in v2:** "… and is disabled with the builder busy class" |
| 4 | Low | B2C-2's title under-claims (it also pins the Downloads class) | accepted (under-claiming is allowed by L58) |
| 5 | Low | `vi.mock` factories are untyped partial objects; a hook shape change stays green | same pattern as earlier stages; `confirmedBy` on A-R503-CR-3-STUBCATALOG-DRIFT (D-29z1815) |
| 6 | Low | full-string oracles are brittle to builder changes; B2C-8 counts 1 builder call and 2 `<Button>` and will need updating at NONBRAND | intended ratchet; tied to the builder by B2C-0; `confirmedBy` SIG-R501-SHARED-BUTTON-SCANNER |
| 7 | Info | B2C-2 and B2C-6 have only co-red mutants (M1/M2, M6); no mutant removed `type="button"` | **Added M13** in `mutants-504.py` (drops `type="button"` on Upgrade → B2C-3 red) |
| 8 | Low | doc 325 l.4 already says "C round 504 PASS" and cites `a-round-504/` / `c-round-504.json` | the L28 contract (post-PASS value, true only at HEAD; C11 checks it byte for byte). No change |
| 9 | Info | pre-existing stale comment `{/* Upgrade Now - Brand color */}` above "Unlock Premium" | not in the sketch (comment-only edits are outside this stage); recorded as TL-R504-STALE-UPGRADE-COMMENT (info, deferred) |
| 10 | Info | 8 px brass next to 12 px siblings | accepted by product-designer until NONBRAND (doc 325 D1, TODO) |

## Review 2: tech-lead delta review on v2 (sha256 c776999d9a11adab48790b518196b73595aef047534f28ed51e58590e4757e96)

**Verdict: APPROVE.** The delta is only the B2C-5 title (plus the new-file index hash). The title is accurate (the body pins `PRIMARY_LG_CARD_ACTION_BUSY`, which includes `opacity-50 cursor-not-allowed pointer-events-none`) and a valid single-quoted string; tsc and Biome rc 0. No assertion lost. M13 turns B2C-3 red; M1–M13 match their expected rows, restored rc 0.

## Review 3: tech-lead delta review on v3 (sha256 84cc9df33deee81e1de91f33c952b7689593c97b1b0003c30b79c41538dae03d)

**Verdict: APPROVE.** The delta changes only doc 325: the three sentences B's closing check found false (docs 320–322 and 324 are the button stages, 323 is the cart-layout doc; B2C-1…B2C-7 render five states including the anonymous buyer; B2C-8 reads the file while B2C-9 self-tests the scanner) plus the new-file index hash. Each corrected sentence is true against the tree, and every other doc 325 line matches the code, the test file and `probe/compare-504.txt`, `sketch.out`, `sketch-journey.out` (D2 ≤ 2 px, contrast 8.32/10.28, D5 busy, J1–J5).
- Wording note, not a blocker: "ერთ checkout POST-ს" is literally true; each Unlock journey also sends `/api/cart/items` and `/api/payments/checkout` once each (C7 lists all three).
- On v3, B re-ran: full suite 301/4,363 rc 0, build rc 0, covering 6/79 (slowest 368 ms); check 4 regenerated. Mutants unchanged (no mutated file differs from v2).
