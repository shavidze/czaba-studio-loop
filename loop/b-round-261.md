# B — round 261 → 262 planning

**Date:** 2026-10-30. **Role:** B (planning artifacts only; no app source touched). **Decisions:** D-29z530…D-29z538. **Advisor:** available and used before writing (order of work, the placement reading, the measured bounds, the L23 pre-check, the SIG reconsideration). A second advisor call is made after the artifacts are written.

## 1. Inputs read
- `tasks/round-261.md`: archived in this step as an exact copy of the old `current-task.md` (`cmp` equal). The before-copies are in `b-round-261/`.
- `a-round-261.md`: implemented, no STOP. It raised 3 spec tensions and a reviewer Architecture note.
- `c-round-261.md` / `c-round-261.json`: **PASS**, 10/10 rows, `browserVerified` and `realVerified` true, 0 bugs, 5 info notes (N1–N5).
- `gates/gate-round-261.json`: `published`, commit `10e1cd4`, which is the baseline. `gates/round-261/review.md`: COMMIT OK, score 9/10, 5 suggestions plus an Architecture note.
- `regression-last.json`: round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is **not due**.
- `root-pre-push-review.md` and `publication-checkpoint.json`: no new remaining findings since the last planning.
- The Live 12 manual, fetched with WebFetch: Mixing §18.1/§18.1.1/§18.4 and Arrangement View §6.1/§6.15. The root transcript `reference/youtube/SABA-B-9-10-11-transcripts.md` (riOD 0:51).

## 2. Backlog updates (from C's evidence only; script `b-round-261/update-backlog.py`)
- Round 261 → done. PERF-HARNESS-STRINGS-DRIFT → done. C-R260-01/02 → closed. `retro_runs` 260 → done (D-29z530).
- Round 262 dispatched. The SABA-B-9 stage status is updated.
- Gate-261 suggestions (D-29z536):
  - S1 (needle guard) and the adapter keep-note → `architecture_signals`;
  - S2, S3, S4 → `deferred_low_polish` (perf test code, Low). The list grows from 430 to 433;
  - S5 (`test:perf` as a gate smoke) is already a Saba proposal (retro-260 §12).
- C's notes (D-29z537): N1 and N2 → `retro_candidates` for RETRO 275; N3 → SIG-R261-INLINE-LABELS; N4 → root note; N5 → watch.
- New Saba question **SABA-Q-9-MASTER-ROW** (`awaiting_user`).
- GATE257-NARROW-TOOLBAR-OVERLAP is not folded in (D-29z534).
- `feature-status.md`: the header line, a new round line, and the SABA-B-9-10-11, RETRO and RETRO-systemic rows. Only C-evidenced items move to მზადაა: PERF-HARNESS-STRINGS-DRIFT and RETRO 260.

## 3. Rulings on round 261's spec tensions (confirming C)
1. **Templated step strings vs PERF-SWEEP:** accepted. The values are byte-equal in the real run.
2. **Fixture literals equal to `strings.ts` values:** accepted. "No copies" is the meaning; future wording follows C-R261-N2.
3. **`rangeLabelEnd`:** a parser, not a locator. It joins SIG-R261-INLINE-LABELS as the 7th inline pattern.

## 4. Round 262 decision (D-29z531…D-29z533)
- **Task:** SABA-B-9 stage 2, fixed in advance by task 261 §4.
- **The uncertain contract: where "the bottom-right corner" is.** Smallest honest behaviour (D-29z532): the existing footer's last row, directly left of `Shortcuts ?`.
  - Rationale: Saba approved a *move* to the bottom-right corner, and "the only position moves approved".
  - The literal Live form, a Main-track row (manual §18.4 "bottom end of the Arrangement View"), adds an always-visible strip and moves the lane geometry. Under L39 that is a Medium without approval, so it goes to Saba as SABA-Q-9-MASTER-ROW (a), per L43/L44.
  - `Shortcuts ?` keeps its corner, because it is not approved to move (L4: one element, one rule). Swapping them is question (b).
- **Measured bounds (L3):** B's probe at `10e1cd4` and a DOM-move sketch (`b-round-261/probe/`):
  - the header stays 35;
  - the footer grows exactly 4 px in every state (empty or clip 49 → 53; range 69 → 73), because the Master row is 20 px and the footer row was 16 px;
  - the scroller loses 4 px;
  - 0 overlaps and 0 overflow at 1440, 1280 and 1024.
  - The task rules +4 px ±0.5, and forbids resizing the `M` button.
- **L23 pre-check:** the scratch `tmp/b261-scratch` has the full sketch (move + `studioMasterStrings` + perf allowlist) applied. 23 test files gave 3 red (master-ui l.623, meter-ui l.535, studio-theme-obsidian TH9 l.311); all 3 are granted with "no assertion lost". `tsc` rc 0; Biome clean. `perf/**` has hits only in the 2 granted files, and `e2e/**` has 0.
- **SIG-R261-INLINE-LABELS (D-29z533):** this round owns `ArrangementMaster`, so its 3 labels move to `strings.ts` and leave the perf allowlist (6 → 5). The Transport, Lane and DetailPanel labels stay signals, because those files are not granted.
- **Reference-first:** §1 of the task has R1–R7 with manual quotes and sections. D1–D4 are listed deviations, and each is part of the one Saba question. R6 (cursor/hover) is "no reference found" in the text read.
- **Real behaviour rows:** AUDIO uses the real master meter (`data-level-db`) while playing; PERF-RUN is the real Chromium harness, alone (L38); G262-AUTH guards the purchase protection, and `/studio-lab` opens anonymously.
- **After the second advisor call (fixes applied before handing over):**
  - FOCUS-KEEP became a unit row with a mutant. A browser pointer press on any footer-changing target moves focus by itself, so the browser cannot isolate a remount.
  - The HEAD side of "same as HEAD" rows is B's stored probe plus the unchanged unit rows; an optional HEAD-app recipe (`git archive`, port 5174, `BASE=`) is stated.
  - TAB-ORDER is pinned to the empty project, because Undo becomes a stop once a clip exists.
  - A `Why we missed it` section was added (lesson L43 already exists; row LESSON), and the PLACE gap is written as 16 ± 0.5.
- **All `store/` facts are tagged [K1]–[K10].** B re-ran each command at `10e1cd4` before handing over.

## 5. Queue (unchanged order)
Round 263 = REGRESSION if the planning is on or after 2026-11-02; otherwise L46-CONTRACT-CHECKS. Then:
- SABA-B-11c (`ableton-arrangement-expert` consult first) and SYS-6;
- SABA-B-7 when Saba answers `AGREE-SABA-B-7.md`; SYS-5; STUDIO-PERFORMANCE b-ii;
- STORE-REDESIGN 2b–5 (`direction-decision.md` is still absent, so STORE-2+ waits); REVIEW-RECOMMENDATIONS; T12-ADVANCED;
- the phase-2 entries (PHASE2-VIDEO-SCORING is gated on the user's go-ahead);
- the deferred Lows before final acceptance.

## 6. Architecture checkpoint
SABA-B-9 reaches its feature boundary. B wrote one bounded addendum, `b-round-261-checkpoint-addendum.md` (question 8: footer extraction and label ownership), to the pending ARCH-CHECKPOINT-TRANSPORT-POSITIONS. It is non-blocking, and there is no new request.

## 7. Commit readiness
- Round 261 is published (`10e1cd4`).
- Round 262 is commit-ready only after C PASS and the root gate.

## 8. Decision
**CONTINUE.**
- **Not COMPLETE:** scoped features remain (§5): SABA-B-9 stage 2, SABA-B-11c, L46, SYS-5/6, STUDIO-PERFORMANCE, STORE-REDESIGN, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries and the deferred Lows.
- **Not BLOCKED:** round 262 needs no credentials or approval. The dev server is up (200), and the backend is not needed.
