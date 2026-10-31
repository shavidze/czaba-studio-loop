# Round 289: FIX-PD-1b. English demo names (F7, Medium) and the collection label shown once as a library group heading (SR-230-6)

**Planned by:** B, at the round 288 → 289 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z707:** round 288 (FIX-PD-1a2) is closed.
  - C PASSED, with `browserVerified` and `realVerified` both true; gate 288 published `c345def`. **F9 is closed.**
  - Closed: C-R286-01/02, C-R287-01, A-R287-PREMIUM-UNVALIDATED, and C-R186-01 (by L7).
- **D-29z708:** A-R288-ARCH-LEADING-SPANS is recorded as a signal only.
- **D-29z709:** this round's names, group-heading rule, wrap ruling, biome-ignore ruling and buyer-side change, all detailed below.

**Owner:** A. **Verifier:** C. **Grants:** §4.
- This round touches no Store, auth, cart, checkout, purchase or protected file.
- It does not touch audio, playback, export or video code either. Demo audio is keyed by source id, not by title [K17].

## Baseline: HEAD `c345def` [K1], clean tree [K2]
- `gates/gate-round-288.json` is `published`, commit `c345def…`.
- **Claims (L29):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-288/claims-289.sh` **before editing**. Its output must equal `b-round-288/claims-289-output.txt`. Any difference is a STOP (§8).
- If HEAD moves through a root-only commit and `git diff c345def HEAD -- app` stays empty, that is accepted with a note.

## 0. Read first
1. `lessons.md` (every role), especially L3, L4, L12, L23, L26, L28, L29, L39, L51 and L54.
2. This task.
3. Product review F7 and SR-230-6: `/home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md` l.81–87 and l.154.
4. A's primitives:
   - `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md` (component edit)
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (tokens only, no custom CSS)
   - `AUDIO_ARCHITECTURE.md` (read only: Studio file; no audio change)
   - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`
   - `GEORGIAN_DOCS.md`

## 1. Why, and the promise (L55)
**Promise:** "an English-only Studio UI where a stem's short name is never ambiguous: you can always see which collection it belongs to, without the label repeating on every card."

**Today's problem:**
- The demo data is Georgian [K3]. Studio strings are English-only (plan R5); only the demo data was missed.
- Each synthetic card repeats `Synthetic demo · ღამის პულსი` under its short title [K5]. Five cards repeat it five times.

**What the browser shows today** (B baseline, `b-round-288/probe/journey-head.json` and `sketch.json`, both viewports):
- **Georgian text:** 8 Georgian text lines in the body before any edit, plus 9 Georgian `title`/`aria-label` attributes. After adding Bass, the clip name, the status, the Undo button and the footer "Clip:" line are Georgian as well [K20].

## 2. Reference: how Ableton Live 12 does it
Source: Live 12 manual, "Working with the Browser", https://www.ableton.com/en/live-manual/12/working-with-the-browser/. It was cited by `product-designer` on 2026-10-31 (§4.1 Content Pane, §4.2 Search Bar, §4.6 Library).

| Point | Live 12 (confirmed in the manual) | CZABA after this round | C row |
|---|---|---|---|
| Behaviour | The content pane lists items by **Name**; other columns are optional (4.1). The **All** label shows every item from every label in one list (4.6), and search over the whole Library runs under All (4.2) | The All view lists every source, in the same order as today | B-KEYS |
| Location of an item in results | **Not confirmed.** The manual does not describe a per-row location or a group header in search results. Root measurement requested: LIVE-MEAS-BROWSER-SEARCH-LOCATION (`user-review/live-checks.md`; non-blocking) | One collection heading per group, shown only when the results span ≥ 2 collections | B-GROUPS, B-STATES |
| Names | Live shows the file or device name | Names are English, `<composition> · <part>`; the short title shows on the card and the full title in its `title` | B-NAMES |
| Cursor, hover, selected | Unchanged by this round | Options keep their current hover and selected classes. Headings get no hover and take no focus | B-KEYS |
| Shortcuts | Arrow keys move through the content pane | Up and Down move through options only and skip headings. The order is `resultIds` [K7] | B-KEYS |
| Visuals | — | The heading is `text-xs`, muted, and wraps | B-GROUPS |

**Deviations:**
1. **Group headings.**
   - Reason: CZABA's card shows a **short** title ("Bass") to fit a 144 px list. Without its collection, a short title is ambiguous. Live has no short-title concept.
   - Why it is better than Live: the label is said once, instead of repeated on each card or hidden.
   - Saba approved this direction (SR-230-6, endorse + F7). Per L44, the Live-difference itself is listed for Saba once in `b-round-288.md`.
2. **Stem part names.**
   - "Pulse" and "Melody" are faithful translations, chosen as defaults.
   - The alternatives "Rhythm" and "Lead" go to Saba as SABA-Q-FIXPD1B-NAMES. The question is non-blocking.

**Product-designer** (consulted 2026-10-31; framing: "remove Georgian, say the collection once").

Chosen:
- **Element:** an ARIA `group` inside the listbox, labelled by a plain heading `div`.
- **When:** only when the results contain ≥ 2 distinct collections.
- **Which groups:** every group gets a heading.

Rejected:
- A header row without a group role: screen-reader users lose the context.
- A sticky heading: `scrollIntoView` would hide the focused first option at 1280.
- Always showing the heading: it repeats the tree node and breaks the screen budget.
- Headings only on short-title groups: preview items would look like members of the group above.

**B override (D-29z709, measured):**
- The designer proposed truncating the heading to one line. At the **default list width of 144 px**, **both** labels truncate (`sketch.json`: `truncated: true` for both).
- So the heading **wraps** (`break-words`), as the option titles already do. The wrapped heights are 59.5 px and 43 px (`sketch-wrap.json`).
- SR-275-6 (shorter collection label) is still `awaiting_user`. This round does not rename the public-preview label.

## 3. What changes
### 3.1 `app/data/studio-lab-demo.ts`: English demo data
Only the 9 Georgian literals change [K3]. Ids, `kind`, `bpm`, `origin`, the other labels and the notice [K4], and every loader stay byte-identical.

| Line | Before → After |
|---|---|
| `SYNTHETIC_COMPOSITION_TITLE` | `'ღამის პულსი'` → `'Night Pulse'` (so `SYNTHETIC_COLLECTION_LABEL` becomes `Synthetic demo · Night Pulse`) |
| `pulse` / `bass` / `pad` / `lead` | → `'Pulse'` / `'Bass'` / `'Pad'` / `'Melody'` |
| `demo-middle-east` title | → `'Middle East — public preview'` |
| `demo-hero-music` title | → `'CZABA hero — public preview'` |
| `demo-synth-mix` title | → `` `${SYNTHETIC_COMPOSITION_TITLE} · Full mix` `` |
| `demo-synth-mix` shortTitle | → `'Full mix'` |

After the edit, `grep -nP '[\x{10A0}-\x{10FF}]' app/data/studio-lab-demo.ts` returns 0 lines.

### 3.2 `app/components/arrangement/ArrangementLibrary.tsx`: the group heading
1. **Remove the per-option collection line.** This is the `{source.shortTitle ? (<span … data-testid="arrangement-library-option-context">{source.collectionLabel}</span>) : null}` block [K5].
   - The option keeps `title={source.title}` [K5], the title span, the kind/duration row and the Playing row unchanged.
   - Sweep: the testid has 1 hit in `app`, `perf` and `e2e`, the component itself [K11]. No test references it.
2. **Group the rendered options** inside the existing `role="listbox"` [K6]:
   - Build the groups in a `useMemo` from `results`, as **contiguous runs** of equal `collectionLabel`. The DOM order must equal `resultIds` order [K7].
   - Do not regroup by first appearance. Keyboard order comes from `resultIds`, so a regrouped DOM would move the focus visually out of order.
   - **When there are ≥ 2 runs,** wrap each run as:
     ```
     <div role="group" aria-labelledby={id} className="space-y-1">
       <div id={id} className="break-words px-2 pt-2 pb-0.5 text-xs leading-snug text-muted">{label}</div>
       …options
     </div>
     ```
     The heading id is unique per instance, from `useId()` plus the run index. Key each group by that id.
   - **When there are 0 or 1 runs,** render the options exactly as today, with no wrapper element and no heading.
   - **Deliberate edge rule (D-29z709):** a label that comes back after another one (results A, B, A) gives **3** groups, and heading A appears twice. Demo and purchased data cannot produce this today: each collection is contiguous in source order. Order is never traded for fewer headings.
   - The heading is a plain `div`. It is never `role="heading"` or `h*` (not allowed inside a listbox), never focusable and never an option.
   - The option props stay unchanged, including the `isFocusTarget` rule, which keeps using the index into `results`/`resultIds` [K6].
3. **Biome ruling.** Biome's `lint/a11y/useSemanticElements` flags `role="group"` and asks for `<fieldset>`. B ran this on a scratch copy.
   - Use the existing precedent [K12]: one `// biome-ignore lint/a11y/useSemanticElements: a listbox may own role=group children only; a native fieldset is a form-control grouping` line directly above the group `div`.
   - No other ignore is allowed.
4. **Imports.** `Fragment` and `useId` from `react` are new [K16]. No other new import.
5. **Spacing.**
   - The listbox keeps `space-y-1` [K6], so the gap between options inside a group stays 4 px.
   - The gap at a group boundary is the heading block. It measured 51 px in the B sketch.

**Not changed:**
- the tree (`nav`);
- the search haystack, which already contains `collectionLabel` [K8];
- `library.ts`, `collection.ts` and `strings.ts`;
- status, Undo and clip name code [K14][K18];
- the preview panel.

**Buyer-side effect (recorded, D-29z709):** a purchased collection sets `shortTitle` and one `collectionLabel` [K13]. Its stems lose the per-card product line, and no heading shows because there is one run. The product name stays visible in the tree node, in each option's `title` and in the clip names.

### 3.3 Tests
1. **Pins of the old data.** Each is a replacement; no assertion is lost (L4).
   - `app/lib/arrangement/__tests__/strings.test.ts`: `DEMO_REMAINING_GEORGIAN_LINES` (the 9-entry array [K9]) becomes `const DEMO_REMAINING_GEORGIAN_LINES: readonly string[] = [];`. The assertion that uses it stays.
   - `app/data/__tests__/studio-lab-demo.test.ts` l.248 [K9]: `'Synthetic demo · ღამის პულსი'` → `'Synthetic demo · Night Pulse'`.
   - **Add DL-EN** to `studio-lab-demo.test.ts`: the 9 sources' `title` and `shortTitle` equal the exact table in §3.1, and no `title`, `shortTitle` or `collectionLabel` matches `/[Ⴀ-ჿ]/`.
2. **SWEEP [K10]** (roots `app`, `perf`, `e2e`; demo terms). There are 4 files:
   - the data file;
   - the 2 pins above;
   - `library.test.ts` (12 hits). These are **its own fixture**, independent of the demo file, so it stays unchanged (ruled).
   
   Other Georgian strings in the tests are legacy track-name fixtures (`მუსიკა`, `ვიდეო`, `სტემები`); they are out of scope.
3. **New file `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx`.**
   - Render the library the way `library-row-strings-ui.test.tsx` [K19] does, with a two-collection fixture (one group with `shortTitle`, one without).
   - Find elements by role and accessible name (L12), never by class.
   - Rows:
     - **LG1:** All view → exactly 2 `group`s inside the `listbox`, with accessible names equal to the labels. 0 `arrangement-library-option-context` elements. `getAllByRole('option')` lists the options in source order.
     - **LG2:** each heading is not focusable (`tabIndex` < 0 or absent, not `role=option` or `heading`). ArrowDown from the first option visits every option in `resultIds` order and never focuses a heading. ArrowUp returns.
     - **LG3:** select one collection node, then a folder → 0 `group`s, and the options are direct children of the listbox.
     - **LG4:** a query that matches nothing → 0 `group`s and the empty output shows. A query that matches one collection → 0 `group`s. A query that matches both → 2.
     - **LG5:** a purchased-style single collection with `shortTitle`s → 0 `group`s, no collection text inside any option, and each option `title` = the full title.
     - **LG6:** option `title` attributes are unchanged (full title), and the short title is shown.
     - **LG7:** a non-contiguous fixture, labels A, B, A → exactly **3** `group`s with accessible names A, B, A; the options are in source order; ArrowDown follows that order.
   - **Mutants** (A's script under `a-round-289/`, run on a scratch copy, tree sha restored):
     - **M1:** render the heading with ≥ 1 run instead of ≥ 2 → LG3/LG4/LG5 red.
     - **M2:** put the context span back → LG1/LG5 red.
     - **M3:** group by first appearance (2 groups, options reordered) → LG7 red.
     - **M4:** give the heading `tabIndex={0}` → LG2 red.
     - **M5:** revert one name in `studio-lab-demo.ts` → DL-EN red.

### 3.4 Implementation doc
Create `docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md`. The last number is 215 [K15].
- Use the TEMPLATE headings (L26), in Georgian with English terms.
- l.4 is exactly `**სტატუსი:** Completed (C round 289 PASS)` (L28).
- The doc cites only test ids that exist.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/data/studio-lab-demo.ts` | §3.1 only |
| `app/components/arrangement/ArrangementLibrary.tsx` | §3.2 only |
| `app/lib/arrangement/__tests__/strings.test.ts` | the one array replacement in §3.3(1) |
| `app/data/__tests__/studio-lab-demo.test.ts` | l.248 [K9] replacement + DL-EN |
| `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx` | new |
| `docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md` | new |

**Frozen:** everything else. In particular:
- `library.ts`, `collection.ts`, `strings.ts`, `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `StudioWorkspace.tsx` and `library.test.ts`;
- every Store file;
- the protected `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/auth.ts` and the auth tests;
- `package.json` and the lock file.

## 5. B pre-check (L23, on a scratch copy of `c345def`)
Done in `/tmp/b288scratch`, a `git archive` copy with `node_modules` symlinked. B applied §3.1, the two pins and a sketch of §3.2. The sketch is kept as `b-round-288/sketch.patch` (diff against `git archive c345def`), and the Georgian-codepoint sweep as `b-round-288/sweep-georgian.txt`; /tmp does not survive the job. The sketch is a reference, not a grant: §3.2 governs.
- `tsc --noEmit`: rc 0.
- Biome on the 4 files: only `useSemanticElements` fired, and the ignore line resolves it.
- **14 covering files / 247 tests passed:**
  - studio-lab-demo, strings, library, collection;
  - library-focus-handoff, library-notice-ui, library-preview, library-row-strings-ui, library-video-return-focus;
  - purchased-collection-ui, collection-load-status, held-enter-add, tempo-seed-ui, floating-video.
- The whole `app/lib/arrangement` + `app/data` folders also ran on the scratch: **172 files / 2607 tests passed** (`b-round-288/scratch-arrangement-suite.log`). This is a B pre-check, not a gate result.

**A's covering run** (speed rules): `npm run typecheck`, `npm run lint`, and `npx vitest run` on those 14 files plus the new `library-group-heading-ui.test.tsx`. The expected total is 15 files, 247 + DL-EN + LG rows.

## 6. C acceptance (browser rows run at 1440×900 and 1280×720)
Use a fresh context with empty storage, and wait for `Demo collection ready` (L48). For the HEAD comparison, run a separate server with its own Vite `cacheDir`, warmed up first (L38).

| Row | What C checks | Pass |
|---|---|---|
| CLAIMS | `claims-289.sh` at `c345def` = `claims-289-output.txt`; C also runs the L29 untagged-fact grep over this task | equal; no untagged fact |
| SOURCE-SCOPE | `git status` and the diff vs `c345def` | only the §4 paths; the diff of each matches §3; frozen files `git diff` empty |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | the 15 files of §5 | all pass; DL-EN and LG1–LG7 present by name, and LG7 |
| UNIT-MUTANTS | C's own run of M1–M5 on a scratch copy | each red as listed; the live tree sha is unchanged |
| B-NAMES | All view | the 9 option `title`s are exactly the §3.1 titles (Soft impact and Slow rise unchanged). The visible short titles are `Full mix`, `Pulse`, `Bass`, `Pad`, `Melody`. The tree shows `Synthetic demo · Night Pulse`. **0** Georgian code points (`/[Ⴀ-ჿ]/`) in `document.body.innerText` and in every `title`, `aria-*`, `alt` and `placeholder` attribute. Baseline: 8 lines + 9 attributes |
| B-GROUPS | All view | the `listbox` contains exactly **2** `[role=group]`, accessible names `CZABA public previews + synthetic SFX` and `Synthetic demo · Night Pulse`, in that order.<br>0 `[data-testid=arrangement-library-option-context]`.<br>The headings are not truncated (`scrollWidth ≤ clientWidth`) and have heights ≈ 59.5 / 43 px (±2) at the default width.<br>Option heights: previews 66.5, SFX 47.25 and synthetic **47.25** (±1; HEAD 80.25).<br>The gap between options in a group is 4 px.<br>The list `scrollHeight` is 614 ±4 (HEAD 669). The HEAD values and the sketch values are [K20] |
| B-KEYS | focus the first option and press ArrowDown ×8, then ArrowUp ×8 (250 ms between keys) | `document.activeElement` visits `demo-middle-east, demo-hero-music, demo-soft-impact, demo-slow-rise, demo-synth-mix, demo-stem-pulse, demo-stem-bass, demo-stem-pad, demo-stem-lead` and back, never a heading, with a visible ring. After every step the focused option's box lies fully inside the list's client box (±0.5 px), at both viewports. At HEAD the same order holds and all 17 steps are inside at both viewports (`b-round-288/probe/states-head.json`) [K20] |
| B-STATES | (a) click the `Synthetic demo · Night Pulse` tree node; (b) click its `Stems` folder; then click `All` and type into the search box named `Search the library` [K19]: (c) `zzz`; (d) `night`; (e) `bass`; (f) `synthetic` | (a) 0 groups, 5 options; (b) 0 groups, `Pulse Bass Pad Melody`, `title` = `Night Pulse · <part>`; (c) the empty output `[data-testid=arrangement-library-empty]` [K19] shows, 0 groups; (d) 5 options, 0 groups; (e) 1 option (`demo-stem-bass`), 0 groups; (f) 9 options, 2 groups.<br>**Measured at HEAD** (`probe/states-head.json`, both viewports) [K20]: (a) the same 5 ids, (b) the same 4 ids, (c) empty, (f) the same 9 ids, all with 0 groups, as expected before the change. (d) and (e) are **derived**: the haystack is title + kind keywords + `collectionLabel` [K8], and the new strings contain `night` only in the 5 Night Pulse sources and `bass` only in `demo-stem-bass`. At HEAD the Georgian `ბასი` gives exactly `demo-stem-bass` |
| B-JOURNEY (L54, L51) | fresh load → click the `Bass` option → Enter → read after 2 s → click `Play` → after 1.5 s → `Stop`. Locators [K19]: the status is `[data-testid=arrangement-status]` `textContent.trim()`, one status string composed of the add sentence, the tempo sentence and the snap hint, in that order; the Undo button is the button whose text starts `Undo`; the clip is the `[data-clip-id]` element; the footer line is `[data-testid=arrangement-selected-clip]` | Status is exactly `“Night Pulse · Bass” added to the Music track at 00:00.000. Tempo 120 BPM from “Night Pulse · Bass” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/2 (G)`.<br>The Undo button text is `Undo: Add — Night Pulse · Bass` (`title` + ` (Ctrl+Z)`).<br>The clip name is `Night Pulse · Bass`. The footer starts `Clip: Night Pulse · Bass ·`.<br>`[data-testid=arrangement-position]` [K19] advances from `00:00.000` to ≥ `00:01.000`, so the audio really plays.<br>0 Georgian code points on the page.<br>HEAD gives the same sentence with the Georgian title (`b-round-288/probe/journey-head.json`, `play-head.json`) [K20]. Screenshots per step |
| B-SCREEN (L39) | full-window screenshots of the All view, HEAD vs A, and an element count in the library list: title spans + `option-context` spans + headings. The count is taken on a fresh load: library expanded, default width, `All` selected, empty search | count **14 → 11** (9 titles + 5 context → 9 titles + 2 headings); no new persistent element outside the list; HEAD vs A screenshots attached |
| G289-AUTH | dev :5173, fresh context | `/studio-lab` opens anonymously with the `Demo collection — no sign-in required` badge [K19]. `/studio/middle-east` shows `Sign in required`, with 0 `audio[src]`. The token API returns 401 with no header and 403 with a fake bearer |
| DOC-216 | doc 216 | l.4 is byte-exact; the TEMPLATE headings are in order; every cited test id exists |
| gate | full suite, build, Biome, `verify`, `test:e2e:smoke` | gate rows (not claimed) |

**Not testable in the cloud:** the purchased route needs the backend. LG5 carries the buyer-side rule at unit level. C may also run a stubbed client probe (L36), but no row depends on it.

**Neighbouring behaviour that could break:**
- library keyboard order and focus target;
- the drag start from an option;
- the preview panel title;
- search;
- the notice dismiss (`library-notice-ui`);
- the first-run status and the tempo seed text.

B-KEYS, B-STATES and B-JOURNEY cover them in the browser, and §5's files cover them in unit tests.

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** English UI and the collection said once.
- **Ableton:** the group heading is a listed deviation (§2); Live's search-location behaviour is "not confirmed" until LIVE-MEAS-BROWSER-SEARCH-LOCATION is measured.

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-289.md` and change nothing else if:
- the claims output differs;
- a covering test fails or exceeds 50 % of its timeout;
- Biome demands any ignore other than §3.2(3);
- grouping needs a change in a frozen file;
- a group appears with fewer than 2 runs;
- any task clause conflicts with another.

## 9. Why we missed it (F7)
- **Missed by:** every screen review, which counted clutter on stills.
- **Why:** the strings test only listed the "remaining" Georgian lines in the demo file as a known exception [K9]. Nobody turned that exception into a task.
- **Rule:** L54 (journey row) already covers it. RETRO 290 counts it. No new lesson.
