# tech-lead consult: PERF-11c-iii-d scope (2026-11-08, read-only real run; summary by B, facts with file:line as the agent gave them)

- **Confirmed:**
  - `getArrangement` is already an action (ArrangementContext l.561) and is `useCallback([])` (l.2320).
  - `getPlaybackClock` is `useCallback([])` (l.1113). It is not an action.
  - `getLivePosition` is the value key for `livePosition`, which is `useCallback([])` (l.1100; exposed at l.4727).
  - `pausePlaybackWithStatus` (l.2008) deps are `[stopPlayback, setStatus]`; the chain was not fully traced. The dock reads it through a ref (VideoDock l.374-375), so it does not need to be an action.
  - Advice: **34 → 36**.
- **Const tuple (TL-R403-SK-L1):** keep it separate. The Pick type can derive from an `as const` tuple. The memo object (`Object.fromEntries`) would need a type assertion, which is forbidden. `useMemo` deps must be literal (Biome `useExhaustiveDependencies`). So the gain is three lists down to two plus the tuple: not worth it. This round is the second to touch the list; Lane (e) is the third.
- **Structure (a):** an outer shell keeps the section, `rootRef`, the caption and `{overview}`. A memoised `ArrangementVideoDockViewInner` returns a Fragment with the placeholder and the video box, so the DOM order is unchanged.
  - Inner props: `videoLane`, `videoSources`, `hasVideoClips`, `isVideoExpanded`, `videoFloatAnchor`, `onVideoExpandedChange`, `claimPointerGesture`, `rootRef`.
  - Option (b) would move about 8 workspace-local props into context: bigger and riskier.
- **Correctness trap:** `useVideoLanePreviewReader` (l.206-235) uses `arrangement` only for `videoTrackId` (l.212). Narrowing its deps makes `videoLane` stable, but the stopped-sync effect (l.816) re-runs today only because `videoLane` changes on every commit. Undo or a clip move while stopped does not notify the preview or position store. The reader therefore needs a commit signal: the video-lane clip list, kept identity-stable with `sameClipList` (l.202).
- **Split:**
  - d-i: actions 34 → 36 + AC7 (`actions-context.test.tsx:106,366`). Low risk.
  - d-ii: reader narrowing + commit signal + memo inner + a dock render probe that fails at HEAD.
- **Covering tests:** floating-video, video-fades-ui, video-dock-strings-ui, render-budget (gap caption l.447-566), library-video-return-focus, overview-visibility-ui, track-layout, drag-preview-render, markers-ui, export-dialog-focus, actions-context.
- **d-ii mutants:**
  1. memo removed;
  2. reader deps back to `arrangement`;
  3. video-lane commit signal dropped (new test: stopped, undo a video-clip move, the frame re-seeks);
  4. `videoTrackId` dropped from the reader deps;
  5. `getLivePosition` removed from the actions (AC7);
  6. pause ref frozen stale (the play-failure status must still surface).
