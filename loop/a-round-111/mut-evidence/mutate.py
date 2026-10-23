import json, subprocess, sys, pathlib
root = pathlib.Path(__file__).resolve().parent
store = root / 'store'
target = store / 'app/components/arrangement/StudioWorkspace.tsx'
fixed = (root / 'StudioWorkspace.fixed.tsx').read_text()
snapshot = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/b-round-110-r111-snapshots/StudioWorkspace.tsx').read_text()
ARM = "pendingLibraryRailFocusRef.current =\n        focusedElement instanceof"
GUARD = "if (focusedElement === null || focusedElement === document.body) {\n      libraryRailExpandButton"
HELPER = "'[data-testid=\"arrangement-library-expand\"]'"
FOCUS = "libraryRailExpandButton(libraryAsideRef.current)?.focus({ preventScroll: true });"
def rep(src, old, new):
    assert src.count(old) == 1, old
    return src.replace(old, new)
variants = [
    ('control-before', fixed),
    ('fail-before', snapshot),
    ('m1', rep(fixed, ARM, "pendingLibraryRailFocusRef.current =\n        false && focusedElement instanceof")),
    ('m2', rep(fixed, ARM, "pendingLibraryRailFocusRef.current =\n        true || focusedElement instanceof")),
    ('m3', rep(rep(fixed, ARM, "pendingLibraryRailFocusRef.current =\n        true || focusedElement instanceof"), GUARD, "if (true) {\n      libraryRailExpandButton")),
    ('m4', rep(fixed, HELPER, "'[data-testid=\"arrangement-library-collapse\"]'")),
    ('m5', rep(fixed, FOCUS, "libraryRailExpandButton(libraryAsideRef.current)?.focus();")),
    ('control-after', fixed),
]
only = sys.argv[1:]
summary = {}
for name, src in variants:
    if only and name not in only:
        continue
    target.write_text(src)
    out = root / 'results' / f'{name}.json'
    subprocess.run(['npx', 'vitest', 'run', '--config', 'vitest.scratch.config.ts',
                    'app/lib/arrangement/__tests__/library-video-return-focus.test.tsx',
                    '--reporter=json', f'--outputFile={out}'], cwd=store, capture_output=True)
    data = json.loads(out.read_text())
    red = sorted(a['title'].split(':')[0] for r in data['testResults'] for a in r['assertionResults'] if a['status'] != 'passed')
    summary[name] = {'total': data['numTotalTests'], 'passed': data['numPassedTests'], 'red': red}
    print(name, summary[name], flush=True)
target.write_text(fixed)
(root / 'results' / 'summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))
