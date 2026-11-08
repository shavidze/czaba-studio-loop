# Sketch review, round 407 (PERF-11c-iii-d-ii)

**Reviewed sha256 = dispatched sha256:** `4ec62e316b8776b7db054fb86daa931c48316f8c45cf54f62c019a21e3a2f808` (`sketch-407.patch.txt`, `sketch-dispatched.sha256`). One review, on the frozen sketch after its mutants and pre-checks (L58). No edit after it.

**Reviewer:** `tech-lead` (read-only subagent, real run, 2026-11-08). Verdict: **no Critical, High or Medium**; dispatch unchanged.

## Confirmed by the reviewer (file:line on /tmp/b407-sketch)
- Video clip edits: `useCommittedVideoLaneClips` (:261-272) gives a new identity on any element change; the layout effect (:684-686) publishes; every commit listener fires (:246-255). DP74 pins it via gap + overlay.
- Video track id change rebuilds the reader (:257), so the silent first publish is safe; every consumer keys on `videoLane`.
- `videoSources`: caption memo prop + stopped-sync dep; rAF loop reads refs.
- StrictMode: the second layout run is silent (`publishedClips === clips`); each subscribe adds its own wrapper.
- Ordering: listeners read `getArrangement()`, current because `historyRef` is written synchronously in `updateHistory`.
- Ref write during render: a discarded render can only cause one extra notify, never a missed one.
- Memo stability: `onVideoExpandedChange` (StudioWorkspace :1223-1232), `claimPointerGesture` (ArrangementContext :2375) and `videoFloatAnchor` (useState) are stable; DP73 shows 0 inner and caption renders.

## Equivalent mutants (recorded, not rows)
List copy `[...commitListeners]` vs direct iteration; the `publishedClips === clips` early return (StrictMode only); a noisy first publish (snapshots dedupe); `onChange` added without the wrapper; layout effect vs `useEffect` for the publish (act flushes both; layout timing is intentional so stopped-sync sees the commit before paint). Also from B: `sameClipList` cache bypassed in `useCommittedVideoLaneClips` (a notify on every commit; consumers dedupe, no render change).

## Lows (ruled by B, D-29z1411)
| id | Low | Ruling |
|---|---|---|
| TL-R407-SK-L1 | `cachedLane = { ...base, clips }` now lives across commits, so its top-level fields (tracks) can lag after a track-only commit; no visible effect (video readers use `tracks` only to find the video track, whose id is the memo key) | deferred_low_polish, with the hardening written (refresh cachedLane from the current base and keep the clip list identity) |
| TL-R407-SK-L2 | no unit row makes the caption text follow a commit or a `videoSources`-only change (same hook as the gap, DP74) | deferred_low_polish; C row VIDEO-SYNC records the caption text in the browser |
| TL-R407-SK-L3 | a video-clip commit costs one extra synchronous caption re-render from the layout-phase notify | info, accepted by design |
