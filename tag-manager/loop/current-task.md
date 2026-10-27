# CURRENT TASK — Round 31: TM-B33 — overlapping folder loads become latest-wins (D-38)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 30: C PASS** (R30-1…R30-6, realVerified=true, no new bug). TM-B32 (D-37) is **done**. Root published `bf83c7d` (round 30), and the review returned COMMIT OK with no medium finding. `bf83c7d` is the baseline.
- **No critical or high bug is open.** C reported no new bug, only signals (C-R30-01, recorded). The next bug in dependency order is **TM-B33 / RR-R29-03** (low): folder loads have no ordering guard. Round 30's "Next" named it.
- **B's red reproduction** on `bf83c7d`, in a throwaway copy (`b-round-30-exp/b-r31-overlap.test.ts`, `red-run.log`): **15 red, 1 green pin.** Highlights:
  - (x1) Open Folder A whose read is still pending, then Open Folder B, which finishes. A's read lands last, so `metadata` is A's while B's files are listed.
  - (x2) A's **scan** lands last → `files` = A's files under B's `folderPath`.
  - (x3) A finishes first while B is still reading → `isScanning` is false too early.
  - (x4) A's read rejects late → stale `Failed to read 1 files` toast.
  - (x5) Close Folder while a read is pending → the read lands and refills `metadata`.
  - (x6)/(x10)–(x12) the same with App drop; (x7)/(x13)–(x15) the same with Rescan overtaken by Open Folder.
  - (x8) green pin: a **cancelled** second dialog must not cancel the running load.
- **Reachability:** Rescan is `disabled={isScanning}`, but Open Folder and drop are not. So Open→Open, Open→drop, drop→Open, Rescan→Open and Close during a pending load are all reachable from the UI. Rescan→Rescan (RR-R29-03's first example) is **not** reachable. C must not try to drive it.
- **Prototype** (`b-round-30-exp/prototype.diff.txt`): renderer 256/256 (B's 16 tests included), Biome 0 errors / 8 warnings with the same list, `tsc` web + test clean. Mutants: `b-round-30-exp/mutants.log`.
  - All guard mutants are killed.
  - GM-7 (Rescan reuses the current id) is equivalent through the UI and is killed only by the direct test (x16).
- **Severity: low.** The bug is display-only: nothing is written to disk by a folder load. But a wrong `metadata` map under the listed files is what the editor shows and what a later save starts from.
- **Reference-first rule:** exempt. This is a pure ordering fix with no new UX element or text. The one visible consequence is that the spinner stops on Close Folder; that is part of D-38, not a feature.
- **Not in this round** (each recorded in the backlog, none dropped):
  - **RR-R28-03 / A-R19-02 / RR-R30-01:** the save re-read landing after a folder switch. It lives in `MetadataPanel.tsx` `handleSave`; `folderLoadId` makes it a small follow-up later.
  - **B-R30-01:** early stop of a superseded `readMetadataChunked`. `utils.ts` is frozen.
  - **RR-R29-02 / RR-R30-03:** the `loadFolderContents` helper (architecture signal). This round keeps the three callers and adds the guard to each.
  - **RR-R15-04 / RR-R29-01:** toast grammar.

## Baseline
- HEAD must be `bf83c7dc5e2462304159acc3df56ededbcd9d517` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `bf83c7d` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `bf83c7d`): every path not listed under File ownership. In particular:
  - `src/renderer/src/lib/utils.ts`;
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`;
  - `src/renderer/src/types/**`;
  - `src/main/**`;
  - `tests/renderer/helpers/**`, including `reset-stores.ts` (see D-38: `folderLoadId` is never reset);
  - `tests/renderer/setup.ts`;
  - `tests/renderer/components/folder-read-rejected-chunk.test.ts`;
  - `tests/renderer/components/folder-read-during-save.test.ts`;
  - `tests/renderer/components/metadata-panel-*.test.ts`;
  - `tests/renderer/utils/**`;
  - `tests/e2e/**`.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `prompts/new-store.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`.

## Scope

### D-38 (decision, renderer only)
Folder loads are **latest-wins**.
- **Store** (`file-store.ts`):
  - `FileState` gets `folderLoadId: number`, initial `0`. It only increases and is **never reset**: `reset-stores.ts` stays frozen. A monotonic id cannot collide with a still-pending promise from an earlier test or an earlier load.
  - New action `beginFolderLoad: () => number` increments `folderLoadId` and returns the new value. The `create` callback becomes `(set, get)`.
  - A new exported function in `file-store.ts`: `export function isFolderLoadCurrent(loadId: number): boolean`, which returns `useFileStore.getState().folderLoadId === loadId`.
  - These names are exact; C greps them. Nothing else in the store changes. `applyMetadataRead`, `setMetadata`, `updateFileMetadata` and the D-35 generations stay byte-identical in behaviour.
- **`FolderBrowser.tsx` `handleOpenFolder`:** `const loadId = useFileStore.getState().beginFolderLoad();` goes **after** `if (!path) return;`, so a cancelled dialog does not cancel the running load, and before the player stop. Then:
  - right after `await window.api.scanFolder(path)`: `if (!isFolderLoadCurrent(loadId)) return;`, before `setFiles`;
  - right after `await readMetadataChunked(...)`: the same line, before `applyMetadataRead` and the toast;
  - first line of `catch`: the same line, so a superseded load shows no toast, no `setFiles([])` and no `setMetadata({})`;
  - `finally`: `if (isFolderLoadCurrent(loadId)) setIsScanning(false);`.
- **`FolderBrowser.tsx` `handleRescan`:** `const loadId = ...beginFolderLoad();` right after `if (!folderPath) return;`, then the same four guards.
- **`App.tsx` `openFolder`** (drop): `const loadId = ...beginFolderLoad();` as the first statement (before the player stop and the schema wait loop), then the same four guards.
- **`FolderBrowser.tsx` `handleCloseFolder`:** add `useFileStore.getState().beginFolderLoad();` and `setIsScanning(false);`. Add `setIsScanning` to its dependency array. A pending load can then no longer refill a closed folder, and the spinner stops on Close.
- **Unchanged:**
  - `setFolderPath`, `clearSelection()` and the player stop stay synchronous at load start;
  - D-35 / D-36 / D-37 behaviour inside the current load;
  - the toast texts;
  - the `meta as Record<…>` casts;
  - the empty-folder `else` branches;
  - Rescan's `disabled={isScanning}`;
  - the import line becomes `import { isFolderLoadCurrent, useFileStore } from '~/stores/file-store';` in both components.
- **Biome:** 0 errors and **8** warnings, with the same list as `c-round-30/biome-new.txt`. Line shifts are allowed.

### Tests first (red on `bf83c7d` src where marked)

**New file `tests/renderer/components/folder-read-overlap.test.ts`:**
- Start from `b-round-30-exp/b-r31-overlap.test.ts`. A may copy it and rename the tests (x1)…(x16) to (o1)…(o16).
- Use **one** `describe("overlapping folder loads are latest-wins (TM-B33, D-38)", …)`.
- Use the existing double-quote test style. A may tidy the helpers (named types, no `any`).
- The scenarios and assertions below are the contract.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (o1) | Open Folder A (read deferred), Open Folder B (read resolves), resolve A's read | `folderPath` `/fb`, `files` B, `metadata` `{b: B_META}` | red |
| (o2) | Open A (**scan** deferred), Open B (done), A's scan resolves | `files` B, `metadata` `{b}` | red |
| (o3) | Open A (read deferred), Open B (read deferred), A resolves first | `isScanning` true and `metadata` `{}`; after B resolves: `isScanning` false, `metadata` `{b}` | red |
| (o4) | Open A (read deferred), Open B (done), A's read **rejects** | `toastMessage` null, `metadata` `{b}` | red |
| (o5) | Open A (read deferred), click Close Folder (the `X` button), resolve A | `folderPath` null, `files` `[]`, `metadata` `{}`, `isScanning` false | red |
| (o6) | `App`: Open Folder A (read deferred), drop B (done), resolve A | `folderPath` `/fb`, `files` B, `metadata` `{b}` | red |
| (o7) | Seed folder A; Rescan (read deferred), Open Folder B (done), resolve Rescan's read | `files` B, `metadata` `{b}` | red |
| (o8) pin | Open A (read deferred), second Open Folder dialog returns `null`, resolve A | `folderPath` `/fa`, `files` A, `metadata` `{a}`, `isScanning` false | green |
| (o9) | Open A (scan deferred), Open B (done), A's scan **rejects** | `files` B, `metadata` `{b}`, `toastMessage` null | red |
| (o10) | `App`: drop A (read deferred), Open Folder B (read deferred), A resolves first | `isScanning` true, `metadata` `{}`; after B: `isScanning` false, `files` B, `metadata` `{b}` | red |
| (o11) | `App`: drop A (scan deferred), Open Folder B (done), A's scan resolves | `folderPath` `/fb`, `files` B, `metadata` `{b}` | red |
| (o12) | `App`: drop A (scan deferred), Open Folder B (done), A's scan rejects | `files` B, `metadata` `{b}`, `toastMessage` null | red |
| (o13) | Seed A; Rescan (scan deferred), Open Folder B (done), Rescan's scan resolves | `files` B, `metadata` `{b}` | red |
| (o14) | Seed A; Rescan (scan deferred), Open Folder B (done), Rescan's scan rejects | `toastMessage` null, `metadata` `{b}` | red |
| (o15) | Seed A; Rescan (read deferred), Open Folder B (read deferred), Rescan resolves first | `isScanning` true; after B: false, `metadata` `{b}` | red |
| (o16) | Seed A; record `folderLoadId`; Rescan (resolves) | `isFolderLoadCurrent(before)` false; `folderLoadId` = before + 1 | red |

**`tests/renderer/stores/file-store.test.ts`:** additions only.
- Add one new `describe("folder load id (TM-B33, D-38)")` at the end, with one test, (f1): two `beginFolderLoad()` calls return `n+1` and `n+2` (where `n` is the id before); `isFolderLoadCurrent(n+1)` is false; `isFolderLoadCurrent(n+2)` is true. Baseline: **red** (not a function).
- Do not assert an absolute id: there is no reset.

**Totals and red run:**
- 17 new tests. Renderer 240 + 17 = **257** in **14** files.
- A records the red run on the baseline src in `a-round-31.md`: **16 red / 1 green** among the new tests ((o8) green). That is 241 passed / 16 failed overall. For each red test, A records the first failing assertion, which must be the symptom, not setup. On the baseline, (o16) and (f1) fail on the missing export.

### Docs (Georgian, English technical terms)
- **`docs/bugs/001-save-and-selection-known-limits.md`:**
  - **New entry `## 14.`** "ერთმანეთზე გადაფარული folder load-ები: ბოლოს დასრულებული იმარჯვებდა", in the layout of entry 13:
    - ID `RR-R29-03, TM-B33`; severity low;
    - files with `file:line` on A's tree;
    - reachability (Open Folder and drop are not disabled while scanning; Rescan is; Rescan→Rescan is unreachable);
    - reproduction: start state → action (Open Folder A with a slow read, then Open Folder B) → result before the fix (A's late read replaces `metadata` under B's list; late scan, late rejection toast, early spinner stop, Close refill);
    - nothing on disk changes;
    - decision D-38;
    - the full names of (o1)–(o16) and (f1);
    - `გასწორდა (D-38, TM-B33)`.
  - **Entry 12:** add (k7)'s full name to its test list (A-R30-01).
  - **New D-38 bullet** after D-37.
  - Re-point **every** `FolderBrowser.tsx` / `App.tsx` / `file-store.ts` line ref in the D-35/D-36/D-37 bullets, in the `**კოდი:**` line and in entries 11–13. The guards shift lines.
  - **`file-store.ts` shifts everywhere.** The new interface field, action signature, initial value and action shift every `file-store.ts` line below them (+1 after the field, +2 after the signature, +3 after the initial value). That includes `updateFileMetadata`, `selectRange`, `markPathsWritten` and `applyMetadataRead`. A re-points **all** `file-store.ts` refs in the whole file: the D-31/D-34/D-35/D-36 bullets and entries 1–10 too. A lists the before→after line map for `file-store.ts`, `FolderBrowser.tsx` and `App.tsx` in `a-round-31.md`. Bare refs such as `:137` that refer to `file-store.ts` count too.
  - **Header:**
    - title line unchanged;
    - the fixed list reads "(3), (9), (11), (12), (13) და (14)";
    - `**წყარო:**` adds `TM-B33 (round 31)`;
    - `**კოდი:**` adds `handleCloseFolder` and `beginFolderLoad`/`isFolderLoadCurrent`.
  - Entries 1–10: no change except the line-number shifts in A's map.
- **`docs/bugs/README.md`:** row 001 status reads exactly `ცნობილი შეზღუდვების სია (14 ჩანაწერი; 6 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- **`.claude/primitives/STATE_MANAGEMENT.md`** (Edit tool, path (b)): add exactly one line right after the D-36 line: `Overlapping folder loads (D-38): handleOpenFolder (after the dialog), handleRescan and App openFolder take useFileStore.getState().beginFolderLoad() first; after scanFolder, after readMetadataChunked and in catch a load that is no longer isFolderLoadCurrent(loadId) returns without store writes or toast; finally clears isScanning only for the current load; handleCloseFolder calls beginFolderLoad() and setIsScanning(false). folderLoadId is never reset.`

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/stores/file-store.ts` | `folderLoadId`, `beginFolderLoad`, `isFolderLoadCurrent` |
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | guards in `handleOpenFolder`/`handleRescan`, `handleCloseFolder` |
| `src/renderer/src/App.tsx` | guards in `openFolder` |
| `tests/renderer/components/folder-read-overlap.test.ts` (new) | (o1)–(o16) |
| `tests/renderer/stores/file-store.test.ts` | (f1), additions only |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 14, entry 12 (k7), D-38 bullet, header, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-38 line |

A also writes `a-round-31.md` (and any `a-round-31/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R31-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat bf83c7d`;</li><li>`git diff --quiet bf83c7d -- . ':!<8 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is `folder-read-overlap.test.ts`.</li><li>The src diff is exactly D-38:<ul><li>store: field, action, exported function, `(set, get)`;</li><li>`handleOpenFolder`/`handleRescan`/App `openFolder`: one `beginFolderLoad()` + 3 `return` guards + guarded `finally` each;</li><li>`handleCloseFolder`: 2 lines + dependency;</li><li>2 import lines.</li></ul></li><li>`beginFolderLoad` comes after `if (!path) return;` in `handleOpenFolder`.</li><li>`file-store.test.ts`: additions only.</li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/`.</li><li>`STATE_MANAGEMENT.md`: exactly one added line.</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R31-2 red → green | In a throwaway copy outside the repository, put the `bf83c7d` versions of the three src files with A's tests, and run the renderer suite. Then run the suite on A's tree, and each new test alone with `-t`. | <ul><li>Baseline src: (o1)–(o7), (o9)–(o16), (f1) fail; (o8) and all 240 old tests pass (expected **241 passed / 16 failed**).</li><li>Each red test fails on the symptom (B's `metadata`/`files`, `isScanning`, toast); (o16)/(f1) fail on the missing export. C records the first failing assertion for each.</li><li>A's tree: **257/257** in 14 files.</li><li>Each new test passes alone.</li></ul> |
| R31-3 mutations | In copies of A's tree outside the repository, run `folder-read-overlap.test.ts`, `folder-read-rejected-chunk.test.ts`, `folder-read-during-save.test.ts` and `file-store.test.ts` once per mutant. Give the exact edit for each. GM-1…GM-19 as in `b-round-30-exp/mutants.log`:<ul><li>for each of `handleOpenFolder` / `handleRescan` / App `openFolder`: remove the post-scan guard, the post-read guard or the catch guard, or make `finally` unconditional;</li><li>`handleOpenFolder`/`handleRescan`/App use `getState().folderLoadId` instead of `beginFolderLoad()`;</li><li>Close without `beginFolderLoad()` or without `setIsScanning(false)`;</li><li>`beginFolderLoad()` moved before the dialog;</li><li>`beginFolderLoad` returns the pre-increment id;</li><li>`isFolderLoadCurrent` uses `>=`.</li></ul> | Every mutant is killed, with the killers named. Expected:<ul><li>Open: post-scan (o2), post-read (o1)(o3)(o4)(o5)(o6), catch (o9), finally (o3);</li><li>Close: (o5) twice;</li><li>Rescan: id (o16), post-scan (o13), post-read (o7), catch (o14), finally (o15);</li><li>App: id (o6), post-scan (o11), post-read (o10), catch (o12), finally (o10);</li><li>before-dialog (o8);</li><li>pre-increment and `>=`: many, including (f1).</li></ul>A survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 32. |
| R31-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-30/biome-new.txt` (line shifts allowed).</li><li>Typecheck 0, including `tsc --noEmit -p tsconfig.test.json`.</li><li>Renderer **257**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R31-5 real app, old vs new | Build `bf83c7d` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and `-r harness.cjs` adapted from `c-round-29/harness.cjs`. Harness, with every call logged:<ul><li>a **delay marker** makes `meta:read-batch` for paths under `slow/` wait `R31_DELAY_MS` (5000) before calling the real handler;</li><li>a **reject marker** makes that delayed call throw after the wait;</li><li>a **scan marker** makes `fs:scan-folder` for `slow/` wait 5000 ms.</li></ul>Folders: `slow/` = `s.wav`, `fast/` = `f.wav` (copies of `tests/fixtures/sample.wav`). Drive the UI only; `dialog.showOpenDialog` may be stubbed.<br>**Setup** (fresh copies per scenario, harness disarmed): open `fast`, click `f.wav`, Category `R31Fast`, `Save Tags`, `Tags saved`; open `slow`, click `s.wav`, Category `R31Slow`, Save. Record the sha256 of both and read both with `music-metadata` (`exif:ICAT`) and `ffprobe -show_entries format_tags -of json`.<br>Scenarios (each starts from the setup):<ul><li>**L:** arm delay; Open Folder `slow`, then within 1 s Open Folder `fast`; screenshot when `f.wav` is listed; wait 7 s; screenshot; click `f.wav`; screenshot the form.</li><li>**J:** as L, with delay + reject armed.</li><li>**S:** scan marker armed; Open `slow`, then Open `fast`; wait 7 s; screenshot the list.</li><li>**C:** arm delay; Open `slow`; click the folder `X` (Close) while the spinner shows; screenshot within 500 ms and again after 7 s.</li></ul> | <ul><li>**New build:**<ul><li>L: after 7 s `f.wav` keeps `Tagged`, its form shows Category `R31Fast`, no toast;</li><li>J: same, and no `Failed to read` toast;</li><li>S: the list shows `f.wav` only, with `Tagged`;</li><li>C: the "Open a folder to start tagging WAV files" prompt shows within 500 ms (no spinner), and the list is still empty after 7 s.</li></ul></li><li>**Old build (red):**<ul><li>L: after the slow read lands, `f.wav` loses `Tagged` and its Category is empty;</li><li>J: `Failed to read 1 files` appears after `fast` loaded, and `f.wav` loses `Tagged`;</li><li>S: after the slow scan lands, the file list shows `s.wav` instead of `f.wav` while the folder label still reads `fast`;</li><li>C: the spinner shows until the delayed read lands.</li></ul>If the old build does not show a listed symptom, C reports it with the harness log. The round is not PASS until B re-plans, unless C shows the timing made the step a no-op on both builds; then C reruns with a longer delay.</li><li>**All runs:**<ul><li>the sha256 of `s.wav`/`f.wav` is unchanged by every folder action after setup;</li><li>both readers show `ICAT=R31Slow` / `R31Fast`, field by field;</li><li>`pageErrors` is empty.</li></ul></li><li>Drop is not driven in the real app (Playwright cannot set a native path on a drop); (o6), (o10)–(o12) cover it. Rescan→Open is unit-only ((o7), (o13)–(o15)). C states both.</li><li>Artists are record only (TM-B08).</li></ul> |
| R31-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` D-38 line on A's tree, against A's src and D-38 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 14:<ul><li>marked `გასწორდა (D-38, TM-B33)`;</li><li>names (o1)–(o16) and (f1) by full test name (grep, 1 match each in docs and in tests);</li><li>states reachability and that nothing on disk changes.</li></ul></li><li>Entry 12 names (k7).</li><li>The D-38 bullet matches the code.</li><li>Header lists (3), (9), (11), (12), (13), (14) as fixed; `წყარო` has TM-B33.</li><li>Every `file:line` in the file points at the described code on A's tree; C greps each, and a wrong number is a FAIL.</li><li>Entries 1–10 are unchanged apart from listed shifts.</li><li>The README row reads exactly `ცნობილი შეზღუდვების სია (14 ჩანაწერი; 6 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li><li>The STATE_MANAGEMENT D-38 line is present once.</li></ul> |

## What could break (C re-checks)
- **D-35 (r1)–(r8), (g2), (u1):** a save pending during a folder load. The guard must not drop the current load's `applyMetadataRead`. The stray-key case after a folder switch (RR-R28-03 / RR-R30-01) is unchanged and not asserted.
- **D-36 (k1)–(k7), (g3), (u2), (u3)** and **D-37 (e1)–(e4):** toast and empty-folder clear still fire for the current load.
- **D-33/D-34 (s1)–(s15), (g1):** the schema path is untouched.
- **Normal flows:**
  - Open Folder / Rescan / drop of a single load, E2E `folder-workflow.spec.ts`;
  - the error toasts `Failed to open folder` / `Rescan failed` / `Failed to scan folder` for a current load;
  - Close Folder still clears folder, files, metadata, selection, player and editing.
- **D-29:** Open Folder while dirty still shows `Unsaved changes were discarded`. The selection is cleared before the scan, as before.
- **`isScanning`:** Rescan is still disabled during a load; the spinner still shows during a single load.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R31-1…R31-4 and R31-6 are real local checks.
- R31-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B33, RR-R29-03 and A-R30-01.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 32 fixes it first (test-on-bugfix).
- Otherwise: **RR-R28-03 / A-R19-02 / RR-R30-01**, the save re-read after a folder switch. Record the `folderLoadId` at save start in `handleSave`, and skip the re-read store write when it changed. B reproduces it red first.
- Everything else waits on Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01) or on root's Actions link (TM-T0-CI/TM-B14).
