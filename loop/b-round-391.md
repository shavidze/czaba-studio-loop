# B round 391 → 392 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 392 = PERF-13b-ii re-dispatch (C-R391-01 / A's STOP). Backlog v358 → v359, D-29z1330 … D-29z1335.

## 1. Round 391 result (evidence read by B)
- **C:** `c-round-391.json` is FAIL, with `browserVerified` and `realVerified` true. Bugs: C-R391-01 (Medium, the superseded preview leaves a stale `Loading “…”…`, reproduced at both viewports) and C-R391-02 (Low, the export preflight says "no clip with sound" for a failed clip). Passed at both viewports: B1, B3, B4 (WAV + MP3), B5, B6 (mock API), PERF-RES (31.9 / 0), and the status/transport part of B2. The B2 level clause was not measured.
- **A:** `a-round-391.md` opens with a STOP on the success clause. Everything else is implemented in 5 of the 6 granted files. Doc 251 is not written. Typecheck, lint and the 11-file covering set pass (A's logs).
- **Gate 391:** `skipped` (C FAIL). The baseline stays `11ca746`, plus A's round-391 tree (5 status lines), which round 392 continues.
- **Done status:** PERF-13b-ii is **not** done. Its browser rows passed, but the stage has an open Medium and unfinished rows (V2 rule).

## 2. Rulings
| ID | Ruling |
|---|---|
| D-29z1330 | Round 391 result; PERF-13b-ii stays in progress; A's tree is kept |
| D-29z1331 | The settle rule is decided by the owner controller (captured at call time as `ensureDecoded` does), not by the cache. Failure → unconditional `sourceFailed`; not aborted → conditional swap to `sourceReady`; aborted → no write. The same rule applies at both sites. `“X” is ready.` = the decode completed, not "held in memory" |
| D-29z1332 | Null owner → no loading write, no pin, no `ensureDecoded`; write `sourceNotLoaded` (the pre-391 text). Answers A's EV12 question |
| D-29z1333 | A superseded preview whose decode fails writes `sourceFailed` (EV23) |
| D-29z1334 | C-R391-02 and the reviewer's x3 title lookup → `deferred_low_polish`. The consumer, `ArrangementExportDialog.tsx`, is not granted (root's COPY-PD lane). The reviewer's MP3-window Low is fixed now as EV24 |
| D-29z1335 | WARNING-BEFORE-PLAYINGFROM is an accepted equivalent mutant; READY-ON-FIRST/SOME are retired; the mutant table is regenerated. SIG-R392-DECODE-SETTLE-HELPER is recorded |

**Why the STOP happened (retro input, not a lessons edit; RETRO 400 owns `lessons.md`):** B's round-391 success clause (l.68) named internal cache state instead of the observable that l.162 required. It was not traced through the eviction path (`releasePreviewPin` → `set` → `evict` before the caller's `.then`) before dispatch. A correctly stopped (L11).

## 3. Round 392 shape
- **Grants:** the same 6 paths (`b-round-391/grants-392.txt`). Real work is in `ArrangementContext.tsx` (two call sites, optional module-local helper), the eviction test file, and doc 251.
- **jsdom:** EV9 superseded rewritten to an exact `sourceReady`; EV9 stop; EV12 extended; EV23 (superseded failure); EV24 (MP3 window); EV25 (abort, record if the mutant is equivalent). The round-391 mutants re-run on the new rule.
- **C:**
  - new rows: B7 (the C-R391-01 repro), B8 (Preview → Space during the wait: `startPlaybackAt` calls `stopLibraryPreview()`, a browser-reachable Stop variant that C-391 thought had no UI), B9 (a superseded failure, with a delayed-failure helper in C's copy);
  - re-runs: B1–B4 and PERF-RES;
  - carried with cited evidence: B5/B6;
  - dropped explicitly: the B2 level clause, which round 391 left half-asserted and which this change does not touch.
- **Claims:** `b-round-391/claims-392.sh` K1–K24; planning output saved. Frozen manifest reused (0 failures); protected 11/11.

## 4. Consults
- **Advisor:** available and used after orientation, before writing. Effects: owner-controller success at both sites (not just the preview); the null-owner rule; a regenerated mutant table; an exact EV9 assert; the B8 variant; the B2 level clause dropped explicitly; C-R391-02 routed to the COPY-PD lane.
- **Project agents:** not called. This is a bug ruling on code B read directly. No new user-visible feature, so no product-designer consult and no reference section beyond round 391's.

## 5. Architecture
- ARCH-CHECKPOINT-DECODE-REGION is still unanswered. Round 392 is the tenth round in the region (381–392).
- Appended to it: SIG-R392-DECODE-SETTLE-HELPER (the reviewer's `decideDecodeSettle` extraction).
- **Request to root, repeated:** answer the checkpoint before PERF-13c (`b-round-383/root-request-arch-checkpoint-decode-region.md` + `b-round-388/root-request-arch-addendum-389.md`). This round permits only one module-local helper.

## 6. Order after round 392 (unchanged)
1. PERF-13c → 13d → 14 → 15;
2. SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM;
3. STEM-LANES → SYS-1…3;
4. STORE-2b…5;
5. REVIEW-RECOMMENDATIONS → T12-ADVANCED;
6. phase 2 (skip rule).

Other timing: the next regression is due on or after 2026-11-10; the next RETRO is at round 400.

## 7. Root notes
- **Still open for root:** ROOT-REQ-VITEST-PERF-INCLUDE, ROOT-REQ-L57-CHECK-PROGRESS, ARCH-CHECKPOINT-DECODE-REGION.
- **Ready for commit:** nothing. A's round-391 source changes are unverified (C FAIL) and stay in the tree for round 392.

## 8. Files written by B
- `tasks/round-391.md`: a copy of the round-391 task.
- `current-task.md`: round 392.
- `backlog.json` v359.
- `feature-status.md`.
- `b-next.json`.
- In `b-round-391/`: backups (`*-before-392`), checkpoint, grants, claims script and its planning output, update script with its `.done` marker.

No file in `store/` was changed by B.

**Advisor at close.** Three changes went into the task:
- **The aborted branch is now a tagged claim (K25).** On every collection change, the collection effect writes `copy.empty` or `loadingCollectionStatus`, which replaces `Loading “X”…`. EV25's expected text is now definite.
- **`collection` may join the two dependency arrays** if lint requires it.
- **EV24 has a binding assertion that needs no MP3 render mock.** There is none in the test file today.

The claims were re-run after the last edit: K1–K25; the planning output was re-saved.
