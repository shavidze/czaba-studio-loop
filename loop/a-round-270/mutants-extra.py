import subprocess,re
P='app/components/arrangement/ArrangementDetailPanel.tsx'
T='app/lib/arrangement/__tests__/detail-panel-polish.test.tsx'
a="""          range.allTracks ? studioEditStrings.allTracks : selection.laneName,
        ),
      );
      return;"""
M={'M-SET-EQUAL':a.replace("      return;","      setTimeRange({ ...range });\n      return;"),
   'M-NO-STATUS':None}
orig=open(P).read(); assert orig.count(a)==1
for n,b in M.items():
    if b is None:
        blk=orig[orig.index("      setStatus(\n        detailRangeAppliedMessage(\n          range,"):]
        blk=blk[:blk.index("      return;")]
        s=orig.replace(blk,"",1)
    else: s=orig.replace(a,b)
    open(P,'w').write(s)
    try:
        r=subprocess.run(['npx','vitest','run','--reporter=verbose',T],capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        print('==',n,[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')])
        for x in sorted(set(re.findall(r'^\s*[×✗] .*?> ([^>]+?)(?: \d+ms)?$',out,re.M))): print('   RED:',x[:100])
    finally: open(P,'w').write(orig)
