# C — Round 57 verification (SRW-14 stage 4b-1 lane grid menu + C-R51-02 + C-R48-01-GRID-RESIDUAL)

Verifier: C · 2026-10-17, 21:52–22:10 +04 · Source read-only · No A claims trusted without a re-run.

## Summary

- **Offline scope: PASS.** G57-2, R57-S, R57-U (a–g) and G57-1 pass, re-run by C with C's own scripts.
- **Browser scope: not run (environment) — this is the SIXTH round without a browser.**
  - `127.0.0.1:5173/studio-lab` and `:5199` returned `000` at 21:52, 22:05 and 22:05:50. No listener; C did not start a server.
  - So the lane grid menu has **no real-mouse, real-Chrome or real-audio evidence**.
  - MN-*, R57-FOCUS, R57-PLAY, R57-LOOK, the whole carried 4a browser half and G57-3 (purchase protection; last browser PASS in round 51) are **not PASS**.
- **Feature status:** SRW-14 4b-1 stays **მოწმდება**, not მზადაა. Unit PASS is not a product PASS.
- **New findings:** 2 Low test gaps, both reproducible by mutation:
  - **C-R57-01:** focus return after a choice is untested.
  - **C-R57-02:** A's claim that GM3 covers C extra (i) is wrong.
- **Code-reasoned risks for B's browser probes** (not filed as bugs, because they were not reproduced): G1 (click after the consumed press), G6 (Follow auto-scroll closes the menu), G5, focus ring and enter transition. See §6.

## G57-2 — tree: PASS

From `c-round-57/g57-2-tree.txt` and `end-state.txt`:
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948` at start and end. Case (A).
- `git status --short` has **25 lines**:
  - the 22 baseline lines;
  - `?? ArrangementGridMenu.tsx`, `?? grid-snap-menu.test.tsx` and `?? 050-…md`.
- Frozen list: 410 entries, 0 non-OK (start and end).
- Snapshot SHA256SUMS 4/4 OK. Protected files 4/4 OK (start and end).
- `node.exe`: 9 throughout.

## R57-S — static: PASS (with deviations ruled below)

**Diffs** (`--strip-trailing-cr`; `diff-lane.txt`, `diff-sw.txt`, `diff-gsui.txt`):
- **ArrangementLane:** only the `type MouseEvent` import, the optional `onGridMenuRequest` prop and its destructure, and `onContextMenu` (`preventDefault()` then the prop) on the timeline element (now l.743).
- **StudioWorkspace:** only §0.1/§0.2 hunks:
  - the import and the menu state/refs;
  - `closeGridMenu`, `handleGridMenuRequest`, the choose/toggle wrappers and the scroll/resize/blur effect;
  - the prop on lanes and the render;
  - the brace clause in `releaseEditFocusOnTimelinePointerDown`, inside the existing gutter and gesture guards.
- **grid-snap-ui:** only the 3 second arguments.

**Token equivalence (C's own method, stronger than a whitespace strip).**
- `scripts/asteq.cjs` parses both versions with the TypeScript compiler API. It removes `{ timeout: 15_000 }` from 3-argument `describe` calls and compares the printed AST.
- Results:
  - grid-snap-ui: 3 options removed, **AST-equivalent**;
  - grid-snap-loop-drop: 4 options removed, **AST-equivalent**.
- Negative control: one `toBe(` changed to `toEqual(` gives `astEquivalent false` (`r57-s-asteq.txt`).
- Deviation D1 (the Biome re-indent at l.700) is therefore within the R56-S-DEV1 allowance.
- **Recommendation to B:** adopt this AST method as C's standard.
- A first scanner-based attempt mis-tokenised template literals and was discarded as a tool error. It is not evidence.

**`it` counts:** grid-snap-ui 20, grid-snap-loop-drop 27, grid-snap-menu 19. The 19 IDs are exactly GM1–GM15 and FR1–FR4. Both top-level describes in the new file carry `{ timeout: 15_000 }`.

**EOL** (node count, CRLF / LF):

| File | CRLF / LF |
|---|---|
| StudioWorkspace | **1746 / 1746** (0 bare LF) |
| ArrangementGridMenu | 0 / 168 |
| ArrangementLane | 0 / 934 |
| grid-snap-ui | 0 / 733 |
| grid-snap-loop-drop | 0 / 757 |
| grid-snap-menu | 0 / 684 |
| doc 050 | 0 / 108 |

**Banned-pattern scan** (`r57-s-scan.txt`):
- No comments, `any`, type assertions, `@ts-*` or hex/rgb colours. The only `as` is the import alias `MouseEvent as ReactMouseEvent`.
- The only inline style is the dynamic `left`/`top` allowed by M11.
- The test file has no `.skip`, `.only`, `.todo`, `retry`, `setConfig` or per-`it` numeric timeout.

**Tokens:** `bg-surface`, `border-outline`, `text-foreground`, `hover:bg-elevated`, `text-accent` and `ring-brand` all resolve to `--color-*` in `app/styles/app.css`. No `biome-ignore` was needed.

**Left-button guards are intact. Line references have shifted:**
- `handleLaneBackgroundPointerDown`'s `event.button !== 0 || event.target !== event.currentTarget` is now **SW l.1023** (task: l.963).
- The Lane height-separator `event.button !== 0 || event.buttons === 0` is now **Lane l.466** (task: l.463).
- Clip, Ruler and Brace are byte-identical (frozen list OK).

**Doc 050** has the date, status (`Round 57 — D-29z22; C-ის შემოწმებას ელოდება`), project, context, approach, architecture (1 Mermaid), changed files, problems, testing, Ableton and TODO sections.

**Deviation rulings (C's view; B decides):**
- **D1:** confirmed by the AST method. Accept.
- **D2, D5:** FR4 and GM3 were strengthened within the 19 IDs. Accept. See C-R57-02: GM3 does not do what A said for (i).
- **D3:** Biome `--write` ran only on LF files. Accept; SW stdin-format = same.
- **D4:** a plain function component, not `forwardRef`, although the task cites `FORWARDREF_COMPONENT.md`. The sibling precedent holds (no ref consumer; the `components/arrangement/` siblings are plain functions), but this departs from a cited primitive. **For B's ruling**; not a failure.
- **D6:** `preventDefault` only for handled keys. Accept; this is better for browser shortcuts.

## R57-U — unit and mutation (C's own scratch and strings): PASS

**Setup:**
- Scratch at `c-round-57/scratch`: a copy of `store/app` plus C's own `vitest.config.mts`.
- `node_modules` was a junction made with `cmd //c mklink //J`. It was **removed at the end**; `store/node_modules` still has 618 entries.
- After all runs, `diff -rq` showed scratch app = store app.
- Script: `scripts/cmut.cjs`. Each mutation is a regex that must match exactly once, then the file is restored (`restored=true` every time).
- Each run covered grid-snap-menu, grid-snap-ui and gesture-guard: 58 tests.
- Output: `mutations.txt` and `mut-*.json`.

| # | C's mutation | Result | Required | Verdict |
|---|---|---|---|---|
| a | Lane `onContextMenu` without `event.preventDefault()` | 4 failed: GM1, GM2, GM3, GM12 | GM1 | killed ✔ |
| b | `changeGridDivision(next)` → `setGridSeconds(next)` | GM4 (status text) | GM4 | ✔ |
| c | the menu `onKeyDown` `stopPropagation` → `void event` (keyup stop kept) | GM7, GM8, GM9 | GM7/GM9 and GM8 | ✔ |
| d1 | the capture `pointerdown` listener never registered | GM10 (menu stays) | GM10 | ✔ |
| d2 (C extra variant) | listener kept, but no `preventDefault`/`stopPropagation` (close only) | GM10 (`m1` selected) | — | ✔ GM10 checks the swallow, not just the close |
| e | guard reduced to `exportOpenRef.current` | GM12 | GM12 | ✔ |
| f | the brace clause → `(false)` | FR1, FR3; FR2 passes | FR1, FR3 | ✔ |
| g | the brace clause → `(isLoopBraceTarget(focused))` (blur on every press) | FR4 | FR2 or FR4 | ✔ |
| h (extra) | `gridMenuReturnFocusRef.current = null` before close on a division choice | **0 failed** | info | survives → **C-R57-01 (Low test gap)** |
| i (extra) | guard → `if (gridMenuOpenRef.current \|\| !gridMenuOpenRef.current)` (re-stores focus while open) | **0 failed** | info | survives → **C-R57-02 (Low)** |

**Why (i) survives:**
- On a reposition, the mutant stores the focused menu item.
- Closing unmounts that item, so `isConnected` is false and focus is left alone.
- GM3 only asserts that focus did not move during the reposition, which is also true under the mutant.
- What is lost is the **original** return target, for example the Snap button of GM11. No test opens, repositions and then presses Escape with a non-body origin.
- A's §6 #4 claim "This also covers C extra (i) at unit level" is **not true**.

**Alone durations** (`menu-alone.txt`, node 9):
- 19/19 passed in 9.47 s.
- GM1 1098 ms (cold mount); every other test ≤ 460 ms (GM7). None is over 3 s.

**Test-body review (IDs no mutation targets):**
- GM4 asserts the exact status string, the `<select>` value, every lane's `data-grid-seconds`, `undoLabel` null, and that `Ctrl+Z` changes neither the division nor the arrangement.
- GM5 asserts start `7.25` and that it is a 0.25 multiple.
- GM6 checks both status strings against the source (`SNAP_OFF_MESSAGE` l.96 and the `toggleSnap` template l.824).
- GM11 asserts the return to the Snap button.
- GM13 asserts the division is unchanged.
- GM14 covers the header, ruler, loop strip and library title.
- GM15 asserts the position advances after the fake clock moves.
- **Gap:** GM2's snapshot has no explicit **insert marker** field. It compares `position`, `range`, `activeTrackId`, `loop`, `undoLabel`, selection and clips. Info only.

## G57-1 — gates: PASS

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npx biome check ./app` | 362 files, **5 errors / 218 warnings / 1 info** |
| Biome errors | exactly the baseline CRLF `format` list: StudioWorkspace, auth-bugs, grid.test, render-budget, auth.ts |
| Biome on the 5 LF owned/new files | rc 0, "No fixes applied" |
| `biome lint StudioWorkspace.tsx` | rc 0 |
| stdin-format of the LF copy | **identical** (SW-STDIN-SAME) |
| `npx vitest run` | **88 files / 1523, rc 0**, 0 `Test timed out`, 61.8 s, node 9 |
| `npm run build` | rc 0 (19.42 s / 6.33 s) |
| `npm run verify` | quiet, alone, node 9 at 22:03:24: **verify_rc=0 on attempt 1** (88/1523, built 19.65 s / 6.08 s) |

Files: `tsc.txt`, `biome-*.txt`, `full-vitest.txt`, `build.txt`, `verify-1.txt`.

## §4.6, §4.7, G57-3 — not run (environment; sixth round)

Server checks:

| Time | `/studio-lab` | `:5199` |
|---|---|---|
| 21:52 | 000 | 000 |
| 22:05:36 | 000 | 000 |
| 22:05:50 | 000 | 000 |

- No gstack or Playwright session was opened, so there is no `c-browse.json` state this round.
- **Not run:**
  - MN-OPEN*, MN-EDGE*, MN-NATIVE, MN-CHOOSE, MN-SNAP, MN-KEYS, MN-DISMISS, MN-NOEDIT;
  - R57-FOCUS, R57-PLAY (real audio graph and meter), R57-LOOK*, at 1440×900 and 1280×720;
  - §4.7: R55-SHIFT, R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY EP-*, R52-REG, REG-HYD;
  - **G57-3:** the anonymous `/studio-lab` and purchase-protection check (no `/api/studio-token`, `/api/download`, R2 or Authorization traffic; anonymous token 401; `/studio/middle-east` asks for sign-in).
- **Purchase protection is unverified in the browser since round 51.** Code-level evidence only: the 4 protected files are hash-identical, and the round changes touch no route, auth or network code (the reviewer and C's diff read agree).
- **The full user flow** (find sound → add → fit video → export WAV with duration, sample and timing checks) and the FB-01..FB-16 regression: not run (environment; also outside the round scope).

## Ableton — two verdicts per row

Source: Live 12 manual §6.10 via B's capture `b-round-46/ableton-6.7-6.10-20261016.txt`. C did no new web check (not needed: no new or contradictory claim).

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Grid width from a lane context menu | PASS at unit level (GM1, GM3); MN-OPEN not run | entry point **confirmed** (§6.10 "track main lanes"); content **deliberate difference** (seconds, no adaptive/fixed or triplets) |
| Grid items on a clip's context menu | PASS at unit level (GM2, GM3); browser not run | **unconfirmed** (no source); a CZABA decision |
| Snap item in the menu | PASS at unit level (GM6); MN-SNAP not run | the toggle is **confirmed** (Ctrl+4 / Options); in the context menu it is **unconfirmed**; `G` instead of Ctrl+4 is a **deliberate difference** |
| Current spacing shown | PASS at unit level (GM4 `<select>` and status) | **deliberate difference** in placement (header control vs above the ruler) |
| Right-click does not edit | PASS at unit level (GM2, GM10, mutation d2); MN-NOEDIT not run | **unconfirmed**; CZABA rule M4 |
| Keyboard ownership after a timeline press | PASS at unit level (FR1–FR4, mutations f, g); R57-FOCUS not run | **unconfirmed**; CZABA rule D-29z17 |
| Narrow/widen Ctrl+1/Ctrl+2 | not this round | confirmed in §6.10; **does not apply** to 4b-1 (→ 4b-2) |

## Bugs (new)

- **C-R57-01 (Low, test gap).** Mutation h, which drops the focus return on a **choice** (M10, second bullet), passes all 58 tests.
  - The behaviour exists in code (`closeGridMenu` restores on every close), but nothing guards it.
  - Fix in 4b-2: assert `activeElement` = the pre-open element after choosing an item, in the GM11 style.
- **C-R57-02 (Low/info, test gap and report accuracy).** Mutation i (re-store focus on a reposition while open) passes all 58 tests. A's statement that the strengthened GM3 covers (i) is wrong.
  - Real-browser impact is small: a real right-click's `pointerdown` closes the menu first, so the open-path guard covers it.
  - A bare `contextmenu` (keyboard ContextMenu key, M12) on top of an open menu loses the original return target.
  - Fix: one assertion — non-body origin, open, reposition, Escape, then expect the origin.

## Open probes for B (code-reasoned, not reproduced; not in the bugs array)

1. **G1 / reviewer #1 (Medium; near-certain by spec, schedule the fix now).** The Pointer Events spec's compatibility-mapping section says that cancelling `pointerdown` suppresses only the compatibility `mousedown`/`mouseup`; `click` is not a compatibility mouse event and still fires. C cites this from knowledge of the spec and did not re-fetch it this round. M9's specified mechanism (a capture `pointerdown` with `preventDefault` + `stopPropagation`) therefore **cannot** meet M9's requirement ("that press does nothing else") when the dismissing press lands on a button (header Snap, Play, Export, video expand, library row). This is a contradiction inside the task spec, not observed CZABA behaviour. It stays out of the bugs array because there is no CZABA reproduction. The browser probe confirms the extent, not the existence: open the menu, REAL-click the header Snap toggle, and read `data-snap`.
2. **G6 / reviewer #2 (spec ambiguity).** A Follow auto-scroll while playing sets `scrollLeft`, which fires `scroll`, which closes the menu at the page flip. **B must rule:** should only user scrolls close it? Probe: R57-PLAY with Follow on across a page flip.
3. **G5.** In Windows Chrome, `contextmenu` fires after `pointerup`. Does a second right-click with the menu open (`pointerdown` cancelled by M9) still reopen it at the new point? Expected: one menu at B.
4. **Focus ring.** The item is focused programmatically after a mouse right-click, so Chrome's `:focus-visible` may not show `ring-brand` on open. R57-LOOK must record which item shows a ring. Info.
5. **Reviewer #9.** The `position: fixed` menu during the `PageTransition` enter transform. Check at first open after navigation.
6. **G7.** The M5 export-dialog guard has no unit test. Add it to 4b-2 within B's ID list.

## Carried (unchanged this round; nothing touched)

- **`root-pre-push-review.md` (mtime 2026-10-07):**
  - video sync RF3-1, RF3-2, R5-L6 (C-R27-01) open;
  - R5-L3 partially measured;
  - R5-L5, R5-E1, R6-S2, R6-S3 tested by unit tests only;
  - M1 (rAF-only loop refill; a hidden tab goes silent) and M2 (per-frame `position` re-renders);
  - L1–L8. L1 is not widened by the menu, because the menu does not open during a gesture.
- **`publication-checkpoint.json` (mtime 2026-10-17 11:11):**
  - SRW-21 (the purchased loader hardcodes `middle-east`);
  - portable instruction paths;
  - scrollbar refinement at 1280×720 and 1440×900;
  - library and stems parity (SRW-12 tree, SRW-11 panel, honest demo stems, find → stems → preview → drag);
  - T12.
- **Open C bugs (status unchanged):**
  - C-R53-01, C-R54-01, C-R54-02 (browser pending);
  - C-R51-01 (→ 4b-2);
  - C-R52-T1 (→ 4c);
  - C-R41-01;
  - C-R27-01, C-R6-02, C-R8-01;
  - C-R23-01 + C-R38-01.
- **C-R51-02:** fixed at unit level (FR1/FR3 plus mutation f). **Browser R57-FOCUS not run**, so it is not closed.
- **C-R48-01-GRID-RESIDUAL:** **closed**. The 7 options are present, AST-equivalent and run without a timeout.
- **Lows/info list:** as in task §4.9.

## Commit readiness (for root)

- **Round 57:**
  - The offline gates pass, and the diff is within §3.1.
  - No browser evidence. The G1 Medium risk is open and unverified.
  - Its hunks share `StudioWorkspace.tsx`, `ArrangementLane.tsx` and `grid-snap-ui.test.tsx` with the uncommitted rounds 50–55. **It cannot be committed as a separate unit without splitting hunks.**
  - Status: commit-ready as an **interim, unit-verified** change only.
- **Round 56:** commit-ready. Its 4 test files and doc 049 are unchanged this round (frozen list OK), and C's round-56 PASS stands.
- **Rounds 50–55:** unchanged since C's earlier reviews. No open offline defect, but still no browser evidence; root decides.

## Files

All under `c-round-57/`:
- `checkpoint.md`, `g57-2-tree.txt`, `end-state.txt`;
- `diff-lane.txt`, `diff-sw.txt`, `diff-gsui.txt`;
- `r57-s-scan.txt`, `r57-s-asteq.txt` (and `r57-s-tokeq.txt`, the discarded scanner attempt);
- `scripts/asteq.cjs`, `scripts/cmut.cjs`, `mutations.txt`, `mut-*.json`, `menu-alone.txt`;
- `tsc.txt`, `biome-app.txt`, `biome-app-errors.txt`, `biome-owned.txt`, `biome-sw-lint.txt`, `sw-lf.tsx`, `sw-fmt.tsx`;
- `full-vitest.txt`, `build.txt`, `verify-1.txt`;
- `scratch/` (app copy plus config; junction removed).
