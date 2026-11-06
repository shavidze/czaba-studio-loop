import sys, pathlib
root = pathlib.Path(sys.argv[1])
p = root / 'app/components/arrangement/ArrangementLibrary.tsx'
s = p.read_text()
def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)
rep("""import {
  formatArrangementTime,
  type SourceLoadState,
  useArrangement,
} from '~/contexts/ArrangementContext';
""", """import {
  type ArrangementContextValue,
  formatArrangementTime,
  type SourceLoadState,
  useArrangement,
} from '~/contexts/ArrangementContext';
""")
rep("""import { ArrangementLibraryPreview } from './ArrangementLibraryPreview';
""", """import {
  ArrangementLibraryPreviewView,
  type LibraryTrackLabel,
  sameLibraryLeafProps,
} from './ArrangementLibraryPreview';
""")
rep("""export function ArrangementLibrary({
  isCollapsed,
  onCollapsedChange,
  asideRef,
  bodyRef,
  bottomInsetPx = 0,
}: ArrangementLibraryProps) {
  const {
    collection,
    sourceStates,
    selectedSourceId,
    libraryPreviewSourceId,
    selectSource,
    addSourceToActiveTrack,
    startLibraryPreview,
    stopLibraryPreview,
    beginLibraryDrag,
    endLibraryDrag,
  } = useArrangement();
""", """export type ArrangementLibraryActions = Pick<
  ArrangementContextValue,
  | 'selectSource'
  | 'addSourceToActiveTrack'
  | 'startLibraryPreview'
  | 'stopLibraryPreview'
  | 'getLibraryPreviewOffset'
  | 'beginLibraryDrag'
  | 'endLibraryDrag'
>;

interface ArrangementLibraryViewProps extends ArrangementLibraryProps {
  collection: ArrangementContextValue['collection'];
  sourceStates: ArrangementContextValue['sourceStates'];
  sourcePeaks: ArrangementContextValue['sourcePeaks'];
  selectedSourceId: string | null;
  libraryPreviewSourceId: string | null;
  tracks: readonly LibraryTrackLabel[];
  actions: ArrangementLibraryActions;
}

export function useArrangementLibraryActions(
  workspace: ArrangementLibraryActions,
): ArrangementLibraryActions {
  const {
    selectSource,
    addSourceToActiveTrack,
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    beginLibraryDrag,
    endLibraryDrag,
  } = workspace;
  return useMemo(
    () => ({
      selectSource,
      addSourceToActiveTrack,
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      beginLibraryDrag,
      endLibraryDrag,
    }),
    [
      selectSource,
      addSourceToActiveTrack,
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      beginLibraryDrag,
      endLibraryDrag,
    ],
  );
}

export function ArrangementLibrary(props: ArrangementLibraryProps) {
  const workspace = useArrangement();
  const actions = useArrangementLibraryActions(workspace);
  return (
    <ArrangementLibraryView
      {...props}
      collection={workspace.collection}
      sourceStates={workspace.sourceStates}
      sourcePeaks={workspace.sourcePeaks}
      selectedSourceId={workspace.selectedSourceId}
      libraryPreviewSourceId={workspace.libraryPreviewSourceId}
      tracks={workspace.arrangement.tracks}
      actions={actions}
    />
  );
}

function ArrangementLibraryViewInner({
  isCollapsed,
  onCollapsedChange,
  asideRef,
  bodyRef,
  bottomInsetPx = 0,
  collection,
  sourceStates,
  sourcePeaks,
  selectedSourceId,
  libraryPreviewSourceId,
  tracks,
  actions,
}: ArrangementLibraryViewProps) {
  const {
    selectSource,
    addSourceToActiveTrack,
    startLibraryPreview,
    stopLibraryPreview,
    beginLibraryDrag,
    endLibraryDrag,
  } = actions;
""")
rep("""          <ArrangementLibraryPreview sourceId={visibleSelectedId} />
""", """          <ArrangementLibraryPreviewView
            sourceId={visibleSelectedId}
            collection={collection}
            sourceStates={sourceStates}
            sourcePeaks={sourcePeaks}
            libraryPreviewSourceId={libraryPreviewSourceId}
            tracks={tracks}
            actions={actions}
          />
""")
assert s.endswith("""    </aside>
  );
}
""")
s += """
export const ArrangementLibraryView = memo(ArrangementLibraryViewInner, sameLibraryLeafProps);
"""
p.write_text(s)

w = root / 'app/components/arrangement/StudioWorkspace.tsx'
t = w.read_text()
def repw(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
imp = [l for l in t.splitlines() if "from './ArrangementLibrary'" in l]
print(imp)
repw("""  const masterActions = useArrangementMasterActions(workspace);
""", """  const masterActions = useArrangementMasterActions(workspace);
  const libraryActions = useArrangementLibraryActions(workspace);
""")
repw("""        <ArrangementLibrary
          isCollapsed={isLibraryCollapsed}
          onCollapsedChange={changeLibraryCollapsed}
          asideRef={libraryAsideRef}
          bodyRef={libraryBodyRef}
          bottomInsetPx={libraryBottomInsetPx}
        />
""", """        <ArrangementLibraryView
          isCollapsed={isLibraryCollapsed}
          onCollapsedChange={changeLibraryCollapsed}
          asideRef={libraryAsideRef}
          bodyRef={libraryBodyRef}
          bottomInsetPx={libraryBottomInsetPx}
          collection={collection}
          sourceStates={workspace.sourceStates}
          sourcePeaks={sourcePeaks}
          selectedSourceId={workspace.selectedSourceId}
          libraryPreviewSourceId={workspace.libraryPreviewSourceId}
          tracks={arrangement.tracks}
          actions={libraryActions}
        />
""")
w.write_text(t)
