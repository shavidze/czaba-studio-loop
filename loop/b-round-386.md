# B round 386 → 387 planning (2026-11-07)

## Inputs read
- **Context:** `context/active-summary.md`, `context/head-sha.txt` (`7295618` at job start; gate 386 then published `5312260`, which `git log` confirms).
- **Previous task:** `current-task.md`, archived as `tasks/round-386.md` (copied before the overwrite; `cmp` equal).
- **Round 386 reports:** `a-round-386.md`, `c-round-386.md` and `.json`.
- **Gate:** `gates/gate-round-386.json` (status `published`, commit `5312260`) and `gates/round-386/review.md`. The baseline for round 387 is `5312260`.
- **Other:**
  - `regression-last.json` (2026-11-05, so due 2026-11-08; today is 2026-11-07);
  - `lessons.md`;
  - `b-round-385/sketch-review.md`;
  - backlog entries looked up by id.
  - `publication-checkpoint.json` and `root-pre-push-review.md` hold no open item for this area.

## 1. Acceptance (only from C's evidence)
**Round 386: C PASS** (D-29z1300).
- 19 rows passed. `browserVerified` and `realVerified` are true, with 0 bugs.
- Gate 386 published `5312260`.
- **Closed:** GATE384-M1, A-R383-REVIEW-L1, GATE384-L2 and GATE384-L4 (guard row EV14).
- **L57 check** (`tools/l57-check.py`): `c-round-386.json` lacks five fields:
  - `gateChecksNamed`;
  - `gateChecksRunOnSketch`;
  - `chainHeadGateRunGreen`;
  - `affectedChecksNamed`;
  - `affectedChecksRunOnSketch`.

  These are recorded as INFO-B386-L57-C386-FIELDS (`b-round-386/l57-c386.txt`). C's bookkeeping, not a row FAIL. The round-387 task lists the full field set.

## 2. Round 387: schedule-failure rollback (D-29z1301…D-29z1304)
**Why now.** The regression is due on 2026-11-08, not today. D-29z1298 therefore puts GATE-B385-M2, the only scheduled Medium, first.

**Scope: three Medium bugs with one root cause** (a throw while building the playback graph):
- **GATE-B385-M2:** `applySchedule` is not all-or-nothing.
- **A-R386-REVIEW-M1:** a Play that throws leaves the transport stuck.
- **B-R386-UNGUARDED-GRAPH-CALLERS:** new, from A's round-386 reviewer note. The edit, seek, scrub, scrub-end and loop-pump builds let the throw escape while the old graph keeps playing the old arrangement.

**B's evidence before dispatch** (all under `b-round-386/`):
- **HEAD reproduction in the real browser, both viewports** (`probe/m2-head-*.json`, `probe/flow-head-*.json`). The 2nd `start()` of a Play throws, with this result:
  - 2 page errors per throw;
  - the 1st source is never stopped, even by Stop;
  - Stop jumps the clock from a stale anchor (00:00.000 → 00:02.011);
  - the next Play press acts as Stop, and the stuck state repeats.
- **Sketch** `sketch-387.patch.txt` (sha `a9f22614…`, 4 files, +734/−71; v2 after the review; v1 `6e30325e…` is kept as `sketch-387-v1.patch.txt`), applied to a scratch copy, never to `store/`:
  - typecheck and Biome are clean;
  - the full suite passes, 257 files and 3,787 tests (`precheck-full.log`; L23);
  - AR1–AR5 and SF1–SF10 are new.
- **Mutants:** 15, each red on its named row (`mutants/`).
- **Browser on the sketch** (dev server on :5175, own Vite `cacheDir`, both viewports; `probe/flow-sketch-*.json`):
  - 0 errors and 0 sources left sounding;
  - `scheduleFailed` is shown;
  - a repeated throw keeps the text;
  - a clean Play plays;
  - an edit that fails is kept (3 clips) and stops cleanly;
  - the round-386 M1 neighbour passes (`probe/m1-sketch-*.json`).
- **Export:** byte-identical between HEAD and the sketch (`probe/export-sha256.txt`).
- **Architecture ruling (D-29z1303):** atomicity goes in `graph.client.ts` (TL-R385-ARCH), and one provider wrapper owns the user-facing policy (A's reviewer). Both are adopted.
- **Status timing (D-29z1302):** the failure text is written in a microtask. The premise is proved by MU-387-STATUS-SYNC, which turns SF3 red: an edit's own status hid the failure.

**Review (D-29z1305; `b-round-386/sketch-review.md`):**
- `tech-lead` reviewed v1 and found TL-R387-M1 (Medium: after a time-removing edit, a failed reschedule stopped at a stale-timeline position) and L1–L6.
- M1, L1, L2, L4, L5 and L6 are fixed in v2, with new rows SF8, SF9 and SF10 and three new mutants. L3 (no diagnostic) is deferred like TL-R385-L8.
- The delta review on v2 found "Delta correct, no new Medium+". L7 (stop at `startAt`, ≤ 50 ms ahead) is a deferred Low; L8 is info.
- The 8 × 5 throw-site × caller matrix is complete (L58).

## 3. Recorded, not scheduled (D-29z1304)
- **A-R386-REVIEW-L1** closes with round 387: after the rollback no half-built graph is ever stored.
- **A-R386-REVIEW-L2:** info.
- **Gate-386 suggestions:**
  - S1 (a "loading preview" status), S2 (the catch when not playing) and S4 (test blank lines) → `deferred_low_polish`;
  - S3 = TL-R385-L6 (already deferred);
  - S5: info.
- **Architecture notes:**
  - SIG-R386-USE-DECODE-COORDINATOR (gate 386) is joined to ARCH-CHECKPOINT-DECODE-REGION;
  - SIG-R386-BUILD-OR-STOP-WRAPPER is ruled by D-29z1303.

## 4. Consults
- **`tech-lead`:** called twice, for the sketch review and the delta review (reviewed = dispatched, sha `a9f22614…`).
- **The advisor** was available and used twice:
  - **before the sketch.** It set the plan items: HEAD browser repro first, export byte-equality, rollback that stops only started sources, the caller enumeration, and the stale-position check.
  - **at the final review.** It caught three gaps, all fixed: the stale board numbers, the L31 check on all 65 covering files, and the wording of CLAIMS' allowed deltas.
- **Not needed for a bug round:** `product-designer`, `performance-optimizer` and `ableton-arrangement-expert`.

## 5. Architecture checkpoint
- **No new request.** The decode-region request (`b-round-383/root-request-arch-checkpoint-decode-region.md`) and ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING stay open and are non-blocking, wanted before PERF-13b-ii.
- **Load on one owner.** Round 387 adds a fifth change in three rounds to `ArrangementContext.tsx`'s playback-start region. Root may fold "graph build/stop ownership" into the same pending checkpoint. The change is small and behaviour-preserving, so it does not block.

## 6. Backlog and board
- **Backlog:** `backlog.json` v353 → v354 (backup `b-round-386/backlog-before-387.json`; the same 2-space, ASCII-escaped format; only the intended lines changed). Decisions D-29z1300…D-29z1304.
- **Board:** `feature-status.md` updated (backup `b-round-386/feature-status-before-387.md`).
- **Claims:** `b-round-386/claims-387.sh`; the HEAD output is in `claims-387-output.txt` and the sketch output in `claims-387-sketch-output.txt`.
- **Manifests:** frozen `r387-frozen-sha256.txt` (1,279 entries) rc 0; protected rc 0.

## 7. Commit readiness
- Round 386 is already published (`5312260`).
- Round 387 changes source. Root publishes it only after C PASS, the gate verify and an independent review.

## 8. Not COMPLETE
- **Open now:** the three round-387 Mediums.
- **Next:** REGRESSION-2026-11-08 (due).
- **Remaining stages:**
  - STUDIO-PERFORMANCE 13b-ii…15;
  - SYS-R2/CLOCK;
  - STEM-LANES;
  - SYS-1…3;
  - STORE-2b…5 (direction gate);
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 entries (skip rule);
  - the deferred Lows (all of which must be fixed before final acceptance).
- No external blocker stops the loop.
