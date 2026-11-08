# C round 414: SYS-R2-FAKE-FIDELITY — verdict PASS (0 bugs)

Evidence is in `c-round-414/`. Machine-readable result: `c-round-414.json`. The L57 check is OK (`c-round-414/l57-check.txt`).

| # | Row | Result |
|---|---|---|
| 1 | SOURCE-SCOPE start | PASS. Claims differ from the sketch output only in K1, K2, K6 and K7e's label, as expected. K2b is 0, K3 is 1312 rc 0, K4 is rc 0, and status shows exactly the 2 granted paths. |
| 2 | PATCH-IDENTITY | PASS. The sketch applied to a `git archive HEAD` scratch is `cmp`-identical to the working-tree test file. |
| 3 | WK-UNIT | PASS. `node --test` is 83/83 (145 ms). The two vitest files are 32/32. |
| 4 | MUTANTS | PASS. `c-round-414/mutants/summary.txt` is identical to B's. 13 are RED on the expected row, and NO-TRIM is GREEN (equivalent). 11 survive on the HEAD tests, and 2 (SHORT-416-NO-RELEASE, CATCH-META-ETAG-DROPPED) are red on PR4 and PR15. Pristine before and after: rc 0 with 83 and 75 tests. Scratch status 0. |
| 5 | WK-BROWSER (real Chromium 1440×900) | PASS. 2 workers × throw/short. Every step equals `head-summary.txt`. The alt worker equals the proxy except `coverTwice` (no cover route). `audioSeek` shows 2 or 3 range 206 requests, and the count varies between runs of the same worker (6 repeats). Every request is `h0g1c0` and `advanced` is true, so this is browser buffering and not worker behaviour. |
| 6 | AUTH (1440×900 and 1280×720, fresh context) | PASS. Demo `/studio-lab` has `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The token API without auth returns 401. The first 1440 run hit a blank page on a cold server (L38); the retry was valid. The cold attempt is kept as `*.cold-attempt1.*`. The fake-bearer path is BLOCKED (backend unavailable in the cloud). |
| 7 | DOC | PASS. Doc 266 l.4 is byte-exact. The 7 TEMPLATE headings are in order. Its 14 `MU-414-` lines equal B's summary. Rulings 1–6 are present, with "inference" on ruling 2. PR4, PR6, PR9, PR14–PR17 and PR19–PR22 all exist in the test file. Sweeps: 0 `pending` hits and 7 `In Progress (stage` files. |
| 8 | SOURCE-SCOPE end | PASS. End claims equal the start claims. Both workers have an empty diff against HEAD. L57 is OK. |

**Gate (not run by C):** full vitest, typecheck, build, Biome, verify. The gate does not run the worker tests, so ROOT-REQ-VERIFY-WORKER-TESTS stays open.

**Not run:** export WAV measurement. This is a test-only round and no runtime audio file changed.

**Ableton conformance:** does not apply (server-worker tests).

**Recorded Lows, unchanged:** B-R414-RANGE-UNIT-CASE, B-R414-HEAD-RANGE-206, A-R311-REVIEW-L1.
