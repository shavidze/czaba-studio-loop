# CURRENT TASK — Round 19: TM-B22 — the Size and Date columns refresh after a confirmed save (C-R17-01) — D-28

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 18 result:** C PASS, realVerified=true (R18-1…R18-5), 0 bugs.
  - Red: 6 tests failed on `4f8a578`, all with `aStr.localeCompare is not a function`. Green: 36/36. Mutants M1–M5 were all killed.
  - Gate: 146/93/7. The real-app sort regression was checked with ffprobe and music-metadata.
  - Root published `d015470` with review COMMIT OK. TM-B21 and D-27 are done.
- No critical or high bug is open. TM-B22 is the next bug that can be reached in the real app, and it needs nothing from Saba.
- **Defect** (C-R17-01, seen in the real app in R17-5 and again in R18-5): after a save, the Size column keeps showing the size from the scan (86.2 KB) until a rescan or relaunch (87.6 KB). The Date column (`modifiedAt`) has the same cause, so it is the same bug.
- **B probe** (code reading on `d015470`):
  - `size` and `modifiedAt` are set only by `fs:scan-folder` (`src/main/ipc/file-system.ts:56-57`), through `setFiles` in `App.tsx` `openFolder` and in `FolderBrowser` open/rescan.
  - `meta:write` returns `void`, and `meta:write-batch` returns `{ succeeded, failed }`.
  - `src/preload/index.ts` and `index.d.ts` are protected. A new stat channel, or a changed return type, could not be typed in the renderer.
  - Every listed file sits under `folderPath`, because dropped files open their parent folder (`App.tsx:124-130`).
  - So `window.api.scanFolder(folderPath)` is the only source of fresh values the renderer can reach. Its cost is one recursive scan per save. This is recorded as B-R18-01, a Saba question about allowing a preload change.
- **Reference first:** this is a pure fix of stale data with no new UX, so the rule does not apply.

## Baseline
- HEAD `d015470cc28335494de993d951e4a8036869919c`, and the working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `d015470`): everything not in the ownership table, in particular:
  - `src/main/**`, `src/shared/types.ts` (`WavFileEntry` unchanged), `FileList.tsx`, `FolderBrowser.tsx`, `App.tsx`, `file-row-display.ts`, the other stores and components;
  - every test except the two owned files, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, every `.claude/**` file except the one owned primitive, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule (A-R17-02, still open)
- **Every repository write goes through the Edit or Write tool.** That means no `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, or a script that writes repository files. Gitignored build and test outputs from npm commands are the only exception.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `STATE_MANAGEMENT.md` and `.claude/prompts/new-store.md`.
- In `a-round-19.md`, state whether the hook fired and when you read each primitive.
- The `.claude/primitives/STATE_MANAGEMENT.md` edit uses the Edit tool (standing path (b) permission). If it is refused, stop that one step and report it. Do not use Bash.

## Scope (D-28, see `feature-status.md`)
Follow the `test-on-bugfix` rule: write the failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments.
- Tests: keep the files' existing double-quote style.
- No `any`, `@ts-ignore` or `as unknown as`, and no new `as` cast in `src/`. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-28)
1. **New file-store action** `updateFileStats: (entries: WavFileEntry[]) => void`. Add it to `FileState` and to the store.
   - For each existing entry in `files` whose `path` matches an entry in `entries`, replace `size` and `modifiedAt` with the new values. Keep `name` and `path` from the existing entry.
   - Entries whose path is not in `files` are ignored: never add, remove or reorder.
   - `selectedPaths`, `metadata`, `folderPath`, sort and search stay unchanged.
2. **`MetadataPanel.tsx` `handleSave`.** After a confirmed write and **before** the re-read:
   - read `useFileStore.getState().folderPath`;
   - if it is not `null`, `await window.api.scanFolder(folderPath)`;
   - keep only the entries whose path was written, and call `updateFileStats` with them.
   - **Single file:** the write resolved, so the written path is that one file.
   - **Batch:** the written paths are those not in `result.failed`, and the refresh runs only when `result.succeeded > 0`.
   - **No refresh** when the write rejects (single or batch), when every file failed, or when `folderPath` is `null`.
   - **Order:** write → refresh → re-read → today's logic. Because of this order, the D-24 path (write ok, re-read rejects) also refreshes. Keep the D-24 early `return` as it is.
   - A `scanFolder` rejection is **silent**: Size and Date keep their old values, and there is no extra toast. The toasts, `isDirty`, `modifiedFields`, `editingMetadata`, `skipSyncRef` and the store metadata end up exactly as they do today. The rejection must not reach the outer `catch`.
   - `setIsSaving(false)` still runs in `finally`.
   - The refresh is **not** a rescan. It does not set `isScanning`, does not stop the player, does not clear or change the selection, does not change `folderPath`, and does not call `setFiles` or `setMetadata`.
3. **Unchanged:**
   - main, preload and types;
   - `FileList.tsx`, including the `lastClickRef` reset. That reset already fires after every save today, because `useFilteredFiles` depends on `metadata`;
   - the rescan and open flows, and every toast text.
4. **`STATE_MANAGEMENT.md` `### Save flow`:** add one line inside the code block. Additions only:
   `File stats (D-28): after a confirmed write, before the re-read: scanFolder(folderPath) → updateFileStats(written paths only); scan reject silent; none if write rejects / all failed / folderPath null`.

### Tests (prescribed)
1. **`tests/renderer/stores/file-store.test.ts`** (additions only), new `describe("updateFileStats (TM-B22, D-28)")`:
   - **(s1)** Three files `a`, `b`, `c` (sizes 100, old dates). `updateFileStats([b with size 222 and a new date])` gives:
     - `b` with 222 and the new date;
     - `a` and `c` deep-equal to before;
     - the order still `a, b, c`.
   - **(s2)** An entry for an unknown path (`/music/new.wav`) is ignored: same length and same paths.
   - **(s3)** An entry with the matching path but a different `name` keeps the existing `name`.
   - **(s4)** `selectedPaths` and `metadata` are unchanged. Check `metadata` with `toBe` (same reference) and `selectedPaths` with `toEqual`.
   - **(s5)** `updateFileStats([])` leaves `files` deep-equal.
2. **`tests/renderer/components/metadata-panel-batch-save.test.ts`**:
   - Additions only, plus exactly **one added line** in the existing `beforeEach`: `vi.mocked(window.api.scanFolder).mockClear().mockResolvedValue([]);`. `vitest.config.renderer.ts` has no `mockReset`, so without this line a mock would leak between tests.
   - Reuse `seedFiles`, `seedTaggedFiles`, `mockBatchApi` and the `vi.hoisted` workaround. Set `useFileStore.setState({ folderPath: "/music" })` only inside the new tests.
   - Scan mock: `a.wav` with size 200 and `modifiedAt` `"2026-10-27T10:00:00.000Z"`, `b.wav` with size 300 and the same date, and an extra `/music/c.wav`.
   - New `describe("MetadataPanel refreshes Size and Date after a confirmed save (TM-B22, D-28)")`:
     - **(n)** Single save succeeds:
       - `scanFolder` is called once, with `"/music"`;
       - `a` has size 200 and the new date; `b` still has 100 and the old date;
       - `files.length === 2`, so `c` was not added;
       - the toast is `Tags saved`;
       - the call order is write → scan → read. Check it with `mock.invocationCallOrder`;
       - `selectedPaths` is still `[A]`, and `useFileStore.getState().isScanning === false`.
     - **(o)** Batch, all succeed: both files are updated, `selectedPaths` is still `[A, B]`, and the toast is `Tags saved to 2 files`.
     - **(p)** Batch, partial (`PARTIAL_FAILED`): `a` is updated, and `b` keeps 100 and the old date even though the scan returned 300.
     - **(q)** Batch, all failed: `scanFolder` is not called, both files are unchanged, and the edits are kept.
     - **(r)** Single write rejects: `scanFolder` is not called and the files are unchanged.
     - **(s)** Single write ok + `readMetadata` rejects (D-24): `a` is updated. The D-24 toast text, the kept edits and `isDirty === true` are unchanged.
     - **(t)** Batch partial + `readMetadataBatch` rejects (D-24): `a` is updated, `b` is not, and the D-24 toast is unchanged.
     - **(u)** `scanFolder` rejects on a single save. All of these hold:
       - the toast is `Tags saved`;
       - the store metadata is updated from the re-read as today;
       - `files` is unchanged;
       - `useMetadataStore.getState().isSaving === false`.
     - **(v)** `folderPath` is `null`: `scanFolder` is not called, and the save behaves as today.
     - **(w)** The scan result lacks the saved path: `a` keeps 100, and `files.length === 2`.
   - **Imports:** both test files already import every name these tests need (`vi`, `useFileStore`, `useMetadataStore`, `WavFileEntry`, `WavMetadata`), so no import change is expected. If one is really needed, the only change allowed is to extend an **existing** import line with more names, as in R18. Do not add a second line from the same module.
   - Existing tests (a)–(m) stay byte-identical and green. They leave `folderPath` `null`, so no refresh happens.
3. **Red run on `d015470`** (before the fix). Save the log in `a-round-19/`.
   - **Primary red** (the reproduced bug): (n), (o), (p), (s) and (t) fail. Typical message: `expected 100 to be 200`, or `scanFolder` not called. Record the exact messages.
   - (s1)–(s5) fail with `updateFileStats is not a function`. That is a missing API, not the bug.
   - Pins (q), (r), (u), (v) and (w) must already pass on `d015470`. Say so.
4. **Fix** the code per D-28.
5. **Primitive:** the one-line `STATE_MANAGEMENT.md` addition.
6. **`a-round-19.md`** (Georgian) contains:
   - the red and green logs and the diff;
   - the full `verifyCommand`;
   - `xvfb-run -a npx playwright test --retries=0`;
   - a `qa-engineer` read-only regression check (bugfix rule);
   - a `code-reviewer` read-only check (5 files changed);
   - the process statement.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/stores/file-store.ts` | new `updateFileStats` action (D-28) |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | refresh step in `handleSave` (D-28) |
| `tests/renderer/stores/file-store.test.ts` | tests (s1)–(s5), additions only |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | tests (n)–(w), additions plus the one `beforeEach` line |
| `.claude/primitives/STATE_MANAGEMENT.md` | one added line in `### Save flow` |

Logs go to `a-round-19/` (A) and `c-round-19/` (C) in the loop folder. Nothing else in the repository may be written, except the gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R19-1 ownership + process | Run `git status --porcelain --untracked-files=all` and `git diff --stat d015470`. Then run `git diff --quiet d015470 -- . ':!src/renderer/src/stores/file-store.ts' ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!tests/renderer/stores/file-store.test.ts' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!.claude/primitives/STATE_MANAGEMENT.md'`. Read the diff and A's result JSON. | All of these hold:<ul><li>Only the 5 owned paths differ, all `M`, with no untracked file.</li><li>`git diff d015470 -- tests/ .claude/ \| grep '^-[^-]'` is empty, so nothing was removed. The only allowed exception is an import line that comes back with the same names plus new ones (see Tests).</li><li>The test diff adds only the new describes and the one `beforeEach` line.</li><li>The src diff has no comment, no `any`/`@ts-ignore`/new `as` cast, and no new export besides the `updateFileStats` member of the store.</li><li>main, preload and types are untouched.</li><li>`permission_denials` is empty.</li></ul>Report what A's record shows about Bash writes. If the transcript is not available, say so (C-R12-01). |
| R19-2 red/green | Run `git worktree add --detach /tmp/c-r19-old d015470` with `node_modules` symlinked. Never use `git stash`. Copy A's two test files in and run `npx vitest run -c vitest.config.renderer.ts` on both files. Then run the same command on A's tree. | Old code: the primary red (n), (o), (p), (s), (t) fails with the bug, i.e. stale size/date or no scan. (s1)–(s5) fail as a missing API. (q), (r), (u), (v), (w) pass. Record names and messages. New code: everything passes, with the exact count. |
| R19-3 mutations | In a throwaway copy of A's tree, run the two test files once per mutant:<ul><li>**M1:** no refresh call.</li><li>**M2:** batch refreshes every selected path, including failed ones.</li><li>**M3:** the refresh is moved after a successful re-read, so the D-24 path skips it.</li><li>**M4:** `updateFileStats` replaces `files` with `entries`.</li><li>**M5:** the `scanFolder` rejection is not caught.</li><li>**M6:** only `size` is patched, `modifiedAt` is kept.</li><li>**M7:** batch refreshes even when `succeeded === 0`.</li></ul> | Each mutant is killed by at least one named test. Expected killers: M1 (n); M2 (p); M3 (s)/(t); M4 (s2)/(n) `files.length`; M5 (u); M6 (n)/(s1); M7 (q). A survivor is a FAIL unless C shows it is equivalent. |
| R19-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and 9 warnings, the same file/rule list as on `d015470`.</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **146 + new** (exact count; 10 files).</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R19-5 real app | Use the built app (A's tree), Playwright `_electron` under `xvfb-run`, driven through the UI only (the folder dialog may be stubbed). Copy `tests/fixtures/sample.wav` into a temp folder as `a.wav`, `b.wav`, `c.wav`, run `touch -d '2020-01-02 12:00:00'` on all three, then scan. Record the Size and Date cells.<ol><li>Select `a.wav` and set Category `R19Single` and a Comment of 300 characters, so the size crosses a 0.1 KB step. Save.</li><li>Ctrl-click to select `b.wav` + `c.wav`, set Genre `R19 Batch`, and save. The toast is `Tags saved to 2 files`.</li><li>Run `chmod 444 c.wav`, select `b.wav` + `c.wav`, set Category `R19Partial`, and save. The toast reports 1 saved and 1 failed. If `chmod 444` does not make the write fail (for example, if the library writes through a temp file and a rename), use `chmod 000` as in R15 and record which one worked. With `000` the re-read of `c` also fails (the D-22 path). The check that `c`'s cells are unchanged holds either way.</li><li>Click the `Size` header.</li><li>Read the files with `music-metadata` and `ffprobe -show_entries format_tags -of json`.</li><li>Relaunch and rescan.</li><li>Observation: on a folder with 200 copies of `sample.wav`, time one single-file save from the click to the toast. Optionally compare with a `d015470` build.</li></ol>Take a screenshot after each step. | All of these hold:<ul><li>After (1), `a.wav`'s Size cell equals `formatFileSize(fs.statSync(a).size)` (the rule in `lib/utils.ts`) and differs from the pre-save text.</li><li>After (1), `a.wav`'s Date cell equals the app's `new Date(mtime).toLocaleDateString()`, computed in the page from `fs.stat`, and is no longer the 2020 date. `b` and `c` are unchanged.</li><li>The selection and the editor values stay on `a`, with no `Unsaved changes` toast.</li><li>After (2), `b` and `c` match their stat values, `a` keeps its value from step (1), and the selection count is 2.</li><li>After (3), `b` matches its new stat. `c` keeps the cells from step (2), and its stat is unchanged.</li><li>(4) The row order matches ascending stat sizes. Ties are allowed.</li><li>(5) Hard checks: ffprobe and music-metadata `ICAT` = `R19Single` on `a` and `R19Partial` on `b`; `IGNR` = `R19 Batch` on `b` and `c`. `c`'s ICAT is unchanged. Comment and artists are record only.</li><li>(6) After relaunch, every Size and Date cell equals what was shown before the relaunch.</li><li>`pageErrors` is empty in every phase.</li><li>(7) The timing is recorded (B-R18-01). It is never a FAIL criterion.</li></ul> |

## What could break (C re-checks)
- **D-21/D-22/D-24 save outcomes:** toasts, kept edits, `isDirty`, `skipSyncRef`, and failed-file store entries. Covered by existing tests (a)–(m), byte-identical and green, and by the new (s), (t) and (u).
- **Selection and editor after a save:** a `files` update changes the identity of `useSelectedFiles`. Selection count, editor contents and `isDirty` must stay unchanged, and the sync effect must not fire an `Unsaved changes` toast (R19-5 (1)(2)).
- **Shift-click after a save:** it still selects a range in the sorted order. The `lastClickRef` reset behaviour is unchanged from today.
- **Size and Date sort** follow the new values (R19-5 (4)).
- **Folder rescan and open** still replace `files` fully. These paths are untouched.
- **Large folders:** one extra recursive scan per save (R19-5 (7), B-R18-01).

## What realVerified means here
- R19-1…R19-4 are real local checks.
- R19-5 is the real-app proof of the fix, checked against `fs.stat` and independent tag readers.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
1. **MetadataPanel polish:**
   - RR-R13-02 + RR-R15-02: remove the `as WavMetadata` casts;
   - RR-R15-01: the re-read reason, which needs a D-24 amendment (Saba).
2. **Optional E2E close-helper hardening:** RR-R16-03 + A-R16-01.
3. **Root:**
   - link a `Check` Actions run on `d015470` (or any commit since `35ed18b`);
   - check the read-primitives hook installation (A-R17-02; it did not fire in R18 either).
4. **Saba question batch:** see `b-round-18.md`. It adds B-R18-01, a dedicated stat channel, which is a preload change.
