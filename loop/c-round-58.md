# C — Round 58 verification (D-29z23: G1 click swallow, G6 Follow scroll, GM18–GM20 test gaps)

Verifier: C · 2026-10-18, 12:04–12:14 +04 · App source read-only · Every gate re-run by C; A's claims not trusted without a re-run.

## Summary

- **Offline scope: PASS.** C re-ran G58-2, R58-S, R58-U (mutations a–h and the round-57 a/d1 re-run) and G58-1 with C's own scripts and strings.
- **Browser scope: not run (environment). This is the SEVENTH round without a browser.**
  - `127.0.0.1:5173/studio-lab` and `:5199/api/products` returned `000` at **12:04:19, 12:11:37 and 12:13:26**, with no LISTEN socket on either port.
  - `root-start-servers.cmd` exists in the loop folder, but the servers were not running. C did not start or stop anything.
- **What has no evidence:**
  - D2's timing assumption has no real-Chromium evidence. The release is `pointerup` + one macrotask, so `click` must arrive in the same task as `pointerup`. **MN-DISMISS-BUTTON is the only proof, and it was not run.** C did **not** build a standalone harness for it (user steering: no standalone copies).
  - MN-FOLLOW, MN-REPOSITION, the round-57 browser half, the carried 4a half and **G58-3** (purchase protection; last browser PASS in round 51) were all not run. **None of them is PASS.**
- **New C findings:** 2 Low test gaps, proven by surviving mutations (C-R58-01, C-R58-02), plus 1 info (C-R58-INFO-M). None blocks commit readiness.
- **Feature status:** SRW-14 4b-1 stays **მოწმდება**, not მზადაა. Unit PASS is not a product PASS.
- **Closed this round (unit level):** C-R57-01 (GM18 kills mutation f) and C-R57-02 (GM19 kills mutation g).

## G58-2 — tree: PASS

From `c-round-58/g58-2-tree-start.txt` (12:04) and `g58-2-tree-end.txt` (12:13):
- HEAD is `038ed5a45f94596a264c14c4ec834607cb407948` at start and end, so this is case (A).
- `git status --short` has **26 lines**: the 25 baseline lines plus `?? docs/implementation/2026/quarter-IV/051-studio-lab-grid-menu-dismiss-click-follow-scroll.md`. It matches §3.1.
- Frozen list: 414 entries, 0 non-OK at start and end.
- Protected files: 4/4 OK at start and end.
- `node.exe`: 9 at every measurement.
- End sha256 of the owned files:
  - StudioWorkspace `ed3973b0…`;
  - ArrangementGridMenu `3b8c309c…`;
  - grid-snap-menu `0fde6b48…`.

## R58-S — static: PASS

**Diffs** (`--strip-trailing-cr` against B's snapshots: `diff-menu.txt`, `diff-sw.txt`, `diff-test.txt`):
- **ArrangementGridMenu.tsx:** two changes only.
  - The module-level `armGridMenuDismissClickSwallow(view: Window)`.
  - One call, `armGridMenuDismissClickSwallow(window)`, placed after the existing `preventDefault()`/`stopPropagation()` and before `onCloseRef.current()` in `handleOutsidePointerDown`.
  - The inside-menu early return is unchanged, so a press inside the menu arms nothing.
- **StudioWorkspace.tsx:** one hunk in the open-menu effect only.
  - `closeGridMenuOnUserScroll` replaces `closeGridMenu` in the scroll add/remove calls.
  - `resize`/`blur` are unchanged, and `handleTimelineScroll` is unchanged (no shared callback).
  - The predicate keeps the menu open only if all of these hold: `isPlaying`, `followModeRef === 'on'`, and either the browser clamp or `|left − autoScrollLeftRef| ≤ FOLLOW_SCROLL_TOLERANCE_PX`.
  - That is the same clamp expression as `handleTimelineScroll`, so it matches §0.2.
  - C's reasoning on listener order: React's `onScroll` handler runs before the native listener, because it was attached earlier. In the clamp case it first updates `autoScrollLeftRef`; on a user scroll it pauses Follow first. Either way the menu handler gives the same answer as `handleTimelineScroll`'s classification.
- **grid-snap-menu.test.tsx:** the diff is a single pure-addition hunk of the 6 new `it` (GM16–GM21) inside the first describe. The describe option is unchanged.

**AST check of the 19 existing `it`:**
- `c-round-58/scripts/asteq-it.cjs` parses both files with the TypeScript compiler API and compares the printed AST of each `it` by title.
- Result (`r58-s-asteq.txt`): **19/19 identical**, 0 missing; added GM16–GM21; 25 `it` in total.
- Negative control: replacing `toBe(false)` with `toBe(true)` in a copy is detected (7 changed).

**Swallow scope** (read in code):
- **Listeners:** exactly four, all with `capture: true`:
  - `click` swallows (`preventDefault` + `stopPropagation`) and releases;
  - `pointerup` and `pointercancel` schedule one `view.setTimeout(release, 0)`, once only (guarded by `releaseTimer === null`);
  - `pointerdown` releases without touching the event.
- **Release:** it clears the timer and removes all four listeners, and it is idempotent.
- **Not affected:** `contextmenu`, `auxclick`, `dblclick` and keyboard events are never listened to.
- **The arming press itself:** the `pointerdown` listener is added during the window-capture dispatch of the arming `pointerdown`. Under the DOM dispatch rules it does not fire for that same event. The test results confirm this: otherwise GM16 would fail.

**EOL** (node count, CRLF / LF):

| File | CRLF / LF |
|---|---|
| StudioWorkspace | **1761 / 1761** (0 bare LF) |
| ArrangementGridMenu | 0 / 197 |
| grid-snap-menu | 0 / 794 |
| doc 051 | 0 / 103 |

**Banned patterns** (`r58-s-scan.txt`, added lines only):
- No `any`, assertions, `@ts-*`, comments or colour literals.
- No `.skip`, `.only`, `.todo`, `retry`, `setConfig` or per-`it` numeric timeout.
- The scan's single hit is `view.setTimeout(releaseClickSwallow, 0)`, a false positive of C's timeout regex.

**Doc 051:**
- It has the date, status (`Round 58 — D-29z23; C-ის შემოწმებას ელოდება`), context, approach, architecture (Mermaid sequence), changed files, problems, testing, Ableton and TODO sections.
- Content checked:
  - the GM3 correction (l.14: "GM3 does **not** cover (i); GM19 does now");
  - the armed-while-unmounted note (l.30);
  - doc 050 is stated as frozen.

## R58-U — unit and mutation: PASS for a–h (C's own strings, `c-round-58/scripts/cmut.cjs`)

**Method:**
- Scratch: `c-round-58/scratch` is a copy of `store/app` with C's own `vitest.config.mts` and a `node_modules` junction (removed afterwards).
- Files run: grid-snap-menu, grid-snap-ui and gesture-guard, 64 tests.
- Each mutation pattern matched exactly once and was restored afterwards (`restored=true`). After the run, `diff -rq` showed the scratch identical to `store/app`.
- Output: `c-round-58/mutations.txt` and `mut-*.json`.

| # | C's mutation | Failed | Failing tests | Verdict |
|---|---|---|---|---|
| a | the arm call removed | 1 | GM16 | killed |
| b | `releaseClickSwallow` returns immediately | 5 | GM15, GM16, GM17, GM18, GM20 | killed |
| c | only the `click` listener added | 2 | GM15, GM17 | killed |
| d | scroll add back to `closeGridMenu` | 1 | GM21 | killed |
| e | scroll handler returns immediately | 2 | GM13, GM21 | killed |
| f | (C's round-57 h) return-focus ref nulled before close in choose | 1 | GM18 | killed |
| g | (C's round-57 i) store guard always true | 1 | GM19 | killed |
| h | `exportOpenRef` dropped from the request guard | 1 | GM20 | killed |
| r57-a | Lane `onContextMenu` without `preventDefault` | 5 | GM1, GM2, GM3, GM12, GM20 | still kills GM1 |
| r57-d1 | outside `pointerdown` listener not registered | 3 | GM10, GM16, GM17 | still kills GM10 |
| **j** (extra) | arm the swallow on a press **inside** the menu too | **0** | — | **survives → C-R58-01 (Low)** |
| **k** (extra) | the releasing `pointerdown` also calls `preventDefault` | **0** | — (expected GM10 or GM17) | **survives → C-R58-02 (Low)** |
| l (extra) | drop the `isPlaying` clause from the scroll predicate | 1 | GM13 | killed |
| m (extra) | drop the `followModeRef === 'on'` clause | 0 | — | survives → info C-R58-INFO-M |

- **Why b and c fail more tests than named:** a set that is never released leaks across tests within the same jsdom file. This agrees with A's explanation.
- **Durations, menu file alone** (`menu-alone.txt`): 25/25 pass. The longest test is GM1 at 282 ms (the first test, which includes warm-up). The new tests:

  | Test | ms |
  |---|---|
  | GM16 | 119 |
  | GM17 | 66 |
  | GM18 | 54 |
  | GM19 | 42 |
  | GM20 | 102 |
  | GM21 | 49 |

  No test exceeds 3 s.

## G58-1 — gates: PASS

`c-round-58/gates-meta.txt` and the files it lists; `node.exe` was 9 before and after.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, empty output |
| `npx vitest run` (quiet) | **88 files / 1529 tests passed**, rc 0, 58.04 s; 0 `timed out` |
| `npm run build` | rc 0 (`✓ built in 2.51s`) |
| `npx biome check ./app` | 5 errors / 218 warnings / 1 info. The errors are exactly the baseline CRLF format list: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx and auth.ts (`biome-app-errors-full.txt`). |
| Biome on the 2 LF owned files | rc 0, no diagnostics |
| `biome lint StudioWorkspace.tsx` | rc 0 |
| StudioWorkspace stdin format check | output equals the LF copy (`STDIN FORMAT EQUAL`) |
| `npm run verify` | **rc 0 on attempt 1** (12:10–12:11:37; 88 / 1529; build ✓) — `verify-1.txt` |

## §4.6, §4.7, G58-3 — not run (environment, seventh round)

- **§4.6** was not run: MN-DISMISS-BUTTON* at 1440×900 and 1280×720, MN-REPOSITION (G5), MN-FOLLOW (G6), and the R57 browser half (MN-OPEN*, MN-EDGE*, MN-NATIVE, MN-CHOOSE, MN-SNAP, MN-KEYS, MN-DISMISS, MN-NOEDIT, R57-FOCUS / C-R51-02, R57-PLAY real audio, R57-LOOK*, focus-ring probe 4, reviewer #9).
- **§4.7** was not run: R55-SHIFT, R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY (EP-*), R52-REG and REG-HYD.
- **G58-3** was not run, so there is no fresh evidence that the anonymous `/studio-lab` workspace works and premium auth is not bypassed. That covers: no studio-token, recording or download requests and no R2 or Authorization traffic; the anonymous studio-token request returning 401; and `/studio/middle-east` showing "Sign in required". **The last browser PASS was round 51.**
- **Also not run** (task §4.9 plus the user brief): the full find → add → fit video → export WAV flow (WAV data, duration, sample integrity), video transport sync, the real audio graph or output, and the FB-01..FB-16 regression. Missing evidence is not PASS.
- **Timing risk carried to B:** if Chromium dispatches `click` after the `pointerup` + 0-ms timer, G1 is not fixed in the product. A reviewer #3 says this is likely on Android touch. The unit tests cannot detect it.

## New findings (to B)

**C-R58-01 (Low, test gap): arming the swallow on a press inside the menu is undetected.**
- **Mutation j:** add `armGridMenuDismissClickSwallow(window)` before the inside-menu `return` in `handleOutsidePointerDown`. All 64 tests still pass.
- **Real impact if it regressed:** a real mouse press on a menu item would swallow that item's own `click`, so no division could be chosen with the mouse.
- **Why tests miss it:** GM4/GM6/GM18 choose with a bare `fireEvent.click` and no preceding `pointerdown`.
- **Proposed guard (B decides):** one menu choice made with a full `pointerDown` → `pointerUp` → `click` sequence on an item.

**C-R58-02 (Low, test gap): the "release without touching the next pointerdown" clause is undetected.**
- **Mutation k:** `releaseClickSwallow` calls `event?.preventDefault()` on the next `pointerdown`. 0 failures; the task expected GM10 or GM17 to fail.
- C grep: no `pointerdown` handler under `components/arrangement/` reads `defaultPrevented`. The only readers are a keydown Escape check (l.1155) and the drop handler (l.1363). So in jsdom the mutation is behaviour-invisible.
- **In a real browser** a cancelled `pointerdown` suppresses the compatibility `mousedown`. That can affect native default actions such as text selection or focus on the next press after a dismiss. This is unverified (no browser).
- **Proposed guard (B decides):** assert `fireEvent.pointerDown(...)` returns `true` for the press after a dismiss, in GM10 or GM17(b).

**C-R58-INFO-M (info): the `followModeRef === 'on'` clause is unguarded.**
- **Mutation m** drops it, and the tests still pass.
- The effect is narrow: while playing with Follow **paused**, a user scroll that lands within the tolerance of the stale anchor would keep the menu open.
- GM13 kills the `isPlaying` drop (l) but nothing covers Follow-paused. This is info for the 4b-2 test-gap list, not a bug.

**Not re-filed:** A's reviewer items #1–#6 are already routed A → B: A-R58-REVIEW-HELD-PRESS-KEY-CLICK, AFTEREACH-RELEASE, ANDROID-TAP-CLICK, the rightClick-while-open trap, GM21 not driving `positionStore`, and pointercancel/right-dismiss untested. C agrees with A's Low ratings. C additionally notes that #1 (Enter on a focused button while a dismissing press is held is swallowed) contradicts M9's "keyboard events unaffected" only in that narrow window, and doc 051 records it.

## Ableton (two verdicts per row)

Source re-used from B: Live 12 Reference Manual §6.10 (`b-round-46/ableton-6.7-6.10-20261016.txt`). There is no new capture, video or Live installation.

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| The dismissing press, including its click, does nothing else | Unit PASS (GM10, GM16, GM17; mutations a/b/c/r57-d1). MN-DISMISS-BUTTON browser: **not run** | unconfirmed (no source; native-menu analogy only) |
| The menu stays open during Follow auto-scroll; a user scroll closes it | Unit PASS (GM13, GM21; d/e/l). MN-FOLLOW browser: **not run**. Follow-paused case unguarded (INFO-M) | unconfirmed (no source) |
| Focus returns to its origin after a choice, or after a reposition plus Escape | Unit PASS (GM11, GM18, GM19; f/g) | unconfirmed (WAI-ARIA menu pattern, not Live) |
| No grid menu while the export dialog is open | Unit PASS (GM20; h) | does not apply (modal dialog) |
| Grid width from the lane context menu | unchanged from round 57; browser half not run | confirmed §6.10 (round-57 row); content is a deliberate difference |

C does not claim that Live behaves this way for any of the first four rows.

## Commit readiness (for root)

- **Round 58:** **interim, unit-verified only.**
  - Offline gates pass; the open findings are Low test gaps.
  - Its StudioWorkspace hunk sits in the same file as the uncommitted rounds 50–57, so it cannot be committed alone without hunk-splitting.
  - The G1 fix is not browser-proven.
- **Round 57:** interim, unit-verified. It shares files with 50–55 and 58, as B stated. G1 is now addressed at unit level.
- **Round 56:** commit-ready (C round-56 PASS; test-only + doc 049).
- **Rounds 50–55:** root's decision. There is no open offline defect, but they have no browser evidence.
- None of C-R58-01/02/INFO-M blocks any of the above.

## Carried items (unchanged; still open)

- **Open C bugs:**
  - browser-pending: C-R51-02 (unit-fixed), C-R53-01, C-R54-01, C-R54-02;
  - later stages: C-R51-01 (4b-2), C-R52-T1 (4c), C-R41-01;
  - Tech Lead: C-R27-01, C-R6-02, C-R8-01, C-R23-01 + C-R38-01.
- **Open Low/info:** the §4.9 list (R26-M1 … A-R57-REVIEW-PAGE-TRANSITION), plus A's new A-R58-REVIEW-* items and C-R58-01/02/INFO-M.
- **Mtimes verified by C at 12:15:** `root-pre-push-review.md` 2026-10-07 18:22:57 and `publication-checkpoint.json` 2026-10-17 11:11:24. Both are unchanged since B recorded them, so the findings below are current.
- **`root-pre-push-review.md`** (still open):
  - Video sync: RF3-1, RF3-2, R5-L6 (C-R27-01). R5-L3 is partially measured.
  - Unit tests only: R5-L5, R5-E1, R6-S2, R6-S3.
  - **Medium:**
    - M1: the loop refill is rAF-only, so a hidden tab goes silent.
    - M2: the per-frame `position` in the context value re-renders every consumer.
  - **Lows:** L1 (undo/redo mid-gesture), L2 (`holdUntil` on reschedule), L3 (Delete ignores `event.repeat`), L4 (a `setPointerCapture` throw leaves gesture state), L6 (export wording with the loop on), L7 (unbounded history), L8 (unguarded `new AudioContext`).
- **`publication-checkpoint.json`** (still open):
  - SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
  - Instruction files need portable paths.
  - Scrollbar tokens on both timeline axes and the library, checked at 1280×720 and 1440×900.
  - Library/stems parity: the SRW-12 tree, the SRW-11 panel, honest demo stems, find → stems → preview → drag.
  - T12 continuation.
- **Root:**
  - ENV-DEV-SERVER-DOWN-R52, now in its **seventh round**. `root-start-servers.cmd` exists but the servers were not running at C's three checks. Root: please start them before C, or answer whether they can be restored here.
  - ROOT-COMMIT-ROUND51 units, ARCH-CHECKPOINT-SRW14-PREFS (A adds: scroll classification now exists twice, so a pure `classifyTimelineScroll` is proposed), GSTACK-ACL / GSTACK-NO-MOUSE, the CRLF Biome errors, `store/nul`.
- **Tech Lead manual:** the earlier list plus **R58-T**.

## Artifacts

`c-round-58/`:
- tree: `g58-2-tree-start.txt`, `g58-2-tree-end.txt`;
- static: `diff-menu.txt`, `diff-sw.txt`, `diff-test.txt`, `r58-s-asteq.txt`, `r58-s-scan.txt`;
- mutations: `mutations.txt`, `mut-*.json`;
- gates: `menu-alone.txt`, `gates-meta.txt`, `tsc.txt`, `full-vitest.txt`, `build.txt`, `biome-app.txt`, `biome-app-errors-full.txt`, `biome-owned.txt`, `biome-sw-lint.txt`, `sw-lf.tsx`, `sw-fmt.tsx`, `verify-1.txt`;
- scripts: `scripts/asteq-it.cjs`, `scripts/cmut.cjs`;
- `checkpoint.md`; `scratch/` (junction removed).

No browse state was created because no browser test ran.
