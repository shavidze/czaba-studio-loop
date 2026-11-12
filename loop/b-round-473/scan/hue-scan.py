import re,sys,os,colorsys,collections
root=sys.argv[1]
exts=('.css','.tsx','.ts','.jsx','.js','.md','.html','.svg')
hexre=re.compile(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
rgbre=re.compile(r'rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})')
hslre=re.compile(r'hsla?\(\s*(\d{1,3}(?:\.\d+)?)(?:deg)?[\s,]+(\d{1,3})%?[\s,]+(\d{1,3})%?')
twre=re.compile(r'\b(?:text|bg|border|ring|from|to|via|shadow|fill|stroke|outline|decoration|accent|caret|divide)-(?:teal|cyan|emerald|sky)-\d{2,3}')
def teal(h,s,l):
    return 160<=h<=200 and s>=0.25 and 0.12<=l<=0.9
hits=collections.Counter(); lines=[]
for dp,dn,fn in os.walk(root):
    if '__tests__' in dp or 'node_modules' in dp: continue
    for f in fn:
        if not f.endswith(exts): continue
        p=os.path.join(dp,f)
        for i,ln in enumerate(open(p,errors='ignore'),1):
            found=[]
            for m in hexre.finditer(ln):
                x=m.group(1); x=''.join(c*2 for c in x) if len(x)==3 else x
                r,g,b=(int(x[k:k+2],16)/255 for k in (0,2,4))
                h,l,s=colorsys.rgb_to_hls(r,g,b)
                if teal(h*360,s,l): found.append(m.group(0))
            for m in rgbre.finditer(ln):
                r,g,b=(int(v)/255 for v in m.groups())
                h,l,s=colorsys.rgb_to_hls(r,g,b)
                if teal(h*360,s,l): found.append(m.group(0))
            for m in hslre.finditer(ln):
                h,s,l=float(m.group(1)),int(m.group(2))/100,int(m.group(3))/100
                if teal(h,s,l): found.append(m.group(0))
            found+=twre.findall(ln)
            if re.search(r'\bteal\b|\bcyan\b',ln,re.I) and not found: found.append('word:teal/cyan')
            for x in found:
                hits[os.path.relpath(p,root)]+=1; lines.append(f'{os.path.relpath(p,root)}:{i}: {x} :: {ln.strip()[:140]}')
for k,v in sorted(hits.items()): print(v,k)
print('TOTAL',sum(hits.values()))
open(sys.argv[2],'w').write('\n'.join(lines)+'\n')
