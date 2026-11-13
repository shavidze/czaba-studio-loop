# Sketch review — round 485 (CLIENT-NAV-CONTRACT)

Reviewer: `tech-lead` (read-only), consulted by B on 2026-11-13. Contents as returned, condensed by B. B's rulings are marked **Ruling**.

## v1: `b-round-484/sketch-485-v1.patch.txt`
- sha256 `51876f9e9596731a26ea46cb96bc4e2bd704fdcf9ed25b2546559f3a3d22d167`.
- **Verdict: REQUEST CHANGES**

| # | Severity | Finding | Ruling |
|---|---|---|---|
| 1 | High | The h1 fallback reads the `account.tsx` layout `<h1>Account</h1>` first on `/account/orders` and `/account/reset/*`, so those pages are announced as "Account". Fix: add `meta` titles to the 6 title-less routes (also WCAG 2.4.2) | Fixed in v2: `meta` on cart, search, account, account_.login, account.orders, account.reset.$id.$token |
| 2 | Medium | The Store-branch fallback is untested; it relies on PageTransition's inner key | Fixed in v2: RA9 (`createMemoryRouter` + `router.navigate`, `isStudioPage=false`, empty title); mutant M2 is red on RA9 |
| 3 | Medium | RA6 counts regions but does not prove the node survives | Fixed in v2: `toBe(regionBefore)`; mutant M11 (keyed region) is red on RA6 |
| 4 | Low | No own test for the name reader | Fixed in v2: `app/lib/__tests__/route-name.test.ts` RN1–RN3; mutant M2b is red on RN2 |
| 5 | Low | `docs/technical` note | Ruled: doc 313 (Georgian implementation doc) is the record |
| 6 | Low | A plain function was exported from the component file | Fixed in v2: `app/lib/route-name.ts` |
| 7 | Low | RA4 compared with trim only | Fixed in v2: exact text with `String.fromCharCode(160)` and the reset on the third arrival |
| 8 | Low | The link-focus hardening is bundled | Ruled: it is part of the systemic task CLIENT-NAV-CONTRACT (D-29z1704) and closes 3 Lows; root decides commit boundaries |

The reviewer's full-suite run had 6 failures in its partial copy (repo-scan files it did not copy). B's run on the full scratch is green: `precheck-full.log`.

## v2 (dispatched): `b-round-484/sketch-485.patch.txt`
- sha256 `3f06149c6bdd650ae79603488e03f46cbdd44d928aae293ca4a6d9db676ad1d3`.
- **Verdict: APPROVE** (delta re-review).
- All 8 earlier findings are resolved or acceptably ruled; tsc rc 0; Biome adds no warning on changed lines; the 3 targeted files pass (29 tests).

| # | Severity | New finding | Ruling |
|---|---|---|---|
| N1 | Low | `account.downloads.tsx` (protected) has no meta, so it inherits "Account \| CZABA"; `/account` → `/account/downloads` repeats that text with the repeat mark, and the page h1 is "My Downloads" | Recorded as deferred Low **B-R485-DOWNLOADS-TITLE**, with root request ROOT-REQ-DOWNLOADS-TITLE (`title: 'My Downloads \| CZABA'` in the protected file). Doc 313 lists it under TODO |
| N2 | Low | In `account.tsx` the new `import type` line sits above the existing leading comment | Accepted as is: Biome passes and the sketch stays byte-equal. Recorded under the same deferred id note; no new id |
| note | — | `studio.$productId.tsx` (protected), `api.subscribe` and `sitemap[.]xml` (resource routes) have no meta | Outside this task |

## Mutants (on the v2 sketch)
12 mutants (M1–M11, M2b), all red on their named rows; see `b-round-484/mutants/red-rows.txt` and `mutants-summary.txt`.
