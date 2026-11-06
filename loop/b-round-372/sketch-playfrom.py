import sys
p=sys.argv[1]+'/app/contexts/ArrangementContext.tsx'
s=open(p).read()
old="""      const target = Math.max(0, time);
      placeInsertMarker(target);
      if (isPlayingRef.current) {
        seekTo(target);
        return;
      }
      const arrangement = historyRef.current.present;
      const end = projectEnd(arrangement);
      if (
        end > 0 &&
        target >= end - ARRANGEMENT_EPS &&
        resolveActiveLoop(arrangement.loop, target) === null
      ) {
        stopLibraryPreview();
        seekTo(target);
        setStatus(playPastEndMessage(target, end, 'insert-marker'));
        return;
      }
      seekTo(target);
      startPlaybackAt(target, 'insert-marker');
"""
new="""      const target = Math.max(0, time);
      if (isPlayingRef.current) {
        placeInsertMarker(target);
        seekTo(target);
        return;
      }
      const arrangement = historyRef.current.present;
      const end = projectEnd(arrangement);
      if (
        end > 0 &&
        target >= end - ARRANGEMENT_EPS &&
        resolveActiveLoop(arrangement.loop, target) === null
      ) {
        placeInsertMarker(target);
        stopLibraryPreview();
        seekTo(target);
        setStatus(playPastEndMessage(target, end, 'insert-marker'));
        return;
      }
      seekTo(target);
      startPlaybackAt(target, 'insert-marker');
      placeInsertMarker(target);
"""
assert s.count(old)==1
s=s.replace(old,new); open(p,'w').write(s)
