# Sketch review, round 406 (PERF-11c-iii-d-i)

**Reviewed sha256 = dispatched sha256:** `60bdf24c7a0fff14a9fd477bb724af81d371f45f93da6aff720bdbbb98fba870` (`sketch-406.patch.txt`, `sketch-dispatched.sha256`). One review, on the frozen sketch after its mutants and pre-checks (L58). No later edit, so no delta review.

**Reviewer:** `tech-lead` (read-only subagent, real run, 2026-11-08). Verdict: **no Critical, High or Medium.**

## Points confirmed by the reviewer
- `livePosition` (ArrangementContext l.1101) and `getPlaybackClock` (l.1115) are `useCallback(..., [])` reading only refs, so adding them to the actions memo deps cannot recompute it. The AC7 single-identity guarantee holds.
- The key spelling equals the main value's (`getLivePosition: livePosition` l.4733, `getPlaybackClock` l.4735), so AC7's `provided.get(key)` `toBe` check holds. The two wrap mutants prove it is not vacuous.
- `ACTION_KEY_COUNT` exists only in `actions-context.test.tsx`. No test mocks `ArrangementContext` / `useArrangementActions`. VideoDock name hits in other tests are source scans, and the patch touches none of their targets.
- The dock still subscribes to `useArrangement()` (arrangement, videoSources, pausePlaybackWithStatus), so its render count is unchanged.
- **Split confirmed:** d-i stays its own round (contract widening, own mutant proof, no render change). That gives d-ii a clean baseline.

## Lows (ruled by B, D-29z1406)
| id | Low | Ruling |
|---|---|---|
| TL-R406-SK-L1 | AC7 title hardcodes "36" | deferred_low_polish (fix with the TL-R403-SK-L1 const-tuple decision) |
| TL-R406-SK-L2 | internal `livePosition` vs public key `getLivePosition` aliased in two places | deferred_low_polish (rename candidate) |
| TL-R406-SK-L3 | the deps array sorts by internal name, the object by key | deferred_low_polish (cosmetic) |
| TL-R406-SK-L4 | no test that the dock reads these keys from the actions context | ruled: d-ii's render-budget RB-LEAF7 is the proof. In d-i it is equivalent by construction (same function identity) |
| TL-R406-SK-L5 | no implementation doc in the patch | in the task: A writes doc 259 |

## Mutants (`mutants/summary.txt`, runner `mutants/run.py`)
4/4 RED (drop or wrap `getLivePosition` / `getPlaybackClock` → AC7). Pristine before and after rc 0 on actions-context, floating-video and video-fades-ui. Scratch status 3 lines (the 3 sketch files).

## Earlier consults (inputs, not reviews of this sha)
- `consult-tech-lead.md`: split into d-i (actions 34→36 + AC7) and d-ii (memo inner + reader narrowing + commit signal); stopped-video correctness trap.
- `consult-performance-optimizer.md`: option (a) shell + memo inner; the same correctness trap; prefers separate props over widening `ArrangementActions`. B's ruling is D-29z1405.
