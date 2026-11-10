# B round 436 → 437 planning (2026-11-10)

**Decision: CONTINUE.** Round 437 is **COPY-PD-VIS stage 2** (STUDIO-VIS-7 + STUDIO-VIS-10 + SABA-LANE-RESIZE-HANDLE) on baseline `69de9bd`, which gate 436 published.
- **Task and decisions:** `current-task.md`; D-29z1548 … D-29z1553; `backlog.json` is now v422.
- **Archive:** `tasks/round-436.md` is a byte-identical copy of the round-436 task. Nothing was deleted.
- **Pre-edit copies** are in `b-round-436/` (`*-before-437.*`). The checkpoint is `b-round-436/checkpoint.md`.
- **Advisor:** available, and used after orientation. Its points and how each was handled:
  - gate-436 review read: two Lows, already TL-R436-02/03, recorded as `confirmedBy`;
  - Saba answers re-checked: none (K23);
  - the direction decision exists and is already recorded;
  - SR-435-2 is closed where it lives (`screen_review_candidates`);
  - class pins found by a full run on the sketch, not by grep alone;
  - sibling handles ruled;
  - the paint is measured in the browser, not read from tokens;
  - the "Why we missed it" lesson is merged into L61.
- **Consults:**
  - `product-designer`: state rulings, siblings, C rows.
  - `tech-lead`: frozen-sketch review, approve-with-lows (`b-round-436/sketch-review.md`, sha `88259112…`).
  - `ableton-arrangement-expert`: not needed. Live 12 manual §6.9 was read directly with WebFetch, and it says nothing about hover paint.

## 1. Round 436 result (B's own checks)
- **C's result:** `c-round-436.json` PASS, 14 rows, 0 bugs, `browserVerified`/`realVerified` true.
- **B's re-run:** `tools/l57-check.py` gives L57 OK (`b-round-436/l57-check-c436.txt`).
- **Gate 436:** published `69de9bd` to both remotes.
- **Now done:** STUDIO-VIS-4, STUDIO-VIS-6 and SR-435-2 (D-29z1548).
- **Still open:**
  - Q4 / SR-435-1 is still `awaiting_user`;
  - the fake-bearer row stays open evidence (backend unavailable in cloud).
- **A's naming note** becomes SIG-R436-CLIP-ORIGIN-NAMING: a signal, not scheduled.

## 2. Round 437 (D-29z1549…1552)
**The sketch:** `b-round-436/sketch-437.patch.txt`, 5 components and 7 test files.
- **Full suite on the sketch: 272 files, 4019 tests, rc 0.** Typecheck rc 0; lint gives 205 warnings, the same as HEAD. Covering set: 8 files, 106/106.
- **Mutants:** M1–M12, each red; the sketch is green.

**Chromium probe**, HEAD :5173 against the sketch on :5174 (its own cacheDir; stopped afterwards), at 1440×900, 1280×720 and the 800 px narrow screen:
- **Export button:** rest brass rgb(201,164,106); hover rgb(217,184,127); pressed back to base; busy at opacity 0.7 with `aria-busy`. Label on fill 8.32:1; ring on the panel 5.45:1. The box is equal to HEAD.
- **Exit link:** the word is foreground; the arrow is muted and lights up on hover. The boxes are equal to HEAD.
- **Lane hairline:** in the hover pixel column only the border row changes (HEAD painted 6 rows). While dragging the line reads `/0.4`.
- **Detail separator:** a light row directly under the border.
- **Screen budget:** equal, 138/168/118/144, with 0 text differences.

**Two findings from B's own pre-check, applied in the sketch:**
- The drag hairline lost to `hover:` under pointer capture, so the hover class is now swapped out while dragging.
- `cursor-progress` did nothing, because the unlayered `button { cursor:pointer }` (app.css l.482) overrides it. It was dropped, and the rule is recorded as B-R437-BUTTON-CURSOR-UNLAYERED (Low, pre-existing, deferred).

**Lows and the lesson:**
- TL-R437-01 and TL-R437-03 are deferred.
- TL-R437-02 is fixed by the doc-284 note in this round.
- TL-R437-04 is already done (B ran the full suite on the final sketch).
- The architecture note becomes SIG-R437-SEPARATOR-HAIRLINE.
- "Why we missed it": L61 gains the clause "Hover and drag paint on a hit area" (D-29z1551). `lessons.md` stays at 60 lines.

**Claims:** `b-round-436/claims-437.sh`, run after the last edit, both at HEAD and on the sketch scratch. Stderr is empty, and `l58-check` gives L58 OK.

## 3. Order after round 437
1. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13, with REG-PERF-FULL-SUITE.
2. SYS-R435-SOURCE-SCAN-HELPER.
3. SYS-1.
4. SYS-3.
5. STORE-REDESIGN 2b…5 (direction A is decided).
6. ARCH-SPLIT. Its first stage needs a frontend-architect checkpoint through root.
7. REVIEW-RECOMMENDATIONS: SABA-B-12 stage 4 / VIS-3, VIS-5/8/9, and COPY-PD minus "filled primary".
8. T12-ADVANCED.
9. Phase 2, under the skip rule.

STEM-LANES jumps ahead as soon as Saba answers. Next RETRO: round 450.

**Architecture checkpoint:** no new request this round. COPY-PD-VIS stage 2 is a visual class change on separate owners. ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS stays open with root, before ARCH-SPLIT.

## 4. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Open work remains: COPY-PD-VIS stage 2 (437), SABA-B-12 stage 4, SYS-R435, SYS-1/3, the STORE stages, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 queues, STEM-LANES (Saba), SRW-21 (deferred_user), and the deferred Lows, which must be fixed before final acceptance.
- **Not BLOCKED.** Every round-437 row runs in the cloud except the fake-bearer backend row.

## 5. Readiness for commit
- Round 436 is already published (`69de9bd`). Round 437 publishes after C PASS and the gate.
- This planning wrote only loop artifacts. The store tree is clean at `69de9bd` [K2].
- The scratch `/tmp/b437` is outside the store, and its vite config was restored. The :5174 server is stopped; only root's :5173 runs.

## 6. Close review (advisor) fixes (D-29z1553)
- **Two rows were never run on the sketch.** B ran both on HEAD and the sketch with `probe/press-export-probe.mjs`:
  - **Real WAV export:** 29189420 bytes, `RIFF`/`WAVE`. The button returns to "Export WAV" at opacity 1.
  - **Lane press rows:** a press 1 px and 5 px above the border drags on both trees. A press on the border row drags on the sketch only; on HEAD it hit the lane `DIV`. This is ruled as "the line you see is the line you grab": the pointer area grows from 6 to 7 px, and the box is unchanged.
- **"No loop-fixable Medium" was imprecise.** It is reworded. STUDIO-VIS-5 and SABA-B-12 stage 4 are parked in REVIEW-RECOMMENDATIONS by Saba's "defer"; claim K14c lists every open Critical/High/Medium.
- **K14 no longer prints the location column,** because the optimizer archives done ids between B and C.
- **The band's origin is corrected.** It came in with commit `08b9e53` (2026-10-13); round 175 only recoloured it (K27). The task, L61's evidence and `feature-status.md` are updated.
- **L31 headroom** of the covering set on the sketch: at most 15 % (`b-round-436/l31-headroom.txt`, K26).
- **L28:** 12 `In Progress (stage` docs exist, none of them a COPY-PD-VIS doc (K28).
- **Round-436 cross-check:** C's `copy-probe.json` equals B's sketch output, and the mutant outcomes are equal (`b-round-436/recheck-436.txt`).
- **Saba note** on the Detail separator: `user-review/note-round-437-detail-separator.md`; also in `feature-status.md`'s Tech Lead list.
- **K9** now checks `to="/"`.
- **Claims** were re-run on HEAD and on the scratch (stderr empty), and the diff was regenerated; `l58-check` gives L58 OK.
