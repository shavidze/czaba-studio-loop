# B: round 271 → 272 planning (2026-10-30, D-29z592…D-29z596)

**Decision: CONTINUE.** Round 272 = **SYS-6 STATUS-LIFETIME, stage 1** (the transport class).
- **Task:** `current-task.md`.
- **Grants:** `b-round-271-r272-grants.txt`.
- **Baseline:** HEAD `66b570a` (`gates/gate-round-271.json` = published), clean tree.

## 1. Inputs read
- The first 200 lines of `context/active-summary.md` and all of `lessons.md` (59 lines). Specific ids were grepped in `backlog.json` and `feature-status.md`.
- `current-task.md` (round 271). It was archived as **`tasks/round-271.md`**. That archive did not exist before, so nothing was overwritten, and `cmp` shows it is identical.
- `a-round-271.md`, `c-round-271.md`, `c-round-271.json` and `b-round-270.md`.
- `gates/gate-round-271.json` and `gates/round-271/review.md` (score 9/10, COMMIT OK).
- `regression-last.json`: date 2026-10-30, round 258. The next regression is due on or after 2026-11-02, so it is **not due** now.
- **Advisor:** available, and consulted twice: before the design and at the final review. All of its points were followed:
  - scope stage 1 to the 3-bug transport cluster;
  - read `stopPlayback` first;
  - extract a pure resolver;
  - replace the exact-string matches with a template predicate;
  - push C-R271-01 and GATE270-S2 to stage 2;
  - tag the setStatus counts;
  - check L52;
  - close F1/R49-T and the feature;
  - record GATE271-S1 as Medium `awaiting_user`;
  - write a checkpoint addendum;
  - re-check the regression date at every planning.

## 2. Round 271 result (D-29z592)
- **C PASS:** 19 rows on both viewports, `browserVerified` and `realVerified` true, 0 round bugs. C's extra EXPORT-SHIFT check was bit-identical.
- **Gate 271:** published `66b570a` on both remotes.
- **Closed** on that independent evidence:
  - **F1-ABSOLUTE-SNAP**, by RS-B-JITTER in the browser on both viewports plus RS1;
  - **R49-T part (1)**. Parts (2) and (3) stay manual;
  - **SABA-B-11c**;
  - **SABA-B-9-10-11-TRANSPORT-GRID**. Every stage has a C PASS and a publication: 11a, 11a-FIX-1/2/3, 11b, 10a, 10b, 9, and 11c stages 1 and 2.
- **L28 grep:** `grep -rn 'In Progress (stage' docs/implementation` returns 1 hit, doc 176. It belongs to the open item PERF-HARNESS-SHARED-LIB-b-ii, so nothing is stale.
- **Browser-verified rows:** every row was browser-verified, so no browser half is pending.

## 3. Gate-271 and C/A notes (D-29z593)
**Finding 1 (Medium: Snap cannot put a clip back on the grid)**
- Recorded as **GATE271-S1-NO-REALIGN**, Medium, `awaiting_user`, and tied to SABA-Q-11C-REALIGN.
- The reviewer's two options are now in `user-review/questions-11c-stage2.md`, as (a) "0 as a magnetic edge" and the new (d) "Alt with Snap on = absolute". The file is in Georgian.
- It is **not a bug of round 271:** Saba's option (a) contract states this behaviour.
- It is not scheduled until Saba answers.

**Finding 2 and the Architecture note**
- Recorded as signal **GATE271-ARCH-RESOLVE-MOVE-SNAP** (keep; one `resolveMoveSnap` after Saba's answer).

**Moved to `deferred_low_polish`**
- GATE271-S3-SUBMS-OFFSET-ROW
- GATE271-SUGG-LEFT-BLOCKED-GROUP
- INFO-C271-MUTANT-NO-INNER
- A-R271-REVIEW-HS2-TITLE
- C-R271-01-NUDGE-STALE-STATUS (Low, pre-existing). It is also **scheduled in SYS-6 stage 2**.

The first four are test-only.

**Retro candidate**
- INFO-C271-VITE-CACHE becomes RC-R271-SCRATCH-NODE-MODULES. The problem: scratch copies that symlink `node_modules` let Vite write into `store/node_modules/.vite`. B's own scratch this round used a private `node_modules` with one symlink per entry.

## 4. Round 272 plan (D-29z594)
**Why SYS-6 now:** it is the next item in the dependency order, after the SABA-B-9/10/11 queue (D-29z520, D-29z591).

**One root cause** behind B-R253-STALE-PLAYING-STATUS-RESIDUAL, C-R253-01 and C-R254-OBS-01:
- the status texts that name the insert marker are never rewritten when the marker moves;
- the stop text ignores the Space predicate.

The fix is 3 related Lows and one owner pair, which fits the round-size rule.

**B's own repro at HEAD `66b570a`** (Chromium, both viewports, 0 page errors; `b-round-271/probe-stale-status-head*.json`):
- **past the end:** after Stop the text says "plays from 00:17.000", but Space is refused;
- **at the end:** the text says "plays from 00:16.000", but Space plays from 0;
- **Ctrl+←/→ while playing:** the text keeps saying "Insert marker at 00:04.000 — playback continues", both while playing and after Stop;
- **new sibling, found by B:** Ctrl+→ while stopped leaves "Stopped — … at 00:04.000".

**The contract:**
- **Pure module `playback-start.ts`:**
  - `resolvePlaybackStart` is HEAD's predicate, extracted without change;
  - `resolveSpaceStartPoint`;
  - `insertMarkerStatusKind`, which matches by re-rendering the template.
- **`describeSpaceStart`** on the context.
- **Rule W** in `writeInsertMarker`, the single marker write point.
- **Rule S** at Stop.
- **Two strings.** The longest is 82 characters, shorter than the existing 97- and 118-character texts.
- **Where Space plays does not change.**

**Rejected options:**
- *Make Space play past the end:* a behaviour change nobody asked for.
- *A status-kind tag in the reducer:* it would touch 181 writers.
- *Leave the stopped sibling for later:* same code, same root cause.

**Pre-check (L23), all files in `b-round-271/`:**
- **Sketch:** `sketch.diff`, applied on a `git archive` scratch.
  - `tsc` rc 0, and Biome is clean.
  - Full vitest on the first sketch: **3252/3253**.
  - Full vitest on the final sketch, which adds the `playPastEnd` kind and moves the classifier into lib: **3252/3253**.
  - Both runs have the same single failure, ST12 (formatter samples), which the granted additions fix. Files: `precheck-vitest.json`, `precheck-vitest-2.json`.
  - Slowest covering tests: BR2 at 1058 ms and IM7 at 674 ms, against a 15 s timeout.
- **Browser** (`probe-stale-status-sketch.json`): the sketch on :5186 against HEAD on :5173, both viewports, 0 page errors. All 5 cases now show text that matches what Space does. The scratch server has been stopped, and `store/` is untouched (`git status` is empty).
- **Not pre-run:** the §7 mutants, because their rows do not exist yet. A red-proofs them, and C re-runs them.

**Signal:** B-R272-PLAYFROM-END-ASYMMETRY. The top-strip `playFrom` at the end is refused, while Space at the end plays from 0. This is pre-existing and not changed.

**Consults:**
- Not needed: this is a bug-fix round with no new user-visible feature, so neither the reference-first section nor `product-designer` applies.
- Only the advisor was used.

## 4a. Corrections after the advisor's final review
- **`sketch.diff`:** re-exported from the final scratch, so it now matches the §3 contract. The first sketch is kept as `sketch-1.diff`, and the task says which one was probed in the browser.
- **K14:** the expected result corrected to the real 6 files under `app`.
- **K16:** added. `setTimeRange` writes no status, which LT8 relies on.
- **LT4:** a fallback added. No jsdom row drives a natural end, so the browser path becomes B-RESIDUAL-END.
- **B-PASTEND-HOME:** a new C row. LT6 had no B browser evidence.
- **K12:** C copies the probe script into `c-round-272/` before running it.
- **New Low B-R272-STOPPED-TEXT-WHILE-PLAYING.** A stopped text stays on screen after Space starts playback. It is pre-existing, and B's head probe shows it. Ruled out of stage 1 in §3.7 and scheduled in SYS-6 stage 2.

## 5. Order, checkpoint and lessons (D-29z595, D-29z596)
**Order:**
1. Round 272: SYS-6 stage 1.
2. Round 273: SYS-6 stage 2. It covers C-R271-01, B-R272-STOPPED-TEXT-WHILE-PLAYING, GATE270-S2 (after probing its premise: the live span is keyed by `statusSequence`), the INFO-C248 carry, and doc 203 → Completed.
3. SYS-5.
4. STUDIO-PERFORMANCE.

REGRESSION goes first on or after 2026-11-02. B re-checks this at every planning, because rounds 269–271 all landed today. RETRO is at round 275.

**Checkpoint:** the feature boundary SABA-B-9-10-11 has closed, so B wrote the bounded addendum `b-round-271-checkpoint-addendum.md` for root. It is non-blocking and lists five signals. Round 272 implements ARCH-CHECKPOINT-TRANSPORT-POSITIONS addendum 5 (the exported resolver).

**Lessons:** no Saba-found issue this round, so `lessons.md` is unchanged at 59 lines.

## 6. Not COMPLETE, not BLOCKED
**Not COMPLETE.** Still to do:
- SYS-6 (2 stages) and SYS-5;
- STUDIO-PERFORMANCE and SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2 entries. PHASE2-VIDEO-SCORING stays gated on the user's go-ahead;
- deferred Lows: 461 now, after +6 this planning. All must be fixed and C-verified before final acceptance;
- the open Medium GATE271-S1, which is `awaiting_user`.

**Not BLOCKED.** Nothing external is missing. The Saba questions do not block round 272.

**Ready for commit:** nothing new. Round 271 is already published (`66b570a`). Root publishes round 272 after a C PASS and the gate.

## 7. Artifacts
**`b-round-271/`:**
- probe: `probe-stale-status.cjs`, with `probe-stale-status-{head,head-stoppedmove,sketch}.json` and `shots/`;
- pre-check: `sketch.diff` (final) and `sketch-1.diff`, `precheck-vitest{,-2}.{json,log}`, `scratch-server.log`;
- pre-edit copies: `backlog.before.json`, `feature-status-before.md`, `b-next-before.json`, `lessons-before.md`, `questions-11c-stage2-before.md`.

**Updated:**
- `backlog.json` (version 236);
- `feature-status.md`;
- `current-task.md`;
- `b-next.json`;
- `tasks/round-271.md` (the archive);
- `user-review/questions-11c-stage2.md` (one appended section);
- new: `b-round-271-r272-grants.txt` and `b-round-271-checkpoint-addendum.md`.
