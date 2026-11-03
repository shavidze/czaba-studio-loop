# C round 308 — PERF-COMMIT-RESCHEDULE-b-close

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs, 3 INFO. Tree: HEAD `d8e5ce5` + A's 3 modified paths.

## Browser rows (real Chromium, Playwright)
| Row | Result | Evidence |
|---|---|---|
| CONT-1 | PASS. Production build of A's tree in C scratch (`/tmp/c308/s`, :5190, warmed). 6/6 valid runs (3 per viewport), 0 invalid. clips 1, starts 1. spliceMaxDiff 0.0013–0.0015, below baseP999 0.003537 in every run; the largest step sits 45–408 samples from the splice; zero run 0; RMS ratio 0.78–1.07. No click | `c-round-308/cont-1.json` |
| CONT-30 | PASS. 6/6 valid runs, clips 30, starts 30. spliceMaxDiff 0.0014–0.0015 < 0.003537; zero run 0; RMS ratio 0.90–1.07. No click | `c-round-308/cont-30.json` |
| ENDED | PASS. stopBeforeStart 0.311, stopTwiceLaterWins 0.908, secondStopThrew false (HeadlessChrome 143) | `c-round-308/onended-probe.json` |
| NO-CHANGE | PASS at 1440×900 and 1280×720. clips 30, playingAtStart true, 12/12 releases with starts 30, playing true, loafMax 0, position advancing, Event Timing max 32 ms. Same class as round 307 | `c-round-308/nc-1440.json`, `nc-1280.json` |
| PLAY-SMOKE-308 | PASS at both viewports (dev :5173). Bass added with Enter and played; fade-in drag during playback committed (0→3 s); playback continued and position advanced; 1 live start 2–9 ms after pointerup; output RMS before and after the edit. Export WAV: RIFF/WAVE, 24-bit stereo, 48 kHz, 768000 frames = 16.000 s, peak 0.217, NaN 0, fade-in ramp visible in the RMS | `c-round-308/smoke308.json` |
| G308-AUTH | PASS at both viewports (attempt 2; attempt 1 was a cold-compile timeout, environment, kept). Fresh anonymous context: `/studio-lab` workspace + demo badge with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` returns 401 with no header (fake bearer 500, bare 400); no token in any body. Premium auth is not bypassed | `c-round-308/g308-auth.json` |

## Offline rows
- **SOURCE-SCOPE: PASS.**
  - `git status` shows exactly 3 `M` paths, and `sha256sum -c` fails on exactly those 3.
  - `ArrangementContext.tsx`, `reschedule.ts`, `metronome.test.ts` and the protected files have no diff.
  - `graph.test.ts`: every hunk is inside `describe('replaceClips')`, with 0 removed `expect(` lines and 0 removed `it(` rows.
- **CLAIMS: PASS.** C's output (`c-round-308/claims-output.txt`) is identical to `a-round-308/claims-after.txt`, and every delta from HEAD is one the task specified. `countMismatches` is empty.
- **TESTS-READ: PASS.**
  - RC12 and RC13 match §6. `startFixture` sets the clock to 2.9, and RC13 asserts at least one click source.
  - C re-ran the covering set: 12 files, 211 tests, all green (`c-round-308/covering.log`).
  - A's mutant logs show each mutant red on its listed rows (MU-STOP-ONCE also red on M10), and all green when restored.
- **DOC: PASS.**
  - l.4 is byte-exact, and the 7 TEMPLATE headings appear in order.
  - It contains the close decision and its condition, the not-measured inferences and the full TODO list.
  - Every cited loop path exists (C checked with `test -e`).
- **Gate rows (not claimed):** full vitest, build, Biome, `npm run verify`, e2e smoke.

## Harness fields (L57)
- assertsSpecified 2, mutantsRecorded 3.
- mutantRedOnSketch 0, because B ran no sketch.
- missingPaths [], countMismatches [], claimCheckMinutes 0.

## Findings (all info)
- **INFO-C308-SAME-WHEN** (origin: B spec). The release lands on quantized AudioContext times, so the runs repeat splice positions: CONT-1 has 4 distinct `when` values in 6 runs, CONT-30 has 2. In CONT-30, 5 of 6 runs are identical in every reported field. That fits a deterministic headless audio sink rendering the same splice position, but the probe saves no raw captures, so C cannot exclude a stale capture after the fact. The first run of each set differs. B's runs show the same pattern. For any future replace-splice probe: add a random pre-release delay and save the raw captures.
- **INFO-C308-POSCTL-INCONCLUSIVE** (origin: environment). C's own positive control (a hard Stop through the same tap, `c-round-308/posctl-probe.cjs`) could not prove the probe's sensitivity: Stop disconnects the tapped nodes, so nothing is captured after the cut. The CONT PASS rests on the click rule as B specified it. The doc 224 replace-splice probe should include a positive control (for example, a deliberately unfaded restart).
- **INFO-C308-COLD-DEV** (origin: environment). Two cold-compile timeouts, both before any measurement. In each case C warmed the route and the row then ran valid.

## For B
- The close condition of D-29z817 is met: C reproduced B's continuity numbers on a production build, with no click at 1 or 30 clips. PERF-COMMIT-RESCHEDULE can be set to `closed_on_evidence_c308`.
- A's reviewer Low (a past `when` re-stops a state) cannot happen with today's callers. The `Math.max(when ?? now, now)` bound is a candidate for the TODO before any `replaceClips` caller.
- `root-pre-push-review.md` and `publication-checkpoint.json` were read. Their remaining items are historical (rounds 37–65), and none concerns this round's paths.
- Scope note: this round's rows cover playback continuity, export and auth. Video transport was not in this round's scope, so C did not test it.
