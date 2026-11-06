# B — round 363 → 364 planning

Advisor: available and consulted (after orientation, and before declaring done).

## 1. Round 363 result (from C's evidence only)
- `c-round-363.json`: **taskStatus FAIL**, browserVerified true, realVerified true. Gate 363 **skipped** (C FAIL). HEAD stays `9da8daa`.
- Passed (kept as A's partial tree, 3 modified files): SOURCE-SCOPE, RB-MEMO 13/13, MU-P/MU-W/MU-R each red on its own row, C's mutant red on RB-MEMO2, PERF 95/95 (264 rows, 0 DIFF vs C362), BG-RANGE at both viewports, G363-AUTH.
- Failed: **C-R363-01** (Medium) perf-lib 39/40, DC-KINDS; **C-R363-02** (Medium) docs 234/168 not written.
- Backlog: nothing closed. C-R320-01, A-R320-REVIEW-WAVEFORM-NAME-POSITIVE, GATE320-S3 and A-R362-DOC-STALE-MERMAID stay "closes on C PASS". PERF-10b-ii-b is not done (ბაგია → round 364 მუშავდება).

## 2. Rulings
- **D-29z1184:** round 363 = C FAIL; partial tree kept, nothing reverted.
- **D-29z1185:** C-R363-01 → option (a). Grant `perf/lib/report.test.ts`: regex + `background-range`, `toHaveLength(16)` → 18. B ran it on a scratch (9da8daa + A's 3 files + patch): **40/40** (`b-round-363/sketch-perf-lib.log`); MU-K and MU-N are each red on DC-KINDS only (`b-round-363/mutants/summary.txt`); typecheck 0. (b) and (c) are rejected.
  - **Owned by B:** the round-363 task added budgets rows without running perf-lib, which reads that file. This is B-R363-PRECHECK-PERFLIB, a RETRO-368 input (candidate L58 clause: "a task that adds rows to a budgets file runs every perf/lib test that reads it on the sketch"). B does not edit `lessons.md`.
- **D-29z1186:** reviewer Lows. R-L1 and R-L3 are applied as problems-only checks; R-L2 and the Info items need no change. The Architecture note becomes SIG-R363-DRAG-ROW-WRITER (signal only).
  - Probe (`b-round-363/im-probe-*.json`, dev, both viewports): `data-insert-marker` stays 0.000 throughout, is hidden while a range exists and visible after the reset. Clip start/width and Undo are unchanged.
  - That first probe was confounded: the clip, the grab point and the marker were all at 0 s. A second probe (`im-probe2-*.json`) first sets the marker to 5.000. The marker then stays at 5.000 through the press, the drag and the reset, and at 7.000 through a direct name-bar click, at both viewports. Confirmed: neither gesture moves the Insert Marker.
- **D-29z1187:** round 364 scope, 6 files (§1 of `current-task.md`). Claims are in `b-round-363/claims-364.sh`, with planning and sketch outputs.
- **D-29z1188:** the order is unchanged (D-29z1183).

## 3. Next task
Round 364 = the PERF-10b-ii-b re-dispatch (`current-task.md`). C checks CLAIMS, SOURCE-SCOPE, PERF-LIB 40/40, C's own perf-lib mutant, RB-MEMO, PERF (production, alone, vs `c-round-363/latest-interactions.json`), BG-RANGE + the Insert Marker at both viewports, best-effort MARKER-NONE-PLAYING-BACK, G364-AUTH and DOCS.

## 4. Status
- No Critical/High open in the cloud. The five other open Mediums are tech-lead-manual, awaiting_user or open_root, and none blocks.
- REGRESSION is due on or after 2026-11-08. RETRO is at 368.
- The arch checkpoint request (`b-round-362/root-request-arch-checkpoint.md`) stays open and non-blocking. PERF-10 closes at the C PASS of round 364.
- Nothing is ready for a commit this round (gate 363 skipped).

Archive: `tasks/round-363.md`. Backups: `b-round-363/backlog-before-364.json`, `feature-status-before-364.md`, `b-next-before-364.json`.
