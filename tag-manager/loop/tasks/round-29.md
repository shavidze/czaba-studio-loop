# CURRENT TASK — Round 29: TM-B31 — a rejected folder-read chunk silently drops entries (D-36), plus docs/bugs/001 entry 11 completion

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 28: C PASS** (R28-1…R28-6, realVerified=true, 0 bugs). TM-B30 (D-35) is **done**. Root published `b182557` (rounds 26–28) and the review returned COMMIT OK with no medium finding. `b182557` is the baseline.
- **No critical or high bug is open.** The open medium items do not depend on this round:
  - TM-T1-DUP/RR-R3-01 and RR-R19-01 wait on Saba's question batch;
  - B-R26-01 belongs to root.
- **Next dependency-ordered item: B-R27-01**, which round 28's "Next" named. It becomes **TM-B31**.
  - **What goes wrong.** `readMetadataChunked` counts a rejected chunk in `failures` (`src/renderer/src/lib/utils.ts:70-71`), but none of the three callers reads `failures`. `applyMetadataRead` replaces `metadata`, so the paths of the rejected chunk disappear from the store. The rows lose their values and the `Tagged` badge, a selected file shows an empty form, and no toast appears.
  - **Why this contradicts the app.** The schema path already does the opposite (D-33): it keeps the current entry and shows `Failed to read N files`.
  - **B's red reproduction** on `b182557` (`b-round-28-exp/b-r29-rescan-reject.test.ts`, `red-run.log`): a.wav and b.wav are seeded, the only `readMetadataBatch` rejects, and Rescan is clicked. Result: `metadata` keys `[]`, `files` 2, `toastMessage` `null`.
  - **Reachability.** Main's `meta:read-batch` catches per-file errors and returns `emptyMetadata` (`src/main/ipc/metadata.ts:233-247`), so a chunk rejects only at IPC level. The consequence is display-only: a later single save sends only defined fields (`metadata.ts:170-171`), so nothing on disk is erased. Severity stays **low**.
- **Bundled (same file, same flow):** three docs gaps in `docs/bugs/001` entry 11, found by A and root in round 28:
  - **A-R28-02:** (r8) is not named in the test list;
  - **A-R28-01 / RR-R28-02:** the single-chunk read + rejected save re-read case is not described;
  - **RR-R28-01:** the "superseded path with no entry is absent" case is not described.
- **Reference-first rule:** exempt. This is a pure bug fix. It reuses the app's own existing toast for the same condition (D-33) and adds no new UX element.
- **Not in this round:** C-R25-01 (test hygiene in a different file, a different class).

## Baseline
- HEAD must be `b182557baf43c21d10844e15027f9df5e0be9347` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `b182557` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `b182557`): every path not listed under File ownership. In particular:
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`;
  - `tests/renderer/components/folder-read-during-save.test.ts` (R28; its tests must stay green unchanged);
  - `tests/renderer/components/metadata-panel-schema-change.test.ts`;
  - `tests/renderer/components/metadata-panel-batch-save.test.ts`;
  - `tests/renderer/helpers/**`;
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

## Scope (D-36, renderer only)

### Part A — `src/renderer/src/lib/utils.ts` (`readMetadataChunked`)
- Add `failedPaths: string[]` to the return value. It holds every path of every rejected chunk, in `paths` order.
- `failures` stays, and must equal `failedPaths.length`.
- `data` and `readGenerations` are unchanged (D-35). The generation is still taken once per chunk, before `readMetadataBatch`.
- Still no store import in `lib/utils.ts`.

### Part B — `src/renderer/src/stores/file-store.ts` (`applyMetadataRead`)
- New signature: `applyMetadataRead(read, readGenerations, keptPaths: string[]) => void`. `keptPaths` is a **required** third parameter, with no `?` and no default, so `tsc` forces every caller to decide. Update the declaration in `FileState`.
- The D-35 loop over `read` is unchanged.
- Then, for every path in `keptPaths`: `metadata[path] = state.metadata[path]` if that entry exists; otherwise the path stays absent.
  - The entry is the one **current at store-write time** (inside the same `set`). It is not a snapshot taken before the read.
- No new state. `writeGeneration`, `pathWriteGenerations`, `files` and `selectedPaths` are untouched.

### Part C — callers (success path only)
- Callers: `FolderBrowser.tsx` `handleOpenFolder` (`:111-118`) and `handleRescan` (`:153-160`), and `App.tsx` `openFolder` (`:63-70`).
- Destructure `failures` and `failedPaths` too, and pass `failedPaths` as the third argument of `applyMetadataRead`.
- After `applyMetadataRead`, if `failures > 0`, call `useMetadataStore.getState().showToast(\`Failed to read ${failures} files\`, 'error')`.
  - The text must match D-33 (`MetadataPanel.tsx:252`) **exactly**.
  - No toast when `failures` is 0.
- Unchanged:
  - the error paths (`setMetadata({})` + their toasts);
  - the empty-folder `setMetadata({})`;
  - `handleCloseFolder`;
  - `clearSelection()`;
  - `isScanning`;
  - the `meta as Record<…>` casts (B-R21-03).
- No new `useCallback` deps unless a selector-bound function is used.
- Biome must stay at 0 errors and **8** warnings, with the same list. Line shifts are allowed.

### Part D — tests first (red on `b182557` src, then green)

**New file `tests/renderer/components/folder-read-rejected-chunk.test.ts`:**
- Use the same `vi.hoisted` window swap, `resetAllStores()`, `resetWindowApiMocks()` and local defaults for `openFolderDialog` / `loadSchema` / `resolveDroppedPaths` as `folder-read-during-save.test.ts`.
- Helpers may be copied into the new file (that file is frozen; the duplication is a known signal, RR-R17-02).
- Seed: `folderPath: '/music'`, `a.wav`/`b.wav` with `OLD_A`/`OLD_B` (Category `ACat`/`BCat`).
- Read the toast from `useMetadataStore.getState().toastMessage` / `toastType`.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (k1) | no save; Rescan; the only `readMetadataBatch` chunk **rejects** | `metadata` equals `{a: OLD_A, b: OLD_B}`; `files` has 2 entries; toast `Failed to read 2 files`, type `error` | **red** |
| (k2) | same, via `Open Folder` → `'/music'` (same folder) | same as (k1) | **red** |
| (k3) | `App`, `loadSchema` → `STANDARD_FIELDS`, store seeded as above; drop `/music` (`resolveDroppedPaths` → `{ folders: ['/music'], wavFiles: [] }`); the read rejects | same as (k1) | **red** |
| (k4) | 51 files seeded with old values; `scanFolder` returns them in order, z = the 51st; Rescan; chunk 1 resolves with new values (e.g. Category `ExtCat`), chunk 2 **rejects** | the 50 chunk-1 paths have the read values; z keeps its seeded entry; toast `Failed to read 1 files` | **red** |
| (k5) | store seeded for `/music`; `Open Folder` → `'/other'` (2 new paths, not in the store); the read rejects | `metadata` equals `{}` (old folder dropped, new paths absent: no entry to keep); `files` = the 2 `/other` files; toast `Failed to read 2 files` | **red** (toast) |
| (k6) | single save of a pending (write deferred, re-read → `NEW_A` with `R29Cat`); Rescan with the read deferred; release the write (re-read applied); **then** reject the rescan read | `metadata[a]` equals `NEW_A` (the entry current at store-write time), `metadata[b]` equals `OLD_B`; final toast `Failed to read 2 files` | **red** |
| (k7) pin | no save; Rescan; the read resolves for both | `metadata` = the read; `toastMessage` is `null` (no error toast for 0 failures) | green |

**In existing files:**

| Test | File | Assert | Baseline |
|---|---|---|---|
| (g3) | `tests/renderer/stores/file-store.test.ts`, new `describe("applyMetadataRead keptPaths (TM-B31, D-36)")` | state `metadata {a: A0, c: C0}`, `pathWriteGenerations {b: 2}`; `read {b: B1, d: D1}`, `readGenerations {b: 1, d: 1}`, `keptPaths ['a', 'e']` → `metadata` equals `{a: A0, d: D1}`: a kept, e kept with no entry so absent, b superseded with no entry so absent, c dropped. `writeGeneration`, `pathWriteGenerations`, `files`, `selectedPaths` unchanged | **red** |
| (u2) | `tests/renderer/utils/utils.test.ts`, new `describe("readMetadataChunked failedPaths (TM-B31, D-36)")` | 101 paths, chunk 2 rejects, chunks 1 and 3 resolve: `failedPaths` toEqual `paths.slice(50, 100)`; `failures === 50`; `/m/100.wav` and chunk-1 paths are not in `failedPaths` | **red** |

- **Allowed edit to an existing test:** exactly one. In `file-store.test.ts` (g2) (`:352`), the call `.applyMetadataRead({ a: a1, b: b1, d: d1, e: e1 }, { a: 1, b: 1, d: 1, e: 2 })` gains a third argument `[]`. Nothing else in existing tests changes.
  - The required parameter would otherwise fail `tsconfig.test.json` typecheck.
  - (u1) needs no change, since its assertions are field-by-field.
- **One `it` per row.** The new file has 7 `it`s, and (g3) and (u2) are one `it` each. The expected renderer total is 226 + 9 = **235**, in **13** files.
- A records the red run on the baseline src in `a-round-29.md`, per test: the first failing assertion and the symptom (entry `undefined`, toast `null`, `failedPaths` `undefined`). Expected: **8 red / 1 green** among the new tests. Every old test, including all of R28's (r1)–(r8), (g2) and (u1), stays green.

### Part E — docs (Georgian, English technical terms)
- **`docs/bugs/001-save-and-selection-known-limits.md`:**
  - **New entry `## 12.`** "folder read-ის reject-ილი chunk", in the layout of entry 11:
    - ID `B-R27-01, TM-B31`; severity low;
    - files with `file:line`;
    - reproduction:
      - start state;
      - action (IPC-level reject of a chunk during Rescan / Open Folder / drop);
      - result before the fix: entries removed, `Tagged` lost, empty form, no toast;
      - reachability: main returns `emptyMetadata` per file, so only an IPC-level reject applies, and the effect is display-only;
    - decision D-36;
    - the remaining limit: a per-file read error still comes back as `emptyMetadata` (RR-R13-01);
    - the full names of (k1)–(k6);
    - `გასწორდა (D-36, TM-B31)`.
  - **Entry 11 additions:**
    - add (r8)'s full name to the test list (A-R28-02);
    - in the decision paragraph, replace the "დარჩენილი შეზღუდვა: B-R27-01 …" sentence with a pointer to entry 12 (fixed);
    - add two known-limit sentences:
      - (A-R28-01/RR-R28-02) a single-chunk folder read issued before the write, with the save's re-read rejected (D-24): the path is superseded and keeps its pre-save store entry until the next successful read;
      - (RR-R28-01) a superseded path with no store entry (e.g. Open Folder of another folder while a write to that path is pending) stays absent, and the form is empty until the next successful read.
  - **Header:** "(3), (9), (11) და (12)" are listed as fixed; `**წყარო:**` adds TM-B31 (round 29).
  - **D-35 bullet:** re-point its `file-store.ts`, `utils.ts`, `FolderBrowser.tsx` and `App.tsx` line refs if they shifted, and update its `applyMetadataRead(read, readGenerations)` signature to the three-parameter form.
  - **New D-36 bullet.**
  - Every `file:line` in the file must point at A's tree. Entries 1–10: no change except listed line-number shifts.
- **`docs/bugs/README.md`:** row 001 status reads exactly `ცნობილი შეზღუდვების სია (12 ჩანაწერი; 4 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- **`.claude/primitives/STATE_MANAGEMENT.md`:** one added line after the D-35 line (Edit tool, path (b) permission): `Rejected folder-read chunk (D-36): …`. It states:
  - `readMetadataChunked` returns `failedPaths`;
  - `applyMetadataRead(read, readGenerations, keptPaths)` keeps the current entry for kept paths, or absent if none;
  - Rescan, Open Folder and drop show `Failed to read N files` when failures > 0.
  - In the D-35 line, change only the signature token `applyMetadataRead(read, readGenerations)` to `applyMetadataRead(read, readGenerations, keptPaths)`, so it does not go stale. Nothing else in that line changes.

### Not in this round
- RR-R28-03 / A-R19-02: a stray old-folder key after a folder switch.
- RR-R28-05: moving `handleSchemaChanged` onto `applyMetadataRead`.
- RR-R13-01: per-file read errors (protected preload).
- Disabling Rescan during a save (B-R27-02, Saba).
- C-R25-01, TM-B06, any `MetadataPanel` or `src/main` change.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/lib/utils.ts` | Part A: `failedPaths` |
| `src/renderer/src/stores/file-store.ts` | Part B: `keptPaths` |
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | Part C: `handleOpenFolder`, `handleRescan` |
| `src/renderer/src/App.tsx` | Part C: `openFolder` |
| `tests/renderer/components/folder-read-rejected-chunk.test.ts` (new) | (k1)–(k7) |
| `tests/renderer/stores/file-store.test.ts` | (g3) additions + the one (g2) call argument |
| `tests/renderer/utils/utils.test.ts` | (u2), additions only |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 12, entry 11 additions, header, D-36 bullet, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | one D-36 line |

A also writes `a-round-29.md` and `a-round-29-*.json` in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R29-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat b182557`;</li><li>`git diff --quiet b182557 -- . ':!<10 owned paths>'`.</li></ul>Read the full diff and A's result JSON / transcript. | <ul><li>Only the 10 owned paths changed; exactly one untracked file (the new test).</li><li>`folder-read-during-save.test.ts`, MetadataPanel and the metadata-panel tests are byte-identical.</li><li>`lib/utils.ts` imports no store.</li><li>`keptPaths` is required (no `?`, no default).</li><li>`file-store.ts` changes only `applyMetadataRead` (interface + implementation).</li><li>The callers change only the success path: destructure, third argument, `failures > 0` toast with the exact D-33 text.</li><li>Existing test diffs:<ul><li>`file-store.test.ts`: additions plus exactly the one (g2) call line;</li><li>`utils.test.ts`: additions only.</li></ul></li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/`.</li><li>`STATE_MANAGEMENT.md`: one added D-36 line, plus the D-35 line changed only in its `applyMetadataRead` signature token.</li><li>No Bash write to repository files; "unknown" if no transcript (not a FAIL).</li></ul> |
| R29-2 red → green | In a throwaway copy outside the repository, use the `b182557` src (the 4 owned src files from `git show b182557:`) with A's test files, and run the renderer suite. Then run the suite on A's tree, and each new test alone with `-t`. | <ul><li>Baseline src: (k1)–(k6), (g3) and (u2) fail; (k7) and all 226 old tests pass (expected **227 passed / 8 failed**).</li><li>Each red test fails on the symptom (entry `undefined` / `{}`, toast `null`, `failedPaths` `undefined`), not on setup. C records the first failing assertion.</li><li>A's tree: **235/235** in 13 files.</li><li>Each new test passes alone.</li></ul> |
| R29-3 mutations | In copies of A's tree outside the repository, run the new test file plus `file-store.test.ts`, `utils.test.ts` and `folder-read-during-save.test.ts` once per mutant. Adapt each to A's code shape and give the exact edit:<ul><li>**MK-1:** `applyMetadataRead` ignores `keptPaths`.</li><li>**MK-2:** a kept path with no entry gets `{}`.</li><li>**MK-3:** kept entries come from a `metadata` snapshot taken before `readMetadataChunked` (caller-side), not from state at store-write time.</li><li>**MK-4:** toast when `failures >= 0`.</li><li>**MK-5:** `handleRescan` drops the toast.</li><li>**MK-6:** `handleOpenFolder` drops the toast.</li><li>**MK-7:** App `openFolder` drops the toast.</li><li>**MK-8:** `failedPaths` also receives the paths of resolved chunks.</li><li>**MK-9:** `handleRescan` passes `[]` instead of `failedPaths`.</li><li>**MK-9b:** `handleOpenFolder` passes `[]`.</li><li>**MK-9c:** App `openFolder` passes `[]`.</li></ul> | Every mutant is killed, with the killers named. Expected:<ul><li>MK-1: (k1)(k2)(k3)(k4)(k6)(g3)</li><li>MK-2: (g3)</li><li>MK-3: (k6)</li><li>MK-4: (k7)</li><li>MK-5: (k1)(k4)(k6)</li><li>MK-6: (k2)(k5)</li><li>MK-7: (k3)</li><li>MK-8: (u2)</li><li>MK-9: (k1)(k4)(k6)</li><li>MK-9b: (k2)</li><li>MK-9c: (k3)</li></ul>A survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 30. |
| R29-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-28/biome-new.txt` (line shifts allowed).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **235**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R29-5 real app, old vs new | Build `b182557` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and a `-r harness.cjs` adapted from `c-round-28/harness.cjs`.<br>The harness:<ul><li>lets the initial folder read through;</li><li>when armed (e.g. a marker file or an env-driven counter), makes `meta:read-batch` **throw** before the real listener;</li><li>logs every call.</li></ul>Copy `tests/fixtures/sample.wav` as `a.wav` and `b.wav`. Drive the UI only (the folder dialog may be stubbed).<br>**Setup:** open the folder, click `a.wav`, set Category `R29Cat`, `Save Tags`, wait for `Tags saved`. Record the sha256 of both files, and read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and `ffprobe -show_entries format_tags -of json`.<br>**Scenario A (Rescan):** arm the reject, click `Rescan`, screenshot the list and the toast, click `a.wav`, screenshot the form.<br>**Scenario B (Open Folder, same folder):** fresh copies and fresh setup, then the same steps with `Open Folder`.<br>**Scenario C (Open Folder, another folder):** fresh setup, a second folder with 2 copies, arm, `Open Folder` → the second folder. | <ul><li>**New build, A and B:**<ul><li>`a.wav` keeps its `Tagged` badge;</li><li>the form shows Category `R29Cat`;</li><li>toast `Failed to read 2 files`.</li></ul></li><li>**New build, C:** the 2 rows are listed without values, toast `Failed to read 2 files`.</li><li>**Old build (red):**<ul><li>A and B: the badge is gone, the form is empty, and there is no toast;</li><li>C: no toast.</li></ul>If the old build does not show this, C reports it with the log, and the round is not PASS until B re-plans.</li><li>**All runs:**<ul><li>sha256 of both files is unchanged by the Rescan / Open Folder;</li><li>both readers still show `ICAT=R29Cat` for `a.wav`, field by field (no disk change, display-only bug).</li></ul></li><li>`pageErrors` is empty.</li><li>Artists are record only (TM-B08).</li></ul> |
| R29-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` line on A's tree, against A's src and D-36 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 12:<ul><li>marked `გასწორდა (D-36, TM-B31)`;</li><li>names (k1)–(k6) by full test name (grep, 1 match each);</li><li>states reachability (IPC-level reject only, display-only);</li><li>names RR-R13-01 as the remaining limit.</li></ul></li><li>Entry 11:<ul><li>names (r8) by full test name;</li><li>has the two known-limit sentences (A-R28-01, RR-R28-01);</li><li>points to entry 12 instead of "B-R27-01 remains".</li></ul></li><li>Header lists (3), (9), (11) and (12) as fixed; `წყარო` has TM-B31; there is a D-36 bullet.</li><li>Every `file:line` points at the described code on A's tree; C greps each, and a wrong number is a FAIL.</li><li>Entries 1–10 are unchanged apart from listed shifts.</li><li>The README row reads `ცნობილი შეზღუდვების სია (12 ჩანაწერი; 4 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li></ul> |

## What could break (C re-checks)
- **D-35 (r1)–(r8), (g2), (u1):** these must stay green. In particular, (r5) (replace, not merge) and (r8) (a read issued after the write applies).
- **D-33/D-34 (s1)–(s15), (g1):** these must stay green (MetadataPanel is frozen, but `file-store.ts` changes).
- **Normal Open Folder / Rescan / drop with no failure** ((k7), E2E `folder-workflow.spec.ts`): no error toast, every read applies, a removed file disappears.
- **Error paths:** a `scanFolder` reject still shows its own toast (`Failed to open folder` / `Rescan failed` / `Failed to scan folder`) and empties as before. The empty folder still yields `setMetadata({})`. Closing the folder still clears everything.
- **D-29:** Rescan during a dirty selection still shows `Unsaved changes were discarded`. The toast store has one slot, so a later toast replaces an earlier one (accepted, same as the schema path).
- **D-28 `refreshSavedFileStats`:** unaffected.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R29-1…R29-4 and R29-6 are real local checks.
- R29-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B31, B-R27-01, A-R28-01, A-R28-02 and RR-R28-01 (the docs part).
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 30 fixes it first (test-on-bugfix).
- Otherwise, **C-R25-01** (the MBS hygiene candidate, low). It needs B to design a test that does not depend on run order (RR-R23-01), or to record it as a pure signal.
- Everything else waits on Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope) or on root's Actions link (TM-T0-CI/TM-B14).
