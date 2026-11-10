# B round 435 → 436 planning (2026-11-10)

**Decision: CONTINUE.** Round 436 is **COPY-PD-VIS stage 1** (STUDIO-VIS-4 + SR-435-2 + STUDIO-VIS-6) on baseline `8233840`. Gate 435 skipped because the round changed no source.
- **Task and decisions:** `current-task.md`; D-29z1544 … D-29z1547; `backlog.json` is now v420.
- **Archive:** `tasks/round-435.md` is a byte-identical copy of the previous task. Nothing was deleted.
- **Pre-edit copies** are in `b-round-435/` (`*-before-436.*`). The checkpoint is `b-round-435/checkpoint.md`.
- **Advisor:** available, and used after orientation. Its points and how each was handled:
  - the third "source offset" place (inline status) is now granted;
  - the test-literal sweep covers `perf`/`e2e`;
  - no COPY-PD root patch is pending on the export dialog (no `cloud/root-commits/`);
  - VIS-7/VIS-10/lane-handle state rulings → their own stage;
  - the accessible-name ruling;
  - B checked the 11 `systemic_task` tags itself.
- **Consults:** `tech-lead` reviewed the sketch (`b-round-435/sketch-review.md`, approve-with-lows). `product-designer` was not called: the copy is its own audit, and Saba approved it. `ableton-arrangement-expert` was not called: the reference comes straight from the Live 12 manual §8.2.1 via WebFetch.

## 1. Round 435 result (B's own checks)
- **C's result:** `c-round-435.json` PASS, 0 bugs, `browserVerified`/`realVerified` true.
- **B's re-runs:**
  - `tools/l57-check.py` gives L57 OK (`b-round-435/l57-check-c435.txt`).
  - C's RT-IDS was partial. B checked all 11 ids of SYS-R435-SOURCE-SCAN-HELPER and each carries the tag.
- **RETRO 435 is verified** (D-29z1544).
- **Cold-dev hydrate recurrence:** recorded as `confirmedBy` on C-R425-01-RVM-COLD-DEV-EMPTY, not as a new id (L7).
- **Gate 435:** skipped (no real changes), HEAD `8233840`.

## 2. Round 436 (D-29z1545…1547)
- **Split:** COPY-PD-VIS is split with the scope unchanged.
  - **Stage 1** has the two Mediums (pure copy, with a finished sketch).
  - **Stage 2 (437)** has VIS-7 (filled brass Export: hover, active, disabled, busy, ring-on-brass contrast), VIS-10 (CZABA link: arrow colour, hover, NarrowScreen ruling) and SABA-LANE-RESIZE-HANDLE (thin line inside the hit area, drag fill, sibling handles, "Why we missed it" + a lesson merged into L61).
  - The COPY-PD "filled primary" sub-item is delivered by VIS-7.
- **Sketch** `b-round-435/sketch-436.patch.txt` (sha `4bb19dd1…`):
  - 4 literals in `strings.ts`, the inline move/trim status in `ArrangementClip.tsx`, and 24 assertion lines in 8 test files.
  - Covering run: 8 files, 208/208.
  - **Full vitest on the sketch: 272 files, 4018 tests, rc 0.** Typecheck rc 0; lint 205 warnings (same as HEAD).
  - Mutants: 5 of 5 red.
  - Chromium probe, HEAD :5173 vs sketch :5174 (own cacheDir, stopped afterwards): every box is identical at both viewports. "source offset" appears 11 times at HEAD (states: empty, selected, after move, after trim) and 0 times on the sketch (`b-round-435/probe/compare-raw.txt`). The persistent line counts are equal on HEAD and the sketch (`b-round-435/screens/compare.txt`).
- **Rulings:**
  - Accessible names stay as they are: the `aria-label` with "(seconds)" wins.
  - Label-in-name was already unmet at HEAD: TL-R436-03 (deferred).
  - The inline literal moves to `strings.ts` later: TL-R436-02 (deferred).
- **Reference:** Live 12 §8.2.1. Two deviations:
  - "Clip origin" is Saba-approved.
  - The bare unit is still Saba's Q4 (`awaiting_user`, L44).
- **Claims:** `b-round-435/claims-436.sh`, run after the last edit (`claims-436-planning-output.txt`; stderr is empty). `l58-check` gives L58 OK.

## 3. Order after round 436
1. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13, with REG-PERF-FULL-SUITE.
2. COPY-PD-VIS stage 2 (437).
3. SYS-R435-SOURCE-SCAN-HELPER.
4. SYS-1.
5. SYS-3.
6. STORE-REDESIGN 2b…5.
7. ARCH-SPLIT. Its first stage needs a frontend-architect checkpoint through root.
8. REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4, VIS-3/5/8/9).
9. T12-ADVANCED.
10. Phase 2, under the skip rule.

STEM-LANES jumps ahead as soon as Saba answers. Next RETRO: round 450.

**Architecture checkpoint:** no new request this round. ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS stays open with root, and ARCH-SPLIT's first stage will need it. A copy round adds no structural risk.

## 4. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Open work remains: COPY-PD-VIS 1–2, SABA-B-12 stage 4, SYS-R435, SYS-1/3, the STORE stages, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 queues, STEM-LANES (Saba), SRW-21 (deferred_user) and the deferred Lows.
- **Not BLOCKED.** Every round-436 row runs in the cloud except the fake-bearer backend row.

## 5. Readiness for commit
- Round 435 was code-free, so there is nothing to publish.
- This planning wrote only loop artifacts. The store tree is clean at `8233840`.
- The scratch `/tmp/b436` is outside the store, and its vite config was restored. The :5174 server is stopped; only root's :5173 runs.

## 6. Close review (advisor) fixes
- **C10's allowed deltas** now come from B's claims run on the sketch scratch (`claims-436-sketch-output.txt`, `claims-436-planning-vs-sketch.diff.txt`), not from a typed list (L56).
- **C4's recipe** sets From 1 / To 2 before the move, while the clip is at 00:00.000. B ran it at HEAD and on the sketch; the readout is identical.
- **The trim step is now probed.** It grabs the clip 4 px above its bottom edge, so it misses the fade handle at 1280. Status text is measured on HEAD and on the sketch.
- **C6** measures the footer overflow, including the longest trim text. **C7** cites the HEAD and sketch line counts (`screens/compare.txt`).
- **`mutants/run.py`** now creates its output folder. The mutant results are unchanged.
- **K25:** the STEM-LANES answer check now uses round 435's method and still gives 2 (unanswered).
