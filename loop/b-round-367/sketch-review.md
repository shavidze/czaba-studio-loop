# B round 367 → 368: sketch v3 rulings (PERF-9b-ii re-dispatch)

Sketch v3 = round-366 sketch (v2, sha 66ce5455…, already in the store tree) + `b-round-367/sketch-delta.patch.txt`.
Full patch vs `d53d113`: `b-round-367/sketch.patch.txt`. Shas: `sketch-dispatched.sha256`.

## L10 ruling on A's STOP: C-R367-DEDUP-CANCELLED-WRITE (Medium, = A-R367-REVIEW-DEDUP-CANCELLED-WRITE)

**Ruled: fixed in this round, with a variant of option 2 ("join").** Options 1 (accept as Low) and 3 (abort listener) are rejected:
- Option 1 leaves a cache-efficiency regression against HEAD. A and C each measured it (P1, P2).
- Option 3 only helps a load that arrives after the abort. It does nothing for "load 2 joins, then load 1 aborts".

**Contract.** `writes` holds `{ done, signals }`. A same-key storable load that arrives while a write is pending **joins** it: it pushes its own signal and starts no second write. The pending write is cancelled only when **every** joined signal is aborted, or the store is off. No replacement write is ever started for a key with a pending write. So `.finally(() => writes.delete(key))` stays unconditional; the identity trap does not exist in v3.

**Every same-key ordering against HEAD `d53d113`.** A and C measured P1 and P2. tech-lead confirmed the rest in its review of v3.

| Ordering | HEAD | v2 (round 367 tree) | v3 |
|---|---|---|---|
| (a) abort(load 1) after its body was read → load 2 arrives (effect re-run / StrictMode), sweep held (P1) or another key's put held (P2) | stored | **not stored** | stored, put once (SC30, both shapes) |
| (b) load 2 joins → load 1 aborts later | stored | not stored | stored (SC31 part 1) |
| (b') load 1 live → joining load 2 aborts | stored | stored | stored (SC31 part 3) |
| (b'') every joined load aborts | stored (HEAD ignored aborts) | not stored | not stored (SC31 part 2; the L3 contract) |
| (c) load 1 aborted while its body is still being read; load 2 already joined | not stored (HEAD's write returned on the catch and load 2 had been skipped) | not stored | not stored. **Accepted, equal to HEAD.** In a browser, load 2's own response normally arrives after load 1's rejection has cleared the map entry, so load 2 then writes itself. |
| (d) hit 200 with a newer ETag joins a pending older write | older bytes stored (HEAD skipped) | same | same. It heals on the next conditional request (200 → replace). |
| (e) hit 404/410 while a same-key 200 is still reading its body | write may land after the delete | delete after write | delete after write (SC32) |

A replacement branch was tried as "a new write when the pending one is abandoned". `M-V2-SKIP-ABANDONED` stayed green, because joining already revives the write. It would only add case (c), which HEAD loses too, plus the identity trap. So it was dropped as unneeded complexity.

## tech-lead review of v3 (read-only; run on the final client)

**Verdict: no Medium+.** The join is correct, with no regression against HEAD in any ordering.

| # | Finding (Low) | Ruling |
|---|---|---|
| TL3-1 | A load that joins in the microtask gap between a write's last `cancelled()` and `writes.delete` is lost silently. Unreachable in a browser, because a joiner arrives in a separate task; HEAD skipped such a load too. | Accepted. The doc must not call the join airtight. |
| TL3-2 | SC32's order check passed even with no put (`indexOf` −1). | **Fixed in v3:** `expect(fake.log).toContain('put:/a.mp3')`. Mutant `M-SC32-NO-WRITE` is red on SC32. |
| TL3-3 | No row for "first load live, joining load aborts". A mutant that checks only the last signal survived. | **Fixed in v3:** SC31 part 3. `M-V2-LAST-SIGNAL` is red on SC31. |
| TL3-4 | SC32 already passed on v2. It is a coverage row, not a v3 regression row. | Recorded in the task and the doc wording. |

## Coverage-gap rulings (C and reviewer Lows)
- **C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN:** not equivalent. The same-key wait matters while the pending write is still inside `arrayBuffer()`, before it reaches the commit chain. New row SC32 has a held body. `M-C367-DELETE-SKIPS-PENDING` is red on SC32.
- **A-R367-REVIEW-L-b (the quota-retry `cancelled()` had no row):** row SC33 was added. `M-L3-RETRY` is red on SC33. The doc claim "including the quota retry" becomes true.
- **A-R367-REVIEW-L-a (SC22 overstated):** the SC22 title is narrowed to "with no event it stays pending (the error-event order is SC23)". The doc credits the error-event rule to SC23 only.
- **A-R367-REVIEW-L-c, L-d, L-e, L-g:** go to `deferred_low_polish` (D-29z1207).
- **A-R367-REVIEW-L-f (doc):** fixed in this round's doc row.
- **C-R367-STATUS-LINE-PREMATURE:** under L28, A writes l.4 = `Completed (C round 368 PASS)`.

## B evidence (scratch `git archive d53d113` + `sketch.patch.txt`)

**Tests:**
- Covering: stem-cache 35/35 and source-fetch 6/6 (`sketch-covering.log`).
- The v1 client against the v3 tests is red on SC30 and SC31 only (`mutants/round367-client-vs-v3-tests.log`).

**Mutants:** 19, each red on its row (`mutants/mutant-summary.txt`, `mutants/mutant-*.diff.txt|.log`, generator `mutate.py`). The 13 round-366 mutants were regenerated on v3; `M-L5-BLOCKING` now waits on `.done`.

**Static checks:**
- `npm run typecheck`: rc 0 (`sketch-typecheck.log`).
- Biome on both files: rc 0 (`sketch-biome.log`).

**Full suite:**
- Before the TL3-2/TL3-3 test edits: 250 files, 3688 tests, rc 0 (`precheck-full-pre-tl.log`).
- On final v3: 250 files, 3688 tests, rc 0 (`precheck-full.log`).

**Browser:** the production build of v3 runs `b-round-366/probe/stem-integrity-probe.mjs` at 1440×900 and 1280×720 (`probe/sketch-*.json`, `.summary.txt`). Results:
- Every phase is ready, 0 page errors, pos ≈ 00:02.77, peak 0.31, 1 start.
- truncate: middle-east is re-stored with a 200 response.
- delete-file: hero is re-stored with a 200 response.
- stale-etag: `If-None-Match "b366-stale"` returns 200 and the record ETag becomes the server's.
- The other stem in each phase answers 304.

This matches C round 367. The dedup case has no deterministic browser trigger: it needs an abort between the body read and the queued commit, followed by a same-key reload. Its proof is unit only (SC30 and SC31), and the browser rows guard against regressions.
- **DEDUP probe on v3 (advisor follow-up):** C's round-367 P1/P2 block on the v3 scratch gives `storedA=true putCalls=2` in both (`dedup-probe-v3.log`). The proof log was renamed `mutants/round367-client-vs-v3-tests.log` ("round-367 client" = v2 tree).
