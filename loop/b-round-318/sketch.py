import re,sys
root=sys.argv[1]
def sub(path, old, new, count=1):
    p=root+'/'+path; s=open(p).read()
    assert s.count(old)>=1, (path, old[:60])
    s=s.replace(old,new,count); open(p,'w').write(s)
# clip overlay subscriber
C='app/components/arrangement/ArrangementClip.tsx'
sub(C,"  const range = useArrangementRange((state) => selectArrangementClipRange(state.range, clip));\n","")
sub(C,"  const rangeLeft = range ? (range.start - clip.start) * pxPerSecond : 0;\n  const rangeWidth = range ? (range.end - range.start) * pxPerSecond : 0;\n","")
p=root+'/'+C; s=open(p).read()
i=s.index("          {range ? (\n            <div\n              className=\"pointer-events-none absolute inset-y-0 border-x-2")
j=s.index("          ) : null}\n",i)+len("          ) : null}\n")
block=s[i:j]
s=s[:i]+"          <ArrangementClipRangeOverlay clip={clip} pxPerSecond={pxPerSecond} />\n"+s[j:]
inner=block.replace("          {range ? (\n","").rsplit("          ) : null}\n",1)[0]
comp=("function ArrangementClipRangeOverlay({ clip, pxPerSecond }: { clip: ArrangementClip; pxPerSecond: number }) {\n"
"  const range = useArrangementRange((state) => selectArrangementClipRange(state.range, clip));\n"
"  if (!range) {\n    return null;\n  }\n"
"  const rangeLeft = (range.start - clip.start) * pxPerSecond;\n  const rangeWidth = (range.end - range.start) * pxPerSecond;\n"
"  return (\n"+inner+"  );\n}\n\n")
k=s.index("function ArrangementClipViewInner(")
s=s[:k]+comp+s[k:]
open(p,'w').write(s)
# workspace wrappers memo
W='app/components/arrangement/StudioWorkspace.tsx'
sub(W,"function ArrangementRangeReadout() {","const ArrangementRangeReadout = memo(function ArrangementRangeReadout() {")
p=root+'/'+W; s=open(p).read()
i=s.index("const ArrangementRangeReadout = memo(")
j=s.index("\nfunction ArrangementRangeDetailPanel",i)
seg=s[i:j]; seg=seg.rstrip()
assert seg.endswith("}")
seg=seg[:-1]+"});\n"
s=s[:i]+seg+s[j:]
s=s.replace("function ArrangementRangeDetailPanel(props: Omit<ArrangementDetailPanelProps, 'range'>) {\n  const range = useArrangementRange((state) => state.range);\n  return <ArrangementDetailPanel {...props} range={range} />;\n}",
"const ArrangementRangeDetailPanel = memo(function ArrangementRangeDetailPanel(props: Omit<ArrangementDetailPanelProps, 'range'>) {\n  const range = useArrangementRange((state) => state.range);\n  return <ArrangementDetailPanel {...props} range={range} />;\n});")
open(p,'w').write(s)
