# A round 496: DPG-BUTTON-CLEANUP stage 1

**STATUS: STOP — routed to B.** The sketch is applied and every run below passed. The code-reviewer raised two **Medium** findings on sketch test lines. Fixing them needs changes beyond the sketch, which is the STOP threshold (Rules, L10, and the §3 item 2 ruling line). A made no edits beyond the sketch in code files and does not mark the round complete.

## Changed files (`git status --short --untracked-files=all`)
- The sketch, applied verbatim with `git apply b-round-495/sketch-496.patch.txt` (sha 997099ef… matches `sketch-sha.txt`):
  - `app/components/ui/Button.tsx`, `app/components/ui/index.ts`;
  - `app/routes/$.tsx`, `app/routes/account_.login.tsx`, `app/routes/search.tsx`;
  - `app/components/home/HeroSection.tsx`, `app/components/layout/Header.tsx`, `app/components/product/AssetListingPage.tsx`;
  - `app/styles/app.css`. Its diff lines are identical to `sketch-496-appcss.patch.txt`: `git apply --check -R` ok and a `diff` of the +/- lines is empty (`a-round-496/appcss-actual.diff`);
  - `app/lib/__tests__/store-glow-shadow.test.ts`; new `app/lib/__tests__/store-button-cleanup.test.tsx`.
- Docs (§3 item 4):
  - `docs/design/DESIGN_SYSTEM.md`: hunks only at l.1062 and inside `### Buttons` (l.1107 up to `### IconButton`, which is now l.1195);
  - new `docs/implementation/2026/quarter-IV/319-dpg-button-cleanup-stage-1.md`.
- Manifests: `r496-tree-sha256.txt` rc 0 and `b-round-318/protected-sha256.txt` rc 0, both after the last edit. No protected file was touched.

## Runs (actual)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-496/typecheck.log` |
| `npm run lint` | rc 0, 182 warnings (HEAD 183, as in K18) | `a-round-496/lint.log` |
| Biome on the owned code paths | rc 0, 3 warnings, all pre-existing at HEAD (HEAD's copies give 4; the sketch removes AssetListingPage's `useButtonType`). Biome reported 10 files checked for the 11 paths passed | `a-round-496/biome-scoped.log` |
| `npx vitest run` on the 4 covering files | 4 files, 41/41 PASS | `a-round-496/vitest.log` |
| C9 scanner / `.btn-primary\|button\|button-primary` grep / `.btn-icon` grep | `TOTAL 2` (Header l.102, l.141 `btn-icon`) / 0 / 3 | — |
| C8 skeleton grep | 2 | — |
| BC1–BC6 and GS3 titles | present | — |
| code-reviewer subagent (real) | 8/10, 0 Critical/High, **2 Medium**, 8 Low, 1 Info | this report |

Not run by A: the full suite, build, `npm run verify` (gate) and the browser rows (C).

## STOP: the two code-reviewer Mediums (verbatim gist)
1. **GS3 only catches the exact old selectors** (`store-glow-shadow.test.ts:53-60, 90-92`). `cssRuleBodies` compares exact selectors and reads only `styles/app.css`.
   - These would all pass: a returning `.btn-primary:focus-visible {}`, `a.button {}`, `.btn-primary::after`, `.btn-secondary {}`, or the same rules in `styles/base/utilities.css`.
   - BC6 scans only `.ts`/`.tsx`.
   - Reviewer's fix: scan every `.css` under `app/` with `/(?<![\w-])\.(btn-primary|btn-secondary|button|button-primary)(?![\w-])/`.
   - **A's evidence:** the same pattern grepped over all `app/**/*.css` gives **0** hits, so nothing is present today. This is guard strength only.
2. **BC1 pins only primary/md** (`store-button-cleanup.test.tsx:55-59`). The other variants, sizes, `fullWidth`, `isDisabled`/`isLoading` and the custom `className` position are not pinned.
   - Reviewer's fix: add a table of HEAD strings.
   - **A's evidence:** HEAD `Button` and the new `Button` were both rendered with `renderToStaticMarkup`: 6 variants × 3 sizes × fullWidth × disabled × isLoading × className = **288 combos, 0 differ** (`a-round-496/equiv/`, `result.txt`).
   - So the "byte-identical default" claim holds today. The gap is only guard strength.

**A's assessment (B rules):** neither Medium is a live defect. Both are future-guard strength in sketch test lines. Options for B:
- (a) grant A a test-only addendum with these two strengthenings, then continue to C;
- (b) downgrade both to Low and continue to C as is.

The severity stays the reviewer's until B rules.

## For B (Lows on sketch lines; the sketch wins, not edited)
- **#3** `Button.tsx:75,95`: `isDisabled` on a `<Link>` is visual only (`pointer-events-none`); Enter still activates. No consumer uses it today. It is now documented in DESIGN_SYSTEM.
- **#4** BC3 derives its expected value (`PILL_LG`) from the builder under test. Add `expect(link.closest('button')).toBeNull()`.
- **#5** BC4's `not.toBe(PILL_LG)` is close to vacuous. Assert that `bg-brand`/`rounded-full` are absent instead.
- **#6** BC5 compares class strings only. The mobile Sign In click (`Header.tsx:261-264`) and the skeleton sizes are untested. `max-lg:hidden` vs `inline-flex` stays a browser row (C4).
- **#7, a browser check for C:** the desktop skeleton `w-24 h-12` (96×48) is about 6px narrower than signed-out Sign In (about 102px). For **signed-in** users it resolves to the roughly 36px `btn-icon` user button, so the layout shift may have moved to signed-in users.
- **#10** BC6's `className="button[ "]` misses quoted, template or `clsx` bare `button` tokens (0 current hits). The `__tests__` filter is redundant.
- **#11 Info (pre-existing):** the unlayered `a, button { transition }` (`app.css:219-227`, duplicated at `utilities.css:7`) overrides the builder's `transition-all duration-150`, now on the link CTAs too. Candidate for DPG-CSS-DEDUP (SIG-R496-UNLAYERED-A-TRANSITION).

**Fixed by A in granted docs, after the review returned** (stated so B sees the order):
- **#8** DESIGN_SYSTEM said "default changes only radius". It now says `pill` changes only the radius.
- **#9** "the only button source" became "the target source" with the DPG-BUTTON-CLEANUP-2 cross-reference. The no-nesting rule now cross-references B-R496-HOME-NESTED-BUTTONS-IN-LINKS. `AccentButton` was added to the import line.

Doc 319's status and testing section record the STOP.

## Architecture note (code-reviewer)
None: "class ownership stays in `Button.tsx`; the builder is a stateless extraction from the same owner. A `ButtonLink` wrapper isn't worth it for a handful of link consumers." Proposal only, for B and root.

## Acceptance (only what A truly ran)
- §3 items 1–4 done.
- Item 5 run, except that the review ended in STOP.
- The C0-equivalent scope check and C8, C9 and C10 pass as A ran them. These are A's runs, not C rows.
- C1–C7 and C11–C14 were not run by A.
- The round is **not** complete.

## Next C checks
- Per L22, while the STOP stands: C0, C13 and C14 only, reported as "STOPPED — routed to B".
- If B rules (b) or grants (a), C runs the full §4 table. Include reviewer #7 (the signed-in skeleton → user icon shift at 1440) as an extra observation in C1/C4.
