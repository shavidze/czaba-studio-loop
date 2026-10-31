# A — Round 288: FIX-PD-1a2 fix-up (C-R287-01 line box + A-R287-PREMIUM-UNVALIDATED)

**Status:** implementation complete; awaiting C. The doc's l.4 claim is pending C (L28).

## Checkpoint / claims
- `claims-288.sh` was run from `store/` before editing. Its output is byte-equal to `b-round-287/claims-288-output.txt` (`diff` empty).
- No STOP condition hit.

## Changed files (vs A's round-287 tree = `b-round-287/k2-snapshot/`)

| Path | Change vs K2 |
|---|---|
| `app/routes/store.tsx` | l.559 unknown branch → `'text-sm leading-8 font-light text-muted'` (1 line; the known branch is byte-identical) |
| `app/components/product/ProductCard.tsx` | l.162 unknown branch → `'text-sm leading-7 font-light text-muted'` (1 line; the known branch is byte-identical) |
| `app/lib/product-utils.ts` | l.105 → `price: isValidCatalogPrice(product.premiumPrice) ? product.premiumPrice : undefined,` (1 line). l.100 `if (product.premiumPrice) {` is unchanged |
| `app/lib/__tests__/product-utils.test.ts` | PR10 appended (only `+` lines vs K2) |
| `app/lib/__tests__/product-price-cards.test.tsx` | exactly the three §3.1 `-` lines (PC1, PC2 → `not.toContain('leading-7')`, SC1) replaced; VC5 appended |
| `docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md` | l.4 → `**სტატუსი:** Completed (C round 288 PASS)`; 2 Problem→Solution entries; Testing gains PR10, VC5, N7–N10 and the smoke; TODO gains A-R287-ARCH-ADAPTER-ZERO |
| `app/components/product/VersionSelector.tsx` | **unchanged** (sha256 = K2) |

`git status` lists exactly the 7 K2 paths. The diff stat vs HEAD is 5 M files, +108/−13, plus the 2 untracked files.

### sha256 (final tree)
```
16b0c102ac0a01dff15adbfefd181f3c8a163a00a01a8999ec7fd43e49eb12a7  app/components/product/ProductCard.tsx
539f28fc433fce02aa8362f1331b3288bf07846bc06c3ce0fcd6a76ccbbebf93  app/components/product/VersionSelector.tsx
b8c42d68d20ebbc9dd23e38e72bcdb61c5fd131246c281efb1516788c5d61292  app/lib/__tests__/product-utils.test.ts
d010869689968a1f39fa31df81e874305a489ccaae164b1c44babbd618a6329c  app/lib/product-utils.ts
bbdd798d04accdc03d60a9270213b82fd2335db51c8027b9a71e77da61d6c9a5  app/routes/store.tsx
ee0abf87a11215b0cbf9dc2d97bce55b2e7f89d731947066c7bd1cf1ec6b573e  app/lib/__tests__/product-price-cards.test.tsx
bbed589bb81d170f78cde71891d3c1f38f10fb7aa7b958e80e71e0dd652d3053  docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md
```
Also in `a-round-288/post-edit-sha256.txt`.

## Tests actually run
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0. There are warnings only, and none is on a changed line. `biome check` on the 5 owned code files reports 6 warnings, all pre-existing `useButtonType` at `store.tsx:227–323`. `biome format` applied no fixes.
- `npx vitest run` on the 7 `b-round-286/covering-files.txt` files plus `product-price-cards.test.tsx`: **8 files / 136 tests passed**.
  - Expected: 8/136, as the task says.
  - `store-focus-ring` + `store-theme-tokens` run separately: **2 files / 48 tests passed** (theme-tokens 38, focus-ring 10).
- Full suite / `verify` / build: not run (speed rules; gate rows).

## Mutants (`a-round-288/mutants.py`, extends `a-round-287/mutants.py`; result `a-round-288/mutants-result.json`)

| Mutant | Red rows | Required | Tree restored (sha) |
|---|---|---|---|
| N1 | VC1, VC2, PR5, PR7 | — (r287) | yes |
| N2 | VC1, VC2, VC3, VC5 | — (r287) | yes |
| N3 | PC1, SC1, PR9 | — (r287) | yes |
| N4 | PC1 | — (r287) | yes |
| N5 | VC3, PR8 | — (r287) | yes |
| N6 | VC3 | — (r287) | yes |
| **N7** | SC1 | SC1 ✔ | yes |
| **N8** | PC1 | PC1 ✔ | yes |
| **N9** | VC5, PR10 | PR10, VC5 ✔ | yes |
| **N10** | VC5, PR10 | PR10 ✔ | yes |

After all the mutants ran, the whole tree sha256 matched `post-edit-sha256.txt`.

## Browser smoke (1440×900 only, Playwright Chromium, dev :5173 = A's tree)
**Setup**
- **Mock:** `a-round-288/mock-a288.mjs` = a copy of `c-round-287/mock-c287.mjs` plus `bad-premium-track`: id 13, Track, no `variants`, `standardPrice` 19, `premiumPrice` −5.
- **Starting state:** no mock was listening on :5199 at the start, so there was no standard-mock PID to stop.
- **Restore:** at the end the standard `mock-api/server.mjs` was started (`/api/products` → **products: 8**; PID in `a-round-288/mock-std.pid`).
- **Scripts:** `a-round-288/smoke.cjs` (result `smoke-1440.json`) and `diffcards.cjs`. Screenshots: `shot-store-1440.png`, `shot-home-1440.png`, `shot-bad-premium-standard-1440.png`, `shot-bad-premium-selected-1440.png`.

**Results**

| Handle | `/store` card h | `/store` label lh/fs | home `article` h | home label lh/fs |
|---|---|---|---|---|
| priceless-pack | 589.6 | `Price unavailable` 32px / 14px, rgb(163,155,142) | 417.6 | 28px / 14px |
| priceless-track | 589.6 | `Price unavailable` 32px / 14px | 417.6 | 28px / 14px |
| free-pack | 589.6 | `$0` 32px / 24px | 417.6 | `Complimentary` 28px / 18px |
| middle-east | 589.6 | `$29` | 417.6 | `$29` |
| bad-premium-track | 589.6 | `$19` | 417.6 | `$19` |

- **Line boxes:** `leading-8` computes to 32px and `leading-7` to 28px, so the STOP condition is not hit.
- **Price line tops in one row are equal.** `/store`: priceless-pack and free-pack are both at 1791.2. Home: every card is at 1594.6.

**`/products/bad-premium-track`**
- The version cards read `Standard $19` (selected) and `PREMIUM Premium Price unavailable`. Both are 162 px.
- The page has no `$-5` and no `NaN`.
- After clicking Premium, the panel and the card show `Price unavailable` (2 occurrences). `Add to Cart` and `Buy Now` are both `aria-disabled="true"`, and there is no `$-5` or `-$5`.

**Fixture caveat for C.** My first `bad-premium-track` description wrapped to 2 lines, which made its `/store` grid row (shared with `priceless-track`) 609.6 tall. That came from the fixture text, not from the line box: `diffcards-a288mock.json` and `diffcards-c287mock.json` show `priceless-track` at 589.6 with C's 9-fixture mock. I shortened the description to `'A round 288 Track fixture, bad Premium.'`, and every card then measured 589.6. **C should keep the `bad-premium-track` description to one line**, or B-LINE-BOX's "= 589.6" can fail for that row for a reason unrelated to this change.

**Readiness check note:** `curl /api/products/bad-premium-track` returns `Not found` even while the mock serves it. Use the list endpoint `/api/products` or the rendered product page as the readiness check.

**Not run by A:** 1280×720, the HEAD comparison, B-JOURNEY across all 10 fixtures and G288-AUTH. These are C rows.

## code-reviewer (actual subagent run)
Score 8.5/10. No Critical, High or Medium findings.

| Finding | Severity | Action |
|---|---|---|
| The `premiumPrice: NaN` presence rule (no Premium) is not pinned | Low | **Addressed.** One more assertion inside PR10 (NaN → `['Standard']`), inside my own appended row. This is in-grant: task §9 already attributes the NaN presence rule to "PR10, N10". Re-ran the 8 files (136 pass) and all mutants (same red rows) |
| PC2 `not.toContain('leading-7')` is weaker or broader than an exact class pin | Low | **Not changed.** B mandated this exact string in §3.1, and the positive pin plus `not.toContain('Price unavailable')` hold the real check. Proposal for B: `not.toContain('text-sm leading-7 font-light text-muted')` in a later round if wanted |
| The doc states round-288 smoke numbers | Low | No action needed: the smoke was actually run (evidence above) |
| Info | — | `VersionSelector.tsx:105` keeps a 20px unknown span next to `text-xl`. It is frozen, and C measured the version card unaffected (124 px), as are my 162 px `bad-premium-track` cards. `productAdapter.ts:85,126` also uses `premiumPrice` unvalidated (frozen services; same family as A-R287-ARCH-ADAPTER-ZERO) |

**Architecture note (signal for B, not acted on):** the "Price unavailable" span now lives in 3 places with hand-matched `leading-*`: `store.tsx:559`, `ProductCard.tsx:162` and the frozen `VersionSelector.tsx:105`.
- Proposal: one bounded task for a shared unknown-price label (a component or class constant taking the matching `leading-*`), once VersionSelector is unfrozen.
- Low cost, no audio or auth risk.
- Also re-signal A-R287-ARCH-ADAPTER-ZERO, extended to the adapter's `premiumPrice` at `productAdapter.ts:85,126`.

## B acceptance status (A-side only; C decides)
- §2.1, §2.2, §2.3 edits: done, exact.
- §3.1 replacements and §3.2 PR10 and VC5: done. PR10 has one extra NaN assertion (reviewer Low).
- §3.3 mutants: N7–N10 red at the required rows, N1–N6 re-run.
- §5 doc: done.
- §6 steps 1–8: done.
- C rows (B-LINE-BOX, B-PREMIUM, B-KEEP-287, B-JOURNEY, G288-AUTH, both viewports): **not claimed**. My 1440 smoke only indicates them.

## Exact next C checks
1. CLAIMS on the `096fa4b` archive + k2-snapshot.
2. SOURCE-SCOPE: diff vs k2-snapshot. Expect exactly the lines above; `product-utils.test.ts` has only `+` lines.
3. UNIT 8 files / 136 tests; PR10 and VC5 each appear once.
4. UNIT-MUTANTS N7–N10.
5. B-LINE-BOX at 1440 and 1280 vs the HEAD build, with a one-line `bad-premium-track` description.
6. B-PREMIUM with the HEAD `$-5` screenshot.
7. B-KEEP-287.
8. B-JOURNEY (10 fixtures).
9. G288-AUTH.
10. DOC-215.

## Known gaps
- No 1280 or HEAD-build measurement by A.
- The owned-Standard upgrade state in the browser is BLOCKED (backend unavailable in cloud); unit VC3 and VC4 carry it.

Scope completed: the round-288 A task only. The backlog is not marked complete.
