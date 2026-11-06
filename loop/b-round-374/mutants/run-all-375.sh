#!/usr/bin/env bash
# Round 375 mutants (exact old/new strings B ran). TREE=<copy> OUT=<abs dir> bash b-round-374/mutants/run-all-375.sh
# One at a time, never next to a perf run or another vitest job.
set -u
R="$(cd "$(dirname "$0")" && pwd)/run-mutant.sh"
LIB=app/components/arrangement/ArrangementLibrary.tsx
PRE=app/components/arrangement/ArrangementLibraryPreview.tsx
W=app/components/arrangement/StudioWorkspace.tsx
bash "$R" MU-LIB-NO-MEMO "$LIB" 'export const ArrangementLibraryView = memo(ArrangementLibraryViewInner, sameLibraryLeafProps);' 'export const ArrangementLibraryView = ArrangementLibraryViewInner;'
bash "$R" MU-PREVIEW-NO-MEMO "$PRE" 'export const ArrangementLibraryPreviewView = memo(
  ArrangementLibraryPreviewViewInner,
  sameLibraryLeafProps,
);' 'export const ArrangementLibraryPreviewView = ArrangementLibraryPreviewViewInner;'
bash "$R" MU-LEAF-PROPS-DEFAULT-EQUALITY "$LIB" 'export const ArrangementLibraryView = memo(ArrangementLibraryViewInner, sameLibraryLeafProps);' 'export const ArrangementLibraryView = memo(ArrangementLibraryViewInner);'
bash "$R" MU-LIB-ACTIONS-FRESH "$W" '          actions={libraryActions}' '          actions={{ ...libraryActions }}'
bash "$R" MU-TRACK-LABEL-NO-NAME "$PRE" '      track.kind === other.kind &&
      track.name === other.name' '      track.kind === other.kind'
bash "$R" MU-TRACK-LABEL-NO-ID "$PRE" '      track.id === other.id &&
' ''
bash "$R" MU-LEAF-PROPS-NO-EXTRA-KEY "$PRE" '  for (const key in next) {
    if (!(key in previous)) {
      return false;
    }
  }
' ''
bash "$R" MU-LIB-SITE-REVERT "$W" '        <ArrangementLibraryView
          isCollapsed={isLibraryCollapsed}' '        <ArrangementLibrary
          isCollapsed={isLibraryCollapsed}' "$W" "import { ArrangementLibraryView, useArrangementLibraryActions } from './ArrangementLibrary';" "import {
  ArrangementLibrary,
  ArrangementLibraryView,
  useArrangementLibraryActions,
} from './ArrangementLibrary';"
bash "$R" MU-PREVIEW-SITE-REVERT "$LIB" '          <ArrangementLibraryPreviewView
            sourceId={visibleSelectedId}
            collection={collection}
            sourceStates={sourceStates}
            sourcePeaks={sourcePeaks}
            libraryPreviewSourceId={libraryPreviewSourceId}
            tracks={tracks}
            actions={actions}
          />' '          <ArrangementLibraryPreview sourceId={visibleSelectedId} />' "$LIB" '  ArrangementLibraryPreviewView,
  type LibraryTrackLabel,' '  ArrangementLibraryPreview,
  ArrangementLibraryPreviewView,
  type LibraryTrackLabel,'
bash "$R" MU-MASTER-SITE-REVERT "$W" '<ArrangementMasterView master={arrangement.master} actions={masterActions} />' '<ArrangementMaster />' "$W" "import { ArrangementMasterView, useArrangementMasterActions } from './ArrangementMaster';" "import {
  ArrangementMaster,
  ArrangementMasterView,
  useArrangementMasterActions,
} from './ArrangementMaster';"
