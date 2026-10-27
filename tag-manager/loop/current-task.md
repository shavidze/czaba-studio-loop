# CURRENT TASK — Round 20: TM-B23 — a selection change during a pending save must not put the saved file's values into the new selection's editor — D-29

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 19 result:** C PASS, realVerified=true (R19-1…R19-5), 0 bugs.
  - Red on `d015470`: 11 failed / 46 passed. Green: 57/57. Mutants M1–M8 and M3b were all killed.
  - Gate: 162/93/7. In the real app, Size and Date equal `fs.stat` after single, batch and partial saves.
  - Root published `3006615` with review COMMIT OK. TM-B22 and D-28 are done.
- **New high bug, TM-B23** (qa-engineer P1 in `a-round-19.md`; C relayed it but did not reproduce it). B confirmed it by reading the code on `3006615`:
  - `handleSave` captures `selectedFiles` and `editingMetadata` in its closure. The file list has no lock during a save; only the Save button is disabled (`MetadataPanel.tsx:284`).
  - Single (`MetadataPanel.tsx:96-108`): select A, edit, then click Save. While the write, scan and re-read are pending, the user clicks B. The sync effect (`:54-87`) loads B into the editor and shows `Unsaved changes were discarded`. Then the save resumes and, without any check, runs `skipSyncRef.current = true; updateFileMetadata(A); setEditingMetadata({...A's re-read})` (`:105-107`). The effect consumes `skipSyncRef` and returns.
  - **Result:** B is selected, but the form shows A's values, and `isDirty` is false. The next edit + Save calls `writeMetadata(B, <A's full field set + the edit>)`. A's title, comment and so on are silently written into B. That is data corruption, so the severity is **high**.
  - Batch (`:133-143`): the same shape. `skipSyncRef` and `setEditingMetadata({})` run after a reselect, so the newly selected file shows an empty or stale form. After a partial batch failure, the form shows the file's pre-save values while the store already has the new ones.
  - D-28 (R19) widened the window, because the save now spans write + scan + read.
- Critical, security and data-loss bugs come first, so this goes ahead of every other open item. TM-B24 (text typed during a pending save on the **same** selection is replaced, qa-engineer P3) has a different fix and stays for later.
- **Reference first:** this is a pure fix. The UX is unchanged: the list stays clickable and the toasts stay the same. Locking the list during a save would be new UX and would need the reference study and Saba (B-R19-01), so it is **not** part of this round.

## Baseline
- HEAD `3006615b365edf3847542c06e119a020b426b093`, and the working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `3006615`): everything not in the ownership table, in particular:
  - `src/main/**`, `src/shared/**`, every store (including `file-store.ts` and `metadata-store.ts`), `FileList.tsx`, `FolderBrowser.tsx`, `App.tsx`, the other components;
  - every test except the one owned file, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/stores/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, every `.claude/**` file except the one owned primitive, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- No store change is needed. If you find you need one, stop and report it; do not widen ownership yourself.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** That means no `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, or a script that writes repository files. Gitignored build and test outputs from npm commands are the only exception.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` and `STATE_MANAGEMENT.md`. In `a-round-20.md`, record when you read each one and whether the read-primitives hook fired.
- The `.claude/primitives/STATE_MANAGEMENT.md` edit uses the Edit tool (standing path (b) permission). If it is refused, stop that one step and report it. Do not use Bash.

## Scope (D-29, see `feature-status.md`)
Follow the `test-on-bugfix` rule: write the failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments. No `any`, `@ts-ignore`, `as unknown as`, and no new `as` cast. No new export.
- Tests: keep the file's existing double-quote style. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-29)
1. **At the start of `handleSave`**, after the `selectedFiles.length === 0` return, read `useFileStore.getState().selectedPaths` (the start selection).
2. **After the awaits**, at each point where today's code touches the editor, compare the start selection with the current `useFileStore.getState().selectedPaths` **as a set**: same size and same members, order ignored. A private module-level helper is fine; it must not be exported.
3. **Same set:** everything exactly as today, per D-21, D-22, D-24 and D-28.
4. **Different set** (another file selected, the selection cleared, or a folder opened during the save):
   - **Still runs:**
     - the D-28 refresh (`refreshSavedFileStats`);
     - `updateFileMetadata` for the written/re-read paths (single: the one path; batch: the non-failed paths, per D-22). This is what is on disk, and it keeps the Tagged badge right;
     - every toast, with unchanged text and type (`Tags saved`, `Tags saved to N files`, `N saved, M failed`, and the D-24 texts).
   - **Not run:**
     - `skipSyncRef.current = true`;
     - `setEditingMetadata(...)`, neither `{ ...updated }` (single) nor `{}` (batch all-succeeded).
   - **Expected end state:** the `metadata` change re-runs the sync effect.
     - If the user has not typed on the new selection, the editor shows the new selection's values from the store, and `isDirty === false`.
     - If the user typed on the new selection during the save (`isDirty`), those edits stay, and `isDirty === true`.
     - With an empty selection, `editingMetadata` stays `{}`.
5. **Unchanged:**
   - the write-reject and re-read-reject (D-24) paths. They do not touch the editor today;
   - the `Unsaved changes were discarded` toast shown by the sync effect when the selection changes (B-R19-01, a Saba question);
   - `setIsSaving(false)` in `finally`;
   - main, preload, the stores, `FileList.tsx`.
6. **`STATE_MANAGEMENT.md` `### Save flow`:** add one line inside the code block. Additions only:
   `Selection changed during save (D-29): start selectedPaths vs current (as set); changed → store updates + toasts as usual, but no skipSync and no setEditingMetadata (sync effect shows the current selection)`.

### Tests (prescribed) — `tests/renderer/components/metadata-panel-batch-save.test.ts`
- **Additions only.** Add one new `describe("MetadataPanel save while the selection changes (TM-B23, D-29)")`. The existing `beforeEach` is not changed.
- Existing tests (a)–(w) and (s6) must stay byte-identical and green.
- Reuse `seedFiles`, `seedTaggedFiles`, `taggedSeed`, `mockBatchApi`, `getCategoryInput`, `clickSave` and the `vi.hoisted` workaround.
- **Deferred write.** Inside the describe, a small helper makes the write pending, for example `vi.mocked(window.api.writeMetadata).mockReturnValueOnce(new Promise<void>((resolve) => { release = resolve; }))`, and the same for `writeMetadataBatch` with a `BatchWriteResult`. While it is pending, change the selection with `act(() => { useFileStore.setState({ selectedPaths: [...] }); })`. Then resolve inside `await act(async () => { ... })` so every later await settles.
- **Seeds:**
  - A = `{ ...taggedSeed("A-comment"), title: "A-title", category: "ACat" }`;
  - B = `{ ...taggedSeed("B-comment"), title: "B-title", category: "BCat" }`;
  - single re-read of A returns `{ ...A, category: "R20Cat" }`.
- **Imports:** extend an existing import line only if a name is really missing. Never add a second line from the same module.

| Test | Setup → action | Must hold after the save settles | On `3006615` |
|---|---|---|---|
| **(x1)** single, A→B | A selected, Category `R20Cat`, Save; while the write is pending select `[B]`; resolve | Category input `BCat`; `editingMetadata.comment === "B-comment"`; `metadata[A].category === "R20Cat"` (store updated); `metadata[B]` deep-equals the B seed; final toast `Tags saved`; `isSaving === false`; `isDirty === false` | **fails** (input shows `R20Cat`) |
| **(x2)** follow-up save writes B's own values | (x1), then set Category `BEdit` and click `Save Tags` (second write resolves normally) | second `writeMetadata` call: path `PATH_B`, `meta.category === "BEdit"`, `meta.comment === "B-comment"`, `meta.title === "B-title"` | **fails** (comment/title are A's): this is the data-corruption proof |
| **(x3)** user types on B during the save | as (x1), but after selecting B and before resolving, change Category to `BTyped` | Category input `BTyped`; `isDirty === true`; `modifiedFields` contains `category`; `metadata[A].category === "R20Cat"` | **fails** (overwritten with `R20Cat`, `isDirty` false) |
| **(x4)** selection cleared | as (x1), but select `[]` | no throw; `Select a file to edit metadata` shown; `editingMetadata` deep-equals `{}`; `metadata[A].category === "R20Cat"`; toast `Tags saved` | **fails** (`editingMetadata` holds A's re-read) |
| **(x5)** batch all-succeeded, A+B → A | `seedTaggedFiles` (both `OLDCat`), Category `TYPED_CATEGORY`, `Save to 2 files`; pending; select `[A]`; resolve `ALL_SUCCEEDED`, refreshed both with `category: TYPED_CATEGORY` | Category input `TYPED_CATEGORY` (A's refreshed value); toast `Tags saved to 2 files`; `selectedPaths` `[A]`; `isDirty === false` | **fails** (input empty: `setEditingMetadata({})`) |
| **(x6)** batch partial, A+B → A | as (x5), resolve `PARTIAL_FAILED` (A ok), refreshed A `TYPED_CATEGORY` | Category input `TYPED_CATEGORY`; toast `1 saved, 1 failed`; `metadata[B]` unchanged (D-22) | **fails** (input `OLDCat`, stale) |
| **(x7)** pin: write rejects after A→B | single, write deferred then rejected with `new Error("EACCES")` | toast `EACCES`; Category input `BCat`; `metadata[A]` unchanged; `readMetadata` not called | passes |
| **(x8)** pin: D-24 after A→B | single, write ok, `readMetadata` rejects | toast `Tags saved, but reloading failed. Rescan to refresh.`; Category input `BCat`; `metadata[A]` unchanged | passes |
| **(x9)** pin: same set reordered | batch A+B; pending; select `[B, A]`; `ALL_SUCCEEDED` | as today: `editingMetadata` deep-equals `{}`; `isDirty === false`; toast `Tags saved to 2 files` | passes |
| **(x10)** pin: A→B→A | single; pending; select `[B]` then `[A]`; resolve | as today: Category input `R20Cat`; `isDirty === false`; toast `Tags saved` | passes |

Red run on `3006615`, before the fix. Save the log in `a-round-20/`.
- **Primary red:** (x1)–(x6) fail with the symptom, i.e. a wrong input value, a wrong write argument or wrong `editingMetadata`. Record the exact messages.
- (x7)–(x10) pass on `3006615`. Say so.

### `a-round-20.md` (Georgian) contains
- the red and green logs and the diff;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`;
- a `qa-engineer` read-only regression check (bugfix rule);
- the process statement.
- A `code-reviewer` run is optional (3 files).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | selection guard in `handleSave` (D-29) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | tests (x1)–(x10), additions only |
| `.claude/primitives/STATE_MANAGEMENT.md` | one added line in `### Save flow` |

Logs go to `a-round-20/` (A) and `c-round-20/` (C) in the loop folder. Nothing else in the repository may be written, except the gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`). C's harness module lives in `c-round-20/`, never in the repository.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R20-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat 3006615`, and `git diff --quiet 3006615 -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!.claude/primitives/STATE_MANAGEMENT.md'`. Read the diff and A's result JSON and transcript. | All of these hold:<ul><li>Only the 3 owned paths differ, all `M`, with no untracked file.</li><li>`git diff 3006615 -- tests/ .claude/ \| grep '^-[^-]'` is empty, except an import line that comes back with the same names plus new ones.</li><li>The src diff has no comment, no `any`/`@ts-ignore`/new `as`, and no new export.</li><li>Stores, main, preload and types are untouched.</li><li>`permission_denials` is empty.</li><li>All repo writes were made with Edit/Write. Say whether the transcript was available (C-R12-01).</li></ul> |
| R20-2 red/green | Run `git worktree add --detach /tmp/c-r20-old 3006615` with `node_modules` symlinked. Never use `git stash`. Copy A's test file in and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts`. Then run the same command on A's tree. | Old code: (x1)–(x6) fail with the symptom (wrong value or write argument, not a harness error). (x7)–(x10) and every older test pass. Record names and messages. New code: all pass, with the exact count. |
| R20-3 mutations | In a throwaway copy of A's tree, run the test file once per mutant:<ul><li>**M1:** no guard.</li><li>**M2:** the guard also skips `updateFileMetadata`.</li><li>**M3:** the comparison checks only the length.</li><li>**M4 (expected equivalent, record only):** ordered comparison (`join`). The sync effect already keys the selection on `join('\0')`, so a reorder clears the editor to `{}` before the write resolves, and (x9) ends the same with either compare. C confirms this by reasoning or a run and records it; a surviving M4 is **not** a FAIL.</li><li>**M5:** guard on single only; batch unguarded.</li><li>**M6:** the guard skips `setEditingMetadata` but still sets `skipSyncRef`.</li><li>**M7:** the guard compares the render-time `selectedFiles` instead of `getState()`.</li><li>**M8:** toasts skipped when the selection changed.</li></ul> | Each mutant is killed by at least one named test. Expected killers: M1 (x1); M2 (x1)/(x4) store; M3 (x1); M4 none (equivalent, see above; (x9) stays a pin); M5 (x5)/(x6); M6 (x5)/(x6); M7 (x1); M8 (x1)/(x5). A survivor other than M4 is a FAIL unless C shows it is equivalent. |
| R20-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and 9 warnings, the same file/rule list as on `3006615`.</li><li>Typecheck 0.</li><li>Renderer **162 + new** (exact count; 10 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R20-5 real app | **Harness** (no source change): launch the built app with Playwright `_electron` under `xvfb-run` and the args `['--no-sandbox', '-r', '<c-round-20>/delay-write.cjs', 'out/main/index.js']`. The module wraps `ipcMain.handle` and delays only `meta:write` and `meta:write-batch` by `R20_WRITE_DELAY_MS` (3000). B's tested example is `b-round-19-exp-delay-write.cjs.txt`; it measured 1502 ms with 1500. The write itself stays real. Drive the UI only; the folder dialog may be stubbed. Copy `tests/fixtures/sample.wav` into a temp folder as `a.wav`, `b.wav`, `c.wav`, then scan.<ol><li>Select `b.wav`, set Title `B-title` and Comment `B-comment`, Save, and wait for `Tags saved`.</li><li>Select `a.wav`, set Title `A-title`, Comment `A-comment` and Category `R20A`, then click Save. **Within the delay**, click `b.wav`, and record the ms between the two clicks. Wait for `Tags saved`. Record every toast seen.</li><li>Read the form: Title, Comment and Category.</li><li>On `b.wav`, change only Category to `R20B`, Save, and wait for the toast.</li><li>Batch: click `a.wav`, Ctrl-click `b.wav`, set Genres `R20Batch`, and click `Save to 2 files`. Within the delay click `a.wav` alone, wait for `Tags saved to 2 files`, and read the form.</li><li>Regression without a mid-save click: select `c.wav`, set Category `R20C`, Save; the form shows `R20C`, `isDirty` is off (Save disabled), toast `Tags saved`.</li><li>Read every file with `music-metadata` and `ffprobe -show_entries format_tags -of json`.</li><li>**Red reference:** build `3006615` in the old worktree and repeat steps 1–4 and 7 on fresh copies.</li></ol>Take a screenshot after each step. | All of these hold:<ul><li>The click gap is below the delay, and the second click happened before the first `Tags saved`.</li><li>(3) The form shows `B-title`, `B-comment`, Category empty, and the file header shows `b.wav`.</li><li>(4)+(7) **Hard checks:** ffprobe and music-metadata on `b.wav`: title `B-title`, comment `B-comment`, ICAT `R20B`. On `a.wav`: title `A-title`, comment `A-comment`, ICAT `R20A`.</li><li>(5) The form shows `a.wav`'s values (Title `A-title`, Category `R20A`), not an empty form. ffprobe genre `R20Batch` on `a` and `b`.</li><li>(6) As listed; `c.wav` ICAT `R20C`.</li><li>(8) On the `3006615` build, `b.wav` carries `A-title`/`A-comment` after step 4 in both readers. That proves the bug was real. If it does not reproduce, report it, and the round is not PASS until B re-plans.</li><li>`pageErrors` is empty in every phase.</li><li>Record the `Unsaved changes were discarded` toast at the click; it is expected and unchanged (B-R19-01).</li><li>Artists are record only (TM-B08).</li></ul> |

## What could break (C re-checks)
- **D-21/D-22/D-24/D-28 save outcomes without a selection change:** toasts, kept edits, `isDirty`, `skipSyncRef`, failed-file store entries, and Size/Date refresh. Covered by the existing tests (a)–(w) and (s6), byte-identical and green, and by R20-5 step 6.
- **The sync effect:** no `Unsaved changes` toast after a normal save, and none after the guarded save once the selection settled (R20-5 steps 2, 5 and 6).
- **Batch Tagged badges and the D-22 failed-file entries** with a mid-save reselect ((x6)).
- **Template apply and schema change** (`mergeFields`, `handleSchemaChanged`) are untouched.
- **Folder switch during a save** (A-R19-02): the selection is cleared, so the editor is untouched ((x4)). The stray metadata key stays a signal.

## What realVerified means here
- R20-1…R20-4 are real local checks.
- R20-5 is the real-app proof. The delay harness only stretches the timing; the write and the read are real, and the result is checked by independent readers with a red reference.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
1. **TM-B24** (medium): text typed during a pending save on the same selection is lost. It is a merge of the edits made after save start, and the same deferred-write harness applies.
2. **MetadataPanel polish:**
   - RR-R13-02 + RR-R15-02: remove the `as WavMetadata` casts;
   - RR-R15-01: the re-read reason, which needs a D-24 amendment (Saba).
3. **Saba question batch:** see `b-round-19.md`. It adds RR-R19-01 (a full rescan per save, rated medium) to B-R18-01, and adds B-R19-01.
