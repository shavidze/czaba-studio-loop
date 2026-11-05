# Root request: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (D-29z1129)

**From:** B, round 352 → 353 planning, 2026-11-05. **Blocking:** no. RETRO 353 and PERF stage 2 (a test-only row conversion) go ahead without waiting for it.

## Why now
- **Feature boundary.** PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 is closed. C round 352 passed and gate 352 published `a55543b`.
- **Accumulated risk on one owner.** `app/components/arrangement/ArrangementVideoDock.tsx` changed in rounds 345, 349 and 350–352. The A round 350 reviewer (A-R350-ARCH-PREVIEW-READER) and the gate 352 reviewer (GATE352-ARCH-DOCK-LIFECYCLE, signals 3 and 4) both named it.
- **No answer yet.** The checkpoint has been "wanted" since D-29z1104 (round 348 planning), and no answer artifact exists.

## What to run
Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on master `a55543b`. For each question, give keep or extract, the value, the risk, and at most three sentences.
1. The per-provider store contexts (ARCH-R338-STORES-PROVIDER).
2. The size of `ArrangementClip`'s gesture handler, and its group and single-clip branches.
3. The perf harness drag measurers (ARCH-R339-DRAG-MEASURE-EXTRACT, ARCH-R337-PERF-HELPERS-TO-LIB, A-R349-ARCH-VIDEO-SPEC-SPLIT, GATE349-ARCH-SPEC-SPLIT, ARCH-R348-DP-GESTURE-CYCLE, ARCH-R347-LANE-HEADER-MIX). This includes whether to split the interactions spec by gesture family, which would also ease ROOT-REQ-PERF-TIMEOUT.
4. **New:** the dock's preview reader (`useVideoLanePreviewReader`, `sameClipList`) and the fade-overlay subscription. Inputs: A-R350-ARCH-PREVIEW-READER, GATE352-ARCH-DOCK-LIFECYCLE, and the stale `cachedLane` invariant (A-R350-REVIEW-CACHED-TRACKS, GATE352-S1). Should these stay in the dock, or move to `app/lib/arrangement/` or `ArrangementContext`?

## What B does with the answer
- Root records the result. B then turns each approved extract into one bounded task with one owner and behaviour-preserving tests (DP66–DP72 and the M-B1 mutant stay red).
- Independent core work does not wait for the answer.
