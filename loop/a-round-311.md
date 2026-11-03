# A round 311 — PERF-4e: R2 worker safe-integer Range guard + If-None-Match after the If-Range re-read

**Status:** implementation complete; awaiting C. No STOP condition was hit.
**Tree:** HEAD `8946431` + 3 modified paths + 1 new doc. No commit/push.

## Changed files (all within §5 grants)
1. `workers/r2-proxy.js`: only the helper block, from `const PUBLIC_EXPOSE_HEADERS` to the end. It is byte-identical to `b-round-310/sketch/sketch-r2-proxy.js.txt` (`cmp` equal).
2. `cloudflare/r2-worker.js`: the same block. It is byte-identical to `sketch-r2-worker.js.txt` (`cmp` equal).
3. `workers/r2-proxy.test.mjs`: byte-identical to `sketch-r2-proxy.test.mjs.txt`. Its diff from HEAD matches `sketch-r2-proxy.test.patch.txt`.
4. New: `docs/implementation/2026/quarter-IV/227-perf-r2-worker-range-guard.md`.

The code equals B's sketch exactly, so no deviation reason is needed. Docs 225 and 226, `package.json`, `biome.json`, `app/**` and the protected files are untouched.

## A rows (actually run)
| Row | Result |
|---|---|
| A-CLAIMS | Before editing, `bash b-round-310/claims-311.sh` matched `claims-311-head-output.txt` exactly (`a-round-311/claims-before.txt`). |
| Edit | The block was spliced into both workers (HEAD text above the line plus `helper-block.js.txt`). Everything above `const PUBLIC_EXPOSE_HEADERS` is byte-identical to HEAD in both files (the PROTECTED-UNCHANGED diff is empty for both). |
| A-PARITY | The diff is empty. |
| node --check | OK on both workers and on the test file. |
| A-UNIT | `node --test workers/r2-proxy.test.mjs`: 75 tests, 75 pass, 0 fail (duration_ms 265, wall 0.30 s; `a-round-311/unit-node.txt`). `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts`: 2 files, 32/32 (936 ms; `unit-vitest.txt`). |
| A-RED-ON-HEAD | Scratch run in `/tmp/a311-head`, with the HEAD workers from `git show` and the final test file: 71 pass, 4 fail. The failures are PR16 and PR17, in both the proxy and the alternate copy. They are identical to `sketch-tests-on-head.txt` (`a-round-311/tests-on-head.txt`, full log in `tests-on-head-full.txt`). |
| A-MUTANTS | Ran `python3 -I b-round-310/sketch/mutants.py /tmp/a311-mut a-round-311/mutant-logs b-round-310/sketch/head-helper-block.js.txt` on scratch, never in `store/`. All 25 mutants are red. The counts are 17/6/7/6/8/12/6/2/4/4/2/2/2/2/2/2/2/2/2/2/2/2/4/4/2. After restore: 75 pass, 0 fail. The red rows per mutant, rebuilt from the logs into `a-round-311/mutants-rows.txt`, are **byte-identical** to `sketch-mutants.txt`. Logs and `.patch.txt` files are in `a-round-311/mutant-logs/` (24 patches, because MU-ONE-COPY writes no patch, plus 25 logs). The script's own output, counts only, is in `mutants.txt`. |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint` rc 0: 205 warnings + 1 info, the same as round 310 (`typecheck.txt`, `lint.txt`). |
| A-DOC | Doc 227 is written. It is in Georgian with English technical terms, has the 7 TEMPLATE headings in order, and line 4 is exactly `**სტატუსი:** Completed (C round 311 PASS)`. It contains §0.1–§0.4 (the documented-vs-inferred split, verbatim), the §4 contract, the rows and mutants, and the §11 post-deploy additions. |
| A-REVIEW | Done; see below. |

**Claims after the change** (`a-round-311/claims-after.txt`):
- K2 `4 8946431`
- K5 `198 160 327 289`
- K7 `3 3 4 4`
- K9 `# tests 75 # pass 75 # fail 0`
- K10 `0 0`
- K16 `1 227-perf-r2-worker-range-guard.md`

Every other K equals the HEAD output, including K6 `2 4 2 4`, K11 `0` and K12 `0 0 1 1`. Compared with `claims-311-sketch-output.txt`, the only differences are K2, K10 and K16, which are empty in the sketch run (expected per §3.2).

**SOURCE-SCOPE:** `git status --short --untracked-files=all` shows the 3 modified files (M) and the new doc 227 (??). `sha256sum -c --quiet` against `b-round-310-r311-tree-sha256.txt` fails only on those 3 paths.

**Note for C's "no `-` line holds `assert`" check.** The test diff has one `-` line containing `assert`. It is in PR13: `assert.equal((await publicRequest('preview/mall/a.wav', { failGet: true })).response.status, 500);`. It is replaced in place by `const whole = …; assert.equal(whole.response.status, 500); assert.equal(whole.heads.length, 0);`. The assert is the same and one assert is added; nothing is weakened. This comes from B's sketch patch. The only other `-` line is the PR15 destructuring line, which adds `opened` and holds no assert.

## Code review (code-reviewer subagent, actually invoked)
**Verdict:** 8.5/10, no Critical, High or Medium. Its answers on the requested points:
- Safe values: unchanged, apart from the Info item below.
- 304 headers after a re-read: correct.
- ETag after a re-read: correct, and deleted when the second object has none.
- Bodies: every opened body is released, with no leak.
- HEAD: unchanged.
- Protected routes: they cannot reach the changed helpers. `servePublicObject` is called only from image and preview.

The reviewer had no shell, so it could not check parity or that the code above the line is unchanged. I checked both by command (see the A rows above).

Findings and handling:
- **Low A-R311-REVIEW-L1, fixed in doc 227.** The doc said R2 gets only safe-integer values. In fact the guard covers only `length` and `suffix`, and an unsafe start still reaches R2 and ends as a 416, for example `bytes=9007199254740993-9007199254740995` → `{offset:9007199254740992,length:5}`. The doc wording is corrected. The code is unchanged; this matches §4.1, where an unsafe start is accepted as is.
- **Info A-R311-REVIEW-I1, now in the doc.** `bytes=0-9007199254740991` has safe bounds but length 2^53, so it now sends `{offset:0}`. The response is the same, because Content-Range comes from `object.size`.
- **Low A-R311-REVIEW-L2, test gap, for B.** PR17 does not assert `Access-Control-Allow-Origin` or Expose-Headers on the re-read 304 (PR2 does for the first-object 304).
- **Low A-R311-REVIEW-L3, test gap, for B.** The fake always returns `httpEtag`, so neither `else headers.delete('ETag')` branch is covered, and a mutant that drops one would survive.
- **Low A-R311-REVIEW-L4, for B.** The new PR15 assert `opened.every(o => o.cancelled)` is vacuous in `throw` mode (no body is opened) and meaningful only in `short` mode. Doc 227 now says this.
- **Info.** The Mermaid diagram leaves out two minor branches (the 416 under "If-Range holds" and the head 304 after a throw). Not changed.

I left L2, L3 and L4 unfixed on purpose. §6 pins the test file to B's sketch, and the mutant and claims evidence is tied to it. Adding rows would go beyond the specified rows, so they go to B as candidates for `deferred_low_polish` or the next worker round.

**Re-review (L11: changes after review go back to the reviewer).** The two post-review doc edits were sent back to `code-reviewer`. Score 9/10. It confirmed:
- every claim in the two edits is accurate against the code;
- line 4 and the 7 headings are intact.

Its only point was Info: "always 416" overstated the case, because a request with a matching If-None-Match still gets 304 and an If-Range mismatch still gets 200. I narrowed the wording to "unconditional request". That was a one-phrase doc change using the reviewer's own suggested wording; no code changed after the review.

**Primitives.** `.claude/primitives-map.json` maps nothing to `workers/**` or `cloudflare/**`. `docs/**` maps to `GEORGIAN_DOCS.md`, which I read. The worker and test edits are byte copies of B's sketch, written by shell splice.

**Lessons read:** L11, L23, L26, L28, L29, L30, L38, L52 and L56. None changes the report format for A. Per L30, Biome ignores `workers/` and `cloudflare/`, so I ran `node --check` on both. Per L26, every PR row cited in doc 227 exists in the test file.

**Architecture note for B (not acted on):** the helper block exists in two identical copies (`workers/r2-proxy.js:198-327` and `cloudflare/r2-worker.js:160-289`). The reviewer says to keep this for now; extracting one shared module is the existing R2-WORKER-TWO-COPIES item and waits for SABA-Q-WORKER-DEPLOYED.

## Known gaps / not done by A
- No browser rows were run by A. WK-GUARD-PROXY, WK-GUARD-ALT, WK-OPS-REGRESSION, WK-HEAD-CONTROL and G311-AUTH belong to C. The code is byte-identical to the sketch that B's probe measured.
- WK-STORE-PREVIEW-LIVE (deployed worker and real R2) cannot run here.
- That R2 rejects non-safe values is still an inference; the post-deploy list in doc 227 covers it.
- The full suite, build and verify are left to the gate.

## Exact next C checks
1. WK-GUARD-PROXY and WK-GUARD-ALT: `R2_STRICT=1 R2_SWAP=1`, with `R2_OOB=throw` and with `short`, using `browser-probe-311.cjs` and `swap-etag.txt` as argument 5, at 1440×900. Expected: `hugeEnd`/`hugeSuffix` 206 h0g1 `[{offset:0}]`; `hugeEnd20` `[{offset:10}]`; `hugeStart` 416 no-store h1g1; `rereadInm`/`rereadFarInm` 304 with the swap ETag and no Content-Type (in throw mode `rereadFarInm` is h1g2c1).
2. WK-OPS-REGRESSION with `b-round-309/probe/browser-probe.cjs`, throw and short.
3. WK-HEAD-CONTROL on `git show HEAD:workers/r2-proxy.js` saved as `.mjs`: `hugeEnd`/`hugeSuffix` 500 and `rereadInm` 200 h0g2c1.
4. G311-AUTH at both viewports, warmed in a browser first.
5. Offline checks:
   - WK-UNIT (75/75 and 32/32);
   - RED-ON-HEAD (4 rows);
   - PROTECTED-UNCHANGED;
   - SOURCE-SCOPE, including the PR13 `-` line note above;
   - CLAIMS against `a-round-311/claims-after.txt`;
   - TESTS-READ with at least one mutant of C's own (suggested: drop one `else headers.delete('ETag')`, which should survive and confirms L3);
   - doc 227 lines 4 and the headings.

## Scope completed
A-CLAIMS, A-UNIT, A-RED-ON-HEAD, A-MUTANTS, A-PARITY, A-TYPE/LINT, A-REVIEW and A-DOC all pass on A's tree. C's rows and the gate rows are not claimed here. The backlog item is not marked complete.
