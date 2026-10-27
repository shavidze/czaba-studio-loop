# C round 210 — PERF-FADER-a re-dispatch (SABA-B-5 part 1) — verification

**Verdict: PASS.** `browserVerified = realVerified = true`. Every C row in the task ran in a real Chromium browser (Playwright, real mouse/keyboard) or as a real harness run. The gate rows (full vitest, typecheck, build, `npm run verify`, e2e smoke) belong to the root gate and are not claimed. One Low doc finding is open (C-R210-01, it does not block).

**Setup.**
- **Production builds, both served by C:**
  - current tree: `store/build` from perf run 2, on `:5190`;
  - baseline `f535ab3`: `git archive` into `c-round-210/baseline` with `node_modules` symlinked, `npm run build` exit 0 (`out/baseline-build.log`), served on `:5191`.
- **G210-3** used the root dev server on `:5173`.
- Probes are C's own, in `c-round-210/tools/` (`c210lib.cjs`, `c210probe.cjs`, `c210inv.cjs`, `c210vis.cjs`, `c210export.cjs`, `c210loop.cjs`, `c210pandelta.cjs`, `g210-3.cjs`). None imports `perf/`.
- **Perf ran alone:** both perf runs ran sequentially, with no build or browser running alongside.
- **Cleanup:**
  - The baseline tree and a scratch copy of the current tree were deleted after use. Recipe: `git archive f535ab3 | tar -x` (or the current-tree tar) plus a `node_modules` symlink.
  - The six exported WAVs (169 MB) were deleted after hashing. Hashes are in `out/export-wav-sha256.txt`; headers and sample stats are in `out/export-*.json`.

## Row table
| Row | Status | Evidence |
|---|---|---|
| **SCOPE-210** (start + end) | PASS | See "SCOPE-210 detail" below. |
| **PERF-RUN-210** | PASS | `out/perf-run{1,2}.{log,json}`. Both: exit 0, "1 passed (6.5m)", `complete: true`, 266 rows, 66 assert rows, `failures: []`. All 48 flipped rows are within budget in both runs: max 1, per-move 0.75 (track, group) / 0.792 and 0.742 (master) / 0.875 and 0.65 (pan), release 1. Deterministic medians: 0 differences between the runs. `restarts` = 0 on every playing row. `harness.move-window-live` [1,1,1] in both. The liveness asserts `.sync` / `.deferred` pass (31.3–31.4). |
| **WINDOW-210** | PASS | See "WINDOW-210" below. |
| **LIVE-DISPLAY-210** | PASS (data sampled at 25/50/75 %; a screenshot is kept only at 50 %) | Probe samples at 25/50/75 % of the second leg, both viewports. Slider value, `aria-valuetext`, readout text, `--studio-fader-fill` and the live AudioParam all agree. Track example: −25.5 dB → 0.0531 / fill 0.575; −12.0 → 0.2512 / 0.8; +0.0 → 1 / 1. After release the displays hold the end value; no sample snaps back. Mid-drag shots: `shots/cur-{1440,1280}-{track,master,pan,group}-mid.png`. |
| **AUDIO-210** | PASS ((a) and (c) at both viewports. (b): wraps restart sources into the existing graph, so the `resyncLoopRef` rebuild-at-wrap path was not exercised in the browser; it is covered by (c) Space and FP8) | See "AUDIO-210" below. |
| **GROUP-210** | PASS | Group 1 (Stems + SFX, 2 members), playing, start −12 dB, aborted at −3.0 dB with **pointercancel**, and separately with a **group-fader blur**, at both viewports. Members' live gains followed (ids 26 and 28: 0.0531 … 0.2512 …). After either abort: both members back to 0.2512, display −12.0 dB, 0 release commits, undo title unchanged. The baseline gives the same displays and labels. |
| **INVARIANTS-210** | PASS | See "INVARIANTS-210" below. |
| **EXPORT-210** | PASS (1440 only; the result does not depend on viewport) | See "EXPORT-210" below. |
| **VISUAL-210** | PASS | See "VISUAL-210" below. |
| **PAN-DELTA-210** | attempted at 1440 on both builds; not reachable by real input, so FP13 is relied on (an accepted outcome) | See "PAN-DELTA-210" below. |
| **DOC-210** | PASS (+ C-R210-01 Low) | See "DOC-210" below. |
| **AN-REVIEW-210** | PASS | See "AN-REVIEW-210" below. |
| **G210-3** | PASS | See "G210-3" below. |
| gate | gate | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke: not claimed by C. |

### SCOPE-210 detail
- **Start:**
  - HEAD `f535ab3`. `git status`: 12 M + 5 ??, all on the 20 grants or the 5 new files.
  - `sha256sum -c --quiet b-round-209-r210-tree-sha256.txt` returned rc 0 (1,030 frozen files).
- **gesture-guard:** the diff against `b-round-209/r210-granted-start/` is exactly one hunk (`@@ -444,7 +444,9 @@`), the D-29z183 line as three statements.
- **Other granted tests:** every edited hunk is on A's round-209 L23 table:
  - fader-click F3/F8/F9;
  - group-volume-db GV4/GV6;
  - master-ui (2 rows; `renderHook` + draft store);
  - track-group-mix-ui UM3;
  - track-volume-db TV4.
- **Unchanged:** context-hygiene, pending-status, meter-ui, fader-guards, fader-touch, fader-focus-order, track-pan and `perf/studio-lab.perf.spec.ts` are byte-identical to the start copies.
- **Budgets:** `budgets.json` against HEAD has exactly the 48 expected ids changed, and nothing else:
  - `record ≤3` → `assert ≤3`;
  - `record null` → `assert ≥1`.
- **End:**
  - `sha256sum -c` rc 0 again.
  - The tree fingerprint (diff + untracked hashes) is the same at start and end: `710318869d70…` (`out/tree-start.sha` = `out/tree-end.sha`).
  - Nothing changed during C's phase. The perf runs wrote only to ignored `build/` and `test-results/`.

### WINDOW-210
Production build, real mouse, the harness path (down at 50 %, 60 steps to 5 %, 60 steps to 95 %), 1440×900 and 1280×720, with identical numbers at both sizes. Files: `out/probe-cur-{1440,1280}.json`, plus `out/probe-base-1440.json` as the baseline.

**Harness replica** (no keyboard set-up; stored default, clamped), for comparison with perf ±2:

| fader | window commits | max | per-move | release commits | value changes | harness (perf JSON) |
|---|---|---|---|---|---|---|
| track stopped / playing | 90 / 90 | 1 / 1 | 0.75 / 0.75 | 1 / 1 | 89 / 89 | 1 / 0.75 / 1 ✓ |
| master stopped / playing | 95 / 89 | 1 / 1 | 0.792 / 0.742 | 1 / 1 | 94 / 88 | 1 / 0.792, 0.742 / 1 ✓ |
| pan stopped / playing | 105 / 78 | 1 / 1 | 0.875 / 0.65 | 1 / 1 | 104 / 77 | 1 / 0.875, 0.65 / 1 ✓ |
| group stopped / playing | 90 / 90 | 1 / 1 | 0.75 / 0.75 | 1 / 1 | 89 / 89 | 1 / 0.75 / 1 ✓ |

- Commits ≥ value changes in every drag: no thumb lag (D-29z184).
- Before-first-move commits: 0, with 0 components, in every drag (D-29z180).

**Below-max runs** (keyboard to −12 dB, master −6 dB, pan 20L first):

| run | window commits | result |
|---|---|---|
| track stopped | 104 | ≥ 100 ✓ |
| track playing | 104 | ≥ 100 ✓ |
| master playing | 101 | ≥ 100 ✓ |
| group playing | 104 | ≥ 100 ✓ |
| pan playing | 80 | the Pan exception applies: 80 commits ≥ 79 value changes ✓ |

Max 1 and per-move ≤ 0.867 in all of them.

**Baseline on the same probe:**
- max 83 / 85 / 80 / 4 per move (track / group / master / pan), the same as round 208;
- pan release commits 2.

So the probe measures what the harness measures.

### AUDIO-210
**(a) Drag while playing, no loop.** Every fader at both viewports:
- 0 source starts during the drag;
- the live gain equals the readout at every sample;
- after release, one history entry; Ctrl+Z restores the pre-drag gain:
  - track: Music 0.2512;
  - master: 0.5012;
  - group: both members 0.2512.

**(b) Loop wrap mid-drag.** A 1.000 s loop (00:00.750 – 00:01.750) was made from a waveform time selection and Ctrl+L, then played. Files: `out/loop-cur-{1440,1280}.json`, `shots/cur-1440-loop-made.png`.
- Track, master and group drags each spanned 6 wraps (one source start per wrap, every ~1000 ms).
- Each wrap creates only one new param, a per-source envelope written to 1. The track, master and member gain params persist, and the next write after each wrap continues from the dragged value (e.g. Music 0.1349 → 0.1274 across the wrap at 582 ms; master 0.5623 → 0.631).
- 0 jumps back to the stored value: 0 log-ratio jumps > 0.2 across all 18 wraps at 1280; the 1440 trace was inspected wrap by wrap.
- Window commits 104 / 101 / 104, max 1.
- Note: in the browser a wrap restarts sources into the existing graph, so the "graph rebuilt at wrap" path (`resyncLoopRef`) is covered by FP8 (jsdom). The browser rebuild path is (c).

**(c) Space mid-drag, mouse held, no blur.**
- The first Space at 25 % stops playback. The second, at the −4.8 dB point, restarts it.
- The rebuilt graph's Music gain is first written as **0.5754 = −4.8 dB** (the dragged value, not the stored 0.2512). Later moves write to the new param, up to 1.
- One source start. After release, one entry; Ctrl+Z gives 0.2512.
- The baseline does the same: Space toggles playback while the slider is focused, and its rebuild also writes 0.5754.
- The 87-component commit in that window is the play-state change, not a per-move commit.

### INVARIANTS-210
Script `tools/c210inv.cjs`, run identically on the baseline and current builds, for track, master, pan and group. It covers:
- keyboard ArrowDown×3 / ArrowUp;
- a held key with auto-repeat, then keyup and blur;
- Shift+drag fine (mid and after);
- a plain drag;
- Esc mid-drag;
- pointercancel and blur mid-drag (**pan cancel triggers included**);
- double-click reset (and blur);
- Ctrl+Z / Ctrl+Shift+Z labels;
- status text;
- the Pan reset button's text and `disabled` state.

Results:
- `out/inv-{base,cur}-{1440,1280}.json` (diff tool `tools/invdiff.cjs`): **771 values, 0 differences** at each viewport.
- Esc does not cancel a fader drag on either build (the value commits on release, "Undo: Volume"). There is no new cancel.
- The Pan reset button shows the draft while `disabled` follows the stored pan (e.g. `C`, disabled after redo to centre) on both builds.
- The status text does not change on a fader commit on either build.

### EXPORT-210
`out/export-cur-1440.json`, `out/export-base-1440.json`, `out/export-wav-sha256.txt`.

| session | how the mix was set | result |
|---|---|---|
| 1 | Plain drags from below max: Music −12 → **−21.9 dB**, Master −6 → **+3.0 dB** | WAV sha256 `53caf06f3bd9dd2f7657ed41a8e9a22bd16866f5837c4a2ac9db11211931667f` |
| 2 | Fresh session; keyboard only (219 and 6 presses) to −21.9 / +3.0 | the **same sha256: bit-identical** |
| control | defaults | `5fadd97a…`, different, so the mix is applied |

Integrity:
- PCM 24-bit stereo, 48 kHz, 4,864,896 frames = 101.352 s, no NaN, 99.77 % non-zero samples.
- Peak 0.1135 = −18.9 dBFS = −21.9 + 3.0 dB against the control's peak 1.0.
- The baseline build gives the same drag hash and the same control hash.

### VISUAL-210
- **States compared:** track Volume, Pan, Master and group Volume at rest, hover, focus and mouse-pressed, at both viewports, current against baseline (`out/vis-*.json`).
- **Computed style and boxes:** element style, row box, row children boxes and lane box. **1062 values, 0 differences** per viewport.
- **Thumbs:** Chromium returns no `::-webkit-slider-thumb` computed style, so the thumbs were compared by pixels. All **32 state crops** are pixel-identical between builds (`tools/pixdiff.cjs`; the full 1280 frame differs in 2 px with Δ6, which is meter anti-aliasing).
- **Keyboard ring:** checked separately with real keyboard modality on the current tree (`tools/focusprobe2.cjs`, `out/focus-kb.json`, `shots/focus-kb-*`): click the fader, then Shift+Tab and Tab. Track Volume, Pan, Master and Group Volume all show a 1 px brass outline (`rgb(201,164,106)/0.8`) with a 2 px offset at both viewports. Focused vs rest crops differ by 184–294 px. Programmatic `.focus()` after a Shift press matched `:focus-visible` but painted no ring on Pan, Master and Group, the same on both builds. That is a probe-method artefact, not a finding.
- **Classes:** the leaf moves the same class strings (`git diff` className lines are pairwise identical).

### PAN-DELTA-210
`tools/c210pandelta.cjs`, `out/pandelta-{base,cur}-1440.json`, both builds identical.
- **Attempt A:** hold the left button on Pan, move over a clip header, press the right button (CDP chord).
  - No second pointerdown fires (downs stays 1).
  - The chord cancels the fader gesture, and Pan returns to the stored value.
  - A later ArrowRight takes the pending path ("Pan — Music").
- **Attempt B:** hold the mouse on Pan, then CDP touchStart on the clip header.
  - A pointerdown fires with another pointerId. `claimPointerGesture` refuses it (different id), and ArrowRight is blocked ("Editing does not work while dragging").
- **Result:** the stolen-claim state cannot be reached with one mouse; a steal needs the same pointerId.
- **FP13 checked independently** in a scratch copy of the current tree:
  - FP13 and its file are green (40/40 with mix-draft-store and gesture-guard).
  - Mutant **M13** (the l.2799 guard `panGestureRef.current?.trackId !== trackId ||` removed) turns **FP13 red** on its assertion: "expected 0.32 to be undefined".
  - FP14a/b/c stay green under M13, as A reported.

### DOC-210
- **Doc 163:**
  - l.4 is B's exact Completed text.
  - l.16, l.18, the pass-sequence step 9, l.75 (determinism lists), l.84 and the TODO lines are fixed.
  - The new TODO line points to doc 165.
- **Doc 165:**
  - The status line is conditional, "In Progress (C round 210 check pending)" (L28).
  - Every cited id exists: FP1–FP13, FP14a/b/c, MD1–MD5. l.60 writes "FP1–FP14" as a range while the file names FP14a/b/c; acceptable under L26.
  - The D-29z186 delta is listed.
- **Notes:** the `harness.move-window-live` and `release-commits` notes match the asserts.
- **Open:** see C-R210-01.

### AN-REVIEW-210
- **Forbidden patterns:** no `any`, no `as` (any case), no `@ts-*`, no lint suppressions and no class selectors in the added lines.
- **Biome:** `biome check` (read-only) on the 10 changed or new app files reports no fixes.
- **Store:** unsubscribe removes the listener and drops empty key sets (MD4).
- **Unmount:** clears the pan draft and the override draft (`ArrangementContext.tsx` l.3605 / l.3613).
- **Tests read:** FP13 (fired events: pointerDown Pan → pointerDown clip header with the same id → change), FP14a/b/c (pointercancel, blur, `claimPointerGesture`, seeded at 10 steps so a restore differs from 0) and the extended FP9 (group keyboard pending path while playing, labels, no draft, `setTrackGain` per track, double-click reset to unity).
- **Gaps already disclosed by A (no fail):**
  - FP11 covers only the track Volume unmount;
  - in FP14a/b the draft is cleared by two writers.

### G210-3
`out/g210-3.json`, shots `shots/g210-3-*.png`.
- `/studio-lab` opens anonymously at 1440 and 1280: `auth_user` null, 0 cookies, demo badge shown, 0 forbidden requests, 0 Authorization headers.
- `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` and no workspace at 1440 and 1280.
- Token endpoint:
  - no header → 401;
  - fake Bearer → 500 "Unable to prepare Studio access" (no `:5199` mock), no Set-Cookie.
- **No token issued.**
- Note: the first attempt crashed inside the script (a `page.evaluate` read a null body during the LeadMagnet scroll step). The retry, identical, ran clean.

## Findings for B
- **C-R210-01 (low, docs; carry to `deferred_low_polish` or a one-line grant):** `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` l.68, l.69 and l.71 still describe `move-components-*` and `release-commits` as `record` and say "PERF-FADER-a will replace move-window-live". Since this round those are `assert` for the four faders, and the row survives. These lines were outside A's grant; A flagged them itself. The doc is the harness contract the gate reads, so fix it with the next owner of doc 163 (or root, at the L28 amendment).
- **Info:** while playing, C did **not** see a graph rebuild after pointerup or Ctrl+Z on a track drag in the production build (the same param ids 1/2/4/6/8 before and after). The harness `restarts` rows are 0 through the quiet window. Round 209's note came from the dev build; keep it as PERF-2+ material only if it is measured again.
- **Info:** Space and Esc pressed while a fader is held behave exactly as on the baseline:
  - Space toggles playback, and the rebuild uses the dragged value;
  - Esc is not a fader cancel.

  Unchanged by design (ESCAPE-CANCEL-GESTURE signal).
- **§4 meters:** checked (`tools/meterprobe.cjs`, `out/meters.json`, current tree, both viewports, playing). During a track drag the Music meter cover changes in 12 of 12 samples (0.82 → 0.25 as the gain rises), and so does the master meter. During a master drag the master cover goes 0.68 → 0.14. Silent tracks stay at 1. So meters still move during a drag. The master's peak readout number (−0.1) is a hold value and was the same on both builds.
- **A's architecture note** (two pan-draft writers, four `begin*Gesture` blocks): forwarded. It is a signal for the checkpoint after PERF-FADER-b, not a fail.
- Root pre-push notes: none new.

## Product / Ableton
- **CZABA requirement SABA-B-5 part 1** (fast track, group, master Volume and Pan drag): **met.**
  - Commit size is 1 component per move, against 80–85 before (Pan: 4 → 1).
  - 0 graph restarts during a drag.
  - Move-to-paint p95 is 1.7–3.8 ms (A and C runs agree).
  - The behaviour, labels and export are bit-identical to the baseline.

  Clip gain remains for PERF-FADER-b.
- **Ableton conformance:** not applicable (a performance round; behaviour unchanged by design, as INVARIANTS-210 shows).
