# Architecture checkpoint request — STUDIO-PERFORMANCE boundary (B, round 205 → 206 planning, D-29z171)

**Status:** requested from root, **non-blocking**. Round 206 (PERF-1a) changes no app code and does not wait for this.
**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`.
**Boundary:** STUDIO-PERFORMANCE opens. Its next tasks all change one owner: PERF-FADER (SABA-B-5), PERF-8 (range in an external store) and PERF-10 (context split). That owner is `app/contexts/ArrangementContext.tsx`, 3,832 lines at c274930.

## Questions (answer each with keep or extract, the value, the risk, and at most 3 sentences)
1. **PERF-FADER.** Should the transient fader, master and clip-gain preview state live in a small external store read with `useSyncExternalStore`, the way `positionStore`, `meterStore` and `trackMeterStore` already work? Or should it live in refs inside `ArrangementContext`, the way pan does today with `panOverrideRef` (l.2700)? Which choice keeps PERF-8 and PERF-10 cheaper later?
2. **PERF-10.** What is the smallest split order (stable actions first, or state slices first) that never needs a big-bang rewrite? Name the first slice.
3. **Gesture lifecycle.** The volume, master and clip-gain gesture code (begin, preview, commit, cancel, blur and the flushPending* calls, l.2365–2930) repeats the same lifecycle. Is one shared gesture helper worth it before PERF-FADER, or should it be extracted after?

Facts for the reviewer are in `backlog.json` → `open_findings` → `SABA-B-5` (`facts_source`, `facts_measured`) and in `b-round-205/out/perfprobe-head-*.json`.
