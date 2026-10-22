import json, re, shutil, subprocess, sys
M = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-92/mut'
S = '/home/runner/czaba-project/store'
COL = 'app/lib/arrangement/collection.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
muts = {
 'a': (COL, "{ credentials: 'omit', signal }", "{ credentials: 'omit' }"),
 'b': (COL, "{ credentials: 'omit', signal }", "{ credentials: 'omit', signal, headers: { Authorization: 'Bearer x' } }"),
 'c': (COL, "`ფაილი ვერ ჩაიტვირთა (${response.status})`", "`ფაილი ვერ ჩაიტვირთა (${response.status}) ${url}`"),
 'd': (COL, "badge: 'შეძენილი კოლექცია',", "badge: 'დემო კოლექცია — ავტორიზაცია არ სჭირდება',"),
 'e': (CTX, "failed === 0 ? copy.ready : copy.failed(failed)", "failed === 0 ? 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).' : copy.failed(failed)"),
 'f': (CTX, "const { fileStem } = workspaceCollectionCopy(collection.origin);\n        anchor", "const fileStem = 'czaba-studio-lab';\n        anchor"),
 'g': (COL, "if (stems.length === 0) {", "if (stems.length < 0) {"),
 'i': (COL, "      audioData = await response.arrayBuffer();\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }", "      audioData = await response.arrayBuffer();\n    } catch (error) {\n      if (signal.aborted) {\n        throw new Error(String(error));\n      }"),
 'h': (COL, "[...stems].sort((first, second) => first.order - second.order)", "[...stems]"),
}
tests = ['app/lib/arrangement/__tests__/collection.test.ts', 'app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx']
results = {}
for mid in sys.argv[1:] or muts:
    f, old, new = muts[mid]
    for g in (COL, CTX):
        shutil.copy(f'{S}/{g}', f'{M}/{g}')
    src = open(f'{M}/{f}', encoding='utf-8').read()
    assert src.count(old) == 1, (mid, src.count(old))
    open(f'{M}/{f}', 'w', encoding='utf-8').write(src.replace(old, new))
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', *tests], cwd=M, capture_output=True, text=True)
    out = r.stdout[r.stdout.find('{'):]
    data = json.loads(out)
    failed = [a['title'][:4] + ('' if True else '') for t in data['testResults'] for a in t['assertionResults'] if a['status'] == 'failed']
    passed6 = [a['status'] for t in data['testResults'] for a in t['assertionResults'] if a['title'].startswith('PW6')]
    results[mid] = {'red': sorted(set(x.strip() for x in failed)), 'PW6': passed6, 'numFailed': data['numFailedTests']}
    print(mid, results[mid], flush=True)
for g in (COL, CTX):
    shutil.copy(f'{S}/{g}', f'{M}/{g}')
json.dump(results, open('/home/runner/czaba-project/tmp/studio-real-loop/c-round-92/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
