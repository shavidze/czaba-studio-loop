import re, sys, colorsys, os
# usage: hue-scan.py <root> [<root>...]  -> prints file:line: literal hue sat class
HEX=re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b')
RGB=re.compile(r'rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})')
HSL=re.compile(r'hsla?\(\s*(\d{1,3}(?:\.\d+)?)(?:deg)?\s*[, ]\s*(\d{1,3}(?:\.\d+)?)%')
WORD=re.compile(r'\b(teal|cyan|turquoise|orange)\b|\b(bg|text|border|ring|from|to|via|shadow|fill|stroke)-(teal|cyan)-\d', re.I)
def cls(h,s):
    if s<0.25: return None
    if 160<=h<=200: return 'TEAL'
    if 25<=h<45 and s>=0.7: return 'ORANGE'
    return None
def hexrgb(x):
    if len(x) in (3,4): x=''.join(c*2 for c in x[:3])
    return tuple(int(x[i:i+2],16) for i in (0,2,4))
def hs(r,g,b):
    h,l,s=colorsys.rgb_to_hls(r/255,g/255,b/255); return h*360,s
out=[]
for root in sys.argv[1:]:
    for dp,dn,fn in os.walk(root):
        dn[:]=[d for d in dn if d not in('node_modules','.git','build','.cache')]
        for f in fn:
            p=os.path.join(dp,f)
            try: lines=open(p,encoding='utf-8').read().split('\n')
            except Exception: continue
            for i,l in enumerate(lines,1):
                hits=[]
                for m in HEX.finditer(l):
                    h,s=hs(*hexrgb(m.group(1)))
                    c=cls(h,s)
                    if c: hits.append(f'{m.group(0)}:{c}')
                for m in RGB.finditer(l):
                    r,g,b=map(int,m.groups())
                    if max(r,g,b)<=255:
                        h,s=hs(r,g,b); c=cls(h,s)
                        if c: hits.append(f'{m.group(0)}:{c}')
                for m in HSL.finditer(l):
                    c=cls(float(m.group(1)),float(m.group(2))/100)
                    if c: hits.append(f'{m.group(0)}:{c}')
                for m in WORD.finditer(l):
                    hits.append(f'{m.group(0)}:WORD')
                if hits: out.append(f'{p}:{i}: '+' | '.join(hits))
print('\n'.join(out)); print(f'TOTAL {len(out)}', file=sys.stderr)
