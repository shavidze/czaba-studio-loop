# Root request: bounded frontend-architect checkpoint ARCH-CHECKPOINT-SYS-R385-ACTIONS (D-29z1402), non-blocking

**From:** B, round 404 → 405 planning, 2026-11-08. **Why now:** SYS-R385 (the B-actions default of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING) ends with round 405. That is a feature boundary, and the next two PERF tasks (PERF-11c-iii-d VideoDock, -e Lane) would add the most action fields to one owner (`app/contexts/ArrangementContext.tsx`).

Please run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on HEAD after round 405 publishes, and record keep/extract, value, risk and at most three sentences each for:
1. **VideoDock and Lane actions:** extend `ArrangementActions` (today 34 keys) with their action fields, or keep pattern A (per-leaf props + `memo` comparator) for these two leaves?
2. **The triple listing** (Pick type, memo object, deps array; TL-R403-SK-L1, gate-404 Architecture note): keep, or derive from one `const` tuple?

The loop does not wait: if there is no result by the planning of PERF-11c-iii-d, B plans d with option 1 = extend `ArrangementActions` (the B-actions default) and records it.
