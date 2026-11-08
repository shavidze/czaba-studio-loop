# ARCH-CHECKPOINT-PERF15-PEAKS (B, round 412 -> 413 planning, D-29z1436) — bounded, non-blocking

**For root:** at the PERF-15 feature boundary (closes on C round 413 PASS), call the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`. You may fold this into the still-open ARCH-CHECKPOINT-PERF11C-III-BOUNDARY answer (its question 3 already covers ArrangementContext.tsx ownership).

**Question (max 3 sentences in the answer, keep/extract with value and risk):**
1. Precomputed-vs-decoded peaks arbitration (fetch, `peaksDecided`, `precomputedPeaks`, `storeSourcePeaks`, the 16-bit/8-bit/length-match rules) lives inside `ArrangementProvider` (signal SIG-R410-PEAKS-ARBITRATION). Keep, or extract a pure peaks-source unit in `app/lib/arrangement` with its own tests?
2. The demo MP3 ↔ peaks URL pairs live in 4 places (`studio-lab-demo.ts`, the PS16/PS17 map, the generator file list, the meta; SIG-R411-PEAKS-URL-COPIES). Keep (the reviewer's view: the test copy is intentionally independent), or derive?

**Not requested:** any code change in round 413. A root-approved extraction becomes a separate B task with one owner and behaviour-preserving tests.
