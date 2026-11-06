#!/usr/bin/env bash
# Exact mutants B ran on the sketch (round 373). Usage: TREE=<git work tree copy> OUT=<dir> bash run-all-373.sh
# Each call applies one replacement (exactly one occurrence), runs the covering set, restores the file.
D=$(cd "$(dirname "$0")" && pwd)
S=app/lib/arrangement/status-preview-store.ts; C=app/contexts/ArrangementContext.tsx
R="$D/run-mutant.sh"
echo "== MU-STATUS-ON-VALUE"; bash "$R" MU-STATUS-ON-VALUE $C "  const getStatus = useCallback(
    () => statusPreviewStore.getState().committed.text,
    [statusPreviewStore],
  );" "  const mutantCommitted = useStore(statusPreviewStore, (state) => state.committed);
  const getStatus = useCallback(() => mutantCommitted.text, [mutantCommitted]);"
echo "== MU-ADOPT-KEY-SEQUENCE"; bash "$R" MU-ADOPT-KEY-SEQUENCE $S "      key: statusPreviewKey(pending)," "      key: String(state.committed.sequence + 1),"
echo "== MU-PLAYFROM-ORDER"; bash "$R" MU-PLAYFROM-ORDER $C "      seekTo(target);
      startPlaybackAt(target, 'insert-marker');
      placeInsertMarker(target);" "      placeInsertMarker(target);
      seekTo(target);
      startPlaybackAt(target, 'insert-marker');"
echo "== MU-NO-PREVIEW-CLEAR"; bash "$R" MU-NO-PREVIEW-CLEAR $S "        const preview =
          state.preview && state.preview.sequence <= adopted.adoptedPreviewSequence
            ? null
            : state.preview;" "        const preview = state.preview;"
echo "== MU-GESTURE-FLAG-OFF"; bash "$R" MU-GESTURE-FLAG-OFF $C "store.commitStatus(update, gestureCountRef.current > 0);" "store.commitStatus(update, false);"
echo "== MU-NO-NONREFUSAL-WRITE"; bash "$R" MU-NO-NONREFUSAL-WRITE $C "      if (gestureRefusalPrefix(committed) === null) {
        lastNonRefusalStatusRef.current = committed;
      }" "      void committed;"
