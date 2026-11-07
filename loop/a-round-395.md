# A round 395: PERF-13c-ii-a fix-up (C-R394-01: a wave click during a stalled stream keeps the stall watchdog alive)

**Status:** implementation done and handed to C. No STOP. There is no browser evidence yet: the R1b/R1–R7/PERF-RES/AUTH rows belong to C. Full verify and build belong to the gate.

## Changed files (delta on top of the round-394 tree; round-394 work kept, not reverted or re-applied)
- `app/lib/arrangement/preview.client.ts`: B's sketch `b-round-394/sketch-395.patch.txt` (sha256 558694697085f2bc…, verified) applied verbatim with `git apply`, no other line changed:
  - new field `ActiveStreamPreview.restartArmedStall: () => void`;
  - `handleProgress` renamed to `restartArmedStall`, in both the `progress` add and remove calls;
  - `active.restartArmedStall()` called inside the existing seek `try`, after `active.element.currentTime = start`.
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx`:
  - the sketch applied verbatim: PS22 gets its 2 asserts (`throwingTime` has no `src`; `second.getLibraryPreviewOffset()` is `null`), and PS25 and PS26 are appended to the `PERF-13c-ii-a stream lifecycle robustness` describe;
  - **one deviation from the sketch (test only, adds asserts, removes none):** after the code-reviewer's Medium, PS26 also spies on `EventTarget.prototype.addEventListener`. It checks that each `(type, handler)` pair removed on stop is exactly a pair added to that element (6 and 6). The sketch's sorted-types assert is kept unchanged. The row id, the row count and the row order are unchanged (K10 equals the sketch).
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`:
  - l.1 now ends in `(rounds 393–395)`;
  - l.4 now reads, byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 395 PASS)`;
  - the stage-2 heading is now `rounds 394–395`;
  - new content: the C-R394-01 cause; the D-29z1348 seek-restart rule and why; the state edge `Armed --> Armed: same-URL seek (restart, armedAt = ახალი დრო)`; the sketch numbers 8296/8300 ms and 4.99 from `b-round-394/probe/rows-R1b.json`; PS25, PS26 and the PS22 additions; the 3 MU-395 mutants plus `MU-A395-PROGRESS-REMOVES-WRONG-HANDLER`; a note that the progress-trickle known gap does not widen;
  - checks: `grep -c "round 394 PASS"` = 0; 7 `## ` headings in TEMPLATE order, none added; TODO still has stage 3 = PERF-13c-ii-b.

## Commands run (logs in `a-round-395/`)
| Command | Result | Log |
|---|---|---|
| claims at start | rc 0; **identical** to `b-round-394/claims-395-planning-output.txt` | `claims-start.txt` |
| `npm run typecheck` (final tree) | rc 0 | `typecheck-final.log` (first run: `typecheck.log`, rc 0) |
| `npx biome check` on the 2 code paths (final) | rc 0, no fixes | `biome-scoped-final.log` |
| `npm run lint` (final) | rc 0 (205 warnings, 1 info, all outside the 2 owned paths: `grep` for them in the log gives 0 hits) | `lint-final.log` |
| `npx vitest run` covering set (14 files, `a-round-393/covering-files.txt`), final tree | rc 0, 14 files, 258 tests | `covering-final.log` (first run: `covering.log`) |
| mutants (B's runner retargeted to scratch `/tmp/a395-scratch`), final tree | **15/15 RED**, pristine rc 0 | `mutants/summary.txt`, `mutants/mutant-*.log`, `mutants/run.py` |
| extra mutant `MU-A395-PROGRESS-REMOVES-WRONG-HANDLER` (`removeEventListener('progress', armStall)`) | RED on PS26 (rc 1) | `mutants/mutant-MU-A395-PROGRESS-REMOVES-WRONG-HANDLER.log` |
| `library-preview-stream.test.tsx` alone after the PS26 change | rc 0, 25 tests | `ps26-pristine.log` |
| claims at end | rc 0; differs from the planning output only in K8 (seek-restart / restart-field / progress-uses-restart 0→1), K10 (25, last PS26), K11 (l.4 → round 395) and K18 (applies-to-tree no), exactly as §7. Differs from `claims-395-on-sketch.txt` only in K11 (the doc line) | `claims-end.txt` |
| `git status` | only the 3 grants modified; HEAD `1091b9e` | — |

**Mutant rows (§5):**
- PS25: red on MU-395-SEEK-NO-REARM, MU-394-NO-WATCHDOG and MU-394-DEFAULT-DELAY.
- PS26: red on MU-395-PAUSE-LISTENER-LEFT. With the stronger assert it is now also red on MU-394-PLAYING-NOT-DISARM, NO-WAITING-REARM and PAUSE-IGNORED.
- PS22: red on MU-394-SYNC-THROW-START.
- PS19: red on MU-395-SEEK-ARMS-ALWAYS.
- All 12 MU-394 mutants stay red.

**L31:** the slowest covering test is LRS4 at about 2.0 s, under its 15 s timeout. No test is above 50 % of its timeout.

Not run by A, per the speed rules: the full suite, `verify`, the build and the browser. The code was not deployed.

## Code-reviewer (actual subagent, run twice)
1. **First review, of the whole diff** (score 8.5): the rule is judged correct. No Critical or High.
   - **Medium, PS26 checks only event types, not handlers:** fixed in the test file (see the deviation above). The fix is inside the grants, adds asserts only and does not change the §1 semantics.
   - **Low, re-entrancy in the seek branch:** a fake element that synchronously dispatches `pause`/`error` during the `currentTime` setter would make `active` null. Then `active.restartArmedStall()` throws, and `catch` calls `active.fail()` on null. Real browsers fire these events asynchronously. **Not fixed:** §3 says "No other line changes". It goes to B as a recorded Low (A-R395-REVIEW-L1-SEEK-REENTRANT), next to A-R394-REVIEW-L3. The suggested fix is `const current = active;` in the seek branch.
   - **Low, missing test:** a seek that throws while the timer is armed before `playing` (expect `pending() === 0` and `onError` once). PS23 covers the throw only after `playing`. **Not added:** a new row would change K10 (`last PS26`). It goes to B as A-R395-REVIEW-L2-THROW-WHILE-ARMED.
   - **Architecture note:** none. The new field follows the existing `fail` handle pattern. The known signal A-R394-ARCH-STREAM-WATCHDOG-UNIT still stands.
2. **Re-review after the PS26 change** (score 9): no Critical, High or Medium. It confirmed the spy restore (`afterEach` → `vi.restoreAllMocks`), `mock.contexts`, function-reference equality, that the test cannot pass vacuously, and that it has no `as`/`any`.
   - Low: give the new mutant an id in the doc. Done: `MU-A395-PROGRESS-REMOVES-WRONG-HANDLER` and its log path are now cited.
   - Order note: the mutant id was added to doc 252's PS26 bullet after this re-review. That edit is doc text only, with no code change.
   - Lows not acted on: the sorted-type assert is now redundant (kept because the task row requires it), and the spy has to be created before play (correct as written).

## B acceptance criteria actually passed by A
- §3.1: source change exactly as §1 D-29z1348 (sketch verbatim).
- §3.2: PS25, PS26 and the PS22 asserts are in; PS1–PS24 are unchanged except for PS22's 2 added asserts.
- §3.3: doc l.4 byte-exact; title range; 0 hits for "round 394 PASS"; 7 headings; cited ids and files exist (checked with grep/ls).
- §5: the rows and their mutants as listed; all 12 MU-394 red; covering set green; typecheck, lint and scoped Biome rc 0; claims at start and end; code-reviewer run and addressed.
- **Not passed by A (C's or the gate's):** R1b, R1–R7, PERF-RES, AUTH, SOURCE-SCOPE (C's own run), DOC-252 (C's read), and the gate row.

## Exact next checks for C
1. SOURCE-SCOPE at start: `bash b-round-394/claims-395.sh`. Expected: it equals `a-round-395/claims-end.txt`, and versus the planning output only the §7 facts differ. Run `sha256sum -c` on `b-round-393/r394-frozen-sha256.txt` (0 failures) and `b-round-318/protected-sha256.txt` (11).
2. **R1b, binding.** HOLD route → Middle East → Preview → click the wave at 5 % about 3.5 s later. Expected:
   - fallback status `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`;
   - exactly 1 decode (101.35 s) and 1 buffer start;
   - the toggle shows `Stop`; the element has no `src`;
   - click→start time between 7.5 and 11 s;
   - record `timeAfterSeek`;
   - both viewports.
3. Heaviest first: PERF-RES (run alone), then R1 and R3 (the false-positive guard: a seek while playing must not arm the timer), then R2, R4–R7 and AUTH.
4. DOC-252 per §6. Also check that the PS26 bullet matches the strengthened test.
5. jsdom-only (not browser): PS21(b), PS22, PS23 and PS26 rely on `a-round-395/mutants/summary.txt`.

## For B (signals, not acted on)
- A-R395-REVIEW-L1-SEEK-REENTRANT (Low): the re-entrancy above, in the player's seek branch.
- A-R395-REVIEW-L2-THROW-WHILE-ARMED (Low): a test row for a seek that throws while the timer is armed.
- The PS26 deviation from the sketch (a stronger assert). K10 is unchanged.
- No new architecture note. A-R394-ARCH-STREAM-WATCHDOG-UNIT still stands.
