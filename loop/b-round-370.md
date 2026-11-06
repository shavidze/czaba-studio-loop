# B round 370 → 371 planning

## 1. Round 370 result (D-29z1223)
- **C round 370 PASS** (`c-round-370.json`): 16 rows passed, CHAT BLOCKED ("backend unavailable in cloud"), `browserVerified` true, `realVerified` true, 0 bugs. B re-ran `python3 -I tools/l57-check.py c-round-370.json`: L57 OK (the two null fields carry a reason).
- **Gate 370 published** `f530e2d` on both remotes; this is the new baseline. PERF-11a is **done** (studio-lab 362,477 / home 250,526 / studio-guard 270,648 encoded bytes under asserts 372,000 / 258,000 / 278,000).
- `tasks/round-370.md` is the archived round-370 task (sha256 `c87e15f3…`, identical to the dispatched `current-task.md`).

## 2. Findings recorded (D-29z1224)
- Lows → `open_findings` + `deferred_low_polish`: A-R370-REVIEW-L1…L4, GATE370-L3-STORE-TO-STUDIO-EXIT-FADE. **A-R370-REVIEW-L4** (RT2 uses `react-router-dom`'s MemoryRouter while PageTransition reads `@remix-run/react`) is flagged as an L8 time bomb: fix it in the next round that owns `route-transition.test.tsx`, or before any router bump.
- Gate 370 finding 1 is B-R369-CHAT-UNMOUNT-RACE (already deferred).
- Architecture signals (not scheduled): A-R370-ARCH-FRAMER-STATIC (framer still in the root chunk on `/studio*`), GATE370-ARCH-CHAT-HUB (a `lib/chat-hub` helper when the unmount race is fixed).
- `root-pre-push-review.md` / `publication-checkpoint.json` are the 2026-10-07 documents; no new findings for this round.

## 3. Round 371 = PERF-11c-i (D-29z1225, D-29z1226)
**Why this stage first.** PERF-11c (absorbed inputs GATE361-S1, SIG-R360, SIG-R361, A-R362, PERF2-FIRST-FRAME-LONGTASK) is not one round. 28 test files read `status`/`statusSequence` off the context value (110 + 71 reads; 14 via `useWorkspaceProbe`, 14 via a local `useArrangement()` probe), so removing status from the value (11c-ii) carries a test-migration grant. The group header leaf (11c-i) has a small grant, jsdom rows red at HEAD, and the proven round-362 leaf pattern. Advisor consulted on the split.

**Sketch** (`b-round-370/sketch.patch.txt`, sha256 `e82ad292…51bb`):
- the leaf gets `actions` (Pick of 9 stable callbacks) and `soloState` props; it no longer calls `useArrangement()`;
- the wrapper's memo compares props through a compile-checked `PropEquality` table (content compare for overview clips and active candidates);
- `useArrangementPlaybackStoreContext(hookName)`.

**Evidence** (all under `b-round-370/`):
- HEAD red: GH1, GH2, GH5, L8d (`head-new-rows.log`). 8 mutants red as predicted (`mutants/`).
- Full suite on the sketch: 252 files / 3,703 tests (`precheck-full.log`). tsc / Biome / lint rc 0.
- Perf, run alone: interactions spec on v1 — 95 asserts pass, 264 deterministic rows equal to C round 364. Fader spec on v2 — 94 asserts pass, all deterministic rows equal to C round 347, including the 26 group fader rows. The demo has no track group, so no perf row moves; the jsdom render rows are the asserts.
- Browser HEAD probe at both viewports (`probe/group-head.json`): group behaviour baseline; muting a lane outside a folded group renders the header 1× and the wrapper 1×.
- `tech-lead`: v1 review (1 Medium: comparator could silently ignore a new prop → fixed in v2; Lows fixed or ruled), delta review approved v2. Reviewed sha = dispatched sha (`sketch-review.md`).
- Claims: `claims-371.sh`, outputs at HEAD and on the sketch, no `MISSING`.

**Consults:** `tech-lead` (two reviews). `performance-optimizer` was not consulted: no bundle, network or timing change; both perf specs were measured directly. `product-designer` / `ableton-arrangement-expert`: not applicable (no visible change).

## 4. Architecture checkpoint
Not requested now: 11c-i is one small leaf change. **11c-ii** (a fifth per-provider store for committed status, touching the status reducer order — A-R327, GATE253-ARCH-STATUS-SCOPE) is the feature boundary where B will ask root for a bounded `frontend-architect` checkpoint, unless root answers one of the open requests first. That request does not block 11c-ii if unanswered (2026-10-19 workflow).

## 5. Regression and RETRO
- `regression-last.json` = 2026-11-05 → REGRESSION at the first planning on or after 2026-11-08.
- RETRO due about round 384 or at the end of STUDIO-PERFORMANCE.

## 6. Decision
**CONTINUE.** Much scoped work remains: PERF-11c-i…iii, PERF-12…15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and the deferred Lows. No open Critical or High finding. The open Mediums are root-only, manual or awaiting_user, and the 2026-10-23 clarification says they do not block. Nothing external blocks round 371. PERF-11b stays awaiting_user (non-blocking).

## 7. Ready for commit
Round 370 is published. Round 371 is ready for A; after C PASS it is one gate-ready unit (5 source/test files + doc 238).
