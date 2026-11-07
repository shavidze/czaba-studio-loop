import pathlib
import subprocess

root = pathlib.Path('/tmp/a393-scratch')
out = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-393/mutants')
P = 'app/lib/arrangement/preview.client.ts'
C = 'app/contexts/ArrangementContext.tsx'
D = 'app/data/studio-lab-demo.ts'
T = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
TD = 'app/data/__tests__/studio-lab-demo.test.ts'

muts = {
    'MU-393-STOP-KEEPS-SRC': [(P, "      current.element.removeAttribute('src');\n      current.element.load();\n", "")],
    'MU-393-SEEK-NEW-ELEMENT': [(P, "      if (active?.kind === 'stream' && active.url === url) {", "      if (false) {")],
    'MU-393-ENDED-UNGUARDED': [
        (P, "      const handleEnded = () => {\n        if (active === preview) {", "      const handleEnded = () => {\n        if (true) {"),
        (P, "          element.removeEventListener('ended', handleEnded);\n", ""),
    ],
    'MU-393-ERROR-AFTER-STOP': [(P, "      const handleError = () => {\n        if (active === preview) {", "      const handleError = () => {\n        if (true) {")],
    'MU-393-BUFFER-KEEPS-STREAM': [(P, "    playLibraryPreview(buffer, offset) {\n      stopActive();\n", "    playLibraryPreview(buffer, offset) {\n")],
    'MU-393-STREAM-NEVER': [(C, "? (collection.previewUrl?.(source) ?? null)", "? null")],
    'MU-393-STREAM-OVER-CACHE': [(C, "        !isCached &&\n", "")],
    'MU-393-NO-FALLBACK': [(C, "          startLibraryPreviewRef.current(sourceId, atSeconds);\n", "")],
    'MU-393-FALLBACK-NOT-REMEMBERED': [
        (C, "            current.sourceIds.add(sourceId);", "            current.sourceIds.size;"),
        (C, "            streamFallbackRef.current = { collection, sourceIds: new Set([sourceId]) };", "            streamFallbackRef.current = null;"),
    ],
    'MU-393-STOP-IGNORES-STREAM': [(P, "    if (current.kind === 'stream') {\n      current.detach();", "    if (current.kind === 'stream') {\n      return;\n      current.detach();")],
    'MU-393-UNMOUNT-NO-STOP': [(C, "      previewPlayerRef.current?.stopLibraryPreview();\n      previewPlayerRef.current = null;\n", "      previewPlayerRef.current = null;\n")],
    'MU-393-STREAM-KEEPS-TRANSPORT': [(C, "        if (isPlayingRef.current) {\n          stopPlayback();\n        }\n        if (!previewPlayerRef.current) {\n          previewPlayerRef.current = createLibraryPreviewPlayer", "        if (!previewPlayerRef.current) {\n          previewPlayerRef.current = createLibraryPreviewPlayer")],
    'MU-393-ENDED-NO-CALLBACK': [(P, "          stopActive();\n          onEnded();\n", "          stopActive();\n")],
    'MU-393-FALLBACK-FROM-ZERO': [(C, "startLibraryPreviewRef.current(sourceId, atSeconds);", "startLibraryPreviewRef.current(sourceId, 0);")],
    'MU-393-LOADING-ON-STREAM': [(C, "        releasePreviewPin();\n        libraryPreviewSourceRef.current = sourceId;\n", "        releasePreviewPin();\n        setStatus(studioLibraryStrings.sourceDecoding(source.title));\n        libraryPreviewSourceRef.current = sourceId;\n")],
    'MU-393-PLAY-REJECT-IGNORED': [(P, "      void Promise.resolve(element.play()).catch(handleError);", "      void Promise.resolve(element.play()).catch(() => undefined);")],
    'MU-393-DEMO-URL-ALL': [(D, "  previewUrl: (source) => (Object.hasOwn(demoUrls, source.id) ? demoUrls[source.id] : null),", "  previewUrl: (source) => demoUrls[source.id] ?? '/middle-east.mp3',")],
}

expected_rows = {
    'MU-393-STOP-KEEPS-SRC': 'PS1', 'MU-393-SEEK-NEW-ELEMENT': 'PS2', 'MU-393-ENDED-UNGUARDED': 'PS3',
    'MU-393-ERROR-AFTER-STOP': 'PS4', 'MU-393-BUFFER-KEEPS-STREAM': 'PS5', 'MU-393-STREAM-NEVER': 'PS6',
    'MU-393-STREAM-OVER-CACHE': 'PS7', 'MU-393-NO-FALLBACK': 'PS8', 'MU-393-FALLBACK-NOT-REMEMBERED': 'PS8',
    'MU-393-STOP-IGNORES-STREAM': 'PS9', 'MU-393-UNMOUNT-NO-STOP': 'PS10', 'MU-393-STREAM-KEEPS-TRANSPORT': 'PS11',
    'MU-393-ENDED-NO-CALLBACK': 'PS12', 'MU-393-FALLBACK-FROM-ZERO': 'PS13', 'MU-393-LOADING-ON-STREAM': 'PS14',
    'MU-393-DEMO-URL-ALL': 'PS15', 'MU-393-PLAY-REJECT-IGNORED': 'PS4',
}


def strip_ansi(text):
    import re
    return re.sub(r'\x1b\[[0-9;]*m', '', text)


summary = []
for mid, edits in muts.items():
    orig = {}
    for f, a, b in edits:
        p = root / f
        orig.setdefault(f, p.read_text())
        s = p.read_text()
        assert s.count(a) == 1, (mid, s.count(a), a)
        p.write_text(s.replace(a, b, 1))
    r = subprocess.run(['npx', 'vitest', 'run', T, TD], cwd=root, capture_output=True, text=True)
    log = strip_ansi(r.stdout + r.stderr)
    (out / f'mutant-{mid}.log').write_text(log)
    for f, s in orig.items():
        (root / f).write_text(s)
    fails = sorted({line.strip() for line in log.splitlines() if line.strip().startswith('×')})
    row = expected_rows[mid]
    named_red = any(f'× {row} ' in line for line in fails)
    verdict = 'RED' if r.returncode and named_red else ('RED-OTHER-ROW' if r.returncode else 'SURVIVED')
    summary.append(f'{mid}: rc={r.returncode} {verdict} expected={row} failing={fails}')

r = subprocess.run(['npx', 'vitest', 'run', T, TD], cwd=root, capture_output=True, text=True)
(out / 'pristine.log').write_text(strip_ansi(r.stdout + r.stderr))
summary.append(f'pristine: rc={r.returncode}')
(out / 'summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))
