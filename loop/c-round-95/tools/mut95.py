# C's own mutations (a, b, f) + control + fail-before against B's baseline snapshot. Scratch only.
import json, shutil, subprocess, sys, re
L='/home/runner/czaba-project/tmp/studio-real-loop'; M=f'{L}/c-round-95/mut'; S='/home/runner/czaba-project/store'
DEMO='app/data/studio-lab-demo.ts'; NEW='app/data/__tests__/studio-lab-demo.test.ts'
tests=[x.strip() for x in open(f'{L}/a-round-95/targeted-list.txt') if x.strip()]
def run(files):
    r=subprocess.run(['npx','vitest','run','--reporter=json',*files],cwd=M,capture_output=True,text=True)
    d=json.loads(r.stdout[r.stdout.find('{'):]); red=[]
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status']=='failed': red.append(t['name'].rsplit('/',1)[-1]+' :: '+a['title'])
    return {'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':red}
def mutate(fn):
    shutil.copy(f'{S}/{DEMO}',f'{M}/{DEMO}'); shutil.copy(f'{S}/{NEW}',f'{M}/{NEW}')
    src=open(f'{M}/{DEMO}',encoding='utf-8').read(); out=fn(src); assert out!=src; open(f'{M}/{DEMO}','w',encoding='utf-8').write(out)
def mut_a(s):  # remove the fetch try/catch
    s2,n=re.subn(r"let response: Response;\n\s*try \{\n\s*response = (await fetch\(url, \{ credentials: 'omit', signal \}\));\n\s*\} catch \(error\) \{\n\s*if \(signal\.aborted\) \{\n\s*throw error;\n\s*\}\n\s*throw new Error\('[^']*'\);\n\s*\}", r"const response = \1;", s); assert n==1; return s2
def mut_b(s):  # drop abort rethrow in the FIRST (fetch) catch only
    i=s.index("response = await fetch"); j=s.index("if (signal.aborted) {",i); k=s.index("}",j)+1
    return s[:j]+s[k:]
def mut_f(s):  # one char change in the network text (first occurrence = fetch catch)
    return s.replace("(ქსელი)","(ქსელo)",1)
res={}
for k,fn in (('a',mut_a),('b',mut_b),('f',mut_f)):
    mutate(fn); res[k]=run(tests); print(k,json.dumps(res[k],ensure_ascii=False),flush=True)
shutil.copy(f'{S}/{DEMO}',f'{M}/{DEMO}'); res['control']=run(tests); print('control',res['control'])
shutil.copy(f'{L}/b-round-94-r95-snapshots/studio-lab-demo.ts',f'{M}/{DEMO}'); res['failBefore']=run([NEW]); print('failBefore',json.dumps(res['failBefore'],ensure_ascii=False))
shutil.copy(f'{S}/{DEMO}',f'{M}/{DEMO}')
json.dump(res,open(f'{L}/c-round-95/mutation-results.json','w'),ensure_ascii=False,indent=1)
