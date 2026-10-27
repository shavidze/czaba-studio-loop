import os,re,sys,json
root=sys.argv[1]
STUDIO=('app/components/arrangement/','app/lib/arrangement/','app/routes/studio-lab.tsx')
hid=re.compile(r'(?<![\w:-])(?:md:|lg:|sm:)?(opacity-0|invisible|sr-only)(?![\w-])')
foc=re.compile(r'<(button|Button|IconButton|Link|NavLink|a\s|input|select|textarea|AudioPreviewButton|summary)\b|tabIndex=\{0\}')
rows=[]
for dp,dn,fn in os.walk(os.path.join(root,'app')):
    for f in fn:
        p=os.path.relpath(os.path.join(dp,f),root)
        if not p.endswith('.tsx') or '__tests__' in p or '.test.' in p or p.startswith(STUDIO): continue
        L=open(os.path.join(root,p),encoding='utf-8').read().split('\n')
        for i,l in enumerate(L):
            m=hid.search(l)
            if not m: continue
            ind=len(l)-len(l.lstrip())
            sub=[l]
            for j in range(i+1,min(i+40,len(L))):
                lj=L[j]
                if lj.strip() and (len(lj)-len(lj.lstrip()))<=ind and not lj.strip().startswith(('className','style','aria','onC','onM','role','id=','>','/>')): break
                sub.append(lj)
            k=i
            while k>0 and not re.search(r'<\w',L[k]) and i-k<15: k-=1
            opener=L[k] if re.search(r'<\w',L[k]) else ''
            block='\n'.join(L[k:i])+'\n'+'\n'.join(sub)
            f_hits=foc.findall(block)
            neg='tabIndex={-1}' in block
            reveal=bool(re.search(r'focus-within:(opacity-100|visible)|focus:(opacity-100|not-sr-only)|focus-visible:(opacity-100|not-sr-only)',l))
            if f_hits: rows.append({'file':p,'line':i+1,'token':m.group(0),'focusables':len(f_hits),'has_tabindex_minus1':neg,'focus_reveal_on_line':reveal,'text':l.strip()[:160]})
json.dump(rows,open(sys.argv[2],'w'),indent=1)
for r in rows: print(f"{r['file']}:{r['line']} {r['token']} focusables={r['focusables']} tabIndex-1={r['has_tabindex_minus1']} reveal={r['focus_reveal_on_line']}")
