# B round 440 → 441 planning

**Date:** 2026-11-10.
**Advisor:** available, consulted after orientation (premises to prove on a scratch copy: SSR state for OV1, the UM8 render branch, collisions, mutant set) and again before hand-off.
**Baseline:** gate 440 `published`, commit `047a0fc` (`gates/gate-round-440.json`; its `head` field `efd71f6` is the pre-commit parent).

## 1. Round 440 result (independent evidence)
- `c-round-440.json`:
  - PASS, C1–C10;
  - `browserVerified` and `realVerified` true, 0 bugs;
  - the fake-bearer row is BLOCKED (backend unavailable in cloud).
- Gate 440: published `047a0fc`; review COMMIT OK 9/10; verify 273 files / 4029 tests.
- **Accepted (D-29z1567).** SYS-1 stage 1 is done. RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS and C-R127-L1f-SELF-COMPARE-TESTS are closed.
- **Gate-440 review Lows:**
  - L1 (redundant assertion) and L2 (two literal pins): the reviewer says no fix is needed (intended).
  - L3 (Detail label allowlist): GATE440-L3-DETAIL-LABEL-ALLOWLIST, Low, `deferred_low_polish`, origin B spec.
- **A's reviewer nits 4/5:** A-R440-REVIEW-L4-L5-LRS3-NITS, Low, `deferred_low_polish`, origin B spec (the sketch held them).
- **A's Architecture note:** "the other `className).toBe(` pins could be a stage 3". Recorded as a backlog signal only (`sys1_other_classname_pins`, RETRO-450 question), not scheduled.
- `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and were handled long ago. `user-review/` has no new decision file.

## 2. Round 441 = SYS-1 stage 2 (D-29z1568)
- Task: `current-task.md`.
- Sketch v3: `b-round-440/sketch-441.patch.txt`, sha256 `8b53e26d…`.
- **Closes:** GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT.

**Premises proved on a scratch copy before writing:**
1. **The SSR of `/studio-lab` is empty** (`data-overview-state="empty"`), so the outline overlay is not in the html OV1 renders. OV1's source pin therefore cannot become an SSR testid check. The overlay's exact class set moves to the rendered PNR4 (ruling S2-R1). OV1 now asserts the empty SSR state (0 outlines).
2. **UM8's dialog branch** (`usedVideoSources.length > 0`) was rendered by no test (K24 at round 440). UM8b reaches it by mocking `video.client` and importing a file; jsdom falls back to computing peaks on the main thread. The run takes 2.5 s against a 20 s describe timeout.
3. **L23 collision:** the full suite on sketch v1 failed `overview-visibility-ui.test.tsx` OV-E1, which asserted that the positional `children[1]` has no testid (`b-round-440/precheck-full-v1.log`). That file is granted and rewritten against the hooks.

**Review:**
- tech-lead found 0 Medium+ on v2.
- v3 fixes (a), (b), (c) and (f).
- (d), (e) and (g) are ruled, and tech-lead accepted them along with the delta.
- (h) is accepted as a Low.
- Details: `b-round-440/sketch-review.md`.

**B's runs on v3:**
- full suite 273/4030 rc 0;
- covering 12 files, 267 tests;
- typecheck rc 0;
- lint 205 warnings (= HEAD).

**Mutants** (`b-round-440/mutants/results.jsonl`, 30 lines):
- U2 shows that HEAD's UM8 was vacuous: it is green at HEAD and red on the sketch.
- D1/D1H show that the new selectors survive an added overlay.
- O2 is the ruled drop.

**Browser:**
- B ran the probe on a second dev server with the sketch (port 5176, its own Vite `cacheDir`).
- Hooks are correct at both viewports (`probe/hooks-check-sketch.txt` ALL OK; HEAD fails the same check).
- The 4 Overview element shots are 0 px against HEAD (`probe/pxdiff-sketch.txt`).
- Full-window shots on the sketch server showed 10–34 px of noise outside the Overview between two of its own runs (HEAD vs HEAD on :5173 is 0 px), so that comparison is record-only (`probe/pxdiff-full-window.txt`).

**Process note (truthful):**
- While stopping the 5176 server, B ran a `pkill -f` pattern that also matched B's own shell, which exited (code 144).
- Root's :5173 server stayed up (checked 200 right after), and the 5176 server was gone.
- No store file changed. The scratch `vite.config.ts` was restored before any further run.

**Follow-ups after the advisor's hand-off review:**
- **C6 renders HEAD in C's own job** (harness rule D-29z741, now archived but still in force: sameness means 0 px against HEAD rendered in the same job).
  - Helper: `probe/head-server.sh` (git archive HEAD, port 5177, its own cacheDir; it stops by the listening PID, never by `pkill -f`).
  - B validated the recipe: sketch shots vs the in-job HEAD server are 0 px on all 4 Overview shots, and the checker reports ALL OK (`probe/pxdiff-head-5177.txt`).
  - B's stored shots are reference only.
- The persistent-text-line clause was removed from C6. Data attributes add no text, and the pixel rows cover the Overview.
- **L31:** the worst loaded covering test is 37 % of its timeout (`l31-headroom.txt`).
- **L28:** no `In Progress (stage` doc belongs to SYS-1, and doc 286 is `Completed`.
- **Probe version:** the sketch-server browser probe ran on v2. The `ArrangementOverview.tsx` hunk is identical in v2 and v3 (K30).
- **Id rename:** the planning Low is named `TL-R440-UM8-GROUP-MUTE` (a tech-lead finding at planning, L7). `update-backlog.py` still shows the first name; the backlog, task and review use the new one.

## 3. Rulings
- **S2-R1:** OV1 no longer pins the overlay token order. The exact set is in PNR4. The PANEL source list still pins the string.
- **S2-R2:** these Overview source reads stay: PNR2/PNR4 counts and the PANEL list, the content-colour scans, studio-focus-ring, and strings ST27. Recorded for RETRO 450.
- **S2-R3:** UM8's source asserts are replaced by the rendered UM8b. Group Mute in the dialog is TL-R440-UM8-GROUP-MUTE (Low, deferred).

## 4. Order and checkpoints (D-29z1569)
1. SYS-1 closes with round 441.
2. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13 (`regression-last.json`: 2026-11-10, round 425).
3. SYS-3.
4. STORE-REDESIGN 2b…5.
5. ARCH-SPLIT (frontend-architect checkpoint through root first).
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2 under the skip rule.

Next RETRO: round 450.

No new architecture-checkpoint request: this round adds data attributes in one owner file plus tests.

## 5. Commit readiness
- Round 440 is published (`047a0fc`).
- Round 441 is not yet implemented, so nothing new is ready for root.

## 6. Artifacts
All of them are under `b-round-440/`:
- the sketch v1–v3 and the delta;
- the reviews;
- `claims-441.sh`, with its planning output, the simulated after-A output and the expected diff;
- the mutants;
- the probe (head, head2, sketch, sketch2);
- the grants and the frozen manifest;
- the pre-move snapshots (`*-before-441.*`).
