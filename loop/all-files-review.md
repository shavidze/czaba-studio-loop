## Code Review: studio token entitlement, downloads, studio route, new agent/skill files

I couldn't run `git diff HEAD` because only Read, Glob and Grep were available. So I reviewed the current contents of every file in scope in full. To check the entitlement chain end to end I also read `r2-tokens.server.ts`, `api.download.ts`, `workers/r2-proxy.js`, `PurchasesContext.tsx` and the backend `DownloadService.cs`. Because I couldn't diff, I can't separate code that's new in this change from code that was already there.

### Critical Issues
None found. Every rejection path I traced fails closed.

### High
- **Owners only get working stems for one product, `middle-east`.** The loader in `studio.$productId.tsx` (lines 159ΓÇô181) always builds stem URLs from the folder `middle-east`, whatever handle is in the URL. The client asks for a token using the route handle (`product: product.id`). `generateR2Token` then signs keys like `{routeHandle}/Studio-Assets/...`. But the browser fetches `/studio/middle-east/...`, and the worker's `validation.productHandle !== productHandle` check (`r2-proxy.js` line 131) returns 403. So for any other product, an owner gets a 200 token and then sees "Failed to Load Stems". Nothing leaks (it fails closed). But "Standard and Premium owners receive stems" is only true at the token layer, and only for the `middle-east` handle end to end. The tests check the token payload only, never that the signed keys match the URLs the loader produces. This hardcoding is probably older than this change, but I can't confirm that without the diff. Either block the commit on it or record it as a known limitation.

### Confirmations (from the code I read)
- **Standard and Premium track owners get a token.** `api.studio-token.ts` lines 41ΓÇô49 require: same handle, `isAvailable`, category `track` (case-insensitive), and license exactly `standard` or `premium`. The backend sends exactly `"Standard"` or `"Premium"` (`DownloadService.cs` lines 104ΓÇô110). The tests cover both licenses and check the exact `Studio-Assets` keys.
- **Non-owners and others are still rejected:**
  - Wrong handle, unavailable purchase, SFX category, Universal, empty or unknown license ΓåÆ 403.
  - No Bearer header ΓåÆ 401.
  - Backend returns non-OK ΓåÆ 403.
  - Unsafe file names (`../`, slashes, control characters, `..`) ΓåÆ 400 before the ownership fetch happens.
  - Any thrown error ΓåÆ 500 with nothing granted.
- **Universal SFX path:** `api.download.ts` still requires an exact `universal` license for `type=universal` and signs only `premium.zip`. Studio rejects Universal owners. `account.downloads.tsx` still sends SFX to `/recordings/{productId}`. One behaviour change: the SFX Studio button now also requires `isAvailable`, so unavailable SFX purchases lose the button. That looks intended.
- **Client-side gate:** `RequireStudioOwnership` doesn't check category or `isAvailable`. It's only a UI gate and the server enforces both, so this is acceptable.

### Medium
- **Category match ignores whitespace.** `product.category.toLowerCase() === 'track'` doesn't trim, and the backend returns the raw `Category`. Backend tests use a `"  Track  "` value, so badly entered data could wrongly deny a real owner. It fails closed, but if that happens, `account.downloads` still shows the Studio button, which then returns 403.
- **`userId` is derived two different ways.** Studio hashes the full `Authorization` header (`Bearer ΓÇª`); download hashes the bare token. The worker doesn't check `userId`, so this isn't exploitable today, but it will break if anything later relies on that value.
- **`AGENTS.md` and the `.codex` agent point to files that don't exist.** They reference `.Codex/prompts/*`, `.Codex/compositions/*`, `.Codex/skills/*` and `.Codex/agents/design-philosopher.md`. Only `.codex/agents/ableton-arrangement-expert.toml` exists. The capital `C` is also wrong on case-sensitive file systems. Codex agents following these instructions will hit dead references.

### Secret scan of the new instruction files
I grepped for key, token and secret patterns (`sk_`, `AKIA`, `AIza`, `ghp_`, `whsec_`, private keys, password/secret assignments). There were no matches. The only items found:
- Absolute local paths, including `C:/Users/sshav/.agents/skills/gstack/browse/dist/browse.exe`.
- A local preview URL, `127.0.0.1:5188`.
- Public documentation links.

These reveal local machine details but no credentials. I didn't run any of the instructions in those files. The Ableton agent says it is read-only; its embedded bash only writes inside `tmp/ableton-arrangement-expert/`.

### Good Practices Found
- Inputs are validated before any network call, and capped at 100 files.
- Tokens are scoped to exact resource keys, and the worker checks purpose, handle and key.
- Successful token responses send `Cache-Control: no-store`.
- Error messages are generic and come from the server; React escapes them, and stack traces don't reach the UI.

### Alternative Approach
- **Current:** the client sends its own list of stem file names, and the server signs whatever is in that list, inside the owned product's folder.
- **Alternative:** the server loader looks up the product's real stem list from the backend and signs those URLs inside the loader.
- **Verdict:** the current approach is safe because files are scoped to a product the user owns. The alternative would also fix the hardcoded `middle-east` problem and remove the client-supplied list. I'd recommend it as the follow-up to the High finding.

### Score: 7/10
Authorization is correct and fails closed. The score is held down by the hardcoded stem folder, which means the "owners receive stems" claim only holds for one product.

Separately, several MCP connectors (Atlassian, Gmail, Google Calendar, Google Drive, Microsoft 365, Similarweb, Klaviyo, the Amplitude plugin and Slack) need authorization before they can be used. Do that in claude.ai connector settings, or with `/mcp` in an interactive session. This review didn't need any of them.
