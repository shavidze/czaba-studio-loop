# B round 419 → 420 planning (2026-11-09)

**Decision:** CONTINUE. **Next:** round 420 = **RETRO 420** (window 416–419), D-29z1462…D-29z1466.
- **Advisor:** available and used after orientation. It shaped the two gates of this planning: the end-of-entry RETRO and the STEM-LANES AGREE step. A final check followed after the files were written.
- **Consults (real calls):**
  - `tech-lead`: RETRO review, counters, lessons, systemic task, STEM-LANES staging, GATE368-L3. Output in `b-round-419/consult-tech-lead.md`.
  - `product-designer`: screen and journey review, STEM-LANES framing. Output in `b-round-419/consult-product-designer.md`.
  - Not called: `qa-engineer`, `consequence-tester`, `design-philosopher`, `first-visit-host`. They are not in B's consult list (2026-11-04 §6).

## 1. Accepted from independent evidence
- **C round 419: PASS** (`c-round-419.json`).
  - 8 rows; `browserVerified`/`realVerified` true; 0 bugs.
  - The only BLOCKED row is the fake-bearer path (no backend in the cloud).
- **Gate 419: `published`** at `6609dfa` on both remotes. This is the round-420 baseline; HEAD = `6609dfa` and the tree is clean.
  - `context/head-sha.txt` still shows `3579fcc` because it was written before the gate; noted in the task.
- **SYS-R369-STEM-CACHE-WRITE-COORDINATOR is done (მზადაა)** (D-29z1462). Both copies (STUDIO-PERFORMANCE stage and `systemic_tasks`) are updated.
- **Closed:**
  - A-R368-REVIEW-L1, B-R367-TL3-1, A-R367-REVIEW-L-c/d/e/g, GATE368-L1, A-R368-REVIEW-L3 and TL-R419-L1 (12 entries across `open_findings` and `deferred_low_polish`);
  - R419-CR-2..5 (the doc fixes; C row 7).
- **R419-CR-1** goes to `deferred_low_polish` as A-R419-REVIEW-CR-1-SWEEP-CANCEL-CHECK.
- **The A-419 architecture note** becomes SIG-R419-STEM-CACHE-STORE-COORDINATOR-MODULE: a signal, not scheduled, counted once with ARCH-CHECKPOINT-PERF9-STEM-CACHE.
- **Archive:** `tasks/round-419.md` is a byte copy of the round-419 task (K15 `archive-equal`). Before-copies are in `b-round-419/*-before-420.*`.

## 2. Why round 420 is a RETRO and not STEM-LANES
- **End of STUDIO-PERFORMANCE** (D-29z1463). After 419 the entry has no stage the loop can run. What remains is parked, each item with deadline RETRO 435:
  - waiting for Saba: PERF-4b, 9c, 11b, 12b, 14c-ii/iii;
  - root: 9d and ROOT-REQ-*;
  - backend: 4c;
  - Tech Lead Firefox: 15b-ii-b;
  - PERF-DRAG-PREVIEW's move crossing, which is only the unscheduled candidate PERF-CAND-MASTER-GROUP-FADER-PROPS.
  - The stale PERF-13b sub-status was corrected.
  
  Saba's 2026-10-26 rule runs a RETRO "at the end of each queue entry … whichever first". `tech-lead` agrees, and notes that a 4-round window gives hypotheses, not rule changes.
- **STEM-LANES cannot be dispatched yet** (D-29z1464). Live has an equivalent feature, so the 2026-10-28 reference-first/YouTube rule requires an AGREE note before A builds. The STUDIO-LINK exemption (D-29z749) applied only because Live has no equivalent there.
- **Saba's Q2 rests on a false premise.** It says "the Stems group already exists". At `6609dfa`, "Stems" is one of four fixed tracks, and groups exist only via Ctrl+G (K23). Turning that track into a group is a model and position question for Saba (L43/L44), not a planner choice.
- **REGRESSION is not due today.** `regression-last.json` is 2026-11-07, so it is due on or after 2026-11-10; it will be due at the next planning.

## 3. RETRO 420 outputs (D-29z1465)
- **`retros/retro-420.md`** (Georgian):
  - 4 PASS, 0 FAIL, $63.35, 6 Low C bugs, 0 STOP.
  - Counters: the l58-check counter missed once (417; `tech-lead` corrected B's first input); B share 72.3 % missed.
  - **RC-R420-COST-COUNTER** replaces "B share ≤ 65 %" with "median round ≤ $17.00 and B median ≤ $14.50". This is a loop counter, not a project rule.
- **`lessons.md`:** l.3 pointer, and L7 gains the clause "a confirmation is not a new id" (`confirmedBy`). Still 60 lines; L58 untouched.
- **Systemic task SYS-R418-PREVIEW-LIFECYCLE:** closes 8 preview Lows of round 418 and excludes Q-PREVIEW-STOPS-TRANSPORT. Queued after REGRESSION, before STEM-LANES.
- **`user-review/screen-review-420.md`:**
  - Nothing is worse than at 416 (138/168/118/144 lines).
  - F2 still reproduces on the journey: stems at 00:00/16/32/48.
  - New: SR-420-1 (folder row signifier) and SR-420-2 (group header below the fold at 1280×720). Both are `awaiting_user`, tied to AGREE.
- **GATE368-L3 stays deferred.** `tech-lead`: the premise "STEM-LANES raises concurrent loads" is false, because mount already loads every source. STEM-LANES S1 records the measured count as a `record` row.

## 4. STEM-LANES preparation (D-29z1464)
- **`user-review/AGREE-STEM-LANES.md`** (Georgian, for Saba) contains:
  - the current behaviour, with evidence;
  - Live references (manual 6.1 item 12; Mixing → Group Tracks), with the unconfirmed points marked;
  - product-designer's options. O1 is recommended: the fixed "Stems" track becomes a group header on the first add. O2 and O3 are rejected, with reasons;
  - questions Q1–Q5, each with a default;
  - tech-lead's stages S1–S4.
- **`youtube-request.json`:** 6 queries for root.
- **LIVE-MEAS-STEM-DROP** is still unmeasured (K25). It does not block.
- **Acceptance candidates:** 12 rows in `consult-product-designer.md`, including an audio proof that the stems play together and an export file that is 16 s, not 64 s (L54/L55).
- **Tests that pin the four-lane model:** grep commands in `consult-tech-lead.md` item 5. These go into the S1 task.

## 5. Architecture checkpoint (feature boundary)
- **ARCH-CHECKPOINT-STEM-LANES is requested of root:** `b-round-419/root-request-arch-checkpoint-stem-lanes.md`.
  - It asks three questions: module vs context growth; group structure and saved sessions; rebuild cost and lane cap.
  - It absorbs ARCH-CHECKPOINT-PERF9-STEM-CACHE.
  - It is non-blocking, with an L46 default (tech-lead's new-module plan).

## 6. Schedule (D-29z1466)
1. 420 RETRO 420.
2. 421 REGRESSION-2026-11-10 if due at that planning (on or after 2026-11-10); else SYS-R418-PREVIEW-LIFECYCLE first and REGRESSION at the first planning on or after 2026-11-10.
   - **Note for the next B (L6):** the `regression_rounds` entry REGRESSION-2026-11-10 still has a `scope` that reads "rounds 391-401 …". Rewrite it to cover every item done through round 419 (PERF-14b-ii … SYS-R369), and carry its `scope_additions` as named rows.
3. SYS-R418-PREVIEW-LIFECYCLE.
4. STEM-LANES S1…S4 once Saba answers. Until then: SYS-1…3, then STORE-2b…5. STEM-LANES goes first as soon as the answer arrives.
5. REVIEW-RECOMMENDATIONS.
6. T12-ADVANCED.
7. Phase 2 (skip rule).

Next RETRO: round 435.

## 7. For root
- **Publish:** nothing is pending. Round 419 is already published at `6609dfa`. Round 420 changes no source; only the loop-state commit records the retro.
- **Requests:**
  - bring `user-review/AGREE-STEM-LANES.md` to Saba;
  - run the `youtube-request.json` search and the transcripts;
  - LIVE-MEAS-STEM-DROP;
  - ARCH-CHECKPOINT-STEM-LANES;
  - add `design-philosopher`, `flow-sage` and `first-visit-host` back to B's consult list for STEM-LANES (anticipated by 2026-11-04 §6).
- **Still open:** ROOT-REQ-PLAYWRIGHT-FIREFOX and ROOT-REQ-VITEST-PERF-INCLUDE.
- **Environment:** B started `mock-api/server.mjs` on :5199 (pid in `b-round-419/screens/mock.pid`) for the product-page journey. The :5173 dev server was only read, not restarted. Nothing was built inside `store/`.

## 8. Files written
- Loop state:
  - `current-task.md`, `tasks/round-419.md` (archive);
  - `backlog.json` (v396; `update-backlog.py` + part 2);
  - `feature-status.md`;
  - `lessons.md`;
  - `b-next.json`.
- Retro outputs: `retros/retro-420.md`, `user-review/screen-review-420.md`, `user-review/AGREE-STEM-LANES.md`, `youtube-request.json`.
- `b-round-419/`:
  - scripts, `data/`, `screens/`;
  - consult inputs and outputs;
  - root request;
  - `r420-tree-sha256.txt` (1,319 entries, rc 0);
  - `claims-420.sh` and its planning output (stderr 0 B);
  - `cited-artifacts.txt`;
  - before-copies;
  - `lessons-diff.txt`;
  - `.done` markers.
