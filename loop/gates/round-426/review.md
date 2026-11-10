COMMIT: OK

## Code Review: studio held-Enter guard (round 426)

I read the diff and the three new files. I did not run the app or the tests. I took C's PASS and the verify log as given.

### Critical Issues
- None. The diff changes nothing in auth, purchase, download or API-client code. It makes no `any`, `@ts-ignore` or type-assertion additions. It adds no listeners, timers or effects.

### Suggestions (ranked, none blocking)
1. `ArrangementGroupHeader.tsx:297-303`. On a repeated Enter or Escape, the editor input still calls `preventDefault` and `stopPropagation`. Only `settleEditor` is skipped. That is the right behaviour, and HM11/HM11b cover it. The fix would be to add a one-line TODO or a Georgian comment explaining why the guard is defensive. The doc already has TL-R425-04, so this is optional.
2. `studio-repeat-safe.ts:3`. The helper takes `KeyboardEvent<HTMLElement>` and is passed straight to `onKeyDown` on a button. This works because of handler-parameter bivariance and the return value is ignored. No change is needed. If stage 2b adds many more sites, a `React.KeyboardEventHandler` wrapper would avoid the boolean return being ignored in some places and used in others.
3. `ArrangementLane.tsx:994`. The track-fold button uses `handleFoldKeyDown` plus `handleFoldKeyUp`. The Enter guard is now the first statement, ahead of the Space repeat logic. Space and keyup behaviour are untouched. This is fine, and HM3 covers it.
4. `studio-soft-disabled.ts:6`. `onKeyDown?: never` makes the type reject any `onKeyDown` in the spread. That closes the earlier risk that a spread placed after the guard would overwrite it silently. Confirmed: no current call site spreads an `onKeyDown`. The seven transport sites keep their explicit guard before the spread.

### Checks beyond the tests
- **Real-browser event order:** Chromium fires `click` on the Enter keydown, and `preventDefault` on `repeat=true` suppresses it. Space fires click on keyup, so Space is unaffected. `stopPropagation` is not used, so window-level shortcut listeners behave as before. The doc's Chromium probe matches this, and the jsdom `pressEnter` helper models the keydown-then-click ordering faithfully.
- **Leaks:** the helper is a module-level function with a stable reference. There are no new closures, hooks or dependency arrays, so there is no render-cost change. The inline arrow handlers it replaced were removed.
- **Accessibility:** no change to roles, labels, `aria-*` or focus order. Single presses, Space and mouse clicks behave as before. Holding Enter now acts once, which is better for keyboard and assistive-technology users.
- **Tailwind and tokens:** no class changes.
- **TS strict:** `KeyboardEvent` is no longer imported in `ArrangementTransport.tsx` because the private helper moved out. That is consistent, and verify passed.
- **Test quality:** HM15 checks the type guard with `expectTypeOf`, and the mutants were red as the doc describes. The file is large but well structured.

### Good Practices Found
- One shared helper replaces the private copy and the inline duplicate in Transport.
- Behaviour is unchanged for a single press, and Fit stays unguarded as the TH5 lock requires.
- The implementation doc is complete and follows the template.

### Architecture note
- Signal 3 (repeated costly change in one region): `app/components/arrangement/*` has `onKeyDown={preventRepeatedEnterKeyDown}` hand-added to about 25 buttons across 5 files, and stage 2b will add more.
  - **Keep for now.** The helper is already centralised, each site is one line, and there is no state or lifecycle involved. The audio, ref, gesture and undo invariants are untouched.
  - **Proposal for the planner (one bounded task, after stage 2b):** add a lint or grep row that fails when a `<button` with `onClick` has no repeat guard, or introduce a small `StudioButton` wrapper that applies the guard by default. The cost is medium: many call sites, and the soft-disabled spread order has to be preserved. This is not for this round.
- This note comes from reviewing the diff only. It does not mean the module was fully audited.

### Alternative Approach
- Not critical business logic (not auth, checkout or the audio pipeline), so it does not apply. The alternative would be a window-level capture listener that swallows repeated Enter on any button. That is less explicit and risks swallowing legitimate repeats, such as in inputs. The per-button guard is the safer choice.

### Score: 9/10