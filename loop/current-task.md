# CURRENT TASK — Round 147: V-0.5b — the library panel and the library preview in English, and the collection status messages (with the "＋ Add" name they mention)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 146 = **published**, commit `3328e753db68c2eb84c291e0b711f933e498ced7` on both remotes)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-146.md`, an exact copy of the round-146 `current-task.md` (sha256 `821b6ad4…0fd3`). Rationale: `b-round-146.md`. Decision record: **D-29z112** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline = clean HEAD `3328e753db68c2eb84c291e0b711f933e498ced7`.** B checked: `git status --short` is empty, and rounds 145 + 146 are published.
- **Frozen list:** `tmp/studio-real-loop/b-round-146-r147-tree-sha256.txt`, **950 entries**. That is `git ls-files -co --exclude-standard` (965) minus the 15 grants, hashed at 3328e75. B ran `sha256sum -c --quiet` from `store/`: OK.
- **Grants:** `b-round-146-r147-grants.txt` (15 existing files) and `b-round-146-r147-new-files.txt` (1 new doc). **Start hashes:** `b-round-146-r147-granted-start-sha256.txt`. **Start copies:** `b-round-146/r147-granted-start/` (paths relative to `store/`). A checks all three first. Any difference → A stops and reports.

## 0. Why this round (D-29z112)
- **Round 146: C PASS**, `browserVerified` = `realVerified` = true, and gate 146 published 145 + 146. V-0.5a → `c_pass`. These close: C-R145-01, ABL-B-1, C-R142-02, LIB-SEARCH-KEYWORDS, GATE144-S1, ARCH-R142, and both A-R145 review Lows. C-R146-01 (Low, pre-existing: a bottom-edge row's `▶ Playing` line can fall below the 1280 list viewport) → `deferred_low_polish`.
- **Checks at planning:**
  - The regression round is due on or after 2026-10-27. Today is 2026-10-24, so it is not due.
  - `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, except Tech Lead manual items.
- **Next V-0 stage = V-0.5b**, as planned in D-29z110: the rest of `ArrangementLibrary.tsx` (16 Georgian lines), `ArrangementLibraryPreview.tsx` (8) and the `collection.ts` status messages (10). B measured all 34 at 3328e75.
- **Why one round, not split.** The `ready` status names the preview's `＋ დამატება` button, and `empty`/`failed` name the library. Translating the preview without the statuses, or the reverse, would leave a sentence that names a control in the other language (GATE128-S1). The pin coupling is 68 test lines in 9 test files plus the ST47 ledger. The grant count (15 + 1) is the same size as round 145 (15 + 2).
- **Folded in (gate 146 suggestion 1, cheap, the round owns doc 119):** doc 119's status line and the round-146 testing line still say C has not run, but C round 146 passed.
- **Not in this round** (signals or deferred, see `b-round-146.md`): the preview-row height jump (gate-146 #2), `▶` read aloud (gate-146 #3), LRS3 exact className pins (gate-146 #4), `rowError('')` (gate-146 #6), the "library option row layout contract" proposal (gate-146 signal 3, only if V-0.5b breaks the row again), and `ArrangementVideoDock` `პრევიუ` (V-0.5c).

## 1. What changes (user-visible), exact
### 1.1 New object `studioLibraryPanelStrings` in `app/lib/arrangement/strings.ts` (appended after `studioSourceLoadStrings`; plain strings only, no formatter)
| key | value (exact) | used at (3328e75 line) |
|---|---|---|
| `library` | `Library` | ArrangementLibrary l.416 `aside aria-label`, l.443 `<h2>` |
| `expand` | `Expand library` | l.432 aria-label, l.433 title |
| `collapse` | `Collapse library` | l.449 aria-label, l.450 title |
| `searchPlaceholder` | `Search: name, type, collection…` (U+2026) | l.465 |
| `searchLabel` | `Search the library` | l.466 |
| `clearSearch` | `Clear search` | l.475 |
| `filterPrefix` | `Filter: ` (one trailing space) | l.485: `{studioLibraryPanelStrings.filterPrefix}<span className="text-brand">{activeNodeLabel}</span>` |
| `sidebarLabel` | `Library sidebar` | l.496 nav aria-label |
| `all` | `All` | l.514 |
| `fold` | `Fold` | l.526: `` aria-label={`${entry.label} — ${isExpanded ? studioLibraryPanelStrings.fold : studioLibraryPanelStrings.unfold}`} `` |
| `unfold` | `Unfold` | l.526 |
| `listLabel` | `Sounds` | l.577 listbox aria-label |
| `noResults` | `No sounds found.` | l.39: `const LIBRARY_EMPTY_MESSAGE = studioLibraryPanelStrings.noResults;` (name kept) |
| `widthLabel` | `Library width` | l.612 separator aria-label |
| `previewLabel` | `Preview` | ArrangementLibraryPreview l.220 section aria-label |
| `previewEmpty` | `Select a sound in the list` | l.226 |
| `previewWaveLabel` | `Preview waveform — click = play from here · ← → 1 s · Home/End · Space = ▶/■` | l.240 |
| `activeTrack` | `Active track:` | l.271 title `` `${studioLibraryPanelStrings.activeTrack} ${activeLaneName}${activeLaneVideoNote}` ``, l.273 visible text `{studioLibraryPanelStrings.activeTrack}{' '}` |
| `videoTrackNote` | ` (audio is not added here)` (one leading space) | l.105 |
| `previewPlay` | `▶ Preview` | l.307 (not previewing) |
| `previewStop` | `■ Stop` | l.307 (previewing) |
| `add` | `＋ Add` (U+FF0B, as today) | l.320 |

- The em dash in l.526 and l.240 is U+2014, and `·` is U+00B7, as today.
- Every other token of the two components stays byte-identical: classes, testids, conditions, handlers, glyphs `▶ ◀ × ▾ ▸`, the `· playhead` text and `'—'` fallbacks. The only other change is one import line per component. Biome may wrap the JSX.

### 1.2 `app/lib/arrangement/collection.ts` l.16–31 (statuses; `heading` and `fileStem` unchanged)
| key | demo (exact) | purchased (exact) |
|---|---|---|
| `badge` | `Demo collection — no sign-in required` | `Purchased collection` |
| `loading` | `Loading the demo collection…` | `Loading the purchased collection…` |
| `ready` | `` `Demo collection ready. Choose a track and add a sound (Enter or ${studioLibraryPanelStrings.add}).` `` | `` `Purchased collection ready. Choose a track and add a sound (Enter or ${studioLibraryPanelStrings.add}).` `` |
| `empty` | `The demo collection has no sounds — the library is empty.` | `The purchased collection has no sounds — the library is empty.` |
| `failed(count)` | `count === 1` → `1 sound in the demo collection failed to load — details are in the library.`; otherwise `` `${count} sounds in the demo collection failed to load — details are in the library.` `` | the same with `purchased collection` |

- `ready` interpolates the button's own constant, so the button and the sentence that names it cannot drift apart. The plural follows the strings.ts l.152–187 precedent.
- The import from `./strings` gains `studioLibraryPanelStrings`. No other line of `collection.ts` changes: the fetch, the guards and the round-145 `studioSourceLoadStrings` uses stay as they are.

### 1.3 Glossary (Live 12 terms where confirmed; B decisions recorded in D-29z112)
`ყველა ფაილი` → **All** (Live §4.2 "All label"). Collection arrow → **Fold / Unfold** (Live §4.5 "can be unfolded", §4.4.3 "fold and unfold … by clicking on the arrow"; glossary d29z98). The tree → **Library sidebar** (Live §4 layout "sidebar"). `პრევიუ` → **Preview** (Live §4 "Preview tab", §4.9 "Preview toggle"). The panel collapse uses **Expand / Collapse library**, following glossary d29z102 ("the library collapsed") and d29z107. Live's Show/Hide Browser is not in the capture, so it is unconfirmed. `წყარო` in user-visible statuses → **sound**, the word the panel itself uses ("Sounds", "No sounds found."). `ხაზი` → **track** (glossary).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | §1.1 object only (append) |
| `app/components/arrangement/ArrangementLibrary.tsx` | the 16 §1.1 uses + import |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | the 8 §1.1 uses + import |
| `app/lib/arrangement/collection.ts` | §1.2 + import |
| `app/lib/arrangement/__tests__/strings.test.ts` | ST47: `LIBRARY_REMAINING_GEORGIAN_LINES` and `COLLECTION_REMAINING_GEORGIAN_LINES` → `[]` (keep the demo ledger); add `../../../components/arrangement/ArrangementLibraryPreview.tsx` to both ST47 path loops (GUILLEMET and zero-Georgian), and move `ArrangementLibrary.tsx` and `collection.ts` into the zero-Georgian loop. New **ST49** (§3.1). ST47's title may drop "later V-0 stages" wording. Nothing else |
| `app/lib/arrangement/__tests__/collection.test.ts` | l.375–389: exact English per §1.2 (hand-written), plus `failed(1)` for both origins (§3.2) |
| `app/lib/arrangement/__tests__/collection-load-status.test.tsx` | l.50–57 constants → English (hand-written) |
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | l.32–39 constants and l.380 → English (hand-written) |
| `app/lib/arrangement/__tests__/library-preview.test.tsx` | the 11 Georgian expectation lines → English. Track-name fixtures (`მუსიკა`, `ვიდეო`) are data and stay. Nothing else |
| `app/lib/arrangement/__tests__/held-enter-add.test.tsx` | l.266 title, l.269, l.287: `＋ დამატება` → `＋ Add` |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | l.310 `'ხმები'` → `'Sounds'` |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | l.895 → `'Search the library'` |
| `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | l.361 → `'Search the library'` |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | new `it` **LRS4** and **LRS5** (§3.3). LRS1–LRS3 unchanged |
| `docs/implementation/2026/quarter-IV/119-studio-v0-library-source-strings.md` | l.4 → `**სტატუსი:** Completed (C round 146 — PASS, browserVerified; gate 146, 3328e75)`. In the l.91 round-146 line, `C round 146 ჯერ არ გაშვებულა` → the real C round-146 result (PASS, `browserVerified`). l.71 `LRS1–LRS2` → `LRS1–LRS2 (round 146: LRS3)`. Nothing else |
| **new** `docs/implementation/2026/quarter-IV/120-studio-v0-library-panel-strings.md` | V-0.5b implementation doc per `TEMPLATE.md`, in Georgian (`GEORGIAN_DOCS.md`). It includes the §1 per-string map (glossary extension), the "why one round" coupling, the Live sources of §5, and the testing section. Status `In Progress (C round 147 — ჯერ არ გაშვებულა)` |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Before the first Edit**, read the primitives the hook maps for these files: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md` (Studio), `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`. Also read `docs/implementation/TEMPLATE.md` (new doc).
- **Edit rule (C-R120-01):** make lasting edits only through Edit/Write. No shell writes under `store/`. A Biome-forced rewrap is allowed and must be reported. No `--write` and no `check:fix`.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a start check fails;
  - a non-granted test fails;
  - a diff appears outside the grants;
  - another test or source turns out to depend on one of the 34 Georgian strings (B's grep found none; e2e has none);
  - a needed change is not in this table.

## 3. A — tests and mutations (all literals hand-written; no module-against-module pins, GATE132-S4)
### 3.1 ST49 (`strings.test.ts`)
Three checks, all with hand-written literals:
- `Object.keys(studioLibraryPanelStrings).sort()` equals the 22 keys of §1.1, and every value equals its §1.1 literal (a hand-written `Record<string,string>`).
- No value contains a Georgian codepoint or `«»`.
- The codepoints are exact: `searchPlaceholder` ends with U+2026, `add` starts with U+FF0B, and `previewWaveLabel` contains U+2014 and U+00B7. Use `String.fromCodePoint` for these, as DL-VAL did.

### 3.2 `collection.test.ts`
The existing copy assertions (l.375–389) become the exact English of §1.2 for both origins, `failed(2)` included. Add `failed(1)` for both origins:
- demo `1 sound in the demo collection failed to load — details are in the library.`;
- purchased `1 sound in the purchased collection failed to load — details are in the library.`

Assert `ready` against the full hand-written sentence containing `(Enter or ＋ Add).`.

### 3.3 `library-row-strings-ui.test.tsx` (3 → 5 or 6 `it`, existing `mountRows`/StudioWorkspace harness; LRS5 may be one `it` with two mounts or two `it`s LRS5a/LRS5b, A says which)
**LRS4** (panel copy in the DOM). Use accessible-name queries (`getByRole(…, { name })`) wherever a role exists:
- `complementary` `Library`, and `heading` `Library`;
- `button` `Collapse library` with title `Collapse library`;
- `searchbox` `Search the library` with placeholder `Search: name, type, collection…`;
- `navigation` `Library sidebar`;
- a button whose text starts with `All` and is followed by the total count;
- `listbox` `Sounds`;
- `separator` `Library width`.

Then four interactions:
- **Fold toggle.** It starts as `button` `<collection label> — Fold` with `aria-expanded="true"`. A click turns it into `<label> — Unfold`, `aria-expanded="false"`, and that collection's folder buttons are gone. A second click restores them.
- **Search.** Type a non-matching query: `button` `Clear search` appears and the empty output text is `No sounds found.`. Clear search (Escape on the search box) restores the list.
- **Filter.** Click a collection label: the filter line reads `Filter: <label>`.
- **Collapse.** Click `Collapse library`: `button` `Expand library` with title `Expand library`. Click it: the panel is back.

**LRS5** (preview and status copy in the DOM, a demo collection with one sound that fails):
- `region` `Preview`;
- `slider` named exactly per §1.1;
- the toggle text `▶ Preview`, then `■ Stop` while previewing, then `▶ Preview` after stop;
- `button` `＋ Add`;
- the header badge text `Demo collection — no sign-in required`;
- the ready/failed status text exactly `1 sound in the demo collection failed to load — details are in the library.`;
- once with all sounds ready, the status text exactly `Demo collection ready. Choose a track and add a sound (Enter or ＋ Add).`, which **contains the rendered Add button's `textContent`**.

If the harness cannot reach one of these states without a new fixture, A may add a local fixture inside this test file only, and says so.

### 3.4 Mutations (Edit, restore by Edit, verify by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m101 | `studioLibraryPanelStrings.all` → `'All files'` | ST49, LRS4 |
| m102 | l.526 condition swapped (`isExpanded ? unfold : fold`) | LRS4 |
| m103 | `collection.ts` demo `failed`: the `count === 1` branch removed (always plural) | collection.test `failed(1)`, collection-load-status (`DEMO_ONE_FAILED`), LRS5 |
| m104 | `collection.ts` demo `ready`: the interpolation replaced by the literal `＋ Insert` | collection.test, collection-load-status, LRS5 |
| m105 | `ArrangementLibraryPreview.tsx` l.307 branches swapped | library-preview, LRS5 |
| m106 | `ArrangementLibraryPreview.tsx` l.220 value → the literal `'პრევიუ'` | ST47 (zero-Georgian loop) |

After each restore, the edited file's sha256 equals the post-edit hash, and `sha256sum -c b-round-146-r147-tree-sha256.txt --quiet` is OK.

### 3.5 Commands (speed rules)
- **Start:**
  - frozen list (950) OK;
  - the 15 start hashes and copies OK;
  - HEAD = 3328e75;
  - `git status --short` empty;
  - the new doc path does not exist.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the 14 changed code/test files gives 0 diagnostics.
- Run `npx vitest run` on these 17 files (B checked that all of them exist):
  - the 10 changed test files: strings, collection, collection-load-status, purchased-collection-ui, library-preview, held-enter-add, render-budget, fader-guards, grid-snap-keys, library-row-strings-ui;
  - 7 unchanged neighbours: `app/lib/arrangement/__tests__/{library,failed-source-refusal,status-announcement-ui,default-track-names-ssr,library-focus-handoff,library-video-return-focus}` and `app/data/__tests__/studio-lab-demo.test.ts`.

  Save `a-round-147/vitest.json`.
- Report per-file runtime `it` counts against 3328e75. Only these may change: strings (48 → 49), library-row-strings-ui (3 → 5 or 6, see §3.3), and collection only if A adds the `failed(1)` checks as new `it`s (say which).
- The **code-reviewer** is required (3+ changed files). Pass its Architecture note to B verbatim.
- **End:**
  - frozen list OK;
  - `git status --short` = the ` M` grants that changed, plus `?? docs/…/120-…md`, nothing else;
  - `git diff 3328e75 -- <protected>` empty;
  - `a-round-147/end-sha256.txt` for the 16 paths;
  - `a-round-147/diff-vs-start.patch` against the start copies.
  - A non-comment Georgian grep of the 3 source files returns 0 lines.
- **Not run:** the full suite, `npm run verify`, build and e2e (these are gate rows). No commit, stash, checkout or install.
- Write `a-round-147.md` as you go.

## 4. C — rows (real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, fresh context per session, Snap state recorded at start; both viewports 1440×900 and 1280×720)
**Harness:**
- Reuse `tmp/studio-real-loop/b-round-146/tools/{lib.cjs,libbase147.cjs}`. Their selectors are testid/role only, and they wait for either `იტვირთება…` or `Loading…`. Write every output new under `c-round-147/`.
- The **baseline** is `b-round-146/out/libbase147-{1440,1280}.json`. B captured it at 3328e75 before A ran. Its states are `ready`, `selected`, `previewing`, `emptySearch` (query `zzqx`), `filtered` (first collection label), `collapsed` and `error` (abort `**/middle-east.mp3`). Screenshots: `b-round-146/shots/`.
- Older C tools search for the Georgian `მოუსმინე` / `[aria-label="პრევიუ"]`. Use `[data-testid=arrangement-library-preview-toggle]` / `[data-testid=arrangement-library-preview]` instead.

| Row | Start state → action → expected |
|---|---|
| T147-TARGETED | A's vitest list; counts equal A's |
| SOURCE-SCOPE | frozen 950 OK at start and end; only granted paths differ from `b-round-146/r147-granted-start/`; end hashes = `a-round-147/end-sha256.txt`; `git status --short` = A's end set; protected diff vs 3328e75 empty; 0 non-comment Georgian lines in the 3 sources; no source change during C's phase |
| AN-REVIEW | §1.1/§1.2 exact, including the codepoints; ready interpolates the constant; no other token changed in the two components (diff vs start copies); ST49, LRS4, LRS5 and the pins assert what §3 says with hand-written literals; doc 119 has only the §2 edits; doc 120 is Georgian, follows TEMPLATE and is consistent with the evidence |
| COPY-LIB | From `ready`, by accessible name (`getByRole`): `complementary` `Library`, `heading` `Library`, the collapse button (aria + title), `searchbox` `Search the library` + placeholder, `navigation` `Library sidebar`, the `All` button with count `9`, each collection arrow `<label> — Fold` (`aria-expanded=true`), `listbox` `Sounds`, `separator` `Library width`. Then:<br>(a) Click the first arrow: its name is `… — Unfold`, `aria-expanded=false`, and its folders are hidden. Click again: restored.<br>(b) Type `zzqx`: `Clear search` appears, `No sounds found.` is visible, and the preview title reads `Select a sound in the list`. Press Escape in the search box: the query is cleared and the list returns (Live §4.2). Type again, then click `Clear search`: same result.<br>(c) Click a collection label: `Filter: <label>`.<br>(d) Collapse: `Expand library` (aria + title) on the rail. Expand: the panel is back with the same width.<br>(e) Neighbour: focus the separator, press ArrowRight, and check that `aria-valuenow` grows by 16 |
| COPY-PREVIEW | (a) `region` `Preview`. The slider name is exactly the §1.1 text. The lane line reads `Active track: Music · playhead 00:00.000`, and its title is `Active track: Music`.<br>(b) Make the video track active: the line shows `(audio is not added here)` and `＋ Add` is disabled.<br>(c) From an audio track, select Soft impact and press `▶ Preview`. Real playback: the waveform `aria-valuenow` advances within 1.5 s and `createBufferSource` count goes up by ≥ 1. The toggle reads `■ Stop` and the row shows `▶ Playing`. Press the toggle: it reads `▶ Preview` and the marker is gone.<br>(d) Click `＋ Add`: one clip of that sound appears on the active track. The status matches `“Soft impact” added to the … track at …`. Ctrl/Cmd+Z removes it.<br>(e) Neighbour: one Enter keypress on the focused `＋ Add` adds exactly one clip |
| COPY-STATUS | (a) Fresh context: the header badge reads `Demo collection — no sign-in required`. While the media load, the status reads `Loading the demo collection…`. To observe this, delay one media route by about 1.5 s with `page.route`; record if it is still too fast. Then the status reads exactly `Demo collection ready. Choose a track and add a sound (Enter or ＋ Add).`, which contains the Add button's visible text.<br>(b) Abort `**/middle-east.mp3`: `1 sound in the demo collection failed to load — details are in the library.`<br>(c) Abort two media URLs (C picks the second from the network log and names it): `2 sounds in the demo collection failed to load — details are in the library.` |
| NO-GEORGIAN | In `ready`, `previewing`, `emptySearch`, `filtered`, `collapsed` and `error`, collect the text, aria-label, title and placeholder of every node in the library subtree, plus the header badge and the status text. Count Georgian codepoints. Allowed: only the user-content sound titles and collection labels of the `studio-lab-demo.ts` ledger (`ღამის პულსი`, `საჯარო preview`, `სრული მიქსი`, `პულსი/ბასი/პადი/მელოდია`). List anything else as a finding. The video dock is outside this scope (V-0.5c) |
| LAYOUT-LIB | Compare each state with the same state in libbase147, per viewport.<br>**RV-1 V-0 exception, written before C runs (D-29z112 R5):**<br>• A node whose own copy changed may change its own `w`, and its `glyph` extent may change. These nodes are `lib-h2`, `tree-all-label`, `arrangement-library-filter` glyph, `arrangement-library-empty`, `preview-title` (emptySearch), `preview-lane` glyph, `preview-toggle`/`preview-add` glyph, `header-badge` and `status` glyph.<br>• Fixed boxes keep their box within ≤ 1 px: `preview-lane` (`h-8`), `preview-toggle`/`preview-add` (`flex-1`), `arrangement-library-empty` box, `tree-all` button, `status` box and `filter` box.<br>• In the header right group, `ArrangementMaster` may shift x by the badge's `w` delta (flex sibling).<br>• Everything else ≤ 1 px, including every option, the tree columns, the list, the preview section and the library root.<br>• Line counts: every changed node keeps 1 line, except `preview-lane`, which may be 1–2 inside its fixed box.<br>• `scrollWidth == clientWidth` for the list, the tree and every option in all states. The filter line keeps its existing `truncate`.<br>Report every > 1 px delta with its cause. An unexplained delta = FAIL. A predicted line-count difference with no overflow, clipping or overlap = inconclusive for B, not FAIL |
| LAYOUT-REST | Outside the library column and the header right group: nodes with d ≤ 1 px vs libbase147 `ready` (the transport, timeline, lanes and footer box) |
| PURCHASED-STATUS | BLOCKED (backend unavailable in cloud). Unit and jsdom evidence only (purchased-collection-ui, collection-load-status, collection.test) |
| G147-3 (alone, last) | `/studio-lab` shows the workspace and the English demo badge in a fresh anonymous context. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror. The known cart noise is expected |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbour risk:** none of these may change:
  - library keyboard navigation (ArrowDown from search into the list, Enter add);
  - option click/double-click/drag;
  - library collapse focus hand-off (the expand button gets focus after collapse and the collapse button after expand);
  - preview start/stop;
  - the render budget.

  Accessible-name changes affect only tests that query by name, and those are the granted ones.

## 5. Ableton source
Source: Live 12 Reference Manual, chapter 4 "Working with the Browser", https://www.ableton.com/en/live-manual/12/working-with-the-browser/. B's capture is `b-round-144/live/working-with-the-browser.{html,txt}`, fetched 2026-10-24 and re-read by B at this planning. Text offsets in the `.txt` are given in brackets.

| Behaviour | Section | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| An "All" entry that shows every item | §4.2 Search Bar [4568–6056] | "select the All label … Esc to clear the search field and show all items in the All label again" | `All` replaces `ყველა ფაილი`; Esc in the search box clears the query (already the behaviour) | COPY-LIB (b) |
| Fold/unfold of a group with its arrow | §4.5 Collections, §4.4.3 Tag Editor | "Folders … can be unfolded"; "fold and unfold the groups by clicking on the arrow next to a group's name" | arrow name `<label> — Fold/Unfold`; the behaviour is unchanged | COPY-LIB (a) |
| Sidebar / content pane | §4 intro, §4.1 | "The browser's sidebar contains the Collections, Library, and Places sections"; "The content pane displays the items" | nav = `Library sidebar`; the listbox stays `Sounds` (CZABA term; Live's "content pane" is not a user label) | COPY-LIB |
| Preview area and toggle | §4 intro, §4.9 Previewing Files | "The Preview tab displays a waveform … and plays back the sound when the Preview toggle is activated" | `region` `Preview`, button `▶ Preview` / `■ Stop`. Live's toggle is an on/off icon, while CZABA's is a labelled button: a deliberate difference | COPY-PREVIEW (c) |
| Showing/hiding the browser | not in this capture | unconfirmed | `Expand / Collapse library` (CZABA glossary d29z102/d29z107); no Live parity claim | COPY-LIB (d) |
| Collection load statuses, badge | none (CZABA-only) | not applicable | CZABA copy | COPY-STATUS |

C rates "CZABA requirement met" and "Ableton correspondence" separately. The statuses are: confirmed for rows 1–2, deliberate difference for row 4, unconfirmed for row 5, and not applicable for row 6.

## 6. Evidence and reporting
- C writes `c-round-147.md` and `c-round-147.json` as it goes. The JSON has `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `measurements` (accessible names, statuses, LAYOUT-LIB deltas with causes, Georgian counts), `invalidRuns` and `notesForB`. Evidence goes under `c-round-147/{tools,out,shots}/`. No writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.

## 7. Outcome, fixed in advance (B at round 148 planning)
| Condition | Round 148 |
|---|---|
| B plans on or after **2026-10-27** | the **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | a bounded fix-up (≤ 3 related bugs) |
| C FAIL only on a Low this round caused | a bounded fix-up, same owner |
| C FAIL only on a literal criterion with no app defect, or LAYOUT-LIB inconclusive only | B rules in writing; the next round is a re-check only, or V-0.5c carries the ruling |
| C PASS (new unrelated Lows → `deferred_low_polish`) | root publishes round 147. V-0.5b → `c_pass`. GATE146-S1 closes. Round 148 = **V-0.5c**: `ArrangementVideoDock.tsx` (17 lines), `routes/studio-lab.tsx` meta title + ST40, the default-track-names-ssr `console.error` assertion, `lang="en"` on the Studio root, the final RV-4 grep and the RV-1 baseline re-capture. When V-0.5 closes, B sends root the bounded frontend-architect checkpoint request (strings split, V-0 boundary) |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Commit readiness:** nothing new is publishable until C round 147 passes. Rounds 145 + 146 are published (3328e75).
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md` + addenda) stays open and non-blocking. This round adds the 23rd `studio*Strings` object (round-147 addendum). B asks for the checkpoint at the V-0.5 boundary, after V-0.5c.
