# Active loop summary (2026-10-26T18:32:46.272Z)

- backlog.json 78 KB -> active view 37 KB
- status: G_ROOT_GATE round 9
- servers: `{"servers":"none or skipped"}`
- last publication: 499a6f3c8867ed7e9356371df9e83713b652265a (rounds 9-9)
- last root gate: round 9 published - commit 499a6f3c8867ed7e9356371df9e83713b652265a pushed

## Current items: TM-T0, TM-T0-CI, TM-T1, TM-T1-DUP, TM-B08, TM-T2, TM-T2-DATA, TM-B05, TM-B06, TM-T0-CI-FU, TM-B11, TM-B13

## Open findings
- B-R0-03 / low / open / node-taglib-sharp empty data chunk boundary bug (TM-B05)
- C-R1-01 / low / open / Empty Keywords written as IKEY=""; save also adds id3, LIST/MID, IDVX, JUNK chunks and moves data to the end (audio bytes identical). Contra
- C-R1-03 / low / open / .claude/primitives/TESTING.md:129 stale (fixtures now created by globalSetup); .claude/** frozen, needs a round that owns it
- RR-R1-01 / medium / in_progress / check.yml: separate Build step + playwright test differs from the npm run test:e2e path (naming or merge)
- RR-R1-03 / low / open / check.yml actions pinned to @v4 tags, not SHAs
- RR-R1-04 / low / open / create-fixtures.ts CLI guard regex matches only create-fixtures.ts (argv[1]); suggest create-fixtures\.[cm]?[jt]s$
- RR-R1-05 / low / open / create-fixtures.ts temp file ${filePath}.${pid}.tmp leaks if writeFileSync throws; not gitignored
- RR-R1-07 / info / open / Architecture signal: after a green check.yml run make it a required status check and add needs: check to release.yml (release.yml frozen; ne
- C-R2-01 / low / open / Artists written as repeated ISTR while the schema says IART; ffprobe artist shows only the first (pre-existing) -> TM-B08, D-12
- RR-R2-03 / low / open / skipLibCheck:true also skips the project's own src/preload/index.d.ts; consider dropping it from tsconfig.test.json once dependency types ar
- RR-R2-04 / info / open / Architecture signal: remaining file.tag as unknown as TagObject casts (metadata.ts:113,158); a RiffTags-typed accessor resolved once per fil
- A-R3-01 / low / open / tests/renderer/setup.ts (frozen) replaces window with a plain object; schema-editor.test.ts works around it locally with vi.hoisted
- RR-R3-01 / medium / open / Old custom field key 'category' (auto ID CATE) + standard toggle -> two fields same key, one value in CATE and ICAT, duplicate React keys (S
- RR-R3-03 / info / open / Every editor-panel save writes empty ICAT (D-10 pinned on purpose)
- RR-R3-04 / low / open / New test files use double quotes vs src single quotes; Biome does not check tests/
- RR-R3-05 / info / open / npx --yes tsx@4 downloads a floating major at runtime (verifyCommand + check.yml); consider a pinned devDependency
- RR-R3-06 / info / open / Architecture: schema.json has no version/migration; a versioned schema with one-time merge in loadSchema() would solve D-07 and TM-T1-DUP to
- C-R4-01 / low / in_progress / apt-install.sh worst case ~750 s (2 x (240+10) + dpkg recovery 240+10) > step timeout-minutes 10 (600 s); GitHub kills the step before the f
- RR-R4-02 / low / in_progress / Same as C-R4-01 (step budget < worst case)
- RR-R4-03 / low / open / check-ffprobe-tags.ts missing-file hint hard-codes 'during npm run check'; a follow-up could print the exact vitest command
- RR-R4-04 / info / open / tests/main/check-ffprobe-tags.test.ts second test only checks a constant + existsSync (low value; acceptable as a guard against a renamed pr
- RR-R4-05 / low / in_progress / apt-install.sh and its env knobs APT_ATTEMPT_TIMEOUT_SECONDS / APT_ATTEMPTS are not documented in docs/ (Georgian)
- RR-R4-06 / info / open / Architecture signal: move the ffprobe cross-check into recording-tag-contract.test.ts (skip when ffprobe is missing) or into a dedicated npm
- RR-R5-01 / low / open / Badge now counts every field (year/track/ISRC-only file shows Tagged); fits D-15, add a docs/ note
- RR-R5-02 / low / open / file-row-display.ts:11 item.trim() assumes string elements; a null in an array would crash the row render (typeof guard suggested)
- RR-R5-03 / info / open / number field counts as tagged only when > 0; a future custom number field where 0/negative is meaningful would look empty
- RR-R5-04 / low / open / file-list.test.ts getFileRow walks exactly two parents from the file name; brittle to row markup (data-testid/role=row would need a componen
- RR-R5-05 / info / open / Tests use double quotes vs single quotes in src; Biome passes because tests/ is not linted
- RR-R5-06 / info / open / Architecture signal: three different 'is this value empty' rules (file-row-display isNonEmptyFieldValue, TemplatePicker.tsx:130 val !== '' &
- B-R6-01 / low / open / bpm and track read 0 from an INFO-only WAV with and without NUL (IBPM '120', ITRK '7'): node-taglib-sharp does not map IBPM/ITRK; STANDARD_F
- C-R6-01 / low / open / Custom Number field in schema -> every save writes ITKN='0' (size 1) into files that never had it; pre-existing
- RR-R6-03 / low / open / riff-info-nul.test.ts uses double quotes vs single in src; tests/ not linted
- RR-R6-05 / info / open / Architecture signal: one RIFF value normalisation layer readRiffValue(tag, chunkId): string[] for standard and custom fields, plus a write-s
- C-R6-02 / info / open / Observation: music-metadata decodes RIFF INFO UTF-8 Georgian as mojibake (also on the original ffmpeg file); ffprobe and ID3 COMM are correc
- RR-R7-04 / low / open / metadata-write-guard.test.ts overrides file.tag with a bare Id3v2Tag: tied to node-taglib-sharp getter shape; may break on a library upgrade
- RR-R7-05 / info / open / Architecture signal: split writeTagsToFile into pure planTagWrite(meta, schema) -> {standard, custom} and applyTagWrite(file, plan) that val
- A-R7-01 / info / open / Fact (A R7 M2, C R7-2 M2/M2b): on library-opened sample.wav without LIST/INFO, getRiffInfoTags is already non-empty before the title workaro
- B-R7-02 / low / open / schema.ts isValidField does not validate riffChunkId (type/length); a hand-edited schema.json reaches the write path with 'AB', '', 'ICAT5' 
- B-R7-03 / low / open / A non-standard schema field without riffChunkId is silently skipped on write (metadata.ts 'if (field.riffChunkId)'): value given, save repor
- RR-R8-01 / low / open / metadata.ts:199 String(riffChunkId) is redundant (already string); push riffChunkId directly
- RR-R8-02 / low / open / metadata-write-field-errors.test.ts uses double quotes vs single in src; tests/ not linted
- RR-R8-03 / low / open / metadata.ts:147 empty catch {} in read path hides non-ID failures without a trace; a debug log would help diagnosis
- RR-R8-04 / info / open / Architecture signal: validate schema at load in main (riffChunkId /^[A-Z0-9 ]{4}$/, not reserved, not duplicated); reject or flag once; keep
- A-R8-01 / info / open / docs/recording-tag-contract.md header (line 5) and '## შემოწმება' do not mention D-17/D-18 or metadata-write-field-errors.test.ts (task said
- A-R8-02 / low / open / node-taglib-sharp checks riffChunkId by JS string length (id.length !== 4), not bytes: a 4-character non-ASCII ID does not trigger D-18; doc
- C-R8-01 / low / open / After a failed batch save (0 saved, 2 failed) the panel shows the 'Multiple values' placeholder on both files (c-round-8/r8-5-after-ii-toast

## Other open items
- TM-T1-MIG [todo] Existing users' schema.json does not show the new category field (schema.ts returns STANDARD_FIELDS only when no file); decision D-07 no aut
- OOS-01 [out_of_scope] Windows/macOS build and NSIS installer (build:win, build:mac)
- OOS-02 [out_of_scope] Backend import tool (czaba-api tools/recording-import) and database
- OOS-03 [out_of_scope] New npm dependencies
