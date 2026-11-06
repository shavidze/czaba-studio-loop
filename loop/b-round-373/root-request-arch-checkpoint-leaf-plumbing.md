# Root request: bounded frontend-architect checkpoint, ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING

**Requested by:** B, at the round 373 → 374 planning, 2026-11-06 (D-29z1238). It does not block anything. Round 374 is dispatched with pattern A.

**Why now (feature boundary plus accumulated risk on one owner):**
- PERF-11c-i (round 371) and PERF-11c-iii-a (round 374) both add prop plumbing (Pick<> actions, memo views, stable callbacks) to the same `StudioWorkspace.tsx` region. That file is about 3,684 lines at e69eba4.
- The remaining leaves are ArrangementLibrary with LibraryPreview, Transport, MarkerRow, LoopBrace, VideoDock and ArrangementLane (35 fields × 4 lanes). With pattern A, each of them adds more of the same.
- The `tech-lead` consult for round 374 answered yes to a checkpoint now: signal #3, a repeated costly change on one owner (`b-round-373/consult-tech-lead.md`).

**The question (one):** where should `ArrangementContextValue` be split into actions and data before the Lane and VideoDock rounds?
- **(A) Per leaf:** Pick<> props, a memo view and a PropEquality table, applied leaf by leaf. This is the current pattern (rounds 371 and 374).
- **(B) A stable actions context plus data stores:** one actions value that never changes, and data selectors through zustand stores (for example a view store for `pxPerSecond`, or an arrangement-snapshot store). This follows `docs/technical/performance/oss-adoption.md` l.32: "one store per concern; actions stay stable". It moves `history.present` into a second owner (checkpoint signal #2).

**Inputs:**
- **The HEAD probe.** On a zoom key, a lane commit or Ctrl+Z, StudioWorkspace and every leaf render once (`b-round-373/probe/leaf-head.json`, `subtree-head.json`).
- **The perf harness on the 374 sketch.** `interact.zoom.1.components-per-key` drops from 73 to 67, and drag `releaseComponentsMax` drops by 6 (`b-round-373/perf-sketch-vs-head.txt`).
- **The field inventory:** render-time reads versus reads used only in handlers, per leaf (`b-round-373/consult-perf.md`).

**What we need back** (`store/.claude/references/architecture-checkpoint.md` format):
- a keep/extract argument;
- the value and the risk;
- at most three sentences.

If root picks (B), B plans it as a separate bounded task, with one owner and behaviour-preserving tests, before the Lane round. Until then, B continues with pattern A on the small leaves only: Library with LibraryPreview, then Transport, LoopBrace and MarkerRow. B does not start Lane or VideoDock before the answer, or before RETRO 384 if no answer comes.
