# B round 385 → 386 planning (2026-11-07)

## Inputs read
- **Context:** `context/active-summary.md`.
- **Previous task:** `current-task.md`, archived as `tasks/round-385.md` (`cmp` equal, copied before the overwrite).
- **Round 385 reports:** `a-round-385.md` (RETRO, no implementation), `c-round-385.md` and `.json`.
- **Gate:** `gates/gate-round-385.json`, status `skipped`, "no real changes", head `7295618`. Nothing was published, so the baseline stays `7295618`.
- **Gate 384:** `gates/round-384/review.md` (GATE384-M1 and its Lows).
- **Other:** `regression-last.json` (2026-11-05, so the regression is due on 2026-11-08), `lessons.md`, and the backlog entries looked up by id.

## Acceptance (only from C's evidence)
**Round 385 (RETRO 385): C PASS** (D-29z1293).
- 12 rows passed: SOURCE-SCOPE, G385-AUTH (both viewports), STUDIO-SMOKE (both viewports), RT-SCREEN, CLAIMS, RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-L57 and RT-SABA.
- `browserVerified` true, `realVerified` true, 0 bugs.
- RETRO-385 is done. The next retro is due at round 400.
- C's info notes are recorded only. INFO-C385-CITE (a line citation) is cosmetic.

C's extra WAV measurement (two 16 s stems export as 32.000 s) confirms the STEM-LANES product gap that the retro already recorded. It is not a new finding.

## Round 386: three decode-resync bugs (D-29z1294…D-29z1297)
**Scope.**
- **GATE384-M1** (Medium): a throw in the post-decode resync gives an unhandled rejection.
- **A-R383-REVIEW-L1** (Low): a stale `ensureDecoded` decodes under the new collection's controller.
- **GATE384-L2** (Low): a deferred preview stops the timeline at click time.
- The load path and the video-audio path have the same unguarded call, so the same helper closes them too (`tech-lead` TL-R385-M1).

**B's evidence before dispatch** (all under `b-round-385/`):
- **HEAD reproduction in the real browser** (`probe/head-*.json`, both viewports). A forced `AudioBufferSourceNode.start` throw in the post-decode resync gives 1 `pageerror` "injected schedule failure", and the clock keeps running, so the new clip is silent.
- **Sketch.** `sketch-386.patch.txt` (sha `1cada6c7…`, 5 files) was applied to a scratch copy, never to `store/`. It passes typecheck and Biome, and the 34-file covering set (633 tests) passes (`covering-386-full-sketch.log`).
- **Mutants.** 7 mutants, each red on its named row (`mutants/`, K18).
- **Browser on the sketch** (dev server on :5175, own Vite `cacheDir`, both viewports):
  - M1: 0 errors, the clock is frozen, `scheduleFailed` is shown, and replay shows "Playing from …";
  - L2-OK: the timeline plays during the decode and stops when the preview starts;
  - L2-FAIL: the timeline keeps playing and the failure text is shown.
- **Review.** `tech-lead` reviewed the sketch, then did a delta review (`sketch-review.md`), which also holds the 7×7 ordering matrix.
  - TL-R385-M1, L3 and L7 were fixed in the sketch.
  - **TL-R385-M2 became GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK** (Medium, pre-existing; `applySchedule` is not all-or-nothing). It gets its own round; the reviewer accepted ruling it out of this one.
  - L4, L5, L6 and L8 → `deferred_low_polish`.
  - The Architecture note → SIG-R385-APPLY-SCHEDULE-ATOMIC.
- **Post-throw contract (D-29z1295):** stop playback and show `scheduleFailed`; the buffer stays and the source stays `ready`. It is the smallest honest state, because continuing would play a silently wrong mix.

**A** applies the reviewed patch verbatim and writes doc 249. **C** checks:
- PATCH-EQUAL, UNIT, MUTANTS and CLAIMS;
- BROWSER-M1, L2-OK, L2-FAIL and JOIN at both viewports;
- G386-AUTH (401) and STUDIO-SMOKE;
- DOCS;
- the M1 mutant in the browser, as a `record` row.

**Not applicable:** reference-first and `product-designer` (a bug round, no feature), the screen budget (error-only text in the existing status line) and the YouTube request.

**Consults.**
- `tech-lead` was called twice (sketch review and delta review).
- The advisor was available and used twice: before the sketch and at the final review (it caught the K9 counts and the unobserved BROWSER-JOIN row, now run by B on HEAD).
- `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed for a bug round.

## Architecture checkpoint
- **No new request.** The open requests stay as before: ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (with Saba) and the decode-region request `b-round-383/root-request-arch-checkpoint-decode-region.md`.
- **This round adds load to the same owner** (`ArrangementContext.tsx`, decode orchestration). Root may combine it with the pending decode-region checkpoint.
- **Signals.** SIG-R384-USE-DECODED-SOURCES-HOOK and SIG-R385-APPLY-SCHEDULE-ATOMIC stay signals. They are not scheduled refactors.

## Backlog and board
- **Backlog:** `backlog.json` v352 → v353 (backup `b-round-385/backlog-before-386.json`). Decisions D-29z1293…D-29z1299 (D-29z1299: L44 question Q-PREVIEW-STOPS-TRANSPORT to Saba, `user-review/questions-preview-transport.md`).
- **Board:** `feature-status.md` updated (backup `b-round-385/feature-status-before-386.md`).
- **Claims:** `b-round-385/claims-386.sh` → `claims-386-output.txt`, 0 `MISSING`.
- **Manifests:** frozen `b-round-385/r386-frozen-sha256.txt` (1,275 entries) rc 0; protected rc 0.

## Commit readiness
- Nothing new to publish from round 385 (RETRO, no source).
- Round 386 changes source. Root publishes it only after C PASS, the gate verify and an independent review.

## Not COMPLETE
- Open now: the round-386 bugs, GATE-B385-M2 (Medium) and the regression due 2026-11-08.
- Remaining stages: STUDIO-PERFORMANCE 13b-ii…15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries (skip rule), and the deferred Lows (all of which must be fixed before final acceptance).
- No external blocker stops the loop.
