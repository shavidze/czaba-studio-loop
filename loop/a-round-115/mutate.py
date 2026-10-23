import sys
m=sys.argv[1]
def sub(p,o,n):
    s=open(p).read(); assert s.count(o)>=1,(m,p,o); s=s.replace(o,n); open(p,'w').write(s)
M='app/lib/arrangement/clip-gain-multi.ts'; C='app/contexts/ArrangementContext.tsx'; P='app/components/arrangement/ArrangementDetailPanel.tsx'
if m=='m1':
    sub(M,"normalizeClipGainDb((clip.gainDb ?? 0) + effectiveDelta)","normalizeClipGainDb((clip.gainDb ?? 0) + deltaDb)")
elif m=='m2':
    sub(C,"clipGainShiftTargets(baseline, span.clipIds, anchorDb - span.maxDb)","clipGainShiftTargets(current.present, span.clipIds, anchorDb - span.maxDb)")
elif m=='m3':
    sub(M,"(clip) => wanted.has(clip.id) && audioTrackIds.has(clip.trackId),","(clip) => wanted.has(clip.id) && audioTrackIds.size >= 0,")
elif m=='m4':
    sub(P,"""      if (clipIds !== null) {
        previewClipGainTargets(clipIds, value);
      }""","""      if (clipIds !== null) {
        previewClipGainTargets(clipIds, value);
        commitClipGainMembers?.(clipIds);
      }""")
elif m=='m5':
    sub(P,"if (dragIds !== null && isPointerGestureActive()) {","if (dragIds !== null && isPointerGestureActive() && dragIds.length < 0) {")
elif m=='m6':
    sub(C,"anchorDb - span.maxDb","anchorDb - span.minDb")
    sub(P,"clipGainMemberSpan(arrangement, clipIds)?.maxDb","clipGainMemberSpan(arrangement, clipIds)?.minDb")
    sub(P,"value={clipGainMaxDb}","value={clipGainMinDb}")
elif m=='r2':
    sub(P,"""    if (clipGainText === displayedClipGainText) {
      if (trigger === 'enter') {""","""    if (trigger === 'blur' && clipGainText === displayedClipGainText) {
      if (trigger === 'enter') {""")
elif m=='r8':
    sub(P,"} else if (trigger === 'button') {","} else if (trigger !== 'button') {")
