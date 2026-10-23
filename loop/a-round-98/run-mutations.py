import json, shutil, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
A = f'{L}/a-round-98'
M = f'{A}/mut'
S = '/home/runner/czaba-project/store'
TR = 'app/components/arrangement/ArrangementTransport.tsx'
NEW = 'app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx'
BASE = f'{L}/b-round-97-r98-snapshots/ArrangementTransport.tsx'
GUARD_IF = "            if (event.key === 'Enter' && event.repeat) {\n"
GUARD_BODY = "              event.preventDefault();\n"
GUARD_FULL = """          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
"""
FIT = "          onClick={navigation.onFit}\n"
SHARED = """function ignoreRepeatedEnterOnToolbar(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === 'Enter' && event.repeat) {
    event.preventDefault();
  }
}

function ArrangementTransportPosition() {"""
muts = {
 'a': [(GUARD_BODY, '')],
 'b': [(GUARD_IF, "            if (event.key === 'Enter') {\n")],
 'c': [(GUARD_IF, "            if (event.repeat) {\n")],
 'd': [(GUARD_BODY, GUARD_BODY + "              event.stopPropagation();\n")],
 'e': [(GUARD_FULL, "          onKeyDown={ignoreRepeatedEnterOnToolbar}\n"),
       (FIT, FIT + "          onKeyDown={ignoreRepeatedEnterOnToolbar}\n"),
       ("function ArrangementTransportPosition() {", SHARED),
       ("import { useCallback, useRef } from 'react';", "import { type KeyboardEvent, useCallback, useRef } from 'react';")],
}
def sync(src=f'{S}/{TR}'):
    shutil.copy(src, f'{M}/{TR}')
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
sync(BASE); d = run()
res['fail-before(baseline 35b03a95)'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('fail-before', json.dumps(res['fail-before(baseline 35b03a95)'], ensure_ascii=False), flush=True)
for mid, edits in muts.items():
    sync(); src = open(f'{M}/{TR}', encoding='utf-8').read()
    for old, new in edits:
        assert src.count(old) == 1, (mid, old, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{TR}', 'w', encoding='utf-8').write(src)
    d = run()
    res[mid] = {'numFailed': d['numFailedTests'], 'red': reds(d)}
    print(mid, json.dumps(res[mid], ensure_ascii=False), flush=True)
sync(); d = run()
res['unmutated'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests']}
print('unmutated', res['unmutated'])
json.dump(res, open(f'{A}/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
