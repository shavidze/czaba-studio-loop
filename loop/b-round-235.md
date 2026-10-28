# B — Round 235 → 236 planning (2026-10-28)

**Decision: CONTINUE.** Round 236 is **SABA-B-11a-FIX-1**. It fixes three bugs in the scrub strip's play-from path:
- **GATE235-S1** (Medium): a strip double-click plays and also runs Fit;
- **A-R235-REVIEW-M1** (Medium, latent): the play decision reads the render-time `isPlaying`;
- **C-R235-01** (Low): a click that snaps to the project end plays from 0.

The task is in `current-task.md`. The round-235 task is archived at `tasks/round-235.md`; it is a new copy, and nothing was overwritten. Decisions: D-29z333…D-29z338. I consulted the advisor before writing.

## 1. Round 235 result (evidence)
| Source | Result |
|---|---|
| `c-round-235.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 19 rows passed, 0 blocked. Gate rows not claimed. Two Lows: C-R235-01 and C-R235-02. |
| `gates/gate-round-235.json` | `published`, commit `49b4c74f193555dd0fee57036060623cfe0aae5a` on both remotes. **This is the round-236 baseline.** |
| `gates/round-235/review.md` | 8.5/10. No Critical. Finding 1 is Medium (strip double-click); Lows 2–3; one cosmetic suggestion; one Architecture note. |
| `a-round-235.md` | No STOP. The reviewer's Medium A-R235-REVIEW-M1 needs a B ruling. The Architecture notes are below. |
| `store/` at planning | HEAD `49b4c74`, empty status (`b-round-235/git-status-at-planning.txt`). |

**Backlog:** v220 → v221 (script `b-round-235/update-backlog.py`). Before-copies of the backlog, task, b-next, feature-status and lessons are in `b-round-235/`.
- **D-29z333:** round 235 accepted, and **SABA-B-11a is done** (მზადაა). Both stages passed C in the browser: `c95b8a8` and `49b4c74`. FB-13, SRW-14 and SRW-15 stay **მოწმდება**; their Tech Lead manual checks are unchanged.
- The round-236 trio is ruled and scheduled (see §2).
- SABA-Q-SCRUB-DOUBLE-CLICK is sent to Saba once (L44).
- B-R236-END-WORDING goes to `deferred_low_polish`.
- **D-29z334:** the seed cluster (A-R234-REVIEW-M1, GATE234-S2, GATE234-S3) moves from round 236 to **round 237** as SABA-B-11a-FIX-2. Its deadline does not change: before SABA-B-11b.
  - **New evidence:** it *is* reachable in `/studio-lab`. In B's probe, the provider's plain-string "Demo collection ready" write landed after a fast seed and overwrote it (`b-round-235/probe/out-baseline-noreadywait.json`). The same write also overwrites a placement message (`seedrace-baseline.json`).
  - This is recorded as B-R235-READY-CLOBBER and merged into M1. Round 237 must fix the ready-side write. The old note "unreachable in /studio-lab" is superseded.
- **D-29z335:** C-R235-02 (Follow on ruler clicks, Live 6.2 verbatim) is scheduled **inside SABA-B-10a**, which redefines the ruler click as the Insert Marker. It is not deferred. Round 236 lists it as a temporary deviation.
- **D-29z336:**
  - lesson **L48** added (`lessons.md`, 58 lines): timing rows measure from the audio source start, or include the 50 ms lead, and status rows wait for "ready";
  - GATE235-S4-KEY-ORDER → `deferred_low_polish`;
  - GATE235-S2 (10 px target) is an accepted trade-off;
  - GATE235-S3 is a note.
- **D-29z337:** the gate-235 Architecture note becomes signal GATE235-ARCH-POINTER-UTIL (`watchUncapturedPointerGesture` is owned by `ArrangementClip.tsx`). It was added as an addendum to `b-round-234-checkpoint-request.md`, whose trigger is now met. It is not scheduled.
- **D-29z338:** no Saba answers have arrived. The regression and RETRO are not due.

**Ordering rationale (D-29z333).** Both clusters are Medium, and both must land before 11b.
- GATE235-S1 reproduces on every strip double-click (B probe, both viewports).
- The seed clobber needs a click within about 1–2 s of load.
- So the play-from cluster goes first. The advisor leaned the same way.
- Both clusters need `ArrangementContext.tsx`, and each round is capped at three items. So there are two rounds, not one.

## 2. Round 236 design
| Item | Ruling | Evidence |
|---|---|---|
| A-R235-REVIEW-M1 | Add a context `playFrom(time)` that reads `isPlayingRef`. While playing → `seekTo`. Stopped → the end rule, or `seekTo` + `togglePlayback` (every existing guard still applies). `playFromRuler` forwards to it with `[]` deps, so `barsRulerGestures` stays stable | BR14 red under MU-R on B's sketch |
| C-R235-01 | Stopped, at or past the end, no active loop → `stopLibraryPreview`, `seekTo(target)` and the existing `playPastEnd` status. Space at the end still plays from 0 | BR13 (red under MU-E); scratch browser run: `Play`, 16, exact status |
| GATE235-S1 | The bars ruler records whether the press began in the strip, and a strip double-click skips Fit. **Chromium sends `dblclick` to the capturing root** (B probe: `pointerdown` → strip, `pointerup`/`click`/`dblclick` → ruler), so `event.target` cannot decide the zone (MU-T). The lower zone keeps Fit | `b-round-235/probe/dbl-baseline.json`; BR12 |
| Reference | Live 6.1: a scrub click launches playback; a double-click zooms in the beat-time ruler. A scrub-area double-click and the behaviour at the very end are **not documented**, and both are recorded as such. Follow (6.2) is a listed deviation until 10a | current-task §3 |
| L23 | Sketch on `/tmp/b235-scratch`: `tsc` rc 0, Biome clean. **118 covering files, 1,692 tests, all green** (209 s). There are no red pins, so no extra test grant. The 3 mutants are red on their rows | `b-round-235/precheck-*`, `sketch.py` |
| L29 | Every recipe was run at HEAD (`:5173`) and on the scratch build (`:5174`) at both viewports, with 0 page errors. New rule: wait for `Demo collection ready` before seeding | `b-round-235/probe/` |
| L28/L34 | New doc 184 is `Completed (C round 236 PASS)`. Doc 183 changes only in its double-click bullet and mermaid branch; its l.4 stays. `grep -rn 'In Progress (stage' docs/implementation` finds only doc 176, which is tied to the open PERF-HARNESS-SHARED-LIB-b-ii | grant 5 |

**Scope check.** Nothing is shrunk or deferred without authority:
- C-R235-02 is scheduled into 10a with acceptance rows to come, not dropped;
- the purchase route and protected auth files are frozen;
- `/studio-lab` stays demo-only and anonymous (the Auth row);
- no new persistent text is added (C-BUDGET-236).

## 3. Ready for commit?
Round 235 is already published (`49b4c74`). Round 236 is dispatched, so nothing in `store/` is ready.

The loop state is ready for root's loop-state commit:
- `tasks/round-235.md` and `current-task.md`;
- backlog v221, `feature-status.md`, `b-next.json` and `lessons.md` (L48);
- the `b-round-235-r236-*` lists and hashes;
- `b-round-235/`, and the addendum in `b-round-234-checkpoint-request.md`.

## 4. For root and Saba
- **Saba**, new question: SABA-Q-SCRUB-DOUBLE-CLICK.
- **Saba**, still open: `user-review/AGREE-SABA-B-7.md`, SABA-Q-TEMPO-UNDO, and the five round-235 SABA-Q questions.
- **Root:** please run `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID, now with question 4 and an updated question 2) before SABA-B-11b. Its answer to question 2 shapes round 237. `b-round-231-checkpoint-request.md` is still ready.
- **Policy file:** `docs/technical/studio-real-workspace/agent-workflow.md` on disk has 87 lines and ends at "Loop v2". It does not contain the later sections quoted in this run's prompt snapshot (cloud runner, speed rules, SABA-B-9/10/11, and the rest). The prompt says "if that file now differs, the file wins", but the file is older, not newer. As earlier B rounds did, I followed the newer prompt snapshot. Please reconcile the file.
- **Regression:** not due. The last one was 2026-10-27 (round 199), and the next is due on or after 2026-10-30. A FIX-1 key-acceptance line was added to its `scope_additions`.

## 5. Method notes
- **Scratch:** `/tmp/b235-scratch` (`git archive HEAD`, `node_modules` symlinked), with a Vite server on `:5174`, now stopped.
  - The covering run and the browser probes did not overlap (L38).
  - The shared, untracked `node_modules/.vite` cache may have re-optimised; no tracked file changed.
- **`store/`:** never written. At the end, HEAD is `49b4c74`, the status is empty, and `sha256sum -c` on `b-round-235-r236-tree-sha256.txt` gives rc 0.
- **Advisor:** consulted before writing. I took these points:
  - two rounds, play-from first, with a D-ID for the re-order;
  - the context `playFrom`;
  - a strip-only Fit suppression as a recorded planner decision plus a Saba question;
  - re-checking the clobber path (which led to the reachability finding);
  - a full L23 pre-check.

  **Where I differed:** I scheduled C-R235-02 into 10a and did not build it now. Building it now would make a 4th item in a 3-item round, and 10a changes the same click.
