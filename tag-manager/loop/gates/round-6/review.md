COMMIT: OK

**Findings**

The change is small and correct. It strips trailing NUL characters from RIFF INFO values on the read path. It covers the standard text getters, the `artists`/`genres` lists, and custom `riffChunkId` fields, so number fields now parse properly (`"120\0"` reads as 120, not 0). NULs inside a value are kept. The write path stays the same, and test (f) checks that a read-then-save writes no NUL bytes and leaves the ISFT chunk untouched. There's a failing-first test, as the bug-fix rule requires. Verify passed: Biome shows only 9 old a11y/deps warnings in renderer files this diff doesn't touch, tsc is clean, the main tests pass 50/50 (8 of them new), and all 7 E2E tests pass.

- **medium**: `src/main/ipc/metadata.ts:111-116`, `187-201`. `getRiffInfoTags` used to throw when the tag isn't a `CombinedTag`; now it returns `[]`.
  - **Read path:** no visible change. The old throw was already caught at `:147`, which fell back to the default value.
  - **Write path:** this changes behaviour. Before, a non-CombinedTag tag made `meta:write` fail loudly. Now `writeTagsToFile` writes the standard fields, silently skips every custom field (category, keywords, etc.), calls `file.save()`, and reports success. With WAV files from node-taglib-sharp this probably never happens, because RiffFile's tag is always a `CombinedTag`. But the failure has gone from loud to silent, and the existing silent skip at `:192` makes it worse.
  - **Fix:** in `writeTagsToFile`, if `customFields.length > 0 && infoTags.length === 0` after the `title` workaround, throw (or return a per-file error) so the batch result shows the failure. Add a test with a mocked non-WAV tag.
- **low**: `metadata.ts:61-90`. The `year`/`track`/`bpm` getters don't strip NULs. They're numbers, and taglib's integer parsing most likely ignores a trailing NUL, but no test covers it. Consider adding `IPRD`/`ITRK` with a `\0` to test (d).
- **low**: `tests/main/riff-info-nul.test.ts`. The file uses double quotes while `src/` uses single quotes. Biome only runs on `src/` here, so the style difference isn't enforced. Cosmetic.
- **low**: The `// InfoTag read failed…` comments at `:148` and `:198` were already there and go against the project's "no comments in code" rule. They're not part of this diff, so nothing to do now.

**Architecture note (proposal only)**

NUL handling is currently done inside each getter. A cleaner design would be one RIFF-value normalisation layer, e.g. a `readRiffValue(tag, chunkId): string[]` helper, used for both standard and custom fields, plus one write-side check that refuses to report success when custom fields couldn't be written. That would also give batch writes (`BatchWriteResult`) an honest per-file status, instead of relying on the empty `catch {}` blocks.