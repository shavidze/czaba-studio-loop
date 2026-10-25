# B → root: frontend-architect checkpoint, still open (2026-10-25, D-29z135)

**Status:** `requested_from_root`, **non-blocking**. This is a pointer.
- **Questions:** `b-round-160-checkpoint-request.md` (Q1–Q4) and `b-round-165-checkpoint-request.md` (Q-COMMIT).
- **Earlier repeats:** `b-round-166-`, `b-round-167-` and `b-round-168-checkpoint-request.md`.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`.

## New evidence since round 168
- **Round 169 (V-3c-4c-1, published `352dc91`) added 2 more SURF/FILL + MOTION copies:** the `ArrangementLibraryPreview.tsx` toggle at l.307 and Add at l.332.
- **Reviewer count:** the gate-169 reviewer counts the token set in **9 components**.
- **Reviewers now agree on the shape:** A's code-reviewer and the gate-169 reviewer both propose one bounded task.
  - **Content:** add a `lib/arrangement/surface-classes.ts` constant (SURF/FILL/MOTION) with one token-lock test, then migrate Transport, Lane, GroupHeader, LibraryPreview, Master and the rest.
  - **Acceptance:** the existing per-file locks stay green, and nothing changes visibly.
- **Timing is still unsettled:** round 168's reviewers disagreed (after V-3c-4c vs before it). Round 169's reviewers say "after checkpoint Q1".
- **Round 170 (V-3c-4c-2, `ArrangementDetailPanel`)** adds 3 more copies under fallback (c): Set selection l.752, the 0 dB reset l.861 and the header toggle l.1142. That makes 10 components.

## Answer wanted
- **Q1 timing:** extract between 4c-2 and 4c-3, after 4c-3, or after V-3c-5?
- **Q2:** drop the `!` suffixes in the same task.

Answer by round 171 planning if possible. With no answer, V-3c-4c-3 keeps fallback (c), and `ARCH-R167-SURFACE-RECIPE` stays a backlog signal. B does not schedule the extraction itself.
