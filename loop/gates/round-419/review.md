COMMIT: OK

## Code Review: stem-cache.client.ts, stem-cache.test.ts, docs/implementation/2026/quarter-IV/270-sys-stem-cache-write-coordinator.md

I reviewed the diff and the surrounding source. I did not re-run the tests or the browser checks. I relied on C's PASS and `verify.log`, and I did not open the logs. I read the two required primitives. SECURITY_AUDIT and ERROR_TAXONOMY have no hits here, since this change has no auth, token, XSS or error-code surface.

### Critical Issues
- None.
- The diff touches no auth, purchase, download or protected-file code. All three files are the public-preview stem cache plus its tests and its doc.
- There are no `any`, no type assertions and no suppressions, and there are no code comments. The new `StemKeyOperation` union is discriminated by `kind`.

### Suggestions (ranked, all Low, none block the commit)
1. **`stem-cache.client.ts:541-543`, `idle()` drain.**
   - The `while (operations.size > 0)` loop never ends under continuous traffic. The doc accepts this because only tests and teardown call `idle()`.
   - Fix: when a production caller appears, snapshot the operations once, or add a bounded retry count. Keep the loop for tests.
2. **`stem-cache.client.ts:432`, `await after`.**
   - The response buffer is held in memory while the write waits for the previous same-key operation. The write stays `open` and joinable during this wait.
   - That is correct, because a later live signal rescues a write whose first signal was aborted. It is also the GATE368-L3 retention item the doc already lists.
   - Fix: when STEM-LANES lands, put a cap on queued bytes that counts both holding points.
3. **`stem-cache.client.ts:484-486`, `.finally(settle)` on a rejecting `write`.**
   - If `now()` throws, `done` rejects and nothing handles it. The next same-key write then rejects on `await after`.
   - This was already true before the change and is recorded as TL-R419-L4(c). It is unreachable with the production clock.
   - Fix: add `.catch(() => undefined)` before `.finally`, or have `write` catch around `now()`.
4. **`stem-cache.client.ts:208-210`, name guard.**
   - It throws `InvalidStateError`, and the write path then permanently disables the cache for the session (`disabled = true`).
   - This is safe because the counter makes the throw unreachable in one session, and a guard that fires is better than deleting a live file. Cross-tab collisions would need the same millisecond, counter and random part.
   - Fix: none needed. If this ever shows up in the field, make the guard skip the write without setting `disabled`.

### Browser-only concerns
- **Event ordering in `removeIfCurrent` (`:173-186`):** this is correct. `request.onsuccess` is attached synchronously after `store.get` and runs inside the same readwrite transaction. `store.delete` is issued from the callback while the transaction is still active. `transactionDone` waits for the commit before `removeFile`.
- **Concurrent `put`:** if a `put` replaces the record between `get`'s `readRecord` and `getFile`, the stale file is already gone. The conditional delete does nothing and the caller sees a clean miss. SC37 exercises this ordering.
- **Listeners and timers:** the diff adds no listeners, timers or subscriptions. `settle` removes only the operation that is still current, so the map cannot hold on to superseded operations.
- **Render cost and accessibility:** neither applies. There is no React, DOM or Tailwind in the diff.

### Good Practices Found
- A single per-key operation map replaces the separate `writes` map and `deletes` set. `settle` is guarded by identity, which removes the 200→404→200 lost-key race (SC34).
- `open` is cleared in the same synchronous step as the abandon decision. The doc honestly records the equivalent mutant and the reason for it.
- The integrity delete is conditional on `fileName` inside one transaction, and SC37 forces that ordering with a real `holdNextGetFile` gate.
- SC41 locks the public surface to `fetchSource` and `idle`. The SC26 assertion is now meaningful, and the doc lists the mutant results.
- The implementation doc follows the rule: the Georgian text and the Mermaid diagrams are present, and the open items are listed.

### Architecture note
- **Signal: mixed responsibilities** (`stem-cache.client.ts:107-278` browser IndexedDB/OPFS store, `:287-547` per-key coordinator, `:549-562` singleton).
  - The same region has been changed in rounds 367, 368 and 369, which is the repeated-costly-change signal.
  - Keep for now, because:
    - The store and the coordinator share one lifecycle.
    - The public shape is two exports, locked by SC41.
    - No audio timing, refs or gesture lifecycle are involved.
    - The cost of extracting is medium, and it would restructure the test harness mid-feature.
  - **Proposal for the planner (one bounded task, to run after STEM-LANES or when the next change lands in this file):**
    - Split the file into `stem-cache-store.client.ts` (browser store and `removeIfCurrent`) and the coordinator.
    - Move the code only. `createBrowserStemCacheStore`, `createCachedSourceFetch` and `publicPreviewSourceFetch` keep their import paths via re-export.
    - Acceptance: the existing SC1–SC41 pass unchanged, and the C browser phases give the same results.
  - This is a note for the planner. It is not something to fix in this round, and it was not checked beyond this diff.

### Alternative Approach
- **Current:** one `Map<key, write | delete>`. A new write chains behind the previous operation's `done` and re-queues itself through the global `commitChain`.
- **Alternative:** a promise-chain mutex per key, so every operation (load, delete, integrity delete) just does `tail = tail.then(op)`, with no `open` flag and no tombstone logic.
- **Verdict:** the current approach is better here.
  - Joining open writes shares one body read and one put across concurrent loads. A pure chain would store duplicates.
  - The abort-aware `abandoned()` check needs the signal list that the write object carries.
  - The cost is the extra `open` invariant, which the doc already documents.

### Score: 9/10