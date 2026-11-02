# B round 300 → 301 planning

**Date:** 2026-11-02. **Decisions:** D-29z774 to D-29z780. **Next task:** `current-task.md`, round 301, REGRESSION-ROUND-2026-11-02 (C-only browser sweep; A baseline only).

The round-300 task is archived as `tasks/round-300.md`. It was copied, not moved, and is `cmp`-equal to the original.

## 1. Evidence read
- **C round 300** (`c-round-300.json`, `c-round-300.md`): **PASS**, 19 rows passed, 0 failed, 0 blocked, `browserVerified` and `realVerified` true. Every browser row (B-MENU … B-JOURNEY, G300-AUTH) ran at 1440×900 and 1280×720. One Low (C-R300-01) and two info notes (INFO-02, INFO-03).
- **A round 300:** the 9 granted files are byte copies of B's sketches. No STOP. The reviewer reported REVIEW-1…4 (Low) and an architecture note (third copy of the menu shell).
- **Gate 300** (`gates/gate-round-300.json`): **published**, commit `aa7a6ef` on both remotes. The review (`gates/round-300/review-result.json`) said COMMIT OK, scored 8.5/10 and gave suggestions S1–S5, all Low.
- **Baseline for round 301:** HEAD `aa7a6ef` (the gate's `commit`; its `head` field `61c37d8` is pre-commit), clean tree. Frozen list: `b-round-300-r301-tree-sha256.txt` (1170 entries). Claims: `b-round-300/claims-301.sh` → `claims-301-output.txt`.
- **Other inputs:** there is no new Saba, root or user-review decision file. Every file in `user-review/` and the docs folder carries the job-restore time. `root-pre-push-review.md` and `publication-checkpoint.json` hold old content, with no open item for this round.
- **Schedule:** `regression-last.json` = 2026-10-30 (round 258). Today is 2026-11-02, so the regression is **due**. RETRO is at round 305.

## 2. Backlog updates (C and gate evidence only)
Script: `b-round-300/update-backlog.py`. The backlog version is now 260. Backups are `b-round-300/*-before-301.*`.
- **STUDIO-LINK-b → done, and STUDIO-LINK (a…b) → done** (D-29z774). `browserVerified` was true, so it is **მზადაა**.
- **Lows → `deferred_low_polish`** (D-29z775), 8 entries:
  - C-R300-01 (= A-R300-REVIEW-3, one entry);
  - A-R300-REVIEW-1 (= gate S1);
  - A-R300-REVIEW-2;
  - A-R300-REVIEW-4;
  - GATE300-S2-LINK-NATIVE-MENU;
  - GATE300-S3-LINK-DRAGGABLE;
  - GATE300-S4-AX-KEYSHORTCUTS;
  - GATE300-S5-UNUSED-REASON.

  None was reproduced as a failure, and none touches auth, purchase or data. Round 301 records S2 and S3 once as observations, so C's own evidence exists.
- **Info** (D-29z776):
  - INFO-02 (macOS Ctrl+click anchor, real window blur) → Tech Lead manual list TLM-R300-MAC-CTRLCLICK-BLUR.
  - INFO-03 → a process rule: auth rows name the parameterised `studio-token` request, and a bare GET returning 400 is recorded only. Round 301's G301-AUTH uses this wording.
- **Architecture signal** (D-29z777): B-R299-LIBRARY-MENU-DUPLICATION is now confirmed by 2 independent reviewers (A's code-reviewer and the gate-300 reviewer). It is not scheduled; it is input to §6.
- **Regression entry** (D-29z778): `REGRESSION-ROUND-2026-11-02` gets round 301, and its `scope_additions` gain one entry per item finished in rounds 259–300. It also gains the carried SA-28 and NO-SHIFT-203, the b-round-299 §9 candidate, and GATE300-S2/S3. **Template corrections** are in D-29z779.
- **`rounds`:** 300 → `c_pass_published`; 301 is added as dispatched.
- **`feature-status.md`:** round 300 **მზადაა**; round 301 **მოწმდება**.
- **`lessons.md`:** unchanged (59 lines). No new failure class appeared in round 300.
- **`regression-last.json`:** deliberately **not** updated now. It is updated at the 301 → 302 planning, and only once every row has run (§7 of the task).

## 3. Why round 301 is the REGRESSION round
- The speed rule: 3 days since the last sweep. No Critical, High or Medium finding with a cloud reproduction outranks it.
- **Template:** round 258 by reference (which itself references 199), plus a new §4c with one short row per item finished in rounds 259–300:
  - master in the footer;
  - L46 contracts;
  - background range;
  - the pre-planned hidden-grid background drag;
  - Alt/AltGr;
  - the envelope taper exports;
  - relative snap;
  - status lifetime;
  - disabled controls;
  - the PERF-2 worker with its export sha256;
  - PERF-3;
  - price;
  - names;
  - narrow;
  - LoAF;
  - STUDIO-LINK a…b;
  - a full L54 journey: product page → Studio → add → play → export → View in store.
- RETRO rounds and pure test-only rounds get no row, because they shipped no behaviour.
- **Template corrections** (D-29z779). Each is checked by a claim:
  - RV-EN loses the demo-name ledger, because the demo file now has 0 Georgian characters [K4].
  - Below 900 px the workspace is hidden [K5]. RP-NARROW therefore measures at 1024 and 900 only, and RG-22's 390 half becomes B-NARROW-LOAD.
  - Round 262's PLACE/STATES numbers replace round 257's layout tops.
  - The perf oracle is `c-round-285/perf/` [K7].
- **What C will check, and what counts as success:** see the task's §3–§6. The outcome table (§7) is fixed in advance.

## 4. Consults
- **Advisor:** available, consulted once before writing. It recommended:
  - the write order (archive, backlog, task);
  - using the gate's `commit` rather than its `head`;
  - the Low triage, including ids for the gate suggestions and record-only rows for S2/S3;
  - "2 reviewers" on the menu signal, and the checkpoint request now;
  - the INFO-03 auth wording;
  - the RV-EN, narrow, master-layout and perf-oracle corrections;
  - one row per item since 258;
  - checking for pre-planned `scope_additions` (two existed and are now named rows);
  - carrying the §9 candidate;
  - the mock-API note;
  - the fixed outcome table.

  B followed all of it.
- **Project subagents:** none consulted. A regression round adds no feature, so there is no reference-first or product-designer section (the workflow exempts it).

## 5. Order after 301 (D-29z780)
1. **Round 302:** NAME-AND-HINT, or a bounded fix-up first if C finds a Medium or worse.
2. PERF-3c and the rest of STUDIO-PERFORMANCE.
3. STEM-LANES.
4. SYS-1…3.
5. STORE-2b…5.
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. The phase-2 entries (skip rule).

SRW-21-PLAN stays parallel. RETRO is at round 305.

## 6. Frontend-architect checkpoint request (bounded, for root; non-blocking)
STUDIO-LINK is complete, so the feature boundary named in b-round-299 §6 has arrived. Root calls the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on `aa7a6ef`. For each input it gives one keep-or-extract answer, with its value, its risk, and at most three sentences:
1. **A-R298-ARCH-HYDRATE-HARNESS, together with ROOT-RECON-GRID-HARNESS:** one shared hydrate-route / workspace test harness. It would close A-R298-REVIEW-6 and A-R299-REVIEW-1…4.
2. **B-R299-LIBRARY-MENU-DUPLICATION** (2 reviewers): `ArrangementLibraryMenu`, `ArrangementMarkerMenu` and `ArrangementGridMenu` share the clamp and the outside, resize, blur, Esc and Tab dismissal. `ArrangementLibraryMenu` imports `armGridMenuDismissClickSwallow` from `ArrangementGridMenu`. The reviewers propose `studio-menu-dismiss.ts`, with each menu's item semantics unchanged.
3. **GATE296-ARCH-ROUTE-DOM-FOCUS:** the route's DOM query for option focus, compared with the library's `optionRefs`.

An approved extraction becomes a separate B task, with one owner and behaviour-preserving tests. It does not delay NAME-AND-HINT or PERF-3c.

## 7. Ready for commit?
- **Round 300:** already published as `aa7a6ef`. That completes STUDIO-LINK.
- **Round 301:** no source change is expected, so only the loop-state commit records the sweep.

## 8. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** these all remain:
  - the regression sweep itself and NAME-AND-HINT;
  - STUDIO-PERFORMANCE (PERF-3c…15), STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low (540 entries, some closed).

  SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing. The backend-only rows stay BLOCKED inside the round without stopping the loop.

## 9. Housekeeping
- **Store tree untouched:** at the end of planning, `git status` is empty and HEAD is `aa7a6ef`.
- **No servers started:** :5199 was down at planning [K11].
- **Artifacts in `b-round-300/`:**
  - `update-backlog.py`;
  - `claims-301.sh` and `claims-301-output.txt`;
  - the backups: `backlog-before-301.json`, `b-next-before-301.json`, `feature-status-before-301.md` and `lessons-before-301.md`.
