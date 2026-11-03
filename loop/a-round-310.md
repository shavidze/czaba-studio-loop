# A round 310 — PERF-4d: one R2 read per public GET, 416 `no-store` (GATE309-M1/L2/L3)

No STOP. HEAD `b65febe`; nothing committed, pushed or deployed.

## Changed files (exactly the §5 grants)
- `store/workers/r2-proxy.js`: the helper block only (`const PUBLIC_EXPOSE_HEADERS` → EOF).
- `store/cloudflare/r2-worker.js`: the same block, byte-identical.
- `store/workers/r2-proxy.test.mjs`: the `publicRequest` fake and the PR rows (diff hunks all at l.≥137; the 40 protected rows, `request` and `tokenFor` are untouched).
- NEW `store/docs/implementation/2026/quarter-IV/226-perf-r2-worker-single-read.md`.

How: B's sketch files (`b-round-309/sketch/sketch-r2-proxy.js.txt`, `sketch-r2-worker.js.txt`, `sketch-r2-proxy.test.mjs.txt`) copied byte-for-byte. Before copying, A checked that each sketch's top (up to the helper line) equals HEAD and that the sketch's block equals `helper-block.js.txt`. A's code is therefore identical to the sketch, and no `claims-after` reason is needed.

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: before editing, output equals `claims-310-head-output.txt` | `a-round-310/claims-before.txt` |
| A-UNIT | PASS: `node --test workers/r2-proxy.test.mjs` 69 tests / 69 pass / 0 fail, 0.27 s wall (duration_ms 236). vitest `r2-tokens.server.test.ts` + `download-routes.test.ts`: 32/32, 1.5 s wall | `a-round-310/unit.txt`, `vitest.txt` |
| A-RED-ON-HEAD | PASS: on scratch `/tmp/a310h` (HEAD workers via `git show`, plus A's test file): 15 red, 54 pass. The `not ok` lines are identical by name to `sketch-tests-on-head.txt` (`diff` empty) | `a-round-310/tests-on-head.txt`, `tests-on-head-red.txt` |
| A-MUTANTS | PASS: 13/13 red on scratch `/tmp/a310m` (never in `store/`); restored 69/69. The result file is byte-identical to B's `sketch-mutants.txt`, which matches the §6.2 red lists. MU-ONE-COPY: exactly the 7 `alternate:` rows | `a-round-310/mutants.txt`, `mutant-logs/*.log`, `mutant-logs/*.patch.txt` (25 patches), runner `a-round-310/run-mutants.py` (B's `mutants.py` plus `.patch.txt` output) |
| A-MUTANTS (rig) | Reproduce: `mkdir -p /tmp/a310m/{workers,cloudflare}`; copy A's `workers/r2-proxy.js`, `workers/r2-proxy.test.mjs` and `cloudflare/r2-worker.js` into it; `git -C store show HEAD:cloudflare/r2-worker.js \| sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' > /tmp/a310-head-helper.js` (arg 3, used by MU-ONE-COPY); then `python3 -I a-round-310/run-mutants.py /tmp/a310m <logdir> /tmp/a310-head-helper.js`. Red counts are 15/4/7/4/6/8/4/2/2/2/2/2/7. Each equals the §6.2 row list × 2 copies (+1 for PR9 on MU-HEAD-FIRST and MU-304-NO-RELEASE); MU-ONE-COPY = the 7 `alternate:` rows. For example, MU-HEAD-FIRST: 7 rows × 2 + PR9 = 15; MU-THROW-UNHANDLED: 4 × 2 = 8 | `a-round-310/mutants.txt` |
| A-PARITY | PASS: the diff is empty | — |
| PROTECTED-UNCHANGED (self-check) | PASS: in both workers, everything up to `const PUBLIC_EXPOSE_HEADERS` is identical to HEAD | — |
| A-TYPE/LINT | PASS: `npm run typecheck` rc 0. `npm run lint` rc 0 with 205 warnings + 1 info (unchanged). `node --check` passes on both workers and the test file. **Note (L30):** Biome ignores `workers/` and `cloudflare/` and does not lint `.md`, so Biome covers none of the 4 owned paths | `a-round-310/typecheck.txt`, `lint.txt` |
| A-DOC | Written: l.4 is exactly `**სტატუსი:** Completed (C round 310 PASS)`, and the 7 TEMPLATE `## ` headings appear in order. Cited probe/sketch files exist, and PR1–PR15 each grep once in the test file. Doc 225 is untouched | doc 226 |
| A-REVIEW | Done: `code-reviewer` (actual subagent), 8/10, 0 Critical/High/Medium, 5 Low. No code changed after the review | below |

`sha256sum -c ../tmp/studio-real-loop/b-round-309-r310-tree-sha256.txt` fails only on the 3 modified paths. `git status --short --untracked-files=all` shows 3 M + 1 new doc.
Claims after (`a-round-310/claims-after.txt`): K2 `4 b65febe`; K5 `198 160 314 276`; K6 `2 4 2 4`; K7 `1 1 1 1`; K9 69/69; K16 `1 226-perf-r2-worker-single-read.md`. Every other K equals the HEAD output, including K11 `0` and K12 `0 0`. Against the sketch output, only K2/K10/K16 differ, which is the expected scratch emptiness.

## Code-reviewer findings → for B (none Medium+; no code changed)
- **A-R310-REVIEW-L1 (Low):** `r2RangeOf` passes unclamped client values to R2 (`bytes=-500` → `{suffix:500}`; a huge `b` → `length` 1e20 or Infinity). If real R2 throws on these, the throw path finds the range satisfiable and rethrows, so the client gets a 500 instead of a 206. At HEAD, the range was clamped through `head` before the `get`, so this oversized-value path to R2 did not exist before this change. It is a potential regression on a valid request, but only under the undocumented R2 branch that §0.3/§11 already list as post-deploy. B rules whether it stays Low or gets a 4c row. Browsers do not send such ranges. A did not change this, because §4.1 rules "the range as written" and a formula change is a STOP-class change (L11). Proposal: post-deploy check, or a bounded fix (e.g. a non-safe-integer `end` → `{offset}`) in 4c.
- **A-R310-REVIEW-L2 (Low, test gap):** the throw-path If-Range re-read ETag replacement is not pinned by `changedOnSecondRead`. A mutant that kept the `head` ETag there would stay green.
- **A-R310-REVIEW-L3 (Low, test gaps):** PR13's un-ranged throw does not assert `heads` 0. PR15's 416 does not assert ETag or body cancel. No row covers HEAD + If-None-Match → 304, or HEAD + an unsatisfiable range → 416 `no-store` (doc step 10 claims this from the code). In PR14, `opened.every` is trivially true in throw mode. Candidates for A-R309-REVIEW-TEST-GAPS.
- Low #4 (Content-Length relies on R2 clamping exactly) is already on doc 226's post-deploy list.
- Low #5 (doc l.4 "claims PASS in advance") was **rejected**: L28 requires exactly this string.
- **Architecture note:** keep. `servePublicObject` was rewritten in both rounds 309 and 310 (signal 3), and the two copies are R2-WORKER-TWO-COPIES. Proposal: after SABA-Q-WORKER-DEPLOYED, one bounded task removes the undeployed copy or moves the helper into a shared module, with the 69 tests as the gate. Not a fix for this round.

## Known gaps
- A ran no browser probe. The code is byte-identical to the sketch B probed (§0.2); C's WK-OPS rows are the real check on A's tree.
- Real R2 behaviour (out-of-range branch, oversized suffix, CDN 416 caching, TTFB, Safari) cannot be checked in the cloud; it is on doc 226's post-deploy list.
- `npm run build` was not run by A: the 4 owned paths (two worker scripts outside the Remix build graph, a `node --test` file, a doc) are not part of the build, so a build exercises none of the change; §3.2 lists build as a gate row. Also not run by A (gate rows): the full vitest suite, `npm run verify` and e2e smoke.

## Exact next C checks
WK-OPS-PROXY-THROW, WK-OPS-PROXY-SHORT, WK-OPS-ALT, WK-HEAD-CONTROL, G310-AUTH (both viewports, browser warm-up per L38); WK-UNIT (69/69 + 32/32); RED-ON-HEAD (expect the same 15 names); PROTECTED-UNCHANGED; SOURCE-SCOPE; CLAIMS (compare with `a-round-310/claims-after.txt`); TESTS-READ (plus one C mutant; suggestion: reviewer L2, the throw-path re-read ETag); DOC.

## Scope completed
All §3.1 A rows. PERF-4d awaits C. This report does not mark the backlog item done.
