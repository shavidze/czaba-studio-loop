import re,sys,os,subprocess,json
store=sys.argv[1]
css=open(os.path.join(store,'app/styles/app.css')).read().split('\n')
pat=re.compile(r'#13[dD]9[cC][cC]|19, ?217, ?204|hsl\(17[0-9]|teal|glow|gradient-text|blur\(|--gradient-|--shadow-glow|crystal-|premium-')
# find enclosing rule (selector line) for each hit, outside obsidian block
OBS=next(i for i,l in enumerate(css) if l.startswith('[data-studio-theme="obsidian"]'))
res={}
for i,l in enumerate(css):
    if i>=OBS: break
    if not pat.search(l): continue
    # walk back to the selector line (line ending with '{' at depth start)
    depth=0;j=i
    sel=None
    while j>=0:
        s=css[j]
        depth+=s.count('}')-s.count('{') if j!=i else 0
        if '{' in s and depth<0 or (j!=i and '{' in s and depth<=-1):
            sel=s.strip(); 
            # if inside @keyframes/@media look further? keep innermost
            break
        j-=1
    res.setdefault((j+1,sel),[]).append(i+1)
src=subprocess.run(['bash','-c',f'cd {store} && cat $(git ls-files "app/**/*.tsx" "app/**/*.ts" "app/*.tsx" | grep -v __tests__)'],capture_output=True,text=True).stdout
out=[]
for (ln,sel),hits in sorted(res.items()):
    classes=re.findall(r'\.([a-zA-Z][\w-]*)',sel or '')
    used={c:len(re.findall(r'(?<![\w-])'+re.escape(c)+r'(?![\w-])',src)) for c in classes}
    toks=re.findall(r'--([\w-]+)\s*:',css[hits[0]-1])
    tokuse={}
    for t in toks:
        name=t
        tw=re.sub(r'^(color|shadow|gradient)-','',t)
        tokuse[t]={'var':len(re.findall(r'var\(--'+re.escape(t)+r'\)', '\n'.join(css)+src)),'tw':len(re.findall(r'(?<![\w-])[\w:]*-'+re.escape(tw)+r'(?![\w-])',src)) if t.startswith(('color-','shadow-')) else None}
    out.append({'selLine':ln,'sel':sel,'hits':hits,'classUse':used,'tokens':tokuse})
json.dump(out,open(sys.argv[2],'w'),indent=1)
for o in out: print(o['selLine'],(o['sel'] or '')[:60],o['hits'][:4],o['classUse'] or o['tokens'])
