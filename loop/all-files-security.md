## Security Review ΓÇö store `master` (staged, pending commit on top of `375ee3b`)

Scope: `git diff --cached`, 26 files. That's 4 code files and 22 agent, skill or docs markdown files.
Files reviewed: `api.studio-token.ts` (whole file), `studio.$productId.tsx` (diff), `account.downloads.tsx` (diff plus the Studio button routing), `download-routes.test.ts` (diff), `r2-tokens.server.ts`, and the backend `UserDownloadsResponse` / `DownloadService` mapping.

### Critical / High / Medium
None. **No blockers.**

### Low
- `app/routes/api.studio-token.ts:47`: if `category` were ever missing from the backend response, `product.category.toLowerCase()` would throw. The `catch` turns that into a 500, not a 403. It still fails closed and no token is issued. The backend DTO currently defaults `Category` to `""`, so this can't happen today. No change needed before the push.

### Passing
- **Fail-closed entitlement:** The server issues a token only when all of these hold: backend `/api/downloads` returns 2xx, `success === true`, the handle matches exactly, `isAvailable` is true, `category === 'track'`, and the license is exactly `standard` or `premium` (case-insensitive). Anything else gets 403 or 500 and no token. Unknown values, `""`, `Premium-ish` and `Universal` are all rejected, and tests cover these cases.
- **Non-owners:** Ownership comes from the backend using the caller's own Bearer token, never from request parameters. Tests show 403 for another product, an unavailable purchase, and an Sfx-category purchase.
- **R2 token scope:** The scope hasn't changed. The token covers `{handle}/Studio-Assets/{file}` only, files are checked with `isSafeR2FileName` (no `/`, `\`, `..` or control characters), there's a cap of 100 files, it's HMAC-signed, the user reference is a SHA-256 of the auth header, expiry is 2h, and the response is `no-store`.
- **No auth bypass:** The 401 check comes before any backend call. Parameter validation (400) happens before the fetch. The client gate (`RequireStudioOwnership`) only affects what the user sees, and the token endpoint stays the enforcement point.
- **SFX Universal:** This diff doesn't change it. The SFX Studio button goes to `/recordings/{productId}`, not this endpoint, and the backend still maps SFX Universal ΓåÆ `premium.zip`. Denying Sfx on `api.studio-token` is consistent with that.
- **Policy match:** Standard and Premium **music** purchasers get Studio stems, as the agreement says. The backend's `"Track"` category matches the store's lowercase comparison.
- **Secret scan of the staged files:** No real secrets. The only hit is the `"AIza..."` placeholder in a skill doc.
- **PII:** None added to logs or error messages.
- **Tests:** `download-routes.test.ts` passed 21/21. The working tree matches what's staged, so the tests ran on exactly the content being committed.

### Limits
- I didn't review the R2 Worker that checks these tokens (it's outside this repo).
- I didn't review the `/recordings/{productId}` flow for SFX.
- I didn't do a line-by-line review of the backend `/api/downloads` entitlement logic. I only checked the DTO and the category/license mapping.
- I ran only that one test file, not the full suite, build, or Biome.

### Verdict
**APPROVE.** The staged changes are fine to commit and push as requested.
