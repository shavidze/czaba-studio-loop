import sys
root=sys.argv[1]
def sub(path, old, new, count=1):
    p=root+'/'+path
    s=open(p,encoding='utf8').read()
    n=s.count(old)
    if n==0: raise SystemExit(f'MISSING in {path}: {old[:90]!r}')
    s=s.replace(old,new,count); open(p,'w',encoding='utf8').write(s)
S='app/lib/arrangement/strings.ts'
sub(S,"""    `Playhead (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,
};""","""    `Playhead (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,
  insertMarkerWhilePlaying: (time: string): string =>
    `Insert marker at ${time} — playback continues. Stop, then Space plays from here.`,
  insertMarkerToPlayhead: (time: string): string =>
    `Insert marker moved to the playhead (${time}). Space plays from here.`,
};""")
C='app/contexts/ArrangementContext.tsx'
sub(C,"""      const target = Math.max(0, time);
      writeInsertMarker(target);
      if (isPlayingRef.current) {
        return;
      }""","""      const target = Math.max(0, time);
      writeInsertMarker(target);
      if (isPlayingRef.current) {
        setStatus(studioPlaybackStrings.insertMarkerWhilePlaying(formatArrangementTime(target)));
        return;
      }""")
sub(C,"""  const moveInsertMarkerToPlayhead = useCallback(() => {
    writeInsertMarker(Math.max(0, livePosition()));
  }, [livePosition, writeInsertMarker]);""","""  const moveInsertMarkerToPlayhead = useCallback(() => {
    const target = Math.max(0, Math.round(livePosition() * 1000) / 1000);
    writeInsertMarker(target);
    setStatus(studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(target)));
  }, [livePosition, writeInsertMarker]);""")
# insert marker context + hooks
sub(C,"const ArrangementPositionContext = createContext<ArrangementPositionStore | null>(null);\n",
"const ArrangementPositionContext = createContext<ArrangementPositionStore | null>(null);\nconst ArrangementInsertMarkerContext = createContext<ArrangementPositionStore | null>(null);\n")
sub(C,"    <ArrangementPositionContext.Provider value={positionStore}>","    <ArrangementPositionContext.Provider value={positionStore}>\n      <ArrangementInsertMarkerContext.Provider value={insertMarkerStore}>")
sub(C,"    </ArrangementPositionContext.Provider>","      </ArrangementInsertMarkerContext.Provider>\n    </ArrangementPositionContext.Provider>")
sub(C,"export function useArrangementPositionStore(): ArrangementPositionStore {","""export function useArrangementInsertMarkerStore(): ArrangementPositionStore {
  const store = useContext(ArrangementInsertMarkerContext);
  if (!store) {
    throw new Error('useArrangementInsertMarkerStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useArrangementPositionStore(): ArrangementPositionStore {""")
W='app/components/arrangement/StudioWorkspace.tsx'
sub(W,"""function ArrangementPlayheadLine({ pxPerSecond }: { pxPerSecond: number }) {""","""function ArrangementInsertMarkerSignal() {
  const insertMarkerStore = useArrangementInsertMarkerStore();
  const signalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const write = () => {
      signalRef.current?.setAttribute(
        'data-insert-marker',
        insertMarkerStore.getPosition().toFixed(3),
      );
    };
    write();
    return insertMarkerStore.subscribePosition(write);
  }, [insertMarkerStore]);
  return (
    <div
      ref={signalRef}
      hidden
      aria-hidden="true"
      data-testid="arrangement-insert-marker"
      data-insert-marker={insertMarkerStore.getPosition().toFixed(3)}
    />
  );
}

function ArrangementPlayheadLine({ pxPerSecond }: { pxPerSecond: number }) {""")
sub(W,"""        event.key === ' ' &&
        !exportOpenRef.current &&
        !isTypingTarget(event.target) &&
        !(event.ctrlKey || event.metaKey)
      ) {""","""        event.key === ' ' &&
        !exportOpenRef.current &&
        !isTypingTarget(event.target) &&
        (!(event.ctrlKey || event.metaKey) || (event.shiftKey && !event.altKey))
      ) {""")
M='app/components/arrangement/ArrangementMarkerRow.tsx'
print('ok')
