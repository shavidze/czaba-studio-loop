import json, shutil, subprocess, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
A = f'{L}/a-round-97'
M = f'{A}/mut'
S = '/home/runner/czaba-project/store'
DLG = 'app/components/arrangement/ArrangementExportDialog.tsx'
NEW = 'app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx'
BASE = f'{L}/b-round-96-r97-snapshots/ArrangementExportDialog.tsx'
GUARD_IF = "                  if (event.key === 'Enter' && event.repeat === true) {\n"
GUARD_BODY = "                    event.preventDefault();\n"
CANCEL_CLS = 'focus-visible:ring-brand"\n                >\n                  გაუქმება'
CLOSE_CLS = 'focus-visible:ring-brand disabled:opacity-40"\n              >\n                დახურვა'
muts = {
 'a': [(GUARD_BODY, '')],
 'b': [(GUARD_IF, "                  if (event.key === 'Enter') {\n")],
 'c': [(GUARD_IF, "                  if (event.repeat === true) {\n")],
 'd': [(GUARD_BODY, GUARD_BODY + "                    event.stopPropagation();\n")],
 'e': [(CANCEL_CLS, 'focus-visible:ring-brand disabled:opacity-40"\n                >\n                  გაუქმება')],
 'f': [(CLOSE_CLS, 'focus-visible:ring-brand"\n              >\n                დახურვა')],
}
def sync(dlg_src=f'{S}/{DLG}'):
    shutil.copy(dlg_src, f'{M}/{DLG}')
    shutil.copy(f'{S}/{NEW}', f'{M}/{NEW}')
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', NEW], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(data):
    red = {}
    for t in data['testResults']:
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red[a['title'][:3]] = (a.get('failureMessages') or [''])[0].split('\n')[0][:160]
    return red
results = {}
sync(BASE)
d = run()
results['fail-before(baseline 0040e050)'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('fail-before', json.dumps(results['fail-before(baseline 0040e050)'], ensure_ascii=False), flush=True)
for mid, edits in muts.items():
    sync()
    src = open(f'{M}/{DLG}', encoding='utf-8').read()
    for old, new in edits:
        assert src.count(old) == 1, (mid, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{DLG}', 'w', encoding='utf-8').write(src)
    d = run()
    results[mid] = {'numFailed': d['numFailedTests'], 'red': reds(d)}
    print(mid, json.dumps(results[mid], ensure_ascii=False), flush=True)
sync()
d = run()
results['unmutated'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests']}
print('unmutated', results['unmutated'])
json.dump(results, open(f'{A}/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
