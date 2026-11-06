# Sketch review — PERF-10b-i (B round 360 → 361)

Dispatched sketch: `b-round-360/sketch.patch.txt`, sha256 `692c6467bb9f40b7e43cdb1c9fc1bdeffab4369a4d7ebd560fd16db5346b970b` (`sketch-dispatched.sha256`). It is `apply-sketch.py` + `ss-rows.py` applied to `git archive 93ea6c1`, 9 files under `app/`.

Both consults read the HEAD files only (asked before the sketch existed, with the exact design question). Their answers are quoted by id; B's ruling follows each.

## tech-lead (TL-R361-*)
| Id | Point | Ruling |
|---|---|---|
| TL-R361-1 | Put `activeTrackId` in the existing selection store with its own equality guard; seed it from the first audio track in the lazy `useState`; drop `latestRef.activeTrackId`; `getState()` at the three reads | Adopted. Sketch does exactly this. Guard proven by SS9 / MU-3 |
| TL-R361-2 | Remove `workspace.activeTrackId` from `StudioWorkspace`; `containsActive` moves into `ArrangementGroupHeaderWithSelectionInner` with a boolean selector; descendant ids from a `useMemo` map (never inline) | Adopted (`trackGroupActiveCandidates` map, `NO_ACTIVE_CANDIDATE_TRACK_IDS`). UC7 / MU-6 guard the ring |
| TL-R361-3 | Lane is not `memo`; "only two lanes" depends on TL-2 and on the field leaving both `useMemo` dep lists; `ArrangementLibraryPreview` needs its own selector; update the probe helper | Adopted. MU-1 (workspace subscribes at its top) is the perf mutant for this |
| TL-R361-4 (Medium) | (a) library drop sets active then selection: one commit, right lane; (b) paste and edge navigation read the live value in the same tick; (c) undo/redo does not reconcile the active track and a deleted track can leave it dangling — keep unchanged, log as debt; (d) first audio track; (e) perf ~15 + 2 lanes + preview + headers, ring must still update | (a) covered by UC7 (Enter add lands on `sfx`) and the existing drop tests in the full suite; the single-commit half is not a new row (React 18 batches both setters in one event; the store write commits with the selection write) — ruled info. (b) SS11 / MU-5 (paste). Edge navigation reads `getState()` in the sketch (K7 `workspace-reads 0`). (c) recorded as `TL-R361-ACTIVE-TRACK-DANGLING`, an info signal for STEM-LANES: B found no track-removal path at `93ea6c1` (grep `removeTrack|deleteTrack` = 0), so it is a hypothesis, not a bug; behaviour unchanged. (d) SS10 / MU-4. (e) PERF row + UC7 |

## performance-optimizer (PO-R361-*)
| Id | Point | Ruling |
|---|---|---|
| PO-R361-1 | Expect ~20–35 components; `<=` at the measured value with no headroom is safe once 3 equal samples at 1× and 6× | Adopted: the budget is the sketch's measured median, only if 1× and 6× samples are all equal (`perf-summary.txt`) |
| PO-R361-2 | The 0-component second commit is unexplained; record the new value before choosing `==` | Adopted as an upper bound: 2 ×3 at both rates on the sketch, so the row is asserted `<= 2` (not `==`, because the 0-component second commit is unexplained). Its red-proof is MU-7 (a delayed status write per active-track change) |
| PO-R361-3 | Red mutant: workspace subscribes at its top. Green mutant: group-header leaf always false (no collapsed group in the harness) | MU-1 is the perf mutant. MU-6 is the green one for perf; it is red in jsdom (UC7), so the path is covered there |
| PO-R361-4 | `latestRef`/workspace reads must use `getState()`; re-check `load`, `select.same-lane` (15) and `reclick` (0) | Adopted: `perf-summary.txt` compares every deterministic row with C360 and lists every changed row |

No Medium+ is left unruled.

## B checks on the sketch
- typecheck rc 0 (`sketch-typecheck.log`); `biome lint ./app` 205 warnings (= HEAD) (`sketch-lint.log`); `biome check` on the 9 files clean.
- Full suite before SS rows: 248 files, 3639 tests, rc 0 (`precheck-full.log`).
- `selection-store.test.tsx` with SS8–SS11: 11/11 (`ss-sketch.log`).
- Mutants (each its own copy of the sketch; diffs in `mutants/`):
  - MU-2 (state mirror in the context value deps) → SS8 red only (`mutant-MU-2.log`).
  - MU-3 (no store guard) → SS9 red only (`mutant-MU-3.log`).
  - MU-4 (first track of any kind) → SS10 red only (`mutant-MU-4.log`).
  - MU-5 (paste reads a render-time snapshot) → SS11 red only (`mutant-MU-5.log`).
  - MU-6 (group leaf never active) → UC7 red only (`mutant-MU-6.log`).
  - MU-1 (workspace subscribes at its top) → perf, see `perf-summary.txt`.
  - MU-7 (provider schedules a status write 100 ms after each active-track change) → perf, for the `click.commits` bound (`checkpoint.md` holds the prediction).
- Added after the advisor review: perf-lib 40/40 on the final sketch (`sketch-perf-lib.log`); full suite on the final sketch (with SS8–SS11 and the budgets edit) 248 files, 3643 tests, rc 0 (`precheck-full-final.log`).
