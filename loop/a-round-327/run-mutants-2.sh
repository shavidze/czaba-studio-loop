#!/bin/bash
source <(sed -n '/^mut()/,/^}/p' /home/runner/czaba-project/tmp/studio-real-loop/a-round-327/run-mutants.sh)
SKIPRESET=1; S=/home/runner/a327-scratch
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-327/mutants
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cd $S
mut MU-PREVIEW-KEY-CONST app/lib/arrangement/status-preview-store.ts 'return `preview-${preview.sequence}`;' "return 'preview';"
mut MU-VIDEO-FADE-PREVIEW-STATUS app/components/arrangement/ArrangementClip.tsx "if (previewStatus && !isVideo) {" "if (previewStatus) {"
mut MU-A-STOP-EFFECT-NO-GETTER app/components/arrangement/StudioWorkspace.tsx "const shownStatus = current.getStatusPreviewText() ?? current.status;" "const shownStatus = current.status;"
mut MU-A-MARKER-NO-GETTER app/components/arrangement/ArrangementMarkerRow.tsx "if (options?.keyRepeat !== true || (getStatusPreviewText() ?? status) !== message) {" "if (options?.keyRepeat !== true || status !== message) {"
npx vitest run $T > $OUT/a-restored-2.log 2>&1; echo "restored-2 rc=$?" >> $OUT/mutants-summary.txt
