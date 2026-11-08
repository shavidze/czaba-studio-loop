# Sketch review (B round 398 → 399 planning). Reviewed sketch sha256 a99828fd22cc3b8c (`sketch-14b-combined.patch.txt`, full sha256 a99828fd22cc3b8ceb76236618e4d0139849c794b49e616f7c951c0a02e17a25)

Reviewer: `tech-lead` (read-only, on B's consult list), 2026-11-08, on the combined PERF-14b sketch (lane window filter + gesture/lane-move pins, VZ1–VZ7, WG2–WG5 pin step, scale spec M2 + visible-gap + build self-check, budget flips).

## Findings (reviewer's severities) and B's ruling
| Id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R398-SK-M1 | Medium | Gesture pin is cleared only on pointerup/pointercancel; touch/pen get a new pointerId per contact, so a window blur mid-press leaves a permanent pin and two orphaned listeners (`claimPointerGesture` also listens to blur) | Fix in the lane sketch before 14b-ii dispatch (add window `blur` unpin, remove all three listeners), re-run VZ + mutants + a blur row. Not in round 399 (no app change) |
| TL-R398-SK-M2 | Medium | `studio-lab-interactions.perf.spec.ts` 30-clip build waits for `toHaveCount(press + 1)` on mounted clips and requires 30 distinct starts → hangs/fails under virtualization (confirmed: `perf-sketch-studio-lab-interactions.log`, rc 1, every 30-clip row null) | **This is round 399 (PERF-14b-i)**: the harness migration. Same class found in `studio-lab-resources` step e (`perf-sketch-studio-lab-resources.log`) |
| TL-R398-SK-L1 | Low | Lane unmount mid-press leaves the unpin listeners until that pointer is released | 14b-ii sketch: keep unpin functions in a ref, run them in an unmount effect |
| TL-R398-SK-L2 | Low | Visible-gap self-check assumes back-to-back equal clips (the Ctrl+D build) | Round 399: the spec states the assumption in its sequence text and doc 255 |
| TL-R398-SK-L3 | Low | Scroll components per page step 57.75 → 116.5 on the sketch (paid once per page crossing; page DOM 4.5× smaller, zoom 15× lower) — acceptable | 14b-ii: add a ceiling row; hysteresis is a later candidate (PERF-CAND-14-SCROLL-HYSTERESIS) |

No Critical or High. Answers recorded: reading the pin ref during render is safe (capture phase precedes any flush); no app code needs an unmounted clip's DOM (envelope/fades live in the pressed, pinned clip; nudge, group move, Follow, detail panel and export are model-based; ArrangementClip.tsx unmount effect cancels a gesture, hence the pin); zoom renders read the pending view, so no stale-window frame (B's per-frame probe: 0 gap frames, `probe/sketch-frames-*.json`).

## Split after review (D-29z1364)
- `sketch-399-harness.patch.txt` (sha256 204e282ad46a827c): the scale-spec part of the reviewed sketch, byte-identical in `perf/studio-lab-scale.perf.spec.ts`; `perf/budgets.scale.json` keeps every row `record` (the reviewed flips are moved out) and only the in-window and keydown-p95 notes change (M2/M3). Delta = notes only; no logic delta, so no re-review; A's own code-reviewer reviews A's round-399 diff.
- `sketch-14bii-lane.patch.txt` (sha256 3d1fc4d87c648582) + `sketch-14bii-budget-flips.patch.txt`: kept for 14b-ii; must be re-reviewed after TL-R398-SK-M1/L1 fixes (L58 reviewed = dispatched).

## Delta re-review (L58 reviewed = dispatched)
- Reviewed sha256 a99828fd22cc3b8c (combined) → dispatched sha256 204e282ad46a827c (`sketch-399-harness.patch.txt`, full 204e282ad46a827cfcf24af9253c57d5e2dc2c52953082a55657dde099b01287).
- `tech-lead` delta review, 2026-11-08: (1) the scale-spec hunks are byte-identical to the reviewed ones (cmp, 10 hunks); (2) budgets: 23 rows, only `note` changes on the 5 in-window and keydown-p95 rows, every row stays `record` with `budget: null`; the notes match the code (lane-area left edge; `perf/lib/stats.ts:8` p95 = max at n = 10); (3) **no new Medium+**.
