import json, shutil, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
A = f'{L}/a-round-100'
M = f'{A}/mut'
S = '/home/runner/czaba-project/store'
SNAP = f'{L}/b-round-99-r100-snapshots'
PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
T = 'app/lib/arrangement/__tests__/library-preview.test.tsx'
GUARD_IF = "          onKeyDown={(event) => {\n            if (event.key === 'Enter' && event.repeat) {\n"
GUARD_BODY = "              event.preventDefault();\n"
GUARD_FULL = GUARD_IF + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n"
muts = {
 'a': [(GUARD_FULL, "          disabled={!isReady}\n")],
 'b': [(GUARD_IF + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n",
        "          onKeyDown={(event) => {\n            if (event.repeat) {\n" + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n")],
 'c': [(GUARD_IF + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n",
        GUARD_IF + GUARD_BODY + "              event.stopPropagation();\n            }\n          }}\n          disabled={!isReady}\n")],
 'e': [(GUARD_FULL, GUARD_FULL.replace("event.key === 'Enter' && event.repeat", "(event.key === 'Enter' || event.key === ' ') && event.repeat"))],
 'd': [(GUARD_IF + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n",
        "          onKeyDown={(event) => {\n            if (event.key === 'Enter') {\n" + GUARD_BODY + "            }\n          }}\n          disabled={!isReady}\n")],
}
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', T], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(d):
    out = {}
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                out[a['title'][:60]] = (a.get('failureMessages') or [''])[0].split('\n')[0][:160]
    return out
res = {}
shutil.copy(f'{S}/{T}', f'{M}/{T}')
shutil.copy(f'{SNAP}/ArrangementLibraryPreview.tsx', f'{M}/{PRE}')
d = run(); res['fail-before(snapshot f074a9bb + extended test)'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('fail-before', d['numFailedTests'], d['numPassedTests'], list(reds(d)), flush=True)
for mid, edits in muts.items():
    shutil.copy(f'{S}/{PRE}', f'{M}/{PRE}')
    src = open(f'{M}/{PRE}', encoding='utf-8').read()
    for old, new in edits:
        assert src.count(old) == 1, (mid, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{PRE}', 'w', encoding='utf-8').write(src)
    d = run(); res[mid] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
    print(mid, d['numFailedTests'], list(reds(d)), flush=True)
shutil.copy(f'{S}/{PRE}', f'{M}/{PRE}')
d = run(); res['unmutated'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('unmutated', d['numFailedTests'], d['numPassedTests'], flush=True)
json.dump(res, open(f'{A}/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
