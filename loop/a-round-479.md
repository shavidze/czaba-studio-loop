# A round 479 — DPG-FOOTER-LINKS

**Status:** implementation done. No STOP. Every C row is still unclaimed; C verifies.
**HEAD:** `75a6028`. Nothing committed.

## Pre-flight and claims
- `claims-479.sh` before the first edit is byte-identical to `b-round-478/claims-479-planning-output.txt`: `diff` empty, saved as `a-round-479/claims-pre.txt`. K1–K9 match, so there is no L11 STOP.
- Primitives and lessons: what I read and how much is listed under "Checks actually run".

## Changed files (exactly the 12 granted paths, K7 = 12, K8 = 0)
- I applied the sketch by copying its 11 files from `b-round-478/sketch-479/`; `sha256sum -c sketch-479.sha256` passed for all 11.
- Source files:
  - `app/lib/link-focus.ts` (new)
  - `app/components/layout/Footer.tsx`
  - `app/components/common/CookieConsent.tsx`
  - `app/components/home/ProductSection.tsx`
  - `app/routes/privacy.tsx`, `app/routes/terms.tsx`, `app/routes/faq.tsx`
- Test files:
  - `app/lib/__tests__/link-focus.test.tsx` (new; **differs from the sketch**, see K10 below)
  - `app/lib/__tests__/store-internal-links.test.ts` (new)
  - `app/lib/__tests__/store-header-footer.test.tsx`
  - `app/components/common/__tests__/CookieConsent.test.tsx`
- `docs/implementation/2026/quarter-IV/311-dpg-footer-links.md` (new). Its l.4 is exactly `**სტატუსი:** Completed (C round 479 PASS)`. It names D-29z1697, D-29z1698 and D-29z1699, and its headings follow TEMPLATE in order. The test ids it cites (LF1–LF3, IL1–IL4, F1–F3, CC1–CC6) all exist; I grepped them.

### K10 = 1: the one byte difference from the sketch
- **File:** `app/lib/__tests__/link-focus.test.tsx`.
- **What changed:**
  - `vi` is now imported, and `afterEach` calls `vi.restoreAllMocks()`.
  - LF1 and LF2 each spy on `document.body.focus` and assert that it was called with `{ preventScroll: true }`.
  - No `it` was added, so the count stays at 162.
- **Why:** the code-reviewer's Medium (L52). With the sketch's tests, a mutant that replaces the helper body with `event.currentTarget.blur()` stays green, because jsdom's `activeElement` is `body` either way. D-29z1698 says `blur()` does not fix the bug in the browser, so the test now tells the two apart.
- **Proof** (scratch copy under `a-round-479/scratch`, made the way C4 describes, then deleted; logs kept; each run covers the 4 C4 test files, 48 tests):

  | Run | Result | Log |
  |---|---|---|
  | blur mutant | 2 failed: LF1 and LF2 | `a-round-479/mutant-blur.log` |
  | (d) helper is a no-op | 11 failed, unchanged from B's count | `mutant-d-noop.log` |
  | (f) modifier guard deleted | 5 failed, unchanged from B's count | `mutant-f-noguard.log` |
  | real tree, before and after the mutants | 48 passed | `mutant-real.log`, `mutant-real-after.log` |

## Checks actually run (final tree)
- `npm run typecheck`: rc 0 (`a-round-479/typecheck.log`).
- `npm run lint`: rc 0 (`lint.log`). It reports the repo's existing warnings.
- Biome scoped to the changed code files (`npx biome check <11 code paths>`; Biome does not check the doc .md): rc 0, 6 warnings (`biome-scoped.log`).
  - The warnings are at CookieConsent l.73, l.79 and l.88 (`useButtonType`), ProductSection l.56 (`noArrayIndexKey`), and faq l.190 (`noArrayIndexKey`) and l.202 (`useButtonType`).
  - None of these lines is inside a diff hunk (`git diff -U0` hunks: CookieConsent 8 and 63–68, ProductSection 1–4 and 65–72, faq 2–7 and 166–172). I left them alone; changing them would be a drive-by.
- The task's vitest command (covering-candidates plus the 3 named files): **10 files, 162 tests passed, 0 failed** (`vitest.log`).
- No assertions were removed: `git diff -U0` on `store-header-footer.test.tsx` and `CookieConsent.test.tsx` has 0 removed `expect(` lines (`no-removed-expect.txt`).
- Claims after the last edit: `a-round-479/claims.txt`.
  - K1: `HEAD 75a6028`.
  - K2: `0 / 9`.
  - K3: 5 lines, each `0 / 1`.
  - K4: `license:0 collections.music:0`.
  - K5: exists, with the 5 files.
  - K6: all exist.
  - K7: 12 lines.
  - K8: 0.
  - K9: 0.
  - K10: 1 (explained above).
- `npm run check` (Biome, does not change files): rc 0 (`a-round-479/check.log`). It reports the repo's existing 191 warnings and 1 info.
- **Not run, by the speed rules (the gate runs these):**
  - `npm run verify`, the full suite, `npm run build` and `npm run test:e2e:smoke`.
  - The `/check` skill (`.claude/commands/check.md`) lists `verify` and the e2e smoke, so for the `/check` steps I ran only typecheck, lint, `npm run check` and the covering tests.
  - No browser checks by A; those are C's rows.
- **L11 test durations:** the vitest timeout is the default 5000 ms (`vitest.config.ts` has no `testTimeout`). The slowest covering test is track-layout "folds a lane to a 36 px…" at 1004 ms, about 20 %. No test is above 50 %, so there is no STOP.
- **L11, edited after review:** I changed `link-focus.test.tsx` after the first review, so the code-reviewer re-reviewed it: 9/10, no Medium or higher. It raised two optional Lows, which I did not apply:
  - `toHaveBeenCalledTimes(1)` in LF1 and LF2;
  - a `not.toHaveBeenCalled` check on the spy in LF3.
- **Other L11 STOP conditions:** none applies. There is no spec conflict, no Medium+ regression outside the grants, and no change to a ruled formula or filter.
- **Primitive reads:** I read in full AGENT_DISCOVERABLE_CODE, GEORGIAN_DOCS, pre-flight and TEMPLATE. I read FORWARDREF_COMPONENT (l.1–80), TESTING_QUALITY_GATES (l.1–120) and BUG_HUNTING_TESTS (l.1–60) only in part; this round changes no component shape. I read the lessons block "Before handing over" (L11–L28) in full, and the B and C lessons the task names (L23, L29, L47, L52, L56, L58) in their first 900 characters.

## Code-reviewer (actual subagent, 12 files): score 8/10, 0 Critical/High
- **Medium (test strength).**
  - (a) The jsdom asserts passed under a `blur()` mutant: **fixed in a granted file** (the K10 change above).
  - (b) The real first-Tab proof needs a browser: already ruled by the task. C6 is the browser row for D-29z1698, and the doc's l.4 is fixed text from the grants. No change.
- **Lows, reported but not fixed** (for B to rule):
  1. The helper does not check `target="_blank"` or `reloadDocument`, which React Router's `shouldProcessLinkClick` does. No current call site has either.
  2. Focus moves to `body` at click time. If a loader is slow or fails, the user stays on the old page with focus on body. This is not written down in doc 311.
  3. The `defaultPrevented` branch is untested. IL4 checks only the source text, not runtime focus. IL4 also sits outside its `describe` block (style only).
  4. `isInternalHref` in IL1 only recognises `viewAllLink` and `ROUTES.*` expressions.
  5. The route announcer is missing; this is already SIG-R479-ROUTE-ANNOUNCE.
- **Info, an inventory gap for B:** `app/components/arrangement/ArrangementLibraryMenu.tsx:131` has an `<a href={productHref}>` in Studio, used by `ArrangementLibrary.tsx`. It is not in the D-29z1697 in-scope or ruled-out list. I did not touch it.
- **Architecture note** (a proposal for B or root, not done here): one root-level effect on pathname change (focus reset plus a route announcer in `root.tsx`) could later replace the per-link `onClick` and also close SIG-R479-ROUTE-ANNOUNCE.

## Known gaps
- No browser verification by A. C5–C13 are open for C.
- `/license` is still a 404 (B-R478-DEAD-LICENSE-LINK, `awaiting_user`).
- Doc 311's status line reads "C round 479 PASS" as the grant requires; it is only true once C passes the round.

## Exact next C checks
- Run C1–C13 as written. In C2, K10 = 1 is explained above.
- In C3, the 10 files and 162 tests should hold, and LF1 and LF2 now also assert the body-focus spy.
- C4 (d) and (f) counts are unchanged (11 and 5). Optionally re-run the blur mutant and expect 2 red (LF1, LF2).

## Scope completed
- A steps 1–6 are done.
- B acceptance that A truly passed: the A-side checks only (typecheck, lint, the 162 tests, claims, the review).
- All C rows (C1–C13) are unclaimed.
