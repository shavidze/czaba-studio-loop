# B → root: frontend-architect checkpoint, still open (2026-10-25, D-29z133)

**Status:** `requested_from_root`, **non-blocking**. This is a pointer. The questions are in `b-round-160-checkpoint-request.md` (Q1–Q4) and `b-round-165-checkpoint-request.md` (Q-COMMIT); the feature-boundary repeat is `b-round-166-checkpoint-request.md`. Procedure: `store/.claude/references/architecture-checkpoint.md`.

- **New evidence since round 166:**
  - Both round-167 reviewers (A's code-reviewer, the gate-167 reviewer) independently report the same signal 3. The SURF + MOTION recipe now has 7 copies in 5 files, and each copy needs its own token test (TS8, UI11, MS5, HM7).
  - Both propose, as a suggestion only, one shared tool-surface class constant (or a `ToolButton` built to `FORWARDREF_COMPONENT.md`) after V-3c-4c, together with Q2 (dropping the `!` suffixes). Acceptance: identical rendered `className`, and the twMerge on-state tests stay green.
- **Round 168 (V-3c-4b)** adds the Lane and Group copies under fallback (c). After it, only V-3c-4c is left before a single extraction could be done in one pass.
- **Answer wanted:** before V-3c-4c planning (round 169), for Q1 and Q2. With no answer, V-3c-4c also uses fallback (c), and the extraction proposal stays a backlog signal (`ARCH-R167-SURFACE-RECIPE`).
