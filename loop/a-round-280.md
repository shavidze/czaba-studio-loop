# A round 280: PERF-HARNESS-SHARED-LIB-b-ii-2 (test-only)

No STOP. Baseline HEAD `1dbf3af`, clean tree at start. Evidence folder: `a-round-280/`.

## Changed files (all inside §5 grants)
- `perf/studio-lab-resources.perf.spec.ts`: B's `b-round-279/sketch.diff` applied unchanged (`patch -p1`). It adds `clockProbeCount` = 5, `clockProbeMaxRttMs` = 20, `PageClock`, `probePageClock` and `heapSamplesInWindow`. Inside `measureExport` it adds the probe and its problem (after the `timeOrigin` read, before the poll loop, inside `try`), the midpoint window filter, the mem-polls detail (`errors`, `allSamples`, `endpointRule`, `clockOffsetMs`, `clockRttMs`, `expectedPolls`) and `endSampleLagMs` on one clock. My diff is `a-round-280/a-round-280.diff`. Its hunk bodies are identical to `sketch.diff`; only the file order and hunk-header context differ. There is no semantic difference.
- `perf/budgets.resources.json`: only the 8 §2.4 `note` texts change (from the sketch, byte-identical to §2.4).
- Doc 209 (new) `docs/implementation/2026/quarter-IV/209-perf-export-window-page-clock.md`:
  - l.4 `**სტატუსი:** Completed (C round 280 PASS)`;
  - the 7 TEMPLATE headings in order;
  - the rule, the probe, B's and A's data, why `heapPollMs` stays 50, R216's residual risk, and the mutants;
  - TODO: round 281's three items, the two architecture signals, and the root requests.
- Doc 208: l.4 is now `Completed (C round 280 PASS)`. The TODO bullets at l.85 (b-ii-2 done, doc 209) and l.88 (lane id → round 281, B-R280-CLICK-LIVE-LANE-ID) are updated. l.13 is unchanged.
- Doc 176: l.4 is now `Completed (C round 280 PASS)`, and the b-ii TODO bullet at l.153 is updated.
- Doc 169: in `### Export-ის მეტრიკები` I rewrote the `peak-backing-delta-mib` and `mem-polls-N` rows to the live rule. I also updated the b-ii TODO bullet at l.213, including a pointer that the round-216 tables use the old rule (reviewer L4).
- Docs 175 (l.132) and 168 (l.253): only the b-ii TODO bullet.
- `grep -rn 'In Progress (stage' docs/implementation` = 0.

## Commands and results
| Command | Result |
|---|---|
| `npm run typecheck` / `npx tsc --noEmit` | rc 0 (run before and after the doc edits) |
| `npm run lint` | rc 0: 205 warnings and 1 info (post-change count; I did not compare with a pre-change count). `perf/` is outside the lint scope (L30) |
| `npx biome check <the 2 perf files>` | `× No files were processed in the specified paths.` … `These paths were provided but ignored: perf/studio-lab-resources.perf.spec.ts, perf/budgets.resources.json` (L30) |
| §2.4 notes | `grep -c` for each exact §2.4 phrase in `perf/budgets.resources.json`: peak-backing phrase 4, mem-polls phrase 4 |
| `claims.sh` on a fresh `git archive 1dbf3af` (`/tmp/a280-claims`) | output identical to `b-round-279/claims-output-at-1dbf3af.txt` (`a-round-280/claims-output-archive.txt`) |
| `sha256sum -c b-round-279-r280-tree-sha256.txt` | OK (frozen manifest intact) |
| SW-B sweep (`probePageClock\|heapSamplesInWindow\|clockProbe*\|PageClock` in perf, app, e2e) | hits only in `perf/studio-lab-resources.perf.spec.ts` |
| `grep -rn test.setTimeout perf` | 0 |
| Perf run 1: `CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources` (alone) | 1 passed (1.3m), real 1m20.0s, Chromium 143.0.7499.4 |
| Perf run 2 (same, alone) | 1 passed (1.3m), real 1m19.1s |

The orchestrator's idle dev server on :5173 kept running. Perf uses its own production build on :5188. No other job ran during the perf runs or the mutants. The code-reviewer was an LLM read and launched no processes.

### EQUIV-B2 (§2.5, oracle `b-round-279/head-results-1/`)
- Run 1: `PERF-1b-ii: rows 61, deterministic 37, problems 0, tolerated 0`, rc 0 (`a-round-280/run-1/equiv.txt`).
- Run 2: `PERF-1b-ii: rows 61, deterministic 37, problems 0, tolerated 1`, `tolerated res.export.1.peak-backing-delta-mib: 65 -> 65.1 (named tolerance 0.1)`, rc 0 (`run-2/equiv.txt`).

### mempolls-diff.py (`run-N/mempolls-diff.txt`)
Every export has `clockRttMs` 1–3 ms (≤ 20) and `clockOffsetMs` between −0.6 and −1.6 ms. Every export has `value ≥ endpointRule`. **Σ = 10 (run 1) and 12 (run 2)**, both ≥ 3.

| Row | Run 1 (value/endpointRule) | Run 2 | expectedPolls |
|---|---|---|---|
| mem-polls-1 | 10/10, 9/9, 10/10 | 10/10, 11/10, 9/8 | 9.6–10.5 |
| mem-polls-2 | 18/17, 18/17, 19/18 | 17/16, 19/18, 18/17 | 17.7–19.2 |
| mem-polls-1.6x | 14/13, 15/14, 16/15 | 15/14, 14/12, 14/12 | 21.5–23.2 |
| mem-polls-2.6x | 22/20, 24/23, 24/23 | 25/24, 24/23, 25/25 | 32.2–36.2 |

Ranges under the new rule across both runs: 1× export 1 is 9–11, 1× export 2 is 17–19, 6× export 1 is 14–16, 6× export 2 is 22–25. These match doc 209.

Peak medians (run 1 / run 2):
- `res.export.1.peak-backing-delta-mib`: 65 / 65.1;
- `res.export.2.peak-backing-delta-mib`: 129.9 / 129.9;
- the 6× rows: 65 / 65.1 and 129.9 / 129.9.

`endSampleLagMs` was 27–60 ms.

### Mutants (`a-round-280/run-mutant-a280.sh`)
The script is a copy of B's `run-mutant.sh`, writing to `a-round-280/mutants/<ID>` with `DIFF` set to A's diff. Each mutant ran on `git archive 1dbf3af` + A's diff + the mutant in `/tmp/a280-mut/<ID>`, one at a time, alone.

| Id | Result | Signal met |
|---|---|---|
| MU-SIGN | 1 failed; 32 failures; every mem-polls `[0,0,0]`; problems `export 1: only 0 valid backingStorageSize samples in the window (0 invalid)` and `export 1: no peak (0 window samples, end sample read)` (also for export 2) | yes |
| MU-RTT | 1 failed; 12 failures; every export has `the page clock probe's best round trip was N ms (limit -1 ms)` (N = 1–2) | yes |
| MU-ENDPOINT | 1 passed; Σ(value − endpointRule) = **0** | yes |
| MU-ORIGIN (control) | 1 passed; EQUIV-B2 rc 0, 0 problems, 1 tolerated (65 → 65.1); Σ = 10 | yes |
| MU-PROBE-THROW | 1 failed; every pass `abortedAt` = `export 1 clip`; the only problem is `aborted at export 1 clip: MU-PROBE-THROW`; no `was not released` | yes |

## Code review (actual `code-reviewer` subagent, 7 changed files)
Score 9/10. No Critical, High or Medium findings.
- **L3** (doc 209's Mermaid line looked like it subtracted the offset twice): fixed.
- **I3** (doc 209 stated the 6× "RTT > 50 ms" cause as fact, but no per-sample RTT is recorded): fixed. The doc now marks it as B's hypothesis.
- **L4** (doc 169's round-216 tables can be misread): a pointer was added in the granted TODO bullet. The tables themselves are outside the grant.
- **Not changed, for B:** **L1** `clockOffsetMs` has a name similar to `clock.offsetMs`, and **L2** `endpointRule` holds a count. Both detail-key names are fixed by §2.3 and read by B's scripts, so renaming them is a B decision.
- **Info, no action:**
  - I1: `Date.now()` ms flooring biases the offset by about −0.5 ms.
  - I2: the midpoint rule assumes symmetric RTT.
  - I4: the no-reading throw is a type guard that cannot fire.
- **Architecture note (proposal for B/root, not acted on):** `PageClock`, `probePageClock` and `heapSamplesInWindow` are generic Node↔page clock helpers that live in a spec, while `perf/lib/page.ts` owns `nowIn`. Keep them where they are for now: `perf/lib/**` is frozen and there is one user. If a second spec needs the page clock, write one bounded task that moves them to `perf/lib/page.ts` with a vitest unit test (this depends on ROOT-REQ-VITEST-PERF-INCLUDE).

## Acceptance (A's own checks; C verifies)
- §2.1–2.4 implemented exactly per the sketch. TYPECHECK passes. Two PERF-RUNs passed. EQUIV passed on both runs. CLOCK-DATA passed on both runs (RTT ≤ 20, |offset| ≤ 20, value ≥ endpointRule, Σ ≥ 3). All five mutant signals were met. SW-B passed, and setTimeout = 0. The frozen manifest is OK. The doc status lines are byte-exact.
- Not run by A: G280-AUTH (a C browser row), the full vitest, the build, `npm run verify` and `test:e2e:smoke` (gate rows under the speed rules).

## Known gaps
- R216 headroom is about +1 sample per export. It is not real headroom, so R216 stays a watch (as the task expects).
- The detail-key naming (L1, L2) is left to B.

## Next C checks
SOURCE-SCOPE, HUNK-SCOPE (compare against `sketch.diff`: same hunk bodies), CLAIMS, SWEEP, KEEP, TYPECHECK, PERF-RUN, EQUIV, CLOCK-DATA, BUDGET-NOTES, MUTANTS (MU-SIGN, MU-ENDPOINT Σ = 0, MU-ORIGIN, MU-PROBE-THROW), G280-AUTH at both viewports, and DOC-209. C should compare the doc 209 ranges against `a-round-280/run-{1,2}/mempolls-diff.txt`.

## Scope completed
Round 280 (b-ii-2) is implemented. Whether b-ii and b are "ready" depends on C PASS and the gate. I am not marking any backlog item done.
