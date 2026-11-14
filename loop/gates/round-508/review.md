COMMIT: OK

Nothing blocks the commit. The diff has no auth, purchase or download code. It touches 4 files: `AudioPlayer.tsx`, the DESIGN_SYSTEM doc, one new test and one new implementation doc. State, effects, refs and listeners are unchanged, and no `any`, type assertion or suppression was added. I didn't run the browser checks. I read the code, the `IconButton` source and the global CSS.

## Findings, ranked

1. **Low, accessibility: the Close touch target shrinks.** `AudioPlayer.tsx:71-79` goes from about 34px to 32px (`size="sm"`), which is below the usual 44px mobile guideline. At 375px the button sits in the track-info row, absolutely positioned at `right-0`, so a tap can land on the neighbouring title link. This is a known design decision (D3), not a regression bug.
   - **Fix:** if you want to improve it later, add an invisible hit area, for example a `before:absolute before:-inset-2` pseudo-element in the `className` at line 76. Don't change the `IconButton` primitive for this.

2. **Low, event ordering: pressing a button compounds two scales.** Ghost `IconButton` has `active:scale-95`, and `app/styles/app.css:230` and `app/styles/base/utilities.css:18` apply `transform: scale(0.98)` to `button:active`.
   - In Tailwind v4 the `scale` and `translate` properties are separate from `transform`, so Close's `-translate-y-1/2` doesn't conflict with them. Close stays in place when pressed, as doc 328 claims.
   - The two scales do multiply, to about 0.93. This is the same on every `IconButton` from stages 2a–2e, so it isn't new.
   - **Fix:** none needed now. The duplicated rule in `app.css` and `utilities.css` is a cleanup for a separate task.

3. **Low, layout: the 375px player grows 4px.** Mute goes from 36px to 40px, and the player goes from 239.8px to 243.8px. The doc records this. C's browser check should confirm the fixed player doesn't cover page content or footer padding.
   - **Fix:** none needed. Only check that the bottom padding that compensates for the player isn't a hard-coded value.

4. **Low, tests: N1-5 asserts on source text.** `store-button-cleanup-n1.test.tsx:235-242` reads `AudioPlayer.tsx` and counts `<button` and `<IconButton`. This breaks on any refactor, for example if Play later becomes an `IconButton`. The other tests assert behaviour.
   - **Fix:** keep it for now, since the project already uses scan tests. Delete or loosen it when the Play button is migrated.

5. **Info, design drift.** The pill shape becomes `rounded-lg`, the colour becomes `text-muted`, and hover no longer turns red or brand-coloured. These are listed in D1, D2 and D3 of the doc and depend on Saba's answer to SABA-Q-507-PLAYER-ICON-SHAPE. Tokens are used throughout, with no hard-coded colours and no new custom CSS.

## Checked and fine

- **Accessibility names:** `label` is rendered as both `aria-label` and `title`. Previous, Next and Mute gain a tooltip, and Close keeps the same name. Mute flips to Unmute at volume 0.
- **Event ordering:** click handlers are passed straight through. `{...props}` is spread after `className`, so `onClick` isn't overridden.
- **Render cost:** the same number of DOM nodes as before. There are no new hooks or memoisation, and the `IconButton` `className` is rebuilt on each render as in the other stages.
- **Keyboard and focus:** the global `:focus-visible` outline still applies. The seek keydown handler is untouched.
- **Documentation:** the DESIGN_SYSTEM `ghost` row matches the code (`bg-transparent text-muted`, `hover:bg-elevated`, `hover:text-foreground`). The implementation doc has the required sections.

## Architecture note

- Signal: `AudioPlayer.tsx` (whole file), a mixed-responsibilities signal. One component renders the track info, transport controls, seek bar, volume and close button, and it still contains inline `formatTime` and `progressFraction` logic.
  - **Keep it.** This round moves no state or lifecycle. The context actions and the render order are unchanged, and the file has no refs or timers to protect. Splitting it would add prop plumbing for no benefit.
  - **Proposal for the planner, low priority and not for this round:** if later NONBRAND stages keep changing this component, extract a presentational `PlayerVolumeControl`. It would hold the Mute `IconButton` with the 3-way volume icon, the slider and `audioPlayerRangeFill`. That would remove about 40 lines of repeated SVG from the main render and could be tested alone, with `useAudio` as the only input.
  - **Cost:** low. **Risks:** none for audio timing, because the player only calls `setVolume`.
  - **Acceptance:** N1-2 and N1-6 pass unchanged.

## Score: 9/10