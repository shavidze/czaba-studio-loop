"""B round 360 -> 361: PERF-10b-i sketch (activeTrackId into the selection store). Applied to a scratch only."""
import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    t = p.read_text(encoding='utf-8')
    n = t.count(old)
    assert n == count, (rel, old[:60], n)
    p.write_text(t.replace(old, new), encoding='utf-8')

# 1. selection store
sub('app/lib/arrangement/selection-store.ts',
"""export interface ArrangementSelectionState {
  selectedClipIds: readonly string[];
  setSelectedClipIds: (next: readonly string[]) => void;
}""",
"""export interface ArrangementSelectionState {
  selectedClipIds: readonly string[];
  activeTrackId: string | null;
  setSelectedClipIds: (next: readonly string[]) => void;
  setActiveTrackId: (next: string | null) => void;
}""")
sub('app/lib/arrangement/selection-store.ts',
"""export function createArrangementSelectionStore(
  initial: readonly string[] = NO_SELECTION,
): ArrangementSelectionStore {
  return createStore<ArrangementSelectionState>()((set) => ({
    selectedClipIds: initial,
    setSelectedClipIds: (next) =>
      set((state) =>
        isSameOrderedSelection(state.selectedClipIds, next) ? state : { selectedClipIds: next },
      ),
  }));
}""",
"""export function createArrangementSelectionStore(
  initial: readonly string[] = NO_SELECTION,
  initialActiveTrackId: string | null = null,
): ArrangementSelectionStore {
  return createStore<ArrangementSelectionState>()((set) => ({
    selectedClipIds: initial,
    activeTrackId: initialActiveTrackId,
    setSelectedClipIds: (next) =>
      set((state) =>
        isSameOrderedSelection(state.selectedClipIds, next) ? state : { selectedClipIds: next },
      ),
    setActiveTrackId: (next) =>
      set((state) => (state.activeTrackId === next ? state : { activeTrackId: next })),
  }));
}""")

C = 'app/contexts/ArrangementContext.tsx'
sub(C, "  activeTrackId: string | null;\n", "", 1)
sub(C, """  const [activeTrackId, setActiveTrackIdState] = useState<string | null>(
    () => history.present.tracks.find((track) => track.kind === 'audio')?.id ?? null,
  );
""", "")
sub(C, "  const [selectionStore] = useState(() => createArrangementSelectionStore());",
"""  const [selectionStore] = useState(() =>
    createArrangementSelectionStore(
      NO_SELECTION,
      history.present.tracks.find((track) => track.kind === 'audio')?.id ?? null,
    ),
  );""")
sub(C, """  const latestRef = useRef({
    selectedSourceId,
    activeTrackId,
    sourceStates,
  });""", """  const latestRef = useRef({
    selectedSourceId,
    sourceStates,
  });""")
sub(C, """  const setActiveTrackId = useCallback((next: string | null) => {
    latestRef.current.activeTrackId = next;
    setActiveTrackIdState(next);
  }, []);""", """  const setActiveTrackId = useCallback(
    (next: string | null) => {
      selectionStore.getState().setActiveTrackId(next);
    },
    [selectionStore],
  );""")
sub(C, "entry.id === latest.activeTrackId);", "entry.id === selectionStore.getState().activeTrackId);")
sub(C, "      activeTrackId: latestRef.current.activeTrackId,\n", "      activeTrackId: selectionStore.getState().activeTrackId,\n")
sub(C, "      selectedSourceId,\n      activeTrackId,\n      pxPerSecond,\n", "      selectedSourceId,\n      pxPerSecond,\n", 2)
sub(C, """export function useArrangementIsPlaying(): boolean {""",
"""export function useArrangementActiveTrackId(): string | null {
  return useStore(useArrangementSelectionStore(), (state) => state.activeTrackId);
}

export function useArrangementIsPlaying(): boolean {""")

L = 'app/components/arrangement/ArrangementLane.tsx'
sub(L, "    pxPerSecond,\n    activeTrackId,\n    getArrangement,", "    pxPerSecond,\n    getArrangement,")
sub(L, "  const isActive = activeTrackId === track.id;", "  const isActive = useArrangementSelection((state) => state.activeTrackId === track.id);")

P = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
sub(P, "    arrangement,\n    activeTrackId,\n    sourceStates,", "    arrangement,\n    sourceStates,")
sub(P, "  const activeTrack = arrangement.tracks.find((track) => track.id === activeTrackId);",
"  const activeTrackId = useArrangementActiveTrackId();\n  const activeTrack = arrangement.tracks.find((track) => track.id === activeTrackId);")

W = 'app/components/arrangement/StudioWorkspace.tsx'
sub(W, """type ArrangementGroupHeaderWithSelectionProps = Omit<
  ComponentProps<typeof ArrangementGroupHeader>,
  'overviewClips'
>""", """type ArrangementGroupHeaderWithSelectionProps = Omit<
  ComponentProps<typeof ArrangementGroupHeader>,
  'overviewClips' | 'containsActive'
>""")
sub(W, """  overviewClips: readonly TrackGroupOverviewClip[];
  overviewGroupId: string;
};""", """  overviewClips: readonly TrackGroupOverviewClip[];
  overviewGroupId: string;
  activeCandidateTrackIds: readonly string[];
};""")
sub(W, """  overviewClips: committedOverviewClips,
  overviewGroupId,
  ...headerProps
}: ArrangementGroupHeaderWithSelectionProps) {""", """  overviewClips: committedOverviewClips,
  overviewGroupId,
  activeCandidateTrackIds,
  ...headerProps
}: ArrangementGroupHeaderWithSelectionProps) {
  const containsActive = useArrangementSelection(
    (state) =>
      state.activeTrackId !== null && activeCandidateTrackIds.includes(state.activeTrackId),
  );""")
sub(W, "  return <ArrangementGroupHeader {...headerProps} overviewClips={blocks} />;",
"  return (\n    <ArrangementGroupHeader\n      {...headerProps}\n      containsActive={containsActive}\n      overviewClips={blocks}\n    />\n  );")
sub(W, "            activeTrackId: current.activeTrackId,", "            activeTrackId: selectionStore.getState().activeTrackId,")
sub(W, """  const activeTrackId = workspace.activeTrackId;
  const trackGroupOverviews = useMemo(() => {
    const overviews = new Map<string, readonly TrackGroupOverviewClip[]>();
    for (const row of trackRows) {
      if (row.kind === 'group' && trackLaneLayout.collapsedGroups[row.id] === true) {
        overviews.set(row.id, trackGroupOverviewClips(arrangement, row.id));
      }
    }
    return overviews;
  }, [arrangement, trackRows, trackLaneLayout.collapsedGroups]);""", """  const trackGroupOverviews = useMemo(() => {
    const overviews = new Map<string, readonly TrackGroupOverviewClip[]>();
    for (const row of trackRows) {
      if (row.kind === 'group' && trackLaneLayout.collapsedGroups[row.id] === true) {
        overviews.set(row.id, trackGroupOverviewClips(arrangement, row.id));
      }
    }
    return overviews;
  }, [arrangement, trackRows, trackLaneLayout.collapsedGroups]);
  const trackGroupActiveCandidates = useMemo(() => {
    const candidates = new Map<string, readonly string[]>();
    for (const row of trackRows) {
      if (row.kind === 'group' && trackLaneLayout.collapsedGroups[row.id] === true) {
        candidates.set(row.id, trackGroupDescendantTrackIds(arrangement, row.id));
      }
    }
    return candidates;
  }, [arrangement, trackRows, trackLaneLayout.collapsedGroups]);""")
sub(W, """                    containsActive={
                      activeTrackId !== null &&
                      trackLaneLayout.collapsedGroups[row.id] === true &&
                      trackGroupDescendantTrackIds(arrangement, row.id).includes(activeTrackId)
                    }
""", """                    activeCandidateTrackIds={
                      trackGroupActiveCandidates.get(row.id) ?? NO_ACTIVE_CANDIDATE_TRACK_IDS
                    }
""")
sub(W, "const ArrangementGroupHeaderWithSelection = memo(ArrangementGroupHeaderWithSelectionInner);",
"const ArrangementGroupHeaderWithSelection = memo(ArrangementGroupHeaderWithSelectionInner);\n\nconst NO_ACTIVE_CANDIDATE_TRACK_IDS: readonly string[] = [];")

H = 'app/lib/arrangement/__tests__/helpers/workspace-probe.ts'
sub(H, """  useArrangement,
  useArrangementIsPlaying,
} from '~/contexts/ArrangementContext';

export type WorkspaceProbeValue = ArrangementContextValue & { isPlaying: boolean };

export function useWorkspaceProbe(): WorkspaceProbeValue {
  return { ...useArrangement(), isPlaying: useArrangementIsPlaying() };
}""", """  useArrangement,
  useArrangementActiveTrackId,
  useArrangementIsPlaying,
} from '~/contexts/ArrangementContext';

export type WorkspaceProbeValue = ArrangementContextValue & {
  isPlaying: boolean;
  activeTrackId: string | null;
};

export function useWorkspaceProbe(): WorkspaceProbeValue {
  return {
    ...useArrangement(),
    isPlaying: useArrangementIsPlaying(),
    activeTrackId: useArrangementActiveTrackId(),
  };
}""")
sub(W, "  const rangeStore = useArrangementRangeStore();\n", "  const rangeStore = useArrangementRangeStore();\n  const selectionStore = useArrangementSelectionStore();\n")
sub(W, "  useArrangementSelection,\n", "  useArrangementSelection,\n  useArrangementSelectionStore,\n")
sub(P, "  useArrangement,\n  useArrangementInsertMarkerStore,\n", "  useArrangement,\n  useArrangementActiveTrackId,\n  useArrangementInsertMarkerStore,\n")
sub(C, "      collection.sources,\n      refuseEditDuringGesture,\n      setRange,\n", "      collection.sources,\n      refuseEditDuringGesture,\n      selectionStore,\n      setRange,\n")
sub(C, "  }, [applyEdit, refuseEditDuringGesture, setRange, setSelection, trackLabel, setStatus]);", "  }, [\n    applyEdit,\n    refuseEditDuringGesture,\n    selectionStore,\n    setRange,\n    setSelection,\n    trackLabel,\n    setStatus,\n  ]);")
sub(C, "      const track = arrangement.tracks.find((entry) => entry.id === selectionStore.getState().activeTrackId);", "      const track = arrangement.tracks.find(\n        (entry) => entry.id === selectionStore.getState().activeTrackId,\n      );")
sub(W, "    rangeStore,\n    returnFloatingVideo,\n    stepGridDivision,\n", "    rangeStore,\n    returnFloatingVideo,\n    selectionStore,\n    stepGridDivision,\n")
print('sketch applied')

for T in ('app/lib/arrangement/__tests__/grid-snap-position.test.tsx', 'app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx'):
    sub(T, "  useArrangement,\n  useArrangementPositionStore,\n", "  useArrangement,\n  useArrangementActiveTrackId,\n  useArrangementPositionStore,\n")
    sub(T, "type ArrangementRangeProbeValue = ArrangementContextValue & { range: TimeRange | null };",
        "type ArrangementRangeProbeValue = ArrangementContextValue & {\n  range: TimeRange | null;\n  activeTrackId: string | null;\n};")
    sub(T, "  api.current = { ...useArrangement(), range: useArrangementRange((state) => state.range) };",
        "  api.current = {\n    ...useArrangement(),\n    range: useArrangementRange((state) => state.range),\n    activeTrackId: useArrangementActiveTrackId(),\n  };")
print('test probes patched')
