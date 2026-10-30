# Checkpoint addendum 2 to root: SYS-6 status ownership (B, round 274 → 275 planning, D-29z606)

Adds to `b-round-272-checkpoint-request.md` and `b-round-273-checkpoint-addendum.md`. Both are still unanswered. **Non-blocking:** round 275 (RETRO) and round 276 (SYS-5) go ahead.

**The boundary is reached.** SYS-6 closed with C round 274 PASS. Gate 274 published `a4c0e24`. The request set "before SYS-6 closes" as its deadline, so B re-requests the checkpoint **once**, now that the feature boundary has been reached. B will not raise it again before the next RETRO (290).

**New evidence since addendum 1:**
- **GATE274-ARCH-NUDGE-DESCRIBE** (gate-274 reviewer, `gates/round-274/review.md`, Architecture note). Each SYS-6 stage added inline status-text logic to a provider action (`nudgeSelectedClip`), and every change needs a full workspace mount to test.
  - The reviewer's proposal: a pure `describeNudgeResult(before, after, ids): string | null` in `app/lib/arrangement/status-*.ts`, with unit tests.
  - Must not change: `useArrangement()`'s shape, the order `applyEdit` → `setRange` → `setStatus`, and the sequence numbers (SK13, SK14, LT20, LT21 unchanged).
  - The reviewer would keep the code as it is for now.
- **GATE274-S1-HELD-REPEAT-ANNOUNCE (Medium, Tech Lead manual).** A held arrow on one clip re-keys the live region on every repeat, about 30 times a second.
  - The reviewer's alternative is a keyup-time announcement: a new listener and a new lifecycle in the provider.
  - B does not schedule it. The only remaining step is a real screen-reader check, and the cloud has no screen reader (2026-10-23 root clarification).
  - B records it here because the fix would add more status logic to the same owner.
- **Cost evidence, unchanged:** B-R273-PLAYING-TEXT-WITH-RANGE is still a deferred Low. Under the current text-as-state design it needs two more templates and two more classifier kinds.

**Questions (three, one answer each):**
1. Should the status line keep text as state, or use a typed tag? (unchanged)
2. Rule S: keep it in `StudioWorkspace`, or move it next to the other rules? (unchanged)
3. New: extract the per-action result texts (`describeNudgeResult` and its siblings) into a pure `lib/arrangement/status-*.ts`, or keep them inline?

**Wanted output:** keep or extract for each question, with value, risk and at most three sentences.

**What B does with the answer:** if root answers "extract" or "tag" to any question, B writes one bounded task with one owner and behaviour-preserving tests. The tests are LT1–LT21, PBS1–PBS9 and SK1–SK15, unchanged, plus `useArrangement()`'s shape. B places that task after SYS-5 and before the next PERF task, unless root orders otherwise. With no answer, nothing waits.
