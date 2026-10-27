import re,sys
R='/home/runner/czaba-project/czaba-tag-manager/'
F={'MetadataPanel.tsx':R+'src/renderer/src/components/metadata-editor/MetadataPanel.tsx','App.tsx':R+'src/renderer/src/App.tsx'}
src={k:open(v).read().split('\n') for k,v in F.items()}
doc=open(R+'docs/bugs/001-save-and-selection-known-limits.md').read().split('\n')
tok=re.compile(r'([A-Za-z\-]+\.(?:tsx?|md|json))?:(\d+)(?:-(\d+))?')
for ln,line in enumerate(doc,1):
    cur=None
    for m in tok.finditer(line):
        if m.group(1): cur=m.group(1)
        if cur in src:
            a=int(m.group(2)); b=int(m.group(3) or a)
            if a-1>=len(src[cur]): print(f'L{ln} {cur}:{a} OUT OF RANGE'); continue
            first=src[cur][a-1].strip()[:90]; last=src[cur][b-1].strip()[:60] if b!=a else ''
            ctx=line[max(0,m.start()-70):m.start()].replace('\n',' ')
            print(f'L{ln} {cur}:{a}{"-"+str(b) if b!=a else ""} | ctx…{ctx[-70:]} || {first}{" … "+last if last else ""}')
