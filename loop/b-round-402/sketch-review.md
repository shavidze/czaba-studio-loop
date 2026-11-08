# Sketch review — PERF-14c-i (B round 402 -> 403 planning)

**Dispatched sketch:** `b-round-402/sketch-403.patch.txt`, sha256 `5cc6d6341a34712bcb0974031a68d194339ccc5be9ec73aed239454b470c067a` (4 files).
**Reviewer:** `tech-lead` (read-only, on B's consult list), two real runs. Pass 1 reviewed v1 (`sketch-403-v1.patch.txt`, sha256 `ad417ff7ca3118c0b5e6ee7a0efab3e3896c6989ebf5424e83f8ba09d49a899e`); pass 2 is a delta review of the final sha above against v1.

## Pass 1 (v1 ad417ff7…) — findings and dispositions
| Id | Sev | Finding | Disposition in the final sketch |
|---|---|---|---|
| TL-R402-SK-M1 | Medium | MU-403-REPLIED-ON-GARBAGE is not equivalent: a pre-aborted request leaves an idle worker with no timer; junk then sets the flag under the mutant and the next job gets 3 s instead of 10 s | Fixed: new row PW24b; the mutant is now red on PW24b (`mutants/summary.txt`) |
| TL-R402-SK-M2 | Medium | When `failWorker` runs synchronously inside `request()` (post throws), the requesting job's own compute error no longer reached the caller; the source would stay `loading` | Fixed: `requesting` + `requestingFailure` + `takeRequestingFailure()`; the requesting job's error is thrown from `request()` after every other pending job is delivered; other jobs' errors use `rethrowLater`. Row PW29, mutant MU-403-REQUESTING-DEFERRED red |
| TL-R402-SK-M3 | Medium | Step i 1x and 6x started from different scroll states (121.1 vs 112.4) | Fixed: scrollLeft recorded at the start of i and restored before 6x (problem pushed otherwise); final run 121.1 / 121.1 (`perf-sketch-scale-v2.json`) |
| TL-R402-SK-L1 | Low | Junk ack readable as valid | Fixed (`channels: 'no channel list'`) |
| TL-R402-SK-L2 | Low | Second CDP session in step i | Fixed (reuses `cdp`) |
| TL-R402-SK-L3 | Low | On a 6x abort the inner `finally` resets `cpuRate` before `abortedAt` (same quirk as step e) | Kept (ruling D-29z1385): pre-existing pattern of step e; `deferred_low_polish` |
| TL-R402-SK-L4 | Low | Budget notes cite loop `b-round-*` paths | Kept: precedent (every PERF-14 note cites `b-round-*` evidence) |
| TL-R402-SK-L5 | Low | 4 new deterministic rows are a new failure mode | Accepted: 3/3 equal in two sketch runs; rows are `record` |

## Pass 2 (delta, final 5cc6d634… vs v1)
- M1, M2, M3 fixed; L1, L2 fixed; L3–L5 accepted as ruled.
- New Lows (not fixed, recorded in `deferred_low_polish`, fix home = next owner of `peaks.client.ts`):
  - TL-R402-SK2-L1: `requestingFailure` is not cleared in the `finally` (cannot leak today: every `failWorker` path inside `startNext` returns normally, so `takeRequestingFailure()` always runs).
  - TL-R402-SK2-L2: a nested `request()` on a synchronous-reply path (fake workers in auto mode only) sets `requesting = null` for the outer call; the outer error then falls back to `rethrowLater` (the v1 behaviour, nothing lost).
- The v2 perf run is accepted for the final sketch: the final differs from v2 only in the failing-worker error path and a test title, which the scale scenario never reaches.
- **Verdict: "no new Medium+".**

## Evidence on the final sketch
- Mutants: `mutants/summary.txt` (8/8 RED, pristine before/after rc 0; runner `mutants/run.py`; per-mutant logs `mutants/mutant-*.log`). In the `failing` column, `PW4` is the describe label `PW4-PW10 peaks client` that the summary regex also captures, not a failing PW4 test.
- Full vitest: `sketch-full-vitest.log` (261 files / 3870 tests, rc 0). `sketch-tsc.log` rc 0, `sketch-lint.log` rc 0, `sketch-biome.log` rc 0 (re-run after the last edit).
- Scale spec alone: `perf-sketch-scale-v2.json` / `.log` / `.rc` (rc 0, complete, failures []; 23 HEAD rows' deterministic samples equal `c-round-402/perf-scale.json`).
- Browser: `probe/sketch-fallback-{normal,none,failing}-{1440x900,1280x720}.json` (+ `.png`), all ready, waveform present, 0 page errors; HEAD controls `probe/head-fallback-*`.
