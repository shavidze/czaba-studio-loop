import sys
name=sys.argv[1]
ctx='app/contexts/ArrangementContext.tsx'; sw='app/components/arrangement/StudioWorkspace.tsx'; pbs='app/lib/arrangement/playback-start.ts'
def sub(path, old, new):
    s=open(path,encoding='utf-8').read()
    assert s.count(old)==1, (name, path, old[:60], s.count(old))
    open(path,'w',encoding='utf-8').write(s.replace(old,new))
R="""      if (gestureCountRef.current === 0) {
        setStatus(rewriteStoppedTruth);
      }"""
P_COND="""        insertMarkerStatusKind(text) === 'stopped'
          ? studioPlaybackStrings.playingFrom(formatArrangementTime(from))"""
if name=='M-NO-R':
    sub(ctx,R,"")
elif name=='M-R-NO-GUARD':
    sub(ctx,R,"""      setStatus(rewriteStoppedTruth);""")
elif name=='M-NO-G':
    sub(ctx,"rewriteStoppedTruth(statusAfterGestureRelease(current, lastNonRefusalStatusRef.current)),","statusAfterGestureRelease(current, lastNonRefusalStatusRef.current),")
elif name=='M-NO-P':
    sub(ctx,"""      setStatus((text) =>
"""+P_COND+"""
          : text,
      );
""","")
elif name=='M-P-ALWAYS':
    sub(ctx,P_COND,"""        text === text
          ? studioPlaybackStrings.playingFrom(formatArrangementTime(from))""")
elif name=='M-NO-KIND-FROM':
    sub(pbs,"""  if (text === studioPlaybackStrings.playingFrom(first)) {
    return 'playing-from';
  }
""","")
elif name=='M-NO-SEL-PASTEND':
    sub(pbs,"""    studioPlaybackStrings.startPointInsertMarker,
    studioPlaybackStrings.startPointSelection,
  ];""","""    studioPlaybackStrings.startPointInsertMarker,
  ];""")
elif name=='M-SNAPSHOT':
    sub(ctx,"""      insertMarkerStore.setPosition(next);
      setStatus((text) => {""","""      insertMarkerStore.setPosition(next);
      const playingAtWrite = isPlayingRef.current;
      setStatus((text) => {""")
    sub(ctx,"""        if (isPlayingRef.current) {
          return studioPlaybackStrings.insertMarkerWhilePlaying(time);
        }
        return describeSpaceStart();""","""        if (playingAtWrite) {
          return studioPlaybackStrings.insertMarkerWhilePlaying(time);
        }
        return describeSpaceStart();""")
elif name=='M-STOP-EXACT':
    sub(sw,"""      if (
        insertMarkerStatusKind(current.status) !== null ||
        current.status === FOLLOW_PAUSED_MESSAGE
      ) {""","""      const marker = formatArrangementTime(Math.max(0, current.getLocatorPosition()));
      if (
        current.status === studioPlaybackStrings.insertMarkerWhilePlaying(marker) ||
        current.status === studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(marker) ||
        current.status === FOLLOW_PAUSED_MESSAGE
      ) {""")
elif name=='M-C-R-ANYTEXT':
    sub(ctx,"""      !isPlayingRef.current && insertMarkerStatusKind(text) === 'stopped'""","""      !isPlayingRef.current""")
else:
    raise SystemExit('unknown '+name)
