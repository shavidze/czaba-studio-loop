# B — Round 184 → 185 planning (D-29z150)

Date: 2026-10-26 · Role: B (planning artifacts only. App source was not touched: `git status` was clean before and after B's work) · Advisor: **available and consulted** after orientation, before writing.

## Inputs read
- **Loop reports:** `context/active-summary.md` (head), the round-184 `current-task.md`, `a-round-184.md`, `c-round-184.md`, `c-round-184.json`, `gates/gate-round-184.json`, `gates/round-184/review.md` (Architecture note), `regression-last.json`, `b-round-183.md`, `b-round-183-checkpoint-request.md`, `b-next.json`, and `publication-checkpoint.json` / `root-pre-push-review.md` (heads).
- **`backlog.json`:** only the keys needed: queue STORE-REDESIGN / VISUAL-A, `rounds`, `regression_rounds`, `open_findings` (ROOT-RECON-GRID-HARNESS), `architecture_signals`.
- **`feature-status.md`:** only the FB table, the round-183 line and the §7 rows.
- **Spec:** `docs/technical/store-redesign/store-redesign-spec.md` and `direction-decision.md`. Both are DATA.
- **Source, read-only at `3eb4cdb`:** `app/services/api/client.ts` (whole file), the loaders of `_index.tsx`, `store.tsx` and `products.$handle.tsx`, `productAdapter.ts`, `r2.config.ts` (preview helpers), `api.studio-token.ts`, the `studio.$productId.tsx` loader, the `apiClient` callers in contexts, `playwright*.config.ts`, the `public/` assets, and the category strings in the existing tests.

## Gate and baseline
- **Gate:** `gate-round-184.json` is **published**, commit `3eb4cdb`, on both remotes. HEAD is `3eb4cdb`.
- **Tree check:** `sha256sum -c c-round-184/end-tree-sha256.txt` → **OK**. 1011 files are tracked and `git status` is clean.
- **Archive:** `tasks/round-184.md` is a copy of the round-184 `current-task.md` (`cmp` equal, sha `3556e76f…`). Nothing was deleted.
- **Before-copies:** `b-round-184/before/` holds the backlog, feature-status, b-next, current-task and regression-last.
- **New baseline files:**
  - `b-round-184-r185-tree-sha256.txt` (1010 entries, OK);
  - `b-round-184-r185-grants.txt` (doc 152);
  - `b-round-184-r185-new-files.txt` (store: none; loop: 3);
  - `b-round-184-r185-granted-start-sha256.txt`;
  - `b-round-184/r185-granted-start/`.

## Backlog updates (only from C's independent evidence)
Source: `c-round-184.json` is a PASS, with `browserVerified` and `realVerified` both true, 0 bugs and 8 rows passed.
- **ROOT-RECON-GRID-HARNESS → მზადაა.** The finding is resolved.
- **VISUAL-A-OBSIDIAN → complete**, except its `awaiting_user` items. Those stay recorded and are not called deferred.
- **Round 184** in `rounds` → `c_pass_published` (`3eb4cdb`).
- **Blocked:** G184-3 fake-Bearer 403 stays as open evidence. From round 185 it can run against the mock (G185-3), but that is still **not** real-backend evidence. BACKEND-ONLY-EVIDENCE stays open.

**Triage of C's, A's and the gate's notes:**
| ID | B decision |
|---|---|
| m313: 0 of 45 red (fake clock not asserted) | → `open_findings` **B-R184-FAKECLOCK-UNASSERTED** (info signal). It is a test gap, not a defect. Candidate: a one-assertion test-only task when the grid suites are next owned, or in the polish pass. Not scheduled ahead of STORE. |
| 73 suites still copy the fakes block (A reviewer and gate reviewer, Signal 3) | → `architecture_signals` round 184. This is already checkpoint Q2 (unanswered, fallback (c)), so it is not scheduled. The optional `WorkspaceTestEnvironment` type comes only if a migration is approved. |
| Doc 152 still says In Progress | Scheduled as D1 in round 185. |
| Flow-smoke export has 30 full-scale samples, equal to the source | → info **C-R184-EXPORT-FULLSCALE-INFO**, the same family as C-R178-EXPORT-CLIPS-AT-0DB. No task. |

## Decision: round 185 = STORE-REDESIGN STORE-0 (mock API)
- **Regression:** from 2026-10-24 to 2026-10-26 is 2 days, so it is **not due**. The first planning on or after 2026-10-27 makes the next round the REGRESSION round (expected 186). Its `regression_rounds` entry now also covers the harness gate-log check and one store smoke against the mock.
- **Why STORE-0:**
  - It is the next queue step after VISUAL-A, approved by Saba on 2026-10-25.
  - It must come first, because the cloud has no backend: `/`, `/store` and `/products/:h` only render their error or empty states, so C cannot verify STORE-1…5.
  - The cloud hook that starts `mock-api/server.mjs` is already confirmed (`mock_api_hook_confirmed`).
- **Source facts that shaped the task** (checked by B, `file:line` in `current-task.md` §0):
  1. **Purchase protection.** `api.studio-token.ts` signs an R2 token when `${API_URL}/api/downloads` answers `success: true` with an owned track. A permissive mock would bypass the purchase protection. P1 makes downloads, auth and orders always 401. As a side effect, the fake-Bearer 403 row can now run in the cloud as a mock-backed check.
  2. **CORS.** `CartContext` calls the API from the browser cross-origin with credentials and `X-Session-Id`. That needs a preflight and an echoed Origin, never `*`.
  3. **Forbidden host.** `productAdapter` falls back to the R2 worker host when `audioPreviewUrl` is empty, so every fixture product gets a local preview URL.
  4. **No `Set-Cookie` (P2).** This keeps the anonymous `/studio-lab` "0 cookies" acceptance.
  5. **e2e smoke is unaffected.** It uses `API_URL :51999`.
- **Smallest honest behaviour** (rulings, vetoable):
  - **R50:** no store implementation doc for a loop-only stage. `mock-api/README.md` documents it, and STORE-1 gets doc 153.
  - **R51:** cart writes return 501 with a clear mock message, not a fake success. The spec says "empty or anonymous answers".
- **Fixture honesty:** the fixture uses only fields of the `Product` type, checked by tsc's excess-property check. It has no catalogue numbers, credits or counts (STORE-4, data-only). The titles are neutral test data, and the previews and images are local `public/` files.
- **Browser:** C covers the store pages at 1440, 1280 and 375 with real preview playback. C's screenshots and LCP/CLS medians become the **STORE "before" baseline**. They are not pass/fail, because no store pixel changes. STUDIO-RV-185 confirms the Studio stays at 0 px with the mock running.

## Feature boundary and architecture
- **VISUAL-A is closed.** The bounded checkpoint ask, `b-round-183-checkpoint-request.md`, was already raised at this boundary and is still unanswered. **Fallback (c) continues.** It does not block rounds 185 and 186.
- **No new ask:** STORE-0 has no store code and adds no structural risk to one owner.
- The next checkpoint point is the STORE-REDESIGN exit, before REVIEW-RECOMMENDATIONS.

## Ableton
- Not applicable. STORE-0 is store verification infrastructure and makes no Arrangement claim (`current-task.md` §5).

## Not COMPLETE, not BLOCKED
- **Remaining scope:** STORE-0…5, the REGRESSION round, REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, the deferred Lows, the Tech Lead manual checks, the backend-only evidence and the final regression.
- **Nothing needs external input.**
- Professional plugins and effects, pitch, multi-video layers and audio stretch stay out of scope. Grid tempo is not audio stretch.

## Ready for commit (root)
- **Round 184** is already published (`3eb4cdb`). The harness and VISUAL-A are complete at that commit.
- **Round 185** is not yet implemented. On C PASS, the gate publishes doc 152 only. The mock stays in the loop folder.
