# Root request: ARCH-CHECKPOINT-PERF9-STEM-CACHE (non-blocking, now due)

Requested by B at the round 368 → 369 planning (D-29z1211). Condition "after C round 368 PASS" is met (`c-round-368.json` PASS, gate 368 published `29f4b4d`).

Per `store/.claude/references/architecture-checkpoint.md`, root asks the read-only `frontend-architect` one bounded question:

1. `app/lib/arrangement/stem-cache.client.ts` now holds two things: the IndexedDB/OPFS adapter (`createBrowserStemCacheStore`) and the per-session write scheduler (`commitChain`, joined writes, `deleteAfterPendingWrite`, `idle`). It changed in rounds 365, 367 and 368. Both reviewers (A round 368, gate 368) say **keep** and propose moving the adapter into a sibling `stem-cache-browser-store.client.ts` only if a fourth change lands (signal `GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT`). Keep or extract now? Value, risk, ≤ 3 sentences.
2. Nine deferred Lows sit in this region (A-R367-REVIEW-L-c/-d/-e/-g, B-R367-TL3-1-JOIN-MICROTASK-GAP, A-R368-REVIEW-L1, A-R368-REVIEW-L3, GATE368-L1-REMOVEFILE-SAME-NAME, GATE368-L3-QUEUED-BUFFER-RETENTION). If root approves an extraction, should it be the same bounded task that closes them (one owner, SC1–SC33 unchanged and green)?

The loop does not wait for the answer. A root-approved change becomes a separate B task with one owner and behaviour-preserving tests.
