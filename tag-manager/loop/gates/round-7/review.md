COMMIT: OK

This is a small, focused change. The write path now fails loudly instead of silently dropping data. The new tests exercise the actual failure path, not just the happy path. In the verify log, Biome reports only 9 warnings, all in untouched renderer files. tsc passes, unit tests pass (107 renderer, 55 main) and E2E passes (7).

**Findings**

**Critical / High:** none.

**Medium**
- **`src/main/ipc/metadata.ts:192-194`: saves are now all-or-nothing, which changes what users see.** Before this change, a write that mixed standard fields (title, artist…) with custom INFO fields (category, keywords) on a file with no INFO tag still saved the standard fields and quietly dropped the custom ones. Now the error is thrown before `file.save()`, so the standard fields are dropped too. Test (a) asserts exactly this, and it is the safer behaviour because nothing is written partially and then reported as success. But a single save, or a batch save of the same values, now fails a file where it used to partly succeed.
  - In practice this branch should be rare. A real WAV gets its INFO tag from the `tag.title` nudge, which test (d) confirms.
  - **Fix:** none needed. Mention it in the bug or changelog note so the toast "Failed to write metadata: RIFF INFO tag is not available…" is expected.

**Low**
- **`src/main/ipc/metadata.ts:195-202`: individual fields can still fail silently.** The per-field `try { setValuesFromStrings } catch {}` still swallows errors, so one bad field, such as a malformed `riffChunkId` in a user schema, is still skipped without telling the user while the save reports success. The fix only covers the case where the whole INFO tag is missing. **Fix:** collect the IDs that fail and throw after the loop, before `save()`, using the same all-or-nothing approach.
- **`src/main/ipc/metadata.ts:200`: inline comment against project rules.** The comment `// InfoTag write failed for this field` breaks the CLAUDE.md "no comments in code" rule. It was already there; the diff only re-indented it. Remove it the next time this block is touched.
- **`tests/main/metadata-write-guard.test.ts:32-47`: the test depends on internals.** The override swaps `file.tag` for a bare `Id3v2Tag`, which ties the test to the getter shape of node-taglib-sharp. That is acceptable: it is the only practical way to reach the branch, and the file bytes are compared against the real fixture. Just be aware it may break if the library is upgraded.
- **`tests/main/riff-info-nul.test.ts:+38-42`: good addition.** The new ICRD test closes a real gap: a NUL-terminated year could turn into `NaN`/0 because of `Number(values[0]) || 0`. No action needed.

**Security / IPC:** no new channels, no changes to how paths are handled, no change to `contextIsolation`.
**Performance / leaks:** `dispose()` still runs in `finally` when the error is thrown, so no file handle is leaked. The batch write still moves on to the next file (test c).

**Architecture note (proposal only)**
`writeTagsToFile` mixes three jobs: deciding which fields are standard and which are custom, making sure an INFO tag exists, and the write itself. It could become a two-step "plan, then apply":
1. A pure `planTagWrite(meta, schema)` that returns `{ standard, custom }`.
2. An `applyTagWrite(file, plan)` that checks everything up front (INFO tag present, every chunk ID valid) and only then changes the tag and calls `save()`.

That makes "nothing is written unless everything can be written" a rule enforced in one place, removes the swallowed per-field errors, and lets the planning step be unit-tested without the `createFromPath` mocks.