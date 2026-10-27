# C round 211 — PERF-FADER-b (Clip Gain pointer preview, single + members; SABA-B-5 part 2) — verification

**Verdict: PASS.** `browserVerified = realVerified = true`. Every C row ran in real Chromium (Playwright, real mouse/keyboard) or as a real harness run, at 1440×900 and 1280×720 where it matters. The `gate` rows (full vitest, typecheck, build, `npm run verify`, e2e smoke) are the root gate's and are not claimed. Findings: one Low (C-R211-01) and some notes for B (C-R211-02 … 04). None blocks.

**Product / Ableton.** CZABA requirement (SABA-B-5, Clip Gain fader is fast): **met for React work.** Each move now commits 3 components, down from 95. Wall-clock is a separate matter, see C-R211-02. Ableton conformance: **not applicable**. This is a performance round and the behaviour is unchanged by design. INVARIANTS-211 and the LIVE-DISPLAY baseline diff show it is identical to `180dd2e`.

## Setup
- **Builds:**
  - current tree: `store/build` from C's perf run 2, served on `:5190`;
  - baseline `180dd2e`: `git archive` into `c-round-211/baseline` with `node_modules` symlinked, `npm run build` rc 0 (`out/baseline-build.log`), served on `:5191`.
  - The baseline tree was deleted after use. The CSS bundles of the two builds are byte-identical (`app-Ijsdx7fz.css`, same sha256).
- **Probes:** C's own, in `c-round-211/tools/`: `c211lib.cjs` (adapted from c210lib), `c211probe`, `c211inv`, `c211audio`, `c211members`, `c211export`, `c211vis`, `c211adj`, `c211load`, `c211transient`, `c211repaint`, `c211memlive`, `g211-3`, `perfcmp.py` and `mutants.sh`. None imports `perf/`.
- **Order:** both perf runs ran first, alone and sequentially. Browser probes came after; G211-3 ran last on the root dev server `:5173`. I stopped my `:5190`/`:5191` servers afterwards, and `:5173` stayed up (200).
- **Probe fix during the round (method, not app):** clicking a clip that is inside an existing group selection keeps the group. This is the same on both builds. So members with different gains are set by typing each clip's gain **before** the Shift-selection (`addMembers(page, [-6, 1])`). At 1280 the detail panel starts collapsed on both builds; the probe expands it with the existing toggle.
- **WAVs** (168 MB) were deleted after hashing (`out/export-wav-sha256.txt`).

## Row table
| Row | Status | Evidence |
|---|---|---|
| **SCOPE-211** (start + end) | PASS | See "SCOPE-211" below. |
| **PERF-RUN-211** | PASS | See "PERF-RUN-211" below. |
| **WINDOW-211** | PASS | See "WINDOW-211" below. |
| **LIVE-DISPLAY-211** | PASS (+ C-R211-01 Low) | See "LIVE-DISPLAY-211" below. |
| **AUDIO-211** | PASS ((b): wraps start new sources inside the existing graph, so the `resyncLoopRef` rebuild path is proven by (c) and CP7/CP8, not by (b)) | See "AUDIO-211" below. |
| **MEMBERS-211** | PASS | See "MEMBERS-211" below. |
| **INVARIANTS-211** | PASS | See "INVARIANTS-211" below. |
| **EXPORT-211** | PASS (1440 only; the render does not depend on viewport) | See "EXPORT-211" below. |
| **VISUAL-211** | PASS (with a raster-noise note) | See "VISUAL-211" below. |
| **DOC-211** | PASS | See "DOC-211" below. |
| **AN-REVIEW-211** | PASS | See "AN-REVIEW-211" below. |
| **G211-3** | PASS | See "G211-3" below. |
| §4 adjacent (track drag, meters, video, statuses, lane redraw on zoom/trim) | PASS for those items; MG11 selection change mid-drag is jsdom-only (CP10b, MG11) | See "§4 adjacent" below. |
| gate | gate | Not claimed by C. |

### SCOPE-211
- **Start:**
  - HEAD `180dd2e`. `git status`: 14 M + 2 ??.
  - `sha256sum -c --quiet b-round-210-r211-tree-sha256.txt` rc 0 (1,041 frozen files).
  - All 14 grants differ from `b-round-210/r211-granted-start/`. Nothing outside the grants changed.
- **New files:** only 2 of the 4 allowed appear: the test file and doc 166. That is a subset of the list. A's DEVIATION 2 (both leaves inside granted files) still needs B's ruling.
- **Doc 165:** exactly one hunk, `@@ -4 +4 @@`, with B's exact text.
- **Granted tests (`git diff -U0`):** every hunk is on A's L23 list:
  - CF2/CF4/CF12/CF13, MG4/MG5/MG11/MG12/MG14, WG4/WG8, WZ3;
  - plus the 5 disclosed after-pointerup or destructure edits.
- **`perf/budgets.json`, compared per id against HEAD:**
  - 266 → 316 rows;
  - exactly **12** ids changed mode or budget, all `fader.clipgain.{stopped,playing}` at 1× and `.6x`: `move-components-max` and `-per-move` record → assert (≤ 3), and `release-commits` record/null → assert ≥ 1;
  - 50 new rows, all `fader.clipgain-members.*`: 8 × assert ≤ 3, 4 × assert ≥ 1, 2 × restarts assert == 0, 4 × moves-dispatched record == 121, 32 record;
  - 0 note-only edits on other rows, 0 other field changes.
- **End:**
  - `sha256sum -c` rc 0 again;
  - the tree fingerprint (diff + untracked hashes) is `0e0381aa…` at both start and end (`out/tree-start.sha` = `out/tree-end.sha`);
  - nothing changed during C's phase. The scratch mutant copy was in `/tmp` and was deleted.

### PERF-RUN-211
`out/perf-run{1,2}.{log,json}`; comparison by `tools/perfcmp.py`.

- **Runs:**
  - run1: exit 0, 457 s; run2: exit 0, 435 s (both < 12 min);
  - both `complete: true`, 316 rows, 92 asserts, 0 failing, `failures: []`.
- **Flips:** all 12 flipped clipgain rows pass:
  - stopped: max 3, per-move 2.75, release 2;
  - playing: max 3, per-move 2.25, release 1, restarts 0.
- **Members rows:** pass at 1× and 6×. Max 3, per-move 2.25, release 1, playing restarts 0, moves-dispatched 121.
- **Determinism:**
  - every deterministic row is identical between run1 and run2, and across 1×/6× for the clipgain rows;
  - within a run, only `load.longtasks-over-50` varies, and it is outside the identity list.
- **Must-be-identical (D-29z190):** 119 deterministic rows were compared with C round 210's two runs: **0 differences**. They are every `harness.*` deterministic row, `load.commits`, `play.idle-*`, every `fader.{track,group,master,pan}.*` deterministic row, and `fader.clipgain.*.moves-dispatched` / `.restarts`.
- **`load.components`:** 344 → 345 (+1).
  - In the browser (`out/load-check.json`), at load there are 0 clips and 0 lane waveforms, and the Clip Gain block exists on both builds.
  - The first commit counts 134 → 135 components: exactly one more, which is the `ArrangementDetailClipGain` leaf instance.
  - This matches A's "+1 block leaf, 0 drawn clips".
- **DEVIATION 4 (wall-clock):**
  - `harness.move-latency-live.sync` 31.8/31.8 (round 210: 31.3), `.deferred` 31.8/31.9 (31.4), `-control` 1.8/1.6 (1.6);
  - they are `kind: wallclock`, and the assert ≥ 30 passes;
  - B's identity list is headed "existing deterministic rows". I record the +0.5 ms and do not fail on it. B rules.
- **Wall-clock clip gain (record rows), move-to-paint p95 at 1×:**
  - stopped 18.1 / 18.6 ms (round 210: 25.1 / 26.4);
  - playing 59.7 / 58.1 ms (66.5 / 58.9);
  - members stopped 7 / 6, members playing 10.2 / 9.4.
  - See C-R211-02.

### WINDOW-211
`out/probe-cur-{1440,1280}.json`, plus `out/probe-base-1440.json` as the control. Production build, real mouse, the harness path (down at 50 %, 60 steps to 5 %, 60 steps to 95 %). Identical numbers at 1440 and 1280:

| drag | window commits | max | per-move | before-first-move | release | value changes | lagging inputs | harness |
|---|---|---|---|---|---|---|---|---|
| single stopped | 110 | 3 | 2.75 | 0 | 2 | 109 | 0 | 3 / 2.75 / 2 ✓ |
| single playing | 90 | 3 | 2.25 | 0 | 1 | 89 | 0 | 3 / 2.25 / 1 ✓ |
| single, typed −12 dB first, stopped | 119 | 3 | 2.975 | 0 | 2 | 118 | 0 | — |
| single, typed −12 dB first, playing | 119 | 3 | 2.975 | 0 | 2 | 118 | 0 | — |
| members (N = 2) playing, start 0 dB | 111 | 3 | 2.758 | 0 | 2 | 109 | 0 | 3 / 2.25 (harness starts at max) ±2 ✓ |
| members stopped | 90 | 3 | 2.25 | 0 | 1 | 89 | 0 | 3 / 2.25 / 1 ✓ |
| members typed −12 / −20, playing | 120 | 3 | 2.992 | 0 | 1 | 118 | 0 | — |

- **Every value-changing move commits:** window commits ≥ value changes, and 0 lagging inputs.
- **Baseline control, same probe:** max 95–97, per-move 73.5–97.2, release 1. The probe measures what the harness measures.

### LIVE-DISPLAY-211
Samples are taken at 25/50/75 % of the second leg in every run above, at both viewports. Screenshots: `shots/cur-{1440,1280}-<run>-{25,50,75}.png` (42 files).
- **What follows the pointer:**
  - the slider value, `aria-valuetext`, the number field text, the members range text, the fill style and the reset `disabled`;
  - the lane waveform `d` (every member) and the detail waveform `d`.
  - Example, single from −12: −30.9 → −12.0 → +6.9, with three different lane and detail hashes. At −12 the hash equals the rest hash.
- **No pending state mid-drag:** `data-pending` null, no `border-warning` and no pending marker at every sample.
- **Same as the baseline:** current vs baseline at 1440 gives **49 compared states (samples, before, after, release status, undo title), 0 differences**. Lane and detail hashes are included. So the drawing during the drag is the same drawing as on `180dd2e`.
- **Release (S5):** sampled per animation frame for 12 frames after `pointerup`. Every frame shows the committed value with no pending marker. **There is no painted snap-back.** But see C-R211-01: the DOM passes through an unpainted stale state inside the release task.
- **Statuses:** none during any drag (`statusDuring` = 0).
  - Single: no status change on commit, the same as the baseline.
  - Members: one status after release, e.g. "Clip Gain: 2 clips — +24.0 dB." and "Clip Gain: 2 clips — +16.0 … +24.0 dB.".

### AUDIO-211
`out/probe-cur-*.json` (a), `out/audio-cur-{1440,1280}.json` (b, c) and `out/members-cur-*.json`. `AudioParam` writes are hooked, and so is `AudioBufferSourceNode.start`.
- **(a) Drag while playing:**
  - At every sample a live param equals `10 ** (fader/20)`; for members, both members' params.
  - 0 source starts during any drag.
  - Example: single from −12, last write 15.849 (= +24 dB).
  - After release there is one entry ("Undo: Clip Gain"). Ctrl+Z restores 0.2512 (−12 dB) on the live param, and the lane hash goes back.
- **(b) Loop 00:00.750–00:01.750, drag with 25 ms per move:**
  - 6 wraps at both viewports, one source start each.
  - Each wrap creates a new per-source clip-gain param. Its first value equals the last live write before the wrap, so it is the dragged value and not the stored one: 0.10471, 0.02455, 0.00575, 0.01841, 0.25119, 2.95121.
  - The following writes continue on the new param.
  - Ctrl+Z writes 0.2512 to every live clip-gain param.
  - As in round 210, a browser wrap starts sources inside the existing graph (`clipGainTargets` is updated by `setClipGain`). The `resyncLoopRef` rebuild path is therefore covered by (c) and by CP7/CP8.
- **(c) Space mid-drag, mouse held:**
  - Single: Space at −30.9 dB stops playback, and Space at **+6.9 dB** (not the stored −12) restarts it. The rebuilt graph's clip-gain params are first written as **2.21309 = 10^(6.9/20)**. There are 4 source starts. After release there is one entry; Ctrl+Z gives 0.2512.
  - Members (−6 / +1): the restart at anchor +19.9 writes **4.4157 = 10^(12.9/20)** for the audible member, which keeps the 7 dB difference. Ctrl+Z gives 0.5012.
  - Note: the first Space attempt sat at the 50 % point, where the dragged value equals the stored one. That is not a discriminating test, so I moved the restart to 75 %.
- **Members timeline (explains why one member's writes stop):** without a loop, the 2 s Soft impact source ends partway through the drag, and its writes stop then (`c211memlive.cjs`: param 11 has 66 writes until 1.13 s, param 10 has 110). With a loop inside both clips (MEMBERS-211), both members are written throughout.

### MEMBERS-211
`out/members-cur-{1440,1280}.json`: members typed −6 / +1, then a loop 0.75–1.75 s so both are audible, then playing. Identical at both viewports.

| action | display | live | entries |
|---|---|---|---|
| drag (mid) | −6.0 … +1.0 → +6.6 … +13.6 dB; both lane hashes change | both members follow; 7 dB difference kept (e.g. 0.1012 / 0.2265) | — |
| pointercancel | back to −6.0 … +1.0, both lane hashes = before, field "", no pending | every live member param 0.5012 / 1.1220 | 0 release commits, undo still "Undo: Loop created" |
| fader blur | same as cancel | same | 0 |
| release | +6.6 … +13.6 dB | 2.138 / 4.786 | 1 entry, status "Clip Gain: 2 clips — +6.6 … +13.6 dB." |
| Ctrl+Z | −6.0 … +1.0, lanes back | 0.5012 / 1.1220 | — |

- **Clamp past +24:** a full drag goes to +17.0 … +24.0 dB (difference kept), and typed −12 / −20 goes to +16.0 … +24.0. Both are **equal to the baseline** in the INVARIANTS diff (`fullDrag`).

### INVARIANTS-211
`tools/c211inv.cjs`, run identically on the baseline and current builds, for single and members (−6 / +1). It covers:
- fader ArrowDown×3 / ArrowUp;
- a held ArrowUp with auto-repeat, then keyup and blur;
- Shift+drag fine;
- a plain drag;
- Esc, pointercancel and blur mid-drag;
- a full release drag (clamp) twice;
- Tab order;
- double-click reset (and blur);
- Ctrl+Z / Ctrl+Shift+Z;
- typed field: pending state, Enter, blur and Escape;
- the reset button, then Undo/Redo.

Results:
- `out/inv-{base,cur}-{1440,1280}.json` (`tools/invdiff.cjs`): **1,523 values per viewport; the only differences are the 4 random clip UUIDs.** Display, field, range, `data-pending`, reset `disabled`, lane and detail hashes, undo/redo titles and status text are all identical.
- Esc does not cancel a fader drag on either build: the value commits on release.
- Tab order is field → fader → reset on both builds.

### EXPORT-211
`out/export-cur-1440.json`, `out/export-wav-sha256.txt`.

| session | how | sha256 |
|---|---|---|
| single 1 | type −12, plain drag → **−26.9 dB** | `76735f30…7e127c` |
| single 2 | fresh session, type −26.9 | **same: bit-identical** |
| single control | defaults | `5fadd97a…` (differs) |
| members 1 | −6 / +1, plain drag → anchor **+21.1** (+14.1 … +21.1) | `5b8581cc…a8e493` |
| members 2 | fresh, −6 / +1, 201 ArrowUp presses → +21.1 | **same: bit-identical** |
| members control | −6 / +1 | `c4f50501…` (differs) |

- **Format:** PCM 24-bit stereo, 48 kHz, 4,864,896 frames = 101.352 s, NaN 0, 99.77 % non-zero samples.
- **Single peak:** 0.04519 = −26.9 dBFS, which is the clip gain applied to the full-scale control.

### VISUAL-211
`out/vis-{base,cur}-{1440,1280}.json` and `shots/vis-*`.
- **Computed style and boxes:** fader, field and reset at rest, hover, keyboard focus and pressed (fader, field), plus block, detail-waveform and lane-waveform regions. **503 values per viewport, 0 differences.**
- **Keyboard focus ring** (Shift+Tab/Tab modality): `:focus-visible` true, 1px solid brass `rgb(201,164,106)/0.8`, 2px offset, on all three controls at both viewports.
- **Pixels:** pixel-identical between builds:
  - every crop at 1440;
  - at 1280: the block, detail waveform, lane waveform, fader (all 4 states), reset (3) and full frame.
- **Exception at 1280 (raster noise):**
  - The 1280 field crops taken after the fader hover/focus/press sequence differ in 8 corner pixels by Δ1 (rest, hover) and in 4 caret pixels by Δ2 (pressed). This is deterministic per build.
  - Investigation (`tools/c211repaint.cjs`, `shots/rp-*`): the same field cropped fresh, after a focus pass, and after a forced full repaint (viewport ±1 px) is **pixel-identical** between builds.
  - Within one build, fresh vs after focus differs by 30 px Δ1.
  - So the difference is anti-aliasing that depends on repaint history, not a style change. The CSS bundles and the DOM boxes are identical.
- No layout shift.

### DOC-211
- **Doc 165:** l.4 is exactly `**სტატუსი:** Completed (PERF-FADER-a C round 210 PASS, published 180dd2e)`; nothing else changed.
- **Doc 163:**
  - l.68/69 now say `assert` for track, group, master and pan since PERF-FADER-a, and for clip gain (single and members, N + 1) since PERF-FADER-b;
  - l.71 says `move-window-live` survives because each value-changing move still commits the leaf;
  - pass-sequence step 9 (members) and step 10 (liveness) were added;
  - row count 316; TODO line added; l.4 unchanged.
  - **C-R210-01 is closed.**
- **Doc 166:**
  - status `In Progress (C round 211 check pending)` (L28);
  - every cited test id exists (CP1, CP3, CP4, CP5, CP5b, CP10b, CP14, MD6, CF2/4/12/13, MG4/5/11/12/14, WG4/8, WZ3);
  - the cited budget rows exist in `budgets.json` (316 ids);
  - it has the before/after table and the export-mid-drag note (l.25).
  - Its numbers match A's runs; C's runs agree within wall-clock noise.
- **`budgets.json` notes** match the asserts.

### AN-REVIEW-211
- **Forbidden patterns:** none in the added lines (no `any`, no `as`, no `@ts-*`, no lint suppressions, no hardcoded colours), and no class selectors or `toHaveClass` in the new test.
- **Biome:** `biome check` (read-only) on the 11 app paths: "No fixes applied".
- **Store:** unsubscribe deletes empty key sets (`mix-draft-store.ts` l.52–53).
- **Unmount:** clears every draft key of any override (`mixOverrideDraftKeys`).
- **S2:** `withMixOverride` is no longer exported. There is no other user in `app/`.
- **Mutants, independent of A's** (`tools/mutants.sh`, scratch copy, log `out/mutants.log`):
  - unmutated: 17/17 green;
  - **M14** (Trap 1 early return): CP10 and CP14 red ("expected '10.8' to be '-6.0'");
  - **M7** (`startGraph` reads stored gains): CP7 and CP8 red (0.5012 vs 0.0724);
  - the scratch copy was restored, compared equal to the real file, then deleted.

### G211-3
`out/g211-3.json`, `shots/g211-3-*.png`, against `:5173`.
- `/studio-lab` opens anonymously at 1440 and 1280: `auth_user` null, 0 cookies, demo badge shown, 0 forbidden requests, 0 Authorization headers.
- `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` and no workspace, at 1440 and 1280.
- Token endpoint:
  - no header → 401;
  - fake Bearer → 500 "Unable to prepare Studio access" (no `:5199` mock), no Set-Cookie.
- **No token issued.**

### §4 adjacent
`out/adj-{base,cur}-{1440,1280}.json`: 33 values per viewport, 0 differences.
- **Track Volume drag:** 90 window commits, max 1, per-move 0.75, release 1, 89 value changes. PERF-FADER-a is intact.
- **Meters:** they move during the playing clip-gain drags (track meter `scaleX` 0.80 → 0.48 → 0.13 in the samples).
- **Lane redraws with no draft** (`tools/c211redraw.cjs`, `out/redraw-{1440,1280}.json`; `ArrangementPeakPath` now owns this svg):
  - waveform zoom to max and back redraws the lane path at both viewports;
  - a trim-end drag of Soft impact redraws it mid-drag and after ("Undo: Trim — right edge"), at 1440;
  - every hash sequence is **identical to the baseline**.
  - At 1280 the same 30 px grab hit the Fade Out handle on both builds (probe geometry); the fade drag leaves the path unchanged on both.
- **Not run in the browser:** the MG11 selection change mid-drag. A second selection click cannot happen while one mouse button holds the fader. It is covered in jsdom by MG11 and CP10b only.
- **Statuses:** announcements come after the commit only (`statusDuring` = 0 in every drag).
- **Video clip (owned synthetic `clip-3s-h264-aac.mov`):**
  - field, fader and reset are disabled with "A video clip has no Clip Gain — use the track Volume/Mute";
  - audio + video members are disabled with "Clip Gain works on audio clips only — remove the video from the selection".
  - Both builds are identical. See C-R211-04 on the waveform.

## Findings for B
- **C-R211-01 (low → `deferred_low_polish`, unless B rules fix-now; it explains A's DEVIATION 3). Rule reference: D-29z189 item 7, "when no draft exists, it shows exactly what it shows today". The intermediate commit breaks the letter of that rule, although it is never painted.** On release of a value-changing single drag, the first commit after the drafts clear renders the field from the parent's **stale** typed text. Example (`out/transient-{base,cur}-1280.json`), in one task before the first frame:
  - the field value goes −3.2 → **−12.0**;
  - `data-pending="true"`, `border-warning`, title "Unsaved — Enter saves, Esc reverts", and `aria-describedby` pointing at the pending id;
  - the pending `<p>` mounts.
  - The parent's layout-effect sync then commits again and reverts everything.
  - It is never painted: rAF frames show only −3.2 with no marker. The baseline has no such records.
  - Steps: select a clip, type −12, drag the Clip Gain fader 10 px, release, with a MutationObserver (`attributeOldValue`) on the field.
  - Expected: the release commit shows the committed value directly. Actual: a two-commit release with an unpainted stale intermediate. It forces a field repaint and doubles `release-commits`.
  - Suggested direction for a later owner: write the parent's text state in the commit handler, or have the leaf keep the draft until the text sync. The current state is not a user-visible bug.
- **C-R211-02 (note, not a round-211 bug: the open remainder of SABA-B-5, which stays Medium; A's known gap, keep it open).** Single Clip Gain **playing** move-to-paint p95 is still 58–60 ms (C: 59.7 / 58.1). Stopped is 18 ms. Each move now commits only 3 components (members playing are about 10 ms). SABA-B-5's p95 < 16 ms target is therefore not met for this case. It is a `record` row, not a B acceptance. A measured follow-up (paint and raster of the detail waveform while playing is A's unproven hypothesis) belongs in the STUDIO-PERFORMANCE queue.
- **C-R211-03 (rulings needed, no fail):**
  - DEVIATION 1: the harness members scenario adds Soft impact on SFX, because `/studio-lab` has no second audio clip. It is verified to work, and it runs after `fader.group.playing`.
  - DEVIATION 2: both leaves live in granted files, so 2 of the 4 new files appear.
  - DEVIATION 4: wall-clock +0.5 ms.
  - DEVIATION 5: the setter-loop override is unreachable mid-gesture.
- **C-R211-04 (info, task premise).** §4 says "video lanes draw no waveform". A video clip that has an audio stream draws a lane waveform on `180dd2e` too (identical on both builds), so this is not a regression. Correct the premise in the next task text if it matters.
- **Info:**
  - The `fader.clipgain-members.playing` harness rows start at max (after the earlier drags). C's probe starting at 0 dB gives per-move 2.758 and release 2, which is within ±2.
  - A browser loop wrap does not rebuild the graph (same as round 210). The rebuild path is covered by the Space restart and CP7/CP8.
