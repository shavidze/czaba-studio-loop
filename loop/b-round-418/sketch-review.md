# Sketch review: round 419 SYS-R369-STEM-CACHE-WRITE-COORDINATOR (L58)

- **Dispatched sketch:** `b-round-418/sketch-419.patch.txt`
- **Reviewed sha256:** `fb6653194ff231fb588954d8c0e348fa1a57f517f7be7b3c7f4eb2bb1d1a02f5` (= `sketch-419.sha256`; the dispatched file is unchanged since the review).
- **Reviewer:** `tech-lead` (read-only, on `/tmp/b419-scratch` = `git archive` of HEAD `3579fcc` + this patch; code-reviewer is not on B's consult list). It re-checked the sha, typecheck, Biome and the 43 rows.
- **Pre-review evidence on the same sha:** mutants (`mutants/summary.txt`, 15 lines); covering run (`precheck-a2.log`, 49/49); full suite (`precheck-full.log`, 264 files, 3942/3942); typecheck, lint and Biome (`precheck-*.log`); loaded replicate (`precheck-loaded.log`, 43/43); production-build browser HEAD vs sketch (`probe/compare-head-vs-sketch.txt`, ALL EQUAL, 4 phases × 2 viewports).

## Verdict
**Verdict: approve with changes** (tech-lead, 2026-11-09). The changes are documentation only. No Critical, High or Medium findings. Nothing in the sketch loses a store HEAD kept, stores wrong bytes under a record, leaks an operation, or deadlocks (`after` only points back to an earlier operation on the same key; no commit task waits on an operation's `done`).

## Reviewer findings and B rulings
| Id | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R419-L1-OPEN-INVARIANT | Low | Record why MU-JOIN-IGNORES-OPEN is equivalent: it is structural. Between `abandoned()` setting `open=false` and `settle()` there is no wait on a store or network call, and a joiner can only arrive from a task. Keep `open` as insurance: an awaited cleanup added later after a `cancelled()` return would make the mutant live | **In the task:** ruling 3 states the structural reason; doc 270 must state it as an invariant (C row 7). Not added to `lessons.md` (60-line cap; it is code-specific) |
| TL-R419-L2-L3-TWO-HOLDING-POINTS | Low | The sketch adds a second place where a buffer is held: a write waiting at `await after`, besides a write queued in `commitChain`. A GATE368-L3 limit must count both | **Backlog:** GATE368-L3's entry names both holding points; STEM-LANES planning measures the limit |
| TL-R419-L3-IDLE-DRAIN | Low | `idle()` now drains until no operation is left, instead of waiting on a snapshot. Under continuous traffic it would not resolve. No production caller (tests only) | **In the task:** ruling 4 and doc 270 record the change. Accepted: `idle()` is a test and teardown hook |
| TL-R419-L4-KNOWN-GAPS | Low (pre-existing) | (a) A joiner is lost if the first load aborts while the shared clone's body is still being read: the clone's body errors. (b) A newer storable 200 that arrives while an open same-key write is pending joins it, so the older bytes are stored; record and bytes still match, and the next conditional request corrects it. (c) If an injected `now()` throws, later writes on that key reject at `await after` | **Backlog:** `deferred_low_polish` as known gaps, not regressions (HEAD has (a) and (b); (c) needs a throwing injected clock, which no caller passes) |

## Answers recorded for C
- **removeIfCurrent in real IndexedDB:** a request made inside another request's `onsuccess` keeps the transaction active (the read-modify-write pattern that `touch()` already uses at HEAD). A failed get aborts the transaction; `get()` rejects and the cached fetch falls back to a plain fetch.
- **The name guard turns the store off:** acceptable. A collision now needs the same millisecond, counter and random value, so hitting it means a logic bug, and off is the safe response. The quota retry cannot hit it: the failed put has already removed its file and the record transaction aborted.
- **Timing:** the fakes resolve in microtasks and `flushTasks(10)` waits on macrotasks, so a positive wait fails loudly if anything slows down. SC35's "still pending" checks can only miss a bug, never fail falsely.

## Ordering matrix (L58): per-key operation in flight × incoming event on the same key
Kinds in flight (n = 5):
- **Wr** write reading its body (open)
- **Wq** write waiting: at `await after` or queued in the commit chain (open)
- **Wc** write committing: sweep, list, victim deletes, put, quota retry
- **Wx** write closed (abandon decided), before `settle`
- **D** delete queued behind the previous operation, or committing

Incoming events (n = 6):
- **L+** a storable 200 (miss, or hit 200)
- **L−** a hit 404, 410 or unstorable 200 (queues a delete)
- **A** an abort of a joined signal
- **I** `idle()`
- **G** a browser-store `get` integrity miss on the key
- **O** a write on another key

5 × 6 = **30 cells.**

| in flight ↓ / incoming → | L+ | L− | A | I | G | O |
|---|---|---|---|---|---|---|
| **Wr** | join: SC17, SC31 | delete after the write: SC32, SC35 | all aborted → nothing stored (SC12); a live joiner keeps it (SC31) | pending: SC35 | x-store¹ | SC20 |
| **Wq** | join: SC30 (held put of another key) | delete after the write: SC25 | chain-start return: SC40; a joiner before the turn revives it: SC30 | pending: SC35 (loop) | x-store¹ | SC27, SC30 |
| **Wc** | join: SC31 (held sweep) | delete after the write: SC25 (held put) | SC24, SC33, SC36 (victim loop) | pending: SC29, SC35 | SC37 (put racing an integrity miss) | SC27 |
| **Wx** | own write after it: ruling 3, x-struct² | delete after its `done`: x-same³ | x-na⁴ | waits for `settle`: x-same³ | x-store¹ | x-same³ |
| **D** | own write after the delete: SC34 | second delete after the first: x-same³ | x-na⁴ | pending: SC29, SC35 | x-store¹ | SC27-analogue x-same³ |

Notes:
- **¹ x-store:** `G` lives in the browser store, below the operation map; it does not read the map. Its race with a same-key put is SC37; plain integrity misses are SC15 and SC28.
- **² x-struct:** the closed window has no wait on a store or network call, so no joiner can arrive in it (TL-R419-L1). MU-JOIN-IGNORES-OPEN is the accepted equivalent mutant; `open` stays as insurance.
- **³ x-same:** the same code path as the named neighbour row: the new operation captures `operations.get(key)?.done` as its `after`, for every kind (SC34 proves the delete case, SC30 the write case). Covered by the full suite on the sketch (3942/3942).
- **⁴ x-na:** a closed write and a delete hold no signal; an abort has nothing to change.

**Cell count:** 30 = 18 named (Wr 5, Wq 5, Wc 6, D 2) + 12 ruled exclusions (Wr·G, Wq·G; all 6 Wx cells; D·L−, D·A, D·G, D·O), each with its reason above. No cell is empty.
