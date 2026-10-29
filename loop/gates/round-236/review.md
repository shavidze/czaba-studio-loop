COMMIT: OK (no blocking issues; nothing touches auth, purchase or download)

## Code Review: round-236 — scrub strip play-from fix (`ArrangementTempoRow.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `bars-ruler-ui.test.tsx`, docs 183/184)

I read both required references (`SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`) and the architecture checkpoint. The verify log shows 211/211 test files passed, the build succeeded and `tsc --noEmit` printed no errors. The lint warnings in it are old and none are in files this commit changes. This review covers the diff only, not the whole module.

### Critical Issues
- None.

### Suggestions (most important first; all Low, none block the commit)
1. **`ArrangementTempoRow.tsx:141-163` — a mixed-zone double-click is decided only by the second press.** If you click the strip and then the lower zone, the second click seeks while audio keeps playing, and the double-click still runs Fit. Doc 184:37-38 says this is deliberate and only happens at the zone border. If you want it consistent, store whether *either* press was in the strip (e.g. `pressInStripRef.current ||= inStrip`, cleared after the double-click is handled or after a timeout). Leaving it as is also works.
2. **`ArrangementTempoRow.tsx:144-145` — `pressInStripRef` is set before the hook's button check (`useRulerNavigation.ts:104`).** A right-click in the strip also writes to the ref. Today this does no harm, because the left-button press before any double-click overwrites it. Fix: only write the ref when `event.button === 0`, or have the hook record the press target and pass it to `onRulerDoubleClick({ pressTarget })`. That would remove the second copy of state described in the Architecture note.
3. **`ArrangementContext.tsx:1397` — the past-end branch uses `target >= end - ARRANGEMENT_EPS`.** So a click exactly on the end (or a hair before it) shows "Playhead (00:16.000) is past the end of the project (00:16.000)". The wording is a bit off. It's already tracked as `B-R236-END-WORDING`; nothing to do this round.
4. **`docs/.../183-saba-b-11a-bars-ruler.md:204-207` — the `playFromRuler` bullet still describes the old `seekTo` + `togglePlayback` path.** Doc 184:29-32 and its TODO list this openly as outside the grant. The planner should do the one-line update in the next round that is allowed to edit doc 183.
5. **`ArrangementContext.tsx:1400-1402` — the past-end branch doesn't clear `playbackEndedAtRef`.** Harmless today: Space at the end still restarts from 0, which BR13 checks. Mentioned only so nobody later assumes this path resets the "ended here" state.

### Event ordering, leaks and render cost
- **Event ordering:** Recording the zone on `pointerdown` instead of reading `dblclick.target` is the correct choice. With `setPointerCapture` on the root (`useRulerNavigation.ts:136`), Chromium delivers `click`/`dblclick` to the root, not the strip. Every double-click comes after a left `pointerdown` on the same element, so the ref always holds the latest press.
- **Leaks:** No new listener, timer, rAF or effect. The ref lives and dies with the component.
- **Render cost:** The two new inline handlers are created on every render, but the hook's handlers already were (they aren't memoised), so nothing gets worse. `playFromRuler` keeps `[]` deps, so `barsRulerGestures` stays stable (BR11). `playFrom` is added to both the context value and its memo deps.
- **Accessibility, Tailwind and TS strict:** No markup or class changes. No `any`, no type assertions, no suppression comments; the `instanceof Node` narrowing is fine. Semicolons are present.
- **Security:** No auth, purchase or download code touched. No user input reaches the DOM.

### Good Practices Found
- The play-or-not decision now reads `isPlayingRef` inside the context. This fixes the latent case where `playFromRuler` used the render-time `isPlaying` and a click could stop playback; BR14 covers it.
- The end guard checks for an active loop (`resolveActiveLoop`) and stops the library preview, matching what `togglePlayback` does. BR13 tests the plain end, a loop past the end, and a loop elsewhere with a running preview.
- Space keeps its existing behaviour (at the end it restarts from 0).
- Doc 184 is thorough: real-browser evidence, a comparison with Ableton Live 12, the five mutants that were run, and honest notes on what was left out.

### Architecture note
- **Signal 2 (ownership: state now split between component and hook):** at `ArrangementTempoRow.tsx:111,144`, `pressInStripRef` copies the `pressTarget` that `useRulerNavigation.ts:127` already records, so the component and the hook each keep their own copy of press state. **Keep for now:** it's one boolean in one gesture flow, and changing `useRulerNavigation`'s public shape affects the seconds ruler too. **Proposal for the planner (not approved scope):** have the hook keep the last press target and pass it as `onRulerDoubleClick({ pressTarget })`, then delete `pressInStripRef`. Acceptance: BR7, BR12 and BR14 pass unchanged, the seconds-ruler tests pass, and the 300 ms after-drag guard behaves the same. Value: low.
- **Signal 4 (more state/behaviour in an existing owner):** `ArrangementContext.tsx:1386` adds another transport entry point to a context that is already large. **Keep:** it depends on `isPlayingRef`, `historyRef` and `stopLibraryPreview`, which all live there, and moving it would create the split-ownership problem from the item above. No proposal.

### Alternative Approach (critical logic: audio pipeline transport)
- **Current:** `playFrom` in the context reads the refs; the end guard is local to it; `togglePlayback` is unchanged.
- **Alternative:** give `togglePlayback` an `explicitStart` option that turns off its "at the end → play from 0" rule.
- **Verdict:** The current approach is better. It leaves the most-used transport path and Space untouched (so less regression risk), keeps the guard next to the one action that needs it, and BR13 checks it directly. The alternative would complicate every `togglePlayback` call site to serve one gesture.

### Score: 9/10