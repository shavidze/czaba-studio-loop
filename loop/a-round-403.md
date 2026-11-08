# A round 403: PERF-14c-i (peaks client hardening + minimum-zoom zoom-key harness rows)

**STOP: none.** No Medium+ finding from either review pass. No covering test is above 50 % of its timeout.

## Scope completed
- B's patch `b-round-402/sketch-403.patch.txt` (sha256 `5cc6d634…067a`, the same sha that `sketch-review.md` names) was applied byte-for-byte with `git apply` (the `--check` was clean). Its 4 files were not edited afterwards.
- Doc 257 is new. Doc 254 has its two contract subsections changed and l.4 unchanged. Doc 228 has exactly the two §1 edits and l.4 unchanged.
- No protected file, auth, route, config or package file was touched. Nothing was committed or pushed.

## Changed files (`git status --short --untracked-files=all`: 6 M + 1 ??)
- M `app/lib/arrangement/peaks.client.ts` (patch)
- M `app/lib/arrangement/__tests__/peaks-worker.test.ts` (patch)
- M `perf/studio-lab-scale.perf.spec.ts` (patch)
- M `perf/budgets.scale.json` (patch)
- M `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`:
  - l.108 now reads `C round 312`;
  - the TODO line that starts `- **Round 315-ის review-ის Low შენიშვნები` gets the exact §1 suffix.
- M `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md`:
  - the heading becomes `(a–i)`;
  - a step i bullet is added;
  - the "i ნაბიჯის row-ები" table is added inside `### Budget-ები`, with v2 sketch values.
- ?? `docs/implementation/2026/quarter-IV/257-perf-peaks-client-hardening.md`:
  - l.4 is byte-exact `**სტატუსი:** In Progress (stage 4 of 6; C round 403 PASS)`;
  - the 7 TEMPLATE headings are in order.

Full diff: `a-round-403/round-403.diff.txt` (tracked files only).

## Checks (all actually run; logs in `a-round-403/`)
| # | Result | Evidence |
|---|---|---|
| A1 | PASS. Claims at start are identical to the planning output; stderr is empty | `claims-start.txt` |
| A2 | PASS. `npm run typecheck` rc 0; `npm run lint` rc 0 (205 pre-existing warnings, 0 errors). Scoped `npx biome check` on the 2 owned `app/` files rc 0. Biome does not cover `perf/` (L30) | `typecheck.log`, `lint.log`, `biome.log` |
| A3 | PASS. 9 files, 109/109. `peaks-worker.test.ts` has **33 tests** and took 1,295 ms (its slowest test is PW1 at 1,106 ms against the 5 s default, 22 %). Slowest test overall: CP12a 4,178 ms against `{ timeout: 30_000 }` (14 %). No test is above 50 % of its timeout | `vitest-covering.log`, `vitest-covering.json`, `vitest-covering-durations.txt` |
| A4 | PASS. perf-lib config: 3 files, 54/54 | `perf-lib.log` |
| A5 | PASS. Scale spec run alone (nothing else running; its own build on :5188, so :5173 was untouched). rc 0, `complete` true, `failures` [], `problems` [] in all 3 passes, 31 rows. All 23 HEAD rows' deterministic samples equal `c-round-402/perf-scale.json` (0 diffs). The 8 new rows exist and are all `record`. `components-per-key` is 121.1 at both 1x and 6x; `commits-per-key` is 1 at both | `perf-scale.log`, `perf-scale.json`, `scale-compare.txt` |
| A6 | PASS. Claims at end differ from `claims-403-sketch-output.txt` only on K2 (status 7 lines; HEAD 7d7d7b2), K6, K7 (6 → 7) and K25 (suffix 1). K5 is the same in both files (`applies-on-tree no`). K19 and K20 already match the sketch output (K20: PW-ids 19 → 27). K3 frozen: 0 failures | `claims-end.txt` (stderr empty) |
| A7 | PASS. `code-reviewer` pass 1 found no Critical, High or Medium, plus 7 Low/info. The doc Lows 2–5 were fixed in doc 257 and delta re-review 1 found them accurate, no new Medium+. After that, the 8-row step-i table was added to doc 257 (D-29z1386 says doc 257 holds it), and the 6x-budget sentence in docs 254 and 257 now reads "B decides after the 14c-ii measurement". Delta re-review 2 found both accurate (10/10). Claims were re-run after the last edit: only K2, K6, K7 and K25 differ. The doc 228 diff is 2 insertions and 2 deletions; l.4 of docs 228 and 254 is untouched. Port 5188 is free after A5 | this file, §Review |

Wallclock note (record rows only; not a regression signal): A's 6x min-zoom keydown was 136/136/152 ms, against B's v2 run at 112/120/112. The 1x values were 24/24/32.

## Review findings (code-reviewer pass 1)
- **Fixed in doc 257:**
  - L2: requesting-job wording ("enqueued by this call", not "started").
  - L3: basis of the PW-id count 19 → 27 (literal `it('PW…')` ids, as in K20).
  - L4: only PW27 is multi-job; PW29 is single-job.
  - L5: the full doc-254 heading is now cited.
- **Not fixed: inside patch-only files or B's byte-specified text. For B:**
  - **A-R403-REVIEW-L1 (Low, test gap).** The `job === requesting` branch is exercised only when the requesting job is `pending[0]`. The untested case: a nested `request(D)` made from `onPeaks` while `[B, C]` are already queued, after which `post('begin')` fails. A mutant `index === 0` would survive. Proposed row: B's compute throws and is rethrown on a timer, C is delivered, and D's throw comes out of `request(D)`.
  - **A-R403-REVIEW-L6 (Low, doc 228).** The byte-specified suffix "დაიხურა PERF-14c-i-ში" does not mention that L2 closed with a residual (A-R403-L2-RESIDUAL-QUEUED-THROW). Doc 257 does record it. The §1 text wins, so it was left unchanged.
  - **A-R403-REVIEW-L7 (info).** The 8 new JSON notes in `perf/budgets.scale.json` cite `b-round-402/perf-sketch-scale.json` (v1: 6x components 112.4, wallclock 144/80/88). The task's K10 and docs 254/257 use v2, `perf-sketch-scale-v2.json` (121.1). Docs 254 and 257 say this explicitly.
  - Context only: `dispose()` does not reset `workerFailed`. This predates the patch, and PW25 scopes its test correctly.
- **Architecture note (proposal for B/root, not acted on):** `requesting`/`requestingFailure` are an error side-channel. One bounded task could add an `onError` callback per job to `request`. It would remove the side-channel and the residual. It is outside the grants because it touches `ArrangementContext.tsx`. It matches A-R403-L2-RESIDUAL-QUEUED-THROW.

## Known gaps
- A ran no browser rows; rows 3–5 belong to C. Full vitest, build and verify belong to the root gate.
- The residual A-R403-L2-RESIDUAL-QUEUED-THROW is still present by design (deferred Low).

## Exact next C checks
- Rows 1–11 of the task, run in the task's order: browser rows 3–5 (row 4 on a scratch build of this working tree, on its own port), then row 6 alone, then the rest.
- Row 2: compare `git diff` of the 4 patch files with `sketch-403.patch.txt`, ignoring `index` lines.
- Row 10: doc 228's diff must be exactly 2 changed lines. Doc 254's l.4 is unchanged. In doc 257, check the 4 reworded sentences against the review notes above.
- Row 7 mutants: MU-403-REQUESTING-DEFERRED should turn PW29 red, and MU-403-REPLIED-ON-GARBAGE should turn PW24b red.

## B acceptance criteria passed by A
A1, A2, A3, A4, A5, A6, A7. This covers only A's rows. The stage is not done until C passes it.
