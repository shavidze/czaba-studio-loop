# C round 300: STUDIO-LINK-b ("View in store" from the Studio library)

**Verdict: PASS.** `browserVerified` / `realVerified` = true. No Critical, High or Medium finding. Two Low/info notes go to B (§5).

- **Verifier:** C, 2026-11-02.
- **Tree:** HEAD `61c37d8` plus A's 9 working-tree paths.
- **Browser:** Playwright with the installed Chromium, against http://127.0.0.1:5173. Every §3.2 row ran in a fresh context at **1440×900 and 1280×720**, after an untimed warm-up load (L38).
- **Scripts and raw data:** `c-round-300/` (`rows.cjs` → `rows.json`, `followup.cjs` → `followup.json`, `audio.cjs` → `audio.json`, `journey.cjs` → `journey.json`, `budget.cjs` → `budget.json`). Screenshots are in `c-round-300/shots/`.
- **Source:** C changed no app source. `git status` lists the same 9 paths before and after this phase, and each is still `cmp`-equal to its sketch.

## 1. Browser rows (§3.2): each one passed at both viewports

| Row | Result | Measured (1440×900 / 1280×720) | Evidence |
|---|---|---|---|
| **B-MENU** | PASS | <ul><li>1 `role=menu`, labelled "Middle East — public preview options", with 1 `menuitem`.</li><li>The item is an `A`: `href=/products/middle-east`, `target=_blank`, `rel="noopener noreferrer"`.</li><li>Focus is on the item.</li><li>Menu box: 160×38 at (211,318) / (211,356), exactly at the pointer and inside the viewport.</li><li>The option has `aria-selected=true`.</li><li>A mouse-opened item does not match `:focus-visible`, as the SABA-B-4 rule requires (ring for keyboard only).</li></ul> | `shots/b-menu-*.png`, `rows.json` B_MENU_NEWTAB |
| **B-NEWTAB** | PASS | <ul><li>The new page is `…/products/middle-east`, and its `window.opener === null`.</li><li>The Studio stays at `/studio-lab`.</li><li>0 menus remain. `activeElement` is option `demo-middle-east` with `aria-selected=true`.</li><li>Clips 0 → 0, and the status text is identical.</li></ul> | `shots/b-newtab-product-*.png` |
| **B-KBD** | PASS | The checks below hold for **both** Shift+F10 and the ContextMenu key:<ul><li>The menu opens at x = the option's left and y = the option's bottom (351 = 284.5 + 66.5; 389 = 322.5 + 66.5).</li><li>The item is focused and matches `:focus-visible`. Its outline is `solid 1px`, `color(srgb .788 .643 .416 / 0.8)` (brass at 80 %), with a 2px offset.</li><li>Enter opens `/products/middle-east` with a null opener. Focus returns to the option, which matches `:focus-visible`.</li><li>(`rows.json` field `audioStartsDuringEnter` comes from a hook on `AudioScheduledSourceNode.start`, which `followup.json` showed never fires here. It is **not** evidence and is not claimed. The valid audio-graph rows use `audio.json`.)</li></ul> | `shots/b-kbd-ShiftF10-*.png`, `shots/b-kbd-ContextMenu-*.png` |
| **B-CLOSE** | PASS | <ul><li>(a) Escape: 0 menus; focus is on the option.</li><li>(b) Tab: 0 menus; focus moves to the preview waveform slider (`arrangement-library-preview-wave`). That is the same element a Tab from the option reaches with no menu open (control), not BODY.</li><li>(c) Click on the search input: 0 menus; focus is on the option; the search input is **not** focused (ruling line §2.3). A second click then focuses the input normally.</li><li>(d) Resize by +10 px: 0 menus; focus is on the option.</li><li>(extra) Click on the timeline: 0 menus; focus is on the option.</li><li>Clips stay 0 → 0.</li></ul> | `rows.json` B_CLOSE |
| **B-SPACE** | PASS | <ul><li>Shift+F10 then Space: 1 new page at `/products/middle-east`; 0 menus; focus is on the option.</li><li>The clock stays at 00:00.000 for 1.1 s, and the playback state reads "Stopped".</li><li>**Audio graph** (`AudioBufferSourceNode.start` hooked, with 1 clip on the timeline): 0 new sources.</li><li>**Positive control**, Space with no menu open: 1 source starts (buffer 101.35 s), the clock reads 00:01.050 / 00:01.059 after 1.1 s, and the state is "Playing".</li></ul> | `rows.json` B_SPACE, `audio.json` menuSpace / controlSpace |
| **B-UNMAPPED** | PASS | <ul><li>Right-click on `demo-hero-music`: the window `contextmenu` arrives with `defaultPrevented=false`, and 0 menus open.</li><li>Shift+F10 and ContextMenu on it: 0 menus.</li><li>Control: the mapped option's event is stopped before `window` and 1 menu opens.</li></ul> | `rows.json` B_UNMAPPED |
| **B-PREVIEW-PARITY** | PASS | <ul><li>"Previewing" moves `demo-hero-music` → `demo-middle-east` on a right-click (menu open) **and** on the left-click control. After Escape it stays on `demo-middle-east`, and focus is on the option.</li><li>**Real graph:** the preview started a 150.37 s buffer (hero). The right-click ended it (`ended` = 1) and started a 101.35 s buffer (Middle East).</li></ul> | `shots/b-preview-parity-*.png`, `audio.json` |
| **B-ADD-INTACT** | PASS | <ul><li>Clip count 0 → 1 (double-click) → 2 (Enter) → 1 → 0 (Ctrl+Z ×2).</li><li>0 menus during the sequence and after it.</li></ul> | `rows.json` B_ADD_INTACT |
| **B-SHEET** | PASS | <ul><li>`?` opens 1 dialog. The Library group has one row, "View in store (new tab)", with the `kbd` keys `Right-click` and `Shift+F10`.</li><li>Escape closes it (0 dialogs).</li></ul> | `shots/b-sheet-*.png` |
| **B-SCREEN-BUDGET** | PASS | <ul><li>Persistent visible text lines outside the timeline scroller: HEAD scratch (:5301, own `cacheDir` `/tmp/c300-head-vite-cache`) **96 / 79**; A's tree (:5173) **96 / 79**.</li><li>Line-by-line diff: 0 lines only in A, 0 only in HEAD.</li></ul> | `shots/budget-{head,a}-*.png`, `budget.json` |
| **B-JOURNEY** | PASS (product half on mock data) | <ul><li>The mock API was not running, so C started `mock-api/server.mjs` on :5199 and stopped it afterwards.</li><li>`/products/middle-east` (h1 "Middle East") → "Try it in the Studio" (`/studio-lab?preview=middle-east`) → the Studio, with `demo-middle-east` focused and selected → right-click → "View in store" → a new page at `/products/middle-east` with title "Middle East \| CZABA", h1 "Middle East", 1 "Try it in the Studio" link and `opener` null.</li><li>The Studio tab keeps its URL and focus.</li><li>The product page uses mock fixtures; this is not backend evidence.</li></ul> | `shots/journey-{1..4}-*.png`, `journey.json` |
| **G300-AUTH** | PASS (see note) | <ul><li>A fresh context with 0 cookies: `/studio-lab` shows the workspace and the "Demo collection — no sign-in required" badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]`.</li><li>`GET /api/studio-token?product=middle-east&file=mix.wav`: **401** "Please sign in to access Studio."</li><li>The same request with a forged Bearer: 500 "Unable to prepare Studio access" (backend down).</li><li>Bare `GET /api/studio-token`: **400** (parameter validation runs before the auth check).</li><li>No body contains a token, and `auth_user` stays null.</li></ul> | `shots/auth-studio-*.png`, `rows.json` G300_AUTH, `followup.json` token |

**Extra probes** (`rows.json` EXTRAS, both viewports):
- A held Shift+F10 (`repeat: true`) opens 0 menus.
- Two right-clicks in a row leave 1 menu, with focus on the item.
- A right-click inside the menu leaves it open (the native menu is suppressed).
- ArrowDown and End keep focus on the item.
- Delete and Ctrl+Z while the menu is open are swallowed: the clips stay 0 → 0 and the menu stays open.
- 0 page errors in every context.

## 2. Other C rows (§3.3)

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS | `c-round-300/claims-c.txt`:<ul><li>Against `claims-300-output.txt`, only the allowed K1, K2 and K3 lines differ (K2 = 9 lines; K3 fails only on the 7 modified paths).</li><li>Against `claims-300-after-sketch.txt`, only K1 (the HEAD line) and K2 (9 vs the scratch's 1169) differ.</li><li>K4–K20 are equal.</li></ul>`claims-vs-*.diff` |
| SOURCE-SCOPE | PASS | <ul><li>`git status`: exactly the 9 §5 paths.</li><li>`sha256sum -c b-round-299-r300-tree-sha256.txt` fails only on the 7 modified paths.</li><li>All 9 files are `cmp`-equal to their `sketch-*.txt`.</li></ul> |
| TYPECHECK | PASS | `npm run typecheck` rc 0 (`typecheck.log`) |
| UNIT | PASS | <ul><li>Covering set (114 files), run alone: **114/114 files, 1855/1855 tests** (`covering.log`).</li><li>Slowest tests: CP12a 7.25 s of a 30 s timeout (24 %; gate-299 9.22 s, 31 %), and TC10 3.19 s of 15 s (21 %).</li><li>Other tests above 2.4 s each sit in a describe with its own timeout: UM9 X1 2.73 s and UM3 2.42 s in `track-group-mix-ui` (l.385 describe, 20 s); UC5 2.57 s in `track-group-collapse-ui` (l.466 describe, 20 s); TC10 in `transport-centre-ui` (l.176 describe, 15 s).</li><li>None is above 50 % of its timeout.</li><li>The run overlapped only root's :5173 dev server, as in B's and A's runs. The kill of the :5301 scratch server landed at the start of the run.</li></ul> |
| UNIT-MUTANTS | PASS | <ul><li>On C's own scratch (`/tmp/c300-mut`, `git archive` of HEAD plus the 9 files, own vite/vitest `cacheDir`), C wrote its own mutant edits.</li><li>Control: 21/21 green.</li><li>Red rows:<ul><li>m1 (`target="_self"`): VS2.</li><li>m3 (no refocus on close): VS5, VS5b, VS6, VS7b (7 tests).</li><li>m4 (`preventDefault` on every Enter): VS7.</li><li>m5 (no unmapped check): VS3.</li><li>m8 (no select on open): VS2.</li></ul></li><li>Every file was restored.</li></ul>`mutants/summary.txt` |
| L50-FOCUS | PASS | <ul><li>K15 grep: Library 20 hits, menu 3 hits, the same as §4.3.</li><li>New hits: the option focus on open, the option focus on close, the menu render conditional, the item focus on mount and on Arrow/Home/End, and the menu's `onPointerDown` `stopPropagation`.</li><li>Each is ruled in §4.3 and measured in B-MENU, B-KBD, B-CLOSE, B-NEWTAB and EXTRAS.</li></ul> |
| L29 grep over the task | PASS | <ul><li>The untagged hits are microcopy and acceptance expectations (l.95, 104, 152, 153, 173) or grants (l.221–231).</li><li>None states a fact about current code.</li></ul> |
| DOC-220 | PASS | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 300 PASS)`.</li><li>The 7 TEMPLATE headings appear in order.</li><li>Cited VS1…VS8 each exist in the test file.</li><li>The cited mutants m1 and m10 exist in `b-round-299/mutants/summary.txt`.</li><li>The doc makes no Ableton/Live claim (grep 0).</li></ul> |
| Gate rows | **gate** | The full suite, build, Biome, `verify` and `test:e2e:smoke` are not run by C (speed rules); `gates/gate-round-300.json` holds their result. |

## 3. Ableton conformity (scored separately from CZABA's requirement)

| Behaviour | Status |
|---|---|
| A context menu on a browser item with a "view origin" action (Live 12 manual §4.7.3.3, "view the sample's pack") | **Unconfirmed** for the destination. The pattern is confirmed in the manual. Where Live opens "view the sample's pack" is not stated there. |
| Reveal/locate actions in the context menu, not as a permanent control (§4.7.7 / §4.7.8) | The pattern is confirmed. CZABA matches it, and the screen budget is equal. |
| Keyboard open (Shift+F10 / ContextMenu) | **Not applicable**: a CZABA accessibility addition, with no Live source. |
| Unmapped items keep the native menu | **Deliberate difference**. SABA-Q-STUDIO-LINK-B q1 is with Saba (`awaiting_user`). |
| Right-click selects and moves an active preview | **Deliberate difference**: a CZABA choice, because Live's behaviour is unconfirmed. SABA-Q-STUDIO-LINK-B q2 is with Saba. |

## 4. CZABA promise (L55)
A visitor who likes a preview in the Studio reaches its product page in a new tab, and the Studio tab keeps its URL, selection, focus and clips. This is proved in a real browser by B-NEWTAB and B-JOURNEY.

## 5. Findings for B (none blocking)
- **C-R300-01 (Low, deferred_low_polish candidate; same as A-R300-REVIEW-3):** the `?` row lists `Right-click` and `Shift+F10`, but not the ContextMenu key. B-KBD proves in the browser that the ContextMenu key works. This conforms to the task text (§2.2 microcopy), so it is a discoverability polish item, not a defect against the spec.
- **C-R300-INFO-02 (info, environment):** two behaviours cannot be reproduced in headless Linux Chromium.
  - A-R300-REVIEW-2: a macOS Ctrl+click reports `button` 0, so the menu would anchor below the option instead of at the pointer. Linux Chromium fires no `contextmenu` on Ctrl+left.
  - A real window `blur` when the new tab takes focus: headless fires none, as B's probe also saw.

  The code closes the menu in the link's click handler before any blur, so a later blur meets a closed menu. Keep both on the Tech Lead real-Chrome/macOS list.
- **C-R300-INFO-03 (info, task wording):** G300-AUTH's literal "`GET /api/studio-token` returns 401" is true only with valid parameters. A bare GET returns 400, because validation precedes the auth check in the protected, unchanged `api.studio-token.ts`. Future auth rows should name the parameterised request. No auth bypass was found: unauthenticated requests get 401, a forged Bearer gets 500 with the backend down, and no response contains a token.
- **Root items carried:** the A-R300-REVIEW-1/2/4 Lows and the menu-duplication architecture note (B-R299-LIBRARY-MENU-DUPLICATION) are B's to triage. `publication-checkpoint.json` and `root-pre-push-review.md` hold no open item specific to this round.

## 6. Environment side effects
- C started the mock API (:5199) and the HEAD scratch dev server (:5301, own `cacheDir`), and stopped both.
- Scratch copies are under `/tmp/c300-head` and `/tmp/c300-mut`.
- After the phase, :5199 and :5301 read 000 and `pgrep` shows no leftover `server.mjs` or :5301 process. (A `pkill -f` call also ended C's own shell, exit 144, because the pattern matched its command line; both targets were confirmed down.)
- :5173 still answers 200.
- No app edits, commits or settings changes.
