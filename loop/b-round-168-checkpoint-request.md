# B → root: frontend-architect checkpoint, still open (2026-10-25, D-29z134)

**Status:** `requested_from_root`, **non-blocking**. This is a pointer.
- **Questions:** `b-round-160-checkpoint-request.md` (Q1–Q4) and `b-round-165-checkpoint-request.md` (Q-COMMIT).
- **Earlier repeats:** `b-round-166-` and `b-round-167-checkpoint-request.md`.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`.

## New evidence since round 167
- **Round 168 (V-3c-4b, published `e50498f`) added 5 more SURF + MOTION copies:** `ArrangementLane.tsx` l.613, l.631, l.723 and l.731, plus `ArrangementGroupHeader.tsx` l.37. Lines 613 and 631 are byte-identical within the same file.
- **The two round-168 reviewers now disagree on timing:**
  - **A's code-reviewer:** "keep for now", and do one bounded shared-constant task **after** V-3c-4c, together with Q2 (dropping the `!` suffixes). Acceptance: TH10's substring locks and the LSU7/UM11 token lists stay green.
  - **Gate-168 reviewer (score 9/10):** one export (`studioButtonSurfaceClass` / `studioButtonMotionClass`) with its own token test, **before** V-3c-4c (in its words, "V-3c-4c-მდე"). Value low–medium; it settles Q2 in the same task. It also suggests a file-local `LANE_MIX_BUTTON_CLASS` as a smaller step.
- **V-3c-4c is now split by owner:**
  - V-3c-4c-1 Library + Preview = round 169;
  - V-3c-4c-2 DetailPanel = round 170;
  - V-3c-4c-3 ExportDialog + VideoDock = round 171.

  Round 169 adds 2 more copies (the Preview toggle and Add), under fallback (c).

## Answer wanted
- **Q1 timing:** extract now, between 4c stages, or after 4c-3?
- **Q2:** drop the `!` suffixes.

Answer by round 170 planning if possible. With no answer, each 4c stage keeps fallback (c), and `ARCH-R167-SURFACE-RECIPE` stays a backlog signal. B does not schedule the extraction itself.
