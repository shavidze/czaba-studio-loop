# CURRENT TASK — Round 37: TM-B39 — keep the selection inside the listed files after a folder load (D-44)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 36: C PASS** (R36-1…R36-6, realVerified=true). Root published `51969a2`; the review returned COMMIT OK with 0 critical/high/medium findings. TM-B38 is **done**. `51969a2` is the baseline.
- **No critical, high or medium bug is open.** TM-B39 (low, C-R34-01) is next in dependency order (TM-B38 → TM-B39 → TM-B40). It is one bug. The round 36 test leftovers (C-R36-01, RR-R36-01…04) are unrelated and go to the new item TM-B41; they are **not** part of this round.
- **The bug (C-R34-01, seen in the real app on two builds in round 34):**
  - Open Folder, Rescan and drop call `clearSelection()` at load start (`FolderBrowser.tsx:103`, `:161`, `App.tsx:48`), then await the scan.
  - While the scan is pending, the old listing is still shown and clickable. A click selects a path of the old listing (`FileList.tsx:68`).
  - `setFiles(wavFiles)` (`file-store.ts:55`) replaces `files` and never touches `selectedPaths`. The selection then holds a path that is not listed:
    - the toolbar shows `1 selected` with no highlighted row;
    - the panel shows "Select a file to edit metadata", because `useSelectedFiles` filters by `files`;
    - unsaved typing in that row stays `isDirty` with no visible owner;
    - the Shift-click anchor points at an unlisted path.
  - Nothing is written to disk: Save is a no-op when `selectedFiles` is empty (`MetadataPanel.tsx:143`). This is display and selection state only.
- **B's red reproduction and prototype on `51969a2`** (`b-round-36-exp/`):
  - Test file `selection-after-folder-switch.test.ts.txt`, (x1)–(x7). On HEAD src all **7/7 fail** on the symptom (`red-run.log`), for example `expected [ '/fa/a.wav' ] to deeply equal []`.
  - Prototype `prototype.diff.txt`: one changed line plus one appended private function. Renderer **296/296** in 19 files (`green-run.log`), `tsc` web + test clean, Biome 0 errors / 8 warnings (same list).
  - Mutants (`mutants.log`, run before (x7) existed):
    - PM-1 (no prune): kills (x1)–(x6);
    - PM-2 (clear instead of prune): kills (x2), (x6);
    - PM-3 (always a new array): kills (x6).
- **Every load path is covered by one store change.** All three loaders (Open Folder, Rescan, drop), their scan-reject branches (`setFiles([])`) and Close Folder go through `setFiles`. Dropped WAV files also go through `openFolder(parentDir)` (`App.tsx:146-151`). `grep -rn "setState(" src/renderer/src` finds nothing, so no `src` code writes `files` around `setFiles`.

## Decision D-44 (renderer only, `contract_with: none`)
`useFileStore.setFiles(files)` keeps `selectedPaths` to the paths that are in the new `files`, in their existing order.
- **Nothing pruned:** when no selected path is dropped, the state update does not include `selectedPaths`, so the array keeps its identity (x6). This avoids a needless MetadataPanel sync.
- **Paths pruned:** when at least one path is dropped, the store gets the filtered array.
- **Load start is unchanged:** `clearSelection()` at load start, `selectRange`, `selectAll` and the D-31 anchor rules stay as they are.
- **Rejected alternative: clear the selection when a load applies.** It would throw away a deliberate click on a row that the same Rescan still lists (x2, killed as PM-2). For a different folder, pruning and clearing give the same result, because no old path is listed there.
- **Precedent:** `selectRange` already filters the selection to visible paths (`file-store.ts:93`).

## Reference (selection when a file list is reloaded)
Searched:
- Mp3tag docs and forum;
- Kid3 handbook / man page;
- Qt `QItemSelectionModel` docs (Kid3 is a Qt app);
- Windows File Explorer refresh behaviour.

| # | Source | What it says | Kind |
|---|---|---|---|
| R0 | this app, `MetadataPanel.tsx:119-121` | A selection change while the form is dirty shows the toast `Unsaved changes were discarded` | confirmed (code) |
| R1 | Qt 5.15 `QItemSelectionModel` — https://doc.qt.io/qt-5.15/qitemselectionmodel.html | `reset()`: "Clears the selection model. Does not emit any signals." `selectionChanged`/`currentChanged`: "will not be emitted when the item model is reset." | confirmed (docs) |
| R2 | Kid3 handbook — https://kid3.sourceforge.io/kid3_en.html, man page https://man.archlinux.org/man/kid3.1.en.txt | Opening a folder fills the file list with its files. Only FILE arguments on the command line open "the folder and select the files". | confirmed (docs) |
| R3 | Mp3tag Options → General — https://docs.mp3tag.de/customization/options/general/ ; v2.73 notes https://community.mp3tag.de/t/mp3tag-v2-73-released/17475 | "Select files automatically: This option enables the automatic selection of files that are added to Mp3tag's File List." The option is opt-in; no default is stated. A forum answer for v2.59 says selection after loading needs Ctrl+A (https://community.mp3tag.de/t/windows-xp-context-menu-auto-select-all-when-loading-a-directory/15738). | confirmed (docs); "default off" is an inference |
| R4 | Windows File Explorer refresh / navigate | No Microsoft source was found. Forum posts disagree: one says Explorer keeps the cursor on refresh (https://explorerplusplus.com/forum/viewtopic.php?p=7172); Directory Opus resets it by design (https://resource.dopus.com/t/command-gorefreshkeepselection-refresh-keep-selected/19176). | anecdotal; not used as a reference |

**Inference from R1–R3:** in these editors, a newly loaded folder starts with no selection unless the user opted in to auto-select. No reference keeps a selected file that is not in the list. No source was found for what Qt or Kid3 do with selected rows that survive a refresh, and B does not claim one.

### Deviations
1. **Pruning, not clearing, when a row survives a Rescan.** A row clicked during a pending Rescan stays selected if the new listing still has it. Reason: the click was a deliberate action on the current folder's list after the load had already cleared the selection. For a different folder the result equals clearing (R1–R3).
2. **The old listing stays clickable while a scan is pending.** This is not changed this round. Locking or blanking the list is a new UX change (Saba-question candidate) and is recorded as a signal. With D-44, such a click can no longer outlive the load.
3. **No auto-select of new files.** Mp3tag's opt-in option (R3) is not copied; this matches today's behaviour.
4. **Unsaved typing in a pruned row.** It now produces the app's existing selection-change rule (R0) at the moment the load applies: toast `Unsaved changes were discarded` and an empty editor (x5). Before the fix the edits stayed `isDirty` with no visible owner and were discarded at the next click. No reference was found for unsaved tag-panel edits during a directory change; the in-app rule is followed.

## Baseline
- HEAD `51969a270d9642b8d2e9ae4fb9ab309b43fbcece`; working tree clean. If HEAD differs, stop and report. The one exception is the release-commit rule in the project policy: a root `chore(release)` commit that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `51969a2`):**
  - every `src/` file except `src/renderer/src/stores/file-store.ts`;
  - `tests/**` except the one new test file below;
  - every `docs/**` file except `docs/bugs/001-…` and `docs/bugs/README.md`;
  - `.claude/**` (including `TESTING.md` this round);
  - `package.json`, `package-lock.json`, `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts`, `.github/**`.
- **Protected (never touch):** `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope

### 1. Test first (test-on-bugfix rule): new file `tests/renderer/components/selection-after-folder-switch.test.ts`
- **Content:** take B's file `b-round-36-exp/selection-after-folder-switch.test.ts.txt`. Use its 7 tests (x1)–(x7) with the names and assertions unchanged. Describe block: `selection after a folder switch (TM-B39)`.
- **A may adjust:** import order and formatting only, matching the existing component suites (double quotes, semicolons, `getButtonByText`, no comments, no `any`, no `{ timeout }`).
- **Red first:** before touching `file-store.ts`, run the file on `51969a2` src. Record in `a-round-37.md` that all 7 fail and give each failure message.
- **What the tests cover:**
  - (x1) Open Folder B with the scan pending, row of A clicked, B applies → selection `[]`, no `selected ·` text;
  - (x2) Rescan with the scan pending, `a.wav` + Ctrl `a2.wav` clicked, new listing has only `a2.wav` → `[a2]`;
  - (x3) App drop of folder B with the scan pending, row of A clicked → `[]`;
  - (x4) Open Folder B whose scan rejects, row of A clicked → `[]`;
  - (x5) typing in A's row during a pending Open Folder B, B applies → `[]`, toast `Unsaved changes were discarded`, `editingMetadata` `{}`;
  - (x6) store: `setFiles` keeps the same `selectedPaths` array (`toBe`) when nothing is pruned, and gives `[]` when everything is pruned;
  - (x7) pin with D-31: the anchor row is pruned by Rescan and another selected row is kept → `[a2]`; Shift-click `a3.wav` → `[a3]` (plain single selection, because the anchor is not listed).

### 2. Fix (D-44): `src/renderer/src/stores/file-store.ts`, exactly as in `b-round-36-exp/prototype.diff.txt`
- **Line 55:** `setFiles: (files) => set({ files }),` becomes `setFiles: (files) => set((state) => withListedSelection(state, files)),`.
- **Append at the end of the file**, after `useSelectionCount`, a private (non-exported) function:
  ```ts
  function withListedSelection(
    state: FileState,
    files: WavFileEntry[],
  ): Pick<FileState, 'files'> | Pick<FileState, 'files' | 'selectedPaths'> {
    const listedPaths = new Set(files.map((file) => file.path));
    const selectedPaths = state.selectedPaths.filter((path) => listedPaths.has(path));
    if (selectedPaths.length === state.selectedPaths.length) return { files };
    return { files, selectedPaths };
  }
  ```
- **Why at the end:** lines 1–240 stay byte-identical except line 55. Every existing `file-store.ts:N` ref in `docs/bugs/001` therefore stays valid (entry 14 `:16`, `:155-158`, `:161-163`; entry 7 `:87-101`, and others).
- **Style:** single quotes as in `src/`, no comments, no new export, no other change in the file. Every other `src/` file is frozen: no change to the loaders, FileList, Toolbar or MetadataPanel.

### 3. Docs (Georgian, English technical terms)

**`docs/bugs/001-save-and-selection-known-limits.md`**: append a new entry `## 20. folder-ის load-ის შემდეგ selection ძველ path-ს ინარჩუნებდა`. Use the same field layout as entries 14–18:
- **ID:** C-R34-01, TM-B39. **Severity:** low.
- **ფაილი:**
  - `src/renderer/src/stores/file-store.ts:55` (`setFiles`);
  - the appended `withListedSelection` lines (actual numbers after A's edit);
  - `FolderBrowser.tsx:103`/`:108`, `:161`/`:166`; `App.tsx:48`/`:61` (load-start `clearSelection` and `setFiles`);
  - `FileList.tsx:68` (the click).
- **მიღწევადობა:** the old listing stays clickable while a scan is pending; Rescan → the same folder; Open Folder / drop → another folder.
- **Reproduction (გასწორებამდე):** start state, action, result (`1 selected`, no highlighted row, "Select a file to edit metadata", dirty edits with no owner, anchor on an unlisted path).
- **დისკზე არაფერი იცვლება:** Save is a no-op with an empty `selectedFiles` (`MetadataPanel.tsx:143`).
- **Reference:** R1–R3 in one line each. Say that R4 was searched and is anecdotal.
- **Deviations:** 1–4 above, one line each.
- **გადაწყვეტილება:** D-44, plus the rejected "clear" alternative.
- **ტესტი:** all 7 full test names.
- **სტატუსი:** `გასწორდა (D-44, TM-B39)`.

Nothing else in the file changes.

**`docs/bugs/README.md`**: in row 001 only, change the counts from `19 ჩანაწერი; 10 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა` to `20 ჩანაწერი; 11 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა`. Recount after editing and report the counts.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/components/selection-after-folder-switch.test.ts` (new) | §1 |
| `src/renderer/src/stores/file-store.ts` | §2, line 55 + appended function |
| `docs/bugs/001-save-and-selection-known-limits.md` | §3, entry 20 appended |
| `docs/bugs/README.md` | §3, row 001 counts |

A also writes `a-round-37.md` (and any `a-round-37/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R37-1 ownership | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 51969a2`;</li><li>`git diff --quiet 51969a2 -- . ':!<4 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is the new test file.</li><li>`git diff 51969a2 -- src/renderer/src/stores/file-store.ts` is exactly line 55 plus the appended function, byte-equal to `b-round-36-exp/prototype.diff.txt`'s `+` lines.</li><li>`head -n 240` of the new file equals the old one except line 55 (C diffs them).</li><li>No comment, no `any`, no new export, no `{ timeout }` / `testTimeout`.</li></ul> |
| R37-2 red → green | In a throwaway copy, A's test file on `51969a2` src; then A's tree. Also each file alone. | <ul><li>Red: **7/7 fail** on the symptom (`selectedPaths` still holds the old path), no other failure.</li><li>Green: renderer **296/296** in 19 files, twice.</li><li>The new file alone: green; every test < 1.5 s.</li><li>(x1)–(x7) names and assertions match B's file (`diff -w`, ignoring import order).</li></ul> |
| R37-3 mutants | On copies of A's tree:<ul><li>PM-1: line `if (selectedPaths.length === state.selectedPaths.length) return { files };` → `return { files };`;</li><li>PM-2: return `selectedPaths: []` whenever the selection is non-empty;</li><li>PM-3: the identity early return removed;</li><li>PM-4: prune only in `FolderBrowser` (revert `file-store.ts`, add the same filter after `setFiles` in `handleOpenFolder` only).</li></ul>Plus C's own. | <ul><li>PM-1 kills (x1)–(x7); PM-2 kills (x2)(x6)(x7); PM-3 kills (x6); PM-4 kills at least (x2)(x3).</li><li>A survivor is acceptable only with C's equivalence argument; it is recorded as a low finding.</li></ul> |
| R37-4 real app, old `51969a2` vs new | Build both (`npm run build`). Run Playwright `_electron` under `xvfb-run -a`, `--no-sandbox`, with an isolated `XDG_CONFIG_HOME` per scenario and the `c-round-33/harness.cjs` scan delay (≥ 3000 ms on the target folder). Stub `dialog.showOpenDialog`. Drive the UI only. Fixture folders hold real WAVs (copies of `tests/fixtures`).<ul><li>**S1 (other folder):** open `/fa` (2 files, `a.wav`, `a2.wav`) → Open Folder `/fb` (exactly one file, `b.wav`; delayed) → click `a.wav` during the delay → wait for the load. Screenshot before and after.</li><li>**S2 (Rescan, row survives):** open `/fa` (`a.wav`, `a2.wav`) → delete `a.wav` on disk → Rescan (delayed) → click `a.wav`, Ctrl-click `a2.wav` → wait.</li><li>**S3 (dirty):** as S1, but type into Category of `a.wav` before the load applies.</li><li>**S2-save (new build only):** after S2, type Category `R37Kept` → Save Tags.</li></ul> | <ul><li>**S1 old:** toolbar `1 selected · 1 files`, no highlighted row, panel "Select a file to edit metadata" (red, as C-R34-01).</li><li>**S1 new:** no `selected` text, no highlighted row, same panel text.</li><li>**S2 new:** `a2.wav` highlighted, toolbar `1 selected · 1 files`, form shows `a2.wav`'s values. **S2 old:** `2 selected` with one highlighted row.</li><li>**S3 new:** toast `Unsaved changes were discarded` when B applies, empty panel. **S3 old:** no toast, `1 selected`.</li><li>**S2-save:** `a2.wav` is written, read with `ffprobe -show_entries format_tags -of json` and `music-metadata`. Both give `ICAT=R37Kept`, compared field by field with the form. sha256 of every other fixture is unchanged.</li><li>In S1/S3 sha256 is unchanged for every file.</li><li>`pageErrors` empty in every run. Screenshots are saved as `r37-4-<build>-<scen>-NN.png`.</li></ul> |
| R37-5 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`.</li><li>Typecheck node/web/test 0.</li><li>Renderer **296**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R37-6 docs | Read `git diff 51969a2 -- docs/`. | <ul><li>Entry 20 is appended in Georgian with English terms and has every field from §3, including Reference and Deviations.</li><li>Each of the 7 test names: 1 match in the docs and 1 in the test file.</li><li>Every `file:line` ref in entry 20 points at the named code (C checks with `sed -n`).</li><li>Every ref in entries 1–19 is byte-identical to `51969a2` (`git diff --word-diff` shows only the appended entry).</li><li>README row 001 is `20 / 11 / 5`; C recounts the entries and the `გასწორდა` statuses.</li><li>No other docs change.</li><li>C checks each Reference row R1–R3 against its URL and confirms Deviations 1–4 are what the app does.</li></ul> |

## What could break (C re-checks)
- **Selection stability during normal use:**
  - after a plain click, Ctrl-click, Shift-click, Select All and Deselect All with no load running, `selectedPaths` keeps its array identity across `setFiles` calls that drop nothing (x6);
  - the editor does not lose typed text when a load lists the selected file again (S2 new: type, then check that the form keeps values for a surviving row with no load).
- **The Shift-click anchor (D-31, entries 7–8):** a pruned anchor makes Shift-click a plain click (x7). A surviving anchor still gives a range: C checks Shift-click after an S2-style Rescan in the real app (new build) and records the result.
- **Save paths:** `isListedPath` guards (D-39), batch save `Save to N files` after a prune, and the D-29 selection-set comparison. The full renderer suite covers them (`metadata-panel-batch-save`, `reread-after-folder-switch`, `folder-read-during-save`).
- **Close Folder:** still clears everything. `setFiles([])` with an already empty selection must not throw or loop.
- **E2E folder workflow:** the gate's E2E is unchanged and must stay 7/7.

## What realVerified means here
- `src/` changes (one store action), so real-app evidence is required: R37-4 old vs new, with screenshots, plus the gate's E2E (R37-5).
- A save happens only in S2-save, and there metadata is checked by ffprobe and music-metadata. In every other scenario the evidence is sha256 unchanged plus the UI state.
- B's red/green numbers above are a hypothesis until C reproduces them (R37-2).
- PASS on all six closes TM-B39 and C-R34-01 and verifies D-44.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 38 fixes it first.
- Otherwise round 38 is **TM-B40**: focus-keeping busy Done/Save Tags via `aria-disabled` + `aria-busy`, and the arrows' double opacity. Its Reference comes from R35's R4/R5 sources. RR-R36-01 ((b7)'s weak `qtwo` assertion) rides with TM-B40, because that round edits `schema-editor-done-busy.test.ts` anyway.
- Then **TM-B41** (test-only): `dom-queries` unit tests (C-R36-01), RegExp `g`/`y` `lastIndex` (RR-R36-03), and two TESTING.md §6 lines (RR-R36-02 a11y via `getByRole`; RR-R36-04 drop the agent name).
- After that, the remaining items need Saba or root:
  - Saba's question batch (`b-round-23.md` §5, plus Deviation 2 here: lock the list during a scan);
  - TM-T2 / TM-T2-DATA (UCS list and its licence);
  - root's Actions link for TM-T0-CI / TM-B14.
