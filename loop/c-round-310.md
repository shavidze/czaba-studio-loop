# C round 310 — PERF-4d verification (one R2 read per public GET, 416 `no-store`)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. 1 Low (test gap), 0 Medium+.
Tree: HEAD `b65febe` + A's 3 modified paths + new doc 226 (no source touched by C). env-status: store 200 (2026-11-03T04:40Z).
Note for the reader: this round changes the R2 Cloudflare worker, not the Studio UI. The root prompt's generic Studio flow (find sound → add → video → export) is not touched by this diff; the user-visible neighbour checked is the anonymous `/studio-lab` demo and the premium auth guard (G310-AUTH). Reference/Ableton parity: not applicable (performance round on a server worker, task §0.5).

## Browser rows (real Chromium 143.0.7499.4, each run alone, verdict from the server log)
| Row | Result | Evidence |
|---|---|---|
| WK-OPS-PROXY-THROW | PASS. firstFetch 200 h0g1; revalidate **304 h0g1c1**, 0 bytes; range 206 h0g1 `bytes 1000-1999/5760044`, 1000 bytes; unsatisfiable **416 h1g1 `no-store`** `bytes */5760044`, 0 bytes; HEAD 200 h1g0; audioSeek advanced (50.00→51.46 s), error null, 3/3 lines 206 h0g1, CL = bytes each; cover 200 h0g1 then **304 h0g1c1**; etag quoted | `c-round-310/proxy-throw-*`, `wk-summary-proxy-throw.txt` |
| WK-OPS-PROXY-SHORT | PASS. Same, except unsatisfiable **416 h0g1c1 `no-store`** | `proxy-short-*`, `wk-summary-rest.txt` |
| WK-OPS-ALT | PASS. `cloudflare/r2-worker.js`, throw and short: every preview step equals the proxy rows; coverTwice 404/404 h0g0 | `alt-throw-*`, `alt-short-*` |
| WK-HEAD-CONTROL | PASS. `git show HEAD:workers/r2-proxy.js`: every seek line h1g1, revalidate 304 h1g0, 416 h1g0 `public, max-age=86400` — the probe tells the trees apart | `headctl-*`, `head-r2-proxy.mjs` |
| G310-AUTH | PASS, both viewports. `/studio-lab`: workspace + "Demo collection — no sign-in required" badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` no header 401; fake Bearer 500 no token; bare 400. No token in any body. Warmed in a browser first (L38) | `g310-auth.json`, `shots/lab-*.png`, `shots/legacy-*.png`, `warm.log` |

## Offline rows
| Row | Result | Evidence |
|---|---|---|
| WK-UNIT | PASS. `node --test workers/r2-proxy.test.mjs` 69/69 (242 ms); vitest r2-tokens + download-routes 32/32 | `wk-unit.txt`, `vitest.log` |
| RED-ON-HEAD | PASS. A's test file on HEAD workers in `/tmp/c310h`: 15 red / 54 pass; names identical to `sketch-tests-on-head.txt` | `tests-on-head.txt`, `red-on-head.txt` |
| PROTECTED-UNCHANGED | PASS. Both workers: diff up to `const PUBLIC_EXPOSE_HEADERS` vs HEAD empty; helper parity diff empty | `protected-unchanged.txt` |
| SOURCE-SCOPE | PASS. `git status`: 3 M + doc 226. `sha256sum -c` fails only on the 3. No diff in protected files, `api.proxy.audio.ts`, `package.json`, `biome.json`. Test diff: all 12 `@@` hunks carry the public-loop context `for (const [name, worker] of [['proxy', proxy], ['alternate', alternate]])`, and counts close (HEAD 57 = 40 protected + 8×2 + PR9; now 69 = 40 + 14×2 + PR9), so the 40 protected rows, `request` and `tokenFor` are untouched; only removed asserts are PR2/PR4 `reads.length 0` (§6.1), each replaced by stronger asserts; the PR9 304 assert is kept in a new form. A's 3 files are byte-identical to B's sketch | `sha256.log`, `test-diff.txt` |
| CLAIMS | PASS. Differs from HEAD only in K2/K5/K6/K7/K9/K16 with exactly the §3.2 values; equal to A's `claims-after.txt`. countMismatches: none | `claims-after.txt` |
| TESTS-READ | PASS with 1 Low. A's `mutants.txt` is byte-identical to B's `sketch-mutants.txt` (13/13 red; 39 log/patch files present; not re-run by C); C ran 4 of its own: 3 red (PR4; PR4+PR15), 1 **green** → C-R310-01. Restored 69/69 | `c-mutants.txt`, `C-MU-*.patch.txt/.log` |
| DOC | PASS. l.4 exact; 7 TEMPLATE headings in order; cited paths exist; doc 225 unchanged; post-deploy list present | — |
| Gate rows | not claimed: full vitest, build, Biome, verify, e2e smoke | `gates/gate-round-310.json` |

Not runnable here: WK-STORE-PREVIEW-LIVE (deployed worker + real R2, Safari).

## Findings for B
- **C-R310-01 (Low, origin B spec; confirms A-R310-REVIEW-L2).** Mutant: in the throw path, the If-Range re-read keeps `head`'s ETag (both copies) → 69/69 green. The code is correct today (curl: `Range: bytes=0-9` + `If-Range: "old"` → full 200, gets 2), but no row guards it. Fix: a PR14 sub-case with `changedOnSecondRead` in throw mode asserting `ETag "etag-2"`. → deferred_low_polish / A-R309-REVIEW-TEST-GAPS.
- INFO-C310-OVERSIZED-RANGE: agree with A-R310-REVIEW-L1 (unclamped suffix/length to R2); fake clamps (`bytes=-99999999` → 206 whole file, CL = bytes). Real R2 behaviour is post-deploy.
- INFO-C310-HEAD-STEP10: doc step 10 verified by curl on the probe server: HEAD + unsatisfiable → 416 `no-store` h1g0; HEAD + If-None-Match → 304 h1g0 (`headx.txt`). Still no unit row (A-R310-REVIEW-L3).
- INFO-C310-WARM-STATUS-NULL (environment; no screenshot or page-error capture exists, only `warm.log`, so it is not an observed UI state): untimed warm-up saw a null status for 300 s on the cold server; the timed G310-AUTH that followed was ready at both viewports with 0 errors.
