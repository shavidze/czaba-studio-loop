COMMIT: OK

I read the whole diff and the changed code in `stem-cache.client.ts`. I did not run the code or the tests. I'm relying on your report that C passed and `verify` passed.

**Scope check**
- The commit touches only `stem-cache.client.ts`, its test file and implementation doc 236.
- It doesn't touch auth, purchase or download code.
- `createBrowserStemCacheStore` and `createCachedSourceFetch` are used only at `stem-cache.client.ts:506-507`, the public-preview shared fetch. That fetch uses `credentials: 'omit'`, and the purchased-stem adapter doesn't go through it.
- The test file adds no `any`, `@ts-ignore` or type assertions. There are no new Tailwind or token changes.

**Findings, ranked (none block the commit)**

1. **Low – `stem-cache.client.ts:192-209`, `put` after an aborted record write.**
   - If `record.fileName` equals `previous.fileName`, the failure path (`removeFile(record.fileName)`, line 207) deletes the file the old record still points to. The old record then references a missing file.
   - This isn't a correctness bug, because `get` treats the missing file as a miss and cleans up (lines 181-185). It does lose a valid entry.
   - Fix: skip `removeFile` in the catch when `previous?.fileName === record.fileName`. Or confirm that file names are always unique per write, and add a one-line test for it.

2. **Low – `stem-cache.client.ts:~417-437`, `writeInBackground` join.**
   - `A-R368-REVIEW-L1` is already documented as open in the doc's TODO. A pending write W, a hit 404 that queues a delete behind W, and a third storable load that joins W leave the key deleted after W lands.
   - The result is a lost cache entry that the next load restores.
   - Fix, if you want it: in `deleteAfterPendingWrite`, record a tombstone on the pending write. A joining load then either starts a new write after the delete or cancels the delete.

3. **Low – `commitChain` and `deleteAfterPendingWrite` (`stem-cache.client.ts:~304-310`, `~362`).**
   - If a store call never settles (the TL-3 risk you accepted), every later queued `storeBytes` closure keeps its `ArrayBuffer` alive until the page closes.
   - That means up to one stem body per queued write, and the loads themselves stay unblocked.
   - Fix: cap the number of queued writes, for example by dropping new `storeBytes` calls while more than N are pending. Or add a bounded timeout once a measured limit exists.

4. **Info – the `transactionDone` handlers (`stem-cache.client.ts:66-71`).**
   - The handlers are assigned in the same tick the transaction is created, before any event can fire. That is correct for real IndexedDB.
   - They are single-slot `oncomplete` and `onabort` assignments, which is fine here because nothing else listens on these transactions.
   - Real-browser ordering: abort rejects with `transaction.error`, and the error-then-abort ordering is covered by SC23.
   - In `touch` (line 219), `put` runs inside `onsuccess` of the same transaction, so the transaction stays alive. That is correct.

5. **Info – the doc cites evidence outside the repo.** Doc 236 references `b-round-36x/...` logs that live outside the repository (`/home/runner/czaba-project/tmp/studio-real-loop`). That is acceptable, but the claims can't be re-checked from the repo alone.

**What looks good**
- Commit discipline now follows the real IndexedDB contract: a write is done on `complete`, and the previous file is removed only after that.
- There are no timers or listeners that leak in production code.
- `idle()` now covers writes, queued deletes and `commitChain`.
- The tests cover event ordering with a fake IndexedDB plus OPFS, including a held commit and a failed put.
- 19 mutants are mapped to the tests that catch them.

**Architecture note**
- Signals: `stem-cache.client.ts` now holds the IndexedDB and OPFS adapter (`createBrowserStemCacheStore`, lines 107-260) together with the session write scheduler. The scheduler covers `commitChain`, the pending-writes map with its join signals, and `deleteAfterPendingWrite` (lines ~295-495).
- This matches the "mixed responsibilities" and "new state/lifecycle in an existing owner" signals.
- A third signal is repeated costly change: this region has been changed in rounds 365, 367 and 368, each time needing a fake-storage and ordering test.
- Keep, for now. The two halves share one invariant, commit-before-file-removal. The adapter's public shape is `StemCacheStore`, and tests already exercise each half through that interface.
- Proposal for the planner, a bounded task and not a refactor for this round: move the browser adapter into a sibling `stem-cache-browser-store.client.ts`, leaving `createCachedSourceFetch` and the scheduler where they are.
  - Acceptance: SC1–SC33 unchanged and green, and the exports `transactionDone`, `createBrowserStemCacheStore` and `createCachedSourceFetch` still importable from the existing module path.
  - Cost: low to medium, mostly import paths.
  - Do it only if a fourth change lands in this region.
- This review covered the diff and the touched regions of the file, not the whole module.

**Score: 8/10**