# B — Round 237 → 238 planning (2026-10-29)

**Decision: CONTINUE.** Round 238 is **SABA-B-11a-FIX-3**, a fix-up of round 237 on the same code path:
- **C-R237-01** (= A-R237-REVIEW-M1, Medium, a regression round 237 caused): a gesture refusal on screen when loading settles is replaced on release by a stale `Loading the demo collection…`.
- **A-R237-REVIEW-L1** (Low, fixed now): a seed appended onto a showing refusal is not recognised as a refusal, so the release leaves the combined text.

The task is in `current-task.md`. The round-237 task is archived at `tasks/round-237.md` (a new copy; nothing overwritten). Decisions: D-29z346…D-29z351. The advisor was available; I consulted it after orientation and the scratch pre-check, before writing.

## 1. Round 237 result (evidence)
| Source | Result |
|---|---|
| `c-round-237.json` | taskStatus **FAIL**, `browserVerified` true, `realVerified` true. 15 rows passed. The only blocked row is the purchased-origin browser row (backend unavailable in cloud). Bug: C-R237-01 (Medium regression), reproduced at both viewports; the HEAD control ends on ready. |
| `gates/gate-round-237.json` | `skipped` (C FAIL). Nothing published; **HEAD stays `ecaf0e4`** (gate 236's commit). |
| `a-round-237.md` | STOP (L33) on A-R237-REVIEW-M1, with a candidate fix outside the grants and a TU12 scratch row. Reviewer L1 is of the same class. |
| `store/` at planning | HEAD `ecaf0e4`, 11 dirty paths = the round-237 work (`b-round-237/git-status-at-planning.txt`), hashed in `b-round-237-r238-start-sha256.txt`. |

**Backlog:** v222 → v223 (`b-round-237/update-backlog.py`). Before-copies of the backlog, b-next, feature-status and the checkpoint request are in `b-round-237/`.
- **Nothing closes (D-29z346).** The round-237 fixes (A-R234-REVIEW-M1, B-R235-READY-CLOBBER, GATE234-S2, GATE234-S3, C-R236-02) passed their C rows but sit in an unpublished, failed round. They close when round 238 passes and the gate publishes 237 + 238.
- New findings: C-R237-01, A-R237-REVIEW-L1; notes A-R237-REVIEW-L2-NOTE / L3-NOTE; signal A-R237-ARCH-STATUS-PARTS; retro candidate B-R237-REFUSAL-DURING-LOAD-GAP.
- `deferred_low_polish` is unchanged at 379 (no new Low is deferred).

## 2. Round 238 design
| Item | Ruling | Evidence |
|---|---|---|
| C-R237-01 | A's candidate (D-29z347): `settle` re-derives `lastNonRefusalStatusRef` with `settledCollectionStatus`, in the callback, not in the reducer updater. | On a scratch copy of the round-237 tree: TU12/TU13 red without it (MU-RF), green with it. C's refusal recipe on the scratch build gives the final ready text at both viewports (`b-round-237/probe/race-scratch.json`). |
| A-R237-REVIEW-L1 | **Fix now** (D-29z348): one refusal-prefix rule used by the layout effect and the release. The rest of the text is kept after the last non-refusal status. | B reproduced it at the API level: refusal, then `commitArrangement` of a stem-90 clip during a gesture, then release leaves `<refusal> <seed> <Snap on>`. The UI path is unproven, because lane-move commits write their own status first. The fix is the same release function, which the round already owns, at low cost. TU15 is red on MU-L1-REL and on MU-L1-EFF. |
| Start state | Not a clean tree: HEAD `ecaf0e4` plus exactly the 11 round-237 paths at their hashes. Anything else is a STOP. | `b-round-237-r238-start-sha256.txt` |
| Frozen | 1,098 files: the 1,090 HEAD files plus the 8 round-237 paths that are not re-granted. rc 0 at planning. | `b-round-237-r238-tree-sha256.txt` |
| Grants | `ArrangementContext.tsx` (the 3 hunks), `tempo-seed-ui.test.tsx` (append only, 0 removed lines), doc 185 (whole file, never published; l.4 → round 238). | `b-round-237-r238-grants.txt`; start copies are in `b-round-237/start-copies/` |
| L23 | `tsc` rc 0; Biome clean. **121 covering files, 1,719 tests green**, which includes the 31 test files that touch refusals or gestures. | `b-round-237/precheck-covering-final.log` |
| Reference | No reference found. This is CZABA's own status-writer contract; the round-237 search is reused. | task §3 |

**Scope check:**
- Nothing is shrunk or deferred without authority. Both bugs are fixed.
- Protected auth and purchase files are frozen.
- `/studio-lab` stays demo-only and anonymous (Auth row).
- No persistent text is added.
- The purchased-origin browser path is backend-blocked and listed as such, with unit coverage.

## 3. Root notes
- **Ready for commit?** No. The round-237 + 238 tree is publishable only after round 238 C PASS. The gate then publishes both rounds together.
- **Checkpoint:** `b-round-234-checkpoint-request.md` has addendum 3 (A-R237-ARCH-STATUS-PARTS, question 6). It is still non-blocking. Please run it before SABA-B-11b.
- **Regression:** due on or after 2026-10-30. The next planning will most likely be the REGRESSION round; FIX-3 is in its `scope_additions`.
- **Lessons:** this miss was not Saba-reported, so `lessons.md` is unchanged. It is recorded as a retro candidate for RETRO 245 instead.
- **Hygiene:**
  - B's scratch copy `/tmp/b237-scratch` and its dev server on `:5174` were outside the repo. The server was stopped after use.
  - No tracked file in `store/` changed.
  - B touched only loop-folder planning files.
