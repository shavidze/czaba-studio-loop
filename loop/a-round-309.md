# A round 309: PERF-4a. R2 worker public routes get ETag→304 and Range→206/416, in both copies

**Status:** implementation complete and handed to C. No STOP.
- **Browser:** `realVerified` is false. A ran no browser probe; the browser rows belong to C.
- **Reviewer Medium:** one reviewer Medium is pre-ruled by task §4.5; see A-REVIEW below.

## Changed files (all within §5 grants)
- `workers/r2-proxy.js`: `handleImage` and `handlePreview` now call the helper; the helper block is appended. This is B's sketch `b-round-308/sketch-r2-proxy.js.txt`, copied byte for byte.
- `cloudflare/r2-worker.js`: `handlePreview` calls the helper; the same helper block is appended. This is `sketch-r2-worker.js.txt`, copied byte for byte.
- `workers/r2-proxy.test.mjs`: inside the existing loop, after the last row and before its closing `}`:
  - the `BYTES` and `ETAG` constants and the `publicRequest` helper (fake R2 `head`/`get`, honours `{offset,length}`, records reads and heads, `missing` option);
  - rows PR1–PR9 (PR9 is `proxy` only). PR8 uses the existing `tokenFor('studio', …)`.
  - `git diff` shows 0 removed lines.
- **New:** `docs/implementation/2026/quarter-IV/225-perf-r2-worker-cache-range.md`.

`git status --short --untracked-files=all` shows exactly those 4 paths: 3 `M` and 1 `??`. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-308-r309-tree-sha256.txt` fails only on the 3 modified paths. No protected file, `app/**`, `package.json` or `biome.json` was touched.

## Acceptance rows (A)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: the output before editing equals `claims-309-head-output.txt` (empty diff) | run before the edit |
| A-UNIT | PASS: `node --test workers/r2-proxy.test.mjs` gives 57 tests, 57 pass, 0 fail in 0.18 s. `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts` gives 2 files and 32/32 in 1.10 s wall time (vitest reports 654 ms) | `a-round-309/unit.log`, `vitest.log` |
| A-MUTANTS | PASS: 8/8 red. Each red set equals B's `sketch-mutants.txt` exactly. Each restored copy is green 57/57 | `a-round-309/mutants.json`, `<MU>.log`, `<MU>-restored.log`, `<MU>.patch.txt`, script `mutants.mjs.txt`; scratch `/tmp/a309` |
| A-PARITY | PASS: the `diff <(sed …workers…) <(sed …cloudflare…)` output is empty | — |
| A-TYPE/LINT | PASS: `npm run typecheck` rc 0 (13.6 s). `npm run lint` rc 0 with 205 warnings and 1 info, the same as gate 308's count; 0 lines mention `workers/` or `cloudflare/`. `node --check` is OK on both workers | `a-round-309/typecheck.log`, `lint.log` |
| A-REVIEW | Ran (`code-reviewer`, 4 paths, with the security asks). 0 Critical/High, 1 Medium (pre-ruled), 9 Low. No code change after the review | below |
| A-DOC | PASS by self-check: l.4 is exactly `**სტატუსი:** Completed (C round 309 PASS)`; the 7 TEMPLATE `## ` headings appear in order (empty diff); each of PR1–PR9 is found once in the test file; all 6 cited probe files exist | — |

### Mutant table (A's run)
| Mutant | Red rows |
|---|---|
| MU-NO-INM | proxy and alternate PR2, proxy PR9 (3) |
| MU-RANGE-200 | PR3, PR4, PR5, PR6 in both copies (8) |
| MU-416-PASS | PR4 in both copies (2) |
| MU-IFRANGE-IGNORED | PR5 in both copies (2) |
| MU-HEAD-READS | PR6 in both copies (2) |
| MU-NO-EXPOSE | PR1 in both copies (2) |
| MU-STUDIO-CONDITIONAL | PR8 plus the existing rows "Studio allows only signed files", "denies token reuse at studio/mall/standart.zip", "recording token opens only its signed recording" and "supports UTF-8 resource names", in both copies (10) |
| MU-ONE-COPY | alternate PR1–PR6 (6) |

### PROTECTED-UNCHANGED (A's own pre-check)
With awk extraction on `git show HEAD:<file>` and on the working file, these are byte-identical in both workers:
- `handleProtected`;
- `isSafeFileName`;
- `validateToken`;
- `getContentType`;
- the `export default {…};` router.

### Claims after the change (`a-round-309/claims-after.txt`)
Compared with the HEAD output, only these differ:
- K2 `4 738df73`;
- K5 `66/73/83 | 57/66`;
- K6 `0 0 0 1 1`;
- K7 `6 3 4`;
- K8 `69 2 2`;
- K9 `# tests 57 # pass 57 # fail 0`;
- K17 `1 225-perf-r2-worker-cache-range.md`.

These are exactly the values §3.2 expects. K5–K8 equal the sketch output. Every other K equals HEAD.

## code-reviewer findings (score 8/10)
- **Medium #1. head→get race: `get` has no `onlyIf`** (`r2-proxy.js` lines 246 and 252, `r2-worker.js` lines 208 and 214).
  - **Pre-ruled by task §4.5:** recorded, not fixed. A changed nothing. Changing it would also alter K5/K7 and B's mutant baseline.
  - **B:** reconfirm the ruling, or open a bounded follow-up. The reviewer's Alternative B is `onlyIf: { etagMatches: meta.etag }` on both `get`s, plus handling of a failed precondition (the object then has no `body`; `!part` alone would send an empty 206 with a non-zero `Content-Length`).
  - Doc 225 already records the race.
- **Lows** (for B; no code change, because each is ruled by the contract or is outside this round):
  - #2 A 416 inherits `public, max-age=86400`, so it is storable. This is a contract choice (§4.2 step 2). Adding `no-store` would change K6.
  - #3 The `Bytes=` unit is case-sensitive, so it gets a 200. Ignoring Range is allowed (§0.5).
  - #4 `If-None-Match: *` with no `httpEtag` gives a 200. §4.2 sets ETag only when it is present; R2 always supplies one.
  - #5 A size-0 suffix range gives a 416, and no row tests it.
  - #6 Test gaps, offered as candidate rows for B (A added none, because §6 fixes the row set and the mutant baseline):
    - 403 + If-None-Match;
    - `/download/`, `/recordings/` and `/originals/` with If-None-Match;
    - size 0, `Bytes=` and whitespace;
    - `get` returning null after `head`;
    - the headers on 416 and 304;
    - the cover Range body length and absent `Accept-Ranges`.
  - #7 Doc 225 cites `tmp/` evidence outside the repo. This is the same signal as GATE308-L1, which is already in `deferred_low_polish`. The reviewer could not verify "byte-identical to HEAD"; A's awk check above proves it.
  - #8 `Access-Control-Allow-Headers` lacks If-None-Match/If-Range. Ruled frozen by §4.4.
  - #9 Pre-existing, outside the diff: `handlePreview` has no `isSafeFileName`, and the 404 body echoes the R2 key. Candidate for B.
  - Deploy-time check, for B or the doc's post-deploy list: whether workerd keeps a script-set `Content-Length` on a HEAD `new Response(null)`. A did not edit the doc after the review.

## Architecture note (for B)
The helper block is duplicated in `workers/r2-proxy.js` and `cloudflare/r2-worker.js`, and only a manual diff (A-PARITY) keeps them equal, so every worker change costs double.
- **Decision:** keep both until SABA-Q-WORKER-DEPLOYED is answered.
- **Then:** one bounded task removes the copy that is not deployed and reduces the test loop to one worker.

## Known gaps
- No browser evidence from A: WK-BROWSER-PROXY, WK-BROWSER-ALT, WK-HEAD-CONTROL and G309-AUTH are C's rows.
- Safari 206 and the deployed worker cannot be measured here (doc 225 TODO).
- WK-STORE-PREVIEW-LIVE is not runnable here.
- Full vitest, build, `npm run verify` and the e2e smoke were not run by A; they are gate rows.

## Exact next C checks
1. **WK-BROWSER-PROXY:** copy `b-round-308/probe/worker-server.mjs` and `browser-probe.cjs` to `c-round-309/`. Run them on `<store>/workers/r2-proxy.js` and judge the result from the server log.
2. **WK-BROWSER-ALT:** the same on `<store>/cloudflare/r2-worker.js`. `coverTwice` is expected to be 404/404.
3. **WK-HEAD-CONTROL:** run on `git show HEAD:workers/r2-proxy.js`.
4. **G309-AUTH:** both viewports.
5. **WK-UNIT:** 57/57, plus the 2 vitest files.
6. **PROTECTED-UNCHANGED:** awk extraction versus HEAD.
7. **SOURCE-SCOPE:** `git status`, `sha256sum -c`, and only added lines in the test diff.
8. **CLAIMS:** re-run `claims-309.sh` and compare with `a-round-309/claims-after.txt`.
9. **TESTS-READ:** use the A mutant logs above.
10. **DOC:** check doc 225's l.4, its headings and the rows it cites.

## Scope completed
Every A row in §3.1 was run as reported above. The PERF-4a code, the tests and the doc are in the tree. PERF-4a is not done until C PASS and the gate. The backlog is not marked complete.
