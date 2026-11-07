import subprocess, sys, pathlib
root = pathlib.Path('/tmp/b393-scratch')
out = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/b-round-392/mutants')
P = 'app/lib/arrangement/preview.client.ts'; C = 'app/contexts/ArrangementContext.tsx'
muts = {
 'MU-393-STREAM-NEVER': [(C, "? (collection.previewUrl?.(source) ?? null)", "? null")],
 'MU-393-STOP-KEEPS-SRC': [(P, "      current.element.removeAttribute('src');\n      current.element.load();\n", "")],
 'MU-393-SEEK-NEW-ELEMENT': [(P, "      if (active?.kind === 'stream' && active.url === url) {", "      if (false) {")],
 'MU-393-ENDED-UNGUARDED': [(P, "      const handleEnded = () => {\n        if (active === preview) {", "      const handleEnded = () => {\n        if (true) {"), (P, "          element.removeEventListener('ended', handleEnded);\n", "")],
 'MU-393-ERROR-AFTER-STOP': [(P, "      const handleError = () => {\n        if (active === preview) {", "      const handleError = () => {\n        if (true) {")],
 'MU-393-NO-FALLBACK': [(C, "          startLibraryPreviewRef.current(sourceId, atSeconds);\n", "")],
 'MU-393-FALLBACK-NOT-REMEMBERED': [(C, "            current.sourceIds.add(sourceId);", "            current.sourceIds.size;"), (C, "            streamFallbackRef.current = { collection, sourceIds: new Set([sourceId]) };", "            streamFallbackRef.current = null;")],
}
T = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
summary = []
for mid, edits in muts.items():
    orig = {}
    for f, a, b in edits:
        p = root / f; orig.setdefault(f, p.read_text())
        s = p.read_text(); assert a in s, (mid, a); p.write_text(s.replace(a, b, 1))
    r = subprocess.run(['npx', 'vitest', 'run', T], cwd=root, capture_output=True, text=True)
    (out / f'mutant-{mid}.log').write_text(r.stdout + r.stderr)
    for f, s in orig.items(): (root / f).write_text(s)
    fails = [l.strip() for l in (r.stdout).splitlines() if '×' in l or 'FAIL' in l][:6]
    summary.append(f'{mid}: rc={r.returncode} {"RED" if r.returncode else "SURVIVED"} {fails}')
r = subprocess.run(['npx', 'vitest', 'run', T], cwd=root, capture_output=True, text=True)
summary.append(f'pristine: rc={r.returncode}')
(out / 'summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))
