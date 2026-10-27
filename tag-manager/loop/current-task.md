# CURRENT TASK — Round 21: TM-B24 — text typed while a save is pending on the same selection must not be lost — D-30

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 20 result:** C PASS, realVerified=true (R20-1…R20-5), 0 bugs.
  - Red on `3006615`: 7 failed / 27 passed, with (x1)–(x6) and A's extra (x11). Green: 34/34. M1–M3 and M5–M9 were killed; M4 is the planned equivalent.
  - Gate: 173/93/7. In the real app, with a 3000 ms write delay, b.wav kept its own title and comment in ffprobe and music-metadata. On the `3006615` build, A's values had landed in b.wav.
  - Root published `b373b08` with review COMMIT OK. TM-B23 and D-29 are done.
- **TM-B24 (medium) is now the highest open bug.** B confirmed it by reading the code on `b373b08`. Root review R20 (RR-R20-02) and A's qa-engineer R20 found it independently.
  - The editor inputs are **not** disabled during a save; only the Save button is (`MetadataPanel.tsx:296`).
  - **Single:** when the selection set is unchanged after the awaits, `handleSave` runs `skipSyncRef.current = true; updateFileMetadata(path, updated); setEditingMetadata({ ...updated })` (`:115-118`). `setEditingMetadata` resets `modifiedFields` and `isDirty` (`metadata-store.ts:32-33`). Anything typed while the write, scan and re-read were pending is replaced by the re-read, and Save goes disabled. The typed text is neither saved nor shown.
  - **Batch all-succeeded:** `setEditingMetadata({})` (`:154`) clears typed text the same way.
  - **A → B → A + typing on A:** the set is unchanged, so D-29 does not guard it, and the same overwrite happens.
  - Silent loss of user input is a data-loss class bug, so it comes before the polish items and the Saba questions.
- **Reference first:** this is a pure fix, so it is exempt. The visible UX stays the same: same toasts, inputs stay enabled, the list stays clickable. The only difference is that typed text survives the save.

## Baseline
- HEAD `b373b08f13069b26e89192a1229e3a4a31257e3e`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `b373b08`): everything not in the ownership table, in particular:
  - `src/main/**`, `src/shared/**`, every store (including `metadata-store.ts` and `file-store.ts`), `FileList.tsx`, `FolderBrowser.tsx`, `TagsInput.tsx`, `TemplatePicker.tsx`, `App.tsx`, the other components, `src/renderer/src/types/**`;
  - every test except the one owned file, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/stores/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, every `.claude/**` file except the one owned primitive, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **No store change.** The store has no edit counter. Root's `editVersion` token idea is architecture signal RR-R20-04, not this round. If you find you cannot meet D-30 without a store change, stop and report; do not widen ownership yourself.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** No `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, and no script that writes repository files. The only exception is gitignored build and test output from npm commands. Mutants are run in a copy outside the repository, as in R20.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` and `STATE_MANAGEMENT.md`. In `a-round-21.md`, record when you read each one and whether the read-primitives hook fired.
- Edit `.claude/primitives/STATE_MANAGEMENT.md` with the Edit tool (standing path (b) permission). If the edit is refused, stop that one step and report it. Do not fall back to Bash.

## Scope (D-30, see `feature-status.md`)
Follow the `test-on-bugfix` rule: write the failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments. No `any`, `@ts-ignore`, `as unknown as`, and no new `as` cast. No new export. The two existing `as WavMetadata` casts (RR-R15-02) stay as they are; they are not part of this round.
- Tests: keep the file's double-quote style. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-30)
1. **Start snapshot.** In `handleSave`, before the first `await`, keep the `editingMetadata` that the save writes: the closure value already passed to `writeMetadata`, or `useMetadataStore.getState().editingMetadata` read at the same point; they are the same object.
2. **Typed-during-save keys.** On the D-29 **same set** branch only, after the last `await` and next to the existing `isSelectionUnchanged()` check, compute `typedDuringSave: Record<string, FieldValue>`. It holds every key in the current `useMetadataStore.getState().modifiedFields` whose current `editingMetadata[key]` differs from the start snapshot's value, with the current value.
   - Compare with a private module-level helper (not exported):
     - strings and numbers with `===`;
     - two arrays are equal when they have the same length and the same elements in the same order;
     - an array and a non-array are not equal;
     - a key missing from the start snapshot is not equal to a present value.
   - So retyping the value that was saved is **not** a typed change, and an equal tag array with a new reference is **not** a typed change.
3. **Empty `typedDuringSave`:** everything exactly as today (D-21, D-22, D-24, D-28, D-29).
4. **Non-empty, single:**
   - run `skipSyncRef.current = true`, `updateFileMetadata(path, updated)` and `setEditingMetadata({ ...updated })` as today;
   - **then** `mergeFields(typedDuringSave)`, an existing store action. Read `mergeFields` (and the current `modifiedFields`/`editingMetadata`) from `useMetadataStore.getState()` at the call site, as `:122` already does for `modifiedFields`, or add every new hook value to the `useCallback` deps. Biome's `useExhaustiveDependencies` must stay at today's 9 warnings.
   - End state:
     - `editingMetadata` holds the re-read with the typed values on top;
     - `modifiedFields` holds **only** the typed keys;
     - `isDirty === true`, and `Save Tags` is enabled;
     - toast `Tags saved` (unchanged);
     - `metadata[path]` is the re-read.
5. **Non-empty, batch all-succeeded:**
   - run `setEditingMetadata({})` as today;
   - **then** `mergeFields(typedDuringSave)`.
   - End state:
     - `editingMetadata` deep-equals the typed values only;
     - `modifiedFields` holds the typed keys only;
     - `isDirty === true`, and `Save to N files` is enabled;
     - toast `Tags saved to N files`;
     - the store entries are updated as today.
6. **Unchanged:**
   - batch partial failure: D-21 already keeps every edit, so typed text survives today;
   - write reject and re-read reject (D-24): the editor is not touched;
   - the D-29 **changed set** branch: the editor is not touched;
   - the sync effect and the `Unsaved changes were discarded` toast (B-R19-01 / RR-R20-01 stay Saba questions);
   - `setIsSaving(false)` in `finally`;
   - main, preload, the stores, `FileList.tsx`;
   - the save-time write payload: single still writes the start `editingMetadata`, and batch still writes only the start `modifiedFields`. A save never writes text typed after Save was clicked; the next Save does.
7. **`STATE_MANAGEMENT.md` `### Save flow`:** add one line inside the code block, directly after the D-29 line. Additions only:
   `Typed during save (D-30): same set → keys in modifiedFields whose value differs from the start snapshot (arrays by content) → after setEditingMetadata(re-read | {}) mergeFields(those) → isDirty stays true; partial / reject / D-24 / changed set unchanged`.

### Tests (prescribed) — `tests/renderer/components/metadata-panel-batch-save.test.ts`
- **Additions only.** Add one nested `describe("typing while the save is pending (TM-B24, D-30)", ...)` **inside** the existing `describe("MetadataPanel save while the selection changes (TM-B23, D-29)")`, inserted directly before that describe's closing `});`.
  - This lets the new tests reuse `SEED_A`, `SEED_B`, `REREAD_A`, `seedSingleA`, `seedBatchAB`, `deferSingleWrite`, `deferBatchWrite`, `selectPaths`, `settle` and `typeCategoryAndSaveWith` **without moving a line**.
  - Do not hoist, rename or reformat any existing helper. Every existing line stays byte-identical, including (a)–(w), (s6) and (x1)–(x11).
- A small local helper inside the nested describe is fine, for example `getInputByLabel("Title")`, built on the same pattern as `getCategoryInput`. Title, BPM and Copyright are in the default panel schema (`STANDARD_FIELDS`).
- For tag fields, a direct `act(() => { useMetadataStore.getState().updateField("genres", [...]); })` is allowed. It is exactly what `TagsInput`'s `onChange` calls.
- **Imports:** extend an existing import line only if a name is really missing. Never add a second line from the same module.
- Type into inputs while the write is pending: after `typeCategoryAndSaveWith(...)` and before `settle(pending.release)`.
- A follow-up save after the deferred one uses the `beforeEach` default mocks (`writeMetadata` resolves, `writeMetadataBatch` resolves `{ succeeded: 0, failed: [] }`) unless the test sets its own.

| Test | Setup → action | Must hold after the save settles | On `b373b08` |
|---|---|---|---|
| **(y1)** single, same selection, other field | `seedSingleA`; re-read `REREAD_A`; Category `R20Cat`, Save; pending; Title `TypedTitle`; release | Title input `TypedTitle`; Category input `R20Cat`; `isDirty === true`; `modifiedFields` equals `new Set(["title"])`; `Save Tags` enabled; `metadata[A]` deep-equals `REREAD_A`; toast `Tags saved`; `isSaving === false` | **fails** (Title `A-title`) |
| **(y2)** the next Save writes the typed text | (y1), then click `Save Tags` (the second write resolves normally) | `writeMetadata` called twice; the second call has path `PATH_A`, `meta.title === "TypedTitle"` and `meta.category === "R20Cat"` | **fails** (button disabled → one call) |
| **(y3)** same field retyped | as (y1), but during the pending write set Category to `R21Again` | Category `R21Again`; `modifiedFields` equals `{category}`; `isDirty === true` | **fails** (`R20Cat`) |
| **(y4)** pin: typed then reverted | as (y1), but during the pending write set Category to `X`, then back to `R20Cat` | as today: Category `R20Cat`; `isDirty === false`; `modifiedFields` empty; `Save Tags` disabled | passes |
| **(y5)** pin: equal tag array, new reference | as (y1), but **before** Save also `updateField("genres", ["G1", "G2"])`, so it is in the start snapshot; during the pending write `updateField("genres", ["G1", "G2"])` (a fresh array with equal content) | as today: `isDirty === false`; `modifiedFields` empty; `Save Tags` disabled | passes |
| **(y5b)** tag order changed | as (y5), but during the pending write `updateField("genres", ["G2", "G1"])` | `editingMetadata.genres` deep-equals `["G2", "G1"]`; `modifiedFields` equals `{genres}`; `isDirty === true` | **fails** |
| **(y6)** tag added during the save | as (y1), but during the pending write `updateField("genres", ["R21Tag"])` | `editingMetadata.genres` deep-equals `["R21Tag"]`; `modifiedFields` equals `{genres}`; `isDirty === true`; Category `R20Cat` | **fails** |
| **(y7)** number field | as (y1), but during the pending write BPM input `128` | `editingMetadata.bpm === 128`; `modifiedFields` equals `{bpm}`; `isDirty === true` | **fails** |
| **(y8)** A → B → A + typing (RR-R20-02) | as (y1), but during the pending write `selectPaths([PATH_B])`, `selectPaths([PATH_A])`, then Title `BackTyped` | Title `BackTyped`; Category `R20Cat` (the re-read, **not** the stale `ACat` from the store); `modifiedFields` equals `{title}`; `isDirty === true`; toast `Tags saved` | **fails** (Title `A-title`) |
| **(y9)** batch all-succeeded, same set | `seedBatchAB`; refreshed both with `category: TYPED_CATEGORY`; Category `TYPED_CATEGORY`, `Save to 2 files`; pending `ALL_SUCCEEDED`; Title `BatchTitle`; release | `editingMetadata` deep-equals `{ title: "BatchTitle" }`; Category input `""`; Title input `BatchTitle`; `modifiedFields` equals `{title}`; `isDirty === true`; `Save to 2 files` enabled; toast `Tags saved to 2 files`; `metadata[A].category` and `metadata[B].category` are `TYPED_CATEGORY` | **fails** (`editingMetadata` `{}`) |
| **(y10)** the next batch Save writes only the typed field | (y9), then click `Save to 2 files` | the second `writeMetadataBatch` call has paths `[PATH_A, PATH_B]` and meta deep-equal to `{ title: "BatchTitle" }` | **fails** |
| **(y11)** pin: batch partial + typing | as (y9), but resolve `PARTIAL_FAILED` | as today: `editingMetadata.category === TYPED_CATEGORY`; `editingMetadata.title === "BatchTitle"`; `modifiedFields` equals `{category, title}`; `isDirty === true`; toast `1 saved, 1 failed` | passes |
| **(y12)** pin: write rejects + typing | single; during the pending write Title `TypedTitle`; `pending.fail(new Error("EACCES"))` | as today: toast `EACCES`; Category `R20Cat`; Title `TypedTitle`; `modifiedFields` equals `{category, title}`; `isDirty === true` | passes |
| **(y13)** pin: D-24 + typing | single; `readMetadata` rejects; during the pending write Title `TypedTitle`; release | as today: toast `Tags saved, but reloading failed. Rescan to refresh.`; Category `R20Cat`; Title `TypedTitle`; `isDirty === true` | passes |

Red run on `b373b08`, before the fix. Save the log in `a-round-21/`.
- **Primary red:** (y1)–(y3), (y5b) and (y6)–(y10) fail with the symptom: a wrong input value, wrong `editingMetadata`/`modifiedFields`/`isDirty`, or a missing or wrong write call. Record the exact messages.
- (y4), (y5) and (y11)–(y13) pass on `b373b08`; say so.
- If a planned red test passes on `b373b08`, or a pin fails there, stop and report it. Do not change the expectation to fit.

### `a-round-21.md` (Georgian) contains
- the red and green logs and the diff;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last test edit;
- a `qa-engineer` read-only regression check (bugfix rule);
- the process statement.
- A `code-reviewer` run is optional (3 files).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | start snapshot, private value-compare helper, `mergeFields` of typed keys on the same-set branch (D-30) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | tests (y1)–(y13) and (y5b), additions only, nested describe |
| `.claude/primitives/STATE_MANAGEMENT.md` | one added line in `### Save flow` |

Logs go to `a-round-21/` (A) and `c-round-21/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`). C's harness modules live in `c-round-21/`, never in the repository. C may copy R20's `c-round-20/delay-write.cjs`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R21-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat b373b08`, and `git diff --quiet b373b08 -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!.claude/primitives/STATE_MANAGEMENT.md'`. Read the diff, A's result JSON and A's transcript. | All of these hold:<ul><li>Only the 3 owned paths differ, all `M`, and there is no untracked file.</li><li>`git diff b373b08 -- tests/ .claude/ \| grep '^-[^-]'` is empty, except an import line that comes back with the same names plus new ones.</li><li>The new tests sit inside the TM-B23 describe as one nested describe.</li><li>The src diff has no comment, no `any`/`@ts-ignore`/new `as`, and no new export. Stores, main, preload and types are untouched.</li><li>`permission_denials` is empty, and all repo writes were made with Edit/Write. Say whether the transcript was available.</li></ul> |
| R21-2 red/green | Run `git worktree add --detach /tmp/c-r21-old b373b08` with `node_modules` symlinked. Never use `git stash`. Copy A's test file in, then run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts`. Run the same command on A's tree. | Old code: (y1)–(y3), (y5b) and (y6)–(y10) fail with the symptom, not a harness error. (y4), (y5), (y11)–(y13), (x1)–(x11) and every older test pass. Record names and messages. New code: all pass, with the exact count. |
| R21-3 mutations | In a throwaway copy of A's tree, run the test file once per mutant:<ul><li>**M1:** no merge (today's code).</li><li>**M2:** merge every `modifiedFields` key, without the value compare.</li><li>**M3:** arrays compared by reference.</li><li>**M4:** merge the whole current `editingMetadata` instead of only the typed keys.</li><li>**M5:** single only; batch without the merge.</li><li>**M6:** start snapshot read after the awaits.</li><li>**M7:** the merge before `setEditingMetadata` instead of after.</li><li>**M8 (expected equivalent, record only):** do not set `skipSyncRef` when typed keys exist. After `mergeFields`, the sync effect sees `!selectionChanged && isDirty && hasEditingData` and returns early, so the end state is the same. C confirms this by reasoning or a run; a surviving M8 is **not** a FAIL.</li></ul> | Each mutant except M8 is killed by at least one named test. Expected killers: M1 (y1); M2 (y1) (`modifiedFields` would include `category`)/(y4); M3 (y5); M4 (y8) (Category would be `ACat`); M5 (y9)/(y10); M6 (y1); M7 (y1). A survivor other than M8 is a FAIL unless C shows it is equivalent. |
| R21-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and 9 warnings, the same file/rule list as on `b373b08`.</li><li>Typecheck 0.</li><li>Renderer **173 + new** (exact count; 10 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R21-5 real app | **Harness** (no source change): launch the built app with Playwright `_electron` under `xvfb-run` and the args `['--no-sandbox', '-r', '<c-round-21>/delay-write.cjs', 'out/main/index.js']`. The module delays only `meta:write` and `meta:write-batch` by 3000 ms; the write itself stays real (R20's module). Drive the UI only; the folder dialog may be stubbed. Copy `tests/fixtures/sample.wav` into a temp folder as `a.wav`, `b.wav` and `c.wav`, then scan.<ol><li>Select `a.wav`, set Category `R21A`, and click `Save Tags`. **Within the delay**, click the Comment input and type `R21Typed`. Record the ms from Save to the last keystroke and to the `Tags saved` toast.</li><li>After `Tags saved`, read the form: Category, Comment, and whether `Save Tags` is enabled.</li><li>Click `Save Tags` and wait for `Tags saved`. The form keeps both values and `Save Tags` is disabled.</li><li>A → B → A: select `b.wav`, set Category `R21B`, Save. Within the delay click `a.wav`, then `b.wav`, then type Title `R21Back`. After `Tags saved`, the form shows Title `R21Back`, Category `R21B`, and `Save Tags` is enabled. Save again.</li><li>Batch: click `b.wav`, Ctrl-click `c.wav`, set Category `R21Batch`, and click `Save to 2 files`. Within the delay type Copyright `R21Copy`. After `Tags saved to 2 files`, Copyright shows `R21Copy`, Category is empty, and `Save to 2 files` is enabled. Click it and wait for the toast.</li><li>Regression without typing: select `c.wav`, set Comment `R21C`, Save. The form shows `R21C`, `Save Tags` is disabled, toast `Tags saved`, and no `Unsaved changes` toast appears.</li><li>Read every file with `music-metadata` and `ffprobe -show_entries format_tags -of json`.</li><li>**Red reference:** build `b373b08` in the old worktree and repeat steps 1, 2 and 7 on fresh copies. Step 3 cannot run there, because `Save Tags` is disabled after step 2 (that is the symptom); record this, it is not a harness problem.</li></ol>Take a screenshot after each step. | All of these hold:<ul><li>Every typing step happened before its save toast. Record the timings.</li><li>(2) Category `R21A`, Comment `R21Typed`, `Save Tags` enabled.</li><li>(3)+(7) **Hard check:** ffprobe and music-metadata on `a.wav` both show comment `R21Typed` and ICAT `R21A`.</li><li>(4)+(7) `b.wav` shows title `R21Back` in both readers.</li><li>(5)+(7) `b.wav` and `c.wav` show ICAT `R21Batch` and copyright `R21Copy` in both readers.</li><li>(6)+(7) `c.wav` shows comment `R21C`.</li><li>(8) On the `b373b08` build, after step 1 the Comment field is empty (or not `R21Typed`) and `Save Tags` is disabled. `a.wav` has no comment `R21Typed` in either reader. That proves the bug was real. If it does not reproduce, report it; the round is not PASS until B re-plans.</li><li>`pageErrors` is empty in every phase.</li><li>Record the `Unsaved changes were discarded` toast in step 4; it is expected and unchanged (B-R19-01).</li><li>Artists are record only (TM-B08).</li></ul> |

## What could break (C re-checks)
- **D-21/D-22/D-24/D-28/D-29 save outcomes without typing during the save:** toasts, kept edits, `isDirty`, `skipSyncRef`, failed-file store entries, Size/Date refresh and the changed-selection guard. These are covered by the existing tests (a)–(w), (s6) and (x1)–(x11), byte-identical and green, and by R21-5 step 6.
- **The sync effect:** no stale `skipSyncRef` after a merged save. The next selection change still loads the new file. R21-5 steps 4 and 5 move on from a dirty form.
- **Batch write payload:** a follow-up batch save writes only the typed keys, not the earlier saved ones ((y10), R21-5 step 5).
- **Template apply** (`mergeFields` from `TemplatePicker`) and **schema change** (`handleSchemaChanged`) are untouched.
- **The `Unsaved changes were discarded` toast:** when the user leaves a form that is dirty with typed-during-save text, the toast is correct (that text really is unsaved). C records it if it appears.

## What realVerified means here
- R21-1…R21-4 are real local checks.
- R21-5 is the real-app proof. The delay harness only stretches the timing; the write and the read are real, and the result is checked by independent readers against a red reference.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
1. **MetadataPanel polish:** remove the `as WavMetadata` casts (RR-R13-02 + RR-R15-02). RR-R15-01 (the re-read reason) needs a D-24 amendment from Saba.
2. **A-R20-01:** the sync effect treats a reorder of the same set as a selection change. Re-check it after TM-B24.
3. **Saba question batch:** see `b-round-20.md`. RR-R20-01 joins B-R19-01, and RR-R20-04 joins the architecture signals.
