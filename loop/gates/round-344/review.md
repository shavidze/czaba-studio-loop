COMMIT: OK

I read the diff, the spec helpers, the budgets JSON and `verify.log`. I did not run anything. `untracked.txt` is empty, so there are no new files. The candidate touches only two docs, `perf/budgets.interactions.json` and `perf/studio-lab-interactions.perf.spec.ts`. No `app/` source is touched, so nothing in auth, purchase or download is affected. `verify.log` shows no failures (`# fail 0`). The error and "must be used within" lines in it are existing test noise.

## Code Review: perf/studio-lab-interactions.perf.spec.ts, budgets.interactions.json, docs 168/232

### Critical Issues
- None.

### Suggestions, ranked
1. **`studio-lab-interactions.perf.spec.ts:1741-1762`: the failure path is not self-cleaning.** If `measureDrag` throws between setup and teardown, the outer `catch` records the failure. The video clip, zoom keys and playback state are then left behind. This is safe today because the block is last in the 1× pass, and the docs say so. Fix: if another step is ever added after this block, wrap setup-to-teardown in `try/finally`, or put `setPlayback(false)` and teardown in the `catch`.
2. **`:788-802`, the zoom loop: `boundingBox()` can return null.** It is handled with `?? 0`, so a missing element becomes a "0 px wide" problem rather than a clear "element not found". It is bounded at 16 keys. Fix (optional): report "name bar not visible" separately from "too narrow".
3. **`:347-369` (`teardownVideoClip`) can leave playback running if `setPlayback(false)` fails earlier.** Fix: none needed now. Keep teardown after `setPlayback(false)`.
4. **Doc nit: `232-perf-drag-preview.md:57` (#68) and `168:12`.** The "Undo entry required" check is in the spec (`:315`), and the docs describe it. Count consistency checks out: 219 + 11 = 230 rows, and 4 + 6 + 1 = 11 video rows in the JSON.

### Real-browser concerns
- **Event ordering:** `waitForQuiet` after each `=` press and after the file import gives the layout time to settle. The `blurActive` call before the key presses prevents a focused file input from swallowing them. No new listeners or timers are added in the spec. All waits are bounded (30 s import timeout, 16 keys, 3 Ctrl+Z).
- **Accessibility, Tailwind/tokens, TS strict:** no UI or CSS is touched. The spec adds no `any`, no assertions and no suppression directives. It uses the existing `quotedAttributeValue` helper for the locator, so there is no selector injection. The fixture is a tracked file under `public/videos/hero/`.
- **Runtime cost:** `durationMs` is 469 s, 52 % of the 15-minute timeout, per doc 232. That headroom is acceptable, but note it.
- **Budgets JSON:** all 11 rows are `record` with `budget: null`, so no gate can fail on them. The `wallclock` kind on `playing.move-components-per-move` is justified by the [5903, 5901, 5903] non-determinism evidence.

### Good Practices Found
- The video block runs last and only at 1×, so all 157 existing non-wallclock rows stay identical (doc 232 reports "0 differences vs round 343").
- `rows: 'all-but-ratio'` keeps the commits-per-move row count at 16.
- Setup problems write liveness 0 with `{ setup: 'failed' }`, not a silent skip.
- The liveness row is set only after both drags complete.
- Rows move from `record` to `assert` only after a sketch run and a red mutant, following the earlier c3-i and c4-i pattern.

### Architecture note
- signal: `perf/studio-lab-interactions.perf.spec.ts` (about 1,700+ lines; `setupVideoClip` at :765 and `teardownVideoClip` at :824 follow the group-clip setup and teardown shape) is the same region changed in rounds 335, 339, 343 and 344. This is a repeated-costly-change signal, and the existing ARCH-R339-DRAG-MEASURE-EXTRACT item already tracks it.
  - Keep for now. The invariants are the drag windows, the `measureDrag` row semantics and the Undo-title teardown.
  - Cost of extracting: medium. The risk is shifting the timing windows that the budgets depend on.
  - Proposal for the planner, one bounded task after c5-ii: move `setup*/teardown*Clip` and the `measureDrag` family into `perf/lib/` with no behaviour change. The acceptance check is an identical row-compare against round 344 (230 rows, 0 DIFF).
  - This is not a fix for this round.
- This is a review of the diff only, not a full audit of the module.

### Alternative Approach
Not critical business logic (perf harness only). The alternative to a `record` row first would be to assert immediately, but that would fail with HEAD's 98 components per move. Recording first is correct.

### Score: 9/10