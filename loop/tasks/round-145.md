# CURRENT TASK — Round 145: VISUAL-A V-0.5a — library source-load errors, library row status, demo collection labels and library search keywords in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 144 = **published**)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-144.md`, an exact copy of the round-144 `current-task.md` (sha256 `86a17796…`). Rationale: `b-round-144.md`. Decision record: **D-29z110** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline:** gate 144 published **`9a67abd78b41162262c0882544dbdd4544afef1b`** on both remotes (rounds 142–144, V-0.4 complete). HEAD = 9a67abd and `git status --short` is **empty** at planning.
- **Frozen list:** `tmp/studio-real-loop/b-round-144-r145-tree-sha256.txt`, **948 entries** = `git ls-files -co --exclude-standard` (963) minus the 15 existing grants. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Grants:** `b-round-144-r145-grants.txt`: 15 existing files + 2 new files (`NEW` prefix). **Start hashes:** `b-round-144-r145-granted-start-sha256.txt`. **Start copies:** `b-round-144/r145-granted-start/` (paths relative to `store/`). A checks all three first. Any difference → A stops and reports.
- **Layout baseline (B, real Chromium, 9a67abd, clean tree):** `b-round-144/out/libbase-{1440,1280}.json` with states `ready`, `previewing`, `error`; screenshots `b-round-144/shots/libbase-*.png`; script `b-round-144/tools/libbase.cjs`. 0 errors, 0 forbidden requests, 0 hydration in all 4 contexts.

## 0. Why this round (D-29z110)
- **Round 144: C PASS**, `browserVerified` = `realVerified` = true, no bugs; C-R143-01 closed. Gate 144 published 9a67abd. **V-0.4e → done; V-0.4 complete.**
- **Next stage = V-0.5** (the last V-0 stage). Re-measured at 9a67abd: **82 Georgian non-comment source lines** in 7 files:

| File | Lines | Stage |
|---|---|---|
| `ArrangementLibrary.tsx` | 19 (l.120/122/125 row status → **V-0.5a**; 16 others → V-0.5b) | a + b |
| `collection.ts` | 19 (9 thrown errors + l.67 label → **V-0.5a**; 10 status messages l.16–20/26–30 → V-0.5b) | a + b |
| `studio-lab-demo.ts` | 19 (4 labels/notice + 5 thrown errors → **V-0.5a**; 9 sound-title lines stay, R3) | a |
| `ArrangementContext.tsx` | 1 (l.3468 load fallback) | **a** |
| `ArrangementLibraryPreview.tsx` | 8 | b |
| `ArrangementVideoDock.tsx` | 17 | c |
| `routes/studio-lab.tsx` | 1 (meta title, ST40) | c |

- **Split (R1), by dependency.** The library row prints `შეცდომა: ${error}` where the error text comes from `collection.ts`, `studio-lab-demo.ts` and the Context fallback. Moving either side alone would put two languages on one row (GATE128-S1 rule). So **V-0.5a moves every source-load error together with the row status block** (l.118–126 only). V-0.5b moves the rest of the library panel, the preview and the collection status messages (the `ready` message names the preview's `＋ დამატება` button, so they move together). V-0.5c moves the video dock, the route title, `lang="en"`, the final RV-4 grep and the RV-1 re-capture. Scope unchanged; three bounded rounds.
- **C-R142-02** (Low, `deferred_low_polish`: `stems` finds nothing) is fixed here because this round owns `library.ts` (2026-10-23 rule: a Low may be fixed early when the round owns the code and it is cheap). It is the planned **LIB-SEARCH-KEYWORDS** forward constraint and gate-144 review #4.
- **Gate-144 review #1** (doc 118 status still "In Progress") is folded in: doc edit, cheap.
- **Checks at planning:** regression due on/after 2026-10-27 (today 2026-10-24, not due); `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist; no strings-split checkpoint result (non-blocking); no Critical/High open; no Medium open except Tech Lead manual items.

### Rulings D-29z110
- **R1 — split** as above.
- **R2 — search keywords (LIB-SEARCH-KEYWORDS).** Search stops using the display labels. `library.ts` gets `LIBRARY_KIND_SEARCH_KEYWORDS: Record<WorkspaceSourceKind, readonly string[]>` = `{ music: ['music'], stem: ['stem', 'stems'], sfx: ['sfx'] }`, and `matchesLibraryQuery` uses `[source.title, ...LIBRARY_KIND_SEARCH_KEYWORDS[source.kind], source.collectionLabel]`. Display labels (`LIBRARY_KIND_LABELS`, `LIBRARY_FOLDER_LABELS`) stay byte-identical. **Georgian search synonyms are not added:** nobody requested them, V-0 makes the Studio English-only, and the module contract/ST44 forbid Georgian in these sources. Recorded as signal `LIB-SEARCH-GEORGIAN-SYNONYMS` (info) for Saba, not scheduled.
- **R2b — `sfx` matching the Music previews** through their collection label (`CZABA public previews + synthetic SFX`) is intended: the collection label is searchable (LIB-03) and the label truthfully says that collection holds SFX. No change.
- **R3 — demo sound titles stay** (D-29z92 inventory rule: demo sound titles are sound names). Unchanged: `SYNTHETIC_COMPOSITION_TITLE` (l.13), `demoStemTitles` (l.35–38), the `title` values l.44, l.51 and `title`/`shortTitle` l.72–73. Labels, the notice and thrown errors are copy and move. A title interpolated into English copy (`Synthetic demo · ღამის პულსი`) is user content inside English, the same accepted pattern as statuses naming a sound.
- **R4 — where the strings live.** Thrown errors, the Context fallback, the purchased collection label and the row status go into a new `studioSourceLoadStrings` in `strings.ts` (shared by `collection.ts` and `studio-lab-demo.ts`: one source for identical messages). The demo collection labels and notice stay as English literals in `studio-lab-demo.ts` (data, like the English default track names in `studio-lab.tsx`).
- **R5 — layout (written before C runs; lesson of C-R143-01).** The RV-1 V-0 text-width exception applies inside the library column only: a changed text node may change its own width and height, flex siblings after it shift x by that width delta, its containers grow by its line delta and later nodes in the column shift y by the sum. Exact rules: §4 LAYOUT-LIB (i)–(vi). Everything outside the library column must not move.

## 1. What changes (user-visible)
### 1.1 `studioSourceLoadStrings` (new, appended as the last export of `strings.ts`; exact values)
| Key | Value (exact) | Replaces |
|---|---|---|
| `networkFailed` | `File failed to load (network)` | collection.ts l.93, l.105; studio-lab-demo.ts l.113, l.125 |
| `httpFailed` | `(status: number): string => \`File failed to load (${status})\`` | collection.ts l.96; studio-lab-demo.ts l.116 |
| `decodeFailed` | `File could not be decoded` | collection.ts l.110; studio-lab-demo.ts l.130 |
| `unknownSource` | `Unknown source` | collection.ts l.84 |
| `unknownDemoSource` | `Unknown demo source` | studio-lab-demo.ts l.135 |
| `purchasedNoProductId` | `The purchased collection has no productId` | collection.ts l.54 |
| `purchasedNoStems` | `The purchased collection has no stems` | collection.ts l.57 |
| `purchasedDuplicateStemId` | `A stem id repeats in the purchased collection` | collection.ts l.63 |
| `purchasedCollectionLabel` | `(productTitle: string): string => \`${productTitle} · purchased stems\`` | collection.ts l.67 |
| `loadFailedFallback` | `Loading failed` | ArrangementContext.tsx l.3468 |
| `rowLoading` | `Loading…` (U+2026) | ArrangementLibrary.tsx l.120 |
| `rowError` | `(message: string): string => \`Error: ${message}\`` | ArrangementLibrary.tsx l.122 (caller keeps `state.error ?? ''`) |
| `rowPreviewing` | `▶ Playing` | ArrangementLibrary.tsx l.125 |

No imports in `strings.ts` (leaf rule). No other object, key or value in `strings.ts` changes.

### 1.2 Data copy in `studio-lab-demo.ts` (English literals stay in the file, R4)
| ID | Line | After (exact) |
|---|---|---|
| DM1 | l.11 `DEMO_COLLECTION_LABEL` | `'Demo collection · CZABA public previews + synthetic sounds'` |
| DM2 | l.12 `PUBLIC_PREVIEW_COLLECTION_LABEL` | `'CZABA public previews + synthetic SFX'` |
| DM3 | l.14 `SYNTHETIC_COLLECTION_LABEL` | `` `Synthetic demo · ${SYNTHETIC_COMPOSITION_TITLE}` `` |
| DM4 | l.154 `notice` | `'The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.'` (U+2014) |
| DM5 | l.113/116/125/130/135 | `studioSourceLoadStrings.networkFailed` / `.httpFailed(response.status)` / `.networkFailed` / `.decodeFailed` / `.unknownDemoSource`, + one import |

### 1.3 Other source edits
| ID | File / line | After |
|---|---|---|
| CO1 | `collection.ts` l.54/57/63/67/84/93/96/105/110 | the §1.1 keys, + one import. l.16–30 (status messages) **unchanged** (V-0.5b) |
| CX1 | `ArrangementContext.tsx` l.3468 | `error: error instanceof Error ? error.message : studioSourceLoadStrings.loadFailedFallback,` and the name added to the existing `~/lib/arrangement/strings` import. **Nothing else** in the file changes |
| LR1 | `ArrangementLibrary.tsx` l.118–126 | `studioSourceLoadStrings.rowLoading`, `studioSourceLoadStrings.rowError(state.error ?? '')`, `studioSourceLoadStrings.rowPreviewing`, + one import. No class, testid, element or condition changes. Every other line of the file, including the 16 other Georgian lines, is unchanged (V-0.5b) |
| KW1 | `library.ts` | R2: export `LIBRARY_KIND_SEARCH_KEYWORDS` and use it in `matchesLibraryQuery`. Nothing else changes |

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | §1.1 only (new last export) |
| `app/lib/arrangement/library.ts` | KW1 only |
| `app/lib/arrangement/collection.ts` | CO1 only |
| `app/data/studio-lab-demo.ts` | DM1–DM5 only |
| `app/contexts/ArrangementContext.tsx` | CX1 only (1 line + 1 import name) |
| `app/components/arrangement/ArrangementLibrary.tsx` | LR1 only (3 expressions + 1 import line) |
| `app/lib/arrangement/__tests__/strings.test.ts` | ST13 ledger (§3.1), the l.1905 length assertion, the new describe (§3.1). Nothing else |
| `app/lib/arrangement/__tests__/library.test.ts` | one new `it` LIB-KW (§3.2). Fixtures (`PUBLIC`, `SYNTH`, Georgian titles) are test data and stay |
| The 6 pin files of §3.3 | only the listed lines |
| `docs/.../118-studio-v0-detail-library-strings.md` | l.4 → `Completed (C round 144 — PASS, browserVerified; gate 144 — 9a67abd)`; the round-144 testing line "result pending" → `C round 144 — PASS (browserVerified; LAYOUT-1440 placeholder = D-29z109 box)`. Locate by content. Nothing else |
| **new** `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | LRS1–LRS2 (§3.4) |
| **new** `docs/implementation/2026/quarter-IV/119-studio-v0-library-source-strings.md` | Georgian, `docs/implementation/TEMPLATE.md` sections, the per-string map (§1.1/§1.2, glossary rule), rulings R1–R5; status says C round 145 has not run yet |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Before editing** read the primitives the hook maps (`AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` for Studio files, `GEORGIAN_DOCS.md` for docs, `TESTING_QUALITY_GATES.md` for tests) **before** the first Edit (round-144 deviation: they were read after).
- **Edit rule (C-R120-01):** lasting edits only through Edit/Write; no shell writes under `store/`. A Biome-forced rewrap of a changed line is allowed and reported; no `--write`/`check:fix`.
- **Stop rule:** A stops and reports, without widening scope, if a start check fails, a non-granted test fails, a diff appears outside the grants, or a needed change is not in this table.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (44 → 48 `it`)
- **ST13:** `CONTEXT_REMAINING_GEORGIAN_LINES` becomes `[]`; l.1905 `toHaveLength(1)` → `toHaveLength(0)`. The ST13 title may say that no Georgian lines are left in ArrangementContext.
- **New `describe('V-0.5a source-load strings')`:**
  - **ST45** every plain-string property of `studioSourceLoadStrings` equals its §1.1 literal; the key list equals exactly the 13 §1.1 keys.
  - **ST46** formatters: `httpFailed(404)` = `File failed to load (404)`; `rowError('File could not be decoded')` = `Error: File could not be decoded`; `purchasedCollectionLabel('Middle East')` = `Middle East · purchased stems`.
  - **ST47** Georgian-line ledgers (comments stripped, same normalisation as ST13): `ArrangementLibrary.tsx` = exactly its 16 remaining lines (9a67abd l.38, 408, 424, 425, 435, 441, 442, 457, 458, 467, 477, 488, 506, 518, 569, 604); `collection.ts` = exactly l.16–20 and l.26–30; `studio-lab-demo.ts` = exactly the 9 R3 title lines (l.13, 35–38, 44, 51, 72, 73); `library.ts`, `strings.ts` and the new test file have none, and no «».
  - **ST48** every `LIBRARY_KIND_LABELS[kind]` and `LIBRARY_FOLDER_LABELS[kind]`, lower-cased, is in `LIBRARY_KIND_SEARCH_KEYWORDS[kind]` (a future label edit cannot silently break search).
### 3.2 `library.test.ts` (+1 `it`, LIB-KW)
With the existing fixtures: `stems`, `Stems`, `STEMS` and `stem` → the 4 stem ids; `music` → unchanged ids; `sfx` → exactly the fixture sfx ids; `stems პადი` → `['pad']`. The existing l.80–81 assertions stay.
### 3.3 Pin replacements (exact English from §1.1/§1.2; nothing else on those lines; `it` counts unchanged)
| File | Lines (9a67abd) |
|---|---|
| `collection.test.ts` | 84, 92, 100, 108, 116 (`Middle East · purchased stems`), 253, 280, 307, 310 (the `it` title words `უცნობი წყარო` → `Unknown source`), 327, 354 |
| `failed-source-refusal.test.tsx` | 90; 200 (`'(ქსელი)'` → `'(network)'`, so the negative check is not vacuous) |
| `status-announcement-ui.test.tsx` | 31 |
| `app/data/__tests__/studio-lab-demo.test.ts` | 9, 10, 144, 212 |
| `purchased-collection-ui.test.tsx` | 326 (`'Error: File failed to load (403)'`, hand-written), 327 (`'Error'`) |
| `collection-load-status.test.tsx` | 59 (`ROW_LOADING = 'Loading…'`) only; l.50–57 stay (V-0.5b) |
### 3.4 New `library-row-strings-ui.test.tsx` (jsdom, model on the `purchased-collection-ui` / `library-preview` harnesses)
- **LRS1:** start a library preview on a ready source → its row contains the hand-written `▶ Playing`; stop → it is gone.
- **LRS2:** a collection whose loader rejects with a non-`Error` value → that row contains the hand-written `Error: Loading failed`; another, ready row contains no `Error`.
### 3.5 Mutations (each turns the named tests red; restore and verify by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m91 | `networkFailed` → `'File failed to load (net)'` | ST45, collection.test l.280/354, studio-lab-demo.test, failed-source-refusal, status-announcement-ui |
| m92 | `rowError` drops the `Error: ` prefix | ST46, purchased-collection-ui l.326, LRS2 |
| m93 | CX1 fallback → literal `'Load failed'` | LRS2 |
| m94 | `stem: ['stem']` (drop `stems`) | LIB-KW, ST48 |
| m95 | LR1 row loading back to `'იტვირთება…'` | ST47, collection-load-status (ROW_LOADING) |
| m96 | `rowPreviewing` → `'▶ Play'` | ST45, LRS1 |
### 3.6 Commands (speed rules)
- **Start:** frozen list (948) OK; 15 start hashes and copies OK; HEAD = 9a67abd; `git status --short` empty.
- `npm run typecheck` and `npm run lint` exit 0; read-only `npx biome check` on every changed file → 0 new diagnostics.
- `npx vitest run` on: strings, library, collection, collection-load-status, purchased-collection-ui, failed-source-refusal, status-announcement-ui, studio-lab-demo, library-row-strings-ui, and neighbours library-preview, held-enter-add, render-budget, fader-guards, grid-snap-keys. Save `a-round-145/vitest.json`; report per-file `it` counts before/after (only strings +4, library +1 and the new file +2 may change).
- **code-reviewer** required (3+ files); pass its Architecture note to B.
- **End:** frozen list OK; `git status --short` = exactly the changed grants (≤ 15 ` M` + 2 `??`); `git diff 9a67abd -- <protected>` empty; `git diff 9a67abd -- app/contexts/ArrangementContext.tsx` = only CX1; the `ArrangementLibrary.tsx` diff = only LR1; end sha256 of every granted path in `a-round-145/end-sha256.txt`; diff vs start copies in `a-round-145/diff-vs-start.patch`.
- Not run: full suite, `npm run verify`, build, e2e (gate). No commit, stash, checkout, install.
- Write `a-round-145.md` as you go.

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, fresh context per session, Snap state recorded at start (default off). Both viewports: 1440×900 and 1280×720. Reuse `b-round-144/tools/libbase.cjs` and `c-round-144/tools/lib.cjs` freely; every output new under `c-round-145/`. **Harness note:** `lib.cjs` `openStudio` and `libbase.cjs` wait for rows matching `/იტვირთება…/`; after this round rows read `Loading…`. Make the wait accept both, or it returns before loading ends. First load of a job: a crashed setup run may be discarded and replaced once (ENV-FIRST-LOAD-GRID-NULL).

| Row | Start state → action → expected |
|---|---|
| T145-TARGETED | A's vitest list; counts equal A's |
| SOURCE-SCOPE | frozen 948 OK at start and end; only granted paths differ from `b-round-144/r145-granted-start/`; end hashes = `a-round-145/end-sha256.txt`; Context diff = CX1 only; ArrangementLibrary diff = LR1 only; protected diff vs 9a67abd empty; no source change during C's phase |
| AN-REVIEW | every §1 value exact (U+2026, U+2014, `·`); the R3 title lines unchanged; doc 118 has only its two edits; doc 119 is Georgian and consistent with the evidence |
| LIB-ROW-TEXT | (a) delay `**/middle-east.mp3` ~3 s via `page.route` → its row shows exactly `Loading…`, then the duration. (b) abort `**/middle-east.mp3` → row meta = `Music` + `Error: File failed to load (network)`; selecting it and pressing Enter with the Music track active gives the English `sourceFailed` status. (c) fulfil it with status 404 → `Error: File failed to load (404)`. (d) fulfil it 200 with 64 random bytes → `Error: File could not be decoded`. (e) select Soft impact and press the preview play button → its row shows `▶ Playing` and the preview waveform's `aria-valuenow` advances within 1.5 s (real playback); press again → the marker is gone. No row meta line contains Georgian |
| LIB-LABELS | tree collection labels = DM2 and DM3 exactly (DM3 with the Georgian title), notice = DM4 exactly; DM1 (`collection.label`) has no render site on `/studio-lab` by B's grep at 9a67abd: C reports where it appears if it does; otherwise it is covered by AN-REVIEW and unit tests only, not a gap; folder labels, kind chips and sound titles unchanged vs `libbase` (`Music 2, SFX 2, Music 1, Stems 4`). Still Georgian and expected (V-0.5b/c, not a failure): the 16 other ArrangementLibrary strings, the preview, the dock, the collection status line, `ყველა ფაილი` |
| LIB-SEARCH | `stems`, `Stems`, `stem` → the 4 stems; `music` → middle-east, hero, synth-mix; `sfx` → middle-east, hero, soft-impact, slow-rise (R2b); `soft sfx` → soft-impact (AND, Live §4.2); `მუსიკა` → none; empty → 9. After `stems`, select the bass stem and press Enter with the Stems track active → the clip is added and the status is the English `clipAdded` text |
| LAYOUT-LIB | compare `ready`, `previewing` and `error` with `b-round-144/out/libbase-{W}.json`. **Reproduce each state with the same action sequence as `libbase.cjs`:** `ready` = fresh context, sources loaded, Snap off; `previewing` = from `ready`, click the Soft impact option, then press the preview play button; `error` = a separate fresh context with `page.route('**/middle-east.mp3', abort)` before navigation. No scrolling, search or other selection. Rules (RV-1 V-0 text-width exception, `rv1_rule_v0`):<br>(i) library root, tree nav, list, search box and preview container: x/y/w/h ≤ 1 px.<br>(ii) a **changed text node** (row meta spans: loading / error / `▶ Playing`; tree collection labels; the notice) may change its own **w** and its own **h** (by whole lines);<br>(iii) a flex sibling after a changed span in the same row may shift **x** by exactly that span's w delta (± 1 px);<br>(iv) the containers of a changed node (meta row, option button, tree node) may change **h** by the same line delta, and nodes after them in the same column shift **y** by exactly the sum (± 1 px);<br>(v) every other node: x/y/w/h ≤ 1 px;<br>(vi) no new horizontal overflow, no clipped row text, and tree and list still scroll to their last item.<br>Report every > 1 px delta with its cause (which changed node, which rule). Any unexplained delta = FAIL |
| LAYOUT-REST | outside the library column (ruler, track headers, lanes, detail panel, transport) nothing moves: d ≤ 1 px between the `ready` state and the same viewport's `error` / `previewing` states, and the library root box equals `libbase` ± 1 px |
| PURCHASED-LABEL | BLOCKED (backend unavailable in cloud); unit evidence only (collection.test l.84) |
| G145-3 (alone, last) | `/studio-lab` shows the workspace and demo badge in a fresh anonymous context; `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`; `GET /api/studio-token?…` → 401; fake-Bearer 403 BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror (the known cart noise is expected) |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbour risk:** library add/drop flows that read the row state (conditions unchanged); search results used by keyboard add; the purchased route's tree label (unit-only); status messages that quote a loader error.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Multi-word search = AND | Live 12 Reference Manual, "Working with the Browser" §4.2 Search Bar, https://www.ableton.com/en/live-manual/12/working-with-the-browser/ (fetched by B 2026-10-24, `b-round-144/live/working-with-the-browser.html`, sha256 `f4d5c5d0…`): "results will include files that match all search terms, as opposed to any" | confirmed | already AND; unchanged | LIB-SEARCH `soft sfx` |
| Kind/plural keywords | same §4.2: the search field "helps you find browser items and tagged content" | inference only (Live tags ≠ CZABA kind keywords) | CZABA kind keywords incl. the plural; conscious simplification | LIB-SEARCH `stems` |
| Root "All" label / collection fold-unfold | §4.2 "select the All label"; §4.5 Collections "can be unfolded" | confirmed (terms) | applied in V-0.5b, not this round | — |
| Row loading / error / playing text | not in the capture | unconfirmed | CZABA-only copy; no Live claim | LIB-ROW-TEXT |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 6. Evidence and reporting
- C writes `c-round-145.md` and `c-round-145.json` as it goes: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `measurements` (row texts, search ids, LAYOUT-LIB deltas with causes), `invalidRuns`, `notesForB`. Evidence goes under `c-round-145/{tools,out,shots}/`; no writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.

## 7. Outcome, fixed in advance (B at round 146 planning)
| Condition | Round 146 |
|---|---|
| B plans on or after **2026-10-27** | the **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | a bounded fix-up (≤ 3 related bugs) |
| C FAIL only on a literal criterion with no app defect | B rules in writing; the next round is a re-check only |
| C PASS (new Lows → `deferred_low_polish`) | V-0.5a → `c_pass`, C-R142-02 closed; after the gate publishes, round 146 = **V-0.5b**: the rest of `ArrangementLibrary.tsx` (16, incl. `All` per Live §4.2, fold/unfold per §4.5, search copy), `ArrangementLibraryPreview.tsx` (8), `collection.ts` status messages (10) |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Commit readiness:** after C PASS root may publish round 145 as V-0.5a.
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md` + addenda) is repeated at the V-0.4 feature boundary in `b-round-144.md` §5; non-blocking.
