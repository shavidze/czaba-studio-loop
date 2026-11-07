import sys
root = sys.argv[1]
p = root + '/app/components/arrangement/ArrangementTransport.tsx'
s = open(p).read()

def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)

rep("import {\n  formatArrangementTime,\n  useArrangement,\n",
    "import {\n  type ArrangementContextValue,\n  formatArrangementTime,\n  useArrangement,\n")
rep("import { type KeyboardEvent, memo, useCallback, useId, useRef } from 'react';",
    "import { type KeyboardEvent, memo, useCallback, useId, useMemo, useRef } from 'react';")

start = s.index('export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {')
head = s[:start]
body = s[start:]

def cut(b, a, z):
    i = b.index(a); j = b.index(z, i)
    return b[i:j]

undo_redo_split_delete = cut(body, '        <button\n          ref={undoButtonRef}', '      </div>\n      <div\n        data-testid="arrangement-transport-centre"')
centre_inner = cut(body, '        <button\n          type="button"\n          onClick={navigation.onToggleFollow}', '      </div>\n      <div\n        data-testid="arrangement-transport-view"')
view_inner = cut(body, '        <label className="flex items-center gap-2 text-xs text-muted">', '      </div>\n    </div>\n  );\n}')

handoff = '''  const focusHandoffRef = useRef<{
    source: HTMLButtonElement;
    partner: HTMLButtonElement | null;
  } | null>(null);

  const armFocusHandoff = (source: HTMLButtonElement, partner: HTMLButtonElement | null) => {
    focusHandoffRef.current = document.activeElement === source ? { source, partner } : null;
  };

  useIsomorphicLayoutEffect(() => {
    const handoff = focusHandoffRef.current;
    focusHandoffRef.current = null;
    if (
      !handoff ||
      !isSoftDisabledButton(handoff.source) ||
      !handoff.partner ||
      isSoftDisabledButton(handoff.partner)
    ) {
      return;
    }
    const activeElement = document.activeElement;
    if (
      activeElement === handoff.source ||
      activeElement === document.body ||
      activeElement === null
    ) {
      handoff.partner.focus();
    }
  });
'''
assert handoff in body

centre_inner = centre_inner.replace('navigation.onToggleFollow', 'onToggleFollow').replace('navigation.followMode', 'followMode')
view_inner = (view_inner.replace('navigation.onZoomSlider', 'onZoomSlider')
    .replace('navigation.onZoomToRange', 'onZoomToRange')
    .replace('navigation.onZoomBack', 'onZoomBack')
    .replace('navigation.canZoomBack', 'canZoomBack')
    .replace('onClick={navigation.onFit}', 'onClick={onFit}'))
assert 'navigation.' not in centre_inner + view_inner

new_body = '''export type ArrangementTransportActions = Pick<
  ArrangementContextValue,
  | 'togglePlayback'
  | 'returnToStart'
  | 'undo'
  | 'redo'
  | 'splitSelection'
  | 'deleteSelection'
  | 'toggleLoopSelection'
>;

export interface ArrangementTransportViewProps {
  onOpenExport: () => void;
  navigation: ArrangementTransportNavigation;
  undoLabel: string | null;
  redoLabel: string | null;
  pxPerSecond: number;
  loop: ArrangementContextValue['arrangement']['loop'];
  committedProjectEnd: number;
  actions: ArrangementTransportActions;
}

export function useArrangementTransportActions(
  workspace: ArrangementContextValue,
): ArrangementTransportActions {
  const {
    togglePlayback,
    returnToStart,
    undo,
    redo,
    splitSelection,
    deleteSelection,
    toggleLoopSelection,
  } = workspace;
  return useMemo(
    () => ({
      togglePlayback,
      returnToStart,
      undo,
      redo,
      splitSelection,
      deleteSelection,
      toggleLoopSelection,
    }),
    [togglePlayback, returnToStart, undo, redo, splitSelection, deleteSelection, toggleLoopSelection],
  );
}

interface ArrangementTransportEditGroupProps {
  undoLabel: string | null;
  redoLabel: string | null;
  undo: () => void;
  redo: () => void;
  splitSelection: () => void;
  deleteSelection: () => void;
}

function ArrangementTransportEditGroupInner({
  undoLabel,
  redoLabel,
  undo,
  redo,
  splitSelection,
  deleteSelection,
}: ArrangementTransportEditGroupProps) {
  const hasRange = useArrangementRange((state) => state.range !== null);
  const hasSelectedClip = useArrangementSelection((state) => state.selectedClipIds.length > 0);
  const isRangeAllTracks = useArrangementRange((state) => state.range?.allTracks === true);
  const rangeDeleteHint = hasRange
    ? isRangeAllTracks
      ? studioEditStrings.deleteRangeAllTracksHint
      : studioEditStrings.deleteRangeHint
    : null;
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const redoButtonRef = useRef<HTMLButtonElement>(null);
''' + handoff + '''
  return (
    <div
      data-testid="arrangement-transport-edit"
      className="flex items-center gap-1.5 justify-self-start [grid-area:edit] min-[1408px]:[grid-area:auto]"
    >
''' + undo_redo_split_delete + '''    </div>
  );
}

const ArrangementTransportEditGroup = memo(ArrangementTransportEditGroupInner);

interface ArrangementTransportCentreGroupProps {
  followMode: TimelineFollowMode;
  onToggleFollow: () => void;
  committedProjectEnd: number;
  loop: ArrangementContextValue['arrangement']['loop'];
  togglePlayback: () => void;
  returnToStart: () => void;
  toggleLoopSelection: () => void;
}

function ArrangementTransportCentreGroupInner({
  followMode,
  onToggleFollow,
  committedProjectEnd,
  loop,
  togglePlayback,
  returnToStart,
  toggleLoopSelection,
}: ArrangementTransportCentreGroupProps) {
  const hasRange = useArrangementRange((state) => state.range !== null);
  return (
    <div
      data-testid="arrangement-transport-centre"
      className="flex items-center gap-1.5 justify-self-center [grid-area:centre] min-[1408px]:[grid-area:auto]"
    >
''' + centre_inner + '''    </div>
  );
}

const ArrangementTransportCentreGroup = memo(ArrangementTransportCentreGroupInner);

interface ArrangementTransportViewGroupProps {
  pxPerSecond: number;
  canZoomBack: boolean;
  onZoomToRange: () => void;
  onZoomBack: () => void;
  onFit: () => void;
  onZoomSlider: (pxPerSecond: number) => void;
  onOpenExport: () => void;
}

function ArrangementTransportViewGroupInner({
  pxPerSecond,
  canZoomBack,
  onZoomToRange,
  onZoomBack,
  onFit,
  onZoomSlider,
  onOpenExport,
}: ArrangementTransportViewGroupProps) {
  const hasRange = useArrangementRange((state) => state.range !== null);
  const fitButtonRef = useRef<HTMLButtonElement>(null);
''' + handoff + '''
  return (
    <div
      data-testid="arrangement-transport-view"
      className="flex items-center gap-1.5 justify-self-end [grid-area:view] min-[1408px]:[grid-area:auto]"
    >
''' + view_inner + '''    </div>
  );
}

const ArrangementTransportViewGroup = memo(ArrangementTransportViewGroupInner);

function ArrangementTransportViewInner({
  onOpenExport,
  navigation,
  undoLabel,
  redoLabel,
  pxPerSecond,
  loop,
  committedProjectEnd,
  actions,
}: ArrangementTransportViewProps) {
  return (
    <div
      data-testid="arrangement-transport"
      className="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-b border-outline bg-surface px-3 py-2 [grid-template-areas:'centre_centre'_'edit_view'] min-[1408px]:grid-cols-[1fr_auto_1fr] min-[1408px]:[grid-template-areas:none]"
    >
      <ArrangementTransportEditGroup
        undoLabel={undoLabel}
        redoLabel={redoLabel}
        undo={actions.undo}
        redo={actions.redo}
        splitSelection={actions.splitSelection}
        deleteSelection={actions.deleteSelection}
      />
      <ArrangementTransportCentreGroup
        followMode={navigation.followMode}
        onToggleFollow={navigation.onToggleFollow}
        committedProjectEnd={committedProjectEnd}
        loop={loop}
        togglePlayback={actions.togglePlayback}
        returnToStart={actions.returnToStart}
        toggleLoopSelection={actions.toggleLoopSelection}
      />
      <ArrangementTransportViewGroup
        pxPerSecond={pxPerSecond}
        canZoomBack={navigation.canZoomBack}
        onZoomToRange={navigation.onZoomToRange}
        onZoomBack={navigation.onZoomBack}
        onFit={navigation.onFit}
        onZoomSlider={navigation.onZoomSlider}
        onOpenExport={onOpenExport}
      />
    </div>
  );
}

export const ArrangementTransportView = memo(ArrangementTransportViewInner);

export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {
  const workspace = useArrangement();
  const actions = useArrangementTransportActions(workspace);
  return (
    <ArrangementTransportView
      onOpenExport={onOpenExport}
      navigation={navigation}
      undoLabel={workspace.undoLabel}
      redoLabel={workspace.redoLabel}
      pxPerSecond={workspace.pxPerSecond}
      loop={workspace.arrangement.loop}
      committedProjectEnd={workspace.projectEnd}
      actions={actions}
    />
  );
}
'''
s = head + new_body
open(p, 'w').write(s)

w = root + '/app/components/arrangement/StudioWorkspace.tsx'
t = open(w).read()
def rw(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
rw("import { ArrangementTransport } from './ArrangementTransport';",
   "import { ArrangementTransportView, useArrangementTransportActions } from './ArrangementTransport';")
rw("  const closeExportDialog = useCallback(() => setIsExportOpen(false), []);\n",
   "  const closeExportDialog = useCallback(() => setIsExportOpen(false), []);\n  const openExportDialog = useCallback(() => setIsExportOpen(true), []);\n")
rw("  const libraryActions = useArrangementLibraryActions(workspace);\n",
   "  const libraryActions = useArrangementLibraryActions(workspace);\n  const transportActions = useArrangementTransportActions(workspace);\n")
rw('''      <ArrangementTransport
        onOpenExport={() => setIsExportOpen(true)}
        navigation={transportNavigation}
      />''', '''      <ArrangementTransportView
        onOpenExport={openExportDialog}
        navigation={transportNavigation}
        undoLabel={workspace.undoLabel}
        redoLabel={workspace.redoLabel}
        pxPerSecond={pxPerSecond}
        loop={arrangement.loop}
        committedProjectEnd={committedProjectEnd}
        actions={transportActions}
      />''')
open(w, 'w').write(t)
print('ok')
