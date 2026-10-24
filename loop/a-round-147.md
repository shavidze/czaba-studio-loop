# A round 147 — V-0.5b: library panel, library preview and collection statuses in English

**Status: implementation complete, awaiting C.** No commit, push, stash, checkout or install. All lasting edits under `store/` were made with Edit/Write. No `--write`/`check:fix`.

## Start checks (2026-10-24) — all OK
- HEAD = 3328e753db68c2eb84c291e0b711f933e498ced7; `git status --short` empty.
- Frozen list (950): `sha256sum -c --quiet` OK.
- 15 start hashes OK; the 15 start copies are byte-identical (`cmp`).
- `docs/…/120-…md` did not exist.
- Baseline at 3328e75 (before any edit): 17 files, 278/278 → `a-round-147/vitest-baseline.json`.

## Pre-flight
- Assumptions: replace exactly the 34 Georgian literals and nothing else; `strings.ts` imports nothing, so the module-level `collection.ts` → `strings.ts` use is safe.
- Files: only the 15 grants + 1 new doc.
- Success: 17 files green; typecheck, lint and Biome 0; m101–m106 red; Georgian grep 0.

## Changed files (exactly the grant set)
Sources:
- `app/lib/arrangement/strings.ts` — appended `studioLibraryPanelStrings` (22 keys, the §1.1 values exactly).
- `app/components/arrangement/ArrangementLibrary.tsx` — 16 uses + the existing strings import extended (`studioLibraryPanelStrings, studioSourceLoadStrings`). `LIBRARY_EMPTY_MESSAGE` keeps its name and equals `studioLibraryPanelStrings.noResults`. `<h2>` content and `filterPrefix` sit on their own lines (Biome-format compatible; JSX whitespace yields `Filter: <span>`).
- `app/components/arrangement/ArrangementLibraryPreview.tsx` — 8 uses + 1 import (between `peaks` and `utils`). **Biome-forced rewraps (reported):** the `activeLaneVideoNote` declaration and the toggle ternary are now multi-line.
- `app/lib/arrangement/collection.ts` — §1.2 demo/purchased `badge/loading/ready/empty/failed`; `ready` interpolates `${studioLibraryPanelStrings.add}`; `failed` uses a `count === 1` singular branch; the import gains `studioLibraryPanelStrings`. Nothing else changed.

Tests:
- `strings.test.ts` — added the `studioLibraryPanelStrings` import. ST47: `LIBRARY_REMAINING_GEORGIAN_LINES` and `COLLECTION_REMAINING_GEORGIAN_LINES` → `readonly string[] = []`. **My reading of the grant:** both constants and their `toEqual` lines are kept (deleting the `toEqual` lines would leave the constants unused). The demo ledger is kept. `ArrangementLibraryPreview.tsx` is added to the GUILLEMET loop, and `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx` and `collection.ts` to the zero-Georgian loop. The ST47 title is reworded, dropping "later V-0 stages". **New ST49** in a new `describe('V-0.5b library panel strings')`: the exact sorted 22 keys, a hand-written `Record` with value equality, no Georgian/«», and codepoints via `String.fromCodePoint` (U+2026 end, U+FF0B start, U+2014 and U+00B7), plus the trailing space of `filterPrefix` and the leading space of `videoTrackNote`.
- `collection.test.ts` — PC9 uses the English §1.2 for both origins (`failed(2)` included) and now also asserts `failed(1)` for both origins **inside PC9**. No new `it`.
- `collection-load-status.test.tsx` l.50–57, `purchased-collection-ui.test.tsx` l.32–39 + l.380, `library-preview.test.tsx` (the 11 expectation lines; fixtures `მუსიკა`/`ვიდეო` kept), `held-enter-add.test.tsx` (HA5 title + 2 names), `render-budget.test.tsx` l.310, `fader-guards.test.tsx` l.895, `grid-snap-keys.test.tsx` l.361 — hand-written English only.
- `library-row-strings-ui.test.tsx` — `within` import; `mountRows(collection = rowCollection)`; a Latin-only local fixture `readyRowCollection` (one ready sound, inside this file only, as §3.3 allows); hand-written constants. **LRS4** (one `it`): names by role (complementary/heading/Collapse button + title/searchbox + placeholder/navigation/`All2` button/listbox/separator); then fold (`row-strings — Fold`, aria-expanded true → click → `— Unfold`, false, folders 2 → 0 → click back → 2); search `zzqx` (`Clear search` button, `No sounds found.`, preview `<p>` `Select a sound in the list`) → Escape clears it (value '', empty gone, 2 options); filter `Filter: row-strings`; collapse → `Expand library` (aria + title) → expand → heading back. **LRS5 = one `it` with two mounts:** (1) the failing collection gives badge `Demo collection — no sign-in required`, status exactly `1 sound in the demo collection failed to load — details are in the library.`, `region` `Preview`, the slider named exactly per §1.1, the toggle `▶ Preview` → `■ Stop` → `▶ Preview`, and `button` `＋ Add`; (2) `readyRowCollection` gives status exactly `Demo collection ready. Choose a track and add a sound (Enter or ＋ Add).`, which `toContain`s the rendered Add button's `textContent` (itself pinned to `＋ Add`).

Docs:
- `docs/…/119-…md` — only the 3 §2 edits: l.4 status → `Completed (C round 146 — PASS, browserVerified; gate 146, 3328e75)`; l.71 `LRS1–LRS2 (round 146: LRS3)`; l.91 `C round 146: PASS (browserVerified = realVerified = true)`.
- **new** `docs/…/120-studio-v0-library-panel-strings.md` — Georgian, TEMPLATE sections, the §1 string map/glossary, the "why one round" coupling, the §5 Live source table with correspondence statuses, and testing. Status `In Progress (C round 147 — ჯერ არ გაშვებულა)`.

## Checks actually run
- `npm run typecheck` exit 0 (`a-round-147/typecheck.log`).
- `npm run lint` exit 0 (218 warnings + 1 info across the repository; `lint.log`). None of them is in this round's files: the scoped Biome run below gives 0 diagnostics on the 14 changed files.
- Read-only `npx biome check` on the 14 code/test files: exit 0, 0 diagnostics (`biome-14.log`).
- `npx vitest run` on the 17 files: **281/281**, 17 files (`a-round-147/vitest.json`).

Per-file `it` counts vs 3328e75 (baseline → now): strings 48 → **49**; library-row-strings-ui 3 → **5**; collection 14 → 14; all others unchanged (studio-lab-demo 13, collection-load-status 10, default-track-names-ssr 2, fader-guards 71, failed-source-refusal 8, grid-snap-keys 13, held-enter-add 8, library-focus-handoff 13, library-preview 7, library-video-return-focus 10, library 12, purchased-collection-ui 6, render-budget 7, status-announcement-ui 33). Total 278 → 281.

## Mutations (Edit → run → restore by Edit → sha256 vs post-edit hash → frozen list OK)
| ID | Mutation | Red (actual) |
|---|---|---|
| m101 | `all` → `'All files'` | ST49, LRS4 |
| m102 | l.526 fold/unfold swapped | LRS4 |
| m103 | demo `failed` always plural | collection PC9, collection-load-status LS7, LRS5 |
| m104 | demo `ready` literal `＋ Insert` | collection PC9; collection-load-status LS3, LS3b, LS5, LS6, LS7; LRS5 |
| m105 | preview toggle branches swapped | library-preview (3 its: cursor, HT1, HT2), LRS5 |
| m106 | preview `aria-label={'პრევიუ'}` | ST47 |

Evidence: `a-round-147/mut-m10{1..6}.json`. After all the restores, the 4 source hashes equal `post-edit-src-sha256.txt` and the frozen list is OK. Every mutation turned at least the tests named in §3.4 red, and only tests in the named files. `mut-lrs-recheck.json` is not a mutation: it is the LRS-file re-run after the review fix (5/5 green).

## Code review (required, 3+ files)
I ran the `code-reviewer` subagent on the final diff: 0 Critical/High/Medium, 5 Low, score 9/10.
- Low 1 (`previewEmpty` not asserted in the DOM) → **fixed**: LRS4 now checks the preview `<p>` in the empty-search state. Re-ran Biome, the LRS file and then all 17 files (281/281).
- Low 2 (the badge is found via `span.border-accent`) → kept. It follows the existing `purchased-collection-ui` `badgeText` pattern and cannot pass vacuously. Signal for B.
- Low 3 (the ST47 `[]` constants duplicate the zero-Georgian loop) → kept on purpose (the grant asks for `[]`, and deleting them would make them unused).
- Low 4 (wording differs from a literal translation: All, Library sidebar, no `…`, sound vs source) → this is B's §1.1/§1.3 glossary. No action.
- Low 5 (a future circular-import risk if `strings.ts` ever imports a value from `collection.ts`) → informational; `strings.ts` imports nothing today.

**Architecture note (verbatim, for B):** "none. `collection.ts` → `strings.ts` is a dependency from one `lib/` file to another file that imports nothing. It moves no state, ownership or lifecycle. **Keep:** the only cost is keeping `strings.ts` import-free, which is cheap. I have no extraction proposal. This covers the diff only, not the whole module."

## End checks
- Frozen list (950) OK.
- `git status --short` = the 15 ` M` grants + `?? docs/implementation/2026/quarter-IV/120-studio-v0-library-panel-strings.md`. Nothing else.
- `git diff 3328e75 --` the 7 protected paths: empty (0 bytes). The frozen list (950 entries, every non-granted tracked or untracked path) is byte-identical to 3328e75, so this also covers everything in `backlog.json` `global_forbidden_files`.
- `a-round-147/end-sha256.txt` lists the 16 paths. `a-round-147/diff-vs-start.patch` (963 lines) is against `b-round-146/r147-granted-start/`, and the new doc is shown as a diff from /dev/null.
- Non-comment Georgian grep of the 3 sources: 0 lines (plain grep is also 0).

## Not run (gate rows)
The full suite, `npm run verify`, build, e2e/smoke and the browser. Per the speed rules these belong to C and the root gate. I did not open the browser, so there is no `a-browse.json` use this round.

## Known gaps / signals for B
1. `purchased-collection-ui.test.tsx` l.297–298 (`expect(header).not.toContain('დემო')` / `'ავტორიზაცია არ სჭირდება'`) now always pass. They are outside the grant (only l.32–39 and l.380), so they are not edited. **Stop rule considered:** these lines depend on the old Georgian badge. I proceeded because the assertions are negative, still pass, and sit in a granted file whose granted lines I changed; changing them was not in the table. B rules on this. Suggest an English `not.toContain('Demo collection')` in a later round.
2. Georgian that is not in the 34 and was left alone, as the stop rule requires: `library.test.ts` l.16 `'დემო კოლექცია · საჯარო'` (a collection-label fixture, i.e. data), and `ArrangementVideoDock.tsx` l.937/947 `ვიდეოს პრევიუ` (V-0.5c). No other source or test depended on the 34 strings (grep of `app`, `e2e`).
3. Reviewer Low 2 (class-based badge selector), Low 5 (keep `strings.ts` import-free).

## Acceptance criteria I verified (A-side only)
- §1.1 object exact (ST49 green; codepoints dumped: searchPlaceholder ends U+2026, add starts U+FF0B, previewWaveLabel contains U+2014/U+00B7).
- §1.2 exact for both origins incl. `failed(1)`/`failed(2)` (PC9 green); `ready` interpolates the constant (m104 red).
- §3.1–§3.4 tests and mutations as listed above; §3.5 start/end commands as listed.
- Not verified by A: the C rows (COPY-LIB, COPY-PREVIEW, COPY-STATUS, NO-GEORGIAN, LAYOUT-LIB, LAYOUT-REST, G147-3, PX-NET/REG-HYD) need a real browser. PURCHASED-STATUS is BLOCKED (backend).

## Exact next C checks
- T147-TARGETED: rerun the 17-file list; expect 281/281 with the counts above.
- SOURCE-SCOPE: `sha256sum -c a-round-147/end-sha256.txt` from `store/`; the frozen list; `git status --short` = the set above; protected diff empty.
- AN-REVIEW: `a-round-147/diff-vs-start.patch`. Note the 2 Biome rewraps in the Preview and the multi-line `<h2>`/filter in the Library.
- Browser rows per §4 on `http://127.0.0.1:5173/studio-lab`, at both 1440×900 and 1280×720, against `b-round-146/out/libbase147-*.json`. Use the testid selectors for the preview toggle and region. In LAYOUT-LIB watch these: `noResults` lost its `…`, `tree-all-label` is now `All`, the `preview-toggle` glyph is `▶ Preview`, and the header badge width changes (not measured by A), so `ArrangementMaster` may shift by the badge's `w` delta.

## Scope completed
The V-0.5b A task (§2, §3) only. This does not mark V-0.5b or any backlog item done. That needs C round 147 in a real browser and the root gate.
