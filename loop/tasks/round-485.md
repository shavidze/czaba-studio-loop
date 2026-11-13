# Round 485: CLIENT-NAV-CONTRACT. Announce the new page on client navigation, give the 6 title-less Store routes a title, and harden releaseLinkFocus (GATE479-M1-ROUTE-ANNOUNCE + 4 Lows)

**Planned by:** B, at the round 484 → 485 planning on 2026-11-13 (`b-round-484.md`, `b-round-484/checkpoint.md`).
- **Archive:** the round-484 task is archived as `tasks/round-484.md`, byte-equal to the dispatched task [K16].
- **Advisor:** available and consulted (`b-round-484.md`).
- **Decisions:** D-29z1723 … D-29z1726 (`backlog.json` v475, `decisions_log_b`).

## Read first
- **`lessons.md` in full.** Directly relevant here:
  - L1: hidden focusables;
  - L23: sweeps and full suite on the sketch;
  - L29/L56: claims;
  - L39: screen budget;
  - L47: first Tab and the announcement row;
  - L51: other speakers;
  - L52: asserts that can fail;
  - L58: sketch, mutants, review;
  - L59: progress.json.
- **L29 tagging scope:** §1 and the A command lines describe the sketch's contents (future code), not current code. They are pinned by K15 (byte equality with `b-round-484/sketch-485/`) and the patch sha256, not by separate tags. Facts about current code carry `[K#]`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` and the loop policy (speed rules, the 2026-10-23 bug gate, the cloud-runner section).
- **Claims:** run `bash b-round-484/claims-485.sh` (`ROOT=` and `LOOP=` can be overridden). The planning output is `b-round-484/claims-485-planning-output.txt`.
  - C runs it at C-SCOPE start and end. The output must equal the planning output, except for the deltas below. B generated the list from the script run on a sketch-applied scratch (`b-round-484/claims-485-sketch-output.txt`, diff `claims-485-sketch-delta.txt`), not by hand (L56):
    - **K2:** the granted paths of §2 appear;
    - **K5:** only `account.downloads.tsx api.subscribe.tsx sitemap[.]xml.tsx studio.$productId.tsx` remain;
    - **K3:** rc 1, with exactly those paths changed;
    - **K12:** shows `1` and `1`;
    - **K12b:** shows `1 1 1 1 1 1`;
    - **K13:** shows `1`;
    - **K15:** shows `13 of 13`;
    - **K18:** ids may move to the archive, but none may be `NOT-FOUND`;
    - **K20:** may differ by a mock you start.

## Baseline: HEAD `751e30e`, clean tree
- `gates/gate-round-481.json` is `published` at `751e30e`. Gates 482–484 are `skipped` ("no real changes"), and `gates/gate-round-484.json` has `head` `751e30e` [K1].
- At planning:
  - status empty [K2];
  - tracked tree manifest `b-round-484/r485-tree-sha256.txt`: 1,393 entries, rc 0 [K3];
  - protected files rc 0 [K4].
- A root-only commit after planning that leaves `git diff 751e30e HEAD -- app` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round
- **GATE479-M1-ROUTE-ANNOUNCE (Medium, gate reviewer):** since round 479, Store links are client-side `<Link>`s. A screen-reader user who follows one hears nothing about the new page; a full reload used to announce the title. This is the oldest open Medium the loop can fix, so it goes first under the 2026-10-23 bug gate.
- **The systemic task CLIENT-NAV-CONTRACT** (D-29z1704; `b-round-479/consult-tech-lead.md` §3 and §5) closes this Medium together with four deferred Lows that share its root cause:
  - GATE479-L2-TABINDEX-FINALLY;
  - A-R479-L1-TARGET-BLANK;
  - A-R479-L3-DEFAULTPREVENTED-UNTESTED;
  - A-R479-L2-SLOW-LOADER-FOCUS (closed by the doc).
- **Not in this round:** B-R479-LEADMAGNET-TIMER-CLIENT-NAV. It waits for Saba (`user-review/questions-retro-480.md` Q2, no answer) and stays deferred (L44).
- **Previous round:** REGRESSION-2026-11-13 closed (C rounds 482–484 PASS; round 484 browserVerified true). `regression-last.json` = 2026-11-13 / 484 [K19]; the next regression is due on or after 2026-11-16.
- **No Critical or High is open.** The other open Mediums are root-only, manual-only, `awaiting_user` or scheduled (`context/active-summary.md`).
- **Order after this round:** 486 B-R480-ORDER-CARD-KEYBOARD, then DPG-BUTTON-CLEANUP and the rest of DPG P1.

### Why the announcer lives in RouteTransition (B pre-run, L58)
- `app/root.tsx` is in `global_forbidden_files` (`backlog.json`). It renders `<Header>` only when the path is not `/studio*` [K7], so an announcer in Header would remount on every Studio → Store trip.
- `RouteTransition` wraps every route, Store and Studio alike [K7, K6], and stays mounted across Studio ↔ Store. It is loop-editable.
- **Rejected:** a "new page mounted" signal inside `PageTransition`. `PageTransition` keys its inner `motion.div` on `location.pathname` [K11], so the exiting wrapper re-keys and shows the new route. The new AnimatePresence child then does not mount until the *next* navigation (B's debug run: `b-round-484/probe/mount-signal-debug.txt`). The sketch uses a `pathname` effect instead.
- **Measured at HEAD** (`probe/head-1440.json`, `probe/head-1280.json`): after a client navigation to `/cart`, `/search`, `/account`, `/account/orders`, `/account/reset/x/y` or `/account/login`, `document.title` is `''`. These routes have no `meta` export [K5].
- **Why every route gets a title** (tech-lead review v1, High; `b-round-484/sketch-review.md`): an h1-only fallback reads the `account.tsx` layout heading "Account" [K21] first on `/account/orders` and `/account/reset/*`, so those pages would be announced as "Account". A missing `<title>` also fails WCAG 2.4.2 (Page Titled) on its own.
  - The sketch therefore adds `meta` to the 6 loop-editable title-less routes. Each title is the page's own h1 text plus ` | CZABA`.
  - The h1 fallback stays as a safety net.
  - `account.downloads.tsx` is protected: it inherits "Account | CZABA" from its parent route. This is recorded, not changed.

## Reference: how others do it
| Point | Reference (source) | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| Announce client navigation | Next.js docs, "Accessibility → Route Announcements" (https://nextjs.org/docs/architecture/accessibility, lastUpdated 2024-11-06, read 2026-11-13) | "Next.js includes a route announcer by default" for client-side transitions | Same: announce on every client pathname change | RA-BROWSER |
| Source order of the name | same section | "first inspecting `document.title`, then the `<h1>` element, and finally the URL pathname"; "ensure that each page in your application has a unique and descriptive title" | title → page `h1` → nothing; every loop-editable Store route now has a title. **Deviation:** no raw-pathname fallback, because a spoken "/account/login" is not a page name | RA-BROWSER, RA-TITLES, RA3, RA9 |
| Initial load | same section: "screen readers … announce the page title when the page loads" | the browser announces a full load itself | Silent on the first render (no double announcement) | RA-INITIAL |
| Live-region politeness | Next.js (not stated on that page) | — | `aria-live="polite"`, `aria-atomic="true"`, visually hidden (`sr-only`), no `role`. **Deviation note:** polite does not cut off speech already in progress. No `role="status"`, so existing `getByRole('status')` queries are unaffected [K10] | RA-ATTRS |
| Ableton | not applicable (Store navigation) | — | — | — |

No Ableton parity claim. `product-designer` was not consulted: this is a Medium bug fix with no visible change (the policy exempts fix-ups), and the screen budget is unchanged (§4, RA-VISUAL).

## 1. What changes (sketch `b-round-484/sketch-485.patch.txt`, sha256 in `b-round-484/sketch-485.sha256`)
A applies the sketch with `git apply b-round-484/sketch-485.patch.txt` from `store/`, then writes the doc (§2). Byte-equal application is the expected result. A may change sketch lines only to fix a Medium+ finding from its own code-reviewer that is not ruled in §5; such a change is listed old → new.

1. **`app/components/animations/RouteAnnouncer.tsx` (new):** `RouteAnnouncer({ message })` renders `<div aria-live="polite" aria-atomic="true" className="sr-only" data-route-announcer="">`.
   - **`app/lib/route-name.ts` (new):** `readRouteName(doc)` returns the trimmed `document.title`, else the trimmed text of the first `.page-transition-wrapper h1`, else `''`.
   - **Route titles:** `export const meta: MetaFunction = () => [{ title: … }]` is added to these routes:
     - `app/routes/cart.tsx`: "Your Collection \| CZABA";
     - `app/routes/search.tsx`: "Search \| CZABA";
     - `app/routes/account.tsx`: "Account \| CZABA";
     - `app/routes/account_.login.tsx`: "Sign In \| CZABA";
     - `app/routes/account.orders.tsx`: "My Orders \| CZABA";
     - `app/routes/account.reset.$id.$token.tsx`: "Reset Your Password \| CZABA".

     Biome warnings in these 6 files: 14 before and 14 after.
2. **`app/components/animations/RouteTransition.tsx`:**
   - Renders one `<RouteAnnouncer>` before the page wrapper in both branches (Studio and Store).
   - A `useEffect` on `pathname` handles the announcement:
     - the first run only records the path (silent);
     - the same path is ignored;
     - a new path schedules one `requestAnimationFrame` that reads `readRouteName(document)`, and the cleanup cancels a pending frame.
   - If the name equals the current text, it appends `REPEAT_MARK` (U+00A0, built with `String.fromCharCode(160)`) so that the region text changes. A third identical name drops the mark again.
3. **`app/lib/link-focus.ts`:**
   - `releaseLinkFocus` now returns early for an anchor whose `target` is set to anything other than `''`/`_self`, or that has `download`.
   - The temporary body `tabindex` is removed in a `finally`.
   - `reloadDocument` is **ruled out of scope**: it is a React Router prop and leaves no DOM attribute, and no call site uses it [K8]. A full reload resets focus anyway.
4. **Tests:**
   - `app/components/animations/__tests__/route-transition.test.tsx`: RA1–RA9 added; RT1–RT4 unchanged.
     - RA4 asserts the exact repeat text.
     - RA6 asserts that the same region node survives Studio → Store → Studio.
     - RA9 drives the Store branch through `createMemoryRouter` with an empty title.
   - `app/lib/__tests__/route-name.test.ts` (new): RN1–RN3.
   - `app/lib/__tests__/link-focus.test.tsx`: LF4–LF7 added; LF1–LF3 unchanged.

## 2. A: grants, forbidden, checks
- **Granted paths (only these):**
  - the 13 sketch files (the paths listed in §1; `git apply` creates the 3 new ones);
  - `docs/implementation/2026/quarter-IV/313-client-nav-contract.md` (new; Georgian, `docs/implementation/TEMPLATE.md` sections) [K13].
- **The doc must contain:**
  - the route-announcer contract (sources in order, polite/atomic, silent first render, repeat mark, Studio ↔ Store);
  - the rejected mount-signal approach and why;
  - the `reloadDocument` ruling;
  - a TODO: `account.downloads.tsx` (protected) inherits "Account | CZABA". Root should add `title: 'My Downloads | CZABA'` (B-R485-DOWNLOADS-TITLE, ROOT-REQ-DOWNLOADS-TITLE);
  - **the slow-loader note (closes A-R479-L2-SLOW-LOADER-FOCUS).** Focus moves to `<body>` at click time. If a loader is slow or fails, focus stays on `<body>` on the old page, and the next Tab starts from the top of the document. This is accepted (same as a full reload).
- **Forbidden:**
  - `global_forbidden_files` (including `app/root.tsx`, `app/styles/**`) and `global_forbidden_actions`;
  - the protected files;
  - Header.tsx, PageTransition.tsx, LeadMagnetPopup.tsx;
  - commit, push, stash, checkout, deploy;
  - restarting the :5173 dev server.
- **STOP threshold (this is the only statement of it; L10):** STOP and report if you hit any of these:
  - a Medium+ finding (your code-reviewer, or a failing covering test) that §5 does not rule;
  - any need to touch a path outside the grants.
- **A runs:**
  - `npm run typecheck`;
  - `npm run lint`;
  - `npx vitest run app/components/animations/__tests__/route-transition.test.tsx app/lib/__tests__/link-focus.test.tsx app/lib/__tests__/store-internal-links.test.ts app/lib/__tests__/route-name.test.ts app/lib/__tests__/account-orders-empty-state.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts` (the last three scan the changed route files). B's sketch run gives 7 files and 93 tests passed (`b-round-484/sketch-covering.log`; tsc rc 0 in `sketch-tsc.log`; Biome 14 → 14 warnings in `sketch-biome.log`).
  - A also asks the code-reviewer (3+ files).
- **A does not run** the full suite: B already ran it on the sketch (`b-round-484/precheck-full.log`: 291 files, 4,259 tests, rc 0), and the gate runs it again.
- **Report in `a-round-485.md`:**
  - start HEAD;
  - `git apply` output;
  - `cmp` of each sketch file against `b-round-484/sketch-485/`;
  - the commands, with their pass counts;
  - the reviewer findings and Architecture note.

## 3. C: rows (both viewports, 1440×900 and 1280×720, unless stated otherwise)
Probe base: `b-round-484/probe/announce-probe.mjs <base> <out.json> [w h]`.
- **B's evidence for the expected values:** sketch `probe/sketch-final-1440.json` and `probe/sketch-final-1280.json`; HEAD `probe/head-1440.json` and `probe/head-1280.json`.
- **Probe setup:** the probe seeds the LeadMagnet as dismissed (L1), so its auto-open does not speak during the run. It drives navigation through `window.__remixRouter.navigate` and one real footer click.
- **Before any row:** warm `/studio-lab` and `/` in a browser first (cold dev server, L38). A run that coincides with a Vite `page reload` line is environment-invalid, and its replacement counts against the budget (B saw two such silent steps while editing; none in the clean runs).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE | claims at start and end, plus K17 | output equals the planning output except the deltas listed in "Read first"; K17 `L58 OK` |
| C-APPLY | the 13 sketch files equal `b-round-484/sketch-485/` (K15 `13 of 13`), or A's listed changes are each justified by a reviewer Medium+ | — |
| RA-ATTRS | on `/`: exactly one `[data-route-announcer]`, `aria-live=polite`, `aria-atomic=true`, no `role`, class `sr-only`, box 1×1 | as in `sketch-final-*.json` `steps[0].announcer` |
| RA-INITIAL | full load of `/` and of `/studio-lab` (after `Demo collection ready`) | region text `''`, and no MutationObserver text other than `''` |
| RA-BROWSER | client navigation `/`→`/faq`→`/cart`→`/search`→`/account`→`/account/orders`→`/account/reset/x/y`→`/account/login`→`/support`→`/support`→`/store`→`/about` | region text equals the `announcer.text` of each step in `sketch-final-*.json` (the region is unchanged on the repeated `/support`), and every step's region text equals that step's `document.title` |
| RA-TITLES | full load (`probe/extra` `fullLoadTitles`) and client navigation (RA-BROWSER) of the 6 routes in §1 | `document.title` is the §1 title (HEAD `''`); the region stays `''` on a full load; `/account/orders` and `/account/reset/x/y` announce their own title, not "Account" |
| RA-STUDIO | `/faq` → `/studio-lab` (client), then the Studio "CZABA" exit link [K21] click → `/` | `CZABA Studio — Demo collection`, then `CZABA \| Premium Cinematic Sound Design`; one region throughout |
| RA-TAB (L47) | footer "FAQ" click, then one Tab | region `FAQ \| CZABA`; `document.activeElement` is the header "CZABA" logo link, `:focus-visible` true, outline `solid 1px` brass at 0.8 (`probe/extra/*-*.json` `firstTab`, identical at HEAD and on the sketch) |
| RA-REPEAT | anonymous client nav `/` → `/account` → `/account/downloads` → `/account` → `/faq` (`b-round-484/probe/repeat-probe.mjs`; B's sketch run `probe/repeat-sketch.json`) | `Account \| CZABA` + U+00A0 (last char code 160) on `/account/downloads`, then `Account \| CZABA`, then `FAQ \| CZABA`; jsdom RA4 is the unit contract |
| RA-SPEAKERS (L51) | `grep -rnE 'role="alert"\|aria-live=' app/components app/routes --include=*.tsx \| grep -v __tests__` after A | equals `b-round-484/speakers-head.txt` (20 lines at HEAD) plus the one `RouteAnnouncer.tsx` line, with line numbers shifted only in the 6 route files. LeadMagnet (`role="alert"` [K21]) is separate and its timer behaviour is unchanged (B-R479-LEADMAGNET-TIMER stays with Saba) |
| RA-VISUAL (L1, L39) | `b-round-484/probe/extra-probe.mjs <base> <label> <outdir> w h` on `/` and `/faq`: screenshots, the first 14 Tab stops, `scrollWidth`/`scrollHeight`, `innerText` length | equal to B's HEAD capture (`probe/extra/head-*.json` and `*.png`, taken on :5173 at 751e30e); B's sketch run equals HEAD on every field (`probe/extra/sketch-*.json`); the region is never a Tab stop |
| STUDIO-485 | same probe: direct `/studio-lab` load after `Demo collection ready`; wrapper and header boxes, scroll sizes, one region; Space on the empty demo project | boxes and sizes equal `head-*.json`; status text after Space equal to HEAD ("Nothing to play — add a clip from the library first."); `announcerCount` 1 (HEAD 0) |
| LF-RUNTIME | jsdom LF4–LF7, RA1–RA9 and RN1–RN3 pass, and each mutant in `b-round-484/mutants/red-rows.txt` is red on its row when re-run with `python3 -I b-round-484/mutants.py <out>` from a scratch copy that has the sketch applied (never from `store/`) | every row matches `red-rows.txt` |
| LF-FOOTER (browser) | a plain click on a footer link still moves focus to `<body>`, and Ctrl+click keeps focus on the link (HEAD behaviour) | `afterPlainClick` BODY and `afterCtrlClick` A "Support", with no body `tabindex`; equal to `probe/extra/head-*.json` |
| G485-AUTH | `/studio-lab` opens anonymously (workspace + badge, `auth_user` null); `/studio/middle-east` shows "Sign in required", 0 `audio[src]` | as in round 484 G484-AUTH |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS | root gate only; never in `passed` |

## 4. Rulings (L4, L10)
- **Screen budget (L39):** the region is `sr-only`, so persistent visible text does not grow. RA-VISUAL is the row. Browser tab titles change on the 6 routes; that is not page text.
- **Tech-lead review v1, Low 5** (a `docs/technical` note): doc 313 is the record (the project rule puts implementation docs under `docs/implementation`). No separate file.
- **Tech-lead review v1, Low 8** (link-focus bundled): it stays. The systemic task CLIENT-NAV-CONTRACT is defined to close those three Lows (D-29z1704), and root decides commit boundaries.
- **Anonymous `/account/*`:** the page shows "Sign in required" while the title names the route (for example "My Orders \| CZABA"). This is accepted: the title names where the user is.
- **Query or hash navigation** (same pathname, for example `/search?q=x`): silent, because the page did not change. B's inference only: the Next.js page does not say how it treats query changes. Rows: RA5 (jsdom) and the RA-BROWSER `/support` → `/support` step.
- **Store → Studio:** now announced (the region lives in RouteTransition). This is a gain over the consult's "not on /studio*".
  - No other element carries the route-announcer marker [K9].
  - Studio's own status line is not a route announcer, and on a direct load it shows the same text at HEAD and on the sketch (STUDIO-485).
- **Perf:** `load.components` on the fresh `/studio-lab` load is a `record` row with no budget [K22].
  - The region adds at most one fiber to the first commit and no commit of its own: the first effect run has no `setState`.
  - No `perf/` or `e2e/` file references the wrapper, RouteTransition or the marker [K22: 0].
  - No `e2e/` or `perf/` text locator matches the new titles (B's grep: 0 hits).
- **"RA-BROWSER exact text" vs "the title may contain an en dash":** the probe JSON wins. C compares strings from the JSON, not hand-typed ones.
- **The repeat mark:** a trailing U+00A0 in the region text is allowed. C compares with `trim()` only in RA-REPEAT; everywhere else, exact.

## 5. Sketch review (L58)
- `b-round-484/sketch-review.md` names the dispatched sha256 and records `tech-lead`'s verdict and B's ruling on each finding.
- **Mutants:** 12 (M1–M11, M2b), `b-round-484/mutants/` (logs and `red-rows.txt`). They run from a sketch-applied scratch, never from `store/`.
- **Review rounds:** v1 `sketch-485-v1.patch.txt` got REQUEST CHANGES. The dispatched v2 `sketch-485.patch.txt` got a delta re-review; both shas are in `sketch-review.md`.

## 6. Outcome fixed in advance
- **C PASS with browserVerified true:**
  - GATE479-M1-ROUTE-ANNOUNCE → done for the live-region contract. Its screen-reader half becomes the Tech Lead row TLM-R485-SR-ROUTE-ANNOUNCE: NVDA/VoiceOver hear the title after a footer click. Deadline RETRO 495 (L46); it does not block.
  - The four Lows close.
  - Round 486 = B-R480-ORDER-CARD-KEYBOARD.
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes.
