# CURRENT TASK — Round 24: TM-B27 — MetadataPanel schema re-read (D-33): self-contained mock-isolation test, save re-read with the current schema, failed schema re-read keeps store entries, schema-change component tests

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 23 result:** C PASS, realVerified=true (R23-1…R23-6), bugs 0.
  - Old src + new tests 201/201 (D-32 is behaviour-neutral). (i2) is red on `mockClear` (1/49). M7 and MI-1…5 were killed. MS-1 is the planned equivalent and survived.
  - Gate 201/93/7, Biome 8. Real app: single, batch, D-30 delay replay and schema add all worked; ffprobe and music-metadata agree.
  - Root published `59c26d6` (review COMMIT OK). TM-B26 and D-32 are done.
- **No critical or high bug is open.** C found no bug. This round takes three low, related defects in one place (`MetadataPanel` save/schema re-read). None of them needs a Saba decision:
  1. **RR-R23-01 (root review):** the A-R21-04 pin (i2) only checks something if (i1) runs right before it. Run alone (`-t "i2"`) or shuffled, it passes and checks nothing. The fix is a module-private reset helper plus one self-contained test. The reviewer's other option, "a comment in docs", is not used: CLAUDE.md rule 1 forbids code comments, and a docs note would not fix the test.
  2. **A-R21-03** (docs/bugs/001 entry 3, recorded in R23 as a known limit): a schema saved while a save is pending is overwritten by the save's re-read, which uses the fields captured at click time. The new field is missing from the store entry and from the form. B reproduced it: (s4)/(s5) fail on `59c26d6` with `expected undefined to be 'fromfile'`. The correct result is unambiguous (the form shows the current schema), so this is a fix, not a product choice. Root's architecture note RR-R23-04 proposes exactly this ("re-read `fields` from `useSchemaStore.getState()` at re-read time"); D-33 part 1.
  3. **B-R23-01 (new, B experiment):** when a chunk read in `handleSchemaChanged` rejects, those files are dropped from the metadata map. The list then shows them untagged and the sync effect empties the selected file's form: (s3) on `59c26d6` gives `expected '' to be 'ACat'`. Files on disk are unchanged. D-33 part 2 keeps the current entry, the same rule as D-22 for batch saves.
  - **C-R23-01:** `handleSchemaChanged` has no component test. The tests of items 2 and 3 render that path through the real `SchemaEditor`.
- **Reference-first:** exempt. This is a fix and test round with no new UX, and the toasts and layout are unchanged.

### B's experiments (a `/tmp` copy of `59c26d6`; the repository was not touched)
Files: `b-round-23-exp/` (`metadata-panel-schema-change.exp.test.ts.txt`, `metadata-panel-d33.exp.diff.txt`, `batch-save-i3.exp.diff.txt`). They are for orientation only and not prescriptive. The experiment file uses its own formatting and names; A writes the test to this task's spec.
- **Schema-change tests on old src:**
  - (s1) passes.
  - (s4) and (s5) fail: `expected undefined to be 'fromfile'`.
  - (s3) fails: `expected '' to be 'ACat'` (or, with the store assertion first, the map is `{}`).
- **D-33 src** (+6 lines: two re-read arguments, a kept-entry loop in the catch): all pass. Biome 0 errors and 8 warnings (same list).
- **Final composition**, the same as this task's: the experiment file with (s1)–(s5), including (s2), the (s1) call assertions and the (s4) write/read schema assertions, plus the helper/(i3) batch-save file with 49 tests.
  - D-33 src: renderer **205/205** (11 files).
  - `59c26d6` src: **202 passed / 3 failed**, exactly (s3), (s4), (s5).
  - `tsc --noEmit -p tsconfig.test.json` 0 and `-p tsconfig.web.json` 0.
- **Helper + (i3):**
  - The batch-save file passes 49/49, and (i3) alone passes: `-t "i3"` → 1 passed, 48 skipped.
  - With the helper's five lines on `mockClear`, (i3) alone fails: `promise rejected "Error: leaked" instead of resolving`.
  - If `beforeEach` stops calling the helper, 24 existing tests fail, so this mutant is not a survivor.
- **Code reading (main):** `writeTagsToFile` (`src/main/ipc/metadata.ts:159-210`) iterates only the given schema and skips `undefined`. A write with a schema that lacks Title therefore leaves the title untouched.

## Baseline
- HEAD `59c26d6a3c6d4ca0b73e9fa78d822a5bac427d16`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `59c26d6` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to the baseline): everything not in the ownership table, in particular:
  - `src/renderer/src/components/schema/SchemaEditor.tsx`, every store (`src/renderer/src/stores/**`), `FileList.tsx`, `App.tsx`, `FolderBrowser.tsx` and every other component;
  - `src/renderer/src/lib/**`, `src/renderer/src/types/**`, `src/main/**`, `src/shared/**`;
  - every test except the two owned files, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/components/file-list.test.ts`, `tests/renderer/components/schema-editor.test.ts`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**` except the two owned docs files;
  - `.claude/**` except the one owned primitive line;
  - `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** No `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, and no script that writes repository files. The only exception is gitignored build and test output from npm commands. Run red checks and mutants in a copy outside the repository; never use `git stash`.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `STATE_MANAGEMENT.md` and `GEORGIAN_DOCS.md`. In `a-round-24.md`, record when you read each one and whether the read-primitives hook fired.
- Order (test-on-bugfix):
  1. Write the tests (part A and part B) and run them against the **unchanged** src (red log).
  2. Make the D-33 src change (green log).
  3. Update the docs and the primitive line (part D).
  4. Run the final gate.

## Scope

### Part A — RR-R23-01: self-contained mock isolation (`tests/renderer/components/metadata-panel-batch-save.test.ts`)
1. **Move the five `window.api` reset lines** of the top-level `beforeEach` into a new module-private function, `function resetWindowApiMocks(): void { … }`, placed directly above the `beforeEach`.
   - The five lines move unchanged (same order, `mockReset()` and the same chained defaults).
   - `beforeEach` becomes `resetAllStores();` followed by `resetWindowApiMocks();`.
   - The helper is not exported.
2. **Replace** the whole `describe("mock isolation (A-R21-04)", ...)` block ((i1) and (i2)) with `describe("mock isolation (A-R21-04, RR-R23-01)", ...)`, still at the end of the file. It contains one test:
   - **(i3)** "resetWindowApiMocks drops once-values queued on the five window.api mocks" (async).
   - It queues the same five once-values as today's (i1) (`writeMetadataBatch` reject `leaked`, `readMetadataBatch` `{ "/leaked.wav": { title: "leaked" } }`, `writeMetadata` reject, `readMetadata` `{ title: "leaked" }`, `scanFolder` reject).
   - It then calls `resetWindowApiMocks()` and makes today's five (i2) assertions on the same signatures and defaults.
3. **No other line changes.** Keep the file's double-quote style and add no comment.
4. **Proof that the old pin was vacuous** (log only, in a copy of `59c26d6`): with the five `beforeEach` lines on `mockClear`, `-t "i2"` alone **passes**. With A's file and the helper's five lines on `mockClear`, `-t "i3"` alone **fails**; record the message.

### Part B — tests for `handleSchemaChanged` and D-33 (`tests/renderer/components/metadata-panel-schema-change.test.ts`, new)
- **Setup:**
  - Same file header pattern as `metadata-panel-batch-save.test.ts`: imports, the `vi.hoisted` window workaround (A-R3-01), and `resetAllStores()` in `beforeEach`/`afterEach` with `cleanup()`.
  - `beforeEach` resets `writeMetadataBatch`, `readMetadataBatch`, `writeMetadata`, `readMetadata`, `scanFolder` and `saveSchema` with `mockReset()` and their `setup.ts` defaults.
  - Double quotes, semicolons, no comments, no `any`/`@ts-ignore`/`as unknown as` outside the copied `vi.hoisted` block.
- **Seed:**
  - Files `a.wav` and `b.wav` under `/music`.
  - Store metadata `SEED_A = { title: "A-title", category: "ACat", comment: "" }` and `SEED_B` (`BCat`).
  - The schema is `STANDARD_FIELDS` (from `resetAllStores`).
- **Drive the real `SchemaEditor`.** Do not mock it.
  - Click the `Customize Fields` button (`getByTitle`).
  - Type `R24note` into the `Field name (e.g. Client)` input.
  - Click `Add Field`, then click `Done` inside `act(async …)`.
  - The new key is `r24note`.
- **Read mocks depend on the schema argument**, as main does: `readMetadataBatch` and `readMetadata` return `r24note: "fromfile"` for `a.wav` only when the `fields` argument contains key `r24note`.
- **Deferred writes:** use a once-promise released inside `act`, the same pattern as `deferSingleWrite` / `deferBatchWrite`.

| Test | Setup → action | Must hold | On `59c26d6` |
|---|---|---|---|
| **(s1)** single, no save | select a → add `R24note` → Done | <ul><li>form `R24note` = `fromfile`, Category `ACat`</li><li>store a has `r24note: "fromfile"`</li><li>`readMetadataBatch` called once with `[a, b]` and a schema containing `r24note`</li></ul> | passes (pin) |
| **(s2)** batch selection, no save | select a+b → add → Done | <ul><li>`editingMetadata` is `{}`</li><li>store a has `r24note: "fromfile"`</li><li>store b equals `SEED_B`</li></ul> | passes (pin) |
| **(s3)** schema re-read rejects (B-R23-01) | select a; `readMetadataBatch` rejects → add → Done | <ul><li>toast `Failed to read 2 files`</li><li>store metadata equals `{ a: SEED_A, b: SEED_B }`</li><li>form Category `ACat`</li></ul> | **fails** |
| **(s4)** single save pending + schema change (A-R21-03) | select a; type Category `R24Cat`; Save Tags (write deferred) → add → Done → release | <ul><li>toast `Tags saved`</li><li>form Category `R24Cat` and `R24note` = `fromfile`</li><li>store a has `r24note: "fromfile"`</li><li>the last `readMetadata` call's schema contains `r24note`</li><li>`writeMetadata` was called with the click-time schema (no `r24note`)</li></ul> | **fails** (`undefined` vs `fromfile`) |
| **(s5)** batch save pending + schema change (A-R21-03) | select a+b; type Category `R24Cat`; Save to 2 files (write deferred, result 2/0) → add → Done → release | <ul><li>toast `Tags saved to 2 files`</li><li>store a has `r24note: "fromfile"`</li><li>the last `readMetadataBatch` call's schema contains `r24note`</li></ul> | **fails** |

- **Red:** on the unchanged src, exactly (s3), (s4) and (s5) fail; (s1), (s2) and (i3) pass. Record each first failure message.
- If a different set fails, or a pin fails, stop and report. Do not change an expectation to fit the code.

### Part C — D-33 (`src/renderer/src/components/metadata-editor/MetadataPanel.tsx`)
1. **`handleSave` re-read:** the single `window.api.readMetadata(path, …)` and the batch `window.api.readMetadataBatch(paths, …)` pass `useSchemaStore.getState().fields`, read at the moment of the call.
   - `writeMetadata` and `writeMetadataBatch` keep `fields` (the click-time schema).
   - `fields` stays in the deps array (the write uses it). The deps array stays on one line.
2. **`handleSchemaChanged`:** for each path in a chunk whose `readMetadataBatch` rejected, put that path's current store entry (`useFileStore.getState().metadata[path]`, if it exists) into `accumulated`.
   - Paths without an entry stay absent.
   - The failures count, the toast text, the chunk size and the success path are unchanged.
3. **Rules:**
   - No new export, no comment, no `any` / `@ts-ignore` / new `as`. Single quotes and semicolons.
   - `grep -c " as " MetadataPanel.tsx` stays **2**.
   - D-21, D-22, D-24, D-28, D-29, D-30, D-32, `skipSyncRef` and all toasts are unchanged.
   - Biome: 0 errors and the same 8 warnings. No new `useExhaustiveDependencies` warning.

### Part D — docs and primitive
- **`docs/bugs/001-save-and-selection-known-limits.md`** (Georgian with English technical terms, same entry format):
  - **"გადაწყვეტილებები მოკლედ":** add a **D-33** bullet (both parts).
  - **Entry 3 (A-R21-03):**
    - status `გასწორდა (D-33, round 24)`;
    - add a short "after D-33" result line;
    - `file:line` re-pointed to the new re-read lines;
    - tests `metadata-panel-schema-change.test.ts` — the exact names of (s4) and (s5).
    - Entry 3 is not deleted.
  - **Every `MetadataPanel.tsx` line reference** in entries 1–4 points at the described code in A's final tree (RR-R23-02). The `FileList.tsx` and `file-store.ts` references stay as they are; those files are frozen.
  - **New entry 9 — B-R23-02**, severity low, status `ცნობილი შეზღუდვა`, `ტესტი არ არის`. It describes the reverse order:
    - a `handleSchemaChanged` read started before a pending write finished, and resolving after the save's re-read, writes the pre-write values into the store and the form (isDirty false) until the next read;
    - the file on disk is correct;
    - D-33 does not cover this order.
  - **New entry 10 — B-R23-03**, severity low, status `Saba-ს კითხვა`, `ტესტი არ არის`:
    - saving the schema (`Done`) with unsaved edits replaces them silently (`setEditingMetadata` clears `modifiedFields`/`isDirty`), and no `Unsaved changes were discarded` toast appears;
    - the options to list: toast, a D-30-like merge, or blocking `Customize Fields` while dirty.
  - The header's status line may be adjusted so that it stays true; it must still say this is a known-limits list.
- **`docs/bugs/README.md`:** update only the status cell of row `001` (10 entries: 1 fixed, 5 Saba questions).
- **`.claude/primitives/STATE_MANAGEMENT.md`:** add **one line** inside the `### Save flow` code block, directly after the `Typed during save (D-30)` line, for example: `Schema at re-read (D-33): post-save re-read uses useSchemaStore.getState().fields (write keeps the click-time fields); handleSchemaChanged keeps the store entry of paths whose chunk read rejected`. No other change in `.claude/**`. Use the Edit tool (standing permission, path (b)).

### Not in this round
- B-R23-02 (no fix: a read token or locking the schema editor is UX → Saba).
- B-R23-03 (Saba question).
- Moving `handleSave` into a hook or store action (RR-R23-04 signal).
- `selectedFiles` from `getState()` (A-R23-01 signal).
- Any `SchemaEditor` change.

### `a-round-24.md` (Georgian) contains
- the red logs:
  - parts A and B on the unchanged src;
  - the `-t "i2"` vacuity proof on a `59c26d6` copy;
  - `-t "i3"` with the helper on `mockClear`;
- the green logs and the diff;
- `grep -c " as "`;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last edit;
- the Biome warning list;
- a `qa-engineer` read-only regression check (bugfix rule);
- a `code-reviewer` run (**required**: 3+ files);
- the process statement.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | `resetWindowApiMocks()` helper; `beforeEach` calls it; (i1)/(i2) describe → (i3) describe (part A) |
| `tests/renderer/components/metadata-panel-schema-change.test.ts` (new) | (s1)–(s5) (part B) |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-33: two re-read arguments, failed-chunk kept entries (part C) |
| `docs/bugs/001-save-and-selection-known-limits.md` | D-33 bullet, entry 3 fixed, line references, entries 9 and 10 (part D) |
| `docs/bugs/README.md` | row 001 status cell (part D) |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-33 line in `### Save flow` (part D) |

Logs go to `a-round-24/` (A) and `c-round-24/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R24-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat <baseline>`, and `git diff --quiet <baseline> -- . ':!<5 owned modified paths>'`. Read the diff, A's result JSON and A's transcript if it is available. | All of these hold:<ul><li>5 `M` paths plus exactly one untracked `tests/renderer/components/metadata-panel-schema-change.test.ts`.</li><li>In the batch-save file, the only removed lines are:<ul><li>the five reset lines (they reappear unchanged inside `resetWindowApiMocks`);</li><li>the old `describe("mock isolation (A-R21-04)"` block.</li></ul></li><li>(i3) is the only test in the new last describe.</li><li>The src diff has only D-33: no comment, no `any`/`@ts-ignore`/new `as`, no new export, `grep -c " as "` = 2, and the write calls still pass `fields`.</li><li>`STATE_MANAGEMENT.md` gains exactly one line.</li><li>README: only the row-001 status cell changes.</li><li>`permission_denials` is empty, and the repo writes were made with Edit/Write. Say whether the transcript was available.</li></ul> |
| R24-2 red/green | Use `git worktree add --detach /tmp/c-r24-old <baseline>` with `node_modules` symlinked; never use `git stash`.<ol><li>Copy A's two test files into the old worktree and run the renderer suite there.</li><li>In the old worktree with the **old** batch-save file, set the five `beforeEach` lines to `mockClear` and run `-t "i2"` alone.</li><li>Run the full renderer suite on A's tree.</li></ol> | <ol><li>Old src + new tests: exactly (s3), (s4) and (s5) fail, with symptom messages (`undefined` vs `fromfile`, `ACat` or the emptied map). Everything else passes: 202 passed / 3 failed.</li><li>(i2) alone **passes** on `mockClear`, which proves RR-R23-01.</li><li>A's tree: **205/205**, 11 files.</li></ol> |
| R24-3 mutations | In throwaway copies of A's tree, run the named file once per mutant:<ul><li>**MR-1:** single re-read back to `fields`.</li><li>**MR-2:** batch re-read back to `fields`.</li><li>**MF-1:** the failed-chunk kept-entry code removed.</li><li>**MI-1…MI-5:** one helper line at a time on `mockClear`; run `-t "i3"` **alone**.</li><li>**MB:** `beforeEach` no longer calls `resetWindowApiMocks()`.</li></ul> | <ul><li>MR-1 killed by (s4).</li><li>MR-2 killed by (s5).</li><li>MF-1 killed by (s3).</li><li>Each MI-n killed by (i3) run alone.</li><li>MB killed by existing batch-save tests (B saw 24 fail).</li><li>Any survivor is a FAIL unless C shows it is equivalent.</li></ul> |
| R24-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `59c26d6`.</li><li>Typecheck 0.</li><li>Renderer **205** (201 − 2 + 1 + 5, 11 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R24-5 real app | Launch the built app with Playwright `_electron` under `xvfb-run` with `--no-sandbox`, with an isolated `XDG_CONFIG_HOME`. Drive the UI only; the folder dialog may be stubbed. Use C's `-r` harness outside the repository, which adds a 3000 ms delay to the write IPC handlers and can reject read-batch calls. Copy `tests/fixtures/sample.wav` as `a.wav`, `b.wav` and `c.wav`.<ol><li>Click `a.wav`, set Title `R24T`, click `Save Tags`, and wait for `Tags saved`.</li><li>Open `Customize Fields`, hide the standard field Title (`Hide standard field`), and click `Done`.</li><li>**A-R21-03:** with `a.wav` selected, set Category `R24Delay` and click `Save Tags`. During the write, open `Customize Fields`, click `+ Title` under Hidden Standard Fields, and click `Done`. Wait for `Tags saved`. The form must show Title `R24T` and Category `R24Delay`. Click `b.wav` and then `a.wav`: Title `R24T` again.</li><li>**B-R23-01:** with `a.wav` selected and no unsaved edits, arm the harness so that a read-batch call whose schema contains a custom key `r24note` rejects. Add the custom Text field `R24note` and click `Done`. Expect the toast `Failed to read 3 files`. The form still shows a's Title/Category, and the rows of a, b and c keep the tagged state they had before.</li><li>Read every file with `music-metadata` (RIFF INFO under `exif:`) and with `ffprobe -show_entries format_tags -of json`.</li></ol>Take a screenshot after each step. **Red reference:** run steps 1–4 on a `59c26d6` build. | All of these hold:<ul><li>(3) A's build: the form shows Title `R24T` after the save and after b → a. The `59c26d6` build: Title is empty in both places.</li><li>(4) A's build keeps the form and the row states. The `59c26d6` build empties the form, and the rows become untagged.</li><li>(5) a: INAM/title `R24T` and ICAT `R24Delay` in both readers, and the readers agree field by field. If the title is erased on **both** builds, report it as a new bug (pre-existing, not a FAIL of A's work). If it is erased only on A's build, that is a FAIL.</li><li>`pageErrors` is empty.</li><li>Artists are record only (TM-B08).</li><li>If the harness cannot reject read-batch calls, report step 4 as BLOCKED with the reason. It is not a PASS, and (s3) alone does not replace it.</li></ul> |
| R24-6 docs + primitive | Read `docs/bugs/001-…md`, the README row and the `STATE_MANAGEMENT.md` line against A's tree and `feature-status.md` D-33. | <ul><li>Georgian with English technical terms.</li><li>D-33 bullet present.</li><li>Entry 3 is marked fixed and names (s4)/(s5) as they exist (grep).</li><li>Every `MetadataPanel.tsx:` reference points at the described code (C greps each one).</li><li>Entries 9 and 10 have all the fields, with statuses known limit and Saba question.</li><li>Entries 1, 2 and 4–8 are otherwise unchanged.</li><li>README: one cell changed.</li><li>The primitive line matches D-33.</li></ul> |

## What could break (C re-checks)
- **Save flows D-21/D-22/D-24/D-28/D-29/D-30:** every one of the 49 batch-save tests stays green. The re-read schema equals `fields` whenever the schema did not change during the save, which is the case in every existing test.
- **Write payload:** the write must still use the click-time schema. Main skips `undefined` values and fields that are not in the schema. C checks in step 5 that the title survives a write whose schema lacked Title.
- **`handleSchemaChanged` success path:** (s1)/(s2) and R23-5 step 4 behaviour (the form keeps its values, no toast).
- **The sync effect after `setMetadata`:** with kept entries, an unchanged selection shows the kept values (s3).
- **Other test files:** `schema-editor.test.ts` and `file-list.test.ts` are frozen and must stay green within the 205.

## What realVerified means here
- R24-1…R24-4 and R24-6 are real local checks.
- R24-5 is the real-app proof. The values are checked by independent readers, with a red reference on the `59c26d6` build.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
- After this round, every open item waits on Saba's question batch (`b-round-23.md` §5, now including B-R23-03) or on root's Actions link. Round 25 is likely **BLOCKED** unless an answer arrives or C or the review finds a bug.
