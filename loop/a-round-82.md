# A round 82: SRW-18 stage 1 (clip fade in / fade out) + X1 (C-R80-O3), final report

Scope completed: the round-82 task (§1 F1–F6, X1, and the two one-line doc grants). This is not the whole of SRW-18; stage 2 (the clip volume envelope) remains. Nothing was committed or pushed.

## Baseline (checked before the first edit, 2026-10-22)
- HEAD `efbed86f644c4faabbdf2044620d089e7537e5bb`; `git status --short` printed 0 lines.
- Frozen list `b-round-81-r82-tree-sha256.txt`: 467/467 OK at the start and at the end.
- The 8 owned-file snapshots matched their sha256 prefixes: `e8da478e`, `5ea0cb33`, `7c50d2bc`, `3dca2d29`, `6d0a217c`, `1f9554b7`, `3ae28491`, `cb62af3f`.
- Protected files: 4/4 OK at the start and at the end (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`).
- Pre-flight grep:
  - `applySchedule` has exactly two production callers: `startGraph` and `renderArrangementWav`.
  - Every `ArrangementClip` builder that changes a clip edge is on the F3 list. loop.ts and schedule.ts build `ScheduledClip`, and selection.ts changes only start and track.

## Changed files
End state: 8 M + 4 ??. All files are LF with 0 CR. Full hashes are in `a-round-82/end-hashes.txt`.

| File | Change |
|---|---|
| app/types/arrangement.ts | Adds `fadeIn?` / `fadeOut?` to `ArrangementClip`. |
| app/lib/arrangement/fades.ts (new) | Functions: `clipFadeIn`, `clipFadeOut`, `setClipFade`, `withCutEdges`, `clampClipFadesAfterTrim`, `clipFadeGainAt`, `clipFadeShapes`. Types: `ClipFadeEdge`, `ClipTrimEdge`, `ClipFadeFields`, `ClipFadeShape`, `ClipCutEdges`. |
| app/lib/arrangement/model.ts | Changes the bodies of `trimClipStart`, `trimClipEnd`, `splitClipAt` and `deleteTime`, plus the import. |
| app/lib/arrangement/clipboard.ts | Adds `fadeIn?` / `fadeOut?` to `ArrangementClipboardItem`. Changes `materialInWindow`, `copyClipsToClipboard`, `cutRangeFromArrangement` and `planClipboardPaste`, plus the import. |
| app/lib/arrangement/graph.client.ts | See the list below. |
| app/contexts/ArrangementContext.tsx | One line in `startGraph`, `clipFades: clipFadeShapes(arrangement),`, plus its import. Nothing else. |
| app/components/arrangement/ArrangementClip.tsx | F5, F6 and X1. See the list below. |
| app/lib/arrangement/__tests__/clip-fades.test.ts (new) | 25 tests: FD1–FD8, plus FD7g (fades that meet), FD7h (a loop iteration that starts mid-fade) and FD8b (a render-level export check with a stubbed `OfflineAudioContext`). |
| app/lib/arrangement/__tests__/clip-fades-ui.test.tsx (new) | 16 tests: FU1–FU5, plus FU6 (pointer capture on the handle, revert after a lost pointer). |
| docs/.../070-studio-lab-track-groups-stage-2-collapse.md | l.72 only (C81-2). |
| docs/.../071-studio-lab-track-groups-stage-3-mix.md | l.4 only, with the exact text from the task (GATE81-S1). |
| docs/.../072-studio-lab-clip-fades-stage-1.md (new) | Georgian, with the TEMPLATE sections. Status: "Round 82 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z47)". |

Changes in `graph.client.ts`:
- Two optional methods on `ScheduleAudioParam`: `setValueAtTime?` and `linearRampToValueAtTime?`.
- `clipFades?` on `ApplyScheduleOptions`, and `fadeGain` on `ScheduledSourceState`.
- A private helper, `scheduleClipFadeGain`. The fade-out start is never earlier than the fade-in end (review fix M1).
- In `startPlan`, the chain `source → fadeGain → clipGain` is built only for a clip that has a fade shape.
- `fadeGain` is disconnected at both cleanup sites.
- `renderArrangementWav` gains exactly one line: `clipFades: clipFadeShapes(arrangement),`.

Changes in `ArrangementClip.tsx`:
- F5:
  - fade handles at the top of the clip body;
  - the fade-out handle is anchored with `right`, so it follows the border-box (review fix L1);
  - a handle whose fade is above 0 sits on `z-40` (review fix M2);
  - a ramp overlay, and `data-fade-in` / `data-fade-out` on the clip root.
- F6:
  - new gestures `fadeIn` / `fadeOut`;
  - a fade gesture captures the pointer **on the handle**, so a real `dblclick` lands on it (review fix H1);
  - `pointercancel` reverts through `endStaleClipGesture`;
  - a double-click resets the fade to 0.
- X1: `laneRefusal` plus the release status.

## Checks actually run (final code)
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. The repo has 218 pre-existing warnings; none are in owned files.
- Scoped `npx biome check` on the 9 owned code and test files: clean. Formatting was applied only through `biome format --stdin-file-path` to stdout; nothing ran with `--write`.
- Targeted vitest (`a-round-82/targeted-list.txt`, 74 files): **74 files, 1366 tests passed** (`a-round-82/targeted-run-2.log`).
  - The 74 files are 72 frozen files plus the 2 new ones. The frozen files are those that import `graph.client`, `model`, `clipboard`, `ArrangementClip` or `StudioWorkspace`.
  - No frozen test turned red.
- Mutations (a)–(h) were re-run on the final code and all turned red. Extra mutations (i)–(k) revert the review fixes, and each one also turns red. See `a-round-82/mut/SUMMARY.md` and `mut/final/`.
- Mutations were applied in place in `store/` while the shared dev server on :5173 was running, so HMR may have served a mutated file for a few seconds each time (the A-R22 pattern). Every file was restored byte-identical (`cmp` OK; the end hashes match).
- My own Playwright check on Chromium at 1440x900 (not C evidence; scripts and screenshots in `a-round-82/pw/`):
  - Middle East was added by double-click.
  - On hover, the fade-in handle has opacity 1 and is the topmost element at its point.
  - A real `page.mouse` drag of +40 px at 40 px/s gives `data-fade-in="1.000"` and the status `Fade In: 1.000 წმ.`.
  - **Before the H1 fix**, a real `page.mouse.dblclick` on the handle left 1.000. After the fix it gives `0.000`, the status `Fade In: 0.000 წმ.` and the undo label `Fade In`.
  - No console error outside the expected cloud noise appeared.
  - The very first page load after my edits showed "Invalid hook call" and a hydration error. This came from a Vite dependency re-optimisation (the deps hash changed from d8b1d4da to 465ca6af), and every later load was clean. **C should do one warm-up load before REG-HYD.**

## Code review (code-reviewer agent; score 7/10)
I fixed these findings this round:
- **H1 (High):** with the pointer captured on the clip root, a double-click never reached the handle. I confirmed this in real Chromium. The fade gesture now captures on the handle. FU6 pins the fix, and a real `dblclick` now resets the fade.
- **M1 (Medium):** when fades meet, float rounding could put the fade-out `setValueAtTime(1)` before the end of the fade-in ramp, giving silence and then a jump (example: start 0.1, duration 0.4, in 0.2, out 0.2). It is now guarded, and FD7g pins it.
- **M2 (Medium):** the fade-in handle could sit under a fade-out handle that cannot move. An active handle is now raised to z-40, and FU1 pins it.
- **L1:** the fade-out handle sat 2 px off because of the border. It is now anchored with `right`, and FU1 was updated.
- **L3:** I added tests for a loop that starts mid-fade (FD7h), a lost pointer (FU6) and fades that meet (FD7g).
- **L4:** I corrected doc 072. The diagram now shows that the preview also reschedules during playback, and the claims about verification are accurate.

I did not change these; they are noted in doc 072 or here:
- **L2:** a hidden handle (opacity 0) still catches presses at the clip's top corners, and it has no `touch-none`, so a touch drag can be cancelled. The trim strips behave the same way. This is recorded in the doc 072 TODO as a signal.
- **L5:** `hasStoredFades` treats a key that is present but `undefined` as having no fades. No code path creates such a key.

The fixes were not sent back to the reviewer for a second pass. Each one is covered by a test that its revert turns red, and the H1 fix was confirmed in the browser.

**Architecture note (verbatim from the reviewer), for B:**
- **`fades.ts` and `scheduleClipFadeGain`: keep.** Both are already well separated: pure logic plus one isolated scheduling helper.
- **Signal 3 (one region changed expensively, round after round): `ArrangementClip.tsx`.** `beginGesture` / `handlePointerMove` / `finishGesture` (l.307–711) now branch on six gesture kinds. This region has been the owner file in rounds 80, 81 and 82, and each round needed the full workspace test harness.
- **Keep for now, because:** one pointer claim, one capture and one release lifecycle are what keep each gesture a single Undo entry and keep cancel/lost-pointer handling consistent. Extracting now would risk exactly those invariants.
- **Proposal for planner (B), later checkpoint only, not this round:** a per-kind handler table (`move` / `trim` / `range` / `fade`) behind the same `ClipGesture` record and the same claim/capture/release code. Acceptance gate: the existing grid-snap, lane, selection and clip-fades UI tests, unchanged. Value: medium; risk: medium.

## Contract details for C and B
- `setClipFade` also returns the same reference for a NaN value. This guard is not listed in F2.
- `clipFadeGainAt` returns 1 outside the clip.
- Clamp limits are rounded down to whole ms, so the invariant holds even when a duration is not a whole number of ms.
- Double-clicking a fade that is already 0 writes nothing: no history entry and no status.
- While dragging, the status has no final period (`Fade In: 1.000 წმ`). On release it has one (`Fade In: 1.000 წმ.`).
- During playback, every preview move of a handle reschedules from the current position, just as a clip move already does.
- The fade-in handle's maximum left offset is `width − 2 − 10` px.

## Known gaps
- I did not check the live and export audio rows in a browser: FD-IN, FD-OUT, FD-LIVE, FD-MIDSTART, FD-CLIPGAIN and FD-PLAY-EDIT. These belong to C.
- Mutation (f) is caught by FD1 only. FU3 cannot see it, because the component also clamps the drag value.
- Cosmetic, for the Lows batch: the ramp overlay SVG uses `viewBox 0 0 width 1` over a body that is `width − 2` px wide, so near the right edge the start of the fade-out ramp is about 2 px off the handle's left edge (sub-pixel scale at 40 px/s).
- Fades cannot be edited from the keyboard (stage 1 scope; recorded as SRW18-KEYBOARD-FADES). Touch is also not handled (review L2).

## Exact next C checks
Run every row of task §5 at both 1440x900 and 1280x720. Start with one warm-up load.
- **FD-HANDLES:**
  - The handles are `[data-testid="arrangement-clip-fade-in-handle"]` and `[data-testid="arrangement-clip-fade-out-handle"]`, inside the body, just under the 20 px header.
  - They have opacity 0 until hover, unless the clip is selected or the fade is above 0.
  - They are not rendered on a folded lane, on a video clip, or on a clip narrower than 24 px.
- **FD-LIMITS:** with fade-out 2 on the 16 s stems clip, dragging the fade-in far right gives `data-fade-in="14.000"`. With the fade-out at 0 and the fade-in dragged to the right edge, the fade-in handle must still be draggable (M2).
- **FD-UNDO:** use a real `page.mouse.dblclick` on a handle that has a fade. It should reset to 0 with one entry. A double-click on a zero fade, and a press without movement, add nothing.
- **FD-EDITS (e) and (g):** the parts of a split or a Delete range lose the fade at the cut edge.
- **X1-STATUS:** after a same-lane move, release on the occupied stems lane. The status must be `აქ ადგილი არ არის — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:0X.XXX.`.
- **SOURCE-UNCHANGED:** 8 M + 4 ??, the hashes in `a-round-82/end-hashes.txt`, frozen 467/467, protected 4/4.

## B acceptance criteria: A's status
- Tests FD1–FD8 and FU1–FU5 are written and pass (plus FD7g, FD7h, FD8b and FU6): **passed**.
- Mutations (a)–(h) turn red on the final code: **passed**.
- typecheck, lint, scoped Biome and the targeted tests: **passed**.
- The code-reviewer was run, its findings were addressed and its Architecture note is passed on: **done**.
- The browser rows of §5: **not claimed**; they belong to C.
- The full suite, `verify`, build and e2e smoke: **not run**; they are gate rows.
