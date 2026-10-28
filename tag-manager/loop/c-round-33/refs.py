import re,sys
root=sys.argv[1]
F={'MetadataPanel.tsx':root+'/src/renderer/src/components/metadata-editor/MetadataPanel.tsx'}
src={k:open(v).read().split('\n') for k,v in F.items()}
doc=open(root+'/docs/bugs/001-save-and-selection-known-limits.md').read().split('\n')
tok=re.compile(r'([A-Za-z\-]+\.(?:tsx?|md|json))?:(\d+)(?:-(\d+))?')
for ln,line in enumerate(doc,1):
    cur=None
    for m in tok.finditer(line):
        if m.group(1): cur=m.group(1)
        if cur is None: print(f'L{ln} BARE-NOFILE :{m.group(2)}'); continue
        if cur in src:
            a=int(m.group(2)); b=int(m.group(3) or a)
            if a-1>=len(src[cur]): print(f'L{ln} {cur}:{a} OUT OF RANGE'); continue
            first=src[cur][a-1].strip()[:90]; last=src[cur][b-1].strip()[:60] if b!=a else ''
            ctx=line[max(0,m.start()-60):m.start()]
            print(f'{cur} || {first}{" … "+last if last else ""} || ctx…{ctx[-60:]}')
        else:
            print(f'OTHER {cur}:{m.group(2)}{"-"+m.group(3) if m.group(3) else ""}')
