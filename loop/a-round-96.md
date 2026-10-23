# A round 96 — C-R95-N1 failed-source refusal text + GATE95-S1 doc 083 status

STATUS: DONE (A scope). Waiting for C. Browser rows not run by A.

## Start state
HEAD e3e528821292705a8298e4fcc2f90986375496e4, `git status --short` empty, frozen list 524/524 OK, owned baselines c98fc743 / 923dc48b — all matched the task.

## Changed files (end sha256, also in a-round-96/end-hashes.txt)
| status | file | sha256 |
|---|---|---|
| M | app/contexts/ArrangementContext.tsx | db7a477d2fb88d46ed0b1870bde150c24c443446b76f7aad186d474b661172d7 |
| ?? | app/lib/arrangement/__tests__/failed-source-refusal.test.tsx | ab7c5d7b4f77110b9c6455d7a3ffedb8e02e7471cad628e8933383f07c07127e |
| M | docs/implementation/2026/quarter-IV/083-studio-lab-demo-loader-error-text.md (l.4 only) | d4bb41990e85a5d553e0202ddfcc553736322f5671794c2a78291bab1099e1f2 |
| ?? | docs/implementation/2026/quarter-IV/084-studio-failed-source-refusal-text.md | 869f923812543deae10f90701b615ba2bebb13dd32b41fe489cff57cafad5167 |

End: exactly 2 M + 2 ??; frozen 524/524 OK; HEAD unchanged.

## E1 (ArrangementContext.tsx) diff hunks (git diff -U0)
- `@@ -166,0 +167,2` new non-exported `librarySourceFailedMessage(title)` → `„${title}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` (in module constant block l.158–186).
- `@@ -1201 +1203,7` preview refusal: `stopLibraryPreview()` still first (unchanged line 1200); then unknown → `ჯერ ბიბლიოთეკაში აირჩიე ხმა.`, status `error` → failed text, else old loading text.
- `@@ -1314 +1322,5` add refusal: `state?.status === 'error'` → failed text, else old loading text.
Untouched: dropLibrarySource text, load effect, ready paths, refuseEditDuringGesture, AUDIO_ON_VIDEO_LANE_MESSAGE, useArrangement shape (no new field/export).
Doc 083: `@@ -4 +4` → `**სტატუსი:** C PASS (Round 95), გამოქვეყნდა \`e3e5288\` (D-29z60)`.

## Commands run (all from store/; final run after the review fixes)
- `npx vitest run app/lib/arrangement/__tests__/failed-source-refusal.test.tsx` → 8/8 pass.
- `npm run typecheck` → exit 0 (a-round-96/typecheck.log).
- `npm run lint` → exit 0; 438 files, 218 warnings + 1 info all pre-existing/outside owned files (a-round-96/lint.log).
- `npx biome check app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/failed-source-refusal.test.tsx` → exit 0, no diagnostics (a-round-96/biome-check-owned.txt). Read-only; no --write.
- `npx vitest run $(cat a-round-96/targeted-list.txt)` → 6 files, 83 tests, all pass (a-round-96/targeted-vitest.log). List = the 5 named in the task + gesture-guard.test.tsx (grep -rl for `ჯერ არ ჩატვირთულა|addSourceToActiveTrack|startLibraryPreview` under app/ also hits it).
- Not run (gate): full suite, `npm run verify`, build, e2e smoke.

## Fail-before (scratch a-round-96/mut, baseline snapshot c98fc743, cacheDir in scratch)
Red: FS1, FS2, FS4, FS8. Green: FS3, FS5, FS6, FS7. Exactly B's expectation (a-round-96/fail-before.txt).

## Mutations (a-round-96/run-mutations.py → mutation-results.json)
| mut | change | red |
|---|---|---|
| a | add block: drop error branch | FS1, FS2, FS8 |
| b | preview block: drop error branch | FS4 |
| c | invert both branches (loading gets failed text) | FS1, FS2, FS3, FS4, FS5, FS8 |
| d | `stopLibraryPreview()` removed only before failed-text status (kept for other branches) | FS4 (`expected 'ok' to be null`) |
| e | em dash → hyphen in failed text | FS1, FS2, FS4, FS8 |
| f | append `state.error` to add status | FS1, FS2, FS8 |
| control | unmutated | 0 failed / 8 passed |

## Acceptance (B §1/§2) that A truly passed
- E1 behaviours 1–5 (unit level, FS1–FS8). Browser rows NOT verified by A (C's job).
- Fail-before list matches; mutations a–f each red as named.
- typecheck / lint / scoped Biome / targeted vitest green; end state 2M + 2??; frozen 524/524.

## Known gaps
- No browser verification by A. FS tests use fake AudioContext (jsdom); real audible stop of preview is for C (FAIL-PREVIEW).

## Exact next C checks
FAIL-ADD, FAIL-PREVIEW, FAIL-DBL (1280), FAIL-BOTH (1440), LOADING-REG, READY-REG, DEMO-LOAD-REG, PX-NET, REG-HYD, G96-3 (fake-Bearer BLOCKED), AN-REVIEW (re-run mutations a, b, d with a-round-96/run-mutations.py model in C's own scratch), T96-TARGETED (`npx vitest run $(cat ../tmp/studio-real-loop/a-round-96/targeted-list.txt)` → expect 6 files / 83 tests), SOURCE-UNCHANGED (end-hashes above).

## code-reviewer (real subagent run; score 9/10; Critical 0, High 0, Medium 0)
The reviewer only read files. It ran no shell commands, so all test and check results here are A's own runs.
| finding | disposition |
|---|---|
| Low: FS7 checks the status only with `not.toBe` | FIXED. FS7 now asserts the exact success text `„Ready Song“ დაემატა მუსიკა ხაზზე ${formatArrangementTime(0)}-ზე.` and `clips[0].start === 0`. `formatArrangementTime` is imported from ArrangementContext, not from a test file. After the fix: Biome format failed once on line width, the line was wrapped, and Biome is now clean. Fail-before, mutations and the targeted run were redone (same results). |
| Low: doc 084 cites tmp/ scratch paths | FIXED. Doc 084 now says the tmp/ paths are ephemeral loop scratch and gives the results inline. |
| Nit: preview block reads `sourceStates[sourceId]` twice | DEFERRED. Hoisting a `const` would change the guard line, which is outside hunk (a) baseline l.1199–1203. Behaviour is the same. |
| Nit: loading text is still inline in 2 places (no helper) | DEFERRED. The task requires the loading text to stay byte-identical, with at most one new module-level constant/function. |
| Nit: redundant `not.toContain('(ქსელი)')`; empty `restoreAllMocks` | KEPT. The task requires the `(ქსელი)` check, and the afterEach restore is the requested stub hygiene. |
| Nit: UX wording; 084 status format | KEPT. This is B's chosen wording, and the status line follows the convention of docs 081–083. |

### Architecture note (verbatim, for B)
> - **Signal 3 (one region changed repeatedly), `/home/runner/czaba-project/store/app/contexts/ArrangementContext.tsx:1197-1211` and `:1308-1328`:** Round 95 (draggable/error row, loader text) and round 96 both touched the library-source refusal texts. Each time it needed the full provider mount plus fake AudioContext and clock, now copied into another test file. **Keep for now:** the change is small, it involves no audio timing, refs, gesture or Undo/Redo logic, and the public hook shape didn't move. Value of extracting now: low.
> - **Proposal for the planner (not an instruction):** If another round touches these refusal texts, consider one bounded task. Move the refusal-reason mapping into a pure function in `app/lib/arrangement/`, keep both callbacks in `ArrangementContext`, and cover the mapping with plain unit tests. Acceptance: FS1–FS8 still pass unchanged and the existing drop and preview tests are untouched.
> - No other signals: no new state, effect, timer or listener, and no ownership moved between context, component and lib.

A did not extract anything. This is a proposal for B or root only.

## Final verification (after review fixes)
- Biome on the 2 owned code files: exit 0, no diagnostics. typecheck: exit 0. lint: exit 0 (218 warnings + 1 info, none in owned files).
- Targeted vitest: 6 files / 83 tests pass.
- Fail-before (final test file on baseline c98fc743): FS1, FS2, FS4, FS8 red; FS3, FS5, FS6, FS7 green.
- Mutations a–f: same red sets as in the table; control 8/8 green.
- `git status --short`: 2 M + 2 ??. Frozen list 524/524. HEAD e3e5288 unchanged.
