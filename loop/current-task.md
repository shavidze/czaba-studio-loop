# Round 280: PERF-HARNESS-SHARED-LIB-b-ii-2 (test-only, final stage of b-ii). The export heap samples are counted on the page clock by their request-response midpoint, with a measured clock probe, and the mem-polls rows record what the old endpoint rule would have counted

**Planned by:** B, at the round 279 → 280 planning, 2026-10-31. **Decisions:**
- D-29z642: round 279 closed (C PASS, gate 279 published `1dbf3af`). b-ii-1 is **მზადაა**.
- D-29z643: the gate-279 and A/C notes are recorded (GATE279-S1 Medium → round 281; Lows deferred; info; architecture signals).
- D-29z644: TIMEOUT-DATA goes to ROOT-REQ-PERF-TIMEOUT as data. It does not close.
- D-29z645: round 280 = b-ii-2 only. Round 281 = GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL (`tech-lead`; `performance-optimizer` agrees on a separate round).
- D-29z646: the design rulings of §2 (`heapPollMs` stays 50; R216 headroom measured, not claimed).
- D-29z647: the equivalence contract of §2.5 (named exceptions only).
- D-29z648: docs. New doc 209; L28 final stage, so 208 and 176 l.4 become `Completed (C round 280 PASS)` [K12].
- D-29z649: the outcome table of §11.

**Kind of round:** performance-harness, test-only. Reference-first, the AGREE note, the YouTube request, `product-designer` and the screen budget do not apply (policy 2026-10-27/28: "pure performance, refactor, test-only … rounds"). No app source changes. `oss-adoption.md`: no new dependency.

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-279-r280-grants.txt`. **Frozen list:** `b-round-279-r280-tree-sha256.txt` (1136 files: every tracked file except the 7 tracked grant paths).

## Baseline: HEAD `1dbf3af`, clean tree
`gates/gate-round-279.json` is `published`, commit `1dbf3af`. At planning, `git status --short` was empty and `git ls-files | wc -l` was 1143 (`b-round-279/git-status-at-planning.txt`, `head-at-planning.txt`).

## 0. Read first
1. `lessons.md`, every role. Especially L11, L23, L28, L29, L30, L34, L37 and **L38 (perf runs alone; a second dev server gets its own `cacheDir`)**.
2. This task.
3. B's sketch: `b-round-279/sketch.diff` (apply with `patch -p1` from `store/`; it touches the two code/data files only, not the docs).

**Primitives for A:** `AGENT_DISCOVERABLE_CODE.md` (new names), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. `.claude/prompts/new-test.md` does not apply (no new test file).

## 1. What changes, and why
R216-MEM-POLLS-HEADROOM (info): the liveness row `res.harness.mem-polls-1` counts 7–11 samples against an assert of `>= 5`. Today a heap sample counts only when its CDP request was **sent** after the window start and its response **received** before the window end [K4]. The window is converted to the epoch with the page's `performance.timeOrigin` [K3][K4], while the samples carry node `Date.now()` stamps [K2][K3]. So two clocks are compared, and a sample whose round trip straddles an edge is dropped even when it was read inside the window. `endSampleLagMs` mixes the same two clocks [K6].

**What B measured at `1dbf3af`** (HEAD run `b-round-279/head-results-1/`, experiment `sketch-v1-experiment.diff` ×2, final sketch `mutants/SKETCH/`):
- the node-to-page clock offset differs from `timeOrigin` by only −0.5 … −2.2 ms; the best probe round trip is 1–3 ms (both CPU rates);
- the midpoint rule counts **0 to +2** more samples per export than the endpoint rule. The sum over the 12 exports of a run is +11, +12 and +11 in three runs;
- at 1×, export 1 counts 9–10 against about 9.3–10.3 expected polls (window ÷ 50 ms); at 6× it counts 13–15 against about 21–22, because the CDP round trip under throttling is longer than 50 ms;
- `res.export.1.peak-backing-delta-mib` moved 65 → 65.1 in two of three sketch runs: with the midpoint rule a sample just before the "WAV created" text can land inside the window, and its peak (`windowPeakMib` 65.1) is above the end sample (65). `res.export.2.peak-backing-delta-mib` stayed 129.9. HEAD's own 6× row already showed 65.1 once.

So the honest result is: this round makes the window **correct** (one clock, both edges handled the same way, a named problem when the clock probe is bad) and adds the data that shows the headroom. It does **not** create much headroom: about +1 sample per export. R216 stays open as a watch with this data (D-29z646). `heapPollMs` stays 50 (both consults): a shorter period doubles the CDP work on the main thread inside the window that `wall-ms`, `longtask-*` and `loaf-blocking-max` measure, and it would not make the peak more deterministic.

## 2. The contract
### 2.1 Clock probe (D-29z646)
Two new module constants, next to `passGuardMs`: `clockProbeCount = 5` and `clockProbeMaxRttMs = 20`.

`interface PageClock { offsetMs: number; rttMs: number }` and `async function probePageClock(page)` (module-local, not exported):
- 5 probes in a row: `sentAt = Date.now()`, `pageNow = await page.evaluate(() => performance.now())`, `receivedAt = Date.now()`;
- keeps the probe with the smallest `receivedAt − sentAt`, and its `offsetMs = (sentAt + receivedAt) / 2 − pageNow`, so a node stamp `x` is `x − offsetMs` on the page clock;
- throws `the page clock probe took no reading` if it has none.

In `measureExport` it runs once per export, inside the `try`, right after the `timeOrigin` read [K3] and **before** the poll loop starts. No probe runs inside the export window (`tech-lead`). If `clock.rttMs > clockProbeMaxRttMs`, push exactly `` `export ${clips}: the page clock probe's best round trip was ${clock.rttMs} ms (limit ${clockProbeMaxRttMs} ms)` `` to `result.problems`. Never fall back silently to another offset.

### 2.2 Window rule
`function heapSamplesInWindow(samples, offsetMs, from, to)` (module-local): keeps a sample when `midpoint = (sentAt + receivedAt) / 2 − offsetMs` satisfies `from <= midpoint && midpoint <= to`. `measureExport` calls it with `clock.offsetMs`, `t0` and `windowEnd` [K7]. `inWindow` (the mem-polls value and the peak input) is its result.

**Unchanged** (`tech-lead` hard limits): `t0`, `t1`, `windowEnd`, `wall-ms` [K7]; the observer install and release; `observerSettleMs` [K1]; `snapshot`/`blockingFramesIn`; `readyBackingBytes`; `heapPollMs` 50 [K1]; the poll loop body; the `< 5` problem text and the no-peak problem text [K5]; every other row.

### 2.3 Detail fields (detail only; no row field changes)
The `mem-polls-${clips}` detail [K5] becomes, in this order: `errors`, `allSamples` (both unchanged), `endpointRule` (the count the HEAD rule [K4] gives on the same samples; keep `windowStartEpoch`/`windowEndEpoch` for it), `clockOffsetMs` (`roundTo(clock.offsetMs − timeOrigin, 2)`), `clockRttMs`, `expectedPolls` (`roundTo((windowEnd − t0) / heapPollMs, 1)`).

`clockOffsetMs` is the probe's offset **minus `performance.timeOrigin`**, so it reads as a small number (B: −0.5 … −2.2 ms). It is a diagnostic of how far the probe and `timeOrigin` disagree; it is **not** the value the filter uses (the filter uses the epoch-sized `clock.offsetMs`).

`endSampleLagMs` [K6] becomes `roundTo(endSentAt − clock.offsetMs − windowEnd, 0)`: one clock. It is a detail field. Because `clock.offsetMs` differs from `timeOrigin` by about the probe RTT, the expected shift against HEAD is ≤ 3 ms; values staying about 30–60 ms (B's runs: 33–59) is the evidence that nothing else moved. A 1–3 ms difference is not a defect.

### 2.4 Budget notes (`perf/budgets.resources.json`, the `note` field only, exact text)
- The four `peak-backing-delta-mib` rows [K8][K9]: replace the phrase `polled in the window (at most every 50 ms) plus one window-end sample` with `over the heap samples (polled every 50 ms, or one CDP round trip if longer) whose request-response midpoint, on the page clock, falls in the export window, plus one window-end sample`. The rest of each note is unchanged.
- The four `mem-polls` rows [K8][K9]: replace `Valid backingStorageSize samples polled in the export window. Timing-dependent poll count, so wallclock (round 217, D-29z219); observed across A and C runs in round 216: N–M.` with `Valid backingStorageSize samples whose request-response midpoint, on the page clock, falls in the export window (round 280). Timing-dependent poll count, so wallclock (round 217, D-29z219); observed ranges are in doc 209.` The `1x pass. ` / `6x pass (CPU throttle on after ready and Add). ` prefix is unchanged.

`id`, `kind`, `mode`, `budget`, `owner` of every row are unchanged [K9] (`>= 5` stays).

### 2.5 Equivalence contract (D-29z647)
**Oracle:** `b-round-279/head-results-1/latest-resources.json` (B's HEAD run at `1dbf3af`, 1 passed, 1.3 min). A's and C's round-279 `latest-resources.json` ran the same perf code (`cmp`-equal), so they are same-code witnesses for the wallclock ranges.

**Pass on A's tree:** from `store/`:

```
python3 -I ../tmp/studio-real-loop/b-round-279/scripts/equiv-check-b2.py <oracle> <new latest-resources.json> \
  --note-exempt res.export.1.peak-backing-delta-mib res.export.2.peak-backing-delta-mib res.export.1.peak-backing-delta-mib.6x res.export.2.peak-backing-delta-mib.6x res.harness.mem-polls-1 res.harness.mem-polls-2 res.harness.mem-polls-1.6x res.harness.mem-polls-2.6x \
  --tol res.export.1.peak-backing-delta-mib=0.1 res.export.2.peak-backing-delta-mib=0.1
```

It must exit **0 with 0 problems**: envelope and sequence identical, row ids and order identical, every row field identical except the 8 named notes, every deterministic median identical except the two named ±0.1 tolerances, every assert pass identical, `complete: true`, `failures: []`, and no pass with `abortedAt`, `pageErrors` or `problems`. B's sketch: 0 problems, 1 tolerated (`65 → 65.1`) (`b-round-279/precheck-equiv-mutants.txt`). The script was proven on the sketch and on MU-ORIGIN (rc 0) and fails without the exceptions (`precheck-equiv-strict.txt`: 9 problems, the 8 notes and the 65.1).

The new notes must equal §2.4 byte for byte (EQUIV checks the other fields; C's BUDGET-NOTES row checks these).

**PERF-1a and PERF-1b-i are not affected:** only the resources spec reads `budgets.resources.json`, and no other spec or config imports the resources spec [K18]; `perf/lib/**` is frozen. They are not re-run by A or C.

**Same-machine HEAD re-run clause** (round-223 rule): a deterministic difference outside the two tolerances counts against A only if a `git archive 1dbf3af` run of 1b-ii **on the same machine** reproduces the oracle's value. Run it alone (L38). If HEAD reproduces A's value instead, the row is machine-sensitive: record it as data, not a FAIL.

## 3. Consults and rulings
- **`tech-lead`:** 280 = b-ii-2 only; GATE279-S1, the click-live lane id and the "lane null" text go to 281 (three tightly related harness-diagnostics bugs in `page.ts` and the interactions spec). New doc 209. Grants: the resources spec and its budgets plus docs, no `perf/lib/**`. Hard limits of §2.2. Probe before the poll loop, never inside the window; smallest RTT; named problem on a bad probe. `heapPollMs` stays 50. Mutants: sign flip, endpoint rule restored, probe throws.
- **`performance-optimizer`:** the probe and the midpoint predicate; `heapPollMs` stays 50; expected movement 0 at 1×; the midpoint rule adds only about RTT/50 polls per edge, so R216 stays open; live mutants are weak except the sign flip; notes from A's run, C extends.
- **Disagreements, settled by measurement (D-29z646):**
  - headroom: `tech-lead` expected the window fix to give headroom, `performance-optimizer` about +1. B measured +0…+2 per export (sum +11/+12/+11 per run): `performance-optimizer` is right; R216 stays a watch.
  - peak movement: `performance-optimizer` expected 0 and proposed dropping the ±0.1. B measured 65 → 65.1 in two of three sketch runs (`windowPeakMib` 65.1): the ±0.1 stays, for the two 1× rows only.
  - `tech-lead`'s "offset forced to 0 stays green" control does not hold: the offset is an epoch value, so 0 drops every sample. B's control is MU-ORIGIN (offset = `timeOrigin`, the HEAD conversion): green with the same counts.
- **Advisor:** used before writing.

## 4. B's pre-check (L23: the sketch is pre-applied and measured)
B applied §2.1–2.4 to a `git archive 1dbf3af` copy (`/tmp/b279-sketch2`, node_modules symlinked), saved as `b-round-279/sketch.diff`. `npx tsc --noEmit -p .` rc 0. Every run below ran alone (L38); the consults were read-only and ran no jobs.

| Run | Result | Evidence |
|---|---|---|
| HEAD 1b-ii | 1 passed (1.3 min); oracle | `b-round-279/head-results-1/`, `head-res-run1.log` |
| Experiment v1 ×2 (same rule, diagnostic names) | passed ×2; offset −0.5…−1.5 ms, RTT 1–2 ms; +0…+2 per export; run 2 1× peak 65.1 ×3 | `sketch-v1-experiment.diff`, `sketch1-results-{1,2}/` |
| SKETCH (final) | 1 passed (1.3 min); EQUIV-B2 0 problems, 1 tolerated; Σ(value − endpointRule) = 11 | `mutants/SKETCH/`, `precheck-equiv-mutants.txt` |
| MU-SIGN | red: every mem-polls 0, 32 failures, problems `only 0 valid backingStorageSize samples` + `no peak` | `mutants/MU-SIGN/` |
| MU-RTT | red: 12 failures, problem `the page clock probe's best round trip was 1 ms (limit -1 ms)` in every export | `mutants/MU-RTT/` |
| MU-ENDPOINT | passes the specs (as expected), but Σ(value − endpointRule) = **0** | `mutants/MU-ENDPOINT/` |
| MU-ORIGIN (control) | green: EQUIV-B2 0 problems, Σ = 12 | `mutants/MU-ORIGIN/` |
| MU-PROBE-THROW | red: every pass `abortedAt` `export 1 clip`, problems only `aborted at export 1 clip: MU-PROBE-THROW` (no `was not released`) | `mutants/MU-PROBE-THROW/` |

Runner: `b-round-279/scripts/run-mutant.sh <ID>` (git archive + `sketch.diff` + the mutant; edit `DIFF=` to A's diff to reuse it). Σ is printed by `b-round-279/scripts/mempolls-diff.py <latest-resources.json>`.

## 5. Grants (exact; also in `b-round-279-r280-grants.txt`)
| Path | What may change |
|---|---|
| `perf/studio-lab-resources.perf.spec.ts` | §2.1–2.3 only: the two constants, `PageClock`/`probePageClock`/`heapSamplesInWindow`, and inside `measureExport` the probe and its problem, the window filter, the mem-polls detail and `endSampleLagMs` |
| `perf/budgets.resources.json` | the `note` field of the 8 rows of §2.4, to the exact texts |
| `docs/implementation/2026/quarter-IV/209-perf-export-window-page-clock.md` | new [K11]. l.4 exactly `**სტატუსი:** Completed (C round 280 PASS)`. The seven TEMPLATE headings (L26). It records: the rule, the probe, B's and A's measurements (offset, RTT, Σ, the mem-polls ranges of A's run per row, the peak values), why `heapPollMs` stays 50, R216's residual risk, the mutants with A's results, and in TODO round 281's three items and the two architecture signals (A-R279-ARCH-IDLESETTLE-ROLES, GATE279-ARCH-COPY-STRINGS). Every cited id exists in this task or in `backlog.json` |
| `docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md` | l.13 (the b-ii split sentence) stays: it describes history. l.4 → exactly `**სტატუსი:** Completed (C round 280 PASS)` (L28 final stage) [K12]; the TODO bullet at l.85 (b-ii-2 done, doc 209) and the one at l.88 (the lane id goes to round 281, B-R280-CLICK-LIVE-LANE-ID) [K15][K17] |
| `docs/implementation/2026/quarter-IV/176-perf-determinism-contract.md` | l.4 → exactly `**სტატუსი:** Completed (C round 280 PASS)` (L28: b-i was stage 1 of b; b-ii-2 is its last stage) [K12]; the b-ii TODO bullet at l.153 [K15] |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | the whole `### Export-ის მეტრიკები` section, l.30–41 (L34: the `peak-backing-delta-mib` and `mem-polls-N` rows describe the window rule) [K16][SW-C]; the b-ii TODO bullet at l.213 [K15] |
| `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md` | the b-ii TODO bullet at l.132 only [K15] |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | the b-ii TODO bullet at l.253 only [K15] |

**Frozen:** the manifest is the authority. It includes all of `app/**`, `perf/lib/**` (including `page.ts`: GATE279-S1 is round 281), the other two perf specs, `perf/budgets.json`, `perf/budgets.interactions.json`, `playwright.perf.config.ts`, `vitest.config.ts` [K13], `package.json`, `package-lock.json`. **No `test.setTimeout` anywhere.**

**Protected auth/purchase (never touched):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.

## 6. Tests
No vitest change: `perf/**` is outside the vitest include [K13]. A pure-function unit test for `heapSamplesInWindow` was considered (`performance-optimizer`) and not adopted: it would run only under a scratch config while ROOT-REQ-VITEST-PERF-INCLUDE is open, and the live mutants below give observable signals. The proof is the real perf run, EQUIV-B2 and the named mutants.

### 6.1 What A runs (speed rules; L38: perf alone, nothing else running)
1. `npm run typecheck` (it covers `perf/**`; Biome does not, L30) and `npm run lint` (app scope, should be unchanged).
2. `CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources` on the final tree, **alone**, **twice** (two reports for the doc-209 ranges). EQUIV-B2 (§2.5) on each. `mempolls-diff.py` on each.
3. The mutants of §6.2 on scratch copies outside `store/` (`run-mutant.sh` with `DIFF=` A's diff). Run only 1b-ii.
4. `code-reviewer` (more than 3 files). Pass its Architecture note to B.

### 6.2 Named mutants (signals fixed in advance)
| Id | Mutant (scratch only) | Signal |
|---|---|---|
| MU-SIGN | in `heapSamplesInWindow`, `- offsetMs` → `+ offsetMs` | red: every `mem-polls` sample 0; problems `export 1: only 0 valid backingStorageSize samples in the window (0 invalid)` and `export 1: no peak (0 window samples, end sample read)` |
| MU-RTT | `clockProbeMaxRttMs = -1` | red: every export has the problem `the page clock probe's best round trip was N ms (limit -1 ms)` |
| MU-ENDPOINT | `inWindow` = the HEAD endpoint filter | specs pass; `mempolls-diff.py` Σ(value − endpointRule) = **0**. On A's tree Σ must be **≥ 3** (B: 11, 12, 11) |
| MU-ORIGIN (control) | `heapSamplesInWindow(heapSamples, timeOrigin, …)` | green: EQUIV-B2 0 problems; Σ ≥ 3. Shows the probe agrees with `timeOrigin` within a few ms |
| MU-PROBE-THROW | `throw new Error('MU-PROBE-THROW')` as the first statement of `probePageClock` | red: every pass `abortedAt` `export 1 clip`; problems contain `MU-PROBE-THROW` and **no** `was not released` |

## 7. B's claims and sweeps (L29). Run `bash ../tmp/studio-real-loop/b-round-279/claims.sh` from `store/` at HEAD `1dbf3af` (or a clean archive)
B's output is `b-round-279/claims-output-at-1dbf3af.txt` (identical on `store/` and on the archive).

| Tag | What | Expected |
|---|---|---|
| K1 | `heapPollMs`, `observerSettleMs` | l.52 (50), l.59 (200) |
| K2 | `HeapSample` | l.106–109: `sentAt`, `receivedAt`, `backingBytes` |
| K3 | `timeOrigin` read, poll-loop `Date.now()` stamps | l.305, l.309, l.313 |
| K4 | epoch window and the endpoint filter | l.382, l.383, l.385 |
| K5 | mem-polls `putLive`, `< 5` problem, no-peak problem | l.387, l.391, l.409 |
| K6 | `endSampleLagMs` against `windowEndEpoch` | l.404 |
| K7 | `t0`, `windowEnd`, `wall-ms` | l.355, l.356, l.365 |
| K8 | budget-note phrases | 4 peak-backing notes with `polled in the window (at most every 50 ms) plus one window-end sample`; 4 mem-polls notes with `observed across A and C runs in round 216: N–M.` |
| K9 | the 8 rows' kind/mode/budget | 1× peak-backing deterministic record; 6× peak-backing wallclock record; 4 mem-polls wallclock assert `>= 5` |
| K10 | the resources spec does not call `waitForCollectionReady` | 0 |
| K11 | last doc in quarter-IV | `208-perf-harness-state-waits.md` |
| K12 | `In Progress (stage` lines | doc 176 l.4 and doc 208 l.4 only |
| K13 | vitest include | `app/**/*.test.{ts,tsx}` only |
| K14 | docs that name mem-polls or the window rule | 168, 169, 175, 176, 208 |
| K15 | b-ii TODO bullets | 168 l.253, 169 l.213, 175 l.132, 176 l.153, 208 l.85 |
| K16 | doc 169 headings | `### Export-ის მეტრიკები` l.30, next heading l.42 |
| K17 | doc 208 D-29z254 leftover | l.88 |
| SW-B | names this round adds, roots `perf`, `app`, `e2e` | 0 hits at HEAD; on A's tree only in the resources spec |
| SW-C | consumers of `allSamples` / `endSampleLagMs` outside the spec, roots `perf`, `app`, `e2e`, `docs` | 1 hit: doc 169 l.38 (granted section) |
| K18 | readers of `budgets.resources.json` and importers of the resources spec, roots `perf`, `playwright*.ts` | 1 hit: the resources spec itself, l.43 |

**Focus origins (L50):** not applicable. No app code, no focus change.

## 8. C rows (C runs nothing else while a perf spec runs, L38)
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-279-r280-tree-sha256.txt` rc 0. `git status --short` lists only §5 paths (1 `??`: doc 209) |
| HUNK-SCOPE | the two code/data files equal `b-round-279/sketch.diff` applied to `1dbf3af`, or state each semantic difference (Biome does not cover `perf/`). The doc hunks stay inside the §5 sections |
| CLAIMS | `claims.sh` on a clean `1dbf3af` archive equals `claims-output-at-1dbf3af.txt`. Plus the L29 sweep over this task |
| SWEEP | SW-B on A's tree: hits only in `perf/studio-lab-resources.perf.spec.ts`. `grep -rn "test.setTimeout" perf` = 0 |
| KEEP | on A's tree: `heapPollMs = 50`, `observerSettleMs = 200`, the `< 5` and no-peak problem texts, `t0`/`windowEnd`/`wall-ms` lines unchanged from K1/K5/K7; the probe runs before the poll loop starts and outside the click-to-text window |
| TYPECHECK | `npm run typecheck` rc 0 |
| PERF-RUN | `CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources` alone on A's tree: passed. Record time and Chromium version |
| EQUIV | §2.5 EQUIV-B2 against `b-round-279/head-results-1/`: rc 0, 0 problems. Report the `tolerated` lines (the actual peak values). On another deterministic difference apply the same-machine clause before a FAIL. An environment-invalid run (overlap, load) is kept and replaced at most twice (L38) |
| CLOCK-DATA | `mempolls-diff.py` on C's report: every export has `clockRttMs` ≤ 20, `|clockOffsetMs|` ≤ 20, and `value ≥ endpointRule`; Σ ≥ 3. Report all values |
| BUDGET-NOTES | the 8 notes equal §2.4 byte for byte; `id`/`kind`/`mode`/`budget`/`owner` of all 61 rows unchanged (EQUIV covers them) |
| MUTANTS | re-run MU-SIGN, MU-ENDPOINT, MU-ORIGIN and MU-PROBE-THROW (each about 1.3 min). Each gives its §6.2 signal; for MU-ENDPOINT the signal is Σ(value − endpointRule) = **0 exactly** |
| G280-AUTH | `/studio-lab` anonymous with the badge "Demo collection — no sign-in required". `/studio/middle-east` signed out shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` with no header → 401, no token. **Both viewports**. A probe against :5173 warms the page first or waits ≥ 150 s for "Demo collection ready" (INFO-C279-LANE-PROBE-TIMEOUT) |
| DOC-209 | doc 209 l.4 byte-exact `**სტატუსი:** Completed (C round 280 PASS)`; the seven TEMPLATE headings in order (L26); its mem-polls ranges equal A's two reports; every cited id exists. Docs 208 and 176 l.4 byte-exact `**სტატუსი:** Completed (C round 280 PASS)`. `grep -rn 'In Progress (stage' docs/implementation` = 0 hits. Doc 169's `### Export-ის მეტრიკები` section matches the live code (L34). The four TODO bullets say what round 280 did; 208 l.88's bullet names round 281 |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke`: **gate** rows, not claimed in `passed` |

`browserVerified` is about the real browser rows: PERF-RUN, CLOCK-DATA, MUTANTS and G280-AUTH. All of them run in the cloud; none needs the backend.

**Ableton conformance:** not applicable (test-only harness round).

## 9. Neighbour risk
- **The export deterministic rows.** `wall-ms` and the window are unchanged; only the sample filter moves. EQUIV covers all 37 deterministic rows; the only allowed move is the two 1× peak rows by ≤ 0.1.
- **The long-task rows inside the window.** No new CDP or page work runs inside the window (the probe runs before the click). They are wallclock anyway.
- **PERF-1a / 1b-i.** Untouched files (frozen).
- **App code.** None is touched.

## 10. STOP conditions (L11)
- Any EQUIV problem outside the two named tolerances: report the row, the samples and, if you can, the same-machine HEAD value. **Do not re-baseline**, and do not rule an exception yourself.
- A §6.2 mutant without its signal, or Σ < 3 on A's tree: write a STOP; do not drop the row.
- `clockRttMs` > 20 on A's tree in any export (the named problem would fail the pass): STOP with the values.
- Any change needed in a frozen file.

## 11. Outcome, fixed in advance (D-29z649)
| C result | B at the round-281 planning |
|---|---|
| PASS, gate publishes, planning before 2026-11-02 | b-ii-2 is **მზადაა**, so PERF-HARNESS-SHARED-LIB-b-ii and PERF-HARNESS-SHARED-LIB-b are **მზადაა**. R216-MEM-POLLS-HEADROOM → watch with doc 209's data (reopen as a task if any run shows `mem-polls-1` < 7). Round 281 = GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL, with the consults first |
| PASS, planning on or after 2026-11-02 | REGRESSION round first (the 3-day rule); 281's scope after it |
| EQUIV fails only on a peak row by more than 0.1, and the same-machine HEAD re-run shows the same | machine-sensitive: B rules the tolerance with the data; same grants |
| SOURCE-SCOPE fails | stop; root inspects; nothing is published |
| Gate fails | one bounded fix-up with its cause recorded |

## 12. Deliverables
- **A:** the §2 changes, doc 209 and the granted doc lines; `a-round-280.md`: changed files; commands with results; the two perf runs' times; both EQUIV-B2 outputs; both `mempolls-diff.py` outputs; the mutants table; the code-reviewer result and its Architecture note.
- **C:** `c-round-280.md`; `c-round-280.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`); evidence under `c-round-280/`.

## 13. Root notes
- No dependency change.
- **ROOT-REQ-PERF-TIMEOUT** stays open and non-blocking. New data from round 279: PERF-1a 6.4 min (A) and 6.5 min (C) = 43 % of 15 min on two fresh cloud machines (B's 873d835 run: 8.4 min). ROOT-REQ-VITEST-PERF-INCLUDE stays open.
- After C PASS, b-ii-2 is ready for the gate. It closes PERF-HARNESS-SHARED-LIB-b. It is not a release.
