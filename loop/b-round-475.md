# B round 475 → 476 planning (2026-11-12)

**Result: CONTINUE.** Round 476 = DPG-FIX P0 stage 3a (DPG-P0-3a): the entrance loader and the header logo in Obsidian & Brass (`current-task.md`).

## Consults
- **Advisor:** available, and consulted after orientation. Its advice was applied: read the gate review and all of A's report, snapshot first, rule on A's STOP, split P0-3, give root the primitives text now, consult product-designer before the sketch, keep one background value, rule each parked item, and ship as `record` any pixel row B has not run.
- **`product-designer`:** ruled on the palette. `b-round-475/pd-p0-3a.md`.
- **`tech-lead`:** reviewed the sketch, APPROVE WITH CHANGES. All three changes are adopted in v2. `b-round-475/sketch-review.md`.
- **`performance-optimizer`, `ableton-arrangement-expert`:** not needed. This is a Store colour round.

## Inputs read
- **Round 475:** `tasks/round-475.md` (a copy made with `cp -n`, byte-identical by `cmp`), `a-round-475.md`, `c-round-475.md`/`.json`, `gates/gate-round-475.json` (published `edeba5a`) and `gates/round-475/review.md` (9/10, no Critical).
- **Context and planning sources:** `context/active-summary.md`, `lessons.md`, the backlog IDs by lookup, and `b-round-473/dpg-inventory.md`.
- **Date:** 2026-11-12 (`date -u`). REGRESSION is not due; it is due 2026-11-13, per `regression-last.json`.

## Backlog (evidence: C round 475 only)
- **D-29z1682:**
  - DPG-P0-2 is C PASS and **awaiting the DP-gate re-review**. It is not მზადაა.
  - A-R187-PRODUCTCARD-PRIMARY-TOKEN is closed (C6).
  - C-R475-02 is closed as an environment transient, and lesson L38 is amended in place (still 60 lines; `b-round-475/lessons-diff.txt`).
- **D-29z1683:** A's STOP is ruled.
  - C-R475-01 is closed, with the winning clause written into task 476.
  - R1 is recorded as `confirmedBy` (L7).
  - R2–R4 and the UT3 title go to `deferred_low_polish` (C-R475-REVIEW-LOWS).
  - The gate suggestions become signals.
- **C14's real-owner path** stays open evidence (BLOCKED: backend unavailable in cloud).

## Round 476 scope (D-29z1684…D-29z1686)
- **P0-3 is split.** 3a = loader + header logo colour, now. 3b = `docs/design` reference docs, next. The docs hue scan found 51 hits, 13 of them in DESIGN_SYSTEM.md.
- **Sketch v2:** `b-round-475/sketch-476.patch.txt` (sha `83341e9f…`, 5 files). Pre-check on a scratch copy:
  - typecheck and lint rc 0;
  - covering 16 files, 262 tests;
  - full suite **287 files, 4209 tests** on v2 (and on v1);
  - mutants **12/12 red**;
  - browser probes at both viewports, HEAD (:5173) against the sketch (:5181, own Vite cacheDir, now stopped).
- **Measured on the sketch:**
  - cover, loader and page are all `rgb(14, 13, 12)` (HEAD cover and loader `rgb(0, 0, 0)`);
  - the wordmark and the header logo are `rgb(201, 164, 106)`;
  - wordmark box 318×72, unchanged;
  - contrast 7.55–7.56:1.
- **Parked SpotlightLoader items now taken:**
  - the portal test (P1);
  - GATE460-2 (P4);
  - A-R460-REVIEW-5 (the comment).
- **Re-parked, with reason:** A-R460-REVIEW-4 and C-R190-I4. They touch the skip path and are not colour.
- **To Saba:** `user-review/questions-round-475.md` Q1, SABA-Q-DPG-LOGO-FONT-SERIF (`font-serif` is a no-op).
- **SABA-B-16 stays open.**
- **To root:** the exact `.claude` replacement text, in `b-round-475/root-primitives-patch.md`.
- **Claims:** `b-round-475/claims-476.sh`. The planning output ends `L58 OK`. The allowed deltas come from a `git clone --shared` of HEAD with the sketch and a doc-309 placeholder; only K1, K2b and K3–K8 differ.

## Closing check (advisor)
- **e2e/perf pins:** none on the loader or logo colours. `e2e/navigation.spec.ts` checks only that the header logo is visible and clickable.
- **D-29z1687:** the STORE-1 rule R59 colour clause (header wordmark `text-foreground`, vetoable) is superseded by Saba's DPG-LOGO. The regression round expects the brass logo.
- **L29 self-grep on the task:** K18 and K20 tags were added; `entrance-timing.mjs` was added to K19; doc l.4 now uses the L28 stage form (`stage 3 of 4`); the C6 "255" clause is scoped to the captured text; the unmeasured logo-box sentence was replaced by "only its colour class changes [K6]".
- **Claims re-run after the last edit:** at HEAD (`claims-476-planning-output.txt`, `L58 OK`) and on the sketch clone, whose doc placeholder holds the exact l.4 (`claims-476-allowed-deltas.txt`); 16 diff lines, K1/K2b/K3–K8 only.
- **`b-next.json`:** `remaining` follows the id convention of `b-next-before.json`.

## Architecture
- **`createDustParticles`:** keep (tech-lead), SIG-R476-DUST-KEEP.
- **The DPG-FIX block:** the work spreads over Store components with no repeated structural risk on one owner. No frontend-architect checkpoint is requested now; ARCH-SPLIT stays queued.

## Next
1. If the date is 2026-11-13 or later: REGRESSION-2026-11-13 first.
2. Then DPG-P0-3b (docs).
3. Then RETRO 480.
4. Root re-runs the DP gate after P0.

**Ready for commit:** round 475 is already published. Round 476 is dispatched, with nothing new ready to publish.
