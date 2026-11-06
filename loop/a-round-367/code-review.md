# code-reviewer report, round 367. Verbatim final message of the `code-reviewer` subagent (agentId ab08fc903d4dca6ab), read-only, no shell

## Code Review: PERF-9b-ii stem cache commit discipline (3 files)

**Scope and limits.** I had no shell, so I could not run `git diff`, the tests, Biome or the typecheck. I rebuilt the diff from `/home/runner/czaba-project/tmp/studio-real-loop/b-round-366/sketch.patch.txt`, and both changed source files match it hunk for hunk. In the test file, the patch only adds two names to the import block plus everything after line 757, so SC1–SC21 are unchanged. All eight rulings (TL-1..TL-8) are actually in the code:
- **TL-1:** lines 66–72.
- **TL-2 and TL-5:** lines 358–367, 459–469.
- **TL-3:** the "cancelled while queued" return is at line 312.
- **TL-7:** lines 141–152 and 214–226.
- **TL-8:** lines 476–480.

The serialised second write is not lost in practice: the browser probe `probe/probe-summary.txt` stores both entries on a cold load in both viewports on the sketch build.

### Critical Issues
- None.

### Suggestions

**Medium — the "one write per key" check can now drop a write for a longer time.** `stem-cache.client.ts:411` and `:311–313`, `:323`, `:329`.
- `writeInBackground` skips a second write while `writes.has(key)` is true, assuming the first write will land.
- After this diff, a pending write can wait on `commitChain` behind another key's sweep, list, evict and put, then quietly do nothing when `cancelled()` is true.
- How it happens: the load effect at `/home/runner/czaba-project/store/app/contexts/ArrangementContext.tsx:4063–4130` runs again (a dependency changes identity, or StrictMode in dev). Its cleanup aborts load 1 after the body was read but while the write is queued. Load 2 for the same key misses the cache, sees `writes.has(key)` and skips writing. Write 1 then cancels. Two loads succeed and nothing is cached.
- The early return at line 381 already existed. The diff makes the window much longer: before, it lasted only while `arrayBuffer()` ran; now it lasts until the chain reaches this key.
- Impact is performance only: the next open downloads the file again.
- Fix: treat a pending write whose signal is aborted as absent, for example by storing `{ promise, signal }` in `writes` and allowing a new write when `signal.aborted`.
- No row covers this overlap. SC19 awaits `idle()` between the abort and the third fetch.

**Low — SC22 does not test what its title says (and TL-1 cites it as evidence).** `stem-cache.test.ts:986–994`.
- The `waiting` block never fires an event. `CompletableTransaction` has no `onerror`, so the test cannot fire one. It only proves that a transaction with no events stays pending, which any implementation satisfies.
- The real guard for TL-1 is SC23: the fake fires `onerror` before setting `transaction.error`, and `M-SC22-ONERROR-NULL` is red on SC23 only.
- So three places overstate SC22: the test title, doc lines 61 and 146 ("SC22, SC23"), and the TL-1 row in sketch-review ("SC22 … an error event alone stays pending").
- Fix: give the fake transaction an `onerror` slot, fire it, then race.

**Low — no test for the cancel check before the quota-retry put, and the doc credits SC24 with it.** `stem-cache.client.ts:344–346`.
- No row reaches the quota-retry branch with an aborted signal, and neither L3 mutant (`M-L3-EVICT`, `M-L3-PUT`) targets this line. Deleting it leaves all 31 rows green.
- Doc line 62 says "ყოველი `put`-ის წინ, quota retry-ის ჩათვლით (SC24)" (before every `put`, including the quota retry). SC24 covers only the first put.
- The same is true of the early return at line 312 (TL-3's "fixed part"). Without it, the check at line 323 still prevents any write, so dropping it only costs an extra sweep and list. That makes it effectively untested too.

**Low — `idle()`'s wait on `deletes` is not tested on its own.** `stem-cache.client.ts:478`.
- `M-IDLE-NO-DELETES` (`sketch/mutant-M-IDLE-NO-DELETES.diff.txt`) removes both line 478 and line 479.
- In SC29 the delete is already on `commitChain` (via a microtask) before `idle()` is called. A mutant that removes only line 478 would stay green.
- The line is harmless, but the doc presents "idle waits for deletes" as a separately tested property.

**Low — no cancel check between victim deletes.** `stem-cache.client.ts:326–328`.
- After an abort, the remaining victims are still deleted. Doc line 62 is accurate as worded, since the check after list and quota stops the first victim.
- SC24 has a single victim, so this is not covered.

**Low (information only, not re-raising TL-5) — the TL-5 reasoning names the wrong record.** `stem-cache.client.ts:166–172`, `:181–189`.
- `remove()` reads the record again before deleting. If an integrity miss in `get` races a same-key `put` that has just committed and removed the previous file, `remove` deletes the new, valid record and its file.
- The accepted risk still holds: the result is a miss, with no orphan or corrupt entry. But the ruling's wording ("deletes a record that is already broken") is wrong about which record is lost.
- Optional tightening: delete using the record `get` already holds.

**Low — docs** (`/home/runner/czaba-project/store/docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md`).
- **Line 160:** still states the "browser store `get` integrity only in browser rows" limitation as current. Line 181 says stage 3 closed it. Mark line 160 as superseded.
- **Lines 82–83 (stage-1 mermaid):** "delete entry → network response" now runs in the other order. The response returns first and the delete runs later on the chain. The stage-3 sequence diagram is correct.
- **Line 4:** the status "Completed (C round 367 PASS)" claims a result from a round that is still under review. I could not check it.
- **Line 124:** the new imports also include `type CompletableTransaction`.
- **Line 183:** understates. The `nosize` probe is red on both truncate and delete-file, not only truncate.

**What I checked in the doc and found correct:**
- Every named test id SC22–SC29 exists.
- All 13 mutant ids and their red rows match `sketch/mutant-summary.txt`.
- The count 31/31 is right (6 + 17 + 8).
- The claims for items 1–6 match the code, apart from the overstatements above.
- The TL-3 statement "cachedFetch only waits for get, touch and the network" is accurate (lines 433, 444, 456).

**Low — test helper.** `stem-cache.test.ts:1169`. `expect(served.headers.get('x-injected')).toBeNull()` can never fail, because a single `Headers.set` value cannot create a second header. The `content-type` assertion is the one that does the work.

### Good Practices Found
- `put` keeps the previous file until the record transaction completes, and an aborted record write cleans up the new file. SC23 tests this against a fake that follows the IndexedDB event order (request error → `onerror` → `error` → abort).
- `transactionDone` handlers are attached after the request is queued and only settle on `complete`/`abort`, so the quota error object survives to `isQuotaError`.
- No rejection is left unhandled: `commitChain` swallows rejections, `deleteAfterPendingWrite` catches, `write` never rejects, and the sweep has a catch.
- The fake IndexedDB/OPFS has no `any` or type assertions. A request inside `touch`'s `onsuccess` correctly keeps the transaction from committing.
- The `content-type` guard serves the bytes with no type rather than an injected header (fine for XSS and header injection).

### Architecture note
- Signals: `/home/runner/czaba-project/store/app/lib/arrangement/stem-cache.client.ts:293–303`, `:358–367`.
  - Signal 3: this region of `createCachedSourceFetch` has now been changed in three rounds (365, 366, 367).
  - Signal 4: new session state (`commitChain`, `deletes`) was added to the owner of the fetch policy.
- Verdict: keep. It is one session lifecycle, its rules are covered by SC17/20/24/25/27/29, and moving the queue out would mean passing `disabled` and `writes` around for no gain.
- No new task. This belongs to the existing `ARCH-CHECKPOINT-PERF9-STEM-CACHE` TODO (doc line 188) for the planner.

### Alternative Approach (if it is critical logic)
- **Current:** one commit queue per session, with cancel checks between awaits, and hit-path deletes queued after the same-key write.
- **Alternative:** one write per key at a time and no queue, with eviction planned inside a single IndexedDB readwrite transaction covering list, evict and the record put.
- **Verdict:** keep the current approach. OPFS writes cannot join an IndexedDB transaction, so the alternative still needs ordering outside the transaction to avoid orphan or evicted files. The queue is the smallest correct fix, and TL-2 keeps it off the response path. The cost is the Medium window above, which is fixed locally in the duplicate check, not by changing the approach.

### Score: 8/10
