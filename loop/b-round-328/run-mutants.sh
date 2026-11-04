#!/usr/bin/env bash
# B328 mutants for round 329. Usage: run-mutants.sh <scratch-with-the-change-applied>. Restores every file after each mutant.
set -u
S="$1"; cd "$S" || exit 2
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
W=app/components/arrangement/StudioWorkspace.tsx
C=app/contexts/ArrangementContext.tsx
run() { timeout 600 npx vitest run "$T" 2>&1 | grep -E "^.*(×|Tests )" | sed 's/\x1b\[[0-9;]*m//g'; }
mut() { # name file python-replace-old python-replace-new
  local name="$1" file="$2"; cp "$file" "$file.orig"
  OLD="$3" NEW="$4" python3 -I -c "
import os,sys
p=sys.argv[1]; s=open(p).read(); o=os.environ['OLD']; n=os.environ['NEW']
c=s.count(o)
if c!=1: print('MUTANT-APPLY-FAIL count',c); sys.exit(3)
open(p,'w').write(s.replace(o,n))" "$file" || { mv "$file.orig" "$file"; echo "== $name: NOT APPLIED"; return; }
  echo "== $name"; run; mv "$file.orig" "$file"
}
mut MU-WORKSPACE-RAW-END "$W" "    Math.ceil(
      Math.max(
        selectPreviewProjectEnd(state.preview, committedProjectEnd) + TIMELINE_TAIL_SECONDS,
        viewportSeconds,
      ),
    )," "    Math.max(
      selectPreviewProjectEnd(state.preview, committedProjectEnd) + TIMELINE_TAIL_SECONDS,
      viewportSeconds,
    ),"
mut MU-WORKSPACE-COMMITTED-END "$W" "        selectPreviewProjectEnd(state.preview, committedProjectEnd) + TIMELINE_TAIL_SECONDS," "        committedProjectEnd + TIMELINE_TAIL_SECONDS + (state.preview ? 0 : 0),"
mut MU-OVERVIEW-COMMITTED-END "$W" "      extent={timelineExtent(projectEnd, arrangement.loop)}" "      extent={timelineExtent(committedProjectEnd + projectEnd * 0, arrangement.loop)}"
mut MU-CLEAR-ANY-PREVIEW "$C" "if (pending && pending.sequence <= adoptedPreviewSequenceRef.current) {" "if (pending) {"
R=app/components/arrangement/ArrangementTransport.tsx
mut MU-TRANSPORT-SUBSCRIBES "$R" "export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {" "export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {
  useArrangementPreview((state) => state.preview);"
echo "== restored"; run
