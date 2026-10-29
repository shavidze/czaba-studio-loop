# B round 252 → 253 planning (2026-10-29)

**Decision: CONTINUE.** The next task is round 253, the SABA-B-10a stage 2b fix-up (`current-task.md`, decisions D-29z461…D-29z466). The previous task is archived unchanged as `tasks/round-252.md`.

## Inputs read
- **Context:** `context/active-summary.md`; `b-next.json` (round 251).
- **Round 252 reports:** `c-round-252.md` and `c-round-252.json` (FAIL; `browserVerified` and `realVerified` both true); `a-round-252.md` (no STOP; three rulings requested); `tasks/round-252.md`.
- **Root files:** `gates/gate-round-252.json`, status `skipped` with the reason "C taskStatus FAIL". Nothing was published, so the baseline stays at HEAD `83b7c75` (gate 251). `env-status.json` shows round 252, store 200.
- **Regression timing:** `regression-last.json` is dated 2026-10-27. Today is 2026-10-29, 2 days later, and a regression is due after 3 or more days. It is **not due**; it becomes due at the next planning on or after 2026-10-30.
- **Source, read only:** the Follow code in `StudioWorkspace.tsx` (l.1304–1309, 1408–1477, 1917–1928), `setInsertMarker`, the `tick` auto-stop and `getLocatorPosition` in `ArrangementContext.tsx`, and the Follow strings in `strings.ts`. B also grepped every test that pins the Follow and playing literals.

## Backlog updates (only from independent C evidence)
- **Nothing closes.** Every round-252 row except one passed in C's browser run, but the round itself is a FAIL and gate 252 skipped. These stay open, marked "carried to round 253", and close on a round-253 C PASS plus a published gate:
  - C-R235-02
  - B-R250-NAV-ORIGIN
  - B-R250-PLAYHEAD-TITLES
  - B-R251-PASTEND-AT-END
  - B-R236-END-WORDING
  - A-R251-REVIEW-IM22-PLAYING
- **New findings, dispatched in round 253:**
  - **C-R252-01** (Low): the stopped screen says "Follow paused".
  - **C-N252-FOLLOW-TITLE** (Low, L29): the paused-Follow copy.
  - **B-R253-STALE-PLAYING-STATUS** (Low, pre-existing at HEAD): "playback continues" stays after Stop. C's HEAD control showed it.
- **A-R252-REVIEW-PLAYING-SOURCE** (Low) goes to `deferred_low_polish`, which now has 414 entries. C could not reproduce it with real browser events, and fixing it needs the frozen context.
- **No feature is marked done.** SABA-B-10a stays "in progress". In `feature-status.md`, round 252 is marked **ბაგია** (bug) and round 253 **მუშავდება** (in progress).
- **REGRESSION-ROUND-2026-10-30 scope** gains C-FOLLOW-STOP-253, C-STOP-PLAIN/UNRELATED-253, C-TITLES-253 and the C-NAV-ORIGIN-253 playing half.

## Rulings
- **D-29z461 — C-R252-01 is fixed by option (a).** The row's plain reading is C's. The false "Follow paused" clause is new in round 252, and it sits on screen while the button shows `Follow`. Option (b), deferring it, would keep a false sentence that this stage created.
- **D-29z462 — what Stop does to the status.** When playback stops, a status equal to one of these three playing-only texts is replaced:
  - `insertMarkerWhilePlaying(m)`
  - `insertMarkerWhilePlayingFollowPaused(m)`
  - `followPaused`

  The replacement is the new `Stopped — Space plays from the insert marker at <t>.` Every other status is left as it is (L51).
  - **Where:** the `!isPlaying` branch of the existing effect in `StudioWorkspace.tsx`. There is no context change.
  - **Rejected:** writing `followResumed` on Stop, clearing the status, and replacing every status.
  - **Residual, recorded:** a playing text that names a time other than the current marker is left alone.
- **D-29z463 — copy:**
  - the paused Follow title becomes `Follow paused — press Follow, or stop playback, to resume`;
  - the navigation-pause status becomes `Follow paused by manual navigation. Press Follow, or stop playback, to resume it.`

  The scrub strip is not named, because a project without a BPM has no strip.
- **D-29z464 — the C-NAV-ORIGIN row is rewritten.** Its playing half now uses Home, Space and a fast double Ctrl+←. The playing "after the playhead" case at the project end is jsdom-only (IM24), because playback auto-stops at the end.
- **D-29z465 — architecture note recorded, not scheduled.** A's reviewer suggested a `useTimelineFollow` hook and judged "keep for now". It is recorded as addendum 4 to GATE249-ARCH-TRANSPORT-POSITIONS. B writes the ARCH-CHECKPOINT-TRANSPORT-POSITIONS request for root after round 253 passes, at the 10a/10b feature boundary; it is non-blocking. Two RETRO-260 candidates are recorded:
  - RC-R252-NEGATIVE-ROW: a negative acceptance row that could be read two ways;
  - RC-R252-PRECHECK-SCOPE: the round-252 L23 pre-check applied only the copy changes, not the behaviour.
- **D-29z466 — what comes next.** If round 253 passes, SABA-B-10a is done (rounds 249–253) and gate 253 publishes rounds 252 and 253 together. Then:
  1. REGRESSION, which is due at the next planning;
  2. SABA-B-10b;
  3. SABA-B-9;
  4. SABA-B-11c;
  5. SABA-B-7, once Saba answers.

## B's pre-check (L23)
- **Setup:** scratch `/tmp/b253-scratch`, with the full candidate behaviour and copy applied (`b-round-252/precheck-fix.diff`).
- **Type check:** `tsc` rc 0.
- **Tests (`app/lib/arrangement` and `app/components`):** 165 files, 2,408 tests. 4 failed, all in grant files: FW6, NS3b, ST12 and ST17. The frozen neighbours stayed green. Details are in `b-round-252/precheck-fails.txt`.

- **Contract proof (after the advisor's review):** FW6's paused half, amended on the scratch to the exact stopped text and `statusSequence` + 1, **passes**. This shows that `getLocatorPosition()` in the stop effect returns the insert marker. The scratch was then removed.
- **Advisor wording fixes, applied to the task:**
  - a §6 probe that observes the residual case;
  - the auto-stop case now starts with a strip click at ≥ 13 s;
  - one MutationObserver write and `statusSequence` + 1 are stated as the same fact.

## Baseline artefacts (not a clean tree)
- **HEAD and status:** `b-round-252/head-at-planning.txt` (`83b7c75`) and `b-round-252/git-status-at-planning.txt` (13 × `M`).
- **Grants:** `b-round-252-r253-grants.txt` (6 files), with start hashes in `b-round-252-r253-grants-start-sha256.txt` and copies in `b-round-252/r253-granted-start/`.
- **Carried files:** `b-round-252-r253-carried.txt` and `b-round-252-r253-carried-sha256.txt` (7 files, must stay byte-equal).
- **Frozen:** `b-round-252-r253-tree-sha256.txt` (1,097 files; rc 0 at planning).
- **Root files:** `b-round-252-r253-root-files*.txt` (rc 0).
- **Covering set:** `b-round-252/covering-253.txt` (130 files).
- **Snapshots taken before any edit:** `b-round-252/*-before-253.*` (backlog, b-next, feature-status, lessons, current-task).

## Scope guard
- **Protected auth and purchase files:** frozen, and `git diff --quiet HEAD` gives rc 0 on all 7.
- **No persistent UI is added**, so the screen budget is unchanged.
- **Scope:** no feature request was shrunk or deferred.
- **`/studio-lab`** stays the public demo-only workspace.
- **`lessons.md`** is unchanged at 58 lines. Lesson candidates go to RETRO 260, so the file stays within its 60-line limit.

## Advisor
Available, and consulted after orientation and before writing. Its advice was followed:
- the narrow form of ruling (a), with the exact text pinned by a positive row instead of a negative one;
- the plain case folded in;
- the `Follow paused` prefix kept for the frozen colour test;
- the non-clean baseline hash sets;
- doc 191 l.4 rewritten under L28's re-dispatch clause;
- a small C re-run scope;
- nothing closed from round 252.

## Ready for commit?
No. The round-252 work is unpublished and waits for the round-253 C PASS, after which the gate publishes rounds 252 and 253 together.
