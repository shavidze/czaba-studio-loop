# CURRENT TASK — Round 15: TM-B18 — save whose write succeeded but whose re-read rejects reports the write result, keeps the store and the edits (RR-R13-03 batch + B-R14-01 single) — D-24

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- Round 14 result:
  - **C PASS**, realVerified=true (R14-1…R14-7), 0 bugs. M1–M4 were killed, the generator bytes are unchanged, and the real-app smoke gave `ICAT=R14Cat` in both readers.
  - Root published `a4ad852` with review COMMIT OK. TM-B17/D-23 is done. RR-R1-04, RR-R1-05 and C-R1-03 are closed.
  - No critical or high bug is open.
- **RR-R13-03 (root review R13, low):** in `MetadataPanel.tsx` `handleSave` the batch branch has one `try` around `writeMetadataBatch` **and** `readMetadataBatch`.
  - If the write resolves and the re-read rejects, the outer `catch` shows only the rejection text (`Error invoking remote method 'meta:read-batch': …`) as an error toast.
  - The user is told nothing about the files that **were** written. The store stays stale.
- **B-R14-01 (B, code read on `a4ad852`):** the single-file branch (`MetadataPanel.tsx:73-80`) has the same shape: `writeMetadata` resolves, `readMetadata` rejects, and the user sees the raw rejection as if the save had failed.
- Both are the same defect in the same function, so they make one round.
- **How a rejection happens:** main's `meta:read` and `meta:read-batch` handlers (`src/main/ipc/metadata.ts:222-249`) catch per file and return `emptyMetadata`. A rejection therefore comes only from the IPC layer: a missing or throwing handler, or serialization. It cannot be reached through the filesystem. R15-5 shows C how to reach it in the real app anyway.
- **Reference first:** this is a pure fix round (error handling of an existing flow, no new UX), so it is exempt from the reference rule.

## Baseline
- HEAD `a4ad85244cd7a80515c67f342cb0cae238cebc29`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- Frozen (byte-identical to `a4ad852`): everything not in the ownership table. In particular:
  - `src/main/**`, `src/renderer/src/stores/**`, `src/renderer/src/types/**`, every other component;
  - `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/main/**`, `tests/e2e/**`, `tests/fixtures/**`;
  - configs (`vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, tsconfigs), `.github/**`;
  - `docs/**`, except the two sections named below in `docs/learning/data-flow.md`;
  - `.claude/**`, except the `### Save flow` block of `.claude/primitives/STATE_MANAGEMENT.md`. `.claude/primitives-map.json` stays unchanged.
- Protected (never edit):
  - `src/preload/index.ts`, `src/preload/index.d.ts`;
  - `src/renderer/src/styles/app.css`;
  - `package.json`, `package-lock.json`;
  - `.github/workflows/release.yml`;
  - `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-24, see `feature-status.md`)
Steps 1 and 2 follow the repo's `test-on-bugfix` rule: write the failing tests first, then the fix. Read `TESTING.md`, `STATE_MANAGEMENT.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before editing; the hook injects them anyway.

### Target behaviour (D-24)
1. **The write call keeps today's error handling.**
   - A write rejection still shows a toast with its message, and the edits stay.
   - In batch, a rejected `writeMetadataBatch` still calls no `readMetadataBatch`.
2. **The re-read gets its own `try`:** `readMetadata` in the single branch, `readMetadataBatch` in the batch branch.
3. **If the re-read resolves,** behaviour is exactly as today: the single branch as it is now, the batch branch per D-21 and D-22.
4. **If the re-read rejects:**
   - `updateFileMetadata` is **not** called for any path.
   - `skipSyncRef` is **not** set.
   - `setEditingMetadata` is **not** called. `editingMetadata`, `modifiedFields` and `isDirty` stay as they are, so Save stays enabled. A retry rewrites the same values, which is idempotent (as RR-R12-02 describes).
   - Exactly one error toast (`'error'`) reports the **write** result with these exact texts:
     - single: `Tags saved, but reloading failed. Rescan to refresh.`
     - batch, `failed` empty: `Tags saved to ${succeeded} files, but reloading failed. Rescan to refresh.`
     - batch, `failed` non-empty: `${succeeded} saved, ${failed.length} failed. Reloading failed. Rescan to refresh.`
   - `isSaving` returns to `false`, as today, through `finally`.
5. **Why the edits stay:** without a successful re-read the app does not know what is on disk. Clearing the form would show the stale store values as if nothing had been saved.
   - Known limit, documented and not fixed: a later selection change still shows `Unsaved changes were discarded`.
   - Rescan (the `Rescan` button in the sidebar) shows the real values.
6. **Not changed:** main, preload, stores, toast texts on every other path, the sync effect, and `handleSchemaChanged`.

### Steps
1. **Red tests first** in `tests/renderer/components/metadata-panel-batch-save.test.ts`. Add a new `describe` for TM-B18/D-24. Existing tests (a)–(i) and their helpers stay unchanged. Use the real `MetadataPanel` and the real stores; only `window.api` is mocked, exactly as the file already does.
   - **(j) batch, all written + re-read rejects.**
     - Setup: tagged seeds, as in (f). `writeMetadataBatch` resolves `{ succeeded: 2, failed: [] }`; `readMetadataBatch` rejects with `new Error('read-batch down')`.
     - Type Category and Save.
     - Expected:
       - toast text and type exactly as in D-24;
       - both store entries deep-equal their seeds;
       - the typed value is still in the input, `modifiedFields` contains `category`, `isDirty` is true, and `Save to 2 files` is enabled;
       - `isSaving` is false.
   - **(k) batch, partial write + re-read rejects.**
     - Setup: `{ succeeded: 1, failed: [{ path: PATH_B, … }] }`, and the re-read rejects.
     - Expected: toast `1 saved, 1 failed. Reloading failed. Rescan to refresh.`; the same store and edit assertions as (j).
   - **(l) single, write ok + `readMetadata` rejects.**
     - Setup: select one tagged file. `writeMetadata` resolves, `readMetadata` rejects.
     - Type Category and Save.
     - Expected:
       - toast `Tags saved, but reloading failed. Rescan to refresh.` (`error`);
       - the store entry deep-equals its seed;
       - the typed value is kept, `isDirty` is true, and `isSaving` is false.
   - **(m) pin, batch write rejects.**
     - Setup: `writeMetadataBatch` rejects with `new Error('write-batch down')`.
     - Expected: toast `write-batch down` (`error`); `readMetadataBatch` is not called; the store is unchanged and the edits are kept.
     - This passes on `a4ad852` and after the fix.
   - **Red run:** run the file on `a4ad852` before the fix and record it in `a-round-15/`. (j), (k) and (l) must fail on the toast text; (m) and (a)–(i) pass.
2. **Fix in `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`, `handleSave` only.**
   - Give the re-read its own `try`/`catch` in both branches, per D-24.
   - No `as` cast is added beyond the ones that already exist. RR-R13-02 waits on the protected preload types.
   - The success toasts, D-21/D-22 behaviour, `useCallback` deps and JSX are unchanged.
   - No comments in code. Semicolons. Single quotes, as in `src/`.
   - A small local helper or constant for the three messages is allowed if it stays inside this file.
3. **Docs (Georgian text, English technical terms):**
   - **`docs/learning/data-flow.md`.** Edit only the `## ტეგების შენახვა — Single File` and `## ტეგების შენახვა — Batch (რამდენიმე ფაილი)` sections. In each, add one short paragraph `**re-read-ის შეცდომა (D-24):**` that states the target behaviour above for that branch. Mermaid diagrams may stay as they are.
   - **`.claude/primitives/STATE_MANAGEMENT.md`.** Change only the `### Save flow` code block: add one line, `Re-read rejects (D-24): no store update, no skipSync, edits kept → error toast with write result + "Rescan to refresh"`.
     - Make this edit with the **Edit tool**: path (b), standing permission. **Do not** write to `.claude/**` through Bash.
     - If the Edit is refused, stop and report BLOCKED for this item only.
4. **`a-round-15.md`** (Georgian). A writes it with:
   - the red/green logs;
   - the diff summary;
   - the full `verifyCommand` result;
   - the code-reviewer result. 3+ files change, so A runs `code-reviewer`. After the bug fix, also run `qa-engineer` read-only for a regression read, per the read-primitives rule.

**Explicitly NOT in this round:**
- **RR-R13-01** (per-path read errors from `readMetadataBatch`) and **RR-R13-02** (the `as WavMetadata` cast). Both need `src/preload/index.d.ts`, which is protected, so they wait on the user.
- **RR-R12-04 / RR-R13-04** (`commitBatchSave` / `applyBatchSaveResult`, save-generation counter). These are architecture signals, not tasks.
- Narrowing a retry to the failed paths only (RR-R12-02). That is a product decision.
- **RR-R5-02** and **RR-R10-01/02 + A-R10-01**. These are the next small rounds.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-24: own `try` for the re-read in `handleSave` (single + batch) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | new tests (j)–(m); (a)–(i) and existing helpers unchanged |
| `docs/learning/data-flow.md` | one D-24 paragraph each in the Single File and Batch save sections |
| `.claude/primitives/STATE_MANAGEMENT.md` | `### Save flow` block only, +1 line, Edit tool |

Logs go to `a-round-15/` (A) and `c-round-15/` (C) in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R15-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat a4ad852`; `git diff --quiet a4ad852 -- . ':!<4 owned paths>'` | Only the 4 owned paths differ, and there are no untracked files. The `MetadataPanel.tsx` diff is inside `handleSave`, and `handleSchemaChanged` is unchanged. The test diff only adds; (a)–(i) and the existing helpers are byte-identical. The `data-flow.md` diff is inside the two save sections. The `STATE_MANAGEMENT.md` diff is +1 line inside `### Save flow`. A's result shows `permission_denials` empty. If the `.claude` Edit was refused, C's `taskStatus` is **BLOCKED**: C keeps all other evidence and root does not publish a partial round. |
| R15-2 red/green | `git worktree add /tmp/c-r15-old a4ad852`, with `node_modules` symlinked. Never use `git stash` and never touch A's tree. Copy the new test file into the worktree and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts`, then run it on A's tree. | Old code: (j), (k) and (l) fail (the toast is the raw rejection text); (m) and (a)–(i) pass. New code: all pass. |
| R15-3 mutations | In a copy of the fixed tree, run the test file against each mutant: **M1s** merge the single re-read back into the outer `try`; **M1b** do the same for the batch re-read; **M2** call `setEditingMetadata({})` in the batch re-read `catch`; **M3** in the batch `catch`, call `updateFileMetadata(path, {})` for every succeeded path; **M4** use the `'success'` type in the single `catch` toast; **M5** call `readMetadataBatch` also when `writeMetadataBatch` rejects. | M1s is killed by (l); M1b by (j)/(k); M2 by (j); M3 by the (j)/(k) store assertions; M4 by (l); M5 by (m). Report which test killed each. A survivor is a FAIL unless C shows it is equivalent. |
| R15-4 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome: 0 errors and at most 9 warnings, as on `a4ad852` (list any new one). Typecheck 0. Renderer **116 + new** (report the exact count). Main **76/76**. E2E **7/7**, and **7/7** with `--retries=0`. |
| R15-5 real app, rejected re-read | Built app (`npm run build`) from A's tree under `xvfb-run` with Playwright `_electron`. Put two valid WAVs (copies of the generated `tests/fixtures/sample.wav`) in a temp folder, Open Folder.<br>**Injection, in C's phase only:** `electronApp.evaluate(({ ipcMain }) => { ipcMain.removeHandler('meta:read-batch'); ipcMain.handle('meta:read-batch', () => { throw new Error('R15 injected'); }); })`. This changes only the running process and no source; record the exact snippet.<br>**Batch launch:** inject `meta:read-batch` after the scan, select both files, type Category `R15Batch`, click `Save to 2 files`.<br>**Single launch** (a fresh app launch on a fresh temp folder): inject the same way for `meta:read` after the scan, select one file, type Category `R15Single`, click `Save Tags`.<br>Take screenshots before and after each save. Read every file with `ffprobe -show_entries format_tags -of json` and with `music-metadata`. Finally, relaunch the app with no injection (or restore the original handler), open the same folder, and check the rows and the form. | The batch toast is exactly `Tags saved to 2 files, but reloading failed. Rescan to refresh.`, and the single toast is exactly `Tags saved, but reloading failed. Rescan to refresh.`. The rows keep their previous badge and values. The form still shows the typed value and Save stays enabled. ffprobe and music-metadata both show `ICAT=R15Batch` on both batch files and `ICAT=R15Single` on the single file. After the relaunch or restore, the rows and form show the new values.<br>**Red reference** on a build of `a4ad852` (worktree), same batch recipe: the toast is the raw `Error invoking remote method 'meta:read-batch'…` text, while ffprobe still shows `R15Batch` written.<br>Report which restore method was used. |
| R15-6 real app regressions | Same built app with no injection: (i) a batch save of 2 files; (ii) a single save; (iii) a batch with one file `chmod 000` (the D-22 recipe from R13) | (i) `Tags saved to 2 files`, and the form is cleared. (ii) `Tags saved`. (iii) `1 saved, 1 failed`, and the chmod row keeps `Tagged`. Every value is confirmed in ffprobe and music-metadata. |
| R15-7 docs | Read the `data-flow.md` and `STATE_MANAGEMENT.md` diffs against the code | Each describes D-24 as implemented: the exact toast texts, store untouched, edits kept, Rescan. The `data-flow.md` text is Georgian. No other section changed. |

## What could break (C re-checks)
- **D-21/D-22 batch paths:** tests (a)–(i) must still pass unchanged (R15-2). R15-6 (iii) covers the same in the real app.
- **Single save happy path and the sync effect:** after a normal single save the form shows the re-read values, and the next selection change shows no `Unsaved changes were discarded` toast. Test (e) and R15-6 (ii) cover this.
- **`isSaving`:** it must return to false on every path, or the Save button stays disabled. Tests (j)–(m) assert it.
- **Toast store:** one toast per save; the last `showToast` wins. Check that the catch does not show the D-24 text followed by a second generic toast.
- **Schema change:** `handleSchemaChanged` also calls `readMetadataBatch`. It must stay byte-identical (the R15-1 diff hunk check).

## What realVerified means here
- R15-1…R15-4 and R15-7 are real local checks.
- R15-5 is the real Electron UI with a real IPC rejection, produced by replacing the handler in the running main process. That is a harness manipulation; the source is unchanged. The file results are read with independent readers.
- R15-6 is the real UI with no injection.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
1. **RR-R5-02** (`file-row-display.ts` `typeof` guard) and **RR-R10-01/02 + A-R10-01** (E2E launch helper messages). One small round each, or paired if they turn out to be tightly related.
2. **Root:** please link the `Check` Actions run on `a4ad852`, or on any commit since `35ed18b`. A green run closes TM-T0-CI, TM-T0, TM-T0-CI-FU and the Actions part of TM-B14.
3. **Saba question batch:** every other backlog item waits on it.
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01, medium);
   - D-15 + RR-R5-01;
   - B-R7-02/RR-R8-04;
   - TM-B05;
   - TM-B06 (+ RR-R14-03/05);
   - RR-R1-07;
   - RR-R3-05;
   - TM-T2-DATA;
   - RR-R13-01/02 (protected preload types);
   - optional RR-R12-02.
