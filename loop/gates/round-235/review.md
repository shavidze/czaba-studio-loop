COMMIT: OK (nothing blocks. Auth, purchase and download code is untouched. The ruler gesture code moved into the new hook with the same behavior, and verify passed: 211 test files, typecheck and build)

## Code Review: SABA-B-11a stage 2 — interactive bars ruler and `useRulerNavigation` (round 235)

This review covers only this diff, not the whole module.

### Critical Issues
- None.

### Findings, most important first

1. **Medium (a real-browser order of events the tests can't see): double-clicking the top strip starts playback and also runs Fit.**
   - **Where:** `ArrangementTempoRow.tsx:125-127` together with `useRulerNavigation.ts:95-100` and `:179-184`.
   - **What happens:** in a browser, a double-click is two clicks and then the `dblclick` event:
     - The first click goes through `onRulerClick` and `onPlayFrom`, so playback starts if it was stopped.
     - The second click calls `onPlayFrom` again, which jumps while playing.
     - Then `dblclick` runs Fit.
   - **Before vs now:** on the seconds ruler the same gesture was two silent position moves. On the strip it now makes sound.
   - **Why the tests miss it:** BR7 (`bars-ruler-ui.test.tsx:339`) fires `doubleClick` directly, without the two press/release pairs before it.
   - **Doc gap:** the 183 doc says "double-click = Fit" without mentioning this side effect.
   - **Fix (choose one, not now):**
     - (a) Record it as a Saba question next to `SABA-Q-SCRUB-HOLD-LOOP`, and note the side effect in doc 183 under "Drag და double-click".
     - (b) The planner decides whether Fit on double-click should work only in the lower zone.
   - Delaying the click to wait for a possible double-click is not recommended, because it would make the strip feel slow.

2. **Low (accessibility, accepted): the strip is 10 px tall (`h-2.5`), below the 24 px minimum target size in WCAG 2.5.8.**
   - **Where:** `ArrangementTempoRow.tsx:152-158`.
   - Doc 183 records this trade-off, and the strip is `aria-hidden` with a keyboard path: playhead handle ←/→, then Space.
   - No action this round.

3. **Low (note only): `useRulerNavigation.ts:50-51` writes `optionsRef.current = options` during render.**
   - Under concurrent rendering, a render that never commits could leave newer options in the ref.
   - It's the same pattern as `StudioWorkspace.tsx:573-574` (`workspaceRef`), so it is consistent with the codebase, and handlers only read it from events.
   - No action.

4. **Info: `playFromRuler` (`StudioWorkspace.tsx`, the new `useCallback` with `[]` deps) reads `workspaceRef.current.isPlaying` right after `seekTo`.**
   - Both run in the same event, so the order is right.
   - The existing guards in `togglePlayback` (nothing to play, past the end) still apply, and BR8 covers them.

### What I checked and found clean
- **Listener and timer leaks:** none. The unmount cleanup (cancel the animation frame, release the gesture claim) moved over unchanged. No new window listeners or timers. The `watchUncapturedPointerGesture` fallback is kept.
- **Event order:**
  - `pressTarget` is saved on `pointerdown`, because after pointer capture `pointerup` targets the root. That handling is correct.
  - The `preventDefault` on `pointerdown` does not stop `click`/`dblclick`.
  - `pointercancel` and `lostpointercapture` go through with `click=false`, so they never seek or play (covered by BR6 and the MU-D mutant).
  - Bar labels sit in the top 10 px but keep `pointer-events-none`, so a click on a bar number goes to the strip. That matches Live's scrub area.
- **Seconds ruler unchanged:**
  - It gets the same props from `StudioWorkspace.tsx:2594-2607`.
  - The bars ruler gets the same `snapSeconds`/`gridSeconds`/`getSnapMarkerTimes` values through `barsRulerGestures`.
  - The x-axis starts at the same place: the sticky header is a sibling, and `rect.left` is the ruler's own left edge.
- **Render cost:** `barsRulerGestures` is a `useMemo` over stable callbacks and plain values, and `ArrangementBarsRuler` keeps `memo`. BR11 and the MU-MEMO mutant confirm this.
- **Tailwind and tokens:**
  - `hover:bg-foreground/8` already appears in the same file (metronome button).
  - No hardcoded colours and no custom CSS.
  - `touch-none`/`cursor-pointer` are only added when there is a tempo.
- **TypeScript strict:** no `any`, no type assertions, no `@ts-ignore`. The `pressTarget instanceof Node` check is a proper type guard.
- **Security:** no auth, token, purchase, download or `dangerouslySetInnerHTML` code. All paths are under `arrangement/`, `hooks/`, `lib/arrangement/` and `docs/`.

### Suggestions
- In `strings.ts:324`, `scrubStripTitle` comes before the existing keys. Moving it after `invalid` would match the test's key order. Cosmetic only.

### Good Practices Found
- The strip element itself is the hit zone, so what's drawn and what's clickable can't drift apart. Doc 183 explains this and why `offsetY < 10` was rejected.
- With no BPM, the bars ruler renders exactly as before (BR1 and the MU-C mutant).
- The mutants are documented as applied, run and reverted, and each turned at least one test red.

### Architecture note
- **Signal 2 (a new coupling edge):** `app/hooks/useRulerNavigation.ts:2` imports `watchUncapturedPointerGesture` from `~/components/arrangement/ArrangementClip`.
  - This is the first hook-to-component import in `app/hooks/`. `useRelativeFaderDrag.ts` imports only from `lib/`.
  - A general pointer-gesture helper is owned by the clip component file.
- **Keep for now:** the extraction kept behavior the same, both callers are unchanged, and there is no import cycle.
- **Proposal for the planner (cost: low):** move `watchUncapturedPointerGesture` to `app/lib/arrangement/` (pointer utilities) and repoint the three callers (`ArrangementClip`, `ArrangementRuler`, `useRulerNavigation`).
  - Acceptance: no behavior change, existing tests green.
  - Focused tests: `bars-ruler-ui`, `track-layout`, and the clip drag tests.
- **Not a signal:** `app/hooks/index.ts` exports only some hooks (`useRelativeFaderDrag` isn't in it either), so leaving the new hook out is consistent.

### Alternative Approach (ruler gesture pipeline)
- **Current:** one shared hook. The caller decides what a click does through `onRulerClick(anchorTime, { altKey, pressTarget })`, and the zone comes from the `pointerdown` target.
- **Alternative:** keep the gesture logic inside `ArrangementRuler` and give it a `variant="bars"` prop, with zones decided by `offsetY`.
- **Verdict:** the current approach is better.
  - One gesture lifecycle serves two owners without a variant flag.
  - The zone rule stays in the component that draws the strip.
  - The alternative would mix the seconds ruler's playhead with the bars-ruler logic and put the hit zone in a separate number from the drawn strip.

### Score: 8.5/10