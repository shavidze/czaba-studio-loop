# A round 417 — SYS-CLOCK-DETERMINISM (test-only)

Status: IMPLEMENTED. No STOP. One reviewer Medium on B's sketch (BW5 method, ruling 3) is routed to B, not edited (L11: a reviewer-suggested change to a ruled formula is a STOP-class change, not A's to make). See "For B".

## Changed files (`git status --short --untracked-files=all`: 5 ` M`, 1 `??`)
- `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` (sketch only)
- `app/lib/arrangement/__tests__/tempo-window.test.ts` (sketch only)
- `docs/implementation/2026/quarter-IV/268-sys-clock-determinism.md` (new)

The five test files are exactly `b-round-416/sketch-417.patch.txt` (sha256 `70a75d989b19b4343fa590972de199d21721c6ab2aaf1bea696302725817e3f3`, matches K11), applied from `store/` with `git apply --check` then `git apply`; not edited afterwards. No runtime, helper, protected, config or package file touched.

## Checks (all actually run by A)
| # | Check | Result | Log |
|---|---|---|---|
| A1 | claims at start | rc 0, stderr empty, `diff` vs `claims-417-planning-output.txt`: identical | `a-round-417/claims-start.txt` |
| A2 | vitest, 5 files | rc 0, 5 files, **63/63**. EN10 126 ms, VDS3 178 ms, SF11 76 ms, IM24 73 ms, BW5 11 ms (all far below timeouts) | `a-round-417/vitest-a2.log` |
| A3 | `npm run typecheck` / `npm run lint` | rc 0 / rc 0 (205 warnings, 1 info — same as B's precheck and round 415) | `a-round-417/typecheck.log`, `a-round-417/lint.log` |
| A4 | `npx biome check` on the 5 test files | rc 0, "No fixes applied" | `a-round-417/biome-5.log` |
| A5 | claims at end (after the doc fixes) | rc 0, stderr empty; vs planning output differs only in K2 (`1 ?? 5 M total 6`), K5 (`no`), K6 (doc 268 l.4) and K10 (equal to `claims-417-sketch-output.txt` line). K3 1,311 rc 0 and K4 unchanged | `a-round-417/claims-end.txt` |
| A6 | code-reviewer (real subagent, 6 files) | 0 Critical/High; 2 Medium (1 on sketch → For B; 1 doc → fixed); 5 Low (doc ones fixed, the rest → For B). Score 8/10 | below |

Doc 268 checks: l.4 byte-exact `**სტატუსი:** Completed (C round 417 PASS)`; 7 TEMPLATE `## ` headings in order; the mutant block equals `b-round-416/mutants/summary.txt` (12 lines; substring match including fences, `/tmp/a417chk.py`); numbers 442, 6,784,880, 1,000 and 50 ms with source `b-round-416/probe/vds3-advance.md`; the 6 closed ids present.

Not run by A: full suite, `npm run verify`, build (gate rows); no browser (test-only round; rows 4–6 belong to C).

## Reviewer findings and actions
| Id | Sev | Origin | Finding | Action |
|---|---|---|---|---|
| A-R417-REVIEW-M1-BW5-READCOUNT-HOIST | Medium | B spec | BW5's read-count works only because `barsRulerMarks` (`tempo.ts` ~l.88/103) reads `rulerWindow.fromPx/toPx` inside the loop; a harmless refactor hoisting them (`const { fromPx, toPx } = rulerWindow`) drops reads to ~4 and a full-build regression would then pass `≤ 1_000`. Today non-vacuous (MU-BW5-FULLBUILD red on sketch). Proposed guard: also `expect(windowReads.count).toBeGreaterThan(marks.length)` or a read-independent work signal | **Not edited** (targets ruling 3; L11). Routed to B for a ruling |
| A-R417-REVIEW-M2-DOC-IM24-FILELOCAL | Medium (doc) | B spec (ruling 2 text) → A doc | Doc said EN10, VDS3 and IM24 keep file-local fakes; IM24 actually gets `fakeClock` and fakes from `createWorkspaceTestEnvironment()` (`insert-marker-ui.test.tsx` l.24, l.34–40); only its rAF capture is file-local | **Fixed in doc 268** (ruling-2 paragraph and TODO now name only EN10 and VDS3). Task ruling 2 has the same misstatement (Low, B to correct backlog/SIG text) |
| A-R417-REVIEW-L1-IM24-ADVANCE-NOOP | Low | B spec | IM24 `advance(0.05)` is probably a no-op (Date.now frozen; position held at 16; end-stop fires on `current >= end` anyway). Unverified by running | Not edited (ruled step, [K9 endstop]). For B |
| A-R417-REVIEW-L2-SF11-NOFLAG-LEAK | Low | B spec | On the NOFLAG failure path, `window.setInterval(() => undefined, 1_000)` starts a real interval that is never cleared. Harmless when passing; alternative: compare `window.setInterval` against the saved original | Not edited. For B |
| A-R417-REVIEW-L3-VDS3-HARDCODED-50 | Low | B spec | `advanceTimersByTime(50)` duplicates the unexported `PLAYBACK_LOOKAHEAD`; a lookahead change would fail VDS3 with a confusing message. Doc already calls it load-bearing | Not edited. For B |
| A-R417-REVIEW-L4-DOC-25-SUITES | Low | A | "25 suite" unclear; reviewer counted 28 importers of either helper | **Fixed in doc**: 25 = `createWorkspaceTestEnvironment` users (K9), 3 = `fake-web-audio.ts` users (counted by grep: 3 and 25) |
| A-R417-REVIEW-L5-DOC-CODE-QUOTES | Low | A | Doc quotes short source lines (TEMPLATE discourages code fragments) | Kept: they are the K9 grep strings used as source citations. Note only |

Doc delta after review: three edits in doc 268 only (ruling-2 paragraph, the alternative paragraph's suite counts, the TODO line). No code changed after the review, so no re-review is required (L11 re-review clause covers code).

## For B
1. **Rule A-R417-REVIEW-M1** (BW5 hoist fragility on the sketch's ruling-3 method). A did not STOP because the objection is to the ruled method's future robustness, not a present defect (mutant red on sketch); if B/C judges it an unruled Medium under L58, it is a `B spec` finding.
2. **L58 planning gap:** `b-round-416/sketch-review.md` does not exist, and `claims-417.sh` does not run `tools/l58-check.py` (grep `l58` = 0 hits), although L58 (RETRO 416) requires both for every `git apply` sketch dispatch. Same class as round 415. Not a STOP for A; C will likely check it.
3. Task ruling 2 says IM24 keeps a file-local fake; it uses the shared helper (see M2). Correct SIG-R415-WORKSPACE-ENV-CONVERGENCE scope to EN10 + VDS3.
4. **Architecture note (reviewer, proposal only, not acted on):** frozen-clock + file-local fake setup repeats in `marker-edge-nav-ui.test.tsx` l.27–31 and `video-dock-strings-ui.test.tsx` l.27/63, plus per-row `Date.now` spies and the IM24 rAF capture. Keep now (helpers frozen, ~28 suites). Proposed bounded task under SIG-R415: opt-in `frozenClock` and `captureFrames` options on `createWorkspaceTestEnvironment`, move EN10 and VDS3 onto it; acceptance: all other suites byte-identical, existing mutants keep red/green. Alternative noted: helper-level clock where `currentTime` comes from a counter, removing the class entirely.

## Exact next C checks
- Row 1: claims start = `a-round-417/claims-end.txt` expectations (K2 `1 ?? 5 M total 6`, K5 `no`, K6 doc 268 l.4, K10 sketch line); K14 7 ids, none NOT-FOUND; frozen 1,311 rc 0; protected rc 0.
- Row 2: `cmp` the 5 files against `sketch-417.patch.txt` applied to a `git archive HEAD` scratch; A2 command 63/63; `git diff -U0` hunks only in EN10/VDS3/SF11/IM24/BW5 bodies, VDS `afterEach`, SF destructuring.
- Row 3: mutants on a HEAD-base scratch via a copy of `b-round-416` (12 lines equal) + loaded replicate (2 busy loops) 63/63.
- Rows 4–6: browser at both viewports (IM24 end-stop contract; play/stop smoke; auth guard).
- Row 7: doc 268, including the corrected ruling-2/TODO lines and the 25/3 suite counts.
- Row 8: end scope + `l57-check.py`; also decide on A-R417-REVIEW-M1 and the missing `sketch-review.md`.

## B acceptance passed by A
A1, A2, A3, A4, A5 passed. A6: reviewer ran; no Critical/High; one Medium on the sketch logic (M1) routed to B rather than claimed as clean — A6's "no Medium in sketch logic" is therefore **not** claimed as passed.
