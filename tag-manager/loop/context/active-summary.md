# Active loop summary (2026-10-26T13:31:30.690Z)

- backlog.json 22 KB -> active view 13 KB
- status: G_ROOT_GATE round 2
- servers: `{"servers":"none or skipped"}`
- last publication: c76856791126602a3016e133bd91a5f0ff2ced5b (rounds 2-2)
- last root gate: round 2 published - commit c76856791126602a3016e133bd91a5f0ff2ced5b pushed

## Current items: TM-T0, TM-B01, TM-B02, TM-B03, TM-T0-CI, TM-T0-DOC, TM-B04, TM-B07

## Open findings
- B-R0-01 / high / open / tsc step of npm run check is a no-op (TM-B04)
- B-R0-03 / low / open / node-taglib-sharp empty data chunk boundary bug (TM-B05)
- C-R1-01 / low / open / Empty Keywords written as IKEY=""; save also adds id3, LIST/MID, IDVX, JUNK chunks and moves data to the end (audio bytes identical). Contra
- C-R1-02 / low / open / check.yml playwright-report/ never created -> TM-B07 (round 2)
- C-R1-03 / low / open / .claude/primitives/TESTING.md:129 stale (fixtures now created by globalSetup); .claude/** frozen, needs a round that owns it
- RR-R1-01 / medium / open / check.yml: separate Build step + playwright test differs from the npm run test:e2e path (naming or merge)
- RR-R1-02 / medium / open / check.yml installs ffmpeg before anything uses it; becomes used in T-1 (T1-6)
- RR-R1-03 / low / open / check.yml actions pinned to @v4 tags, not SHAs
- RR-R1-04 / low / open / create-fixtures.ts CLI guard regex matches only create-fixtures.ts (argv[1]); suggest create-fixtures\.[cm]?[jt]s$
- RR-R1-05 / low / open / create-fixtures.ts temp file ${filePath}.${pid}.tmp leaks if writeFileSync throws; not gitignored
- RR-R1-06 / info / open / Architecture signal: split WAV builder into tests/fixtures/wav.ts (no argv sniffing; bext/iXML builders for T-1)
- RR-R1-07 / info / open / Architecture signal: after a green check.yml run make it a required status check and add needs: check to release.yml (release.yml frozen; ne

## Other open items
- TM-T1 [todo] T-1 tag contract: fixed standard field category -> INFO ICAT; keywords IKEY and comment ICMT round-trip; writing keeps audio and recorder ch
- TM-T1-DOC [todo] docs/recording-tag-contract.md (Georgian: field -> chunk -> importer rule; K-4 source incl. ffprobe pitfalls) + ICAT row in .claude/primitiv
- TM-T1-MIG [todo] Existing users' schema.json does not show the new category field (schema.ts returns STANDARD_FIELDS only when no file); decision D-07 no aut
- TM-T1-DUP [todo] Old schema.json with a custom field already using ICAT -> two fields on one chunk
- TM-T2 [blocked] T-2 UCS CatID combobox on category field, unknown value blocks save, batch one CatID to many files
- TM-T2-DATA [blocked] UCS category list file (~750 CatIDs) + licence confirmation, provided by Saba
- TM-B05 [todo] A WAV whose data chunk is empty cannot be tagged (node-taglib-sharp 6.0.1 boundary bug) and read silently returns empty metadata
- TM-B06 [todo] Biome lint covers only src/ (tests/ not linted); tsconfig.test.json not part of check
- OOS-01 [out_of_scope] Windows/macOS build and NSIS installer (build:win, build:mac)
- OOS-02 [out_of_scope] Backend import tool (czaba-api tools/recording-import) and database
- OOS-03 [out_of_scope] New npm dependencies
