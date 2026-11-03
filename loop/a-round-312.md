# A round 312: PERF-5a peaks worker (report)

No STOP. Base: HEAD `dfa4502`. The tree had no changes when the round started.

**L57 counts vs the task text:** the task expects 14 rows and 13 mutants. The final file has **17 rows** (B's 14 + PW12 + PW13 ×2) and there are **17 mutants** (B's 12 + MU-CONTEXT-BYPASS + 4 of A's own). The extra rows and mutants are additions from the review fixes and the `peakBucketCount` delta; no row was weakened.

## Changed files (exactly the §5 grants)
- M `app/contexts/ArrangementContext.tsx`: only the §4.4 hunks. The B sketch hunks are unchanged.
- M `app/lib/arrangement/peaks.ts`: `peakBucketCount` and `accumulatePeakChunk` appended. `computePeaks` and the other existing lines are unchanged.
- ?? `app/lib/arrangement/peaks.client.ts`
- ?? `app/lib/arrangement/peaks.worker-protocol.ts`
- ?? `app/lib/arrangement/peaks.worker.ts`
- ?? `app/lib/arrangement/__tests__/peaks-worker.test.ts`
- ?? `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`

`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-311-r312-tree-sha256.txt` fails only on the 2 M paths. No protected file, `perf/**`, `package.json`, `biome.json` or existing test file was touched.

## How it was built
1. `git apply b-round-311/sketch/sketch.patch.txt`. All 5 resulting files are byte-equal to the sketch `.txt` copies, and the test file equals `sketch-peaks-worker.test.ts.txt`.
2. **Delta 1 (contract §4.1, "invalid input"):** `peakBucketCount` returns 0 for a non-finite count. In the sketch it returned `NaN` for a NaN rate, while `computePeaks(...).length` gives 0. PW2 gains `[5, NaN]` and `[5, -48000]`.
3. **PW11 written.** It sits in `peaks-worker.test.ts` and uses `ArrangementProvider` with a probe, a FakePeaksWorker with `auto=false` and a marker array, and a stubbed `OfflineAudioContext`. The asserts run in this order:
   - before the reply: status is `loading` and `sourcePeaks` has no entry for the source (checked first, so MU-CONTEXT-BYPASS fails on the semantic assert);
   - one worker exists, and it received `begin` and `chunk`;
   - after the replies: `end` was posted, status is `ready`, and `sourcePeaks.get('tone')` is the marker (`toBe`);
   - after unmount: the worker is terminated.
4. **code-reviewer fixes.** The reviewer found two Mediums inside the grants (`peaks.client.ts`). Both are fixed, and the changed lines were sent for re-review:
   - **A-R312-REVIEW-M1:** a `request()` made inside `onPeaks` lost a queued job, because `handleReply` called `startNext()` unconditionally. It now calls it only when `!active`. Covered by **PW12**.
   - **A-R312-REVIEW-M2:** `postMessage` was not guarded. On `begin`, the job stayed active forever. On `chunk`, the exception reached the context `.catch`, which marked the source `error`, and the stall later delivered the job a second time. `post` now catches the throw, calls `failWorker()` and returns false, and `pump`/`startNext` stop at that point. This mirrors demo-synth DW11. Covered by **PW13** (begin and chunk).
   - These fixes do not change any §4 rule: the chunk size, the in-flight bound, the 3000 ms stall and "ready after peaks" are all unchanged.

## A rows
| Row | Result |
|---|---|
| A-CLAIMS | PASS. Before the edit, `claims-312.sh` output equals `claims-312-head-output.txt` (`a-round-312/claims-before.txt`, diff empty) |
| A-UNIT | PASS. 9 files, **119 tests passed** (`a-round-312/a-unit-final.log`, 17.4 s). peaks-worker has 17 rows: PW1, PW1b, PW2, PW3 ×2, PW4–PW7, PW7b, PW8–PW11, PW12, PW13 ×2. Every other file passes unchanged. File times: peaks-worker 717 ms, peaks 8 ms, waveform-zoom 1.6 s, clip-gain-waveform 1.7 s, clip-gain-pointer-preview 15.1 s, content-colour-ui 0.9 s, demo-synth-worker 5.7 s, collection-load-status 1.5 s, status-lifetime 4.1 s. **L11 headroom:** the slowest test is CP12a at 4.49 s against its 30 s describe timeout. Every other test is under 1 s against the 5 s default. No test is above 50 % of its timeout |
| A-MUTANTS | PASS. `a-round-312/scripts/mutants-a.py` ran on the scratch `/tmp/a312s` (copy of A's tree, `node_modules` symlinked; nothing ran in `store/`). Log: `a-round-312/mutants-a.txt`. All 17 mutants are red: B's 12, each red on at least its `sketch-mutants.txt` rows, plus MU-CONTEXT-BYPASS (PW11), and A's own MU-CONTEXT-READY-FIRST (PW11), MU-REENTRANT-STARTNEXT (PW12), MU-POST-UNGUARDED (PW13) and MU-BUCKETCOUNT-NAN (PW2). The restored code passes 17/17. The MU-CONTEXT-BYPASS diff is in `a-round-312/mu-context-bypass.patch.txt` and its log in `mu-context-bypass.log`; it fails on `expected 'ready' to be 'loading'`. The final run was made on a scratch re-synced to A's final tree (byte-equal), and the restored code passes 17/17. Four of B's mutants gained rows beyond `sketch-mutants.txt`: WORKER-PATH-DELETED (+PW11, PW12, PW13), NO-FALLBACK-ON-ERROR (+PW13), PARALLEL-JOBS (+PW12) and DISPOSE-NO-TERMINATE (+PW11). Every other mutant is red on exactly its sketch rows |
| A-TYPE/LINT | PASS. `npm run typecheck` rc 0. `npm run lint` rc 0 with 205 warnings and 1 info, the same as gate 311. Biome check scoped to the 6 owned code paths is clean (`biome-owned-final.log`) |
| A-REVIEW | Done with the real `code-reviewer` subagent (score 8/10, no Critical/High). Both Mediums were fixed inside the grants, and the changed lines were re-reviewed (result below). The Lows are for B (below) |
| A-DOC | Done. Doc 228: line 4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 312 PASS)`, the 7 TEMPLATE `## ` headings appear in order, and every PW id the doc cites exists in the test file |

## A's own browser check (not a C row)
`:5173` serves A's tree. B's `b-round-311/probe/peaks-identity.cjs` was run twice, once before the review fixes and once after (`a-round-312/browse/identity-a-1.json` and `-2.json`; the latest is copied to `a-browse.json`). Both runs show:
- `peaks.worker.ts` created once;
- `mainPeaksMs` empty;
- 9/9 preview-wave sha values equal to `identity-head.json`, each with 96 rects;
- 0 page errors;
- the status reads "Demo collection ready…".

A's own first smoke (`browse/smoke.cjs`) timed out because it waited for the status text to become *visible*. B's probe reads `[data-testid=arrangement-status]` and reached ready. This was a fault in A's script, not an app failure.

## Claims after A (`a-round-312/claims-after-raw.txt`)
Compared with `claims-312-sketch-output.txt`, the only differences are the expected ones: K2 `7 dfa4502`, K10 `234 3478`, K16 `1 228-perf-peaks-worker.md` and K17 `1`. K5–K9 equal the sketch output, including the K6 line numbers.

## For B (review Lows and the Architecture note; not fixed, by §4 rules or out of scope)
- **A-R312-REVIEW-L1:** the 3000 ms stall also covers the worker's cold start (module fetch, while the synth long task runs). A slow first start turns the worker off for the whole session; demo-synth uses 10 s. Changing this is a §4 rule change, so it is for B to rule on.
- **A-R312-REVIEW-L2:** `onPeaks` throwing:
  - in `handleReply`, `startNext` is skipped, and the stall later turns the worker off;
  - in the `failWorker` loop, the later jobs are lost.
  - Fix: try/finally. The context callbacks call setState only, so this is not reachable today.
- **A-R312-REVIEW-L3:** `buffersRef.current.set` stays before the request, as in the sketch; it was not part of the replaced block per §4.4/L49. While the worker runs, `syncPlayback` or export can already see the buffer of a source that is still `loading`; the library preview is guarded by its status check. The doc states this.
- **A-R312-REVIEW-L4:** missing tests:
  - no PW row covers the video call site (ready after peaks, the `videoSourcesRef` guard) or an empty buffer;
  - a mutant that arms the stall only at `begin` passes PW9;
  - in the worker path, an exception inside the video callback is no longer caught by its `try`.
- **Info:** abort is noticed only at the next ack. A job aborted while queued still posts `begin` and then `cancel`.
- **Architecture note (reviewer):** keep. The new lifecycle in `ArrangementContext.tsx` (≈ l.702–716) is only a ref and an unmount effect; the logic lives in `peaks.client.ts`. If a second consumer appears, propose a bounded `useSourcePeaksComputer` hook.

## Next C checks (exact)
1. SOURCE-SCOPE: `git status --short --untracked-files=all` shows 2 M + 5 ??, and `sha256sum -c` fails only on the 2 M paths.
2. CLAIMS: `bash b-round-311/claims-312.sh`. Expected deltas: K2 `7 dfa4502`, K16 `1 228-perf-peaks-worker.md`, K17 `1`. K5–K9 should equal the sketch output.
3. PK-UNIT: A-UNIT's file list. Expect peaks-worker 17 rows and 119 tests in total.
4. TESTS-READ: re-run `a-round-312/scripts/mutants-a.py` on a scratch copy, add C's own mutant, and check PW12/PW13 against the review fixes.
5. Browser rows PK-MAIN-THREAD, PK-IDENTITY, PK-CLIP-PATHS (both viewports, plus zoom), PK-READY-ORDER, PK-VIDEO, PK-COPY-BOUND, PK-ABORT, PK-PERF-HARNESS (run alone) and G312-AUTH, per §3.2.
6. DOC: doc 228 line 4 and headings. The doc's test claims should map to PW1–PW13.

## Scope completed
All of A's §3.1 rows ran and passed. The C rows and the gate rows were not run by A. The PERF-5 backlog item is not complete: 5b remains.

## Re-review of the fixes
The `code-reviewer` subagent re-reviewed the changed lines and scored them **9/10**.
- **M1 is closed** (`peaks.client.ts:198-204`). PW12 fails on the old code: the results are `['first','third']`.
- **M2 is closed** (`peaks.client.ts:74-85`). Every caller was checked after a failed post: `begin` returns before `armStall`, `chunk` returns, and the `end` and `cancel` failures go to `failWorker` and then to the empty-queue `clearTimeout`. PW13 fails on the old code at `not.toThrow()`.
- No new bug, no timer leak, no double delivery and no type assertion.
- New Lows for B:
  - **A-R312-REVIEW-L5:** PW13 does not cover a throw on `end` or `cancel`, and it has no timer-count assert.
  - **A-R312-REVIEW-L6 (Info):** a `dispose()` called from inside an `onPeaks` in the `failWorker` loop still delivers the remaining pending jobs. This is safe because the callers check `signal.aborted`.
- The doc lines 56, 72–73, 90–91 and 101 were confirmed accurate.
