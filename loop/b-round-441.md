# B round 441 → 442 planning

**Date:** 2026-11-10.
**Advisor:** available. Consulted after orientation; its advice is applied below: bookkeeping first, rule the A/gate reviewer conflict from the file, stage SYS-3, prove the browser repro at HEAD, and use a delta review. It was consulted again before hand-off.
**Baseline:** gate 441 `published`, commit `5d81795` on both remotes (`gates/gate-round-441.json`). `context/head-sha.txt` still reads `047a0fc`, which is pre-publication. The store tree is clean at `5d81795`.

## 1. Round 441 result (independent evidence)
- `c-round-441.json`:
  - PASS, C1–C10;
  - `browserVerified` and `realVerified` true, 0 bugs;
  - the fake-bearer row is BLOCKED (backend unavailable in cloud), which does not make the round unverified.
- Gate 441:
  - published `5d81795` on both remotes;
  - review `COMMIT: OK`;
  - verify log `gates/round-441/verify.log`.
- **Accepted (D-29z1570).** SYS-1 is done (stages 1 and 2). GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR and GATE81-S2-UM8-SOURCE-TEXT are closed.
- **Conflicting reviewers, ruled from the file.**
  - A's code-reviewer says the outline-before-lanes order pin was dropped.
  - The gate reviewer says sibling relations are asserted.
  - B read the tests at `5d81795`. In the full state, PNR4 and DXC4 assert only `parentElement === overview`. Only OV-E1 (empty state) pins `lanes.previousElementSibling === baseline`. **A's reviewer is right.**
  - The finding becomes A-R441-REVIEW-L1-OUTLINE-ORDER: Low, origin B spec (B's sketch dropped a HEAD pin, an L4 slip), `deferred_low_polish`. The fix is one line plus a swap mutant. It is a RETRO-450 input.
- **Gate-441 Lows:**
  - Low 1 (file-wide `video.client` mock) becomes GATE441-L1-VIDEO-CLIENT-MOCK-FILEWIDE.
  - Low 2 (bounded poll instead of `waitFor`) becomes GATE441-L2-UM8B-POLL-LOOP.
  - Both are Low, origin B spec, deferred.
- **Architecture notes:**
  - A: none.
  - Gate: "decide per remaining Overview source pin". This becomes SIG-R441-SOURCE-PIN-RULING, a signal only and a RETRO-450 question, not scheduled.
- `user-review/` has no new decision file. `root-pre-push-review.md` and `publication-checkpoint.json` are old and were handled long ago.

## 2. Round 442 = SYS-3 stage 1 (D-29z1571)
- Task: `current-task.md`.
- Sketch v2: `b-round-441/sketch-442.patch.txt`, sha256 `0715fbdf…` (full value in `sketch-442.sha256`).
- **Closes on C PASS:** ROOT-R65-L5, A-R165-IME-ENTER and the unfiled sites of C-R200-02 (Detail range, Clip Gain, group rename).

**Inventory (L50):**
- The grep over `app/components/arrangement` finds 19 input/textarea/contentEditable lines. Seven of them are text-entry fields with a key handler (`inventory-inputs.txt`).
- Stage 1 = the BPM field, marker name, group name, Detail From/To and Clip Gain.
- **Stage 2** (queued, D-29z1571):
  - `focus-source.ts` M1/I1. Check that the AltGraph clause sits before the `ctrlKey`/`altKey` early return.
  - Library search: Escape clears and ArrowDown jumps while composing.
  - Shortcut-sheet search: Escape closes the sheet through `ui/Modal.tsx`'s document listener.
  - Modal has Store-wide consumers, so tech-lead decides between a Modal guard and a sheet-local capture guard at stage-2 planning.

**Real browser repro at HEAD** (`probe/ime-sites.mjs`, `probe/compare.py`):
- In Chromium, CDP `Input.imeSetComposition` followed by a real Enter or Escape keydown reaches the page with `isComposing: true`. That is a real composition state, not a synthetic `dispatchEvent`.
- HEAD fails 18 of 18 cells at 1440×900 and 1280×720 (`probe/compare-head.txt`).
- The sketch (served on :5176 from a `git archive HEAD` + patch copy, with its own cacheDir, stopped by PID) is `ALL OK (18 cells)` (`probe/compare-sketch.txt`).
- The follow-up plain Enter commits once the IME commit is emulated with `Input.insertText`.
- Probe lesson (recorded for C): a CDP composition stays open until text is inserted, so a plain Enter without `insertText` is still `isComposing: true`. The first run showed this, and the probe now handles it.
- The Detail panel starts collapsed at 1280×720, so the recipe expands it.

**B's runs:**
- new test file 11/11;
- 14/14 mutants red (`mutants/results.jsonl`, per-mutant logs);
- covering 60 files, 1114 tests;
- full suite on v1 and again on the dispatched v2: 274 files, 4041 tests, rc 0 (`precheck-full.log`, `precheck-full-v2.log`); scoped Biome on the 6 sketch paths rc 0;
- typecheck rc 0;
- lint 205 warnings (= HEAD).

**Review (`sketch-review.md`):**
- tech-lead v1: 0 Medium+, three Lows.
  - Low 1 is fixed by the browser evidence.
  - Lows 2 and 3 are fixed in v2: IME4 covers the To field, and the helper takes a structural type, so there is no cast.
- tech-lead delta v1→v2: 0 Medium+.
- Ruled:
  - R1: guard after `stopPropagation`, before `preventDefault`.
  - R2: keep keyCode 229 (Safari).
  - R3: blur mid-composition is out of scope.

**Platform half:** TLM-SYS3-IME-PLATFORMS (macOS/Windows IME, Safari, Android plain Enter), deadline RETRO 450 (L46). The Chromium half is verifiable here.

**Not applicable, with reasons in the task:**
- reference-first, `product-designer` and the screen budget (bug fix, no visible change);
- an Ableton reference (platform IME standard).

## 3. Order and checkpoints (D-29z1572)
1. SYS-3 stage 2.
2. REGRESSION-2026-11-13: first planning on or after 2026-11-13, ahead of anything else when due.
3. STORE-REDESIGN 2b…5.
4. ARCH-SPLIT (frontend-architect checkpoint through root first).
5. REVIEW-RECOMMENDATIONS.
6. T12-ADVANCED.
7. Phase 2 under the skip rule.

Next RETRO: round 450.

No new architecture-checkpoint request: one small helper and one-line guards in existing handlers. No owner carries accumulated structural risk from this round.

## 4. Commit readiness
- Round 441 is published (`5d81795`).
- Round 442 is not yet implemented, so nothing new is ready for root.

## 5. Artifacts (`b-round-441/`)
- Sketch:
  - `sketch-442.patch.txt` (v2) and its sha;
  - `sketch-442-v1.patch.txt` and its sha;
  - the delta;
  - `sketch-files/` and `sketch-paths.txt`;
  - `sketch-review.md`.
- Scope and claims:
  - `grants-442.txt` and `r442-frozen-sha256.txt`;
  - `claims-442.sh`, its planning output, the simulated after-A output and the expected diff (K2, K5, K6, K7 only).
- Test runs:
  - `covering-files.txt` and `covering-sketch.log`;
  - `precheck-full.log`;
  - typecheck and lint logs.
- Mutants: `mutants/` (runner with `SCRATCH`/`OUT` env overrides, results, logs; v1 in `mutants/v1/`).
- Browser: `probe/` (IME probe, compare, sketch server script, HEAD and sketch outputs, summary).
- Other:
  - `inventory-inputs.txt`;
  - `update-backlog.py` (applied, v427 → v428);
  - the `*-before-442.*` snapshots.
