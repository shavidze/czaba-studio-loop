import re,sys,os,json
root=sys.argv[1]
EXCL=('components/arrangement/','components/studio/','__tests__','components/ui/')
OPEN=re.compile(r'<(button|Link|NavLink|a|motion\.(?:button|a))(?=[\s>/])')
PAD=re.compile(r'(?<![\w-])(?:[a-z-]+:)*p[xytblr]?-(?:\d|\[)')
RND=re.compile(r'(?<![\w-])(?:[a-z-]+:)*rounded(?:-[\w\[\]]+)?(?![\w/-])')
SOLID=re.compile(r'(?<![\w:/-])bg-brand(?![\w/-])')
def tag_end(src,i):
    depth=0;q=None;j=i
    while j<len(src):
        c=src[j]
        if q:
            if c=='\\': j+=2; continue
            if c==q: q=None
        elif c in '"\'`': q=c
        elif c=='{': depth+=1
        elif c=='}': depth-=1
        elif c=='>' and depth==0: return j
        j+=1
    return len(src)
out=[]
for dp,dn,fn in os.walk(os.path.join(root,'app')):
  for f in sorted(fn):
    if not f.endswith('.tsx'): continue
    p=os.path.join(dp,f); rel=os.path.relpath(p,root)
    if any(e in rel for e in EXCL): continue
    src=open(p,encoding='utf-8').read()
    for m in OPEN.finditer(src):
        e=tag_end(src,m.end()); tag=src[m.start():e+1]
        cm=re.search(r'className=',tag)
        if not cm: continue
        cls=tag[cm.end():]
        if PAD.search(cls) and RND.search(cls) and not SOLID.search(cls):
            ln=src.count('\n',0,m.start())+1
            out.append({'file':rel,'line':ln,'tag':m.group(1),'text':' '.join(tag.split())[:260]})
json.dump(out,open(sys.argv[2],'w'),indent=1)
from collections import Counter
c=Counter(o['file'] for o in out)
print(len(out),'hits; files',len(c))
for k,v in c.most_common(): print(v,k)
