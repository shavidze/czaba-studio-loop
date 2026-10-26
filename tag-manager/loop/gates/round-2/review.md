COMMIT: OK

I reviewed the whole round-2 diff and found nothing that should block it. The verify run passed: `biome` reported only 9 old warnings and no errors, all three `tsc -p` checks were clean, and all tests passed (75 renderer, 31 main, 6 E2E).

**Critical / High**
None.

**Medium**
- `src/main/ipc/metadata.ts:103-108,177`: `getRiffInfoTags` throws `TypeError` when `file.tag` is not a `CombinedTag`. On the write path (line 177) that call sits outside the per-field `try`, so the error propagates out of `writeTagsToFile`. This is not a regression: the old `file.tag.tags.filter` would also have thrown in that case. For WAV files the tag is `RiffTags`, which extends `CombinedTag`, so normal use is fine. Fix (optional): return `[]` instead of throwing, so that standard-field writes on an unusual RIFF file still reach `file.save()`.

**Low**
- `src/renderer/src/components/file-list/FileList.tsx:102-106,117-118`: `formatFirstFieldValue` changes what the list shows. Before, `meta.artists[0]` showed only the first character when `artists` was a string. Now it shows the whole string. That is a quiet bug fix with no test, which the project rule `test-on-bugfix.md` asks for. Fix: add a small renderer test with `artists: "Foo"` and with `artists: ["A", "B"]`.
- `src/renderer/src/lib/utils.ts:48`: narrowing `readMetadataChunked`'s `schema` parameter to `FieldDefinition[]` is correct. Any caller passing a loose shape will now fail `tsc` early, which is the goal of TM-B04.
- `tsconfig.*.json`: adding `skipLibCheck: true` to all three configs hides type errors inside `.d.ts` files. That is acceptable for library types, but it also covers the project's own `src/preload/index.d.ts`. Consider dropping it from `tsconfig.test.json` once the dependency types are clean.
- `tests/main/metadata.test.ts:75-100`: the IKEY test checks real bytes in the file: the `LIST`/`INFO` header, that `IKEY` sits inside the LIST, the payload, and that the padding is all zeros. That is good evidence. It covers existing behaviour rather than a reproduced bug, so there is no "failing first" step to check here.
- `.github/workflows/check.yml:40-42`: `--reporter=list,html` with `PLAYWRIGHT_HTML_OPEN=never` is correct. The upload step on failure will now actually find `playwright-report/`.
- `tests/e2e/*.spec.ts`: renaming `window` to `page` fixes a real problem. Inside `page.evaluate` callbacks, the local `window` variable was shadowing the browser's `window`. The callbacks now correctly refer to `window.api` in the renderer.

**Security / IPC**
Nothing changes in the IPC surface, preload or `contextIsolation`, and no secrets were added.

**Architecture note (proposal only)**
`metadata.ts` still uses `file.tag as unknown as TagObject` (lines 113 and 158). Now that `getRiffInfoTags` narrows tags properly, a similar typed accessor for the standard tag properties would remove the last double cast. One option is a `RiffTags`-typed wrapper that is resolved once per file and passed to both the read and write helpers. This would also let the write path pick the INFO tag in one place instead of calling the helper twice.