## Checkpoint Review: Studio uncommitted diff vs HEAD `c5ed47b` (2026-10-13)

**Verdict:** I found no blockers, so this is OK as an intermediate checkpoint. I read the core of the diff and the directly related untracked source. I did not run tests, `tsc` or the build because this review was read-only. The "69 OK / all green" claim in `a-round-30.md` is unverified, so it needs a re-run before you commit.

**Coverage.** I read these closely:
- `ArrangementContext.tsx`
- `graph.client.ts`
- `model.ts`
- `clipboard.ts`
- `types/arrangement.ts`
- `ArrangementLane.tsx`
- `ArrangementClip.tsx`
- `ArrangementExportDialog.tsx`
- the StudioWorkspace keyboard handler and layout snapshot
- the untracked `meter.ts`, `ArrangementMaster.tsx`, `ArrangementDetailPanel.tsx` and two new agent files

For the rest of the StudioWorkspace hunk and the video dock I only grepped for listeners and cleanup. I did not open `ArrangementTrackMeter.tsx` or `panels.ts`.

### Critical Issues (blockers)
None.

These are the things I checked that could have been blockers but are not:
- **Audio matches export.** Playback and the WAV export build the same audio graph (`graph.client.ts:85-112`, `renderArrangementWav`). Both apply master gain and clip gain, and Master Mute exports silence with a warning.
- **Clip gain changes don't restart playback.** `scheduleKey` (`ArrangementContext.tsx:~461`) ignores `gainDb`. Instead, `syncPlayback` (`:877-883`) sends the new value to the live graph through `setClipGain`, so gain edits are heard without a restart. Clips added during a loop pick up the current gain values too.
- **Undo works for the new settings.** History comparison uses `JSON.stringify` of the whole arrangement (`model.ts:550`), so `master` and `gainDb` changes create undo entries. The history has no size cap, so the new `applyEdit()` return check in Cut Time (`ArrangementContext.tsx:1729-1735`) is reliable. Cut Time now only updates the clipboard if the edit actually happened, which fixes the old order.
- **No old saved projects to break.** `Arrangement.master` is now required, but arrangements are not saved to localStorage or IndexedDB, and `createArrangement` always sets `master`. Old data can't crash on `arrangement.master.mute`.
- **Typing in the new number fields is safe.** `isTypingTarget` covers `type="number"` (`StudioWorkspace.tsx:206-219`). Pressing Delete or Backspace in the Clip Gain or range inputs cannot delete clips.
- **Gesture handling cleans up after itself.** `claimPointerGesture` and the volume/master gestures now carry `release`. Window listeners are removed on release, and all three gestures are released when the provider unmounts (`:2383-2390`).
- **Export dialog focus.** `Modal` uses `forwardRef` and has no focus handling of its own, so the new focus trap is the only one.
- **Security.** No XSS surface: no `dangerouslySetInnerHTML`, and user text only reaches `textContent` or `title`. No secrets. The new agent files contain no credentials.

### Suggestions (followups, none blocking)
1. **Delete on a time range no longer closes the gap** (`ArrangementContext.tsx:1561-1605`). It used to remove the time on all tracks; now it clears the material and leaves a gap. This is intentional and specified (`delete-selection.test.ts:62`, SRW-24/R24-1), and it matches Ableton. Cut Time (Ctrl+Shift+X) still closes the gap. Doc 015 doesn't mention the change, so add it to the implementation doc.
2. **Track meter taps are never removed** (`ArrangementContext.tsx:3432-3451`). They are keyed by track id. If a collection is switched to tracks with new ids, the old analysers leak. Low.
3. **Meter cost per frame** (`sampleTrackMeters`). Each track reads 2 ├ù 4096 samples every frame, which is fine for about 5 tracks. A smaller FFT size for track meters would make it cheaper. Low.
4. **Meters double-count during a graph crossfade.** The old and new graphs both feed the same meter tap until the old one is retired. Cosmetic.
5. **Order of pending gain commits** (`previewTrackVolume`, `:2025-2039`). It doesn't commit a pending master change first, and `applyEdit`, undo and redo commit volume before master. If both were pending with master older, undo would replay them in the wrong order. In practice it is almost unreachable because blur and keyup commit first. Low.
6. **Export dialog focus restore** (`ArrangementExportDialog.tsx:186-196`). The element to return focus to is captured in an effect after open. If something moves focus before that effect runs, the restore silently does nothing. Also, the focusable-element filter doesn't skip `hidden` elements. Accessibility, low.
7. **Clip gain can easily clip the export.** Clip gain goes up to +24 dB and master up to +6 dB. The export clamps the samples and shows a warning (`graph.client.ts:5487`), which is acceptable. A visible over-indicator on each clip would be a later UX improvement.
8. **Post-swap video settle may skip its first tick** (`video-sync.ts:5710`, `ArrangementVideoDock.tsx:449/592`). If `clock.ctxTime < due.atCtx` on the first check, the settle ends straight away. This belongs to the known-open video drift issue, so it's tracked there rather than here.
9. **`frontend-architect.md:4` grants `Write` and `Bash`**, while its instructions say application code is read-only. Only the prompt text enforces that. Either drop `Write` or pin where its reports go.
10. **Tests.** The two removed assertions were replaced, not weakened: the undo label `'ßâôßâáßâ¥ßâÿßâí ßâ¼ßâÉßâ¿ßâÜßâÉ'` moved to the new Delete behaviour, and the `setTrackGain` test now checks `timeConstant`.

### Good Practices Found
- Pure functions are separated from the UI (`meter.ts`, `video-sync.ts`, `view.ts`, the `model.ts` gain helpers) and are covered by tests.
- Meters and playheads write straight to the DOM through stores read with `useSyncExternalStore`, so position updates don't re-render the context. The writer effect falls back to `useEffect` on the server, so SSR is safe.
- Clip `gainDb` is stored only when it is non-zero, and copies are conditional, so outputs without gain are byte-identical to before.
- Export reports peak and clipped-sample counts alongside the WAV, so the user is told when output was clamped.

### Alternative Approach (audio pipeline: clip gain)
- **Current:** clip gain is left out of the schedule key and changed live with `setTargetAtTime` on the existing clip gain node.
- **Alternative:** keep `gainDb` in the schedule key and rebuild the graph on every change.
- **Verdict:** the current approach is better. Rebuilding would cause clicks and break the audio-video sync anchor on every edit. The live gain update is smooth and doesn't disturb video sync.

### Score: 8/10 for a checkpoint
There are no data-loss or security regressions, and playback and export stay in parity. The open items are low-severity cleanup, plus the known video drift and SSR NUL issues, which I left out of scope. I made no edits, commits or pushes.
