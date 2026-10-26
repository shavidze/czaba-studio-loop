# A round 188: STORE-1c (D15 header, one h1, plain wordmark, footer name)

Implementer: A · Date: 2026-10-26 · Baseline: `cb24362` · No commit, push or deploy.

## Pre-flight (task §"A's first step"): all 4 OK
1. HEAD = `cb24362`.
2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-187-r188-tree-sha256.txt` from the store root: OK (also OK again at the end).
3. The 4 start hashes match `b-round-187-r188-granted-start-sha256.txt`.
4. Neither new file existed.

Primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, SECURITY_AUDIT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md` (plus AUDIO_ARCHITECTURE, which the hook requested for doc 154).

**Mock:** :5199 was not listening. A started `node mock-api/server.mjs` (log `a-round-188/mock.log`) and stopped it at the end (note in `a-round-188/mock-note.txt`; a first `nohup` attempt exited immediately and was replaced). The shared :5173 server was used as-is; it was not started or stopped.

## Changed files (exactly the grants and new files)
| ID | File | Change |
|---|---|---|
| K1 | `app/components/layout/Header.tsx` (desktop nav) | Collections `/store`, Studio `/studio-lab`, Free Samples `/free-downloads`, About `/about`. Gift Cards, Hire Us, the Demo span and `whitespace-nowrap` removed. `prefetch="intent"` and `getNavLinkClass` kept. |
| K2 | `Header.tsx` (mobile nav) | Same four links, `getMobLinkClass` and `onClick={() => setIsOpen(false)}`. Gift Cards, Hire Us and the Demo span removed. |
| K3 | `Header.tsx` (wordmark) | `<span className="block text-2xl font-extrabold tracking-tighter text-foreground">CZABA</span>`. Biome's formatter (lineWidth 100) wraps it over 3 lines; only this line was hand-formatted. |
| K4 | `app/components/layout/Footer.tsx` l.74 | `{APP_NAME}` replaces "Czaba Music" (1-line diff). |
| K5 | `e2e/navigation.spec.ts` | Only the `navLinks` array changed: Collections, Studio, Free Samples, About. |
| K6 | doc 154 | l.4 → `Completed`. l.61 → C round 187 PASS, browserVerified (`c-round-187.md`), published as `cb24362`. 2 lines. |
| T1 | new `app/lib/__tests__/store-header-footer.test.tsx` | 9 tests: N1, N2, N3, N4, N5 ×3, S1, F1. |
| D1 | new `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md` | Georgian, TEMPLATE sections, R56–R60 with the rejected alternatives. Status `In Progress (awaiting C round 188)`. |

**Header diff hunks** (start-file lines): 53, 59, 61–62, 74–86, 181, 184, 186, 189, 207–225. There is **no added or removed line in l.89–166 or l.226–269**. The auth block, cart, CommandPalette, toggle and imports are byte-identical (the code-reviewer confirmed this independently by line comparison).

Artifacts: `a-round-188/end-sha256.txt` (6 files), `a-round-188/diff-vs-start.patch` (the 4 diffs plus both new files), `a-round-188/end-copies/` with `end-copies.sha256` (the 2 code grants).

## Tests and checks actually run
- **T1 green:** `npx vitest run app/lib/__tests__/store-header-footer.test.tsx` gives 1 file and **9/9 passed** (`a-round-188/vitest-targeted.txt`). Known noise: the React Router future-flag warnings and the `useLayoutEffect` SSR warning from S1 (the same noise as round 187).
- **Red proof on the start code** (`tools/red-on-start.sh`): the script copies the start copies over Header and Footer, runs T1, restores the end copies and checks their hashes (`RESTORED_OK`). Result: **6 failed and 3 passed**. N1, N2, N3, N4, S1 and F1 were red; all three N5 tests were green. The result is in `a-round-188/t1-final-red-on-start.txt`, from a run of the final T1 after the review fixes. The earlier pre-review run is in `t1-red-on-start.txt` and gave the same result.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0, with **214 warnings and 1 info** across 487 files. Round 187's `a-round-187/lint.log` had exactly 214 warnings and 1 info across 486 files (the one extra file now is T1), so the count measured no new warnings. A start-Header Biome run through `--stdin-file-path` printed no diagnostics in stdin mode, so the "6 pre-existing" claim rests on the auth block being line-identical, not on a separate start run.
- **Scoped Biome** (`npx biome check` on Header, Footer, the e2e spec and T1): exit 0, 0 errors, **6 warnings**. All 6 are the pre-existing `lint/a11y/useButtonType` warnings in the untouched auth block (now at l.104, 131, 140, 148, 200 and 225). `e2e/navigation.spec.ts` is outside Biome's `includes` (`app/**`), so Biome does not check it. Nothing was run with `--write`.
- I did not run the full suite, `verify` or the build. Those are the gate's job under the speed rules.

## Live proof (mock :5199, store :5173)
- **SSR `<h1` count, before → after:** `/` 2 → 1, `/store` 2 → 1, `/products/middle-east` 2 → 1, `/about` 2 → 1. After the change, `/free-downloads`, `/gift-cards`, `/hire-us` and `/does-not-exist-188` each have 1. Files: `ssr-h1-before.txt` and `ssr-h1-after.txt`.
- **SSR of `/`:** "Czaba Music" appears 0 times (1 at the start), `Studio Lab</a` 0 times (2 at the start), and the copyright renders `© 2026 CZABA. All rights reserved`. Saved as `ssr-home-after.html`.
- **Playwright Chromium at 1440×900 on `/store`** (`tools/header-probe.mjs`; `before-probe.json` and `after-probe.json`, screenshots `before-header-1440.png` and `after-header-1440.png`):

  | Measure | Before | After |
  |---|---|---|
  | Header height | 80.97 px | 80.97 px (unchanged; the next sibling's top is also 80.97) |
  | Wordmark | `H1`, 32 px | `SPAN`, 32 px |
  | Wordmark `-webkit-text-fill-color` | `rgba(0,0,0,0)` | `rgb(238, 239, 241)`, equal to the runtime `text-foreground` probe |
  | Wordmark `background-image` | gradient | `none` |
  | Headings in the header | 1 | 0 |
  | h1 on the page | 2 | 1 |

  - The nav inventory is the four links in order in both navs.
  - The accessible text of `a[href="/"]` is "CZABA".
  - 0 pageerror, 0 console errors, 0 Authorization headers. The only remote hosts are `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Observation (pre-existing, not changed here):** the unknown URL `/does-not-exist-188` returns HTTP **200**, not 404. This is info for B.
- **Not run by A:** the E2E-NAV-188 Playwright command. That is C's row.

## Code review (actual `code-reviewer` subagent, 6 files)
The reviewer gave a score of 8/10, with no Critical or High findings. It had no shell, so it did not reproduce the test or measurement claims.
- **Medium, fixed:** D1 claimed `.text-glow` is unused after K3. That is false: grep finds 10 uses in 9 files (`_index.tsx`, `about.tsx`, `$.tsx`, `LeadMagnetPopup.tsx` and the home sections). I corrected D1. **B's §8 signal "`.text-glow` becomes unused after K3" is also wrong.** Only the header stops using it, so it must not be deleted in a cleanup.
- **Medium, documented and not fixable in this round:** the `isVisible()` guard in `navigation.spec.ts` remains and `link.text` is never asserted. K5 allows the array only, so I left the code alone. D1's problem → solution entry now says "partial", and the guard is recorded as a signal: drop it and assert `toHaveText`.
- **Low, fixed:** N4's `toContain('text-foreground')` could never fail, because the base class contains `hover:text-foreground`. N4 now checks exact class tokens with `classList.contains`, and also asserts that inactive links lack the `text-foreground` token.
- **Low, partly fixed:** N5 now asserts that there are exactly 2 Sign In buttons, 2 Logout buttons and 2 skeletons (desktop and mobile). The mobile Sign In and Logout click paths are still not clicked; this is recorded as a gap.
- **Low, fixed:** D1 said "four files"; it now says 4 modified and 2 new.
- **Low, not changed (signals):**
  - N2 reaches the menu wrapper through `parentElement` and class strings. Switch it to `aria-expanded` once STORE-2 adds that attribute.
  - N3 and S1 run with `CommandPalette` mocked.
  - The `~/hooks` mock is broad and has no compile-time check against `AuthContextValue`.
  - `react-router-dom` is not a direct devDependency (the round-187 precedent; adding it is out of scope).
  - F1 could flake on New Year's Eve.
  - The reviewer noted for Saba that the header no longer marks `/studio-lab` as a demo. The page title and the in-workspace badge still do.

**Architecture note (verbatim from the reviewer, for B):**
> The four-link list is written out twice in `app/components/layout/Header.tsx`, once for desktop (60–75) and once for mobile (164–195). A shared `NAV_ITEMS` array would remove the duplication. Keep it as is for now: the auth-block-identical constraint, plus the class helpers that differ between desktop and mobile, make extraction a separate small task (good candidate for STORE-2). `app/root.tsx:137` hides the header with `pathname.startsWith('/studio')`, which also matches `/studio-lab`, so the new primary "Studio" link opens a page with no header. This was already the case, not a regression, but the planner should decide whether that's intended. `app/components/layout/Footer.tsx` uses plain `<a href>` instead of Remix `Link`, so footer links cause full page reloads (already the case). `e2e/main-flow.spec.ts:58-61` still has the `/music` and `/hire-us` header checks behind an `isVisible()` guard; the doc already lists this.

## Task §3 checks completed by A
- **N1, N2, N3, N4, N5, F1, S1:** all present. On the start code, N1, N2, N3, F1 and S1 are red (N4 too) and N5 is green. On the tree, all are green.
- **Live:** `curl` shows 1 h1 on `/`, `/store`, `/products/middle-east` and `/about`. `/` has no "Czaba Music" and no `Studio Lab</a`. The Playwright check at 1440 on `/store` (inventory, header height, fill colour, screenshot) is done.
- **Checks:** typecheck and lint exit 0. Scoped Biome reports 0 errors and the 6 pre-existing warnings. The code review was done and its fixes applied.

C's rows (NAV, H1, MARK, FOOT, KEEP, STORE-AFTER, E2E-NAV, G188-3, STUDIO-RV, SCOPE, T-RUN, AN-REVIEW, PX-NET) are **not** claimed here. A did no browser checks at 1280 or 375 and no CLS/LCP or pixel-diff comparison.

## Known gaps
- The mobile Sign In and Logout click paths are covered only by element counts, not by clicks.
- The E2E guard and the missing text assertion in `navigation.spec.ts` remain (out of K5 scope).
- I did not measure whether the header height is unchanged at 1280 or 375. At 1440 it is unchanged.
- The unknown URL returns HTTP 200 (pre-existing).

## Exact next C checks
1. **SCOPE-188:**
   - Run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-187-r188-tree-sha256.txt` from the store root.
   - Run `sha256sum -c ../tmp/studio-real-loop/a-round-188/end-sha256.txt`.
   - `git status --short` must show 4 ` M` and 2 `??`.
   - `git diff -U0 app/components/layout/Header.tsx | grep '^@@'` must show hunks only at start lines 53, 59, 61–62, 74–86, 181, 184, 186, 189 and 207–225.
2. **T-RUN-188:** run T1 on the tree (9/9). Then run `bash a-round-188/tools/red-on-start.sh`, or C's own overlay; expect 6 red, N5 green and `RESTORED_OK`.
3. **NAV-188, MARK-188 and H1-188** at 1440, 1280 and 375:
   - the header box height (80.97 px at 1440 before and after);
   - the wordmark fill colour and its contrast;
   - the hydrated h1 count after the loader unmounts.
4. **FOOT-188:** the footer text `© 2026 CZABA. All rights reserved.` on all 8 pages.
5. **STORE-AFTER-188:** pixel diffs against `c-round-187/shots/store-after/`. Expect changes only in the header band and the footer copyright line.
6. **E2E-NAV-188:** `CI= npx playwright test e2e/navigation.spec.ts -g "desktop nav links|homepage loads|header logo"`.
7. **G188-3, STUDIO-RV-188 and PX-NET/REG-HYD** as written in the task.
