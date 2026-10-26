# Active loop summary (2026-10-26T12:36:05.401Z)

- backlog.json 15 KB -> active view 9 KB
- status: G_ROOT_GATE round 1
- servers: `{"servers":"none or skipped"}`
- last publication: c34ee5ad834eef4561c50f03e87934623705cb53 (rounds 1-1)
- last root gate: round 1 published - commit c34ee5ad834eef4561c50f03e87934623705cb53 pushed

## Current items: TM-T0, TM-B01, TM-B02, TM-B03, TM-T0-CI, TM-T0-DOC, TM-B04, TM-B05

## Open findings
- B-R0-01 / high / open / tsc step of npm run check is a no-op (TM-B04)
- B-R0-02 / info / open / Known-state line 'E2E 5/6 on Linux' was root's container; on the runner it is 0/6 (sandbox)
- B-R0-03 / low / open / node-taglib-sharp empty data chunk boundary bug (TM-B05)

## Other open items
- TM-T1 [todo] T-1 tag contract: fixed standard field category -> INFO ICAT; keywords IKEY and comment ICMT round-trip; writing keeps audio and recorder ch
- TM-T1-DOC [todo] docs/recording-tag-contract.md (Georgian: field -> chunk -> importer rule; K-4 source incl. ffprobe pitfalls) + ICAT row in .claude/primitiv
- TM-T1-MIG [todo] Existing users' schema.json does not show the new category field (schema.ts returns STANDARD_FIELDS only when no file); decision D-07 no aut
- TM-T1-DUP [todo] Old schema.json with a custom field already using ICAT -> two fields on one chunk
- TM-T2 [blocked] T-2 UCS CatID combobox on category field, unknown value blocks save, batch one CatID to many files
- TM-T2-DATA [blocked] UCS category list file (~750 CatIDs) + licence confirmation, provided by Saba
- TM-B06 [todo] Biome lint covers only src/ (tests/ not linted); tsconfig.test.json not part of check
- OOS-01 [out_of_scope] Windows/macOS build and NSIS installer (build:win, build:mac)
- OOS-02 [out_of_scope] Backend import tool (czaba-api tools/recording-import) and database
- OOS-03 [out_of_scope] New npm dependencies
