import json, subprocess, pathlib, hashlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/c-round-111/mut')
S = M / 'store'
T = S / 'app/components/arrangement/StudioWorkspace.tsx'
fixed = pathlib.Path('/home/runner/czaba-project/store/app/components/arrangement/StudioWorkspace.tsx').read_text()
RHS = "focusedElement instanceof HTMLElement &&\n        focusedElement !== document.body &&\n        libraryAsideRef.current?.contains(focusedElement) === true;"
GUARD = "if (focusedElement === null || focusedElement === document.body) {"
def rep(s, a, b):
    assert s.count(a) == 1, a
    return s.replace(a, b)
m2 = rep(fixed, RHS, "focusedElement === focusedElement;")
variants = [
    ('control-before', fixed),
    ('c-m1-never-armed', rep(fixed, RHS, "focusedElement === null && focusedElement !== null;")),
    ('c-m2-always-armed', m2),
    ('c-m3-always-armed-no-body-check', rep(m2, GUARD, "if (focusedElement !== undefined) {")),
    ('control-after', fixed),
]
TEST = 'app/lib/arrangement/__tests__/library-video-return-focus.test.tsx'
res = {}
(M / 'results').mkdir(exist_ok=True)
for name, src in variants:
    T.write_text(src)
    out = M / 'results' / f'{name}.json'
    subprocess.run(['npx', 'vitest', 'run', '--config', 'vitest.c.config.ts', TEST, '--reporter=json', f'--outputFile={out}'], cwd=S, capture_output=True)
    d = json.loads(out.read_text())
    red = sorted(a['title'].split(':')[0] for r in d['testResults'] for a in r['assertionResults'] if a['status'] != 'passed')
    res[name] = {'total': d['numTotalTests'], 'passed': d['numPassedTests'], 'red': red}
    print(name, res[name], flush=True)
T.write_text(fixed)
res['scratch_restored_sha256'] = hashlib.sha256(T.read_bytes()).hexdigest()
res['store_sha256'] = hashlib.sha256(fixed.encode()).hexdigest()
pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/c-round-111/out/mutations.json').write_text(json.dumps(res, indent=1, ensure_ascii=False))
print(res['scratch_restored_sha256'] == res['store_sha256'])
