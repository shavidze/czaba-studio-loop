# B — Round 186 → 187 planning (D-29z152)

Date: 2026-10-26 · Role: B. I wrote planning artifacts only and touched no app source; `git status` was clean before and after. · Advisor: **available and consulted** after orientation, before writing.

## Inputs read
- `current-task.md` (round 186), `a-round-186.md` (Architecture note), `c-round-186.md`, `c-round-186.json`, `gates/gate-round-186.json`, `gates/round-186/review.md`, `regression-last.json`, `env-status.json`, `b-round-185.md`, `b-next.json`, and the head of `context/active-summary.md`.
- `backlog.json`: only `rounds`, the STORE-REDESIGN queue entry, `open_findings` (C-R185-*), `deferred_low_polish` (count), `regression_rounds`.
- `feature-status.md`: only the header, the Round 185 line and the STORE-REDESIGN row.
- The spec's STORE-1 row (DATA).
- Source, read-only at `cc207d6`: `AudioPlayer.tsx`, `AudioPreviewButton.tsx`, `AudioContext.tsx` (initial state), `ProductCard.tsx`, `ProductSidebar.tsx`, `ProductDetailPage.tsx`, `product-utils.ts` (`createDisplayVersions`), `PurchaseHeader.tsx` (price use), `sitemap[.]xml.tsx`, the `app.css` player/preview rules and tokens, doc 153, `biome.json` (`useButtonType`).

## Gate and baseline
- `gate-round-186.json`: **published**, commit `cc207d6` on both remotes. HEAD is `cc207d6`, with 1013 tracked files, and the tree is clean.
- **Archive:** `tasks/round-186.md` is a copy of the round-186 `current-task.md` (`cmp` equal, sha `c3ce161b…`). Nothing was deleted.
- **Before-copies:** `b-round-186/before/` (backlog, feature-status, b-next, current-task, regression-last).
- **New baseline files:**
  - `b-round-186-r187-tree-sha256.txt`: 1010 entries, OK.
  - `b-round-186-r187-grants.txt`: 3 files.
  - `b-round-186-r187-new-files.txt`: 2 store files.
  - `b-round-186-r187-granted-start-sha256.txt`.
  - `b-round-186/r187-granted-start/`.

## Backlog updates (only from C's independent evidence)
Source: `c-round-186.json` is PASS, with `browserVerified=true` and `realVerified=true`. 12 rows passed, 0 failed and 0 were blocked.
- **STORE-1a → მზადაა.** Round 186 → `c_pass_published cc207d6`. **C-R185-01 and C-R185-02 → resolved.**
- **C-R186-01 (Low, conditional)** stays an open finding with an upgrade rule: it becomes Medium if the real API returns an active product without variants. Owner: STORE-4. It is added to the regression smoke.
- **C-R186-02 (Low)** → `deferred_low_polish`, owner STORE-2.
- **Gate-186 reviewer items are recorded as signals** (`GATE186-REVIEW-SIGNALS`):
  - The stale doc 153 status is scheduled now (K3).
  - The sitemap inactive filter → `GATE186-SITEMAP-INACTIVE` (deferred Low, STORE-5 candidate).
  - The list of links that 404 once a product is inactive is info.
  - The emoji surrogate cut is a nit.
  - Architecture note: "keep the helper in the route".
- **B's own signal:** `B-R186-PLAYER-SIGNALS`, i.e. the hardcoded rgba track colour and the `.audio-preview-overlay-text` class that becomes unused.
- **Regression scope** gained the STORE-1a/1b checks and `door-slams`, and now uses the scrolled home baselines. The regression round is now expected as round 188.
- `deferred_low_polish`: 264 entries.

## Decision: round 187 = STORE-1b
- **Regression is not due:** 2026-10-24 → 2026-10-26 is 2 days. That matches round 186's pre-written outcome ("C PASS, planning still on 2026-10-26 → STORE-1b").
- **No Critical, High or Medium finding is open.** The C bugs come first, but neither new Low qualifies for this round:
  - **C-R186-01:** a fix changes either the shown price or the `productVariantId` sent to `addToCart`. That is purchase-path semantics with an unknown backend contract. `product-utils` l.85 returns `[]` for an SFX product without variants on purpose. So the fix is not cheap and not related to the player.
  - **C-R186-02:** the overlay is owned by STORE-2.
  - **C-R185-I3:** it needs a frozen layout file.
- **The fix I planned at first would have proved nothing (the advisor caught it).** The `AudioPreviewButton` defect is not a React hydration mismatch. The server and the first client render agree, and the label disappears in the post-mount re-render. A "static vs first render" test would pass on the start code. T1's B1 therefore compares the static markup with the DOM **after effects flush**, and it must be red on the start code. C compares the button's markup and boxes in a JS-off session against a hydrated one.
- **Ruling R55 (vetoable):** the single markup is the interactive one: icon only, "Play preview", `type="button"`, and no label. The rejected alternative was to keep the label in every state. Rationale: 0 px change to the UI users actually use, the label existed only in dead markup, and the Pause and Loading states never had it.
- **Two corrections after the advisor's final review:**
  - FILL-187 and A's live proof now resolve the brand colour from a runtime probe. `hsl(175, 85%, 46%)` serializes to about rgb(18, 217, 200), so a literal 19, 217, 204 match would fail on correct code.
  - FLIP-187 compares button size and the svg offset *relative to the button*, not absolute boxes. The framer-motion SSR `initial` transforms offset JS-off pages.
  - The drift between the hsl value and the hand-written `--color-brand-rgb` is a STORE-2 token signal.
- **K1:** only the token name changes, at 4 places on 2 lines. The hardcoded rgba is out of scope and recorded as a signal.
- **K3:** two lines of doc 153, so the published doc stops saying "awaiting C".

## Feature boundary and architecture
- A's reviewer and the gate-186 reviewer both gave weak signal 1 (meta helper in the route) with the verdict "keep". No new structural risk, and no owner accumulates risk (2 small components).
- `b-round-183-checkpoint-request.md` is still unanswered, so fallback (c) continues; it blocks nothing. The next checkpoint point is the STORE-REDESIGN exit.

## Ableton
Not applicable (store pages).

## FB-01..FB-16 and remaining scope
- **FB table unchanged:** FB-03 and FB-15 are მზადაა. The others are მოწმდება, pending Tech Lead manual checks (not cloud-reproducible failures).
- **Remaining:** STORE-1b, the REGRESSION round, STORE-1c and 1d, STORE-2 to 5, REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, the deferred Lows (264), C-R186-01, the Tech Lead manual checks, the backend-only evidence and the final regression. The `awaiting_user` items stay recorded; they are not called deferred.
- **Out of scope, unchanged:** professional plugins and effects, pitch, multi-video layers, and audio stretch (grid tempo is not stretch).

## Not COMPLETE, not BLOCKED
Large scope remains and nothing needs external input or credentials.

## Ready for commit (root)
- Round 186 is already published (`cc207d6`).
- Round 187, on C PASS: the 3 grants + T1 + doc 154.
