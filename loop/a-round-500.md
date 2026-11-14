# A round 500: DPG-BUTTON-CLEANUP-2 stage 2b-1 re-dispatch (delta sketch)

**Status:** IMPLEMENTED, no STOP. All results equal B's §3 expected values.

## What A did
- Frozen checks before applying: 1 rc 0, 2 rc 0, 3 rc 0. Sketch sha `79835ecd…12ea` matches `b-round-499/sketch-sha.txt`.
- `git apply --check` rc 0, then `git apply b-round-499/sketch-500.patch.txt` rc 0.
- After applying: check 4 rc 0, check 1 rc 0, check 2 rc 0 (`a-round-500/frozen-checks.log`).
- No byte written beyond the sketch. No prose written in doc 321.

## Changed files (this round = the sketch only)
- `app/components/errors/ErrorBoundary.tsx` (`type="button"` on ErrorDisplay Try Again)
- `app/lib/__tests__/product-price-cards.test.tsx` (SE1 + `STORE_ERROR_TRY_AGAIN_CLASS`)
- `app/lib/__tests__/store-button-cleanup-2b.test.tsx` (untracked; `isBefore`, type asserts, `pins`)
- `docs/design/DESIGN_SYSTEM.md` (Ghost "Use for" phrase)
- `docs/implementation/2026/quarter-IV/321-dpg-button-cleanup-stage-2b-1.md` (untracked; B's rewrite)

Worktree now: 6 modified + 2 untracked, matching C0's expectation.

## Checks actually run (logs in `a-round-500/`)
| Check | Result | Expected (B) | Log |
|---|---|---|---|
| `npm run typecheck` | rc 0 | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 180 warnings." | same | `lint.log` |
| `npx biome check` (5 code/test paths) | rc 0, 5 files, 6 warnings | same | `biome-scoped.log` |
| `npx vitest run --reporter=verbose` covering files | 14 files, 138/138; SE1 line present | same | `covering.log` |
| code-reviewer (whole 499+500 change vs `82e118a`, incl. 2 untracked) | No Critical/High/Medium; score 9/10 | — | this report |

Not run by A (per task): full suite, build, `npm run verify` — gate rows.

## Self-check additions (after the advisor review)
- **End state rerun after all tooling** (`a-round-500/frozen-checks-end.log`, real output): check 4 rc 0, check 1 rc 0, check 2 rc 0. `git status` shows exactly 6 modified and 2 untracked paths. `frozen-checks.log` is A's hand summary of the pre-apply run, and `frozen-checks-end.log` is the captured command output.
- **Doc 321 `## ტესტირება` vs A's logs:** every A claim matches: checks 1–3 rc 0, apply/check rc 0, check 4 rc 0, typecheck rc 0, lint 180 warnings, Biome 5 files rc 0 / 6 warnings, covering 14 files / 138 PASS, "A ran no mutants", "A ran no browser rows". No difference, so no STOP.
- The covering run used `--reporter=verbose`. The doc cites only `covering.log` and the counts, and those are the same with either reporter.
- **L31 timing:** BC1b took 1,889 ms against the 5 s default (38 %; gate 498 took 2,024 ms, 40 %). UT2 took 2,633 ms against 30 s. SE1 took 56 ms. Nothing is above 50 %, so no STOP.
- **L12:** no class token or testid was removed or renamed by A, so the grep step does not apply.
- **Pre-flight and primitives:** A did not run pre-flight or read primitives this round, because A wrote no code by hand. A applied B's sketch byte for byte (check 4), and B's sketch had a tech-lead review.

## Code-reviewer findings (for B; none is a STOP — no Medium+)
- **Low, A-R500-CR-DOC321-L4-PREWRITTEN:** doc 321 l.4 already reads "C round 500 PASS" before C has run. L28 requires this exact post-PASS form, with no `pending`, and C11 checks the bytes. So the reviewer's suggestion conflicts with L28, and A did not change the line. If C fails, B rewrites the line on the re-dispatch.
- **Low, A-R500-CR-B2B5-COMMENT-ANCHOR:** B2B-5 in `store-button-cleanup-2b.test.tsx` (l.25, l.31) anchors on the JSX comment `{/* Actions */}`. The project bans non-TODO comments, so a comment cleanup in `EmptyState.tsx`/`ErrorBoundary.tsx` would break B2B-5 with an anchor failure rather than a real regression. Suggested fix: anchor on `'<div className="flex flex-col sm:flex-row gap-3'`. Outside the sketch, so not applied. This is not a STOP under L10/L11: it is a Low suggestion, not a needed change to a granted file and not a failing test.
- **Info (pre-existing):** `RootErrorBoundary` renders its own `<html>` without `<Scripts />`, so root "Try Again" (now the primary) depends on hydration; "Go Home" is a plain `<a>`. Relates to B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML. C6 checks the reload in the browser.
- Re-raises of pre-ruled Lows: #9 (SE1 spy inline restore), #8 (reload pinned by source text), #3 (duplicated literal oracles).

## Architecture note (for B)
code-reviewer: no signal on the four checkpoint signals; class ownership moves to the existing builder, no new state/lifecycle/coupling. **Keep.** ButtonLink wrapper stays with SIG-R498-BUTTONLINK-WRAPPER.

## B acceptance (A's part) actually passed
- §3.1 frozen checks + clean apply: PASS.
- §3.2 grants only (sketch bytes): PASS (check 4 + check 1 rc 0).
- §3.3 typecheck / lint / scoped Biome / covering tests: PASS with B's exact numbers.
- §3.3 code-reviewer: run; findings above.
- Browser rows C1–C7, C13 and mutants C10: not A's; not run by A.

## Exact next C checks
Run the full C0–C14 table from `current-task.md` §4, heaviest browser rows first (C1–C6 at the stated viewports, MOCK on/off, then C7, C13), then C10 mutants, C11 docs (doc 321 l.4 byte string), C12 claims, C14 + L57 check. Dev server at `http://127.0.0.1:5173` is already running.

## Known gaps
- No browser verification by A (C's role). Doc 321 l.4 PASS claim is pending C.
