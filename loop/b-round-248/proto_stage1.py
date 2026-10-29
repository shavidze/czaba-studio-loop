import sys,re
root=sys.argv[1]
def sub(path, old, new, count=1):
    p=root+'/'+path
    s=open(p,encoding='utf8').read()
    n=s.count(old)
    if n<count or n==0:
        raise SystemExit(f'MISSING in {path}: {old[:80]!r} (found {n})')
    s=s.replace(old,new,count)
    open(p,'w',encoding='utf8').write(s)
C='app/contexts/ArrangementContext.tsx'
sub(C,"  const [positionStore] = useState(() => createArrangementPositionStore(0));\n",
"  const [positionStore] = useState(() => createArrangementPositionStore(0));\n  const [insertMarkerStore] = useState(() => createArrangementPositionStore(0));\n")
sub(C,"  const positionRef = useRef(0);\n","  const positionRef = useRef(0);\n  const insertMarkerRef = useRef(0);\n")
sub(C,"""  const refuseEditDuringGesture = useCallback((): boolean => {""","""  const writeInsertMarker = useCallback(
    (next: number) => {
      insertMarkerRef.current = next;
      insertMarkerStore.setPosition(next);
    },
    [insertMarkerStore],
  );

  const refuseEditDuringGesture = useCallback((): boolean => {""")
# togglePlayback -> startPlaybackAt + wrappers
old_start="""  const togglePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlayback();
      return;
    }
    stopLibraryPreview();
    const arrangement = historyRef.current.present;
    const end = projectEnd(arrangement);
    if (end <= 0) {
      setStatus(studioPlaybackStrings.nothingToPlay);
      return;
    }
    const current = positionRef.current;
    const loopActive = resolveActiveLoop(arrangement.loop, current) !== null;
    const endedHere =
      playbackEndedAtRef.current !== null &&
      Math.abs(playbackEndedAtRef.current - current) < ARRANGEMENT_EPS;"""
new_start="""  const startPlaybackAt = useCallback((current: number) => {
    stopLibraryPreview();
    const arrangement = historyRef.current.present;
    const end = projectEnd(arrangement);
    if (end <= 0) {
      setStatus(studioPlaybackStrings.nothingToPlay);
      return;
    }
    const loopActive = resolveActiveLoop(arrangement.loop, current) !== null;
    const endedHere =
      playbackEndedAtRef.current !== null &&
      Math.abs(playbackEndedAtRef.current - current) < ARRANGEMENT_EPS;"""
sub(C,old_start,new_start)
old_end="""  }, [
    ensureAudioContext,
    pumpPlaybackAudio,
    startGraph,
    stopLibraryPreview,
    stopPlayback,
    tick,
    updatePosition,
  ]);

  const startLibraryPreview"""
new_end="""  }, [ensureAudioContext, pumpPlaybackAudio, startGraph, stopLibraryPreview, tick, updatePosition]);

  const togglePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlayback();
      return;
    }
    const range = latestRef.current.range;
    startPlaybackAt(range ? Math.min(range.start, range.end) : insertMarkerRef.current);
  }, [startPlaybackAt, stopPlayback]);

  const continuePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlayback();
      return;
    }
    startPlaybackAt(positionRef.current);
  }, [startPlaybackAt, stopPlayback]);

  const startLibraryPreview"""
sub(C,old_end,new_end)
# seekTo sets marker
sub(C,"""      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
      updatePosition(target);
    },
    [startGraph, updatePosition],
  );

  const playFrom""","""      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
      writeInsertMarker(target);
      updatePosition(target);
    },
    [startGraph, updatePosition, writeInsertMarker],
  );

  const setInsertMarker = useCallback(
    (time: number) => {
      const target = Math.max(0, time);
      writeInsertMarker(target);
      if (isPlayingRef.current) {
        return;
      }
      scrubbingRef.current = false;
      lastScrubRescheduleRef.current = null;
      updatePosition(target);
    },
    [updatePosition, writeInsertMarker],
  );

  const moveInsertMarkerToPlayhead = useCallback(() => {
    writeInsertMarker(Math.max(0, livePosition()));
  }, [livePosition, writeInsertMarker]);

  const playFrom""")
sub(C,"""      seekTo(target);
      togglePlayback();
    },
    [seekTo, stopLibraryPreview, togglePlayback],""","""      seekTo(target);
      startPlaybackAt(target);
    },
    [seekTo, startPlaybackAt, stopLibraryPreview],""")
sub(C,"""      const target = Math.max(0, time);
      updatePosition(target);
      const ctx = audioContextRef.current;
      if (isPlayingRef.current && ctx) {""","""      const target = Math.max(0, time);
      updatePosition(target);
      if (!isPlayingRef.current) {
        writeInsertMarker(target);
      }
      const ctx = audioContextRef.current;
      if (isPlayingRef.current && ctx) {""")
sub(C,"""    [startGraph, updatePosition],
  );

  const selectSource""","""    [startGraph, updatePosition, writeInsertMarker],
  );

  const selectSource""")
# interface
sub(C,"""  togglePlayback: () => void;
  pausePlaybackWithStatus""","""  togglePlayback: () => void;
  continuePlayback: () => void;
  setInsertMarker: (time: number) => void;
  moveInsertMarkerToPlayhead: () => void;
  pausePlaybackWithStatus""")
s=open(root+'/'+C,encoding='utf8').read()
s=s.replace("""      togglePlayback,
      pausePlaybackWithStatus,""","""      togglePlayback,
      continuePlayback,
      setInsertMarker,
      moveInsertMarkerToPlayhead,
      pausePlaybackWithStatus,""")
open(root+'/'+C,'w',encoding='utf8').write(s)
# Workspace: lane click, Home, ruler onSeek, bars ruler onSeek, Space variants
W='app/components/arrangement/StudioWorkspace.tsx'
sub(W,"        latest.seekTo(\n          resolveGridTimeWithTargets(","        latest.setInsertMarker(\n          resolveGridTimeWithTargets(")
sub(W,"""      if (event.key === ' ' && !modifier && (!isRoleSliderTarget(event.target) || onOverview)) {
        event.preventDefault();
        if (!event.repeat) {
          current.togglePlayback();
        }
        return;
      }""","""      if (event.key === ' ' && (!isRoleSliderTarget(event.target) || onOverview)) {
        if (modifier && event.shiftKey && !event.altKey) {
          event.preventDefault();
          if (!event.repeat) {
            current.moveInsertMarkerToPlayhead();
          }
          return;
        }
        if (!modifier) {
          event.preventDefault();
          if (!event.repeat) {
            if (event.shiftKey) {
              current.continuePlayback();
            } else {
              current.togglePlayback();
            }
          }
          return;
        }
      }""")
sub(W,"""        if (!isSeparatorTarget(event.target)) {
          current.seekTo(0);
        }""","""        if (!isSeparatorTarget(event.target)) {
          current.setInsertMarker(0);
        }""")
sub(W,"                    onSeek={seekTo}\n","                    onSeek={setInsertMarker}\n")
sub(W,"      onSeek: seekTo,\n      onPlayFrom","      onSeek: setInsertMarker,\n      onPlayFrom")
s=open(root+'/'+W,encoding='utf8').read()
s=s.replace("""    [
      seekTo,
      playFromRuler,""","""    [
      setInsertMarker,
      playFromRuler,""",1)
s=s.replace("""    seekTo,
    scrubPlayhead,
    endPlayheadScrub,""","""    setInsertMarker,
    scrubPlayhead,
    endPlayheadScrub,""",1)
open(root+'/'+W,'w',encoding='utf8').write(s)
# Ruler handle keys -> onScrubEnd
R='app/components/arrangement/ArrangementRuler.tsx'
sub(R,"    onSeek(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));","    onScrubEnd(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));")
# Lane/clip body click -> setInsertMarker
L='app/components/arrangement/ArrangementLane.tsx'
sub(L,"    setActiveTrack,\n    seekTo,\n","    setActiveTrack,\n    setInsertMarker,\n")
sub(L,"              seekTo={seekTo}\n","              seekTo={setInsertMarker}\n")
# Transport back to start
T='app/components/arrangement/ArrangementTransport.tsx'
sub(T,"        onClick={() => seekTo(0)}","        onClick={() => setInsertMarker(0)}")
sub(T,"    seekTo,\n","    setInsertMarker,\n")
# Marker row play paths
M='app/components/arrangement/ArrangementMarkerRow.tsx'
sub(M,"""    if (action === 'play') {
      jumpToMarker(marker);
      if (!isPlaying) {
        togglePlayback();
      }""","""    if (action === 'play') {
      playFrom(marker.time);
      setSelectedMarkerId(marker.id);""")
sub(M,"""                jumpToMarker(marker);
                if (!isPlaying) {
                  togglePlayback();
                }""","""                playFrom(marker.time);
                setSelectedMarkerId(marker.id);""")
sub(M,"    togglePlayback,\n","    togglePlayback,\n    playFrom,\n")
print('ok')
