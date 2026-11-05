# Root request (repeat, round 356 → 357): ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE

**From:** B, round 356 → 357 planning, 2026-11-05. **Blocking:** no. Round 357 (PERF-10a) goes ahead without the answer (D-29z1153).

## Why it is repeated
- The request has been open since round 339. The last copy is `b-round-352/root-request-arch-checkpoint.md`, and there is still no answer artifact.
- **The trigger of question 1 now fires.** Signal ARCH-R338-STORES-PROVIDER set its trigger at "an 11th store". Round 357 adds the 11th per-provider store, `ArrangementPlaybackContext`, which holds `isPlaying`. The store follows the existing `*-store.ts` pattern, so a later consolidation only moves one more store. That is the `tech-lead` view in `b-round-356.md` §3.
- **Accumulated risk on one owner.** `ArrangementContext.tsx` and `StudioWorkspace.tsx` are the owners of every PERF-10 slice. The next slice, SIG-R322-ACTIVE-TRACK-STORE (clip click, 83 components), adds a 12th store.

## What to run
Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on the master that gate 357 publishes, or on `d49536b` if gate 357 has not run yet. Questions 1–4 are unchanged from `b-round-352/root-request-arch-checkpoint.md`. One sub-question is added to question 1:
- **1b.** For the remaining PERF-10 slices (`activeTrackId` and selection, status, then the stable actions), should each one add another provider store, or should they share one composed `ArrangementStores` context or one zustand store with slices? For each option, give keep or extract, the value, the risk, and at most three sentences.

## What B does with the answer
- Root records the answer. B turns each approved extract into one bounded task with one owner and behaviour-preserving tests.
- Independent core work does not wait for the answer.
