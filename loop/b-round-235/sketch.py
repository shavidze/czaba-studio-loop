import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(path, old, new, count=1):
    p = root / path
    s = p.read_text()
    n = s.count(old)
    assert n == count, (path, old[:60], n)
    p.write_text(s.replace(old, new))

ctx = 'app/contexts/ArrangementContext.tsx'
sub(ctx, "  seekTo: (time: number) => void;\n", "  seekTo: (time: number) => void;\n  playFrom: (time: number) => void;\n")
sub(ctx, """  const scrubPlayhead = useCallback(
    (time: number) => {""", """  const playFrom = useCallback(
    (time: number) => {
      const target = Math.max(0, time);
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
        seekTo(target);
        setStatus(playPastEndMessage(target, end));
        return;
      }
      seekTo(target);
      togglePlayback();
    },
    [seekTo, togglePlayback],
  );

  const scrubPlayhead = useCallback(
    (time: number) => {""")
sub(ctx, "      seekTo,\n      scrubPlayhead,\n", "      seekTo,\n      playFrom,\n      scrubPlayhead,\n", 2)

ws = 'app/components/arrangement/StudioWorkspace.tsx'
sub(ws, """  const playFromRuler = useCallback((time: number) => {
    const latest = workspaceRef.current;
    latest.seekTo(time);
    if (!latest.isPlaying) {
      latest.togglePlayback();
    }
  }, []);""", """  const playFromRuler = useCallback((time: number) => {
    workspaceRef.current.playFrom(time);
  }, []);""")

tr = 'app/components/arrangement/ArrangementTempoRow.tsx'
sub(tr, """  const stripRef = useRef<HTMLDivElement>(null);
""", """  const stripRef = useRef<HTMLDivElement>(null);
  const pressInStripRef = useRef(false);
""")
sub(tr, """      onPointerDown={interactive ? navigation.onPointerDown : undefined}""", """      onPointerDown={
        interactive
          ? (event) => {
              pressInStripRef.current =
                event.target instanceof Node && (stripRef.current?.contains(event.target) ?? false);
              navigation.onPointerDown(event);
            }
          : undefined
      }""")
sub(tr, """      onDoubleClick={interactive ? navigation.onDoubleClick : undefined}""", """      onDoubleClick={
        interactive
          ? () => {
              if (pressInStripRef.current) {
                return;
              }
              navigation.onDoubleClick();
            }
          : undefined
      }""")
print('ok')
