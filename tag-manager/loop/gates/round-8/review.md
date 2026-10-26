COMMIT: OK

The change makes a save fail as a whole when any custom RIFF INFO field can't be written. Before, a failed field was silently skipped and the save reported success. Now `writeTagsToFile` collects the failing IDs and throws before `file.save()`, so nothing reaches disk. The verify log is green: 107 renderer tests, 62 main-process tests and 7 E2E tests passed, plus typecheck. Biome reported 9 warnings, all in files this round doesn't touch.

**Critical / High:** none.

**What I checked**
- **Correctness:** the throw at `src/main/ipc/metadata.ts:202-204` sits inside the `try`/`finally`, so `file.dispose()` still runs and nothing leaks. Standard-field setters and the `tag.title` fallback only change the in-memory tag, so throwing before `save()` leaves the file bytes untouched. Tests (a), (c1) and (d) confirm this with byte comparisons.
- **Event ordering and batch:** the IPC handlers pass the error through unchanged. Single-file save rejects with the `Failed to write metadata: ` prefix (test a). Batch save records each bad file under `failed` and carries on with the rest (test c1). The ordering of the earlier "no INFO tag" error (D-17) is unchanged.
- **Regression risk:** valid IDs, including `ICAT`, still write correctly (tests c2 and e). Fields with no value are skipped as before (test b). Reads with a malformed ID still fall back to the default value (test f).
- **The behaviour change is intended and documented:** if a hand-edited `schema.json` contains an ID that isn't 4 bytes, every Metadata panel save now fails. That is louder than the old silent data loss and is the right trade-off. The Schema Editor already enforces valid IDs (`SchemaEditor.tsx:97`, `isValidRiffId`), so this only affects hand-edited schemas, as the doc says.
- **Security / conventions:** nothing new is exposed over IPC. The inline comments were removed in line with the no-comments rule. The project's test-on-bugfix rule is met by the new test file.

**Low**
- `metadata.ts:199`: `String(riffChunkId)` is redundant because the value is already typed `string`. Push `riffChunkId` directly.
- `tests/main/metadata-write-field-errors.test.ts`: it uses double quotes while `src/` uses single quotes. Biome only checks `src/`, so nothing enforces this. If the sibling tests also use double quotes, it's consistent and can be left alone.
- `metadata.ts:147`: the empty `catch {}` in the read path hides any non-ID failure on a field without a trace. It's acceptable under the no-comments rule, but a debug log on that path would help future diagnosis.

**Architecture note (proposal only)**
Validate the schema in the main process when `schema.json` is loaded: check that each `riffChunkId` matches `/^[A-Z0-9 ]{4}$/` and isn't reserved or duplicated. Invalid fields would be rejected or flagged once, instead of every save failing at write time. Keep the all-or-nothing write as a second line of defence.