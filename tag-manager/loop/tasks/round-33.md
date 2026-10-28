# CURRENT TASK — Round 33: TM-B35 — schema change during a pending folder load (D-40)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 32: C PASS** (R32-1…R32-6, realVerified=true, no new bug). TM-B34 (D-39) is **done**. Root published `ee15e6c` (round 32). The review returned COMMIT OK with 4 low findings and an architecture note. `ee15e6c` is the baseline.
- **No critical or high bug is open.** Two findings from round 32 belong to one family: a schema re-read races a folder load that is already running.
  - **(a) A-R32-01** (A's code-reviewer + qa-engineer; C inferred it from the code and did not reproduce it). Done is pressed after Open Folder B's `beginFolderLoad()` but before its `setFiles(B)`. `handleSchemaChanged` then records B's load id, which is still current, but it reads `allFiles`, which is still A's list. The D-39(b) guard therefore cannot fire. When A's schema read lands after B has loaded, `setMetadata` replaces B's map with A's entries: B's files lose `Tagged` and their form values. If that read is rejected, a stale `Failed to read 2 files` toast appears.
  - **(b) RR-R32-04** (root review low 4; older than round 32, no test). A Rescan or Open Folder read that began with the **old** schema finishes after the schema re-read. It then applies old-schema data, so the new field's values disappear until the next Rescan.
- **B's red reproduction** on `ee15e6c`, in a throwaway copy (`b-round-32-exp/`):
  - `b-r33-schema-load.test.ts.txt` (7 tests);
  - `red-run.log`: **272 passed / 3 failed of 275**. (w1), (w2) and (w3) fail on the symptom; (w4)–(w7) are green pins.
    - (w1): `metadata` is A's map (`/fa/a.wav`, `/fa/a2.wav`) while B is listed;
    - (w2): toast `Failed to read 2 files`;
    - (w3): `r33note` is missing after the old-schema Rescan read lands.
  - `prototype.diff.txt`: renderer **275/275 in 16 files** (`green-run.log`), Biome 0 errors / 8 warnings with the same list, `tsc` web + test clean.
  - `mutants.log` / `mut.py.txt`: DM-1, DM-2, DM-4, DM-5, DM-6 and DM-7 are killed; DM-3 is equivalent (see R33-3).
- **Mutants rule out both fixes A proposed** (B-R32 design facts):
  - an early return when `isScanning` is true (DM-4) breaks (w3), because the old-schema read lands and nothing reads again;
  - a `files !== allFiles` identity guard (DM-5) breaks (w1), (w3) and (w7). A save's stats refresh (`updateFileStats`) replaces the `files` array, so this guard would drop a valid re-read.
  - D-40 therefore **waits** for the pending load and then reads the current files.
- **Not in this round:**
  - **A-R32-02**: B's explore test reproduced the internal state but found **no user-visible effect**. Clicking b shows B's form and `metadata` holds only B. It is recorded as info and stays in the backlog.
  - Everything below is recorded in the backlog, and none of it is dropped:
    - **RR-R32-01** (a `Set` in the batch filter) and **RR-R32-02** (an extra stats scan): perf signals, RR-R19-01 family, a Saba question.
    - **RR-R32-05 / RR-R31-04**: architecture signals.
- **Severity: low.** Both bugs are display-only:
  - a re-read writes nothing to disk;
  - an empty form saves only typed fields (`writeTagsToFile` skips `undefined`).
  - A rated A-R32-01 medium; B rates it low, as for TM-B34.
- **Reference-first rule:** exempt. This is a pure ordering fix: no new UX element and no new or changed text, and every toast stays as it is.
  - One timing effect is recorded as **B-R32-01**: Done pressed during a pending folder load keeps the schema editor open until that load and the re-read finish. Done already awaits the re-read today (C-R27-01). C measures it in R33-5.

## Baseline
- HEAD must be `ee15e6cfa72f50bb1caecb9075526101e3eb03ec` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `ee15e6c` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `ee15e6c`): every path not listed under File ownership. In particular:
  - `src/renderer/src/App.tsx`;
  - `src/renderer/src/stores/**`;
  - `src/renderer/src/components/sidebar/FolderBrowser.tsx`;
  - `src/renderer/src/components/schema/SchemaEditor.tsx`;
  - `src/renderer/src/lib/utils.ts`;
  - `src/renderer/src/types/**`;
  - `src/main/**`;
  - `tests/renderer/helpers/**` and `tests/renderer/setup.ts`;
  - every existing file under `tests/` (this round only adds one new test file);
  - `tests/e2e/**`.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`. After the bug fix, run `qa-engineer`.

## Scope

### D-40 (decision, renderer only, `MetadataPanel.tsx` only)
1. **New module-level function**, placed right after `isListedPath`, with the exact name (C greps it):
   ```ts
   function waitForFolderLoadIdle(): Promise<void> {
     if (!useFileStore.getState().isScanning) return Promise.resolve();
     return new Promise((resolve) => {
       const unsubscribe = useFileStore.subscribe((state) => {
         if (state.isScanning) return;
         unsubscribe();
         resolve();
       });
     });
   }
   ```
2. **Remove the selector** `const allFiles = useFileStore((s) => s.files);` from `MetadataPanel`. It has no other use.
3. **`handleSchemaChanged` start.** These two lines:
   ```ts
       if (allFiles.length === 0) return;
       const loadId = useFileStore.getState().folderLoadId;
   ```
   become:
   ```ts
       await waitForFolderLoadIdle();
       const { files, folderLoadId: loadId } = useFileStore.getState();
       if (files.length === 0) return;
   ```
   Also `const paths = allFiles.map((f) => f.path);` becomes `const paths = files.map((f) => f.path);`.
4. **Dependencies:** `[allFiles, setMetadata, setEditingMetadata, showToast]` becomes `[setMetadata, setEditingMetadata, showToast]`.
5. **Unchanged:**
   - the D-39(b) guard `if (!isFolderLoadCurrent(loadId)) return;` after the chunk loop;
   - D-33 (a rejected chunk keeps its entry; one toast) and D-34 (write-generation keep);
   - every toast;
   - `handleSave`, `isListedPath`, `refreshSavedFileStats` and the sync effect.
   - No other src file changes.
6. **Conventions:** no new `as`, no comments. Biome: 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).

Behaviour this gives:
- With no load pending, Done re-reads at once, as today ((w6)).
- With a load pending, Done waits until `isScanning` is false. It then reads whatever folder is current at that moment, with the current schema:
  - B, after Open Folder B ((w1), (w2));
  - C, if Open Folder C superseded B ((w5));
  - nothing, if the folder was closed ((w4)).
- A Rescan whose read began with the old schema lands first, and the re-read that follows brings in the new field ((w3)).

### Tests first (red on `ee15e6c` src where marked)
**New file `tests/renderer/components/schema-change-during-folder-load.test.ts`:**
- Start from `b-round-32-exp/b-r33-schema-load.test.ts.txt`.
- Keep **one** `describe("schema change during a pending folder load (D-40)", …)`, the double-quote test style, and the test names and IDs below.
- A must remove the helpers, constants and imports that the file copied from `reread-after-folder-switch.test.ts` and does not use. Examples: `App`, `STANDARD_FIELDS`, `BatchWriteResult` if unused, `PATH_SUB`/`FILE_SUB`/`SUB_META`/`NEW_SUB`/`NEW_A2`, `seedSubFolder`, `addNoteFieldAndDone`.
- A may name types better. No `any`.
- The scenarios and assertions are the contract.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (w1) | Folder `/fa` (a, a2), a selected. Open Customize Fields. Open Folder `/fb` with its scan deferred. Add field `R33note` and click Done. The `/fb` scan resolves `[b]`. Any batch read that includes a `/fa` path is deferred and then resolved. | `files` `[b]`; `metadata` exactly `{b: B + r33note "BN"}`; toast null; no `readMetadataBatch` call contains a `/fa` path | red |
| (w2) | As (w1), but the deferred `/fa` reads reject | toast null; `metadata` `{b: B + r33note}` | red |
| (w3) | `/fa` open, a selected. Open Customize. Click Rescan; the scan resolves `[a, a2]` and every batch read **without** `r33note` in its schema is deferred. Add `R33note`, click Done; reads with the new schema resolve at once. Then the deferred Rescan read resolves. | `metadata` `{a: A + "AN", a2: A2 + "A2N"}`; `isScanning` false | red |
| (w4) pin | As (w1) up to Done, then Close Folder, then the `/fb` scan resolves | `folderPath` null, `files` `[]`, `metadata` `{}`, toast null | green |
| (w5) pin | As (w1) up to Done, then Open Folder `/fc` (scan resolves `[c]`); then the `/fb` scan and any `/fa` read resolve | `folderPath` `/fc`, `files` `[c]`, `metadata` `{c: C + "CN"}`, toast null | green |
| (w6) pin | No load pending: open Customize, add `R33note`, Done | `metadata` `{a, a2}`, both with the note; `readMetadataBatch` calls exactly `[[a, a2]]` | green |
| (w7) pin | a selected. Single save with the write deferred. Open Customize, add `R33note`, Done, with the schema read deferred. The write resolves, and the stats refresh returns a with `size: 2`, which replaces `files`. Then the schema read resolves. | `files[0].size` 2 before the schema read lands; `metadata[a2]` = A2 + note; `metadata[a]` = the save's re-read (`NEW_A`, D-34 keep) | green |

**Totals and red run:**
- 7 new tests. Renderer 268 + 7 = **275** in **16** files.
- A records the red run on the baseline src in `a-round-33.md`:
  - **272 passed / 3 failed**, failing (w1), (w2) and (w3); (w4)–(w7) green;
  - for each red test, the first failing assertion, which must be the symptom (A's map under B's list, the stale toast, the missing `r33note`), not setup.
- A also records each new test's duration on its tree. The new tests take 1–3 s each on B's copy; C-R32-01 notes that timing matters under load.
  - Do **not** raise any timeout.
  - If a test needs more than 4 s alone, report it.

### Docs (Georgian, English technical terms)
**`docs/bugs/001-save-and-selection-known-limits.md`:**
- **New entry `## 16.`** "schema-ს ცვლილება მიმდინარე folder load-ის დროს", in the layout of entry 15:
  - ID `A-R32-01, RR-R32-04, TM-B35`; severity low;
  - files with `file:line` on A's tree (`waitForFolderLoadIdle`, the `await` line, the `files`/`loadId` line in `handleSchemaChanged`);
  - reachability: the sidebar stays usable while the schema editor is open (C-R27-01); Rescan is disabled only while a scan is already running;
  - reproduction: start state → action → result before the fix, for (a) and (b);
  - nothing on disk changes;
  - why the rule is "wait, then read the current files" and not "skip when scanning" (DM-4 / (w3)) or "`files` identity" (DM-5 / (w7));
  - the effect B-R32-01 (Done keeps the editor open during a pending load);
  - decision D-40;
  - the full names of (w1)–(w7);
  - `გასწორდა (D-40, TM-B35)`.
- **D-39 bullet:** its sentence (b) still says `if (allFiles.length === 0) return;` and `(:217)`. Rewrite only that sentence so it matches the new code (the load id now comes from `const { files, folderLoadId: loadId } = useFileStore.getState();` after the D-40 wait), and add "(D-40, ჩანაწერი (16))".
- **New D-40 bullet** after D-39, matching the code.
- **Header:**
  - fixed list "(3), (9), (11), (12), (13), (14), (15) და (16)";
  - `**წყარო:**` adds `TM-B35 (round 33)`;
  - `**კოდი:**` adds `waitForFolderLoadIdle` to the `MetadataPanel.tsx` list.
- **Line refs.** Only `MetadataPanel.tsx` shifts:
  - lines ≤ 62 are unchanged;
  - old 63–78 → +11;
  - old 79 is removed (`allFiles`);
  - old 80–215 → +10;
  - old 216–217 become new 226–228;
  - old ≥ 218 → +11. For example `:158` → `:168`, `:186-188` → `:196-198`, `:217` → `:227`, `:235` → `:246`.

  A's before→after map is the source of truth. A re-points **every** `MetadataPanel.tsx` `file:line` in the whole file, bare `:N` refs included, and lists the map in `a-round-33.md`. `App.tsx`, `FileList.tsx`, `FolderBrowser.tsx`, `file-store.ts` and `metadata-store.ts` refs must not change.
- Entries 1–15: no change except those line shifts.

**`docs/bugs/README.md`:** row 001 status reads exactly `ცნობილი შეზღუდვების სია (16 ჩანაწერი; 8 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.

**`.claude/primitives/STATE_MANAGEMENT.md`** (Edit tool, path (b)):
- In the D-39 line, replace `handleSchemaChanged takes folderLoadId at start` with `handleSchemaChanged takes folderLoadId when its read starts (after the D-40 wait)`.
- Add exactly one line right after the D-39 line: `Schema re-read during a pending folder load (D-40): handleSchemaChanged first awaits waitForFolderLoadIdle() (resolves when useFileStore isScanning is false), then reads the files and folderLoadId current at that moment; never skip the re-read while scanning (a load that began with the old schema would win) and never guard on files identity (a save's stats refresh replaces the files array).`

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-40: `waitForFolderLoadIdle`, `handleSchemaChanged` start, `allFiles` removal, deps |
| `tests/renderer/components/schema-change-during-folder-load.test.ts` (new) | (w1)–(w7) |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 16, D-39 sentence (b), D-40 bullet, header, shifted refs |
| `docs/bugs/README.md` | row 001 count |
| `.claude/primitives/STATE_MANAGEMENT.md` | D-39 wording + one D-40 line |

A also writes `a-round-33.md` (and any `a-round-33/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R33-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat ee15e6c`;</li><li>`git diff --quiet ee15e6c -- . ':!<5 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is `schema-change-during-folder-load.test.ts`.</li><li>The src diff is exactly D-40 in `MetadataPanel.tsx`: `waitForFolderLoadIdle` (body as above), the `allFiles` selector removed, the three new start lines, `files.map`, and the deps.</li><li>`App.tsx`, `stores/**`, `FolderBrowser.tsx` and `SchemaEditor.tsx` are byte-identical.</li><li>No toast text changed.</li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/`.</li><li>`STATE_MANAGEMENT.md`: one changed D-39 phrase and exactly one added line.</li><li>The test file has no unused copied helpers (list any C finds; a leftover is a low finding, not a FAIL).</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R33-2 red → green | In a throwaway copy outside the repository, put the `ee15e6c` `MetadataPanel.tsx` with A's tests and run the renderer suite. Then run the suite on A's tree, and each new test alone with `-t`. | <ul><li>Baseline src: (w1), (w2) and (w3) fail; (w4)–(w7) and all 268 old tests pass (expected **272 passed / 3 failed**).</li><li>Each red test fails on the symptom; C records the first failing assertion for each.</li><li>A's tree: **275/275** in 16 files.</li><li>Each new test passes alone; C records its duration.</li></ul> |
| R33-3 mutations | In copies of A's tree outside the repository, run the new file plus `reread-after-folder-switch.test.ts`, `folder-read-during-save.test.ts`, `metadata-panel-schema-change.test.ts`, `metadata-panel-batch-save.test.ts`, `folder-read-overlap.test.ts` and `folder-read-rejected-chunk.test.ts`, once per mutant. Give the exact edit for each. DM-1…DM-7 as in `b-round-32-exp/mut.py.txt`; add a DM-0 control. | Expected:<ul><li>DM-1 (wait removed): killed by (w1)(w2)(w3);</li><li>DM-2 (render-closure `allFiles` used after the wait): (w1)(w2)(w4)(w5);</li><li>DM-4 (`if (isScanning) return;` instead of the wait): (w3);</li><li>DM-5 (`files` identity guard instead of the wait): (w1)(w3)(w7);</li><li>DM-6 (wait resolves on any store change): (w5);</li><li>DM-7 (D-39(b) guard removed): (v6)(v7)(v8).</li></ul>**DM-3** (`folderLoadId` taken before the wait) is equivalent: a load that starts during the wait starts after the schema change, so it already reads with the new schema, and dropping the re-read loses nothing. C confirms that it survives and states why, or names a killer. Any other survivor is a FAIL unless C shows that it is equivalent; a real survivor becomes a test-gap bug for round 34. |
| R33-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **275**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R33-5 real app, old vs new | Build `ee15e6c` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and `-r harness.cjs` adapted from `c-round-32/harness.cjs`. Log every `meta:read-batch` / `fs:scan-folder` / `meta:write` call with its paths, plus the schema field keys for `meta:read-batch`. Markers:<ul><li>**scan delay:** `fs:scan-folder` for `fast/` waits `R33_SCAN_MS` (2000);</li><li>**batch delay** and **reject** on `meta:read-batch` for `slow/`, waiting `R33_DELAY_MS` (6000);</li><li>**old-schema delay:** `meta:read-batch` for `slow/` whose schema has no field with `riffChunkId` `R33N` waits `R33_DELAY_MS`.</li></ul>Folders: `slow/` = `s.wav`, `fast/` = `f.wav` (copies of `tests/fixtures/sample.wav`). Drive the UI only; `dialog.showOpenDialog` may be stubbed.<br>**Setup** (fresh copies and config per scenario, harness disarmed):<ul><li>open `fast`, click `f.wav`, Category `R32Fast`, `Save Tags`, `Tags saved`;</li><li>open `slow`, click `s.wav`, Category `R32Slow`, Save;</li><li>for **R** only: also add Text field `R33note` with RIFF ID `R33N`, Done, type R33note `R33Val`, Save `s.wav`, then remove the `R33note` field and click Done.</li></ul>Record the sha256 of both files and read both with `music-metadata` (`exif:ICAT`, `exif:R33N`) and `ffprobe -show_entries format_tags -of json`.<br>Scenarios (each starts from the setup, with `slow` open and `s.wav` selected):<ul><li>**W:** arm scan delay + batch delay. Click Customize Fields; Open Folder `fast` (sidebar); add Text field `R33note`; click `Done` within 1 s. Record when the editor closes. Screenshot when `f.wav` is listed and again 8 s after Done; click `f.wav`; screenshot the form.</li><li>**WJ:** as W, with batch delay + reject. Poll for `Failed to read` for 8 s after Done.</li><li>**R:** arm old-schema delay. Click Customize Fields; click Rescan (sidebar); add Text field `R33note` with RIFF ID `R33N`; click `Done`. Record when the editor closes. 8 s after Done, click `s.wav` and screenshot the form (R33note visible).</li><li>**N:** harness disarmed. Customize Fields, add `R33note`, Done. The editor closes within 1 s on both builds.</li></ul> | <ul><li>**New build:**<ul><li>W: no `meta:read-batch` for `slow/` after Done; the editor closes only after `fast` has loaded; 8 s after Done, `f.wav` keeps `Tagged` and its form shows Category `R32Fast`; no toast;</li><li>WJ: same, and no `Failed to read` toast;</li><li>R: the editor closes after the delayed Rescan read (about 6 s); `s.wav`'s form shows R33note `R33Val`.</li></ul></li><li>**Old build (red):**<ul><li>W: a `meta:read-batch` for `slow/` starts at Done; after it lands, `f.wav` loses `Tagged` and its Category is empty;</li><li>WJ: `Failed to read 1 files` appears after `fast` loaded;</li><li>R: after the delayed Rescan read lands, `s.wav`'s R33note is empty although `ffprobe` shows `R33N=R33Val`.</li></ul>If the old build does not show a listed symptom, C reports it with the harness log. The round is not PASS until B re-plans, unless C shows the timing made the step a no-op on both builds; then C reruns with longer delays.</li><li>**All runs:**<ul><li>N closes the editor within 1 s on both builds;</li><li>`f.wav`'s and `s.wav`'s sha256 are unchanged after setup (no save in W/WJ/R/N);</li><li>both readers, field by field: `ICAT=R32Fast` for `f.wav` and `R32Slow` for `s.wav`; for R also `R33N=R33Val` (if music-metadata does not expose `R33N`, ffprobe plus the raw INFO bytes, as in the round-5 rule with `parseListInfoSubChunks`, are the readers for that field; C records this, and it is not a FAIL);</li><li>no `R33note` value is written to `f.wav`;</li><li>`pageErrors` is empty.</li></ul></li><li>C states that these are unit-only:<ul><li>Close during the wait ((w4));</li><li>a superseding Open Folder ((w5));</li><li>a stats refresh during the schema read ((w7)).</li></ul></li><li>Artists are record only (TM-B08).</li></ul> |
| R33-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` D-39/D-40 lines on A's tree, against A's src and D-40 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 16:<ul><li>marked `გასწორდა (D-40, TM-B35)`;</li><li>names (w1)–(w7) by full test name (grep: each full name has exactly 1 match in the docs file and 1 in the tests);</li><li>states reachability, that nothing on disk changes, why the rule is wait-then-read (DM-4, DM-5), and B-R32-01.</li></ul></li><li>The D-39 bullet's sentence (b) matches the new code and points to (16).</li><li>The D-40 bullet matches the code.</li><li>Header lists (3), (9), (11)–(16) as fixed; `წყარო` has TM-B35.</li><li>Every `MetadataPanel.tsx` `file:line` in the file points at the described code on A's tree; C greps each, and a wrong number is a FAIL.</li><li>Refs to other files are unchanged.</li><li>Entries 1–15 are unchanged apart from listed shifts.</li><li>The README row reads exactly `ცნობილი შეზღუდვების სია (16 ჩანაწერი; 8 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li><li>The STATE_MANAGEMENT D-40 line is present once; the D-39 line has the new phrase.</li></ul> |

## What could break (C re-checks)
- **D-33 / D-34 (s1)–(s15):** a schema re-read with no load pending still applies at once, including a stale chunk and a rejected chunk. (s1) is timing-sensitive (C-R32-01).
- **D-39 (v6)–(v8):** a schema re-read superseded **during** its read (Open Folder / Close after Done) is still dropped.
- **D-35 / D-36 / D-37 / D-38 (r*), (k*), (e*), (o1)–(o18):** folder loads are unchanged; `isScanning` still ends only with the current load.
- **D-29 / D-30 / D-39(a):** saves and their re-reads are unchanged ((x*), (y*), (v1)–(v5)).
- **Normal flows:**
  - the schema editor Done path with an open folder and with no folder (`files` empty → return);
  - E2E `folder-workflow.spec.ts`.
- **A stuck wait:** `isScanning` must not stay true. The current load, Close and the error path all clear it. C notes any case where the editor never closes.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R33-1…R33-4 and R33-6 are real local checks.
- R33-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B35, A-R32-01 and RR-R32-04.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 34 fixes it first (test-on-bugfix).
- Otherwise the late-async family has no reproduced bug left. What remains is either a Saba decision or a root action:
  - Saba's question batch (`b-round-23.md` §5, B-R23-03, C-R27-01 / B-R32-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01/RR-R32-02);
  - root's Actions link (TM-T0-CI/TM-B14).
- B will then pick the next unblocked low item, for example TM-B11 (a custom Number field writes `0`) or TM-B05 decision prep, or report BLOCKED with the exact questions.
