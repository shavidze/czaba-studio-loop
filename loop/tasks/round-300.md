# Round 300: STUDIO-LINK-b. "View in store" from the Studio library (context menu, keyboard menu key, `?` sheet row)

**Planned by:** B, at the round 299 → 300 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z769:** round 299 is **C PASS** (12 rows, `browserVerified` true). Gate 299 published `61c37d8`. STUDIO-LINK-a4 is **მზადაა**. C-R298-01, GATE297-F1, GATE297-S5, GATE298-S3, GATE298-S1 and A-R298-REVIEW-5 are closed.
- **D-29z770:** A-R299-REVIEW-1…4 (= gate-299 S1…S3) are ruled **Low** and go to `deferred_low_polish`, routed to A-R298-ARCH-HYDRATE-HARNESS. Reasons: no failure and no vacuous pass was reproduced; they are test-only; and the same class (A-R298-REVIEW-6) was already ruled Low in D-29z765.
- **D-29z771:** this round. STUDIO-LINK-b is the second half of the Saba-approved STUDIO-LINK (PD-REVIEW 2026-10-31: "in the Studio library, a public preview gets View in store in its tooltip or context menu").
  - Saba approved this exact scope on 2026-10-31, so it is treated like SABA-B-9/10/11 ("already agreed"): **no AGREE/YouTube note is needed**.
  - The reference section, the `product-designer` framing and the acceptance rows are still required (§2, §3).
- **D-29z772:** order after this round. Regression is due on or after 2026-11-02. RETRO is at round 305.
- **D-29z773:** one Saba question, SABA-Q-STUDIO-LINK-B (`awaiting_user`, does not block this round; §2.3, L44). Also the IM24 load signal (§6.1).

**Owner:** A. **Verifier:** C. **Grants:** §5 (9 paths: 2 new files, 7 changed).
- **No route, context, auth, cart, checkout, purchase or protected file is touched.**
- `/studio-lab` stays public and needs no backend. `/studio/$productId` stays protected.

## Baseline: HEAD `61c37d8` [K1], clean tree [K2]
- Gate 299 is `published`, with commit `61c37d8` [K1]. `git status` is empty [K2].
- **Frozen list:** `b-round-299-r300-tree-sha256.txt`. It has 1,168 entries hashed from `git ls-files` at HEAD; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-299/claims-300.sh` **before editing**. Its output must equal `b-round-299/claims-300-output.txt`. Any difference is a STOP (§8).
- **Allowed deltas after the change:** exactly `b-round-299/claims-300-after-sketch.txt` (the same script on B's sketch scratch), except for these lines:
  - K1 stays the HEAD line (the scratch has no git HEAD);
  - K2 becomes **9** lines (7 modified + 2 new files);
  - K3 becomes rc 1, failing only on the 7 modified §5 paths.

  Every other line (K4–K20) must equal the after-sketch file.
- **L29 grep note:** the untagged hits of C's L29 grep in this task are acceptance expectations, microcopy or grant descriptions (what the code will be), not facts about the current code.

## 0. Read first
1. `lessons.md` (every role). These bind this round: L4, L11, L12, L14, L23, L26, L28, L29, L31, L39, L47, L49, L50, L51, L54 and L56. C also follows L25, L38 and L48.
2. This task.
3. B's sketch, pre-run on a scratch copy. `/tmp/b300-scratch` is a `git archive` of `61c37d8` with `node_modules` symlinked. It had its own Vite `cacheDir`: `/tmp/b300-vite-cache` for vitest and `/tmp/b300-dev-cache` for the dev server. The store tree was not touched. The scratch does not survive the job, so these artifacts under `b-round-299/` are the record:
   - **Files to copy byte for byte** (each `sketch-<basename>.txt`):
     - `sketch-studio-lab-links.ts.txt`
     - `sketch-ArrangementLibraryMenu.tsx.txt`
     - `sketch-ArrangementLibrary.tsx.txt`
     - `sketch-strings.ts.txt`
     - `sketch-shortcuts.ts.txt`
     - `sketch-shortcuts.test.ts.txt`
     - `sketch-panel-radius-ui.test.tsx.txt`
     - `sketch-studio-link-view-in-store-ui.test.tsx.txt`
     - `sketch-220-studio-link-deep-link.md.txt`

     All TS/TSX files are Biome-clean. `npx biome check app/` on the scratch applied no fixes and reported 205 warnings, all pre-existing.
   - `sketch.patch.txt`: the nine diffs together, for reading only.
   - `covering-files.txt`: the covering set (114 test files, §6.1).
   - `sketch-covering-run.log` and `sketch-covering-run-final.log`: the two covering runs (§6.1).
   - `sketch-tsc.log`: rc 0.
   - `run-mutant.sh`, `mutants/mutant-*.log` and `mutants/summary.txt` (§6.3).
   - `probe/`: the browser probes (§2.4).
   - `im24-sketch-alone.txt`: IM24 alone on the sketch, 3 runs (§6.1).
4. A's primitives and templates: `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `prompts/new-component.md`, `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

## 1. What changes, and why
**Promise (L55):** a visitor who likes a preview in the Studio can reach its product page, to buy it, without losing the Studio session.

STUDIO-LINK-a (rounds 296–299) built the path from the product page to the Studio. This round builds the way back, from the Studio library to the product page.
- **On a mapped library option** (today only `demo-middle-east` [K11]), a right-click, Shift+F10 or the ContextMenu key opens a small menu with one item, **"View in store"**.
- **The item is a real link:** `<a role="menuitem" href="/products/middle-east" target="_blank" rel="noopener noreferrer">` (the `/products/$handle` route exists [K11]). It opens the product page in a new tab, and the Studio tab keeps its session.
- **Every other option** keeps the browser's native menu.
- **The `?` sheet** gets one row in its Library group.

**Current code** (each fact tagged):
- The option is a `<button role="option">` in `ArrangementLibrary.tsx`. It has no `onContextMenu`, no ContextMenu-key or F10 handling, and no `aria-haspopup`. Its `title` is `source.title` [K5].
- Nothing in `app/**` handles `contextmenu` on the library [K6].
- B's browser probe at HEAD (`probe/head-premise.txt`): a right-click on `demo-middle-east` or on `demo-hero-music` reaches `window` with `defaultPrevented` false, no menu opens, and the selection does not change.
- `ArrangementMarkerMenu` handles Enter and Space in one branch that calls `preventDefault`, and it closes on window `blur`. Its caller restores no focus for the `'window'` reason [K7].
- The Studio's global `keydown` listener is a **bubble** listener on `window`. Two capture listeners also exist: the export marker and the shortcut sheet [K16].
- `selectLibraryOption` is defined once, and it switches an active preview to the newly selected source [K5].

## 2. Reference: how Ableton Live 12 does it, and our decisions

### 2.1 Reference table
D-29z771. The research is reused from `b-round-297/product-designer-studio-link-b.md`; its sources were fetched on 2026-10-31, for Live 12.

| Behaviour | Ableton source | Confirmed there | CZABA decision or difference | C check |
|---|---|---|---|---|
| A browser item has a context menu with an action that leads to where the item comes from | Live 12 manual, [Working with the Browser](https://www.ableton.com/en/live-manual/12/working-with-the-browser/) §4.7.3.3 "Working with Splice Samples": "a context menu that allows you to add the sample to Likes or Collections in your library, or view the sample's pack" | A context menu on a browser item exists, and it has a "view the pack" action. **Where** "view the sample's pack" opens is **not stated** (unconfirmed). | Same pattern: the item's context menu holds "View in store". Ours opens the product page in a new browser tab, a web deviation (§2.3). | B-MENU, B-NEWTAB |
| Context-menu actions that reveal an item's origin | Same page, §4.7.7 Current Project ("Show in Explorer/Finder") and §4.7.8 User Folders ("Locate Folder") | Reveal and locate actions live in the context menu, not in a permanent control. | Same: no persistent control or text is added (§3.4). | B-SCREEN-BUDGET |
| A keyboard way to open a browser context menu | Same page | **No reference found.** The manual documents no key for a browser context menu. Searched: §4.7 and the Live 12 shortcut list. | Shift+F10 and the ContextMenu key: a CZABA accessibility addition, the same convention as our marker menu [K7]. | B-KBD |
| Items without the action | none | **No reference found.** In Live every browser item has a native menu. | Unmapped options keep the browser's native menu (§2.3). | B-UNMAPPED |

**Ableton conformity statuses for C:**
- Rows 1–2: **unconfirmed** for the destination. The pattern itself is confirmed; we infer that the action matches.
- Rows 3–4: **not applicable** (a CZABA addition).

### 2.2 product-designer framing
From the round-297 consult (`b-round-297/product-designer-studio-link-b.md`):
- **Chosen:** a context menu only. The option's `title` is unchanged.
- **Rejected, tooltip alone:** a `title` cannot hold a link.
- **Rejected, tooltip + menu:** "Right-click…" text in the title is mouse-only and is read as the option's description. The title also already carries the full name of a truncated row.
- **Rejected, a disabled item on unmapped sources:** it teaches a dead end on almost every row.
- **Contents:** one item. "Add to active track" would duplicate Enter and double-click.
- **Microcopy:** the item reads "View in store"; the menu `aria-label` is `${source.title} options`. The `?` row reads "View in store (new tab)" with the keys `Right-click` and `Shift+F10`.
- **No `aria-haspopup` on the option:** it is not an allowed property on `role=option`, and the option has none today [K5]. The `?` sheet row is the way to discover the menu.
- **States:**
  - mapped and idle: unchanged;
  - right-click: the menu opens at the pointer;
  - Shift+F10 or the ContextMenu key: the menu opens below the option;
  - unmapped: the native menu;
  - preview playing: playback continues, and the preview follows the selection as on a left click;
  - collapsed library: there are no options, so there is no menu;
  - long title: the `aria-label` holds the full title;
  - reduced motion: no change, because the menu has no animation;
  - both viewports;
  - Undo: not applicable, because nothing is edited.

### 2.3 Deviations and B's rulings
- **New tab (web):** `/studio-lab` keeps no session, so the product page must not replace it.
- **Right-click selects the option, and an active preview follows** (L49). This is the same as a left click.
  - `openLibraryOptionMenu` calls `selectLibraryOption(sourceId, false)`, which keeps every side effect of that function: the selection, and the switch of an active preview.
  - Live's behaviour on a right-click in the browser is unconfirmed, so this is a CZABA choice. B-PREVIEW-PARITY checks it.
- **Unmapped options keep the native menu** (product-designer). This differs from Live, where every item has an app menu.
- **Every close returns focus to the option, for every reason,** including window blur and resize.
  - The marker menu's caller skips the `'window'` reason [K7]. L47 forbids BODY as a focus target, so the library menu does not copy that skip.
  - B's probe: headless Chromium fires **no** window blur when the link opens a new tab (`probe/menu-sketch.json`, `blurCount` 0).
  - The link's click handler closes the menu and refocuses the option in the same event, so a later blur in a real browser meets a menu that is already closed (VS6).
- **Outside click:** as in the marker and grid menus [K20], the outside `pointerdown` is swallowed and the menu closes. The click never reaches its target (for example the search input), and focus returns to the option.
  - **Ruling line:** *outside click on the search input: "every close returns focus to the option" wins over "the click focuses the input".*
- **The search filters the option out, or the library collapses, while the menu is open:** neither can happen from the UI. The menu swallows keys, the search input is not focused while the menu is open, and a pointer press outside closes the menu first. The code still guards it: `isLibraryMenuOpen` requires the library to be expanded and the option to be in the results, and an effect clears the state. No row.
- **Keys on the item:**
  - **Space** activates the link once (`click()` and `preventDefault`), as in the WAI-ARIA menu pattern.
  - **Enter** keeps the browser's own link activation (no `preventDefault`); only a held Enter (`repeat`) is prevented.
  - Neither key reaches the Studio shortcuts: the menu calls `stopPropagation`, and the Studio listener is a bubble listener [K16].
- **gate-296 S4 (`?preview=` changed on a mounted route):** it applies on the first load only, and doc 220 says so. Arriving from the product page always remounts the route.

**SABA-Q-STUDIO-LINK-B** (L44; `awaiting_user`; does not block):
1. Unmapped sources show the browser's native menu instead of a Studio menu. Keep it?
2. A right-click selects the source and moves an active preview to it, as a left click does. Keep it?

### 2.4 B's browser probe on the sketch
Evidence: `b-round-299/probe/`. The probe ran on a dev server on :5300 with its own `cacheDir`, at both 1440×900 and 1280×720.
- **Unmapped right-click:** 0 menus, `defaultPrevented` false.
- **Mapped right-click:** 1 menu with 1 item: an `A` with `href` `/products/middle-east`, `target` `_blank` and `rel` `noopener noreferrer`. The menu box is 160×38 px.
- **Clicking the item** opened `http://127.0.0.1:5300/products/middle-east` in a new page with `window.opener === null`. The menu closed, and focus is on option `demo-middle-east`.
- **Shift+F10, then Enter:** the same new page opens, and focus returns to the option. After the keyboard open, the item matches `:focus-visible` with a painted outline (`solid 1px`, brass at 0.8 alpha; L9).
- **Space** (`probe/space-preview-probe.cjs`, `probe/space-preview-sketch.json`): after Shift+F10, Space opened `/products/middle-east` in a new page, the menu closed, focus returned to the option, and the transport button still read "Play" after 1 s.
- **Preview parity** (same files): with the preview playing on `demo-hero-music`, a right-click on `demo-middle-east` opened the menu and moved the "Previewing" mark to `demo-middle-east`; after Escape it stayed there, and focus was on the option.
- **Page errors:** 0 on the measured run. The first run after the server started logged router and hydration errors. A reload on both :5300 and :5173 showed 0 (`probe/errors-probe.txt`), so that was cold-start noise (L38).

## 3. Acceptance rows (C)

### 3.1 Unit (A runs them, C re-runs them)
`studio-link-view-in-store-ui.test.tsx` (new, 21 tests): VS1 (6 cases), VS1b, VS2, VS3, VS4 (2), VS4b, VS5 (2), VS5b (3), VS6, VS7, VS7b and VS8. They are in the sketch file, which A copies byte for byte.

### 3.2 Browser rows
C runs each row at **1440×900 and 1280×720**, in a fresh context, after one untimed warm-up load (L38).

| Row | Steps | Pass |
|---|---|---|
| **B-MENU** | Open `/studio-lab` and wait for "Demo collection ready" (L48). Right-click option `demo-middle-east`. | One `role=menu` (`aria-label` "Middle East — public preview options") with one `menuitem`. The item is an `A` with `href` `/products/middle-east`, `target` `_blank`, and `rel` containing `noopener` and `noreferrer`. Focus is on the item. The menu box is inside the viewport. Screenshot. |
| **B-NEWTAB** | From B-MENU, click the item with `context.waitForEvent('page')`. | The new page's URL ends in `/products/middle-east`, and its `window.opener` is `null`. On the Studio page: 0 menus; `document.activeElement` is option `demo-middle-east` with `aria-selected="true"`; the clip count and the status line are unchanged. |
| **B-KBD** | Focus option `demo-middle-east` (click it). Press Shift+F10. Repeat with the `ContextMenu` key. | The menu opens below the option. Focus is on the item; the item matches `:focus-visible`, and its outline is painted at ≥ 1 px (L9). Enter opens the new page as in B-NEWTAB, and focus returns to the option. Screenshot of the menu opened by keyboard. |
| **B-CLOSE** | Open the menu each time, then: (a) Escape; (b) Tab; (c) click the search input; (d) resize the viewport by 10 px. | (a), (c) and (d): 0 menus, and focus is on the option. (c): the search input is **not** focused (ruling line in §2.3). (b): 0 menus; record the element that receives focus (the next Tab stop after the option); it is not BODY. No clip is added in any case. |
| **B-SPACE** | Open the menu with Shift+F10. Press Space, with `waitForEvent('page')`. | One new page at `/products/middle-east`, and focus is on the option. Playback does **not** start: the transport still shows stopped, and the clock does not move over 1 s. |
| **B-UNMAPPED** | Install a `window` `contextmenu` listener that records `defaultPrevented`. Right-click `demo-hero-music`. Then focus it and press Shift+F10. | `defaultPrevented` is false, and there are 0 `role=menu` in both cases. |
| **B-PREVIEW-PARITY** | Select `demo-hero-music`, start its preview with the Preview button, and confirm the "Previewing" mark is on it. Right-click `demo-middle-east`. Run the left-click control too. | The menu opens, and the "Previewing" mark moves to `demo-middle-east`, exactly as a left click moves it. Record the preview state after Escape. |
| **B-ADD-INTACT** | With no menu open: double-click `demo-middle-east`; press Enter on it; then press Ctrl+Z twice. | The clip count goes +1, then +1, then back to 0. No menu opened. |
| **B-SHEET** | Press `?`. | The Library group has the row "View in store (new tab)" with the keys `Right-click` and `Shift+F10`. Escape closes the sheet. |
| **B-SCREEN-BUDGET** (L39) | On the empty demo, at both viewports, count the persistent text lines outside the timeline. Do it on A's tree and on a HEAD scratch (own port and own `cacheDir`, L38). | The counts are equal. Full-window screenshots of both. |
| **B-JOURNEY** (L54) | Start the mock API (`mock-api/server.mjs` on :5199) if it is not running. Then: `/products/middle-east` → "Try it in the Studio" → the Studio with `demo-middle-east` focused → right-click → "View in store" → the new page. Screenshot of each step. | The new page is `/products/middle-east` and shows the product title and the "Try it in the Studio" link. If the mock API cannot start, the product-page half is BLOCKED "backend unavailable in cloud", and the Studio half still runs. |
| **G300-AUTH** | Fresh context with 0 cookies. | `/studio-lab` loads the workspace and the "Demo collection — no sign-in required" badge, with `auth_user` null. `/studio/middle-east` shows "Sign in required", with 0 `audio[src]`. `GET /api/studio-token` returns 401, and the body holds no token. |

### 3.3 Other C rows
- **CLAIMS:** re-run the claims script and compare its output with both files, as in §Baseline.
- **SOURCE-SCOPE:** `git status` shows exactly the 9 §5 paths. `sha256sum -c` fails only on the 7 modified ones. Each of the 9 is `cmp`-equal to its sketch file.
- **TYPECHECK:** `npm run typecheck` gives rc 0.
- **UNIT:** run the covering set (§6.1) alone (L38). It is green, and no test is above 50 % of its timeout (L31).
- **UNIT-MUTANTS:** at least m1, m3, m4, m5 and m8, on C's own scratch with its own `cacheDir`. Each turns its listed rows red (§6.3).
- **L50-FOCUS:** re-run the K15 grep. Every hit is covered by §4.3.
- **DOC-220:**
  - l.4 is exactly `**სტატუსი:** Completed (C round 300 PASS)`.
  - The 7 TEMPLATE headings appear in order.
  - Every VS row and mutant the doc cites exists in the test file or in `b-round-299/mutants/summary.txt` (L26).
  - The doc claims nothing about Live that §2.1 does not confirm.
- **Gate rows** (`gate` in `c-round-300.json`): the full suite, build, Biome, `verify` and `test:e2e:smoke`.

### 3.4 Screen budget (L39)
Nothing persistent is added:
- the menu is transient;
- the new row lives inside the `?` sheet;
- the option's `title` is unchanged.

Quieter homes considered: the tooltip (rejected, §2.2) and the `?` sheet (chosen, for discoverability).

## 4. Rulings for A and C

### 4.1 One element, one rule (L4)
- **The menu item's focus ring:** the shared `:focus-visible` style (SABA-B-4) wins over any local style. The item gets no focus class of its own, the same as the marker menu items [K20].
- **`panel-radius-ui.test.tsx` PNR2:** "rounded-panel only on the panel sites" is extended, not weakened.
  - The library menu container becomes the 10th site, and its item class keeps `rounded-sm`.
  - The test name changes from "nine" to "ten" [K9].
  - No assertion is removed.
- **`strings.ts`:** the new strings go in a new export, `studioLibraryMenuStrings`. ST49's exact-key list pins `studioLibraryPanelStrings` [K10], so that object does not change.

### 4.2 L23 collisions found on the sketch
- **`shortcuts.test.ts`** pins the full ordered list of row ids [K8]. `library-view-in-store` is added after `library-preview` (granted).
- **`panel-radius-ui.test.tsx` PNR2** counts `rounded-panel` across `app/components` and `app/routes`, and pins each menu's item class [K9]. Granted; see §4.1.
- **`shortcut-sheet-ui.test.tsx`** checks that every row's action text appears once [K8]. It passes unchanged, because "View in store (new tab)" is unique.
- **SWEEP of the new tokens** over `app/**`, `perf/**` and `e2e/**`: 0 hits at HEAD [K13].
- **Menu queries in tests:** 0 test files count `menu` or `menuitem` roles at HEAD, and one queries `ByRole('menu')` [K14]. It passes in the covering run.

### 4.3 L50 focus origins
Command (K15): `grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'` over `ArrangementLibrary.tsx` and `ArrangementLibraryMenu.tsx`. HEAD: 17 hits (Library only). Sketch: 20 in Library and 3 in the menu. Rulings:
- **Open:** Library `openLibraryOptionMenu` focuses the option; then the menu's mount effect focuses the item. Rows: VS2, VS4, B-MENU, B-KBD.
- **Close:** Library `closeLibraryOptionMenu` focuses the option, for every reason. Rows: VS5, VS5b, VS6, VS7b, B-CLOSE, B-NEWTAB.
- **Arrow, Home and End keys in the menu** focus the item. The single item keeps focus, so there is no separate row.
- **The menu's `onPointerDown` `stopPropagation`:** a press inside the menu does not close it. Covered by B-NEWTAB, where the click lands.
- **Conditional render of the menu** (`isLibraryMenuOpen`): cannot happen while the menu is open (§2.3); no row.
- **The other 17 hits** are unchanged HEAD code (option render, collapse toggles, search clear, separator, notice dismiss). Out of scope.

### 4.4 L49: side effects of the new path
`openLibraryOptionMenu` keeps every side effect of `selectLibraryOption`: the selection and the preview switch (B-PREVIEW-PARITY; mutant m8 turns VS2 red). It adds focus on the option and the menu state. Nothing is dropped.

### 4.5 L51: status
No status write is added or moved. B-NEWTAB and B-CLOSE check that the status line is unchanged.

## 5. Grants
A edits only these 9 paths, and each must equal its sketch byte for byte.
1. `app/data/studio-lab-links.ts`: `resolveStudioLabProductHandle` and `getStudioLabProductHref`, built from the one existing map.
2. `app/components/arrangement/ArrangementLibraryMenu.tsx` (**new**).
3. `app/components/arrangement/ArrangementLibrary.tsx`: the option's `onContextMenu` prop, Shift+F10 / ContextMenu in `handleOptionKeyDown`, the menu state, open and close, and the render.
4. `app/lib/arrangement/strings.ts`: the new `studioLibraryMenuStrings` export only.
5. `app/lib/arrangement/shortcuts.ts`: one row, `library-view-in-store`.
6. `app/lib/arrangement/__tests__/shortcuts.test.ts`: one id.
7. `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx`: PNR2 (§4.1).
8. `app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx` (**new**).
9. `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md`:
   - the title;
   - l.4 → `**სტატუსი:** Completed (C round 300 PASS)` (L28, final stage);
   - the stage-2 parts of every section.

   The other two `In Progress (stage` hits, docs 212 and 213, belong to the open PERF-3 stage [K12].

Nothing else: no `package.json`, config, route, context or protected file.

## 6. A's checks (speed rules)
1. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-299/covering-files.txt)`, 114 files. **Run it alone**, with no dev server, browser or other vitest job at the same time (L38).
   - **B's two runs:**
     - first run, before the PNR2 grant: 113/114 files, failing only on PNR2 (fixed by the grant);
     - final run, with B's :5300 dev server and Playwright probes running at the same time: 1,854/1,855, failing only on **IM24** in `insert-marker-ui.test.tsx`.
   - **IM24 (B-R299-IM24-LOAD-SIGNAL, D-29z773):**
     - IM24 is a playing-state status-text row in a file that does not touch the library menu.
     - It passed in B's first run, passed 3/3 alone on the sketch (`im24-sketch-alone.txt`), and passed in gate 299's `verify`.
     - If it fails in A's run, re-run that file alone once and report both results. If it fails alone, that is a STOP (L11).
   - Report the totals and every test above 50 % of its timeout (L11, L31).
2. Run `npm run typecheck` and `npm run lint`. The 205 lint warnings are pre-existing; none may be in a granted file.
3. **Mutants** on A's own scratch: `git archive HEAD` plus the 9 files, with its own `cacheDir`. Use `b-round-299/run-mutant.sh` as a template, and write the logs under `a-round-300/`, not over B's.

   | Mutant | Change | Red rows (B's run) |
   |---|---|---|
   | m1 | drop `target="_blank"` | VS2 |
   | m2 | `rel="noreferrer"` only | VS2 |
   | m3 | no option refocus on close | VS5, VS5b, VS6, VS7b |
   | m4 | `preventDefault` on every Enter | VS7 |
   | m5 | no unmapped check in `onContextMenu` | VS3 |
   | m6 | no `stopPropagation` in the menu keydown | VS7, VS7b |
   | m7 | the reverse map upper-cases the handle | VS1, VS1b, VS2 |
   | m8 | opening the menu does not select the option | VS2 |
   | m9 | a held Shift+F10 opens the menu | VS4b |
   | m10 | Space does not click the link | VS7b |
4. **code-reviewer** is required (9 paths). Pass its findings to B, and do not act on them, because every grant is byte-equal to the sketch. A Medium+ regression is a STOP (L11).
5. Write `a-round-300.md` as you go.

## 7. Risks to neighbouring behaviour (C probes these)
- **Library keyboard** (arrows, Enter to add, Escape in search): B-ADD-INTACT and the covering tests.
- **Library preview** (playback and the preview switch): B-PREVIEW-PARITY.
- **Marker and grid menus:** unchanged code (their files stay in the frozen list [K3]), covered by the covering set.
- **Studio shortcuts while the menu is open:** Space does not reach the transport (B-SPACE, VS7b).
- **SSR and hydration:** the menu renders nothing until it opens, and the hydrate tests are in the covering set.

## 8. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-300.md` and changes nothing else when:
- the claims output before editing differs from `claims-300-output.txt`;
- a covering test fails (with the IM24 exception in §6.1), or a test is above 50 % of its timeout;
- a grant cannot be byte-equal to its sketch, or a change is needed outside §5;
- `npm run typecheck` fails, or `npm run lint` reports a finding in a granted file;
- a mutant in §6.3 stays green;
- the reviewer reports a Medium+ regression.

## 9. Frontend-architect checkpoint (bounded, for root after this round)
This round adds a second small menu component next to `ArrangementMarkerMenu`; B records it as B-R299-LIBRARY-MENU-DUPLICATION. B requests one bounded checkpoint at the STUDIO-LINK-b / NAME-AND-HINT boundary (`b-round-299.md` §6). It does not block this round.

## 10. Commit readiness
After C PASS and the gate, root publishes the 9 §5 paths. This finishes STUDIO-LINK (doc 220 becomes Completed).
