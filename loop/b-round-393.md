# B round 393 → 394 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 394 = PERF-13c-ii-a. It fixes three Medium bugs in the streamed library preview's element lifecycle. Backlog v360 → v361, D-29z1342 … D-29z1346.

## 1. Round 393 result (evidence read by B)
- **C:** `c-round-393.json` is PASS. `browserVerified` and `realVerified` are true, and C found 0 bugs.
  - S1–S11, PERF-RES (31.9 ≤ 60, decode 0), AUTH, SOURCE-SCOPE, DOC-252 and three neighbour rows passed at 1440 and 1280.
  - The gate rows were left to root.
  - C noted K13/K15/K22 deltas missing from §7; they were B's hand-typed list (origin B spec). This round's §7 is generated from the sketch claims diff.
- **A:** `a-round-393.md` reports no STOP. Mutants: 17/17 red.
  - Reviewer: M1 (external pause) and M2 (play rejection test, fixed in round 393).
  - Lows L1–L7 and an Architecture note.
- **Gate 393:** `published`, commit `1091b9e`, pushed to both remotes (`gates/gate-round-393.json`). The reviewer cleared it ("COMMIT: OK", 8.5/10) with 1 Medium (synchronous throw), 3 Lows and an Architecture note.
- **Done (V2 rule satisfied, browser half verified):** PERF-13c-i → **done** (D-29z1342).
- **Archived:** `tasks/round-393.md` is a byte-identical copy of the round-393 task. Backups are `b-round-393/*-before-394*`.

## 2. Rulings
| ID | Ruling |
|---|---|
| D-29z1342 | Round 393 result: PERF-13c-i done |
| D-29z1343 | **PERF-13c-ii is split.** 13c-ii-a (round 394) covers stream robustness in `preview.client.ts` only. 13c-ii-b covers the purchased `previewUrl`, the harness preview row, the cache-warm ruling, a stable seek key and fallback expiry. Doc 252 now has 3 stages |
| D-29z1344 | **13c-ii-a rulings.** (1) A stall watchdog of 8000 ms: armed at start and on `waiting`; cleared on `playing` or a stop; restarted only on `progress`; it acts only when `currentTime` has not moved, and then falls back to decode. (2) **GATE393-M1-SYNC-THROW** is created and fixed with `try`/`catch` routed to the error path. (3) **The external pause is re-rated Medium,** because the media controls make it reachable; this supersedes A-R393-SKETCH-L4. It becomes `pause` → `onEnded`, guarded by `!ended && !error`. (4) **NotAllowedError keeps the decode fallback** (Safari/iOS reason). This closes GATE393-L2 and the sketch-review #2 scope addition |
| D-29z1345 | A-393 L1, L2, L3 and L7, and GATE393-L3, go to `deferred_low_polish`. A-393 L4/GATE393-L4 and A-393 L6 go to 13c-ii-b. A-393 L5 becomes an SRW-21-PLAN row |
| D-29z1346 | **Architecture: keep holds.** Round 394 changes no provider code (claim K9). Two signals are recorded and not scheduled: A-R393-ARCH-DECIDE-PREVIEW-MODE and GATE393-ARCH-PREVIEW-CONTROLLER. A bounded frontend-architect checkpoint is requested from root for the feature boundary after 13c-ii-b (`b-round-393/root-request-arch-checkpoint-preview.md`) |

## 3. Round 394 shape
- **Baseline:** `1091b9e`, clean.
- **Grants:** 3 paths: `preview.client.ts`, the stream test and doc 252 (`b-round-393/grants-394.txt`).
- **Frozen manifest:** `b-round-393/r394-frozen-sha256.txt`, 1284 entries, 0 failures. Protected 11/11.
- **Claims:** `b-round-393/claims-394.sh` K1–K20.
  - Planning output: `claims-394-planning-output.txt`.
  - Sketch output: `claims-394-on-sketch.txt`. §7 is the diff of the two.
- **B's evidence (L23, L37, L58):**
  - **Premise at HEAD** (`premise/events-head.json`):
    - HOLD: `Stop` stays shown with no fallback.
    - Console pause: `Stop` stays shown.
    - Event order: `pause` before `ended`; an abort fires `error` without `pause`.
  - **Sketch:** `sketch-394.patch.txt`, sha256 `723a6d9e42b1aaa0…`. `tsc` and scoped Biome are clean.
  - **Covering set:** 14 files, 256 tests, rc 0 (`precheck-covering.log`). LRS4 2.24 s / 15 s.
  - **Mutants:** 12/12 red, pristine rc 0 (`mutants/summary.txt`).
  - **Browser probes on a scratch server (port 5174, own `cacheDir`), at both viewports:**
    - `sketch-events.json`:
      - HOLD falls back after 8378 ms: `Loading…` → `is ready.`;
      - a pause gives `Preview`;
      - a normal 20 s stream with a seek has 0 decodes and unchanged PCM;
      - END and ABORT are unchanged.
    - `sketch-hold.json`:
      - PCM +1 (101.35 s);
      - requests: one `media`, then one `fetch`;
      - 0 after the fallback.
  - The scratch server is stopped, `:5173` still returns 200, and there is no `deps_temp` in `store/node_modules/.vite`.
- **jsdom rows:** PS16–PS24, each with a named mutant.
- **Browser rows:** R1–R7, PERF-RES, AUTH, SOURCE-SCOPE and DOC-252, at both viewports. The synchronous throw and the `ended` guard are listed as jsdom-only.

## 4. Consults
- **Advisor:** available and used twice: after orientation (shape and event-order probe) and before writing (L58 assert/record, rulings to record, §7 from the claims diff). One more check follows at the close.
- **tech-lead:**
  - Agrees with the event model.
  - Add a progress check at expiry, because Chromium can skip `playing`.
  - Never arm on `stalled`.
  - Use a cancel-function scheduler shape.
  - Mid-play stalls also fall back.
  - **Pushback:** keep the NotAllowedError fallback. B accepted it.
  - No provider change is needed.
  - Rows and mutants proposed (adopted).
- **performance-optimizer:**
  - Restart the timer on `progress` (adopted) to avoid a false-positive 37–55 MiB decode.
  - Asserts: PCM +1 after the hold, and 0 requests after the fallback; B measured both on the sketch.
  - Leave `perf/` alone (13c-ii-b).
  - The double download was confirmed as one `fetch` at the fallback; it goes to 13c-ii-b.
- **product-designer / ableton-arrangement-expert:** not called. This is a perf and bug-fix round with no new user-visible behaviour (policy exemption).

## 5. Architecture
- Zero provider delta, so the keep ruling (D-29z1337) holds.
- The two new reviewer notes are recorded as signals.
- Feature-boundary checkpoint request: `b-round-393/root-request-arch-checkpoint-preview.md` (after 13c-ii-b). ARCH-CHECKPOINT-DECODE-REGION is still open for root.

## 6. Order after round 394
1. PERF-13c-ii-b → 13d → 14 → 15;
2. SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM;
3. STEM-LANES → SYS-1…3;
4. STORE-2b…5;
5. REVIEW-RECOMMENDATIONS → T12-ADVANCED;
6. phase 2 (skip rule).

**Timing:** the regression round is due at the first planning on or after 2026-11-10 (`regression-last.json` unchanged, 2026-11-07 / 390). The RETRO is at round 400.

## 7. Root notes
- **Still open for root:**
  - ROOT-REQ-VITEST-PERF-INCLUDE;
  - ROOT-REQ-L57-CHECK-PROGRESS;
  - ARCH-CHECKPOINT-DECODE-REGION;
  - ROOT-NOTE-R387-STOP-NOT-HONOURED;
  - the new preview checkpoint request (after 13c-ii-b).
- **Ready for commit:** nothing new. Round 393 is already published.
- **Environment:** B ran a scratch dev server on `/tmp/b394-scratch` (port 5174) with `cacheDir` `/tmp/b394-vite-cache` set in the scratch config before the start. That scratch config change was reverted afterwards and is not in the sketch. The server is stopped.

## 8. Files written by B
- `tasks/round-393.md` (a copy).
- `current-task.md` (round 394).
- `backlog.json` v361 (`b-round-393/update-backlog.py`, `.done`; plus `update-backlog-2.py`, which adds the `open_findings` id ARCH-CHECKPOINT-PREVIEW-AFTER-13C referenced in `b-next.json`).
- `feature-status.md` (`b-round-393/update-feature-status.py`, `.done`).
- `b-next.json`.
- In `b-round-393/`:
  - backups and `checkpoint.md`;
  - grants, the frozen manifest and the claims script with its two outputs;
  - premise probes and results, the sketch patch and sketch probes, mutants and the covering log;
  - the root request.

No file in `store/` was changed by B.
