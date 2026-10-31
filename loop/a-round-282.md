# A — round 282 (PERF-2 demo synth worker)

STOP — needs B ruling on DW3/DW9 (§6.1)

## The STOP (L11, §11 "a DW row cannot be written against the sketch as specified")
- DW3 and DW9 say all callers resolve to the emitted composition `c` with `toBe`. Against the byte-frozen sketch this cannot pass:
  `AssertionError: expected { …(2) } to be { …(2) } // Object.is equality … Received: serializes to the same string` (DW3 l.130, DW9).
- Cause: `readDemoComposition` in `demo-synth.client.ts` rebuilds the wrapper `{ mix, stems: { pulse, bass, pad, lead } }` to narrow the type without `as`. The five `Float32Array`s inside **are** the same objects as `c`'s (zero-copy hand-off); only the two wrapper objects are new.
- Blast radius: exactly DW3 and DW9. DW1, DW4–DW8 use `toBe` against `getDemoStemComposition()`, which returns the module-cached `cachedDemoComposition`, so they are unaffected.
- The two rows are left in the file **as literally specified (red)**. I did not swap in an adapted assertion.

### Options for B
- **(a) test-only (recommended).** Code stays byte-identical, so the bytes rows, perf numbers, EQUIV and every mutant are unchanged. In DW3 and DW9 replace `expect(result).toBe(composition)` with:
  ```ts
  expect(result).toStrictEqual(composition);
  expect(result.mix).toBe(composition.mix);
  for (const part of DEMO_STEM_PARTS) expect(result.stems[part]).toBe(composition.stems[part]);
  ```
  plus, in DW3, `expect(new Set(results).size).toBe(1)` (the 5 callers share one object). This is the stronger property: it pins the zero-copy hand-off, not the wrapper.
- **(b) code.** Return the received object when it is valid. Moves the six-file bytes, the `res.js.*` rows, EQUIV baselines and MU-SYNC-FALLBACK evidence. Expensive; not recommended.

## Fact for C: DW10 in vitest jsdom
Probe (temp test, removed): `self === window === globalThis` is true, the worker module sets `self.onmessage` (typeof function), but `window.dispatchEvent(new MessageEvent('message'))` produced **0** `postMessage` calls: vitest's jsdom global treats `onmessage` as a plain property, not the event-handler IDL attribute. DW10 therefore reads `self.onmessage`, nulls it, and calls it with a `MessageEvent` ("dispatch a MessageEvent to `self.onmessage`", §6.1).

## Files (tree = last consistent state)
- Sketch applied with `patch -p1 < b-round-281/sketch.diff`: `app/lib/arrangement/demo-synth.client.ts` (new), `app/lib/arrangement/demo-synth.worker.ts` (new), `app/data/studio-lab-demo.ts`, `perf/lib/instrumentation.ts`, `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`.
- New: `app/lib/arrangement/__tests__/demo-synth-worker.test.ts` (DW1–DW10; DW3/DW9 red).
- Not written (waits for the ruling, L26 forbids citing red rows): doc 211, docs 163/169 sections.

## Checks actually run
| Check | Result |
|---|---|
| Byte identity: six code files vs `git archive 000da42` + `sketch.diff` (`cmp`) | all 6 identical |
| `npm run typecheck` | rc 0; re-run on the final tree, after the test tightening: rc 0 |
| `npm run lint` | rc 0; 205 warnings, 1 info, 0 errors (repository-wide; my 4 app files have none) |
| Biome on the 4 `app/` files (client, worker, studio-lab-demo, new test) | 0 errors after `biome check --write` on the **new test file only** (formatting of the DW6 literal); the three sketch files needed no fix |
| `npx vitest run` new file + `demo-synth.test.ts`, `studio-lab-demo.test.ts`, `library-notice-ui.test.tsx`, `strings.test.ts` | 4 existing files PASS (89 tests); new file 9/11, **DW3 and DW9 red** (the STOP) |
| `claims.sh` on fresh `git archive 000da42` | identical to `claims-output-at-000da42.txt` except K1 `(archive)` vs `000da42`, which §6.2 item 6 predicts outside git. Script exit status 1 (its last command's exit status; output otherwise identical) |

### Unit mutants (scratch copies `/tmp/a282-mu/U*`, final tree + one line)
| Id | Mutation | Red rows | Named row red? |
|---|---|---|---|
| MU-U1 | `demoCompositionJob ??= …` → `=` | DW2, DW3, DW9 | yes (DW2) |
| MU-U2 | `worker.onerror = () => undefined;` | DW3, DW4, DW9 | yes (DW4) |
| MU-U3 | worker posts without `{ transfer }` | DW3, DW9, DW10 | yes (DW10) |
DW3/DW9 are red in every mutant only because they are already red on the unmutated tree (the STOP). The mutants were re-run after the test tightening below: same red rows.

### Test tightening after the review (test file only, inside the DW rows)
- DW2 runs under fake timers, so the job's real 10 s stall timer cannot fire later in the file.
- DW4, DW5, DW6 (a, b) and DW8 also assert the three handlers are `null` (helper `expectReleased`), as DW3 already does.

### Perf (valid evidence only if B picks option (a); the six code files = sketch, so (a) would not move them)
Ran alone in a scratch copy `/tmp/a282-perf` (`CI=true npx playwright test --config playwright.perf.config.ts`), nothing else running. Log and JSON: `a-round-282/perf/`.
- **Result: `3 passed (13.2m)`**, rc 0. PERF-1b-i 5.1 min, PERF-1b-ii 1.0 min, PERF-1a 6.8 min (wall time 13 m 12 s. The per-test timeout is 15 min; the longest spec, PERF-1a, used 6.8 min = 45 %, so none is above 50 %; ROOT-REQ-PERF-TIMEOUT unchanged).
- The production build inside the run succeeded (webServer `npm run build`), so the worker self-import concern raised by the reviewer does not break the build.
- PERF-1a load rows: `load.script-max` **assert PASS, median 46 [40…59]**, budget < 100; `load.settled-ms` 1561 (1548–1564); `load.ready-ms` 934; `load.longtask-max` 66 (51–82); `load.settled.longtask-max` 66 (51–82); `load.settled.longtasks-over-50` 1 (1–2); `load.commits` 5/5/5; `load.components` 371 ×3. No `harness.loaf-scripts` problem.

### EQUIV (§4), from `tmp/studio-real-loop` with A's JSON
| Spec | Result |
|---|---|
| 1a vs B's sketch | rc 0, 0 problems (320 rows) |
| 1a vs C round 281 (`--new` ×4, `--reclass` ×2) | rc 0, 0 problems; reclass commits [5,5,5]→[5,5,5], components [366×3]→[371×3] |
| 1b-i vs C round 281 | rc 0, 0 problems (144 rows) |
| 1b-ii vs B's sketch (3 `--tol`) | rc 0, 0 problems; tolerated `res.mem.used-ready-mib` 5.4→5.3. Bytes rows exact: studio-lab 366987 / 1162601, home 263571, studio-guard 286181 |
| 1b-ii vs C round 281 (`--free` ×5, 2 `--tol`) | rc 0, 0 problems; moved lines: the four `res.js.*` rows (366522→366987, 1161439→1162601, 263569→263571, 286179→286181). `res.mem.used-ready-mib` is `--free` but printed no "moved" line (its median did not move vs C 281); tolerated `res.export.1.peak-backing-delta-mib` 65.1→65 |

### MU-SYNC-FALLBACK (alone, after the perf run)
Scratch copy `/tmp/a282-musync` of the final tree + the one line; the applied diff equals `b-round-281/mu-sync-fallback.diff` byte for byte (`a-round-282/mu-sync-fallback-applied.diff`). `run-1a.sh` → `assert failed load.script-max: measured median 372 [364, 373, 372], budget < 100`, `1 failed`. Median ≥ 300: expected signal. Log: `a-round-282/mu-sync-fallback/run.log`.

## Code review (code-reviewer subagent, actually run; score 7/10)
The reviewer had no shell and did not run builds or tests. My perf run's production build covers its build-break concern. Findings on the **sketch code** cannot be fixed this round (byte-frozen, §4/§11). They go to B:
- **Medium (test, = this STOP):** DW3/DW9. The reviewer independently recommends option (a): returning the received object would need a type assertion (`as` or an unchecked `value is` predicate). In production structured clone breaks identity anyway. Proposed DW9: the second call `toBe(await first)`.
- **Medium (test gap):** the `postMessage`-throw fallback (client l.72–76) has no row. Proposal: DW11, a FakeWorker whose `postMessage` throws → sync composition, `terminate()` once, handlers null.
- **Low:** the worker imports from the `.client` file (`demo-synth.worker.ts:2`; the module that creates the worker). Vite handles the self-reference (it becomes `self.location.href`, and the build passed), but it breaks the repo pattern (`export-wav.worker.ts`, `sfx-export.worker.ts` import neutral modules).
- **Low:** no `signal.aborted` check after the new `await` in `loadDemoSource`. B's §2.3 ruling covers this: the effect drops aborted results [K21]. Recorded only.
- **Low:** `Object.entries(stems)` yields untyped values before the guards. No length check against 16 s × 48 kHz.
- **Low:** the worker ignores the message `type` (one message per worker today; a second would hit a DataCloneError → onerror → fallback).
- **Low (test):** DW10's sample loop compares the cached arrays with themselves (the worker and the test share the jsdom module cache). The transfer `toBe` checks are the real assertions. The row is kept as §6.1 specifies.
- **Architecture note (proposal for B/root, not acted on):** the worker↔main message protocol (`DemoSynthWorkerResponse`, `demoCompositionTransfer`) lives in the client that launches the worker, so the worker depends on its own launcher. One bounded task: move both into `demo-synth.ts` or a new `demo-synth-protocol.ts`. No behaviour change. Keep the shared job, the fallback and `loadDemoSource`.

## B acceptance status (only what truly passed)
- Passed by A: byte identity of the six code files; typecheck; lint rc 0; Biome on the 4 app files; 4 existing covering files (89 tests); DW1, DW2, DW4–DW8, DW10; MU-U1/U2/U3 red at their named rows; perf `3 passed`; `load.script-max` < 100; the five EQUIV commands; MU-SYNC-FALLBACK; claims.
- **Not passed:** DW3, DW9 (STOP). **Not done:** doc 211 and the doc 163/169 sections (they wait for the ruling; L26 forbids citing red rows).
- Not A's rows: browser rows (WORKER-BROWSER, LIBRARY-STATES, EXPORT-BITEXACT, SSR, G282-AUTH) are C's. Full vitest, build, verify and smoke are gate rows. I did no separate browser probe on :5173.

## Housekeeping
- I removed my own `a-round-282-checkpoint.md`, written earlier in this session. Its content is in this report.
- The temporary debug test `zz-a282-debug.test.ts` was created and removed during the DW10 probe. It is not in the tree.

## Next for B, then C
- **Suggestion for C (B and C decide):** UNIT will FAIL on DW3/DW9 as specified, so this round cannot PASS. A short round (SOURCE-SCOPE, HUNK-SCOPE, G282-AUTH) is enough now. PERF-RUN, SYNC-FALLBACK and the browser rows are better spent on the fix-up tree.
1. B rules on DW3/DW9: (a) or (b), and on the reviewer's DW11 proposal.
2. Fix-up (if (a)): edit DW3/DW9 (+ DW11 if granted), write doc 211 + the doc 163/169 sections, rerun the new test file and MU-U1…3. Perf/EQUIV/MU-SYNC-FALLBACK above remain valid because the code bytes stay unchanged.
3. C then runs the §8 rows. Watch HUNK-SCOPE on the test file (new) and SOURCE-SCOPE (currently 4 `M` + 3 `??`, docs not yet written).

