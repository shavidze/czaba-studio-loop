#!/usr/bin/env bash
# B round 375 -> 376 mutants on the sketch v2 (TREE=b-round-375/scratch), one at a time, after the perf run.
cd "$(dirname "$0")"
export TREE=${TREE:-$(cd .. && pwd)/scratch}
T=app/components/arrangement/ArrangementTransport.tsx
W=app/components/arrangement/StudioWorkspace.tsx
R=./run-mutant.sh
$R MU-T-DELETE-NO-ARM $T $'          armFocusHandoff(event.currentTarget, undoButtonRef.current);\n          deleteSelection();' $'          deleteSelection();'
$R MU-T-UNDO-ARM-SELF $T 'armFocusHandoff(event.currentTarget, redoButtonRef.current);' 'armFocusHandoff(event.currentTarget, undoButtonRef.current);'
$R MU-T-HANDOFF-NO-EXPIRY $T $'      expiryFrameRef.current = null;\n      handoffRef.current = null;\n    });' $'      expiryFrameRef.current = null;\n    });'
$R MU-T-ACTIONS-FRESH $T $'      toggleLoopSelection,\n    ],\n  );' $'      toggleLoopSelection,\n      {},\n    ],\n  );'
$R MU-T-EXPORT-INLINE $W 'onOpenExport={openExportDialog}' 'onOpenExport={() => setIsExportOpen(true)}'
$R MU-T-LOOP-CLONE $W 'loop={arrangement.loop}' 'loop={arrangement.loop ? { ...arrangement.loop } : null}'
$R MU-T-VIEW-NO-MEMO $T 'export const ArrangementTransportView = memo(ArrangementTransportViewInner);' 'export const ArrangementTransportView = ArrangementTransportViewInner;'
$R MU-T-EDIT-NO-MEMO $T 'const ArrangementTransportEditGroup = memo(ArrangementTransportEditGroupInner);' 'const ArrangementTransportEditGroup = ArrangementTransportEditGroupInner;'
$R MU-T-SITE-REVERT $W $'      <ArrangementTransportView\n' $'      <ArrangementTransport\n' $W "import { ArrangementTransportView, useArrangementTransportActions } from './ArrangementTransport';" "import { ArrangementTransport, useArrangementTransportActions } from './ArrangementTransport';"
$R MU-T-CANZOOMBACK-TRUE $T 'canZoomBack={navigation.canZoomBack}' 'canZoomBack={true}'
cd "$TREE" && sha256sum -c "$(dirname "$TREE")/sketch-files-sha256.txt" > /dev/null; echo "restore-check rc $?"
