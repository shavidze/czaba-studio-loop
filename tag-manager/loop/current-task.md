# CURRENT TASK — Round 6: TM-B10 `meta:read` strips RIFF INFO NUL terminators (D-16) + RR-R2-01 `getRiffInfoTags` returns `[]`

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 5 (TM-B09 "Tagged" badge, D-15, plus the RR-R2-02 test) got **C PASS** on R5-1…R5-7 with realVerified=true. Root review gave COMMIT OK and root published `a8c1b53`. TM-B09, RR-R2-02 and C-R3-01 are closed.

C found that `meta:read` keeps the RIFF INFO NUL terminator (C-R5-02). Because of that, NUL-only values make a row Tagged (C-R5-01). B's experiments (`b-round-5-exp-nul-*.cjs` in the loop folder) show how far this reaches:
- node-taglib-sharp returns `comment` = `"heavy door\0"`, `title` = `"\0\0"`, `genres` = `["Foley\0"]` and `getValuesAsStrings('ICAT')` = `["DOORWood\0"]`.
- `Number("120\0")` is `NaN`, so `metadata.ts:131` reads a NUL-terminated custom number field as `0`.
- `MetadataPanel.tsx:76` saves the whole `editingMetadata`. Any save therefore writes `0` over that number. This is data loss; C confirms it in R6-4.
- A read-then-save writes the NUL back as data inside the sub-chunk size. ffprobe hides it.

RIFF INFO values are NUL-terminated by spec, so every recorder or ffmpeg file is affected. This is new item **TM-B10**, rated **medium**: C rated the finding low, and B raised it because of the data loss.

**RR-R2-01** (medium, root review R2) belongs to the same reader round in the same file. `getRiffInfoTags` throws on a non-`CombinedTag`, and on the write path that throw happens outside the per-field `try`. Root's suggested fix is `return []`. A real non-`CombinedTag` exists for the test: `Id3v2Tag.fromEmpty() instanceof CombinedTag === false` (B checked).

These two bugs fit one round. The open mediums that are not in it:
- RR-R1-01 waits for an Actions run.
- RR-R3-01 / TM-T1-DUP needs Saba.

No critical or high bug is open.

**D-16 (B, technical, reversible):**
- `meta:read` strips the trailing NUL run (`/\u0000+$/`) from every string value it returns. That covers:
  - the standard string props `title`, `album`, `comment`, `copyright`, `isrc` and `publisher`;
  - each element of the standard arrays `artists` and `genres`;
  - custom INFO values of type `text`, `tags` and `number`. For `number`, the strip happens before `Number()`.
- An array element that becomes `''` is **kept**. Arrays are not filtered, so length and the D-15/T1-10 empty handling stay as they are.
- Leading and interior NULs are not touched.
- The write path does not change. Clean reader values are written without NUL, and the T1-1 "no NUL" assertion remains the guard.

## Baseline
- HEAD `a8c1b53ed043560569dd528e2bc2e5190b63333a`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - every `src/**` file except `src/main/ipc/metadata.ts`. `src/renderer/src/lib/file-row-display.ts` stays frozen: C-R5-01 is fixed at the reader only, never in two layers;
  - `src/preload/**`, `src/shared/**`, `src/renderer/src/styles/app.css` (protected);
  - `package.json`, `package-lock.json`, all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.github/**` (including the protected `release.yml`);
  - `tests/fixtures/**`, `tests/main/riff-chunks.ts`, `tests/main/setup.ts`, `tests/main/global-setup.ts`;
  - every existing test file, especially `tests/main/metadata.test.ts` and `tests/main/recording-tag-contract.test.ts` (T1-1 "no NUL", T1-10 clear path);
  - `tests/renderer/**`, `tests/e2e/**`, `tests/contract/**`;
  - `.claude/**`, `docs/**`.

## Scope
1. **`src/main/ipc/metadata.ts`**
   - Add an internal (not exported) helper, for example `stripRiffNulTerminator(value: string): string`, that removes `/\u0000+$/`.
   - Apply it in `STANDARD_PROP_MAP` getters. For string props: `title`, `album`, `comment`, `copyright`, `isrc`, `publisher`. For array props, per element: `artists`, `genres`. Keep the existing `?? ''` / `[]` defaults.
   - Apply it in the `readTagsFromFile` INFO branch to every value from `getValuesAsStrings`, before the tags, number and text handling. For a number field the result is `Number(stripped) || 0`, as today. For a text field, it is the stripped values joined with `', '`.
   - `year`, `track`, `bpm` (taglib numbers) and the whole write path stay unchanged. B-R6-01 (IBPM/ITRK not mapped by taglib) is **not** this round.
   - `getRiffInfoTags`:
     - export it as a named export, keeping the same name;
     - return `[]` for a non-`CombinedTag` instead of throwing;
     - the `CombinedTag` path stays unchanged.

     On the write path, a `[]` result means custom fields are skipped and standard fields still reach `file.save()`. That is the existing code after the `infoTags.length > 0` check.
   - Rules:
     - no `any`, `@ts-ignore` or `@ts-expect-error`;
     - semicolons;
     - **no new comments**. Leave the two pre-existing `//` lines in the catch blocks as they are.
     - Follow `AGENT_DISCOVERABLE_CODE.md` naming. IPC channels, error mapping and handler signatures stay unchanged.
2. **Tests (red first, `test-on-bugfix`).** Create one new file, `tests/main/riff-info-nul.test.ts`.
   - Follow the `getHandler` pattern of `recording-tag-contract.test.ts`. You may import `parseListInfoSubChunks` read-only from `./riff-chunks`.
   - Build the test WAVs inline:
     1. copy `tests/fixtures/sample.wav`;
     2. append a `LIST`/`INFO` chunk with odd-size pad bytes;
     3. fix the RIFF size.

     B's `b-round-5-exp-nul-read.cjs` shows the byte layout.
   - The schema is `STANDARD_FIELDS` plus two custom fields:
     - `{ key: 'take', label: 'Take', type: 'number', riffChunkId: 'ITKN' }`;
     - `{ key: 'mics', label: 'Mics', type: 'tags', riffChunkId: 'IMIC' }`.
   - Cases:
     - (a) INFO `ICMT "heavy door\0"`, `ICAT "DOORWood\0"`, `IKEY "door, slam\0"` → `meta:read` gives `comment === 'heavy door'`, `category === 'DOORWood'` and `keywords === 'door, slam'`, with no `\u0000` in any returned string.
     - (b) INFO `INAM "\0\0"` → `title === ''`.
     - (c) INFO `IGNR "Foley\0"` → `genres` equals `['Foley']`.
     - (d) INFO `ITKN "120\0"` → `take === 120`. Before the fix this gives `0`.
     - (e) INFO `IMIC "MKH416\0"` → `mics` equals `['MKH416']`.
     - (f) Round trip, data loss. Use the (a)+(d) file with an extra non-schema `ISFT "Recorder 1.0\0"`:
       1. `meta:read`;
       2. set `title: 'X'` on the returned object;
       3. `meta:write` of the whole object with the same schema (this mirrors `MetadataPanel.tsx:76`);
       4. read the file's raw INFO with `parseListInfoSubChunks`.

       Expected: `ITKN` is exactly the bytes of `120`, `ICAT` is exactly `DOORWood` (8 bytes) and `ICMT` is exactly `heavy door`. None of the schema sub-chunks written in this test contains byte 0. `ISFT` is still present and its payload is byte-identical. If `ISFT` is already dropped on `a8c1b53`, report that as a finding with the evidence; do not work around it.
     - (g) A NUL-free value is unchanged: `ICMT "plain"` → `'plain'`. Interior NULs are kept: `ICMT "a\0b\0"` → `'a\0b'`.
     - (h) RR-R2-01:
       - `getRiffInfoTags(Id3v2Tag.fromEmpty())` returns `[]` and does not throw;
       - for the tag of a real WAV that has INFO (`File.createFromPath(...).tag`, disposed afterwards), it returns one `InfoTag`.
   - **Red proof:**
     1. Run the new file against `git show a8c1b53:src/main/ipc/metadata.ts` patched with the export only (`function getRiffInfoTags` → `export function getRiffInfoTags`, no behaviour change) in a `/tmp` copy. Do not edit the working tree for this.
     2. Expected red: (a)–(f) fail, and (h)'s first assertion fails with `TypeError: File tag is not a CombinedTag`. (g) may pass.
     3. Save that run as `a-round-6/red-before-fix.log`, and the green run as `a-round-6/green-after-fix.log`.

**Explicitly NOT in this round:**
- Any renderer change, including RR-R5-02, the `typeof` guard in `file-row-display.ts`.
- The write path or the D-10 empty-value policy.
- TM-B05, TM-B08 and B-R6-01 (IBPM/ITRK).
- The remaining `as unknown as TagObject` casts (RR-R2-04).
- CI changes (TM-T0-CI-FU, RR-R1-01/03).
- Schema migration or duplicates (TM-T1-MIG/DUP).
- Biome on `tests/` (TM-B06).
- Package installs.

Read first:
- `.claude/primitives/WAV_METADATA.md`, `ELECTRON_IPC.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`;
- `.claude/rules/test-on-bugfix.md`;
- `tests/main/recording-tag-contract.test.ts` and `tests/main/riff-chunks.ts` (patterns);
- `b-round-5-exp-nul-read.cjs`, `b-round-5-exp-nul-writeback.cjs` and `b-round-5-exp-nul-number.cjs` in the loop folder.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | D-16 NUL strip in the reader; `getRiffInfoTags` exported and returns `[]` (RR-R2-01) |
| `tests/main/riff-info-nul.test.ts` (new) | red-first tests (a)–(h) |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Reports and logs go to `a-round-6/` in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R6-1 (red/green) | Read A's `red-before-fix.log`. Set up `/tmp/c-r6-red` (rsync + `node_modules` symlink) with `git show a8c1b53:src/main/ipc/metadata.ts` patched with the export only, keeping the new test, and run `npx vitest run --config vitest.config.main.ts tests/main/riff-info-nul.test.ts`. Then run it on the real tree. | **Red:** (a)–(f) fail, with (d) reading `0` and (f) finding byte 0 or `ITKN` = `0`. (h) fails with the `CombinedTag` TypeError. **Green:** every case passes on the real tree. |
| R6-2 (mutations) | In `/tmp` copies of the fixed tree: **M1** makes the strip helper return its input unchanged. **M2** strips only one trailing NUL (`/\u0000$/`). **M3** restores the `throw` in `getRiffInfoTags`. **M4** strips with `/\u0000/g` (all NULs). | M1: (a)–(f) fail. M2: (b) fails (`'\0'` remains). M3: (h) fails. M4: the interior-NUL part of (g) fails. Each proves a test checks real behaviour. |
| R6-3 (gate) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Also run E2E with `--retries=0`. | Exit 0. Biome 0 errors and no new warnings in `metadata.ts` (compare against `a8c1b53`). Typecheck 0 errors (node/web/test). Renderer **107/107**. Main **42 + A's new count**, all green: T1-1 "no NUL", T1-10 clear path and `metadata.test.ts` unchanged and green. E2E **7/7** with `--retries=0`. |
| R6-4 (real app: NUL files) | Built app with `_electron` under `xvfb-run -a` (`--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder). One folder holds four files: `nul-comment.wav` and `nul-title.wav` (C's R5 `probe-nul.mjs` layout), `comment-only.wav` (`ffmpeg -i tests/fixtures/sample.wav -metadata comment='მძიმე კარი' -c copy`), and `nul-take.wav` (sample + INFO `ITKN "120\0"`, `ICAT "DOORWood\0"`). In the Schema editor add the custom field **Take**, type Number, RIFF ID `ITKN`. | **nul-comment / nul-title:** no `Tagged` badge (`c-round-6/r6-4-nul-untagged.png`); ffprobe shows `comment:""` / `title:""`. **comment-only:** the Comment input value is exactly `მძიმე კარი`. Check with `input.value` and confirm no char code 0 (`r6-4-comment-clean.png`). **nul-take:** Take shows `120`, Category `DOORWood`. Set Title `X`, Save, Rescan. The raw INFO dump shows `ITKN` payload `120` (3 bytes), `ICAT` 8 bytes, `INAM` `X`, no byte 0 in those payloads. ffprobe shows `ITKN=120`, `ICAT=DOORWood`, `title=X`, and `music-metadata` agrees (`r6-4-take-saved.png`). **Before, required:** the same `nul-take.wav` steps on the `a8c1b53` build (the R6-1 `/tmp` tree with the original `metadata.ts` restored, then `npm run build`) show Take `0`, and after the save the raw `ITKN` payload is `0`. This confirms the data-loss claim. If the old build does **not** lose the value, report it; TM-B10 severity is then re-rated. |
| R6-5 (real app: ffmpeg file save) | In the same session, on `comment-only.wav`: set Title `Y`, Save, Rescan. | Raw `ICMT` size **28** (it was 29 with the NUL before the save), no byte 0 inside it, and ffprobe `comment` is still `მძიმე კარი`. `ISFT` is present with an unchanged payload, or, if it was dropped, a before/after comparison against the `a8c1b53` build shows the drop is pre-existing (then it is a finding, not a FAIL). The row shows `Tagged`. Screenshot `r6-5-*.png`. |
| R6-6 (real app regression) | Same session: (i) on a fresh copy of `sample.wav`, set only Category `DOORWood` through the editor and save. (ii) On another fresh copy, set Category `x`, save, clear it, save again (the T1-10 path), then rescan. | (i) The raw INFO shows `ICAT` = `DOORWood` (8 bytes, no NUL); ffprobe `ICAT=DOORWood`; the row is `Tagged`. (ii) After the second save `ICAT` has size 0, and the row shows **no** `Tagged` badge. |
| R6-7 (frozen/ownership) | `git status --porcelain --untracked-files=all`; `git diff --stat a8c1b53`; `git diff --quiet a8c1b53 -- . ':!src/main/ipc/metadata.ts' ':!tests/main/riff-info-nul.test.ts'`. Read the `metadata.ts` diff. | Only the two owned paths changed or were added. The diff covers only the strip helper and its call sites, the `getRiffInfoTags` export and `return []`. The write path, IPC handlers and error mapping are unchanged. No `any`, `@ts-*`, `biome-ignore` or new comments. |

**R6-4 order:** add the **Take** field in the Schema editor (manual RIFF ID `ITKN`; `SchemaEditor.tsx:95-104` accepts four uppercase letters or digits that are not reserved) **before** you open or rescan the folder. `meta:read` uses the schema at read time. If the editor stores a different ID, read it from `schema.json` in `XDG_CONFIG_HOME` and build `nul-take.wav` with that ID; record this in the report.

**B experiment facts (for A and C):**
- Interior NULs survive the library read: `ICMT "a\0b\0"` gives `tag.comment` = `"a\u0000b\u0000"`, and `getValuesAsStrings` gives the same for a custom ID (`b-round-5-exp-nul-interior.cjs`). So (g) and M4 can tell the cases apart.
- The scripts take the repository path as their argument and write to `/tmp/b-r6/`, so run `mkdir -p /tmp/b-r6` first.
- `b-round-5-exp-nul-writeback.cjs` reads `/tmp/b-r6/nul.wav`, so run `-nul-read.cjs` before it.

**Evidence rule:** ffprobe hides NULs, so ffprobe alone never proves the NUL is gone. Every NUL claim needs raw INFO bytes, from `parseListInfoSubChunks` or an equivalent hex/size dump.

## What could break (C re-checks)
- **T1-10 clearing path:** an empty value must still be written as a size-0 sub-chunk, and an old value must disappear (R6-3, R6-6 ii).
- **"Tagged" badge:** files with real values must stay Tagged (R6-5, R6-6 i). Only NUL-only values change (R6-4).
- **Files saved once already** carry an `id3 ` chunk and `LIST/MID`, so `tag.title`/`comment` may come from ID3 rather than INFO. The strip must not change the values those files show (R6-5 rescan).
- **Batch read** (`meta:readBatch`) uses the same `readTagsFromFile`, so the file list and the panel agree (R6-4 badge vs panel).
- **IPC error mapping** (`Corrupt`, `EBUSY`/`EACCES`) and `corrupt.wav` → empty metadata stay unchanged (existing `metadata.test.ts`, R6-3).
- **Custom fields without INFO in the file** keep their defaults (`0` / `[]` / `''`).

## Next (orientation only)
1. Root reports the first `Check` Actions run on `7879ee0`, `a8c1b53` or later:
   - **green:** TM-T0-CI and TM-T0 close, and TM-T0-CI-FU becomes a small CI round;
   - **red or slow:** its timings set that round's scope.
2. Saba question batch:
   - D-07 (TM-T1-MIG), D-10, D-12/TM-B08 plus B-R6-01 (IBPM/ITRK);
   - TM-T1-DUP (RR-R3-01), D-15 plus RR-R5-01 (docs note);
   - D-16 (for information), RR-R1-07, RR-R3-05, TM-B06 (`package.json`);
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
3. Low items that need no decision: RR-R5-02 (`typeof` guard) and RR-R5-06 (shared `isEmptyFieldValue`, a signal) can form a later renderer round.
