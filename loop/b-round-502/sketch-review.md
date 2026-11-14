# Sketch review, round 503 (DPG-BUTTON-CLEANUP-2 stage 2b-3)

Dispatched sketch: `b-round-502/sketch-503.patch.txt` = v2, sha256 `210ee87281cb09de3720c125b9eb55ae94cd6b8e11bce92468b1090c0271aed9`.
History: v1 `1a71603227124f2d886c12645144f3592876d48f1ddd5c99dee83642bc9903a3` (review 1) → v2 (review 2, delta `sketch-delta-v1-v2.diff.txt`). The three component files are byte-identical in v1 and v2; v2 changes only the test file, DESIGN_SYSTEM's two-shapes sentence and two doc 324 sentences.

## Review 1: tech-lead on v1 (sha256 1a71603227124f2d886c12645144f3592876d48f1ddd5c99dee83642bc9903a3)

**Verdict: APPROVE WITH CONDITIONS.** Summary of the reviewer's findings (full text kept in this planning session; quoted points below are verbatim in substance):

| # | Severity | Finding | B ruling |
|---|---|---|---|
| 1 | Medium (condition) | three `as Element` casts in `store-button-cleanup-2b3.test.tsx` (l.224, l.230, l.300) break CLAUDE.md "no type assertions"; narrow instead | **Fixed in v2:** a `requireElement(node)` guard (`instanceof Element`, throws otherwise) replaces all three; `upgrade?.` optional chaining dropped. Mutants M2, M3, M4, M11, M14 re-run red on v2 (`mutants-503.txt`) |
| 2 | Info | `as const` on the `it.each` tables is a const assertion and allowed (46 files use it) | B removed it anyway (strict reading): typed tables `UPGRADE_CASES: Array<[PurchasedVersion, string]>`, `NO_UPGRADE_CASES`, `NO_SCENE_CASES`; `npm run typecheck` rc 0 on v2 |
| 3 | Low | B2B3-6's `toBe(1)` builder count is brittle (a future second builder use in `cart.tsx` would fail it); the scanner already catches M1/M6/M10 | **Fixed in v2:** `toBeGreaterThanOrEqual(1)`; row title now "… and call the builder" |
| 4 | Low | DESIGN_SYSTEM's sentence after the shape table still limits 8 px to dialogs and form submits | **Fixed in v2:** "dialog-ებზე, Store-ის ფორმის submit-ზე და შეტყობინების შიგნით მოქმედებაზე (cart-ის „Upgrade“) 8px." (C11 now expects 3 changed DESIGN_SYSTEM lines) |
| 5 | Low | doc 324 omits that the cart item card also grows 219 → 225 px | **Fixed in v2:** D1 sentence adds the card (and the unchanged 375 card 323 px) |
| 6 | Info | every doc 324 figure matches the probe (notice 64→70 / 168, 104×32→104×44, 500→600, 4→8 px, contrast 9→8.32/10.28, scene 131×44 and padding, browse 257×58→241×48, section 1454→1445 / 1713→1703); D3 reasoning holds (`button:active` scale rule does not apply to `<a>`); the duplicate label exists (`_index.tsx` view-all) | no action |
| 7 | Info | the partial `~/hooks` mock replaces only data sources; ownership logic and the `owns_same` gate run for real; B2B3-4 waits for the heading before the absence check; `RequireAuth` is stubbed (auth gating out of scope, covered by C12 in the browser) | no action |
| 8 | Info | at 375 px the ownership notice text column is squeezed to 79 px and wraps to 3 lines on HEAD and sketch (pre-existing) | recorded as deferred Low **TL-R503-CART-NOTICE-375-SQUEEZE** (D-29z1810); a stacked layout below `sm` is a layout change for product-designer/Saba, not this stage |
| 9 | Info | the three component sites need no changes; `className` adds only classes the builder does not set; no inline styles or hardcoded colours (the removed `text-black` was one) | no action |

Reviewer's process notes: patch identity matched; the new test 12/12 in the reviewer's own copy; pre-check logs (tsc rc 0, lint 179, Biome 6, build rc 0, covering 122/122, full 300/4,353 rc 0); M1–M16 red on their rows; neighbour probes `nb-head` = `nb-sketch`; journeys equal.

## Review 2: tech-lead delta review on v2 (sha256 210ee87281cb09de3720c125b9eb55ae94cd6b8e11bce92468b1090c0271aed9)

**Verdict: APPROVE.** No new findings.
- Conditions 1, 3, 4, 5 met; `as const` gone as well (typed tables; `PurchasedVersion` includes `null`); `tsc --noEmit` rc 0 in the reviewer's copy; no ` as ` left in the test.
- B2B3-6 is not vacuous: the scanner result is still asserted `[]` and each file needs ≥ 1 builder call (one each today); M1, M6, M10 still turn it red.
- The doc 324 sentences touched by the delta match `probe/head.out` / `probe/sketch.out` (card 219 → 225 at 1440/1280; 375 notice 168 and card 323 unchanged); the B2B3-7 doc sentence describes a case already in the test.
- No assertion lost (2 + 3 + 2 table rows kept; B2B3-1/B2B3-5 bodies keep every `expect`); 12/12 green; M1–M16 OK, restored rc 0.

## B ruling after review 2 (covering set, not a sketch change)
- `store-button-cleanup.test.tsx` (BC1b) is removed from the covering set, because it tests the unchanged `Button.tsx`. **Correction (D-29z1811):** BC1b declares `BC1B_TIMEOUT_MS = 20_000`, so its times are 12–13 % of its timeout and there is no L31 issue; the "51 % of a 5 s default" first written here was wrong. Run inside the parallel covering set, BC1b took 2,348 ms and later 2,562 ms. Run alone, it took 1,037–1,102 ms over two series of three runs (`bc1b-alone.log` keeps the second: 1,067 / 1,037 / 1,049 ms). Gate 502 measured 2,248 ms.
- The file tests `Button.tsx`, which this round does not change, and no rows land in it. The gate's full suite still runs it.
- The render cost is GATE497-L5-BC1B-RENDER-COST (deferred Low); `confirmedBy` this measurement (D-29z1810).
- The covering set is now 12 files / 115 tests (`precheck-covering.log`), and its slowest test takes 541 ms.
