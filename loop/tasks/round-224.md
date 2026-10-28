# Round 224: PERF-HARNESS-SHARED-LIB-b-i. A per-row determinism contract that can fail, without moving any measured median

**Planned by:** B, at the round 223 → 224 planning, 2026-10-28. **Decisions:** D-29z251…D-29z258.
**Type:** test-only (the Playwright perf harness `perf/**`, one new unit test, one implementation doc). **No `app/**` change.**
**Queue position:** STUDIO-PERFORMANCE, `execution_order_d29z244`: … PERF-HARNESS-SHARED-LIB (round 223, C PASS, published `e140ab4`) → **PERF-HARNESS-SHARED-LIB-b** → PERF-2 … The round-223 outcome table (`tasks/round-223.md` §8, row 1: PASS, planning before 2026-10-30) fixes this round.
**Stage split (D-29z252):** stage b is split by meaning, without dropping anything:
- **b-i (this round):** report semantics only. No measurement window, wait or click changes, so every measured median must equal the round-223 C reports.
- **b-ii (next round, §9):** the window changes, with a re-baseline.

Both consults (tech-lead and performance-optimizer) agree with the split.
**Read first:** `lessons.md` (B, A and C), in full. L10, L11, L23, L26, L28, L30, L31, L32 and L34 apply directly.
**Reference first:** not in scope. This is a test-only round with no user-visible behaviour (policy exclusion).

## 0. Baseline and scope

**Baseline:** HEAD = `e140ab4796d1368a00c2f65fd2b03ec12182a06e` (gate 223 published on both remotes). The tree is clean: `b-round-223/git-status-at-planning.txt` is empty.
- If HEAD differs, or the tree is not clean at the start, **STOP** (L11).
- The one exception is a root commit that touches only `package.json`, `package-lock.json`, `vite.config.ts` or `vitest.config.ts` (§0.3). In that case, re-hash those 4 files and continue.

**Frozen:** `b-round-223-r224-tree-sha256.txt` lists 1,060 files: every tracked file except the 14 grants and the 4 files in `b-round-223-r224-root-or-granted.txt`. `sha256sum -c` returns rc 0 at planning. Among the frozen files:
- `perf/lib/instrumentation.ts`;
- `playwright.perf.config.ts`, `biome.json` and `tsconfig.json`;
- all of `app/**`.

**Root-owned, must equal HEAD:** `package.json`, `package-lock.json` and `vite.config.ts`. `vitest.config.ts` also stays equal to HEAD unless §0.3 option 1 or 2 applies. Start hashes: `b-round-223-r224-root-files-start-sha256.txt`.

### 0.1 Grants (`b-round-223-r224-grants.txt`, start sha in `b-round-223-r224-granted-start-sha256.txt`)
| # | Path | What may change |
|---|---|---|
| 1 | `perf/lib/report.ts` | The determinism part of `buildPerfReportCore` (§2.2). Remove the options `determinismMetrics` and `determinismRequiresKind`. Add the exported `rateRowId` (moved from `page.ts`) and an exported `rowRate`. |
| 2 | `perf/lib/stats.ts` | Delete `countsAgree`, but only if a grep shows no remaining importer. Nothing else. |
| 3 | `perf/lib/budgets.ts` | Remove the dead optional `tolerancePct` (the interface field and the `readRow` line, l.20 and l.80). No other change. |
| 4 | `perf/lib/page.ts` | Replace the body of `rateRowId` with `export { rateRowId } from './report';`, so the spec imports stay unchanged. Nothing else. |
| 5 | `perf/studio-lab.perf.spec.ts` (1a) | Drop the `determinismMetrics` set (l.47–53) and the two removed options. `crossRateMetrics` stays. Add `detail: { commits: rendered.length, moves }` to `commits-per-move` (l.353). The value expression is unchanged. |
| 6 | `perf/studio-lab-interactions.perf.spec.ts` (1b-i) | Drop `interactionDeterminismMetrics` (l.41–…) and the removed options. Apply GATE214-S4 (§3). |
| 7 | `perf/studio-lab-resources.perf.spec.ts` (1b-ii) | Drop `resourceDeterminismMetrics` (l.61–…) and the removed options. Nothing else. |
| 8 | `perf/budgets.json` | **Only:** (a) `load.longtasks-over-50`: `kind` becomes `"wallclock"`, and its `note` may say why; (b) on the 48 deterministic rows whose `note` contains ` Not determinism-checked.` (24 `commits-per-move`, 24 `release-commits`), delete that sentence. No other byte changes. |
| 9 | `perf/budgets.resources.json` | **Only** `res.export.1.longtasks-over-50`: `kind` becomes `"wallclock"`, and its `note` may say why. |
| 10 | `perf/budgets.interactions.json` | **Only** the `note` of `interact.harness.zoom-live`, `interact.harness.zoom-live.6x` and `interact.harness.zoom-30-live` (S4 wording). |
| 11 | doc `163-studio-perf-harness.md` | Whole sections (L34): §მეტრიკების განმარტება და ზღვრები, and §TODO / შემდეგი ნაბიჯები. |
| 12 | doc `168-perf-interactions-baseline.md` | §Liveness-ის წესები, §არქიტექტურა, §მეტრიკები, and §TODO. |
| 13 | doc `169-perf-resources-baseline.md` | §მიდგომა, only its bullet "Determinism-ის შემოწმების სიმკაცრე" (l.18). Also §Determinism-იდან გასული სტრიქონები, §არქიტექტურა, and §TODO. |
| 14 | doc `175-perf-harness-shared-lib.md` | §GATE214-S2 (l.63 subsection), §Stage b-ში გადასული, §ტესტირება (gate-223 S1: limit the "byte-identical" claim to identical passes; an error path can add the one "observer was not released" problem), and §TODO. **Do not change l.4.** |

### 0.2 New files (`b-round-223-r224-new-files.txt`)
- `perf/lib/determinism.ts`: the contract (§2.1).
- `perf/lib/report.test.ts`: the unit test (§2.4). Its first line is `// @vitest-environment node`. That line is a vitest pragma, so the CLAUDE.md comment rule does not apply to it. It imports `describe`, `it` and `expect` from `'vitest'` explicitly. It imports only `./report`, `./determinism`, `./budgets` types and `./stats`. **It never imports `page.ts` or `instrumentation.ts`**, because `page.ts` imports `@playwright/test` at runtime.
- `docs/implementation/2026/quarter-IV/176-perf-determinism-contract.md`: the next free number (175 is the last).

### 0.3 `vitest.config.ts` (root request `b-round-223-root-request-vitest.md`, D-29z253)
At start, A checks one thing, and the first match applies:
1. **`root-grant-r224-vitest.json` exists with `"granted": true`.** A appends `'perf/**/*.test.ts'` to the l.9 `include` array, and changes nothing else.
2. **HEAD already contains that include** (a root commit). A changes nothing.
3. **Neither.** A leaves `vitest.config.ts` untouched. A runs the test with a scratch config, `/tmp/a224-vitest.config.ts`, with top-level `root` set to the store, `test.include` set to `['perf/**/*.test.ts']` and `test.environment` set to `'node'`. No alias is needed.
   - A writes "not gate-covered until root adds the include" in doc 176 §ტესტირება.
   - B opens Low `PERF-REPORT-TEST-INCLUDE`.

   This is not a STOP, and not a C FAIL.

## 1. Why
Today's check is `countsAgree`, which allows ±max(2, 10 %). It cannot fail the ratio rows (A-R214 M2): `commits-per-move` is about 0.75–2 and `move-components-per-move` is 0.65–101. It also skips 59 deterministic rows in 1a alone. Every later PERF task uses these checks as its proof, so the checks must be able to fail before PERF-2.

**B's replay** (`b-round-223/replay-exact.txt`, script `b-round-223/scripts/replay.py`) ran an exact within-run check over every deterministic row in 13 complete reports from rounds 222–223. These were B's oracle, A's runs 1 and 2, C's run, and C's HEAD run. Exactly one row varies: `load.longtasks-over-50` (1a; for example [1,1,2], [1,2,1] and [1,2,2]). Every ratio row's `windowCommits`, `movesInWindow` and `componentsSum` are identical across the passes of a run.

The 6× fade rows are 59/60 in every pass, while 1× is 60/60. That is stable behaviour under throttling, which is why no ratio metric is added to a cross-rate check (perf-optimizer).

## 2. Contract

### 2.1 `perf/lib/determinism.ts`
Export a type `DeterminismContract`:

```
{ kind: 'exact' } | { kind: 'tenths' } | { kind: 'ratio'; pairs: readonly (readonly [string, string])[] }
```

Also export a function `determinismContract(row: PerfBudgetRow): DeterminismContract | null`. It resolves the contract in this order:
1. **By metric (ratio):**
   - `commits-per-move` → pairs `[['windowCommits', 'movesInWindow'], ['commits', 'moves']]`;
   - `move-components-per-move` → `[['componentsSum', 'movesInWindow']]`.
2. **By unit:** `MiB` → `tenths`.
3. **By unit, exact:** `count`, `components`, `elements`, `bytes`, `start() calls`, `boolean (1 = true)`, `commits / key` and `components / key` → `exact`.
4. **Otherwise** → `null`. This is fail-closed: an unknown unit on a deterministic row is a failure, never a skip.

B's inventory of every deterministic metric/unit pair in the three round-223 reports (`b-round-223/det-metric-inventory.txt`) maps fully onto steps 1–3. The fixed-denominator zoom ratios (`commits-per-key`, `components-per-key`) are exact on their value. Their denominator is the fixed key count, so a numerator change of 1 shows in the 3rd decimal.

No JSON key is added. The contract lives in code (tech-lead), so the budgets' and the report rows' key order stays byte-stable. The perf-optimizer's alternative (`toleranceAbs` / `ratioOf` JSON fields) is recorded in `b-round-223.md` §5 and was not adopted.

### 2.2 In `buildPerfReportCore`, per budget row (same place in the `failures` order as today's "nondeterministic count")
The check applies to **every row with `kind === 'deterministic'`** in every spec. The per-spec sets are gone. Row by row:
- `null` contract → `no determinism contract ${id}: metric ${metric}, unit ${unit}`. This fires even with 0 or 1 samples.
- `exact`: values not all equal → `nondeterministic count ${id}: [${values.join(', ')}]`. This is today's text.
- `tenths`: `Math.round(max * 10) - Math.round(min * 10) > 1` → `nondeterministic MiB ${id}: [${values.join(', ')}] (spread over 0.1)`.
- `ratio`:
  - Use the first pair whose two keys are numbers in **every** sample's `detail`.
  - If there is none and there is at least 1 sample → `ratio detail missing ${id}: needs one of ${pairs as "num/den" joined by ", "}`.
  - Otherwise, if the numerators are not all equal or the denominators are not all equal → `nondeterministic ratio ${id}: numerators [${…}], denominators [${…}]`.
- **Cross-rate** stays 1a-only and is called with the unchanged `crossRateMetrics` set. Its comparison becomes **exact median equality**: `base !== other`, with the same text `nondeterministic count ${id}: 1x ${base} vs 6x ${other}`. B checked the 42 1×/6× pairs of these 4 metrics in 4 complete 1a reports (C r223, C HEAD r223, B oracle r222, A r223 run 2): 0 differences.
- **Unchanged:**
  - `assertWhenPartial`, `guardProblems`, `complete`;
  - the "row not measured", "assert failed" and "measured row without a budget row" lines;
  - `shortByAbort`;
  - every other failure text and the order of failures.
- **`rowRate`** moves to module scope and is exported. **`rateRowId`** moves here from `page.ts` (grant 4) with the same body.

### 2.3 Rules that keep the measurement identical (C checks them)
- **R1.** No measurement window, wait, click, selector or `evaluate` round trip changes in this round. The only spec changes are those in grants 5–7.
- **R1, S4 exception:** the S4 slider `min`/`max` reads happen **before the first key's `t0`**, never inside a key window. They may also be read once, before the loop.
- **R2.** `import type` and `export type` for types.
- **R3.** No `any`, no `as`, no `@ts-ignore` or `@ts-expect-error`; semicolons everywhere.
- **R4.** No unused import or local remains. Check with the scratch tsconfig, as in round 223, with `noUnusedLocals` and `noUnusedParameters`, including `perf/**/*.ts`.

### 2.4 `perf/lib/report.test.ts`: named cases (the test name starts with the id)
Each case builds `budgets` and `passes` in memory and calls `buildPerfReportCore` (or `determinismContract`).

| Id | Input | Expect |
|---|---|---|
| DC-INT | count row [12, 12, 13] | a `nondeterministic count` failure. The old `countsAgree` would pass it. |
| DC-INT-OK | count row [12, 12, 12] | no failure |
| DC-RATIO | `commits-per-move`: values [1, 1, 0.983], details 60/60, 60/60, 59/60 | a `nondeterministic ratio` failure |
| DC-DENOM | values identical, details 60/60, 60/60, 59/59 | a `nondeterministic ratio` failure (`countsAgree` can never catch this) |
| DC-RATIO-ALT | 1a shape `{commits, moves}`, identical | no failure (the second pair is used) |
| DC-MISSING | ratio row, details `null` | a `ratio detail missing` failure |
| DC-MIB-OK | MiB [65.1, 65, 65] | no failure |
| DC-MIB | MiB [65.3, 65, 65] | a `nondeterministic MiB` failure |
| DC-UNKNOWN | deterministic row, unit `furlongs` | a `no determinism contract` failure |
| DC-WALL | wallclock row [1, 1, 2] (the reclassified long-task shape) | no failure |
| DC-CROSS | 1a-style: `move-components-per-move` 1× median 0.75 vs 6× 0.742, with `crossRateMetrics` | the cross-rate failure text |
| DC-CROSS-OFF | the same 6× 59/60 fade shape, with no cross set | no cross failure |
| DC-PARTIAL | the round-223 M-A case: partial run, an assert row out of budget, `assertWhenPartial` true vs false | reported only when true |
| DC-ORDER | one input that triggers guard, pass problem, unbudgeted id, assert failed, nondeterministic, short-by-abort and cross | `failures` in exactly the documented order (doc 175 l.44, plus the new texts in the nondeterministic slot) |
| DC-RATE | `rowRate(rateRowId('res.harness.mem-polls-1', r)) === r` for r in [1, 6], and `rowRate('x.6x') === 6` | equality (gate-223 S4 pin) |

**Red-proof (L23, named mutants).** A shows each case red against a scratch copy of the new core. The copy is in `a-round-224/`, never in the repo. The mutants are:
- **MU-1:** exact compare replaced by `countsAgree`. Red: DC-INT.
- **MU-2:** the ratio check reads only the numerators. Red: DC-DENOM.
- **MU-3:** the tenths floor is 0.5. Red: DC-MIB.
- **MU-4:** `null` contract → skip. Red: DC-UNKNOWN.
- **MU-5:** cross-rate back to `countsAgree`. Red: DC-CROSS.
- **MU-6:** `assertWhenPartial` ignored. Red: DC-PARTIAL.

## 3. GATE214-S4 (owned code, Low): ruled (D-29z255)
**Premise check.** The gate wrote "compares floats exactly". In fact the slider value is an integer step: `sliderPositionFromZoom` uses `Math.round` (`app/lib/arrangement/view.ts` l.250–256, 1000 steps). The exact compare is therefore correct and stays.

**The real weakness:** a path clamped at the zoom maximum or minimum (`TIMELINE_ZOOM_MAX = 320`, l.5) could still pass through or fail confusingly.

**Change (interactions spec, around l.414–450):**
- Read the slider's `min` and `max` attributes (numbers) before the first key's `t0`. They exist: `ArrangementTransport.tsx` l.264–265 renders `min={0}` and `max={TIMELINE_ZOOM_SLIDER_STEPS}` (1000, `view.ts` l.17). If either attribute is missing or not a finite number, push the problem `zoom slider min/max missing` and stop. Never fall back to the HTML default range.
- `live` additionally requires:
  - `values[i] === values[values.length - 1 - i]` for every i (a symmetric path);
  - every value strictly between `min` and `max` (no clamp).
- Add `sliderMin` and `sliderMax` to the detail.
- The existing problem line on `!live` stays. It may name the failing rule.

**The value stays 1** on the fixture: 678…851…678, inside 0–1000. That is checked by EQUIV-224.

## 4. A's checks (covering runs only; the speed rule applies)
1. **Offline replay (first):** a scratch script in `a-round-224/` rebuilds each pass from the round-223 C reports (`c-round-223/reports/latest*.json`: `samples[i]` and `details[i]` → pass i). It feeds them to the new core with the **new** budget files.
   - **Expected failures, exactly:** 24 `ratio detail missing` lines for 1a `commits-per-move` (1× and 6×; those reports carry no detail yet), and nothing else.
   - Anything else is a STOP (L11).
   - The log goes in `a-round-224.md`.
2. **Unit test:** `report.test.ts` runs green under §0.3's applicable config. The red-proofs MU-1…MU-6 are logged.
3. **Real perf run:** `CI=true npx playwright test --config playwright.perf.config.ts`, 3 passed. Then run `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-223/scripts/equiv-check-b1.py <c-round-223 report> <new report>` for each of the 3 reports. The oracle is `c-round-223/reports/latest.json`, `latest-interactions.json` and `latest-resources.json`. All three exit 0.
   - The script allows only the planned differences (§0.1 grants 8–10, plus details). Its controls are in `b-round-223/ctl/controls.log`.
   - Copy the reports to `a-round-224/`.
4. **`npm run typecheck`**: rc 0. **`npm run lint`**: 0 errors (`perf/` is not covered, L30). **Scratch tsconfig (R4)**: 0 diagnostics in the touched and new perf files.
5. **Code review:** many files change, so ask `code-reviewer`. Pass its Architecture note on to B.
6. **L32, verbatim:** a perf spec that **fails**, or runs **longer than 12 min**, is a STOP at the top of `a-round-224.md`. List PERF-1a's time (7.1–7.4 min in round 223) at the top as watch item PERF-1A-TIMEOUT-HEADROOM. That is not a STOP.

## 5. Implementation doc 176 (A)
Georgian, with the TEMPLATE.md sections in order.
- **l.4 exactly:** `**სტატუსი:** In Progress (stage 1 of 2; C round 224 PASS)` (L28; stage b-ii updates it).
- **Contents:**
  - the contract table (§2.1) with every metric/unit class;
  - the new failure texts;
  - the dropped options and why;
  - the two reclassified rows and why;
  - S4;
  - the replay result;
  - the MU-1…MU-6 red-proofs;
  - the EQUIV-224 result;
  - that `tolerancePct` was removed (doc 175 l.123 planned it, and this round changed that plan);
  - the b-ii items.
- **L26:** cite only test cases that exist (grep the DC ids). If §0.3 case 3 applies, say "not gate-covered until root adds the include".
- Docs 163, 168, 169 and 175: only the granted sections. Every "±10 % or ±2" or "determinism does not apply" sentence there becomes the new contract or a pointer to doc 176.
- Stale line references outside the granted sections go into A's list. They join DOC-PERF-LINEREF-DRIFT-223 (deferred), not a finding.

## 6. What C checks
| Row | What | Pass when |
|---|---|---|
| SCOPE-224 (start + end) | `git status`, frozen `sha256sum -c`, the root/conditional 4, the grants and the new files | Only grants 1–14 (`M`, any subset) and the 3 new files (`??`). Frozen rc 0. `package*.json` and `vite.config.ts` equal HEAD. `vitest.config.ts` equals HEAD, or (§0.3 case 1) differs only by the one include entry. HEAD `e140ab4`, or the root-only exception. |
| BUDGETS-DIFF-224 | C's own script over the 3 budget files, HEAD vs new | Only the changes in grants 8–10: 2 `kind` values, the 48 sentence deletions, and the notes of the 2 reclassified and 3 zoom rows. No key added or reordered. |
| CODE-224 | Read the diff | §2.1–2.3 as written. The contract order and fail-closed `null`. The failure texts byte-exact. Both options gone from all 3 specs and the core. No window, wait, click or `evaluate` change outside S4's pre-window reads (R1). `page.ts` only re-exports `rateRowId`. `countsAgree` is deleted only if it has no importer. R2/R3 met. |
| UNIT-224 | Run `report.test.ts` (config per §0.3). Then C's **own** mutants on scratch copies of `report.ts` / `determinism.ts` (at least MU-1, MU-2, MU-4 and MU-5, written by C) | All DC cases green on the real files. Each C mutant turns at least one named case red. Every DC id in §2.4 exists. |
| REPLAY-224 | C's own replay script: the round-223 C reports through the new core | Exactly the 24 expected `ratio detail missing` lines, and nothing else. A second replay of the **new** reports from EQUIV-224: 0 failures. |
| **EQUIV-224** (real Chromium) | `CI=true npx playwright test --config playwright.perf.config.ts` on the changed tree, then `equiv-check-b1.py` against `c-round-223/reports/*` | All 3 specs exit 0, and the script exits 0 for all 3: `complete` true, `failures` empty, 0 aborts, 0 page errors, every compared deterministic median identical (1a 166, 1b-i 122, 1b-ii 37). The 1a `commits-per-move` details now carry `{commits, moves}`. |
| EQUIV-224 clause | Only if a compared deterministic median differs | C runs HEAD `e140ab4` once (`git archive` into `/tmp`, `node_modules` symlinked). A row that differs in HEAD-vs-oracle too is environment, recorded and not a FAIL. A row that differs only on the changed tree is a FAIL. |
| S4-224 | Read the code, plus one scratch mutant (on a copy) whose path returns asymmetrically (for example the last `-` key skipped) | The mutant gives `zoom-live` 0, with the problem line. The real run gives 1 at 1× and 6× and for 30 clips. The `min`/`max` reads happen before any key's `t0`. |
| UNUSED-224 | C's own scratch tsconfig; `npm run typecheck` | 0 diagnostics in touched and new perf files; rc 0 |
| LAB-SMOKE-224 | `/studio-lab` anonymous, 1440×900 and 1280×720 | 200, demo badge, workspace present, `auth_user` null, 0 page errors (the first cold dev-server load is noted as C-R223-OBS-01 if it recurs) |
| G224-3 (unstubbed auth guard) | `/studio/middle-east` with no stubs; `/api/studio-token` with no header | "Sign in required", 0 `audio[src]`; 401. Both viewports. |
| AN-REVIEW-224 | doc 176 and the granted sections of 163, 168, 169 and 175 | TEMPLATE headings in order. l.4 byte-exact. Every DC id cited exists (L26). Docs 163/168/169/175 are byte-identical outside the granted sections (L34). Doc 175 l.4 is unchanged. |
| gate | full suite (includes `report.test.ts` only under §0.3 cases 1–2), build, Biome, verify, e2e smoke | `gate`; not claimed |

**Ableton conformance:** not applicable (no user-facing behaviour).

## 7. Adjacent behaviour that could break
- **A silently weaker check:**
  - fail-open on an unknown unit (caught by DC-UNKNOWN and MU-4);
  - the ratio check reading only one side (DC-DENOM and MU-2).
- **A falsely red run:**
  - a deterministic row that is really scheduling-dependent. Caught by REPLAY-224 and EQUIV-224's `failures` empty. If C finds one, it is a FAIL with the row named; B rules the row's kind.
- **A moved median:**
  - an accidental window change. Caught by R1 and EQUIV-224.
- **Spec imports:**
  - `rateRowId` re-exported from `page.ts`, so the specs' imports stay valid. Caught by typecheck and the perf run.

## 8. Outcome, fixed in advance
| C result | B at round-225 planning |
|---|---|
| PASS, planning before 2026-10-30 | b-i closes; A-R214 M2 and GATE214-S4 close. Round 225 = **PERF-HARNESS-SHARED-LIB-b-ii** (§9), after a `performance-optimizer` consult and re-measurement. |
| PASS, planning on or after 2026-10-30 | Round 225 = **REGRESSION** (carry every `scope_additions` entry, L6). Then b-ii. |
| A STOP (HEAD drift, an unexpected replay failure, a perf spec failing or taking more than 12 min) | B rules first (L10). No re-dispatch without a ruling. |
| EQUIV-224, UNIT-224 or REPLAY-224 fails | A bounded fix-up in the same files. |
| A deterministic row is shown to be scheduling-dependent | B rules that row's kind (reclassify with evidence), and then a fix-up. |

## 9. Queued after this round (recorded now, not part of round 224)
**PERF-HARNESS-SHARED-LIB-b-ii** (D-29z252), with a re-baseline in that round:
- **GATE214-S1:** state waits instead of `waitForTimeout(idleSettleMs)` (interactions l.635 and l.701, resources l.529, 1a l.567/590/661). 1a's fixed 2,000 ms Add wait is listed, and ruled at planning.
- **R216-MEM-POLLS-HEADROOM:** a page-timestamped export window.
- **GATE214-S2, ruled (D-29z254):** the deselect lane becomes "the first lane **after** the measured clip's lane in DOM order that has an empty right-half point". In the fixture the clip is on `music`, so that resolves to `stems`. This removes the literal and records the chosen id in the click-live detail. C-R223-01 showed that the clip's own lane is unusable and that a DOM-order scan from the top would pick `video`.
- **GATE223-S2:** the export observer is installed before the `try` (resources l.291 vs l.327); move it inside.
- **PERF-1A-TIMEOUT-HEADROOM:** measured after S1; if 1a stays above 50 % of 15 min, a root request for `playwright.perf.config.ts`.

## 10. For root
- **Publication after C PASS:** the changed subset of grants 1–14, plus the 3 new files, plus `vitest.config.ts` if §0.3 case 1 applied. Suggested message: `test(perf): per-row determinism contract that can fail (PERF-HARNESS-SHARED-LIB-b-i)`. Reviewer focus:
  - the fail-closed contract;
  - the failure texts and their order;
  - no window change.
- **Open request:** `b-round-223-root-request-vitest.md` (the include line; non-blocking, choose before A starts if possible).
- **Still pending, non-blocking:**
  - `b-round-221-checkpoint-request.md`;
  - `b-round-220-root-request-vite.md` (C-R223-OBS-01 attached);
  - `b-round-215-root-request-l28.md`;
  - D-29z195.
