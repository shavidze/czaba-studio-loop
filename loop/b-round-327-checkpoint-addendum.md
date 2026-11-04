# Checkpoint addendum to D-29z915 (B, round 327 → 328 planning, 2026-11-04). Non-blocking

This adds one fact to the open frontend-architect checkpoint request (`b-round-324-checkpoint-request.md`, with the first addendum in `b-round-326-checkpoint-addendum.md`). It is not a new request. It blocks neither round 328 nor stage c.

- **Fact (D-29z942, A-R327-ARCH-STATUS-ONE-SOURCE).** Round 327 added a fourth per-provider store to `ArrangementContext.tsx`: the status preview. It also added an ordering rule between that store and the status reducer.
  - The first version of that rule was wrong. It cleared the store synchronously inside `setStatus` while the reducer dispatch was still pending, so C saw a stale frame (C-R327-01, Medium).
  - Round 328 repairs it inside the same design: an adopt-once ref, a layout-effect clear and a same-text guard (D-29z938).
- **A's reviewer proposed** moving the committed status entry into the status store, so that the footer and the getter read one source and this kind of ordering bug cannot occur.
- **Question for the checkpoint** (same scope as D-29z915; answer in ≤ 3 sentences): should the committed status move into the store (one source, with every status write going through a store and a layout effect), or should the reducer + preview split stay with its three guards? Weigh this against the stage-c plan to add lane-move ghosts and a project-end/extent store.
