# C round 312 — PERF-5a peaks worker: verification

**Verdict: FAIL**, caused by one Medium (C-R312-01) in the perf harness only. **All app-code rows pass.** The waveforms are byte-identical to HEAD, the main thread no longer computes peaks, "ready" still comes after the peaks, and the auth guard holds. The fail comes from `perf/lib/report.ts`'s `harness.loaf-scripts` self-check. A's improvement removed the last long animation frame from the 1x load, so the self-check now fires. `perf/**` was not in A's grants, so B must rule on it. **Do not re-dispatch the app work.**

`browserVerified` = `realVerified` = **true**: all 8 required browser rows ran. Env: `env-status.json` store 200 (round 312, attempt 1).

## Method
- **A's tree:** `:5173`.
- **HEAD comparison:** a copy at `/tmp/c312head` built with B's recipe: tar without node_modules/build/.git, the 2 §5 paths from `git show HEAD:`, the 5 new files removed, node_modules symlinked, and `cacheDir: '/tmp/c312head-vite-cache'` in the copy's `vite.config.ts`. It ran as a dev server on `:5174`. I stopped that server before the perf runs.
- **Run conditions:** I warmed both servers in a browser first (L38), and only one probe ran at a time.
- **Media:** owned and local only, `public/videos/hero/1.mp4`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. Exactly 2 M + 5 ?? paths. `sha256sum -c` fails only on `ArrangementContext.tsx` and `peaks.ts`. The protected files, `perf/**`, `package.json` and `biome.json` show no diff. No existing test file changed. Re-checked at the end of C's phase: unchanged. My perf runs created only git-ignored `test-results/` and `build/` | `c-round-312/git-status.txt`, `git-status-end.txt`, `sha-check.txt` |
| CLAIMS | PASS. `claims-312.sh` output is byte-equal to A's `claims-after-raw.txt`. Compared with the sketch output, it differs only on the expected K2 `7 dfa4502`, K10 `234 3478`, K16 `1 228-perf-peaks-worker.md` and K17 `1`. K5–K9 equal the sketch | `c-round-312/claims-c.txt` |
| PK-UNIT | PASS. 9 files, 119 tests, 16.7 s. peaks-worker has 17 rows. Slowest test: CP12a 4.5 s of its 30 s timeout | `c-round-312/pk-unit.log` |
| TESTS-READ | PASS. A's `mutants-a.py`, re-run on C's scratch `/tmp/c312s` (a byte-equal copy of A's `app/`), reproduces all 17 mutants red, each on exactly A's rows, and every one of B's 12 is red on at least its `sketch-mutants.txt` rows. Restored code: 17/17. **C's own mutants:** C-MU-STALE-CHUNK-FOLDED is red (PW3) and C-MU-KERNEL-TO-OFF-BY-ONE is red (PW1, PW1b, PW4). Four survivors are listed below | `c-round-312/mutants/` |
| DOC | PASS (A-DOC as specified). Line 4 is exact. The 7 TEMPLATE headings are in order. The §0.1 numbers are verbatim. Cited PW ids = the test's ids (PW1–PW13). **Note for B:** line 4 says "C round 312 PASS", which is false while this round is FAIL. Fix it in the fix-up | doc 228 |
| PK-MAIN-THREAD | PASS. 3 fresh loads at 1440×900 on A: `mainPeaksMs` is `[]` and `peaks.worker.ts` is created exactly once per load, with 0 page errors. HEAD control (2 loads): `computePeaks` 39.3 ms and 55.5 ms, no peaks worker | `c-round-312/id-a-1..3.json`, `id-head-1..2.json` |
| PK-IDENTITY | PASS. On A, 9/9 preview-wave shas equal `b-round-311/probe/identity-head.json` on each of the 3 loads, and every option has 96 rects. C's own HEAD runs give the same shas | same files |
| PK-CLIP-PATHS | PASS. 1440×900 and 1280×720, fresh load; all 9 sources added with Enter. The clip waveform `d` and clip width of all 9 clips, and the detail-waveform `d` with each clip selected, are byte-equal to HEAD (9/9 + 9/9 per viewport), and so are the 9 add statuses. After `+` twice the widths change (zoom verified) and are still 9/9 + 9/9 equal to HEAD. At this zoom step the quantized path `d` did not change on either tree (PERF-3 band) | `c-round-312/rows-a.json`, `rows-head.json`, `shots/{a,head}-clips{,-zoom}-{1440,1280}.png` |
| PK-READY-ORDER | PASS. In a rAF poll on A, the first "Demo collection ready" frame already has 96 preview rects, with 9 options draggable and 9 worker `done` replies. In all 11 recorded frames, draggable (ready) options ≤ worker `done` count (0 violating frames). HEAD's first ready frame also has 96 rects. The per-source ready order differs from HEAD (the worker is serial), and that is allowed | `rows-a.json` `readyCopy.framesLog` |
| PK-VIDEO | PASS. Imported `1.mp4` at 1440×900. The video clip has an audio waveform on both trees (audio ready), with path sha `1fa847b742a0ba60` equal to HEAD. The status sequence is equal ("Opening…" → "added to the video track: 00:00.000 — 00:12.969"). 0 page errors. On A, 10 worker `done` replies (9 + video) | `rows-*.json` `video`, `shots/*-video-1440.png` |
| PK-COPY-BOUND | PASS. 342 `copyFromChannel` calls per load. Every `destination.length` is 96000 = 2 × 48000 (0 over the bound). Total 12.4 ms, max single call 0.5 ms. HEAD: 0 calls | `rows-a.json` `readyCopy` |
| PK-ABORT | PASS. Navigated away by client-side Remix navigation (the `a[href="/"]` click) right at the first `copyFromChannel` call (0 ms delay), then back with `goBack()`. 0 page errors. The first `peaks.worker.ts` was closed within 1.5 s of leaving (provider unmount → `dispose`). The second load reached ready with 9/9 waves equal to HEAD | `rows-a.json` `abort` |
| G312-AUTH | PASS at both viewports. `/studio-lab`: workspace and demo badge shown, `auth_user` null, 0 errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token`: 401 with no header, 500 with a fake bearer, 400 bare; no token in any body. Attempt 1 timed out cold on the legacy route; that attempt is environment-invalid (L38) and kept as `g312-auth-attempt1-cold.log`. Re-run after a browser warm-up | `c-round-312/g312-auth.json`, `shots/lab-*.png`, `legacy-*.png` |
| **PK-PERF-HARNESS** | **FAIL → C-R312-01.** Ran alone, 2 runs on A + 1 HEAD control | `perf-run.log`, `perf-run-2.log`, `perf-run-head.log`, `perf-a-run1/2.json`, `perf-head.json` |

### PK-PERF-HARNESS trend (dev machine, compared with round 306, which was a different job)
| Row | r306 | A run 1 | A run 2 | HEAD copy (today) |
|---|---|---|---|---|
| load.ready-ms | 981 | 660 | 698 | 651 |
| load.settled-ms | 1557 | 1139 | 1132 | 1097 |
| load.script-max | 47 | **0** | **0** | 32 |
| load.longtask-max | 107 | 0 | 0 | 0 |
| spec | pass | **fail** (1x passes 1, 3) | **fail** (1x passes 1, 2, 3) | **pass** |

## Findings
### C-R312-01 (Medium, origin: B spec / B pre-check): PERF-1a harness self-check fails on A's tree
- **Steps:**
  1. Stop every other job.
  2. In `store/`, run `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`.
  3. Repeat on the HEAD copy.
- **Expected:** the spec passes (task §3.2 PK-PERF-HARNESS).
- **Actual:** A fails 2/2 with `harness.loaf-scripts: no long-animation-frame entry carried script timings` (run 1 on 1x passes 1 and 3; run 2 on all three). HEAD passes 1/1, with `load.script-max` median 32.
- **Cause:** with peaks off the main thread, the settled 1x load has no LoAF entry at all, so `loafScriptsProblem` (`perf/lib/report.ts`) fires. `load.script-max` now reads 0, and that value no longer shows the instrument is alive.
- **Responsibility:**
  - A could not fix this: `perf/**` was not granted (§5).
  - B's §2 pre-check ran the identity probe but not the perf spec on the sketch, yet §3.2 wrote "spec passes" (L23/L37 class).
- **For B:** a harness-contract ruling and a grant on `perf/lib/report.ts`, the self-check, plus a liveness cross-check so `load.script-max` cannot be silently vacuous. The app code needs no change for this finding.
- `npm run test:perf` is not a gate row, so the gate will not catch this. It blocks the STUDIO-PERFORMANCE instrument on every later PERF round.

### Surviving C mutants (no new ids)
- **C-MU-POOL-NOT-CLEARED** (Info): behaviourally equivalent. `takeChannels` shape-checks reused arrays, and the kernel never reads past `chunkLength`. It breaks only the §4.3 wording "pool cleared between jobs".
- **C-MU-LAST-CHUNK-DROPPED** (Info): equivalent. The `next < length && inFlight === 0` state cannot occur after `pump`'s while loop.
- **C-MU-VIDEO-GUARD-REMOVED** and **C-MU-STALL-ONLY-AT-BEGIN** survive the covering files. This is C evidence for the existing **A-R312-REVIEW-L4** (no PW row for the video call site's `videoSourcesRef` guard, and a stall armed only at `begin` passes PW9). No new id; B handles it with L4.

## Harness fields (L57)
- `assertsSpecified` 14, `mutantsRecorded` 13, `mutantRedOnSketch` 12 (the task's values).
- **Count mismatch, explained:** A's file has 17 rows (+PW12 and PW13 ×2 from review fixes) and 17 mutants (+4 of A's own). No row was weakened. C reproduced all 17 red and 17/17 restored.
- **Gate rows (not claimed):** full vitest, build, Biome, `npm run verify` and e2e smoke.
- `manifestPaths` were all present (`missingPaths` empty). `claimCheckMinutes` ≈ 3.
