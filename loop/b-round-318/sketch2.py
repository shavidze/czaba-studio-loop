import sys
root=sys.argv[1]
p=root+'/app/components/arrangement/ArrangementDetailPanel.tsx'; s=open(p).read()
s=s.replace("function ArrangementDetailPlayhead({","const ArrangementDetailPlayhead = memo(function ArrangementDetailPlayhead({",1)
i=s.index("const ArrangementDetailPlayhead = memo(")
j=s.index("\nfunction ArrangementDetailWaveform",i)
seg=s[i:j].rstrip(); assert seg.endswith("}"); s=s[:i]+seg[:-1]+"});\n"+s[j:]
open(p,'w').write(s)
p=root+'/app/components/arrangement/ArrangementClip.tsx'; s=open(p).read()
s=s.replace("export function ArrangementPeakPath({","export const ArrangementPeakPath = memo(function ArrangementPeakPath({",1)
i=s.index("export const ArrangementPeakPath = memo(")
j=s.index("\nfunction ArrangementClipRangeOverlay",i)
seg=s[i:j].rstrip(); assert seg.endswith("}"); s=s[:i]+seg[:-1]+"});\n"+s[j:]
open(p,'w').write(s)
