# Round 249: SABA-B-10a stage 1. A separate Insert Marker: Space plays from it, Shift+Space continues from the stop point, Ctrl/Cmd+Shift+Space moves it to the playhead, and a click during playback moves only the marker.

**Planned by:** B, at the round 248 → 249 planning, 2026-10-29 (`date -u` 13:08). **Decisions:** D-29z426…D-29z434.

**Type:** stage 1 of 2 of SABA-B-10a. Saba approved it on 2026-10-28 as part of SABA-B-9/10/11; his decision 1 is "a click during playback moves only the Insert Marker; playback continues". It replaces **D-15** (one position model, round 1). One owner for the model (`ArrangementContext.tsx`), with call-site swaps in 5 components, 2 strings and 3 test files.

**Why this round (D-29z429):**
- Round 248 passed C (`browserVerified: true`). Gate 248 published `0e862be` to both remotes. SABA-B-11b is done, and ABL-R-8 closes with it.
- D-29z424 says: "if that planning is still on 2026-10-29, SABA-B-10a goes first". This planning is on 2026-10-29.
- **REGRESSION** is due at the first planning on or after 2026-10-30 (`regression-last.json`: 2026-10-27, round 199), so not now. **RETRO** is next due at round 260.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L23** (B's pre-check, §0.2) and **L29** (every recipe was run; every signal is grepped, §0.3);
- **L44** (deviations go to Saba, §1.6) and **L45** (the unit is the reference's Insert Marker);
- **L47/L50** (no focus moves here; §1.7 says why), **L49** (`togglePlayback` is split, §1.5) and **L51** (two new status writes, §1.4);
- **L39** (screen budget: a hidden signal plus statuses only), **L48** (playback-start timing rows include the 50 ms lead);
- **L11** (STOP), **L31** (timeouts), **L26** and **L28** (doc 191 is a stage doc).

**Not this round (sequenced, not dropped):**
- **SABA-B-10a stage 2** (§7): paste, Enter-add, Ctrl+E without a range and M while stopped use the Insert Marker even when it differs from the playhead; the D-27 status text names the marker; **C-R235-02** (Follow pauses on a beat-time ruler click and resumes on a scrub-strip click, Live 6.2) with the seconds-ruler role (SABA-Q-TIME-RULER-ROLE).
- **SABA-B-10b**: the visible flashing marker line (`motion-safe:`), contrast, and the shortcut-sheet rows for Shift+Space and Ctrl+Shift+Space.
- **SABA-B-9**: the Stop button, its double-click ("Insert marker to the start"), and the playing-state label "Pause" → "Stop".
- SABA-B-11c, SABA-B-7 (`awaiting_user`), REGRESSION-ROUND-2026-10-30, and the protected purchased route (SRW-21, `deferred_user`).
- The round-248 Lows (C-R248-01, GATE248-S1, GATE248-S2). They are in `deferred_low_polish` (D-29z427).

## 0. Baseline and scope

**Start state:**
- HEAD = `0e862be30b3e1cc19b2971a172584a6fd0f2cbfb` (gate 248 `published`, `commit`; `b-round-248/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** at planning.
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-248-r249-tree-sha256.txt`, **1,099** files. That is every tracked file (1,112), minus the 9 granted tracked files and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-248-r249-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen:
  - `ArrangementClip.tsx` (its `seekTo` prop keeps its name; the Lane passes `setInsertMarker` into it), `ArrangementTempoRow.tsx`, `ArrangementOverview.tsx`, `ArrangementVideoDock.tsx`, `shortcuts.ts`, `position-store.ts`, `grid.ts`;
  - every other test file;
  - every implementation doc except the new doc 191;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-248-r249-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-248-r249-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-248-r249-grants.txt`; start hashes for 1–9 in `b-round-248-r249-grants-start-sha256.txt`)
The applied diff is `b-round-248/precheck-scratch.diff` (sha256 `dd9b5198…2686`, grants 1–10) against HEAD `0e862be`. `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grant 11.

| # | Path | Change (`git apply --numstat`) |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | +142/−53. Most of the −53 is the old `togglePlayback` body moving, unchanged, into `startPlaybackAt` (L49, §1.5). <ul><li>New: `insertMarkerRef`, `insertMarkerStore` (a second `createArrangementPositionStore(0)`), `ArrangementInsertMarkerContext` with its provider, and the export `useArrangementInsertMarkerStore()`.</li><li>New callbacks: `writeInsertMarker` (ref + store), `placeInsertMarker` (write + clear a time selection), `startPlaybackAt(from)`, `continuePlayback`, `setInsertMarker`, `returnToStart` and `moveInsertMarkerToPlayhead`. The last four are on the context value and in `ArrangementContextValue`.</li><li>`togglePlayback`: playing → `stopPlayback()`, unchanged; stopped → `startPlaybackAt(range ? min(range.start, range.end) : insertMarkerRef.current)`.</li><li>`seekTo` also writes the marker (it keeps the range). `playFrom` places the marker and then starts at its target through `startPlaybackAt`. `endPlayheadScrub` places the marker when stopped.</li><li>`cutTimeSelection` remaps the marker with `remapTime`, playing or stopped.</li></ul> |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | +51/−12. <ul><li>`ArrangementInsertMarkerSignal`: a `hidden`, `aria-hidden` div `data-testid="arrangement-insert-marker"` whose `data-insert-marker` (3 decimals) follows the store through a subscription, with no re-render. It is rendered next to `ArrangementPlayheadLine`.</li><li>The empty-lane click, `ArrangementRuler onSeek` and `barsRulerGestures.onSeek` call `setInsertMarker`.</li><li>The Space branch: Ctrl/Cmd+Shift (no Alt) → `moveInsertMarkerToPlayhead`; Shift → `continuePlayback`; no Ctrl/Cmd → `togglePlayback`; Ctrl/Cmd without Shift falls through, as at HEAD.</li><li>Home → `returnToStart`.</li><li>The Space key-up `preventDefault` also covers Ctrl/Cmd+Shift+Space, so a focused button is not activated (IM14).</li></ul> |
| 3 | `app/components/arrangement/ArrangementRuler.tsx` | +1/−1: the playhead handle's ←/→ call `onScrubEnd` (the playhead) instead of `onSeek` (now the marker). |
| 4 | `app/components/arrangement/ArrangementLane.tsx` | +2/−2: it reads `setInsertMarker` from the context and passes it to `ArrangementClip` as `seekTo` (a clip-body click, or a range gesture that did not move). |
| 5 | `app/components/arrangement/ArrangementTransport.tsx` | +2/−2: Back to start (↤) calls `returnToStart`. |
| 6 | `app/components/arrangement/ArrangementMarkerRow.tsx` | +5/−10: the flag's double-click and the menu's "play" call `playFrom(marker.time)` and select the flag. The unused `isPlaying` and `togglePlayback` are removed. |
| 7 | `app/lib/arrangement/strings.ts` | +4: `insertMarkerWhilePlaying(time)` and `insertMarkerToPlayhead(time)` (exact text in §1.3). |
| 8 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | +8/−1: **BR4b** is rewritten to the new contract (§2.2). Asserts are added; none is removed. |
| 9 | `app/lib/arrangement/__tests__/strings.test.ts` | +8: two `V02B_FORMATTER_SAMPLES` entries (ST12 requires a sample for each formatter) and two exact-text rows in ST11. |
| 10 | `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` | new, 367 lines: describe `SABA-B-10a stage 1 Insert Marker and playhead (D-29z430)`, `{ timeout: 15_000 }`, with IM1–IM14. |
| 11 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | new, §2.3. l.4 is `In Progress (stage 1 of 2; C round 249 PASS)` (L28). |

- **No test assertion is removed.** BR4b keeps its two `isPlaying` asserts; its `positionOf ≈ 6` changes to "≈ 2, the marker is 6, and Stop + Play starts at 6".
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (playback start and the position store);
  - `REACT_CONTEXT.md` (a new provider and its hook);
  - `AGENT_DISCOVERABLE_CODE.md`: new names `insertMarker*`, `placeInsertMarker`, `startPlaybackAt`, `continuePlayback`, `returnToStart`, `useArrangementInsertMarkerStore`, `ArrangementInsertMarkerSignal`;
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b249-base` and `/tmp/b249-scratch` with `git archive` (outside the repo) and applied the change there. Scripts: `b-round-248/proto_stage1*.py`.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check` on the 10 files is clean (after `--write`, which is in the diff).
- **Whole suite on the scratch, run by B, not A or C:** 215 files, **3,123/3,123** green (`b-round-248/proto-full-final.json`). That is the HEAD count of 3,109 plus the 14 IM rows.
- **The review's "44 files that use Space or `togglePlayback`" did not go red.** Version 1 of the prototype (without the range clearing) ran all 214 HEAD files (`proto-run.json` + `proto-run-rest.json`): **3,108/3,109**. Only BR4b changed contract. That is a measured coverage fact, not a shortcut: no existing test played, stopped and played again expecting the old resume. The IM rows add that coverage.
- **L23 collisions found and granted:**
  - BR4b (bars lower-zone click while playing; grant 8);
  - ST12 (every formatter needs a sample; grant 9);
  - **EN3** (`marker-edge-nav-ui`, SRW-16 2b-2: "a time range adds its track"). It went red when `seekTo` also cleared the range (`proto-run2.json`). Ruling: `seekTo` keeps the range (§1.2), so EN3 is unchanged and frozen.
- **Covering set** (`b-round-248/covering.txt`): **122 files, 1,815 tests**, all green in the final full run. It is every `app/**` test file that matches `grep -rlE "StudioWorkspace|ArrangementProvider|ArrangementContext|ArrangementLane|ArrangementRuler|ArrangementTransport|ArrangementMarkerRow|togglePlayback|seekTo|playFrom|Space|'Home'|\{Home\}"`, plus the new file.
- **Timeouts (L31):** IM7 is the slowest IM row at 822 ms against 15 s. `bars-ruler-ui` peaks at 1.13 s (BR2), and the whole file took 6.2 s in gate 248's `verify.log`. `strings.test` peaks at 18 ms. The slowest covering tests are CP12a–d at 8.2–8.4 s against 30 s (28 %), unchanged. Nothing is near 50 %.
- **Red proofs.** All run on grants 8–10. Script: `b-round-248/mutants/run-mutants.sh <fixed-scratch> <logdir>`, with the mutants in `mutate.py`. MU-HEAD was run by hand (the 7 source files from `0e862be`, with the new tests). Summary: `b-round-248/mutants/logs/summary.txt`. The runs used copies `/tmp/b249-mut-*`, so no server saw a mutant.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none |
| MU-HEAD | the 7 source files from `0e862be` | `strings.test.ts` fails to load (`pb.insertMarkerWhilePlaying is not a function`); **BR4b, IM1–IM10, IM12–IM14**. IM11 stays green: D-27 is kept. |
| MU-SPACE-FROM-POSITION | `togglePlayback` starts at `positionRef` | **BR4b, IM1, IM4, IM5** |
| MU-NO-RANGE-START | the range start is ignored | **IM5** |
| MU-SHIFT-SAME-AS-SPACE | Shift+Space calls `togglePlayback` | **IM2** |
| MU-CLICK-SEEKS-PLAYING | `setInsertMarker` moves the playhead while playing | **BR4b, IM4** |
| MU-NO-STATUS-PLAYING | no status for a click while playing | **IM4** |
| MU-NO-RANGE-CLEAR | `placeInsertMarker` keeps the range | **IM6, IM12** |
| MU-CTRL-SHIFT-NOOP | Ctrl/Cmd+Shift+Space does nothing | **IM3, IM6** |
| MU-HOME-MARKER-ONLY | Home/↤ move only the marker while playing | **IM7** |
| MU-SEEKTO-NO-MARKER | `seekTo` does not write the marker | **IM9** |
| MU-SCRUBEND-NO-MARKER | a stopped handle step does not move the marker | **IM8** |
| MU-HANDLE-ONSEEK | the handle keys call `onSeek` | **IM8** |
| MU-CUT-NO-REMAP | Cut Time does not remap the marker | **IM10** |
| MU-KEYUP-OLD | the old key-up condition | **IM14** |
| MU-MARKER-PLAY-TOGGLE | flag double-click = the old `jumpToMarker` + `togglePlayback` | **IM12** |

### 0.3 Recipes and measurements (L29)
**Browser probes** (Chromium 143, Playwright, a fresh context per case, `Demo collection ready` first, then `demo-stem-pulse` is added: click `[data-source-id="demo-stem-pulse"]`, then the first `Add…` button, then blur). HEAD was measured on `:5173`. The fix ran on `:5174` from `/tmp/b249-scratch`, which is now stopped.
- Scripts:
  - `b-round-248/im-probe-249.cjs <base> <out.json> [caseRegex]`: cases `restart`, `shiftContinue`, `ctrlShift`, `clickWhilePlaying`, `ctrlShiftOnPlayButton`;
  - `b-round-248/dbg3.cjs <base>`: the range and scrub-strip cases;
  - `b-round-248/dbg2.cjs <base>`: lane clicks, HEAD vs fix.
- At load the project is empty ("Nothing to play"), so every recipe adds the pulse first. That seeds 120 BPM with Snap on, and every probe time below is on the grid.
- **Signals:**
  - the playhead is `[data-testid="arrangement-playhead-handle"]` `aria-valuenow`;
  - the marker is `[data-testid="arrangement-insert-marker"]` `data-insert-marker` (fix only; absent at HEAD);
  - playing means the button `aria-label="Pause"` exists;
  - a time selection of any kind renders `[data-testid="arrangement-range"]` (`StudioWorkspace.tsx` l.3013 at HEAD). `[data-range-start]` renders only for all-track ranges (`ArrangementLane.tsx` l.1031), so it read `null` for B's one-track drag; do not use it for one-track ranges.
- **Geometry at 1440×900:** the ruler starts at x 512, 40 px/s. Lane centres: music y 396, stems 477, sfx 558.

| Case (both viewports) | HEAD `0e862be` | Fix (scratch) | Files |
|---|---|---|---|
| ruler click 2 s, Space, 1.5 s, Space (stop), Space | stop 3.491 / 3.483 → restart **3.700 / 3.682** (resume) | stop 3.483 → restart **2.200** after 250 ms (from the marker 2.000) | `head-probe.json`, `proto-probe-final.json` |
| same, then Shift+Space | 3.691 | **3.700 / 3.682** (from the stop point); marker 2.000 | same |
| same, then Ctrl+Shift+Space, Space | 3.673 (Ctrl+Shift+Space does nothing) | marker **3.483**, status `Insert marker moved to the playhead (00:03.483). Space plays from here.`; Space → 3.683 | same |
| play from 1; during playback: sfx-lane click 6 s, ruler click 8 s, Home, ruler click 5 s, ↤ | (`dbg2.cjs`) a lane click jumps playback: 9 → 9.861, 11 → 11.838 | playback continues (2.721, 3.632). Marker 6.000, then 8.000, with status `Insert marker at 00:0N.000 — playback continues. Stop, then Space plays from here.`. Home → playback 0.261, marker 0.000. Ruler 5 → marker 5.000. ↤ → 0.252, marker 0.000. Stop, Space → 0.200 | `proto-probe-final.json` |
| ruler click 1 s; drag 5 → 7 s on the music clip; Space, stop, Space, stop, Shift+Space | 1.232; 1.451 (the selection is ignored) | **5.223 / 5.232**; again 5.211 / 5.200; Shift+Space 5.411 | `range-strip-*.json` |
| then a scrub-strip click at 9 s (playing), Space (stop), Space | stop 9.359 → 9.562 (resume) | marker 9.000; stop 9.371 → **9.208** (the strip click cleared the selection) | `range-strip-proto-final.json` |
| focus Play, Ctrl+Shift+Space | n/a | not playing; focus stays on Play; marker → playhead 0.000 | `proto-probe-final.json` |

- **Every case has 0 page errors.**
- **Invalid attempts, kept:**
  - `proto-probe.json` `clickWhilePlaying` `afterLane`: the marker stayed 1.000. The click y (sfx bottom − 6 px) missed the lane. It was re-run at the lane centre in `proto-probe-final.json` (marker 6.000).
  - `range-strip-proto.json` (prototype v3, before `playFrom` cleared the selection) gave 5.2 after the strip. That is the stale-range ruling of §1.2, fixed in the final version.
  - The first restart run of `im-probe` had no clip ("Nothing to play").
- **Code facts (grep at `0e862be`):**
  - `grep -rn "seekTo\|playFrom\|togglePlayback\|endPlayheadScrub" app --include=*.tsx --include=*.ts | grep -v __tests__` gives the callers. Each one has a ruling in §1.2: Clip l.734 (via the Lane), Lane l.189/1019, MarkerRow l.157/283/437/683/848, Ruler l.200/282, Transport l.80/150, SW l.530/1384/1388/2068/2161/2399/2864, ArrangementContext l.2390 (video add).
  - `grep -n "remapTime(positionRef" app/contexts/ArrangementContext.tsx` → l.2155 (Cut Time); the marker gets the same remap (IM10).
  - Other Space handlers (`grep -rn "=== ' '" app/components`): GridMenu, MarkerMenu, ShortcutSheet, DetailPanel, Lane, GroupHeader, LibraryPreview. They are menu or button key-ups and are unchanged.

## 1. Ruling D-29z430: the Insert Marker model

### 1.1 The rule
- **Two positions.**
  - The **Insert Marker** is where Space starts. It starts at 0.
  - The **playhead** is the song position. It moves during playback and shows the stop point after a stop.
- **While stopped, every positioning action moves both.** That covers a lane click, a clip-body click, a ruler click (seconds ruler, bars lower zone), the playhead handle keys and drag, Home, ↤, a marker jump and a video add. **Only Stop separates them:** the playhead stays at the stop point and the marker stays where it was.
- **Space**:
  - stopped → plays from the start of the time selection if there is one, otherwise from the Insert Marker (Live 6.3, 6.6, 42.20 "Play Arrangement View Selection — Space");
  - playing → stops, and the marker is unchanged.
- **Shift+Space**: stopped → plays from the playhead, that is, the stop point (Live 6.3); playing → stops.
- **Ctrl/Cmd+Shift+Space**: the marker moves to the playhead (live position while playing), and the status says so (Live 42.16, NEW12).
- **A click during playback** (lane, clip body, seconds ruler, bars lower zone) moves only the marker. Playback continues (Saba decision 1), and the status says so.
- **Placing a point replaces a time selection** (Live 6.9: clicking the background "selects a point in time"). This covers `setInsertMarker`, `playFrom` (scrub strip, flag play), Ctrl/Cmd+Shift+Space, Home/↤ and a stopped handle step or drag.
- **D-27 stays, now on the start point:**
  - a start past the project end refuses with `playPastEnd`;
  - a start at the end plays from 0;
  - the "ended here" exception still covers a natural end at the playhead (Shift+Space).

### 1.2 Rulings on each path (D-29z431)
| Path | Ruling | Reason |
|---|---|---|
| `seekTo` (stepMarker Ctrl+←/→, flag single click via `jumpToMarker`, video add l.2390) | It writes the marker and **keeps** the time selection | Live 6.9 confirms Ctrl+←/→ move the insert marker. EN3 pins "a time range adds its track" for those keys, and our marker has no track. So Space after Ctrl+→ with a selection still plays the selection: SABA-Q-10A-CTRL-ARROW-RANGE |
| Scrub strip / flag double-click / marker menu "play" → `playFrom` | Places the marker (clearing a selection) and starts at the target, never at the range start. While playing it jumps, as at HEAD | Without the clear, Space after strip + stop jumped to a stale selection (`range-strip-proto.json`, v3) |
| Flag "play" at or after the project end | Refuses with `playPastEnd`, like the strip (C-R235-01). At HEAD a flag exactly at the end played from 0 | One play-from rule for every target |
| Home and ↤ → `returnToStart` | Places the marker at 0 and `seekTo(0)`. **Playing: playback jumps to 0, as at HEAD.** Stopped: both go to 0 | Saba decision 1 is about timeline clicks, not transport commands. Live's analogue for ↤ is a double-click on Stop, which stops. Keeping the audible jump avoids a transport button that does nothing while playing before 10b draws the marker. Unconfirmed in Live: SABA-Q-10A-HOME-PLAYING |
| The playhead handle (←/→, drag) | It moves the playhead (`onScrubEnd`). While stopped it also places the marker | The handle is the playhead. While playing, its keys jump playback (IM8) |
| Cut Time | The marker is remapped, playing or stopped | Data consistency with the remapped position (l.2155) |
| Paste, Enter-add, Ctrl+E without a range, M while stopped | **Unchanged in stage 1:** they still read the playhead. They differ from the marker only after a Stop, a Shift+Space or a click during playback | Stage 2 (§7). C records the divergence as row C-EDIT-DIVERGE-249 (info), not as PASS |
| Transport button label | Stays `Pause` while playing, though Space now stops | SABA-B-9 adds the Stop button and the label in 2 rounds. Recorded as B-R249-PAUSE-LABEL (Low, scheduled in SABA-B-9, not deferred) |

### 1.3 Exact strings (grant 7)
- `insertMarkerWhilePlaying(time)`: `` `Insert marker at ${time} — playback continues. Stop, then Space plays from here.` ``
- `insertMarkerToPlayhead(time)`: `` `Insert marker moved to the playhead (${time}). Space plays from here.` ``
- `time` is `formatArrangementTime` (`00:08.000`). The playhead value is rounded to 1 ms.

### 1.4 Status writes (L51)
- **The two new writes are user actions,** written synchronously: one per click while playing, and one per Ctrl/Cmd+Shift+Space. There is no dedupe: each click has its own time.
- **What they can overwrite:** the add + seed status, an export status, `playPastEnd`, a gesture refusal, the ready text.
- **What can overwrite them:** any later action status. Home and ↤ write nothing, so after Home the previous marker status stays (B saw `… at 00:08.000 …` while the marker was 0, in `proto-probe-final.json`). This is an event line, the same class as C-R236-01 (`deferred_low_polish`). It is recorded as **INFO-B249-STALE-MARKER-STATUS**, and 10b's visible marker makes the state visible.
- **No status** for Space, Shift+Space, a stopped click, or Home. The review's acceptance 9 ("Playing from the insert marker …") is **not adopted**: a status on every Space would overwrite every other status (L51), and the marker becomes visible in 10b. This is a deviation recorded in §3.

### 1.5 Side effects kept (L49)
`startPlaybackAt` is the old `togglePlayback` body, moved unchanged, in the same order. It starts with `stopLibraryPreview`, then the `nothingToPlay` check, the loop and ended-here checks, the D-27 refusal, `ensureAudioContext`, the `playbackEndedAtRef` reset, `isPlayingRef`/`setIsPlaying`, `updatePosition(from)`, `meterFreshFromRef`, `startGraph`, the rAF tick and the audio pump. Rows IM11 (D-27), BR2 (strip start), the render-budget Play→Pause→Play row and the metering and pump rows in the covering set pin them, and they stay green.

### 1.6 Saba questions (L44, D-29z432; `awaiting_user`, non-blocking)
- **SABA-Q-10A-HOME-PLAYING:** while playing, Home and ↤ jump playback to 0 and move the marker there (as today). Or should they move only the marker, so playback continues (Live's "Move Insert Marker to Beginning" wording)?
- **SABA-Q-10A-CTRL-ARROW-RANGE:** with a time selection, Ctrl+←/→ moves the marker but keeps the selection (it chooses the tracks), so Space still plays the selection. Or should a locator jump replace the selection?
- **SABA-Q-10A-DEVIATIONS** (the review's planner deviations, asked once):
  - a time-only marker, where Live also puts it on a track (↑/↓ between tracks);
  - no Ctrl/Option+Space "Stop at End of Selection" (DUX `design-ux-review.md` l.260: the macOS input-source switch);
  - no "Playing from …" status on Space.

### 1.7 Focus (L47/L50)
No action in this stage unmounts the focused element or moves focus. `ArrangementInsertMarkerSignal` is `hidden` and not focusable.
- **L50 grep, run by B:** the regex `onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)` over every added or removed line of grants 1–7 in `precheck-scratch.diff` gives **0 hits**. The MarkerRow hunks only swap the play call inside existing handlers.
- **Out-of-scope ruling:** the flag keeps focus on double-click, as at HEAD (`focusMarkerTarget` in the menu path, unchanged).
- C checks `document.activeElement` in C-CTRLSHIFT-FOCUS-249, the browser twin of IM14.

### 1.8 Why we missed it (Saba-reported, SABA-B-10)
- **The phase that should have caught it:** B at round-1 planning (D-15, "single position model … the prototype works this way"). Then the Ableton expert review (P8, Q1) and the DUX shortcut table (l.62–66). Both saw the gap and filtered it as "already a ⚖ D-15".
- **Why it slipped:** a planner's ⚖ deviation was treated as Saba's decision, and "the smallest contract" was accepted as a reason (`transport-grid-review.md` §2.4).
- **The rule that catches it:** **L44** (a ⚖ deviation recorded by the planner is not a Saba decision), which is already in `lessons.md`. No new lesson is needed. This round applies L44 to its own deviations (§1.6). C checks that L44 exists.

## 2. Changes

### 2.1 Source (grants 1–7)
Exactly the diff: no new dependency, and 1 new export (`useArrangementInsertMarkerStore`). `ArrangementContextValue` gains 4 members. No test mocks the full value: tsc rc 0 on the whole scratch.

### 2.2 Rows (grants 8–10)
| Row | Case | Expected |
|---|---|---|
| BR4b (rewritten) | 90 BPM, 1/4, Snap on; a strip click at 2.1, then a lower-zone click at 6.3 while playing | playing; position ≈ 2 (not 6); marker `6.000`; Stop + Play → 6 |
| IM1 | ruler 2; Space; +1.5 s; Space; Space | stop point > 3; marker `2.000`; restart position exactly 2 |
| IM2 | the same, then Shift+Space ×2 | starts at the stop point (±1e-6); marker `2.000`; the second press stops |
| IM3 | after the stop: Ctrl+Shift+Space; ruler 1; Cmd+Shift+Space; Space; +2 s; Ctrl+Shift+Space while playing | marker = stop point (3 decimals) with the exact status; Cmd+Shift with playhead = marker keeps 1.000; Space → 1; while playing the marker > 2.5 and playback continues |
| IM4 | ruler 1, Space, +0.5 s, ruler 8; Space; Space | playing; marker `8.000`; position < 2; the exact status; after the stop the position < 2; Space → 8 |
| IM5 | ruler 1; range 7→5 (reversed); Space; +1 s; Space; Space | position 5 twice; the range is kept; marker `1.000` |
| IM6 | range 5–7, ruler 9; Space; range, Home; range, Ctrl+Shift+Space | each time the range becomes null; marker 9 → 0; Space plays from 9 |
| IM7 | ruler 4, Space, +1 s, Home; ruler 6; ↤ | still playing; position 0; marker `0.000` after Home and after ↤ |
| IM8 | ruler 3; handle → (stopped); Space, +1 s, handle → | 3.1, marker `3.100`; while playing the position > 3.15 and the marker is still `3.100` |
| IM9 | range 5–7; `seekTo(4)` | marker `4.000`; the range is kept |
| IM10 | ruler 6; all-track range 2–4; Cut Time | marker `4.000`; position 4 |
| IM11 | ruler 18 (end 16); Space; ruler 16; Space | refuses with `playPastEndMessage(18, 16)`; plays from 0 |
| IM12 | range 5–7; double-click the flag at 10 | plays from 10; marker `10.000`; the range is null |
| IM13 | ruler 2; Ctrl+Space; Shift+Space and Ctrl+Shift+Space in the tempo field; blur; Alt+Space | no toggle; marker unchanged; Alt+Space plays from 2 |
| IM14 | focus Play; Ctrl+Shift+Space keydown and keyup | the key-up is `defaultPrevented`; not playing |

### 2.3 Doc 191 (grant 11)
- Path `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md`. Georgian, with technical terms in English.
- The seven TEMPLATE headings in order (L26).
- l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 249 PASS)` (L28).
- `## კონტექსტი`: SABA-B-10, D-15 replaced, Saba decision 1.
- `## მიდგომა`:
  - the §1.1 rule and the §1.2 table;
  - the alternatives rejected: renaming `seekTo`; a status on every Space; Home marker-only;
  - measured facts (§0.3) kept apart from inference (the Live behaviour of Stop and Home is inferred from 6.3 and 42.20).
- `## არქიტექტურა`: one Mermaid diagram of the two stores and the actions that write them.
- `## შეცვლილი ფაილები`: a list, no code.
- `## პრობლემები და გადაწყვეტები`, Problem → Solution:
  - the stale selection after a strip click;
  - EN3 and `seekTo`;
  - Ctrl+Shift+Space button activation on key-up;
  - Cut Time remap.
- `## ტესტირება`: BR4b, IM1–IM14, ST11/ST12 and the 16 runs of §0.2. Cite only rows that exist (grep the ids, L26).
- `## TODO / შემდეგი ნაბიჯები`: stage 2 (§7), 10b, 9, the three Saba questions, INFO-B249-STALE-MARKER-STATUS and B-R249-PAUSE-LABEL.
- `grep -rn 'In Progress (stage' docs/implementation` at planning gives 1 hit, doc 176. It is tied to the open PERF-HARNESS-SHARED-LIB-b-ii, not this round. After this round doc 191 adds a second hit, tied to SABA-B-10a stage 2.

## 3. Reference: how Ableton Live 12 does it
Sources:
- [AV] Live 12 Reference Manual ch. 6, https://www.ableton.com/en/live-manual/12/arrangement-view (capture `b-round-71/ableton-arrangement-view-20261021.txt`, re-read 2026-10-29);
- [KS] ch. 42, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/ (capture `b-round-71/ableton-shortcuts-20261021.txt`, 42.16 and 42.20 quoted from it on 2026-10-29);
- [NEW12] https://help.ableton.com/hc/en-us/articles/12840878679452;
- tutorial notes `reference/youtube/SABA-B-9-10-11-transcripts.md` (root, 2026-10-28).

| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Where playback starts | AV 6.3 | "The flashing blue insert marker … determines where playback starts. By default … at the start … click anywhere within a track to move the insert marker" | Same. The marker starts at 0; a click moves it | C-RESTART-249 |
| Continue from the stop point | AV 6.3; KS 42.20 "Continue Play from Stop Point — Shift Space" | "To continue playback from where it last stopped, rather than from the insert marker, hold Shift while pressing the space bar" | Same | C-SHIFT-249 |
| Play the selection | KS 42.20 "Play Arrangement View Selection — Space"; AV 6.6 "triggers playback at the insert marker or active time selection" | plain Space | Same. **Transcript CHECK resolved:** m84w 0:58 says Alt+Space plays the selection; the manual gives plain Space, and Ctrl/Option+Space = "Stop Playback at End of Selection". The manual wins. Alt+Space keeps toggling as at HEAD | C-RANGE-249 |
| Marker → playhead | KS 42.16 "Move Insert Marker to Playhead Position — Ctrl Shift Space / Cmd Shift Space"; NEW12 | the shortcut | Same keys, plus a status (deviation ⚖: Live shows the marker; ours appears in 10b). **Only the Ctrl chord can be browser-verified in the cloud;** Cmd+Shift+Space is jsdom-only (IM3) and on the Tech Lead list (TLM-R249-MAC-CMD-SHIFT-SPACE, deadline RETRO 260) | C-CTRLSHIFT-249 |
| Marker to the start | AV 6.3 "double-click the Stop button or press the Home key"; KS 42.20 "Move Insert Marker to Beginning — Home" | Home moves the marker | Home and ↤ move the marker to 0. **While playing they also jump playback (as at HEAD): ⚖, unconfirmed in Live**, SABA-Q-10A-HOME-PLAYING. The double-click on Stop comes with SABA-B-9's button | C-HOME-249 |
| A click during playback | not stated in AV (`transport-grid-review.md` §2.2: "manual-ში ცალკე არ წერია") | **no reference found** | Saba decision 1: only the marker moves | C-CLICK-PLAYING-249 |
| A point replaces a selection | AV 6.9 "Clicking into the Arrangement background selects a point in time, represented by a flashing insert marker" | a point is a selection **in the background** | Background and clip clicks follow it. The seconds ruler, the playhead handle, the strip, Home and Ctrl+Shift+Space also clear a selection: **planner deviation ⚖** (no Live text), asked in SABA-Q-TIME-RULER-ROLE. Ctrl+←/→ keeps it (⚖, §1.2) | C-POINT-RANGE-249 |
| Ctrl+←/→ move the marker | AV 6.9 "Holding Ctrl … snaps the insert marker to locators and the edges of clips" | the marker moves | `seekTo` writes the marker | C-CTRLARROW-249 |
| Scrub area starts playback | AV 6.3 "click anywhere in the scrub area to start playback from that point" | yes | Unchanged since 11a; it now also places the marker | C-STRIP-249 |
| Stop keeps the marker | inferred from AV 6.3 (two start points); FORUM (secondary) "After stopping, the insert marker stays where playback started" | **inference** | Implemented as the inference | parity: unconfirmed |

- **Deviations (⚖, all in SABA-Q-10A-DEVIATIONS or the questions above):** a time-only marker; no Ctrl/Option+Space; no Space status; Home/↤ jump while playing; Ctrl+←/→ keep the selection; a status for Ctrl+Shift+Space; the "Pause" label until SABA-B-9. "Simpler to build" is not the reason for any of them; the reason is given in §1.2 for each.
- **Better than Live (claim to test):** the status names what happened and what Space will do next ("Stop, then Space plays from here"), so the separate start point can be learned before 10b draws it.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,099 list, the root list and the grant start list.
2. **Apply** `b-round-248/precheck-scratch.diff` (`git apply -p1`), then write grant 11.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–10 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-248/covering.txt)`. Expect 122 files, 1,815/1,815. Any test above 50 % of its timeout is a STOP at the top of the report (L11).
5. **Mutants:** make a fixed scratch copy outside `store/` (`git archive` of HEAD plus the 10 changed files). Run `b-round-248/mutants/run-mutants.sh <scratch> <logdir>`. For MU-HEAD, put the 7 source files back from `git show 0e862be:<file>` and run the 3 test files. Expect exactly the red rows of §0.2. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the diff (3+ files). Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-248/im-probe-249.cjs` and `dbg3.cjs`; do not edit them in place. Expect the "Fix" column of §0.3.
8. **Report:** write `a-round-249.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row.
- Wait for `Demo collection ready` (L48), then add `demo-stem-pulse` (§0.3 recipe).
- Click lanes at their vertical centre. Give every ruler click its own x within the visible ruler, with ≥ 850 ms between clicks (INFO-B248-RULER-DBLCLICK).
- Timing rows allow `PLAYBACK_LOOKAHEAD` (50 ms) on top of the stated tolerance (L48).
- Compare with a HEAD control server (`git archive 0e862be`, on another port, stopped after use) where the row says "HEAD".

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-249 | HEAD, status, hashes | <ul><li>HEAD is `0e862be`.</li><li>Status is exactly `M` on grants 1–9 and `??` on grants 10–11, with nothing else.</li><li>`sha256sum -c` on `b-round-248-r249-tree-sha256.txt` (1,099) and on the root list gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD -- app` plus the new test file equals `b-round-248/precheck-scratch.diff` file by file.</li></ul> |
| C-UNIT-249 | `b-round-248/covering.txt` (122 files) | All green, including BR4b, IM1–IM14 and ST11/ST12. The full suite is a gate row. |
| C-MUT-249 | the 16 runs of §0.2, once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-RESTART-249 | ruler click 2 s; Space; 1.5 s; Space; Space | The restart reads the marker time + elapsed (2.0–2.3 s at 250 ms), not the stop point. HEAD resumes (B: 3.700). `data-insert-marker` is `2.000` throughout. Audible: the output tap RMS > 0 within 300 ms of the restart. |
| C-SHIFT-249 | the same, then Shift+Space | Starts at the stop point (±0.05 s + lead); the marker is unchanged. |
| C-CTRLSHIFT-249 | after a stop: Ctrl+Shift+Space, then Space; also once while playing | The marker equals the stop point (3 decimals) and the exact §1.3 status appears; Space starts there. While playing, the marker takes the live time and playback continues. |
| C-CTRLSHIFT-FOCUS-249 | focus the Play button by Tab; Ctrl+Shift+Space | Playback does not start; `document.activeElement` is still Play, with a visible ring (keyboard focus). |
| C-CLICK-PLAYING-249 | play from 1 s; then a lane-centre click at 6 s, a clip-body click at 11 s, a seconds-ruler click at 8 s and a bars lower-zone click at 4 s | Playback continues each time (the playhead keeps rising from where it was; HEAD jumps). The marker equals each click time, and the exact §1.3 status shows that time. Stop, then Space starts at the last click time. |
| C-RANGE-249 | ruler 1 s; drag a selection 5 → 7 s on the music clip; Space; stop; Space; stop; Shift+Space | Starts at 5.0 twice (HEAD: 1.2, 1.45), and `[data-testid="arrangement-range"]` stays. Shift+Space starts at the stop point. |
| C-POINT-RANGE-249 | with a selection: a seconds-ruler click, a stopped playhead-handle step, a scrub-strip click (playing), Home, Ctrl+Shift+Space, each from a fresh selection | `[data-testid="arrangement-range"]` disappears each time. After the strip: Stop, Space → the strip time (B: 9.208), not 5. **HEAD keeps the selection on a seconds-ruler click and a handle step; the fix clears it (§1.1 point rule). This difference is intended, not a bug.** The ruler case is a planner deviation asked in SABA-Q-TIME-RULER-ROLE (Live 6.9 speaks of the background, not the ruler). |
| C-CTRLARROW-249 | add a marker at 10 s (`M` at 10 s) and a selection 5–7; Ctrl+→ | The marker moves to the next target (`data-insert-marker`). The selection stays (§1.2, ⚖). Record what Space plays. |
| C-HOME-249 | playing: Home; then a ruler click at 5 s; then ↤. Stopped: Home | Playing: the playhead jumps to 0 and keeps playing, marker `0.000`, after both. Stopped: both go to 0. |
| C-STRIP-249 | stopped strip click at 9 s; playing strip click at 12 s | Plays from 9 (marker 9.000); while playing it jumps to 12 (marker 12.000), as at HEAD for the playhead. |
| C-FLAG-249 | a flag double-click with a selection present; then, while playing, a single flag click | Double-click: plays from the flag, the selection is cleared, and the flag stays selected and keeps focus as at HEAD. Single click while playing: **playback jumps to the flag and the marker moves there, as at HEAD** (`jumpToMarker` → `seekTo`; AV 6.4 "You can jump to locators by clicking on them"). This is not covered by Saba decision 1, which is about timeline clicks. |
| C-HANDLE-249 | stopped: focus the playhead handle, → ×2; playing: → | Stopped: playhead and marker +0.1 each time. Playing: the playhead jumps +0.1 from the live time and the marker is unchanged. |
| C-D27-249 | ruler past the end (18 s with the 16 s pulse), Space; ruler at the end, Space; a natural end with the marker at 2 s, then Space, then a fresh natural end and Shift+Space | Refuses with `playPastEnd`; plays from 0; after a natural end Space plays from the marker (2 s) and Shift+Space from 0. |
| C-CUT-249 | ruler 6 s; select 2–4 s on all lanes (Ctrl+Shift+L); Ctrl+Shift+X | `data-insert-marker` is `4.000`. |
| C-VIDEO-249 | import `tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm` onto the video track at 0; ruler 1 s; Space; 1.5 s; Space; Space | After the restart the video `currentTime` follows the marker: \|currentTime − (marker + elapsed)\| ≤ 0.08 s after a 300 ms settle. HEAD continues from the stop point. Record the values. |
| C-KEYS-249 | Space, Shift+Space and Ctrl+Shift+Space typed in the BPM field and the library search | Nothing happens to playback or the marker, as at HEAD. Alt+Space toggles as at HEAD. Ctrl+Space alone does nothing. |
| C-STATUS-BOX-249 | L3: the longest new status (`Insert marker at 00:11.000 — playback continues. …` at 1280×720 and 1440×900) | No horizontal overflow (`scrollWidth ≤ clientWidth`), the transport is not covered, and it takes no more lines than the add + seed status at the same width. Record the heights. |
| C-STATUS-CLOBBER-249 | L51: add the pulse (seed status), Space, then a lane click at 6 s while playing; read after 1 s | The final text is the marker status. Then Home: record that the old marker status stays (INFO-B249-STALE-MARKER-STATUS, info). |
| C-EDIT-DIVERGE-249 | info: play from 2 s, stop at ~3.5 s, then Ctrl+V (after copying a clip), `M`, and Ctrl+E on a clip | Record where each lands (playhead or marker). This is stage-2 scope (§7), not a FAIL. |
| C-BUDGET-249 | L39 | The persistent text lines outside the timeline equal round 248: empty 85/69 and demo 101/85 at 1440/1280. The signal element is `hidden` (0 × 0). |
| C-LESSON-249 | §1.8 | `lessons.md` contains L44; §1.8 names the phase, the reason and the rule. |
| AN-REVIEW-249 | Doc 191 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z430/431 and the rejected alternatives are explained.</li><li>Every cited row exists.</li><li>The TODO lists stage 2, 10b, 9 and the three questions.</li></ul> |
| LAB-SMOKE-249 | `/studio-lab` | It loads. Space plays and stops; Space again plays from the marker. The export WAV after adding `demo-stem-pulse` has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (unchanged; the export does not read the marker). 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | The Insert Marker on the purchased copy | BLOCKED: backend unavailable in cloud. The grants add no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

**Ableton parity** (C states it separately): rows 1–4 and 7–9 of §3 are **confirmed** or a **deliberate deviation**, as listed; rows 5 (playing) and 6 are **unconfirmed** (no reference); the Stop row is an **inference**. A test PASS does not prove parity.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Playback start:**
  - Play from the transport button;
  - a library-preview stop before playback;
  - a loop that is active at the marker;
  - "Nothing to play" in an empty project;
  - render-budget Play → Pause → Play.

  They run through `startPlaybackAt` unchanged.
- **The playhead line and the clock** follow the playhead, not the marker, during and after playback.
- **Follow:** clicks during playback no longer move the playhead, so Follow keeps following playback (C-R235-02 is stage 2).
- **Snap and Alt** on every click path: the snapped time now goes to the marker (D-29z420's hidden-grid pause is unchanged).
- **Markers:**
  - `M` while playing still uses the live position;
  - Ctrl+←/→ targets;
  - flag click selection;
  - the marker menu.
- **Video:** the dock frame follows the playhead after a stop and on the restart.
- **The export, history labels, clip selection and drag gestures** are unchanged. Any change there is a regression.

## 7. Stage 2 and what follows (D-29z429)
- **SABA-B-10a stage 2** (the next round after this PASS, unless REGRESSION is due first):
  - paste, Enter-add, Ctrl+E without a range and `M` while stopped read the Insert Marker (Live 6.4: "a locator will be added at the insert marker location or at the start of the time selection");
  - `M` while playing keeps the live position (ABL-R-10);
  - `playPastEnd` names the marker;
  - **C-R235-02**: Follow pauses on a bars lower-zone click and resumes on a scrub-strip click (Live 6.2), plus the seconds-ruler role under SABA-Q-TIME-RULER-ROLE;
  - C-EDIT-DIVERGE-249's findings.
- **Then:** SABA-B-10b (the visible flashing marker and the sheet rows), SABA-B-9 (Stop button, double-click Stop, the "Stop" label: closes B-R249-PAUSE-LABEL), SABA-B-11c. SABA-B-7 runs when Saba answers.
- **PASS and gate:** SABA-B-10a stage 1 is done. **FAIL on a product row:** a fix-up on the same grants first.
- **Checkpoints (non-blocking, D-29z428):** `b-round-248-checkpoint-request.md` asks root again for ARCH-CHECKPOINT-TEMPO-GRID (now with addendum 11: GATE248-ARCH-EFFECTIVE-SNAP) and ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS. Both are still unanswered. They do not block this round, because this round's owner is `ArrangementContext`, not the grid wiring.
