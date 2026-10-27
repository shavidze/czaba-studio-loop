import os, re, subprocess, shutil
SRC = '/tmp/c-r28-new'
OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-28/mutants.log'
W = '/tmp/c-r28-mut'
U = 'src/renderer/src/lib/utils.ts'
F = 'src/renderer/src/stores/file-store.ts'
FB = 'src/renderer/src/components/sidebar/FolderBrowser.tsx'
AP = 'src/renderer/src/App.tsx'
TESTS = ['tests/renderer/components/folder-read-during-save.test.ts', 'tests/renderer/stores/file-store.test.ts', 'tests/renderer/utils/utils.test.ts']
def prep():
    shutil.rmtree(W, ignore_errors=True)
    shutil.copytree(SRC, W, symlinks=True)
def sub(path, old, new, occ=None):
    fp = os.path.join(W, path); s = open(fp).read()
    n = s.count(old)
    if occ is None:
        assert n >= 1, (path, old); s = s.replace(old, new)
    else:
        assert n > occ, (path, old, n)
        idx = -1
        for _ in range(occ + 1): idx = s.index(old, idx + 1)
        s = s[:idx] + new + s[idx + len(old):]
    open(fp, 'w').write(s)
def run(name, edits):
    prep()
    for e in edits: sub(*e)
    d = ''.join(subprocess.run(['diff', '-u', os.path.join(SRC, p), os.path.join(W, p)], capture_output=True, text=True).stdout for p in (U, F, FB, AP))
    r = subprocess.run(['npx', 'vitest', 'run', '--config', 'vitest.config.renderer.ts'] + TESTS, cwd=W, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    tests = [l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    fails = sorted(set(re.findall(r'^\s*×\s*(\([a-z0-9]+\))', out, re.M)))
    with open(OUT, 'a') as f: f.write(f'## {name}\n```diff\n{d}```\n{tests}\nkilled by: {fails}\n\n')
    print(name, tests, fails, flush=True)
CALL = "useFileStore\n          .getState()\n          .applyMetadataRead(meta as Record<string, WavMetadata>, readGenerations);"
CALL_APP = "useFileStore\n            .getState()\n            .applyMetadataRead(meta as Record<string, WavMetadata>, readGenerations);"
GEN = "    const chunkGeneration = getWriteGeneration();\n"
LOOP = "  for (let i = 0; i < paths.length; i += METADATA_CHUNK_SIZE) {\n"
RES = "      const result = await window.api.readMetadataBatch(chunk, schema);\n"
SUP = "const isSuperseded = (state.pathWriteGenerations[path] ?? 0) > (readGenerations[path] ?? 0);"
mutants = [
 ('baseline (no mutation)', []),
 ('MR-1 ignore generations', [(F, SUP, "const isSuperseded = false;")]),
 ('MR-2 >= instead of >', [(F, SUP, SUP.replace(') > (', ') >= ('))]),
 ('MR-3 generation once before loop', [(U, GEN, ''), (U, LOOP, "  const chunkGeneration = getWriteGeneration();\n" + LOOP)]),
 ('MR-4 generation after readMetadataBatch resolves', [(U, GEN, ''), (U, RES, RES + "      const chunkGeneration = getWriteGeneration();\n")]),
 ('MR-5 superseded w/o entry gets meta', [(F, "if (current) metadata[path] = current;", "metadata[path] = current ?? meta;")]),
 ('MR-6 handleRescan keeps setMetadata', [(FB, CALL, "setMetadata(meta as Record<string, WavMetadata>);", 1)]),
 ('MR-7 handleOpenFolder keeps setMetadata', [(FB, CALL, "setMetadata(meta as Record<string, WavMetadata>);", 0)]),
 ('MR-8 App openFolder keeps setMetadata', [(AP, CALL_APP, "setMetadata(meta as Record<string, WavMetadata>);")]),
 ('MR-9 merge instead of replace', [(F, "const metadata: Record<string, WavMetadata> = {};", "const metadata: Record<string, WavMetadata> = { ...state.metadata };")]),
 ('MR-10 callers pass () => 0', [(FB, "() => useFileStore.getState().writeGeneration,", "() => 0,"), (AP, "() => useFileStore.getState().writeGeneration,", "() => 0,")]),
]
open(OUT, 'w').close()
for name, edits in mutants: run(name, edits)
