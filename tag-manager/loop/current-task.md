# CURRENT TASK — Round 23: TM-B26 — save/selection hygiene: pin D-31 deviation 1, isolate the batch-save test mocks, MetadataPanel snapshot + casts (D-32), docs/bugs known limits

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 22 result:** C PASS, realVerified=true (R22-1…R22-5). C found 1 low bug, **C-R22-01**: a test gap, not a product bug.
  - Red on `601dc4a`: 6 failed / 13 passed. Green 19/19. M1–M6 were killed. Gate: 198/93/7, Biome 8 warnings.
  - Real app: after a save, a Shift-click selects a–c, and `Save to 3 files` writes ICAT `R22Range` to a, b and c only. Both ffprobe and music-metadata confirm it. The `601dc4a` build selected only c.wav.
  - Root published `9d1c97e` (review COMMIT OK). TM-B25 and D-31 are done.
- **C-R22-01 comes first** (C's bug). C's extra mutant M7 (`if (!e.shiftKey) anchorPathRef.current = file.path;`) survives all 19 tests. So no unit test protects D-31 target behaviour #2 / deviation 1 ("every click, including Shift, sets the anchor").
- **The rest is the MetadataPanel hygiene round announced in `b-round-21.md` and in round 22's "Next".** Every item is low, renderer-only, and needs no Saba decision:
  - **A-R21-04:** `metadata-panel-batch-save.test.ts` resets its `window.api` mocks with `mockClear()`. That keeps queued `…Once` values, so a test that fails before Save leaks them into the next test. This is a real test-infrastructure bug; B reproduced it (see below).
  - **RR-R21-01 + RR-R13-02 + RR-R15-02 → D-32:**
    - take the save-start snapshot from one `useMetadataStore.getState()` read and use it for both the payload and the D-30 comparison;
    - remove the 6 redundant casts.
  - **RR-R21-02, A-R21-01, A-R21-02, A-R21-03, RR-R22-02:** write the known limits of D-29/D-30/D-31 into `docs/bugs/` (the `qa-trigger` report format) so they are no longer only in loop files.
- **No critical or high bug is open.** All other open items wait on Saba's question batch or on root's Actions link.
- **Reference-first:** exempt. This round only adds tests, removes casts without changing behaviour, and writes docs. No UX changes. The D-31 reference and its deviations are in `tasks/round-22.md` and stay unchanged.

### B's experiments (a `/tmp` copy of `9d1c97e`; the repository was not touched)
Diff: `b-round-22-exp/b-round-22-exp.diff.txt`. For orientation only, not prescriptive.
- **(z12)** passes on `9d1c97e` (20/20). With M7 it fails: `expected [ 'dx.wav' ] to deeply equal [ 'cx.wav', 'dx.wav' ]`.
- **(i1)/(i2)** with today's `beforeEach` (`mockClear`): (i2) fails with `AssertionError: promise rejected "Error: leaked" instead of resolving`.
  - With `mockReset` the file passes, 50/50.
  - Reverting any single one of the five `beforeEach` lines to `mockClear` makes (i2) fail.
- **D-32 src change:**
  - tsc (node/web/test) 0. Renderer **201/201** (10 files).
  - Biome 0 errors, **8** warnings, the same list as `9d1c97e`.
  - Biome's formatter **rejects** the multi-line `handleSave` deps array once `editingMetadata` is removed. The array must be on one line.
  - The new test files also pass unchanged on the **old** `9d1c97e` `MetadataPanel.tsx` (201/201). The src change is behaviour-neutral, as intended.

## Baseline
- HEAD `9d1c97e005c9fb430190c7765e44a7ed24b6563f`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `9d1c97e`): everything not in the ownership table, in particular:
  - every store (`src/renderer/src/stores/**`);
  - `FileList.tsx`, `Toolbar.tsx`, `FolderBrowser.tsx`, `App.tsx`, every other component;
  - `src/renderer/src/lib/**`, `src/renderer/src/types/**`, `src/main/**`, `src/shared/**`;
  - every test except the two owned files, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/stores/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**` except the two owned docs paths;
  - `.claude/**` (this round adds no primitive line; D-32 changes no save-flow rule);
  - `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** No `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, and no script that writes repository files. The only exception is gitignored build and test output from npm commands. Run red checks and mutants in a copy outside the repository; never use `git stash`.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `STATE_MANAGEMENT.md` and `GEORGIAN_DOCS.md`. In `a-round-23.md`, record when you read each one and whether the read-primitives hook fired.
- Order (test-on-bugfix):
  1. Write the tests (part A, plus the (i1)/(i2) describe of part B) and run them against the **unchanged** `beforeEach` (red log).
  2. Fix the `beforeEach` (green log).
  3. Make the D-32 src change.
  4. Write the docs.

## Scope

### Part A — C-R22-01: pin D-31 deviation 1 (`tests/renderer/components/file-list.test.ts`)
- **Additions only.** Add one `it` as the **last** test inside the existing `describe("FileList Shift-click anchor (TM-B25, D-31)", ...)`, after (z11), with one blank line before it. Every existing line stays byte-identical.
- Reuse `renderPlainFiles`, `getFileRow`, `selectedNames`, `act` and `useFileStore`. Keep the file's double-quote style.

| Test | Setup → action | Must hold | On `9d1c97e` | On M7 |
|---|---|---|---|---|
| **(z12)** a Shift-click moves the anchor (D-31 deviation 1) | `renderPlainFiles(["a.wav", "b.wav", "cx.wav", "dx.wav"])`; click a; Shift-click cx; **assert** a, b, cx; `act(() => setSearchQuery("x"))`; Shift-click dx | `["cx.wav", "dx.wav"]` | passes (it is a pin) | fails (`['dx.wav']`) |

Why this setup discriminates: because of deviation 2 (the range is added), a plain "click b → Shift d → Shift a" gives the same set whether or not the anchor moved (C, R22-5). The search hides `a.wav`. If the anchor had stayed on `a.wav`, the lookup would miss and only `dx.wav` would be selected.

### Part B — A-R21-04: mock isolation (`tests/renderer/components/metadata-panel-batch-save.test.ts`)
1. **Change only the five mock lines of the top-level `beforeEach`** (`:110-114` on `9d1c97e`): `.mockClear()` → `.mockReset()`. The chained `.mockResolvedValue(...)` stays exactly as it is. No other existing line changes.
2. **Add** one new top-level `describe("mock isolation (A-R21-04)", ...)` at the **end** of the file, with two tests in this order:
   - **(i1)** "leaves unconsumed once-values on every window.api mock". It queues one value on each mock and never consumes them:
     - `writeMetadataBatch`: `mockRejectedValueOnce(new Error("leaked"))`
     - `readMetadataBatch`: `mockResolvedValueOnce({ "/leaked.wav": { title: "leaked" } })`
     - `writeMetadata`: `mockRejectedValueOnce(new Error("leaked"))`
     - `readMetadata`: `mockResolvedValueOnce({ title: "leaked" })`
     - `scanFolder`: `mockRejectedValueOnce(new Error("leaked"))`
   - **(i2)** "starts the next test with only the default mock values" (async). It awaits each call and checks it returns the `beforeEach` default:
     - `writeMetadataBatch(["/x.wav"], {}, [])` resolves to `{ succeeded: 0, failed: [] }`
     - `readMetadataBatch(["/x.wav"], [])` resolves to `{}`
     - `writeMetadata("/x.wav", {}, [])` resolves to `undefined`
     - `readMetadata("/x.wav", [])` resolves to `{}`
     - `scanFolder("/x")` resolves to `[]`
   - The signatures come from `src/preload/index.d.ts`; `tests/**` is type-checked.
3. **Red:** with the unchanged `mockClear` `beforeEach`, (i2) fails. Record the exact message. The expected first one is `promise rejected "Error: leaked" instead of resolving`. Every other test in the file passes.
   - **Green:** 50/50 with `mockReset`.
   - If (i2) passes with `mockClear`, or an existing test fails with `mockReset`, stop and report. Do not change the expectation to fit.

### Part C — D-32: MetadataPanel snapshot and casts (`src/renderer/src/components/metadata-editor/MetadataPanel.tsx`)
1. In `handleSave`, change `const startEditingMetadata = editingMetadata;` to read `useMetadataStore.getState().editingMetadata` once.
2. Use `startEditingMetadata` for all three:
   - the single `writeMetadata` payload;
   - the batch payload loop (`batchMeta[key] = startEditingMetadata[key]` for the keys in `modifiedFields`);
   - the D-30 `collectFieldsTypedDuringSave(startEditingMetadata)` calls, as today.
3. Remove `editingMetadata` from the `handleSave` deps array. Write the array **on one line** (Biome's formatter requires it).
4. **Remove exactly these 6 casts:**
   - `editingMetadata as Partial<WavMetadata>` (single write);
   - `updated as WavMetadata` in `updateFileMetadata(path, …)` (single);
   - `{ ...(updated as WavMetadata) }` (single `setEditingMetadata`);
   - `updated as WavMetadata` in the batch `savedEntries` loop;
   - `accumulated as Record<string, WavMetadata>` (`handleSchemaChanged`);
   - `{ ...(current as WavMetadata) }` (`handleSchemaChanged`).
5. **Keep** the two render narrowings `editingMetadata[field.key] as string[]` and `… as string` (`:287`, `:314` on `9d1c97e`). They narrow the `FieldValue` union to the input prop type, and removing them needs a runtime narrowing, which is out of scope. `grep -c " as " MetadataPanel.tsx` goes from **8** to **2**.
6. **Unchanged:**
   - `editingMetadata` stays subscribed for the render;
   - D-21, D-22, D-24, D-28, D-29, D-30, `skipSyncRef`, the toasts and every store action.
   - No new export, no comment, no `any` / `@ts-ignore` / `as unknown as`, and no new `as`. Single quotes and semicolons.
   - If removing a cast gives a type error, stop and report which one. Do not add a different cast.
7. **No red test is possible:** at click time the closure value equals the store value. The proof is equivalence: the new test files pass unchanged on the `9d1c97e` src and on A's src (R23-2).

### Part D — docs: known limits (`docs/bugs/`)
- **New file `docs/bugs/001-save-and-selection-known-limits.md`**, in Georgian with English technical terms (`GEORGIAN_DOCS.md`).
- **Each entry has:**
  - ID(s);
  - severity;
  - `file:line` on A's final tree;
  - reproduction steps (start state → action → result);
  - the decision it follows (D-ID);
  - the test `file:name` that pins it, or the literal text `ტესტი არ არის` (no test);
  - status: `ცნობილი შეზღუდვა` (known limit) or `Saba-ს კითხვა` (Saba question).
- **Entries (all of them; none may be dropped):**
  1. **RR-R21-02 + A-R21-02** (D-30): a field changed during the write and set back to its start-snapshot value is not "typed", so the editor shows the re-read. Pin: `metadata-panel-batch-save.test.ts` (y4).
  2. **A-R21-01** (D-30): a field that was not in the start snapshot, typed and then erased during the save, is merged as `''`/`0` and keeps the form dirty. In a batch, the next Save writes `''` to that field in every file. Same as typing and erasing without a pending save.
  3. **A-R21-03** (D-30): a schema change during a pending single save. The re-read made with the save-start fields overwrites the `handleSchemaChanged` result.
  4. **B-R19-01 + RR-R20-01** (D-29): switching away from a dirty selection while a save is pending shows `Unsaved changes were discarded`, although the edits are being written. Status: Saba question.
  5. **D-31 deviation 1, B-R21-02 + RR-R22-01:** a Shift-click moves the anchor; Explorer/GTK keep it. Pin: `file-list.test.ts` (z12). Status: Saba question.
  6. **D-31 deviation 2, B-R21-02 + A-R22-01:** Shift-click without Ctrl adds the range; Explorer replaces the selection. Select All → Shift-click therefore changes nothing. Pin: (z10). Status: Saba question.
  7. **D-31 deviation 3, RR-R22-02:** Ctrl-deselecting the last selected row clears the anchor, so the next Shift-click selects one row. Explorer keeps the anchor. Reason: an empty selection is the only reliable signal of a rescan. Pin: (z8) (the Deselect All path, same rule). Status: Saba question (B-R21-02 lists this deviation).
  8. **A-R22-02** (D-31): the anchor is cleared only on a non-empty → empty transition after render. A clear + reselect in one batch would keep a stale anchor. No such code exists today.
- **`docs/bugs/README.md`:** add one row to the existing table (`| 001 | … | … |`). The status cell says it is a list of known limits.
- **No code changes in this part.** Line numbers must point at the code they describe in A's tree.

### `a-round-23.md` (Georgian) contains
- the red and green logs (part A on M7 in a copy, part B on the old `beforeEach`) and the diff;
- the `grep -c " as "` before/after;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last edit;
- the Biome warning list before and after;
- a `qa-engineer` read-only regression check (bugfix rule);
- a `code-reviewer` run (**required**: 3+ files changed);
- the process statement.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/components/file-list.test.ts` | (z12), one `it` added at the end of the TM-B25 describe (part A) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | five `beforeEach` lines `mockClear` → `mockReset`, new describe (i1)/(i2) at the end (part B) |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-32: one `getState()` snapshot, deps array, 6 casts removed (part C) |
| `docs/bugs/001-save-and-selection-known-limits.md` (new) | known-limits record (part D) |
| `docs/bugs/README.md` | one table row (part D) |

Logs go to `a-round-23/` (A) and `c-round-23/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R23-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat 9d1c97e`, and `git diff --quiet 9d1c97e -- . ':!tests/renderer/components/file-list.test.ts' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!docs/bugs/README.md'`. Read the diff, A's result JSON and A's transcript if it is available. | All of these hold:<ul><li>4 `M` paths plus exactly one untracked `docs/bugs/001-save-and-selection-known-limits.md`.</li><li>`git diff 9d1c97e -- tests/ \| grep '^-[^-]'` shows **only** the five `beforeEach` `mockClear` lines of the batch-save file; `file-list.test.ts` has additions only.</li><li>(z12) is the last `it` of the TM-B25 describe. (i1)/(i2) are in one new describe at the end of the batch-save file.</li><li>The src diff has only the D-32 changes: no comment, no `any`/`@ts-ignore`/new `as`, no new export, and `grep -c " as "` 8 → 2.</li><li>`docs/bugs/README.md` gains one row and nothing else.</li><li>`permission_denials` is empty, and the repo writes were made with Edit/Write. Say whether the transcript was available.</li></ul> |
| R23-2 red/green + equivalence | `git worktree add --detach /tmp/c-r23-old 9d1c97e` with `node_modules` symlinked; never use `git stash`.<ol><li>Copy A's **two test files** into the old worktree and run the full renderer suite there (old src, new tests).</li><li>In a copy of A's tree, revert only the five `beforeEach` lines to `mockClear`, then run the batch-save file.</li><li>Run the full renderer suite on A's tree.</li></ol> | <ol><li>Old src + new tests: **201/201**. This proves D-32 is behaviour-neutral and that (z12) is a pin.</li><li>(i2) fails (record the message); the other 49 pass.</li><li>A's tree: **201/201**, 10 files.</li></ol> |
| R23-3 mutations | In throwaway copies of A's tree, run the named test file once per mutant:<ul><li>**M7:** in `FileList.tsx`, `anchorPathRef.current = file.path;` → `if (!e.shiftKey) anchorPathRef.current = file.path;`.</li><li>**MI-1…MI-5:** one `beforeEach` line at a time reverted to `mockClear` (`writeMetadataBatch`, `readMetadataBatch`, `writeMetadata`, `readMetadata`, `scanFolder`).</li><li>**MS-1:** `handleSave` back to its `9d1c97e` snapshot shape: `startEditingMetadata = editingMetadata` (render closure) **and** `editingMetadata` back in the deps array. Both changes are needed: without the deps entry the callback would capture a stale `editingMetadata`, which is a different, wrong mutant. The casts stay removed.</li></ul> | <ul><li>M7 killed by (z12) (`['dx.wav']`).</li><li>Each MI-n killed by (i2).</li><li>MS-1 is the **planned equivalent**: it survives (the same evidence as R23-2 step 1, without the casts). Record the result. If it is killed, report the test and B re-plans; do not treat that as proof that A's change is wrong without reading the diff.</li><li>Any other survivor is a FAIL unless C shows it is equivalent.</li></ul> |
| R23-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `9d1c97e`. A `MetadataPanel.tsx` warning or any new rule/file is a FAIL.</li><li>Typecheck 0.</li><li>Renderer **198 + 3 = 201** (exact count, 10 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R23-5 real app | Launch the built app with Playwright `_electron` under `xvfb-run` with `--no-sandbox`. Drive the UI only; the folder dialog may be stubbed. Copy `tests/fixtures/sample.wav` into a temp folder as `a.wav`, `b.wav`, `c.wav`.<ol><li>Click `a.wav`, set Category `R23A` and Comment `R23Single`, click `Save Tags`, and wait for `Tags saved`.</li><li>Click `b.wav`, Shift-click `c.wav` (`2 files selected`), set Category `R23Batch`, click `Save to 2 files`, and wait for `Tags saved to 2 files`.</li><li>**D-30 replay with the snapshot change** (C's R21 delay harness, a 3000 ms write delay through `-r`, outside the repository): click `a.wav`, set Category `R23Delay`, click `Save Tags`, and type Comment `R23Typed` before the toast. After `Tags saved`, the Comment field still shows `R23Typed` and Save is enabled. Click Save again and wait for `Tags saved`.</li><li>**Schema re-read (`handleSchemaChanged`, casts removed):** with `a.wav` selected and no unsaved edits, open the schema editor, add a custom Text field (for example key `r23note`), and save the schema. The form still shows Category `R23Delay` and Comment `R23Typed` for `a.wav`, with no `Failed to read` toast. Then select `b.wav`: the form shows Category `R23Batch`. Removing the custom field afterwards is optional.</li><li>Read every file with `music-metadata` (RIFF INFO under the `exif:` namespace) and with `ffprobe -show_entries format_tags -of json`.</li></ol>Take a screenshot after each step. | All of these hold:<ul><li>(1) a: ICAT `R23A`, comment `R23Single`.</li><li>(2) b and c: ICAT `R23Batch`, and their comment is unchanged.</li><li>(3)+(5) a: ICAT `R23Delay`, comment `R23Typed`. Both readers must agree on every field.</li><li>(4) after the schema save, the form keeps a's values and then shows b's values. If the schema editor cannot add a field in the cloud UI, report it as BLOCKED with the reason; it is not a PASS.</li><li>`pageErrors` is empty.</li><li>Artists are record only (TM-B08).</li><li>No red reference is needed: nothing user-visible changes. If any step differs from `9d1c97e` behaviour, run the same step on a `9d1c97e` build and report both.</li></ul> |
| R23-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md` and the README row against A's tree and against `feature-status.md` D-29/D-30/D-31. | <ul><li>Georgian with English technical terms.</li><li>All 8 entries are present with every listed ID.</li><li>Each entry has severity, `file:line` that points at the described code in A's tree, reproduction steps, D-ID, and a pinning test name that exists (grep it) or `ტესტი არ არის`.</li><li>Status follows this task (entries 4–7 are Saba questions; 1–3 and 8 are known limits).</li><li>No statement contradicts D-29, D-30 or D-31.</li><li>The README table has one new row.</li></ul> |

## What could break (C re-checks)
- **Save flows D-21/D-22/D-24/D-28/D-29/D-30:** all 50 batch-save tests stay green on both the old and the new src (R23-2). R23-5 step 3 covers D-30 in the real app.
- **Schema change re-read (`handleSchemaChanged`):** two casts are removed there. Both are identity casts: `accumulated` is already declared `Record<string, WavMetadata>`. **No component test renders this path**; `schema-editor.test.ts` tests the editor, not MetadataPanel's re-read. That is why R23-5 step 4 checks it in the real app.
- **Other test files that use the `window.api` mocks:** each test file has its own module state, and `mockReset` is used in the batch-save file only. The full renderer count of 201 must hold.
- **FileList:** the src is frozen. (z1)–(z11) stay green; (z12) is additions only.
- **Biome:** a multi-line deps array is a formatter error; removing `editingMetadata` from the deps must not add a `useExhaustiveDependencies` warning.

## What realVerified means here
- R23-1…R23-4 and R23-6 are real local checks.
- R23-5 is the real-app proof. The saved values are checked by independent readers, including the D-30 path that the snapshot change touches.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
- After this round, every remaining item waits on Saba's question batch (`b-round-22.md` §5) or on root's Actions link. Round 24 is likely **BLOCKED** on Saba unless an answer arrives or C finds a bug. B does not invent rounds to avoid that.
