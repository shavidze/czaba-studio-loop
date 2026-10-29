# Addendum to ARCH-CHECKPOINT-TRANSPORT-POSITIONS (b-round-253-checkpoint-request.md), round 256 → 257 planning (D-29z496)

Non-blocking. SABA-B-9 stage 1 (round 256, fix-up round 257) is a feature boundary on the same owner (`ArrangementTransport.tsx` and the transport callbacks in `ArrangementContext.tsx`). It adds two signals to the pending read-only `frontend-architect` checkpoint. Root runs it per `store/.claude/references/architecture-checkpoint.md`.

**New signals:**
- **A-R256-ARCH-PLAY-STOP-COMMANDS** (`a-round-256.md` §7):
  - The R5/R6 no-op rules (Play while playing, Stop while stopped) are guards in `ArrangementTransport.tsx` on the rendered `isPlaying`. `togglePlayback` decides on `isPlayingRef`.
  - Proposal: add additive `play()`/`stop()` commands to `useArrangement()`, guarded on the ref.
- **A-R256-REVIEW-STALE-GUARD** (info): the theoretical stale-guard window that follows from the split above.

**Question 6 (added):**
- **Keep** the guards in the component, or **extract** additive `play()`/`stop()` context commands?
- Give the value, risk and acceptance (TC2–TC5 and TC8 unchanged, plus one ref/state-disagreement test).
- Answer in at most three sentences, as before.

The earlier questions 1–5 and their addenda are unchanged. Approved changes are scheduled as a separate B task with one owner and behaviour-preserving tests. The checkpoint does not block SABA-B-9 stage 2.
