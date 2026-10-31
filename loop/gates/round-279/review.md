COMMIT: OK (test-only round: nothing under `app/**` changed and no auth, purchase or product download code was touched. The real Playwright perf run passed in all three specs and matched the HEAD `873d835` baseline.)

## Code Review: perf harness b-ii-1 (round 279)

I reviewed only the diff: `perf/lib/page.ts`, `perf/lib/app-labels.ts`, the three perf specs, docs 168/169/175/176 and the new doc 208. I also read `collection.ts`, the `measureLoad`/`setPlayback`/`isPlaying` code and the `finally` block of `measureExport`.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium: when the status wait fails, the error doesn't say why.** At `perf/lib/page.ts:113-115`, `waitForCollectionReady` uses a 15 s `toHaveText`. If a demo source fails, the status shows `copy.failed(n)` and the pass stops on `load` with a generic timeout message. Before this change, the same failure would still have been visible later as missing data. **Fix:** before the `toHaveText`, wait for either the ready or the failed status. If the status starts with `workspaceCollectionCopy('demo').failed`, push a named problem (`after load: N demo sources failed`) and throw. That separates "the fixture is broken" from "the wait was too slow".
2. **Low: a capped quiet wait while playing may be flaky on slower CI machines.** At `perf/lib/page.ts:124-126`, `waitForPlaybackSettled` needs 200 ms with no React commits or `start()` calls while audio plays. It worked in the round-279 run with no problems. But on a busier machine, the 3 s cap now marks the pass as a problem, where the old fixed 1 s wait passed silently. This is the intended effect of "cap never passes silently". I'm noting it as something to watch, not a defect. If it shows up, record which commits caused the cap in the problem text (for example `commits.at(-1)`) instead of loosening the cap.
3. **Low: the error can print "lane null".** At `perf/studio-lab-interactions.perf.spec.ts:271`, `ownTrack` can be `null` (the attribute is missing, or `closest` returned null), so the message reads "lane null". **Fix:** use `found.ownTrack ?? '(no data-track-id)'`. Separately, if `elementFromPoint` runs before layout settles after Add, it can give a false "no empty point". This is covered because `measureClipClick` already runs after `waitForQuiet`.
4. **Low: an observer can leak in one theoretical case.** At `perf/studio-lab-resources.perf.spec.ts:293-304`, if `observe()` succeeds but the evaluate throws before `window.__czabaExportObserver = observer`, the observer stays attached and no problem is recorded. This can't really happen, because the assignment runs in the same synchronous block. **Optional fix:** assign the handle to `window` before calling `observe()`.
5. **Low (coupling): the perf harness now depends on `collection.ts`.** At `perf/lib/app-labels.ts:11`, the harness imports at runtime from `app/lib/arrangement/collection.ts`, which also contains `createPurchasedWorkspaceCollection`. It works today because the `~/types/*` imports are type-only and get erased. If someone later adds a runtime `~/` import to that file, the perf harness could break under Playwright while `typecheck` still passes. **Optional fix:** move the copy objects into `strings.ts`, or keep this in mind as a watch item.

### Checks against the review focus
- **Event ordering in a real browser:** doc 208 measured the status commit landing about 470–510 ms after readiness. Waiting for the status text first and then for quiet keeps that commit out of the Add window (`harness.hook-live`). That is correct. `waitForPlaybackSettled` also checks `audioRunning`, which `setPlayback` does not, so the extra poll is not redundant.
- **Listener and timer leaks:** the `finally` block cleans up correctly. `pollLoop` starts as an already-resolved promise and never rejects (it has its own try/catch). The `downloadPromise` keeps its `.catch(() => null)`, so an exception from `click()` doesn't cause an unhandled rejection. The "not released" problem is only recorded when an observer was actually installed.
- **Regressions in existing flows:** the `waitForQuiet` signature and behaviour are unchanged, because the `capped` value only feeds the new helpers. The fixed waits that are part of a measurement's definition (the 2000 ms after Add, `play.idle-*`, the 1b-ii ready heap, the GC wait, `observerSettleMs`) are kept on purpose and documented. The `passSequence` text in 1a still matches what the code does.
- **TS strict:** no `any`, no `@ts-ignore`, no type assertions, and every statement ends with a semicolon. Render cost, accessibility and Tailwind tokens don't apply because there is no UI change.
- **Security and error taxonomy:** neither applies. The only download code touched is the harness listener, not product download code.

### Good Practices Found
- The status regex is built from the app's own copy (`workspaceCollectionCopy('demo').ready`) and anchored only at the start. That matches how `settledCollectionStatus` appends text after the ready sentence.
- Hitting the 3 s cap is now reported as a problem instead of passing silently.
- Each wait was replaced only after a decision that it doesn't define a measurement (D-29z637). The equivalence contract (D-29z640) was enforced, and six named mutants turned red.
- `emptyLanePointAfterClip` throws if the chosen point is on the clip's own lane.

### Architecture note
- **Signal 2 (ownership/coupling), `perf/lib/app-labels.ts:11` → keep.** Taking strings from the app removes copies of the text in the harness, which is the purpose of this file. The cost is the runtime dependency on `collection.ts` described in suggestion 5. **Proposal for the planner (optional, bounded):** move the demo and purchased `WorkspaceCollectionCopy` objects into `app/lib/arrangement/strings.ts` and re-export them from `collection.ts`. Owner: arrangement strings. Acceptance: `collection.test.ts` and `purchased-collection-ui.test.tsx` stay green, and the perf harness no longer imports `collection.ts`. This is a proposal only, not something to do in this round.

### Alternative Approach (critical logic: settling the harness)
- **Current:** wait for an app state (the status text or `isPlaying`), then wait for 200 ms with no commits, capped at 3 s and reported as a problem if capped.
- **Alternative:** have the app expose an explicit "settled" signal (for example a `data-collection-state="ready"` attribute, or an event the instrumentation records), and have the harness wait on that alone.
- **Verdict:** keep the current approach. The alternative changes `app/**` in a test-only round and only covers readiness, not the trailing commits that the quiet wait catches. It's worth reconsidering only if suggestion 1's failure-vs-slow ambiguity keeps coming back.

### Score: 9/10