COMMIT: OK. Nothing in `app/` changed, and no auth, purchase, protected-download, Studio runtime or UI code is touched. The candidate is one new test-only perf spec, its budgets file, one new implementation doc (169) and one-line status updates in docs 160, 161, 162 and 168. Your verify log shows the agent-reference check, unit tests and build passing, and my read found no blockers. I did not run anything; this is a read-only review of the diff and the three new files.

## Code Review: `perf/studio-lab-resources.perf.spec.ts`, `perf/budgets.resources.json`, docs 160–162, 168, 169

### Critical Issues
- None.

### Suggestions (ranked)

1. **Low: the page-side observer adds its own cost to the numbers it measures and can outlive its export.** `perf/studio-lab-resources.perf.spec.ts:356-362`
   - The `MutationObserver` watches the whole `document.body` subtree, including text changes, for the full export window. Every batch of changes runs `querySelector('[role="dialog"]')` plus `textContent`, so that work lands inside `wall-ms`, `longtask-*` and `loaf-blocking-max`. This matters most at 6×.
   - Doc 169 line 60 discloses the heap-polling cost but not this one.
   - The observer only disconnects once "WAV created" appears. If export 1 never shows the text, that observer is still attached during export 2.
   - **Fix:** attach the observer to the dialog element only, keep a reference on `window`, and disconnect it in the `finally` at line 496 and before installing the next one. Add one sentence about observer cost to doc 169 line 60.

2. **Low: a 30-second Node timer is left running after each export.** `perf/studio-lab-resources.perf.spec.ts:480-485`
   - The timeout inside `Promise.race` is never cleared. Nothing breaks, because the rejection is handled, but up to 30 s of timer stays pending in the worker after the last export.
   - **Fix:** keep the timer handle and `clearTimeout` it in a `finally`.

3. **Low: doc 169 contradicts itself in three places.**
   - Line 176 says one pass showed a **52 ms** task, but line 73 and `budgets.resources.json:198` both say **51 ms**.
   - Line 176 says the two `.6x` long-task counts are "2–3", but the median table at lines 140 and 146 shows 2 and 2. Say these are per-sample ranges, or match the medians.
   - Line 176 compares a MiB measurement with a "≤ 40 MB" target. Name one unit.

4. **Low: an open finding ID disappears from the docs.** `docs/.../162-lead-magnet-dialog-focus.md:4`
   - The new status line drops "open: C-R205-01 in-flight window". After this diff, the ID appears nowhere under `docs/`.
   - The issue itself is still tracked in TODO line 139 (focus on body during submit), just without the ID.
   - **Fix:** add `(C-R205-01)` to TODO line 139 so a search for the ID still finds it.

5. **Info: one bad URL stops the whole route measurement.** `perf/studio-lab-resources.perf.spec.ts:720`
   - `new URL(request.url)` throws on a malformed URL, and the catch at line 744 then aborts that route's measurement. Doc 169 line 195 already notes the related `data:` URL edge case. No action needed now.

**Areas checked with nothing found:**
- **TypeScript strict:** no `any`, no `@ts-ignore`, no `as` assertions. `blockingDuration` is narrowed with `in` plus `typeof` (line 156). The global `Window` additions use new names only.
- **Leaks:** the heap-polling loop is stopped and awaited in `finally` (lines 496-499). Every browser context is closed in `finally` (lines 654, 748).
- **Budget rows:** there are 61, which matches the doc. 6 metrics × 2 exports × 2 rates + 6 × 2 liveness rows + 3 memory + 7 DOM + 15 JS-bytes = 61. `rowRate` correctly reads `.6x` as 6.
- **Determinism:** `res.export.2.longtasks-over-50` is `wallclock`, so it is correctly excluded from the strict determinism check even though its metric name is in the set.
- **Out of scope:** Tailwind, design tokens and accessibility do not apply to this diff.
- **Auth:** `/studio/middle-east` is only loaded to count the sign-in guard's JS bytes. No auth code runs differently.

### Good Practices Found
- Every wait has a timeout: actions 30 s, download 60 s, `download.path()` 30 s, done text 15 s, dialog close 10 s. There is also an 8-minute guard on starting new passes, so a hung pass cannot run into the 15-minute Playwright limit.
- Only heap samples whose request was sent and answered inside the window are counted.
- The end-of-window heap sample fixed the 37/65 MiB flip, and the reason is written down.
- The WAV header check is thorough: chunk tags, format, data size equals file size minus 44, and the frame count matches the "WAV created" length.
- Assert rows are limited to liveness checks, and record rows have no budgets. That fits a baseline round.
- A row that was measured but has no budget row fails the run, so nothing gets recorded silently.
- The doc explains which memory and timing approaches were rejected and why (RSS, `performance.memory`, rAF polling).

### Architecture note
- **Signal 3, the same change made at high cost in three places:** this spec is the third copy of `nowIn`, `snapshot`, `waitForQuiet`, `reactRendererProblem`, `rateRowId` and the report builder (lines 167-232 and 755-853), alongside `studio-lab.perf.spec.ts` and `studio-lab-interactions.perf.spec.ts`. The next perf round that changes the report rules (median, determinism, `complete`) has to make the same edit three times and keep the copies in sync.
  - **Keep for now:** `perf/lib/**` is frozen, and the debt is already recorded as PERF-HARNESS-SHARED-LIB (D-29z215).
  - **Proposal for the planner (not approved scope):** one bounded task. Owner: `perf/lib/`. Move the shared helpers and a parameterised `buildReport(harness, budgets, passes, …)` into `perf/lib/report.ts`. Acceptance: all three specs produce byte-identical `failures` and `rows` on a recorded run, and the existing perf specs pass unchanged. No change to `app/`.

### Alternative Approach (test infrastructure, so this is lower stakes)
- **Current:** poll `Runtime.getHeapUsage().backingStorageSize` over CDP every 50 ms or more, then take the max of the window samples and one end-of-window sample.
- **Alternative:** a Chrome trace with the `disabled-by-default-memory-infra` category and periodic memory dumps. It covers Web Audio memory and other memory outside the main JS heap. The cost is a much heavier trace, parsing work, and more non-determinism.
- **Verdict:** keep the current approach. It is deterministic (65 / 129.9 MiB on every pass) and cheap, and its blind spots (worker memory, the rendered `AudioBuffer`) are written down. PERF-12 can add the trace-based measure if the ≤ 40 MB target needs whole-process memory.

### Score: 9/10