# CURRENT TASK — Round 75: SRW-16 stage 2a fix-up — C-R74-01 (test contract), A-R74-MU8E-POINTERUP, C-R74-02 (marker menu vs timeline scroll/zoom), D-29z40

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-74.md` (exact copy). Rationale: `b-round-74.md`. Decision record D-29z40 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related bugs of SRW-16 stage 2a, one owner (A). No new feature. **Stage 2b moves to round 76** (scheduled, not deferred): clips / range / playhead snap to markers (Live 12 §6.7) and Ctrl+←/→ (macOS Option+←/→, §6.9) also stopping at clip edges.

## Why this round
C round 74 (`c-round-74.md`, `.json`): **FAIL, `browserVerified=true`, `realVerified=true`**. Every real-browser row passed at 1440x900 and 1280x720 (MK-DRAG-SNAP/FREE/CLICK, MK-MOVE-DUP, MK-ARROW, MK-DRAG-PLAYING, MK-MENU, MK-MENU-RENAME/PLAY/DELETE, REG-STAGE1, REG-KEYS, REG-HYD, G74-3 non-backend). Two bugs:
- **C-R74-01 (medium, blocks the gate):** `markers-ui.test.tsx` MU8 l.526 `expect(live(api).undoLabel).toBeNull()` now receives `'Move Marker'`. This is a **B spec defect**: the round-74 task froze a stage-1 assertion that contradicts its own B5 (plain ←/→ on a focused flag moves it 0.1 s with Snap off). A correctly did not touch it.
- **C-R74-02 (low):** after a 300 px wheel scroll of the timeline the marker menu stays at its old fixed position while its flag moved 300 px left.
- **A-R74-MU8E-POINTERUP (low, test-only, A reviewer):** in MU8e the pointerdowns 75/76 never get a pointerUp, so a gesture claim stays active for the rest of the test and the name-editor half runs with `isPointerGestureActive()` true.

Root gate 74 was **skipped** (`gates/gate-round-74.json`: "C taskStatus FAIL"). Round 74's code is **uncommitted work in the tree. It is preserved, not reverted.** Round 75 fixes on top of it; the next gate publishes rounds 74+75 together. No Critical/High bug is open. The regression round is due on or after 2026-10-24 (`regression-last.json` = 2026-10-21).

## Baseline (measured by B, 2026-10-21)
- **HEAD `6b574e853d2c5c4317e38927d9d06ce2a3dba91b`** (gate 73 commit). **The valid start is NOT an empty tree.** `git status --short` must be exactly these 10 round-74 lines:
  `M app/components/arrangement/ArrangementGridMenu.tsx`, `M app/components/arrangement/ArrangementMarkerRow.tsx`, `M app/components/arrangement/StudioWorkspace.tsx`, `M app/lib/arrangement/__tests__/markers-ui.test.tsx`, `M app/lib/arrangement/__tests__/markers.test.ts`, `M app/lib/arrangement/markers.ts`, `M docs/implementation/2026/quarter-IV/064-studio-lab-markers.md`, `?? app/components/arrangement/ArrangementMarkerMenu.tsx`, `?? app/lib/arrangement/__tests__/markers-move-ui.test.tsx`, `?? docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md`.
- The 10 round-74 files match A's a-round-74.md §2 hashes (B re-checked: 7c8874b0, 8b805616, 592bc1a7, 0b59c36f, d5a1ac9c, b0e43760, a8508b4a, 5c7c697a, 608d86ec, b8368738).
- **Frozen list:** `../tmp/studio-real-loop/b-round-74-r75-tree-sha256.txt`, **449** entries, 449/449 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-74-r75-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 6 owned files below. `markers.ts`, `markers.test.ts`, `ArrangementGridMenu.tsx` and doc 064 are now **frozen**.
- **Snapshots:** `../tmp/studio-real-loop/b-round-74-r75-snapshots/` (`SHA256SUMS.txt`), all LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `ArrangementMarkerRow.tsx` | `8b805616` | 789 |
  | `ArrangementMarkerMenu.tsx` | `592bc1a7` | 160 |
  | `StudioWorkspace.tsx` | `d5a1ac9c` | 2012 |
  | `markers-ui.test.tsx` | `5c7c697a` | 833 |
  | `markers-move-ui.test.tsx` | `a8508b4a` | 716 |
  | `065-studio-lab-marker-move-menu.md` | `608d86ec` | 82 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` 200; backend `:5199` unavailable (expected). A and C re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (a different tree, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format`, `check:fix`.

## 1. What changes (A)

### F1 — C-R74-01 + A-R74-MU8E-POINTERUP: `markers-ui.test.tsx` (narrow grant, test-only)
Only these edits; every other byte of the file stays identical:
1. **MU8 title (l.518):** replace "plain arrows on a marker do not nudge" with wording that says plain arrows on a focused marker move the marker and never nudge the selected clip.
2. **MU8 l.526:** `toBeNull()` → `toBe('Move Marker')`.
3. **MU8, one added assertion right after l.526:** `expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);` (Snap is off by default: → 40.100, ← 40.000, round trip). The clip-start check at l.525 stays.
4. **MU8e:** after the pointerDown with `pointerId: 75` and after the one with `pointerId: 76`, add the matching `pointerUp` (same pointerId, no movement; use the element or `window`, whichever releases the claim and capture in the existing stub, as MU8d does).
5. **MU8e, one added assertion** after the two pointerUps, before the F2 half, that observably proves **no gesture claim is active** (e.g. `isPointerGestureActive()` false through the test's context handle, if the harness exposes it; otherwise an action that is refused only during a gesture now succeeds). Name the observable in the report. The two existing `toBe(drop)` focus assertions stay.

### F2 — C-R74-02: the marker menu closes when its flag moves on screen
Contract (B decision, smallest honest behaviour; rationale in `b-round-74.md`). The menu is anchored to one flag, so it must never point at empty timeline:
| # | Trigger | Result |
|---|---|---|
| S1 | **User horizontal scroll** of the timeline scroller (wheel, scrollbar, touchpad) while the marker menu is open | menu closes; focus returns to the flag with `focus({preventScroll:true})`; no seek, no selection change, no history entry; the scroll itself is not prevented |
| S2 | **Follow auto-scroll during playback** (Follow on) | menu **stays open** — same exemption as the grid menu (`closeGridMenuOnUserScroll`, StudioWorkspace l.1013–1033: playing, Follow on, and `clampedByBrowser` or `|left − autoScrollLeftRef| ≤ FOLLOW_SCROLL_TOLERANCE_PX`). This protects MK-MENU-PLAY "playing → jump and keep playing". A user scroll during playback beyond the tolerance closes it (and pauses Follow, as today) |
| S3 | **Vertical-only scroll** (scrollLeft unchanged) | menu stays open — the marker row is in the sticky top chrome, the flag does not move (C73-4b) |
| S4 | **Zoom** (`pxPerSecond` changes, e.g. Ctrl/Meta+wheel over the timeline) | menu closes, focus back to the flag (`preventScroll`) |
| S5 | Existing closes (Escape, Tab, outside press, window resize/blur, action) | unchanged |

Files:
- **`ArrangementMarkerRow.tsx`:** add `closeMenu(): void` to `ArrangementMarkerRowHandle` (no-op when no menu is open; otherwise closes it and returns focus to the flag via the existing `focusMarkerTarget`, which uses `preventScroll`). Close the open menu when the `pxPerSecond` prop changes (S4), with the same focus return. `closeMenu` must observe the **current** menu state (add it to the `useImperativeHandle` deps with what it reads, or read a `menuRef`); a closure over a stale `menu` would make it a silent no-op. No other behaviour change.
- **`ArrangementMarkerMenu.tsx` — narrow grant:** only add one member (e.g. `'scroll'`) to the `MarkerMenuCloseReason` union if A's close path needs a distinct reason. No other byte changes; leave the file untouched if not needed.
- **`StudioWorkspace.tsx` — narrow grant: `handleTimelineScroll` (l.1045–1064) only.** Read the previous `lastScrollLeftRef.current` before it is overwritten; when `left !== previous` and the scroll is **not** a Follow auto-scroll (the S2 predicate, computed from the same refs and constant), call `markerRowRef.current?.closeMenu()`. Everything else in the callback stays as is. The grid-menu effect (l.1009–1043), the key handlers, `releaseEditFocusOnTimelinePointerDown` and the JSX are byte-identical. Note: `applyTimelineView` and the Follow scroll already write `lastScrollLeftRef` before their scroll event, so zoom-anchoring scrolls do not reach S1 — S4 covers zoom in the row. Duplicating the follow predicate is accepted and recorded as an architecture signal; **do not refactor the grid-menu effect**. If A finds S1–S4 cannot be met inside this grant, stop and report instead of editing elsewhere.
- **`065-studio-lab-marker-move-menu.md`:** add a Problem → Solution entry for C-R74-01 (B spec conflict, test grant) and C-R74-02 (close rule S1–S4), Georgian, LF; update its status line (round 74 C FAIL, round 75 fix-up, awaiting C). Doc 064 is frozen.

### Required tests (meaningful; append to `markers-move-ui.test.tsx`, existing MV1–MV14 byte-identical)
- **MV15 (S1/S3):** open the marker menu (contextmenu on a flag); set the scroller `scrollTop` only and fire `scroll` → menu still open; then set `scrollLeft` to a new value and fire `scroll` → menu closed, `document.activeElement` is that flag, position, selection and undo label unchanged.
- **MV16 (S2):** playing with Follow on, menu open: a `scroll` whose `scrollLeft` differs from the last seen value but is within `FOLLOW_SCROLL_TOLERANCE_PX` of the auto-scroll position → menu stays open; a scroll beyond the tolerance → closes. (If jsdom cannot reach the playing+Follow state through the existing harness, say exactly why in the report; C's MK-MENU-FOLLOW then carries S2 alone.)
- **MV17 (S4):** menu open, change `pxPerSecond` without an outside pointer press (e.g. Ctrl+wheel on the scroller, or the context zoom API) → menu closed, focus on the flag.
- **`closeMenu()` with no open menu** is a no-op (no focus move) — one assertion inside MV15 or MV17.
- **Mutation proofs (A runs and records; restore + `cmp` after each):** (a) remove the `closeMenu` call in `handleTimelineScroll` → MV15 red; (b) drop the Follow exemption from that call → MV16 red; (c) drop the `pxPerSecond` close → MV17 red; (d) revert l.526 to `toBeNull()` → MU8 red; (e) drop the MU8e pointerUps → the F1.5 assertion red.
- **A's checks (speed rules):** `npm run typecheck`, `npm run lint`, `npx vitest run app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/markers-move-ui.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` plus the grid-menu and follow test files (`grep -lE "ArrangementGridMenu|followMode|Follow" app/lib/arrangement/__tests__`). All must be green, including MU8. No full suite, no `npm run verify` (root gate). **Code-reviewer is required** (3+ files); pass its Architecture note to B as a signal.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`. Then verify the baseline (HEAD, the 10 status lines, round-74 hashes, frozen 449/449, snapshots 6/6, protected 4/4, EOL). Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `app/components/arrangement/ArrangementMarkerRow.tsx`, `app/components/arrangement/ArrangementMarkerMenu.tsx` (one union member only), `app/components/arrangement/StudioWorkspace.tsx` (`handleTimelineScroll` only), `app/lib/arrangement/__tests__/markers-ui.test.tsx` (F1 edits only), `app/lib/arrangement/__tests__/markers-move-ui.test.tsx` (append MV15–MV17), `docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md`. A's report: `a-round-75.md` (+ `a-round-75/` scratch in the loop folder). Everything else is read-only. Expected end `git status --short`: the same 10 lines as the baseline (no new paths). Only root commits.

## 4. Ableton source table
| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Menu close on scroll/zoom; test contract | — | არ ეხება (CZABA UI rule; Live 12 §6.4 says nothing about context-menu dismissal) | S1–S4 above, consistent with the CZABA grid menu | MK-MENU-SCROLL/VSCROLL/ZOOM/FOLLOW |
Stage 2a behaviour sources are unchanged from round 74 (`tasks/round-74.md` §4, Live 12 §6.4 stored capture `b-round-71/ableton-arrangement-view-20261021.txt`). No new research.

## 5. Acceptance (C, real browser, 1440x900 and 1280x720; Playwright + installed Chromium; fresh context per run; C sets Snap and Follow explicitly)
| ID | Action → expected | Evidence |
|---|---|---|
| MK-MENU-SCROLL | C-R74-02 steps: drop Middle East, add a marker near the right of the visible timeline, right-click the flag, wheel-scroll the timeline horizontally by 300 px over a lane → the menu is gone; `document.activeElement` is that flag; scrollLeft moved by ≈300; position, selection and undo label unchanged. Repeat with the menu opened by Shift+F10. | shots, values |
| MK-MENU-VSCROLL | With vertical overflow (add tracks as in C73-4b), menu open, vertical wheel → the menu stays open and the flag rect is unchanged (±1 px). If vertical overflow cannot be made at a viewport, `notRun` with the reason. | rects |
| MK-MENU-ZOOM | Menu open, Ctrl+wheel over a lane (zoom) → menu closed, focus on the flag, no seek. | values |
| MK-MENU-FOLLOW | Harness order (Ctrl+wheel zoom pauses Follow and closes the menu): zoom first if needed, **then** turn Follow on explicitly, play, open the menu, then wait. Follow on, playing, menu open on a flag, wait across at least one Follow auto-scroll → the menu stays open; choose Play from here → jumps and keeps playing (MK-MENU-PLAY still holds). Then, playing, a user wheel scroll beyond the tolerance → closes. | positions, shots |
| MK-MENU-DOCK | Expand the floating video dock, right-click a flag under/near it → the menu paints above the dock and its items are clickable (round-74 notRun; A's portal fix). | shot, elementFromPoint |
| MK-74-RECHECK | One viewport each (1440: MK-DRAG-SNAP + MK-ARROW; 1280: MK-MENU incl. Escape focus return + MK-MENU-DELETE), short re-runs because the row changed. | values |
| T75-TARGETED | `npx vitest run app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/markers-move-ui.test.tsx` → 0 failed (MU8 green). Targeted run only; the full suite stays `gate`. | output |
| REG-HYD | no hydration warning on load | console |
| G75-3 | `/studio-lab` anonymous shows the demo badge; `/studio/middle-east` shows "Sign in required"; anonymous `/api/studio-token?product&file` 401; fake-Bearer 403 = BLOCKED (backend unavailable in cloud); 0 forbidden requests, 0 Authorization headers. | network log |
| gate rows | vitest full/typecheck/build/Biome/verify/e2e smoke → `gate` in the JSON. Do not claim them. | — |

Ableton column for C: all rows = არ ეხება.
**Source-unchanged check for C:** sha256 of all 6 owned files equal A's reported end hashes at C start and end; frozen 449/449 OK; `git status --short` = the 10 baseline lines.
C writes `c-round-75.md` and `c-round-75.json` (`taskStatus`, `browserVerified`, `realVerified`, `bugs`, `passed`, `blocked`, `notRun`, `gate`, `info`, `ableton`). `browserVerified=true` only if MK-MENU-SCROLL, MK-MENU-ZOOM, MK-MENU-FOLLOW and G75-3 (non-backend rows) ran at both viewports, MK-MENU-DOCK ran at least at one viewport (it re-checks a round-74 extra, not a changed behaviour; state which), and MK-74-RECHECK ran as listed.

## 6. Neighbours that can break (C watches these)
Grid-menu close on user scroll and its Follow exemption (MN-FOLLOW, VSCROLL-CLOSE), Follow pause on a user scroll during playback, zoom anchoring (Ctrl+wheel), marker menu Escape/Tab/outside close, flag focus after close, MK-MENU-PLAY during playback.

## 7. Reports and next
- A: `a-round-75.md` (baseline results, F1/F2 summary, the F1.5 observable, mutation proofs a–e, commands actually run, code-reviewer result + Architecture note, end hashes of all 6 owned files).
- C: as above; bugs go back to B.
- Next (B): if C PASS with `browserVerified=true` → root gate publishes rounds 74+75; round 76 = SRW-16 stage 2b (clips / range / playhead snap to markers; Ctrl+←/→ and macOS Option+←/→ also stopping at clip edges of the selected tracks; root-review S1 macOS binding; ROW-RANGE-M signal review), then the bounded frontend-architect checkpoint request at the SRW-16 boundary, then SRW-17…SRW-20. If the regression date (2026-10-24) has arrived when B plans, the regression round comes first.
