# CURRENT TASK — Round 344: PERF-DRAG-PREVIEW stage c5-i. A video clip move drag row in the interactions perf harness, recorded at HEAD

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 343 → 344 planning.

**Decisions** (all in `backlog.json` → `decisions_log_b`, backlog v302 → v303, D-29z1079…D-29z1083):
- **D-29z1079: round 343 closed as PASS, from C's evidence.**
  - `c-round-343.json`: `taskStatus` PASS, `browserVerified`/`realVerified` true, 12 rows, 0 bugs.
  - Gate 343 is `published` as `0aa317f` on both remotes [K1]. **The baseline is `0aa317f`.** `context/head-sha.txt` may still say `99a5912`; that is stale.
  - Stage c4-ii → done. GATE338-S1-IDENTITY-INVARIANT → closed on C's READ row.
  - New perf oracle: `c-round-343/perf-results/latest-interactions.json`, with 219 rows, `complete` true and 0 failures [K13].
- **D-29z1080: round-343 notes.**
  - A's six reviewer Lows go to `deferred_low_polish`: A-R343-REVIEW-FROZEN-READERS, -DP55-LOOSE, -DP52-PREVIEW-NULL, -DP53-DUP, -GROUP-CANCEL and -HELDREF-IN-RENDER.
  - The Architecture note (three preview paths in `ArrangementClip.tsx`) becomes signal ARCH-R343-THREE-PREVIEW-PATHS. It folds into c5-ii and the close checkpoint.
- **D-29z1081: c5 is split into two stages,** following the c3-i/c3-ii and c4-i/c4-ii precedent:
  - c5-i (this round) adds the harness row;
  - c5-ii moves the video preview into the store.
- **D-29z1082:** rulings (§1.1).
- **D-29z1083:** this task.

**Read first:**
- `lessons.md`: L10, L22, L28, L29, L30, L31, L34, L37, L38, L56, L58. For C also L59 (do not end the phase with a runnable row unrun) and L60 (destructive commands only inside `c-round-344/`, with absolute paths).
- Primitives: `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (harness), `AGENT_DISCOVERABLE_CODE.md` (new names), `GEORGIAN_DOCS.md` (docs).
- No `app/**` change: no style, colour, copy, layout or audio-graph change.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first / product-designer / screen budget / YouTube request:** not applicable. This is a test-and-docs perf round: the app is not changed, and the browser rows prove it (VIDEO-PREMISE equals B's HEAD probe).

## Baseline
- HEAD is `0aa317f` (gate 343, published), with a clean tree [K2]. Protected files: 11/11 OK [K8]. No dependency change.
- **Perf oracle:** `c-round-343/perf-results/latest-interactions.json` [K13].
- **Budget file:** 219 rows, 0 video rows, 55 asserted rows, and 16 `commits-per-move` rows [K7].

## 0. Why this round, and B's evidence

### 0.1 Premise at HEAD (L37)
B's probe `b-round-343/video-probe.mjs` ran on the root dev server (:5173 = `0aa317f`) at 1440×900 and 1280×720. Output: `b-round-343/probe/head-1440.json`, `head-1280.json` and `head-summary.txt` [K14].
- **Setup:** import `public/videos/hero/10.mp4` through `arrangement-video-input` [K6]. That gives one video clip at 0.000 and the Undo entry "Undo: Add video — 10.mp4 (Ctrl+Z)".
- **Gestures:** a video move, trim and fade, each 60 moves over 120 px:
  - move: 99.433 components per move (max 103);
  - trim: 100.7 (max 103, at 1440);
  - fade: 94.4 (max 96).
- **What renders:** `ArrangementProvider`, `StudioWorkspace` and `ArrangementVideoDock` render on 59 of 59 move commits. Provider hook 0 (history) changes on every move; the fade also changes hook 16 (status).
- **Release:** 1 commit (max 88–90).
- `pageErrors` [].
- **Why:** a video clip takes `previewGeometry = isVideo ? previewArrangement : …` [K5], which goes to `updateHistory`. The dock reads React `arrangement` in its stopped-sync effect, in the caption, in the gap caption and in the fade overlay [K6].
- **Comparison:** an audio single-clip move costs about 24.9 per move since c3-ii, and a group move 26.969 since c4-ii.
- **Probe limits:**
  - At 1280 the probe's "trim" press landed on the fade-in handle. The perf spec's `visibleGrabPoint` checks that the target owns the point, which prevents this.
  - The probe did not assert `isPlaying` for its playing rows.

**Conclusion:** a video clip drag costs about 4× an audio clip drag. The harness has no video row today [K4].

### 0.2 What the sketch adds
B's sketch is `b-round-343/sketch/apply-sketch.py`, run on a `git archive` of `0aa317f` in `/home/runner/b343-scratch/sc`. The final diffs are `b-round-343/sketch/spec.patch.txt` and `budgets.patch.txt`; both pass `git apply --check` on HEAD.

Changes to `perf/studio-lab-interactions.perf.spec.ts`:
1. **Names and constants** after `clipById`:
   - `videoClips(page)` (`[data-clip-kind="video"]`);
   - `videoClipById(page, clipId)`;
   - `videoFixturePath` (`public/videos/hero/1.mp4`: tracked, 12.99 s, 3 995 012 bytes [K15]);
   - `videoGrabWidthPx = 480`, `videoZoomInKeyLimit = 16`, `videoZoomSettleMs = 150`.
2. **`DragMeasure.rows`** becomes `'all' | 'all-but-ratio' | 'thirty'` [K3]. In `measureDrag`:
   - the `rows === 'all'` block becomes `rows !== 'thirty'`;
   - `commits-per-move` stays inside an inner `rows === 'all'`.

   So `'all-but-ratio'` writes every `'all'` row except `commits-per-move`. That keeps DC-KINDS at exactly 16 windowed `commits-per-move` rows [K10]. The existing calls are unchanged.
3. **`setupVideoClip(page, result)`:**
   - a non-empty video lane is a problem and returns `null`;
   - read the Undo title;
   - `setInputFiles(videoFixturePath)` on `arrangement-video-input`;
   - expect 1 video clip (timeout 30 s) and wait for quiet;
   - a missing clip id is a problem and returns `null`;
   - blur, then press `=` with `videoZoomSettleMs` quiet until the clip's name bar is ≥ 480 px wide, at most 16 keys. Still narrower is a problem and returns `null`;
   - returns `{ clip, undoBefore, zoomKeys }`.
4. **`teardownVideoClip(page, video, result)`:**
   - blur, then Ctrl+Z until the Undo title equals `undoBefore`, at most 3 presses (more than 1 press is a problem);
   - expect 0 video clips;
   - an Undo title other than `undoBefore` is a problem.
5. **Run order:** at the end of the `cpuRate === 1` block, after `measureSelectSameLane` [K3], so no earlier row can see the import's seek to 0 and range clear:
   - video setup;
   - `setLive(…, 'interact.harness.drag-video-live', true, { zoomKeys })`;
   - `measureDrag` move stopped (`baseId` `interact.drag.video.stopped`, `liveId` `interact.harness.drag-video-live`, `rows` `'all-but-ratio'`);
   - `setPlayback(true)` + `waitForPlaybackSettled`;
   - `measureDrag` move playing (Home first, as for the audio drags);
   - `setPlayback(false)`;
   - teardown.

   A failed setup sets the live row to 0 with `{ setup: 'failed' }`.
6. **`interactionSequence`:**
   - the select-same-lane entry's "measured last" becomes "after the 30-clip block";
   - a new last entry describes the video block (fixture, zoom-in, stopped, Space, Home, playing, Space, the Ctrl+Z resets and the teardown).
7. `DragName`, `dragNames`, `dragSteps` = 60, `dragDistancePx` = 120, `measureLaneDrag`, `measureGroupDrag` and every existing row id stay unchanged [K3].

### 0.3 B's sketch evidence (L58)

| Check | Result | File [K16] |
|---|---|---|
| typecheck | rc 0 | `b-round-343/sketch-typecheck.log` |
| Biome on `perf/**` | Vacuous by config (L30). The stdin format check is `format-equal` | `b-round-343/sketch-format.log` |
| perf-lib report test on the sketch (scratch config, GATE304-M1; `--root` = the scratch, so it reads the sketch budgets) | 34/34, rc 0 (DC-KINDS green) | `b-round-343/perf-lib-sketch.log` |
| Perf, sketch v1 (no zoom-in) | rc 1. Aborted at "drag target has no visible grab point inside the viewport" in 3/3 1× passes (the select-same-lane step zooms out). The video rows were short of samples, so the run fails loudly | `b-round-343/perf-sketch-v1.log` |
| Perf, sketch v2 | rc 1. One failure: `nondeterministic ratio interact.drag.video.playing.move-components-per-move: numerators [5903, 5901, 5903]`. 157 EQUAL, 0 DIFF; 55/55 asserted; 417 845 ms | `b-round-343/perf-sketch-v2.log`, `perf-sketch-v2-results/`, `perf-rowcmp-sketch-v2-vs-c343.txt` |
| **Perf, final sketch v3** (that row `wallclock`) | See below | `b-round-343/perf-sketch.log`, `perf-sketch-results/latest-interactions.json`, `perf-rowcmp-sketch-vs-c343.txt` |

**Sketch v3 detail:**
- rc 0, `complete` true, `failures` [], problems [] in all 6 passes.
- 230 rows. Against `c-round-343`: **157 EQUAL, 0 DIFF, 8 NEW** non-wallclock rows (the 3 new wallclock rows are not compared). 55/55 asserted pass. 382 525 ms.
- Video rows, 3/3 1× passes:
  - stopped: `move-components-per-move` **98.35**, `move-components-max` 100, `release-commits` 1;
  - playing: `move-components-max` 100, `release-commits` 1, `move-restarts` 0, `release-restarts` 31; `move-components-per-move` (wallclock) 98.35, 98.383, 98.383;
  - `drag-video-live` 1, with `zoomKeys` 8.
  - p95 rows: wallclock.

**No mutant was run by B.** All rows are `record` (the c3-i precedent), so `mutantRedOnSketch` is `null`. A dead video drag still fails the run: `measureDrag` pushes a problem when a drag is not live, and problems become `failures`. Sketch v1 showed that a missing zoom-in fails loudly.

### 0.4 Consults
- Not consulted this round: `performance-optimizer` and `tech-lead`. Every row is `record` and no app code changes.
- c5-ii consults both before any row becomes `assert`.
- The advisor reviewed the plan before the sketch was written.

## 1. What A changes (ownership)
**Fastest route:**
1. Run `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-343/sketch/spec.patch.txt /home/runner/czaba-project/tmp/studio-real-loop/b-round-343/sketch/budgets.patch.txt`.
2. Read every hunk against §0.2 and §1.2.
3. Edit docs 232 and 168 by hand (§1.3).

A may write equal or stronger code than the sketch. A must not weaken any check in setup, teardown or liveness, and every value in §2 must hold.

**Granted files (exactly these 4):**

| File | What |
|---|---|
| `perf/studio-lab-interactions.perf.spec.ts` | §0.2 only |
| `perf/budgets.interactions.json` | §1.2 only |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | whole (L34) |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | `### Pass-ის თანმიმდევრობა`, `### Liveness-ის წესები` and `## მეტრიკები` only |

Nothing else changes: no `app/**`, no `perf/lib/**`, no `e2e/**`, no other perf spec or budget file, no config, no `package.json` or lock file, no binary fixture, and no protected file [K11].

### 1.1 Ruling lines (L4, D-29z1082)
- **One video gesture, the name-bar move.** The video move, trim and fade all reach `previewArrangement` through the same `isVideo` branch [K5] and cost the same order at HEAD (§0.1). c5-ii covers trim and fade with jsdom rows and C browser rows.
- **1× only, measured last.** The import seeks to 0 and clears the range, so the block must come after every pre-existing row. Result: 157/157 EQUAL.
- **`interact.drag.video.playing.move-components-per-move` is `wallclock`.** This is ruled from sketch v2. Any other video row that varies across the 3 passes in A's run is changed to `wallclock` by A, with its values per pass reported (pre-ruled, L10). This applies to the 10 non-liveness rows only and is not a STOP. A liveness value that is not 1 in every pass is a STOP.
- **Timeout headroom (L31).** The spec's limit is 15 min (`playwright.perf.config.ts`, outside the loop grants). B's runs took 417 845 ms and 382 525 ms. A and C record `durationMs`.
  - Above 450 000 ms (50 %) is a recorded Low finding with the value. It is not a STOP: the perf spec is not a gate step.
  - The open ROOT-REQ-PERF-TIMEOUT (`b-round-278-root-request-perf-timeout.md`, 15 → 25 min, not yet applied) covers this; B added this evidence to it.
- **`perf/budgets.interactions.json`:** the 219 existing rows stay byte-equal.

### 1.2 Budgets
- Append exactly 11 rows at the end of the file (after `interact.harness.drag-group-live.6x`), all with owner `PERF-DRAG-PREVIEW-c5-i`, `mode: "record"` and `budget: null`:
  - `interact.drag.video.stopped.{move-components-per-move, move-components-max, release-commits, move-to-paint-p95}`;
  - `interact.drag.video.playing.{move-components-per-move, move-components-max, release-commits, move-to-paint-p95, move-restarts, release-restarts}`;
  - `interact.harness.drag-video-live`.
- Unit and kind come from the matching `interact.drag.move.<state>.<metric>` row, except `interact.drag.video.playing.move-components-per-move`, which is `wallclock` (§1.1). The liveness row copies `interact.harness.drag-move-live`'s unit and kind.
- Notes are as in the patch: 1× only, measured last, the fixture, "Record until c5-ii". The playing ratio note gives the v2 sums.
- No `.6x` video row. No row uses the metric `commits-per-move` [K10].
- 2-space JSON layout and a final newline.
- **Result:** 230 rows, 11 video rows, 0 asserted video rows, 55 asserted rows, 0 video `.6x` rows, and 16 `commits-per-move` rows [K7].

### 1.3 Docs
**Doc 232, whole:**
- **l.1:** append `, ეტაპი c5-i — video კლიპის move-ის perf row` inside the closing parenthesis.
- **l.4:** exactly `**სტატუსი:** In Progress (stage c5-i of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii; C round 344 PASS)` (L28).
- **A new section** `### ეტაპი c5-i: video კლიპის move-ის perf row (round 344, D-29z1081)`, after the c4-ii section and before `### განხილული ალტერნატივები` [K12]. In Georgian, it covers:
  - the HEAD premise of §0.1 with its numbers;
  - the fixture, the zoom-in and the windows;
  - the 11 rows: why they are `record`, and why the playing ratio is `wallclock`;
  - why the block is 1× only and last;
  - that c5-ii moves the video preview into the store and is measured against these rows.
- **One entry each** under files, testing and problems. The problem: the select-same-lane zoom-out left no grab point (sketch v1). The solution: the bounded zoom-in.
- **TODO:** replace the `c5:` line with c5-ii and its inputs:
  - ArrangementClip `isVideo` → `previewClipGeometry`;
  - the dock's stopped-sync effect, caption, gap caption and fade overlay select the preview (the playing step already reads `getArrangement()`) [K6];
  - the group `hasVideo` fallback is removed (ARCH-R343-THREE-PREVIEW-PATHS);
  - video trim and fade jsdom rows;
  - the video rows → `assert` from a B sketch and a mutant.
- The `## ` heading count stays 7, in TEMPLATE order [K12].

**Doc 168 (L34):** after the edit, the three granted sections must match the live spec and budgets:
- `### Pass-ის თანმიმდევრობა`: item 10's "ბოლოს" no longer claims last, and a new item 11 describes the video block.
- `### Liveness-ის წესები`: one row for `interact.harness.drag-video-live`. It is `record` since round 344, owner `PERF-DRAG-PREVIEW-c5-i`, and is 1 only when both video drags change `data-clip-start` start→mid→end. A failed setup gives 0 with a problem.
- `## მეტრიკები`: a short paragraph on the `interact.drag.video.*` rows (kinds, 1× only, 11 record rows, the wallclock ruling, owner).

No other section of doc 168 changes.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-344.md` and `a-round-344/` as it goes)
| Row | Command | Expected |
|---|---|---|
| A-CLAIMS | `bash b-round-343/claims-344.sh > a-round-344/claims-pre.txt` from the loop root, before any edit; again at the end | Pre equals `b-round-343/claims-344-planning-output.txt`. Final equals `b-round-343/claims-344-sketch-output.txt` except **K2** (A's tree: `0aa317f 4`), **K15** (A's tree has git: `12.99 3995012 tracked`; the scratch has none, so the sketch output says `untracked`) and **K12** (A's doc edits: the l.4 token → `stage c5-i of`, `### ეტაპი c5-i` 0 → 1, doc 168 `drag-video-live` 0 → ≥ 1). Any other difference is a STOP |
| A-TYPE | `npm run typecheck` (covers `perf/`; Biome does not, L30) | rc 0 |
| A-FORMAT | From `store/`: `npx biome format --stdin-file-path=app/x.perf.spec.ts < perf/studio-lab-interactions.perf.spec.ts \| cmp - perf/studio-lab-interactions.perf.spec.ts` | equal |
| A-LINT | `npm run lint` | rc 0; warnings ≤ gate 343's count (record it) |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-343/perf-results/latest-interactions.json <A's result>` | rc 0; `complete` true; `failures` []; 230 rows; **55/55 asserted pass**; **157 EQUAL, 0 DIFF, 8 NEW**; the 8 NEW values equal §0.3 (98.35, 100, 1, 100, 1, 0, 31, 1); the 3 wallclock video rows are reported, not compared (L37); `durationMs` recorded (§1.1). Save under `a-round-344/` |
| A-PREMISE | From A's results | **STOP row:** `interact.drag.video.stopped.move-components-per-move` > `interact.drag.move.stopped.move-components-per-move` (A's own run). Report both |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts` (scratch config, GATE304-M1) | 34/34 (DC-KINDS green) |
| A-SCOPE | `git status --short`, `git diff --stat` | the 4 files of §1 only, 0 untracked; `app/`, `perf/lib/` and `e2e/` clean [K11]; protected 11 OK |
| A-REVIEW | the real `code-reviewer` subagent on the 4 files (3+ files rule) | no Medium+ open; code changed after the review goes back to it (L11); Architecture notes go to B |

A does not run the full vitest suite or `npm run verify` (gate rows). A must not start a dev server from a tree that symlinks the store's `node_modules` (D-29z1057).

### 2.2 C rows (C writes `c-round-344.md`, `c-round-344.json` and `c-round-344/` as it goes)
C writes **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, with an `origin` per finding.
- `assertsSpecified` = 5: PERF (the 55 existing asserts counted as one row), PREMISE, MUTANT, VIDEO-PREMISE and G344-AUTH.
- `mutantsRecorded`: C's own mutant.
- `mutantRedOnSketch`: `null`, with the reason "B ran no mutant; c5-i rows are record (c3-i precedent); sketch v1 is the natural no-zoom failure".
- `mutantRedOnTree`: from C's runs.
- `gateChecksNamed` = full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. `gateChecksRunOnSketch` = typecheck.
- `chainHeadGateRunGreen`: from `gates/gate-round-343.json`.
- `affectedChecksNamed` = the interactions perf spec, rowcmp, the perf-lib report test and the video probe. `affectedChecksRunOnSketch` = all four.

| Row | How | Expected |
|---|---|---|
| CLAIMS | `bash b-round-343/claims-344.sh`, first (L56), and at the end | equal to A-CLAIMS final |
| SOURCE-SCOPE | `git status`, `git diff --stat`, protected sha | Only the 4 files changed. `git apply -R --check` of the two B patches passes, except hunks A strengthened (name each). No diff in `app/`, `perf/lib/` or `e2e/` [K11]. The 219 pre-existing budget rows are byte-equal by id against `git show HEAD:perf/budgets.interactions.json` |
| PERF | Production build of A's tree, spec alone, after a browser warm-up (L38); then `perf-rowcmp.py` against `c-round-343/perf-results/latest-interactions.json` | As A-PERF: 157 EQUAL, 0 DIFF, 8 NEW with the §0.3 values. Record `durationMs` and the 3 wallclock video rows. Any other DIFF is a finding, with its number |
| PREMISE | from C's results | As A-PREMISE. Record the 11 video rows' 3 pass values in `c-round-344/video-rows.txt`; these are c5-ii's baseline |
| MUTANT | One mutant of C's own on a scratch copy (never `store/`), predicted before it runs, that fails loudly. Examples: `videoGrabWidthPx` set to 5000 (setup fails: problem "video setup: name bar …", live 0); or the `setInputFiles` call removed (`toHaveCount(1)` throws and the pass aborts at "video setup") | The run is red with the predicted problem. Scratch deleted afterwards |
| **VIDEO-PREMISE (browser, dev)** | `node b-round-343/video-probe.mjs http://127.0.0.1:5173 <out> <w> <h>` on A's tree at 1440×900 and 1280×720 | Compared with `b-round-343/probe/head-<w>.json` (A changed no `app/` file). **Stopped gestures (move, fade at both viewports; trim at 1440):** `perMove`, `max`, `providerRenders`, `workspaceRenders`, `dockRenders`, `changedHooks` and release `commits` are exact. **Playing gestures:** `providerRenders`, `workspaceRenders` and `dockRenders` = 59 and `max` exact; `perMove` within ±0.1 and release `commits` 1–3, both recorded (B's runs: move-playing 62 commits, fade-playing release 3 with hook 12; the harness ruled the playing ratio wallclock). **The 1280 trim gesture** is recorded, not compared (B's press landed on the fade-in handle there, a probe artifact, §0.1). For every gesture: `mid`/`end`/`afterUndo` clip states, `undoAfterImport` and `pageErrors` [] are exact. One cold-start timeout is environment-invalid: keep it and replace it once (L38). This is c5-ii's behaviour oracle |
| HARNESS-READ | read the new functions against §0.2 | setup (empty-lane check, fixture, count, clip id, the bounded zoom-in and its problem), teardown (presses, 0 clips, Undo title), the run order after `measureSelectSameLane`, `setLive` on a failed setup, `'all-but-ratio'` writes no `commits-per-move`, and every other drag's code path unchanged in the diff |
| PERF-LIB | the A-PERF-LIB command | 34/34; DC-KINDS green |
| G344-AUTH | as G343-AUTH (`c-round-343/tools/g343-auth.cjs`), fresh anonymous contexts, both viewports | `/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token`: no header → 401, bare → 400, fake Bearer → 403 while `/__mock/health` is 200 (500 only when the mock is down, with the health status recorded). No token in any body |
| DOCS | read doc 232 and doc 168 | §1.3: l.1 and l.4 byte-exact; the c5-i section with the §0.1 numbers; the files, testing, problems and TODO entries; 7 `## ` headings in TEMPLATE order; doc 168's three sections match the live spec and budgets (L34); `git diff` of doc 168 has hunks only inside them |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** PERF, VIDEO-PREMISE and G344-AUTH run here; none needs the backend.
**Ableton conformance:** not applicable (a measurement; behaviour unchanged).

## 3. Neighbouring behaviour that could break
- **Pre-existing perf rows.** The video block runs last in the 1× pass, so nothing measured earlier can see it. PERF requires 157 EQUAL.
- **The 6× passes** are unchanged; the video block is guarded by `cpuRate === 1`.
- **The harness's own vacuity.** A drag that misses the video clip would record nothing or audio numbers. Three things guard against it:
  - the liveness on the video clip's `data-clip-start`;
  - the problem a dead drag pushes;
  - the teardown's 0-video-clip check.

  The gap that `record` liveness leaves: a live press on a *different* clip (for example the audio clip) would move that clip and pass liveness. The patch builds the video locator from the imported clip's own `data-clip-id`, and HARNESS-READ checks it. The gap closes in c5-ii, when the video rows assert values only the video path produces.
- **Spec duration** (§1.1).

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside K2/K12/K15.
- A patch does not apply, or a change is needed outside the 4 files (L22: STOP with the diff).
- Any pre-existing row DIFF, a failed assert, or a liveness value not 1 in every pass.
- A-PREMISE fails.
- A determinism failure other than the pre-ruled `wallclock` kind change.

## 5. Not in scope
- **c5-ii:** routing the video preview (move, trim, fade, and groups with video) to the store; the dock, caption, gap and fade-overlay readers; removing the `hasVideo` fallback; video jsdom rows; any video row → `assert`.
- **Later:** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (after c5-ii), the trim/move conversions, PERF-CAND-FADE-BUDGET, SIG-R324-OTHER-PREVIEW-CALLERS.
- **Deferred Lows:** A-R343-REVIEW-*, A-R339-REVIEW-*, GATE339-S*.
- **Root only:** `vitest.config.ts` (GATE304-M1); `playwright.perf.config.ts` (ROOT-REQ-PERF-TIMEOUT); commits and pushes.

## 6. Deliverables
- **A:** the 4 files; `a-round-344.md` with the A rows; logs in `a-round-344/`.
- **C:** `c-round-344.md`, `c-round-344.json` and `c-round-344/`.

## 7. Claims
Run `bash b-round-343/claims-344.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree. Expected output at HEAD: `b-round-343/claims-344-planning-output.txt`. Expected output on B's final sketch: `b-round-343/claims-344-sketch-output.txt`.
- **K1:** gate 343 `published` `0aa317f`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** in the spec:
  - the old and new `rows` union lines;
  - the `rows === 'all'` and `rows !== 'thirty'` lines;
  - `measureSelectSameLane(page, result)`;
  - `dragSteps = 60`, `dragDistancePx = 120`;
  - the `DragName` line.
- **K4 (SWEEP):** files under `app/`, `perf/` and `e2e/` that name `setupVideoClip`, `teardownVideoClip`, `drag-video-live`, `interact.drag.video` or `videoFixturePath`. HEAD: none. Sketch: the spec and the budget file.
- **K5:** in `ArrangementClip.tsx`:
  - `const previewGeometry = isVideo`;
  - `? previewArrangement`;
  - the `previewGroup` line;
  - `data-clip-kind`.
- **K6:** in `ArrangementVideoDock.tsx`:
  - the stopped-sync deps line;
  - `const current = getArrangement();`;
  - `resolveVideoTarget(arrangement, …)`;
  - `useVideoSourceIdAtPlayhead(arrangement)` (2);
  - `videoFadeOpacityAt(arrangement, …)`;
  - `arrangement-video-input` in `ArrangementLane.tsx`.
- **K7:** budget counts: rows, video rows, asserted video rows, asserted rows, video `.6x` rows, `commits-per-move` rows, video owners. HEAD `219 0 0 55 0 16 []`; sketch `230 11 0 55 0 16 ['PERF-DRAG-PREVIEW-c5-i']`.
- **K8:** protected sha, 11 OK.
- **K9:** the `regression-last` date.
- **K10:** DC-KINDS (1), `toHaveLength(16)` (1), and `measured row without a budget row` in `perf/lib/report.ts` (1).
- **K11:** `git diff --stat HEAD -- app perf/lib e2e` line count (0).
- **K12:** doc 232: the l.4 stage token, the `## ` count and the `### ეტაპი c5-i` count. Doc 168: the `## ` count and the `drag-video-live` hits.
- **K13:** the perf oracle (`c-round-343`): complete, failures and rows.
- **K14:** B's HEAD probe at 1440 (move, trim and fade stopped: perMove/max/provider/workspace/dock).
- **K15:** the fixture's duration and size, and that it is tracked.
- **K16:** every cited artifact exists (L56).

## 8. Root notes
- **Commit readiness:** after C PASS, the 4 files of §1 are one test-and-docs change. The gate's full verify and review apply.
- **ROOT-REQ-PERF-TIMEOUT (open since round 278, non-blocking):**
  - Raise `playwright.perf.config.ts` `timeout` from 15 to 25 min (`b-round-278-root-request-perf-timeout.md`).
  - New evidence: B's runs with the video block took 382–418 s, against L31's bound of 450 s.
  - Root decides; the loop does not edit config.
- **Still open for root:** ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1), the checkpoint D-29z915 and R80-RECORDINGS-FIELD-BORDERS.
