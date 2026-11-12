# B round 459 → 460 planning (2026-11-12)

**Decision: CONTINUE.** Round 460 is the SABA-B-13 fix-up for C-R459-01. The task is `current-task.md` (D-29z1626 is the round-459 result, D-29z1627 the dispatch).

- **Advisor:** available, consulted twice. The first call came after orientation. At the second, before closing, it found 7 defects. All are fixed:
  1. C12/C13 now require re-render proof (`styleReplaced` and `hydrationErrors` in `frames.mjs`), and the rows were re-run (`probe/matrix/summary-rerender.txt`).
  2. The L29 grep moved to a fenced block.
  3. C16's `pending` grep no longer collides with an identifier.
  4. The React docs were actually read (WebFetch, quoted). The re-render itself is labelled as B's browser observation.
  5. Findings that B alone closed were reopened until C passes.
  6. The C6/C12 bounds are corrected.
  7. K10 now lists every cited file.
- **Project agents:** `tech-lead` ×2. Review 1 on v2b was REQUEST CHANGES; review 2 on the dispatched v2c was APPROVE (`b-round-459/sketch-review.md`). `product-designer` was not re-consulted, because the fix adds no UI (the reason is in the task).
- **Archive:** `tasks/round-459.md` is a byte-identical copy (`cmp` OK). Pre-edit copies: `b-round-459/backlog-before-460.json`, `b-next-before-460.json` and `feature-status-before-460.md`.
- **Store:** B edited no file in the store. The tree is still the round-459 state: 5 dirty paths, with v1 hashes 4 OK. All sketch work was done in scratch clones under `/tmp`.

## Round 459 result, from the evidence
- **C FAIL** (`c-round-459.json`, `browserVerified`/`realVerified` true); gate 459 `skipped`. Nothing from round 459 is marked done. SABA-B-13 is **ბაგია → მუშავდება**.
- **Rows that passed:** C1, C2 (claims), C3, C4, C5, C7, C8, C10 and C12–C15. These include the black first frame, the CPU-1 duration of 1466–1558 ms, no cover on reload or reduced motion, the failsafe, Studio and purchase protection, and the docs.
- **A-R459-REVIEW-R1 = C-R459-01 (Medium, origin B spec):** after an injected-node hydration mismatch (React #418), the document is client-rendered and the cover `<style>` is replaced, so no entrance plays (HEAD plays). C's id is recorded as `confirmedBy` on A's id (L7).
- **C-R459-02 (Low, B spec):** the CPU-4 logo/tag floors. **C-R459-03 (Low, environment):** the click latency measure included probe latency. Both criteria are ruled in the task.
- **Not run by C:** the C11 SSR grep and the C2 L29 grep. Both now have runnable commands in the task.

## L10 ruling on A's STOP
- **Accepted.** It is B's spec gap: the round-459 sketch and both its reviews missed the document re-render.
- **The new sketch, v2c,** stays within the 5 round-459 grants, and `root.tsx` is unchanged:
  - the handshake moves to a typed `window.__czabaEntrance`;
  - the boot skip looks up the cover node at call time;
  - the boot listeners self-remove after 1250 ms (A-R459-REVIEW-R2);
  - `media` keeps the cover on while the handshake is pending and under the failsafe. The time bound is TL-R460-1, `tech-lead` review 1.

## Evidence B gathered (production builds, real Chromium, mock API)
- **R1** (`b-round-459/probe/r1/r1-b.txt`): the entrance plays after the mismatch in HEAD 3/3, v1 0/3 and v2c 3/3.
- **v2a gap:** v2a left a 40–80 ms cover gap (`probe/matrix/v2a-partial/`). v2c has none: in the `inject` rows, `reblack` and `gaps` are both 0.
- **Re-render rows with proof** (`probe/matrix/summary-rerender.txt`, 22 rows):
  - every tree `inject`/`delayinject` row has `styleReplaced` true and hydration errors logged;
  - `inject` plays with `gaps`/`reblack` 0, removed in 1570–1596 ms at CPU 1 and 1893–1946 at CPU 4;
  - `delayinject` ends `expired` with no re-blackening.
- **Dev hydration:** an isolated v2c dev server (port 5174, own Vite cacheDir) gave `hydration` 0 in 6/6 runs (`probe/dev-console-v2c.txt`, K17).
- **v2c matrix,** 78 rows (`probe/matrix/summary.txt`, `table.txt`, `reblack.py`):
  - first frame black in every tree `fresh`/`inject` row;
  - CPU-1 duration 1503–1525 ms;
  - CPU-4 `fresh` removed − start ≤ 1920 ms;
  - `delayinject` ends `expired`, with no overlay and no re-blackening;
  - skip from input to removal: max 110 ms at CPU 1 and 128 ms at CPU 4.
- **Rulings from these numbers:**
  - CPU-4 logo/tag become record-only (> 0). B's own replicate measured 543/341.
  - C9 bounds: ≤ 200 ms at CPU 1 and ≤ 400 ms at CPU 4, measured from the input event.
- **Prechecks on the sketch** (`precheck-*.log`/`.txt`): covering 11 files / 206 tests; entrance file 41/41; tsc rc 0; lint 207 warnings, unchanged; Biome on the 4 files 5 + 1 known diagnostics.
- **Mutants:** 27/27 red, BASE green (`mutants/mutants.txt`).
- **Claims:** `claims-460.sh` planning output and expected-after-A output, both with empty stderr. L58 OK.

## Backlog (backlog.json v452)
- **Added to `open_findings`:**
  - A-R459-REVIEW-R1, `confirmedBy` C-R459-01, scheduled 460;
  - A-R459-REVIEW-R2, scheduled 460;
  - C-R459-02 and C-R459-03, criteria ruled; they close on C round 460 PASS;
  - SABA-Q-ENTRANCE-BACKGROUND-TAB, `awaiting_user`, default keep. It comes from A-R459-REVIEW-R5 and is in `user-review/questions-saba-b-13.md`.
- **`deferred_low_polish`:**
  - A-R459-REVIEW-R4 (CSP note);
  - A-R459-REVIEW-R8, the remainder: the E11 source regex and the unused `findOverlay` parameter;
  - TL-R460-2, which is a C row (C13) this round.
- **`confirmedBy` added:** A-R459-REVIEW-R3 on TL-R459-COLOR-BLACK-DEP, and the R8 nits on TL-R459-TEST-NITS.
- **Kept open until C round 460 passes,** because a backlog item closes only on C evidence:
  - TL-R460-1 (Medium) closes on C13;
  - TL-R460-3 closes on C3/C4;
  - A-R459-REVIEW-R6 closes on C16;
  - A-R459-REVIEW-R7 closes on C9.
- **Signals and retro input:** architecture signal SIG-R459-ENTRANCE-HANDSHAKE (signal only, not scheduled); retro input RETRO465-B-PREHYDRATION-HANDSHAKE (candidate lesson, for RETRO 465 to merge; `lessons.md` stays at 60 lines).
- **Status updates:** TLM-R459-FIREFOX-SAFARI-ENTRANCE is now "open after round 460 C PASS". The round entries for 459 (the result) and 460 (dispatched) are written, and STORE-REDESIGN's status has the round-460 prefix.

## Other notes
- **Regression:** not due on 2026-11-12. It is due from 2026-11-13, so round 461 will be the REGRESSION round if it is planned on or after that date. `regression-last.json` is unchanged.
- **Architecture checkpoint:** none requested. The fix is bounded and stays inside the granted files. The handshake signal is recorded for the ARCH checkpoint only if the boot script grows again.
- **Commit readiness:** nothing new is ready. Round 459's tree is not publishable until C round 460 passes and the root gate runs.
- **COMPLETE is not possible:** SABA-B-13 is unverified, the remaining STORE-REDESIGN stages, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, STEM-LANES and phase 2 are still open, and so are the Mediums and the deferred Lows.
- **Not BLOCKED:** no external input is needed. Every Saba question has a default.
