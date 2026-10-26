# Active loop summary (2026-10-26T16:00:51.147Z)

- backlog.json 45 KB -> active view 22 KB
- status: G_ROOT_GATE round 5
- servers: `{"servers":"none or skipped"}`
- last publication: a8c1b53ed043560569dd528e2bc2e5190b63333a (rounds 5-5)
- last root gate: round 5 published - commit a8c1b53ed043560569dd528e2bc2e5190b63333a pushed

## Current items: TM-T0, TM-T0-CI, TM-T1, TM-T1-DUP, TM-B09, TM-T0-CI-FU

## Open findings
- B-R0-03 / low / open / node-taglib-sharp empty data chunk boundary bug (TM-B05)
- C-R1-01 / low / open / Empty Keywords written as IKEY=""; save also adds id3, LIST/MID, IDVX, JUNK chunks and moves data to the end (audio bytes identical). Contra
- C-R1-03 / low / open / .claude/primitives/TESTING.md:129 stale (fixtures now created by globalSetup); .claude/** frozen, needs a round that owns it
- RR-R1-01 / medium / open / check.yml: separate Build step + playwright test differs from the npm run test:e2e path (naming or merge)
- RR-R1-03 / low / open / check.yml actions pinned to @v4 tags, not SHAs
- RR-R1-04 / low / open / create-fixtures.ts CLI guard regex matches only create-fixtures.ts (argv[1]); suggest create-fixtures\.[cm]?[jt]s$
- RR-R1-05 / low / open / create-fixtures.ts temp file ${filePath}.${pid}.tmp leaks if writeFileSync throws; not gitignored
- RR-R1-07 / info / open / Architecture signal: after a green check.yml run make it a required status check and add needs: check to release.yml (release.yml frozen; ne
- C-R2-01 / low / open / Artists written as repeated ISTR while the schema says IART; ffprobe artist shows only the first (pre-existing) -> TM-B08, D-12
- RR-R2-01 / medium / open / metadata.ts getRiffInfoTags throws TypeError for a non-CombinedTag; on the write path it is outside the per-field try, so standard writes ne
- RR-R2-02 / low / open / FileList.tsx formatFirstFieldValue display fix (string artists showed the first char) has no renderer test; test-on-bugfix asks for one (art
- RR-R2-03 / low / open / skipLibCheck:true also skips the project's own src/preload/index.d.ts; consider dropping it from tsconfig.test.json once dependency types ar
- RR-R2-04 / info / open / Architecture signal: remaining file.tag as unknown as TagObject casts (metadata.ts:113,158); a RiffTags-typed accessor resolved once per fil
- C-R3-01 / low / open / 'Tagged' badge ignores ICAT/IKEY/ICMT (FileList.tsx:77-81 hasTags = title/artists/bpm)
- A-R3-01 / low / open / tests/renderer/setup.ts (frozen) replaces window with a plain object; schema-editor.test.ts works around it locally with vi.hoisted
- RR-R3-01 / medium / open / Old custom field key 'category' (auto ID CATE) + standard toggle -> two fields same key, one value in CATE and ICAT, duplicate React keys (S
- RR-R3-03 / info / open / Every editor-panel save writes empty ICAT (D-10 pinned on purpose)
- RR-R3-04 / low / open / New test files use double quotes vs src single quotes; Biome does not check tests/
- RR-R3-05 / info / open / npx --yes tsx@4 downloads a floating major at runtime (verifyCommand + check.yml); consider a pinned devDependency
- RR-R3-06 / info / open / Architecture: schema.json has no version/migration; a versioned schema with one-time merge in loadSchema() would solve D-07 and TM-T1-DUP to
- C-R4-01 / low / open / apt-install.sh worst case ~750 s (2 x (240+10) + dpkg recovery 240+10) > step timeout-minutes 10 (600 s); GitHub kills the step before the f
- RR-R4-02 / low / open / Same as C-R4-01 (step budget < worst case)
- RR-R4-03 / low / open / check-ffprobe-tags.ts missing-file hint hard-codes 'during npm run check'; a follow-up could print the exact vitest command
- RR-R4-04 / info / open / tests/main/check-ffprobe-tags.test.ts second test only checks a constant + existsSync (low value; acceptable as a guard against a renamed pr
- RR-R4-05 / low / open / apt-install.sh and its env knobs APT_ATTEMPT_TIMEOUT_SECONDS / APT_ATTEMPTS are not documented in docs/ (Georgian)
- RR-R4-06 / info / open / Architecture signal: move the ffprobe cross-check into recording-tag-contract.test.ts (skip when ffprobe is missing) or into a dedicated npm

## Other open items
- TM-T1-MIG [todo] Existing users' schema.json does not show the new category field (schema.ts returns STANDARD_FIELDS only when no file); decision D-07 no aut
- TM-B08 [todo] STANDARD_FIELDS declares artists riffChunkId IART, but node-taglib-sharp writes performers as one ISTR sub-chunk per value; ffprobe shows ar
- TM-T2 [blocked] T-2 UCS CatID combobox on category field, unknown value blocks save, batch one CatID to many files
- TM-T2-DATA [blocked] UCS category list file (~750 CatIDs) + licence confirmation, provided by Saba
- TM-B05 [todo] A WAV whose data chunk is empty cannot be tagged (node-taglib-sharp 6.0.1 boundary bug) and read silently returns empty metadata
- TM-B06 [todo] Biome lint covers only src/ (tests/ not linted); tsconfig.test.json not part of check
- OOS-01 [out_of_scope] Windows/macOS build and NSIS installer (build:win, build:mac)
- OOS-02 [out_of_scope] Backend import tool (czaba-api tools/recording-import) and database
- OOS-03 [out_of_scope] New npm dependencies
