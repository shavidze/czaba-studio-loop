# C — Round 139 verification (VISUAL-A V-0.4b: track lane and track header texts in English)

Verdict: **PASS**. `browserVerified` = `realVerified` = true. Every browser row ran in real Playwright Chromium at 1440×900 and 1280×720, with a fresh context per session, on `http://127.0.0.1:5173/studio-lab`. Snap was off at the start of every session (`data-snap=off`).
Two new **Low** findings, both pre-existing (they go to `deferred_low_polish`). No Critical, High or Medium findings.
Env: `env-status.json` round 139, store 200. App source was read-only and unchanged during C's phase.

## 1. Offline checks (repeated by C)
- **T139-TARGETED:** I ran A's 22-file list (`a-round-139/vitest-files.txt`): **22 files, 404/404 passed**, exit 0. Results: `c-round-139/out/vitest-22.json`. The count equals A's.
- **SOURCE-SCOPE:**
  - Frozen list (937): OK at the start and at the end.
  - `a-round-139/end-sha256.txt`: OK at the start and at the end.
  - `git status --short` shows exactly the 20 granted paths (18 ` M` and 2 `??`).
  - The protected files have an empty `git diff 1d4df51`.
- **AN-REVIEW:** diffs against `b-round-138/r139-granted-start/` are in `out/an-diff-src.txt`, `an-diff-pins.txt`, `an-diff-strings-test.txt` and `an-diff-docs.txt`.
  - Lane: only the §1.1 lines and the new import. No handler, condition, class or testid changed, and every branch stays in the caller.
  - The overlay is `seconds(…) · allTracks`. The ghost suffix reuses `studioLaneMoveStrings.noRoom`.
  - StudioWorkspace: the l.331 selector and the §1.2 tail only.
  - strings.ts: `studioLaneStrings` is appended. Besides it there are the non-exported helper, A's local `StudioWorkspaceClipDetail` type, `selectedClipDetail` and the `selectedClipTitle` body.
  - Pins: 32 hand-written English lines with the same matchers, anchors and operators. Fixture names are unchanged.
  - Docs 113 and 114: only the named lines changed.
  - A's two declared deviations (the local type, and the `WORKSPACE_FORMATTER_SAMPLES` entry) are minimal and behaviour-free.

## 2. Browser rows (both viewports unless noted)
| Row | Result | Evidence / measurement |
|---|---|---|
| EMPTY-VIDEO | PASS | `No video — use “＋ Your own video” or drop a file here` (shots `empty-video-*`) |
| TRACK-SELECT | PASS | Music: `aria-pressed=true`, text `მუსიკა· active`. A plain click also selects, so the label is `მუსიკა — set as the active track, selected`; the unselected stems row reads `სტემები — set as the active track`. After Ctrl+click on stems, both labels end `, selected`. Ctrl+G creates 1 group row and Ctrl+Z removes it. **trackRowNameButton path:** Ctrl+Shift+G, Undo and Redo all move focus to the music name button through the new English selector (`out/ungroup-focus.json`). |
| TRACK-FOLD | PASS (spec note) | title `Fold / unfold`, aria-label `Fold or unfold — სტემები`. Folding sets `aria-expanded=false`, the row is 36 px and the valuetext is `folded · 80 px`. Unfolding sets `true`, `80 px`, the same height. The clips are **not hidden**: they stay visible at 27 px (was 72) with the folded title, the same as round 138. B's "clips hidden" wording is wrong; this is not a bug. |
| SOLO | PASS | Label `Solo — მუსიკა (Ctrl/Cmd+click = add to solo)` and title `Solo (Ctrl/Cmd+click = add to solo)` (this covers A's gap 1). Video: `Solo — Original video sound (…)`. Ctrl+click on stems leaves both soloed; a plain click on SFX solos SFX only. **Real audio** (output-tap RMS, 24.25–25.3 s, where only stems has signal; 2 pairs per viewport): unsoloed −25.2/−25.1 dB (1440) and −25.2/−25.0 dB (1280). With music soloed the output is **exactly 0** (digital silence), far more than the required 20 dB drop. With music and stems soloed it returns to −25.1/−25.0 dB. |
| VIDEO-HEADER | PASS | Mute and Volume labels are `… — Original video sound`. ArrowLeft changes the valuetext from `+0.0 dB` to `−0.3 dB`. The `＋ Your own video` button opens a file chooser (`filechooser` event, multiple). In compact density the button is `＋` with title `Your own video`. The header contains `Original sound` at 1440 (80 px row). At 1280 the default row is 60 px (regular density), so that line is hidden by design and appears from 84 px (`out/video-density.json`). This explains the raw harness fail `contains-Original-sound` in `c139-1280-r1-all.json`. |
| FILE-DRAG-HINT | PASS (synthetic DataTransfer, real DOM) | Video lane: `Drop the video here`. Music lane: `Video is not added here — drop it on the video track`. `dragleave` removes both hints, and the empty-video text comes back. |
| LIBRARY-GHOST | PASS (texts); release status failed (pre-existing, C-R139-01); not-ready inconclusive | Real-mouse drags. Free spot on SFX: `00:10.000`, `data-blocked=false`. Occupied spot on music: `00:05.000 · No room here`, `true`. Video lane: `00:09.000 · Audio is not added to the video track`, `true`. A blocked release adds no clip, but the status does not change (see C-R139-01). Releasing over the video lane gives the status `Choose an audio track … audio is not added to the video track.` The not-ready ghost `00:07.000 · This sound has not loaded yet` appeared only for a synthetic library-MIME dragover, because a non-ready option is not draggable, so it stays inconclusive. |
| ALL-TRACKS-OVERLAY | PASS | Range 3–5 s, then Ctrl+Shift+L. The overlay reads `00:03.000 – 00:05.000 · 2.000 s · all tracks`, and the readout contains `all tracks`. |
| HEIGHT | PASS | `Height — მუსიკა` and `Height — SFX`. ArrowDown changes the value 80→88 and the row 81→89 px; ArrowUp changes it back. The valuetext is `88 px`. |
| PAN-RESET | PASS | `Reset Pan to centre — მუსიკა`. Readout C → `4R` (enabled), and after a click C again (disabled). |
| AUDIO-NOTE | PASS for 2 states; error state inconclusive | `noaudio-2s-h264.mp4` (owned media): `Sound is decoding…`, then `No sound` about 30 ms later. `beeps-6s-h264-aac.mp4`: `Sound is decoding…`, then no note. `Sound could not be read` stays inconclusive: `broken.mp4` is rejected before any clip exists (status `“broken.mp4”: the browser could not open this video — try MP4 (H.264) or WebM.`, `out/audio-note-broken.json`), so it is covered by LSU5b only. |
| SELECTED-CLIP | PASS | textContent equals the title: `Clip: ღამის პულსი · პულსი · start 00:20.000 · length 00:16.000 · source offset 00:00.000`. After a header drag the start reads `00:21.000`, and text and title still match. |
| REG-138 | PASS | Status `Move clip: start 00:21.000, length 00:16.000, source offset 00:00.000.` and `Undo: Move clip`. The badge reads `00:03.000 – 00:05.000 · 2.000 s`. |
| GEO-COUNT | PASS | 23 steps per viewport, raw 4463, **net 0** (the subtractions are listed in the JSON). |
| LAYOUT | PASS | S0/S1/S2 compared with round 138 (keys normalized for the relabelled aria-labels). Only granted text widths change: the video name button 60→69 px and `＋ Your own video` 121→112 px, with the same right edge (503). Everything else is within 1 px. Compact 1280 S1 is identical. |
| G139-3 (last, alone) | PASS; fake-Bearer BLOCKED | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]` (1440 and 1280). `/api/studio-token` returns 401. Fake-Bearer 403: blocked, backend unavailable in cloud. |
| PX-NET / REG-HYD | PASS | Valid sessions: 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerrors (only the cart noise). |

**Invalid runs:**
- The first layout run at 1440 hit a cold-Vite first load (a hydration error plus "Invalid hook call" on the first request after server start). The rerun was clean (`out/layout-1440-invalid1.log`).
- c139 1440 r1 had errors in my own harness expectations. I fixed them and the valid runs are 1440 r2 and 1280 r1.

## 3. Findings
- **C-R139-01 (Low, pre-existing = INFO-R64-BLOCKED-NO-STATUS):**
  - Action: release a library drag over an occupied spot.
  - Result: no clip is added, which is correct, but the status does not change. With dropEffect `none` Chromium fires no drop event.
  - The task row expected the status to start with `No room here`. This re-observes INFO-R64-BLOCKED-NO-STATUS / INFO-R55-REFUSAL-STATUS-ON-RELEASE. B decides whether to fix it or to correct the row.
- **C-R139-02 (Low, unconfirmed in real Chrome):**
  - Action: Escape-cancel a library drag that is held over a lane.
  - Result in Playwright Chromium: the drop ghost stays on that lane (`out/ghostprobe-*.json`).
  - Cause: the lane clears the ghost only on dragleave or drop, and the library `dragend` handler does not clear lane ghosts.
  - Whether real Chrome sends dragleave on an Escape-cancel needs a Tech Lead check. No existing backlog ID was found for it.

## 4. Ableton correspondence (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Fold/unfold button next to the track name (§6.9) | Confirmed in idea; the label is CZABA's. The compact folded-clip display is an inference, not confirmed by the saved text. |
| Track height via the split line (§6.9) | CZABA uses the separator plus arrow keys, a deliberate difference from Alt +/- |
| Solo Ctrl/Cmd+click adds | Unconfirmed (the Mixer chapter is not in the capture). No Live claim is made. |
| Active track, video header, hints, ghosts | Not applicable (CZABA labels) |

## 5. Gate rows (not claimed by C)
Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL are left to the gate.

Tools: `c-round-139/tools/` (c139.cjs, ghostprobe.cjs, dens.cjs, ungroup.cjs, g139-3.cjs, layout130.cjs). Shots: `c-round-139/shots/` (56 files).
