# C round 311 — PERF-4e verification (R2 worker range guard + re-read If-None-Match)

**Verdict: PASS.** browserVerified = realVerified = true. 1 Low (C-R311-01, test gap, origin B spec). Tree: HEAD `8946431` + 3 M + 1 new doc; C changed no source (`git status` unchanged before/after).

CZABA requirement: met (GATE310-M1, GATE310-L3, C-R310-01 behaviour fixed and observed in real Chromium against both worker copies). Ableton conformance: not applicable (server worker, no Studio UI).

## Browser rows (Chromium 143.0.7499.4, 1440×900; network rows are viewport-independent per §3.2)
Verdict from the server log (`c-round-311/wk-summary-311.txt`, `wk-summary-ops.txt`).

| Row | Result |
|---|---|
| WK-GUARD-PROXY (throw, short) | PASS. hugeEnd / hugeSuffix 206 h0g1 `[{offset:0}]`, `bytes 0-5760043/5760044`, bytes = CL 5760044. hugeEnd20 206 h0g1 `[{offset:10}]`, `bytes 10-5760043/5760044`. hugeStart 416 `no-store` h1g1. normalSeek 206 h0g1. rereadNoInm 200 full, ETag = swap ETag. rereadInm 304, 0 bytes, swap ETag, no Content-Type (throw h0g2c2, short h0g2c2). rereadFarInm 304: throw **h1g2c1**, short h0g2c2 (cancels = gets) |
| WK-GUARD-ALT (throw, short) | PASS. Every step equals the proxy rows |
| WK-OPS-REGRESSION (round-309 probe, R2_STRICT=1) | PASS. revalidate 304 h0g1c1; range 206 h0g1; unsatisfiable 416 `no-store` (throw h1g1, short h0g1c1); HEAD 200 h1g0; audioSeek advanced true, no error, every line 206 h0g1 bytes = CL; cover 200 then 304 h0g1c1 |
| WK-HEAD-CONTROL (HEAD proxy as .mjs, throw) | PASS. hugeEnd / hugeEnd20 / hugeSuffix **500** h1g1; rereadInm **200** h0g2c1; rereadFarInm 200 h1g2c0. This reproduces `b-round-310/probe/head-proxy-throw-1440.json`, so the probe separates the trees |
| G311-AUTH (both viewports, fresh anonymous contexts, warmed in a browser first) | PASS. `/studio-lab`: workspace + "Demo collection — no sign-in required" badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401; fake bearer 500, bare 400; no token in any body. Shots: `c-round-311/shots/` |

## Offline rows
| Row | Result |
|---|---|
| WK-UNIT | PASS. `node --test workers/r2-proxy.test.mjs` 75/75 (260 ms). vitest r2-tokens + download-routes 32/32 |
| RED-ON-HEAD | PASS. Final test file on the HEAD workers: 71 pass / 4 fail = PR16, PR17 × proxy/alternate, identical to `sketch-tests-on-head.txt` |
| PROTECTED-UNCHANGED | PASS. Both diffs above `const PUBLIC_EXPOSE_HEADERS` are empty; parity diff 0 lines |
| SOURCE-SCOPE | PASS. 3 M + 1 `??` doc 227; `sha256sum -c` fails only on the 3. No diff in package.json, biome.json, api.proxy.audio.ts, studio.$productId.tsx, api.studio-token.ts, account.downloads.tsx. Test diff hunks: the `publicRequest` fake (l.155) and PR13/PR15/PR16–18 only; the test file is byte-equal to B's sketch. One `-` line holds `assert` (PR13). It is replaced in place by the same assert plus one more, so no assertion is lost (INFO-C311-ASSERT-MINUS-LINE: the row's literal wording conflicts with B's own sketch) |
| CLAIMS | PASS. `claims-311.sh` output equals A's `claims-after.txt` and differs from the sketch output only in K2/K10/K16 (empty in the sketch run, as §3.2 allows). K5 `198 160 327 289`, K7 `3 3 4 4`, K9 75/75, K16 doc 227; K6 `2 4 2 4`, K11 0, K12 `0 0 1 1` unchanged. L29 grep over the task: no untagged store fact. K7 prose line numbers checked at HEAD: `validateToken` isSafeInteger at workers l.156, cloudflare l.138 (appended to claims-after.txt). countMismatches = [] |
| TESTS-READ | PASS. A's 25 mutants are all red; the per-mutant red rows are byte-identical to `sketch-mutants.txt`; restored 75/75. C's own 5 mutants: C-MU-SAFE-BOUND-1E15 and C-MU-UNSAFE-SUFFIX-OFFSET-1 (PR16 red ×2), C-MU-THROW-REREAD-304-KEEPS-CT (PR17 red ×2); **2 survived** → C-R311-01 |
| DOC | PASS. Doc 227 l.4 is byte-exact `**სტატუსი:** Completed (C round 311 PASS)`; the 7 TEMPLATE headings are in order; §0.1–0.4, the §4 contract, rows, 25 mutants and the §11 post-deploy list are present; the cited PR rows exist |

Gate rows (not claimed): full vitest, build, Biome, `npm run verify`, e2e smoke.
Not runnable here: WK-STORE-PREVIEW-LIVE (deployed worker, real R2, Safari).

## Finding for B
**C-R311-01 (Low, origin B spec; confirms A-R311-REVIEW-L2/L3).** Two mutants survive 75/75:
- C-MU-REREAD-NO-ETAG-DELETE: deleting `else headers.delete('ETag');` on the normal-path re-read (the fake always returns `httpEtag`).
- C-MU-REREAD-304-NO-CORS: the re-read 304 without Access-Control-Allow-Origin / Expose-Headers (doc 227 l.76 says the 304 keeps the CORS headers; no row pins it).

The code is correct today. Suggestion: a second-read object with no `httpEtag`, and ACAO/Expose asserts in PR17. Evidence: `c-round-311/C-MU-*.patch.txt`, `.log`, `c-mutants.txt`. Deferred-Low candidate.

Info: INFO-C311-ASSERT-MINUS-LINE (row wording, see L4), INFO-C311-WARM-STATUS-NULL (cold warm-up, as in round 310), INFO-C311-AUDIOSEEK-LINES (the media-element range-line count varies).
