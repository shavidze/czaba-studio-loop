import os,re,sys,json,collections
root=sys.argv[1]
STUDIO=('app/components/arrangement/','app/lib/arrangement/','app/routes/studio-lab.tsx')
PROTECTED={'app/routes/studio.$productId.tsx','app/routes/api.studio-token.ts','app/lib/auth.ts','app/contexts/AuthContext.tsx'}
tok=re.compile(r'(?<![\w-])((?:[a-z-]+:)*(?:focus|focus-visible|focus-within|peer-focus|peer-focus-visible|group-focus|group-focus-visible|has-\[:focus-visible\]):[^\s"\'`}]+|(?:[a-z-]+:)*(?:ring-offset|ring|outline)(?:-[^\s"\'`}]+)?)(?=[\s"\'`}]|$)')
rows=[];files=collections.Counter();toks=collections.Counter()
for dp,dn,fn in os.walk(os.path.join(root,'app')):
    for f in fn:
        p=os.path.relpath(os.path.join(dp,f),root)
        if not p.endswith(('.tsx','.ts')) or '__tests__' in p or p.endswith('.test.ts') or p.endswith('.test.tsx'): continue
        area='studio' if p.startswith(STUDIO) else ('protected' if p in PROTECTED else 'store')
        for i,l in enumerate(open(os.path.join(root,p),encoding='utf-8'),1):
            for m in tok.finditer(l):
                t=m.group(1)
                if re.fullmatch(r'outline|ring',t): pass
                rows.append((area,p,i,t)); files[(area,p)]+=1; toks[(area,t)]+=1
out={'files':{f'{a}|{p}':c for (a,p),c in sorted(files.items())},'tokens':{f'{a}|{t}':c for (a,t),c in toks.most_common()}}
by=collections.Counter(a for a,_,_,_ in rows)
print('per area tokens:',dict(by)); print('per area files:',dict(collections.Counter(a for (a,p) in files)))
json.dump(out,open(sys.argv[2],'w'),indent=1)
with open(sys.argv[3],'w') as w:
    for r in rows: w.write('\t'.join(map(str,r))+'\n')
