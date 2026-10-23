import json, shutil, subprocess, sys
M = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-94/mut'
S = '/home/runner/czaba-project/store'
CTX = 'app/contexts/ArrangementContext.tsx'
COL = 'app/lib/arrangement/collection.ts'
NEW = 'app/lib/arrangement/__tests__/collection-load-status.test.tsx'
OLDCOL = 'app/lib/arrangement/__tests__/collection.test.ts'
muts = {
 'a': [(CTX, "      return () => controller.abort();\n    }\n    setStatus(copy.loading);\n", "      return () => controller.abort();\n    }\n")],
 'b': [(CTX, "    if (collection.sources.length === 0) {\n      setStatus(copy.empty);\n      return () => controller.abort();\n    }\n", "")],
 'c': [(CTX, "      setStatus(copy.empty);\n", "      setStatus(copy.ready);\n")],
 'd': [(CTX, "      setStatus(copy.empty);\n", "      setStatus(workspaceCollectionCopy('demo').empty);\n")],
 'e': [(CTX, "        .then((buffer) => {\n          if (controller.signal.aborted) {\n            return;\n          }\n", "        .then((buffer) => {\n")],
 'f': [(CTX, "          const { fileStem } = workspaceCollectionCopy(collection.origin);\n", "          const fileStem = 'czaba-studio-lab';\n")],
}
tests = [NEW, OLDCOL, 'app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx', 'app/lib/arrangement/__tests__/export-mp3.test.tsx']
def sync():
    for g in (CTX, COL, NEW, OLDCOL):
        shutil.copy(f'{S}/{g}', f'{M}/{g}')
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', *tests], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
results = {}
for mid in sys.argv[1:] or muts:
    sync()
    for path, old, new in muts[mid]:
        src = open(f'{M}/{path}', encoding='utf-8').read()
        assert src.count(old) == 1, (mid, old, src.count(old))
        open(f'{M}/{path}', 'w', encoding='utf-8').write(src.replace(old, new))
    data = run()
    red = {}
    for t in data['testResults']:
        name = t['name'].rsplit('/', 1)[-1]
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red.setdefault(name, []).append(a['title'][:70])
    results[mid] = {'numFailed': data['numFailedTests'], 'red': red}
    print(mid, json.dumps(results[mid], ensure_ascii=False), flush=True)
sync()
data = run()
results['unmutated'] = {'numFailed': data['numFailedTests'], 'numPassed': data['numPassedTests']}
print('unmutated', results['unmutated'])
json.dump(results, open('/home/runner/czaba-project/tmp/studio-real-loop/c-round-94/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
