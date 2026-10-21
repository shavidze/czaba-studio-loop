# A — Round 5 report

Status: implementation finished for all Track S and Track U items. Final gates are green. Nothing here is a PASS claim; C verifies. The progress log below is kept as written; its test counts predate the reviewer fixes. §2–§10 are the final state.

## 1. Pre-flight gate

**Assumptions**
- HEAD is `354e341` ("add stem library and refine workspace navigation"); the round-4 baseline from task §2.1 was committed by root after B wrote the task, so `git status` was clean at start. I edit on top of it and revert nothing. `git diff app/components/layout/Header.tsx` is now empty against HEAD (the round-4 +21 lines are in HEAD). Header.tsx is not touched.
- Demo lanes come from `app/routes/studio-lab.tsx` (read-only): video, მუსიკა, სტემები, SFX.
- D-23: a second pointer is ignored while a gesture is active; the same pointerId means a stale gesture, which is ended (preview reverted, released, no history) before the new one starts.
- D-24: a stateful in-cycle window lives in `video-sync.ts` (pure, no DOM). The dock samples only where it writes a soft-sync rate.
- Clipboard is in memory only (no `navigator.clipboard`) and is not in history.
- Cross-lane drag never changes `trackId` in a preview, because that would unmount the clip and drop capture. Ghosts are context state, and `trackId` is committed on release only.

**Smallest version per item**
- S1: an ignore/stale guard in `beginGesture` and `beginLoopGesture`, plus an always-release uncaptured listener (~25 lines).
- S2: `createVideoStallWindow` + `shouldEscalateVideoStall` in video-sync.ts (~70 lines), and dock wiring (~40 lines).
- S3: tree width/wrap + label; preview normalisation helper; one dialog line; preview slider keyboard; empty message moved outside the listbox.
- U1: `duplicateClips` and `splitClipsAtTime` (pure), plus context commands and the Ctrl+D key.
- U2: `planClipLaneMove` (pure), context ghost state, and the lane ghost + footer hint.
- U3: `clipboard.ts` (pure) and context commands + keys.

**Files** (all inside task §2.2)
- `app/components/arrangement/ArrangementClip.tsx`: D-23 guard and cross-lane drag
- `app/components/arrangement/ArrangementLoopBrace.tsx`: D-23 guard
- `app/lib/arrangement/video-sync.ts`, `app/components/arrangement/ArrangementVideoDock.tsx`: D-24 escalation
- `app/components/arrangement/ArrangementLibrary.tsx`, `app/data/studio-lab-demo.ts`: C-R4-03 tree and A-R4-L9 listbox
- `app/components/arrangement/ArrangementLibraryPreview.tsx`, `app/lib/arrangement/peaks.ts`: C-R4-04 normalisation and A-R4-L9 slider
- `app/components/arrangement/ArrangementExportDialog.tsx`: root L6
- `app/components/arrangement/StudioWorkspace.tsx`: keys, footer hint, Space/Home slider exclusion
- `app/lib/arrangement/model.ts`, `selection.ts`: duplicate, group split, lane move
- `app/lib/arrangement/clipboard.ts` (new): clipboard
- `app/contexts/ArrangementContext.tsx`: commands and ghost state
- `app/components/arrangement/ArrangementLane.tsx`: lane ghost
- tests under `app/lib/arrangement/__tests__/`
- docs 013 (status only) and 014 (new)

**Success commands**: task §10 (vitest arrangement + full, tsc, biome on the owned paths and on ./app read-only, build, hash check).

## Progress log
- S1 (D-23) code done: `ArrangementClip.beginGesture` and `ArrangementLoopBrace.beginLoopGesture` ignore a pointerdown from a different pointerId while a gesture is active. The same pointerId ends the stale gesture first (reverts the preview, calls release, writes no history). The uncaptured listener always calls `release()`. New `gesture-reentry.test.tsx` (13 tests). **Before the fix all 13 failed** (run on the unchanged round-4 code, output saved at `%TEMP%/a5-reentry-before.txt`: "Tests 13 failed (13)", for example "expected true to be false" on isPointerGestureActive). After the fix: 13/13 pass.
- S2 (D-24) code done: `createVideoStallWindow` / `shouldEscalateVideoStall` in video-sync.ts. Dock samples are taken only at the soft-sync rate write. The window resets on hold-seek, swap, stop, play start, no-target, source change, the hold branch and the paused branch. Escalation = existing `issueHoldSeek`, at most once per element per 1.0 s, measured from that element's `seeked` (or the 1500 ms pending timeout). `data-video-escalations` is published on the dock. RF5-U: 11 new tests, 34/34 in video-sync.test.ts.
- S3 code done:
  - C-R4-03: tree `w-36`, labels wrap (`min-w-0 break-words leading-snug`, no truncate), counts `shrink-0`. The public source collection label is now `CZABA საჯარო preview + სინთეზური SFX` (design-philosopher ruling). The synthetic label is unchanged. `collection.label` keeps the D-05 text.
  - C-R4-04: `normalizePeakColumns` in peaks.ts. Display only, preview waveform only. Lane clip waveforms are not normalised (they will carry SRW-13 gain).
  - root L6: export sub-line is conditional on `loop.enabled` (`data-testid="arrangement-export-graph-note"`).
  - A-R4-L9: the preview wave is now `div role=slider` (aria-valuemin 0, valuemax duration, valuenow = rounded seconds, valuetext). ←/→ ±1 s, Home/End, Space/Enter toggle from the cursor. Keys are stopped on the slider. The global Space and Home handlers exclude `role=slider` only. The empty-state `<output>` is outside the listbox.
- S4 done: doc 013 status and TODO now show C's round-4 FAIL items and the Tech Lead checks.
- Arrangement suite after Track S: 14 files, 216 tests passed.
- Track U pure layer done: model.ts `duplicateClips`, `splitClipsAtTime`, `findClipPlacementConflict` (`createClipId` now exported); selection.ts `planClipLaneMove` + `CLIP_LANE_REFUSAL_MESSAGES`; new clipboard.ts. Tests: selection.test.ts (+10 R7-U/R8-U), clipboard.test.ts (10 R9-U), 33/33 pass. NEXT: context commands, keyboard, clip cross-lane drag, lane ghost, footer.
- Track U wiring done: context `duplicateSelection/copySelection/cutSelection/cutTimeSelection/pasteClipboard` (gesture guard inside each), group split in `splitSelection` (range checked first), `clipLaneDrag` state; keys Ctrl+D/C/X/Shift+X/V (also blocked by the keydown gesture guard); footer hint; clip cross-lane drag (ghost via context, trackId committed on release only); lane ghost `data-testid=arrangement-lane-move-ghost`. ArrangementContext.test.ts +6 tests (13/13). Arrangement suite 236/236 before the context tests. NEXT: browser checks, full gates, code-reviewer, doc 014.
- D-24 constants: T = 300 ms; D = 0.12 s. Why 0.12: with gain 4 and step 0.05, rate ≥ 1.5 needs |d| ≥ 0.11875, so D = 0.12 makes the RF5-1b episode clock and the window clock start together. Rate edge: ≥ 1.5 when lagging, ≤ 0.5 when leading. Shrink test: |d| at window start − |d| now < 0.02 s. Limit: 1.0 s per element, measured from that element's `seeked` (fallback: issue + 1500 ms).
- Drift (A, gstack headless, light harness rf4.js copied to %TEMP%, R3-V1 layout, Play 12.4 s, raw series; I did not compute stall exclusion):
  | run | median | max | lt ms/n | rAF gaps | swaps | hard seeks | escalations |
  | A1..A5 same-load | 0.0115–0.014 | 0.0169–0.0189 | A2 56/1, others 0 | A2 1 (66.6 ms) | 1 each at ~8.0 | 0 | 0 |
  | R1..R3 reload | 0.0108–0.012 | 0.0178–0.0198 | R3 50/1 | 0 | 1 each at ~8.0 | 0 | 0 |
  All runs: 0 currentTime writes while seeking, rate 1..1.2, afterOk true.
- Forced diagnostic (not a verdict): rate writes forced to 1 and the active element pushed back 0.3 s → escalation after 376 ms, exactly 1 escalation and 1 hard seek, drift back to about −0.03 s.
- code-reviewer (real subagent) summary, quoted: "The uncommitted Studio changes (cross-lane drag, in-memory clipboard, D-23 re-entry guard, D-24 video stall escalation, preview slider) are correct in their core logic. Gesture counts are always released and idempotent, paste and duplicate are all-or-nothing, and video escalation is rate-limited without oscillation. No Critical issues were found and project rules are followed. Three Medium issues should be fixed before commit: duplicate React keys on lane-move ghosts in the same lane, Cut Time overwriting the clipboard with an empty one, and a new `clipLaneDrag` object on every pointermove that re-renders the whole arrangement context each frame. The remaining items are small accessibility and consistency fixes." Score 8/10.
- R5-B1r finding (mine): the original `c-round-2/scripts/r3v3.js` left the edit/undo block on (its stray `new PointerEvent('pointerdown',{bubbles:true})` has buttons 0 and pointerId 0; under D-23 the later id-7 drag was ignored). `r3v3c.js` passed. FIXED: a pointerdown with `buttons === 0` starts no gesture (see §8). Re-run: r3v3.js trims to 0.5 and moves to 2.000, then a real Ctrl+Z works. r3v3c.js passes. The video-clip `leak.js`, `leakmusic.js` and brace `leak2.js` were also re-run: real Ctrl+Z, Ctrl+Shift+Z and Delete all work afterwards.


## 2. Design-philosopher ruling (real subagent, read-only), quoted

(a) Tree: "**Tree column:** `w-36 shrink-0`. Remove every `truncate` from tree nodes (lines 303, 327, 344). Labels use `min-w-0 break-words leading-snug`. Do not use `line-clamp`, because it brings the ellipsis back. **Public label:** `CZABA საჯარო preview + სინთეზური SFX`. **Synthetic label:** unchanged, `სინთეზური დემო · ღამის პულსი`. **Why it works:** the two labels now start with different words ("CZABA" vs "სინთეზური"), so you can tell them apart before reading to the end. The public label says outright that the SFX are synthetic…"

(b) Cross-lane ghost: "**Source clip:** stays mounted at `opacity-40`… **Ghost:** use the same component language as the library drop ghost. That means `border-2 border-dashed rounded-sm`, the clip's real width at preview time, and `pointer-events-none`. Placeable: `border-brand bg-brand/20 text-brand`. Blocked: `border-accent bg-accent/20 text-accent`, with suffix ` · აქ ადგილი არ არის`. Over the video lane: same accent styling, with suffix ` · აუდიო ვიდეოხაზზე არ გადადის`. **Content:** yes, show the clip title (`truncate`), followed by the `tabular-nums` time chip… **No ghost on the source lane**… **Status line:** `Shift — დრო ჩაკეტილია, იცვლება მხოლოდ ხაზი` in `text-muted`, shown only while a header drag is active."

Implemented as ruled. One part not implemented: the ruling's "300–600 ms ease after release" for the settle animation. It is not required by any criterion, and a transition on `left` would disturb C's position probes. Recorded as a deviation.

## 3. Files changed (all inside task §2.2)

Modified: `ArrangementClip.tsx`, `ArrangementExportDialog.tsx`, `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementVideoDock.tsx`, `StudioWorkspace.tsx`, `contexts/ArrangementContext.tsx`, `data/studio-lab-demo.ts`, `lib/arrangement/{model,peaks,selection,video-sync}.ts`, tests `{ArrangementContext,peaks,selection,video-sync}.test.ts`, doc 013 (status and TODO only).
New: `lib/arrangement/clipboard.ts`, `__tests__/clipboard.test.ts`, `__tests__/gesture-reentry.test.tsx`, doc `014-studio-lab-edit-clipboard.md`.
Also created: `tmp/studio-real-loop/a-browse.json` (gstack state, exists), `a-r5-tree-1280.png`, `a-r5-tree-1440.png`. Browse wrappers and copied C scripts live in `%TEMP%/a5b` (outside the repo and the c-round folders).
Not touched: `types/arrangement.ts`, `video.ts`, `library.ts`, `schedule.ts`, `graph.client.ts`, Header.tsx, routes, styles, root, package files.
Baseline: the round-4 files were already committed in HEAD `354e341` when I started (git status was clean), so nothing from round 4 is reverted. `git diff app/components/layout/Header.tsx` is empty (0 lines): Header is byte-identical to HEAD, which contains the round-4 +21 lines.

## 4. Command tails (final run, after the reviewer fixes)

```
npx vitest run app/lib/arrangement   -> Test Files 15 passed (15) · Tests 245 passed (245)
npx vitest run                       -> Test Files 47 passed (47) · Tests 709 passed (709)   (baseline 654)
npx tsc --noEmit                     -> 0 errors
npx biome check <owned paths>        -> Checked 45 files ... No fixes applied. (0 errors, 0 warnings)
npx biome check ./app                -> Checked 309 files ... Found 218 warnings. Found 1 info. (0 errors; same 218 as c-round-4/biome-app.txt)
npm run build                        -> built in 2.16s
protected hashes                     -> download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
git diff --stat                      -> 19 files changed, 1569 insertions(+), 136 deletions(-)  (+4 untracked new files)
git diff app/components/layout/Header.tsx | wc -l -> 0
```
`/check`: biome `--write` was run only on owned paths. I did not run `npm run check`, because `./app` has 218 pre-existing warnings outside my files.

## 5. Tests

New: `gesture-reentry.test.tsx` (14), `clipboard.test.ts` (11), `ArrangementContext.test.ts` +7 (Duplicate, Copy, Cut, Cut Time and Paste are refused during a gesture; duplicate makes one entry; range and empty refusals; group split; paste as one entry; Cut Time = Delete Time; Cut Time over silence keeps the clipboard), `selection.test.ts` +10 (R7-U, R8-U), `video-sync.test.ts` +11 (RF5-U), `peaks.test.ts` +2 (R5-B3 helper).
Changed existing tests:
- `ArrangementContext.test.ts`, the two brace tests (R4-B2 uncaptured, R4-B2 unmount): `fireEvent.pointerDown` now passes `buttons: 1`. Reason: the §3 D-23 addition says a pointerdown with no pressed button starts no gesture, and jsdom defaults `buttons` to 0.
R5-B1u fails on the old code: I ran the 13 D-23 tests on the unchanged round-4 code before the fix, and all 13 failed (`%TEMP%/a5-reentry-before.txt`, "Tests 13 failed (13)"). After the buttons guard I re-checked that the guard really fires in jsdom: without `buttons: 1`, 7 tests failed.

## 6. code-reviewer (real subagent): findings and what I did

Summary quoted in the progress log above (score 8/10, no Critical).
- #1 Medium, duplicate ghost keys -> FIXED (key includes blocked/valid).
- #2 Medium, Cut Time over silence wiped the clipboard -> FIXED. The time is still deleted, the clipboard is kept, and the status says so. Tests added in clipboard and context.
- #3 Medium, `setClipLaneDrag` called on every pointermove -> FIXED. The gesture remembers the last published ghost list and only publishes on change. The first publish at the threshold still shows the Shift hint.
- #4 Low, slider keys before isReady -> FIXED (early return).
- #5 Low, aria-valuenow above max -> FIXED (clamped).
- #6 Low, refused group ghosts used the unclamped delta -> FIXED (placements re-planned with the clamped delta).
- #9 Low, Ctrl+C with a text selection -> FIXED (skipped when the selection is not collapsed; X and V unchanged).
- #7 Low, mute/solo/volume are not blocked mid-gesture, so a cross-lane commit from `before` would undo them -> NOT FIXED. This is pre-existing, outside §3–§8. Known gap for B.
- #8 Low, `escalatedAt` is not reset on stop -> NOT FIXED on purpose. The limit is per element, and keeping it is at worst stricter.
- #10 Low, labels `Cut` / `Cut Time` are English -> KEPT, because §8 mandates these literal labels. Conflict recorded.

## 7. D-24 constants and drift

See the progress log: T = 300 ms; D = 0.12 s (rationale 0.11875); edge 1.5 / 0.5; shrink 0.02 s; 1.0 s from `seeked`.
R3-V1 runs: same-load 5/5 and reload 3/3 within tolerance on the raw series (worst max 0.0198), 0 escalations, 0 hard seeks, 1 swap at ~8.0 per run. I did not compute the stall-excluded series (only 2 small long tasks, ≤ 56 ms). RF5-2 (loop) and RF5-3 (start hold) layouts were not run by A. The forced diagnostic proves the escalation path fires (376 ms, 1 escalation).

## 8. Deviations

1. **D-23 addition:** a `pointerdown` with `buttons === 0` starts no gesture in the clip or the brace. Without it, the original r3v3.js (R5-B1r) fails. D-23's "different pointer ignored" leaves its stray id-0 gesture open forever. A real press always has `buttons >= 1`. The leak scripts (`buttons: 1`) are unaffected.
2. The public source `collectionLabel` is shortened (C-R4-03). `collection.label` keeps the D-05 text, which is no longer shown verbatim in the tree.
3. The Shift hint replaces the footer shortcut line during a header drag, instead of adding a line, so the footer height and the lane positions stay stable mid-drag. The hint appears for every header drag, including the video clip, where Shift locks time too.
4. Single clip, same-lane blocked after a valid cross-lane position: the teal ghost of the last valid cross-lane place stays visible, and release commits it (last-valid rule).
5. Group cross-lane refusal shows amber ghosts (anchor only for video-clip, video-lane and out-of-range; every member for overlap). The time part follows D-18 on the source lanes.
6. No settle animation after release (design ruling's 300–600 ms ease), see §2.
7. Paste with the active track = the video lane and single-lane audio material -> refusal naming the lane (`lane-kind`).
8. The task's Header diff check (+21/−0) no longer applies against HEAD, because root committed round 4 (HEAD 354e341). Header is byte-identical to HEAD.
9. A-R4-L9: Space/Enter on the slider resume from the cursor. The one exception is a cursor within 0.05 s of the end (the preview finished): then playback restarts at 0. This is deliberate, because otherwise the preview would end immediately.

## 9. "Not ready" acceptance IDs, per item (C decides everything)

- **S1:** none known. R5-B1 trim-edge and body variants were exercised only in unit tests (R5-B1u), not in the browser.
- **S2:** RF5-1, RF5-1b, RF5-2, RF5-3. My 8 runs had 0 natural escalations (quiet machine). RF5-1b's escalation was shown only by the forced diagnostic. I did not run RF5-2 or RF5-3, or compute stall-excluded series. These need C's full series and the Tech Lead's real Chrome.
- **S3:** none known. R5-B3's "export of a stem equals its JS buffer" was not re-measured (the audio path is unchanged).
- **SRW-07:** R7-D3 "audible on the master tap" is not isolated: my tap window included the bass stem. I only proved the copy's source start was scheduled at its time, with the position monotone.
- **SRW-08:** R8-M1/M2 with a real mouse (Tech Lead list). All R8 checks used synthetic pointers.
- **SRW-09:** R9-C1 "while playing, pasted audio heard" was not measured.

## 10. Exact next C checks and open follow-ups

C order per task §12. Suggested specifics:
- Header: `git diff cc1e531 -- app/components/layout/Header.tsx` → `1 file changed, 21 insertions(+)` (the round-4 diff, now in HEAD). Against HEAD it is empty.
- Use `data-video-escalations` and `data-video-hard-seeks` on `[data-testid=arrangement-video-dock]`.
- Lane ghost: `[data-testid=arrangement-lane-move-ghost][data-blocked]` with `data-ghost-start`. Shift hint: `[data-testid=arrangement-lane-move-hint]`.
- Export sub-line: `[data-testid=arrangement-export-graph-note]`.
- Re-run R5-B1r with both r3v3 scripts (pointerdowns need `buttons >= 1` to count as presses).
- Screenshots `a-r5-tree-1280.png` and `a-r5-tree-1440.png` are in the loop folder (mine, not C's).
Carried open items (root-pre-push-review / publication-checkpoint / C §7):
- root M3 (doc honesty, 012);
- L7 (unbounded history, accepted for the demo);
- L5 (biome-ignore count is still 3 in arrangement code; I added none);
- the purchased `/studio/:productId` loader hardcodes `middle-east` stems (High, inherited, protected, SRW-21);
- category whitespace match (Medium);
- `userId` hash mismatch between studio and download (Medium);
- AGENTS.md / `.codex` portable paths (Medium);
- T12 Gain/Volume;
- SRW-10, SRW-11B, SRW-13..20, SRW-21 are still todo;
- new from the reviewer: #7 (mute/solo mid-gesture);
- known gap (mine): D-23 is per component. A second pointer on a *different* clip during a cross-lane drag starts its own gesture, and its release clears the shared ghost/hint state until the first drag's ghost list changes again. No R8 criterion covers this.
