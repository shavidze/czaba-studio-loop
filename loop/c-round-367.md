# C round 367: PERF-9b-ii stem-cache commit discipline — FAIL (A STOPped; real-browser rows PASS)

Tree: B's sketch verbatim (`git diff -- app` cmp-equal to `b-round-366/sketch.patch.txt`) + doc 236. Production build, remix-serve on :5189, Playwright Chromium, stopped by PID/port afterwards. Browser verified: true.

## Why FAIL
A's report is a STOP: code-reviewer found an unruled Medium. **C reproduced it independently** (`c-round-367/dedup-sketch.log` vs `dedup-head.log`): after load A1 is aborted while its write is queued, a second load of the same key skips its write because `writes.has(key)` is true, and the aborted write then cancels. Sketch: `storedA=false, putCalls=1` (P1 and P2). HEAD d53d113: `storedA=true` (2 and 3 puts). Cache efficiency only (the source is downloaded again next open); no wrong bytes. Needs a B ruling (A's options 1/2/3) and a re-dispatch. Doc 236 l.4 already says "Completed (C round 367 PASS)", which is untrue now.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A final | `claims.txt` |
| SOURCE-SCOPE | PASS, 3 files, patch cmp-equal, 0 removed test lines | git |
| UNIT | PASS stem-cache 31/31, source-fetch 6/6 | `unit.log` |
| MUTANT-OWN | `deleteAfterPendingWrite` without same-key wait: predicted red on SC25, **actually 31/31 green** (likely equivalent: the put is already on the commit chain). Low coverage note | `mutant-own.*` |
| INTEGRITY 1440x900 / 1280x720 | PASS: all phases ready, 0 page errors, playhead ~00:02.77, 1 start, peak 0.31; truncate re-stored `mw4u67hd-…` size 4054080; delete-file re-stored size 3610677; others 304; 2 records = 2 files | `integrity-*.json/.summary.txt/.png` |
| VALIDATOR | PASS: `If-None-Match: "b366-stale"` -> 200, record ETag becomes server ETag; hero 304 | same |
| PLAYBACK-EXPORT (record) | cold vs after-truncate WAV bit-identical, sha256 5fadd97a…8202, 24-bit/48k, 101.352 s, peak 1.0, nonFinite 0 | `export-trunc.json` |
| G367-AUTH both viewports | PASS: anonymous `/studio-lab` demo; `/studio/middle-east` sign-in, 0 audio; token 401 w/o credentials, no token in body; fake bearer 500 fails closed | `auth.out` |
| DOCS | structure PASS (7 headings, SC22–29 exist, 0 "pending"); l.4 premature | doc 236 |

Gate rows (not claimed): full vitest, build, Biome, typecheck, verify, e2e smoke, test:perf.

## Bugs for B
1. **C-R367-DEDUP-CANCELLED-WRITE** (medium, above).
2. C-R367-STATUS-LINE-PREMATURE (low): fix doc l.4 wording while re-dispatching.
3. C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN (low): add a row or document as equivalent.

Next: after B's ruling, re-run unit, the new SC row + mutant, INTEGRITY/VALIDATOR/AUTH on the final files.
