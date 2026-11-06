import sys
root=sys.argv[1]
def edit(path, pairs):
    p=root+'/'+path; s=open(p).read()
    for old,new,cnt in pairs:
        n=s.count(old); assert n==cnt,(path,old[:70],n); s=s.replace(old,new)
    open(p,'w').write(s)
edit('app/components/arrangement/ArrangementMarkerRow.tsx',[("      seekTo,\n      setStatus,\n      status,\n","      seekTo,\n      setStatus,\n      getStatus,\n",1)])
edit('app/lib/arrangement/__tests__/helpers/workspace-probe.ts',[
("  useArrangementIsPlaying,\n} from '~/contexts/ArrangementContext';","  useArrangementIsPlaying,\n  useArrangementStatusPreview,\n} from '~/contexts/ArrangementContext';",1),
("""  const { status, statusSequence, statusKey } = useArrangement();
  return { status, statusSequence, statusKey };""","""  const committed = useArrangementStatusPreview((state) => state.committed);
  return { status: committed.text, statusSequence: committed.sequence, statusKey: committed.key };""",1),
])
