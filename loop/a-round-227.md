# A round 227: CALM-1a gate fix-up (GATE226-B1) + C-R226-02 / C-R226-03

**Status:** implemented, no STOP. L32: no covering test is above 50 % of its timeout. The slowest is UC1 in track-group-collapse-ui: 2725 ms against its 20 s describe timeout, 13.6 %. The slowest in track-layout is 1704 ms against 15 s.

**A deviation D1 (round 227), for B to rule on (L10).**
- I added two structure assertions that §2.1's list does not include, in the same granted case: `shortcutButton.parentElement` `toBe(row)`, and `row.children` `toHaveLength(2)` (once before selection and once after it).
- **Reason:** code-reviewer Low 1, plus the MU-4 evidence; the details are under Code review.
- **L8 risk for CALM-2 and CALM-3:** the count is a structure pin on the footer wrapper row. Any round that changes the wrapper's direct children must have `track-layout.test.tsx` in its L23 pre-check and in its covering set.
- **A count-insensitive alternative, if B prefers one:** assert that `row.parentElement` is the `<footer>`, and that it is not `row` itself. I have not changed it.

## Scope and start checks
- HEAD `80fbb3b99d6fe991c4e150a9cc05b1b7332d068c`. At the start, `git status` showed exactly the 9 round-226 paths.
- At the start, `sha256sum -c` gave rc 0 for the tree, carried-r226, granted-start and root-files-start lists.
- Pre-flight was done. Primitives read: TESTING_QUALITY_GATES, BUG_HUNTING_TESTS (head), GEORGIAN_DOCS, AGENT_DISCOVERABLE_CODE.

## Changed files (5 grants; no new file; StudioWorkspace.tsx not changed)
1. `app/lib/arrangement/__tests__/track-layout.test.tsx`, the granted case only (title byte-identical):
   - Removed the placeholder class equality and the selected-line `arrayContaining([... 'basis-full' ...])`.
   - Added the `within` import and the `studioShortcutSheetStrings` import from `../strings`.
   - New guards: `if (!placeholder) throw …` and `const row = placeholder.parentElement; if (!row) throw …`. These come after the existing placeholder assertions, which stay byte-identical.
   - `within(row).getByRole('button', { name: studioShortcutSheetStrings.footerButtonLabel })`.
   - After select: `expect(selected?.parentElement).toBe(row)`. After deselect: `expect(reserve()?.parentElement).toBe(row)`.
   - No `as`, no `any`, no class tokens: the case has 0 `className` hits.
2. `app/lib/arrangement/shortcuts.ts`:
   - `fit` → `['Double-click the overview', 'Double-click the ruler (no selection)']`.
   - `waveform-zoom` → `['Waveform Zoom menu']`.
   - Nothing else changed.
3. `app/lib/arrangement/__tests__/shortcuts.test.ts`: the new case **SC4**, "the fit and waveform-zoom keys name the real controls, and no key names a button". SC1–SC3 are unchanged.
4. `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx`: the UC12 title is now `UC12 the shortcut sheet lists the group keys and track fold stays independent`. The body is unchanged.
5. `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md`:
   - l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 227 PASS)`.
   - Two new Problem → Solution entries: GATE226-B1, and C-R226-02/03. They cite only the track-layout case title and SC4.

Hunks against B's start copies: `a-round-227/granted-hunks.diff` (9 hunks).

## L40 covering-set grep
`grep -rln "arrangement-selected-clip\|arrangement-lane-move-hint\|arrangement-shortcut" app --include=*.test.*` → lane-strings-ui, shortcut-sheet-ui, track-group-collapse-ui, track-layout, workspace-strings-ui. All of these are already in B's set; there are no extra hits.

`basis-full` / `…-reserve` outside track-layout: only `shortcut-sheet-ui.test.tsx` l.503/516/523. These are testid presence checks with no class pins.

## Tests actually run
| Check | Result |
|---|---|
| `npx biome check` on the 4 granted code/test paths | clean ("No fixes applied") |
| `npm run typecheck` | rc 0 (`a-round-227/typecheck.log`) |
| `npm run lint` | rc 0. There are 205 warnings and 1 info, all pre-existing; Biome is clean on the granted paths, so none is new (`a-round-227/lint.log`). |
| `npx vitest run` on 8 files: track-layout, shortcuts, shortcut-sheet-ui, lane-strings-ui, workspace-strings-ui, track-group-collapse-ui, waveform-zoom, navigation-strings-ui | **8 files, 104 tests, all green** (`a-round-227/covering.log`) |
| MU-1 | **Red.** The selected-clip `<p>` was moved out of the row wrapper (rendered after it, as the footer's child). The case failed at l.868: `selected?.parentElement` was `<footer>`, not the row `<div>`. `StudioWorkspace.tsx` was restored from a cp backup, and the carried list gives rc 0. |
| MU-2: `fit` keys reverted | SC4 red; restored, sha equal |
| MU-3: `waveform-zoom` keys = `['1× button']` | SC4 red; restored, sha equal |
| `npm run build` (run once) | rc 0, "built in 2.05s" (`a-round-227/build.log`) |
| Browser self-check | Playwright on the running :5173 `/studio-lab`, at 1280×720 and 1440×900. The `fit` row has 2 chips ("Double-click the overview" 183 px, "Double-click the ruler (no selection)" 267 px); each is 18 px high with `scrollWidth` = `clientWidth`. `waveform-zoom` has 1 chip, 134 px. The sheet has 0 horizontally overflowing elements, and there are 0 page errors. Evidence: `a-round-227/browse.json`, `row-*-{1280,1440}.png`. The script is `a-round-227/browse.mjs`; state is in `a-browse.json`. The first attempt timed out at 30 s while waiting for the button (a cold Vite compile); after a 15 s warm probe (`probe.mjs`) it passed. |

## End state
- `git status` shows 10 paths: the 9 from round 226 plus `track-layout.test.tsx` `M`.
- The tree, carried-r226 and root-files-start lists give rc 0. The granted-start list is expected to differ, because those files were edited.
- The protected files are clean against HEAD.
- `a-round-227/changed-end-sha256.txt` covers all 10 paths (rc 0 when run from `store/`).

## Code review (the real `code-reviewer` subagent ran; it scored the round 9/10)
It found no Critical, High or Medium issues and no type-safety violations. It confirmed that the hunks stay inside the grants and that both new keys match the real behaviour. It had no Architecture note ("None").

**Low 1, addressed inside the granted case.** The row check proved only "same parent as the button". If the wrapper were removed, the slot and the button would sit directly in `<footer>`, and the case would stay green.
- The reviewer suggested `expect(button.parentElement).toBe(row)`. I added it, but **MU-4** (the wrapper replaced by a fragment) stayed **green**: with the wrapper gone, `row` becomes the footer itself.
- I then added `expect(row.children).toHaveLength(2)` after the button check and after selection. That is a structural check with no class tokens: the row holds only the slot and the button.
- Results after the change:
  - **MU-4 red**, failing on the child-count assertion;
  - **MU-1 re-run, still red** at `toBe(row)`;
  - track-layout is 36/36 green;
  - biome is clean;
  - typecheck and lint give rc 0;
  - the case has 0 `className` hits.
- `StudioWorkspace.tsx` was restored from a cp backup after each mutant, and the carried list gives rc 0.
- This goes beyond the literal §2.1 list, but stays inside grant #1 (the same case). C-SCOPE should see the extra assertion lines as part of that case.

**For B, not fixable inside the grants:**
- **Low 2:** the chip "(no selection)" is ambiguous. `handleRulerDoubleClick` branches only on the **time** selection, so a selected clip with no time range still fits. "(no time selection)" would be exact. This is B's D-29z276 wording.
- **Low 3:** "Waveform Zoom menu" names the accessible name, but the select visibly shows only "1×/2×…". A sighted user has to hover to see "Waveform Zoom". This is a candidate for the CALM-2 copy pass.
- **Low 4:** doc 177 is stale outside the granted lines. l.74 says `shortcuts.test.ts: SC1–SC3`, l.109 says "SC1–SC3 და SS1–SS10", and the "შეცვლილი ფაილები" list leaves out `track-layout.test.tsx`. This does not break L26 (every cited test exists); only l.4 and the two new entries were granted.
- **Lane-move hint:** the slot `arrangement-lane-move-hint` has no row-membership check in jsdom; only C-SLOT-227 covers it.

## Known gaps / not done
- I did not run the full suite or `verify`; those are gate rows.
- The browser check covered only the sheet rows. C-FIT, C-WZ, C-SLOT, C-BBOX and the other rows are C's.
- C-R226-04 (playhead focus) is not addressed, per B's ruling D-29z275.

## Exact next C checks
C-SCOPE-227 (use `a-round-227/changed-end-sha256.txt` and `granted-hunks.diff`), C-UNIT-227, C-ROWS-227, C-FIT-227, C-WZ-227, C-SEARCH-227 (`menu` → waveform-zoom), C-WIDE-227, C-BBOX-227, C-SLOT-227, C-OPEN-227, C-LESSON-227, G227-3, LAB-SMOKE-227, AN-REVIEW-227.

## B acceptance items A passed (A's own checks, not C rows)
§3.1–§3.8 are done as listed above: MU-1, MU-2 and MU-3 are red, and so is the extra mutant MU-4. The code-reviewer ran. After the review fix-up I re-ran track-layout (36/36), typecheck and lint. The other 7 covering files are unaffected by that test-only change; their 104/104 result is from before it. I wrote and re-verified `changed-end-sha256.txt` and `granted-hunks.diff` after the fix-up. No C row is claimed.
