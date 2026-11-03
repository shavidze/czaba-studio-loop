COMMIT: OK. This round changes only the two R2 workers, their test file and the implementation doc. It does not touch the Studio code, any React/TS/Tailwind code, or the auth, purchase or download paths.

## Code Review: `workers/r2-proxy.js`, `cloudflare/r2-worker.js`, `workers/r2-proxy.test.mjs`, doc 226

**Scope check**
- **Only one function changed.** All changes are in `servePublicObject` and new helpers below it. It is called only by `handlePreview` in both workers and by `handleImage` in `workers/` only.
- **Protected routes are not touched.** `handleProtected`, `validateToken`, `/download/`, `/studio/`, `/recordings/` and `/originals/` are outside the diff hunks.
- **The two worker copies match.** Their diff hunks are identical, apart from the starting line number.
- **The test file was not run by `verify`.** `verify.log` shows 234 vitest files passed and both builds passed, but `r2-proxy.test.mjs` is not in it. The only evidence for the worker tests is C's round result and the doc's "69/69" claim. I did not run them myself.

### Critical Issues
- None.

### Suggestions (most important first)

1. **Medium: a suffix range larger than the file could now return a 500 error.**
   - **Where:** `workers/r2-proxy.js:273`, `cloudflare/r2-worker.js:235`.
   - **What changed:** the old code read the file size first (`head`) and trimmed every range before calling `get`. Now the request's range goes straight to R2: `{ suffix: n }` with n bigger than the file, or `{ offset }` alone.
   - **The risk:** R2's docs only promise that a too-long `length` returns fewer bytes. If real R2 throws on a too-large `suffix`, the catch block sees a range that can be served and rethrows. The client gets a 500 where it used to get a 206 with the whole file. Tests only cover the case where the fake R2 trims.
   - **Fix:** in the catch, when `ifRangeHolds` is true and `resolveRangeSpec(spec, meta.size)` gives a servable range, retry once with that trimmed range: `get(r2Key, { range: { offset, length } })`. Rethrow only if the retry fails. PR13 still passes, because it checks status and `heads`, not the number of reads. The cost is one extra read on a rare path. Browsers' `<audio>` elements don't send suffix ranges, so this does not block the commit.

2. **Low: the worker tests are still not part of `npm run verify`.** The project's verify check therefore doesn't protect this commit. Add `node --test workers/r2-proxy.test.mjs` to the verify script. This is the existing open item ROOT-REQ-VERIFY-WORKER-TESTS.

3. **Low: the If-Range re-read still checks If-None-Match against the first read.**
   - **Where:** `workers/r2-proxy.js:296-301`, `cloudflare/r2-worker.js:258-263`.
   - **The gap:** if the file changes between the two reads, a client whose cached ETag matches the new version gets a 200 instead of a 304. The response is still correct; it just wastes bandwidth. This is the known item B-R309-REFETCH-INM-WINDOW.
   - **Fix:** after the re-read, run `etagMatches(request.headers.get('If-None-Match'), object.httpEtag)` again and call `releaseBody` before returning a 304. That is two lines and could go into this round.

4. **Low: a 304 now opens the whole file and then cancels it** (`workers/r2-proxy.js:289`). R2 charges the same single operation and nothing for egress. But on a cover image or WAV revalidation, the worker now starts a body stream it never needs. The doc's plan to switch to `onlyIf` once its semantics are confirmed is the right follow-up.

5. **Info: `bytes=-0` reads the whole file only to return a 416.** `r2RangeOf` returns `null` for it, so the code does a full `get` and then cancels it (`workers/r2-proxy.js:304`). It is harmless and rare. If you want, return the 416 early when the request has a suffix of 0.

**Browser and runtime checks**
- **No leaks:** every early return that opened a body releases it: the 304 at line 289, the re-read at 296 and the 416 at 304. `releaseBody` catches a failed cancel, so a 304 can't turn into a 500.
- **Correct header order:** If-None-Match is checked before Range (RFC 9110), and a weak If-Range is ignored.
- **HEAD requests** still do one `head` and return no body.
- **Header values are consistent:** `Content-Range` and `Content-Length` now come from the same read as the body, which fixes GATE309-L2.

### Good Practices Found
- One R2 read per public GET removes a round trip from every `<audio>` seek, which is the main speed path.
- The 416 response is now `no-store`, which fixes L3.
- Both possible R2 behaviours for an out-of-range offset (throw or short body) are tested on both workers, backed by 13 mutants.
- The doc separates documented R2 facts from guesses and lists what to check after deploy.

### Architecture note
- **Signal: the same costly change has to be made twice.** `workers/r2-proxy.js:203-310` and `cloudflare/r2-worker.js:165-272` carry the same helper block. This is the second round in a row (309 and 310) that edited both copies in lockstep. Parity is enforced only by MU-ONE-COPY and a manual diff check.
- **Proposal for the planner (one bounded task):** after SABA-Q-WORKER-DEPLOYED answers which worker is actually deployed, either delete the unused copy or move `servePublicObject` and its helpers into a shared ES module that both workers import. The PR tests should import that module once. Protected routes stay byte-identical.
- **Until then, keep both copies.** Merging them before we know the deploy target risks breaking whichever worker is live. This is not for the implementer to do in this round.

### Alternative Approach (critical logic: how the worker serves byte ranges)
- **Current:** a hand-written mapping from the request to an R2 range (`r2RangeOf`). The worker computes `Content-Range` and `Content-Length` from `object.size`. If R2 throws, it falls back to a `head` read.
- **Alternative:** pass the request headers straight to R2, `get(r2Key, { range: request.headers, onlyIf: request.headers })`, and build the headers from `object.range`. If no body comes back, return a 304.
- **Verdict: keep the current approach for now.** The alternative is shorter, but it depends on R2 behaviour that isn't documented: how it compares weak ETags, lists and `*`, and whether `object.range` is trimmed. The current code is predictable and tested on both possible R2 behaviours. The only open risk is suggestion #1, and the bounded retry closes it. Revisit `onlyIf` after the post-deploy measurements.

### Score: 8/10