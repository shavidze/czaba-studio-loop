# CURRENT TASK — Round 13: TM-B16 — a failed batch write must not wipe the file's row in the store (D-22, A-R11-01) + skipSyncRef hygiene (RR-R12-01) + batch docs (A-R11-02)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- Round 12: **C PASS**, realVerified=true (R12-1…R12-4), with a real-app smoke on top. Root gate published `c3bd412` (rounds 11–12), review COMMIT OK. TM-B15 is done. C reported no bugs, and no critical or high bug is open.
- **TM-B16 (low, from A-R11-01, reproduced by B in round 12):** in a batch save, take a file that can be neither written nor read. Examples: permissions `chmod 000`, or a file deleted after the scan. `node-taglib-sharp` `File.createFromPath` throws EACCES or ENOENT (`b-round-12-exp-unreadable.cjs`). The `meta:read-batch` handler (`src/main/ipc/metadata.ts:233-247`) then returns `emptyMetadata(schema)` for that path. `MetadataPanel.handleSave` (`MetadataPanel.tsx:93-97`) applies every refreshed entry with `updateFileMetadata`. Result: the row loses its values and its `Tagged` badge, although nothing on disk changed.
- **Note: `chmod 444` (the round-11 recipe) does NOT reproduce this.** The write fails but the read succeeds. C must use `chmod 000`.
- RR-R12-01 (root review R12, low): `skipSyncRef.current = true` is set even when no store entry changes. The fix sits in the same lines. A-R11-02 is in the same `data-flow.md` batch section that D-22 changes.

## Baseline
- HEAD `c3bd412c0561d53c64e98563dbc5177ca98696f0`; working tree **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- Frozen (byte-identical to `c3bd412`): everything not in the ownership table. In particular:
  - `src/main/**`: the `meta:read-batch` `emptyMetadata` fallback stays; D-22 is renderer only.
  - The stores: `src/renderer/src/stores/**`.
  - `src/renderer/src/lib/utils.ts`, `src/renderer/src/components/file-list/**`.
  - All other tests and `tests/e2e/**`.
  - Configs, `.github/**`, `docs/**` except `docs/learning/data-flow.md`.
  - `.claude/**` except `.claude/primitives/STATE_MANAGEMENT.md`.
- Protected (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`. Also `.claude/settings*` and `.claude/hooks/**`; the hook refuses these anyway.

## Scope (D-22, see `feature-status.md`)
Steps 1 and 2 follow the repo's `test-on-bugfix` rule: write the failing test first, then the fix.
1. **Red test first** in `tests/renderer/components/metadata-panel-batch-save.test.ts`. Extend the round-11 file and reuse its harness: real `MetadataPanel` and real stores, only `window.api` mocked. Add:
   - **(f) partial failure + unreadable failed file:**
     - Seed both paths as tagged, e.g. `category: 'OLDCat'` (choose any field the badge counts).
     - Select both, type a Category, save.
     - `writeMetadataBatch` returns `failed: [{ path: PATH_B }]`. `readMetadataBatch` returns the new value for A. For B it returns **the full default record for the panel's schema**: every key present, with `''`, `0` or `[]`, exactly what main's `emptyMetadata(schema)` returns. Never return `{}`.
       - `file-store.updateFileMetadata` replaces the entry (`[path]: meta`), so the old code wipes the seed either way. The full record keeps the mock true to main.
     - Assert: `useFileStore.getState().metadata[PATH_B]` deep-equals the seed object. Assert on the store, not on the badge. `metadata[PATH_A]` is updated. D-21 still holds (edits kept, Save enabled).
   - **(g) all failed + both re-reads empty:** both store entries unchanged; edits kept.
   - (f) and (g) must **fail on `c3bd412`** and pass after the fix. Record the red run (failing assertions) in `a-round-13/`.
2. **Fix in `MetadataPanel.tsx` `handleSave`, batch branch only.**
   - Build the set of failed paths from `result.failed`.
   - Apply `updateFileMetadata` only to refreshed paths that are not in that set.
   - Set `skipSyncRef.current = true` only if at least one entry will be applied, and set it just before the first update, as today (RR-R12-01).
   - Do not change:
     - the single-file branch;
     - the D-21 toast and reset logic;
     - the call to `readMetadataBatch` (it still reads all selected paths);
     - the sync effect.
3. **Docs:**
   - **`docs/learning/data-flow.md`, batch save section:**
     - The mermaid diagram call reads `writeMetadataBatch(paths, batchMeta)`, where batchMeta holds the modified fields only (A-R11-02 :115).
     - The refresh step says that only paths that saved are updated in the store.
     - The D-21 paragraph says that failed files keep their store entry (D-22), replacing "ჩავარდნილიც … store-ში ახლდება".
     - "შევსებული ველები" becomes "შეცვლილი ველები (`modifiedFields`)" (A-R11-02 :140).
   - **`.claude/primitives/STATE_MANAGEMENT.md` `### Save flow`:** the Batch line says `updateAll` → `update non-failed only (D-22); skipSync only if ≥1 applied`. Make this edit with the **Edit tool** (path (b), standing permission). Do not write to `.claude/**` through Bash. If Edit is refused, stop and report BLOCKED for this item only.
   - Georgian text, English technical terms.
4. A writes `a-round-13.md` (Georgian). It covers the red/green logs, the diff summary, the verifyCommand result, and whether `code-reviewer` ran. Run it: 3+ files change, as the repo's read-primitives rule requires.

**Explicitly NOT in this round:**
- The main-side fallback (`meta:read-batch` / `meta:read` returning `emptyMetadata`). This includes D-22 known limit (2): write OK but re-read fails.
- A failed-only retry (RR-R12-02 is a product question).
- The `commitBatchSave` store action (RR-R12-04 is a signal).
- C-R1-03 (`TESTING.md`), the next small round.
- Quote style in tests (TM-B06, waits on Saba).

## File ownership (nothing else may change)
| May modify | Why |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-22 fix + RR-R12-01, batch branch of `handleSave` only |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | red/green tests (f), (g); existing (a)–(e) unchanged in intent and still passing |
| `docs/learning/data-flow.md` | D-22 + A-R11-02, batch save section only |
| `.claude/primitives/STATE_MANAGEMENT.md` | `### Save flow` Batch line only (Edit tool) |

Logs go to `a-round-13/` (A) and `c-round-13/` (C) in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R13-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat c3bd412`; `git diff --quiet c3bd412 -- . ':!<4 owned paths>'` | Only the 4 owned paths differ. The `MetadataPanel.tsx` diff is limited to the batch branch of `handleSave`. The `STATE_MANAGEMENT.md` diff is limited to `### Save flow`. `.claude/primitives-map.json` and `.claude/settings*` are unchanged. A's result shows `permission_denials` empty. If the `.claude` Edit was refused, C's `taskStatus` is **BLOCKED**, as in round 11. C keeps the R13-1…R13-5 evidence, and root does not publish a partial round. |
| R13-2 red/green | Run `git worktree add /tmp/c-r13-old c3bd412` and symlink `node_modules` into it. Never use `git stash` or touch A's working tree. Copy the new test file into the worktree and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/metadata-panel-batch-save.test.ts`. Then run it on the fixed tree. | Old code: (f) and (g) fail on the store-entry assertion for the failed path (the entry is replaced by empty values), and (a)–(e) pass. New code: all tests in the file pass. |
| R13-3 mutations | Three mutants, each run against the test file: M1 apply refreshed entries to every path again (revert the filter). M2 filter on succeeded paths wrongly, i.e. skip all updates, so path A is not updated. M3 drop D-21 (always `setEditingMetadata({})`). | M1 is killed by (f)/(g). M2 is killed: (f) asserts that A is updated, and (a)–(e) cover the success path. M3 is killed by (a)–(c). |
| R13-4 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome 0 errors (9 warnings as on `c3bd412`, unless A removed some; no new warnings). Typecheck 0. Renderer 112 + new (report the exact count). Main **62/62**. E2E **7/7**; `--retries=0` 7/7. |
| R13-5 real app | Built app with Playwright `_electron` under `xvfb-run`. Make 2 copies of a WAV, tag both outside the app with ffmpeg so they show `Tagged` (e.g. `-metadata comment=old`). Scan the folder and screenshot: both rows `Tagged`. Select both and `chmod 000 p2`. Type Category `D22Cat` and click Save to 2 files. Screenshot the toast and the rows. `chmod 644 p2`. Read p1 and p2 with `ffprobe -show_entries format_tags -of json` and with `music-metadata`, and take sha256 of p2 before and after. Then Rescan and screenshot. **Red reference:** run the same driver on a build made in the R13-2 worktree `/tmp/c-r13-old` (`c3bd412`). Remove it afterwards with `git worktree remove`. | New build: toast `1 saved, 1 failed`; the p2 row **still shows `Tagged`** right after the save, without a rescan; `D22Cat` is still in the input and Save is enabled (D-21). p1: ffprobe and music-metadata both give `ICAT=D22Cat` and the old comment. p2: sha256 unchanged; ffprobe and music-metadata show the old tags and no ICAT. After Rescan both rows are `Tagged`. On the `c3bd412` build the p2 row loses `Tagged` after the save, and that screenshot is the red evidence. If the red is not seen on `c3bd412`, report it: the bug is then not reproduced in the UI and R13-5 is FAIL with a note. |
| R13-6 docs | Read the `data-flow.md` and `STATE_MANAGEMENT.md` diffs against the code | Both say: only non-failed paths are updated in the store; failed paths keep their entry; skipSync is set only when ≥1 entry is applied; the diagram reads `batchMeta` (modified fields). No other section changed. Georgian text. |

## What could break (C re-checks)
- **D-21 (TM-B15):** partial or all failed keeps the edits; retry writes to all selected files; full success clears the form. Covered by (a)–(e) and by R13-5.
- **Successful batch:** both rows are updated and stay `Tagged`, and the form shows Multiple values. Run R13-5 again without the chmod, as a short regression: toast `Tags saved to 2 files`, both rows show ICAT in ffprobe.
- **Single-file save and the template apply flow:** unchanged code. Run one single-file save in the real app: ffprobe shows the value.
- **Sync effect:** if `skipSyncRef` is not set after an all-failed save, the next selection change must still show `Unsaved changes were discarded` while dirty. Check this in the real app, or by a test if A adds one.
- **Scan/schema-change load paths** (`utils.ts readMetadataChunked`, `handleSchemaChanged`) still store `emptyMetadata` for corrupt files. This is by design, and they are frozen.

## What realVerified means here
- R13-1…R13-4 and R13-6 are real local checks.
- R13-5 is the real UI with an independent reader (ffprobe and music-metadata), plus the red reference on `c3bd412`.
- RR-R12-01 cannot be observed in behaviour today (root review: "harmless today"). C verifies it by reading the code. That is acceptable for this hygiene item and does not count as missing evidence for TM-B16.
- Windows packaging is not part of this round. It is BLOCKED: Windows packaging is not available in the cloud.

## Next (orientation only)
1. **C-R1-03:** a small `.claude/primitives/TESTING.md:129` round (fixtures come from globalSetup), using path (b).
2. **Low items with no decision needed:**
   - RR-R5-02 (`file-row-display.ts` `typeof` guard);
   - RR-R1-04/05 (`create-fixtures.ts`);
   - RR-R10-01/02 + A-R10-01 (E2E launch error polish).
3. **Root can link the `Check` Actions run on `c3bd412`.** If it is green, TM-T0-CI, TM-T0, TM-T0-CI-FU and TM-B14 close.
4. **Saba question batch** (unchanged). Every remaining backlog item waits on it:
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01);
   - D-15 + RR-R5-01;
   - B-R7-02/RR-R8-04;
   - TM-B05, TM-B06, RR-R1-07, RR-R3-05;
   - TM-T2-DATA;
   - optional RR-R12-02 (failed-only retry).
