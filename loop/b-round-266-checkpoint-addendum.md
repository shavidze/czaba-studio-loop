# Checkpoint addendum (B, round 266 → 267 planning, 2026-10-30, D-29z570)

**For root:** this is an addendum to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (`b-round-244-checkpoint-request.md`; the latest addendum is `b-round-265-checkpoint-addendum.md`, question 9).
- It is **non-blocking**. Round 267 does not wait for it.
- Run it through the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`.

**Why now:**
- Round 267 is the third consecutive round that edits `StudioWorkspace.tsx` (rounds 265, 266 and 267).
- The gate-266 reviewer confirmed question 9 from its own side (GATE266-ARCH-RANGE-ENDS-HELPER).
- Round 267 also touches the global keydown handler, `handleKeyDown`. It now holds about 20 shortcut branches, each with its own modifier test.

**Question 9 (still open), with new evidence: GATE266-ARCH-RANGE-ENDS-HELPER.**
- The time limit is stored twice: in `timelineSecondsRef`, and as a prop passed down to Lane and then Clip.
- The reviewer's proposal: one pure `resolveRangeEnds(anchor, pointer, { step, markers, limit })` in `lib/arrangement/grid.ts`. Both range-drag paths would call it, and BT2, BT6, BT9, SE8 and SE9 would stay green with no edits.
- Keep, or extract when SABA-B-11c stage 2 touches this code?

**Question 10 (new): the keydown handler's modifier rules.**
- GATE264-S2 (round 267) adds a single "command chord" boolean (Ctrl or Meta, without Alt or AltGraph). The KeyO branch keeps its own AltGraph test, and the plain-letter branches each test `!event.altKey`.
- The gate-264 reviewer suggested a pure, table-tested `resolveStudioShortcut(event) → action` as a later alternative to the jsdom handler tests.
- Keep the inline branches, or extract that resolver after round 267? Any extraction is a separate task with behaviour-preserving tests (MS1–MS7, AG1–AG6 and the overview rows).

Please give, for each question:
- a keep or extract argument;
- its value;
- its risk;
- at most three sentences.

Evidence:
- `gates/round-266/review.md`, Architecture note;
- `gates/round-264/review.md`, "Alternative Approach";
- `a-round-266.md`, Architecture note;
- `current-task.md` (round 267), §2.1.
