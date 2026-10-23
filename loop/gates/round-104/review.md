COMMIT: BLOCK (A-R104-REPEAT-DRAG: this commit adds a Medium regression to an existing flow in order to fix a Low a11y bug. When a drag is blocked, every pointermove now re-renders the provider and makes the screen reader announce the same sentence again. In C's browser run, 81 pointermoves added 81 `<span>` nodes, and 80 had identical text. The fix fits in files this round already owns.)

## Code Review: round-104 — status repeat announcement (GATE96-S2)

### Critical Issues
1. **A blocked drag now announces the same sentence on every move, and the provider re-renders each time** (Medium, a11y + render cost)
   - **Where:** `app/contexts/ArrangementContext.tsx:541-547` together with `app/lib/arrangement/status-announcement.ts:16-18` and `app/components/arrangement/StudioWorkspace.tsx:2446`.
   - **Cause:** the string branch always increments `sequence`. That changes the keyed span, so the polite region announces again.
   - **Affected call sites in the drag paths:** `ArrangementClip.tsx:495, 513, 563, 579-581, 611`, plus the fade readout at the clamp (C saw 21 identical `Fade In: 101.352 წმ` spans). Before 3b6178b, `useState` bailed out and none of this happened.
   - **Evidence:** `c-round-104/out/blocked-1280x720.json` shows `addedElementNodes: 81` and `maxLongtask: 0`. So the a11y harm was measured. The render cost is real (every `useArrangement` consumer re-renders) but caused no longtask. The blocking reason is the a11y regression.
   - C's PASS was measured against B's bound of "≤ pointermoves + 2". That bound does not check for regressions, so the PASS does not cancel this finding.
   - **Fix (owned files only, `ArrangementClip.tsx` not needed):**
     - Give the reducer a third parameter, `gestureActive: boolean`. When it is `true` and a string update has the same text, return `previous`. This reuses the same silent path as the updater branch.
     - In the provider: `useReducer((prev, next) => reduceArrangementStatus(prev, next, gestureCountRef.current > 0), …)`. The dispatch stays stable, so Biome's `useExhaustiveDependencies` gives no new warnings (the 29 warnings came from a `useCallback` wrapper, which this avoids).
     - **Invariants:** the first blocked message is still announced (its text differs). The release restore (`:1496`) runs after the gesture count reaches 0, so SU4 is unchanged. Outside a gesture, Space twice and failed-row twice are still announced (SU1/SU2).
     - **Coverage:** this also handles the repeated readouts in `ArrangementMarkerRow`, `ArrangementClipEnvelope` and the lane fader. Changing call sites, as C suggested, would only fix `ArrangementClip`.
     - **Trade-off:** if the user triggers the same refusal twice during one gesture (for example, a key press while dragging), the second one is silent. That is acceptable: one gesture, one message.
     - **Tests to add:** SA6 (same text while a gesture is active returns `previous`) and an SU test where a claimed gesture plus the same string twice leaves the span unchanged. The browser criterion stays: a blocked move held for ≥ 40 moves adds ≤ 2 spans.
     - **Note:** a reducer that reads a ref is a mild impurity. It is deterministic within a render, so StrictMode's double call is safe. If you prefer, keep the flag in the action instead (dispatch `{ text, coalesce }`). That keeps the reducer pure, but `setStatus`'s public type would then need a wrapper.

### Suggestions
2. **Loading text announced at mount** (`ArrangementContext.tsx:541-547` + the mount effect): the mount effect sets `copy.loading` again, so `sequence` goes 0→1 (2 in StrictMode). The span is swapped once and the loading text may be announced once after hydration. Hydration is safe (key 0 on both sides). I accept this. If you want it silent, use the updater form `() => copy.loading` in that effect.
3. **Doc status line** (`docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md:4`): it still says "C-ის შემოწმებას ელოდება" ("waiting for C's check"). Update it at publication, as was done for 091 (C also flagged this). Line 60 should then point to the fix from finding 1 instead of the hand-off to B.
4. **`statusSequence` on the public `useArrangement()` shape** (`ArrangementContext.tsx:253`): this is an addition and changes no existing behaviour. It is also in both the value object and its dependency list (`:3143`, `:3245`). Fine.

### Good Practices Found
- `<output>` keeps the same node and has no key. Only the inner span changes, which suits how screen readers treat live regions. SU1–SU3 check the region's identity directly.
- The pure reducer lives in `lib/`. SA1–SA5 use exact assertions, and the m1–m5 mutation matrix shows each test can fail.
- Test cleanup is correct: the `MutationObserver` is disconnected in `stopWatching`, and `vi.unstubAllGlobals()` and `vi.restoreAllMocks()` run in `afterEach`. Nothing leaks.
- TS strict holds: the new and changed lines have no `any`, `as` or `@ts-*`. All statements end in semicolons.
- No Tailwind classes or tokens changed, and no custom CSS was added.
- **Auth, purchase and download code: not touched.** Security checklist: there is no XSS surface. The status text goes through React's escaping, with no `dangerouslySetInnerHTML`.
- No new listeners or timers. `verify.log` passed: 146 files and 2263 tests, plus a clean build.
- Bundling the status update for 091 into this commit is fine.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** status is now spread across three places: the pure reducer in `lib/`, sequencing in the provider, and the keyed span in `StudioWorkspace` (`StudioWorkspace.tsx:2446`, `ArrangementContext.tsx:541`).
  - **Verdict:** keep. It is one lifecycle and a small amount of code, and splitting it further would add prop plumbing.
  - **The real signal:** the rule for coalescing repeats during a gesture belongs next to `gestureCountRef` in the provider, not at 60+ call sites.
  - **Proposal for planner:** if finding 1 is not fixed this round, one bounded task: gesture-aware status coalescing in `ArrangementProvider` and `status-announcement.ts`.
    - Acceptance: a blocked move held for ≥ 40 moves adds ≤ 2 spans, SU1–SU4 still pass, and `setStatus`'s public type is unchanged.
    - Value: low, risk: low.

This is a review of the diff only. The modules were not fully audited.

### Alternative Approach
- **Current:** every string update increments `sequence` and a keyed span re-announces it. Repeats during a gesture are left to the call sites, which is deferred to the frozen `ArrangementClip.tsx`.
- **Alternative:** the same keyed span, but the reducer is gesture-aware. While a gesture is active, the same text returns `previous`, which means no commit and no announcement.
- **Verdict:** the alternative is better. It fixes the Low bug without adding the Medium one, stays inside owned files, and also covers the marker, envelope and fader readouts.
- **Rejected:** C's call-site approach (`setStatus(() => message)`). It works, but it is scattered, easy to forget at new call sites, and needs a frozen file.

### Score: 7/10
The mechanism is correct and the tests are strong. The regression in an existing flow is why I block. After the fix from finding 1 this would be 9/10.