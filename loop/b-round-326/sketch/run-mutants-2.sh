#!/bin/bash
source <(sed -n '/^mut()/,/^}/p' run-mutants.sh)
S=/home/runner/b326-scratch
OUT=/home/runner/czaba-project/tmp/studio-real-loop/b-round-326/sketch
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cd $S
mut MU-PREVIEW-KEY-CONST app/lib/arrangement/status-preview-store.ts 'return `preview-${preview.sequence}`;' "return 'preview';"
mut MU-VIDEO-FADE-PREVIEW-STATUS app/components/arrangement/ArrangementClip.tsx "if (previewStatus && !isVideo) {" "if (previewStatus) {"
