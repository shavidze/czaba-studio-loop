COMMIT: OK (the diff only touches tests and the perf harness. No runtime `app/` file changes, and auth, purchase and download code are not touched. Each of the four test rows now fails when the behaviour it names breaks, and the gate passed.)

## Code Review: round 295 (SYS-VACUOUS-ROWS), 8 paths

### Critical Issues
- None.

### Findings, ranked (none blocks the commit)

1. **Low: the perf harness check is now stricter, which adds a small risk of false alarms** (`perf/lib/report.ts:55`, used at `perf/studio-lab.perf.spec.ts:539`)
   - **Before:** the check passed if any long-animation-frame entry (a slow frame Chromium records) had a `scripts` list, even an empty one.
   - **Now:** at least one entry must have `scriptCount > 0`. That is the intended fix.
   - **Risk:** Chromium only lists scripts that ran longer than 5 ms. A fast settled window where every slow frame comes from layout or style work, with no long script, would now report `harness.loaf-scripts` even though the harness is fine.
   - **Evidence it is unlikely:** C's real-Chromium run found 4 of 5 entries with scripts at 1440×900 and 5 of 6 at 1280×720.
   - **Fix (only if it flakes):** split the message in two: "no long frames at all" vs "long frames but no script timings". Then a failure can be triaged without rerunning.

2. **Info: the gate never checks `perf/**`** (`vitest.config.ts:9`, `biome.json:66`)
   - The unit tests only run `app/**`, so the new LOAF1 tests are not part of the gate. ROOT-REQ-VITEST-PERF-INCLUDE already tracks this.
   - Biome lint also only covers `app/**`, so the new `report.ts` code was never linted. I checked by eye: semicolons and formatting are correct.
   - TypeScript does check `perf` (`tsconfig.json` includes `**/*.ts`), so the strict typing is verified.
   - **Fix:** add `perf/**` to both includes in one bounded task (see the Architecture note).

3. **Info: nothing tests that the page-side code records `scriptCount`** (`perf/lib/instrumentation.ts:214`)
   - LOAF1 builds its `PerfTimedEntry` test data by hand. If the line that writes `scriptCount` were removed, no unit test would fail.
   - This is acceptable because the code is serialised by Playwright's `addInitScript` and cannot import helpers. The doc records this, and C's real-browser run covers it.
   - **Fix:** none needed. Keep the real-Chromium perf check as the guard for this line.

4. **Info: DW12b relies on other tests to show the stall timer was started** (`app/lib/arrangement/__tests__/demo-synth-worker.test.ts:48-60`)
   - The test asserts the timer count is 0 afterwards but cannot first assert it was 1, because `postMessage` throws inside the same call. The timer is started at `demo-synth.client.ts:71`, before `postMessage` at `:73`, so the test is still meaningful.
   - DW12 checks the count is 1 before settling, which covers "the timer was set".
   - **Fix:** none.

5. **Info: SD10 has to restate every prop of the component** (`self-disabling-focus.test.tsx:87-110`)
   - It renders `ArrangementTempoRow` with no provider and passes the full `rulerGestures` object by hand. TypeScript will catch changes to the props, but each change will need this test updated.
   - **Fix (optional):** move the props into a small `tempoRowProps()` factory if a second test needs the same setup.

### What tests cannot catch, checked
- **Browser event ordering:** SD10 tests the guard on the button itself (`guardSoftDisabledClick` at `ArrangementTempoRow.tsx:291`), not the context's early return. That is why it now fails if the guard is removed.
- **Timer and listener leaks:** the new tests turn fake timers on and `afterEach` puts real timers back, unstubs globals and resets `FakeWorker`. Nothing leaks between tests.
- **Render cost:** no change; no component code changed.
- **Accessibility:** SD10 checks both states of `aria-disabled` (`'true'` and `null`).
- **Tailwind and design tokens:** no change.
- **TypeScript strict:** no `any`, no type assertions, no suppression comments. The new import in `report.ts:3` is `import type`, so no Node-side code is pulled into the in-page instrumentation.
- **Security and the error-code ranges:** not applicable. No user input, tokens, API calls or error codes are touched.
- **Implementation doc:** numbered 219, the next after 218, with no duplicate. All required sections are present.
- **Other users of the problem message:** the `harness.loaf-scripts` string is unchanged. Outside the new files, it only appears in the historical doc 163.

### Good Practices Found
- Each of the four rows was tested with a deliberate code-breaking change ("mutant") that turns it red, plus a control showing the old row could not fail.
- The harness rule moved out of the spec into `loafScriptsProblem`, a small function that can be tested on its own and is covered by four cases.
- The doc explains why the in-page code stays inline (the `addInitScript` limit) and states the testing gap openly.

### Architecture note
- **Signal 2, ownership/coupling change:** `perf/studio-lab.perf.spec.ts:539` → `perf/lib/report.ts:55`, plus a new type-only dependency `report.ts → instrumentation.ts`. **Keep it:** a small rule leaves the spec and becomes a function that can be tested on its own, which reduces coupling.
  - **Proposal for the planner (one bounded task, not part of this round):** add `perf/**` to the `vitest.config.ts` include and `perf/**/*.ts` to the `biome.json` includes.
  - **Acceptance:** LOAF1 and the other `perf/lib/*.test.ts` files appear in `npm run test:run`, and `npm run check` reports on `perf/lib/report.ts`.
  - **Risk:** existing `perf/` files may raise a burst of Biome findings. Run `check` (read-only) first to measure it.
- This only covers the diff; I did not check the whole module.

### Alternative Approach
Not applicable. This round has no auth, checkout or Studio audio pipeline logic. For the harness rule, the rejected option of checking `scriptMax` cannot tell an empty `scripts` list from a script that took 0 ms. Counting scripts with `scriptCount` measures the right thing.

### Score: 9/10