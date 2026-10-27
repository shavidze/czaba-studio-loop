import os, re, subprocess, shutil
SRC = '/tmp/c-r29-new'
OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-29/mutants.log'
W = '/tmp/c-r29-mut'
U = 'src/renderer/src/lib/utils.ts'
F = 'src/renderer/src/stores/file-store.ts'
FB = 'src/renderer/src/components/sidebar/FolderBrowser.tsx'
AP = 'src/renderer/src/App.tsx'
TESTS = ['tests/renderer/components/folder-read-rejected-chunk.test.ts', 'tests/renderer/components/folder-read-during-save.test.ts', 'tests/renderer/stores/file-store.test.ts', 'tests/renderer/utils/utils.test.ts']
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
KEPT = "      for (const path of keptPaths) {\n        const current = state.metadata[path];\n        if (current) metadata[path] = current;\n      }\n"
KEPT_IF = "      for (const path of keptPaths) {\n        const current = state.metadata[path];\n        if (current) metadata[path] = current;\n"
TOAST = "useMetadataStore.getState().showToast(`Failed to read ${failures} files`, 'error');"
FBIF = "        if (failures > 0) {\n          " + TOAST + "\n        }\n"
APIF = "          if (failures > 0) {\n            " + TOAST + "\n          }\n"
ARG = "readGenerations, failedPaths);"
FBDES = "        const {\n          data: meta,"
APDES = "          const {\n            data: meta,"
SNAP_AFTER = "useFileStore.setState((s) => { const m = { ...s.metadata }; for (const p of failedPaths) { const e = before[p]; if (e) m[p] = e; else delete m[p]; } return { metadata: m }; });\n"
mutants = [
 ('baseline (no mutation)', []),
 ('MK-1 applyMetadataRead ignores keptPaths', [(F, KEPT, '')]),
 ('MK-2 kept path with no entry gets {}', [(F, KEPT_IF, KEPT_IF.replace('if (current) metadata[path] = current;', 'metadata[path] = current ?? {};'))]),
 ('MK-3 caller-side snapshot before readMetadataChunked (all 3 callers)', [
    (FB, FBDES, "        const before = useFileStore.getState().metadata;\n" + FBDES),
    (AP, APDES, "          const before = useFileStore.getState().metadata;\n" + APDES),
    (FB, FBIF, "        " + SNAP_AFTER + FBIF),
    (AP, APIF, "          " + SNAP_AFTER + APIF)]),
 ('MK-4 toast when failures >= 0', [(FB, 'if (failures > 0)', 'if (failures >= 0)'), (AP, 'if (failures > 0)', 'if (failures >= 0)')]),
 ('MK-5 handleRescan drops toast', [(FB, FBIF, '', 1)]),
 ('MK-6 handleOpenFolder drops toast', [(FB, FBIF, '', 0)]),
 ('MK-7 App openFolder drops toast', [(AP, APIF, '')]),
 ('MK-8 failedPaths also gets resolved chunk paths', [(U, "        readGenerations[path] = chunkGeneration;\n      }\n", "        readGenerations[path] = chunkGeneration;\n      }\n      failedPaths.push(...chunk);\n")]),
 ('MK-9 handleRescan passes []', [(FB, ARG, 'readGenerations, []);', 1)]),
 ('MK-9b handleOpenFolder passes []', [(FB, ARG, 'readGenerations, []);', 0)]),
 ('MK-9c App openFolder passes []', [(AP, ARG, 'readGenerations, []);')]),
 ('EX-1 (A-R29-01) failedPaths keeps only last rejected chunk', [(U, 'failedPaths.push(...chunk);', 'failedPaths.splice(0, failedPaths.length, ...chunk);')]),
]
open(OUT, 'w').close()
for name, edits in mutants: run(name, edits)
