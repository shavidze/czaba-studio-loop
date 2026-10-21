# B round 74 — review of C round 74, plan for round 75 (D-29z40)

Date 2026-10-21 · Linux cloud · Advisor: the configured `advisor` tool **was available** and was consulted before writing. It confirmed the fix-up round (2b → 76), the dirty-tree baseline, the exact test grant, and it flagged the trap in the naive scroll fix: closing on every timeline-scroll notification would also close on Follow auto-scroll. No project subagent was consulted.

## Inputs (treated as data)
- `c-round-74.md/.json`: **FAIL, browserVerified=true, realVerified=true**. Every real-browser row passed at both viewports. Extras also passed: MK-DRAG-CROSS, MK-MENU-EDGE (right edge), MK-MENU-ONE and one MK-CUT-TIME run. Bugs:
  - C-R74-01 (medium): red MU8 l.526.
  - C-R74-02 (low): the menu ignores timeline scroll.
  - Blocked: fake-Bearer 403 (backend unavailable in cloud).
  - Not run: menu over the floating video dock; bottom-edge clamp (unreachable); native keyboard contextmenu button (CDP limitation); WebKit/macOS.
- `a-round-74.md`: B1–B12 implemented, mutations i–vii recorded, reviewer score 8/10 with no Critical/High. A reported the MU8 conflict and the MU8e weakness instead of editing outside its grant, which was correct.
- `gates/gate-round-74.json`: **skipped** (C FAIL). **Baseline for round 75 = HEAD `6b574e8` (gate-73 commit) plus the uncommitted round-74 tree.** B checked:
  - `git status`: 7 M + 3 ??.
  - All 10 owned hashes equal A §2.
  - Old frozen list 445/445; protected 4/4.
  - `/studio-lab` 200.
- `root-pre-push-review.md` / `publication-checkpoint.json`: no new findings for this round.

## Backlog updates (only from C evidence)
- **SRW-16 stage 2a → `bug`, not done.** The browser rows passed, but the verdict is FAIL and nothing is published yet. A `c_round74` record was added to the 2a stage entry. A new `2a-fix` substage (round 75) was added. 2b moved to round 76, still scheduled and not deferred. feature-status: FB-10/SRW-16 = **ბაგია**.
- New findings:
  - C-R74-01 (medium) and C-R74-02 (low), both scheduled for round 75.
  - A-R74-MU8E-POINTERUP (scheduled for round 75).
  - GATE-74-SKIPPED (root): rounds 74 and 75 publish together.
  - INFO-C74-KEYBOARD-CONTEXTMENU-BUTTON (C cannot test it; Tech Lead).
  - INFO-C74-MENU-BOTTOM-UNREACHABLE (acknowledged).
  - A-R74-MACOS-CTRL-CLICK (Lows batch, with ROOT-R64-L5).
  - R74-T (Tech Lead feel check).
- The fake-Bearer 403 stays open evidence for a later check with the backend enabled.
- Architecture: A's reviewer note says the marker row is the **third copy** of the claim + setPointerCapture + watchUncaptured scaffold. Round 75 also adds a second copy of the Follow-scroll predicate. Both are appended to ARCH-CHECKPOINT-SRW14-PREFS and `architecture_signals` as **signals, not tasks**.
- Backlog `version` 74. `rounds[74]` → C FAIL / gate skipped; `rounds[75]` dispatched.

## Decisions for round 75 (D-29z40)
1. **Scope: three tightly related bugs, one owner.** Stage 2b is not bundled. It touches grid.ts, clip, lane, brace and the key handler, and a 2b failure would keep the gate-blocking fix unpublished again.
2. **C-R74-01 is a B spec defect.** Round 74 froze a stage-1 assertion that contradicts B5. The grant covers:
   - MU8: the title, l.526 → `toBe('Move Marker')`, and one round-trip times assertion.
   - MU8e: two pointerUps and one assertion that no gesture claim is still active.

   The rest of the file stays byte-identical.
3. **C-R74-02: smallest honest behaviour.** The menu belongs to one flag, so it closes whenever the flag moves on screen:
   - **User horizontal scroll:** closes. This uses the same Follow exemption as the grid menu, so Follow auto-scroll during playback does not close it, and MK-MENU-PLAY "playing → jump and keep playing" keeps working.
   - **Zoom (`pxPerSecond` change):** closes.
   - **Vertical scroll:** stays open, because the marker row is sticky and the flag does not move (C73-4b).
   - Focus returns to the flag with `preventScroll`.

   Considered and rejected:
   - Close on every scroll notification: breaks Follow.
   - Re-anchor the menu to the moving flag: more code, and no reference behaviour asks for it.
   - Refactor the grid-menu effect into a shared predicate: outside a bug round, so it is recorded as a signal.

   StudioWorkspace grant: `handleTimelineScroll` only. Note: `applyTimelineView` and the Follow scroll write `lastScrollLeftRef` before their scroll event, so zoom-anchoring scrolls are not "user" scrolls; that is why the zoom close lives in the row.
4. **Tests and mutations:** MV15–MV17 plus mutations a–e (each fix has a killing test). MV16 must use a sub-tolerance drift, because the Follow write to `lastScrollLeftRef` alone would let mutation (b) survive.
5. **C rows:**
   - The new rules: MK-MENU-SCROLL, VSCROLL, ZOOM and FOLLOW.
   - The round-74 notRun dock row: MK-MENU-DOCK.
   - A short one-viewport re-check, because the row changed: MK-74-RECHECK.
   - The targeted vitest run on the two marker UI files: T75-TARGETED. This is allowed; the full suite stays `gate`.
   - REG-HYD and G75-3.
6. **Ableton:** არ ეხება for every round-75 row. No new research; the stage-2a sources are unchanged.
7. **Regression round:** not due (`regression-last.json` 2026-10-21 → due on or after 2026-10-24), unchanged.
8. **Architecture checkpoint:** still requested from root at the SRW-16 boundary, after stage 2b in round 76. Inputs: ARCH-CHECKPOINT-SRW14-PREFS (a)–(f), the gesture scaffold copies (round 74) and the Follow-predicate copy (round 75). Non-gating; it does not delay SRW-17.

## Archives
- `tasks/round-74.md` is an exact copy of the round-74 task (`cmp` OK).
- `b-round-74-pre-{current-task.md,backlog.json,feature-status.md,b-next.json,plan.md}`.
- Scripts are in `b-round-74/`.
- Baseline: `b-round-74-r75-tree-sha256.txt` (449 entries) and `b-round-74-r75-snapshots/`.

## Ready-for-commit note
Nothing is commit-ready. Round 74 is uncommitted, and it publishes together with round 75 after C PASS and the root gate.

## Next
- **Round 75:** A fixes, then C verifies.
- **Round 76:** SRW-16 stage 2b, then the checkpoint request.
- **After that:** SRW-17, SRW-18, SRW-19, SRW-20, the Lows batch, SRW-21, the full regression, T12 and VISUAL-A-OBSIDIAN. Phase 2 stays BLOCKED until the user gives the go-ahead.

## Advisor second pass
After the artifacts were written, the advisor was called again. It found no decision change and suggested three sharpenings, all applied to `current-task.md`:
- **MK-MENU-FOLLOW harness order:** Ctrl+wheel zoom pauses Follow and closes the menu, so C zooms first, then turns Follow on, plays, opens the menu and waits.
- **`closeMenu` must read the current menu state:** handle deps or a ref, so a stale closure cannot turn it into a silent no-op.
- **MK-MENU-DOCK needs only one viewport for `browserVerified`:** it re-checks a round-74 extra, not a changed behaviour.
