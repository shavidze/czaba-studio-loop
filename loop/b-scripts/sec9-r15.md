## 9. Second advisor call

Made after these artifacts were written. The advisor confirmed CONTINUE, that C-R13-01..03 close only on C's evidence, that the D-29f numbers and insets recompute correctly from C's rects, and that the plan, board, `b-next.json` and sha reference are consistent. Applied before reporting:
1. **Keyboard reachability (R15-P2.4).** B grepped `ArrangementLibrary.tsx`: option focus is a plain `.focus()` (l.194 and l.325), with no `preventScroll` and no `scrollTop` arithmetic, so Chrome honours `scroll-padding-bottom`. P2.4 stays. The task §1.5 now has a pre-code mechanism probe (inline padding via `$B js` at 1280/480 plus real ArrowDown); if it fails, A stops and reports to B. Script: `b-scripts/task-r15-fix.js`.
2. **Literal readings in the task:** R15-P3 now checks after ◀ followed by ▶ (the body does not exist while the library is a rail), and R15-E1 requires a non-empty project so `WAV-ის ექსპორტი` is enabled.
3. **Checkpoint:** `b-round-14-checkpoint.md` was refreshed, because it still named the rejected backdrop mechanism.
4. **New Tech Lead item R15-SB:** in real Chrome, the tree/list scrollbars with the inset. Added to `backlog.json` and `feature-status.md` §5.
