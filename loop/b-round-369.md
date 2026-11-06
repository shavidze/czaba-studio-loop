# B — round 369 → 370 planning

**Date:** 2026-11-06. **Role:** B (planning artifacts only; no `store/` file was edited, and HEAD `29f4b4d` is clean: K2, K12). **Advisor:** used twice: before the approach was chosen, and before hand-off. The hand-off call led to the K11 allowed delta, the K16 mutant counts and this line. **Consults:** `tech-lead` ×3 (scope consult, v1 sketch review, delta review) and `performance-optimizer` ×1. Their verdicts are opinions.

## 1. Round 369 closed from C evidence (D-29z1218)
- `c-round-369.json`: PASS, 11 rows, `browserVerified` true, `realVerified` true, 0 app bugs, L57 checker rc 0.
- `gates/gate-round-369.json` reads `skipped — no real changes` (head `29f4b4d`). **Nothing was published.** The round-370 baseline stays `29f4b4d`, which equals HEAD.
- **RETRO 369 is done** (feature-status: მზადაა).
- **C369-L1** (Low, origin B) is fixed in B's own artifacts:
  - `retros/retro-369.md` §10 and `lessons.md` l.3 now name what was dropped from L58: the row label R11-P1e, the chain ranges 312–314/316–317/318–320, and the descriptive phrases. They no longer say "no evidence id lost".
  - Before-copies: `b-round-369/retro-369-before-370.md` and `lessons-before-370.md`. Diff: `b-round-369/lessons-diff.txt`.
  - `lessons.md` is still 60 lines (K19). C re-checks this in row RT-FIX.
- **C369-L2** (Low, B spec) is closed as wording. A cross-lane move is labelled "Undo: Move to track — <lane>". Round-370 smoke uses that label.
- No lesson was added: both are single-event precision slips, and `lessons.md` is at its cap.

## 2. Next scope (D-29z1219…D-29z1222)
- **Regression is not due.** `regression-last.json` = 2026-11-05 (K20), so it is due on or after 2026-11-08.
- **SYS-R369 is skipped under its own condition.** Root has answered none of the 18 `architecture_checkpoint_requests`, ARCH-CHECKPOINT-PERF9-STEM-CACHE included. SYS-R369 stays `queued_conditional`, and its 9 Lows stay deferred. Under the outcome table fixed in advance (D-29z1216), the next round is **PERF-11**.
- **PERF-11 is split by owner and by what the loop may edit:**
  - **PERF-11a (round 370):** lazy signalr in `ChatContext.tsx`, plus `RouteTransition`, which removes the framer page transition on `/studio*` and keeps a keyed `.page-transition-wrapper`. Three byte asserts.
  - **PERF-11b:** lazy Firebase. The only static path runs through the protected `app/lib/auth.ts` (K7), so it goes to root/Saba: `b-round-369/root-request-perf11b-firebase-lazy.md` (ROOT-REQ-PERF11B-FIREBASE-LAZY, awaiting_user, non-blocking).
  - **PERF-11c:** the absorbed ArrangementContext leaf-consumer inputs (GATE361-S1, SIG-R360, SIG-R361, A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT) and PERF2-FIRST-FRAME-LONGTASK.
- **Target re-based (D-29z1220).** At HEAD, `/studio-lab` loads 378,121 B, not 328 KB. The perf-plan target of ≤ 230 KB is not reachable inside the loop:
  - Firebase is about 36 KB gzip (an esbuild estimate, so an inference);
  - framer-motion is 39.1 KB, reached from root through Toast, Header and others;
  - the Studio route chunk alone is 123.9 KB.

  This is written for Saba in the root request.
- **Candidate, not scheduled:** PERF-CAND-STUDIO-LENIS. `useSmoothScroll` runs a Lenis rAF loop on `/studio*` too (`performance-optimizer`, opinion; K13).

## 3. Pre-check evidence (L30, L37, L58)
- **C's command on HEAD and on the sketch:** the perf spec `studio-lab-resources`.

  | Route | HEAD | Sketch |
  |---|---|---|
  | `/studio-lab` | 378,121 | **362,477** |
  | `/` | 264,641 | 250,526 |
  | `/studio/middle-east` | 286,109 | 270,648 |

  The new asserts (≤ 372,000 / 258,000 / 278,000) PASS on the sketch. The mutant with ChatContext back to HEAD FAILs all 3 (378,149 / 264,669 / 286,137). The bytes were identical across the 3 runs of each spec, so they are deterministic (no load replicate is needed for bytes).
- **Paint (record):** FCP − DCL is 358 ms at HEAD and 6 ms on the sketch. SSR `opacity:0` appears in 5/5 HEAD runs and 0/5 sketch runs. Files: `probe/paint-final.log`; an earlier pair is `probe/paint-run1.log` (352 → 44).
- **Unit:** 4 covering files, 23/23. The chat file passes under 3 shuffle seeds. Six named unit mutants are each red (`mutants/`).
- **Typecheck:** rc 0. **Biome:** rc 0 (5 pre-existing warnings).
- **Sketch review:** `b-round-369/sketch-review.md`.
  - v1 had two Mediums (budgets JSON churn, test-order dependence). Both are fixed in the sketch.
  - The delta review covers the frozen sha `338dbe40…`, which is the dispatched sha.
  - The Lows are ruled. TL-4 (an unmount race that exists at HEAD) is deferred as B-R369-CHAT-UNMOUNT-RACE.
- **Claims:** `b-round-369/claims-370.sh`. The HEAD output (`claims-370-output.txt`) has no `MISSING` and an empty stderr. The sketch output is `claims-370-sketch-output.txt`.

## 4. Files written by B
- **Task and archive:** `current-task.md`; `tasks/round-369.md` (an archive copy of the round-369 task, K21).
- **Backlog and status:**
  - `backlog.json` v335 via `b-round-369/update-backlog.py`. It holds D-29z1218…1222, the round 369/370 entries, C369-L1/L2, B-R369-CHAT-UNMOUNT-RACE, the PERF-11a/b/c and PERF-CAND-STUDIO-LENIS stages, the SYS-R369 and ARCH-PERF9 status prefixes, ROOT-REQ-PERF11B-FIREBASE-LAZY and the narrow grants for round 370.
  - `feature-status.md`, via `update-feature-status.py`.
- **Retro and lessons:** `retros/retro-369.md` §10 and `lessons.md` l.3 (C369-L1).
- **Evidence:** `b-round-369/*`. The before-copies are `backlog-before-370.json`, `b-next-before-370.json`, `feature-status-before-370.md`, `retro-369-before-370.md` and `lessons-before-370.md`.
- **Scratch trees** outside the loop folder: `/home/runner/b369-head` and `/home/runner/b369-sketch`. They do not survive the job. Everything they produced and everything cited is saved under `b-round-369/`, and the sketch itself is `sketch.patch.txt`.

## 5. Feature boundary and architecture
PERF-11a touches `app/root.tsx`, `ChatContext` and the animations folder. None of these has repeated structural risk, so B adds no new architecture checkpoint request. The open requests stay with root and are non-blocking: ARCH-CHECKPOINT-PERF9-STEM-CACHE and PERF-DRAG-PREVIEW-CLOSE among others. All 18 requests are unanswered. That pattern is worth root's attention, because SYS-R369 depends on one of them.

## 6. Completion status
**CONTINUE.** Much scoped work remains: PERF-11c…15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and the deferred Lows. No open Critical or High. The open Mediums are root-only, manual or awaiting_user, and the 2026-10-23 clarification says they do not block. Nothing external blocks round 370.
