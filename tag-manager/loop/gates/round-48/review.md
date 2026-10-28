Still reviewing: I've read the diff, the new test file and the verify log, and I'm writing up the verdict now.

COMMIT: OK

This round changes only docs and tests. It adds `tests/main/metadata-artists.test.ts` and documents that Artists are still written to the WAV as before (decisions D-12 and Q3). It does not touch `src/`, so it can't break the app at runtime, the IPC layer or security. The verify log shows Biome with 8 warnings and 0 errors (all the warnings are in older files), `tsc` passing for node, web and test, 326 renderer tests, 135 main tests including all 7 new ones, and 7 E2E tests passing.

I checked the test against the code:
- **Imports exist:** `findSingleRiffChunk`, `parseRiffTopLevelChunks` and `sha256OfRiffChunk` are exported from `tests/main/riff-chunks.ts` (lines 16, 42, 75).
- **It goes through the real IPC handlers:** the test calls `meta:write` and `meta:read` and passes the real `STANDARD_FIELDS`. That list still maps `artists` to `riffChunkId: 'IART'` (`src/shared/types.ts:22`), so the claim that this ID is "informational only" matches the code.
- **(b6)/(b7) prove their test file is built correctly:** they first check that the file really contains `IART=Rec`, and (b6) also checks the title `T` reads back. (b7) checks the audio `data` chunk's sha256 doesn't change, which guards against audio corruption.
- **Fixtures clean up properly:** each run uses its own temp folder (pid + timestamp), which `afterAll` deletes.
- **Conventions are followed:** semicolons, no `any`, Georgian docs. The test file has no comments, matching the "no comments in code" rule. The one cast is the same `_handlers` access the other main tests already use.
- **The docs are honest about gaps:** the `LIST/MID` IART and the ffprobe/music-metadata results are marked as measured by hand and not covered by a unit test.

## Findings

**Critical / High:** none.

**Medium:** none.

**Low**
1. `tests/main/metadata-artists.test.ts:33-39, 81-102`: the test writes its own `encodeRiffSubChunk` and `listInfoSubChunkEntries` instead of reusing shared helpers. Similar parsing likely already exists in `riff-info-nul.test.ts` and `recording-tag-contract.test.ts` (I didn't confirm this). **Fix:** move both functions into `tests/main/riff-chunks.ts` in a later round so there is one LIST/INFO parser.
2. `tests/main/metadata-artists.test.ts:92-99`: the sub-chunk loop stops silently if a trailing fragment is shorter than 8 bytes. For a file the library wrote this is fine, but a broken tail would go unnoticed. **Fix (optional):** after the loop, assert that `offset === list.length` (allowing for padding).
3. `docs/recording-tag-contract.md:44-48`: if Q25 is answered "Artists → `IART`", reading old files will also change. Files already saved with `ISTR` would no longer show their artists unless the reader also accepts `ISTR`. **Fix:** add one line to the Q25 note saying that switching to IART needs a migration plan, or that the reader must accept both.

## Architecture note (proposal only)
The `riffChunkId` in `STANDARD_FIELDS` doesn't match what is actually written to the file, and the docs and tests are now carrying that difference. When Q25 is decided, consider either:
- **(a)** setting `artists.riffChunkId` to `'ISTR'` so the schema describes the file truthfully, or
- **(b)** writing `artists` through the InfoTag path to `IART`, the same way `keywords` and `category` go through the `IKEY`/`ICAT` path. The reader would then accept both `IART` and `ISTR`, which also fixes the case where another program's `IART` shows up as an empty Artists field (pinned in (b6)/(b7)).