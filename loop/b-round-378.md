# B round 378 → 379 planning (2026-11-07)

**Decision: CONTINUE.** Round 379 = PERF-11c-iii-c2b, the marker row leaf (`current-task.md`). D-29z1258…D-29z1261, backlog v345.

## 1. Round 378 result (D-29z1258)
- **C round 378: PASS** (`c-round-378.json`).
  - 12 rows passed, among them LEAF-PROBE, LOOP-BROWSER, G378-AUTH and STUDIO-SMOKE-378 at both viewports.
  - `browserVerified` and `realVerified` are true, and C found 0 bugs.
  - B ran the L57 checker on C's JSON: OK (`b-round-378/l57-check-c378.txt`). The one null field is `chainHeadGateRunGreen`, with a reason.
- **Gate 378:** published `3ae2885` on both remotes (`gates/gate-round-378.json`). This commit is the round-379 baseline, and the store tree is clean. `context/head-sha.txt` (`79ed8a9`) and the gate's `head` field were taken before the gate, so they are stale.
- **Done:** PERF-11c-iii-c2a. In the browser, the brace's renders went from 1 to 0 on lane mute, Ctrl+Z and preview start, and from 2 to 0 on preview stop.
- **Archive:** `tasks/round-378.md` is a byte copy of the dispatched task (sha256 `77a2c03c…`). Nothing was deleted.

## 2. Gate review and C notes (D-29z1259; status text corrected in D-29z1260)
- **Gate 378 review:** COMMIT OK, Lows and info only.
  - **Finding 1** is GATE375-L1-UNUSED-WRAPPERS, which is already deferred. The LoopBrace wrapper is now added to it. It is not filed twice (L7).
  - **Finding 2** → GATE378-L2-LOOP-IMMUTABILITY-PIN, a deferred Low. B first wrote that RB-LEAF6 would close it. That was wrong: an identity pin does not catch an in-place mutation, because the mutation keeps the identity. The status is corrected in D-29z1260, and the item stays deferred.
  - **Finding 3** → INFO-GATE378-I3-ACTIONS-TRANSITIVE.
- **Architecture note:** → SIG-R378-LEAF-ACTIONS-CONVENTION, the sixth echo. It is not scheduled.
- **C notes:** → INFO-C378-PERF-MEDIAN and INFO-C378-LANE-RANGE-1280.
- **Open Critical/High:** none.
- **Open Mediums:** all manual, root or awaiting_user (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1). None of them blocks round 379.

## 3. Round 379 = PERF-11c-iii-c2b (D-29z1260)
- **Why now and not REGRESSION:** `regression-last.json` is 2026-11-05 and today is 2026-11-07, which is 2 days. The rule needs 3, so REGRESSION is not due. Round 377's "c2b after REGRESSION" was a timing guess, not a rule.
- **Orientation checks, all OK, before deciding on a sketch (advisor):**
  - `arrangementMarkers` keeps the markers' identity.
  - `useArrangementIsPlayingReader` and `useArrangementRangeStore` do not subscribe.
  - MarkerRow's only consumer is StudioWorkspace, so it needs no wrapper.
  - The render log in the tests sees only plain function fibers, so the view uses a `handleRef` prop instead of `forwardRef`.
- **Sketch v2** (`b-round-378/sketch.patch.txt`, sha `eaa1b3fd…`), 3 files:
  - the memo view, the actions hook (11 callbacks) and `handleRef`;
  - the pending-focus clear in `focusEditorSuccessor`;
  - row RB-LEAF6.
- **Pre-check:**
  - tsc and Biome rc 0. The full suite passes on both v1 and v2: 252 files, 3,725 tests.
  - **Mutants:** NO-MEMO, ACTIONS-FRESH and MARKERS-FRESH are each red only on RB-LEAF6, at l.981. HEAD-REVERT is red at l.966; it is a name guard.
  - **Marker browser recipe** (18 steps, focus included): the sketch equals HEAD at both viewports.
  - **Leaf probe:** only the MarkerRow cells differ, plus one preview cell that counts by wallclock (ruled a record).
  - **Perf spec** (production build, alone, on v1): 0 FAIL, and the count rows are unchanged except the known record median.
- **Review (L58):**
  - `tech-lead` approved v1 with 2 Lows (TL-R379-L1, -L2). Both are fixed in v2.
  - The delta re-review of v2 is APPROVE. Its optional Low D1 is ruled "not applied" (INFO-TL-R379-D1). See `sketch-review.md`.
- **L50:** 12 focus-origin hits, each ruled in the task (§4), with the line map in `b-round-378/l50-focus-origins.txt`.
- **Claims:** `b-round-378/claims-379.sh`, K1–K23, 0 MISSING. The HEAD output, the sketch output and their diff are saved.
- **Cleanup:** the scratch tree was removed after its outputs were saved; the patch and `scripts/` reproduce it.

## 4. Order, checkpoint, RETRO (D-29z1261)
- **Order:** REGRESSION-2026-11-08 at the next planning on or after 2026-11-08, then d/e (these wait for the checkpoint or RETRO 384), then PERF-11b, PERF-12…15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and the phase-2 entries under the skip rule.
- **Bounded request to root, restated:** run the read-only `frontend-architect` checkpoint ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`) before PERF-11c-iii-d.
  - It now has seven echoes. The newest, SIG-R379-ACTIONS-CONTEXT from `tech-lead`, argues for the request's option B: one stable actions context instead of per-leaf hooks.
  - With c2b, all the small leaves follow pattern A. VideoDock and Lane do not start before the answer, or before RETRO 384 (the L46 deadline).
- **RETRO** is due at about round 384.
- **Lessons:** `lessons.md` is unchanged at 60 lines. No Saba-reported issue arose.

## 5. Ready for the gate after C PASS
Round 379's 3 code/test files and doc 245 (`b-round-378/grants-379.txt`). Nothing else in the store tree changes.

## Consults
- **Advisor:** available. Consulted after orientation, which led to the c2b-now decision, the orientation checks before the sketch and the L47/L50 rows, and again before declaring done.
- **Project agents:** `tech-lead` reviewed v1 (APPROVE, 2 Lows fixed) and gave a delta review of v2 (APPROVE).
- **Not consulted:** `product-designer`, `performance-optimizer` and `ableton-arrangement-expert`. This is an invisible performance refactor, and the perf harness and leaf probe measured it directly.
