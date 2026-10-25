# B → root: frontend-architect checkpoint at the V-3c-4 feature boundary (2026-10-25, D-29z136)

**Status:** `requested_from_root`. This is a **bounded** request at a feature boundary, and it does **not** block anything. Round 171 (V-3c-4c-3) is the last V-3c-4 slice and runs under fallback (c) either way.
- **Earlier pointers:** `b-round-160-checkpoint-request.md` (Q1–Q4), `b-round-165-checkpoint-request.md` (Q-COMMIT), and the `b-round-166…169-checkpoint-request.md` repeats.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`. Root calls the read-only `frontend-architect` and records the result.

## Why now
- **The feature boundary is here.** V-3c-4 (button surfaces) ends with round 171. Both round-170 reviewers, A's code-reviewer and the gate-170 reviewer, propose the extraction **after V-3c-4c-3**.
- **Accumulated risk on one pattern.** After round 171 the same SURF + MOTION token set will be hand-copied about **20 times in 11 files**:
  - **The 17 copies today (gate-170 review):** Transport:51, GroupHeader:37, MarkerRow:51, Lane:613/631/723/731, Master:108/171, LibraryPreview:307/332, StudioWorkspace:2285/2366, TempoRow:241, DetailPanel:752/861/1142.
  - **Round 171 adds** ExportDialog Cancel l.581, Done l.596 and the primary l.615.
  - Every V-3c-4 round has also added raw token tests for its own copies (GATE167-TOKEN-TEST-FRAGILITY).
- **Correctness depends on tailwind-merge** (GATE167-TWMERGE-DEPENDENCY): the on-state fills win only because `cn` drops conflicting base tokens.

## Questions (max 3)
1. **Keep or extract.** Should `app/lib/arrangement/surface-classes.ts` be extracted now?
   - **What would move:** the shared SURF / FILL / MOTION / RADIUS tokens only. Size, padding and text colour stay per component.
   - **Acceptance:** the rendered token sets stay identical, the existing per-file locks stay green **without edits**, and C measures 0 px layout difference.
   - **When:** as its own round, before V-3c-5, with one owner.
2. **The `!` suffixes.** Should the same task drop the `!` suffixes on the MOTION tokens? They were added in round 159 to beat the global `app.css` transition.
3. **Order against V-3c-5.** V-3c-5 (10 px panel radius) touches the DetailPanel boxes, the VideoDock frames and the overview. Should the extraction come before or after it?

## B's default if no answer by round 172 planning
- Fallback (c) continues: the copies stay in each component, locked by tests.
- `ARCH-R167-SURFACE-RECIPE` stays a backlog signal.
- B does **not** schedule the extraction on its own, and V-3c-5 goes ahead after the regression round.
