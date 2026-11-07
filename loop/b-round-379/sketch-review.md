# Round 380 sketch review (PERF-12a): consults and rulings

B, 2026-11-07, at the round 379 → 380 planning. The two project agents were read-only and ran nothing. B ran every measurement below.

## 1. Premise (B's measurements)
- **Cost model, Chromium** (`probe/backing-model-1440.json`, script `probe/backing-model.mjs`). The numbers are page `backingStorageSize` after GC, for 4,864,896 stereo frames:

  | Step | Page backing |
  |---|---|
  | rendered AudioBuffer, before `getChannelData` | 0 MiB |
  | `getChannelData` ×2 | +37.1 MiB |
  | `slice` ×2 | +37.1 MiB |
  | WAV ArrayBuffer | +27.8 MiB |
  | `copyFromChannel`, 1 s chunk ×2 | +0.3 MiB |
  | Blob built in a worker | 0 MiB |

- **The doc text is wrong.** The `budgets.resources.json` notes say "the rendered AudioBuffer [is] outside" the page metric. That is false once `getChannelData` is called.
- **HEAD** (`c-round-377/perf-resources.log`; no export or perf file has changed since 79ed8a9, `git diff --stat 79ed8a9..HEAD` is empty):

  | Row | 1× | 6× |
  |---|---|---|
  | export.1 peak-backing | 65 | 65 |
  | export.2 peak-backing | 129.9 | 129.9 |
  | export.{1,2} longtask-max | 0 / 51 | 171 / 304 |
  | export.{1,2} wall-ms | 524 / 947 | 1081 / 1819 |

## 2. Sketch runs
- **v1 perf** (`perf-res-sketch.log`, 3 runs):

  | Row | 1× | 6× |
  |---|---|---|
  | peak-backing (export.1 / export.2) | 0.1 / 0.2 | 0.1 / 0.2 |
  | longtask-max | 0 / 0 | 0 / 0 |
  | longtasks-over-50 | 0 / 0 | 0 / 0 |
  | wall-ms | 469 / 886 | 1062 / 1806 |
  | bytes | equal to HEAD | equal to HEAD |

- **Perf mutants on v1** (`mutants/sketch-perf/perf-summary.txt`):
  - **MU-12A-PERF-GCD** (`getChannelData` ×2 kept): peak-backing 37.2 / 74.4 MiB, so the ≤ 5 rows go red.
  - **MU-12A-PERF-FALLBACK** (main-thread encode): longtask-max.6x 1454 / 2668 ms, so the ≤ 100 rows go red. Peak-backing 64.5 / 114.9 MiB.
- **v2 perf:** `perf-res-sketch-v2.log`.
- **Unit tests on v2** (`sketch-vitest-render-v2.log`, the 31 files that name `renderArrangementWav`, `export-wav` or `startRendering`): 475 / 495 pass.
  - The 20 failures are exactly the rows that call the removed `encodeArrangementWavOffMainThread` / `encodeArrangementWavInPlace` or the old worker protocol: EW4, EW5 ×3, EW7, EW8a–e, EC4 ×5 and IP1–IP5.
  - Every fake-shape failure of v1 is fixed by `sketch-fakes.patch.txt`: XR1–XR4, EW6, master, meter, track-meter, track-group-mix, FD8b, EV6b and EC3.
  - The track-pan source pin was also fixed there.

## 3. tech-lead (sketch v1 review)
- **Bit-exactness:** confirmed by construction.
  - Same clamp (MAX = 1−2⁻²³ is exact in float32), rounding, byte split, NaN → 0, −0 and pad byte.
  - Same header as `sfx-edit.ts` `encodeSfxWav`.
  - The global frame index (`written + i`) makes chunk edges safe.
  - Peak is a max and clipped is a sum, both measured before the clamp.
- **TL-R380-B1 (bug): a throwing `onProgress` stalled the stream.** v2 posts the next chunk or `finish` first, then reports progress, and the reporter swallows a callback throw. Rows SW2e and SW4.
- **TL-R380-L1:** a zero-frame chunk could loop. v2 throws `WAV stream: empty chunk`. Row SW3.
- **TL-R380-L2:** at HEAD the first 'wav' fraction was 0. v2 calls `reportProgress(0)` after `begin`, and in the fallback. Row SW4.
- **TL-R380-L3:** length 0 rejects at once, not through the stall timer. Row SW1, edge case.
- **Removal:** both old functions are removed. `encodeArrangementWav` stays as the independent oracle (it goes through `encodeSfxWav`). Do not share the header code in this stage.
- **Row map:** adopted in `current-task.md` §2.3.
- **12b ruling (TL-R380-12B):** acceptance is a tolerance, not bit-exact.
  - Ramps restarted at window edges, fractional source starts and `StereoPannerNode` change the last bits.
  - Proposed gate: ≤ 1 LSB after 24-bit conversion, a bounded count of differing samples near edges, and equal peak and clipped, run as a headless Chromium probe on a real schedule.
  - This changes the plan text "bit-exact vs full render". B records it as a question for Saba, `SABA-Q-PERF12B-TOLERANCE` (L44).
- **Architecture (SIG-R380-WORKER-DOUBLE-BUFFER):** the worker briefly holds the WAV ArrayBuffer and the Blob, about 2 × 27.8 MiB in the worker only. Building the Blob from per-chunk parts would halve that. Out of 12a.

## 4. performance-optimizer
- **Chunk size and window:** 65,536 frames is fine. It recommends an ack window of 2.
  - **B ruling (PO-R380-W1): keep a window of 1.** Measured wall-ms is not worse than HEAD at either rate (1×: 469 vs 524 and 886 vs 947; 6×: 1062 vs 1081 and 1806 vs 1819). One chunk in flight keeps the protocol and the stall/abort rows simplest. A wall-time regression in a later run reopens this.
- **Asserts, adopted:**
  - `res.export.{1,2}.peak-backing-delta-mib` (1×): ≤ 5 MiB.
  - `res.export.{1,2}.longtask-max.6x`: ≤ 100 ms (sketch 0; HEAD 156–309; the fallback mutant 1454 / 2668).
  - Rows that stay `record`: longtasks-over-50 (HEAD sits at the threshold), 1× longtask-max, wall-ms and the 6× peak-backing.
- **Process memory:** `measureUserAgentSpecificMemory` needs `crossOriginIsolated`, so it is unreachable. A Tracing memory-infra dump is experimental (unverified), so it can be a record row in 12b at most.
- **12b traps:** per-window graph rebuild (clips × windows), edge pre-roll, adding up the stats, and releasing each window buffer.
