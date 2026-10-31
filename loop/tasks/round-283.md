# Round 283: PERF-2 fix-up (test file + docs only). DW3/DW9 pin the zero-copy hand-off instead of the wrapper object, DW10 compares against an independent composition, new DW11 covers the `postMessage` throw, and doc 211 plus the doc 163/169 sections are written. The six code files stay byte-identical

**Planned by:** B, at the round 282 → 283 planning, 2026-10-31. **Decisions:**
- D-29z666: round 282 closed as **C FAIL** on test and doc rows (C-R282-01 Medium, C-R282-02 Medium, C-R282-03 Low). Gate 282 `skipped`. All of C's browser and perf rows passed on the code bytes, which this round does not change. The round-282 outcome table (D-29z665, row 2) applies: a bounded fix-up with the same grants, narrowed.
- D-29z667: ruling on A's STOP: **option (a)**, test-only. The code stays byte-identical to `b-round-281/sketch.diff`. Option (b) (return the received object) is rejected. It would need a type assertion or an unchecked type predicate (CLAUDE.md: no `as`), and it would move the bytes rows, EQUIV and the mutants.
- D-29z668: DW10 is fixed (C-R282-03), DW11 is added (A's reviewer DW11 proposal), and there are two new named mutants, MU-U4 and MU-U5. The test file must be **byte-identical** to B's measured sketch (§3).
- D-29z669: the browser contract for this round (§6), with the reasoning recorded there.
- D-29z670: reviewer Lows and the architecture note are recorded and not scheduled (see `b-round-282.md`). L23 is amended in place (B-R282-DW-UNRUN).

**Kind of round:** a performance-round fix-up, **test + docs only**. Nothing visible changes. By the policy (2026-10-27/28, "pure performance … test-only … rounds"), these do not apply: reference-first, AGREE, YouTube, `product-designer` and the screen budget. Ableton conformity: **does not apply**.

**Owner:** A. **Verifier:** C. **Grants:** §4.

## Baseline: HEAD `000da42` **plus A's round-282 working tree** (preserved, not committed)
- `gates/gate-round-282.json` is `skipped` ("C taskStatus FAIL"). So HEAD is still `000da42` [K1], and the tree carries A's round-282 work: 4 `M` + 3 `??` [K15].
- **The sketch is already applied. Do NOT run `patch` again.** The six code files equal the round-282 sketch bytes [K2] (`b-round-282/code-six-sha256.txt`).
- The test file is A's round-282 version [K3] (`b-round-282/test-at-a282-sha256.txt`; copy `b-round-282/demo-synth-worker.test.a282.ts`).
- Claims: run `bash ../tmp/studio-real-loop/b-round-282/claims-283.sh` from `store/` **before editing**. The output must equal `b-round-282/claims-283-output.txt`. A difference is a STOP (§9).

## 0. Read first
1. `lessons.md`, every role. Especially L11, L23 (amended this planning: B-R282-DW-UNRUN), L26, L28, L29 and L38.
2. This task, then `tasks/round-282.md` §2 (the contract), §6.1 (the DW rows) and §7 (doc 211). Those sections still describe the code exactly.
3. `a-round-282.md` and `c-round-282.md`, which hold the evidence the docs cite.

**Primitives for A:** `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md`.

## 1. What failed in round 282, and why
| Id | Sev | Finding | Cause | Fix this round |
|---|---|---|---|---|
| C-R282-01 | Medium | DW3 and DW9 are red. `toBe(composition)` on the result can never hold | `readDemoComposition` returns a **new wrapper** `{ mix, stems: { pulse, bass, pad, lead } }` to narrow the type without `as` [K4]. The five `Float32Array`s keep their identity. B wrote `toBe` rows against its sketch without running them (planning gap B-R282-DW-UNRUN) | §3.1 |
| C-R282-02 | Medium | doc 211 and the doc 163/169 sections are missing | A waited for the DW ruling (L26: docs must not cite red rows) | §5 |
| C-R282-03 | Low | DW10's sample loop is vacuous | The worker module and the test share one `demo-synth` module instance: `vi.resetModules()` runs only in `beforeEach` [K9]. The posted arrays and `getDemoStemComposition()` are the same objects, so the loop compares each array with itself. **B's proof:** the mutant MU-U4 (the worker overwrites the mix before posting) leaves DW10 **green** on A's round-282 file; only DW3/DW9 are red there (`b-round-282/mutants.txt`) | §3.2 |
| A reviewer, DW11 proposal | (gap) | The `postMessage` throw fallback [K5] has no row. Round 282 §2.1 names it as a fallback case | B's §6.1 listed no row for it | §3.3 |

## 2. What does not change
- The six code files: `app/lib/arrangement/demo-synth.client.ts`, `demo-synth.worker.ts`, `app/data/studio-lab-demo.ts`, `perf/lib/instrumentation.ts`, `perf/studio-lab.perf.spec.ts` and `perf/budgets.json`. They stay byte-identical (`sha256sum -c b-round-282/code-six-sha256.txt`).
- So the round-282 measurements stay valid for these bytes, and A **does not re-run** them: PERF-RUN, EQUIV, SCRIPT-MAX, MU-SYNC-FALLBACK and the browser rows. The docs cite them by path (§5).
- DW1, DW2 and DW4–DW8 keep their assertions. DW6 is the `it.each` with cases (a) and (b), which is why [K7] does not list it by grep. A's round-282 tightening (`expectReleased`, fake timers in DW2) stays.

## 3. The test file: byte-identical to B's sketch (D-29z668)
Target: `b-round-282/demo-synth-worker.test.sketch.ts`, sha256 in `b-round-282/test-sketch-sha256.txt`. The diff against A's file is `b-round-282/test-sketch.diff` (115 lines). A applies it with `patch -p1` from `store/`, or copies the sketch file, and then checks the sha256. **Any defect A or the code-reviewer finds in the sketch is a STOP (§9), not an edit.** The same precedent as the code in round 282: an edit moves the measured mutant table.

### 3.1 DW3 and DW9 (C-R282-01)
- A new helper `expectSameComposition(actual, expected)`:
  - `toStrictEqual` on the wrapper;
  - `toBe` on `mix` and on each of the four stems (the zero-copy hand-off).
- **DW3:** every one of the 5 results passes `expectSameComposition(result, composition)`, and `new Set(results).size` is 1 (all callers share one result object). The release checks stay.
- **DW9:** the first result passes `expectSameComposition`. The later call resolves `toBe` the first result. There is still 1 instance.

### 3.2 DW10 (C-R282-03)
- After the handler posts, the test calls `vi.resetModules()` and imports `../demo-synth` again. This gives a **fresh module instance** and an independently synthesised `expected`.
- Before the sample loop, the test asserts that every posted array is a different object from its `expected` array: `expect(a === b).toBe(false)` for the mix and the four stems.
- **Fact 1, do not "improve" it back:** `expect(a).not.toBe(b)` on two different 768 000-float arrays made DW10 take about **16.6 s** on B's scratch (vitest's `toBe` runs a deep equality for its failure hint), against the 5 s default timeout [K14]. The `=== … toBe(false)` form costs nothing. The sketch's DW10 took **0.90 s** (A's round-282 version: 0.46 s; one extra synthesis ≈ 0.43 s).
- Unchanged: the transfer list holds exactly the five buffers (`toBe` each).

### 3.3 DW11 (new)
- `FakeWorker` gains `static throwOnPost = false`. `postMessage` throws when it is set. Both `beforeEach` and `afterEach` reset it.
- **DW11:** fake timers, `throwOnPost = true`, call the client, flush microtasks **without advancing time**. Expected:
  - the promise has resolved to `getDemoStemComposition()`'s object;
  - nothing was posted;
  - `expectReleased(worker)` (terminated once, three handlers `null`).

### 3.4 Named unit mutants (A and C each run all five, on a scratch copy of the final tree)
| Id | Mutation (one line, in a code file) | Red row(s) on the sketch test (B, `b-round-282/mutants.txt`) | Must be red |
|---|---|---|---|
| MU-U1 | client: `demoCompositionJob ??= ` → `demoCompositionJob = ` | DW2, DW3, DW9 | DW2 |
| MU-U2 | client: `worker.onerror = () => finish(null);` → `worker.onerror = () => undefined;` | DW4 | DW4 |
| MU-U3 | worker: drop `, { transfer: demoCompositionTransfer(composition) }` | DW10 | DW10 |
| MU-U4 (new) | worker: after `const composition = getDemoStemComposition();` add `composition.mix.fill(0.5);` | DW10 | DW10 |
| MU-U5 (new) | client: in the `postMessage` `catch`, `finish(null);` → `return;` | DW11 | DW11 |

**MU-U4 control (C-R282-03 proof):** the same mutation on A's round-282 file `b-round-282/demo-synth-worker.test.a282.ts` leaves DW10 **green**: red rows are DW3 and DW9 only, which were red anyway. C re-runs this control.

## 4. Grants (exact)
| Path | What may change |
|---|---|
| `app/lib/arrangement/__tests__/demo-synth-worker.test.ts` | becomes byte-identical to `b-round-282/demo-synth-worker.test.sketch.ts` (§3) |
| `docs/implementation/2026/quarter-IV/211-perf-demo-synth-worker.md` | **new** (§5) |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | the whole sections `### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)` (l.20; step 1 names the new rows) and `## მეტრიკების განმარტება და ზღვრები` (l.58; the load rows) (L34), plus one new bullet under `## TODO / შემდეგი ნაბიჯები` (l.156) [K11] |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | the `loaf-blocking-max` row (l.37 says the instrumentation stores only `duration` [K12]; it now also stores `scriptMax`, still no `blockingDuration`), plus the TODO bullet on B-R281-RESOURCES-READY-FAILED (l.215 [K12]). That bullet gains GATE281-S2's sentence: in the measured runs (MU-FAILED-OTHER 6/6), the usual result for a failed non-selected source is an abort at load |

**Frozen:**
- the six code files (`code-six-sha256.txt`);
- every tracked file in `b-round-281-r282-tree-sha256.txt` (1139 files);
- `package*.json`, `e2e/**`, `.claude/**`;
- the four protected auth/purchase files (`studio.$productId.tsx`, `api.studio-token.ts`, `app/lib/auth.ts`, `AuthContext.tsx`).

A hunk outside its row is a scope FAIL. After A, `git status --short` shows exactly: 4 `M` code + 2 `M` docs + 4 `??` (client, worker, test, doc 211).

## 5. Doc 211 (new) and the doc 163/169 sections
The content is as `tasks/round-282.md` §7, with these changes:
- l.4 is exactly `**სტატუსი:** Completed (C round 283 PASS)` (L28: N = this round).
- It has the seven TEMPLATE headings in order (L26).
- **`## ტესტირება`:**
  - It names DW1–DW11 and MU-U1…MU-U5 only as they exist in the final test file (L26).
  - It states the C-R282-01 ruling in one sentence: the client returns a new wrapper around the **same** five arrays, so the rows pin the arrays (`toBe`) and the wrapper by value.
  - It cites the round-282 measurements on these same code bytes **by path**, not re-measured:
    - A's perf run: `a-round-282.md` §Perf and `a-round-282/perf/`;
    - C's runs: `c-round-282.md` §Perf;
    - EQUIV: `c-round-282/equiv.txt`;
    - MU-SYNC-FALLBACK: medians 372 (A) and 371 (C);
    - the export sha256s `1fea093b…` and `72228706…`: `c-round-282/export-c282.json`;
    - WORKER-BROWSER: `c-round-282/worker-probe.json`.
- **`## პრობლემები და გადაწყვეტები`** adds:
  - the DW3/DW9 wrapper (C-R282-01 → option (a));
  - the vacuous DW10 (C-R282-03 → fresh module + identity guard; the `not.toBe` 16 s cost).
- **`## TODO`** also records the architecture note: the worker↔client protocol could move to a neutral module (signal `A-R282-REVIEW-WORKER-PROTOCOL`, not scheduled).
- Docs 163 and 169: only the §4 sections.

## 6. The browser contract for this round (D-29z669)
- **What this round changes:** a test file and docs. It changes no runtime byte (C checks the bytes with `cmp`).
- **Carried evidence:** C's round-282 browser and perf rows (PERF-RUN, SYNC-FALLBACK, WORKER-BROWSER, LIBRARY-STATES, EXPORT-BITEXACT, SSR) ran on exactly these code bytes, so they remain the evidence for the runtime half of PERF-2. C lists them in `c-round-283.json` under a separate key, `"carried"`, with their round-282 evidence paths, and **never** under `"passed"`.
- **Re-run in a browser this round,** so the round's own browser rows are real and current:
  - G283-AUTH: purchase protection, a per-publish criterion;
  - LIBRARY-STATES: one cheap check that the demo still loads on A's fix-up tree.

  LIBRARY-STATES runs on C's own production build of A's tree, as in round 282, because its oracle was measured on production. G283-AUTH runs on `:5173` (round 282 proved it there). Both run at both viewports, after one untimed warm-up (L38).
- `browserVerified`/`realVerified` are true only if these two rows ran in real Chromium.
- **Why this is honest:** PERF-2's user-relevant behaviour lives only in the six code files. Their bytes are proven unchanged, and the full browser and perf proof of those bytes is C's own round-282 work, which `c-round-282.json` marks `browserVerified: true`. Re-running a 13-minute perf suite on identical bytes adds no information (L38 cost). PERF-2 becomes **მზადაა** only on the round-283 C PASS plus the gate.

## 7. What A runs (speed rules)
1. Claims (§Baseline) before any edit.
2. Apply the test sketch, then `sha256sum -c ../tmp/studio-real-loop/b-round-282/test-sketch-sha256.txt`.
3. `npm run typecheck`; `npm run lint` (report the counts); Biome on the test file.
4. `npx vitest run` on these five files, **5 files / 101 tests** expected (B's scratch: `b-round-282/covering-5files.txt`):
   - `app/lib/arrangement/__tests__/demo-synth-worker.test.ts`;
   - `app/lib/arrangement/__tests__/demo-synth.test.ts`;
   - `app/data/__tests__/studio-lab-demo.test.ts`;
   - `app/lib/arrangement/__tests__/library-notice-ui.test.tsx`;
   - `app/lib/arrangement/__tests__/strings.test.ts`.

   Report DW10's time.
5. MU-U1…U5 and the MU-U4 control (§3.4).
6. Write doc 211 and the two doc sections. Check that every row and mutant id cited in doc 211 exists: `grep -c` in the test file, or §3.4 for the mutants.
7. `sha256sum -c ../tmp/studio-real-loop/b-round-282/code-six-sha256.txt` at the end.
8. The code-reviewer subagent (4 changed paths). Pass its notes on.

**Not A's:**
- no perf run, no EQUIV and no MU-SYNC-FALLBACK (the code bytes are unchanged; L38 cost);
- the full vitest, the build, `npm run verify` and `test:e2e:smoke` (gate rows).

## 8. C rows
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-281-r282-tree-sha256.txt` **and** `sha256sum -c b-round-282/code-six-sha256.txt` both rc 0, at the start and at the end; `git status` = exactly the §4 set (4 `M` code + 2 `M` docs + 4 `??`) |
| TEST-BYTES | `sha256sum -c b-round-282/test-sketch-sha256.txt` rc 0 |
| HUNK-SCOPE | doc 163/169 hunks lie only inside their §4 sections; doc 211 is new |
| CLAIMS | `claims-283.sh` on A's **pre-edit** state is reproducible: run it on a scratch copy = `git archive 000da42` + the six code files + `b-round-282/demo-synth-worker.test.a282.ts`, and it must equal `claims-283-output.txt` except K1 and K15, which print `(archive)` outside git (B verified this: `claims-283-output-archive.txt`); plus the L29 untagged-fact sweep over this task |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | the five §7 files: 5 files / 101 tests pass; DW1–DW11 exist by name (DW6 has two cases); DW10 below 2.5 s (50 % of 5 s) |
| UNIT-MUTANTS | C's own MU-U1…U5, each red at its "must be red" row; plus the MU-U4 control on `demo-synth-worker.test.a282.ts` (DW10 green, which proves the old vacuity) |
| DOC-211 | l.4 is byte-exact `**სტატუსი:** Completed (C round 283 PASS)`; the seven TEMPLATE headings are in order; every row and mutant id it cites exists; every round-282 number it cites matches the cited file; GATE281-S2's sentence is in doc 169's B-R281 bullet; `grep -rn 'In Progress (stage' docs/implementation` = 0 |
| LIBRARY-STATES | **real browser, both viewports**, on **C's own production build of A's tree** (separate port and `cacheDir`, as in round 282; L38), after a warm-up: the values of round-282 §1.4 exactly. The oracle `library-head.json` was measured on a production build, so dev mode (StrictMode double mount, HMR) is not used for this row. Probe `b-round-281/scripts/library-probe.cjs` (pass the production server's base URL); expected values: `b-round-281/library-head.json`; 0 page errors |
| G283-AUTH | **real browser, both viewports**, fresh context, no credentials. **`/studio-lab`:** demo workspace plus the badge `Demo collection — no sign-in required`; `auth_user` null. **`/studio/middle-east`:** `Sign in required`, `audio[src]` 0, no workspace. **`/api/studio-token`:** no header → 401; fake bearer → not 200 and no token |
| carried | listed under `"carried"` only (§6): PERF-RUN, SCRIPT-MAX, EQUIV, SYNC-FALLBACK, WORKER-BROWSER, EXPORT-BITEXACT and SSR, with their `c-round-282/` paths, valid because SOURCE-SCOPE proves the code bytes |
| gate | full vitest, build, Biome, `npm run verify` and `test:e2e:smoke` are the root gate's and are not claimed |

## 9. STOP conditions (L11)
- The claims output differs from `claims-283-output.txt` (except K1/K15 `(archive)` outside git).
- The test sketch does not apply cleanly, or any of its rows fails, or a mutant stays green at its row, or DW10 takes ≥ 2.5 s.
- Any edit seems needed in a code file or outside §4, including a sketch defect the code-reviewer reports.
- A doc claim would need a number not found in the cited round-282 file.

## 10. Neighbour risk
- Test-only plus docs. The runtime risk is nil while the code bytes hold, and SOURCE-SCOPE checks that.
- The new test adds about 0.9 s to the full suite (DW10's second synthesis). That is a gate-row concern only.

## 11. Outcome, fixed in advance
| Result | Next |
|---|---|
| C PASS and the gate publishes | PERF-2 is **მზადაა**. Round 284 = REGRESSION if its planning falls on or after 2026-11-02 (`regression-last.json`), otherwise PERF-3 (consults first) |
| C FAIL on a test or doc row | a bounded fix-up, the same grants |
| SOURCE-SCOPE shows a code byte moved | the carried evidence is void; B re-plans the runtime rows |

## 12. Deliverables
- **A:** the test file (= sketch), doc 211, and the doc 163/169 sections. `a-round-283.md` with the commands, results, the mutant table with the control, DW10's time, and the review notes.
- **C:** `c-round-283.md`, `c-round-283.json` (with `"carried"`), and evidence in `c-round-283/`.

## Claims block (L29)
Run `bash ../tmp/studio-real-loop/b-round-282/claims-283.sh` from `store/` on the pre-edit tree. Expected: `b-round-282/claims-283-output.txt`.

| Tag | Claim | Expected |
|---|---|---|
| K1 | HEAD | `000da42` |
| K2 | the six code files equal the round-282 sketch | 6 × OK |
| K3 | the test file is A's round-282 version | OK |
| K4 | the client returns a new wrapper | l.35 |
| K5 | the `postMessage` throw falls back | l.72–76 `catch { finish(null); }` |
| K6 | the worker synthesises and posts with a transfer list | l.5, l.7 |
| K7 | the DW ids found by grep | DW1–5, 7–10 (DW6 is `it.each`); `DW11` count 0 |
| K8 | DW3/DW9 use `toBe` on the wrapper | l.138, 226, 227 |
| K9 | `vi.resetModules()` only in `beforeEach`; DW10 imports the worker and then `loadClient()` in one module graph | l.97; l.233–234 |
| K10 | the last implementation doc is 210 | 210 |
| K11 | doc 163's granted headings | l.20, 58, 156 |
| K12 | doc 169's `loaf-blocking-max` row and the B-R281 bullet | l.37; l.215 |
| K13 | `In Progress (stage` lines | 0 |
| K14 | vitest has no `testTimeout` override | 0 |
| K15 | `git status` | 4 `M` + 3 `??` |
