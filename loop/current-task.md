# Round 223: PERF-HARNESS-SHARED-LIB. Move the copied perf-harness helpers into `perf/lib/` without changing what is measured

**Planned by:** B, at the round 222 → 223 planning, 2026-10-28. **Decisions:** D-29z243…D-29z250.
**Type:** test-only refactor of the Playwright perf harness (`perf/**`), plus five small harness Lows that this round already owns, and an implementation doc. **No `app/**` change.**
**Queue position:** STUDIO-PERFORMANCE, per `execution_order_d29z215`: … OSS-LIC → **PERF-HARNESS-SHARED-LIB** → PERF-2 → … Round 222 (B-R220-LEGACY-EXPORT-NO-STEMS) passed C and is published as `2d4a93f`. The round-222 outcome table (`tasks/round-222.md` §8, row 1: PASS and planning before 2026-10-30) fixes this round.
**Stage split (D-29z244):** the old stage text also asked to "tighten the ratio-row determinism tolerance (A-R214 M2)". Both consults say that change would break this round's "nothing changes" proof. It moves, unchanged in scope, to a new stage **PERF-HARNESS-SHARED-LIB-b**, queued right after this one (§9). Nothing is dropped.
**Read first:** `lessons.md` (B, A and C), in full. It applies especially L11, L23, L26, L28, L30, L32, L33 and L34.
**Reference first:** not in scope. This is a test-only refactor round with no user-visible behaviour (policy "Reference first", list of exclusions).

## 0. Baseline and scope

**Baseline:** HEAD = `2d4a93ff6a214e669dc5a69d6721ae4c1e99b7cd` (gate 222 published on both remotes). The tree must be clean: `b-round-222/git-status-at-planning.txt` is empty.
- If HEAD differs, or the tree is not clean at start, **STOP** (L11). The one exception is a root commit that touches only `package.json`, `package-lock.json` or `vite.config.ts`: re-hash those 3 and continue. In that case, also see the `res.js.*` clause in §6, EQUIV-223.

**Frozen:** `b-round-222-r223-tree-sha256.txt` lists 1,065 files: every tracked file except the 7 grants and the 3 root-owned files. `sha256sum -c` returns rc 0 at planning. Frozen explicitly includes:
- `perf/lib/stats.ts` (`countsAgree` is not touched; that is stage b);
- `perf/lib/budgets.ts` and `perf/lib/instrumentation.ts`;
- `perf/budgets.interactions.json` and `perf/budgets.resources.json`;
- `playwright.perf.config.ts`, `vitest.config.ts`, `biome.json` and `tsconfig.json`;
- all of `app/**`.

**Root-owned, must equal HEAD:** `package.json`, `package-lock.json` and `vite.config.ts` (`b-round-222-r223-root-files-start-sha256.txt`). No deps request this round.

### 0.1 Grants (`b-round-222-r223-grants.txt`, start sha in `b-round-222-r223-granted-start-sha256.txt`)
| # | Path | What may change |
|---|---|---|
| 1 | `perf/studio-lab.perf.spec.ts` (PERF-1a) | Remove the copies now imported from `perf/lib/page.ts` and `perf/lib/report.ts`; use the shared report core. Nothing else. |
| 2 | `perf/studio-lab-interactions.perf.spec.ts` (PERF-1b-i) | The same, plus GATE214-S2 and GATE214-S3 (§3). |
| 3 | `perf/studio-lab-resources.perf.spec.ts` (PERF-1b-ii) | The same, plus GATE217-S1 and GATE217-S2 (§3). |
| 4 | `perf/budgets.json` | **Only** the `note` string of row `harness.audio-running` (GATE214-S5). No other byte. |
| 5 | `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | Whole sections (L34): §არქიტექტურა; in §მეტრიკების განმარტება, only the `harness.hook-live, harness.audio-running, harness.restart-live` table row (S5 wording); §TODO / შემდეგი ნაბიჯები. |
| 6 | `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | §მიდგომა, its first bullet (l.13, "ცალკე, თვითკმარი spec … გადმოკოპირდა"); §არქიტექტურა; §TODO (l.241). |
| 7 | `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | §მიდგომა, its first bullet (l.13); §არქიტექტურა; §TODO (l.206). l.18 stays: `countsAgree` is still frozen. |

### 0.2 New files (`b-round-222-r223-new-files.txt`)
- `perf/lib/page.ts`: the page and locator helpers.
- `perf/lib/report.ts`: the report core.
- `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md`: the next free number (174 is the last).

No unit-test file is added. Ruling D-29z246: `vitest.config.ts` includes only `app/**`, and a test under `app/` that imports `perf/` breaks layering. A durable `perf/lib/report.test.ts` plus its include belongs to stage b, together with a config owner. The proof this round is the scratch equivalence script (§4) plus the real perf run (§6).

## 1. Why

There are three copies of the same harness helpers and report builder (architecture signal PERF-HARNESS-SHARED-LIB, third occurrence at round 216; ARCH-GATE217-REPORT-HELPERS; the project's 3+ places rule). Each future PERF task adds rows to these specs, so the copies would keep drifting. This round moves the copies once, with byte-identical results.

## 2. Contract: what moves, what stays

### 2.1 `perf/lib/page.ts` (exported, same bodies as today)
| Helper | Copies today | Note |
|---|---|---|
| `nowIn`, `snapshot`, `blurActive` | 1a, 1b-i, 1b-ii | identical |
| `waitForQuiet(page, from, minMs)` | 1a l.248, 1b-i l.150, 1b-ii l.206 | `quietMs = 200` and `settleCapMs = 3000` become lib constants (or defaulted parameters). They **must still be passed into `page.evaluate` as arguments**, exactly as today. The function keeps its trailing `nowIn`. |
| `reactRendererProblem` | all three | `expectedReactMajor = '18'` becomes a lib constant (Node side only) |
| `playButton`, `audioRunning`, `isPlaying`, `setPlayback` | 1a, 1b-i | identical; resources does not import them |
| `startTasks` | 1a, 1b-i | identical |
| `rateRowId`, `audioClips` | 1b-i, 1b-ii | identical. **1a keeps its own `faderRowId`** (l.242: always-suffixed wallclock rule) |

### 2.2 `perf/lib/report.ts`
- Exports `formatLimit`, `rateSuffix`, the `PerfSample` type (`value` plus an optional `detail`; the specs' `PassSample`), a pass shape type, and one core function. The core function returns **only `{ complete, failures, rows }`**.
- **Each spec keeps its own report envelope literal** (`harness`, `startedAt`, …, `sequence`, `passes`), so the JSON key order of the report and of each row stays byte-identical.
- Core options. These are the five real differences; keep them as options and do **not** unify them:
  - `determinismMetrics`;
  - `determinismRequiresKind`: 1a `false` (l.816), 1b-i and 1b-ii `true` (l.850, l.805);
  - `assertWhenPartial`: 1b-ii `true` (`(complete || values.length > 0)`, l.798); 1a and 1b-i `false`;
  - `crossRateMetrics`: 1a only (l.833–844);
  - `guardProblems`: 1b-ii only, placed first in `failures`.
  - Also passed in: `budgets`, `passes`, `cpuRates` and `passesPerRate`.
- The failure strings stay byte-identical, and so does their order.
- Export a named report type if the specs' `write()` needs one. `ReturnType<typeof …>` on a spec-local builder is fine too.

### 2.3 Stays in the specs
- `storeRoot`, `resultsDir` and the budgets paths. **Do not compute `storeRoot` inside `perf/lib/`**: it is `path.resolve(dirname, '..')` in the specs, and in `perf/lib` it would silently point to `perf/`.
- 1b-ii's `declare global` for `__czabaBlockingFrames` and `__czabaExportDoneAt`, plus its `installBlockingFrameObserver`.
- Spec-specific locators: `clipById`, `clipGainFader`, `zoomSlider`, `faderLocator`, `slider`, etc.
- 1a's fixed `waitForTimeout(2000)` on Add, the `waitForTimeout(idleSettleMs)` calls (GATE214-S1 is stage b), and the page-error problem lines where they exist today (1b-i l.802, 1b-ii l.656; 1a has none).

### 2.4 Rules that keep the measurement identical (each is checked by C)
- **R1.** No function passed to `page.evaluate`, `locator.evaluate` or `addInitScript` may reference an import or a module/lib constant. Constants go in as `evaluate` arguments, as today. A violation compiles fine and throws `ReferenceError` only at runtime. The rule covers identifiers used **inside the function body at runtime**. Passing an imported function itself as the argument (`page.addInitScript(installPerfInstrumentation)`) is fine, and type annotations (`(): PerfWindowSnapshot`) are erased and do not count.
- **R2.** The number and order of `page.evaluate` round trips inside each measurement window are unchanged. Do not merge `nowIn` into another call.
- **R3.** Under `isolatedModules`, use `import type` and `export type` for types.
- **R4.** No `any`, no type assertions (`as`), no `@ts-ignore` or `@ts-expect-error`; semicolons everywhere (CLAUDE.md).
- **R5.** No unused import or local remains in the 3 specs or the 2 new files. Biome does not lint `perf/` (L30), and `noUnusedLocals` is off, so the check is the scratch tsconfig in §4.

## 3. Lows closed in this round (owned code, low cost; policy 2026-10-23)
| Id | Change | Why it does not move a measured value |
|---|---|---|
| GATE214-S2 | `emptyLanePoint(page, 'stems')` (1b-i l.542): use the measured clip's own lane id instead of the literal. Clips render inside `[data-track-id]` (`ArrangementLane.tsx` l.692; `ArrangementClip.tsx` l.210 uses `closest('[data-track-id]')`). Read it from the `clip` locator **before** `emptyFrom` (l.541), so no round trip enters a window. Build the lane selector safely (as S3). | It resolves to `'stems'` in the fixture, so the click is the same. The deselect step is not a measured row; the click window starts at `t0` (l.547). |
| GATE214-S3 | `clipById` (1b-i l.192) and the lane selector: build the selector safely (a JSON-quoted attribute value, or a thrown Error on an id containing `"` or `\`). | Same locator for the fixture ids. |
| GATE214-S5 | `perf/budgets.json` `harness.audio-running` `note` and the doc 163 table row: say "1 s after the Play button's label turns Pause (it is awaited up to 15 s after the Space press)", which is what `setPlayback` + `waitForTimeout(idleSettleMs)` do (1a l.669–671). | Text only. This row's `note` is the one exemption in EQUIV-223. |
| GATE217-S1 | 1b-ii l.356–362: keep the observer on `document.body` (same scope, same cost), but keep a handle (for example on `window`, typed in the spec's existing `declare global`) and disconnect it in a `finally` after each export, also when "WAV created" never appears. Disclose the observer cost in doc 169 §არქიტექტურა (one sentence). | On a normal run it already disconnects on the first match. The `finally` must run after the export window closes, never inside it. |
| GATE217-S2 | 1b-ii l.480–485: clear the 30 s `Promise.race` timer once `download.path()` settles. | Node side only. |

**Not in this round (stage b, §9):** GATE214-S1 (fixed waits move measurement windows), GATE214-S4 (zoom-live exact compare), A-R214 M2 (`countsAgree` tolerance), R216-MEM-POLLS-HEADROOM (the export-window filter also feeds `peak-backing-delta-mib`).

## 4. A's checks (covering runs only; the speed rule applies)
1. **Scratch equivalence script for the report core** (in `a-round-223/`, never in the repo).
   - Extract the three HEAD builders from `git archive 2d4a93f` (or the grant start files). Feed the same canned `budgets` and `passes` into them and into the new core plus each spec's envelope. Compare with `JSON.stringify` after fixing `startedAt` and `finishedAt`.
   - The canned cases are:
     - a complete run;
     - an aborted pass with a short row;
     - a partial run with an assert row out of budget (1b-ii reports it; 1a and 1b-i do not);
     - a 1a cross-rate mismatch;
     - a 1b-ii guard problem;
     - a deterministic-metric row with `kind: "wallclock"` (1a checks it; 1b-i and 1b-ii do not);
     - a measured id without a budget row.
   - **Named mutants that must turn it red:**
     - M-A: `assertWhenPartial` forced `false` for 1b-ii;
     - M-B: the kind filter dropped for 1b-i;
     - M-C: the cross-rate loop removed for 1a.
   - Logs go in `a-round-223.md`.
2. **Real perf run:** `CI=true npx playwright test --config playwright.perf.config.ts` (it builds and serves on :5188; 13.4 min on this runner at B's planning). All 3 tests pass. Then run `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-222/scripts/equiv-check.py <oracle> <new> [--note-exempt harness.audio-running]` for each of the three reports against the oracle in `b-round-222/baseline-results/` (`latest.json`, `latest-interactions.json`, `latest-resources.json`). Copy the three new reports into `a-round-223/`.
3. **`npm run typecheck`**: rc 0. **`npm run lint`**: 0 errors (it does not cover `perf/`, L30).
4. **Scratch tsconfig for R5:** `/tmp/a223-tsconfig.json` extends the repo `tsconfig.json`, with `"noUnusedLocals": true`, `"noUnusedParameters": true` and `"include": ["<store>/perf/**/*.ts"]`. Run `npx tsc -p /tmp/a223-tsconfig.json --noEmit`. 0 diagnostics in the 5 perf files A touches. Hits in frozen `perf/lib/*.ts` are listed, not fixed.
5. **Code review:** 5+ files change, so ask `code-reviewer`. Pass its Architecture note on to B.
6. **L32, pre-ruled (D-29z250):** a perf spec that **fails**, or runs **longer than 12 min**, is a STOP at the top of `a-round-223.md`. PERF-1a has run 7–9 min (47–58 % of its 15-min timeout) since rounds 214–217, including B's 7.1 min at planning. List that at the top with the time and the limit; it is **not** a STOP. The headroom is watch item PERF-1A-TIMEOUT-HEADROOM (stage b, or a root `playwright.perf.config.ts` change).

## 5. Implementation doc 175 (A)
- Georgian, with the TEMPLATE.md sections in order. **l.4 exactly:** `**სტატუსი:** Completed (C round 223 PASS)` (L28).
- **Contents:**
  - the helper map (§2.1) and the core options (§2.2), with each option's per-spec value;
  - the traps R1–R5;
  - the five Lows closed;
  - the stage-b items and why they are not in this round;
  - the equivalence proof (oracle path, script, row counts: 1a 316/167 deterministic, 1b-i 144/122, 1b-ii 61/38);
  - the scratch-script mutants.
- **L26:** cite only checks that exist. There is no unit-test file this round, so do not claim one.
- **Stale line numbers, pre-ruled (D-29z250):** spec line references in the **ungranted** sections of docs 163, 168 and 169 (for example doc 168 "spec buildReport l.787") will go stale when the copies are removed. A must not edit them. A lists each one (doc, line, old reference) in `a-round-223.md`. They become the single deferred Low DOC-PERF-LINEREF-DRIFT-223, not a finding against this round. C and AN-REVIEW-223 do not fail on them.
- Docs 163, 168 and 169: only the granted sections (§0.1). Each "copied helpers / not refactored" sentence becomes a pointer to `perf/lib/page.ts` and `perf/lib/report.ts` and to doc 175. The PERF-HARNESS-SHARED-LIB TODO lines become done, pointing to stage b for M2.

## 6. What C checks
No row in this round touches the Studio UI directly. The real check is the Chromium perf run, which drives `/studio-lab` in a real browser, so `browserVerified` covers EQUIV-223, LAB-SMOKE-223 and G223-3.

| Row | What | Pass when |
|---|---|---|
| SCOPE-223 (start + end) | `git status`, the frozen `sha256sum -c`, the root-owned 3, the grants and the new files | Only grants 1–7 (`M`, any subset) and the 3 new files (`??`). Frozen rc 0. Root-owned identical to HEAD. HEAD `2d4a93f` (or the root-only exception in §0). |
| BUDGETS-DIFF-223 | `git diff perf/budgets.json` | Exactly one changed JSON value: `note` of `harness.audio-running`. `JSON.parse` of the old and new files is equal once that note is removed. |
| CODE-223 | Read the diff | §2.1–2.3 followed. R1: grep every `evaluate(` and `addInitScript(` body in the 5 perf files; no identifier from module scope or an import inside it. R3/R4 met. `storeRoot` not computed in `perf/lib`. The five Low changes are as in §3 and nothing else changed in behaviour (no window, wait or selector change outside §3). |
| REPORT-EQUIV-223 | C writes **its own** scratch equivalence script (not A's) with the canned cases of §4.1 | New core + envelopes = HEAD builders for every case. C's own mutants M-A, M-B and M-C each turn it red. Run on a scratch copy only, never on the repo files. |
| **EQUIV-223** (real Chromium) | `CI=true npx playwright test --config playwright.perf.config.ts` on the changed tree, then `b-round-222/scripts/equiv-check.py` against `b-round-222/baseline-results/*` (`--note-exempt harness.audio-running` for `latest.json` only) | All 3 specs exit 0, and the script exits 0 for all 3 reports: same envelope keys and order, same row ids in the same order, same row key order, `scenario/metric/unit/kind/mode/budget/owner/note` identical (except that one note), every **deterministic median identical** (1a 167, 1b-i 122, 1b-ii 38), every assert row's `pass` identical, `complete` true, `failures` empty, no aborted pass, 0 page errors. Wallclock values, `details`, timestamps, `durationMs` and `stepMs` are not compared. |
| EQUIV-223 clause | Only if a deterministic median differs | C runs HEAD once on its own machine (`git archive 2d4a93f` into `/tmp`, `node_modules` symlinked; the way B made the oracle, `b-round-222/baseline-perf-run.log`). A row that differs in HEAD-vs-oracle as well is environment, recorded and not a FAIL. A row that differs only on the changed tree is a FAIL. If a root-only commit moved `package*.json` or `vite.config.ts` (§0), the `res.js.*` rows are compared against that HEAD run instead of the oracle. |
| UNUSED-223 | C's own scratch tsconfig (§4.4) | 0 unused-local or unused-parameter diagnostics in the 5 touched perf files. `npm run typecheck` rc 0. |
| LOWS-223 | Each of the 5 Lows in §3, by reading the code. For GATE217-S1, a scratch mutant (on a copy) in which "WAV created" never appears | S2: no literal `'stems'` passed to `emptyLanePoint`, and the lane id is read before `emptyFrom`. S3: a quote in an id cannot break the selector. S5: the note and the doc row match l.669–671. S1: the observer is disconnected in `finally` (the mutant shows the handle released). S2-217: `clearTimeout` is reached after `download.path()` settles. |
| LAB-SMOKE-223 | `/studio-lab` anonymous, 1440×900 and 1280×720 | 200, demo badge, workspace present, `auth_user` null, 0 page errors. App code is unchanged; this only confirms the dev server still serves it. |
| G223-3 (unstubbed auth guard) | `/studio/middle-east` with no stubs; `/api/studio-token` with no header | "Sign in required", 0 `audio[src]`; 401. Both viewports. |
| AN-REVIEW-223 | doc 175 and the granted sections of 163, 168 and 169 | TEMPLATE headings in order; l.4 byte-exact; every check cited exists (L26); the row counts match the reports; outside the granted sections, docs 163/168/169 are byte-identical (L34). |
| gate | full suite, build, Biome, verify, e2e smoke | `gate` in `c-round-223.json`; not claimed. The root gate does not run `test:perf`; EQUIV-223 is the only real proof. |

**Ableton conformance:** not applicable (no user-facing behaviour).

## 7. Adjacent behaviour that could break
- **A silently wrong window:**
  - a `page.evaluate` that throws `ReferenceError`, caught by R1, EQUIV-223 and page errors = 0;
  - a merged round trip, caught by R2 and the deterministic medians.
- **Report semantics:** an option set wrongly for one spec. Caught by REPORT-EQUIV-223 (mutants M-A, M-B, M-C).
- **Result paths:** `storeRoot` moved into `perf/lib`, so `budgetsFile` changes. Caught by the envelope check in `equiv-check.py`.
- **Future PERF tasks** depend on these specs. The equivalence oracle keeps their baselines valid.

## 8. Outcome, fixed in advance
| C result | B at round-224 planning |
|---|---|
| PASS, planning before 2026-10-30 | PERF-HARNESS-SHARED-LIB closes, with GATE214-S2/S3/S5 and GATE217-S1/S2. Round 224 = **PERF-HARNESS-SHARED-LIB-b** (§9), after a `performance-optimizer` consult. Reason: every later PERF task uses these determinism checks as proof, so they are made able to fail first. |
| PASS, planning on or after 2026-10-30 | Round 224 = **REGRESSION** (carry every `scope_additions` entry, L6). Then stage b. |
| A STOP (HEAD drift, a perf spec failing, an R1–R5 conflict) | B rules first (L10). No re-dispatch without a ruling. |
| EQUIV-223 or REPORT-EQUIV-223 fails | A bounded fix-up in the same files. |
| LAB-SMOKE-223 or G223-3 finds Medium+ | Investigated first. App code is unchanged, so it would be an environment or pre-existing finding, ruled by B. |

## 9. Queued after this round (recorded now, not part of round 223)
**PERF-HARNESS-SHARED-LIB-b** (D-29z244):
- a per-row determinism tolerance through the unused `PerfBudgetRow.tolerancePct`, replacing the metric-name sets: exact equality for integer counts, numerator and denominator checks for ratio rows (A-R214 M2), and a 0.1 floor for MiB rows;
- GATE214-S1 (state waits instead of `waitForTimeout(idleSettleMs)`, with re-baselined windows);
- GATE214-S4;
- R216-MEM-POLLS-HEADROOM (a page-timestamped export window);
- a durable `perf/lib/report.test.ts` with its vitest include (a root-owned config edit, requested from root).

Its baselines are re-measured in that round.

## 10. For root
- **Publication after C PASS:** grants 1–7 (the changed subset) and the 3 new files. Suggested message: `test(perf): share harness page and report helpers in perf/lib (PERF-HARNESS-SHARED-LIB)`. Reviewer focus: R1 (no module identifiers inside `evaluate`), the five report options per spec, and `storeRoot`.
- **Still pending, non-blocking:**
  - the export-pipeline checkpoint `b-round-221-checkpoint-request.md` (round-222 additions in `b-round-222.md` §6);
  - `b-round-220-root-request-vite.md`;
  - `b-round-215-root-request-l28.md`;
  - D-29z195.
