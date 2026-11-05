# B — Round 341 → 342 planning

Decision: **CONTINUE**. D-IDs D-29z1067 … D-29z1074. Backlog v300 → v301 (`b-round-341/update-backlog.py`, `update-feature-status.py`; backups `b-round-341/*-before-342.*`). Round 341's task is archived as `tasks/round-341.md`.
Advisor: available, and consulted after orientation and before writing. Its classification and row split are followed. It was consulted again before declaring done.

## Inputs read
- `context/active-summary.md`, `gates/gate-round-341.json` (`skipped`, "no real changes", HEAD `99a5912`), `regression-last.json` (2026-11-02 / round 301).
- `current-task.md` (round 341), `a-round-341.md` (baseline OK, no change), `c-round-341.md` / `.json` / `-result.json` (303 turns, ~3 h, `end_turn`), `c-round-341/progress.json`.
- `b-round-340.md`, `b-next.json`, and the c4-ii draft in `b-round-339/`.
- Row definitions by ID only, in `tasks/round-340.md`, `tasks/round-301.md`, `tasks/round-258.md`, `c-round-301.md` and `c-round-311.md`.

## Round 341 result (independent C evidence only)
- **PASS:** SOURCE-SCOPE; G341-AUTH (fake Bearer 403 with the mock); the R340 rows WAVEFORM, DETAIL-TEXT, SHOWN-READERS, PROJECT-END, FADE-STATUS+DRAG-A (0 DIFF, WAV sha equal), SELECTION, RANGE, PERF3D and NAME; RR-PERF (rc 0, 3/3, rowcmp 0 DIFF); RG-SMOKE; RG-01…24 and RG-T1…T4B at both viewports; most R301 rows; RP-NOBPM-RULER.
- **Partial:** OVERVIEW-METER, PEAKS, RESCHEDULE, JOURNEY, FONTS, WORKER-R2, RV/RR/RS.
- **0 FAIL, 0 Medium+, 2 Low.** `browserVerified` and `realVerified` are false.
- **Classification (D-29z1067):** C stopped itself (`stopSignal: none`) with rows that had a script still unrun: WK-GUARD/HEAD-CONTROL, R301-PRICE, RS at 1280, RG-22 narrow, and rp301. That is outcome row "a browser row that could run here did not run", not "every row has a result". So **`regression-last.json` is not updated**, and the remainder runs as round 342. No item changes status; nothing becomes მზადაა.

## Rulings (D-29z1068 … D-29z1072)
- **"press L" sub-check: void.** This was B's spec defect. SA-14 is RR-STRIP's tag, and there is no bare L key (loop is Ctrl+L). The OVERVIEW PASS covers the invariant. Signal: B-R341-SPEC-UNDEFINED-ROW.
- **FONT-PIXEL: retired.** The oracle was stale. C's round-341 screenshots become the baseline for the next regression. The "/s/" wording was B's; woff2 is served from `/assets/`.
- **NO-CHANGE posctl:** the oracle is invalid. Round 342 records a fresh one.
- **RR-OSS full suite** is a gate row.
- **C-R341-01** = C-R318-06 reproduced. It is Low (no data change) and moves to `deferred_low_polish` with the new evidence. C-R318-06 leaves `remaining`.
- **C-R341-02** (Low, a regression since PERF-7; origin: a B spec gap). Font preloads go unused after client navigation from a product page. It goes to `deferred_low_polish`. Signal: PERF7-CLIENT-NAV-PRELOAD (not scheduled).
- **INFO-C341-DELETE-MISTAKE:** C deleted untracked evidence WAVs across the loop folder after a failed `cd`. That is data loss of evidence, not of the app or `store/`. Recorded for root. New lesson L60. Oracles that compare WAV bytes must regenerate their reference first. B deleted and restored nothing.
- **Other observations recorded:** EXPORT-ESC-FLAKE (watch), STORE-WEIGHT, R252, LATCH-SR. INFO-C340-EARLY-END repeated (L59 now 2×).
- **lessons.md:** L60 added, L18 and L19 merged. It stays at 60 lines.

## Next task (round 342)
- REGRESSION-ROUND-2026-11-05 part 3 on `99a5912`. A changes nothing.
- C runs a **closed list of 12 rows**, each with its script, output redirect, oracle and allowed non-PASS statuses: WK-GUARD (compare the round-341 probe outputs, or re-run), WK-HEAD-CONTROL, RS-1A…1D at 1280 (gift-card step guarded as a lookup), the RS-2A/4B/HIDDEN/LM mapping, RG-22 narrow, rp301, five parked rows built from their row text, a POSCTL fresh oracle, PRICE (mock swap; the last store row), G342-AUTH, and SOURCE-SCOPE.
- The outcome is fixed in advance. If every row has a result and there is no Medium+ finding: `regression-last` is set to round 342, and round 343 = PERF-DRAG-PREVIEW c4-ii.
- **c4-ii package check:** `git apply --check` of `b-round-339/sketch/{source,tests,budgets}.patch.txt` on `99a5912` gives 3/3 OK. K1 stays `gate-round-339.json`, because no later gate has published. At dispatch, "round 340" becomes 343, and the budget notes are regenerated with `apply-budgets.py`.

## Scope and gates
- **No scope shrunk.** The only rows closed without a re-run are B's own undefined or stale-oracle rows, each with its reason. No feature request is deferred.
- Open Critical/High: 0. The open Mediums are root, manual or `awaiting_user` only (2026-10-23 clarification).
- Reviewer architecture notes stay signals. The frontend-architect checkpoint stays planned for the close of PERF-DRAG-PREVIEW (after c5), so no root request is made now.
- **Purchase protection:** G341-AUTH PASS.
- COMPLETE is not possible: many scoped items remain.
- Nothing external blocks.
- Not ready for a commit: no source change.
- RETRO: the last one was 336, so the next is due around 351.
