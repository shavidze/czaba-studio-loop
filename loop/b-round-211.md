# B: Round 211 → 212 planning (D-29z195 … D-29z199)

Date: 2026-10-27.
- **Advisor:** available. Used once before writing the task. All 8 points were applied: the L23 scratch run of the detail changes; a pre-ruling on the release-commits move; geometry-honest replacements for WG1/WG2/WZ1; wider PIX coverage; SABA-B-5 closes only on C's production result; the rejected option recorded; a queue D-ID; housekeeping. Used again at the end.
- **Consults:** `performance-optimizer` and `tech-lead`, both read-only. Policy requires both before each PERF task.

## 1. Inputs read
- **Round 211 task.** `current-task.md` (round 211), archived as `tasks/round-211.md`. `cmp` shows it identical; no archive existed before.
- **Round 211 reports:**
  - `a-round-211.md` (DEVIATIONS 1–5, Architecture note);
  - `c-round-211.md` and `c-round-211.json`;
  - `gates/gate-round-211.json`: **published**, commit `28a274c` on both remotes. Its `head` field `180dd2e` is the pre-commit HEAD. The baseline for round 212 is `28a274c`, and the tree is clean;
  - `gates/round-211/review.md` (8.5/10, S1–S6, Architecture note).
- **Loop state:**
  - `context/active-summary.md` (open findings by id) and `lessons.md`;
  - `backlog.json`, by id;
  - `regression-last.json`: round 199, so the next regression is due on or after 2026-10-30.
- **Source, read-only:**
  - `ArrangementClip.tsx`: `buildPeakShape` (l.246–278) and `ArrangementPeakPath` (l.279–320);
  - `ArrangementDetailPanel.tsx`: l.86–95, 180–380, 500–545, 700–720 and 975–1030;
  - `StudioWorkspace.tsx`: l.437–456 and l.2160–2192;
  - `ArrangementRuler.tsx`: l.90–104;
  - `waveform-zoom.ts`;
  - `perf/studio-lab.perf.spec.ts`, the setup and drag helpers.

## 2. Acceptance results used (independently evidenced by C)
- **C round 211: PASS on 12 rows.** `browserVerified: true`, `realVerified: true`. Gate 211 published `28a274c`.
  - **PERF-FADER-b is done (მზადაა).**
    - A Clip Gain move now commits 3 components, where it used to commit 95.
    - Window max is 3, members N + 1, restarts 0.
    - The export of a dragged mix is bit-identical to the same mix set by typing.
    - The behaviour is identical to `180dd2e`: 49 compared states, 0 differences.
  - **Closed (D-29z196):**
    - C-R210-01, from C's note and DOC-211;
    - GATE210-S1, from DOC-211;
    - GATE210-S2, from AN-REVIEW-211;
    - GATE210-S5, from LIVE-DISPLAY-211 (no snap-back).
  - **GATE210-S3 was not done.** It stays deferred as A-R209-REVIEW-L-WRITE-ALL-TRACKS.
- **SABA-B-5 stays open (Medium).** Single-clip wall-clock in C's record rows (C-R211-02) is p95 18.1 / 18.6 ms stopped and 59.7 / 58.1 ms playing, against the < 16 ms target.
- **Not used as acceptance:** A's own runs, the gate rows, and B's own diagnostic. B's diagnostic is planning evidence only.

## 3. Rulings on C's findings
- **C-R211-01 (Low):** fix now, in round 212. It is in the same owner and costs little (D-29z198).
- **C-R211-03, the DEVIATIONS (D-29z196):**
  - **DEV1, accepted:** the members scenario adds Soft impact, because `/studio-lab` has one audio clip; C verified it.
  - **DEV2, accepted:** the leaves live in granted files, and the new files are a permitted subset.
  - **DEV3:** this is C-R211-01.
  - **DEV4, accepted:** +0.5 ms on the wall-clock liveness rows. The identity list covers deterministic rows only, and the `≥ 30` assert passes.
  - **DEV5, accepted:** the setter-loop override cannot be reached mid-gesture. The restart path is proven by CP7/CP8 and by C's AUDIO-211 (c).
- **C-R211-04 (info):** the premise "video lanes draw no waveform" was wrong. Round-212 §4 corrects it.
- **The gate-211 suggestions:**
  - **S1:** round 212.
  - **S2:** goes to the checkpoint; `ArrangementContext.tsx` is frozen in round 212.
  - **S3, S4, S5:** moved to `deferred_low_polish` (now 315 entries). S4's natural owner is PERF-1b.
  - **S6:** round 212 grants doc 166 l.4. This is the sixth L28 miss, a signal for RETRO 215.

## 4. Planning measurement (B, `b-round-211/diag/`)
**Method:** dev server, 1440×900, single clip, the harness's move-to-paint method, 2–3 runs per case.

| Case | stopped p95 (ms) | playing p95 (ms) |
|---|---|---|
| as-is | 14.4–21.7 | 23.2–45.9 |
| lane svgs hidden | — | 6.0–6.9 |
| detail svg hidden | — | 15.9–16.2 |
| all playheads hidden | — | 45.8–47.2 |
| `will-change: transform` on the svgs | 35.6–38.9 | 56.7–58.6 |
| one outline path (rewritten in the page by a MutationObserver) | **6.4–7.7** | **8.8–10.5** |

- **Trace:** RasterTask 1,730 ms against Commit 372 ms over one playing drag.
- **Pixel diff, rect path vs outline at rest** (`pixdiff.json`):
  - lane: max channel delta 2;
  - detail: max channel delta 5;
  - 0 pixels with a delta > 8, at 1440 and 1280. At 1280 the lane only; the detail panel is collapsed there, so C covers it expanded.
- **L23 scratch runs** (`git archive` into `/tmp`; the store was not touched):
  - the outline format gave **3 red tests, all literal pins** (WZ1, WG1, WG2), and 2,203 green;
  - the detail-block changes (render-phase sync and the stored-gains prop) gave typecheck and Biome clean, and 154 files / 2,223 tests green.

## 5. Consults (summaries)
- **performance-optimizer:**
  - recommended, in rank order: svg layer promotion, the playhead moved by transform, then canvas;
  - excluded scaleY, crispEdges and fewer columns, because they change pixels;
  - **B's measurement refutes the first two:** promotion is worse, and hiding the playheads gave no gain. Recorded as B-R211-LAYER-PROMOTION-REJECTED. Canvas is not needed.
  - Its warning that a fixed 16 ms target is hard with software raster is kept in mind. The outline experiment shows 16 ms is reachable here, so the user's number stays the closure criterion, measured on C's production runs.
- **tech-lead:**
  - C-R211-01: use the React render-phase state adjustment, not the commit handler.
  - S1: a `storedClipGainsDb` prop, index-aligned, with `detailGroup.clipGainsDb`.
  - Leave `ArrangementContext.tsx` untouched; S2 goes to the checkpoint.
  - It named the tests that pin the text sync; the scratch run shows them all green.
  - **B added one correction:** the leaf's ids come from `clipGainGroup` (l.701–703), not from the span group, so the prop must be aligned with `clipGainGroup`.

## 6. Decisions
- **D-29z195:** the frontend-architect checkpoint request is written (`b-round-211-checkpoint-request.md`). This fulfils D-29z188. It is non-blocking.
- **D-29z196:** round 211 is accepted; closures and rulings as in §2 and §3; doc 166 l.4 is granted.
- **D-29z197:** PERF-FADER-c. The peak path becomes one outline with the same geometry, and the geometry is pinned through a parser plus the legacy formatter for the WG2 sha. SABA-B-5 closes only on C's LATENCY-212 (< 16 ms, stopped and playing).
- **D-29z198:** C-R211-01 and S1 are in round 212. The clip-gain `release-commits` rows are pre-ruled to change from 2 to 1.
- **D-29z199:** PERF-FADER-c is inserted before PERF-1b, because SABA-B-5 is the open Medium under the bug gate.

## 7. Round 212 summary
- **Scope:** 7 grants and 2 new files; the frozen list has 1,050 files (rc 0).
- **Why A cannot meet a surprise grant:** both mandatory code changes were scratch-run against the whole arrangement suite.
- **C rows:** SCOPE, LATENCY (the closure row), PERF-RUN, PIX, RELEASE, SYNC, WAVE-LIVE, EXPORT, DOC, AN-REVIEW, G212-3.

## 8. Not scheduled / unchanged
- **Regression:** due on or after 2026-10-30 (`regression-last.json` is unchanged).
- **RETRO:** at round 215 or at the end of STUDIO-PERFORMANCE.
- **Saba questions:** unchanged; see `b-round-210.md` and earlier.
- **Commit-ready:** round 211 is already published. Round 212 is ready for the gate after C PASS.
