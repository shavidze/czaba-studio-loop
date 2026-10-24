import re,sys
txt=open(sys.argv[1],encoding='utf8').read().split('\n')
minus=[l[1:] for l in txt if l.startswith('-') and not l.startswith('---')]
plus=[l[1:] for l in txt if l.startswith('+') and not l.startswith('+++')]
geo=re.compile('[Ⴀ-ჿ]')
def skel(s):
    s=re.sub(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|`(?:[^`\\]|\\.)*`","STR",s)
    return re.sub(r'\s+','',s)
print('minus',len(minus),'plus',len(plus))
print('minus without georgian',[m for m in minus if not geo.search(m)][:20])
ms=''.join(skel(m) for m in minus); ps=''.join(skel(p) for p in plus)
print('skeleton equal (joined)', ms==ps)
for p in plus:
    g=geo.findall(p)
    if g:
        print('PLUS GEO:',p.strip()[:140])
print('it( in diff', [l for l in minus+plus if re.match(r'\s*it(\.each)?\(',l)])
for k in ['^=','$=','[title=']:
    print(k, sum(m.count(k) for m in minus), sum(p.count(k) for p in plus))
for k in ['toBe(','toEqual(','toContain(','toMatch(','toHaveAttribute(']:
    print(k, sum(m.count(k) for m in minus), sum(p.count(k) for p in plus))
