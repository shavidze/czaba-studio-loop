COMMIT: OK

This is a test-only and docs-only candidate. It touches `store-entrance-loader.test.tsx` and implementation doc 300. It makes no change to auth, purchase, download, `root.tsx`, `EntranceCover.tsx` or `SpotlightLoader.tsx`, so it adds nothing to runtime bundle size, render cost or accessibility.

I read the diff and the changed test helpers. I did not run the suite. The `verify.log` I searched showed the agent-reference check and node tests passing. I did not confirm the final vitest summary line for this file, so I'm relying on C's PASS for that.

**Findings (ranked, all Low, none blocking)**

1. **Boot listeners can outlive a test** (`store-entrance-loader.test.tsx:150-173`, E21/E21b).
   - These two tests run the boot script. They then hydrate cleanly and never mount `SpotlightLoader`, so no takeover occurs.
   - The boot script's capture listeners on `document` may therefore stay attached for the rest of the file, and the `afterEach` doesn't remove them (`:414-427`).
   - They could fire on later `fireEvent` calls and make a later test flaky. The suite passed and I found no concrete failure.
   - Fix: in `afterEach`, run `trackBootCaptureListeners` or dispatch the takeover event. Alternatively, add `expect(bootListenersLeft()).toBe(0)` after failsafe expiry in E21b, if the production code is meant to remove them at that point.

2. **Console and error handlers could be left installed after a failure** (`:382-396`).
   - `consoleError.mockRestore()` and the `error` listener removal only run on the happy path. The listener removal is in a `finally`, but `act` throwing skips `mockRestore`.
   - `vi.restoreAllMocks()` in `afterEach` covers the spy, so this is cosmetic.
   - Fix: put `mockRestore()` in the same `finally` block.

3. **Hydration-mismatch detection depends on React's message wording** (`:399-401`).
   - The filter is `/hydrat/i` on the error message, so a React upgrade that rewords the message makes E20 and E20b fail with a misleading cause.
   - The doc already admits E21b is a deliberate React tripwire. Say the same here.
   - Fix: add a short note in doc 300, or assert `recoverableErrors.length > 0` as the primary signal.

4. **Doc 300 says production differs from the tests in three ways** (doc lines 231, 238).
   - These are `hydrateRoot(document)` inside `startTransition`, a mismatch that clears the whole `<html>`, and a foreign node in `head` rather than `body`.
   - Only browser rows cover them. This is documented honestly, and it means E20 and E20b don't prove real-browser event ordering.
   - No fix is needed. Keep the browser rows (round 460 C11–C13, round 461 C7) as the gate for that behaviour.

5. **E11's regex is looser** (`:590`). It was `/<Links \/>\n\s*<EntranceCoverHead \/>\n/` and is now `/<Links \/>\s*<EntranceCoverHead \/>/`. That is fine, since the single-occurrence assertion on the next line still holds, and it tolerates Biome reformatting.

**Good practices**
- The new tests unmount the hydrated root in `afterEach`, and `unmountHydratedHead` nulls the reference before unmounting.
- E9 now checks that listeners are balanced: 2 boot capture listeners and 1 takeover listener before, 0 after.
- E1b checks the SSR branch with `vi.stubGlobal('window', undefined)` and always unstubs it in a `finally`.
- `notPrevented` in E8 is simplified.
- There are no `any`, `@ts-ignore` or type assertions. The `instanceof` narrowing is correct, there are no custom colours, and semicolons are present.
- The implementation doc is updated, as required by the implementation-docs rule.

**Architecture note**
- Signal 3 (repeated costly change): `store-entrance-loader.test.tsx` has been changed over many rounds (459, 460 and 461), and each round needs fake timers, a `window` stub, a boot-script `Function` and the hydrate helpers.
- Keep: the file is cohesive around one lifecycle (the cover handshake), and no invariant is hurt.
- Proposal for the planner, as one bounded task: move `installHeadCover`, `runBootScript`, `trackBootCaptureListeners`, `trackTakeoverListeners` and `hydrateHeadCover` into `app/lib/__tests__/helpers/entrance-harness.tsx`.
  - Acceptance: the same tests pass unchanged, and the test file shrinks.
  - Cost: low.
- The existing SIG-R459-ENTRANCE-HANDSHAKE (extract `app/lib/entrance-handshake.ts`) remains the larger and more valuable item.
- This is a review of the diff only and does not mean the module was fully audited.

**Score: 8/10**