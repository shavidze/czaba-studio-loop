# Usage: python3 -I apply-sketch.py <store-root>  (applies B's round-338 c3-ii sketch; refuses to run inside the real store)
import sys, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store':
    sys.exit('refusing to edit the real store')

def edit(rel, pairs):
    p = root / rel
    s = p.read_text()
    for old, new, count in pairs:
        n = s.count(old)
        if n != count:
            sys.exit(f'{rel}: expected {count} hit(s), got {n}: {old[:90]!r}')
        s = s.replace(old, new)
    p.write_text(s)

STORE = """import { createStore, type StoreApi } from 'zustand/vanilla';

export interface ClipLaneGhost {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
  blocked: boolean;
  message: string | null;
}

export interface ClipLaneDragState {
  ghosts: readonly ClipLaneGhost[];
  timeLocked: boolean;
}

export interface ArrangementLaneDragState {
  drag: ClipLaneDragState | null;
  setDrag: (next: ClipLaneDragState | null) => void;
}

export type ArrangementLaneDragStore = StoreApi<ArrangementLaneDragState>;

const NO_LANE_GHOSTS: readonly ClipLaneGhost[] = [];

export function createArrangementLaneDragStore(): ArrangementLaneDragStore {
  return createStore<ArrangementLaneDragState>()((set) => ({
    drag: null,
    setDrag: (next) => set((state) => (Object.is(state.drag, next) ? state : { drag: next })),
  }));
}

export function selectLaneDragGhosts(
  drag: ClipLaneDragState | null,
  trackId: string,
): readonly ClipLaneGhost[] {
  return drag ? drag.ghosts.filter((ghost) => ghost.trackId === trackId) : NO_LANE_GHOSTS;
}

export function selectLaneMoveSourceKey(
  drag: ClipLaneDragState | null,
  clipIds: readonly string[],
): string {
  if (!drag) {
    return '';
  }
  return clipIds
    .filter((clipId) => drag.ghosts.some((ghost) => ghost.clipId === clipId && !ghost.blocked))
    .join('\\n');
}

export function selectLaneMoveRefusal(drag: ClipLaneDragState | null): string | null {
  return drag?.ghosts.find((ghost) => ghost.blocked && ghost.message)?.message ?? null;
}
"""
(root / 'app/lib/arrangement/lane-drag-store.ts').write_text(STORE)

CTX = 'app/contexts/ArrangementContext.tsx'
edit(CTX, [
    ("""  const previewClipGeometry = useCallback(
    (next: Arrangement) => {
      previewActiveRef.current = true;
      historyRef.current = { ...historyRef.current, present: next };""", """  const previewClipGeometry = useCallback(
    (next: Arrangement) => {
      previewActiveRef.current = true;
      if (next === publishedHistoryRef.current.present) {
        historyRef.current = publishedHistoryRef.current;
        previewStore.getState().clearPreview();
        return;
      }
      historyRef.current = { ...historyRef.current, present: next };""", 1),
    ("""export interface ClipLaneGhost {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
  blocked: boolean;
  message: string | null;
}

export interface ClipLaneDragState {
  ghosts: readonly ClipLaneGhost[];
  timeLocked: boolean;
}
""", """export type { ClipLaneDragState, ClipLaneGhost } from '~/lib/arrangement/lane-drag-store';
""", 1),
    ("""  clipLaneDrag: ClipLaneDragState | null;
  setClipLaneDrag: (next: ClipLaneDragState | null) => void;
""", """  setClipLaneDrag: (next: ClipLaneDragState | null) => void;
""", 1),
    ("""const ArrangementRangeContext = createContext<ArrangementRangeStore | null>(null);
""", """const ArrangementRangeContext = createContext<ArrangementRangeStore | null>(null);
const ArrangementLaneDragContext = createContext<ArrangementLaneDragStore | null>(null);
""", 1),
    ("""  const [clipLaneDrag, setClipLaneDrag] = useState<ClipLaneDragState | null>(null);
""", """  const [laneDragStore] = useState(() => createArrangementLaneDragStore());
  const setClipLaneDrag = useCallback(
    (next: ClipLaneDragState | null) => laneDragStore.getState().setDrag(next),
    [laneDragStore],
  );
""", 1),
    ("""      exportProgress,
      clipLaneDrag,
      setClipLaneDrag,
""", """      exportProgress,
      setClipLaneDrag,
""", 1),
    ("""      exportProgress,
      clipLaneDrag,
      togglePlayback,
""", """      exportProgress,
      setClipLaneDrag,
      togglePlayback,
""", 1),
    ("""          <ArrangementRangeContext.Provider value={rangeStore}>
            <ArrangementSelectionContext.Provider value={selectionStore}>""",
     """          <ArrangementRangeContext.Provider value={rangeStore}>
            <ArrangementLaneDragContext.Provider value={laneDragStore}>
            <ArrangementSelectionContext.Provider value={selectionStore}>""", 1),
    ("""            </ArrangementSelectionContext.Provider>
          </ArrangementRangeContext.Provider>""",
     """            </ArrangementSelectionContext.Provider>
            </ArrangementLaneDragContext.Provider>
          </ArrangementRangeContext.Provider>""", 1),
    ("""export function useArrangementSelectionStore(): ArrangementSelectionStore {""",
     """export function useArrangementLaneDragStore(): ArrangementLaneDragStore {
  const store = useContext(ArrangementLaneDragContext);
  if (!store) {
    throw new Error('useArrangementLaneDragStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useArrangementLaneDrag<Selected>(
  selector: (state: ArrangementLaneDragState) => Selected,
): Selected {
  return useStore(useArrangementLaneDragStore(), selector);
}

export function useArrangementSelectionStore(): ArrangementSelectionStore {""", 1),
    ("""  type ArrangementRangeStore,
  createArrangementRangeStore,
""", """  type ArrangementRangeStore,
  createArrangementRangeStore,
""", 1),
])
# import of the new store (placed by Biome's import sorting later; A runs check)
p = root / CTX
s = p.read_text()
if True:
    idx = s.find("from '~/lib/arrangement/range-store';")
    if idx < 0:
        sys.exit('range-store import not found')
    line_end = s.find('\n', idx) + 1
    s = s[:line_end] + """import {
  type ArrangementLaneDragState,
  type ArrangementLaneDragStore,
  type ClipLaneDragState,
  createArrangementLaneDragStore,
} from '~/lib/arrangement/lane-drag-store';
""" + s[line_end:]
p.write_text(s)

LANE = 'app/components/arrangement/ArrangementLane.tsx'
edit(LANE, [
    ("""    clipLaneDrag,
    setClipLaneDrag,
  } = useArrangement();""", """    setClipLaneDrag,
  } = useArrangement();""", 1),
    ("""  const laneGhosts = clipLaneDrag?.ghosts.filter((ghost) => ghost.trackId === track.id) ?? [];
""", """  const laneGhosts = useArrangementLaneDrag(
    useShallow((state) => selectLaneDragGhosts(state.drag, track.id)),
  );
  const laneMoveSourceKey = useArrangementLaneDrag((state) =>
    selectLaneMoveSourceKey(
      state.drag,
      clips.map((clip) => clip.id),
    ),
  );
  const laneMoveSourceIds = useMemo(
    () => new Set(laneMoveSourceKey === '' ? [] : laneMoveSourceKey.split('\\n')),
    [laneMoveSourceKey],
  );
""", 1),
    ("""              isLaneMoveSource={
                clipLaneDrag?.ghosts.some((ghost) => ghost.clipId === clip.id && !ghost.blocked) ??
                false
              }""", """              isLaneMoveSource={laneMoveSourceIds.has(clip.id)}""", 1),
    ("""  useArrangementRange,
  useArrangementSelection,
} from '~/contexts/ArrangementContext';""", """  useArrangementLaneDrag,
  useArrangementRange,
  useArrangementSelection,
} from '~/contexts/ArrangementContext';
import { selectLaneDragGhosts, selectLaneMoveSourceKey } from '~/lib/arrangement/lane-drag-store';""", 1),
])
s = (root / LANE).read_text()
if "from 'zustand/react/shallow'" not in s:
    s = s.replace("import {\n", "import { useShallow } from 'zustand/react/shallow';\nimport {\n", 1)
    (root / LANE).write_text(s)

WS = 'app/components/arrangement/StudioWorkspace.tsx'
edit(WS, [
    ("""interface ArrangementSelectedClipReadoutProps {
  clipLaneDrag: ClipLaneDragState | null;
  laneMoveRefusal: string | null;
  arrangement: Arrangement;""", """interface ArrangementSelectedClipReadoutProps {
  arrangement: Arrangement;""", 1),
    ("""function ArrangementSelectedClipReadoutInner({
  clipLaneDrag,
  laneMoveRefusal,
  arrangement,""", """function ArrangementSelectedClipReadoutInner({
  arrangement,""", 1),
    ("""  const primaryClipId = useArrangementSelection((state) => state.selectedClipIds.at(-1) ?? null);
  const selectedClip = useArrangementPreview(""", """  const primaryClipId = useArrangementSelection((state) => state.selectedClipIds.at(-1) ?? null);
  const laneDragActive = useArrangementLaneDrag((state) => state.drag !== null);
  const laneDragTimeLocked = useArrangementLaneDrag((state) => state.drag?.timeLocked ?? false);
  const laneMoveRefusal = useArrangementLaneDrag((state) => selectLaneMoveRefusal(state.drag));
  const selectedClip = useArrangementPreview(""", 1),
    ("""        selectPreviewClip(state.preview, arrangement, clipLaneDrag ? null : primaryClipId),""",
     """        selectPreviewClip(state.preview, arrangement, laneDragActive ? null : primaryClipId),""", 1),
    ("""  return clipLaneDrag ? (
    <p className="min-w-0 flex-1 truncate text-muted" data-testid="arrangement-lane-move-hint">""",
     """  return laneDragActive ? (
    <p className="min-w-0 flex-1 truncate text-muted" data-testid="arrangement-lane-move-hint">""", 1),
    ("""      {clipLaneDrag.timeLocked ? CLIP_LANE_SHIFT_LOCKED_HINT : CLIP_LANE_SHIFT_HINT}""",
     """      {laneDragTimeLocked ? CLIP_LANE_SHIFT_LOCKED_HINT : CLIP_LANE_SHIFT_HINT}""", 1),
    ("""    claimPointerGesture,
    clipLaneDrag,
    isPlaying,""", """    claimPointerGesture,
    isPlaying,""", 1),
    ("""  const laneMoveRefusal =
    clipLaneDrag?.ghosts.find((ghost) => ghost.blocked && ghost.message)?.message ?? null;
""", "", 1),
    ("""          <ArrangementSelectedClipReadout
            clipLaneDrag={clipLaneDrag}
            laneMoveRefusal={laneMoveRefusal}
            arrangement={arrangement}""", """          <ArrangementSelectedClipReadout
            arrangement={arrangement}""", 1),
    ("""import {
  type ClipLaneDragState,
  formatArrangementTime,""", """import {
  formatArrangementTime,""", 1),
    ("""  useArrangementInsertMarkerStore,
  useArrangementPositionStore,""", """  useArrangementInsertMarkerStore,
  useArrangementLaneDrag,
  useArrangementPositionStore,""", 1),
])
s = (root / WS).read_text()
s = s.replace("} from '~/contexts/ArrangementContext';\n",
              "} from '~/contexts/ArrangementContext';\nimport { selectLaneMoveRefusal } from '~/lib/arrangement/lane-drag-store';\n", 1)
(root / WS).write_text(s)

CLIP = 'app/components/arrangement/ArrangementClip.tsx'
edit(CLIP, [
    ("""          gesture.blocked = false;
          gesture.laneRefusal = null;
          previewArrangement(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));""",
     """          gesture.blocked = false;
          gesture.laneRefusal = null;
          if (getArrangement() !== gesture.before) {
            previewGeometry(gesture.before);
          }
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));""", 1),
])

PROBE_TYPE = "ArrangementContextValue & { clipLaneDrag: ClipLaneDragState | null }"
for name in ['drag-preview-render', 'gesture-guard', 'shortcut-sheet-ui', 'track-groups-ui', 'workspace-strings-ui']:
    rel = f'app/lib/arrangement/__tests__/{name}.test.tsx'
    p = root / rel
    s = p.read_text()
    if s.count('  api.current = useArrangement();\n') != 1:
        sys.exit(f'{rel}: probe line not unique')
    s = s.replace('  api.current = useArrangement();\n',
                  '  api.current = { ...useArrangement(), clipLaneDrag: useArrangementLaneDrag((state) => state.drag) };\n')
    s = s.replace('current: ArrangementContextValue | null;', f'current: LaneDragProbeValue | null;', 1)
    s = s.replace('): ArrangementContextValue {\n  if (!api.current)', '): LaneDragProbeValue {\n  if (!api.current)', 1)
    s = s.replace("} from '~/contexts/ArrangementContext';\n",
                  f"}} from '~/contexts/ArrangementContext';\n\ntype LaneDragProbeValue = {PROBE_TYPE};\n", 1)
    if 'useArrangementLaneDrag' not in s.split("from '~/contexts/ArrangementContext'")[0]:
        s = s.replace('  useArrangement,\n', '  useArrangement,\n  useArrangementLaneDrag,\n', 1)
    if 'ClipLaneDragState' not in s.split("from '~/contexts/ArrangementContext'")[0]:
        s = s.replace('  type ArrangementContextValue,\n', '  type ArrangementContextValue,\n  type ClipLaneDragState,\n', 1)
    p.write_text(s)

rel = 'app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx'
p = root / rel
s = p.read_text()
old = "  api.current = { ...useArrangement(), range: useArrangementRange((state) => state.range) };\n"
if s.count(old) != 1:
    sys.exit(f'{rel}: probe line not unique')
s = s.replace('type ArrangementRangeProbeValue = ArrangementContextValue & { range: TimeRange | null };',
              'type ArrangementRangeProbeValue = ArrangementContextValue & {\n  range: TimeRange | null;\n  clipLaneDrag: ClipLaneDragState | null;\n};', 1)
s = s.replace('  useArrangement,\n', '  useArrangement,\n  useArrangementLaneDrag,\n', 1)
s = s.replace('  type ArrangementContextValue,\n', '  type ArrangementContextValue,\n  type ClipLaneDragState,\n', 1)
s = s.replace(old, """  api.current = {
    ...useArrangement(),
    range: useArrangementRange((state) => state.range),
    clipLaneDrag: useArrangementLaneDrag((state) => state.drag),
  };
""")
p.write_text(s)
print('sketch applied')
