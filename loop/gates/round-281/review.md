COMMIT: OK (the change only touches the perf test harness and its docs; nothing in `app/`, auth, purchase or download code changed; typecheck, unit tests and build passed; findings below are Low and none blocks the commit)

## Code Review: round 281 (perf load diagnostics and lane ids in the click-live row detail)

I've finished the review. I read the diff, the new doc 210, the copy text in `collection.ts`, the edited parts of the specs and `verify.log`. I also read the three required project files: the security checklist, the error code list and the architecture checklist. I didn't rerun the perf suite. The real-run and mutant results quoted below come from doc 210.

### Critical Issues
- None.

### Suggestions (most important first, all Low)
1. **`perf/lib/page.ts:159-167`**: `toHaveText(perfCollectionSettledPattern)` decides the wait is over, but the next checks run on the raw `textContent()` with patterns that must match from the first character. Leading whitespace or a wrapper node on `arrangement-status` would make the first check pass and the second throw "status is not ready". It's fine today: the real run had 0 problems and the MU-STATUS-WAIT mutant run hit this branch.
   **Fix:** use `const text = ((await status.textContent()) ?? '').trim();`. Apply the same `.trim()` to `status` inside the `waitForLibraryReady` predicate (l.179).
2. **`perf/studio-lab-resources.perf.spec.ts:226`**: this is a real behaviour change, not just a refactor. When a sound that isn't selected fails (`hero-music.mp3`), PERF-1b-ii now stops at load if the failed status shows before Add is enabled. HEAD would have kept measuring. MU-FAILED-OTHER shows this abort happened in 6/6 passes. Doc 169's "may continue" covers the opposite race only.
   **Fix (docs only):** add one sentence to doc 169 and doc 210's B-R281-RESOURCES-READY-FAILED saying that, in the measured runs, the usual result is an abort at load.
3. **`perf/lib/page.ts:171`**: `LibraryReadyState` is not exported, but doc 175's helper table lists it next to `waitForLibraryReady` as a shared item.
   **Fix:** mark it as internal to the module in doc 175, or remove it from that row.
4. **`perf/lib/app-labels.ts:110-123`**: `countedTemplatePattern` throws as soon as the module is imported. If the copy ever shows the count twice, or adds another matching digit, all three perf specs fail before any test starts. Failing early is the right call, but the error doesn't say where it comes from.
   **Fix (optional):** prefix the message with `perfCollectionFailedPattern:`.
5. **Tool coverage (an existing gap, not a finding against this round):** `npm run lint` only runs Biome on `./app` (verify.log l.38), so nothing checks formatting in `perf/**`. I checked the diff by eye: every statement ends with `;`. `perf/lib/page.ts:187` is probably longer than the formatter's line width.

### Checked, nothing found
- **Auth / purchase / download:** none of this code was touched. The security checklist doesn't apply because no tokens, user input or rendered output changed.
- **Error codes:** the error code ranges are for backend errors, and there are none here.
- **Accessibility, Tailwind/tokens, render cost:** no UI code changed.
- **Listener or timer leaks:** none added. The only new wait is a Playwright `waitForFunction` with a 90 s timeout, and Playwright cleans it up. The page-side check now builds a `RegExp` on every frame, which costs very little next to the existing `querySelectorAll('button')`.
- **Real-browser event order:** in `waitForLibraryReady`, the failed check runs before the ready check, so a failed status always wins. The status text can't flip from ready to failed and back within one pass (`collection.ts:54-62`).
- **TypeScript strict:** `tsconfig` includes `**/*.ts`, so `tsc` checked `perf/**`. There are no `any` types, no `!` and no `as` casts. The checks on `ownTrack` and `trackId` narrow the types properly; the MU-NO-OWN-GUARD mutant shows `tsc` fails (TS2322) without the `ownTrack` check.
- **The failure text and the patterns:** the singular and plural forms each contain exactly one count digit, so building the patterns at import is safe today.

### Good Practices Found
- The three 90 s ready-wait copies are now one function. Its return type is a union, so callers need no type casts.
- The waits only throw and never write to `problems`. The spec's catch records each failure once, and the two message prefixes show which wait caught it.
- The patterns are built from the app's own copy text, with no strings typed by hand in the harness.
- The new detail keys come after the three existing keys. The value, the `live` rule and the problem text are unchanged.
- Each mutant has an exact expected result, and a HEAD control run measured the old 90 s timeout.

### Architecture note (proposals only, not fixes for this round)
- **Signal: coupling change** at `perf/lib/app-labels.ts:110-131`. The harness now depends on how the app's copy text is built (calling `failed(count)` and finding the count digit), not just on what it says. This deepens the existing GATE279-ARCH-COPY-STRINGS signal.
  - **Keep for now:** it works and the comparison against earlier results found 0 problems.
  - **Proposal for the planner:** one bounded task. The app adds `data-collection-state="loading|ready|failed"` to `arrangement-status`. The three perf waits read that attribute instead of matching text. Done when `countedTemplatePattern` and the ready, failed and settled patterns are deleted and the three specs give equivalent results. Cost: low. Audio timing, refs, gestures and Undo/Redo stay untouched.
- **Signal: repeated costly change** in the load-wait area of `perf/lib/page.ts`. It changed in round 279 (state waits), round 280 (an export window next to it) and now round 281. Each time, the TODO sections of docs 168, 169, 175, 208 and 209 all got another round bullet.
  - **Keep the code.**
  - **Proposal for the planner:** keep one changelog of harness waits in doc 175 and replace the per-round TODO bullets in the other docs with a link to it.

### Alternative Approach
- **Current:** the waits match the failed and ready status text with patterns built from the copy.
- **Alternative:** wait on a status attribute that the app sets, as proposed above.
- **Verdict:** keeping the current approach this round is correct, because the round is limited to the harness and `app/` is frozen. The attribute is cleaner but needs a change in `app/`, so it should be a separate task.

### Score: 9/10