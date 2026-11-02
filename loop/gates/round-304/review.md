COMMIT: OK (no blocker: the change only touches `perf/` and docs, there are no `app/**`, auth, purchase or download changes, and verify plus both builds pass)

## Code Review: round 304 / PERF-3c (zoom harness rows + zoom probe)

The 5 tracked paths in the diff match `paths.txt`, and the 3 new files match `untracked.txt`. Verify passed: 232 test files and 3449 tests, plus both builds.

### Critical Issues
- None.

### Findings, ranked

1. **Medium: the gate does not run the new tests.** `vitest.config.ts:9` only includes `app/**/*.test.{ts,tsx}`. So the 3449 passing tests in verify.log do not include `perf/lib/zoom-probe.test.ts`, and they never included `report.test.ts` either. The only evidence that ZP1–ZP6 pass is the scratch-config run described in doc 222.
   **Fix:** a root task (ROOT-REQ-VITEST-PERF-INCLUDE, already listed in doc 222's TODO) to add `perf/lib/*.test.ts` to the vitest include, or to add a separate `test:perf-lib` step to `verify`.

2. **Medium: two `==` asserts lock in the slow behaviour that PERF-3d is meant to remove.** In `perf/budgets.interactions.json`, `interact.zoom.30.out.path-rewrites` (diff line 197–200) and `interact.zoom.30.wheel.path-rewrites` (line 258–261) both assert `== 60`. Of the two fixes doc 222 proposes, the integer-heights / scaled-viewBox one would bring these to 0 and turn the harness red. That works as a tripwire, but nothing says the red is expected.
   **Fix:** add one sentence to the PERF-3d TODO in doc 222 (line 123), or to the two row notes: "PERF-3d updates these two budgets in the same commit."

3. **Low: the probe adds work inside the time it measures.** The MutationObserver callback (`perf/lib/zoom-probe.ts:23–42`) calls `closest()` on every record. On band-crossing keys that is about 30 `d` records plus about 50 ruler childList records, all in the same task as the commit. So the new `keydown-max-ms` and `loaf-max-ms` rows are not strictly comparable with the existing `interact.zoom.30.key-window-longest-ms` row, which runs without the probe. The extra cost is far too small to explain 80 ms against the 50 ms target.
   **Fix:** add a note to the keydown and LoAF rows: "measured with the zoom probe connected."

4. **Low: the report's sequence text is out of date.** The text in `perf/studio-lab-interactions.perf.spec.ts:64–74` (`interactionSequence`, line 73) does not mention the in-first and out-first paths or the Ctrl+wheel step after stop, so the report describes an old run order. Doc 222 hands this to B. I'm noting it, not asking for it in this round.

5. **Low, cosmetic:**
   - The wheel row has `"unit": "commits / key"` (diff line 244), even though its note admits each step is a wheel.
   - `zoomWheelOffsetX = 224 + 300` (spec ~line 514) is an unnamed number; give it a name or a Georgian context comment.
   - In the test file, ZP6 comes before ZP5.

**Real-browser checks:**
- **Ctrl+wheel:** `StudioWorkspace.tsx:2008` registers the `wheel` listener with `{ passive: false }`, so the page handles Ctrl+wheel itself rather than the browser zooming the page. Also, the wheel step is last before `context.close()`, so its `scrollLeft` and hover state cannot leak into other rows.
- **Probe filter:** `arrangement-clip-waveform` is only on `ArrangementPeakPath` (`ArrangementClip.tsx:917`). The fade `<svg>` (line 920) and the envelope are siblings of it, not inside it, so the filter really does exclude fade and envelope paths. The `== 60` count is 30 waveforms × 2 crossings.

### Suggestions
- Name the wheel anchor numbers and say how they relate to the 224 px track header.
- Optionally, also count `childList` additions of `path` inside the waveform. Right now a remount (new key) would be invisible to the `in.path-rewrites == 0` assert.

### Good Practices Found
- The probe is disconnected in `finally`, and installing again disconnects the previous observer (ZP6), so the observer can't leak between steps.
- `connected: false` is reported as a harness problem rather than silently giving 0.
- The LoAF overlap filter fixes the dropped frame that started just before `t0`, and the existing rows' filter stays the same.
- The wheel measurement, which moves `scrollLeft`, runs last.
- Existing functions and rows are unchanged; only the `stats` import line changed.
- TS strict holds: no `any`, no assertions, no `@ts-ignore`. The `declare global` follows the existing `__czabaPerf` pattern, and `tsconfig` includes `**/*.ts`, so the new file was typechecked.
- Everything `page.evaluate` needs lives inside `installZoomProbe`, which handles the `toString()` serialization limit correctly.
- Tailwind, tokens and accessibility: not touched, since no UI changed.

### Architecture note
- signal 3 (one region changed repeatedly): the zoom section of `perf/studio-lab-interactions.perf.spec.ts` changed in PERF-3a, 3b and 3c. `measureZoomPath` (~lines 440–457) copies the slider "live" rule from `measureZoom` (lines 479–493) instead of sharing it.
  - **Keep it for now:** doc 222 promises the existing rows stay byte-identical, and changing `measureZoom` could shift measured values.
  - **Proposal for the planner (after PERF-3d):** one bounded task to make `measureZoom` use `runZoomProbeSteps` plus a shared live-rule helper. Acceptance: every existing `interact.zoom.*` row is unchanged across 3 passes. This is a proposal only, not a change for this round.

### Alternative Approach
- Not applicable: this change touches no critical business logic (auth, checkout, or the Studio audio pipeline).

### Score: 8.5/10