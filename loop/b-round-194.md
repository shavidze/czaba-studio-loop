# B — Round 194 → 195 planning (D-29z160)

Date: 2026-10-26 · Planner: B · Advisor: **available and used**. It was called once before writing, and its plan was followed: the R81 GuestForm fallback, the red proof on the round-194 tree, `ARCH-R194-TEST-WALKERS` as a signal, and the queue-entry check. The second call, before finishing, found three spec defects, all fixed:
  - ST8c case (iv), an arrow function before the class, is now a must-flag case.
  - Reviewer Lows #4–#6 are explicitly allowed in T1 and SCOPE-195, so the backlog note no longer contradicts the task.
  - `fieldscan2.mjs` now follows `const` initialisers of any form (array, `cn`, template), up to `;`. The re-run still gives exactly 14 hits, so R82's K0 promise is verified. No project subagent was consulted: this round is a token fix-up plus a test, with no product or architecture question.

## Inputs read (DATA)
- **Loop files:**
  - `context/active-summary.md`
  - `current-task.md`, the round-194 task, now `tasks/round-194.md` (`cmp` equal)
  - `a-round-194.md`: the K0 miss, code review 6/10 and the Architecture note
  - `c-round-194.md` and `c-round-194.json`
  - `gates/gate-round-194.json`: `skipped`, C taskStatus FAIL. It is not published, so HEAD stays `caa09af`.
  - `regression-last.json`: 2026-10-24, round 122
  - `loop/lessons.md`: still empty
  - `backlog.json`, targeted look-ups only
- **B's own checks at the round-194 tree:**
  - A's `end-sha256` is OK; `git status` shows 19 M + 2 ??.
  - **New scanner `b-round-194/tools/fieldscan2.mjs`.** It parses whole tags up to `>` at brace depth 0 and follows same-file string constants. It finds 14 hits, all in the 5 new source grants: GuestForm 53/77, and 12 fields through the `inputClass` constants in `SfxQuickEdit`, `SfxSceneBuilder`, `SfxSoundLibrary` and `SfxVideoSync`.
  - Cross-check: every non-excluded `.tsx` file that has a field and a bare `border-outline`. The rest have only radio or range inputs (`SfxSceneExport`, `RecordingCatalogRow`, `VideoShowcase`, `StemsPlayerModal`), or are already fixed (`ChatInput`).
  - Every `inputClass` consumer is an `<input>` or `<select>`.
  - The Studio (`components/arrangement`, `lib/arrangement`, `studio-lab.tsx`) imports neither GuestForm nor `recordings/`.
  - No test or e2e spec asserts these classes. The neighbour suites are `sfx-library`, `sfx-scene-route` and `sfx-video-transport`.

## Round 194 result (evidence-based)
- **C FAIL**, with `browserVerified=true` and `realVerified=true`.
- **Every granted site passed in the browser:**
  - PLACEHOLDER 5.10:1 at 3 viewports;
  - F1 3.12–3.13, F2 3.64 and F3–F6 3.70 at 3 viewports;
  - F7 3.50, F8 3.30 and F14 3.50 at 1440;
  - CONTRAST, KEEP, LAYOUT, STUDIO-RV (0 px), G194-3, SCOPE (21 lines), T-RUN (m10–m13) and PX-NET.
- **Failed:**
  - **C-R194-01 (Medium):** the `/support` GuestForm fields measure 1.21:1. HEAD was 1.62. This is a round-193 regression that had no grant.
  - **C-R194-02 (Medium, test):** ST8b false-passes a class at tag+14 and class constants.
- **Blocked by the backend:** F11–F13, F16 and `recordings/`. **Not reachable:** F9/F10 and F15.
- **Backlog effect:**
  - C-R193-01 → `c_verified_in_tree_unpublished`.
  - C-R193-02 → verified for F1–F8 and F14; its remainder is C-R194-01 and R80.
  - **Nothing becomes done.** STORE-2a stays **ბაგია**, uncommitted, and is published only with round 195.

## Decision: CONTINUE — Round 195 = STORE-2a fix-up 2 (2 Medium + 1 related ruling)
- **R78 extended:** GuestForm G1/G2 → `border-outline-strong`, in the non-error branch only.
- **R81 (advisor):** the field is `bg-elevated`, where F8 measured 3.30, so this is tight. `border-dim` is pre-authorised for both fields, so a tight read does not cost round 196.
- **R80:** `app/components/recordings/**` is store scope.
  - It is not in `global_forbidden_files` (`app/lib/sfx-*` is a different path), and it is not on the spec's Studio-owned list.
  - Its 4 `inputClass` constants get the same swap.
  - Rejected: excluding the folder (that hides the loop's own regression) and deferring it (the guard stays red).
  - Its browser rows are BLOCKED by the backend and are not passed. ST8 covers the source.
- **R82:** ST8b becomes a whole-tag scan that follows same-file constants (string, template, array and `cn`), plus the in-memory self-test ST8c. It is not widened to `-light`/`-hover`, which no one has measured; those stay as reviewer Lows.
- **Grants:** 7 (5 source files, the test and doc 158).
  - Frozen list: 1017.
  - Expected `git status`: **24 ` M` + 2 `??`**, computed from the grant list. The 5 newly modified files are named in SCOPE-195.
- **C rows:**
  - GUEST-BORDER: 3 viewports, 4 midpoints, keyboard focus and the error state.
  - FIELD-SPOT: F1 and F2.
  - RECORDINGS: BLOCKED.
  - CONTRAST, KEEP, LAYOUT, STUDIO-RV, G195-3 and SCOPE.
  - T-RUN with mutants m14–m18; m18 is a negative control on a non-field section.
  - AN-REVIEW and PX-NET.
- **Why not the regression round:** it is due at the first planning on or after 2026-10-27, and today is 2026-10-26. Round 194's §7 also orders the re-grant first.

## Other bookkeeping
- **Queue (policy "Three new queue entries", 2026-10-26).** `PHASE2B-SPOTTING`, `STUDIO-AGENT-COMMANDS` and `RECORDING-META-S1` were missing from `post_current_stage_queue`. They are now appended after `PHASE2-VIDEO-SCORING`, in that order. This is a copy only: the existing order is unchanged and none is started. They also appear as rows on the `feature-status.md` queue table.
- **Deferred Low:** `A-R194-REVIEW-LOWS` (reviewer Lows #3–#6 on test robustness) goes to `deferred_low_polish`. The round-195 task explicitly allows A to close #4–#6, as an optional item in T1 and SCOPE-195. #3 stays deferred.
- **Signals and retro inputs:**
  - `ARCH-R194-TEST-WALKERS` (A's reviewer Architecture note, verbatim in `a-round-194.md`) is a signal. It is decided with `ARCH-R193-THEME-REGION` at the STORE-2 exit and is not scheduled.
  - `B-R194-K0-SCAN-GAP` (retro_input): **the second STORE-2a round lost to B's pre-dispatch inventory.** Lesson candidate: an inventory scan parses whole tags and follows constants, and B tests its scanner on a known-shape mutant before granting.
  - `C-R194-INFO` (routed).
  - `R80-RECORDINGS-FIELD-BORDERS` (Medium, scheduled).
- **Regression entry:** expected round 196. Added scope: one GuestForm border spot check.
- **`regression-last.json`:** unchanged, because no regression round closed.

## Files written by B
- `tasks/round-194.md` (archive) and the snapshots `b-round-194-{backlog.json,feature-status.md,b-next.json,regression-last.json,current-task.md}-before`.
- `current-task.md` (round 195).
- Grant and baseline files:
  - `b-round-194-r195-grants.txt` (7);
  - `b-round-194-r195-new-files.txt` (empty);
  - `b-round-194-r195-tree-sha256.txt` (1017 entries, OK from the store root);
  - `b-round-194-r195-granted-start-sha256.txt` (OK);
  - the start copies in `b-round-194/r195-granted-start/`;
  - `b-round-194/git-status-at-planning.txt`.
- Tools:
  - `b-round-194/tools/fieldscan2.mjs`;
  - `b-round-194/tools/update-backlog.cjs`, which brought `backlog.json` to v180;
  - `b-round-194/tools/update-fs.cjs`, which updated `feature-status.md`.
- `b-next.json`: CONTINUE.

## Root notes
- **Baseline for round 195:** HEAD `caa09af` plus the uncommitted round-193/194 tree.
- **On C PASS:** publish rounds 193, 194 and 195 together, against `caa09af` (24 M + 2 new).
- **Vetoable for Saba:** R76, R77, R78 (now including GuestForm) and R80.
- **Still open:**
  - the `root.tsx` grant for STORE-2c/2d;
  - C-R188-I3;
  - `b-round-183-checkpoint-request.md` (fallback (c); next point: the STORE-REDESIGN exit). There is no new checkpoint request: this is a test-only structural signal, already parked for the STORE-2 exit.
- **RETRO** at round 200 or the STORE-REDESIGN exit. Inputs so far: `B-R192-PLANNING-GAP`, `STORE2A-BUTTON-REFLOW`, `B-R193-UNMEASURED-INFO`, `B-R194-K0-SCAN-GAP` and `GLOBAL-FOCUS-VISIBLE-UNLAYERED`. STORE-2a has cost 4 rounds (192–195).
- **Commit readiness:** none yet.
