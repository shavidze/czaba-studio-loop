COMMIT: OK. This round touches no app code: no `app/` files, nothing in auth, purchase or download, no UI, Tailwind or accessibility surface. The only existing files changed are a new `test:perf` script in `package.json` and one status line in doc 162. Everything else is new test-only code under `perf/` plus `playwright.perf.config.ts`. The verify log shows all checks passing: lint gives warnings only, all in existing `app/` files; typecheck is clean; 195/195 test files pass; build OK. I did not run `npm run test:perf` myself; the run results are the implementer's (doc 163).

## Code Review: PERF-1a perf harness (`perf/**`, `playwright.perf.config.ts`)

### Critical Issues
- None.

### Findings, ranked (all Low; none blocks the commit)
1. **Perf-only global types are visible to the whole project.** In `perf/lib/instrumentation.ts:63-68`, the `declare global` block adds `window.__czabaPerf` and a typed `__REACT_DEVTOOLS_GLOBAL_HOOK__`. Because `tsconfig.json:19` includes every `.ts` file, `app/` code would now type-check if it used `window.__czabaPerf`, even though that object only exists under the harness. There is no conflict with existing tests: the 7 `app/**/__tests__` files set the hook through untyped `Object.defineProperty(globalThis, …)`.
   - **Fix:** exclude `perf` from the root tsconfig and add `perf/tsconfig.json` (strict, `lib: DOM` + node types), run by a `typecheck:perf` step. Alternatively, keep the types out of `declare global` and narrow `window` in the init script with a local guard function.
2. **Biome doesn't check `perf/`.** `biome lint ./app` and `biome.json` only cover `app/**`, so lint and format rules don't apply to about 900 lines of new TypeScript. Doc 163:114 already says this, but it's still a quality-gate hole.
   - **Fix:** a root/B decision to add `perf/**` and `playwright.*.config.ts` to the biome scope.
3. **The component count silently depends on React internals.** `perf/lib/instrumentation.ts:85-105` uses React 18 fiber tags and the `PerformedWork` flag. After a React upgrade the walk could under-count without any error. `harness.hook-live` only proves that commits arrive, not that the count is still correct.
   - **Fix:** in `inject(renderer)`, save `renderer.version` (use a type guard, no `as`) and write it into the report next to `chromium`. Fail the run if the major version isn't 18.
4. **`event-share-16` measures something other than its name says.** At `perf/studio-lab.perf.spec.ts:243-246` and in `budgets.json` the metric is named after `pointermove`, but doc 163:60 itself says Chromium doesn't publish those entries, so the value is really the share of `input` events. When PERF-FADER turns this row into an assert, the name will mislead.
   - **Fix:** rename the metric to `input-share-16`, or move the `pointermove` caveat into each row's `note` before the switch to assert.
5. **The build step can collide with other builds.** At `playwright.perf.config.ts:28`, the `webServer` runs `npm run build`, which overwrites the shared `build/` directory. If `verify` or a preview runs at the same time, either one could serve a half-written build.
   - **Fix:** document "do not run in parallel with verify/build", or build into a separate directory for perf.
6. **`harness.audio-running` is a weak check.** At `perf/studio-lab.perf.spec.ts:113-119`, the `--autoplay-policy` flag (config :23) lets any context be `running`. The doc acknowledges this and leans on `harness.restart-live`, which is acceptable. A stronger check would be a `running` context with at least one `start()` in the playing window.

### Real-browser behaviour and leaks
- Patching `start()` is safe. `AudioBufferSourceNode` has its own `start`. `OscillatorNode` and `ConstantSourceNode` are skipped by `Object.hasOwn`, so nothing is counted twice. Calls on `OfflineAudioContext` are excluded.
- The rAF loop, the capture `pointermove` listener and the observers never stop, but each pass gets a new context that `finally` closes (:426-428), so they can't leak across passes. Their arrays grow for about 60 s per pass, which is negligible.
- `waitForQuiet` loops on page time, but the 3 s cap (`settleCapMs`) guarantees it ends.
- Isolation is correct. Vitest only includes `app/**/*.test.*`. The default and smoke Playwright configs use `testDir: ./e2e`. `test:perf` is not part of `verify`. Results are written to `test-results/`, which is in `.gitignore`.

### Suggestions
- `clipGrabPoint` (:129-146) assumes the clip's visible hits are contiguous: index 20 means "+200 px" only if no overlay breaks the run. Using `hits[0] + 200` with a hit check on that exact point would be more robust.

### Good Practices Found
- The checks guard against false "zero" results: hook-live, a slider that didn't move, a clip that didn't move, and observer errors all fail the run.
- `budgets.ts` validates the budget file with type guards instead of `as`. There is no `any` and no ts-ignore anywhere in the new code.
- The report JSON is rewritten after every pass, so a timeout still leaves a partial result. Samples missing because a pass aborted are summarised in one line, and those rows are left out of the 1×-vs-6× agreement check.
- Deterministic and wall-clock metrics are kept apart, and no wall-clock row is an assert in this round.
- The implementer showed the budgets actually bite: a copied budget file made the run exit 1 and name both rows.
- Implementation doc 163 is in Georgian and has all the required sections.

### Architecture note
- None. No app owner, context or lifecycle changes in this round. `perf/` is a new test-only owner, which is fine as is because it doesn't touch the audio or gesture invariants. The perf-typing/lint scope (findings 1–2) is a tooling decision for planner/root, not an extraction.

### Alternative Approach
- **Current approach:** measure from outside with `addInitScript` (a devtools hook stub, a tracking `AudioContext` subclass, the `start()` patch and PerformanceObserver), against a production build.
- **Alternative:** use React `<Profiler>` with `onRender` inside the app, behind a build flag.
- **Verdict:** keep the current approach. It needs no app code or bundle changes and measures the real production build. Its cost is the dependence on React internals, which finding 3 covers.

### Score: 8.5/10