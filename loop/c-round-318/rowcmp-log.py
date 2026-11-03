import re,sys
def rows(f):
    d={}
    for l in open(f):
        m=re.match(r'^(interact\.\S+|[a-z]+\.\S+)\s+(assert|record)\s+median\s+(\S+)',l.strip())
        if m: d[m.group(1)]=float(m.group(3))
    return d
h,a=rows(sys.argv[1]),rows(sys.argv[2])
timing=re.compile(r'(ms|p95|paint|loaf|fcp|lcp|tbt|time|duration|bytes|heap)',re.I)
print('rows h',len(h),'a',len(a),'onlyH',sorted(set(h)-set(a))[:10],'onlyA',sorted(set(a)-set(h))[:10])
up=[];down=[]
for k in sorted(set(h)&set(a)):
    if timing.search(k): continue
    if a[k]>h[k]: up.append((k,h[k],a[k]))
    elif a[k]<h[k]: down.append((k,h[k],a[k]))
print('RISES',len(up)); [print(' ',*x) for x in up]
print('DROPS',len(down)); [print(' ',*x) for x in down]
