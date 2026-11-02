# A round 302: NAME-AND-HINT-a ("CZABA Studio", Saba Q4)

No STOP. Every §8 condition was checked and none fired.

## Scope completed
- **Claims pre-check.** At HEAD `aa7a6ef`, `claims-302.sh` gave output identical to `b-round-301/claims-302-output.txt` (empty diff). Saved as `a-round-302/claims-before.txt`.
- **The 11 code and test grants** were copied from `b-round-301/sketch-<basename>.txt`. `cmp` shows all 11 byte-equal to their sketches.
- **The doc grant** is the new `docs/implementation/2026/quarter-IV/221-name-and-hint.md`:
  - written in Georgian, with TEMPLATE's 7 headings in order;
  - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 302 PASS)`;
  - it cites NM1, NM2, PC9, PW1 and PW6;
  - it says stage b (Q5, round 303) follows;
  - it lists SABA-Q-NAME-LAB-URL-FILE and SABA-Q-NAME-TESTIMONIAL.

## Changed files (12, exactly §5)
- **Modified:**
  - `app/routes/studio-lab.tsx`
  - `app/lib/arrangement/collection.ts`
  - `app/lib/arrangement/strings.ts`
  - `app/components/arrangement/StudioWorkspace.tsx`
  - `app/components/home/StudioShowcase.tsx`
  - `app/components/home/StudioMockup.tsx`
  - `app/routes/checkout.success.tsx`
  - `app/lib/arrangement/__tests__/strings.test.ts`
  - `app/lib/arrangement/__tests__/collection.test.ts`
  - `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx`
- **New:**
  - `app/lib/__tests__/studio-naming.test.tsx`
  - `docs/implementation/2026/quarter-IV/221-name-and-hint.md`

## Checks actually run
- **Covering set, run alone:** 24 files and 361 tests, all passed (`a-round-302/covering-run.log`).
  - No test is above 50 % of its timeout.
  - The slowest single test is DXM3 at 2551 ms, but it has a 20 s describe timeout (13 %).
  - The slowest test on the 5 s default is NG5 at 1695 ms (34 %).
- **Typecheck:** `npm run typecheck` rc 0 (`a-round-302/typecheck.log`).
- **Lint:** `npm run lint` rc 0 with 205 warnings, the same as the K19 baseline (`a-round-302/lint.log`).
  - Scoped Biome on the 11 code and test files: lint and check rc 0 (`a-round-302/biome-scoped.log`).
  - The only 2 warnings are the pre-existing `noArrayIndexKey` in `checkout.success.tsx` [K11].
- **Mutants** ran on the scratch `/tmp/a302-scratch`: HEAD plus the 12 files, `node_modules` linked, with its own `cacheDir` `/tmp/a302-cache` via `vitest.a302.config.ts` in the scratch only. They ran on the 4 touched test files.

  | Mutant | Red rows | Log |
  |---|---|---|
  | baseline | 91/91 green | `a-round-302/mutant-m0-baseline.log` |
  | m1 (mockup title) | NM1, NM2 | `a-round-302/mutant-m1.log` |
  | m2 (checkout step) | NM1 | `a-round-302/mutant-m2.log` |
  | m3 (glow on CZABA) | NM2 | `a-round-302/mutant-m3.log` |
  | m4 (suffix and span restored) | NM1, ST31, PW1, PW6 | `a-round-302/mutant-m4.log` |

  These match B's expected red rows exactly. The scratch was restored, and the store files are `cmp`-equal to it.
- **Claims after the change** (`a-round-302/claims-after.txt`):
  - K5–K10 equal `claims-302-after-sketch.txt`;
  - K2 = 12;
  - K4 = 1170 entries with 10 failures;
  - K3 (protected diff) rc 0;
  - K17 = "221 is the last";
  - K18 lists 212, 213 and 221;
  - K20: every artifact is `ok`.
- **Browser smoke.** This is A's own sanity check, not C's acceptance. It used Playwright Chromium against the running server on :5173 (`a-round-302/smoke.mjs`, `smoke-checkout.mjs`, `a-smoke-*.png`).
  - `/studio-lab` at 1440 and 1280:
    - the title is `CZABA Studio — Demo collection`;
    - the h1 text is `CZABA Studio` with 0 element children;
    - the demo badge is present.
  - `/checkout/success` at 1440, after a 3 s wait, shows `Access CZABA Studio anytime` and 0 `Personal Mixdown`. A first probe without the wait counted 0, because the content had not rendered yet. C should honour the ≥ 1.5 s wait in N-CHECKOUT.

## Code-reviewer (actual subagent) findings, passed to B, not acted on
The code grants must stay byte-equal to the sketches, so none of these were acted on. The reviewer scored the change 9/10 and found no Critical, High or Medium findings, so there is no L11 STOP.
- **Low (A-R302-REVIEW-NM1-NARROW):** the NM1 regex in `studio-naming.test.tsx:10` can miss retired names:
  - it is case-sensitive;
  - it checks one line at a time, so a name split across JSX lines (or written as `Studio{' '}Lab`) passes;
  - it does not match `Personal Studio`, which is still in `e2e/store-page.spec.ts` (B-R301-E2E-STALE-PERSONAL-STUDIO);
  - it scans only `.ts`/`.tsx` under `app/`.

  Suggestion: add the `i` flag and `Personal Studio`. → `deferred_low_polish` candidate.
- **Info:** the header reads "CZABA" (back link) next to "CZABA Studio" (h1), so assistive tech hears "CZABA CZABA Studio". This is a copy question for product-designer or Saba, not a defect.
- **Info:** the origin is no longer in the heading text. The badge carries it, and the old suffix did not carry it either, so this is not a regression.
- **Info:** a future purchased route needs its own `<title>` (relevant to SRW-21-PLAN).
- **Info, pre-existing:** `StudioMockup.tsx:167` uses the raw palette class `text-neutral-400`, not a token. The change touched only the text inside that span.
- **Info:** `CLAUDE.md:3`, `AGENTS.md:3` and `.agents/skills/web-audio-api/SKILL.md` still say "Personal Mixdown Studio". These are already tracked as B-R301-DOCS-OLD-NAME (For Saba, RETRO 305).
- **Architecture note:** none.

## Known gaps
- I did not run C's browser acceptance rows (N-TITLE-H1 geometry, N-RETIRED-TEXT AX tree, N-HOME at 390 and with reduced motion, N-NAV, N-NARROW, N-EXPORT-NAME, N-JOURNEY, N-SCREEN-BUDGET, RV-EN, G302-AUTH). These belong to C.
- The purchased heading in a browser is BLOCKED (SRW-21 `deferred_user`, and the backend is unavailable in the cloud). Unit tests PW1 and PW6 cover it.
- The full vitest suite, the build and `npm run verify` were not run (speed rules). They are gate rows.

## B acceptance rows A passed
- §3.1: the covering set (24 files, 361 tests), NM1, NM2, the updated strings, PC9, PW1 and PW6, and red proof m1–m4.
- §6.1–6.6.
- SOURCE-SCOPE:
  - `git status` shows 12 paths;
  - the frozen list has 10 failures;
  - the 11 grants are `cmp`-equal to their sketches;
  - the protected files have no diff.
- CLAIMS K2, K4, K5–K10, K17, K18 and K20.
- DOC: file exists, the headings, l.4, and every cited row exists.

All browser rows remain for C.

## Next C checks (exact)
1. SOURCE-SCOPE and CLAIMS as in §3.3. Re-run `b-round-301/claims-302.sh` from `store/`, and run `sha256sum -c` from `store/`: the paths are relative to `store/`.
2. N-TITLE-H1 at both viewports:
   - h1 box height ≤ line-height + 1 px;
   - the h1, the `arrangement-exit` link and the badge share one row (tops ±1 px) and do not overlap;
   - the h1's CDP accessible name is `CZABA Studio`.
3. N-RETIRED-TEXT over all 7 states, including the AX tree and `document.title`.
4. N-HOME at 1440, 1280 and 390, plus reduced motion at 1440: h2 lines and overflow, and the glow span.
5. N-CHECKOUT with a wait of ≥ 1.5 s (see the smoke note above), N-NAV, N-NARROW and N-EXPORT-NAME (`czaba-studio-lab.wav`).
6. N-JOURNEY at both viewports, and N-SCREEN-BUDGET with the expected count 96 / 79.
7. RV-EN, then G302-AUTH (anonymous `/studio-lab`; `/api/studio-token` returns 401 without a header; `/studio/middle-east` "Sign in required").
