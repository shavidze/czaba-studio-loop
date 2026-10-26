# B — Round 187 → 188 planning (D-29z153)

Date: 2026-10-26 · Role: B. I wrote planning artifacts only and touched no app source. `git status` was clean before and after. · Advisor: **available and consulted twice**: after orientation (before writing) and for the final review. The final review led to four task-text fixes: the E2E `-g` regex moved out of the table, the h1 count is taken outside the loader overlay, SCOPE counts only added/removed lines, and the baseline paths are named.

## Inputs read
- **Round 187 files:** `current-task.md` (round 187), `a-round-187.md` (including the Architecture note), `c-round-187.md`, `c-round-187.json`, `gates/gate-round-187.json`, `gates/round-187/review.md`.
- **Loop state:** `regression-last.json`, the head of `context/active-summary.md`, `b-round-186.md`, `b-next.json`.
- **`backlog.json`:** only the STORE-REDESIGN queue entry, `rounds`, `regression_rounds`, `global_forbidden_files`, and the counts.
- **`feature-status.md`:** only the header, the Round 186 line and the STORE-REDESIGN row.
- **Spec and direction (DATA):** `store-redesign-spec.md` (STORE-1 row and the rules) and `direction-decision.md`.
- **Source, read-only at `cb24362`:**
  - `Header.tsx`, `Footer.tsx`, `HeroSection.tsx:150-165`, `root.tsx:136-152`, `app.css` `.text-glow`;
  - `ProductCard.tsx:110-150`, doc 154;
  - `e2e/navigation.spec.ts`, `e2e/main-flow.spec.ts:54-70`, `playwright.config.ts`, `playwright.smoke.config.ts`;
  - the routes without an h1 of their own (checked by grep), and `package.json` (no `@remix-run/testing`).

## Gate and baseline
- `gate-round-187.json` is **published**, with commit `cb24362` on both remotes. Its `head` field (`cc207d6`) is the parent. HEAD is `cb24362`, with **1015 tracked files**, and the tree is clean.
- **Archive:** `tasks/round-187.md` is a copy of the round-187 `current-task.md` (equal by `cmp`). Nothing was deleted.
- **Before-copies:** `b-round-187/before/` (backlog, feature-status, b-next, current-task, regression-last).
- **New baseline files:**
  - `b-round-187-r188-tree-sha256.txt`: 1011 entries, checked OK from the store root;
  - `-grants.txt`: 4 files;
  - `-new-files.txt`: 2 store files;
  - `-granted-start-sha256.txt`;
  - `b-round-187/r188-granted-start/`.

## Backlog updates (only from C's independent evidence)
Source: `c-round-187.json` is PASS, with `browserVerified=true` and `realVerified=true`. 11 rows passed; 0 failed, 0 blocked, 0 bugs.
- **STORE-1b → მზადაა.** Round 187 → `c_pass_published cb24362`.
- **C info, routed (`C-R187-INFO`):**
  - **I1:** the entrance loader blocks the card Play button on `/` for about 3 to 5.4 s. This goes into **STORE-1d's acceptance**: the loader must not block the Play control, and at most one h1 may show while it is up (`CinemaCurtainLoader` renders an h1).
  - **I2:** the LeadMagnet popup covers part of the scrolled baselines → a baseline note for rounds 188 and 189.
  - **I3:** expected behaviour.
  - **I4:** pre-existing.
  - **Task-text correction:** `/store` has no preview buttons, so the regression flip check now runs on the card buttons on `/`.
- **Gate-187 reviewer (`GATE187-REVIEW-SIGNALS`):**
  - The stale doc 154 status is scheduled now (K6, two lines).
  - Button inside `<Link>`, plus the slider fill on the `--progress` pattern → a STORE-2 proposal (signal).
  - `aria-hidden` on the SVGs → `deferred_low_polish` (`GATE187-SVG-ARIA-HIDDEN`).
  - Test isolation → signal.
  - Gold fill under the obsidian theme → info.
- **A's signals (`A-R187-SIGNALS`):**
  - `ProductCard.tsx:141` uses undefined `primary` tokens → deferred Low `A-R187-PRODUCTCARD-PRIMARY-TOKEN`, owner STORE-2. Restyle only, because "Limited" is on the keep-list.
  - Loosen P2 if STORE-2 adds a `primary` token.
  - **Decision on the transitive `react-router-dom`:** keep the `MemoryRouter` precedent, since `@remix-run/testing` is absent and no new package is added.
- **B's own signal (`B-R187-HEADER-SIGNALS`):** the auth-block buttons lack `type="button"`, the toggle lacks `aria-expanded`, the collapsed mobile links can still be focused, `.text-glow` becomes unused, and `main-flow.spec.ts` lists stale links.
- **Other updates:**
  - Regression scope gained the STORE-1b flip check on `/` and the STORE-1c checks, plus the popup baseline note. The regression round is now expected as round 189.
  - `deferred_low_polish`: 266 entries. `backlog.json` is now version 173.

## Decision: round 188 = STORE-1c
- **Regression is not due:** 2026-10-24 → 2026-10-26 is 2 days. Round 187's pre-written §7 outcome is "C PASS, planning still on 2026-10-26 → STORE-1c".
- **No C bugs, and no Critical, High or Medium finding is open.**
- **Scope** (the spec's STORE-1 row plus the direction board): the header nav on desktop and mobile is Collections · Studio · Free Samples · About. Gift Cards and Hire Us leave the header; the footer already has them. "Studio Lab — Demo" becomes "Studio". The wordmark becomes a plain `<span>`, which leaves exactly one h1 per page (every store route has its own). The footer shows `© CZABA`. The e2e `navLinks` are updated so they no longer skip silently. The doc 154 status is fixed.
- **Rulings (vetoable), recorded in the task and in D1:**
  - **R56:** Collections → `/store`. No collections route exists, and D14 is a later business decision.
  - **R57:** Gift Cards and Hire Us leave the header only.
  - **R58:** the footer uses `APP_NAME`.
  - **R59:** the wordmark is a non-heading `span`.
  - **R60:** the "Sign In" casing stays unchanged, because the auth block stays byte-identical. Owner: STORE-2.
- **Honesty about `/studio-lab`:** it stays demo-only and public. Its page title and the in-workspace demo badge (Studio-owned) still say so. The header label alone changes, as Saba approved.
- **Protection:** the Header auth block (lines 110-157 and 226-265) must be byte-identical. SCOPE-188 checks that there are no hunks there, and T1 N5 guards its behaviour. `root.tsx`, `app/styles/**` and the protected purchase and auth files stay frozen.

## Feature boundary and architecture
- Both reviewers said "keep". STORE-1c touches two small layout components, so no owner is accumulating risk.
- `b-round-183-checkpoint-request.md` is still unanswered, so fallback (c) continues. The next checkpoint point is the STORE-REDESIGN exit.

## Ableton
Not applicable (store pages).

## FB-01..FB-16 and remaining scope
- **FB table unchanged:** FB-03 and FB-15 are მზადაა. The others are მოწმდება, pending Tech Lead manual checks, which are not cloud-reproducible failures.
- **Remaining:** STORE-1c (round 188), the REGRESSION round, STORE-1d, STORE-2 to 5, REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, the deferred Lows (266), C-R186-01, the Tech Lead manual checks, the backend-only evidence and the final regression.
- The `awaiting_user` items stay recorded; they are not called deferred.
- **Out of scope, unchanged:** professional plugins and effects, pitch, multi-video layers, and audio stretch (grid tempo is not stretch).

## Not COMPLETE, not BLOCKED
Large scope remains, and nothing needs external input or credentials.

## Ready for commit (root)
- Round 187 is already published (`cb24362`).
- Round 188, on C PASS: the 4 grants, T1 and doc 155.
