# Round 296: STUDIO-LINK-a. "Try it in the Studio" on the product page opens `/studio-lab` with that product's preview selected and focused

**Planned by:** B, at the round 295 → 296 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z746:** round 295 is **C PASS** (10 of 10 rows, `browserVerified` and `realVerified` true); gate 295 **published** `eded57a`. SYS-VACUOUS-ROWS is **მზადაა**; its four Lows are closed.
- **D-29z747:** ruling on A's round-295 STOP and on C-R295-INFO-01 (§2).
- **D-29z748:** rulings on the gate-295 reviewer's findings and Architecture note (§2).
- **D-29z749:** STUDIO-LINK is split in two stages (round rule: one feature stage per round). **296 = STUDIO-LINK-a** (product-page link + deep link). **297 = STUDIO-LINK-b** ("View in store" on the library option + the `?` sheet row). The full approved scope stays.
- **D-29z750:** the smallest honest behaviour for "that product's public preview" (§1.2): a static handle → Studio-source map. The dynamic product preview is a later candidate.
- **D-29z751:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4 (10 paths).
- No auth, cart, checkout, purchase or protected file is touched. `/studio-lab` stays public and needs no backend. `/studio/$productId` stays protected.
- Naming (`<title>`, nav, header "CZABA Studio") is **not** in this round. NAME-AND-HINT (round 298 or later) owns it.

## Baseline: HEAD `eded57a` [K1], clean tree [K2]
- Gate 295 is `published`, with commit `eded57a` [K1]. `git status` is empty [K2].
- **Frozen list:** `b-round-295-r296-tree-sha256.txt`. It has 1,163 entries, hashed from `git ls-files` at HEAD, and `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-295/claims-296.sh` **before editing**. Its output must equal `b-round-295/claims-296-output.txt`. Any difference is a STOP (§8).
- **Allowed deltas after the change (C-R295-INFO-01 adopted):** B ran the same script on its sketch-applied scratch copy and saved the result as `b-round-295/claims-296-after-sketch.txt` (K4–K15). After A's change, the claims output must equal that file, except:
  - K2: 10 lines;
  - K3: rc 1, failing only on the 7 modified §4 paths;
  - K14: 1;
  - K15: it lists files B saved, so it is unaffected.

## 0. Read first
1. `lessons.md` (every role). These bind this round: L23, L29, L47, L51, L52, L54, L55 and L56. For C, also L18, L25 and L38.
2. This task.
3. B's sketch, pre-run on a scratch copy. `/tmp/b296-scratch` is a `git archive` of HEAD with `node_modules` symlinked; the store tree was not touched.
   - `/tmp/b296-scratch` does not survive the job. The artifacts are the files under `b-round-295/`.
   - **`b-round-295/sketch-studio-link-a.diff`** (9 files). From `store/`, `patch -p0 --dry-run < ../tmp/studio-real-loop/b-round-295/sketch-studio-link-a.diff` applies cleanly on `eded57a`. A may apply it with the same command without `--dry-run`. C may reverse-apply it to check SOURCE-SCOPE.
   - **Collision proof (L23):** `b-round-295/collision-before-mocks.log`. Once the route calls `useSearchParams`, all 4 route test files fail, because their `@remix-run/react` mocks lack it. That is why §4 grants those 4 files one mock line each.
   - **Covering run:** `b-round-295/sketch-covering-run.log` has 9 files and 89 tests passing. That covers the new file's 20 tests and the 69 existing tests in the other 8 files.
   - **Mutants:** `b-round-295/mutant-{a-no-focus,b-no-initial,c-plain-object,d-link-always}.log`. Each turns its named rows red (§5).
   - **Real-browser probe:** `b-round-295/probe/journey.cjs`, run on the sketch dev server (:5296, its own Vite `cacheDir`) and on HEAD (:5173), with the mock API on :5199.
     - Results: `probe/journey-sketch2.json` and `probe/journey-head.json`. Screenshots are in `probe/shots/`.
     - Results at both viewports:
       - The link is present on `/products/middle-east` (137×20 px) and absent on `/products/harbour-lights`.
       - A click lands on `/studio-lab?preview=middle-east`.
       - `document.activeElement` is the `demo-middle-east` option, with `aria-selected="true"`.
       - Enter adds the clip; the status reads `“Middle East — public preview” added to the Music track at 00:00.000.`
       - Plain `/studio-lab` leaves focus on BODY.
       - On HEAD, the link count is 0.
     - The first run, `journey-sketch.json`, logged hydration `useState` errors at 1440 only. That run was on a cold Vite cache for the new server. The warm re-run (`sketch2`) logged 0 page errors at both viewports. C records page errors with a HEAD comparison (§6 B-PAGE-ERRORS).
   - `tsc --noEmit` rc 0. Biome is clean on all 9 files, apart from 1 warning that already exists in `ProductSidebar.tsx` (the `<button>` without `type` at the Complimentary Download button; it is also on HEAD).
4. A's primitives and templates:
   - `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (ProductSidebar is an existing component; no new component), `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md` (the provider prop), `AUDIO_ARCHITECTURE.md` (Studio);
   - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

## 1. Why, and what the user gets

### 1.1 Request
Saba approved this on 2026-10-31, from PD-REVIEW F1 rec. (2)+(3), queue entry PD-REVIEW-2026-10-31 → STUDIO-LINK:
- the product page gets "Try it in the Studio", which opens `/studio-lab` with that product's public preview selected;
- the library gets "View in store";
- the Studio's exit keeps "← CZABA".

This round delivers the first half. The second half is STUDIO-LINK-b, round 297.

**Promise (L55):** a buyer on a track's page reaches the Studio in one click, with that track's preview ready to place: selected, focused, and added with Enter. **Proof row:** B-JOURNEY.

### 1.2 Smallest honest behaviour (D-29z750; product-designer chose it, §7)
- Only one product preview exists inside the Studio demo today: `demo-middle-east` ("Middle East — public preview", `/middle-east.mp3`) [K10].
- Loading any other product's `audioPreviewUrl` would make `/studio-lab` depend on the backend. It would also need a Web Audio decode of an R2-hosted cross-origin MP3, and R2 CORS cannot be verified in the cloud.
- So the link uses a **static map** `{ 'middle-east' → 'demo-middle-east' }` in a new tiny module. Products without a mapping show **no link**. A link that lands on "not in the demo" would promise and then stop.
- The **dynamic preview** is recorded as later candidate STUDIO-LINK-DYNAMIC. Its prerequisite is R2 CORS confirmed for decode in a real browser.
- **Selected ≠ added.** The deep link selects and focuses the option and does not add it to a lane. Adding would turn a URL into an edit that needs an Undo.
- `demo-middle-east` is already `sources[0]` [K10], so its selection alone is not observable in the browser. That is why:
  - the observable browser contract is **focus** on that option;
  - the provider's `initialSelectedSourceId` is proven in jsdom on a 3-source collection where the target is not first (LK4, mutant b).

## 2. Rulings on round 295 and gate 295 (L10)
| Item | Ruling |
|---|---|
| Round 295 | **C PASS**, 10 of 10 rows (`c-round-295.json` lists 10 `passed`). Gate 295 published `eded57a`. SYS-VACUOUS-ROWS is **მზადაა**. A-R278-REVIEW-METRONOME-SPY, C-R283-01, A-R283-REVIEW-LOAF-SCRIPTS and A-R284-REVIEW-ZQ3-VACUITY are **closed**. |
| A's STOP (K6 0→1; K10 lists `report.test.ts`) | **Accepted deltas.** K6 is the import that §3.2 granted. The K10 hit is the LOAF1 row title from B's own sketch. It was a B spec omission, not an A defect. |
| C-R295-INFO-01 (info, origin B) | **Adopted as method:** from this round, the allowed-delta list is the claims script run on B's sketch-applied scratch copy (`claims-296-after-sketch.txt`). Recorded as retro candidate RC-R295-CLAIMS-FROM-SKETCH; `lessons.md` unchanged (59 lines). |
| Gate-295 finding 1 (Low): the stricter LoAF check could false-alarm on a fast machine | `deferred_low_polish` as **GATE295-R1-LOAF-FALSE-ALARM**, with the reviewer's fix ("split the message: no long frames vs long frames without script timings") to apply only if it flakes. |
| Gate-295 finding 2 (info): Biome does not lint `perf/**` | Merged into **ROOT-REQ-VITEST-PERF-INCLUDE**. It now asks for both `vitest.config.ts` and `biome.json` to include `perf/**`, read-only `check` first. |
| Gate-295 findings 3–5 (info) | No action. Finding 3 is covered by C's B-PERF-LOAF. Finding 5's `tempoRowProps()` factory is noted on signal A-R293-ARCH-SILENCE-ALL's neighbour list only if a second test needs it. |
| Gate-295 Architecture note (keep `loafScriptsProblem` in `report.ts`) | Recorded as signal **GATE295-ARCH-PERF-RULES** (keep; revisit at ≥ 3 harness guards). Not scheduled. |

## 3. What A changes (exactly the hunks of `b-round-295/sketch-studio-link-a.diff`)

### 3.1 New `app/data/studio-lab-links.ts`
- `export const STUDIO_LAB_PREVIEW_PARAM = 'preview';`
- A private `ReadonlyMap<string, string>` with one entry: `['middle-east', 'demo-middle-east']`. **It must be a `Map`, not an object literal**, so `__proto__`, `constructor` and `toString` resolve to `null` (LK1, mutant c).
- `resolveStudioLabPreviewSourceId(handle: string | null): string | null`.
- `getStudioLabPreviewHref(handle: string): string | null`. It returns `/studio-lab?preview=<handle>` for a mapped handle, else `null`.
- **Bundle boundary:** the module imports nothing. It must **not** import `~/data/studio-lab-demo`; that would pull the demo synth into every product page.

### 3.2 `app/contexts/ArrangementContext.tsx`: one optional provider prop
- `ArrangementProviderProps` gains `initialSelectedSourceId?: string | null;`, and the provider destructures it.
- The `selectedSourceId` state at l.663 [K5] becomes a lazy initializer. It uses the id of the first `collection.sources` entry whose `id === initialSelectedSourceId`, then falls back to `collection.sources[0]?.id`, then `null`.
- Nothing else in the context changes. There is no new status write (L51: nothing to clobber).

### 3.3 `app/routes/studio-lab.tsx`: read `?preview=`, select it, then focus it once
- Import `useSearchParams` from `@remix-run/react`, and import `resolveStudioLabPreviewSourceId` and `STUDIO_LAB_PREVIEW_PARAM`.
- `previewSourceId = resolveStudioLabPreviewSourceId(searchParams.get(STUDIO_LAB_PREVIEW_PARAM))`. Pass it as `initialSelectedSourceId` to `ArrangementProvider`. The server render already marks it selected, so the selection does not flash.
- **Focus target (L47):** one new `useEffect`, guarded by a `previewFocusSettledRef`, runs at the **first hydrated commit only**. It focuses only when all of these hold:
  - the window is wide;
  - `previewSourceId !== null`;
  - `isFocusOutsideStudio(document.activeElement)` is true.

  It then calls `.focus()` on `[role="option"][data-source-id="<id>"]` inside `workspaceWrapperRef`. The id comes only from the constant map, so the selector carries no user text.

  `focus()` scrolls the option into view. Do not add `scrollIntoView`; jsdom lacks it.
- **First hydrated state narrow:** nothing is focused, and the narrow state behaves exactly as today (LK7).
- **Later widening:** the existing narrow → wide effect still moves focus to `arrangement-exit` [K6], unchanged.
- An unknown or missing parameter gives the default selection, no focus move and no message (LK6).
- `meta` (the title) does not change. NAME-AND-HINT owns it.

### 3.4 `app/components/product/ProductSidebar.tsx`: the link
- Import `ArrowRight` beside `Download`, and `getStudioLabPreviewHref`.
- `const studioPreviewHref = getStudioLabPreviewHref(product.handle);`
- Directly after the artist `<Link>` (l.56 [K7]), inside the same centred block, add the link only when the href is not `null`:
  - wrapper: `<p className="mt-3">`;
  - a Remix `<Link to={studioPreviewHref}>`, same tab, with the classes `inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors` and `data-testid="product-studio-link"`;
  - content: the text **`Try it in the Studio`**, then `<ArrowRight className="size-3.5" aria-hidden="true" />`.
- Tokens only; no new colour and no custom CSS. The store's global focus style applies; this round adds no focus class.

### 3.5 Four route test files: one mock line each (L23 grant)
In each of these, add exactly `useSearchParams: () => [new URLSearchParams()],` as the first property of the existing `vi.mock('@remix-run/react', …)` factory:
- `studio-theme-obsidian.test.tsx`
- `ssr-layout-effect.test.tsx`
- `studio-narrow-gate-ui.test.tsx`
- `default-track-names-ssr.test.tsx`

No assertion changes in these files.

### 3.6 New `app/lib/arrangement/__tests__/studio-link-ui.test.tsx` (20 tests; ids LK, K9 sweep 0 before)
| Row | What it proves |
|---|---|
| LK1 (`it.each`, 7) | `middle-east` resolves to `demo-middle-east`. `harbour-lights`, `''`, `MIDDLE-EAST`, `__proto__`, `constructor` and `toString` resolve to `null`. |
| LK1b | `null` resolves to `null`. |
| LK2 | The param is `preview`. The href is `/studio-lab?preview=middle-east`, and `null` for an unmapped handle. Every mapped source id exists in `studioLabDemoCollection.sources`. |
| LK3 | `ProductSidebar` for middle-east has a link named "Try it in the Studio", with that href and no `target`. For harbour-lights there is no link. |
| LK4 (`it.each`, 5) | On a 3-source test collection, `initialSelectedSourceId` `second` → `second` and `third` → `third`. `missing`, `null` and `undefined` → `first`. |
| LK5 | Wide `/studio-lab?preview=middle-east`: the active element is the `demo-middle-east` option, with `aria-selected="true"` and `tabindex="0"`. |
| LK6 (`it.each`, 3) | Wide `/studio-lab` with no param, `preview=harbour-lights` or `preview=__proto__`: the active element is BODY, and the selected option is `sources[0]`. |
| LK7 | Narrow with `?preview=middle-east`: the narrow heading renders and no option is focused. |

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/data/studio-lab-links.ts` | new (§3.1) |
| `app/contexts/ArrangementContext.tsx` | the prop and the initializer only (§3.2) |
| `app/routes/studio-lab.tsx` | §3.3 |
| `app/components/product/ProductSidebar.tsx` | §3.4 |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | 1 mock line (§3.5) |
| `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx` | 1 mock line (§3.5) |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | 1 mock line (§3.5) |
| `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` | 1 mock line (§3.5) |
| `app/lib/arrangement/__tests__/studio-link-ui.test.tsx` | new (§3.6) |
| `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` | new (§3.7) |

### 3.7 Doc 220 (220 is free [K14])
- Follow `TEMPLATE.md` (L26), in Georgian with English technical terms.
- l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS)` (L28).
- Context: F1 and Saba's decision. Approach: the static map versus the dynamic preview (rejected, and why), and selection versus adding.
- An architecture Mermaid: product page → `/studio-lab?preview=` → provider selection → focus.
- The changed files (all 10).
- Problem → Solution: the route mock collision (L23), the prototype keys, and `demo-middle-east` being first (the jsdom proof).
- Testing: the LK rows and the 4 mutants.
- TODO:
  - STUDIO-LINK-b ("View in store", round 297);
  - STUDIO-LINK-DYNAMIC;
  - NAME-AND-HINT.
- Cite only ids that exist.

**Frozen:** every other entry of `b-round-295-r296-tree-sha256.txt`. That includes:
- `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `studio-lab-demo.ts` and `ProductDetailPage.tsx`;
- `app/lib/r2.config.ts` (protected glob `app/lib/r2*`);
- every Store route and `app/root.tsx`;
- `package.json` and the lock file;
- the 7 protected files [K4].

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (§Baseline deltas).
- `npm run typecheck` (rc 0) and `npm run lint`. Run `npx biome check` on the 9 code and test paths: no new finding (the one ProductSidebar `<button>` warning already exists).
- **Covering set** (`npx vitest run`, 9 files):
  - `studio-link-ui.test.tsx`
  - `studio-theme-obsidian.test.tsx`
  - `ssr-layout-effect.test.tsx`
  - `studio-narrow-gate-ui.test.tsx`
  - `default-track-names-ssr.test.tsx`
  - `product-price-unavailable.test.tsx`
  - `product-handle-route.test.tsx`
  - `product-presentation.test.tsx`
  - `product-price-cards.test.tsx`

  Expected: **9 files, 89 tests**, all passing. Report every test above 50 % of its timeout (L11). B's slowest was NG5 at about 2 s of its 15 s.
- **Mutants**, on a scratch copy only. Each must turn its rows red. Restore after each and `cmp`.
  - (a) Route: replace `?.focus()` with a no-op → LK5 red.
  - (b) Context: drop the `find(…initialSelectedSourceId)` term → LK4 `second` and `third` red.
  - (c) Links module: an object-literal lookup instead of the `Map` → LK1 `__proto__`, `constructor` and `toString` red.
  - (d) Sidebar: render the link unconditionally → LK3 red.
- `npm run build` and the full suite are gate rows.
- **code-reviewer:** the real subagent is **required** (10 paths). Pass its Architecture note to B.

## 6. Acceptance (C)
**How to run the browser rows:**
- Playwright Chromium, fresh contexts with empty storage. Load each page once, untimed, first (L38).
- **Mock API:** start `node mock-api/server.mjs` on :5199 for the product pages if it is not running, and stop it at the end. It is not a backend proof (README).
- Both viewports, 1440×900 and 1280×720, unless a row says otherwise.

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Equal to `claims-296-after-sketch.txt` for K4–K13 and K16, plus K2 10 lines, K3 rc 1 on exactly the 7 modified §4 paths, and K14 1. |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly the 10 §4 paths. `sha256sum -c` fails only on the 7 modified paths. The 7 protected files are unchanged. |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 9 files and 89 tests pass. LK1–LK7 are present by name. None is above 50 % of its timeout. |
| UNIT-MUTANTS | scratch copy | (a)–(d) each turn their named rows red. The restore diff is empty. |
| B-LINK | `/products/middle-east` and `/products/harbour-lights` | Middle East has exactly 1 link named "Try it in the Studio", with `href` `/studio-lab?preview=middle-east` and no `target`. Its colour token is the same as the "by CZABA" link at rest (`getComputedStyle().color` equal). Harbour Lights and one SFX page (`door-slams`) have 0 such links. The Buy area's buttons and their order are unchanged against HEAD (same accessible names in the same order). |
| B-LINK-KEYBOARD | Middle East page, keyboard only | Tab reaches the link. A visible focus outline is drawn (`:focus-visible`, outline width ≥ 1 px painted). Enter navigates to `/studio-lab?preview=middle-east`. |
| B-LANDING | after a mouse click on the link (**clip count:** count clip roots `[data-clip-id]` [K16]. Do not use the `[data-testid^="arrangement-clip"]` prefix: B's probe got 3 for 1 clip) | Wait for `Demo collection ready` (L48). Then: `document.activeElement` is the `role=option` with `data-source-id="demo-middle-east"`, with `aria-selected="true"` and `tabindex="0"`. Its box is fully inside the library list's visible box. **0 clips** are on any lane. The status text equals HEAD's status after a fresh plain `/studio-lab` load (L51: no new status write). |
| B-ADD-PLAY | continue from B-LANDING | Enter adds exactly 1 clip on the Music lane, at 00:00.000; the status names "Middle East — public preview". Ctrl+Z removes it, and Ctrl+Shift+Z (or Ctrl+Y) restores it, the Redo keys in `shortcuts.ts` [K16]. Space plays: the playhead time advances ≥ 0.5 s within 1.5 s of wallclock. **Real audio:** the master meter (or a `MediaStreamDestination`/analyser tap, at C's choice) reads non-silent while playing. Stop. |
| B-JOURNEY (L54) | product page → link → Enter → Export | Screenshots per step. Open Export, choose WAV and export. The downloaded file is > 44 bytes, and its PCM in the first 2 s has RMS > 0 (not digital silence). "← CZABA" (`arrangement-exit`) is present and goes to `/`. |
| B-DEEP-NEGATIVE | `/studio-lab`, `?preview=harbour-lights`, `?preview=__proto__`, `?preview=` | Each loads the workspace with 0 page errors. Focus is not on any library option, and the selected option is `demo-middle-east` (the default). The status equals plain `/studio-lab`. |
| B-NARROW | 860×700 with `?preview=middle-east` | The narrow state ("The Studio works on a computer") shows, with 0 page errors and no focused option. Widening to 1280×720 shows the workspace, and focus goes to `arrangement-exit` exactly as on HEAD (FIX-PD-1c rule unchanged). |
| B-PAGE-ERRORS | all rows above | Page errors are listed per row and compared with HEAD on the same job. A cold-cache Vite error that HEAD also shows, or that is gone on a warm reload, is environment. Any other error is a FAIL. |
| B-SCREEN-BUDGET (L39) | before/after screenshots | `/products/middle-east` at both viewports (HEAD vs A). The only new persistent text line is "Try it in the Studio". The sidebar grows by exactly that line's box: ≤ 32 px, from the measured 20 px link box (`probe/journey-sketch2.json`) + `mt-3` 12 px, and nothing else moves by more than that height. `/studio-lab` in its normal state: the count of persistent text lines outside the timeline is **equal** to HEAD (0 added). |
| G296-AUTH | fresh context | `/studio-lab` loads anonymously at 1440×900, with the workspace and the demo badge, and `auth_user` null. `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`. `/api/studio-token` GET returns 401 with no token in the body. |
| DOC-220 | doc | It exists. l.4 is exactly as §3.7. The 7 TEMPLATE `## ` headings appear in order (L26). All 10 changed files are listed. Every cited id exists. |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows. |

**Not re-run:** rounds 292–295 rows other than those named above. The narrow gate (NG1–NG10) is covered by UNIT and B-NARROW.

**Adjacent behaviour that could break:**
- The narrow → wide focus rule (B-NARROW).
- SSR and hydration of `/studio-lab` (the 4 route test files, B-PAGE-ERRORS).
- The default library selection (B-DEEP-NEGATIVE).
- The product page layout and Buy area (B-LINK, B-SCREEN-BUDGET).
- Product-page bundle weight: the links module imports nothing (CLAIMS K9 and the §3.1 rule; C confirms that `ProductSidebar.tsx` has no import of `studio-lab-demo`).

## 7. Reference and design

### Reference: how established products do it
- **Ableton Live 12:** not applicable. Live has no store-to-arrangement hand-off.
- **Store references searched (2026-10-31, WebSearch):**
  - Epidemic Sound Adapt: its help article says you go to Adapt, find the track, and open it in the Adapt workspace ([how to use Adapt](https://www.epidemicsound.com/blog/how-to-use-adapt)). The 2026 press release says Adapt now sits inside the core soundtracking experience ([press release](https://corporate.epidemicsound.com/press-and-media/press-releases/2026/epidemic-sound-updates-adapt-further-enhancing-music-adaptation-capabilities-for-brands-and-content-creators/)). A per-track-page "open in editor" button was **not confirmed**.
  - Splice: Bridge previews sounds in the user's project context before download ([Splice blog](https://splice.com/blog/new-feature-recap-2023)). A Splice "Create" mode was not confirmed.
  - **Result: no direct reference found** for a product-page link into an in-browser editor with the item preselected.
- The behaviour is therefore set by Saba's approved scope plus `product-designer`, below. It is not modelled on a reference.

### product-designer consult (2026-10-31; full answer in `b-round-295.md` §4)
- **Chosen:**
  - a static map;
  - **hide** the link on unmapped products;
  - a quiet text link under the title and artist (not a button), so it cannot compete with Buy, which sits in `PurchaseHeader`;
  - same tab;
  - `?preview=<handle>` (the public handle, not the internal source id);
  - land with the option selected and focused, with **no auto-add** and **no visible status**.
- **Rejected:**
  - a dynamic preview (backend and CORS);
  - a generic "Try the Studio" link on every product (it breaks the per-product promise);
  - a status line (it would collide with the collection notice slot and the loading and ready writes);
  - a screen-reader-only announcement. **B ruled** that focus on a `role=option` with `aria-selected` already announces the selection, and the Studio has no separate sr-only announcer, so a new one would be a new persistent component for one line.
- **Screen budget:** one persistent line on the product page. Quieter homes were rejected because a way in cannot live in a tooltip, the `?` sheet or an empty state. `/studio-lab` itself gets nothing persistent.
- **Deviations:** none from a reference (there is none). Against product-designer, B did not add the SR-only announcement (reason above).

### Saba questions (non-blocking; defaults applied; `awaiting_user` as SABA-Q-STUDIO-LINK)
1. A new link in the product sidebar under the title. Default: yes; STORE-4 may move it into its "Make it yours — open in Studio" order.
2. Hide the link on unmapped products. Default: hide.
3. (For round 297) "View in store" opens a new tab. Default: new tab, because there is no project persistence.

SR-290-10 (the "Full mix only" library note) stays `awaiting_user` and is not implemented.

### Ableton conformity (C reports separately)
- **CZABA requirement:** §1.1 promise, rows B-LANDING, B-ADD-PLAY and B-JOURNEY.
- **Ableton:** not applicable (store hand-off). Library selection and Enter-to-add keep the existing Studio behaviour; this round does not change them.

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-296.md`, and change nothing else, if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- any mutant (a)–(d) leaves its row green;
- the change needs any path outside §4, or any edit to a frozen or protected file;
- Biome asks for a new ignore;
- **after the change**, any K4–K13 or K16 line differs from `claims-296-after-sketch.txt`.

A delta that matches `claims-296-after-sketch.txt` is **not** a STOP.

## 9. Deliverables
- **A:** `a-round-296.md` containing:
  - the changed files;
  - the claims before and after;
  - the covering-run counts and timings;
  - typecheck, lint and Biome;
  - the 4 mutant results;
  - the reviewer's findings and Architecture note.

  A STOP goes at the top.
- **C:** `c-round-296.md` and `c-round-296.json`, with evidence under `c-round-296/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish the 10 paths after C PASS and the gate.

## 10. Claims (`b-round-295/claims-296.sh`; expected `b-round-295/claims-296-output.txt`; after-sketch `b-round-295/claims-296-after-sketch.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `eded57a`; gate 295 `published eded57a` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1163 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `initialSelectedSourceId` count 0 in the context; default selection `collection.sources[0]?.id ?? null` at l.663 |
| K6 | `studio-lab.tsx`: `useSearchParams` 0, `arrangement-exit` 1, `data-source-id` 0 |
| K7 | `ProductSidebar.tsx` artist link at l.56; "Try it in the Studio" 0 in `app`; `product-studio-link` 0 |
| K8 | the 4 route test files each have 0 `useSearchParams` |
| K9 | SWEEP: LK ids 0 in `app perf e2e`; `studio-lab-links` referenced by no file |
| K10 | the first demo source is `demo-middle-east` (`studio-lab-demo.ts` l.45) |
| K11 | SWEEP: importers of `routes/studio-lab` are the 4 route test files |
| K12 | SWEEP: the only non-test `<ArrangementProvider` render site is `studio-lab.tsx` |
| K13 | line counts: ctx 4303, route 94, sidebar 98, obs 517, ssr 64, ng 440, dtn 62 |
| K14 | 0 quarter-IV docs start with 220 |
| K16 | the Redo keys `['Ctrl+Shift+Z', 'Ctrl+Y']` are in `shortcuts.ts` (1); the clip root carries `data-clip-id={clip.id}` (1) |
| K15 | B's artifacts exist (12 paths) |
