# C round 306 — independent verification of PERF-3d (waveform rebuild only inside the timeline window)

**Verdict: PASS.** Every C row ran. All browser rows ran in real Chromium at 1440×900 and 1280×720 where the row asks for both. **EXIT is met** in my own perf run. I found no bugs.
- `browserVerified` = `realVerified` = true.
- Baseline is HEAD `adf959d`. A's tree has 7 modified files and 2 new ones. C edited no source; at the end `git status` still lists the same 9 paths and `sha256sum -c` still fails only on the 7 modified ones.
- Evidence is under `c-round-306/`. Build identity: `timelineWindow` is in A's `store/build` bundle and absent from the HEAD `adf959d` scratch build (`probe/head-build.log`, `probe/probe-summary.txt`). Harness fields: `manifestPaths` 40 (the task's K25 manifest, all present), `missingPaths` 0, `countMismatches` 0, `claimCheckMinutes` 1, `assertsSpecified` 5, `mutantsRecorded` 4, `mutantRedOnSketch` 4. Checkpoints are in `c-round-306/checkpoints.md`.
- Env: `env-status.json` round 306, store 200.

## Browser rows
| Row | Result | Evidence |
|---|---|---|
| PERF-RUN | **PASS.** `npm run test:perf` ran once, alone, 00:59→01:13:53 UTC: rc 0, 3 passed in 13.5 min. Nothing else ran during it (L38). All three reports: `complete` true, `failures` [], asserts 93/93 (1a), 23/23 (1b-i) and 15/15 (1b-ii). 0 pageErrors and 0 problems in every pass. `in.path-rewrites` [0,0,0]. `out.path-rewrites` [3,3,3], perKey `0,0,1,1,0,0,0,1,0,0` ×3. `wheel.path-rewrites` [2,2,2], perStep `0,0,0,1,0,0,1,0,0,0` ×3. `zoom.30.components-per-key` [247,247,247], which is 0 % from 247. The `interact.drag.fade.30.*` asserts pass. Interactions runtime is 362.8 s (40 % of 15 min) | `c-round-306/perf/perf-run.log`, `perf/perf-1b-i-2026-11-03T01-00-39-178Z.json`, `perf-1b-ii-…01-06-41-996Z.json`, `perf-1a-…01-07-44-066Z.json` |
| EXIT | **MET** — this is the PERF-3 exit decision. `in.keydown-max-ms` [24,24,24] has median **24** (< 50). `out.keydown-max-ms` [24,24,24] has median **24** (< 50). `wheel.loaf-max-ms` [0,0,0] has median **0** (< 50). Commits `detail.max` is 1 in all 3 samples for in, out and wheel (≤ 1). The in/out LoAF max is 0/0. (C round 304 at HEAD: out keydown max 80 ms) | same report |
| PROBE | **PASS.** `zoom-attr.cjs` ran on A's production build (`store/build`, built by PERF-RUN; it contains `timelineWindow`, which the HEAD build does not), served on :5190 after a warm-up. **1440 out:** keydown per key `16,24,24,24,16,16,24,16,16,16`, LoAF 0, rewrites `0,0,1,1,0,0,0,1,0,0` = harness perKey = sketch. **1440 wheel-out:** wheel→2 rAF max 30.0 ms, LoAF 0, rewrites `0,0,0,1,0,0,1,0,0,0` = harness perStep = sketch. **1280 out:** keydown max 24, LoAF 0, rewrites `0,0,1,0,1,0,0,1,0,0` (total 3, ≤ 1 per step, every crossing key ≥ 1; equal to the sketch's 1280 run). **1280 wheel-out:** max 29.7 ms, LoAF 0, rewrites `0,0,0,1,0,0,1,0,0,0` (total 2). All 4 runs had 30 clips | `c-round-306/probe/a-{out,wheel-out}-{1440,1280}.json`, `probe-summary.txt` |
| SCROLL-UPGRADE | **PASS.** **A at 1440:** viewBox widths before scrolling `[2534, 4096]`, after 200 steps `[2534]`; 29 rewrites, max 1 per step, LoAF 0, scroll→2 rAF max 35.1 ms. **A at 1280:** before `[2534, 4096]`, after `[2534]`; 29 rewrites, max 1 per step, LoAF 0, 34.1 ms. **HEAD at 1440** (scratch build of `adf959d`, own `cacheDir`, :5191): before and after `[2534]`, 0 rewrites, 33.6 ms. A is +1.5 ms against HEAD (limit +10) | `probe/scroll-{a-1440,a-1280,head-1440}.json`, `scroll-vis-summary.txt` |
| VIS-EQUIV | **PASS.** `visible-d.cjs` ran with 3 keys on HEAD and on A at both viewports. `compare-visible-d.py` prints `True` at 1440 and at 1280. The comparison is not vacuous: each step and the return has 1 visible waveform in both runs (count lists `[1,1,1,1,1]`), with 317,236 bytes of `d` | `probe/vis-{head,a}-{1440,1280}.json`, `scroll-vis-summary.txt` |
| PLAY-SMOKE-306 | **PASS at both viewports.** Dev server :5173, after `Demo collection ready`. I added Bass with Enter. Position after 1.5 s: `00:01.471` (1440) and `00:01.491` (1280), both ≥ 00:01.000. `data-playing` went false→true→false. Exported WAV: RIFF/WAVE, PCM 24-bit stereo, 48 kHz, 768,000 frames = **16.000 s**, peak 0.217, non-zero fraction 0.9999, NaN 0. No page errors | `c-round-306/smoke/smoke306.json`, `smoke/shots/*.png` |
| G306-AUTH | **PASS at both viewports** (attempt 2). Fresh anonymous contexts. `/studio-lab`: `auth_user` null, workspace shown, demo badge shown. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token`: 401 with no header, 500 with a fake bearer, 400 bare; no token in any body. Attempt 1 timed out after 60 s waiting for the legacy page body on a cold dev route (environment; L38 cold start). It is kept and replaced once | `c-round-306/auth/g306-auth.json`, `auth/attempt1-cold.log`, `auth/shots/*.png` |

## Offline rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS.** `claims-306.sh` output equals `b-round-305/claims-306-sketch-output.txt` except K2 = `9 adf959d`, the expected environment value. K15 = 27 | `c-round-306/claims-output.txt` |
| SOURCE-SCOPE | **PASS.** Details below the table | `c-round-306/sha256-check.txt` |
| TESTS-READ | **PASS.** WG0–WG4 match §6, with `toBe` asserts on the viewBox columns. A's mutant logs: MU-GATE-OFF is red on WG2, WG3 and WG4. MU-NO-SCROLL is red on WG3. MU-FALLBACK is red on WG0 and WG1. MU-EDGE is red on WG0. With the code restored, 5/5 and 6/6 pass. Each `a-round-306/mut-*.diff` is the specified mutation: gate-off `peakColumns = targetPeakColumns`; no-scroll subscribes `noWindowSubscription`; fallback `undefined` → `false`; edge `>=`/`<=` → `>`/`<` | `a-round-306/mut-*.log`, `mut-*.diff` |
| DOC | **PASS.** Doc 223 has TEMPLATE's 7 headings in order and l.4 `**სტატუსი:** Completed (C round 306 PASS)`. It cites WG0–WG5 and 5 mutants, and each one exists. Doc 222: l.4 is unchanged and one exact line is added in `## მიდგომა` | — |
| RT-FIX | **PASS.** `diff b-round-305/screen-review-305-before.md user-review/screen-review-305.md` touches only l.17 and l.26. l.17: SR-305-3 now names the status "Nothing to play — add a clip from the library first.". l.26: SR-305-4 now says density, not truncation, cites C's measurement and `c-round-305/screens/sr-probe-status-1440x900.png` (the file exists). K22 = `0 1 1`. **Limit:** `retro-305.md` has no before-copy. All I can show is that it has no uncommitted diff in the loop repo, and that commit `054104ab` added it whole. I cannot prove byte-equality with the C-305 state | — |
| Gate rows | Not claimed by C: full vitest, build, Biome, `npm run verify`, e2e smoke | `gates/` |

SOURCE-SCOPE details:
- `git status` shows exactly the 9 paths of §5 (7 M, 2 ??). `sha256sum -c` fails on exactly the 7 modified paths. The 7 protected files have no diff.
- `buildPeakShape` and `ArrangementPeakPath` (73-line extract) are byte-identical to HEAD.
- **Budgets:** the 162 ids are unchanged and exactly 9 rows changed:
  - The 7 GATE304-L3 notes equal the old note plus the exact sentence.
  - out is `== 3` and wheel is `== 2`; both notes are byte-exact.
  - in stays `== 0`.
- **Spec:** only the K12 entry changed, with the exact text.
- **Doc 222:** one exact line added.
- Read through the gate in the diff: the in-window state comes from `useSyncExternalStore` (per-clip boolean). The last shown column count is kept with a guarded `setState` during render. No ref is written during render, and there is no IntersectionObserver.

## Ableton conformance
Not applicable (performance round, task §0). The visible waveform is unchanged (VIS-EQUIV).

## Notes for B (not bugs)
- **WG5 + MU-NO-PENDING** are A additions beyond §6. WG5 sends a real anchored zoom through the slider and checks that the gate reads the pending view; MU-NO-PENDING turns only WG5 red. They are not counted in `assertsSpecified`. B should accept them or rule on them. WG3's title text changed; its id and asserts did not.
- **Seen during PROBE (by design, §8):** after the out path returns, the window holds both widths (`4096,2534`). The off-window clips stay at 2534 until a scroll brings them in. SCROLL-UPGRADE shows that the scroll rebuilds them (≤ 1 per step).
- **Outside this round (seen in the smoke screenshot):** the Bass stem lands on the Music track. That is the known STEM-LANES item, not a finding of this round.
- **Signals carried:** `PERF-3D-VERTICAL-GATE`, `PERF-3D-SCROLL-HARNESS-ROW`, A's Architecture note (two shapes of the timeline-window contract).
