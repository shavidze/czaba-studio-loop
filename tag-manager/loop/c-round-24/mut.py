import os, re, subprocess, shutil, sys

REPO = '/home/runner/czaba-project/czaba-tag-manager'
OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-24/mutants.log'
P = 'src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
S = 'tests/renderer/components/metadata-panel-schema-change.test.ts'
B = 'tests/renderer/components/metadata-panel-batch-save.test.ts'
W = '/tmp/c-r24-mut'


def prep():
    shutil.rmtree(W, ignore_errors=True)
    os.makedirs(W)
    files = subprocess.run(['git', 'ls-files', '-z'], cwd=REPO, capture_output=True).stdout.split(b'\0')
    files = [f.decode() for f in files if f] + [S]
    for f in files:
        src = os.path.join(REPO, f)
        if not os.path.isfile(src):
            continue
        dst = os.path.join(W, f)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
    os.symlink(os.path.join(REPO, 'node_modules'), os.path.join(W, 'node_modules'))


def sub(path, old, new, count=1):
    fp = os.path.join(W, path)
    s = open(fp).read()
    n = s.count(old)
    assert n >= 1, (path, old)
    s = s.replace(old, new, count)
    open(fp, 'w').write(s)


def run(name, test, extra):
    r = subprocess.run(['npx', 'vitest', 'run', '--config', 'vitest.config.renderer.ts', test] + extra, cwd=W, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    tests = [l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    fails = [l.strip() for l in out.splitlines() if l.strip().startswith('×')]
    msgs = [l.strip() for l in out.splitlines() if l.strip().startswith('AssertionError') or 'promise rejected' in l][:3]
    with open(OUT, 'a') as f:
        f.write(f'## {name}\n{tests}\nfailed: {fails}\nmsgs: {msgs}\n\n')
    print(name, tests, fails)


RE1 = "readMetadata(path, useSchemaStore.getState().fields)"
RE2 = "readMetadataBatch(paths, useSchemaStore.getState().fields)"
mutants = {
    'MR-1': (lambda: sub(P, RE1, 'readMetadata(path, fields)'), S, []),
    'MR-2': (lambda: sub(P, RE2, 'readMetadataBatch(paths, fields)'), S, []),
    'MF-1': (lambda: sub(P, "          accumulated[path] = previous[path];\n", ''), S, []),
    'MF-1b (whole kept loop removed)': (lambda: sub(P, "        const previous = useFileStore.getState().metadata;\n        for (const path of chunk) {\n          if (!previous[path]) continue;\n          accumulated[path] = previous[path];\n          keptPaths.add(path);\n        }\n", ''), S, []),
    'MK-1': (lambda: sub(P, 'if (current && !keptPaths.has(currentSelection[0]))', 'if (current)'), S, []),
    'MW-1 (write uses current schema)': (lambda: sub(P, 'writeMetadata(path, ', 'writeMetadata(path, ') , S, []),
    'MB': (lambda: sub(B, "  resetAllStores();\n  resetWindowApiMocks();\n", "  resetAllStores();\n"), B, []),
}
LINES = [
    'vi.mocked(window.api.writeMetadataBatch).mockReset()',
    'vi.mocked(window.api.readMetadataBatch).mockReset()',
    'vi.mocked(window.api.writeMetadata).mockReset()',
    'vi.mocked(window.api.readMetadata).mockReset()',
    'vi.mocked(window.api.scanFolder).mockReset()',
]
for i, l in enumerate(LINES, 1):
    mutants[f'MI-{i}'] = ((lambda l=l: sub(B, l, l.replace('mockReset', 'mockClear'))), B, ['-t', 'i3'])
del mutants['MW-1 (write uses current schema)']

open(OUT, 'w').close()
only = sys.argv[1:]
for name, (apply, test, extra) in mutants.items():
    if only and name not in only:
        continue
    prep()
    apply()
    run(name, test, extra)
prep()
run('control (A tree, batch-save -t i3)', B, ['-t', 'i3'])
run('control (A tree, schema-change)', S, [])
