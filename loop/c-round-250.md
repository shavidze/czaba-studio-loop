# C round 250: SABA-B-10a stage 2a (edit commands at the Insert Marker)

Written 2026-10-29 by C. HEAD `dcb7eb1`, unchanged. Real Chromium (Playwright) on `http://127.0.0.1:5173/studio-lab`, both 1440×900 and 1280×720, a fresh context per row. Evidence folder: `c-round-250/`.

## Verdict: **FAIL** (one Medium regression caused by this round, C-R250-01). browserVerified = realVerified = true.

Every §5 row that can run in the cloud ran at both viewports and met its criterion. The round still fails because of a product defect outside the listed rows. The library panel line directly above **+ Add** still reads `Active track: SFX · playhead 00:04.491`. Since this round, Add places the sound at the Insert Marker (3.000). At HEAD the two agreed (4.491 = 4.491).

On precedent: round 249 passed with two Medium findings, but both were test-only. Round 202 failed on a user-visible Medium regression (C-R202-01). This finding is user-visible, so it follows round 202. Under §7, the next step is a fix-up on the same feature.

## Bugs for B

### C-R250-01 — Medium (regression caused by this round): the library Add caption shows the playhead, but Add now places at the Insert Marker
- **Steps** (both viewports, `/studio-lab`, add `demo-stem-pulse`):
  1. Click the SFX lane at 3 s.
  2. Press Space, wait 1.5 s, press Space.
  3. Click the `Soft impact` library row.
  4. Read the line above Preview / + Add.
  5. Click **+ Add**.
- **Expected:** the time shown next to Add is where Add places the sound. This round's own copy says so: the `?` sheet row `add-sound` reads "Add the selected sound at the insert marker". Otherwise the line must not name a time that Add ignores.
- **Actual:** the caption reads `Active track: SFX · playhead 00:04.491`, but the clip lands at `sfx@3.000` with the status `“Soft impact” added to the SFX track at 00:03.000.` (1440 and 1280).
  - HEAD control (`out-head`, addStopped) gives caption 4.491 and add 4.491, so they agree.
  - The Insert Marker is invisible until SABA-B-10b, so this caption is the only time readout near Add, and it is wrong after every Stop.
- **Evidence:**
  - `c-round-250/caption/caption-fix.json`;
  - `caption-before-add-{1440x900,1280x720}.png` and `caption-after-add-*.png`;
  - script `caption/caption.cjs`;
  - HEAD values in `out-head/c250.json` (addStopped).
- **Source:** `app/components/arrangement/ArrangementLibraryPreview.tsx:285`, the literal `· playhead <LibraryPlayheadTextMemo />`. The text is written per frame from `positionStore`, but the add point is `insertMarkerRef` / `insertMarkerStore` (`ArrangementContext.tsx`). This is not a one-token swap.
- **Not already sequenced:** B-R250-PLAYHEAD-TITLES (backlog) covers only `rulerTitle` and `rangeBodyTitle`. `current-task.md` has 0 hits for `library-playhead|Active track|ArrangementLibraryPreview`.
- **Same class elsewhere:** a scan of `app/components/arrangement/*.tsx` for position words in user-visible literals (outside `strings.ts`) found only this one. The other `playhead` hits are DOM refs or style writers (DetailPanel, Overview), plus `ArrangementRuler.tsx:216` (`playheadTitle`, the handle title, which is correct).
- **Fix-up grants B will need:**
  - `ArrangementLibraryPreview.tsx`;
  - `app/lib/arrangement/__tests__/library-preview.test.tsx`, `render-budget.test.tsx` and `studio-theme-obsidian.test.tsx` (all three reference `arrangement-library-playhead`);
  - render-budget: the caption is a per-frame writer, so check the no-rerender contract.
- **Why we missed it (for B):** B's §0.3 copy inventory grepped `playhead` in `app/lib/arrangement/strings.ts` only. This literal is inline JSX in a component. An L29/L23 copy sweep must run over `app/**`, not one strings file.

### A-R250-REVIEW-PASTE-SPLIT-PLAYING — Medium (test strength; confirmed independently by C)
- C mutant **C-MU-PASTE-SPLIT-LOCATOR**: paste and both no-range split branches read `isPlaying ? livePosition() : insertMarker` (the M rule). Result on the 6 granted test files: **0 red** (`mutants/logs/summary.txt`).
- The product is correct in the browser at both viewports:
  - paste while playing lands at `sfx@2.000` (`out/c250.json` paste.pastePlaying);
  - split while playing lands at `music@5.000` (splitPlaying).
- Needed: a playing branch in IM15 and IM17.

### Reviewer Lows (A's code-reviewer), for `deferred_low_polish`
- **A-R250-REVIEW-SHEET-MARKER-COPY (Low).** The sheet row `marker` reads "Add a marker at the insert marker", while `addTitle` names all three cases. C saw both texts in the browser (`titles`, `out/sheet-*.png`). This is exactly the §1.3 text, so it is a B copy decision, not an A defect.
- **IM18 has no selection-start-wins case; IM20 has no `preventDefault` or `metaKey` assert (Low).** These were reported by A's reviewer. C did not mutate them independently.

## Handoff: A's L11 STOP (export-progress flake), B rules
- A's only red result (2 rows of `export-progress-ui.test.tsx`) came from a covering run under concurrent load.
- A's three isolated reruns were green, and A's second covering run was 1841/1841.
- **C's covering run alone: 123 files, 1841/1841, rc 0** (`c-round-250/covering.json`).
- The diff touches no encoder or timer code.
- C does not rule on this. B decides whether a flake task is needed, because a loaded gate run is at risk.

## Acceptance (§5)
| Row | Result | Evidence (both viewports unless noted) |
|---|---|---|
| C-SCOPE-250 | **PASS** | <ul><li>HEAD `dcb7eb1`; status is exactly the 13 `M` grants.</li><li>Frozen list (1,097) `sha256sum -c` rc 0; root list rc 0; the 7 protected files have `git diff --quiet` rc 0.</li><li>`git diff HEAD -- app` sha256 `928c4950…5fe2811` = the precheck diff, and file-by-file `cmp` is identical (`app-diff.txt`).</li><li>Re-checked after all runs: still 13 M, tree rc 0.</li></ul> |
| C-UNIT-250 | **PASS** | 123 files, 1841/1841. IM1–IM21, BR4b, BR8, BR13, ST6/10/11/12/28, NS1, MS1 and the D-27 row all passed. Slowest IM row: IM7 951 ms of 15 s. |
| C-MUT-250 | **PASS** | <ul><li>The 17 scripted runs give exactly the §0.2 red rows.</li><li>MU-HEAD (by hand) gives IM15 IM16 IM17 IM18 IM20 MS1 NS1 ST10 ST11 ST28 ST6, 11/133 failed = §0.2.</li><li>Repo status is identical before and after (`mutants/status-*.txt`).</li><li>Extra run C-MU-PASTE-SPLIT-LOCATOR: none red (the gap above).</li></ul> |
| C-PASTE-250 | **PASS** | <ul><li>After the stop (ph 3.491 / 3.483, marker 2.000): new clip `sfx@2.000`, status `Paste (1): at 00:02.000 · on the SFX track.`</li><li>**Audio:** the export WAV is 18.000 s (864,000 frames). Its residual against the 16 s reference shifted by +2.000 s gives an SNR of 123.5 dB at 0-sample offset, so the paste is sample-exact.</li><li>Info: paste while playing (ph 3.48) lands at `sfx@2.000` and playback continues.</li><li>HEAD control: 3.483 (playing: 2.960).</li></ul> |
| C-SPLIT-250 | **PASS** | <ul><li>Stopped (ph 6.491): `music@0.000` + `music@5.000`, status `Clip split at 00:05.000.`, Undo title `Undo: Split (Ctrl+Z)`.</li><li>The split export WAV sha is **identical** to the unsplit one (`1fea093b…`).</li><li>Playing: split at 5.000; still playing at 7.51 s with RMS 0.126.</li><li>HEAD: 6.491.</li></ul> |
| C-SPLIT-REFUSAL-250 | **PASS** | The exact `splitNeedsTarget` text. Box h 16 px (line-height 16, font 12 px), 1 line, sw = cw 1416 / 1256. Clips unchanged. The raw `out/c250.json` flag `pass:false` is a C script error: it compared font-size with "16 px", where §5 means the line height. Measured values are as stated here. |
| C-ADD-250 | **PASS** | <ul><li>Stopped (ph 4.491): `sfx@3.000`, `“Soft impact” added to the SFX track at 00:03.000.`</li><li>Playing (ph 4.47 / 4.48): `sfx@3.000`, still playing (5.362).</li><li>HEAD: 4.491.</li><li>See C-R250-01 for the caption.</li></ul> |
| C-M-250 | **PASS** | <ul><li>The first flag is `00:02.000` (after a stop at 3.483 / 3.491).</li><li>While playing, the second flag is `00:03.172` / `00:03.169` and playback continues.</li><li>The name editor opened (`arrangement-marker-name-input`).</li><li>HEAD: 3.491 / 3.483.</li></ul> |
| C-PASTEND-250 | **PASS** | <ul><li>Space gives the exact `Insert marker (00:18.000) is past … Home returns to 0.`; Shift+Space gives `Playhead (00:18.000) …`; the strip click gives `Insert marker (00:18.000) …`. No playback.</li><li>A strip click at x = 17.5 s read 18.000. That is likely Snap (grid 1/2 at 120 BPM = 1 s), not confirmed. The subject flipped from Playhead to Insert marker, so the strip's `playFrom` wrote it.</li><li>HEAD: `Playhead` for all three.</li></ul> |
| C-GESTURE-250 | **PASS** | <ul><li>Mid-drag and after pointerup: marker `2.000`, playhead = the stop point (3.491 / 3.483), range present.</li><li>`document.activeElement` is the same before and after the keys (BODY; nothing was focused before the drag).</li><li>HEAD: marker 0.000, ph 0, range lost.</li></ul> |
| C-CMD-250 | **PASS** | CDP Meta+Shift+Space moves the marker to 3.491 / 3.483 with the exact status `Insert marker moved to the playhead (00:03.491). Space plays from here.` A real Mac stays on TLM-R249-MAC-CMD-SHIFT-SPACE. |
| C-KEYS-250 | **PASS** | <ul><li>In the BPM field and the library search, the 4 chords cause no playback; the marker stays 2.000 and the playhead 3.483.</li><li>Info: plain and Shift+Space type spaces into the fields (`120  `), as text input.</li></ul> |
| C-TITLES-250 | **PASS** | <ul><li>Split title `Split at the insert marker (Ctrl+E)`; marker Add title exact §1.3.</li><li>Sheet rows split / marker / add-sound are 20 / 20 / 40 px, 0 overflow.</li></ul> |
| C-STATUS-BOX-250 | **PASS** | The past-end Space text and `splitNeedsTarget`: h 16, 1 line, sw = cw (1416 / 1256), no overlap with the transport. |
| C-BUDGET-250 | **PASS** | Persistent lines: empty 85 / 69, demo 101 / 85, = round 249. |
| C-HANDLE-RANGE-250 | **PASS** | A clip drag 5→7 s makes a range (marker stays 0.000). Focus the handle and press →: range gone, marker 0.100, playhead 0.1. |
| AN-REVIEW-250 | **PASS** | <ul><li>l.4 is byte-exact `**სტატუსი:** In Progress (stage 2 of 3; C round 250 PASS)`.</li><li>The 7 TEMPLATE headings are in order (l.7…272).</li><li>D-29z436/437/438 are present; the rejected alternatives (incl. the generic "Start point") are there.</li><li>All cited ids exist (IM1–21, BR4b/8/13, ST6/10/11/12/28, NS1, MS1).</li><li>The TODO lists 2b, 10b, 9 and the Saba questions (d)/(e).</li></ul> |
| LAB-SMOKE-250 | **PASS** | <ul><li>Loads. Space plays (RMS 0.0013) and stops (position stable); Space again starts at 0.2 (from marker 0).</li><li>Export WAV sha256 `1fea093b…3f94`: 48 kHz / 24-bit / 2 ch, 16.000 s, peak 0.2967, 0 NaN.</li><li>0 page errors.</li></ul> |
| Auth | **PASS** | <ul><li>Fresh context, 0 cookies: `/studio-lab` workspace with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401. A fake Bearer returns 500 "Unable to prepare Studio access", the same as round 249 (no backend), never 200.</li></ul> |
| Purchased origin | **BLOCKED** | Backend unavailable in the cloud. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke are not claimed. |

**Neighbours (§6):**
- **Library drag-drop:** lands at the drop point, `sfx@9.000`, 4/4 in `drop/`. Run 1 at 1280 missed because the C harness pressed an off-screen row; that invalid attempt is kept in `out/c250.json` nDrop@1280.
- **Double-click on a library row:** adds at the marker, `sfx@4.000` (stop at 5.491).
- **Range split:** 3 clips, `Undo: Split at time selection (Ctrl+Z)`.
- **M on an existing marker time:** focuses the flag, with "A marker already exists at this time: “Marker 1”".
- **Ctrl+→ while stopped** (marker 1, ph 2.491): goes to 3.000. This cannot tell the playhead from the marker as origin; stage 2b.
- 0 page errors in every row.

**HEAD control:** `git archive dcb7eb1` on :5174, with its own `.vite`; stopped and removed after use. Attempt 1 of the first paste row timed out on cold load (kept: `out-head/c250-attempt1.json`) and was re-run.

## Ableton parity (separate from the CZABA verdict)
Checked against the capture `b-round-71/ableton-arrangement-view-20261021.txt` (Live 12 manual ch. 6).

| Behaviour | Status | Source |
|---|---|---|
| Split | **Confirmed** | 6.12, verbatim: "click anywhere within a clip’s waveform … Ctrl+E … to divide the clip at that location". CZABA splits at the click point (the marker), stopped and playing. |
| M stopped | **Confirmed** | 6.4, verbatim: "while transport is not running, a locator will be added at the insert marker location or at the start of the time selection". |
| M playing | **Deliberate deviation** (SABA-Q-10A-DEVIATIONS (d)) | Verbatim: "in real time during playback … Locators are quantized according to the global launch quantization value"; CZABA does not quantize. |
| Paste | Inference | No manual sentence. 6.9 "selects a point in time, represented by a flashing insert marker" is in the capture. |
| Add from the browser | Unconfirmed | No reference. |
| Past-end text, gesture keys | Not applicable | — |

A test PASS does not prove parity.

## Exact next C checks (fix-up)
1. C-R250-01, both viewports, after a Stop and while playing:
   - the line by Add names the point where Add lands (or names no time);
   - Add lands there;
   - the render-budget contract holds.
2. Re-run C-ADD-250, nDblAdd and LAB-SMOKE.
