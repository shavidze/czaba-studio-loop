COMMIT: OK

Nothing blocks the commit. The diff doesn't touch auth, purchase, download, API client or token code. I found no new `any`, `@ts-ignore` or type assertions; the only assertions are `as const`. The listener add/remove pairs match: the boot script's `off()` removes `wheel` and `touchmove` with capture `true`, and the React cleanup removes them with `{capture: true}`. I did not run anything and I did not run a real browser. My checks rest on the diff, `SpotlightLoader.tsx` as it stands, and the implementation doc.

## Findings, ranked

**Low**
1. `SpotlightLoader.tsx:160-166` and `:186-188`: the React skip handler removes its listeners only after React re-renders and runs the effect cleanup.
   - `hideEntrance` just calls `setIsVisible(false)`. In a real browser a wheel burst of 16 ms events can land between that call and the commit. The boot script's `end()` removes its listeners synchronously, so the two paths differ.
   - Tests catch this poorly, because `act()` flushes the commit.
   - Effect: the first 1–3 events of a burst may be swallowed instead of only one. This is harmless because the page is covered, but it doesn't match the doc's "only the first event" claim.
   - Fix: in `handleEntranceSkipScroll`, remove the window listeners synchronously before `hideEntrance()`. Removing an already-removed listener in the cleanup is a no-op.
2. `SpotlightLoader.tsx:122-128` and `EntranceCover.tsx` (`scroll` function): any one-finger `touchmove` is prevented and skips the entrance.
   - A tap with a few pixels of finger jitter fires `touchmove`. That can cancel the tap and skip the animation on a real phone.
   - The doc already lists real-phone testing as open (TLM-R489-TOUCH-SWIPE), so I'm keeping this at Low.
   - Fix if it shows up: use `touchstart` to record the start point and skip only after about 10 px of movement.
3. `EntranceCover.tsx:15` and the CSS failsafe: `ENTRANCE_FAILSAFE_MS` goes from 1000 to 2000.
   - If JS is slow or fails, or hydration errors out, the user now sees a black screen for up to 2 s. It was 1 s before.
   - The doc makes this tradeoff on purpose and it only happens on the first visit per tab. It is an error-path regression, not a blocker.
4. `SpotlightLoader.tsx:199-207`: there is no visible "skip" cue for a cover that lasts 3.5–5 s.
   - Esc, Tab, click, wheel and touch all skip it, and `prefers-reduced-motion` is respected. That is acceptable for WCAG 2.2.2, since it is 5 s or less and skippable.
   - Enter, Space and the arrow keys don't skip it, and they scroll the page under the cover. The doc already tracks this as B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER.
   - Fix: a small `text-muted` hint such as "Click to skip", or add Space and Enter to the skip keys after Saba answers.
5. Render cost during the 3.5–5 s window: the overlay runs a `blur(40px)` 500 px glow, a `feTurbulence` grain, a conic gradient and 15 particles with `repeat: Infinity`, all while the page hydrates.
   - The run is now 2–3× longer than before, so main-thread contention with hydration lasts longer on weak phones. B's 4× CPU probe did pass.
   - Fix if a low-end device shows jank: drop the particle count or the grain, or add `will-change` on the gradient layers.

**Checked, no finding**
- Listener and timer leaks: the four timers are cleared in the cleanup, and the boot script's `t` timer is cleared in `off`. The tests S2 and E8d check both paths.
- Event ordering: the boot listener and the React listener are both on `window` in the capture phase. `off` runs on the takeover event, which is dispatched after React adds its own listeners. A brief overlap is harmless.
- Unmatched listener risks: `{passive: false}` is explicit, which Chrome needs for window-level touch listeners. `e.cancelable` is guarded, so there is no "ignored attempt to cancel" intervention warning.
- Zoom gestures (ctrl+wheel, two-finger pinch) end the entrance without being blocked. That is correct for accessibility.
- Tailwind and tokens: no new CSS or hex colours. The existing inline `style` props are untouched.
- Security: the boot script only interpolates constants. It has no user input, no `dangerouslySetInnerHTML` and no secrets.
- The implementation doc (316) exists, is in Georgian and has all the required sections.

## Architecture note

- Signal: 4, new listener/timer lifecycle in an existing owner. `SpotlightLoader.tsx:146-190` now owns the timeline timers, the key skip, the click skip and the wheel/touch skip in one effect. Signal 3 also applies, because the entrance has been changed in several rounds (B-13, B-17 and others).
- Keep for now. It is one lifecycle with one cleanup, and the tests cover it. The shared `ENTRANCE_SCROLL_SKIP_EVENTS` list already keeps the boot script and the component in step.
- Proposal for the planner, if another round touches this region: one bounded task to extract `useEntranceSkip(hide)` into `app/components/loading/`.
  - The hook would return nothing and own the key, click, wheel and touch listeners, removed synchronously (see finding 1).
  - The timeline, the handshake and the public `SpotlightLoader` shape stay unchanged.
  - Acceptance: S1, S2, S3, E8c, E8d and E8e stay green.
  - This is a proposal, not a request for this round.

## Alternative Approach

- Current: skip on the first wheel or touchmove, with a boot-script listener before hydration and a React listener after it. A non-zoom gesture is consumed by `preventDefault` and `stopPropagation`.
- Alternative: lock scroll with `overflow: hidden` on `html` while the cover is up, and skip on the first gesture without `preventDefault`. A `touch-action: none` lock on the cover is a second option.
- Verdict: keep the current approach. The alternative shifts the layout when the scrollbar disappears. It also lets Lenis, which listens on `window`, see the first event. The current approach has one cost, which is findings 1 and 2. Fixing finding 1 makes it cleaner.

### Score: 8/10