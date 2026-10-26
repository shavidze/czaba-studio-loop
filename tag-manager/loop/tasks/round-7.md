# CURRENT TASK — Round 7: TM-B12 `writeTagsToFile` fails loudly when custom INFO fields cannot be written (D-17, RR-R6-01) + RR-R6-02 `ICRD` NUL pin test

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 6 (TM-B10, D-16 reader NUL strip, plus RR-R2-01) got **C PASS** on R6-1…R6-7 with realVerified=true. Root review gave COMMIT OK and root published `d52354d`. TM-B10, RR-R2-01, C-R5-01 and C-R5-02 are closed. C's "before" run on the `a8c1b53` build confirmed the data loss: Take `0`, and the raw `ITKN` after a save was `0`.

Root review R6 raised one **medium**, RR-R6-01, now item **TM-B12**:
- Since round 6, `getRiffInfoTags` returns `[]` for a non-`CombinedTag` instead of throwing.
- `writeTagsToFile` (`src/main/ipc/metadata.ts:186-204`) then skips every custom INFO field (category/ICAT, keywords/IKEY, any custom field). It still calls `file.save()`, and `meta:write` / `meta:writeBatch` report success.
- The failure used to be loud and is now silent.

B confirmed this on `d52354d` with a real WAV and the real library. Only `file.tag` was overridden, to `Id3v2Tag.fromEmpty()`, through `vi.spyOn(TagFile, 'createFromPath')` (`b-round-6-exp-spy-write.test.ts.txt` in the loop folder). Result: `meta:write` resolved `undefined`, `save()` was called once, the file bytes changed, and `ICAT` was not written.

**Honesty note:** for WAV files from node-taglib-sharp the branch is unreachable, because a RiffFile tag is always a `CombinedTag`. This is a defensive guard. It can only be proven with the overridden-tag test. The real-app checks below are regression checks of the normal write paths.

**RR-R6-02** (low, root review R6, same file and test area):
- The `year` getter does not strip NULs, and no test covers `ICRD "2024\0"`.
- B fact (`b-round-5-exp-nul-number.cjs`, re-run this phase): taglib already reads `ICRD "2024\0"` as `2024`. So this is a **pin test**, green before and after. It is not a bug fix.
- `track`/`bpm` are not mapped by taglib from INFO (B-R6-01), so they are not part of this round.

No critical or high bug is open. TM-T0-CI still waits for root to link an Actions run on `7879ee0` or later.

**D-17 (B, technical, reversible):**
- In `writeTagsToFile`, keep the title workaround. If `customFields.length > 0` and `getRiffInfoTags(file.tag)` is still `[]` after it, then **before `file.save()`** run:
  `throw new Error('RIFF INFO tag is not available; custom fields were not written');`
- Nothing is written to the file, and `finally` still disposes it.
- `meta:write` surfaces it unchanged through the existing mapping as `Failed to write metadata: RIFF INFO tag is not available; custom fields were not written`. The message contains none of `Corrupt`/`corrupt`/`EBUSY`/`EACCES`.
- `meta:writeBatch` puts the file in `failed` with the raw message and continues with the next file.
- When `customFields` is empty (schema without custom INFO fields, or all custom values `undefined`), behaviour is unchanged.

## Baseline
- HEAD `d52354da08ca15692338c254f43cd6b9a1d2774e`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - every `src/**` file except `src/main/ipc/metadata.ts`;
  - `src/preload/**`, `src/shared/**`, `src/renderer/src/styles/app.css` (protected);
  - `package.json`, `package-lock.json`, all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.github/**` (including the protected `release.yml`);
  - `tests/fixtures/**`, `tests/main/riff-chunks.ts`, `tests/main/setup.ts`, `tests/main/global-setup.ts`;
  - every existing test file except `tests/main/riff-info-nul.test.ts`. In particular `tests/main/metadata.test.ts` and `tests/main/recording-tag-contract.test.ts` (T1-1 "no NUL", T1-10 clear path);
  - `tests/renderer/**`, `tests/e2e/**`, `tests/contract/**`;
  - `.claude/**`, `docs/**`.

## Scope
1. **`src/main/ipc/metadata.ts`, `writeTagsToFile` only**
   - Inside the existing `if (customFields.length > 0)` block, after the title workaround, add the D-17 guard. The simplest form: replace `if (infoTags.length > 0) { … }` with an early `if (infoTags.length === 0) throw …;` and then the unchanged loop.
   - The error text is exactly `RIFF INFO tag is not available; custom fields were not written`.
   - Do not change:
     - the per-field `try`/`catch` around `setValuesFromStrings`, including its pre-existing `//` line (RR-R6-04/05 stay signals);
     - the read path, `getRiffInfoTags`, `stripRiffNulTerminator` and `STANDARD_PROP_MAP`;
     - the IPC handlers, the error mapping and the handler signatures;
     - the channels and the D-10 empty-value behaviour.
   - Rules:
     - no `any`, `@ts-ignore`, `@ts-expect-error` or `biome-ignore`;
     - semicolons;
     - **no new comments**;
     - no new export is needed. If you add a constant for the message, keep it internal and follow `AGENT_DISCOVERABLE_CODE.md` naming.
     - Biome rejects control characters in regex literals in `src/` (round-6 fact). Irrelevant here, but don't introduce any.
2. **Tests (red first, `test-on-bugfix`)**
   - **New file `tests/main/metadata-write-guard.test.ts`.**
     - Use the `getHandler` pattern of `riff-info-nul.test.ts` and `registerMetadataHandlers()` in `beforeAll`. Work on copies of `tests/fixtures/sample.wav` in a per-run temp dir, and remove it in `afterAll`.
     - Schema = `STANDARD_FIELDS`. It contains `keywords`/IKEY and `category`/ICAT, which go through the custom INFO path.
     - Helper: `vi.spyOn(TagFile, 'createFromPath').mockImplementationOnce(path => …)`. Inside it, call the original, which you captured **before** spying. Override `tag` on that instance with `Object.defineProperty(file, 'tag', { get: () => Id3v2Tag.fromEmpty-instance, configurable: true })`, and wrap `file.save` to count calls. B's working snippet: `b-round-6-exp-spy-write.test.ts.txt`. Adapt its hard-coded `/tmp/b-r7-spy/g.wav` path to your temp dir.
     - Call `vi.restoreAllMocks()` in `afterEach`.
     - Cases:
       - (a) Single write with overridden tag, `meta:write` with `{ category: 'DOORWood' }`:
         - it rejects with exactly `Failed to write metadata: RIFF INFO tag is not available; custom fields were not written`;
         - the counted `save` calls are `0`;
         - the file bytes equal the bytes before the call (`Buffer.equals`).
       - (b) No custom values, overridden tag. `meta:write` with `{ title: 'X' }` and full `STANDARD_FIELDS` (category/keywords are `undefined`, so `customFields` is empty): it **resolves** and `save` is called once. This kills a guard that ignores `customFields.length`.
       - (c) Batch. `meta:writeBatch` on two copies `[first, second]` with `{ category: 'DOORWood' }`; only the first `createFromPath` call is overridden:
         - the result is `{ succeeded: 1, failed: [{ path: first, error: 'RIFF INFO tag is not available; custom fields were not written' }] }`;
         - the `first` bytes are unchanged;
         - `parseListInfoSubChunks` on `second` gives `ICAT` = exactly `DOORWood` (8 bytes, no byte 0).
       - (d) Real WAV, no spy, regression. `meta:write` with `{ category: 'DOORWood', keywords: 'door, slam' }`: raw `ICAT` = `DOORWood` and `IKEY` = `door, slam`.
   - **`tests/main/riff-info-nul.test.ts`**: add exactly one case, (i): INFO `ICRD "2024\0"` → `meta:read` gives `year === 2024`. This is a pin test that already passes on `d52354d`; say so in the report. Do not change the existing cases (a)–(h).
   - **Red proof:**
     1. Before editing `metadata.ts`, run `npx vitest run --config vitest.config.main.ts tests/main/metadata-write-guard.test.ts` on the untouched `d52354d` tree. The current `metadata.ts` is the red state.
     2. Expected: (a) fails, because the promise resolves (or save count 1 / bytes changed). (c) fails with `failed: []` and `succeeded: 2`. (b) and (d) pass.
     3. Save that run as `a-round-7/red-before-fix.log`, and the green run as `a-round-7/green-after-fix.log`.

**Explicitly NOT in this round:**
- The per-field silent `catch` and the removal of the `//` comments (RR-R6-04/05).
- TM-B11 (custom number `0` written as `"0"`, a Saba decision with D-10).
- B-R6-01 (IBPM/ITRK), TM-B05, TM-B08.
- Any renderer change (RR-R5-02).
- CI (TM-T0-CI-FU, RR-R1-01/03).
- Schema migration or duplicates (TM-T1-MIG/DUP).
- Biome on `tests/` (TM-B06).
- The `as unknown as TagObject` casts (RR-R2-04).
- Package installs.

Read first:
- `.claude/primitives/WAV_METADATA.md`, `ELECTRON_IPC.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`;
- `.claude/rules/test-on-bugfix.md`;
- `tests/main/riff-info-nul.test.ts` and `tests/main/riff-chunks.ts` (patterns);
- `b-round-6-exp-spy-write.test.ts.txt` in the loop folder.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | D-17 guard in `writeTagsToFile` only |
| `tests/main/metadata-write-guard.test.ts` (new) | red-first tests (a)–(d) |
| `tests/main/riff-info-nul.test.ts` | add case (i) `ICRD "2024\0"` pin (RR-R6-02) |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Reports and logs go to `a-round-7/` in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R7-1 (red/green) | Read A's `red-before-fix.log`. Set up `/tmp/c-r7-red` (rsync + `node_modules` symlink) with `git show d52354d:src/main/ipc/metadata.ts` and the new test, and run `npx vitest run --config vitest.config.main.ts tests/main/metadata-write-guard.test.ts tests/main/riff-info-nul.test.ts`. Then run the same command on the real tree. | **Red:** (a) and (c) of the guard file fail as described; (b), (d) and riff-info-nul (a)–(i) pass. **Green:** all pass on the real tree. |
| R7-2 (mutations) | In `/tmp` copies of the fixed tree: **M1** removes the guard and restores `if (infoTags.length > 0) {…}`. **M2** moves the guard out of the `customFields.length > 0` block, so it throws whenever `getRiffInfoTags(file.tag)` is `[]`. **M3** throws only after `file.save()`. **M4** changes one character of the message. | M1: (a) and (c) fail. M2: killed when (b) fails. (d) and other real-WAV writes may also fail, depending on whether the moved guard sits before the title workaround. That is expected, not a mismatch. M3: (a) fails on save count or bytes. M4: (a) and (c) fail. Each mutation is killed. |
| R7-3 (gate) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Also run E2E with `--retries=0`. | Exit 0. Biome 0 errors, no new warnings in `metadata.ts` (compare against `d52354d`). Typecheck 0 errors (node/web/test). Renderer **107/107**. Main **50 + A's new count**, all green: `metadata.test.ts`, `recording-tag-contract.test.ts` (T1-1, T1-10) and riff-info-nul (a)–(h) unchanged and green. E2E **7/7** with `--retries=0`. |
| R7-4 (real app: single save regression) | Built app with `_electron` under `xvfb-run -a` (`--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder). On a fresh copy of `sample.wav`, set Category `DOORWood`, Keywords `door, slam` and Comment `heavy door` in the editor, Save, Rescan. | `Tags saved` toast. Raw INFO dump: `ICAT` 8 bytes, `IKEY` 10 bytes, `ICMT` 10 bytes, no byte 0 in them. ffprobe shows `ICAT=DOORWood`, `IKEY=door, slam`, `comment=heavy door`, and music-metadata agrees (ASCII values). The row is `Tagged`. Screenshot `c-round-7/r7-4-*.png`. |
| R7-5 (real app: batch save + batch failure UI) | Same session. (i) Select two fresh copies (multi-select: click the first row, then Ctrl+click the second, `FileList.tsx:56-59`; Shift+click selects a range) and set Category `BATCHCat` (any ASCII value). Save. (ii) Make a third copy read-only (`chmod 444`) and select it with one writable copy. Set Category, Save. | (i) `Tags saved to 2 files`; both files have raw `ICAT` = the value; ffprobe agrees. (ii) Toast `1 saved, 1 failed`; the read-only file's bytes are unchanged (sha256); the writable file has the value. If EACCES cannot be reached on the runner (for example the process runs as root), report that with evidence and mark (ii) BLOCKED. That is not a FAIL. Screenshots `r7-5-*.png`. |
| R7-6 (frozen/ownership) | `git status --porcelain --untracked-files=all`; `git diff --stat d52354d`; `git diff --quiet d52354d -- . ':!src/main/ipc/metadata.ts' ':!tests/main/metadata-write-guard.test.ts' ':!tests/main/riff-info-nul.test.ts'`. Read the `metadata.ts` and `riff-info-nul.test.ts` diffs. | Only the three owned paths changed or were added. The `metadata.ts` diff touches only the `writeTagsToFile` guard: the read path, handlers, mapping and per-field catch are unchanged. `riff-info-nul.test.ts` only gains case (i). No `any`, `@ts-*`, `biome-ignore` or new comments. |

**Evidence rules:**
- ffprobe hides NULs, so every byte claim needs a raw INFO dump (`parseListInfoSubChunks` or an equivalent hex/size dump).
- music-metadata decodes non-Latin RIFF INFO text as mojibake (C R6 observation). That is why this round's real-app values are ASCII.

## What could break (C re-checks)
- **Normal WAV writes:** single and batch saves must still write ICAT/IKEY/ICMT (R7-4, R7-5, recording-tag-contract tests).
- **T1-10 clearing path:** an empty value is still written as a size-0 sub-chunk (existing test, R7-3).
- **Error mapping:** the `meta:write` mapping (`Corrupt` → `File appears to be corrupted…`, `EBUSY`/`EACCES` → `File is locked or read-only`) stays byte-identical. Only the code read in R7-6 covers it: the existing `metadata.test.ts` tests only `corrupt.wav` → empty metadata on read. The batch path returns the raw error message (R7-5 ii).
- **Batch continues after a failing file:** (c) and R7-5 ii.
- **A WAV without INFO:** the title workaround still creates the InfoTag, so the guard does not fire (R7-4 starts from `sample.wav`, which has no INFO).
- **Reader (D-16):** riff-info-nul (a)–(h) stay green.

## Next (orientation only)
1. Root reports the first `Check` Actions run on `7879ee0` or later (`d52354d` qualifies):
   - **green:** TM-T0-CI and TM-T0 close;
   - in either case, TM-T0-CI-FU (apt worst-case budget + Georgian docs note) becomes a small CI round.
2. Saba question batch:
   - D-07 (TM-T1-MIG);
   - D-10 plus **TM-B11** (custom number `0` written as `"0"`, C-R6-01);
   - D-12/TM-B08 plus B-R6-01;
   - TM-T1-DUP (RR-R3-01), D-15 plus RR-R5-01;
   - D-16/D-17 (for information), RR-R1-07, RR-R3-05, TM-B06;
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
3. Low items that need no decision:
   - RR-R5-02 (`typeof` guard) as a renderer round;
   - RR-R6-04/RR-R6-05 (honest per-field write status, comment removal) as a later write-path round;
   - RR-R5-06 is a signal.
