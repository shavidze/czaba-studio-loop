# CURRENT TASK — Round 43: TM-B44 — the save's Size/Date refresh stats only the written files through a narrow `fs:stat-files` IPC instead of rescanning the whole folder (D-48, Saba Q8)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 42: C PASS** (R42-1…R42-7, realVerified=true), published `cf4e147`, review COMMIT OK. TM-T1-DUP is done and RR-R3-01 is closed (D-47 verified).
  - C found one low bug, **C-R42-01**: B's own Mp3tag reference text in `docs/bugs/001` entry 23 is not backed by the cited sources. B re-fetched both sources on 2026-10-28 and confirms this. The correction is a small docs touch in this round (Scope C).
  - No critical or high bug is open.
- **This round = Saba's Q8, next in Saba's order (Q2 → Q8 → Q4/Q1 → Q5 → Q3 → Q6).** It fixes the open **medium** finding **RR-R19-01** (with B-R18-01), now backlog item **TM-B44**.
  - **The problem (code read at `cf4e147`):** `refreshSavedFileStats` (`MetadataPanel.tsx:75-85`) calls `window.api.scanFolder(folderPath)` after every confirmed write. That call walks the whole folder recursively (`file-system.ts:16-66`, depth 20, one `stat` per WAV, no timeout). `handleSave` awaits it while `isSaving` is true (`:155`, `:186`), and only then re-reads. Saving one file in a folder with thousands of WAVs, or on a network drive, therefore pays for a full rescan.
  - **Saba's Q8:** permission to change `src/preload/index.ts` and `src/preload/index.d.ts` **only** to add the narrow `fs:stat-files` channel. The round lists the exact diff, and C checks that nothing else changed.
- This is a logic fix (IPC handler + save flow), so `test-on-bugfix` applies: the failing tests come first.
- **Reference-first:** exempt. This is a pure fix with no visible UX change: the same columns update at the same moment, only faster. C checks that nothing visible changed (R43-4, R43-6).

## Baseline
- HEAD `cf4e147d2516a549b4a8c6ae7eebbf65c51a6e42`. The working tree is clean (`git status --porcelain --untracked-files=all` is empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `cf4e147` that changes only the two `version` fields counts as the baseline.
- **Frozen:** every path not listed under File ownership. These stay byte-identical to `cf4e147`. In particular:
  - `src/main/index.ts`, `src/main/ipc/metadata.ts`, `schema.ts`, `templates.ts`;
  - `src/shared/types.ts`, `src/renderer/src/stores/**`, `src/renderer/src/lib/**`, `src/renderer/src/App.tsx`, `src/renderer/src/components/sidebar/**`, `src/renderer/src/components/schema/**`;
  - every `tests/**` file not listed below; `playwright.config.ts`, `vitest.config.*`, `biome.json`, `tsconfig*.json`, `.github/**`;
  - `docs/**` except the one owned file; `.claude/**` except the two owned primitives.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.
- **Protected, with this round's one exception (Saba Q8):** `src/preload/index.ts` and `src/preload/index.d.ts`. Only the exact additions in Scope A3 are allowed. No other line changes, including whitespace and the `console.log` lines.

## Scope

### A. `fs:stat-files` (D-48)
**Step 0 (test first, `test-on-bugfix`):**
- Write the new and flipped tests (Scope B) first.
- Run them on unchanged `src/` and record the red output in `a-round-43.md`.
- Then make the fix.

**A1. `src/main/ipc/channels.ts`** — add exactly one line, directly after `SCAN_FOLDER: 'fs:scan-folder',`:
```ts
  STAT_FILES: 'fs:stat-files',
```

**A2. `src/main/ipc/file-system.ts`** — register `ipcMain.handle(IPC_CHANNELS.STAT_FILES, …)` inside `registerFileSystemHandlers`, after the `SCAN_FOLDER` handler.
- **Input:** the argument must be an array with at most 50 elements (module-private constant, e.g. `MAX_STAT_FILES_PATHS = 50`, per `ELECTRON_IPC.md` "Max 50 files per IPC call"), and every element must be a non-empty `string`. Anything else throws `new Error('Invalid paths')`. That covers a non-array, a 51-element array, `['']` and `[5]`. An empty array is valid and returns `[]`.
- **Per path, in input order:** `stat(path)`. When `isFile()` and `extname(path).toLowerCase() === '.wav'`, push `{ name: basename(path), path, size: s.size, modifiedAt: s.mtime.toISOString() }`. `path` is the input string, unchanged, so it matches the file list's `path` exactly.
- **Skipped silently:** a stat error (ENOENT, EACCES, …), a directory, or a non-`.wav` file. A skipped path does not affect the other paths. Duplicates are returned as given.
- **Return type:** the file's existing local `WavFileEntry[]`.
- **Rules:** no code comments. Keep the existing comments in the file untouched; they are not yours to remove. Follow `ELECTRON_IPC.md`, `TYPESCRIPT_STRICT.md` (no `any`; the handler parameter is `unknown` and is narrowed by a type guard) and `AGENT_DISCOVERABLE_CODE.md`. Biome must report 0 errors and no new warnings (the baseline has 8).
  - If an empty `catch {}` is flagged, use a small private helper that returns `null` on error.
- `scanFolderRecursive` and every other handler stay unchanged.

**A3. Preload (Saba Q8 exception), the exact additions and nothing else.**
- `src/preload/index.ts`: insert this block directly after the `scanFolder` member (after the line `  > => ipcRenderer.invoke(IPC_CHANNELS.SCAN_FOLDER, path),` and its following blank line), so a blank line separates it from `loadSchema`:
```ts
  statFiles: (
    paths: string[],
  ): Promise<
    Array<{
      name: string;
      path: string;
      size: number;
      modifiedAt: string;
    }>
  > => ipcRenderer.invoke(IPC_CHANNELS.STAT_FILES, paths),

```
- `src/preload/index.d.ts`: insert this one line directly after `  scanFolder: (path: string) => Promise<WavFileEntry[]>;`:
```ts
  statFiles: (paths: string[]) => Promise<WavFileEntry[]>;
```
- Expected `git diff --numstat cf4e147 -- src/preload`: `11 0 src/preload/index.ts` (10 code lines + 1 blank) and `1 0 src/preload/index.d.ts`. If Biome's formatter insists on a different layout for these added lines only, apply exactly what `npx biome format` prints for them. Record the before/after in `a-round-43.md`. Zero `-` lines is still required.

**A4. `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`** — change `refreshSavedFileStats` only:
- Keep `if (folderPath === null) return;` (D-28 rule: no refresh without an open folder; test (v)).
- Replace the `scanFolder` call: send `writtenPaths` to `window.api.statFiles` in chunks of 50 (module-private constant, e.g. `STAT_FILES_CHUNK_SIZE = 50`), **one chunk after another**, awaiting each.
- For each resolved chunk, call `updateFileStats` with the returned entries whose `path` is in that chunk (the same filter as today's `written` set).
- A rejected chunk is skipped silently, and the following chunks still run.
- The function still resolves only after the last chunk, so the order **write → markPathsWritten → stats refresh → re-read** is unchanged.
- **Unchanged:**
  - every caller (`:155`, `:184-187`): single refreshes `[path]`; batch refreshes `writtenPaths` only when `result.succeeded > 0`; no refresh when the write rejects;
  - D-22/D-24/D-29/D-30/D-33/D-34/D-39 behaviour, toasts, `isDirty`, edits;
  - every other function in the file.
- No comments, semicolons, no `any`.

**Not in this round:**
- changing Open Folder / Rescan / drop (they keep `scanFolder`);
- a non-awaited refresh after the toast;
- returning stats from the write IPCs;
- any `writeMetadataBatch` chunking (its single-call batch is pre-existing);
- Q4/Q5/Q3/Q6 work; RR-R42-01..04 signals.

### B. Tests
**B1. `tests/main/file-system.test.ts`** — a new `describe("fs:stat-files (TM-B44, D-48)")` using the file's `getHandler` pattern. Add its own fixtures (e.g. a `stat` subfolder with `UPPER.WAV`, a `dir.wav` directory and a `.txt` file) in a nested `beforeAll`. Existing tests stay byte-identical.
- **(m1)** `[test1.wav, sub/nested.wav]` → two entries in input order. `name` = basename, `path` = input string, and `size`/`modifiedAt` equal `statSync(p).size` / `statSync(p).mtime.toISOString()`.
- **(m2)** a missing path between two existing ones → only the two existing, in order.
- **(m3)** `dir.wav` (a directory), `not-a-wav.txt` → omitted; `UPPER.WAV` → included.
- **(m4)** `[]` → `[]`.
- **(m5)** `"x"`, `null`, `[""]`, `[5]`, and 51 copies of an existing path → each rejects with `Invalid paths`. 50 copies → resolves with 50 entries.

**B2. `tests/renderer/components/metadata-panel-batch-save.test.ts`**, only the `describe("MetadataPanel refreshes Size and Date after a confirmed save (TM-B22, D-28)")` block. Retitle it `(TM-B22, D-28, D-48)`. The other describes stay byte-identical.
- **Flip (n)–(w) from `scanFolder` to `statFiles`.** Each test asserts `window.api.scanFolder` is **not** called during the save.
  - (n) `statFiles` called once with `[PATH_A]`; order write → stat → read.
  - (o) once with `[PATH_A, PATH_B]`; order write → stat → read.
  - (p) once with `[PATH_A]` only (the failed path is not sent).
  - (q)/(r) not called.
  - (s)/(t) as today, with `statFiles`.
  - (u) `statFiles` rejects → silent, toast and store as today.
  - (v) `folderPath` null → neither `statFiles` nor `scanFolder` called.
  - (w) the result lacks the saved path → stats unchanged.
  - Keep each test's existing assertions on toasts, edits and selection.
- The top-level `seedFiles` seeds only `FILE_A`/`FILE_B` and stays unchanged. For (x)/(y), define a local helper **inside the D-28 describe** that seeds N files (`files`, `selectedPaths`, `folderPath`) and mocks the batch write/read for them. Top-level helpers are not edited.
- **New (x):** batch of 51 seeded files, all succeed → `statFiles` called twice, with the first 50 and then the last 1 path (in selection order), the second call after the first resolved. All 51 rows refreshed; the re-read is called after the second stat call; toast `Tags saved to 51 files`.
- **New (y):** the same 51 files, the first `statFiles` call rejects → the 51st row is refreshed, the first 50 keep their stats, and the success toast is unchanged.
- **New (z):** single save, `statFiles` resolves with `[SCANNED_A, SCANNED_B]` (B was not written) → A refreshed, B not.
- **Red on baseline `src/`:** (n), (o), (p), (s), (t), (x), (y) and (z) must fail. On the baseline `statFiles` is never called, and the reset `scanFolder` mock resolves `[]`. (q), (r), (u), (v) and (w) may pass on the baseline; they pin rules that stay.

**B3. Test infrastructure, the exact one-line additions** (needed because `Window["api"]` gains a required member and `npm run typecheck` covers `tests/**`):
- `tests/renderer/setup.ts`: add `  statFiles: vi.fn().mockResolvedValue([]),` directly after the `scanFolder` line of `mockApi`. Nothing else in this file changes; the window workaround (A-R3-01) stays as is. Expected numstat `1 0`.
- `tests/renderer/helpers/window-api-mocks.ts`: add `  vi.mocked(window.api.statFiles).mockReset().mockResolvedValue([]);` directly after the `scanFolder` line. Expected numstat `1 0`.
- `tests/e2e/app-launch.spec.ts`: add `  expect(methods).toContain("statFiles");` directly after `expect(methods).toContain("scanFolder");`. Expected numstat `1 0`.
- If any other existing renderer test fails because a save no longer calls `scanFolder`, **stop and report** the test name to B. Do not edit unowned tests.

### C. Docs
- `.claude/primitives/STATE_MANAGEMENT.md` (standing `.claude/**` permission; Edit tool only): replace the `File stats (D-28): …` line in `### Save flow` with:
  `File stats (D-28, D-48): after a confirmed write, before the re-read: statFiles(written paths, chunks of 50, sequential) → updateFileStats(entries of that chunk); a rejected chunk is skipped silently; none if write rejects / all failed / folderPath null; scanFolder only for Open Folder, Rescan, drop`
- `.claude/primitives/ELECTRON_IPC.md`, `## Input Validation (main process)`: add one bullet after the `SCAN_FOLDER` bullet:
  `- STAT_FILES: array of ≤ 50 non-empty strings, else "Invalid paths"; only regular .wav files are returned, other paths are skipped`
- `docs/bugs/001-save-and-selection-known-limits.md`, entry `## 23.` only (C-R42-01). Change no other line, including the README counts (they stay 23/14).
  - In `**Reference:**`, replace the text from `standard frame-ის სახელის მქონე custom ველი ყოველთვის standard frame-ში ინახება — ერთ სახელს ერთი slot აქვს (community დაკვირვება, არა ოფიციალური docs).` with:
    `thread-ში წერია, რომ custom ველები, რომლებიც Mp3tag-ის ველების სიაში არ არის, user-defined TXXX frame-ად ინახება; mapping docs თითო ველისთვის აჩვენებს, რომელ frame-ში ან RIFF INFO chunk-ში იწერება ის, და ამბობს, რომ user-defined mapping-ით ეს შეიძლება შეიცვალოს. რა ხდება, როცა custom ველის სახელი standard ველის სახელს ემთხვევა, არც ერთი წყარო არ ამბობს. „ერთ სახელს ერთი slot აქვს“ B-ის დაუდასტურებელი დასკვნაა (C-R42-01, B-მ 2026-10-28-ს ხელახლა შეამოწმა).`
  - In `**Deviations:**`, replace `(1) Mp3tag ჩუმად აერთიანებს standard slot-ში; აქ toggle იმალება და warning ჩანს (Q2):` with:
    `(1) Mp3tag-ის ქცევა same-name შემთხვევაში დაუდასტურებელია (იხ. Reference); აქ toggle იმალება და warning ჩანს (Q2):`
  - The rest of the sentence stays.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/channels.ts` | A1, one line |
| `src/main/ipc/file-system.ts` | A2 handler |
| `src/preload/index.ts` | A3, Saba Q8, exact block only |
| `src/preload/index.d.ts` | A3, Saba Q8, one line only |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | A4, `refreshSavedFileStats` only |
| `tests/main/file-system.test.ts` | B1, additions only |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | B2, the D-28 describe only |
| `tests/renderer/setup.ts` | B3, one line |
| `tests/renderer/helpers/window-api-mocks.ts` | B3, one line |
| `tests/e2e/app-launch.spec.ts` | B3, one line |
| `.claude/primitives/STATE_MANAGEMENT.md` | C, one line replaced |
| `.claude/primitives/ELECTRON_IPC.md` | C, one bullet |
| `docs/bugs/001-save-and-selection-known-limits.md` | C, entry 23 Reference + Deviation (1) only |

A writes only `a-round-43.md` (and `a-round-43/` logs) in the loop folder. C writes `c-round-43.md`/`.json` and evidence under `c-round-43/`. Repository writes go through Edit/Write only (rule from round 18).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R43-1 ownership + preload | `git diff --name-only cf4e147`, `git status --porcelain --untracked-files=all`, `git diff --numstat cf4e147`, and `git diff cf4e147 -- src/preload` | Only owned paths changed. `src/preload/*`: zero `-` lines, and the `+` lines are byte-equal to the A3 blocks (or the Biome layout A recorded, same tokens). `setup.ts`, `window-api-mocks.ts`, `app-launch.spec.ts` and `channels.ts`: `1 0` with exactly the stated line. In `metadata-panel-batch-save.test.ts`, only the D-28 describe changed (`git diff` hunks inside it). Frozen and protected paths pass `git diff --quiet cf4e147 -- <path>`. No comments added in `src/`. |
| R43-2 tests + code | `npm run test:main`, `npm run test:renderer`; read the diff | (m1)–(m5) and the flipped (n)–(w) plus (x), (y), (z) exist and pass. Main validation, the skip rules, input order and `path` identity follow A2. `refreshSavedFileStats` chunks by 50, runs the chunks one after another, skips a rejected chunk, and keeps the `folderPath === null` guard. Every caller line is unchanged. `scanFolderRecursive` is unchanged. |
| R43-3 red proof | `git worktree` (or `git archive`) of `cf4e147` with A's B1/B2/B3 test files copied in; run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts` and the main file-system test | Renderer (n), (o), (p), (s), (t), (x), (y), (z) fail on the baseline (`scanFolder` called / `statFiles` not called) and pass on A's tree. Main (m1)–(m5) fail on the baseline with `No handler for channel: fs:stat-files`. That is a structural red, recorded but not the meaningful one. Log both runs. |
| R43-4 real app, correctness | Built app via Playwright `_electron` under `xvfb-run`, `XDG_CONFIG_HOME` temp. Fixture folder with one WAV in a subfolder. **(a)** select one top-level WAV, note its Size/Date cells, type `DOORWood` in Category, Save Tags. **(b)** select the nested WAV, same save. **(c)** select 3 WAVs, set Keywords `door, slam`, `Save to 3 files`. | (a)–(c): after the toast, each saved row's Size cell = `formatFileSize(fs.statSync(p).size)`, and its Date reflects the new mtime (screenshots before/after). Unsaved rows are unchanged. Independent readers on every saved file: `music-metadata` + `ffprobe -show_entries format_tags -of json` + raw INFO parse show `ICAT=DOORWood` ((a), (b)) and `IKEY=door, slam` ((c)), field by field. `pageErrors` is empty. |
| R43-5 real app, IPC + speed | **(a)** In the built app, `page.evaluate` → `window.api.statFiles([existing, missing, dir.wav dir, x.txt, UPPER.WAV])` and `statFiles(51 paths)`, `statFiles("x")`. `Object.keys(window.api).sort()` on both builds. **(b)** Build `cf4e147` in its own worktree (`node_modules` symlinked). Generate a nested tree of ≥ 5000 small valid WAVs (e.g. 50 dirs × 100, depth ≤ 3, copies of one ffmpeg-made 0.1 s WAV). On both builds open the tree, then: median of 5 `window.api.scanFolder(root)` timings (T_scan), and the median click→`Tags saved` toast time of 5 single saves of one file (alternating values). | (a) Entries for existing/`UPPER.WAV` match `fs.statSync` (size, mtime ISO, `name`, identical `path`); missing, dir and txt are absent; 51 paths and `"x"` reject with `Invalid paths`. The key list = the baseline list + `statFiles`. (b) Record T_scan, T_base and T_new. PASS when T_new < T_base and T_base − T_new ≥ 0.5 × T_scan. If T_scan < 150 ms, grow the tree (e.g. 15000 files) until T_scan ≥ 150 ms, and say so. Size/Date update in the big tree too (one screenshot). |
| R43-6 regression | Same harness | Rescan still lists a WAV copied into the open folder after the first load, and Open Folder/drop are unchanged (scanFolder still serves them). A batch save of 2 files where one was made unwritable after the scan (`chmod 000`, the TM-B16 fixture) gives the `1 saved, 1 failed` toast as before, and only the written row's Size changes. The D-07/D-47 schema behaviour is untouched (frozen files). |
| R43-7 docs | Read the 3 doc files | The `STATE_MANAGEMENT.md` line and the `ELECTRON_IPC.md` bullet equal the Scope C text. 001 entry 23 has the corrected Reference and Deviation (1) text, and `git diff` of 001 touches only those two lines. README counts unchanged (C counts 23 `## N.` / 14 `გასწორდა`). C re-reads both Mp3tag URLs and confirms that the new text claims nothing the sources do not say. |
| R43-8 gate | Clean `verifyCommand` (`{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`), plus `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer count = 317 + the new tests (x, y, z); main count = 93 + the new tests; E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **D-28 rules:** no refresh on a write reject, on a batch with 0 succeeded, or with no folder; only written rows change; no row is added or removed (`updateFileStats` is frozen).
- **D-34/D-39:** `markPathsWritten` still runs before the refresh; `isListedPath` and the re-read guards are unchanged (the existing renderer suites stay green).
- **Other renderer suites** that save with a folder open (`folder-read-during-save`, `reread-after-folder-switch`, …) used to get stats from the `scanFolder` mock. They must stay green without edits; if one does not, A stops (B3).
- **Shift-click anchor (D-31, file-list (z2))** after a stats refresh.
- **E2E `app-launch` method list** and the IPC write E2E.
- **Security:** the new handler accepts only strings, at most 50, and returns data only for `.wav` regular files.

## Next (orientation only, Saba's order)
1. **Q4 → TM-B11 / D-10:** skip empty text and unset numbers, and keep a meaningful `0`. T1-10 must flip (B-R42-02).
2. **Q5 → TM-B05:** a per-file error "audio data is empty, cannot tag", with a test.
3. **Q3 → TM-B08:** docs/test pin only (D-12 decided).
4. **Q6 → TM-B06:** Biome over `tests/**` with a relaxed override.
5. **Q7 → TM-T2-DATA → TM-T2:** still waiting on Saba's UCS list and licence.
6. **Open for Saba:**
   - Q9–Q17;
   - Q18 (B-R42-01; new fact from R42-6: Hide (X) on the standard Category also removes the custom `category` field definition);
   - Q19 (confirm D-47's generalisation to all 13 standard fields, RR-R42-03).
