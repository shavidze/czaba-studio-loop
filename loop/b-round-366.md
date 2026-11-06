# B — round 366 → 367 planning

**Advisor:** available, consulted after orientation and again before closing. **Consults:** `tech-lead`, a read-only review of sketch v1. The code-reviewer is off B's list, so tech-lead does this review under L58. Archive: `tasks/round-366.md` (a copy of the round-366 task; nothing deleted). Backups: `b-round-366/backlog-before-367.json`, `feature-status-before-367.md`, `b-next-before-367.json`.

## 1. Round 366 result (from C's evidence only)
- `c-round-366.json`: **taskStatus PASS**, browserVerified true, realVerified true, no bugs. Passed rows:
  - CLAIMS and SOURCE-SCOPE;
  - PERF: 7/7 asserts, ratio 0.184;
  - C's own mutant, red on `stem.blocked.ready`;
  - PROBE at both viewports;
  - AUDIO: cold, warm and blocked opens play, and the WAV sha256 is identical across them;
  - G366-AUTH at both viewports;
  - DOCS.
- Blocked, not claimed: the fake-bearer 500 (it fails closed; backend only).
- Gate 366: **published `d53d113`** on both remotes. That commit is the round-367 baseline.
- **PERF-9b-i is done** (მზადაა).
- A changed B's sketch for two code-reviewer Mediums that B had not ruled. This is RETRO 368 input B-R366-SKETCH-MEDIUMS-UNRULED (B origin, L58).

## 2. Rulings and backlog changes (v329 → v330)
- **D-29z1201:** the round-366 close (above).
- **D-29z1202:** A-R366-REVIEW-* (10 perf-spec Lows) go to `deferred_low_polish`, for the next owner of the stem-cache perf spec. SIG-R366-STEM-STORE-NAME is recorded as an architecture signal.
- **D-29z1203:** round 367 scope and pre-check (§3–§4). ARCH-CHECKPOINT-PERF9-STEM-CACHE is requested from root (`b-round-366/root-request-arch-checkpoint.md`). It is non-blocking, after C 367 PASS, at the PERF-9 feature boundary, with three keep/extract questions.
- **D-29z1204:** observations recorded, not scheduled:
  - B-R364-DEMO-DOUBLE-FETCH: the 206 Media request shows at 1440 too. When it primes the HTTP cache, the cold fetch is sent with If-None-Match.
  - The exported WAV peak of 1.0 is recorded under C-R178-EXPORT-CLIPS-AT-0DB with a repro and "severity to confirm". It belongs to T12-ADVANCED T12.20 or is a question for Saba.
- **D-29z1205:** the order (§5).
- RETRO 368 inputs: B-R366-SKETCH-MEDIUMS-UNRULED, and B-R366-V1-SKETCH-HIGHS (all 9 mutants were red on v1 and tech-lead still found 2 Highs).

## 3. B's pre-check
**Scratch copies.** `/home/runner/b366-scratch` is `git archive d53d113` plus the sketch. `/home/runner/b366-head` is the HEAD build. Neither survives the job.

**Sketch v2** (`sketch.patch.txt`, sha `66ce5455…`, applies to HEAD):
- covering file 31/31;
- full suite **250 files / 3684 tests, rc 0** (`precheck-full.log`);
- typecheck 0; Biome 0;
- 13 mutants, each red on its row (`sketch/mutant-summary.txt`).

**v1 review.** tech-lead found two Highs in v1:
- **TL-1:** `transactionDone` rejected with `null` on the error event, which would have broken the quota retry.
- **TL-2:** the L5 wait put the session queue on the load path.

It also found 3 Mediums. All of them are fixed or ruled (`sketch-review.md`). SC23 became a behavioural fake-IndexedDB + OPFS row, and SC28 adds the unit half of C-R365-OBS-INTEGRITY.

**Browser probes.** `probe/stem-integrity-probe.mjs` ran on the production builds at 1440×900 and 1280×720, for HEAD and the sketch. Summary: `probe/probe-summary.txt`.
- truncate, delete-file and stale-etag all recover and play on both builds.
- **HEAD already behaves correctly**, so these are coverage rows.
- Two mutant builds prove the rows can fail: `nosize` turns truncate red ("failed to load"), and `nohitrestore` turns stale-etag red (the record keeps `"b366-stale"`).

**Validator check.** curl on the harness host: a mismatched If-None-Match with a future If-Modified-Since returns 200.

**Environment note.** `pkill -f` and `pgrep -f` with a pattern that also appears in the running command line killed B's own shell twice. Servers were then stopped by PID or port. The task warns C.

**Claims.** `claims-367.sh`, with outputs `claims-367-planning-output.txt` (HEAD) and `claims-367-sketch-output.txt` (scratch). K16 is empty in both, so every cited artifact exists.

## 4. Next task: round 367 = PERF-9b-ii (`current-task.md`)
- **Files (3):**
  - `app/lib/arrangement/stem-cache.client.ts` and `app/lib/arrangement/__tests__/stem-cache.test.ts`: B's sketch, verbatim;
  - doc 236: stage 3, l.4 `Completed (C round 367 PASS)`.
- **Contract:** commit-resolved writes; abort/disable re-checks; a non-blocking chained hit delete; clone and headers guards; a per-session commit chain; browser-store integrity.
- **Accepted trade-offs:** a hung store call stops caching but never blocks a load; a same-key fetch made right after a hit 404 and before `idle()` may still see the old entry.
- **C rows:**
  - CLAIMS, SOURCE-SCOPE, UNIT;
  - MUTANT-OWN;
  - INTEGRITY and VALIDATOR on a production build at both viewports, with playback in every phase;
  - PLAYBACK-EXPORT (record);
  - G367-AUTH; DOCS.
- **Not applicable:** reference-first, product-designer and screen budget (nothing on screen changes).
- **Closes on C PASS:** A-R365-REVIEW-L3, -L4, -L5, -L6 and C-R365-OBS-INTEGRITY.

## 5. Status and order
- No Critical or High is open. The five open Mediums are tech-lead-manual, awaiting_user or open_root; none blocks.
- `regression-last.json` = 2026-11-05, so REGRESSION is due at a planning on or after 2026-11-08.
- **Order (D-29z1205):** 367 PERF-9b-ii → RETRO 368 (window 353–367, including the whole-screen and journey review) → REGRESSION → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).
- PERF-9c is awaiting_user and PERF-9d is with root. SRW-21 is `deferred_user`; its protected files are untouched.
- **For root:**
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE (non-blocking);
  - ROOT-Q-R365-VERCEL-STATIC-HEADERS (still open).
- **Commit readiness:** gate 366 already published round 366. Nothing new is ready until round 367 passes C.
