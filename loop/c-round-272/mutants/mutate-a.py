import sys
name=sys.argv[1]
ctx='app/contexts/ArrangementContext.tsx'; sw='app/components/arrangement/StudioWorkspace.tsx'; pbs='app/lib/arrangement/playback-start.ts'
def sub(path, old, new):
    s=open(path,encoding='utf-8').read()
    assert s.count(old)==1, (name, path, old[:60], s.count(old))
    open(path,'w',encoding='utf-8').write(s.replace(old,new))
W_START="""      setStatus((text) => {
        const kind = insertMarkerStatusKind(text);"""
if name=='M-STOP-EXACT':
    sub(sw,"""      if (
        insertMarkerStatusKind(current.status) !== null ||
        current.status === FOLLOW_PAUSED_MESSAGE
      ) {""","""      const marker = formatArrangementTime(Math.max(0, current.getLocatorPosition()));
      if (
        current.status === studioPlaybackStrings.insertMarkerWhilePlaying(marker) ||
        current.status === studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(marker) ||
        current.status === FOLLOW_PAUSED_MESSAGE
      ) {""")
elif name=='M-NO-W':
    sub(ctx,W_START,"""      (() => (text: string) => {
        const kind = insertMarkerStatusKind(text);""")
    sub(ctx,"""        return describeSpaceStartRef.current();
      });""","""        return describeSpaceStartRef.current();
      })();""")
elif name=='M-W-ALWAYS-STOPPED':
    sub(ctx,"""        const time = formatArrangementTime(Math.max(0, next));
        if (kind === 'playing-follow-paused') {""","""        const time = formatArrangementTime(Math.max(0, next));
        if (kind !== null) {
          return describeSpaceStartRef.current();
        }
        if (kind === 'playing-follow-paused') {""")
elif name=='M-DESCRIBE-MARKER-ONLY':
    sub(ctx,"""    const time = formatArrangementTime(point.requested);
    if (plan.kind === 'empty') {""","""    const time = formatArrangementTime(point.requested);
    if (time.length > 0) {
      return studioPlaybackStrings.insertMarkerAfterStop(time);
    }
    if (plan.kind === 'empty') {""")
elif name=='M-PRED-COPY':
    sub(ctx,"""      if (plan.kind === 'past-end') {
        setStatus(playPastEndMessage(plan.requested, plan.end, origin));""","""      const mutantEnd = projectEnd(arrangement);
      const mutantLoop = resolveActiveLoop(arrangement.loop, current) !== null;
      const mutantEndedHere =
        playbackEndedAtRef.current !== null &&
        Math.abs(playbackEndedAtRef.current - current) < ARRANGEMENT_EPS;
      if (!mutantLoop && !mutantEndedHere && current >= mutantEnd - ARRANGEMENT_EPS) {
        setStatus(playPastEndMessage(current, mutantEnd, origin));
        return;
      }
      if (plan.kind === 'past-end') {
        setStatus(playPastEndMessage(plan.requested, plan.end, origin));""")
elif name=='M-KIND-LOOSE':
    sub(pbs,"""  const times = text.match(TIME_TOKEN) ?? [];""","""  if (text.startsWith('Insert marker')) {
    if (text.includes('Follow paused')) {
      return 'playing-follow-paused';
    }
    return text.includes('playback continues') ? 'playing' : 'stopped';
  }
  const times = text.match(TIME_TOKEN) ?? [];""")
elif name=='M-SEQ-BUMP':
    sub(ctx,W_START,"""      setStatus(((text: string) => {
        const kind = insertMarkerStatusKind(text);""")
    sub(ctx,"""        return describeSpaceStartRef.current();
      });""","""        return describeSpaceStartRef.current();
      })(lastNonRefusalStatusRef.current));""")
elif name=='M-ORIGIN':
    sub(pbs,"""  if (input.range) {""","""  if (input.range && input.insertMarker < -1) {""")
else:
    raise SystemExit('unknown '+name)
