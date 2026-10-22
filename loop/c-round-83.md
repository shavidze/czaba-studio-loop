# C round 83: independent verification of SRW-18 stage 2 (clip volume envelope, R18-A2) and X1 (GATE82-S1)

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`.
- **Bugs:** one Low, C-R83-L1. A new point lands 1 px (25 ms at 40 px/s) left of the pointer's ruler time.
- **BLOCKED:** the fake-Bearer sub-check of G83-3, because the backend is unavailable in the cloud.
- **Gate rows** (full vitest, typecheck, build, Biome, verify, e2e smoke) are not claimed here.

## Environment
- `env-status.json`: store 200, round 83. Browser: Playwright Chromium (headless), anonymous fresh context, real `page.mouse` and keyboard.
- Both viewports were tested: **1440x900** and **1280x720**. Each session had one warm-up load.
- Media:
  - built-in demo sources (Middle East on music @0.35, `ღამის პულსი · პულსი` on stems @2–18, Soft impact on sfx @4);
  - owned synthetic `media/beeps-6s-h264-aac.mp4`. It was loaded for EN-MODE in r1 and stayed loaded (muted) for the rest of r1, which is why r1 shows `Undo: Mute — ვიდეო`. No oracle depends on it; r2 and r3 ran without video.
  - Nothing was uploaded.
- Files:
  - scripts in `c-round-83/tools/` (`lib83`, `r1` DOM, `r2` export, `r3` meters, `g83`, `tok`);
  - raw results in `c-round-83/*.json` (meter samples in `r3-raw-*`);
  - screenshots in `c-round-83/shots/`;
  - WAVs were deleted after analysis.

## Source unchanged (start = end)
- HEAD is `bdc2067` at start and end. `git status` shows **8 M + 5 ??**.
- Frozen list: 471/471 OK.
- The 13 owned files and 4 protected files match A's `end-hashes.txt` at start and at end (`sha256sum -c` OK).
- Grants checked:
  - `ArrangementContext.tsx` has +2 lines: the import and `clipEnvelopes: clipEnvelopeShapes(arrangement),`;
  - `renderArrangementWav` has both `clipFades:` and `clipEnvelopes:` lines;
  - doc 072 l.4 is exactly the required line, with +3 added lines;
  - doc 073 status is `Round 83 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z48)`.
- **T83-TARGETED:**
  - re-run of A's 64-file list: **64/64 files, 1140/1140 tests** (`c-round-83/vitest-targeted.txt`);
  - a grep confirmed the list covers every test that imports graph.client, clipboard, ArrangementClip, ArrangementLane, StudioWorkspace or envelope.

## Acceptance (both viewports, identical results unless noted)

Note: double-clicks at ruler 6, 10 and 14 s gave the actual points **5.975 / 9.975 / 13.975** (see C-R83-L1). Every oracle uses these actual values, as the task requires.

| ID | Result | Evidence |
|---|---|---|
| EN-MODE | PASS | Button → `on`, `a` → `off`, `a` → `on`, button → `off`. Each time `aria-pressed`, `data-envelope-mode`, the exact title, `aria-keyshortcuts="A"` and the exact status flip together. Shift+a, Alt+a, a repeated `a` and `a` typed in a text input do not toggle. In mode, music, stems and sfx all have an editor and the line, with 0 fade handles. The video clip has no editor or line, and a folded stems lane has none (it returns when unfolded). Grid row `scrollWidth ≤ clientWidth` (223/223) for all 7 seconds divisions and, at tempo 120, all 18 divisions including triplets (`EN-MODE-GRIDFIT`). Screenshots `en-mode-{on,video,folded}`, `en-gridfit`. |
| EN-ADD | PASS | 3 double-clicks → `5.975:1.0000;9.975:1.0000;13.975:1.0000`, each with status `Envelope: წერტილი დაემატა — t წმ · 0.0 dB.` and undo `Envelope: წერტილის დამატება`. Position stayed 00:00.000 and no range was created. Ctrl+Z ×3 gives `""` with the earlier undo title, so there are exactly 3 entries; Ctrl+Y ×3 restores. |
| EN-DRAG | PASS | Middle point → `0.2512` (−12.0 dB). During the drag the status is `Envelope: 9.975 წმ · −12.0 dB`; after it the same with a period, plus one entry. Limits: right gives 13.974, left gives 5.976 (1 ms short of the neighbours), top gives 1.0000, bottom gives 0.0000 with `−∞ dB` in status and title. A drag that returns to its start writes `ცვლილება არ მოხდა`, with no entry. |
| EN-DRAWN | PASS | The polyline vertex `0.7488` sits at screen y = body.top + 0.7488·h (Δ 0 px); the point centre Δ is 0.0025 px. With the mode off the identical line is drawn, with 0 points and no editor. `en-drawn-{on,off}`, `en-drag-bottom`. |
| EN-EXPORT (R18-A2) | PASS | 24-bit / 48 kHz stereo, same frame count as the ref (4,881,696). Over [5.975, 13.975] with \|ref\| > 1e-3: 550,766 samples, 0 out of tolerance, max \|x/ref − env\| = 1.1e-4. Over [2, 5.975] and [13.975, 18] the ratio is exactly 1 (max error 0). Silence outside the clip. |
| EN-LIVE (paired) | PASS* | Plateau points `5.975:1;6.975:0.2512;12.975:0.2512;13.975:1`. Control: Ctrl+Z ×6 → `""`. Paired linear-mean stems meter: 1440 gives −11.79 dB at [9,11] and +0.14 at [15,16.5]; 1280 gives −11.85 / +0.15. Before the first point: +0.15 / +0.04. *Run 1440-a used ±0.1 s medians and failed (−5.7 / +6.3), because pulse content varied up to 8 dB inside that window. Its raw samples were not saved, so it counts as one failed measurement. The valid measurements are 1440-b and 1280-a, one per viewport. The tolerances were unchanged. The windows come from the plateau geometry, not from the result (`EN-LIVE-narrow` keeps the narrow values). |
| EN-MIDSTART (paired) | PASS | Seek to 10.000 and play: at ≈10.3 s envelope minus control is −12.0 dB (3/3 runs). Playback did not start at 0 dB. |
| EN-EDITS a–g | PASS | (a) move +1 s: all times +1. (b) to sfx @7: times +5. (c) Ctrl+D @18: +16. (d) Ctrl+C/V @18.5: +16.5; every result restored exactly by Ctrl+Z. (e) Split at 9.975: left `5.975:1.0000;9.975:0.2512`, right `9.975:0.2512;13.975:1.0000`. The split export equals the pre-split export with max sample difference **0** over [2, 18.2], excluding ±1 ms. (f) Trim start to 8: `9.975:0.2512;13.975:1.0000`. That export equals V over (8, 18] (max 1.2e-7), is zero before 8, and the ratio to ref at 8 matches env(8) = 0.6209 (max error 3.8e-5). Trim back → 3 points. (g) Delete 8–9: left `5.975:1.0000`, right `9.975:0.2512;13.975:1.0000`. That export equals V outside [8, 9] (1.2e-7) and is zero inside. |
| EN-UNDO | PASS | A still press on a point changes nothing (no entry). A double-click deletes point 1: one entry `Envelope: წერტილის წაშლა`, status `… 5.975 წმ.`, 2 points left, none added. Ctrl+Z / Ctrl+Y restore the exact strings. Undo ×4 walks drag → add → add → add → `""`, and Redo ×4 returns to V. A Playwright double-click right after a drag of the same point (the page saw 1 dblclick on the point) is ignored by the guard. |
| EN-MULTIPLY | PASS | Fade-in 1 s + Clip Gain −6 dB + V. Over [2, 3] the ratio is 0.5012·(t−2)·env: 68,826 samples, max error 7.7e-5. Over [3, 13.975], 0.5012·env: 757,350 samples, max error 8.5e-5. The tail is 0.5012: max error 8.1e-5. |
| EN-PLAY-EDIT | PASS | Point dragged at 5.3–6.1 s during playback. Position stays monotonic and advances 2.319 s against a 2.32 s wall clock. No console error, one `Envelope: წერტილის გადატანა` entry, and Ctrl+Z restores the exact string. Signal: 6 source restarts during one drag. |
| EN-NEIGHBOURS | PASS | Mode on: a body click does not seek, a body drag makes no range, the left-edge element is the trim strip (`z-20 w-2`), header move +1 s shifts the points +1, and trim +1 s keeps the points. Mode off: range 6–8, click-seek 10.000, trim strip, header move and fade-handle drag (`Fade In`, 1.000) all behave as before. The line stays and there are no points. |
| X1-DBLCLICK | PASS | Fade-in drag +5 px → 0.125. A single click 6 ms later produced **0 dblclick events** and the fade stayed (one entry). With a dispatched clickCount=2 pair 24 ms after the next drag, the page saw 1 `dblclick` on the fade-in handle, the fade stayed at 0.250, and Ctrl+Z → 0.125 (one entry). After 1 s a real double-click resets to 0.000 with status `Fade In: 0.000 წმ.` (FD-UNDO), and Ctrl+Z → 0.250. |
| REG-HYD | PASS | Every session (r1, r2, r3 at both viewports) had no hydration or `useLayoutEffect` warning and no non-noise error. No token, R2 or download request; 0 auth headers. |
| G83-3 | PASS (sub-check BLOCKED) | `/studio/middle-east` anonymous shows "Sign in required" with 0 workspaces. `/api/studio-token?product=…&file=…` anonymous returns **401** "Please sign in". The header link `Studio Lab Demo` opens `/studio-lab` with the demo badge. 0 forbidden requests. Fake Bearer → 500 (backend unavailable) = **BLOCKED**. |
| T83-TARGETED | PASS | 64/64 files, 1140 tests. |
| SOURCE-UNCHANGED | PASS | See above. |

## Bug for B
- **C-R83-L1 (Low):** a double-click at ruler time T adds the point at T − 1 px/pxPerSecond (5.975 for 6.000).
  - Cause: `handleEditorDoubleClick` measures from the body's left edge, which is 1 px inside the clip root because of the border.
  - Effect: the point is drawn at the ruler x for T while it stores and plays T − 25 ms (at 40 px/s; 100 ms at 10 px/s).
  - Severity is Low, not Medium: the offset is 1 px, below what a pointer can place on purpose, and depends on zoom. Points are placed free by spec, and no data is lost. It does happen on every add.
  - It does not break an acceptance oracle. It is a contract deviation (E7, "at the pointer's timeline time") and a precision issue in an editing tool.
  - Evidence: `EN-ADD-OFFSET` and `EN-DRAWN dx = −1 px` in `r1-*.json`.

## Signals (not bugs)
- **EN-LIVE oracle:** use wide paired windows on pulse material; ±0.1 s medians are not valid.
- **Live rescheduling:** a point drag during playback restarts sources on each preview (6 per drag). It is audible-risk only and was not measured as a glitch.
- **X1 trigger:** Chromium sends no `dblclick` for an unpaired click after a drag. A human click pair was not tested. The guard works when `dblclick` arrives.
- **Sticky header:** the reviewer's overlap was not reproduced. The header stays on top after a 330 px horizontal scroll.
- **1280 layout shift:** at 1280x720 the lane shifts 9 px when a range is selected. Its origin was not checked against `bdc2067`.

## Ableton match (separate from CZABA requirements; sources from the task §4, Live 12 manual text captured by B)
| Behaviour | Status |
|---|---|
| `A` toggles the envelope mode; fade controls are hidden in the mode | Confirmed: same key and same hiding (§42.7, §6.8) |
| Envelope visible with the mode off; clip-owned absolute volume envelope in Arrangement | Conscious difference (FB-06) |
| Add a point by double-click at the line value; delete by double-click | Conscious difference (Live: click on a segment / double-click off it adds; click on a breakpoint deletes) |
| Drag moves a point; value shown while dragging | Confirmed (status + title) |
| Clamp 1 ms from the neighbours instead of removing them; no grid snap; no Shift/Alt modifiers | Conscious difference |
| Envelope moves with the clip; edit commands carry it | Confirmed by behaviour (a–e, g) |
| Envelope under trim (non-destructive, source-anchored) | Unconfirmed in Live (no source); CZABA behaviour verified |
| Linear-in-amplitude interpolation | Unconfirmed in Live (no source); CZABA behaviour verified in export |

## Next for B
- Mark SRW-18 stage 2 C-verified at both viewports.
- Put C-R83-L1 into the Lows batch, together with A's L1 line-width drift.
- Keep the 6-restarts-per-drag signal for the SRW-18 keyboard or performance follow-up.
- Root gate rows remain with root.
