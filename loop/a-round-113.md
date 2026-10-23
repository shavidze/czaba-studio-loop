# A — Round 113 report: a touch press must not jump the faders (A-R38-REVIEW-TOUCH, D-29z78)

## Start state
- HEAD `ad58b5e88b8f6c6c8b3c6766f59e8c0a14622aa3`; `git status --short --untracked-files=all` was empty at the start.
- Frozen list `b-round-112-r113-tree-sha256.txt` (`sha256sum -c --quiet`): **OK at the start**.
- Pre-flight was done. Primitives read: primitives-map, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, TAILWIND_FIRST/DESIGN_TOKENS (header only; no CSS change). No new hook was added, so new-hook.md was not needed.

## Chosen API and why
Option (a): `useRelativeFaderDrag` now returns `RelativeFaderDragBinding = { onPointerDown, ref }`.
- With one binding, every relative-drag fader gets the touch guard together with the relative drag, and a future fader cannot forget it.
- `ref` is a stable `useCallback([])` callback. It detaches the module-level `preventFaderTouchStartDefault` from the previous element and attaches it to the new one with `addEventListener('touchstart', …, { passive: false })`. It is attached at mount, not lazily on the first pointerdown.
- `ref(null)` on unmount or fold is the cleanup (React 18 has no ref-cleanup return).
- The handler only calls `preventDefault()`: no stopPropagation and no state.
- The `onPointerDown` body is byte-for-byte unchanged. Only its binding changed, from `return useCallback(...)` to `const onPointerDown = useCallback(...)`. The result is memoised with `useMemo`.

## Diff summary (git diff --stat: 4 files, +50 / −15)
- `app/hooks/useRelativeFaderDrag.ts`:
  - the `RelativeFaderDragBinding` interface;
  - the `preventFaderTouchStartDefault` function;
  - `touchFaderRef` and the stable `ref`;
  - the return value is now `{ onPointerDown, ref }`;
  - the multi-line react import (Biome format).
- `app/components/arrangement/ArrangementLane.tsx`:
  - `panSliderRef` is now `useRef<HTMLInputElement | null>`, a `MutableRefObject`, so no assertion is needed;
  - `panFaderDrag` / `volumeFaderDrag`;
  - a stable `panSliderCallbackRef = useCallback(el => { panSliderRef.current = el; attachPanFaderDrag(el); }, [attachPanFaderDrag])`;
  - track Volume input `ref={volumeFaderDrag.ref}` (this also covers the video track Volume);
  - the `useCallback` import.
- `app/components/arrangement/ArrangementMaster.tsx`: `masterFaderDrag`, plus `ref` and `onPointerDown` on the Master Volume input.
- `app/components/arrangement/ArrangementGroupHeader.tsx`: `groupVolumeFaderDrag`, plus `ref` and `onPointerDown` on the group Volume input.
- New: `app/lib/arrangement/__tests__/fader-touch.test.tsx`.
- New: `docs/implementation/2026/quarter-IV/097-studio-fader-touch-no-jump.md`. The l.4 status line is exactly the string B required.
- Not changed: Zoom/`ArrangementTransport.tsx`, `fader.ts`, `ArrangementContext.tsx`, CSS/classes, the Clip Gain input, the meters and every existing test.

## Tests
`fader-touch.test.tsx`, 7 tests (FT7 added after the review):
- **FT1:** a cancelable `touchstart` is default-prevented on music Volume, Pan, Master, group Volume and video Volume.
- **FT2 (must-not):** on Zoom it is not prevented, and Zoom has 0 `touchstart` registrations.
- **FT3:** each of the five inputs (the four faders + video Volume) has registrations exactly `[{ passive: false }]`, a strict `toEqual` after the review. This uses a call-through spy on `EventTarget.prototype.addEventListener`, correlated with `mock.contexts`, and restored in `afterEach` (`vi.restoreAllMocks`).
- **FT4:**
  - three context re-renders leave exactly one registration per fader;
  - after `unmount` the same input elements receive a `touchstart` that is not prevented;
  - a remount registers exactly once per fader, and those faders are prevented.
- **FT7:** after folding the music lane, the old Volume and Pan inputs are detached and no longer prevented. After unfolding, the new inputs are different elements with exactly one `{ passive: false }` registration, and they are prevented. This covers the same hook with a new element.
- **FT5:** on all four faders, `pointerdown(pointerType touch)` + `touchstart` + window `pointerup` with no move leaves the value unchanged, the undo label unchanged and the gesture inactive.
- **FT6:** a touch relative drag of −25 px over 100 px moves the music Volume 0.6 → 0.35 with one `Volume` entry, and undo restores 0.6, the same numbers as F2.

The group is created in the test as in track-group-mix-ui (click the stems lane, Shift-click SFX, Ctrl+G → „ჯგუფი 1“).

Targeted run, `npx vitest run` on 9 files: fader-touch 7, fader-click 26, fader-guards 71, fader-focus-order 5, pan-release-recovery 8, master-ui 18, track-group-mix-ui 10, meter-ui 12, context-hygiene 10. Final run, with fader-touch at 7 tests: **9 files / 167 tests passed**, 0 failed (`a-round-113/vitest-targeted.txt`).

## Mutation proof
These were temporary local edits of the store file. The hook was restored from `a-round-113/hook.fixed.ts` and Lane from `lane.fixed.tsx`, and `cmp` confirmed both were identical afterwards. Outputs are in `a-round-113/m1–m4.txt`.

| Mutation | Red | Green |
|---|---|---|
| m1: `preventDefault()` removed | FT1, FT4, FT7, FT5, FT6 | FT2, FT3 |
| m2: `passive: true` | FT1, FT3, FT4, FT7, FT5, FT6 (jsdom honours passive) | FT2 |
| m3: no detach from the previous element | FT4, FT7 | the rest |
| m4 (extra): inline unstable Pan ref | FT3, FT4 (run before FT7 existed) | the rest |
| m5 (extra, after the review): `addEventListener` without options | FT3, FT7 | the rest |

m1, m2, m3 and m5 were rerun on the final test file. FT5 and FT6 turn red on m1/m2 only because of the shared `defaultPrevented` assert: jsdom has no native thumb, so their value and history checks guard the `onPointerDown` touch path, not the jump itself.

## Checks
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It reports 218 warnings + 1 info repo-wide, which are pre-existing; the scoped check below shows none in the owned files.
- `npx biome check` on the 5 owned code/test paths: clean, after a one-line format fix in the test.
- No `npm run check` / `--write`, no full suite and no verify (speed rules).

## Optional Chromium self-probe (NOT a substitute for C)
- Files: `a-round-113/probe/touch-probe.cjs`, which uses `lib.cjs` copied unchanged from c-round-112. Output: `a-round-113/out/touch-probe.json`.
- Setup: the round-112 recipe with **−4 px** moves, 1440×900, `hasTouch: true`, sounds layout, 1 run per target, against the already-running server at :5173.
- Results:
  - Zoom: 678 → 63 on touchStart (still jumps, so the harness is valid).
  - Volume: start 1 → 1; moves 0.96 … 0.81; one "Undo: Volume". 0.19 ≤ 20 px eq. 0.187 + 0.01 step.
  - Pan: 0 → 0; moves −8 … −42; one "Undo: Pan — მუსიკა". 42 ≤ 41.67 + 1.
  - Master: 0 → 0; moves −2.5 … −13.5; one "Undo: Master Volume". 13.5 ≤ 13.75 + 0.5.
  - Tap on Volume and on Master: the value is unchanged, and the Undo title stays „Undo: დამატება — Soft impact“ (no entry).
  - All 6 sessions: 0 console errors, 0 hydration errors, 0 forbidden requests, 0 Authorization headers.
- **Not probed by A:** group Volume, video Volume, 1280×720, 3 runs per target, Ctrl+Z, double-tap, and the MC-*/KB rows. These are C's rows.
- The first probe attempt crashed in `setSnapOff` with a null selector. An immediate diagnostic load showed the grid control present and 0 errors, and the rerun was clean. It was most likely the dev server reloading the changed modules during navigation. It is reported here, not hidden.

## Code-reviewer (actual `code-reviewer` subagent, after the first test version)
**Score 8.5/10**, no Critical or High findings. It compared `onPointerDown` with the round-104 snapshot of the hook and found it unchanged line for line. It confirmed that the ref stability, the listener lifecycle, StrictMode, the spy restore, the rules (no any/assert/comments) and the doc's accuracy are all correct.

| Finding | Severity | Action |
|---|---|---|
| The fold/unfold path (same hook, new element) is untested | Medium | **Fixed:** FT7 added. m3 and m5 turn it red. |
| FT3 `typeof options === 'object' && options.passive` passes when options are missing | Low | **Fixed:** strict `toEqual([{ passive: false }])`. The new mutation m5 (no options) turns it red. |
| FT5/FT6 turn red on m1 only through the shared prevented assert, so the mutation table overstates them | Low | **Fixed in the doc and this report:** the limit is now stated explicitly. The tests were kept. |
| Touch double-tap reset is lost | Low | Already accepted by B (R4, TOUCH-DOUBLE-TAP-RESET). No change. |
| The video fader is in FT1 but not FT3 | Nit | **Fixed:** FT3 now loops over all five inputs. |
| `live` / `range` helper names are hard to grep | Nit | Not changed: they match the existing sibling harnesses (fader-click, track-group-mix-ui), for consistency. |

**Architecture note (for B, verbatim):** "Signal 4 (new listener lifecycle in an existing owner) at `app/hooks/useRelativeFaderDrag.ts:41-45`, plus a small ref coupling at `app/components/arrangement/ArrangementLane.tsx:394-401`. Keep: it is the same element and the same gesture concern, an idempotent five-line callback covered by FT3/FT4, and splitting it out would add a second hook that new faders could forget to use. No proposal for the planner."

The reviewer had no shell and read the files directly; it reviewed them against the round-104 snapshot, not `git diff`.

## End state
- `git status --short --untracked-files=all`: the 4 ` M` (the four app files) + 2 `??` (the new test, doc 097). This matches the expected end state; every consumer file needed a change.
- Frozen list at the end (`sha256sum -c --quiet`): **OK**.
- Final checks after the review fixes: typecheck exit 0, lint exit 0, the scoped Biome check on the 5 paths is clean, and the targeted vitest run gives 9 files / 167 tests passed.

## B acceptance criteria I truly passed (A-side only)
- §2 file ownership and frozen list. Protected files untouched (they are inside the frozen list).
- §3 FT1–FT6 (+FT7) written and green; m1/m2/m3 shown red; the targeted file list green; typecheck and lint run.
- Doc 097 written, with the required l.4 status line.

**Not claimed:** every TC-*/MC-*/KB-*/REG/PX/G113-3 row. They are C's browser rows; A's probe is only a self-check.

## Known gaps and deviations
- The reviewer noted that a cancelled `touchstart` probably also suppresses the long-press `contextmenu` on these faders. It is the same mechanism as R4, but B owns the signal; A did not verify it.
- R4: on touch, a double tap no longer resets a fader (accepted by B; the info signal is TOUCH-DOUBLE-TAP-RESET). A did not measure it in the browser.
- No deviation from the owned files. The FT1 scope was extended to include the video Volume (it is the same track Volume input).

## Exact next C checks
- Run TC-ZOOM, TC-START, TC-REL (−4 px), TC-UNDO, TC-TAP, TC-DTAP (info), MC-PRESS, MC-DRAG, MC-DBL, KB-ARROW at 1440 (3 runs) and 1280 (1 run). Priority: **group Volume** and **video Volume** (TC-VIDEO-VOL), which A did not probe.
- Run T113-TARGETED with the same 9 files; expect 167 tests (fader-touch 7).
- AN-REVIEW: the native non-passive listener is in `useRelativeFaderDrag.ts` `ref`; the cleanup is the previous-element detach; Zoom is untouched; there are no assertions.
- SOURCE-SCOPE, PX-NET, REG-HYD, G113-3 and DOC-097 as in the task.

## Status
A's work for round 113 is complete and awaits C. A-R38-REVIEW-TOUCH is NOT closed by A: that needs C's browser rows.
