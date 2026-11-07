import sys
root=sys.argv[1]
p=root+'/app/components/arrangement/ArrangementMarkerRow.tsx'
s=open(p).read()
def rep(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:80],s.count(old))
    s=s.replace(old,new)
rep("""import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';""","""import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type PointerEvent,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';""")
rep("""import {
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useArrangementIsPlayingReader,""","""import {
  type ArrangementContextValue,
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangementIsPlayingReader,""")
rep("""interface ArrangementMarkerRowProps {
  timelineWidth: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
}
""","""export type ArrangementMarkerRowActions = Pick<
  ArrangementContextValue,
  | 'getArrangement'
  | 'getLocatorPosition'
  | 'previewArrangement'
  | 'commitArrangement'
  | 'seekTo'
  | 'playFrom'
  | 'setStatus'
  | 'getStatusPreviewText'
  | 'getStatus'
  | 'isPointerGestureActive'
  | 'claimPointerGesture'
>;

interface ArrangementMarkerRowViewProps {
  timelineWidth: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
  markers: readonly ArrangementMarker[];
  projectEnd: number;
  actions: ArrangementMarkerRowActions;
  handleRef: Ref<ArrangementMarkerRowHandle>;
}

export function useArrangementMarkerRowActions(
  workspace: ArrangementContextValue,
): ArrangementMarkerRowActions {
  const {
    getArrangement,
    getLocatorPosition,
    previewArrangement,
    commitArrangement,
    seekTo,
    playFrom,
    setStatus,
    getStatusPreviewText,
    getStatus,
    isPointerGestureActive,
    claimPointerGesture,
  } = workspace;
  return useMemo(
    () => ({
      getArrangement,
      getLocatorPosition,
      previewArrangement,
      commitArrangement,
      seekTo,
      playFrom,
      setStatus,
      getStatusPreviewText,
      getStatus,
      isPointerGestureActive,
      claimPointerGesture,
    }),
    [
      getArrangement,
      getLocatorPosition,
      previewArrangement,
      commitArrangement,
      seekTo,
      playFrom,
      setStatus,
      getStatusPreviewText,
      getStatus,
      isPointerGestureActive,
      claimPointerGesture,
    ],
  );
}
""")
rep("""export const ArrangementMarkerRow = forwardRef<
  ArrangementMarkerRowHandle,
  ArrangementMarkerRowProps
>(({ timelineWidth, pxPerSecond, snapSeconds = null, gridSeconds }, ref) => {
  const {
    arrangement,
    projectEnd,
    getArrangement,""","""function ArrangementMarkerRowViewInner({
  timelineWidth,
  pxPerSecond,
  snapSeconds = null,
  gridSeconds,
  markers,
  projectEnd,
  actions,
  handleRef,
}: ArrangementMarkerRowViewProps) {
  const {
    getArrangement,""")
rep("""    claimPointerGesture,
  } = useArrangement();
  const readIsPlaying = useArrangementIsPlayingReader();
  const rangeStore = useArrangementRangeStore();
  const markers = arrangementMarkers(arrangement);
""","""    claimPointerGesture,
  } = actions;
  const readIsPlaying = useArrangementIsPlayingReader();
  const rangeStore = useArrangementRangeStore();
""")
rep("""  useImperativeHandle(
    ref,
    () =>""","""  useImperativeHandle(
    handleRef,
    () =>""")
rep("""});

ArrangementMarkerRow.displayName = 'ArrangementMarkerRow';
""","""}

export const ArrangementMarkerRowView = memo(ArrangementMarkerRowViewInner);
""")
rep("""      if (successor === null || successor.input !== element) {
        return false;
      }
      focusMarkerTarget(successor.markerId);
      return true;""","""      if (successor === null || successor.input !== element) {
        return false;
      }
      focusMarkerTarget(successor.markerId);
      pendingFocusRef.current = null;
      return true;""")
open(p,'w').write(s)

w=root+'/app/components/arrangement/StudioWorkspace.tsx'
s=open(w).read()
rep("import { markerSnapTimes } from '~/lib/arrangement/markers';","import { arrangementMarkers, markerSnapTimes } from '~/lib/arrangement/markers';")
rep("import { ArrangementMarkerRow, type ArrangementMarkerRowHandle } from './ArrangementMarkerRow';",
"""import {
  type ArrangementMarkerRowHandle,
  ArrangementMarkerRowView,
  useArrangementMarkerRowActions,
} from './ArrangementMarkerRow';""")
rep("""  const loopBraceActions = useArrangementLoopBraceActions(workspace);
""","""  const loopBraceActions = useArrangementLoopBraceActions(workspace);
  const markerRowActions = useArrangementMarkerRowActions(workspace);
""")
rep("""                <ArrangementMarkerRow
                  ref={markerRowRef}
                  timelineWidth={timelineWidth}
                  pxPerSecond={pxPerSecond}
                  snapSeconds={activeSnapSeconds}
                  gridSeconds={snapGridSeconds}
                />""","""                <ArrangementMarkerRowView
                  handleRef={markerRowRef}
                  timelineWidth={timelineWidth}
                  pxPerSecond={pxPerSecond}
                  snapSeconds={activeSnapSeconds}
                  gridSeconds={snapGridSeconds}
                  markers={arrangementMarkers(arrangement)}
                  projectEnd={workspace.projectEnd}
                  actions={markerRowActions}
                />""")
open(w,'w').write(s)
print('ok')
