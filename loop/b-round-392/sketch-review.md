# Sketch review: PERF-13c-i (round 393)

**Dispatched sketch:** `b-round-392/sketch-393.patch.txt`, sha256 `8de762db110b41b2a95c15c6d16150069c9d766a51ea97650ffb4d72d0e7aebf`.
**First review:** sha256 `05c7e9d314703ca18656b2a93a9d22a65a623927dd6b5ce2241b365ddc3b10e0`. It was done by `tech-lead`, standing in for `code-reviewer`, which is not on B's consult list (L58). The review ran `tsc` (0 errors) and vitest on `app/lib/arrangement`, `app/data` and `app/components/arrangement` (201 files, 3034 tests, pass).
**Delta:** `05c7e9d3…` → `8de762db…`, which applies review Low #3 only:
- the preview id/state is set before `playLibraryPreviewStream`;
- an `active !== preview` guard follows `element.src = url`.

The delta re-review result is recorded at the end of this file.

## Findings and rulings
| # | Severity | Finding | Ruling |
|---|---|---|---|
| 1 | Medium | A stalled stream (`stalled`/`waiting` with no `error`) never recovers: the preview stays in `Stop` with a frozen cursor | **Ruled REV-B393-M1-STALL → PERF-13c-ii** (D-29z1341). 13c-i streams only same-origin static demo files. The decode path has the same exposure to a hung fetch today (its `Loading…` never settles either), so 13c-i adds no new class of hang to `/studio-lab`. 13c-ii (remote signed URLs) gets a stall watchdog row: no `playing` within 8 s, or `stalled` held that long → `handleError`. Not fixed in the sketch |
| 2 | Low | A `NotAllowedError` from `play()` (autoplay) also switches the source to decoding for good | Deferred to 13c-ii with #1 (error-name filter). A preview always starts from a click (a user gesture), so this is not expected in 13c-i |
| 3 | Low | State was set after the play call; a synchronous error could be undone | **Fixed in the sketch** (delta above) |
| 4 | Low | The same-URL fast path only seeks; an externally paused element never resumes | Deferred (`deferred_low_polish`, A-R393-SKETCH-L4-EXTERNAL-PAUSE) |
| 5 | Low | A collection change does not stop an active stream (same as the buffer preview today); a later error re-enters with an old id | Deferred, unreachable (one provider mount, constant collection, K25); added to SRW-21-PLAN with A-R392-REVIEW-M1 |
| 6 | Low | The player-creation block is duplicated; the fallback ref could be a `WeakMap` | A may extract `ensurePreviewPlayer(ctx)` inside the grant; optional |
| 7 | Low | The stream branch requires `ensureAudioContext()` although the element does not need it | Accepted, recorded in doc 252 (consistency: the "audio unavailable" behaviour and later Play are unchanged) |
| 8 | Low | The sketch test uses type assertions | Known: A rewrites it without assertions (task §3) |

**No unruled Medium remains.**

## Mutants on the dispatched sketch (L58)
`mutants/summary.txt` (run on sha `8de762db…`). Logs: `mutants/mutant-<id>.log`.
- **7/7 red:** STREAM-NEVER, STOP-KEEPS-SRC, SEEK-NEW-ELEMENT, ENDED-UNGUARDED, ERROR-AFTER-STOP, NO-FALLBACK, FALLBACK-NOT-REMEMBERED.
- **Pristine:** rc 0.
- The other mutants in task §5 belong to rows A writes. A records their red logs.

## Ordering matrix (L58: one preview in flight × the next event)
Each cell names a row id, or the reason it is excluded.

| in flight \ event | stop | supersede (other id) | same-url seek | ended | error | play-reject (Abort) | Play (transport) | unmount | collection change |
|---|---|---|---|---|---|---|---|---|---|
| **stream** | PS1, S2 | PS5 (buffer), sketch S-probe | PS2, S4 | PS3, PS12, S5 | PS8, PS13, S9 | PS4 | PS9, S6 | PS10, S8 | excluded: unreachable (K25), finding #5 → SRW-21-PLAN |
| **fallback decode** | round-392 EV9-stop (unchanged code) | S11 (round-392 B7 through the fallback) | n/a (no element) | EV rows (buffer path) | round-392 EV23 | n/a | round-392 B8 (unchanged) | round-392 EV7 | round-392 EV25 |

## Evidence index
- Browser, both viewports: `sketch-browser.json` (STREAM and FALLBACK rows), produced by `premise/sketch-browser.mjs` on a scratch dev server at :5174 with its own `cacheDir`.
- Pre-check:
  - `precheck-full.log`: 257 files, 3801 tests, rc 0, on sha `05c7e9d3…`. B's mutant runs overlapped it.
  - `precheck-covering.log`: 14 files, 238 tests, rc 0, on the final sha.
- Premise: `premise/premise-head.json`.

## Delta re-review
**tech-lead, on sha `8de762db…`: "delta OK".**
- (a) A synchronous `error` during `element.src = url` now leaves the restart's state last, which is correct.
- (b) The guard stops `currentTime` and `play()` on a detached element. Nothing leaks.

One older Low is unchanged: a `play()` that **throws** synchronously (instead of rejecting) is not caught by `Promise.resolve(...)`. It is recorded as #9 → deferred with #1/#2 to 13c-ii. Browsers return a promise, and jsdom's `play()` does not throw.

**Reviewed = dispatched:** `8de762db…`.
