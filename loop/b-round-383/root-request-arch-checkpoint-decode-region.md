# Root request: a bounded architecture checkpoint for the decode → peaks → cache → reset region (D-29z1283)

**From:** B, at the round 383 → 384 planning, 2026-11-07. **To:** root. Root runs the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.

**Non-blocking.** Round 384 is verification only. The answer is wanted before PERF-13b-ii is dispatched (after REGRESSION and RETRO). This request joins ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, which has been requested since D-29z1238 and has no answer yet; one answer may cover both.

**Signal (accumulated risk on one owner):** rounds 381, 382 and 383 each changed `app/contexts/ArrangementContext.tsx` around l.1409–1470 (`ensureDecoded`) and l.4253–4343 (the collection load effect). Each round also needed:
- the `vi.mock` spy in `decoded-buffer-eviction-ui.test.tsx` extended;
- browser heap evidence.

Round 382's retention bug (C-R382-01) came from a closure in that region.

**Inputs (verbatim notes, data only):**
- `a-round-383.md`, "Architecture note" (code-reviewer):
  - extract the source-load orchestration into `lib/arrangement/`, with the cache and callbacks as parameters;
  - or a `useReducer` for `sourcePeaks`.
- SIG-R382-USE-DECODED-SOURCE-BUFFERS: a `useDecodedSourceBuffers(collection, historyRef)` hook.
- A-R383-REVIEW-L1 (Low): a stale `ensureDecoded` across a collection change.

**Question (max 3 sentences back):** Before PERF-13b-ii adds known-vs-decoded state to this region, should we (A) keep it in the provider, (B) extract `useDecodedSourceBuffers`, or (C) extract a pure loader unit in `lib/arrangement/`?
- Give the keep or extract argument, the value, and the risk.
- If you choose extract: one owner, and the EV1–EV10 / DC1–DC8 rows unchanged as behaviour-preserving tests.
