# A — Round 57 report (SRW-14 stage 4b-1 lane grid menu + C-R51-02 + C-R48-01-GRID-RESIDUAL)

Implementer: A (Claude Opus 5.5) · 2026-10-17, 21:14–21:4x +04 · Decision: D-29z22 · No PASS claimed; C verifies.

## 1. Pre-flight gate and baseline

**Pre-flight gate (posted before the first edit):**
- **Assumptions:**
  - The menu is a second entry point into the existing `changeGridDivision`/`toggleSnap`, with no new grid logic.
  - Right-button presses are already ignored by the lane, clip and brace handlers (`button !== 0`).
  - The M10 focus is read synchronously in the lane `contextmenu` handler, after the scroller pointerdown capture has run.
  - The key stop is React `stopPropagation`, which runs before the window bubble listeners. Escape is not `preventDefault`ed, so mutation (c) is observable via the floating-video branch.
- **Smallest version:** the new component (~160 lines), about 70 added lines in StudioWorkspace, 7 lines in ArrangementLane, the 7 describe options, the test file and doc 050.
- **Files:** exactly §3.1.
- **Success:** vitest 88/1523, tsc 0, build 0, scoped Biome 0, mutations a–g each kill their named tests.

**Read before the first edit:** read-primitives.md; AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; prompts new-component, studio-feature, new-test; TEMPLATE.md; the pre-flight skill.

**Baseline (21:14): case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` showed exactly the 22 listed paths.
- Frozen list 410: 0 non-OK. Snapshots `SHA256SUMS.txt`: 4/4 OK, and `cmp` showed all 4 owned files the same.
- Protected 4/4 OK. `node.exe` 9.
- `/studio-lab` 000 and `:5199` 000 (no listener).

## 2. Diff summary per file (EOL counts: CRLF / LF)

| File | Change | EOL |
|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` (new) | `<div role="menu" aria-label="ბადის დანაყოფი">` containing 7 `<button role="menuitemradio">` (`GRID_DIVISIONS_SECONDS` order, `formatGridDivision` label, an aria-hidden `✓` in `text-accent`), an `<hr>` and `<button role="menuitemcheckbox">Snap (G)`. Roving `tabIndex`; focus on the checked item on mount (`preventScroll`). Keys: ArrowDown/Up with wrap, Home/End, Enter/Space choose; Escape/Tab close; every keydown/keyup is `stopPropagation`ed; `preventDefault` on everything except Tab and Escape. A window capture `pointerdown` consumes an outside press (`preventDefault` + `stopPropagation` + close) and is removed on unmount. Clamp in a layout effect: `[4, innerWidth − offsetWidth − 4]`. Tokens only: `bg-surface border-outline text-foreground`, `hover:bg-elevated`, `focus-visible:ring-brand`, `z-50`, `h-7` (28 px), `font-mono tabular-nums`. The only inline style is the dynamic `left`/`top` (M11). **No biome-ignore needed.** | 0 / 162 |
| `app/components/arrangement/StudioWorkspace.tsx` | +70 / −2 lines vs snapshot. Import of `ReactMouseEvent` and `ArrangementGridMenu`; state `gridMenu {x,y}`, `gridMenuOpenRef`, `gridMenuReturnFocusRef`; `closeGridMenu` (restores focus if connected and not `body`, `preventScroll`); `handleGridMenuRequest` (export/gesture guards; stores activeElement only when the menu was closed); `chooseGridMenuDivision` = `changeGridDivision` + close; `toggleGridMenuSnap` = `toggleSnap` + close; an effect, while open, that closes on scroller `scroll`, window `resize` and `blur`; the prop on each `ArrangementLane`; the menu rendered at the workspace root (outside the scroller). **§0.2:** a separate `|| (isLoopBraceTarget(focused) && !isLoopBraceTarget(event.target))` clause in `releaseEditFocusOnTimelinePointerDown`, under the existing gutter and gesture guards. | **1746 / 1746** (0 bare LF) |
| `app/components/arrangement/ArrangementLane.tsx` | `type MouseEvent` import, the optional prop `onGridMenuRequest`, its destructure, and `onContextMenu` on the l.720 element (`preventDefault()`, then the prop). Nothing else. | 0 / 934 |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | 3 × `{ timeout: 15_000 }` (l.281, 391, 635). No re-indent. `it` count 20. | 0 / 733 |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | 4 × `{ timeout: 15_000 }` (l.355, 469, 581, 700). Biome re-wrapped the l.700 describe (line > 100) and re-indented its body (deviation D1). `it` count 27. | 0 / 757 |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (new) | Exactly 19 `it` (GM1–GM15, FR1–FR4). Two top-level describes, each `{ timeout: 15_000 }`. | 0 / 671 |
| `docs/implementation/2026/quarter-IV/050-studio-lab-grid-menu-stage-4b1.md` (new) | The §2.5 sections. | LF |

**End tree (21:41):**
- `git status --short` has **25 lines**: the 22 baseline lines plus 3 new `??` (menu component, menu test, doc 050).
- HEAD unchanged. Frozen list 0 non-OK; protected 4/4 OK.

## 3. Tests (alone, `--reporter=verbose`, 19/19)

| ID | ms | ID | ms | ID | ms |
|---|---|---|---|---|---|
| GM1 | 1177 (cold mount) | GM8 | 174 | GM15 | 253 |
| GM2 | 315 | GM9 | 197 | FR1 | 206 |
| GM3 | 232 | GM10 | 177 | FR2 | 166 |
| GM4 | 245 | GM11 | 188 | FR3 | 179 |
| GM5 | 329 | GM12 | 164 | FR4 | 133 |
| GM6 | 292 | GM13 | 204 | | |
| GM7 | 504 | GM14 | 128 | | |

No test exceeded 3 s alone. File: `a-round-57/menu-durations.txt`.

**Related run:** grid-snap-menu + grid-snap-ui + grid-snap-loop-drop + gesture-guard + floating-video gave 5 files / 130 tests passed.

**Notes on test strength:**
- GM9 makes one real nudge before opening the menu, so `undoLabel` is non-null and `Ctrl+Z` inside the menu is observable.
- GM12 asserts that `isPointerGestureActive()` is true before the right-click, and compares the result with a control drag in the same mount (7.925, then undo).
- FR1–FR4 call `element.focus()` and assert `activeElement` before the press.

## 4. Mutations a–g (A's scratch `a-round-57/scratch`; config and junction as in round 56)

Each run covered grid-snap-menu, grid-snap-ui and gesture-guard (58 tests), with the file restored after every mutation (`restored=true` ×3). Full output is in `a-round-57/mutations.txt`.

| # | Result | Failing tests |
|---|---|---|
| a | 4 failed | GM1, GM2, GM3, GM12 |
| b | 1 failed | GM4 |
| c | 3 failed | GM7, GM8, GM9 |
| d | 1 failed | GM10 |
| e | 1 failed | GM12 |
| f | 2 failed | FR1, FR3 (FR2 passes) |
| g | 1 failed | FR4 (after strengthening; see below) |

**Mutation g first survived (58/58).**
- Cause: `ArrangementLoopBrace.tsx` l.99 (`beginLoopGesture`) re-focuses the brace on every **left** press, which undoes a blur from the scroller capture.
- FR4 was strengthened within its own scope: a right-button press on the start edge comes first. The brace ignores it (`button !== 0`), so it cannot re-focus. The test asserts the focus is kept, then the original left press follows.
- g now fails FR4. FR2 still passes under g, which the task allows ("FR2 or FR4").

## 5. Browser smoke

**Not run (environment).** `/studio-lab` and `:5199` were 000 at 21:14 and 21:41 (curl rc 7, no listener). No server was started, and no gstack or Playwright was used.

## 6. Code-reviewer (real `code-reviewer` subagent, read-only, score 8/10) — findings and dispositions

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Medium | M9 is only half consumed. Cancelling `pointerdown` does not stop the following `click`, so dismissing the menu by clicking a **button** (header Snap, Play, video expand, a track-header button, a library row) also fires that control. | **Deferred to B (= my G1).** §0.1 M9 defines the mechanism exactly (a capture `pointerdown` listener), and the 19-ID cap leaves no test for a click swallow; adding one would be untested code outside the spec. Proposed task: a one-shot capture `click` swallow after a consumed press, removed on the next `pointerup`/`pointercancel` + `setTimeout(0)` and on unmount, never swallowing `contextmenu`. C: open the menu, REAL-click the header Snap toggle, and check `data-snap` (expected FAIL today). |
| 2 | Medium | While playing with Follow on, the follow auto-scroll sets `scroller.scrollLeft`, which fires `scroll` and closes the menu at each page flip. | **Deferred to B (spec ambiguity).** M8 says literally "a scroll of `arrangement-timeline-scroller`". Proposed rule: close only on user scrolls, e.g. ignore a scroll whose `scrollLeft` equals the follow target. C: R57-PLAY variant — keep the menu open across a follow page flip. |
| 3 | Low | `preventDefault` ran on every key (F5, Ctrl+R, Ctrl+F, zoom…). | **Fixed (also raised by the advisor).** `preventDefault` now runs only in the ArrowDown/Up/Home/End/Enter/Space branches; `stopPropagation` stays unconditional. GM7 still asserts that Enter is prevented. |
| 4 | Low | GM3 never exercises M6's reposition-in-place path: `rightClick` fires `pointerDown` first, which closes the menu. | **Fixed within GM3's scope.** The second open is a bare `contextMenu` on the video clip body. GM3 now asserts the same menu node, the new `left`/`top` (30/60 px) and that focus did not move (focus not re-stored), then Escape and a normal right-click. This also covers C extra (i) at unit level. |
| 5 | Low | Test gaps within the 19-ID cap: focus return after a choice (C mutation h survives), the M5 export guard, Tab not `preventDefault`ed, a `pointerdown` inside the menu keeps it open, listener removal on unmount. | **Deferred to B / 4b-2** (no `it` may be added). The M5 export guard is in code and unit-untested. |
| 6 | Low | After Tab with the stored focus = `body`, Chrome starts Tab navigation from the removed item's DOM position. | Accepted under M10. Recorded for B if it wants that focus defined. |
| 7 | Info | GM11 covers the code path. With a real mouse, a right-button press on a non-focusable lane moves focus to `body`, so most mouse opens store `body`. | Recorded. C should align R57-FOCUS expectations with this. |
| 8 | Info | The ContextMenu key or Shift+F10 on a focused element inside a lane opens the grid menu at synthetic coordinates. | Consistent with M12 (deliberate limit). Recorded. |
| 9 | Info | If `PageTransition` wraps `/studio-lab`, `position: fixed` could be offset during the 0.5 s enter transform. | C browser check (R57-LOOK). |

**Checked fine by the reviewer:** stale closures, double close, listener cleanup, key stops (including the floating-video Escape and CommandPalette's document listener), the gesture and export guards, the brace clause bracketing, `button !== 0` intact, `preventScroll`, a11y roles, tokens, security (no XSS, network or storage).

**Architecture note (verbatim intent, for B; no code changed):**
- **Signal 4 (new state/lifecycle in an existing owner):** StudioWorkspace gains the menu state, a mirror ref (`gridMenuOpenRef`), a return-focus ref and three more listeners. This is the fifth view-pref consumer under ARCH-CHECKPOINT-SRW14-PREFS. Keep it now (one lifecycle, shared guards). Separate-task proposal: move open state and return-focus ownership into the menu component, so the workspace passes only `{x, y} | null` plus callbacks.
- **Signal 3 (one region edited repeatedly):** `releaseEditFocusOnTimelinePointerDown` is now a three-branch boolean edited in consecutive rounds. Proposal: a small list of (focused-predicate, target-predicate) pairs, with the gesture and gutter guards outside it.
- **Alternative considered by the reviewer:** a full-viewport backdrop would fix #1 but breaks M6 (a right-click would hit the backdrop). Keep the capture listener and add the one-shot click consumer.

## 7. Command tails (verbatim)

```
$ npx tsc --noEmit            → rc 0 (a-round-57/tsc.txt empty)
$ npx vitest run              → Test Files  88 passed (88) / Tests  1523 passed (1523)  rc=0 (before the FR4 strengthening; no "Test timed out")
$ npm run build               → ✓ built in 5.64s  rc 0
$ npx biome check ./app       → Checked 362 files … Found 5 errors. Found 218 warnings. Found 1 info.
  errors (all CRLF format, baseline list): StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts
$ npx biome check <5 LF owned/new files>   → Checked 5 files … No fixes applied. rc 0
$ npx biome lint app/components/arrangement/StudioWorkspace.tsx → rc 0
$ biome format --stdin-file-path=…StudioWorkspace.tsx < LF copy → identical to the LF copy (SW-STDIN-FORMAT-SAME)
$ npm run verify (quiet, alone, attempt 1, after the FR4 change) → verify_rc=0; Test Files 88 passed (88); Tests 1523 passed (1523); ✓ built in 6.41s

FINAL TREE (21:45–21:50, after the advisor/reviewer fixes #3 and #4):
$ npx tsc --noEmit → tsc=0
$ npx biome check <5 LF owned/new files> → Checked 5 files … No fixes applied.
$ npx vitest run grid-snap-menu grid-snap-ui grid-snap-loop-drop gesture-guard floating-video → Test Files 5 passed (5) / Tests 130 passed (130)
$ node mut.mjs (final tree; scratch files cmp-same as store) → a 4 failed, b 1, c 3, d 1, e 1, f 2, g 1 (same tests as §4); restored=true ×3
$ npm run verify (quiet, alone, final attempt) → verify_rc=0; Test Files 88 passed (88); Tests 1523 passed (1523); ✓ built in 19.92s / ✓ built in 6.34s; no "Test timed out"
$ npx biome check ./app → Checked 362 files … Found 5 errors. Found 218 warnings. Found 1 info.
$ npx biome lint StudioWorkspace.tsx → 0; stdin format → SW-STDIN-SAME
$ EOL → StudioWorkspace 1746/1746; ArrangementGridMenu 0/168; grid-snap-menu 0/684
$ git status --short | wc -l → 25; frozen non-OK → 0; protected OK 4; HEAD 038ed5a45f94596a264c14c4ec834607cb407948
$ tasklist | grep -ci node.exe → 9 (start, before both verifies, end)
$ curl …/studio-lab → 000 (21:14, 21:41, 21:50)
```

The §2 line counts above predate the final fixes: ArrangementGridMenu is now 168 LF lines and grid-snap-menu 684. The §3 durations are from the run before the GM3 strengthening; all 19 pass on the final tree (inside verify).

## 8. Deviations

- **D1:** `grid-snap-loop-drop.test.tsx` l.700. With the option added, the line is over 100 characters, so `biome format` (on that LF owned file only) re-wrapped the describe and re-indented its body (108 changed lines in the diff). Token-equivalence check: remove `{ timeout: 15_000 },`, normalise trailing commas before closers, strip all whitespace; the result is identical to the snapshot. True for both files. 27/20 `it` unchanged. This is the R56-S-DEV1 allowance; C should re-check with C's own method.
- **D2:** FR4 gained a right-button press inside the brace (the mutation-g strengthening, §4). Still exactly 19 `it`.
- **D3:** Biome `--write` / `format --write` ran only on the new or LF owned files: the menu component, the menu test and the two grid-snap tests. It never ran on `StudioWorkspace.tsx`.
- **D4:** The component is a plain function component, like every sibling in `components/arrangement/`, not `forwardRef`. No ref consumer exists.
- **D5:** GM3 was strengthened after review #4: a bare `contextMenu` while the menu is open asserts the same node, the moved position and unchanged focus. Still exactly 19 `it`.
- **D6:** The menu `preventDefault` moved into the handled-key branches after review #3 and the advisor. Every key is still stopped (M7).

## Known gaps (for B/C)

- **G1 (M9 in a real browser):** the outside press consumes `pointerdown`, which prevents selection, seek, marquee, drag and the focus change. But the browser still dispatches the `click` that follows, so a left click on a **button** outside the open menu (Play, Snap, Export…) closes the menu **and** activates the button. jsdom cannot show this. Not changed this round, to keep §0.1 M9's mechanism exact. Proposed follow-up for B: a one-shot capture `click` swallow after a consumed press. C: check MN-DISMISS on a transport button.
- **G2:** Windows Chrome fires `contextmenu` after `pointerup`, not after `pointerdown`. The behaviour should be the same (M6/M10), but this is unverified in a browser.
- **G3:** the clamp (M11) and the 1280×720 / 1440×900 placement have had no browser check (jsdom sizes are 0).
- **G4:** mutation g is observable only through a non-left press inside the brace (§4). Left presses inside the brace are kept focused by the brace's own `focus()` regardless of the §0.2 clause.
- **G5 (M6 in Chrome):** the second right-click's `pointerdown` is `preventDefault`ed by M9. Unverified: does Chrome still dispatch `contextmenu` after a cancelled `pointerdown`, so the menu reopens at the new point? C: MN-OPEN variant — right-click a lane at A, then at B without closing; expect one menu at B. If it only closes, that is a bug for B, not a C failure of this round.
- **G6:** review #2 — the follow auto-scroll closes the menu during playback.
- **G7:** the M5 export-dialog guard is in code but unit-untested (no ID in the 19).

## Carried from root-pre-push-review.md (mtime 2026-10-07 18:22) and publication-checkpoint.json (mtime 2026-10-17 11:11)

Both files were confirmed present with the mtimes B quoted. **Nothing in them was touched this round; all items remain open as listed in §4.9:**
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **R5-L3:** partially measured.
- **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent;
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows L1–L8.** Note: L1 (undo/redo during a gesture) is not affected by the menu, because the menu does not open during a gesture.
- **SRW-21:** the purchased loader hardcodes `middle-east`.
- Portable instruction paths.
- **Scrollbar refinement:** both timeline axes and the library; 1280×720 and 1440×900.
- **Library and stems parity:** SRW-12 tree, SRW-11 panel, honest demo stems, find → stems → preview → drag.
- T12 continuation.

## Exact next C checks

1. G57-2, then R57-S:
   - diff against the snapshots;
   - EOL (StudioWorkspace 1746/1746);
   - the token-equivalence of D1 by C's method;
   - the 19 IDs; frozen 410; protected 4/4; doc 050.
2. R57-U: mutations a–g with C's own strings, plus extras (h) and (i), plus the alone durations.
3. G57-1: tsc, build, Biome, vitest 88/1523, `npm run verify` (quiet).
4. If the servers are up: §4.6 MN-*, R57-FOCUS, R57-PLAY, R57-LOOK. Add these probes:
   - G1: dismiss by REAL-clicking the header Snap or Play while the menu is open;
   - G5: right-click at A, then at B without closing;
   - G6: menu open across a Follow page flip while playing;
   - review #9: placement during the page enter transition.

   Then §4.7 and G57-3. Otherwise "not run (environment)", **sixth round**.

## Scope completed

- §0.1 M1–M12, §0.2 F and §0.3 T are implemented. §2.2's 19 tests are written and passing. §2.3 mutations a–g each kill their tests in A's scratch.
- The §2.4 unit gates pass. §2.5 doc 050 is written.
- **Not done:** the §2.4 browser smoke (environment).
- B acceptance criteria: none are claimed as PASS; C decides.
