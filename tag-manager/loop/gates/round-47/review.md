I've finished reading the diff, the new test, the library source and the verify log. Here is the verdict.

COMMIT: OK

**Findings**

No critical, high or medium issues.

- **low — src/main/ipc/metadata.ts:202**: The check depends on the exact library text `'WAV file is missing data chunk'`. That text comes from `node-taglib-sharp/dist/riff/riffFile.js:327`, inside `readProperties`. If the library changes the wording, the clear message silently stops appearing. Tests a1 and a3 in the new test file would catch that on an upgrade, so no change is needed now. Optional: pin `node-taglib-sharp` to an exact version in `package.json` if it isn't already.
- **low — wording**: The library throws "missing data chunk" both for a WAV with no `data` chunk at all (case a3) and for an empty `data` chunk at the end of the file. "Audio data is empty" fits both well enough, and the contract doc says so on purpose ("ერთი შეტყობინება სამ ფორმას ფარავს"). No change needed.
- **low — read/write mismatch**: `readTagsFromFile` (metadata.ts:155) still swallows the same error and returns empty fields, so the user only finds out when they save. This is documented as open question Q22 and covered by test a7. Accepted for now.

**What I checked**
- **Correctness:** `CorruptFileError` really is exported from the package root (`index.d.ts:2`). The check uses `instanceof` and the exact message, so other library errors pass through unchanged (a6: the "missing header chunk" error) and so does a plain `Error` with the same text (a8).
- **Save flows:** The new code only runs when the file is opened, before anything is written, so the file is never touched. Tests a1–a3 confirm this with sha256 checks. Both single-file and batch save go through `writeTagsToFile` (lines 319 and 345): single save adds the existing `Failed to write metadata:` prefix, and batch puts the bare message in `failed[]` and carries on with the other files (a2). The file is still opened and disposed the same way as before.
- **Regressions:** A 0-sample WAV followed by `LIST/INFO` (a4) and a 1-sample WAV (a5) still save normally.
- **Security, performance, accessibility:** No new IPC surface, no renderer change, no extra input to validate. The error text is a constant.
- **Conventions:** No code comments, semicolons present, no `any` or `@ts-ignore`, Georgian docs updated (WAV_METADATA primitive, recording-tag-contract with D-51), and a test comes with the fix.
- **Verify log:** Biome reports 8 warnings, all in renderer files this commit doesn't touch, with no errors. tsc ran on all 3 configs without errors. 326 renderer tests, 128 main tests (8 of them new) and 7 E2E tests passed.

**Architecture note (proposal only)**
Both read and write call `TagFile.createFromPath` and handle library errors each in their own way. A single `openTagFile(path, mode)` helper that turns library errors into app error codes (for example `EMPTY_AUDIO` or `CORRUPT_HEADER`) would let a future Q22 decision flag these files on read too. The renderer could then mark them in the file list using that code, instead of matching message strings.