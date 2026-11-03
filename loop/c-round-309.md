# C round 309: PERF-4a, R2 worker public routes (ETag → 304, Range → 206/416)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. Bugs: 0. INFO notes: 4.
- **Tree:** HEAD `738df73` plus A's 4 paths. C changed no source.
- **Browser:** Chromium 143.0.7499.4.
- **Ableton/reference:** not applicable. This is a performance round on a server worker (task §0.5). No screen change, so the screen budget does not apply.
- **Viewport:** the worker network rows ran once at 1440×900. Task §3.2 exempts them explicitly, because network behaviour does not depend on viewport; this is not a skipped viewport. G309-AUTH ran at both 1440×900 and 1280×720.

## Browser rows (judged from the server log)
| Row | Result | Evidence |
|---|---|---|
| WK-BROWSER-PROXY | PASS. `revalidate`: one GET **304**, inm present, bodyBytes 0, Content-Length absent. `rangeFetch`: **206** `bytes 1000-1999/5760044`, 1,000 bytes. `unsatisfiable`: **416** `bytes */5760044`, 0 bytes. `head`: 200, content-length 5760044. `audioSeek`: advanced 50.0 → 51.46 s, error null, every line 206, and the line with start 4784128 carries 975,916 bytes (= 5,760,044 − 4,784,128). `coverTwice`: 200 then **304**, `public, max-age=604800`. The JS side read `etag` as a quoted string across origins, so Expose-Headers works | `c-round-309/proxy-1440.json`, `proxy-server.log` |
| WK-BROWSER-ALT | PASS. Identical to PROXY on every preview step (304/206/416/HEAD 200/seek 206 with 975,916 bytes, advanced). `coverTwice` 404/404, as expected (no image route) | `alt-1440.json`, `alt-server.log` |
| WK-HEAD-CONTROL | PASS. On `git show HEAD:workers/r2-proxy.js` (saved as `.mjs`): revalidate 200 with 5,760,044 bytes, range 200, unsatisfiable 200, seek 200 with full bodies, and no ETag. This reproduces B's `head-proxy-1440.json`, so the probe tells the two trees apart | `headctl-1440.json`, `headctl-server.log` |
| G309-AUTH | PASS at 1440×900 and 1280×720, fresh anonymous contexts. `/studio-lab`: workspace present, demo badge present, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` with no header → 401; with a fake bearer → 500 and no token; bare → 400. No token appeared in any body | `g309-auth.json`, `shots/lab-*.png`, `shots/legacy-*.png` |

**Note on HEAD:** the Node adapter never writes a body for HEAD, so the browser's `bodyBytes 0` on HEAD proves nothing by itself. "HEAD reads nothing" is proven by PR6's `reads === 0` and by reading the code path (`if (request.method === 'HEAD') return new Response(null, …)` before every `get`).

## Offline rows
| Row | Result | Evidence |
|---|---|---|
| WK-UNIT | PASS. `node --test workers/r2-proxy.test.mjs`: 57 tests, 57 pass, 0 fail. The two vitest files: 2 files, 32/32 | `wk-unit.log`, `vitest.log` |
| PROTECTED-UNCHANGED | PASS. C's own awk extraction against `git show HEAD:` for `handleProtected`, `isSafeFileName`, `validateToken`, `getContentType` and the `export default` router, in both workers: all SAME. PR8 is green. MU-STUDIO-CONDITIONAL is red in A's log (10 rows) | `protected-unchanged.txt` |
| SOURCE-SCOPE | PASS. `git status` shows exactly 3 M + 1 `??` (doc 225). `sha256sum -c` fails only on the 3 modified paths. The test diff is one hunk (`@@ -132,4 +132,116 @@`) with 0 removed lines, before the loop's closing `}`. `app/`, `package.json`, `biome.json` and `api.proxy.audio.ts` have no diff | `sha256.log` |
| A-PARITY (re-run) | Empty diff. Both workers are also `cmp`-identical to B's sketch files, and `node --check` is OK on both | — |
| CLAIMS | PASS. C's run equals A's `claims-after.txt` byte for byte. Against the HEAD output, only K2/K5/K6/K7/K8/K9/K17 change, with exactly the §3.2 values. K5–K8 equal the sketch output. `countMismatches` = [] | `claims-after.txt` |
| TESTS-READ | PASS. PR1–PR9 match §6 row by row: PR2 asserts `reads 0` and that Content-Length and Content-Type are absent; PR4 asserts `reads 0`; PR6 asserts `reads 0`; PR8 asserts `heads 0` and `reads + heads 0`. A's 8 mutant logs each show the listed reds, and each restored copy is 57/57. **C's own mutants** (scratch `/tmp/c309`): C-MU-NO-CLAMP is red on PR3 ×2, C-MU-WEAK-IFRANGE is red on PR5 ×2 and C-MU-304-CL (Content-Length on a 304) is red on PR2 ×2. Restored: 57/57 | `C-MU-*.log`, `C-MU-*.patch.txt` |
| DOC | PASS. l.4 is exact. The 7 TEMPLATE `## ` headings appear in order; TEMPLATE's extra "Prompt" meta heading is not one of the 7. It has the §0.2 numbers, the 4b/4c owners, R2 doc facts versus inference, the race, the mutant table and the deploy/Safari list. Every cited file exists | — |

**Gate rows** (not claimed by C): full vitest, build, Biome, `npm run verify`, e2e smoke.

**Not runnable here:** WK-STORE-PREVIEW-LIVE. ProductCard's `<audio>` against a deployed worker cannot run, because the mock API serves local paths and the deployed worker is unreachable. Safari 206 is not measurable here either.

## INFO for B (not bugs)
- **INFO-C309-AUTH-COLD** (environment). G309-AUTH attempt 1 timed out after 120 s on a cold dev server; C's curl warm-up had loaded only the HTML. The log is kept (`g309-auth-attempt1-cold.log`). One replacement, after a browser warm-up, passed. Suggested lesson for L38: warm up with a browser, not curl.
- **INFO-C309-416-PUBLIC-CACHE** (A-review Low #2 / B spec). The 416 response carries `public, max-age=86400` and an ETag.
  - C's own Chromium probe (`cache416-1440.json`): a plain GET after the 416 reached the server and got the full 200, so the browser cache is not poisoned.
  - Shared/CDN caches cannot be measured here. Suggest a post-deploy row in doc 225's list.
- **INFO-C309-RACE-PRERULED** (A-review Medium #1 / B spec §4.5). The head→get race is recorded and is not a round bug. B may reconfirm it, or schedule the reviewer's `onlyIf` alternative with failed-precondition handling.
- **INFO-C309-PREVIEW-NO-SAFE-NAME** (pre-existing, reviewer Low #9). `handlePreview` lacks `isSafeFileName`, and the 404 echoes the R2 key. This is unchanged from HEAD. Candidate for B.

L57 fields: `assertsSpecified` 9, `mutantsRecorded` 8, `mutantRedOnSketch` 8, `claimCheckMinutes` 0.02, `missingPaths` [].
