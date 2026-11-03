COMMIT: OK (no blocking defects. The change only touches the public preview/cover range helper, and no auth, purchase or download code is in the diff.)

I didn't run any tests myself because I had no shell. The verdict relies on C's round-311 PASS, on `verify.log` (234/234 vitest files passed and both builds completed) and on my own reading of the code. `verify.log` does not run `node --test workers/r2-proxy.test.mjs`, so the "75/75" figure comes from the implementation doc and C, not from the verify gate. That gap is already tracked as ROOT-REQ-VERIFY-WORKER-TESTS. I checked that the two worker copies match by reading them side by side (`workers/r2-proxy.js:198–327` and `cloudflare/r2-worker.js:160–289`), not with a diff tool.

## Code Review: `workers/r2-proxy.js`, `cloudflare/r2-worker.js`, `workers/r2-proxy.test.mjs`, doc 227

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: in `short` mode, the test fake never actually reaches the short path for an unsafe offset** (`workers/r2-proxy.test.mjs:129`)
   - The fake throws its `TypeError` before it checks `outOfRange`. So PR16's `far` case (`{ offset: Infinity }`) always goes down the throw path, even when the mode is `short`.
   - As a result, `far.heads.length === 1` (`r2-proxy.test.mjs:182`) describes how the fake behaves, not what R2 does, and the `short` label gives no extra coverage.
   - **Fix:** throw the TypeError only in `throw` mode, or put it behind a separate `strict` option. Then in `short` mode, expect heads 0 and reads 1, with a 416 coming from `resolveRangeSpec` (`r2-proxy.js:315–318`).
   - The doc already labels R2's strictness as an inference (l.29), so this is a test-honesty fix, not a code bug.
2. **Info: the 416 response keeps `Accept-Ranges`** (`r2-proxy.js:314–318`, `r2-worker.js:276–280`)
   - Since `Accept-Ranges` is now set before `unsatisfiableResponse`, the 416 still carries `Accept-Ranges: bytes`. `unsatisfiableResponse` only deletes Content-Type and Content-Length.
   - This is harmless and allowed by the RFC, and the behaviour is the same as before. You could make 416 consistent with 304 by also calling `headers.delete('Accept-Ranges')` in `unsatisfiableResponse`, but it's optional.
3. **Info: no new risk in the remaining unsafe-start case** (`r2-proxy.js:232`)
   - A request like `bytes=<2^53+1>-<2^53+3>` still sends an unsafe `offset` with a small safe `length` to R2.
   - If R2 rejects it, the code calls head and then `resolveRangeSpec` sees `start >= size`, which gives a 416. So it can't fall into the satisfiable rethrow that returns 500. The doc's description (l.59, l.66) is correct.

**Things tests can't catch:**
- **Browser event order:** a normal `<audio>` seek (`bytes=N-`) and safe-integer ranges send the same R2 call as before (the doc's probe shows h0g1 for a normal seek). Only huge malformed ranges and the If-Range-mismatch-plus-If-None-Match case behave differently. Chromium's media stack doesn't send that header combination in normal playback.
- **Leaks:** every new 304 path cancels the body it opened (`r2-proxy.js:286`, `:309`). No timers or listeners were added.
- **Regressions:** the only early returns between the old and new places where Content-Type/Accept-Ranges are set are the new 304s and `return null` (which becomes a 404 with fresh headers). Every 200, 206 and 416 response still has the same headers as before.
- **Auth/purchase/download:** none touched. `servePublicObject` is only called from public routes (`r2-proxy.js:68,78`; `r2-worker.js:62`). `handleProtected`, `validateToken` and the token checks are not in the diff.
- **Render cost, a11y, Tailwind/tokens, TS strict:** not applicable. There are no frontend or `.ts` changes, and Biome doesn't check `workers/`. Semicolons are present everywhere.

### Good Practices Found
- **Headers and body can't drift apart:** Content-Range and Content-Length still come from `resolveRangeSpec(spec, object.size)`, so sending `{offset:0}` or `{offset:start}` in place of the original range keeps headers and body in sync.
- **Order matches RFC 9110:** If-None-Match is checked against the object that will actually be served, on both re-read paths (`r2-proxy.js:285`, `:308`).
- **Clean 304s:** they carry no Content-Type, Content-Length or Accept-Ranges, but keep ETag, Cache-Control and the CORS headers.
- **Correct ETag on re-read:** on the throw path, the ETag now comes from the object that was re-read, not from `head` (`r2-proxy.js:283–284`).
- **Boundary covered:** `bytes=10-9007199254741000`, where the length is exactly `MAX_SAFE_INTEGER`, is tested and still sends the length.
- **Copies stay in sync:** both workers have an identical helper block.
- **Doc numbering:** doc 227 follows the template and the quarter rule, and the number doesn't clash with anything (226 is the only neighbour).

### Architecture note
- **Signal 3, the same region keeps getting changed at high cost:** `workers/r2-proxy.js:254` / `cloudflare/r2-worker.js:216`. Rounds 309, 310 and 311 each edited the same `servePublicObject` helper block, twice each time (once per copy). Every round needed test-fake updates, mutants and browser probes. This is already tracked as R2-WORKER-TWO-COPIES.
- **Keep it for this round:** the fix is correct in both copies, and extracting it is out of scope.
- **Proposal for the planner (one bounded task, not a refactor order):** move `servePublicObject` and its helpers into one shared source that both workers use, or generate the `cloudflare/` copy from it.
  - **Acceptance:** zero behaviour change, PR1–PR18 pass against both entry points, and the parity check fails the build if the copies drift.
  - **Blocked by:** the answer to SABA-Q-WORKER-DEPLOYED (which worker is actually deployed).

### Alternative Approach
- **Current:** a safe-integer guard in `r2RangeOf`. When the length or suffix isn't a safe integer, the code sends an open offset to R2 and clamps the response from `object.size`.
- **Alternative:** in the catch block, call `head` and retry once with a range clamped to the object's size.
- **Verdict: keep the current approach.** It adds no extra R2 call and has no head/get race. R2's docs already say an over-long safe length is fine, so a retry isn't needed for that. The retry would only add a third call on a rare path.

### Score: 8.5/10