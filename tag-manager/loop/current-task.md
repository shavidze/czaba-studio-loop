# CURRENT TASK — Round 30: TM-B32 — Open Folder / drop of an empty folder clears metadata (D-37), plus the two-rejected-chunk test gap (C-R29-01)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 29: C PASS** (R29-1…R29-6, realVerified=true). TM-B31 (D-36) is **done**. Root published `20967a0` (round 29), and the review returned COMMIT OK with no medium finding. `20967a0` is the baseline.
- **No critical or high bug is open.** C reported two low findings. Both concern the folder-read flow D-35/D-36 and touch the same files, so they come first (C's bugs before features):
  - **C-R29-02 (= A-R29-02).** The D-35 bullet in `docs/bugs/001` (`:14`) and the D-35 line in `STATE_MANAGEMENT.md` (`:31`) say that the empty-folder path calls `setMetadata({})`. In the code only `handleRescan` does that (`FolderBrowser.tsx:177-179`). `handleOpenFolder` (`:108-127`) and App `openFolder` (`App.tsx:60-79`, used by drop) leave the old folder's entries in `metadata`.
    - **B's red reproduction** on `20967a0`: `b-round-29-exp/b-r30-empty-folder.test.ts` and `red-run.log`:
      - (x1) Open Folder of an empty folder → `metadata` still holds `/music/a.wav` and `/music/b.wav`;
      - (x2) App drop of an empty folder → same;
      - (x3) empty folder, then Open Folder `/music` whose only read chunk rejects → the stale entries come back as if they were current. Expected was `{}` + toast, which is what D-36 (k5) gives after a **non-empty** other folder;
      - (x4) Rescan of a now-empty folder → `{}` (green).
    - **History.** `6ecfb40` added the `else { setMetadata({}); }` to Rescan only. No D-ID ever chose different behaviour for Open Folder or drop.
    - **The fix.** A two-line `else` in each caller (`b-round-29-exp/prototype.diff.txt`) turns (x1)–(x3) green, and the whole renderer suite passes, 239/239 (`green-run.log`).
    - **Severity: low.** The stale keys are invisible until a later read of the old folder rejects; then they are shown as if they were current. Nothing is written to disk.
    - **Why code, not docs only.** Three texts already state the intended rule (the docs, STATE_MANAGEMENT and the round-29 task). Close Folder and Open Folder of a non-empty folder both drop the old entries. Leaving the code as it is would keep RR-R28-03-class stray keys.
  - **C-R29-01 (= A-R29-01, confirmed).** No test rejects two chunks. C's mutant EX-1 (`failedPaths.splice(0, failedPaths.length, ...chunk)`, which keeps only the last rejected chunk) survives the whole renderer suite. This round adds one unit test, (u3).
- **Reference-first rule:** exempt. This is a pure bug fix plus a test. It adds no new UX element and no new toast text.
- **Not in this round** (each recorded in the backlog, none dropped):
  - **TM-B33 / RR-R29-03:** two overlapping folder reads, where the last to finish wins. Not reproduced yet, and the fix needs a read-sequence design that interacts with D-35. B reproduces it first.
  - **RR-R29-02:** the `loadFolderMetadata` helper (architecture signal).
  - **RR-R15-04:** the toast wording `1 files` (four sites at once if ever changed).
  - **RR-R28-03 / A-R19-02:** the save re-read landing after a folder switch.
  - **C-R25-01:** recorded as a pure signal (see `b-round-29.md`).

## Baseline
- HEAD must be `20967a001e3b8adc59f99344bc802483e4f8dcce` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `20967a0` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `20967a0`): every path not listed under File ownership. In particular:
  - `src/renderer/src/lib/utils.ts`;
  - `src/renderer/src/stores/file-store.ts`;
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`;
  - `tests/renderer/components/folder-read-during-save.test.ts`;
  - `tests/renderer/stores/file-store.test.ts`;
  - `tests/renderer/components/metadata-panel-*.test.ts`;
  - `tests/renderer/helpers/**`;
  - `tests/renderer/setup.ts`;
  - `src/main/**`;
  - `src/renderer/src/types/**`.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`.

## Scope

### Part A — D-37: an empty folder clears `metadata` in all three callers (renderer only)
- `FolderBrowser.tsx` `handleOpenFolder`: after the `if (wavFiles.length > 0) { … }` block, add `else { setMetadata({}); }`, the same shape as `handleRescan` (`:177-179`).
- `App.tsx` `openFolder`: the same `else { setMetadata({}); }`.
- `setMetadata` is already in both `useCallback` dependency arrays, so no dependency change is needed.
- No toast on an empty folder (unchanged). `setFiles(wavFiles)` stays as it is.
- Unchanged:
  - the success path (D-35/D-36);
  - the error paths (Open Folder / drop: `setFiles([])` + `setMetadata({})` + toast; Rescan: toast only, `files`/`metadata` kept);
  - `handleRescan`;
  - `handleCloseFolder`;
  - `clearSelection()`, `isScanning`, the player stop;
  - the `meta as Record<…>` casts.
- Biome must stay at 0 errors and **8** warnings, with the same list as `c-round-29/biome-new.txt`. Line shifts are allowed.

### Part B — tests first (red on `20967a0` src where marked)

**`tests/renderer/components/folder-read-rejected-chunk.test.ts`:** additions only.
- Add a new `describe("empty folder clears store metadata (TM-B32, D-37)", …)` after the existing describe.
- Reuse the file's helpers (`seedTwoFiles`, `renderBrowserAndPanel`, `clickButton`, `dropFolder`, `FILE_A`/`FILE_B`). A new constant `EMPTY_FOLDER = "/empty"` is allowed.
- Existing (k1)–(k7) lines must not change.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (e1) | `seedTwoFiles([])`; `openFolderDialog` → `/empty`; `scanFolder` → `[]`; Open Folder | `files` `[]`; `metadata` toEqual `{}`; `folderPath` `/empty`; `readMetadataBatch` not called; `toastMessage` `null` | **red** (metadata keeps a, b) |
| (e2) | `App`, `loadSchema` → `STANDARD_FIELDS`, `seedTwoFiles([])`; `resolveDroppedPaths` → `{ folders: ['/empty'], wavFiles: [] }`; `scanFolder` → `[]`; drop | same as (e1) | **red** |
| (e3) | `seedTwoFiles([])`; `openFolderDialog` → `/empty`, then `/music`; `scanFolder` → `[]`, then `[FILE_A, FILE_B]`; the only `readMetadataBatch` chunk **rejects**; Open Folder twice | `metadata` toEqual `{}` (no stale entry comes back); `files` 2; toast `Failed to read 2 files`, type `error` | **red** (metadata = OLD_A, OLD_B) |
| (e4) pin | `seedTwoFiles([])`; `scanFolder` → `[]`; Rescan | `metadata` `{}`; `files` `[]`; `toastMessage` `null` | green |

- `dropFolder` drops `FOLDER`. (e2) relies on `resolveDroppedPaths` returning `/empty`, so the dropped path does not matter. A may add a parameter to a **new** helper but must not change `dropFolder`.
  - If (e2) needs the schema-load wait, use the same wait as (k3). B's experiment waited 100 ms in `act` before the drop.

**`tests/renderer/utils/utils.test.ts`:** additions only.
- Add (u3) inside the existing `describe("readMetadataChunked failedPaths (TM-B31, D-36)")`, after (u2).

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (u3) | 151 paths `/m/0.wav…/m/150.wav` = **four** chunks (50, 50, 50, 1). Mock sequence (same style as (u2)): chunk 1 **rejects**, chunk 2 resolves, chunk 3 **rejects**, chunk 4 resolves. Generation `() => 7` | `failedPaths` toEqual `[...paths.slice(0, 50), ...paths.slice(100, 150)]`; `failures === 100`; `Object.keys(data)` and `Object.keys(readGenerations)` toEqual `[...paths.slice(50, 100), '/m/150.wav']`; every `readGenerations` value is 7; `/m/150.wav` is not in `failedPaths` | green (test gap) |

- Restore the mock in `finally`, as (u2) does.
- **(u3)'s purpose:** it must kill **EX-1** (`failedPaths.splice(0, failedPaths.length, ...chunk)` at `utils.ts:72`) and **EX-2** (`if (failedPaths.length === 0) failedPaths.push(...chunk);`). A runs both mutants in a throwaway copy outside the repository and records them in `a-round-30.md`.
- **Totals:** 5 new `it`s, so renderer 235 + 5 = **240**, in **13** files.
  - A records the red run on the baseline src in `a-round-30.md`: **3 red / 2 green** among the new tests ((e1)(e2)(e3) red; (e4)(u3) green). For each test, A records the first failing assertion.
  - Every old test stays green.

### Part C — docs (Georgian, English technical terms)
- **`docs/bugs/001-save-and-selection-known-limits.md`:**
  - **New entry `## 13.`** "ცარიელი folder-ის Open Folder / drop ძველ `metadata`-ს ტოვებდა", in the layout of entry 12:
    - ID `C-R29-02, A-R29-02, TM-B32`; severity low;
    - files with `file:line` on A's tree;
    - reproduction:
      - start state (`/music` open, entries in the store);
      - action (Open Folder or drop of a folder with no WAV);
      - result before the fix: `files` empty but the old entries stay; a later Open Folder of `/music` whose read rejects shows them as current, unlike a non-empty other folder (D-36 (k5));
      - nothing on disk changes;
    - decision D-37;
    - the full names of (e1)–(e4);
    - `გასწორდა (D-37, TM-B32)`.
  - **Entry 12:** append (u3)'s full name to the test list.
  - **D-35 bullet:** replace the sentence `error path-ები და ცარიელი folder კვლავ setMetadata({})-ს იძახებენ.` with an exact statement:
    - Open Folder / drop error → `setFiles([])` + `setMetadata({})` + toast;
    - Rescan error → toast only, `files` and `metadata` kept;
    - empty folder → `setMetadata({})` in all three (D-37).
  - Re-point every shifted `FolderBrowser.tsx` / `App.tsx` line ref in the D-35 and D-36 bullets and in entries 11–12. `handleRescan` moves down by 2.
  - **New D-37 bullet.**
  - **Header:**
    - title line: unchanged (it still reads `(D-29, D-30, D-31)`, as in rounds 24–29);
    - "(3), (9), (11), (12) და (13)" are listed as fixed;
    - `**წყარო:**` adds `TM-B32 (round 30)`.
  - Every `file:line` in the file must point at A's tree. Entries 1–10: no change except listed line-number shifts.
- **`docs/bugs/README.md`:** row 001 status reads exactly `ცნობილი შეზღუდვების სია (13 ჩანაწერი; 5 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- **`.claude/primitives/STATE_MANAGEMENT.md`** (Edit tool, path (b)):
  - in the D-35 line, replace only the trailing clause `error and empty-folder paths keep setMetadata({})` with `error paths: Open Folder/drop setFiles([]) + setMetadata({}), Rescan toast only; empty folder: setMetadata({}) in all three (D-37)`;
  - add no new line, unless the replacement does not fit. In that case add one line `Empty folder (D-37): …` right after the D-36 line and say so in `a-round-30.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | Part A: `handleOpenFolder` `else` |
| `src/renderer/src/App.tsx` | Part A: `openFolder` `else` |
| `tests/renderer/components/folder-read-rejected-chunk.test.ts` | (e1)–(e4), additions only |
| `tests/renderer/utils/utils.test.ts` | (u3), additions only |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 13, entry 12 (u3), D-35 sentence, D-37 bullet, header, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | D-35 trailing clause (or one D-37 line) |

A also writes `a-round-30.md` (and any `a-round-30/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R30-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 20967a0`;</li><li>`git diff --quiet 20967a0 -- . ':!<7 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; no untracked file.</li><li>The src diff is exactly the two `else { setMetadata({}); }` blocks (no other line in `FolderBrowser.tsx` / `App.tsx`, no dependency array change).</li><li>Both test files: additions only (`git diff` shows no `-` line except hunk context).</li><li>No comment, `any`, `@ts-ignore` or `as` added in `src/`.</li><li>`STATE_MANAGEMENT.md`: only the D-35 trailing clause changed (or exactly one D-37 line added, as A reports).</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R30-2 red → green | In a throwaway copy outside the repository, use the `20967a0` versions of `FolderBrowser.tsx` and `App.tsx` with A's test files, and run the renderer suite. Then run the suite on A's tree, and each new test alone with `-t`. | <ul><li>Baseline src: (e1)(e2)(e3) fail; (e4), (u3) and all 235 old tests pass (expected **237 passed / 3 failed**).</li><li>Each red test fails on the symptom (`metadata` still holds the `/music` entries), not on setup. C records the first failing assertion.</li><li>A's tree: **240/240** in 13 files.</li><li>Each new test passes alone.</li></ul> |
| R30-3 mutations | In copies of A's tree outside the repository, run `folder-read-rejected-chunk.test.ts`, `folder-read-during-save.test.ts`, `file-store.test.ts` and `utils.test.ts` once per mutant. Give the exact edit for each:<ul><li>**EX-1:** `utils.ts:72` `failedPaths.splice(0, failedPaths.length, ...chunk)`;</li><li>**EX-2:** `if (failedPaths.length === 0) failedPaths.push(...chunk);`;</li><li>**ME-1:** remove the new `else` in `handleOpenFolder`;</li><li>**ME-2:** remove the new `else` in App `openFolder`;</li><li>**ME-3:** remove the `else` in `handleRescan`;</li><li>**ME-4:** the new `else` in `handleOpenFolder` also calls `showToast('Folder is empty', 'error')`;</li><li>**ME-5:** instead of the `else`, `handleOpenFolder` calls `setMetadata({})` unconditionally right after `scanFolder` resolves (empty and non-empty folders alike).</li></ul> | Every mutant is killed, with the killers named. Expected:<ul><li>EX-1, EX-2: (u3);</li><li>ME-1: (e1)(e3);</li><li>ME-2: (e2);</li><li>ME-3: (e4);</li><li>ME-4: (e1);</li><li>ME-5: (k2) (the same folder with a rejected read must keep its entries); C also names any (r*) killer.</li></ul>A survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 31. |
| R30-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-29/biome-new.txt` (line shifts allowed).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **240**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R30-5 real app, old vs new | Build `20967a0` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and `-r harness.cjs` adapted from `c-round-29/harness.cjs` (a marker file arms a `meta:read-batch` throw; every call is logged).<br>Folders:<ul><li>`m/` = `a.wav`, `b.wav` (copies of `tests/fixtures/sample.wav`);</li><li>`empty/` = no WAV (it may hold a `.txt`);</li><li>`o/` = `c.wav`, `d.wav`.</li></ul>Drive the UI only; the folder dialog may be stubbed.<br>**Setup** (per scenario, fresh copies): open `m`, click `a.wav`, set Category `R30Cat`, `Save Tags`, wait for `Tags saved`. Record the sha256 of `a.wav`/`b.wav` and read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and `ffprobe -show_entries format_tags -of json`.<br>**Scenario E:** Open Folder → `empty` (screenshot: empty list, no toast); arm; Open Folder → `m`; screenshot the list and the toast; disarm; click `a.wav`; screenshot the form.<br>**Scenario O (control):** same steps with `o` instead of `empty`.<br>**Scenario R:** after E, Rescan with the harness disarmed. | <ul><li>**New build:**<ul><li>E equals O: `a.wav` has no `Tagged` badge, the form's Category is empty, toast `Failed to read 2 files`;</li><li>`empty` shows an empty list and no toast;</li><li>R: `a.wav` is `Tagged` again with `R30Cat`, no error toast.</li></ul></li><li>**Old build (red):**<ul><li>E: `a.wav` keeps `Tagged` and shows `R30Cat` (the stale entry comes back), toast `Failed to read 2 files`;</li><li>O: same as new O.</li></ul>If the old build does not show this, C reports it with the log, and the round is not PASS until B re-plans.</li><li>**All runs:**<ul><li>sha256 of both files is unchanged by every folder action;</li><li>both readers show `ICAT=R30Cat` for `a.wav`, field by field;</li><li>`pageErrors` is empty.</li></ul></li><li>Drop is not driven in the real app (Playwright cannot set a native file path on a drop); (e2) covers it. C states this.</li><li>Artists are record only (TM-B08).</li></ul> |
| R30-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` D-35 line on A's tree, against A's src and D-37 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 13:<ul><li>marked `გასწორდა (D-37, TM-B32)`;</li><li>names (e1)–(e4) by full test name (grep, 1 match each);</li><li>states that nothing on disk changes.</li></ul></li><li>Entry 12 names (u3) by full test name.</li><li>The D-35 bullet's error / empty-folder sentence matches the code of all three callers (C reads each `catch` and `else`).</li><li>Header lists (3), (9), (11), (12) and (13) as fixed; `წყარო` has TM-B32; there is a D-37 bullet.</li><li>Every `file:line` points at the described code on A's tree; C greps each, and a wrong number is a FAIL.</li><li>Entries 1–10 are unchanged apart from listed shifts.</li><li>The README row reads exactly `ცნობილი შეზღუდვების სია (13 ჩანაწერი; 5 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li><li>STATE_MANAGEMENT: the D-35 line no longer claims a uniform error path.</li></ul> |

## What could break (C re-checks)
- **D-36 (k1)–(k7), (g3), (u2):** in particular (k5) (another non-empty folder with a rejected read, `{}`) and (k2) (the same folder with a rejected read keeps the entries).
- **D-35 (r1)–(r8), (g2), (u1):** a save pending while Open Folder → empty folder: the save's re-read still lands through `updateFileMetadata` (a stray key, RR-R28-03, unchanged and not asserted).
- **D-33/D-34 (s1)–(s15), (g1).**
- **Normal flows:** Open Folder / Rescan / drop of a non-empty folder, E2E `folder-workflow.spec.ts`. The error-path toasts `Failed to open folder` / `Rescan failed` / `Failed to scan folder` are unchanged. `handleCloseFolder` still clears everything.
- **D-29:** Open Folder → empty while dirty still shows `Unsaved changes were discarded`. The selection is cleared before the scan, as before.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R30-1…R30-4 and R30-6 are real local checks.
- R30-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B32, C-R29-01, A-R29-01, C-R29-02 and A-R29-02.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 31 fixes it first (test-on-bugfix).
- Otherwise: **TM-B33** (RR-R29-03, two overlapping folder reads). B first reproduces it red in a throwaway copy:
  - Open Folder A, then Open Folder B, with A's read resolving last;
  - expected symptom: B's files are listed with A's metadata, and B's paths have no entry.
  - B then designs a read-sequence guard that composes with the D-35 generations (RR-R29-02's single `loadFolderMetadata` helper is the natural place).
- Everything else waits on Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01) or on root's Actions link (TM-T0-CI/TM-B14).
