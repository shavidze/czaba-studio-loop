#!/usr/bin/env bash
# Round 374 mutants (exact old/new strings B ran). TREE=<copy> OUT=<abs dir> bash b-round-373/mutants/run-all-374.sh
set -u
R="$(cd "$(dirname "$0")" && pwd)/run-mutant.sh"
CTX=app/contexts/ArrangementContext.tsx
M=app/components/arrangement/ArrangementMaster.tsx
E=app/components/arrangement/ArrangementExportDialog.tsx
W=app/components/arrangement/StudioWorkspace.tsx
bash "$R" MU-MASTER-NO-MEMO "$M" 'export const ArrangementMasterView = memo(ArrangementMasterViewInner);' 'export const ArrangementMasterView = ArrangementMasterViewInner;'
bash "$R" MU-MASTER-ACTIONS-FRESH "$W" '<ArrangementMasterView master={arrangement.master} actions={masterActions} />' '<ArrangementMasterView master={arrangement.master} actions={{ ...masterActions }} />'
bash "$R" MU-EXPORT-NO-SHELL "$E" 'return isOpen ? <ArrangementExportDialogContent isOpen onClose={onClose} /> : null;' 'return <ArrangementExportDialogContent isOpen={isOpen} onClose={onClose} />;'
bash "$R" MU-EXPORT-INLINE-ONCLOSE "$W" '<ArrangementExportDialog isOpen={isExportOpen} onClose={closeExportDialog} />' '<ArrangementExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />'
bash "$R" MU-HOOK-NAME-RANGE "$CTX" "return useStore(useArrangementRangeStoreContext('useArrangementRange'), selector);" 'return useStore(useArrangementRangeStore(), selector);'
bash "$R" MU-NONREFUSAL-OUTSIDE-GESTURE-ONLY "$CTX" '      if (gestureRefusalPrefix(committed) === null) {' '      if (gestureRefusalPrefix(committed) === null && gestureCountRef.current === 0) {'
