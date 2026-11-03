# C round 315 — PERF-5b robustness batch (A-R312-REVIEW-L1…L5) — PASS

All of C's rows ran. Every browser row ran in real Chromium through Playwright, against production builds:
- HEAD `abfcf78`, a git-archive copy in `/tmp/c315h`, on port 5301;
- A's tree, a tar copy in `/tmp/c315a`, on port 5302.

Each copy has its own `cacheDir`, and `node_modules` is symlinked. G315-AUTH ran on the dev server, 127.0.0.1:5173.

C did not change any source: `c-round-315/git-status-{start,end}.txt` are equal, and the app files are still `cmp`-equal to the sketch at the end. **0 app defects.** Two Low test-coverage findings come from C's own mutants: C-R315-T1 and C-R315-T2, listed under `bugs` in the JSON (below).

L57 fields: `assertsSpecified` = 9, `mutantsRecorded` = 12, `mutantRedOnSketch` = 10. C's own mutants come on top: 4 recorded, 2 red.

## SOURCE-SCOPE — PASS (`git-status-start.txt`, `protected.txt`)
The 6 expected entries, exactly:
- M `ArrangementContext.tsx`
- M `peaks.client.ts`
- M `peaks-worker.test.ts`
- M doc 163
- M doc 228
- ?? `peaks-worker-video.test.tsx`

HEAD is abfcf78. Protected files: 11/11 OK, both at the start and at the end.

## SKETCH-EQUAL — PASS
- Both app files are `cmp`-equal to the `sketch-*.txt` copies.
- The test-file diff has 0 lines: A appended nothing, and no lines were removed or changed.

## CLAIMS — PASS, with one info note (`claims-c.txt`)
Compared with `claims-315-sketch-output.txt`, the by-design rows differ as expected: K2 `6 abfcf78`, K9 `**სტატუსი:** Completed (C round 315 PASS)`, K10 `0 0`, K18 `11`.

All other rows are equal: K3–K7, K11–K17 and K19–K24.

One row differs that is not on the task's by-design list:
- K8 (test files that stub `Worker`) also lists `peaks-worker-video.test.tsx`.
- PW19's recipe requires a fake peaks Worker, so this follows from the task.
- It is info, not a defect (origin: B's claim list).

## UNIT — PASS (C's scratch copy `/tmp/c315u`, own `cacheDir` in both vite and vitest configs)
- **A-UNIT file list** (`unit.log`): 9 files, 98/98.
- **`unit-mutants.py`** (`unit-mutants.txt`): output is **byte-equal** to `precheck-unit-mutants.txt`.
  - 10 mutants are red, each on its listed rows.
  - MU-REPLIED-AFTER-FILTER stays green, which is equivalent by design.
  - Restored code: 25 passed.
- **A's MU-VIDEO-BUFFER-BEFORE-PEAKS** (`video-mutant.txt`): red at step 3, l.244 (`not.toContain(buffer)`). Restored code: 1 passed.
- **C's own mutants** (`c-own-mutants.py`, `c-own-mutants.txt`). Restored code: 25 passed.

| Mutant | Change | Result |
|---|---|---|
| C-MU-DELIVER-MICROTASK | rethrow through `queueMicrotask` instead of a timer | **red** PW16, PW17 |
| C-MU-FALLBACK-NO-DELIVER | main-thread fallback calls `job.onPeaks` directly | **red** PW17 |
| C-MU-COLD-START-VALUE | `PEAKS_WORKER_COLD_START_TIMEOUT_MS = 5_000` | **survives** (PW14 is written relative to the constant). The browser pins the value instead: PK-COLD-START measured 10,000 ms |
| C-MU-REPLIED-ON-GARBAGE | an unparsable message also sets `workerReplied` | **survives**. No row covers "only a parsed reply ends the cold start" |

These two survivors are Low test-gap findings for B (origin C; `bugs` C-R315-T1 and C-R315-T2). Neither is an app defect.

## PK-COLD-START — PASS (`cold-*.json`; B's probe `b-round-314/probe/cold-start.cjs`; first peaks reply held 4,000 ms; one warm-up load per build first)
| build / viewport | peaks worker created (ms) | native first reply | terminated | replies | status | wave rects | page errors |
|---|---|---|---|---|---|---|---|
| HEAD 1440×900 | 298 | 355 | **3299** (old stall, 3,001 ms after creation) | 1 | Demo collection ready | 96 | 0 |
| A 1440×900 | 290 | 348 | **not terminated** | 180 | ready | 96 | 0 |
| A 1280×720 | 291 | 356 | **not terminated** | 180 | ready | 96 | 0 |
| A 1440×900, hold **12,000 ms** (C's extra boundary check) | 304 | 359 | **10304** (10,000 ms after creation) | 1 | ready (main-thread fallback) | 96 | 0 |

- The probe's `firstReply` is the native arrival time. The app sees the reply only after the hold.
- The demo-synth worker terminates itself after its one reply in every run, as at HEAD.

## PK-LOAD — PASS (`pkload-a-1440.json`, `pkload-a-1280.json`, `shots/pkload-*`; script `pk-load.cjs`)
3 fresh contexts per viewport on A's build, with `window.Worker` wrapped and no delay.

**Load, every run:**
- 9/9 sources are ready (`draggable=true`).
- The ready count never dropped while sampling every 100 ms, so there is no collection reload loop. 0 rows show "Loading".
- Status reads "Demo collection ready…". The library preview wave has 96 rects.
- Exactly **one** peaks worker per load, and it is **not terminated**. 0 page errors.

**Audio graph (§8 neighbour):**
- During the load, `AudioBufferSourceNode.start` was called 0 times, so no graph started or restarted.
- After Add (1 clip) and Play: exactly 1 start (buffer 101.352 s, 2 ch).
- An analyser tapped at the destination reads peak 0.34, so real audio is output.

## PK-VIDEO-SOUND — PASS (`video-*.json`, `shots/video-*`; script `pk-video-sound.cjs`)
**Test media:** a 4 s webm (vp8 + opus, 440 Hz at gain 0.5), generated in the browser with MediaRecorder: `c-round-315/media/c315-tone-440.webm`, 73,849 B. It was never uploaded anywhere.

**Steps:**
1. Hold the peaks worker's replies.
2. Import the video through `arrangement-video-input`.
3. Click Play as soon as the video clip appears.
4. Sample 12 × 100 ms.
5. Release the replies and sample 20 × 100 ms.

| build / viewport | while held: clip note / level / starts | after release: note / level / starts |
|---|---|---|
| **HEAD** 1440 | "Sound is decoding…" / **0.505** / **1** (the sound plays before ready: L3 bug reproduced) | ready / 0.50 / 2 (the re-sync restarts the buffer that was already playing before ready) |
| **A** 1440 | "Sound is decoding…" / **0** / **0** | ready / **0.50** / **1** |
| **A** 1280 | "Sound is decoding…" / 0 / 0 | ready / 0.50 / 1 |

**Sync of the joining sound** (`video-a-1440-offset.json`):
- The re-sync start has `when` 1.423 s, `offset` 1.373 s, and `ctxTime` 1.373.
- So the clip's timeline zero maps to context time 0.05, the moment playback started.
- The sound joins at the playhead position, in sync with the picture, not from the buffer start.

## Video export (§8 neighbour) — PASS (`export-a-1440.json`, `export-*-wavcheck`, `export-vs-source.txt`, `shots/export-*`)
**While decoding:**
- The dialog shows "Original video sound (…): Decoding — please wait".
- "Export WAV" is **disabled**.

**After release:**
- The status reads "Included", and the button is enabled.
- The download `czaba-studio-lab.wav` is 1,133,474 B.

**`wavcheck.py`:**
- PCM 24-bit, 48 kHz, 2 ch, 188,905 frames = 3.9355 s. This equals the project span 00:00.000–00:03.936.
- Peak 0.507, RMS 0.353, 440 Hz by zero crossings, both channels equal.

**Sample integrity against the source decoded in the browser:**
- The maximum difference is 0.5 LSB at 24 bit; 0 samples differ by more than 2 LSB.
- The only jumps above 0.05 (samples 345–351) are in the source media itself (`source-media-check.txt`, same indices), so they are not an app click.
- A's WAV is **byte-equal** to HEAD's (`cmp`), so export output did not change.

**Observation, pre-existing and not caused by this round:**
- The video's sound is cut at the video's duration (3.936 s; the audio is 3.96 s) at full amplitude (last 20 samples ≈ 0.50).
- There is no fade, so an end-click is possible.
- Byte-identical at HEAD. This belongs to the planned T12.13 micro fades (T12-ADVANCED). It is not filed as a round-315 bug.

## PK-PERF-LOAD — PASS (`perf-harness.json`, `perf-harness.log`, `perf-driver.sh`, `perf-driver.status`, `rowcmp.txt`)
**Run:** A's tree (`/tmp/c315a`), alone (no overlap flag), 1 run, 12:38–12:44 UTC, rc 0.

**Results:**
- `failures` is empty.
- `harness.loaf-scripts-live` is 79, 80, 80 (all ≥ 50).
- `harness.restart-live` is 1, 1, 1.
- `rowcmp.py c-round-314/perf-harness-1.json`: **164/164 equal, 0 differ, 0 extra**.

**Warm-up caveat (environment, L38):**
- The warm-up script (`c-round-314/warm.cjs`, which loads the dev server) hit the dev server's first cold compile and timed out after 302 s (`warm-perf.log`).
- The browser itself did launch.
- A dev-server probe right after reached ready in 2.6 s (`devprobe.cjs`).
- The perf run itself uses its own production build. Its rows equal the reference exactly, so the run is valid.

## G315-AUTH — PASS (`g315-auth.json`, `g315-auth.log`, `shots/lab-*`, `shots/legacy-*`)
**Attempt 1:**
- Cold-compile timeout on `/studio/middle-east` (`g315-auth-attempt1-cold.log`), the same as C314.
- Environment-invalid; replaced after a warm-up of that route (`warm-legacy.log`).

**Both viewports, fresh anonymous contexts:**
- `/studio-lab`: the workspace and the demo badge show, `auth_user` is null, 0 page errors.
- `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`.

**`/api/studio-token`:**
- No header → 401 "Please sign in to access Studio."
- Fake bearer → 500.
- Bare request → 400.
- No token in any body.

Premium auth is **not** bypassed.

## DOC — PASS, with one info note
**Doc 228:**
- l.4 is byte-equal to `**სტატუსი:** Completed (C round 315 PASS)`.
- The 7 TEMPLATE headings are in order.
- Diff hunks fall only at l.4 and inside the granted sections (from l.30 on). `## კონტექსტი` is untouched.
- "მოლოდინშია" appears 0 times.

**Checked against the code:**
- the two budgets (10,000 → 3,000);
- `workerReplied` is set before the job-id filter, and `armStall` runs after it;
- the `deliver` path and the timer rethrow;
- compute stays outside `try`;
- both call sites (guard → set → `setSourcePeaks` → ready → re-sync);
- the `syncPlayback` dependency.

Every cited test row exists: PW1, 1b, 2, 3, 4–8, 7b, 9, 10–20 (25 tests, plus PW19 in the new file).

The TODO no longer lists PERF-5b as open and names where each signal went.

Info: "Browser (C round 314, stage 1) … PASS" credits round 314 alone. The stage-1 browser rows (identity, 9 waves, abort) were run in C round 312, and PERF-5a was closed by C round 314. This is attribution wording only.

**Doc 163:** exactly one changed line. "C-ის შემოწმება მოლოდინშია." becomes "C round 314 PASS.", and nothing else changed.

## Ableton conformity
Not applicable. This is a performance/robustness round with no new user-visible behaviour (§0.5).

## Gate rows (not claimed by C)
Full vitest, build, Biome, `npm run verify`, e2e smoke → `gates/gate-round-315.json`.

## For B
- Round 315 closes A-R312-REVIEW-L1…L5 on evidence. The L3 user effect was confirmed in the browser: before the fix, a video's sound plays while it shows "decoding"; after the fix, it waits and then joins in sync.
- Signals (Low, origin C, test coverage only):
  - **C-R315-T1:** PW14 does not pin the 10,000 ms value. A literal-value assertion would catch C-MU-COLD-START-VALUE.
  - **C-R315-T2:** no row covers "an unparsable message does not end the cold start". This is C-MU-REPLIED-ON-GARBAGE.
  - Both fit with A-R315-REVIEW-L1…L4 when the peaks client is next unfrozen.
- Info: the K8 by-design omission, and the doc 228 stage-1 attribution wording.
- Observation for T12.13: video sound ends with no fade at the video's duration (pre-existing, byte-equal at HEAD).
