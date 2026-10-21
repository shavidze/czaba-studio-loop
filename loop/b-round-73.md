# B round 73 — review of C round 73, plan for round 74 (D-29z39)

Date 2026-10-21 · Linux cloud · Advisor: the configured `advisor` tool WAS available. It was consulted before writing and again after the artifacts were written. It confirmed the plan, the 2a/2b split, the narrow StudioWorkspace grant and the traps now written into the task: re-sort in `moveMarker`, no click after drag, explicit focus on press, the collision rule, no resync, and no over-claimed Ableton parity. The second call found three issues, all fixed: mutation (iv) could not be killed (now it targets the `target === currentTarget` guard and MU8f), a stale feature-status header, and the Alt-with-Snap-off inversion, which is now in B1 and MK-DRAG-FREE. No project subagent was consulted.

## Inputs (treated as data)
- `c-round-73.md/.json`: **PASS, browserVerified=true, realVerified=true**, bugs []. One row is blocked: the fake-Bearer 403 (backend unavailable in cloud). One row was not run: Safari flag-to-flag focus, which is WebKit-only. Gate rows are marked `gate`.
- `a-round-73.md`: F1–F3 done. Mutations i, ii, h1 and h2 were proven. Reviewer score 8.5, Medium 1 (Safari focus) passed on as a signal, plus an Architecture note.
- `gates/gate-round-73.json`: **published** commit `6b574e853d2c5c4317e38927d9d06ce2a3dba91b` on both remotes, covering rounds 72–73. The verify log shows 1744 tests passing. The reviewer had no blockers and raised Suggestions S1–S6 and an Architecture note. **Baseline HEAD for round 74 = `6b574e8`, clean tree** (B checked: `git status` empty, `/studio-lab` 200).
- `root-pre-push-review.md` is the round-3 review (2026-10-07). It has no new findings for this round. `publication-checkpoint.json` adds nothing new.

## Backlog updates (only from C evidence)
- SRW-16 stage 1 → `c_pass_published` (C round 73, browserVerified=true, `6b574e8`). The item moves to `in_progress`, because stage 2 is still open. **SRW-16 is not marked done.**
- The fake-Bearer 403 stays open evidence for a later check with the backend enabled. It is not a defect.
- New findings:
  - A-R73-SAFARI-FLAG-FOCUS (medium): scheduled in round 74, where B1 makes a press focus the flag explicitly.
  - ROOT-R73-S1 (macOS Ctrl+arrows): goes to stage 2b.
  - ROOT-R73-S2: aria-keyshortcuts is scheduled in round 74; the aria-current semantics go to the Lows batch.
  - ROOT-R73-S3..S6: Lows batch.
  - MARKER-STRIP-CONTEXT-ADD: info signal only, not requested.
- Architecture: the reviewer's `isSelfHandledKeyTarget` proposal is added to ARCH-CHECKPOINT-SRW14-PREFS item (e), the same focus-release predicate, rather than filed as a seventh request. It is recorded as a signal, not a task.
- `version` 73, `rounds[73]` → published, `rounds[74]` dispatched.

## Decisions for round 74
1. **Scope = SRW-16 stage 2a.** Markers move by drag and by arrows (with snap), and get a marker context menu (Rename / Play from here / Delete). Stage 2b (round 75: clips, range and playhead snap to markers; Ctrl or Option + arrows also stop at clip edges) is **scheduled, not deferred**. The split follows the code owners: 2a stays in the marker row, while 2b touches grid.ts, clip, lane, loop brace and the key handler. One feature stage per round.
2. **Smallest honest choices where the reference product is silent** (rationale is in the task, B1–B12):
   - Arrow step is one grid line with Snap on and 0.1 s with Snap off, matching clip nudge.
   - Alt inverts Snap during a drag (free movement with Snap on, grid line with Snap off), using the SRW-14 `resolveSnapStep` rule.
   - A marker landing on another marker's time is refused, because merging exists only in Cut Time.
   - A marker can move past the project end, as Cut Time already allows.
   - No Escape-cancel during the drag: no existing CZABA gesture has it.
   - The menu has the user's three items. Ableton's Loop to Next / Song Start / Info Text are not added (not requested).
3. **Ownership:**
   - `markers.ts`, `ArrangementMarkerRow.tsx`, new `ArrangementMarkerMenu.tsx`, tests, new doc 065.
   - Narrow grants:
     - `ArrangementGridMenu.tsx`: one `export`, to reuse the click-swallow helper.
     - `StudioWorkspace.tsx`: two props.
     - `markers-ui.test.tsx`: MU8e's two flag-press assertions, which reflect jsdom rather than real Chromium. C73-2c showed that Chromium focuses the pressed flag.
     - Doc 064: status line.
   - Frozen list 445/445; 7 snapshots; protected 4/4.
4. **Ableton:** B reused the stored Live 12 §6.4/§6.7/§6.9 capture (2026-10-21). gstack is not available in the cloud, and the needed text was already captured, so no new research was done.
   - Confirmed: locators move by drag or arrows; locators have a context menu.
   - Unconfirmed: step size, snap of a locator drag, collision handling.
   - The menu items are a deliberate difference.
5. **Tests are meaningful and mutation-backed.** There are five required mutations (re-sort, moved-guard, focus, the flag arrow `target === currentTarget` guard, collision). Dropping only the flag's `stopPropagation` is pre-declared as an expected survivor, because the window `!isMarkerTarget` guard also covers it (defense-in-depth, as round-72 mutation h). A runs only the targeted checks; full verify belongs to the root gate. Code-reviewer is required.
6. **Regression round:** `regression-last.json` (2026-10-21, round 71) is unchanged. It is due on or after 2026-10-24.
7. **Architecture checkpoint:** B will ask root for a bounded frontend-architect checkpoint at the SRW-16 feature boundary, after stage 2b. Inputs: ARCH-CHECKPOINT-SRW14-PREFS (a)–(f) plus the round-73 key-owner predicate, and StudioWorkspace.tsx at 2010 lines. It is non-gating and does not delay SRW-17.

## Archives
`tasks/round-73.md` (exact copy of the round-73 task), `b-round-73-pre-{current-task.md,backlog.json,feature-status.md,b-next.json,plan.md}`, scripts in `b-round-73/`.

## Ready-for-commit note
Rounds 72–73 are already published by root (`6b574e8`). Nothing is pending from B.

## Next
Round 74: A implements 2a, then C runs the browser checks. If C passes with browserVerified=true, round 75 is stage 2b and the checkpoint request follows. After that come SRW-17, SRW-18, SRW-19, SRW-20, the Lows batch, SRW-21, the full regression, T12 and VISUAL-A-OBSIDIAN.
