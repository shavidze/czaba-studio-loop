import json, shutil, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
A = f'{L}/a-round-101'
M = f'{A}/mut'
S = '/home/runner/czaba-project/store'
SNAP = f'{L}/b-round-100-r101-snapshots'
C = 'app/components/arrangement/ArrangementExportDialog.tsx'
T = 'app/lib/arrangement/__tests__/export-dialog-footer.test.tsx'
VT = "                  aria-valuetext={formatArrangementExportProgress(progress)}\n"
muts = {
 'a': [('<ModalBody className="space-y-4 pb-0">', '<ModalBody className="space-y-4">')],
 'b': [(VT, '                  aria-valuetext="ექსპორტის პროგრესი"\n')],
 'c': [(VT, VT + '                  aria-live="polite"\n')],
 'd': [('bg-surface px-8 py-4"', 'bg-surface px-8 pt-4 pb-4"')],
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
shutil.copy(f'{SNAP}/ArrangementExportDialog.tsx', f'{M}/{C}')
d = run(); res['fail-before(snapshot cbee8cc6 + extended test)'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('fail-before', d['numFailedTests'], d['numPassedTests'], list(reds(d)), flush=True)
for mid, edits in muts.items():
    shutil.copy(f'{S}/{C}', f'{M}/{C}')
    src = open(f'{M}/{C}', encoding='utf-8').read()
    for old, new in edits:
        assert src.count(old) == 1, (mid, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{C}', 'w', encoding='utf-8').write(src)
    d = run(); res[mid] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
    print(mid, d['numFailedTests'], list(reds(d)), flush=True)
shutil.copy(f'{S}/{C}', f'{M}/{C}')
d = run(); res['unmutated'] = {'numFailed': d['numFailedTests'], 'numPassed': d['numPassedTests'], 'red': reds(d)}
print('unmutated', d['numFailedTests'], d['numPassedTests'], flush=True)
json.dump(res, open(f'{A}/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
