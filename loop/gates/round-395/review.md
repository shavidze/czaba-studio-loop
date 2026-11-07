COMMIT: OK

I checked the diff, the full `preview.client.ts`, and the call sites in `ArrangementContext.tsx` (lines 1829–1949, 1706, 4547). I did not run the tests or a browser. I'm relying on the verify log and the C round-395 PASS you gave me.

**Scope.** The commit touches `preview.client.ts`, the test file and implementation doc 252. It doesn't touch auth, purchase, download, a token or any API client. `untracked.txt` is empty, so there are no new files. No `any`, `@ts-ignore` or type assertions. Semicolons are in place, there is no CSS, and the change is non-UI, so Tailwind and tokens don't apply.

### Findings (no blockers, ranked)

1. **Low – `preview.client.ts:120-126`, `:104-109`.** `handleError` reads `element.currentTime` before `stopActive()`. If that getter ever threw, it would escape from the `catch` blocks at `:107` and `:184`. Browsers don't throw on a `currentTime` read, so this is theoretical. If you want it covered, wrap the read: `let at = 0; try { at = element.currentTime; } catch {}`.

2. **Low – `:135-139`.** When the watchdog fires and `currentTime` has moved, the timer is left disarmed. Playback is only re-protected by a later `waiting` event. If a browser skips both `playing` and `waiting` after a time jump, there is no protection. The doc records this as the "Unarmed" state and the accepted trade-off, and I agree with that choice. No change needed.

3. **Low – `:147-152`, event ordering.** A `pause` that isn't ours, isn't `ended` and has no `error` ends the preview and calls `onEnded`.
   - This matches the HEAD-measured order in the doc: natural end fires `pause` with `element.ended` already true, so it is skipped. A cancelled source fires `error` without `pause`.
   - Our own stop removes the listeners before `pause()` and `load()`, so queued events can't reach the handler.
   - One edge is not verified in a browser: Safari/iOS interruptions that fire `pause` and then resume. They end the preview rather than resume it, which is the documented "stopped is the smallest honest state" choice.
   - Fix, if this is revisited: add a C row for iOS interruption.

4. **Low – `:153-158` / `:163-170`, listener leaks.** Each of the 6 listeners added has a matching `removeEventListener` with the same handler reference. PS26 checks this per `(type, handler)` pair. The timer is cancelled in `detach`, and the firing callback guards on `active === preview`. The provider's unmount cleanup calls `stopLibraryPreview` (`ArrangementContext.tsx:4547`), so no timer or listener leaks.

5. **Low – re-entrancy.** A synchronous throw (`:184`) or `fail()` calls `onStreamError`, which re-enters `startLibraryPreviewRef.current` (`ArrangementContext.tsx:1869`).
   - By then `active` is null and the source is in the fallback set, so it takes the decode path and can't loop.
   - The status text and pin ordering stay consistent.

6. **Test note (non-blocking).** PS26 relies on `mock.contexts`, and `restoreAllMocks` in `afterEach` undoes the prototype spy. PS24 restores real timers in `finally`. Neither can pollute other tests.

7. **Doc.** Implementation doc 252 follows the template and is in Georgian, with the Problem→Solution format and the known gap (the "drip-feed" stream) stated openly. No fix needed.

**Performance and accessibility.** There is no render-cost change. The timer runs outside React and re-arms only on `waiting`, `progress` or a same-URL seek. `progress` is a no-op while disarmed. No UI markup changed, so there is no accessibility impact.

### Architecture note
- signal 4 (new timer, listener and lifecycle in an existing owner): `preview.client.ts:127-174` → **keep.**
  - The stall watchdog, pause handler and listeners share one element lifecycle, and `detach` is the single cleanup point.
  - Extraction would split `armStall`, `disarmStall` and `active === preview` across modules and add plumbing.
  - The injectable `scheduleStallTimeout` already makes the watchdog testable, and the public `LibraryPreviewPlayer` shape is unchanged.
  - The cost of extracting is medium and the benefit is low today.
- signal 3 (repeated changes to one region): the stream branch of `playLibraryPreviewStream` has now changed in rounds 393, 394 and 395. If 13c-ii-b adds the stable seek key or signed-URL refresh here, a checkpoint is warranted.
- Proposal for the planner, to be done only after 13c-ii-b: extract the `createStreamPreview(element, hooks)` closure into a pure factory within `preview.client.ts`. The acceptance criteria are that PS1–PS26 stay unchanged and green, and the public interface stays the same.
- This is a diff review. It does not claim the whole module was checked.