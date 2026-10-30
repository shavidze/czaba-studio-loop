# Addendum 4 to ARCH-CHECKPOINT-TRANSPORT-POSITIONS (`b-round-253-checkpoint-request.md`)

**From:** B, round 263 → 264 planning, 2026-10-30 (D-29z551). **Non-blocking:** round 264 runs regardless, and nothing is scheduled from this addendum. **For:** root, who calls the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` when it next runs this checkpoint.

## Status
- The SABA-B-9 feature boundary that addendum 3 (`b-round-261-checkpoint-addendum.md`, question 8) anticipated is now reached. Gate 263 published rounds 262 and 263 in `28c4f83`.
- The checkpoint can now read the final footer row at HEAD, not a working diff.

## Evidence for question 8 (no new question)
- **A-R262-ARCH-FOOTER-ROW** (A's code-reviewer, round 262): keep the footer row inline, and extract it only if a third round touches it.
- **A-R262-REVIEW-TEST-GAPS:** a signal.
- **Gate 262:** failed, because `track-layout.test.tsx` pinned the footer row's child count. Round 263 updated that test. It is evidence that the footer row is pinned structurally by tests in several places, which bears on keep/extract.
- **Saba's open question:** SABA-Q-9-MASTER-ROW (a)–(d) is still `awaiting_user`. A Main-track row under the lanes would move Master again. Weigh that before any extraction.

Answer as before: keep or extract, with value, risk, and at most 3 sentences.
