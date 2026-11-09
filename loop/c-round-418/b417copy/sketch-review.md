# Sketch review: round 418 SYS-R416-PREVIEW-CONTROLLER (L58)

- **Dispatched sketch:** `b-round-417/sketch-418.patch.txt`
- **Reviewed sha256:** `146bce6c0e3384eae0b9b16e34b2bc4567a201ca6b4e0ef5f77d91b2e9ad8525` (= `sketch-418.sha256`; the dispatched file is unchanged since the review).
- **Reviewer:** `tech-lead` (read-only, on its own copy `/tmp/b417-review` = `git archive` of the HEAD base + this patch; code-reviewer is not on B's consult list).
- **Pre-review evidence on the same sha:** mutants (`mutants/summary.txt`, 12 lines); full suite (`precheck-full.log`, 3934/3934); typecheck, lint and biome (`precheck-*.log`); loaded replicate (`precheck-loaded.log`, 40/40); browser HEAD vs sketch (`probe/compare-head-vs-sketch.txt`, ALL EQUAL over 14 cells).
- **Earlier sketch (not dispatched):** an earlier version without `setErrorHandler` was never reviewed or dispatched. B's browser pre-check (R1b on port 5174) showed that a same-url seek followed by a stall gave no fallback. The fix and PC12 were added, and the mutants, full suite and browser runs were all re-run on the final sha above.

## Verdict
**Verdict: approve** (tech-lead, 2026-11-08). No Critical, High or Medium findings.

## Reviewer findings and B rulings
| Id | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R418-L1-UNMOUNT-NO-BUMP | Low | Unmount does not bump the token. A decode pending at unmount is dropped only because the abort leaves the cache empty. HEAD has the same gap | Not in this sketch (ruling 6). MU-UNMOUNT-NO-BUMP was green, so no row can prove the bump today. → `deferred_low_polish` |
| TL-R418-L2-READTIME-START-FALLBACK | Low | A throwing read at the watchdog tick after a real armed time ≠ `start` silently skips the stall. After a same-url seek, `start` is the old offset. Suggestion: report at `armedAt` when the tick read throws | Not in this sketch. Shipping browsers do not throw from the `currentTime` getter (tech-lead §2), so PC9 and PC10 are defences only. → `deferred_low_polish` |
| TL-R418-L3-OFFSET-RAW-READ | Low | `getLibraryPreviewOffset` still reads `currentTime` unguarded | → `deferred_low_polish`, with L2 |
| TL-R418-L4-COLLECTION-CHANGE-PREVIEW | Low (pre-existing) | A collection change neither stops the preview nor bumps the token, so a stale decode or fallback can start a source with the same id from the new collection. HEAD behaves the same | Out of scope: the collection effect is outside the controller region and HEAD behaves the same. EV12 (stale call decodes nothing) stays green. → `deferred_low_polish` |

## What the host decides (tech-lead §2; recorded for C)
- In a browser, microtasks run after each event listener returns. PC6's "stop inside the same `act` as the error" is a jsdom-only interleaving.
- Media `error` arrives as its own task. The `src` setter and `currentTime` getter do not throw in shipping browsers, so PC5, PC8, PC9 and PC10 are defences.
- `play()` rejections are asynchronous (AbortError after our own pause, NotAllowedError from autoplay). The `active !== preview` check covers them.
- Background tabs throttle the 8 s watchdog timer. Browser rows run in foreground tabs.

## Ordering matrix (L58): in-flight operation × incoming event, one operation in flight
Kinds (n = 8):
- **B** buffer preview playing
- **S** stream preview playing or pending play
- **D** decode preview pending
- **F** stream fallback scheduled (error or stall reported, microtask queued)
- **X** stop
- **K** same-url seek
- **P** transport play (Space/Play)
- **U** provider unmount

X, K, P and U are synchronous: they are never "in flight", so each of those four rows is one ruled exclusion (`sync`). Incoming *start of another kind* is covered by the B/S/D columns. 8 × 8 = **64 cells**.

| in flight ↓ / incoming → | B start-buffer | S start-stream | D start-decode | F error/stall | X stop | K seek same url | P transport play | U unmount |
|---|---|---|---|---|---|---|---|---|
| **B** | x-unch¹ | R10ʳ, PS5ʳ | x-unch¹ | x-na² | x-unch¹ | x-na³ | PS9-analogue x-unch¹ | x-unch¹ |
| **S** | R10, PS5 | PC11 | R9ʳ (stream→decode via fallback: R5) | PS16, PS4, PC4, PC12 | R6, PS6 | PS2, PS25, PC12 | R7, PS9, PS11 | PS10 |
| **D** | PC2-analogue x-tok⁴ | PC2, R9 | PC1 | x-na² | PC1 (stop leg) | x-na³ | x-unch¹ | PC7 (lock) |
| **F** | x-tok⁴ | x-tok⁴ | x-tok⁴ | x-na⁵ | PC6 | x-tok⁴ | x-tok⁴ | TL-R418-L1 (deferred) |
| **X** | sync | sync | sync | sync | sync | sync | sync | sync |
| **K** | sync | sync | sync | sync | sync | sync | sync | sync |
| **P** | sync | sync | sync | sync | sync | sync | sync | sync |
| **U** | sync | sync | sync | sync | sync | sync | sync | sync |

Notes:
- ʳ means the reverse direction of the named row.
- **¹ x-unch:** this path has no token-dependent branch and its code is unchanged by the sketch. It is covered by the full suite on the sketch (3934/3934) and by the browser rows R7/R10.
- **² x-na:** a buffer or decode preview has no media element, so no media error or stall can arrive.
- **³ x-na:** the same-url seek exists only on the stream path.
- **⁴ x-tok:** every start bumps the token (ruling 1), so the queued fallback or the pending decode settle sees a stale token and returns. Proven for stop by PC6, for stream by PC2 and for decode by PC1. The remaining start kinds use the same bump line and the same check (MU-FALLBACK-NO-TOKEN-CHECK and MU-DECODE-NO-TOKEN-CHECK).
- **⁵ x-na:** once a fallback is scheduled the element is released (`stopActive` before `errorHandler`), so a second error or stall from it is ignored by `active === preview` (PS3, PS4 tail).
- **sync:** the operation completes synchronously, so it is never in flight; its effect on each in-flight kind is the cell in the column of the same letter.

**Cell count:** 64 = 32 named (rows B, S, D, F) + 32 sync (rows X, K, P, U).
