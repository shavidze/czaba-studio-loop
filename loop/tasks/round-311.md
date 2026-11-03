# Round 311: PERF-4e. Gate-310 fix-up in the R2 worker helper: no 500 on a huge but valid Range, If-None-Match answered after the If-Range re-read, and the throw-path re-read ETag pinned. Purchased routes are unchanged

**Planned by:** B, at the round 310 → 311 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v270 → `decisions_log_b`):
- **D-29z828: round 310 is closed.** C PASS, and gate 310 published `8946431`. PERF-4d is done on evidence, and GATE309-M1/L2/L3 are closed.
- **D-29z829: ruling on gate-310 review #1.**
  - The reviewer's premise is wrong in part: the R2 docs document suffix overflow as well as length overflow (§0.2).
  - A residual stays real: a length or suffix that is not a safe integer still reaches R2 unclamped.
  - The finding stays **Medium** (GATE310-M1) and is fixed now, together with GATE310-L3 and C-R310-01. All three are in one helper block.
- **D-29z830:** the contract (§4), the test rows (§6), 25 mutants, and the rulings on the tech-lead consult (§0.4).
- **D-29z831:** requests and bookkeeping (§10).

**Read first:** `lessons.md`. These apply directly:
- L11: STOP.
- L23: sketch before dispatch.
- L26/L28: the doc.
- L29/L56: claims.
- L30: Biome ignores `workers/`.
- L38: probes run alone.
- L52: asserts must be able to fail.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `8946431`, clean tree
- Gate 310 published `8946431` on both remotes [K1]. HEAD is `8946431`, and `git status` is empty [K2].
- **Frozen list:** `b-round-310-r311-tree-sha256.txt`, 1,183 entries [K3]. Each of the 7 protected auth/purchase files appears once [K4].
- From `store/`, after A's change, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-310-r311-tree-sha256.txt` fails only on the 3 modified paths of §5. The new doc 227 is the only new file.

## 0. Why this round

### 0.1 The findings (three, in one helper block)
| Id | Severity | What |
|---|---|---|
| **GATE310-M1** (+ A-R310-REVIEW-L1, INFO-C310-OVERSIZED-RANGE) | Medium | Since round 310, `r2RangeOf` passes the client's numbers to R2 as written. If R2 rejects a value, the catch path finds the range servable and rethrows, so the client gets a **500**. At `b65febe` the same request was clamped through `head` and got a 206 |
| **GATE310-L3** (= B-R309-REFETCH-INM-WINDOW) | Low | After an If-Range mismatch, the re-read compares If-None-Match with the **first** object. If the object changed in between, a client that already holds the new version gets a full 200 instead of a 304 |
| **C-R310-01** (= A-R310-REVIEW-L2) | Low | No row pins the ETag of the throw-path If-Range re-read. C's mutant that kept `head`'s ETag survived 69/69 |

All three are in `servePublicObject` and its helpers, in both worker copies [K5]. Some A-R310-REVIEW-L3 test gaps sit in the same rows, and they are added because they cost nothing (§6). A Low may be fixed now when the round already owns that code.

### 0.2 R2 facts: documented versus inferred (D-29z829)
- **Documented** (R2 Workers API reference, fetched 2026-11-03 and kept as `b-round-310/r2-workers-api-reference-2026-11-03.md.txt`; l.231 and l.233 [K20]):
  - **`length`:** "If more bytes are requested than exist in the object, fewer bytes than this number may be returned."
  - **`suffix`:** the same sentence.

  So `bytes=-500` on a 100-byte object, or `bytes=95-500`, is safe on real R2. The reviewer's premise that "the docs only promise `length`" is contradicted, and that sub-case needs no change.
- **Not documented:**
  - what R2 does with a value that is **not a safe integer** (`Infinity`, `1e20`), which a valid header such as `bytes=0-<400 nines>` produces through `Number()`;
  - what R2 does with an offset ≥ size. The round-310 contract already handles both possible behaviours for this.
- **Inference used in the probe and the unit fake:** R2 rejects a non-safe-integer range value with a `TypeError`. This is **not** an observation of R2. The task never writes "R2 returns 500"; it writes "with a strict fake".

### 0.3 Premise measured at HEAD (L37), real Chromium 143.0.7499.4
B's probe is in `b-round-310/probe/`. It is a copy of round 309's server with two switches [K13]:
- `R2_STRICT=1` rejects non-safe range values.
- `R2_SWAP=1` serves a new object version on the second `get` of a request.

| Step (1440×900) | HEAD `8946431` | Sketch, throw | Sketch, short |
|---|---|---|---|
| `bytes=0-<400 nines>` | **500** h1g1 | **206** h0g1, `bytes 0-5760043/5760044`, bytes = CL | same |
| `bytes=-<400 nines>` | **500** h1g1 | **206** h0g1 | same |
| `bytes=<400 nines>-` | 416 h1g1 | 416 h1g1 | 416 h1g1 |
| Re-read: `bytes=0-9`, `If-Range: "old"`, If-None-Match = the new ETag | **200** full, h0g2c1 | **304** h0g2c2 | same |
| Re-read on the throw path: `bytes=999999999-` + the same headers | **200** full, h1g2c0 | **304** h1g2c1 | 304 h0g2c2 |
| Normal seek `bytes=4784128-` | 206 h0g1 | 206 h0g1 | 206 h0g1 |

- The alt worker rows equal the proxy rows (`summary.txt`).
- Round 310's regression probe on the sketch (`reg-sketch-proxy-throw-1440.json`): revalidate 304 h0g1c1; seek 206 h0g1 ×3 with advanced true; 416 `no-store`; cover 304.
- **Method note:** If-Range and If-None-Match are not CORS-safelisted. A cross-origin page `fetch` fails at the preflight (measured: `TypeError: Failed to fetch` after OPTIONS 200). The re-read rows therefore use Playwright's `APIRequestContext` (`via: 'request'`), and the probe labels them that way. The `<audio>` element (no-cors) and same-origin callers can send these headers.

### 0.4 Consult (tech-lead, read-only) and rulings (D-29z830)
- **Result:** no blocking defect.
  - The RFC 9110 order is right: If-None-Match comes before Range and If-Range (§13.2.2).
  - The 304 headers are right (§15.4.5).
  - Safe-integer requests are unchanged.
  - `{offset:0}` for an unsafe suffix is correct: R2 objects are < 2^53 bytes, and Content-Range comes from `object.size`.
  - A far `start` gives 416 whatever R2 does.
  - The reviewer's retry is not needed.
- **Medium, "HEAD + Range must be ignored" (RFC 9110 §14.2):**
  - This behaviour predates the round, and PR6 already pins HEAD + Range → 206 [K22]. RFC 9110 §9.3.2 asks a HEAD response to carry the GET headers [K21], so the two clauses pull in different directions.
  - **Ruling:** out of scope. The first sketch's "HEAD + `bytes=500-` → 416" half of PR18 is **dropped**, so this round does not newly pin a disputed behaviour. Deferred Low **B-R310-HEAD-RANGE-RFC**.
- **Low, PR16's title and the far read:** fixed in the sketch. The title now says what is sent, and the far case asserts `reads` = `[{ offset: Infinity }]` and `heads` 1.
- **Low, the fake's strictness is an inference:** worded as such in §0.2.
- **Low, `Number()` precision above 2^53 in `parseRangeSpec`:** pre-existing. Deferred Low **B-R310-RANGE-PRECISION**.
- **performance-optimizer was not consulted for this round.** This is a bug fix-up that does not change the R2 call count or the byte path of any safe request: K6 is unchanged, and the probe's safe-path steps are h0g1 on both trees (§0.3). PERF-5 gets both consults.
- **Rejected alternative (the gate reviewer's #1 fix):** retry once in the catch with the range clamped from `head`. The documented overflow needs no retry. The retry adds a third R2 call and a head/get race on a rare path. The safe-integer guard removes the only undocumented input with zero extra calls.

### 0.5 Reference / screen budget
Not applicable. This is a fix-up on a server worker (policy: performance, refactor, test-only and fix-up rounds have no reference section). Nothing becomes visible in the Studio.

## 1. Rulings on round 310 (D-29z828)
- **C round 310:** PASS. 12 rows passed. `browserVerified`/`realVerified` are true. 1 Low (C-R310-01, scheduled here). Gate 310 review: COMMIT OK, 8/10 [K1].
- **PERF-4d → done.** GATE309-M1/L2/L3 are closed.
- **INFO-C310-WARM-STATUS-NULL:** recorded as an environment note. There is no screenshot, so it is not an observed UI state. The timed G310-AUTH that followed was ready at both viewports.
- **INFO-C310-HEAD-STEP10:** recorded. PR18 adds the HEAD + If-None-Match unit row.
- **gate-310 #4** (a 304 opens the body, then cancels it) and **#5** (`bytes=-0` reads the whole object to answer 416): recorded as GATE310-S4 and GATE310-S5. The `onlyIf` follow-up stays on the post-deploy list.
- **`tasks/round-310.md`:** archived as a copy, identical to the old `current-task.md` [K15].

## 2. B's pre-check (L23)
- **Sketch** (`b-round-310/sketch/`):
  - `helper-block.js.txt`, with its diff from HEAD in `helper-block.patch.txt`;
  - both full worker files;
  - the test file, with its diff from HEAD in `sketch-r2-proxy.test.patch.txt`.
- **Results:**
  - **75/75** pass on the sketch (`sketch-tests-on-sketch.txt`).
  - The same test file on the **HEAD** workers gives **4 red**: PR16 and PR17, ×2 copies [K19] (`sketch-tests-on-head.txt`). PR18 and the PR13/PR15 additions pin existing behaviour. Their red-proof is by mutant.
  - **25/25 mutants are red**, and the restored sketch passes 75/75 [K17] (`sketch-mutants.txt`, `mutant-logs/`).
- The claims run on HEAD and on the sketch (§12).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-310/claims-311.sh` equals `b-round-310/claims-311-head-output.txt`. A difference is a STOP |
| A-UNIT | Apply §6, then run `node --test workers/r2-proxy.test.mjs`: **75 tests, 75 pass, 0 fail**. Also run `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts`: unchanged, 32/32. Report the times |
| A-RED-ON-HEAD | On scratch, put the finished test file next to the **HEAD** workers (`git show HEAD:…`) and run it. The result must equal the 4 red rows of `sketch-tests-on-head.txt`, or a superset with the reason. Log: `a-round-311/tests-on-head.txt` |
| A-MUTANTS | Run the 25 mutants with `b-round-310/sketch/mutants.py` on scratch (never in `store/`). Argument 3 is `b-round-310/sketch/head-helper-block.js.txt`, used by MU-ONE-COPY. Each mutant must be red on at least its rows in `sketch-mutants.txt`, and the restored code must be green. Logs and `.patch.txt` files go under `a-round-311/` |
| A-PARITY | `diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' workers/r2-proxy.js) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' cloudflare/r2-worker.js)` is empty |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint` rc 0 with no new finding (round 310: 205 warnings + 1 info). `node --check` passes on both workers and on the test file (L30: Biome ignores `workers/` and `cloudflare/`) |
| A-REVIEW | `code-reviewer` on the 4 paths. Ask about: the safe-integer guard (could it change any safe value?); the 304 headers after a re-read; the ETag after a re-read; releasing every opened body; HEAD; the protected routes. A Medium+ inside the grants: fix it, then re-review the changed lines. A Medium+ outside the grants: STOP. The Architecture note goes to B |
| A-DOC | New `docs/implementation/2026/quarter-IV/227-perf-r2-worker-range-guard.md`, in Georgian with technical terms in English. TEMPLATE's 7 `## ` headings in order (L26). Line 4 is exactly `**სტატუსი:** Completed (C round 311 PASS)` (L28). Content: §0.1 to §0.4 (the documented vs inferred split, verbatim); the §4 contract; the rows and mutants; the post-deploy additions (§11). It cites only files that exist. Docs 225 and 226 are **not** edited |

### 3.2 C's rows
C writes `c-round-311.md` and `c-round-311.json` as it goes, with the L57 fields:
- `assertsSpecified` = 18 (PR1–PR18);
- `mutantsRecorded` = 25;
- `mutantRedOnSketch` = 25.

Each finding carries an `origin`.

**Browser rows.** Real Chromium on A's tree, under L38: nothing else runs during a probe.
- Network behaviour does not depend on the viewport, so each worker row runs once at 1440×900. This is stated here and is not a skipped viewport.
- C copies these into `c-round-311/`: `b-round-310/probe/worker-server.mjs`, `browser-probe-311.cjs` and `summarize.py`, plus `b-round-309/probe/browser-probe.cjs`.
- The verdict comes from the **server log**: `status`, `r2.heads/gets/cancels`, `r2.getRanges`, `bodyBytes`, `contentLength` and `cacheControl`. The JS side is not the verdict.
- The swap ETag is in `b-round-310/probe/swap-etag.txt`. Pass it as argument 5.

| Row | Action | Expected |
|---|---|---|
| WK-GUARD-PROXY | `R2_STRICT=1 R2_SWAP=1 R2_OOB=throw node worker-server.mjs <store>/workers/r2-proxy.js <port> <log>`, then `node browser-probe-311.cjs http://127.0.0.1:<port> <log> <out> 1440x900 "$(cat swap-etag.txt)"`. Repeat with `R2_OOB=short` | `hugeEnd` and `hugeSuffix`: **206 h0g1**, `getRanges` `[{offset:0}]`, `bytes 0-5760043/5760044`, bytes = CL. `hugeEnd20`: 206 h0g1, `[{offset:10}]`, `bytes 10-5760043/5760044`. `hugeStart`: 416 `no-store`, h1g1. `normalSeek`: 206 h0g1. `rereadNoInm`: 200, ETag = the swap ETag, full body. `rereadInm` and `rereadFarInm`: **304**, 0 bytes, ETag = the swap ETag, no Content-Type, cancels = gets in short mode. In throw mode `rereadFarInm` is h1g2c1 |
| WK-GUARD-ALT | The same, on `<store>/cloudflare/r2-worker.js`, throw and short | Every step equals the proxy rows |
| WK-OPS-REGRESSION | `R2_STRICT=1 R2_OOB=throw`, then `R2_OOB=short`, on `<store>/workers/r2-proxy.js` with `b-round-309/probe/browser-probe.cjs` (round 310's probe; `R2_SWAP` unset) | As round 310's WK-OPS rows: revalidate **304 h0g1c1**; range 206 h0g1; unsatisfiable 416 `no-store` (h1g1 throw, h0g1c1 short); HEAD 200 h1g0; audioSeek advanced true, error null, every line **206 h0g1**, bytes = CL; cover 200, then 304 h0g1c1 |
| WK-HEAD-CONTROL | `R2_STRICT=1 R2_SWAP=1 R2_OOB=throw` on `git show HEAD:workers/r2-proxy.js`, saved as `.mjs` in C's scratch, with `browser-probe-311.cjs` | Reproduces `b-round-310/probe/head-proxy-throw-1440.json`: `hugeEnd`/`hugeSuffix` **500**, `rereadInm` **200** h0g2c1. This proves the probe tells the trees apart |
| G311-AUTH | As G310-AUTH (copy `c-round-310/g310-auth.cjs`): a fresh anonymous context, with `/studio-lab` and `/studio/middle-east` warmed **in a browser** first (L38). **Both viewports** | `/studio-lab`: workspace and the demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token appears in any body |

**Offline rows:**
- **WK-UNIT.** C re-runs `node --test workers/r2-proxy.test.mjs` (75/75) and the 2 vitest files (32/32). This is C's own row, not a gate row [K10].
- **RED-ON-HEAD.** C runs A's final test file on the HEAD workers in scratch. It must show the 4 rows of `sketch-tests-on-head.txt`, or A's reported superset.
- **PROTECTED-UNCHANGED.** In both workers, everything above the line `const PUBLIC_EXPOSE_HEADERS` is byte-identical to HEAD: `diff <(git show HEAD:<f> | sed -n '1,/^const PUBLIC_EXPOSE_HEADERS/p') <(sed -n '1,/^const PUBLIC_EXPOSE_HEADERS/p' <f>)` is empty for each file. PR8 stays green.
- **SOURCE-SCOPE.**
  - `git status --short --untracked-files=all` lists exactly the 3 modified §5 paths and the 1 new doc. `sha256sum -c` fails only on the 3.
  - These have no diff: the 7 protected files, `api.proxy.audio.ts`, `package.json` and `biome.json`.
  - In `r2-proxy.test.mjs`, the diff stays inside `publicRequest` and the PR rows. The 40 protected rows, `request` and `tokenFor` are unchanged.
  - **No assert line is removed** (§6.1).
- **CLAIMS.** Re-run `claims-311.sh`. After A, these values change, and they equal `claims-311-sketch-output.txt`:
  - K2 `4 8946431`;
  - K5 `198 160 327 289`;
  - K7 `3 3 4 4`;
  - K9 `# tests 75 # pass 75 # fail 0`;
  - K16 `1 227-perf-r2-worker-range-guard.md`.

  K11 stays `0` (parity). K12 stays `0 0 1 1` (no `onlyIf`). K6 stays `2 4 2 4` (no new R2 call site). Every other K equals the HEAD output.
  - In the sketch run, K2, K10 and K16 are empty because `/tmp/b310s` has no git, `package.json` or docs. That is not drift.
  - If A's code differs from the sketch, A writes the values to `a-round-311/claims-after.txt` with the reason, and C checks the reason against §4.
  - A value that differs without a reason is a `countMismatches` entry with its K.
- **TESTS-READ.** PR1–PR18 follow §6 and can fail (L52): A's mutant logs show the listed reds. C adds at least one mutant of its own.
- **DOC.** Doc 227 per A-DOC.
- **Gate rows** (C does not claim them; they go under `"gate"`): full vitest, build, Biome, `npm run verify` and the e2e smoke.

`browserVerified` is true only if WK-GUARD-PROXY, WK-GUARD-ALT, WK-OPS-REGRESSION, WK-HEAD-CONTROL and G311-AUTH all ran.

**Not runnable here** (neither BLOCKED nor PASS; listed under `"notRunnableHere"`): WK-STORE-PREVIEW-LIVE (the deployed worker and real R2; Safari 206).

## 4. Contract (D-29z830)

### 4.1 `r2RangeOf(spec)` (both copies)
| Spec | Sent to R2 |
|---|---|
| suffix 0 | `null` (unchanged: a full `get`, then 416) |
| suffix, a safe integer | `{ suffix }` (unchanged) |
| suffix, **not** a safe integer | `{ offset: 0 }` |
| start, open end | `{ offset: start }` (unchanged, even when `start` is not safe: the existing throw or short path gives 416) |
| start–end with `end - start + 1` a safe integer | `{ offset: start, length }` (unchanged) |
| start–end with the length **not** a safe integer | `{ offset: start }` |

Content-Range and Content-Length still come from `resolveRangeSpec(spec, object.size)`, so `bytes=0-<huge>` → `bytes 0-(size-1)/size`.

### 4.2 After the If-Range re-read (both paths)
**Normal path.** After `releaseBody(first)` and the full `get`:
1. Set ETag from the second object (delete it when there is none).
2. If If-None-Match matches the second object's `httpEtag`: `releaseBody(second)`, then **304**.

Content-Type and Accept-Ranges are set **after** this block, so the 304 carries neither. The other responses carry the same headers as before.

**Throw path (catch).** After the full `get`:
1. Set ETag from that object.
2. If If-None-Match matches: `releaseBody`, then **304**.
3. Otherwise set Content-Type, Accept-Ranges and Content-Length and return 200, as before.

The 304 keeps ETag, Cache-Control and the CORS headers.

### 4.3 Unchanged (frozen)
- HEAD (one `head`; PR6 still pins HEAD + Range → 206; B-R310-HEAD-RANGE-RFC is deferred).
- The order "If-None-Match on the first object → 304" before Range.
- The 416 (`unsatisfiableResponse`).
- `releaseBody`.
- The rethrow → 500 for a satisfiable range whose `get` fails (PR13).
- No `onlyIf`.
- Everything above `const PUBLIC_EXPOSE_HEADERS`: the router, `handleImage`, `handlePreview`, `handleProtected`, `validateToken` and `isSafeFileName`.

The exact target block is `b-round-310/sketch/helper-block.js.txt`. Copying it is the expected path. Any difference needs a reason in `a-round-311.md`.

## 5. Grants
A edits only:
1. `workers/r2-proxy.js`: the helper block only (from `const PUBLIC_EXPOSE_HEADERS` to the end).
2. `cloudflare/r2-worker.js`: the same block, byte-identical.
3. `workers/r2-proxy.test.mjs`: the `publicRequest` fake and the PR rows, per §6. The 40 protected rows, `request` and `tokenFor` stay unchanged.
4. **New:** `docs/implementation/2026/quarter-IV/227-perf-r2-worker-range-guard.md`.

Nothing else: not `package.json`, `biome.json`, `app/**`, docs 225/226 or any protected file. No dependency change.

## 6. Specified test rows (L52)
The target file is `b-round-310/sketch/sketch-r2-proxy.test.mjs.txt`, with its diff in `sketch-r2-proxy.test.patch.txt`.

| Row | What it pins | Red-proof |
|---|---|---|
| fake | `get` throws `TypeError` when `range.offset`, `length` or `suffix` is defined and not a safe integer (an inference, §0.2) | — |
| PR13 (+1 assert) | an un-ranged failed `get` → 500 with `heads` 0 | **MU-UNRANGED-THROW-HEAD** (only this assert); MU-THROW-UNHANDLED, MU-HEAD-FIRST also red on PR13 |
| PR15 (+2 asserts) | the empty-object 416 keeps ETag; every opened body is cancelled | **MU-416-NO-ETAG**, **MU-416-NO-RELEASE** (PR4 + PR15) |
| **PR16** | in both modes: `bytes=0-<huge>` → `[{offset:0}]`; `bytes=10-1e20` → `[{offset:10}]`; `bytes=-<huge>` and `bytes=-1e20` → `[{offset:0}]`; all 206 with the clamped Content-Range, CL = body, `heads` 0. The boundary `bytes=10-9007199254741000` still sends `{offset:10,length:9007199254740991}`. A far start → 416 `no-store`, `reads` `[{offset:Infinity}]`, `heads` 1 | MU-UNSAFE-LENGTH, MU-UNSAFE-SUFFIX, MU-UNSAFE-SUFFIX-NULL; red on HEAD |
| **PR17** | in both modes × (`bytes=0-9`, `bytes=500-`), with `changedOnSecondRead`: If-Range `"old"` → 200, ETag `"etag-2"`, 100 bytes, 2 reads; plus If-None-Match `"etag-2"` → 304, ETag `"etag-2"`, no Content-Type/Length/Range/Accept-Ranges, public Cache-Control, 2 reads, every opened body cancelled | MU-REREAD-NO-INM, MU-REREAD-304-NO-RELEASE, MU-THROW-REREAD-NO-INM, **MU-THROW-REREAD-KEEPS-HEAD-ETAG (C-R310-01)**, MU-REREAD-304-CONTENT-TYPE, MU-REFETCH-STALE-ETAG; red on HEAD |
| **PR18** | HEAD + If-None-Match (+ Range) → 304 with ETag, no Content-Type or Content-Length, 1 head, 0 reads | **MU-HEAD-INM-SKIPPED** (only PR18). MU-HEAD-FIRST does **not** turn PR18 red |

PR1–PR12 and PR14 are byte-identical to HEAD. PR9 (cover, proxy only) is unchanged.

### 6.1 Changed contracts
None. **No assert is removed or weakened.** C's SOURCE-SCOPE row checks that the test diff has no `-` line that holds `assert`.

### 6.2 Mutants
These are in `b-round-310/sketch/mutants.py`, and the red rows are in `sketch-mutants.txt`.
- **12 carried from round 310**, with their contexts updated where the block moved. MU-304-NO-RELEASE now targets the first-object 304.
- **13 new:** MU-UNSAFE-LENGTH, MU-UNSAFE-SUFFIX, MU-UNSAFE-SUFFIX-NULL, MU-REREAD-NO-INM, MU-REREAD-304-NO-RELEASE, MU-THROW-REREAD-NO-INM, MU-THROW-REREAD-KEEPS-HEAD-ETAG, MU-REREAD-304-CONTENT-TYPE, MU-HEAD-INM-SKIPPED, MU-UNRANGED-THROW-HEAD, MU-416-NO-ETAG, MU-416-NO-RELEASE and MU-ONE-COPY. MU-ONE-COPY puts the HEAD block into `cloudflare/` only.
- The four added last (MU-HEAD-INM-SKIPPED, MU-UNRANGED-THROW-HEAD, MU-416-NO-ETAG and MU-416-NO-RELEASE) give red-proof to the PR13/PR15/PR18 asserts that pin existing behaviour. B's check found that MU-HEAD-FIRST does not reach PR18.

Red counts on the sketch, in `mutants.py` order: 17/6/7/6/8/12/6/2/4/4/2/2/2/2/2/2/2/2/2/2/2/2/4/4/2. Restored: 75/75.

## 7. A's order of work
1. A-CLAIMS.
2. The helper in `workers/r2-proxy.js`, then the same block in `cloudflare/r2-worker.js`, then A-PARITY and `node --check`.
3. The test file, then A-UNIT, then A-RED-ON-HEAD.
4. A-MUTANTS.
5. Typecheck and lint.
6. Doc 227.
7. `code-reviewer`.
8. Write `a-round-311.md` as you go.

## 8. Neighbouring behaviour at risk (C probes)
- **Every safe range:** PR3, PR10, PR11 and WK-OPS-REGRESSION (seek h0g1, bytes = CL). The guard must not touch them.
- **The 304 on the first object:** PR2 and the revalidate step.
- **The 416:** PR4, PR15, `hugeStart`, and unsatisfiable `no-store`.
- **Protected routes:** PROTECTED-UNCHANGED, PR8, the 40 protected rows and G311-AUTH.
- **`api.proxy.audio.ts`:** it sends no Range and no If-None-Match, so it gets one `get` and a 200. Unchanged.
- **Production:** unchanged until Saba deploys (§11).

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-311.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- a change is needed outside §5 or above the helper line;
- a protected row turns red;
- any assert must be removed;
- a mutant stays green;
- A-PARITY is not empty;
- typecheck fails, or lint has a new finding;
- the reviewer reports a Medium+ outside the grants, or any leak on a protected route.

## 10. Next, and requests (D-29z831)
- **C PASS + gate:** PERF-4e is done. GATE310-M1, GATE310-L3, C-R310-01 and A-R310-REVIEW-L1 close.
- **Next:** REGRESSION if it is due. It falls due on or after **2026-11-05** [K14]. Otherwise **PERF-5** (peaks in a worker), after the performance-optimizer and tech-lead consults, an L37 premise re-measure at the new HEAD, and a ruling on whether the power-of-two pyramid (`oss-adoption.md`) lands in 5a.
- **RETRO** at round 320.
- **For Saba** (unchanged): SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE. Deploying the worker is outside the loop.
- **For root:**
  - **ROOT-REQ-VERIFY-WORKER-TESTS** is re-raised, "with this worker change". Gate 310's review #2 confirms that `r2-proxy.test.mjs` is not in `verify.log` [K10]. This is the third worker round in a row. It is non-blocking, and C's WK-UNIT runs the tests meanwhile.
  - ROOT-REQ-VITEST-PERF-INCLUDE is still open.
  - No new checkpoint request: three are open and non-blocking. R2-WORKER-TWO-COPIES is now a 4× signal, and its dedupe waits for SABA-Q-WORKER-DEPLOYED.

## 11. Commit readiness and deploy
After C PASS and the gate, root publishes the 3 modified paths and the new doc 227. Deploying the Cloudflare Worker stays outside the loop.

Additions to doc 226's post-deploy list, against real R2 (doc 227 lists them):
- `Range: bytes=0-<20+ digits>` and `bytes=-<20+ digits>` → 206 with the whole object, bytes = Content-Length;
- an If-Range mismatch with a matching If-None-Match → 304;
- whether R2 rejects a non-safe-integer range value at all (it no longer reaches R2 for length or suffix).

## 12. Claims (L29 + L56)
`bash b-round-310/claims-311.sh` from the loop root (K1–K22). Outputs:
- `b-round-310/claims-311-head-output.txt` (HEAD);
- `b-round-310/claims-311-sketch-output.txt` (sketch, `CLAIMS_STORE=/tmp/b310s`).

| Tag | Claim | Expected at HEAD |
|---|---|---|
| K1 | gate 310 published `8946431` | `published 8946431` |
| K2 | clean tree, HEAD | `0 8946431` |
| K3 | frozen entries | `1183` |
| K4 | each protected file appears once | `1 1 1 1 1 1 1` |
| K5 | helper start line in `workers/` and `cloudflare/`; file lengths | `198 160 314 276` (sketch `198 160 327 289`) |
| K6 | `R2_BUCKET.head(r2Key)` / `R2_BUCKET.get(r2Key` per copy | `2 4 2 4` (unchanged) |
| K7 | `Number.isSafeInteger` per copy; `etagMatches(request.headers.get('If-None-Match')` per copy | `1 1 2 2` (sketch `3 3 4 4`). At HEAD, the single `isSafeInteger` hit is `validateToken`'s `expiresAt` check above the helper (`workers/` l.156, `cloudflare/` l.138) |
| K8 | `'Image Not Found'`; `'File Not Found: ' + r2Key` per copy; `'Internal Error'` per copy | `1 2 2 1 1` |
| K9 | `node --test workers/r2-proxy.test.mjs` | `# tests 69 # pass 69 # fail 0` (sketch 75/75) |
| K10 | `package.json` has no `node --test workers`; gate-310 `verify.log` mentions of `r2-proxy` | `0 0` |
| K11 | helper parity diff lines | `0` |
| K12 | `onlyIf` per copy; `'no-store'` per copy | `0 0 1 1` |
| K13 | B's probe op counts, HEAD vs sketch | as in the output |
| K14 | last regression date | `2026-11-02` |
| K15 | the round-310 archive equals B's copy | `archive-equal-310` |
| K16 | doc 227 absent; the last doc | `0 226-perf-r2-worker-single-read.md` |
| K17 | sketch mutant lines; restored 75/75; mutants with 0 red | `25 1 0` |
| K18 | every cited `b-round-310/` artifact exists (L56) | `done` |
| K19 | sketch tests red on the HEAD workers | `4` |
| K20 | the R2 doc's `length` and `suffix` lines both say "fewer bytes than this number may be returned" | `2` |
| K21 | RFC 9110: "GET is the only method for which"; "SHOULD send the same header fields in response to a HEAD" | `1 1` |
| K22 | PR6/PR10 HEAD + `Range: 'bytes=0-9'` call sites in the test file | `2` |
