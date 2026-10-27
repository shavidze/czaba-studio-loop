# CURRENT TASK — Round 25: TM-B28 — schema-change test and docs hygiene: shared `resetWindowApiMocks()` helper (six mocks), (s8) absent-path pin, `docs/bugs/001` entries 3/9/10 and the D-33 note

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 24 result:** C PASS, realVerified=true (R24-1…R24-6), bugs 0. Root published `3d27ba9` (review COMMIT OK). TM-B27 and D-33 are done.
  - A changed the spec on purpose (A-R24-01). The spec's two-part D-33 cleared unsaved edits and D-30 typing when a schema re-read was rejected. A added a `keptPaths` guard (D-33 part 3) and two tests, (s6) and (s7). C confirmed the guard is needed: mutant MK-1, which is the spec's version, is killed by (s6) and (s7).
  - The counts are therefore 207 tests, and 203 passed / 4 failed on the old src.
- **No critical or high bug is open**, and C found no bug. This round takes the low test and docs gaps that C and the root review found in round 24's own diff. None of them needs a Saba decision:
  1. **RR-R24-04:** `metadata-panel-schema-change.test.ts:112-120` copies the mock reset instead of reusing `resetWindowApiMocks`. **RR-R24-03:** (i3) calls the helper itself.
     - Both are answered by one shared helper in `tests/renderer/helpers/`.
     - Each file's `beforeEach` call is protected by its own named mutant (MB and MBS).
     - RR-R24-03 asked for a "defaults-only" test. B does not add one: it would again depend on which test ran before it, which is the exact RR-R23-01 problem. MB is already killed by 24 existing tests.
  2. **C-R24-01:** D-33 part 2 says "a path with no store entry stays absent", but nothing tests it. A mutant that writes `undefined` or `{}` for such a path survives. The fix is a new test, (s8).
  3. **Docs:**
     - **RR-R24-01:** a kept entry has no value for the newly added field. Add a note.
     - **C-R24-04:** entry 3's title still says "single save", and entry 10 does not name (s7).
     - **RR-R24-02:** the between-chunks variant of B-R23-02 is not described. Add it to entry 9.
     - **B's reclassification:** entry 9's decision line calls a "read token" a UX question. That is wrong: a stale-result guard is technical and renderer-only. Only locking the schema editor is UX.
- **No `src/` change.** This is a test and docs round, so the reference-first rule does not apply.

## Baseline
- HEAD must be `3d27ba921ab2f27e4b02a8e6bb220c2fad5850d5` and the working tree **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `3d27ba9` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to the baseline): everything not in the ownership table, in particular:
  - all of `src/**`, including `MetadataPanel.tsx`, `SchemaEditor.tsx` and every store;
  - `tests/renderer/setup.ts` and `tests/renderer/helpers/reset-stores.ts`;
  - every other test file, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `.claude/**`;
  - `docs/**` except `docs/bugs/001-save-and-selection-known-limits.md`;
  - `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule (A-R17-02, still open)
- **Write to the repository only with the Edit or Write tool.** Do not use `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, or any script that writes repository files. The only exception is gitignored build and test output from npm commands. Run mutants in a copy outside the repository, and never use `git stash`.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`. In `a-round-25.md`, record when you read each one and whether the read-primitives hook fired.
- Order:
  1. Write the helper and change both test files (parts A and B).
  2. Run the renderer suite on the unchanged src (green, 208).
  3. Run the mutants in `/tmp` copies.
  4. Update the docs (part C).
  5. Run the final gate.

## Scope

### Part A — shared helper (RR-R24-04, RR-R24-03)
1. **New file `tests/renderer/helpers/window-api-mocks.ts`.** It exports exactly one function, `export function resetWindowApiMocks(): void`.
   - **Body:** six lines, each `vi.mocked(window.api.X).mockReset().mockResolvedValue(<setup.ts default>)`, in this order: `writeMetadataBatch` (`{ succeeded: 0, failed: [] }`), `readMetadataBatch` (`{}`), `writeMetadata` (`undefined`), `readMetadata` (`{}`), `scanFolder` (`[]`), `saveSchema` (`undefined`).
   - **`window.api` is read inside the function body, at call time, never at module load.** The test files' `vi.hoisted` block replaces `window`, and the helper must see the replaced object.
   - **Imports:** `vi` from `"vitest"`, and nothing else unless `tsc -p tsconfig.test.json` needs it.
   - **Style:** double quotes like the sibling helper `reset-stores.ts`, semicolons, no comments, no `any`/`@ts-ignore`/`as`.
2. **`tests/renderer/components/metadata-panel-batch-save.test.ts`:**
   - delete the module-private `resetWindowApiMocks` and import the shared one from `"../helpers/window-api-mocks"`;
   - `beforeEach` stays `resetAllStores(); resetWindowApiMocks();`;
   - **(i3):**
     - rename it to `(i3) resetWindowApiMocks drops once-values queued on the six window.api mocks`;
     - add a sixth queued once-value, `saveSchema` `mockRejectedValueOnce(new Error("leaked"))`;
     - add a sixth assertion, `await expect(window.api.saveSchema([])).resolves.toBeUndefined()`.
   - No other line changes.
3. **`tests/renderer/components/metadata-panel-schema-change.test.ts`:**
   - `beforeEach` becomes `resetAllStores(); resetWindowApiMocks();` with the shared import;
   - the six inline reset lines are removed;
   - no other existing line changes (apart from part B's additions).

### Part B — (s8), absent-path pin (C-R24-01), same file
- **Additions only:** a constant `PATH_C = "/music/c.wav"` and `FILE_C` (same shape as `FILE_A`), and one new test **at the end of the existing describe**:
  - **Name:** `(s8) C-R24-01: a listed file without a store entry stays absent when its schema re-read rejects`.
  - **Setup:**
    - `useFileStore.setState({ files: [FILE_A, FILE_B, FILE_C], metadata: { [PATH_A]: { ...SEED_A }, [PATH_B]: { ...SEED_B } }, selectedPaths: [PATH_A] })`;
    - `readMetadataBatch` rejects (`mockRejectedValue(new Error("read down"))`);
    - render, then `addNoteFieldAndDone()`.
  - **Must hold:**
    - toast `Failed to read 3 files`;
    - `Object.keys(useFileStore.getState().metadata).sort()` equals `[PATH_A, PATH_B]`;
    - the metadata map equals `{ [PATH_A]: SEED_A, [PATH_B]: SEED_B }`;
    - form Category `ACat`.
  - The key-list assertion is required. `toEqual` alone treats a key holding `undefined` as absent, so it would not kill MA-1.
- On the `3d27ba9` src, (s8) **passes**. It is a pin, and the mutants below are its proof.

### Part C — `docs/bugs/001-save-and-selection-known-limits.md` (Georgian with English technical terms, same entry format)
1. **D-33 bullet:** add one sentence for RR-R24-01. A kept entry was read with the old schema, so a field added by that schema change has no value for that file until the next successful read (rescan, or switching to another file and back). The `Failed to read N files` toast reports it.
2. **Entry 3:** change the title so it covers both single and batch saves. Example: `## 3. schema-ს შეცვლა save-ის დროს (single და batch): re-read save-ის დაწყების `fields`-ით`. Nothing else in entry 3 changes.
3. **Entry 9 (B-R23-02):**
   - Add the RR-R24-02 variant as a step: `handleSchemaChanged` writes the store only after all chunks, so a save that finishes between two chunks is overwritten by values read before it.
   - Rewrite the decision line. A stale-result guard (a read generation, RR-R24-05) is technical and renderer-only, so it is a fix candidate. Only locking the schema editor during a save is UX.
   - The status stays `ცნობილი შეზღუდვა` and the test stays `ტესტი არ არის`.
4. **Entry 10 (B-R23-03):** next to (s6), also name `(s7) A-R24-01: a title typed during a save survives a rejected schema re-read (D-30)`. The status and options are unchanged.
5. **Line references:**
   - Every `MetadataPanel.tsx:` reference stays valid. src is frozen, so they should already match; C re-greps them.
   - If you add a new reference to the test file, use the test name, not a line number.
6. Entries 1, 2 and 4–8 and the header stay unchanged. `docs/bugs/README.md` is **not** touched: the entry count and statuses do not change.

### Not in this round
- **B-R23-02 fix** (read generation / stale-result guard). This is the next candidate. It needs a red reproduction by B first.
- **B-R23-03** (Saba question).
- Any `src/` change.
- Moving `handleSave` into a hook or store action (RR-R23-04 and RR-R24-05 signals).
- Linting `tests/` (TM-B06, Saba question).

### `a-round-25.md` (Georgian) contains
- the primitive reads;
- the green logs (part A and B on the unchanged src);
- the mutant logs;
- the diff;
- the full `verifyCommand`, plus `xvfb-run -a npx playwright test --retries=0`, both run **after** the last edit;
- the Biome warning list;
- a `code-reviewer` run (**required**: 3+ files);
- the process statement.

`qa-engineer` is optional: no bug is fixed this round.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/helpers/window-api-mocks.ts` (new) | shared `resetWindowApiMocks()` (part A) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | use the shared helper; (i3) six mocks (part A) |
| `tests/renderer/components/metadata-panel-schema-change.test.ts` | use the shared helper (part A); `PATH_C`/`FILE_C` + (s8) (part B) |
| `docs/bugs/001-save-and-selection-known-limits.md` | D-33 note, entry 3 title, entry 9, entry 10 (part C) |

Logs go to `a-round-25/` (A) and `c-round-25/` (C) in the loop folder. Nothing else in the repository may be written, except gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R25-1 ownership + process | Run `git status --porcelain --untracked-files=all` and `git diff --stat <baseline>`. Run `git diff --quiet <baseline> -- . ':!<3 owned modified paths>'`. Read the diff, A's result JSON and A's transcript if it is available. | All of these hold:<ul><li>3 `M` paths plus exactly one untracked file, `tests/renderer/helpers/window-api-mocks.ts`.</li><li>`git diff --quiet <baseline> -- src` is 0.</li><li>The helper has one export, six reset lines with the setup.ts defaults, reads `window.api` inside the function, and has no comment, `any`, `@ts-ignore` or `as`.</li><li>Batch-save file:<ul><li>the only removed lines are the local helper and the old (i3) name;</li><li>the only added lines are the import, the new name, the `saveSchema` once-value and the `saveSchema` assertion.</li></ul></li><li>Schema-change file:<ul><li>the only removed lines are the six inline reset lines;</li><li>(s1)–(s7) are byte-identical;</li><li>(s8) is the last test in the describe.</li></ul></li><li>`permission_denials` is empty and the repository writes were made with Edit/Write. Say whether the transcript was available.</li></ul> |
| R25-2 green, behaviour-neutral | Run the renderer suite on A's tree. Also run `-t "i3"` alone and `-t "s8"` alone. | <ul><li>**208/208**, 11 test files.</li><li>(i3) alone: 1 passed.</li><li>(s8) alone: 1 passed.</li></ul> |
| R25-3 mutations | In throwaway copies of A's tree, run the named file once per mutant:<ul><li>**MI-1…MI-6:** one helper line at a time on `mockClear`; run `-t "i3"` **alone**.</li><li>**MB:** the batch-save `beforeEach` no longer calls `resetWindowApiMocks()`.</li><li>**MBS:** the schema-change `beforeEach` no longer calls it.</li><li>**MA-1** (src copy): `if (!previous[path]) continue;` removed.</li><li>**MA-2** (src copy): that line removed and the assignment changed to `previous[path] ?? {}`.</li><li>**MW** (helper copy): `window.api` captured once at module load into a const. Run the schema-change file.</li></ul> | <ul><li>Each MI-n is killed by (i3) run alone; MI-6 is the new `saveSchema` line.</li><li>MB is killed by existing batch-save tests.</li><li>MBS is killed by at least one schema-change test. If it survives, C reports it and A's log explains it. This is not automatically a FAIL: say which once-values leak.</li><li>MA-1 and MA-2 are killed by (s8).</li><li>MW: report the result either way. If it survives, the call-time rule is style only; say so.</li></ul> |
| R25-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | All of these hold:<ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `3d27ba9`.</li><li>Typecheck 0, including `tsconfig.test.json`, which covers the new helper.</li><li>Renderer **208**.</li><li>Main **93/93**.</li><li>E2E **7/7**, and **7/7** with `--retries=0`.</li></ul> |
| R25-5 real app smoke (src unchanged) | Launch the built app with Playwright `_electron` under `xvfb-run` with `--no-sandbox` and an isolated `XDG_CONFIG_HOME`. Copy `tests/fixtures/sample.wav` as `a.wav` and `b.wav`. Drive the UI only; the folder dialog may be stubbed.<ol><li>Click `a.wav`, set Title `R25T`, click `Save Tags`, and wait for `Tags saved`.</li><li>Open `Customize Fields`, add the Text field `R25note`, click `Done`, and check that the form still shows Title `R25T`.</li><li>Read `a.wav` with `music-metadata` (RIFF INFO under `exif:`) and with `ffprobe -show_entries format_tags -of json`.</li></ol>Take a screenshot after each step. | <ul><li>`Tags saved` appears.</li><li>The form keeps `R25T` after `Done`, with no `Failed to read` toast.</li><li>Both readers show title `R25T` and agree field by field.</li><li>`pageErrors` is empty.</li><li>Artists are record only (TM-B08).</li></ul> |
| R25-6 docs | Read `docs/bugs/001-…md` against A's tree, `feature-status.md` D-33 and the round 24 findings. | <ul><li>Georgian with English technical terms.</li><li>The D-33 bullet has the RR-R24-01 note.</li><li>Entry 3's title names single and batch.</li><li>Entry 9 has the between-chunks step, and its decision line says the guard is technical and only the lock is UX. Its status and test fields are unchanged.</li><li>Entry 10 names (s6) and (s7) exactly as they exist (grep).</li><li>Every `MetadataPanel.tsx:` reference still points at the described code (C greps each one).</li><li>Entries 1, 2 and 4–8, the header and `README.md` are unchanged.</li></ul> |

## What could break (C re-checks)
- **Isolation in both test files:** the shared helper must reset the same five mocks as before, plus `saveSchema`. B expects MW to be equivalent: `setup.ts`'s window object and `globalThis` after the `vi.hoisted` swap expose the same `mockApi`, so the call-time rule is defensive style. C confirms this with MW. B also expects MBS to survive, because that file's mocks are persistent and each test overrides them. If MBS survives, C records it as a finding: it is the RR-R24-03 gap for the second file.
- **The 49 batch-save tests and (s1)–(s7):** their bodies are unchanged. A failure means the helper differs from the old reset code.
- **`saveSchema` reset in the batch-save file:** no batch-save test sets `saveSchema` today, so resetting it to its default does not change behaviour. C confirms with the 208/208 count.
- **Other test files** (`schema-editor.test.ts`, `file-list.test.ts`, stores) are frozen and must stay green within the 208.

## What realVerified means here
- R25-1…R25-4 and R25-6 are real local checks.
- R25-5 is a real-app smoke check: the src is unchanged, and the check confirms the published build still saves and survives a schema add, read by independent readers.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.
- The Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.

## Next (orientation only)
- **Round 26 candidate: the B-R23-02 / RR-R24-02 fix**, a read generation (stale-result guard) in `MetadataPanel` or the file store.
  - It is planned only after B reproduces it red in a `/tmp` copy: defer the `handleSchemaChanged` `readMetadataBatch` until after the save's re-read lands.
  - Without a red reproduction it stays a known limit.
- Everything else waits on Saba's question batch (`b-round-23.md` §5 + B-R23-03) or on root's Actions link.
