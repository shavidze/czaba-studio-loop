import re,sys
root='/home/runner/czaba-project/czaba-tag-manager/'
files={'MetadataPanel.tsx':'src/renderer/src/components/metadata-editor/MetadataPanel.tsx','App.tsx':'src/renderer/src/App.tsx'}
src={k:open(root+v).read().split('\n') for k,v in files.items()}
doc=open(root+'docs/bugs/001-save-and-selection-known-limits.md').read().split('\n')
pat=re.compile(r'([A-Za-z\-]+\.tsx?)?:(\d+)(?:-(\d+))?`')
for i,l in enumerate(doc,1):
    cur=None
    for m in re.finditer(r'`([^`]*?)([A-Za-z\-]+\.tsx?)?:(\d+)(?:-(\d+))?`',l):
        if m.group(2): cur=m.group(2)
        if cur in src:
            a=int(m.group(3)); b=int(m.group(4) or a)
            print(f"doc{i} {cur}:{a}-{b} | {src[cur][a-1].strip()[:90]}" + (f" .. {src[cur][b-1].strip()[:50]}" if b!=a else ''))
