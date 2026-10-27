# CURRENT TASK — Round 28: TM-B30 — stale folder read overwrites a save (D-35): Rescan / Open Folder / drop during a pending save

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 27: C PASS** (R27-1…R27-6, realVerified=true, 0 bugs). TM-B29 (D-34) is **done** on `6c956b4`. Root's gate was skipped ("no real changes") because the code had already been published, so the baseline stays `6c956b4`.
- **No critical or high bug is open.** The open medium items are:
  - TM-T1-DUP/RR-R3-01 and RR-R19-01: both wait on Saba's question batch;
  - B-R26-01: belongs to root.
- **Next dependency-ordered item: B-R25-01**, the follow-up that round 27's "Next" named.
  - B reproduced it red at component level on `6c956b4` in a throwaway copy (`b-round-27-exp/`, see `b-round-27.md` §3).
  - Setup: Category typed and `Save Tags` clicked; while the write is pending, the user clicks **Rescan**, opens **the same folder**, or **drops it**.
  - The folder read reads the file before the write resolves. `setMetadata(meta)` runs after the last chunk and replaces the save's re-read, so the store keeps `ACat` where `R28Cat` was saved.
  - Rescan clears the selection, so the form is not hit at once. Selecting the file again shows the stale entry. A second save then writes the old value back to disk. This is the same data-loss class as TM-B29, so the severity goes from low to **medium**. The fix is the new item **TM-B30**.
  - Reachability in production: `meta:write-batch` yields every 5 files and `meta:read-batch` every 10 (`src/main/ipc/metadata.ts:243,289`), and a folder with more than 50 files is read in several chunks. A batch save combined with a rescan therefore interleaves without any delay. A single write is synchronous in main, so the single case is reachable only with a delay; the harness provides one.
- **Reference-first rule:** exempt. This is a pure bug fix with no UX change. The UX alternative (disabling Rescan / Open Folder / drop while a save runs) is **not** taken. Like D-34, which chose a guard over locking the schema editor, it stays a Saba option (B-R27-02).

## Baseline
- HEAD must be `6c956b41dee3580d01c6285c9c7c3e1c8495101c` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `6c956b4` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `6c956b4`): every path not listed under File ownership. In particular:
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` (D-34, verified in R27);
  - `tests/renderer/components/metadata-panel-schema-change.test.ts`;
  - `tests/renderer/components/metadata-panel-batch-save.test.ts`;
  - `tests/renderer/helpers/reset-stores.ts` (no new state, so no new reset line);
  - `tests/renderer/helpers/window-api-mocks.ts`;
  - `tests/renderer/setup.ts`;
  - all of `src/main/**`;
  - `src/renderer/src/types/**`.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `prompts/new-store.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`.

## Scope (D-35, renderer only)

### Part A — `src/renderer/src/lib/utils.ts`
- Change the signature to `readMetadataChunked(paths, schema, getWriteGeneration: () => number)`. The new parameter is **required**, so a caller cannot forget it; `tsc` enforces this.
- Before each chunk's `window.api.readMetadataBatch` call, call `getWriteGeneration()` once.
- Add `readGenerations: Record<string, number>` to the return value. For every path in that chunk's **result**, it holds the generation taken for that chunk.
- A rejected chunk adds nothing to `readGenerations`, and its handling is unchanged: `failures += chunk.length`, and its paths stay absent from `data` (B-R27-01 is out of scope).
- `data` and `failures` are unchanged.
- `lib/utils.ts` must **not** import any store. The lib stays store-free; this is the layering decision of D-35.

### Part B — `src/renderer/src/stores/file-store.ts`
- Add a new action `applyMetadataRead(read: Record<string, WavMetadata>, readGenerations: Record<string, number>) => void`. Declare it in `FileState` next to `markPathsWritten`. Add no new state.
- It **replaces** `metadata`, like `setMetadata`: a path that is not in `read` is not in the result.
- For each `[path, meta]` of `read`:
  - if `(state.pathWriteGenerations[path] ?? 0) > (readGenerations[path] ?? 0)`, the path is **superseded**. It gets `state.metadata[path]` as it is at that moment, or is absent if that entry does not exist;
  - otherwise it gets `meta`.
- It does not change `writeGeneration`, `pathWriteGenerations`, `files`, `selectedPaths` or anything else.
- Name: `applyMetadataRead` (grep-friendly, AGENT_DISCOVERABLE_CODE).

### Part C — callers (success path only)
- `src/renderer/src/components/sidebar/FolderBrowser.tsx` `handleOpenFolder` (`:111-112`) and `handleRescan` (`:147-148`), and `src/renderer/src/App.tsx` `openFolder` (`:63-64`):
  - call `readMetadataChunked(paths, currentSchema, () => useFileStore.getState().writeGeneration)`;
  - replace `setMetadata(meta as Record<string, WavMetadata>)` with `useFileStore.getState().applyMetadataRead(meta as Record<string, WavMetadata>, readGenerations)`, or use a selector-bound `applyMetadataRead` and add it to the `useCallback` deps.
  - The cast stays, as B-R21-03 records.
- These stay unchanged:
  - the error paths (`setMetadata({})` at FolderBrowser `:119`, App `:71`);
  - the empty-folder branch `setMetadata({})` (`:150`);
  - `handleCloseFolder` (`:128`);
  - the `clearSelection()` calls;
  - toasts;
  - `isScanning`.
- Biome will reformat the longer call lines; run `npm run lint:fix` or format by hand. The warning count must stay **8**, with the same list.

### Part D — tests first (red on `6c956b4` src, then green)

**New file `tests/renderer/components/folder-read-during-save.test.ts`:**
- Render `FolderBrowser` and `MetadataPanel` together (`createElement(Fragment, …)`). For (r6), render `App`.
- Use the same `vi.hoisted` window swap, `resetAllStores()` and `resetWindowApiMocks()` as the schema-change file.
- `resetWindowApiMocks` does not reset `openFolderDialog`, `loadSchema` or `resolveDroppedPaths`. Reset and default them **locally** in this file's `beforeEach`.
- Seed: `folderPath: '/music'`, files `a.wav` and `b.wav`, old Category `ACat`/`BCat`. The saved value is `R28Cat`.
- Use deferred promises for the write and for the folder read so that the order is explicit.
- B's experiment files in `b-round-27-exp/` (`b-r28-rescan.test.ts`, `b-r28-app.test.ts`) are a starting point, not a spec. Drop x1's stray `getByText('a.wav')` click; FileList is not rendered there.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (r1) | single save of a pending → Rescan → the rescan's `readMetadataBatch` is issued before the write resolves → release the write (save re-read gives `R28Cat`) → resolve the rescan read with the old data | the store `metadata[a]` equals the saved entry. Then `setSelectedPaths([a])` (in `act`): the Category input shows `R28Cat` | **red** |
| (r2) | batch save of a+b pending → Rescan (read deferred) → release the write (`succeeded: 2`), batch re-read gives the new values → resolve the rescan read with the old data | `metadata[a]` and `metadata[b]` both have `R28Cat` | **red** |
| (r3) | single save pending → `Open Folder` with `openFolderDialog` → `'/music'` (same folder) → same order as (r1) | store keeps `R28Cat` for a | **red** |
| (r4) pin | save completes (write, mark, re-read applied) → **then** Rescan; the file changed outside and the read returns `ExtCat` | `metadata[a].category` = `ExtCat`: equal generations apply. This is the realistic `>=` killer | green |
| (r5) pin | no save; Rescan, and `scanFolder` now returns only a.wav | `metadata` has exactly the key a (b is gone: replace, not merge); selection is empty | green |
| (r6) | `App`; `loadSchema` → `STANDARD_FIELDS`; drop `/music` (`resolveDroppedPaths` → `{ folders: ['/music'] }`), click `a.wav`, type Category, `Save Tags` (write deferred), drop `/music` again with its read deferred, release the write, resolve the read with the old data | store keeps `R28Cat` for a | **red** |
| (r7) | 51 files (a = first path, chunk 1); single save of a pending → Rescan; chunk 1 is issued before the write resolves and is resolved after the save's re-read; chunk 2 is read after | a keeps `R28Cat`; the chunk-2 file gets its read value; `readMetadataBatch` was called for 2 rescan chunks | **red** |
| (r8) pin | 51 files, save of the **chunk-2** file z pending, `readMetadata` (re-read) **rejects** (D-24 toast); Rescan is clicked during the write, chunk 1 is pending while the write resolves, chunk 2 is issued after the mark and reads `R28Cat` | `metadata[z].category` = `R28Cat` (a read issued after the write applies). This kills "generation read once before the loop" at component level | green |

**In existing files (additions only; existing tests byte-identical):**

| Test | File | Assert | Baseline |
|---|---|---|---|
| (g2) | `tests/renderer/stores/file-store.test.ts`, new `describe("applyMetadataRead (TM-B30, D-35)")` | state `metadata {a: A0, c: C0}`, `pathWriteGenerations {a: 2, b: 2, e: 2}`; `read {a: A1, b: B1, d: D1, e: E1}`, `readGenerations {a: 1, b: 1, d: 1, e: 2}` → `metadata` equals `{a: A0, d: D1, e: E1}`: a superseded and kept, b superseded with no entry so absent, c dropped, e equal so applied. `writeGeneration`, `pathWriteGenerations`, `files` and `selectedPaths` are unchanged | **red** (runtime: not a function) |
| (u1) | `tests/renderer/utils/utils.test.ts`, new `describe("readMetadataChunked (TM-B30, D-35)")` | 101 paths, 3 chunks. `getWriteGeneration` returns a counter that the chunk-1 `readMetadataBatch` mock increments, and chunk 2 **rejects**. Expect: chunk-1 paths have generation 0, chunk-3 paths have 1, chunk-2 paths are absent from `readGenerations` and `data`, `failures === 50`, `getWriteGeneration` called 3 times, `readMetadataBatch` called 3 times with 50/50/1 paths | **red** |

- **One `it` per row.** (g2) and (u1) are each exactly **one** `it` inside their new `describe`, and (r1)–(r8) are one `it` each. The expected renderer total after the round is therefore 216 + 10 = **226**, in **12** files.
- **Chunk membership follows `scanFolder`'s returned order**, not the name sort (`wavFiles.map((f) => f.path)`). In (r7) a must be the **first** entry `scanFolder` returns. In (r8) z must be the **51st** entry, so that it lands in chunk 2.
- A records the red run on the baseline src in `a-round-28.md`: per test, the first failing assertion and the symptom (`ACat`, not a function, `readGenerations` undefined). Expected **7 red / 3 green** among the new tests; every old test stays green.

### Part E — docs (Georgian, English technical terms)
- **`docs/bugs/001-save-and-selection-known-limits.md`:**
  - new entry **`## 11.`** "Rescan / folder-ის გახსნა / drop save-ის დროს", in the same layout as entry 9:
    - steps;
    - result before the fix;
    - `გასწორდა (D-35, TM-B30)`;
    - test names (r1), (r2), (r3), (r6) and (r7) in full, as in the file (grep);
    - production reachability (batch write yields every 5 files, read every 10; more than 50 files means several chunks; single only with a delay);
    - the remaining limit: B-R27-01 (a rejected chunk drops its paths);
  - header: "(3), (9) და (11)" as fixed;
  - `**წყარო:**` adds TM-B30 (round 28);
  - `**კოდი:**` adds `FolderBrowser.tsx` (`handleOpenFolder`, `handleRescan`), `App.tsx` (`openFolder`), `lib/utils.ts` (`readMetadataChunked`) and `file-store.ts` (`applyMetadataRead`);
  - one D-35 bullet in the decisions list;
  - every new `file:line` reference must point at A's tree;
  - entries 1–10: no other change, except a line number that A's change shifts (`file-store.ts:` references after the new action). Re-point and list those.
- **`docs/bugs/README.md`:** row 001 status reads `ცნობილი შეზღუდვების სია (11 ჩანაწერი; 3 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- **`.claude/primitives/STATE_MANAGEMENT.md`:** one added line after the D-34 line (Edit tool, path (b) permission): "Stale folder read (D-35): …". It states:
  - `readMetadataChunked` takes the generation per chunk via `getWriteGeneration`;
  - `applyMetadataRead` keeps the current entry for superseded paths;
  - Rescan, Open Folder and drop use it;
  - error and empty paths use `setMetadata`.

### Not in this round
- **B-R27-01:** rejected-chunk handling and a toast.
- **A-R19-02:** a save into another folder adds a stray key.
- **Any `MetadataPanel` change:** including moving `handleSchemaChanged` onto `applyMetadataRead` (RR-R23-04 / RR-R24-05 signals).
- **Disabling Rescan during a save:** B-R27-02, Saba.
- **C-R25-01, C-R27-01, C-R27-02, TM-B06, `src/main`.**

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/lib/utils.ts` | Part A: `getWriteGeneration` parameter, `readGenerations` |
| `src/renderer/src/stores/file-store.ts` | Part B: `applyMetadataRead` |
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | Part C: `handleOpenFolder`, `handleRescan` |
| `src/renderer/src/App.tsx` | Part C: `openFolder` |
| `tests/renderer/components/folder-read-during-save.test.ts` (new) | (r1)–(r8) |
| `tests/renderer/stores/file-store.test.ts` | (g2), additions only |
| `tests/renderer/utils/utils.test.ts` | (u1), additions only (import line may gain `readMetadataChunked`) |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 11, header, D-35 bullet, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-35 line |

A also writes `a-round-28.md` and `a-round-28-*.json` in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R28-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 6c956b4`;</li><li>`git diff --quiet 6c956b4 -- . ':!<10 owned paths>'`.</li></ul>Read the full diff. Read A's result JSON (`permission_denials`, tool use if a transcript exists). | <ul><li>Only the 10 owned paths changed; exactly one untracked file (the new test).</li><li>MetadataPanel and both metadata-panel tests are byte-identical.</li><li>`lib/utils.ts` imports no store (`grep -n "stores/" src/renderer/src/lib/utils.ts` is empty).</li><li>`getWriteGeneration` is required (no `?`, no default).</li><li>`file-store.ts` adds only `applyMetadataRead` (interface + implementation).</li><li>The three callers change only the success-path read + store write.</li><li>The test diffs in existing files are additions (plus the `utils.test.ts` import line).</li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/` beyond the existing `meta as Record<…>` casts.</li><li>The `STATE_MANAGEMENT.md` diff is one added line.</li><li>No Bash write to repository files is evident. If no transcript exists, C states "unknown" (not a FAIL).</li></ul> |
| R28-2 red → green | In a throwaway copy outside the repository, use the `6c956b4` src (the 4 owned src files from `git show 6c956b4:`) with A's test files, and run the renderer suite. Then run the suite on A's tree, and each of (r1)–(r8), (g2) and (u1) alone with `-t`. | <ul><li>Baseline src: (r1)(r2)(r3)(r6)(r7)(g2)(u1) fail; (r4)(r5)(r8) and all 216 old tests pass (expected **219 passed / 7 failed**). If the old src fails at type/collect level for (u1) or (g2), C records how.</li><li>For every red test, C records the first failing assertion and confirms it fails on the symptom (stale `ACat` / missing action / missing `readGenerations`), not on setup.</li><li>A's tree: **226/226** in 12 files.</li><li>Each test passes alone.</li></ul> |
| R28-3 mutations | In copies of A's tree outside the repository, run the new test file plus `file-store.test.ts` and `utils.test.ts` once per mutant. Adapt each to A's code shape and give the exact edit:<ul><li>**MR-1:** `applyMetadataRead` ignores generations (always takes `meta`).</li><li>**MR-2:** `>=` instead of `>`.</li><li>**MR-3:** `getWriteGeneration()` called once before the loop.</li><li>**MR-4:** generation taken after `readMetadataBatch` resolves.</li><li>**MR-5:** a superseded path with no current entry gets `meta`.</li><li>**MR-6:** `handleRescan` keeps `setMetadata`.</li><li>**MR-7:** `handleOpenFolder` keeps `setMetadata`.</li><li>**MR-8:** App `openFolder` keeps `setMetadata`.</li><li>**MR-9:** `applyMetadataRead` merges into the existing `metadata` instead of replacing it.</li><li>**MR-10:** the callers pass `() => 0`.</li></ul> | Every mutant is killed, and the killing tests are named. Expected killers:<ul><li>MR-1: (r1)(r2)(r3)(r6)(r7)(g2)</li><li>MR-2: (r4)(g2)</li><li>MR-3: (u1)(r8)</li><li>MR-4: (u1)(r1)</li><li>MR-5: (g2)</li><li>MR-6: (r1)</li><li>MR-7: (r3)</li><li>MR-8: (r6)</li><li>MR-9: (r5)(g2)</li><li>MR-10: (r4)</li></ul>A survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 29. |
| R28-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as on `6c956b4` (`c-round-27/biome-new.txt`).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **226**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R28-5 real app, old vs new | Build `6c956b4` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and a `-r harness.cjs` adapted from `c-round-27/harness.cjs`.<br>The harness:<ul><li>delays `meta:write` and `meta:write-batch` by 3 s **before** the real listener;</li><li>for the first `meta:read-batch` that starts while a write is pending, runs the real listener at once (so it reads before the write) and delays the **reply** by 6 s;</li><li>logs every call with timestamps.</li></ul>Copy `tests/fixtures/sample.wav` as `a.wav` and `b.wav`. Drive the UI only (the folder dialog may be stubbed to return the test folder).<br>**Scenario A (Rescan):**<ol><li>Click `a.wav`, set Category `R28Cat`, `Save Tags`.</li><li>During the write, click `Rescan`.</li><li>Wait for `Tags saved`, then for the late read reply (log); screenshot.</li><li>Click `a.wav`; screenshot.</li><li>Set Title `R28T2`, `Save Tags`, wait for `Tags saved`.</li><li>Read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and `ffprobe -show_entries format_tags -of json`.</li></ol>**Scenario B (Open Folder, same folder):** fresh copies; the same steps with `Open Folder` in step 2.<br>Take screenshots after each step. | <ul><li>**New build, both scenarios:**<ul><li>after step 4 the form shows Category `R28Cat`;</li><li>after step 6 both readers show `ICAT=R28Cat` and title `R28T2`, field by field.</li></ul></li><li>**Old build (red), both scenarios:** after step 4 the form shows the pre-save Category (`sample.wav` has no `ICAT`, so the field is empty `''`), and after step 6 `ICAT` is back to its pre-save value (`ICAT=''` or absent, as in R27-5). If the old build does not show this, C reports it with the timing from the log, and the round is not PASS until B re-plans.</li><li>The harness log shows the folder read started before the write ended and replied after the save's `meta:read`.</li><li>`pageErrors` is empty on all runs.</li><li>Artists are record only (TM-B08).</li></ul> |
| R28-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` line on A's tree, against A's src and the D-35 row in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 11 is marked `გასწორდა (D-35, TM-B30)`, names (r1), (r2), (r3), (r6) and (r7) by full test name (grep), states reachability and names B-R27-01 as the remaining limit.</li><li>The header lists (3), (9) and (11) as fixed; `წყარო`/`კოდი` are updated; there is a D-35 bullet.</li><li>Every `file:line` reference in the file points at the described code on A's tree. C greps each one; a wrong number is a FAIL.</li><li>Entries 1–10 are unchanged apart from listed line-number shifts.</li><li>The README row reads `ცნობილი შეზღუდვების სია (11 ჩანაწერი; 3 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li></ul> |

## What could break (C re-checks)
- **D-33/D-34 (s1)–(s15) + (g1):** these must stay green. MetadataPanel is frozen, but `file-store.ts` changes.
- **Normal Open Folder / Rescan / drop with no pending save** ((r5), E2E `folder-workflow.spec.ts`): every read applies, and a removed file disappears from `metadata`.
- **Error paths:** a `scanFolder` reject still shows the toast and, for Open Folder / drop, empties `files` and `metadata`. The empty folder still yields `setMetadata({})`. Closing the folder still clears everything.
- **D-28 `refreshSavedFileStats`:** it calls `scanFolder` and must stay unaffected (no `readMetadataChunked` there).
- **D-29:** Rescan clears the selection during a pending save, so the save does not touch the form. The `Tags saved` toast still appears.
- **Sort / filter / `useFilteredFiles`, `file-list.test.ts`:** no new state, so there must be no change.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R28-1…R28-4 and R28-6 are real local checks.
- R28-5 is the real-app check on two builds, with the file read by two independent readers.
- PASS on all six closes TM-B30 and B-R25-01.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 29 fixes it first (test-on-bugfix).
- Otherwise:
  - **B-R27-01:** a rejected chunk in a folder read silently drops entries. Needs a decision (keep the current entry + toast, as D-33 does) and a red reproduction.
  - **C-R25-01:** the MBS hygiene candidate.
- Everything else waits on Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02) or on root's Actions link (TM-T0-CI/TM-B14).
