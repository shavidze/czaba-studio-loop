# Active loop summary (2026-10-26T14:11:51.822Z)

- backlog.json 30 KB -> active view 16 KB
- status: G_ROOT_GATE round 3
- servers: `{"servers":"none or skipped"}`
- last publication: 230b87a85e7301b25e86e3768a9e242cf9adc5f4 (rounds 3-3)
- last root gate: round 3 published - commit 230b87a85e7301b25e86e3768a9e242cf9adc5f4 pushed

## Current items: TM-B04, TM-T1, TM-T1-DOC, TM-B07

## Open findings
- B-R0-03 / low / open / node-taglib-sharp empty data chunk boundary bug (TM-B05)
- C-R1-01 / low / open / Empty Keywords written as IKEY=""; save also adds id3, LIST/MID, IDVX, JUNK chunks and moves data to the end (audio bytes identical). Contra
- C-R1-03 / low / open / .claude/primitives/TESTING.md:129 stale (fixtures now created by globalSetup); .claude/** frozen, needs a round that owns it
- RR-R1-01 / medium / open / check.yml: separate Build step + playwright test differs from the npm run test:e2e path (naming or merge)
- RR-R1-02 / medium / open / check.yml installs ffmpeg before anything uses it; becomes used in T-1 (T1-6)
- RR-R1-03 / low / open / check.yml actions pinned to @v4 tags, not SHAs
- RR-R1-04 / low / open / create-fixtures.ts CLI guard regex matches only create-fixtures.ts (argv[1]); suggest create-fixtures\.[cm]?[jt]s$
- RR-R1-05 / low / open / create-fixtures.ts temp file ${filePath}.${pid}.tmp leaks if writeFileSync throws; not gitignored
- RR-R1-06 / info / open / Architecture signal: split WAV builder into tests/fixtures/wav.ts (no argv sniffing; bext/iXML builders for T-1)
- RR-R1-07 / info / open / Architecture signal: after a green check.yml run make it a required status check and add needs: check to release.yml (release.yml frozen; ne
- C-R2-01 / low / open / Artists written as repeated ISTR while the schema says IART; ffprobe artist shows only the first (pre-existing) -> TM-B08, D-12
- RR-R2-01 / medium / open / metadata.ts getRiffInfoTags throws TypeError for a non-CombinedTag; on the write path it is outside the per-field try, so standard writes ne
- RR-R2-02 / low / open / FileList.tsx formatFirstFieldValue display fix (string artists showed the first char) has no renderer test; test-on-bugfix asks for one (art
- RR-R2-03 / low / open / skipLibCheck:true also skips the project's own src/preload/index.d.ts; consider dropping it from tsconfig.test.json once dependency types ar
- RR-R2-04 / info / open / Architecture signal: remaining file.tag as unknown as TagObject casts (metadata.ts:113,158); a RiffTags-typed accessor resolved once per fil
- A-R2-01 / low / open / docs/plans/002-recording-tag-contract.md:5 (T-1 waits for TM-B04) and :77 (src/** byte-identical) are stale -> owned and fixed in round 3

## Other open items
- TM-T0 [in_progress] T-0 Linux-verifiable baseline: clean checkout check + E2E green on ubuntu-24.04
- TM-T0-CI [in_progress] New .github/workflows/check.yml (ubuntu-24.04, Node 22, npm ci, ffmpeg+xvfb, check, build, xvfb playwright --retries=0)
- TM-T1-MIG [todo] Existing users' schema.json does not show the new category field (schema.ts returns STANDARD_FIELDS only when no file); decision D-07 no aut
- TM-T1-DUP [todo] Old schema.json with a custom field already using ICAT -> two fields on one chunk
- TM-B08 [todo] STANDARD_FIELDS declares artists riffChunkId IART, but node-taglib-sharp writes performers as one ISTR sub-chunk per value; ffprobe shows ar
- TM-T2 [blocked] T-2 UCS CatID combobox on category field, unknown value blocks save, batch one CatID to many files
- TM-T2-DATA [blocked] UCS category list file (~750 CatIDs) + licence confirmation, provided by Saba
- TM-B05 [todo] A WAV whose data chunk is empty cannot be tagged (node-taglib-sharp 6.0.1 boundary bug) and read silently returns empty metadata
- TM-B06 [todo] Biome lint covers only src/ (tests/ not linted); tsconfig.test.json not part of check
- OOS-01 [out_of_scope] Windows/macOS build and NSIS installer (build:win, build:mac)
- OOS-02 [out_of_scope] Backend import tool (czaba-api tools/recording-import) and database
- OOS-03 [out_of_scope] New npm dependencies
