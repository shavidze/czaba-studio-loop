# Sketch review, round 398 (PERF-14a)

Dispatched sketch: `b-round-397/sketch-398.patch.txt`, sha256 bd8fe321255fbac9d4afc764bf1cb3eaff612d6d92142a80d4aa1278950bc5cb.

## Review 1 (`tech-lead`) on sha256 0fb9c9b528b052be (LC1–LC3 only)
- No Critical, High or Medium finding in the sketch. Lows, no action: no extra render (a count change always comes with a new `clips` array); SSR/hydration safe (preview is null at load); the preview-clips choice is right (the rendered clips come from the same list).
- **Medium (coverage gap), fixed:** add a cross-lane drag preview row. Added as LC4, with mutant MU-398-COMMITTED.
- **Folded lane:** the lane still renders, with `data-track-folded="true"`. Added LC5, with mutant MU-398-FOLD-ZERO.
- **Medium for A's Playwright use, ruled in the task §1.1 and the ruling lines:** a sum over lanes undercounts while a group is collapsed. The scale spec checks that 0 `[data-group-id]` exist, uses `[data-track-id][data-clip-count]`, parses with `Number()`, and samples only when no drag is in progress.

## Delta re-review (`tech-lead`) on sha256 bd8fe321255fbac9 (dispatched)
- The reviewed sha equals the dispatched sha. No Medium+ finding is left.
- LC4's second step takes the `clearPreview()` branch (`next === publishedHistoryRef.current.present`). MU-398-COMMITTED turns only LC4 red, and MU-398-FOLD-ZERO only LC5.
- `const moved: Arrangement = …` is an annotation, not an `as` assertion.
- Low: `previewActiveRef` stays true after LC4. This is harmless, because each test mounts a fresh workspace.

## Ordering matrix (L58)
Not applicable. The change adds no write, abort, queue or join contract: it renders a derived attribute.
