import json, shutil, subprocess, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
M = f'{L}/a-round-95/mut'
S = '/home/runner/czaba-project/store'
DEMO = 'app/data/studio-lab-demo.ts'
NEW = 'app/data/__tests__/studio-lab-demo.test.ts'
FETCH_TRY = "    let response: Response;\n    try {\n      response = await fetch(url, { credentials: 'omit', signal });\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n      throw new Error('ფაილი ვერ ჩაიტვირთა (ქსელი)');\n    }\n"
BODY_TRY = "    let audioData: ArrayBuffer;\n    try {\n      audioData = await response.arrayBuffer();\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n      throw new Error('ფაილი ვერ ჩაიტვირთა (ქსელი)');\n    }\n"
muts = {
 'a': [(DEMO, FETCH_TRY, "    const response = await fetch(url, { credentials: 'omit', signal });\n")],
 'b': [(DEMO, "      response = await fetch(url, { credentials: 'omit', signal });\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n", "      response = await fetch(url, { credentials: 'omit', signal });\n    } catch (error) {\n")],
 'c': [(DEMO, "    try {\n      return await ctx.decodeAudioData(audioData);\n    } catch {\n      throw new Error('ფაილი ვერ გაიშიფრა');\n    }\n", "    return ctx.decodeAudioData(audioData);\n")],
 'd': [(DEMO, BODY_TRY, "    const audioData: ArrayBuffer = await response.arrayBuffer();\n")],
 'e': [(DEMO, "      response = await fetch(url, { credentials: 'omit', signal });\n", "      response = await fetch(url, { signal });\n")],
 'g': [(DEMO, "      response = await fetch(url, { credentials: 'omit', signal });\n", "      response = await fetch(url, { credentials: 'omit', signal: new AbortController().signal });\n")],
 'h': [(DEMO, "      audioData = await response.arrayBuffer();\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n", "      audioData = await response.arrayBuffer();\n    } catch (error) {\n")],
 'f': [(DEMO, "      response = await fetch(url, { credentials: 'omit', signal });\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n      throw new Error('ფაილი ვერ ჩაიტვირთა (ქსელი)');\n", "      response = await fetch(url, { credentials: 'omit', signal });\n    } catch (error) {\n      if (signal.aborted) {\n        throw error;\n      }\n      throw new Error('ფაილი ვერ ჩაიტვირთა (ქსელ)');\n")],
}
tests = [NEW, 'app/lib/arrangement/__tests__/collection.test.ts', 'app/lib/arrangement/__tests__/collection-load-status.test.tsx', 'app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx']
def sync():
    for g in (DEMO, NEW):
        shutil.copy(f'{S}/{g}', f'{M}/{g}')
def run():
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', *tests], cwd=M, capture_output=True, text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
results = {}
for mid in sys.argv[1:] or muts:
    sync()
    for path, old, new in muts[mid]:
        src = open(f'{M}/{path}', encoding='utf-8').read()
        assert src.count(old) == 1, (mid, src.count(old))
        open(f'{M}/{path}', 'w', encoding='utf-8').write(src.replace(old, new))
    data = run()
    red = {}
    for t in data['testResults']:
        name = t['name'].rsplit('/', 1)[-1]
        for a in t['assertionResults']:
            if a['status'] == 'failed':
                red.setdefault(name, []).append(a['title'][:60])
    results[mid] = {'numFailed': data['numFailedTests'], 'red': red}
    print(mid, json.dumps(results[mid], ensure_ascii=False), flush=True)
sync()
data = run()
results['unmutated'] = {'numFailed': data['numFailedTests'], 'numPassed': data['numPassedTests']}
print('unmutated', results['unmutated'])
json.dump(results, open(f'{L}/a-round-95/mutation-results.json', 'w'), ensure_ascii=False, indent=1)
