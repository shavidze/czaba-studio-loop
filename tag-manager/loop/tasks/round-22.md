# CURRENT TASK — Round 22: TM-B25 — the Shift-click anchor must survive a save, a sort and a search — D-31

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 21 result:** C PASS, realVerified=true (R21-1…R21-5), 0 bugs.
  - Red on `b373b08`: 9 failed / 39 passed. Green 48/48. M1–M7 were killed; M8 is the planned equivalent.
  - Gate: 187/93/7. In the real app with a 3000 ms write delay, text typed during the save was kept, and ffprobe and music-metadata showed it after the follow-up save. The `b373b08` build lost it.
  - Root published `601dc4a` with review COMMIT OK. TM-B24 and D-30 are done.
- **No critical or high bug is open.** Every other open item waits on Saba's question batch or on root's Actions link. TM-B25 is the highest unblocked bug.
- **TM-B25 (low, from RR-R19-02):** Shift-click range selection loses its anchor after every save.
  - `FileList.tsx:105` keeps the anchor as a row index (`lastClickRef = useRef(-1)`).
  - `:107-109` resets it whenever the rendered list changes (`[files, searchQuery, sortField, sortDirection]`).
  - Every save changes the list, through `updateFileMetadata` and the D-28 `updateFileStats`.
  - Result: click `a.wav`, save, Shift-click `c.wav` selects **only** `c.wav`. The user's next batch edit then goes to one file instead of the range they meant. The same happens after a sort or a search change.
- **B experiments** (in a `/tmp` copy; the repository was not touched):
  - On `601dc4a`, the planned tests behave as the table below says (`b-round-21-exp/anchor-old-output.txt`, test file `b-round-21-exp/file-list-anchor-exp.test.ts.txt`). For example: `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]` after `updateFileStats`.
  - A fix that keeps a path anchor and clears it on an empty selection (`b-round-21-exp/file-list-anchor-impl.diff.txt`, for orientation only, not prescriptive) passes all of them:
    - tsc web/test 0;
    - renderer all green;
    - Biome **8** warnings: the `FileList.tsx` `useExhaustiveDependencies` warning disappears.

## Reference (Saba's reference-first rule)
This is a fix, but it changes what the anchor follows, so B looked the behaviour up:
- **GTK listview commit "Implement extending selections"** (https://mail.gnome.org/archives/commits-list/2020-May/msg13894.html):
  - It says it imitates "Windows Explorer (but not treeview)".
  - It tracks "the last selected item (normally, not via extend-clicking)" with a `GtkListItemTracker`. That tracker follows the **item**, not a position.
  - Without Ctrl, Shift "select[s] the range and unselect[s] everything else".
- **Shift-click in a Windows list box** selects everything between the first-clicked item and the Shift-clicked item (https://www.indigorose.com/webhelp/tu/Windows_Basics/Mouse_Maneuvers/Shift-click.htm).
- **Microsoft selection-modes docs** (https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/selection-modes) cover Extended selection with Shift, but they do not specify the anchor.
- Searched and not found: an official Microsoft or Mp3tag statement on anchor behaviour after a list refresh or sort. B does not invent one.

**Confirmed fact (GTK source, which imitates Explorer):** the anchor is an item, so it survives a re-sort or refresh. **D-31 follows that.**

**Deviations (kept on purpose, with reasons; C checks that each is unchanged):**
1. Shift-click also moves the anchor. The reference moves it only on normal clicks. Kept because today's code moves it on every click, and changing range-extension UX is a Saba question (B-R21-02).
2. Shift-click without Ctrl **adds** the range to the existing selection; the reference replaces the selection. Kept because `selectRange` (file-store, frozen) does this today and R18 pinned it. Same Saba question (B-R21-02).
3. The anchor is dropped whenever the selection becomes empty. This includes Ctrl-deselecting the last selected row, where Explorer would keep it. Reason: `folderPath` does not change on a rescan or when the same folder is reopened, so it cannot tell FileList that the folder content was replaced. Open folder, rescan and close all clear the selection, so an empty selection is the only reliable signal. Without it, a stale anchor from the previous scan could extend a range in a rescanned folder (B's first experiment variant, keyed on `folderPath`, had exactly that gap).

## Baseline
- HEAD `601dc4aad7e9416b8f3c690ba5ec68cccb98490d`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `601dc4a`): everything not in the ownership table, in particular:
  - every store (`file-store.ts` with `selectRange`, `toggleSelection`, `setSelectedPaths`, `selectAll`, `clearSelection`, and `metadata-store.ts`);
  - `Toolbar.tsx`, `MetadataPanel.tsx`, `FolderBrowser.tsx`, `App.tsx`, `src/renderer/src/lib/**`, `src/renderer/src/types/**`, `src/main/**`, `src/shared/**`;
  - every test except the one owned file, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/stores/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, `.claude/**`, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **No store change.** If D-31 cannot be met inside `FileList.tsx`, stop and report; do not widen ownership.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** No `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, and no script that writes repository files. The only exception is gitignored build and test output from npm commands. Run mutants in a copy outside the repository.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md`. In `a-round-22.md`, record when you read each one and whether the read-primitives hook fired.

## Scope (D-31, see `feature-status.md`)
Follow the `test-on-bugfix` rule: write the failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments. No `any`, `@ts-ignore`, `as unknown as`, and no new `as` cast. **No new export.** `FileRow` stays module-private; changing its props is fine.
- Tests: keep the file's double-quote style. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-31)
1. **The anchor is a file path** (`string | null`), held in a ref in `FileList`, not a row index.
2. **Every click** (plain, Ctrl/Cmd, Shift) sets the anchor to the clicked row's path afterwards, as today.
3. **On Shift-click,** look the anchor path up in the list as rendered at that moment: the `useFilteredFiles()` result, which is the sorted and filtered order `selectRange` uses. Then:
   - **found:** `selectRange(anchorIndex, clickedIndex)`, unchanged. The range is still **added** to the existing selection.
   - **null or not in the rendered list** (hidden by the search, or no longer in the folder): behave exactly as today without an anchor. Ctrl/Cmd toggles the clicked row; otherwise only the clicked row is selected.
4. **The anchor survives:**
   - metadata updates (`updateFileMetadata`, after every save);
   - the D-28 `updateFileStats` refresh;
   - a sort field or sort direction change (it follows the item, not the row);
   - a search change that keeps it visible.
5. **The anchor is cleared (`null`) when the selection becomes empty.** That covers open folder, rescan, close folder and Deselect All, which all clear the selection, and also Ctrl-deselecting the last selected row (deviation 3).
6. **Remove** the index reset effect (`:107-109`) and any store selector left unused by the change. Biome must not gain a warning. The `FileList.tsx` `useExhaustiveDependencies` warning is expected to disappear, which gives 8 warnings.
7. **Unchanged:**
   - double-click to play;
   - the Tagged badge and the cells;
   - `SortHeader`;
   - `Toolbar` and Select All / Deselect All;
   - every store action;
   - D-29 (selection change during a pending save) and the `Unsaved changes were discarded` toast.

### Tests (prescribed) — `tests/renderer/components/file-list.test.ts`
- **Additions only.** Add one new `describe("FileList Shift-click anchor (TM-B25, D-31)", ...)` at the end of the file. Every existing line stays byte-identical, except that the first import line may gain `act` (same line, names kept).
- Reuse `renderFileListWith`, `getFileRow`, `createFileEntry`, `createDefaultMetadata` and `FOLDER_PATH`. Do not move or rename them. A local helper inside the new describe is fine, for example `selectedNames()`, which returns the selected file names sorted.
- Clicks use `fireEvent.click(getFileRow(name), { shiftKey: true })` or `{ ctrlKey: true }`. Store changes made between clicks are wrapped in `act(() => { ... })` and called through `useFileStore.getState()`.
- Files `a.wav`…`d.wav` (or `e.wav` where stated) are given `{}` metadata unless stated otherwise. The default sort is name ascending. "Must hold" lists the selected file names, sorted.

| Test | Setup → action | Must hold | On `601dc4a` |
|---|---|---|---|
| **(z1)** pin: plain range | click a, Shift-click c | a, b, c | passes |
| **(z2)** save stats refresh (D-28) | click a; `updateFileStats([{ ...createFileEntry("a.wav"), size: 2048 }])`; Shift-click c | a, b, c | **fails** (`['c.wav']`) |
| **(z3)** save metadata update | click a; `updateFileMetadata(<FOLDER_PATH>/a.wav, createDefaultMetadata({ title: "T" }))`; Shift-click c | a, b, c | **fails** (`['c.wav']`) |
| **(z4)** sort direction, anchor follows the item | files a–e; click b; `toggleSortDirection()` (rendered e, d, c, b, a); Shift-click e | b, c, d, e | **fails** (`['e.wav']`) |
| **(z5)** search that keeps the anchor visible | click a; `setSearchQuery(".wav")`; Shift-click c | a, b, c | **fails** (`['c.wav']`) |
| **(z6)** pin: search hides the anchor | click a; `setSearchQuery("c")`; Shift-click c | c | passes |
| **(z7)** pin: rescan | click a; in one `act`, `clearSelection()` + `setFiles(["a.wav","b.wav","c.wav","d.wav"].map(createFileEntry))`; Shift-click c | c | passes |
| **(z8)** Deselect All drops the anchor | click a; `clearSelection()` alone (list unchanged); Shift-click c | c | **fails** (a, b, c). This is new D-31 behaviour, not the TM-B25 symptom; record it as such |
| **(z9)** pin: Shift-click without an earlier click | Shift-click c | c | passes |
| **(z10)** pin: Ctrl-click sets the anchor, range is added | click a; Ctrl-click c; Shift-click d | a, c, d | passes |
| **(z11)** sort field change after a save | rows a `{ bpm: 3 }`, b `{ bpm: 1 }`, c `{ bpm: 2 }`, d `{ bpm: 4 }`; click a; `updateFileMetadata` for a with `createDefaultMetadata({ bpm: 3 })`; `setSortField("bpm")` (rendered b, c, a, d); Shift-click d | a, d | **fails** (`['d.wav']`) |

Red run on `601dc4a`, before the fix. Save the log in `a-round-22/`.
- **Primary red:** (z2)–(z5) and (z11) fail with the symptom: only the clicked file is selected. Record the exact messages.
- (z8) fails because it is new behaviour. Record it separately.
- (z1), (z6), (z7), (z9) and (z10) pass on `601dc4a`; say so.
- If a planned red test passes on `601dc4a`, or a pin fails there, stop and report it. Do not change the expectation to fit.

### `a-round-22.md` (Georgian) contains
- the red and green logs and the diff;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last test edit;
- the Biome warning list before and after;
- a `qa-engineer` read-only regression check (bugfix rule);
- the process statement.
- A `code-reviewer` run is optional (2 files).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/file-list/FileList.tsx` | path anchor, lookup in the rendered list, clear on empty selection, remove the index reset effect (D-31) |
| `tests/renderer/components/file-list.test.ts` | tests (z1)–(z11), additions only, a new describe at the end, `act` added to the first import line |

Logs go to `a-round-22/` (A) and `c-round-22/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`). C's harness files live in `c-round-22/`, never in the repository.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R22-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat 601dc4a`, and `git diff --quiet 601dc4a -- . ':!src/renderer/src/components/file-list/FileList.tsx' ':!tests/renderer/components/file-list.test.ts'`. Read the diff, A's result JSON and A's transcript if it is available. | All of these hold:<ul><li>Only the 2 owned paths differ, both `M`, and there is no untracked file.</li><li>`git diff 601dc4a -- tests/ \| grep '^-[^-]'` shows only the first import line, which comes back with the same names plus `act`.</li><li>The new tests sit in one new describe at the end of the file.</li><li>The src diff has no comment, no `any`/`@ts-ignore`/new `as`, and no new export. Stores are untouched.</li><li>`permission_denials` is empty, and the repo writes were made with Edit/Write. Say whether the transcript was available.</li></ul> |
| R22-2 red/green | Run `git worktree add --detach /tmp/c-r22-old 601dc4a` with `node_modules` symlinked. Never use `git stash`. Copy A's test file in, then run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/file-list.test.ts`. Run the same command on A's tree. | Old code: (z2)–(z5) and (z11) fail with only the clicked file selected, and (z8) fails (new behaviour). (z1), (z6), (z7), (z9), (z10) and the 8 older tests pass. Record names and messages. New code: all pass, with the exact count (19). |
| R22-3 mutations | In a throwaway copy of A's tree, run the test file once per mutant:<ul><li>**M1:** today's code (index anchor plus the reset effect).</li><li>**M2:** path anchor, but cleared on every rendered-list change (the old effect deps).</li><li>**M3:** anchor not cleared on an empty selection.</li><li>**M4:** anchor index looked up in `useFileStore.getState().files` (unsorted, unfiltered) instead of the rendered list.</li><li>**M5:** a missing anchor treated as index 0.</li><li>**M6:** anchor set only on plain clicks (the reference model).</li></ul> | Each mutant is killed by at least one named test. Expected killers: M1 (z2); M2 (z2); M3 (z8); M4 (z4)/(z11); M5 (z7)/(z9) ((z6) does not kill M5: the rendered list is `[c]`, so index 0 is `c`); M6 (z10). A survivor is a FAIL unless C shows it is equivalent. |
| R22-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and 8 warnings: the `601dc4a` list minus `FileList.tsx` `useExhaustiveDependencies`. The same 9 is also acceptable. A new rule or file in the list is a FAIL.</li><li>Typecheck 0.</li><li>Renderer **187 + 11 = 198** (exact count, 10 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R22-5 real app | Launch the built app with Playwright `_electron` under `xvfb-run` with `--no-sandbox`. Drive the UI only; the folder dialog may be stubbed. Copy `tests/fixtures/sample.wav` into a temp folder as `a.wav` … `e.wav`, then scan.<ol><li>Click `a.wav`, set Category `R22A`, click `Save Tags`, and wait for `Tags saved`. Then Shift-click `c.wav`. The panel shows `3 files selected` and the toolbar `3 selected`.</li><li>Set Category `R22Range` and click `Save to 3 files`. Wait for `Tags saved to 3 files`.</li><li>Click `b.wav`, then click the `Name` header (descending: e, d, c, b, a), then Shift-click `e.wav`. Result: `4 files selected` (b, c, d, e).</li><li>Click `c.wav`, type `.wav` in the search box, and Shift-click `a.wav`. Result: `3 files selected` (c, b, a).</li><li>Clear the search, click `Select All`, then `Deselect All` (the selection is now empty), then Shift-click `d.wav`. Result: only `d.wav` is selected.</li><li>Read every file with `music-metadata` (RIFF INFO under the `exif:` namespace, C-R21-03) and with `ffprobe -show_entries format_tags -of json`.</li><li>**Red reference:** build `601dc4a` in the old worktree and repeat steps 1, 2 and 6 on fresh copies. After step 1 only `c.wav` is selected, so step 2's button reads `Save Tags` and writes only `c.wav`. Record what you see.</li></ol>Take a screenshot after each step. | All of these hold:<ul><li>(1) 3 selected after the save.</li><li>(2)+(6) **Hard check:** ICAT `R22Range` on `a.wav`, `b.wav` and `c.wav` in both readers; `d.wav` and `e.wav` have no ICAT `R22Range`.</li><li>(3) 4 selected: b–e.</li><li>(4) 3 selected: a–c.</li><li>(5) 1 selected: d.</li><li>(7) On the `601dc4a` build, only `c.wav` is selected after step 1, and after step 2 `a.wav` keeps `R22A` and `b.wav` has no `R22Range` in either reader. That proves the bug was real. If it does not reproduce, report it; the round is not PASS until B re-plans.</li><li>`pageErrors` is empty.</li><li>Deviations 1–3 behave as listed (record what you see).</li><li>Artists are record only (TM-B08).</li></ul> |

## What could break (C re-checks)
- **Plain, Ctrl and Shift selection without saves:** (z1), (z9), (z10), plus the R18 real-app behaviour where a Shift-click range follows the sort order (R22-5 step 3).
- **Select All / Deselect All:** the Toolbar is untouched. After Deselect All, a Shift-click selects only the clicked row (z8, R22-5 step 5).
- **Opening a folder, rescanning and closing** still clear the selection and the anchor (z7).
- **MetadataPanel save flows** (D-21/D-22/D-24/D-28/D-29/D-30) are untouched. `metadata-panel-batch-save.test.ts` stays green, byte-identical.
- **Row rendering:** the Tagged badge, cells, double-click to play, and sort by Artist/Genre/BPM. The existing (a)–(f), (R17-e) and (R18-e) stay green.
- **Performance:** the anchor lookup costs O(n) per Shift-click only. C notes how the rendered paths reach `FileRow` (for example one memoised path list shared by all rows). An O(n) recomputation per row on every render is a finding, not a FAIL.

## What realVerified means here
- R22-1…R22-4 are real local checks.
- R22-5 is the real-app proof. The written range is checked by independent readers against a red reference.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
1. **MetadataPanel hygiene round:**
   - remove the 6 MetadataPanel casts (RR-R13-02 + RR-R15-02);
   - take the start snapshot from one `getState()` read (RR-R21-01);
   - add `mockReset` isolation to the tests (A-R21-04);
   - write a `docs/bugs/` record for TM-B23/TM-B24 with the known limits (RR-R21-02, A-R21-01, A-R21-03).
   - B's experiment `b-round-21-exp/casts-snapshot.diff.txt` already typechecks. RR-R15-01 still needs a D-24 amendment from Saba.
2. **After that, every remaining item waits on Saba's question batch** (see `b-round-21.md`) or on root's Actions link.
