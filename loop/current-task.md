# Round 309: PERF-4a. The R2 worker's public routes (previews and covers) get ETag → 304 and real byte ranges (206/416), in both worker copies. Purchased routes stay exactly as they are

**Planned by:** B, at the round 308 → 309 planning, 2026-11-03.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z820: round 308 closure. C PASS, gate 308 published `738df73`. **PERF-COMMIT-RESCHEDULE is closed on evidence** (`closed_on_evidence_c308`). The gate-308 review and C's INFO notes are ruled in §1.
- D-29z821: **PERF-4 is split into three stages, and nothing is dropped.**
  - **4a** is this round.
  - **4b**, studio caching, is `awaiting_user`. It needs Saba's answer, and its client half lives in protected files.
  - **4c**, immutable versioned keys, is a backend/upload handoff.
  
  §0.3 gives the reasons.
- D-29z822: the PERF-4a contract (§4) and its 9 specified test rows (§6).
- D-29z823: root requests and Saba questions (§10).

**Read first:** `lessons.md`. These apply directly: L11 (STOP), L23 (sketch before dispatch), L26/L28 (doc), L29/L56 (claims), L30 (Biome ignores `workers/`), L38 (probes run alone) and L52 (asserts that can fail).
- **L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.
- **Loop path:** `tmp/studio-real-loop` is a symlink, so search it with `find -L`.

## Baseline: HEAD `738df73`, clean tree
- Gate 308 published `738df73` [K1]. HEAD is `738df73` and `git status` is empty [K2].
- **Frozen list:** `b-round-308-r309-tree-sha256.txt`, **1,181** entries [K3]. Each of the 7 protected auth/purchase files appears once [K4].
- From `store/`, after A's change, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-308-r309-tree-sha256.txt` fails only on the 3 modified paths of §5. The new doc is the one new file.

## 0. Why this round

### 0.1 Queue
- Round 308 closed with C PASS (10 rows, `browserVerified`/`realVerified` true, 0 bugs). No Critical, High or Medium finding is open on the Studio.
- REGRESSION is due on or after 2026-11-05 [K15], so it is not due today. The next RETRO is at round 320.
- The next STUDIO-PERFORMANCE stage is **PERF-4** in `docs/technical/performance/perf-plan.md`: "R2 worker: ETag → 304, Range → 206 on previews, immutable hashed keys, stable studio asset URLs (auth outside the URL); purchased files stay `private`". Its target is "worker unit tests: 304, 206 + Content-Range, headers".
- As the perf plan requires, B consulted `performance-optimizer` and `tech-lead` (§0.4).

### 0.2 Premise measured at HEAD (L37)
B served each worker copy through a Node HTTP adapter over an in-memory R2 fake and drove it with real Chromium 143.
- Fixture: a 60 s WAV of 5,760,044 bytes.
- Probe: `b-round-308/probe/worker-server.mjs` + `browser-probe.cjs`.
- Output: `probe/head-proxy-1440.json` and `probe/head-alt-1440.json` [K14].

What the server logged, identically for both copies:
- **No `ETag`.** A `fetch(…, {cache: 'no-cache'})` revalidation downloads all **5,760,044** bytes again with status 200.
- **Range is ignored.** `Range: bytes=1000-1999` returns 200 with 5,760,044 bytes, but the preview still advertises `Accept-Ranges: bytes`.
- **An unsatisfiable range** (`bytes=999999999-`) returns 200 with the full body.
- **An `<audio>` seek to 50 s** sends `Range: bytes=4784128-` and gets **200 with all 5,760,044 bytes**. The seek still works because Chromium reads the full body.
- **A cover image** (the `workers/` copy only) has no `ETag`, so its revalidation is a full 200 too.

**On B's sketch** (§2), with the same probe (`probe/sketch-*-1440.json`):
- the revalidation is a **304 with 0 body bytes**;
- the range request is a **206** with `bytes 1000-1999/5760044` and 1,000 bytes;
- the unsatisfiable range is a **416** with `bytes */5760044`;
- the seek request is a **206** carrying **975,916** bytes (5,760,044 − 4,784,128), and playback advances from 50.0 s to 51.46 s;
- the cover revalidation is a **304**.

### 0.3 Why only the public routes this round (D-29z821)
Both consults agree that `/studio/` caching should not ship now:
- **No payoff yet.** The legacy stem client adds `?token=` to every stem URL [K12, `app/routes/studio.$productId.tsx` l.254, a protected file]. A new token per session means a new URL, and so a new cache key. ETag/304 on `/studio/` would almost never match.
- **The client half is protected.** "Auth outside the URL" means changing how the protected route sends the token. `<audio>` and WaveSurfer cannot send an `Authorization` header, so it needs a cookie or a fetch-to-blob design. That belongs in **SRW-21-PLAN**, which root and Saba apply outside the loop.
- **A security trade-off for Saba (L44).**
  - `private, no-cache` + ETag would let a buyer's browser keep purchased stems on disk, with every reuse re-authorized.
  - `private, no-store`, today's value [K6], re-downloads on every open.
  - Which one CZABA wants on shared machines is Saba's call (SABA-Q-PERF4-STUDIO-CACHE), not B's.
- **Immutable hashed keys** need versioned R2 keys written by the upload pipeline, which is not in this repository [K20: no wrangler config, no app import of either worker]. The product API would also have to return that version. This is a backend handoff (PERF-4c). The worker-side `?v=` rule (send `immutable` only when `v` equals the object's ETag) is part of 4c.

So **4a** delivers everything the worker can do safely on the public routes now. 4b and 4c stay in the backlog with their owners. **Downloads, recordings and originals keep `private, no-store`.** Both consults said so: they are one-off or short-lived, and caching them gains little.

### 0.4 Consults (round 308 → 309 planning)
- **performance-optimizer:**
  - ETag from `object.httpEtag`, 304 support and a real single-range 206 on previews; ETag/304 on covers.
  - 416 with `bytes */SIZE` when the start is at or past the size; multi-range or bad syntax → ignore and send 200; clamp the end.
  - If-None-Match wins over Range. If-Range must match strongly, otherwise send 200.
  - A 304 carries `ETag`, `Cache-Control` and CORS, with no body and no full-size `Content-Length`.
  - `Access-Control-Expose-Headers: ETag, Content-Range, Accept-Ranges, Content-Length`.
  - No `immutable` without versioned keys.
  - Proof method: a Node adapter + Chromium, judged by the **server log** (JS `fetch` reports a 304 as 200), plus an audio seek.
- **tech-lead:**
  - Edit both copies the same way. There is no `wrangler.toml`, so we cannot know which copy is deployed.
  - The existing both-copies loop in `r2-proxy.test.mjs` proves parity. Image rows run only on `workers/r2-proxy.js`, because `cloudflare/r2-worker.js` has no image route [K5].
  - Keep `/studio/` at `no-store`.
  - Check for a missing `body` after a failed precondition. Set `ETag` only when a value exists.
  - The protected path must still return 401/403 before any R2 read when `If-None-Match` is present.
  - Neighbours: `api.proxy.audio.ts` (§8) and ProductCard's `<audio>`.
- **Where they differ, and the ruling.** performance-optimizer would let `/studio/` use `private, no-cache`; tech-lead would keep `no-store`. Both agree it gains nothing today. Ruling: keep `no-store` and ask Saba (D-29z821).

### 0.5 Sources for the HTTP and R2 facts
- **Cloudflare R2 Workers API reference** (`https://developers.cloudflare.com/r2/api/workers/workers-api-reference/`, read by B on 2026-11-03, sections "Bucket method definitions", "R2Object definition" and "R2GetOptions › Ranged reads"):
  - `head(key)` returns `R2Object | null` with metadata only.
  - `get(key, { range })` accepts `{ offset, length }` or a `suffix`.
  - When an `onlyIf` precondition fails, `get` returns an object whose `body` is undefined.
  - `httpEtag` is the quoted ETag for headers.
- **Inference, not a doc quote:** how real R2 answers a `range` past the end of the object. The contract therefore validates the range **before** any R2 read (§4.3), so the behaviour does not depend on that inference.
- **RFC 9110:**
  - §13.1.2 If-None-Match uses weak comparison, and `*` matches.
  - §13.1.5 If-Range uses strong comparison. A weak or date validator is treated as a mismatch here.
  - §13.2.2 evaluates If-None-Match before Range.
  - §14.1/§14.2 cover Range syntax. A server MAY ignore Range, so ignoring multi-range and invalid syntax is allowed.
  - §14.4 covers Content-Range.
  - §15.4.5 covers 304.
  - §15.5.17 covers 416.
  
  B did not fetch the RFC text in this session. If a row and the RFC disagree, A or C cite the section text in their report, and B rules.
- **Reference first / Ableton:** not in scope, because this is a performance round on a server worker. **Screen budget:** nothing visible changes.

## 1. Rulings on round 308 (D-29z820)
- **PERF-COMMIT-RESCHEDULE** → `closed_on_evidence_c308`, because C reproduced B's continuity evidence (CONT-1 6/6, CONT-30 6/6, no click). Stage b-ii is not opened.
- **Gate-308 review** (`gates/round-308/review.md`, "COMMIT: OK"):
  - **GATE308-L1 (Low):** doc 224 cites `tmp/` evidence that lives outside the repo. Its key numbers are already in the doc. → `deferred_low_polish`.
  - **GATE308-S2 (suggestion):** compute `when ?? ctx.currentTime` once in `stop()`. → It joins the PERF-RESCHEDULE-UNUSED-CODE signal, with the reviewer Low's `Math.max(when ?? now, now)` bound from round 308. It is done before any `replaceClips` caller.
  - **GATE308-S3 (suggestion):** RC13 should use `toBe(2)` for the click count. → `deferred_low_polish`.
- **C's INFO notes:**
  - INFO-C308-SAME-WHEN and INFO-C308-POSCTL-INCONCLUSIVE become one retro candidate, RC-R308-SPLICE-PROBE: an audio-splice probe saves raw captures, adds a random pre-release delay and carries a positive control. Doc 224 is published and is not reopened.
  - INFO-C308-COLD-DEV: recorded. C warms each route up first.
- **A's Architecture note:** the same source-registry signal as round 307 (A-R307-ARCH-SOURCE-REGISTRY). Its count goes up by one; there is no new request.

## 2. B's pre-check (L23)
- **Sketch** on a scratch copy (`/tmp/b309`, never in `store/`). Kept in the loop folder:
  - `b-round-308/sketch.patch.txt` (both workers);
  - `sketch-r2-proxy.js.txt` and `sketch-r2-worker.js.txt`;
  - `sketch-public.sketch.test.mjs.txt`, the §6 rows as a separate file.
- **Run:** `node --test` on the sketch rows + the existing file gave **57/57** (40 existing + 17 new).
- **Mutants** (`b-round-308/sketch-mutants.txt` [K18]). Each was red on the rows listed in §6:
  - MU-NO-INM, MU-RANGE-200, MU-416-PASS, MU-IFRANGE-IGNORED, MU-HEAD-READS, MU-NO-EXPOSE;
  - MU-STUDIO-CONDITIONAL, which also turns 8 existing protected rows red;
  - MU-ONE-COPY, where the `cloudflare/` copy is left at HEAD and the 6 `alternate:` rows turn red.
- **Browser:** `probe/sketch-proxy-1440.json` and `sketch-alt-1440.json` (§0.2).
- **No collisions.** No existing row tests a public route [K9: 40 rows, all protected], so no existing assert changes. `getContentType` and the protected handler are untouched.
- A may copy the sketch. It is a proposal, not a grant beyond §5.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-308/claims-309.sh` equals `b-round-308/claims-309-head-output.txt`. A difference is a STOP |
| A-UNIT | Rows PR1–PR9 (§6) are added to `workers/r2-proxy.test.mjs` inside the existing `for (const [name, worker] …)` loop. PR9 runs for `proxy` only. Then `node --test workers/r2-proxy.test.mjs` reports **57 tests, 57 pass, 0 fail**. Also run `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts` (both unchanged; they must stay green). Report the times |
| A-MUTANTS | The 8 mutants of §6, on a scratch copy (never in `store/`). Each is red on its listed rows and green when restored. Logs and `.patch.txt` diffs go under `a-round-309/` |
| A-PARITY | `diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' workers/r2-proxy.js) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' cloudflare/r2-worker.js)` is empty: the helper block is byte-identical in both copies |
| A-TYPE/LINT | `npm run typecheck` rc 0 and `npm run lint` rc 0, with no new finding. Biome does not process `workers/` or `cloudflare/` [K10] (L30), so A also runs `node --check` on both workers |
| A-REVIEW | `code-reviewer` on the 4 paths. Ask it to check security: no leak on the protected routes, and no header injection. For a Medium+ inside the grants, fix it and re-review the changed lines. A Medium+ outside the grants is a STOP. The Architecture note goes to B |
| A-DOC | The new doc `docs/implementation/2026/quarter-IV/225-perf-r2-worker-cache-range.md`. It is in Georgian, with technical terms in English, and its `## ` headings contain TEMPLATE's 7 headings in order (L26). l.4 is exactly `**სტატუსი:** Completed (C round 309 PASS)` (L28). Content: the §0.2 numbers with their files; the §4 contract; the §0.3 split with the 4b/4c owners; the R2 doc facts versus the inference (§0.5); the rows and mutants; and the deploy note (§11). It cites only rows and files that exist |

### 3.2 C's rows
C writes `c-round-309.md` and `c-round-309.json` as it goes, with the L57 fields:
- `assertsSpecified` = 9 (PR1–PR9);
- `mutantsRecorded` = 8;
- `mutantRedOnSketch` = 8 (B's `sketch-mutants.txt`).

Each finding carries an `origin`.

**Browser rows.** Real Chromium, on A's tree. L38 applies: nothing else runs during the probe.
- **Viewport:** network behaviour does not depend on it, so each row runs once at 1440×900, and the task says so (this is not a skipped viewport).
- **Fixture caveat:** the fake R2 in `worker-server.mjs` follows the doc facts in §0.5. For an out-of-range read it throws, which is an inference. The worker never reaches that path, because PR4 shows 0 reads.

| Row | Action | Expected (from the **server log**, not from JS `fetch` status) |
|---|---|---|
| WK-BROWSER-PROXY | Copy `b-round-308/probe/worker-server.mjs` and `browser-probe.cjs` to `c-round-309/`. Run `node worker-server.mjs <store>/workers/r2-proxy.js <port> <log>`, then `node browser-probe.cjs http://127.0.0.1:<port> <log> <out> 1440x900` | `revalidate`: one GET, status **304**, bodyBytes 0, `inm` present. `rangeFetch`: **206**, `bytes 1000-1999/5760044`, bodyBytes 1000. `unsatisfiable`: **416**, `bytes */5760044`, bodyBytes 0. `head`: 200 with `content-length` 5760044 and bodyBytes 0. `audioSeek`: `advanced` true, `error` null, every line 206, and at least one line whose Content-Range start is > 0 and whose bodyBytes equals 5,760,044 − start. `coverTwice`: second status **304**. The JS side reads `etag` as a quoted string (Expose-Headers works across origins) |
| WK-BROWSER-ALT | As above with `<store>/cloudflare/r2-worker.js` | The same as WK-BROWSER-PROXY, except `coverTwice`, which stays **404/404** (this copy has no image route [K5]) |
| WK-HEAD-CONTROL | The same probe on `git show HEAD:workers/r2-proxy.js` saved to C's scratch | It reproduces `probe/head-proxy-1440.json`: revalidate 200 with 5,760,044 bytes, range 200, unsatisfiable 200, seek 200. This proves the probe can tell the two trees apart |
| G309-AUTH | As G308-AUTH (`c-round-308/g308-auth.cjs`, copied; a fresh anonymous context; warm each route first), both viewports | `/studio-lab` shows the workspace + the demo badge with `auth_user` null. `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header returns 401. No token appears in any body |

**Offline rows:**
- **WK-UNIT.** C re-runs `node --test workers/r2-proxy.test.mjs`: 57/57. This is C's own row, **not** a gate row, because `npm run verify` does not run it [K10, K11]. Also run the two vitest files of A-UNIT.
- **PROTECTED-UNCHANGED.** In both workers, these are byte-identical to HEAD:
  - the `fetch` router (`export default { … };`);
  - `handleProtected`, `isSafeFileName` and `validateToken`;
  - `getContentType`.
  
  Check with `git show HEAD:<file>` and the same `awk` function extraction on both sides. PR8 is green, and MU-STUDIO-CONDITIONAL is red in A's log.
- **SOURCE-SCOPE.** `git status --short --untracked-files=all` lists exactly the 3 modified §5 paths and the 1 new doc. `sha256sum -c` fails only on the 3. The 7 protected files, `api.proxy.audio.ts`, `r2.config.ts`, `r2-tokens.server.ts`, `package.json` and `biome.json` have no diff. In `r2-proxy.test.mjs`, `git diff` shows added lines only, all before the loop's closing `}`: no line is removed, so no `assert` line and no `test(` row is removed or changed.
- **CLAIMS.** Re-run `claims-309.sh`. After A, the expected changes are:
  - K2 `4 738df73`;
  - K5–K8: equal to `b-round-308/claims-309-sketch-output.txt` (B ran the script on the sketch with `CLAIMS_STORE=/tmp/b309`): K5 `66/73/83 | 57/66` with the same 3 + 2 functions, K6 `0 0 0 1 1` (the public values move into the helper call sites; the two `private, no-store` lines stay), K7 `6 3 4`, K8 `69 2 2`. If A's code differs from the sketch, A writes the values to `a-round-309/claims-after.txt` with the reason. C checks the reason against §4. The function sets in K5 and the `2 2` counts in K8 must hold in every case. In that sketch run, K2, K10–K13, K17 and K21 are empty or wrong, because `/tmp/b309` has no git, `app/` or config files. K9 shows 40, because the sketch rows sit in a separate file. None of these is drift;
  - K9 `# tests 57 # pass 57 # fail 0`;
  - K17 `1 225-perf-r2-worker-cache-range.md`.
  
  Every other K equals the HEAD output. A different value is a `countMismatches` entry with its K.
- **TESTS-READ.** PR1–PR9 follow §6, and their asserts can fail (L52): A's mutant log shows each listed row red. C may add its own mutant.
- **DOC.** Doc 225 per A-DOC.
- **Gate rows** (C does not claim them; list them under `"gate"`): full vitest, build, Biome, `npm run verify` and the e2e smoke.

`browserVerified` is true only if WK-BROWSER-PROXY, WK-BROWSER-ALT, WK-HEAD-CONTROL and G309-AUTH all ran.

**Not runnable here (not BLOCKED, not PASS):** a Store-page row in which ProductCard's `<audio>` plays a real worker preview. The cloud mock API serves local `/…mp3` previews, not worker URLs [K13], and the deployed worker is not reachable. C lists it under `"notRunnableHere"` and B keeps it as later evidence (WK-STORE-PREVIEW-LIVE).

## 4. Contract (D-29z822)
Make the same change in **both** `workers/r2-proxy.js` and `cloudflare/r2-worker.js`.

### 4.1 One shared helper block
Append it at the end of each file, byte-identical in both (A-PARITY). It holds:
- `PUBLIC_EXPOSE_HEADERS`;
- `etagMatches(header, httpEtag)` (weak comparison; `*` matches; a list is split on commas);
- `parseSingleRange(header, size)`;
- `servePublicObject(request, r2Key, env, corsHeaders, cacheControl, contentType, allowRange)`.

The names may differ from the sketch, but the block stays identical in both files.

### 4.2 Order inside `servePublicObject`
1. `head(r2Key)`. If it returns null, the caller returns its **existing** 404 response, with the same text and status: `'File Not Found: ' + r2Key` for previews and `'Image Not Found'` for covers [K8].
2. Headers: the existing CORS headers, `Access-Control-Expose-Headers: ETag, Content-Range, Accept-Ranges, Content-Length`, the route's **existing** `Cache-Control` value (`public, max-age=86400` for previews, `public, max-age=604800` for covers; no `immutable`, no `stale-while-revalidate`), and `ETag` = `httpEtag` **only when it is present**.
3. If `If-None-Match` matches → **304** with no body. It carries the headers of step 2 and no `Content-Type` or `Content-Length`. This comes before any Range handling and before any body read.
4. Set `Content-Type` (existing `getContentType`), and set `Accept-Ranges: bytes` on previews only.
5. Previews only: if `If-Range` is present and is not strongly equal to `httpEtag` (a weak or date value counts as not equal), ignore Range.
6. Parse a **single** `bytes=` range:
   - `a-b`, `a-` and `-n` are valid;
   - a list, another unit, `b < a` or an empty spec → ignore it and serve the full 200;
   - `a ≥ size`, or `-0`, or `size` 0 → **416** with `Content-Range: bytes */<size>`, no body and no R2 `get`;
   - clamp `b` to `size − 1`. For `-n` with n > size, the answer is a **206** with `Content-Range: bytes 0-<size−1>/<size>`, as in the sketch, not a 200.
7. For a range: **206** with `Content-Range: bytes <first>-<last>/<size>` and `Content-Length` = the slice length. GET reads `get(r2Key, { range: { offset, length } })`. **HEAD reads nothing.**
8. Otherwise **200** with `Content-Length` = size. GET reads `get(r2Key)`. **HEAD reads nothing.** If a `get` returns null in step 7 or 8 (the object was deleted between head and get), the helper returns `null` as in step 1, and the caller returns its own 404. So the helper itself contains no 404 text (K8 `2 2`).

### 4.3 Covers (`workers/r2-proxy.js` only)
`handleImage` uses the helper with `allowRange` false. A Range header on a cover is ignored, and the response is the full 200 (or a 304).

### 4.4 Not in this round (frozen)
- `/studio/`, `/download/`, `/recordings/`, `/originals/`: no `onlyIf`, no ETag, no 304. They keep `private, no-store`, their Range rules and the order "token → scope → R2 read" (PR8, PROTECTED-UNCHANGED).
- The `fetch` router, CORS `Allow-*` headers, `OPTIONS`, `validateToken`, `isSafeFileName` and `getContentType` are unchanged.
- No new route and no `?v=` handling (that is 4c).
- `Access-Control-Allow-Headers` stays `Authorization, Content-Type, Range`. It does not need `If-None-Match`/`If-Range`, because the browser itself adds those headers (cache revalidation, an `<audio>` seek). Page JS never sets them, so there is no preflight.
- `api.proxy.audio.ts`, `r2.config.ts`, ProductCard and every `app/` file are unchanged.

### 4.5 Known race (accepted, recorded in the doc)
`head` then `get` is two R2 operations. If an object is replaced between them, a range could come from the new version under the old ETag. Keys are replaced rarely, and 4c (versioned keys) removes the race. This is recorded, not fixed.

## 5. Grants
A edits only these paths:
1. `workers/r2-proxy.js`: `handleImage` and `handlePreview` bodies, and the appended helper block (§4.1–4.3).
2. `cloudflare/r2-worker.js`: the `handlePreview` body and the appended helper block.
3. `workers/r2-proxy.test.mjs`: inside the existing `for` loop, a new `publicRequest` helper (a fake R2 with `head` and `get` that honours `{ offset, length }`, records reads and heads, and can return null). Then rows PR1–PR9 appended at the end of the loop. Existing rows, the `request` helper and `tokenFor` stay unchanged.
4. **New:** `docs/implementation/2026/quarter-IV/225-perf-r2-worker-cache-range.md`.

Nothing else: not `package.json`, `biome.json`, `api.proxy.audio.ts`, `r2.config.ts`, `r2-tokens.server.ts`, `app/**`, and no protected file. No dependency changes, so L35 does not apply.

## 6. Specified test rows (L52)
The fake object is 100 bytes `[0..99]` with `httpEtag` `"etag-1"`. `heads` and `reads` record the R2 calls.

| Row | Steps | Expected |
|---|---|---|
| PR1 | GET preview | 200; `ETag` `"etag-1"`; `Cache-Control` `public, max-age=86400`; `Content-Length` 100; body 100 bytes; `Access-Control-Expose-Headers` exactly `ETag, Content-Range, Accept-Ranges, Content-Length` |
| PR2 | `If-None-Match` set to `"etag-1"`, `W/"etag-1"`, `"x", "etag-1"` and `*`, each **with** `Range: bytes=0-9` | 304 each; body null; `reads` 0; `ETag` present; no `Content-Length`; no `Content-Type`; `Access-Control-Allow-Origin` `*`. `If-None-Match: "other"` → 200 |
| PR3 | Range `bytes=10-19`, `bytes=90-`, `bytes=-5`, `bytes=95-500` | 206; `Content-Range` `bytes 10-19/100`, `90-99/100`, `95-99/100`, `95-99/100`; `Content-Length` and body length 10, 10, 5, 5; the first byte equals the start |
| PR4 | Range `bytes=100-`, `bytes=500-600`, `bytes=-0` | 416; `Content-Range` `bytes */100`; `reads` 0 |
| PR5 | Range `bytes=5-2`; `bytes=0-1,5-6`; `items=0-1`; `bytes=0-9` with `If-Range: "other"`; `bytes=0-9` with `If-Range: W/"etag-1"` | 200 each, with the full 100-byte body and no `Content-Range`. `bytes=0-9` with `If-Range: "etag-1"` → 206 |
| PR6 | HEAD without a range; HEAD with `bytes=0-9` | 200 with `Content-Length` 100, then 206 with `Content-Length` 10; `reads` 0 in both |
| PR7 | Preview whose `head` returns null | 404 with the body `File Not Found: mall/Preview/none.wav` |
| PR8 | `/studio/` with a valid studio token and `If-None-Match: "etag-1"`; then with a bad token and the same header | 200, `Cache-Control` `private, no-store`, no `ETag`, `heads` 0. Then 401 with `reads` + `heads` = 0 |
| PR9 (proxy only) | Cover GET; with `If-None-Match`; with `Range: bytes=0-9`; with `head` null | 200 with `ETag` and `public, max-age=604800`; 304; 200 (Range ignored); 404 with the body `Image Not Found` |

**Mutants** (A, on scratch; the expected reds are B's sketch result [K18]):

| Mutant | Change | Red rows |
|---|---|---|
| MU-NO-INM | ignore If-None-Match | PR2 (both), PR9 |
| MU-RANGE-200 | ignore Range | PR3, PR4, PR5, PR6 (both) |
| MU-416-PASS | drop the `start ≥ size` check | PR4 (both) |
| MU-IFRANGE-IGNORED | serve the range whatever If-Range says | PR5 (both) |
| MU-HEAD-READS | HEAD falls through to `get` | PR6 (both) |
| MU-NO-EXPOSE | drop Expose-Headers | PR1 (both) |
| MU-STUDIO-CONDITIONAL | route `/studio/` through the public helper first | PR8 + the existing Studio/recording/UTF-8 rows (both) |
| MU-ONE-COPY | leave `cloudflare/r2-worker.js` at HEAD | the 6 `alternate:` rows PR1–PR6 |

## 7. A's order of work
1. A-CLAIMS.
2. The §4 helper in `workers/r2-proxy.js`, then the same block in `cloudflare/r2-worker.js`, then A-PARITY.
3. PR1–PR9, then A-UNIT.
4. A-MUTANTS.
5. Typecheck and lint, plus `node --check`.
6. Doc 225.
7. `code-reviewer`.
8. Write `a-round-309.md` as you go: per-row results, the mutant table, the claims after the change, and the Architecture note.

## 8. Neighbouring behaviour at risk (C probes)
- **Protected routes:** covered by PR8, PROTECTED-UNCHANGED, the existing 40 rows and G309-AUTH.
- **`<audio>` previews** (ProductCard, the player): now 206 on seek. WK-BROWSER-* checks playback after a 206 seek in Chromium. **Safari** is stricter about 206, and that is not measurable here. Doc 225 records it as a check after deploy.
- **`app/routes/api.proxy.audio.ts`** re-fetches a preview without Range or If-None-Match [K13], so it keeps getting a 200 and its behaviour does not change. It also sets `public, max-age=31536000` on keys that are not versioned [K13]. That is pre-existing and not touched here, recorded as **B-R308-PROXY-AUDIO-YEAR-CACHE (Low)** → `deferred_low_polish`.
- **The deployed worker is not updated by this round.** Root publishes git only, so §11 applies.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-309.md` and changes nothing else when:
- A-CLAIMS differs from `claims-309-head-output.txt`;
- a change is needed outside §5;
- an existing row in `r2-proxy.test.mjs` turns red, or needs an assert change;
- a mutant stays green;
- A-PARITY is not empty;
- typecheck fails or lint has a new finding;
- the reviewer reports a Medium+ outside the grants or any leak on a protected route.

## 10. Next, and requests (D-29z823)
- C PASS + gate → PERF-4a is done. **Next: PERF-5** (peaks in a worker), after the consults and a premise re-measure. **REGRESSION** comes first when it is due (on or after 2026-11-05).
- **For Saba:**
  - **SABA-Q-PERF4-STUDIO-CACHE:** for purchased Studio stems, either let the buyer's browser keep them on disk (`private, no-cache` + ETag, each reuse re-authorized; faster re-opens) or keep `no-store` (re-download on every open; nothing left on a shared machine). It pays off only after the token leaves the URL (SRW-21-PLAN).
  - **SABA-Q-WORKER-DEPLOYED:** which copy is deployed, `workers/r2-proxy.js` or `cloudflare/r2-worker.js`? After the answer, a bounded task can remove the other copy.
- **For root:**
  - **ROOT-REQ-VERIFY-WORKER-TESTS:** add `node --test workers/r2-proxy.test.mjs` to `npm run verify` (today 0 lines of `verify.log` mention it [K11]). Until then, C runs it as WK-UNIT. It is non-blocking and sits next to ROOT-REQ-VITEST-PERF-INCLUDE.
  - The checkpoint requests (ARCH-CHECKPOINT-STUDIO-LINK, D-29z811 and `b-round-306-checkpoint-request.md`) are still unanswered and non-blocking.
- **PERF-4b / 4c owners:** 4b is `awaiting_user` (SABA-Q-PERF4-STUDIO-CACHE) and its client half goes into SRW-21-PLAN. 4c is a backend/upload handoff; doc 225's TODO carries it.

## 11. Commit readiness and deploy
- After C PASS and the gate, root publishes the 4 §5 paths.
- **Deploying the Cloudflare Worker is outside the loop.** Saba (or root on his instruction) deploys it after confirming which copy is live (SABA-Q-WORKER-DEPLOYED). Doc 225 lists the checks to run after deploy: a 304 on revalidation, a 206 on an `<audio>` seek in Chrome and Safari, and the cover 304. Until it is deployed, production behaviour is unchanged.

## 12. Claims (L29 + L56)
Run `bash b-round-308/claims-309.sh` from the loop root (K1–K21). Sketch output: `b-round-308/claims-309-sketch-output.txt`. HEAD output: `b-round-308/claims-309-head-output.txt`.

| Tag | Claim | Expected at HEAD |
|---|---|---|
| K1 | gate 308 published `738df73` | `published 738df73` |
| K2 | clean tree, HEAD | `0 738df73` |
| K3 | frozen entries | `1181` |
| K4 | each protected file once | `1 1 1 1 1 1 1` |
| K5 | handlers: `workers/` image 66, preview 84, protected 106; `cloudflare/` preview 57, protected 78 | as output |
| K6 | literal Cache-Control lines: preview ×2 copies, image, no-store ×2 | `1 1 1 1 1` |
| K7 | ETag/If-None-Match/Content-Range mentions (`workers/`); ETag/INM (`cloudflare/`); Content-Range (`cloudflare/`) | `1 0 1` (sketch `6 3 4`) |
| K8 | `'Image Not Found'` line; `'File Not Found: ' + r2Key` count per copy | `72 2 2` |
| K9 | `node --test workers/r2-proxy.test.mjs` | `# tests 40 # pass 40 # fail 0` |
| K10 | `package.json` has no `node --test workers`; Biome includes | `0 "includes": ["app/**/*.ts", "app/**/*.tsx"]` |
| K11 | gate-308 `verify.log` mentions `r2-proxy` | `0` |
| K12 | the legacy client appends `?token=` | `254` |
| K13 | mock previews are local paths (8); `api.proxy.audio.ts` refetch line; 1-year cache | `8 1 1` |
| K14 | B's probes, HEAD vs sketch (`workers/` copy) | as output |
| K15 | last regression date | `2026-11-02` |
| K16 | round-308 archive equals the old task | `archive-equal-308` |
| K17 | doc 225 absent; last doc | `0 224-perf-commit-reschedule.md` |
| K18 | B's sketch mutants listed, red lines | 8 names, `7` (the MU-ONE-COPY line prints its red rows without the word "red") |
| K19 | every cited `b-round-308/` artifact exists, `claims-309-sketch-output.txt` included (L56) | `done` |
| K20 | app/package files naming either worker; wrangler files | `0 0` |
| K21 | `tsconfig.json` has `allowJs` but includes only `**/*.ts(x)`, so `npm run typecheck` does not check `workers/*.js` (A-TYPE/LINT adds `node --check`) | `1 "include": ["**/*.ts", "**/*.tsx"]` |
