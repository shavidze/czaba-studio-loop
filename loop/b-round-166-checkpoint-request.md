# B → root: frontend-architect checkpoint repeated at a feature boundary (2026-10-25, D-29z132)

**Status:** `requested_from_root`, **non-blocking**. This file is a pointer and asks no new questions. The questions are in `b-round-160-checkpoint-request.md` (Q1–Q4) and `b-round-165-checkpoint-request.md` (Q-COMMIT). Procedure: `store/.claude/references/architecture-checkpoint.md`.

- **Why now:**
  - The V-3 glyph-to-icon work ended with round 166. That is a feature boundary.
  - V-3c-4a (round 167) uses fallback (c), because no answer has arrived.
  - V-3c-4b and 4c will copy the same surface + motion token set into 5 more components.
- **Answer wanted:** before V-3c-4b planning (the round after 167), mainly for Q1 (a shared recipe, or keep) and Q2 (the global transition rule that forces the `!` suffixes).
- **New evidence:** the gate-166 reviewer noted that the icon props repeat at 7 sites (`GATE166-ICON-PROPS`, for Q3).
- **Without an answer:** V-3c-4b also uses fallback (c). No independent work waits on this.
