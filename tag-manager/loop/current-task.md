# CURRENT TASK — Round 48: TM-B08 (Saba Q3, D-12) — pin today's Artists encoding with a test and docs; no source change

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 47: C PASS** (R47-1..R47-7, `realVerified=true`, bugs 0). Renderer 326/326, main 128/128, E2E 7/7 (`--retries=0` 7/7).
  - Real app: an empty-audio WAV now fails its save with `…Failed to write metadata: Audio data is empty, cannot tag` and is not changed. Batch shows `1 saved, 1 failed` and writes the other file. A normal save is unchanged.
  - Root published **ede35de**. D-51 is verified. **TM-B05 is done** (write half). Its read half stays open as Saba **Q22** and is pinned by (a7).
- No critical or high bug is open. Root's round-47 findings are low/info signals (RR-R47-01..04) and are not scheduled.
- **Next in Saba's order: Q3 → TM-B08 (low).**
  - Saba Q3 (2026-10-28): "artists are **not** in the K-4 import contract. The contract is `ICAT`/`IKEY`/`ICMT` only; artists stay as written today."
  - The backlog keeps TM-B08 open only for this small pin/doc round. **No writer change.**
  - The doc already says artists are outside K-4 (`docs/recording-tag-contract.md` `## რა არ შედის კონტრაქტში (D-12)`). What is missing is a test that pins how artists are written today, so a later change is deliberate. The doc also does not yet record what happens to an `IART` written by another program.
- **B probe** (node-taglib-sharp 6.0.1 from the repo at ede35de; scripts saved in the loop folder as `b-round-47-exp-artists-probe.cjs.txt`, `b-round-47-exp-iart-probe.cjs.txt`, `b-round-47-exp-artists-mm.mjs.txt`). Start state → action → result:

  | Start file | Action (`tag.performers = …`, save; this is what `STANDARD_PROP_MAP.artists.set` does) | Raw `LIST/INFO` after | ffprobe `format_tags` | music-metadata |
  |---|---|---|---|---|
  | ffmpeg sine WAV (INFO has only `ISFT`) | `['A','B']` | `ISTR 'A'`, `ISTR 'B'` in that order; **no `IART`** | `artist: 'A'`, `ISTR: 'B'` | `common.artists ['A','B']`; native ID3v2.4 `TPE1` ×2, exif `ISTR` ×2 |
  | same | `['Solo']` | one `ISTR 'Solo'` | `artist: 'Solo'`, `ISTR: 'Solo'` | `['Solo']` |
  | same | `['A','B','C']` | `ISTR` ×3 in order | `artist: 'A'`, `ISTR: 'C'` | `['A','B','C']` |
  | `ffmpeg -metadata artist=Rec -metadata title=T` (writes `IART 'Rec'`) | read only | — | `artist: 'Rec'` | — ; library: `performers []`, `albumArtists ['Rec\0']` |
  | same | `['New']` | `IART 'Rec'` **kept**, `ISTR 'New'` added | `artist: 'Rec'`, `album_artist: 'Rec'`, `ISTR: 'New'` | — ; library reads `performers ['New']` |

  - Every save also writes an `id3 ` chunk (pre-existing, C-R1-01). ffprobe's `artist` follows `IART` when it exists, else the first ID3 `TPE1`.
  - **Confirmed facts:** the rows above. **Inference:** recorder and DAW files that carry `IART` show an empty Artists field in Tag Manager, and after the user saves Artists, other tools still show the old artist. This is a new finding (**B-R47-01**) and goes to Saba as **Q25**. Round 48 pins today's behaviour and does **not** change it ("artists stay as written today").
- **Reference:** exempt. This is a test-and-docs round with no UX or behaviour change. Q25 is phrased as a question; B does not claim how other editors map `IART`.

## Deviations / limits (stated, not hidden)
1. **The pins fix behaviour Saba may still change (Q25).** Cases (b6)/(b7) pin "pre-existing `IART` is not read and is kept". If Saba answers Q25 with "map Artists to `IART`", those cases flip on purpose in that round. Their test names say `pinned until Q25`.
2. **No red proof.** Nothing in `src/` changes, so every new case is green on ede35de. The proof that the pins bite comes from C's mutants (R48-2).
3. **ID3 is not pinned in the unit test.** Parsing the `id3 ` chunk would need a new parser or a reader in the main test. C checks ID3 through music-metadata in the real app (R48-4).
4. **B-R47-02 is not fixed.** SchemaEditor reserves `IART` but not `ISTR`. Which ID to reserve depends on Q25. Signal only.

## Baseline
- HEAD `ede35de5e5ef06521cede8eef43a92417527c131`, clean working tree (`git status --porcelain --untracked-files=all` empty).
  - Exception (release-commit rule): a root `chore(release): vX.Y.Z` commit directly on ede35de that changes only the two `version` fields counts as the baseline.
  - If HEAD differs or the tree is dirty, **stop and report**.
- **Frozen:** every path not in the ownership table stays byte-identical to ede35de. That explicitly includes:
  - **all of `src/**`** (no source change in this round: `src/main/**`, `src/shared/**`, `src/preload/**`, `src/renderer/**`);
  - every existing test file, including `tests/main/metadata.test.ts`, `metadata-empty-values.test.ts`, `metadata-number-values.test.ts`, `metadata-empty-audio.test.ts`, `metadata-write-guard.test.ts`, `metadata-write-field-errors.test.ts`, `recording-tag-contract.test.ts` (artists are outside the contract), `riff-chunks.ts`, `riff-info-nul.test.ts`, and `tests/contract/**`, `tests/e2e/**`, `tests/renderer/**`, `tests/fixtures/**`;
  - `docs/plans/**`, `docs/bugs/**`, every other doc and `.claude/**` file except the one owned primitive.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-12 pin)

### A1. New file `tests/main/metadata-artists.test.ts`
- Double quotes, like the neighbouring main tests. No comments; semicolons; no `any`.
- Register handlers with `registerMetadataHandlers()` and call them through `ipcMain._handlers`, as `metadata-empty-values.test.ts` does. Use `STANDARD_FIELDS` as the schema.
- Build WAVs in a `mkdtemp`/`tmpdir()` folder:
  - plain WAV: `createSineWavBuffer(4410)` from `tests/fixtures/create-fixtures.ts` (import only);
  - `IART` WAV: the sine buffer plus an in-test `LIST/INFO` chunk holding `INAM` = `"T\0"` and `IART` = `"Rec\0"` (even-padded), inserted **after `fmt ` and before `data`** (the order of the ffmpeg files B measured), RIFF size fixed. Write the builder in the new file. Never write into `tests/fixtures/`.
  - B's probe measured the `IART` case on an ffmpeg-built file, not on this exact builder shape. A's green-on-baseline run is the first run of this shape; if the library treats it differently, that is a stop-and-report, not a test edit.
- Raw INFO must be read **in order with duplicates**. `parseListInfoSubChunks` returns a `Map` and drops repeats, so write an ordered `listInfoSubChunkEntries(wav): { id, value }[]` helper in the new file (as in `metadata-empty-values.test.ts`; do not import from that frozen file). `riff-chunks.ts` may be imported read-only.
- **NUL rule for every assertion:** the helper decodes each value as UTF-8 and removes trailing `\0` bytes. Every raw-INFO expectation below (`"A"`, `"Rec"`, `"New"`, …) compares those stripped values.
- Writes send only `{ artists: [...] }` unless the case says otherwise.

Cases:
- **(b1)** plain WAV, `meta:write` `{ artists: ["A", "B"] }` → raw INFO has `ISTR` entries exactly `["A", "B"]` in that order; **no `IART`** entry; `meta:read` returns `artists` `["A", "B"]`.
- **(b2)** plain WAV, `["Solo"]` → exactly one `ISTR` `"Solo"`, no `IART`; read back `["Solo"]`.
- **(b3)** plain WAV, `["A", "B", "C"]` → `ISTR` `["A", "B", "C"]` in order; read back the same.
- **(b4)** after (b1)'s save on the same file, `meta:write` `{ artists: [] }` → no `ISTR` and no `IART` entry left; read back `[]` (D-49 neighbour).
- **(b5)** `meta:write` `{ title: "Only title" }` on a fresh plain WAV → no `ISTR`/`IART` entry (artists not sent → not written).
- **(b6) pinned until Q25:** `IART` WAV, `meta:read` → `artists` `[]` and `title` `"T"`.
- **(b7) pinned until Q25:** `IART` WAV, `meta:write` `{ artists: ["New"] }` → raw INFO still has exactly one `IART` with value `"Rec"` and gains `ISTR` `["New"]`; `meta:read` returns `artists` `["New"]`; `data` chunk sha256 unchanged (`sha256OfRiffChunk`).

**Green on baseline** (Deviation 2): A runs the new file on ede35de and records each case as passing in `a-round-48/`. If any case fails on the unchanged tree, **stop and report** the observed bytes. Do not adapt the expectation to make it pass without reporting, and do not touch `src/`.

**Stop rule:** if any existing test fails, **stop and report** its name. Do not edit it.

### A2. Docs (Georgian, English technical terms)
- **`docs/recording-tag-contract.md`**, section `## რა არ შედის კონტრაქტში (D-12)`. Add:
  - Saba Q3 (2026-10-28) decided it: artists are outside K-4 and are written as today;
  - the measured encoding: one `ISTR` sub-chunk per value in order, no `IART`, plus ID3 `TPE1` per value; ffprobe shows `artist` = first value and `ISTR` = last value; music-metadata `common.artists` shows all of them;
  - an `IART` written by another program (recorder, DAW, `ffmpeg -metadata artist=`) is not shown in Artists and is kept on save, so ffprobe's `artist` keeps the old value. This is pinned until Q25 (B-R47-01).
  - In `## შემოწმება`, add `tests/main/metadata-artists.test.ts`.
  - Line 5 header: the D-list already has D-12. Add the new test file next to `recording-tag-contract.test.ts` only if the header lists tests; otherwise leave line 5 alone.
- **`.claude/primitives/WAV_METADATA.md`:** one short Georgian line under the STANDARD_PROP_MAP table: `artists` (`tag.performers`) is written as `ISTR` per value; the `IART` in `STANDARD_FIELDS` is informational and reserved; the library maps `IART` to `tag.albumArtists`, which the app does not read (D-12, Q25). Use the **Edit tool** (standing `.claude/**` permission).

### Not in this round
- Any change to `src/**` (Q25, B-R47-01, B-R47-02, B-R6-01).
- Q22, Q23, Q24, Q26, C-R47-01.
- RR-R47-01..04, A-R47-02.
- TM-B06 (next round).

**Process (C-R46-01):**
- Every repository write goes through the **Edit/Write tools only**. No `sed -i`, no shell redirection, no `tee`, no script that writes into the repository.
- A states in `a-round-48.md` that no Bash command wrote into the repository.
- Before the first edit, read `TESTING.md`, `WAV_METADATA.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md`.
- 3 files change, so run the `code-reviewer` subagent (read-only) and record its findings in `a-round-48.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/main/metadata-artists.test.ts` (new) | A1: (b1)–(b7) |
| `docs/recording-tag-contract.md` | A2: D-12 section, `## შემოწმება` line |
| `.claude/primitives/WAV_METADATA.md` | A2: one line |

**B's grep** of tests that touch artists (searched `tests/` for `artists`, `ISTR`, `IART`, `performers`): `metadata.test.ts:58-67` (roundtrip `["Artist A","Artist B"]`), `metadata-empty-values.test.ts:181` ((e5) full empty save), renderer `file-list`, `file-row-display`, `file-store`, `template-store` tests (display/sort only). None changes.

In the loop folder, A writes only `a-round-48.md` (plus `a-round-48/` logs). C writes `c-round-48.md`/`.json` and evidence under `c-round-48/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R48-1 ownership | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `git diff --stat ede35de`; `git diff --quiet ede35de -- src tests/fixtures tests/e2e tests/renderer tests/contract docs/plans docs/bugs package.json package-lock.json .github .claude/settings.json .claude/hooks`; existing `tests/main/*` byte-identical | HEAD is ede35de (or the release exception). Changed paths ⊆ ownership table. **`src/` unchanged.** Frozen/protected paths unchanged. |
| R48-2 pins bite (mutants) | Temp copy outside the repo (`node_modules` symlinked) with A's tree. First run the new file unchanged (all green), then one mutant at a time in `src/main/ipc/metadata.ts` `STANDARD_PROP_MAP.artists`: **M1** setter writes `tag.albumArtists` instead of `tag.performers` (lands in `IART`); **M2** setter writes `[val.join('; ')]` (one sub-chunk); **M3** getter returns only the first performer; **M4** getter falls back to `tag.albumArtists` when performers is empty (a Q25-style change); **M5** setter skips an empty list (`if (val.length)`) | All 7 cases green on A's tree. ede35de `src/` is the same source (nothing in `src/` changes), so a baseline run proves nothing new; **the mutants are the only discriminating evidence.** M1 killed by (b1)/(b2); M2 by (b1)/(b3); M3 by (b1)/(b3)/(b7); M4 by (b6); M5 by (b4). C records each mutant's failing case names; logs in `c-round-48/`. Any surviving mutant is a FAIL unless C shows it is equivalent. |
| R48-3 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer 326/326 (unchanged); main 128 + A's new count, all passing. E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |
| R48-4 real app: two artists on a fresh WAV | Built app via Playwright `_electron`, `xvfb-run`, temp `XDG_CONFIG_HOME`. Folder: `tone.wav` (ffmpeg sine), `rec.wav` (`ffmpeg -metadata artist=Rec -metadata title=T`), `other.wav`. Select `tone.wav`, add Artists `A` and `B` in the tags input, Save Tags | Toast `Tags saved`. Raw INFO: `ISTR 'A'`, `ISTR 'B'` in order, no `IART`. `ffprobe -show_entries format_tags -of json`: `artist` = `A`, `ISTR` = `B`. music-metadata `common.artists` = `['A','B']`. Reselect shows both chips. Artist column shows `A`. Screenshot. `pageErrors` empty. `other.wav` byte-identical. |
| R48-5 real app: file with another tool's `IART` | Select `rec.wav`. Screenshot the panel. Add Artists `New`, Save Tags | Before save the Artists field is empty and Title shows `T` (pinned until Q25). After save: raw INFO `IART 'Rec'` still present and `ISTR 'New'` added; ffprobe `artist` = `Rec`, `ISTR` = `New`; music-metadata reported as observed (C writes down `common.artists` and native `IART`/`ISTR`/`TPE1`). Reselect shows `New`. `data` chunk sha256 unchanged. This is evidence for Q25, not a FAIL. |
| R48-6 docs | Read the owned docs diff | `recording-tag-contract.md` D-12 section has every point A2 lists and `## შემოწმება` names the new file. `WAV_METADATA.md` has the one line. Georgian with English technical terms. Every fact in the docs matches B's probe table or C's R48-4/R48-5 measurements. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- Nothing in `src/` changes, so app behaviour must be identical to ede35de. The gate's existing tests stay green unchanged.
- The artists roundtrip in `metadata.test.ts` and (e5) in `metadata-empty-values.test.ts`.
- D-49 empty-list write and D-50 numbers: no `IBPM`/`ICRD`/`ITRK` appear on the R48-4 save.
- Artist column display and sort (renderer tests, unchanged).

## Next (orientation only, Saba's order)
1. **Q6 → TM-B06:** Biome over `tests/**` with a relaxed override, as its own round.
2. **Q7 → TM-T2-DATA → TM-T2:** waiting on Saba.
3. **Open for Saba (non-blocking):** Q9–Q24; new **Q25** (Artists ↔ `IART`, B-R47-01, with B-R6-01 and B-R47-02), **Q26** (truncated `data` grows on save, A-R47-01/C-R47-02), C-R47-01 (multi-select `Multiple values` on equal empties, UX group).
