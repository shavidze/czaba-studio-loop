# B round 373 -> 374 sketch: PERF-11c-iii-a. ArrangementMaster and ArrangementExportDialog stop rendering
# on workspace commits. Run from the tree root.
p = 'app/components/arrangement/ArrangementMaster.tsx'
s = open(p).read()
o = "import { useCallback, useRef, useSyncExternalStore } from 'react';\nimport {\n  GESTURE_EDIT_BLOCKED_MESSAGE,\n  useArrangement,\n"
assert s.count(o) == 1
s = s.replace(o, "import { memo, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';\nimport {\n  type ArrangementContextValue,\n  GESTURE_EDIT_BLOCKED_MESSAGE,\n  useArrangement,\n")
o = """export function ArrangementMaster() {
  const {
    master,
    toggleMasterMute,
    previewMasterGain,
    commitMasterGain,
    beginMasterGainGesture,
    blurMasterGain,
    isPointerGestureActive,
    resetMasterPeak,
    getArrangement,
    setStatus,
  } = useArrangement();
"""
assert s.count(o) == 1
n = """export type ArrangementMasterActions = Pick<
  ArrangementContextValue,
  | 'toggleMasterMute'
  | 'previewMasterGain'
  | 'commitMasterGain'
  | 'beginMasterGainGesture'
  | 'blurMasterGain'
  | 'isPointerGestureActive'
  | 'resetMasterPeak'
  | 'getArrangement'
  | 'setStatus'
>;

interface ArrangementMasterViewProps {
  master: ArrangementContextValue['master'];
  actions: ArrangementMasterActions;
}

export function useArrangementMasterActions(
  workspace: ArrangementContextValue,
): ArrangementMasterActions {
  const {
    toggleMasterMute,
    previewMasterGain,
    commitMasterGain,
    beginMasterGainGesture,
    blurMasterGain,
    isPointerGestureActive,
    resetMasterPeak,
    getArrangement,
    setStatus,
  } = workspace;
  return useMemo(
    () => ({
      toggleMasterMute,
      previewMasterGain,
      commitMasterGain,
      beginMasterGainGesture,
      blurMasterGain,
      isPointerGestureActive,
      resetMasterPeak,
      getArrangement,
      setStatus,
    }),
    [
      toggleMasterMute,
      previewMasterGain,
      commitMasterGain,
      beginMasterGainGesture,
      blurMasterGain,
      isPointerGestureActive,
      resetMasterPeak,
      getArrangement,
      setStatus,
    ],
  );
}

export function ArrangementMaster() {
  const workspace = useArrangement();
  const actions = useArrangementMasterActions(workspace);
  return <ArrangementMasterView master={workspace.master} actions={actions} />;
}

function ArrangementMasterViewInner({ master, actions }: ArrangementMasterViewProps) {
  const {
    toggleMasterMute,
    previewMasterGain,
    commitMasterGain,
    beginMasterGainGesture,
    blurMasterGain,
    isPointerGestureActive,
    resetMasterPeak,
    getArrangement,
    setStatus,
  } = actions;
"""
s = s.replace(o, n)
s = s.rstrip('\n') + "\n\nexport const ArrangementMasterView = memo(ArrangementMasterViewInner);\n"
open(p, 'w').write(s)

p = 'app/components/arrangement/ArrangementExportDialog.tsx'
s = open(p).read()
o = "export function ArrangementExportDialog({ isOpen, onClose }: ArrangementExportDialogProps) {\n"
assert s.count(o) == 1
s = s.replace(o, """function ArrangementExportDialogShell({ isOpen, onClose }: ArrangementExportDialogProps) {
  return isOpen ? <ArrangementExportDialogContent isOpen onClose={onClose} /> : null;
}

export const ArrangementExportDialog = memo(ArrangementExportDialogShell);

function ArrangementExportDialogContent({ isOpen, onClose }: ArrangementExportDialogProps) {
""")
open(p, 'w').write(s)

p = 'app/components/arrangement/StudioWorkspace.tsx'
s = open(p).read()
o = "      <ArrangementExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />\n"
assert s.count(o) == 1
s = s.replace(o, "      <ArrangementExportDialog isOpen={isExportOpen} onClose={closeExportDialog} />\n")
o = "          <ArrangementMaster />\n"
assert s.count(o) == 1
s = s.replace(o, "          <ArrangementMasterView master={arrangement.master} actions={masterActions} />\n")
o = "  const [isExportOpen, setIsExportOpen] = useState(false);\n"
assert s.count(o) == 1
s = s.replace(o, o + "  const closeExportDialog = useCallback(() => setIsExportOpen(false), []);\n  const masterActions = useArrangementMasterActions(workspace);\n")
open(p, 'w').write(s)
print('ok')

p = 'app/components/arrangement/ArrangementExportDialog.tsx'
s = open(p).read()
o = "import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';\n"
assert s.count(o) == 1
s = s.replace(o, "import { memo, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';\n")
open(p, 'w').write(s)
p = 'app/components/arrangement/StudioWorkspace.tsx'
s = open(p).read()
o = "import { ArrangementMaster } from './ArrangementMaster';\n"
assert s.count(o) == 1, s.count(o)
s = s.replace(o, "import { ArrangementMasterView, useArrangementMasterActions } from './ArrangementMaster';\n")
open(p, 'w').write(s)
print('ok2')
