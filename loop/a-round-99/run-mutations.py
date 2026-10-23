import json, shutil, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
A = f'{L}/a-round-99'
M = f'{A}/mut'
S = '/home/runner/czaba-project/store'
SNAP = f'{L}/b-round-98-r99-snapshots'
LIB = 'app/components/arrangement/ArrangementLibrary.tsx'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
NEW = 'app/lib/arrangement/__tests__/held-enter-add.test.tsx'
FILES = [LIB, WS, PRE]
ROW_GUARDED = "      if (!event.repeat) {\n        selectSource(sourceId);\n        addSourceToActiveTrack(sourceId);\n      }\n"
ROW_PLAIN = "      selectSource(sourceId);\n      addSourceToActiveTrack(sourceId);\n"
WS_GUARDED = "        if (!event.repeat) {\n          current.addSourceToActiveTrack();\n        }\n"
WS_PLAIN = "        current.addSourceToActiveTrack();\n"
PLUS_IF = "            if (event.key === 'Enter' && event.repeat) {\n"
PLUS_BODY = "              event.preventDefault();\n"
PLUS_FULL = "          onKeyDown={(event) => {\n" + PLUS_IF + PLUS_BODY + "            }\n          }}\n"
ROW_HEAD = "  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, sourceId: string) => {\n"
muts = {
 'a': (LIB, [(ROW_GUARDED, ROW_PLAIN)]),
 'b': (WS, [(WS_GUARDED, WS_PLAIN)]),
 'c': (PRE, [(PLUS_FULL, '')]),
 'd': (WS, [(WS_GUARDED, '')]),
 'e': (LIB, [(ROW_GUARDED, '')]),
 'f': (PRE, [(PLUS_IF, "            if (event.repeat) {\n")]),
 'g': (PRE, [(PLUS_IF + PLUS_BODY, PLUS_IF + PLUS_BODY + "              event.stopPropagation();\n")]),
 'h': (LIB, [(ROW_HEAD, ROW_HEAD + "    if (event.repeat) {\n      return;\n    }\n")]),
}
def sync(base=False):
    for f in FILES:
        src = f'{SNAP}/{f.split("/")[-1]}' if base else f'{S}/{f}'
        shutil.copy(src, f'{M}/{f}')
    shutil.copy(f'{S}/{NEW}', f'{M}/{NEW}')
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', NEW], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(d):
    red = {}
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red[a['title'][:3]] = (a.get('failureMessages') or [''])[0].split('\n')[0][:160]
    return red
res = {}
sync(base=True); d = run()
res['fail-before(baseline snapshots a2b6f78d/1270f6c5/c6efc0ef)'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('fail-before', json.dumps(list(reds(d))), flush=True)
for mid, (f, edits) in muts.items():
    sync(); src = open(f'{M}/{f}', encoding='utf-8').read()
    for old, new in edits:
        assert src.count(old) == 1, (mid, old, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{f}', 'w', encoding='utf-8').write(src)
    d = run()
    res[mid] = {'file': f, 'numFailed': d['numFailedTests'], 'red': reds(d)}
    print(mid, json.dumps(list(res[mid]['red'])), flush=True)
sync(); d = run()
res['unmutated'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests']}
print('unmutated', res['unmutated'])
json.dump(res, open(f'{A}/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
