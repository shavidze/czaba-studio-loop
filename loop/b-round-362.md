# B round 362 → 363 planning

Planned on 2026-11-06 by B. The advisor was available and was consulted after orientation, before the approach was fixed, and again before finishing.

## 1. Round 362 result (from evidence only)
- **C:** `c-round-362.json` has taskStatus PASS, browserVerified true and realVerified true.
  - PERF: 95/95 asserted, 0 NEW. Play start/stop went 28 → 11 ×3, and click 42 → 38 ×3, at 1× and 6×.
  - C's own mutant MU-C362 went red (29 > 11).
  - PLAY-STOP passed at both viewports, and so did VIDEO-FAIL-STOP-1 and G362-AUTH (demo opens anonymously; `/studio/middle-east` requires sign-in; studio-token 401).
  - The playing half of MARKER-NONE was not browser-verifiable, and the fake-bearer 403 was blocked because the backend is not available in the cloud. Neither is a FAIL of A's work.
- **Gate 362:** `gates/gate-round-362.json` is published, commit `9da8daa` on both remotes. The review scored 9/10 and blocks nothing.
- **Backlog (D-29z1178):**
  - PERF-10b-ii-a is done.
  - B-R356-PLAYBACK-SETTER and GATE361-L2 are closed.
- **Baseline for round 363:** HEAD `9da8daa`, clean tree. `regression-last.json` is unchanged (2026-11-05), so the next regression is due on or after 2026-11-08.

## 2. Rulings on round-362 findings (D-29z1179)
| Id | Ruling |
|---|---|
| A-R362-DOC-UC7-WORDING (Low) | Closed and accepted. The intent is met; C's DOCS row passed, with K14 uc7-existing = 1 |
| A-R362-DOC-STALE-MERMAID (Low) | Fixed in round 363. Doc 234 is granted, and K14 pins the old edges at 0 |
| A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT (Low) = gate finding 1 | `deferred_low_polish`, fixed in PERF-11, which owns the `ArrangementContext.tsx` selector work. A harness round does not edit it |
| GATE362-L2-PS4-REACH (info) | No action. Any task that touches the playback store keeps a `setPlaying(` caller sweep as a claims line |
| Gate 362 Architecture note (Transport leaves file) | Signal SIG-R362-TRANSPORT-LEAVES-FILE, recorded as question 1d of the refreshed root checkpoint request. Not a task |
| C-R362-MARKER-PLAYING-NONE-UNREACHABLE (Low) | A user cannot reach the forward playing none-text, because project end is a forward target (`markers.ts`). The backward none-text needs a position ≤ 0.5 ms while playing. It gets one best-effort C row in round 363 (MARKER-NONE-PLAYING-BACK), which does not count toward browserVerified. IM24 remains the guard. The finding stays open until C reports |

## 3. Next round: 363 = PERF-10b-ii-b (D-29z1180…D-29z1182)
- **C-R320-01, re-measured at HEAD.** B re-ran the four round-320 memo-removal mutants on 179 tests (`b-round-362/mutants-head/summary.txt`).
  - PeakPath is already guarded: DP43–DP48 were added in rounds 331–334.
  - DetailPlayhead, DetailWaveform and RangeReadout still survive removal.
  - B sketched RB-MEMO1–3 in `render-budget.test.tsx` (`b-round-362/sketch.patch.txt`): 13/13 pass, Biome is clean and typecheck is 0. Each mutant MU-P/MU-W/MU-R is red **only** on its own row (`b-round-362/mutants/summary.txt`).
  - The first RB-MEMO2 trigger B tried, a status write, failed its own positive control, because the detail content does not re-render on a status write. It was replaced with typing in the Start field. This is recorded in the task.
- **GATE320-S3, the premise ruling.**
  - At HEAD no drag sets `allTracks`. Only Ctrl+Shift+L does, with one write per key press, and SABA-B-11c keeps multi-lane selection out of scope.
  - The real gap is that the lane-background range drag is never timed. It gets 12 `record` rows: owner PERF-10b-ii-b, placed before the stopped lane drag, and reset by a click on the clip's name bar, so the Insert Marker does not move and no Undo entry is added.
  - A writes the scenario. Record rows are not L58 pins.
- **Doc 234 → Completed (C round 363 PASS).** PERF-10 closes with this stage.
- **Claims:** `b-round-362/claims-363.sh` with planning and sketch outputs. Every cited artifact exists (K10 = 0 missing).

## 3b. Corrections after the advisor review
- **The reset leaves the Insert Marker alone.** A name-bar click without movement neither seeks nor sets the Insert Marker. The clip's only `seekTo(` is in the range-body branch, and the file has no `setInsertMarker`. This is pinned as K18.
- **RB-MEMO1 is a listed deviation.** It writes `setTimeRange` directly, which is the same store write a range drag makes on each move.
- **PERF comparison.** No deterministic row may be higher than in C362 (the hard floor). Rows measured before the new step are INFO when they differ. Rows measured after it must equal C362.
- **Claims.** K18 is added, and the outputs were re-run. The doc 234 l.4 md5 is `0555f820`. The live row is left out of `assertsSpecified`.

## 4. Architecture checkpoint
PERF-10 closing is a feature boundary. The open root request is refreshed in `b-round-362/root-request-arch-checkpoint.md`, adding questions 1d (Transport leaves) and 1e (one store pattern before PERF-11). It does not block anything.

## 5. Order (D-29z1183)
1. REGRESSION, at any planning on or after 2026-11-08.
2. PERF-9.
3. PERF-11.
4. PERF-12…15, SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.

RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Completion check
The decision is CONTINUE, not COMPLETE. A great deal of scoped work is open (STUDIO-PERFORMANCE, STEM-LANES, STORE-2b…5, T12-ADVANCED, the phase-2 entries and `deferred_low_polish`), and several items have no browser evidence yet. Nothing external blocks round 363.

## 7. Files written by B
- `tasks/round-362.md` (archive copy) and `current-task.md` (round 363).
- `backlog.json` v326 (script `b-round-362/update-backlog.py`; backup `b-round-362/backlog-before-363.json`).
- `feature-status.md` (script `b-round-362/update-feature-status.py`; backup `b-round-362/feature-status-before-363.md`).
- `b-next.json` (backup `b-round-362/b-next-before-363.json`).
- Everything else is under `b-round-362/`: the sketch, the mutants, the claims and the root request.

B changed no app source. The scratch was outside `store/`, and `git status` on the store is clean.
