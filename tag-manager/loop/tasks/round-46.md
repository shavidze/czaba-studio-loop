# CURRENT TASK — Round 46: TM-B11 stage 2 (Saba Q4 / D-10 → D-50) — an unset number field is not written, a typed `0` is

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 45: C PASS** (R45-1..R45-7, `realVerified=true`, bugs 0). Renderer 320/320, main 109/109, E2E 7/7 (`--retries=0` 7/7).
  - Real app: an emptied Keywords field is removed in raw INFO, ffprobe and music-metadata. Untouched empty fields are no longer written.
  - Root published **c822d7f**. D-49 is verified, and TM-B11 stage 1 is done.
- No critical or high bug is open. Root's one medium finding, RR-R45-01, is an FYI for the importer owner and does not block this round.
- **TM-B11 stays `in_progress`** until stage 2 (this round) has C real-app evidence.
- **Saba Q4 (2026-10-28):** "Skip empty text and unset numbers; a meaningful `0` stays expressible."
- **The bug (C-R6-01).** With a custom Number field in the schema (e.g. Take/ITKN), every single-file save writes `ITKN='0'` into files that never had it. The chain (B code read at c822d7f):
  1. `metadata.ts` `readTagsFromFile` reads an absent custom number as `0` (`getDefaultValue('number')` = 0).
  2. The single save sends the whole `editingMetadata` snapshot.
  3. `writeTagsToFile` writes `String(0)`.
  - Because absent and typed `0` are the same value, the editor cannot tell them apart. `MetadataPanel.tsx:345` also shows `0` as empty, and an empty input sends `0` (`:347`).
- **RR-R5-03:** the badge counts a number only when `> 0`, so a meaningful `0` looks untagged.
- **B probe** (`/tmp/b46`, node-taglib-sharp from the repo, script `b-round-45-exp-number-probe.cjs.txt`):
  - A bare ffmpeg WAV reads `year`/`track`/`beatsPerMinute` as `0`. After `year=2024, track=3` and then `year=0, track=0`, the values read `0` again and `ICRD` is gone.
    - So for **standard** numbers the library has no "0" state: setting 0 removes the item.
  - `InfoTag.setValuesFromStrings('ITKN', ['0'])` is stored, and ffprobe shows `"ITKN": "0"`. An absent ID reads as `[]`.

## Reference
- **Mp3tag** (community forum, no official doc found; not verified in a current version):
  - "Mp3tag will never write an empty field": a field set to an empty string is removed. https://community.mp3tag.de/t/15332 , https://community.mp3tag.de/t/remove-track-number-from-all-mp3-files/13440
  - Its tag panel shows an empty placeholder for a field the file does not hold. Track `0` seen in other players comes from ID3v1, which always stores a track byte. https://community.mp3tag.de/t/zero-numerical-values-and-cant-copy-any-different-information-into-tag-see-image/62921 , https://bitbucket.org/ijabz/jaudiotagger/issues/142/id3v11tag-cant-have-empty-track-number
- **Kid3:** B found no handbook page on this. A maintainer mail says the Remove action removes a frame, rather than blanking it (https://mail.kde.org/pipermail/kde-mac/2023-July/008846.html). The ID3 dev list concludes that an empty frame should be removed (https://lists.id3.org/pipermail/id3v2/2007-February/000420.html).
- **Confirmed vs inferred:**
  - Confirmed (sources above, forum level): empty = removed, and absent = empty field in the editor.
  - Inferred: a typed `0` is a value that the editor shows and writes. No source says an editor hides `0`.
- **Deviations (with reasons):**
  1. Standard Year/Track #/BPM cannot hold `0`. A typed `0` disappears after the re-read, because node-taglib-sharp's setter removes the item at 0 (B probe). This is library behaviour, an FYI for Saba and not a FAIL. Custom number fields keep `0`.
  2. The number Input keeps its placeholder `'0'` (single) / `'Multiple values'` (batch). An empty field therefore shows a dimmed `0` placeholder, while a real `0` shows as a normal value. Placeholder wording is a UX question for Saba and not part of this fix. C screenshots both states so Saba can judge.
  3. Files that older builds polluted with `ITKN='0'` now read as `0`, a real value, and show Tagged. The file cannot tell a typed 0 from the old default, so there is no migration.

## Baseline
- HEAD `c822d7f1a60a03741c5c1052f19e934d39a85d08`, clean working tree (`git status --porcelain --untracked-files=all` empty).
  - Exception (release-commit rule): a root `chore(release): vX.Y.Z` commit directly on c822d7f that changes only the two `version` fields counts as the baseline.
  - If HEAD differs or the tree is dirty, **stop and report**.
- **Frozen:** every path not in the ownership table stays byte-identical to c822d7f. That explicitly includes:
  - `src/shared/types.ts`: `''` is already a `FieldValue`, so no type change is needed;
  - `src/main/ipc/schema.ts`, `file-system.ts`, `channels.ts`, `src/preload/**`;
  - `src/renderer/src/stores/**`, `FileList.tsx`, `SchemaEditor.tsx`, `TagsInput.tsx`, `src/renderer/src/components/ui/**`;
  - every test file not listed below, including `tests/main/riff-chunks.ts`, `riff-info-nul.test.ts`, `metadata.test.ts`, `metadata-write-guard.test.ts`, `metadata-write-field-errors.test.ts`, `recording-tag-contract.test.ts`, `tests/contract/**`, `tests/e2e/**`, `tests/renderer/stores/**`, `tests/renderer/helpers/**`, `tests/renderer/setup.ts`, `tests/fixtures/create-fixtures.ts`.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-50)

### A1. `src/main/ipc/metadata.ts`
The unset marker for a number field is `''`.

**Read path:**
- `getDefaultValue('number')` returns `''`. This also changes `emptyMetadata`, so a failed read returns `''` for numbers.
- **Custom `riffChunkId` number fields:** take the first value after `stripRiffNulTerminator`.
  - If it is absent, blank after `trim()`, or `Number(v)` is not finite → `''`.
  - Otherwise → `Number(v)`, so `'0'` reads `0` and `'-2'` reads `-2`.
- **Standard `year`/`track`/`bpm` getters:** if the library value is `undefined`, `0` or not finite → `''`. Otherwise the number.

**Write path, `writeTagsToFile`:** extend the D-49 normalisation to `type === 'number'`.
- These values count as **empty**:
  - `''`;
  - a string whose `trim()` is `''`;
  - a non-finite number (`NaN`, `±Infinity`).
- Empty standard field → its setter gets `0` (the library removes the item).
- Empty `riffChunkId` field → `infoTag.removeValue(id)`. The same `customFields` / `isEmpty` / `failedIds` / workaround rules apply as in D-49.
- A **finite number, `0` and negatives included**, is written exactly as today: standard setter with the value, INFO `String(value)`.
- Any other string for a number field is written as today (`String(value)`).
- No new exports. Helpers stay module-private, named per `AGENT_DISCOVERABLE_CODE.md`. A may extend `normalizeFieldValueForWrite` / `isEmptyFieldValueForWrite` instead.
- Text/tags behaviour (D-49) is unchanged.

### A2. `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`: the number `Input` block only (`field.type === 'number'`, about lines 338-351)
- **Displayed value:** `String(v)` when `v` is a finite number, `0` included. Otherwise `''`.
- **onChange:**
  - `e.target.value === ''` → `updateField(key, '')`;
  - otherwise `n = Number(e.target.value)`: if `Number.isFinite(n)`, send `n`, else send `''`.
- Placeholder is unchanged (Deviation 2). Nothing else in the file changes.

### A3. `src/renderer/src/lib/file-row-display.ts`: `isNonEmptyFieldValue` only
- A number counts as tagged when `Number.isFinite(value)`, so `0` and negatives count. `NaN`/`Infinity` do not.
- This amends D-15 for numbers.
- String/array rules are unchanged, and `''` stays empty.

### A4. `src/renderer/src/components/templates/TemplatePicker.tsx`: `handleSaveAsTemplate` filter only (line 130)
- Drop the `val !== 0` condition, so a typed `0` is saved into the template.
- `undefined`, `''` and `[]` are still skipped.
- Nothing else changes: apply, the edit dialog and `dialogStateToTags` already handle numbers.

### Unaffected (B checked, no change)
- **`file-store.ts` sort:** `''` is a string, so number vs `''` compares as text (`''` first), the same as missing metadata today (RR-R18-02, R18 (c) "bpm vs missing" uses `undefined`).
- **`FileList.tsx:100`:** BPM column `meta?.bpm ? meta.bpm : ''`. `''` renders empty. bpm is standard and can never read `0` now.
- **`isSameFieldValue` / `collectFieldsTypedDuringSave`:** `''` vs `0` compare as different, which is correct.

### A5. Tests, red first (record red/green logs in `a-round-46/`)
**Main, new file `tests/main/metadata-number-values.test.ts`** (double quotes like the neighbouring main tests; `riff-chunks.ts` helpers read-only):
- Custom schema: `STANDARD_FIELDS + { key: 'take', label: 'Take', type: 'number', riffChunkId: 'ITKN' }`.
- **(n1)** A sample WAV without ITKN reads `take === ''`. Bare-WAV `year`, `bpm` and `track` read `''`.
- **(n2) C-R6-01:** read the whole object of a WAV without ITKN, set `title: 'X'`, write it back → no ITKN sub-chunk, INAM=`X`.
- **(n3)** Write `{ take: 7 }` then `{ take: '' }` → ITKN absent, and the bytes `7` are not in an ITKN payload. Write `{ take: '  ' }` on a file with ITKN → absent.
- **(n4)** Write `{ take: 0 }` → ITKN payload `'0'` (size 1). Read returns `0` (number, `toBe(0)`). Write `{ take: -2 }` → `'-2'`, reads `-2`.
- **(n5)** A planted ITKN payload `'abc'` reads `''`. A planted `'0\0'` reads `0`.
  - `riff-chunks.ts` has no INFO writer: `writeSampleWavWithInfo` is local to the frozen `riff-info-nul.test.ts`. A copies it, or writes an equivalent, into the new file (also usable for seeding (n3)/(n7)). The frozen file stays untouched.
- **(n6)** `{ year: 2024 }` then `{ year: '' }` → ICRD absent, reads `''`. `{ year: 0 }` on a file with ICRD → ICRD absent (library limit, Deviation 1), reads `''`.
- **(n7)** Batch: `meta:write-batch` with `{ take: '' }` on 2 files that both have ITKN and other INFO → both lose ITKN, other payloads unchanged, `{ succeeded: 2, failed: [] }`.
- **(n8)** `{ take: Number.NaN }` on a file with ITKN → ITKN absent.
- **(n9)** `meta:read` on a corrupt file (`emptyMetadata`) returns `''` for every number field of the schema.

**Main, `tests/main/metadata-empty-values.test.ts`: retitle (e6) only.**
- New title: `"(e6) a typed number 0 is written (D-50)"`. The body stays byte-identical, because an explicit `{ take: 0 }` must still write `'0'` (Saba Q4).
- Every other line of the file stays byte-identical. This is a retitle, **not** a flip.

**Renderer, new file `tests/renderer/components/number-field-values.test.ts`** (use `tests/renderer/helpers/*` read-only; render `MetadataPanel` the way `metadata-panel-batch-save.test.ts` does; schema store = `STANDARD_FIELDS + Take/ITKN`):
- **(r1)** Single file with `take: ''`: the Take input value is `''`. Typing `0` → `editingMetadata.take === 0` **and the input value is `'0'`** (on c822d7f it shows `''`, so this is the red), and Save calls `writeMetadata` with `take: 0`.
- **(r2)** Single file with `take: 0`: the Take input value is `'0'`. Clearing it → `editingMetadata.take === ''`, and Save sends `take: ''`.
- **(r3)** Single file with `take: ''`: change only Title and Save → `writeMetadata` gets `take: ''`, not `0`. This is the renderer half of C-R6-01.
- Helpers: `setup.ts` already mocks `loadTemplates`/`saveTemplate`. `typeInto`, `startSingleSave` and `selectPaths` are local to `metadata-panel-batch-save.test.ts`, so A copies what it needs into the new file. No change to `tests/renderer/helpers/**` or `setup.ts`.
- **(r4)** Template: `take: 0` typed, Save as template → `window.api.saveTemplate` receives `tags.take === 0`. A field left `''` is not in `tags`.

**Renderer, owned flips (exact lines; round-44 rule):**
- **`tests/renderer/utils/file-row-display.test.ts`:**
  - move `["zero", 0]` and `["negative number", -1]` from `emptyValues` to `nonEmptyValues`;
  - in the two `hasAnyTagValue({... bpm: 0 ...})` cases and the `(c) ... empty defaults returns false` JSON case, change `bpm: 0` / `"bpm":0` to `bpm: ""` / `"bpm":""`;
  - add one case: `{ title: "", take: 0 }` → true;
  - nothing else changes.
- **`tests/renderer/components/file-list.test.ts` line 22 only:** `createDefaultMetadata` number default `0` → `""` (mirrors main's new `emptyMetadata`). Otherwise every row would turn Tagged under A3.
- **`tests/renderer/components/metadata-panel-batch-save.test.ts` line 44** and **`tests/renderer/components/busy-buttons-focus.test.ts` line 45 only:** `if (type === "number") return 0;` → `return "";` (mirrors main, C-R13-01).

**Stop rule:** if any other existing test fails after A1–A4, **stop and report** its name. Do not edit it.

**Red proof:**
- On c822d7f `src/` (temp copy outside the repo, `node_modules` symlinked):
  - must fail: (n1), (n2), (n3), (n5 `'abc'`), (n6 first half), (n8), (n9), (r1), (r2), (r3), (r4), and the flipped file-row-display cases;
  - must pass on both: (e6) retitled, (n4) and (n5 `'0\0'`).
  - (n6) second half, (n7) and (r3) are expected red (old reads/sends `0`); A records what it observes and does not weaken an assertion to make it red.
- A lists the observed pass/fail of every case.

### A6. Docs (Georgian, English technical terms)
- **`docs/recording-tag-contract.md`, the empty-value section:**
  - replace the "რიცხვები: stage 2 ჯერ არ გაკეთებულა" bullet with D-50:
    - an unset number is not written, and clearing removes it;
    - a typed `0` is written as `'0'` and the importer must treat it as a real 0;
    - standard Year/Track/BPM cannot hold 0;
    - older builds may have left `ITKN='0'`;
  - header decision list + D-50;
  - `## შემოწმება`: add `metadata-number-values.test.ts` and fix the (e6) wording.
- **`.claude/primitives/WAV_METADATA.md`:** one short Georgian rule next to the D-49 rule: number unset = `''`, `0` is written, D-50. Use the Edit tool (standing `.claude/**` permission).
- **`.claude/primitives/STATE_MANAGEMENT.md`:** one line stating that number fields use `''` for unset in `editingMetadata` (D-50).

### Not in this round
- RR-R45-02 (workaround pin/cleanup), RR-R45-04, C-R45-01 (shape validation), RR-R45-05 (refactor).
- Placeholder wording (Deviation 2). The batch-clear UX (Q21).
- TM-B05, TM-B08, TM-B06.

**Process:**
- Repository writes go through Edit/Write only.
- Read `WAV_METADATA.md`, `STATE_MANAGEMENT.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before the first edit.
- More than 3 files change, so run the `code-reviewer` subagent (read-only) and record its findings in `a-round-46.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/main/ipc/metadata.ts` | A1: D-50 read + write |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | A2: number Input block only |
| `src/renderer/src/lib/file-row-display.ts` | A3: number rule in `isNonEmptyFieldValue` |
| `src/renderer/src/components/templates/TemplatePicker.tsx` | A4: line 130 filter only |
| `tests/main/metadata-number-values.test.ts` (new) | A5: (n1)–(n9) |
| `tests/main/metadata-empty-values.test.ts` | A5: (e6) title only |
| `tests/renderer/components/number-field-values.test.ts` (new) | A5: (r1)–(r4) |
| `tests/renderer/utils/file-row-display.test.ts` | A5: listed flips + one case |
| `tests/renderer/components/file-list.test.ts` | A5: line 22 only |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | A5: line 44 only |
| `tests/renderer/components/busy-buttons-focus.test.ts` | A5: line 45 only |
| `docs/recording-tag-contract.md` | A6 |
| `.claude/primitives/WAV_METADATA.md` | A6: one rule |
| `.claude/primitives/STATE_MANAGEMENT.md` | A6: one line |

**B's grep** for tests that feed the changed flow (`tests/` searched for `bpm`, `year`, `track`, `ITKN`, `ICRD`, `"number"`, `return 0`, `bpm: 0`, `toBe(0)`, `typeInto("BPM"`, `meta:write`):
- `metadata.test.ts` (year 2024 / bpm 120), `riff-info-nul.test.ts` (d)/(f)/(i) (ITKN 120, ICRD 2024) and `metadata-write-field-errors.test.ts` (ITKN as **text**) write or read non-zero values → unchanged.
- `metadata-panel-batch-save.test.ts` (y7) types `128` → unchanged.
- `file-list.test.ts` bpm 1–4 / 120 → unchanged.
- `file-store.test.ts` (c) → unchanged (`undefined`, not `''`).
- `metadata-empty-values.test.ts` (e5) sends `bpm/year/track: 0` to standard setters → still no ICRD/IBPM/ITRK → unchanged.
- No e2e or contract test touches numbers.

A writes only `a-round-46.md` (and `a-round-46/` logs) in the loop folder. C writes `c-round-46.md`/`.json` and evidence under `c-round-46/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R46-1 ownership | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `git diff --stat c822d7f`; `git diff --quiet c822d7f -- <frozen/protected paths>`; per-file diff of every "only" file | HEAD c822d7f (or the release exception). Changed paths ⊆ ownership table. Each "only" file differs exactly in its stated lines. Frozen and protected paths are byte-identical. |
| R46-2 red/green + mutants | Temp copy outside the repo (`node_modules` symlinked) with c822d7f `src/` + A's tests; then A's tree. Mutants: **M1** read default stays `0`; **M2** renderer onChange sends `0` for an empty input; **M3** badge back to `> 0`; **M4** write path writes number `''` as `String('')` instead of removing; **M5** standard getter keeps `0` instead of `''` | Red/green as A5 lists (C records each case). Every mutant is killed by at least one named test, or C names the survivor and why. Logs go in `c-round-46/`. |
| R46-3 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` + `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer 320 + A's new count, main 109 + A's new count, all passing. E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |
| R46-4 real app: unset custom number not written (C-R6-01) | Built app via Playwright `_electron`, `xvfb-run`, temp `XDG_CONFIG_HOME`. Customize Fields → add a Number field "Take" (auto ID) → Done. A fresh ffmpeg WAV without that ID: set only Title `R46`, Save Tags. | Toast `Tags saved`. The custom ID is absent in raw INFO, `ffprobe -show_entries format_tags -of json` and `music-metadata` (`exif:`). INAM=`R46` in all three. No size-0 sub-chunk. Take input shows empty (screenshot). Contrast on a c822d7f build: the custom ID appears with `'0'`. |
| R46-5 real app: typed 0 is written and shown | Same schema. A fresh WAV: type `0` into Take only, Save. | All three readers show the custom ID = `0` (raw payload `'0'`, size 1). After selecting another file and coming back, the Take input shows `0`, not empty, and the row shows **Tagged**. Screenshots of the empty-with-placeholder and the `0` states (Deviation 2). |
| R46-6 real app: clear a number | Single: a WAV with Take `7` (seeded with the app); clear Take, Save. Batch: 2 WAVs with Take `7` and different ICAT; select both; the batch form starts empty (C-R45-02), so type `1` into Take and press Backspace; `Save to 2 files`. | Single: the ID is absent in all three readers, ICAT and the other fields unchanged. Batch: toast `Tags saved to 2 files`; both files lose the ID and keep their own ICAT. Unselected files are byte-identical (sha256). `pageErrors` is empty. |
| R46-7 real app: standard number limit (FYI, not a FAIL) | Type Year `2024` → Save → clear → Save. Then type Year `0` → Save. | Year `2024` appears in raw ICRD and in ffprobe, and is removed after clearing. Year `0` writes nothing and the input shows empty after the re-read (Deviation 1). C records it; it is not a FAIL. |
| R46-8 docs | Read the owned docs diff | `recording-tag-contract.md` states D-50, typed 0 = real 0, the standard limit, old `ITKN='0'`, and the new test file. `WAV_METADATA.md` and `STATE_MANAGEMENT.md` have the D-50 lines. Georgian with English technical terms. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **D-49 text/tags behaviour:** all round-45 tests stay green unchanged except the (e6) title.
- **Non-zero number round trips:** year 2024, bpm 120 and ITKN 120 with NUL (`riff-info-nul` (d)/(f)/(i)).
- **D-18 error path** for number fields with a bad ID: the same message.
- **Dirty-state logic:** `''` vs `0` in `isSameFieldValue`; typing during a save (y7); the single-save snapshot.
- **Badge** for files with only text values (unchanged). File list BPM column and sort by BPM (unchanged).
- **Templates:** applying an existing template with numbers is unchanged.

## Next (orientation only, Saba's order)
1. **Q5 → TM-B05:** per-file error "audio data is empty, cannot tag", with a test.
2. **Q3 → TM-B08:** docs/test pin (D-12, artists outside K-4).
3. **Q6 → TM-B06:** Biome over `tests/**`, relaxed override.
4. **Q7 → TM-T2-DATA → TM-T2:** waiting on Saba.
5. **Open for Saba (non-blocking):**
   - Q9–Q20;
   - Q21: batch clearing needs type-then-delete, C-R45-02;
   - FYI RR-R45-01: an empty `LIST/INFO` may exist; tell the importer owner;
   - FYI D-50 Deviations 1–3.
