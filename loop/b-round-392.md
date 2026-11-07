# B round 392 → 393 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 393 = PERF-13c-i (library preview streams URL sources through a media element). Backlog v359 → v360, D-29z1336 … D-29z1341.

## 1. Round 392 result (evidence read by B)
- **C:** `c-round-392.json` is PASS. `browserVerified` and `realVerified` are true, and C found 0 bugs.
  - Passed at 1440 and 1280: B7, B8, B9, B1, B2 (status/transport only, the level clause dropped by the task), B3, B4 (WAV and MP3), and B5.
  - Also passed: PERF-RES (31.9 ≤ 60, decode 0), the EV13 neighbour, AUTH, SOURCE-SCOPE and DOC-251.
  - The gate rows were left to root.
- **A:** `a-round-392.md` reports no STOP. Mutants: 14 red, 1 accepted as equivalent (MU-392-IGNORE-ABORT, L52).
- **Gate 392:** `published`, commit `c1183a0`, pushed to both remotes (`gates/gate-round-392.json`). The reviewer cleared it ("COMMIT: OK", 8.5/10) with 3 Lows and an Architecture note.
- **Done (V2 rule satisfied, browser half verified):**
  - PERF-13b-ii → **done**;
  - C-R391-01 → **closed** by the B7/B8/B9 evidence.
- **Archived:** `tasks/round-392.md` is a copy of the round-392 task. Backups are `b-round-392/*-before-393*`.

## 2. Rulings
| ID | Ruling |
|---|---|
| D-29z1336 | Round 392 result: PERF-13b-ii done, C-R391-01 closed |
| D-29z1337 | ARCH-CHECKPOINT-DECODE-REGION is still unanswered, so B rules **keep** (the D-29z1321 rule). The A-392 reviewer, the gate-392 reviewer and the tech-lead consult agree. The settle-helper extraction becomes a candidate after PERF-13c, with root approval. Round 393 is the eleventh round in the region, so its new code lives in `preview.client.ts`. The request stays open for root |
| D-29z1338 | **A-R392-REVIEW-M1 → Low.** It is unreachable: the only provider mount is `studio-lab.tsx`, with a module-constant collection (claim K25). It goes to `deferred_low_polish` and becomes a named row of SRW-21-PLAN. **To `deferred_low_polish`:** A-392 review L1–L3, GATE392-L1 (`console.info` in the tests) and GATE392-L2 (the Play warning names any failed clip). **Info, watch:** GATE392-L3 (budget ≤ 0 flakiness) |
| D-29z1339 | **C notes.** INFO-C392-B3-PLAYING is the D-29z1326 contract ("Play plays and warns"); the next regression row gets exact wording. INFO-C392-FIRSTLOAD-OBSERVER is a probe note (use `addInitScript`) |
| D-29z1340 | **PERF-13c is split in two.** 13c-i (round 393): the demo URL sources stream. 13c-ii: the purchased `previewUrl` (its browser half is BLOCKED in the cloud), the harness preview row, the stem-cache warm ruling and the stall watchdog. The premise was measured at HEAD |
| D-29z1341 | **13c-i rulings.** Stream only when the source is ready, not cached, and has a `previewUrl`. Use a bare element (routing-equivalent). No status write while buffering. Any stream error falls back to the decode path at the element's time, remembered per collection. Preview state is set before play. REV-B393-M1-STALL goes to 13c-ii. The stem cache is not warmed (signal) |

## 3. Round 393 shape
- **Baseline:** `c1183a0`, clean.
- **Grants:** 7 paths (`b-round-392/grants-393.txt`):
  - the type;
  - the demo collection and its test;
  - `preview.client.ts`;
  - `ArrangementContext.tsx`;
  - a new test file;
  - doc 252.
- **Frozen manifest:** `b-round-392/r393-frozen-sha256.txt`, 1280 entries, 0 failures. Protected 11/11.
- **Claims:** `b-round-392/claims-393.sh` K1–K26. Planning output: `b-round-392/claims-393-planning-output.txt`.
- **B's evidence (L23, L37, L58):**
  - **Premise:** `premise/premise-head.json`. Middle East +37.1 MiB, 278 ms; hero +55.1 MiB, 673 ms.
  - **Sketch:** `sketch-393.patch.txt`, sha256 `8de762db…`. It passes typecheck and scoped Biome.
  - **Full suite on the sketch** (`precheck-full.log`): 257 files, 3801 tests, rc 0. That run used the first sha, and B's own mutant runs overlapped it on the same scratch copy, so it is not clean evidence alone.
  - **Covering set on the final sha** (`precheck-covering.log`): 14 files, 238 tests, rc 0, with no overlap.
  - **Mutants:** 7/7 red, pristine rc 0 (`mutants/summary.txt`).
  - **Browser probe on a scratch dev server** (`sketch-browser.json`), at 1440 and 1280:
    - streaming plays with 0 decodes and live PCM unchanged;
    - Stop releases the element (`networkState` 0);
    - the fallback reaches the round-392 texts.
  - **Review:** `sketch-review.md`. tech-lead stood in for code-reviewer, which is not on B's list. It found 1 Medium, ruled to 13c-ii, plus 8 Lows. The delta was re-reviewed: "delta OK". Reviewed = dispatched.
- **jsdom rows:** PS1–PS15, each with a named mutant.
- **Browser rows:** S1–S11, PERF-RES, AUTH, SOURCE-SCOPE and DOC-252, at both viewports.

## 4. Consults
- **Advisor:** available and used after orientation, before writing. It confirmed the shape: PERF-13c stage 1, a keep ruling for the arch checkpoint, a ruling on M1 by reachability, the premise first, the purchased half split off, and the test/fake and status-text implications.
- **performance-optimizer** (mandatory for PERF):
  - use a bare element, not `createMediaElementSource`;
  - safe asserts: decode count 0, PCM delta 0, no decoding text, `networkState` 0 after Stop;
  - record only: first-sound time and network bytes;
  - the win applies to previews that are never placed;
  - there is a double-fetch risk for purchased sources (→ 13c-ii).
  - It reported that `perf-plan.md` / `oss-adoption.md` are not inside `store/`. They live in `/home/runner/czaba-project/docs/technical/performance/`.
- **tech-lead** (mandatory for PERF):
  - `previewUrl` belongs on the collection as a function;
  - one player module with an injectable factory;
  - fall back to the decode path on error;
  - no buffering status;
  - agrees with the keep ruling;
  - the unmount stop is load-bearing.
  - Then a sketch review and a delta review (see §3).
- **product-designer / ableton-arrangement-expert:** not called. This is a perf stage with no new user-visible behaviour (policy exemption). The Live 12 manual ch. 5 alignment is noted in the task.

## 5. Architecture
- ARCH-CHECKPOINT-DECODE-REGION was ruled by B (keep). The request stays open, and **root is asked to confirm or overrule it** (`b-round-383/root-request-arch-checkpoint-decode-region.md` + `b-round-388/root-request-arch-addendum-389.md`). This is the feature boundary of PERF-13b; PERF-13c is the eleventh round in the region.
- New signals: GATE392-ARCH-SETTLE-HELPER and SIG-R393-PREVIEW-NO-CACHE-WARM.

## 6. Order after round 393
1. PERF-13c-ii → 13d → 14 → 15;
2. SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM;
3. STEM-LANES → SYS-1…3;
4. STORE-2b…5;
5. REVIEW-RECOMMENDATIONS → T12-ADVANCED;
6. phase 2 (skip rule).

**Timing:** the regression round is due at the first planning on or after 2026-11-10 (`regression-last.json` unchanged). The RETRO is at round 400.

## 7. Root notes
- **Still open for root:**
  - ROOT-REQ-VITEST-PERF-INCLUDE;
  - ROOT-REQ-L57-CHECK-PROGRESS;
  - ARCH-CHECKPOINT-DECODE-REGION (confirm keep);
  - ROOT-NOTE-R387-STOP-NOT-HONOURED.
- **Ready for commit:** nothing new. Round 392 is already published.
- **A deferred sketch-review Medium.** REV-B393-M1-STALL (a stalled streamed preview never recovers) is deferred to PERF-13c-ii on purpose, so it shows as an open Medium in the active summary.
  - Reason: 13c-i streams only same-origin static demo files.
  - The decode path has the same hung-fetch exposure today.
  - Root may overrule this and require the watchdog in round 393.
- **Environment note.** B ran a second dev server on a scratch copy (`/tmp/b393-scratch`, port 5174, own `cacheDir`) for the sketch browser probe. For about 30 s that server's config lacked the `cacheDir`, and its optimiser left `store/node_modules/.vite/deps_temp_d4b0a7e9`. The store dev server on :5173 was checked afterwards with a fresh browser load: it reaches `Demo collection ready`, with no 5xx. B did not delete the temp folder (no-delete rule), and Vite ignores it. Root may remove it. The scratch server is stopped.

## 8. Files written by B
- `tasks/round-392.md` (a copy of the round-392 task).
- `current-task.md` (round 393).
- `backlog.json` v360 (`b-round-392/update-backlog.py`, `.done` marker).
- `feature-status.md`.
- `b-next.json`.
- In `b-round-392/`:
  - backups and `checkpoint.md`;
  - grants, the frozen manifest, the claims script and its planning output;
  - the premise probe and its result;
  - the sketch patch, sketch review, mutants, pre-check logs and the browser probe result.

No file in `store/` was changed by B.
