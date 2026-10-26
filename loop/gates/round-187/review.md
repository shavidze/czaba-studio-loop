COMMIT: OK

The commit is safe to land. The two fixes are small and correct, and I found nothing that blocks the commit. It doesn't touch auth, purchase or download code: the only files are `AudioPlayer.tsx`, `AudioPreviewButton.tsx`, one new test and two docs.

## Code Review: STORE-1b — `AudioPlayer.tsx`, `AudioPreviewButton.tsx`, `audio-preview-player.test.tsx`, docs 153/154

### Critical Issues
- None.

### Suggestions (most important first)
1. **Low – doc 154 is out of date at commit time.** `154-store-1b-audio-preview-player.md:4` still says `In Progress (awaiting C round 187)`, and line 61 says C hasn't checked the round yet. `c-round-187.md` now records PASS.
   - **Fix:** set the status to `Completed` and replace line 61 with the round-187 PASS result, the way doc 153 was updated in this round. If the team prefers updating in the next round (as was done for 153), that's fine, but then it must be on the next round's list.
2. **Low, already there before this change – a button inside a link.** `ProductCard.tsx:117-133` puts `AudioPreviewButton` inside `<Link>`, and HTML doesn't allow a button inside a link. Before the page finishes loading its scripts, a tap on the button follows the link. This is the same as before the change, since the old guarded button had no click handler either.
   - **Fix (for B):** in STORE-2, place the overlay as a sibling of the `Link`, positioned over the image, not nested inside it.
3. **Low, already there before this change – icons not hidden from screen readers.** The play and pause SVGs in `AudioPreviewButton.tsx:56,60,81,85` have no `aria-hidden="true"`. The `Loader2` icons do. The `aria-label` already gives the button its name, so nothing is broken.
   - **Fix:** add `aria-hidden="true"` to those four SVGs in a later round.
4. **Info – test isolation.** `audio-preview-player.test.tsx:127-141` calls `vi.doUnmock` and `vi.resetModules()` inside the variant loop, so the module state changes partway through the file. Every later test uses the static imports, so nothing breaks today (14/14 pass, and C's start-code and mutation runs behave as expected). If tests get reordered or a test starts using a dynamic import, this can break quietly.
   - **Fix:** move the real-`AudioProvider` hydration case into its own file.
5. **Info – Tailwind-first debt still open.** The unfilled part of both sliders is still a hardcoded `rgba(255, 255, 255, 0.1)` at `AudioPlayer.tsx:127,189`. `app.css:2926,2976` already has the same gradient built from `var(--progress)` and `--color-outline`, which is the token-based version. It's correctly listed in doc 154's TODO for STORE-2/5.
6. **Info – the fill colour follows the Studio theme.** On pages using `[data-studio-theme="obsidian"]`, `--color-brand` is overridden to `#c9a46a` (`app.css:3933`), so the mini-player fill shows gold there instead of teal. That matches the theme and I'd call it correct, but anyone comparing screenshots should know.

### What tests can't catch
- **Event order:** `preventDefault` and `stopPropagation` are unchanged and the button is still inside the `Link`. After loading, a click only plays and never navigates. C confirmed 0 page errors and 0 hydration messages in a real Chromium browser.
- **Leaks:** this change only removes code. One effect and one state are gone, and no listeners or timers were added.
- **Render cost:** each preview button renders once fewer on mount, which is about 14 fewer renders on the home page. The page also no longer briefly shows the "Preview" text and then drops it.
- **Server and browser render the same thing:** the `AudioProvider` starting state (`AudioContext.tsx:56-66`) is fixed in code and doesn't read `window` or `localStorage`, so the server and the first browser render agree without the guard. `useAudio` was already called before the guard, so a button outside a provider fails the same way it did before.
- **Accessibility:** both buttons now have `type="button"`. `aria-busy` and the three labels are unchanged.
- **TypeScript:** no `any`, `as` or `@ts-ignore` was added, and the typecheck passes.
- **Tokens:** `--color-primary` isn't defined anywhere, while `--color-brand` is defined in `@theme` (`app.css:64`). The fix is correct.

### Good Practices Found
- Each change is as small as it can be: four token swaps on two lines, and only removals plus `type` in the button.
- The tests were proven to catch the bugs: 10 of 14 fail on the old code, and C's mutation runs fail where expected (1 when only the token fix is undone, 9 when only the button fix is undone).
- Hydration is checked both with the mocked `useAudio` and with the real `AudioProvider`, with `onRecoverableError` and `console.error` watched.
- Cleanup in `afterEach` stops a failing test from leaving extra DOM behind for the next one.

### Architecture note
- **Signal 4 (state/lifecycle), in reverse:** `AudioPreviewButton.tsx` loses its `isClient` state and effect. This removes a separate client-only stage rather than adding one, so the button now has a single lifecycle. **Keep, because** it lowers complexity and nothing needs to move out.
- **Small proposal for planner B:** create one STORE-2 task covering three things:
  - move the preview overlay out of the `Link` in `ProductCard.tsx`, with a test that the overlay is not inside an `<a>`;
  - rebuild the `AudioPlayer` slider fill on the `--progress`/`--color-outline` pattern from `app.css:2926`;
  - delete the now-unused `.audio-preview-overlay-text`.

  Scope: `ProductCard.tsx`, `AudioPlayer.tsx`, `app.css`. This is only a proposal, not approved scope.

### Alternative Approach
Not needed: this isn't auth, checkout or the Studio audio pipeline. For the button: keeping the `isClient` guard but wiring up `onClick` on the first render would bring back the "Preview" text jumping on load for no gain. Removing the guard is better and is safe because the provider's starting state is fixed.

### Score: 9/10