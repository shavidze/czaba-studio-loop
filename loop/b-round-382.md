# B round 382 → 383 planning

**Date:** 2026-11-07 · **Backlog:** v348 → v349 · **Decisions:** D-29z1276 … D-29z1279 · **Next task:** `current-task.md` (round 383, PERF-13b-i fix) · **Archive:** `tasks/round-382.md` (byte-equal copy, checked with `cmp`) · **Baseline:** HEAD `5745526`. `gates/gate-round-382.json` is `skipped` (C taskStatus FAIL), so there is no new published commit; the round-382 work stays uncommitted in the tree (11 status lines).

## 1. Round 382 result (D-29z1276)
- **C FAIL** (`c-round-382.json`): `browserVerified` and `realVerified` are true.
  - 11 rows passed.
  - EVICT-BROWSER (a) and (b) failed.
  - Two Medium findings were opened.
- **Not marked done:** PERF-13b-i.
- **Rows that passed on independent evidence:** the export WAV sha is equal to HEAD, PLAY-REFUSE is exact, all 22 asserts pass, the unit rows and mutants pass, and the auth guard holds. The fake bearer is under `blocked` (no backend).

## 2. B's own diagnosis (D-29z1277, evidence `b-round-382/probe/`)
- **C-R382-01: confirmed.**
  - **What the heap snapshot shows** (dev, 1440×900, `heap-ready2.json`): 8 native `AudioBuffer`s at ready. 7 are reached through `decodedBuffers` (the synthetic sounds). The hero's is reached through the alternate `FiberNode` → `memoizedState` hook list → `baseQueue` → `action` closure → context `{peaks}` → previous context `{buffer}` (`heap-ready3-ctx.json`).
  - **The closure:** the load path's `setSourcePeaks((previous) => …)` updater. React keeps the last processed update queue on the alternate hook until the provider renders again. Because the `onPeaks` closure references `buffer`, `buffer` is context-allocated, and the updater's context chain reaches it.
  - **It is pre-existing:** HEAD has the same updater at l.4058 and l.2639. It was invisible until eviction existed.
  - **Root cause for RETRO:** the K32 premise listed holders by reading source; no browser retention row existed; jsdom cannot see closure retention.
- **C-R382-02: reclassified, pending C.**
  - `/studio-lab` has two "Stop" buttons while a preview plays: the transport Stop (`aria-label="Stop"`) and the library toggle, whose text is "Stop".
  - C's `.first()` hit the transport Stop. The preview kept playing (0 `stop()` calls), so the buffer was legitimately pinned (`preview-stop-check.json`).
  - With the library Stop, the buffer is released, Add makes it live, and Undo releases it (`preview-stop-check-lib.json`).
  - A plain Web Audio experiment confirms that stop and disconnect release a buffer (`source-release-exp.out`).
  - B does not close the finding; C's EVICT-B2 row closes or keeps it.

## 3. Rulings (D-29z1278, D-29z1279)
| Item | Ruling |
|---|---|
| A's STOP: reset `clear()` drops video audio | (b): `deleteMany(old collection ids)` plus the in-flight clear; video entries stay; the reset touches no pins. EV7 reworded; DC8, MU-383-RESET-CLEAR, MU-383-DELETE-MANY-ALL |
| Transport Stop does not stop a library preview | HEAD parity (`stopPlayback` has 0 preview refs). Recorded as B-R382-TRANSPORT-STOP-VS-PREVIEW, a question for a later Ableton consult, not scheduled |
| Two controls named "Stop" | B-R382-DUP-STOP-NAME, Low → `deferred_low_polish` |
| A's "error source skipped by export and Play" | A ruling candidate on PERF-13b-ii |
| code-reviewer's Architecture note (`useDecodedSourceBuffers`) | SIG-R382-USE-DECODED-SOURCE-BUFFERS, joined to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Feature-boundary checkpoint request after 13b-ii |
| RETRO 384 inputs | B-R382-SCOPED-LOCATORS, B-R382-UPDATER-CLOSURE-RETENTION. `lessons.md` is unchanged (60 lines; not a Saba-found issue) |

## 4. Next round choice
- **C's Medium bug comes first** (bug gate). The round is one feature-stage fix, one ruling and one doc correction, all on files the round already owns.
- **REGRESSION is not due:** the last run was 2026-11-05, and today is 2026-11-07. The first planning on or after 2026-11-08 is REGRESSION.
- **Perf rows stay `record`** (L58: B ran no production sketch; 13b-ii flips them). The proof is the browser heap row with a mutant (MU-383-INLINE-PEAKS-UPDATER must bring the 150.37 s buffer back through `baseQueue`).
- **Grants:** 5 paths (`b-round-382/grants-383.txt`). Frozen manifest `r383-frozen-sha256.txt`: 1,275 entries of the current tree, rc 0. Protected rc 0. Claims: `claims-383.sh`, 0 `MISSING`.

## 5. Status and completion
- **Decision: CONTINUE.**
- **Why not COMPLETE.** These remain:
  - PERF-13b-i (open Medium C-R382-01), 13b-ii, 13c, 13d, 14, 15, 12b (awaiting_user), 11b (awaiting_user), 11c-iii-d/e, 9c/d, 4b/c and DRAG-PREVIEW;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - `deferred_low_polish`.
- **Not BLOCKED:** nothing external is needed.
- **Purchase protection:** the protected sha is rc 0, the purchased adapter is unchanged, and G383-AUTH re-checks the guard.
- **Anonymous workspace:** C confirmed it again in round 382 at both viewports.
- **Commit readiness:** nothing is ready to publish. Rounds 382 and 383 are published together after a C PASS on round 383.

## 6. Advisor and agents
- **Advisor:** available and consulted after the diagnosis and before writing. It shaped these points:
  - verifying HEAD parity;
  - not closing C-R382-02 without C;
  - the SWEEP rule;
  - `deleteMany` for EV7;
  - doc 248 l.4;
  - manifests on the working tree;
  - the bookkeeping.

  A final check runs before handover.
- **Project agents:** none consulted. This is a bug round diagnosed by direct measurement, and nothing visible is designed.

## 7. Final check (after the advisor's handover review)
- **HEAP-RETAINERS:** the hard criteria are now the exact live list and 0 `baseQueue` paths. The "through `decodedBuffers`" count is information only, because the BFS shortest path can change after A's edit.
- **HEAP-MUTANT:** A adds a runner mode (`MODE=heap`, with `applied`/`restored`), and C runs the probe against the copy's dev server on a second port.
- **A's heap self-check:** now required (`a-round-383/heap-self.json`). A STOPs on any non-`baseQueue` holder rather than guessing.
- **K11:** now also measured at HEAD (`git show HEAD:`) in `claims-383.sh`. The script was re-run: 0 `MISSING`.
