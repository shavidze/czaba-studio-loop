# CURRENT TASK — Round 32: TM-B34 — late re-reads after a folder switch (D-39)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 31: C PASS** (R31-1…R31-6, realVerified=true, no new bug). TM-B33 (D-38) is **done**. Root published `7355d78` (round 31). The review returned COMMIT OK with 3 low findings and an architecture note. `7355d78` is the baseline.
- **No critical or high bug is open.** Round 31's "Next" named the save re-read after a folder switch (RR-R28-03 / A-R19-02 / RR-R30-01). This round takes the three tightly related bugs of one family: an async result from the old folder lands after the folder changed.
  - **(a) save re-read** (RR-R28-03 / A-R19-02 / RR-R30-01): `handleSave`'s re-read adds the old folder's paths to the new folder's `metadata`. If the old folder is reopened and its read rejects, D-36 keeps that stray entry and shows it as current.
  - **(b) schema re-read** (A-R31-01, A's QA hypothesis, now reproduced by B): `handleSchemaChanged` reads the old folder's files and replaces the **whole** `metadata` map. After Done → Open Folder B, B's files lose `Tagged` and their form values. A rejected re-read shows a stale `Failed to read N files`.
  - **(c) superseded drop** (RR-R31-02, root review low 2): App `openFolder`'s schema-wait loop never checks the load id, so a superseded drop still calls `scanFolder` for the old folder.
- **Riders** (test-only, same family):
  - RR-R31-01: merge the two `~/stores/file-store` imports in `file-store.test.ts`.
  - C-R31-01 (CR-6): Close Folder during a pending **scan** and during a pending **drop** load have no test. Pins (o17)/(o18).
- **B's red reproduction** on `7355d78`, in a throwaway copy (`b-round-31-exp/`):
  - `b-r32-reread.test.ts.txt`, `overlap-o17-o18.diff.txt`, `file-store-import.diff.txt`;
  - `red-run.log`: **260 passed / 8 failed of 268**. (v1)–(v4) and (v6)–(v9) fail on the symptom; (v5), (o17) and (o18) are green.
  - `prototype.diff.txt`: renderer **268/268 in 15 files**, Biome 0 errors / 8 warnings with the same list, `tsc` web + test clean (`green-run.log`).
  - `mutants.log`: SM-1…SM-8 killed; SM-9 is equivalent (see R32-3).
- **Design fact (B-R31-01).** Round 30's hint "record `folderLoadId` at save start" is **wrong**, and mutant SM-3 proves it: Rescan and same-folder Open Folder also call `beginFolderLoad()`, so a load-id guard drops the save's re-read exactly where D-35 needs it. (r1), (r2), (r3), (r6), (r7) and (k6) go red. A `folderPath` snapshot is wrong too (SM-4): a parent folder that still lists the file must get the saved value ((v5)). D-39 therefore uses "the path is still listed in `files`" for the save, and the load id only for the schema re-read, which replaces the whole map.
- **Severity: low.** All three are display-only.
  - Nothing is written to disk by a re-read.
  - An empty form saves only the fields that were typed: `writeTagsToFile` skips `undefined`.
  - A wrong `metadata` map is still what the editor shows.
- **Reference-first rule:** exempt. This is a pure ordering fix: no new UX element and no new or changed text. Every toast stays as it is.
- **Not in this round** (each recorded in the backlog, none dropped):
  - **RR-R31-04 / RR-R29-02 / RR-R30-03:** the `loadFolder` helper (architecture signal).
  - **RR-R31-03:** `beginFolderLoad` simplification (optional).
  - **B-R30-01:** early stop of a superseded read; `utils.ts` stays frozen.
  - **RR-R19-01 / RR-R19-03:** the save's stats refresh still scans the current folder (harmless; performance is a Saba question).
  - **RR-R15-04 / RR-R29-01:** toast grammar.
  - `isListedPath` inside the batch `.filter` is O(files × paths); a one-shot `Set` would be a reviewer nit (signal), not a FAIL and not scope.
  - The reverse race: a folder load that **started before** a schema change and lands after the schema re-read. It is not reported; B records it if C sees it.

## Baseline
- HEAD must be `7355d78cecfd24bc895c29b3cc84b8e905283d58` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `7355d78` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `7355d78`): every path not listed under File ownership. In particular:
  - `src/renderer/src/stores/file-store.ts` (D-39 needs no store change);
  - `src/renderer/src/components/sidebar/FolderBrowser.tsx`;
  - `src/renderer/src/lib/utils.ts`;
  - `src/renderer/src/types/**`;
  - `src/main/**`;
  - `tests/renderer/helpers/**`;
  - `tests/renderer/setup.ts`;
  - `tests/renderer/components/folder-read-during-save.test.ts`, `folder-read-rejected-chunk.test.ts`, `metadata-panel-*.test.ts`;
  - `tests/renderer/utils/**`;
  - `tests/e2e/**`.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`. After the bug fix, run `qa-engineer`.

## Scope

### D-39 (decision, renderer only)
**(a) `MetadataPanel.tsx` `handleSave`: listed-path rule.**
- New module-level function next to `refreshSavedFileStats`:
  ```ts
  function isListedPath(path: string): boolean {
    return useFileStore.getState().files.some((file) => file.path === path);
  }
  ```
  The name is exact; C greps it.
- **Single branch:** `updateFileMetadata(path, updated);` becomes `if (isListedPath(path)) updateFileMetadata(path, updated);`.
- **Batch branch:** `savedEntries` additionally requires `isListedPath(path)`, in the 3-line form Biome's formatter accepted on B's prototype:
  ```ts
          const savedEntries = Object.entries(refreshed).filter(
            ([path]) => !failedPaths.has(path) && isListedPath(path),
          );
  ```
- **Unchanged:**
  - the write, `markPathsWritten`, `refreshSavedFileStats` and the re-read;
  - `skipSyncRef`, `selectionUnchanged`, D-29/D-30 merge logic;
  - **every toast** (`Tags saved`, `Tags saved to N files`, the reload-failed and partial-failure texts);
  - the `catch`/`finally`.
  - No `folderLoadId` or `folderPath` check in `handleSave`.

**(b) `MetadataPanel.tsx` `handleSchemaChanged`: load-id guard.**
- Right after `if (allFiles.length === 0) return;`, add `const loadId = useFileStore.getState().folderLoadId;`.
- Right after the chunk `for` loop, **before** reading `currentMetadata`, add `if (!isFolderLoadCurrent(loadId)) return;`.
- A superseded schema re-read therefore makes no `setMetadata`, no `setEditingMetadata` and no toast.
- Nothing else in the function changes (D-33/D-34 stay).
- The import becomes `import { isFolderLoadCurrent, useFileStore, useSelectedFiles } from '~/stores/file-store';`.

**(c) `App.tsx` `openFolder`: schema wait.**
- Inside the `while (!useSchemaStore.getState().isLoaded)` loop, right after `await new Promise((r) => setTimeout(r, 50));`, add `if (!isFolderLoadCurrent(loadId)) return;`.
- Nothing else in `App.tsx` changes.

**Both files:** no new `as`, no comments. Biome: 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).

### Tests first (red on `7355d78` src where marked)
**New file `tests/renderer/components/reread-after-folder-switch.test.ts`:**
- Start from `b-round-31-exp/b-r32-reread.test.ts.txt`. A may copy it as is.
- Keep **one** `describe("save and schema re-reads after a folder switch (D-39)", …)`, the double-quote test style and the test names below.
- A may tidy the helpers (named types, no `any`). The scenarios and assertions are the contract.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (v1) | Folder `/fa` (a, a2), a selected; single save with the write deferred; Open Folder `/fb` finishes; the write resolves and the re-read returns `NEW_A` | `readMetadata` called once; `metadata` exactly `{b: B_META}`; toast `Tags saved` | red |
| (v2) | a+a2 selected; batch save with the write deferred; Open Folder `/fb` finishes; the write resolves and the batch re-read returns a and a2 | `readMetadataBatch` called twice; `metadata` `{b}`; toast `Tags saved to 2 files` | red |
| (v3) | a selected; single save with the write deferred; Close Folder; the write resolves | `folderPath` null, `metadata` `{}`, toast `Tags saved` | red |
| (v4) | RR-R30-01: as (v1), then Open Folder `/fa` again with its read **rejecting** | `files` `[a]`, toast `Failed to read 1 files`, `metadata` `{}` | red |
| (v5) pin | Folder `/fa/sub` (x selected); single save with the write deferred; Open Folder `/fa` (lists a and x; read deferred); the write resolves, then the parent read resolves stale | `folderPath` `/fa`, `metadata` `{a: A_META, x: NEW_SUB}` | green |
| (v6) | a selected; add custom field `R32note`, click Done (schema re-read deferred); Open Folder `/fb` finishes; the schema re-read resolves with a and a2 | `files` `[b]`, `metadata` `{b}`, toast null | red |
| (v7) | as (v6), but the schema re-read **rejects** | toast null, `metadata` `{b}` | red |
| (v8) | as (v6), but Close Folder instead of Open Folder | `metadata` `{}` | red |
| (v9) | `App`, `loadSchema` deferred; drop `/fa`; Open Folder `/fb` finishes; `loadSchema` resolves; wait 150 ms | `scanFolder` calls are exactly `["/fb"]`; `folderPath` `/fb`; `files` `[b]` | red |

**`tests/renderer/components/folder-read-overlap.test.ts`:** additions only, inside the existing describe, after (o16), as in `b-round-31-exp/overlap-o17-o18.diff.txt`.
- **(o17)** "Open Folder A (scan pending), Close Folder, A's scan lands -> folder stays closed". Asserts `folderPath` null, `files` `[]`, `metadata` `{}`, `isScanning` false, and `readMetadataBatch` not called. Baseline: green pin.
- **(o18)** "App: drop folder A (read pending), Close Folder, A's read lands -> folder stays closed". `isScanning` is true before Close; after it, the same four asserts. Find the Close button via `screen.getByTitle("/fa").parentElement?.querySelector("button")`: the first `lucide-x` in `App` is the TitleBar's window close. Baseline: green pin.

**`tests/renderer/stores/file-store.test.ts`:** the only change is lines 2–3 → `import { isFolderLoadCurrent, useFileStore } from "~/stores/file-store";` (RR-R31-01). Nothing else.

**Totals and red run:**
- 11 new tests. Renderer 257 + 11 = **268** in **15** files.
- A records the red run on the baseline src in `a-round-32.md`:
  - **260 passed / 8 failed**, failing (v1)–(v4) and (v6)–(v9);
  - (v5), (o17) and (o18) green;
  - for each red test, the first failing assertion, which must be the symptom (stray `/fa/...` key, A's map, stale toast, `/fa` scan call), not setup.

### Docs (Georgian, English technical terms)
**`docs/bugs/001-save-and-selection-known-limits.md`:**
- **New entry `## 15.`** "გვიანი re-read-ები folder-ის შეცვლის შემდეგ (save, schema, drop)", in the layout of entry 14:
  - ID `RR-R28-03, A-R19-02, RR-R30-01, A-R31-01, RR-R31-02, TM-B34`; severity low;
  - files with `file:line` on A's tree (`isListedPath`, the two `isListedPath` uses, the `loadId` line and guard in `handleSchemaChanged`, the App loop guard);
  - reachability:
    - save: Open Folder, drop and Close are not locked during a save;
    - schema: the sidebar stays usable while the schema editor waits on `Done` (C-R27-01);
    - drop during schema load: only at app start;
  - reproduction: start state → action → result before the fix, for (a), (b) and (c);
  - nothing on disk changes;
  - why the save rule is "listed path" and not the load id (D-35 / Rescan) or `folderPath` ((v5));
  - decision D-39;
  - the full names of (v1)–(v9); (o17) and (o18) only by ID, with "see (14)" (their full names live in entry 14 only);
  - `გასწორდა (D-39, TM-B34)`.
- **Entry 14:** in its `გადაწყვეტილება`, the sentence "save-ის re-read … ამ ჩანაწერში არ შედის" gets a pointer to entry (15) / D-39. Its test list adds the full names of (o17) and (o18).
- **New D-39 bullet** after D-38, matching the code.
- **Header:**
  - fixed list "(3), (9), (11), (12), (13), (14) და (15)";
  - `**წყარო:**` adds `TM-B34 (round 32)`;
  - `**კოდი:**` adds `isListedPath` to the `MetadataPanel.tsx` list and App `openFolder`'s schema wait (if it is not already named).
- **Line refs.** `MetadataPanel.tsx` shifts at four insertion points (the import change stays on its line):
  - +4 after `isListedPath`;
  - +6 after the 3-line batch filter;
  - +7 after the `loadId` line;
  - +8 after the guard.
  `App.tsx`: the guard becomes new line 55, so old lines ≥ 55 shift +1. A's before→after map is the source of truth. A re-points **every** `MetadataPanel.tsx` and `App.tsx` `file:line` in the whole file:
  - the D-29…D-38 bullets and entries 1–14;
  - bare refs such as `:144` that refer to `MetadataPanel.tsx` count too.
  - A lists the before→after line map for both files in `a-round-32.md`.
  - `FileList.tsx`, `FolderBrowser.tsx`, `file-store.ts` and `metadata-store.ts` refs must not change (those files are frozen).
- Entries 1–13: no change except those line shifts.

**`docs/bugs/README.md`:** row 001 status reads exactly `ცნობილი შეზღუდვების სია (15 ჩანაწერი; 7 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.

**`.claude/primitives/STATE_MANAGEMENT.md`** (Edit tool, path (b)): add exactly one line right after the D-38 line: `Late re-reads after a folder switch (D-39): handleSave writes its re-read into the store only for paths still listed in useFileStore files (isListedPath), never keyed on folderLoadId because Rescan also begins a load; handleSchemaChanged takes folderLoadId at start and returns without store writes, editor change or toast when it is no longer current; App openFolder's schema-wait loop returns when its load is superseded.`

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-39 (a) `isListedPath` + two uses; (b) schema guard + import |
| `src/renderer/src/App.tsx` | D-39 (c) one guard line |
| `tests/renderer/components/reread-after-folder-switch.test.ts` (new) | (v1)–(v9) |
| `tests/renderer/components/folder-read-overlap.test.ts` | (o17), (o18), additions only |
| `tests/renderer/stores/file-store.test.ts` | import merge only (RR-R31-01) |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 15, entry 14 pointer + (o17)/(o18), D-39 bullet, header, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-39 line |

A also writes `a-round-32.md` (and any `a-round-32/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R32-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 7355d78`;</li><li>`git diff --quiet 7355d78 -- . ':!<8 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is `reread-after-folder-switch.test.ts`.</li><li>The src diff is exactly D-39:<ul><li>`MetadataPanel.tsx`: the import, `isListedPath`, the single-branch `if (isListedPath(path))`, the batch filter, `const loadId = …folderLoadId;` after the `allFiles` check, and `if (!isFolderLoadCurrent(loadId)) return;` after the chunk loop;</li><li>`App.tsx`: one guard line inside the wait loop.</li></ul></li><li>`file-store.ts` and `FolderBrowser.tsx` are byte-identical.</li><li>No toast text changed.</li><li>`folder-read-overlap.test.ts`: additions only.</li><li>`file-store.test.ts`: only the import line.</li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/`.</li><li>`STATE_MANAGEMENT.md`: exactly one added line.</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R32-2 red → green | In a throwaway copy outside the repository, put the `7355d78` versions of `MetadataPanel.tsx` and `App.tsx` with A's tests, and run the renderer suite. Then run the suite on A's tree, and each new test alone with `-t`. | <ul><li>Baseline src: (v1)–(v4) and (v6)–(v9) fail; (v5), (o17), (o18) and all 257 old tests pass (expected **260 passed / 8 failed**).</li><li>Each red test fails on the symptom; C records the first failing assertion for each.</li><li>A's tree: **268/268** in 15 files.</li><li>Each new test passes alone.</li></ul> |
| R32-3 mutations | In copies of A's tree outside the repository, run `reread-after-folder-switch.test.ts`, `folder-read-during-save.test.ts`, `metadata-panel-schema-change.test.ts`, `metadata-panel-batch-save.test.ts`, `folder-read-overlap.test.ts` and `folder-read-rejected-chunk.test.ts` once per mutant. Give the exact edit for each. SM-1…SM-9 as in `b-round-31-exp/mutants.log` / `mut.py.txt`. | Every mutant except SM-9 is killed, with the killers named. Expected:<ul><li>SM-1 (single unguarded): (v1)(v3)(v4);</li><li>SM-2 (batch unguarded): (v2);</li><li>SM-3 (save keyed on `folderLoadId`): D-35 (r1)(r2)(r3)(r6)(r7)(k6) and (v5);</li><li>SM-4 (save keyed on a `folderPath` snapshot): (v5);</li><li>SM-5 (schema guard removed): (v6)(v7)(v8);</li><li>SM-6 (guard only around `setMetadata`): (v7);</li><li>SM-7 (`loadId` taken after the reads): (v6)(v7)(v8);</li><li>SM-8 (App guard removed): (v9).</li></ul>**SM-9** (App guard after the loop instead of inside) is equivalent: the scan is skipped either way, and the only difference is up to 5 s of idle polling. C confirms it survives and states why. Any other survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 33. |
| R32-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **268**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R32-5 real app, old vs new | Build `7355d78` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and `-r harness.cjs` adapted from `c-round-31/harness.cjs`. Harness, with every call logged; markers as in R31, plus:<ul><li>a **read-one marker** makes `meta:read` for paths under `slow/` wait `R32_DELAY_MS` (5000) before calling the real handler;</li><li>the R31 **batch delay** and **reject** markers on `meta:read-batch` for `slow/`.</li></ul>Folders: `slow/` = `s.wav`, `fast/` = `f.wav` (copies of `tests/fixtures/sample.wav`). Drive the UI only; `dialog.showOpenDialog` may be stubbed.<br>**Setup** (fresh copies and config per scenario, harness disarmed): open `fast`, click `f.wav`, Category `R32Fast`, `Save Tags`, `Tags saved`; open `slow`, click `s.wav`, Category `R32Slow`, Save. Record the sha256 of both and read both with `music-metadata` (`exif:ICAT`) and `ffprobe -show_entries format_tags -of json`.<br>Scenarios (each starts from the setup, with `slow` open and `s.wav` selected):<ul><li>**V:** arm read-one; type Category `R32Slow2`, click `Save Tags`, and within 1 s Open Folder `fast`; screenshot when `f.wav` is listed; wait 7 s (the delayed re-read lands); disarm read-one, arm batch delay + reject; Open Folder `slow`; poll for the `Failed to read 1 files` text and screenshot it when it appears (the toast lives about 3 s); after 7 s screenshot the list; click `s.wav`; screenshot the form.</li><li>**SC:** click Customize Fields (gear), add Text field `R32note`; arm batch delay; click `Done`, and within 1 s Open Folder `fast` (sidebar); screenshot when `f.wav` is listed; wait 7 s; screenshot; click `f.wav`; screenshot the form.</li><li>**SJ:** as SC, with batch delay + reject armed.</li></ul> | <ul><li>**New build:**<ul><li>V: `Failed to read 1 files`; `s.wav` is not `Tagged` and its Category is empty (no stray entry);</li><li>SC: after 7 s `f.wav` keeps `Tagged` and its form shows Category `R32Fast`; no toast;</li><li>SJ: same, and no `Failed to read` toast.</li></ul></li><li>**Old build (red):**<ul><li>V: `s.wav` shows `Tagged` with Category `R32Slow2` although its read failed;</li><li>SC: after the delayed schema read lands, `f.wav` loses `Tagged` and its Category is empty;</li><li>SJ: `Failed to read 1 files` appears after `fast` loaded, and `f.wav` loses `Tagged`.</li></ul>If the old build does not show a listed symptom, C reports it with the harness log. The round is not PASS until B re-plans, unless C shows the timing made the step a no-op on both builds; then C reruns with a longer delay.</li><li>**All runs:**<ul><li>`Tags saved` appears in V on both builds (the write is not affected);</li><li>`f.wav`'s sha256 is unchanged after setup;</li><li>`s.wav`'s sha256 is unchanged after setup in SC/SJ (no save). In V it changes once, by the save.</li><li>Both readers, field by field: `ICAT=R32Fast` for `f.wav`; `R32Slow` for `s.wav` (SC/SJ) or `R32Slow2` (V).</li><li>No `R32note` value is written to either file.</li><li>`pageErrors` is empty.</li></ul></li><li>C states that these are unit-only:<ul><li>Close during a save or schema re-read ((v3), (v8));</li><li>drop during schema load ((v9));</li><li>the parent-folder pin ((v5)).</li></ul></li><li>Artists are record only (TM-B08).</li></ul> |
| R32-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` D-39 line on A's tree, against A's src and D-39 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 15:<ul><li>marked `გასწორდა (D-39, TM-B34)`;</li><li>names (v1)–(v9) by full test name, and (o17)/(o18) only by ID with a pointer to (14) (grep: each full name of (v1)–(v9), (o17), (o18) has exactly 1 match in the docs file, (o17)/(o18) in entry 14, and 1 in the tests);</li><li>states reachability, that nothing on disk changes, and why the rule is "listed path".</li></ul></li><li>Entry 14 points to (15)/D-39 and names (o17)/(o18).</li><li>The D-39 bullet matches the code.</li><li>Header lists (3), (9), (11), (12), (13), (14), (15) as fixed; `წყარო` has TM-B34.</li><li>Every `MetadataPanel.tsx` / `App.tsx` `file:line` in the file points at the described code on A's tree; C greps each, and a wrong number is a FAIL.</li><li>Refs to frozen files are unchanged.</li><li>Entries 1–13 are unchanged apart from listed shifts.</li><li>The README row reads exactly `ცნობილი შეზღუდვების სია (15 ჩანაწერი; 7 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li><li>The STATE_MANAGEMENT D-39 line is present once.</li></ul> |

## What could break (C re-checks)
- **D-35 (r1)–(r8):** save + Rescan / same-folder Open Folder / drop. The save's re-read must still land for listed paths. This is the reason for the listed-path rule; SM-3 shows the load-id alternative breaking it.
- **D-29 / D-30:** the form after a save on an unchanged selection: the re-read is applied and typed fields are merged ((x*)/(y*) tests in `metadata-panel-batch-save.test.ts`).
- **D-21 / D-22 / D-24 / D-28:** batch partial failure, reload-failed toasts and the Size/Date refresh are unchanged.
- **D-33 / D-34 (s1)–(s15):** a schema re-read with no folder change still applies, including a stale chunk and a rejected chunk.
- **D-36 / D-37 / D-38 (k*), (e*), (o1)–(o16):** folder loads are unchanged.
- **Normal flows:**
  - single and batch save in E2E `folder-workflow.spec.ts`;
  - the schema editor Done path;
  - drop after the schema has loaded (the loop does not run).
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R32-1…R32-4 and R32-6 are real local checks.
- R32-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B34, RR-R28-03, A-R19-02, RR-R30-01, A-R31-01, RR-R31-02, RR-R31-01 and C-R31-01.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 33 fixes it first (test-on-bugfix).
- Otherwise the bug queue in this family is empty. What remains is either a Saba decision or a root action:
  - Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01);
  - root's Actions link (TM-T0-CI/TM-B14).
- B will then pick the next unblocked low item from the backlog (for example TM-B11 or TM-B05 decision prep), or report BLOCKED with the exact questions.
