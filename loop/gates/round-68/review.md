COMMIT: OK

## Code Review: round-68 — musical grid divisions + loop grid-length (b5fb12b → candidate)

These 10 paths were checked against `diff.patch` and the four new files. I read these too: `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`, `architecture-checkpoint.md`. `verify.log`: `tsc` 0, vitest 95/1652 pass, build ✓. Lint stays at 218 warnings, the same baseline count (only the first warnings are shown in the log). This is a diff review, not a full module audit.

**Scope confirmation:** no auth, purchase, download, API client or Stripe/R2 code was touched. The diff adds no new `useEffect`, timer or listener. The menu keeps its outside-pointerdown listener and the same cleanup. The frozen `grid-snap-*` suites (menu, keys, ui, clip-edges, loop-drop) are unchanged and green, which is the regression evidence. The new test files have no `.only`, `.skip`, `any`, `@ts-`, `biome-ignore`, `console.` or real timers. Only design tokens are used (`border-outline`, `text-accent`).

### Critical Issues
- none

### Suggestions (ranked, all Low — none block)
1. **Doc drift** — `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md:4`
   - The status still says "C-ის შემოწმებას ელოდება", but C has passed.
   - Lines `:31` and `:62` still describe the `0.000501` tolerance, `MUSICAL_GRID_INDEX_TOLERANCE` and `gridIndexTolerance`. The Round 68 section (`:116`) says these were deleted.
   - **Fix:** update the status and mark the Round 67 precision paragraph and its file list as superseded.
2. **A11y: the musical group in the menu has no name** — `ArrangementGridMenu.tsx:177-179`
   - In the `<select>`, screen readers hear the BPM context through `optgroup label="ტაქტები · N BPM"`. In the menu the group is only an `<hr>`, so "1/4" is read without its BPM.
   - **Fix:** wrap the musical items in `<div role="group" aria-label={gridMusicalGroupLabel(bpm)}>`, or pass the group label as a prop. `itemRefs` indexes stay the same.
3. **Grid lines vs. stored lines** — `ArrangementLane.tsx:753` (unchanged file, new input)
   - The gradient period is the raw float (`0.666…×pxPerSecond`), while snapped positions are rounded to whole ms. Each line can differ by up to 0.5 ms × pxPerSecond, which is sub-pixel at normal zoom. No fix needed; it's worth checking at maximum zoom in the browser.
4. **Render cost** — `StudioWorkspace.tsx:1591`
   - `gridDivisionOptions(tempoBpm)` rebuilds up to 13 objects on every workspace render. It's cheap and the render-budget test passes. `useMemo([tempoBpm])` is optional.
5. **Unreachable paths that fail silently**
   - `grid-divisions.ts:43`: the `?? Number.NaN` fallback would poison the whole snap chain if the table and type ever drift apart. A `Record<MusicalGridDivisionId, number>` lookup would let the type system enforce this instead.
   - `StudioWorkspace.tsx:868-871`: when a musical id arrives without a tempo, the function returns with no status message. This can't happen through the UI today, so a comment-level note is enough.
6. **`data-grid-seconds`** — `StudioWorkspace.tsx:1677`
   - Shows the unrounded float (for example `0.6666666666666666`). It's only a test hook. The status text is rounded correctly.

### Good Practices Found
- Grid lines are computed from their index (`storedGridLine`), so error doesn't build up. Whole-ms steps take the old arithmetic exactly, so seconds-grid behavior stays the same.
- The candidate loops count by offset, so there's no infinite loop on `Infinity`.
- The `gridStep` argument to `moveLoop` is optional and backward-compatible. When Alt is held, `resolveSnapStep` returns `null` and the old ms behavior applies. Only `'move'` gets the grid step; Shift (resize) is unchanged.
- The refs are updated before `setState`, so the callbacks keep `[]` deps and the keydown handler isn't recreated. The gesture and ref invariants hold.
- Clearing BPM falls back to the last chosen seconds division and says so in the status message. Entering a BPM doesn't switch the grid by itself (D-29z30).
- The menu's `Fragment` key and `<hr>` (separator role) don't break keyboard navigation, because `itemRefs` stays indexed by option.
- The tests include sweep and property oracles (about 420k inputs) and a mutation run.

### Architecture note (proposal only, not for this round)
- **Signals 3 and 4:** `StudioWorkspace.tsx:342-369` and `:866-908`
  - This round adds four state-mirroring refs (`secondsGridDivisionRef`, `musicalGridDivisionRef`, `tempoBpmRef`, `gridDivisionIdRef`) alongside the existing `snapEnabledRef` and `gridSecondsRef`. Rounds 64–68 have changed this same grid/tempo area again and again.
  - **Keep, because:** it's one lifecycle with no effects or timers, and the gesture and ref invariants are covered by tests.
  - **Proposal for the planner** (matches the doc's `ARCH-CHECKPOINT-SRW14-PREFS`): move grid/tempo preferences into one owner hook (`useGridPreferences`) that exposes `{gridSeconds, gridDivisionId, refs, change*}`. Acceptance: GU1–GU14 and the frozen `grid-snap-*` suites pass unchanged, and the public shape of `useArrangement()` stays the same. Value: medium. Risk: low to medium.
- **Signal 2:** `loop.ts:2` (new `lib/loop → lib/grid` dependency) and `ArrangementContext.tsx:256,404` (optional `gridStep` on the public `stepLoopRange`).
  - The dependency only goes one way and the change is backward-compatible. **Keep, because:** `grid.ts` doesn't import from loop, so there's no cycle, and the hook's existing callers still work.

### Alternative Approach (critical logic: snap precision)
- **Current:** on steps that aren't whole ms, the code compares against stored grid lines (`L(m) = round(m·step·1000)/1000`) with three candidates. Loop length is kept as a number of grid lines.
- **Alternative:** the Round 67 index tolerance (`0.000501`), or keeping loop length in ms.
- **Verdict:** keep the current approach. The tolerance covered the 0.5 ms storage error, but it also treated off-line times as lines (0.187 ≈ 0.1875 → a skipped line, C-R67-01). Comparing against stored lines fixes both problems at once. Keeping length in ms puts the loop end 1 ms late (3.334), so the loop really does wrap 1 ms late. That's an audible timing bug, so the grid-line-count rule is correct.

### Score: 8.5/10