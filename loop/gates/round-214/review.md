COMMIT: OK (the commit changes only `perf/` and `docs/`, with no runtime code; the new spec is picked up by the perf config, verify passes and C round 214 is PASS. None of the findings block it.)

## Code Review: round 214 (PERF-1b-i baselines + PERF-1a cleanup)

**Scope:** `paths.txt` lists only files under `docs/` and `perf/`. No `app/` path is in it, so auth, purchase and download code are not touched. Tailwind, tokens, accessibility, render cost and runtime listener/timer leaks don't apply here. I reviewed the diff, not the whole module.

**Checks:**
- `playwright.perf.config.ts:5` matches files with `testMatch: '*.perf.spec.ts'`, so the new `studio-lab-interactions.perf.spec.ts` will run under `npm run test:perf`.
- The per-test timeout is 15 min (`:10`) and `workers: 1`. PERF-1a takes ~454 s and PERF-1b-i ~300 s, so each test is well under its limit. The whole run is about 13 min plus the build, and nothing in the config caps total wall-clock time.
- `tsconfig.json:19` includes `**/*.ts`, so `perf/` is typechecked, and typecheck passed.
- The four `... must be used within an ArrangementProvider` errors in verify.log l.1291–1329 are not regressions. They come from `context-hygiene.test.tsx:311/316`, which deliberately calls the hooks outside the provider and expects the throw. The run ends with 200/200 test files passed.
- The `instrumentation.ts:133–140` change uses `in` + `typeof` to narrow the type, with no `as` and no `any`, which satisfies TS strict.

### Critical Issues
- none

### Suggestions (most important first)
1. **`perf/studio-lab-interactions.perf.spec.ts:712` and `:778` — fixed `waitForTimeout(idleSettleMs)`.** Doc 168 itself cites GATE211-S4 (replace fixed waits). These two sit outside the measurement windows, so they don't skew any row, but they break the rule.
   - **Fix:** use a state wait. At `:712` that could be `waitForQuiet`. At `:778`, wait for `isPlaying` plus at least 1 `start()`, the way `measurePlayback` does.
   - If a fixed wait really is needed, note the exemption in doc 168 the same way the "after Add" wait is noted.
2. **`:542` — `emptyLanePoint(page, 'stems')` hardcodes the fixture's track id.** If the studio-lab fixture changes, the click-live row will drop to 0 with an unclear error.
   - **Fix:** read the id from the clip's ancestor with `clip.locator('xpath=ancestor::*[@data-track-id]')` / `data-track-id`, or at least move it to a named constant (`stemsTrackId`).
3. **`:193` — `` `[data-clip-id="${clipId}"]` `` builds a CSS selector from a string.** It's test-only and the id is read from the DOM, but a quote in the id would break the selector.
   - **Fix:** use `audioClips(page).and(page.locator('[data-clip-id]')).filter(...)`, or escape the id with `CSS.escape` inside an evaluate.
4. **`:522` — `values.at(-1) === values[0]` compares floats exactly** (`Number(inputValue())`). It works today (678 → 851 → 678), but if the zoom step becomes multiplicative with rounding, zoom-live will flicker.
   - **Fix:** compare with `Math.abs(a - b) < 0.5` or round the values first.
5. **`perf/budgets.json:70` (note) and doc 163 l.67 — wording.** "1 s after the Space press" isn't what the code does. `setPlayback` first waits for `aria-label=Pause` (up to 15 s), and only then waits `idleSettleMs` (1 s).
   - **Fix:** "1 s after the Play label became Pause".
6. **`docs/.../168-perf-interactions-baseline.md:4` — status still says "In Progress (C round 214 check pending)",** but C has passed. This follows the same pattern as 167, which was moved to Completed in the next round, so it's a follow-up rather than a defect.
7. **`biome.json` covers only `app/**`, so `npm run check` / `verify` don't lint `perf/`.** A used a scratch substitute (0 diagnostics), but this is still a gap in the gate.
   - **Proposal:** a separate small config task to add `perf/**` to `includes`.

### Good Practices Found
- **Liveness is real.** Each drag reads state mid-drag and at the end. `setLive` sets the row to 1 only if both the stopped and the playing drag were live. `audio-running` now requires at least 1 `start()`, so the autoplay flag alone can't pass it (GATE206-S6).
- **Reset is guarded.** Ctrl+Z only fires if the Undo `title` changed, so a no-op drag can't undo the Add. After the reset the spec checks that start, fade, width, range and the Undo title are all back.
- **Grab points are checked with `elementFromPoint`.** The spec doesn't use styling-class selectors.
- **The red-proof mutants are clearly scoped.** Each of M1–M4 fails with exactly the expected message, and they were run on a scratch copy.
- **The rules are consistent across both specs.** "measured row without a budget row", "row not measured N times" and the abort accounting (`shortByAbort`) work the same way. I counted the 144 rows: 12 + 66 × 2.
- **The `selectClipGainMembers` fixed wait was replaced with a state wait** on 2 `arrangement-clip-waveform`.

### Architecture note
- **Signal 3 (one region repeatedly changed):**
  - **Evidence:** `perf/studio-lab-interactions.perf.spec.ts` lines 102–124 (`snapshot`), 150–166 (`waitForQuiet`), 168–178 (`startTasks`, `reactRendererProblem`) and 132–148 (`isPlaying`/`setPlayback`), plus the median/determinism block at 816–873. These are copies of the same helpers in `perf/studio-lab.perf.spec.ts` (e.g. 136–140 ↔ 174–178).
  - **Keep this round:** the copies behave identically, and PERF-1a's baseline has to stay comparable with `a-round-212/perf-run-1.json`.
  - **Proposal for the planner — PERF-HARNESS-SHARED-LIB:** move the shared helpers into `perf/lib/` without changing behaviour.
    - **Acceptance criteria:** after the move, the deterministic medians in `latest.json` and `latest-interactions.json` are unchanged (0 difference), and both specs exit 0.
    - In the same task, tighten the determinism tolerance for ratio rows (code-review M2).
- **Signal 4 (new state in an existing owner):**
  - **Evidence:** `rendererVersions` added to `PerfState` (`instrumentation.ts:48, 86, 100`).
  - **Keep:** it serves the same role (harness observation) and doesn't add a new lifecycle.

### Alternative Approach
- This is test infrastructure, not critical business logic (auth, checkout or the audio pipeline), so it's N/A.

### Score: 8.5/10