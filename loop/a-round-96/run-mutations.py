import json, shutil, subprocess, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
M = f'{L}/a-round-96/mut'
S = '/home/runner/czaba-project/store'
CTX = 'app/contexts/ArrangementContext.tsx'
NEW = 'app/lib/arrangement/__tests__/failed-source-refusal.test.tsx'
PREV_ERR = "        } else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {\n          setStatus(librarySourceFailedMessage(source.title));\n"
ADD_TERN = "          state?.status === 'error'\n            ? librarySourceFailedMessage(source.title)\n            : `„${source.title}“ ჯერ არ ჩატვირთულა.`,\n"
muts = {
 'a': [(CTX, ADD_TERN, "          `„${source.title}“ ჯერ არ ჩატვირთულა.`,\n")],
 'b': [(CTX, PREV_ERR, "")],
 'c': [(CTX, ADD_TERN, "          state?.status !== 'error'\n            ? librarySourceFailedMessage(source.title)\n            : `„${source.title}“ ჯერ არ ჩატვირთულა.`,\n"),
       (CTX, "        } else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {\n", "        } else if (latestRef.current.sourceStates[sourceId]?.status !== 'error') {\n")],
 'd': [(CTX, "        stopLibraryPreview();\n        if (!source) {\n          setStatus('ჯერ ბიბლიოთეკაში აირჩიე ხმა.');\n        } else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {\n          setStatus(librarySourceFailedMessage(source.title));\n        } else {\n          stopLibraryPreview();\n",
       "        if (!source) {\n          stopLibraryPreview();\n          setStatus('ჯერ ბიბლიოთეკაში აირჩიე ხმა.');\n        } else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {\n          setStatus(librarySourceFailedMessage(source.title));\n        } else {\n          stopLibraryPreview();\n")],
 'e': [(CTX, "  `„${title}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;\n", "  `„${title}“ ვერ ჩაიტვირთა - დეტალები ბიბლიოთეკაშია.`;\n")],
 'f': [(CTX, "            ? librarySourceFailedMessage(source.title)\n", "            ? librarySourceFailedMessage(source.title) + (state.error ?? '')\n")],
}
def sync():
    for g in (CTX, NEW):
        shutil.copy(f'{S}/{g}', f'{M}/{g}')
def prep_d():
    src = open(f'{M}/{CTX}', encoding='utf-8').read()
    old = "        } else {\n          setStatus(`„${source.title}“ ჯერ არ ჩატვირთულა.`);\n        }\n        return;"
    assert src.count(old) == 1
    src = src.replace(old, "        } else {\n          stopLibraryPreview();\n          setStatus(`„${source.title}“ ჯერ არ ჩატვირთულა.`);\n        }\n        return;")
    open(f'{M}/{CTX}', 'w', encoding='utf-8').write(src)
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', NEW], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
results = {}
for mid in sys.argv[1:] or muts:
    sync()
    if mid == 'd':
        prep_d()
    for path, old, new in muts[mid]:
        src = open(f'{M}/{path}', encoding='utf-8').read()
        assert src.count(old) == 1, (mid, src.count(old))
        open(f'{M}/{path}', 'w', encoding='utf-8').write(src.replace(old, new))
    data = run()
    red = {}
    for t in data['testResults']:
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red[a['title'][:3]] = (a.get('failureMessages') or [''])[0].split('\n')[0][:160]
    results[mid] = {'numFailed': data['numFailedTests'], 'red': red}
    print(mid, json.dumps(results[mid], ensure_ascii=False), flush=True)
sync()
data = run()
results['unmutated'] = {'numFailed': data['numFailedTests'], 'numPassed': data['numPassedTests']}
print('unmutated', results['unmutated'])
json.dump(results, open(f'{L}/a-round-96/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
