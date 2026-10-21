# B — Round 60 result → Round 61 dispatch (D-29z26)

Dispatcher: B · 2026-10-18 · I own only the planning artifacts. No app source was touched.

## 1. Resume state and inputs

- **State at start:** `status.json` `B_PLANNING_NEXT`, round 60. No `b-round-60.md` and no `tasks/round-60.md` existed; `current-task.md` was the round-60 task (D-29z25). `b-round-60-result.json` (0 bytes) and `status.json` belong to the loop runner and were not touched.
- **Preserved before editing:**
  - `tasks/round-60.md`: a copy of the round-60 `current-task.md`, identical by `cmp`;
  - `b-round-60-pre-{current-task.md,backlog.json,feature-status.md,b-next.json}`;
  - `plan.before-b-round-60-r61.md`.
- **Read:** `current-task.md` (round 60), `a-round-60.md`, `c-round-60.md`, `c-round-60.json`; `backlog.json` (items, rounds, planned rounds, findings, architecture signals, done policy); `feature-status.md`, `b-next.json`, `b-round-59.md`, its scripts; `root-r60-recovery-note.txt`, `root-claude-checkpoint.md`; `plan.md` (D-29z25, §5 rows, §10). `root-pre-push-review.md` (12:46:34) and `publication-checkpoint.json` (2026-10-17 11:11:24) have the same mtimes as in round 60; their items are carried in §4.9 of the new task. Source: `ArrangementGridMenu.tsx` (all), `StudioWorkspace.tsx` l.850–960 (close/request, the menu-scroll effect, `handleTimelineScroll`), `grid-snap-menu.test.tsx` harness and GM11–GM31.
- **Tree check** (`b-round-60/gates.txt`, 18:19 +04): HEAD `038ed5a`; 29 status lines (case A); protected 4/4 OK; round-59→60 frozen list 0 non-OK; `node.exe` 12; **`/studio-lab` 200, `:5199` 200**.
- **Owned-file hashes:** `StudioWorkspace` `0ea67202` (CRLF 1807/1807), `ArrangementGridMenu` `baf32ff4` (LF 202), `grid-snap-menu` `12870d41` (LF 954, 35 `it`) = C's round-60 end hashes.

## 2. Round 60: what C evidenced

**C FAIL on one Low (MN-CONTEXT edge half → C-R60-01).** Only C's evidence below changes the backlog.

| Area | Evidence | Backlog effect |
|---|---|---|
| Offline | G60-2 (case A, 29 lines; frozen 416; protected 4/4); R60-S (AST 28/28 menu, 11/12 keys + GK9 rewritten + GK11); R60-U (a–m, r58 a/d, r59 a/j/k/m killed; n, p, q, xblurcap survive); G60-1 (tsc 0, Biome 5/218/1, 89 / 1552, verify rc 0 attempt 1) | 4b-2b offline PASS |
| G60-3 | anonymous `/studio-lab` direct + header; 0 forbidden requests; 0 `Authorization`; token 401; fake Bearer 403; `/studio/middle-east` sign-in | purchase protection holds |
| SEL-* | SEL-KEYS 1440/1280, SEL-ENDS, SEL-NATIVE, SEL-MOD (info), SEL-SNAP | **C-R59-01 closed**, A-R59-REVIEW-ARIA-KEYSHORTCUTS closed |
| Swallow | GM26–GM29 kill h/i/j/k; MN-KEY-RELEASE (fallback focus method); MN-BLUR-PROBE (synthetic) | ROOT-R50-58-L2 = HELD-PRESS-KEY-CLICK closed (rule as written) |
| Tests | `afterEach` release + probe; GM28–GM31 | L4 = AFTEREACH-RELEASE, MENU-TEST-GAPS, CANCEL-RIGHT, RIGHTCLICK-TRAP closed |
| MN-CONTEXT | item half PASS; edge half: prevented, but focus → `BODY`, Escape dead | L3 closed for native-menu suppression; **C-R60-01** (pre-existing, Low) |
| Regressions | MN-DISMISS-BUTTON ×2, MN-KEYS, KEY-NARROW, KEY-TYPE, MN-FOLLOW; EG-GROUP read-only | unchanged behaviour holds; C-R59-03 stays closed |
| Evidence | VSCROLL-PROBE: overflow 382, `scrollTop` 282 → 382, 1 `scroll`, menu open, Follow `on`; repeat probe | **ROOT-R50-58-L1 confirmed**; **C-R60-02** |

**Not run (honest, carried):** video sync (RF3-1, RF3-2, R5-L6 = C-R27-01); the full find → add → fit video → export flow with WAV checks; the FB-01..16 regression; smoke (root); the full 4a/4b re-run. Not testable headless: popup-open keys, real Alt-Tab, Ctrl/Cmd+digit, real-layout Shift+1.

**B error recorded:** round 60's MN-KEY-RELEASE premise ("focus returns to Export") was wrong for a mouse-opened menu. The round-57 M10 design restores only a non-body return target, and a lane's right `mousedown` moves focus to body first (INFO-R60-FOCUS-RETURN). The written method is now `locator.focus()` while the dismissing press is held.

## 3. B decisions (D-29z26)

1. **Round 61 = the round-60 C bugs first, plus the confirmed L1 and one test gap; 4c moves to round 62.** All four are in the same two source files and the same test file.
2. **C-R60-01 → D-29z26-F:** `onMouseDown` `preventDefault()` on the menu root when the target is not inside a `button`.
   - `mousedown` is the event whose default moves focus in every browser; `pointerdown` cancellation is Chromium-only.
   - Rejected: `tabIndex={-1}` on the root + refocus (changes the ARIA focus model, more code); a window-level Escape (arrows stay dead).
   - GM32's kill is the return value of `fireEvent.mouseDown`; the "focus inside" check is non-discriminating in jsdom (C's GM25 finding). The browser row MN-EDGE-FOCUS is the real focus evidence.
3. **C-R60-02 → D-29z26-K, amending D-29z25-R:** "any non-repeat key" releases. A named wrapper added and removed by the same reference (C's round-60 `xrepeat` build leaked with an inline arrow). Rejected: keeping "any key" (Shift/Ctrl-click outside the menu acts — a partial regression of round 58). The trade-off narrows to "a key pressed for the first time while the press is held".
4. **ROOT-R50-58-L1 → D-29z26-V:** record `scrollTop` when the menu opens; any change closes before the Follow exemption. No tolerance: Follow only writes `scrollLeft` (l.978). Follow mode is not paused by a vertical scroll (unchanged). Rejected: closing on `wheel` (rule S is scroll-based; C-R59-02).
5. **A-R60-REVIEW-BLUR-CAPTURE-TEST → GM35** (test only): the return target must be a real element (Snap focused before a `contextMenu` with no pointerdown), so the close refocus blurs the menu item and only a capture `blur` would see it. Spec-assumption stop if mutation f survives.
6. **Hard boundary:** round 61 is the last menu-only round (rounds 57, 58, 60, 61 on one owner and the same files). Afterwards, Low/info grid-menu findings are batched with the Lows; only Medium+ or a regression of C-verified behaviour pre-empts 4c. Basis: plan.md §5 ordering rule and the user steering (2026-10-15 and this run) not to delay core features for polish.
7. **Rulings:** A's D1–D4 accepted (D2: own PIDs only, no orphans). Not scheduled, recorded: INFO-R60-FOCUS-RETURN (linked to A-R57-REVIEW-CONTEXTMENU-KEY), INFO-R60-SHIFT1-SYNTH (→ R61-T), A-R60-REVIEW-GK11-EXPORT-STATUS (Lows batch; `grid-snap-keys` frozen), reviewer infos #3 and #5.

**Round size check:** one owner, one area (the grid menu and its swallow), three small source bugs + one test, ~10 source lines, +4 tests (89 / 1556). Stage 4c keeps its full scope at round 62.

## 4. Scheduling

| Round | Content |
|---|---|
| 61 | grid-menu fix-up (D-29z26): C-R60-01, C-R60-02, ROOT-R50-58-L1, GM35 |
| 62 | SRW-14 stage 4c: group-move edge snap (C-R52-T1), library-drop edges + the C-R51-01 decision, the INFO-R55 / SHIFT-MIDDRAG tests; an approved root ARCH change, if any, as its own B task around it |
| then | SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, the batched Lows, SRW-21, full regression + root review, then T12 |

Scope is unchanged and nothing is labelled deferred. Plugins and effects, pitch, multiple video layers and audio time-stretch stay out of scope. Grid tempo is not audio stretch.

## 5. Ableton

None of the three behaviours has a Live source: a press on a menu's non-item area, a held modifier while dismissing a menu, and a vertical scroll with a context menu open are all **unconfirmed**. The round-57 row (grid width in the track context menu, §6.10) is re-used as a regression row. Source re-used: B capture `b-round-46/ableton-6.7-6.10-20261016.txt`. No `/browse` was needed. Nowhere is "Ableton does the same" claimed.

## 6. Requests to root

1. **Servers:** keep 5173 and 5199 up through C round 61.
2. **Commit readiness:**
   - rounds 50–58 (`cb12805`) and round 59: ready (C);
   - **round 60: B rules it committable** as its own interim unit — its in-scope behaviour is C-verified, C-R60-01 is pre-existing and C-R60-02 conforms to the rule as written; both are fixed in round 61 (precedent: round 59 ready with C-R59-01 open). C's "hold" was pending this ruling;
   - round 61: only after C.

   All interim, not a release; via root's publisher flow only.
3. **ARCH-CHECKPOINT-SRW14-PREFS, re-requested** (feature boundary + accumulated risk on one owner): (a) snap-preference plumbing vs a non-history slice; (b) one time-precision rule; (c) the shared grid test harness; plus whether `useArrangementGridMenu` + `isFollowAutoScroll` should precede 4c. Answer before round 62; **B will not delay 4c past round 62 for it.**

## 7. Phase boundary

- SRW-14 stays **მუშავდება**: the round-61 fix-up, 4c and stage 5 remain.
- **The project is not complete.** Not BLOCKED: servers are up and nothing external is missing.

## 8. Advisor

**Available** (`claude-available.json`, and the tool answered). Called three times:
1. **After orientation, before writing:** confirmed the composition and owned set; contributed the hard-boundary wording, the `mousedown` rationale, the same-reference wrapper as a static check, the "record a non-zero `scrollTop` before opening" ordering that kills mutation (e), GM35's return-target setup, the mutation list, and the round-60 commit ruling.
2. **After `current-task.md`:** traced each kill chain against the source (GM32–GM35) and found none broken; asked for two text fixes (cite the basis of the hard boundary; spell out D2 as own PIDs). Both applied (`b-round-60/fix_task.js` and an in-place script).
3. **After `b-next.json`:** final check (§8.1).

### 8.1 Addendum — the post-write advisor call

- The four kill chains (GM32–GM35) were re-traced against the source; none is broken.
- **GM33 wording fixed:** after the first (swallowed) click the menu is closed, so the second half now says "reopen (`rightClick` on the music lane) → arm the same way", as GM26 does.
- **Listener count made precise** in the task §6.3, the feature-status ARCH line and the backlog note: the swallow registers six window listeners (click, pointerup, pointercancel, pointerdown, keydown, blur) plus a timer; round 61 replaces the keydown handler with a wrapper and adds none; the menu's own outside-press `pointerdown` effect is separate.
- Script: `b-round-60/fix_final.js`.

## 9. Outputs

- `current-task.md` (round 61); `tasks/round-60.md` (archive).
- `b-round-60-r61-tree-sha256.txt` (418); `b-round-60-r61-snapshots/` (3 files + `SHA256SUMS.txt`).
- `b-round-60/gates.txt`, `all-paths.txt`, `owned.txt`, `frozen-paths.txt`, `update_backlog.js`, `update_plan.js` (+ `patch_update_plan.js`: preserves plan.md's 14 bare-LF lines; a first attempt that normalized them was restored from `plan.before-b-round-60-r61.md` and re-applied), `update_fs.js`, `fix_task.js`.
- `backlog.json` (version 63), `feature-status.md`, `b-next.json` (CONTINUE).
- `plan.md`: D-29z26, rows `60 →` / `61` / `62`, §10.
