# Round 414: SYS-R2-FAKE-FIDELITY — the R2 fake in the worker tests behaves like R2 (test-only; closes C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS)

**Planned by:** B, at the round 413 → 414 planning, 2026-11-08 (`b-round-413.md`). The advisor was used after orientation. The round-413 task is archived as `tasks/round-413.md` [K16].

## Read first
- `lessons.md` in full. The most relevant here are L4, L10, L11, L23, L26, L28, L29, L30, L56, L57, L58 and L59.
- This file. For the worker contract the tests pin, see `tasks/round-311.md` §0.2–§0.4 (R2 facts: documented versus inferred) and §4. Nothing there changes.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `SECURITY_AUDIT.md`, `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** run `bash b-round-413/claims-414.sh` (`ROOT=` and `LOOP=` can be overridden).
  - **Planning output** on the real store: `b-round-413/claims-414-planning-output.txt`, with empty stderr.
  - **Sketch output** on B's scratch with the sketch committed: `b-round-413/claims-414-sketch-output.txt`, with empty stderr.
  - **Expected differences** between the two: `b-round-413/claims-414-planning-vs-sketch.diff`. K1 differs because the scratch has its own commit, and K5 differs because the patch is already in.

## Baseline: HEAD `dc536a6`, clean tree
- **Gate 413** published `dc536a6` to both remotes [K13]. HEAD is `dc536a6…` [K1]. The tree is clean: K2 `total 0`.
- **Frozen:** `b-round-413/r414-frozen-sha256.txt` lists **1,312** entries: every tracked file except the test file. `sha256sum -c` gives rc 0 [K3]. **Both workers are frozen:** `workers/r2-proxy.js` and `cloudflare/r2-worker.js`.
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Pending root work:** none. If K1 at A1 is not `dc536a6`, A re-runs the claims. A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 413 passed.** C round 413 PASS with `browserVerified` true and 0 bugs [K14], and gate 413 published. **PERF-15 is done on the client** (D-29z1437). TLM-PERF15-FIREFOX stays a `record` item, deadline RETRO 416.
- **Next in the recorded order: SYS-R2-FAKE-FIDELITY.** It is one systemic, test-only task with one root cause: the R2 fake in `workers/r2-proxy.test.mjs` is more lenient than R2, so branch-specific mutants survive (D-29z886).
- **SYS-R388 runs separately, in round 415** (D-29z1438). It is the fake Web Audio helper, a different fake in different files.
- **Open Criticals and Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION-2026-11-10 is not due yet [K15]. RETRO comes at round 416.
- **The worker tests are not in the gate.** `npm run verify` has 0 `r2-proxy` hits [K10b], so `node --test workers/r2-proxy.test.mjs` never runs at publish.
  - A and C run it as named rows.
  - ROOT-REQ-VERIFY-WORKER-TESTS is re-raised (non-blocking).
- **Biome does not see this file.** `biome.json` includes `app/**` only [K10b] (L30). `npx biome check workers/` checks nothing and is not cited. The checks are `node --check` and the project style rules.

## 1. Rulings (B)

### D-29z1439: what is and is not "like R2"
**Documented** in the R2 Workers API reference (the copy at `b-round-310/r2-workers-api-reference-2026-11-03.md.txt`, re-fetched 2026-11-08 with the same content):
- `httpEtag` is declared as `string` and is **not** marked optional (l.147). By contrast, `range` is marked optional (l.155) [K9].
- The page says nothing about an offset at or beyond the size, or about a value that is not a safe integer.

**Ruling 1: two equivalent mutants; no non-R2 fake object.**
- C-R311-01's first mutant drops the re-read `else headers.delete('ETag')`. Killing it needs an R2 object without `httpEtag`, which R2 does not return.
- A-R309 #4 (`If-None-Match: *` with no `httpEtag`) needs the same kind of object.
- Both are **equivalent against R2** and close by this ruling. The fake does not gain an object without `httpEtag`. The branches stay in the workers, which are frozen and unchanged.

**Ruling 2: two self-consistent R2 models (GATE311-L1).** The fake's `TypeError` for a value that is not a safe integer now fires only in `outOfRange: 'throw'` mode.
- `throw` models a strict R2: it rejects unsafe values and offsets past the end.
- `short` models a lenient R2: it clamps.
- Both models are **inferences, not documentation**. Neither the doc nor the test names write "R2 does X" about them.
- **Effect:** PR16's far case (`bytes=<400 nines>-`, sent as `{ offset: Infinity }`) now takes the lenient path in `short` mode: 0 heads, one body opened and cancelled, and a 416 from `resolveRangeSpec`.

**Ruling 3: the version switch.**
- The fake gets two new options: `headSeesNewVersion` (the `head` already sees `etag-2`) and `goneOnSecondRead` (the second `get` returns null).
- The other order, where the `head` sees `etag-1` and the re-read `get` sees `etag-2`, stays covered by PR17 (throw mode, `bytes=500-`).

**Ruling 4: `Bytes=` is not pinned.**
- RFC 9110 §14.1 says range-unit names are case-insensitive (l.6326). §14.2 says a server MAY ignore Range (l.6476) [K9b].
- Today `Bytes=0-9` gets a full 200. That is allowed but is not the preferred behaviour, so no test pins it.
- It is recorded as the Low **B-R414-RANGE-UNIT-CASE**, for a later worker round.

**Ruling 5: HEAD with Range is a recorded Low.**
- PR6 pins HEAD + `Range` → 206 [K8]. RFC 9110 §14.2 says a server MUST ignore Range for methods other than GET (l.6481–6484) [K9b].
- This is pre-existing (the round-309 contract), and the purchased routes are not affected.
- It is recorded as **B-R414-HEAD-RANGE-206**. It does not change in this test-only round, and PR6 stays as it is.

**Ruling 6:** MU-414-RANGE-NO-TRIM is equivalent, because fetch `Headers` already trims values. PR22's padded case still pins the result the client sees.

### D-29z1439: the change (sketch v2, `b-round-413/sketch-414.patch.txt`, sha256 `5279fce53efec300…` [K12])
**A applies the sketch byte-for-byte.** It changes only `workers/r2-proxy.test.mjs` [K5]. The facts about HEAD are [K7], [K7b] and [K8].

1. **The `publicRequest` fake.**
   - **Today:** the `head` always returns `etag-1`, and the `TypeError` fires in any mode [K7].
   - **New:** the options `headSeesNewVersion`, `goneOnHead` and `goneOnSecondRead`, and the `TypeError` fires in `throw` mode only.
1b. **The protected `request` fake** (v2, `tech-lead` Medium on v1). Today its objects have no `httpEtag` [K7c], which ruling 1 says is not R2-like. A copy of the public 304 logic into `handleProtected` would then survive PR21. In v2 its objects carry `etag` and `httpEtag` `"etag-1"`. The 40 protected rows keep every assertion and stay green.
2. **Strengthened rows.** No assertion is removed (L4).
   - **PR9:** the cover with a `Range` gives the full body (100 bytes), no `Content-Range`, no `Accept-Ranges`, and a `get` without a range.
   - **PR14:** `fresh.opened.length` is 0 in throw mode and 1 in short mode. `stale.opened` is `[false]` in throw mode and `[true, false]` in short mode. This closes A-R311-REVIEW-L4's vacuity for PR14.
   - **PR15:** `opened.length` is 0 in throw mode and 1 in short mode (A-R311-REVIEW-L4).
   - **PR16 far:** heads are 1 in throw mode and 0 in short mode. `opened` is `[]` in throw mode and `[true]` in short mode (GATE311-L1). Today the row asserts `far.heads.length, 1` in both modes [K7b].
   - **PR17:** `served.heads` is checked per mode. The re-read 304 carries `Access-Control-Allow-Origin: *` and the public `Access-Control-Expose-Headers` (C-R311-01, second mutant). Today it has neither assert [K7b].
3. **New rows.** Each runs on both workers.
   - **PR19, the head already sees the new version:**
     - With If-None-Match `"etag-2"`, the answer is a 304 from one `get` and one `head`, with no body opened.
     - With If-Range `"etag-1"` and no If-None-Match, the answer is the full 200 with ETag `"etag-2"`.
   - **PR20, the object is deleted before the If-Range re-read, or before the head of the throw path:** every case gives the preview 404 text.
     - Re-read deleted: the throw path has 1 head and no body; the short path cancels its first body.
     - Head deleted (`goneOnHead`): 1 read, 1 head, no body.
   - **PR21, the protected routes ignore If-None-Match.** On `download`, `recordings` and `originals`, with both `*` and the ETag:
     - a granted file is a full private 200, with no ETag and one read;
     - a denied path (another handle) is a 403 with 0 reads;
     - a missing object is a 404.
   - **PR22:** a padded `Range` reaches the worker already trimmed by fetch `Headers` and gets the 206 (`bytes 0-9/100`). `bytes = 0-9` is ignored: a full 200, with a `get` without a range. The row does not claim to test the worker's own `.trim()` (ruling 6).
4. **Unchanged:** the assertions of the 40 protected rows [K8c] (l.32–134 of the test file are byte-identical to HEAD: K7e is 0 on the sketch; C re-runs it at row 8 against `dc536a6`), `tokenFor`, PR1–PR8, PR10–PR13 and PR18 [K7b].
5. **Review:** `tech-lead` rejected v1 with one Medium (1b above). v2 fixes it and adds the mutants it asked for. The delta re-review is in `b-round-413/sketch-review.md`.
6. **A pointer, not a task:** `r2RangeOf` passes an unsafe start through unchecked. This is the round-311 §4.1 contract (A-R311-REVIEW-L1); R2's answer to it is unknown, and the worker answers 416 on both paths.

### Rulings on the open Lows
| Id | Ruling |
|---|---|
| C-R311-01 | Mutant 2 (CORS on the re-read 304) is killed by PR17 (MU-414-REREAD-304-NO-CORS and MU-414-CATCH-REREAD-304-NO-CORS). Mutant 1 is equivalent against R2 (ruling 1). Closes on C PASS |
| A-R311-REVIEW-L4 | PR14 and PR15 assert `opened.length` per mode. Closes on C PASS |
| GATE311-L1 | Ruling 2, plus PR16's far case per mode. Closes on C PASS |
| A-R309-REVIEW-TEST-GAPS | Closes on C PASS: 403/404 with If-None-Match → PR21; whitespace → PR22; "get null after head" → PR20; version switch → PR19 (and PR17); cover body and Accept-Ranges → PR9; `If-None-Match *` without `httpEtag` → ruling 1; `Bytes=` → ruling 4. The 416 and 304 headers are already in PR2, PR4 and PR15 |

### Reference and product design
- **Reference-first: N/A.** This is a test-only round on a server worker, with no user-visible change; policy gives test-only rounds no reference section.
- **`product-designer`:** N/A.
- **No screen change:** no file under `app/` changes [K5].

### Ruling lines (L4)
- **Patch vs reviewer style:** "apply the sketch byte-for-byte" wins over any style preference of A's reviewer. A Medium+ in the sketch logic is a STOP (L11), not an edit.
- **Workers:** both worker files are frozen. A fidelity row that is red against the real worker is a STOP for a B ruling. The row is never weakened to make it green.
- **`request` fake vs "40 protected rows unchanged":** the fake gains `etag`/`httpEtag` (1b); the rows' assertions stay byte-identical. The fake change wins over "unchanged helper".

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| PR16's far case in `short` mode no longer takes the throw path | Intended (GATE311-L1) | PR16, MU-414-SHORT-416-NO-RELEASE |
| A test-only change could hide a worker regression | Must not happen: the workers are frozen | K3; rows 1 and 8 |
| Worker behaviour in a real browser | Unchanged, because the worker is unchanged | Row 5 equals `b-round-413/probe/head-summary.txt` |

## 2. What A changes
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-413/sketch-414.patch.txt`, then `git apply` the same file. **Do not edit the test file afterwards.**
3. **Doc:** write the new `docs/implementation/2026/quarter-IV/266-sys-r2-fake-fidelity.md`. 266 is the next free number [K6]. Write it in Georgian with English technical terms:
   - l.4 is exactly `**სტატუსი:** Completed (C round 414 PASS)` (L28);
   - it has TEMPLATE's 7 `## ` headings in order (L26);
   - its content is the documented-versus-inferred split, rulings 1–6 above, the fake options, and the rows PR9, PR14–PR17 and PR19–PR22;
   - its mutant block is the 14 `MU-414-` lines of `b-round-413/mutants/summary.txt`, copied byte for byte;
   - it cites only rows and files that exist.
4. **Checks and report:** run the §4 checks. Write `a-round-414.md` as you go. It holds:
   - the changed files;
   - each check, with its rc and log path;
   - the reviewer's findings;
   - a For B section, including any Architecture note.

## 3. Grants (`b-round-413/grants-414.txt`, 2 paths)
- `workers/r2-proxy.test.mjs` (the sketch only).
- `docs/implementation/2026/quarter-IV/266-sys-r2-fake-fidelity.md` (new, whole).
- **Nothing else:** no worker, protected, auth, route, component, config, package or `public/` file.
- **At the end,** `git status --short --untracked-files=all` shows 1 ` M` line and 1 `??` line.

## 4. A's checks
The full suite and verify belong to the gate (speed rules).

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-413/claims-414.sh` at start | Equals `claims-414-planning-output.txt`; stderr empty |
| A2 | `node --check workers/r2-proxy.test.mjs`, then `node --test workers/r2-proxy.test.mjs` | rc 0; **83 tests, 83 pass, 0 fail** (HEAD: 75). Report the duration (B's run: about 0.2 s) |
| A3 | `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts` | Unchanged: 2 files, **32/32** |
| A4 | `npm run typecheck`; `npm run lint` | rc 0 each. Lint has no new finding (round 413: 205 warnings and 1 info, repo-wide). No `app/` file changes, so these are no-change controls |
| A5 | Style self-check on the test diff (Biome does not cover `workers/`, L30) | Every new statement ends with `;`, there are no new comments, and there are no loose-typing escapes. Report it as a self-check, not a tool PASS |
| A6 | Claims at end | Equal to `claims-414-sketch-output.txt` on K7, K7b, K7c and K10, so the only differences from the planning output are in `claims-414-planning-vs-sketch.diff` plus K2 (`1 ?? 1 M total 2`), K5 (`no`, because the patch is applied) and K6 (doc 266 l.4). K3 stays 1,312 rc 0, K4 rc 0, K2b 0 and K8b 0 |
| A7 | `code-reviewer` on the test diff and doc 266 | No Critical, High or Medium in the sketch logic; a Medium+ there is a STOP (L11). Findings already ruled in `b-round-413/sketch-review.md` are not new. Doc findings are fixed in the doc |

## 5. C's acceptance (full run)
**Before hand-off:**
- Write `c-round-414.json` with **all L57 fields**, including:
  - `mutantRedOnSketch` = `b-round-413/mutants/summary.txt`, and `mutantRedOnTree`;
  - `gateChecksNamed`;
  - `gateChecksRunOnSketch` = "none: the gate does not run the worker tests (K10b, ROOT-REQ-VERIFY-WORKER-TESTS); `node --test` 83/83 is C's row 3";
  - `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`.
- Run `python3 -I tools/l57-check.py c-round-414.json c-round-414/l57-check.txt`.

**Order (L59):** row 4 (mutants), then rows 5 and 6 (browser), then the rest. Write `c-round-414/progress.json` after every row. Never run tests while a browser probe runs (L38). Warm `/studio-lab` in a browser first.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the A6 expectation. Status is the 2 granted paths. Frozen 1,312 rc 0, both workers included; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply `b-round-413/sketch-414.patch.txt` to a `git archive HEAD` scratch, then `cmp` its test file against the working tree: identical |
| 3 | **WK-UNIT** | `node --test workers/r2-proxy.test.mjs`: 83/83. The two vitest files from A3: 32/32. This is C's own row, not a gate row |
| 4 | **MUTANTS** | Make a committed scratch copy of the working tree at `/tmp/c414-scratch` (`git init && git add -A && git commit`). Run `S=/tmp/c414-scratch OUT=<loop>/c-round-414/mutants STORE=<store> python3 -I b-round-413/mutants/run.py`; the runner takes the HEAD test file from `STORE`'s `HEAD`. **Pass = equal to B's `summary.txt`:** 13 mutants SKETCH RED, each with `expected-row-red True`; MU-414-RANGE-NO-TRIM SKETCH GREEN (equivalent, ruling 6); 11 mutants HEAD-TESTS GREEN(survives) plus NO-TRIM, and MU-414-SHORT-416-NO-RELEASE and MU-414-CATCH-META-ETAG-DROPPED HEAD-TESTS RED; 4 PRISTINE lines rc 0 with `failed []` (83 and 75 tests); `SCRATCH-STATUS 0 lines`. Never use another `OUT` |
| 5 | **WK-BROWSER** (real Chromium, the unchanged workers) | **Setup:** copy `b-round-413/probe/worker-server.mjs`, `browser-probe.cjs` and `summarize-414.py` into `c-round-414/`. **Runs:** for each of `workers/r2-proxy.js` and `cloudflare/r2-worker.js`, and each of `R2_OOB=throw` and `R2_OOB=short` (with `R2_STRICT=1`):<br>1. `node worker-server.mjs <worker> <port> <log>`<br>2. `node browser-probe.cjs http://127.0.0.1:<port> <log> <out>.json 1440x900`<br>3. summarize.<br>**Pass:** every proxy step equals `b-round-413/probe/head-summary.txt` [K17]. The alt worker equals the proxy, except `coverTwice`, which exists only on the proxy (the alt worker has no cover route [K8c]).<br>**Viewport:** network behaviour does not depend on the viewport, so this row runs once at 1440×900. This is stated here and is not a skipped viewport |
| 6 | **AUTH** (browser, fresh context, no credentials, **1440×900 and 1280×720**) | **Setup:** copy `c-round-413/auth-probe.mjs` into `c-round-414/` and parametrise the viewport and the output paths.<br>**Pass:**<br>- demo `/studio-lab` opens with `auth_user` null and no "Sign in required";<br>- `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`;<br>- `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401.<br>**BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | **Doc 266:**<br>- l.4 is byte-exact `**სტატუსი:** Completed (C round 414 PASS)`;<br>- it has the 7 TEMPLATE headings in order (L26);<br>- its `MU-414-` lines equal the 14 in `b-round-413/mutants/summary.txt`;<br>- it states rulings 1–6, with "inference" on ruling 2;<br>- every row id it cites exists in the test file.<br>**Sweeps:** `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0; `grep -rln 'In Progress (stage' docs/implementation \| wc -l` gives 7. **No other doc** differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims, `diff` of both worker files against `git show HEAD:` is empty, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). The gate does not run the worker tests (K10b) |

**Retries (rows 5 and 6):** a first-load timeout on a cold server, or a port in use, is an environment problem (L38). Retry at most twice; it is never a FAIL.

**Neighbouring behaviour that could break:**
- **Purchased-route tests (the 40 protected rows):** they are unchanged in the sketch and run in row 3.
- **The token and download routes:** the two vitest files in row 3.
- **Real worker behaviour:** row 5, on the frozen workers.

## 6. For C: the mutants
The runner is `b-round-413/mutants/run.py`. Each mutant is applied to both workers unless noted.

| Mutant | Site | Expected red (sketch) | HEAD tests |
|---|---|---|---|
| MU-414-REREAD-304-NO-CORS | main-path re-read 304 without CORS headers | PR17 | survives |
| MU-414-CATCH-REREAD-304-NO-CORS | throw-path re-read 304 without CORS headers | PR17 | survives |
| MU-414-PROTECTED-INM-304 | a protected non-studio route answers If-None-Match with 304 | PR21 | survives |
| MU-414-REREAD-NULL-UNGUARDED | main-path re-read `if (!object) return null;` removed | PR20 | survives |
| MU-414-CATCH-REREAD-NULL-UNGUARDED | throw-path re-read null guard removed | PR20 | survives |
| MU-414-CATCH-IFRANGE-FIRST-ETAG | the throw path compares If-Range with the first version, not the head's | PR19 | survives |
| MU-414-COVER-ACCEPT-RANGES (proxy only) | `Accept-Ranges` set without `allowRange` | PR9 | survives |
| MU-414-SHORT-416-NO-RELEASE | the unsatisfiable main path does not release the body | PR16 (also PR4, PR15) | red (PR4, PR15) |
| MU-414-RANGE-OWS-ACCEPTED | the range regex accepts spaces around `=` | PR22 | survives |
| MU-414-PROTECTED-ETAG-304 | the public `etagMatches` 304 copied into `handleProtected` for non-studio routes (needs the 1b fake) | PR21 | survives |
| MU-414-PROTECTED-INM-BEFORE-SCOPE | an out-of-scope request with If-None-Match gets 304 instead of the 403 (scope check vs 304 order) | PR21 (denied rows) | survives |
| MU-414-CATCH-HEAD-NULL-UNGUARDED | throw path `if (!meta) return null;` removed | PR20 (`goneOnHead`) | survives |
| MU-414-CATCH-META-ETAG-DROPPED | throw path no longer sets the head's ETag | PR19 (also PR4, PR15) | red (PR4, PR15) |
| MU-414-RANGE-NO-TRIM | `.trim()` removed | none: equivalent (ruling 6) | survives |
