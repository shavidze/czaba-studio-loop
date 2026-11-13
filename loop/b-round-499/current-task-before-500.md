# Round 499: DPG-BUTTON-CLEANUP-2, stage 2b-1. Empty-state and error-state CTAs move to `Button` / `buildButtonClassName`

**Planned by:** B, at the round 498 → 499 planning on 2026-11-13 (`b-round-498.md`).
- **Advisor:** available, consulted after orientation and at the closing check.
- **Archive:** the round-498 task is archived as `tasks/round-498.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v492, `decisions_log_b`)
- **D-29z1787: round 498 accepted.** C PASS with `browserVerified` and `realVerified` true (C0–C13). Gate 498 published `82e118a` to both remotes. **DPG-BUTTON-CLEANUP-2 stage 2a is C-verified.** The item stays open for 2b–2e, NONBRAND and the DP gate.
- **D-29z1788: gate 498 review and A's "For B".**
  - GATE498-L1-BUILDER-NO-FOCUS ("the builder has no focus-visible style") is **not reproduced**. C round 498 C3 measured a keyboard ring: `:focus-visible` true, 1 px solid brass at 0.8, offset 2 px. B measured the same ring on all 10 targets of this round (`b-round-498/measure/summary.txt`). It comes from the global `:focus-visible` rule. Closed; no builder ring is scheduled.
  - GATE498-L2-BARREL-IMPORT → `deferred_low_polish`. Build verify passed. This round's `EmptyState` imports `./Button` directly (a barrel import inside `ui/` would cycle).
  - GATE498-L3 (literal oracles are brittle) → `confirmedBy` on A-R498-TL-B2-2-TIMER-PIN's class (intended literal pins). GATE498-L4 (icons are aria-hidden) → info, closed.
  - The gate's Architecture note → `confirmedBy` on SIG-R498-BUTTONLINK-WRAPPER (L7). Re-evaluate after 2b at about 15 call sites. **No checkpoint request:** the change is small and has one owner.
  - **A-R498 For B #1** (doc 320 l.4 lacks the L28 form) → **fixed in this sketch**: l.4 becomes `In Progress (stage 2a of DPG-BUTTON-CLEANUP-2; C round 498 PASS)`. It is recorded as a B spec gap, B-R498-DOC320-L28 (Low, origin B spec, closes with C11). This is the second occurrence after B-R455-DOC298-STATUS-LINE; RETRO 510 counts it.
  - A's reviewer Lows (A-R498-CR-ST5-EXACT-COUNT, A-R498-CR-B2-5-LITERAL-FORMS, A-R498-CR-ICON-ASSERT, A-R498-CR-DS-L1112) → `deferred_low_polish`. This round's B2B-5 also scans `{'…'}` and template literals, and B2B-3 asserts the icons. Both are partial answers, so the ids stay open.
- **D-29z1789: stage 2b split, rulings and this round's scope.**
  - 2b becomes **2b-1** (this round): `EmptyState`, `ErrorDisplay` ("Try Again" and "Go Home") and the `/store` error "Try again". These are empty and error states, they share one rule, and every one of them renders in the cloud browser (`b-round-498/probe/`).
  - **2b-2** is the `<button>` and submit sites: free-downloads "Download", NewsletterSection submit, and hire-us submit (ST5 pin). **2b-3** is the small and section CTAs: recordings "Create a scene" (`min-h-11` sm), cart (sm, `text-black`) and StudioShowcase. B may regroup 2b-2 and 2b-3 at their planning.
  - The tech-lead Medium on doc 321 is ruled: the prose stays A's job, and the status line keeps the L28 post-PASS form (`b-round-498/sketch-review.md` item 1).
  - New pre-existing finding **B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML** (Low). `root.tsx` exports `Layout` [K8], and `RootErrorBoundary` renders its own `<html>` inside Layout's body. The browser logs `validateDOMNesting … <html> cannot appear as a child of <body>` (`b-round-498/measure/sketch/sketch-on.json`, ROOT-ERR rows). It is deferred, not in this round.
- **D-29z1790: consults and the sketch.**
  - product-designer: EmptyState primary → primary/lg/pill and secondary → ghost/lg/pill; its `<button>` branches → `<Button type="button">`. ErrorDisplay "Try Again" → primary/lg/pill and "Go Home" → ghost/lg/pill, with the order unchanged. `/store` "Try again" → primary/lg/pill (`b-round-498/consult-product-designer.md`).
  - D-29z1791 (advisor closing check): the corrections listed in `b-round-498.md`.
  - Two copy questions go to Saba, non-blocking with defaults: SABA-Q-499-BUTTON-CASE and SABA-Q-499-ERROR-EMPHASIS (`user-review/questions-round-499.md`).
  - tech-lead v1: APPROVE-WITH-CHANGES. Item 3 (`ReactElement`) is applied in v2 and item 1 is ruled. The v2 delta review returned **APPROVE** and accepted the item-1 ruling (`b-round-498/sketch-review.md`).

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4, L7, L10, L23, L28, L29, L36, L47, L54, L56, L57 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch (doc 321 prose excepted).
- **Ruling lines (L4):**
  - Error-page emphasis: the product-designer ruling (Try Again primary, Go Home ghost) wins over HEAD's secondary Try Again. No position moves. SABA-Q-499-ERROR-EMPHASIS can reverse it later.
  - `EmptyState`'s secondary becomes ghost, losing its border and `bg-elevated`. The DESIGN_SYSTEM ghost rule ("a paired secondary is ghost lg pill") wins over the old bordered look.
  - The 404 "Browse Store" stays a text link (PD-R498-404-SECONDARY-ALIGN). It is not touched.
  - `account.downloads.tsx` is protected and is **not edited**. Its empty state changes look only because it renders the shared `EmptyState`. Its href stays `/music` (ROOT-REQ-DOWNLOADS-MUSIC-LINK, open).
- **Pre-ruled Lows:** a re-raise is listed "For B" and is not a STOP.
  - #1 links have no `:active` scale (SIG-R496-LINK-NO-PRESS-SCALE);
  - #2 no `ButtonLink` wrapper yet (SIG-R498-BUTTONLINK-WRAPPER);
  - #3 the literal oracles `PRIMARY_LG_PILL` and `GHOST_LG_PILL` are deliberately duplicated from 2a;
  - #4 `EmptyState`'s `<button>` branches have no caller today. They are kept as component API (product-designer Q3) and are tested by B2B-2. The 2026-11-10 legacy-removal policy points the other way, but these are props, not exports, and removing them changes the public API. The decision is recorded as B-R499-EMPTYSTATE-ONACTION-UNUSED (D-29z1791);
  - #5 the ghost hover fill is faint on the page background (elevated against background 1.12:1; text contrast 13.94). It is the same ghost as 2a; DPG-COLOR-CONSOLIDATE owns it (PD-R499-GHOST-HOVER-FAINT);
  - #6 after a Remix client navigation `document.activeElement` is BODY, the same as HEAD and 2a (C6 oracle).
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.
- **Out of scope:** Studio (`/studio-lab`) and the Ableton check. This is a Store round.
- **Persistent screen text (L39):** nothing is added. Existing buttons are restyled only.
- **Purchase protection:** no auth, cart, checkout or download logic changes. The protected manifest stays rc 0 (check 2). C keeps the anonymous `/studio/<id>` "Sign in required" row.

## Baseline: HEAD `82e118a` [K1] (gate 498 `commit`), clean worktree
Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-498/r499-tree-sha256.txt`: every tracked file outside the five granted existing paths (1,404 files).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files, `account.downloads.tsx` included.
3. Before applying: `b-round-498/r499-pre-sha.txt` (`ErrorBoundary.tsx`, `EmptyState.tsx`, `store.tsx`, DESIGN_SYSTEM.md and doc 320, at HEAD).
4. After applying: `b-round-498/r499-post-sketch-sha.txt` (those five and the new test, as in the sketch). Doc 321 is not in it, because A's prose changes it. A re-runs checks 1, 2 and 4 after writing the prose; all stay rc 0.

## 0. Why this round
- **Saba's DPG-FIX P1 item 7:** "Use Button.tsx component only." Stage 2a moved the status pages. 2b-1 moves the shared empty state and the error pages, which buyers see on an empty cart, on a recordings page they cannot open, and when something fails.
- **Scanner at HEAD:** 116 hits, 48 solid [K11] (`b-round-498/scan-head.txt`). On the sketch: 109 / 44 (`scan-sketch.txt`).
- **REGRESSION is not due.** The last one was 2026-11-13; the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference: how the Store references do it
- **Source:** the stage-1 and 2a reference (`tasks/round-496.md` §1 and `tasks/round-498.md` §1: direction A "a brass pill"; Artlist and Epidemic pill CTAs; `docs/technical/store-redesign/research/`). This round's product-designer consult: `b-round-498/consult-product-designer.md`.
- **Behaviour:** one filled brass pill per state for the main action, which on error pages is the recovery action. A paired secondary or exit action is a quiet ghost pill of the same height. Links stay links, plain anchors stay plain anchors, and buttons become the real `Button`.
- **Deviations (listed, each with a reason):**
  - D1: all ten targets go from 50 (52 with a border) to 48 px tall, and the radius goes from 8/12 px to 9999 px. Weight goes from 400/500 to 600. Reason: the stage-1 lg pill.
  - D2: `EmptyState`'s secondary goes from bordered `bg-elevated` with `text-foreground` to ghost (transparent, `text-muted`; contrast 7.06). Reason: one secondary concept.
  - D3: the error page's "Try Again" goes from secondary to primary, and "Go Home" goes from brass with `text-black` to ghost. Reason: recovery is the main action (product-designer Q4).
  - D4: `/store` "Try again" goes from `inline-block px-5` with no hover to `inline-flex px-6` with a hover. Its width goes from 107 to 117. Reason: drift removed.
  - Not a deviation: copy, icons, hrefs, element types (`Link`, plain `<a>`, `button`) and the order of each pair stay as they are.

## 2. What changes: sketch `b-round-498/sketch-499.patch.txt`
sha256 `9fceab802652468b4545d450f3cf25cada33ab428d3e39e01e58579cee414daf`, the line in `b-round-498/sketch-sha.txt`.

| Site (HEAD) | HEAD | Sketch |
|---|---|---|
| `app/components/ui/EmptyState.tsx` primary `Link` + `<button>` [K2] | `px-6 py-3 bg-brand text-background rounded-lg font-medium hover:bg-brand/90 …` | `Link`: `buildButtonClassName({ size: 'lg', shape: 'pill' })`; `<button>` → `<Button type="button" size="lg" shape="pill" onClick={onAction}>` |
| same file, secondary `Link` + `<button>` [K3] | `px-6 py-3 bg-elevated text-foreground rounded-lg … border border-outline` | ghost lg pill (`buildButtonClassName` / `<Button type="button" variant="ghost" …>`) |
| `app/components/errors/ErrorBoundary.tsx` `ErrorDisplay` "Try Again" [K4] | `<Button variant="secondary" size="lg" …>` | `<Button size="lg" shape="pill" …>` (primary) |
| same, "Go Home" `<a href="/">` [K4] | `… bg-brand hover:bg-brand/90 text-black font-medium rounded-lg …` | ghost lg pill via `buildButtonClassName`; stays a plain `<a>` |
| `app/routes/store.tsx` error "Try again" `<Link to="/store">` [K5] | `inline-block rounded-lg bg-brand px-5 py-3 text-background` | primary lg pill via `buildButtonClassName` |

`EmptyState` imports `./Button` (not the barrel, to avoid a cycle; tech-lead item 2). After the sketch, the builder calls are 2 + 1 + 1 [K6] (`b-round-498/builder-calls-sketch.txt`).

**Tests and docs in the sketch:**
- **New** `app/lib/__tests__/store-button-cleanup-2b.test.tsx`:
  - B2B-0: the literal oracles equal the builder output.
  - B2B-1: `EmptyState`'s link pair has the exact hrefs and classes, with no button.
  - B2B-2: `EmptyState`'s button pair has the exact classes, `type="button"`, and one call per click.
  - B2B-3: the root error page has one "Try Again" primary pill and one "Go Home" ghost pill. Go Home has `href="/"` and no `data-discover`; each has one icon. The test renders through `createMemoryRouter` with `hydrationData.errors` and `renderToString`.
  - B2B-4: the route error page has one "Try Again" primary pill and no anchor.
  - B2B-5: each of the three action blocks calls the builder and has no `bg-brand`, `bg-elevated`, `text-black` or `rounded-lg` literal (`"…"`, `{'…'}` and template forms).
- **`docs/design/DESIGN_SYSTEM.md` `### Buttons`:** two hunks. The pill usage row [K13] gains the EmptyState actions, the error page's "Try Again" and `/store`'s "Try again". The Ghost "Use for" line gains the EmptyState secondary and "Go Home" rule.
- **Doc 320 l.4** → `**სტატუსი:** In Progress (stage 2a of DPG-BUTTON-CLEANUP-2; C round 498 PASS)` (D-29z1788).
- **`docs/implementation/2026/quarter-IV/321-dpg-button-cleanup-stage-2b-1.md`:** a skeleton with the 7 TEMPLATE headings. Its status line is final (L28): `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 499 PASS)`. A writes the prose.

**Name and locator sweep (L23)** [K10]. At HEAD, the names and module paths hit:
- `store-button-cleanup.test.tsx` (BC: the Hero "Discover the Collection", not EmptyState; unaffected);
- `product-handle-route.test.tsx` (mocks `~/components/errors`; unaffected);
- `product-price-cards.test.tsx` (same mock);
- e2e `homepage.spec.ts`, `navigation.spec.ts` (the Hero "Discover the Collection" `a[href="/store"]`);
- e2e `agent-system-smoke.spec.ts` (empty cart "Discover the Collection": visible plus href `/store`; the sketch keeps both);
- e2e `cart-page.spec.ts` (empty state visible).

No test pins an EmptyState, ErrorDisplay or `/store` error class. The covering set is `b-round-498/covering-files.txt`: 14 files, the scanners and theme/focus tests among them.

## 3. A: what to implement
1. From `store/`, run frozen checks 1–3 (rc 0), then `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-498/sketch-499.patch.txt`, then check 4 (rc 0).
2. **Grants:** the sketch paths only:
   - the 3 code files;
   - the new test;
   - DESIGN_SYSTEM.md (sketch hunks only);
   - doc 320 (l.4 only, as in the sketch);
   - doc 321 prose.

   **Doc 321 content:**
   - Georgian prose with English terms in its 7 sections. The status line stays as the sketch has it (L28).
   - It records the 10 browser targets, deviations D1–D4 and the product-designer rulings, including the two Saba copy questions.
   - It records the reach recipes from `b-round-498/probe/reach.mjs`: mock off for `/store`; the L36 stubs for recordings and downloads; a malformed catalog for the root error page.
   - It records the evidence (B's files under `b-round-498/`), B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML under TODO, and the remaining sub-stages 2b-2, 2b-3, 2c, 2d, 2e and NONBRAND.

   **Doc 321 rules:**
   - Every number names its log (L26, L56).
   - Every backtick-quoted class token already occurs under `app/` or `docs/` at HEAD `82e118a`. C greps each one.
3. **Run** (logs under `a-round-499/`):
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-498/covering-files.txt)`. Expect 14 files and 137 tests (B: `b-round-498/precheck-covering.log`);
   - the code-reviewer on the diff (3+ files).

   Not the full suite: B ran it on the sketch (`precheck-full.log`).
4. Write `a-round-499.md`, with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-499.md`, `c-round-499.json` and `c-round-499/progress.json` as it goes, browser rows first.

**Environment and harness:**
- **Mock API:** start it with `node mock-api/server.mjs` from the loop folder for the `MOCK=on` runs. Stop it **by exact PID** for the `MOCK=off` run (`ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`). If that prints nothing because the mock was started with other arguments, use the port: `ss -ltnp 'sport = :5199'` and kill the pid it shows. Confirm with `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/__mock/health`, which should print `000`. Never `pkill -f`: it kills the calling shell (B saw rc 144).
- **Stubs and init script:** the harness sets `localStorage.czaba_lead_magnet_dismissed`. It stubs the L36 recipe: `auth_user` with a stub token; `/api/auth/profile` and `/api/downloads` with the `{success,data}` envelope plus CORS; and `/api/products/1/recordings` set per state. The root error page is reached with a catalog that has no `licenseType`, which crashes the route into `RootErrorBoundary`. This is a harness recipe, not a product bug [K9].
- **Warm-up:** warm each page once. B's first cold pass missed two targets at 1440, and the warm re-run was complete.
- **Harness:** `MOCK=on BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-498/measure/measure-499.mjs <c-round-499/after> after`, then `MOCK=off …` (same args). Oracles: `b-round-498/measure/head/head-{on,off}.json` (HEAD) and `sketch/sketch-{on,off}.json` (B's sketch server). The comparison is in `measure/summary.txt`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | Exactly the sketch paths: 5 modified (`ErrorBoundary.tsx`, `EmptyState.tsx`, `store.tsx`, DESIGN_SYSTEM.md, doc 320) and 2 new (the test, doc 321). Checks 1, 2 and 4 rc 0 |
| C1 | REST (browser, 1440×900, 1280×720, 375×812) | The 10 targets in `measure-499.mjs`: `/store` error "Try again"; empty cart; recordings denied (primary + ghost), not-found and empty; downloads empty (protected route, unedited); root error "Try Again" + "Go Home"; route error "Try Again" | Primary: bg `rgb(201, 164, 106)`, text `rgb(14, 13, 12)`. Ghost: bg `rgba(0, 0, 0, 0)`, text `rgb(163, 155, 142)`. All: radius `9999px`, height 48, 16px / 600, padding 12px 24px, tag as in `sketch-*.json` (`A` or `BUTTON`). Boxes equal `sketch-{on,off}.json` ±1 px |
| C2 | HOVER (same viewports) | Hover each target | Primary bg `rgb(217, 184, 127)`. Ghost bg `rgb(29, 26, 23)`, text `rgb(236, 230, 218)` |
| C3 | FOCUS (1440 + 1280) | Keyboard Tab to each target; mouse press (the harness `press` field) | Keyboard: `:focus-visible` true, outline solid 1px, offset 2px, and a ring visible in the `*-focus-*.png` crops (view at least 4). Press: `:focus-visible` false, outline `none` (B measured this on all 10; `assert`) |
| C4 | STACK (375×812) | Recordings-denied pair and root-error pair; screenshots `*-pair-375.png` | Denied: both 179×48, stacked, same width (not ragged). Root error: both 343×48, stacked. Labels on one line; pills not clipped |
| C5 | CONTRAST | `restContrast` / `hoverContrast` in the harness JSON | Primary rest 8.32, ghost rest 7.06, all hover ≥ 10.28 (each ≥ 4.5). A failure is a Medium finding |
| C6 | NAV (1440) | `MOCK=on …/nav-499.mjs <c-round-499/after> after`, then `MOCK=off` (Tab to each control, Enter) | Each row's `finalPath` and `fullDocumentLoad` equal `b-round-498/measure/head/head-nav-{on,off}.json`. Cart → `/store` (client); denied → `/account/downloads` and `/store` (client); root "Try Again" → reload; "Go Home" → `/` (full load); route "Try Again" → reload; `/store` "Try again" → `/store`. `activeElement` is recorded |
| C7 | JOURNEY (L54, 1440) | The `MOCK=on` nav script's journey: `/cart` (empty) → "Discover the Collection" → `/store` → back | Paths `/cart`, `/store`, `/cart` as in `head-nav-on.json`. One screenshot per step (`after-j1..3.png`). No console error in the journey (HEAD has 0) |
| C8 | GREP | `python3 -I b-round-497/scan-brand.py . /tmp/s.json` from `store/`; `grep -c 'buildButtonClassName('` on the 3 code files | `109 hits; 44 solid` (`scan-sketch.txt`); calls 2, 1, 1 (`builder-calls-sketch.txt`) |
| C9 | TESTS | `npx vitest run $(cat …/b-round-498/covering-files.txt)` | 14 files, 137/137 pass |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules` and `.git`) to a folder outside `store/`, `git init`, commit, symlink `node_modules`; then `bash b-round-498/mutants-499.sh <copy>` | N1–N9 all RED, each on the rows in `b-round-498/mutants-499-failing-rows.txt` |
| C11 | DOCS | `git diff docs/design/DESIGN_SYSTEM.md docs/implementation/2026/quarter-IV/320-dpg-button-cleanup-stage-2a.md`; doc 321 | DESIGN_SYSTEM: hunks only in the pill row and the Ghost "Use for" line, equal to the sketch. Doc 320: only l.4, equal to the sketch. Doc 321: the 7 headings (L26 subsequence) and l.4 byte-equal to `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 499 PASS)`. Every number traces to a log. Every backtick-quoted class token is found under `app/` or `docs/` at `82e118a` (`git grep -F <token> 82e118a -- app docs`) |
| C12 | CLAIMS | `bash b-round-498/claims-499.sh` (default tree) compared with `b-round-498/claims-499-sketch-output.txt` | No `MISSING`. Output identical, except K1 (HEAD may move to the loop-state commit) and K16 locations (archive moves) |
| C13 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` each show "Sign in required" and no download link (premium not bypassed). `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-499.json c-round-499/l57-check.txt` | As C0; rc 0. `c-round-499.json` carries every L57 field: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Neighbours that could break:**
  - the stage-1/2a sites (frozen; C0 covers them);
  - the cart e2e smoke (`agent-system-smoke.spec.ts`: "Discover the Collection" visible, href `/store`; C1/C6 cover it);
  - the protected downloads empty state (C1 DOWNLOADS-EMPTY: its href stays `/music`);
  - the route error page on `/products/<missing>` (C1/C6 ROUTE-ERR-TRY).
- **L22:** if A STOPs, C runs C0, C12 and C14 only.
- **Bugs:** every bug carries an enum `origin` (L57).
- **Closing:** with C PASS and `browserVerified` true, DPG-BUTTON-CLEANUP-2 stage 2b-1 is verified and B-R498-DOC320-L28 closes. The item stays open for 2b-2, 2b-3, 2c–2e, NONBRAND and the DP gate.

## 5. B's pre-check (on scratch copies of HEAD + sketch outside `store/`; they do not survive the job, and the logs below are the evidence)
| Check | Result | Log |
|---|---|---|
| Biome on the 4 code/test files, tsc | rc 0 (6 warnings; 8 at HEAD on the same 3 code files) / rc 0 | `precheck-biome.log`, `head-biome.log`, `precheck-tsc.log` |
| Covering tests (v2) | 14 files, 137/137 | `precheck-covering.log` |
| Full suite on sketch v2 | 297 files / 4,328 tests (4328 passed), rc 0, on a fresh `82e118a` archive + v2 (an earlier v2 run on B's mutant copy lacked the tracked `public/middle-east.mp3`; it is environment-invalid and kept as `precheck-full-v2-mutcopy-env-invalid.log`); the first run, on v0 (`2801a2cd…`, before the anchor and type fixes), was 297 files / 4,328 tests, rc 0 (gate 498: 4,322 + 6 new) | `precheck-full.log` |
| Build on v2 (fresh `82e118a` archive + v2) | rc 0; CSS bundle `app-P1AqvFE3.css`, the same as gate 498 [K15] | `precheck-build-sketch.log` |
| Mutants N1–N9 (v2) | all RED, each on its named rows | `mutants-499.txt`, `mutants-499-failing-rows.txt`, `mutant-logs/` |
| Browser, HEAD vs sketch (1440 / 1280 / 375) | as in C1–C5; B viewed `sketch-ROOT-ERR-pair-1440.png`, `-375.png` and `sketch-REC-DENIED-pair-375.png` (one brass pill + one ghost; nothing clipped) | `measure/head/`, `measure/sketch/`, `measure/summary.txt` |
| Nav + journey, HEAD and sketch | identical final paths and loads; journey `/cart`, `/store`, `/cart` | `measure/{head,sketch}/*-nav-{on,off}.json` |
| Reach probe (which states render in the cloud) | all 10 targets reached | `probe/reach.mjs`, `probe/mock-on/`, `probe/mock-off/` |
| Scanner | HEAD 116/48 → sketch 109/44 | `scan-head.txt`, `scan-sketch.txt` |
| Patch reproduces the tree | `git apply` on a fresh `82e118a` archive gives byte-equal files; check 1 rc 0 on it | (this table) |
| Sketch review | v1 APPROVE-WITH-CHANGES, ruled and applied; v2 delta APPROVE | `sketch-review.md` |
| Claims (HEAD and sketch) | rc 0, no MISSING | `claims-499-planning-output.txt`, `claims-499-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **DPG-BUTTON-CLEANUP-2 stage 2b-2**, the `<button>` and submit sites: free-downloads "Download", the NewsletterSection submit, and the hire-us submit with its ST5 pin granted.
3. **2b-3:** recordings, cart and StudioShowcase.
4. **2c:** PurchaseHeader. **2d:** chat. **2e:** LeadMagnet (keep-list restyle). Then **NONBRAND** and **PD-R498-404-SECONDARY-ALIGN**.
5. **Then the rest of DPG P1** (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. The next RETRO is round 510.
