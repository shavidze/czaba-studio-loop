# B — Round 234 → 235 planning (2026-10-28)

**Decision: CONTINUE.** Round 235 is **SABA-B-11a stage 2**, the last stage of 11a. With a tempo, the bars ruler becomes interactive:
- its top strip starts playback from the clicked point;
- its lower zone sets the playhead;
- drag scrolls or zooms;
- double-click fits.

The task is in `current-task.md`. The round-234 task is archived at `tasks/round-234.md`; that is a new copy, and nothing was overwritten. Decisions: D-29z327…D-29z332. I consulted the advisor before writing.

## 1. Round 234 result (evidence)
| Source | Result |
|---|---|
| `c-round-234.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 18 rows passed, 0 blocked, 0 C bugs. Gate rows not claimed. |
| `gates/gate-round-234.json` | `published`, commit `c95b8a8966bfedef7c1d3793e23391be512a831e` on both remotes. **This is the round-235 baseline.** |
| `gates/round-234/review.md` | 8.5/10. No Critical. Seven suggestions and one Architecture note. |
| `store/` at planning | HEAD `c95b8a8`, empty status (`b-round-234/git-status-at-planning.txt`). |

**Backlog:** v219 → v220. Script: `b-round-234/update-backlog.py`. Before-copies of the backlog, task, b-next, feature-status and lessons are in `b-round-234/`.
- **D-29z327:** stage 1 is `c_pass_published`. SABA-B-11a itself stays **მუშავდება**, because stage 2 is still open. FB-13, SRW-14 and SRW-15 stay **მოწმდება**; none of them is მზადაა.
- **D-29z329, A-R234-REVIEW-M1 (Medium):** the seed status is lost when the provider's loading status lands after the seed.
  - It is a real Medium: A's reviewer found it and A confirmed it in TU8.
  - It cannot be reached in `/studio-lab` because that path does not exist there, not because the bug is absent. So it is **not** deferred and not a Tech Lead item.
  - It is scheduled as **round 236 SABA-B-11a-FIX**, together with GATE234-S2 (the seed search never closes) and GATE234-S3 (a stray space). All three are in the same seed code, and the fix needs an `ArrangementContext.tsx` grant.
  - Deadline: before SABA-B-11b and before SRW-21 resumes.
  - Stage 2 goes first because the policy forces only Critical, security and data-loss bugs ahead of a feature.
- **D-29z330:**
  - to `deferred_low_polish`: GATE234-S4 (one-frame flicker), GATE234-S6 (tempo-field input race), and A-R234-REVIEW-L2, L3 and L6;
  - GATE234-S5 (a long aria-live message) becomes the question SABA-Q-SEED-STATUS-LENGTH;
  - GATE234-S7 and INFO-C234-SECONDS-AFTER-SEED are recorded as notes;
  - C's C-BUDGET method substitution is accepted: a same-build no-BPM control isolates the seed.
- **D-29z331:** the gate-234 Architecture note is a signal (GATE234-ARCH-TEMPO-GRID). Because the risk has accumulated on one owner at a feature boundary, I requested **`b-round-234-checkpoint-request.md`** (ARCH-CHECKPOINT-TEMPO-GRID: a `useTempoGrid` hook, and the M1 fix path). It is non-blocking.

## 2. Round 235 design (D-29z328)
| Item | Ruling | Evidence |
|---|---|---|
| Reference | Manual 6.1 and 6.3, fetched in full on 2026-10-28. Confirmed: a scrub click "launches playback from that point", the jump is quantized by the Control Bar Quantization, hold loops, a beat-time drag scrolls/zooms, and a double-click zooms to the selection. **Not found:** the scrub area's height and placement relative to the beat-time ruler, what a plain beat-time click does, and the cursors. | WebFetch, two passes; `ableton-arrangement-expert` consult |
| Strip | The top 10 px of the 20 px bars row, following Saba's "top strip". The hit zone is the painted strip element. It has a hover tint only, a tooltip and a `?` sheet row, and no persistent text (L39). | §2.2, C-ZONES, C-BUDGET |
| Snap | The editing grid when Snap is on (Alt bypasses), the same as every CZABA ruler click. This deviates from Live's launch quantization and goes to SABA-Q-SCRUB-QUANTIZE. | §3 |
| Playing | A strip click jumps and keeps playing (`seekTo`, then `togglePlayback` only when stopped). The existing `nothingToPlay` and `playPastEnd` guards apply. | B scratch probe |
| Seconds ruler | **Unchanged.** The review's 11a acceptance 4 ("seconds ruler = scroll only") is not applied: with Saba decision 3 (no BPM → seconds grid) it would leave no-BPM projects with no ruler that positions. This goes to SABA-Q-TIME-RULER-ROLE (L43/L44). | the advisor's point; `transport-grid-review.md` §4.3 |
| Not built | Hold-to-loop and right-click → Add Locator. Neither is in Saba's request. Each went to Saba once as a question. | §3 |
| Structure | The ruler gesture is extracted into the new `useRulerNavigation` hook, so both rulers share one implementation with no copy. Seconds-ruler behaviour is pinned by the existing suites. | pre-check |
| L23 | Sketch on `/tmp/b234-scratch`: `tsc` rc 0, Biome clean. 107 covering files: 105 green. The 2 reds are the granted pins (ST17 key list, SC1 row order). BU7/BU8, GU4, triplet TU4, MU8d and the `rulerTitle` pin stay green. | `b-round-234/precheck-*` |
| L29 | Every recipe was run at HEAD (`:5173`, bars ruler inert) and on the scratch build (`:5174`), at both viewports, with 0 page errors: strip stopped/playing, lower-zone snap and Alt, drag +200 px, double-click Fit, past end, empty project, no tempo. | `b-round-234/probe/out-*/` |
| L28 | This is the final 11a stage, so doc 182 l.4 → `Completed (C round 235 PASS)` (grant 8). Doc 176 remains `In Progress (stage 1 of 2)`, tied to the open PERF-HARNESS-SHARED-LIB-b-ii. | `grep -rn 'In Progress (stage' docs/implementation` |

**Scope check.** Nothing is shrunk or deferred without authority:
- the Live behaviours not built (hold-to-loop, Add Locator) were never requested and went to Saba as questions;
- the seconds-ruler change is held because it conflicts with Saba decision 3, and is asked once;
- the purchase route and the protected auth files are frozen;
- `/studio-lab` stays demo-only and anonymous (the Auth row).

## 3. Ready for commit?
Round 234 is already published (`c95b8a8`). Round 235 is dispatched, so nothing in `store/` is ready yet.

The loop state is ready for root's loop-state commit:
- `tasks/round-234.md`, `current-task.md`;
- backlog v220, `feature-status.md`, `b-next.json`;
- `b-round-234-checkpoint-request.md`;
- the `b-round-234-r235-*` lists and hashes;
- `b-round-234/`.

`lessons.md` is unchanged (57 lines). This round produced no new lesson, and no Saba-reported issue needs a `Why we missed it` section.

## 4. For root and Saba
- **Saba**, new questions: SABA-Q-TIME-RULER-ROLE, SABA-Q-SCRUB-QUANTIZE, SABA-Q-SCRUB-HOLD-LOOP, SABA-Q-SCRUB-ADD-LOCATOR, SABA-Q-SEED-STATUS-LENGTH.
- **Saba**, still open: `user-review/AGREE-SABA-B-7.md` (no answer yet) and SABA-Q-TEMPO-UNDO.
- **Root:**
  - please run `b-round-234-checkpoint-request.md` before SABA-B-11b if you can. Question 2 there shapes round 236;
  - `b-round-231-checkpoint-request.md` is still ready;
  - the video transcripts for SABA-B-7 are still requested.
- **Regression:** not due. The last one was on 2026-10-27 (round 199), and the next is due on or after 2026-10-30. A stage-2 key-acceptance line was added to its `scope_additions`.

## 5. Method notes
- **Scratch:** `/tmp/b234-scratch` (`git archive HEAD`, `node_modules` symlinked) and a Vite dev server on `:5174`, now stopped.
  - That server re-optimized the shared, untracked `node_modules/.vite` cache once. No tracked file changed.
  - The covering run and the browser probes did not overlap (L38).
- **`store/`:** never written. At the end, HEAD is `c95b8a8`, the status is empty, and `sha256sum -c` on `b-round-234-r235-tree-sha256.txt` gives rc 0.
- **Advisor:** consulted before the plan. It recommended these, and I followed them:
  - keep the seconds ruler and send its role to Saba;
  - give M1 a concrete round and deadline;
  - fetch the rest of the manual page;
  - consult the expert on the strip.
- **Advisor, final review** (after the files were written). It found three gaps in the task text, and I fixed all three:
  - N1 moved to `app/hooks/useRulerNavigation.ts`, as `new-hook.md` says, next to the existing Studio hook `useRelativeFaderDrag`. It is not added to the barrel. Rechecked: `tsc` rc 0, 6 suites 83/83 (`precheck-after-move.log`).
  - The strip is now decided from the captured `pressTarget`, so §2.1 and §2.2 agree.
  - C-REF-235 now lists all five Saba questions.

  I also took its smaller points:
  - BR4b and the C-LOWER second half pin the existing seek-while-playing behaviour, which 10a will change;
  - the 'Better than Live' claim is softened;
  - the strip's WCAG 2.5.8 trade-off and its keyboard equivalent are recorded.

## 6. Next after round 235
- **C PASS and gate published:** SABA-B-11a is done. Round 236 is SABA-B-11a-FIX (M1, S2, S3), then SABA-B-11b, then 10a, 10b, 9 and 11c. If planning falls on or after 2026-10-30, the REGRESSION round comes first.
- **C FAIL:** a fix-up on the same grants.
- **If Saba answers the AGREE note:** SABA-B-7 is scheduled right after the running stage.
