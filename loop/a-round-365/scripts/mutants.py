import subprocess, sys, shutil, hashlib, os
STORE='/home/runner/czaba-project/store'
A='/home/runner/czaba-project/tmp/studio-real-loop/a-round-365'
P=A+'/pristine'
C='app/lib/arrangement/stem-cache.client.ts'
S='app/lib/arrangement/stem-cache.ts'
COL='app/lib/arrangement/collection.ts'
FILES={'source-fetch.ts':'app/lib/arrangement/source-fetch.ts','stem-cache.ts':S,'stem-cache.client.ts':C,'collection.ts':COL,'studio-lab-demo.ts':'app/data/studio-lab-demo.ts'}
M={
 'M1':(C,"      await store.touch(key, now()).catch(() => undefined);\n      return cachedResponse(entry);","      await store.touch(key, now()).catch(() => undefined);\n      return response;",'SC6'),
 'M2':(C,"      if (init.signal?.aborted) {\n        throw error;\n      }\n      return cachedResponse(entry);","      return cachedResponse(entry);",'SC8'),
 'M3':(C,"      const response = await fetchSource(url, init);\n      writeInBackground(key, response, init);","      const response = await fetchSource(url, { ...init, headers: new Headers({ 'If-None-Match': '*', 'If-Modified-Since': 'x' }) });\n      writeInBackground(key, response, init);",'SC5'),
 'M4a':(S,"  for (const record of others) {\n    if (used + incomingSize <= budget) {\n      break;\n    }\n    victims.push(record);\n    used -= record.size;\n  }\n","",'SC4'),
 'M4b':(C,"    for (const victim of victims) {\n      await activeStore.delete(victim.key);\n    }\n","",'SC4'),
 'M5':(S,"  if (etag === null && lastModified === null) {\n    return null;\n  }\n","",'SC13'),
 'M6':(C,"    if (signal?.aborted || disabled) {","    if (disabled) {",'SC12'),
 'M8':(C,"      const oldest = (await activeStore.list())\n        .filter((candidate) => candidate.key !== record.key)\n        .sort((first, second) => first.lastAccessedAt - second.lastAccessedAt)[0];\n      if (oldest !== undefined) {\n        await activeStore.delete(oldest.key);\n      }\n","",'SC11'),
 'M9':(C,"disabled || writes.has(key) || !isStorable","disabled || !isStorable",'SC17'),
 'M10':(C,"      bytes = await response.arrayBuffer();\n    } catch {\n      return;","      bytes = await response.arrayBuffer();\n    } catch {\n      disabled = true;\n      return;",'SC19'),
 'M11':(C,"    sweepPromise ??= activeStore.sweep(now()).catch(() => undefined);\n    await sweepPromise;","    if (sweepPromise === null) {\n      sweepPromise = activeStore.sweep(now()).catch(() => undefined);\n      await sweepPromise;\n    }",'SC20'),
 'M12':(C,"    if (response.ok && !isStorable(response)) {\n      await store.delete(key).catch(() => undefined);\n      return response;","    if (response.ok && !isStorable(response)) {\n      return response;",'SC21'),
 'M7b':('app/lib/arrangement/source-fetch.ts',"export type SourceFetch","export { publicPreviewSourceFetch } from './stem-cache.client';\n\nexport type SourceFetch",'SF6'),
 'M7c':('app/lib/arrangement/source-fetch.ts',"export type SourceFetch","export { publicPreviewSourceFetch } from './stem-cache.client';\n\nexport type SourceFetch",'SF6'),
 'M7':(COL,"import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';","import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';\nimport { publicPreviewSourceFetch } from './stem-cache.client';",'SF6'),
}
IMP="import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';"
DEF="  fetchAudio = (url, init) => fetch(url, init),"
def checked(c, *needles):
    for n in needles:
        assert c.count(n)==1, n
    return c
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
expected={l.split()[1]:l.split()[0] for l in open(P+'/sha256.txt')}
def restore():
    for b,f in FILES.items(): shutil.copy(P+'/'+b, STORE+'/'+f)
    for f,h in expected.items():
        assert sha(STORE+'/'+f)==h, f
ids=sys.argv[1:] or list(M)
summary=[]
for mid in ids:
    f,old,new,row=M[mid]
    src=open(STORE+'/'+f).read(); assert src.count(old)==1,(mid,src.count(old))
    if mid=='M7b':
        c=checked(open(STORE+'/'+COL).read(),IMP,DEF)
        c=c.replace("import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';","import { fetchAndDecodeSource, publicPreviewSourceFetch, type SourceFetch } from './source-fetch';").replace("  fetchAudio = (url, init) => fetch(url, init),","  fetchAudio = publicPreviewSourceFetch(),")
        open(STORE+'/'+COL,'w').write(c)
        extra='\n--- also in collection.ts: import publicPreviewSourceFetch from ./source-fetch; default fetchAudio = publicPreviewSourceFetch()\n'
    elif mid=='M7c':
        c=checked(open(STORE+'/'+COL).read(),IMP,DEF)
        c=c.replace("import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';","import { fetchAndDecodeSource, publicPreviewSourceFetch, type SourceFetch } from './source-fetch';\n\nconst purchasedImportTimeFetch = publicPreviewSourceFetch();").replace("  fetchAudio = (url, init) => fetch(url, init),","  fetchAudio = purchasedImportTimeFetch,")
        open(STORE+'/'+COL,'w').write(c)
        extra='\n--- also in collection.ts: import publicPreviewSourceFetch from ./source-fetch; const purchasedImportTimeFetch = publicPreviewSourceFetch() at module load; default fetchAudio = purchasedImportTimeFetch\n'
    else:
        extra=''
    if mid=='M7':
        checked(src,DEF)
        extra='\n--- also in collection.ts: default fetchAudio = publicPreviewSourceFetch()\n'
        src=src.replace("  fetchAudio = (url, init) => fetch(url, init),","  fetchAudio = publicPreviewSourceFetch(),")
    open(STORE+'/'+f,'w').write(src.replace(old,new))
    try:
        r=subprocess.run(['npx','vitest','run','app/lib/arrangement/__tests__/stem-cache.test.ts','app/lib/arrangement/__tests__/source-fetch.test.ts'],cwd=STORE,capture_output=True,text=True,env={**os.environ,'NO_COLOR':'1','CI':''})
        out=r.stdout+r.stderr
        open(f'{A}/mutants/mutant-{mid}.log','w').write(f'mutant {mid} in {f}, expected red row {row}\n--- old\n{old}\n--- new\n{new}\n{extra}--- vitest rc {r.returncode}\n{out}')
        fails=[l.strip() for l in out.splitlines() if ' FAIL ' in l or l.strip().startswith('×') or l.strip().startswith('✗')]
        red = r.returncode!=0 and any(f'{row} ' in l for l in out.splitlines() if ('FAIL' in l or '×' in l))
        summary.append(f'{mid} expected {row}: rc={r.returncode} red_on_row={red}')
    finally:
        restore()
print('\n'.join(summary)); print('pristine hashes verified after each mutant')
