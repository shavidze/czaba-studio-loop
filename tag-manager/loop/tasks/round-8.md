# CURRENT TASK — Round 8: TM-B13 `writeTagsToFile` fails before save when any custom INFO field cannot be written (D-18, RR-R7-02) + remove two `//` comments (RR-R6-04, RR-R7-03) + Georgian docs note on all-or-nothing saves (RR-R7-01)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 7 (TM-B12, D-17) got **C PASS** on R7-1…R7-6 with realVerified=true. Root review gave COMMIT OK and root published `28ad3ab`. TM-B12, RR-R6-01 and RR-R6-02 are closed. No critical or high bug is open.

Root review R7 raised:
- **RR-R7-02 (low):** the per-field `try { infoTags[0].setValuesFromStrings(…) } catch { // … }` in `writeTagsToFile` still swallows errors. The field is skipped, `file.save()` runs, and `meta:write` / `meta:write-batch` report success.
- **RR-R7-03 / RR-R6-04 (low):** the two pre-existing `//` comments in `metadata.ts` break the "no comments in code" rule.
- **RR-R7-01 (medium, docs only):** since D-17 a save is all-or-nothing. The reviewer asked for a note so the error toast is expected. No code fix.

**B fact** (`b-round-7-exp-bad-chunkid.cjs` in the loop folder, run with the repo's `node_modules` on `28ad3ab`; this is the real library, not a mock):

| `riffChunkId` | `setValuesFromStrings` | `save()` afterwards |
|---|---|---|
| `'AB'` | throws `Argument error: ID must be 4 bytes` | succeeds |
| `'ICAT5'` | throws `Argument error: ID must be 4 bytes` | succeeds |
| `''` | throws `Argument null: id was not provided` (never reached in the app: `if (field.riffChunkId)` skips it) | succeeds |
| `'abcd'`, `'IC T'` | no throw | succeeds |
| valid `'ITKN'` with values `[]`, `['']`, `['a','b']`, `['ქართული']`, `['0']`, `['3']` (`b-round-7-exp-valid-values.cjs`) | no throw | succeeds |

So D-18 only fires on a malformed ID. Empty, multi-value, non-ASCII and number values through a valid ID never throw. A normal panel save with untouched custom fields keeps working.

Also confirmed:
- `grep -n '//' metadata.ts` on HEAD shows exactly lines 148 and 200, the two comments.
- The batch path sends only `modifiedFields` (`MetadataPanel.tsx:84-91`). The single-file path sends the whole `editingMetadata` (`:76`).

How the bad value gets there:
- `src/main/ipc/schema.ts` `isValidField` does not check `riffChunkId`, so a hand-edited or foreign `schema.json` reaches the write path with such an ID.
- The Schema Editor UI cannot create one (`isValidRiffId`; `generateRiffId` assigns 4 chars).
- That is why TM-B13 is **low**. Whether the silent loss shows up in the real app is an inference until C's R8-4/R8-5 "before" run.

**D-18 (B, technical, reversible):**
- In `writeTagsToFile`'s custom INFO loop, a `setValuesFromStrings` error is no longer swallowed. The loop still tries **every** custom field. It collects `String(riffChunkId)` of each failing field, in schema order.
- After the loop, if at least one failed, throw **before `file.save()`**:
  `new Error(\`RIFF INFO fields could not be written: ${failedIds.join(', ')}\`)`
  Nothing is written to the file. `finally` still disposes it.
- How it surfaces:
  - `meta:write` uses the existing mapping: `Failed to write metadata: RIFF INFO fields could not be written: AB`.
  - `meta:write-batch` (the real channel name, `channels.ts:8`) puts the file in `failed` with the raw message and continues with the next file.
- Unchanged:
  - Fields whose value is `undefined` are not attempted.
  - A non-standard field **without** `riffChunkId` is still skipped silently. That is signal B-R7-03 and not part of D-18.
  - The read path.
  - D-17's guard and message.
- Accepted caveat: an ID that contains `corrupt`/`EBUSY`/`EACCES` would hit the `meta:write` mapping. Do not special-case it.

## Baseline
- HEAD `28ad3ab15dc10a9dd83a23d43994dfc71313cbf9`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - every `src/**` file except `src/main/ipc/metadata.ts`, including `src/main/ipc/schema.ts` (no load-time ID validation this round, B-R7-02 is a signal) and `src/main/ipc/channels.ts`;
  - `src/preload/**`, `src/shared/**`, `src/renderer/src/styles/app.css` (protected);
  - `package.json`, `package-lock.json`, all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.github/**` (including the protected `release.yml`);
  - `tests/fixtures/**`, `tests/main/riff-chunks.ts`, `tests/main/setup.ts`, `tests/main/global-setup.ts`;
  - every existing test file, in particular `tests/main/metadata-write-guard.test.ts` (D-17 cases (a)–(d)), `tests/main/riff-info-nul.test.ts`, `tests/main/metadata.test.ts` and `tests/main/recording-tag-contract.test.ts`;
  - `tests/renderer/**`, `tests/e2e/**`, `tests/contract/**`;
  - `.claude/**`, and every `docs/**` file except `docs/recording-tag-contract.md`.

## Scope
1. **`src/main/ipc/metadata.ts`**
   - **`writeTagsToFile`:** implement D-18 inside the existing `if (customFields.length > 0)` block, after the D-17 guard.
     - Collect failing IDs in a local array.
     - Replace the comment-only `catch` body with pushing `String(riffChunkId)`.
     - After the loop and before `file.save()`, throw the exact D-18 message if the array is non-empty.
     - The message text is exactly `RIFF INFO fields could not be written: ` followed by the IDs joined with `, `.
   - **`readTagsFromFile`:** remove only the comment line `// InfoTag read failed, use default`. The `catch` stays and becomes `catch {}` (or whatever `biome format` produces). Read behaviour must not change.
     - B fact: with this `biome.json`, Biome 2 accepts an empty `catch {}` (B ran a one-file check, exit 0).
   - Afterwards `grep -n '//' src/main/ipc/metadata.ts` shows no comment lines (URLs or strings excepted; there are none today).
   - Do not change:
     - the D-17 guard;
     - the title workaround (A-R7-01 says it may be redundant; leave it);
     - `getRiffInfoTags`, `stripRiffNulTerminator`, `STANDARD_PROP_MAP`;
     - the handlers, the error mapping, the channels;
     - the D-10 empty-value behaviour.
   - Rules:
     - no `any`, `@ts-ignore`, `@ts-expect-error` or `biome-ignore`;
     - semicolons;
     - **no new comments**;
     - no new export.
2. **Tests (red first, `test-on-bugfix`). New file `tests/main/metadata-write-field-errors.test.ts`.**
   - Set-up:
     - Copy the `getHandler` / `registerMetadataHandlers()` `beforeAll` pattern from `metadata-write-guard.test.ts`.
     - Work on copies of `tests/fixtures/sample.wav` in a per-run temp dir, and remove it in `afterAll`.
     - No spy and no mock of taglib: these are real files and the real library.
     - Raw bytes via `parseListInfoSubChunks` from `tests/main/riff-chunks.ts`.
     - `BAD = [...STANDARD_FIELDS, { key: 'bad', label: 'Bad', type: 'text', riffChunkId: 'AB' }]`.
   - Cases:
     - **(a)** `meta:write` with `BAD`, `{ category: 'DOORWood', bad: 'x' }`:
       - it rejects with exactly `Failed to write metadata: RIFF INFO fields could not be written: AB`;
       - the file bytes equal the bytes before the call (`Buffer.equals`). This also proves that the ICAT already set in memory did not reach the disk.
     - **(b)** Same schema, `{ category: 'DOORWood' }` (`bad` is `undefined`): it resolves, and raw `ICAT` is exactly `DOORWood`. This kills a guard that validates the schema instead of the attempted writes.
     - **(c)** `meta:write-batch`:
       - (c1) On two copies with `BAD`, `{ category: 'BATCHCat', bad: 'x' }`, the result is `{ succeeded: 0, failed: [{ path: first, error: 'RIFF INFO fields could not be written: AB' }, { path: second, error: same }] }`, and both files' bytes are unchanged.
       - (c2) On two fresh copies with `STANDARD_FIELDS` and the same meta minus `bad`, the result is `{ succeeded: 2, failed: [] }`, with raw `ICAT` = `BATCHCat` on both.
     - **(d)** Several bad fields: `[...STANDARD_FIELDS, { key: 'bad1', label: 'Bad 1', type: 'text', riffChunkId: 'AB' }, { key: 'bad2', label: 'Bad 2', type: 'tags', riffChunkId: 'ICAT5' }]` with `{ bad1: 'x', bad2: ['y'] }`:
       - it rejects with exactly `Failed to write metadata: RIFF INFO fields could not be written: AB, ICAT5`;
       - the bytes are unchanged.
       - This kills "throw at the first failure".
     - **(e)** Valid custom ID, regression: `[...STANDARD_FIELDS, { key: 'take', label: 'Take', type: 'text', riffChunkId: 'ITKN' }]` with `{ take: '3', category: 'X' }`: it resolves; raw `ITKN` = `3` (1 byte) and `ICAT` = `X`.
   - **Red proof:**
     1. Before editing `metadata.ts`, run `npx vitest run --config vitest.config.main.ts tests/main/metadata-write-field-errors.test.ts tests/main/metadata-write-guard.test.ts` on the untouched `28ad3ab` `metadata.ts`.
     2. Expected: (a), (c1) and (d) fail, because the call resolves or returns `succeeded: 2, failed: []`. (b), (c2), (e) and guard (a)–(d) pass.
     3. Save that run as `a-round-8/red-before-fix.log`, and the green run as `a-round-8/green-after-fix.log`.
3. **`docs/recording-tag-contract.md`, in Georgian with English technical terms.** Add one short section, for example `## ჩაწერის შეცდომები (all-or-nothing)`, that says:
   - A save is all-or-nothing. If any INFO field cannot be written, nothing is written to the file, including standard fields such as title.
   - The two messages are D-17 `RIFF INFO tag is not available; custom fields were not written` and D-18 `RIFF INFO fields could not be written: <IDs>`. In the single-file save they appear with the `Failed to write metadata: ` prefix.
   - A batch save lists such a file under failed and continues with the others.
   - A `riffChunkId` must be exactly 4 bytes. The Schema Editor enforces this, but a hand-edited `schema.json` does not. With such a field, every Metadata-panel save fails, because the panel sends every field. A batch save fails only if that field was changed.
   - On read, such a field shows its default value.
   - Do not change the rest of the document.

**Explicitly NOT in this round:**
- `riffChunkId` validation in `schema.ts` / `loadSchema` (B-R7-02).
- Custom fields without `riffChunkId` (B-R7-03).
- The `planTagWrite`/`applyTagWrite` refactor (RR-R7-05, a signal).
- Removing the title workaround (A-R7-01).
- TM-B11 (D-10, Saba), B-R6-01, TM-B05, TM-B08, TM-B06.
- Renderer changes (RR-R5-02).
- CI (TM-T0-CI-FU).
- Schema migration or duplicates (TM-T1-MIG/DUP).
- The `as unknown as TagObject` casts (RR-R2-04).
- Package installs.

Read first:
- `.claude/primitives/WAV_METADATA.md`, `ELECTRON_IPC.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`, `GEORGIAN_DOCS.md`;
- `.claude/rules/test-on-bugfix.md`;
- `tests/main/metadata-write-guard.test.ts` and `tests/main/riff-chunks.ts` (patterns);
- `b-round-7-exp-bad-chunkid.cjs` in the loop folder.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | D-18 in `writeTagsToFile`; remove the comment in `readTagsFromFile`'s catch |
| `tests/main/metadata-write-field-errors.test.ts` (new) | red-first tests (a)–(e) |
| `docs/recording-tag-contract.md` | Georgian section on all-or-nothing saves (RR-R7-01, D-17, D-18) |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Reports and logs go to `a-round-8/` in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R8-1 (red/green) | Read A's `red-before-fix.log`. In `/tmp/c-r8-red` (rsync + `node_modules` symlink, `git show 28ad3ab:src/main/ipc/metadata.ts`, plus the new test file), run `npx vitest run --config vitest.config.main.ts tests/main/metadata-write-field-errors.test.ts tests/main/metadata-write-guard.test.ts`. Then run the same command on the real tree. | **Red:** exactly (a), (c1) and (d) fail as described; (b), (c2), (e) and guard (a)–(d) pass. **Green:** all pass on the real tree. |
| R8-2 (mutations) | In `/tmp` copies of the fixed tree: **M1** restores the swallowing catch (no throw). **M2** throws after `file.save()`. **M3** rethrows inside the catch at the first failure, so only that ID is in the message. **M4** changes one character of the message. **M5** pre-validates every schema field with `riffChunkId` (4-byte check) before writing, regardless of whether its value is `undefined`. Run the new file plus `metadata-write-guard`, `riff-info-nul`, `metadata.test` and `recording-tag-contract`. | M1: (a), (c1), (d) fail. M2: (a), (c1) and (d) fail on bytes. M3: (d) fails. M4: (a), (c1), (d) fail. M5: (b) fails. Each mutation is killed and passes `tsc`. |
| R8-3 (gate) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Also run E2E with `--retries=0`. | Exit 0. Biome 0 errors, no new warnings in `metadata.ts` (compare against `28ad3ab`). Typecheck 0 errors (node/web/test). Renderer **107/107**. Main **55 + A's new count**, all green, with `metadata-write-guard` (a)–(d), `riff-info-nul` (a)–(i), `metadata.test.ts` and `recording-tag-contract.test.ts` (T1-1, T1-10) unchanged. E2E **7/7** with `--retries=0`. |
| R8-4 (real app: bad schema, single save, before + after) | Built app with `_electron` under `xvfb-run -a` (`--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder).<br>**Find the userData folder first**, for example with `electronApp.evaluate(({ app }) => app.getPath('userData'))` on a first launch. Do not assume the name: `productName` sits inside the electron-builder `build` block.<br>Write `schema.json` there: `STANDARD_FIELDS` exactly as in `src/shared/types.ts`, plus `{ "key": "bad", "label": "Bad", "type": "text", "riffChunkId": "AB" }`. Relaunch. The Bad field must appear in the panel.<br>On a fresh `sample.wav` copy, set Category `DOORWood` and Bad `x`, then Save.<br>Repeat the same steps on an app built from `28ad3ab` in a `/tmp` copy ("before"). | **After:**<br>• Error toast whose text **contains** `Failed to write metadata: RIFF INFO fields could not be written: AB` (Electron may prefix `Error invoking remote method 'meta:write': Error: `; record the full text).<br>• The file's sha256 is unchanged.<br>• The row stays untagged after Rescan.<br>**Before:**<br>• `Tags saved`.<br>• Raw INFO has `ICAT` = `DOORWood` and no `AB` sub-chunk. This is the silent loss; record the raw dump.<br>Screenshots `c-round-8/r8-4-*.png`. If the before build cannot be made, say so; the after part still counts. |
| R8-5 (real app: batch with bad schema) | Same after-session, same bad schema. (i) Multi-select two fresh copies (click, then Ctrl+click), change **only** Category to `BATCHCat`, Save. (ii) Select two other fresh copies, change Bad to `y` (and Category to `BATCHCat`), Save. | (i) `Tags saved to 2 files`, because the batch sends only modified fields, so `bad` is not attempted. Raw `ICAT` = `BATCHCat` on both; ffprobe and music-metadata agree.<br>(ii) Toast `0 saved, 2 failed`. Both files' sha256 are unchanged.<br>Screenshots `r8-5-*.png`. |
| R8-6 (real app: normal schema regression) | New session with a clean `XDG_CONFIG_HOME` (default schema). On a fresh copy, set Category `DOORWood`, Keywords `door, slam`, Comment `heavy door`, then Save and Rescan. | `Tags saved`. Raw INFO: `ICAT` 8, `IKEY` 10, `ICMT` 10 bytes, no byte 0. ffprobe shows `ICAT=DOORWood`, `IKEY=door, slam`, `comment=heavy door`, and music-metadata agrees. The row is `Tagged`. Screenshot `r8-6-*.png`. |
| R8-7 (frozen/ownership + docs) | `git status --porcelain --untracked-files=all`; `git diff --stat 28ad3ab`; `git diff --quiet 28ad3ab -- . ':!src/main/ipc/metadata.ts' ':!tests/main/metadata-write-field-errors.test.ts' ':!docs/recording-tag-contract.md'`. Read the `metadata.ts` and docs diffs. | Only the three owned paths changed or were added. The `metadata.ts` diff touches only the D-18 loop/throw and the read-catch comment line. `grep -n '//' src/main/ipc/metadata.ts` is empty. No `any`, `@ts-*`, `biome-ignore` or new comments. The docs diff only adds the Georgian section and states all five points from Scope 3. |

**Evidence rules:**
- ffprobe hides NULs, so every byte claim needs a raw INFO dump (`parseListInfoSubChunks` or an equivalent hex/size dump).
- music-metadata decodes non-Latin RIFF INFO text as mojibake, so the real-app values are ASCII.
- A file whose sha256 is unchanged needs no reader comparison: nothing was written.

## What could break (C re-checks)
- **D-17 guard:** `metadata-write-guard` (a)–(d) stay green unchanged. The D-17 throw must still come before the loop.
- **Normal WAV writes:** single and batch saves still write ICAT/IKEY/ICMT (R8-5 i, R8-6, recording-tag-contract tests).
- **T1-10 clearing path:** an empty value is still written as a size-0 sub-chunk (the existing test, R8-3). `setValuesFromStrings(id, [''])` must not count as a failure.
- **Read path:** removing the comment must not change behaviour. riff-info-nul (a)–(i) and `metadata.test.ts` stay green. The bad field reads as `''` in R8-4.
- **Error mapping:** the `meta:write` mapping stays byte-identical (R8-7 diff read).
- **Batch continues after a failing file** (c1, R8-5 ii).
- **Custom number field (TM-B11):** unchanged. `ITKN='0'` behaviour stays as it is.

## Next (orientation only)
1. Root links a `Check` Actions run on `7879ee0` or later (`a8c1b53`, `d52354d` and `28ad3ab` all qualify):
   - **green:** TM-T0-CI and TM-T0 close;
   - in either case, TM-T0-CI-FU (apt worst-case budget + Georgian docs note) is a small CI round.
2. Saba question batch:
   - D-07 (TM-T1-MIG);
   - D-10 plus TM-B11;
   - D-12/TM-B08 plus B-R6-01;
   - TM-T1-DUP (RR-R3-01), D-15 plus RR-R5-01;
   - D-16/D-17/D-18 (for information), RR-R1-07, RR-R3-05, TM-B06;
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
3. Low items without a decision: TM-T0-CI-FU, RR-R5-02 (renderer `typeof` guard). Signals: B-R7-02, B-R7-03, RR-R7-05 (plan/apply), A-R7-01.
