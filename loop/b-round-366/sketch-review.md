# Sketch review: PERF-9b-ii (round 367)

**Dispatched sketch:** `b-round-366/sketch.patch.txt`, sha256 `66ce5455be6075f75ed62ea326b28537c30d248674acc0b4438e88a4c7c84e20` (`sketch-dispatched.sha256`). It applies cleanly to `d53d113` (`git apply --check`).

**Reviewer.** `tech-lead`, read-only, on sketch v1 (sha `18a264e6…`, SC22–SC27). Its role here follows L58: code-reviewer is not on B's consult list, so tech-lead reviews while it is off. Score: 2 High, 3 Medium, 3 Low.

**What changed between v1 and v2 (the dispatched sketch):**
- the High fixes;
- SC23 replaced by fake-browser-storage rows (SC23, SC28);
- SC25 rewritten;
- SC29 added;
- mutants re-run on v2 (`sketch/mutant-summary.txt`).

## Rulings by finding

| # | Severity | Finding (short) | Ruling | Where in v2 |
|---|---|---|---|---|
| TL-1 | High | `transactionDone` rejected on `onerror` while `transaction.error` is still `null`, so a quota abort became a non-quota error, which turned the cache off. HEAD rejected with `request.error`. | **Fixed.** It rejects on `abort` only, with `transaction.error ?? AbortError`. The error event alone does not settle it. | client `transactionDone`; SC22 (bare abort gives AbortError; an error event alone stays pending); SC23 (aborted put rejects with the same `QuotaExceededError` object). Mutant `M-SC22-ONERROR-NULL` is red on SC23. |
| TL-2 | High | The L5 wait put the session commit queue on the response path: a 404/410/unstorable-200 waited for other keys' writes, and a hung store call would hang the load. | **Fixed.** The response returns at once. The delete is queued after the same-key pending write and on the commit chain (`deleteAfterPendingWrite`); `idle()` waits for queued deletes and the chain. | client 404/410 and unstorable-200 branches; SC25 (response settles while the put is held; delete lands after the put); SC29 (`idle()` waits for a held delete). Mutants `M-L5-BLOCKING`, `M-L5-GONE`, `M-L5-UNSTORABLE`, `M-IDLE-NO-DELETES` are red. |
| TL-3 | Medium | The chain is a deadlock surface: one store call that never settles blocks later writes and `idle()` for the session. | **Accepted with rationale; partly fixed.** After TL-2, no load waits on the chain: `cachedFetch` awaits only `get`, `touch` and the network. A hung store call therefore costs caching for the rest of the session, never a load. That is the same degraded mode as "storage error → plain network". `idle()` has no app caller [K17]. Fixed part: `storeBytesNow` returns at once when the write was cancelled while queued. A timeout race is not added: it would need a chosen limit with no measured basis (L58). Doc 236 records the accepted risk. | client `storeBytesNow` first lines |
| TL-4 | Medium | SC23 v1 was a regex source scan: formatting-fragile, with no behaviour, and it could not catch TL-1. | **Fixed.** Replaced by a fake IndexedDB + OPFS installed with `vi.stubGlobal` (`installFakeBrowserStorage`). Request success fires before commit; commit can be held; a put request can fail (error event first, then `error` set, then abort, as in the IndexedDB spec order). | SC23 (put pending until commit; previous file removed only after commit; aborted put rejects with its own error; previous entry intact). SC28 (integrity: size mismatch and missing file both give a miss that deletes record and file). This is the unit half of C-R365-OBS-INTEGRITY. Mutants `M-SC23-WRITE-REQUEST` and `M-SC28-NO-SIZE` are red. |
| TL-5 | Medium | Same-key race: `remove()` (read, then delete) ran outside the chain. | **Fixed by TL-2.** Hit-path deletes now run on the chain after the same-key write. Eviction deletes were already inside the chained `storeBytesNow`. The integrity delete inside `store.get` stays outside the chain: it deletes a record that is already broken, and a racing same-key write re-creates a valid one. Accepted. | — |
| TL-6 | Low | `touch` in callback form is correct. | No change. | — |
| TL-7 | Low | Create the `done` promise after the request is queued. | **Adopted.** It is simpler and drops the ordering assumption. | `writeRecord`, `deleteRecord`, `touch` |
| TL-8 | Low | `idle()` takes a snapshot. | **Adopted:** it also awaits queued deletes and `commitChain`. | `idle` |

Serialising eviction planning, from the reviewer proposal in round 365: **yes**, per session. Tech-lead agreed ("smallest correct fix"). Cross-tab budget overshoot stays possible and is out of scope; it is recorded in doc 236 TODO.

## Smallest-honest-behaviour rationale (L6 and the hit delete)
- `response.clone()` throws → the response goes to the caller unchanged and nothing is stored; the store stays on. A clone failure is a body-state problem of one response, not a storage fault.
- A stored `contentType` that `Headers.set` rejects (CR/LF) → the stored bytes are served with no `content-type`. The decoder sniffs the audio; serving no type is safer than serving an injected header.
- A hit delete no longer finishes before the response returns. A second fetch of the same key **before** `idle()` may still see the old entry, and on a network error it may receive the old bytes. This is accepted: the demo loads each source once per open, and SC9/SC21 check after `idle()`.

## Run evidence on v2
- Covering file: 31/31 (`sketch-covering.log`). Typecheck rc 0 (`sketch-typecheck.log`). Biome rc 0 on both files (`sketch-biome.log`).
- Full suite on v2: `precheck-full.log` (L23).
- 13 mutants, each red on its row (`sketch/mutant-<id>.log`, summary `sketch/mutant-summary.txt`).
- Browser probes (HEAD and sketch production builds, both viewports, plus the mutant builds): `probe/`, summary `probe/probe-summary.txt`.
