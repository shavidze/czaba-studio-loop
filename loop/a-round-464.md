# A round 464 — STORE-2b-3d-3 (orphan keyframes + DC2 matcher)

No STOP. Scope completed per `current-task.md` §3 steps 2–9; step 1 partly late (see below). Step 10 (full suite, verify, build) is a gate row, not run by A.

## Orientation honesty (step 1, pre-flight)
- Read before the apply: `current-task.md`, `lessons.md` A part, GEORGIAN_DOCS (full first 80 lines), TAILWIND_FIRST / TESTING_QUALITY_GATES / BUG_HUNTING_TESTS (headings and key sections only), doc 302 and TEMPLATE headings, `active-summary.md` (start only).
- Read **after** the apply and doc write: `context/active-backlog.json` (head) and the `pre-flight` skill. Pre-flight was not voiced before writing. It changes nothing for this sketch-pinned round: the code was applied byte for byte (no A-authored code), the only A-authored file is doc 303, and success criteria were B's §3/§4 commands, all run.
- `active-summary.md` confirms A-R463-REVIEW-M1 is the round's Medium; nothing else in the active view touches the 3 paths.

## Changed files (exactly the 3 granted paths)
- `app/styles/app.css` — sketch applied (`git apply`), 45 lines deleted, 0 added; 1691 → 1646.
- `app/lib/__tests__/store-dead-css.test.ts` — sketch applied (DC2 rewritten, DC3 keyframes assertion on `animatedNames`, DC4 new).
- `docs/implementation/2026/quarter-IV/303-store-2b-3d-3-orphan-keyframes.md` — new, written by A (§2.2).

`git status --short --untracked-files=all`: the 3 paths only (temporary doc-leak copy deleted).

## Checks actually run (logs in `a-round-464/`)
| Step | Result |
|---|---|
| claims-before (`claims-before.txt`) | `cmp`-equal to `claims-464-planning-output.txt`; stderr 0 bytes |
| sketch sha / files sha | `sketch-464.patch.txt: OK`; after apply 2 OK (`app.css`, `store-dead-css.test.ts`) |
| `npm run typecheck` (`typecheck.log`) | rc 0 |
| `npm run lint` (`lint.log`) | rc 0, 192 warnings (= HEAD) |
| `npx biome check app/lib/__tests__/store-dead-css.test.ts` (`biome-owned.log`) | rc 0 |
| covering set (`covering.log`) | 14 files / 149 tests passed; slowest file 1.73 s, no timeout risk |
| mutants (`mutants.txt`, scratch `/tmp/a464-scratch` = `d55ec17` + sketch committed, node_modules symlinked) | byte-identical to `b-round-463/mutants/mutants.txt` (BASE green; M1–M9 red on the listed rows) |
| doc-leak (`tw-doc-leak.txt`) | `cssEqual true` (docCandidates 64, extraOnlyInDoc 2, no CSS added). Note: the tool needs an absolute store root (`"$PWD"`); a relative `.` fails Tailwind resolution |
| claims-after (`claims-after.txt`) | `cmp`-equal to `claims-464-expected-after-A.txt`; stderr 0 bytes (re-run after the final doc edit) |
| doc rules | l.4 exact; `grep -ci pending` 0; 7 TEMPLATE headings in order; 0 hits of `@keyframes`, `animate-`, `animation:` |

## code-reviewer (real subagent run)
Score 8/10, **no High or Medium**. All findings Low, on the B-pinned sketch code (byte-pinned by `sketch-464-files-sha256.txt`, so A did not change it):
- A-R464-REVIEW-L1: value capture stops at newline; second name of a multi-line comma list reads unused (fails red).
- A-R464-REVIEW-L2: `-webkit-animation`, `WebkitAnimation`, quoted keys, `el.style.animation =`, ternary values unrecognised (fail red; beyond TL-R464-L2's wording).
- A-R464-REVIEW-L3: comment stripper starts after whitespace or `(` even inside strings/CSS (`url(//…)`, `' // '` in JSX text) and can wipe following real uses (fails red); 0 cases in `app/**/*.css` today.
- A-R464-REVIEW-L4: named-utility branch takes the utility suffix as a keyframes name (Tailwind resolves via `--animate-x`); value tokens like `infinite` also count (fail-silent only if a keyframes shares such a name).
- A-R464-REVIEW-L5: DC4 negative `{/* dc-jsx-comment-spin */}` has no animation context, so it passes without stripping; M3 relies on the two `^`-anchored fixtures. Suggest `{/* animation: dc-jsx-comment-spin 1s */}`.
- A-R464-REVIEW-L6: no DC4 positives for `animationName`, double-quote/backtick strings, one-line `-name`.
- Info: doc prose has bare words `block`, `inline`, `fade-in`; leak tool shows no CSS change.
- Reviewer confirmed: no animation use of the 4 names in `app/`; doc counts (11 kept, 8/6 fixtures, 1646 lines) accurate.

Reviewer limitation: it had no shell and did not see the diff, so "pure deletion" and "45 lines" are not verified by it. A's independent evidence: `sha256sum -c sketch-464-files-sha256.txt` 2 OK, `git diff --stat` = app.css 45 deletions / 0 insertions, claims K3/K5 after-A equal (1646 lines, both headers 0).

**For B — which Lows weaken the guarantee:** L4 (named-utility suffix taken as the keyframes name) and L5 (JSX-comment negative fixture is vacuous) are **fail-silent / test-strength** issues in the same direction as A-R463-REVIEW-M1. L1–L3 and L6 are fail-red or coverage gaps.

Addressed within ownership: doc 303 now states precisely that the string-safe strip only holds after a quote (L3; the 0-case claim is narrowed to `app/` CSS files, the only scope grepped) and lists the additional fail-red forms (L1/L2). Only the doc changed after the review (no code), doc-leak and claims re-run green. L4–L6 need a test change outside the pinned sketch: for B.

**Architecture note (proposal for B/root, not acted on):** the test adds a third comment stripper next to the two private ones in `helpers/style-scan.ts` (l.355 strip-all, l.362 string-aware), all behaving differently. Keep for now (test-only). Fits ARCH-CHECKPOINT-STYLE-SCAN: one string-aware stripper + "animation consumer" helper exported from `style-scan.ts`, DC4 fixtures moved to its tests.

## Acceptance (A's view; C decides)
- Passed by A: §3 steps 2, 3, 5 (typecheck, lint 192, Biome, 14/149), 6 (mutants identical), 7 (cssEqual true), 8 (claims-after equal), 9 (code-reviewer run); doc rules of C9 self-checked.
- Not run by A: C6 build compare, C7 pages, C8 Studio/protection browser rows (C), gate rows (full suite, build, verify).

## Known gaps
- Reviewer Lows L1–L6 above (sketch-pinned code); TL-R464-L1/L2 as recorded by B.
- No browser check by A (task assigns browser rows to C).

## Exact next C checks
C1 scope (3 paths) → C2 claims vs `claims-464-expected-after-A.txt` → C3 `sha256sum -c sketch-464-files-sha256.txt` → C4 covering 14/149 with DC1–DC4 → C5 own-scratch mutants → C6 prod build HEAD vs TREE (`build-compare.txt` cmp, `non-identifier-changes=0`, keyframes tree = HEAD minus fadeInUp/fadeOut/float/grain) → C7 26 page rows + non-vacuity → C8 `/studio-lab` + protected `/studio/middle-east` at 1440 and 1280 → C9 doc 303 → C10 l57.
