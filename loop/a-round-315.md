# A round 315 — PERF-5b robustness batch (A-R312-REVIEW-L1…L5)

**Status:** A rows done. No STOP. Waiting on C (browser rows) and the root gate. PERF-5b is **not** marked done by A.

## Changed files (store/, exactly the 6 expected entries)
- M `app/lib/arrangement/peaks.client.ts`: byte-equal (`cmp`) to `b-round-314/sketch-peaks.client.ts.txt`.
- M `app/contexts/ArrangementContext.tsx`: byte-equal to `sketch-ArrangementContext.tsx.txt`.
- M `app/lib/arrangement/__tests__/peaks-worker.test.ts`: byte-equal to `sketch-peaks-worker.test.ts.txt`. Nothing was appended; see the advisor note below.
- ?? `app/lib/arrangement/__tests__/peaks-worker-video.test.tsx`: new, PW19.
- M `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`:
  - l.4 is `**სტატუსი:** Completed (C round 315 PASS)`;
  - the six granted sections were rewritten;
  - the "მოლოდინშია" sentence is gone.
- M `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`: one line changed ("C-ის შემოწმება მოლოდინშია." → "C round 314 PASS.").

## A rows (all actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: equal to `claims-315-head-output.txt` before editing | `a-round-315/claims-before.txt` (equal to the HEAD output) |
| A-APPLY | PASS: `git apply` OK; both app files `cmp`-equal | — |
| A-TESTS | PASS: PW19 written per the recipe; the sketch test file is unchanged | `peaks-worker-video.test.tsx` |
| A-TYPE | PASS: rc 0 | `a-round-315/typecheck.log` |
| A-LINT | PASS: rc 0 (205 pre-existing warnings). Biome scoped to the 4 code files: rc 0 | `lint.log`, `biome-scoped.log` |
| A-UNIT | PASS: 9 files, 98/98 (both peaks files + the 8 covering files). Slowest test: CP12a ~3.6 s, under a 30 s describe timeout (well under 50 %) | `a-round-315/a-unit.log` |
| A-MUTANTS | PASS: `unit-mutants.py` on the scratch `/tmp/a315-scratch` (own vitest `cacheDir`) prints output identical to `precheck-unit-mutants.txt` (10 red, MU-REPLIED-AFTER-FILTER equivalent, restored 25 passed). A's MU-VIDEO-BUFFER-BEFORE-PEAKS: PW19 red at **step 3, l.244** (`not.toContain(buffer)`); restored 1 passed. Extra check: removing the video re-sync turns PW19 red at step 5 (`toContain(buffer)`, now l.255; run on an earlier file version) | `a-round-315/unit-mutants.txt`, `video-mutant.txt`, `video-mutant.py` |
| A-DOC | Done: doc 228 headings in TEMPLATE order (7); doc 163 one changed line | — |
| A-REVIEW | Done: code-reviewer, full pass (8.5/10, 0 Medium+), then a scoped re-review after the fixes (9/10, 0 Medium+). I fixed its last two Lows (the doc range, PW19 `try/finally` cleanup) and re-ran the checks | below |

Protected and config files: `sha256sum -c b-round-312/protected-sha256.txt` gives 11/11 OK (`a-round-315/protected.log`).

## Review findings and handling
- **Fixed inside the grants:**
  - PW19: the `URL.revokeObjectURL` descriptor is restored and the view unmounts in `afterEach`, wrapped in `try/finally`.
  - Doc 228: PW15 wording (`begin` has no reply, so the row is 3 acks and then a wait), the callback-error vs compute-error distinction, the "at most once" qualification, PW7b listed, the PW12-PW13 describe range.
- **Not fixable this round, reported to B as Lows.** The cause is that `peaks.client.ts` is frozen to the sketch and `peaks-worker.test.ts` is append-only:
  1. **A-R315-REVIEW-L1:** `dispose()` does not reset `workerReplied`. After a `request()` that follows `dispose()`, a new worker gets only 3 s. This is unreachable from the context, because the ref is nulled on unmount. (`peaks.client.ts:256-268`)
  2. **A-R315-REVIEW-L2:** a `computePeaksOnMainThread` exception sits outside `try`, by design (§4.1). On the synchronous path it leaves `request()`, so the collection `.catch` would mark the source `error`; inside `failWorker` it stops the loop. Unlikely with a valid AudioBuffer. (`peaks.client.ts:82`)
  3. **A-R315-REVIEW-L3:** no row covers "no Worker + throwing `onPeaks`" (`request()` does not throw; the error is rethrown on a timer). **Deliberately not appended:** such a row would also go red under MU-DELIVER-*, so the red-row lists would differ from `precheck-unit-mutants.txt` and A-MUTANTS / C's UNIT row would fail. B should add it with an updated precheck.
  4. **A-R315-REVIEW-L4:** the `PW12-PW13` describe's `afterEach` (`peaks-worker.test.ts:678-681`) does not call `vi.useRealTimers()`. PW16 switches to fake timers partway through the test. This is cleanup only.
  5. **Info:** if N collection sources become ready during playback, each one triggers a graph rebuild. Video already behaved this way. Unreachable in `/studio-lab` (no initial clips).
  6. **Info:** the export `loading` gap is now slightly wider (decode + peaks). It is already B-R314-EXPORT-LOADING-GATE.
- **Architecture note (a proposal for B/root, not acted on):** the "source ready" sequence (guard → `buffersRef.set` → `setSourcePeaks` → ready → re-sync) is duplicated at `ArrangementContext.tsx` ~2506 and ~3924, and rounds 312 and 315 both changed it. Reviewer: keep it in the context and extract a local `commitDecodedSource` `useCallback`. Acceptance: PW11/PW18/PW19 unchanged and green. Low cost.

## Claims vs `claims-315-sketch-output.txt` (for C's CLAIMS row)
Run on A's tree (`a-round-315/claims-after.txt`). Every difference is by design:
- K2 `6 abfcf78`; K9 `Completed (C round 315 PASS)`; K10 `0 0`; K18 `11`. These are listed in C's row.
- **K8 now also lists `peaks-worker-video.test.tsx`.** C's row does not list this one, but it follows from the PW19 recipe, which requires a fake peaks Worker (`vi.stubGlobal('Worker', …)`). It is expected and is not a defect.
- K7 and K11 are unchanged: the new file names no constant, and nothing was appended.

## Known gaps
- No browser check was run by A. PK-LOAD, PK-COLD-START, PK-VIDEO-SOUND, PK-PERF-LOAD and G315-AUTH belong to C. I did not run them, so I claim nothing about them.
- The full suite, build and `verify` were not run (speed rules: these belong to the gate).
- The Lows A-R315-REVIEW-L1…L4 listed above.

## Exact next C checks
1. SOURCE-SCOPE: the 6 entries above; protected 11/11.
2. CLAIMS: expect the K8 extra file noted above.
3. SKETCH-EQUAL: the two app files are `cmp`-equal; the test-file diff is empty (0 added lines).
4. UNIT: A-UNIT's 9-file list on C's own scratch; `unit-mutants.py` + `a-round-315/video-mutant.py <scratch>` (expect red at l.244) + C's own `deliver` / cold-start mutant.
5. PK-LOAD, PK-COLD-START (HEAD vs A's tree, 4 s hold), PK-VIDEO-SOUND, PK-PERF-LOAD (`rowcmp` 164/164), DOC, G315-AUTH, as in the task §3.2. Use the existing server http://127.0.0.1:5173 only where a dev server is meant; the production builds use their own ports.

## Scope completed
The PERF-5b robustness batch (L1–L5) is implemented exactly as the sketch, plus PW19 and the docs. A-R312-REVIEW-L1…L5 are not "done" until C PASS.
