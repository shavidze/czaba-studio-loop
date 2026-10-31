# C round 280 — PERF-HARNESS-SHARED-LIB-b-ii-2 (test-only): **PASS**

C is the independent verifier. Source stayed read-only. Evidence is in `c-round-280/`; the machine-readable result is `c-round-280.json`.

- **Environment:** `env-status.json` reports store 200 (round 280, attempt 1). The baseline is HEAD `1dbf3af`.
- **Tools:** Chromium 143.0.7499.4 and Playwright 1.57.0.
- **L38:** each perf run and each mutant ran alone. The browser auth and smoke probes started only after the last mutant finished (`c-round-280/checkpoint.md`).
- **Flags:** `browserVerified` and `realVerified` are true. Every real-browser row of this round ran: PERF-RUN, CLOCK-DATA, MUTANTS and G280-AUTH at 1440×900 and 1280×720.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | Frozen manifest `sha256sum -c` rc 0, checked at the start and at the end. `git status`: 7 `M` + 1 `??` (doc 209), all §5 paths |
| HUNK-SCOPE | PASS | `git archive 1dbf3af` + `sketch.diff` gives both perf files `cmp`-identical to A's tree. The doc hunks stay inside the granted lines and sections |
| CLAIMS | PASS | `claims.sh` on a clean `1dbf3af` archive equals `claims-output-at-1dbf3af.txt` (empty diff). L29 sweep: no untagged code fact (`l29-untagged.txt`) |
| SWEEP | PASS | SW-B: 11 hits, all in `perf/studio-lab-resources.perf.spec.ts`. `test.setTimeout` in `perf` = 0 |
| KEEP | PASS | `heapPollMs` = 50, `observerSettleMs` = 200, and the `< 5` and no-peak texts are unchanged. `t0`/`windowEnd`/`wall-ms` are unchanged. The probe (spec l.340) runs before the poll loop (l.347) and the click (l.367), so none of it runs inside the window |
| TYPECHECK | PASS | `npm run typecheck` rc 0 |
| PERF-RUN | PASS | 1 passed (1.3 min, real 1m19.8s), run alone (`run-1/run.log`) |
| EQUIV | PASS | EQUIV-B2: rows 61, deterministic 37, **problems 0, tolerated 0**, rc 0. `res.export.1.peak-backing-delta-mib` samples 65.1/65/65 (median 65); export 2: 129.9 ×3 |
| CLOCK-DATA | PASS | `clockRttMs` 1–3, `clockOffsetMs` −0.7 … −1.9, `value ≥ endpointRule` in all 12 exports, **Σ = 11** (table below) |
| BUDGET-NOTES | PASS | 8 notes, each equal to the §2.4 substitution; 0 other field differences over 61 rows (`budget-notes.txt`). The first 4 MISMATCH lines in that file were my regex error, which missed the `Liveness.` prefix; the corrected check below them is EXACT ×4 |
| MUTANTS | PASS | See the table below. Mutants ran on `1dbf3af` plus A's two working-tree files, copied, not A's diff. Each sed was confirmed by a non-empty `mutant.diff` |
| G280-AUTH | PASS | Both viewports (details below) |
| DOC-209 | PASS | Docs 209, 208 and 176: l.4 byte-exact `**სტატუსი:** Completed (C round 280 PASS)`. `In Progress (stage` = 0 hits. Doc 209 has the 7 TEMPLATE headings in order, its ranges equal A's `run-{1,2}/mempolls-diff.txt`, and all 13 cited ids exist. Doc 169's `### Export-ის მეტრიკები` matches the live code. The 168/169/175/176 TODO bullets say what round 280 did. 208 l.88 names round 281 / B-R280-CLICK-LIVE-LANE-ID |
| gate | gate | Full vitest, build, Biome, `npm run verify` and `test:e2e:smoke` belong to the root gate and are not claimed |

### CLOCK-DATA (C run 1)
| Row | value / endpointRule | clockOffsetMs | RTT | expectedPolls |
|---|---|---|---|---|
| mem-polls-1 | 11/9, 9/9, 9/9 | −0.7, −1, −1.2 | 1,1,1 | 10.4, 9.7, 9.5 |
| mem-polls-2 | 19/18, 18/17, 18/17 | −0.7, −1.1, −1.1 | 1,1,1 | 19.4, 18.8, 18.9 |
| mem-polls-1.6x | 16/15, 14/13, 15/14 | −1.7, −1.9, −0.8 | 2,3,1 | 23.3, 23.2, 23.3 |
| mem-polls-2.6x | 25/24, 24/23, 23/22 | −1, −1.1, −1.7 | 1,2,3 | 36.4, 34.4, 35.3 |

C's counts (value and `endpointRule`) fall inside doc 209's ranges. One C `expectedPolls` (36.4, mem-polls-2.6x) is 0.2 above A's upper bound of 36.2. That is window-length noise, not a discrepancy: doc 209's ranges are defined as A's two runs, and DOC-209 checked them against those. `endSampleLagMs` was 34–62 ms, within the 30–60 ms that §2.3 expects plus its ≤ 3 ms allowance. No §10 STOP condition was hit.

### MUTANTS (C re-run, alone, one at a time)
| Id | Result | Signal |
|---|---|---|
| MU-SIGN | rc 1, 32 failures, every `mem-polls` `[0,0,0]`. Problems: `export 1: only 0 valid backingStorageSize samples in the window (0 invalid)`, `export 1: no peak (0 window samples, end sample read)`, and the same for export 2 | met |
| MU-ENDPOINT | rc 0 (1 passed); Σ(value − endpointRule) = **0** | met |
| MU-ORIGIN (control) | rc 0; EQUIV-B2 rc 0, 0 problems, 1 tolerated (`65 → 65.1`); Σ = 11 | met |
| MU-PROBE-THROW | rc 1; every pass `abortedAt` `export 1 clip`; the only problem is `aborted at export 1 clip: MU-PROBE-THROW`; `was not released` occurs 0 times | met |

MU-RTT is not a C row. Its result is A's only.

### G280-AUTH (fresh context, no credentials)
- **`/studio-lab`, anonymous:**
  - the workspace renders;
  - the badge reads exactly "Demo collection — no sign-in required";
  - `auth_user` is null.
- **`/studio/middle-east`, signed out:**
  - "Sign in required" shows;
  - `audio[src]` = 0;
  - no workspace renders.
- **`/api/studio-token`:**
  - with no header: 401 `{"error":"Please sign in to access Studio."}`;
  - with a fake bearer: 500 `{"error":"Unable to prepare Studio access"}`;
  - neither response contains a token, and the page made no token request.
- **Viewports:** 1280×720 passed on attempt 1. At 1440×900, attempt 1 timed out after 150 s waiting for "Demo collection ready" on the cold dev server (the INFO-C279-LANE-PROBE-TIMEOUT class). It is kept as `c280-auth-attempt1.json`, and its one replacement passed (`c280-auth-1440-attempt2.json`).
- **Screenshots:** `auth-lab-*`, `auth-guard-*`.

### Extra regression evidence (not a task row)
STUDIO-SMOKE at both viewports (`c280-smoke.json`):
- **Playback:** Play → playing → Stop; the playhead advances, then holds; the analyser RMS shows audible output.
- **Export:** a 48 kHz, 24-bit stereo WAV of exactly 16.000 s, peak 0.2967, −24.91 dB RMS, 0 NaN. Its SHA-256 equals the round-279 pin, so the export is bit-identical.
- **Console:** no errors.

## Bugs for B
None.

## Info for B
- **INFO-C280-AUTH-COLD-START:** the first `/studio-lab` load after the perf builds took more than 150 s to reach "Demo collection ready". This repeats INFO-C279-LANE-PROBE-TIMEOUT. A harness note: warm the page before the timed probe.
- **INFO-C280-MU-PROBE-THROW-TSC:** the MU-PROBE-THROW mutant copy fails `tsc` (TS18047/TS2322) because of the unreachable narrowing after the throw. Playwright does not typecheck, so the runtime signal is unaffected. Do not use `tsc` as a gate for that mutant.
- R216-MEM-POLLS-HEADROOM: C's run adds +0…+2 samples per export, Σ 11. The lowest 1× `mem-polls-1` count is 9 (≥ 7), so the D-29z649 watch stays as planned.
- **Ableton conformance:** not applicable (test-only harness round).
