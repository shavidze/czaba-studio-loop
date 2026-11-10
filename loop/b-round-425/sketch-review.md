# Sketch review — round 426 (SYS-2 stage 2a), L58

- **Dispatched sketch:** `b-round-425/sketch-426.patch.txt`, sha256 `c97f080fae4a4af773c8646cef89d5fc0cc2673a95d43f68cee179a6eaf84078` (also in `b-round-425/sketch-426.sha256`; claims K11). It is the reviewed sketch plus the post-review delta below; nothing else changed.
- **Reviewer:** `tech-lead` (read-only project agent), 2026-11-10, on the pre-fix sketch (sha `68e6c66a…`) applied in `/tmp/b425-scratch`.
- **Verdict:** approve-with-lows. No Critical, High or Medium.
- **Delta re-review (L58, reviewed = dispatched):** `tech-lead`, 2026-11-10, on the delta `b-round-425/sketch-delta-68e6c66a-to-c97f080f.patch.txt` (reviewed `68e6c66ad14ab2256b45b6630c003a6a4524a6db7d2c49d91a0c973209e1aa57` → dispatched `c97f080fae4a4af773c8646cef89d5fc0cc2673a95d43f68cee179a6eaf84078`). Verdict: **approve-with-lows on c97f080f**; all of TL-R425-01…08 handled; MU-PAN-RESET turns only HM5 red.

## Findings and what B did (post-review delta)
| id | Sev | Finding | B action in the dispatched sketch |
|---|---|---|---|
| TL-R425-01 | Low | `onKeyDown?: never` does not stop a runtime `{ onKeyDown: undefined }` (no `exactOptionalPropertyTypes`); the `expectTypeOf` half of HM15 is enforced only by `tsc` | Kept `never`; HM15 gains two runtime asserts: `'onKeyDown' in softDisabledButtonProps(true / false)` is false. MU-SPREAD-TYPE stays a `tsc` mutant |
| TL-R425-02 | Low | Pan reset without a guard: when `setTrackPan` refuses (a pointer gesture is active) focus stays on the enabled button and each repeat re-announces the refusal | **Guard added** to Pan reset. HM5 now also sends the 3 repeats to the reset button itself and expects them prevented; new mutant MU-PAN-RESET → HM5 |
| TL-R425-03 | Low | The compact video-import button (folded/tight video track) had no row | New row HM6b (fold the video track, hold Enter on the compact button, 1 chooser); new mutant MU-LANE-VIDEO-COMPACT → HM6b |
| TL-R425-04 | Low | Group name input repeat branch is defensive (a repeat cannot normally reach a just-opened editor); repeated Escape had no row | Kept as a defensive guard; doc 274 says so. New row HM11b (repeated Escape keeps the editor open; a fresh Escape cancels, name unchanged, focus on the name button). MU-GROUP-INPUT covers HM11 and HM11b |
| TL-R425-05 | Low | HM9 asserted only "arrangement changed"; HM3 depended on track order; HM5 could not see a guard | HM9 asserts `data-solo` off → on; HM3 finds the fold inside the SFX header; HM5 see TL-R425-02 |
| TL-R425-06 | Low/info | About a dozen identical inline `key === 'Enter' && event.repeat` copies remain (MarkerRow 782/847/863/879/990, DetailPanel 472/1100, ExportDialog 601, Library 368, LibraryMenu 103, LibraryPreview 423/454) | Not in 2a (other owners). Recorded for **SYS-2 stage 2b**: fold every copy onto `preventRepeatedEnterKeyDown` and add a grep row (the pattern lives only in `studio-repeat-safe.ts`). Marker flag folds there too |
| TL-R425-07 | Info | No perf impact on `ArrangementLane` (module-level handler, no new closures or hooks, no drag-store subscription change) | None; C still runs the lane name probe row (see task) |
| TL-R425-08 | Info | No button missed in the four files or their children (MixFader, TrackMeter, Clip have no buttons) | None |

## Delta re-review findings (ruled, not changed in the sketch)
| id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R425-09 | Low | HM5 sees the Pan-reset guard only through a keydown sent to the already-disabled reset; the motivating case (reset refused during an active pointer gesture, button enabled, refusal re-announced) has no row | `deferred_low_polish`; stage 2b may add a gesture-active row. Not a defect of the guard (MU-PAN-RESET is red) |
| TL-R425-10 | Low/info | In HM11b the two `toBe(false)` checks on Escape keydowns always pass (the input prevents every Enter/Escape); the editor-open/closed checks carry the row | `deferred_low_polish`; wording only |

## Evidence after the delta (all on the dispatched sha)
- `mutants/summary.txt` (18 lines) from `mutants/run.py` on a clean `git archive HEAD` scratch: every single-site mutant turns exactly its row red; MU-HEAD-SRC turns 16 of 17 red (HM15 is a helper/type row); MU-SPREAD-TYPE fails `tsc` (rc 2).
- `precheck-full.log`: the full vitest suite on the sketch scratch, 265 files / 3,974 tests, rc 0.
- `precheck-a2.log` (57 covering files, 1015/1015, including the render-count files `drag-preview-render`, `track-layout`, `tempo-window-ui`), `precheck-typecheck.log`, `precheck-lint.log`, `precheck-biome8.log`.
- Browser: `probe/head/` (HEAD :5173) and `probe/sketch/` (scratch server :5174 with its own `cacheDir`, stopped; the scratch `vite.config.ts` edit reverted), `probe/compare.txt` = `ALL OK (28 cells)`. HEAD repeats change state on LMUTE, LSOLO, LFOLD, LVIDEO, GFOLD, GMUTE, GSOLO, MMUTE, METRO.
- Lane render names: `probe/names-sketch-{fade,trim}.json` on the sketch server equal `probe/names-head-*.json` (fade 4/4, trim 15/15, lane shell 0, Memo(lane) 0, inner 59, same name set).
- Rows 5–6 baseline: `probe/head/smoke-focus-*.json` (HEAD; the sketch changes no per-press or focus behaviour).
