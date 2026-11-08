# B round 412 → 413 planning (2026-11-08)

**Decision:** CONTINUE. **Next:** round 413 = PERF-15b-ii-a. It is PERF-15's last client stage, and PERF-15 closes on its C PASS (D-29z1434…D-29z1436). The advisor was used after orientation. Consults: `tech-lead` ×2, a sketch review and a delta re-review. `product-designer` and reference-first are N/A because nothing changes on screen.

## 1. Inputs, independently checked
- **C round 412: PASS** (`c-round-412.json`). 14 rows passed, `browserVerified` and `realVerified` true, 0 bugs. The only BLOCKED row is the fake-bearer path (backend unavailable in the cloud).
- **A round 412:** READY, no STOP. Its reviewer found no Medium or higher.
- **Gate 412:** `published`, commit `107eb2d`, pushed to both remotes. It is the baseline for round 413 [K16].
- **Archive:** `tasks/round-412.md` is a byte copy of the round-412 task [K18].
- **Backlog changes from this evidence:**
  - PERF-15b-i is done.
  - A-R411-REVIEW-M1, L1, L3 and L4 are closed, and so is TL-R412-L-F.
  - INFO-A411-SKETCH-REVIEW-HEADER was already archived from `open_findings` by root's optimizer.

## 2. Round 413 design (PERF-15b-ii-a)
- **Sketch v4:** `b-round-412/sketch-413.patch.txt` (sha `a7913dec…`, 9 files). It contains:
  - a streamed 4 MiB cap on decoded bytes (TL-R411-L4, GATE410-L2);
  - an abort listener and a pre-abort check (TL-R413-L1);
  - `WorkspaceCollection.fetchPeaks`, passed into the one context call;
  - `AudioStem.peaksUrl`;
  - the purchased adapter's `peaksUrl`, kept only when it shares the audio's origin (TL-R413-L2), with `fetchPeaks = fetchAudio` (A-R411-REVIEW-L5);
  - PS18, which checks the meta `file` field (TL-R411-L9).
- **Evidence** (`sketch-review.md`; claims K12–K15, K20):
  - tsc and Biome rc 0;
  - covering set 24 files, 436/436;
  - full suite 264 files, **3,922/3,922**;
  - **15/15 mutants red**, pristine runs green, scratch status 0;
  - browser modes real, 404 and 8bit on a `:5174` sketch server at 1440×900 and 1280×720, with values equal to round 412.
- **Reviews:** `tech-lead` gave v1 APPROVE WITH LOWS (L1, L2). Both are fixed in v4. The v4 delta got APPROVE WITH LOWS: L-a is a contract written into the handoff doc, L-b is deferred, and L-c goes into the doc.
- **Mutant gap found and fixed (v3 → v4):** MU-413-EMPTY-PEAKSURL-KEPT survived, because the empty-URL guard only matters next to a relative audio URL. PK4 now covers that case.

## 3. Rulings
- **D-29z1435 (Firefox):** Playwright Firefox is not installed [K19 = 0]. TL-R411-L3 becomes the `record` item **TLM-PERF15-FIREFOX** (deadline RETRO 416, L46), and root is asked to install it (`b-round-412/root-request-playwright-firefox.md`). PERF-15 still closes on C round 413 PASS, for three reasons:
  - falling back to decode is safe;
  - that fallback is browser-proved in Chromium (the 404 and 8-bit rows);
  - the finding is Low.

  If the Firefox outcome is `crashed`, PERF-15 reopens.
- **Browser harness limit (INFO-B413-BROWSER-STREAM-HARNESS):** two ways of delivering a body without a trustworthy content-length both failed (`browser/harness-notes.md`):
  - `route.continue` to a local chunked server was never served;
  - a fulfilled gzip body was not decoded, and even the small valid control failed.

  So the streamed cap is proved by unit rows with mutants, and the browser rows of 413 are the demo regression rows. I did not write an invented browser assert.
- **Lows:**
  - A-R411-REVIEW-L2 and TL-R413-L-B go to `deferred_low_polish`.
  - A's proposal that Biome should cover `scripts/` becomes ROOT-REQ-BIOME-SCRIPTS.

## 4. Architecture (feature boundary)
I filed **ARCH-CHECKPOINT-PERF15-PEAKS** for root (`b-round-412/root-request-arch-checkpoint-perf15.md`). It is bounded and non-blocking, and can be folded into the open PERF11C-III checkpoint. It asks two keep/extract questions:
- the peaks arbitration in `ArrangementProvider` (SIG-R410-PEAKS-ARBITRATION);
- the URL pairs that live in 4 places (SIG-R411-PEAKS-URL-COPIES).

Nothing is scheduled from it until root answers.

## 5. Process notes (RETRO 416 inputs)
- **TL-R413-I1:** the reviewer ran its mutants inside B's scratch while B ran `git commit -a`. A reviewer mutant was captured into the scratch-only commit, and I repaired it.
  - The dispatched patch was sha-verified and was never affected.
  - The delta review prompt now forbids editing the scratch.
- **B-R411-SKETCH-M1-MISSED** stays a RETRO input.

## 6. Schedule
- **REGRESSION-2026-11-10:** not due. `regression-last.json` is 2026-11-07, so the next one comes at the first planning on or after 2026-11-10.
- **RETRO:** round 416.
- **After 413:** SYS-R2-FAKE-FIDELITY + SYS-R388 → SYS-CLOCK-DETERMINISM → SYS-R369 → STEM-LANES → … (`execution_order_d29z1436`).

## 7. Files written (B-owned only)
- **This round's folder (`b-round-412/`):**
  - sketch: `sketch-413.patch.txt` (v4), with `-v1` and `-v3` copies and their sha files;
  - review and claims: `sketch-review.md`, `claims-413.sh` and its outputs;
  - scope: `grants-413.txt`, `r413-frozen-sha256.txt`;
  - tests: `mutants/`, `sketch-logs/`, `precheck-full.*`, `probe/`, `browser/`, `fixtures/`;
  - requests: the two root request files;
  - backups: the files taken before this planning (`*-before-413.*`);
  - `update-backlog.py`, `checkpoint.md`.
- **Loop folder:** `current-task.md`, `b-next.json`, `backlog.json` (version 388), `feature-status.md`, `tasks/round-412.md`.
- **Handoff doc:** `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md` gains the purchased contract: same origin, one fetch, the streamed cap, no URL-keyed cache.
- **Scratch:** `/tmp/b413` and `/tmp/b413c` are outside the repo. No app source was edited, and the `:5174` sketch server has been stopped.
