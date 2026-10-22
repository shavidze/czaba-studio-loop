# A round 75 — SRW-16 stage 2a fix-up (C-R74-01, A-R74-MU8E-POINTERUP, C-R74-02)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-21 · No commit/push/deploy. Rounds 74+75 remain uncommitted work in the tree.

## 1. Baseline (A, at phase start) — all OK
- HEAD `6b574e85`; `git status --short` = the 10 round-74 lines; frozen list 449/449 OK; snapshots 6/6 equal to the B hashes; protected 4/4 (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`); owned files LF, CR=0; `pgrep -c node` = 1; `:5173/studio-lab` 200. Pre-flight read: CLAUDE.md, `.claude/rules/*`, primitives-map, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/studio-feature.md, skills/pre-flight.

## 2. What changed
### F1 — `markers-ui.test.tsx` (test-only, narrow grant)
1. MU8 title: "… plain arrows on a focused marker move the marker and never nudge the selected clip".
2. l.526: `toBeNull()` → `toBe('Move Marker')`.
3. Added `expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);` right after it (clip-start check kept).
4. MU8e: `fireEvent.pointerUp(window, { pointerId: 75 })` after pointerDown 75 and `… 76` after pointerDown 76. The flags are not capture-stubbed, so `setPointerCapture` throws in jsdom and `watchUncapturedPointerGesture` listens on `window`, the same as MU8d's lane.
5. **F1.5 observable:** `expect(live(api).isPointerGestureActive()).toBe(false)` after the two pointerUps, before the F2 half. The two `toBe(drop)` focus assertions are kept.
No other bytes changed (+6/−2 lines vs the round-74 snapshot).

### F2 — marker menu closes when its flag moves on screen
- `ArrangementMarkerRow.tsx`: `closeMenu()` added to `ArrangementMarkerRowHandle`. It is a `useCallback([focusMarkerTarget, menu])` and is in the `useImperativeHandle` deps, so it always sees the current menu. With no menu open it does nothing. Otherwise it calls `setMenu(null)` and then `focusMarkerTarget(markerId)` (`preventScroll`). S4: `menuPxPerSecondRef` plus a `useIsomorphicLayoutEffect` closes the menu only when `pxPerSecond` actually changes, not on mount or open. It is a layout effect after the review, so no frame paints a stale menu position.
- `StudioWorkspace.tsx` (`handleTimelineScroll` only): `previousLeft` is read before `lastScrollLeftRef` is overwritten. `followAutoScroll = isPlaying && followMode==='on' && (clampedByBrowser || |left−autoScrollLeftRef| ≤ FOLLOW_SCROLL_TOLERANCE_PX)` is computed before `autoScrollLeftRef` is written. `if (left !== previousLeft && !followAutoScroll) markerRowRef.current?.closeMenu();`. The rest of the callback, the grid-menu effect, the key handlers and the JSX are unchanged.
- `ArrangementMarkerMenu.tsx`: **untouched**. No new close reason was needed.
- Doc 065: status line, Problem → Solution entries for C-R74-01, A-R74-MU8E-POINTERUP and C-R74-02 (S1–S4), file list, tests and TODO. Georgian, LF.

### Tests — `markers-move-ui.test.tsx` (MV1–MV14 byte-identical; new describe appended)
- **MV15 (S1/S3 + no-op):** with no menu open, a horizontal scroll keeps focus on the flag (closeMenu no-op). With the menu open, a `scrollTop`-only scroll keeps it open. `scrollLeft` 340 closes it: focus is on the flag, and markers, position (3), selection and undo label are unchanged. After the review: open, Escape, focus another flag, scroll → focus stays there (stale-handle guard).
- **MV16 (S2):** playing, Follow on, menu open. `scrollLeft` = anchor+1 (within tolerance) keeps it open and Follow stays on. anchor+200 closes it, focus goes to the flag, Follow is `paused`, and playback continues. jsdom reaches playing+Follow through `togglePlayback()`. Limit: jsdom has `scrollWidth−clientWidth = 0`, so the `clampedByBrowser` branch and leftward scrolls can't be tested here. C's MK-MENU-FOLLOW carries them.
- **MV17 (S4):** Ctrl+wheel on the scroller changes `pxPerSecond` (asserted), closes the menu, focus goes to the flag, there is no seek (position 2), and markers and undo are unchanged. A second zoom with no menu open does not move focus.

## 3. Mutation proofs (each restored, `cmp` OK; outputs in `a-round-75/mut-*.txt`)
| # | Mutation | Result |
|---|---|---|
| a | remove `closeMenu()` call in `handleTimelineScroll` | MV15 + MV16 red (re-run on the final MV15: 2 failed = MV15, MV16) |
| b | drop `&& !followAutoScroll` | MV16 red |
| c | drop `closeMenu()` in the pxPerSecond effect | MV17 red (re-run after the layout-effect change: 1 failed = MV17) |
| d | l.526 back to `toBeNull()` | MU8 red |
| e | drop both MU8e pointerUps | MU8e red at the F1.5 assertion (l.642 in the mutated file: "expected true to be false") |

b, d and e ran before the review fixes, on code and tests those fixes did not touch. a and c were re-run on the final state.

## 4. Commands actually run (final state)
- `npm run check` (non-mutating `biome check ./app`) — exit 0, 218 warnings, 0 errors. The project `/check` command (`.claude/commands/check.md`) also lists `npm run verify` + `test:e2e:smoke`; under the speed rules those belong to the root gate and A did not run them.
- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 218 warnings (repo-wide; none in owned files).
- `npx biome check` on the 4 owned code files — "Checked 4 files … No fixes applied", 0 diagnostics. No `--write` was used.
- `npx vitest run` markers.test.ts, markers-ui.test.tsx, markers-move-ui.test.tsx, delete-selection-ui.test.tsx, grid-snap-ui.test.tsx, view.test.ts, grid-snap-menu.test.tsx (the grid-menu/Follow files from `grep -rlE "ArrangementGridMenu|followMode|Follow"`) → **7 files, 183 passed, 0 failed** (MU8 green; final state after review fixes).
- Not run (root gate): full suite, build, `npm run verify`, e2e smoke.
- **A's browser sanity check (not C's acceptance), Playwright Chromium, 1440x900, `a-round-75/smoke.mjs` → `smoke.txt`, state `a-browse.json`.** After zoom-in and adding a marker with M, a right-click opens the menu. A 300 px horizontal wheel closes it: scrollLeft 0→300, the flag moved x 512→212, and `activeElement` is the flag. Reopen plus Ctrl+wheel closes it with focus on the flag. Console: only the expected cart/backend `ERR_CONNECTION_REFUSED` errors; no hydration or layout-effect warning.
  - Harness note for C: Playwright `locator.click({button:'right'})` on an off-screen flag scrolls it into view, and that scroll event can arrive *after* the menu opens, which closes it under S1 (seen in A's first attempt: menu count 0). Scroll the flag into view first, wait, then right-click by coordinates.

## 5. Code-reviewer (actual subagent, read-only) — 9/10, no Critical/High/Medium
- Low 1 (zoom close one frame late with a passive effect): **fixed**, `useIsomorphicLayoutEffect` from `~/hooks/useIsomorphicLayoutEffect`.
- Low 3 (weak no-op check): **fixed**, MV15 now also tests open → Escape → scroll.
- Low 2 (not fixed, outside grant, recorded for B): same-zoom `applyTimelineView` scrolls (fit, zoom-to-range, Zoom Back) pre-write `lastScrollLeftRef`, so they would not close an open marker menu. None of them can run while the menu is open today (outside press / menu keydown `stopPropagation` come first). It is a latent gap for future programmatic callers.
- Low 4 (info): jsdom can't test `clampedByBrowser`. In a browser a leftward user wheel near the right edge during Follow keeps the menu open, the same heuristic as the grid menu.
- **Architecture note (signal for B, not a refactor):** "`StudioWorkspace.tsx` now holds a second copy of the Follow auto-scroll predicate (grid menu effect ~l.1021-1029 and `handleTimelineScroll`), and the marker menu's lifecycle goes through `ArrangementMarkerRowHandle.closeMenu`. **Keep for now**: two short identical copies, both tested (MV16, GM21). Proposal: one bounded task, `isFollowAutoScroll(scroller, autoLeft, isPlaying, followMode)` in `lib/arrangement/view.ts` used by both call sites, with MV16 and the grid Follow tests as acceptance." The reviewer also named anchor-drift closing (flag rect moved) as a later alternative that would cover Low 2.

## 6. End state
- `git status --short` = the same 10 baseline lines (no new paths). Frozen 449/449 OK. Protected 4/4 unchanged.
- End sha256 (owned files):
  - `ArrangementMarkerRow.tsx` `8e0bb133f1c8488ad908427417179ba9ad5194b7ade64b9d90f09e0ab57e2bfe` (LF 812, CR 0)
  - `ArrangementMarkerMenu.tsx` `592bc1a749b91bda76568d3f7dfcd2cf809487080c315a03bc3a71dcf20b902f` (unchanged)
  - `StudioWorkspace.tsx` `753cecba36f6d78dd37eca29fa693f3174bbdaf531d0ba87ebb872af60b42885` (LF 2021, CR 0)
  - `markers-ui.test.tsx` `49a52e3467dead9525e40acb6ab930b8fdef797d0624e78295180f8f81f9e443` (LF 837, CR 0)
  - `markers-move-ui.test.tsx` `5c405434f47b3e5039609a7f3103e4b86a7175788013d9bc9df0ae62009b42d9` (LF 804, CR 0)
  - `065-studio-lab-marker-move-menu.md` `b34908610342ca118ff92262861c71cc785695327f5cf50a587f7cb6652a72b2` (LF 85, CR 0; l.11 now says 2b = round 76)
- Process note: while setting up the smoke script I briefly `cp`'d it into the store root as `.a-smoke-tmp.mjs`. A's own file, removed seconds later; the status check after removal showed the 10 lines.

## 7. B criteria A truly passed (unit level only)
- F1.1–F1.5, F2 (row, workspace, menu untouched), MV15/MV16/MV17 and the no-op assertion, mutations a–e, targeted vitest green, typecheck/lint, code-reviewer run with findings addressed.
- **Not claimed:** every C browser row (MK-MENU-SCROLL/VSCROLL/ZOOM/FOLLOW/DOCK, MK-74-RECHECK, REG-HYD, G75-3) and all gate rows. A's 1440 smoke is supporting evidence only.

## 8. Exact next C checks
1. Source-unchanged: the 6 sha256 above at C start and end; frozen 449/449; status = 10 lines.
2. MK-MENU-SCROLL (both viewports, right-click and Shift+F10), MK-MENU-VSCROLL, MK-MENU-ZOOM, MK-MENU-FOLLOW (including a leftward user wheel during Follow; see Low 4), MK-MENU-DOCK, MK-74-RECHECK, T75-TARGETED, REG-HYD, G75-3, per task §5.
3. Neighbours: grid-menu Follow exemption / VSCROLL-CLOSE, Follow pause on a user scroll, Ctrl+wheel zoom anchoring, Escape/Tab/outside close of the marker menu, MK-MENU-PLAY while playing.
