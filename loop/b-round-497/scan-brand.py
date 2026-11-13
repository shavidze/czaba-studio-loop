import re,sys,os,json
root=sys.argv[1]
EXCL=('components/arrangement/','components/studio/','__tests__')
TOK=re.compile(r'(?<![\w:/-])bg-brand(?![\w/-])')   # solid bg-brand, not variant-prefixed, no opacity
ANY=re.compile(r'bg-brand(?![\w-])')                  # any bg-brand incl. /NN and variants
TAG=re.compile(r'<([A-Za-z][\w.]*)\b')
out=[]
for dp,dn,fn in os.walk(os.path.join(root,'app')):
  for f in fn:
    if not f.endswith('.tsx'): continue
    p=os.path.join(dp,f); rel=os.path.relpath(p,root)
    if any(e in rel for e in EXCL): continue
    src=open(p,encoding='utf-8').read()
    for m in ANY.finditer(src):
      ln=src.count('\n',0,m.start())+1
      line=src.splitlines()[ln-1].strip()
      solid=bool(TOK.search(src[m.start()-1:m.end()+1].replace('\n',' '))) and src[m.end():m.end()+1]!='/'
      pre=src[max(0,m.start()-1)]
      if pre==':' : solid=False
      tags=TAG.findall(src[:m.start()])
      tag=tags[-1] if tags else '?'
      out.append({'file':rel,'line':ln,'solid':solid,'tag':tag,'text':line[:200]})
json.dump(out,open(sys.argv[2],'w'),indent=1)
print(len(out),'hits;',sum(o['solid'] for o in out),'solid')
