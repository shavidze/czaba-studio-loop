import json, shutil, subprocess, sys
M = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-93/mut'
S = '/home/runner/czaba-project/store'
DLG = 'app/components/arrangement/ArrangementExportDialog.tsx'
NEW = 'app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx'
WAV_CLOSE = "'მთელი პროექტი, იგივე graph რაც დაკვრისას'}\n                </span>\n              </span>"
muts = {
 'a': [("                aria-labelledby={optionIds.mp3Name}\n", "")],
 'b': [("                aria-describedby={optionIds.bothNote}\n", "")],
 'c': [("<span id={optionIds.wavName}>WAV · 24-bit · 48 kHz · stereo</span>", "<span id={optionIds.wavName}>WAV · 24-bit · 48 kHz · stereo"),
       (WAV_CLOSE, WAV_CLOSE + "</span>")],
 'd': [("                aria-labelledby={hasValidRange ? undefined : optionIds.rangeName}\n", "")],
 'e': [("aria-describedby={hasValidRange ? undefined : rangeReasonId}", "aria-describedby={rangeReasonId}")],
 'f': [("Master დადუმებულია (M) — {EXPORT_FORMAT_CREATES[exportFormat]}{' '}", "Master დადუმებულია (M) — {'WAV შეიქმნება'}{' '}")],
 'g': [("პროექტში ხმოვანი კლიპი არ არის — {EXPORT_FORMAT_CREATES[exportFormat]}{' '}", "პროექტში ხმოვანი კლიპი არ არის — {'WAV შეიქმნება'}{' '}")],
 'h': [("<span id={optionIds.mp3Name}>", "<span id={optionIds.mp3Name} className=\"block\">")],
}
tests = [NEW, 'app/lib/arrangement/__tests__/export-range-ui.test.tsx', 'app/lib/arrangement/__tests__/export-mp3.test.tsx', 'app/lib/arrangement/__tests__/master-ui.test.tsx']
def sync():
    for g in (DLG, NEW):
        shutil.copy(f'{S}/{g}', f'{M}/{g}')
results = {}
for mid in sys.argv[1:] or muts:
    sync()
    src = open(f'{M}/{DLG}', encoding='utf-8').read()
    for old, new in muts[mid]:
        assert src.count(old) == 1, (mid, old, src.count(old))
        src = src.replace(old, new)
    open(f'{M}/{DLG}', 'w', encoding='utf-8').write(src)
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', *tests], cwd=M, capture_output=True, text=True)
    data = json.loads(r.stdout[r.stdout.find('{'):])
    red = {}
    for t in data['testResults']:
        name = t['name'].rsplit('/', 1)[-1]
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red.setdefault(name, []).append(a['title'][:60])
    results[mid] = {'numFailed': data['numFailedTests'], 'red': red}
    print(mid, json.dumps(results[mid], ensure_ascii=False), flush=True)
sync()
r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', *tests], cwd=M, capture_output=True, text=True)
data = json.loads(r.stdout[r.stdout.find('{'):])
results['unmutated'] = {'numFailed': data['numFailedTests'], 'numPassed': data['numPassedTests']}
print('unmutated', results['unmutated'])
json.dump(results, open('/home/runner/czaba-project/tmp/studio-real-loop/a-round-93/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
