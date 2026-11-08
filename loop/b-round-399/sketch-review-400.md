# Sketch review: round 400 group-copy harness patch

- **Reviewer:** `tech-lead` (real read-only subagent run, 2026-11-08). B requested the review at the advisor's suggestion (L58: the reviewed sketch must equal the dispatched one).
- **Reviewed:** v1, `sketch/sketch-400-group-copy-v1.patch.txt` → `sketch/interactions.sketch-v1.ts`.
- **Dispatched:** v2, `sketch-400-group-copy.patch.txt` → `sketch/interactions.sketch.ts`. v2 differs from v1 only by the fixes below; the delta is visible with `diff sketch/interactions.sketch-v1.ts sketch/interactions.sketch.ts`.
- **reviewed v1 + fixes; dispatched sha256 d1b8c17d693409d2** (patch); spec after applying it: `fc804c3d3868f622`.

## Verdict
Approved after two fixes. The HEAD path is sound: 189/189 rows equal and zero reveals in every pass. There are no type-safety problems.

## Findings and disposition
| # | Severity | Finding | Disposition |
|---|---|---|---|
| 1 | High | After a null reveal, `measureGroupDrag` returned early. That skipped `resetAfterDrag` and the `drag-group-live` write, so the row could read 1 from the other branch while this branch never ran its checks | **Fixed in v2.** No early return. A null release/reset copy read adds liveness failure `(h)`, and the copy comparisons fail through their lane-id checks. `resetAfterDrag` and `setLive` always run |
| 2 | Medium | The `scrollLeft` restore check used exact equality, which can fail on fractional offsets | **Fixed in v2:** `Math.abs(now - saved) > 1` |
| 3 | Medium | Check (f) never runs under virtualization | **Accepted as a recorded deviation (D-29z1368).** The detail key `OwnCopyObserved` already marks it per pass. Debt is tracked as Q-14B-PIN-GROUP-MEMBERS for the 14b-ii sketch review. Check (c) still proves the copy moved |
| 4 | Low | Follow handling (c) | Confirmed correct. `handleTimelineScroll` pauses Follow on a large jump while playing. `toggleFollow` maps paused to on. The status text changes after `tEnd` (outside every window) |
| 5 | Low | `copy.count()` adds a round trip inside the measured window | Kept. Deterministic rows were 189/189 equal. Reusing `copyMountedBefore` would stall if the copy unmounts mid-gesture. Wallclock rows are `record` |
| 6 | Low | The setup failure was reported twice | **Fixed in v2** |
| 7 | Low | `readBesideClip` value null is ambiguous if T can be null | Recorded. No caller has a nullable T. Added to A-R399-REVIEW-LOWS |
| 8 | — | No `as`, `any` or `@ts-ignore` | OK |

**The v2 delta was not re-reviewed by `tech-lead`.** It touches only failure paths, the restore tolerance and one message. It was re-run on both trees, and A7 in the task makes A's `code-reviewer` cover the applied diff.

## Runs on the dispatched v2
See `sketch/rc.txt`, `compare-head.txt`, `summary-virt.txt` and `group-virt.txt`. The v1 runs are kept as `*-v1.*`.
