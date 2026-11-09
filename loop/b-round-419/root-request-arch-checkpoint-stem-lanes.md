# Root request: frontend-architect checkpoint ARCH-CHECKPOINT-STEM-LANES (D-29z1464)

**From:** B, round 419 -> 420 planning, 2026-11-09. **Process:** `store/.claude/references/architecture-checkpoint.md` (read-only frontend-architect, called by root).
**Why now:** feature boundary. STEM-LANES (Saba Q2, review F2 High) changes ownership: library add starts creating lanes and a group inside `app/contexts/ArrangementContext.tsx` (5325 lines at 6609dfa). Line count alone is not the reason (tech-lead, `b-round-419/consult-tech-lead.md` item 5).
**Non-blocking:** STEM-LANES also waits for `user-review/AGREE-STEM-LANES.md`. If this request is unanswered when Saba answers, B plans S1 with the tech-lead default (new module `app/lib/arrangement/stem-lanes.ts`, `createArrangement` unchanged, seeded screen stays four lanes) and records it as an L46 default. Root's answer overrides it.
**Absorbs:** ARCH-CHECKPOINT-PERF9-STEM-CACHE (unanswered since round 368; its L46 default SYS-R369 shipped in round 419).

## Questions (max three sentences each in the answer: keep/extract, value, risk)
1. Does lane and group creation live in a new pure module (`stem-lanes.ts`) with one context call, or does the context grow?
2. Is the "Stems" group a load-bearing structure (convert the fixed `stems` track into a group header, product-designer option O1) or a new track kind? What happens to saved sessions (`workspace-session-store.ts`) that reference the `stems` track id?
3. A new track id makes `diffClipSchedule` return null (`reschedule.ts`), so every add rebuilds the graph. What does that cost while playing, and what lane cap fits the perf budgets (PERF-14 scale harness)?
