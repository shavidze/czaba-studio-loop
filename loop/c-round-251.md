# C round 251: independent verification of the SABA-B-10a stage 2a fix-up

**Verdict: PASS.** `browserVerified` = `realVerified` = **true**.

- Every runnable row passed at 1440×900 and 1280×720, with a fresh context per row and no credentials.
- One row is BLOCKED: the purchased origin (backend unavailable in cloud).
- One open finding, A-R251-REVIEW-IM22-PLAYING (Medium, test strength). It is not a product failure and does not flip the verdict (see §3).
- **Environment:** `env-status.json` {round 251, store 200}; Chromium from Playwright; dev server `:5173` (the working tree).
- **Harness:** `c-round-251/c251.cjs`, my own fork of the c250 helpers. It also flags console hydration warnings; there were 0.

## 1. Rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-251 | PASS | <ul><li>HEAD `dcb7eb1`.</li><li>Exactly 17 `M` paths and nothing untracked.</li><li>The frozen list (1,102 files), the root list and `expected-final-sha256` all give rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li></ul>Evidence: `c-round-251/scope.log` |
| C-UNIT-251 | PASS | <ul><li>Run alone: 123 files, **1,843/1,843**, rc 0.</li><li>IM15, IM17, IM20, IM22, IM23, R9-L1 and ST49 pass.</li><li>The slowest tests were CP12a–d at 6.1–6.7 s against 30 s.</li></ul>Evidence: `c-round-251/covering.json` |
| C-MUT-251 | PASS | <ul><li>My own scratch `/tmp/c251-scratch`, built from the current tree and checked against `expected-final` (rc 0).</li><li>The 10 runs match B's §0.2 table exactly. R9-L1 appears in the summary under its full title.</li><li>The repo `git status` was identical before and after.</li></ul>Evidence: `c-round-251/mutants/logs/summary.txt`, `status-before.txt`, `status-after.txt` |
| C-CAPTION-251 | PASS | <ul><li>**Stopped, both viewports:** the line reads `Active track: SFX · insert marker 00:03.000` (the stop point was 4.491), Add lands at `sfx@3.000`, and the status is `“Soft impact” added to the SFX track at 00:03.000.`</li><li>**Playing (playhead about 3.95):** the line is the same, Add lands at `sfx@3.000`, and playback continues.</li><li>**Control** (the round-251 start state on `:5174`, built from `r251-granted-start`, sha rc 0): the line reads `· playhead 00:04.483`/`00:04.491` when stopped and `· playhead 00:03.960`/`00:03.951` while playing, but Add lands at 3.000. This reproduces C-R250-01; the fix removes it.</li></ul>Evidence: `fix/c251.json`, `control/c251.json`, `fix/caption-*.png` |
| C-CAPTION-MOVE-251 | PASS (both viewports) | <ul><li>Ruler click at 6 → `00:06.000`.</li><li>Space, then a ruler click at 9 while playing → `00:09.000`, and playback continues.</li><li>10 samples over 1 s: the line stays `00:09.000` while the playhead advances from 7.99 to 8.93. The check is not vacuous.</li><li>After Stop at 9.041, Ctrl+Shift+Space → `00:09.041`, which equals the marker.</li><li>Home → `00:00.000`.</li></ul> |
| C-CAPTION-WIDE-251 | PASS | <ul><li>With the Video lane active, the line is `… Video (audio is not added here) · insert marker 00:03.000`.</li><li>2 lines; the last text rect's bottom is 616, inside the `<p>` bottom of 617.</li><li>sw = cw = 264, sh = ch = 32, library width 288.</li><li>The control is also 2 lines.</li><li>Add is disabled.</li></ul> |
| C-ADD-251 | PASS | <ul><li>Enter on the focused row: the line shows `00:03.000` and the clip lands at `sfx@3.000`. The stop point was greater than 4.</li><li>Double-click: the line shows `00:04.000` and the clip lands at `sfx@4.000`. The stop point was greater than 5.</li><li>Both go to the active track.</li></ul> |
| C-PASTE-SPLIT-251 (1440) | PASS | <ul><li>**Paste:** `sfx@2.000` when stopped and when playing.</li><li>**Paste, exported WAV:** 18 s long. Measured against the smoke WAV shifted by exactly 2 s, the alignment is offset 0 with **SNR 123.5 dB**, so the paste is sample-exact.</li><li>**Split:** `Clip split at 00:05.000.` both stopped and playing.</li><li>**Split, exported WAV:** its sha equals the unsplit sha, and it has 0 NaN samples.</li><li>**Split while playing:** playback continues, with RMS 0.093.</li></ul> |
| C-BUDGET-251 | PASS | 85/101 at 1440 and 69/85 at 1280, equal to round 250. |
| C-LESSON-251 | PASS | L29 contains `C-R250-01` and `app/**`, and `lessons.md` is 57 lines. |
| AN-REVIEW-251 | PASS | <ul><li>l.4 is byte-exact (od).</li><li>The 7 headings are in order.</li><li>D-29z445 and both rejected alternatives are there (l.100–117).</li><li>IM1–IM23 all exist.</li><li>The TODO lists REGRESSION, stage 2b with B-R251-PASTEND-AT-END, 10b with the sheet `marker` copy, SABA-B-9 and the Saba questions.</li></ul> |
| LAB-SMOKE-251 | PASS | <ul><li>Space plays and stops; Space again plays from the marker.</li><li>The WAV sha256 is `1fea093b…3f94` (expected): 48 kHz, 24-bit, stereo, 16.000 s, 0 NaN, peak 0.297.</li><li>0 page errors.</li></ul> |
| Auth | PASS | <ul><li>A fresh context opens `/studio-lab` anonymously, with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401; a fake bearer token is not 200.</li><li>Premium auth is not bypassed.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate rows | gate | Full vitest, typecheck, lint, build, `verify` and e2e smoke. Gate 251's `verify.log` decides EXPORT-PROGRESS-LOAD-FLAKE-250. |

**Neighbour behaviour (§6), all PASS at both viewports:**
- A library drag-and-drop still lands at the drop point (`sfx@9.000`), not at the marker (3).
- The line's `title` is `Active track: SFX`, with no time.
- While playing, the transport clock, the ruler handle, the timeline playhead line and the Overview playhead all advance. The library line stays at `00:03.000`. The detail-panel playhead is not rendered without a selected clip, so it was not compared.

**Invalid attempts (kept):**
- `nDrop@1280` attempt 1 failed because of my harness: the Soft impact row was off-screen at 720 px. Evidence: `fix/ndrop-over-1280x720-invalid-attempt1.png`. It was re-run with scroll-into-view and passed.
- The control's first cold load timed out after 150 s (`control-run1.log`), the same class as A's and B's timeouts; it was re-run.

## 2. Ableton parity (separate from the CZABA result)
- **Confirmed:** Enter or double-click in the browser adds to the selected track (Live 12 manual 4.10). CZABA matches.
- **Inference:** the time position is the insert marker (6.9); 4.10 says nothing about position.
- **Not applicable:** the readout beside Add. Live has none; it is a CZABA addition.

A test PASS here does not prove parity beyond these points.

## 3. Findings for B
- **A-R251-REVIEW-IM22-PLAYING (Medium as the reviewer rated it; test strength, not product). Confirmed by reading the code:**
  - `insert-marker-ui.test.tsx` l.150 stubs `requestAnimationFrame`, so in the playing branch (l.559–563) the position store stays at 3, which equals the marker.
  - The class is still killed: MU-CAPTION-POSITION is red on IM22 (stopped) and R9-L1 in my run.
  - The real-browser C-CAPTION-MOVE-251 covers the playing case without that gap.
  - It does not flip the verdict. Fix proposal: A's §5 (write the live position into the position store before l.563).
- No new product bug.
- Info: the Video-lane line uses its whole 2-line box (the last rect is 1 px from the bottom). A longer lane name, or a longer time such as `10:00.000`, would clamp the time. This is already recorded as info under D-29z445.

## 4. Side effects
- No app edits.
- Scratch `/tmp/c251-scratch` and control `/tmp/c251-control` are outside the repo. The control server on `:5174` is stopped.
- I re-checked the repo after all browser work, at 17:24Z (`c-round-251/scope.log`):
  - HEAD is `dcb7eb1`;
  - the status is the same 17 `M` paths;
  - the tree, root and final hash lists all give rc 0;
  - only the `:5173` vite dev server is running.
