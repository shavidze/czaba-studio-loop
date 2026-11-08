# B round 413 → 414 planning (2026-11-08)

**Decision:** CONTINUE. **Next:** round 414 = SYS-R2-FAKE-FIDELITY, a test-only round on the R2 worker tests (D-29z1437…D-29z1440).
- **Advisor:** used after orientation.
- **Consults:** `tech-lead` ×2. v1 was REJECTED with one Medium; v2 got APPROVE WITH LOWS.
- **Reference-first and `product-designer`:** N/A (test-only, no user-visible change).

## 1. Inputs, independently checked
- **C round 413: PASS** (`c-round-413.json`): 11 rows passed, `browserVerified` and `realVerified` true, 0 bugs, and 15/15 mutants RED on A's tree. BLOCKED only:
  - the fake-bearer row (backend unavailable in the cloud);
  - the Firefox row (Playwright Firefox is not installed).
- **A round 413:** no STOP, A1–A5 passed. The reviewer found 0 Medium+ and Lows L1–L6.
- **Gate 413:** `published`, commit `dc536a6`, pushed to both remotes. It is the baseline for round 414 [K1, K13].
  - The gate reviewer found Lows 1–3, Info 4 and an Architecture note.
  - `context/head-sha.txt` still shows `107eb2d`; that is the pre-gate snapshot, and the real HEAD is `dc536a6`.
- **Archive:** `tasks/round-413.md` is a byte copy of the round-413 task [K16].
- **Backlog changes from this evidence** (version 389):
  - PERF-15b-ii-a is done, and **PERF-15 is done on the client** (D-29z1437).
  - Closed: TL-R411-L4, GATE410-L2, TL-R411-L9, A-R411-REVIEW-L5, TL-R413-L1, TL-R413-L2 and TL-R413-L-C.
  - TLM-PERF15-FIREFOX stays a `record` item, deadline RETRO 416.

## 2. Rulings on round-413 findings (D-29z1440)
- **To `deferred_low_polish`:** A-R413-REVIEW-L1…L5 and GATE413-L1. L4 (redirect follow) and L5 (opaque `'null'` origin) are small hardening items for the next round that owns `collection.ts` or `precomputed-peaks.ts`.
- **Closed or merged:**
  - A-R413-REVIEW-L6 is closed by L28.
  - GATE413-L2 is the same as TL-R413-L-B, which is already deferred.
  - GATE413-L3 is the TL-R413-L-A contract.
- **Recorded:** GATE413-I4 and INFO-A413-PS18-DUPLICATE-ID.
- **Architecture notes are signals only, not tasks:**
  - SIG-GATE413-PEAKS-PREFETCH-HELPER is attached to the open ARCH-CHECKPOINT-PERF15-PEAKS;
  - SIG-A413-CAPPED-BODY.

## 3. Round 414 design (SYS-R2-FAKE-FIDELITY)
- **Scope split (D-29z1438):** SYS-R388 (the fake Web Audio helper) runs in round 415.
  - The "+" in the old order meant only that the two tasks were next to each other. SIG-R388 itself says they are not joined: they are different fakes in different files.
  - One round is one stage.
- **R2 facts** (R2 Workers API reference, re-fetched 2026-11-08; the copy is `b-round-310/…` l.147 and l.155): `httpEtag` is a non-optional `string`.
  - So C-R311-01's `else headers.delete('ETag')` mutant and A-R309 #4 are **equivalent against R2**. They close by ruling, and the fake gets no object without `httpEtag`.
  - The `throw` and `short` modes become two self-consistent R2 models. This is labelled as an inference.
- **RFC 9110 check:**
  - `Bytes=` is ignored today. That is allowed but not preferred, so no test pins it: Low B-R414-RANGE-UNIT-CASE.
  - PR6's HEAD+Range → 206 conflicts with §14.2, which says a server MUST ignore Range for methods other than GET. This is pre-existing: Low B-R414-HEAD-RANGE-206.
  - Neither is changed in this test-only round.
- **Sketch v2** (`b-round-413/sketch-414.patch.txt`, sha `5279fce5…`). It changes only the test file; both workers are frozen.
  - `node --test` gives 83/83 (HEAD: 75).
  - 14 mutants: 13 red with the expected row, 11 of which survive today's tests (new coverage); 1 is equivalent; pristine runs ×4 are rc 0.
- **Review:**
  - v1 Medium (TL-R414-M1): the protected fake had no `httpEtag`. Fixed in v2.
  - v2 Low 1: a weak mutant, replaced before dispatch.
  - v2 Low 2: wording, added to ruling 6.
- **Browser in a worker round:**
  - The worker is not reachable from `/studio-lab`, so C runs the real-Chromium worker probe on the unchanged workers (round-311 harness).
  - B ran it at HEAD: `b-round-413/probe/head-summary.txt`, equal to round 311's WK-OPS.
  - C also runs the auth/demo row at both viewports.
- **Gate gap:** `verify` does not run the worker tests [K10b], so ROOT-REQ-VERIFY-WORKER-TESTS is re-raised. C's WK-UNIT row runs them.

## 4. Architecture
No new checkpoint request. This is a test-only round with no structural risk on one owner. The open requests stay as they are, including ARCH-CHECKPOINT-PERF15-PEAKS and ARCH-CHECKPOINT-PERF11C-III-BOUNDARY.

## 5. Schedule
- **Next rounds:** 414 SYS-R2-FAKE-FIDELITY → 415 SYS-R388-FAKE-WEB-AUDIO-HELPER → 416 RETRO → SYS-CLOCK-DETERMINISM → SYS-R369 → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
- **REGRESSION-2026-11-10:** it goes first at the first planning on or after 2026-11-10, and ahead of RETRO if both are due. `regression-last.json` is unchanged (2026-11-07).
- **Commit readiness:** round 413 is published. Nothing new is ready for root until C round 414 passes.

## 6. Files written (B-owned only)
- **`b-round-413/`:**
  - sketch: `sketch-414.patch.txt` (v2), `-v1`, and `sketch-414.sha256`;
  - review: `sketch-review.md`;
  - claims: `claims-414.sh`, with its planning and sketch outputs and their diff;
  - scope: `grants-414.txt`, `r414-frozen-sha256.txt`;
  - mutants: `mutants/` (`run.py`, `summary.txt`, `summary-v1.txt`, `*.diff`);
  - probe: `probe/`;
  - backlog: `update-backlog.py`;
  - backups: `*-before-414.*` and `current-task-before-414.md`.
- **Loop folder:** `current-task.md`, `b-next.json`, `backlog.json` (version 389), `feature-status.md` and `tasks/round-413.md`.
- **Scratch:** `/tmp/b414` is outside the repo. No app source was edited, and no server was left running.
