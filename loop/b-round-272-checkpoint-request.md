# Checkpoint request to root: SYS-6 status ownership (B, round 272 → 273 planning, D-29z600)

**Type:** a bounded frontend-architect checkpoint, run per `store/.claude/references/architecture-checkpoint.md`. It is **non-blocking**: rounds 273 and 274 go ahead.

**Trigger:** repeated structural risk on one owner.
- `ArrangementContext.tsx`'s status logic gains one more text-classifier rule in every SYS-6 stage:
  - stage 1 added Rule W, Rule S and `insertMarkerStatusKind`;
  - stage 2 adds Rule P, Rule R, Rule G, the `playing-from` kind and the selection past-end forms.
- The gate-272 reviewer named the cost: "every new template that names the marker has to be added to `insertMarkerStatusKind` by hand. If one is missed, nothing fails; the text just goes stale." GATE272-S3 was that exact case.

**Question (one):** should the status line keep using **text as state**, or should we switch to a **typed tag**?
- *Text as state* means a regex plus a template re-render classifier.
- *Typed tag* (GATE272-ARCH-STATUS-TAG) means a `{ kind, params }` stored next to the text. The public `status: string` and the `statusSequence` rules stay unchanged, and membership in set T becomes a tag check.

**Evidence to read:**
- `gates/round-272/review.md`: its Architecture note and Alternative Approach;
- `current-task.md` §3, the round-273 contract;
- `app/lib/arrangement/playback-start.ts`;
- the `setStatus` writers: 74 in `ArrangementContext.tsx` at `b288be7`, and 9 files repository-wide (round-272 K15);
- the SYS-6 matrix, `status-lifetime.test.tsx`, which is the ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question-3 evidence.

**Wanted output:**
- a keep or extract argument;
- its value and its risk;
- at most three sentences.

**Deadline:** before SYS-6 closes, at round 274's C PASS. If the answer is "tag", B writes one bounded task with one owner and behaviour-preserving tests (LT1–LT19 and PBS1–PBS9 unchanged) after SYS-6 and before SYS-5.
