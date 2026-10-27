import re, subprocess, sys, json
STORE='/home/runner/czaba-project/store'
grants=[l.strip() for l in open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-201-r202-grants.txt') if l.strip()]
special={'app/styles/app.css','app/root.tsx','app/components/arrangement/StudioWorkspace.tsx','app/components/product/ProductCard.tsx','app/components/recordings/SfxVideoSync.tsx'}
TOK=re.compile(r'(?<![\w:\-\[])((?:[\w\-\[\]&]+:)*(?:focus|focus-visible|focus-within):(?:ring|ring-offset|outline|border)[\w\-/\[\].%]*|(?:[\w\-]+:)*(?:focus|focus-visible):outline-none|(?<![\w\-:])outline-none|(?:[\w\-]+:)*(?:focus|focus-visible|focus-within):ring-offset[\w\-/]*)(?![\w\-/])')
def norm(s):
    s=TOK.sub('',s)
    s=re.sub(r'\s+','',s)
    s=s.replace("''",'').replace('``','')
    s=re.sub(r",(?=[,\]\)])",'',s)
    return s
res={}
for g in grants:
    if g in special: continue
    head=subprocess.run(['git','show','5b1a2bb:'+g],cwd=STORE,capture_output=True,text=True).stdout
    tree=open(f'{STORE}/{g}').read()
    removed=TOK.findall(head); left=TOK.findall(tree)
    ok=norm(head)==norm(tree)
    res[g]={'removed':len(removed)-len(left),'leftTokens':left,'equalAfterTokenStrip':ok}
    if not ok:
        a,b=norm(head),norm(tree)
        i=next((k for k in range(min(len(a),len(b))) if a[k]!=b[k]),min(len(a),len(b)))
        res[g]['ctxHead']=a[max(0,i-80):i+80]; res[g]['ctxTree']=b[max(0,i-80):i+80]
json.dump(res,open(sys.argv[1],'w'),indent=1)
print(sum(v['removed'] for v in res.values()), 'tokens;', len(res),'files;', [k for k,v in res.items() if not v['equalAfterTokenStrip'] or v['leftTokens']])
