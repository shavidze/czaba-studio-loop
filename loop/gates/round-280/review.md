COMMIT: OK. This round only changes test code and docs: `perf/studio-lab-resources.perf.spec.ts`, 8 notes in `perf/budgets.resources.json`, and docs 168, 169, 175, 176, 208 and the new 209. Nothing under `app/**` changed, and no auth, purchase or download code is touched. The spec does wait for Playwright's `download` event, but that is test code, not the app's download path. The verify log shows TS strict passing (`tsc --noEmit` covers `perf/**`), 221 of 221 test files passing, and the build passing.

## Code Review: perf/studio-lab-resources.perf.spec.ts (+ budgets and docs)

### Critical Issues
- None.

### Findings, ranked (none block the commit; all affect recorded numbers or diagnostics only)

1. **`perf/studio-lab-resources.perf.spec.ts:207-210`: the midpoint is only a guess at when the heap was read.**
   - **Why:** `Runtime.getHeapUsage` runs on the page's main thread. When that thread is busy, the request waits in a queue and the reply comes back quickly once it runs. So the real reading is closer to `receivedAt` than to the midpoint, and the error can be up to about half the round trip.
   - **Impact at 1×:** none. The round trip is 1–3 ms.
   - **Impact at 6×:** doc 209's own table shows samples at about 65 % of `expectedPolls`, so the round trip is over 50 ms. A sample read just after `windowEnd` can still count as inside the window. This is probably where the 65 → 65.1 peak in doc 209 comes from.
   - **Fix:** add per-sample round-trip stats (`max`, `median` of `receivedAt − sentAt`) to the `mem-polls-N` detail. Detail keys are already being extended this round, so this fits the equivalence contract. It would also turn the "ჰიპოთეზაა" (hypothesis) in doc 209 §Problems into data for the R216-MEM-POLLS-HEADROOM watch.

2. **`:186-199`: the clock probe and the heap polls use different channels.**
   - **Why:** the probe uses `page.evaluate`; the polls use `cdp.send`. Any delay difference between the two paths ends up in `offsetMs`.
   - **Impact:** the measured `clockOffsetMs` of −0.6 to −2.2 ms shows the effect is small.
   - **Optional fix:** probe with `cdp.send('Runtime.evaluate', { expression: 'performance.now()', returnByValue: true })` so both use the same channel.

3. **`:189-191`, `:349`: the two sides use different kinds of clock.**
   - **Why:** Node's `Date.now()` follows the system clock and can jump; the page's `performance.now()` never jumps. If the system clock is adjusted during the window, the offset is wrong.
   - **Impact:** windows are a few seconds long, so drift is negligible. The poll loop body is a declared hard limit this round, so this is a note only.
   - **Possible fix later:** Node's `performance.now() + performance.timeOrigin`.

4. **`:341-345`: a probe over 20 ms is reported but its offset is still used.**
   - This is deliberate and documented: there is no silent fallback, and the run gets a problem entry. No action needed. Just keep in mind that a failed probe still produces numbers.

5. **Gate coverage (already tracked).**
   - `npm run lint` only covers `./app`, so nothing lints or format-checks `perf/**`.
   - `perf/**/*.test.ts` is not in the vitest include, so `heapSamplesInWindow` only has mutant-run evidence (MU-SIGN, MU-ENDPOINT).
   - Both are already open as ROOT-REQ-VITEST-PERF-INCLUDE plus the lint scope. No new item.

### Suggestions
- **Doc consistency, checked and correct:**
  - The budgets note "polled every 50 ms, or one CDP round trip if longer" matches `Math.max(0, heapPollMs − elapsed)`.
  - Doc 169 matches the code: the probe runs before the poll loop and before the click.
  - The `endSampleLagMs` formula matches.
- **Doc 176:** it is a round-224/225 doc and is now marked "Completed (C round 280 PASS)". That is fine, because its TODO tracked b-ii.

### Good Practices Found
- **Release path:** `probePageClock` is inside the `try`, after the observer is installed, so `finally` still releases everything if it throws (the MU-PROBE-THROW result confirms this).
- **No probe inside the window**, so the measurement itself is unchanged. Both window edges are handled the same way.
- **Old count kept:** `endpointRule` stays in the detail, so every run shows the difference between the old and new rule.
- **Mutant evidence:** MU-SIGN, MU-RTT, MU-ENDPOINT and MU-ORIGIN back up the claims.
- **TS strict:** no `any`, no type assertions, null-checked `best`, semicolons present.
- **App side:** no listener or timer leaks, no render cost, no accessibility or Tailwind impact, because no app code changed.

### Architecture note
- **Signal 3 (repeated costly changes to one region):** `perf/studio-lab-resources.perf.spec.ts`, `measureExport` (`:293` onward), was reworked in rounds 216, 217, 279 and 280.
- **Keep for now:** the change stays inside this spec, `perf/lib/**` is frozen by scope, the new helpers have no state and only this spec uses them, and mutant runs cover them.
- **Proposal for the planner (one bounded task, not scheduled):** when a second spec needs a page clock, move `PageClock`, `probePageClock` and `heapSamplesInWindow` into `perf/lib/page.ts`.
  - **Acceptance:** the equivalence check passes against the HEAD oracle.
  - **Tests:** unit tests once ROOT-REQ-VITEST-PERF-INCLUDE is resolved.
- I reviewed the diff only, not the whole module.

### Alternative Approach (harness measurement logic)
- **Current:** one Node↔page clock offset, measured before the click (smallest round trip of 5 probes). A sample counts if its request–response midpoint, on the page clock, falls inside `[t0, windowEnd]`.
- **Alternative:** read the heap inside the page (`performance.memory` or `measureUserAgentSpecificMemory`) and timestamp it with `performance.now()`. That removes the clock-matching problem.
- **Verdict:** keep the current approach.
  - The in-page reading is not the same quantity as `backingStorageSize`, which would break the equivalence contract and the row meaning.
  - It would also add work on the page's main thread inside the window that `wall-ms` and `longtask-*` measure.
  - The remaining midpoint error under 6× (finding 1) is best handled with per-sample round-trip diagnostics, not a rewrite.

### Score: 8.5/10