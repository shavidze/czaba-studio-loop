import subprocess, json, re, shutil, sys
M='/home/runner/czaba-project/tmp/studio-real-loop/c-round-109/mut'
OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-109/out'
F=M+'/app/lib/ssr/strip-nul-bytes.server.ts'
E_=M+'/app/entry.server.tsx'
orig=open(F).read(); origE=open(E_).read()
T='app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts'
def run(name):
    r=subprocess.run(['npx','vitest','run',T,'--reporter=json','--outputFile='+OUT+'/mut109-'+name+'.json'],cwd=M,capture_output=True,text=True,timeout=300)
    d=json.load(open(OUT+'/mut109-'+name+'.json'))
    red=[a['title'].split(':')[0] for t in d['testResults'] for a in t['assertionResults'] if a['status']!='passed']
    return {'name':name,'red':red,'total':d['numTotalTests'],'failed':d['numFailedTests']}
# m1 C: transform pushes chunk untouched (callback(null, chunk))
m1=orig.replace('const stripped = stripNulBytes(chunk);','const stripped = chunk;')
# m2 C: per-chunk decode/replace/re-encode in the stream
m2=orig.replace('const stripped = stripNulBytes(chunk);',"const stripped = Buffer.from(chunk.toString('utf8').split(String.fromCharCode(0)).join(''), 'utf8');")
# m3 C: only first NUL per chunk removed
m3=orig.replace('''  const stripped = Buffer.alloc(chunk.length - nulCount);''','''  return Buffer.concat([chunk.subarray(0, firstNul), chunk.subarray(firstNul + 1)]);
  const stripped = Buffer.alloc(chunk.length - nulCount);''')
# m4 C: entry back to PassThrough
m4E=origE.replace("import { createNulByteStripStream } from '~/lib/ssr/strip-nul-bytes.server';","import { PassThrough } from 'node:stream';").replace('createNulByteStripStream()','new PassThrough()')
res=[]
for m in (m1,m2,m3): assert m!=orig
assert m4E!=origE
res.append(run('control1'))
for n,src in (('m1',m1),('m2',m2),('m3',m3)):
    open(F,'w').write(src); res.append(run(n)); open(F,'w').write(orig)
open(E_,'w').write(m4E); res.append(run('m4')); open(E_,'w').write(origE)
res.append(run('control2'))
json.dump(res,open(OUT+'/mut109-summary.json','w'),indent=1); print(json.dumps(res,indent=1))
