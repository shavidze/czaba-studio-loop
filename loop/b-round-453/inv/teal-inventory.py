import re,os,sys,subprocess
root=sys.argv[1]
css=open(os.path.join(root,'app/styles/app.css')).read()
lines=css.split('\n')
teal=re.compile(r'19,\s*217,\s*204|hsl\(\s*17[0-9]|#13d9cc|#14b8a6|teal|--gradient-primary|--color-accent-rgb|0 0 \d+px',re.I)
# track selector by brace stack
stack=[];sel_start=0;buf=''
results=[]
cur=''
depth_sels=[]
text=''
for i,l in enumerate(lines,1):
    s=l
    if '{' in s:
        pre=s.split('{')[0].strip()
        depth_sels.append(pre if pre else (text.strip()))
        text=''
    elif '}' not in s and ';' not in s and not s.strip().startswith('/*'):
        text+=' '+s.strip()
    if teal.search(s) and depth_sels:
        results.append((i,' > '.join(depth_sels[-2:]) if depth_sels[-1].startswith(('0%','50%','100%','from','to')) else depth_sels[-1],s.strip()[:70]))
    for _ in range(s.count('}')):
        if depth_sels: depth_sels.pop()
# classes per selector
tsx=subprocess.run(['git','-C',root,'ls-files','app'],capture_output=True,text=True).stdout.split()
tsx=[f for f in tsx if f.endswith(('.tsx','.ts')) and '__tests__' not in f]
src={f:open(os.path.join(root,f)).read() for f in tsx}
seen={}
for i,sel,txt in results:
    classes=set(re.findall(r'\.([a-zA-Z][\w-]*)',sel))
    kf=re.findall(r'@keyframes\s+([\w-]+)',sel)
    names=classes|set(kf)
    cons={}
    for n in names:
        hits=[f for f,c in src.items() if re.search(r'(?<![\w-])'+re.escape(n)+r'(?![\w-])',c)]
        cons[n]=hits
    print(f"{i}\t{sel[:80]}\t{txt}\t"+'; '.join(f"{n}:{','.join(h) or '-'}" for n,h in cons.items()))
