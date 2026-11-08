# B round 408 → 409 planning report

**Date:** 2026-11-08. **Baseline:** gate 408 published `37b1db8` on both remotes (`gates/gate-round-408.json`); HEAD `37b1db8`, clean tree. **Advisor:** available and used three times: after orientation, before hand-off, and at the attempt-2 resume check. **Consults** (read-only project agents): `performance-optimizer` once, `tech-lead` twice (v2 and the dispatched v3).

## 1. Round 408 acceptance (from independent C evidence only)
- `c-round-408.json`: `taskStatus` PASS, 8/8 rows passed, `failed` [], `bugs` [], `browserVerified` true, `realVerified` true. Gate 408 published `37b1db8` (review COMMIT OK, no blockers).
- **PERF-11c-iii-e-i → done** (D-29z1416).
- The fake-bearer `/api/studio-token` row stays open as backend-blocked evidence. It is not PASS.
- C's recorded gaps (not bugs):
  - The library drop, video import and lane drag were not browser-run; unit files cover them.
  - The `active-track` step was vacuous. That is fixed in the 409 probe.
- **Rulings (D-29z1417):**
  - TL-R406-SK-L1/L2/L3 closed.
  - A-R408-REVIEW-AC8-PAN-TITLE → `deferred_low_polish`.
  - Gate-408 items 1/2 are already TL-R408-SK-L1/L2, so no duplicate was added.
  - The Architecture notes (A reviewer + gate 408, both "keep"; the triple 59-key list) → signal SIG-R408-ACTIONS-TRIPLE-LIST and the fifth echo on ARCH-CHECKPOINT-SYS-R385-ACTIONS. Not scheduled.
- Backlog v381 → v382 (`b-round-408/update-backlog.py`).

## 2. Next task: round 409 = PERF-11c-iii-e-ii (`current-task.md`; archive of 408 in `tasks/round-408.md`)
- **Why this one:**
  - No C bug is open, and no Critical or High.
  - The open Mediums are root, manual or `awaiting_user` only.
  - The regression is not due (last 2026-11-07; next on or after 2026-11-10), and the RETRO is at 416.
  - e-ii is the next dependency-ordered stage (D-29z1414), and it closes PERF-11c-iii.
- **What:** the Lane becomes a shell (keeps `useArrangement()`) over `memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual)`. It uses per-lane props, a typed track field table, and `useMemo` lane sources and ghost titles. It is behaviour-preserving, and the only visible change is less render work.
- **Measured saving** (B's dev leaf probe, 15 steps, both viewports, plus a loaded replicate): the inner renders `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]` against the shell's `[0,12,4,4,0,0,0,4,4,4,4,4,8,4,4]`.
  - Mute, Undo and Solo each render 1 lane instead of 4.
  - The library preview renders 0 lanes instead of 4 and 8.
- **Design change during planning:**
  - Sketch v1 content-compared the lane sources. Its always-equal mutant could not be shown red: peaks and the ready state land in the same callback.
  - v2 replaced the compare with a `useMemo`, so every input change forces a render by construction.
  - v3 applied `tech-lead`'s four Lows and `performance-optimizer`'s compile-time guard.
- **Dispatched patch:** `b-round-408/sketch-409.patch.txt`, sha `1beedffbda3eca0f…` (2 files).
  - tsc, Biome and lint rc 0. Covering set 914/914. Full suite 262/3,885 rc 0.
  - Mutants 9/9 red, plus the tsc guard.
  - Lane probe `ok` on HEAD and on the sketch at both viewports. The DROP-SOLO-FIELD browser mutant is red.
  - `tech-lead` gives APPROVE on the dispatched sha (`sketch-review.md`).
- **Grants (4):** the two patch files, doc 261 l.4 only, and new doc 262. Frozen 1,299; protected 11 unchanged. Claims: `b-round-408/claims-409.sh`, with outputs saved for planning and for the committed sketch scratch, and both stderr empty.
- **Process facts (L56):** v1 and v2 artifacts are kept under `b-round-408/*/v2/` and `lane/v1-*`. The sketch server on :5174 (own Vite cacheDir) was stopped, and the scratch `vite.config.ts` was reverted before the commit. `store/` was never edited (K2 = 0 at planning); :5173 answers 200.

## 3. Architecture (feature boundary)
- **ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (D-29z1418)**, requested of root in `b-round-408/root-request-arch-checkpoint-perf11c-iii.md`. Run it after round 409 publishes. It asks three questions: the triple 59-key list; a shell + memo helper or per-leaf code; and `ArrangementContext.tsx` ownership.
- It is non-blocking. If there is no result by the next planning, B continues with PERF-15. The scope of ARCH-CHECKPOINT-SYS-R385-ACTIONS is superseded, and that entry stays as a pointer.
- The `ACTION_KEYS` proposal is a backlog signal, not a scheduled task.

## 4. Status
- Backlog v383 (D-29z1416…D-29z1420).
- `feature-status.md` updated: header, round 408 line, the next line, and the STUDIO-PERFORMANCE row.
- `regression-last.json` unchanged (no regression round closed).
- **Ready to commit:** round 408 is already published. Round 409 is not ready until C PASS and the root gate.
- **Decision: CONTINUE.** Many scoped items remain (see `b-next.json`). Nothing needs external input to proceed.
