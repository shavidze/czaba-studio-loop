import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
reps = [
("   - `setIsSaving(false)` still runs in `finally`.\n",
 "   - `setIsSaving(false)` still runs in `finally`.\n   - The refresh is **not** a rescan. It does not set `isScanning`, does not stop the player, does not clear or change the selection, does not change `folderPath`, and does not call `setFiles` or `setMetadata`.\n",
 "The refresh is **not** a rescan"),
("       - the call order is write → scan → read. Check it with `mock.invocationCallOrder`.\n",
 "       - the call order is write → scan → read. Check it with `mock.invocationCallOrder`;\n       - `selectedPaths` is still `[A]`, and `useFileStore.getState().isScanning === false`.\n",
 "isScanning === false"),
("   - Existing tests (a)–(m) stay byte-identical and green.",
 "   - **Imports:** both test files already import every name these tests need (`vi`, `useFileStore`, `useMetadataStore`, `WavFileEntry`, `WavMetadata`), so no import change is expected. If one is really needed, the only change allowed is to extend an **existing** import line with more names, as in R18. Do not add a second line from the same module.\n   - Existing tests (a)–(m) stay byte-identical and green.",
 "**Imports:** both test files"),
("<li>`git diff d015470 -- tests/ .claude/ \\| grep '^-[^-]'` is empty, so nothing was removed.</li>",
 "<li>`git diff d015470 -- tests/ .claude/ \\| grep '^-[^-]'` is empty, so nothing was removed. The only allowed exception is an import line that comes back with the same names plus new ones (see Tests).</li>",
 "The only allowed exception is an import line"),
("The toast reports 1 saved and 1 failed.</li>",
 "The toast reports 1 saved and 1 failed. If `chmod 444` does not make the write fail (for example, if the library writes through a temp file and a rename), use `chmod 000` as in R15 and record which one worked. With `000` the re-read of `c` also fails (the D-22 path). The check that `c`'s cells are unchanged holds either way.</li>",
 "use `chmod 000` as in R15"),
]
for old, new, marker in reps:
    if marker in s:
        continue
    if s.count(old) != 1:
        raise SystemExit("anchor: " + old[:60])
    s = s.replace(old, new)
open(p, "w", encoding="utf-8").write(s)
