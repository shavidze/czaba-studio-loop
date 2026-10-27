# CURRENT TASK — Round 213: GATE212-B1. Split CP12 so the round-212 work can be published (test-only gate fix)

Decisions: **D-29z200** (round 212 accepted; C-R212-01 ruled), **D-29z201** (GATE212-B1: the CP12 split), **D-29z202** (SABA-B-5 status; signals; deferred Lows), **D-29z203** (doc 167 grant; publication of rounds 212+213 together).
- Planned by B on 2026-10-27.
- Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md`. L10, L11, L12, L23, L26 and L28 apply.
- `gates/gate-round-212.json` and `gates/round-212/verify.log`: the failure is l.552 and l.1958.
- `a-round-212.md`, "Known gaps" item 3.
- `c-round-212.md`.
- `b-round-212.md` §4, B's scratch run.
- Code:
  - `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx`: l.200–215 (constants), l.497–522 (describe and setup), and l.901–957 (CP12).
- Project:
  - `.claude/prompts/new-test.md`;
  - primitives `TESTING_QUALITY_GATES.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`.

## Baseline
- **Gate 212 failed. Nothing was published.** The baseline is HEAD **`28a274c`** plus the **uncommitted round-212 working tree**: 7 M + 2 ??, exactly as C verified it. C's end fingerprint is `c-round-212/out/tree-end.sha` = `0db4de8e…`.
- **Frozen:** the 1,057 files in `b-round-212-r213-tree-sha256.txt`. That is every tracked file plus the 2 round-212 new files, minus the 2 grants. From the store root, run `sha256sum -c --quiet <loop>/b-round-212-r213-tree-sha256.txt`. B checked it: rc 0.
  - This freezes all round-212 source and test changes. **Do not touch, revert or reformat them.**
- **Grants:** `b-round-212-r213-grants.txt` (2 files).
  - Start hashes: `b-round-212-r213-granted-start-sha256.txt`.
  - Start copies: `b-round-212/r213-granted-start/`.
- **New files:** none.
- **Protected as always:**
  - auth and purchase files;
  - `app/components/studio/**`, `app/styles/**`, `app/routes/**`;
  - `.claude/**`, `CLAUDE.md`;
  - `package.json`, `biome.json`, `tsconfig*.json`, `vitest.config.ts`, `playwright*.config.ts`;
  - `perf/**`.

## 0. Why this round
- **C round 212 PASSED** with `browserVerified` and `realVerified` both true. B's ruling D-29z200 accepts PERF-RUN-212.
  - SABA-B-5's 1× criterion is met: single Clip Gain move-to-paint p95 is 5.4–7.6 ms, against 23.9 / 41.4 ms on the baseline.
  - **But the root gate failed**, so none of it is published. The full `vitest` run timed out on one test:
    - `CP12` in `clip-gain-pointer-preview.test.tsx` took **33.3 s** against the 30 s describe timeout;
    - in gate 211 the same test took 25.4 s.
- **The cause is not the round-212 code.**
  - A's control on the start-copy sources also timed out (33.8 s).
  - Alone, CP12 takes 15.6 s in B's scratch copy of the round-212 tree, versus 16.9 s on the start copy.
  - CP12 is a single test that drives **841 drags** (every 0.1 dB from −60.0 to +24.0), each against a fully mounted workspace. Under the gate's parallel load (`maxWorkers: 4`) it runs about 2.1× slower than alone.
- **Bug gate:** GATE212-B1 blocks the publication of a verified Medium fix (SABA-B-5), so it comes before any new scope.
- **Reference first:** not applicable. This is a test-only round.

## 1. Ruling (D-29z201): how CP12 is split. Required.
1. **Keep every check.** The 0.1 dB step, the range (−60.0 … +24.0, including both clamps), the Shift-fine check, the three members anchors and every `expect` stay.
   - The describe timeout stays at **30 s**. Do not add a per-test timeout.
   - Do not coarsen the step, and do not sample.
2. **The new rows**, which replace `CP12`. The `CP12` prefix stays so ids keep grepping.
   - A file-level constant, `const CP12_SLIDER_CHUNKS: Array<[string, number, number]>`, holds the tenths of a dB. Use exactly these four contiguous chunks:
     - `['a', -600, -391]`
     - `['b', -390, -181]`
     - `['c', -180, 29]`
     - `['d', 30, 240]`

     No `as const` and no type assertion.
   - **CP12-COVER.** Iterating the chunks in order gives exactly the list `CLIP_GAIN_MIN_DB * 10 … CLIP_GAIN_MAX_DB * 10`, with no gap, no overlap and nothing out of order (`toEqual` against the generated full list).
   - **CP12a–CP12d** come from `it.each(CP12_SLIDER_CHUNKS)` and are named `CP12%s: …`. Each one:
     - mounts its own workspace (`cm: -6, cx: 1`);
     - runs the existing single-clip loop body unchanged, over `fromTenth … toTenth`;
     - ends with `expect(gainOf(api, 'cm')).toBe(-6)`, `expect(mismatches).toEqual([])` and `expect(live(api).undoLabel).toBeNull()`.
   - **CP12e.** The existing Shift-fine block and the members-anchor loop, unchanged. It mounts its own workspace and ends with `expect(live(api).undoLabel).toBeNull()`.
   - B applied exactly this split on a scratch copy; §4 of `b-round-212.md` has the sketch and the numbers. If you find a reason to deviate, it is a STOP (L11).
3. **Nothing else in the file changes.** CP1–CP11, CP13–CP17, the helpers and the setup stay byte-identical. Biome may reflow only the new lines.

## 2. A: the files you own. Everything else is frozen.
| Path | What |
|---|---|
| `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx` | §1 only: CP12 → CP12-COVER, CP12a–d, CP12e, plus the `CP12_SLIDER_CHUNKS` constant next to `MEMBERS`. |
| `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md` | Only the CP12 timeout lines: the "პრობლემა / გადაწყვეტა" entry (current l.70) and the TODO line (current l.110). Rewrite them as Problem → Solution: what timed out, why, and the split with its measured times. **l.4 (status) stays `In Progress (C round 212 check pending)`.** Root amends it at publication (L28). Cite only rows that exist (L26). |

**Red-proof (D-29z187 method).** This round refactors a green test, so "red on the start copy" does not apply. Give these **named mutants**. Each one is made only on a `/tmp` scratch copy of the store, never in the store tree. Each one names the mutated line and the failing assertion.
- **M1:** change chunk `c` to `['c', -179, 29]`. CP12-COVER goes red.
- **M2:** in the scratch copy's `ArrangementContext.tsx`, make the single-clip pointer commit write `gainDb + 0.1` when `gainDb > 10`. **CP12d** goes red through `expect(mismatches).toEqual([])`, which lists every unclamped value above 10 dB. A value clamped back to 24.0 may not differ. CP12a–c stay green.
- **M3:** change one expected value in `MEMBERS_ANCHORS`. CP12e goes red.

**Self-checks before handover** (not the full suite; that is a gate row):
- Run `npm run typecheck`, then Biome on the 2 owned paths: 0 errors, 0 warnings.
- Run `npx vitest run app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx --reporter=verbose` **twice**. Report each CP12x row's ms. Expect about 3.6–4.1 s per chunk.
- Make one **covering run**: `npx vitest run app/lib/arrangement app/components app/hooks --reporter=verbose`. Every file must pass, and **each CP12a–d row must take < 12 s**. B's scratch run gave 8.0–8.8 s, with 155 files and 2,236 tests green.
  - Report the 5 slowest single tests of that run, with their ms. If any other single test is above 15 s, list it as a signal; do not edit it.
- Run `sha256sum -c` of the frozen list at start and at end: rc 0.
- Code-reviewer: optional, because only 2 files change. If you run it, carry its Architecture note verbatim.

## 3. C: rows
Setup: the dev server `:5173` for the browser rows, and Playwright Chromium. Do not run the full suite or `npm run verify`.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-213** (start + end) | HEAD, `git status`, `sha256sum -c` of the 1,057-file list, and the grant diffs against `b-round-212/r213-granted-start/`. | HEAD is `28a274c`. The status shows the round-212 set (7 M + 2 ??) and nothing new. Only the 2 grants differ from their start copies. The test file's diff touches only the CP12 block and adds the chunk constant; CP1–CP11 and CP13–CP17 are byte-identical (compare the extracted `it(` blocks). Doc 167 differs only in the CP12 problem and TODO lines, and l.4 is unchanged. |
| **COVERAGE-213** | Read the new rows, then run the test file alone twice and C's own mutant on a `/tmp` copy. | The four chunks plus CP12-COVER generate every tenth from −600 to 240 exactly once (C computes this independently). Each CP12a–d carries the 3 closing asserts. CP12e keeps the Shift-fine and the 3 members anchors with both asserts. No `expect` from the old CP12 is missing (list old vs new). The step is 0.1 dB and no per-test timeout was added. The file passes 25/25 both times; report the per-row ms. C's own mutant, e.g. a seeded mismatch at one dB value inside chunk `b`, turns exactly that chunk red. |
| **LOAD-213** | One covering run, `npx vitest run app/lib/arrangement app/components app/hooks` (not the full suite), with nothing else running. | Every file passes. Each CP12a–d is < 12 s. Report the 5 slowest single tests. |
| **DOC-213** | Doc 167. | The CP12 lines are Problem → Solution with A's measured numbers. Every cited row exists (grep). l.4 is unchanged. |
| **AN-REVIEW-213** | The diff. | No `any`, `as`, `@ts-*` or lint suppressions; semicolons are present; Biome on the 2 paths finds no fixes. |
| **G213-3** (browser) | Fresh contexts at 1440×900 and 1280×720: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer. | `/studio-lab` opens anonymously with the demo badge. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header gives 401. The fake Bearer gives 403 with the `:5199` mock, or 500 without it. **No token is issued.** |
| **STUDIO-SMOKE-213** (browser) | On `/studio-lab` at both viewports: select the demo clip, expand the detail panel first if it is collapsed (it starts collapsed at 1280×720), drag the Clip Gain fader, release, then Undo. | The value changes and one "Undo: …" entry appears. Undo restores the value. 0 page errors. This is a short sanity check that the round-212 tree still runs; the round-212 browser rows carry, because SCOPE-213 shows the source unchanged. |
| **gate** | Full vitest (CP12a–d inside 30 s), typecheck, build, Biome, `npm run verify`, e2e smoke. | Not claimed by C. |

**`browserVerified`:** G213-3 and STUDIO-SMOKE-213 can both run in the cloud. If either does not run, the flag is false.

**Product / Ableton:** the CZABA requirement is publishing the verified SABA-B-5 fix. Ableton conformance does not apply (test-only).

## 4. Adjacent behaviour that could break
- **Nothing in the product.** No source file is granted.
- **Inside the file:**
  - pointer ids: each new row starts its own counter from 200 in its own mount, as the old row did;
  - the `afterEach` cleanup, now run 5 times instead of once;
  - CP13–CP17 order and isolation.
- **Doc 167:** the status line, which root amends.

## 5. Publication
- After C PASS, root runs the gate on the combined tree (round 212 + round 213) and publishes both together.
- Commit message: "perf(studio): PERF-FADER-c waveform outline path, single release commit (SABA-B-5 part 3, C-R211-01); split CP12 (GATE212-B1)".
- Root amends doc 167 l.4 to `Completed (PERF-FADER-c C round 212 PASS, published <sha>)` (L28).
- SABA-B-5 closes on this publication (D-29z202).

## 6. After this round (not in scope)
- **PERF-1b** comes next under D-29z199. Its inputs:
  - C-R212-02: `load.longtasks-over-50` as median-of-N or a record row;
  - C-R212-03: a 6× slow-CPU budget, as a Saba question;
  - GATE206-S3/S5/S6 and GATE211-S4.
- **The architecture checkpoint** (D-29z195) is still pending with root. It is non-blocking.
- **Regression:** due on or after 2026-10-30.
- **RETRO:** round 215 or the end of STUDIO-PERFORMANCE. Signal: B-R212-TIMEOUT-HEADROOM.
