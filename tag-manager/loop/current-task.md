# CURRENT TASK — Round 47: TM-B05 (Saba Q5 → D-51) — a WAV with empty audio data fails its save with "Audio data is empty, cannot tag"

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 46: C PASS** (R46-1..R46-8, `realVerified=true`, bugs 0). Renderer 326/326, main 120/120, E2E 7/7 (`--retries=0` 7/7).
  - Real app: an unset custom Number field is no longer written, and a typed `0` is written as `'0'` and shown. Clearing removes the field from raw INFO, ffprobe and music-metadata.
  - Root published **1ea34df**. D-50 is verified. **TM-B11 is done** (both stages).
- No critical or high bug is open. Root's round-46 findings are low/info signals (RR-R46-01..05) and are not scheduled.
- **Next in Saba's order: Q5 → TM-B05 (low).**
  - Saba Q5 (2026-10-28): "a clear per-file error ('audio data is empty, cannot tag'), pinned by a test. No upstream patch."
- **The bug (B-R0-03, D-05).** node-taglib-sharp 6.0.1 cannot open a WAV whose empty `data` chunk is the last chunk.
  - Single save today shows the library text in the toast: `Error invoking remote method 'meta:write': Error: Failed to write metadata: WAV file is missing data chunk` (round-1 evidence).
  - Batch save stores `WAV file is missing data chunk` in `failed[].error`.
- **B probe** (script saved as `b-round-46-exp-empty-audio-probe.cjs.txt` in the loop folder; node-taglib-sharp from the repo at 1ea34df):

  | File | `File.createFromPath` (read and write) |
  |---|---|
  | 44-byte WAV, `data` size 0, last chunk | throws `CorruptFileError: WAV file is missing data chunk` |
  | WAV with `fmt ` and no `data` chunk | same error |
  | `data` size larger than the file (truncated) | same error |
  | 0-sample WAV whose empty `data` is followed by a `LIST` chunk | opens; Title write + read back OK |
  | 1-sample WAV | opens; Title write OK |
  | `tests/fixtures/corrupt.wav` | throws `CorruptFileError: WAV file is missing header chunk` (`instanceof CorruptFileError` true) |

  - `CorruptFileError` is exported from the package index (`node_modules/node-taglib-sharp/dist/index.d.ts:2`).
  - None of these messages contains "corrupt", so the handler's `msg.includes('Corrupt')` branch never fires for them. Signal only, not this round.
- **Reference:** exempt. This is a pure fix of an error message Saba already decided, with no new UX.

## Deviations / limits (stated, not hidden)
1. **One library message covers three cases:** empty data at the end, no data chunk, and a truncated data chunk. All three get "Audio data is empty, cannot tag".
   - Telling them apart would need a RIFF pre-parser in main, and Q5 does not ask for one.
   - None of these files has playable audio.
2. **Message casing:** Saba wrote it in lowercase. The code uses sentence case like its other error texts: `Audio data is empty, cannot tag`.
3. **Single-save toast prefix:** the toast keeps Electron's `Error invoking remote method 'meta:write': Error: ` prefix and the handler's `Failed to write metadata: ` prefix. Every write error (D-17/D-18) is shown like this today. Shortening it is not in this round.
4. **The read half of the TM-B05 title is unchanged.** `meta:read` / `meta:read-batch` still return `emptyMetadata` for such a file, so the panel shows empty fields and the error appears only on save.
   - Changing how read failures are reported would touch `applyMetadataRead` and three renderer callers.
   - Saba's Q5 answer names only the tagging error. This goes to Saba as **Q22**.
   - A test pins today's read behaviour, so any later change is deliberate.
5. **The batch UI shows counts, not reasons.** The batch toast stays `N saved, M failed`. The per-file reason is in the IPC result's `failed[].error`. Showing reasons in the batch UI is new UX and goes to Saba as **Q23**.

## Baseline
- HEAD `1ea34df5215a87f386a07f9808b969a834b144d2`, clean working tree (`git status --porcelain --untracked-files=all` empty).
  - Exception (release-commit rule): a root `chore(release): vX.Y.Z` commit directly on 1ea34df that changes only the two `version` fields counts as the baseline.
  - If HEAD differs or the tree is dirty, **stop and report**.
- **Frozen:** every path not in the ownership table stays byte-identical to 1ea34df. That explicitly includes:
  - `src/shared/**`, `src/preload/**`;
  - `src/main/ipc/schema.ts`, `file-system.ts`, `channels.ts`, `templates.ts`, and `src/main/index.ts`;
  - all of `src/renderer/**`. No renderer change is needed: the single-save catch already shows `err.message`;
  - every existing test file, including:
    - `tests/main/metadata.test.ts`, `metadata-write-guard.test.ts`, `metadata-write-field-errors.test.ts`;
    - `metadata-empty-values.test.ts`, `metadata-number-values.test.ts`;
    - `riff-chunks.ts`, `riff-info-nul.test.ts`, `recording-tag-contract.test.ts`;
    - `tests/contract/**`, `tests/e2e/**`, `tests/renderer/**`, `tests/fixtures/**`;
  - `docs/plans/**`, `docs/bugs/**`.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-51)

### A1. `src/main/ipc/metadata.ts`: write path only
- Add a module-private helper (not exported), named per `AGENT_DISCOVERABLE_CODE.md`, e.g. `openTagFileForWrite(filePath): TagFile`.
  - It calls `TagFile.createFromPath(filePath)`.
  - If that throws an error whose `message` is **exactly** `'WAV file is missing data chunk'`, the helper throws `new Error('Audio data is empty, cannot tag')`.
  - Keep both strings in module-private constants, e.g. `LIBRARY_MISSING_DATA_CHUNK_MESSAGE` and `EMPTY_AUDIO_DATA_ERROR_MESSAGE`.
  - Every other error is rethrown unchanged.
  - A may additionally require `err instanceof CorruptFileError` (import from `node-taglib-sharp`). The exact message match is required either way.
- `writeTagsToFile` uses the helper instead of `TagFile.createFromPath`. Nothing else in `writeTagsToFile` changes.
- **Unchanged:**
  - `readTagsFromFile`, `emptyMetadata`, and the `meta:read` / `meta:read-batch` handlers (Deviation 4);
  - the `meta:write` handler's wrapper and its `Corrupt`/`EBUSY`/`EACCES` branches. The new message contains none of those words, so it ends up as `Failed to write metadata: Audio data is empty, cannot tag`;
  - the `meta:write-batch` loop. It already puts `err.message` into `failed[].error` and continues with the next file.
- No new exports, no new IPC channel. No comments in code; semicolons; no `any`.

### A2. Tests, red first. New file `tests/main/metadata-empty-audio.test.ts`
- Use double quotes, like the neighbouring main tests.
- Build the WAVs locally in the test, in a `tmpdir()` folder, with a header writer like the probe's `wav(n, extra)`.
  - `riff-chunks.ts` may be used read-only.
  - Never write into `tests/fixtures/`.
- Get handlers through `ipcMain._handlers`, as `metadata-write-guard.test.ts` does.

Cases:
- **(a1)** `meta:write` with `{ title: "R47" }` and `STANDARD_FIELDS` on a 44-byte WAV whose `data` size is 0 and which is the last chunk:
  - rejects with the message **exactly** `Failed to write metadata: Audio data is empty, cannot tag`;
  - the file's sha256 is unchanged.
- **(a2)** `meta:write-batch` on `[emptyWav, copyOfSampleWav]` with `{ title: "R47 batch" }`:
  - resolves `{ succeeded: 1, failed: [{ path: emptyWav, error: "Audio data is empty, cannot tag" }] }` (exact `toEqual`);
  - the sample copy reads `title === "R47 batch"` through `meta:read`;
  - the empty WAV's sha256 is unchanged.
- **(a3)** `meta:write` on a WAV with `fmt ` and no `data` chunk → the same exact message (Deviation 1); sha256 unchanged.
- **(a4)** `meta:write` on a 0-sample WAV whose empty `data` is followed by a `LIST/INFO` chunk → resolves, and `meta:read` returns the new title. This guards against blocking files that can be tagged.
- **(a5)** `meta:write` on a 1-sample WAV (2 data bytes) → resolves; the title reads back.
- **(a6)** `meta:write` on `tests/fixtures/corrupt.wav` (copied to tmp) → rejects with exactly `Failed to write metadata: WAV file is missing header chunk`. This proves the mapping does not swallow other library errors.
- **(a7)** `meta:read` and `meta:read-batch` on the 44-byte empty WAV still return `emptyMetadata(STANDARD_FIELDS)`: every text field `''`, every tags field `[]`, every number field `''`. This pins today's read behaviour (Deviation 4, Q22).

**Red proof** on 1ea34df `src/` (temp copy outside the repo, `node_modules` symlinked, A's new test file copied in):
- must fail: (a1), (a2), (a3);
- must pass on both trees: (a4), (a5), (a6), (a7).
- A records the observed pass/fail of every case in `a-round-47/`.
- If a "must pass" case fails on the baseline, **stop and report** it. Do not weaken it.
- This includes (a4). If the library's rewrite leaves the empty `data` chunk last and (a4) goes red on both trees, stop and report. Do not change the case.

**Stop rule:** if any existing test fails after A1, **stop and report** its name. Do not edit it.

### A3. Docs (Georgian, English technical terms)
- **`docs/recording-tag-contract.md`:**
  - In `## ჩაწერის შეცდომები`, add a D-51 bullet that covers:
    - the message `Audio data is empty, cannot tag`;
    - single save shows `Failed to write metadata: Audio data is empty, cannot tag`;
    - batch puts the message in `failed[].error` and continues;
    - the file is not changed;
    - the three file shapes from Deviation 1;
    - read still shows empty fields (Q22).
  - Add D-51 to the header decision list (line 5).
  - In `## შემოწმება`, add `tests/main/metadata-empty-audio.test.ts`.
- **`.claude/primitives/WAV_METADATA.md`:** add one short Georgian rule next to the D-50 line:
  - an empty or missing `data` chunk gives `Audio data is empty, cannot tag`;
  - the file is not written, and read is unchanged (D-51).
  - Use the **Edit tool** (standing `.claude/**` permission).

### Not in this round
- Read-time flag for untaggable files (Q22).
- Batch toast reasons (Q23).
- The `msg.includes('Corrupt')` branch that never fires for library errors (signal B-R46-01).
- RR-R46-01..05, RR-R45-02/04/05, C-R45-01.
- TM-B08, TM-B06.

**Process (round-46 note C-R46-01):**
- Every repository write goes through the **Edit/Write tools only**. No `sed -i`, no shell redirection, no `tee`, no script that writes into the repository.
- A states in `a-round-47.md` that no Bash command wrote into the repository.
- Before the first edit, read `WAV_METADATA.md`, `ELECTRON_IPC.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md`.
- 4 files change, so run the `code-reviewer` subagent (read-only) and record its findings in `a-round-47.md`.
- After the fix, a read-only `qa-engineer` regression pass is optional. Record it if you run it.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | A1: open helper + constants, `writeTagsToFile` uses it; nothing else |
| `tests/main/metadata-empty-audio.test.ts` (new) | A2: (a1)–(a7) |
| `docs/recording-tag-contract.md` | A3: D-51 bullet, header list, `## შემოწმება` line |
| `.claude/primitives/WAV_METADATA.md` | A3: one rule |

**B's grep** of tests that feed the changed flow (searched `tests/` for `missing data chunk`, `missing header`, `corrupt`, `Failed to write metadata`, `createMinimalWav`, `rejects`). None of them should change:
- `metadata.test.ts` "returns empty metadata for corrupt files" is a read test.
- `metadata-number-values.test.ts` (n9) reads `corrupt.wav`.
- `metadata-empty-values.test.ts` (e8)/(e9) assert `Failed to write metadata: RIFF INFO fields could not be written: AB`. That path opens the file successfully.
- `create-fixtures.test.ts` pins the `corrupt.wav` bytes.
- No e2e or renderer test uses an empty-data WAV.

In the loop folder, A writes only `a-round-47.md` (plus `a-round-47/` logs). C writes `c-round-47.md`/`.json` and evidence under `c-round-47/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R47-1 ownership | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `git diff --stat 1ea34df`; `git diff --quiet 1ea34df -- <frozen/protected paths>`; read the `metadata.ts` diff | HEAD is 1ea34df (or the release exception). Changed paths ⊆ ownership table. The `metadata.ts` diff touches only the new helper/constants, the one `createFromPath` call in `writeTagsToFile`, and an optional `CorruptFileError` import. Read path and handlers byte-identical. Frozen/protected paths unchanged. |
| R47-2 red/green + mutants | Temp copy outside the repo (`node_modules` symlinked) with 1ea34df `src/` + A's test, then A's tree. Mutants: **M1** no mapping (library text passes through); **M2** map every error from `createFromPath`, whatever its message; **M3** map in the `meta:write` handler only, not in `writeTagsToFile`; **M4** the batch loop stores `Failed to write metadata: Audio data is empty, cannot tag` (handler prefix) instead of the bare message; **M5** `message.includes('data chunk')` instead of the exact match | Red/green as A2 lists; C records each case. M1 killed by (a1)/(a2); M2 by (a6); M3 by (a2); M4 by (a2). A read-path mutant (helper also used in `readTagsFromFile`) is **equivalent**: the read handlers' `catch` returns `emptyMetadata` for any error, so (a7) cannot kill it. C records it as an expected survivor, and the R47-1 diff check is what keeps the read path unchanged. For M5, C states whether any test tells it apart; a named survivor is acceptable. Logs go in `c-round-47/`. |
| R47-3 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer 326/326 (unchanged); main 120 + A's new count, all passing. E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |
| R47-4 real app: single save on an empty-audio WAV | Built app via Playwright `_electron`, `xvfb-run`, temp `XDG_CONFIG_HOME`. Folder holds `empty.wav` (44 bytes, `data` size 0, last chunk; C writes it with a small script) and `tone.wav` (ffmpeg sine). Select `empty.wav`, type Title `R47`, Save Tags. **Do not press Play** (the player loads audio only on play). | Toast exactly `Error invoking remote method 'meta:write': Error: Failed to write metadata: Audio data is empty, cannot tag` (screenshot). `empty.wav` sha256 unchanged: this is the proof that nothing was written, since ffprobe/music-metadata show no tags on such a file anyway. The form keeps `R47` (D-24: a write reject keeps the edits). The row stays untagged. `pageErrors` empty. **Contrast on a 1ea34df build:** the toast ends with `WAV file is missing data chunk`. |
| R47-5 real app: batch with one empty-audio file | Select `empty.wav` + `tone.wav`, type Title `R47 batch`, `Save to 2 files`. Supporting IPC check: from `page.evaluate`, call `window.api.writeMetadataBatch([emptyPath, tone2Path], { title: 'X' }, await window.api.loadSchema())`, where `tone2.wav` is a second ffmpeg file | Toast `1 saved, 1 failed`. `tone.wav` INAM=`R47 batch` in raw INFO, in `ffprobe -show_entries format_tags -of json` (`title`) and in music-metadata. `empty.wav` sha256 unchanged. IPC result: `failed` = `[{ path: emptyPath, error: 'Audio data is empty, cannot tag' }]`, `succeeded` = 1. Unselected files byte-identical. |
| R47-6 real app: normal save unaffected | Select `tone.wav` alone, change Title to `R47 ok`, Save | Toast `Tags saved`. INAM=`R47 ok` in all three readers. |
| R47-7 docs | Read the owned docs diff | `recording-tag-contract.md` has the D-51 bullet with every point A3 lists, D-51 in the header list, and the new test file in `## შემოწმება`. `WAV_METADATA.md` has the D-51 rule. Georgian with English technical terms. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **D-17/D-18 error texts:** still `Failed to write metadata: RIFF INFO ...` ((e8)/(e9), `metadata-write-field-errors.test.ts`).
- **Corrupt files:** the write text (a6), and a corrupt-file read still returns `emptyMetadata` (`metadata.test.ts`, (n9)).
- **Batch flow:** a failed file does not stop the others; the D-22 re-read updates only saved files; toast counts are right.
- **D-49 / D-50 write behaviour** on normal files: every round-45/46 test stays green unchanged.
- **E2E IPC write/read** (`folder-workflow.spec.ts`, `recording-tag-contract.spec.ts`) on their non-empty fixtures.

## Next (orientation only, Saba's order)
1. **Q3 → TM-B08:** docs/test pin (D-12: artists outside K-4, no writer change).
2. **Q6 → TM-B06:** Biome over `tests/**` with a relaxed override, as its own round.
3. **Q7 → TM-T2-DATA → TM-T2:** waiting on Saba.
4. **Open for Saba (non-blocking):**
   - Q9–Q21;
   - new: Q22 (flag untaggable files at read time), Q23 (per-file reasons in the batch toast), Q24 (standard Year/Track/BPM `0`, RR-R46-01).
