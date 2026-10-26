# CURRENT TASK — Round 3: T-1 recording tag contract (`category` → INFO `ICAT`; `IKEY`/`ICMT` round-trip; audio and recorder chunks preserved) + TM-T1-DOC

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 2 (TM-B04 real type-check gate + TM-B07 report path) was **C PASS with realVerified=true** (R2-1…R2-9). Root published it as `c768567`. No critical or high bug is open.

The next dependency-ordered stage is **TM-T1** (requirements.md §T-1). The backend import (K-4) is waiting for it. **TM-T1-DOC** is planned with it because requirements.md lists the contract doc and the primitive row among the T-1 files.

The contract under test: decisions D-01 (`category` → `ICAT`), D-02 (`keywords` → `IKEY`), D-03 (`comment` → `ICMT`) and D-04 (UTF-8 INFO). New B decisions this round: D-12, D-13 and D-14 (`feature-status.md`). D-01, D-07, D-08 and D-10 still wait for Saba. This round implements the recorded defaults, and **D-10's current behaviour is pinned, not changed**.

## Baseline
- HEAD `c76856791126602a3016e133bd91a5f0ff2ced5b`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files (must stay byte-identical):
  - **`src/main/ipc/metadata.ts`**: `category` is `type: 'text'` with a `riffChunkId` and is not in `STANDARD_PROP_MAP`, so it already takes the `keywords` InfoTag path. If a test proves a change is needed, **stop and report** with the failing test. Do not edit it.
  - every other `src/**` file except `src/shared/types.ts`, including `src/preload/**`, `src/renderer/**` and `src/main/ipc/schema.ts`;
  - `package.json`, `package-lock.json`, all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`, `.github/workflows/release.yml`;
  - `tests/fixtures/**` (D-14), `tests/main/global-setup.ts`, `tests/main/setup.ts`, `tests/main/metadata.test.ts`, `tests/e2e/electron-launch.ts`, the existing E2E specs, `tests/renderer/setup.ts`, `tests/renderer/helpers/**` and every existing renderer test;
  - `.claude/**` **except** `.claude/primitives/WAV_METADATA.md`;
  - `src/renderer/src/styles/app.css`, `node_modules/**`.

## Scope
1. **The field (D-01, D-13).** Append to `STANDARD_FIELDS` in `src/shared/types.ts`, as its **last** entry after `keywords`:
   `{ key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true }`.
   Nothing else in that file changes. Do not add a UCS list or validation; that is T-2, which is blocked.

2. **Test helper `tests/main/riff-chunks.ts` (new, no dependencies, D-14).** Use exported names that follow `AGENT_DISCOVERABLE_CODE.md`:
   - parse the top-level RIFF chunks into `{ id, offset, size, payload }` (handle odd-size pad bytes);
   - parse a `LIST`/`INFO` chunk into `Map<string, Buffer>` of raw sub-chunk payloads;
   - build a test-only WAV: take `createSineWavBuffer()` output from `tests/fixtures/create-fixtures.ts` (import it; do not modify it) and insert a `bext` chunk and an `iXML` chunk before `data`. Recompute the RIFF size. Use deterministic content, for example a bext description `sSPEED=025.000-ND` like a Sound Devices recorder and a small `<BWFXML>` document.

3. **Contract tests `tests/main/recording-tag-contract.test.ts` (new).** Use the IPC handlers registered by `registerMetadataHandlers()`, with the same harness pattern as `tests/main/metadata.test.ts` (copy the pattern; do not edit that file). Work on temp copies. At minimum:
   - **T1-1** Write `{ category: 'DOORWood', keywords: 'door, slam', comment: 'მძიმე კარი' }` with `STANDARD_FIELDS`. The raw `LIST`/`INFO` must contain:
     - `ICAT` payload = ASCII `DOORWood`;
     - `IKEY` payload = `door, slam`;
     - `ICMT` payload = the UTF-8 bytes of `მძიმე კარი`.
     **B measured this at `c768567`** (`/tmp/bexp3`, the same node-taglib-sharp calls as `metadata.ts`; script copied to `b-round-2-exp-bext.cjs` in the loop folder). Sub-chunk sizes are exact: `ICAT` 8, `IKEY` 10, `ICMT` 26. There is **no NUL terminator**; an odd size gets one RIFF pad byte outside the size. Assert the exact size and payload. If A observes something different, A stops and reports.
   - **T1-2** `meta:read` on the same file returns `category === 'DOORWood'`, `keywords === 'door, slam'` and `comment === 'მძიმე კარი'`.
   - **T1-3** The sha256 of the `data` chunk payload is equal before and after the write.
   - **T1-4** On the bext + iXML test WAV, the same write leaves the `bext` and `iXML` chunk payloads **byte-identical**, and `data` is unchanged. ICMT is still written (comment = `მძიმე კარი`), and `meta:read` returns the ICMT value, not the bext text.
   - **T1-5** Two files already tagged with title, keywords and comment. Run `meta:write-batch` with `{ category: 'DOORWood' }` only. Afterwards both files have ICAT, and title, keywords and comment are unchanged, both in `meta:read` and in raw INFO.
   - **T1-10 (D-10 pinned, not changed)**:
     - (a) Writing `{ keywords: '', category: '' }` produces **zero-length** `IKEY` and `ICAT` sub-chunks: they are present, with size 0 (B measured `ICAT`; C-R1-01 measured `IKEY`). `meta:read` returns `''`.
     - (b) Write `category: 'DOORWood'`, then `category: ''`. `DOORWood` must be gone from both raw INFO and `meta:read`.
   - **D-13 pin**: the last entry of `STANDARD_FIELDS` deep-equals the object in step 1, and no other entry uses `riffChunkId: 'ICAT'`.
   - **T1-6 artefact**: after T1-1, the test copies the file to `test-results/recording-tag-contract/contract.wav`, under the repo root, creating the folder. This path is gitignored. This is the file the CI step reads.

4. **ffprobe cross-check (T1-6, D-14).**
   - Add `tests/contract/check-ffprobe-tags.ts` (new). It is plain Node and type-checked by `tsconfig.test.json`. Usage: `npx --yes tsx@4 tests/contract/check-ffprobe-tags.ts <wav>`.
     - It runs `ffprobe -v error -show_entries format_tags -of json <wav>`.
     - It asserts `format.tags.ICAT === 'DOORWood'`, `format.tags.IKEY === 'door, slam'` and `format.tags.comment === 'მძიმე კარი'`.
     - It prints the tags. It exits 1 with a clear message on a mismatch, if ffprobe is missing, or if the file is missing.
     - Use the CLI guard pattern from `create-fixtures.ts` (RR-R1-04: match `check-ffprobe-tags\.[cm]?[jt]s$`).
     - Vitest must not call ffprobe. `npm run check` must still pass on a machine without ffmpeg.
   - In `.github/workflows/check.yml`, add one step, **"Tag contract ffprobe cross-check"**, directly after "Lint, type check and unit tests" and before "Build". Playwright later cleans `test-results/`. The step runs exactly the command above on `test-results/recording-tag-contract/contract.wav`. Other steps stay unchanged.

5. **E2E (T1-7).** Add `tests/e2e/recording-tag-contract.spec.ts` (new) with **exactly one** test, modelled on `folder-workflow.spec.ts`: launch via `getElectronLaunchArgs`, use a temp folder with `createSineWavBuffer(4410)`, call `window.api.writeMetadata(path, { category: 'DOORWood' }, schema)` with the schema from `window.api.loadSchema()` (or `STANDARD_FIELDS`), then `window.api.readMetadata`. The result must contain `category === 'DOORWood'`. Use a **clean `XDG_CONFIG_HOME`** temp directory in the launch env, so a stale `schema.json` cannot hide the new field.

6. **SchemaEditor (T1-9).** Add `tests/renderer/components/schema-editor.test.ts` (new). It must be a **`.ts`** file: the renderer Vitest config only includes `tests/renderer/**/*.test.ts`. Render with `React.createElement` and `@testing-library/react`, both already installed, with no new dependencies. Reset stores with the existing helper. Cases:
   - (a) Name `Client`, RIFF ID `ICAT`, click "Add Field": the error text `RIFF ID "ICAT" is already in use` is shown and no field is added.
   - (b) The same with lowercase `icat`.
   - (c) With `fields` set to the 12 pre-T-1 standard fields (STANDARD_FIELDS without `category`, as an old `schema.json` would load), `Category (UCS)` is listed among the disabled standards.
   No change to `SchemaEditor.tsx`. Its reserved-ID set derives from `STANDARD_FIELDS`.

7. **Docs (TM-T1-DOC).** All in Georgian with English technical terms (`GEORGIAN_DOCS.md`).
   - New `docs/recording-tag-contract.md`, the K-4 source of truth:
     - the table: `category`→`ICAT`, `keywords`→`IKEY`, `comment`→`ICMT`;
     - UTF-8 encoding (D-04) and the observed terminator/padding;
     - keywords separators `,`/`;`;
     - the importer rule "absent or empty = no value" (D-10 open: today an empty field is written as a zero-length sub-chunk, and every single-file save writes all fields, so `ICAT=""` appears on files nobody categorised);
     - the ffprobe pitfalls from requirements.md (multi-value loss, bext → `comment` without ICMT, encoding);
     - D-12: `artists` and the other standard fields are not part of the contract (ISTR, C-R2-01);
     - the D-07 note: an existing `schema.json` does not show `Category (UCS)` automatically; enable it in Schema Editor.
   - `.claude/primitives/WAV_METADATA.md`: add `ICAT` to the riffChunkId row (line 15) and one line saying `category` uses `ICAT` via the InfoTag path like `keywords`. Nothing else changes there.
   - `docs/plans/002-recording-tag-contract.md`: fix the stale `:5` (T-1 no longer waits for TM-B04) and `:77` (round-1-only claim) lines (A-R2-01). Mark T-1 as in progress in round 3.

**Explicitly NOT in this round:**
- Changing the empty-value behaviour (D-10, Saba).
- Schema migration (TM-T1-MIG, D-07); C only regression-checks it.
- Custom-field/`category` duplicates (TM-T1-DUP).
- Artists/ISTR (TM-B08, D-12).
- UCS list or validation (T-2, blocked).
- RR-R2-01…04, Biome for `tests/` (TM-B06), TM-B05, `.claude/primitives/TESTING.md` (C-R1-03), action SHA pinning.
- Installing packages.

Read first: `.claude/primitives/WAV_METADATA.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md`, `SEMICOLONS.md`, `GIT_RULES.md` (no commit), `.claude/rules/test-on-bugfix.md`, requirements.md §T-1 (loop folder).

**Red first.** Run the new main and renderer tests **before** step 1. T1-1, T1-2, T1-9(a/b/c) and the D-13 pin must fail. Record the log (`a-round-3/red-before-field.log`), then add the field.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/shared/types.ts` | one appended `STANDARD_FIELDS` entry (D-13) |
| `tests/main/riff-chunks.ts` (new) | RIFF/INFO parser + bext/iXML WAV builder |
| `tests/main/recording-tag-contract.test.ts` (new) | T1-1…T1-5, T1-10, D-13 pin, T1-6 artefact |
| `tests/contract/check-ffprobe-tags.ts` (new) | T1-6 ffprobe assertion CLI |
| `tests/e2e/recording-tag-contract.spec.ts` (new) | T1-7 |
| `tests/renderer/components/schema-editor.test.ts` (new) | T1-9 + MIG component regression |
| `.github/workflows/check.yml` | one new step only (T1-6) |
| `docs/recording-tag-contract.md` (new) | TM-T1-DOC contract doc |
| `.claude/primitives/WAV_METADATA.md` | `ICAT` row + one line |
| `docs/plans/002-recording-tag-contract.md` | stale lines + T-1 status |

Generated and ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R3-1 (T1-1…T1-5, T1-10) | Read `recording-tag-contract.test.ts` and `riff-chunks.ts`. Run `npm run test:main`. Independently, write a 10-line Node script that dumps `LIST/INFO` of a file you write yourself through the real app (R3-6). Do not reuse A's helper. | Every listed case exists and asserts raw bytes, not only `meta:read`. Main = **31 + A's new count**, all green. Paste the test names. The T1-10 pin matches what you observe independently. |
| R3-2 (T1-8 red proof) | In `/tmp/c-r3-red` (rsync + `node_modules` symlink, as in R2-3), remove the `category` entry from `STANDARD_FIELDS`. Run `npm run test:main` and `npm run test:renderer`. Never edit the working tree. | T1-1, T1-2, the D-13 pin and T1-9(a/b/c) are red, with the log tails pasted. Also A's `red-before-field.log` exists and shows the same failures. |
| R3-3 (T1-4 is real) | In a `/tmp` copy, flip one byte inside the `bext` payload of the written file after the write and before T1-4's assertion (for example a one-line patch in the copy's test). Then, separately, make the copy's parser skip `bext`. | T1-4 is red in both mutations and green on the real tree. A test that cannot fail is not acceptance. |
| R3-4 (T1-6 ffprobe) | After `npm run check`, run `npx --yes tsx@4 tests/contract/check-ffprobe-tags.ts test-results/recording-tag-contract/contract.wav`. Then run it on `tests/fixtures/sample.wav` (no tags) and on a missing path. Parse `check.yml` with `js-yaml`. Confirm the step order. | Exit 0, with the printed tags showing `ICAT=DOORWood`, `IKEY=door, slam` and `comment=მძიმე კარი` (the Georgian text correct in ffprobe JSON). Exit 1 with a clear message on the two negatives. YAML is valid, the new step sits between "Lint, type check and unit tests" and "Build", and the other steps are unchanged in `git diff c768567`. The Actions run stays with TM-T0-CI (realVerified=false). |
| R3-5 (gate) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Separately: `npm run build && xvfb-run -a npx playwright test --retries=0 --reporter=list`. | exit 0; Biome 0 errors; typecheck 0 errors; renderer **75 + A's new count**; main as R3-1; E2E **7/7** with `--retries=0`. |
| R3-6 (real-app contract save) | Like R2-6: `_electron` under `xvfb-run` (`--no-sandbox`), a clean `XDG_CONFIG_HOME`, and the dialog stubbed to a temp folder. The folder holds a copy of `sample.wav` **and** a bext + iXML WAV that **C builds itself**. Through the UI, for each file: select it; the `Category (UCS)` input is visible; type Category `DOORWood`, Keywords `door, slam` and Comment `მძიმე კარი`; click Save. Then read each file with `ffprobe -v error -show_entries format_tags -of json`, with C's raw `LIST/INFO` dump and with `music-metadata` `parseFile`. | Screenshots before and after Save in `c-round-3/`. ffprobe shows `ICAT=DOORWood`, `IKEY=door, slam` and `comment=მძიმე კარი`. Raw INFO bytes match T1-1. music-metadata: title/comment under `common`; `ICAT`/`IKEY` under its native INFO/exif tags (as `IKEY` was in R2-6), not `common`. For Georgian, record the latin1 mojibake and rely on ffprobe plus raw bytes (round-0 rule). ffprobe also prints `time_reference` from `bext` (B measured it); that is expected. `data` sha256 is unchanged, and `bext`/`iXML` sha256 are unchanged on the recorder file. The file-list row still renders. |
| R3-7 (MIG regression, not MIG done) | Start the app with an `XDG_CONFIG_HOME` whose `schema.json` holds the 12 pre-T-1 standard fields (copy of `STANDARD_FIELDS` at `c768567`). | The app loads, and the metadata panel has no Category field. Schema Editor lists `Category (UCS)` under disabled standards. Enabling it and saving the schema shows the field in the panel. Screenshots. TM-T1-MIG stays open until Saba confirms D-07. |
| R3-8 (T1-9) | Read `schema-editor.test.ts`. In a running app, also try adding custom field `Client` with RIFF ID `ICAT` in Schema Editor. | The renderer cases pass, and the real UI shows `RIFF ID "ICAT" is already in use` (screenshot). |
| R3-9 (frozen/ownership) | `git status --porcelain`; `git diff --stat c768567`; `git diff --quiet c768567 -- src/main src/preload src/renderer package.json package-lock.json 'tsconfig*.json' biome.json playwright.config.ts vitest.config.renderer.ts vitest.config.main.ts electron.vite.config.ts .github/workflows/release.yml tests/fixtures tests/main/global-setup.ts tests/main/setup.ts tests/main/metadata.test.ts tests/e2e/electron-launch.ts tests/e2e/app-launch.spec.ts tests/e2e/folder-workflow.spec.ts tests/renderer/setup.ts tests/renderer/helpers tests/renderer/stores tests/renderer/utils`; `git diff c768567 -- .claude` | Only owned paths changed or were added. The `src/shared/types.ts` diff is exactly one added line. `.claude` changes only `primitives/WAV_METADATA.md`. No `any`, `@ts-ignore`, `@ts-expect-error` or `biome-ignore` added. No code comments added in `src/`. |
| R3-10 (docs) | Read `docs/recording-tag-contract.md`, the `WAV_METADATA.md` diff and the `002` plan diff. | Georgian. Contains every item of Scope 7. Values (IDs, terminator, separators, D-IDs) equal `feature-status.md` and the observed bytes. The stale lines in `002` are fixed. |

## What could break (C re-checks)
- **SchemaEditor**: `disabledStandards` and the toggle insert index (`SchemaEditor.tsx:38-59`). Category goes last, so the existing positions don't move. Auto-generated custom RIFF IDs must never produce `ICAT` (it is now reserved).
- **Existing tests that compare with `STANDARD_FIELDS` by reference** (`schema-store.test.ts`, `schema.test.ts`) must stay green without edits.
- **Every single-file save now carries `category`** (`MetadataPanel.tsx:76` sends all of `editingMetadata`). Saving a file without touching Category writes `ICAT=""`. This is expected under the D-10 pin. C records it in R3-6 by adding a third copy of `sample.wav`, saving only a Title on it (Category untouched) and dumping its INFO. It is not a FAIL.
- **Batch save** (`modifiedFields` only) must not write category unless it was edited (T1-5, plus a UI batch save of Title only on 2 files, then a dump of `ICAT`).
- **The `bext` → ffprobe `comment` pitfall**: on the recorder file, after the save, ffprobe `comment` must be the ICMT value, not `sSPEED=…`.
- **The panel layout**: one more Input at the bottom of the metadata panel must not overflow or hide the Save bar (screenshot).
- **CI**: the new step must run before Playwright cleans `test-results/`. `npm run check` must not depend on ffprobe (code read: Vitest never spawns it).

## Next (orientation only)
After T-1 is verified, ask Saba to decide D-10 (write `""` vs remove the sub-chunk), D-07 (TM-T1-MIG), TM-T1-DUP and D-12/TM-B08. Then RR-R2-01 + RR-R2-02 (small bug round) or TM-B06. T-2 stays BLOCKED until TM-T2-DATA arrives.
