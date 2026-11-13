# Round 497: DPG-BUTTON-CLEANUP stage 1, completion. A test-only addendum for the two code-reviewer Mediums, then the full C table

**Planned by:** B, at the round 496 → 497 planning on 2026-11-13 (`b-round-496.md`, `b-round-496/checkpoint.md`).
- **Advisor:** available, consulted after orientation.
- **Archive:** the round-496 task is archived as `tasks/round-496.md`, a byte-identical copy. **It is the design source for this round.** §1 (reference), §2 (design, per-site table, ruling lines, deviations D1–D3) and §5 (claims K1–K28) are unchanged and are not repeated here. Read them there.

## Decisions (`backlog.json` v490, `decisions_log_b`)
- **D-29z1778:** round 496 = BLOCKED.
  - A wrote STOP on two code-reviewer Mediums in sketch test lines. C ran C0/C13/C14 only (L22), and gate 496 was skipped.
  - **Nothing closes.** C's `measure.mjs` run was an extra observation, not acceptance. B-R496-404-BROWSE-STORE-UNSTYLED and DPG-BUTTON-CLEANUP stay open.
- **D-29z1779:** ruling on the STOP: **option (a), a test-only addendum.** Not option (b), because both gaps are real:
  - B's 8 mutants **all survive** A's round-496 tests (`b-round-496/mutants-497-on-a496-tests.txt`);
  - **all 8 are red** with the addendum (`b-round-496/mutants-497.txt`).

  The reviewer's proposed regex `(?<![\w-])\.` misses `a.button`, its own example; B's self-test caught it. So the addendum uses `\.(btn-primary|btn-secondary|button|button-primary)(?![\w-])`. tech-lead: **APPROVE**; points 3 and 4 were adopted (`b-round-496/addendum-review.md`).
- **D-29z1780:** pre-ruled Lows and the order (see Rules and §5).
- **D-29z1781:** advisor closing-check corrections:
  - BC1b has an explicit 20 s timeout. Under full-suite load it took 2.46 s, against vitest's default 5 s.
  - B ran the full suite once on the addendum tree.
  - C12's content check is restored.
  - The C11 copy recipe now excludes `.git`.
  - A's code review is scoped to the addendum.

## Rules
- **Read `lessons.md` first.** The B-side lessons applied here are L1, L4 ("port preserves HEAD"), L10, L22, L29, L54 and L57.
- **STOP threshold (L10):** A writes STOP and changes nothing more if any of these happens:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a covering test fails;
  - a frozen-file check is not rc 0;
  - the addendum does not apply cleanly;
  - a granted test file would need a change beyond the addendum.
- **Pre-ruled Lows from round 496.** A re-raise of any of these is listed "For B" and is **not** a STOP:
  - #3 A-R496-CR-LINK-DISABLED-VISUAL-ONLY;
  - #6 A-R496-CR-BC5-CLASS-ONLY;
  - #7 A-R496-CR-SIGNED-IN-SKELETON-SHIFT (measured by C15);
  - #10 A-R496-CR-BC6-BARE-BUTTON-TOKEN;
  - #11 = SIG-R496-UNLAYERED-A-TRANSITION;
  - tech-lead's notes `[class~="button"]` and `@apply` are not scanned; they are outside finding 1, and doc 319 may mention them.
- **Ruling line:** "code-reviewer Lows on addendum lines vs the addendum-is-the-code rule: the addendum wins." A lists them "For B" and does not edit them.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.
- **Out of scope:** the Studio (`/studio-lab`) and the Ableton check. This is a Store round; the reference is in `tasks/round-496.md` §1.

## Baseline: HEAD `3bcf8cb` + the round-496 worktree (13 status lines; gate 496 not published)
At planning, `git status --short --untracked-files=all` showed 13 lines:
- 11 modified: the 9 sketch code paths, the GS3 test and DESIGN_SYSTEM.md;
- 2 new: `store-button-cleanup.test.tsx` and doc 319.

**Do not re-apply `sketch-496`.** It is already in the tree.

**Frozen-file checks, all from `store/`, all rc 0 at planning:**
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-495/r496-tree-sha256.txt`: every tracked file outside the round-496 grants (1,394).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files.
3. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-496/r497-a496-frozen-sha256.txt`: the 10 round-496 paths that this round must not touch (the 9 code files and DESIGN_SYSTEM.md).

**Before A applies:** `b-round-496/r497-pre-test-sha.txt` (the two test files as A left them) is rc 0.
**After A applies:** `b-round-496/r497-post-test-sha.txt` is rc 0.

## 0. Why this round
- **Saba's DPG-FIX P1 item 7:** "Use Button.tsx component only." Stage 1 is applied but not accepted.
- **The two Mediums:**
  - **A-R496-CR-GS3-GUARD:** GS3 catches only the exact old selectors in `styles/app.css`. `:focus-visible`, `::after`, `a.button`, `.btn-secondary` or the same rules in `base/utilities.css` would pass.
  - **A-R496-CR-BC1-PIN:** BC1 pins only primary/md.

  A's 288-combo run showed no live defect, but these are guard gaps: the mutants survive.
- REGRESSION is not due. The last one was 2026-11-13; the next is due on or after 2026-11-16.

## 1. What changes (test-only, plus doc 319)
**Patch:** `b-round-496/addendum-497.patch.txt`; its sha256 is in `b-round-496/addendum-sha.txt` (`853dc262…`).

- **`store-glow-shadow.test.ts` GS3** (the existing exact-selector loop is kept, so no assertion is lost):
  - scans every `.css` file under `app/` with `RETIRED_BUTTON_CLASS_IN_CSS` and expects 0 hits;
  - non-vacuous: at least 3 CSS files, including `styles/app.css` and `styles/base/utilities.css`. The same regex finds 6 hits in HEAD `app.css`;
  - self-test: it matches `.btn-primary:focus-visible`, `a.button`, `.btn-primary::after`, `.btn-secondary{` and `.card .button-primary`, and does not match `.btn-icon`, `.buttons`, `button:focus-visible` or `.my-button`.
- **`store-button-cleanup.test.tsx`:**
  - **New BC1b:** 6 variants × 3 sizes × fullWidth × disabled × isLoading × className = 288 renders. Each must equal a literal copy of the HEAD `3bcf8cb` strings (`HEAD_BASE`, `HEAD_VARIANT`, `HEAD_SIZE` and `HEAD_DISABLED`, composed in HEAD's order). Also:
    - `headClassName('primary','md',…)` equals `HEAD_PRIMARY_MD` (tech-lead point 3);
    - one secondary/sm `shape="pill"` render equals HEAD with `rounded-full` (point 4);
    - an explicit timeout, `BC1B_TIMEOUT_MS = 20_000`.
  - **BC3:** adds `link.closest('button')` null (Low #4).
  - **BC4:** asserts that `bg-brand`, `rounded-full`, `rounded-md`, `shadow-sm` and `btn-secondary` are absent from Browse Store (Low #5).

## 2. A: what to implement
1. From `store/`, check `r497-pre-test-sha.txt` rc 0, then run `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-496/addendum-497.patch.txt`, then check `r497-post-test-sha.txt` rc 0.
2. **Grants:**
   - the two test files (addendum content only);
   - `docs/implementation/2026/quarter-IV/319-dpg-button-cleanup-stage-1.md`: update the status, testing and "problems and solutions" sections. Record the STOP → addendum (a), the reviewer-regex correction and the 8/8 mutant evidence; English terms, Georgian prose.

   Nothing else.
3. **Run** (logs under `a-round-497/`):
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run` on the 4 covering files: `app/lib/__tests__/store-button-cleanup.test.tsx`, `store-glow-shadow.test.ts`, `store-header-footer.test.tsx` and `store-hidden-focusables.test.tsx`. Expect 42 tests (B: `b-round-496/precheck-covering.log`);
   - the code-reviewer, scoped to the addendum and doc 319. Give it the round-496 files as context only; they were reviewed in round 496 and are frozen, and the gate reviewer sees the full diff. Give it the reviewer's two round-496 Mediums verbatim and ask whether they are resolved.

   Not the full suite.
4. Write `a-round-497.md`, with the code-reviewer's Architecture note for B.

## 3. C: what to verify
C writes `c-round-497.md`, `c-round-497.json` and `c-round-497/progress.json` as it goes, browser rows first.

**Environment, warm-up and stubs** (same as round 496):
- Start `node /home/runner/czaba-project/tmp/studio-real-loop/mock-api/server.mjs` if `http://127.0.0.1:5199/__mock/health` is not ok. Stop it by PID only.
- Warm `/`, `/no-such-page-496`, `/account/login` and `/search` once (a cold dev server misses the first load at 1440).
- Init script: `localStorage.czaba_lead_magnet_dismissed = '1'`.

**Harnesses:** `b-round-495/measure/measure.mjs` and `probe.mjs`. Run them as `BASE=http://127.0.0.1:5173 node <script> <outdir> after`. Compare with `b-round-495/measure/head.json`, `sketch.json`, `head-probe.json` and `sketch2-probe.json`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; the three frozen-file checks; `r497-post-test-sha.txt` | The same 13 paths as the baseline, no others; every check rc 0 |
| C1 | REST (browser, 1440×900 + 1280×720) | Computed style of sites #1, #3 (login and search), #4 and #5 (site numbers as in `tasks/round-496.md` §2) | bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`, radius `9999px`, height 48, 16px / 600, padding 12px 24px. Boxes equal `sketch.json` ±1 px; for the Hero compare width and height only |
| C2 | HOVER (browser, both) | Hover #1, #3, #4 and #5; hover #2 | bg `rgb(217, 184, 127)` with no opacity change on #1/#3/#4/#5. #2's text turns `rgb(201, 164, 106)` with no box or background |
| C3 | FOCUS (browser, both) | Keyboard Tab to #1 and #2 on `/no-such-page-496`, and to #5 and #4 on `/`; then press and hold the mouse on #1, moving away before release | Keyboard: `:focus-visible` true, outline `solid` 1px `color(srgb 0.788235 0.643137 0.415686 / 0.8)`, offset 2px, equal to `head-probe.json` on the same element. Press: `:focus-visible` false, outline `none` |
| C4 | BREAKPOINT (browser, 1023 / 1024 / 375) | Header "Sign In" | `display: none` at 1023 and 375, `flex` at 1024. At 375, "Toggle menu" opens a menu whose Sign In is 343 px wide, 48 tall, radius 9999px. At 1440, the desktop Sign In makes the heading "Sign in" visible, and Esc hides it |
| C5 | NAV (browser, 1440 + 1280) | Enter on #1, #2 and #4; click "Back to Home" on `/search` | The routes are `/`, `/store`, `/store` and `/`. Each of #1–#4 is one `<a>` with no `<button>` inside it. The home page's other 14 `a button` nestings are B-R496-HOME-NESTED-BUTTONS-IN-LINKS and are not part of this row |
| C6 | 404 PAIR (browser, both) | Screenshot `/no-such-page-496` and compare with `b-round-495/measure/head-NF-*` | The "Back Home" brass pill and the "Browse Store" quiet text link are aligned, with no wrap |
| C7 | JOURNEY (L54, browser, 1440) | Hero CTA → `/store` → back; header Sign In → the heading "Sign in" → Esc | A screenshot per step; no console errors besides the known cloud ones |
| C8 | SKELETON (grep) | `grep -cE 'h-12 bg-elevated rounded-full animate-pulse' app/components/layout/Header.tsx` | 2 |
| C9 | GREP | The three commands in `tasks/round-496.md` §4 (C9 block) | Scanner `TOTAL 2` (the two `btn-icon` lines in Header.tsx), then `0`, then `3` |
| C10 | TESTS | `npx vitest run` on the 4 covering files | 42/42 pass. BC1b and the GS3 CSS-wide scan exist as in the addendum. Check the post-test sha |
| C11 | MUTANTS | **Copy recipe (changed):** copy the **working tree** of `store/` (not `git archive HEAD`; HEAD lacks the round-496/497 work) to a folder outside `store/`, excluding `node_modules` **and `.git`**. Then `git init`, `git add -A`, commit, and symlink `node_modules`. Run `bash b-round-496/mutants-497.sh <copy>` and then `bash b-round-495/mutants.sh <copy>` (at least M1, M2 and M7) | N1–N8 all RED (as `b-round-496/mutants-497.txt`); M1, M2 and M7 RED |
| C12 | DOCS | Compare the DESIGN_SYSTEM.md `### Buttons` section (l.1107 up to `### IconButton`, now l.1195) and l.1062 with the live `Button.tsx` and the `~/components/ui` barrel; check `git diff docs/design/DESIGN_SYSTEM.md` hunks; check doc 319's sections | Every documented class, size, shape and export equals the code (B checked the diff at planning and found a match). Hunks only at l.1062 and inside `### Buttons`. The file is unchanged since round 496 (frozen check 3). Doc 319 records the STOP, ruling (a) and the addendum, and every number in it traces to a log |
| C13 | CLAIMS | `bash b-round-495/claims-496.sh` (default tree) compared with `b-round-496/claims-496-on-addendum-output.txt`. B generated that file on the real tree before the addendum; no claim reads test content that the addendum changes (K7 is empty, and K11 is a file list) | No `MISSING`, empty stderr. Identical; K23 may differ only if the backlog changed after planning |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-497.json c-round-497/l57-check.txt` | As C0; rc 0 |
| C15 | SIGNED-IN HEADER (browser, 1440 + 1280; reviewer #7) | Stub signed-in state with `localStorage.auth_user` without `accessToken` (L1). Load `/` | The header has no "Sign In" and has the user button. Header height equals the signed-out header ±1 px, and the nav does not wrap. **Record** the user-button box and, if you can capture it (CPU throttle 6×, first frames), the skeleton box (expected 96×48) and the horizontal shift between them. The shift is the deferred Low A-R496-CR-SIGNED-IN-SKELETON-SHIFT and is not a PASS condition; a shift > 0 is evidence for it, not a FAIL |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Neighbours that could break:** the Header nav and cart positions (C1 ±1 px); the mobile-menu hidden focusables; the e2e locators on "Discover the Collection".
- **L22:** if A STOPs again, C runs C0, C13 and C14 only.
- **Bugs:** every bug carries an enum `origin` (L57).
- **Closing:** C PASS of C2/C6 closes B-R496-404-BROWSE-STORE-UNSTYLED, and C PASS of C10/C11 closes A-R496-CR-GS3-GUARD, A-R496-CR-BC1-PIN and Lows #4/#5. `browserVerified` must be true for DPG-BUTTON-CLEANUP to count as done.

## 4. B's pre-check (on a scratch copy of the round-496 worktree, since removed)
| Check | Result | Log |
|---|---|---|
| Addendum, final version | tsc rc 0, Biome rc 0, covering tests 42/42 | `b-round-496/precheck-tsc.log`, `precheck-biome.log`, `precheck-covering.log` |
| Full suite on the addendum tree | 295 files / 4,316 tests, rc 0 (round 496 sketch: 4,315, plus BC1b); BC1b 2.46 s under load | `b-round-496/precheck-full.log` |
| Mutants with the addendum | N1–N8 all RED | `mutants-497.txt` |
| Mutants on A's round-496 tests | all 8 survive | `mutants-497-on-a496-tests.txt` |
| Claims (real tree) | rc 0, stderr empty; differs from the sketch output only in K1/K2/K14/K15 (as C saw in round 496) and K23 | `claims-496-on-addendum-output.txt` |
| Patch applies to the real tree | `git apply --check` ok; the result matches `r497-post-test-sha.txt` | — |

## 5. After this round (D-29z1780; order unchanged from D-29z1776)
1. **DPG-BUTTON-CLEANUP-2:** hand-rolled brand buttons, the 115 `bg-brand` lines in `b-round-495/stage2-bg-brand-hits.txt`. REGRESSION comes first if planning happens on or after 2026-11-16.
2. **The rest of DPG P1:** CSS-DEDUP, COLOR-CONSOLIDATE and FONT-RESOLVE.
3. **Then** the DP-gate re-run with root, then P2.
4. The next RETRO is round 510.
