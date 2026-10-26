# CURRENT TASK — Round 11: TM-B15 a failed batch save keeps the typed edits (D-21, C-R8-01)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
- Round 10 (TM-B14, D-20): **C PASS** on R10-1…R10-8, realVerified=true for every local check. Root review COMMIT OK, published `35ed18b`. RR-R9-01 and RR-R9-02 are closed. TM-B14 stays in_progress only for its Actions line, which rides on TM-T0-CI (root has not linked a `Check` run yet). No critical or high bug is open.
- Everything else still open needs a decision from Saba (D-07, D-10/TM-B11, D-12/TM-B08, TM-T1-DUP, TM-B05, TM-B06, TM-T2-DATA). The highest-value item that needs no decision is **C-R8-01**, a user-visible save-flow bug. It is promoted to **TM-B15** (low).
- One bug, one file of production code. The neighbouring lows (RR-R5-02, RR-R1-04/05, RR-R10-*) touch other files and are not bundled.

**Facts (confirmed, inferred and hypothesis kept separate, policy rule 8):**
- **Confirmed (C R8-5 (ii), screenshots):** with 2 files selected, Category `BATCHCat` and Bad `y` were typed (`c-round-8/r8-5-after-ii-before-save.png`). After Save the toast said `0 saved, 2 failed`, and every field was back to the `Multiple values` placeholder (`r8-5-after-ii-toast.png`). The typed values were gone.
- **Confirmed (code, `35ed18b`):**
  - `MetadataPanel.tsx` `handleSave`, batch branch: after `writeMetadataBatch` it calls `setEditingMetadata({})` **whatever `result.failed` holds**.
  - `metadata-store.ts` `setEditingMetadata` sets `isDirty: false` and clears `modifiedFields`. The Save button is `disabled={isSaving || !isDirty}`, so after a failure the user cannot retry without retyping everything.
  - The single-file branch keeps edits on failure: `writeMetadata` throws → `catch` → toast, no reset.
- **Confirmed (B experiment, `/tmp/b-r10`, kept as `b-round-10-exp-batch-save.test.ts.txt`):** real `MetadataPanel` + real stores, only `window.api` mocked, Category typed, Save clicked:

  | `writeMetadataBatch` result | input value | isDirty | modifiedFields | toast |
  |---|---|---|---|---|
  | `{succeeded: 0, failed: [a, b]}` | `""` | false | `[]` | `0 saved, 2 failed` |
  | `{succeeded: 1, failed: [b]}` | `""` | false | `[]` | `1 saved, 1 failed` |
  | `{succeeded: 2, failed: []}` | `""` | false | `[]` | `Tags saved to 2 files` |

- **Confirmed (B experiment, `b-round-10-exp-nohoist.test.ts.txt`):** **without** the `vi.hoisted` window workaround used in `tests/renderer/components/schema-editor.test.ts` (A-R3-01), the same test is falsely green. The input shows the typed text, but no store update, no IPC call and no toast happen. **The new test must use that workaround and must assert that `writeMetadataBatch` was really called.**
- **Inference:** a partial failure is the realistic case, for example one read-only or locked file in a batch of many. Losing the typed values there costs the most.

## Baseline
- HEAD `35ed18b9211f0da3d7c23e10af5b431d6f33540f`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - all of `src/main/**` and every `src/renderer/src/**` file except `MetadataPanel.tsx`. In particular `stores/metadata-store.ts`, `stores/file-store.ts`, `components/templates/**`, `components/schema/**`;
  - protected: `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`;
  - every `tests/**` file except the one new test. In particular `tests/renderer/setup.ts` (copy the workaround into your test, do not edit setup), `tests/renderer/helpers/**`, `tests/e2e/**`, `tests/main/**`, `tests/fixtures/**`, `tests/contract/**`;
  - `playwright.config.ts`, `vitest.config.*.ts`, every `tsconfig*.json`, `biome.json`, `electron.vite.config.ts`, `.github/**`;
  - `.claude/**` except the one owned primitive; every `docs/**` file except `docs/learning/data-flow.md`.

## Scope (D-21, B, technical, reversible)
1. **`src/renderer/src/components/metadata-editor/MetadataPanel.tsx`, `handleSave` batch branch only.**
   - Unchanged: `writeMetadataBatch(paths, batchMeta, fields)` with only the modified fields; then `readMetadataBatch` + `skipSyncRef.current = true` + `updateFileMetadata` for every returned path. Succeeded files must still show their new values and the `Tagged` badge.
   - `result.failed.length === 0` → `setEditingMetadata({})`, as today. The form goes back to `Multiple values`, isDirty false, and the toast is `Tags saved to N files`.
   - `result.failed.length > 0` (all failed **or** partial) → do **not** reset. `editingMetadata` and `modifiedFields` stay, `isDirty` stays true, the typed values stay in the inputs, and `Save to N files` stays enabled. The toast text is unchanged: `${succeeded} saved, ${failed.length} failed`.
   - Retry: a second Save sends the same modified fields to **all** selected files. Rewriting the files that already succeeded with the same values is accepted.
   - Unchanged: a thrown `writeMetadataBatch`/`readMetadataBatch` still goes to `catch` and keeps edits. The single-file branch is not touched. The sync `useEffect` and `handleSchemaChanged` are not touched.
   - Not in D-21: narrowing the selection to the failed files, listing failed file names in the toast, or changing toast texts. These are product decisions.
   - Read `.claude/primitives/STATE_MANAGEMENT.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING.md` and `.claude/rules/test-on-bugfix.md` first. No comments, semicolons, no `any`.
2. **New `tests/renderer/components/metadata-panel-batch-save.test.ts`** (test-on-bugfix: write it first, show it red on `35ed18b`, then fix).
   - Use the `vi.hoisted` window workaround exactly as `schema-editor.test.ts` does, plus `resetAllStores()` in `beforeEach`/`afterEach`.
   - Render the real `MetadataPanel` with real stores. Only `window.api` is mocked (`vi.mocked(window.api.writeMetadataBatch)` etc.).
   - Set up: two files in `useFileStore` (`files`, `metadata`, `selectedPaths`).
   - Find the Category input through its label `Category (UCS)`. `Input`'s `<label>` has no `htmlFor`, so use `label.parentElement.querySelector('input')` as in the experiment.
   - Type `BATCHCat` and click `Save to 2 files` inside `act`.
   - Required cases (names may differ, assertions may not):
     - (a) **all failed** `{succeeded: 0, failed: [a, b]}`:
       - input value is still `BATCHCat`, the button is enabled, `isDirty` is true, and `modifiedFields` equals `{'category'}`;
       - toast `0 saved, 2 failed`, type error;
       - `writeMetadataBatch` was called once with `{ category: 'BATCHCat' }` (the guard against a false green).
     - (b) **partial** `{succeeded: 1, failed: [b]}`, with `readMetadataBatch` returning `category: 'BATCHCat'` for `a`:
       - the same "kept" assertions as (a);
       - toast `1 saved, 1 failed`;
       - `useFileStore.getState().metadata[a].category === 'BATCHCat'` (the refresh still happened).
     - (c) **retry after a failure**: after (a), a second click calls `writeMetadataBatch` a second time with the same paths and the same `{ category: 'BATCHCat' }`. With the mock now returning success, the form clears and the toast is `Tags saved to 2 files`.
     - (d) **success pin** `{succeeded: 2, failed: []}`: the input goes back to `''` with placeholder `Multiple values`, `isDirty` is false, the button is disabled, and the toast is `Tags saved to 2 files`. This is green before and after the fix: it is the regression guard.
     - (e) **single-file failure pin**: one file selected, `writeMetadata` rejects `new Error('Failed to write metadata: x')`. The typed value stays, `isDirty` is true, and the toast is that message. Green before and after.
   - Expected red on `35ed18b`: (a), (b), (c) fail; (d), (e) pass.
3. **`docs/learning/data-flow.md`, section `## ტეგების შენახვა — Batch`, in Georgian with English technical terms.**
   - Add to the diagram or below it what happens when `failed` is not empty: edits stay, isDirty stays true, Save stays enabled, a retry writes to all selected files, succeeded files are already refreshed.
   - On success the form clears.
   - Keep the rest of the file unchanged.
4. **`.claude/primitives/STATE_MANAGEMENT.md`, the `### Save flow` block only.**
   - Change the `Batch:` line so that `setEditingMetadata({})` happens only when `failed` is empty.
   - Add one line: when `failed` is not empty, edits, `modifiedFields` and `isDirty` are kept (D-21).
   - Nothing else in `.claude/**` changes. Do **not** touch `.claude/primitives-map.json`.

**Red/green (A):**
- Red: a temp copy `git archive 35ed18b | tar -x -C /tmp/a-r11-old`, `node_modules` symlinked, with **only** the new test file added. Run `npx vitest run --config vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts`. Expected: (a), (b), (c) fail and (d), (e) pass. Save as `a-round-11/red-before.log`.
- Green: the same command on the working tree, all pass. Save as `a-round-11/green-after.log`.
- Then run the full `verifyCommand`. Save as `a-round-11/verify.log`.

**Explicitly NOT in this round:**
- Any `src/main/**` or IPC change (`BatchWriteResult` stays as it is).
- Store changes.
- Toast texts.
- RR-R5-02 (`file-row-display.ts`).
- RR-R1-04/05 (`create-fixtures.ts`).
- RR-R10-* (E2E harness polish).
- TM-B06 (linting `tests/`).
- A new E2E spec.
- Package installs.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-21: reset the batch form only when nothing failed |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` (new) | failing reproduction (a)–(c) + regression pins (d), (e) |
| `docs/learning/data-flow.md` | Batch section: failure behaviour (Georgian) |
| `.claude/primitives/STATE_MANAGEMENT.md` | `### Save flow` Batch line, so the primitive does not go stale |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Logs, drivers and temp copies go to `a-round-11/` or `/tmp`.

## Acceptance (C)
C runs mutations only in a **temp copy** (`/tmp/c-r11-*`, `node_modules` symlinked), never in the repository. C drives the real app with its own driver script outside the repo.

| ID | Check | Evidence that means PASS |
|---|---|---|
| R11-1 static + ownership | `git status --porcelain --untracked-files=all`; `git diff --quiet 35ed18b -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!docs/learning/data-flow.md' ':!.claude/primitives/STATE_MANAGEMENT.md'`; the new test is the only untracked file; `git diff 35ed18b -- src/renderer/src/components/metadata-editor/MetadataPanel.tsx`; comment grep on the changed `.tsx` and new `.ts`; `npm run typecheck` | Only owned paths changed. The `MetadataPanel.tsx` diff is limited to the batch branch of `handleSave`; the single-file branch, the sync effect and `handleSchemaChanged` are byte-identical. No comment lines. Typecheck 0. |
| R11-2 red on old code / green on new | C's own `git archive 35ed18b` copy with only the new test file added; run the new test there and on the tree | Old: (a), (b), (c) fail with assertion errors (value `''` / isDirty false), not with setup or import errors; (d), (e) pass. Tree: all pass. The test contains the `vi.hoisted` workaround and asserts the `writeMetadataBatch` call. |
| R11-3 mutations (temp copy of the tree) | M1: restore the unconditional `setEditingMetadata({})`. M2: never reset, not even on success. M3: in the batch branch skip `updateFileMetadata` when `failed.length > 0`. M4: delete the `vi.hoisted` block from the new test, code unchanged. | M1 → (a)/(b)/(c) fail. M2 → (d) fails. M3 → (b) fails on the refreshed store value. M4 → the test fails, so it cannot go silently green. Every mutation is caught. |
| R11-4 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome 0 errors (warnings as on `35ed18b`, 9). Typecheck node/web/test 0. Renderer **107 + the new tests**, all passing. Main **62/62**. E2E **7/7**. `--retries=0` 7/7. |
| R11-5 real app, partial failure + retry | Built app, `_electron`, `xvfb-run -a`, `--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder with two copies of `sample.wav` (`p1.wav`, `p2.wav`). `chmod 444 p2.wav`. Open Folder, click `p1`, Ctrl+click `p2`, type Category `BATCHCat`, Save. Then `chmod 644 p2.wav`, Save again, Rescan. | After the first Save: toast `1 saved, 1 failed`; the Category input still shows `BATCHCat`; `Save to 2 files` is enabled (screenshot). ffprobe `format_tags` on `p1`: `ICAT=BATCHCat`, music-metadata agrees. `p2`: sha256 unchanged. After the retry: toast `Tags saved to 2 files`; the form is back to `Multiple values`; ffprobe + music-metadata show `ICAT=BATCHCat` on both; after Rescan both rows show `Tagged`. Screenshots `c-round-11/r11-5-*.png`. |
| R11-6 real app, all failed + discard | Same setup. `schema.json` in the clean `XDG_CONFIG_HOME` adds a custom text field with `riffChunkId: 'AB'` (as R8). Select both files, type Category `BATCHCat` and the bad field `y`, Save. Then click a single row. | First: toast `0 saved, 2 failed`, and both typed values are still in the form (screenshot). Both sha256 unchanged. Then: toast `Unsaved changes were discarded`, and the form shows that file's own values. |
| R11-7 real app regressions | (i) Batch success with no failure: 2 writable files, Category `OKCat` → `Tags saved to 2 files`, form cleared, ffprobe + music-metadata `ICAT=OKCat`. (ii) Single file: Category `DOORWood` → `Tags saved`, ffprobe `ICAT=DOORWood`, music-metadata agrees, the row is `Tagged`. (iii) Batch template apply: apply a saved template with 2 files selected, then Save → the template's fields are written to both. (iv) After R11-5, close the folder → the panel shows `Select a file to edit metadata`. | All pass, with screenshots `c-round-11/r11-7-*.png` and ffprobe/music-metadata JSON. |
| R11-8 docs | `git diff 35ed18b -- docs/learning/data-flow.md .claude/primitives/STATE_MANAGEMENT.md` | Georgian with English terms. Failure vs success behaviour is described and matches the code (kept edits, isDirty, retry to all selected files, refresh). The STATE_MANAGEMENT diff is limited to the `### Save flow` block. |

**What realVerified means here:** R11-1…R11-8 are real local checks. R11-5…R11-7 must be driven in the real built app with screenshots, and their values must be read by ffprobe and music-metadata. The renderer test alone does not count as UI evidence. Windows packaging is not part of this round.

## What could break (C re-checks)
- **Sync effect / `skipSyncRef`:** after a failed batch the refresh sets `skipSyncRef` and changes `metadata` while `isDirty` stays true. The kept edits must not be overwritten (R11-2 (a)/(b), R11-5).
- **Selection change after a failed batch:** it must still discard with the existing toast and load the newly selected file (R11-6).
- **Successful batch and single-file save:** unchanged (R11-2 (d)/(e), R11-7 (i)/(ii)).
- **Template apply** (`mergeFields`) in batch mode: unchanged (R11-7 (iii)).
- **Folder close** (`resetEditing`) still clears everything (R11-7 (iv)).
- **The K-4 tag contract** (`ICAT`/`IKEY`/`ICMT` bytes): not touched, because main is frozen. The R11-4 gate (contract tests + ffprobe step) confirms it.

## Next (orientation only)
1. Root links a `Check` Actions run on `35ed18b` or later. If it is green, TM-T0-CI, TM-T0, TM-T0-CI-FU and TM-B14 close.
2. Low items with no decision needed, candidates for round 12:
   - RR-R5-02: `typeof` guard in `file-row-display.ts`;
   - RR-R1-04/RR-R1-05: `create-fixtures.ts`;
   - RR-R10-01/02 + A-R10-01: E2E launch error polish.
3. The Saba question batch is unchanged:
   - D-07 (TM-T1-MIG);
   - D-10 plus TM-B11;
   - D-12/TM-B08 plus B-R6-01;
   - TM-T1-DUP (RR-R3-01);
   - D-15 plus RR-R5-01;
   - B-R7-02/RR-R8-04 (schema validation at load);
   - TM-B05, TM-B06, RR-R1-07, RR-R3-05;
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
