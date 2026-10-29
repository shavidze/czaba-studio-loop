import sys
root=sys.argv[1]
def sub(path, old, new, count=1):
    p=root+'/'+path
    s=open(p,encoding='utf8').read()
    n=s.count(old)
    if n==0: raise SystemExit(f'MISSING in {path}: {old[:90]!r}')
    s=s.replace(old,new,count); open(p,'w',encoding='utf8').write(s)
C='app/contexts/ArrangementContext.tsx'
# writeInsertMarker clears a time selection (a point replaces a span, Live 6.9)
sub(C,"""  const writeInsertMarker = useCallback(
    (next: number) => {
      insertMarkerRef.current = next;
      insertMarkerStore.setPosition(next);
    },
    [insertMarkerStore],
  );""","""  const writeInsertMarker = useCallback(
    (next: number) => {
      insertMarkerRef.current = next;
      insertMarkerStore.setPosition(next);
    },
    [insertMarkerStore],
  );

  const placeInsertMarker = useCallback(
    (next: number) => {
      writeInsertMarker(next);
      if (latestRef.current.range !== null) {
        setRange(null);
      }
    },
    [setRange, writeInsertMarker],
  );""")
s=open(root+'/'+C,encoding='utf8').read()
# seekTo, setInsertMarker, moveInsertMarkerToPlayhead use placeInsertMarker
s=s.replace("""      writeInsertMarker(target);
      updatePosition(target);
    },
    [startGraph, updatePosition, writeInsertMarker],""","""      placeInsertMarker(target);
      updatePosition(target);
    },
    [placeInsertMarker, startGraph, updatePosition],""",1)
s=s.replace("""      const target = Math.max(0, time);
      writeInsertMarker(target);
      if (isPlayingRef.current) {""","""      const target = Math.max(0, time);
      placeInsertMarker(target);
      if (isPlayingRef.current) {""",1)
s=s.replace("""    [updatePosition, writeInsertMarker],
  );

  const moveInsertMarkerToPlayhead""","""    [placeInsertMarker, updatePosition],
  );

  const moveInsertMarkerToPlayhead""",1)
s=s.replace("""    writeInsertMarker(target);
    setStatus(studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(target)));
  }, [livePosition, writeInsertMarker]);""","""    placeInsertMarker(target);
    setStatus(studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(target)));
  }, [livePosition, placeInsertMarker]);""",1)
# cut time remap marker
s=s.replace("""    if (!wasPlaying) {
      updatePosition(remapTime(positionRef.current, a, b));
    }
    setRange(null);""","""    if (!wasPlaying) {
      updatePosition(remapTime(positionRef.current, a, b));
    }
    writeInsertMarker(remapTime(insertMarkerRef.current, a, b));
    setRange(null);""",1)
open(root+'/'+C,'w',encoding='utf8').write(s)
print('ok')
