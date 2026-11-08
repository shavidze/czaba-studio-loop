COMMIT: OK

The candidate touches only `perf/**` and two implementation docs (254 changed, 255 new). It changes no `app/**` file, so nothing in auth, purchase, download or the Studio runtime is affected. The `verify.log` I grepped shows the agent-reference check passing, `# fail 0`, and the vitest suites passing, but I did not read the rest of the log. My review is of the diff only.

## Findings, ranked (none block the commit)

1. **Medium-low: possible hang in `readBesideClip`** (`perf/studio-lab-interactions.perf.spec.ts:~202`).
   - `anchor.evaluate(...)` auto-waits on the original clip locator. If that clip is ever unmounted, the call stalls until the test timeout. It would not produce a clean `problems.push`.
   - It cannot happen on HEAD, where `isMounted()` is true and the function returns early. Under 14b-ii the original clip is the one Ctrl+D just duplicated and selected, so it should stay mounted.
   - Fix: add a `{ timeout: settleMs * N }` to the `evaluate`, or check `anchor.count() > 0` first and push a problem.

2. **Low: dead branch in `setupGroupClips`** (`~:990`). The `copyId === undefined` problem is unreachable. `readBesideClip` returns `null` when unmounted, and `value` is always defined when `isMounted` is true. Remove it, or fold the message into `readBesideClip`'s null path.

3. **Low: `Follow` restore is only verified under the sketch** (`~:229`). `followBefore === 'on'` followed by a click assumes the toggle goes from paused or off back to on. HEAD takes 0 reveals, so this path only ran on the virtualization sketch (`CopyReveals` 3, `FollowAtT0` `on`). If `data-follow-mode` can hold a value where a click turns Follow off, the post-click check does catch it, so the risk is bounded. Re-verify it when 14b-ii lands.

4. **Low: `CopyReveals` undercounts.** The setup's `copyAtRest` reveal is not counted, as doc 255 admits. A reader may take the metric as the total number of scrolls. Rename it, or add the extra reveal.

5. **Low: gap check assumes uniform clips** (`studio-lab-scale.perf.spec.ts`, `readScaleDom`).
   - `modelEndX = first.left − first.start·px + modelCount·first.width` holds only for the equal-length, back-to-back Control+d build.
   - It is documented in `scaleSequence` and doc 254. The check also takes the maximum `data-clip-count` over all `countedLaneSelector` lanes, which is fine for a single-lane build.
   - If someone reuses `readScaleDom` for another scenario, it will report false gaps. No change is needed now.

## Checks with no issues
- **Event ordering and leaks:** every programmatic `scrollLeft` change is followed by `waitForQuiet`, and the scroll position is restored and asserted within 1 px. The diff adds no listeners, timers or intervals. `expect.poll` replaces `toHaveCount` with the same timeout semantics, and the 10000 ms timeout in resources is kept.
- **Existing flows:** on HEAD there are 0 reveals and 0 Follow clicks, so the deterministic rows are unchanged (189/189 and 46/46 per doc 255). The budget JSON diffs change `note` fields only.
- **TS strict and style:** the diff has no `any`, `@ts-ignore` or type assertions, no new code comments, and every statement has a semicolon. `typecheck` and Biome passed via `verify`.
- **Tailwind, tokens and a11y:** not applicable. No UI code changed.
- **Test ids:** `arrangement-follow` and `data-follow-mode` exist in `ArrangementTransport.tsx:426-427`. `arrangement-timeline-scroller` exists in `StudioWorkspace.tsx:3334` and `arrangement-track-header` in `ArrangementLane.tsx:794`.
- **Docs:** doc 255 follows the template (context, approach, files, problems, testing, TODO) and doc 254 is updated consistently.

## Architecture note
- Signals: **repeated costly change** and **new lifecycle in an existing owner**.
  - `perf/studio-lab-interactions.perf.spec.ts:188-243` (`readBesideClip`, `followMode`) puts a generic reveal, read and restore helper, including Follow-state recovery, inside a very large spec. It is the second round in a row to touch this region (399 and 400).
  - Keep it for now. It is a byte-identical B patch with one consumer. Extracting it now would change Follow timing and the measured windows, and the helper is only exercised under the sketch.
  - Proposal for the planner, as one bounded task after 14b-ii:
    - **Ownership:** move `readBesideClip` and `followMode` to `perf/lib/page.ts`.
    - **Acceptance:** rows and `detail` keys are identical on HEAD and on the virtualized tree.
    - **Tests:** a perf-lib vitest for the null, mounted and revealed paths and for the Follow restore.
  - This note is not a fix for this round.