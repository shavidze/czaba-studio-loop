import sys, pathlib
root = pathlib.Path(sys.argv[1])
p = root / 'app/components/arrangement/ArrangementLibraryPreview.tsx'
s = p.read_text()
def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)
rep("""import {
  formatArrangementTime,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementInsertMarkerStore,
} from '~/contexts/ArrangementContext';
""", """import {
  type ArrangementContextValue,
  formatArrangementTime,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementInsertMarkerStore,
} from '~/contexts/ArrangementContext';
""")
rep("""import { cn } from '~/lib/utils';
""", """import { cn } from '~/lib/utils';
import type { ArrangementTrackKind } from '~/types/arrangement';
""")
rep("""interface ArrangementLibraryPreviewProps {
  sourceId: string | null;
}
""", """interface ArrangementLibraryPreviewProps {
  sourceId: string | null;
}

export interface LibraryTrackLabel {
  readonly id: string;
  readonly kind: ArrangementTrackKind;
  readonly name: string;
}

export type ArrangementLibraryPreviewActions = Pick<
  ArrangementContextValue,
  'startLibraryPreview' | 'stopLibraryPreview' | 'getLibraryPreviewOffset' | 'addSourceToActiveTrack'
>;

interface ArrangementLibraryPreviewViewProps {
  sourceId: string | null;
  collection: ArrangementContextValue['collection'];
  sourceStates: ArrangementContextValue['sourceStates'];
  sourcePeaks: ArrangementContextValue['sourcePeaks'];
  libraryPreviewSourceId: string | null;
  tracks: readonly LibraryTrackLabel[];
  actions: ArrangementLibraryPreviewActions;
}

export function sameLibraryTrackLabels(
  previous: readonly LibraryTrackLabel[],
  next: readonly LibraryTrackLabel[],
): boolean {
  if (previous === next) {
    return true;
  }
  if (previous.length !== next.length) {
    return false;
  }
  return previous.every((track, index) => {
    const other = next.at(index);
    return (
      other !== undefined &&
      track.id === other.id &&
      track.kind === other.kind &&
      track.name === other.name
    );
  });
}

export function sameLibraryLeafProps<Props extends { tracks: readonly LibraryTrackLabel[] }>(
  previous: Props,
  next: Props,
): boolean {
  for (const key in previous) {
    if (key !== 'tracks' && !Object.is(previous[key], next[key])) {
      return false;
    }
  }
  for (const key in next) {
    if (!(key in previous)) {
      return false;
    }
  }
  return sameLibraryTrackLabels(previous.tracks, next.tracks);
}
""")
rep("""export function ArrangementLibraryPreview({ sourceId }: ArrangementLibraryPreviewProps) {
  const {
    collection,
    arrangement,
    sourceStates,
    sourcePeaks,
    libraryPreviewSourceId,
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    addSourceToActiveTrack,
  } = useArrangement();
""", """export function ArrangementLibraryPreview({ sourceId }: ArrangementLibraryPreviewProps) {
  const {
    collection,
    arrangement,
    sourceStates,
    sourcePeaks,
    libraryPreviewSourceId,
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    addSourceToActiveTrack,
  } = useArrangement();
  const actions = useMemo(
    (): ArrangementLibraryPreviewActions => ({
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      addSourceToActiveTrack,
    }),
    [startLibraryPreview, stopLibraryPreview, getLibraryPreviewOffset, addSourceToActiveTrack],
  );
  return (
    <ArrangementLibraryPreviewView
      sourceId={sourceId}
      collection={collection}
      sourceStates={sourceStates}
      sourcePeaks={sourcePeaks}
      libraryPreviewSourceId={libraryPreviewSourceId}
      tracks={arrangement.tracks}
      actions={actions}
    />
  );
}

function ArrangementLibraryPreviewViewInner({
  sourceId,
  collection,
  sourceStates,
  sourcePeaks,
  libraryPreviewSourceId,
  tracks,
  actions,
}: ArrangementLibraryPreviewViewProps) {
  const { startLibraryPreview, stopLibraryPreview, getLibraryPreviewOffset, addSourceToActiveTrack } =
    actions;
""")
rep("""  const activeTrack = arrangement.tracks.find((track) => track.id === activeTrackId);""",
    """  const activeTrack = tracks.find((track) => track.id === activeTrackId);""")
assert s.endswith("""    </section>
  );
}
""")
s += """
export const ArrangementLibraryPreviewView = memo(
  ArrangementLibraryPreviewViewInner,
  sameLibraryLeafProps,
);
"""
p.write_text(s)
print('preview ok')
