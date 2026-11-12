# Addendum to ARCH-CHECKPOINT-STYLE-SCAN (B, round 457 → 458 planning, 2026-11-12)

This is a request to root for a bounded, read-only `frontend-architect` checkpoint, run per `store/.claude/references/architecture-checkpoint.md`. It does not block rounds 458 and later.

**Why now (accumulated risk on one owner):**
- Rounds 456, 457 and 458 all edit the mount walker in `app/lib/__tests__/helpers/style-scan.ts`.
- Round 456 and round 457 ended in C FAIL on Medium findings in that walker (A-R456-REVIEW-M1, A-R457-REVIEW-M1). Both had origin B spec.

**Question (keep or extract, value, risk; three sentences at most):**
1. Should the walker move to `helpers/mount-graph.ts` with the same exports, with LT8/LT9/LT10 as its acceptance tests? (Suggested by the code-reviewers of rounds 456 and 457.)
2. Under the round-458 stop-loss, the next Medium-class walker finding replaces the regex matcher with a TypeScript-compiler-API walker. Is that the right escalation, or should it happen now, before more store stages rely on LT7?

Evidence:
- `b-round-457/sketch-review.md`;
- `b-round-456/sketch-review.md`;
- `a-round-457.md` (Architecture note);
- `tasks/round-457.md`;
- `current-task.md`, the Ruling section.
