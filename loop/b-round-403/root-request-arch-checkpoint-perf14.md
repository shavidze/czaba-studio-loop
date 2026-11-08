# Root request: bounded frontend-architect checkpoint, ARCH-CHECKPOINT-PERF14-LANE-PEAKS

**Requested by:** B, at the round 403 → 404 planning, 2026-11-08 (D-29z1391). Non-blocking. It is the end-of-PERF-14 checkpoint that D-29z1387 announced. Format: `store/.claude/references/architecture-checkpoint.md`.

**Why now:** a feature boundary. PERF-14 stages 1–4 are done (rounds 398–403, published cc5cbc6), and the remaining 14c-ii/iii wait for Saba (`user-review/questions-perf14c-pyramid-canvas.md`). Two owners took repeated changes:
- `app/components/arrangement/ArrangementLane.tsx`: the page window, gesture pins and window `blur` listeners (rounds 400 and 402; A-R402-ARCH-PIN-TRACKING, GATE402-L1/L2/L3);
- `app/lib/arrangement/peaks.client.ts`: the fallback loop, the requesting-job side channel and `rethrowLater` (round 403; A-R403-ARCH-PEAKS-ONERROR, A-R403-L2-RESIDUAL-QUEUED-THROW).

**Questions (answer each with keep/extract, value, risk, ≤ 3 sentences):**
1. Lane: keep the gesture pin tracking inside `ArrangementLane`, or move it next to `claimPointerGesture` (one end-of-press source)?
2. Peaks client: keep the `requesting`/`requestingFailure` side channel, or give `request()` a per-job `onError` callback? The callback touches `ArrangementContext.tsx` and would remove the residual where a queued job stays `loading`.

**Measured inputs:** `b-round-403/probe/medians.txt`. At 6×, near-min zoom cost scales with mounted clips; path cost is ≤ 8 ms; churn removal gives no median gain.

If root picks extract, B plans it as a separate bounded task with one owner and behaviour-preserving tests. Until then, nothing waits: round 404 is SYS-R385-LEAF-ACTIONS-CONTEXT (ArrangementContext actions; it does not touch the lane window or `peaks.client.ts`).
