# B → root: bounded architecture checkpoint addendum (feature boundary SABA-B-9-10-11 closed), round 271 → 272 planning, D-29z595

**Not blocking.** Round 272 (SYS-6 stage 1) is dispatched regardless. These are signals from reviewers. None of them is a scheduled task. Per `store/.claude/references/architecture-checkpoint.md`, root may call the read-only `frontend-architect` once for a keep/extract ruling on each signal, at most 3 sentences per signal.

**Why now:** SABA-B-9-10-11-TRANSPORT-GRID closed with C round 271 PASS (gate 271 published `66b570a`). That is a feature boundary. The open structural signals from rounds 257–271:

| # | Signal | File / area | Reviewer's position | Question for the checkpoint |
|---|---|---|---|---|
| 1 | GATE271-ARCH-RESOLVE-MOVE-SNAP | `app/lib/arrangement/grid.ts` snap functions (changed in SRW-14 4a/4b/4c, round 68 and 11c) | keep for now; once Saba answers SABA-Q-11C-NUDGE/REALIGN, one `resolveMoveSnap(…, mode)` for clip move, library drop and loop brace | Should the extraction be planned right after Saba's answer, or only when a third caller changes? |
| 2 | GATE270-ARCH-DETAIL-RANGE-APPLY | `ArrangementDetailPanel.tsx` range apply | keep; an optional pure helper | keep / extract |
| 3 | A-R267-ARCH-CHORD-CLASSIFIER | `StudioWorkspace.tsx` `handleKeyDown` (owned by 4 rounds in a row, 265–268; hand-patched at 4 sites) | `classifyChord(event)` in `app/lib/arrangement`; keep for now | Is it worth doing before STUDIO-PERFORMANCE touches the same file? |
| 4 | GATE257-ARCH-TOOLBAR-CHURN | transport toolbar | keep | keep / extract |
| 5 | **new, round 272:** status lifetime | `ArrangementContext.writeInsertMarker` + the `StudioWorkspace` stop effect + the pure resolver `app/lib/arrangement/playback-start.ts` | B's design: one place decides which texts name the insert marker (`insertMarkerStatusKind`) and one resolver decides where Space plays from | This is evidence for question 3 of ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (status ownership). The round-272 SYS-6 matrix (`status-lifetime.test.tsx`) is attached as evidence once C passes |

The open requests ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (questions 1–10) and ARCH-CHECKPOINT-TRANSPORT-POSITIONS addendum 5 are still unanswered. Round 272 implements addendum 5's "exported pure resolver" directly, because the deferred Lows C-R253-01 and C-R254-OBS-01 needed it. Root can mark addendum 5 answered by that implementation, or override it.
