import os, re, subprocess, shutil

SRC = '/tmp/c-r27-new'
OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-27/mutants.log'
P = 'src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
F = 'src/renderer/src/stores/file-store.ts'
TESTS = ['tests/renderer/components/metadata-panel-schema-change.test.ts', 'tests/renderer/stores/file-store.test.ts']
W = '/tmp/c-r27-mut'


def prep():
    shutil.rmtree(W, ignore_errors=True)
    shutil.copytree(SRC, W, symlinks=True, ignore=shutil.ignore_patterns('out'))


def sub(path, old, new):
    fp = os.path.join(W, path)
    s = open(fp).read()
    assert s.count(old) == 1, (path, old, s.count(old))
    open(fp, 'w').write(s.replace(old, new))


def run(name, edits):
    prep()
    for e in edits:
        sub(*e)
    d = subprocess.run(['diff', '-u', os.path.join(SRC, P), os.path.join(W, P)], capture_output=True, text=True).stdout
    d += subprocess.run(['diff', '-u', os.path.join(SRC, F), os.path.join(W, F)], capture_output=True, text=True).stdout
    r = subprocess.run(['npx', 'vitest', 'run', '--config', 'vitest.config.renderer.ts'] + TESTS, cwd=W, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    tests = [l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    fails = sorted(set(re.findall(r'^\s*×\s*(\([a-z0-9]+\))', out, re.M)))
    with open(OUT, 'a') as f:
        f.write(f'## {name}\n```diff\n{d}```\n{tests}\nkilled by: {fails}\n\n')
    print(name, tests, fails, flush=True)


SINGLE_MARK = "        useFileStore.getState().markPathsWritten([path]);\n"
SINGLE_WRITE = "        await window.api.writeMetadata(path, startEditingMetadata, fields);\n"
BATCH_MARK = "        useFileStore.getState().markPathsWritten(writtenPaths);\n"
CHECK = "if ((pathWriteGenerations[path] ?? 0) > readGeneration) {"
GEN_IN_LOOP = "      const readGeneration = useFileStore.getState().writeGeneration;\n"
LOOP_HEAD = "    for (let i = 0; i < paths.length; i += CHUNK_SIZE) {\n"
CATCH = "        for (const path of chunk) keptPaths.add(path);\n"
KEPT = "      const currentEntry = currentMetadata[path];\n"
PUSH = "        chunkReads.push({ readGeneration, result });\n"
SUPERSEDED = "          keptPaths.add(path);\n        } else {\n"
FORM = "if (current && !keptPaths.has(currentSelection[0]))"

mutants = [
    ('baseline (no mutation)', []),
    ('MG-1 no superseded check', [(P, CHECK, "if (false && (pathWriteGenerations[path] ?? 0) > readGeneration) {")]),
    ('MG-2 single marks before writeMetadata', [(P, SINGLE_MARK, ''), (P, SINGLE_WRITE, SINGLE_MARK + SINGLE_WRITE)]),
    ('MG-3 >= instead of >', [(P, CHECK, "if ((pathWriteGenerations[path] ?? 0) >= readGeneration) {")]),
    ('MG-4 one generation read before the chunk loop', [(P, GEN_IN_LOOP, "      const readGeneration = startGeneration;\n"), (P, LOOP_HEAD, "    const startGeneration = useFileStore.getState().writeGeneration;\n" + LOOP_HEAD)]),
    ('MG-5 kept entries from reject-time snapshot', [
        (P, LOOP_HEAD, "    const rejectSnapshot: Record<string, WavMetadata> = {};\n" + LOOP_HEAD),
        (P, CATCH, "        for (const path of chunk) {\n          keptPaths.add(path);\n          const snap = useFileStore.getState().metadata[path];\n          if (snap) rejectSnapshot[path] = snap;\n        }\n"),
        (P, KEPT, "      const currentEntry = rejectSnapshot[path] ?? currentMetadata[path];\n")]),
    ('MG-6 batch marks failed paths too', [(P, BATCH_MARK, "        useFileStore.getState().markPathsWritten(paths);\n")]),
    ('MG-7a superseded selected path resets form (from current entry)', [(P, SUPERSEDED, "          accumulated[path] = currentMetadata[path] ?? meta;\n        } else {\n")]),
    ('MG-7b form reset ignores keptPaths entirely', [(P, FORM, "if (current)")]),
    ('MG-8 single save does not mark', [(P, SINGLE_MARK, '')]),
    ('MG-9 batch save does not mark', [(P, BATCH_MARK, '')]),
    ('MG-10 superseded check at chunk resolve time', [(P, PUSH,
        "        const resolvedStamps = useFileStore.getState().pathWriteGenerations;\n"
        "        const filtered: Record<string, WavMetadata> = {};\n"
        "        for (const [p, m] of Object.entries(result)) {\n"
        "          if ((resolvedStamps[p] ?? 0) > readGeneration) keptPaths.add(p);\n"
        "          else filtered[p] = m;\n"
        "        }\n"
        "        chunkReads.push({ readGeneration: Number.POSITIVE_INFINITY, result: filtered });\n")]),
    ('MS-1 markPathsWritten does not increment', [(F, "const writeGeneration = state.writeGeneration + 1;", "const writeGeneration = state.writeGeneration;")]),
]

open(OUT, 'w').close()
for name, edits in mutants:
    run(name, edits)
