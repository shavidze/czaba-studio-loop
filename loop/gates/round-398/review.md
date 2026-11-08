COMMIT: OK

## Code Review: ArrangementLane.tsx, lane-clip-count.test.tsx, studio-lab-scale.perf.spec.ts, budgets.scale.json, doc 254

I read the diff and every new file. I also read the perf helper exports and the `playwright.perf.config.ts` testMatch. I did not run the browser spec myself. For its behavior I rely on C's PASS and the verify log, which passed.

### Critical Issues
- None.
- The only production change is one attribute, `data-clip-count={clips.length}`, at `ArrangementLane.tsx:778`.
- `clips` is the existing `useArrangementPreviewLaneClips` result from line 257, so it adds no hook, state, effect, listener or timer.
- The render cost is a single integer attribute on an element that already re-renders with `clips`.
- I found no changes to auth, purchase, download or protected-file code. The changed paths are the lane component, a test, a perf spec, a budgets JSON and a doc.

### Suggestions (ranked)
1. **Low, `perf/studio-lab-scale.perf.spec.ts:239-250` and `:276`.** `data-clip-count` is only an integer on the lane and is not exposed to assistive tech. That is fine for a test hook. The build loop waits on this attribute after each Control+d, so a Control+d that silently does nothing fails with a 30 s timeout per press. That is acceptable, because the failure is caught by the `catch` and recorded as `aborted at b.`. A shorter timeout, or a check on the first press, would give faster failure feedback. Optional.
2. **Low, `spec:323`.** The self-check `values[values.length - 1] !== startValue` assumes the zoom steps are symmetric, with five `-` presses followed by five `=`. This would false-fail if the zoom step is clamped at a boundary. At default zoom that is unlikely. If it ever flakes, compare against the clamped result rather than asserting equality.
3. **Low, `spec:340-346`.** The `expect.poll(...).not.toBe(before).then(...)` pattern is used to swallow a failure, so it uses assertion machinery as control flow. It works. A plain `page.waitForFunction` with a try/catch would read more clearly. Cosmetic.
4. **Low, `spec:113-178`.** `readScaleDom` and `setTimelineScroll` duplicate the scroller-walking loop. The duplication is small, and the inline code is needed because `page.evaluate` closures cannot share helpers. Optional: pass the walker as a string constant, or move it to `perf/lib/page.ts`.
5. **Low, `docs/.../254-perf-scale-harness.md:104-106`.** The mutant summary and perf-results paths point to `tmp/` outside the repo, so they cannot be re-verified from the commit. This matches the project convention, but it means these claims are not reproducible from the repo alone.

### Event ordering, leaks, regressions
- **Event ordering.** The spec's `Control+d` presses are each followed by a wait on a model-derived attribute rather than a DOM mount count. This avoids a race between keypress and render. `measureScaleStep` blurs first, then takes t0, acts, waits for quiet and takes a snapshot. That ordering is sound.
- **Listener and timer leaks.** `context.close()` is in `finally`. CPU throttling is reset in the inner `finally` (`spec:446-451`). `cpuRate` is reset in the outer `finally`. There are no page listeners beyond `pageerror`, which dies with the context. No leaks.
- **Existing flows.** The existing specs query `[data-track-id]` and `[data-clip-kind]`, and neither is changed. An extra attribute does not alter selectors. Group rows also carry `data-track-id` but not `data-clip-count`, and the spec handles that with `[data-track-id][data-clip-count]`.
- **Test file.** `lane-clip-count.test.tsx` uses `vi.stubGlobal` with `vi.unstubAllGlobals()` in `afterEach`, so globals are restored. The tests need no timers, so none can leak. I read LC1–LC5 as reasonable coverage: initial counts, duplicate/undo/delete, a model parity check, preview and restore, and fold.
- **TS strict.** I found no `any`, `@ts-ignore` or type assertions. The `querySelector<HTMLElement>` generic is not an assertion. `perf/` is picked up by the Playwright config, and typecheck passed in verify.
- **Tailwind and tokens.** No styles are touched.
- **Accessibility.** No change. A `data-*` attribute does not affect the accessibility tree.
- **Security.** No `dangerouslySetInnerHTML`, no secrets and no network surface. The spec only writes `czaba_analytics_consent=denied` to localStorage, in a throwaway test context.
- **Error taxonomy.** Not applicable. No error codes are involved.

### Good Practices Found
- The model count is independent of mounting, so it keeps its meaning after PERF-14b virtualization. The doc states the contract explicitly, including cross-lane preview and the collapsed-group case.
- The harness fails on its own self-checks: 200 distinct clip starts, zero collapsed groups, zoom direction, scroll step equal to `clientWidth`, and page errors.
- Every budget row is `mode: record` with `budget: null`, so the new harness cannot break CI before baselines exist.
- The attribute change adds no component and no hook. The doc records the mutants (five red tests) and the alternatives it rejected.
- The implementation doc follows the project rule.

### Architecture note
- signal: none in the diff. The `ArrangementLane.tsx` change is a one-line attribute with no new state or lifecycle.
- For the planner (not a finding): `studio-lab-scale.perf.spec.ts` is a new, separate harness file. That is the right call, because the doc notes the 2059-line interactions spec has row-to-row state coupling.
- The duplicated scroller-walk logic (`spec:113` and `:156`) is a candidate for a shared `perf/lib` helper if a third caller appears. Keep it as is until then.
- This is a diff review, not an audit of the whole module.

### Alternative Approach
Not critical logic: there is no auth, checkout or audio pipeline change. For the one design choice, the alternatives were:
- Current: a model-derived `data-clip-count` on the lane.
- Alternative: count `[data-clip-kind="audio"]` in the DOM.
- Verdict: the current approach is better. The DOM count would silently change meaning after virtualization, and 51 test and perf files already locate clips through the DOM.

### Score: 9/10