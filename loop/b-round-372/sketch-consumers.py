import sys
root=sys.argv[1]
def edit(path, pairs):
    p=root+'/'+path; s=open(p).read()
    for old,new,cnt in pairs:
        n=s.count(old); assert n==cnt,(path,old[:70],n); s=s.replace(old,new)
    open(p,'w').write(s)
edit('app/contexts/ArrangementContext.tsx',[("  useReducer,\n","",1)])
edit('app/components/arrangement/StudioWorkspace.tsx',[
("""function ArrangementStatusTextInner({ status, statusKey }: { status: string; statusKey: string }) {
  const preview = useArrangementStatusPreview((state) => state.preview);
  return preview ? (
    <span key={statusPreviewKey(preview)}>{preview.text}</span>
  ) : (
    <span key={statusKey}>{status}</span>
  );
}""","""function ArrangementStatusTextInner() {
  const preview = useArrangementStatusPreview((state) => state.preview);
  const committed = useArrangementStatusPreview((state) => state.committed);
  return preview ? (
    <span key={statusPreviewKey(preview)}>{preview.text}</span>
  ) : (
    <span key={committed.key}>{committed.text}</span>
  );
}""",1),
("""    pxPerSecond,
    status,
    statusKey,
    setInsertMarker,""","""    pxPerSecond,
    setInsertMarker,""",1),
("const shownStatus = previewText ?? current.status;","const shownStatus = previewText ?? current.getStatus();",1),
("(current.getStatusPreviewText() ?? current.status) !== NUDGE_AT_TIME_START_MESSAGE","(current.getStatusPreviewText() ?? current.getStatus()) !== NUDGE_AT_TIME_START_MESSAGE",1),
("<ArrangementStatusText status={status} statusKey={statusKey} />","<ArrangementStatusText />",1),
])
edit('app/components/arrangement/ArrangementMarkerRow.tsx',[
("    status,\n    setStatus,\n    getStatusPreviewText,","    setStatus,\n    getStatusPreviewText,\n    getStatus,",1),
("(getStatusPreviewText() ?? status)","(getStatusPreviewText() ?? getStatus())",3),
])
