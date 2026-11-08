# Sketch review: round 404 (SYS-R385 stage 1)

**Dispatched patch:** `b-round-403/sketch-404.patch.txt`, sha256 `9c0cdbc99e9e0b1c05274d8ff2c7477a15d8e859a397545d0f89ec82d641d8ef`, 8 files.

## Pass 1: `tech-lead`, read-only, on v1 `sketch-404-v1.patch.txt` (sha256 022c2184e8988d2f6a05a287e8cfe18d6fefe0d57f7c12f30a3133f9e8718893)
- **No Critical, High or Medium in correctness, types or project rules.**
  - `ArrangementActions` is a `Pick` with a single type source.
  - The memo, the provider nesting and the guard are as designed.
  - `value` and `useArrangement` are unchanged, so render counts are unchanged.
  - All 34 dependency chains end in stable sources.

| Finding | Severity | Disposition |
|---|---|---|
| TL-R403-SK-M1: AC1 could pass vacuously; only the mute step proved it changed state | Medium | **Fixed in v2.** AC1 asserts that `pxPerSecond` changed and that the marker count went +1 after the commit and back after the undo |
| TL-R403-SK-M2: AC4 / MU-404-LOOP-SPREAD tested identity, not immutability; an in-place write would pass | Medium | **Fixed in v2.** The fixture has a loop and one marker; AC4 freezes `getArrangement().loop` and each marker after mount. New MU-404-LOOP-INPLACE (in-place `loop.enabled` write in `setTrackMix`) turns AC4 red |
| TL-R403-SK-M3: MU-404-TRANSITION injected a string, not an API use; AC5 also read comments | Medium | **Fixed in v2.** The mutant is a real `import { useDeferredValue } from 'react'` plus a call. AC5 strips block comments and full-line `//` comments. New control MU-404-TRANSITION-COMMENTED stays green |
| TL-R403-SK-L1: the 34 names are hand-kept in 3 places (type, object, deps); `useExhaustiveDependencies` is only `warn` | Low | **Recorded.** tsc catches type/object drift. A dropped dep surfaces in lint warnings, and AC1/AC2 catch identity drift in tested paths. Deferred Low |
| TL-R403-SK-L2: bundle-hook params still named `workspace` | Low | **Fixed in v2** (renamed to `actions`) |
| GATE379-L3 credit | info | **Ruled.** Credited to AC1, which pins the memo over all 34 callbacks, plus AC2; jsdom only, as the backlog caveat says |
| GATE378-L2 closure | info | **Depends on pass 2** (see below) |
| A-R371-GH5 id | info | **Corrected.** The backlog id is `A-R371-REVIEW-GH5-IDENTITY`; it stays open for stage 2 |

## Evidence on v2 (the dispatched sha)
- Mutants: 9/9 red, the control stays green, and the pristine run is rc 0 before and after (`mutants/summary.txt`).
- Full vitest: 262 files / 3876 tests, rc 0. tsc, lint and Biome: rc 0.
- Interactions spec: 189/189 deterministic rows equal `c-round-402/perf-interactions.json` (`interactions-compare.txt`; the v1 run is kept as `*-v1.*`).

## Pass 2: `tech-lead` delta (v1 → v2), on the dispatched sha
**Verdict: "no new Medium or higher; dispatch v2 as it is."** The reviewer confirmed the sha 9c0cdbc9…d641d8ef. Mediums M1–M3 are resolved.

| Finding | Severity | Disposition |
|---|---|---|
| TL-R403-SK2-L1: `expect(loop).not.toBeNull()` adds nothing after `toEqual` | Low | Recorded; deferred Low. Not changed, so that reviewed = dispatched |
| TL-R403-SK2-L2: only the marker objects are frozen, not the `markers` array (tsc already blocks a push through `readonly`) | Low | Recorded; deferred Low |
| TL-R403-SK2-L3: the AC5 comment strip can swallow a `'/*'` inside a string; trailing `//` comments are not stripped | Low | Recorded; deferred Low |
| GATE378-L2 scope | info | Closes within the stated scope only: the loop and marker objects present at mount, through track mute, Master mute and a marker commit. Not covered: loop objects created later, other edit paths (drag, trim, split, loop-brace step) and the `markers` array. The gate notes must say so; it is not a general guarantee that the loop is never changed in place |
