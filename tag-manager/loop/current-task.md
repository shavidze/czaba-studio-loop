# CURRENT TASK — Round 27: TM-B29 re-verification — C verifies the published D-34 diff `c2c19a7..6c956b4`; A changes nothing

Planner: B · Implementer: A (idle this round) · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 26 ended BLOCKED.** A and C both found HEAD = `6c956b4` (`feat(tag-manager): verified loop rounds 26-26`, parent `c2c19a7`), not the planned baseline `c2c19a7`. A stopped correctly and made no edits. Root's gate was skipped.
- **The TM-B29 (D-34) code is already on origin/master.** C confirmed the following:
  - `6c956b4` changes exactly the 8 paths that round 26 owned (232+/27−);
  - the tree is clean;
  - a sanity run passed: check exit 0, Biome 0/8, renderer 216/216, main 93/93.
- **The verification evidence is missing.** The commit message cites a C PASS (`c-round-26.json`) and a review COMMIT OK. The loop folder was restored to the round-26 start state at 18:43Z and holds neither (finding B-R26-01, routed to root). Without them, no C evidence for TM-B29 exists in the loop folder.
- **Status.** Under the done policy, TM-B29 stays `in_progress` with realVerified=false. C's sanity run is supporting data only (C-R26-01).
- **What this round does.** C verifies the published diff against the same acceptance that round 26 planned (R26-1…R26-6 → R27-1…R27-6). No critical or high bug is open, and TM-B29 (medium, data-loss path) is the open item with the highest priority.
- **No other scope.** A gets no other scope this round. Any change to the 8 TM-B29 files would blur the "`c2c19a7` src + `6c956b4` tests" comparison. Any change elsewhere would add an unrelated diff to a round whose purpose is to restore evidence.
- **Reference-first rule:** exempt (verification-only round, no UX change).

## Baseline
- HEAD must be `6c956b41dee3580d01c6285c9c7c3e1c8495101c` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `6c956b4` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen:** the whole repository, byte-identical to `6c956b4`. A owns no repository path this round.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Reference points for C:**
  - "old" = `c2c19a7` (the round 25 publication, before D-34);
  - "new" = `6c956b4` (D-34 as published).
  - Wherever round 26's acceptance says "A's tree", read `6c956b4`.

## Scope

### A (implementer) — no repository change
1. Check the baseline as stated above. If HEAD or the tree differs, write BLOCKED and stop.
2. Write nothing to the repository. Do not use Edit/Write on repository paths, and do not run Bash writes, `git stash`, `git checkout` or `git reset`. The only exception is gitignored npm output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).
3. Optional: run the full `verifyCommand` once and keep the log in `a-round-27/verify.log`. This is information only; A's evidence never counts as acceptance.
4. Write `a-round-27.md` in Georgian:
   - the HEAD and `git status` output;
   - a statement that no repository file was written;
   - the log path, if step 3 ran.
   - Do **not** re-implement, "improve" or refactor D-34.
   - If A notices a defect in `6c956b4`, record it as a finding with file:line for B. Do not fix it.

### C (verifier) — TM-B29 acceptance against `c2c19a7..6c956b4`
- C runs R27-1…R27-6 below. They are round 26's R26-1…R26-6, applied to the published commit.
- Round 26's full specification is the reference for every detail not repeated here: `tasks/round-26.md`, parts A/B/C, test table (s9)–(s15) + (g1), and the mutant list. The expected behaviour (D-34) is the `D-34` row in `feature-status.md` and the `D-34` entry in `backlog.json` `decisions`.
- B confirmed with `git show 6c956b4:<test file>` that the published test names match the round 26 table exactly: (s9)–(s15) and (g1).

### Not in this round
- **B-R25-01:** Rescan / Open Folder during a pending save. Needs a red reproduction first.
- **C-R25-01:** the MBS survivor.
- **B-R23-03:** a Saba question.
- **Signals:** RR-R23-04, RR-R24-05 and other architecture signals.
- **TM-B06:** linting `tests/`.
- **`src/main`:** any change.
- **Fixes:** anything C finds in `6c956b4` becomes a bug for round 28 (test-on-bugfix). It is not fixed in this round.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| — (no repository path) | Verification-only round. A writes only `a-round-27.md`, `a-round-27-*.json` and `a-round-27/` in the loop folder. C writes only `c-round-27.md`, `c-round-27.json` and `c-round-27/` in the loop folder. |

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R27-1 ownership + process | Run these:<ul><li>`git status --porcelain --untracked-files=all` on the working tree;</li><li>`git rev-parse HEAD`;</li><li>`git diff --stat c2c19a7 6c956b4`;</li><li>`git diff --quiet c2c19a7 6c956b4 -- . ':!<8 TM-B29 paths>'`.</li></ul>Read `git diff c2c19a7 6c956b4` for each file. Read A's R27 result JSON. | All of these hold:<ul><li>The working tree is clean after A's phase (A made no change), and HEAD is `6c956b4` or the allowed release commit on it.</li><li>The published diff touches only the 8 TM-B29 paths. They are listed in `tasks/round-26.md`, "File ownership".</li><li>The `file-store.ts` diff adds only `writeGeneration`, `pathWriteGenerations`, their initial values and `markPathsWritten`.</li><li>The three test-file diffs are additions only, plus the two reset lines. (s1)–(s8) and the existing file-store tests are byte-identical.</li><li>`git show 6c956b4:src/renderer/src/components/metadata-editor/MetadataPanel.tsx \| grep -c " as "` is 2.</li><li>No comment, `any` or `@ts-ignore` was added in `src/`.</li><li>The `STATE_MANAGEMENT.md` diff is one added line.</li><li>The Edit/Write-only process of the original implementation **cannot be verified** (no transcript, B-R26-01). C states this as "unknown". It is not a FAIL.</li></ul> |
| R27-2 red → green | Make a throwaway copy outside the repository, with `c2c19a7` src (`file-store.ts`, `MetadataPanel.tsx`) and the `6c956b4` test files and `reset-stores.ts` (`git show 6c956b4:<path>`). Run the renderer suite there. Then run the renderer suite on `6c956b4`. Run each of (s9)–(s15) alone with `-t`. | <ul><li>Old src: (s9), (s10), (s13), (s14), (s15) and (g1) fail; (s11), (s12) and every other test pass. Expected: 210 passed / 6 failed. If (g1) fails at compile or collection time instead, C records how.</li><li>For each failing test, C records the first assertion line and confirms it fails on the symptom from the round 26 table, not on setup.</li><li>`6c956b4`: **216/216**, 11 files.</li><li>Each of (s9)–(s15) passes alone.</li></ul> |
| R27-3 mutations | In copies of `6c956b4` outside the repository, run the two TM-B29 test files once per mutant:<ul><li>**MG-1:** no superseded check, so chunk results are always applied.</li><li>**MG-2:** single save marks before `writeMetadata` instead of after.</li><li>**MG-3:** `>=` instead of `>`.</li><li>**MG-4:** one generation read at the start of `handleSchemaChanged` instead of per chunk.</li><li>**MG-5:** kept entries taken from a reject-time snapshot.</li><li>**MG-6:** batch marks the failed paths too.</li><li>**MG-7:** a superseded selected path still resets the form.</li><li>**MG-8:** single save does not mark.</li><li>**MG-9:** batch save does not mark.</li><li>**MG-10:** superseded check done when each chunk resolves instead of at store-write time.</li><li>**MS-1:** `markPathsWritten` does not increment `writeGeneration`.</li></ul>Adapt each mutant to the published code shape and give the exact edit. | Every mutant is killed, and the killing test is named.<ul><li>Expected killers (from B's R25 prototype): MG-1 by (s9)(s10)(s13)(s15); MG-3 by (s11)(s12)(s1)(s2); MG-4 by (s12); MG-5 by (s14); MG-6 by (s15); MG-7 by (s10); MG-10 by (s13); MS-1 by (g1).</li><li>A survivor is a FAIL unless C shows that it is equivalent. A real survivor becomes a test-gap bug for round 28.</li></ul> |
| R27-4 gate | On `6c956b4`, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as on `c2c19a7`.</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **216**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R27-5 real app, old vs new | Build `c2c19a7` and `6c956b4`, each in its own worktree or copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and a `-r harness.cjs` adapted from `c-round-24/harness.cjs` (it exists in the loop folder).<br>The harness:<ul><li>delays `meta:write` and `meta:write-batch` by 3 s **before** running the real listener;</li><li>for the first `meta:read-batch` whose schema contains the new key (`r27note`), runs the real listener at once (so it reads the file before the write) and delays the **reply** by 6 s;</li><li>logs every call with timestamps.</li></ul>Copy `tests/fixtures/sample.wav` as `a.wav` and `b.wav`. Drive the UI only; the folder dialog may be stubbed.<ol><li>Click `a.wav`, set Category `R27Cat`, click `Save Tags`.</li><li>During the write: `Customize Fields`, add Text field `R27note`, click `Done`.</li><li>Wait for `Tags saved`, then for the late read (log), and take a screenshot.</li><li>Click `b.wav`, then `a.wav`, and take a screenshot.</li><li>Set Title `R27T2` and `Save Tags` (wait for `Tags saved`).</li><li>Read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and `ffprobe -show_entries format_tags -of json`.</li></ol>Take screenshots after each step. | <ul><li>**`6c956b4` build:**<ul><li>after step 3 and step 4 the form shows Category `R27Cat`;</li><li>after step 6 both readers show `ICAT=R27Cat` and title `R27T2`, field by field.</li></ul></li><li>**`c2c19a7` build (red):** after the late read, the form or the b→a form shows the pre-save Category, and after step 6 `ICAT` is back to its pre-save value (the data-loss path). If the old build does **not** show this, C reports it, explains the timing from the log, and the round is not PASS until B re-plans.</li><li>The harness log shows that the schema read started before the write ended and replied after the save's re-read.</li><li>`pageErrors` is empty on both builds.</li><li>Artists are record only (TM-B08).</li></ul> |
| R27-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md`, `docs/bugs/README.md` and the `STATE_MANAGEMENT.md` line at `6c956b4` against the `6c956b4` source and the D-34 row in `feature-status.md`. | <ul><li>Georgian with English technical terms.</li><li>Entry 9 is marked `გასწორდა (D-34, TM-B29)`, names (s9), (s10), (s13), (s14) and (s15) by full test name (grep), keeps the reproduction history, and states production reachability.</li><li>Entry 3 step 3 no longer says that switching files re-reads, and names the real read paths (C-R25-03).</li><li>Entry 10 step 3 limits "edits stay" to a single selection (C-R25-04).</li><li>The header / D-33 bullet lists (3) and (9) as fixed.</li><li>Every `MetadataPanel.tsx:` and `file-store.ts:` reference points at the described code on `6c956b4`. C greps each one; a wrong number is a FAIL of R27-6.</li><li>Entries 1, 2 and 4–8 are unchanged against `c2c19a7`.</li><li>The README row 001 reads `ცნობილი შეზღუდვების სია (10 ჩანაწერი; 2 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.</li></ul> |

## What could break (C re-checks)
- **D-33 (s1)–(s8):** these must stay green on `6c956b4`, because the kept entries are now taken at store-write time.
- **The single-save tests and the 49 batch-save tests:** D-21/D-22/D-24/D-28/D-29/D-30 behaviour (toasts, re-read, `skipSyncRef`, merge) must be unchanged. A mark placed after `refreshSavedFileStats` or after the re-read is wrong (MG-2/MG-8 class). C reads where `markPathsWritten` sits in `handleSave`.
- **Normal schema change with no pending save** ((s1)/(s2) and R27-5's final save): all results apply as before.
- **`file-list.test.ts`, the sort and `useFilteredFiles`:** the new store fields must not appear in `metadata` or change these.
- **Biome hook-deps:** exactly 8 warnings, the same list as on `c2c19a7`.

## What realVerified means here
- R27-1…R27-4 and R27-6 are real local checks of the published commit.
- R27-5 is the real-app check on two builds, with the file read by two independent readers.
- PASS on all six closes TM-B29 (done, commit `6c956b4`) and the docs findings C-R25-03/04 (= A-R25-02/03).
- The original implementation's Edit/Write-only process stays unverifiable (B-R26-01) and does not block PASS.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
- If C finds a FAIL in `6c956b4`, round 28 fixes it first (test-on-bugfix).
- Otherwise, **B-R25-01:** Rescan / Open Folder during a pending save. B first reproduces it red (deferred batch write + rescan). If it is red, the fix reuses `pathWriteGenerations` in `FolderBrowser`/`App`.
- **C-R25-01:** the MBS survivor (a hygiene candidate).
- Everything else waits on Saba's question batch (`b-round-23.md` §5 + B-R23-03) or on root's Actions link.
