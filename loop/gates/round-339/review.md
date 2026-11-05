COMMIT: OK

This is a read-only review of the diff. I didn't run any tests. The change is perf-harness and docs only: `perf/studio-lab-interactions.perf.spec.ts`, `perf/budgets.interactions.json` and the two implementation docs. It touches no `app/`, auth, purchase or download code, and no Remix, Tailwind or design-token code. I checked the new helpers' names against the spec file and its imports, and they all resolve. I didn't open the verify log or `c-round-339.json`. I'm relying on your statement that both passed.

## Findings, ranked
No blockers. All findings are Low.

1. **Medium-Low: cleanup is skipped if a step throws** (`studio-lab-interactions.perf.spec.ts`, the new group block in `runInteractionPass`, near the `step = 'group setup'` assignment).
   - If `measureGroupDrag` throws after setup, `teardownGroupClips` doesn't run. The pass keeps the Ctrl+D copy and a possibly pressed Control key.
   - `pressedGesture` does release the mouse on error, and `setupGroupClips` releases Control in a `finally`, so no listener or input leaks.
   - Fix: wrap the drag calls in `try { … } finally { await teardownGroupClips(...) }`, or confirm the outer step handler fails the whole pass. If it already fails the pass, this is moot.

2. **Low: the teardown loop can't tell "Undo title unchanged" from "nothing undone"** (`teardownGroupClips`, the `while` loop).
   - The first Ctrl+Z always runs. Later ones depend only on the Undo button's `title` returning to its start value, so a stale `title` could stop the loop early.
   - The `toHaveCount(1)` and clip-state checks after the loop would still catch a bad result, so this stays Low.
   - Fix: none needed. Optionally also assert the Redo `title`.

3. **Low: the group drag liveness check (c) compares `Number(string)` deltas** (`measureGroupDrag`, the `releaseDelta`/`copyDelta` lines).
   - If `data-clip-start` ever becomes empty or non-numeric, `Number('')` is 0 and the check reads that as a zero delta rather than "unreadable".
   - The `releaseDelta > 0` condition does fail in that case, so the outcome is safe.

4. **Info: doc counts are consistent.** I counted 13 rows per rate, so 26 across the two rates. 24 are `record` and 2 are `assert == 1`. This matches doc 168 and doc 232. The removed "Record until C measures it" text in the two `drag-lane-live` notes matches the round 338 assert state.

## What I checked for the project focus
- **Event ordering:** the gesture reuses `pressedGesture`, which does `mouse.down`, the moves and `mouse.up`, with a double-`requestAnimationFrame` settle before the copy is read. The ghost reads happen after the step into the next lane. Control is released in a `finally`.
- **Leaks:** the diff adds no listeners or timers. Teardown restores the clip count to 1 and checks the Undo `title`.
- **Regression of existing flows:** the group block runs after `pause` and before the 1× block (30 clips, zoom, select). Per doc 232, teardown returns the clip state, so the 1× block starts from the same place. The 139 existing non-wallclock rows were equal to round 338 with 0 DIFF.
- **TS strict / style:** no `any`, no assertions, no suppressions, no comments, semicolons present. The locators go through `quotedAttributeValue`.
- **Accessibility, render cost, Tailwind:** not applicable to this diff, since it changes no UI.

## Architecture note
- **Signal (mixed responsibilities, repeated costly change):** `studio-lab-interactions.perf.spec.ts`, the new `measureGroupDrag` near line 740, next to `measureLaneDrag`. The two functions share about 80% of their body: the pointer windows, the `put(...)` rows and the liveness checks. This is the third round in a row (335, 338, 339) editing this region.
- **Keep (for now), because:** each drag's row ids, windows and liveness checks are pinned by recorded budgets, and a mid-stage extraction would risk shifting `deterministic` rows in a round whose goal is "139 rows equal". The cost of keeping is low. Divergence between the lane and group copies is the only risk.
- **Proposal for the planner, after c4-ii:** one bounded task to extract the shared window and row-emission part of `measureLaneDrag` and `measureGroupDrag` into a helper. The liveness checks would stay per scenario. Acceptance: the ids and values of all 219 rows are unchanged against the round 339 run, and the mutants MU-GROUP-SINGLE and the lane mutants stay red.
- This note isn't a finding for this round, and the implementer shouldn't act on it outside its scope.