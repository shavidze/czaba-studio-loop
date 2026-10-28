# CURRENT TASK — Round 45: TM-B11 stage 1 (Saba Q4 / D-10 → D-49) — an empty text or tags value removes its RIFF INFO sub-chunk instead of writing a size-0 one

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 44: C PASS** (R44-1..R44-5, `realVerified=true`, bugs 0). Renderer 320/320, main 98/98, E2E 7/7 (`--retries=0` 7/7). The real app refreshes Size/Date and three independent readers confirm the tags. Root published **d886bef** (rounds 43–44). TM-B44 / D-48 are done.
- No critical or high bug is open. Next in Saba's order: **Q4 → TM-B11 / D-10**.
- **Saba Q4 (2026-10-28):** "empty values are not written. Skip empty text and unset numbers; a meaningful `0` stays expressible."
- **Staging, not shrinking.** TM-B11 has two stages. TM-B11 stays `in_progress` until both have C real-app evidence.
  - **Stage 1 (this round): text and tags fields.** Fixes C-R1-01 (`IKEY=""`), RR-R3-03 (`ICAT=""` on every editor save), C-R27-02 (`RNOT=''`) and B-R42-02 (T1-10 flip + K-4 docs).
  - **Stage 2 (round 46): number fields.** C-R6-01 (`ITKN='0'`) and RR-R5-03.
    - Numbers need a renderer-visible "unset vs 0" marker. Today an empty input sends `0`, `0` displays as empty, and an absent sub-chunk reads as `0`. That change touches `src/shared/types.ts`, the read path and the renderer, so it is its own stage.
- **Where the bug is (B code read of `src/main/ipc/metadata.ts` at d886bef):**
  - Fields in `STANDARD_PROP_MAP` (title, comment, album, copyright, isrc, publisher, artists, genres, numbers) go through node-taglib-sharp setters. Those already **remove** the item for `''` / `[]` (`infoTag.js:43` `set title(value) { this.setValuesFromStrings("INAM", value ? [value] : undefined); }`; `riffList.js:199` deletes on an empty array).
  - `keywords` (IKEY), `category` (ICAT) and every custom field take the `riffChunkId` loop instead: `setValuesFromStrings(id, [String(value)])`. For `''` that stores a **size-0 sub-chunk**.
- **B's probe** (scratch dir `/tmp/b45`, node-taglib-sharp from the repo's `node_modules`, ffmpeg WAVs, not the repository):
  - `InfoTag.removeValue('IKEY')` after a write removes the sub-chunk; the bytes are gone from the file.
  - Bare WAV (no LIST), today's path with `IKEY=''` → `LIST/INFO` size **12** (one 8-byte IKEY header, size 0).
  - Same bare WAV saved with only empty standard values → `LIST/INFO` size **4** (list type only). node-taglib-sharp always renders an INFO list on save. This is pre-existing, the same class as C-R1-01's extra `id3 `/`LIST/MID`/`IDVX`/`JUNK`, and **not** in scope.
- **Rules:**
  - `test-on-bugfix`: a failing test first. The flipped T1-10a/b and the new tests are red on d886bef `src/`.
  - Reference-first: **exempt** (bug fix of a behaviour Saba decided).
    - In-repo evidence: node-taglib-sharp's own setters already remove an emptied item, and D-49 makes the INFO path consistent with them.
    - For the record: Mp3tag and Kid3 also remove a field that is emptied. That is B's general knowledge, not checked this round, so it is not cited as a source.

## Baseline
- HEAD `d886bef086628cd2b6a8efed3a7a98eeb8454480`, clean working tree (`git status --porcelain --untracked-files=all` empty).
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on d886bef that changes only the two `version` fields counts as the baseline.
  - If HEAD differs or the tree is dirty, **stop and report**.
- **Frozen:** every path not in the ownership table stays byte-identical to d886bef. That explicitly includes:
  - `src/shared/types.ts`, `src/main/ipc/schema.ts`, `src/main/ipc/file-system.ts`, `src/main/ipc/channels.ts`;
  - all of `src/renderer/**` and `src/preload/**`;
  - `tests/main/riff-chunks.ts`, `tests/main/metadata.test.ts`, `tests/main/riff-info-nul.test.ts`, `tests/main/metadata-write-guard.test.ts`, `tests/main/metadata-write-field-errors.test.ts`;
  - `tests/contract/**`, `tests/e2e/**`, `tests/renderer/**`, `tests/fixtures/create-fixtures.ts`.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.

## Scope

### A1. `src/main/ipc/metadata.ts` → `writeTagsToFile` only (D-49)
Read paths, `emptyMetadata`, `getDefaultValue` and the IPC handlers stay unchanged.

**1. Normalise each schema field's value before choosing the standard path or the INFO path:**
- `field.type === 'text'` and the value is a string whose `trim()` is `''` → empty.
- `field.type === 'tags'` and the value is an array → drop items that are not strings or whose `trim()` is `''`. If nothing remains → empty. Remaining items are written **exactly as given** (untrimmed, same order).
- Non-blank text is written exactly as given (untrimmed). Number fields are **unchanged** this round.

**2. Standard-map fields:** an empty text value is passed to its setter as `''`, an empty tags value as `[]`. The library then removes the item.
- Effect: whitespace-only `title`/`comment` and blank artist/genre items are no longer written.
- Non-empty values behave exactly as today.

**3. `riffChunkId` fields** (keywords, category, custom text/tags):
- An empty value calls `infoTags[0].removeValue(riffChunkId)`.
  - `removeValue(id: string): void` is in `node_modules/node-taglib-sharp/dist/riff/riffListTag.d.ts:52`; A confirms this before use.
- A non-empty value calls `setValuesFromStrings` as today.
- The D-18 per-ID error collection still applies: a `removeValue` that throws (e.g. an invalid ID such as `AB`) is added to `failedIds` and produces the same `RIFF INFO fields could not be written: …` error. Existing `metadata-write-field-errors.test.ts` must stay green unchanged.

**4. INFO-creation workaround:** `tag.title = tag.title ?? ''` and the following `RIFF INFO tag is not available` error run **only when at least one non-empty `riffChunkId` value is to be written**.
- If every `riffChunkId` value is empty and the file has no InfoTag, nothing is removed and no error is thrown.
- If an InfoTag exists, the empty IDs are removed from it.

**5. Constraints:**
- No new exports unless a helper is needed. If one is, name it per `AGENT_DISCOVERABLE_CODE.md` (e.g. `isEmptyFieldValueForWrite`) and keep it module-private unless a test needs it.
- No comments in code (project rule), semicolons, no `any`, no `as unknown as` beyond the existing `TagObject` cast.

### A2. Tests, red first (record red/green logs in `a-round-45/`)
**`tests/main/recording-tag-contract.test.ts`: flip T1-10a and T1-10b only** (titles and assertions). Every other test in the file stays byte-identical.
- **T1-10a** "(D-10/D-49): empty keywords and category leave no sub-chunk":
  - writing `{ keywords: '', category: '' }` → `info.has('IKEY') === false`, `info.has('ICAT') === false`;
  - `meta:read` returns `''` for both.
- **T1-10b** "(D-10/D-49): writing an empty category removes the previous value":
  - after `DOORWood` then `''` → `info.has('ICAT') === false`;
  - the bytes `DOORWood` are not in the file;
  - read returns `''`.

**New file `tests/main/metadata-empty-values.test.ts`** (main env; use the `riff-chunks.ts` helpers read-only; double quotes like the neighbouring main tests). Cases:
- **(e1)** Clearing one of several INFO fields: the file has `ICAT=DOORWood`, `IKEY=door, slam`, `ICMT=x`. Write `{ keywords: '' }` → IKEY absent; ICAT and ICMT payloads byte-identical to before.
- **(e2)** Whitespace-only is empty:
  - `{ category: '   ' }` on a file with ICAT → ICAT absent;
  - `{ title: '  ' }` on a file with INAM → INAM absent.
- **(e3)** Custom text field (schema = STANDARD_FIELDS + `{ key: 'note', type: 'text', riffChunkId: 'RNOT' }`): writing `note: ''` on a file without RNOT → no RNOT (C-R27-02); writing `'n1'` then `''` → RNOT absent.
- **(e4)** Custom tags field (`{ key: 'mics', type: 'tags', riffChunkId: 'IMIC' }`):
  - `['', '  ']` → IMIC absent;
  - `['MKH416', '', ' KM184']` → two IMIC values `MKH416` and ` KM184` (leading space kept, order kept);
  - read returns `['MKH416', ' KM184']`.
- **(e5)** Bare WAV with no LIST chunk (build it in the test from `fmt `+`data`, non-empty data), full single-save object with every text/tags field empty:
  - write succeeds (no `RIFF INFO tag is not available` error);
  - no INFO sub-chunk with a schema ID exists;
  - the `data` chunk sha256 is unchanged.
  - Pin what LIST/INFO is: B's probe shows size 4. If A sees otherwise, A records the observed value and does not weaken the "no schema sub-chunk" assertion.
- **(e6)** Number fields unchanged (stage 2 guard): custom `{ key: 'take', type: 'number', riffChunkId: 'ITKN' }` with `0` still writes ITKN `'0'` (size 1). Title it `(e6) stage-1 guard: number 0 still written (TM-B11 stage 2 changes this)` so round 46 knows to flip it.
- **(e7)** Batch: `meta:write-batch` with `{ keywords: '' }` on 2 files that both have IKEY → both lose IKEY; their other INFO payloads are unchanged; `{ succeeded: 2, failed: [] }`.
- **(e8)** The D-18 error path holds for removal: schema with custom `{ key: 'bad', type: 'text', riffChunkId: 'AB' }` and value `''` → rejects with the existing `RIFF INFO fields could not be written: AB` message.
  - If node-taglib-sharp's `removeValue` does not throw for `AB`, A records the fact. Then, instead of forcing the error, A pins that the write succeeds and no `AB` chunk exists, and lists it in `a-round-45.md` as a fact for B.

**Red proof:** T1-10a/b and at least (e1), (e2), (e3), (e4 first half), (e5) or (e7) fail on d886bef `src/main/ipc/metadata.ts` (run in a temp copy outside the repo with `node_modules` symlinked, or before the src edit). (e6) passes on both. Logs go in `a-round-45/`.

### A3. Docs (Georgian, English technical terms)
- **`docs/recording-tag-contract.md`, section `## ცარიელი მნიშვნელობა (D-10, ღიაა)`:**
  - retitle to D-10/D-49, decided;
  - an empty text value (also whitespace-only) or an empty tags list **removes** the sub-chunk; no size-0 sub-chunk is written;
  - clearing a value removes the old bytes;
  - numbers: stage 2 (TM-B11) is pending, and today a custom number `0` is still written as `'0'`;
  - the importer rule is unchanged (absent or empty payload = no value);
  - remove the "Saba must decide" sentence;
  - update header line 5's decision list to include D-49, and the `## შემოწმება` test list with `metadata-empty-values.test.ts`.
- **`.claude/primitives/WAV_METADATA.md`:** one short Georgian rule under `### STANDARD_PROP_MAP vs riffChunkId`: an empty value is not written; an INFO-path empty value uses `removeValue`; D-49. Use the Edit tool (standing `.claude/**` permission).

### Not in this round
- Number fields (stage 2, round 46). Read path. Renderer.
- TM-B05, TM-B08, TM-B06. RR-R44-01..03, A-R43-01 (signals).
- The extra `id3 `/`LIST/MID`/`IDVX`/`JUNK` chunks and the empty `LIST/INFO` that node-taglib-sharp renders (C-R1-01's second half, library behaviour).

**Process:**
- Repository writes go through Edit/Write only (rule from round 18).
- Read `WAV_METADATA.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before the first edit.
- 3+ files change, so run the `code-reviewer` subagent (read-only) and record its findings in `a-round-45.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | A1: D-49 in `writeTagsToFile` |
| `tests/main/recording-tag-contract.test.ts` | A2: T1-10a and T1-10b only |
| `tests/main/metadata-empty-values.test.ts` (new) | A2: (e1)–(e8) |
| `docs/recording-tag-contract.md` | A3: D-10/D-49 section, header, test list |
| `.claude/primitives/WAV_METADATA.md` | A3: one rule |

**B's grep for tests that feed the changed flow** (rule from round 44: `tests/` searched for `IKEY`, `ICAT`, `RNOT`, `ITKN`, `length).toBe(0)`, `toHaveLength(0)`, `D-10`, `meta:write`, `writeMetadata`):
- Only T1-10a/b pin a size-0 write. They are owned above.
- These write **non-empty** values or check other things, so they stay green unchanged:
  - `riff-info-nul.test.ts` (f): whole-object resave, all asserted IDs non-empty;
  - `metadata-write-guard.test.ts`, `metadata-write-field-errors.test.ts`, `metadata.test.ts`;
  - `recording-tag-contract.test.ts` T1-1..T1-9;
  - `tests/contract/check-ffprobe-tags.ts`;
  - `tests/e2e/recording-tag-contract.spec.ts`, `tests/e2e/folder-workflow.spec.ts`.
- Renderer suites mock `window.api` and do not reach `metadata.ts`.
- If any of these fails after A1, **stop and report** its name. Do not edit it.

A writes only `a-round-45.md` (and `a-round-45/` logs) in the loop folder. C writes `c-round-45.md`/`.json` and evidence under `c-round-45/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R45-1 ownership | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `git diff --stat d886bef`; `git diff --quiet d886bef -- <every frozen/protected path above>` | HEAD d886bef (or the release exception). Changed paths ⊆ the five owned paths. In `recording-tag-contract.test.ts` only the T1-10a/b blocks differ. Frozen and protected paths are byte-identical. |
| R45-2 red/green | Temp copy outside the repo (`node_modules` symlinked) with d886bef `src/main/ipc/metadata.ts` + A's tests; then A's tree | On d886bef `src/`: T1-10a, T1-10b and the A2-listed new cases fail; (e6) passes. On A's tree: all pass. C also runs 2–3 mutants and records which test kills each: (M1) remove the trim (`''` check only); (M2) write `['']` again instead of `removeValue`; (M3) always run the INFO workaround. Logs go in `c-round-45/`. |
| R45-3 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` + `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer 320/320. Main 98 + A's new count, all passing. E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |
| R45-4 real app: clear a value | Built app via Playwright `_electron` under `xvfb-run`, temp `XDG_CONFIG_HOME`. A WAV with `ICAT=DOORWood`, `IKEY=door, slam`, `ICMT=მძიმე კარი` (seed it with the app itself or a raw INFO writer; ffmpeg's RIFF writer does not emit ICAT/IKEY). Select it, clear Keywords in the editor, Save Tags. | Toast `Tags saved`. In all three readers (raw INFO parse, `ffprobe -show_entries format_tags -of json`, `music-metadata` with `exif:` namespace): **no IKEY key**, and ICAT=`DOORWood` and ICMT=`მძიმე კარი` unchanged. The editor shows Keywords empty after the re-read. Screenshots before and after. |
| R45-5 real app: untouched empties | A fresh ffmpeg WAV **without** IKEY/ICAT. Select it, set only Title `R45`, Save Tags. Then add a custom Text field in Customize Fields (e.g. Note → auto ID), leave it empty, change Title to `R45b` (the form must be dirty for Save to be enabled), Save again. | No `IKEY`, `ICAT` or custom-ID key in raw INFO, ffprobe and music-metadata. No size-0 sub-chunk for any schema ID in the raw parse. INAM=`R45` after the first save and `R45b` after the second, in all three. Before this round both IKEY and ICAT appeared as `""` (C R44-4(a)); C may show it on a d886bef build for contrast. |
| R45-6 real app: batch clear | 3 WAVs with `IKEY=door, slam` and different ICATs (seeded with the app or a raw INFO writer). Select all 3, clear Keywords, `Save to 3 files`. | Toast `Tags saved to 3 files`. In all three readers, each file has no IKEY and keeps its own ICAT. Unselected files are byte-identical (sha256 before/after). `pageErrors` is empty. |
| R45-7 docs | Read the owned docs diff | `recording-tag-contract.md` states D-10/D-49 as decided, describes removal and the number-stage note, keeps the importer rule, and lists the new test file. `WAV_METADATA.md` has the D-49 rule. Georgian with English technical terms. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **Non-empty writes:** T1-1 exact sizes, odd-size padding (T1-1b), UTF-8 ICMT, NUL-free payloads (`riff-info-nul` (f)), ISFT and other non-schema INFO items kept, `data`/`bext`/`iXML` sha256 unchanged (T1 contract tests). All green unchanged.
- **Standard fields:** title/comment/artists/genres still written when non-empty; the R45-5 INAM check covers this in the real app.
- **D-18 per-ID error message** (e8 + `metadata-write-field-errors.test.ts`).
- **The INFO workaround still creates INFO** when a non-empty custom value meets a file without INFO (`metadata-write-guard.test.ts` (d)).
- **Batch writes only `modifiedFields`:** clearing one field in batch must not remove other fields (R45-6 ICAT kept).
- **Renderer "Tagged" badge (D-15):** unchanged. An emptied field reads `''` as before.

## Next (orientation only, Saba's order)
1. **TM-B11 stage 2 (round 46): number fields.**
   - An absent custom number must read as a distinct unset marker (candidate: `''`, already in `FieldValue`). Otherwise every single-file save resends `0` and C-R6-01 reproduces.
   - The number input must distinguish empty from `0`. The write path skips unset and keeps a typed `0`.
   - Ripple: `file-row-display` (D-15), sort (RR-R18-02), TemplatePicker, batch common values.
   - Standard year/track/bpm cannot store `0` in node-taglib-sharp (`setValueFromUint(0)` removes the item). That is a deviation to report to Saba as an FYI, not a blocker.
   - The D-ID is chosen at round 46 planning; (e6) flips then.
2. **Q5 → TM-B05:** per-file error "audio data is empty, cannot tag", with a test.
3. **Q3 → TM-B08:** docs/test pin (D-12).
4. **Q6 → TM-B06:** Biome over `tests/**`, relaxed override.
5. **Q7 → TM-T2-DATA → TM-T2:** waiting on Saba.
6. **Open for Saba:** Q9–Q17, Q18 (B-R42-01), Q19 (RR-R42-03), Q20 (whitespace-only = empty in D-49 is B's interpretation of Q4; non-blocking).
