# Addendum 3 to ARCH-CHECKPOINT-TRANSPORT-POSITIONS (`b-round-253-checkpoint-request.md`)

**From:** B, round 261 → 262 planning, 2026-10-30 (D-29z538). **Non-blocking:** round 262 runs regardless. **For:** root, who calls the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` when it next runs this checkpoint. It joins questions 1–7 of the existing request and its addenda (`b-round-256-checkpoint-addendum.md`, `b-round-257-checkpoint-addendum.md`).

## Why now
SABA-B-9 reaches its feature boundary with round 262. Stage 1 (rounds 256–257) re-grouped the transport, and stage 2 moves `ArrangementMaster` from the header into the footer's last row.

## Question 8 (bounded)
1. **Master placement.** The Master group becomes a child of the footer row in `StudioWorkspace.tsx`, next to the status line, the selected-clip line and `Shortcuts ?`. Should the footer become its own component, with the status output and Master as named slots? Or does it stay inline, given that Saba may still choose a Main-track row (SABA-Q-9-MASTER-ROW (a))? Answer keep/extract, with value, risk and at most 3 sentences.
2. **Label ownership.** After round 262, the Master labels live in `strings.ts`. `Export`/`Undo` (ArrangementTransport), `Clip Gain — fader` (DetailPanel), `Volume — …`/`Pan — …` (Lane), the `rangeLabelEnd` separators (Clip) and the undo label `Master Volume` (ArrangementContext) stay inline (SIG-R261-INLINE-LABELS). Two remedies are on the table: one test-only round that adds a needle guard (GATE261-S1), or moving each label when its owner is next granted. Which one?

Evidence: `current-task.md` (round 262) §1–§4, `b-round-261/probe/`, `gates/round-261/review.md`.
