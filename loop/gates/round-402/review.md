COMMIT: OK

I reviewed the diff, not the whole module. I read the new `lane-virtualization.test.tsx` and doc 256 only by name and did not open them. I relied on C's PASS and `verify.log` for them, and I did not run anything.

## Findings (ranked, none blocking)

1. **Low — `ArrangementLane.tsx:61` and `:72-100`: gesture pins live in a ref and are read during render.**
   - **Behaviour:** pinning needs no re-render, because the clip is already mounted when the pointer goes down. A re-render from a scroll or page change reads the ref and keeps the clip mounted.
   - **Gap:** on release, `unpin` doesn't re-render, so a pinned clip that is now outside the window stays mounted until the next page change or render. That is harmless, and it cannot cause a leak.
   - **Fix, optional:** none needed. If it ever matters, bump a `useReducer` tick inside `unpin`, only when the clip is outside `laneWindow`.

2. **Low — `ArrangementLane.tsx:61-71`: `gestureClipIds` and `mountedClips` are rebuilt on every lane render.**
   - **Cost:** this is O(clips) per lane per render, and the perf run measured it (116.5 vs 57.75 components per scroll step).
   - **Fix, optional:** wrap in `useMemo` keyed on `clips`, `laneWindow` bounds, `pxPerSecond` and `laneMoveSourceIds`. This isn't safe unless the pin ref is also keyed, so leave it unless the budget gets tight.

3. **Low — `ArrangementLane.tsx:99`: the `blur` unpin listener is not capture and not pointer-scoped.**
   - **Behaviour:** it unpins everything for that pointer on window blur, and it is removed in `unpin`.
   - **Risk:** it cannot leak.
   - **Edge case:** if the window blurs mid-drag and focus then returns, the drag continues unpinned. In that case the clip could unmount mid-gesture if the page changes.
   - **Fix:** none needed, because a blur effectively aborts the gesture.

4. **Info — same-lane group members are not pinned.**
   - **Where it is recorded:** the doc and perf check (f) record this as D-29z1379. The perf check fails if a copy is mounted unexpectedly.
   - **Effect:** a Ctrl+D copy outside the window mounts only after release.
   - **Risk:** acceptable, since the model drives movement and `check (c)` verifies the result after release.

5. **Info — budgets.**
   - **Headroom:** `scale.dom.page.min-zoom-mid` is 1868 against a limit of 2000, about 7%. The counts are deterministic, so this is fine.
   - **Ceiling:** the scroll limit of 140 is an openly accepted regression against 57.75 at HEAD, with a named follow-up (PERF-CAND-14-SCROLL-HYSTERESIS).

## What I checked and found fine

- **Event ordering:**
  - **Pin handler:** `onPointerDownCapture` runs before the clip's own `onPointerDown`. So the pin is registered before `setPointerCapture` at `ArrangementClip.tsx:559`, and the unmount-mid-capture case is covered.
  - **Release listeners:** the `window` capture listeners for `pointerup` and `pointercancel` run before any propagation stop.
  - **Overlapping pointers:** a second pointer with the same id replaces and unpins the earlier one.
- **Leaks:** all three window listeners are removed in `unpin`. The unmount effect unpins every remaining pin, and `useSyncExternalStore` handles the scroll subscription. When there is no `timelineWindow`, it falls back to a stable no-op subscribe.
- **SSR and hydration:** the server snapshot is `''`, which parses to `null`, so the window is `undefined` and every clip is mounted. Hydration therefore matches, and a zero viewport also mounts all clips.
- **Existing flows:** lane-move sources are always mounted. The `ArrangementClip` has no `tabIndex` or key handlers, so unmounting off-window clips cannot drop keyboard focus.
- **Tailwind and tokens:** no styling changes. There are no `any`, `@ts-ignore` or type assertions; the only cast-like constructs are `instanceof Element` narrowing and a `closest<HTMLElement>` generic.
- **Auth, purchase and download:** none of the nine paths touch them.
- **Test edits:** `pinOutsideClips` pins the clips so the PERF-3d tests (WG2–WG5) still isolate the waveform-window logic rather than virtualization. That is legitimate.
- **Perf spec:** `copyDelta` now returns `null` instead of `NaN`, and the check handles it explicitly. The setup now does one reveal instead of two.

## Architecture note

- **Signal (new lifecycle in an existing owner), `ArrangementLane.tsx:59-100` and `:108-115`:** `ArrangementLane` now owns a per-pointer gesture-pin registry, with window listeners and its own cleanup. It sits next to the existing `panBlurSuppression` pointer-lifecycle code (`:117-`) and the `pxPerSecond` and window logic.
  - **Keep it now, because:**
    - The pins are tied to the lane's mount decision and to the clip-view capture ordering.
    - It is about 40 lines and has a single lifecycle.
    - Extracting it now would add prop plumbing for no gain.
  - **Proposal for the planner (one bounded task, not for this round):** if a third pointer-lifecycle registry appears in this file, extract a `useGesturePins()` hook in `app/lib/arrangement/`. It would return `{ pinnedIds(): Set<string>, onPointerDownCapture }`.
    - **Ownership:** the lane keeps `mountedClips` and the window.
    - **Acceptance:** pin and unpin behaviour on `pointerup`, `pointercancel`, `blur` and unmount stays unchanged, and `lane-virtualization.test.tsx` passes without edits.