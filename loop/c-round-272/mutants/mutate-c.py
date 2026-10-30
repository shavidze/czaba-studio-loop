import sys
name=sys.argv[1]
ctx='app/contexts/ArrangementContext.tsx'; sw='app/components/arrangement/StudioWorkspace.tsx'
def sub(path, old, new):
    s=open(path,encoding='utf-8').read(); assert s.count(old)==1,(name,old[:50],s.count(old)); open(path,'w',encoding='utf-8').write(s.replace(old,new))
if name=='MC-S-NO-FOLLOWPAUSED':
    sub(sw,"""        insertMarkerStatusKind(current.status) !== null ||
        current.status === FOLLOW_PAUSED_MESSAGE""","""        insertMarkerStatusKind(current.status) !== null""")
elif name=='MC-W-IGNORE-PLAYING':
    sub(ctx,"""        if (isPlayingRef.current) {
          return studioPlaybackStrings.insertMarkerWhilePlaying(time);
        }
        return describeSpaceStartRef.current();""","""        return studioPlaybackStrings.insertMarkerWhilePlaying(time);""")
elif name=='MC-S-REMOVED':
    sub(sw,"""        current.setStatus(current.describeSpaceStart());""","""        current.getLocatorPosition();""")
else: raise SystemExit('unknown')
