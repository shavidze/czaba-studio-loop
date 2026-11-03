# Round 310: PERF-4d. One R2 read per public GET. Every `<audio>` seek and every 304 makes one R2 call, and a 416 is `no-store`. Purchased routes are unchanged

**Planned by:** B, at the round 309 → 310 planning, 2026-11-03.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z824: round 309 closure. C PASS, gate 309 published `b65febe`. **PERF-4a is done on evidence.** §1 rules on C's INFO notes and the A-review Lows.
- D-29z825: **gate-309 Medium GATE309-M1 is fixed now** (bug gate 2026-10-23), together with GATE309-L2 and GATE309-L3. The three are tightly related findings in one owner's code. This is PERF-4d, a new PERF-4 stage. PERF-5 follows (§10).
- D-29z826: the PERF-4d contract (§4), the 15 specified rows (§6), the 2 changed contracts PR2 and PR4 (§6.1), and the consult rulings (§0.4).
- D-29z827: requests, the L38 lesson clause and the deferred items (§10).

**Read first:** `lessons.md`. These apply directly:
- L11: STOP.
- L23: sketch before dispatch.
- L26/L28: the doc.
- L29/L56: claims.
- L30: Biome ignores `workers/`.
- L38: probes run alone; warm up in a browser.
- L52: asserts that can fail.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`. `tmp/studio-real-loop` is a symlink, so search it with `find -L`.

## Baseline: HEAD `b65febe`, clean tree
- Gate 309 published `b65febe` on both remotes [K1]. HEAD is `b65febe` and `git status` is empty [K2].
- **Frozen list:** `b-round-309-r310-tree-sha256.txt`, **1,182** entries [K3]. Each of the 7 protected auth/purchase files appears once [K4].
- From `store/`, after A's change, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-309-r310-tree-sha256.txt` fails only on the 3 modified paths of §5. The new doc 226 is the only new file.

## 0. Why this round

### 0.1 The finding
The gate-309 review (`gates/round-309/review.md`, "COMMIT: OK", 8.5/10) raised **Medium #1**: every 200 and 206 on a public route makes two R2 calls, `head` then `get`.
- That doubles the paid R2 operations on the common path.
- It also adds a round trip before the first byte on **every `<audio>` seek**, the very path PERF-4a set out to speed up.

The same lines carry two Lows:
- **L2:** the head/get race can mix two versions of a file.
- **L3:** a 416 can be cached publicly for a day.

Under the 2026-10-23 bug gate, a Medium is fixed before new scope. Three tightly related findings in one helper block make one round. For round 309, the reviewer wrote "keep it as is for this round"; the follow-up task is what it asked for.

A's reviewer Medium in round 309 (the race) is a different finding. Task 309 §4.5 pre-ruled it (INFO-C309-RACE-PRERULED). With one read per response, the race is gone (§4.6), and that ruling is superseded.

### 0.2 Premise measured at HEAD (L37)
**Probe setup:**
- `b-round-309/probe/worker-server.mjs`: round 308's adapter, plus per-request R2 op counts (`heads/gets/cancels`) and `R2_OOB=throw|short`.
- `browser-probe.cjs`: unchanged.
- Real Chromium 143; a 60 s WAV of 5,760,044 bytes; each run alone at 1440×900.

Per request, as `status:hHEADSgGETScCANCELS` [K13]:

| Step | HEAD `b65febe` | Sketch, R2 throws on out-of-range | Sketch, R2 returns a short object |
|---|---|---|---|
| revalidate (`If-None-Match`) | 304:h1g0c0 | 304:h0g1c1 | 304:h0g1c1 |
| range `bytes=1000-1999` | 206:**h1g1** | 206:**h0g1** | 206:h0g1 |
| unsatisfiable `bytes=999999999-` | 416:h1g0, `public, max-age=86400` | 416:h1g1, **`no-store`** | 416:h0g1c1, **`no-store`** |
| `<audio>` seek to 50 s (each request) | 206:**h1g1** | 206:**h0g1** | 206:h0g1 |
| HEAD | 200:h1g0 | 200:h1g0 | 200:h1g0 |

- **Every 206 on every run:** the streamed bytes equal `Content-Length` (0 mismatches in `probe/summary.txt`), and the seek plays from 50.0 s to 51.46 s with `error` null.
- **Covers (`workers/` copy):** 200:h1g1 / 304:h1g0 → 200:h0g1 / 304:h0g1c1.
- **The `cloudflare/` copy:** matches on every preview step (`sketch-alt-{throw,short}-1440.json`). Its covers are 404/404, because that copy has no image route [round 309 K5]. So the alternate cover path cannot be probed; this is existing behaviour, not a gap of this round.
- **Files:** `probe/head-proxy-throw-1440.json`, `sketch-{proxy,alt}-{throw,short}-1440.json`, the `*-server.log` files and `summary.txt`. The first sketch's runs are kept in `probe/v1/`.

### 0.3 R2 facts (doc versus inference)
Source: the Cloudflare R2 Workers API reference, `https://developers.cloudflare.com/r2/api/workers/workers-api-reference/` ("Last updated Jul 31, 2026"), read by B on 2026-11-03.

**Documented:**
- `get(key, { range })` takes `{ offset, length }`, `{ offset }` or `{ suffix }`.
- On `length`: "If more bytes are requested than exist in the object, fewer bytes than this number may be returned."
- `R2ObjectBody` has `size`, `httpEtag` (quoted, "so as to be returned as a header") and `body` (a `ReadableStream`).
- `onlyIf` accepts `R2Conditional | Headers` ("All conditional headers aside from `If-Range` are supported"). A failed precondition returns an `R2Object` with `body` undefined.

**Not documented (inference):**
- What R2 does with an `offset` at or past the size: does it throw, or return an empty body?
- Whether `onlyIf` compares `If-None-Match` weakly and accepts a list or `*`.
- Whether `object.range` is the clamped range or the requested one.
- What R2 does with a `suffix` larger than the size. B's probe fake clamps it in both modes, so `R2_OOB` covers only an out-of-range `offset`. The unit fake also clamps (PR11 `bytes=-500`). The suffix axis is a post-deploy check (§11).

The contract therefore:
- handles **both** out-of-range behaviours, and the tests run both;
- computes `Content-Range` from `object.size`, not from `object.range`;
- keeps the worker's own `etagMatches` (§4.3).

Which branch fires on real R2 is a post-deploy observation (§11), not a correctness risk.

### 0.4 Consults (round 309 → 310 planning) and rulings
- **tech-lead:** the single-`get` design is sound, the protected routes are byte-identical, and this should go before PERF-5. Its findings and how each was handled:
  - **Two Low defects in B's first sketch (now fixed):**
    - (A) In the throw path, a failed `If-Range` returned 416. RFC 9110 says Range is then ignored, so the answer must be a full 200.
    - (B) In the throw path, a matching `If-None-Match` returned 416. If-None-Match is evaluated before Range, so the answer must be 304.
    
    Rows PR14/PR15 are red on the first sketch (`sketch/sketch-tests-on-v1.txt`: 4 red) and green on the revised one.
  - **Hardening (adopted):** `releaseBody` swallows a rejected `cancel()`, so a 304 never turns into a 500.
  - **Mutants (adopted):** MU-REFETCH-STALE-ETAG, MU-INM-STRONG, MU-THROW-NO-INM, MU-THROW-NO-IFRANGE and MU-RELEASE-THROWS.
  - **Suggestion not taken:** building Content-Range from `object.range`. R2 does not document whether that field is clamped, and the computed value is deterministic. PR11 checks bytes = Content-Length on a short R2 answer.
  - **Known asymmetry (B checked the code):** the frozen `handleProtected` does build its Content-Range from `object.range` (`workers/r2-proxy.js` l.127–130, where R2 parses `range: request.headers`). The public helper computes it from the parsed request and `object.size`. Two reasons: the public path must answer 416 and clamp the same way in both R2 out-of-range modes, and the protected path is frozen this round. A reviewer Low about the difference is answered by this line and is not a STOP.
  - **Remaining race:** "If-None-Match is compared with the first object, not the re-read one". That is the same race class, but only on the rare If-Range re-read. Recorded as Low and accepted until 4c.
  - **ROOT-REQ-VERIFY-WORKER-TESTS** should land before or with this change. That is root's step, not a grant to A; C's WK-UNIT runs the worker tests meanwhile.
- **performance-optimizer:** cancelling for a 304 costs the same one Class B operation, with no egress fee and only a little added latency. Seeks are the hot path, so do this before PERF-5.
  - **Where the two consults differ:** performance-optimizer suggests `onlyIf: { etagDoesNotMatch }`, so that a 304 never opens a body, with `etagMatches` kept as a fallback. tech-lead calls the cancel path right and `onlyIf` optional.
    - **Ruling:** keep the cancel path for this round. R2's weak/list/`*` semantics are undocumented, and the op count is the same.
    - `onlyIf` goes on the post-deploy list as an option for once a live check confirms R2's semantics.
  - **Real-R2 staging run, TTFB p50/p95 and R2 Class B metrics:** not available in the cloud (no bucket, no credentials). They go on the post-deploy list (§11). This does not block the commit, because the worker is not deployed by the loop.
  - **Probe gap:** "the alternate copy's cover was never probed". That copy has no image route (see §0.2).
- **PERF-5 input** (recorded for the next planning): `computePeaks` runs on the main thread at `ArrangementContext.tsx:2492` (video import) and `:3909` (per stem in `loadSource`). Each result goes into `setSourcePeaks(new Map…)` (`:2493`, `:3910`), followed by `patchSourceState`/`settle`, so there are at least 2 context updates per stem. `getChannelData` views cannot be transferred without detaching the buffer, so the worker needs chunked `copyFromChannel` or a copy.

### 0.5 Reference / screen budget
Not in scope: this is a performance round on a server worker, and nothing on screen changes.

## 1. Rulings on round 309 (D-29z824)
**PERF-4a → done** on evidence: `c-round-309.json` (PASS, `browserVerified`/`realVerified` true, 10 rows, 0 bugs) and gate 309 published `b65febe` on both remotes.

**C's INFO notes:**
- **INFO-C309-AUTH-COLD** (environment) → L38's warm-up clause gains "in a browser, not with curl" (D-29z827).
- **INFO-C309-416-PUBLIC-CACHE** → superseded by GATE309-L3. The 416 becomes `no-store` this round, and doc 226's post-deploy list gets the CDN check.
- **INFO-C309-RACE-PRERULED** → closed by this round (§4.6).
- **INFO-C309-PREVIEW-NO-SAFE-NAME** (pre-existing; reviewer Low #9) → **B-R309-PREVIEW-SAFE-NAME (Low)**, `deferred_low_polish`. B read the code:
  - The 404 body `'File Not Found: ' + r2Key` is built from a string with no explicit `Content-Type` [K8], which defaults to `text/plain;charset=UTF-8`. It is not an HTML reflection.
  - R2 keys are literal strings, so `..` cannot reach another prefix.
  - It is on other lines (`handlePreview`), and this round already holds three findings.

**A-review Lows from round 309:**
- #2 and #3 → this round (GATE309-L3, §4.2).
- #4/#5/#6 (test gaps) → partly covered by PR4/PR10–PR15. The rest stay as candidate rows on **A-R309-REVIEW-TEST-GAPS (Low, deferred)**.
- #7 = GATE308-L1 (already deferred).
- #8 → frozen (§4.7).
- #9 = B-R309-PREVIEW-SAFE-NAME.

**Gate-309 notes:**
- **#4** (worker tests not in `verify`) → ROOT-REQ-VERIFY-WORKER-TESTS, now marked "should land before the next worker change". It is non-blocking, and C's WK-UNIT is the runner.
- **#5** (Safari after deploy) → doc 226's post-deploy list.
- **Architecture note** (gate + A): the helper block is duplicated. → The R2-WORKER-TWO-COPIES signal count is now 3. The bounded follow-up waits for SABA-Q-WORKER-DEPLOYED: delete the copy that is not deployed, point the test loop at the one left, and combine with ROOT-REQ-VERIFY-WORKER-TESTS. It is not scheduled until Saba answers.

## 2. B's pre-check (L23)
- **Sketch** on scratch (`/tmp/b309`, never in `store/`). Kept in the loop folder:
  - `b-round-309/sketch/helper-block.js.txt` (final; the first version is `helper-block-v1.js.txt`);
  - `sketch-r2-proxy.js.txt` and `sketch-r2-worker.js.txt` (HEAD plus the new block, byte-identical in both);
  - `sketch-r2-proxy.test.mjs.txt` (the whole test file as A should leave it).
- **Run:** `node --test` on the sketch: **69/69**.
- **Red on HEAD:** the same test file on the HEAD workers gives **15 red** (`sketch/sketch-tests-on-head.txt` [K19]): PR2, PR3, PR4, PR10, PR12, PR14 and PR15 in both copies, plus PR9. PR11 and PR13 are guard rows; their mutants turn them red.
- **Mutants** (`sketch/mutants.py`; output `sketch/sketch-mutants.txt`; logs `sketch/mutant-logs/`): **13/13 red**, restored 69/69 [K17]. They are listed in §6.2.
- **Browser:** §0.2.
- **Collisions with existing rows:**
  - PR2 and PR4 change contract (§6.1).
  - PR3 and PR9 gain asserts.
  - PR1 and PR5–PR8 are unchanged, and so are all 40 protected rows.
- **Fake change:** `publicRequest` returns a `ReadableStream` body with a cancel record. The old `Uint8Array` body would make `.cancel()` throw. This touches the setup of every PR row, but no PR1/PR5–PR8 assert.
- A may copy the sketch. It is a proposal and grants nothing beyond §5.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-309/claims-310.sh` equals `b-round-309/claims-310-head-output.txt`. A difference is a STOP |
| A-UNIT | `workers/r2-proxy.test.mjs` per §6, then `node --test workers/r2-proxy.test.mjs`: **69 tests, 69 pass, 0 fail**. Also `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts`: unchanged, 32/32. Report the times |
| A-RED-ON-HEAD | Copy the finished test file next to the **HEAD** workers on scratch (`git show HEAD:…`) and run it. The result must equal the 15 red rows of `sketch-tests-on-head.txt`, or a superset with the reason. Log: `a-round-310/tests-on-head.txt` |
| A-MUTANTS | The 13 mutants of §6.2, on scratch (never in `store/`). Each must be red on at least its listed rows and green when restored. Logs and `.patch.txt` go under `a-round-310/` |
| A-PARITY | `diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' workers/r2-proxy.js) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' cloudflare/r2-worker.js)` is empty |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint` rc 0 with no new finding (205 warnings + 1 info, as in round 309). `node --check` passes on both workers (L30) |
| A-REVIEW | `code-reviewer` on the 4 paths. Ask about: header leakage between 304/416/206/200; Content-Length versus the streamed bytes; the ETag after the If-Range re-read; the throw path's preconditions; HEAD; the protected routes. A Medium+ inside the grants: fix it, then re-review the changed lines. A Medium+ outside the grants: STOP. The Architecture note goes to B |
| A-DOC | New `docs/implementation/2026/quarter-IV/226-perf-r2-worker-single-read.md`, in Georgian with technical terms in English. TEMPLATE's 7 `## ` headings in order (L26). l.4 exactly `**სტატუსი:** Completed (C round 310 PASS)` (L28). Content: the §0.2 table and its files; the §4 contract; the §0.3 doc facts versus inference; the 2 changed contracts (§6.1) with the reviewer's reason; the consult rulings (§0.4); rows and mutants; the post-deploy list (§11). It cites only files that exist. Doc 225 is **not** edited |

### 3.2 C's rows
C writes `c-round-310.md` and `c-round-310.json` as it goes, with the L57 fields:
- `assertsSpecified` = 15 (PR1–PR15);
- `mutantsRecorded` = 13;
- `mutantRedOnSketch` = 13.

Each finding carries an `origin`.

**Browser rows.** Real Chromium on A's tree, under L38 (nothing else runs during a probe).
- Network behaviour does not depend on the viewport, so each worker row runs once at 1440×900. This is stated here and is not a skipped viewport.
- C copies `b-round-309/probe/worker-server.mjs` and `browser-probe.cjs` into `c-round-310/`.
- The verdict comes from the **server log** (`status`, `r2.heads/gets/cancels`, `bodyBytes`, `contentLength`, `cacheControl`), not from the JS `fetch` status.

| Row | Action | Expected |
|---|---|---|
| WK-OPS-PROXY-THROW | `R2_OOB=throw node worker-server.mjs <store>/workers/r2-proxy.js <port> <log>`, then `node browser-probe.cjs http://127.0.0.1:<port> <log> <out> 1440x900` | `firstFetch` 200 h0g1. `revalidate` **304 h0g1c1**, bodyBytes 0. `rangeFetch` **206 h0g1**, `bytes 1000-1999/5760044`, 1,000 bytes. `unsatisfiable` **416**, `bytes */5760044`, `cache-control` **no-store**, h1g1, 0 bytes. `head` 200 h1g0. `audioSeek`: advanced true, error null, **every line 206 h0g1**, bodyBytes = contentLength on every line. `coverTwice` 200 h0g1, then **304 h0g1c1**. The JS side reads `etag` as a quoted string |
| WK-OPS-PROXY-SHORT | As above with `R2_OOB=short` | As above, except `unsatisfiable` is **416 h0g1c1** with `no-store` |
| WK-OPS-ALT | `R2_OOB=throw` and `R2_OOB=short` on `<store>/cloudflare/r2-worker.js` | Every preview step as in the two proxy rows. `coverTwice` 404/404 h0g0 |
| WK-HEAD-CONTROL | `R2_OOB=throw` on `git show HEAD:workers/r2-proxy.js`, saved as `.mjs` in C's scratch | Reproduces `probe/head-proxy-throw-1440.json`: every seek line **h1g1**, revalidate 304 h1g0, unsatisfiable 416 h1g0 with `public, max-age=86400`. This proves the probe tells the trees apart |
| G310-AUTH | As G309-AUTH (`c-round-309/g309-auth.cjs`, copied): a fresh anonymous context, with `/studio-lab` and `/studio/middle-east` warmed **in a browser** first (L38). **Both viewports** | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Offline rows:**
- **WK-UNIT.** C re-runs `node --test workers/r2-proxy.test.mjs` (69/69) and the 2 vitest files (32/32). This is C's own row, not a gate row [K10].
- **RED-ON-HEAD.** C runs A's final test file on the HEAD workers in scratch. It must show the 15 rows of `sketch-tests-on-head.txt`, or A's reported superset.
- **PROTECTED-UNCHANGED.** In both workers, everything above the line `const PUBLIC_EXPOSE_HEADERS` is byte-identical to HEAD: `diff <(git show HEAD:<f> | sed -n '1,/^const PUBLIC_EXPOSE_HEADERS/p') <(sed -n '1,/^const PUBLIC_EXPOSE_HEADERS/p' <f>)` is empty for each file. That covers the router, `handleImage`, `handlePreview`, `handleProtected`, `validateToken`, `isSafeFileName` and `getContentType`. PR8 stays green.
- **SOURCE-SCOPE.**
  - `git status --short --untracked-files=all` lists exactly the 3 modified §5 paths and the 1 new doc, and `sha256sum -c` fails only on the 3.
  - These have no diff: the 7 protected files, `api.proxy.audio.ts`, `r2.config.ts`, `r2-tokens.server.ts`, `package.json` and `biome.json`.
  - In `r2-proxy.test.mjs`, the diff stays inside `publicRequest` and the PR rows. The 40 protected rows, `request` and `tokenFor` are unchanged.
  - Every removed assert line is one of those named in §6.1.
- **CLAIMS.** Re-run `claims-310.sh`. After A, the expected changes are:
  - K2 `4 b65febe`;
  - K5–K7 equal to `claims-310-sketch-output.txt`: K5 `198 160 314 276`, K6 `2 4 2 4`, K7 `1 1 1 1`;
  - K9 `# tests 69 # pass 69 # fail 0`;
  - K16 `1 226-perf-r2-worker-single-read.md`.

  K11 stays `0` (parity) and K12 stays `0 0` (no `onlyIf`). Every other K equals the HEAD output.
  - In the sketch run, K2, K10 and K16 are empty, because `/tmp/b309` has no git, `package.json` or docs; that is not drift.
  - If A's code differs from the sketch, A writes the values to `a-round-310/claims-after.txt` with the reason, and C checks the reason against §4.
  - A value that differs without a reason is a `countMismatches` entry with its K.
- **TESTS-READ.** PR1–PR15 follow §6 and can fail (L52): A's mutant logs show the listed reds. C adds at least one mutant of its own.
- **DOC.** Doc 226 per A-DOC.
- **Gate rows** (not claimed by C; listed under `"gate"`): full vitest, build, Biome, `npm run verify` and the e2e smoke.

`browserVerified` is true only if WK-OPS-PROXY-THROW, WK-OPS-PROXY-SHORT, WK-OPS-ALT, WK-HEAD-CONTROL and G310-AUTH all ran.

**Not runnable here** (neither BLOCKED nor PASS; listed under `"notRunnableHere"`): WK-STORE-PREVIEW-LIVE (the deployed worker and real R2; Safari 206).

## 4. Contract (D-29z826)
Make the same change in **both** `workers/r2-proxy.js` and `cloudflare/r2-worker.js`, inside the helper block only, from `const PUBLIC_EXPOSE_HEADERS` to the end of the file. Everything above that line stays byte-identical (PROTECTED-UNCHANGED).

### 4.1 Calls per request
| Public-route request | R2 calls |
|---|---|
| GET without `Range` (preview or cover); also a cover GET with `Range` (ignored) | one `get(r2Key)` |
| GET with one `bytes=` range (previews) | one `get(r2Key, { range })`, with the range as written: `a-b` → `{ offset: a, length: b − a + 1 }`; `a-` → `{ offset: a }`; `-n` (n > 0) → `{ suffix: n }` |
| GET with `bytes=-0`, a range list, another unit, `b < a` or an empty spec | one `get(r2Key)`, no range |
| GET with an `If-Range` that is not a strong match | the range `get`, its body cancelled, then a **second** `get(r2Key)` (rare; listed) |
| GET whose ranged `get` **throws** | that `get`, then one `head(r2Key)` (2 calls). On an `If-Range` mismatch (§4.4 step 3), one more `get(r2Key)`: 3 calls, rare. Only PR14 pins this path; no browser probe step sends `If-Range` (§8) |
| HEAD | one `head(r2Key)` and nothing else (unchanged) |

No `onlyIf` anywhere [K12 `0 0`].

### 4.2 Order (no throw)
1. Call `get` (or `head` for HEAD) as in §4.1. If it returns null, the helper returns `null`, and the caller keeps its **existing** 404 text [K8].
2. Set the headers: the existing CORS headers, `Access-Control-Expose-Headers: ETag, Content-Range, Accept-Ranges, Content-Length`, the route's existing `Cache-Control`, and `ETag` = `httpEtag` only when it is present.
3. If `If-None-Match` matches (the existing `etagMatches`: weak comparison, `*`, a comma list): **cancel the body**, then send **304** with no `Content-Type`, `Content-Length` or `Content-Range`. This comes before any range handling.
4. Set `Content-Type`, and set `Accept-Ranges: bytes` on previews only.
5. `If-Range` must match strongly; a weak or date value is a mismatch. On a mismatch, Range is ignored. For a GET that already read a range, cancel that body and read `get(r2Key)` again. `ETag`, size and body all come from the **second** object; if it has no ETag, remove the header.
6. Resolve the range against `object.size`, never against the request alone. Clamp `b` to `size − 1`. For a suffix, start = `size − min(n, size)`.
7. **416** when start ≥ size, the suffix is 0, or size is 0:
   - cancel any body;
   - `Content-Range: bytes */<size>`;
   - **`Cache-Control: no-store`**;
   - no `Content-Type`, no `Content-Length`, no body;
   - `ETag` is kept.
8. **206** with `Content-Range: bytes <first>-<last>/<size>` and `Content-Length` = last − first + 1, carrying the ranged `get`'s body. `Content-Length` must equal the bytes streamed, including when R2 returns fewer bytes than were asked for (PR11).
9. Otherwise **200** with `Content-Length` = size and the body.
10. **HEAD:** steps 2–9 from `head`'s metadata, never with a body. A 416 on HEAD is also `no-store`.

### 4.3 Why not `onlyIf` for the 304
The R2 doc does not say how it compares `If-None-Match` (weak or strong, a list, `*`). `etagMatches` is already proven by the PR2 matrix.
- The cost is one R2 `get` either way, and R2 has no egress fee.
- Opening the body and cancelling it only affects the time to the first byte, and a 304 has no body.
- `onlyIf: { etagDoesNotMatch }` is a post-deploy option (§11), not part of this round.

`releaseBody` swallows a rejected `cancel()` (PR15).

### 4.4 A throwing ranged `get` (one of the two possible R2 behaviours)
Call `head(r2Key)`, then:
1. If `head` is null → `null` (the caller's 404).
2. Set `ETag` from `head.httpEtag`. If `If-None-Match` matches → **304**, with no body read (PR14).
3. If `If-Range` is present and is not a strong match → Range is ignored. Do one `get(r2Key)` and send a full **200** from that object, with its ETag (removed if it has none) and `Content-Length` = size. Set `Content-Type` and `Accept-Ranges: bytes` as in §4.2 step 4; this path exists only on previews, because a ranged `get` happens only when `allowRange` is true (PR14).
4. Otherwise: if the range is unsatisfiable against `head.size` → the 416 of §4.2 step 7. If it is satisfiable, **rethrow**, so the router's existing `catch` returns its existing `500 Internal Error` [K8] (PR13).

A `get` that throws **without** a range is rethrown unchanged (500). If R2 instead returns an object for an out-of-range offset, §4.2 decides from `object.size`.

### 4.5 Covers (`workers/r2-proxy.js` only)
`allowRange` stays false: one `get`, Range ignored, a 200 or a 304 (the 304 cancels the body).

### 4.6 The race (GATE309-L2)
Each response now comes from one R2 read, so its ETag, size and bytes belong to one object version. The If-Range re-read takes all three from the second object. One narrow window is left: If-None-Match is compared with the first object, and only on that rare re-read. It is recorded as **B-R309-REFETCH-INM-WINDOW (Low)** and is removed by 4c. INFO-C309-RACE-PRERULED and task 309 §4.5 are superseded.

### 4.7 Not in this round (frozen)
- `/studio/`, `/download/`, `/recordings/` and `/originals/`:
  - their code is unchanged;
  - they keep `private, no-store` and their Range rules;
  - they keep the order "token → scope → R2 read".
- The router, the CORS `Allow-*` headers, `OPTIONS`, `validateToken`, `isSafeFileName`, `getContentType`, `handleImage` and `handlePreview` are unchanged. Everything above the helper block is byte-identical.
- No `?v=` handling (that is 4c) and no `immutable`. The existing `public` max-ages stay on 200/206/304.
- `api.proxy.audio.ts`, `r2.config.ts`, ProductCard and every `app/` file are unchanged.

## 5. Grants
A edits only:
1. `workers/r2-proxy.js`: the helper block only (from `const PUBLIC_EXPOSE_HEADERS` to the end).
2. `cloudflare/r2-worker.js`: the same block, byte-identical.
3. `workers/r2-proxy.test.mjs`: the `publicRequest` fake and the PR rows, per §6. The 40 protected rows, `request` and `tokenFor` stay unchanged.
4. **New:** `docs/implementation/2026/quarter-IV/226-perf-r2-worker-single-read.md`.

Nothing else: not `package.json`, `biome.json`, `app/**` or any protected file. No dependency change.

## 6. Specified test rows (L52)
**The fake object:** 100 bytes `[0..99]`, `etag` `etag-1`, `httpEtag` `"etag-1"`.

**The fake call:** `publicRequest(path, { method, headers, missing, outOfRange: 'throw'|'short', failGet, changedOnSecondRead, empty, cancelRejects })`. It records:
- `heads`;
- `reads`, as `{ key, range, onlyIf }`;
- `opened`, one `{ cancelled }` per body.

**What the fake `get` does:**
- it honours `{ offset, length }`, `{ offset }` and `{ suffix }`, and clamps `length` at the end;
- for an offset ≥ size, it throws (`throw`) or returns an empty body (`short`);
- with `changedOnSecondRead`, the second read returns `"etag-2"`;
- with `failGet`, it always throws;
- with `empty`, it uses a 0-byte object;
- with `cancelRejects`, `cancel` rejects.

Bodies are `ReadableStream`s. The sketch file is the reference.

| Row | Steps | Expected |
|---|---|---|
| PR1 | unchanged | unchanged |
| PR2 (**changed**, §6.1) | `If-None-Match` = `"etag-1"`, `W/"etag-1"`, `"x", "etag-1"`, `*`, each **with** `Range: bytes=0-9` and **without** a Range | 304; body null; `reads` 1; `heads` 0; `opened` `[cancelled]`; `ETag` `"etag-1"`; `Cache-Control` `public, max-age=86400`; no `Content-Length`, `Content-Type` or `Content-Range`; ACAO `*`. `"other"` → 200 |
| PR3 (+ asserts) | as in round 309 | as in round 309, plus `reads` 1 and `heads` 0 for each case |
| PR4 (**changed**, §6.1) | `bytes=100-`, `bytes=500-600`, `bytes=-0`, each in `throw` and `short` mode | 416; `Content-Range` `bytes */100`; **`Cache-Control` `no-store`**; no `Content-Length` or `Content-Type`; `ETag` `"etag-1"`; body null; `reads` 1; every opened body cancelled; `heads` 1 and `opened` 0 for `throw` with an offset, otherwise `heads` 0 and `opened` 1 |
| PR5, PR6, PR7, PR8 | unchanged | unchanged |
| PR9 (+ asserts; proxy only) | as in round 309 | as in round 309, plus: the first cover GET has `heads` 0 and `reads` 1, and the 304 cancels its one body |
| PR10 (new) | GET with no Range, `bytes=50-`, `bytes=10-19`, `bytes=-5`, `bytes=0-1,5-6`; then HEAD with `bytes=0-9` | Each GET: `heads` 0, exactly one read with range `null`, `{offset:50}`, `{offset:10,length:10}`, `{suffix:5}` and `null` respectively; `onlyIf` null; the body is not cancelled. HEAD: `heads` 1, `reads` 0 |
| PR11 (new) | `short` mode, `bytes=95-500`, `bytes=-500`, `bytes=99-` | 206, and body length = `Content-Length` |
| PR12 (new) | `bytes=0-9` with `If-Range: "etag-1"`; then `If-Range: "old"` with `changedOnSecondRead` | The first: 206, one call in total, 10 bytes. The second: 200, 100 bytes, no `Content-Range`, `ETag` `"etag-2"`, reads `[{offset:0,length:10}, null]`, opened `[true, false]`, `heads` 0 |
| PR13 (new) | `failGet` with `bytes=0-9`; then `failGet` without a range | 500 with the body `Internal Error` and `heads` 1; then 500 |
| PR14 (new) | In each mode, `bytes=500-` with `If-None-Match: "etag-1"`; then `bytes=500-` with `If-Range: "old"` | The first: 304, body null, no `Content-Type` or `Content-Range`, `reads` 1, `heads` 1 (throw) or 0 (short), opened bodies cancelled. The second: 200, 100 bytes, `Content-Length` 100, no `Content-Range`, `public, max-age=86400`, reads `[{offset:500}, null]`, `heads` 1 (throw) or 0 (short) |
| PR15 (new) | `empty`, `bytes=0-` and `bytes=-5` in each mode; then `cancelRejects` with `If-None-Match: "etag-1"` | 416, `bytes */0`, `no-store`, body null; then **304** (not 500), with one body cancelled |

### 6.1 Changed contracts (listed, with the reason)
- **PR2:** round 309 asserted `reads` 0 for a 304 with a Range. Now `reads` is 1, the body is cancelled, and 0 body bytes are sent. The row now also covers the no-Range case.
- **PR4:** round 309 asserted `reads` 0 for a 416. Now `reads` is 1, any opened body is cancelled, and the response is `no-store`, in both R2 modes.
- **Reason:** gate-309 Medium #1. The reviewer's own words on the single-get alternative: "you lose the '416 before any read' guarantee". That trade-off is accepted:
  - a 304 or 416 costs one R2 operation, as the `head` did;
  - every 200/206 costs one R2 operation instead of two.
- **No assert is removed without a stronger one replacing it:** `heads` 0, `opened`/`cancelled`, `body` null and the exact headers. The old row titles may change, as in the sketch.

### 6.2 Mutants (A, on scratch; the expected reds are in `b-round-309/sketch/sketch-mutants.txt`)
| Mutant | Change | Red rows (at least) |
|---|---|---|
| MU-HEAD-FIRST | GET calls `head` before `get` | PR2, PR3, PR4, PR10, PR12, PR13, PR14 (both); PR9 |
| MU-416-PUBLIC | the 416 keeps the public Cache-Control | PR4, PR15 (both) |
| MU-304-NO-RELEASE | a 304 without the cancel | PR2, PR14, PR15 (both); PR9 |
| MU-NO-CLAMP | `b` is not clamped | PR3, PR11 (both) |
| MU-IFRANGE-NO-REFETCH | an If-Range mismatch serves the ranged body as the 200 | PR5, PR12, PR14 (both) |
| MU-THROW-UNHANDLED | a throwing ranged `get` is rethrown without the `head` | PR4, PR13, PR14, PR15 (both) |
| MU-CL-FROM-REQUEST | the 206 Content-Length comes from the request | PR3, PR11 (both) |
| MU-THROW-NO-INM | the throw path skips If-None-Match | PR14 (both) |
| MU-THROW-NO-IFRANGE | the throw path ignores If-Range | PR14 (both) |
| MU-REFETCH-STALE-ETAG | the re-read keeps the first object's ETag | PR12 (both) |
| MU-INM-STRONG | `etagMatches` stops stripping `W/` | PR2 (both) |
| MU-RELEASE-THROWS | `releaseBody` lets a rejected cancel through | PR15 (both) |
| MU-ONE-COPY | `cloudflare/r2-worker.js` is left at HEAD | the 7 `alternate:` rows PR2, PR3, PR4, PR10, PR12, PR14, PR15 |

## 7. A's order of work
1. A-CLAIMS.
2. The helper in `workers/r2-proxy.js`, then the same block in `cloudflare/r2-worker.js`, then A-PARITY and `node --check`.
3. The test file, then A-UNIT, then A-RED-ON-HEAD.
4. A-MUTANTS.
5. Typecheck and lint.
6. Doc 226.
7. `code-reviewer`.
8. Write `a-round-310.md` as you go.

## 8. Neighbouring behaviour at risk (C probes)
- **Protected routes:** PROTECTED-UNCHANGED, PR8, the 40 protected rows and G310-AUTH.
- **`<audio>` after a seek:** the WK-OPS rows check `advanced` true, and bytes = Content-Length on every 206.
- **The router's 500 path:** PR13.
- **The throw-path preconditions** (If-None-Match → 304, If-Range mismatch → full 200 with 3 R2 calls): unit rows PR14 only. The browser probe has no `If-Range` step, so C does not look for a browser row for them.
- **`api.proxy.audio.ts`:** it sends no Range and no If-None-Match, so it gets one `get` and a 200. Its behaviour does not change.
- **Production:** unchanged until Saba deploys (§11).

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-310.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- a change is needed outside §5 or above the helper line;
- a protected row turns red;
- an assert outside §6.1 must be removed;
- a mutant stays green;
- A-PARITY is not empty;
- typecheck fails, or lint has a new finding;
- the reviewer reports a Medium+ outside the grants, or any leak on a protected route.

## 10. Next, and requests (D-29z827)
- **C PASS + gate:** PERF-4d is done, and GATE309-M1/L2/L3 close.
- **Next:** REGRESSION if it is due. It falls due on or after **2026-11-05** [K14], and the round-311 planning checks the date first.
- **Otherwise PERF-5** (peaks in a worker), after:
  - the performance-optimizer + tech-lead consults;
  - the L37 premise re-measure at the new HEAD;
  - a ruling on whether the power-of-two pyramid (`oss-adoption.md`, PERF-5/14) lands in 5a or in a 5b;
  - deterministic rows (`perf/lib/determinism.ts`), not wall-clock only.

  The §0.4 input is the starting point.
- **RETRO** at round 320.
- **For Saba** (unchanged): SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE. Deploying the worker is outside the loop.
- **For root:**
  - **ROOT-REQ-VERIFY-WORKER-TESTS**, now "before or with the next worker change": the gate reviewer and tech-lead both ask for it. It is non-blocking, and C's WK-UNIT runs the tests meanwhile.
  - ROOT-REQ-VITEST-PERF-INCLUDE is still open.
  - The three checkpoint requests are unanswered and non-blocking. No new one: this is a bounded fix-up in the same block.

## 11. Commit readiness and deploy
After C PASS and the gate, root publishes the 3 modified paths and the new doc 226. Deploying the Cloudflare Worker stays outside the loop.

Doc 226's post-deploy list, against real R2:
- a 304 on revalidation;
- a 206 seek in Chrome **and Safari**, with the bytes equal to Content-Length;
- the cover 304;
- **which out-of-range branch R2 takes**: send one request with `Range: bytes=<size>-` and check whether a `head` follows the `get`. Also send `Range: bytes=-<size+1>` and check for a 206 with the whole object and bytes equal to Content-Length;
- **whether a CDN or shared cache stores the 416** (it must not, because of `no-store`);
- **TTFB p50/p95 per seek and per 304** (HEAD tree versus this change), plus R2 Class B operation counts from R2 metrics;
- the `onlyIf: { etagDoesNotMatch }` option of §4.3, once R2's weak/list semantics are confirmed.

## 12. Claims (L29 + L56)
`bash b-round-309/claims-310.sh` from the loop root (K1–K19). Outputs: `b-round-309/claims-310-head-output.txt` (HEAD) and `b-round-309/claims-310-sketch-output.txt` (sketch, `CLAIMS_STORE=/tmp/b309`).

| Tag | Claim | Expected at HEAD |
|---|---|---|
| K1 | gate 309 published `b65febe` | `published b65febe` |
| K2 | clean tree, HEAD | `0 b65febe` |
| K3 | frozen entries | `1182` |
| K4 | each protected file appears once | `1 1 1 1 1 1 1` |
| K5 | helper start line `workers/`, `cloudflare/`; file lengths | `198 160 255 217` (sketch `198 160 314 276`) |
| K6 | `R2_BUCKET.head(r2Key)` / `R2_BUCKET.get(r2Key` per copy (the protected handler holds one `get`) | `1 3 1 3` (sketch `2 4 2 4`) |
| K7 | `'no-store'` and `'private, no-store'` literals per copy | `0 0 1 1` (sketch `1 1 1 1`) |
| K8 | `'Image Not Found'`; `'File Not Found: ' + r2Key` per copy; `'Internal Error'` per copy | `1 2 2 1 1` |
| K9 | `node --test workers/r2-proxy.test.mjs` | `# tests 57 # pass 57 # fail 0` (sketch 69/69) |
| K10 | `package.json` has no `node --test workers`; gate-309 `verify.log` mentions of `r2-proxy` | `0 0` |
| K11 | helper parity diff lines | `0` |
| K12 | `onlyIf` per copy | `0 0` |
| K13 | B's probe op counts, HEAD vs sketch | as in the output |
| K14 | last regression date | `2026-11-02` |
| K15 | the round-309 archive equals the old task | `archive-equal-309` |
| K16 | doc 226 absent; the last doc | `0 225-perf-r2-worker-cache-range.md` |
| K17 | sketch mutant lines; restored 69/69 | `13 1` |
| K18 | every cited `b-round-309/` artifact exists (L56) | `done` |
| K19 | sketch tests red on the HEAD workers | `15` |
