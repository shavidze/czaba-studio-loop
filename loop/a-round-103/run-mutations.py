import json, shutil, subprocess
L='/home/runner/czaba-project/tmp/studio-real-loop'
A=f'{L}/a-round-103'; M=f'{A}/mut'; S='/home/runner/czaba-project/store'
SNAP=f'{L}/b-round-102-r103-snapshots'
C='app/lib/arrangement/export-wav.client.ts'
T='app/lib/arrangement/__tests__/export-wav.test.ts'
CU='app/lib/arrangement/__tests__/export-cancel-ui.test.tsx'
CTX='app/contexts/ArrangementContext.tsx'
for f in (C,T,CU,'app/lib/arrangement/__tests__/export-progress-ui.test.tsx',CTX):
    shutil.copy(f'{S}/{f}', f'{M}/{f}')
muts={
 'm1-no-timer':(C,[("      stallTimer = window.setTimeout(handleStall, ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS);\n","")]),
 'm2-progress-no-restart':(C,[("        armStallTimer();\n        onProgress","        onProgress")]),
 'm3-complete-no-clear':(C,[("      if (message.type === 'complete') {\n        detachWorker();\n","      if (message.type === 'complete') {\n        signal?.removeEventListener('abort', handleAbort);\n        worker.terminate();\n")]),
 'm4-abort-no-clear':(C,[("    const handleAbort = () => {\n      detachWorker();\n","    const handleAbort = () => {\n      signal?.removeEventListener('abort', handleAbort);\n      worker.onmessage = null;\n      worker.onerror = null;\n      worker.onmessageerror = null;\n      worker.terminate();\n")]),
 'm5-drop-error-text':(C,[("      fail(message.message);\n","      fail();\n")]),
 'm6-no-predownload-abort-check':(CTX,[("        signal.removeEventListener('abort', resetEncoderOnAbort);\n        if (signal.aborted) {\n          return;\n        }\n        try {\n          const { fileStem }","        signal.removeEventListener('abort', resetEncoderOnAbort);\n        try {\n          const { fileStem }")]),
 'm7-cu10-cancel-before-race-settles(test-side diagnostic)':(CU,[("      encode.finish(mp3Blob);\n      await Promise.resolve();\n      expect(abortRemovals)","      encode.finish(mp3Blob);\n      expect(abortRemovals)")]),
 'm8-late-progress-not-detached(fail keeps handlers)':(C,[("    const fail = (workerMessage?: string) => {\n      detachWorker();\n","    const fail = (workerMessage?: string) => {\n      window.clearTimeout(stallTimer);\n      signal?.removeEventListener('abort', handleAbort);\n      worker.terminate();\n")]),
}
def run(files):
    r=subprocess.run(['npx','vitest','run','--reporter=json',*files],cwd=M,capture_output=True,text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(d):
    out={}
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status']=='failed':
                out[a['title'][:60]]=(a.get('failureMessages') or [''])[0].split('\n')[0][:200]
        if not t['assertionResults'] and t.get('message'): out['FILE']=t['message'][:200]
    return out
res={}
shutil.copy(f'{SNAP}/export-wav.client.ts', f'{M}/{C}')
d=run([T]); res['fail-before (snapshot b56ca58e + extended test)']={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
print('fail-before',d['numFailedTests'],d['numPassedTests'],list(reds(d)),flush=True)
shutil.copy(f'{S}/{C}', f'{M}/{C}')
for mid,(f,edits) in muts.items():
    src=open(f'{S}/{f}',encoding='utf-8').read()
    for old,new in edits:
        assert src.count(old)==1,(mid,src.count(old)); src=src.replace(old,new)
    open(f'{M}/{f}','w',encoding='utf-8').write(src)
    runs=3 if mid.startswith('m6') else 1
    for i in range(runs):
        d=run([CU] if mid.startswith(('m6','m7')) else [T])
        res[f'{mid}#{i+1}']={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
        print(mid,i+1,d['numFailedTests'],d['numPassedTests'],list(reds(d)),flush=True)
    shutil.copy(f'{S}/{f}', f'{M}/{f}')
for i in range(3):
    d=run([T,CU]); res[f'unmutated#{i+1}']={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
    print('unmutated',i+1,d['numFailedTests'],d['numPassedTests'],flush=True)
json.dump(res,open(f'{A}/mutation-results.json','w'),ensure_ascii=False,indent=1)
