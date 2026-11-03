import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} got {n}: {old[:90]!r}')
    s = s.replace(old, new)
# ordering: range store first, then selection
rep("""      setSelectedClipId(result.clip.id);
      setRange(null);
""", """      setRange(null);
      setSelectedClipId(result.clip.id);
""", 2)
rep("""      setSelection(toggleInSelection(latestRef.current.selectedClipIds, clipId, mode));
      setRange(null);
""", """      setRange(null);
      setSelection(toggleInSelection(latestRef.current.selectedClipIds, clipId, mode));
""")
rep("""    setSelection(historyRef.current.present.clips.map((clip) => clip.id));
    setRange(null);
""", """    setRange(null);
    setSelection(historyRef.current.present.clips.map((clip) => clip.id));
""")
rep("""        setSelectedClipId(onlyId);
        setRange(null);
""", """        setRange(null);
        setSelectedClipId(onlyId);
""")
rep("""      setSelection(result.middleIds);
      setRange(null);
""", """      setRange(null);
      setSelection(result.middleIds);
""")
rep("""    setSelection(plan.clipIds);
    setRange(null);
""", """    setRange(null);
    setSelection(plan.clipIds);
""")
rep("""        setSelectedClipId(null);
        setRange(null);
        seekTo(result.clip.start);""", """        setRange(null);
        setSelectedClipId(null);
        seekTo(result.clip.start);""")
# reads
rep("""    const selected = latestRef.current.range;
""", """    const selected = rangeStore.getState().range;
""")
rep("""    const range = latestRef.current.range;
""", """    const range = rangeStore.getState().range;
""", 2)
# splitSelection
rep("""    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range?.allTracks) {""", """    const latest = latestRef.current;
    const latestRange = rangeStore.getState().range;
    const arrangement = historyRef.current.present;
    if (latestRange?.allTracks) {""")
rep("""    if (!latest.range && latest.selectedClipIds.length >= 2) {""", """    if (!latestRange && latest.selectedClipIds.length >= 2) {""")
rep("""    if (latest.range) {
      const result = splitClipsByRange(arrangement, latest.range);""", """    if (latestRange) {
      const result = splitClipsByRange(arrangement, latestRange);""")
# delete
rep("""    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range) {
      const range = latest.range;
      const next = deleteRangeKeepingGap""", """    const range = rangeStore.getState().range;
    const arrangement = historyRef.current.present;
    if (range) {
      const next = deleteRangeKeepingGap""")
# duplicate
rep("""    const latest = latestRef.current;
    if (latest.range) {
      setStatus(studioEditStrings.duplicateRangeRefused);""", """    const latest = latestRef.current;
    if (rangeStore.getState().range) {
      setStatus(studioEditStrings.duplicateRangeRefused);""")
# copy
rep("""    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range) {
      const clipboard = copyRangeToClipboard(arrangement, latest.range);""", """    const latest = latestRef.current;
    const latestRange = rangeStore.getState().range;
    const arrangement = historyRef.current.present;
    if (latestRange) {
      const clipboard = copyRangeToClipboard(arrangement, latestRange);""")
rep("""          lane: latest.range.allTracks
            ? studioEditStrings.allTracks
            : trackLabel(latest.range.trackId),
          start: formatArrangementTime(latest.range.start),
          end: formatArrangementTime(latest.range.end),""", """          lane: latestRange.allTracks
            ? studioEditStrings.allTracks
            : trackLabel(latestRange.trackId),
          start: formatArrangementTime(latestRange.start),
          end: formatArrangementTime(latestRange.end),""")
# cut
rep("""    const range = latest.range;
    const clipboard = range""", """    const range = rangeStore.getState().range;
    const clipboard = range""")
# value memo + deps
rep("""      selectedSourceId,
      range,
      activeTrackId,
""", """      selectedSourceId,
      activeTrackId,
""", 2)
# provider
rep("""        <ArrangementMixDraftContext.Provider value={mixDraftStore}>
          <ArrangementMeterContext.Provider value={meterStore}>
            <ArrangementTrackMeterContext.Provider value={trackMeterStore}>
              <ArrangementContext.Provider value={value}>{children}</ArrangementContext.Provider>
            </ArrangementTrackMeterContext.Provider>
          </ArrangementMeterContext.Provider>
        </ArrangementMixDraftContext.Provider>""", """        <ArrangementMixDraftContext.Provider value={mixDraftStore}>
          <ArrangementRangeContext.Provider value={rangeStore}>
            <ArrangementMeterContext.Provider value={meterStore}>
              <ArrangementTrackMeterContext.Provider value={trackMeterStore}>
                <ArrangementContext.Provider value={value}>{children}</ArrangementContext.Provider>
              </ArrangementTrackMeterContext.Provider>
            </ArrangementMeterContext.Provider>
          </ArrangementRangeContext.Provider>
        </ArrangementMixDraftContext.Provider>""")
rep("""const ArrangementMixDraftContext = createContext<ArrangementMixDraftStore | null>(null);
""", """const ArrangementMixDraftContext = createContext<ArrangementMixDraftStore | null>(null);
const ArrangementRangeContext = createContext<ArrangementRangeStore | null>(null);
""")
rep("""export function useArrangementPosition(): number {""", """export function useArrangementRangeStore(): ArrangementRangeStore {
  const store = useContext(ArrangementRangeContext);
  if (!store) {
    throw new Error('useArrangementRangeStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useArrangementRange<Selected>(
  selector: (state: ArrangementRangeState) => Selected,
): Selected {
  return useStore(useArrangementRangeStore(), selector);
}

export function useArrangementPosition(): number {""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
