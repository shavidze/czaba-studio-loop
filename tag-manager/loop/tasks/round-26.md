# CURRENT TASK — Round 26: TM-B29 — stale schema re-read guard (D-34): a chunk read issued before a path's write resolved no longer overwrites the save; `docs/bugs/001` entry 9 fixed, entry 3/10 corrections

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 25 result:** C PASS R25-1…R25-6, realVerified=true, no FAIL. Root published `c2c19a7` (review COMMIT OK). TM-B28 is done. C and A each left two low docs findings (C-R25-03 = A-R25-02, C-R25-04 = A-R25-03); they ride on this round's docs edit.
- **No critical or high bug is open.** The next scoped item is the B-R23-02 / RR-R24-02 fix that round 25 named as the round 26 candidate "only after B reproduces it red". B did (B-R25-02):
  - Evidence (loop folder): `b-round-25-exp-repro.test.ts.txt`, `b-round-25-exp-prototype.diff.txt`, `b-round-25-exp-mutants.log`, `b-round-25-exp-mut.py.txt`.
  - On the `c2c19a7` src, five of seven component tests fail: batch, single + typing during the save, stale chunk 1 with the save landing between chunks, a rejected chunk 1 snapshot with the save landing between chunks, and a partial batch failure. Two pins pass.
  - A store-based prototype passes all 215 renderer tests (208 + 7) with Biome 0 errors / 8 warnings and `tsc` 0. Nine mutants are each killed.
  - The prototype is evidence that the rule works, not code to copy. A writes its own implementation within the rule below.
- **Severity raised low → medium.** After the stale read lands, the single-selection form shows the old values with `isDirty` false. A later save from that form writes the old values back to disk without warning, which is a data-loss path. Batch writes yield every 5 files in main (`metadata.ts` WRITE_METADATA_BATCH), so the batch and between-chunks orders are reachable in production. The single write in main is synchronous, so the single order needs a delay to reproduce, but the same guard covers it.
- **Pure fix, so the reference-first rule does not apply.** There is no UX change: the schema editor is not locked (that stays a Saba option in entry 9's history).

## Baseline
- HEAD must be `c2c19a72bed45f561eae1c9dbca9cc79567aaf41` and the working tree **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `c2c19a7` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to the baseline): everything not in the ownership table, in particular:
  - every other `src/**` file, including `src/main/**`, `FolderBrowser.tsx`, `App.tsx`, `SchemaEditor.tsx`, `FileList.tsx`, `lib/utils.ts`, `metadata-store.ts`, `schema-store.ts`, `types/**`;
  - `tests/renderer/setup.ts`, `tests/renderer/helpers/window-api-mocks.ts`;
  - `tests/renderer/components/metadata-panel-batch-save.test.ts` and every other test file not in the table, `tests/main/**`, `tests/e2e/**`, `tests/fixtures/**`;
  - `.claude/**` except `.claude/primitives/STATE_MANAGEMENT.md`;
  - `docs/**` except the two files in the table;
  - `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule (A-R17-02, still open)
- **Write to the repository only with the Edit or Write tool.** Do not use `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, or any script that writes repository files. The only exception is gitignored build and test output from npm commands. Run mutants in a copy outside the repository, and never use `git stash`.
- Before the first edit, read `TESTING.md`, `STATE_MANAGEMENT.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `prompts/new-store.md` and `GEORGIAN_DOCS.md`. In `a-round-26.md`, record when you read each one and whether the read-primitives hook fired.
- Order (test-on-bugfix):
  1. Write the tests (part B) on the unchanged src.
  2. Run them on the unchanged src and record the red/green list below.
  3. Implement part A.
  4. Run the renderer suite (216 green).
  5. Run the mutants in `/tmp` copies.
  6. Update the docs (part C).
  7. Run the final gate.

## Scope

### Part A — D-34 guard (renderer only)
1. **`src/renderer/src/stores/file-store.ts`:**
   - Add to `FileState`: `writeGeneration: number` (initial `0`), `pathWriteGenerations: Record<string, number>` (initial `{}`), and the action `markPathsWritten: (paths: string[]) => void`.
   - `markPathsWritten(paths)` increments `writeGeneration` by exactly 1 per call and sets `pathWriteGenerations[path]` to the new value for each given path. Other paths keep their value. It returns new objects (no mutation of the previous state).
   - Nothing else in the store changes. In particular `setMetadata`, `updateFileMetadata`, `setFiles` and folder changes do not touch the generations; they are monotonic for the app's lifetime.
2. **`src/renderer/src/components/metadata-editor/MetadataPanel.tsx`, `handleSave`:**
   - **single:** call `useFileStore.getState().markPathsWritten([path])` right after `await window.api.writeMetadata(...)` resolves, before `refreshSavedFileStats`.
   - **batch:** call it right after `writeMetadataBatch` resolves, with the paths that are **not** in `result.failed`.
   - A rejected write marks nothing. Call through `useFileStore.getState()` (or another way) that adds **no** `useExhaustiveDependencies` warning: Biome must stay at the same 8 warnings.
3. **`MetadataPanel.tsx`, `handleSchemaChanged`:**
   - For each chunk, read `useFileStore.getState().writeGeneration` **immediately before** that chunk's `readMetadataBatch` call. Remember it for every path in that chunk's result.
   - The comparison happens **once, when the store is written after the last chunk**, not when each chunk resolves. A write can resolve after the chunk that read the stale value has already resolved; B's first prototype compared at chunk-resolve time and failed (s13).
   - At that point a path whose `pathWriteGenerations[path]` is greater than its remembered generation is **superseded**.
   - **Kept** (its chunk rejected, D-33 part 2) and superseded paths both get the store entry current **at store-write time**, not a snapshot taken when the chunk rejected. A kept or superseded path with no store entry at that moment stays absent (D-33 part 2, (s8)).
   - Kept and superseded paths never reset the form (D-33 part 3, extended): for a single selection, `setEditingMetadata` runs only when the selected path's entry was applied from a chunk result.
   - These stay as they are: the batch-selection `setEditingMetadata({})`, the `Failed to read N files` toast (counts only rejected chunks' paths), `CHUNK_SIZE` 50 and the write schema.
4. **Style:**
   - no comments, semicolons, single quotes in `src/`;
   - no `any`, `@ts-ignore` or new `as`: `grep -c " as " MetadataPanel.tsx` stays **2**;
   - new store fields and action follow `AGENT_DISCOVERABLE_CODE.md` naming (grep-able, verb-first action).

### Part B — tests (failing first)
1. **`tests/renderer/components/metadata-panel-schema-change.test.ts`, additions only:**
   - Add a new `describe("MetadataPanel schema re-read ignores reads superseded by a write (B-R23-02, RR-R24-02, D-34)", …)` after the existing one.
   - Helpers and constants needed by these tests may be added (for example a deferred `readMetadataBatch` once-value, `FRESH_A`/`STALE_A`, 50 extra file entries for a two-chunk folder).
   - Existing lines, (s1)–(s8) and the existing helpers stay byte-identical. The file keeps its double-quote style.
   - **Every test below must hold exactly as described.** The setups match B's experiment file, which A may read.

   | Test (exact name prefix) | Setup → action | Must hold | On `c2c19a7` src |
   |---|---|---|---|
   | `(s9) B-R23-02: batch save, schema re-read issued before the write resolves lands after the save's re-read` | A+B selected; batch write deferred (all succeeded); schema `readMetadataBatch` deferred with pre-write values (A `ACat` + note); the save's re-read returns A/B with `R24Cat` + note. Save → add field + Done → release write (`Tags saved to 2 files`) → release schema read | store A equals the save's re-read value (category `R24Cat`, note present); store B category `R24Cat` | **red** |
   | `(s10) B-R23-02: single save, a stale schema re-read keeps the saved values and the title typed during the save` | A selected; single write deferred; schema read deferred stale; `readMetadata` returns `R24Cat` + note. Save → type Title `TypedDuring` → add field + Done → release write (`Tags saved`) → release schema read | store A equals the save's re-read; form Category `R24Cat`; form Title `TypedDuring`; `isDirty` true | **red** |
   | `(s11) D-34 pin: a schema re-read issued after the write resolved is applied` | A selected; save completes (no defer, re-read `R24Cat` without note); then the schema read returns `R24Cat` + note → add field + Done | form `R24note` shows the file value; store A equals the schema read's value | green (pin) |
   | `(s12) D-34 pin: a chunk issued after the write resolved is applied even when the save's re-read failed` | 51 files, A **last** (chunk 2); single write deferred; chunk 1 deferred; chunk 2 returns A `R24Cat` + note; `readMetadata` rejects. Save → Done → release write (toast `Tags saved, but reloading failed. Rescan to refresh.`) → release chunk 1 | store A equals chunk 2's value | green (pin) |
   | `(s13) RR-R24-02: a stale chunk read before the write is not applied when the save lands between chunks` | 51 files, A **first** (chunk 1); single write deferred; chunk 1 resolves at once with A stale; chunk 2 deferred; `readMetadata` returns `R24Cat` + note. Save → Done → release write (`Tags saved`) → release chunk 2 | store A equals the save's re-read; form Category `R24Cat` | **red** |
   | `(s14) RR-R24-02: a rejected chunk keeps the entry current when the store is written, not the one at reject time` | as (s13), but chunk 1 rejects at once | toast `Failed to read 50 files`; store A equals the save's re-read | **red** |
   | `(s15) D-34: a path whose batch write failed is not superseded` | A+B selected; batch write deferred with `{ succeeded: 1, failed: [{ path: B }] }`; schema read deferred (A stale, B `SEED_B` + note); save re-read returns A fresh. Save → Done → release write (`1 saved, 1 failed`) → release schema read | store A equals the save's re-read; store B equals `SEED_B` + note | **red** |

   - Note on (s15): on the old src the failure comes from A. Mutant MG-6 is what proves the B half.
   - Mapping to B's experiment file: (r1)→(s9), (r2)→(s10), (r3)→(s11), (r4)→(s12), (r5)→(s13), (r6)→(s14), (r7)→(s15).
     - B's (r*) tests typecheck with `tsc --noEmit -p tsconfig.test.json` (exit 0 in B's copy).
     - The old-src count for (g1) is B's prediction, not an observation.
2. **`tests/renderer/stores/file-store.test.ts`, additions only:**
   - Add one test, `(g1) markPathsWritten bumps writeGeneration once per call and stamps only the given paths`.
   - Two calls, `["/a"]` then `["/b", "/c"]`: `writeGeneration` 2; `pathWriteGenerations` equals `{ "/a": 1, "/b": 2, "/c": 2 }`.
   - On the old src it fails at compile/run time; record this.
3. **`tests/renderer/helpers/reset-stores.ts`:** add `writeGeneration: 0` and `pathWriteGenerations: {}` to the file store reset. No other change.
4. **Expected counts:**
   - Old src + new tests: 216 tests, **6 failed** ((s9) (s10) (s13) (s14) (s15) (g1)), 210 passed.
     - If `tsc`/vitest cannot run (g1) on the old src because the action is missing, record how it fails.
     - If the count differs, stop and explain before implementing.
   - A's tree: **216/216**, 11 files.

### Part C — docs (Georgian with English technical terms, same entry format)
1. **`docs/bugs/001-save-and-selection-known-limits.md`:**
   - **Entry 9 (B-R23-02):**
     - status → `გასწორდა (D-34, TM-B29)`, the same way entry 3 is marked;
     - the test line names (s9), (s10), (s13), (s14) and (s15) by full test name;
     - the decision line says that D-34 is the stale-result guard and the schema editor is not locked;
     - add one sentence: in production the single-save order needs a slow write, while batch and between-chunks orders are reachable.
     - Keep the reproduction steps for history.
   - **Entry 3, step 3 (C-R25-03):**
     - drop "სხვა ფაილზე გადასვლა და დაბრუნება";
     - name the real read paths the D-33 note lists: rescan / folder re-open, the file's save re-read, the next successful schema change.
   - **Entry 10, step 3 (C-R25-04):** state that "the form is not changed and the edits stay" holds for a single selection only. With 2+ files selected, `handleSchemaChanged` empties the form (`setEditingMetadata({})`) even when the read rejects. Status and options are unchanged.
   - **D-33 bullet / header:**
     - the "fixed entries" mention becomes (3) and (9);
     - the D-33 kept-entry sentence says that the store entry is taken when the store is written (D-34).
   - **Line references:** re-point every `MetadataPanel.tsx:` reference to A's tree. Add `file-store.ts:` references where D-34 is described. C greps each one; a wrong number is a FAIL of R26-6.
2. **`docs/bugs/README.md`:** row 001 status cell becomes `ცნობილი შეზღუდვების სია (10 ჩანაწერი; 2 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`. No other change.
3. **`.claude/primitives/STATE_MANAGEMENT.md`:** add one line next to the D-33 line (around line 29), for example `Stale schema re-read (D-34): …`. The line says that writes stamp `pathWriteGenerations` and `handleSchemaChanged` keeps the current store entry for superseded paths and does not reset the form. Use the Edit tool (standing path (b) permission). Nothing else in `.claude/**` changes.

### Not in this round
- **B-R25-01:** Rescan / Open Folder during a pending save (`FolderBrowser.tsx`, `App.tsx` `readMetadataChunked`). Same class, not reproduced yet. It can reuse D-34's generations in a later round, after a red reproduction.
- **B-R23-03** (Saba question), locking the schema editor (UX), and moving `handleSave`/`handleSchemaChanged` into a store action or hook (RR-R23-04, RR-R24-05 signals).
- **C-R25-01** (MBS survivor), linting `tests/` (TM-B06), any `src/main` change.

### `a-round-26.md` (Georgian) contains
- the primitive reads;
- the red log on the unchanged src, with the failing names and first assertion lines;
- the green log;
- the mutant log;
- the diff;
- `grep -c " as "`;
- the full `verifyCommand` plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last edit;
- the Biome warning list;
- a `code-reviewer` run (required: 3+ files) and a `qa-engineer` run (required: this is a bug fix);
- the process statement.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/stores/file-store.ts` | `writeGeneration`, `pathWriteGenerations`, `markPathsWritten` (part A.1) |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | mark after writes; superseded/kept rule in `handleSchemaChanged` (A.2, A.3) |
| `tests/renderer/components/metadata-panel-schema-change.test.ts` | (s9)–(s15), additions only (B.1) |
| `tests/renderer/stores/file-store.test.ts` | (g1), additions only (B.2) |
| `tests/renderer/helpers/reset-stores.ts` | reset the two new fields (B.3) |
| `docs/bugs/001-save-and-selection-known-limits.md` | entries 3, 9, 10, header/D-33 bullet, line references (C.1) |
| `docs/bugs/README.md` | row 001 count (C.2) |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-34 line (C.3) |

Logs go to `a-round-26/` (A) and `c-round-26/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R26-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat c2c19a7`, and `git diff --quiet c2c19a7 -- . ':!<8 owned paths>'`. Read the diff and A's result JSON/transcript (say whether the transcript was available). | All of these hold:<ul><li>Only owned paths are modified, and there are no untracked files.</li><li>The store diff adds only the two fields, their initial values and `markPathsWritten`.</li><li>The test diffs are additions only (plus the two reset lines). (s1)–(s8) and the existing file-store tests are byte-identical.</li><li>`grep -c " as " MetadataPanel.tsx` is 2.</li><li>No comment, `any` or `@ts-ignore` was added.</li><li>The repository writes were made with Edit/Write, and `permission_denials` is empty.</li></ul> |
| R26-2 red → green | In a throwaway copy, put A's test files on the `c2c19a7` src (old `file-store.ts`, `MetadataPanel.tsx`, `reset-stores.ts`). Then run A's tree. Run (s9)–(s15) each alone with `-t`. | <ul><li>Old src: (s9), (s10), (s13), (s14), (s15) and (g1) fail; (s11), (s12) and every other test pass (210/6, or (g1) failing to compile as A recorded).</li><li>A's tree: **216/216**, 11 files.</li><li>Each of (s9)–(s15) passes alone.</li></ul> |
| R26-3 mutations | In copies of A's tree, run the two owned test files once per mutant:<ul><li>**MG-1:** no superseded check, so chunk results are always applied.</li><li>**MG-2:** single save marks before `writeMetadata` instead of after.</li><li>**MG-3:** `>=` instead of `>`.</li><li>**MG-4:** one generation read at the start of `handleSchemaChanged` instead of per chunk.</li><li>**MG-5:** kept entries taken from a reject-time snapshot.</li><li>**MG-6:** batch marks the failed paths too.</li><li>**MG-7:** a superseded selected path still resets the form.</li><li>**MG-8:** single save does not mark.</li><li>**MG-9:** batch save does not mark.</li><li>**MG-10:** superseded check done when each chunk resolves instead of at store-write time.</li><li>**MS-1:** `markPathsWritten` does not increment `writeGeneration`.</li></ul>Adapt each mutant to A's code shape and describe the exact edit. | Every mutant is killed.<ul><li>B's prototype run: MG-1 by (r1)(r2)(r5)(r7); MG-3 by (r3)(r4)(s1)(s2); MG-4 by (r4); MG-5 by (r6); MG-6 by (r7); MG-7 by (r2). Those (r*) tests are now (s9)–(s15).</li><li>MG-10 is expected killed by (s13).</li><li>MS-1 is expected killed by (g1).</li><li>A survivor is a FAIL unless C shows it is equivalent.</li></ul> |
| R26-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c2c19a7`.</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **216**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R26-5 real app, old vs new | Build A's tree and a `c2c19a7` tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and a `-r harness.cjs` like round 24's `c-round-24/harness.cjs`.<br>The harness:<ul><li>delays `meta:write` and `meta:write-batch` by 3 s **before** running the real listener;</li><li>for the first `meta:read-batch` whose schema contains the new key (`r26note`), runs the real listener at once (so it reads the file before the write) and delays the **reply** by 6 s;</li><li>logs every call with timestamps.</li></ul>Copy `tests/fixtures/sample.wav` as `a.wav` and `b.wav`. Drive the UI only; the folder dialog may be stubbed.<ol><li>Click `a.wav`, set Category `R26Cat`, click `Save Tags`.</li><li>During the write: `Customize Fields`, add Text field `R26note`, click `Done`.</li><li>Wait for `Tags saved`, then for the late read (log), and take a screenshot.</li><li>Click `b.wav`, then `a.wav`, and take a screenshot.</li><li>Set Title `R26T2` and `Save Tags` (wait for `Tags saved`).</li><li>Read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and `ffprobe -show_entries format_tags -of json`.</li></ol>Take screenshots after each step. | <ul><li>**A's build:**<ul><li>after step 3 and step 4 the form shows Category `R26Cat`;</li><li>after step 6 both readers show `ICAT=R26Cat` and title `R26T2`, field by field.</li></ul></li><li>**`c2c19a7` build (red):** after the late read the form or the b→a form shows the pre-save Category, and after step 6 `ICAT` is back to its pre-save value (the data-loss path). If the old build does **not** show this, C reports it, explains the timing from the log, and the round is not PASS until B re-plans.</li><li>The harness log shows the schema read started before the write ended and replied after the save's re-read.</li><li>`pageErrors` is empty on both builds.</li><li>Artists are record only (TM-B08).</li></ul> |
| R26-6 docs | Read `docs/bugs/001-…md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` line against A's tree and D-34 in `feature-status.md`. | <ul><li>Georgian with English technical terms.</li><li>Entry 9 is marked fixed (D-34, TM-B29), names (s9), (s10), (s13), (s14) and (s15) exactly (grep), keeps the reproduction history, and states production reachability.</li><li>Entry 3 step 3 no longer says switching files re-reads.</li><li>Entry 10 step 3 limits "edits stay" to a single selection.</li><li>The header lists (3) and (9) as fixed.</li><li>Every `MetadataPanel.tsx:` and `file-store.ts:` reference points at the described code on A's tree (C greps each).</li><li>Entries 1, 2 and 4–8 are unchanged.</li><li>The README row is as specified.</li><li>`STATE_MANAGEMENT.md` diff is one added line.</li></ul> |

## What could break (C re-checks)
- **D-33 (s1)–(s8):** taking kept entries at store-write time instead of at reject time must not change (s3), (s6), (s7) or (s8): no save runs there, so the store is the same at both moments. The prototype kept all of them green.
- **D-21/D-22/D-24/D-28/D-29/D-30 (the 49 batch-save tests and the single-save tests):** `handleSave` only gains a mark call. Its toasts, re-read, `skipSyncRef` and merge behaviour must not change. A mark placed after `refreshSavedFileStats` or after the re-read is wrong (MG-2/MG-8 class).
- **The normal schema change with no pending save** (s1)/(s2) and R26-5's last step: every path's generation is ≤ the chunk's, so all results apply exactly as before.
- **`file-list.test.ts`, the store tests and the sort** read `metadata` only. The new store fields must not appear in `metadata` or change `useFilteredFiles`.
- **Biome hook-deps:** a `useCallback`/ref approach that is missing from a deps array adds a 9th warning. B's first prototype did exactly that. The gate requires 8.

## What realVerified means here
- R26-1…R26-4 and R26-6 are real local checks.
- R26-5 is the real-app check on two builds, with the file read by two independent readers. It is the evidence that the stale overwrite and its data-loss follow-up exist on `c2c19a7` and are gone on A's build.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
- **B-R25-01:** Rescan / Open Folder during a pending save. B first reproduces it red (deferred batch write + rescan); if it is red, the fix reuses `pathWriteGenerations` in `FolderBrowser`/`App`.
- **C-R25-01:** the MBS survivor (a hygiene candidate).
- Everything else waits on Saba's question batch (`b-round-23.md` §5 + B-R23-03) or on root's Actions link.
